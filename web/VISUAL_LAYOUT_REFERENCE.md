# 🎨 Kaizen Modal - Visual Layout Reference

## Tổng Quan Modal Layout

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  [+] Đăng Ký Đề Xuất Cải Tiến Mới    [✕]  ┃  ← Header
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩

┃  ℹ️ THÔNG TIN CƠ BẢN                       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  [Ngày]              [Họ Tên]          [Nhà Máy]       ┃
┃  [Bộ Phận]           [Đối Tượng ▼]     [Mã NV]         ┃
┃  [Nơi Đề Xuất]       [Mã Giày] [🔍]    [Số BOL]        ┃
┃  [Tên Công Đoạn]     [Danh Mục ▼]      [Khu Vực ▼]     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃

┃  📝 NỘI DUNG ĐỀ XUẤT                       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  Hiện Trạng:                                 ┃
┃  ┌─────────────────────────────────────┐   ┃
┃  │                                     │   ┃
┃  │  (3 dòng textarea)                  │   ┃
┃  │                                     │   ┃
┃  └─────────────────────────────────────┘   ┃
┃                                              ┃
┃  Ý Tưởng Cải Tiến:                         ┃
┃  ┌─────────────────────────────────────┐   ┃
┃  │                                     │   ┃
┃  │  (3 dòng textarea)                  │   ┃
┃  │                                     │   ┃
┃  └─────────────────────────────────────┘   ┃
┃                                              ┃
┃  Ghi Chú Lý Do:  [Số giây tiết kiệm]       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃

┃  📷 CHỤP ẢNH (TÙY CHỌN)                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃  ┌──────────────────────┐  ┌──────────────────────┐  ┃
┃  │    🖼️ Placeholder    │  │   🖼️ Placeholder    │  ┃
┃  │     [120×100px]      │  │    [120×100px]       │  ┃
┃  └──────────────────────┘  └──────────────────────┘  ┃
┃                                                        ┃
┃  Ảnh Hiện Trạng:           Ảnh Cải Tiến:             ┃
┃  [Link hoặc chụp]          [Link hoặc chụp]          ┃
┃  \"Chụp hiện tại...\"       \"Chụp sau cải tiến...\"    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃

┃  ┌──────────────┐            ┌──────────────────────┐  ┃
┃  │   Hủy        │            │  ➤ GỬI ĐỀ XUẤT      │  ┃
┃  └──────────────┘            └──────────────────────┘  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## Desktop Layout (max-w-2xl = 42rem)

### Row Layout cho THÔNG TIN CƠ BẢN

```
┌─────────────────────────────────────────────────────────────┐
│ Row 1 (3-column grid, gap-3)                               │
├─────────────────────┬──────────────────┬──────────────────┤
│ Ngày Đề Xuất        │ Họ và Tên        │ Nhà Máy          │
│ [date disabled]     │ [text disabled]  │ [text input]     │
├─────────────────────┼──────────────────┼──────────────────┤
│ W: 32%              │ W: 32%           │ W: 32%           │
│ bg: slate-50        │ bg: slate-50     │ bg: white        │
│ cursor: not-allowed │ cursor: not-allowed             │
└─────────────────────┴──────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Row 2 (3-column grid, gap-3)                               │
├─────────────────────┬──────────────────┬──────────────────┤
│ Bộ Phận Làm Việc    │ Đối Tượng        │ Mã Số Nhân Viên  │
│ [text input]        │ [select ▼]       │ [text disabled]  │
├─────────────────────┼──────────────────┼──────────────────┤
│ Optional            │ Required         │ Auto-fill        │
│ placeholder: VD...  │ Options:         │ bg: slate-50     │
│                     │ - Thi Đua        │                  │
│                     │ - Lưu Trữ        │                  │
└─────────────────────┴──────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Row 3 (3-column grid, gap-3)                               │
├─────────────────────┬──────────────────┬──────────────────┤
│ Nơi Đề Xuất         │ Mã Giày          │ Số Thứ Tự BOL    │
│ [text input]        │ [text]+[🔍 btn]  │ [text input]     │
├─────────────────────┼──────────────────┼──────────────────┤
│ Optional            │ Optional         │ Optional         │
│ VD: Khu vực PKG     │ + search icon    │ VD: BOL-001      │
└─────────────────────┴──────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Row 4 (3-column grid, gap-3)                               │
├─────────────────────┬──────────────────┬──────────────────┤
│ Tên Công Đoạn BOL   │ Danh Mục         │ Khu Vực / CN      │
│ [text input]        │ [select ▼]       │ [select ▼]       │
├─────────────────────┼──────────────────┼──────────────────┤
│ Optional            │ Required ★       │ Required ★       │
│ Auto from BOL       │ 8 categories     │ 6 regions        │
└─────────────────────┴──────────────────┴──────────────────┘
```

---

## Mobile Layout (< 640px)

```
┌───────────────────────┐
│ Row 1 (1-column)      │
├───────────────────────┤
│ Ngày Đề Xuất          │
│ [date disabled]       │
├───────────────────────┤
│ Họ và Tên             │
│ [text disabled]       │
├───────────────────────┤
│ Nhà Máy               │
│ [text input]          │
├───────────────────────┤
│ Row 2                 │
├───────────────────────┤
│ Bộ Phận Làm Việc      │
│ [text input]          │
├───────────────────────┤
│ Đối Tượng             │
│ [select ▼]            │
├───────────────────────┤
│ Mã Số Nhân Viên       │
│ [text disabled]       │
└───────────────────────┘
... (tương tự cho rows khác)
```

---

## Color & Styling Reference

### Section Headers
```
┌─────────────────────────────────────────┐
│ [ℹ️]  THÔNG TIN CƠ BẢN                  │  ← Icon: Blue-100 bg
│ (font-black, text-xs, tracking-tight)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [📝]  NỘI DUNG ĐỀ XUẤT                  │  ← Icon: Yellow-100 bg
│ (font-black, text-xs, tracking-tight)  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [📷]  CHỤP ẢNH (TÙY CHỌN) (Không bắt buộc)  │  ← Icon: Blue-100 bg
│ (font-black, text-xs, tracking-tight)  │
└─────────────────────────────────────────┘
```

### Input Styling

**Disabled Input (Auto-fill):**
```
┌──────────────────────┐
│ 21/08/2026           │
│ bg: slate-50         │
│ border: slate-300    │
│ text: slate-600      │
│ cursor: not-allowed  │
│ opacity: 60%         │
└──────────────────────┘
```

**Normal Input (User Input):**
```
┌──────────────────────┐
│ [Placeholder text]   │
│ bg: white            │
│ border: slate-300    │
│ focus: border-[#006838] (2px green)  │
│ cursor: pointer      │
│ outline: none        │
└──────────────────────┘
```

**Select Dropdown:**
```
┌──────────────────────────────────┐
│ Thi Đua                      [▼]  │
│ bg: white                        │
│ border: slate-300                │
│ focus: border-[#006838]          │
│ font: bold, text-xs              │
└──────────────────────────────────┘
```

**Textarea (3 rows):**
```
┌─────────────────────────────────────┐
│ Mô tả tình trạng hiện tại...        │
│                                     │
│                                     │
│                                     │
│ (rows=3, resize: none)              │
└─────────────────────────────────────┘
```

---

## Image Upload Section Layout

### Desktop (2-column)
```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│    🖼️ PLACEHOLDER            │  │    🖼️ PLACEHOLDER            │
│     [Icon centered]          │  │     [Icon centered]          │
│  ┌────────────────────────┐  │  │  ┌────────────────────────┐  │
│  │ 32×32px camera icon    │  │  │  │ 32×32px camera icon    │  │
│  │ text-slate-400         │  │  │  │ text-slate-400         │  │
│  └────────────────────────┘  │  │  └────────────────────────┘  │
│  Height: h-24 (96px)         │  │  Height: h-24 (96px)         │
│  Background: bg-slate-50     │  │  Background: bg-slate-50     │
│                              │  │                              │
│  Ảnh Hiện Trạng (Trước):     │  │  Ảnh Cải Tiến (Sau):         │
│  font-black, text-slate-900  │  │  font-black, text-slate-900  │
│                              │  │                              │
│  [Link input hoặc chụp]      │  │  [Link input hoặc chụp]      │
│  px-3 py-2                   │  │  px-3 py-2                   │
│                              │  │                              │
│  \"Chụp ảnh hiện tại...\"    │  │  \"Chụp ảnh sau cải tiến...\" │
│  font-medium, text-slate-500 │  │  font-medium, text-slate-500 │
│                              │  │                              │
└──────────────────────────────┘  └──────────────────────────────┘

Grid: grid-cols-1 sm:grid-cols-2
Border: border-2 border-dashed border-slate-300
Padding: p-3
Border radius: rounded-lg
Hover: border-slate-400
```

### Mobile (1-column)
```
┌────────────────────────┐
│  🖼️ PLACEHOLDER        │
│   (full width)         │
│  [Link input]          │
│  "Chụp ảnh hiện tại.." │
│                        │
│  🖼️ PLACEHOLDER        │
│   (full width)         │
│  [Link input]          │
│  "Chụp ảnh sau.."      │
└────────────────────────┘
```

---

## Button Bar Layout

```
┌───────────────────────────────────────────────────────────┐
│ ┌──────────────┐                 ┌──────────────────────┐│
│ │  Hủy         │                 │ ➤ GỬI ĐỀ XUẤT      ││
│ │ border-slate │                 │ bg: #006838         ││
│ │ text: slate  │                 │ text: white         ││
│ │ px-5 py-2.5  │                 │ px-6 py-2.5         ││
│ │ hover:       │                 │ hover: #004d29      ││
│ │   bg-slate50 │                 │ shadow-md           ││
│ └──────────────┘                 └──────────────────────┘│
│                                                           │
│ gap-3, justify-end, py-4                                │
│ border-t: border-slate-200                              │
└───────────────────────────────────────────────────────────┘
```

---

## Separators & Dividers

```
Section Separator:
─────────────────────────────────────────────
border: border-slate-200
padding: pb-4 before, pt-4 after (implicit)

Between Sections:
border-b border-slate-200 (dashed in section headers)
```

---

## Spacing & Sizing

```
Modal Container:
  width: w-full max-w-2xl (max 42rem / 672px)
  border-radius: rounded-2xl (16px)
  box-shadow: shadow-2xl
  overflow: hidden

Header:
  padding: p-4
  border-b: border-slate-200

Form Content:
  padding: p-6
  space: space-y-5 (gap between sections)

Each Section:
  space-y-3 (gap between items in section)
  pb-4 border-b border-slate-200 (except last)

Fields:
  space-y-1 (label to input)
  gap-3 (between grid items)

Buttons:
  pt-4 border-t border-slate-200
  justify: flex-end
  gap-3
```

---

## Font & Typography

```
Header Title:
  font-black, text-sm

Section Headers:
  font-black, text-xs, tracking-tight
  text-slate-900

Labels:
  font-black, text-slate-900

Input/Textarea:
  font-bold (text, select), font-medium (textarea)
  text-xs

Helper Text / Placeholders:
  font-medium or font-normal
  text-slate-500 / text-slate-400
  text-[11px] or text-[10px]
```

---

## Responsive Breakpoints

```
Mobile: max-w-full (< 640px / sm)
  - 1 column layout
  - Full width inputs
  - Vertical image stack
  
Tablet: sm (≥ 640px)
  - sm:grid-cols-3 (main section)
  - sm:grid-cols-2 (images)
  
Desktop: lg (≥ 1024px)
  - Same as tablet but in max-w-2xl container
  - Centered on screen with padding
```

---

**Created on**: 21/08/2026  
**Reference**: tbs-thoaisonshoes.com/repair_management/kaizen/kaizen_request.php  
**Version**: 2.0 Visual Layout
