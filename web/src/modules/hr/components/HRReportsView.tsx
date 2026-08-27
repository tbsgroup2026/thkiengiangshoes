"use client";

import React, { useState } from "react";
import { IconFileSpreadsheet, IconDownload, IconHistory, IconSearch, IconPrinter } from "@tabler/icons-react";

export default function HRReportsView() {
  const [reportType, setReportType] = useState("headcount");
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

      {/* Reports Generator Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">Trung Tâm Tạo Báo Cáo Nhân Sự Tập Đoàn</h3>
            <p className="text-xs text-slate-500 font-medium">Xuất dữ liệu biến động nhân sự, bảng lương và định biên chính xác dạng Excel / PDF</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "headcount", title: "1. Báo cáo Định biên & Headcount", desc: "Tổng quan biến động 4,286 nhân sự theo phòng ban" },
            { id: "turnover", title: "2. Báo cáo Tỷ lệ Nghỉ việc (Turnover)", desc: "Chi tiết nhân sự thôi việc và lý do tháng 8" },
            { id: "payroll", title: "3. Báo cáo Chi phí Lương & BHXH", desc: "Tổng hợp 18.4 tỷ quỹ lương đợt 1" },
            { id: "attendance", title: "4. Báo cáo Chấm công & Tăng ca", desc: "Tổng hợp giờ làm, đi trễ và giờ OT ca 2" },
            { id: "recruitment", title: "5. Báo cáo Hiệu quả Tuyển dụng", desc: "Tỷ lệ tuyển thành công 37 vị trí đang mở" },
            { id: "audit", title: "6. Nhật ký Tác nghiệp (Audit Log)", desc: "Lịch sử duyệt đơn và cập nhật sơ đồ tổ chức" },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setReportType(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                reportType === item.id
                  ? "bg-emerald-50/70 border-[#006838] shadow-2xs"
                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-xs font-black text-slate-900">{item.title}</div>
              <div className="text-[11px] text-slate-500 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => showToast(`📥 Đã xuất báo cáo ${reportType.toUpperCase()} dạng Excel!`)}
            className="px-4 py-2.5 rounded-xl bg-[#006838] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs hover:bg-[#00522c]"
          >
            <IconFileSpreadsheet size={16} />
            <span>Xuất Báo Cáo Excel (.XLSX)</span>
          </button>

          <button
            onClick={() => showToast(`🖨️ Đã chuẩn bị file PDF Báo Cáo ${reportType.toUpperCase()}!`)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs hover:bg-slate-800"
          >
            <IconPrinter size={16} />
            <span>In Báo Cáo PDF</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      {reportType === "audit" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">Nhật Ký Tác Nghiệp Hệ Thống (HR Audit Log)</h3>

          <div className="space-y-2 text-xs">
            {[
              { time: "16:20 19/08/2026", user: "Nguyễn Thị Lan Anh (TP HR)", action: "Đã phê duyệt tờ trình gia hạn hợp đồng HD-2026-001" },
              { time: "14:15 19/08/2026", user: "Lê Hoàng Yến (HR Staff)", action: "Đã cập nhật hồ sơ tiếp nhận nhân viên mới Nguyễn Văn Tuấn" },
              { time: "10:30 19/08/2026", user: "Nguyễn Thị Lan Anh (TP HR)", action: "Đã trình Tổng Giám Đốc phê duyệt YCTD-2026-01 (QC Lead)" },
            ].map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{log.action}</div>
                  <div className="text-[10px] text-slate-400">Thực hiện bởi: {log.user}</div>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
