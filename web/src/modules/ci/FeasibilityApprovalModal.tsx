"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconShieldCheck,
  IconX,
  IconCheck,
  IconBuildingWarehouse,
  IconCalendar,
  IconLoader2,
  IconPhoto,
  IconVideo,
  IconPlus,
  IconUpload,
  IconTrash,
} from "@tabler/icons-react";
import { convertNumberToWords } from "@/lib/numberToWords";
import { KaizenProposal, CATEGORIES } from "./CIModule";
import { normalizeCategoryId, KaizenMediaLightbox, MediaItem } from "./kaizenMediaUtils";

interface FeasibilityApprovalModalProps {
  isOpen: boolean;
  proposal: KaizenProposal | null;
  initialDecision?: "APPROVE" | "REJECT";
  onClose: () => void;
  onSuccess: (updatedStatus: {
    status: string;
    sub_status: string;
    approval_status: string;
    category?: string;
    time_before_seconds?: number;
    time_after_seconds?: number;
    saved_seconds?: number;
    efficiency_value_vnd?: number;
    pair_quantity?: number;
    total_savings_vnd?: number;
    total_savings_words?: string;
    cost_before?: number;
    cost_after?: number;
    after_image_url?: string;
    approved_at?: string;
    proposer_month?: number;
    proposer_year?: number;
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
  const [editedCategory, setEditedCategory] = useState<string>(
    normalizeCategoryId(proposal?.category || proposal?.category_label || (proposal as any)?.product_group)
  );
  const [timeBefore, setTimeBefore] = useState<number | string>(proposal?.time_before_seconds || 0);
  const [timeAfter, setTimeAfter] = useState<number | string>(proposal?.time_after_seconds || 0);
  const [pairQuantity, setPairQuantity] = useState<number | string>(
    proposal?.pair_quantity || (proposal as any)?.so_luong_giay || (proposal as any)?.quantity || ""
  );
  const [directSavingsVnd, setDirectSavingsVnd] = useState<number | string>(
    proposal?.total_savings_vnd || (proposal as any)?.tong_tien_tiet_kiem || ""
  );
  const [costBefore, setCostBefore] = useState<number | string>(
    (proposal as any)?.cost_before || (proposal as any)?.chi_phi_truoc || ""
  );
  const [costAfter, setCostAfter] = useState<number | string>(
    (proposal as any)?.cost_after || (proposal as any)?.chi_phi_sau || ""
  );
  const [afterMediaList, setAfterMediaList] = useState<{ id: string; type: "image" | "video"; url: string; name?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Ảnh/video TRƯỚC do người đăng ký gửi lên — có thể nhiều ảnh gộp chuỗi "url1,url2,..."
  const beforeMediaUrls = React.useMemo(
    () => (proposal?.before_image_url || "").split(",").map((s) => s.trim()).filter(Boolean),
    [proposal?.before_image_url]
  );

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pairQtyError, setPairQtyError] = useState<string | null>(null);

  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; items: MediaItem[]; index: number }>({
    isOpen: false,
    items: [],
    index: 0,
  });

  // ⚡ Determine Category Mode dynamically from selected Category
  const categoryMode = React.useMemo(() => {
    if (!proposal) return "PRODUCTIVITY_TIME";

    const matchedCat = CATEGORIES.find((c) => c.id === editedCategory || c.label === editedCategory);
    const catStr = matchedCat
      ? matchedCat.label
      : String(proposal.category_label || proposal.category || (proposal as any).product_group || "");
    const cat = catStr.toLowerCase();

    // 1. Tiết kiệm Vật tư
    if (cat.includes("1.") || cat.includes("vật tư") || cat.includes("vat tu") || editedCategory === "SAVE_MATERIAL") {
      return "MATERIAL_SAVINGS";
    }
    // 2. Tiết kiệm Chi phí
    if (cat.includes("2.") || cat.includes("chi phí") || cat.includes("chi phi") || cat.includes("tài chính") || editedCategory === "SAVE_COST") {
      return "COST_SAVINGS";
    }
    // 3. Tăng Năng suất (Dạng có thời gian & số lượng đôi)
    if (cat.includes("3.") || cat.includes("năng suất") || cat.includes("nang suat") || cat.includes("thời gian") || editedCategory === "INCREASE_PRODUCTIVITY") {
      return "PRODUCTIVITY_TIME";
    }

    // 4. An toàn lao động, 5. 5S, 6. Tự động hoá, 7. MMTB CCDC -> Non-financial
    return "NON_FINANCIAL";
  }, [editedCategory, proposal]);

  useEffect(() => {
    if (isOpen && proposal) {
      setDecision(initialDecision);
      setNote("");
      setErrorMsg(null);
      setPairQtyError(null);
      setEditedCategory(
        normalizeCategoryId(proposal.category || proposal.category_label || (proposal as any).product_group || proposal.title)
      );
      setNote("");
      setErrorMsg(null);
      setPairQtyError(null);
      setDirectSavingsVnd(proposal.total_savings_vnd || (proposal as any).tong_tien_tiet_kiem || "");
      setCostBefore((proposal as any).cost_before || (proposal as any).chi_phi_truoc || "");
      setCostAfter((proposal as any).cost_after || (proposal as any).chi_phi_sau || "");
      
      const pBefore = Number(proposal.time_before_seconds || 0);
      const pAfter = Number(proposal.time_after_seconds || 0);
      const pSaved = Number(proposal.saved_seconds || 0);
      const pQty = Number(proposal.pair_quantity || (proposal as any).so_luong_giay || (proposal as any).quantity || 0);

      if (pBefore > 0 || pAfter > 0) {
        setTimeBefore(pBefore);
        setTimeAfter(pAfter);
      } else if (pSaved > 0) {
        setTimeBefore(pSaved);
        setTimeAfter(0);
      } else {
        setTimeBefore(0);
        setTimeAfter(0);
      }

      setPairQuantity(pQty > 0 ? pQty : "");

      // Initialize media after improvement (strictly filter out before_image_url)
      let initialMedia: { id: string; type: "image" | "video"; url: string }[] = [];
      const beforeUrl = proposal.before_image_url ? proposal.before_image_url.trim() : "";

      if (proposal.after_image_url) {
        const urls = proposal.after_image_url.split(",").map((s) => s.trim()).filter(Boolean);
        urls.forEach((u, idx) => {
          if (u !== beforeUrl) {
            const isVid = u.endsWith(".mp4") || u.endsWith(".mov") || u.endsWith(".webm") || u.startsWith("data:video");
            initialMedia.push({ id: `existing-after-${idx}`, type: isVid ? "video" : "image", url: u });
          }
        });
      }
      if (proposal.attachments_json) {
        try {
          const parsed = JSON.parse(proposal.attachments_json);
          if (Array.isArray(parsed)) {
            parsed.forEach((u: string, idx: number) => {
              if (typeof u === "string" && u !== beforeUrl && !initialMedia.some((m) => m.url === u)) {
                const isVid = u.endsWith(".mp4") || u.endsWith(".mov") || u.endsWith(".webm") || u.startsWith("data:video");
                initialMedia.push({ id: `att-${idx}`, type: isVid ? "video" : "image", url: u });
              }
            });
          }
        } catch {}
      }
      setAfterMediaList(initialMedia);
    }
  }, [isOpen, initialDecision, proposal]);

  const handleAddMediaFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isVid = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".webm");
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          setAfterMediaList((prev) => [
            ...prev,
            { id: `${Date.now()}-${Math.random()}`, type: isVid ? "video" : "image", url, name: file.name },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveMedia = (id: string) => {
    setAfterMediaList((prev) => prev.filter((m) => m.id !== id));
  };
  const { beforeVal, afterVal, savedVal, pairQtyVal, efficiencyVndVal, totalSavingsVndVal, autoCostBefore, autoCostAfter, autoTotalSavings } = React.useMemo(() => {
    const rawBefore = Number(timeBefore) || 0;
    const rawAfter = Number(timeAfter) || 0;
    const rawPairQty = Number(pairQuantity) || 0;
    const pSaved = Number(proposal?.saved_seconds || 0);

    let bVal = Math.max(0, rawBefore);
    let aVal = Math.max(0, rawAfter);
    let sVal = Math.max(0, bVal - aVal);

    if (bVal === 0 && aVal === 0 && pSaved > 0) {
      sVal = pSaved;
      bVal = pSaved;
    }

    const pQtyVal = Math.max(0, Math.floor(rawPairQty));
    const effVndVal = Math.round(sVal * 12.5);
    const totSavingsVndVal = pQtyVal > 0 ? effVndVal * pQtyVal : effVndVal;

    // Tự động tính Chi phí trước & Chi phí sau theo định mức 12.5đ / giây
    const multiplier = pQtyVal > 0 ? pQtyVal : 1;
    const calcCostBefore = Math.round(bVal * 12.5 * multiplier);
    const calcCostAfter = Math.round(aVal * 12.5 * multiplier);
    const calcTotalSavings = Math.max(0, calcCostBefore - calcCostAfter);

    return {
      beforeVal: bVal,
      afterVal: aVal,
      savedVal: sVal,
      pairQtyVal: pQtyVal,
      efficiencyVndVal: effVndVal,
      totalSavingsVndVal: totSavingsVndVal,
      autoCostBefore: calcCostBefore,
      autoCostAfter: calcCostAfter,
      autoTotalSavings: calcTotalSavings,
    };
  }, [timeBefore, timeAfter, pairQuantity, proposal?.saved_seconds]);

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
      setPairQtyError(null);

      if (decision === "APPROVE") {
        let hasErr = false;

        if (categoryMode === "PRODUCTIVITY_TIME") {
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
        } else if (categoryMode === "MATERIAL_SAVINGS" || categoryMode === "COST_SAVINGS") {
          if (!directSavingsVnd || Number(directSavingsVnd) <= 0) {
            setErrorMsg("❌ Vui lòng nhập số tiền tiết kiệm chi phí/vật tư!");
            hasErr = true;
          }
        }

        if (hasErr) {
          setSubmitting(false);
          return;
        }
      }

      const isProdTime = categoryMode === "PRODUCTIVITY_TIME";
      const isDirectCost = categoryMode === "MATERIAL_SAVINGS" || categoryMode === "COST_SAVINGS";
      const finalCostBefore = costBefore !== "" ? Number(costBefore) || 0 : autoCostBefore;
      const finalCostAfter = costAfter !== "" ? Number(costAfter) || 0 : autoCostAfter;
      const finalTotalSavings = directSavingsVnd !== ""
        ? Number(directSavingsVnd) || 0
        : (costBefore !== "" || costAfter !== "")
        ? Math.max(0, finalCostBefore - finalCostAfter)
        : autoTotalSavings > 0
        ? autoTotalSavings
        : totalSavingsVndVal;
      const savingsInWords = convertNumberToWords(finalTotalSavings);

      const mediaUrls = afterMediaList.map((m) => m.url);
      const afterImgUrlStr = mediaUrls.length > 0 ? mediaUrls[0] : "";
      const attachmentsJsonStr = JSON.stringify(mediaUrls);

      const tokenCookie = typeof document !== "undefined"
        ? document.cookie.split("; ").find((row) => row.startsWith("tbs_token="))
        : null;
      const token = tokenCookie ? tokenCookie.split("=")[1] : "";

      const res = await fetch("/api/ci-kaizen/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          proposalId: proposal.id,
          decision,
          category: editedCategory,
          note: note.trim() || (decision === "APPROVE" ? "Đã phê duyệt tính khả thi (Bước 3)" : "Không đạt tính khả thi"),
          timeBeforeSeconds: categoryMode === "PRODUCTIVITY_TIME" && decision === "APPROVE" ? beforeVal : 0,
          timeAfterSeconds: categoryMode === "PRODUCTIVITY_TIME" && decision === "APPROVE" ? afterVal : 0,
          savedSeconds: categoryMode === "PRODUCTIVITY_TIME" && decision === "APPROVE" ? savedVal : 0,
          efficiencyValueVND: categoryMode === "PRODUCTIVITY_TIME" && decision === "APPROVE" ? efficiencyVndVal : 0,
          pairQuantity: categoryMode === "PRODUCTIVITY_TIME" && decision === "APPROVE" ? pairQtyVal : 1,
          so_luong_giay: categoryMode === "PRODUCTIVITY_TIME" && decision === "APPROVE" ? pairQtyVal : 1,
          totalSavingsVND: decision === "APPROVE" ? finalTotalSavings : 0,
          tong_tien_tiet_kiem: decision === "APPROVE" ? finalTotalSavings : 0,
          totalSavingsWords: decision === "APPROVE" ? savingsInWords : "",
          tong_tien_bang_chu: decision === "APPROVE" ? savingsInWords : "",
          costBefore: finalCostBefore,
          costAfter: finalCostAfter,
          cost_before: finalCostBefore,
          cost_after: finalCostAfter,
          after_image_url: afterImgUrlStr,
          attachments_json: attachmentsJsonStr,
        }),
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch (e) {
        json = { success: false, message: `Lỗi kết nối máy chủ (HTTP ${res.status})` };
      }

      if (res.ok && json.success) {
        onSuccess({
          status: json.status || (decision === "APPROVE" ? "UNDER_REVIEW" : "REJECTED"),
          sub_status: json.sub_status || (decision === "APPROVE" ? "CHO_DANH_GIA" : "TU_CHOI_TRIEN_KHAI"),
          approval_status: json.approval_status || (decision === "APPROVE" ? "PHE_DUYET" : "TU_CHOI"),
          category: editedCategory,
          time_before_seconds: json.time_before_seconds !== undefined ? json.time_before_seconds : (isProdTime ? beforeVal : 0),
          time_after_seconds: json.time_after_seconds !== undefined ? json.time_after_seconds : (isProdTime ? afterVal : 0),
          saved_seconds: json.saved_seconds !== undefined ? json.saved_seconds : (isProdTime ? savedVal : 0),
          efficiency_value_vnd: json.efficiency_value_vnd !== undefined ? json.efficiency_value_vnd : (isProdTime ? efficiencyVndVal : 0),
          pair_quantity: json.pair_quantity !== undefined ? json.pair_quantity : (isProdTime ? pairQtyVal : (isDirectCost ? 1 : 0)),
          total_savings_vnd: json.total_savings_vnd !== undefined ? json.total_savings_vnd : finalTotalSavings,
          total_savings_words: json.total_savings_words !== undefined ? json.total_savings_words : savingsInWords,
          after_image_url: afterImgUrlStr,
          approved_at: json.approved_at || (decision === "APPROVE" ? new Date().toISOString() : undefined),
          proposer_month: json.proposer_month || (decision === "APPROVE" ? new Date().getMonth() + 1 : undefined),
          proposer_year: json.proposer_year || (decision === "APPROVE" ? new Date().getFullYear() : undefined),
        });
        onClose();
      } else {
        setErrorMsg(`❌ ${json.message || json.error || "Không thể thực hiện phê duyệt!"}`);
      }
    } catch (err: any) {
      setErrorMsg("❌ Lỗi kết nối máy chủ hoặc mạng!");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !proposal) return null;

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

              {/* Cột 3: Phân loại (Người duyệt có thể chọn lại tag này) */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Phân loại
                </span>
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs w-full max-w-[170px]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
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

          {/* HÌNH ẢNH / VIDEO TRƯỚC CẢI TIẾN (CỐ ĐỊNH TỪ NGƯỜI ĐĂNG KÝ - KHÔNG ĐƯỢC XÓA) */}
          {/* Có thể có NHIỀU ảnh, lưu gộp chuỗi "url1,url2,..." — tách ra để hiện đủ, không chỉ 1 ảnh */}
          {beforeMediaUrls.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <IconPhoto size={14} className="text-slate-500" />
                <span>Ảnh / Video Trước Cải Tiến (Cố định từ người đăng ký)</span>
              </span>
              <div className="flex gap-2 flex-wrap">
                {beforeMediaUrls.map((u, idx) => (
                  <div
                    key={u}
                    onClick={() =>
                      setLightboxState({
                        isOpen: true,
                        items: beforeMediaUrls.map((m, i) => ({
                          type: m.endsWith(".mp4") || m.endsWith(".mov") || m.startsWith("data:video") ? "video" : "image",
                          url: m,
                          title: `Ảnh/Video Trước #${i + 1}`,
                        })),
                        index: idx,
                      })
                    }
                    className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 w-24 h-24 shadow-2xs cursor-pointer group"
                  >
                    {u.endsWith(".mp4") || u.endsWith(".mov") || u.startsWith("data:video") ? (
                      <video src={u} className="w-full h-full object-cover" />
                    ) : (
                      <img src={u} alt={`Trước Cải Tiến ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono font-bold backdrop-blur-xs">
                      🔒 Trước
                    </span>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                      🔍 Phóng to
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HÌNH ẢNH / VIDEO SAU CẢI TIẾN (NHIỀU ẢNH & VIDEO - CHO PHÉP TẢI / SỬA / XÓA) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <IconPhoto size={14} className="text-emerald-600" />
                <span>Hình ảnh (nhiều ảnh) / Video Sau Cải Tiến</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200 font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <IconPlus size={13} />
                <span>Thêm ảnh / video</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAddMediaFiles}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />

            {/* THUMBNAILS GRID PREVIEW (ĐƯỢC PHÉP XÓA ẢNH SAU CẢI TIẾN) */}
            {afterMediaList.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {afterMediaList.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      setLightboxState({
                        isOpen: true,
                        items: afterMediaList.map((m) => ({
                          type: m.type as "image" | "video",
                          url: m.url,
                          title: "Sau Cải Tiến",
                        })),
                        index: idx,
                      })
                    }
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square shadow-2xs cursor-pointer"
                  >
                    {item.type === "video" ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt="Sau Cải Tiến" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}

                    {/* Badge type */}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold backdrop-blur-xs">
                      {item.type === "video" ? "📹 Video" : "📷 Sau Cải Tiến"}
                    </span>

                    {/* Nút Xóa CHỈ ĐÀNH CHO ẢNH SAU CẢI TIẾN */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(item.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
                      title="Xóa ảnh Sau Cải Tiến"
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500/50 bg-slate-50/50 hover:bg-emerald-50/20 text-center cursor-pointer transition-colors space-y-1"
              >
                <div className="flex justify-center text-slate-400">
                  <IconUpload size={20} />
                </div>
                <p className="text-[11px] font-extrabold text-slate-600">
                  Chưa có ảnh/video Sau cải tiến
                </p>
                <p className="text-[10px] text-slate-400">
                  Bấm vào đây để tải lên nhiều hình ảnh hoặc video minh chứng Sau khi Cải tiến
                </p>
              </div>
            )}
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

          {/* NHẬP SỐ LIỆU ĐÁNH GIÁ TÍNH KHẢ THI THEO THỂ LOẠI (7 TIÊU CHÍ KAIZEN) */}
          {decision === "APPROVE" && (
            <>
              {/* MODE 1: Category 3 - 3.Tăng Năng Suất (Có nhập thời gian & số lượng đôi) */}
              {categoryMode === "PRODUCTIVITY_TIME" && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                      <span>⏱️</span>
                      <span>Nhập thời gian thử nghiệm &amp; đánh giá hiệu quả (3. Tăng Năng suất)</span>
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

                  {/* HÀNG 2 Ô INPUT BỔ SUNG CHI PHÍ: CHI PHÍ TRƯỚC (VNĐ) & CHI PHÍ SAU (VNĐ) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-emerald-200/60">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        💵 CHI PHÍ TRƯỚC (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={costBefore}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCostBefore(val);
                          const cb = Number(val) || 0;
                          const ca = Number(costAfter) || 0;
                          if (cb > 0 || ca > 0) {
                            setDirectSavingsVnd(Math.max(0, cb - ca));
                          }
                        }}
                        placeholder="VD: 10,000,000"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        💵 CHI PHÍ SAU (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={costAfter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCostAfter(val);
                          const cb = Number(costBefore) || 0;
                          const ca = Number(val) || 0;
                          if (cb > 0 || ca > 0) {
                            setDirectSavingsVnd(Math.max(0, cb - ca));
                          }
                        }}
                        placeholder="VD: 5,000,000"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* TỔNG SỐ TIỀN TIẾT KIỆM ĐƯỢC (VNĐ) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      💰 TỔNG SỐ TIỀN TIẾT KIỆM ĐƯỢC (VNĐ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1000"
                      value={directSavingsVnd !== "" ? directSavingsVnd : (totalSavingsVndVal > 0 ? totalSavingsVndVal : "")}
                      onChange={(e) => setDirectSavingsVnd(e.target.value)}
                      placeholder="Nhập hoặc tính tự động từ thời gian & đôi..."
                      className="w-full p-2.5 rounded-xl border border-emerald-400 text-sm font-black text-emerald-950 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                    />
                  </div>

                  {/* CARDS PREVIEW CỦA HIỆU QUẢ */}
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
                      <span className="text-xs font-black text-white block truncate" title={`${(Number(directSavingsVnd) || totalSavingsVndVal).toLocaleString("vi-VN")} VNĐ`}>
                        {(Number(directSavingsVnd) || totalSavingsVndVal).toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[8.5px] font-bold text-emerald-200 block">VNĐ</span>
                    </div>
                  </div>

                  {/* DÒNG HIỂN THỊ SỐ TIỀN BẰNG CHỮ */}
                  <div className="pt-2 border-t border-emerald-200/80 text-left">
                    <div className="text-[11.5px] font-bold text-slate-700 flex items-start sm:items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 not-italic shrink-0">Bằng chữ:</span>
                      <span className="italic text-emerald-950 font-semibold bg-white/90 px-2.5 py-0.5 rounded-lg border border-emerald-300/80 shadow-2xs leading-relaxed text-xs">
                        "{convertNumberToWords(Number(directSavingsVnd) || totalSavingsVndVal)}"
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: Category 1 & Category 2 - 1.Tiết kiệm Vật tư / 2.Tiết kiệm Chi phí */}
              {(categoryMode === "MATERIAL_SAVINGS" || categoryMode === "COST_SAVINGS") && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                      <span>💰</span>
                      <span>
                        Nhập chi phí &amp; đánh giá tiết kiệm ({categoryMode === "MATERIAL_SAVINGS" ? "1. Tiết kiệm Vật tư" : "2. Tiết kiệm Chi phí"})
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                      Tiết kiệm trực tiếp
                    </span>
                  </div>

                  {/* HÀNG 2 Ô INPUT: CHI PHÍ TRƯỚC (VNĐ) & CHI PHÍ SAU (VNĐ) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        CHI PHÍ TRƯỚC (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={costBefore}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCostBefore(val);
                          const cb = Number(val) || 0;
                          const ca = Number(costAfter) || 0;
                          if (cb > 0 || ca > 0) {
                            setDirectSavingsVnd(Math.max(0, cb - ca));
                          }
                        }}
                        placeholder="VD: 10,000,000"
                        className="w-full p-2.5 rounded-xl border border-amber-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        CHI PHÍ SAU (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={costAfter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCostAfter(val);
                          const cb = Number(costBefore) || 0;
                          const ca = Number(val) || 0;
                          if (cb > 0 || ca > 0) {
                            setDirectSavingsVnd(Math.max(0, cb - ca));
                          }
                        }}
                        placeholder="VD: 5,000,000"
                        className="w-full p-2.5 rounded-xl border border-amber-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      TỔNG SỐ TIỀN TIẾT KIỆM ĐƯỢC (VNĐ) <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1000"
                      value={directSavingsVnd}
                      onChange={(e) => setDirectSavingsVnd(e.target.value)}
                      placeholder="Nhập số tiền tiết kiệm... VD: 5000000"
                      className="w-full p-2.5 rounded-xl border border-amber-400 text-sm font-black text-amber-950 bg-white outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-2xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-amber-200/80 text-left">
                    <div className="text-[11.5px] font-bold text-slate-700 flex items-start sm:items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 not-italic shrink-0">Bằng chữ:</span>
                      <span className="italic text-amber-950 font-semibold bg-white/90 px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs leading-relaxed text-xs">
                        "{convertNumberToWords(Number(directSavingsVnd) || 0)}"
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 3: Categories 4, 5, 6, 7 - An toàn lao động, 5S, Tự động hoá, MMTB CCDC (Không bắt buộc có thời gian/số tiền) */}
              {categoryMode === "NON_FINANCIAL" && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                    <span className="text-sm">🛡️</span>
                    <span>
                      Đánh giá Phê duyệt Tính Khả thi ({proposal.category_label || proposal.category || "Cải tiến Quy trình"})
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-blue-200">
                    💡 Cải tiến thuộc nhóm <strong>{(proposal as any).product_group || proposal.category_label || proposal.category}</strong> (tập trung cải thiện môi trường làm việc, an toàn lao động, chuẩn hóa 5S, tự động hóa hoặc thiết bị MMTB CCDC).
                  </p>

                  {/* HÀNG 2 Ô INPUT: CHI PHÍ TRƯỚC (VNĐ) & CHI PHÍ SAU (VNĐ) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-blue-200/60">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        💵 CHI PHÍ TRƯỚC (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={costBefore}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCostBefore(val);
                          const cb = Number(val) || 0;
                          const ca = Number(costAfter) || 0;
                          if (cb > 0 || ca > 0) {
                            setDirectSavingsVnd(Math.max(0, cb - ca));
                          }
                        }}
                        placeholder="VD: 10,000,000"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        💵 CHI PHÍ SAU (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1000"
                        value={costAfter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCostAfter(val);
                          const cb = Number(costBefore) || 0;
                          const ca = Number(val) || 0;
                          if (cb > 0 || ca > 0) {
                            setDirectSavingsVnd(Math.max(0, cb - ca));
                          }
                        }}
                        placeholder="VD: 5,000,000"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-900 bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      💰 TỔNG SỐ TIỀN TIẾT KIỆM ĐƯỢC (VNĐ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1000"
                      value={directSavingsVnd}
                      onChange={(e) => setDirectSavingsVnd(e.target.value)}
                      placeholder="Nhập số tiền tiết kiệm (nếu có)..."
                      className="w-full p-2.5 rounded-xl border border-blue-300 text-sm font-black text-blue-950 bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                    />
                  </div>

                  {directSavingsVnd !== "" && Number(directSavingsVnd) > 0 && (
                    <div className="pt-2 border-t border-blue-200/80 text-left">
                      <div className="text-[11.5px] font-bold text-slate-700 flex items-start sm:items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 not-italic shrink-0">Bằng chữ:</span>
                        <span className="italic text-blue-950 font-semibold bg-white/90 px-2.5 py-0.5 rounded-lg border border-blue-300 shadow-2xs leading-relaxed text-xs">
                          "{convertNumberToWords(Number(directSavingsVnd) || 0)}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
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

      {/* MEDIA LIGHTBOX OVERLAY POPUP */}
      <KaizenMediaLightbox
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        items={lightboxState.items}
        currentIndex={lightboxState.index}
      />
    </div>
  );
}
