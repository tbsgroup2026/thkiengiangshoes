"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconClock,
  IconPlus,
  IconSearch,
  IconPrinter,
  IconDownload,
  IconWallet,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";

export default function QuyTienMatPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const cashLogs = [
    {
      id: "PT-2026-0815",
      date: "15/08/2026",
      type: "Thu",
      category: "Thu hoàn ứng công tác",
      person: "Trần Minh Quang",
      desc: "Hoàn ứng tiền công tác Nhà máy Kiên Giang",
      inAmount: 2500000,
      outAmount: 0,
      balance: 45800000,
    },
    {
      id: "PC-2026-0816",
      date: "16/08/2026",
      type: "Chi",
      category: "Chi phí văn phòng phẩm",
      person: "Văn phòng phẩm Ánh Dương",
      desc: "Mua giấy in, bút viết, kẹp file phục vụ R&D",
      inAmount: 0,
      outAmount: 1850000,
      balance: 43950000,
    },
    {
      id: "PC-2026-0817",
      date: "17/08/2026",
      type: "Chi",
      category: "Chi tiếp khách / trà nước",
      person: "Phạm Nguyễn Anh Huy",
      desc: "Chi tiếp đón đoàn chuyên gia kỹ thuật Skechers Global",
      inAmount: 0,
      outAmount: 3200000,
      balance: 40750000,
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Thu – Chi", href: "/finance/thu-chi" },
        { label: "Quỹ tiền mặt" },
      ]}
      activeSubmenu="Quỹ tiền mặt"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconWallet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sổ Quỹ Tiền Mặt (TK 111)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Quản lý chi tiết thu - chi tiền mặt thực tế và số dư tồn quỹ TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang in sổ quỹ tiền mặt PDF...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>In sổ quỹ</span>
          </button>
          <button
            type="button"
            onClick={() => showToast("📊 Đã xuất dữ liệu Sổ quỹ sang Excel!")}
            className="px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconDownload size={15} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tồn quỹ đầu kỳ</span>
          <div className="text-xl font-black text-slate-900 mt-1">43,300,000 đ</div>
          <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">Khóa sổ 01/08/2026</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tổng thu tiền mặt trong kỳ</span>
          <div className="text-xl font-black text-emerald-700 mt-1">+2,500,000 đ</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">1 phiếu thu</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Số dư tồn quỹ hiện tại</span>
          <div className="text-xl font-black text-[#006838] mt-1">40,750,000 đ</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">An toàn định mức</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
          Nhật Ký Thu – Chi Tiền Mặt Tháng 08/2026
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Ngày</th>
                <th className="py-2.5 px-3">Số Chứng Từ</th>
                <th className="py-2.5 px-3">Người Giao Dịch</th>
                <th className="py-2.5 px-3">Diễn Giải Nội Dung</th>
                <th className="py-2.5 px-3 text-right">Số Thu (VNĐ)</th>
                <th className="py-2.5 px-3 text-right">Số Chi (VNĐ)</th>
                <th className="py-2.5 px-3 text-right font-black">Tồn Quỹ (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {cashLogs.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{row.date}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#006838]">{row.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.person}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.desc}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {row.inAmount > 0 ? row.inAmount.toLocaleString("vi-VN") + " đ" : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                    {row.outAmount > 0 ? row.outAmount.toLocaleString("vi-VN") + " đ" : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.balance.toLocaleString("vi-VN")} đ
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
