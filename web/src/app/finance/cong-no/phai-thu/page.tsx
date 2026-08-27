"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconUsers,
  IconCheck,
  IconClock,
  IconPlus,
  IconSearch,
  IconPrinter,
  IconDownload,
  IconSend,
} from "@tabler/icons-react";

export default function CongNoPhaiThuPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const customers = [
    {
      id: "KH-001",
      name: "SKECHERS USA INC (Đơn hàng D'Lites F/W)",
      taxCode: "US-88776655",
      totalDebt: 1250000000,
      collected: 800000000,
      remain: 450000000,
      dueDate: "2026-08-30",
      status: "Trong hạn",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "KH-002",
      name: "SKECHERS SOUTHEAST ASIA PTE. LTD",
      taxCode: "SG-20269988",
      totalDebt: 890000000,
      collected: 500000000,
      remain: 390000000,
      dueDate: "2026-09-05",
      status: "Trong hạn",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Công nợ", href: "/finance/cong-no" },
        { label: "Công nợ phải thu (TK 131)" },
      ]}
      activeSubmenu="Công nợ phải thu"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconUsers size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Công Nợ Phải Thu Khách Hàng (TK 131)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Theo dõi tiến độ thu tiền đơn hàng gia công Skechers Global và chỉ số DSO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("📨 Đã gửi sao kê công nợ đối soát tới Skechers Global qua EDI!")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconSend size={15} />
            <span>Gửi đối soát EDI</span>
          </button>
          <Link
            href="/finance/thu-chi/phieu-thu"
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Lập phiếu thu tiền</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tổng phải thu khách hàng</span>
          <div className="text-xl font-black text-[#006838] mt-1">840,000,000 đ</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">2 đối tác chiến lược</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tỷ lệ thu hồi đúng hạn</span>
          <div className="text-xl font-black text-slate-900 mt-1">98.5%</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">Chất lượng tín dụng cao</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Số ngày thu tiền bình quân (DSO)</span>
          <div className="text-xl font-black text-slate-900 mt-1">28 ngày</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">Tốt hơn mục tiêu (30 ngày)</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã KH</th>
                <th className="py-2.5 px-3">Khách Hàng / Đối Tác</th>
                <th className="py-2.5 px-3">Mã Định Danh Thuế</th>
                <th className="py-2.5 px-3 text-right">Doanh Số Phát Sinh</th>
                <th className="py-2.5 px-3 text-right">Đã Thu Tiền</th>
                <th className="py-2.5 px-3 text-right font-black">Còn Phải Thu</th>
                <th className="py-2.5 px-3">Hạn Thanh Toán</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {customers.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.taxCode}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.totalDebt.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {row.collected.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-[#006838]">
                    {row.remain.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{row.dueDate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      href="/finance/thu-chi/phieu-thu"
                      className="px-2 py-1 rounded bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] font-bold text-[10px] inline-block"
                    >
                      Lập phiếu thu
                    </Link>
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
