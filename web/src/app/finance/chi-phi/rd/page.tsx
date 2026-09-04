"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
import FinanceShell from "@/components/FinanceShell";
import {
  IconChartPie,
  IconCheck,
  IconPlus,
  IconPrinter,
  IconDownload,
  IconFlask,
} from "@tabler/icons-react";

export default function ChiPhiRDPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const rdExpenses = [
    {
      project: "PRJ-SKECHERS-DLITES",
      name: "Phát triển mẫu giày thể thao Skechers D'Lites F/W 2026",
      materialCost: 145000000,
      toolingCost: 85000000,
      testingCost: 25000000,
      total: 255000000,
      status: "Đang sản xuất thử nghiệm (Sample Phase)",
    },
    {
      project: "PRJ-GO-RUN-MAX",
      name: "Công nghệ đế Hyper Burst siêu nhẹ Skechers Go Run",
      materialCost: 98000000,
      toolingCost: 65000000,
      testingCost: 42000000,
      total: 205000000,
      status: "Đạt chuẩn LAB test",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Chi phí", href: "/finance/chi-phi" },
        { label: "Chi phí R&D" },
      ]}
      activeSubmenu="Chi phí R&D"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconFlask size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Kế Toán Chi Phí Dự Án Nghiên Cứu &amp; Phát Triển Mẫu (R&amp;D)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tập hợp chi phí làm mẫu thử, khuôn đế, vật liệu cao cấp và đo lường tỷ suất hoàn vốn R&amp;D
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang xuất báo cáo tài chính dự án R&D...")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconDownload size={16} />
            <span>Xuất báo cáo chi phí R&amp;D</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Dự Án</th>
                <th className="py-2.5 px-3">Tên Dự Án Phát Triển Mẫu</th>
                <th className="py-2.5 px-3 text-right">Chi Phí Vật Liệu</th>
                <th className="py-2.5 px-3 text-right">Chi Phí Khuôn &amp; Dụng Cụ</th>
                <th className="py-2.5 px-3 text-right">Chi Phí Kiểm Nghiệm LAB</th>
                <th className="py-2.5 px-3 text-right font-black">Tổng Chi Phí R&amp;D</th>
                <th className="py-2.5 px-3 text-center">Giai Đoạn Mẫu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rdExpenses.map((row) => (
                <tr key={row.project} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#006838]">{row.project}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.materialCost.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.toolingCost.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.testingCost.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.total.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
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
