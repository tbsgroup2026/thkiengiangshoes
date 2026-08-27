from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Token & Auth
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict

class LoginRequest(BaseModel):
    emp_code: str
    password: str

# Branch & Sector Schemas
class BranchOut(BaseModel):
    id: int
    name: str
    region: str
    address: Optional[str] = None
    class Config:
        from_attributes = True

class SectorOut(BaseModel):
    id: int
    name: str
    code: str
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    emp_code: str
    name: str
    role: str
    department: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    branch_id: Optional[int] = None
    sector_id: Optional[int] = None
    branch: Optional[BranchOut] = None
    sector: Optional[SectorOut] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Machine Schemas
class MachineBase(BaseModel):
    machine_code: str
    name: str
    serial_number: Optional[str] = None
    zone_id: Optional[int] = None
    line_id: Optional[int] = None
    branch_id: Optional[int] = None
    status: Optional[str] = "OPERATING"
    install_date: Optional[str] = None
    specs: Optional[str] = None
    grid_x: Optional[int] = 0
    grid_y: Optional[int] = 0

class MachineCreate(MachineBase):
    pass

class MachineOut(MachineBase):
    id: int
    qr_code_data: Optional[str] = None
    zone_name: Optional[str] = None
    line_name: Optional[str] = None
    branch: Optional[BranchOut] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Incident Schemas
class IncidentCreate(BaseModel):
    machine_id: int
    category_id: Optional[int] = None
    priority: Optional[str] = "MEDIUM"
    description: str
    image_url: Optional[str] = None

class IncidentAccept(BaseModel):
    incident_id: int

class IncidentResolve(BaseModel):
    incident_id: int
    root_cause: str
    resolution_notes: str
    spare_parts_used: Optional[str] = ""
    estimated_repair_cost: Optional[float] = 0.0

class IncidentOut(BaseModel):
    id: int
    incident_code: str
    machine_id: int
    machine_code: Optional[str] = None
    machine_name: Optional[str] = None
    reported_by_id: int
    reporter_name: Optional[str] = None
    assigned_to_id: Optional[int] = None
    assignee_name: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    priority: str
    status: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    branch_id: Optional[int] = None
    branch: Optional[BranchOut] = None
    created_at: datetime
    accepted_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    response_time_sec: int
    resolution_time_sec: int
    total_downtime_sec: int
    root_cause: Optional[str] = None
    resolution_notes: Optional[str] = None
    spare_parts_used: Optional[str] = None
    estimated_repair_cost: float
    approval_status: str

    class Config:
        from_attributes = True

# SLA Config Schemas
class SLAConfigBase(BaseModel):
    priority_level: str
    max_response_mins: int
    max_resolution_mins: int
    escalation_user_id: Optional[int] = None

class SLAConfigOut(SLAConfigBase):
    id: int
    class Config:
        from_attributes = True

# Spare Part Schema
class SparePartOut(BaseModel):
    id: int
    part_code: str
    name: str
    unit: str
    stock_qty: int
    min_qty: int
    unit_cost: float
    class Config:
        from_attributes = True


# Office Document Schemas
class OfficeDocumentCreate(BaseModel):
    doc_type: str # LEAVE, PROPOSAL, BUSINESS_TRIP
    title: str
    content: str

class OfficeDocumentApprove(BaseModel):
    status: str # APPROVED or REJECTED

class OfficeDocumentOut(BaseModel):
    id: int
    doc_type: str
    creator_id: int
    creator_name: Optional[str] = None
    branch_id: Optional[int] = None
    sector_id: Optional[int] = None
    branch: Optional[BranchOut] = None
    sector: Optional[SectorOut] = None
    title: str
    content: str
    status: str
    approved_by_id: Optional[int] = None
    approver_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Supply Order Schemas
class SupplyOrderItemCreate(BaseModel):
    part_id: int
    quantity: int

class SupplyOrderItemOut(BaseModel):
    id: int
    part_id: int
    part_code: str
    part_name: str
    quantity: int
    unit_cost: float

    class Config:
        from_attributes = True

class SupplyOrderCreate(BaseModel):
    items: List[SupplyOrderItemCreate]

class SupplyOrderOut(BaseModel):
    id: int
    order_code: str
    creator_id: int
    creator_name: Optional[str] = None
    branch_id: Optional[int] = None
    sector_id: Optional[int] = None
    branch: Optional[BranchOut] = None
    sector: Optional[SectorOut] = None
    status: str
    total_cost: float
    created_at: datetime
    items: List[SupplyOrderItemOut]

    class Config:
        from_attributes = True

# Recruitment Schemas
class JobCreate(BaseModel):
    title: str
    description: str
    requirements: str
    location: Optional[str] = "Văn Phòng Chuỗi SKECHERS"

class JobOut(BaseModel):
    id: int
    title: str
    description: str
    requirements: str
    location: str
    branch_id: Optional[int] = None
    sector_id: Optional[int] = None
    branch: Optional[BranchOut] = None
    sector: Optional[SectorOut] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class JobApplicationCreate(BaseModel):
    job_id: int
    candidate_name: str
    candidate_email: str
    candidate_phone: str
    cover_letter: Optional[str] = None
    cv_url: Optional[str] = None

class JobApplicationOut(BaseModel):
    id: int
    job_id: int
    job_title: Optional[str] = None
    candidate_name: str
    candidate_email: str
    candidate_phone: str
    cv_url: Optional[str] = None
    cover_letter: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# NEWS & ANNOUNCEMENTS SCHEMAS
# ============================================================

class NewsCategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: int
    created_at: datetime
    news_count: Optional[int] = None

    class Config:
        from_attributes = True


class NewsItemOut(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    content: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    category_color: Optional[str] = None
    branch_id: Optional[int] = None
    branch_name: Optional[str] = None
    sector_id: Optional[int] = None
    sector_name: Optional[str] = None
    author_id: Optional[int] = None
    author_name: Optional[str] = None
    featured_image: Optional[str] = None
    tags: Optional[str] = None
    is_featured: bool
    is_published: bool
    view_count: int
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    published_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NewsListOut(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    category_color: Optional[str] = None
    featured_image: Optional[str] = None
    tags: Optional[str] = None
    is_featured: bool
    view_count: int
    source_name: Optional[str] = None
    published_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class NewsCreate(BaseModel):
    title: str
    summary: Optional[str] = None
    content: str
    category_id: Optional[int] = None
    branch_id: Optional[int] = None
    sector_id: Optional[int] = None
    featured_image: Optional[str] = None
    tags: Optional[str] = None
    is_featured: Optional[bool] = False
    is_published: Optional[bool] = True
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    published_at: Optional[datetime] = None


class NewsUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[int] = None
    branch_id: Optional[int] = None
    sector_id: Optional[int] = None
    featured_image: Optional[str] = None
    tags: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    published_at: Optional[datetime] = None
