"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconPaperclip,
  IconPlus,
  IconBuildingBank,
  IconPrinter,
  IconDownload,
  IconArrowLeft,
  IconWallet,
} from "@tabler/icons-react";

export default function PhieuThuPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [form, setForm] = useState({
    code: "PT-2026-0818",
    date: "2026-08-18",
    type: "Thu tiền bán hàng / gia công",
    method: "Chuyển khoản",
    bank: "Vietcombank - 1023 456 789",
    payer: "SKECHERS USA INC (Đơn hàng D'Lites F/W)",
    taxCode: "US-88776655",
    address: "Manhattan Beach, California, USA",
    reason: "Thu tiền thanh toán đợt 2 theo hợp đồng gia công giày thể thao Skechers lô 08/2026",
    project: "PRJ-SKECHERS-DLITES",
    debitAccount: "1121",
    creditAccount: "1311",
    amount: 850000000,
  });

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Thu – Chi", href: "/finance/thu-chi" },
        { label: "Phiếu thu" },
      ]}
      activeSubmenu="Phiếu thu"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconWallet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Lập Phiếu Thu Tiền
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ghi nhận các khoản thu từ khách hàng, hoàn ứng tạm ứng và các nguồn thu khác của chuỗi Skechers
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
            onClick={() => showToast("💾 Đã lưu nháp phiếu thu thành công!")}
            className="px-4 py-2 rounded-xl bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-xs font-black transition-all shadow-2xs cursor-pointer"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={() => showToast("⚡ Đã lưu và hạch toán phiếu thu vào sổ cái kế toán!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Lưu &amp; Hạch toán</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-2">
              1. Thông tin chung phiếu thu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Số phiếu thu *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Ngày thu tiền *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Loại phiếu thu *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                >
                  <option value="Thu tiền bán hàng / gia công">Thu tiền bán hàng / gia công</option>
                  <option value="Thu tiền hoàn ứng công tác">Thu tiền hoàn ứng công tác</option>
                  <option value="Thu lãi tiền gửi ngân hàng">Thu lãi tiền gửi ngân hàng</option>
                  <option value="Thu khác">Thu khác</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tài khoản nhận tiền</label>
                <select
                  value={form.bank}
                  onChange={(e) => setForm({ ...form, bank: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                >
                  <option value="Vietcombank - 1023 456 789">Vietcombank - 1023 456 789 (VND)</option>
                  <option value="BIDV - 3141 000 123 456">BIDV - 3141 000 123 456 (VND)</option>
                  <option value="Quỹ tiền mặt TBS">Quỹ tiền mặt TBS (VND)</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Đơn vị / Người nộp tiền *</label>
                <input
                  type="text"
                  value={form.payer}
                  onChange={(e) => setForm({ ...form, payer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Lý do thu tiền *</label>
                <textarea
                  rows={2}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-2">
              2. Định khoản kế toán &amp; Số tiền
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tài khoản Nợ *</label>
                <input
                  type="text"
                  value={form.debitAccount}
                  onChange={(e) => setForm({ ...form, debitAccount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tài khoản Có *</label>
                <input
                  type="text"
                  value={form.creditAccount}
                  onChange={(e) => setForm({ ...form, creditAccount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Mã dự án</label>
                <input
                  type="text"
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50"
                />
              </div>
              <div className="sm:col-span-3 space-y-1 pt-2">
                <label className="text-[11px] font-bold text-slate-700 block">Số tiền thu thực tế (VNĐ) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-black text-[#006838] bg-emerald-50/50 text-right text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Chứng từ đính kèm (Giấy báo có / Ủy nhiệm chi)</h3>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 cursor-pointer hover:border-emerald-400">
              <IconPaperclip size={24} className="mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Kéo thả Giấy báo có của ngân hàng vào đây</p>
              <button
                type="button"
                onClick={() => showToast("📎 Đã đính kèm Giấy báo có PDF!")}
                className="px-3 py-1 rounded-lg bg-emerald-50 text-[#006838] font-bold text-xs"
              >
                Chọn tệp
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Đối chiếu công nợ tức thì</h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span className="font-bold text-slate-900">SKECHERS USA INC</span>
              </div>
              <div className="flex justify-between">
                <span>Công nợ trước thu:</span>
                <span className="font-mono font-bold text-rose-600">1,250,000,000 đ</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span>Công nợ còn lại:</span>
                <span className="font-mono font-black text-emerald-700">400,000,000 đ</span>
              </div>
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
