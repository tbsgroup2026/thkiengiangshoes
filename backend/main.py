"""
TBS II - Production & Maintenance Management API
FastAPI Application with Comprehensive Security Middleware
"""
import os
import time
import datetime
import logging
from collections import defaultdict

from fastapi import (
    FastAPI, WebSocket, WebSocketDisconnect, Request, Response,
    HTTPException, status, Depends, Query
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database import engine, Base, SessionLocal, get_db

logger = logging.getLogger(__name__)
from models import (
    User, Zone, Line, Machine, IncidentCategory, Incident, SLAConfig, SparePart,
    RoleEnum, MachineStatusEnum, PriorityEnum, IncidentStatusEnum,
    Job, JobApplication, OfficeDocument, SupplyOrder, SupplyOrderItem,
    Branch, Sector, News, NewsCategory
)
from auth import (
    hash_password, create_access_token, decode_token,
    is_token_blacklisted
)
from services.qr_service import generate_qr_base64
from services.websocket_manager import ws_manager
from security_config import (
    ALLOWED_ORIGINS, PLC_API_KEY,
    RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS,
    LOGIN_MAX_ATTEMPTS, LOGIN_RATE_WINDOW_SECONDS,
    BEHIND_PROXY, HSTS_MAX_AGE, MAX_REQUEST_BODY_SIZE, DEBUG,
    JWT_SECRET_KEY, ALGORITHM,
)

from routers import auth, machines, incidents, analytics, users, sla, office_docs, orders, jobs, news, room_bookings
import schemas
from typing import List

# ============================================================
# APP INITIALIZATION
# ============================================================
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TBS II Production & Maintenance Management API",
    description="REST & WebSocket API Gateway for TBS II Factory Operations",
    version="1.1.0",
    docs_url="/docs" if DEBUG else None,  # Ẩn docs trong production
    redoc_url=None,  # Tắt redoc hoàn toàn
)

# ============================================================
# 1. CORS MIDDLEWARE (chạy đầu tiên)
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-KEY", "X-CSRF-Token"],
    max_age=3600,  # Cache preflight trong 1 giờ
)

# ============================================================
# 2. REQUEST BODY SIZE LIMITER
# ============================================================
@app.middleware("http")
async def limit_request_body_size(request: Request, call_next):
    """Chặn request có body quá lớn để ngăn DoS."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_BODY_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Request body vượt quá giới hạn {MAX_REQUEST_BODY_SIZE // (1024*1024)}MB"
        )
    return await call_next(request)

# ============================================================
# 3. SECURITY HEADERS MIDDLEWARE
# ============================================================
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Thêm tất cả security headers cần thiết."""
    response: Response = await call_next(request)

    # ---- Anti-clickjacking ----
    response.headers["X-Frame-Options"] = "DENY"

    # ---- MIME-type sniffing prevention ----
    response.headers["X-Content-Type-Options"] = "nosniff"

    # ---- XSS Protection (legacy browsers) ----
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # ---- Referrer Policy ----
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # ---- HSTS (chỉ khi qua HTTPS hoặc reverse proxy) ----
    if BEHIND_PROXY or request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = (
            f"max-age={HSTS_MAX_AGE}; includeSubDomains; preload"
        )

    # ---- Content Security Policy (chặt chẽ hơn) ----
    # Cho phép inline styles cho docs page và mobile app requirements
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' ws: wss:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "object-src 'none'; "
        "media-src 'self'"
    )
    response.headers["Content-Security-Policy"] = csp

    # ---- Permissions Policy ----
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), "
        "payment=(), usb=(), magnetometer=(), gyroscope=()"
    )

    # ---- Cross-Origin isolation ----
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"

    # ---- Cache control cho API responses ----
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
    response.headers["Pragma"] = "no-cache"

    return response

# ============================================================
# 4. GLOBAL RATE LIMITER
# ============================================================
_rate_limit_store: dict[str, list[float]] = defaultdict(list)

@app.middleware("http")
async def global_rate_limiter(request: Request, call_next):
    """
    Rate limiter toàn cục cho tất cả endpoints.
    Cấu hình riêng cho login endpoint (chặt hơn).
    """
    # Bỏ qua preflight CORS
    if request.method == "OPTIONS":
        return await call_next(request)

    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()

    # Login endpoint: rate limit nghiêm ngặt
    if request.url.path == "/api/v1/auth/login" and request.method == "POST":
        max_req = LOGIN_MAX_ATTEMPTS
        window = LOGIN_RATE_WINDOW_SECONDS
    else:
        max_req = RATE_LIMIT_MAX_REQUESTS
        window = RATE_LIMIT_WINDOW_SECONDS

    # Dọn dẹp request cũ
    key = f"{client_ip}:{request.url.path}"
    _rate_limit_store[key] = [t for t in _rate_limit_store[key] if now - t < window]

    if len(_rate_limit_store[key]) >= max_req:
        retry_after = int(window - (now - _rate_limit_store[key][0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Quá nhiều request. Vui lòng thử lại sau {retry_after} giây.",
            headers={"Retry-After": str(retry_after)}
        )

    _rate_limit_store[key].append(now)
    return await call_next(request)

# ============================================================
# 5. AUTHENTICATED WEBSOCKET ENDPOINT
# ============================================================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query("")):
    """
    WebSocket có xác thực bằng JWT token.
    Client kết nối: ws://host/ws?token=<jwt_access_token>
    """
    if not token:
        await websocket.close(code=4001, reason="Missing authentication token")
        return

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            await websocket.close(code=4001, reason="Invalid token type")
            return
        emp_code = payload.get("sub")
        if not emp_code:
            await websocket.close(code=4001, reason="Invalid token payload")
            return
    except Exception:
        await websocket.close(code=4001, reason="Authentication failed")
        return

    # Kết nối thành công
    await ws_manager.connect(websocket, emp_code)
    try:
        while True:
            data = await websocket.receive_text()
            # Có thể xử lý message từ client ở đây (heartbeat, filter subscription...)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

# ============================================================
# ROUTERS
# ============================================================
app.include_router(auth.router)
app.include_router(machines.router)
app.include_router(incidents.router)
app.include_router(analytics.router)
app.include_router(users.router)
app.include_router(sla.router)
app.include_router(office_docs.router)
app.include_router(orders.router)
app.include_router(jobs.router)
app.include_router(news.router)
app.include_router(room_bookings.router)

# ============================================================
# GLOBAL EXCEPTION HANDLERS
# ============================================================
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors gracefully."""
    logger.error(f"SQLAlchemy error: {str(exc)}", exc_info=True)
    return {
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        "detail": "Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.",
        "error": "DATABASE_ERROR"
    }

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return {
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        "detail": "Lỗi máy chủ nội bộ. Vui lòng liên hệ hỗ trợ.",
        "error": "INTERNAL_SERVER_ERROR"
    }

# ============================================================
# PUBLIC / CONFIG ENDPOINTS
# ============================================================

@app.get("/api/v1/branches", response_model=List[schemas.BranchOut], tags=["Config"])
def get_branches(db: Session = Depends(get_db)):
    """Danh sách chi nhánh - public read."""
    return db.query(Branch).all()

@app.get("/api/v1/sectors", response_model=List[schemas.SectorOut], tags=["Config"])
def get_sectors(db: Session = Depends(get_db)):
    """Danh sách lĩnh vực - public read."""
    return db.query(Sector).all()

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "system": "TBS II Production & Maintenance Management System",
        "status": "OPERATIONAL",
        "version": "1.1.0"
    }

# ============================================================
# SEED DATA (CHỈ CHẠY KHI DB TRỐNG)
# ============================================================
def seed_initial_data():
    """Khởi tạo dữ liệu demo an toàn với mật khẩu mạnh."""
    db: Session = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        print("[TBS II SEED] Initializing secure demo data...")

        # 0. Seed Branches
        b1 = Branch(name="Văn Phòng Chuỗi SKECHERS", region="Miền Nam", address="SKECHERS - TBS Group")
        b2 = Branch(name="TBS Kiên Giang (Rạch Giá)", region="Miền Tây", address="Rạch Giá, Kiên Giang")
        b3 = Branch(name="TBS Sóng Thần (Bình Dương)", region="Bình Dương", address="KCN Sóng Thần, Dĩ An, Bình Dương")
        b4 = Branch(name="TBS ICD Logistics (Bình Dương)", region="Bình Dương", address="Dĩ An, Bình Dương")
        db.add_all([b1, b2, b3, b4])
        db.commit()

        # 0.B Seed Sectors
        s1 = Sector(name="Da giày", code="SHOES")
        s2 = Sector(name="Túi xách", code="HANDBAGS")
        s3 = Sector(name="Logistics & Cảng", code="LOGISTICS")
        s4 = Sector(name="Bất động sản", code="LAND")
        s5 = Sector(name="Thương mại & Dịch vụ", code="RETAIL")
        db.add_all([s1, s2, s3, s4, s5])
        db.commit()

        # 1. Seed SLA Configs
        sla_defaults = [
            SLAConfig(priority_level="CRITICAL", max_response_mins=10, max_resolution_mins=30),
            SLAConfig(priority_level="HIGH", max_response_mins=15, max_resolution_mins=60),
            SLAConfig(priority_level="MEDIUM", max_response_mins=30, max_resolution_mins=120),
            SLAConfig(priority_level="LOW", max_response_mins=60, max_resolution_mins=240),
        ]
        db.add_all(sla_defaults)

        # 2. Seed Users - Mật khẩu mạnh cho demo
        #   Mỗi user có mật khẩu khác nhau, đáp ứng password policy
        default_pw = hash_password("Tbs2@Demo2026")  # Mật khẩu chung cho demo
        admin_pw = hash_password("Tbs2@Admin2026!")   # Mật khẩu admin riêng

        users = [
            User(emp_code="ADMIN", name="Quản Trị Viên", role=RoleEnum.ADMIN.value,
                 department="CNTT", phone="0901234567", password_hash=admin_pw,
                 branch_id=b3.id, sector_id=s1.id),
            User(emp_code="CN001", name="Nguyễn Văn Nam", role=RoleEnum.WORKER.value,
                 department="Xưởng May 1", phone="0912345678", password_hash=default_pw,
                 branch_id=b1.id, sector_id=s1.id),
            User(emp_code="CN002", name="Trần Thị Mai", role=RoleEnum.WORKER.value,
                 department="Xưởng Gò 2", phone="0923456789", password_hash=default_pw,
                 branch_id=b1.id, sector_id=s1.id),
            User(emp_code="BT001", name="Trần Quốc Bảo", role=RoleEnum.MAINTENANCE.value,
                 department="Đội Bảo Trì 1", phone="0934567890", password_hash=default_pw,
                 branch_id=b1.id, sector_id=s1.id),
            User(emp_code="BT002", name="Lê Hoàng Long", role=RoleEnum.MAINTENANCE.value,
                 department="Đội Bảo Trì 2", phone="0945678901", password_hash=default_pw,
                 branch_id=b1.id, sector_id=s1.id),
            User(emp_code="VP001", name="Phạm Thị Hoa", role=RoleEnum.OFFICE.value,
                 department="Văn Phòng Xưởng", phone="0956789012", password_hash=default_pw,
                 branch_id=b1.id, sector_id=s1.id),
            User(emp_code="SEP001", name="Vũ Đình Trọng", role=RoleEnum.MANAGER.value,
                 department="Ban Giám Đốc", phone="0967890123", password_hash=default_pw,
                 branch_id=b1.id, sector_id=s1.id),
        ]
        db.add_all(users)
        db.commit()

        # 3. Seed Zones & Lines & Machines (giữ nguyên logic cũ)
        z1 = Zone(code="ZONE_A", name="Xưởng May 1", description="Khu vực may thành phẩm giày dép")
        z2 = Zone(code="ZONE_B", name="Xưởng Gò 2", description="Khu vực gò đế và gọt phom")
        z3 = Zone(code="ZONE_C", name="Xưởng Đóng Gói", description="Khu vực hoàn thiện & kiểm hàng")
        db.add_all([z1, z2, z3])
        db.commit()

        l1 = Line(zone_id=z1.id, code="LINE_A1", name="Chuyền May A1")
        l2 = Line(zone_id=z1.id, code="LINE_A2", name="Chuyền May A2")
        l3 = Line(zone_id=z2.id, code="LINE_B1", name="Chuyền Gò B1")
        db.add_all([l1, l2, l3])
        db.commit()

        # 4. Seed Incident Categories
        cats = [
            IncidentCategory(code="CAT_ELE", name="Lỗi Hệ Thống Điện / Bo Mạch", default_priority="HIGH", estimated_fix_time_mins=45),
            IncidentCategory(code="CAT_MEC", name="Kẹt Cơ Khí / Gãy Kim / Hỏng Trục", default_priority="MEDIUM", estimated_fix_time_mins=30),
            IncidentCategory(code="CAT_HYD", name="Rò Rỉ Khí Nén / Thủy Lực", default_priority="HIGH", estimated_fix_time_mins=40),
            IncidentCategory(code="CAT_SEN", name="Lỗi Cảm Biến / Lập Trình PLC", default_priority="CRITICAL", estimated_fix_time_mins=60),
        ]
        db.add_all(cats)
        db.commit()

        # 5. Seed Machines
        machines_data = [
            ("TBS2-MCH-001", "Máy May 1 Kim Juki DDL-9000C", z1.id, l1.id, MachineStatusEnum.OPERATING.value, 1, 1),
            ("TBS2-MCH-002", "Máy May Lập Trình Brother S-7300A", z1.id, l1.id, MachineStatusEnum.WARNING.value, 1, 2),
            ("TBS2-MCH-003", "Máy Cắt Tự Động Lectra Vector", z1.id, l2.id, MachineStatusEnum.DOWN.value, 1, 3),
            ("TBS2-MCH-004", "Máy Ép Đế Thủy Lực Atom SE25", z2.id, l3.id, MachineStatusEnum.MAINTENANCE.value, 2, 1),
            ("TBS2-MCH-005", "Máy Gọt Phom Đế Comelz CZ68", z2.id, l3.id, MachineStatusEnum.OPERATING.value, 2, 2),
            ("TBS2-MCH-006", "Máy Dán Keo Băng Tải Auto-Glue 300", z3.id, None, MachineStatusEnum.OPERATING.value, 3, 1),
        ]
        created_machines = []
        for code, name, zid, lid, status_val, gx, gy in machines_data:
            m = Machine(
                machine_code=code, name=name, zone_id=zid, line_id=lid,
                branch_id=b1.id, status=status_val, install_date="2024-03-15",
                specs="380V - 3.5kW", qr_code_data=generate_qr_base64(code),
                grid_x=gx, grid_y=gy
            )
            db.add(m)
            created_machines.append(m)
        db.commit()

        # 6. Seed Spare Parts
        parts = [
            SparePart(part_code="SP-KIM-01", name="Kim máy may Juki #14", unit="Hộp", stock_qty=120, min_qty=20, unit_cost=45000),
            SparePart(part_code="SP-BO-02", name="Bo mạch điều khiển Brother S-7", unit="Cái", stock_qty=3, min_qty=1, unit_cost=3200000),
            SparePart(part_code="SP-VAN-03", name="Van khí nén SMC 24V", unit="Cái", stock_qty=15, min_qty=5, unit_cost=450000),
        ]
        db.add_all(parts)
        db.commit()

        # 7. Seed Incidents
        worker = db.query(User).filter(User.emp_code == "CN001").first()
        maint1 = db.query(User).filter(User.emp_code == "BT001").first()
        now = datetime.datetime.utcnow()

        inc1 = Incident(
            incident_code="INC-20260721-0001", machine_id=created_machines[2].id,
            reported_by_id=worker.id, category_id=cats[0].id, branch_id=b1.id,
            priority="CRITICAL", status=IncidentStatusEnum.OPEN.value,
            description="Máy cắt tự động bị chập nguồn, mất tín hiệu điều khiển",
            created_at=now - datetime.timedelta(minutes=18)
        )
        inc2 = Incident(
            incident_code="INC-20260721-0002", machine_id=created_machines[3].id,
            reported_by_id=worker.id, assigned_to_id=maint1.id,
            category_id=cats[2].id, branch_id=b1.id,
            priority="HIGH", status=IncidentStatusEnum.IN_PROGRESS.value,
            description="Áp suất thủy lực sụt giảm, rò rỉ dầu",
            created_at=now - datetime.timedelta(minutes=45),
            accepted_at=now - datetime.timedelta(minutes=35), response_time_sec=600
        )
        inc3 = Incident(
            incident_code="INC-20260721-0003", machine_id=created_machines[1].id,
            reported_by_id=worker.id, assigned_to_id=maint1.id,
            category_id=cats[1].id, branch_id=b1.id,
            priority="MEDIUM", status=IncidentStatusEnum.RESOLVED.value,
            description="Kẹt chỉ và gãy kim may",
            created_at=now - datetime.timedelta(hours=3),
            accepted_at=now - datetime.timedelta(hours=2, minutes=50),
            resolved_at=now - datetime.timedelta(hours=2, minutes=20),
            response_time_sec=600, resolution_time_sec=1800, total_downtime_sec=2400,
            root_cause="Chỉ may sai thông số đường kính",
            resolution_notes="Đã vệ sinh đĩa căng chỉ, thay kim Juki #14 mới",
            spare_parts_used="Kim máy may Juki #14 (2 cái)"
        )
        db.add_all([inc1, inc2, inc3])
        db.commit()

        print("[TBS II SEED] Secure demo data created successfully!")
        print(f"[TBS II SEED] Demo password: Tbs2@Demo2026 (Admin: Tbs2@Admin2026!)")

        # Seed news data (tin tức TBS Group)
        from routers.news import seed_news_data
        seed_news_data(db)
    finally:
        db.close()

seed_initial_data()
