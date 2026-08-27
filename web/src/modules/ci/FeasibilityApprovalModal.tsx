"use client";

import React, { useState, useEffect } from "react";
import {
  IconShieldCheck,
  IconX,
  IconCheck,
  IconBuildingWarehouse,
  IconCalendar,
  IconLoader2,
} from "@tabler/icons-react";
import { KaizenProposal } from "./CIModule";

interface FeasibilityApprovalModalProps {
  isOpen: boolean;
  proposal: KaizenProposal | null;
  initialDecision?: "APPROVE" | "REJECT";
  onClose: () => void;
  onSuccess: (updatedStatus: { status: string; sub_status: string; approval_status: string }) => void;
}

export default function FeasibilityApprovalModal({
  isOpen,
  proposal,
  initialDecision = "APPROVE",
  onClose,
  onSuccess,
}: FeasibilityApprovalModalProps) {
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">(initialDecision);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDecision(initialDecision);
      setNote("");
      setErrorMsg(null);
    }
  }, [isOpen, initialDecision]);

  if (!isOpen || !proposal) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "20/05/2024";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 10);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/ci-kaizen/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          decision,
          note: note.trim() || (decision === "APPROVE" ? "Đã phê duyệt tính khả thi (Bước 3)" : "Không đạt tính khả thi"),
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess({
          status: json.status || (decision === "APPROVE" ? "UNDER_REVIEW" : "REJECTED"),
          sub_status: json.sub_status || (decision === "APPROVE" ? "CHO_DANH_GIA" : "TU_CHOI_TRIEN_KHAI"),
          approval_status: json.approval_status || (decision === "APPROVE" ? "PHE_DUYET" : "TU_CHOI"),
        });
        onClose();
      } else {
        setErrorMsg(`❌ ${json.message || "Không thể thực hiện phê duyệt!"}`);
      }
    } catch (err: any) {
      setErrorMsg("❌ Lỗi kết nối máy chủ hoặc mạng!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <IconShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Phê duyệt sáng kiến
              </h2>
              <span className="text-[11px] text-slate-500 font-bold">
                Bước 3: Xem xét tính khả thi (QĐ-TBKG/2026)
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

        {/* BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BADGE MÃ ĐĂNG KÝ */}
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs font-mono inline-flex items-center gap-1">
              Mã đăng ký: {proposal.code || proposal.id}
            </span>
          </div>

          {/* TIÊU ĐỀ & THÔNG TIN ĐỀ XUẤT */}
          <div className="space-y-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Tiêu đề
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-snug">
                {proposal.title}
              </h3>
            </div>

            {/* HÀNG THÔNG TIN 4 CỘT */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              {/* Cột 1: Người đăng ký */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Người đăng ký
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {(proposal as any).avatar_url ? (
                      <img src={(proposal as any).avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (proposal.proposer_name || "U").substring(0, 1)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-xs truncate">
                      {proposal.proposer_name || proposal.proposer_emp_code}
                    </div>
                    <div className="text-[10.5px] text-slate-500 truncate">
                      {proposal.department || proposal.factory || proposal.region || "Phòng Kỹ thuật"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 2: Khu vực */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Khu vực
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 border border-slate-200/80">
                  <IconBuildingWarehouse size={13} className="text-slate-500" />
                  <span>{proposal.region || proposal.factory || "Kiên Giang 1"}</span>
                </span>
              </div>

              {/* Cột 3: Nhóm SP */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Nhóm SP
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs inline-flex items-center gap-1 border border-emerald-200/80">
                  <span>{(proposal as any).product_group || proposal.category_label || proposal.category || "Quai"}</span>
                </span>
              </div>

              {/* Cột 4: Ngày đăng ký */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Ngày đăng ký
                </span>
                <span className="text-slate-700 font-bold text-xs inline-flex items-center gap-1 pt-0.5">
                  <IconCalendar size={14} className="text-slate-400" />
                  <span>{formatDate(proposal.created_at)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* NỘI DUNG TÓM TẮT */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 block">
              Nội dung tóm tắt
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/80 max-h-28 overflow-y-auto">
              {(proposal as any).summary ||
                proposal.after_solution ||
                proposal.before_description ||
                (proposal as any).solution_description ||
                "Đề xuất cải tiến thiết kế jig gá giúp rút ngắn thời gian thay khuôn, giảm thao tác thủ công và sử dụng vật liệu sẵn có, không phát sinh chi phí lớn."}
            </p>
          </div>

          {/* KẾT QUẢ REVIEW (RADIO CARDS) */}
          <div className="space-y-2 pt-1">
            <span className="font-black text-slate-900 text-xs block">
              Kết quả review
            </span>

            <div className="space-y-2">
              {/* Option 1: Phê duyệt triển khai */}
              <label
                onClick={() => setDecision("APPROVE")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  decision === "APPROVE"
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    decision === "APPROVE"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {decision === "APPROVE" && <IconCheck size={12} strokeWidth={3} />}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">
                    Phê duyệt triển khai
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    Sáng kiến đủ điều kiện, chuyển sang trạng thái chờ đánh giá.
                  </div>
                </div>
              </label>

              {/* Option 2: Từ chối triển khai */}
              <label
                onClick={() => setDecision("REJECT")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  decision === "REJECT"
                    ? "border-rose-600 bg-rose-50/80 text-rose-950 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    decision === "REJECT"
                      ? "border-rose-600 bg-rose-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {decision === "REJECT" && <IconX size={12} strokeWidth={3} />}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">
                    Từ chối triển khai
                  </div>
                  <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                    Sáng kiến chưa phù hợp để triển khai.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* GHI CHÚ (KHÔNG BẮT BUỘC) */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 text-xs block">
              Ghi chú (không bắt buộc)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú review..."
                className="w-full p-3 pr-16 rounded-2xl border border-slate-300 text-xs font-medium outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none bg-white"
              />
              <span className="absolute bottom-2.5 right-3 text-[10.5px] font-mono font-bold text-slate-400 pointer-events-none">
                {note.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200/60 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-6 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              decision === "APPROVE"
                ? "bg-[#006838] hover:bg-[#00522c]"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {submitting ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : decision === "APPROVE" ? (
              <>
                <IconCheck size={16} />
                <span>Xác nhận phê duyệt</span>
              </>
            ) : (
              <>
                <IconX size={16} />
                <span>Xác nhận từ chối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
