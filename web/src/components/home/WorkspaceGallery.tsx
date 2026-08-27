"use client";

import React, { useState, useEffect } from "react";
import {
  IconBuilding,
  IconBuildingWarehouse,
  IconBriefcase,
  IconShieldCheck,
  IconDeviceDesktop,
  IconUsers,
  IconFileText,
  IconUsersGroup,
  IconSparkles,
  IconZoomIn,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconCheck,
} from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getLandingCMS,
  DEFAULT_LANDING_CMS,
  WorkspaceDepartment,
  WorkspaceImageItem,
} from "@/lib/landingCMS";

const DEPARTMENT_ICON_MAP: Record<string, any> = {
  building: IconBuilding,
  factory: IconBuildingWarehouse,
  briefcase: IconBriefcase,
  "check-shield": IconShieldCheck,
  monitor: IconDeviceDesktop,
  users: IconUsers,
  "file-text": IconFileText,
  "users-round": IconUsersGroup,
};

export default function WorkspaceGallery() {
  const { t } = useTranslation();
  const [cmsConfig, setCmsConfig] = useState(DEFAULT_LANDING_CMS);
  const [activeDepId, setActiveDepId] = useState<string>("sanh");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadCMS = () => {
      const config = getLandingCMS();
      if (config) {
        setCmsConfig(config);
      }
    };
    loadCMS();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_landing_cms_updated", loadCMS);
      return () => window.removeEventListener("tbs_landing_cms_updated", loadCMS);
    }
  }, []);

  const departments: WorkspaceDepartment[] =
    cmsConfig.workspaceDepartments && cmsConfig.workspaceDepartments.length > 0
      ? cmsConfig.workspaceDepartments
      : DEFAULT_LANDING_CMS.workspaceDepartments || [];

  const activeDepartment =
    departments.find((d) => d.id === activeDepId) || departments[0] || {
      id: "sanh",
      name: "Sảnh",
      icon: "building",
      order: 1,
      images: [],
    };

  const activeImages: WorkspaceImageItem[] = activeDepartment.images || [];

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
  }, [lightboxIndex, activeImages.length]);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === 0 ? activeImages.length - 1 : (prev as number) - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === activeImages.length - 1 ? 0 : (prev as number) + 1));
  };

  return (
    <section
      id="workspace"
      className="py-16 sm:py-20 lg:py-24 bg-[#f8faf9] max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10 sm:space-y-12"
    >
      {/* Main Section Headline & Intro */}
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#152e25] tracking-tight leading-[1.18]">
          {cmsConfig.workspace.headline || "Môi trường làm việc chuẩn Corporate"}
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal max-w-3xl">
          {cmsConfig.workspace.description ||
            "Mỗi không gian được kiến tạo nhằm thúc đẩy hiệu suất, sự kết nối và tinh thần đổi mới. Đây là nơi đội ngũ cùng chia sẻ mục tiêu, nâng cao chất lượng và không ngừng hoàn thiện để mang đến những giá trị vượt kỳ vọng."}
        </p>
      </div>

      {/* 4 Corporate Content Cards Grid (2x2 or 4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Chuẩn mực không gian */}
        <div className="p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-100 flex items-center justify-center">
            <IconBuilding size={22} strokeWidth={2} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Chuẩn mực không gian
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
              Thiết kế hiện đại, tối giản theo tiêu chuẩn corporate, tạo nên môi trường làm việc chuyên nghiệp, đồng bộ và hiệu quả.
            </p>
          </div>
        </div>

        {/* Card 2: Hiệu quả vận hành */}
        <div className="p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-100 flex items-center justify-center">
            <IconBriefcase size={22} strokeWidth={2} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Hiệu quả vận hành
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
              Không gian được quy hoạch khoa học, tối ưu kết nối giữa các phòng ban, hỗ trợ quy trình điều hành nhanh chóng và chính xác.
            </p>
          </div>
        </div>

        {/* Card 3: Bản sắc thương hiệu */}
        <div className="p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-100 flex items-center justify-center">
            <IconSparkles size={22} strokeWidth={2} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Bản sắc thương hiệu
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
              Hệ thống nhận diện được ứng dụng xuyên suốt, phản ánh giá trị thương hiệu TBS và vị thế của doanh nghiệp trong chuỗi cung ứng toàn cầu.
            </p>
          </div>
        </div>

        {/* Card 4: Môi trường truyền cảm hứng */}
        <div className="p-6 rounded-[24px] bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006838] border border-emerald-100 flex items-center justify-center">
            <IconUsers size={22} strokeWidth={2} />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Môi trường truyền cảm hứng
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
              Không gian mở, tiện nghi và thân thiện, khuyến khích sự hợp tác, sáng tạo và phát triển bền vững của đội ngũ.
            </p>
          </div>
        </div>
      </div>

      {/* 2 Featured Visual Showcase Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Card Feature 1: Điểm nhấn thiết kế nội thất */}
        <div className="relative h-[220px] sm:h-[240px] rounded-[26px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-slate-200/90">
          <img
            src="/images/KGLV/CĐTT 2 GÓC HÌNH VP2.png"
            alt="Điểm nhấn thiết kế nội thất"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0b3226]/90 backdrop-blur-md rounded-[18px] border border-white/15 text-white">
            <h4 className="text-sm font-extrabold text-white tracking-wide">
              Điểm nhấn thiết kế nội thất
            </h4>
            <span className="text-[11px] text-emerald-300 font-mono block mt-0.5 font-bold">
              Sảnh & Điều Hành
            </span>
          </div>
        </div>

        {/* Card Feature 2: Góc nhìn môi trường VPTX */}
        <div className="relative h-[220px] sm:h-[240px] rounded-[26px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-slate-200/90">
          <img
            src="/images/KGLV/3 DÒNG GIÀY CHÍNH.png"
            alt="Góc nhìn môi trường VPTX"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0b3226]/90 backdrop-blur-md rounded-[18px] border border-white/15 text-white">
            <h4 className="text-sm font-extrabold text-white tracking-wide">
              Góc nhìn môi trường VPTX
            </h4>
            <span className="text-[11px] text-emerald-300 font-mono block mt-0.5 font-bold">
              Khu Trưng Bày
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Gallery Layout matching reference screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (Sidebar): KHÔNG GIAN THEO PHÒNG BAN */}
        <div className="lg:col-span-3 bg-white rounded-[26px] p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="px-2 pt-1 pb-2 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              KHÔNG GIAN THEO PHÒNG BAN
            </h3>
            <span className="text-[11px] font-mono text-slate-400 font-bold">
              {departments.length}
            </span>
          </div>

          {/* Desktop Vertical Department List */}
          <div className="hidden lg:flex flex-col space-y-1.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {departments.map((dep) => {
              const IconComponent = DEPARTMENT_ICON_MAP[dep.icon] || IconBuilding;
              const isSelected = dep.id === activeDepId;
              const imgCount = dep.images?.length || 0;

              return (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => setActiveDepId(dep.id)}
                  className={`w-full px-3.5 py-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-[#0b3d2e] text-white shadow-md font-extrabold scale-[1.01]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <IconComponent
                      size={18}
                      className={isSelected ? "text-[#2fd39a]" : "text-slate-400 group-hover:text-slate-700"}
                    />
                    <span className="text-xs sm:text-[13px] truncate">{dep.name}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ml-2 flex-shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    {imgCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Horizontal Scrollable Department List */}
          <div className="flex lg:hidden overflow-x-auto gap-2 py-1 scrollbar-none">
            {departments.map((dep) => {
              const IconComponent = DEPARTMENT_ICON_MAP[dep.icon] || IconBuilding;
              const isSelected = dep.id === activeDepId;
              const imgCount = dep.images?.length || 0;

              return (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => setActiveDepId(dep.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0b3d2e] text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <IconComponent size={15} />
                  <span>{dep.name}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                    {imgCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Department Photo Grid */}
        <div className="lg:col-span-9 bg-white rounded-[26px] p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006838]" />
              {activeDepartment.name} ({activeImages.length})
            </h3>

            <span className="px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-500 font-mono font-bold text-xs">
              {activeImages.length} không gian
            </span>
          </div>

          {/* 5-Column Responsive Grid matching reference screenshot */}
          {activeImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {activeImages.map((imgItem, idx) => (
                <div
                  key={imgItem.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative h-[140px] sm:h-[155px] rounded-[20px] overflow-hidden cursor-pointer border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-[#006838] transition-all duration-300 bg-slate-50"
                >
                  <img
                    src={imgItem.src}
                    alt={imgItem.caption || `${activeDepartment.name} ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/KGLV/MẶT TIỀN SẢNH.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <IconZoomIn size={22} className="drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 font-medium text-xs">
              Chưa có hình ảnh nào cho phòng ban này. Vui lòng cập nhật trong trang /admin.
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Full View */}
      {lightboxIndex !== null && activeImages[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-200">
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
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[68vh] overflow-hidden p-4">
              <img
                src={activeImages[lightboxIndex].src}
                alt={activeImages[lightboxIndex].caption || activeDepartment.name}
                className="max-h-[65vh] w-auto max-w-full object-contain select-none"
              />

              {/* Counter Badge */}
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white">
                {lightboxIndex + 1} / {activeImages.length}
              </div>
            </div>

            {/* Captions & Info */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#006838] text-white text-xs font-extrabold uppercase tracking-wider">
                  {activeDepartment.name}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {activeImages[lightboxIndex].caption || `${activeDepartment.name} - Ảnh ${lightboxIndex + 1}`}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
