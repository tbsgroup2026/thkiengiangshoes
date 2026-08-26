"use client";

import React, { useState } from "react";
import Link from "next/link";
import FinanceShell from "@/components/FinanceShell";
import {
  IconCalendarEvent,
  IconCheck,
  IconPlus,
  IconPrinter,
  IconDownload,
  IconChartPie,
} from "@tabler/icons-react";

export default function PhanBoPhongBanPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const allocations = [
    {
      dept: "R&D - Phát Triển Mẫu Giày Skechers",
      categories: [
        { name: "Vật tư thử nghiệm & Mẫu Upper", amount: 450000000, ratio: 42.8 },
        { name: "Chi phí công tác kỹ thuật nhà máy", amount: 250000000, ratio: 23.8 },
        { name: "Phần mềm & Bản quyền 3D CAD/CAM", amount: 200000000, ratio: 19.0 },
        { name: "Chi phí đào tạo & Hội thảo", amount: 150000000, ratio: 14.4 },
      ],
      total: 1050000000,
    },
    {
      dept: "Quản Lý Chất Lượng (QC)",
      categories: [
        { name: "Thiết bị đo lường & Kiểm định máy", amount: 220000000, ratio: 48.9 },
        { name: "Chi phí công tác QC tại các xưởng", amount: 150000000, ratio: 33.3 },
        { name: "Vật tư tiêu hao phòng LAB", amount: 80000000, ratio: 17.8 },
      ],
      total: 450000000,
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Ngân sách", href: "/finance/ngan-sach" },
        { label: "Phân bổ phòng ban" },
      ]}
      activeSubmenu="Phân bổ phòng ban"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white flex items-center justify-center shadow-xs">
            <IconChartPie size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Phân Bổ Ngân Sách Theo Khoản Mục Chi Phí
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Chi tiết hóa chỉ tiêu ngân sách từng phân ban, dự án và mục tiêu chiến lược
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("⚡ Đã cập nhật ma trận phân bổ ngân sách!")}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <IconCheck size={16} />
            <span>Lưu phân bổ</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {allocations.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">{item.dept}</h3>
              <span className="text-xs font-black text-[#006838]">
                Tổng hạn mức: {item.total.toLocaleString("vi-VN")} đ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {item.categories.map((cat, cIdx) => (
                <div key={cIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 line-clamp-1">{cat.name}</span>
                  <div className="text-sm font-mono font-black text-slate-900">
                    {cat.amount.toLocaleString("vi-VN")} đ
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">Chiếm {cat.ratio}% hạn mức</div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
