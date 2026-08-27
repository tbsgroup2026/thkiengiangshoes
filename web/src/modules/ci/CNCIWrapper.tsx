"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconBulb,
  IconTrendingUp,
  IconMapPin,
  IconArrowRight,
  IconArrowLeft,
  IconClock,
  IconSparkles,
  IconAlertCircle,
  IconBuildingFactory,
} from "@tabler/icons-react";
import CIModule from "./CIModule";

export default function CNCIWrapper() {
  const router = useRouter();
  const [subView, setSubView] = useState<"kaizen" | "ci" | "gemba" | null>(null);

  // Sync subView with URL search params if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const sub = urlParams.get("sub");
      if (sub === "kaizen" || sub === "ci" || sub === "gemba") {
        setSubView(sub);
      }
    }
  }, []);

  const handleSelectSubView = (view: "kaizen" | "ci" | "gemba") => {
    if (view === "kaizen") {
      router.push("/work/kaizen");
    } else if (view === "ci") {
      router.push("/work/ci");
    } else if (view === "gemba") {
      router.push("/work/gemba");
    }
  };

  const handleBackToLanding = () => {
    router.push("/work/cn-ci");
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* ════════════════════════════════════════════════════════════════
          BREADCRUMB / TOP NAVIGATION BAR (FOR SUB-VIEWS)
         ════════════════════════════════════════════════════════════════ */}
      {subView && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <Link
            href="/work/cn-ci"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <IconArrowLeft size={16} />
            <span>Quay lại Danh Mục CN-CI</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>CN-CI (Cải Tiến Liên Tục)</span>
            <span>/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006838] font-black uppercase text-[10px] border border-emerald-200">
              {subView === "kaizen" ? "💡 Kaizen (Thư viện Cải tiến)" : subView === "ci" ? "📈 CI (Điểm nghẽn)" : "📍 Gemba Walk"}
            </span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          1. LANDING SELECTION VIEW (3 LARGE CARDS MATCHING IMAGE 2)
         ════════════════════════════════════════════════════════════════ */}
      {!subView && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* Top Banner Intro */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#004d29] to-slate-950 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 z-10">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-300/30">
                Phân Hệ CN-CI
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Cải Tiến Liên Tục &amp; Năng Suất 4.0</span>
              </h2>
              <p className="text-xs text-emerald-100/90 font-medium max-w-xl">
                Chọn một trong ba trung tâm quản trị nghiệp vụ cải tiến dưới đây để bắt đầu thực hiện.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center flex-shrink-0 backdrop-blur-xs border border-white/15">
              <IconSparkles size={28} />
            </div>
          </div>

          {/* 3 Large Selection Cards Grid (Exact Matching Image 2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: KAIZEN */}
            <Link
              href="/work/kaizen"
              className="group rounded-3xl p-6 bg-[#f2faf5] border-2 border-[#d4f2e1] hover:border-[#006838] shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] relative overflow-hidden"
            >
              {/* Decorative Subtle Dots Pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(#006838_1px,transparent_1px)] [background-size:8px_8px] opacity-10 pointer-events-none" />

              <div className="flex items-start gap-4">
                {/* Green Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-[#dcf4e7] text-[#006838] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <IconBulb size={32} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-emerald-950 tracking-tight group-hover:text-[#006838] transition-colors">
                    KAIZEN
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                    Đề xuất ý tưởng, cải tiến công việc mỗi ngày
                  </p>
                </div>
              </div>

              {/* Bottom Row Arrow Action */}
              <div className="flex justify-end pt-4">
                <div className="w-11 h-11 rounded-full bg-[#006838] text-white flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:translate-x-1 transition-all">
                  <IconArrowRight size={22} />
                </div>
              </div>
            </Link>

            {/* CARD 2: CI */}
            <Link
              href="/work/ci"
              className="group rounded-3xl p-6 bg-[#f0f5ff] border-2 border-[#d6e4ff] hover:border-[#2f54eb] shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] relative overflow-hidden"
            >
              {/* Decorative Subtle Dots Pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(#2f54eb_1px,transparent_1px)] [background-size:8px_8px] opacity-10 pointer-events-none" />

              <div className="flex items-start gap-4">
                {/* Blue Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-[#d6e4ff] text-[#2f54eb] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <IconTrendingUp size={32} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-blue-950 tracking-tight group-hover:text-[#2f54eb] transition-colors flex items-center gap-2">
                    <span>CI</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                      Soon
                    </span>
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                    Quản lý &amp; theo dõi các hoạt động cải tiến
                  </p>
                </div>
              </div>

              {/* Bottom Row Arrow Action */}
              <div className="flex justify-end pt-4">
                <div className="w-11 h-11 rounded-full bg-[#2f54eb] text-white flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:translate-x-1 transition-all">
                  <IconArrowRight size={22} />
                </div>
              </div>
            </Link>

            {/* CARD 3: GEMBA */}
            <Link
              href="/work/gemba"
              className="group rounded-3xl p-6 bg-[#fff7e6] border-2 border-[#ffd591] hover:border-[#fa8c16] shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px] relative overflow-hidden"
            >
              {/* Decorative Subtle Dots Pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(#fa8c16_1px,transparent_1px)] [background-size:8px_8px] opacity-10 pointer-events-none" />

              <div className="flex items-start gap-4">
                {/* Orange Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-[#ffe7ba] text-[#fa8c16] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <IconMapPin size={32} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-amber-950 tracking-tight group-hover:text-[#fa8c16] transition-colors flex items-center gap-2">
                    <span>GEMBA</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                      Soon
                    </span>
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                    Đi hiện trường, quan sát và phát hiện vấn đề
                  </p>
                </div>
              </div>

              {/* Bottom Row Arrow Action */}
              <div className="flex justify-end pt-4">
                <div className="w-11 h-11 rounded-full bg-[#fa8c16] text-white flex items-center justify-center shadow-md shadow-amber-900/20 group-hover:translate-x-1 transition-all">
                  <IconArrowRight size={22} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          2. KAIZEN SUB-VIEW (FULL GIAI ĐOẠN 2 THƯ VIỆN CẢI TIẾN)
         ════════════════════════════════════════════════════════════════ */}
      {subView === "kaizen" && (
        <div className="animate-in fade-in duration-200">
          <CIModule />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          3. CI SUB-VIEW (PLACEHOLDER "SẮP RA MẮT")
         ════════════════════════════════════════════════════════════════ */}
      {subView === "ci" && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-4 max-w-xl mx-auto my-8 animate-in zoom-in-95 duration-200">
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
      )}

      {/* ════════════════════════════════════════════════════════════════
          4. GEMBA SUB-VIEW (PLACEHOLDER "SẮP RA MẮT")
         ════════════════════════════════════════════════════════════════ */}
      {subView === "gemba" && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-4 max-w-xl mx-auto my-8 animate-in zoom-in-95 duration-200">
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
      )}
    </div>
  );
}
