"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconPlus,
  IconSearch,
  IconFilter,
  IconDownload,
  IconUpload,
  IconPrinter,
  IconEye,
} from "@tabler/icons-react";

export default function HoaDonDauVaoPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const invoices = [
    {
      id: "HĐ-2026-0815",
      symbol: "1C26TBA",
      number: "0001248",
      date: "15/08/2026",
      seller: "Công ty TNHH Vật Tư Da Giày Minh Long",
      taxCode: "3700147988",
      subtotal: 145000000,
      vat: 14500000,
      total: 159500000,
      status: "Đã đối soát với PC",
      statusColor: "bg-emerald-100 text-emerald-800",
      xmlStatus: "Hợp lệ TCT",
    },
    {
      id: "HĐ-2026-0816",
      symbol: "2C26TBB",
      number: "0008542",
      date: "16/08/2026",
      seller: "Tập Đoàn Hóa Chất TexChem Việt Nam",
      taxCode: "0301122334",
      subtotal: 58000000,
      vat: 5800000,
      total: 63800000,
      status: "Chờ thanh toán",
      statusColor: "bg-amber-100 text-amber-800",
      xmlStatus: "Hợp lệ TCT",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Hóa đơn", href: "/finance/hoa-don" },
        { label: "Hóa đơn đầu vào" },
      ]}
      activeSubmenu="Hóa đơn đầu vào"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconFileInvoice size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Hóa Đơn Mua Vào (Đầu Vào)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tiếp nhận, kiểm tra tính hợp lệ XML Tổng Cục Thuế và lưu trữ hóa đơn điện tử TBS Group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("📥 Đang nhập tự động từ cổng hoadondientu.gdt.gov.vn...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconDownload size={15} />
            <span>Đồng bộ TCT</span>
          </button>
          <Link
            href="/finance/hoa-don"
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Nhập hóa đơn mới</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Danh Sách Hóa Đơn Điện Tử Mua Vào Tháng 08/2026
          </h3>
          <span className="text-xs font-bold text-slate-500">Tổng giá trị: 223,300,000 đ</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Ký Hiệu / Số HĐ</th>
                <th className="py-2.5 px-3">Ngày HĐ</th>
                <th className="py-2.5 px-3">Đơn Vị Bán Hàng</th>
                <th className="py-2.5 px-3">Mã Số Thuế</th>
                <th className="py-2.5 px-3 text-right">Tiền Chưa Thuế</th>
                <th className="py-2.5 px-3 text-right">Thuế VAT</th>
                <th className="py-2.5 px-3 text-right font-black">Tổng Thanh Toán</th>
                <th className="py-2.5 px-3 text-center">XML GDT</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
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
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.seller}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.taxCode}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.subtotal.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {row.vat.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {row.total.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[10px]">
                      {row.xmlStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => showToast(`👁️ Đang mở xem chi tiết hóa đơn ${row.number}...`)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#006838] transition-colors"
                      title="Xem chi tiết"
                    >
                      <IconEye size={15} />
                    </button>
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
