"use client";

import React, { useState, Suspense } from "react";
import NavLink from "@/components/NavLink";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconPaperclip,
  IconTrash,
  IconPlus,
  IconSettings,
  IconBuildingBank,
  IconUsers,
  IconUser,
  IconSearch,
  IconFilter,
  IconPrinter,
  IconDownload,
  IconArrowLeft,
  IconClock,
} from "@tabler/icons-react";

export default function PhieuChiPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [form, setForm] = useState({
    code: "PC-2026-0818",
    date: "2026-08-18",
    type: "Chi phí hoạt động",
    method: "Chuyển khoản",
    bank: "Vietcombank - 1023 456 789",
    receiver: "Công ty TNHH Da Giày Minh Long",
    taxCode: "3700147988",
    address: "KCN Sóng Thần 2, Dĩ An, Bình Dương",
    reason: "Thanh toán tiền nguyên phụ liệu da PU ép nhiệt lô hàng Skechers D'Lites",
    project: "PRJ-SKECHERS-DLITES",
    debitAccount: "6427",
    creditAccount: "1121",
    amount: 145000000,
    vat: 14500000,
  });

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Thu – Chi", href: "/finance/thu-chi" },
        { label: "Phiếu chi" },
      ]}
      activeSubmenu="Phiếu chi"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconFileInvoice size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Lập Phiếu Chi Tiền (UNC / Tiền Mặt)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Quản lý và lập phiếu chi thanh toán nhà cung cấp, chi phí vận hành chuỗi Skechers
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
            onClick={() => showToast("💾 Đã lưu nháp phiếu chi thành công!")}
            className="px-4 py-2 rounded-xl bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-xs font-black transition-all shadow-2xs cursor-pointer"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={() => showToast("⚡ Đã gửi phiếu chi sang luồng phê duyệt Ban Giám Đốc!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Gửi phê duyệt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight border-b border-slate-100 pb-2">
              1. Thông tin chung phiếu chi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Số phiếu chi *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Ngày lập phiếu *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Hình thức thanh toán *</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                >
                  <option value="Chuyển khoản">Chuyển khoản ngân hàng (UNC)</option>
                  <option value="Tiền mặt">Tiền mặt tại quỹ</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tài khoản ngân hàng trích chi</label>
                <select
                  value={form.bank}
                  onChange={(e) => setForm({ ...form, bank: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                >
                  <option value="Vietcombank - 1023 456 789">Vietcombank - 1023 456 789 (VND)</option>
                  <option value="BIDV - 3141 000 123 456">BIDV - 3141 000 123 456 (VND)</option>
                  <option value="Vietcombank USD - 1023 999 888">Vietcombank USD - 1023 999 888 (USD)</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Đơn vị / Người nhận tiền *</label>
                <input
                  type="text"
                  value={form.receiver}
                  onChange={(e) => setForm({ ...form, receiver: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Lý do chi tiền *</label>
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
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Số tiền thanh toán (VNĐ) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value), vat: Number(e.target.value) * 0.1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-black text-slate-900 bg-slate-50/50 text-right text-base"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Tổng tiền kèm thuế VAT</label>
                  <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-right font-mono font-black text-[#006838] text-base">
                    {(form.amount + form.vat).toLocaleString("vi-VN")} đ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Chứng từ đính kèm</h3>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 cursor-pointer hover:border-emerald-400">
              <IconPaperclip size={24} className="mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Kéo thả hóa đơn VAT / Tờ trình vào đây</p>
              <button
                type="button"
                onClick={() => showToast("📎 Đã đính kèm tệp hóa đơn VAT PDF!")}
                className="px-3 py-1 rounded-lg bg-emerald-50 text-[#006838] font-bold text-xs"
              >
                Chọn tệp
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Luồng phê duyệt</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 font-bold">
                <span>1. Kế toán lập phiếu</span>
                <span className="text-[#006838]">✓ Đã lập</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 font-bold text-slate-500">
                <span>2. Kế toán trưởng</span>
                <span>⏳ Chờ duyệt</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 font-bold text-slate-500">
                <span>3. Giám đốc tài chính</span>
                <span>⏳ Chờ duyệt</span>
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
