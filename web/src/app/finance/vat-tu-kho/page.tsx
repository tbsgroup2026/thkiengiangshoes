"use client";

import React, { useState } from "react";
import FinanceShell from "@/components/FinanceShell";
import {
  IconPackage,
  IconCheck,
  IconAlertTriangle,
  IconPlus,
  IconSearch,
  IconFilter,
  IconPrinter,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";

export default function VatTuKhoPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const inventory = [
    {
      code: "VT-DA-01",
      name: "Da bò thuộc cao cấp Skechers Navy",
      unit: "Sq.Ft",
      opening: 12000,
      inQty: 5000,
      outQty: 6200,
      closing: 10800,
      minSafety: 5000,
      status: "An toàn",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      code: "VT-DE-02",
      name: "Đế cao su đúc nguyên khối D'Lites",
      unit: "Đôi",
      opening: 8500,
      inQty: 4000,
      outQty: 10500,
      closing: 2000,
      minSafety: 3000,
      status: "Tồn thấp (Cần nhập)",
      statusColor: "bg-rose-100 text-rose-800",
    },
    {
      code: "VT-KEO-03",
      name: "Keo dán PU thân thiện môi trường Eco-01",
      unit: "Thùng",
      opening: 120,
      inQty: 80,
      outQty: 95,
      closing: 105,
      minSafety: 50,
      status: "An toàn",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Vật tư & Kho", href: "/finance/vat-tu-kho" },
        { label: "Báo cáo nhập xuất tồn kho" },
      ]}
      activeSubmenu="Tồn kho an toàn"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconPackage size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Trị Vật Tư &amp; Kho Hàng Sản Xuất
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Theo dõi Nhập - Xuất - Tồn, kiểm soát định mức nguyên phụ liệu chuỗi Skechers TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("📝 Đã mở form lập phiếu xuất kho nguyên liệu!")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Lập phiếu xuất kho
          </button>
          <button
            type="button"
            onClick={() => showToast("⚡ Đã gửi cảnh báo đặt mua vật tư tồn thấp tới Phòng Mua Hàng!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Tạo đề xuất mua VT</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Bảng Tổng Hợp Nhập – Xuất – Tồn Kho Tháng 08/2026
          </h3>
          <span className="text-xs font-bold text-slate-500">Kho Trung Tâm TBS Sài Gòn</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Vật Tư</th>
                <th className="py-2.5 px-3">Tên Nguyên Phụ Liệu</th>
                <th className="py-2.5 px-3 text-center">ĐVT</th>
                <th className="py-2.5 px-3 text-right">Tồn Đầu Kỳ</th>
                <th className="py-2.5 px-3 text-right">Nhập Trong Kỳ</th>
                <th className="py-2.5 px-3 text-right">Xuất Trong Kỳ</th>
                <th className="py-2.5 px-3 text-right font-black">Tồn Cuối Kỳ</th>
                <th className="py-2.5 px-3 text-center">Định Mức Tồn</th>
                <th className="py-2.5 px-3 text-center">Tình Trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {inventory.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-600">{row.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.opening.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    +{row.inQty.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                    -{row.outQty.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.closing.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                    {row.minSafety.toLocaleString("vi-VN")}
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
