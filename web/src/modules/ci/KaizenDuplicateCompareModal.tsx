"use client";

import React, { useState } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconPhoto,
  IconArrowRight,
  IconGitMerge,
  IconPlus,
  IconBuildingFactory,
  IconTag,
  IconUser,
} from "@tabler/icons-react";

interface KaizenDuplicateCompareModalProps {
  newSubmission: {
    title: string;
    proposerName: string;
    factory: string;
    line?: string;
    category: string;
    beforeDescription: string;
    afterSolution: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
    attachments?: Array<{ url: string; tag: "BEFORE" | "AFTER" | "OTHER"; type: "image" | "video" }>;
  };
  matchedMatches: Array<{
    proposal: any;
    similarityPercentage: number;
    matchReason: string;
  }>;
  onConfirmMerge: (originalProposal: any) => Promise<void>;
  onProceedAsNew: () => Promise<void>;
  onClose: () => void;
}

export default function KaizenDuplicateCompareModal({
  newSubmission,
  matchedMatches,
  onConfirmMerge,
  onProceedAsNew,
  onClose,
}: KaizenDuplicateCompareModalProps) {
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const selectedMatch = matchedMatches[selectedMatchIndex] || matchedMatches[0];
  const orig = selectedMatch?.proposal;

  const handleMergeClick = async () => {
    if (!orig) return;
    try {
      setSubmitting(true);
      await onConfirmMerge(orig);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedNewClick = async () => {
    try {
      setSubmitting(true);
      await onProceedAsNew();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col w-full max-w-5xl max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header Alert Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <IconAlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide">
                  ĐỘ TƯƠNG ĐỒNG: {selectedMatch?.similarityPercentage || 80}%
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Phát Hiện Đề Xuất Nghi Vấn Trùng Lặp
                </h3>
              </div>
              <p className="text-xs text-amber-100/90 font-medium mt-0.5">
                Vui lòng so sánh nội dung bên dưới và chọn **Gộp vào đề xuất gốc** hoặc **Vẫn đăng ký mới**
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* If multiple duplicate matches found, show selector tabs */}
        {matchedMatches.length > 1 && (
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2 overflow-x-auto text-xs font-bold shrink-0">
            <span className="text-amber-900 shrink-0 font-extrabold">Các đề xuất nghi trùng:</span>
            {matchedMatches.map((m, idx) => (
              <button
                key={m.proposal.id || idx}
                onClick={() => setSelectedMatchIndex(idx)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedMatchIndex === idx
                    ? "bg-amber-600 text-white font-black shadow-xs"
                    : "bg-white text-slate-700 hover:bg-amber-100 border border-amber-300"
                }`}
              >
                #{idx + 1} {m.proposal.code || m.proposal.title.substring(0, 20)} ({m.similarityPercentage}%)
              </button>
            ))}
          </div>
        )}

        {/* Modal Body: Side-by-side comparison */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT COLUMN: NEW SUBMISSION */}
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-blue-200 space-y-3 relative flex flex-col justify-between">
              <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-blue-600 text-white font-black text-[11px] uppercase tracking-wider shadow-xs">
                ✨ Ý TƯỞNG MỚI ĐANG ĐĂNG KÝ
              </div>

              <div className="pt-2 space-y-2.5">
                <div>
                  <span className="text-[10px] font-black text-slate-400 block uppercase">Người đăng ký</span>
                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <IconUser size={15} className="text-blue-600" />
                    {newSubmission.proposerName || "Công nhân"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                    📍 Khu vực: {newSubmission.factory} {newSubmission.line ? `(${newSubmission.line})` : ""}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-[11px]">
                    🏷️ Category: {newSubmission.category}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-500 block uppercase">Tiêu đề đề xuất</span>
                  <p className="font-black text-slate-900 text-xs leading-snug">
                    {newSubmission.title || "Chưa có tiêu đề"}
                  </p>
                </div>

                {/* Before description */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black text-amber-700 block uppercase">Mô tả TRƯỚC cải tiến:</span>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {newSubmission.beforeDescription || "Trống"}
                  </p>
                </div>

                {/* After solution */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black text-emerald-700 block uppercase">Giải pháp SAU cải tiến:</span>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {newSubmission.afterSolution || "Trống"}
                  </p>
                </div>

                {/* Attachments preview */}
                {(newSubmission.beforeImageUrl || newSubmission.afterImageUrl) && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {newSubmission.beforeImageUrl && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Ảnh TRƯỚC:</span>
                        <img
                          src={newSubmission.beforeImageUrl}
                          alt="Before"
                          className="w-full h-24 object-cover rounded-xl border border-slate-300"
                        />
                      </div>
                    )}
                    {newSubmission.afterImageUrl && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Ảnh SAU:</span>
                        <img
                          src={newSubmission.afterImageUrl}
                          alt="After"
                          className="w-full h-24 object-cover rounded-xl border border-slate-300"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: EXISTING ORIGINAL PROPOSAL IN D1 */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-300 space-y-3 relative flex flex-col justify-between">
              <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-amber-600 text-white font-black text-[11px] uppercase tracking-wider shadow-xs">
                📌 ĐỀ XUẤT ĐÃ TỒN TẠI TRÊN D1 ({orig?.code || "KZ-EXISTING"})
              </div>

              <div className="pt-2 space-y-2.5">
                <div>
                  <span className="text-[10px] font-black text-slate-400 block uppercase">Người đề xuất gốc</span>
                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <IconUser size={15} className="text-amber-600" />
                    {orig?.proposer_name || "Công nhân gốc"} ({orig?.proposer_emp_code || "MSNV"})
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-[11px]">
                    📍 Khu vực: {orig?.factory || orig?.region || "Kiên Giang"} {orig?.line ? `(${orig?.line})` : ""}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-[11px]">
                    🏷️ Status: {orig?.trang_thai || orig?.status || "CHO_DUYET"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-500 block uppercase">Tiêu đề đề xuất gốc</span>
                  <p className="font-black text-slate-900 text-xs leading-snug">
                    {orig?.title}
                  </p>
                </div>

                {/* Before description */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black text-amber-700 block uppercase">Mô tả TRƯỚC cải tiến:</span>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {orig?.before_description || "Trống"}
                  </p>
                </div>

                {/* After solution */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black text-emerald-700 block uppercase">Giải pháp SAU cải tiến:</span>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {orig?.after_solution || "Trống"}
                  </p>
                </div>

                {/* Attachments preview */}
                {(orig?.before_image_url || orig?.after_image_url) && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {orig?.before_image_url && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Ảnh TRƯỚC gốc:</span>
                        <img
                          src={orig.before_image_url}
                          alt="Original Before"
                          className="w-full h-24 object-cover rounded-xl border border-amber-300"
                        />
                      </div>
                    )}
                    {orig?.after_image_url && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Ảnh SAU gốc:</span>
                        <img
                          src={orig.after_image_url}
                          alt="Original After"
                          className="w-full h-24 object-cover rounded-xl border border-amber-300"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] font-medium text-slate-600 italic">
            💡 Gộp đề xuất sẽ lưu toàn bộ ảnh/video đính kèm mới vào đề xuất gốc và tiếp tục qua Giai đoạn 2 sơ duyệt.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleProceedNewClick}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <IconPlus size={16} />
              <span>Vẫn Đăng Ký Mới</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleMergeClick}
              className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <IconGitMerge size={18} />
              <span>Xác Nhận Gộp Vào Đề Xuất Gốc #{orig?.code || ""}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
