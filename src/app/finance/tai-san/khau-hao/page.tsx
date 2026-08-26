"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconDeviceDesktop,
  IconCheck,
  IconPlus,
  IconPrinter,
  IconDownload,
  IconCalculator,
} from "@tabler/icons-react";

export default function KhauHaoTaiSanPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const depreciations = [
    {
      code: "TS-2026-001",
      name: "Máy ép đế thủy lực Skechers Max Cushion",
      lifespan: "60 tháng",
      originalVal: 450000000,
      monthlyDepreciation: 7500000,
      accumulated: 120000000,
      remain: 330000000,
      debitAcc: "6274",
      creditAcc: "2141",
    },
    {
      code: "TS-2026-002",
      name: "Hệ thống máy may tự động lập trình CNC",
      lifespan: "48 tháng",
      originalVal: 280000000,
      monthlyDepreciation: 5833333,
      accumulated: 45000000,
      remain: 235000000,
      debitAcc: "6274",
      creditAcc: "2141",
    },
    {
      code: "TS-2026-003",
      name: "Máy quét 3D tạo mẫu phom giày R&D",
      lifespan: "36 tháng",
      originalVal: 185000000,
      monthlyDepreciation: 5138889,
      accumulated: 20000000,
      remain: 165000000,
      debitAcc: "6424",
      creditAcc: "2141",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Tài sản", href: "/finance/tai-san" },
        { label: "Khấu hao tài sản cố định" },
      ]}
      activeSubmenu="Khấu hao tài sản"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconCalculator size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Bảng Tính &amp; Trích Khấu Hao Tài Sản Cố Định (TK 214)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tự động tính toán mức trích khấu hao hàng tháng theo phương pháp đường thẳng chuẩn mực kế toán
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("⚡ Đã hạch toán chi phí khấu hao tháng 08/2026 vào sổ cái!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Trích khấu hao kỳ này</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã TS</th>
                <th className="py-2.5 px-3">Tên Tài Sản</th>
                <th className="py-2.5 px-3 text-center">Thời Gian Trích</th>
                <th className="py-2.5 px-3 text-right">Nguyên Giá</th>
                <th className="py-2.5 px-3 text-right font-black text-[#006838]">Mức Trích Tháng</th>
                <th className="py-2.5 px-3 text-right">Lũy Kế Đã Trích</th>
                <th className="py-2.5 px-3 text-right">Giá Trị Còn Lại</th>
                <th className="py-2.5 px-3 text-center">Định Khoản (Nợ/Có)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {depreciations.map((row) => (
                <tr key={row.code} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{row.lifespan}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.originalVal.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-[#006838]">
                    {Math.round(row.monthlyDepreciation).toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-500">
                    {row.accumulated.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.remain.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">
                    {row.debitAcc} / {row.creditAcc}
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
