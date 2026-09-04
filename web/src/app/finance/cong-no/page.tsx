"use client";

import React, { useState } from "react";
import NavLink from "@/components/NavLink";
import FinanceShell from "@/components/FinanceShell";
import {
  IconUsers,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconArrowUpRight,
  IconArrowDownRight,
  IconPlus,
  IconSearch,
  IconFilter,
  IconPrinter,
  IconPhoneCall,
  IconMail,
  IconBuildingBank,
} from "@tabler/icons-react";

export default function CongNoPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [activeTab, setActiveTab] = useState<"tra" | "thu">("tra");
  const [search, setSearch] = useState("");

  const debts = [
    {
      id: "CN-NCC-001",
      partner: "Công ty CP Da Giày TBS - Nhà Cung Ứng",
      taxCode: "3700147988",
      type: "Phải trả",
      typeCode: "tra",
      total: 450000000,
      paid: 200000000,
      remain: 250000000,
      dueDate: "2026-08-25",
      status: "Trong hạn",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "CN-NCC-002",
      partner: "Tập Đoàn Hóa Chất TexChem Việt Nam",
      taxCode: "0301122334",
      type: "Phải trả",
      typeCode: "tra",
      total: 180000000,
      paid: 50000000,
      remain: 130000000,
      dueDate: "2026-08-10",
      status: "Quá hạn 7 ngày",
      statusColor: "bg-rose-100 text-rose-800",
    },
    {
      id: "CN-KH-001",
      partner: "SKECHERS USA Inc. (Đơn hàng D'Lites)",
      taxCode: "US-99887766",
      type: "Phải thu",
      typeCode: "thu",
      total: 1250000000,
      paid: 800000000,
      remain: 450000000,
      dueDate: "2026-08-30",
      status: "Trong hạn",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Công nợ", href: "/finance/cong-no" },
        { label: activeTab === "tra" ? "Công nợ phải trả" : "Công nợ phải thu" },
      ]}
      activeSubmenu={activeTab === "tra" ? "Công nợ phải trả" : "Công nợ phải thu"}
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconUsers size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Quản Lý Công Nợ Đối Tác &amp; Nhà Cung Cấp
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Theo dõi hạn thanh toán, lịch sử đối soát và cảnh báo công nợ quá hạn chuỗi Skechers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("🖨️ Đang xuất biên bản đối chiếu công nợ PDF...")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <IconPrinter size={15} />
            <span>In đối chiếu</span>
          </button>
          <button
            type="button"
            onClick={() => showToast("⚡ Đã gửi cảnh báo nhắc hạn công nợ tự động tới nhà cung cấp!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Gửi nhắc nợ tự động</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tổng công nợ phải trả</span>
          <div className="text-xl font-black text-slate-900 mt-1">380,000,000 đ</div>
          <span className="text-[10px] font-bold text-amber-700 mt-0.5 block">2 nhà cung cấp</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tổng công nợ phải thu</span>
          <div className="text-xl font-black text-[#006838] mt-1">450,000,000 đ</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">1 đối tác Skechers USA</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Công nợ quá hạn</span>
          <div className="text-xl font-black text-rose-600 mt-1">130,000,000 đ</div>
          <span className="text-[10px] font-bold text-rose-600 mt-0.5 block">Cần xử lý thanh toán</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Tỷ lệ thanh toán đúng hạn</span>
          <div className="text-xl font-black text-slate-900 mt-1">94.2%</div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">Đạt chỉ tiêu KPI</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("tra")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === "tra"
                  ? "bg-white text-[#006838] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Công nợ phải trả (NCC)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("thu")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === "thu"
                  ? "bg-white text-[#006838] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Công nợ phải thu (Khách hàng)
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên đối tác, MST..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] w-64"
            />
            <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Debt Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Đối Tác</th>
                <th className="py-2.5 px-3">Tên Đối Tác / Nhà Cung Cấp</th>
                <th className="py-2.5 px-3">Mã Số Thuế</th>
                <th className="py-2.5 px-3 text-right">Tổng Phát Sinh</th>
                <th className="py-2.5 px-3 text-right">Đã Thanh Toán</th>
                <th className="py-2.5 px-3 text-right font-black">Còn Phải Trả/Thu</th>
                <th className="py-2.5 px-3">Hạn Thanh Toán</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {debts
                .filter((d) => d.typeCode === activeTab)
                .filter((d) => (search ? d.partner.toLowerCase().includes(search.toLowerCase()) : true))
                .map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{row.partner}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{row.taxCode}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                      {row.total.toLocaleString("vi-VN")} đ
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
                      <NavLink
                        href={`/finance/thu-chi?tab=${activeTab === "tra" ? "chi" : "thu"}`}
                        className="px-2 py-1 rounded bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] font-bold text-[10px] inline-block"
                      >
                        Tạo phiếu TT
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
