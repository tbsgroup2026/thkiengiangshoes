# Kaizen Modal - Thiết kế cập nhật

## Tóm tắt thay đổi

Modal "Đăng Ký Đề Xuất Cải Tiến Mới" đã được cập nhật để giống với thiết kế tham chiếu từ `tbs-thoaisonshoes.com`.

### ✨ Các cải tiến chính:

1. **Bố cục Section rõ ràng**
   - ✅ THÔNG TIN CƠ BẢN (Mầu xanh lam)
   - ✅ NỘI DUNG ĐỀ XUẤT (Mầu vàng)
   - ✅ CHỤP ẢNH - TÙY CHỌN (Mầu xanh da trời)

2. **Trường dữ liệu chi tiết trong THÔNG TIN CƠ BẢN**
   - Ngày Đề Xuất (tự động, không chỉnh sửa)
   - Họ và Tên (tự động từ profile người dùng)
   - Nhà Máy
   - Bộ Phận Làm Việc
   - Đối Tượng (Thi Đua / Lưu Trữ)
   - Mã Số Nhân Viên (tự động, không chỉnh sửa)
   - Nơi Đề Xuất
   - Mã Giày (với nút tìm kiếm)
   - Số Thứ Tự BOL
   - Tên Công Đoạn BOL
   - Danh Mục Phân Loại
   - Khu Vực / Chi Nhánh

3. **Nội Dung Đề Xuất rõ ràng**
   - Hiện Trạng (textarea 3 dòng)
   - Ý Tưởng Cải Tiến (textarea 3 dòng)
   - Ghi Chú Lý Do

4. **Chụp Ảnh Section**
   - 2 cột: Ảnh Hiện Trạng & Ảnh Cải Tiến
   - Hiển thị placeholder ảnh
   - Input cho link ảnh hoặc chụp
   - Ghi chú hướng dẫn rõ ràng

5. **Header & Footer**
   - Header gọn nhẹ với icon & tiêu đề
   - Footer với nút Hủy & GỬI ĐỀ XUẤT (màu xanh lá)

---

## Đoạn code thay đổi:

### File: `d:\Work\TBS II\web\src\modules\ci\CIModule.tsx`
- **Dòng 1087-1292**: Thay thế toàn bộ modal Create Proposal
- **Thêm**: Cấu trúc 3 section với các trường chi tiết
- **Thêm**: Khối chụp ảnh tùy chọn với placeholder
- **Cải tiến**: UX/UI khớp với thiết kế tham chiếu

---

## Trạng thái Build

✅ **Build thành công** - Compiled in 8.3s
✅ **Không lỗi compile**
✅ **TypeScript check: OK**

---

## Hướng dẫn kiểm thử

1. Mở trang Kaizen: `https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen`
2. Nhấp nút "Đăng Tải" hoặc "📝 Đăng Ký Đề Xuất Cải Tiến Mới"
3. Modal mới sẽ hiển thị với layout 3 section

---

## So sánh với thiết kế tham chiếu

| Yếu tố | Cũ | Mới |
|--------|----|----|
| Cấu trúc section | Không rõ | ✅ 3 section rõ ràng |
| Trường dữ liệu | 6 trường | ✅ 13+ trường chi tiết |
| Layout | 2 cột | ✅ 3 cột (tương ứng reference) |
| Chụp ảnh | Input đơn | ✅ 2 khối placeholder |
| Header | Gradient xanh lá | ✅ Đơn giản, xanh trắng |
| Icon section | Không | ✅ Icon có màu cho mỗi section |

---

**Cập nhật: 21/08/2026**
**Version: 2.0 - Reference Design Implementation**
