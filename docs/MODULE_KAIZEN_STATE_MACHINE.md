# 🔄 TÀI LIỆU STATE MACHINE & VÒNG ĐỜI ĐỀ XUẤT KAIZEN (QĐ-TBKG/2026)

> **Phân hệ**: CN-CI (Cải Tiến Liên Tục) — Module Kaizen 5 Bước  
> **Dự án**: TBS II Platform (Tổ hợp Kiên Giang — TBS Group)  
> **Áp dụng**: Nhà máy KG 1, KG 2, Hoàn thiện đế, VP Chuỗi  

---

## 📋 1. TỔNG QUAN LUỒNG NGHIỆP VỤ 5 BƯỚC

Theo Quy định **QĐ-TBKG/2026** của Tập đoàn TBS Group, một ý tưởng / đề xuất cải tiến Kaizen trải qua quy trình 5 bước nghiêm ngặt:

```
[Bước 1: Đăng ký ý tưởng] ──> [Bước 2: Sơ duyệt & Phân công] ──> [Bước 3: Phê duyệt triển khai] ──> [Bước 4: Thực thi & Nộp báo cáo] ──> [Bước 5: Đánh giá hiệu quả & Lưu trữ]
```

---

## 📊 2. SƠ ĐỒ TRẠNG THÁI (STATE DIAGRAM-V2)

Sơ đồ Mermaid dưới đây mô tả chính xác chuyển đổi trạng thái của 1 đề xuất trong CSDL D1 (`ci_kaizen_proposals`):

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Bước 1 - Người lao động đăng ký đề xuất

    state "CHO_REVIEW (Chờ Phê Duyệt)" as SUBMITTED
    state "PHE_DUYET (Đã Duyệt Triển Khai)" as APPROVED
    state "TU_CHOI_TRIEN_KHAI (Từ Chối)" as REJECTED
    state "CHO_DANH_GIA (Chờ Đánh Giá Hiệu Quả)" as CHO_DANH_GIA
    state "DA_DANH_GIA (Đã Đánh Giá Xong)" as DA_DANH_GIA
    state "KHONG_DAT_YEU_CAU (Không Đạt)" as KHONG_DAT
    state "LUU_TRU (Lưu Trữ Ý Tưởng)" as LUU_TRU
    state "THI_DUA (Sáng Kiến Thi Đua)" as THI_DUA

    SUBMITTED --> APPROVED : Quyền Quản Lý bấm 'Phê duyệt triển khai' (Bước 3)
    SUBMITTED --> REJECTED : Quyền Quản Lý bấm 'Từ chối triển khai'
    SUBMITTED --> LUU_TRU : Đề xuất đăng ký trực tiếp mục Lưu Trữ

    APPROVED --> CHO_DANH_GIA : Hệ thống tự động chuyển luồng Sang Bước 4/5
    
    CHO_DANH_GIA --> DA_DANH_GIA : Hội đồng BGK hoàn tất chấm điểm / Đạt (Bước 5)
    CHO_DANH_GIA --> KHONG_DAT : Hội đồng BGK chấm Không Đạt

    DA_DANH_GIA --> LUU_TRU : Chuyển lưu trữ hồ sơ công khai
    LUU_TRU --> THI_DUA : BGK / Admin bấm 'Gắn nhãn Thi đua'
    THI_DUA --> LUU_TRU : BGK / Admin bấm 'Bỏ nhãn Thi đua'

    REJECTED --> [*] : Quy trình DỪNG theo QĐ-TBKG
    KHONG_DAT --> [*] : Quy trình DỪNG
    THI_DUA --> [*] : Hoàn tất tôn vinh
```

---

## ⏱️ 3. SƠ ĐỒ TRÌNH TỰ (SEQUENCE DIAGRAMS)

### 3.1 Sequence Diagram 1: Luồng Phê Duyệt Triển Khai (Feasibility Approval)

Sơ đồ trình tự tương tác khi Người quản lý bấm nút **"Phê Duyệt Triển Khai"** trên giao diện popup modal:

```mermaid
sequenceDiagram
    autonumber
    actor Manager as 👤 Người Phê Duyệt (P.GĐ / Trưởng Phòng)
    participant UI as 🖥️ Client UI (FeasibilityApprovalModal)
    participant API as ⚙️ Cloudflare Worker (_worker.js)
    participant Cache as ⚡ In-Memory Server Cache
    participant DB as 🗄️ Cloudflare D1 Database

    Manager->>UI: Nhập số liệu Trước (30s) / Sau (0s) & Bấm "Xác nhận Phê duyệt"
    UI->>API: POST /api/ci-kaizen/approve (proposalId, decision='APPROVE', timeBefore=30, timeAfter=0)
    
    API->>API: verifyServerAuth() - Xác thực Token & Quyền Quản Lý
    alt Không có quyền
        API-->>UI: HTTP 403 Forbidden (Thông báo từ chối)
    else Có quyền hợp lệ
        API->>DB: UPDATE ci_kaizen_proposals SET approval_status='PHE_DUYET', sub_status='CHO_DANH_GIA', time_before_seconds=30, time_after_seconds=0, saved_seconds=30 WHERE id=?
        API->>DB: INSERT INTO ci_kaizen_status_history (Ghi log audit trail)
        API->>Cache: invalidateKaizenStatsCache() (KAIZEN_STATS_CACHE = null)
        API-->>UI: HTTP 200 OK (Thành công + Payload cập nhật)
        UI->>UI: Cập nhật optimistic activeProposal State & trigger fetchStats()
        UI-->>Manager: 🟢 Hiển thị Toast "Đã phê duyệt thành công!" & Làm mới Thẻ số liệu
    end
```

---

### 3.2 Sequence Diagram 2: Luồng Nạp Dữ Liệu Tức Thời Khi F5 (Stale-While-Revalidate Hydration)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người Dùng F5 / Tải Trang
    participant UI as 🖥️ Client UI (CIModule.tsx)
    participant Storage as 📁 Client localStorage ('tbs_kaizen_stats_v1')
    participant API as ⚙️ Cloudflare Worker (_worker.js)
    participant Cache as ⚡ Server In-Memory Cache (30s)
    participant DB as 🗄️ D1 Database

    User->>UI: Tải trang /work/kaizen
    UI->>Storage: Read localStorage ('tbs_kaizen_stats_v1')
    Storage-->>UI: Trả về object statsData gần nhất (nếu có)
    UI->>UI: ⚡ Render ngay lập tức Badge Sidebar (0.01s)\nBật chấm xanh pulsing dot (isSyncingStats = true)
    
    UI->>API: GET /api/ci-kaizen/stats
    alt Cache HIT (Trong 30s)
        API->>Cache: Read KAIZEN_STATS_CACHE
        Cache-->>API: Trả về stats JSON (Header X-Cache: HIT)
    else Cache MISS (Hết 30s hoặc vừa bị Invalidate)
        API->>DB: SELECT is_thi_dua, sub_status, region FROM ci_kaizen_proposals
        DB-->>API: Trả về mảng dữ liệu thô
        API->>API: Tổng hợp counts & Lưu KAIZEN_STATS_CACHE
    end
    
    API-->>UI: HTTP 200 OK (stats fresh)
    UI->>Storage: Save localStorage mới
    UI->>UI: Cập nhật statsData State & Tắt chấm xanh
```

---

### 3.3 Sequence Diagram 3: Luồng Đánh Giá Chuyên Môn Barem 100Đ & Tự Động Tổng Hợp Điểm

```mermaid
sequenceDiagram
    autonumber
    actor Judge as 👑 Ban Giám Khảo Được Phân Công
    participant UI as 🖥️ Client UI (KaizenDetailModal)
    participant API as ⚙️ Worker (/expert-evaluations)
    participant DB as 🗄️ D1 Database

    Judge->>UI: Nhập 5 tiêu chí barem (35đ - 20đ - 20đ - 15đ - 10đ) & Bấm "Xác nhận khóa điểm"
    UI->>API: POST /api/ci-kaizen/expert-evaluations (action='CONFIRM', scores)
    API->>DB: INSERT / UPDATE ci_kaizen_expert_evaluations (status='CONFIRMED')
    API->>DB: Query đếm số BGK đã chấm vs số BGK được phân công
    
    alt Tất cả BGK đã chấm xong (confirmedCount >= requiredCount)
        API->>DB: Tính AVG Score = Sum(total_score) / Count
        API->>DB: UPDATE ci_kaizen_proposals SET sub_status='DA_DANH_GIA', average_score=AVG
        API->>API: invalidateKaizenStatsCache()
        API-->>UI: HTTP 200 OK (isCompleted = true, averageScore)
        UI-->>Judge: 🏆 Thông báo "Bài viết đã hoàn tất đánh giá & đạt X/100 điểm!"
    else Chưa đủ tất cả BGK
        API-->>UI: HTTP 200 OK (isCompleted = false, confirmedCount/requiredCount)
        UI-->>Judge: 🔒 "Đã khóa điểm! Tiến độ: 2/3 BGK đã hoàn tất."
    end
```

---

## 🔐 4. MA TRẬN PHÂN QUYỀN TRẠNG THÁI

| Trạng Thái Đề Xuất | Công Nhân / Người Tạo | Trưởng Phòng / Quản Lý | Team CI / BGK | Admin / BGĐ |
| :--- | :---: | :---: | :---: | :---: |
| **`SUBMITTED`** (Mới nộp) | ✏️ Xem / Chỉnh sửa bài của mình | 🟢 Phê duyệt / Từ chối (Bước 3) | 👁️ Xem danh sách | 🔑 Phân công BGK |
| **`PHE_DUYET`** (Đã duyệt) | 👁️ Xem tiến độ | 👁️ Theo dõi | 🟢 Đánh giá hiệu quả (Bước 5) | 🔑 Quản trị |
| **`CHO_DANH_GIA`** | 👁️ Xem tiến độ | 👁️ Xem tiến độ | 👑 Chấm barem 100đ / Chấm sao | 🔑 Khóa / Miễn nhiệm BGK |
| **`DA_DANH_GIA`** | 🏆 Xem điểm số | 🏆 Xem điểm số | 👁️ Xem kết quả | 🔑 Gắn nhãn Thi đua |
| **`LUU_TRU`** | 📦 Tra cứu thư viện | 📦 Tra cứu | 📦 Gắn / Bỏ nhãn Thi đua | 🔑 Quản trị |

---

## 🏆 5. CƠ CẤU GIẢI THƯỞNG "MỘT SỐ CẢI TIẾN ĐƯỢC KHEN THƯỞNG"

Bảng cơ cấu khen thưởng hàng tháng dành cho các sáng kiến Kaizen đạt thành tích xuất sắc:

| Hạng Giải | Số Lượng Giải | Mức Thưởng (VNĐ / Giải) | Thành Tiền (VNĐ) |
| :--- | :---: | :---: | :---: |
| 🥇 **Giải Nhất** | 01 giải | 1.000.000 VNĐ | 1.000.000 VNĐ |
| 🥈 **Giải Nhì** | 02 giải | 500.000 VNĐ / giải | 1.000.000 VNĐ |
| 🥉 **Giải Ba** | 05 giải | 300.000 VNĐ / giải | 1.500.000 VNĐ |
| 🎖️ **Giải Tư** | 10 giải | 200.000 VNĐ / giải | 2.000.000 VNĐ |
| 🎗️ **Giải Khuyến Khích (Giải 5)** | 20 giải | 100.000 VNĐ / giải | 2.000.000 VNĐ |
| 💰 **TỔNG NGHĨA VỤ KHEN THƯỞNG** | **38 giải** | — | **8.500.000 VNĐ** |

*Công thức tổng ngân sách khen thưởng hàng tháng*:  
$$\text{Tổng tiền} = 1.000.000 + (2 \times 500.000) + (5 \times 300.000) + (10 \times 200.000) + (20 \times 100.000) = 8.500.000 \text{ VNĐ}$$

---

> **Tài liệu ban hành**: Ban Công Nghệ & Kaizen TBS Group — 2026
