"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconUsers,
  IconCheck,
  IconPlus,
  IconSearch,
  IconPhoneCall,
  IconMail,
  IconBuildingStore,
  IconBuildingBank,
} from "@tabler/icons-react";

export default function DoiTacNCCPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const partners = [
    {
      id: "DT-001",
      name: "SKECHERS USA INC",
      group: "Khách hàng xuất khẩu",
      contact: "Mr. David Harrison - Supply Chain Director",
      phone: "+1 310 318 3100",
      email: "david.h@skechers.com",
      paymentTerms: "Net 30 Days (T/T)",
      status: "Đối tác chiến lược",
    },
    {
      id: "DT-002",
      name: "Công ty TNHH Vật Tư Da Giày Minh Long",
      group: "Nhà cung cấp da & vật tư",
      contact: "Nguyễn Văn Long - Giám Đốc",
      phone: "0903 123 456",
      email: "long.nv@minhlongleather.vn",
      paymentTerms: "Gối đầu 45 ngày",
      status: "NCC Cấp 1",
    },
    {
      id: "DT-003",
      name: "Tập Đoàn Hóa Chất TexChem Việt Nam",
      group: "Nhà cung cấp keo & hóa chất",
      contact: "Trần Thanh Thảo - Trưởng phòng KD",
      phone: "0918 888 999",
      email: "thao.tt@texchem.vn",
      paymentTerms: "30 ngày kể từ ngày xuất HĐ",
      status: "NCC Cấp 1",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Công nợ", href: "/finance/cong-no" },
        { label: "Danh mục Đối tác & NCC" },
      ]}
      activeSubmenu="Đối tác & NCC"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconBuildingStore size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Danh Mục Đối Tác &amp; Nhà Cung Cấp
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Quản lý hồ sơ doanh nghiệp, điều khoản công nợ và hạn mức tín dụng thương mại TBS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("📝 Đã mở form thêm đối tác / nhà cung ứng mới!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Thêm đối tác / NCC mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-600">
                <th className="py-2.5 px-3">Mã Đối Tác</th>
                <th className="py-2.5 px-3">Tên Doanh Nghiệp</th>
                <th className="py-2.5 px-3">Phân Loại Nhóm</th>
                <th className="py-2.5 px-3">Người Đại Diện &amp; Liên Hệ</th>
                <th className="py-2.5 px-3">Điều Khoản Thanh Toán</th>
                <th className="py-2.5 px-3 text-center">Xếp Hạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {partners.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#006838]">{row.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.name}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-600">{row.group}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{row.contact}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{row.phone} • {row.email}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{row.paymentTerms}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006838] font-bold text-[10px]">
                      {row.status}
                    </span>
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
