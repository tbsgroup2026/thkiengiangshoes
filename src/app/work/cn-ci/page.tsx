"use client";

import React from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import CNCIWrapper from "@/modules/ci/CNCIWrapper";

export default function CNCIDedicatedPage() {
  return (
    <div className="min-h-screen bg-slate-100/70 p-4 lg:p-6 space-y-4 font-sans text-slate-900">
      {/* Top Breadcrumb Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/work"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <IconArrowLeft size={16} />
            <span>Quay lại Dashboard /work</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
            <Link href="/work" className="hover:text-[#006838] transition-colors">
              Văn phòng SKECHERS
            </Link>
            <span>/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006838] font-black uppercase text-[10px] border border-emerald-200">
              CN-CI (Cải Tiến Liên Tục)
            </span>
          </div>
        </div>
      </div>

      {/* Landing Wrapper rendering the 3 Large Cards */}
      <CNCIWrapper />
    </div>
  );
}
