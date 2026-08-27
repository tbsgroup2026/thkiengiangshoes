"use client";

import React, { useMemo } from "react";
import {
  IconAlertTriangle,
  IconCalendar,
  IconBuilding,
  IconCheck,
  IconClock,
  IconPhoto,
  IconSend,
  IconUserCheck,
  IconShield,
  IconArrowUp,
  IconChartBar,
  IconInfoCircle,
  IconChevronRight,
  IconTrophy,
  IconExclamationMark,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";

interface KaizenEarlyWarningProps {
  proposals: KaizenProposal[];
  onSelectProposal?: (proposal: KaizenProposal) => void;
}

import { REAL_DEPARTMENTS } from "./KaizenPublicSubmitForm";

const DASHBOARD_REGIONS = REAL_DEPARTMENTS.map((deptName) => ({
  name: deptName,
  target: 10,
}));

export default function KaizenEarlyWarning({ proposals, onSelectProposal }: KaizenEarlyWarningProps) {
  // 1. Compute deadline metrics
  const today = new Date();
  const currentDay = today.getDate();
  const daysUntil25th = currentDay <= 25 ? 25 - currentDay : 30 - currentDay + 25;
  const isNearDeadline = daysUntil25th <= 5;

  // 2. Filter Unevaluated Thi Đua Proposals
  const thiDuaPendingEval = useMemo(() => {
    return proposals.filter(
      (p) => p.registration_type === "THI_DUA" && (p.sub_status === "CHO_DANH_GIA" || !p.score_points || p.score_points === 0)
    );
  }, [proposals]);

  // 3. Filter Proposals Missing Evidence (no before or after image/video)
  const missingEvidenceProposals = useMemo(() => {
    return proposals.filter((p) => !p.before_image_url || !p.after_image_url);
  }, [proposals]);

  // 4. Compute Regional KPI Progress vs Targets
  const regionalKPIs = useMemo(() => {
    return DASHBOARD_REGIONS.map((r) => {
      const actualCount = proposals.filter((p) => (p.region || "").toUpperCase().includes(r.name.toUpperCase())).length;
      const percent = Math.round((actualCount / r.target) * 100);
      const isUnderTarget = percent < 80;
      return {
        ...r,
        actualCount,
        percent,
        isUnderTarget,
      };
    });
  }, [proposals]);

  // Overall Ban 2.2 Completion Rate
  const totalTarget = DASHBOARD_REGIONS.reduce((sum, r) => sum + r.target, 0);
  const totalActual = proposals.length;
  const overallPercent = Math.round((totalActual / totalTarget) * 100);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ════════════════════════════════════════════════════════════════
          HEADER BANNER BAN 2.2
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-rose-900 via-[#0b1739] to-[#0b1739] text-white p-5 rounded-2xl border border-rose-900/50 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center font-black shadow-inner shrink-0">
            <IconShield size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Bảng Cảnh Báo Sớm Cho Ban 2.2 — Thi Đua Cải Tiến
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase">
                Hệ Thống Giám Sát
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Cảnh báo hạn nộp bài ngày 25 hàng tháng, tiến độ KPI các khu vực và các hồ sơ chờ chấm điểm / thiếu minh chứng
            </p>
          </div>
        </div>

        {/* Overall Completion Metric */}
        <div className="bg-white/10 p-3 rounded-xl border border-white/20 flex items-center gap-4 shrink-0">
          <div className="text-center">
            <span className="text-2xl font-black text-amber-300 block">{overallPercent}%</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Tiến Độ Ban 2.2</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <span className="text-2xl font-black text-emerald-400 block">{totalActual}/{totalTarget}</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Hồ Sơ Đã Nộp</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TOP 4 CRITICAL WARNING CARDS
         ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Deadline 25th */}
        <div className={`p-4 rounded-2xl border shadow-2xs flex flex-col justify-between space-y-3 ${
          isNearDeadline ? "bg-rose-50 border-rose-300 text-rose-950" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wide text-rose-700 flex items-center gap-1.5">
              <IconCalendar size={18} />
              Deadline Ngày 25
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
              Còn {daysUntil25th} Ngày
            </span>
          </div>

          <div>
            <span className="text-2xl font-black block">{daysUntil25th <= 0 ? "ĐÃ HẾT HẠN" : `${daysUntil25th} Ngày`}</span>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Hạn chót tổng hợp hồ sơ thi đua Tháng {today.getMonth() + 1}/{today.getFullYear()}
            </p>
          </div>
        </div>

        {/* Card 2: Khu Vực Chưa Đạt chỉ tiêu */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
              <IconBuilding size={18} />
              Khu Vực Chậm Chỉ Tiêu
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {regionalKPIs.filter((r) => r.isUnderTarget).length} Khu Vực
            </span>
          </div>

          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {regionalKPIs.filter((r) => r.isUnderTarget).length} / {DASHBOARD_REGIONS.length}
            </span>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Các đơn vị chưa đạt 80% chỉ tiêu sản lượng cải tiến
            </p>
          </div>
        </div>

        {/* Card 3: Bài Thi Đua Chưa Chấm */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wide text-blue-700 flex items-center gap-1.5">
              <IconTrophy size={18} />
              Bài Thi Đua Chờ Chấm
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
              {thiDuaPendingEval.length} Hồ Sơ
            </span>
          </div>

          <div>
            <span className="text-2xl font-black text-slate-900 block">{thiDuaPendingEval.length}</span>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Hồ sơ thi đua đã gửi nhưng chưa được Hội đồng chấm điểm 5 tiêu chí
            </p>
          </div>
        </div>

        {/* Card 4: Hồ Sơ Thiếu Minh Chứng */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wide text-purple-700 flex items-center gap-1.5">
              <IconPhoto size={18} />
              Thiếu Ảnh Minh Chứng
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black">
              {missingEvidenceProposals.length} Bài
            </span>
          </div>

          <div>
            <span className="text-2xl font-black text-slate-900 block">{missingEvidenceProposals.length}</span>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Bài đăng ký chưa bổ sung đủ Ảnh/Video Trước & Sau cải tiến
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          REGIONAL TARGETS & PROGRESS MONITOR (BAN 2.2 KPI TABLE)
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-[#0b1739] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconChartBar size={20} className="text-amber-400" />
            <h3 className="text-xs font-black tracking-wide uppercase">
              TIẾN ĐỘ THỰC HIỆN KPI CẢI TIẾN THEO KHU VỰC (BAN 2.2)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-300">Chỉ tiêu Tháng {today.getMonth() + 1}/{today.getFullYear()}</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalKPIs.map((rk) => (
              <div
                key={rk.name}
                className={`p-4 rounded-2xl border transition-all space-y-2 ${
                  rk.isUnderTarget
                    ? "bg-rose-50/50 border-rose-200"
                    : "bg-emerald-50/40 border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs">{rk.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      rk.isUnderTarget
                        ? "bg-rose-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {rk.percent}% KPI
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rk.isUnderTarget ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(rk.percent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Thực tế: <strong className="text-slate-900">{rk.actualCount} bài</strong></span>
                  <span>Chỉ tiêu: <strong className="text-slate-900">{rk.target} bài</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          UNEVALUATED THI ĐUA PROPOSALS REQUIRING ATTENTION
         ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-[#0b1739] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertTriangle size={20} className="text-rose-400" />
            <h3 className="text-xs font-black tracking-wide uppercase">
              DANH SÁCH BÀI THI ĐUA CHỜ CHẤM ĐIỂM SÁT HẠN TỔNG KẾT
            </h3>
          </div>
          <span className="text-[10px] font-bold text-rose-300">
            {thiDuaPendingEval.length} Bài Cần Chấm Điểm
          </span>
        </div>

        <div className="p-5">
          {thiDuaPendingEval.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <IconCheck size={36} className="text-emerald-500 mx-auto" />
              <p className="text-xs text-slate-600 font-bold">
                Tất cả hồ sơ thi đua đã được Ban Giám Hiệu &amp; Hội đồng đánh giá chấm điểm đầy đủ!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {thiDuaPendingEval.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProposal && onSelectProposal(p)}
                  className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 p-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono text-[10px] font-black">
                        {p.code}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 hover:text-[#006838]">
                        {p.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tác giả: <strong>{p.proposer_name}</strong> &bull; Đơn vị: <strong>{p.department} ({p.region})</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] border border-rose-200">
                      Chờ Chấm Điểm
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-xl bg-[#006838] text-white font-bold text-xs hover:bg-[#004d29] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem &amp; Chấm Điểm</span>
                      <IconChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
