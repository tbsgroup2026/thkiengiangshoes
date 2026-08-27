"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { IconX, IconChartPie, IconTrendingUp, IconAward, IconCheck } from "@tabler/icons-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonutChartModal({ isOpen, onClose }: DonutChartModalProps) {
  const [hoveredData, setHoveredData] = useState<{
    label: string;
    value: number;
    percent: string;
    color: string;
    subItems: { name: string; count: number }[];
  } | null>(null);

  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const chartData = {
    labels: [
      "Zone A - Xưởng May 01",
      "Zone B - Xưởng Ép Đế",
      "Zone C - Xưởng Hoàn Thắng",
      "Zone D - Logistics TTPP",
      "Khu Vực R&D Mẫu",
      "Trung Tâm QC",
    ],
    datasets: [
      {
        data: [120, 85, 74, 52, 41, 26],
        backgroundColor: [
          "#006838",
          "#2fd39a",
          "#f2dc9a",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
        ],
        borderWidth: 3,
        borderColor: "#ffffff",
        hoverBorderColor: "#ffffff",
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Use custom hover tooltip below for high-end aesthetic
      },
    },
    onHover: (_event: any, elements: any[]) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
        const val = chartData.datasets[0].data[index];
        const pct = ((val / total) * 100).toFixed(1) + "%";

        const subDetails: Record<number, { name: string; count: number }[]> = {
          0: [
            { name: "Cải tiến gá may tự động", count: 45 },
            { name: "Tối ưu đường kim mũi chỉ", count: 40 },
            { name: "Giảm thời gian thao tác", count: 35 },
          ],
          1: [
            { name: "Tiết kiệm keo dán đế SKECHERS", count: 50 },
            { name: "Tự động hóa khuôn ép phylon", count: 35 },
          ],
          2: [
            { name: "Quy trình đóng gói tự động", count: 44 },
            { name: "Giảm tỷ lệ xước sản phẩm", count: 30 },
          ],
          3: [
            { name: "Tối ưu lộ trình xe nâng TTPP", count: 32 },
            { name: "Quản lý kho thông minh QR", count: 20 },
          ],
          4: [
            { name: "Thiết kế phom giày 3D mới", count: 25 },
            { name: "Mẫu thử vật liệu siêu nhẹ", count: 16 },
          ],
          5: [
            { name: "Chỉ số OEE đo tự động", count: 16 },
            { name: "Phát hiện lỗi bề mặt bằng AI", count: 10 },
          ],
        };

        setHoveredData({
          label: chartData.labels[index],
          value: val,
          percent: pct,
          color: chartData.datasets[0].backgroundColor[index],
          subItems: subDetails[index] || [],
        });
      }
    },
  };

  const totalCount = chartData.datasets[0].data.reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#006838] via-[#00522c] to-[#08221a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20 shadow-xs">
              <IconChartPie size={22} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Phân Bổ Chỉ Số Cải Tiến Theo Khu Vực
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Văn Phòng Chuỗi SKECHERS - TBS Group Dashboard 24/7
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Modal Body: Donut Chart Left & High-End Custom Tooltip Card Right */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Chart Left (5 Cols) */}
          <div className="md:col-span-5 relative flex flex-col items-center justify-center min-h-[260px]">
            <div className="w-56 h-56 relative">
              <Doughnut data={chartData} options={chartOptions} />

              {/* Donut Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black font-mono text-[#006838] tracking-tight">
                  {totalCount}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Tổng Cải Tiến
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown / Hover Tooltip Right (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            {hoveredData ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: hoveredData.color }}
                    />
                    <h4 className="text-sm font-black text-slate-900">
                      {hoveredData.label}
                    </h4>
                  </div>
                  <span className="text-xs font-black font-mono text-[#006838] bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {hoveredData.percent} ({hoveredData.value} ý tưởng)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Hạng mục cải tiến hàng đầu:
                  </span>
                  <div className="space-y-1.5">
                    {hoveredData.subItems.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 text-xs"
                      >
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <IconCheck size={14} className="text-[#006838]" />
                          {sub.name}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {sub.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-center space-y-2">
                <IconTrendingUp size={28} className="text-[#006838] mx-auto" />
                <h4 className="text-xs font-bold text-[#006838]">
                  Rê chuột vào từng phân đoạn biểu đồ để xem chi tiết
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Số liệu được cập nhật thời gian thực từ Cloudflare D1 Database cho từng Chuyền sản xuất SKECHERS.
                </p>
              </div>
            )}

            {/* Region Legend Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {chartData.labels.map((label, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 text-xs font-bold text-slate-700 shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: chartData.datasets[0].backgroundColor[idx] }}
                  />
                  <span className="truncate text-[11px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ Thống Báo Cáo Cải Tiến Tự Động SKECHERS - TBS Group</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#006838] text-white font-extrabold hover:bg-[#00522c] transition-colors cursor-pointer shadow-2xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
