"use client";

import React, { useState, useEffect, Suspense } from "react";
import NavLink from "@/components/NavLink";
import { useSearchParams } from "next/navigation";
import FinanceShell from "@/components/FinanceShell";
import {
  IconFileInvoice,
  IconCheck,
  IconPaperclip,
  IconTrash,
  IconPlus,
  IconSettings,
  IconCalendar,
  IconUser,
  IconUsers,
  IconBuildingBank,
  IconPrinter,
  IconSearch,
  IconFilter,
  IconX,
  IconArrowLeft,
  IconWallet,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";

interface PaymentItem {
  id: string;
  category: string;
  desc: string;
  project: string;
  debit: string;
  credit: string;
  amount: number;
  vat: number;
}

function ThuChiContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "chi";

  // Tab view: "form_chi", "form_thu", "list"
  const [activeView, setActiveView] = useState<"form_chi" | "form_thu" | "list">("form_chi");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form Thông Tin Chung State (Khối 1)
  const [generalInfo, setGeneralInfo] = useState({
    voucherType: "Chi phí hoạt động",
    voucherCode: "PC-250815-0001",
    voucherDate: "2026-08-15",
    paymentMethod: "Chuyển khoản",
    bankAccount: "Vietcombank - 1023 456 789",
    dept: "Tổ hợp Kiên Giang - TBS Group",
    receiver: "Công ty TNHH Giải pháp Công nghệ ABC",
    address: "123 Nguyễn Văn Linh, P. Tân Phong, Quận 7, TP. HCM",
    taxCode: "0312345678",
    accountNumber: "1234 5678 9999",
    content: "Chi phí dịch vụ phần mềm quản lý dự án tháng 08/2026",
    reason: "",
    attachmentName: "",
  });

  // Chi Tiết Thanh Toán State (Khối 2)
  const [paymentRows, setPaymentRows] = useState<PaymentItem[]>([
    {
      id: "1",
      category: "Chi phí dịch vụ CNTT",
      desc: "Phí sử dụng phần mềm Quản lý dự án tháng 08/2026",
      project: "PRJ-2026-08",
      debit: "6427",
      credit: "1121",
      amount: 18000000,
      vat: 1800000,
    },
  ]);

  // Thông Tin Bổ Sung State (Khối 3)
  const [extraInfo, setExtraInfo] = useState({
    requester: "Nguyễn Thị Mai",
    notes: "",
    otherAttachment: "",
  });

  // Calculate totals
  const totalSubtotal = paymentRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalVAT = paymentRows.reduce((sum, r) => sum + (Number(r.vat) || 0), 0);
  const grandTotal = totalSubtotal + totalVAT;

  const handleAddRow = () => {
    const newId = (paymentRows.length + 1).toString();
    setPaymentRows([
      ...paymentRows,
      {
        id: newId,
        category: "Chi phí văn phòng",
        desc: "Chi phí phát sinh",
        project: "PRJ-2026-08",
        debit: "6428",
        credit: "1121",
        amount: 0,
        vat: 0,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (paymentRows.length === 1) {
      showToast("⚠️ Cần ít nhất 1 dòng chi tiết thanh toán!");
      return;
    }
    setPaymentRows(paymentRows.filter((r) => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof PaymentItem, value: any) => {
    setPaymentRows(
      paymentRows.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "amount") {
          updated.vat = Math.round(Number(value) * 0.1);
        }
        return updated;
      })
    );
  };

  const handleSaveDraft = () => {
    showToast("💾 Đã lưu nháp phiếu chi thành công vào cơ sở dữ liệu!");
  };

  const handleSubmitApproval = () => {
    showToast("⚡ Đã chuyển phiếu chi sang quy trình Phê Duyệt 5 Bước!");
  };

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Thu – Chi", href: "/finance/thu-chi" },
        { label: "Phiếu chi", href: "/finance/thu-chi?tab=chi" },
        { label: "Thêm mới" },
      ]}
      activeSubmenu="Phiếu chi"
    >
      {/* Action Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconFileInvoice size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Thêm mới phiếu chi
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Lập phiếu chi hạch toán tiền gửi ngân hàng / quỹ tiền mặt chuỗi Skechers
            </p>
          </div>
        </div>

        {/* 3 Top Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("Đã hủy thay đổi!")}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl bg-[#e6f4ed] hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-xs font-black transition-all shadow-2xs cursor-pointer"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={handleSubmitApproval}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Lưu &amp; Gửi duyệt</span>
          </button>
        </div>
      </div>

      {/* Main Form + Sidebar Layout (Grid 12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ════════ LEFT COLUMN (FORM CHÍNH - 9 Cols) ════════ */}
        <div className="lg:col-span-9 space-y-4">
          {/* ════════ KHỐI 1: 1. THÔNG TIN CHUNG ════════ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>1. Thông tin chung</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cột 1: Loại, Số phiếu, Ngày, Hình thức TT, Ngân hàng */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Loại phiếu chi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={generalInfo.voucherType}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, voucherType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  >
                    <option value="Chi phí hoạt động">Chi phí hoạt động</option>
                    <option value="Chi thanh toán nhà cung cấp">Chi thanh toán nhà cung cấp</option>
                    <option value="Chi tạm ứng công tác">Chi tạm ứng công tác</option>
                    <option value="Chi mua sắm tài sản">Chi mua sắm tài sản</option>
                    <option value="Chi phí lương & nhân sự">Chi phí lương &amp; nhân sự</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Số phiếu chi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={generalInfo.voucherCode}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, voucherCode: e.target.value })}
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("⚙️ Cấu hình quy tắc sinh mã tự động!")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <IconSettings size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Ngày chi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={generalInfo.voucherDate}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, voucherDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Hình thức thanh toán <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={generalInfo.paymentMethod}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  >
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Ủy nhiệm chi (UNC)">Ủy nhiệm chi (UNC)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Tài khoản ngân hàng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={generalInfo.bankAccount}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, bankAccount: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                    >
                      <option value="Vietcombank - 1023 456 789">Vietcombank - 1023 456 789</option>
                      <option value="BIDV - 3141 000 123 456">BIDV - 3141 000 123 456</option>
                      <option value="MBBank - 0988 776 655">MBBank - 0988 776 655</option>
                    </select>
                    <IconBuildingBank size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Cột 2: Đơn vị/Phòng ban, Người nhận, Địa chỉ, MST, STK */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Đơn vị / Phòng ban <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={generalInfo.dept}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, dept: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                    >
                      <option value="Tổ hợp Kiên Giang - TBS Group">Tổ hợp Kiên Giang - TBS Group</option>
                      <option value="Nhà Máy 1 (TBS Sài Gòn)">Nhà Máy 1 (TBS Sài Gòn)</option>
                      <option value="Nhà Máy 2 (TBS Bình Dương)">Nhà Máy 2 (TBS Bình Dương)</option>
                      <option value="Phòng Kế Toán Tổng Hợp">Phòng Kế Toán Tổng Hợp</option>
                    </select>
                    <IconUsers size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Người nhận <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={generalInfo.receiver}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, receiver: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                      placeholder="Công ty TNHH Giải pháp..."
                    />
                    <IconUser size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Địa chỉ</label>
                  <input
                    type="text"
                    value={generalInfo.address}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Mã số thuế</label>
                  <input
                    type="text"
                    value={generalInfo.taxCode}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, taxCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Số tài khoản</label>
                  <input
                    type="text"
                    value={generalInfo.accountNumber}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Cột 3: Nội dung chi, Lý do, Upload box */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Nội dung chi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={generalInfo.content}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Lý do chi</label>
                  <input
                    type="text"
                    value={generalInfo.reason}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, reason: e.target.value })}
                    placeholder="Nhập lý do chi (nếu có)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                </div>

                {/* Upload Box kéo thả */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Chứng từ kèm theo</label>
                  <div className="p-3.5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                      <IconPaperclip size={16} className="text-slate-400 group-hover:text-[#006838]" />
                      <span>Kéo thả file vào đây hoặc</span>
                      <button
                        type="button"
                        onClick={() => showToast("📎 Đã chọn tệp đính kèm Hóa đơn PDF thành công!")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-800 text-[11px] font-extrabold shadow-2xs"
                      >
                        Chọn file
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      PDF, JPG, PNG, DOCX (Tối đa 10MB)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════════ KHỐI 2: 2. CHI TIẾT THANH TOÁN (TABLE) ════════ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              2. Chi tiết thanh toán
            </h3>

            {/* Payment Details Dynamic Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Danh mục chi *</th>
                    <th className="py-2.5 px-3">Diễn giải *</th>
                    <th className="py-2.5 px-3">Mã dự án / Công trình</th>
                    <th className="py-2.5 px-3 w-20">TK Nợ *</th>
                    <th className="py-2.5 px-3 w-20">TK Có *</th>
                    <th className="py-2.5 px-3 text-right">Số tiền (VNĐ) *</th>
                    <th className="py-2.5 px-3 text-right">VAT (VNĐ)</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền (VNĐ)</th>
                    <th className="py-2.5 px-3 w-12 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paymentRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2 min-w-[150px]">
                        <select
                          value={row.category}
                          onChange={(e) => handleRowChange(row.id, "category", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#006838] bg-slate-50/40"
                        >
                          <option value="Chi phí dịch vụ CNTT">Chi phí dịch vụ CNTT</option>
                          <option value="Chi phí văn phòng phẩm">Chi phí văn phòng phẩm</option>
                          <option value="Chi phí tiếp khách">Chi phí tiếp khách</option>
                          <option value="Chi phí công tác">Chi phí công tác</option>
                          <option value="Vật tư R&D Skechers">Vật tư R&amp;D Skechers</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 min-w-[180px]">
                        <input
                          type="text"
                          value={row.desc}
                          onChange={(e) => handleRowChange(row.id, "desc", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#006838] bg-slate-50/40"
                        />
                      </td>
                      <td className="py-2 px-2 min-w-[120px]">
                        <select
                          value={row.project}
                          onChange={(e) => handleRowChange(row.id, "project", e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#006838] bg-slate-50/40"
                        >
                          <option value="PRJ-2026-08">PRJ-2026-08</option>
                          <option value="PRJ-SKECHERS-DLITES">PRJ-SKECHERS-DLITES</option>
                          <option value="PRJ-GO-RUN-MAX">PRJ-GO-RUN-MAX</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={row.debit}
                          onChange={(e) => handleRowChange(row.id, "debit", e.target.value)}
                          className="w-full px-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#006838] bg-slate-50/40"
                        >
                          <option value="6427">6427</option>
                          <option value="6428">6428</option>
                          <option value="1521">1521</option>
                          <option value="1531">1531</option>
                          <option value="3311">3311</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={row.credit}
                          onChange={(e) => handleRowChange(row.id, "credit", e.target.value)}
                          className="w-full px-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#006838] bg-slate-50/40"
                        >
                          <option value="1121">1121</option>
                          <option value="1111">1111</option>
                          <option value="3311">3311</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={row.amount || ""}
                          onChange={(e) => handleRowChange(row.id, "amount", Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-right font-mono font-bold rounded-lg border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#006838] bg-slate-50/40"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={row.vat || ""}
                          onChange={(e) => handleRowChange(row.id, "vat", Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-right font-mono font-bold rounded-lg border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#006838] bg-slate-50/40"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                        {(Number(row.amount || 0) + Number(row.vat || 0)).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Xóa dòng"
                        >
                          <IconTrash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Row Button & Bottom Calculations */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-300 text-[#006838] bg-emerald-50/60 hover:bg-emerald-100 text-xs font-black transition-all flex items-center gap-1.5 w-fit cursor-pointer shadow-2xs"
              >
                <IconPlus size={15} />
                <span>+ Thêm dòng</span>
              </button>

              {/* Total Calculation Panel */}
              <div className="space-y-1.5 text-xs text-slate-600 min-w-[240px] text-right">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Tổng cộng tiền hàng:</span>
                  <span className="font-mono font-bold text-slate-900">{totalSubtotal.toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Tổng VAT:</span>
                  <span className="font-mono font-bold text-slate-900">{totalVAT.toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex justify-between gap-4 pt-1.5 border-t border-slate-200 text-sm">
                  <span className="font-black text-slate-900">Tổng thanh toán:</span>
                  <span className="font-mono font-black text-[#006838]">{grandTotal.toLocaleString("vi-VN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════ KHỐI 3: 3. THÔNG TIN BỔ SUNG ════════ */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              3. Thông tin bổ sung
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Người đề nghị */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Người đề nghị</label>
                <div className="relative">
                  <select
                    value={extraInfo.requester}
                    onChange={(e) => setExtraInfo({ ...extraInfo, requester: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                  >
                    <option value="Nguyễn Thị Mai">Nguyễn Thị Mai</option>
                    <option value="Phạm Nguyễn Anh Huy">Phạm Nguyễn Anh Huy</option>
                    <option value="Trần Minh Quang">Trần Minh Quang</option>
                  </select>
                  <IconUser size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Ghi chú */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Ghi chú</label>
                <input
                  type="text"
                  value={extraInfo.notes}
                  onChange={(e) => setExtraInfo({ ...extraInfo, notes: e.target.value })}
                  placeholder="Nhập ghi chú (nếu có)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838] bg-slate-50/50"
                />
              </div>

              {/* Đính kèm khác */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Đính kèm khác</label>
                <div className="p-2.5 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-2 group cursor-pointer">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold min-w-0">
                    <IconPaperclip size={15} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate text-[11px]">Kéo thả file vào đây</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("📎 Đã thêm tệp đính kèm bổ sung!")}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[10px] font-extrabold flex-shrink-0"
                  >
                    Chọn file
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════ RIGHT COLUMN (QUY TRÌNH & METADATA - 3 Cols) ════════ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Thông Tin Quy Trình (5 Bước Timeline) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Thông tin quy trình
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Bước 1: Nhân viên đề nghị */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-[#006838] text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-xs">
                  1
                </div>
                <div className="min-w-0 text-xs">
                  <h4 className="font-extrabold text-slate-900">Nhân viên đề nghị</h4>
                  <p className="text-slate-600 font-medium mt-0.5">Nguyễn Thị Mai</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">15/08/2026 09:15</p>
                </div>
              </div>

              {/* Bước 2: Trưởng bộ phận */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                  2
                </div>
                <div className="min-w-0 text-xs">
                  <h4 className="font-extrabold text-slate-700">Trưởng bộ phận</h4>
                  <p className="text-slate-400 font-medium text-[11px] mt-0.5">Chờ duyệt</p>
                </div>
              </div>

              {/* Bước 3: Kế toán kiểm tra */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                  3
                </div>
                <div className="min-w-0 text-xs">
                  <h4 className="font-extrabold text-slate-700">Kế toán kiểm tra</h4>
                  <p className="text-slate-400 font-medium text-[11px] mt-0.5">Chờ xử lý</p>
                </div>
              </div>

              {/* Bước 4: Giám đốc tài chính */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                  4
                </div>
                <div className="min-w-0 text-xs">
                  <h4 className="font-extrabold text-slate-700">Giám đốc tài chính</h4>
                  <p className="text-slate-400 font-medium text-[11px] mt-0.5">Chờ duyệt</p>
                </div>
              </div>

              {/* Bước 5: Hoàn tất */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                  5
                </div>
                <div className="min-w-0 text-xs">
                  <h4 className="font-extrabold text-slate-700">Hoàn tất</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Thông Tin Khác */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Thông tin khác
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Trạng thái</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 font-black text-[10px]">
                  Nháp
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Ngày tạo</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">15/08/2026 09:15</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Người tạo</span>
                <span className="font-bold text-slate-800">Nguyễn Thị Mai</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Lần cập nhật cuối</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">15/08/2026 09:15</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
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

export default function ThuChiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center">
          <div className="p-8 text-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#006838] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Đang tải bàn làm việc Thu – Chi...</p>
          </div>
        </div>
      }
    >
      <ThuChiContent />
    </Suspense>
  );
}
