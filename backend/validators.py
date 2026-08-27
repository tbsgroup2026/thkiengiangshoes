"""
TBS II - Input Validation & Sanitization Module
Tập trung tất cả logic kiểm tra đầu vào để ngăn chặn injection và dữ liệu độc hại.
"""
import re
import html
from typing import Optional


# ---- Email Validation ----
EMAIL_REGEX = re.compile(
    r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?'
    r'(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$'
)

# ---- Vietnam Phone Validation (10 digits, starts with 0) ----
VN_PHONE_REGEX = re.compile(r'^(0[3|5|7|8|9][0-9]{8})$')

# ---- Employee Code ----
EMP_CODE_REGEX = re.compile(r'^[A-Za-z0-9_-]{2,20}$')

# ---- Generic dangerous patterns for input ----
SQL_KEYWORDS_PATTERN = re.compile(
    r'\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|TRUNCATE|EXECUTE)\b',
    re.IGNORECASE
)
SCRIPT_TAG_PATTERN = re.compile(r'<script[^>]*>.*?</script>', re.IGNORECASE | re.DOTALL)


def validate_email(email: str) -> bool:
    """Kiểm tra định dạng email hợp lệ."""
    if not email or len(email) > 254:
        return False
    return bool(EMAIL_REGEX.match(email))


def validate_vn_phone(phone: str) -> bool:
    """Kiểm tra số điện thoại Việt Nam (10 số, bắt đầu 03x/05x/07x/08x/09x)."""
    if not phone:
        return False
    return bool(VN_PHONE_REGEX.match(phone))


def validate_emp_code(emp_code: str) -> bool:
    """Kiểm tra mã nhân viên hợp lệ (2-20 ký tự, chữ/số/gạch)."""
    if not emp_code:
        return False
    return bool(EMP_CODE_REGEX.match(emp_code))


def sanitize_html_input(text: str) -> str:
    """
    Escape HTML entities để ngăn Stored XSS.
    Đồng thời strip khoảng trắng thừa.
    """
    if not text:
        return ""
    return html.escape(text.strip())


def sanitize_plain_text(text: str, max_length: int = 5000) -> str:
    """
    Sanitize text input: strip, escape HTML, cắt độ dài tối đa.
    Dành cho các trường text thông thường.
    """
    if not text:
        return ""
    sanitized = html.escape(text.strip())
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    return sanitized


def has_sql_injection_attempt(text: str) -> bool:
    """Phát hiện các từ khóa SQL đáng ngờ trong input."""
    if not text:
        return False
    return bool(SQL_KEYWORDS_PATTERN.search(text))


def has_script_tag(text: str) -> bool:
    """Phát hiện thẻ <script> trong input."""
    if not text:
        return False
    return bool(SCRIPT_TAG_PATTERN.search(text))


def validate_url(url: str) -> bool:
    """
    Kiểm tra URL hợp lệ và an toàn (chỉ http/https).
    """
    if not url:
        return True  # URL rỗng thì ok (optional field)
    if len(url) > 2048:
        return False
    return url.lower().startswith(("http://", "https://"))


class ValidationError(Exception):
    """Lỗi validation tùy chỉnh."""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")
