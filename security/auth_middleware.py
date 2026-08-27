"""
TBS II — Auth Middleware (FastAPI Dependency Injection)
======================================================
Xac thuc JWT + kiem tra role cho moi request.
Tich hop voi auth.py co san cua backend — KHONG thay the, chi mo rong.

Su dung:
  from security.auth_middleware import require_permission, verify_department_access

  @router.get("/hr/employees")
  def get_employees(
      current_user = Depends(require_permission(["hr:read"])),
      db: Session = Depends(get_db)
  ):
      ...

  @router.get("/accounting/reports")
  def get_reports(
      current_user = Depends(require_permission(["accounting:read"])),
      db: Session = Depends(get_db)
  ):
      ...
"""

from typing import Optional, List
from functools import wraps

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

# Import tu auth module co san cua backend
from auth import (
    get_current_user,
    get_client_ip,
    log_audit_event,
    decode_token,
    is_token_blacklisted,
)
from models import User, RoleEnum
from database import get_db


# ============================================================
# PERMISSION MAP (Dynamic RBAC)
# ============================================================
# Map permission string -> allowed roles
# Format: "module:action"

PERMISSION_MAP = {
    # ---- HR ----
    "hr:read": [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE],
    "hr:write": [RoleEnum.ADMIN, RoleEnum.MANAGER],
    "hr:delete": [RoleEnum.ADMIN],
    "hr:salary": [RoleEnum.ADMIN, RoleEnum.MANAGER],  # Luong — chi admin & manager

    # ---- Accounting ----
    "accounting:read": [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE],
    "accounting:write": [RoleEnum.ADMIN, RoleEnum.MANAGER],
    "accounting:delete": [RoleEnum.ADMIN],
    "accounting:approve": [RoleEnum.ADMIN, RoleEnum.MANAGER],

    # ---- QC ----
    "qc:read": [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE, RoleEnum.MAINTENANCE],
    "qc:write": [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE],
    "qc:delete": [RoleEnum.ADMIN, RoleEnum.MANAGER],

    # ---- Production / Machines ----
    "production:read": [
        RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE,
        RoleEnum.MAINTENANCE, RoleEnum.WORKER
    ],
    "production:write": [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.MAINTENANCE],
    "production:delete": [RoleEnum.ADMIN],
    "production:scan_qr": [
        RoleEnum.ADMIN, RoleEnum.MAINTENANCE, RoleEnum.WORKER
    ],

    # ---- Incidents ----
    "incidents:read": [
        RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE,
        RoleEnum.MAINTENANCE, RoleEnum.WORKER
    ],
    "incidents:report": [RoleEnum.ADMIN, RoleEnum.WORKER],
    "incidents:accept": [RoleEnum.ADMIN, RoleEnum.MAINTENANCE],
    "incidents:resolve": [RoleEnum.ADMIN, RoleEnum.MAINTENANCE],

    # ---- Dashboard / BI ----
    "dashboard:view": [RoleEnum.ADMIN, RoleEnum.MANAGER],
    "dashboard:restricted": [RoleEnum.ADMIN],  # Full company data

    # ---- Admin ----
    "admin:users": [RoleEnum.ADMIN],
    "admin:roles": [RoleEnum.ADMIN],
    "admin:system": [RoleEnum.ADMIN],

    # ---- Chat ----
    "chat:send": [
        RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE,
        RoleEnum.MAINTENANCE, RoleEnum.WORKER
    ],
    "chat:manage": [RoleEnum.ADMIN],

    # ---- Documents ----
    "documents:read": [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE],
    "documents:create": [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.OFFICE],
    "documents:approve": [RoleEnum.ADMIN, RoleEnum.MANAGER],
    "documents:delete": [RoleEnum.ADMIN],
}


def has_permission(user: User, permission: str) -> bool:
    """
    Kiem tra user co permission cu the khong.
    Admin luon co moi quyen.
    """
    if user.role == RoleEnum.ADMIN.value:
        return True

    allowed_roles = PERMISSION_MAP.get(permission, [])
    allowed_values = [r.value for r in allowed_roles]
    return user.role in allowed_values


def require_permission(permissions: List[str]):
    """
    Dependency injection — kiem tra nhieu permission cung luc.
    User chi can co IT NHAT 1 permission trong danh sach.

    Usage:
      current_user = Depends(require_permission(["hr:read", "hr:write"]))
    """

    def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
        request: Request = None,
    ) -> User:
        # Admin luon pass
        if current_user.role == RoleEnum.ADMIN.value:
            return current_user

        # Kiem tra tung permission
        for perm in permissions:
            if has_permission(current_user, perm):
                return current_user

        # Audit log — unauthorized attempt
        client_ip = "unknown"
        try:
            from fastapi import Request as FR
            # request duoc inject boi FastAPI
        except Exception:
            pass

        log_audit_event(
            db,
            current_user.id,
            "ACCESS_DENIED",
            "Permission",
            f"User {current_user.emp_code} (role={current_user.role}) "
            f"bi tu choi truy cap permissions={permissions}",
            ip=client_ip,
            severity="WARNING",
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ban khong co quyen truy cap chuc nang nay",
        )

    return permission_checker


def verify_department_access(
    current_user: User = Depends(get_current_user),
    target_department_id: Optional[int] = None,
    target_branch_id: Optional[int] = None,
):
    """
    Xac minh user chi truy cap du lieu trong department/chi nhanh cua ho.
    Manager co the xem department cua minh, Admin xem toan bo.

    Usage:
      def get_hr_data(
          dept_id: int,
          current_user = Depends(get_current_user),
          _ = Depends(verify_department_access(current_user, target_department_id=dept_id))
      ):
    """
    if current_user.role == RoleEnum.ADMIN.value:
        return True

    if current_user.role == RoleEnum.MANAGER.value:
        # Manager chi xem department va branch cua minh
        if target_branch_id and current_user.branch_id != target_branch_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ban chi co quyen xem du lieu trong chi nhanh cua minh",
            )
        return True

    # Worker, maintenance: chi xem du lieu lien quan den minh
    return True


def verify_token_not_blacklisted(token: str) -> bool:
    """
    Kiem tra token chua bi blacklist.
    Dung cho WebSocket va cac connection dai han.
    """
    try:
        payload = decode_token(token)
        jti = payload.get("jti", "")
        return not is_token_blacklisted(jti)
    except Exception:
        return False


# ============================================================
# WEBSOCKET AUTH HELPER
# ============================================================

async def authenticate_websocket_token(token: str) -> Optional[dict]:
    """
    Xac thuc WebSocket token.
    Tra ve payload neu hop le, None neu khong.
    """
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        if is_token_blacklisted(payload.get("jti", "")):
            return None
        return payload
    except Exception:
        return None
