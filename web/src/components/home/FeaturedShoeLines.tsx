"use client";

import { useState, useEffect } from "react";
import { getLandingCMS, DEFAULT_SHOE_LINES_CONFIG, ShoeLinesConfig } from "@/lib/landingCMS";

interface Props {
  initialConfig?: ShoeLinesConfig;
}

export default function FeaturedShoeLines({ initialConfig }: Props) {
  const [shoeLines, setShoeLines] = useState<ShoeLinesConfig>(
    initialConfig || DEFAULT_SHOE_LINES_CONFIG
  );

  useEffect(() => {
    const loadCMS = () => {
      const config = getLandingCMS();
      if (config?.shoeLines) {
        setShoeLines(config.shoeLines);
      }
    };
    loadCMS();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_landing_cms_updated", loadCMS);
      return () => window.removeEventListener("tbs_landing_cms_updated", loadCMS);
    }
  }, []);

  const groups = shoeLines?.groups || DEFAULT_SHOE_LINES_CONFIG.groups;
  const title = shoeLines?.title || DEFAULT_SHOE_LINES_CONFIG.title;

  return (
    <section id="featured-shoe-lines" className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      {/* Main Container: Dark Green Bar with Gold Header & Rounded Product Cards */}
      <div className="relative rounded-3xl bg-[#0F3D2E] border border-[#2fd39a]/30 shadow-2xl p-6 sm:p-8 md:p-10 overflow-hidden">
        {/* Subtle Background Glow Accent */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3/4 h-32 bg-[#2fd39a]/10 blur-3xl pointer-events-none" />

        {/* Top Header: Gold Title with Left & Right Decorative Lines */}
        <div className="relative z-10 flex items-center justify-center gap-4 mb-8 sm:mb-10 text-center">
          <div className="h-[1px] w-10 sm:w-20 md:w-32 bg-gradient-to-r from-transparent to-[#f2dc9a]/80" />
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-serif uppercase tracking-[4px] text-[#f2dc9a] drop-shadow-sm">
            {title}
          </h2>
          <div className="h-[1px] w-10 sm:w-20 md:w-32 bg-gradient-to-l from-transparent to-[#f2dc9a]/80" />
        </div>

        {/* 5 Product Line Groups Container */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 items-stretch">
          {groups.map((group) => (
            <div
              key={group.id || group.title}
              className="flex flex-col justify-between p-3.5 rounded-2xl bg-[#08221a]/80 border border-[#2fd39a]/20 backdrop-blur-xs hover:border-[#2fd39a]/50 transition-all duration-300 shadow-md group"
            >
              {/* Group 3-Image Box Grid (White Cards inside Rounded Box) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/40 p-2 rounded-xl border border-white/5">
                {group.items && group.items.slice(0, 3).map((item, itemIdx) => (
                  <div
                    key={item.id || itemIdx}
                    className="aspect-square bg-white rounded-xl p-1.5 flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 hover:scale-105 transition-transform duration-300"
                    title={item.name || group.title}
                  >
                    <img
                      src={item.url}
                      alt={item.name || `${group.title} ${itemIdx + 1}`}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/brands/256000.png";
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Group Title Badge */}
              <div className="mt-3.5">
                <div className="w-full py-2.5 px-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-center shadow-sm group-hover:bg-[#006838] group-hover:border-emerald-400/40 transition-colors">
                  <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase block leading-tight truncate">
                    {group.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
