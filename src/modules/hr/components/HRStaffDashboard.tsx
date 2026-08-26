"use client";

import React, { useState } from "react";
import {
  IconUserCheck,
  IconClock,
  IconAlertTriangle,
  IconUserPlus,
  IconUserMinus,
  IconCheck,
  IconPlus,
  IconFileText,
  IconSearch,
  IconChevronRight,
} from "@tabler/icons-react";

interface HRStaffDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export default function HRStaffDashboard({ onNavigateTab }: HRStaffDashboardProps) {
  const [todoItems, setTodoItems] = useState([
    { id: 1, text: "Kiểm tra bằng cấp & KSK gốc của 4 nhân viên mới khối Logistics", done: true, tag: "Hồ sơ" },
    { id: 2, text: "Gửi email xác nhận Onboarding & tạo tài khoản cho Lê Hoàng Yến", done: true, tag: "Onboarding" },
    { id: 3, text: "In thẻ nhân viên & cấp phát đồng phục ca 2 nhà máy NM1", done: false, tag: "Hành chính" },
    { id: 4, text: "Xử lý 5 đơn xin nghỉ phép đã được Quản lý trực tiếp duyệt", done: false, tag: "Nghỉ phép" },
    { id: 5, text: "Rà soát 3 hợp đồng lao động sắp hết hạn đợt cuối tháng 8", done: false, tag: "Hợp đồng" },
  ]);

  const toggleTodo = (id: number) => {
    setTodoItems(
      todoItems.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Xin chào, Lê Hoàng Yến 👋
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Bảng điều khiển tác nghiệp Nhân sự hàng ngày (HR Operations Dashboard)
          </p>
        </div>

        <button
          onClick={() => onNavigateTab("directory")}
          className="px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <IconPlus size={16} />
          <span>Tiếp Nhận Nhân Viên Mới</span>
        </button>
      </div>

      {/* Operations Quick Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div onClick={() => onNavigateTab("directory")} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-[#006838] transition-all">
          <span className="text-[11px] font-bold text-slate-500 block">Hồ sơ chờ bổ sung</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">23</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Thiếu bằng/KSK</span>
          </div>
        </div>

        <div onClick={() => onNavigateTab("attendance_payroll")} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-[#006838] transition-all">
          <span className="text-[11px] font-bold text-slate-500 block">Đơn phép cần xử lý</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">12</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Chờ HR nhập máy</span>
          </div>
        </div>

        <div onClick={() => onNavigateTab("contracts")} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-[#006838] transition-all">
          <span className="text-[11px] font-bold text-slate-500 block">Hợp đồng hết hạn 30d</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-900">18</span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">Gửi thông báo</span>
          </div>
        </div>

        <div onClick={() => onNavigateTab("lifecycle")} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-[#006838] transition-all">
          <span className="text-[11px] font-bold text-slate-500 block">Nhân viên Onboarding</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">8</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Đang hướng dẫn</span>
          </div>
        </div>

        <div onClick={() => onNavigateTab("lifecycle")} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-[#006838] transition-all">
          <span className="text-[11px] font-bold text-slate-500 block">Thanh lý Offboarding</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-700">1</span>
            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Chốt sổ BHXH</span>
          </div>
        </div>
      </div>

      {/* Operations Checklist */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">Công Việc Nhân Sự Hôm Nay (Daily Operations Checklist)</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Danh sách các tác nghiệp cần xử lý trong ca làm việc</p>
          </div>
          <span className="text-xs font-bold text-[#006838] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {todoItems.filter((i) => i.done).length} / {todoItems.length} hoàn thành
          </span>
        </div>

        <div className="space-y-2.5">
          {todoItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleTodo(item.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                item.done
                  ? "bg-slate-50 border-slate-200/70 text-slate-400 line-through"
                  : "bg-white border-slate-200/90 text-slate-900 hover:border-[#006838]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    item.done ? "bg-[#006838] border-[#006838] text-white" : "border-slate-300"
                  }`}
                >
                  {item.done && <IconCheck size={14} />}
                </div>
                <span className="text-xs font-bold">{item.text}</span>
              </div>

              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-600 shrink-0">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
