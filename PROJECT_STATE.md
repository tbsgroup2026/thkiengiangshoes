# PROJECT_STATE.md — TBS Group Digitization & Operations System State

## 1. Final Monorepo Architecture
- **Web App & Backend (`web/`)**: Next.js 15 (App Router), TypeScript, Cloudflare Workers runtime, Cloudflare D1 SQL database (`web/d1_schema.sql`), Cloudflare R2 file storage (`web/wrangler.jsonc`).
- **C++ Shared Core (`core-cpp/`)**: Shared C++ logic compiled via CMake (libcurl, OpenSSL, SQLite offline ticket engine, JWT session/RBAC manager). Google Test suite (`core-cpp/tests/test_main.cpp`).
- **Android Native Worker/Mechanic App (`android/`)**: Kotlin + Jetpack Compose UI, NDK JNI bridge to `core-cpp`, CameraX + ML Kit Barcode Scanning, Firebase Cloud Messaging (FCM).
- **iOS Native Worker/Mechanic App (`ios/`)**: Swift + SwiftUI UI, Objective-C++ bridge (`TBSCoreBridge.mm`) to `core-cpp`, AVFoundation + Vision barcode scanner, APNs.
- **Private Admin iOS Native App (`ios-admin/` / `TBSGroupAdmin`)**: Private native iOS app for Super Admin / Executives, NOT published to App Store. Features Executive BI Dashboard, Document Approvals, Machine Incident Overrides, Staff & Role Management. Built with Swift + SwiftUI + Objective-C++ bridge to `core-cpp/`. Installed via USB directly onto user's connected iPhone 13 upon request.
- **CI/CD Automation (`.github/workflows/`)**:
  - `deploy-web.yml`: Auto-deploy Next.js web app to Cloudflare Workers on `push` to `main`.
  - `build-core-cpp-test.yml`: Auto-run Google Test suite for C++ Core on every PR and push.

---

## 2. Database Schema (`web/d1_schema.sql`)
1. `departments` & `roles` (Dynamic RBAC Levels 1 to 6)
2. `users` (emp_code, password_hash, role_id, department_id, status)
3. `permissions` & `role_permissions`
4. `branches`, `sectors`, `zones`, `lines`
5. `machines` (machine_code, qr_code_data, zone_id, line_id, status)
6. `incident_categories`
7. `maintenance_tickets` & `maintenance_performance_logs`
8. `documents_templates` & `documents_generated` & `document_approval_flow`
9. `jobs` & `job_applications`
10. `notifications` & `audit_logs`

---

## 3. Web Routes (`web/src/app`)
- **Public Site**: `/` (Home), `/about`, `/careers`, `/contact`
- **Auth**: `/login` (Unified Login), `/mobile-guide` (Worker/Mechanic App Guide)
- **Admin Panel**: `/admin/users`, `/admin/roles`, `/admin/departments`
- **Document Digitization**: `/documents/templates`, `/documents/create`, `/documents/approvals`
- **Maintenance Operations**: `/maintenance/machines`, `/maintenance/tickets`
- **Real-time Operations Dashboard**: `/dashboard` (Executive Overview, Production, Machine Incidents Rank, Mechanic KPIs)

---

## 4. Private Admin App & Mobile Native Integration
- **Shared C++ Header**: `core-cpp/include/tbs_core.h`
- **Android JNI Bridge**: `android/app/src/main/cpp/native-lib.cpp` -> `TBSNativeBridge.kt`
- **iOS Worker ObjC++ Bridge**: `ios/TBSGroupApp/TBSCoreBridge.mm` -> `ContentView.swift`
- **Cấu hình CI/CD & Triển khai**: [DEPLOYMENT.md](file:///d:/Work/TBS%20II/DEPLOYMENT.md)
- **Nhật ký Lịch sử Trao đổi & Quyết định**: [CONVERSATION_HISTORY_SUMMARY.md](file:///d:/Work/TBS%20II/CONVERSATION_HISTORY_SUMMARY.md)

