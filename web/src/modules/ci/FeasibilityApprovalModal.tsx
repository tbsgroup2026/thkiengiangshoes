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
  onSuccess: (updatedStatus: {
    status: string;
    sub_status: string;
    approval_status: string;
    time_before_seconds?: number;
    time_after_seconds?: number;
    saved_seconds?: number;
    efficiency_value_vnd?: number;
    pair_quantity?: number;
    total_savings_vnd?: number;
  }) => void;
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
  const [timeBefore, setTimeBefore] = useState<number | string>(proposal?.time_before_seconds || 0);
  const [timeAfter, setTimeAfter] = useState<number | string>(proposal?.time_after_seconds || 0);
  const [pairQuantity, setPairQuantity] = useState<number | string>(
    proposal?.pair_quantity || (proposal as any)?.so_luong_giay || (proposal as any)?.quantity || ""
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pairQtyError, setPairQtyError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && proposal) {
      setDecision(initialDecision);
      setNote("");
      setErrorMsg(null);
      setPairQtyError(null);
      
      const pBefore = Number(proposal.time_before_seconds || 0);
      const pAfter = Number(proposal.time_after_seconds || 0);
      const pSaved = Number(proposal.saved_seconds || 0);
      const pQty = Number(proposal.pair_quantity || (proposal as any).so_luong_giay || (proposal as any).quantity || 0);

      if (pBefore > 0 || pAfter > 0) {
        setTimeBefore(pBefore);
        setTimeAfter(pAfter);
      } else if (pSaved > 0) {
        // Automatically pre-fill Before = saved_seconds (e.g. 30s) and After = 0s if only saved_seconds is present
        setTimeBefore(pSaved);
        setTimeAfter(0);
      } else {
        setTimeBefore(0);
        setTimeAfter(0);
      }

      setPairQuantity(pQty > 0 ? pQty : "");
    }
  }, [isOpen, initialDecision, proposal]);

  if (!isOpen || !proposal) return null;

  const rawBefore = Number(timeBefore) || 0;
  const rawAfter = Number(timeAfter) || 0;
  const rawPairQty = Number(pairQuantity) || 0;
  const pSaved = Number(proposal?.saved_seconds || 0);

  let beforeVal = Math.max(0, rawBefore);
  let afterVal = Math.max(0, rawAfter);
  let savedVal = Math.max(0, beforeVal - afterVal);

  // Preserve existing proposal.saved_seconds if input was not manually modified to a custom difference
  if (beforeVal === 0 && afterVal === 0 && pSaved > 0) {
    savedVal = pSaved;
    beforeVal = pSaved;
  }

  const pairQtyVal = Math.max(0, Math.floor(rawPairQty));
  const efficiencyVndVal = Math.round(savedVal * 12.5);
  const totalSavingsVndVal = efficiencyVndVal * pairQtyVal;

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
      setPairQtyError(null);

      if (decision === "APPROVE") {
        let hasErr = false;

        if (beforeVal < 0 || afterVal < 0) {
          setErrorMsg("❌ Thời gian Trước và Sau phải là số không âm!");
          hasErr = true;
        }

        if (!pairQuantity || pairQtyVal < 1) {
          setPairQtyError("Vui lòng nhập số lượng giày (≥ 1)");
          if (!hasErr) {
            setErrorMsg("❌ Vui lòng nhập số lượng giày của đơn hàng!");
          }
          hasErr = true;
        }

        if (hasErr) {
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch("/api/ci-kaizen/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          decision,
          note: note.trim() || (decision === "APPROVE" ? "Đã phê duyệt tính khả thi (Bước 3)" : "Không đạt tính khả thi"),
          timeBeforeSeconds: decision === "APPROVE" ? beforeVal : (proposal.time_before_seconds || 0),
          timeAfterSeconds: decision === "APPROVE" ? afterVal : (proposal.time_after_seconds || 0),
          savedSeconds: decision === "APPROVE" ? savedVal : (proposal.saved_seconds || 0),
          efficiencyValueVND: decision === "APPROVE" ? efficiencyVndVal : 0,
          pairQuantity: decision === "APPROVE" ? pairQtyVal : (proposal.pair_quantity || 0),
          so_luong_giay: decision === "APPROVE" ? pairQtyVal : (proposal.pair_quantity || 0),
          totalSavingsVND: decision === "APPROVE" ? totalSavingsVndVal : 0,
          tong_tien_tiet_kiem: decision === "APPROVE" ? totalSavingsVndVal : 0,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess({
          status: json.status || (decision === "APPROVE" ? "UNDER_REVIEW" : "REJECTED"),
          sub_status: json.sub_status || (decision === "APPROVE" ? "CHO_DANH_GIA" : "TU_CHOI_TRIEN_KHAI"),
          approval_status: json.approval_status || (decision === "APPROVE" ? "PHE_DUYET" : "TU_CHOI"),
          time_before_seconds: json.time_before_seconds !== undefined ? json.time_before_seconds : beforeVal,
          time_after_seconds: json.time_after_seconds !== undefined ? json.time_after_seconds : afterVal,
          saved_seconds: json.saved_seconds !== undefined ? json.saved_seconds : savedVal,
          efficiency_value_vnd: json.efficiency_value_vnd !== undefined ? json.efficiency_value_vnd : efficiencyVndVal,
          pair_quantity: json.pair_quantity !== undefined ? json.pair_quantity : pairQtyVal,
          total_savings_vnd: json.total_savings_vnd !== undefined ? json.total_savings_vnd : totalSavingsVndVal,
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

          {/* NHẬP SỐ LIỆU THỜI GIAN TRƯỚC/SAU KHI PHÊ DUYỆT & SỐ LƯỢNG GIÀY */}
          {decision === "APPROVE" && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>Nhập thời gian thử nghiệm &amp; đánh giá hiệu quả</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  12.5đ / giây
                </span>
              </div>

              {/* HÀNG 3 Ô INPUT: TRƯỚC (GIÂY), SAU (GIÂY), SỐ LƯỢNG GIÀY (ĐÔI) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    TRƯỚC (giây) <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={timeBefore}
                    onChange={(e) => setTimeBefore(e.target.value)}
                    placeholder="VD: 60"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    SAU (giây) <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={timeAfter}
                    onChange={(e) => setTimeAfter(e.target.value)}
                    placeholder="VD: 30"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block truncate" title="SỐ LƯỢNG GIÀY (ĐÔI) *">
                    SỐ LƯỢNG GIÀY (ĐÔI) <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={pairQuantity}
                    onChange={(e) => {
                      setPairQuantity(e.target.value);
                      if (pairQtyError) setPairQtyError(null);
                    }}
                    placeholder="Nhập số đôi giày..."
                    className={`w-full p-2.5 rounded-xl border text-xs font-black text-slate-900 bg-white outline-none focus:ring-1 shadow-2xs ${
                      pairQtyError
                        ? "border-rose-400 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/40"
                        : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                    }`}
                  />
                  {pairQtyError && (
                    <p className="text-[10.5px] font-bold text-rose-600 mt-0.5 animate-in fade-in">
                      {pairQtyError}
                    </p>
                  )}
                </div>
              </div>

              {/* CARDS PREVIEW CỦA HIỆU QUẢ (5 HÀNG CARD REALTIME) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-2xs">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">TRƯỚC</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">{beforeVal}</span>
                  <span className="text-[9px] font-bold text-slate-500 block">giây</span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200 space-y-0.5 shadow-2xs">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">SAU</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">{afterVal}</span>
                  <span className="text-[9px] font-bold text-slate-500 block">giây</span>
                </div>

                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 space-y-0.5 shadow-2xs">
                  <span className="text-[9px] font-extrabold uppercase text-purple-700 block">TIẾT KIỆM</span>
                  <span className="text-xs sm:text-sm font-black text-purple-900 block">{savedVal}s</span>
                  <span className="text-[8.5px] font-bold text-purple-600 block truncate">
                    {beforeVal > 0 ? `${Math.round((savedVal / beforeVal) * 100)}%` : "0%"}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#006838] text-white space-y-0.5 shadow-xs">
                  <span className="text-[9px] font-extrabold uppercase text-emerald-200 block">HIỆU QUẢ</span>
                  <span className="text-xs font-black text-white block truncate" title={`${efficiencyVndVal.toLocaleString("vi-VN")} VNĐ`}>
                    {efficiencyVndVal.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[8.5px] font-bold text-emerald-200 block">VNĐ / đôi</span>
                </div>

                <div className="p-2 rounded-xl bg-[#00522c] text-white space-y-0.5 shadow-sm border border-emerald-500/30 col-span-2 sm:col-span-1">
                  <span className="text-[9px] font-extrabold uppercase text-amber-300 block">TỔNG TIẾT KIỆM</span>
                  <span className="text-xs font-black text-white block truncate" title={`${totalSavingsVndVal.toLocaleString("vi-VN")} VNĐ`}>
                    {totalSavingsVndVal.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[8.5px] font-bold text-emerald-200 block">VNĐ</span>
                </div>
              </div>
            </div>
          )}

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
