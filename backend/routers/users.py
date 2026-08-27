"""
TBS II - User Management Router
Quản lý người dùng với validation và audit log.
"""
from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database import get_db
from models import User, RoleEnum
from schemas import UserCreate, UserOut
from auth import hash_password, require_role, log_audit_event
from validators import validate_emp_code, validate_vn_phone, sanitize_html_input
from security_config import validate_password_policy

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("", response_model=List[UserOut])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN, RoleEnum.OFFICE]))
):
    """Danh sách người dùng - ADMIN/OFFICE."""
    try:
        users = db.query(User).all()
        return users
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tải danh sách người dùng"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tải danh sách người dùng"
        )


@router.post("", response_model=UserOut)
def create_user(
    req: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN]))
):
    """
    Tạo người dùng mới - chỉ ADMIN.
    Có validation mã NV, phone, password policy.
    """
    try:
        # Validate emp_code
        if not validate_emp_code(req.emp_code):
            raise HTTPException(
                status_code=400,
                detail="Mã nhân viên không hợp lệ (2-20 ký tự, chữ/số/gạch)"
            )

        # Check trùng
        existing = db.query(User).filter(User.emp_code == req.emp_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Mã nhân viên đã tồn tại")

        # Validate phone nếu có
        if req.phone and not validate_vn_phone(req.phone):
            raise HTTPException(
                status_code=400,
                detail="Số điện thoại không hợp lệ (10 số, bắt đầu 03x/05x/07x/08x/09x)"
            )

        # Validate role
        valid_roles = [r.value for r in RoleEnum]
        if req.role not in valid_roles:
            raise HTTPException(
                status_code=400,
                detail=f"Vai trò không hợp lệ. Chọn: {', '.join(valid_roles)}"
            )

        # Validate password policy
        is_valid_pw, pw_error = validate_password_policy(req.password)
        if not is_valid_pw:
            raise HTTPException(status_code=400, detail=pw_error)

        # Sanitize name
        sanitized_name = sanitize_html_input(req.name)

        user = User(
            emp_code=req.emp_code,
            name=sanitized_name,
            role=req.role,
            department=sanitize_html_input(req.department or ""),
            phone=req.phone,
            password_hash=hash_password(req.password),
            status="ACTIVE"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        log_audit_event(
            db, current_user.id, "CREATE_USER", "User",
            f"Admin {current_user.emp_code} tạo user {user.emp_code} với role {user.role}"
        )

        return user
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error in create_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi cơ sở dữ liệu khi tạo người dùng"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error in create_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi không xác định khi tạo người dùng"
        )
