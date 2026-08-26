# Thiết Kế Modal Kaizen - So Sánh Chi Tiết

## 📊 Bảng So Sánh Giữa Thiết Kế Cũ & Mới

### Header
```
CŨ:
┌─────────────────────────────────────┐
│ [+] Đăng Ký Đề Xuất Cải Tiến Mới   │  ← Gradient xanh lá
│     Hệ thống ghi nhận Kaizen...     │
└─────────────────────────────────────┘

MỚI:
┌─────────────────────────────────────┐
│ [+] Đăng Ký Đề Xuất Cải Tiến Mới   │  ← Nền trắng, border dưới
└─────────────────────────────────────┘
```

---

## 🗂️ Cấu Trúc Section

### CŨ - Layout Phẳng
```
- Title (1 trường)
- Category (1 trường)
- Region (1 trường)
- Saved Seconds (1 trường)
- Before Description (1 textarea)
- After Solution (1 textarea)
```
**Total: 6 trường**

### MỚI - Layout Có Cấu Trúc (Từ tbs-thoaisonshoes.com)

#### SECTION 1: THÔNG TIN CƠ BẢN 📋
```
Row 1 (3 cột):
  └─ Ngày Đề Xuất: [date disabled]
  └─ Họ và Tên: [text disabled - auto]
  └─ Nhà Máy: [text input]

Row 2 (3 cột):
  └─ Bộ Phận Làm Việc: [text input]
  └─ Đối Tượng: [select: Thi Đua/Lưu Trữ]
  └─ Mã Số Nhân Viên: [text disabled - auto]

Row 3 (3 cột):
  └─ Nơi Đề Xuất: [text input]
  └─ Mã Giày: [text input + search icon]
  └─ Số Thứ Tự BOL: [text input]

Row 4 (3 cột):
  └─ Tên Công Đoạn BOL: [text input]
  └─ Danh Mục Phân Loại: [select]
  └─ Khu Vực / Chi Nhánh: [select]
```

#### SECTION 2: NỘI DUNG ĐỀ XUẤT 📝
```
Row 1 (full width):
  └─ Hiện Trạng: [textarea 3 dòng]

Row 2 (full width):
  └─ Ý Tưởng Cải Tiến: [textarea 3 dòng]

Row 3 (full width):
  └─ Ghi Chú Lý Do: [number input]
```

#### SECTION 3: CHỤP ẢNH (TÙY CHỌN) 📷
```
Row 1 (2 cột):
  ┌──────────────────────────────┐    ┌──────────────────────────────┐
  │  🖼️ [Placeholder]            │    │  🖼️ [Placeholder]            │
  │  Ảnh Hiện Trạng              │    │  Ảnh Cải Tiến                │
  │  [text input or capture]     │    │  [text input or capture]     │
  │  "Chụp tình trạng hiện tại"  │    │  "Chụp sau khi cải tiến"     │
  └──────────────────────────────┘    └──────────────────────────────┘
```

**Total: 13+ trường (chi tiết hơn)**

---

## 🎨 Styling Chi Tiết

### Colors & Icons Cho Các Section
```
Section 1 - THÔNG TIN CƠ BẢN:
  Icon: ℹ️ (Info) - Blue
  Background: white/slate-50
  Border: slate-300

Section 2 - NỘI DUNG ĐỀ XUẤT:
  Icon: 📝 (Edit) - Yellow
  Background: white/slate-50
  Border: slate-300

Section 3 - CHỤP ẢNH:
  Icon: 📷 (Camera) - Blue
  Background: white with dashed border
  Border: dashed slate-300
```

### Input Styling
```
Loại Input:
  - Ngày tháng: date picker + disabled (bg-slate-50)
  - Tên/Mã (auto): text disabled (bg-slate-50)
  - Text nhập: normal input (focus: border-[#006838])
  - Select: dropdown (focus: border-[#006838])
  - Textarea: 3 dòng (focus: border-[#006838])
  - Ảnh: Dashed border box with placeholder icon
```

---

## 📐 Grid Layout

### CŨ
```
grid-cols-1 sm:grid-cols-2 gap-3
(2 cột trên desktop)
```

### MỚI
```
SECTION 1-2: grid-cols-1 sm:grid-cols-3 gap-3
(3 cột trên desktop - khớp với tbs-thoaisonshoes)

SECTION 3: grid-cols-1 sm:grid-cols-2 gap-3
(2 cột ảnh side-by-side)
```

---

## 🔘 Buttons

### CŨ
```
┌────────────┐ ┌───────────────────┐
│   Hủy      │ │ [➤] Gửi Đề Xuất   │
└────────────┘ └───────────────────┘
```

### MỚI
```
┌──────────────┐ ┌──────────────────────────┐
│    Hủy       │ │ [➤] GỬI ĐỀ XUẤT        │  ← UPPERCASE
└──────────────┘ └──────────────────────────┘
(Border slate) │ (Bg #006838, white text)
```

---

## 📱 Responsive Behavior

```
Mobile (< 640px):
  - All sections stack vertically (1 column)
  - Inputs full width
  - Images stack vertically

Tablet (640px - 1024px):
  - SECTION 1-2: 3 columns
  - SECTION 3: 2 columns side-by-side

Desktop (> 1024px):
  - Same as tablet (optimized for max-w-2xl modal)
```

---

## ✅ Checklist Cập Nhật

- ✅ Thêm THÔNG TIN CƠ BẢN section
- ✅ Thêm 13+ trường dữ liệu
- ✅ Thêm NỘI DUNG ĐỀ XUẤT section (rõ ràng)
- ✅ Thêm CHỤP ẢNH section với 2 khối placeholder
- ✅ Cập nhật grid layout 3 cột
- ✅ Thêm icons màu cho mỗi section
- ✅ Đơn giản hóa header (loại gradient)
- ✅ Cập nhật buttons (UPPERCASE)
- ✅ Build test: ✅ PASS

---

**Được so sánh với:**
- Thiết kế cũ: vpchuoiskechers Kaizen
- Thiết kế tham chiếu: tbs-thoaisonshoes.com/repair_management/kaizen/kaizen_request.php

**Thay đổi lần cuối: 21/08/2026 (v2.0)**
