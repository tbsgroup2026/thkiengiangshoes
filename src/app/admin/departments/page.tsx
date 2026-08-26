'use client';

import { useState } from 'react';

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState([
    { id: 1, code: 'PROD', name: 'Sản Xuất (Production)', desc: 'Quản lý chuyền may, đóng gói và máy móc sản xuất' },
    { id: 2, code: 'QC', name: 'Kiểm Soát Chất Lượng (QC)', desc: 'Kiểm tra chất lượng thành phẩm & bán thành phẩm' },
    { id: 3, code: 'MAINT', name: 'Bảo Trì - Kỹ Thuật (Maintenance)', desc: 'Sửa chữa và bảo dưỡng toàn bộ hệ thống máy nhà máy' },
    { id: 4, code: 'HR', name: 'Nhân Sự (HR)', desc: 'Quản lý hồ sơ nhân viên, tuyển dụng và hợp đồng' },
    { id: 5, code: 'ACCT', name: 'Kế Toán - Tài Chính', desc: 'Duyệt đề xuất thanh toán, hóa đơn và thu chi' },
    { id: 6, code: 'LOG', name: 'Kho Vận / Logistics', desc: 'Nhập xuất nguyên vật liệu và điều phối giao hàng' },
    { id: 7, code: 'IT', name: 'Công Nghệ Thông Tin (IT)', desc: 'Quản trị hệ thống máy tính, mạng và phần mềm TBS' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ code: '', name: '', desc: '' });

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    setDepartments([...departments, { id: departments.length + 1, ...newDept }]);
    setShowModal(false);
    setNewDept({ code: '', name: '', desc: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-tbs-dark">Quản Lý Phòng Ban Doanh Nghiệp</h1>
          <p className="text-xs text-gray-500 mt-1">Danh sách phòng ban áp dụng RBAC và scope quản lý giấy tờ</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-light transition shadow-md"
        >
          + Thêm Phòng Ban Mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eef7f2] text-xs font-semibold text-tbs-dark uppercase border-b border-emerald-100">
              <th className="p-4">Mã Code</th>
              <th className="p-4">Tên Phòng Ban</th>
              <th className="p-4">Mô Tả Chức Năng</th>
              <th className="p-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50/80 transition">
                <td className="p-4 font-mono font-bold text-accent">{d.code}</td>
                <td className="p-4 font-semibold text-tbs-dark">{d.name}</td>
                <td className="p-4 text-gray-600">{d.desc}</td>
                <td className="p-4 text-right space-x-2">
                  <button className="text-emerald-700 hover:underline">Sửa</button>
                  <button className="text-red-500 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-tbs-dark">Thêm Phòng Ban Mới</h2>
            <form onSubmit={handleAddDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Mã Phòng Ban (Code) *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: SALES"
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Tên Phòng Ban *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Kinh Doanh & Sales"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mô Tả Nhiệm Vụ</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả công việc phòng ban..."
                  value={newDept.desc}
                  onChange={(e) => setNewDept({ ...newDept, desc: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white font-bold hover:bg-accent-light"
                >
                  Thêm Phòng Ban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
