"use client";

import React, { useState } from "react";
import FinanceShell from "@/components/FinanceShell";
import {
  IconShieldCheck,
  IconCheck,
  IconX,
  IconClock,
  IconUser,
  IconFileText,
  IconPrinter,
} from "@tabler/icons-react";

export default function PheDuyetPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingApprovals = [
    {
      id: "PC-250815-0001",
      title: "Phiếu chi: Chi phí dịch vụ phần mềm quản lý dự án tháng 08/2026",
      requester: "Nguyễn Thị Mai (Kế toán)",
      dept: "Tổ hợp Kiên Giang - TBS Group",
      amount: 19800000,
      date: "15/08/2026 09:15",
      step: "Kế toán trưởng duyệt",
      stepColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "TU-2026-0816",
      title: "Giấy đề nghị tạm ứng: Chi phí công tác kiểm định chất lượng NM3",
      requester: "Trần Minh Quang (QC Lead)",
      dept: "Quản Lý Chất Lượng (QC)",
      amount: 15000000,
      date: "16/08/2026 14:00",
      step: "Giám đốc tài chính duyệt",
      stepColor: "bg-blue-100 text-blue-800",
    },
  ];

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Phê duyệt", href: "/finance/phe-duyet" },
        { label: "Hàng đợi phê duyệt chứng từ" },
      ]}
      title="Trung Tâm Phê Duyệt Chứng Từ & Quy Trình Kế Toán"
      activeSubmenu="Quy trình phê duyệt"
    >
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            Danh Sách Chứng Từ Đang Chờ Bạn Phê Duyệt (2 yêu cầu)
          </h3>
        </div>

        <div className="space-y-3">
          {pendingApprovals.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#006838]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {req.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${req.stepColor}`}>
                    {req.step}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{req.date}</span>
                </div>
                <h4 className="text-xs font-black text-slate-900">{req.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Người đề nghị: <strong className="text-slate-700">{req.requester}</strong> • Bộ phận: {req.dept}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">Số tiền duyệt</span>
                  <span className="text-sm font-black font-mono text-[#006838]">
                    {req.amount.toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => showToast(`❌ Đã từ chối chứng từ ${req.id}!`)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`✅ Đã phê duyệt thành công chứng từ ${req.id}!`)}
                    className="px-4 py-1.5 rounded-xl bg-[#006838] text-white hover:bg-[#00522c] text-xs font-black transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <IconCheck size={15} />
                    <span>Phê Duyệt</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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
