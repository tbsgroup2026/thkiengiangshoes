"use client";

import React from "react";
import Link from "next/link";
import { IconArrowLeft, IconMapPin, IconClock } from "@tabler/icons-react";

export default function GembaDedicatedPage() {
  return (
    <div className="min-h-screen bg-slate-100/70 p-4 lg:p-6 space-y-6 font-sans text-slate-900">
      {/* Top Breadcrumb Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/work/cn-ci"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <IconArrowLeft size={16} />
            <span>Quay lại CN-CI</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
            <Link href="/work" className="hover:text-[#006838] transition-colors">
              Văn phòng SKECHERS
            </Link>
            <span>/</span>
            <Link href="/work/cn-ci" className="hover:text-[#006838] transition-colors">
              CN-CI (Cải Tiến Liên Tục)
            </Link>
            <span>/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-black uppercase text-[10px] border border-amber-200">
              📍 Gemba Walk
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider border border-amber-200">
          Soon
        </span>
      </div>

      {/* Gemba Placeholder Content */}
      <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-4 max-w-xl mx-auto my-12 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#fa8c16] flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
          <IconMapPin size={36} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Phân Hệ GEMBA — Đi Hiện Trường &amp; Phát Hiện Vấn Đề
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
            Chức năng Gemba Walk (ghi nhận hiện trường chuyền dán, người phụ trách, ảnh chụp trực tiếp và theo dõi khắc phục sự cố) đang chuẩn bị tích hợp ở giai đoạn tiếp theo.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
          <IconClock size={16} />
          <span>Tính năng đang phát triển — Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
