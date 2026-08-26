"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconArrowRight, IconArrowDown } from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getLandingCMS, DEFAULT_LANDING_CMS } from "@/lib/landingCMS";

const BRAND_PARTNERS = [
  { name: "Decathlon", logo: "/images/brands/decathlon.svg" },
  { name: "Wolverine", logo: "/images/brands/wolverine.svg" },
  { name: "ECCO", logo: "/images/brands/ecco.svg" },
  { name: "Cole Haan", logo: "/images/brands/cole-haan.svg" },
  { name: "Rockport", logo: "/images/brands/rockport.svg" },
  { name: "Skechers", logo: "/images/brands/skechers.svg" },
  { name: "Coach", logo: "/images/brands/coach.svg" },
  { name: "Osprey", logo: "/images/brands/osprey.svg" },
  { name: "Kate Spade", logo: "/images/brands/kate-spade.svg" },
  { name: "Vera Bradley", logo: "/images/brands/vera-bradley.svg" },
];

export default function HeroSection() {
  const { t, lang } = useTranslation();
  const [cmsHero, setCmsHero] = useState(DEFAULT_LANDING_CMS.hero);

  useEffect(() => {
    const loadCMS = () => {
      const config = getLandingCMS();
      if (config?.hero) {
        setCmsHero(config.hero);
      }
    };
    loadCMS();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_landing_cms_updated", loadCMS);
      return () => window.removeEventListener("tbs_landing_cms_updated", loadCMS);
    }
  }, []);

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
        />
        {/* Lớp phủ đen có độ trong suốt 40%, gradient black từ trái sang phải */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10 pointer-events-none" />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Copy & CTAs & Stats */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
                {cmsHero.titlePrefix || t("hero.chain_office")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2fd39a] via-[#52e8b2] to-[#f2dc9a]">
                  {cmsHero.titleHighlight || t("hero.skechers_tbs")}
                </span>
              </h1>

              {/* Italic Quote */}
              <p className="text-sm sm:text-base font-serif italic text-[#f2dc9a]/90 tracking-wide">
                &ldquo;{cmsHero.quoteItalic || t("hero.excellence_manufacturing")}&rdquo;
              </p>

              {/* Paragraph Description */}
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-[62ch]">
                {cmsHero.description || t("hero.operating_space")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2fd39a] to-[#f2dc9a] text-[#08221a] font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                >
                  <span>{t("hero.access_system")}</span>
                  <IconArrowRight size={16} />
                </Link>
                <a
                  href="#workspace"
                  className="inline-flex items-center gap-2 text-gray-200 font-semibold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200"
                >
                  {t("hero.explore_space")}
                </a>
              </div>

              {/* Stats Row — 3 Clusters */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-6">
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                    {cmsHero.stat1Value || "30+"}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    {cmsHero.stat1Label || t("hero.years_experience")}
                  </div>
                </div>
                <div className="space-y-0.5 border-l border-white/20 pl-3 sm:pl-6">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#2fd39a] tracking-tight">
                    {cmsHero.stat2Value || "10M+"}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    {cmsHero.stat2Label || t("hero.products_year")}
                  </div>
                </div>
                <div className="space-y-0.5 border-l border-white/20 pl-3 sm:pl-6">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#f2dc9a] tracking-tight">
                    {cmsHero.stat3Value || "5,000+"}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    {cmsHero.stat3Label || t("hero.operational_staff")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Block matching exact screenshot */}
            <div className="lg:col-span-5 relative min-h-[440px] h-[440px] z-10 mt-6 lg:mt-0">
              {/* 1. Main Card (Top-Right): Hands Circle Image */}
              <div className="absolute top-0 right-0 w-[80%] h-[68%] rounded-[26px] overflow-hidden border border-[#2fd39a]/35 shadow-2xl z-10 group bg-[#0d2419]">
                <img
                  src={cmsHero.handsImage || "/images/tbs-hands.png"}
                  alt="TBS Group - Chung Sức Kiến Tạo Tương Lai"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* 2. Sub Card (Bottom-Left): Team Photo Banner with White Border */}
              <div className="absolute bottom-0 left-0 w-[55%] h-[48%] rounded-[22px] overflow-hidden border-[3px] border-white shadow-2xl z-20 hover:scale-[1.03] transition-transform duration-300 group/card bg-[#0d2419]">
                <img
                  src={cmsHero.teamImage || "/images/tbs-team-banner.png"}
                  alt="Phát Huy Sức Mạnh Kiến Tạo Tương Lai"
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>

              {/* 3. Dark Quote Badge: Bottom-Right Quote Box */}
              <div className="absolute bottom-[10%] -right-2 z-30 bg-[#08221a]/90 backdrop-blur-[14px] border border-[#2fd39a]/45 rounded-[20px] p-[16px_20px] max-w-[230px] shadow-2xl">
                <div className="w-[40px] h-[2.5px] bg-gradient-to-r from-[#2fd39a] to-[#1fae7d] rounded-full mb-[10px]" />
                <p className="font-serif italic text-white text-[16px] sm:text-[17px] leading-[1.4]">
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
          Full-width dark green background strip with white stadium pills
         ════════════════════════════════════════════════════════════════ */}
      <section
        id="brand-strip"
        className="relative z-30 -mt-[74px] py-7 bg-[#0b3226]/95 backdrop-blur-md border-y border-[#2fd39a]/25 shadow-2xl overflow-hidden"
      >
        {/* Gradient side fades */}
        <div className="absolute left-0 top-0 bottom-0 w-[140px] bg-gradient-to-r from-[#0b3226] via-[#0b3226]/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[140px] bg-gradient-to-l from-[#0b3226] via-[#0b3226]/90 to-transparent z-10 pointer-events-none" />

        <div className="w-full text-center space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[3.5px] text-[#f2dc9a]">
            {t("hero.brand_partners")}
          </h3>

          {/* Continuous Marquee Row of White Stadium Pills */}
          <div className="overflow-hidden w-full flex items-center py-1">
            <div className="animate-marquee-left flex items-center gap-5 sm:gap-6">
              {[...BRAND_PARTNERS, ...BRAND_PARTNERS].map((brand, idx) => (
                <div
                  key={`${brand.name}-${idx}`}
                  className="flex-shrink-0 flex items-center justify-center w-[160px] h-[68px] rounded-[18px] px-5 py-2 bg-white shadow-lg border border-white/30 hover:-translate-y-1 hover:shadow-xl hover:scale-105 transition-all duration-300 select-none cursor-pointer group"
                  title={brand.name}
                >
                  <img
                    src={brand.logo}
                    alt={`${brand.name} Logo`}
                    className="max-h-[38px] max-w-[124px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
