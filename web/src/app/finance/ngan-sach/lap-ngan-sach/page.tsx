"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
import FinanceShell from "@/components/FinanceShell";
import {
  IconCalendarEvent,
  IconCheck,
  IconPlus,
  IconPrinter,
  IconDownload,
  IconChartBar,
} from "@tabler/icons-react";

export default function LapNganSachPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [period, setPeriod] = useState("Quý 3/2026");
  const budgetPlans = [
    {
      dept: "Sản Xuất - Nhà Máy 1 (TBS Sài Gòn)",
      code: "DEPT-SX-01",
      plannedAmount: 2500000000,
      approvedAmount: 2450000000,
      head: "Trần Văn Nam",
      status: "Đã phê duyệt",
    },
    {
      dept: "Trung Tâm Nghiên Cứu & Phát Triển Mẫu (R&D)",
      code: "DEPT-RD-01",
      plannedAmount: 1100000000,
      approvedAmount: 1050000000,
      head: "Lê Minh Tuấn",
      status: "Đã phê duyệt",
    },
    {
      dept: "Quản Lý Chất Lượng Chuỗi (QC)",
      code: "DEPT-QC-01",
      plannedAmount: 450000000,
      approvedAmount: 450000000,
      head: "Hoàng Thị Thảo",
      status: "Đã phê duyệt",
    },
    {
      dept: "Khối Văn Phòng & Hành Chánh",
      code: "DEPT-HC-01",
      plannedAmount: 380000000,
      approvedAmount: 360000000,
      head: "Phạm Nguyễn Anh Huy",
      status: "Đang thẩm định",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Ngân sách", href: "/finance/ngan-sach" },
        { label: "Lập ngân sách" },
      ]}
      activeSubmenu="Lập ngân sách"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconCalendarEvent size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Lập Kế Hoạch Ngân Sách Định Kỳ
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Xây dựng hạn mức chi phí hoạt động theo năm/quý/tháng cho các khối phòng ban TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("📝 Đã mở form lập kế hoạch ngân sách chu kỳ mới!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Tạo kỳ ngân sách mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Kế Hoạch Ngân Sách Các Khối Phòng Ban: {period}
          </h3>
          <span className="text-xs font-bold text-[#006838]">Tổng dự toán: 4,310,000,000 đ</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Đơn Vị</th>
                <th className="py-2.5 px-3">Phòng Ban / Khối</th>
                <th className="py-2.5 px-3">Trưởng Đơn Vị</th>
                <th className="py-2.5 px-3 text-right">Đề Xuất Dự Toán</th>
                <th className="py-2.5 px-3 text-right font-black">Hạn Mức Phê Duyệt</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái Thẩm Định</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {budgetPlans.map((row) => (
                <tr key={row.code} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.dept}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.head}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.plannedAmount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-[#006838]">
                    {row.approvedAmount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        row.status === "Đã phê duyệt"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
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
