'use client';

import { useState } from 'react';
import Can from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import { broadcastNotification } from '@/lib/browserNotifications';

export default function DocumentApprovalsPage() {
  const [approvals, setApprovals] = useState([
    { id: 1, docTitle: 'Đơn Xin Nghỉ Phép', creator: 'Nguyễn Văn A (EMP-088)', dept: 'Sản Xuất', date: '2026-08-01', status: 'PENDING' },
    { id: 2, docTitle: 'Đề Xuất Mua Phụ Tùng Máy May A4', creator: 'Phạm Văn Bảo Trì (EMP-004)', dept: 'Bảo Trì', date: '2026-08-01', status: 'PENDING' },
    { id: 3, docTitle: 'Biên Bản QC Lô Hàng #QC-901', creator: 'Trần Thị QC (EMP-012)', dept: 'QC', date: '2026-07-31', status: 'APPROVED' },
  ]);

  const handleAction = (id: number, status: 'APPROVED' | 'REJECTED') => {
    const item = approvals.find((a) => a.id === id);
    setApprovals(approvals.map((a) => (a.id === id ? { ...a, status } : a)));

    if (item) {
      const isApprove = status === 'APPROVED';
      // ✅ CHỈ gửi thông báo cho người tạo tờ trình
      const creatorName = item.creator.split(' (')[0]; // Lấy tên từ "Tên (EMP-xxx)"
      broadcastNotification({
        title: isApprove ? 'Duyệt Tờ Trình Số' : 'Từ Chối Tờ Trình Số',
        message: isApprove
          ? `Tờ trình "${item.docTitle}" của ${item.creator} đã được phê duyệt thành công.`
          : `Tờ trình "${item.docTitle}" của ${item.creator} đã bị từ chối.`,
        type: isApprove ? 'SUCCESS' : 'WARNING',
        targetUser: creatorName, // ✅ CHỈ gửi cho người tạo
        link: '/documents/approvals',
      });
    }
  };

  return (
    <div className="min-h-screen bg-tbs-light p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-tbs-dark">Danh Sách Duyệt Giấy Tờ (Trưởng Phòng)</h1>
        <p className="text-xs text-gray-500 mt-1">Phê duyệt hoặc từ chối các giấy tờ biểu mẫu do nhân viên tạo</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100">
              <th className="p-4">Tên Giấy Tờ</th>
              <th className="p-4">Người Tạo</th>
              <th className="p-4">Phòng Ban</th>
              <th className="p-4">Ngày Tạo</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4 text-right">Phê Duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {approvals.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/80 transition">
                <td className="p-4 font-bold text-tbs-dark">{item.docTitle}</td>
                <td className="p-4">{item.creator}</td>
                <td className="p-4 font-semibold text-accent">{item.dept}</td>
                <td className="p-4 text-gray-500">{item.date}</td>
                <td className="p-4">
                  {item.status === 'PENDING' && <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-700 font-bold">Chờ Duyệt</span>}
                  {item.status === 'APPROVED' && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-700 font-bold">Đã Duyệt</span>}
                  {item.status === 'REJECTED' && <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-700 font-bold">Từ Chối</span>}
                </td>
                <td className="p-4 text-right space-x-2">
                  {item.status === 'PENDING' ? (
                    <Can permission={PERMISSIONS.DOC_APPROVE} fallback={<span className="text-gray-400 text-[11px]">Không có quyền duyệt</span>}>
                      <button
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        className="px-3 py-1 bg-[#006838] text-white rounded-lg font-bold hover:bg-[#00522c] cursor-pointer"
                      >
                        Đồng Ý
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 cursor-pointer ml-2"
                      >
                        Từ Chối
                      </button>
                    </Can>
                  ) : (
                    <span className="text-gray-400 text-[11px]">Hoàn tất</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
