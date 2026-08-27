"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconPlus,
  IconSearch,
  IconPrinter,
  IconDownload,
  IconArrowUpRight,
  IconArrowDownRight,
  IconRefresh,
} from "@tabler/icons-react";

export default function NganHangPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const accounts = [
    {
      bank: "Ngân Hàng Ngoại Thương Việt Nam (Vietcombank)",
      branch: "Chi nhánh Nam Sài Gòn",
      accNo: "1023 456 789",
      currency: "VND",
      balance: 14250000000,
      purpose: "Tài khoản thanh toán chi phí vận hành & lương",
    },
    {
      bank: "Ngân Hàng Đầu Tư & Phát Triển Việt Nam (BIDV)",
      branch: "Chi nhánh Bình Dương",
      accNo: "3141 000 123 456",
      currency: "VND",
      balance: 8650000000,
      purpose: "Tài khoản thanh toán nhà cung ứng nguyên phụ liệu",
    },
    {
      bank: "Vietcombank (USD Account)",
      branch: "Chi nhánh Nam Sài Gòn",
      accNo: "1023 999 888",
      currency: "USD",
      balance: 620500, // USD
      purpose: "Tài khoản nhận thanh toán xuất khẩu Skechers Global",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Thu – Chi", href: "/finance/thu-chi" },
        { label: "Ngân hàng" },
      ]}
      activeSubmenu="Ngân hàng"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconBuildingBank size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Trị Tài Khoản Ngân Hàng (TK 112)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Theo dõi số dư thực tế, sao kê ngân hàng điện tử và hạn mức tín dụng TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🔄 Đã đồng bộ số dư mới nhất từ cổng Open Banking!")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconRefresh size={15} />
            <span>Đồng bộ số dư</span>
          </button>
          <Link
            href="/finance/thu-chi/phieu-chi"
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Lập lệnh chuyển tiền (UNC)</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-[#006838] uppercase tracking-wider block">
                  {acc.currency} ACCOUNT
                </span>
                <h3 className="text-sm font-black text-slate-900 line-clamp-1">{acc.bank}</h3>
                <p className="text-[11px] text-slate-500">{acc.branch}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0">
                <IconBuildingBank size={18} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block">Số tài khoản</span>
              <span className="font-mono text-sm font-black text-slate-800">{acc.accNo}</span>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 block">Số dư khả dụng</span>
              <div className="text-xl font-black text-[#006838]">
                {acc.currency === "USD"
                  ? `$${acc.balance.toLocaleString("en-US")}`
                  : `${acc.balance.toLocaleString("vi-VN")} đ`}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg">
              {acc.purpose}
            </p>
          </div>
        ))}
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
