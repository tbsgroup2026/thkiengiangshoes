"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconCalendarEvent,
  IconCheck,
  IconAlertTriangle,
  IconPlus,
  IconChartBar,
  IconTrendingUp,
  IconPrinter,
} from "@tabler/icons-react";

export default function BudgetVsActualPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const budgets = [
    {
      dept: "Sản Xuất (Nhà Máy 1)",
      budget: 850000000,
      actual: 820000000,
      variance: -30000000,
      ratio: 96.5,
      status: "Trong định mức",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      dept: "R&D Phát Triển Mẫu Skechers",
      budget: 350000000,
      actual: 380000000,
      variance: +30000000,
      ratio: 108.6,
      status: "Vượt 8.6%",
      statusColor: "bg-rose-100 text-rose-800",
    },
    {
      dept: "Quản Lý Chất Lượng (QC)",
      budget: 150000000,
      actual: 135000000,
      variance: -15000000,
      ratio: 90.0,
      status: "Trong định mức",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      dept: "Hành Chánh - Quản Trị",
      budget: 120000000,
      actual: 115000000,
      variance: -5000000,
      ratio: 95.8,
      status: "Trong định mức",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Ngân sách", href: "/finance/ngan-sach" },
        { label: "Budget vs Actual" },
      ]}
      activeSubmenu="Budget vs Actual"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconCalendarEvent size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Báo Cáo Đối Chiếu Budget vs. Actual
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Giám sát tình hình giải ngân thực tế so với dự toán ngân sách đã được phê duyệt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang xuất báo cáo kiểm soát ngân sách...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Phòng Ban / Đơn Vị</th>
                <th className="py-2.5 px-3 text-right">Ngân Sách Được Giao</th>
                <th className="py-2.5 px-3 text-right">Thực Tế Đã Chi</th>
                <th className="py-2.5 px-3 text-right">Chênh Lệch</th>
                <th className="py-2.5 px-3 text-center">Tỷ Lệ Thực Hiện</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {budgets.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.dept}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.budget.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.actual.toLocaleString("vi-VN")} đ
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${row.variance > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    {row.variance > 0 ? `+${row.variance.toLocaleString("vi-VN")}` : row.variance.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.ratio > 100 ? "bg-rose-500" : "bg-[#006838]"}`}
                          style={{ width: `${Math.min(row.ratio, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[11px] text-slate-700">{row.ratio}%</span>
                    </div>
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
