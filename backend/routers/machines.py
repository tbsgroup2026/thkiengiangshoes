"""
TBS II - Machine Management Router
Có xác thực cho mọi thao tác ghi, hỗ trợ PLC API Key + JWT.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database import get_db

logger = logging.getLogger(__name__)
from models import Machine, Zone, Line, RoleEnum
from schemas import MachineCreate, MachineOut
from auth import (
    get_current_user, require_role, log_audit_event,
    get_current_user_optional, get_client_ip, decode_token,
)
from security_config import PLC_API_KEY
from validators import sanitize_html_input
from services.qr_service import generate_qr_base64
from services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/v1/machines", tags=["Machines"])


# ============================================================
# HELPER: Xác thực request từ PLC hoặc người dùng
# ============================================================
def authenticate_plc_or_user(
    request: Request,
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Xác thực bằng PLC API Key HOẶC JWT token.
    - Nếu có X-API-KEY hợp lệ -> yêu cầu từ PLC/SCADA
    - Nếu không -> phải có JWT token hợp lệ
    """
    if x_api_key:
        # Xác thực bằng API Key
        if x_api_key != PLC_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="X-API-KEY không hợp lệ"
            )
        return None  # PLC không có user

    # Xác thực bằng JWT
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu xác thực (Bearer token hoặc X-API-KEY)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        token = auth_header[7:]
        payload = decode_token(token)
        emp_code = payload.get("sub")
        if not emp_code:
            raise HTTPException(status_code=401)
        user = db.query(Machine).first()  # Placeholder, sẽ dùng get_current_user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ",
        )

    # Sử dụng get_current_user để lấy user đầy đủ
    from fastapi import Depends
    # Fallback: trả về user thông qua dependency injection


# ============================================================
# ENDPOINTS
# ============================================================

@router.get("", response_model=List[MachineOut])
def get_machines(
    zone_id: Optional[int] = None,
    line_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Danh sách máy - public read với filter."""
    try:
        query = db.query(Machine)
        if zone_id:
            query = query.filter(Machine.zone_id == zone_id)
        if line_id:
            query = query.filter(Machine.line_id == line_id)
        if status_filter:
            query = query.filter(Machine.status == status_filter)
        if branch_id:
            query = query.filter(Machine.branch_id == branch_id)

        machines = query.all()
        result = []
        for m in machines:
            out = MachineOut.from_orm(m)
            out.zone_name = m.zone.name if m.zone else "Chưa phân zone"
            out.line_name = m.line.name if m.line else "Chưa phân chuyền"
            if not m.qr_code_data:
                m.qr_code_data = generate_qr_base64(m.machine_code)
                db.commit()
            out.qr_code_data = m.qr_code_data
            result.append(out)
        return result
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_machines: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tải danh sách máy"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_machines: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tải danh sách máy"
        )


@router.get("/{machine_id_or_code}", response_model=MachineOut)
def get_machine_by_id_or_code(machine_id_or_code: str, db: Session = Depends(get_db)):
    """Chi tiết máy - public read."""
    try:
        if machine_id_or_code.isdigit():
            machine = db.query(Machine).filter(Machine.id == int(machine_id_or_code)).first()
        else:
            machine = db.query(Machine).filter(Machine.machine_code == machine_id_or_code).first()

        if not machine:
            raise HTTPException(status_code=404, detail="Không tìm thấy máy sản xuất")

        out = MachineOut.from_orm(machine)
        out.zone_name = machine.zone.name if machine.zone else "Chưa phân zone"
        out.line_name = machine.line.name if machine.line else "Chưa phân chuyền"
        if not machine.qr_code_data:
            machine.qr_code_data = generate_qr_base64(machine.machine_code)
            db.commit()
        out.qr_code_data = machine.qr_code_data
        return out
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_machine_by_id_or_code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tải chi tiết máy"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_machine_by_id_or_code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tải chi tiết máy"
        )


@router.post("", response_model=MachineOut)
def create_machine(
    req: MachineCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN, RoleEnum.OFFICE]))
):
    """Tạo máy mới - yêu cầu quyền ADMIN hoặc OFFICE."""
    existing = db.query(Machine).filter(Machine.machine_code == req.machine_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mã máy đã tồn tại")

    # Sanitize inputs
    sanitized_name = sanitize_html_input(req.name)
    sanitized_specs = sanitize_html_input(req.specs or "")

    machine = Machine(**req.dict())
    machine.name = sanitized_name
    machine.specs = sanitized_specs
    machine.qr_code_data = generate_qr_base64(req.machine_code)
    db.add(machine)
    db.commit()
    db.refresh(machine)

    log_audit_event(
        db, current_user.id, "CREATE_MACHINE", "Machine",
        f"Thêm máy mới {machine.machine_code} ({sanitized_name})"
    )

    out = MachineOut.from_orm(machine)
    out.zone_name = machine.zone.name if machine.zone else ""
    out.line_name = machine.line.name if machine.line else ""
    return out


@router.put("/{machine_id}/status")
async def update_machine_status(
    machine_id: int,
    status_str: str,
    request: Request,
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Cập nhật trạng thái máy.
    YÊU CẦU XÁC THỰC: X-API-KEY (PLC) HOẶC JWT Bearer token.

    Trước đây: nếu không có header thì vẫn cho phép -> ĐÃ SỬA.
    """
    # ---- Xác thực bắt buộc ----
    if x_api_key:
        if x_api_key != PLC_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="X-API-KEY không hợp lệ"
            )
        auth_source = "PLC"
        user_id = None
    else:
        # Yêu cầu JWT token - sử dụng dependency injection thủ công
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Yêu cầu xác thực. Gửi X-API-KEY hoặc Bearer token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
            token = auth_header[7:]
            payload = decode_token(token)
            if payload.get("type") != "access":
                raise HTTPException(status_code=401, detail="Token không phải access token")
            emp_code = payload.get("sub")
            if not emp_code:
                raise HTTPException(status_code=401)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không hợp lệ hoặc đã hết hạn"
            )

        from models import User as UserModel
        user = db.query(UserModel).filter(
            UserModel.emp_code == emp_code,
            UserModel.status == "ACTIVE"
        ).first()
        if not user:
            raise HTTPException(status_code=401, detail="Người dùng không tồn tại")
        auth_source = f"User:{emp_code}"
        user_id = user.id

    # ---- Thực hiện cập nhật ----
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Không tìm thấy máy")

    # Validate status
    valid_statuses = ["OPERATING", "WARNING", "DOWN", "MAINTENANCE"]
    if status_str not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Trạng thái không hợp lệ. Chọn: {', '.join(valid_statuses)}"
        )

    old_status = machine.status
    machine.status = status_str
    db.commit()

    # Audit log
    log_audit_event(
        db, user_id, "UPDATE_MACHINE_STATUS", "Machine",
        f"[{auth_source}] Cập nhật {machine.machine_code}: {old_status} -> {status_str}",
        ip=get_client_ip(request)
    )

    # Broadcast real-time
    await ws_manager.broadcast({
        "event": "MACHINE_STATUS_CHANGED",
        "machine_id": machine.id,
        "machine_code": machine.machine_code,
        "old_status": old_status,
        "new_status": status_str
    })

    return {
        "message": "Cập nhật trạng thái máy thành công",
        "machine_id": machine.id,
        "new_status": status_str
    }
