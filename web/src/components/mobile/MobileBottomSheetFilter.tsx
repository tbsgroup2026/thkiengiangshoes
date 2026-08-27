"use client";

import React from "react";
import { IconX, IconFilter, IconCheck, IconRotate } from "@tabler/icons-react";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  selectedValue: string;
}

interface MobileBottomSheetFilterProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  filterGroups: FilterGroup[];
  onSelectFilter: (groupId: string, valueId: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function MobileBottomSheetFilter({
  isOpen,
  onClose,
  title = "Bộ Lọc Tìm Kiếm",
  filterGroups,
  onSelectFilter,
  onApply,
  onReset,
}: MobileBottomSheetFilterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Bottom Sheet Panel */}
      <div className="relative w-full bg-white rounded-t-[28px] max-h-[85vh] flex flex-col z-10 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-slate-200/90 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Top Handle Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Bottom Sheet Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center">
              <IconFilter size={18} />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Filter Content Groups */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {filterGroups.map((group) => (
            <div key={group.id} className="space-y-2.5">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const isSelected = group.selectedValue === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelectFilter(group.id, opt.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isSelected
                          ? "bg-[#006838] text-white shadow-xs border border-[#006838]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                      }`}
                    >
                      {isSelected && <IconCheck size={14} className="stroke-[3]" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
          >
            <IconRotate size={16} />
            <span>Đặt lại</span>
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#006838] hover:bg-[#004d29] text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
          >
            <IconCheck size={18} className="stroke-[3]" />
            <span>Áp dụng bộ lọc</span>
          </button>
        </div>
      </div>
    </div>
  );
}
