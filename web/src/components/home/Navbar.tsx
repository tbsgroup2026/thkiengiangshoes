"use client";

import React, { useState, useEffect } from "react";
import NavLink from "@/components/NavLink";
import {
  IconMenu2, IconX, IconLogin, IconNews, IconBuildingFactory,
  IconTimeline, IconBriefcase, IconPhone, IconInfoCircle
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { label: "Về TBS", href: "/about", icon: IconInfoCircle },
  { label: "Lĩnh Vực", href: "/#business", icon: IconBuildingFactory },
  { label: "Tin Tức", href: "/news", icon: IconNews },  
  { label: "Hành Trình", href: "/#timeline", icon: IconTimeline },
  { label: "Tuyển Dụng", href: "/careers", icon: IconBriefcase },
  { label: "Liên Hệ", href: "/#contact", icon: IconPhone },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-500 ${
        scrolled
          ? "bg-tbs-dark/95 backdrop-blur-xl shadow-2xl shadow-black/20 border-b border-emerald-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-[72px]">
          {/* Logo */}
          <NavLink href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-emerald-400/40 transition-all duration-300">
              <img
                src="/images/crawled/logo.png"
                alt="TBS"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block text-white font-bold text-sm tracking-wide leading-tight">
                TBS GROUP
              </span>
              <span className="block text-emerald-400 text-[9px] tracking-[0.2em] uppercase font-semibold">
                Digital Factory II
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 group"
              >
                <span className="flex items-center gap-1.5">
                  <item.icon size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <NavLink
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-400 text-tbs-dark font-bold px-5 py-2.5 rounded-full text-xs tracking-wider uppercase shadow-lg shadow-emerald-400/20 hover:shadow-emerald-400/30 hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              <IconLogin size={15} />
              Đăng Nhập
            </NavLink>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <IconX size={26} /> : <IconMenu2 size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[72px] bg-tbs-dark/98 backdrop-blur-xl transition-all duration-400 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <nav className="flex flex-col p-6 gap-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-5 py-4 text-white text-base font-medium rounded-2xl hover:bg-white/5 transition-colors"
            >
              <item.icon size={20} className="text-emerald-400" />
              {item.label}
            </a>
          ))}
          <NavLink
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-4 w-full flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-300 text-tbs-dark font-bold py-4 rounded-2xl text-sm tracking-wider uppercase"
          >
            <IconLogin size={18} />
            Đăng Nhập Nhân Viên
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
