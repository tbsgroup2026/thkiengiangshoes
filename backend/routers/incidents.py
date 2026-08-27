"""
TBS II - Incident Management Router
Bảo mật: Xác thực cho mọi thao tác, input sanitization, audit log đầy đủ.
"""
import html
import logging
import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database import get_db

logger = logging.getLogger(__name__)
from models import (
    Incident, Machine, User, MaintenanceLog,
    IncidentStatusEnum, MachineStatusEnum, RoleEnum
)
from schemas import IncidentCreate, IncidentResolve, IncidentOut
from auth import get_current_user, require_role, log_audit_event
from validators import sanitize_html_input, has_sql_injection_attempt, sanitize_plain_text
from services.sla_engine import calculate_incident_sla
from services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])


def format_incident_out(inc: Incident) -> IncidentOut:
    """Format incident ra response schema an toàn."""
    out = IncidentOut.from_orm(inc)
    out.machine_code = inc.machine.machine_code if inc.machine else ""
    out.machine_name = inc.machine.name if inc.machine else ""
    out.reporter_name = inc.reporter.name if inc.reporter else ""
    out.assignee_name = inc.assignee.name if inc.assignee else "Chưa phân công"
    out.category_name = inc.category.name if inc.category else "Chưa phân loại"
    return out


@router.get("", response_model=List[IncidentOut])
def get_incidents(
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    machine_id: Optional[int] = None,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # Yêu cầu xác thực
):
    """Danh sách sự cố - yêu cầu đăng nhập."""
    try:
        query = db.query(Incident)
        if status_filter:
            query = query.filter(Incident.status == status_filter)
        if priority:
            query = query.filter(Incident.priority == priority)
        if machine_id:
            query = query.filter(Incident.machine_id == machine_id)
        if branch_id:
            query = query.filter(Incident.branch_id == branch_id)

        incidents = query.order_by(Incident.created_at.desc()).all()
        return [format_incident_out(i) for i in incidents]
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_incidents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tải danh sách sự cố"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_incidents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tải danh sách sự cố"
        )


@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident_by_id(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # Yêu cầu xác thực
):
    """Chi tiết sự cố - yêu cầu đăng nhập."""
    try:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise HTTPException(status_code=404, detail="Không tìm thấy sự cố")
        return format_incident_out(inc)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_incident_by_id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tải chi tiết sự cố"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_incident_by_id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tải chi tiết sự cố"
        )


@router.post("", response_model=IncidentOut)
async def report_incident(
    req: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Báo cáo sự cố mới - yêu cầu đăng nhập."""
    try:
        # Kiểm tra máy tồn tại
        machine = db.query(Machine).filter(Machine.id == req.machine_id).first()
        if not machine:
            raise HTTPException(status_code=404, detail="Không tìm thấy máy sản xuất")

        # Sanitize input chống XSS
        sanitized_desc = sanitize_html_input(req.description)

        # Kiểm tra SQL injection attempt
        if has_sql_injection_attempt(req.description):
            raise HTTPException(
                status_code=400,
                detail="Mô tả chứa nội dung không hợp lệ"
            )

        # Validate priority
        valid_priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        priority = req.priority if req.priority in valid_priorities else "MEDIUM"

        # Tạo incident code
        today_str = datetime.datetime.utcnow().strftime('%Y%m%d')
        code_seq = db.query(Incident).filter(
            Incident.incident_code.like(f"INC-{today_str}-%")
        ).count() + 1
        incident_code = f"INC-{today_str}-{code_seq:04d}"

        # Cập nhật trạng thái máy
        machine.status = MachineStatusEnum.DOWN.value

        new_inc = Incident(
            incident_code=incident_code,
            machine_id=req.machine_id,
            reported_by_id=current_user.id,
            category_id=req.category_id,
            branch_id=machine.branch_id,
            priority=priority,
            status=IncidentStatusEnum.OPEN.value,
            description=sanitized_desc,
            image_url=req.image_url,
            created_at=datetime.datetime.utcnow()
        )
        db.add(new_inc)
        db.commit()
        db.refresh(new_inc)

        # Maintenance log
        log = MaintenanceLog(
            incident_id=new_inc.id,
            user_id=current_user.id,
            action="REPORTED",
            note=f"Công nhân {current_user.name} báo hỏng máy {machine.machine_code}"
        )
        db.add(log)
        db.commit()

        # Audit log
        log_audit_event(
            db, current_user.id, "REPORT_INCIDENT", "Incident",
            f"Tạo sự cố {incident_code} cho máy {machine.machine_code}"
        )

        out = format_incident_out(new_inc)

        # Real-time broadcast
        await ws_manager.broadcast({
            "event": "INCIDENT_REPORTED",
            "incident": out.dict()
        })

        return out
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in report_incident: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tạo sự cố"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error in report_incident: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tạo sự cố"
        )


@router.post("/{incident_id}/accept")
async def accept_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Nhận xử lý sự cố."""
    try:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise HTTPException(status_code=404, detail="Không tìm thấy sự cố")

        if inc.status not in [IncidentStatusEnum.OPEN.value, IncidentStatusEnum.ASSIGNED.value]:
            raise HTTPException(status_code=400, detail="Sự cố đã được tiếp nhận hoặc xử lý trước đó")

        inc.assigned_to_id = current_user.id
        inc.status = IncidentStatusEnum.IN_PROGRESS.value
        inc.accepted_at = datetime.datetime.utcnow()

        if inc.machine:
            inc.machine.status = MachineStatusEnum.MAINTENANCE.value

        calculate_incident_sla(inc, db)
        db.commit()

        log_audit_event(
            db, current_user.id, "ACCEPT_INCIDENT", "Incident",
            f"Nhân viên {current_user.emp_code} nhận sự cố {inc.incident_code}"
        )

        out = format_incident_out(inc)

        await ws_manager.broadcast({
            "event": "INCIDENT_ACCEPTED",
            "incident": out.dict()
        })

        return out
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in accept_incident: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tiếp nhận sự cố"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error in accept_incident: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tiếp nhận sự cố"
        )


@router.post("/{incident_id}/resolve")
async def resolve_incident(
    incident_id: int,
    req: IncidentResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Hoàn thành sự cố - với input sanitization."""
    try:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise HTTPException(status_code=404, detail="Không tìm thấy sự cố")

        # Sanitize tất cả input text
        sanitized_cause = sanitize_plain_text(req.root_cause, max_length=2000)
        sanitized_notes = sanitize_plain_text(req.resolution_notes, max_length=2000)
        sanitized_parts = sanitize_plain_text(req.spare_parts_used or "", max_length=1000)

        inc.status = IncidentStatusEnum.RESOLVED.value
        inc.resolved_at = datetime.datetime.utcnow()
        inc.root_cause = sanitized_cause
        inc.resolution_notes = sanitized_notes
        inc.spare_parts_used = sanitized_parts
        inc.estimated_repair_cost = req.estimated_repair_cost or 0.0

        if inc.machine:
            inc.machine.status = MachineStatusEnum.OPERATING.value

        calculate_incident_sla(inc, db)
        db.commit()

        log_audit_event(
            db, current_user.id, "RESOLVE_INCIDENT", "Incident",
            f"Hoàn thành sự cố {inc.incident_code}. Nguyên nhân: {sanitized_cause[:100]}"
        )

        out = format_incident_out(inc)

        await ws_manager.broadcast({
            "event": "INCIDENT_RESOLVED",
            "incident": out.dict()
        })

        return out
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in resolve_incident: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi hoàn thành sự cố"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error in resolve_incident: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi hoàn thành sự cố"
        )
