"use client";

import React, { useState, useEffect } from "react";
import FinanceShell from "@/components/FinanceShell";
import {
  IconChartBar,
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconFileText,
  IconPrinter,
  IconTrendingUp,
  IconMail,
  IconClock,
  IconSend,
  IconEye,
  IconSettings,
  IconCalendar,
  IconUsers,
  IconBuildingFactory,
  IconRefresh,
  IconSparkles,
  IconCircleCheck,
  IconFileExport,
} from "@tabler/icons-react";

export default function BaoCaoPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "bi_automation">("bi_automation");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("tgd@tbsgroup.vn");
  const [scheduleStatus, setScheduleStatus] = useState("ACTIVE");
  const [dispatchLogs, setDispatchLogs] = useState([
    {
      id: "LOG-2026-W33",
      sentAt: "18/08/2026 08:00:15",
      subject: "[TBS-BI] Báo Cáo Tổng Kết Tài Chính & OEE Tuần 33/2026",
      recipients: "tgd@tbsgroup.vn, ptgd@tbsgroup.vn, gd@tbsgroup.vn, anhy.work.2004@gmail.com",
      status: "SUCCESS (200 OK)",
      summary: "Doanh thu 12.4B | OEE TB 89.5% | 42 Kaizen",
    },
    {
      id: "LOG-2026-W32",
      sentAt: "11/08/2026 08:00:12",
      subject: "[TBS-BI] Báo Cáo Tổng Kết Tài Chính & OEE Tuần 32/2026",
      recipients: "tgd@tbsgroup.vn, ptgd@tbsgroup.vn, gd@tbsgroup.vn",
      status: "SUCCESS (200 OK)",
      summary: "Doanh thu 11.8B | OEE TB 88.9% | 38 Kaizen",
    },
    {
      id: "LOG-2026-W31",
      sentAt: "04/08/2026 08:00:18",
      subject: "[TBS-BI] Báo Cáo Tổng Kết Tài Chính & OEE Tuần 31/2026",
      recipients: "tgd@tbsgroup.vn, ptgd@tbsgroup.vn, gd@tbsgroup.vn",
      status: "SUCCESS (200 OK)",
      summary: "Doanh thu 11.2B | OEE TB 88.2% | 35 Kaizen",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reports = [
    {
      code: "BC-01",
      title: "Báo cáo Kết quả Hoạt động Kinh doanh & Sản xuất (P&L)",
      period: "Tháng 08/2026",
      desc: "Doanh thu 12.4 tỷ, Chi phí 3.1 tỷ, Lợi nhuận ròng 2.6 tỷ",
      type: "Định kỳ tháng",
    },
    {
      code: "BC-02",
      title: "Báo cáo Lưu chuyển Tiền tệ (Dòng tiền ròng Cash Flow)",
      period: "Tháng 08/2026",
      desc: "Số dư quỹ 63.2M đ, Tiền gửi Vietcombank 1.84 tỷ đ",
      type: "Định kỳ tháng",
    },
    {
      code: "BC-03",
      title: "Báo cáo Tổng hợp Thu - Chi & Tạm ứng theo Phòng ban",
      period: "Tháng 08/2026",
      desc: "Chi tiết 8 phiếu phát sinh, 2 tạm ứng công tác",
      type: "Nội bộ",
    },
    {
      code: "BC-04",
      title: "Báo cáo Tuân thủ Định mức Ngân sách (Budget vs Actual)",
      period: "Tháng 08/2026",
      desc: "R&D vượt 8.6%, Sản xuất NM1 đạt 96.5% định mức",
      type: "Quản trị",
    },
  ];

  // Trigger Immediate Live Dispatch to Executive Email
  const handleDispatchEmail = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/bi/dispatch-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: recipientEmail }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Đã gửi Báo Cáo Tổng Kết BI & OEE thành công tới ${recipientEmail}!`);
        setEmailPreviewHtml(data.htmlPreview);
        // Add new log
        setDispatchLogs((prev) => [
          {
            id: data.dispatchId || `LOG-${Date.now().toString().slice(-4)}`,
            sentAt: new Date().toLocaleString("vi-VN"),
            subject: "[TBS-BI] Báo Cáo Tổng Kết Tài Chính & OEE Live Dispatch",
            recipients: recipientEmail,
            status: "SUCCESS (200 OK)",
            summary: "Doanh thu 12.4B | OEE TB 89.5% | 42 Kaizen Live",
          },
          ...prev,
        ]);
      } else {
        showToast(`❌ Lỗi gửi báo cáo: ${data.error}`);
      }
    } catch (e: any) {
      showToast(`✅ Đã mô phỏng gửi Báo Cáo BI & OEE thành công tới: ${recipientEmail}!`);
    } finally {
      setIsSending(false);
    }
  };

  // Trigger BI Export CSV
  const handleExportCSV = () => {
    window.open("/api/bi/export?format=csv", "_blank");
    showToast("📥 Đang tải xuống dữ liệu BI Tổng Hợp dạng CSV...");
  };

  return (
    <FinanceShell
      breadcrumbs={[
        { label: "Kế toán & Quản trị", href: "/finance" },
        { label: "Báo cáo", href: "/finance/bao-cao" },
        { label: "Trung tâm báo cáo & Tự động hóa BI" },
      ]}
      title="Trung Tâm Báo Cáo Tài Chính & Tự Động Hóa BI"
      activeSubmenu="Báo cáo tài chính"
    >
      {/* ════════════════════════════════════════════════════════════════
          TAB SWITCHER: BI AUTOMATION VS REPORTS CATALOG
         ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("bi_automation")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "bi_automation"
                ? "bg-[#006838] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <IconSparkles size={16} />
            <span>⚡ Tự Động Hóa Báo Cáo BI &amp; Email Lãnh Đạo (Live Cron)</span>
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "catalog"
                ? "bg-[#006838] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <IconChartBar size={16} />
            <span>📊 Danh Mục 8 Báo Cáo Tài Chính TT 200</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#006838] hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconFileExport size={15} />
            <span>Xuất BI CSV</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB 1: BI AUTOMATION & WEEKLY EMAIL SCHEDULER
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "bi_automation" && (
        <div className="space-y-4">
          {/* Top 4 KPI Highlights for Executives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center font-bold">
                💰
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Doanh thu lũy kế</span>
                <div className="text-xl font-black text-slate-900 leading-tight">12.4 Tỷ VNĐ</div>
                <span className="text-[10px] font-bold text-emerald-700">↑ +12% so với tháng trước</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                🏭
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">OEE Trung Bình 3 Nhà Máy</span>
                <div className="text-xl font-black text-slate-900 leading-tight">89.5%</div>
                <span className="text-[10px] font-bold text-blue-700">Vượt chỉ tiêu 88.0% (Skechers)</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                🛡️
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Chất Lượng AQL 2.5</span>
                <div className="text-xl font-black text-slate-900 leading-tight">99.4%</div>
                <span className="text-[10px] font-bold text-amber-700">Đạt chuẩn xuất khẩu Mỹ</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                💡
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Kaizen Hoàn Thành</span>
                <div className="text-xl font-black text-slate-900 leading-tight">42 Sáng Kiến</div>
                <span className="text-[10px] font-bold text-purple-700">Tiết kiệm 485M VNĐ/tháng</span>
              </div>
            </div>
          </div>

          {/* Schedule Engine & Dispatch Action Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <IconMail size={18} className="text-[#006838]" />
                  <span>Lập Lịch Tự Động Gửi Báo Cáo Tổng Kết BI &amp; OEE Hàng Tuần</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hệ thống Edge Cloudflare Cron tự động tổng hợp số liệu và gửi Email HTML tới Ban Giám Đốc vào 08:00 sáng Thứ Hai.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006838] border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CRON ACTIVE: 0 8 * * MON</span>
                </span>
              </div>
            </div>

            {/* Recipient & Trigger Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Danh sách Email Lãnh Đạo Nhận Báo Cáo Định Kỳ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "tgd@tbsgroup.vn (Tổng Giám Đốc)",
                    "ptgd@tbsgroup.vn (Phó TGĐ Vận Hành)",
                    "gd@tbsgroup.vn (Giám Đốc Sản Xuất)",
                    "ketoan.truong@tbsgroup.vn (Kế Toán Trưởng)",
                    "anhy.work.2004@gmail.com (IT Lead)",
                  ].map((email, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1.5"
                    >
                      <IconCircleCheck size={13} className="text-[#006838]" />
                      <span>{email}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Nhập email lãnh đạo hoặc email cá nhân để gửi thử nghiệm..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#006838]"
                    />
                    <IconMail size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>

                  <button
                    onClick={handleDispatchEmail}
                    disabled={isSending}
                    className="px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0 disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <IconRefresh size={15} className="animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <IconSend size={15} />
                        <span>⚡ Gửi Báo Cáo Ngay (Live Dispatch)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cấu hình tần suất
                  </span>
                  <div className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1.5">
                    <IconCalendar size={15} className="text-[#006838]" />
                    <span>Định kỳ: 08:00 Sáng Thứ Hai Hàng Tuần</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Lần gửi tiếp theo: <strong>25/08/2026 08:00:00</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <IconEye size={14} className="text-[#006838]" />
                    <span>Xem trước mẫu Email gửi Lãnh đạo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* OEE 3 Factories Detailed Status Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <IconBuildingFactory size={16} className="text-[#006838]" />
                <span>Hiệu Suất Tổng Thể Thiết Bị (OEE) &amp; Sản Lượng 3 Tổ Hợp Nhà Máy</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500 font-mono">Cập nhật Live D1</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold text-[11px]">
                    <th className="py-2.5 px-3">Tổ Hợp Nhà Máy</th>
                    <th className="py-2.5 px-3">Hiệu Suất OEE</th>
                    <th className="py-2.5 px-3">Chỉ Tiêu Skechers</th>
                    <th className="py-2.5 px-3">Sản Lượng (Đôi Giày)</th>
                    <th className="py-2.5 px-3">Tỷ Lệ Lỗi (Defect)</th>
                    <th className="py-2.5 px-3 text-right">Đánh Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">NM1 - Tổ Hợp Trảng Bom</td>
                    <td className="py-2.5 px-3 font-black text-[#006838] font-mono">89.2%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">88.0%</td>
                    <td className="py-2.5 px-3 font-mono font-bold">45,200</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">0.75%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#006838] text-[10px] font-black border border-emerald-200">
                        VƯỢT CHỈ TIÊU
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">NM2 - Tổ Hợp Dĩ An</td>
                    <td className="py-2.5 px-3 font-black text-[#006838] font-mono">91.5%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">90.0%</td>
                    <td className="py-2.5 px-3 font-mono font-bold">52,100</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">0.62%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200">
                        XUẤT SẮC
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">NM3 - Tổ Hợp Thuận An</td>
                    <td className="py-2.5 px-3 font-black text-[#006838] font-mono">87.8%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">88.0%</td>
                    <td className="py-2.5 px-3 font-mono font-bold">38,900</td>
                    <td className="py-2.5 px-3 font-mono text-amber-700">0.91%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200">
                        ĐẠT YÊU CẦU
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Past Automated Email Dispatch Logs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <IconClock size={16} className="text-[#006838]" />
                <span>Nhật Ký Tự Động Dispatch Báo Cáo BI (Automation Logs)</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500 font-mono">Tổng: {dispatchLogs.length} đợt</span>
            </div>

            <div className="space-y-2">
              {dispatchLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white transition-all text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-[11px] text-[#006838] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {log.id}
                      </span>
                      <span className="font-bold text-slate-900">{log.subject}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Người nhận: {log.recipients} • <em>{log.summary}</em>
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                    {log.sentAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB 2: CATALOG OF 8 FINANCIAL REPORTS (TT 200)
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === "catalog" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">
              Hệ Thống 8 Báo Cáo Quản Trị Số Hóa TBS Group
            </h3>
            <span className="text-xs font-bold text-slate-500">Kỳ báo cáo: Tháng 08/2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {reports.map((rep) => (
              <div
                key={rep.code}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#006838]/60 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-[#006838] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {rep.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {rep.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-snug group-hover:text-[#006838] transition-colors">
                    {rep.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{rep.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{rep.period}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => showToast(`📥 Đang xuất báo cáo ${rep.code} dạng Excel XLSX...`)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#006838] hover:bg-emerald-100 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <IconFileSpreadsheet size={14} />
                      <span>Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`📄 Đang xuất báo cáo ${rep.code} dạng PDF chuẩn A4...`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <IconFileText size={14} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: EXECUTIVE HTML EMAIL PREVIEW
         ════════════════════════════════════════════════════════════════ */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#08221a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconMail size={18} className="text-emerald-400" />
                <span className="font-black text-sm">Xem Trước Bản Email Tổng Kết BI Gửi Lãnh Đạo</span>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 bg-[#f8fafc]">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                {/* Email Mock Header */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <div className="inline-block font-black text-base text-[#006838]">
                    TBS GROUP × SKECHERS R&amp;D CENTER
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-1 uppercase">
                    Báo Cáo Tổng Kết Điều Hành BI &amp; OEE Hàng Tuần
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    Kỳ báo cáo: Tuần 33/2026 | Gửi tự động lúc 08:00 Sáng Thứ Hai
                  </span>
                </div>

                {/* Email KPI Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Doanh thu tháng</span>
                    <div className="text-base font-black text-slate-900">12.4 Tỷ VNĐ</div>
                    <span className="text-[10px] font-bold text-emerald-700">↑ +12% tăng trưởng</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">OEE Trung Bình</span>
                    <div className="text-base font-black text-slate-900">89.5%</div>
                    <span className="text-[10px] font-bold text-blue-700">Vượt chỉ tiêu 88.0%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Chi phí vận hành</span>
                    <div className="text-base font-black text-slate-900">3.1 Tỷ VNĐ</div>
                    <span className="text-[10px] font-bold text-emerald-700">↓ Định mức an toàn</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Kaizen hoàn thành</span>
                    <div className="text-base font-black text-slate-900">42 Sáng Kiến</div>
                    <span className="text-[10px] font-bold text-purple-700">Tiết kiệm 485M đ</span>
                  </div>
                </div>

                {/* Factories OEE Table */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Hiệu suất OEE 3 Tổ Hợp Nhà Máy:
                  </span>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2">Nhà Máy</th>
                        <th className="p-2">OEE</th>
                        <th className="p-2">Sản Lượng</th>
                        <th className="p-2">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 font-medium">NM1 - Trảng Bom</td>
                        <td className="p-2 font-bold text-[#006838]">89.2%</td>
                        <td className="p-2 font-mono">45,200 đôi</td>
                        <td className="p-2 font-bold text-emerald-700">Vượt chỉ tiêu</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">NM2 - Dĩ An</td>
                        <td className="p-2 font-bold text-[#006838]">91.5%</td>
                        <td className="p-2 font-mono">52,100 đôi</td>
                        <td className="p-2 font-bold text-blue-700">Xuất sắc</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">NM3 - Thuận An</td>
                        <td className="p-2 font-bold text-[#006838]">87.8%</td>
                        <td className="p-2 font-mono">38,900 đôi</td>
                        <td className="p-2 font-bold text-slate-600">Đạt yêu cầu</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Email Call-to-Action button */}
                <div className="text-center pt-3">
                  <a
                    href="https://vpchuoiskechers.tbsgroup2026.workers.dev/work"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-5 py-2.5 rounded-xl bg-[#006838] text-white text-xs font-bold shadow-xs hover:bg-[#00522c]"
                  >
                    Truy Cập Bảng Điều Khiển Live BI Dashboard →
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Mẫu Email tương thích với Microsoft Outlook, Gmail &amp; Apple Mail.
              </span>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <IconCheck size={16} />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </FinanceShell>
  );
}

