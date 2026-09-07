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
import { normalizeCategoryId, KaizenMediaLightbox, MediaItem, uploadFileToCloudinary, splitImageUrls } from "./kaizenMediaUtils";

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
    category_label?: string;
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
  // ĐA PHÂN LOẠI — 1 sáng kiến có thể vừa Tiết kiệm vật tư/chi phí, vừa Tăng năng suất... mỗi
  // nhóm góp phần tiết kiệm riêng, CỘNG DỒN lại thành tổng cuối cùng (xem editedKinds bên dưới).
  const [editedCategories, setEditedCategories] = useState<string[]>(() => {
    const c = normalizeCategoryId(proposal?.category || proposal?.category_label || (proposal as any)?.product_group);
    return c ? [c] : [];
  });
  const toggleCategory = (id: string) => {
    setEditedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const [timeBefore, setTimeBefore] = useState<number | string>(proposal?.time_before_seconds || 0);
  const [timeAfter, setTimeAfter] = useState<number | string>(proposal?.time_after_seconds || 0);
  const [pairQuantity, setPairQuantity] = useState<number | string>(
    proposal?.pair_quantity || (proposal as any)?.so_luong_giay || (proposal as any)?.quantity || ""
  );
  // Khối "Chi phí/Vật tư" dùng CHUNG cho cả 2 phân loại 1.Tiết kiệm Vật tư & 2.Tiết kiệm Chi phí
  // (2 phân loại này tính tiết kiệm theo CÙNG 1 cách — chi phí trước/sau — nên gộp 1 khối nhập
  // liệu duy nhất thay vì bắt nhập 2 lần giống hệt nhau khi chọn cả 2).
  const [costBefore, setCostBefore] = useState<number | string>(
    (proposal as any)?.cost_before || (proposal as any)?.chi_phi_truoc || ""
  );
  const [costAfter, setCostAfter] = useState<number | string>(
    (proposal as any)?.cost_after || (proposal as any)?.chi_phi_sau || ""
  );
  const [directSavingsVnd, setDirectSavingsVnd] = useState<number | string>("");
  // Ghi đè thủ công tổng tiết kiệm của khối Năng suất (mặc định tự tính từ thời gian × số đôi) —
  // TÁCH RIÊNG khỏi directSavingsVnd (khối Chi phí/Vật tư) để 2 khối không đè giá trị lẫn nhau khi
  // cùng được chọn.
  const [productivityDirectSavings, setProductivityDirectSavings] = useState<number | string>("");
  // Khối "Phi tài chính" (4.An toàn, 5.5S, 6.Tự động hoá, 7.MMTB CCDC) — tiết kiệm nhập trực tiếp,
  // không bắt buộc.
  const [nonFinancialSavingsVnd, setNonFinancialSavingsVnd] = useState<number | string>("");
  const [afterMediaList, setAfterMediaList] = useState<{ id: string; type: "image" | "video"; url: string; name?: string }[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
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

  // ⚡ ĐA PHÂN LOẠI — mỗi phân loại đã chọn góp vào ĐÚNG 1 trong 3 khối nhập liệu (khối "Chi
  // phí/Vật tư" dùng chung cho cả 2 phân loại 1&2 vì tính tiết kiệm giống hệt nhau). Chọn càng
  // nhiều phân loại thuộc các khối khác nhau thì càng nhiều khối hiện ra, tổng tiết kiệm CỘNG DỒN
  // toàn bộ khối đang hiện — xem grandTotalSavings bên dưới.
  const showProductivityBlock = editedCategories.includes("PRODUCTIVITY");
  const showMaterialCostBlock = editedCategories.includes("MATERIAL_SAVING") || editedCategories.includes("COST_SAVING");
  const showNonFinancialBlock = editedCategories.some((c) => ["SAFETY", "5S", "AUTOMATION", "EQUIPMENT"].includes(c));
  // Chưa chọn phân loại nào (VD mở modal lần đầu chưa kịp tick) -> mặc định hiện khối Năng suất
  // như hành vi cũ, tránh màn hình trống không biết nhập gì.
  const noCategorySelected = editedCategories.length === 0;

  useEffect(() => {
    if (isOpen && proposal) {
      setDecision(initialDecision);
      setNote("");
      setErrorMsg(null);
      setPairQtyError(null);
      const initialCat = normalizeCategoryId(
        proposal.category || proposal.category_label || (proposal as any).product_group || proposal.title
      );
      setEditedCategories(initialCat ? [initialCat] : []);
      setNote("");
      setErrorMsg(null);
      setPairQtyError(null);
      setDirectSavingsVnd((proposal as any).cost_before || (proposal as any).cost_after ? Math.max(0, Number((proposal as any).cost_before || 0) - Number((proposal as any).cost_after || 0)) : "");
      setProductivityDirectSavings("");
      setNonFinancialSavingsVnd(
        initialCat && ["SAFETY", "5S", "AUTOMATION", "EQUIPMENT"].includes(initialCat)
          ? proposal.total_savings_vnd || (proposal as any).tong_tien_tiet_kiem || ""
          : ""
      );
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
        const urls = splitImageUrls(proposal.after_image_url);
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

  const handleAddMediaFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    setErrorMsg(null);
    try {
      // Upload lên Cloudinary (giống mọi ảnh/video khác trong app) thay vì lưu thẳng base64 vào
      // CSDL — 1 ảnh base64 nặng 250-800KB lưu trực tiếp trong D1 vừa dễ vỡ hiển thị (data URI có
      // dấu phẩy ngay trong cú pháp, dễ bị hàm tách chuỗi băm nhầm) vừa phình CSDL không cần thiết.
      for (const file of Array.from(files)) {
        const isVid = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".webm");
        const url = await uploadFileToCloudinary(file, isVid ? "video" : "image");
        setAfterMediaList((prev) => [
          ...prev,
          { id: `${Date.now()}-${Math.random()}`, type: isVid ? "video" : "image", url, name: file.name },
        ]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "❌ Lỗi khi tải ảnh/video lên Cloudinary!");
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

  // 💰 CỘNG DỒN tiết kiệm — mỗi khối đang hiện (theo phân loại đã chọn) góp phần riêng, tổng lại
  // thành 1 số cuối cùng. VD chọn cả "1.Tiết kiệm Vật tư" + "3.Tăng Năng suất" thì tổng = tiết
  // kiệm từ chi phí vật tư CỘNG tiết kiệm từ rút ngắn thời gian.
  const materialCostAutoSavings = Math.max(0, (Number(costBefore) || 0) - (Number(costAfter) || 0));
  const materialCostSavingsFinal = showMaterialCostBlock
    ? directSavingsVnd !== "" ? Number(directSavingsVnd) || 0 : materialCostAutoSavings
    : 0;
  const productivitySavingsFinal = showProductivityBlock || noCategorySelected
    ? productivityDirectSavings !== "" ? Number(productivityDirectSavings) || 0 : totalSavingsVndVal
    : 0;
  const nonFinancialSavingsFinal = showNonFinancialBlock ? Number(nonFinancialSavingsVnd) || 0 : 0;
  const grandTotalSavings = materialCostSavingsFinal + productivitySavingsFinal + nonFinancialSavingsFinal;
  const activeBlockCount = [showMaterialCostBlock, showProductivityBlock || noCategorySelected, showNonFinancialBlock].filter(Boolean).length;

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

      const isProdTime = showProductivityBlock || noCategorySelected;
      const isDirectCost = showMaterialCostBlock;

      if (decision === "APPROVE") {
        let hasErr = false;

        if (isProdTime) {
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
        }
        if (isDirectCost && materialCostSavingsFinal <= 0) {
          setErrorMsg("❌ Vui lòng nhập số tiền tiết kiệm chi phí/vật tư!");
          hasErr = true;
        }
        if (!isProdTime && !isDirectCost && !showNonFinancialBlock) {
          setErrorMsg("❌ Vui lòng chọn ít nhất 1 Phân loại!");
          hasErr = true;
        }

        if (hasErr) {
          setSubmitting(false);
          return;
        }
      }

      const finalCostBefore = isDirectCost ? (costBefore !== "" ? Number(costBefore) || 0 : 0) : 0;
      const finalCostAfter = isDirectCost ? (costAfter !== "" ? Number(costAfter) || 0 : 0) : 0;
      const finalTotalSavings = grandTotalSavings;
      const savingsInWords = convertNumberToWords(finalTotalSavings);

      // Ghép nhãn Phân loại đã chọn (VD "1.Tiết kiệm Vật tư + 3.Tăng Năng suất") — category (ID)
      // vẫn giữ đúng 1 giá trị CHÍNH (phân loại đầu tiên) để không phá vỡ các bộ đếm/biểu đồ đang
      // đếm theo đúng 1 category ID sẵn có; category_label mới là nơi thể hiện đủ các phân loại.
      const selectedCategoryLabel = editedCategories.length > 0
        ? editedCategories.map((id) => CATEGORIES.find((c) => c.id === id)?.label || id).join(" + ")
        : proposal.category_label || proposal.category || "";
      const primaryCategoryId = editedCategories[0] || normalizeCategoryId(proposal.category || proposal.category_label);

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
          category: primaryCategoryId,
          categoryLabel: selectedCategoryLabel,
          note: note.trim() || (decision === "APPROVE" ? "Đã phê duyệt tính khả thi (Bước 3)" : "Không đạt tính khả thi"),
          timeBeforeSeconds: isProdTime && decision === "APPROVE" ? beforeVal : 0,
          timeAfterSeconds: isProdTime && decision === "APPROVE" ? afterVal : 0,
          savedSeconds: isProdTime && decision === "APPROVE" ? savedVal : 0,
          efficiencyValueVND: isProdTime && decision === "APPROVE" ? efficiencyVndVal : 0,
          pairQuantity: isProdTime && decision === "APPROVE" ? pairQtyVal : 1,
          so_luong_giay: isProdTime && decision === "APPROVE" ? pairQtyVal : 1,
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
          category: primaryCategoryId,
          category_label: selectedCategoryLabel,
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

              {/* Cột 3: Phân loại (chỉ hiện — chọn/sửa ở khối bên dưới, cho phép chọn NHIỀU) */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Phân loại
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-300 inline-block w-full max-w-[170px] truncate" title={editedCategories.map((id) => CATEGORIES.find((c) => c.id === id)?.label || id).join(" + ") || "Chưa chọn"}>
                  {editedCategories.length > 0
                    ? editedCategories.map((id) => CATEGORIES.find((c) => c.id === id)?.label || id).join(" + ")
                    : "Chưa chọn"}
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

          {/* PHÂN LOẠI — CHỌN NHIỀU (mỗi phân loại góp phần tiết kiệm riêng, cộng dồn) */}
          <div className="space-y-2 pt-1">
            <span className="font-black text-slate-900 text-xs block">
              Phân loại <span className="text-slate-400 font-medium">(chọn được nhiều — mỗi loại góp phần tiết kiệm riêng, cộng dồn lại)</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const checked = editedCategories.includes(c.id);
                return (
                  <label
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 select-none ${
                      checked
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border-2 shrink-0 ${
                        checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                      }`}
                    >
                      {checked && <IconCheck size={11} strokeWidth={3} />}
                    </span>
                    <span>{c.label}</span>
                  </label>
                );
              })}
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
                disabled={uploadingMedia}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200 font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingMedia ? <IconLoader2 size={13} className="animate-spin" /> : <IconPlus size={13} />}
                <span>{uploadingMedia ? "Đang tải lên..." : "Thêm ảnh / video"}</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAddMediaFiles}
              multiple
              accept="image/*,video/*"
              className="hidden"
              disabled={uploadingMedia}
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
              {(showProductivityBlock || noCategorySelected) && (
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

                  {/* TỔNG SỐ TIỀN TIẾT KIỆM ĐƯỢC (VNĐ) — riêng của khối Năng suất, sẽ cộng dồn
                      với khối khác (nếu có) ở phần Tổng cộng cuối form */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      💰 TIẾT KIỆM TỪ NĂNG SUẤT (VNĐ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1000"
                      value={productivityDirectSavings !== "" ? productivityDirectSavings : (totalSavingsVndVal > 0 ? totalSavingsVndVal : "")}
                      onChange={(e) => setProductivityDirectSavings(e.target.value)}
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
                      <span className="text-[9px] font-extrabold uppercase text-amber-300 block">TIẾT KIỆM KHỐI NÀY</span>
                      <span className="text-xs font-black text-white block truncate" title={`${productivitySavingsFinal.toLocaleString("vi-VN")} VNĐ`}>
                        {productivitySavingsFinal.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[8.5px] font-bold text-emerald-200 block">VNĐ</span>
                    </div>
                  </div>

                  {/* DÒNG HIỂN THỊ SỐ TIỀN BẰNG CHỮ */}
                  <div className="pt-2 border-t border-emerald-200/80 text-left">
                    <div className="text-[11.5px] font-bold text-slate-700 flex items-start sm:items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 not-italic shrink-0">Bằng chữ:</span>
                      <span className="italic text-emerald-950 font-semibold bg-white/90 px-2.5 py-0.5 rounded-lg border border-emerald-300/80 shadow-2xs leading-relaxed text-xs">
                        "{convertNumberToWords(productivitySavingsFinal)}"
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: Category 1 & Category 2 - 1.Tiết kiệm Vật tư / 2.Tiết kiệm Chi phí (dùng
                  CHUNG 1 khối vì tính tiết kiệm giống hệt nhau — xem showMaterialCostBlock) */}
              {showMaterialCostBlock && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                      <span>💰</span>
                      <span>
                        Nhập chi phí &amp; đánh giá tiết kiệm ({[editedCategories.includes("MATERIAL_SAVING") && "1. Tiết kiệm Vật tư", editedCategories.includes("COST_SAVING") && "2. Tiết kiệm Chi phí"].filter(Boolean).join(" + ")})
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
              {showNonFinancialBlock && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                    <span className="text-sm">🛡️</span>
                    <span>
                      Đánh giá Phê duyệt Tính Khả thi ({editedCategories.filter((c) => ["SAFETY", "5S", "AUTOMATION", "EQUIPMENT"].includes(c)).map((id) => CATEGORIES.find((c) => c.id === id)?.label || id).join(" + ")})
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-blue-200">
                    💡 Tập trung cải thiện môi trường làm việc, an toàn lao động, chuẩn hóa 5S, tự động hóa hoặc thiết bị MMTB CCDC — tiết kiệm (nếu có) tính riêng, cộng dồn với các khối khác.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      💰 TIẾT KIỆM KHỐI NÀY (VNĐ) — không bắt buộc
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1000"
                      value={nonFinancialSavingsVnd}
                      onChange={(e) => setNonFinancialSavingsVnd(e.target.value)}
                      placeholder="Nhập số tiền tiết kiệm (nếu có)..."
                      className="w-full p-2.5 rounded-xl border border-blue-300 text-sm font-black text-blue-950 bg-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                    />
                  </div>

                  {nonFinancialSavingsVnd !== "" && Number(nonFinancialSavingsVnd) > 0 && (
                    <div className="pt-2 border-t border-blue-200/80 text-left">
                      <div className="text-[11.5px] font-bold text-slate-700 flex items-start sm:items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 not-italic shrink-0">Bằng chữ:</span>
                        <span className="italic text-blue-950 font-semibold bg-white/90 px-2.5 py-0.5 rounded-lg border border-blue-300 shadow-2xs leading-relaxed text-xs">
                          "{convertNumberToWords(Number(nonFinancialSavingsVnd) || 0)}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TỔNG CỘNG TẤT CẢ KHỐI — chỉ hiện khi có từ 2 khối trở lên để không lặp thừa với
                  ô "Tiết kiệm khối này" khi chỉ có đúng 1 khối */}
              {activeBlockCount > 1 && (
                <div className="p-4 rounded-2xl bg-[#006838] text-white space-y-1 shadow-md">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                    <span>💰</span>
                    <span>Tổng cộng tiết kiệm (cộng dồn {activeBlockCount} phân loại)</span>
                  </span>
                  <span className="text-xl font-black block">{grandTotalSavings.toLocaleString("vi-VN")} VNĐ</span>
                  <span className="text-[11px] italic text-emerald-100 block">"{convertNumberToWords(grandTotalSavings)}"</span>
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
