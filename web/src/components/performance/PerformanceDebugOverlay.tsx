"use client";

import React, { useState } from "react";
import { usePerformance } from "@/context/PerformanceContext";
import {
  IconActivity,
  IconWifi,
  IconCpu,
  IconPhoto,
  IconX,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

export function PerformanceDebugOverlay() {
  const {
    isDebugMode,
    profile,
    details,
    activeQuality,
    shouldAnimate,
    stats,
    toggleDebugMode,
  } = usePerformance();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!isDebugMode) return null;

  const profileColors = {
    low: "bg-red-500 text-white",
    medium: "bg-amber-500 text-white",
    high: "bg-emerald-600 text-white",
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs shadow-2xl rounded-2xl bg-slate-900/95 text-slate-100 border border-slate-700/80 backdrop-blur-md transition-all duration-300 max-w-xs w-80 overflow-hidden">
      {/* Header bar */}
      <div className="px-3.5 py-2.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconActivity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-extrabold tracking-wide text-slate-200">PERF DEBUG HUD</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${profileColors[profile]}`}
          >
            {profile}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-700/80 rounded text-slate-400 hover:text-slate-200"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={toggleDebugMode}
            className="p-1 hover:bg-red-500/30 rounded text-slate-400 hover:text-red-400"
            title="Close Debug Mode"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>

      {/* Body content */}
      {!isMinimized && (
        <div className="p-3.5 space-y-3">
          {/* Network Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <IconWifi size={12} className="text-sky-400" />
              <span>Network Conditions</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block">Type:</span>
                <span className="font-bold text-sky-300 uppercase">{details.effectiveType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">RTT / Speed:</span>
                <span className="font-bold text-emerald-300">
                  {details.rtt ? `${details.rtt}ms` : `${details.measuredLatencyMs ? Math.round(details.measuredLatencyMs) + "ms" : "N/A"}`}
                </span>
              </div>
              {details.downlink !== undefined && (
                <div>
                  <span className="text-slate-500 block">Downlink:</span>
                  <span className="font-bold text-amber-300">{details.downlink} Mbps</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block">SaveData:</span>
                <span className={`font-bold ${details.saveData ? "text-red-400" : "text-slate-400"}`}>
                  {details.saveData ? "ENABLED" : "Off"}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <IconCpu size={12} className="text-purple-400" />
              <span>Hardware & Motion</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block">CPU Cores:</span>
                <span className="font-bold text-purple-300">{details.hardwareConcurrency || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">RAM:</span>
                <span className="font-bold text-purple-300">
                  {details.deviceMemory ? `${details.deviceMemory} GB` : "N/A"}
                </span>
              </div>
              <div className="col-span-2 flex justify-between items-center pt-1 border-t border-slate-800/80">
                <span className="text-slate-500">Animations:</span>
                <span className={`font-bold ${shouldAnimate ? "text-emerald-400" : "text-amber-400"}`}>
                  {shouldAnimate ? "ACTIVE (Full)" : "REDUCED / PAUSED"}
                </span>
              </div>
            </div>
          </div>

          {/* Image & Service Worker Stats */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <IconPhoto size={12} className="text-emerald-400" />
              <span>Cloudinary & Service Worker</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cloudinary Preset:</span>
                <span className="font-bold text-emerald-400 truncate max-w-[140px]">{activeQuality}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Lazy Loaded Images:</span>
                <span className="font-bold text-sky-300">{stats.lazyLoadedImagesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Failed / Retried:</span>
                <span className={`font-bold ${stats.failedImagesCount > 0 ? "text-red-400" : "text-slate-400"}`}>
                  {stats.failedImagesCount}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                <span className="text-slate-500">Service Worker:</span>
                <span className={`font-bold ${stats.swActive ? "text-emerald-400" : "text-slate-400"}`}>
                  {stats.swActive ? "ACTIVE (Caching)" : "INACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
