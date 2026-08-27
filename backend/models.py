import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    WORKER = "WORKER"
    MAINTENANCE = "MAINTENANCE"
    OFFICE = "OFFICE"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class MachineStatusEnum(str, enum.Enum):
    OPERATING = "OPERATING"
    WARNING = "WARNING"
    DOWN = "DOWN"
    MAINTENANCE = "MAINTENANCE"

class PriorityEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentStatusEnum(str, enum.Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_PARTS = "WAITING_PARTS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    region = Column(String(50), nullable=False)
    address = Column(String(200), nullable=True)

class Sector(Base):
    __tablename__ = "sectors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    emp_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), default=RoleEnum.WORKER.value, nullable=False)
    department = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    status = Column(String(20), default="ACTIVE")
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    branch = relationship("Branch")
    sector = relationship("Sector")
    reported_incidents = relationship("Incident", foreign_keys="Incident.reported_by_id", back_populates="reporter")
    assigned_incidents = relationship("Incident", foreign_keys="Incident.assigned_to_id", back_populates="assignee")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)

    lines = relationship("Line", back_populates="zone")
    machines = relationship("Machine", back_populates="zone")

class Line(Base):
    __tablename__ = "lines"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"))
    code = Column(String(50), index=True)
    name = Column(String(100), nullable=False)

    zone = relationship("Zone", back_populates="lines")
    machines = relationship("Machine", back_populates="line")

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    machine_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    serial_number = Column(String(100), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    line_id = Column(Integer, ForeignKey("lines.id"), nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    status = Column(String(20), default=MachineStatusEnum.OPERATING.value)
    install_date = Column(String(50), nullable=True)
    specs = Column(Text, nullable=True)
    qr_code_data = Column(String(255), nullable=True)
    grid_x = Column(Integer, default=0)
    grid_y = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    zone = relationship("Zone", back_populates="machines")
    line = relationship("Line", back_populates="machines")
    branch = relationship("Branch")
    incidents = relationship("Incident", back_populates="machine")

class IncidentCategory(Base):
    __tablename__ = "incident_categories"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    default_priority = Column(String(20), default=PriorityEnum.MEDIUM.value)
    estimated_fix_time_mins = Column(Integer, default=30)

    incidents = relationship("Incident", back_populates="category")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(50), unique=True, index=True, nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("incident_categories.id"), nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    priority = Column(String(20), default=PriorityEnum.MEDIUM.value)
    status = Column(String(20), default=IncidentStatusEnum.OPEN.value)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)

    response_time_sec = Column(Integer, default=0)
    resolution_time_sec = Column(Integer, default=0)
    total_downtime_sec = Column(Integer, default=0)

    root_cause = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    spare_parts_used = Column(Text, nullable=True)
    estimated_repair_cost = Column(Float, default=0.0)
    approval_status = Column(String(20), default="APPROVED") # APPROVED or PENDING_APPROVAL

    machine = relationship("Machine", back_populates="incidents")
    reporter = relationship("User", foreign_keys=[reported_by_id], back_populates="reported_incidents")
    assignee = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_incidents")
    category = relationship("IncidentCategory", back_populates="incidents")
    branch = relationship("Branch")
    logs = relationship("MaintenanceLog", back_populates="incident")

class SLAConfig(Base):
    __tablename__ = "sla_configs"

    id = Column(Integer, primary_key=True, index=True)
    priority_level = Column(String(20), unique=True, nullable=False)
    max_response_mins = Column(Integer, nullable=False)
    max_resolution_mins = Column(Integer, nullable=False)
    escalation_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    note = Column(Text, nullable=True)

    incident = relationship("Incident", back_populates="logs")

class SparePart(Base):
    __tablename__ = "spare_parts"

    id = Column(Integer, primary_key=True, index=True)
    part_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    unit = Column(String(20), default="Cái")
    stock_qty = Column(Integer, default=0)
    min_qty = Column(Integer, default=5)
    unit_cost = Column(Float, default=0.0)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    target_entity = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class OfficeDocument(Base):
    __tablename__ = "office_documents"

    id = Column(Integer, primary_key=True, index=True)
    doc_type = Column(String(50), nullable=False) # LEAVE, PROPOSAL, BUSINESS_TRIP
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("User", foreign_keys=[creator_id])
    approver = relationship("User", foreign_keys=[approved_by_id])
    branch = relationship("Branch")
    sector = relationship("Sector")


class SupplyOrder(Base):
    __tablename__ = "supply_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(50), unique=True, index=True, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=True)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED, DELIVERED
    total_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("User", foreign_keys=[creator_id])
    items = relationship("SupplyOrderItem", back_populates="order", cascade="all, delete-orphan")
    branch = relationship("Branch")
    sector = relationship("Sector")


class SupplyOrderItem(Base):
    __tablename__ = "supply_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("supply_orders.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("spare_parts.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_cost = Column(Float, default=0.0)

    order = relationship("SupplyOrder", back_populates="items")
    part = relationship("SparePart")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    location = Column(String(100), default="Văn Phòng Chuỗi SKECHERS")
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=True)
    status = Column(String(20), default="ACTIVE") # ACTIVE, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
    branch = relationship("Branch")
    sector = relationship("Sector")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_name = Column(String(100), nullable=False)
    candidate_email = Column(String(100), nullable=False)
    candidate_phone = Column(String(20), nullable=False)
    cv_url = Column(String(255), nullable=True)
    cover_letter = Column(Text, nullable=True)
    status = Column(String(20), default="SUBMITTED") # SUBMITTED, REVIEWING, ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    job = relationship("Job", back_populates="applications")


# ============================================================
# NEWS & ANNOUNCEMENTS SYSTEM
# ============================================================

class NewsCategory(Base):
    __tablename__ = "news_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Emoji hoặc icon name
    color = Column(String(20), nullable=True)  # Mã màu hex
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    news = relationship("News", back_populates="category")


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=True)  # Mô tả ngắn cho card
    content = Column(Text, nullable=False)  # Nội dung HTML đầy đủ
    category_id = Column(Integer, ForeignKey("news_categories.id"), nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    featured_image = Column(String(500), nullable=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    is_featured = Column(Boolean, default=False)  # Bài nổi bật
    is_published = Column(Boolean, default=True)  # Published/Draft
    view_count = Column(Integer, default=0)
    source_url = Column(String(500), nullable=True)  # Link gốc nếu có
    source_name = Column(String(100), nullable=True)  # Nguồn bài viết
    published_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    category = relationship("NewsCategory", back_populates="news")
    branch = relationship("Branch")
    sector = relationship("Sector")
    author = relationship("User")


# ============================================================
# ROOM BOOKING SYSTEM
# ============================================================

class RoomBooking(Base):
    __tablename__ = "room_bookings"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String(50), nullable=False, index=True)
    room_name = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    booker_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=True)
    booking_date = Column(String(10), nullable=False, index=True)  # DD/MM/YYYY format
    time_slot = Column(String(20), nullable=False)  # "HH:MM - HH:MM" format
    attendees_count = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="PENDING", index=True)  # PENDING, APPROVING, RECEPTIONIST_PROPOSED, CONFIRMED, CANCELLED, COMPLETED
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String(100), nullable=True)  # User ID/name who approved
    cancelled_at = Column(DateTime, nullable=True)
    cancelled_by = Column(String(100), nullable=True)  # User ID/name who cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
