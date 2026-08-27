"""
TBS II - Enhanced Authentication & Authorization Module
- PBKDF2-HMAC-SHA256 với 200,000 iterations + 16-byte salt
- JWT access token + refresh token
- Account lockout sau N lần đăng nhập thất bại
- Token blacklist để thu hồi token
- Audit logging toàn diện
"""
import os
import secrets
import time
import datetime
import hashlib
import binascii
from typing import Optional, Tuple
from collections import defaultdict

import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models import User, RoleEnum, AuditLog
from security_config import (
    JWT_SECRET_KEY, ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_HOURS,
    PBKDF2_ITERATIONS,
    ACCOUNT_LOCKOUT_THRESHOLD, ACCOUNT_LOCKOUT_MINUTES,
    validate_password_policy,
)

# ---- OAuth2 scheme ----
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ============================================================
# ACCOUNT LOCKOUT MECHANISM
# ============================================================
# Trong production nên dùng Redis. Ở đây dùng in-memory dict cho đơn giản.
_failed_logins: dict[str, list[float]] = defaultdict(list)
_locked_accounts: dict[str, float] = {}  # emp_code -> unlock_time
# Token blacklist: lưu jti -> thời điểm hết hạn
_token_blacklist: dict[str, float] = {}


def _cleanup_expired():
    """Dọn dẹp dữ liệu hết hạn định kỳ."""
    now = time.time()
    # Cleanup failed logins quá 30 phút
    for emp_code in list(_failed_logins.keys()):
        _failed_logins[emp_code] = [
            t for t in _failed_logins[emp_code]
            if now - t < ACCOUNT_LOCKOUT_MINUTES * 60
        ]
        if not _failed_logins[emp_code]:
            del _failed_logins[emp_code]
    # Cleanup locked accounts hết hạn
    for emp_code in list(_locked_accounts.keys()):
        if now >= _locked_accounts[emp_code]:
            del _locked_accounts[emp_code]
    # Cleanup token blacklist hết hạn
    for jti in list(_token_blacklist.keys()):
        if now >= _token_blacklist[jti]:
            del _token_blacklist[jti]


def is_account_locked(emp_code: str) -> Tuple[bool, Optional[int]]:
    """
    Kiểm tra tài khoản có đang bị khóa không.
    Trả về (bị_khóa, số_giây_còn_lại).
    """
    _cleanup_expired()
    if emp_code in _locked_accounts:
        remaining = int(_locked_accounts[emp_code] - time.time())
        if remaining > 0:
            return True, remaining
        del _locked_accounts[emp_code]
    return False, None


def record_failed_login(emp_code: str) -> bool:
    """
    Ghi nhận lần đăng nhập thất bại.
    Trả về True nếu tài khoản vừa bị khóa.
    """
    now = time.time()
    _failed_logins[emp_code].append(now)
    # Chỉ giữ các lần thất bại trong khoảng thời gian lockout
    cutoff = now - ACCOUNT_LOCKOUT_MINUTES * 60
    _failed_logins[emp_code] = [t for t in _failed_logins[emp_code] if t > cutoff]

    if len(_failed_logins[emp_code]) >= ACCOUNT_LOCKOUT_THRESHOLD:
        _locked_accounts[emp_code] = now + ACCOUNT_LOCKOUT_MINUTES * 60
        return True
    return False


def clear_failed_logins(emp_code: str):
    """Xóa lịch sử đăng nhập thất bại khi đăng nhập thành công."""
    _failed_logins.pop(emp_code, None)
    _locked_accounts.pop(emp_code, None)


def blacklist_token(jti: str, expires_at: float):
    """Thêm token vào blacklist."""
    _token_blacklist[jti] = expires_at


def is_token_blacklisted(jti: str) -> bool:
    """Kiểm tra token có trong blacklist không."""
    _cleanup_expired()
    return jti in _token_blacklist

# ============================================================
# PASSWORD HASHING (PBKDF2-HMAC-SHA256)
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash mật khẩu với PBKDF2-HMAC-SHA256.
    - 200,000 iterations
    - 16-byte salt từ secrets.token_bytes()
    """
    salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        PBKDF2_ITERATIONS
    )
    return (
        f"pbkdf2:sha256:"
        f"{PBKDF2_ITERATIONS}:"
        f"{binascii.hexlify(salt).decode('ascii')}:"
        f"{binascii.hexlify(key).decode('ascii')}"
    )


def verify_password(plain_password: str, hashed_password: str) -> Tuple[bool, bool]:
    """
    Xác thực mật khẩu.
    Trả về (hợp_lệ, cần_nâng_cấp_hash).

    cần_nâng_cấp_hash = True khi mật khẩu dùng legacy SHA256
    hoặc PBKDF2 với số iterations thấp hơn hiện tại.
    """
    try:
        if hashed_password.startswith("pbkdf2:sha256:"):
            parts = hashed_password.split(":")
            # Format: pbkdf2:sha256:iterations:salt:key
            if len(parts) == 5:
                iterations = int(parts[2])
                salt = binascii.unhexlify(parts[3].encode('ascii'))
                target_key = binascii.unhexlify(parts[4].encode('ascii'))
            else:
                # Old format: pbkdf2:sha256:salt:key (no iterations)
                iterations = 100000  # default cũ
                salt = binascii.unhexlify(parts[2].encode('ascii'))
                target_key = binascii.unhexlify(parts[3].encode('ascii'))

            key = hashlib.pbkdf2_hmac(
                'sha256',
                plain_password.encode('utf-8'),
                salt,
                iterations
            )
            matches = secrets.compare_digest(key, target_key)
            needs_upgrade = matches and iterations < PBKDF2_ITERATIONS
            return matches, needs_upgrade

        else:
            # Legacy SHA256 fallback — cho phép đăng nhập nhưng buộc đổi mật khẩu
            legacy_salt = "tbs2_salt_secure_"
            legacy_hash = hashlib.sha256(
                (legacy_salt + plain_password).encode("utf-8")
            ).hexdigest()
            matches = secrets.compare_digest(legacy_hash.encode(), hashed_password.encode())
            return matches, matches  # Nếu khớp, buộc nâng cấp

    except Exception:
        return False, False


# ============================================================
# JWT TOKEN MANAGEMENT
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[datetime.timedelta] = None
) -> str:
    """
    Tạo JWT access token với jti (JWT ID) để có thể thu hồi.
    """
    now = datetime.datetime.utcnow()
    to_encode = data.copy()
    to_encode.update({
        "exp": now + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)),
        "iat": now,
        "jti": secrets.token_hex(16),  # JWT ID để blacklist
        "type": "access"
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> Tuple[str, str]:
    """
    Tạo refresh token.
    Trả về (refresh_token, jti).
    """
    now = datetime.datetime.utcnow()
    jti = secrets.token_hex(16)
    to_encode = data.copy()
    to_encode.update({
        "exp": now + datetime.timedelta(hours=REFRESH_TOKEN_EXPIRE_HOURS),
        "iat": now,
        "jti": jti,
        "type": "refresh"
    })
    token = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return token, jti


def decode_token(token: str) -> dict:
    """
    Giải mã và xác thực JWT token.
    Kiểm tra blacklist và token type.
    """
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    if is_token_blacklisted(payload.get("jti", "")):
        raise jwt.InvalidTokenError("Token đã bị thu hồi")
    return payload


# ============================================================
# DEPENDENCY INJECTION CHO FASTAPI
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Xác thực người dùng từ JWT access token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin người dùng",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exception

        emp_code: str = payload.get("sub")
        if emp_code is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise credentials_exception

    # Kiểm tra account lockout
    locked, remaining = is_account_locked(emp_code)
    if locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Tài khoản tạm khóa. Vui lòng thử lại sau {remaining} giây."
        )

    user = db.query(User).filter(User.emp_code == emp_code).first()
    if user is None or user.status != "ACTIVE":
        raise credentials_exception

    return user


def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Lấy thông tin user nếu có token, ngược lại trả về None.
    Dùng cho các endpoint public nhưng muốn audit nếu user đã login.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    try:
        token = auth_header[7:]
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        emp_code = payload.get("sub")
        if not emp_code:
            return None
        return db.query(User).filter(
            User.emp_code == emp_code,
            User.status == "ACTIVE"
        ).first()
    except Exception:
        return None


def require_role(allowed_roles: list[RoleEnum]):
    """
    Decorator factory - kiểm tra quyền truy cập theo role.
    Admin luôn có tất cả quyền.
    """
    allowed_values = [r.value for r in allowed_roles]

    def role_checker(user: User = Depends(get_current_user)):
        if user.role == RoleEnum.ADMIN.value:
            return user
        if user.role not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền truy cập chức năng này"
            )
        return user

    return role_checker


# ============================================================
# AUDIT LOGGING
# ============================================================

def log_audit_event(
    db: Session,
    user_id: Optional[int],
    action: str,
    target: str,
    details: str,
    ip: str = "127.0.0.1",
    severity: str = "INFO"
):
    """
    Ghi log bảo mật vào database.
    severity: INFO, WARNING, CRITICAL
    """
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            target_entity=target,
            details=details,
            ip_address=ip,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        # Fallback: in ra console nếu không ghi được DB
        print(f"[SECURITY AUDIT FAILED] action={action} target={target} error={e}")


def get_client_ip(request: Request) -> str:
    """Lấy IP thực của client, xử lý trường hợp qua proxy."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"
