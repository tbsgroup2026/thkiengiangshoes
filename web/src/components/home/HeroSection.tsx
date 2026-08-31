"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconArrowRight, IconArrowDown } from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getLandingCMS, fetchLandingCMSFromServer, DEFAULT_LANDING_CMS } from "@/lib/landingCMS";
import SafeImage from "@/components/SafeImage";
export default function HeroSection() {
  const { t, lang } = useTranslation();
  const [cmsHero, setCmsHero] = useState(DEFAULT_LANDING_CMS.hero);
  const [shoeLines, setShoeLines] = useState(DEFAULT_LANDING_CMS.shoeLines);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  useEffect(() => {
    const loadCMS = () => {
      const config = getLandingCMS();
      if (config?.hero) {
        setCmsHero(config.hero);
      }
      if (config?.shoeLines) {
        setShoeLines(config.shoeLines);
      }
    };
    loadCMS();

    const fetchServerData = () => {
      fetchLandingCMSFromServer().then((config) => {
        if (config?.hero) {
          setCmsHero(config.hero);
        }
        if (config?.shoeLines) {
          setShoeLines(config.shoeLines);
        }
      });
    };

    fetchServerData();

    // Background server polling every 60s + sync on window focus
    const interval = setInterval(fetchServerData, 60000);
    const handleFocus = () => fetchServerData();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_landing_cms_updated", loadCMS);
      window.addEventListener("focus", handleFocus);
      return () => {
        clearInterval(interval);
        window.removeEventListener("tbs_landing_cms_updated", loadCMS);
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, []);

  const prefixCfg = cmsHero.prefixConfig || {
    text: cmsHero.titlePrefix || "Tổ hợp Kiên Giang",
    fontSize: 36,
    colorMode: "solid",
    color: "#ffffff",
    gradient: { from: "#ffffff", to: "#2fd39a", direction: "to right" },
  };

  const highlightCfg = cmsHero.highlightConfig || {
    text: cmsHero.titleHighlight || "TBS Group",
    fontSize: 54,
    colorMode: "gradient",
    color: "#2fd39a",
    gradient: { from: "#2fd39a", to: "#fbbf24", direction: "to right" },
  };

  const getLineStyle = (cfg: any, fallbackText: string, isPrefix: boolean) => {
    const text = cfg?.text || fallbackText;
    const baseFontSize = cfg?.fontSize || (isPrefix ? 36 : 54);
    const mode = cfg?.colorMode || (isPrefix ? "solid" : "gradient");
    const color = cfg?.color || (isPrefix ? "#ffffff" : "#2fd39a");
    const grad = cfg?.gradient || { from: "#2fd39a", to: "#fbbf24", direction: "to right" };

    const dirMap: Record<string, string> = {
      "to right": "to right",
      "to bottom": "to bottom",
      "to bottom right": "to bottom right",
      "to top right": "to top right",
    };
    const dir = dirMap[grad.direction] || "to right";

    const clampMin = Math.max(18, Math.round(baseFontSize * 0.55));
    const clampMax = baseFontSize;

    if (mode === "gradient") {
      return {
        style: {
          fontSize: `clamp(${clampMin}px, 4.5vw, ${clampMax}px)`,
          backgroundImage: `linear-gradient(${dir}, ${grad.from || "#2fd39a"}, ${grad.to || "#f2dc9a"})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        },
        text,
      };
    }

    return {
      style: {
        fontSize: `clamp(${clampMin}px, 4.5vw, ${clampMax}px)`,
        color,
        backgroundImage: "none",
        WebkitBackgroundClip: "unset",
        WebkitTextFillColor: "unset",
      },
      text,
    };
  };

  const prefixStyled = getLineStyle(prefixCfg, cmsHero.titlePrefix || "Tổ hợp Kiên Giang", true);
  const highlightStyled = getLineStyle(highlightCfg, cmsHero.titleHighlight || "TBS Group", false);

  const groups = shoeLines?.groups || DEFAULT_LANDING_CMS.shoeLines.groups;
  const marqueeGroups = [...groups, ...groups, ...groups];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          MODULE 1 — HERO SECTION (#hero)
          Background: Gate photo with dark green overlay (#08221a)
         ════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative flex items-center bg-[#08221a] overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 min-h-[80vh] lg:min-h-[78vh]"
      >
        {/* Background Image: Gate photo full visibility */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('${cmsHero.bgImage || "/images/tbs-gate.jpg"}')` }}
        >
          {/* Softened Dark Green Gradient Overlay for Clear Background Photo Visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08221a]/75 via-[#08221a]/55 to-[#08221a]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08221a]/70 via-transparent to-[#08221a]/20" />
        </div>

        {/* Ambient Glow Accent */}
        <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#2fd39a]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              


              {/* Main Headline (2 separate block lines) */}
              <div className="space-y-2">
                <h1 className="font-black tracking-tight leading-[1.15]">
                  <span
                    className="block font-black tracking-tight mb-1 sm:mb-2"
                    style={prefixStyled.style}
                  >
                    {prefixStyled.text}
                  </span>
                  <span
                    className="block font-black tracking-tight"
                    style={highlightStyled.style}
                  >
                    {highlightStyled.text}
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 pt-2">
                  {cmsHero.description ||
                    "Không gian điều hành đại diện cho năng lực quản trị, văn hóa doanh nghiệp và tiêu chuẩn vận hành của Tổ hợp Kiên Giang - TBS Group."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/work"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#2fd39a] to-emerald-500 text-[#08221a] font-extrabold text-sm shadow-xl shadow-[#2fd39a]/20 hover:shadow-2xl hover:shadow-[#2fd39a]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 group"
                >
                  <span>{t("hero.access_system")}</span>
                  <IconArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#workspace"
                  className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {t("hero.explore_space")}
                </a>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-white/10 max-w-xl mx-auto lg:mx-0">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-[#f2dc9a]">
                    {cmsHero.stat1Value || "30+"}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
                    {cmsHero.stat1Label || t("hero.years_experience")}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-[#2fd39a]">
                    {cmsHero.stat2Value || "10M+"}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
                    {cmsHero.stat2Label || t("hero.products_year")}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {cmsHero.stat3Value || "5,000+"}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
                    {cmsHero.stat3Label || t("hero.operational_staff")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Block matching 2 overlapping cards */}
            <div className="lg:col-span-5 relative min-h-[440px] h-[440px] z-10 mt-6 lg:mt-0">
              {/* 1. Main Card (Top-Right): Hands Circle Image */}
              <div className="absolute top-0 right-0 w-[80%] h-[68%] rounded-[26px] overflow-hidden border border-[#2fd39a]/35 shadow-2xl z-10 group bg-[#0d2419]">
                <img
                  src={cmsHero.handsImage || "/images/tbs-hands.png"}
                  alt="TBS Group - Hands Commitment"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* 2. Sub Card (Bottom-Left): Team Photo Banner with White Border */}
              <div className="absolute bottom-0 left-0 w-[55%] h-[48%] rounded-[22px] overflow-hidden border-[3px] border-white shadow-2xl z-20 hover:scale-[1.03] transition-transform duration-300 group/card bg-[#0d2419]">
                <SafeImage
                  productId="hero-team-banner"
                  src={cmsHero.teamImage || "/images/tbs-team-banner.png"}
                  alt="Phát Huy Sức Mạnh Kiến Tạo Tương Lai"
                  fallbackTitle="Phát Huy Sức Mạnh Kiến Tạo Tương Lai"
                  objectFit="cover"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>

              {/* 3. Dark Quote Badge: Bottom-Right Quote Box */}
              <div className="absolute bottom-[10%] -right-2 z-30 bg-[#08221a]/90 backdrop-blur-[14px] border border-[#2fd39a]/45 rounded-[20px] p-[16px_20px] max-w-[230px] shadow-2xl">
                <div className="w-[40px] h-[2.5px] bg-gradient-to-r from-[#2fd39a] to-[#1fae7d] rounded-full mb-[10px]" />
                <p className="font-serif italic text-white text-[15px] sm:text-[16px] leading-[1.4]">
                  &ldquo;{cmsHero.quoteBadgeText || "Chung sức kiến tạo tương lai"}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Arrow Button */}
        <a
          href="#brand-strip"
          className="absolute bottom-6 right-8 w-10 h-10 rounded-full bg-[#0d2419] border border-[#2fd39a]/40 text-[#2fd39a] flex items-center justify-center shadow-xl hover:bg-[#2fd39a] hover:text-[#08221a] transition-all duration-300 animate-bounce z-30"
          aria-label={t("common.next")}
        >
          <IconArrowDown size={18} />
        </a>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          MODULE 2 — BRAND-STRIP (#brand-strip)
          Full-width dark green background strip: "DÒNG GIÀY TIÊU BIỂU"
         ════════════════════════════════════════════════════════════════ */}
      <section
        id="brand-strip"
        className="relative z-30 -mt-[74px] py-8 bg-[#0b3226] border-y border-[#2fd39a]/25 shadow-2xl overflow-hidden"
      >
        {/* Side gradient overlays for smooth infinite scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-[120px] sm:w-[160px] bg-gradient-to-r from-[#0b3226] via-[#0b3226]/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[120px] sm:w-[160px] bg-gradient-to-l from-[#0b3226] via-[#0b3226]/90 to-transparent z-10 pointer-events-none" />

        <div className="w-full text-center space-y-4">
          {/* Top Gold Header: ─────── DÒNG GIÀY TIÊU BIỂU ─────── */}
          <div className="flex items-center justify-center gap-4 px-4">
            <div className="h-[1px] w-16 sm:w-28 md:w-36 bg-gradient-to-r from-transparent to-[#f2dc9a]/70" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[4px] text-[#f2dc9a] font-serif">
              {t("hero.brand_partners")}
            </h3>
            <div className="h-[1px] w-16 sm:w-28 md:w-36 bg-gradient-to-l from-transparent to-[#f2dc9a]/70" />
          </div>

          {/* Continuous Marquee Track: Each Group Block Contains 5 Shoe Cards + Title Line Centered Below */}
          <div className="overflow-hidden w-full flex items-center py-2">
            <div className="animate-marquee-left flex items-start gap-8 sm:gap-12">
              {marqueeGroups.map((group, groupIdx) => (
                <div key={`${group.id}-${groupIdx}`} className="flex-shrink-0 flex flex-col items-center space-y-4">
                  {/* 5 Shoe Cards in a row for this group */}
                  <div className="flex items-center gap-4 sm:gap-5">
                    {(group.items || []).slice(0, 5).map((shoe, shoeIdx) => (
                      <div
                        key={`${shoe.id || shoeIdx}-${groupIdx}`}
                        className="flex-shrink-0 flex items-center justify-center w-[160px] sm:w-[190px] h-[90px] sm:h-[105px] rounded-[24px] px-4 py-2 bg-white shadow-xl border border-white/40 hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 select-none cursor-pointer group"
                        title={shoe.name || group.title}
                      >
                        <img
                          src={shoe.url}
                          alt={shoe.name || group.title}
                          className="max-h-[70px] max-w-[155px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/brands/256000.png";
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Group Title Line Centered Below the 5 Shoe Cards */}
                  <div className="flex items-center justify-center gap-4 w-full pt-1">
                    <div className="h-[1px] w-14 sm:w-28 md:w-36 bg-[#f2dc9a]/60" />
                    <h4 className="text-white font-black text-xs sm:text-sm uppercase tracking-[4px] font-sans whitespace-nowrap">
                      {group.title}
                    </h4>
                    <div className="h-[1px] w-14 sm:w-28 md:w-36 bg-[#f2dc9a]/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
