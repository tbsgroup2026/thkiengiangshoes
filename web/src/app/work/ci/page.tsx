"use client";

import React from "react";
import NavLink from "@/components/NavLink";
import { IconArrowLeft, IconTrendingUp, IconClock } from "@tabler/icons-react";

export default function CIDedicatedPage() {
  return (
    <div className="min-h-screen bg-slate-100/70 p-4 lg:p-6 space-y-6 font-sans text-slate-900">
      {/* Top Breadcrumb Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <NavLink
            href="/work/cn-ci"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <IconArrowLeft size={16} />
            <span>Quay lại CN-CI</span>
          </NavLink>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
            <NavLink href="/work" className="hover:text-[#006838] transition-colors">
              Văn phòng SKECHERS
            </NavLink>
            <span>/</span>
            <NavLink href="/work/cn-ci" className="hover:text-[#006838] transition-colors">
              CN-CI (Cải Tiến Liên Tục)
            </NavLink>
            <span>/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-black uppercase text-[10px] border border-blue-200">
              📈 CI (Điểm nghẽn)
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider border border-blue-200">
          Soon
        </span>
      </div>

      {/* CI Placeholder Content */}
      <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-4 max-w-xl mx-auto my-12 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2f54eb] flex items-center justify-center mx-auto border border-blue-200 shadow-2xs">
          <IconTrendingUp size={36} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Phân Hệ CI — Quản Lý &amp; Theo Dõi Điểm Nghẽn
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
            Chức năng ghi nhận điểm nghẽn sản xuất, 5 loại lãng phí Muda (Chờ đợi, Thao tác thừa, Tồn kho, Vận chuyển, Hàng lỗi) đang được chuẩn hóa giao diện và đấu nối API.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider">
          <IconClock size={16} />
          <span>Tính năng đang phát triển — Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
