# 🏢 TBS II PLATFORM — HỆ THỐNG SỐ HÓA & QUẢN TRỊ VẬN HÀNH SẢN XUẤT TỔ HỢP KIÊN GIANG

> **Tài liệu Kỹ thuật & Kiến trúc Tổng thể Hệ thống (Master Architecture Documentation)**  
> **Đơn vị phát triển**: Ban Công Nghệ & Kaizen — Tập đoàn TBS Group  
> **Hạ tầng chính**: Cloudflare Workers (Serverless Engine) + Cloudflare D1 (SQLite Database) + Next.js 16 (Static Export)  
> **Phạm vi tác nghiệp**: Tổ hợp Nhà máy Kiên Giang (KG 1, KG 2, Hoàn thiện đế) & VP Chuỗi  

---

## 📋 1. GIỚI THIỆU HỆ THỐNG (SYSTEM OVERVIEW)

### 1.1 Mục Đích & Chức Năng Chính
**TBS II Platform** là hệ thống phần mềm quản trị sản xuất số hóa tập trung được thiết kế dành riêng cho đội ngũ cán bộ quản lý, kỹ sư CI/QC, bảo trì, ban giám khảo và công nhân trực tiếp sản xuất tại các nhà máy thuộc Tập đoàn TBS Group.

Hệ thống cung cấp các bộ công cụ toàn diện:
- **Phân hệ CN-CI (Kaizen 5 Bước & Gemba Walk)**: Quản lý toàn bộ vòng đời sáng kiến cải tiến từ đăng ký ý tưởng, sơ duyệt, phê duyệt triển khai (Bước 3), thực thi (Bước 4), đến đánh giá chuyên môn barem 100đ / chấm sao (Bước 5) và tôn vinh thi đua.
- **Bảng Điều Khiển Vận Hành (Dashboard & Cảnh báo Ban 2.2)**: Thống kê chỉ số Kaizen toàn nhà máy và cảnh báo sớm các vấn đề hiện trường.
- **Phân hệ Quản Lý Bảo Trì MMTB**: Tiếp nhận ticket sự cố máy móc và quản lý danh mục thiết bị sản xuất.
- **Phân hệ Kế Toán - Tài Chính & Hành Chính Nhân Sự**: Theo dõi hồ sơ cán bộ công nhân viên, thu chi, công nợ, ngân sách và lịch công tác.
- **Cổng Quản Trị Hệ Thống (Admin Portal)**: Phân quyền vai trò, quản lý đối tác thương hiệu và kiểm soát an ninh truy cập nghiêm ngặt.

---

## 🗺️ Master Flowchart: End-to-End System Workflow

Mô tả chi tiết toàn bộ quy trình nghiệp vụ, luồng xử lý AI, phân quyền an ninh, phê duyệt hiện trường, quản lý sự cố MMTB và cơ cấu thi đua của hệ thống **TBS II Platform (Tổ hợp Kiên Giang)**.

---

### 📌 Quy Ước Hình Khối & Màu Sắc (Flowchart Legend)

Bảng quy chuẩn ký hiệu trực quan được áp dụng đồng bộ cho tất cả các sơ đồ luồng hệ thống:

| Hình Khối | Cú Pháp Mermaid | Loại Node & Ý Nghĩa Nghiệp Vụ | Quy Định Màu Sắc (`classDef`) |
| :---: | :---: | :--- | :--- |
| 🟢 **Oval bo tròn** | `([Text])` | Điểm Bắt đầu / Kết thúc thành công (Start / End) | Xanh lá đậm (`#1b5e20`) |
| 🔵 **Chữ nhật** | `[Text]` | Thao tác / Xử lý nghiệp vụ chính (Action / Process) | Xanh dương (`#1565c0`) |
| 🟠 **Hình thoi** | `{Text}` | Phân nhánh & Kiểm tra điều kiện (Decision / Branching) | Cam (`#e65100`) |
| 🩵 **Hình bình hành** | `[/Text/]` | Dữ liệu Nhập/Xuất & Giao diện Form (Input / Output) | Xanh ngọc (`#00695c`) |
| 🟣 **Bo góc** | `(Text)` | Tự động hóa & AI Engine (AI / Auto Engine) | Tím (`#4a148c`) |
| 🔴 **Đỏ (Chữ nhật/Oval)** | `[Text]` / `([Text])` | Cảnh báo / Từ chối / Kết thúc lỗi (Alert / Reject / Error End) | Đỏ (`#b71c1c`) |

---

### 📑 Mục Lục Điều Hướng Flowchart (Table of Contents)

1. [Sơ Đồ Tổng Quan Các Phân Hệ (Master System Overview)](#1-sơ-đồ-tổng-quan-các-phân-hệ-master-system-overview)
2. [Luồng A: Đăng Nhập & Phân Quyền RBAC (Auth & Permissions)](#2-luồng-a-đăng-nhập--phân-quyền-rbac-auth--permissions)
3. [Luồng B: Tiếp Nhận Báo Cáo & Chống Trùng Lặp (Issue Reporting & Duplicate Guard)](#3-luồng-b-tiếp-nhận-báo-cáo--chống-trùng-lặp-issue-reporting--duplicate-guard)
4. [Luồng C: Xử Lý AI 5 Whys & Quản Lý SLA (AI Engine & SLA Control)](#4-luồng-c-xử-lý-ai-5-whys--quản-lý-sla-ai-engine--sla-control)
5. [Luồng D: Phê Duyệt, Bảo Trì & Giám Sát Tái Diễn (Approval & Execution)](#5-luồng-d-phê-duyệt-bảo-trì--giám-sát-tái-diễn-approval--execution)
6. [Luồng E: Kết Thúc, Đóng Issue & Lưu Trữ KPI (Archiving & Indexing)](#6-luồng-e-kết-thúc-đóng-issue--lưu-trữ-kpi-archiving--indexing)
7. [Luồng F: Các Phân Hệ Mở Rộng (Dashboard, Cảnh Báo Ban, Thư Viện & Thi Đua)](#7-luồng-f-các-phân-hệ-mở-rộng-dashboard-cảnh-báo-ban-thư-viện--thi-đua)

---

### 1. Sơ Đồ Tổng Quan Các Phân Hệ (Master System Overview)

Sơ đồ tổng thể kết nối toàn bộ các phân hệ từ Đăng nhập, Báo cáo sự cố, Xử lý AI, Phê duyệt, Bảo trì đến Lưu trữ KPI:

```mermaid
flowchart TD
    classDef startEnd fill:#1b5e20,stroke:#2e7d32,color:#ffffff,stroke-width:2px;
    classDef process fill:#1565c0,stroke:#1e88e5,color:#ffffff,stroke-width:2px;
    classDef decision fill:#e65100,stroke:#fb8c00,color:#ffffff,stroke-width:2px;
    classDef inputOutput fill:#00695c,stroke:#00897b,color:#ffffff,stroke-width:2px;
    classDef aiEngine fill:#4a148c,stroke:#7b1fa2,color:#ffffff,stroke-width:2px;
    classDef alertError fill:#b71c1c,stroke:#e53935,color:#ffffff,stroke-width:2px;

    M_START(["🚀 Bắt đầu phiên truy cập hệ thống<br/>User Access Platform"])
    M_AUTH["🔒 [Module Auth] Đăng nhập & Xác thực RBAC Guard<br/>Role-Based Access Control"]
    M_ROLE{"Chọn vai trò tác nghiệp?<br/>Role Selection"}
    
    M_REP[/"📝 [Module Report] Tạo báo cáo Kaizen / Sự cố MMTB<br/>Input Form & Media Upload"/]
    M_DUP{"Kiểm tra trùng lặp báo cáo?<br/>Prevent Duplicate Engine"}
    M_DUP_ERR["⚠️ Cảnh báo trùng lặp - Đề xuất gộp issue<br/>Status: Duplicate Blocked"]
    
    M_AI("🤖 [Module AI Engine] Phỏng vấn 5 Whys & Đếm SLA<br/>Multi-Role Interview & Auto Root Cause")
    M_SLA{"Kiểm tra thời gian SLA (15 phút)?<br/>SLA Timer Check"}
    M_TIMEOUT["🚨 SLA Timeout - Khóa Form & Phát SOS Alert<br/>Status: SLA Expired"]
    
    M_APPROVE["⚖️ [Module Approval] Phê duyệt giải pháp & Phân công<br/>Feasibility Approval & Task Assignment"]
    M_SCOPE{"Kiểm tra phạm vi & ngân sách?<br/>Scope & Budget Check"}
    M_SOS["📢 Escalation: Gửi thông báo khẩn tới Giám đốc nhà máy<br/>Status: SOS Escalated"]
    
    M_MAINT["🔧 [Module Maintenance] Thực thi sửa chữa MMTB hiện trường<br/>Parts Replacement & Photos Proof"]
    M_INSPECT{"Kiểm tra tại chỗ (On-site Inspection)?<br/>Passed / Failed"}
    M_MONITOR["👁️ [Module Monitoring] Giám sát tái diễn (24-48h)<br/>Recurrence Monitoring"]
    M_RECUR{"Phát hiện sự cố tái diễn?<br/>Has Recurrence?"}
    
    M_KPI[/"📊 [Module Archiving & KPI] Lưu trữ Thư viện & Tính KPI<br/>Knowledge Base & Reward Indexing"/]
    M_END(["🏆 Hoàn tất quy trình - Tôn vinh Thi đua<br/>Status: Closed & Awarded"])

    M_START --> M_AUTH --> M_ROLE
    M_ROLE -->|Công nhân / Cán bộ| M_REP
    M_ROLE -->|Ban Giám Đốc / Admin| M_KPI
    
    M_REP --> M_DUP
    M_DUP -- Có trùng lặp --> M_DUP_ERR
    M_DUP -- Hợp lệ --> M_AI
    
    M_AI --> M_SLA
    M_SLA -- Hết giờ (Timeout) --> M_TIMEOUT
    M_SLA -- Đạt SLA (3/3 hoàn thành) --> M_APPROVE
    
    M_APPROVE --> M_SCOPE
    M_SCOPE -- Vượt cấp / Vượt ngân sách --> M_SOS
    M_SCOPE -- Trong thẩm quyền --> M_MAINT
    M_SOS --> M_MAINT
    
    M_MAINT --> M_INSPECT
    M_INSPECT -- Không đạt --> M_MAINT
    M_INSPECT -- Đạt --> M_MONITOR
    
    M_MONITOR --> M_RECUR
    M_RECUR -- Có tái diễn --> M_AI
    M_RECUR -- Không tái diễn --> M_KPI --> M_END

    class M_START,M_END startEnd;
    class M_AUTH,M_APPROVE,M_MAINT,M_MONITOR process;
    class M_ROLE,M_DUP,M_SLA,M_SCOPE,M_INSPECT,M_RECUR decision;
    class M_REP,M_KPI inputOutput;
    class M_AI aiEngine;
    class M_DUP_ERR,M_TIMEOUT,M_SOS alertError;
```

---

### 2. Luồng A: Đăng Nhập & Phân Quyền RBAC (Auth & Permissions)

Quy trình xác thực người dùng, phân loại vai trò và kiểm soát an ninh 2 lớp (Server Guard & Whitelist Guard):

```mermaid
flowchart TD
    classDef startEnd fill:#1b5e20,stroke:#2e7d32,color:#ffffff,stroke-width:2px;
    classDef process fill:#1565c0,stroke:#1e88e5,color:#ffffff,stroke-width:2px;
    classDef decision fill:#e65100,stroke:#fb8c00,color:#ffffff,stroke-width:2px;
    classDef inputOutput fill:#00695c,stroke:#00897b,color:#ffffff,stroke-width:2px;
    classDef aiEngine fill:#4a148c,stroke:#7b1fa2,color:#ffffff,stroke-width:2px;
    classDef alertError fill:#b71c1c,stroke:#e53935,color:#ffffff,stroke-width:2px;

    A_START(["🚪 Nguời dùng truy cập App / Web Admin<br/>Access Route /work or /admin"])
    A_INPUT[/"🔑 Nhập Mã số nhân viên (MSNV) / Mật khẩu hoặc Quick Role<br/>Credential Input / Role Selector"/]
    A_CHECK_AUTH{"Kiểm tra Credentials hợp lệ?<br/>verifyServerAuth()"}
    A_ERR_AUTH["🛑 Đăng nhập thất bại - Sai MSNV hoặc Mật khẩu<br/>HTTP 401 Unauthorized"]
    
    A_CHECK_ROLE{"Phân loại vai trò người dùng?<br/>Check role_code & level_rank"}
    
    A_ADMIN_CHECK{"Kiểm tra Admin Whitelist?<br/>adminWhitelist.ts (202608001 / 201809012)"}
    A_ADMIN_ALLOW["🟢 Phân quyền SYSTEM_ADMIN<br/>Full Access + Admin Portal Mode"]
    A_ADMIN_DENY["🚫 Chặn Admin Mode - Redirect /work<br/>HTTP 403 Forbidden"]
    
    A_ROLE_DIR["👑 Ban Giám Đốc (TONG_GIAM_DOC / BGĐ)<br/>View Dashboard, Approval SOS, Distribute Judges"]
    A_ROLE_DEPT["👔 Trưởng Phòng / Phó GĐ (TRUONG_PHONG)<br/>Feasibility Approval, Assign Maintenance Task"]
    A_ROLE_CI["⭐ Hội Đồng Ban Giám Khảo (TEAM_CI / BGK)<br/>Evaluate 100-pt Barem, Star Rating, Competition Tag"]
    A_ROLE_LINE["👷 Line Leader / Kỹ sư hiện trường (Tech)<br/>5 Whys Interviewee, On-site Inspection"]
    A_ROLE_MAINT["🔧 Đội ngũ Bảo trì MMTB (Maintenance)<br/>Execute Ticket, Update Spare Parts & Photos"]
    A_ROLE_WORKER["👤 Công nhân / Nhân viên (WORKER)<br/>Submit Proposal, Track Personal Status, Vote"]

    A_HOME(["🖥️ Chuyển hướng về Trang Chủ nghiệp vụ theo Role<br/>Role-based Landing Workspace"])

    A_START --> A_INPUT --> A_CHECK_AUTH
    A_CHECK_AUTH -- Không hợp lệ --> A_ERR_AUTH
    A_CHECK_AUTH -- Hợp lệ --> A_CHECK_ROLE
    
    A_CHECK_ROLE -->|Mã Vai Trò: Admin| A_ADMIN_CHECK
    A_ADMIN_CHECK -- Thuộc Whitelist --> A_ADMIN_ALLOW --> A_HOME
    A_ADMIN_CHECK -- Không thuộc Whitelist --> A_ADMIN_DENY --> A_HOME
    
    A_CHECK_ROLE -->|Mã Vai Trò: BGĐ| A_ROLE_DIR --> A_HOME
    A_CHECK_ROLE -->|Mã Vai Trò: Trưởng Phòng| A_ROLE_DEPT --> A_HOME
    A_CHECK_ROLE -->|Mã Vai Trò: BGK/CI| A_ROLE_CI --> A_HOME
    A_CHECK_ROLE -->|Mã Vai Trò: Line Leader/Tech| A_ROLE_LINE --> A_HOME
    A_CHECK_ROLE -->|Mã Vai Trò: Bảo Trì| A_ROLE_MAINT --> A_HOME
    A_CHECK_ROLE -->|Mã Vai Trò: Công Nhân| A_ROLE_WORKER --> A_HOME

    class A_START,A_HOME startEnd;
    class A_ADMIN_ALLOW,A_ROLE_DIR,A_ROLE_DEPT,A_ROLE_CI,A_ROLE_LINE,A_ROLE_MAINT,A_ROLE_WORKER process;
    class A_CHECK_AUTH,A_CHECK_ROLE,A_ADMIN_CHECK decision;
    class A_INPUT inputOutput;
    class A_ERR_AUTH,A_ADMIN_DENY alertError;
```

---

### 3. Luồng B: Tiếp Nhận Báo Cáo & Chống Trùng Lặp (Issue Reporting & Duplicate Guard)

Quy trình nhập liệu báo cáo sự cố / sáng kiến, đối soát chống trùng lặp tự động và kích hoạt đếm ngược SLA:

```mermaid
flowchart TD
    classDef startEnd fill:#1b5e20,stroke:#2e7d32,color:#ffffff,stroke-width:2px;
    classDef process fill:#1565c0,stroke:#1e88e5,color:#ffffff,stroke-width:2px;
    classDef decision fill:#e65100,stroke:#fb8c00,color:#ffffff,stroke-width:2px;
    classDef inputOutput fill:#00695c,stroke:#00897b,color:#ffffff,stroke-width:2px;
    classDef aiEngine fill:#4a148c,stroke:#7b1fa2,color:#ffffff,stroke-width:2px;
    classDef alertError fill:#b71c1c,stroke:#e53935,color:#ffffff,stroke-width:2px;

    B_START(["📋 Bắt đầu tạo mới Báo cáo / Sáng kiến<br/>Click 'Tạo mới báo cáo'"])
    B_SELECT{"Chọn hành động thao tác?<br/>Select User Action"}
    
    B_ACTION_SEARCH[/"🔍 Tra cứu lịch sử / Tra cứu PO-Style<br/>PO Number & Historical Lookup"/]
    B_ACTION_FORM[/"📝 Mở Form Nhập Liệu Báo Cáo (Issue Report Form)<br/>Multi-step Form Interface"/]
    
    B_INPUT[/"✍️ Nhập thông tin: Khu vực, Line, Team, Category, PO, Severity, Ảnh/Video<br/>Fields: Region, Line, Category, Photos via Cloudinary"/]
    
    B_DUP_ENGINE("🤖 Thuật toán kiểm tra chống trùng lặp (Prevent Duplicate Engine)<br/>Check Hash: Line + Category + PO + Time Window")
    B_DUP_CHECK{"Phát hiện báo cáo bị trùng lặp?<br/>Is Duplicate Detected?"}
    
    B_DUP_ALERT["⚠️ Cảnh Báo Trùng Lặp: Đã có sự cố tương tự đang mở!<br/>Gợi ý: Gộp chung vào Ticket đang xử lý"]
    B_DUP_DECIDE{"Người dùng chọn gộp ticket?<br/>Merge or Continue?"}
    B_MERGE["🔗 Gộp dữ liệu vào Issue hiện hữu & Cập nhật lượt báo cáo<br/>Status: Ticket Merged"]
    
    B_SAVE["🗄️ Ghi dữ liệu vào D1 Database (Bảng ci_kaizen_proposals)<br/>Status: SUBMITTED / CHO_REVIEW"]
    B_TIMER("⏱️ Kích hoạt SLA Investigation Countdown (15 phút)<br/>Start 15-Min Investigation Timer")
    
    B_NOTIF("💬 Zalo Bot & Push Notification Relay<br/>Send Instant Alert to Line Leader, Dept Head & Maintenance")
    
    B_END(["🚀 Chuyển giao thông tin sang Phân hệ AI 5 Whys<br/>Ready for AI Investigation"])

    B_START --> B_SELECT
    B_SELECT -->|Tìm kiếm PO/Lịch sử| B_ACTION_SEARCH
    B_SELECT -->|Tạo mới báo cáo| B_ACTION_FORM --> B_INPUT
    
    B_INPUT --> B_DUP_ENGINE --> B_DUP_CHECK
    B_DUP_CHECK -- Phát hiện trùng --> B_DUP_ALERT --> B_DUP_DECIDE
    B_DUP_DECIDE -- Đồng ý gộp --> B_MERGE --> B_END
    B_DUP_DECIDE -- Vẫn tạo mới --> B_SAVE
    B_DUP_CHECK -- Không trùng lặp --> B_SAVE
    
    B_SAVE --> B_TIMER --> B_NOTIF --> B_END

    class B_START,B_END startEnd;
    class B_MERGE,B_SAVE process;
    class B_SELECT,B_DUP_CHECK,B_DUP_DECIDE decision;
    class B_ACTION_SEARCH,B_ACTION_FORM,B_INPUT inputOutput;
    class B_DUP_ENGINE,B_TIMER,B_NOTIF aiEngine;
    class B_DUP_ALERT alertError;
```

---

### 4. Luồng C: Xử Lý AI 5 Whys & Quản Lý SLA (AI Engine & SLA Control)

Quy trình phỏng vấn độc lập nhiều vai trò bằng AI 5 Whys, kiểm soát thời gian SLA 15 phút và tự động đề xuất giải pháp:

```mermaid
flowchart TD
    classDef startEnd fill:#1b5e20,stroke:#2e7d32,color:#ffffff,stroke-width:2px;
    classDef process fill:#1565c0,stroke:#1e88e5,color:#ffffff,stroke-width:2px;
    classDef decision fill:#e65100,stroke:#fb8c00,color:#ffffff,stroke-width:2px;
    classDef inputOutput fill:#00695c,stroke:#00897b,color:#ffffff,stroke-width:2px;
    classDef aiEngine fill:#4a148c,stroke:#7b1fa2,color:#ffffff,stroke-width:2px;
    classDef alertError fill:#b71c1c,stroke:#e53935,color:#ffffff,stroke-width:2px;

    C_START(["🤖 AI 5 Whys Engine Tiếp Nhận Issue<br/>Trigger 5 Whys Investigation Module"])
    
    C_INTERVIEW("🎙️ Hệ thống AI thực hiện phỏng vấn độc lập các vai trò<br/>Independent Interview: Worker, Tech, Line Leader")
    C_INPUT_ROLE[/"💬 Nhập câu trả lời 5 Nguyên nhân (5 Whys Data Entry)<br/>Input: Why 1 -> Why 2 -> Why 3 -> Why 4 -> Why 5"/]
    
    C_CHECK_SLA{"Kiểm tra bộ đếm SLA (15 phút Countdown)?<br/>Is SLA Timer Expired?"}
    
    C_TIMEOUT_ALERT["🚨 Cảnh Báo Quá Giờ SLA (SLA Timeout Event!)<br/>Trạng thái: Hết hạn 15 phút điều tra"]
    C_LOCK_FORM["🔒 Tự động Khóa Form Nhập Liệu & Phát Alert Escalation<br/>Status: Form Locked & Alert Sent to Dept Head"]
    
    C_CHECK_COMPLETE{"Kiểm tra số lượng phỏng vấn hoàn thành?<br/>Target Criteria: 3/3 Roles Responded"}
    
    C_AI_SYNTH("🧠 AI Engine Tổng Hợp Dữ Liệu Phỏng Vấn (AI Synthesis Engine)<br/>Analyze root causes & synthesize pattern")
    C_PROPOSE_OUTPUT[/"💡 AI Đề Xuất Nguyên Nhân Gốc Rễ & Giải Pháp Khắc Phục<br/>Output: Suggested Root Cause & Corrective Action"/]
    
    C_END(["⚖️ Chuyển kết quả sang Luồng Phê Duyệt Của Quản Lý<br/>Proceed to Manager Feasibility Approval"])

    C_START --> C_INTERVIEW --> C_INPUT_ROLE --> C_CHECK_SLA
    
    C_CHECK_SLA -- Hết 15 phút (Timeout) --> C_TIMEOUT_ALERT --> C_LOCK_FORM --> C_AI_SYNTH
    C_CHECK_SLA -- Chưa hết giờ --> C_CHECK_COMPLETE
    
    C_CHECK_COMPLETE -- Chưa đủ 3/3 câu trả lời --> C_INTERVIEW
    C_CHECK_COMPLETE -- Đã hoàn tất đủ 3/3 --> C_AI_SYNTH
    
    C_AI_SYNTH --> C_PROPOSE_OUTPUT --> C_END

    class C_START,C_END startEnd;
    class C_CHECK_SLA,C_CHECK_COMPLETE decision;
    class C_INPUT_ROLE,C_PROPOSE_OUTPUT inputOutput;
    class C_INTERVIEW,C_AI_SYNTH aiEngine;
    class C_TIMEOUT_ALERT,C_LOCK_FORM alertError;
```

---

### 5. Luồng D: Phê Duyệt, Bảo Trì & Giám Sát Tái Diễn (Approval & Execution)

Quy trình phê duyệt giải pháp (Bước 3), phân công bảo trì, nghiệm thu tại chỗ và giám sát lặp lại sự cố (24-48h):

```mermaid
flowchart TD
    classDef startEnd fill:#1b5e20,stroke:#2e7d32,color:#ffffff,stroke-width:2px;
    classDef process fill:#1565c0,stroke:#1e88e5,color:#ffffff,stroke-width:2px;
    classDef decision fill:#e65100,stroke:#fb8c00,color:#ffffff,stroke-width:2px;
    classDef inputOutput fill:#00695c,stroke:#00897b,color:#ffffff,stroke-width:2px;
    classDef aiEngine fill:#4a148c,stroke:#7b1fa2,color:#ffffff,stroke-width:2px;
    classDef alertError fill:#b71c1c,stroke:#e53935,color:#ffffff,stroke-width:2px;

    D_START(["⚖️ Bắt đầu luồng Phê Duyệt & Phân Công Xử Lý<br/>Start Approval & Maintenance Assignment"])
    
    D_SCOPE_CHECK{"Kiểm tra phạm vi ảnh hưởng & ngân sách?<br/>Within Line/Shop or Cross-Department / High Cost?"}
    
    D_ESCALATE_ALERT["📢 Cảnh báo vượt phạm vi / vượt thẩm quyền!<br/>Scope Limit Exceeded Event"]
    D_SOS_DIR["🚨 Gửi thông báo SOS khẩn cấp tới Giám Đốc Nhà Máy (Director)<br/>Escalation Notification to Ban Giám Đốc"]
    
    D_APPROVE_LEADER["👨‍💼 Line Leader / Trưởng Phòng duyệt Root Cause & Solution<br/>Status: PHE_DUYET (Bước 3)"]
    D_REJECT_STEP3["🛑 Từ chối phê duyệt triển khai<br/>Status: TU_CHOI_TRIEN_KHAI -> Stop Process"]
    
    D_ASSIGN_TASK["📌 Dept Head phân công Ticket nhiệm vụ cho Kỹ thuật Bảo trì<br/>Assign Maintenance Engineer/Tech"]
    
    D_MAINT_EXEC[/"🔧 Kỹ thuật viên bảo trì thực hiện sửa chữa MMTB<br/>Replace parts, record time, capture photos"/]
    D_SUBMIT_MAINT["📤 Nộp báo cáo hoàn thành sửa chữa hiện trường<br/>Status: Pending Inspection"]
    
    D_INSPECT_CHECK{"👷 Line Leader kiểm tra tại chỗ (On-site Inspection)?<br/>Verify physical result on factory floor"}
    D_INSPECT_FAIL["❌ Kiểm tra Không Đạt - Yêu cầu sửa chữa lại<br/>Status: Re-opened & Work Re-assigned"]
    
    D_MONITOR("👁️ Kích hoạt giám sát tái diễn tự động (Monitoring 24-48h)<br/>Automated Recurrence Monitoring Engine")
    D_RECUR_CHECK{"Phát hiện sự cố lặp lại trong 48h?<br/>Did Issue Recur?"}
    
    D_END(["🏁 Hoàn thành xử lý hiện trường - Chuyển sang Đóng & Lưu Trữ<br/>Proceed to Archiving & KPI Module"])

    D_START --> D_SCOPE_CHECK
    D_SCOPE_CHECK -- Vượt cấp / Vượt ngân sách --> D_ESCALATE_ALERT --> D_SOS_DIR --> D_APPROVE_LEADER
    D_SCOPE_CHECK -- Trong phạm vi nhà xưởng --> D_APPROVE_LEADER
    
    D_APPROVE_LEADER -->|Từ chối| D_REJECT_STEP3
    D_APPROVE_LEADER -->|Phê duyệt| D_ASSIGN_TASK
    
    D_ASSIGN_TASK --> D_MAINT_EXEC --> D_SUBMIT_MAINT --> D_INSPECT_CHECK
    
    D_INSPECT_CHECK -- Không đạt --> D_INSPECT_FAIL --> D_MAINT_EXEC
    D_INSPECT_CHECK -- Đạt tiêu chuẩn --> D_MONITOR --> D_RECUR_CHECK
    
    D_RECUR_CHECK -- Có tái diễn --> D_INSPECT_FAIL
    D_RECUR_CHECK -- Không tái diễn (Tốt) --> D_END

    class D_START,D_END startEnd;
    class D_APPROVE_LEADER,D_ASSIGN_TASK,D_SUBMIT_MAINT process;
    class D_SCOPE_CHECK,D_INSPECT_CHECK,D_RECUR_CHECK decision;
    class D_MAINT_EXEC inputOutput;
    class D_MONITOR aiEngine;
    class D_ESCALATE_ALERT,D_SOS_DIR,D_REJECT_STEP3,D_INSPECT_FAIL alertError;
```

---

### 6. Luồng E: Kết Thúc, Đóng Issue & Lưu Trữ KPI (Archiving & Indexing)

Quy trình đánh giá chuyên môn (Bước 5), đóng ticket, index dữ liệu tiết kiệm thời gian/VNĐ vào KPI và gắn nhãn thi đua:

```mermaid
flowchart TD
    classDef startEnd fill:#1b5e20,stroke:#2e7d32,color:#ffffff,stroke-width:2px;
    classDef process fill:#1565c0,stroke:#1e88e5,color:#ffffff,stroke-width:2px;
    classDef decision fill:#e65100,stroke:#fb8c00,color:#ffffff,stroke-width:2px;
    classDef inputOutput fill:#00695c,stroke:#00897b,color:#ffffff,stroke-width:2px;
    classDef aiEngine fill:#4a148c,stroke:#7b1fa2,color:#ffffff,stroke-width:2px;
    classDef alertError fill:#b71c1c,stroke:#e53935,color:#ffffff,stroke-width:2px;

    E_START(["🏁 Bắt đầu luồng Đóng Issue & Lưu Trữ<br/>Start Closure & Archiving Process"])
    
    E_FINAL_NOTIF("💬 Gửi Cảnh báo Hoàn thành Cuối cùng (Final Completion Alert)<br/>Notify Director, Dept Head & Proposer via Zalo Bot")
    
    E_EVAL_BGK["👑 Hội Đồng BGK / Team CI Đánh Giá Hiệu Quả (Bước 5)<br/>Grade 100-pt Barem & Star Rating (0.5 - 5.0)"]
    E_EVAL_CHECK{"Kết quả đánh giá chuyên môn?<br/>Pass or Fail Criteria?"}
    
    E_FAIL_EVAL["❌ Không Đạt Yêu Cầu Chuyên Môn<br/>Status: KHONG_DAT_YEU_CAU -> Archive Record"]
    
    E_SAVE_KB[/"📦 Đóng Issue & Lưu Trữ Thư Viện Kiến Thức (Knowledge Base)<br/>Status: LUU_TRU (ci_kaizen_proposals)"/]
    
    E_INDEX_KPI("📊 Tự động Index Số Giờ Tiết Kiệm & Hiệu Quả VNĐ vào KPI<br/>Calculate saved_seconds & efficiency_value_vnd")
    
    E_BGK_TAG{"BGK / Admin Gắn Nhãn Sáng Kiến Thi Đua?<br/>Attach Competition Tag (is_thi_dua = 1)"}
    
    E_TAG_YES["🏆 Gắn nhãn THI_DUA - Đưa vào danh sách xét thưởng tháng<br/>Status: THI_DUA"]
    E_TAG_NO["📦 Giữ trạng thái Lưu trữ tiêu chuẩn<br/>Status: LUU_TRU"]
    
    E_END(["🎉 Hoàn tất quy trình vòng đời Kaizen & Sự cố MMTB<br/>Lifecycle Successfully Completed"])

    E_START --> E_FINAL_NOTIF --> E_EVAL_BGK --> E_EVAL_CHECK
    
    E_EVAL_CHECK -- Không đạt --> E_FAIL_EVAL --> E_SAVE_KB
    E_EVAL_CHECK -- Đạt tiêu chuẩn --> E_SAVE_KB
    
    E_SAVE_KB --> E_INDEX_KPI --> E_BGK_TAG
    
    E_BGK_TAG -- Có gắn nhãn --> E_TAG_YES --> E_END
    E_BGK_TAG -- Không gắn nhãn --> E_TAG_NO --> E_END

    class E_START,E_END startEnd;
    class E_EVAL_BGK,E_TAG_YES,E_TAG_NO process;
    class E_EVAL_CHECK,E_BGK_TAG decision;
    class E_SAVE_KB inputOutput;
    class E_FINAL_NOTIF,E_INDEX_KPI aiEngine;
    class E_FAIL_EVAL alertError;
```

---

### 7. Luồng F: Các Phân Hệ Mở Rộng (Dashboard, Cảnh Báo Ban, Thư Viện & Thi Đua)

Cấu trúc các module phụ trợ gồm Dashboard chỉ số hiện trường, Cảnh báo Ban 2.2, Thư viện tra cứu nhanh và Cơ cấu giải thưởng:

```mermaid
flowchart TD
    classDef startEnd fill:#1b5e20,stroke:#2e7d32,color:#ffffff,stroke-width:2px;
    classDef process fill:#1565c0,stroke:#1e88e5,color:#ffffff,stroke-width:2px;
    classDef decision fill:#e65100,stroke:#fb8c00,color:#ffffff,stroke-width:2px;
    classDef inputOutput fill:#00695c,stroke:#00897b,color:#ffffff,stroke-width:2px;
    classDef aiEngine fill:#4a148c,stroke:#7b1fa2,color:#ffffff,stroke-width:2px;
    classDef alertError fill:#b71c1c,stroke:#e53935,color:#ffffff,stroke-width:2px;

    F_START(["🌐 Các Phân Hệ Mở Rộng Hệ Thống TBS II Platform<br/>Extended System Modules Architecture"])

    subgraph F_MOD1 ["📊 1. Phân Hệ Dashboard & Cảnh Báo Ban 2.2"]
        F1_CACHE("⚡ Multi-layer Cache (Server 30s TTL + Client localStorage SWR)<br/>Zero-latency Instant Badge Hydration")
        F1_BAN22["🚨 Module Cảnh Báo Ban 2.2: Tự động phát hiện bất thường hiện trường<br/>Early Anomaly Detection System"]
    end

    subgraph F_MOD2 ["📚 2. Thư Viện Sáng Kiến & Bộ Lọc Nhanh"]
        F2_FILTER[/"🗂️ Bộ Lọc Nhanh 5 Tab: Thi đua | Chờ phê duyệt | Chờ đánh giá | Đã đánh giá | Lưu trữ<br/>Quick Filter Tabs Interface"/]
        F2_REGION[/"📍 Quản lý Khu Vực: Kiên Giang 1 | Kiên Giang 2 | Kiên Giang 3 | Hoàn Thiện Đế<br/>Region, Product Group, Category & Date Filters"/]
        F2_SOCIAL["❤️ Cơ Chế Tương Tác: Like | View | Upvote | Bình luận | Multi-Judge Review<br/>Engagement & Evaluation Features"]
    end

    subgraph F_MOD3 ["🏆 3. Cơ Cấu Giải Thưởng Thi Đua Hàng Tháng (38 Giải - 8.5 Tr VNĐ)"]
        F3_AWARDS[/"🥇 Giải Nhất: 1 giải (1.000.000đ)<br/>🥈 Giải Nhì: 2 giải (500.000đ/giải)<br/>🥉 Giải Ba: 5 giải (300.000đ/giải)<br/>🎖️ Giải Tư: 10 giải (200.000đ/giải)<br/>🎗️ Giải KK: 20 giải (100.000đ/giải)"/]
    end

    F_END(["🏁 Đồng bộ toàn bộ dữ liệu lên CSDL Serverless Cloudflare D1<br/>Synced with D1 Database & Cloudinary"])

    F_START --> F_MOD1
    F_START --> F_MOD2
    F_START --> F_MOD3
    F_MOD1 --> F_END
    F_MOD2 --> F_END
    F_MOD3 --> F_END

    class F_START,F_END startEnd;
    class F1_CACHE aiEngine;
    class F1_BAN22 alertError;
    class F2_FILTER,F2_REGION,F3_AWARDS inputOutput;
    class F2_SOCIAL process;
```

---

## 🏗️ 2. KIẾN TRÚC TỔNG THỂ (HIGH-LEVEL ARCHITECTURE)

Sơ đồ Mermaid dưới đây mô tả kiến trúc phân lớp thực tế của hệ thống TBS II Platform:

```mermaid
flowchart TD
    subgraph CLIENT_LAYER["🖥️ Tầng Trình Duyệt & Giao Diện (Client Layer)"]
        UI["Next.js 16 App Router (React 19 / TailwindCSS)"]
        SWR["📁 Client Persistence Storage (localStorage 'tbs_kaizen_stats_v1')"]
        UI <--> SWR
    end

    subgraph EDGE_LAYER["⚡ Tầng Serverless Edge (Cloudflare Workers Engine)"]
        WORKER["⚙️ worker.js Router & Middleware Guard"]
        AUTH_GUARD["🔐 Admin Whitelist Guard (adminWhitelist.ts)"]
        CACHE_MEM["⚡ Server In-Memory Cache (30s TTL - KAIZEN_STATS_CACHE)"]
        
        WORKER --> AUTH_GUARD
        WORKER <--> CACHE_MEM
    end

    subgraph DATA_LAYER["🗄️ Tầng Cơ Sở Dữ Liệu & Bộ Lưu Trữ (Data Layer)"]
        D1[("🗄️ Cloudflare D1 Serverless Database (SQLite)")]
        CLOUDINARY["☁️ Cloudinary Storage (Hình ảnh & Video Kaizen)"]
    end

    UI <-->|HTTP REST / JSON API| WORKER
    UI -.->|Direct Media Upload| CLOUDINARY
    WORKER <-->|SQL Queries / Binds| D1
```

---

## 📐 3. SƠ ĐỒ THỰC THỂ QUAN HỆ CSDL (D1 DATABASE ERD)

Toàn bộ dữ liệu sản xuất được lưu trữ trong CSDL Cloudflare D1 (`vpchuoiskechers`). Sơ đồ Mermaid ERD mô tả các bảng chính và mối quan hệ:

```mermaid
erDiagram
    USERS ||--o{ KAIZEN_PROPOSALS : "nộp đề xuất"
    USERS ||--o{ EXPERT_EVALUATIONS : "chấm barem 100đ"
    USERS ||--o{ AUDIT_LOGS : "thực hiện thao tác"
    
    KAIZEN_PROPOSALS ||--o{ KAIZEN_ASSIGNMENTS : "được phân công BGK"
    KAIZEN_PROPOSALS ||--o{ EXPERT_EVALUATIONS : "nhận điểm chuyên môn"
    KAIZEN_PROPOSALS ||--o{ KAIZEN_EVALUATIONS : "nhận điểm sao"
    KAIZEN_PROPOSALS ||--o{ KAIZEN_STATUS_HISTORY : "lưu vết lịch sử duyệt"
    
    KAIZEN_PROPOSALS {
        string id PK
        string code "Mã đề xuất KZ-KG1-2026-xxxx"
        string title "Tên sáng kiến"
        string registration_type "CHO_DANH_GIA | LUU_TRU"
        string sub_status "CHO_REVIEW | CHO_DANH_GIA | DA_DANH_GIA..."
        string approval_status "PENDING | PHE_DUYET | TU_CHOI"
        string region "Kiên Giang 1 | Kiên Giang 2 | Kiên Giang 3 | Hoàn thiện đế"
        string department "Tên xưởng / phòng ban"
        string proposer_name "Họ tên công nhân"
        string proposer_emp_code "MSNV"
        int time_before_seconds "Thời gian Trước (s)"
        int time_after_seconds "Thời gian Sau (s)"
        int saved_seconds "Tiết kiệm (s)"
        int efficiency_value_vnd "Hiệu quả (VNĐ/đôi)"
        int is_thi_dua "Flag thi đua (1/0)"
        real average_score "Điểm TB 100đ"
        real avg_rating "Điểm sao 0.5-5.0"
        datetime created_at
    }

    KAIZEN_ASSIGNMENTS {
        string id PK
        string proposal_id FK
        string judge_emp_code "MSNV sếp BGK"
        string judge_name "Họ tên sếp BGK"
        string status "PENDING | COMPLETED"
        datetime assigned_at
    }

    EXPERT_EVALUATIONS {
        string id PK
        string proposal_id FK
        string evaluator_emp_code FK
        real criterion1_score "Thời gian (0-35đ)"
        real criterion2_score "Công nghệ (0-20đ)"
        real criterion3_score "Chất lượng (0-20đ)"
        real criterion4_score "5S (0-15đ)"
        real criterion5_score "An toàn (0-10đ)"
        real total_score "Tổng điểm (0-100đ)"
        string status "DRAFT | CONFIRMED"
        datetime confirmed_at
    }

    KAIZEN_STATUS_HISTORY {
        int id PK
        string proposal_id FK
        string from_status "Trạng thái cũ"
        string to_status "Trạng thái mới"
        string action "APPROVE | REJECT | SUBMIT..."
        string actor_id "MSNV thực hiện"
        string actor_name "Tên người thực hiện"
        string note "Ghi chú phê duyệt / lý do"
        datetime created_at
    }

    USERS {
        string id PK
        string emp_code "MSNV"
        string name "Họ tên"
        string role_code "SYSTEM_ADMIN | TONG_GIAM_DOC | TRUONG_PHONG..."
        string department "Phòng ban"
        int level_rank "Cấp bậc (0-6)"
    }

    AUDIT_LOGS {
        string id PK
        string actor_emp_code
        string module "ci_kaizen | admin | business_trip"
        string action "APPROVE | ACCESS_DENIED..."
        string target_id
        string ip_address
        datetime created_at
    }
```

---

## 🔐 4. PHÂN QUYỀN HỆ THỐNG & ADMIN WHITELIST GUARD

### 4.1 Danh Sách Quyền Hạn (Role-Based Access Control - RBAC)

| Vai Trò (Role Code) | Mô Tả | Quyền Hạn Chi Tiết |
| :--- | :--- | :--- |
| **`SYSTEM_ADMIN`** | Quản trị viên hệ thống | Quản trị toàn quyền, phân công BGK, duyệt nhãn Thi đua, truy cập Admin Portal (`/admin`). |
| **`TONG_GIAM_DOC` / `BGĐ`** | Ban Giám Đốc / TGĐ | Xem toàn bộ báo cáo Dashboard, phân công BGK, phê duyệt cấp cao. |
| **`TRUONG_PHONG` / `P.GĐ`** | Trưởng phòng / Phó GĐ nhà máy | Phê duyệt triển khai Bước 3 (`PHE_DUYET`/`TU_CHOI`), nhập số liệu thời gian Trước/Sau. |
| **`TEAM_CI` / `BGK`** | Hội đồng Ban Giám Khảo Kaizen | Đánh giá hiệu quả Bước 5 (Đạt / Không đạt), chấm điểm barem 100đ / chấm sao, gắn nhãn Thi đua. |
| **`WORKER` / `EMPLOYEE`** | Công nhân / Nhân viên | Nộp đề xuất sáng kiến mới, theo dõi trạng thái đề xuất cá nhân, bình chọn bài viết. |

---

### 4.2 Sơ Đồ Kiểm Soát An Ninh Trang Admin (`/admin`)

Hệ thống bảo mật 2 lớp (Lớp Giao diện & Lớp Server Guard):

```mermaid
flowchart TD
    A["👤 Người Dùng Truy Cập Đường Dẫn /admin"] --> B["🌐 Cloudflare Worker Server Guard (_worker.js)"]
    B --> C{"Kiểm tra verifyServerAuth()"}
    C -- Chưa Đăng Nhập --> D["🛑 Redirect về /login (HTTP 401)"]
    C -- Đã Đăng Nhập --> E{"Kiểm tra user.empCode trong adminWhitelist.ts"}
    
    E -- Có trong Whitelist\n(202608001 / 201809012) --> F["🟢 Cho phép truy cập Cổng Quản Trị Admin"]
    E -- Không thuộc Whitelist --> G["🚫 Chặn Truy Cập (HTTP 403 Forbidden)\nRedirect về /work + Ghi log audit_logs"]

    F --> H["🖥️ Header.tsx hiển thị nút 'Trang quản trị (Admin mode)'"]
    G --> I["🙈 Header.tsx ẨN HOÀN TOÀN nút Admin khỏi DOM"]
```

> **Whitelist Cố Định Hiện Tại** (`web/src/lib/adminWhitelist.ts`):
> 1. **Phạm Nguyễn Anh Huy** (MSNV: `202608001` — Vai trò: Admin)
> 2. **Kiều Thanh Vũ** (MSNV: `201809012` — Vai trò: Phó Giám Đốc)

---

## 📑 5. BẢN ĐỒ THƯ MỤC VÀ TÀI LIỆU CHI TIẾT (DOCUMENTATION INDEX)

Để tránh quá tải nội dung trong một file duy nhất, bộ tài liệu được chia thành các tài liệu chuyên biệt:

| Tên Tài Liệu | Vị Trí Tệp | Nội Dung Trọng Tâm |
| :--- | :--- | :--- |
| 🔄 **Vòng Đời & State Machine Kaizen** | [`docs/MODULE_KAIZEN_STATE_MACHINE.md`](file:///d:/Work/KG-KAIZEN/docs/MODULE_KAIZEN_STATE_MACHINE.md) | Sơ đồ chuyển đổi trạng thái 5 bước (`stateDiagram-v2`), Sequence Diagram phê duyệt, chấm điểm barem 100đ & SWR hydration F5. |
| ⚙️ **API Reference & Database Schema** | [`docs/SYSTEM_ARCHITECTURE_API_REFERENCE.md`](file:///d:/Work/KG-KAIZEN/docs/SYSTEM_ARCHITECTURE_API_REFERENCE.md) | Bảng tra cứu toàn bộ 17 API endpoints trong `_worker.js`, cấu trúc CSDL D1 và mô tả kiến trúc Cache đa tầng. |
| ⚡ **Sidebar Badge Stats & Cache Architecture** | [`web/src/modules/ci/README.md`](file:///d:/Work/KG-KAIZEN/web/src/modules/ci/README.md) | Chi tiết tối ưu tốc độ badge Sidebar, Server Cache 30s + Invalidate theo sự kiện & Client `localStorage` SWR. |

---

## 🚀 6. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN (GETTING STARTED)

### 6.1 Yêu Cầu Môi Trường
- **Node.js**: Phiên bản `>= 20.0.0` (Khuyên dùng Node.js v22 LTS).
- **Package Manager**: `npm` v10+.
- **Wrangler CLI**: `wrangler` v4 (`npm install -g wrangler`).

### 6.2 Các Bước Thực Hiện
```bash
# 1. Clone kho lưu trữ
git clone https://github.com/tbsgroup2026/thkiengiangshoes.git
cd thkiengiangshoes

# 2. Cài đặt Dependencies cho phân hệ Web
cd web
npm install

# 3. Chạy môi trường Local Development Server
npm run dev
# Mở trình duyệt tại: http://localhost:3000

# 4. Kiểm tra lỗi TypeScript trước khi deploy
npx tsc --noEmit

# 5. Build ứng dụng tĩnh và deploy lên Cloudflare Workers
npm run build
npx wrangler deploy --name thkiengiangshoes
```

---

## ⚠️ 7. GIỚI HẠN HIỆN TẠI & NHỮNG ĐIỂM CHƯA XÁC ĐỊNH

### 7.1 Giới Hạn Hiện Tại (Known Limitations)
- **Đồng bộ đa tab (Multi-tab Sync)**: Trường hợp mở cùng lúc 2 tab trình duyệt, việc nộp bài ở Tab 1 sẽ cập nhật lập tức badge ở Tab 1; Tab 2 sẽ thấy badge mới sau lượt tương tác tiếp theo hoặc khi bấm refresh.

### 7.2 Những Phần Chưa Xác Định — Cần Bổ Sung (Undefined Areas)
- **Phân hệ Kho & Logistics (`06. Kho & Logistics`)**: Hiện tại đang hiển thị giao diện chờ phát triển ("Coming Soon"), chưa có schema bảng CSDL D1 chính thức.
- **Tích hợp IoT PLC Máy Móc Trực Tiếp**: Mới chỉ hỗ trợ quản lý Ticket bảo trì MMTB; chưa có cổng websocket nhận dữ liệu cảm biến trực tiếp theo thời gian thực từ dây chuyền nhà máy.

---

> **Tài liệu Kỹ thuật Tổng thể Ban Hành Ngày**: `28/08/2026`  
> **Tác giả**: AI Agent Pair Programming & Ban Công Nghệ TBS Group
