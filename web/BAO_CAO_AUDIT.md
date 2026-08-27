# BÁO CÁO ĐÁNH GIÁ KỸ THUẬT TOÀN DIỆN (COMPREHENSIVE TECHNICAL AUDIT REPORT)
**Dự án**: Hệ Thống Quản Trị Vận Hành Chuỗi Cung Ứng & Sản Xuất SKECHERS - TBS Group  
**Môi trường**: Next.js 16 + Cloudflare Workers + Cloudflare D1 Database  
**Ngày thực hiện**: 21/08/2026  
**Chuyên gia thực hiện**: Senior Software Engineer & Security Audit Specialist  

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục Đích & Chức Năng Chính
Hệ thống **VP Chuỗi SKECHERS - TBS Group** (`vpchuoiskechers`) là nền tảng quản trị vận hành số hóa tập trung cho toàn bộ chuỗi cung ứng, nhà máy sản xuất và khối hành chính văn phòng tập đoàn.
- **Đăng ký & Phê duyệt Công tác (Business Trip)**: Quản lý đăng ký, luồng duyệt 2 cấp (Trưởng phòng Cấp 1, Ban Giám Đốc Cấp 2), từ chối có lý do, phê duyệt ngân sách, quản lý hóa đơn chứng từ.
- **Quản lý & Đặt Phòng họp / Khách sạn (Rooms)**: Đặt phòng họp, đặt phòng khách sạn, khóa phòng bảo trì, đăng ký đoàn khách tham quan.
- **Quản trị Hệ thống & Phân quyền (Admin)**: Quản lý danh sách tài khoản, vai trò (RBAC), xem nhật ký thao tác toàn hệ thống (Audit Logs).
- **Hồ sơ Cá nhân & Thông báo (Work & Notifications)**: Cập nhật ảnh đại diện (Cloudinary), xem thông tin nhân sự, trung tâm thông báo thời gian thực.
- **Các Phân hệ Nghiệp vụ mở rộng (Finance, Maintenance, HR, Careers, Documents)**: Giao diện theo dõi Thu - Chi, Hóa đơn, Công nợ, Ngân sách, Tài sản, Kho vật tư, Bảo trì máy móc, Tuyển dụng và Trình ký văn bản.

### 1.2 Tech Stack Đầy Đủ (Cụ Thể Từ package.json)
| Phân tầng | Công nghệ / Thư viện | Version | Ghi chú & Tác dụng |
| :--- | :--- | :--- | :--- |
| **Core Framework** | Next.js | `16.2.11` | React App Router với chế độ Static Export (`output: 'export'`) |
| **UI Library** | React & React DOM | `19.2.4` | Tối ưu hóa UI rendering |
| **Ngôn ngữ** | TypeScript | `^5.0.0` | Type safety client/server |
| **Styling** | TailwindCSS & PostCSS | `^4.0.0` | Utility-first CSS styling |
| **Icon Sets** | Lucide React | `^0.469.0` | Bộ icon hệ thống |
| | Tabler Icons React | `^3.45.0` | Bộ icon phân hệ Tài chính & Dashboard |
| **Animation** | Motion (Framer Motion) | `^11.11.0` | Micro-animations và hiệu ứng chuyển trang |
| **Biểu đồ BI** | Chart.js & React-ChartJS-2 | `^4.5.1` / `^5.3.1` | Vẽ biểu đồ chỉ số vận hành & tài chính |
| **Xử lý Document** | Docxtemplater, PDF-lib, PizZip | `^3.50.0` / `^1.17.1` | Đọc/xuất biểu mẫu Word & PDF |
| **Xác thực JWT** | Jose | `^5.9.6` | Mã hóa/giải mã và kiểm tra JWT Token (HS256) |
| **Mã hóa Password** | Bcryptjs | `^2.4.3` | Hash mật khẩu người dùng |
| **Backend Edge** | Cloudflare Workers | Serverless | File proxy & API Gateway monolith (`public/_worker.js`) |
| **Database** | Cloudflare D1 Database | SQLite Engine | CSDL quan hệ serverless thời gian thực (`vpchuoiskechers`) |

### 1.3 Kiến Trúc Tổng Thể & Luồng Dữ Liệu
```
                                ┌────────────────────────────────────────────────┐
                                │             BROWSER (REACT 19 SPA)             │
                                └───────────────────────┬────────────────────────┘
                                                        │
                                    HTTP Requests (REST APIs & Static Assets)
                                                        │
                                                        ▼
                                ┌────────────────────────────────────────────────┐
                                │         CLOUDFLARE WORKER (_worker.js)         │
                                │  - Serve Static Assets (from out/ directory)   │
                                │  - API Gateway Routes (/api/*)                 │
                                │  - Server-side Security & RBAC Checks          │
                                └───────────────────────┬────────────────────────┘
                                                        │
                                                Prepared SQL Statements
                                                        │
                                                        ▼
                                ┌────────────────────────────────────────────────┐
                                │        CLOUDFLARE D1 DATABASE (env.DB)         │
                                │  SQLite Tables: users, business_trips, rooms...│
                                └────────────────────────────────────────────────┘
```

### 1.4 Sơ Đồ Cấu Trúc Thư Mục Thực Tế Trong Repository
```
d:/Work/TBS II/web/
├── public/
│   └── _worker.js                  # Edge Worker Monolith xử lý API & CSDL D1 (2,760+ dòng)
├── src/
│   ├── app/                        # Next.js App Router Pages
│   │   ├── admin/                  # Quản trị hệ thống, users, audit logs
│   │   ├── business-trip/          # Đăng ký & duyệt công tác (Realtime D1)
│   │   ├── rooms/                  # Đặt phòng họp & khách sạn (Realtime D1)
│   │   ├── finance/                # Tài chính kế toán (11 sub-modules - Mock UI)
│   │   ├── maintenance/            # Bảo trì máy móc (Mock UI)
│   │   ├── hr/ & careers/          # Nhân sự & tuyển dụng (Mock UI)
│   │   ├── documents/              # Quản lý tài liệu (Mock UI)
│   │   ├── work/                   # Trang làm việc cá nhân & upload avatar
│   │   ├── layout.tsx              # Root Layout
│   │   └── page.tsx                # Homepage Dashboard
│   ├── components/                 # Shared UI Components
│   │   ├── Header.tsx              # Navigation bar & profile menu
│   │   ├── Footer.tsx              # Footer chuẩn hóa
│   │   ├── FinanceShell.tsx        # Shell sidebar cho phân hệ tài chính
│   │   └── NotificationCenter.tsx  # Trung tâm thông báo thời gian thực
│   ├── hooks/                      # Custom React Hooks (usePermission, useAuth)
│   └── lib/                        # Libraries (auth.ts, rbac.ts, userProfiles.ts)
├── d1_schema.sql                   # CSDL D1 Schema & Migrations
├── seed_data.sql                   # Dữ liệu mẫu khởi tạo CSDL D1
├── wrangler.jsonc                  # Cấu hình Cloudflare Worker & D1 Binding
├── next.config.ts                  # Cấu hình Next.js Static Export
└── package.json                    # Script & Dependencies
```

---

## 2. TÌNH TRẠNG HOẠT ĐỘNG

### 2.1 Các Phân Hệ Đã Kết Nối D1 Database Realtime
Xác minh bằng cách tìm kiếm các lệnh `fetch('/api/...')` trên client và đối chiếu route tương ứng trong `_worker.js`:

1. **Phân hệ Đăng ký Công tác (`/business-trip`)**:
   - Client calling: [src/app/business-trip/page.tsx](file:///d:/Work/TBS%20II/web/src/app/business-trip/page.tsx#L206) (`fetch("/api/business-trips")`).
   - Worker handling: [public/_worker.js](file:///d:/Work/TBS%20II/web/public/_worker.js#L1040-L1210) (`GET`, `POST`, `PUT /api/business-trips`).
   - Trạng thái: **Hoạt động 100% Realtime D1**, hỗ trợ Duyệt 2 Cấp, Optimistic Locking (`version`), Segregation of Duties.
2. **Phân hệ Quản lý & Đặt Phòng họp / Khách sạn (`/rooms`)**:
   - Client calling: [src/app/rooms/page.tsx](file:///d:/Work/TBS%20II/web/src/app/rooms/page.tsx#L242) (`fetch("/api/rooms")`).
   - Worker handling: [public/_worker.js](file:///d:/Work/TBS%20II/web/public/_worker.js#L750-L950) (`GET`, `POST`, `PUT /api/rooms/*`).
   - Trạng thái: **Hoạt động Realtime D1**, hỗ trợ đặt phòng, khóa phòng, đăng ký khách.
3. **Phân hệ Quản trị Hệ thống & Người dùng (`/admin`)**:
   - Client calling: [src/app/admin/page.tsx](file:///d:/Work/TBS%20II/web/src/app/admin/page.tsx#L374) (`fetch("/api/users")`).
   - Worker handling: [public/_worker.js](file:///d:/Work/TBS%20II/web/public/_worker.js#L600-L720) (`GET`, `POST`, `PUT /api/users`).
   - Trạng thái: **Hoạt động Realtime D1**, quản lý tài khoản vàAudit Logs.
4. **Phân hệ Hồ sơ & Upload Avatar (`/work`)**:
   - Client calling: [src/app/work/page.tsx](file:///d:/Work/TBS%20II/web/src/app/work/page.tsx#L457) (`fetch("/api/upload-avatar")`).
   - Worker handling: [public/_worker.js](file:///d:/Work/TBS%20II/web/public/_worker.js#L193-L266).
   - Trạng thái: **Hoạt động Realtime Cloudinary + D1**.

### 2.2 Các Phân Hệ Còn Dùng Mock Data / Dữ Liệu Tĩnh Trong React State
Xác minh bằng cách grep `useState` khởi tạo mảng cứng mà không có lệnh `fetch('/api/...')`:

1. **Phân hệ Tài chính & Kế toán (`/finance` và 11 sub-modules)**:
   - File: [src/app/finance/page.tsx](file:///d:/Work/TBS%20II/web/src/app/finance/page.tsx#L54-L1200) và toàn bộ các trang con `/finance/thu-chi`, `/finance/hoa-don`, `/finance/cong-no`, `/finance/ngan-sach`, `/finance/chi-phi`, `/finance/tai-san`, `/finance/vat-tu-kho`.
   - Trạng thái: **100% Mock Data trong React State**, hơn 60,000 dòng code UI hoàn chỉnh nhưng chưa kết nối API/CSDL D1.
2. **Phân hệ Bảo trì Thiết bị (`/maintenance`)**:
   - File: `src/app/maintenance/machines/page.tsx` và `src/app/maintenance/tickets/page.tsx`.
   - Trạng thái: **100% Mock Data**.
3. **Phân hệ Nhân sự & Tuyển dụng (`/hr`, `/careers`)**:
   - File: `src/app/hr/page.tsx`, `src/app/careers/page.tsx`.
   - Trạng thái: **100% Mock Data**.
4. **Phân hệ Tài liệu & Phê duyệt (`/documents`)**:
   - File: `src/app/documents/page.tsx`, `src/app/documents/approvals/page.tsx`.
   - Trạng thái: **100% Mock Data**.

---

## 3. LỖI & RỦI RO KỸ THUẬT (RÀ SOÁT CHI TIẾT KÈM CODE THẬT)

### 3.1 Nhóm Lỗi Bảo Mật (Security Vulnerabilities)

#### ❌ Lỗi #1 (CRITICAL): Bypass Xác Thực Ẩn Danh (Unauthenticated Admin Privilege Escalation)
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/public/_worker.js#L312-L328](file:///d:/Work/TBS%20II/web/public/_worker.js#L312-L328)
- **Đoạn code gốc**:
  ```javascript
  // Line 312-318 in public/_worker.js
  if (!empCode) {
    empCode = "202608001";
    roleCode = "CBCNV";
  }

  const EXECS = ["TONG_GIAM_DOC", "PHO_TONG_GIAM_DOC", "GIAM_DOC", "PHO_GIAM_DOC", "SYSTEM_ADMIN", "ADMIN-2026", "202608001", "202608002"];
  const isExecutiveOrAdmin = EXECS.includes(roleCode) || EXECS.includes(empCode);
  ```
- **Mô tả & Tác động thực tế**: Khi bất kỳ request nào không gửi token xác thực (không có `Authorization` header hoặc `Cookie`), hàm `verifyServerAuth` tự động fallback gán `empCode = "202608001"`. Tuy nhiên mã `"202608001"` lại nằm trực tiếp trong danh sách `EXECS` ở dòng 317. Dẫn đến thuộc tính `isExecutiveOrAdmin` luôn trả về `true` cho **mọi request không xác thực từ Internet**, cho phép kẻ tấn công đọc/sửa toàn bộ dữ liệu nhạy cảm trên D1 mà không cần đăng nhập!
- **Mức độ nghiêm trọng**: 🚨 **CRITICAL**
- **Đề xuất cách sửa**:
  ```javascript
  if (!empCode) {
    return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập!" }), { status: 401, headers: SECURE_JSON_HEADERS });
  }
  ```

---

#### ❌ Lỗi #2 (CRITICAL): Kiểm Tra Token Giả Mạo Không Xác Thực Chữ Ký Cryptographic (Unsigned Bearer Token Authentication)
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/public/_worker.js#L281-L288](file:///d:/Work/TBS%20II/web/public/_worker.js#L281-L288)
- **Đoạn code gốc**:
  ```javascript
  // Line 281-288 in public/_worker.js
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const parts = token.split("_");
    if (parts.length >= 3) {
      empCode = parts[1].toUpperCase();
      roleCode = parts[2].toUpperCase();
    }
  }
  ```
- **Mô tả & Tác động thực tế**: Hàm kiểm tra auth của backend không giải mã hoặc kiểm tra chữ ký HMAC/JWT của token. Nó chỉ đơn thuần tách chuỗi theo dấu gạch dưới `_`. Kẻ tấn công chỉ cần gửi header `Authorization: Bearer dummy_TGĐ-001_TONG_GIAM_DOC` là có thể mạo danh bất kỳ Tổng Giám Đốc hoặc Admin nào trong hệ thống!
- **Mức độ nghiêm trọng**: 🚨 **CRITICAL**
- **Đề xuất cách sửa**: Sử dụng thư viện `jose` hoặc Web Crypto API (`crypto.subtle.verify`) để verify chữ ký JWT thật sự bằng `JWT_SECRET` trước khi chấp nhận `empCode`.

---

#### ❌ Lỗi #3 (CRITICAL): Bypass Phân Quyền Phía Frontend (Frontend RBAC Hardcoded True)
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/src/hooks/usePermission.ts#L48-L78](file:///d:/Work/TBS%20II/web/src/hooks/usePermission.ts#L48-L78)
- **Đoạn code gốc**:
  ```typescript
  // Line 48-57 in src/hooks/usePermission.ts
  // Hiển thị full 100% tất cả các nút bấm, tab và tính năng trên toàn bộ hệ thống
  const isExecutiveOrAdmin = true;

  const userPermissions = new Set<Permission>(
    Object.values(PERMISSIONS)
  );

  const can = (_permission: Permission): boolean => true;
  const canAny = (_permissions: Permission[]): boolean => true;
  const canAll = (_permissions: Permission[]): boolean => true;
  ```
- **Mô tả & Tác động thực tế**: Hook phân quyền UI `usePermission` đang hardcode trả về `true` cho tất cả các hàm kiểm tra quyền (`can`, `canAny`, `canAll`) và gán `isExecutiveOrAdmin = true` cho mọi tài khoản người dùng, vô hiệu hóa hoàn toàn cơ chế phân quyền RBAC phía giao diện.
- **Mức độ nghiêm trọng**: 🚨 **CRITICAL**
- **Đề xuất cách sửa**: Khôi phục lại logic kiểm tra permission dựa trên mảng `user.roles` và danh sách quyền thật trong `PERMISSIONS`.

---

#### ❌ Lỗi #4 (HIGH): Hardcode Secret Key Trong File Cấu Hình Git (Hardcoded JWT Secret)
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/wrangler.jsonc#L26](file:///d:/Work/TBS%20II/web/wrangler.jsonc#L26) & [file:///d:/Work/TBS%20II/web/src/lib/auth.ts#L3](file:///d:/Work/TBS%20II/web/src/lib/auth.ts#L3)
- **Đoạn code gốc**:
  ```json
  // wrangler.jsonc line 26
  "vars": {
    "NEXT_PUBLIC_APP_URL": "https://vpchuoiskechers.tbsgroup2026.workers.dev",
    "JWT_SECRET": "tbs_group_secure_jwt_secret_key_2026"
  }
  ```
  ```typescript
  // src/lib/auth.ts line 3
  const secretString = process.env.JWT_SECRET || (typeof window === "undefined" ? "tbs_default_env_secret" : "");
  ```
- **Mô tả & Tác động thực tế**: Chuỗi khoát mật `JWT_SECRET` bị khai báo cứng công khai trong file `wrangler.jsonc` và fallback string `auth.ts`. Nếu repository bị lộ, kẻ xấu có thể dùng key này để tự tạo token JWT hợp lệ.
- **Mức độ nghiêm trọng**: 🔴 **HIGH**
- **Đề xuất cách sửa**: Xóa `JWT_SECRET` khỏi `wrangler.jsonc`. Đăng ký bí mật qua lệnh `npx wrangler secret put JWT_SECRET`.

---

#### ❌ Lỗi #5 (HIGH): Sử Dụng Unsigned Cloudinary Upload Preset Trực Tiếp Trên Server Edge
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/public/_worker.js#L206-L230](file:///d:/Work/TBS%20II/web/public/_worker.js#L206-L230)
- **Đoạn code gốc**:
  ```javascript
  // Line 206-217 in public/_worker.js
  const presets = ["vpchuoisk", "ml_default", "unsigned"];

  for (const preset of presets) {
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", preset);

      const cRes = await fetch("https://api.cloudinary.com/v1_1/dwl2xtbqa/image/upload", {
        method: "POST",
        body: formData,
      });
  ```
- **Mô tả & Tác động thực tế**: Endpoint `/api/upload-avatar` gọi Cloudinary bằng unsigned preset công khai (`dwl2xtbqa`). Kẻ xấu có thể lợi dụng endpoint này để upload các tệp tin rác hoặc nội dung độc hại làm cạn kiệt băng thông Cloudinary.
- **Mức độ nghiêm trọng**: 🔴 **HIGH**
- **Đề xuất cách sửa**: Chuyển sang cơ chế Signed Uploads (tạo `signature` bảo mật phía backend với API Secret của Cloudinary).

---

#### ❌ Lỗi #6 (MEDIUM): Lưu Trữ Mật Khẩu Mặc Định Dạng Plain Text Trong Schema & Seed Data
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/d1_schema.sql#L36](file:///d:/Work/TBS%20II/web/d1_schema.sql#L36) & [file:///d:/Work/TBS%20II/web/seed_data.sql#L45-L71](file:///d:/Work/TBS%20II/web/seed_data.sql#L45-L71)
- **Đoạn code gốc**:
  ```sql
  -- d1_schema.sql line 36
  password_hash TEXT NOT NULL DEFAULT '123456',
  ```
  ```sql
  -- seed_data.sql line 45
  (201, 'TGĐ-001', 'tgd@tbsgroup.vn', 'Tổng Giám Đốc', '0988000001', '123456', 2, 1, ...
  ```
- **Mô tả & Tác động thực tế**: Mật khẩu mặc định của người dùng trong CSDL D1 được lưu ở dạng plain text `'123456'` thay vì chuỗi bcrypt hash. Nếu CSDL bị lộ, toàn bộ tài khoản có thể bị chiếm đoạt ngay lập tức.
- **Mức độ nghiêm trọng**: 🟠 **MEDIUM**
- **Đề xuất cách sửa**: Hash toàn bộ mật khẩu bằng `bcrypt` trước khi insert vào CSDL D1.

---

### 3.2 Nhóm Lỗi Kiến Trúc & Logic

#### ❌ Lỗi #7 (HIGH): Tệp Backend `_worker.js` Vi Phạm Nguyên Tắc Single Responsibility (2,760+ dòng)
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/public/_worker.js#L1-L2760](file:///d:/Work/TBS%20II/web/public/_worker.js#L1-L2760)
- **Mô tả & Tác động thực tế**: Toàn bộ logic backend của hệ thống (Auth, RBAC, Trips, Rooms, QC, Notifications, Audit Logs, Asset Proxy) bị dồn chung vào 1 file duy nhất `_worker.js`. File quá dài dẫn đến nguy cơ xung đột code khi làm việc nhóm, khó kiểm thử và bảo trì.
- **Mức độ nghiêm trọng**: 🔴 **HIGH**
- **Đề xuất cách sửa**: Refactor cấu trúc code backend: Tách `_worker.js` thành các router module trong `src/worker/controllers/` (dùng ES Modules).

#### ❌ Lỗi #8 (HIGH): Hơn 60,000 Dòng Code Phân Hệ Tài Chính Sử Dụng Hardcoded UI State
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/src/app/finance/page.tsx#L54-L1200](file:///d:/Work/TBS%20II/web/src/app/finance/page.tsx#L54-L1200)
- **Mô tả & Tác động thực tế**: Phân hệ Tài chính gồm 11 sub-modules quy mô lớn nhưng **100% dữ liệu đang lưu trong React local state**, không có bất kỳ lệnh `fetch()` nào kết nối với CSDL Cloudflare D1. Dữ liệu sẽ mất toàn bộ khi F5 hoặc chuyển thiết bị.
- **Mức độ nghiêm trọng**: 🔴 **HIGH**
- **Đề xuất cách sửa**: Xây dựng bảng CSDL D1 cho phân hệ tài chính (`finance_transactions`, `invoices`, `budgets`) và viết các REST APIs tương ứng trong Worker.

#### ❌ Lỗi #9 (MEDIUM): Thiếu Input Schema Validation (Zod) Tại Các Endpoints
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/public/_worker.js#L1044-L1075](file:///d:/Work/TBS%20II/web/public/_worker.js#L1044-L1075)
- **Mô tả & Tác động thực tế**: Các payload nhận từ `request.json()` được gán trực tiếp vào câu lệnh SQL bind mà không qua bước validate schema (Zod). Người dùng có thể truyền kiểu dữ liệu bất hợp lệ gây lỗi 500 unhandled.
- **Mức độ nghiêm trọng**: 🟠 **MEDIUM**
- **Đề xuất cách sửa**: Tích hợp thư viện `zod` để validate dữ liệu đầu vào trước khi xử lý.

---

### 3.3 Nhóm Lỗi Cấu Hình, Dependency & Testing

#### ❌ Lỗi #10 (HIGH): Hoàn Toàn Thiếu Test Suite Kiếm Thử Tự Động
- **Đường dẫn file & số dòng**: [file:///d:/Work/TBS%20II/web/package.json#L5-L10](file:///d:/Work/TBS%20II/web/package.json#L5-L10)
- **Đoạn code gốc**:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
  ```
- **Mô tả & Tác động thực tế**: Dự án không cài đặt bất kỳ framework test nào (Vitest, Jest, Playwright) và không có script `npm test`. Mọi việc kiểm thử hoàn toàn phụ thuộc vào thao tác thủ công, dễ bỏ sót bug khi refactor code.
- **Mức độ nghiêm trọng**: 🔴 **HIGH**
- **Đề xuất cách sửa**: Cài đặt `vitest` và `@testing-library/react`, bổ sung các test suite cho RBAC và API routes.

#### ❌ Lỗi #11 (MEDIUM): Thiếu File `.env.example` Và Thư Mục CI/CD Workflows
- **Đường dẫn file & số dòng**: Thư mục gốc `d:/Work/TBS II/web/`
- **Mô tả & Tác động thực tế**: Thiếu file `.env.example` mô tả các biến môi trường và thiếu `.github/workflows/` cho quy trình CI/CD tự động hoá.
- **Mức độ nghiêm trọng**: 🟠 **MEDIUM**
- **Đề xuất cách sửa**: Tạo file `.env.example` chuẩn và xây dựng file `.github/workflows/ci.yml`.

---

## 4. THIẾU SÓT SO VỚI HỆ THỐNG PRODUCTION-READY

Một hệ thống doanh nghiệp tiêu chuẩn Production-Ready cần bổ sung các thành phần sau:

1. **Health Check Endpoint (`/api/health`)**:
   - Chưa có endpoint tự động kiểm tra uptime và trạng thái kết nối CSDL Cloudflare D1.
2. **Centralized Error Tracking (Sentry / LogRocket)**:
   - Chưa có hệ thống ghi nhận và cảnh báo tự động các lỗi runtime exception từ máy khách hoặc Edge Worker.
3. **Database Migration & Backup Pipeline**:
   - Chưa có pipeline tự động chạy SQL migration và backup CSDL D1 định kỳ trước khi deploy code mới.
4. **Tài Liệu API Chuẩn (OpenAPI / Swagger Specs)**:
   - Các API chưa có tài liệu OpenAPI 3.0 phục vụ việc tích hợp ứng dụng di động hoặc hệ thống ERP ngoài.
5. **Rate Limiting & Threat Protection**:
   - Các route nhạy cảm (như `/api/auth/login`) chưa có cơ chế giới hạn tần suất request (Rate Limiting).

---

## 5. ROADMAP ƯU TIÊN XỬ LÝ (ROADMAP ACTION PLAN)

| Ưu tiên | Danh mục công việc | Lý do & Mục tiêu | Ước lượng Effort |
| :---: | :--- | :--- | :---: |
| **P0** | **Fix lỗi Auth Bypass tại `_worker.js:L312` & `L281`** | Ngăn chặn nguy cơ thất thoát dữ liệu và mạo danh Admin từ request ẩn danh. | **Nhỏ** (2 giờ) |
| **P0** | **Khôi phục logic RBAC trong `usePermission.ts`** | Đảm bảo phân quyền phía giao diện chính xác theo vai trò người dùng. | **Nhỏ** (2 giờ) |
| **P0** | **Bảo mật `JWT_SECRET` qua Cloudflare Worker Secret** | Xóa khoát mật cứng khỏi Git repository, chống giả mạo token. | **Nhỏ** (1 giờ) |
| **P1** | **Refactor chia nhỏ file `public/_worker.js` (2,760+ dòng)** | Tách file monolith thành các controller module độc lập, dễ bảo trì. | **Vừa** (2-3 ngày) |
| **P1** | **Chuyển đổi phân hệ Tài chính (`/finance`) sang CSDL D1** | Đưa 11 sub-modules Tài chính từ mock UI state sang lưu trữ D1 thật. | **Lớn** (1-2 tuần) |
| **P1** | **Bổ sung Zod Input Schema Validation cho APIs** | Validate dữ liệu đầu vào, ngăn chặn lỗi 500 unhandled. | **Vừa** (2 ngày) |
| **P2** | **Cài đặt Vitest & Thiết lập Unit Test Suite** | Tự động hóa kiểm thử cho RBAC logic và REST APIs. | **Vừa** (3-4 ngày) |
| **P2** | **Tạo GitHub Actions CI/CD Pipeline & `.env.example`** | Tự động hoá kiểm tra linter, build và deploy Cloudflare. | **Nhỏ** (1 ngày) |
| **P3** | **Tích hợp Sentry Error Tracking & Health Check Endpoint** | Theo dõi sức khỏe hệ thống và tự động bắt lỗi trên môi trường sản xuất. | **Nhỏ** (1 ngày) |

---
**KẾT LUẬN**:  
Hệ thống **VP Chuỗi SKECHERS - TBS Group** sở hữu giao diện UI/UX rất chỉn chu, hiện đại và các phân hệ trọng tâm như Đăng ký công tác & Đặt phòng họp đã đồng bộ CSDL D1 thành công. Tuy nhiên, đội ngũ cần lập tức xử lý các lỗ hổng bảo mật P0 (Bypass Auth, Token Unsigned, Hardcode Secret) để đảm bảo an toàn tuyệt đối cho dữ liệu doanh nghiệp trước khi triển khai chính thức.
