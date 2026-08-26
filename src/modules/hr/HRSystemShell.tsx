"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HRRoleMode,
  HRTabKey,
} from "./types";
import HRManagerDashboard from "./components/HRManagerDashboard";
import HRStaffDashboard from "./components/HRStaffDashboard";
import HRHanhChanhHubView from "./components/HRHanhChanhHubView";
import HREmployeeDirectoryView from "./components/HREmployeeDirectoryView";
import HRContractsView from "./components/HRContractsView";
import HRLifecycleView from "./components/HRLifecycleView";
import HRRecruitmentView from "./components/HRRecruitmentView";
import HRAttendancePayrollView from "./components/HRAttendancePayrollView";
import HRTalentPerformanceView from "./components/HRTalentPerformanceView";
import HRReportsView from "./components/HRReportsView";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconCrown,
  IconUserCheck,
  IconUser,
  IconChartPie,
  IconUsersGroup,
  IconFileCheck,
  IconClockHour4,
  IconBriefcase,
  IconRefresh,
  IconBuilding,
  IconPlant,
  IconFileSpreadsheet,
  IconCheck,
  IconX,
  IconSend,
  IconShieldCheck,
  IconMenu2,
  IconDoor,
  IconLayoutGrid,
} from "@tabler/icons-react";

export default function HRSystemShell() {
  const [roleMode, setRoleMode] = useState<HRRoleMode>("manager");
  const [activeTab, setActiveTab] = useState<HRTabKey>("overview");
  const [overviewMode, setOverviewMode] = useState<"hub" | "dashboard">("hub");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Workflow document modal state
  const [activeDocModal, setActiveDocModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const router = useRouter();

  const navItems = [
    {
      group: "Tổ chức & Hành chính",
      items: [
        { id: "overview", label: "🏠 Hub Tổng Quan Hành Chính", icon: IconLayoutGrid },
        { id: "rooms_shortcut", label: "🏢 Quản lý phòng họp", icon: IconDoor, directUrl: "/rooms" },
        { id: "trip_shortcut", label: "✈️ Đăng ký công tác", icon: IconBriefcase, directUrl: "/business-trip" },
      ],
    },
    {
      group: "Quản lý nhân sự",
      items: [
        { id: "directory", label: "👥 Hồ sơ & Cơ cấu tổ chức", icon: IconUsersGroup },
        { id: "contracts", label: "📄 Hợp đồng lao động", icon: IconFileCheck },
        { id: "lifecycle", label: "🔄 Vòng đời nhân viên", icon: IconRefresh },
      ],
    },
    {
      group: "Tuyển dụng & Thời gian",
      items: [
        { id: "recruitment", label: "🧑‍💼 Tuyển dụng & Nhu cầu", icon: IconBriefcase },
        { id: "attendance_payroll", label: "⏰ Chấm công & Lương", icon: IconClockHour4 },
      ],
    },
    {
      group: "Phát triển & Báo cáo",
      items: [
        { id: "talent_performance", label: "🌱 Nhân tài & Đánh giá KPI", icon: IconPlant },
        { id: "reports", label: "📊 Báo cáo & Audit Log", icon: IconFileSpreadsheet },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased selection:bg-[#006838] selection:text-white flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          1. MASTER TOP HEADER (ENTERPRISE HRM BRANDING & ROLE SWITCHER)
         ════════════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs backdrop-blur-md bg-white/95 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Left: Back Link & Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 md:hidden"
            >
              <IconMenu2 size={18} />
            </button>

            <button
              onClick={() => {
                if (activeTab !== "overview" || overviewMode !== "hub") {
                  setActiveTab("overview");
                  setOverviewMode("hub");
                } else {
                  router.push("/work");
                }
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#006838] text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 group"
              title="Quay lại Hub Tổng Quan Hành Chính"
            >
              <IconArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#006838] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Nền Tảng Quản Trị Nhân Sự Tập Đoàn
                </span>
                <span className="text-slate-300 text-xs hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">TBS Group / Skechers HQ</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                {activeTab === "overview" && overviewMode === "hub"
                  ? "Phân Hệ Nghiệp Vụ Nhân Sự – Hành Chánh"
                  : roleMode === "manager"
                  ? "Bảng Điều Khiển Quản Trị Nhân Sự — Trưởng Phòng HR"
                  : roleMode === "staff"
                  ? "Bảng Tác Nghiệp Nhân Sự — Chuyên Viên HR Staff"
                  : "Giao Diện Cá Nhân Nhân Viên"}
              </h1>
            </div>
          </div>

          {/* Right: Hub / KPI View Toggle & RBAC Role Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "overview" && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setOverviewMode("hub")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overviewMode === "hub"
                      ? "bg-[#006838] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🎯 Hub 10 App
                </button>
                <button
                  onClick={() => setOverviewMode("dashboard")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    overviewMode === "dashboard"
                      ? "bg-[#006838] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📊 Dashboard KPI
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setRoleMode("manager")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  roleMode === "manager"
                    ? "bg-[#006838] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IconCrown size={14} />
                <span className="hidden sm:inline">Trưởng Phòng HR</span>
              </button>

              <button
                onClick={() => setRoleMode("staff")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  roleMode === "staff"
                    ? "bg-[#006838] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IconUserCheck size={14} />
                <span className="hidden sm:inline">Chuyên Viên HR</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          2. MAIN BODY (ENTERPRISE SIDEBAR + CONTENT AREA)
         ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`${
            isSidebarOpen ? "w-64" : "w-0 md:w-16"
          } transition-all duration-200 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 overflow-y-auto no-scrollbar py-4 px-3 shadow-2xs z-30`}
        >
          <div className="space-y-6">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {isSidebarOpen && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block">
                    {group.group}
                  </span>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if ((item as any).directUrl) {
                            router.push((item as any).directUrl);
                          } else {
                            setActiveTab(item.id as any);
                            if (item.id === "overview") setOverviewMode("hub");
                          }
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2.5 cursor-pointer ${
                          isActive
                            ? "bg-[#006838] text-white shadow-2xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                        title={item.label}
                      >
                        <Icon size={18} className="shrink-0" />
                        {isSidebarOpen && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer User Info */}
          {isSidebarOpen && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 mt-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-extrabold text-slate-900">TBS HR Portal 2026</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Phiên bản Doanh nghiệp 4.0</p>
            </div>
          )}
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {overviewMode === "hub" ? (
                <HRHanhChanhHubView
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              ) : roleMode === "manager" ? (
                <HRManagerDashboard
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                  onOpenDocModal={(docId) => setActiveDocModal(docId)}
                />
              ) : (
                <HRStaffDashboard
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              )}
            </div>
          )}

          {/* TAB 2: DIRECTORY */}
          {activeTab === "directory" && <HREmployeeDirectoryView />}

          {/* TAB 3: CONTRACTS */}
          {activeTab === "contracts" && <HRContractsView />}

          {/* TAB 4: LIFECYCLE */}
          {activeTab === "lifecycle" && <HRLifecycleView />}

          {/* TAB 5: RECRUITMENT */}
          {activeTab === "recruitment" && <HRRecruitmentView />}

          {/* TAB 6: ATTENDANCE & PAYROLL */}
          {activeTab === "attendance_payroll" && <HRAttendancePayrollView />}

          {/* TAB 7: TALENT & PERFORMANCE */}
          {activeTab === "talent_performance" && <HRTalentPerformanceView />}

          {/* TAB 8: REPORTS */}
          {activeTab === "reports" && <HRReportsView />}

        </main>
      </div>
    </div>
  );
}
