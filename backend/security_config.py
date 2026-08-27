"""
TBS II - Security Configuration Module
Tải tất cả cấu hình bảo mật từ biến môi trường với fallback an toàn.
"""
import os
import secrets

# ---- JWT ----
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    # Tạo key ngẫu nhiên mỗi lần khởi động nếu không có env - chỉ dùng cho dev
    secrets.token_urlsafe(64)
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_HOURS = int(os.getenv("REFRESH_TOKEN_EXPIRE_HOURS", "24"))

# ---- PLC / Machine API Key ----
PLC_API_KEY = os.getenv(
    "PLC_API_KEY",
    secrets.token_urlsafe(32)
)

# ---- CORS ----
ALLOWED_ORIGINS_RAW = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
)
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS_RAW.split(",") if o.strip()]

# ---- Rate Limiting ----
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "100"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
LOGIN_MAX_ATTEMPTS = int(os.getenv("LOGIN_MAX_ATTEMPTS", "10"))
LOGIN_RATE_WINDOW_SECONDS = int(os.getenv("LOGIN_RATE_WINDOW_SECONDS", "60"))
ACCOUNT_LOCKOUT_THRESHOLD = int(os.getenv("ACCOUNT_LOCKOUT_THRESHOLD", "5"))
ACCOUNT_LOCKOUT_MINUTES = int(os.getenv("ACCOUNT_LOCKOUT_MINUTES", "30"))

# ---- Password Policy ----
PASSWORD_MIN_LENGTH = int(os.getenv("PASSWORD_MIN_LENGTH", "8"))
PASSWORD_REQUIRE_UPPERCASE = os.getenv("PASSWORD_REQUIRE_UPPERCASE", "true").lower() == "true"
PASSWORD_REQUIRE_DIGIT = os.getenv("PASSWORD_REQUIRE_DIGIT", "true").lower() == "true"
PASSWORD_REQUIRE_SPECIAL = os.getenv("PASSWORD_REQUIRE_SPECIAL", "true").lower() == "true"

# ---- HSTS / Proxy ----
BEHIND_PROXY = os.getenv("BEHIND_PROXY", "false").lower() == "true"
HSTS_MAX_AGE = int(os.getenv("HSTS_MAX_AGE", "31536000"))

# ---- PBKDF2 ----
PBKDF2_ITERATIONS = 200_000  # Nâng từ 100k lên 200k

# ---- Body Size Limits ----
MAX_REQUEST_BODY_SIZE = 10 * 1024 * 1024  # 10MB

# ---- Debug ----
DEBUG = os.getenv("DEBUG", "false").lower() == "true"


def validate_password_policy(password: str) -> tuple[bool, str]:
    """
    Kiểm tra mật khẩu đáp ứng chính sách bảo mật.
    Trả về (hợp_lệ, thông_báo_lỗi).
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Mật khẩu phải có ít nhất {PASSWORD_MIN_LENGTH} ký tự"

    if PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False, "Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)"

    if PASSWORD_REQUIRE_DIGIT and not any(c.isdigit() for c in password):
        return False, "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)"

    if PASSWORD_REQUIRE_SPECIAL and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?/~`" for c in password):
        return False, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%...)"

    return True, ""
