"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconSearch,
  IconFilter,
  IconDownload,
  IconPrinter,
  IconEye,
  IconQrcode,
} from "@tabler/icons-react";

export default function TraCuuHoaDonPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [searchParams, setSearchParams] = useState({
    code: "",
    taxCode: "",
    fromDate: "2026-08-01",
    toDate: "2026-08-18",
    type: "all",
  });

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Hóa đơn", href: "/finance/hoa-don" },
        { label: "Tra cứu hóa đơn" },
      ]}
      activeSubmenu="Tra cứu hóa đơn"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconSearch size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Tra Cứu &amp; Đối Chiếu Hóa Đơn Điện Tử
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tra cứu nhanh tình trạng chữ ký số, mã cơ quan thuế và tải file XML/PDF hóa đơn gốc
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
          Bộ Lọc Tra Cứu Nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">Số hóa đơn / Ký hiệu</label>
            <input
              type="text"
              placeholder="VD: 0001248"
              value={searchParams.code}
              onChange={(e) => setSearchParams({ ...searchParams, code: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">Mã số thuế bên bán/mua</label>
            <input
              type="text"
              placeholder="VD: 3700147988"
              value={searchParams.taxCode}
              onChange={(e) => setSearchParams({ ...searchParams, taxCode: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">Từ ngày</label>
            <input
              type="date"
              value={searchParams.fromDate}
              onChange={(e) => setSearchParams({ ...searchParams, fromDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">Đến ngày</label>
            <input
              type="date"
              value={searchParams.toDate}
              onChange={(e) => setSearchParams({ ...searchParams, toDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-[#006838]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => showToast("🔍 Đang truy vấn dữ liệu hóa đơn trên hệ thống...")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconSearch size={16} />
            <span>Tìm kiếm hóa đơn</span>
          </button>
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
