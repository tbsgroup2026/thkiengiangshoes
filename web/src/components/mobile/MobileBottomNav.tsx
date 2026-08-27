"use client";

import React from "react";
import {
  IconHome,
  IconBulb,
  IconShieldCheck,
  IconUsers,
  IconMenu2,
  IconSparkles,
} from "@tabler/icons-react";

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenMenu: () => void;
  badgeCounts?: {
    kaizen?: number;
    quality?: number;
    hr?: number;
  };
}

export default function MobileBottomNav({
  activeTab,
  onSelectTab,
  onOpenMenu,
  badgeCounts,
}: MobileBottomNavProps) {
  const tabs = [
    { id: "overview", label: "Tổng quan", icon: IconHome },
    { id: "ci-kaizen", label: "Kaizen", icon: IconBulb, badge: badgeCounts?.kaizen },
    { id: "qc-quality", label: "QC", icon: IconShieldCheck, badge: badgeCounts?.quality },
    { id: "hr-hanhchanh", label: "Nhân sự", icon: IconUsers, badge: badgeCounts?.hr },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-1.5 px-3 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? "text-[#006838] font-black"
                  : "text-slate-500 hover:text-slate-800 font-semibold"
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-100/80 text-[#006838] scale-110 shadow-2xs"
                    : "hover:bg-slate-100"
                }`}
              >
                <Icon size={21} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black leading-none border border-white shadow-2xs">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[11px] tracking-tight mt-0.5 ${isActive ? "font-black" : "font-semibold"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 5th Tab: Open Full Menu Drawer */}
        <button
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 text-slate-600 hover:text-[#006838] font-semibold active:scale-95 cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#006838] transition-all">
            <IconMenu2 size={21} className="stroke-[2.2]" />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5 font-bold text-slate-700">
            Phân hệ
          </span>
        </button>
      </div>
    </nav>
  );
}
