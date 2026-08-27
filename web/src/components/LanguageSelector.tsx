"use client";

import { useState, useEffect, useRef } from "react";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";

export type LanguageCode = "VN" | "ENG";

interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "VN", label: "Tiếng Việt", nativeLabel: "VN (Việt Nam)", flag: "🇻🇳" },
  { code: "ENG", label: "English", nativeLabel: "ENG (English)", flag: "🇬🇧" },
];

interface LanguageSelectorProps {
  variant?: "header-dark" | "header-light" | "auto";
  className?: string;
}

export default function LanguageSelector({
  variant = "auto",
  className = "",
}: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>("VN");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read persisted language on mount
    try {
      const savedLang = localStorage.getItem("tbs_lang") as LanguageCode;
      if (savedLang && (savedLang === "VN" || savedLang === "ENG")) {
        setCurrentLang(savedLang);
      }
    } catch {
      // ignore
    }

    const handleStorage = (e: Event) => {
      const customEvent = e as CustomEvent<LanguageCode>;
      if (customEvent.detail && (customEvent.detail === "VN" || customEvent.detail === "ENG")) {
        setCurrentLang(customEvent.detail);
      }
    };

    window.addEventListener("tbs_lang_changed", handleStorage);
    return () => {
      window.removeEventListener("tbs_lang_changed", handleStorage);
    };
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectLanguage = (code: LanguageCode) => {
    setCurrentLang(code);
    setIsOpen(false);
    try {
      localStorage.setItem("tbs_lang", code);
      window.dispatchEvent(new CustomEvent("tbs_lang_changed", { detail: code }));
    } catch {
      // ignore
    }
  };

  const isDark = variant === "header-dark";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl font-bold text-xs sm:text-xs transition-all duration-200 cursor-pointer select-none shadow-2xs ${
          isDark
            ? "border border-[#2fd39a]/60 bg-[#041a13]/80 hover:bg-[#0f4133] text-white hover:border-[#2fd39a]"
            : "border border-[#006838] bg-white hover:bg-emerald-50/60 text-[#08221a] hover:border-[#004d29]"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Chọn ngôn ngữ / Select Language"
      >
        <span className="tracking-wide">{currentLang}</span>
        <IconChevronDown
          size={13}
          className={`transition-transform duration-200 ${
            isDark ? "text-[#2fd39a]" : "text-[#006838]"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 top-full mt-2 w-44 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 border ${
              isDark
                ? "bg-[#041a13]/98 border-[#2fd39a]/30 text-white backdrop-blur-xl"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 text-slate-400">
              Ngôn ngữ / Language
            </div>
            <div className="space-y-1">
              {LANGUAGES.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => selectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "bg-[#0f4133] text-[#2fd39a]"
                          : "bg-emerald-50 text-[#006838]"
                        : isDark
                        ? "text-gray-200 hover:bg-white/10"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.nativeLabel}</span>
                    </div>
                    {isSelected && (
                      <IconCheck
                        size={14}
                        className={isDark ? "text-[#2fd39a]" : "text-[#006838]"}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
