"use client";

import React, { useState, useEffect } from "react";
import {
  IconBuildingSkyscraper,
  IconSitemap,
  IconAward,
  IconBulb,
  IconZoomIn,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
  IconEye,
  IconBuildingWarehouse,
} from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface WorkspaceItem {
  id: string;
  title: string;
  subtitle: string;
  category: "sanh" | "trung-bay" | "truyen-thong" | "rd" | "van-hanh";
  categoryLabel: string;
  tag: string;
  image: string;
  desc: string;
}

export const WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    id: "kglv-1",
    title: "Không gian làm việc chuẩn mực",
    subtitle: "Lối Vào Điều Hành SKECHERS",
    category: "sanh",
    categoryLabel: "Sảnh & Điều Hành",
    tag: "Lobby Front",
    image: "/images/KGLV/MẶT TIỀN SẢNH.png",
    desc: "Mặt tiền sảnh tiếp đón thiết kế hiện đại, thể hiện diện mạo chuyên nghiệp và quy mô vận hành của Tổ hợp Kiên Giang - TBS Group.",
  },
  {
    id: "kglv-2",
    title: "Khu làm việc phối hợp",
    subtitle: "Không Gian Đón Tiếp Đối Tác",
    category: "sanh",
    categoryLabel: "Sảnh & Điều Hành",
    tag: "Interior Lobby",
    image: "/images/KGLV/SẢNH GÓC TỪ TRONG NHÌN RA.png",
    desc: "Góc nhìn từ bên trong sảnh ra khu vực sân chính, ngập tràn ánh sáng tự nhiên và điểm xuyết cây xanh thân thiện với môi trường.",
  },
  {
    id: "kglv-3",
    title: "Điểm nhấn thiết kế nội thất",
    subtitle: "Khu Làm Việc Trung Tâm",
    category: "sanh",
    categoryLabel: "Sảnh & Điều Hành",
    tag: "Management Hub",
    image: "/images/KGLV/CĐTT 2 GÓC HÌNH VP2.png",
    desc: "Khu vực điều hành sản xuất và kết nối liên phòng ban, hỗ trợ theo dõi tiến độ đơn hàng SKECHERS thời gian thực.",
  },
  {
    id: "kglv-4",
    title: "Góc nhìn môi trường VPTX",
    subtitle: "Bộ Báo Cáo & Mẫu Tiêu Biểu",
    category: "trung-bay",
    categoryLabel: "Khu Trưng Bày",
    tag: "Key Collections",
    image: "/images/KGLV/3 DÒNG GIÀY CHÍNH.png",
    desc: "Bàn trưng bày 3 dòng sản phẩm cốt lõi: Skechers Performance (thể thao), Lifestyle (thời trang) và Work Series (bảo hộ).",
  },
  {
    id: "kglv-5",
    title: "Khu trưng bày 4 đôi giày kỷ niệm",
    subtitle: "Cột Mốc Sản Xuất Tiêu Biểu",
    category: "trung-bay",
    categoryLabel: "Khu Trưng Bày",
    tag: "Milestone Shoes",
    image: "/images/KGLV/CĐTT 1 GÓC 4 ĐÔI GIÀY.png",
    desc: "Góc lưu giữ 4 mẫu giày đánh dấu những bước tiến đột phá về công nghệ sản xuất và sản lượng chuỗi SKECHERS tại TBS Group.",
  },
  {
    id: "kglv-6",
    title: "Biểu tượng chiếc giày kỷ niệm",
    subtitle: "Biểu Trưng Nghệ Thuật Chế Tác",
    category: "trung-bay",
    categoryLabel: "Khu Trưng Bày",
    tag: "Brand Icon",
    image: "/images/KGLV/CĐTT 2 GÓC HÌNH CHIẾC GIÀY.png",
    desc: "Mô hình biểu tượng chiếc giày khổng lồ thể hiện tinh thần sáng tạo và tay nghề tinh xảo của đội ngũ kỹ sư TBS.",
  },
  {
    id: "kglv-7",
    title: "Góc trưng bày 3 chiếc giày",
    subtitle: "Thiết Kế Mới Nhất",
    category: "trung-bay",
    categoryLabel: "Khu Trưng Bày",
    tag: "Product Showcase",
    image: "/images/KGLV/CĐTT 2 GÓC 3 CHIẾC GIÀY.png",
    desc: "Showcase trưng bày sản phẩm mới nhất được kiểm định khắt khe trước khi xuất khẩu ra các thị trường toàn cầu.",
  },
  {
    id: "kglv-8",
    title: "Chuyên đề truyền thống 1 - Lối vào",
    subtitle: "Hành Lang Lịch Sử",
    category: "truyen-thong",
    categoryLabel: "Khu Truyền Thống",
    tag: "Heritage Walk 1",
    image: "/images/KGLV/CĐTT 1 LỐI VÀO.png",
    desc: "Lối vào không gian truyền thống tái hiện chặng đường hình thành và phát triển của chuỗi cung ứng SKECHERS.",
  },
  {
    id: "kglv-9",
    title: "Chuyên đề truyền thống 2 - Lối vào",
    subtitle: "Hành Lang Thành Tựu",
    category: "truyen-thong",
    categoryLabel: "Khu Truyền Thống",
    tag: "Heritage Walk 2",
    image: "/images/KGLV/CĐTT 2 LỐI VÀO.png",
    desc: "Khu vực giới thiệu văn hóa doanh nghiệp, các giá trị cốt lõi và quan hệ đối tác bền chặt cùng SKECHERS Global.",
  },
  {
    id: "kglv-10",
    title: "Bảng lịch sử & kỷ niệm chương",
    subtitle: "Ghi Nhận Đóng Góp Xuất Sắc",
    category: "truyen-thong",
    categoryLabel: "Khu Truyền Thống",
    tag: "Awards & History",
    image: "/images/KGLV/BẢNG LỊCH SỬ & KỈ NIỆM CHƯƠNG.png",
    desc: "Bảng danh dự lưu danh các giải thưởng uy tín, bằng khen quốc tế và kỷ niệm chương qua từng giai đoạn phát triển.",
  },
  {
    id: "kglv-11",
    title: "Phòng Research & Development (R&D)",
    subtitle: "Trung Tâm Nghiên Cứu Mẫu",
    category: "rd",
    categoryLabel: "Khu Mẫu & R&D",
    tag: "R&D Lab",
    image: "/images/KGLV/PHÒNG R&D.png",
    desc: "Phòng nghiên cứu & phát triển với trang thiết bị hiện đại, phát triển các mẫu giày thử nghiệm và tối ưu quy trình may.",
  },
  {
    id: "kglv-12",
    title: "Lối đi xuống khu vực mẫu",
    subtitle: "Kết Nối Kỹ Thuật & Sản Xuất",
    category: "rd",
    categoryLabel: "Khu Mẫu & R&D",
    tag: "Sample Room Access",
    image: "/images/KGLV/CĐTT 1 LỐI ĐI XUỐNG KV MẪU.png",
    desc: "Hành lang dẫn xuống khu vực may mẫu thử nghiệm, đảm bảo tính liền mạch giữa ý tưởng thiết kế và thực thi sản xuất.",
  },
  {
    id: "kglv-13",
    title: "Quy trình sản xuất giày SKECHERS",
    subtitle: "Sơ Đồ Vận Hành 12 Bước",
    category: "van-hanh",
    categoryLabel: "Vận Hành & Sản Xuất",
    tag: "Process Flow",
    image: "/images/KGLV/CĐTT 2 GÓC QUI TRÌNH GIÀY.png",
    desc: "Trực quan hóa quy trình sản xuất chuẩn hóa từ khâu kiểm định nguyên vật liệu đầu vào đến hoàn thiện xuất hàng.",
  },
  {
    id: "kglv-14",
    title: "Phòng thư viện vật tư & nguyên liệu",
    subtitle: "Kho Lưu Trữ Chuẩn Quốc Tế",
    category: "van-hanh",
    categoryLabel: "Vận Hành & Sản Xuất",
    tag: "Material Library",
    image: "/images/KGLV/PHÒNG THƯ VIỆN VẬT TƯ.png",
    desc: "Thư viện vật tư với hàng ngàn mẫu vải, da, phụ liệu đạt chứng nhận xanh và tiêu chuẩn chất lượng khắt khe của SKECHERS.",
  },
];

import { getLandingCMS, DEFAULT_LANDING_CMS } from "@/lib/landingCMS";

const CORPORATE_PILLAR_ICONS = [
  IconBuildingSkyscraper,
  IconSitemap,
  IconAward,
  IconBulb,
];

const CATEGORIES = [
  { key: "all", label: "Tất Cả (14)", count: 14 },
  { key: "sanh", label: "Sảnh & Điều Hành", count: 3 },
  { key: "trung-bay", label: "Khu Trưng Bày", count: 4 },
  { key: "truyen-thong", label: "Khu Truyền Thống", count: 3 },
  { key: "rd", label: "Khu Mẫu & R&D", count: 2 },
  { key: "van-hanh", label: "Vận Hành & Sản Xuất", count: 2 },
];

export default function WorkspaceGallery() {
  const { t, lang } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [cmsWorkspace, setCmsWorkspace] = useState(DEFAULT_LANDING_CMS.workspace);

  useEffect(() => {
    const loadCMS = () => {
      const config = getLandingCMS();
      if (config?.workspace) {
        setCmsWorkspace(config.workspace);
      }
    };
    loadCMS();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_landing_cms_updated", loadCMS);
      return () => window.removeEventListener("tbs_landing_cms_updated", loadCMS);
    }
  }, []);

  const filteredItems = selectedCategory === "all"
    ? WORKSPACE_ITEMS
    : WORKSPACE_ITEMS.filter((item) => item.category === selectedCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : (prev as number) - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : (prev as number) + 1));
  };

  const pillarsToRender = cmsWorkspace.pillars || DEFAULT_LANDING_CMS.workspace.pillars;

  return (
    <section
      id="workspace"
      className="py-20 lg:py-28 bg-[#fbfcfb] max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-16"
    >
      {/* 2-Column Main Section Header matching reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Side: Headline, Intro text & 4 Corporate Pillars */}
        <div className="lg:col-span-6 space-y-8">
          {/* Main Headline & Intro Paragraph */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#152e25] tracking-tight leading-[1.18]">
              {cmsWorkspace.headline || t("workspace.corporate_environment")}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal max-w-xl">
              {cmsWorkspace.description || t("workspace.each_space_created")}
            </p>
          </div>

          {/* 4 Feature Cards Grid (2x2) matching exact design in screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
            {pillarsToRender.map((pillar, i) => {
              const IconComp = CORPORATE_PILLAR_ICONS[i % CORPORATE_PILLAR_ICONS.length];
              return (
                <div
                  key={i}
                  className="p-6 rounded-[22px] bg-white border border-slate-200/80 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center">
                    <IconComp size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Visual Workspace Cards Grid matching image layout */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Bar with Category Filters & Photo Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.key
                      ? "bg-[#1f3a30] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono font-bold text-[#006838] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/60">
              {filteredItems.length} {t("workspace.photos_count")}
            </div>
          </div>

          {/* 2x2 Image Showcase Grid matching screenshot overlay dark pill layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredItems.slice(0, 4).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative h-[260px] sm:h-[280px] rounded-[24px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-colors" />

                {/* Zoom Icon Top Right */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconZoomIn size={18} />
                </div>

                {/* Dark Pill Overlay Badge at bottom matching exact image reference */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#1f3a30]/90 backdrop-blur-md border border-white/10 rounded-[16px] px-4 py-3 text-white transition-all group-hover:bg-[#152e25]">
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-emerald-300 font-mono block mt-0.5">
                    {item.categoryLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* If there are more than 4 items, render remaining in expandable grid */}
          {filteredItems.length > 4 && (
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                {t("workspace.additional_views")} ({filteredItems.length - 4})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {filteredItems.slice(4).map((item, idx) => {
                  const realIndex = idx + 4;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLightboxIndex(realIndex)}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-slate-200 hover:border-[#006838]"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <IconEye size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Full View */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-fade-in">
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label={t("common.close")}
          >
            <IconX size={24} />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label={t("workspace.prev_image")}
          >
            <IconChevronLeft size={28} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label={t("workspace.next_image")}
          >
            <IconChevronRight size={28} />
          </button>

          {/* Main Lightbox Content Container */}
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Image Viewport */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[65vh] overflow-hidden">
              <img
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                className="max-h-[65vh] w-auto max-w-full object-contain select-none"
              />

              {/* Counter Badge */}
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white">
                {lightboxIndex + 1} / {filteredItems.length}
              </div>
            </div>

            {/* Captions & Info */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#006838] text-white text-xs font-extrabold uppercase tracking-wider">
                  {filteredItems[lightboxIndex].categoryLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs">
                  {filteredItems[lightboxIndex].tag}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {filteredItems[lightboxIndex].title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                {filteredItems[lightboxIndex].desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
