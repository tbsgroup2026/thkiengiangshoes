"use client";

import React, { useState } from "react";
import FinanceShell from "@/components/FinanceShell";
import {
  IconChartPie,
  IconCheck,
  IconTrendingUp,
  IconSearch,
  IconFilter,
  IconPrinter,
} from "@tabler/icons-react";

export default function ChiPhiPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const expenses = [
    {
      category: "Chi phí nguyên vật liệu sản xuất",
      code: "CP-NVL",
      amount: 1250000000,
      ratio: 55.4,
      trend: "+4.2%",
      dept: "Sản Xuất (NM1, NM2)",
    },
    {
      category: "Chi phí lương & nhân công trực tiếp",
      code: "CP-NC",
      amount: 580000000,
      ratio: 25.7,
      trend: "+1.5%",
      dept: "Toàn bộ xưởng",
    },
    {
      category: "Chi phí nghiên cứu & phát triển mẫu (R&D)",
      code: "CP-RD",
      amount: 210000000,
      ratio: 9.3,
      trend: "+12.0%",
      dept: "R&D Skechers",
    },
    {
      category: "Chi phí điện, nước, dịch vụ mua ngoài",
      code: "CP-DV",
      amount: 145000000,
      ratio: 6.4,
      trend: "-2.8%",
      dept: "Hành Chánh",
    },
    {
      category: "Chi phí văn phòng phẩm & quản lý",
      code: "CP-QL",
      amount: 72000000,
      ratio: 3.2,
      trend: "-1.1%",
      dept: "Tổ hợp Kiên Giang",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Chi phí", href: "/finance/chi-phi" },
        { label: "Tổng hợp chi phí" },
      ]}
      activeSubmenu="Chi phí văn phòng"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconChartPie size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Phân Tích &amp; Tổng Hợp Chi Phí Doanh Nghiệp
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Báo cáo cấu trúc chi phí vận hành, chi phí sản xuất và kiểm soát định mức TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang xuất báo cáo chi phí chi tiết...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Danh Mục Khoản Mục Chi Phí Tháng 08/2026
          </h3>
          <span className="text-xs font-bold text-slate-500">Tổng chi: 2,257,000,000 đ</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Khoản Mục</th>
                <th className="py-2.5 px-3">Tên Khoản Mục Chi Phí</th>
                <th className="py-2.5 px-3">Phòng Ban Phụ Trách</th>
                <th className="py-2.5 px-3 text-right">Số Tiền (VNĐ)</th>
                <th className="py-2.5 px-3 text-center">Tỷ Trọng (%)</th>
                <th className="py-2.5 px-3 text-center">Biến Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {expenses.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.category}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{row.dept}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.amount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                    {row.ratio}%
                  </td>
                  <td className={`py-2.5 px-3 text-center font-mono font-bold ${row.trend.startsWith("+") ? "text-rose-600" : "text-emerald-700"}`}>
                    {row.trend}
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
