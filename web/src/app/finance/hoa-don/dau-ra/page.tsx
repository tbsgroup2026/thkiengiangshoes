"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconPlus,
  IconSearch,
  IconFilter,
  IconDownload,
  IconPrinter,
  IconEye,
  IconSend,
} from "@tabler/icons-react";

export default function HoaDonDauRaPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const invoices = [
    {
      id: "HĐ-XUAT-001",
      symbol: "1C26TBS",
      number: "0000105",
      date: "10/08/2026",
      buyer: "SKECHERS USA INC",
      taxCode: "US-88776655",
      subtotal: 1250000000,
      vat: 0, // Xuất khẩu 0%
      total: 1250000000,
      status: "Đã ký số & gửi TCT",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "HĐ-XUAT-002",
      symbol: "1C26TBS",
      number: "0000106",
      date: "14/08/2026",
      buyer: "SKECHERS SOUTHEAST ASIA PTE. LTD",
      taxCode: "SG-20269988",
      subtotal: 890000000,
      vat: 0,
      total: 890000000,
      status: "Đã ký số & gửi TCT",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Hóa đơn", href: "/finance/hoa-don" },
        { label: "Hóa đơn đầu ra" },
      ]}
      activeSubmenu="Hóa đơn đầu ra"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconFileInvoice size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Hóa Đơn Bán Ra (Đầu Ra)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Phát hành hóa đơn điện tử gia công &amp; xuất khẩu giày thể thao Skechers, tích hợp ký số HSM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang in hàng loạt hóa đơn PDF có mã CQT...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>In hóa đơn</span>
          </button>
          <button
            type="button"
            onClick={() => showToast("📝 Đã mở form xuất hóa đơn điện tử mới!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Lập hóa đơn xuất khẩu</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Danh Sách Hóa Đơn Điện Tử Đã Phát Hành Tháng 08/2026
          </h3>
          <span className="text-xs font-bold text-slate-500">Doanh thu xuất hóa đơn: 2,140,000,000 đ</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Ký Hiệu / Số HĐ</th>
                <th className="py-2.5 px-3">Ngày Ký</th>
                <th className="py-2.5 px-3">Khách Hàng / Đối Tác</th>
                <th className="py-2.5 px-3">Mã Định Danh Thuế</th>
                <th className="py-2.5 px-3 text-right">Doanh Thu Chưa Thuế</th>
                <th className="py-2.5 px-3 text-right">Thuế Suất</th>
                <th className="py-2.5 px-3 text-right font-black">Tổng Tiền (VNĐ)</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái TCT</th>
                <th className="py-2.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {invoices.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-[#006838]">{row.number}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.symbol}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{row.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.buyer}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.taxCode}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.subtotal.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {row.vat === 0 ? "0% (XK)" : "10%"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.total.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => showToast(`👁️ Xem hóa đơn điện tử ${row.number}`)}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#006838]"
                        title="Xem hóa đơn"
                      >
                        <IconEye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`📨 Đã gửi hóa đơn điện tử ${row.number} qua email đối tác!`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                        title="Gửi email cho khách hàng"
                      >
                        <IconSend size={15} />
                      </button>
                    </div>
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
