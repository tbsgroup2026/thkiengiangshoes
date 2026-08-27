"use client";

import React, { useState } from "react";
import { IconTrophy, IconSchool, IconPlant, IconMessage, IconCheck, IconPlus } from "@tabler/icons-react";

export default function HRTalentPerformanceView() {
  const [subTab, setSubTab] = useState<"performance" | "talent" | "succession" | "training" | "relations">("performance");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl">
          {toastMsg}
        </div>
      )}

      {/* Sub Navigation */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs flex flex-wrap items-center gap-1">
        {[
          { id: "performance", label: "🎯 Đánh giá hiệu suất (KPI/OKR)" },
          { id: "talent", label: "🌱 Quản lý nhân tài (Talent Pool)" },
          { id: "succession", label: "🔄 Kế hoạch kế nhiệm" },
          { id: "training", label: "🎓 Đào tạo & Phát triển" },
          { id: "relations", label: "💬 Quan hệ người lao động" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              subTab === t.id ? "bg-[#006838] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: PERFORMANCE EVALUATION */}
      {subTab === "performance" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Kỳ Đánh Giá Hiệu Suất KPI 6 Tháng Đầu Năm 2026</h3>
              <p className="text-xs text-slate-500 font-medium">Kết quả xếp loại năng lực &amp; mức độ hoàn thành OKR tập đoàn</p>
            </div>
            <button onClick={() => showToast("Đã khởi tạo kỳ đánh giá KPI 6 tháng cuối năm!")} className="px-3.5 py-1.5 rounded-xl bg-[#006838] text-white text-xs font-bold">
              + Tạo Kỳ Đánh Giá Mới
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">A+ (Xuất sắc)</span>
              <span className="text-xl font-black text-emerald-950">420 người (10%)</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">A (Tốt)</span>
              <span className="text-xl font-black text-blue-950">1,850 người (43%)</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">B (Đạt)</span>
              <span className="text-xl font-black text-amber-950">1,720 người (40%)</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">C (Cần cải thiện)</span>
              <span className="text-xl font-black text-rose-950">296 người (7%)</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SUCCESSION PLANNING */}
      {subTab === "succession" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Quy Hoạch Nhân Sự Kế Nhiệm Vị Trí Quan Trọng (Succession Plan)</h3>
              <p className="text-xs text-slate-500 font-medium">Bản đồ sẵn sàng kế nhiệm cho các vị trí quản lý then chốt TBS Group</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: "Giám Đốc Khối QC & Chất Lượng", current: "Bùi Thị Hằng (Quyền GĐ)", successor: "Phạm Nguyễn Anh Huy (Ứng viên tiềm năng)", readiness: "Sẵn sàng trong 6-12 tháng", status: "High Readiness" },
              { title: "Trưởng Phòng Kế Toán", current: "Trần Thị Thu Hương", successor: "Nguyễn Thị Mai (Phó TP)", readiness: "Sẵn sàng ngay", status: "Ready Now" },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                  <div className="text-[11px] text-slate-500">
                    <span>Đang giữ vị trí: <strong>{item.current}</strong></span>
                    <span className="mx-2">•</span>
                    <span>Kế nhiệm: <strong className="text-[#006838]">{item.successor}</strong></span>
                  </div>
                  <div className="text-[10px] text-purple-700 font-bold">Mức độ sẵn sàng: {item.readiness}</div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: TRAINING */}
      {subTab === "training" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Chương Trình Đào Tạo &amp; Phát Triển Kỹ Năng</h3>
              <p className="text-xs text-slate-500 font-medium">Theo dõi các khóa đào tạo nội bộ &amp; chứng chỉ tiêu chuẩn Skechers</p>
            </div>
            <button onClick={() => showToast("Tạo khóa học mới")} className="px-3.5 py-1.5 rounded-xl bg-[#006838] text-white text-xs font-bold">
              + Mở Khóa Đào Tạo Mới
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Khóa Đào Tạo An Toàn Lao Động Nhà Máy NM1", count: "320 học viên", progress: "85%", status: "Đang diễn ra" },
              { name: "Tiêu Chuẩn Kiểm Hàng Skechers D'Lites 2026", count: "85 QC Lead", progress: "100%", status: "Đã hoàn thành" },
            ].map((course, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-black text-slate-900">{course.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#006838] text-[10px] font-bold">{course.status}</span>
                </div>
                <div className="text-[11px] text-slate-500">{course.count} • Tiến độ: <strong className="font-mono text-slate-900">{course.progress}</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: EMPLOYEE RELATIONS */}
      {subTab === "relations" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">Góp Ý, Phản Ánh &amp; Khảo Sát Hài Lòng Nhân Viên</h3>

          <div className="space-y-3">
            {[
              { content: "Đề xuất mở rộng khu vực để xe ca 2 nhà máy NM1", dept: "Công nhân NM1", status: "Đang xử lý", date: "2026-08-17" },
              { content: "Góp ý cải thiện thực đơn cơm trưa văn phòng Skechers HQ", dept: "Văn Phòng HQ", status: "Đã phản hồi", date: "2026-08-14" },
            ].map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{r.content}</h4>
                  <span className="text-[10px] text-slate-400">{r.dept} • {r.date}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
