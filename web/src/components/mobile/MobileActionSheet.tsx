"use client";

import React from "react";
import { IconX, IconDotsVertical } from "@tabler/icons-react";

export interface ActionItem {
  id: string;
  label: string;
  sub?: string;
  icon: React.ElementType;
  color?: "default" | "emerald" | "amber" | "rose" | "blue" | "purple";
  onClick: () => void;
}

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actions: ActionItem[];
}

export default function MobileActionSheet({
  isOpen,
  onClose,
  title = "Thao tác",
  subtitle,
  actions,
}: MobileActionSheetProps) {
  if (!isOpen) return null;

  const COLOR_STYLES = {
    default: "text-slate-800 hover:bg-slate-100",
    emerald: "text-[#006838] hover:bg-emerald-50 bg-emerald-50/50",
    amber: "text-amber-800 hover:bg-amber-50 bg-amber-50/50",
    rose: "text-rose-700 hover:bg-rose-50 bg-rose-50/50",
    blue: "text-blue-700 hover:bg-blue-50 bg-blue-50/50",
    purple: "text-purple-700 hover:bg-purple-50 bg-purple-50/50",
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Sheet Panel */}
      <div className="relative w-full bg-white rounded-t-[28px] flex flex-col z-10 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-slate-200/90 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5 max-w-[280px]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Actions List */}
        <div className="p-3 space-y-1.5">
          {actions.map((act) => {
            const Icon = act.icon;
            const styleClass = COLOR_STYLES[act.color || "default"];

            return (
              <button
                key={act.id}
                onClick={() => {
                  act.onClick();
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl text-left transition-all duration-200 flex items-center justify-between group cursor-pointer active:scale-98 border border-slate-100 ${styleClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-tight">{act.label}</h4>
                    {act.sub && (
                      <p className="text-[11px] opacity-75 font-medium">{act.sub}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
