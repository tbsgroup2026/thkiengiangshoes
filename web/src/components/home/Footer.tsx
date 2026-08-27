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

const FOOTER_LINKS = {
  "Về TBS Group": [
    { label: "Lịch sử", href: "#timeline" },
    { label: "Lĩnh vực", href: "#business" },
    { label: "Tầm nhìn & Sứ mệnh", href: "https://www.tbsgroup.vn/tam-nhin-su-menh/" },
    { label: "Giá trị cốt lõi", href: "https://www.tbsgroup.vn/ve-tap-doan-tbs/gia-tri-cot-loi/" },
  ],
  "Truyền Thông": [
    { label: "Tin tức & Sự kiện", href: "#news" },
    { label: "Press Center", href: "https://www.tbsgroup.vn/press-center/" },
    { label: "Phát triển bền vững", href: "https://www.tbsgroup.vn/phat-trien-ben-vung/" },
    { label: "Nội bộ", href: "#" },
  ],
  "Cơ Hội": [
    { label: "Tuyển dụng", href: "/careers" },
    { label: "Học bổng Khuyến học", href: "#" },
    { label: "Living Wage", href: "#" },
    { label: "Liên hệ HR", href: "#contact" },
  ],
  "Pháp Lý": [
    { label: "Điều khoản dịch vụ", href: "#" },
    { label: "Chính sách bảo mật", href: "#" },
    { label: "ISO 9001:2015", href: "#" },
    { label: "SBTi Carbon", href: "#" },
  ],
};

const CONTACTS = [
  { icon: IconMapPin, text: "Văn Phòng Chuỗi SKECHERS - TBS Group, Việt Nam" },
  { icon: IconPhone, text: "0296 3878 099" },
  { icon: IconMail, text: "contact@tbsgroup.vn" },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-[#061a14] text-white overflow-hidden border-t border-emerald-400/20 text-xs">
      {/* Top gradient line */}
      <div className="h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Main Grid: Compact 12 Cols */}
        <div className="grid lg:grid-cols-12 gap-4 items-center">
          {/* Brand & Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
                <img src="/images/crawled/logo.png" alt="TBS Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-black text-white tracking-wider">TBS GROUP</span>
                <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                  Digital Factory II
                </span>
              </div>
            </div>

            <p className="text-[11px] text-white/50 leading-tight line-clamp-1">
              Văn Phòng Chuỗi SKECHERS thuộc hệ thống TBS Group - tập đoàn đa ngành hàng đầu Việt Nam.
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
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title} className="space-y-1">
                <h4 className="text-[9px] font-black tracking-widest uppercase text-emerald-400">
                  {title}
                </h4>
                <ul className="space-y-0.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-white/60 hover:text-white transition-colors duration-150 block truncate"
                      >
                        {link.label}
                      </a>
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
            <span>&copy; {new Date().getFullYear()} TBS Group. All rights reserved.</span>
            <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-3">
              <a href="#" className="hover:text-white/70 transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-white/70 transition-colors">Bảo mật</a>
              <a href="#" className="hover:text-white/70 transition-colors">Cookies</a>
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
