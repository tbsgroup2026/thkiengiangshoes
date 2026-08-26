"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconChartPie,
  IconCheck,
  IconPlus,
  IconPrinter,
  IconDownload,
  IconCar,
  IconPlane,
} from "@tabler/icons-react";

export default function ChiPhiCongTacPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const trips = [
    {
      code: "CT-2026-0801",
      employee: "Nguyễn Văn Hùng",
      dept: "Kỹ Thuật R&D",
      destination: "Nhà máy Kiên Giang (KG1)",
      duration: "10/08 - 15/08/2026",
      transport: "Xe công ty",
      totalCost: 13800000,
      invoiceCount: 4,
      status: "Đã quyết toán",
    },
    {
      code: "CT-2026-0802",
      employee: "Lê Minh Tuấn",
      dept: "Giám Đốc R&D",
      destination: "Skechers Global HQ (USA)",
      duration: "01/08 - 08/08/2026",
      transport: "Máy bay",
      totalCost: 85000000,
      invoiceCount: 8,
      status: "Đã quyết toán",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Chi phí", href: "/finance/chi-phi" },
        { label: "Chi phí công tác" },
      ]}
      activeSubmenu="Chi phí công tác"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconPlane size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Tổng Hợp &amp; Quyết Toán Chi Phí Công Tác
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Kiểm soát ngân sách đi lại, lưu trú, vé máy bay và phụ cấp công tác chuỗi Skechers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/business-trip"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
          >
            Xem lịch công tác
          </Link>
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang xuất báo cáo tổng hợp chi phí công tác...")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconDownload size={16} />
            <span>Xuất báo cáo chi phí</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Chuyến Đi</th>
                <th className="py-2.5 px-3">Cán Bộ Công Tác</th>
                <th className="py-2.5 px-3">Phòng Ban</th>
                <th className="py-2.5 px-3">Địa Điểm Công Tác</th>
                <th className="py-2.5 px-3">Thời Gian</th>
                <th className="py-2.5 px-3">Phương Tiện</th>
                <th className="py-2.5 px-3 text-right">Tổng Chi Phí</th>
                <th className="py-2.5 px-3 text-center">Hóa Đơn</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {trips.map((row) => (
                <tr key={row.code} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#006838]">{row.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.employee}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.dept}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{row.destination}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.duration}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.transport}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.totalCost.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                    {row.invoiceCount} tệp
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
