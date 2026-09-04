"use client";

import React from "react";
import NavLink from "@/components/NavLink";
import { IconArrowRight, IconUsers, IconAward, IconHeart } from "@tabler/icons-react";

const BENEFITS = [
  { icon: IconUsers, title: "50.000+ Nhân Sự", desc: "Môi trường chuyên nghiệp, đa dạng và hòa nhập" },
  { icon: IconAward, title: "Đào Tạo & Phát Triển", desc: "Lộ trình thăng tiến rõ ràng, đào tạo kỹ năng miễn phí" },
  { icon: IconHeart, title: "Phúc Lợi Toàn Diện", desc: "Living Wage, bảo hiểm, học bổng cho con em CBCNV" },
];

export default function CareersCTA() {
  return (
    <section id="careers" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-tbs-dark via-[#0a3025] to-[#0f4133]" />
      <div className="absolute inset-0 bg-[url('/images/crawled/TBS-GROUP_team_1836-x-765-2.jpg')] bg-cover bg-center opacity-10" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[150px]" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <div className="lg:col-span-7 space-y-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-[10px] tracking-[0.2em] uppercase font-bold">
              Cơ Hội Sự Nghiệp
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Gia nhập đội ngũ{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                TBS Group
              </span>
            </h2>

            <p className="text-lg text-white/60 leading-relaxed max-w-[55ch]">
              Trở thành một phần của tập đoàn đa ngành hàng đầu Việt Nam. Làm việc tại
              Tổ hợp Kiên Giang - TBS Group với công nghệ 4.0, môi trường chuyên nghiệp
              và lộ trình phát triển bền vững.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {BENEFITS.map((b, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <b.icon size={28} className="text-amber-400 mb-3" />
                  <h4 className="font-bold text-white text-sm mb-1">{b.title}</h4>
                  <p className="text-xs text-white/40 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-2">
              <NavLink
                href="/careers"
                className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-tbs-dark font-bold px-8 py-4 rounded-full text-sm tracking-wider uppercase shadow-xl shadow-amber-400/20 hover:scale-[1.03] transition-all duration-300"
              >
                Xem Vị Trí Tuyển Dụng
                <IconArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </NavLink>
              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-full text-sm tracking-wider uppercase transition-all"
              >
                Liên Hệ HR
              </a>
            </div>
          </div>

          {/* Right: Stats visual */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5.000+", label: "Nhân sự SKECHERS", color: "emerald" },
                { value: "10M", label: "Đôi giày / năm", color: "amber" },
                { value: "9.749", label: "Suất học bổng 2025", color: "violet" },
                { value: "70M€", label: "Đầu tư năng lượng sạch", color: "blue" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur rounded-3xl p-6 border border-white/10 text-center hover:bg-white/8 transition-colors"
                >
                  <span className={`block text-2xl sm:text-3xl font-black text-${
                    s.color === "emerald" ? "emerald" : s.color === "amber" ? "amber" : s.color === "violet" ? "violet" : "blue"
                  }-400 mb-1`}>{s.value}</span>
                  <span className="text-[11px] text-white/40 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
