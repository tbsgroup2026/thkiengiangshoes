# DEPLOYMENT & OPERATION MANUAL — TBS GROUP HỆ THỐNG SỐ HÓA & VẬN HÀNH

Tài liệu hướng dẫn cấu hình môi trường, triển khai tự động CI/CD và quy trình build nộp app Android/iOS Native chính thức lên Google Play & Apple App Store.

---

## 1. Cấu Trúc Monorepo

```
tbshethong/
├── web/                  # Next.js 15 (App Router) + Cloudflare Workers / D1 (SQL) / R2 (Storage)
├── core-cpp/             # C++ Shared Core (CMake, libcurl, SQLite offline engine, Google Test)
├── android/               # App Android Native (Kotlin + Jetpack Compose, JNI bridge, CameraX, FCM)
├── ios/                   # App iOS Native (Swift + SwiftUI, Objective-C++ bridge, Vision, APNs)
├── .github/workflows/
│   ├── deploy-web.yml          # Auto deploy Next.js lên Cloudflare Workers khi push main
│   └── build-core-cpp-test.yml # Auto test C++ Core bằng Google Test mỗi PR/push
├── PROJECT_STATE.md
└── DEPLOYMENT.md
```

---

## 2. Cấu Hồi GitHub Secrets (Bắt Buộc Cho Triển Khai Web)

Truy cập repository GitHub tại `https://github.com/anhywork2004/tbshethong` -> **Settings** -> **Secrets and variables** -> **Actions** và tạo 2 secret:

1. `CLOUDFLARE_ACCOUNT_ID`: Mã ID tài khoản Cloudflare của `anhy.work.2004@gmail.com`.
2. `CLOUDFLARE_API_TOKEN`: API Token có quyền `Workers:Edit`, `D1:Edit`, `R2:Edit`.

> Khi có push/merge vào nhánh `main` tác động tới thư mục `web/`, GitHub Actions sẽ tự động chạy `.github/workflows/deploy-web.yml`, build Next.js, cập nhật D1 DB migration và publish lên Cloudflare Workers.

---

## 3. Quy Trình Build App Mobile Native (Android & iOS)

### 3.1 Build App Android (`android/`)
1. Mở thư mục `android/` bằng **Android Studio**.
2. Đảm bảo đã cài NDK (Side-by-side) và CMake.
3. Chọn menu **Build** -> **Generate Signed Bundle / APK** -> **Android App Bundle (.aab)**.
4. Chọn Keystore ký app và xuất file `app-release.aab`.

### 3.2 Build App iOS (`ios/`)
1. Mở thư mục `ios/TBSGroupApp.xcodeproj` bằng **Xcode** trên macOS.
2. Chọn target `TBSGroupApp`, thiết lập Development Team và Bundle Identifier.
3. Chọn menu **Product** -> **Archive**.
4. Sau khi hoàn tất Archive, chọn **Distribute App** -> **App Store Connect** để tải file `.ipa` lên TestFlight / App Store.

---

## 4. Checklist Tự Kiểm Tra Trước Khi Nộp Store (Pre-Submission Audit Checklist)

- [x] **Privacy Policy URL**: Đã cung cấp công khai trang điều khoản và chính sách bảo mật dữ liệu.
- [x] **Permissions Rationale**:
  - `NSCameraUsageDescription` (iOS) / `android.permission.CAMERA` (Android): Khai báo lý do xin quyền camera rõ ràng ("Sử dụng camera để quét mã QR/Barcode trên máy hỏng").
- [x] **Secure Token Storage**: Mật khẩu và JWT token được mã hóa an toàn qua EncryptedSharedPreferences (Android) và Keychain Services (iOS).
- [x] **HTTPS TLS Enforcement**: Toàn bộ kết nối API REST từ C++ Shared Core đều bắt buộc sử dụng HTTPS mã hóa SSL/TLS qua OpenSSL.
- [x] **Offline Stability**: App không bị crash khi mất kết nối nhà xưởng; hiển thị trạng thái `Offline (Pending items)` và tự động đồng bộ khi có wifi lại.

---

## 5. Quy Trình Cài Đặt App Admin Riêng Lên iPhone 13 Qua USB

App Admin riêng dành cho Lãnh đạo (`ios-admin/TBSGroupAdmin/`) là ứng dụng iOS Native nội bộ (không đẩy lên App Store / Google Play).

### Các bước cài trực tiếp vào iPhone 13 khi cắm cáp USB vào laptop:
1. Kết nối **iPhone 13** vào laptop bằng cáp USB và chọn **"Tin cậy máy tính này" (Trust This Computer)** trên iPhone.
2. Khi bạn gửi yêu cầu cài app Admin, hệ thống sẽ thực thi kịch bản tự động [install_to_iphone.sh](file:///d:/Work/TBS%20II/ios-admin/install_to_iphone.sh):
   ```bash
   bash ios-admin/install_to_iphone.sh
   ```
3. Ứng dụng **TBS Group Admin** sẽ được build và cài đặt trực tiếp lên chiếc iPhone 13 của bạn, tự động kết nối và đồng bộ dữ liệu real-time với backend D1 và hệ thống toàn công ty.

