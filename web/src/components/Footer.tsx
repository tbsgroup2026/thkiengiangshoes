"use client";

import React from "react";
import Link from "next/link";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconBrandFacebook,
  IconBrandYoutube,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";
import { COMPANY_INFO } from "@/lib/companyData";

const CONTACTS = [
  { icon: IconMapPin, text: "Tổ hợp Kiên Giang - TBS Group, Việt Nam" },
  { icon: IconPhone, text: "0296 3878 099" },
  { icon: IconMail, text: "info@tbsgroup.vn" },
];

const FOOTER_LINKS = {
  "TBS Group": [
    { label: "Giới thiệu", href: "/about" },
    { label: "Lịch sử", href: "/#timeline" },
    { label: "Tầm nhìn & Sứ mệnh", href: "https://www.tbsgroup.vn/tam-nhin-su-menh/" },
    { label: "Giá trị cốt lõi", href: "https://www.tbsgroup.vn/ve-tap-doan-tbs/gia-tri-cot-loi/" },
  ],
  "Truyền thông": [
    { label: "Tin tức & Sự kiện", href: "/news" },
    { label: "Press Center", href: "https://www.tbsgroup.vn/press-center/" },
    { label: "Phát triển bền vững", href: "https://www.tbsgroup.vn/phat-trien-ben-vung/" },
    { label: "Living Wage", href: "#" },
  ],
  "Cơ hội": [
    { label: "Tuyển dụng", href: "/careers" },
    { label: "Học bổng Khuyến học", href: "#" },
    { label: "Liên hệ HR", href: "/contact" },
    { label: "Nội bộ", href: "/login" },
  ],
  "Pháp lý": [
    { label: "Điều khoản dịch vụ", href: "#" },
    { label: "Chính sách bảo mật", href: "#" },
    { label: "ISO 9001:2015", href: "#" },
    { label: "SBTi Carbon", href: "#" },
  ],
};

export default function Footer() {
  const { t, lang } = useTranslation();

  // Dynamically create footer links based on language
  const getFooterLinks = () => {
    if (lang === "ENG") {
      return {
        "TBS Group": [
          { label: t("footer.about_tbs"), href: "/about" },
          { label: t("footer.history"), href: "/#timeline" },
          { label: t("footer.vision_mission"), href: "https://www.tbsgroup.vn/tam-nhin-su-menh/" },
          { label: t("footer.core_values"), href: "https://www.tbsgroup.vn/ve-tap-doan-tbs/gia-tri-cot-loi/" },
        ],
        "Media": [
          { label: t("footer.news_events"), href: "/news" },
          { label: t("footer.press_center"), href: "https://www.tbsgroup.vn/press-center/" },
          { label: t("footer.sustainable_development"), href: "https://www.tbsgroup.vn/phat-trien-ben-vung/" },
          { label: t("footer.living_wage"), href: "#" },
        ],
        "Opportunities": [
          { label: t("footer.recruitment"), href: "/careers" },
          { label: t("footer.scholarships"), href: "#" },
          { label: t("footer.hr_contact"), href: "/contact" },
          { label: t("footer.internal"), href: "/login" },
        ],
        "Legal": [
          { label: t("footer.terms_service"), href: "#" },
          { label: t("footer.privacy_policy"), href: "#" },
          { label: t("footer.iso_certificate"), href: "#" },
          { label: t("footer.sbti_carbon"), href: "#" },
        ],
      };
    } else {
      return {
        "TBS Group": [
          { label: "Giới thiệu", href: "/about" },
          { label: "Lịch sử", href: "/#timeline" },
          { label: "Tầm nhìn & Sứ mệnh", href: "https://www.tbsgroup.vn/tam-nhin-su-menh/" },
          { label: "Giá trị cốt lõi", href: "https://www.tbsgroup.vn/ve-tap-doan-tbs/gia-tri-cot-loi/" },
        ],
        "Truyền thông": [
          { label: "Tin tức & Sự kiện", href: "/news" },
          { label: "Press Center", href: "https://www.tbsgroup.vn/press-center/" },
          { label: "Phát triển bền vững", href: "https://www.tbsgroup.vn/phat-trien-ben-vung/" },
          { label: "Living Wage", href: "#" },
        ],
        "Cơ hội": [
          { label: "Tuyển dụng", href: "/careers" },
          { label: "Học bổng Khuyến học", href: "#" },
          { label: "Liên hệ HR", href: "/contact" },
          { label: "Nội bộ", href: "/login" },
        ],
        "Pháp lý": [
          { label: "Điều khoản dịch vụ", href: "#" },
          { label: "Chính sách bảo mật", href: "#" },
          { label: "ISO 9001:2015", href: "#" },
          { label: "SBTi Carbon", href: "#" },
        ],
      };
    }
  };
  return (
    <footer className="relative bg-[#004d28] text-white overflow-hidden border-t border-emerald-400/20 text-xs">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Main Grid: Compact 12 Cols */}
        <div className="grid lg:grid-cols-12 gap-4 items-center">
          {/* Brand & Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
                <img
                  src="/images/crawled/logo.png"
                  alt="TBS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-black text-white tracking-wider">TBS GROUP</span>
                <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                  Digital Factory II
                </span>
              </div>
            </div>

            <p className="text-[11px] text-white/50 leading-tight line-clamp-1">
              {COMPANY_INFO.intro}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-white/60">
              {CONTACTS.map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <c.icon size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[200px]">{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All Links 4 Columns Horizontal Strip (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            {Object.entries(getFooterLinks()).map(([title, links]: [string, Array<{label: string, href: string}>]) => (
              <div key={title} className="space-y-1">
                <h4 className="text-[9px] font-black tracking-widest uppercase text-emerald-400">
                  {title}
                </h4>
                <ul className="space-y-0.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-white/60 hover:text-white transition-colors duration-150 block truncate"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Micro Bottom Row */}
        <div className="border-t border-white/10 mt-2.5 pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/40">
          <div className="flex items-center gap-4 flex-wrap">
            <span>&copy; {new Date().getFullYear()} TBS Group. {t("footer.all_rights_reserved")}</span>
            <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-3">
              <a href="#" className="hover:text-white/70 transition-colors">{t("footer.terms")}</a>
              <a href="#" className="hover:text-white/70 transition-colors">{t("footer.privacy")}</a>
              <a href="#" className="hover:text-white/70 transition-colors">{t("footer.cookies")}</a>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-1.5">
            {[
              { icon: IconBrandFacebook, href: "#", label: "Facebook" },
              { icon: IconBrandYoutube, href: "#", label: "YouTube" },
              { icon: IconBrandLinkedin, href: "#", label: "LinkedIn" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:text-white transition-all"
              >
                <social.icon size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
