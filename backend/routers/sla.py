"""
TBS II - SLA Configuration Router
Quản lý cấu hình SLA - ADMIN/OFFICE only.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import SLAConfig, RoleEnum
from schemas import SLAConfigBase, SLAConfigOut
from auth import require_role, log_audit_event

router = APIRouter(prefix="/api/v1/sla-config", tags=["SLA Configuration"])


@router.get("", response_model=List[SLAConfigOut])
def get_sla_configs(
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN, RoleEnum.OFFICE, RoleEnum.MANAGER]))
):
    """Danh sách cấu hình SLA - yêu cầu quyền ADMIN/OFFICE/MANAGER."""
    return db.query(SLAConfig).all()


@router.put("/{priority_level}")
def update_sla_config(
    priority_level: str,
    req: SLAConfigBase,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN, RoleEnum.OFFICE]))
):
    """Cập nhật cấu hình SLA - ADMIN/OFFICE."""
    valid_priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    if priority_level not in valid_priorities:
        raise HTTPException(
            status_code=400,
            detail=f"Priority không hợp lệ. Chọn: {', '.join(valid_priorities)}"
        )

    # Validate thời gian hợp lý
    if req.max_response_mins <= 0 or req.max_resolution_mins <= 0:
        raise HTTPException(status_code=400, detail="Thời gian SLA phải > 0 phút")
    if req.max_response_mins > req.max_resolution_mins:
        raise HTTPException(
            status_code=400,
            detail="Thời gian phản hồi không được vượt quá thời gian giải quyết"
        )

    config = db.query(SLAConfig).filter(SLAConfig.priority_level == priority_level).first()
    if not config:
        config = SLAConfig(priority_level=priority_level)
        db.add(config)

    old_response = config.max_response_mins
    old_resolution = config.max_resolution_mins

    config.max_response_mins = req.max_response_mins
    config.max_resolution_mins = req.max_resolution_mins
    config.escalation_user_id = req.escalation_user_id
    db.commit()

    log_audit_event(
        db, current_user.id, "UPDATE_SLA_CONFIG", "SLAConfig",
        f"Cập nhật SLA {priority_level}: response {old_response}->{req.max_response_mins}ph, "
        f"resolution {old_resolution}->{req.max_resolution_mins}ph"
    )

    return {"message": "Cập nhật cấu hình SLA thành công"}
