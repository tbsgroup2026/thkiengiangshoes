"""
TBS II - Office Documents Router
Quản lý đơn từ nội bộ (nghỉ phép, đề xuất, công tác).
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import OfficeDocument, User, RoleEnum
from schemas import OfficeDocumentCreate, OfficeDocumentOut, OfficeDocumentApprove
from auth import get_current_user, require_role, log_audit_event
from validators import sanitize_html_input, has_script_tag

router = APIRouter(prefix="/api/v1/office-docs", tags=["Office Documents"])


@router.get("", response_model=list[OfficeDocumentOut])
def get_documents(
    branch_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Danh sách đơn từ. User thường chỉ thấy đơn của mình."""
    query = db.query(OfficeDocument)
    if current_user.role not in [RoleEnum.MANAGER.value, RoleEnum.ADMIN.value]:
        query = query.filter(OfficeDocument.creator_id == current_user.id)

    if branch_id:
        query = query.filter(OfficeDocument.branch_id == branch_id)
    if sector_id:
        query = query.filter(OfficeDocument.sector_id == sector_id)

    docs = query.all()

    out = []
    for d in docs:
        creator_name = d.creator.name if d.creator else "Unknown"
        approver_name = d.approver.name if d.approver else None
        out.append(OfficeDocumentOut(
            id=d.id, doc_type=d.doc_type, creator_id=d.creator_id,
            creator_name=creator_name, branch_id=d.branch_id,
            sector_id=d.sector_id, branch=d.branch, sector=d.sector,
            title=d.title, content=d.content, status=d.status,
            approved_by_id=d.approved_by_id, approver_name=approver_name,
            created_at=d.created_at, updated_at=d.updated_at
        ))
    return out


@router.post("", response_model=OfficeDocumentOut)
def create_document(
    req: OfficeDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo đơn từ mới."""
    valid_types = ["LEAVE", "PROPOSAL", "BUSINESS_TRIP"]
    if req.doc_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Loại đơn không hợp lệ. Chọn: {', '.join(valid_types)}"
        )

    # Anti-XSS: sanitize input
    if has_script_tag(req.title) or has_script_tag(req.content):
        raise HTTPException(status_code=400, detail="Nội dung chứa mã không hợp lệ")

    doc = OfficeDocument(
        doc_type=req.doc_type,
        creator_id=current_user.id,
        branch_id=current_user.branch_id,
        sector_id=current_user.sector_id,
        title=sanitize_html_input(req.title),
        content=sanitize_html_input(req.content),
        status="PENDING"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    log_audit_event(
        db, current_user.id, "CREATE_DOCUMENT", "OfficeDocument",
        f"Tạo {req.doc_type}: {doc.title}"
    )

    return OfficeDocumentOut(
        id=doc.id, doc_type=doc.doc_type, creator_id=doc.creator_id,
        creator_name=current_user.name, branch_id=doc.branch_id,
        sector_id=doc.sector_id, branch=doc.branch, sector=doc.sector,
        title=doc.title, content=doc.content, status=doc.status,
        approved_by_id=None, approver_name=None,
        created_at=doc.created_at, updated_at=doc.updated_at
    )


@router.get("/{doc_id}", response_model=OfficeDocumentOut)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chi tiết đơn từ."""
    doc = db.query(OfficeDocument).filter(OfficeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn từ")

    # Permission check
    if (current_user.role not in [RoleEnum.MANAGER.value, RoleEnum.ADMIN.value]
            and doc.creator_id != current_user.id):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem đơn này")

    creator_name = doc.creator.name if doc.creator else "Unknown"
    approver_name = doc.approver.name if doc.approver else None

    return OfficeDocumentOut(
        id=doc.id, doc_type=doc.doc_type, creator_id=doc.creator_id,
        creator_name=creator_name, branch_id=doc.branch_id,
        sector_id=doc.sector_id, branch=doc.branch, sector=doc.sector,
        title=doc.title, content=doc.content, status=doc.status,
        approved_by_id=doc.approved_by_id, approver_name=approver_name,
        created_at=doc.created_at, updated_at=doc.updated_at
    )


@router.post("/{doc_id}/approve")
def approve_document(
    doc_id: int,
    approval: OfficeDocumentApprove,
    current_user: User = Depends(require_role([RoleEnum.MANAGER, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    """Phê duyệt hoặc từ chối đơn từ."""
    doc = db.query(OfficeDocument).filter(OfficeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn từ")

    if approval.status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Trạng thái phải là APPROVED hoặc REJECTED")

    old_status = doc.status
    doc.status = approval.status
    doc.approved_by_id = current_user.id
    db.commit()

    log_audit_event(
        db, current_user.id, "APPROVE_DOCUMENT", "OfficeDocument",
        f"Phê duyệt đơn #{doc.id} ({doc.doc_type}): {old_status} -> {approval.status}"
    )

    return {"message": f"Đơn từ đã được {approval.status}", "doc_id": doc.id}
