"""
TBS II - Recruitment Router
Public: xem job, nộp đơn. Admin: quản lý đơn ứng tuyển.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Job, JobApplication, RoleEnum
from schemas import JobOut, JobCreate, JobApplicationOut, JobApplicationCreate
from auth import get_current_user, require_role, log_audit_event
from validators import (
    validate_email, validate_vn_phone, sanitize_html_input,
    has_script_tag, ValidationError
)

router = APIRouter(prefix="/api/v1/jobs", tags=["Recruitment"])


@router.get("", response_model=list[JobOut])
def get_jobs(
    branch_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Public: Danh sách việc làm đang tuyển."""
    query = db.query(Job).filter(Job.status == "ACTIVE")
    if branch_id:
        query = query.filter(Job.branch_id == branch_id)
    if sector_id:
        query = query.filter(Job.sector_id == sector_id)
    return query.all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Public: Chi tiết việc làm."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy tin tuyển dụng")
    return job


@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_job(req: JobApplicationCreate, db: Session = Depends(get_db)):
    """
    Public: Nộp đơn ứng tuyển.
    Có rate limiting ở global middleware.
    """
    # Validate job
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not job or job.status != "ACTIVE":
        raise HTTPException(status_code=404, detail="Tin tuyển dụng không tồn tại hoặc đã đóng")

    # Validate email
    if not validate_email(req.candidate_email):
        raise HTTPException(status_code=400, detail="Email không hợp lệ")

    # Validate phone
    if not validate_vn_phone(req.candidate_phone):
        raise HTTPException(
            status_code=400,
            detail="Số điện thoại không hợp lệ (10 số Việt Nam)"
        )

    # Chống spam/script injection
    if has_script_tag(req.cover_letter or "") or has_script_tag(req.candidate_name):
        raise HTTPException(status_code=400, detail="Nội dung không hợp lệ")

    # Sanitize
    app = JobApplication(
        job_id=req.job_id,
        candidate_name=sanitize_html_input(req.candidate_name),
        candidate_email=req.candidate_email.strip().lower(),
        candidate_phone=req.candidate_phone.strip(),
        cv_url=sanitize_html_input(req.cv_url or ""),
        cover_letter=sanitize_html_input(req.cover_letter or "")
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    return {"message": "Nộp đơn thành công", "application_id": app.id}


@router.get("/admin/applications", response_model=list[JobApplicationOut])
def get_applications(
    branch_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    current_user=Depends(require_role([RoleEnum.MANAGER, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    """Admin/Manager: Danh sách đơn ứng tuyển."""
    query = db.query(JobApplication).join(Job)
    if branch_id:
        query = query.filter(Job.branch_id == branch_id)
    if sector_id:
        query = query.filter(Job.sector_id == sector_id)
    apps = query.all()

    out = []
    for a in apps:
        job_title = a.job.title if a.job else "Unknown"
        out.append(JobApplicationOut(
            id=a.id, job_id=a.job_id, job_title=job_title,
            candidate_name=a.candidate_name,
            candidate_email=a.candidate_email,
            candidate_phone=a.candidate_phone,
            cv_url=a.cv_url, cover_letter=a.cover_letter,
            status=a.status, created_at=a.created_at
        ))
    return out


@router.post("/admin/applications/{app_id}/status")
def update_application_status(
    app_id: int,
    status_update: dict,
    current_user=Depends(require_role([RoleEnum.MANAGER, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    """Admin/Manager: Cập nhật trạng thái đơn."""
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn ứng tuyển")

    new_status = status_update.get("status")
    valid_statuses = ["SUBMITTED", "REVIEWING", "ACCEPTED", "REJECTED"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Trạng thái không hợp lệ. Chọn: {', '.join(valid_statuses)}"
        )

    old_status = app.status
    app.status = new_status
    db.commit()

    log_audit_event(
        db, current_user.id, "UPDATE_APPLICATION_STATUS", "JobApplication",
        f"Đơn #{app.id} ({app.candidate_name}): {old_status} -> {new_status}"
    )

    return {"message": f"Trạng thái đơn cập nhật thành {new_status}"}
