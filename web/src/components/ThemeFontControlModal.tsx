"use client";

import React, { useState, useEffect } from "react";
import {
  IconPalette,
  IconTextSize,
  IconCheck,
  IconRefresh,
  IconX,
  IconAdjustments,
  IconSun,
} from "@tabler/icons-react";

export interface ThemeColorOption {
  id: string;
  name: string;
  primaryColor: string;
  hoverColor: string;
  lightBg: string;
  previewGradient: string;
}

export const THEME_COLOR_OPTIONS: ThemeColorOption[] = [
  {
    id: "EMERALD",
    name: "Xanh TBS Emerald (Mặc định)",
    primaryColor: "#006838",
    hoverColor: "#00522c",
    lightBg: "#e6f4ed",
    previewGradient: "from-[#006838] to-[#004d29]",
  },
  {
    id: "NAVY",
    name: "Xanh Dương Classic Navy",
    primaryColor: "#1e3a8a",
    hoverColor: "#1e40af",
    lightBg: "#eff6ff",
    previewGradient: "from-[#1e3a8a] to-[#1e40af]",
  },
  {
    id: "TEAL",
    name: "Xanh Ngọc Modern Teal",
    primaryColor: "#0d7a5c",
    hoverColor: "#0f9b74",
    lightBg: "#edf7f3",
    previewGradient: "from-[#0d7a5c] to-[#0c1924]",
  },
  {
    id: "AMBER",
    name: "Vàng Đồng Amber Gold",
    primaryColor: "#b8943f",
    hoverColor: "#996d36",
    lightBg: "#f7f0dd",
    previewGradient: "from-[#b8943f] to-[#785918]",
  },
  {
    id: "PURPLE",
    name: "Tím Hoàng Gia Royal Purple",
    primaryColor: "#5b21b6",
    hoverColor: "#4c1d95",
    lightBg: "#f3e8ff",
    previewGradient: "from-[#5b21b6] to-[#3b0764]",
  },
  {
    id: "SLATE",
    name: "Đen Tối Giản Slate Dark",
    primaryColor: "#334155",
    hoverColor: "#1e293b",
    lightBg: "#f1f5f9",
    previewGradient: "from-[#334155] to-[#0f172a]",
  },
];

export interface FontSizeOption {
  id: string;
  name: string;
  sizePx: string;
  percentage: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: "SMALL", name: "Nhỏ", sizePx: "13px", percentage: "92.5%" },
  { id: "NORMAL", name: "Chuẩn (14px)", sizePx: "14px", percentage: "100%" },
  { id: "MEDIUM", name: "Vừa (15px)", sizePx: "15px", percentage: "107.5%" },
  { id: "LARGE", name: "Lớn (16px)", sizePx: "16px", percentage: "115%" },
];

export function applySystemThemeAndFont(colorId: string, fontSizeId: string) {
  if (typeof window === "undefined") return;

  const colorOpt = THEME_COLOR_OPTIONS.find((c) => c.id === colorId) || THEME_COLOR_OPTIONS[0];
  const fontOpt = FONT_SIZE_OPTIONS.find((f) => f.id === fontSizeId) || FONT_SIZE_OPTIONS[1];

  // Set CSS Variables on root HTML document
  const root = document.documentElement;
  root.style.setProperty("--color-primary-theme", colorOpt.primaryColor);
  root.style.setProperty("--color-primary-hover", colorOpt.hoverColor);
  root.style.setProperty("--color-primary-light", colorOpt.lightBg);
  root.style.fontSize = fontOpt.percentage;

  // Persist to LocalStorage
  localStorage.setItem("tbs_theme_color", colorOpt.id);
  localStorage.setItem("tbs_font_size", fontOpt.id);

  // Dispatch custom event for real-time app update
  window.dispatchEvent(new CustomEvent("tbs_theme_changed", { detail: { colorOpt, fontOpt } }));
}

interface ThemeFontControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeFontControlModal({ isOpen, onClose }: ThemeFontControlModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>("EMERALD");
  const [selectedFontSize, setSelectedFontSize] = useState<string>("NORMAL");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("tbs_theme_color") || "EMERALD";
      const savedFont = localStorage.getItem("tbs_font_size") || "NORMAL";
      setSelectedColor(savedColor);
      setSelectedFontSize(savedFont);
      applySystemThemeAndFont(savedColor, savedFont);
    }
  }, []);

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
    applySystemThemeAndFont(colorId, selectedFontSize);
  };

  const handleFontChange = (fontId: string) => {
    setSelectedFontSize(fontId);
    applySystemThemeAndFont(selectedColor, fontId);
  };

  const handleResetDefaults = () => {
    setSelectedColor("EMERALD");
    setSelectedFontSize("NORMAL");
    applySystemThemeAndFont("EMERALD", "NORMAL");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center border border-emerald-100">
              <IconAdjustments size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Cấu Hình Màu Sắc &amp; Chữ Hệ Thống
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tùy chỉnh giao diện theo sở thích &amp; kích thước hiển thị
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Section 1: Màu Sắc Chủ Đạo System Theme Color */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
            <IconPalette size={16} className="text-[#006838]" />
            <span>Màu sắc chủ đạo hệ thống (Theme Color)</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {THEME_COLOR_OPTIONS.map((c) => {
              const isSelected = selectedColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleColorChange(c.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#006838] bg-emerald-50/50 shadow-xs ring-2 ring-[#006838]/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-xs border border-white"
                      style={{ backgroundColor: c.primaryColor }}
                    />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {c.name.split(" ")[0]} {c.name.split(" ")[1]}
                    </span>
                  </div>
                  {isSelected && <IconCheck size={16} className="text-[#006838] flex-shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Kích Thước Chữ System Font Size */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
            <IconTextSize size={16} className="text-[#006838]" />
            <span>Kích thước chữ hệ thống (Font Size)</span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZE_OPTIONS.map((f) => {
              const isSelected = selectedFontSize === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFontChange(f.id)}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? "border-[#006838] bg-[#006838] text-white shadow-xs font-black"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
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

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconRefresh size={14} />
            <span>Đặt về mặc định</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            ĐÃ XÁC NHẬN
          </button>
        </div>
      </div>
    </div>
  );
}
