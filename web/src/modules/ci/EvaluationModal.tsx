"use client";

import React, { useState } from "react";
import {
  IconCheck,
  IconX,
  IconStar,
  IconUser,
  IconMapPin,
  IconTag,
  IconCalendar,
  IconLoader2,
  IconShieldCheck,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";

interface EvaluationModalProps {
  isOpen: boolean;
  proposal: KaizenProposal | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EvaluationModal({
  isOpen,
  proposal,
  onClose,
  onSuccess,
}: EvaluationModalProps) {
  const [scores, setScores] = useState({
    thoi_gian: 0,
    cong_nghe: 0,
    chat_luong: 0,
    s5: 0,
    an_toan: 0,
  });
  const [hoverScores, setHoverScores] = useState({
    thoi_gian: 0,
    cong_nghe: 0,
    chat_luong: 0,
    s5: 0,
    an_toan: 0,
  });

  const [result, setResult] = useState<"DAT" | "KHONG_DAT">("DAT");
  const [proposeThiDua, setProposeThiDua] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !proposal) return null;

  // Calculate Realtime Average
  const validScoresCount = [
    scores.thoi_gian,
    scores.cong_nghe,
    scores.chat_luong,
    scores.s5,
    scores.an_toan,
  ].filter((s) => s > 0).length;

  const totalScoreSum =
    scores.thoi_gian +
    scores.cong_nghe +
    scores.chat_luong +
    scores.s5 +
    scores.an_toan;

  const avgScore =
    validScoresCount === 5 ? (totalScoreSum / 5).toFixed(1) : "0.0";

  const handleStarClick = (criterion: keyof typeof scores, star: number) => {
    setScores((prev) => ({ ...prev, [criterion]: star }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validScoresCount < 5) {
      setErrorMsg("⚠️ Vui lòng đánh giá đủ số sao (1-5 sao) cho tất cả 5 tiêu chí trước khi xác nhận!");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/ci-kaizen/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          scores: {
            thoi_gian: scores.thoi_gian,
            cong_nghe: scores.cong_nghe,
            chat_luong: scores.chat_luong,
            "5s": scores.s5,
            an_toan: scores.an_toan,
          },
          result,
          propose_thi_dua: result === "DAT" ? proposeThiDua : false,
          note: note.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(`❌ ${json.message || "Không thể lưu kết quả đánh giá!"}`);
      }
    } catch (err: any) {
      setErrorMsg("❌ Lỗi kết nối mạng hoặc máy chủ D1!");
    } finally {
      setSubmitting(false);
    }
  };

  const criteriaList: Array<{
    key: keyof typeof scores;
    label: string;
    icon: string;
  }> = [
    { key: "thoi_gian", label: "Thời gian", icon: "⏱️" },
    { key: "cong_nghe", label: "Công nghệ", icon: "⚙️" },
    { key: "chat_luong", label: "Chất lượng", icon: "🎯" },
    { key: "s5", label: "5S", icon: "✨" },
    { key: "an_toan", label: "An toàn lao động", icon: "🛡️" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006838] flex items-center justify-center shadow-xs font-bold">
              <IconShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Đánh giá hiệu quả sáng kiến
              </h2>
              <span className="text-[11px] text-slate-500 font-bold">
                Bước 5: Đánh giá kết quả sau thử nghiệm (QĐ-TBKG/2026)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PROPOSAL INFO CARD */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-black text-[11px] font-mono">
                Mã đăng ký: {proposal.code || proposal.id}
              </span>
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <IconCalendar size={13} />
                {proposal.created_at ? proposal.created_at.substring(0, 10) : "Mới nộp"}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-900 leading-snug">
                Tiêu đề: {proposal.title}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10.5px] pt-1 border-t border-slate-200/60">
              <div>
                <span className="text-slate-400 block font-medium">Người đăng ký</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <IconUser size={12} className="text-slate-400 shrink-0" />
                  {proposal.proposer_name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Khu vực</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <IconMapPin size={12} className="text-slate-400 shrink-0" />
                  {proposal.region || proposal.factory || "KG 1"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Phân loại</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                  <IconTag size={12} className="text-slate-400 shrink-0" />
                  {proposal.category_label || proposal.category}
                </span>
              </div>
            </div>

            {(proposal.before_description || proposal.after_solution) && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10.5px] font-black text-slate-500 block mb-0.5">
                  Nội dung tóm tắt:
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2 bg-white p-2 rounded-xl border border-slate-200/60">
                  {proposal.after_solution || proposal.before_description}
                </p>
              </div>
            )}
          </div>

          {/* 5 CRITERIA RATING PANEL */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                ── Tiêu chí đánh giá hiệu quả (Hội đồng) ──
              </span>
              <span className="text-xs font-black bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded-full">
                Điểm TB: <strong className="text-[#006838] text-sm">{avgScore}</strong> / 5
              </span>
            </div>

            <div className="space-y-2.5">
              {criteriaList.map((item) => {
                const currentScore = scores[item.key];
                const hoverScore = hoverScores[item.key];
                const activeVal = hoverScore || currentScore;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-100 shadow-2xs"
                  >
                    <span className="font-bold text-slate-800 text-[11.5px] flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(item.key, star)}
                          onMouseEnter={() =>
                            setHoverScores((prev) => ({ ...prev, [item.key]: star }))
                          }
                          onMouseLeave={() =>
                            setHoverScores((prev) => ({ ...prev, [item.key]: 0 }))
                          }
                          className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                        >
                          <IconStar
                            size={18}
                            className={
                              star <= activeVal
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      ))}
                      <span className="text-[10px] font-black text-slate-400 w-8 text-right ml-1">
                        ({currentScore}/5)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EVALUATION RESULT OPTIONS */}
          <div className="space-y-2">
            <span className="font-black text-slate-900 text-xs block">
              Kết quả đánh giá <span className="text-rose-600">*</span>
            </span>

            <div className="space-y-2">
              <label
                onClick={() => setResult("DAT")}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  result === "DAT"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="evalResult"
                  value="DAT"
                  checked={result === "DAT"}
                  onChange={() => setResult("DAT")}
                  className="mt-0.5 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-black text-xs block">◉ Đạt yêu cầu</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Ghi nhận vào báo cáo, đủ điều kiện chuyển Lưu trữ.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setResult("KHONG_DAT")}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  result === "KHONG_DAT"
                    ? "border-rose-600 bg-rose-50/70 text-rose-950 shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="evalResult"
                  value="KHONG_DAT"
                  checked={result === "KHONG_DAT"}
                  onChange={() => setResult("KHONG_DAT")}
                  className="mt-0.5 text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                />
                <div>
                  <span className="font-black text-xs block">○ Không đạt yêu cầu</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Phản hồi tác giả & cảm ơn, DỪNG quy trình theo quy định.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* CHECKBOX PROPOSE THI ĐUA */}
          <div className="pt-1">
            <label
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                result !== "DAT"
                  ? "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
                  : proposeThiDua
                  ? "bg-amber-50 border-amber-300 text-amber-950 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <input
                type="checkbox"
                disabled={result !== "DAT"}
                checked={proposeThiDua && result === "DAT"}
                onChange={(e) => setProposeThiDua(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="text-xs">
                <span className="font-black block">
                  ☐ Đề xuất đưa vào danh sách Thi đua
                </span>
                <span className="text-[10.5px] text-slate-500 font-medium block">
                  (Đánh dấu là ứng viên để Hội đồng / BGĐ xem xét gắn nhãn Thi đua chính thức)
                </span>
              </div>
            </label>
          </div>

          {/* NOTE TEXTAREA */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 text-xs">
                Ghi chú đánh giá (không bắt buộc)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {note.length}/300
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ý kiến đánh giá của Hội đồng..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none bg-white"
            />
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200/60 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <IconCheck size={16} />
                <span>Xác nhận đánh giá</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
