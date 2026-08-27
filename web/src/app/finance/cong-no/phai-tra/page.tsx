"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconUsers,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconPlus,
  IconSearch,
  IconPrinter,
  IconDownload,
} from "@tabler/icons-react";

export default function CongNoPhaiTraPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const suppliers = [
    {
      id: "NCC-001",
      name: "Công ty TNHH Vật Tư Da Giày Minh Long",
      taxCode: "3700147988",
      totalDebt: 450000000,
      paid: 200000000,
      remain: 250000000,
      dueDate: "2026-08-25",
      status: "Trong hạn",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "NCC-002",
      name: "Tập Đoàn Hóa Chất TexChem Việt Nam",
      taxCode: "0301122334",
      totalDebt: 180000000,
      paid: 50000000,
      remain: 130000000,
      dueDate: "2026-08-10",
      status: "Quá hạn 8 ngày",
      statusColor: "bg-rose-100 text-rose-800",
    },
    {
      id: "NCC-003",
      name: "Công ty Bao Bì Carton Thuận Phát",
      taxCode: "0314556677",
      totalDebt: 75000000,
      paid: 75000000,
      remain: 0,
      dueDate: "2026-08-15",
      status: "Đã tất toán",
      statusColor: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Công nợ", href: "/finance/cong-no" },
        { label: "Công nợ phải trả (TK 331)" },
      ]}
      activeSubmenu="Công nợ phải trả"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconUsers size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Công Nợ Phải Trả Nhà Cung Cấp (TK 331)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Kiểm soát hạn mức tín dụng nhà cung cấp, lịch trình thanh toán và tuổi nợ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang xuất biên bản đối chiếu công nợ NCC...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>In đối chiếu</span>
          </button>
          <Link
            href="/finance/thu-chi/phieu-chi"
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Lập ủy nhiệm chi trả nợ</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tổng công nợ phải trả</span>
          <div className="text-xl font-black text-slate-900 mt-1">380,000,000 đ</div>
          <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">2 nhà cung cấp còn nợ</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Nợ trong hạn thanh toán</span>
          <div className="text-xl font-black text-emerald-700 mt-1">250,000,000 đ</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">Đến hạn 25/08/2026</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Nợ quá hạn cần xử lý</span>
          <div className="text-xl font-black text-rose-600 mt-1">130,000,000 đ</div>
          <span className="text-[10px] font-bold text-rose-600 mt-0.5 block">Quá hạn TexChem</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã NCC</th>
                <th className="py-2.5 px-3">Tên Nhà Cung Cấp</th>
                <th className="py-2.5 px-3">Mã Số Thuế</th>
                <th className="py-2.5 px-3 text-right">Tổng Phát Sinh</th>
                <th className="py-2.5 px-3 text-right">Đã Thanh Toán</th>
                <th className="py-2.5 px-3 text-right font-black">Còn Phải Trả</th>
                <th className="py-2.5 px-3">Hạn Thanh Toán</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {suppliers.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.taxCode}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.totalDebt.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {row.paid.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-rose-700">
                    {row.remain.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{row.dueDate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.remain > 0 ? (
                      <Link
                        href="/finance/thu-chi/phieu-chi"
                        className="px-2 py-1 rounded bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] font-bold text-[10px] inline-block"
                      >
                        Thanh toán
                      </Link>
                    ) : (
                      <span className="text-slate-400 font-medium text-[10px]">Đã thanh toán</span>
                    )}
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
