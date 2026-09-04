"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
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
  IconUser,
  IconPaperclip,
} from "@tabler/icons-react";

export default function TamUngPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const advances = [
    {
      id: "TU-2026-0801",
      employee: "Nguyễn Văn Hùng",
      dept: "Kỹ Thuật R&D Skechers",
      purpose: "Tạm ứng công tác kiểm định dây chuyền máy may tự động tại Nhà máy Kiên Giang (KG1)",
      date: "2026-08-16",
      amount: 15000000,
      deadline: "2026-08-30",
      status: "Đã giải ngân",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "TU-2026-0802",
      employee: "Lê Hoàng Phúc",
      dept: "Quản Lý Chất Lượng (QC)",
      purpose: "Tạm ứng mua nguyên vật liệu mẫu thử nghiệm độ co giãn đế giày Eva Skechers",
      date: "2026-08-17",
      amount: 8500000,
      deadline: "2026-08-25",
      status: "Chờ duyệt",
      statusColor: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Thu – Chi", href: "/finance/thu-chi" },
        { label: "Tạm ứng" },
      ]}
      activeSubmenu="Tạm ứng"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconWallet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Tạm Ứng Nhân Viên
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Theo dõi các khoản tạm ứng công tác, mua sắm vật tư và thời hạn hoàn ứng TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink
            href="/finance/thu-chi"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
          >
            Quay lại
          </NavLink>
          <button
            type="button"
            onClick={() => showToast("📝 Đã mở form tạo giấy đề nghị tạm ứng mới!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Tạo đề nghị tạm ứng</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Danh Sách Phiếu Tạm Ứng Đang Theo Dõi
          </h3>
          <span className="text-xs font-bold text-slate-500">Tổng tạm ứng chưa hoàn: 23,500,000 đ</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Phiếu</th>
                <th className="py-2.5 px-3">Nhân Viên Tạm Ứng</th>
                <th className="py-2.5 px-3">Phòng Ban</th>
                <th className="py-2.5 px-3">Mục Đích Tạm Ứng</th>
                <th className="py-2.5 px-3">Ngày Ứng</th>
                <th className="py-2.5 px-3 text-right">Số Tiền (VNĐ)</th>
                <th className="py-2.5 px-3">Hạn Hoàn Ứng</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {advances.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.employee}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{row.dept}</td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{row.purpose}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.date}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-[#006838]">
                    {row.amount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{row.deadline}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <NavLink
                      href={`/finance/thu-chi/hoan-ung?ref=${row.id}`}
                      className="px-2 py-1 rounded bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] font-bold text-[10px] inline-block"
                    >
                      Hoàn ứng
                    </NavLink>
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
