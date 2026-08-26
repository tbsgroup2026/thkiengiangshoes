"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconPackage,
  IconCheck,
  IconPlus,
  IconPrinter,
  IconDownload,
  IconArrowDownRight,
} from "@tabler/icons-react";

export default function NhapKhoPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const importReceipts = [
    {
      code: "NK-2026-0815",
      date: "15/08/2026",
      supplier: "Công ty TNHH Vật Tư Da Giày Minh Long",
      item: "Da PU Synthetic Eco High-Grade",
      qty: 1200,
      unit: "Mét",
      warehouse: "Kho Trung Tâm TBS Sài Gòn",
      amount: 78000000,
      status: "Đã nhập kho",
    },
    {
      code: "NK-2026-0816",
      date: "16/08/2026",
      supplier: "Tập Đoàn Hóa Chất TexChem Việt Nam",
      item: "Keo dán PU Polymer nhiệt dẻo",
      qty: 50,
      unit: "Thùng",
      warehouse: "Kho Hóa Chất NM1",
      amount: 16000000,
      status: "Đã nhập kho",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Vật tư & Kho", href: "/finance/vat-tu-kho" },
        { label: "Phiếu nhập kho (TK 152)" },
      ]}
      activeSubmenu="Nhập kho"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconArrowDownRight size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Phiếu Nhập Kho Nguyên Vật Liệu (TK 152)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ghi nhận nguyên phụ liệu nhập kho từ nhà cung cấp theo hợp đồng và hóa đơn điện tử
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("📝 Đã mở form lập phiếu nhập kho mới!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Lập phiếu nhập kho</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Phiếu</th>
                <th className="py-2.5 px-3">Ngày Nhập</th>
                <th className="py-2.5 px-3">Nhà Cung Cấp</th>
                <th className="py-2.5 px-3">Nguyên Phụ Liệu</th>
                <th className="py-2.5 px-3 text-right">Số Lượng</th>
                <th className="py-2.5 px-3 text-center">ĐVT</th>
                <th className="py-2.5 px-3">Kho Nhận Hàng</th>
                <th className="py-2.5 px-3 text-right font-black">Giá Trị Nhập</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {importReceipts.map((row) => (
                <tr key={row.code} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#006838]">{row.code}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{row.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.supplier}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{row.item}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                    {row.qty.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-600">{row.unit}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.warehouse}</td>
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
