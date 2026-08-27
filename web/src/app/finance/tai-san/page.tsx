"use client";

import React, { useState } from "react";
import FinanceShell from "@/components/FinanceShell";
import {
  IconDeviceDesktop,
  IconCheck,
  IconPlus,
  IconSearch,
  IconFilter,
  IconPrinter,
  IconTool,
} from "@tabler/icons-react";

export default function TaiSanPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const assets = [
    {
      code: "TS-2026-001",
      name: "Máy ép đế thủy lực Skechers Max Cushion",
      category: "Máy móc thiết bị",
      originalVal: 450000000,
      depreciation: 120000000,
      currentVal: 330000000,
      dept: "Sản Xuất (NM1)",
      status: "Đang hoạt động",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      code: "TS-2026-002",
      name: "Hệ thống máy may tự động lập trình CNC",
      category: "Máy móc thiết bị",
      originalVal: 280000000,
      depreciation: 45000000,
      currentVal: 235000000,
      dept: "Xưởng May - NM2",
      status: "Đang hoạt động",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      code: "TS-2026-003",
      name: "Máy quét 3D tạo mẫu phom giày R&D",
      category: "Thiết bị R&D",
      originalVal: 185000000,
      depreciation: 20000000,
      currentVal: 165000000,
      dept: "R&D Center",
      status: "Bảo trì định kỳ",
      statusColor: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Tài sản", href: "/finance/tai-san" },
        { label: "Danh mục tài sản & Khấu hao" },
      ]}
      activeSubmenu="Danh mục tài sản"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconDeviceDesktop size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Tài Sản Cố Định &amp; Khấu Hao
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Kiểm kê tài sản, cấp phát, điều chuyển và trích khấu hao tài sản cố định TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("📝 Đã mở form bàn giao & ghi tăng tài sản mới!")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Bàn giao TS
          </button>
          <button
            type="button"
            onClick={() => showToast("⚡ Đã chạy quy trình trích khấu hao tự động tháng 08/2026!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Trích khấu hao T8</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Sổ Theo Dõi Tài Sản Cố Định Văn Phòng &amp; Nhà Máy
          </h3>
          <span className="text-xs font-bold text-slate-500">Tổng tài sản: 3 danh mục</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Tài Sản</th>
                <th className="py-2.5 px-3">Tên Tài Sản Cố Định</th>
                <th className="py-2.5 px-3">Loại Tài Sản</th>
                <th className="py-2.5 px-3">Đơn Vị Sử Dụng</th>
                <th className="py-2.5 px-3 text-right">Nguyên Giá</th>
                <th className="py-2.5 px-3 text-right">Hao Mòn Lũy Kế</th>
                <th className="py-2.5 px-3 text-right font-black">Giá Trị Còn Lại</th>
                <th className="py-2.5 px-3 text-center">Tình Trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {assets.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.category}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{row.dept}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.originalVal.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-500">
                    {row.depreciation.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-[#006838]">
                    {row.currentVal.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <IconCheck size={16} />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </FinanceShell>
  );
}
