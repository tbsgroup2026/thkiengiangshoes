"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconX,
  IconTrophy,
  IconStar,
  IconThumbUp,
  IconPhoto,
  IconAward,
  IconEditCircle,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconLock,
  IconDeviceFloppy,
  IconReload,
  IconUserCheck,
  IconChevronRight,
  IconBuilding,
  IconCalendar,
  IconInfoCircle,
  IconMessages,
  IconSend,
  IconShieldCheck,
  IconAlertTriangle,
  IconPlus,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";
import { usePermission } from "@/hooks/usePermission";

interface KaizenDetailModalProps {
  proposal: KaizenProposal;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEvaluate: () => void;
  onRate: () => void;
}

const CATEGORIES = [
  { id: "MATERIAL_SAVING", label: "1.Tiết kiệm Vật tư", color: "bg-blue-600 text-white" },
  { id: "COST_SAVING", label: "2.Tiết kiệm Chi phí", color: "bg-emerald-600 text-white" },
  { id: "PRODUCTIVITY", label: "3.Tăng Năng suất", color: "bg-blue-500 text-white" },
  { id: "SAFETY", label: "4.An toàn lao động", color: "bg-[#006838] text-white" },
  { id: "5S", label: "5.5S", color: "bg-sky-500 text-white" },
  { id: "AUTOMATION", label: "6.Tự động hoá", color: "bg-indigo-600 text-white" },
  { id: "EQUIPMENT", label: "7.MMTB CCDC", color: "bg-purple-600 text-white" },
  { id: "OTHER", label: "8.Khác", color: "bg-slate-600 text-white" },
];

export default function KaizenDetailModal({
  proposal,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onEvaluate,
  onRate,
}: KaizenDetailModalProps) {
  const { user, isExecutiveOrAdmin, levelRank } = usePermission();
  const [activeTab, setActiveTab] = useState<"info" | "expert_review" | "star_review">("info");
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(proposal?.before_image_url ? { type: "image", url: proposal.before_image_url } : null);

  // Sync selected media when proposal changes
  useEffect(() => {
    if (proposal?.before_image_url) {
      setSelectedMedia({ type: "image", url: proposal.before_image_url });
    } else if (proposal?.after_image_url) {
      setSelectedMedia({ type: "image", url: proposal.after_image_url });
    } else {
      setSelectedMedia(null);
    }
  }, [proposal]);

  // Determine permissions for Tab 2 "Đánh giá chuyên môn" & Tab 3 "Đánh giá thưởng"
  const isOwner = useMemo(() => {
    if (!user || !user.empCode || !proposal?.proposer_emp_code) return false;
    return user.empCode.trim().toUpperCase() === proposal.proposer_emp_code.trim().toUpperCase();
  }, [user, proposal]);

  const isJudgeOrExecutive = useMemo(() => {
    if (isExecutiveOrAdmin || levelRank >= 3) return true;
    const rc = ((user as any)?.roleCode || "").toUpperCase();
    return ["TONG_GIAM_DOC", "PHO_TONG_GIAM_DOC", "GIAM_DOC", "PHO_GIAM_DOC", "TRUONG_PHONG", "CI_LEAD", "QC", "ADMIN"].includes(rc);
  }, [user, isExecutiveOrAdmin, levelRank]);

  // Tab 2: BGK/Ban 2.2/Admin HOẶC Tác giả (chỉ xem điểm đã chấm)
  const canSeeExpertTab = isJudgeOrExecutive || (isOwner && proposal?.sub_status === "DA_DANH_GIA");
  // Tab 3: CHỈ BGK / Ban 2.2 / Admin mới có quyền thấy & trao giải thưởng
  const canSeeAwardTab = isJudgeOrExecutive;

  if (!isOpen || !proposal) return null;

  const catObj = CATEGORIES.find((c) => c.id === proposal.category) || CATEGORIES[0];
  const pMonth = (proposal as any).proposer_month || (proposal.created_at ? new Date(proposal.created_at).getMonth() + 1 : new Date().getMonth() + 1);
  const pYear = (proposal as any).proposer_year || (proposal.created_at ? new Date(proposal.created_at).getFullYear() : new Date().getFullYear());
  const vtcv = (proposal as any).proposer_position || proposal.department || "Công Nhân Sản Xuất";
  const cust = proposal.customer || "Skechers";
  const prodGroup = (proposal as any).product_group || proposal.factory || "Quai";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[96vw] xl:max-w-7xl 2xl:max-w-[1550px] max-h-[96vh] flex flex-col md:flex-row overflow-hidden text-left animate-in zoom-in-95 duration-200">
        
        {/* ═══════════════════════════════════════════════════════════════════════════════════
            LEFT SIDEBAR (Fixed, ~300px)
           ═══════════════════════════════════════════════════════════════════════════════════ */}
        <div className="w-full md:w-80 md:max-h-[96vh] md:overflow-y-auto bg-slate-50 border-r border-slate-200 p-4 md:p-5 flex flex-col gap-4 flex-shrink-0">
          
          {/* A. ẢNH BÊN TRÁI & THUMBNAILS */}
          <div className="space-y-2.5">
            <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center">
              {selectedMedia?.type === "image" && selectedMedia.url ? (
                <img
                  src={selectedMedia.url}
                  alt="Selected"
                  className="w-full h-full object-contain"
                />
              ) : selectedMedia?.type === "video" && selectedMedia.url ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="w-full h-full object-cover bg-black"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-1">
                  <IconPhoto size={28} className="opacity-40" />
                  <span>Không có ảnh</span>
                </div>
              )}
            </div>

            {/* Thumbnails list */}
            <div className="flex gap-2">
              {proposal.before_image_url && (
                <button
                  type="button"
                  onClick={() => proposal.before_image_url && setSelectedMedia({ type: "image", url: proposal.before_image_url })}
                  className={`flex-1 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 ${
                    selectedMedia?.url === proposal.before_image_url && selectedMedia?.type === "image"
                      ? "border-[#006838] ring-2 ring-[#006838]/40"
                      : "border-slate-300 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                  title="Ảnh Trước"
                >
                  <img src={proposal.before_image_url} alt="Before" className="w-full h-full object-cover" />
                </button>
              )}
              {proposal.after_image_url && (
                <button
                  type="button"
                  onClick={() => proposal.after_image_url && setSelectedMedia({ type: "image", url: proposal.after_image_url })}
                  className={`flex-1 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 ${
                    selectedMedia?.url === proposal.after_image_url && selectedMedia?.type === "image"
                      ? "border-[#006838] ring-2 ring-[#006838]/40"
                      : "border-slate-300 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                  title="Ảnh Sau"
                >
                  <img src={proposal.after_image_url} alt="After" className="w-full h-full object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* B. THÔNG TIN NGƯỜI ĐĂNG KÝ (CARD BỐ CỤC THEO ẢNH 2) */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              NGƯỜI ĐĂNG KÝ
            </span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#006838] font-black text-xs flex items-center justify-center shrink-0">
                👤
              </div>
              <span className="text-xs font-black text-slate-900 truncate">
                {proposal.proposer_name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">ĐIỂM TRUNG BÌNH</span>
              <span className="text-sm font-black text-amber-600 block">
                {(proposal.avg_rating || 0).toFixed(1)} ⭐
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">CHUYÊN MÔN</span>
              <span className="text-sm font-black text-emerald-600 block">
                {proposal.score_points || proposal.average_score ? `${proposal.score_points || proposal.average_score}/100` : "---"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">VTCV</span>
              <span className="text-xs font-bold text-slate-900 block truncate" title={vtcv}>
                {vtcv}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">NHÓM SP/DV</span>
              <span className="text-xs font-bold text-slate-900 block truncate" title={prodGroup}>
                {prodGroup}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">PHÂN LOẠI</span>
              <span className="text-xs font-bold text-slate-900 block truncate" title={catObj.label}>
                {catObj.label}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">NGÀY ĐĂNG</span>
              <span className="text-xs font-bold text-slate-900 block">
                {new Date(proposal.created_at).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">NHÂN SỰ ĐỀ XUẤT</span>
              <span className="text-xs font-bold text-slate-900 block font-mono">
                {proposal.proposer_emp_code}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">KHÁCH HÀNG</span>
              <span className="text-xs font-bold text-slate-900 block">
                {cust}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 mt-auto border-t border-slate-200">
            <button
              type="button"
              onClick={onEdit}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <IconEditCircle size={16} />
              <span>Sửa Cải Tiến</span>
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <IconTrash size={16} />
              <span>Xóa Cải Tiến</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════════
            RIGHT CONTENT AREA
           ═══════════════════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
          
          {/* HEADER BÊN PHẢI (BỐ CỤC GIỐNG ẢNH 2) */}
          <div className="flex-shrink-0 p-5 md:p-6 border-b border-slate-200 bg-white">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${catObj.color}`}>
                  {catObj.label}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                  {proposal.registration_type === "THI_DUA" ? "🏆 Thi đua" : "📦 Lưu trữ"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                  proposal.sub_status === "DA_DANH_GIA" || proposal.score_points
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-amber-50 text-amber-700 border-amber-300"
                }`}>
                  ● {proposal.sub_status === "DA_DANH_GIA" || proposal.score_points ? "Đã tổng hợp điểm" : "Chờ tổng hợp điểm"}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Title & Metadata */}
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase leading-snug mb-1">
                {proposal.title}
              </h2>
              <p className="text-xs font-bold text-slate-500">
                MSNV: <span className="font-mono text-slate-700">{proposal.proposer_emp_code}</span> &bull; TCV: <span className="text-slate-700">{vtcv}</span> &bull; KV: <span className="text-slate-700">{proposal.region || "Kiên Giang 1"}</span> &bull; Tháng {pMonth}/{pYear}
              </p>
            </div>
          </div>

          {/* PILL TABS (BỐ CỤC PILL TAB BUTTON GIỐNG ẢNH 2) */}
          <div className="flex-shrink-0 px-5 md:px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "info"
                  ? "bg-white text-[#006838] shadow-xs border border-slate-200"
                  : "bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <span>ℹ️ Thông tin</span>
            </button>

            {canSeeExpertTab && (
              <button
                type="button"
                onClick={() => setActiveTab("expert_review")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "expert_review"
                    ? "bg-white text-[#006838] shadow-xs border border-slate-200"
                    : "bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>♛ Đánh giá chuyên môn</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  {proposal.sub_status === "DA_DANH_GIA" || proposal.score_points ? `${proposal.score_points || proposal.average_score || 0}đ` : "Barem"}
                </span>
              </button>
            )}

            {canSeeAwardTab && (
              <button
                type="button"
                onClick={() => setActiveTab("star_review")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "star_review"
                    ? "bg-white text-[#006838] shadow-xs border border-slate-200"
                    : "bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>★ Đánh giá thưởng</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                  {proposal.award_title ? "Đã trao giải" : "Trao giải"}
                </span>
              </button>
            )}
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {activeTab === "info" && <TabInfoContent proposal={proposal} />}
            {activeTab === "expert_review" && canSeeExpertTab && (
              <TabExpertReviewContent proposal={proposal} isOwner={isOwner} />
            )}
            {activeTab === "star_review" && canSeeAwardTab && (
              <TabAwardReviewContent proposal={proposal} isJudgeOrExecutive={isJudgeOrExecutive} onEvaluate={onEvaluate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════════
   TAB 1: INFO CONTENT (THAM CHIẾU THEO CẤU TRÚC VÀ BỐ CỤC CHUẨN CỦA ẢNH 2)
   ═══════════════════════════════════════════════════════════════════════════════════ */
function TabInfoContent({ proposal }: { proposal: KaizenProposal }) {
  const prodCode = (proposal as any).product_code || proposal.code || "---";
  const qty = (proposal as any).quantity || proposal.vote_count || 0;
  const pricingDir = (proposal as any).pricing_direction || "THOI_GIAN";

  // Videos list parse
  let videos: { type: string; url: string; title?: string }[] = [];
  if (proposal.attachments_json) {
    try {
      const atts = typeof proposal.attachments_json === "string" ? JSON.parse(proposal.attachments_json) : proposal.attachments_json;
      if (Array.isArray(atts)) {
        videos = atts.filter((a: any) => a && (a.type?.startsWith("video_") || a.url?.includes("video") || a.url?.startsWith("data:video/")));
      }
    } catch (e) {}
  }

  return (
    <div className="p-5 md:p-6 space-y-6 text-xs">
      
      {/* 1. TỔNG QUAN CẢI TIẾN (3 CARDS GRID THEO ẢNH 2) */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
          TỔNG QUAN CẢI TIẾN
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block">MÃ HÀNG</span>
            <span className="text-sm font-black text-slate-900 block">{prodCode}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block">SỐ LƯỢNG ĐH</span>
            <span className="text-sm font-black text-slate-900 block">
              {qty > 0 ? qty.toLocaleString("vi-VN") : "---"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block">HƯỚNG ĐÁNH GIÁ</span>
            <span className="text-sm font-black text-slate-900 block">
              {pricingDir === "TRI_GIA" || pricingDir === "Trị giá" ? "Trị giá" : "Thời gian"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. VẤN ĐỀ PHÁT HIỆN (TRƯỚC) & GIẢI PHÁP HÀNH ĐỘNG (SAU) THEO ẢNH 2 */}
      <div className="space-y-4">
        {/* VẤN ĐỀ PHÁT HIỆN (TRƯỚC) */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
          <h4 className="text-xs font-black uppercase text-rose-800 tracking-wide flex items-center gap-1.5">
            <IconAlertCircle size={16} className="text-rose-600" />
            <span>VẤN ĐỀ PHÁT HIỆN (TRƯỚC)</span>
          </h4>
          <p className="font-medium text-slate-800 leading-relaxed whitespace-pre-wrap text-xs">
            {proposal.before_description || "Chưa có mô tả hiện trạng lãng phí trước cải tiến."}
          </p>
        </div>

        {/* GIẢI PHÁP HÀNH ĐỘNG (SAU) */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wide flex items-center gap-1.5">
            <IconThumbUp size={16} className="text-emerald-600" />
            <span>GIẢI PHÁP HÀNH ĐỘNG (SAU)</span>
          </h4>
          <p className="font-medium text-slate-800 leading-relaxed whitespace-pre-wrap text-xs">
            {proposal.after_solution || "Chưa có mô tả giải pháp sáng kiến cải tiến."}
          </p>
        </div>
      </div>

      {/* 3. HIỆU QUẢ CẢI TIẾN (4 METRIC CARDS GRID THEO ẢNH 2) */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
          HIỆU QUẢ CẢI TIẾN
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* TRƯỚC */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">TRƯỚC</span>
            <span className="text-base sm:text-lg font-black text-slate-900 block">
              {proposal.time_before_seconds ? `${proposal.time_before_seconds}s` : "---"}
            </span>
          </div>

          {/* SAU */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 block">SAU</span>
            <span className="text-base sm:text-lg font-black text-slate-900 block">
              {proposal.time_after_seconds ? `${proposal.time_after_seconds}s` : "---"}
            </span>
          </div>

          {/* TIẾT KIỆM */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-purple-700 block">TIẾT KIỆM</span>
            <span className="text-base sm:text-lg font-black text-purple-900 block">
              {proposal.saved_seconds ? `${proposal.saved_seconds} giây` : "---"}
            </span>
          </div>

          {/* HIỆU QUẢ (NỔI BẬT NỀN XANH LÁ THEO ẢNH 2) */}
          <div className="p-3.5 rounded-2xl bg-[#006838] text-white space-y-1 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase text-emerald-200 block">HIỆU QUẢ</span>
            <span className="text-base sm:text-lg font-black text-white block truncate">
              {Math.round((proposal.saved_seconds || 0) * 12.5).toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
        </div>
      </div>

      {/* 4. SO SÁNH HÌNH ẢNH (BEFORE / AFTER SIDE-BY-SIDE THEO ẢNH 2) */}
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
          SO SÁNH HÌNH ẢNH
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ảnh TRƯỚC */}
          <div className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <span>🖼 TRƯỚC</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                {proposal.before_image_url ? "1 ảnh" : "0 ảnh"}
              </span>
            </div>
            {proposal.before_image_url ? (
              <a href={proposal.before_image_url} target="_blank" rel="noreferrer" className="block">
                <img
                  src={proposal.before_image_url}
                  alt="Before"
                  className="w-full h-52 object-contain rounded-xl border border-rose-200 bg-white"
                />
              </a>
            ) : (
              <div className="w-full h-44 rounded-xl border border-dashed border-rose-200 bg-white flex items-center justify-center text-slate-400 font-bold text-xs">
                Chưa có ảnh trước
              </div>
            )}
          </div>

          {/* Ảnh SAU */}
          <div className="p-3.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <span>🖼 SAU</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                {proposal.after_image_url ? "1 ảnh" : "0 ảnh"}
              </span>
            </div>
            {proposal.after_image_url ? (
              <a href={proposal.after_image_url} target="_blank" rel="noreferrer" className="block">
                <img
                  src={proposal.after_image_url}
                  alt="After"
                  className="w-full h-52 object-contain rounded-xl border border-emerald-200 bg-white"
                />
              </a>
            ) : (
              <div className="w-full h-44 rounded-xl border border-dashed border-emerald-200 bg-white flex items-center justify-center text-slate-400 font-bold text-xs">
                Chưa có ảnh sau
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. VIDEO CLIPS (CHỈ HIỂN THỊ KHI CÓ DATA VIDEO) */}
      {videos.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-black uppercase tracking-wider text-purple-700">
            VIDEO CLIPS MINH HỌA
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((vid, idx) => (
              <div key={idx} className="p-3 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-1.5">
                <span className="text-xs font-bold text-purple-900 block">{vid.title || `Video #${idx + 1}`}</span>
                <video controls src={vid.url} className="w-full h-44 object-cover rounded-xl bg-black" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════════
   TAB 2: EXPERT REVIEW CONTENT (Barem 100đ, Pass/Fail, 5 Tiêu chí, Lock on Confirm)
   ═══════════════════════════════════════════════════════════════════════════════════ */
function TabExpertReviewContent({
  proposal,
  isOwner,
}: {
  proposal: KaizenProposal;
  isOwner: boolean;
}) {
  const { user, isExecutiveOrAdmin, levelRank } = usePermission();

  const isJudgeOrExecutive = useMemo(() => {
    if (isExecutiveOrAdmin || levelRank >= 3) return true;
    const rc = ((user as any)?.roleCode || "").toUpperCase();
    return ["TONG_GIAM_DOC", "PHO_TONG_GIAM_DOC", "GIAM_DOC", "PHO_GIAM_DOC", "TRUONG_PHONG", "CI_LEAD", "QC", "ADMIN"].includes(rc);
  }, [user, isExecutiveOrAdmin, levelRank]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Server state data
  const [evalData, setEvalData] = useState<any>(null);

  // Form states for assigned judge scoring
  const [req1, setReq1] = useState(true);
  const [req2, setReq2] = useState(true);
  const [req3, setReq3] = useState(true);
  const [req4, setReq4] = useState(true);

  const prerequisitePass = useMemo(() => {
    return req1 && req2 && req3 && req4;
  }, [req1, req2, req3, req4]);

  const [c1Score, setC1Score] = useState<number>(0);
  const [c2Score, setC2Score] = useState<number>(0);
  const [c3Score, setC3Score] = useState<number>(0);
  const [c4Score, setC4Score] = useState<number>(0);
  const [c5Score, setC5Score] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [evalStatus, setEvalStatus] = useState<"DRAFT" | "CONFIRMED">("DRAFT");

  // Admin assign state
  const [newJudgeEmpCode, setNewJudgeEmpCode] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Fetch current evaluations from DB
  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ci-kaizen/expert-evaluations?proposalId=${proposal.id}`);
      const json = await res.json();
      if (json.success) {
        setEvalData(json.data);
        if (json.data.myEvaluation) {
          const my = json.data.myEvaluation;
          setReq1(my.prerequisitePass);
          setReq2(my.prerequisitePass);
          setReq3(my.prerequisitePass);
          setReq4(my.prerequisitePass);
          setC1Score(my.c1Score || 0);
          setC2Score(my.c2Score || 0);
          setC3Score(my.c3Score || 0);
          setC4Score(my.c4Score || 0);
          setC5Score(my.c5Score || 0);
          setComments(my.comments || "");
          setEvalStatus(my.status || "DRAFT");
        }
      }
    } catch (e: any) {
      console.error("Lỗi khi tải bảng chấm điểm:", e);
    } finally {
      setLoading(false);
    }
  };

  // Assign Judge BY EMP CODE
  const handleAddJudge = async () => {
    if (!newJudgeEmpCode.trim()) return;
    setAssigning(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/ci-kaizen/expert-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_JUDGE",
          proposalId: proposal.id,
          judgeEmpCode: newJudgeEmpCode.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        setNewJudgeEmpCode("");
        await fetchEvaluations();
      } else {
        setErrorMsg(json.message || "Lỗi khi gán BGK!");
      }
    } catch (e: any) {
      setErrorMsg("Không thể gửi dữ liệu gán BGK!");
    } finally {
      setAssigning(false);
    }
  };

  // Remove Assigned Judge
  const handleRemoveJudge = async (judgeEmpCode: string) => {
    setAssigning(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/ci-kaizen/expert-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REMOVE_JUDGE",
          proposalId: proposal.id,
          judgeEmpCode,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        await fetchEvaluations();
      } else {
        setErrorMsg(json.message || "Lỗi khi gỡ BGK!");
      }
    } catch (e: any) {
      setErrorMsg("Không thể gỡ BGK!");
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [proposal.id]);

  // Compute live total score
  const totalScore = useMemo(() => {
    if (!prerequisitePass) return 0;
    return Math.round((c1Score + c2Score + c3Score + c4Score + c5Score) * 10) / 10;
  }, [prerequisitePass, c1Score, c2Score, c3Score, c4Score, c5Score]);

  // Handle Save Draft or Confirm
  const handleSubmitScore = async (action: "SAVE_DRAFT" | "CONFIRM") => {
    if (action === "CONFIRM") {
      const confirmOk = window.confirm(
        `XÁC NHẬN KHÓA ĐIỂM (${totalScore}/100 ĐIỂM)?\n\nLưu ý: Sau khi xác nhận (CONFIRMED), bạn sẽ KHÔNG thể chỉnh sửa lại điểm số hay nhận xét chuyên môn này nữa.`
      );
      if (!confirmOk) return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/ci-kaizen/expert-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          prerequisitePass,
          c1Score,
          c2Score,
          c3Score,
          c4Score,
          c5Score,
          comments,
          action,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || "Đã ghi nhận điểm số!");
        setEvalStatus(action === "CONFIRM" ? "CONFIRMED" : "DRAFT");
        await fetchEvaluations();
      } else {
        setErrorMsg(json.message || "Lỗi khi lưu điểm số!");
      }
    } catch (e: any) {
      setErrorMsg("Không thể gửi dữ liệu chấm điểm!");
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const handleResetForm = () => {
    if (evalStatus === "CONFIRMED") return;
    setReq1(true);
    setReq2(true);
    setReq3(true);
    setReq4(true);
    setC1Score(0);
    setC2Score(0);
    setC3Score(0);
    setC4Score(0);
    setC5Score(0);
    setComments("");
  };

  // Criterion 1 Options (Dynamic according to Category)
  const catObj = CATEGORIES.find((c) => c.id === proposal.category) || CATEGORIES[0];

  const c1Options = useMemo(() => {
    const cat = proposal.category || "PRODUCTIVITY";
    if (cat === "PRODUCTIVITY") {
      return [
        { score: 0, label: "0đ", desc: "Không tăng / Giảm năng suất" },
        { score: 4, label: "4đ", desc: "Tăng < 5%" },
        { score: 9, label: "9đ", desc: "Tăng 5% - <10%" },
        { score: 10, label: "10đ", desc: "Tăng 10% - <15%" },
        { score: 14, label: "14đ", desc: "Tăng 15% - <20%" },
        { score: 19, label: "19đ", desc: "Tăng 20% - <30%" },
        { score: 30, label: "30đ", desc: "Tăng 30% - <40%" },
        { score: 33, label: "33đ", desc: "Tăng 40% - <50%" },
        { score: 35, label: "35đ", desc: "Tăng ≥ 50%" },
      ];
    } else if (cat === "MATERIAL_SAVING" || cat === "COST_SAVING") {
      return [
        { score: 0, label: "0đ", desc: "Chưa đo lường / Không tiết kiệm" },
        { score: 5, label: "5đ", desc: "Tiết kiệm < 10 Tr VNĐ/năm" },
        { score: 10, label: "10đ", desc: "10 Tr - < 30 Tr VNĐ" },
        { score: 15, label: "15đ", desc: "30 Tr - < 50 Tr VNĐ" },
        { score: 20, label: "20đ", desc: "50 Tr - < 100 Tr VNĐ" },
        { score: 25, label: "25đ", desc: "100 Tr - < 200 Tr VNĐ" },
        { score: 30, label: "30đ", desc: "200 Tr - < 500 Tr VNĐ" },
        { score: 35, label: "35đ", desc: "≥ 500 Tr VNĐ" },
      ];
    } else {
      return [
        { score: 0, label: "0đ", desc: "Chưa rõ hiệu quả cải thiện" },
        { score: 8, label: "8đ", desc: "Cải thiện cơ bản phạm vi nhỏ" },
        { score: 15, label: "15đ", desc: "Cải thiện khá, loại rủi ro nhẹ" },
        { score: 22, label: "22đ", desc: "Cải thiện tốt, giảm rõ rủi ro" },
        { score: 28, label: "28đ", desc: "Xuất sắc, triệt tiêu rủi ro" },
        { score: 35, label: "35đ", desc: "Đột phá vượt trội tiêu chuẩn" },
      ];
    }
  }, [proposal.category]);

  const c2Options = [
    { score: 0, label: "0đ", desc: "Không khả thi / Thu hồi > 2 năm" },
    { score: 5, label: "5đ", desc: "Ít khả thi / Thu hồi 1 - 2 năm" },
    { score: 10, label: "10đ", desc: "Khả thi TB / Thu hồi 6 - 12 tháng" },
    { score: 15, label: "15đ", desc: "Khả thi cao / Thu hồi < 6 tháng" },
    { score: 20, label: "20đ", desc: "Rất khả thi / Không tốn chi phí" },
  ];

  const c3Options = [
    { score: 0, label: "0đ", desc: "Chỉ áp dụng đơn lẻ 1 vị trí" },
    { score: 5, label: "5đ", desc: "Nhân rộng trong 1 công đoạn nhỏ" },
    { score: 10, label: "10đ", desc: "Nhân rộng toàn bộ dây chuyền" },
    { score: 15, label: "15đ", desc: "Nhân rộng toàn nhà máy / xưởng" },
    { score: 20, label: "20đ", desc: "Nhân rộng toàn Tập Đoàn TBS" },
  ];

  const c4Options = [
    { score: 0, label: "0đ", desc: "Sao chép nguyên mẫu bên ngoài" },
    { score: 3, label: "3đ", desc: "Cải tiến nhỏ trên quy trình cũ" },
    { score: 7, label: "7đ", desc: "Ý tưởng sáng tạo độc lập" },
    { score: 11, label: "11đ", desc: "Giải pháp độc đáo, tự chế dụng cụ" },
    { score: 15, label: "15đ", desc: "Sáng kiến xuất sắc đột phá" },
  ];

  const c5Options = [
    { score: 0, label: "0đ", desc: "Cá nhân làm độc lập" },
    { score: 2, label: "2đ", desc: "Phối hợp nhỏ 2 người" },
    { score: 5, label: "5đ", desc: "Phối hợp nhóm trong bộ phận" },
    { score: 8, label: "8đ", desc: "Phối hợp liên phòng ban xuất sắc" },
    { score: 10, label: "10đ", desc: "Truyền cảm hứng phong trào Gemba" },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span>Đang tải dữ liệu chấm điểm chuyên môn...</span>
      </div>
    );
  }

  const isAssignedJudge = evalData?.isAssignedJudge || isJudgeOrExecutive || false;
  const isCompleted = evalData?.isCompleted || false;
  const confirmedCount = evalData?.confirmedCount || 0;
  const requiredCount = evalData?.requiredCount || 0;
  const averageScore = evalData?.averageScore || proposal.score_points || 0;

  return (
    <div className="p-5 md:p-6 space-y-6">
      {/* PROGRESS & SUMMARY BAR */}
      <div className="bg-slate-900 text-white p-4 md:p-5 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase text-amber-400 block tracking-wider mb-0.5">
            Tiến độ đánh giá chuyên môn (Barem 100đ)
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white">
              {requiredCount === 0 ? "Chưa cấu hình BGK" : `${confirmedCount} / ${requiredCount} BGK đã xác nhận`}
            </span>
            {requiredCount > 0 && (
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                isCompleted ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}>
                {isCompleted ? "✅ Đã tổng hợp" : "⏳ Đang chấm"}
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-700 text-right w-full md:w-auto">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Điểm Trung Bình BGĐ</span>
          <span className="text-2xl font-black text-emerald-400">
            {requiredCount === 0 ? "Chưa cấu hình BGK" : (isCompleted && averageScore !== null ? `${averageScore} / 100` : "Chưa tổng hợp")}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <IconAlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <IconCheck size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TGĐ / ADMIN JUDGE ASSIGNMENT PANEL */}
      {evalData?.isExecutiveManager && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 rounded-3xl border-2 border-amber-300 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-amber-900 flex items-center gap-2">
                <span>👑 QUẢN LÝ BAN GIÁM KHẢO (CHỈ TGĐ / ADMIN)</span>
              </h3>
              <p className="text-[11px] font-bold text-amber-700">
                Nhập MSNV của nhân sự làm BGK cho bài viết này. Không giới hạn cấp bậc chức danh.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-black self-start sm:self-auto">
              {(evalData?.assignedJudges || []).length} BGK đã gán
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập MSNV (VD: TGĐ-001, PTGĐ-002, 202608001, NV010293)..."
              value={newJudgeEmpCode}
              onChange={(e) => setNewJudgeEmpCode(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={handleAddJudge}
              disabled={assigning || !newJudgeEmpCode.trim()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <IconPlus size={16} />
              <span>Phân Công BGK</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-800">Gợi ý chọn nhanh:</span>
            {[
              { code: "TGĐ-001", label: "TGĐ" },
              { code: "PTGĐ-002", label: "PTGĐ" },
              { code: "GĐ-003", label: "GĐ ĐHSX" },
              { code: "PGĐ-004", label: "P.GĐ Kỹ Thuật" },
              { code: "202608001", label: "Trưởng Phòng CI" },
            ].map((preset) => (
              <button
                key={preset.code}
                type="button"
                onClick={() => setNewJudgeEmpCode(preset.code)}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
              >
                + {preset.label} ({preset.code})
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-black uppercase text-slate-700 block">Danh Sách BGK Được Phân Công:</span>
            {(!evalData?.assignedJudges || evalData.assignedJudges.length === 0) ? (
              <div className="p-4 rounded-2xl bg-white/80 border border-amber-200 text-amber-800 text-xs font-bold text-center">
                ⚠️ Chưa có BGK nào được phân công cho bài này. TGĐ/Admin hãy nhập MSNV ở trên để phân công BGK.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(evalData.assignedJudges || []).map((j: any) => {
                  const isConfirmed = (evalData.evaluations || []).some((e: any) => e.evaluatorEmpCode === j.judge_emp_code && e.status === "CONFIRMED");
                  return (
                    <div key={j.judge_emp_code} className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                          👑
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">{j.judge_name || j.judge_emp_code}</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">{j.judge_emp_code}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 block truncate">{j.judge_title || "Ban Giám Khảo"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isConfirmed ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                            🔒 Đã chấm
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveJudge(j.judge_emp_code)}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            title="Gỡ phân công BGK"
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notice for Non-Assigned BGK */}
      {!evalData?.isAssignedJudge && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold space-y-1">
          <div className="flex items-center gap-2 text-amber-800 font-black">
            <IconAlertTriangle size={18} />
            <span>THÔNG BÁO PHÂN QUYỀN CHẤM ĐIỂM</span>
          </div>
          <p>
            Tài khoản của bạn chưa được phân công làm Ban Giám Khảo cho đề xuất cải tiến này.
          </p>
          {evalData?.isExecutiveManager && (
            <p className="text-emerald-700 font-extrabold">
              💡 Bạn là TGĐ/Admin: Nếu muốn tự chấm điểm bài này, vui lòng nhập MSNV của bản thân vào ô Phân công BGK phía trên.
            </p>
          )}
        </div>
      )}

      {/* FORM CHẤM ĐIỂM DÀNH CHO BGK */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 shadow-2xs space-y-6">
        
        {/* SECTION 1: ĐIỀU KIỆN TIÊN QUYẾT */}
        <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-blue-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-blue-900 tracking-wider">
                ĐIỀU KIỆN TIÊN QUYẾT (PASS/FAIL)
              </span>
              <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold flex items-center justify-center">i</span>
            </div>

            <div>
              {prerequisitePass ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                  <IconCheck size={15} className="text-emerald-600 stroke-[3]" />
                  <span>ĐẠT ĐIỀU KIỆN ➔ Có thể chấm điểm</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-red-100 border border-red-300 text-red-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                  <IconX size={15} className="text-red-600 stroke-[3]" />
                  <span>KHÔNG ĐẠT ĐIỀU KIỆN ➔ Hồ sơ bị loại</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!isAssignedJudge || evalStatus === "CONFIRMED"}
                checked={req1}
                onChange={(e) => setReq1(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>1. Đã triển khai thực tế</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!isAssignedJudge || evalStatus === "CONFIRMED"}
                checked={req2}
                onChange={(e) => setReq2(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>2. Có minh chứng trước - sau</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!isAssignedJudge || evalStatus === "CONFIRMED"}
                checked={req3}
                onChange={(e) => setReq3(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>3. Không vi phạm ATLĐ</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!isAssignedJudge || evalStatus === "CONFIRMED"}
                checked={req4}
                onChange={(e) => setReq4(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span>4. Không trùng lặp</span>
            </label>
          </div>

          <p className="text-[11px] font-bold text-slate-500 pt-1">
            * Không đạt bất kỳ điều kiện nào ở trên ➔ <span className="text-red-600">Loại hồ sơ, không chấm điểm.</span>
          </p>
        </div>

        {/* SECTION 2: BẢNG CHẤM ĐIỂM CHUYÊN MÔN */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            BẢNG CHẤM ĐIỂM CHUYÊN MÔN (Tổng điểm 100)
          </h4>

          <fieldset disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"} className="disabled:opacity-60 space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white w-full">
              <table className="w-full min-w-[860px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase">
                    <th className="py-3 px-2 text-center w-8 border-r border-slate-200">STT</th>
                    <th className="py-3 px-2.5 w-28 border-r border-slate-200">TIÊU CHÍ</th>
                    <th className="py-3 px-2.5 w-32 border-r border-slate-200">MÔ TẢ NGẮN</th>
                    <th className="py-3 px-2 text-center w-16 border-r border-slate-200">ĐIỂM TỐI ĐA</th>
                    <th className="py-3 px-3 border-r border-slate-200">BGK CHỌN ĐIỂM</th>
                    <th className="py-3 px-2 text-center w-16">ĐIỂM BGK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* ROW 1: TIÊU CHÍ 1 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-2 text-center font-extrabold text-blue-600 border-r border-slate-200">1</td>
                    <td className="py-3 px-2.5 font-black text-slate-900 border-r border-slate-200 leading-snug text-[11px]">
                      Hiệu quả thực tế đạt được
                    </td>
                    <td className="py-3 px-2.5 font-medium text-slate-500 border-r border-slate-200 text-[10.5px] leading-tight">
                      Mức độ hiệu quả mang lại (tùy danh mục)
                    </td>
                    <td className="py-3 px-2 text-center font-black text-slate-800 border-r border-slate-200 text-sm">
                      35
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block mb-2">
                        BAREM CHO "{catObj.label.toUpperCase()}" – Tiêu chí 1 ℹ️
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {c1Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-w-[125px] w-full ${
                              c1Score === opt.score
                                ? "border-blue-600 bg-blue-50/80 text-blue-900 font-extrabold shadow-2xs ring-1 ring-blue-500/30"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name="c1"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c1Score === opt.score}
                                onChange={() => setC1Score(opt.score)}
                                className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 shrink-0"
                              />
                              <span className="font-black text-xs">{opt.label}</span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 font-medium leading-snug mt-1.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-black text-base text-blue-700">
                      {c1Score > 0 ? `${c1Score}đ` : "—"}
                    </td>
                  </tr>

                  {/* ROW 2: TIÊU CHÍ 2 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-2 text-center font-extrabold text-emerald-600 border-r border-slate-200">2</td>
                    <td className="py-3 px-2.5 font-black text-slate-900 border-r border-slate-200 leading-snug text-[11px]">
                      Tính khả thi &amp; hiệu quả đầu tư
                    </td>
                    <td className="py-3 px-2.5 font-medium text-slate-500 border-r border-slate-200 text-[10.5px] leading-tight">
                      Chi phí đầu tư so với lợi ích.
                    </td>
                    <td className="py-3 px-2 text-center font-black text-slate-800 border-r border-slate-200 text-sm">
                      20
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {c2Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-w-[125px] w-full ${
                              c2Score === opt.score
                                ? "border-emerald-600 bg-emerald-50/80 text-emerald-900 font-extrabold shadow-2xs ring-1 ring-emerald-500/30"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name="c2"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c2Score === opt.score}
                                onChange={() => setC2Score(opt.score)}
                                className="w-3.5 h-3.5 text-emerald-600 border-slate-300 focus:ring-emerald-500 shrink-0"
                              />
                              <span className="font-black text-xs">{opt.label}</span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 font-medium leading-snug mt-1.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-black text-base text-emerald-700">
                      {c2Score > 0 ? `${c2Score}đ` : "—"}
                    </td>
                  </tr>

                  {/* ROW 3: TIÊU CHÍ 3 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-2 text-center font-extrabold text-purple-600 border-r border-slate-200">3</td>
                    <td className="py-3 px-2.5 font-black text-slate-900 border-r border-slate-200 leading-snug text-[11px]">
                      Khả năng nhân rộng
                    </td>
                    <td className="py-3 px-2.5 font-medium text-slate-500 border-r border-slate-200 text-[10.5px] leading-tight">
                      Mức độ áp dụng cho nhiều vị trí / đơn vị.
                    </td>
                    <td className="py-3 px-2 text-center font-black text-slate-800 border-r border-slate-200 text-sm">
                      20
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {c3Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-w-[125px] w-full ${
                              c3Score === opt.score
                                ? "border-purple-600 bg-purple-50/80 text-purple-900 font-extrabold shadow-2xs ring-1 ring-purple-500/30"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name="c3"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c3Score === opt.score}
                                onChange={() => setC3Score(opt.score)}
                                className="w-3.5 h-3.5 text-purple-600 border-slate-300 focus:ring-purple-500 shrink-0"
                              />
                              <span className="font-black text-xs">{opt.label}</span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 font-medium leading-snug mt-1.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-black text-base text-purple-700">
                      {c3Score > 0 ? `${c3Score}đ` : "—"}
                    </td>
                  </tr>

                  {/* ROW 4: TIÊU CHÍ 4 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-2 text-center font-extrabold text-amber-600 border-r border-slate-200">4</td>
                    <td className="py-3 px-2.5 font-black text-slate-900 border-r border-slate-200 leading-snug text-[11px]">
                      Tính sáng tạo &amp; chủ động
                    </td>
                    <td className="py-3 px-2.5 font-medium text-slate-500 border-r border-slate-200 text-[10.5px] leading-tight">
                      Mức độ sáng tạo và chủ động đề xuất.
                    </td>
                    <td className="py-3 px-2 text-center font-black text-slate-800 border-r border-slate-200 text-sm">
                      15
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {c4Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-w-[125px] w-full ${
                              c4Score === opt.score
                                ? "border-amber-600 bg-amber-50/80 text-amber-900 font-extrabold shadow-2xs ring-1 ring-amber-500/30"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name="c4"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c4Score === opt.score}
                                onChange={() => setC4Score(opt.score)}
                                className="w-3.5 h-3.5 text-amber-600 border-slate-300 focus:ring-amber-500 shrink-0"
                              />
                              <span className="font-black text-xs">{opt.label}</span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 font-medium leading-snug mt-1.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-black text-base text-amber-700">
                      {c4Score > 0 ? `${c4Score}đ` : "—"}
                    </td>
                  </tr>

                  {/* ROW 5: TIÊU CHÍ 5 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-2 text-center font-extrabold text-sky-600 border-r border-slate-200">5</td>
                    <td className="py-3 px-2.5 font-black text-slate-900 border-r border-slate-200 leading-snug text-[11px]">
                      Lan tỏa &amp; tinh thần đội nhóm
                    </td>
                    <td className="py-3 px-2.5 font-medium text-slate-500 border-r border-slate-200 text-[10.5px] leading-tight">
                      Mức độ lan tỏa, hỗ trợ phối hợp.
                    </td>
                    <td className="py-3 px-2 text-center font-black text-slate-800 border-r border-slate-200 text-sm">
                      10
                    </td>
                    <td className="py-3 px-3 border-r border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {c5Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-w-[125px] w-full ${
                              c5Score === opt.score
                                ? "border-sky-600 bg-sky-50/80 text-sky-900 font-extrabold shadow-2xs ring-1 ring-sky-500/30"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name="c5"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c5Score === opt.score}
                                onChange={() => setC5Score(opt.score)}
                                className="w-3.5 h-3.5 text-sky-600 border-slate-300 focus:ring-sky-500 shrink-0"
                              />
                              <span className="font-black text-xs">{opt.label}</span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 font-medium leading-snug mt-1.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-black text-base text-sky-700">
                      {c5Score > 0 ? `${c5Score}đ` : "—"}
                    </td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr className="bg-slate-900 text-white font-black">
                    <td colSpan={3} className="py-3.5 px-4 text-xs uppercase tracking-wider">
                      TỔNG ĐIỂM TỐI ĐA: 100
                    </td>
                    <td colSpan={3} className="py-3.5 px-4 text-right text-sm">
                      TỔNG ĐIỂM BGK: <span className="text-emerald-400 text-xl ml-2">{totalScore} / 100</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </fieldset>
        </div>

        {/* NHẬN XÉT CỦA BGK & ACTION BAR */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <label className="text-xs font-black text-slate-800 block">Nhận xét chuyên môn của sếp (Optional):</label>
          <textarea
            rows={2}
            disabled={!isAssignedJudge || evalStatus === "CONFIRMED"}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Nhập ghi chú ý kiến chỉ đạo hoặc góp ý phát triển cho bài cải tiến..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 disabled:bg-slate-100"
          />

          {!isAssignedJudge ? (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold text-center">
              🔒 Bạn đang mở xem ở chế độ CHỈ ĐỌC (Read-Only). Quyền chấm điểm thuộc về Ban Giám Đốc (P.GĐ trở lên).
            </div>
          ) : evalStatus !== "CONFIRMED" ? (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <IconReload size={15} />
                <span>↺ Xóa điểm</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSubmitScore("SAVE_DRAFT")}
                  className="px-4 py-2.5 rounded-xl bg-white border-2 border-slate-400 hover:bg-slate-100 text-slate-800 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <IconDeviceFloppy size={15} />
                  <span>{saving ? "Đang lưu..." : "💾 Lưu tạm"}</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSubmitScore("CONFIRM")}
                  className="px-6 py-2.5 rounded-xl bg-[#0f2c59] hover:bg-slate-900 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <IconLock size={15} />
                  <span>{saving ? "Đang xử lý..." : "Tiếp tục ➔ Nhận xét"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <IconLock size={18} className="text-emerald-700" />
                <span>Điểm đánh giá của bạn đã được XÁC NHẬN KHÓA VĨNH VIỄN.</span>
              </span>
              <span className="text-[11px] font-extrabold text-emerald-600">CONFIRMED</span>
            </div>
          )}
        </div>
      </div>

      {/* CHI TIẾT ĐIỂM TỪNG BGK */}
      {(isOwner || isExecutiveOrAdmin) && evalData?.evaluations?.length > 0 && (
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
            <IconUserCheck size={16} className="text-emerald-600" />
            <span>Chi Tiết Đánh Giá Từ Ban Giám Khảo ({evalData.evaluations.length} lượt)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evalData.evaluations.map((ev: any, idx: number) => (
              <div key={ev.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      BGK {idx + 1}: {ev.evaluatorName || ev.evaluatorEmpCode}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Chức danh: {ev.evaluatorTitle || "BGK"}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                    {ev.totalScore || 0} / 100 điểm
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-[10px] font-bold text-center">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block">TC1</span>
                    <span className="text-blue-600 font-black">{ev.c1Score || 0}đ</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block">TC2</span>
                    <span className="text-emerald-600 font-black">{ev.c2Score || 0}đ</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block">TC3</span>
                    <span className="text-purple-600 font-black">{ev.c3Score || 0}đ</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block">TC4</span>
                    <span className="text-amber-600 font-black">{ev.c4Score || 0}đ</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block">TC5</span>
                    <span className="text-sky-600 font-black">{ev.c5Score || 0}đ</span>
                  </div>
                </div>

                {ev.comments && (
                  <p className="text-[11px] italic text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    "{ev.comments}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════════
   TAB 3: AWARD REVIEW CONTENT (CHỈ HIỆN VỚI BGK / BAN 2.2 / ADMIN)
   ═══════════════════════════════════════════════════════════════════════════════════ */
function TabAwardReviewContent({
  proposal,
  isJudgeOrExecutive,
  onEvaluate,
}: {
  proposal: KaizenProposal;
  isJudgeOrExecutive: boolean;
  onEvaluate: () => void;
}) {
  return (
    <div className="p-5 md:p-6 space-y-5 text-xs">
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border-2 border-amber-300 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase text-amber-900 flex items-center gap-2">
            <IconTrophy size={20} className="text-amber-600" />
            <span>TRAO GIẢI THƯỞNG THI ĐUA KAIZEN THÁNG</span>
          </h3>
          {proposal.award_title && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs shadow-xs">
              {proposal.award_title}
            </span>
          )}
        </div>

        <p className="text-xs text-amber-800 font-bold leading-relaxed">
          Dành riêng cho Ban Giám Đốc &amp; Ban CI 2.2 thẩm định xếp hạng giải thưởng (Giải Nhất, Nhì, Ba, Khuyến Khích) dựa trên điểm số chuyên môn tổng hợp.
        </p>

        {proposal.award_title ? (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Danh hiệu trao tặng:</span>
            <span className="text-lg font-black text-amber-900 block">{proposal.award_title}</span>
            {(proposal as any).award_note && (
              <p className="text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
                Ghi chú: {(proposal as any).award_note}
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/80 border border-amber-200 text-amber-800 text-xs font-bold text-center">
            Bài viết này hiện chưa được xếp hạng giải thưởng thi đua.
          </div>
        )}

        {isJudgeOrExecutive && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onEvaluate}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <IconAward size={18} />
              <span>{proposal.award_title ? "Chỉnh Sửa Giải Thưởng" : "Quyết Định Trao Giải"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
