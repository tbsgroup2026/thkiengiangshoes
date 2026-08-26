"use client";

import React from "react";
import { Factory } from "../types";
import {
  IconExternalLink,
  IconBuildingFactory2,
  IconCheck,
  IconAlertTriangle,
  IconGauge,
  IconClock,
} from "@tabler/icons-react";

interface FactoryInfoCardProps {
  factory: Factory;
}

export default function FactoryInfoCard({ factory }: FactoryInfoCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#072419] to-[#004d29] border border-emerald-500/30 p-5 sm:p-6 text-white shadow-xl">
      {/* Background Subtle Tech Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-10 [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Info & Workshops */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <IconBuildingFactory2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                  {factory.name}
                </h3>
                {factory.status === "live" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/80 font-medium">
                {factory.location || "Tổ hợp Sản Xuất Giày SKECHERS - TBS Group"}
              </p>
            </div>
          </div>

          {/* Workshop Line Chips */}
          {factory.workshops && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-md">
              {factory.workshops.map((w, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md text-center"
                >
                  <div className="text-xs font-black text-white">{w.name}</div>
                  <div className="text-[10px] text-emerald-200 font-medium">
                    {w.linesCount} chuyền
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Operational Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[10px] text-emerald-200/70 font-semibold">Quy Mô</div>
              <div className="text-sm sm:text-base font-black text-white">
                {factory.totalLines || 24} chuyền
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[10px] text-emerald-200/70 font-semibold flex items-center gap-1">
                <IconGauge size={12} className="text-emerald-400" />
                Hiệu Suất OEE
              </div>
              <div className="text-sm sm:text-base font-black text-emerald-300">
                {factory.oee || 98.2}%
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[10px] text-amber-200/70 font-semibold flex items-center gap-1">
                <IconAlertTriangle size={12} className="text-amber-400" />
                Sự Cố Hôm Nay
              </div>
              <div className="text-sm sm:text-base font-black text-amber-300">
                {factory.openIncidents || 12} vụ
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/25 border border-white/5">
              <div className="text-[10px] text-blue-200/70 font-semibold flex items-center gap-1">
                <IconClock size={12} className="text-blue-400" />
                MTTR Khắc Phục
              </div>
              <div className="text-sm sm:text-base font-black text-blue-200">
                {factory.mttrMinutes || 38} phút
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Deep Link to KG1 Portal */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
          <div className="text-left lg:text-right">
            <span className="text-[11px] uppercase tracking-wider text-emerald-200/70 font-bold block">
              Hệ thống nghiệp vụ 7 bước
            </span>
            <span className="text-xs text-white/90 font-medium block">
              5M+1E • Giao việc • Nghiệm thu
            </span>
          </div>

          {factory.portalUrl && (
            <a
              href={factory.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <span>Truy cập hệ thống QC {factory.code}</span>
              <IconExternalLink
                size={16}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
