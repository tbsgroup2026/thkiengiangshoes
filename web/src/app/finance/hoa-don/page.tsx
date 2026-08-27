"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconPaperclip,
  IconTrash,
  IconPlus,
  IconSettings,
  IconBuildingBank,
  IconSearch,
  IconFilter,
  IconUser,
  IconUsers,
  IconEye,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";

interface InvoiceItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  vatRate: number;
}

export default function HoaDonPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [form, setForm] = useState({
    type: "Hóa đơn đầu vào (Mua vào)",
    code: "HĐ-2026-0818",
    symbol: "1C26TBA",
    date: "2026-08-15",
    supplier: "Công ty TNHH Vật Tư Da Giày Minh Long",
    taxCode: "3700147988",
    address: "KCN Sóng Thần 2, Dĩ An, Bình Dương",
    buyer: "Tổ hợp Kiên Giang - TBS Group",
    paymentTerm: "30 ngày kể từ ngày xuất HĐ",
    note: "Hóa đơn vật tư da PU ép nhiệt lô sản xuất Skechers D'Lites",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      name: "Da PU Synthetic Eco High-Grade",
      unit: "Mét",
      qty: 1200,
      price: 65000,
      vatRate: 10,
    },
    {
      id: "2",
      name: "Keo dán PU Polymer nhiệt dẻo",
      unit: "Thùng",
      qty: 50,
      price: 320000,
      vatRate: 10,
    },
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const vatTotal = items.reduce((sum, item) => sum + (item.qty * item.price * item.vatRate) / 100, 0);
  const grandTotal = subtotal + vatTotal;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: (items.length + 1).toString(),
        name: "Nguyên phụ liệu sản xuất",
        unit: "Cái",
        qty: 1,
        price: 0,
        vatRate: 10,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      showToast("⚠️ Cần ít nhất 1 dòng hàng hóa!");
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Hóa đơn & Chứng từ", href: "/finance/hoa-don" },
        { label: "Nhập hóa đơn điện tử" },
      ]}
      activeSubmenu="Hóa đơn đầu vào"
    >
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconFileInvoice size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Nhập &amp; Lưu Trữ Hóa Đơn Điện Tử
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Kiểm tra tính hợp lệ XML/PDF, đối chiếu với phiếu chi và lưu trữ chứng từ điện tử TBS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("Đã hủy nhập liệu!")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => showToast("💾 Đã lưu nháp hóa đơn điện tử thành công!")}
            className="px-4 py-2 rounded-xl bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-xs font-black transition-all shadow-2xs cursor-pointer"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={() => showToast("⚡ Đã lưu hóa đơn & kích hoạt đối chiếu tự động với Phiếu Chi!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Lưu &amp; Đối chiếu</span>
          </button>
        </div>
      </div>

      {/* Grid 12 cols layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Khối 1: Thông tin hóa đơn */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              1. Thông tin hóa đơn &amp; Người bán
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Loại hóa đơn *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  >
                    <option value="Hóa đơn đầu vào (Mua vào)">Hóa đơn đầu vào (Mua vào)</option>
                    <option value="Hóa đơn đầu ra (Bán ra)">Hóa đơn đầu ra (Bán ra)</option>
                    <option value="Hóa đơn dịch vụ">Hóa đơn dịch vụ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Số hóa đơn *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Ký hiệu hóa đơn *</label>
                  <input
                    type="text"
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Ngày hóa đơn *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Tên đơn vị bán hàng *</label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Mã số thuế bên bán *</label>
                  <input
                    type="text"
                    value={form.taxCode}
                    onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Địa chỉ người bán</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Tệp XML / PDF gốc</label>
                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center gap-1 cursor-pointer">
                    <span className="text-[11px] font-bold text-slate-600">Đính kèm hóa đơn XML / PDF</span>
                    <button
                      type="button"
                      onClick={() => showToast("📎 Đã nạp thành công hóa đơn điện tử XML!")}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-extrabold text-slate-800"
                    >
                      Chọn tệp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Khối 2: Danh sách hàng hóa & dịch vụ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              2. Chi tiết danh mục hàng hóa &amp; dịch vụ
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Tên hàng hóa / Dịch vụ *</th>
                    <th className="py-2.5 px-3 w-20">ĐVT</th>
                    <th className="py-2.5 px-3 w-24 text-right">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá (VNĐ)</th>
                    <th className="py-2.5 px-3 w-20 text-center">Thuế VAT</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền (VNĐ)</th>
                    <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems(items.map((it) => (it.id === row.id ? { ...it, name: val } : it)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#006838] bg-slate-50/40"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems(items.map((it) => (it.id === row.id ? { ...it, unit: val } : it)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 text-center outline-none focus:border-[#006838] bg-slate-50/40"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems(items.map((it) => (it.id === row.id ? { ...it, qty: val } : it)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 text-right outline-none focus:border-[#006838] bg-slate-50/40"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={row.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setItems(items.map((it) => (it.id === row.id ? { ...it, price: val } : it)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 text-right outline-none focus:border-[#006838] bg-slate-50/40"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="font-mono font-bold text-slate-700">{row.vatRate}%</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                        {(row.qty * row.price).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(row.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                        >
                          <IconTrash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-300 text-[#006838] bg-emerald-50/60 hover:bg-emerald-100 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <IconPlus size={15} />
                <span>+ Thêm dòng hàng hóa</span>
              </button>

              <div className="space-y-1.5 text-xs text-slate-600 min-w-[240px] text-right">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Tiền hàng chưa thuế:</span>
                  <span className="font-mono font-bold text-slate-900">{subtotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Tiền thuế GTGT (10%):</span>
                  <span className="font-mono font-bold text-slate-900">{vatTotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-200 text-sm">
                  <span className="font-black text-slate-900">Tổng tiền thanh toán:</span>
                  <span className="font-mono font-black text-[#006838]">{grandTotal.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Thông tin đối chiếu
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái HĐ</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Hợp lệ XML
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Liên kết phiếu chi</span>
                <span className="font-mono font-bold text-[#006838]">PC-250815-0001</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chênh lệch đối soát</span>
                <span className="font-mono font-bold text-slate-900">0 đ</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Người thực hiện
            </h3>
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800">Phạm Nguyễn Anh Huy</p>
              <p className="text-slate-500 text-[11px]">Kế toán tổng hợp chuỗi Skechers</p>
              <p className="text-[10px] text-slate-400 font-mono">15/08/2026 10:30</p>
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
