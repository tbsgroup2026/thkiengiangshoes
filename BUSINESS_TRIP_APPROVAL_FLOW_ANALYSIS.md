# 📋 KHẢO SÁT LUỒNG DUYỆT CÔNG TÁC - BƯỚC 1 & 3 XÁC NHẬN

## BƯỚC 1: PHÂN TÍCH CODE HIỆN TẠI

### 1️⃣ **Luồng Duyệt Hiện Tại**

#### Số Bước Duyệt: **2 Cấp** (chỉ TP + BGĐ, không phân biệt cấp bậc BGĐ)

**Frontend (`web/src/app/business-trip/page.tsx`):**

```
Trạng thái      | Nút Hiển Thị          | Handler
────────────────┼─────────────────────┼─────────────────────
PENDING         | Duyệt TP             | handleApproveTrip(..., "department_head")
                | Từ chối (Modal)      | handleOpenRejectModal(..., "department_head")
────────────────┼─────────────────────┼─────────────────────
PENDING_L2      | Duyệt BGĐ            | handleApproveTrip(..., "executive_board")
                | Từ chối (Modal)      | handleOpenRejectModal(..., "executive_board")
────────────────┼─────────────────────┼─────────────────────
APPROVED        | (Không có nút)       | -
REJECTED        | (Không có nút)       | -
```

**API Backend (Cloudflare D1):**
- Method: `PUT /api/business-trips`
- Payload: `{ id, actionLevel, version }`
- Có kiểm tra: **SEGREGATION_OF_DUTIES_VIOLATION** (không được tự duyệt đơn của chính mình)
- Error codes: 403, 409 (optimistic lock), 422 (invalid state transition)

---

### 2️⃣ **Cấu Trúc Role_Code Hiện Có trong D1 DB**

**Từ `d1_schema.sql` - Bảng `users`:**

```sql
users (
    role_code TEXT,  -- e.g., 'TONG_GIAM_DOC', 'CBCNV', 'LE_TAN'
    department TEXT  -- e.g., 'Ban Giám Đốc Tập Đoàn', 'IT - Team Chuyển Đổi Số'
)
```

**Các role_code được seed:**
| ID | emp_code | role_code | title | department |
|----|----|----------|-------|-----------|
| 201 | TGĐ-001 | `TONG_GIAM_DOC` | Tổng Giám Đốc | Ban Giám Đốc Tập Đoàn |
| 202 | PTGĐ-002 | `PHO_TONG_GIAM_DOC` | Phó Tổng Giám Đốc | Ban Giám Đốc Vận Hành |
| 203 | GĐ-003 | `GIAM_DOC` | Giám Đốc | Khối Sản Xuất & Nhà Máy |
| 204 | PGĐ-004 | `PHO_GIAM_DOC` | Phó Giám Đốc | Khối QC & Gemba |
| 205 | 202608001 | `CBCNV` | IT - Team Chuyển Đổi | IT - Team Chuyển Đổi Số |
| 206 | 202608002 | `LE_TAN` | Lễ Tân | Nhân Sự - Hành Chánh |

**Cấp Bậc Từ Cao Đến Thấp:**
```
TGĐ (TONG_GIAM_DOC) [Cao nhất]
    ↓
P.TGĐ (PHO_TONG_GIAM_DOC)
    ↓
GĐ (GIAM_DOC)
    ↓
P.GĐ (PHO_GIAM_DOC)
    ↓
Trưởng Phòng (TRUONG_PHONG) ❌ [Chưa có trong seed, cần thêm]
    ↓
CBCNV (CBCNV) [Thấp nhất - Cán bộ công nhân viên]
```

---

### 3️⃣ **Cách Hệ Thống Liên Kết Department**

**Bảng `business_trips` (D1):**

```sql
business_trips (
    id TEXT PRIMARY KEY,
    creator TEXT NOT NULL,              -- Tên người tạo (VD: "Phạm Nguyễn Anh Huy")
    creator_emp_code TEXT,              -- Mã CBCNV người tạo (VD: "202608001") ← Dùng cho Segregation
    department TEXT NOT NULL,           -- Phòng ban người tạo (VD: "IT - Team Chuyển Đổi Số")
    status TEXT DEFAULT 'PENDING',      -- PENDING, PENDING_L2, APPROVED, REJECTED
    approved_level TEXT,                -- L1, L2 (ai duyệt cuối cùng)
    ...
)
```

**Luồng Liên Kết:**
```
Frontend:
  - Lấy currentUser từ localStorage
  - Set proposalForm.creator = currentUser.name
  - Set proposalForm.department = currentUser.department
      ↓
API POST /api/business-trips:
  - Lưu vào D1 với department = creator's department
      ↓
Duyệt:
  - Lấy currentUser.department
  - So sánh với business_trip.department
  - Trưởng phòng chỉ thấy đơn của phòng mình
```

---

### 4️⃣ **Luồng Kiểm Tra Quyền Duyệt Hiện Tại** (Backend)

**Hiện tại chỉ có:**
- ✅ Check không tự duyệt: `creator_emp_code !== currentUser.emp_code`
- ✅ Check SEGREGATION_OF_DUTIES_VIOLATION
- ❌ Không check role_code cụ thể
- ❌ Không check phạm vi department/khối

---

## BƯỚC 3: XÁC NHẬN TRƯỚC KHI CODE

### 1️⃣ **Nút Hiển Thị Theo Role (CẦN NHẬP NHẰM XÁC NHẬN)**

**Yêu cầu:** Hiển thị đúng nút theo role của người dùng đăng nhập.

| Role | PENDING (Cấp 1) | PENDING_L2 (Cấp 2) | Ghi Chú |
|------|---|---|---|
| **TRUONG_PHONG** *(Trưởng Phòng)* | `Duyệt TP` | ❌ Không | Chỉ duyệt Cấp 1, đơn TP |
| **PHO_GIAM_DOC** *(Phó GĐ)* | ❌ Không | `Duyệt BGĐ` | Chỉ duyệt Cấp 2, không phải TP |
| **GIAM_DOC** *(GĐ)* | ❌ Không | `Duyệt BGĐ` | Chỉ duyệt Cấp 2, không phải TP |
| **PHO_TONG_GIAM_DOC** *(P.TGĐ)* | ❌ Không | `Duyệt BGĐ` | Chỉ duyệt Cấp 2, cao hơn GĐ |
| **TONG_GIAM_DOC** *(TGĐ)* | ❌ Không | `Duyệt BGĐ` | Quyền cao nhất, duyệt Cấp 2 all |
| **CBCNV / LE_TAN** | ❌ Không | ❌ Không | Không có quyền duyệt |

---

### 2️⃣ **Cách Xác Định Phòng Ban / Khối Quản Lý**

#### **A) Trưởng Phòng (TRUONG_PHONG):**
- **Phạm vi duyệt:** CHỈ đơn công tác có `department == currentUser.department`
- **Dùng field nào:** 
  - `currentUser.department` (VD: "IT - Team Chuyển Đổi Số")
  - `business_trip.department` (field trong D1)
- **Logic:** 
  ```
  IF role_code == "TRUONG_PHONG":
      - CHỈ hiện nút Duyệt TP nếu business_trip.department == currentUser.department
      - CHỈ cho duyệt nếu business_trip.status == "PENDING"
  ```

#### **B) GĐ / P.GĐ / P.TGĐ (Cấp BGĐ):**
- **Vấn đề hiện tại:** Chưa có "phạm vi khối" trong schema
- **Đề xuất thêm vào DB (hoặc cấu hình):**
  ```sql
  ALTER TABLE users ADD COLUMN managed_cluster TEXT;
  -- VD: GĐ-003 -> managed_cluster = "Khối Sản Xuất & Nhà Máy"
  ```
- **Hoặc dùng `department` trực tiếp:**
  ```
  IF role_code IN ("GIAM_DOC", "PHO_GIAM_DOC"):
      - Duyệt Cấp 2 nhưng chỉ trong phạm vi department của mình
      - Nếu department giống "Ban Giám Đốc" thì duyệt all
  ```

#### **C) TGĐ (TONG_GIAM_DOC):**
- **Phạm vi:** Toàn bộ, KHÔNG giới hạn
- **Logic:**
  ```
  IF role_code == "TONG_GIAM_DOC":
      - Hiện nút Duyệt BGĐ cho ALL đơn ở trạng thái PENDING_L2
      - Không kiểm tra department
  ```

---

### 3️⃣ **Luồng Duyệt Khi Người Tạo Là Trưởng Phòng / GĐ / BGĐ**

**Câu hỏi cần xác nhận từ bạn:**

**Trường hợp 1:** Người tạo đơn có role `TRUONG_PHONG`
```
A) Bỏ qua Duyệt TP, đơn lên ngay PENDING_L2 (Cấp BGĐ) ?
B) Vẫn cần ai khác (Trưởng phòng cấp cao) duyệt TP ?
```

**Trường hợp 2:** Người tạo đơn có role `GIAM_DOC` hoặc `PHO_GIAM_DOC`
```
A) Bỏ qua cả Duyệt TP (vì GĐ > TP), lên ngay PENDING_L2 ?
B) Vẫn cần duyệt TP từ Trưởng phòng, rồi GĐ duyệt BGĐ (L2) ?
```

**Trường hợp 3:** Người tạo là TGĐ
```
A) Tự động APPROVED ngay (skip cả 2 bước) ?
B) Vẫn phải qua luồng 2 cấp (L1 + L2) ?
```

---

### 4️⃣ **Trạng Thái Đơn Ở Mỗi Bước**

**Trạng thái Current (D1):**
```sql
status ENUM('PENDING', 'PENDING_L2', 'APPROVED', 'REJECTED')
approved_level ENUM('L1', 'L2', NULL)
```

**Đề xuất trạng thái mô tả:**
```
PENDING (approved_level = NULL)
    ↓ [Trưởng phòng duyệt]
PENDING_L2 (approved_level = "L1")
    ↓ [BGĐ duyệt]
APPROVED (approved_level = "L2")

REJECTED (approved_level = "L1" hoặc "L2")
    + rejected_level = "L1" hoặc "L2"
    + rejection_reason
```

**Màn hình hiển thị:**
```
Status | Hiển Thị UI
───────┼──────────────────────────────────────
PENDING | "⏳ Chờ Trưởng Phòng duyệt (Cấp 1)"
PENDING_L2 | "⏳ Chờ Ban Giám Đốc duyệt (Cấp 2)"
APPROVED | "✓ Đã duyệt hoàn tất"
REJECTED | "❌ Bị từ chối (Cấp L1/L2) - Lý do: ..."
```

---

## 📌 TÓM TẮT CẦN XÁC NHẬN

**Vui lòng xác nhận các điểm sau:**

### **Câu 1:** Luồng duyệt khi người tạo là Trưởng phòng?
- [ ] A) Bỏ qua Duyệt TP, lên ngay PENDING_L2 cho BGĐ
- [ ] B) Vẫn cần người khác TP duyệt, sau đó GĐ duyệt BGĐ

### **Câu 2:** Luồng duyệt khi người tạo là GĐ/PGĐ?
- [ ] A) Bỏ qua cả Duyệt TP, lên ngay PENDING_L2 (GĐ >= TP)
- [ ] B) Vẫn phải qua luồng 2 cấp (TP → GĐ)
- [ ] C) Lên ngay APPROVED (GĐ tự duyệt xong?)

### **Câu 3:** Luồng duyệt khi người tạo là TGĐ?
- [ ] A) Tự động APPROVED (skip cả 2 cấp)
- [ ] B) Vẫn phải qua Duyệt TP → BGĐ → TGĐ
- [ ] C) Tự TGĐ duyệt ngay (1 lần), APPROVED

### **Câu 4:** GĐ/PGĐ/PTGĐ có giới hạn phạm vi duyệt không?
- [ ] A) Không, duyệt TẤT CẢ đơn ở PENDING_L2
- [ ] B) Có, duyệt chỉ trong phòng ban / khối của mình
   - [ ] Nếu B, dùng field nào để định nghĩa "khối của mình"? (department, managed_cluster, ...)

### **Câu 5:** Trạng thái hiển thị có đúng không?
- [ ] PENDING = "Chờ TP duyệt"
- [ ] PENDING_L2 = "Chờ BGĐ duyệt"
- [ ] APPROVED = "Đã duyệt hoàn tất"
- [ ] REJECTED = "Bị từ chối (Cấp X)"

---

## 🔐 GHI CHÚ BẢO MẬT

- ✅ Kiểm tra server-side (không chỉ ẩn nút UI)
- ✅ Không tự duyệt đơn của chính mình (SEGREGATION_OF_DUTIES_VIOLATION)
- ✅ Validate role_code trước khi duyệt
- ✅ Log lịch sử duyệt: ai, lúc nào, ở bước nào, lý do từ chối

---

**Status:** ⏳ CHỜ XÁC NHẬN TỪ USER (Bước 3)  
**Tiếp theo:** BƯỚC 4 - TRIỂN KHAI (sau xác nhận)
