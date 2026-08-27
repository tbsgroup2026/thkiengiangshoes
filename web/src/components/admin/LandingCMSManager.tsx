"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconUpload,
  IconCheck,
  IconRefresh,
  IconPhoto,
  IconExternalLink,
  IconDeviceLaptop,
  IconBuilding,
  IconAward,
  IconShoe,
  IconEye,
  IconPlus,
  IconTrash,
  IconPalette,
  IconTextSize,
} from "@tabler/icons-react";
import { LandingCMSConfig } from "@/lib/landingCMS";
import { THEME_COLOR_OPTIONS, FONT_SIZE_OPTIONS, applySystemThemeAndFont } from "@/components/ThemeFontControlModal";

interface Props {
  landingCMS: LandingCMSConfig;
  setLandingCMS: React.Dispatch<React.SetStateAction<LandingCMSConfig>>;
  onSave: (e: React.FormEvent) => void;
  onReset: () => void;
  onUploadImage: (
    file: File,
    section: "heroBg" | "heroHands" | "heroTeam" | "excellence" | "product",
    productIndex?: number
  ) => Promise<void>;
  onBulkUploadProductImages?: (files: FileList) => Promise<void>;
  isUploading: boolean;
  initialSubSection?: "hero" | "workspace" | "excellence" | "products";
}

export default function LandingCMSManager({
  landingCMS,
  setLandingCMS,
  onSave,
  onReset,
  onUploadImage,
  onBulkUploadProductImages,
  isUploading,
  initialSubSection,
}: Props) {
  const [activeSubSection, setActiveSubSection] = useState<
    "hero" | "workspace" | "excellence" | "products"
  >(initialSubSection || "hero");
  const [uploadingProdIdx, setUploadingProdIdx] = useState<number | null>(null);

  const [selectedThemeColor, setSelectedThemeColor] = useState<string>("EMERALD");
  const [selectedFontSize, setSelectedFontSize] = useState<string>("NORMAL");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("tbs_theme_color") || "EMERALD";
      const savedFont = localStorage.getItem("tbs_font_size") || "NORMAL";
      setSelectedThemeColor(savedColor);
      setSelectedFontSize(savedFont);
    }
  }, []);

  const handleThemeColorChange = (colorId: string) => {
    setSelectedThemeColor(colorId);
    applySystemThemeAndFont(colorId, selectedFontSize);
  };

  const handleFontSizeChange = (fontId: string) => {
    setSelectedFontSize(fontId);
    applySystemThemeAndFont(selectedThemeColor, fontId);
  };

  useEffect(() => {
    if (initialSubSection) {
      setActiveSubSection(initialSubSection);
    }
  }, [initialSubSection]);

  const { hero, workspace, excellence, products } = landingCMS;

  // Update nested hero field
  const updateHero = (key: keyof typeof hero, value: string) => {
    setLandingCMS((prev) => ({
      ...prev,
      hero: { ...prev.hero, [key]: value },
    }));
  };

  const prefixCfg = hero.prefixConfig || {
    text: hero.titlePrefix || "Tổ hợp Kiên Giang",
    fontSize: 36,
    colorMode: "solid",
    color: "#ffffff",
    gradient: { from: "#ffffff", to: "#2fd39a", direction: "to right" },
  };

  const highlightCfg = hero.highlightConfig || {
    text: hero.titleHighlight || "TBS Group",
    fontSize: 54,
    colorMode: "gradient",
    color: "#2fd39a",
    gradient: { from: "#2fd39a", to: "#fbbf24", direction: "to right" },
  };

  const updatePrefixField = (field: string, val: any) => {
    const updated = { ...prefixCfg, [field]: val };
    setLandingCMS((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        titlePrefix: field === "text" ? val : prev.hero.titlePrefix,
        prefixConfig: updated,
      },
    }));
  };

  const updatePrefixGradient = (gradField: string, val: any) => {
    const updatedGrad = { ...(prefixCfg.gradient || { from: "#ffffff", to: "#2fd39a", direction: "to right" }), [gradField]: val };
    const updated = { ...prefixCfg, gradient: updatedGrad };
    setLandingCMS((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        prefixConfig: updated,
      },
    }));
  };

  const updateHighlightField = (field: string, val: any) => {
    const updated = { ...highlightCfg, [field]: val };
    setLandingCMS((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        titleHighlight: field === "text" ? val : prev.hero.titleHighlight,
        highlightConfig: updated,
      },
    }));
  };

  const updateHighlightGradient = (gradField: string, val: any) => {
    const updatedGrad = { ...(highlightCfg.gradient || { from: "#2fd39a", to: "#f2dc9a", direction: "to right" }), [gradField]: val };
    const updated = { ...highlightCfg, gradient: updatedGrad };
    setLandingCMS((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        highlightConfig: updated,
      },
    }));
  };

  // Update nested workspace field
  const updateWorkspace = (key: "headline" | "description", value: string) => {
    setLandingCMS((prev) => ({
      ...prev,
      workspace: { ...prev.workspace, [key]: value },
    }));
  };

  // Update workspace pillar
  const updatePillar = (index: number, key: "title" | "desc", value: string) => {
    setLandingCMS((prev) => {
      const newPillars = [...prev.workspace.pillars];
      newPillars[index] = { ...newPillars[index], [key]: value };
      return {
        ...prev,
        workspace: { ...prev.workspace, pillars: newPillars },
      };
    });
  };

  // Update excellence field
  const updateExcellence = (key: "title" | "description" | "image", value: string) => {
    setLandingCMS((prev) => ({
      ...prev,
      excellence: { ...prev.excellence, [key]: value },
    }));
  };

  // Update excellence point
  const updateExcellencePoint = (index: number, key: "title" | "desc", value: string) => {
    setLandingCMS((prev) => {
      const newPoints = [...prev.excellence.points];
      newPoints[index] = { ...newPoints[index], [key]: value };
      return {
        ...prev,
        excellence: { ...prev.excellence, points: newPoints },
      };
    });
  };

  // Update products field
  const updateProductsMeta = (key: "title" | "description", value: string) => {
    setLandingCMS((prev) => ({
      ...prev,
      products: { ...prev.products, [key]: value },
    }));
  };

  // Update single product item
  const updateProductItem = (index: number, key: "name" | "code" | "image", value: string) => {
    setLandingCMS((prev) => {
      const newItems = [...prev.products.items];
      newItems[index] = { ...newItems[index], [key]: value };
      return {
        ...prev,
        products: { ...prev.products, items: newItems },
      };
    });
  };

  // Upload image for specific product
  const handleProductUpload = async (file: File, index: number) => {
    try {
      setUploadingProdIdx(index);
      await onUploadImage(file, "product", index);
    } finally {
      setUploadingProdIdx(null);
    }
  };

  // Add product item
  const handleAddProduct = () => {
    setLandingCMS((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        items: [
          ...prev.products.items,
          {
            name: "Sản phẩm mới SKECHERS",
            code: `SK-NEW-0${prev.products.items.length + 1}`,
            image: "/images/crawled/Da-giay1.jpg",
          },
        ],
      },
    }));
  };

  // Remove product item
  const handleRemoveProduct = (index: number) => {
    setLandingCMS((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        items: prev.products.items.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <form onSubmit={onSave} className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006838] font-bold text-[11px] uppercase tracking-wider">
              CMS VẬN HÀNH TRANG CHỦ
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-time Live Sync</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            🏠 Quản Trị Nội Dung &amp; Hình Ảnh Landing Page
          </h2>
          <p className="text-xs text-slate-600">
            Tùy biến trực quan toàn bộ câu chữ, thông điệp truyền thông và upload hình ảnh trực tiếp lên Cloudinary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <IconExternalLink size={16} />
            <span>Xem Trang Chủ (Tab mới)</span>
          </Link>

          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 border border-rose-200/80 cursor-pointer"
          >
            <IconRefresh size={16} />
            <span>Khôi Phục Gốc</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-black text-xs transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <IconCheck size={16} />
            <span>LƯU CẤU HÌNH TRANG CHỦ</span>
          </button>
        </div>
      </div>

      {/* Sub-Section Navigation Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/90 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubSection("hero")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "hero"
              ? "bg-[#006838] text-white shadow-xs"
              : "text-slate-600 hover:text-[#006838] hover:bg-white"
          }`}
        >
          <IconDeviceLaptop size={16} />
          <span>1. Hero Banner &amp; Thông Điệp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("workspace")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "workspace"
              ? "bg-[#006838] text-white shadow-xs"
              : "text-slate-600 hover:text-[#006838] hover:bg-white"
          }`}
        >
          <IconBuilding size={16} />
          <span>2. Môi Trường Làm Việc (Workspace)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("excellence")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "excellence"
              ? "bg-[#006838] text-white shadow-xs"
              : "text-slate-600 hover:text-[#006838] hover:bg-white"
          }`}
        >
          <IconAward size={16} />
          <span>3. Dấu Ấn Thương Hiệu &amp; Đẳng Cấp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("products")}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubSection === "products"
              ? "bg-[#006838] text-white shadow-xs"
              : "text-slate-600 hover:text-[#006838] hover:bg-white"
          }`}
        >
          <IconShoe size={16} />
          <span>4. Dòng Sản Phẩm Tiêu Biểu ({products.items.length})</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          1. HERO SECTION CMS
         ════════════════════════════════════════════════════════════════ */}
      {activeSubSection === "hero" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* System Theme Color & Font Size Control Card matching screenshot */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#08221a] text-white border border-slate-700 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3.5 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-emerald-400">
                  <IconPalette size={18} />
                  <span>Cấu Hình Màu Sắc Nền Tảng &amp; Kích Thước Chữ (Theme &amp; Font Size)</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Tùy chỉnh tông màu chủ đạo hệ thống và tỷ lệ kích thước chữ hiển thị toàn bộ nền tảng real-time
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                Real-time Sync
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Color Picker */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <IconPalette size={15} className="text-emerald-400" />
                  <span>Màu sắc chủ đạo hệ thống (Theme Color):</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_COLOR_OPTIONS.map((c) => {
                    const isSelected = selectedThemeColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleThemeColorChange(c.id)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "border-emerald-400 bg-white/15 ring-2 ring-emerald-400/40"
                            : "border-slate-700 bg-slate-800/60 hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 border border-white/40 shadow-2xs"
                          style={{ backgroundColor: c.primaryColor }}
                        />
                        <span className="text-[11px] font-bold text-slate-200 truncate">
                          {c.name.split(" ")[0]} {c.name.split(" ")[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <IconTextSize size={15} className="text-emerald-400" />
                  <span>Kích thước chữ hệ thống (Font Size):</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {FONT_SIZE_OPTIONS.map((f) => {
                    const isSelected = selectedFontSize === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFontSizeChange(f.id)}
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-600 text-white font-black"
                            : "border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold"
                        }`}
                      >
                        <span className="text-xs">{f.name}</span>
                        <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                          {f.percentage}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              TIÊU ĐỀ & SLOGAN ĐẦU TRANG (HERO BANNER) — INDEPENDENT DUAL CARD
             ════════════════════════════════════════════════════════════════ */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#006838]" />
                  Tuỳ Chỉnh Kích Thước &amp; Màu Sắc Tiêu Đề Hero Banner (2 Dòng Độc Lập)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Cấu hình nội dung, kích thước chữ (font-size px) và kiểu màu (Đơn sắc / Gradient) riêng biệt cho từng dòng tiêu đề
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-black uppercase">
                Layout 2 Khối Độc Lập
              </span>
            </div>

            {/* KHỐI 1: TIỀN TỐ TIÊU ĐỀ (DÒNG TRÊN) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#006838] text-white flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                    Tiền tố tiêu đề (Dòng trên - Header Prefix)
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Khối hiển thị hàng thứ nhất (dòng trên)
                </span>
              </div>

              {/* Text input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nội dung văn bản (Text):</label>
                <input
                  type="text"
                  value={prefixCfg.text}
                  onChange={(e) => updatePrefixField("text", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:border-[#006838] outline-none"
                  placeholder="Tổ hợp Kiên Giang"
                />
              </div>

              {/* Font Size & Presets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Kích thước chữ (Font Size):</label>
                    <span className="text-xs font-mono font-black text-[#006838]">{prefixCfg.fontSize || 36}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={18}
                      max={96}
                      value={prefixCfg.fontSize || 36}
                      onChange={(e) => updatePrefixField("fontSize", parseInt(e.target.value))}
                      className="flex-1 accent-[#006838] cursor-pointer"
                    />
                    <input
                      type="number"
                      min={18}
                      max={96}
                      value={prefixCfg.fontSize || 36}
                      onChange={(e) => updatePrefixField("fontSize", parseInt(e.target.value) || 36)}
                      className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-center outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Quick Presets:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[24, 32, 36, 44, 52].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updatePrefixField("fontSize", size)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          prefixCfg.fontSize === size
                            ? "bg-[#006838] text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Mode & Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1 border-t border-slate-200/80">
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Kiểu màu sắc (Color Mode):</label>
                  <div className="flex p-1 rounded-xl bg-slate-200/80 border border-slate-300">
                    <button
                      type="button"
                      onClick={() => updatePrefixField("colorMode", "solid")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        prefixCfg.colorMode === "solid"
                          ? "bg-white text-[#006838] shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🎨 Đơn Sắc (Solid)
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePrefixField("colorMode", "gradient")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        prefixCfg.colorMode === "gradient"
                          ? "bg-white text-[#006838] shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🌈 Gradient
                    </button>
                  </div>
                </div>

                <div className="md:col-span-8">
                  {prefixCfg.colorMode === "solid" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Chọn màu đơn sắc (Color):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={prefixCfg.color || "#ffffff"}
                          onChange={(e) => updatePrefixField("color", e.target.value)}
                          className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={prefixCfg.color || "#ffffff"}
                          onChange={(e) => updatePrefixField("color", e.target.value)}
                          className="w-32 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none"
                          placeholder="#ffffff"
                        />
                        <div className="flex gap-1">
                          {["#ffffff", "#2fd39a", "#f2dc9a", "#38bdf8", "#f43f5e"].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updatePrefixField("color", c)}
                              className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs cursor-pointer"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Màu bắt đầu (From):</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={prefixCfg.gradient?.from || "#ffffff"}
                            onChange={(e) => updatePrefixGradient("from", e.target.value)}
                            className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={prefixCfg.gradient?.from || "#ffffff"}
                            onChange={(e) => updatePrefixGradient("from", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Màu kết thúc (To):</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={prefixCfg.gradient?.to || "#2fd39a"}
                            onChange={(e) => updatePrefixGradient("to", e.target.value)}
                            className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={prefixCfg.gradient?.to || "#2fd39a"}
                            onChange={(e) => updatePrefixGradient("to", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Hướng (Direction):</label>
                        <select
                          value={prefixCfg.gradient?.direction || "to right"}
                          onChange={(e) => updatePrefixGradient("direction", e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="to right">➡️ Ngang (to right)</option>
                          <option value="to bottom">⬇️ Dọc (to bottom)</option>
                          <option value="to bottom right">↘️ Chéo (to bottom right)</option>
                          <option value="to top right">↗️ Chéo ngược (to top right)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Mini Preview Box for Line 1 */}
              <div className="p-3.5 rounded-xl bg-[#08221a] border border-emerald-900/60 text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  LIVE PREVIEW — DÒNG 1 (TIỀN TỐ TIÊU ĐỀ)
                </span>
                <div
                  className="font-black tracking-tight"
                  style={{
                    fontSize: `${Math.min(prefixCfg.fontSize || 36, 42)}px`,
                    color: prefixCfg.colorMode === "solid" ? prefixCfg.color || "#ffffff" : "transparent",
                    backgroundImage:
                      prefixCfg.colorMode === "gradient"
                        ? `linear-gradient(${prefixCfg.gradient?.direction || "to right"}, ${prefixCfg.gradient?.from || "#ffffff"}, ${prefixCfg.gradient?.to || "#2fd39a"})`
                        : "none",
                    WebkitBackgroundClip: prefixCfg.colorMode === "gradient" ? "text" : "unset",
                    WebkitTextFillColor: prefixCfg.colorMode === "gradient" ? "transparent" : "unset",
                  }}
                >
                  {prefixCfg.text || "Tổ hợp Kiên Giang"}
                </div>
              </div>
            </div>

            {/* KHỐI 2: TÊN NỔI BẬT GRADIENT (DÒNG DƯỚI) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                    Tên nổi bật Gradient (Dòng dưới - Header Highlight)
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">
                  Khối hiển thị hàng thứ hai (dòng dưới)
                </span>
              </div>

              {/* Text input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nội dung văn bản (Text):</label>
                <input
                  type="text"
                  value={highlightCfg.text}
                  onChange={(e) => updateHighlightField("text", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#006838] text-xs font-bold focus:border-[#006838] outline-none"
                  placeholder="TBS Group"
                />
              </div>

              {/* Font Size & Presets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Kích thước chữ (Font Size):</label>
                    <span className="text-xs font-mono font-black text-[#006838]">{highlightCfg.fontSize || 54}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={20}
                      max={110}
                      value={highlightCfg.fontSize || 54}
                      onChange={(e) => updateHighlightField("fontSize", parseInt(e.target.value))}
                      className="flex-1 accent-[#006838] cursor-pointer"
                    />
                    <input
                      type="number"
                      min={20}
                      max={110}
                      value={highlightCfg.fontSize || 54}
                      onChange={(e) => updateHighlightField("fontSize", parseInt(e.target.value) || 54)}
                      className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-center outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Quick Presets:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[36, 48, 54, 64, 76].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateHighlightField("fontSize", size)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          highlightCfg.fontSize === size
                            ? "bg-[#006838] text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Mode & Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1 border-t border-slate-200/80">
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Kiểu màu sắc (Color Mode):</label>
                  <div className="flex p-1 rounded-xl bg-slate-200/80 border border-slate-300">
                    <button
                      type="button"
                      onClick={() => updateHighlightField("colorMode", "solid")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        highlightCfg.colorMode === "solid"
                          ? "bg-white text-[#006838] shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🎨 Đơn Sắc (Solid)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHighlightField("colorMode", "gradient")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        highlightCfg.colorMode === "gradient"
                          ? "bg-white text-[#006838] shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🌈 Gradient
                    </button>
                  </div>
                </div>

                <div className="md:col-span-8">
                  {highlightCfg.colorMode === "solid" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Chọn màu đơn sắc (Color):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={highlightCfg.color || "#2fd39a"}
                          onChange={(e) => updateHighlightField("color", e.target.value)}
                          className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={highlightCfg.color || "#2fd39a"}
                          onChange={(e) => updateHighlightField("color", e.target.value)}
                          className="w-32 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none"
                          placeholder="#2fd39a"
                        />
                        <div className="flex gap-1">
                          {["#2fd39a", "#f2dc9a", "#ffffff", "#38bdf8", "#fbbf24"].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateHighlightField("color", c)}
                              className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs cursor-pointer"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Màu bắt đầu (From):</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={highlightCfg.gradient?.from || "#2fd39a"}
                            onChange={(e) => updateHighlightGradient("from", e.target.value)}
                            className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={highlightCfg.gradient?.from || "#2fd39a"}
                            onChange={(e) => updateHighlightGradient("from", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Màu kết thúc (To):</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={highlightCfg.gradient?.to || "#f2dc9a"}
                            onChange={(e) => updateHighlightGradient("to", e.target.value)}
                            className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={highlightCfg.gradient?.to || "#f2dc9a"}
                            onChange={(e) => updateHighlightGradient("to", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Hướng (Direction):</label>
                        <select
                          value={highlightCfg.gradient?.direction || "to right"}
                          onChange={(e) => updateHighlightGradient("direction", e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="to right">➡️ Ngang (to right)</option>
                          <option value="to bottom">⬇️ Dọc (to bottom)</option>
                          <option value="to bottom right">↘️ Chéo (to bottom right)</option>
                          <option value="to top right">↗️ Chéo ngược (to top right)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Mini Preview Box for Line 2 */}
              <div className="p-3.5 rounded-xl bg-[#08221a] border border-emerald-900/60 text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  LIVE PREVIEW — DÒNG 2 (TÊN NỔI BẬT)
                </span>
                <div
                  className="font-black tracking-tight"
                  style={{
                    fontSize: `${Math.min(highlightCfg.fontSize || 54, 52)}px`,
                    color: highlightCfg.colorMode === "solid" ? highlightCfg.color || "#2fd39a" : "transparent",
                    backgroundImage:
                      highlightCfg.colorMode === "gradient"
                        ? `linear-gradient(${highlightCfg.gradient?.direction || "to right"}, ${highlightCfg.gradient?.from || "#2fd39a"}, ${highlightCfg.gradient?.to || "#f2dc9a"})`
                        : "none",
                    WebkitBackgroundClip: highlightCfg.colorMode === "gradient" ? "text" : "unset",
                    WebkitTextFillColor: highlightCfg.colorMode === "gradient" ? "transparent" : "unset",
                  }}
                >
                  {highlightCfg.text || "TBS Group"}
                </div>
              </div>
            </div>

            {/* Slogan & Description Additional Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Trích dẫn tiếng Anh (Chữ nghiêng)
                </label>
                <input
                  type="text"
                  value={hero.quoteItalic}
                  onChange={(e) => updateHero("quoteItalic", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-serif italic focus:border-[#006838] focus:bg-white outline-none"
                  placeholder="“Excellence in Manufacturing. Excellence in Leadership.”"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Chữ trong Hộp Trích Dẫn góc phải (Quote Badge)
                </label>
                <input
                  type="text"
                  value={hero.quoteBadgeText}
                  onChange={(e) => updateHero("quoteBadgeText", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-[#006838] focus:bg-white outline-none"
                  placeholder="Chung sức kiến tạo tương lai"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Đoạn văn mô tả giới thiệu vị thế
              </label>
              <textarea
                rows={3}
                value={hero.description}
                onChange={(e) => updateHero("description", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:border-[#006838] focus:bg-white outline-none leading-relaxed"
                placeholder="Không gian điều hành đại diện cho năng lực quản trị..."
              />
            </div>
          </div>
  );

          {/* 3 Images of Hero Section with Cloudinary Direct Upload */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <IconPhoto size={18} className="text-[#006838]" />
                3 Hình Ảnh Chính Hero Banner (Tải Trực Tiếp Lên Cloudinary)
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Preset: vpchuoisk</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Image 1: Hero Gate Background */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">1. Ảnh Nền Cổng Lớn</span>
                  <span className="text-[10px] bg-emerald-100 text-[#006838] px-2 py-0.5 rounded-full font-bold">
                    Background
                  </span>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                  <img
                    src={hero.bgImage || "/images/tbs-gate.jpg"}
                    alt="Hero BG"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={hero.bgImage}
                    onChange={(e) => updateHero("bgImage", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 outline-none"
                    placeholder="URL ảnh nền..."
                  />
                  <label className="w-full py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                    <IconUpload size={14} />
                    <span>{isUploading ? "Đang tải..." : "Tải ảnh Cổng lên"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          onUploadImage(e.target.files[0], "heroBg");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Image 2: Hands Visual (Top-Right) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">2. Ảnh Vòng Tay Gắn Kết</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    Top-Right Card
                  </span>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                  <img
                    src={hero.handsImage || "/images/tbs-hands.png"}
                    alt="Hands Visual"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={hero.handsImage}
                    onChange={(e) => updateHero("handsImage", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 outline-none"
                    placeholder="URL ảnh vòng tay..."
                  />
                  <label className="w-full py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                    <IconUpload size={14} />
                    <span>{isUploading ? "Đang tải..." : "Tải ảnh Vòng tay lên"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          onUploadImage(e.target.files[0], "heroHands");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Image 3: Team Banner Visual (Bottom-Left) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">3. Ảnh Đội Ngũ Nhân Sự</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                    Bottom-Left Card
                  </span>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                  <img
                    src={hero.teamImage || "/images/tbs-team-banner.png"}
                    alt="Team Visual"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={hero.teamImage}
                    onChange={(e) => updateHero("teamImage", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 outline-none"
                    placeholder="URL ảnh đội ngũ..."
                  />
                  <label className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                    <IconUpload size={14} />
                    <span>{isUploading ? "Đang tải..." : "Tải ảnh Đội ngũ lên"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          onUploadImage(e.target.files[0], "heroTeam");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Stats Numbers & Labels */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006838]" />
              3 Cụm Thống Kê Nổi Bật (Stats Row)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stat 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Thống kê 1</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={hero.stat1Value}
                    onChange={(e) => updateHero("stat1Value", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black font-mono text-slate-900"
                    placeholder="30+"
                  />
                  <input
                    type="text"
                    value={hero.stat1Label}
                    onChange={(e) => updateHero("stat1Label", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
                    placeholder="Năm Kinh Nghiệm"
                  />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Thống kê 2</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={hero.stat2Value}
                    onChange={(e) => updateHero("stat2Value", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black font-mono text-[#006838]"
                    placeholder="10M+"
                  />
                  <input
                    type="text"
                    value={hero.stat2Label}
                    onChange={(e) => updateHero("stat2Label", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
                    placeholder="Sản Phẩm / Năm"
                  />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Thống kê 3</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={hero.stat3Value}
                    onChange={(e) => updateHero("stat3Value", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black font-mono text-amber-700"
                    placeholder="5,000+"
                  />
                  <input
                    type="text"
                    value={hero.stat3Label}
                    onChange={(e) => updateHero("stat3Label", e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
                    placeholder="Nhân Sự Vận Hành"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          2. WORKSPACE SECTION CMS
         ════════════════════════════════════════════════════════════════ */}
      {activeSubSection === "workspace" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006838]" />
              Tiêu Đề &amp; Giới Thiệu Môi Trường Làm Việc
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Tiêu đề chính khu vực</label>
              <input
                type="text"
                value={workspace.headline}
                onChange={(e) => updateWorkspace("headline", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-[#006838] focus:bg-white outline-none"
                placeholder="Môi trường làm việc chuẩn Corporate"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Đoạn văn mô tả chi tiết</label>
              <textarea
                rows={3}
                value={workspace.description}
                onChange={(e) => updateWorkspace("description", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:border-[#006838] focus:bg-white outline-none leading-relaxed"
                placeholder="Mỗi không gian được kiến tạo nhằm thúc đẩy hiệu suất..."
              />
            </div>
          </div>

          {/* 4 Corporate Pillars */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006838]" />
              4 Trụ Cột Doanh Nghiệp (Corporate Pillars)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspace.pillars.map((pillar, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#006838] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Trụ cột #{idx + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => updatePillar(idx, "title", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838]"
                    placeholder="Tiêu đề trụ cột..."
                  />
                  <textarea
                    rows={2}
                    value={pillar.desc}
                    onChange={(e) => updatePillar(idx, "desc", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 outline-none focus:border-[#006838]"
                    placeholder="Nội dung trụ cột..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          3. BRAND EXCELLENCE SECTION CMS
         ════════════════════════════════════════════════════════════════ */}
      {activeSubSection === "excellence" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006838]" />
              Dấu Ấn Thương Hiệu &amp; Đẳng Cấp Chuỗi Cung Ứng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Tiêu đề chính</label>
                <input
                  type="text"
                  value={excellence.title}
                  onChange={(e) => updateExcellence("title", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-[#006838] focus:bg-white outline-none"
                  placeholder="Dấu Ấn Thương Hiệu & Đẳng Cấp Chuỗi Cung Ứng"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Đoạn văn mô tả</label>
                <textarea
                  rows={2}
                  value={excellence.description}
                  onChange={(e) => updateExcellence("description", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:border-[#006838] focus:bg-white outline-none"
                  placeholder="Tổ hợp Kiên Giang - TBS Group tuân thủ nghiêm ngặt..."
                />
              </div>
            </div>

            {/* Showcase Image Upload */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                <img
                  src={excellence.image || "/images/tbs-factory-plant.png"}
                  alt="Excellence Showcase"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <label className="text-xs font-bold text-slate-800 block">
                  Ảnh Minh Họa Nhà Máy &amp; Dấu Ấn (Tải Lên Cloudinary)
                </label>
                <input
                  type="text"
                  value={excellence.image}
                  onChange={(e) => updateExcellence("image", e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 outline-none"
                  placeholder="URL ảnh nhà máy..."
                />
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs">
                  <IconUpload size={14} />
                  <span>{isUploading ? "Đang tải ảnh..." : "Chọn Tệp Nạp Lên Cloudinary"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onUploadImage(e.target.files[0], "excellence");
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 3 Points of Excellence */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006838]" />
              3 Điểm Nhấn Công Nghệ &amp; Số Hóa (Checkpoints)
            </h3>

            <div className="space-y-3">
              {excellence.points.map((point, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#006838] flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-800">Điểm nhấn #{idx + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={point.title}
                    onChange={(e) => updateExcellencePoint(idx, "title", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838]"
                    placeholder="Tiêu đề điểm nhấn..."
                  />
                  <input
                    type="text"
                    value={point.desc}
                    onChange={(e) => updateExcellencePoint(idx, "desc", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 outline-none focus:border-[#006838]"
                    placeholder="Mô tả chi tiết..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          4. PRODUCTS SHOWCASE CMS
         ════════════════════════════════════════════════════════════════ */}
      {activeSubSection === "products" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006838]" />
              Tiêu Đề &amp; Giới Thiệu Dòng Sản Phẩm Tiêu Biểu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Tiêu đề khu vực</label>
                <input
                  type="text"
                  value={products.title}
                  onChange={(e) => updateProductsMeta("title", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-[#006838] focus:bg-white outline-none"
                  placeholder="Dòng Sản Phẩm Tiêu Biểu SKECHERS"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Mô tả tiêu chuẩn</label>
                <input
                  type="text"
                  value={products.description}
                  onChange={(e) => updateProductsMeta("description", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:border-[#006838] focus:bg-white outline-none"
                  placeholder="Các mẫu sản phẩm thuộc chuỗi cung ứng SKECHERS..."
                />
              </div>
            </div>
          </div>

          {/* Product Items List Grid */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <IconShoe size={18} className="text-[#006838]" />
                  Danh Sách Dòng Sản Phẩm ({products.items.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Tải ảnh sản phẩm trực tiếp lên Cloudinary hoặc dán link ảnh sản phẩm Skechers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onBulkUploadProductImages && (
                  <label className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-blue-200 cursor-pointer shadow-xs">
                    <IconUpload size={14} />
                    <span>{isUploading ? "Đang xử lý..." : "Import Hàng Loạt Ảnh"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          onBulkUploadProductImages(e.target.files);
                        }
                      }}
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006838] text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200 cursor-pointer shadow-xs"
                >
                  <IconPlus size={14} />
                  <span>Thêm Dòng Sản Phẩm</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.items.map((prod, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-[#006838]/40 hover:shadow-md transition-all space-y-3 relative group"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#006838] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Mẫu #{idx + 1}
                    </span>
                    {products.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-rose-50"
                        title="Xóa mẫu này"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>

                  {/* Product Image Preview */}
                  <div className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center group/img">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name || `Sản phẩm #${idx + 1}`}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400 space-y-1">
                        <IconPhoto size={28} className="mx-auto text-slate-400" />
                        <span className="text-[10px] block font-medium">Chưa có ảnh</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <label className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white cursor-pointer shadow-sm text-[10px] font-bold flex items-center gap-1">
                        <IconUpload size={12} />
                        <span>Đổi ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleProductUpload(e.target.files[0], idx);
                            }
                          }}
                        />
                      </label>
                      {prod.image && (
                        <button
                          type="button"
                          onClick={() => updateProductItem(idx, "image", "")}
                          className="p-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 cursor-pointer shadow-sm text-[10px] font-bold"
                          title="Xóa ảnh này"
                        >
                          <IconTrash size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Direct Cloudinary Upload Button */}
                  <label className="w-full py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95">
                    <IconUpload size={13} />
                    <span>{uploadingProdIdx === idx ? "Đang tải ảnh..." : "Tải ảnh sản phẩm lên"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleProductUpload(e.target.files[0], idx);
                        }
                      }}
                    />
                  </label>

                  {/* Image URL Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Link ảnh (Cloudinary / URL)</label>
                    <input
                      type="text"
                      value={prod.image || ""}
                      onChange={(e) => updateProductItem(idx, "image", e.target.value)}
                      placeholder="https://... hoặc /images/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 outline-none focus:border-[#006838]"
                    />
                  </div>

                  {/* Product Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Tên Dòng Giày</label>
                    <input
                      type="text"
                      value={prod.name}
                      onChange={(e) => updateProductItem(idx, "name", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#006838]"
                    />
                  </div>

                  {/* SKU Code */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Mã SKU / Code</label>
                    <input
                      type="text"
                      value={prod.code}
                      onChange={(e) => updateProductItem(idx, "code", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 outline-none focus:border-[#006838]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-md flex items-center justify-between gap-4">
        <div className="text-xs text-slate-600 font-medium">
          Mọi thay đổi sẽ được lưu và cập nhật ngay lập tức lên trang chủ <strong className="text-[#006838]">https://vpchuoiskechers.tbsgroup2026.workers.dev/</strong>
        </div>

        <button
          type="submit"
          className="px-8 py-3 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-black text-xs transition-all shadow-lg shadow-emerald-700/20 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <IconCheck size={18} />
          <span>LƯU CẤU HÌNH TRANG CHỦ</span>
        </button>
      </div>
    </form>
  );
}
