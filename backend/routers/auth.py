"""
TBS II - Authentication Router
Đăng nhập, refresh token, đổi mật khẩu, đăng xuất.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LoginRequest, Token, UserOut
from auth import (
    verify_password, create_access_token, create_refresh_token,
    get_current_user, get_client_ip, log_audit_event,
    record_failed_login, clear_failed_logins, is_account_locked,
    hash_password, decode_token, blacklist_token,
)
from security_config import validate_password_policy

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Đăng nhập - tạo access token + refresh token."""
    client_ip = get_client_ip(request)

    # 1. Tìm user
    user = db.query(User).filter(User.emp_code == req.emp_code).first()

    # 2. Kiểm tra account lockout TRƯỚC KHI verify password (tránh timing attack)
    if user:
        locked, remaining = is_account_locked(user.emp_code)
        if locked:
            log_audit_event(
                db, user.id, "LOGIN_BLOCKED", "User",
                f"Tài khoản bị khóa, từ chối đăng nhập từ IP {client_ip}",
                ip=client_ip, severity="WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Tài khoản tạm khóa. Vui lòng thử lại sau {remaining} giây."
            )

    # 3. Verify password
    if not user:
        # Tránh user enumeration: trả về cùng message lỗi
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã nhân viên hoặc mật khẩu không đúng"
        )

    is_valid, needs_upgrade = verify_password(req.password, user.password_hash)

    if not is_valid:
        # Ghi nhận failed login
        just_locked = record_failed_login(user.emp_code)
        log_audit_event(
            db, user.id, "LOGIN_FAILED", "User",
            f"Đăng nhập thất bại từ IP {client_ip}" +
            (" - TÀI KHOẢN VỪA BỊ KHÓA" if just_locked else ""),
            ip=client_ip, severity="WARNING" if just_locked else "INFO"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã nhân viên hoặc mật khẩu không đúng"
        )

    # 4. Kiểm tra tài khoản active
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa. Liên hệ quản trị viên."
        )

    # 5. Đăng nhập thành công - xóa lịch sử thất bại
    clear_failed_logins(user.emp_code)

    # 6. Tạo tokens
    token_data = {"sub": user.emp_code, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token, refresh_jti = create_refresh_token(token_data)

    # 7. Nâng cấp hash nếu cần
    if needs_upgrade:
        user.password_hash = hash_password(req.password)
        db.commit()
        log_audit_event(
            db, user.id, "PASSWORD_UPGRADED", "User",
            f"Nâng cấp hash mật khẩu từ legacy/PBKDF2 cũ lên PBKDF2-SHA256:{200000}",
            ip=client_ip
        )

    # 8. Audit log
    log_audit_event(
        db, user.id, "LOGIN_SUCCESS", "User",
        f"Đăng nhập thành công từ IP {client_ip}",
        ip=client_ip
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "emp_code": user.emp_code,
            "name": user.name,
            "role": user.role,
            "department": user.department,
            "branch_id": user.branch_id,
        }
    }


@router.post("/refresh", response_model=Token)
def refresh_access_token(refresh_token_str: str, db: Session = Depends(get_db)):
    """
    Làm mới access token bằng refresh token.
    Refresh token cũ sẽ bị blacklist.
    """
    try:
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token không phải refresh token")

        emp_code = payload.get("sub")
        jti = payload.get("jti")
        if not emp_code or not jti:
            raise HTTPException(status_code=401)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token không hợp lệ hoặc đã hết hạn"
        )

    # Kiểm tra user
    user = db.query(User).filter(
        User.emp_code == emp_code,
        User.status == "ACTIVE"
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="Người dùng không tồn tại")

    # Blacklist refresh token cũ
    exp = payload.get("exp", 0)
    blacklist_token(jti, exp)

    # Tạo token mới
    token_data = {"sub": user.emp_code, "role": user.role}
    new_access = create_access_token(token_data)
    new_refresh, new_jti = create_refresh_token(token_data)

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "emp_code": user.emp_code,
            "name": user.name,
            "role": user.role,
            "department": user.department,
            "branch_id": user.branch_id,
        }
    }


@router.post("/logout")
def logout(
    request: Request,
    access_token_str: str,
    refresh_token_str: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Đăng xuất - blacklist access token và refresh token.
    """
    try:
        # Blacklist access token
        access_payload = decode_token(access_token_str)
        blacklist_token(
            access_payload.get("jti", ""),
            access_payload.get("exp", 0)
        )

        # Blacklist refresh token nếu có
        if refresh_token_str:
            refresh_payload = decode_token(refresh_token_str)
            blacklist_token(
                refresh_payload.get("jti", ""),
                refresh_payload.get("exp", 0)
            )

        # Audit (nếu decode được user)
        emp_code = access_payload.get("sub")
        if emp_code:
            user = db.query(User).filter(User.emp_code == emp_code).first()
            if user:
                log_audit_event(
                    db, user.id, "LOGOUT", "User",
                    f"Đăng xuất từ IP {get_client_ip(request)}",
                    ip=get_client_ip(request)
                )

    except Exception:
        pass  # Token có thể đã hết hạn

    return {"message": "Đăng xuất thành công"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Thông tin người dùng hiện tại."""
    return current_user


@router.post("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Đổi mật khẩu - yêu cầu mật khẩu cũ."""
    client_ip = get_client_ip(request)

    # 1. Xác thực mật khẩu cũ
    is_valid, _ = verify_password(old_password, current_user.password_hash)
    if not is_valid:
        log_audit_event(
            db, current_user.id, "CHANGE_PASSWORD_FAILED", "User",
            f"Mật khẩu cũ không đúng từ IP {client_ip}",
            ip=client_ip, severity="WARNING"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu cũ không đúng"
        )

    # 2. Validate mật khẩu mới
    is_valid_pw, error_msg = validate_password_policy(new_password)
    if not is_valid_pw:
        raise HTTPException(status_code=400, detail=error_msg)

    # 3. Không được giống mật khẩu cũ
    if old_password == new_password:
        raise HTTPException(
            status_code=400,
            detail="Mật khẩu mới không được giống mật khẩu cũ"
        )

    # 4. Cập nhật
    current_user.password_hash = hash_password(new_password)
    db.commit()

    log_audit_event(
        db, current_user.id, "PASSWORD_CHANGED", "User",
        f"Đổi mật khẩu thành công từ IP {client_ip}",
        ip=client_ip
    )

    return {"message": "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."}
