# 📋 BƯỚC 1 - KIỂM TRA TRẠNG THÁI HIỆN TẠI
## Cập Nhật Phòng Ban cho 370 Nhân Viên

**Ngày Kiểm Tra:** 2026-08-24  
**Status:** ⏳ CHỜ KIỂM TRA D1 DATABASE TRỰC TIẾP

---

## 🔍 PHÂN TÍCH CODE HIỆN TẠI

### 1. **Cấu Trúc Bảng `users` trong D1**

**Bảng:** `users`

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_code TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    department TEXT,              -- 👈 CỘT CẦN KIỂM TRA
    department_id INTEGER,
    title TEXT,
    role_code TEXT,
    ...
)
```

**Có 2 field liên quan đến phòng ban:**
- `department` (TEXT) - Tên phòng ban dạng text
- `department_id` (INTEGER) - ID tham chiếu đến bảng departments

---

### 2. **Dữ Liệu Seed Hiện Tại (từ `seed_data.sql` & `d1_schema.sql`)**

#### **Từ d1_schema.sql - 8 users seed:**

| ID | emp_code | name | department | role_code | Trạng Thái |
|----|----|----|----|---|---|
| 100 | 202608001 | Cán Bộ Công Nhân Viên | ❓ **NULL** | ? | ACTIVE |
| 101 | 202608002 | Cán Bộ Công Nhân Viên | ❓ **NULL** | ? | ACTIVE |
| 201 | TGĐ-001 | Tổng Giám Đốc | `Ban Giám Đốc Tập Đoàn` | TONG_GIAM_DOC | ACTIVE |
| 202 | PTGĐ-002 | Phó Tổng Giám Đốc | `Ban Giám Đốc Vận Hành` | PHO_TONG_GIAM_DOC | ACTIVE |
| 203 | GĐ-003 | Giám Đốc | `Khối Sản Xuất & Nhà Máy` | GIAM_DOC | ACTIVE |
| 204 | PGĐ-004 | Phó Giám Đốc | `Khối Quản Lý Chất Lượng (QC)` | PHO_GIAM_DOC | ACTIVE |
| 205 | 202608001 | Phạm Nguyễn Anh Huy | `IT - Team Chuyển Đổi Số` | CBCNV | ACTIVE |
| 206 | 202608002 | Trần Ngọc Huy | `Nhân Sự - Hành Chánh` | LE_TAN | ACTIVE |
| 207 | EMP-003 | Cán Bộ Công Nhân Viên | `Văn Phòng Chuỗi SKECHERS` | CBCNV | ACTIVE |

#### **Từ seed_data.sql - 20+ users seed:**

| ID | emp_code | name | department | role_code |
|----|----|----|----|----|
| 205 | 202608001 | Phạm Nguyễn Anh Huy | `IT - Team Chuyển Đổi Số` | TRUONG_PHONG |
| 206 | 202608002 | Trần Ngọc Huy | `Nhân Sự - Hành Chánh` | LE_TAN |
| 207 | 2026080001 | Phạm Nguyễn Anh Huy | `IT - Team Chuyển Đổi Số` | TRUONG_PHONG |
| 208 | NS-001 | Nguyễn Thị Lan Anh | `Nhân Sự - Hành Chánh` | TRUONG_PHONG |
| 209 | NS-002 | Lê Thị Minh Châu | `Nhân Sự - Hành Chánh` | NHAN_VIEN |
| 210 | KT-001 | Trần Thị Thu Hương | `Kế Toán & Quản Trị Tài Chính` | TRUONG_PHONG |
| 211 | KT-002 | Phạm Văn Đức | `Kế Toán & Quản Trị Tài Chính` | NHAN_VIEN |
| 212 | RD-001 | Võ Thị Kim Loan | `R&D - Phát Triển Sản Phẩm` | TRUONG_PHONG |
| 213 | RD-002 | Nguyễn Quang Huy | `R&D - Phát Triển Sản Phẩm` | NHAN_VIEN |
| 214 | QC-001 | Bùi Thị Hằng | `Khối Quản Lý Chất Lượng (QC)` | QC_MANAGER |
| 215 | QC-002 | Lê Văn Tuấn | `Khối Quản Lý Chất Lượng (QC)` | NHAN_VIEN |
| 216 | BT-001 | Phạm Văn Bảo | `Khối Sản Xuất & Nhà Máy` | KY_THUAT_VIEN |
| 217 | BT-002 | Hoàng Văn Nam | `Khối Sản Xuất & Nhà Máy` | KY_THUAT_VIEN |
| 218 | BT-003 | Trần Quốc Bình | `Khối Sản Xuất & Nhà Máy` | KY_THUAT_VIEN |
| 219 | LG-001 | Nguyễn Văn Minh | `Logistics - KH Chuẩn Bị TTPP` | TRUONG_PHONG |
| 220 | LG-002 | Phạm Thị Oanh | `Logistics - KH Chuẩn Bị TTPP` | NHAN_VIEN |

---

### 3. **Danh Sách 6 Phòng Ban NEW (Cần Cập Nhật Thành):**

Theo yêu cầu, 370 nhân viên cần được cập nhật thành 6 nhóm phòng ban:

```
1. ĐH-QT (Đầu Hàng - Quản Trị)
2. NHÂN SỰ-HC (Nhân Sự - Hành Chánh)
3. KD PTSP (Kinh Doanh - Phát Triển Sản Phẩm)
4. QLCL & LAB (Quản Lý Chất Lượng & Lab)
5. CN-PPH & CI (Công Nghệ - Phân Phối & Cải Tiến)
6. KHCB-TTPP (Kho Chứa Bán - TTPP)
```

---

## 🚨 PHÁT HIỆN QUAN TRỌNG

### **❓ Vấn Đề 1: MSNV 202608001 (Phạm Nguyễn Anh Huy)**

**Phát hiện:** Tài khoản này xuất hiện **2 lần** với cấu hình khác nhau:

**d1_schema.sql (Seed chính):**
```sql
INSERT INTO users (id, emp_code, email, name, ..., department, role_code)
VALUES (205, '202608001', 'anhy.work.2004@gmail.com', 'Phạm Nguyễn Anh Huy', 
    ..., 'IT - Team Chuyển Đổi Số', 'CBCNV')
```

**seed_data.sql (Seed phụ):**
```sql
INSERT INTO users (id, emp_code, email, name, ..., department, role_code)
VALUES (205, '202608001', 'anhy.work.2004@gmail.com', 'Phạm Nguyễn Anh Huy', 
    ..., 'IT - Team Chuyển Đổi Số', 'TRUONG_PHONG')
```

**Vấn Đề:**
- Cùng MSNV (202608001)
- Cùng email (anhy.work.2004@gmail.com)
- **role_code khác**: CBCNV vs TRUONG_PHONG
- **Phòng ban hiện tại**: "IT - Team Chuyển Đổi Số" (KHÔNG phải 6 nhóm NEW)

**Action:** ⏸️ **DỪNG LẠI - CẦN BẠNXÁC NHẬN**

---

### **❓ Vấn Đề 2: Phòng Ban Hiện Tại KHÔNG Khớp 6 Nhóm NEW**

**Các giá trị Phòng Ban hiện tại trong DB:**
```
❌ "IT - Team Chuyển Đổi Số"
❌ "Nhân Sự - Hành Chánh"  
❌ "Kế Toán & Quản Trị Tài Chính"
❌ "R&D - Phát Triển Sản Phẩm"
❌ "Khối Quản Lý Chất Lượng (QC)"
❌ "Khối Sản Xuất & Nhà Máy"
❌ "Logistics - KH Chuẩn Bị TTPP"
❌ "Ban Giám Đốc Tập Đoàn"
❌ "Ban Giám Đốc Vận Hành"
❌ "Văn Phòng Chuỗi SKECHERS"
```

**KHÔNG phải:**
```
✅ ĐH-QT
✅ NHÂN SỰ-HC
✅ KD PTSP
✅ QLCL & LAB
✅ CN-PPH & CI
✅ KHCB-TTPP
```

---

## 📊 TÓM TẮT TRẠNG THÁI

| Điều Kiện | Kết Quả | Ghi Chú |
|-----------|--------|--------|
| DB đã cập nhật 370 nhân viên thành 6 nhóm NEW? | ❌ **CHƯA** | Vẫn dùng giá trị cũ |
| Tất cả users hiểm tên phòng ban từ 6 nhóm? | ❌ **KHÔNG** | Chỉ có ~17 users trong seed |
| MSNV 202608001 khớp 1 trong 6 nhóm? | ❌ **KHÔNG** | Là "IT - Team Chuyển Đổi Số" |
| Có mâu thuẫn dữ liệu? | ⚠️ **CÓ** | MSNV 202608001 xuất hiện 2 lần, role khác nhau |
| Có bảng mapping 370 nhân viên? | ❓ **CẦN KIỂM TRA** | Chưa tìm thấy trong code |

---

## ⛔ TRẠNG THÁI: DỪNG LẠI - CHƯA TỰ UPDATE

### **Tôi KHÔNG tự chạy update hàng loạt bởi vì:**

1. ✋ Dữ liệu CHƯA được cập nhật theo 6 nhóm NEW
2. ✋ Phát hiện mâu thuẫn với MSNV 202608001 (2 records, role khác nhau)
3. ✋ Chưa có bảng mapping 370 nhân viên → 6 nhóm NEW đầy đủ trong code

---

## ❓ CẦN BẠNXÁC NHẬN / CUNG CẤP

**Câu 1:** Bảng mapping **370 nhân viên → 6 phòng ban NEW** hiện đang ở đâu?
- [ ] A) Đã được AI khác chuẩn bị sẵn, hãy gửi file/danh sách cho tôi
- [ ] B) Đang trong Bước 2 (tôi sẽ scan code để tìm danh sách)
- [ ] C) Nằm trong database hoặc file riêng, hãy chỉ dùm

**Câu 2:** Vấn đề MSNV 202608001:
- Current: role_code = CBCNV hoặc TRUONG_PHONG (khác nhau ở 2 seed files)
- Expected: Nên là role_code gì?
- Expected: Phòng ban mới nên là 1 trong 6 nhóm nào?

**Câu 3:** Database D1 hiện tại (live):
- 370 nhân viên đã được cập nhật thành 6 phòng ban NEW hay vẫn là giá trị cũ?
- (Tôi không có quyền truy cập D1 trực tiếp, chỉ dựa vào seed files)

---

## 🔄 BƯỚC TIẾP THEO (Sau khi nhận xác nhận)

Nếu có bảng mapping 370 nhân viên:
1. **Bước 2:** Scan code để tìm tất cả references đến "Phòng Ban" / department
2. **Bước 3:** Báo cáo hardcode + dynamic references
3. **Bước 4:** Update code + deploy

---

**⏳ STATUS: CHỜ BẠNXÁC NHẬN CÂU HỎI TRÊN**

Đừng để tôi tự động hóa khi chưa chắc dữ liệu! 🛑
