"use client";

import React, { useState, useEffect } from "react";
import { HROnboardingTask, HROffboardingTask } from "../types";
import { IconCheck, IconUserCheck, IconUserMinus, IconAlertCircle } from "@tabler/icons-react";

export default function HRLifecycleView() {
  const [tab, setTab] = useState<"onboarding" | "probation" | "offboarding">("onboarding");
  const [onboardingTasks, setOnboardingTasks] = useState<HROnboardingTask[]>([]);
  const [offboardingTasks, setOffboardingTasks] = useState<HROffboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchOnboarding = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hr/onboarding");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setOnboardingTasks(result.data);
      } else {
        setOnboardingTasks([]);
      }
    } catch (err) {
      console.warn("Failed to fetch onboarding from D1:", err);
      setOnboardingTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboarding();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl">
          {toastMsg}
        </div>
      )}

      {/* Lifecycle Subtabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs flex items-center gap-1">
        {[
          { id: "onboarding", label: "👋 Tiếp nhận & Onboarding" },
          { id: "probation", label: "⏳ Theo dõi & Chốt thử việc" },
          { id: "offboarding", label: "🚪 Bàn giao & Offboarding" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              tab === t.id ? "bg-[#006838] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ONBOARDING */}
      {tab === "onboarding" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onboardingTasks.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{item.employeeName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{item.department} • Ngày vào: <strong className="font-mono text-slate-800">{item.joinDate}</strong></p>
                    <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Người hướng dẫn: {item.mentor}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#006838] border border-emerald-200 text-xs font-black">
                    {item.progress}% hoàn tất
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006838] rounded-full" style={{ width: `${item.progress}%` }} />
                </div>

                {/* Checklist */}
                <div className="space-y-2 pt-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Danh mục tác nghiệp Onboarding:</span>
                  {item.items.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${sub.done ? "bg-[#006838] text-white" : "border border-slate-300"}`}>
                        {sub.done && "✓"}
                      </div>
                      <span className={sub.done ? "text-slate-700 font-semibold" : "text-slate-400"}>{sub.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showToast(`Cập nhật hoàn tất Onboarding cho ${item.employeeName}`)}
                  className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Xác Nhận Hoàn Tất Onboarding
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROBATION */}
      {tab === "probation" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold">
            <IconAlertCircle size={20} className="shrink-0 text-amber-800" />
            <span>15 nhân viên sắp kết thúc thử việc trong 30 ngày tới. Cần gửi phiếu đánh giá cho Quản lý trực tiếp!</span>
          </div>

          <div className="space-y-3">
            {[
              { name: "Lê Hoàng Yến", dept: "Nhân Sự - Hành Chánh", end: "2026-08-31", score: "Đánh giá A - Khuyên ký chính thức" },
              { name: "Trần Văn Nam", dept: "Kho & Logistics", end: "2026-09-05", score: "Đang chờ quản lý đánh giá" },
            ].map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{p.name}</h4>
                  <p className="text-[11px] text-slate-500">{p.dept} • Hết hạn thử việc: <strong className="font-mono text-slate-800">{p.end}</strong></p>
                  <p className="text-[11px] text-emerald-700 font-bold">{p.score}</p>
                </div>
                <button
                  onClick={() => showToast(`Trình duyệt hợp đồng chính thức cho ${p.name}`)}
                  className="px-3.5 py-2 rounded-xl bg-[#006838] text-white font-bold text-xs"
                >
                  Trình Ký Chính Thức
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OFFBOARDING */}
      {tab === "offboarding" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">Quy Trình Thanh Lý &amp; Offboarding</h3>

          {offboardingTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Hiện tại không có hồ sơ offboarding/thanh lý hợp đồng nào cần xử lý.
            </div>
          ) : (
            offboardingTasks.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{item.employeeName}</h4>
                  <p className="text-[11px] text-slate-500">{item.department} • Ngày nghỉ việc: <strong className="font-mono text-rose-600">{item.resignDate}</strong></p>
                  <p className="text-[11px] text-slate-400">Lý do: {item.reason}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold">
                <div className={`p-2 rounded-lg border ${item.assetHandoverDone ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-white text-slate-400"}`}>
                  ✓ Bàn giao tài sản
                </div>
                <div className={`p-2 rounded-lg border ${item.workHandoverDone ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-white text-slate-400"}`}>
                  ✓ Bàn giao công việc
                </div>
                <div className={`p-2 rounded-lg border ${item.accountLocked ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-white text-slate-400"}`}>
                  ✓ Khóa tài khoản
                </div>
                <div className={`p-2 rounded-lg border ${item.finalPayrollDone ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                  {item.finalPayrollDone ? "✓ Chốt lương & BHXH" : "⌛ Chờ quyết toán lương"}
                </div>
              </div>

              <button
                onClick={() => showToast(`Hoàn tất chốt sổ BHXH & quyết toán cho ${item.employeeName}`)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Xác Nhận Đóng Hồ Sơ Offboarding
              </button>
            </div>
          )))}
        </div>
      )}
    </div>
  );
}
