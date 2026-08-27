# 📊 GAP ANALYSIS — Frontend (Antigravity) vs Backend (Kiro)
**Hoàn thành ngày 21/08/2026 — Phát hiện thiếu sót dữ liệu giữa 4 màn hình Frontend và Schema Backend hiện tại**

---

## 📋 TÓM TẮT THỰC HIỆN

| Aspect | Trạng Thái |
|--------|-----------|
| **Frontend 4 Screens** | ✅ Hoàn thành (Antigravity) |
| **Frontend Components Scanned** | KaizenFiveStepSubmitForm, KaizenDashboard, KaizenEarlyWarning, CIModule |
| **Backend DB Schema** | Existing: ci_kaizen_proposals (21 columns) |
| **Backend API Endpoints** | Existing: /api/ci-kaizen (basic CRUD) |
| **Gap Analysis Status** | 🔴 **CRITICAL GAPS FOUND** |

---

## 🔍 PHÂN TÍCH CHI TIẾT — FIELD/DỮ LIỆU FE CẦN VS BE CÓ

### **SCREEN 1: FORM ĐĂNG KÝ 5 BƯỚC (KaizenFiveStepSubmitForm.tsx)**

#### Bước 1: Đăng Ký & Chọn Nhóm Chủ Đề

| Field Frontend | Loại | DB Hiện Có? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| `proposerName` | TEXT | ✅ Có (proposer_name) | Tác giả hồ sơ | Không thay đổi |
| `proposerEmpCode` | TEXT | ✅ Có (proposer_emp_code) | Mã nhân viên | Không thay đổi |
| `proposerPosition` | TEXT | ❌ **CHƯA CÓ** | Vị trí công việc (VTCV) | **P0: Thêm cột `proposer_position`** |
| `factory` | TEXT | ✅ Có (factory) | Nhà máy/chi nhánh | Không thay đổi |
| `department` | TEXT | ✅ Có (department) | Tổ/xưởng làm việc | Không thay đổi |
| `region` | TEXT | ✅ Có (region) | Khu vực | Không thay đổi |
| `category` (id) | TEXT | ✅ Có (category) | 8 danh mục (PRODUCTIVITY, COST_SAVING, ...) | Không thay đổi |
| `categoryLabel` | TEXT | ✅ Có (category_label) | Nhãn danh mục ("3.Tăng Năng suất") | Không thay đổi |
| `topicGroup` | TEXT | ❌ **CHƯA CÓ** | Nhóm chủ đề lớn (NĂNG SUẤT / LÃNG PHÍ / AN TOÀN) | **P0: Thêm cột `topic_group`** (enum: PRODUCTIVITY_GROUP, WASTE_GROUP, SAFETY_GROUP, OTHER_GROUP) |
| `proposerMonth` | INTEGER | ❌ **CHƯA CÓ** | Tháng nộp hồ sơ | **P1: Thêm cột `proposed_month`** |
| `proposerYear` | INTEGER | ❌ **CHƯA CÓ** | Năm nộp hồ sơ | **P1: Thêm cột `proposed_year`** |

#### Bước 2: Triển Khai & Minh Chứng

| Field Frontend | Loại | DB Hiện Có? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| `title` | TEXT | ✅ Có (title) | Tên tiêu đề cải tiến | Không thay đổi |
| `beforeDescription` | TEXT | ✅ Có (before_description) | Mô tả hiện trạng cũ | Không thay đổi |
| `afterSolution` | TEXT | ✅ Có (after_solution) | Giải pháp cải tiến mới | Không thay đổi |
| `pricingDirection` | TEXT | ❌ **CHƯA CÓ** | Hướng đánh giá (THOI_GIAN \| TRI_GIA) | **P0: Thêm cột `pricing_direction`** |
| `timeBeforeSeconds` | INTEGER | ❌ **CHƯA CÓ** | Thời gian sản xuất trước (giây) | **P0: Thêm cột `time_before_seconds`** |
| `timeAfterSeconds` | INTEGER | ❌ **CHƯA CÓ** | Thời gian sản xuất sau (giây) | **P0: Thêm cột `time_after_seconds`** |
| `efficiencyValueVND` | INTEGER | ❌ **CHƯA CÓ** | Giá trị tiết kiệm (VNĐ) | **P0: Thêm cột `efficiency_value_vnd`** |
| `savedSeconds` (calculated) | INTEGER | ✅ Có (saved_seconds) | = timeBeforeSeconds - timeAfterSeconds | ✅ Backend tính tự động |
| `beforeImageUrl` | TEXT | ✅ Có (before_image_url) | Ảnh hiện trạng trước cải tiến | Không thay đổi |
| `afterImageUrl` | TEXT | ✅ Có (after_image_url) | Ảnh hiện trạng sau cải tiến | Không thay đổi |
| `beforeVideoUrl` | TEXT | ❌ **CHƯA CÓ** | Video hiện trạng trước | **P1: Thêm cột `before_video_url`** |
| `afterVideoUrl` | TEXT | ❌ **CHƯA CÓ** | Video hiện trạng sau | **P1: Thêm cột `after_video_url`** |

#### Bước 3: Hoàn Thiện Hồ Sơ

| Field Frontend | Loại | DB Hiện Có? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| `registrationType` | TEXT | ✅ Có (registration_type) | THI_DUA \| LUU_TRU | Không thay đổi |
| `productGroup` | TEXT | ❌ **CHƯA CÓ** | Nhóm SP/DV (Quai, Mũi, Gót, ...) | **P1: Thêm cột `product_group`** |
| `productCode` | TEXT | ❌ **CHƯA CÓ** | Mã hàng (SK-001, SK-002, ...) | **P1: Thêm cột `product_code`** |
| `quantity` | INTEGER | ❌ **CHƯA CÓ** | Số lượng đơn hàng | **P1: Thêm cột `product_quantity`** |
| `customer` | TEXT | ✅ Có (dept_code / customer implied) | Khách hàng (Skechers, Nike, Decathlon, ...) | Remap: sử dụng `dept_code` hoặc **P0: Thêm cột `customer_brand`** |

#### Bước 4: Xác Nhận Đơn Vị

| Field Frontend | Loại | DB Hiện Có? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| `supervisorName` | TEXT | ❌ **CHƯA CÓ** | Họ tên Quản lý/Tổ trưởng xác nhận | **P1: Thêm cột `supervisor_name`** |
| `hrSuggestor` | TEXT | ❌ **CHƯA CÓ** | Nhân sự đề xuất/hướng dẫn | **P1: Thêm cột `hr_suggestor_name`** |
| `departmentApprovalStatus` | TEXT | ❌ **CHƯA CÓ** | Trạng thái xác nhận: DA_XAC_NHAN / DANG_CHO / TU_CHOI | **P1: Thêm cột `dept_approval_status`** |

#### Bước 5: Nộp Trước Ngày 25

| Field Frontend | Loại | DB Hiện Có? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| `agreedToTerms` | BOOLEAN | ❌ **CHƯA CÓ** | Đồng ý Điều khoản nộp bài | **P2: Thêm cột `agreed_to_terms`** |
| `submissionDeadline` (auto) | DATETIME | ✅ Có (created_at) | Ngày 25 hàng tháng (calculated) | ✅ Backend tính tự động |
| `daysRemaining` (calculated) | INTEGER | N/A | Số ngày còn lại (calculated) | ✅ Frontend calculated |

---

### **SCREEN 2: THƯ VIỆN CẢI TIẾN & BỘ LỌC (CIModule.tsx - Library Tab)**

| Feature / Filter | Loại | DB Support? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| **Lọc theo 3 nhóm chủ đề** | FILTER | ⚠️ Có một phần | category & registration_type có, nhưng **thiếu `topic_group`** | **P0: Sử dụng `topic_group` khi được thêm** |
| **Lọc theo Thi đua / Lưu trữ** | FILTER | ✅ Có | registration_type | Không thay đổi |
| **Lọc theo trạng thái chấm điểm** | FILTER | ✅ Có một phần | sub_status (CHO_DANH_GIA / DA_DANH_GIA) | ✅ Sử dụng được |
| **Lọc theo Khu vực** | FILTER | ✅ Có | region | Không thay đổi |
| **Lọc theo Khách hàng (Brand)** | FILTER | ⚠️ Có một phần | dept_code \| customer, nhưng **không rõ ràng** | **P1: Remap dept_code → customer hoặc thêm cột `customer_brand`** |
| **Lọc theo Tháng / Năm** | FILTER | ✅ Có | created_at | ✅ Frontend parse created_at |
| **Tìm kiếm mã hàng** | SEARCH | ❌ **CHƯA CÓ** | Frontend cần tìm theo `product_code` | **P1: Thêm cột `product_code`** |
| **Tìm kiếm tiêu đề / mã hồ sơ** | SEARCH | ✅ Có | title / code | Không thay đổi |
| **Xem Grid / List Mode** | UI | ✅ Có | Frontend state management | Không thay đổi |
| **Hiển thị rating sao** | DISPLAY | ✅ Có | avg_rating / rating_count | Không thay đổi |
| **Hiển thị vote count** | DISPLAY | ✅ Có | vote_count | Không thay đổi |
| **Hiển thị view count** | DISPLAY | ✅ Có | view_count | Không thay đổi |

---

### **SCREEN 3: DASHBOARD THỐNG KÊ (KaizenDashboard.tsx)**

#### 6 Top KPI Cards

| KPI Metric | Dữ Liệu Cần | DB Hiện Có? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| **Tổng cải tiến (Total Count)** | COUNT(*) | ✅ Có | Đếm tất cả proposals | Không thay đổi |
| **Thi đua (Count)** | WHERE registration_type='THI_DUA' | ✅ Có | Filter by registration_type | Không thay đổi |
| **Lưu trữ (Count)** | WHERE registration_type='LUU_TRU' | ✅ Có | Filter by registration_type | Không thay đổi |
| **Cải tiến tháng hiện tại** | WHERE MONTH(created_at)=CURRENT_MONTH | ✅ Có | Filter by created_at | Không thay đổi |
| **Đã đánh giá (Evaluated)** | WHERE sub_status='DA_DANH_GIA' \| score_points>0 | ✅ Có | Filter by sub_status or score | Không thay đổi |
| **Trị giá (Total Value in Tr VNĐ)** | SUM(saved_seconds \* 0.5) \| SUM(efficiency_value_vnd) | ⚠️ **Tính toán sơ bộ** | Frontend tính: 1 giây = 0.5M VNĐ | **P0: Backend cần cập nhật logic để lấy `efficiency_value_vnd` khi có** |

#### 6 Biểu Đồ Thống Kê

| Chart | Dữ Liệu Cần | DB Support? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| **1. Số lượng theo Khu vực (Stacked Bar)** | GROUP BY region, COUNT(*), stacked by category | ✅ Có | region + category columns exist | Không thay đổi |
| **2. Giá trị theo Khu vực (Horizontal Bar)** | GROUP BY region, SUM(value) | ⚠️ Có một phần | Cần `efficiency_value_vnd` hoặc tính từ `saved_seconds` | **P0: Làm rõ logic tính value** |
| **3. Số lượng theo Phân loại (Horizontal Bar)** | GROUP BY category, COUNT(*) | ✅ Có | category column exists | Không thay đổi |
| **4. Giá trị theo Phân loại (Horizontal Bar)** | GROUP BY category, SUM(value) | ⚠️ Có một phần | Cần `efficiency_value_vnd` | **P0: Backend cập nhật tính toán** |
| **5. Số lượng theo Tháng (Line Chart T1-T12)** | GROUP BY MONTH(created_at), COUNT(*) | ✅ Có | created_at column exists | Không thay đổi |
| **6. Số lượng theo Khách hàng (Bar)** | GROUP BY customer/brand, COUNT(*) | ⚠️ Có một phần | dept_code không rõ ràng là brand | **P1: Remap hoặc thêm `customer_brand`** |
| **Top 5 Proposals** | ORDER BY score_points DESC, avg_rating DESC LIMIT 5 | ✅ Có | score_points + avg_rating | Không thay đổi |

---

### **SCREEN 4: CẢNH BÁO SỚM BAN 2.2 (KaizenEarlyWarning.tsx)**

| Alert Feature | Dữ Liệu Cần | DB Hiện Có? | Ghi Chú | Việc Cần Làm |
|---|---|:---:|---|---|
| **Countdown ngày 25** | Tính: 25 - today.getDate() | ✅ Logic FE | Frontend calculation | Không thay đổi |
| **Bài Thi đua chờ chấm** | WHERE registration_type='THI_DUA' AND (sub_status='CHO_DANH_GIA' OR score_points=0) | ✅ Có | registration_type + sub_status + score_points | Không thay đổi |
| **Thiếu minh chứng** | WHERE before_image_url IS NULL OR after_image_url IS NULL | ✅ Có | before/after_image_url columns | Không thay đổi |
| **KPI các khu vực vs target** | GROUP BY region, COUNT(*) vs HARDCODED targets | ⚠️ Có một phần | region grouped, nhưng **targets cứng** | **P1: Thêm bảng `regional_kpi_targets` hoặc config file** |
| **Overall Ban 2.2 completion %** | COUNT(*) / SUM(targets) * 100 | ⚠️ Có một phần | Cần targets định nghĩa rõ | **P1: Định nghĩa targets chuẩn per khu vực** |

#### Cảnh báo sắp hết hạn (Near Deadline Alert)

| Alert Type | Condition | DB Support? | Việc Cần Làm |
|---|---|:---:|---|
| **Deadline 25th warning (< 5 days)** | daysUntil25 <= 5 | ✅ Logic FE | Không thay đổi |
| **Marking red alert** | isNearDeadline = true | ✅ Logic FE | Không thay đổi |

---

## 🚨 CRITICAL GAPS — CẦN FIX SỰU TỪ (P0 PRIORITY)

### P0 — Bắt Buộc Làm Ngay (Ảnh Hưởng Chức Năng Form & Dashboard)

| # | Gap | Frontend Component | Backend Action | Estimate |
|---|---|---|---|---|
| **P0-1** | **Thiếu: `proposer_position`** (VTCV) | KaizenFiveStepSubmitForm Step 1 | Thêm cột `proposer_position` VARCHAR(255) to ci_kaizen_proposals | 15 min |
| **P0-2** | **Thiếu: `topic_group`** (Năng suất/Lãng phí/An toàn) | KaizenFiveStepSubmitForm Step 1 + CIModule Filters | Thêm cột `topic_group` ENUM('PRODUCTIVITY_GROUP','WASTE_GROUP','SAFETY_GROUP','OTHER_GROUP') | 30 min |
| **P0-3** | **Thiếu: `pricingDirection`** (THOI_GIAN \| TRI_GIA) | KaizenFiveStepSubmitForm Step 2 | Thêm cột `pricing_direction` ENUM('THOI_GIAN','TRI_GIA') | 15 min |
| **P0-4** | **Thiếu: `timeBeforeSeconds` & `timeAfterSeconds`** | KaizenFiveStepSubmitForm Step 2 | Thêm cột `time_before_seconds`, `time_after_seconds` INTEGER | 20 min |
| **P0-5** | **Thiếu: `efficiencyValueVND`** | KaizenFiveStepSubmitForm Step 2 + Dashboard KPI | Thêm cột `efficiency_value_vnd` INTEGER (for monetary savings) | 15 min |
| **P0-6** | **Logic tính `saved_seconds` & value** | KaizenDashboard (chart calculations) | Backend API: khi trả proposal, tính auto saved_seconds = time_before - time_after \| value = efficiency_value_vnd \| (nếu thời gian, mặc định 1s=0.5M) | 30 min |
| **P0-7** | **Thiếu: `customer_brand` mapping** | KaizenDashboard Chart 6 (Khách hàng) + CIModule Filter | Remap dept_code → {DP, WR, SK, RB, LEFASO} hoặc thêm cột `customer_brand` | 20 min |

### P1 — Nên Làm (Ảnh Hưởng Phụ & UX)

| # | Gap | Frontend Component | Backend Action | Estimate |
|---|---|---|---|---|
| **P1-1** | **Thiếu: `proposer_month` & `proposer_year`** | KaizenFiveStepSubmitForm | Thêm cột `proposed_month`, `proposed_year` INTEGER | 15 min |
| **P1-2** | **Thiếu: `product_group`, `product_code`, `product_quantity`** | KaizenFiveStepSubmitForm Step 3 + Library Filter | Thêm 3 cột: `product_group` VARCHAR, `product_code` VARCHAR, `product_quantity` INTEGER | 25 min |
| **P1-3** | **Thiếu: `supervisor_name`, `hr_suggestor_name`** | KaizenFiveStepSubmitForm Step 4 | Thêm cột `supervisor_name` VARCHAR, `hr_suggestor_name` VARCHAR | 15 min |
| **P1-4** | **Thiếu: `dept_approval_status`** | KaizenFiveStepSubmitForm Step 4 | Thêm cột `dept_approval_status` ENUM('DA_XAC_NHAN','DANG_CHO','TU_CHOI') | 15 min |
| **P1-5** | **Thiếu: `before_video_url` & `after_video_url`** | KaizenFiveStepSubmitForm Step 2 | Thêm cột `before_video_url` TEXT, `after_video_url` TEXT | 15 min |
| **P1-6** | **Thiếu: Regional KPI targets config** | KaizenEarlyWarning (KPI progress table) | Tạo bảng `regional_kpi_targets` hoặc hardcode config: {KG1: 20, KG2: 15, KG3: 15, ĐẾ: 15, Miền Đông: 25, VP R&D: 10} | 30 min |

### P2 — Nice to Have (Không Critical)

| # | Gap | Frontend Component | Backend Action | Estimate |
|---|---|---|---|---|
| **P2-1** | **Thiếu: `agreed_to_terms`** | KaizenFiveStepSubmitForm Step 5 | Thêm cột `agreed_to_terms` BOOLEAN DEFAULT true | 10 min |

---

## 📝 BẢNG TỔNG HỢP CỘT DỮ LIỆU CẦN THÊM VÀO ci_kaizen_proposals

### Migration SQL (Dự kiến)

```sql
-- Add P0 columns (CRITICAL)
ALTER TABLE ci_kaizen_proposals ADD COLUMN proposer_position VARCHAR(255);
ALTER TABLE ci_kaizen_proposals ADD COLUMN topic_group VARCHAR(50) DEFAULT 'OTHER_GROUP';  -- PRODUCTIVITY_GROUP, WASTE_GROUP, SAFETY_GROUP, OTHER_GROUP
ALTER TABLE ci_kaizen_proposals ADD COLUMN pricing_direction VARCHAR(20) DEFAULT 'THOI_GIAN';  -- THOI_GIAN, TRI_GIA
ALTER TABLE ci_kaizen_proposals ADD COLUMN time_before_seconds INTEGER DEFAULT 0;
ALTER TABLE ci_kaizen_proposals ADD COLUMN time_after_seconds INTEGER DEFAULT 0;
ALTER TABLE ci_kaizen_proposals ADD COLUMN efficiency_value_vnd INTEGER DEFAULT 0;
ALTER TABLE ci_kaizen_proposals ADD COLUMN customer_brand VARCHAR(50);  -- DP, WR, SK, RB, LEFASO, Khác

-- Add P1 columns (IMPORTANT)
ALTER TABLE ci_kaizen_proposals ADD COLUMN proposed_month INTEGER;
ALTER TABLE ci_kaizen_proposals ADD COLUMN proposed_year INTEGER;
ALTER TABLE ci_kaizen_proposals ADD COLUMN product_group VARCHAR(255);
ALTER TABLE ci_kaizen_proposals ADD COLUMN product_code VARCHAR(50);
ALTER TABLE ci_kaizen_proposals ADD COLUMN product_quantity INTEGER DEFAULT 0;
ALTER TABLE ci_kaizen_proposals ADD COLUMN supervisor_name VARCHAR(255);
ALTER TABLE ci_kaizen_proposals ADD COLUMN hr_suggestor_name VARCHAR(255);
ALTER TABLE ci_kaizen_proposals ADD COLUMN dept_approval_status VARCHAR(50) DEFAULT 'PENDING';  -- DA_XAC_NHAN, DANG_CHO, TU_CHOI
ALTER TABLE ci_kaizen_proposals ADD COLUMN before_video_url TEXT;
ALTER TABLE ci_kaizen_proposals ADD COLUMN after_video_url TEXT;

-- Add P2 columns (OPTIONAL)
ALTER TABLE ci_kaizen_proposals ADD COLUMN agreed_to_terms BOOLEAN DEFAULT true;
```

### Create Regional KPI Targets Table (P1)

```sql
CREATE TABLE IF NOT EXISTS regional_kpi_targets (
    id TEXT PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL UNIQUE,
    monthly_target INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO regional_kpi_targets (id, region_name, monthly_target) VALUES
    (uuid(), 'Kiên Giang 1', 20),
    (uuid(), 'Kiên Giang 2', 15),
    (uuid(), 'Kiên Giang 3', 15),
    (uuid(), 'Hoàn Thiện Đế', 15),
    (uuid(), 'Nhà Máy Miền Đông', 25),
    (uuid(), 'VP Chuỗi (R&D)', 10);
```

---

## 🔧 API ENDPOINTS — HIỆN CÓ VS CẦN UPDATE

| Endpoint | Method | Current Return Fields | Missing Fields | Action |
|---|---|---|---|---|
| `/api/ci-kaizen` | GET | ✅ 21 fields from ci_kaizen_proposals | Will add 10 new P0/P1 fields | ✅ Update serialization |
| `/api/ci-kaizen` | POST | ✅ Basic CRUD | P0-P2 fields from FE form | ✅ Accept & validate new fields |
| `/api/ci-kaizen` | PUT | ✅ Update proposal | Support update new fields | ✅ Update logic |
| `/api/ci-kaizen/view` | POST | ✅ Increment view_count | No change needed | ✅ OK |
| `/api/ci-kaizen/vote` | POST | ✅ Increment vote_count | No change needed | ✅ OK |
| `/api/ci-kaizen/rate` | POST | ✅ Update score & avg_rating | No change needed | ✅ OK |
| **NEW** `/api/ci-kaizen/kpi-targets` | GET | N/A | Regional targets | **P1: ADD New Endpoint** |

---

## 📊 ĐIỀU KIỆN TIÊN QUYẾT (PASS/FAIL) — CHƯA CÓ LOGIC

| Pass/Fail Condition | Current Status | Ghi Chú | Việc Cần Làm |
|---|---|---|---|
| **1. Đã triển khai thực tế** | ❌ **Không kiểm soát** | Không có field check implementation status | **P0: Thêm cột `is_actually_deployed` BOOLEAN** |
| **2. Có minh chứng trước-sau** | ⚠️ Có một phần | Kiểm tra `before_image_url` & `after_image_url`, nhưng có video thì tính sao? | **P0: Update logic kiểm tra khi có video URL** |
| **3. Không vi phạm ATLD** | ❌ **Không có** | Không có field để ghi nhận confirm ATLD | **P1: Thêm cột `safety_confirmed` BOOLEAN** |
| **4. Không trùng lặp** | ❌ **Không có** | Không có bảng history để kiểm tra trùng | **P2: Thêm logic so sánh fuzzy match hoặc bảng approved history** |

---

## 🎯 5 TIÊU CHÍ CHẤM ĐIỂM 100 ĐỘ — CHƯA CÓ

| Tiêu Chí | Điểm | Trạng Thái Backend | Ghi Chú | Việc Cần Làm |
|---|---|---|:---|---|
| **1. Hiệu quả thực tế** | 35 | ❌ Chưa có | Phụ thuộc vào category (Năng suất%, Tiết kiệm%, An toàn trường hợp) | **P0: Tạo bảng scoring criteria & auto-calculator** |
| **2. Tính khả thi & đầu tư** | 20 | ❌ Chưa có | Mức: 20/15/10/5 dựa trên lý do từ chối hoặc nhận xét đánh giá | **P0: Thêm cột `feasibility_score`, `investment_score`** |
| **3. Khả năng nhân rộng** | 20 | ❌ Chưa có | Mức: 20/15/10/5 dựa trên khả năng áp dụng rộng | **P0: Thêm cột `scalability_score`** |
| **4. Sáng tạo & chủ động** | 15 | ❌ Chưa có | Mức: 15/11/7/3 | **P0: Thêm cột `innovation_score`** |
| **5. Lan tỏa & đội nhóm** | 10 | ❌ Chưa có | Mức: 10/7/3/0 | **P0: Thêm cột `team_spirit_score`** |
| **Tổng cộng** | 100 | ❌ Chưa có | = Tiêu chí 1 + 2 + 3 + 4 + 5 (làm tròn 1 chữ số) | **P0: Backend auto-sum & round** |

---

## 🔔 HỆ THỐNG BÁO CÁO TUẦN/THÁNG — CHƯA CÓ

| Report Type | Frequency | Content | DB Support? | Việc Cần Làm |
|---|---|---|:---:|---|
| **Báo cáo nhanh** | Hàng tuần | Số ý tưởng, hồ sơ đang xử lý, vướng mắc | ❌ Chưa có | **P1: Thêm bảng `weekly_reports` hoặc VIEW** |
| **Báo cáo tổng kết tháng** | Cuối tháng (ngày 30) | Số liệu chính thức + đánh giá định tính | ❌ Chưa có | **P1: Thêm bảng `monthly_reports`** |
| **Cảnh báo sớm** | Sau 2 tuần đầu tháng | <30% CTV báo cáo \| chưa có ý tưởng | ✅ Logic FE nhưng chưa server-side check | **P1: Backend trigger cảnh báo tự động** |

---

## 🏆 GIẢI THƯỞNG & XẾPHẠNG — CHƯA CÓ

| Award System | Current Status | Ghi Chú | Việc Cần Làm |
|---|---|---|---|
| **Giải cải tiến (11 giải từ 30M)** | ❌ Chưa có logic | award_title field chỉ cho nhập thủ công | **P1: Tạo stored procedure để auto-rank & assign giải** |
| **Giải phong trào (2 giải từ 9M)** | ❌ Chưa có | Cần tính điểm phong trào theo 3 tỷ lệ | **P1: Thêm bảng `organizational_awards`** |
| **Điểm phong trào 100 = ...** | ❌ Chưa có | = Tỷ lệ tham gia (50) + Đạt chuẩn (30) + Lọt chung khảo (20) | **P1: Tạo scoring engine cho phong trào** |

---

## 📋 MÔ HÌNH TRƯỞNG THÀNH 5 CẤP (CMMI) — CHƯA CÓ

| Level | Score Range | Name | DB Support? | Việc Cần Làm |
|---|---|---|:---:|---|
| E | 0-20 | Mới bắt đầu | ❌ Chưa có | **P2: Thêm bảng `maturity_levels`** |
| D | 21-40 | Có phong trào | ❌ Chưa có | **P2: Cần tối thiểu 2-3 kỳ dữ liệu** |
| C | 41-60 | Đang hình thành | ❌ Chưa có |  |
| B | 61-80 | Văn hóa ổn định | ❌ Chưa có |  |
| A | 81-100 | Tự vận hành | ❌ Chưa có |  |

---

## 📊 TỔNG THỐNG KÊ

### Cột Dữ Liệu Cần Thêm

| Mức Độ Ưu Tiên | Số Cột | Danh Sách Cột |
|---|:---:|---|
| **P0 (Critical)** | 7 | proposer_position, topic_group, pricing_direction, time_before_seconds, time_after_seconds, efficiency_value_vnd, customer_brand |
| **P1 (Important)** | 11 | proposed_month, proposed_year, product_group, product_code, product_quantity, supervisor_name, hr_suggestor_name, dept_approval_status, before_video_url, after_video_url, safety_confirmed |
| **P2 (Optional)** | 1 | agreed_to_terms |
| **BẢNG MỚI** | 3 | regional_kpi_targets, weekly_reports, organizational_awards |
| **SCORING/LOGIC** | 5 | feasibility_score, investment_score, scalability_score, innovation_score, team_spirit_score |
| **TOTAL** | **26+ items** | - |

### API Endpoints Cần Update

| Type | Count | Action |
|---|:---:|---|
| Existing GET/POST/PUT | 5 | ✅ Update to handle new fields |
| NEW endpoints | 2 | `/api/ci-kaizen/kpi-targets`, `/api/ci-kaizen/scoring` |

### Thời Gian Ước Tính

| Task | Estimate | Priority |
|---|---|---|
| **Database migrations (P0 + P1 cột)** | 2-3 hours | 🔴 Critical |
| **API updates (serialization + validation)** | 1-2 hours | 🔴 Critical |
| **Scoring engine (5 tiêu chí)** | 4-6 hours | 🟡 Important |
| **Regional KPI targets** | 1 hour | 🟡 Important |
| **Weekly/Monthly reports** | 3-4 hours | 🟡 Important |
| **Awards & ranking logic** | 3-4 hours | 🟡 Important |
| **TOTAL** | **14-20 hours** | - |

---

## ✅ HÀNH ĐỘNG TIẾP THEO

### BƯỚC A.1 — Xác Nhận Gap (NGAY)
1. ✅ Đã hoàn thành scan codebase
2. ✅ Đã liệt kê toàn bộ gap
3. ✅ Đã phân loại ưu tiên P0/P1/P2

### BƯỚC A.2 — Chuẩn Bị Migration (KIRO — Kỳ Tiếp)
1. Tạo migration file với tất cả cột P0 + P1
2. Cập nhật Prisma schema
3. Update API validation schema
4. Commit to `agent/kiro-backend` branch

### BƯỚC A.3 — Phối Hợp Giữa Kiro & Antigravity
1. Frontend thử gửi POST với các field mới (sẽ failed nếu BE chưa sẵn)
2. Kiro xác nhận BE đã ready
3. Antigravity test lại form 5 bước end-to-end
4. Merge cả 2 nhánh vào main

### BƯỚC B — Tạo Spec (Sau khi GAP ANALYSIS hoàn tất)
1. Viết Spec chính thức (Requirements-First)
2. Định rõ luồng chấm điểm, cảnh báo, giải thưởng
3. Chia nhỏ thành tasks cho Kiro

---

## 📎 THAM CHIẾU

- **Frontend Branch**: `agent/antigravity-frontend`
- **Frontend Components**: 
  - KaizenFiveStepSubmitForm.tsx (FORM 5 BƯỚC)
  - KaizenDashboard.tsx (DASHBOARD 6 KPI + 6 BIỂU ĐỒ)
  - KaizenEarlyWarning.tsx (CẢNH BÁO BAN 2.2)
  - CIModule.tsx (THỨC VIỆN + QUẢN LÝ CHUNG)
- **Backend Branch**: `agent/kiro-backend` (dự kiến)
- **Database**: ci_kaizen_proposals (current: 21 columns → need +18 columns)
- **Spec Requirement**: XÂY_DỰNG_VĂN_HÓA_CẢI_TIẾN.PDF (Ban 2.2/ĐMQT)

---

**Generated**: 21/08/2026 | **Status**: ✅ GAP ANALYSIS COMPLETE | **Next**: BƯỚC B — SPEC CREATION
