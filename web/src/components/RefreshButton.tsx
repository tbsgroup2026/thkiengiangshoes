'use client';

import { IconRefresh } from '@tabler/icons-react';

// Nút "Làm mới dữ liệu" — dùng ở góc trên bên phải các trang có nhiều dòng dữ liệu (Danh Sách
// MMTB, Nhu Cầu Sửa Chữa, Bảo Dưỡng, Đề Xuất, Thời Gian Phản Hồi, Nhân Sự, Thông Báo, Danh Mục
// Hư, Quản Lý Danh Mục...). Dữ liệu các trang này được cache tạm 5 phút phía Worker (xem
// mmtbCachedJson trong _worker.js) để đọc nhanh hơn — bấm nút này gửi kèm ?fresh=1 để bỏ qua
// cache, luôn lấy đúng dữ liệu mới nhất từ tbsMayMoc ngay lập tức.
export default function RefreshButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title="Lấy dữ liệu mới nhất từ tbsMayMoc (bỏ qua cache)"
      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
    >
      <IconRefresh size={14} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
    </button>
  );
}
