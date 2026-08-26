# 📋 Hướng Dẫn Chi Tiết Các Trường Trong Modal Kaizen

## 🎯 SECTION 1: THÔNG TIN CƠ BẢN

### Row 1

**1️⃣ Ngày Đề Xuất** (Date)
- **Loại**: Ngày tháng năm
- **Bắt buộc**: Có
- **Tính năng**: Auto-fill ngày hôm nay, disabled (không chỉnh sửa)
- **Ví dụ**: 21/08/2026

**2️⃣ Họ và Tên** (Text)
- **Loại**: Văn bản
- **Bắt buộc**: Có
- **Tính năng**: Auto-fill từ profile người dùng đang đăng nhập, disabled
- **Ví dụ**: Phạm Nguyễn Anh Huy

**3️⃣ Nhà Máy** (Text)
- **Loại**: Văn bản tự do
- **Bắt buộc**: Không
- **Tính năng**: Người dùng nhập tự do
- **Ví dụ**: VP2 SKECHERS, Kiên Giang 1

### Row 2

**4️⃣ Bộ Phận Làm Việc** (Text)
- **Loại**: Văn bản tự do
- **Bắt buộc**: Không
- **Tính năng**: Người dùng nhập tự do
- **Ví dụ**: Quản Lý Chất Lượng, Sản Xuất

**5️⃣ Đối Tượng** (Select)
- **Loại**: Dropdown lựa chọn
- **Bắt buộc**: Có
- **Tính năng**: Chọn loại đề xuất
- **Giá trị**:
  - 🏆 Thi Đua (Competition)
  - 📦 Lưu Trữ (Archive)
- **Ví dụ**: Thi Đua

**6️⃣ Mã Số Nhân Viên** (Text)
- **Loại**: Văn bản
- **Bắt buộc**: Có
- **Tính năng**: Auto-fill từ profile, disabled
- **Ví dụ**: 202608001

### Row 3

**7️⃣ Nơi Đề Xuất** (Text)
- **Loại**: Văn bản tự do
- **Bắt buộc**: Không
- **Tính năng**: Vị trí cụ thể nơi phát hiện vấn đề
- **Ví dụ**: Khu vực PKG (đóng hộp), Công đoạn phun keo

**8️⃣ Mã Giày** (Text + Search)
- **Loại**: Văn bản + nút tìm kiếm
- **Bắt buộc**: Không (tùy chọn)
- **Tính năng**: 
  - Nhập mã sản phẩm
  - Nút 🔍 để tìm kiếm từ database
- **Ví dụ**: SK123, SL456

**9️⃣ Số Thứ Tự BOL** (Text)
- **Loại**: Văn bản
- **Bắt buộc**: Không
- **Tính năng**: Nhập số BOL từ máy sản xuất
- **Ví dụ**: BOL-001, BOL-2026-001

### Row 4

**🔟 Tên Công Đoạn BOL** (Text)
- **Loại**: Văn bản
- **Bắt buộc**: Không
- **Tính năng**: Tên công đoạn (có thể auto-fill từ BOL)
- **Ví dụ**: Phun keo lót giày, Đóng hộp, Kiểm chất lượng

**1️⃣1️⃣ Danh Mục Phân Loại** (Select)
- **Loại**: Dropdown lựa chọn
- **Bắt buộc**: Có
- **Tính năng**: Chọn loại cải tiến
- **Giá trị**:
  - 1. Tiết kiệm Vật tư
  - 2. Tiết kiệm Chi phí
  - 3. Tăng Năng suất
  - 4. An toàn lao động
  - 5. 5S
  - 6. Tự động hoá
  - 7. MMTB CCDC
  - 8. Khác
- **Ví dụ**: 3.Tăng Năng suất

**1️⃣2️⃣ Khu Vực / Chi Nhánh** (Select)
- **Loại**: Dropdown lựa chọn
- **Bắt buộc**: Có
- **Tính năng**: Chọn khu vực thực hiện
- **Giá trị**:
  - Kiên Giang 1
  - Kiên Giang 2
  - Kiên Giang 3
  - Hoàn Thiện Đế
  - Nhà Máy Miền Đông
  - VP Chuỗi (R&D)
- **Ví dụ**: Kiên Giang 1

---

## 📝 SECTION 2: NỘI DUNG ĐỀ XUẤT

**1️⃣3️⃣ Hiện Trạng** (Textarea 3 dòng)
- **Loại**: Văn bản dài (textarea)
- **Bắt buộc**: Có
- **Tính năng**: Mô tả chi tiết tình trạng hiện tại trước cải tiến
- **Placeholder**: "Mô tả tình trạng hiện tại trước khi cải tiến..."
- **Ví dụ**: 
  ```
  Hiện tại, công đoạn phun keo lót giày vẫn thực hiện thủ công, 
  chiếm 45 giây/đôi. Keo không được phun đều, gây lãng phí 
  vật liệu 15-20% mỗi ca làm việc.
  ```

**1️⃣4️⃣ Ý Tưởng Cải Tiến** (Textarea 3 dòng)
- **Loại**: Văn bản dài (textarea)
- **Bắt buộc**: Có
- **Tính năng**: Mô tả giải pháp cải tiến đề xuất
- **Placeholder**: "Ghi rõ giải pháp cải tiến & những lợi ích mong đợi..."
- **Ví dụ**:
  ```
  Đề xuất lắp đặt robot phun keo tự động ABB IRB 1200 với điều khiển 
  vision AI. Giải pháp này sẽ: 
  - Giảm thời gian xuống 15 giây/đôi (-70%)
  - Tiết kiệm keo 5-8%
  - Tăng độ chính xác phun keo từ 85% → 99%
  ```

**1️⃣5️⃣ Ghi Chú Lý Do** (Number input - Giây tiết kiệm)
- **Loại**: Số
- **Bắt buộc**: Không
- **Tính năng**: Nhập thời gian tiết kiệm dự kiến (tính bằng giây)
- **Placeholder**: "Nhập số giây tiết kiệm dự kiến"
- **Ví dụ**: 30 (giây), 120 (giây)
- **Công thức**: Thời gian cũ - Thời gian mới = Tiết kiệm

---

## 📷 SECTION 3: CHỤP ẢNH (TÙY CHỌN)

**Chú ý**: Đây là section tùy chọn (Optional), người dùng không bắt buộc phải upload ảnh

### Ảnh Hiện Trạng (Trước Cải Tiến)
- **Loại**: Image upload / URL input
- **Bắt buộc**: Không
- **Tính năng**: Chụp hoặc paste link ảnh tình trạng hiện tại
- **Hướng dẫn**: "Chụp ảnh tình trạng hiện tại để so sánh"
- **Format**: JPG, PNG, WebP
- **Kích thước**: Max 5MB

### Ảnh Cải Tiến (Sau Cải Tiến)
- **Loại**: Image upload / URL input
- **Bắt buộc**: Không
- **Tính năng**: Chụp hoặc paste link ảnh sau cải tiến
- **Hướng dẫn**: "Chụp ảnh sau khi cải tiến để minh họa kết quả"
- **Format**: JPG, PNG, WebP
- **Kích thước**: Max 5MB

---

## 🔍 Các Trường Bắt Buộc vs Tùy Chọn

### ✅ BẮT BUỘC (Required):
1. Ngày Đề Xuất (auto)
2. Họ và Tên (auto)
3. Mã Số Nhân Viên (auto)
4. Đối Tượng (Thi Đua/Lưu Trữ)
5. Danh Mục Phân Loại
6. Khu Vực / Chi Nhánh
7. Hiện Trạng (textarea)
8. Ý Tưởng Cải Tiến (textarea)

### ❌ TÙYCHỌN (Optional):
1. Nhà Máy
2. Bộ Phận Làm Việc
3. Nơi Đề Xuất
4. Mã Giày
5. Số Thứ Tự BOL
6. Tên Công Đoạn BOL
7. Ghi Chú Lý Do (giây tiết kiệm)
8. Ảnh Hiện Trạng
9. Ảnh Cải Tiến

---

## 💡 Tips & Best Practices

### Khi Điền "Hiện Trạng":
- ✅ Mô tả chi tiết vấn đề cụ thể
- ✅ Nêu rõ tác động (thời gian, chi phí, an toàn)
- ✅ Có thể kèm ảnh chứng minh
- ❌ Không viết quá tối giản
- ❌ Không chê bai công nhân

### Khi Điền "Ý Tưởng Cải Tiến":
- ✅ Ghi rõ giải pháp cụ thể
- ✅ Liệt kê lợi ích (% tiết kiệm, tăng NS)
- ✅ Có thể tính toán sơ bộ chi phí
- ❌ Không ghi "tốt hơn" mà không rõ cách
- ❌ Không quá học thuật, phải hiểu được

### Khi Upload Ảnh:
- ✅ Ảnh trước: Rõ ràng vấn đề, góc nhìn tốt
- ✅ Ảnh sau: Tương tự góc, để so sánh
- ✅ Ảnh được crop sạch, focus vào khu vực liên quan
- ❌ Ảnh quá mờ hoặc bị che
- ❌ Ảnh không liên quan

---

## 📊 Thống Kê Trường

| Section | Số trường bắt buộc | Số trường tùy chọn | Total |
|---------|-------------------|-------------------|-------|
| THÔNG TIN CƠ BẢN | 4 auto + 4 nhập | 5 | 13 |
| NỘI DUNG ĐỀ XUẤT | 2 textarea | 1 | 3 |
| CHỤP ẢNH | 0 | 2 | 2 |
| **TỔNG CỘNG** | **10** | **8** | **18** |

---

**Cập nhật: 21/08/2026**
**Version: 2.0 Field Documentation**
