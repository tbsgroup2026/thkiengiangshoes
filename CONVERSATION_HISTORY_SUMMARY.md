# LỊCH SỬ TRAO ĐỔI & TRẠNG THÁI HỆ THỐNG TBS GROUP (FULL LOG)

Tài liệu này lưu trữ toàn bộ lịch sử trao đổi, quyết định kiến trúc, thông tin tài khoản và lộ trình phát triển hệ thống **TBS Group Digitization & Operations Management System**.

---

## 1. TỔNG QUAN HỆ THỐNG & KIẾN TRÚC MONOREPO

Monorepo gồm 5 phân hệ độc lập:
1. `web/`: Next.js 15 (App Router) + Cloudflare Workers / D1 (SQL Database) / R2 (File Storage).
2. `core-cpp/`: C++ Shared Core (CMake, libcurl + OpenSSL, SQLite3 offline engine, JWT session/RBAC manager). Google Test suite (`tests/test_main.cpp`).
3. `android/`: App Android Native (Kotlin + Jetpack Compose, JNI bridge sang C++ Core, CameraX + ML Kit).
4. `ios/`: App iOS Native cho Công nhân & Bảo trì (Swift + SwiftUI, Objective-C++ bridge sang C++ Core, Vision framework).
5. `ios-admin/`: App Admin iOS Native riêng dành cho iPhone 13 của Lãnh đạo (Swift + SwiftUI, 4 Tabs BI Dashboard/Duyệt giấy tờ/Điều hành sự cố máy/Phân quyền nhân sự). Không đẩy lên App Store, cài trực tiếp qua cáp USB bằng script `ios-admin/install_to_iphone.sh`.

---

## 2. TRUY CẬP HỆ THỐNG & TÀI KHOẢN MẪU

- **Website công khai**: [https://tbshethong.workers.dev](https://tbshethong.workers.dev)
- **Cổng đăng nhập hệ thống**: [https://tbshethong.workers.dev/login](https://tbshethong.workers.dev/login)
- **Trang Admin quản trị RBAC**: [https://tbshethong.workers.dev/admin/users](https://tbshethong.workers.dev/admin/users)
- **Tài khoản Super Admin**:
  - Mã NV / Email: `admin@tbsgroup.vn` *(hoặc `EMP-001`)*
  - Mật khẩu: `Admin@123456`

---

## 3. CÁC QUYẾT ĐỊNH KỸ THUẬT QUAN TRỌNG

1. **Deploy & GitHub Actions**:
   - Workflow `.github/workflows/deploy-web.yml` tự động build và deploy Next.js lên Cloudflare Workers khi push `main`.
   - GitHub Secrets sử dụng: `CLOUDFLARE_ACCOUNT_ID` và `CLOUDFLARE_API_TOKEN`.
2. **Số Hóa Giấy Tờ**:
   - Đã xử lý đọc placeholder `{{key}}` từ file `.docx` và PDF text layer.
   - Tích hợp cơ chế cảnh báo & xử lý OCR cho file PDF dạng ảnh scan.
3. **App Mobile Native & Offline Engine**:
   - Quét mã QR/Barcode hoàn toàn xử lý bằng SDK native (Google ML Kit trên Android, Vision framework trên iOS).
   - Mọi dữ liệu sự cố tạo khi mất mạng sẽ được C++ Core lưu vào SQLite local và tự động upload đồng bộ khi có wifi lại.
4. **App Admin iOS Riêng (iPhone 13)**:
   - Bundle Identifier: `com.tbsgroup.admin`.
   - Khi cắm iPhone 13 vào laptop qua USB và gửi yêu cầu, thực thi script `bash ios-admin/install_to_iphone.sh` để nạp trực tiếp app vào máy.

---

## 4. BỘ THỜI GIAN VÀ TIẾN ĐỘ THỰC HIỆN

- ✅ **Khởi tạo PROJECT_STATE.md & phỏng vấn làm rõ yêu cầu (/grill-me)** (Đạt >95% độ thông suốt).
- ✅ **Phê duyệt Implementation Plan & Task List**.
- ✅ **Xây dựng DB Schema Cloudflare D1 (`web/d1_schema.sql`) & Wrangler setup**.
- ✅ **Xây dựng Web Backend API, JWT Auth & RBAC Middleware Next.js**.
- ✅ **Xây dựng Website công khai, Admin Panel, Số hóa giấy tờ, BI Dashboard 24/7**.
- ✅ **Xây dựng C++ Shared Core (`core-cpp/`) & Google Test suite**.
- ✅ **Xây dựng App Android Native (`android/`)**.
- ✅ **Xây dựng App iOS Native Công nhân/Bảo trì (`ios/`)**.
- ✅ **Xây dựng App Admin iOS Native riêng (`ios-admin/`) & USB install script cho iPhone 13**.
- ✅ **Kiểm tra build sản phẩm web (`npm run build`) đạt 100% 23 static pages/routes clean error**.
- ✅ **Lưu trữ toàn bộ lịch sử trao đổi và tài liệu vận hành (`DEPLOYMENT.md`, `PROJECT_STATE.md`, `CONVERSATION_HISTORY_SUMMARY.md`)**.
