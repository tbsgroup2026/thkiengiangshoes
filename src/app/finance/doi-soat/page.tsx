"use client";

import React, { useState } from "react";
import FinanceShell from "@/components/FinanceShell";
import {
  IconArrowsRightLeft,
  IconCheck,
  IconAlertTriangle,
  IconPrinter,
  IconRefresh,
} from "@tabler/icons-react";

export default function DoiSoatPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reconciliations = [
    {
      source: "Sổ phụ Ngân hàng Vietcombank",
      systemAmount: 1845000000,
      bankAmount: 1845000000,
      difference: 0,
      status: "Khớp 100%",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      source: "Công nợ NCC Vật Tư Minh Long",
      systemAmount: 250000000,
      bankAmount: 248500000,
      difference: -1500000,
      status: "Lệch phí vận chuyển",
      statusColor: "bg-amber-100 text-amber-800",
    },
    {
      source: "Tạm ứng công tác nhân viên T8",
      systemAmount: 65000000,
      bankAmount: 65000000,
      difference: 0,
      status: "Khớp 100%",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Đối soát", href: "/finance/doi-soat" },
        { label: "Đối soát thu chi & Ngân hàng" },
      ]}
      activeSubmenu="Đối soát ngân hàng"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconArrowsRightLeft size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Đối Soát Tài Chính &amp; Sổ Phụ Ngân Hàng
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Đối chiếu tự động giữa chứng từ kế toán D1 và sao kê ngân hàng Vietcombank, BIDV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🔄 Đang chạy thuật toán tự động khớp lệnh sao kê...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconRefresh size={15} />
            <span>Khớp Lệnh Tự Động</span>
          </button>
          <button
            type="button"
            onClick={() => showToast("✅ Đã chốt sổ đối soát kỳ kế toán tháng 08/2026!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Xác nhận đối soát</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Kết Quả Đối Soát Số Liệu Tài Chính Kỳ Tháng 08/2026
          </h3>
          <span className="text-xs font-bold text-slate-500">Cập nhật: 15/08/2026 14:20</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Hạng Mục Đối Soát</th>
                <th className="py-2.5 px-3 text-right">Số Liệu Sổ Kế Toán</th>
                <th className="py-2.5 px-3 text-right">Số Liệu Sao Kê / Thực Tế</th>
                <th className="py-2.5 px-3 text-right font-black">Chênh Lệch</th>
                <th className="py-2.5 px-3 text-center">Tình Trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reconciliations.map((row, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.source}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.systemAmount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.bankAmount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-black ${row.difference === 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {row.difference === 0 ? "0 đ" : `${row.difference.toLocaleString("vi-VN")} đ`}
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
