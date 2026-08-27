"use client";

import React, { useState, useRef, useEffect } from "react";
import { FACTORIES } from "../factoryConfig";
import { Factory } from "../types";
import { IconBuildingFactory2, IconChevronDown, IconCheck, IconPlus, IconWorld } from "@tabler/icons-react";

interface FactorySelectorProps {
  selectedFactoryId: string;
  onSelectFactory: (factory: Factory) => void;
}

export default function FactorySelector({
  selectedFactoryId,
  onSelectFactory,
}: FactorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentFactory =
    FACTORIES.find((f) => f.id === selectedFactoryId) || FACTORIES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-block">
          Phạm vi dữ liệu:
        </span>

        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-[#006838] transition-all cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center group-hover:bg-[#006838] group-hover:text-white transition-colors">
            {currentFactory.id === "all" ? (
              <IconWorld size={15} />
            ) : (
              <IconBuildingFactory2 size={15} />
            )}
          </div>
          <span className="text-xs font-black text-slate-900 tracking-tight">
            {currentFactory.name}
          </span>
          {currentFactory.status === "live" && currentFactory.id !== "all" && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <IconChevronDown
            size={15}
            className={`text-slate-400 group-hover:text-[#006838] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <IconBuildingFactory2 size={14} className="text-slate-500" />
              Chọn nhà máy
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              D1 Realtime
            </span>
          </div>

          <div className="py-1 space-y-1">
            {FACTORIES.map((factory) => {
              const isSelected = factory.id === selectedFactoryId;
              return (
                <button
                  key={factory.id}
                  onClick={() => {
                    onSelectFactory(factory);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#006838] text-white shadow-sm"
                      : "hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {factory.id === "all" ? (
                        <IconWorld size={15} />
                      ) : (
                        <IconBuildingFactory2 size={15} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {factory.name}
                      </div>
                      {factory.location && (
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          {factory.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {factory.status === "live" && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-white/25 text-white"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        LIVE
                      </span>
                    )}
                    {factory.status === "planned" && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        SOON
                      </span>
                    )}
                    {isSelected && <IconCheck size={14} className="text-white ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <button
              onClick={() => {
                alert("Tính năng đăng ký nhà máy mới sẽ mở trong bản cập nhật phân quyền quản trị.");
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 rounded-xl text-left flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#006838] hover:bg-emerald-50/50 transition-colors cursor-pointer"
            >
              <IconPlus size={14} />
              <span>Thêm cơ sở sản xuất mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
