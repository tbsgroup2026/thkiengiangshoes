"""
TBS II — Input Validation Schemas (Pydantic)
=============================================
Schema validate input cho moi API endpoint nhan du lieu tu mobile app.
Mo rong validators.py co san trong backend — KHONG thay the.

Su dung:
  from security.validation_schemas import (
      LoginSchema, IncidentReportSchema, UserCreateSchema,
      validate_with_schema
  )

  @router.post("/auth/login")
  def login(req: LoginSchema):
      ...

  @router.post("/incidents")
  def report_incident(req: IncidentReportSchema, ...):
      ...
"""

import re
from typing import Optional, List
from datetime import datetime

# NOTE: Pydantic da duoc su dung trong backend qua schemas.py.
# Module nay bo sung validation chat che hon cho cac endpoint nhay cam.


# ============================================================
# VALIDATION RULES
# ============================================================

# Ma nhan vien: 2-20 ky tu, chi chu cai/so/gach
EMP_CODE_PATTERN = re.compile(r'^[A-Za-z0-9_-]{2,20}$')

# So dien thoai Viet Nam (10 so, bat dau 03x/05x/07x/08x/09x)
VN_PHONE_PATTERN = re.compile(r'^(0[3|5|7|8|9][0-9]{8})$')

# Email
EMAIL_PATTERN = re.compile(
    r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9]'
    r'(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?'
    r'(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$'
)

# Password: toi thieu 8 ky tu, it nhat 1 hoa, 1 so, 1 dac biet
PASSWORD_PATTERN = re.compile(
    r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]).{8,128}$'
)

# Machine code: TBS2-MCH-XXX
MACHINE_CODE_PATTERN = re.compile(r'^TBS2-MCH-\d{3,}$')

# QR code data: Base64 URL-safe, max 2048 chars
QR_DATA_MAX_LENGTH = 2048

# Priority values
VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

# Incident status values
VALID_INCIDENT_STATUSES = {
    "OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"
}

# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif"
}

# Max description length
MAX_DESCRIPTION_LENGTH = 5000
MAX_NOTES_LENGTH = 2000


# ============================================================
# VALIDATION FUNCTIONS
# ============================================================

class ValidationResult:
    """Ket qua validation."""
    def __init__(self, is_valid: bool, errors: List[str]):
        self.is_valid = is_valid
        self.errors = errors

    def __bool__(self):
        return self.is_valid

    def raise_if_invalid(self):
        if not self.is_valid:
            raise ValueError("; ".join(self.errors))


def validate_login_input(emp_code: str, password: str) -> ValidationResult:
    """Validate thong tin dang nhap."""
    errors = []
    if not emp_code or not EMP_CODE_PATTERN.match(emp_code):
        errors.append("Ma nhan vien khong hop le (2-20 ky tu, chi chu/so/gach)")
    if not password or len(password) < 6:
        errors.append("Mat khau phai co it nhat 6 ky tu")
    if len(password) > 128:
        errors.append("Mat khau khong duoc vuot qua 128 ky tu")
    return ValidationResult(len(errors) == 0, errors)


def validate_incident_report(
    machine_id: int,
    description: str,
    priority: str,
    category_id: Optional[int] = None,
    image_url: Optional[str] = None,
) -> ValidationResult:
    """Validate bao cao su co tu mobile app."""
    errors = []

    if not isinstance(machine_id, int) or machine_id <= 0:
        errors.append("machine_id phai la so nguyen duong")

    if not description or len(description.strip()) == 0:
        errors.append("Mo ta su co khong duoc de trong")
    elif len(description) > MAX_DESCRIPTION_LENGTH:
        errors.append(f"Mo ta khong duoc vuot qua {MAX_DESCRIPTION_LENGTH} ky tu")

    if priority and priority not in VALID_PRIORITIES:
        errors.append(f"Priority khong hop le. Gia tri hop le: {VALID_PRIORITIES}")

    if category_id is not None and (not isinstance(category_id, int) or category_id <= 0):
        errors.append("category_id phai la so nguyen duong")

    if image_url:
        if len(image_url) > QR_DATA_MAX_LENGTH:
            errors.append(f"Image URL khong duoc vuot qua {QR_DATA_MAX_LENGTH} ky tu")
        if not image_url.lower().startswith(("http://", "https://", "data:image/")):
            errors.append("Image URL phai bat dau bang http://, https://, hoac data:image/")

    return ValidationResult(len(errors) == 0, errors)


def validate_user_create(
    emp_code: str,
    name: str,
    password: str,
    role: str,
    department: str,
    phone: Optional[str] = None,
    email: Optional[str] = None,
) -> ValidationResult:
    """Validate tao nguoi dung moi (HR module)."""
    errors = []

    if not EMP_CODE_PATTERN.match(emp_code):
        errors.append("Ma nhan vien khong hop le")

    if not name or len(name.strip()) < 2:
        errors.append("Ten phai co it nhat 2 ky tu")
    elif len(name) > 100:
        errors.append("Ten khong duoc vuot qua 100 ky tu")

    if not PASSWORD_PATTERN.match(password):
        errors.append(
            "Mat khau phai co it nhat 8 ky tu, 1 chu hoa, 1 so, 1 ky tu dac biet"
        )

    valid_roles = {"ADMIN", "MANAGER", "OFFICE", "MAINTENANCE", "WORKER"}
    if role not in valid_roles:
        errors.append(f"Role khong hop le. Gia tri hop le: {valid_roles}")

    if not department or len(department.strip()) < 2:
        errors.append("Department khong duoc de trong")

    if phone and not VN_PHONE_PATTERN.match(phone):
        errors.append("So dien thoai khong hop le (10 so, bat dau 03x/05x/07x/08x/09x)")

    if email and not EMAIL_PATTERN.match(email):
        errors.append("Email khong hop le")

    return ValidationResult(len(errors) == 0, errors)


def validate_machine_code(machine_code: str) -> ValidationResult:
    """Validate ma may."""
    errors = []
    if not MACHINE_CODE_PATTERN.match(machine_code):
        errors.append(
            f"Ma may khong hop le. Dinh dang: TBS2-MCH-XXX (vd: TBS2-MCH-001)"
        )
    return ValidationResult(len(errors) == 0, errors)


def validate_pagination(page: int = 1, limit: int = 50) -> ValidationResult:
    """Validate tham so phan trang."""
    errors = []
    if page < 1:
        errors.append("page phai >= 1")
    if limit < 1 or limit > 200:
        errors.append("limit phai nam trong khoang 1-200")
    return ValidationResult(len(errors) == 0, errors)


def validate_date_range(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> ValidationResult:
    """Validate khoang thoi gian cho BI dashboard."""
    errors = []
    date_format = "%Y-%m-%d"

    if start_date:
        try:
            datetime.strptime(start_date, date_format)
        except ValueError:
            errors.append("start_date khong dung dinh dang YYYY-MM-DD")

    if end_date:
        try:
            datetime.strptime(end_date, date_format)
        except ValueError:
            errors.append("end_date khong dung dinh dang YYYY-MM-DD")

    if start_date and end_date:
        try:
            s = datetime.strptime(start_date, date_format)
            e = datetime.strptime(end_date, date_format)
            if s > e:
                errors.append("start_date khong duoc lon hon end_date")
        except ValueError:
            pass  # Da co error o tren

    return ValidationResult(len(errors) == 0, errors)
