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
  IconBuildingStore,
} from "@tabler/icons-react";

export default function ChiPhiVanPhongPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const officeExpenses = [
    {
      code: "CP-VP-01",
      item: "Văn phòng phẩm & Giấy in",
      vendor: "Văn phòng phẩm Ánh Dương",
      amount: 14500000,
      month: "08/2026",
      status: "Đã thanh toán",
    },
    {
      code: "CP-VP-02",
      item: "Internet cáp quang chuyên dụng & Server Cloud",
      vendor: "VNPT Telecom",
      amount: 22000000,
      month: "08/2026",
      status: "Đã thanh toán",
    },
    {
      code: "CP-VP-03",
      item: "Điện thoại, nước uống & Tiếp khách định kỳ",
      vendor: "Nước khoáng Lavie",
      amount: 8500000,
      month: "08/2026",
      status: "Đã thanh toán",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Chi phí", href: "/finance/chi-phi" },
        { label: "Chi phí văn phòng" },
      ]}
      activeSubmenu="Chi phí văn phòng"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconBuildingStore size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Chi Phí Văn Phòng &amp; Quản Trị
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Kiểm soát định mức chi tiêu điện nước, viễn thông, tiếp khách và văn phòng phẩm TBS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang xuất bảng kê chi phí văn phòng...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>Xuất bảng kê</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Khoản Mục</th>
                <th className="py-2.5 px-3">Nội Dung Chi Phí</th>
                <th className="py-2.5 px-3">Đơn Vị Cung Cấp Dịch Vụ</th>
                <th className="py-2.5 px-3">Kỳ Chi Phí</th>
                <th className="py-2.5 px-3 text-right">Số Tiền (VNĐ)</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {officeExpenses.map((row) => (
                <tr key={row.code} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.item}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.vendor}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.month}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.amount.toLocaleString("vi-VN")} đ
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
