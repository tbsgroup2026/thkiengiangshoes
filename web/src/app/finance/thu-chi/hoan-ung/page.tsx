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
  IconPaperclip,
} from "@tabler/icons-react";

export default function HoanUngPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [settlement, setSettlement] = useState({
    code: "HU-2026-0818",
    refCode: "TU-2026-0801",
    employee: "Nguyễn Văn Hùng",
    advanceAmount: 15000000,
    actualSpent: 13800000,
    refundAmount: 1200000,
    note: "Quyết toán chi phí chuyến công tác kiểm định máy may tự động Nhà máy Kiên Giang (KG1) từ ngày 10/08 - 15/08/2026",
  });

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Thu – Chi", href: "/finance/thu-chi" },
        { label: "Hoàn ứng" },
      ]}
      activeSubmenu="Hoàn ứng"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconWallet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Lập Giấy Thanh Toán &amp; Hoàn Ứng
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Đối chiếu chi phí thực tế với khoản tạm ứng và thực hiện thu hồi hoặc chi bổ sung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/finance/thu-chi"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs"
          >
            Quay lại
          </Link>
          <button
            type="button"
            onClick={() => showToast("⚡ Đã hoàn tất quyết toán & lập phiếu thu hoàn tiền thừa!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Lưu &amp; Hoàn tất quyết toán</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
              Thông tin quyết toán hoàn ứng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Số phiếu hoàn ứng *</label>
                <input
                  type="text"
                  value={settlement.code}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Theo phiếu tạm ứng số *</label>
                <input
                  type="text"
                  value={settlement.refCode}
                  onChange={(e) => setSettlement({ ...settlement, refCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Người thanh toán hoàn ứng *</label>
                <input
                  type="text"
                  value={settlement.employee}
                  onChange={(e) => setSettlement({ ...settlement, employee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Số tiền đã tạm ứng</label>
                <input
                  type="text"
                  value={settlement.advanceAmount.toLocaleString("vi-VN") + " đ"}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-700 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Số tiền thực tế đã chi *</label>
                <input
                  type="number"
                  value={settlement.actualSpent}
                  onChange={(e) => {
                    const spent = Number(e.target.value);
                    setSettlement({
                      ...settlement,
                      actualSpent: spent,
                      refundAmount: settlement.advanceAmount - spent,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-black text-slate-900 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Số tiền nộp lại quỹ (Hoàn ứng)</label>
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 font-mono font-black text-[#006838] text-xs">
                  {settlement.refundAmount.toLocaleString("vi-VN")} đ
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Nội dung diễn giải chi tiết *</label>
                <textarea
                  rows={3}
                  value={settlement.note}
                  onChange={(e) => setSettlement({ ...settlement, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Bảng kê hóa đơn chứng từ kèm theo</h3>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 cursor-pointer hover:border-emerald-400">
              <IconPaperclip size={24} className="mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Tải lên vé máy bay, hóa đơn khách sạn, tiếp khách...</p>
              <button
                type="button"
                onClick={() => showToast("📎 Đã đính kèm 4 hóa đơn chứng từ công tác!")}
                className="px-3 py-1 rounded-lg bg-emerald-50 text-[#006838] font-bold text-xs"
              >
                + Đính kèm file
              </button>
            </div>
          </div>
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
