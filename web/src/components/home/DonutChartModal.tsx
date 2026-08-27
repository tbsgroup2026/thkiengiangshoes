"use client";

import { useState, useEffect } from "react";
import { IconX, IconChartDonut, IconSparkles, IconBuildingFactory } from "@tabler/icons-react";

interface AreaData {
  id: string;
  name: string;
  count: number;
  color: string;
  details: { label: string; count: number }[];
}

interface DonutChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonutChartModal({ isOpen, onClose }: DonutChartModalProps) {
  const [hoveredArea, setHoveredArea] = useState<AreaData | null>(null);

  const areaData: AreaData[] = [
    {
      id: "zone-1",
      name: "Xưởng Sản Xuất 1 — Giày SKECHERS",
      count: 142,
      color: "#2fd39a", // Emerald
      details: [
        { label: "Gemba Walk sự cố máy", count: 68 },
        { label: "Cải tiến CI quy trình", count: 44 },
        { label: "Kaizen đăng ký", count: 30 },
      ],
    },
    {
      id: "zone-2",
      name: "Xưởng Sản Xuất 2 — Giày SKECHERS",
      count: 98,
      color: "#f2dc9a", // Gold
      details: [
        { label: "Gemba Walk sự cố máy", count: 42 },
        { label: "Cải tiến CI quy trình", count: 32 },
        { label: "Kaizen đăng ký", count: 24 },
      ],
    },
    {
      id: "logistics",
      name: "Khu Kho Vận & ICD Logistics",
      count: 65,
      color: "#60a5fa", // Blue
      details: [
        { label: "Gemba Walk bao gói", count: 30 },
        { label: "Cải tiến CI kho", count: 20 },
        { label: "Kaizen logistics", count: 15 },
      ],
    },
    {
      id: "qc-lab",
      name: "Phòng QC & Thí Nghiệm Kỹ Thuật",
      count: 53,
      color: "#a78bfa", // Purple
      details: [
        { label: "Cải tiến CI tiêu chuẩn", count: 28 },
        { label: "Kaizen quy trình QC", count: 25 },
      ],
    },
    {
      id: "office",
      name: "Văn Phòng Điều Hành & Khác",
      count: 40,
      color: "#f472b6", // Pink
      details: [
        { label: "Số hoá biểu mẫu", count: 25 },
        { label: "Kaizen văn phòng", count: 15 },
      ],
    },
  ];

  const totalCount = areaData.reduce((acc, curr) => acc + curr.count, 0);

  // Calculate SVG stroke offset for donut chart
  let cumulativePercent = 0;
  const chartSegments = areaData.map((area) => {
    const percent = (area.count / totalCount) * 100;
    const startAngle = cumulativePercent;
    cumulativePercent += percent;
    return {
      ...area,
      percent,
      startAngle,
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card / Mobile Bottom Sheet */}
      <div className="relative z-10 w-full max-w-2xl bg-[#08221a] border border-[#2fd39a]/40 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 text-white">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2fd39a]/20 text-[#2fd39a] flex items-center justify-center font-bold">
              <IconChartDonut size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Phân Bổ Cải Tiến Theo Khu Vực
              </h3>
              <p className="text-xs text-gray-400">
                Thống kê tổng {totalCount} bản ghi Gemba / CI / Kaizen SKECHERS - TBS Group
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Content Body: Donut Visual + Interactive Hover Tooltip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* SVG Donut Chart Visual */}
          <div className="md:col-span-6 flex flex-col items-center justify-center relative">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {chartSegments.map((segment) => {
                  const strokeDasharray = `${segment.percent} ${100 - segment.percent}`;
                  const strokeDashoffset = -segment.startAngle;

                  return (
                    <circle
                      key={segment.id}
                      cx="50"
                      cy="50"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      onMouseEnter={() => setHoveredArea(segment)}
                      onMouseLeave={() => setHoveredArea(null)}
                      className="cursor-pointer transition-all duration-300 hover:opacity-85 hover:stroke-[9.5]"
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black font-mono text-white">
                  {hoveredArea ? hoveredArea.count : totalCount}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#f2dc9a]">
                  {hoveredArea ? "Bản ghi khu vực" : "Tổng cải tiến"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-3 italic">
              💡 Di chuột (hoặc chạm) vào các phân đoạn biểu đồ để xem chi tiết
            </p>
          </div>

          {/* Area List / Custom Hover Tooltip Window */}
          <div className="md:col-span-6 space-y-4">
            {hoveredArea ? (
              /* Custom White Floating Tooltip Card on Hover */
              <div className="p-4 rounded-2xl bg-white text-gray-900 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hoveredArea.color }}
                  />
                  <h4 className="text-xs font-black text-gray-900 leading-tight">
                    {hoveredArea.name}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  {hoveredArea.details.map((d, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-gray-600"
                    >
                      <span>• {d.label}</span>
                      <span className="font-bold text-gray-900 font-mono">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-500">Tỷ trọng:</span>
                  <span className="font-extrabold text-[#08221a] font-mono">
                    {((hoveredArea.count / totalCount) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              /* Default List when no segment hovered */
              <div className="space-y-2.5">
                {areaData.map((area) => (
                  <div
                    key={area.id}
                    onMouseEnter={() => setHoveredArea(area)}
                    className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#2fd39a]/40 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="text-xs font-semibold text-gray-200 truncate">
                        {area.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-[#2fd39a]">
                      {area.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span>Dữ liệu thời gian thực Cloudflare D1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
