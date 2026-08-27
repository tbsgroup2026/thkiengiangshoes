"use client";

import { useState } from "react";
import { IconChartPie, IconSparkles } from "@tabler/icons-react";

export interface NavRingItem {
  id: string;
  num?: string;
  label: string;
  sub?: string;
  icon: any;
  isActive: boolean;
  hasData?: boolean;
  onClick: () => void;
}

interface RadialNavRingProps {
  items: NavRingItem[];
  centerCount?: number;
  onCenterClick: () => void;
}

export default function RadialNavRing({
  items,
  centerCount = 398,
  onCenterClick,
}: RadialNavRingProps) {
  const [hoveredItem, setHoveredItem] = useState<NavRingItem | null>(null);

  // Position items in radial angles around center
  const totalItems = items.length;

  return (
    <div className="relative w-full max-w-4xl mx-auto min-h-[520px] flex items-center justify-center p-4 select-none my-6">
      {/* Background Decorative Radial Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[480px] h-[480px] rounded-full border border-emerald-500/10 animate-pulse" />
        <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-emerald-500/20" />
        <div className="absolute w-[220px] h-[220px] rounded-full border border-emerald-500/15" />
      </div>

      {/* Center Donut Chart Node Launcher */}
      <button
        onClick={onCenterClick}
        className="relative z-20 w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#006838] via-[#00522c] to-[#08221a] text-white shadow-2xl border-4 border-white flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 group"
        title="Nhấn để mở Dashboard Donut Chart Cải Tiến 24/7"
      >
        <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-1 group-hover:rotate-12 transition-transform">
          <IconChartPie size={24} className="text-emerald-300" />
        </div>
        <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-200">
          {centerCount}
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100/90 text-center px-2">
          Dashboard Cải Tiến
        </span>

        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping opacity-30 pointer-events-none" />
      </button>

      {/* Radial Items Outer Ring (14 Items Tỏa Tròn) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {items.map((item, index) => {
          const IconComp = item.icon;
          const angle = (index * (360 / totalItems) - 90) * (Math.PI / 180);
          // Distance radius from center node
          const radius = 210; // 210px radius
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={item.id}
              className="absolute pointer-events-auto"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Connector Dashed Line to Center */}
              <div
                className="absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-r from-emerald-500/30 to-transparent pointer-events-none -z-10 origin-top"
                style={{
                  height: `${radius - 70}px`,
                  transform: `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`,
                }}
              />

              {/* Radial Pill Button Tile */}
              <button
                onClick={item.hasData !== false ? item.onClick : undefined}
                disabled={item.hasData === false}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2.5 border text-xs font-bold transition-all duration-200 cursor-pointer shadow-md whitespace-nowrap ${
                  item.isActive
                    ? "bg-gradient-to-r from-[#006838] to-[#004d29] text-white border-emerald-400/40 shadow-emerald-900/30 scale-105 ring-2 ring-emerald-500/30"
                    : item.hasData === false
                    ? "bg-white/80 text-slate-400 border-slate-200/80 opacity-50 cursor-not-allowed"
                    : "bg-white text-slate-800 border-slate-200 hover:border-[#006838] hover:text-[#006838] hover:scale-105"
                }`}
                title={item.hasData === false ? "Tính năng đang phát triển (Soon)" : item.label}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.isActive
                      ? "bg-white/20 text-white"
                      : item.hasData === false
                      ? "bg-slate-100 text-slate-400"
                      : "bg-emerald-50 text-[#006838]"
                  }`}
                >
                  <IconComp size={16} />
                </div>

                <div className="text-left">
                  <div className="font-extrabold leading-tight">{item.label}</div>
                  {item.hasData === false && (
                    <span className="text-[9px] font-mono font-normal text-amber-600 block">
                      Soon
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
