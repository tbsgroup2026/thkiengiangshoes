"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconBuildingFactory, IconBackpack, IconBuildingSkyscraper, IconShip, IconBuildingStore } from "@tabler/icons-react";

const BUSINESSES = [
  {
    title: "Sản Xuất Giày Dép",
    subtitle: "21 triệu đôi/năm · 33 dây chuyền",
    desc: "Đối tác chiến lược toàn cầu của Decathlon, Skechers, Reebok. Duy trì vị thế dẫn đầu với sản phẩm đạt tiêu chuẩn quốc tế.",
    icon: IconBuildingFactory,
    color: "emerald",
    image: "/images/crawled/Da-giay1.jpg",
    stats: { value: "21M+", label: "Đôi giày/năm" },
    newsCategory: "san-xuat-cong-nghiep",
  },
  {
    title: "Sản Xuất Túi Xách",
    subtitle: "10 triệu sản phẩm/năm",
    desc: "Quy trình thiết kế và lắp ráp đạt chuẩn Coach, Tory Burch, Lancaster. Tốc độ tăng trưởng bình quân 20%/năm.",
    icon: IconBackpack,
    color: "violet",
    image: "/images/crawled/Tui-xach1.jpg",
    stats: { value: "10M+", label: "Túi xách/năm" },
    newsCategory: "san-xuat-cong-nghiep",
  },
  {
    title: "Bất Động Sản & Hạ Tầng",
    subtitle: "KCN · Căn hộ · Thương mại",
    desc: "Đầu tư và quản lý các khu công nghiệp trọng điểm tại tứ giác kinh tế phía Nam. Dự án Green Skyline tại Dĩ An.",
    icon: IconBuildingSkyscraper,
    color: "amber",
    image: "/images/crawled/03_INVESTMENT_ASSET_MANAGEMENT.jpg",
    stats: { value: "2.75", label: "Tỷ VND/căn hộ" },
    newsCategory: "tin-tap-doan",
  },
  {
    title: "Cảng & Logistics",
    subtitle: "ICD TBS Tân Vạn · 220.000m²",
    desc: "Hệ thống cảng cạn & kho bãi tại vị trí chiến lược vùng kinh tế phía Nam. Công suất 60.000 containers.",
    icon: IconShip,
    color: "blue",
    image: "/images/crawled/04_LOGISTICS.jpg",
    stats: { value: "220K", label: "m² kho bãi" },
    newsCategory: "tin-tap-doan",
  },
  {
    title: "Du Lịch & Khách Sạn",
    subtitle: "Mai House Hotels & Resorts",
    desc: "Chuỗi khách sạn, resort và sân golf cao cấp tại Việt Nam và Đông Nam Á. Montgomerie Links 15 năm.",
    icon: IconBuildingStore,
    color: "rose",
    image: "/images/crawled/05.webp",
    stats: { value: "15", label: "Năm golf" },
    newsCategory: "tin-tap-doan",
  },
];

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const colorMap: Record<string, string> = {
  emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-400/20 hover:border-emerald-400/40",
  violet: "from-violet-500/20 to-violet-600/5 border-violet-400/20 hover:border-violet-400/40",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-400/20 hover:border-amber-400/40",
  blue: "from-blue-500/20 to-blue-600/5 border-blue-400/20 hover:border-blue-400/40",
  rose: "from-rose-500/20 to-rose-600/5 border-rose-400/20 hover:border-rose-400/40",
};

const iconColorMap: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-400/10",
  violet: "text-violet-400 bg-violet-400/10",
  amber: "text-amber-400 bg-amber-400/10",
  blue: "text-blue-400 bg-blue-400/10",
  rose: "text-rose-400 bg-rose-400/10",
};

export default function BusinessUnits() {
  return (
    <section id="business" className="relative py-24 lg:py-32 bg-[#f8faf9] overflow-hidden">
      {/* Subtle bg pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <FadeInSection>
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] tracking-[0.2em] uppercase font-bold">
              6 Lĩnh Vực Kinh Doanh
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-tbs-dark">
              Hệ sinh thái TBS Group
            </h2>
            <p className="text-gray-500 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
              Sau hơn 30 năm hình thành và đổi mới sáng tạo, TBS Group đang khẳng định vị thế
              dẫn đầu trong các lĩnh vực công nghiệp trọng điểm của Việt Nam và khu vực.
            </p>
          </div>
        </FadeInSection>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {BUSINESSES.map((biz, i) => {
            const Icon = biz.icon;
            return (
              <FadeInSection key={i} delay={i * 100}>
                <div
                  className={`group relative bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 bg-gradient-to-br ${colorMap[biz.color]}`}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={biz.image}
                      alt={biz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />

                    {/* Stats badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg border border-white/80">
                      <span className="block text-lg font-black text-tbs-dark leading-tight">{biz.stats.value}</span>
                      <span className="block text-[9px] text-gray-500 tracking-wider uppercase">{biz.stats.label}</span>
                    </div>

                    {/* Icon */}
                    <div className={`absolute top-4 left-4 w-11 h-11 rounded-2xl flex items-center justify-center ${iconColorMap[biz.color]}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <span className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">{biz.subtitle}</span>
                    <h3 className="font-black text-xl text-tbs-dark group-hover:text-emerald-600 transition-colors">
                      {biz.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{biz.desc}</p>
                    <div className="pt-2">
                      <Link
                        href={`/news?category=${biz.newsCategory}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Tin tức liên quan <IconArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
