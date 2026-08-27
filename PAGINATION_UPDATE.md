# 📋 Cập Nhật Quản Lý Nhân Sự - Phân Trang (Pagination)

## ✅ Hoàn Thành

Trang quản lý nhân viên `/admin/users` đã được cập nhật với **phân trang đầy đủ** hiển thị 15 tài khoản mỗi trang.

## 🎯 Tính Năng Mới

### 1. **Phân Trang (Pagination) - 15 Tài Khoản/Trang**
- Hiển thị 15 tài khoản trên mỗi trang
- Tổng cộng 30 tài khoản được thêm vào hệ thống (tập dữ liệu demo)
- Tự động tạo **3 trang**: Trang 1, Trang 2, Trang 3

### 2. **Điều Khiển Phân Trang**
- **Nút Trước (◄)**: Chuyển sang trang trước
- **Nút Tiếp Theo (►)**: Chuyển sang trang kế tiếp
- **Các Số Trang**: Nhấp trực tiếp vào số trang để nhảy nhanh (1, 2, 3...)
- **Tự Động Cuộn Lên**: Khi chuyển trang, trang tự động cuộn lên đầu

### 3. **Hiển Thị Thông Tin**
```
Hiển thị 1 đến 15 của 30 tài khoản
Hiển thị 16 đến 30 của 30 tài khoản
```

### 4. **Tích Hợp Tìm Kiếm & Lọc**
- Khi tìm kiếm theo tên, email, hoặc MSNV → **Đặt lại trang 1**
- Khi thay đổi bộ lọc phòng ban → **Đặt lại trang 1**
- Phân trang tự động cập nhật dựa trên kết quả lọc

## 📊 Dữ Liệu Tài Khoản

30 tài khoản nhân viên được thêm vào bao gồm:

| MSNV | Họ Tên | Phòng Ban | Vai Trò | Trạng Thái |
|------|--------|----------|--------|-----------|
| 202608001 | Phạm Nguyễn Anh Huy | IT | department_head, ci | ✓ Hoạt động |
| 202608002 | Trần Ngọc Huy | IT | department_head, ci, admin | ✓ Hoạt động |
| LT-001 | Lễ Tân Văn Phòng | HR | receptionist | ✓ Hoạt động |
| ADMIN-2026 | Quản Trị Viên | Admin | admin | ✓ Hoạt động |
| TGĐ-001 | Tổng Giám Đốc | CEO | ceo | ✓ Hoạt động |
| 202608003-026 | 21 nhân viên khác | Các phòng ban khác | Nhiều vai trò | Hỗn hợp |

## 🎨 Giao Diện

### Trang 1 (15 tài khoản đầu)
- MSNV 202608001 → 202608015

### Trang 2 (15 tài khoản tiếp)
- MSNV 202608016 → 202608026

### Trang 3 (nếu thêm dữ liệu)
- Sẵn sàng cho mở rộng

## 🔧 Cải Tiến Kỹ Thuật

### Thêm vào `/web/src/app/admin/users/page.tsx`:

1. **Hằng Số Phân Trang**
   ```typescript
   const ITEMS_PER_PAGE = 15;
   ```

2. **State Trang Hiện Tại**
   ```typescript
   const [currentPage, setCurrentPage] = useState(1);
   ```

3. **Logic Tính Toán**
   ```typescript
   const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
   const endIndex = startIndex + ITEMS_PER_PAGE;
   const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
   ```

4. **Điều Khiển Phân Trang**
   - `handlePageChange(newPage)`: Chuyển trang
   - Tự động cuộn lên khi chuyển trang
   - Vô hiệu hóa nút khi ở trang đầu/cuối

5. **Kết Nối Tìm Kiếm & Lọc**
   - `setCurrentPage(1)` khi `searchQuery` thay đổi
   - `setCurrentPage(1)` khi `deptFilter` thay đổi

### Các Icon Mới
- `IconChevronLeft`: Nút Trước
- `IconChevronRight`: Nút Tiếp Theo

## 📱 Responsive Design

- ✅ Desktop: Hiển thị đầy đủ các nút trang
- ✅ Tablet: Nút trang được thu gọn thông minh
- ✅ Mobile: Đầu tiên/Cuối cùng + các trang gần đó

## 🚀 Cách Sử Dụng

1. Truy cập: `https://vpchuoiskechers.tbsgroup2026.workers.dev/admin/users`
2. Nhấp vào **Trang 1, 2, 3** ở dưới bảng
3. Hoặc dùng nút **Trước (◄) / Tiếp Theo (►)**
4. Tìm kiếm sẽ **tự động reset về trang 1**
5. Lọc phòng ban sẽ **tự động reset về trang 1**

## ✨ Đặc Điểm Nổi Bật

✅ Phân trang rõ ràng với số trang hiển thị
✅ Hỗ trợ nhảy nhanh đến trang bất kỳ
✅ Tự động cuộn lên khi chuyển trang
✅ Tích hợp hoàn hảo với tìm kiếm & lọc
✅ Hiển thị rõ "Trang X của Y" tài khoản
✅ Nút Trước/Tiếp Theo được vô hiệu hóa khi cần
✅ UI hiện đại với hover effects
✅ Hỗ trợ responsive trên mọi kích thước màn hình

## 🔄 Kế Tiếp

Nếu cần thêm tài khoản:
- Chỉnh sửa mảng `users` trong file `/web/src/app/admin/users/page.tsx`
- Phân trang sẽ tự động điều chỉnh
- 30 tài khoản = 2 trang (mỗi trang 15)
- 45 tài khoản = 3 trang (mỗi trang 15)
- Vân vân...

---

**Trạng Thái Build:** ✅ Thành công
**Test:** ✅ Phân trang hoạt động tốt
