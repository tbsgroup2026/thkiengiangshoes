# HƯỚNG DẪN TRIỂN KHAI VÀ VẬN HÀNH HỆ THỐNG QUẢN LÝ SẢN XUẤT & BẢO TRÌ TBS II

Tài liệu hướng dẫn triển khai toàn bộ các thành phần của hệ thống **TBS II** bao gồm:
1. **Backend Python (FastAPI API Gateway + WebSockets + Security Hardening)**
2. **Web Admin & BI Dashboard (Trình chiếu TV & XSS Escaping)**
3. **Flutter Mobile App (iOS / Android / CH Play / App Store)**
4. **C# (.NET 8) Integration Service (Tích hợp ERP & PLC Authenticated)**

---

## 1. TÍNH NĂNG BẢO MẬT ĐÃ ĐƯỢC CỦNG CỐ (SECURITY HARDENING)

- **PBKDF2-HMAC-SHA256 Password Hashing**: Sử dụng thuật toán băm chuẩn 100.000 vòng lặp kèm Salt 16-byte ngẫu nhiên chống tấn công dò mật khẩu.
- **JWT_SECRET_KEY từ Environment**: Quản lý khóa JWT bí mật qua biến môi trường `JWT_SECRET_KEY`.
- **HTTP Security Headers Middleware**: Tự động chèn các HTTP headers an ninh:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy`
- **Brute Force Rate Limiter**: Giới hạn tối đa 10 lần thử đăng nhập/phút trên mỗi địa chỉ IP tại route `/api/v1/auth/login`.
- **Phòng chống Stored XSS**: Toàn bộ dữ liệu do người dùng nhập (Mô tả sự cố, Nguyên nhân hỏng, Tên người dùng) đều được Sanitized ở Backend và Escape HTML trên Web Admin & Heatmap.
- **X-API-KEY Authentication**: Đích danh truyền header `X-API-KEY` khi dịch vụ C# PLC telemetry cập nhật trạng thái thiết bị.
- **Audit Logging**: Ghi vết persistent nhật ký bảo mật mọi hành vi đăng nhập, báo hỏng, nhận ca và sửa xong máy.

---

## 2. CHẠY VÀ TRIỂN KHAI BACKEND API (FASTAPI)

### Buớc 2.1: Cài đặt Dependencies
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
```

### Bước 2.2: Cấu hình Biến Môi Trường Bảo Mật
```bash
set JWT_SECRET_KEY=your_jwt_secret_key_environment_variable
set ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000
set PLC_API_KEY=your_plc_api_key_environment_variable
```

### Bước 2.3: Khởi chạy Server Backend
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **Tài liệu API Swagger UI**: `http://localhost:8000/docs`
- **Tài liệu OpenAPI Spec JSON**: `http://localhost:8000/openapi.json`
- **WebSocket Gateway**: `ws://localhost:8000/ws`

---

## 3. TRIỂN KHAI WEB ADMIN & BI DASHBOARD (TRÌNH CHIẾU TV)

### Bước 3.1: Mở giao diện trên trình duyệt
```bash
cd web
python -m http.server 3000
```
Truy cập: `http://localhost:3000`

---

## 4. CHẠY VÀ BUILD MOBILE APP (FLUTTER)

```bash
cd mobile
flutter pub get
flutter run
```

---

## 5. CHẠY MODULE TÍCH HỢP C# (.NET 8)

```bash
cd integration
dotnet run
```
