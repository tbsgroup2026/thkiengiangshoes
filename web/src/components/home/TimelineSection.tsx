"use client";

import React, { useRef, useEffect, useState } from "react";
import { IconAward, IconBuildingFactory, IconDeviceLaptop, IconLeaf, IconSun, IconUsers } from "@tabler/icons-react";

const MILESTONES = [
  {
    year: "1989", title: "Khởi Nghiệp", icon: IconUsers,
    desc: "Ba nhà sáng lập Nguyễn Đức Thuấn, Cao Thanh Bích, Nguyễn Thanh Sơn cùng khởi nghiệp với khát vọng làm giàu trên quê hương.",
    highlight: null
  },
  {
    year: "1992", title: "Nhà Máy Đầu Tiên", icon: IconBuildingFactory,
    desc: "Dự án Nhà máy số 1 được phê duyệt. Năm 1993, ký hợp đồng gia công đầu tiên: 6 triệu đôi giày nữ.",
    highlight: "6M đôi giày"
  },
  {
    year: "1996", title: "Hợp Tác Quốc Tế", icon: IconAward,
    desc: "Bắt đầu hợp tác với Decathlon - đối tác chiến lược toàn cầu. Mở rộng sang các thương hiệu giày thể thao quốc tế.",
    highlight: "Decathlon"
  },
  {
    year: "2014", title: "Đỉnh Cao Thành Tích", icon: IconAward,
    desc: "Cán mốc 21 triệu đôi giày & 10 triệu túi xách. Vinh dự nhận Huân chương Lao động Hạng Nhất và Cờ thi đua Chính phủ.",
    highlight: "Huân chương Hạng Nhất"
  },
  {
    year: "2017", title: "Văn Phòng SKECHERS", icon: IconBuildingFactory,
    desc: "Khởi công tổ hợp sản xuất chuỗi SKECHERS - TBS Group. Năm 2018, sản phẩm đầu tiên xuất xưởng đạt chuẩn quốc tế.",
    highlight: "SKECHERS"
  },
  {
    year: "2020", title: "Số Hóa Vượt Khó", icon: IconDeviceLaptop,
    desc: "Thích ứng COVID-19 với giám sát sản xuất từ xa. Triển khai số hóa quy trình, đào tạo trực tuyến.",
    highlight: "Số hóa"
  },
  {
    year: "2024", title: "Nhà Máy Thông Minh", icon: IconSun,
    desc: "Chuyển đổi số toàn diện - TBS II Digital Factory. Hệ thống năng lượng mặt trời. Hướng tới giảm 40% carbon.",
    highlight: "TBS II"
  },
  {
    year: "2026", title: "Tầm Vóc Toàn Cầu", icon: IconLeaf,
    desc: "Top 5 chuỗi sản xuất toàn cầu. Đối tác chiến lược của Skechers, Coach, Decathlon. 50.000 nhân sự.",
    highlight: "TOP 5 Global"
  },
];

function TimelineCard({ milestone, index, isLeft }: { milestone: typeof MILESTONES[0]; index: number; isLeft: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Icon = milestone.icon;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative flex items-center w-full my-8 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${isLeft ? "lg:flex-row-reverse" : ""}`}
    >
      {/* Content */}
      <div className={`w-full lg:w-5/12 ${isLeft ? "lg:pl-12" : "lg:pr-12 lg:text-right"}`}>
        <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow ${
          isLeft ? "lg:ml-0" : "lg:mr-0"
        }`}>
          <div className={`flex items-center gap-3 mb-3 ${isLeft ? "" : "lg:justify-end"}`}>
            <span className="font-black text-3xl text-emerald-400 tabular-nums">{milestone.year}</span>
            {milestone.highlight && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {milestone.highlight}
              </span>
            )}
          </div>
          <h3 className={`font-black text-lg text-tbs-dark mb-2 ${isLeft ? "" : "lg:text-right"}`}>
            {milestone.title}
          </h3>
          <p className={`text-sm text-gray-500 leading-relaxed ${isLeft ? "" : "lg:text-right"}`}>
            {milestone.desc}
          </p>
        </div>
      </div>

      {/* Center dot */}
      <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-400 border-4 border-emerald-50 shadow-lg z-10 hidden lg:block" />

      {/* Empty spacer for the other side */}
      <div className="hidden lg:block lg:w-5/12" />
    </div>
  );
}

export default function TimelineSection() {
  return (
    <section id="timeline" className="relative py-24 lg:py-32 bg-gradient-to-b from-tbs-dark to-[#0a3025] overflow-hidden">
      {/* BG patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 border border-white/50 rounded-full" />
        <div className="absolute bottom-40 right-20 w-96 h-96 border border-white/30 rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-[10px] tracking-[0.2em] uppercase font-bold">
            Hành Trình 30+ Năm
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Từ xưởng nhỏ đến tập đoàn toàn cầu
          </h2>
          <p className="text-white/50 text-base lg:text-lg leading-relaxed">
            Hành trình từ năm 1989 với khát vọng đưa công nghiệp Việt Nam hội nhập sâu vào chuỗi giá trị toàn cầu.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/60 via-emerald-400/30 to-emerald-400/60 -translate-x-px" />

          {MILESTONES.map((m, i) => (
            <TimelineCard key={i} milestone={m} index={i} isLeft={i % 2 === 0} />
          ))}
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-emerald-400/30" />
          <div className="space-y-6">
            {MILESTONES.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-1.5 top-1 w-5 h-5 rounded-full bg-emerald-400 border-4 border-[#0a3025] shadow-lg" />
                  <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-black text-2xl text-emerald-400">{m.year}</span>
                      {m.highlight && (
                        <span className="text-[10px] bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                          {m.highlight}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-white text-lg mb-1">{m.title}</h3>
                    <p className="text-sm text-white/50">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
