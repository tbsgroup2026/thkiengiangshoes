"use client";

import React, { useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import { formatTitleWithDepartment } from "@/lib/userProfiles";
import {
  IconX,
  IconSearch,
  IconHome,
  IconUsers,
  IconCalculator,
  IconTruck,
  IconFlask,
  IconShieldCheck,
  IconBuildingFactory,
  IconGridDots,
  IconLeaf,
  IconPlane,
  IconCalendarEvent,
  IconSettings,
  IconLogout,
  IconChevronRight,
  IconBuilding,
  IconCheck,
  IconAdjustments,
} from "@tabler/icons-react";

interface DepartmentItem {
  id: string;
  num: string;
  name: string;
  sub: string;
  icon: React.ElementType;
  hasData: boolean;
}

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  departments: DepartmentItem[];
  selectedDeptId: string;
  onSelectDepartment: (deptId: string) => void;
  onOpenThemeModal?: () => void;
  onLogout?: () => void;
}

export default function MobileNavDrawer({
  isOpen,
  onClose,
  currentUser,
  departments,
  selectedDeptId,
  onSelectDepartment,
  onOpenThemeModal,
  onLogout,
}: MobileNavDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Content Panel */}
      <div className="relative w-[85%] max-w-[340px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header User Profile Card */}
        <div className="p-4 bg-gradient-to-br from-[#004d29] to-[#006838] text-white flex flex-col gap-3 relative shadow-md">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Đóng Menu"
          >
            <IconX size={20} />
          </button>

          <div className="flex items-center gap-3">
            <UserAvatar
              src={currentUser?.avatar}
              name={currentUser?.name}
              size="md"
              className="ring-2 ring-white/30 shadow-sm"
            />
            <div className="min-w-0 pr-6">
              <h4 className="text-sm font-black text-white truncate tracking-tight">
                {currentUser?.name || "Cán Bộ Công Nhân Viên"}
              </h4>
              <p className="text-[11px] text-emerald-200 truncate font-medium mt-0.5">
                {formatTitleWithDepartment(currentUser)}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-mono font-bold">
                {currentUser?.emp_code || "EMP-2026"}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Search Input */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70">
          <div className="relative">
            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm nhanh phân hệ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <IconX size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Department Modules Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <div className="px-2 py-1 text-[10px] font-black text-slate-600 uppercase tracking-wider">
            DANH SÁCH PHÂN HỆ ({filteredDepts.length})
          </div>

          {filteredDepts.map((dept) => {
            const Icon = dept.icon;
            const isSelected = selectedDeptId === dept.id;

            return (
              <button
                key={dept.id}
                onClick={() => {
                  onSelectDepartment(dept.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl text-left transition-all duration-200 flex items-center justify-between group cursor-pointer active:scale-98 ${
                  isSelected
                    ? "bg-[#006838] text-white shadow-md font-bold"
                    : "hover:bg-emerald-50/70 text-slate-700 font-medium border border-transparent hover:border-emerald-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-emerald-50 text-[#006838] group-hover:scale-105"
                    }`}
                  >
                    <Icon size={19} className="stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono opacity-60">
                        {dept.num}
                      </span>
                      <h5 className="text-xs font-black truncate tracking-tight">
                        {dept.name}
                      </h5>
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? "text-emerald-100 font-medium" : "text-slate-400"
                      }`}
                    >
                      {dept.sub}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <IconCheck size={16} className="text-white flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between gap-2">
          {onOpenThemeModal && (
            <button
              onClick={() => {
                onClose();
                onOpenThemeModal();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-[#006838] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <IconAdjustments size={15} />
              <span>Giao diện & Font</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              title="Đăng xuất"
            >
              <IconLogout size={15} />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
