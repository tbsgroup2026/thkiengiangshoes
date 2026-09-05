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
  IconTrendingUp,
} from "@tabler/icons-react";
import { convertNumberToWords } from "@/lib/numberToWords";
import { KaizenProposal, isApprovedProposal, isRejectedProposal } from "./CIModule";
import { usePermission } from "@/hooks/usePermission";
import FeasibilityApprovalModal from "./FeasibilityApprovalModal";
import {
  splitImageUrls,
  normalizeCategoryId,
  extractProposalVideos,
  UniversalVideoPlayer,
  KaizenMediaLightbox,
  MediaItem,
} from "./kaizenMediaUtils";

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

function getFirstImageUrl(urlStr?: string | null): string {
  if (!urlStr) return "";
  const trimmed = urlStr.trim();
  if (!trimmed) return "";
  const first = trimmed.split(",")[0].trim();
  return first;
}

const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
const CLOUDINARY_PRESET = "vpchuoisk";

async function uploadFileToCloudinary(file: File, fileType: "image" | "video"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${fileType}/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Lỗi khi tải ${fileType} lên Cloudinary!`);
  }
  return json.secure_url || json.url;
}

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

  // ═══════════════════════════════════════════════════════════════════════════
  // INLINE EDITING STATE & FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editProposerPosition, setEditProposerPosition] = useState("");
  const [editProductGroup, setEditProductGroup] = useState("");
  const [editCustomer, setEditCustomer] = useState("");

  const [editProductCode, setEditProductCode] = useState("");
  const [editQuantity, setEditQuantity] = useState<number | string>("");
  const [editPricingDirection, setEditPricingDirection] = useState("THOI_GIAN");

  const [editBeforeDescription, setEditBeforeDescription] = useState("");
  const [editAfterSolution, setEditAfterSolution] = useState("");

  const [editTimeBeforeSeconds, setEditTimeBeforeSeconds] = useState<number | string>("");
  const [editTimeAfterSeconds, setEditTimeAfterSeconds] = useState<number | string>("");
  const [editEfficiencyValueVnd, setEditEfficiencyValueVnd] = useState<number | string>("");
  const [editPairQuantity, setEditPairQuantity] = useState<number | string>("");
  const [editTotalSavingsVnd, setEditTotalSavingsVnd] = useState<number | string>("");

  const [editCostBefore, setEditCostBefore] = useState<number | string>("");
  const [editCostAfter, setEditCostAfter] = useState<number | string>("");

  const [editBeforeImages, setEditBeforeImages] = useState<string[]>([]);
  const [editAfterImages, setEditAfterImages] = useState<string[]>([]);
  const [editVideos, setEditVideos] = useState<Array<{ title: string; url: string }>>([]);

  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const startEditing = () => {
    if (!proposal) return;
    setEditTitle(proposal.title || "");
    setEditCategory(normalizeCategoryId(proposal.category || proposal.category_label));
    setEditProposerPosition((proposal as any).proposer_position || proposal.department || "");
    setEditProductGroup((proposal as any).product_group || proposal.factory || "");
    setEditCustomer(proposal.customer || "");

    setEditProductCode((proposal as any).product_code || proposal.code || "");
    setEditQuantity((proposal as any).quantity || proposal.vote_count || 0);
    setEditPricingDirection((proposal as any).pricing_direction || "THOI_GIAN");

    setEditBeforeDescription(proposal.before_description || "");
    setEditAfterSolution(proposal.after_solution || "");

    const tBefore = Number(proposal.time_before_seconds || (proposal as any).timeBeforeSeconds || 0);
    const tAfter = Number(proposal.time_after_seconds || (proposal as any).timeAfterSeconds || 0);
    const tSaved = Math.max(0, tBefore - tAfter);
    const pQty = Number(
      proposal.pair_quantity || (proposal as any).pairQuantity || (proposal as any).so_luong_giay || (proposal as any).quantity || 0
    );

    const effVnd = Number(
      proposal.efficiency_value_vnd || (proposal as any).efficiencyValueVND || (tSaved > 0 ? Math.round(tSaved * 12.5) : 0)
    );
    const totSavings = Number(
      proposal.total_savings_vnd ||
      (proposal as any).totalSavingsVND ||
      (proposal as any).tong_tien_tiet_kiem ||
      (pQty > 0 ? effVnd * pQty : effVnd)
    );

    setEditTimeBeforeSeconds(tBefore > 0 ? tBefore : "");
    setEditTimeAfterSeconds(tAfter > 0 ? tAfter : "");
    setEditEfficiencyValueVnd(effVnd > 0 ? effVnd : "");
    setEditPairQuantity(pQty > 0 ? pQty : "");
    setEditTotalSavingsVnd(totSavings > 0 ? totSavings : "");

    setEditCostBefore((proposal as any).cost_before ?? (proposal as any).costBefore ?? (proposal as any).chi_phi_truoc ?? "");
    setEditCostAfter((proposal as any).cost_after ?? (proposal as any).costAfter ?? (proposal as any).chi_phi_sau ?? "");

    setEditBeforeImages(splitImageUrls(proposal.before_image_url));
    setEditAfterImages(splitImageUrls(proposal.after_image_url));
    setEditVideos(extractProposalVideos(proposal));

    setEditError(null);
    setIsEditing(true);
  };

  const handleUploadBeforeImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingBefore(true);
    setEditError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFileToCloudinary(files[i], "image");
        newUrls.push(url);
      }
      setEditBeforeImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      setEditError(err.message || "Lỗi khi tải ảnh Trước lên Cloudinary");
    } finally {
      setUploadingBefore(false);
      e.target.value = "";
    }
  };

  const handleUploadAfterImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingAfter(true);
    setEditError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFileToCloudinary(files[i], "image");
        newUrls.push(url);
      }
      setEditAfterImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      setEditError(err.message || "Lỗi khi tải ảnh Sau lên Cloudinary");
    } finally {
      setUploadingAfter(false);
      e.target.value = "";
    }
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingVideo(true);
    setEditError(null);
    try {
      const file = files[0];
      const url = await uploadFileToCloudinary(file, "video");
      setEditVideos((prev) => [...prev, { title: file.name, url }]);
    } catch (err: any) {
      setEditError(err.message || "Lỗi khi tải video lên Cloudinary");
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  const handleRemoveBeforeImage = (idx: number) => {
    setEditBeforeImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveAfterImage = (idx: number) => {
    setEditAfterImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveVideo = (idx: number) => {
    setEditVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveInlineEdit = async () => {
    if (!editTitle.trim()) {
      setEditError("Vui lòng nhập tiêu đề sáng kiến!");
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    try {
      const timeBeforeNum = Number(editTimeBeforeSeconds) || 0;
      const timeAfterNum = Number(editTimeAfterSeconds) || 0;
      const savedSecsNum = Math.max(0, timeBeforeNum - timeAfterNum);
      const efficiencyVndNum =
        Number(editEfficiencyValueVnd) || (savedSecsNum > 0 ? Math.round(savedSecsNum * 12.5) : 0);
      const pairQtyNum = Number(editPairQuantity) || Number(editQuantity) || 0;
      const totalSavingsNum =
        Number(editTotalSavingsVnd) || (pairQtyNum > 0 ? efficiencyVndNum * pairQtyNum : efficiencyVndNum);

      const payload = {
        id: proposal.id,
        action: "UPDATE",
        title: editTitle.trim(),
        category: editCategory,
        categoryLabel: CATEGORIES.find((c) => c.id === editCategory)?.label || editCategory,
        category_label: CATEGORIES.find((c) => c.id === editCategory)?.label || editCategory,
        proposer_position: editProposerPosition.trim(),
        proposerPosition: editProposerPosition.trim(),
        product_group: editProductGroup.trim(),
        productGroup: editProductGroup.trim(),
        customer: editCustomer.trim(),
        product_code: editProductCode.trim(),
        productCode: editProductCode.trim(),
        quantity: Number(editQuantity) || 0,
        pricing_direction: editPricingDirection,
        pricingDirection: editPricingDirection,
        before_description: editBeforeDescription.trim(),
        beforeDescription: editBeforeDescription.trim(),
        after_solution: editAfterSolution.trim(),
        afterSolution: editAfterSolution.trim(),
        time_before_seconds: timeBeforeNum,
        timeBeforeSeconds: timeBeforeNum,
        time_after_seconds: timeAfterNum,
        timeAfterSeconds: timeAfterNum,
        saved_seconds: savedSecsNum,
        savedSeconds: savedSecsNum,
        efficiency_value_vnd: efficiencyVndNum,
        efficiencyValueVND: efficiencyVndNum,
        pair_quantity: pairQtyNum,
        pairQuantity: pairQtyNum,
        total_savings_vnd: totalSavingsNum,
        totalSavingsVnd: totalSavingsNum,
        total_savings_words: totalSavingsNum > 0 ? convertNumberToWords(totalSavingsNum) : "",
        totalSavingsWords: totalSavingsNum > 0 ? convertNumberToWords(totalSavingsNum) : "",
        cost_before: Number(editCostBefore) || 0,
        costBefore: Number(editCostBefore) || 0,
        chi_phi_truoc: Number(editCostBefore) || 0,
        cost_after: Number(editCostAfter) || 0,
        costAfter: Number(editCostAfter) || 0,
        chi_phi_sau: Number(editCostAfter) || 0,
        before_image_url: editBeforeImages.join(","),
        beforeImageUrl: editBeforeImages.join(","),
        after_image_url: editAfterImages.join(","),
        afterImageUrl: editAfterImages.join(","),
        videos: editVideos,
      };

      const token = typeof document !== "undefined"
        ? document.cookie.split("; ").find((row) => row.startsWith("tbs_token="))?.split("=")[1]
        : null;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/ci-kaizen", {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        setEditError(json.message || "Không thể cập nhật đề xuất!");
        setSavingEdit(false);
        return;
      }

      // Mutate local proposal object in place
      Object.assign(proposal, {
        title: payload.title,
        category: payload.category,
        category_label: payload.category_label,
        before_description: payload.before_description,
        after_solution: payload.after_solution,
        customer: payload.customer,
        time_before_seconds: payload.time_before_seconds,
        time_after_seconds: payload.time_after_seconds,
        saved_seconds: payload.saved_seconds,
        efficiency_value_vnd: payload.efficiency_value_vnd,
        pair_quantity: payload.pair_quantity,
        total_savings_vnd: payload.total_savings_vnd,
        total_savings_words: payload.total_savings_words,
        cost_before: payload.cost_before,
        cost_after: payload.cost_after,
        before_image_url: payload.before_image_url,
        after_image_url: payload.after_image_url,
      });

      (proposal as any).product_code = payload.product_code;
      (proposal as any).quantity = payload.quantity;
      (proposal as any).vote_count = payload.quantity;
      (proposal as any).pricing_direction = payload.pricing_direction;
      (proposal as any).pricingDirection = payload.pricing_direction;
      (proposal as any).proposer_position = payload.proposer_position;
      (proposal as any).proposerPosition = payload.proposer_position;
      (proposal as any).department = payload.proposer_position;
      (proposal as any).product_group = payload.product_group;
      (proposal as any).productGroup = payload.product_group;
      (proposal as any).factory = payload.product_group;
      (proposal as any).costBefore = payload.cost_before;
      (proposal as any).chi_phi_truoc = payload.cost_before;
      (proposal as any).costAfter = payload.cost_after;
      (proposal as any).chi_phi_sau = payload.cost_after;

      if (typeof window !== "undefined") {
        try {
          const cacheStr = localStorage.getItem("tbs_kaizen_proposals_cache_v1");
          if (cacheStr) {
            const list = JSON.parse(cacheStr);
            if (Array.isArray(list)) {
              const idx = list.findIndex((item: any) => item.id === proposal.id || item.code === proposal.code);
              if (idx >= 0) {
                list[idx] = { ...list[idx], ...proposal };
                localStorage.setItem("tbs_kaizen_proposals_cache_v1", JSON.stringify(list));
              }
            }
          }
        } catch (e) {}
      }

      setIsEditing(false);
      setSavingEdit(false);
      if (onRate) onRate();
      if (onEvaluate) onEvaluate();
    } catch (err: any) {
      setEditError(err.message || "Lỗi mạng khi lưu chỉnh sửa!");
      setSavingEdit(false);
    }
  };

  const beforeImageUrls = useMemo(() => {
    return isEditing ? editBeforeImages : splitImageUrls(proposal?.before_image_url);
  }, [isEditing, editBeforeImages, proposal?.before_image_url]);

  const afterImageUrls = useMemo(() => {
    return isEditing ? editAfterImages : splitImageUrls(proposal?.after_image_url);
  }, [isEditing, editAfterImages, proposal?.after_image_url]);

  const allMedia = useMemo(() => {
    const before = beforeImageUrls.map((url, idx) => ({
      type: "image" as const,
      url,
      label: `Trước${idx > 0 ? ` #${idx + 1}` : ""}`,
    }));
    const after = afterImageUrls.map((url, idx) => ({
      type: "image" as const,
      url,
      label: `Sau${idx > 0 ? ` #${idx + 1}` : ""}`,
    }));
    const vids = isEditing ? editVideos : extractProposalVideos(proposal);
    const videoMedia = vids.map((v) => ({
      type: "video" as const,
      url: v.url,
      label: v.title,
    }));

    return [...before, ...after, ...videoMedia];
  }, [beforeImageUrls, afterImageUrls, isEditing, editVideos, proposal]);

  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    url: string;
    label?: string;
  } | null>(allMedia[0] || null);

  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    items: MediaItem[];
    index: number;
  }>({ isOpen: false, items: [], index: 0 });

  const handleOpenLightbox = (idx: number, items: MediaItem[]) => {
    setLightboxState({ isOpen: true, items, index: Math.max(0, idx) });
  };

  useEffect(() => {
    setSelectedMedia(allMedia[0] || null);
  }, [allMedia]);

  // Determine permissions for Tab 2 "Đánh giá chuyên môn" & Tab 3 "Đánh giá thưởng"
  const isOwner = useMemo(() => {
    if (!user || !user.empCode || !proposal?.proposer_emp_code) return false;
    return user.empCode.trim().toUpperCase() === proposal.proposer_emp_code.trim().toUpperCase();
  }, [user, proposal]);

  const isJudgeOrExecutive = useMemo(() => {
    if (!user) return false;
    if (isExecutiveOrAdmin || levelRank >= 3) return true;
    const rc = ((user as any)?.roleCode || (user as any)?.role || "").toUpperCase();
    return ["TONG_GIAM_DOC", "PHO_TONG_GIAM_DOC", "GIAM_DOC", "PHO_GIAM_DOC", "TRUONG_PHONG", "CI_LEAD", "QC", "ADMIN"].includes(rc);
  }, [user, isExecutiveOrAdmin, levelRank]);

  // Fetch evaluation data to verify if current user is an assigned judge
  const [evalData, setEvalData] = useState<any>(null);

  useEffect(() => {
    if (!proposal?.id) return;
    let isMounted = true;
    fetch(`/api/ci-kaizen/expert-evaluations?proposalId=${proposal.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setEvalData(json.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [proposal?.id]);

  // Mark / Unmark Thi dua state & function
  const [markingThiDua, setMarkingThiDua] = useState(false);
  const [thiDuaMsg, setThiDuaMsg] = useState<string | null>(null);

  // Step 3: Feasibility Review Action State & Handler
  const [isFeasibilityModalOpen, setIsFeasibilityModalOpen] = useState(false);
  const [feasibilityInitialDecision, setFeasibilityInitialDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [step3Msg, setStep3Msg] = useState<string | null>(null);

  const handleToggleThiDua = async () => {
    if (!proposal) return;
    const isCurrentlyThiDua = Number(proposal.is_thi_dua) === 1;
    const action = isCurrentlyThiDua ? "REMOVE" : "ADD";

    try {
      setMarkingThiDua(true);
      setThiDuaMsg(null);
      const res = await fetch("/api/ci-kaizen/mark-thi-dua", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          action,
        }),
      });

      const json = await res.json();
      if (json.success) {
        proposal.is_thi_dua = isCurrentlyThiDua ? 0 : 1;
        setThiDuaMsg(json.message);
        setTimeout(() => setThiDuaMsg(null), 3000);
        if (onRate) onRate();
      } else {
        setThiDuaMsg(`❌ ${json.message || "Không thể thực hiện"}`);
      }
    } catch (e: any) {
      setThiDuaMsg("❌ Lỗi kết nối!");
    } finally {
      setMarkingThiDua(false);
    }
  };

  const isAssignedJudge = useMemo(() => {
    if (evalData?.assignedJudges && Array.isArray(evalData.assignedJudges) && evalData.assignedJudges.length > 0) {
      if (evalData.isExecutiveManager) return true;
      if (!user?.empCode) return false;
      const userEmp = user.empCode.trim().toUpperCase();
      return evalData.assignedJudges.some((j: any) => (j.judge_emp_code || "").trim().toUpperCase() === userEmp);
    }
    return isJudgeOrExecutive;
  }, [evalData, user, isJudgeOrExecutive]);

  const isApprovedStep3 = proposal?.sub_status !== "CHO_REVIEW" && proposal?.approval_status !== "PENDING" && proposal?.status !== "SUBMITTED";

  // Tab 2 & 3: ONLY visible if proposal is ALREADY approved (Step 3 completed) AND current account has judging permission
  // Tab 2 "Đánh giá chuyên môn" has been disabled per requirement
  const canSeeExpertTab = false;
  const canSeeAwardTab = isApprovedStep3 && isAssignedJudge;

  // Fallback activeTab if selected tab is hidden or user lacks permission
  useEffect(() => {
    if (activeTab === "expert_review" && !canSeeExpertTab) {
      setActiveTab("info");
    } else if (activeTab === "star_review" && !canSeeAwardTab) {
      setActiveTab("info");
    }
  }, [activeTab, canSeeExpertTab, canSeeAwardTab]);

  // Handle direct access via URL search params (e.g. ?tab=expert_review)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = (params.get("tab") || params.get("activeTab") || params.get("tab_name") || "").toLowerCase();

      if (["expert_review", "cham-diem", "danh-gia-chuyen-mon"].includes(tabParam)) {
        if (canSeeExpertTab) {
          setActiveTab("expert_review");
        } else {
          setActiveTab("info");
        }
      } else if (["star_review", "thuong", "danh-gia-thuong"].includes(tabParam)) {
        if (canSeeAwardTab) {
          setActiveTab("star_review");
        } else {
          setActiveTab("info");
        }
      }
    } catch (e) {}
  }, [canSeeExpertTab, canSeeAwardTab]);

  if (!isOpen || !proposal) return null;

  const catObj = CATEGORIES.find((c) => c.id === normalizeCategoryId(isEditing ? editCategory : (proposal.category || proposal.category_label))) || CATEGORIES[0];

  const isApproved = isApprovedProposal(proposal);
  const isRejected = isRejectedProposal(proposal);

  const effectiveDateStr = isApproved
    ? ((proposal as any).approved_at || (proposal as any).approvedAt || (proposal as any).updated_at || proposal.created_at)
    : (proposal.created_at || (proposal as any).updated_at);

  const effDate = effectiveDateStr ? new Date(effectiveDateStr) : new Date();
  const pMonth = !isNaN(effDate.getTime())
    ? effDate.getMonth() + 1
    : ((proposal as any).proposer_month || new Date().getMonth() + 1);
  const pYear = !isNaN(effDate.getTime())
    ? effDate.getFullYear()
    : ((proposal as any).proposer_year || new Date().getFullYear());
  const vtcv = (proposal as any).proposer_position || proposal.department || "Công Nhân Sản Xuất";
  const cust = proposal.customer || "Skechers";
  const prodGroup = (proposal as any).product_group || proposal.factory || "Quai";

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[95vw] lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] max-h-[90vh] flex flex-col md:flex-row overflow-hidden text-left animate-in zoom-in-95 duration-200">
        
        {/* ═══════════════════════════════════════════════════════════════════════════════════
            1. SIDEBAR TRÁI — CHỈNH BẢO ĐẢM RỘNG VỪA PHẢI (280px / max-w-5xl), TỈ LỆ CHUẨN
           ═══════════════════════════════════════════════════════════════════════════════════ */}
        <div className="w-full md:w-72 md:max-h-[90vh] md:overflow-y-auto bg-slate-50 border-r border-slate-200 p-4 md:p-5 flex flex-col gap-4 shrink-0">
          
          {/* Cover Image 4:3 rounded-2xl */}
          <div className="space-y-2">
            <div
              onClick={() => {
                if (selectedMedia?.url) {
                  const idx = allMedia.findIndex((m) => m.url === selectedMedia.url);
                  handleOpenLightbox(idx >= 0 ? idx : 0, allMedia);
                }
              }}
              className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-xs flex items-center justify-center cursor-pointer group"
              title="Bấm để mở xem phóng to"
            >
              {selectedMedia?.type === "image" && selectedMedia.url ? (
                <img
                  src={selectedMedia.url}
                  alt="Selected"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : selectedMedia?.type === "video" && selectedMedia.url ? (
                <UniversalVideoPlayer url={selectedMedia.url} title={selectedMedia.label} />
              ) : (
                <div className="text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-1">
                  <IconPhoto size={28} className="opacity-40" />
                  <span>Không có ảnh/video</span>
                </div>
              )}
            </div>

            {/* Dải Thumbnail vuông 56-64px */}
            {allMedia.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {allMedia.map((m) => (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => setSelectedMedia({ type: m.type, url: m.url, label: m.label })}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 shrink-0 relative ${
                      selectedMedia?.url === m.url
                        ? "border-[#006838] ring-2 ring-[#006838]/40"
                        : "border-slate-300 hover:border-slate-400 opacity-80 hover:opacity-100"
                    }`}
                    title={m.label}
                  >
                    {m.type === "video" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950 text-purple-200 p-1 text-[9px] font-bold">
                        <span className="text-xs">🎬</span>
                        <span className="truncate w-full text-center text-[8px]">{m.label}</span>
                      </div>
                    ) : (
                      <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Label Vị Trí + Phân Loại */}
          <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            {proposal.region || "MỸ PHONG"} &bull; {catObj.label.toUpperCase()}
          </div>

          {/* Grid 2 cột: ĐIỂM TB | CHUYÊN MÔN */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">ĐIỂM TB</span>
              <span className="text-xl font-black text-amber-600 block">
                {(proposal.avg_rating || 0).toFixed(1)} ⭐
              </span>
              <span className="text-[10px] font-bold text-slate-500 block">
                {proposal.rating_count || 0} lượt đánh giá
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">CHUYÊN MÔN</span>
              <span className="text-xl font-black text-emerald-600 block">
                {proposal.score_points || proposal.average_score ? `${proposal.score_points || proposal.average_score}/100` : "---"}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block">
                {proposal.sub_status === "DA_DANH_GIA" ? "Đã tổng hợp" : "Chờ tổng hợp"}
              </span>
            </div>
          </div>

          {/* Thẻ NGƯỜI ĐĂNG KÝ (Full width) */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              NGƯỜI ĐĂNG KÝ
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs">👤</span>
              <span className="text-xs font-extrabold text-slate-900">
                {proposal.proposer_name}
              </span>
            </div>
          </div>

          {/* 3 Hàng Grid 2 cột */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Hàng 1: VTCV | NHÓM SP/DV */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">VTCV</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editProposerPosition}
                  onChange={(e) => setEditProposerPosition(e.target.value)}
                  className="w-full text-xs font-extrabold text-slate-900 border border-amber-300 rounded-lg px-2 py-1 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Vị trí công việc..."
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900 block truncate" title={vtcv || "---"}>
                  {vtcv || "---"}
                </span>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">NHÓM SP/DV</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editProductGroup}
                  onChange={(e) => setEditProductGroup(e.target.value)}
                  className="w-full text-xs font-extrabold text-slate-900 border border-amber-300 rounded-lg px-2 py-1 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Nhóm sản phẩm..."
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900 block truncate" title={prodGroup || "---"}>
                  {prodGroup || "---"}
                </span>
              )}
            </div>

            {/* Hàng 2: PHÂN LOẠI | NGÀY ĐĂNG */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">PHÂN LOẠI</span>
              {isEditing ? (
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-[11px] font-black text-slate-900 border border-amber-300 rounded-lg px-1.5 py-1 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-extrabold text-slate-900 block truncate" title={catObj.label}>
                  {catObj.label}
                </span>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">NGÀY ĐĂNG</span>
              <span className="text-xs font-extrabold text-slate-900 block">
                {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}
              </span>
            </div>

            {/* Hàng 3: NHÂN SỰ ĐỀ XUẤT | KHÁCH HÀNG */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">NHÂN SỰ ĐỀ XUẤT</span>
              <span className="text-xs font-extrabold text-slate-900 block leading-tight break-words">
                {proposal.proposer_emp_code || "---"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">KHÁCH HÀNG</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  className="w-full text-xs font-extrabold text-slate-900 border border-amber-300 rounded-lg px-2 py-1 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Khách hàng..."
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900 block">
                  {cust || "---"}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons & Close Button at Bottom */}
          <div className="space-y-2 pt-2 mt-auto border-t border-slate-200">
            {thiDuaMsg && (
              <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold text-center animate-in fade-in">
                {thiDuaMsg}
              </div>
            )}

            {/* BGK / BGĐ Action: Chuyển sang Thi đua (chỉ khi đã Lưu trữ) */}
            {!isEditing && (proposal.status === "ARCHIVED" || proposal.sub_status === "LUU_TRU" || proposal.registration_type === "LUU_TRU") && isJudgeOrExecutive && (
              <button
                type="button"
                disabled={markingThiDua}
                onClick={handleToggleThiDua}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  Number(proposal.is_thi_dua) === 1
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                }`}
              >
                <IconTrophy size={16} />
                <span>
                  {markingThiDua
                    ? "Đang xử lý..."
                    : Number(proposal.is_thi_dua) === 1
                    ? "ℹ️ Bỏ khỏi Thi đua"
                    : "🏆 Chuyển sang Thi đua"}
                </span>
              </button>
            )}

            {isEditing ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveInlineEdit}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <IconDeviceFloppy size={16} />
                  <span>{savingEdit ? "Đang lưu..." : "💾 Lưu Thay Đổi"}</span>
                </button>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setIsEditing(false)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>✕ Hủy Chỉnh Sửa</span>
                </button>
              </div>
            ) : isOwner || isExecutiveOrAdmin ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={startEditing}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <IconEditCircle size={15} />
                  <span>Sửa</span>
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-black text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <IconTrash size={15} />
                  <span>Xóa</span>
                </button>
              </div>
            ) : null}

            {/* Nút ✕ Đóng ở đáy sidebar */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>✕ Đóng</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════════
            2. HEADER PHẢI — BADGE + TIÊU ĐỀ + TAB
           ═══════════════════════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white max-h-[90vh]">
          
          <div className="flex-shrink-0 p-5 md:p-6 border-b border-slate-200 bg-white">
            {editError && (
              <div className="mb-3 p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <IconAlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {/* 3 Pills Hàng Trên */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {/* Pill 1: Phân loại */}
              {isEditing ? (
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-black flex items-center gap-1">
                  <span>📈</span>
                  <span>{catObj.label}</span>
                </span>
              )}

              {/* Pill 2: Hình thức */}
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black flex items-center gap-1">
                <span>🏆</span>
                <span>{proposal.registration_type === "THI_DUA" ? "Thi đua" : "Lưu trữ"}</span>
              </span>

              {/* Pill 3: Trạng thái quy trình */}
              <span
                className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ${
                  isRejected
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : isApproved
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-blue-50 text-blue-800 border-blue-300"
                }`}
              >
                <span>
                  {isRejected ? "❌" : isApproved ? "✅" : "👤"}
                </span>
                <span>
                  {isRejected ? "Từ chối" : isApproved ? "Đã duyệt" : "Chờ duyệt"}
                </span>
              </span>
            </div>

            {/* Tiêu đề hồ sơ */}
            {isEditing ? (
              <textarea
                rows={2}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-lg md:text-xl font-black text-slate-900 border-2 border-amber-400 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/20 mb-1"
                placeholder="Nhập tiêu đề sáng kiến cải tiến..."
              />
            ) : (
              <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug mb-1">
                {proposal.title}
              </h2>
            )}

            {/* Dòng phụ: MSNV · KV · Tháng/Năm */}
            <p className="text-xs font-bold text-slate-400">
              MSNV: <span className="font-mono text-slate-700">{proposal.proposer_emp_code}</span> &bull; KV: <span className="text-slate-700">{proposal.region || "Kiên Giang 1"}</span> &bull; Tháng {pMonth}/{pYear}
            </p>

            {/* BANNER XEM XÉT TÍNH KHẢ THI (BƯỚC 3 QĐ-TBKG) */}
            {(proposal.sub_status === "CHO_REVIEW" || proposal.approval_status === "PENDING" || proposal.status === "SUBMITTED") && isJudgeOrExecutive && (
              <div className="mt-4 p-4 rounded-2xl bg-blue-50/90 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <IconShieldCheck size={16} className="text-blue-600 shrink-0" />
                    <span>Xem xét tính khả thi sáng kiến (Bước 3 - QĐ-TBKG)</span>
                  </span>
                  <p className="text-[11px] text-blue-700 font-medium">
                    Đề xuất đang ở trạng thái <strong>Chờ phê duyệt</strong>. Bạn có muốn phê duyệt tính khả thi để cho phép thử nghiệm và đánh giá?
                  </p>
                  {step3Msg && <div className="text-xs font-extrabold text-emerald-700 mt-1">{step3Msg}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFeasibilityInitialDecision("APPROVE");
                      setIsFeasibilityModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <IconCheck size={14} />
                    <span>Phê Duyệt Triển Khai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeasibilityInitialDecision("REJECT");
                      setIsFeasibilityModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <IconX size={14} />
                    <span>Từ Chối Triển Khai</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thanh Tab - Active Navy #0b1739 */}
          <div className="flex-shrink-0 px-5 md:px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "info"
                  ? "bg-[#0b1739] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
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
                    ? "bg-[#0b1739] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>♛ Đánh giá chuyên môn</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "expert_review" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {proposal.score_points || (proposal as any).evaluations_count ? `${proposal.score_points || 2}` : "2"}
                </span>
              </button>
            )}

            {canSeeAwardTab && (
              <button
                type="button"
                onClick={() => setActiveTab("star_review")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "star_review"
                    ? "bg-[#0b1739] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>★ Đánh giá thưởng</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "star_review" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {proposal.rating_count || 0}
                </span>
              </button>
            )}
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {activeTab === "info" && (
              <TabInfoContent
                proposal={proposal}
                onOpenLightbox={handleOpenLightbox}
                isEditing={isEditing}
                editCategory={editCategory}
                setEditCategory={setEditCategory}
                editProductCode={editProductCode}
                setEditProductCode={setEditProductCode}
                editQuantity={editQuantity}
                setEditQuantity={setEditQuantity}
                editPricingDirection={editPricingDirection}
                setEditPricingDirection={setEditPricingDirection}
                editBeforeDescription={editBeforeDescription}
                setEditBeforeDescription={setEditBeforeDescription}
                editAfterSolution={editAfterSolution}
                setEditAfterSolution={setEditAfterSolution}
                editTimeBeforeSeconds={editTimeBeforeSeconds}
                setEditTimeBeforeSeconds={setEditTimeBeforeSeconds}
                editTimeAfterSeconds={editTimeAfterSeconds}
                setEditTimeAfterSeconds={setEditTimeAfterSeconds}
                editEfficiencyValueVnd={editEfficiencyValueVnd}
                setEditEfficiencyValueVnd={setEditEfficiencyValueVnd}
                editPairQuantity={editPairQuantity}
                setEditPairQuantity={setEditPairQuantity}
                editTotalSavingsVnd={editTotalSavingsVnd}
                setEditTotalSavingsVnd={setEditTotalSavingsVnd}
                editCostBefore={editCostBefore}
                setEditCostBefore={setEditCostBefore}
                editCostAfter={editCostAfter}
                setEditCostAfter={setEditCostAfter}
                editBeforeImages={editBeforeImages}
                handleUploadBeforeImages={handleUploadBeforeImages}
                handleRemoveBeforeImage={handleRemoveBeforeImage}
                uploadingBefore={uploadingBefore}
                editAfterImages={editAfterImages}
                handleUploadAfterImages={handleUploadAfterImages}
                handleRemoveAfterImage={handleRemoveAfterImage}
                uploadingAfter={uploadingAfter}
                editVideos={editVideos}
                handleUploadVideo={handleUploadVideo}
                handleRemoveVideo={handleRemoveVideo}
                uploadingVideo={uploadingVideo}
              />
            )}
            {activeTab === "expert_review" && canSeeExpertTab && (
              <TabExpertReviewContent proposal={proposal} isOwner={isOwner} initialEvalData={evalData} />
            )}
            {activeTab === "star_review" && canSeeAwardTab && (
              <TabAwardReviewContent
                proposal={proposal}
                isJudgeOrExecutive={isJudgeOrExecutive}
                onEvaluate={onEvaluate}
                onRate={onRate}
              />
            )}
          </div>
        </div>
      </div>

      {/* POPUP PHÊ DUYỆT TÍNH KHẢ THI (BƯỚC 3 QĐ-TBKG) */}
      <FeasibilityApprovalModal
        isOpen={isFeasibilityModalOpen}
        proposal={proposal}
        initialDecision={feasibilityInitialDecision}
        onClose={() => setIsFeasibilityModalOpen(false)}
        onSuccess={(updated) => {
          proposal.approval_status = updated.approval_status;
          proposal.sub_status = updated.sub_status;
          proposal.status = updated.status;
          if (updated.category) proposal.category = updated.category;
          if (updated.time_before_seconds !== undefined) proposal.time_before_seconds = updated.time_before_seconds;
          if (updated.time_after_seconds !== undefined) proposal.time_after_seconds = updated.time_after_seconds;
          if (updated.saved_seconds !== undefined) proposal.saved_seconds = updated.saved_seconds;
          if (updated.efficiency_value_vnd !== undefined) proposal.efficiency_value_vnd = updated.efficiency_value_vnd;
          if (updated.pair_quantity !== undefined) {
            proposal.pair_quantity = updated.pair_quantity;
            (proposal as any).pairQuantity = updated.pair_quantity;
            (proposal as any).so_luong_giay = updated.pair_quantity;
            (proposal as any).quantity = updated.pair_quantity;
          }
          if (updated.total_savings_vnd !== undefined) {
            proposal.total_savings_vnd = updated.total_savings_vnd;
            (proposal as any).totalSavingsVND = updated.total_savings_vnd;
            (proposal as any).tong_tien_tiet_kiem = updated.total_savings_vnd;
          }
          if (updated.total_savings_words !== undefined) proposal.total_savings_words = updated.total_savings_words;
          if (updated.cost_before !== undefined) {
            (proposal as any).cost_before = updated.cost_before;
            (proposal as any).costBefore = updated.cost_before;
            (proposal as any).chi_phi_truoc = updated.cost_before;
          }
          if (updated.cost_after !== undefined) {
            (proposal as any).cost_after = updated.cost_after;
            (proposal as any).costAfter = updated.cost_after;
            (proposal as any).chi_phi_sau = updated.cost_after;
          }
          if (updated.after_image_url) proposal.after_image_url = updated.after_image_url;
          if (updated.approved_at) (proposal as any).approved_at = updated.approved_at;
          if (updated.proposer_month) (proposal as any).proposer_month = updated.proposer_month;
          if (updated.proposer_year) (proposal as any).proposer_year = updated.proposer_year;

          setStep3Msg(
            updated.approval_status === "PHE_DUYET"
              ? "✅ Đã phê duyệt tính khả thi (Bước 3) thành công!"
              : "❌ Đã từ chối triển khai sáng kiến."
          );
          setTimeout(() => setStep3Msg(null), 4000);
          if (onRate) onRate();
          if (onEvaluate) onEvaluate();
        }}
      />

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

/* ═══════════════════════════════════════════════════════════════════════════════════
   3. NỘI DUNG TAB "THÔNG TIN" — CẤU TRÚC ĐẦY ĐỦ 4 SECTIONS THEO CHUẨN REFERENCE
   ═══════════════════════════════════════════════════════════════════════════════════ */
interface TabInfoContentProps {
  proposal: KaizenProposal;
  onOpenLightbox?: (idx: number, items: MediaItem[]) => void;
  isEditing?: boolean;
  editCategory?: string;
  setEditCategory?: (v: string) => void;
  editProductCode?: string;
  setEditProductCode?: (v: string) => void;
  editQuantity?: number | string;
  setEditQuantity?: (v: number | string) => void;
  editPricingDirection?: string;
  setEditPricingDirection?: (v: string) => void;
  editBeforeDescription?: string;
  setEditBeforeDescription?: (v: string) => void;
  editAfterSolution?: string;
  setEditAfterSolution?: (v: string) => void;
  editTimeBeforeSeconds?: number | string;
  setEditTimeBeforeSeconds?: (v: number | string) => void;
  editTimeAfterSeconds?: number | string;
  setEditTimeAfterSeconds?: (v: number | string) => void;
  editEfficiencyValueVnd?: number | string;
  setEditEfficiencyValueVnd?: (v: number | string) => void;
  editPairQuantity?: number | string;
  setEditPairQuantity?: (v: number | string) => void;
  editTotalSavingsVnd?: number | string;
  setEditTotalSavingsVnd?: (v: number | string) => void;
  editCostBefore?: number | string;
  setEditCostBefore?: (v: number | string) => void;
  editCostAfter?: number | string;
  setEditCostAfter?: (v: number | string) => void;
  editBeforeImages?: string[];
  handleUploadBeforeImages?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveBeforeImage?: (idx: number) => void;
  uploadingBefore?: boolean;
  editAfterImages?: string[];
  handleUploadAfterImages?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAfterImage?: (idx: number) => void;
  uploadingAfter?: boolean;
  editVideos?: Array<{ title: string; url: string }>;
  handleUploadVideo?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveVideo?: (idx: number) => void;
  uploadingVideo?: boolean;
}

function TabInfoContent({
  proposal,
  onOpenLightbox,
  isEditing,
  editCategory,
  setEditCategory,
  editProductCode,
  setEditProductCode,
  editQuantity,
  setEditQuantity,
  editPricingDirection,
  setEditPricingDirection,
  editBeforeDescription,
  setEditBeforeDescription,
  editAfterSolution,
  setEditAfterSolution,
  editTimeBeforeSeconds,
  setEditTimeBeforeSeconds,
  editTimeAfterSeconds,
  setEditTimeAfterSeconds,
  editEfficiencyValueVnd,
  setEditEfficiencyValueVnd,
  editPairQuantity,
  setEditPairQuantity,
  editTotalSavingsVnd,
  setEditTotalSavingsVnd,
  editCostBefore,
  setEditCostBefore,
  editCostAfter,
  setEditCostAfter,
  editBeforeImages = [],
  handleUploadBeforeImages,
  handleRemoveBeforeImage,
  uploadingBefore,
  editAfterImages = [],
  handleUploadAfterImages,
  handleRemoveAfterImage,
  uploadingAfter,
  editVideos = [],
  handleUploadVideo,
  handleRemoveVideo,
  uploadingVideo,
}: TabInfoContentProps) {
  const prodCode = (proposal as any).product_code || proposal.code;
  const qty = (proposal as any).quantity || proposal.vote_count;
  const pricingDir = isEditing ? editPricingDirection : (proposal as any).pricing_direction || "THOI_GIAN";

  // Images list
  const beforeImageUrls = isEditing ? editBeforeImages : splitImageUrls(proposal.before_image_url);
  const afterImageUrls = isEditing ? editAfterImages : splitImageUrls(proposal.after_image_url);

  // Videos list
  const videos = isEditing ? editVideos : extractProposalVideos(proposal);

  return (
    <div className="p-5 md:p-6 space-y-6 text-xs">
      
      {/* SECTION 1 — 📋 TỔNG QUAN CẢI TIẾN */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>📋</span>
          <span>TỔNG QUAN CẢI TIẾN</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: MÃ HÀNG */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">MÃ HÀNG</span>
            {isEditing ? (
              <input
                type="text"
                value={editProductCode || ""}
                onChange={(e) => setEditProductCode?.(e.target.value)}
                className="w-full text-xs font-black text-slate-900 bg-amber-50/50 border border-amber-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Nhập mã hàng..."
              />
            ) : (
              <span className="text-sm font-black text-slate-900 block truncate">{prodCode || "---"}</span>
            )}
          </div>

          {/* Card 2: SỐ LƯỢNG ĐH */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">SỐ LƯỢNG ĐH</span>
            {isEditing ? (
              <input
                type="number"
                value={editQuantity ?? ""}
                onChange={(e) => setEditQuantity?.(e.target.value)}
                className="w-full text-xs font-black text-slate-900 bg-amber-50/50 border border-amber-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Nhập số lượng..."
              />
            ) : (
              <span className="text-sm font-black text-slate-900 block truncate">
                {qty && Number(qty) > 0 ? Number(qty).toLocaleString("vi-VN") : "0"}
              </span>
            )}
          </div>

          {/* Card 3: HƯỚNG ĐÁNH GIÁ */}
          <div className="p-3.5 rounded-2xl bg-amber-50/20 border border-slate-200 border-r-4 border-r-amber-500 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">HƯỚNG ĐÁNH GIÁ</span>
            {isEditing ? (
              <select
                value={editPricingDirection || "THOI_GIAN"}
                onChange={(e) => setEditPricingDirection?.(e.target.value)}
                className="w-full text-xs font-black text-slate-900 bg-amber-50/50 border border-amber-300 rounded-lg px-2 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="THOI_GIAN">Thời gian (giây/đôi)</option>
                <option value="TRI_GIA">Trị giá (VNĐ)</option>
              </select>
            ) : (
              <span className="text-sm font-black text-slate-900 block truncate">
                {pricingDir === "TRI_GIA" || pricingDir === "Trị giá" ? "Trị giá" : "Thời gian"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2 — ☰ NỘI DUNG CHI TIẾT */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>☰</span>
          <span>NỘI DUNG CHI TIẾT</span>
        </h4>
        <div className="space-y-4">
          {/* VẤN ĐỀ PHÁT HIỆN (TRƯỚC) */}
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2">
            <h5 className="text-xs font-black uppercase text-rose-800 tracking-wide flex items-center gap-1.5">
              <IconAlertCircle size={15} className="text-rose-600" />
              <span>VẤN ĐỀ PHÁT HIỆN (TRƯỚC)</span>
            </h5>
            {isEditing ? (
              <textarea
                rows={3}
                value={editBeforeDescription || ""}
                onChange={(e) => setEditBeforeDescription?.(e.target.value)}
                className="w-full font-bold text-rose-950 bg-white border border-rose-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Mô tả hiện trạng lãng phí trước cải tiến..."
              />
            ) : (
              <p className="font-bold text-rose-950 leading-relaxed whitespace-pre-wrap text-xs">
                {proposal.before_description || "Chưa có mô tả hiện trạng lãng phí trước cải tiến."}
              </p>
            )}
          </div>

          {/* GIẢI PHÁP HÀNH ĐỘNG (SAU) */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <h5 className="text-xs font-black uppercase text-emerald-800 tracking-wide flex items-center gap-1.5">
              <IconThumbUp size={15} className="text-emerald-600" />
              <span>GIẢI PHÁP HÀNH ĐỘNG (SAU)</span>
            </h5>
            {isEditing ? (
              <textarea
                rows={3}
                value={editAfterSolution || ""}
                onChange={(e) => setEditAfterSolution?.(e.target.value)}
                className="w-full font-bold text-emerald-950 bg-white border border-emerald-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Mô tả giải pháp sáng kiến cải tiến..."
              />
            ) : (
              <p className="font-bold text-emerald-950 leading-relaxed whitespace-pre-wrap text-xs">
                {proposal.after_solution || "Chưa có mô tả giải pháp sáng kiến cải tiến."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 — 📈 HIỆU QUẢ CẢI TIẾN */}
      {(() => {
        const normCat = normalizeCategoryId(isEditing ? (editCategory || proposal.category || proposal.category_label) : (proposal.category || proposal.category_label));
        const isMaterialOrCost = normCat === "MATERIAL_SAVING" || normCat === "COST_SAVING";
        const catObj = CATEGORIES.find((c) => c.id === normCat) || CATEGORIES[0];

        const timeBefore = isEditing ? Number(editTimeBeforeSeconds || 0) : Number(proposal.time_before_seconds || (proposal as any).timeBeforeSeconds || 0);
        const timeAfter = isEditing ? Number(editTimeAfterSeconds || 0) : Number(proposal.time_after_seconds || (proposal as any).timeAfterSeconds || 0);
        const savedSecs = isEditing ? Math.max(0, timeBefore - timeAfter) : Number(proposal.saved_seconds || (proposal as any).savedSeconds || Math.max(0, timeBefore - timeAfter));
        const efficiencyVnd = isEditing
          ? (Number(editEfficiencyValueVnd) || (savedSecs > 0 ? Math.round(savedSecs * 12.5) : 0))
          : Number(
              proposal.efficiency_value_vnd || (proposal as any).efficiencyValueVND || Math.round(savedSecs * 12.5)
            );
        const pairQty = isEditing
          ? Number(editPairQuantity || 0)
          : Number(
              proposal.pair_quantity || (proposal as any).pairQuantity || (proposal as any).so_luong_giay || (proposal as any).quantity || 0
            );
        const autoTotSavings = pairQty > 0 ? efficiencyVnd * pairQty : efficiencyVnd;
        const totalSavingsVnd = isEditing
          ? (Number(editTotalSavingsVnd) || autoTotSavings)
          : Number(
              proposal.total_savings_vnd ||
              (proposal as any).totalSavingsVND ||
              (proposal as any).tong_tien_tiet_kiem ||
              autoTotSavings
            );
        const totalSavingsWordsText = totalSavingsVnd > 0 ? convertNumberToWords(totalSavingsVnd) : "";

        const costBeforeVal = isEditing ? Number(editCostBefore || 0) : Number((proposal as any).cost_before ?? (proposal as any).costBefore ?? (proposal as any).chi_phi_truoc ?? 0);
        const costAfterVal = isEditing ? Number(editCostAfter || 0) : Number((proposal as any).cost_after ?? (proposal as any).costAfter ?? (proposal as any).chi_phi_sau ?? 0);

        return (
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span>📈</span>
              <span>HIỆU QUẢ CẢI TIẾN ({catObj.label})</span>
            </h4>

            {isMaterialOrCost ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Thẻ 1: CHI PHÍ TRƯỚC */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">CHI PHÍ TRƯỚC</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editCostBefore ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditCostBefore?.(v);
                        const cb = Number(v) || 0;
                        const ca = Number(editCostAfter) || 0;
                        const diff = Math.max(0, cb - ca);
                        setEditTotalSavingsVnd?.(diff);
                      }}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-xs font-black text-slate-900 bg-amber-50/50"
                      placeholder="Chi phí trước..."
                    />
                  ) : (
                    <span className="text-lg sm:text-xl font-black text-slate-900 block truncate">
                      {costBeforeVal > 0 ? `${costBeforeVal.toLocaleString("vi-VN")} VNĐ` : "Chưa đo lường"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 block">chi phí ban đầu</span>
                </div>

                {/* Thẻ 2: CHI PHÍ SAU */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">CHI PHÍ SAU</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editCostAfter ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditCostAfter?.(v);
                        const ca = Number(v) || 0;
                        const cb = Number(editCostBefore) || 0;
                        const diff = Math.max(0, cb - ca);
                        setEditTotalSavingsVnd?.(diff);
                      }}
                      className="w-full border border-slate-300 rounded-lg p-1.5 text-xs font-black text-slate-900 bg-amber-50/50"
                      placeholder="Chi phí sau..."
                    />
                  ) : (
                    <span className="text-lg sm:text-xl font-black text-slate-900 block truncate">
                      {costAfterVal > 0 ? `${costAfterVal.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-600 block">sau cải tiến</span>
                </div>

                {/* Thẻ 3: TỔNG SỐ TIỀN TIẾT KIỆM */}
                <div className="p-3.5 rounded-2xl bg-[#006838] text-white space-y-1 shadow-md border border-emerald-400/30">
                  <span className="text-[10px] font-extrabold uppercase text-amber-300 block">TỔNG TIẾT KIỆM</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editTotalSavingsVnd ?? ""}
                      onChange={(e) => setEditTotalSavingsVnd?.(e.target.value)}
                      className="w-full border border-emerald-400 rounded-lg p-1.5 text-xs font-black text-white bg-emerald-900"
                      placeholder="Tổng tiết kiệm VNĐ..."
                    />
                  ) : (
                    <span className="text-lg sm:text-xl font-black text-white block truncate">
                      {totalSavingsVnd > 0 ? `${totalSavingsVnd.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-200 block truncate">tiết kiệm trực tiếp</span>
                </div>
              </div>
            ) : pricingDir === "TRI_GIA" || pricingDir === "Trị giá" ? (
              <div className="p-4 rounded-2xl bg-[#006838] text-white shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-200 block">
                    HIỆU QUẢ QUY ĐỔI VNĐ/ĐÔI
                  </span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editEfficiencyValueVnd ?? ""}
                      onChange={(e) => setEditEfficiencyValueVnd?.(e.target.value)}
                      className="w-full border border-emerald-400 rounded-lg p-1.5 text-xs font-black text-white bg-emerald-900"
                      placeholder="Hiệu quả VNĐ..."
                    />
                  ) : (
                    <span className="text-xl font-black text-white block">
                      {efficiencyVnd.toLocaleString("vi-VN")} VNĐ
                    </span>
                  )}
                </div>
                <span className="px-3 py-1 bg-emerald-800 text-emerald-100 rounded-lg text-xs font-extrabold">
                  Trị giá
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Thẻ 1: TRƯỚC */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">TRƯỚC</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editTimeBeforeSeconds ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditTimeBeforeSeconds?.(v);
                        const tb = Number(v) || 0;
                        const ta = Number(editTimeAfterSeconds) || 0;
                        const saved = Math.max(0, tb - ta);
                        const eff = Math.round(saved * 12.5);
                        setEditEfficiencyValueVnd?.(eff);
                        const qtyNum = Number(editPairQuantity) || 0;
                        setEditTotalSavingsVnd?.(qtyNum > 0 ? eff * qtyNum : eff);
                      }}
                      className="w-full border border-amber-300 rounded-lg p-1.5 text-xs font-black text-slate-900 bg-amber-50/50"
                    />
                  ) : (
                    <span className="text-xl font-black text-slate-900 block">
                      {timeBefore ? `${timeBefore}` : "0"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 block">giây</span>
                </div>

                {/* Thẻ 2: SAU */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">SAU</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editTimeAfterSeconds ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditTimeAfterSeconds?.(v);
                        const ta = Number(v) || 0;
                        const tb = Number(editTimeBeforeSeconds) || 0;
                        const saved = Math.max(0, tb - ta);
                        const eff = Math.round(saved * 12.5);
                        setEditEfficiencyValueVnd?.(eff);
                        const qtyNum = Number(editPairQuantity) || 0;
                        setEditTotalSavingsVnd?.(qtyNum > 0 ? eff * qtyNum : eff);
                      }}
                      className="w-full border border-amber-300 rounded-lg p-1.5 text-xs font-black text-slate-900 bg-amber-50/50"
                    />
                  ) : (
                    <span className="text-xl font-black text-slate-900 block">
                      {timeAfter ? `${timeAfter}` : "0"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 block">giây</span>
                </div>

                {/* Thẻ 3: TIẾT KIỆM */}
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-purple-700 block">TIẾT KIỆM</span>
                  <span className="text-xl font-black text-purple-900 block">
                    {savedSecs}
                  </span>
                  <span className="text-[10px] font-bold text-purple-600 block">
                    giây {timeBefore && savedSecs ? `(${Math.round((savedSecs / timeBefore) * 100)}%)` : ""}
                  </span>
                </div>

                {/* Thẻ 4: HIỆU QUẢ */}
                <div className="p-3.5 rounded-2xl bg-[#006838] text-white space-y-1 shadow-md">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-200 block">HIỆU QUẢ</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editEfficiencyValueVnd ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditEfficiencyValueVnd?.(v);
                        const eff = Number(v) || 0;
                        const qtyNum = Number(editPairQuantity) || 0;
                        setEditTotalSavingsVnd?.(qtyNum > 0 ? eff * qtyNum : eff);
                      }}
                      className="w-full border border-emerald-400 rounded-lg p-1.5 text-xs font-black text-white bg-emerald-800"
                    />
                  ) : (
                    <span className="text-base sm:text-lg font-black text-white block truncate">
                      {efficiencyVnd.toLocaleString("vi-VN")} VNĐ
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-200 block">quy đổi / đôi</span>
                </div>

                {/* Thẻ 5: SỐ LƯỢNG GIÀY (ĐÔI) */}
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 block">SỐ LƯỢNG GIÀY</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editPairQuantity ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditPairQuantity?.(v);
                        const qtyNum = Number(v) || 0;
                        const tb = Number(editTimeBeforeSeconds) || 0;
                        const ta = Number(editTimeAfterSeconds) || 0;
                        const saved = Math.max(0, tb - ta);
                        const eff = Number(editEfficiencyValueVnd) || Math.round(saved * 12.5);
                        if (!editEfficiencyValueVnd && eff > 0) {
                          setEditEfficiencyValueVnd?.(eff);
                        }
                        const tot = qtyNum > 0 ? eff * qtyNum : eff;
                        setEditTotalSavingsVnd?.(tot);
                      }}
                      className="w-full border border-blue-300 rounded-lg p-1.5 text-xs font-black text-blue-950 bg-white"
                      placeholder="Nhập số đôi..."
                    />
                  ) : (
                    <span className="text-base sm:text-lg font-black text-blue-950 block truncate">
                      {pairQty > 0 ? pairQty.toLocaleString("vi-VN") : "0"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-blue-600 block">đôi / đơn hàng</span>
                </div>

                {/* Thẻ 6: TỔNG TIẾT KIỆM */}
                <div className="p-3.5 rounded-2xl bg-[#00522c] text-white space-y-1 shadow-md border border-emerald-400/30">
                  <span className="text-[10px] font-extrabold uppercase text-amber-300 block">TỔNG TIẾT KIỆM</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editTotalSavingsVnd ?? ""}
                      onChange={(e) => setEditTotalSavingsVnd?.(e.target.value)}
                      className="w-full border border-emerald-400 rounded-lg p-1.5 text-xs font-black text-white bg-emerald-900"
                    />
                  ) : (
                    <span className="text-base sm:text-lg font-black text-white block truncate">
                      {totalSavingsVnd > 0 ? `${totalSavingsVnd.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-200 block truncate">
                    {pairQty > 0 ? `cho ${pairQty.toLocaleString("vi-VN")} đôi` : "tính quy đổi"}
                  </span>
                </div>
              </div>
            )}

            {/* DÒNG TIỀN BẰNG CHỮ */}
            {totalSavingsWordsText && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left">
                <span className="text-xs text-slate-700">
                  <strong className="text-slate-900 font-black">Bằng chữ: </strong>
                  <span className="italic font-bold text-emerald-950">
                    "{totalSavingsWordsText}"
                  </span>
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* SECTION 4 — 🖼 So Sánh Hình Ảnh */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>🖼</span>
          <span>So Sánh Hình Ảnh</span>
        </h4>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Cột Trước */}
          <div className="p-3 sm:p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-900">Trước</span>
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-2xs">
                {beforeImageUrls.length}
              </span>
            </div>
            {beforeImageUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {beforeImageUrls.map((u, idx) => (
                  <div key={u + idx} className="relative rounded-xl overflow-hidden group">
                    <img
                      src={u}
                      alt={`Before ${idx + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-xl border border-rose-200 bg-white"
                    />
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveBeforeImage?.(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        ✕
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox?.(
                            idx,
                            beforeImageUrls.map((img, i) => ({ type: "image", url: img, title: `Ảnh Trước #${i + 1}` }))
                          )
                        }
                        className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                      >
                        🔍 Phóng to
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-28 rounded-xl border border-dashed border-rose-200 bg-white flex items-center justify-center text-slate-400 font-bold text-xs">
                Chưa có ảnh trước
              </div>
            )}

            {isEditing && (
              <label className="block w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-rose-300 hover:bg-rose-50 text-rose-700 font-extrabold text-xs text-center cursor-pointer transition-colors mt-2">
                <input type="file" accept="image/*" multiple onChange={handleUploadBeforeImages} hidden />
                <span>{uploadingBefore ? "⏳ Đang tải ảnh lên Cloudinary..." : "📷 + Thêm ảnh Trước"}</span>
              </label>
            )}
          </div>

          {/* Cột Sau */}
          <div className="p-3 sm:p-3.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900">Sau</span>
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-2xs">
                {afterImageUrls.length}
              </span>
            </div>
            {afterImageUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {afterImageUrls.map((u, idx) => (
                  <div key={u + idx} className="relative rounded-xl overflow-hidden group">
                    <img
                      src={u}
                      alt={`After ${idx + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-xl border border-emerald-200 bg-white"
                    />
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveAfterImage?.(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        ✕
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox?.(
                            idx,
                            afterImageUrls.map((img, i) => ({ type: "image", url: img, title: `Ảnh Sau #${i + 1}` }))
                          )
                        }
                        className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                      >
                        🔍 Phóng to
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-28 rounded-xl border border-dashed border-emerald-200 bg-white flex items-center justify-center text-slate-400 font-bold text-xs">
                Chưa có ảnh sau
              </div>
            )}

            {isEditing && (
              <label className="block w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-extrabold text-xs text-center cursor-pointer transition-colors mt-2">
                <input type="file" accept="image/*" multiple onChange={handleUploadAfterImages} hidden />
                <span>{uploadingAfter ? "⏳ Đang tải ảnh lên Cloudinary..." : "📷 + Thêm ảnh Sau"}</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* VIDEO CLIPS (NẾU CÓ HOẶC KHI ĐANG SỬA) */}
      {(videos.length > 0 || isEditing) && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-2">
            <span>🎬</span>
            <span>VIDEO CLIPS MINH HỌA ({videos.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((vid, idx) => (
              <div key={idx} className="p-3 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 block truncate">{vid.title || `Video #${idx + 1}`}</span>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo?.(idx)}
                      className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      ✕ Xóa Video
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenLightbox?.(
                          idx,
                          videos.map((v) => ({ type: "video", url: v.url, title: v.title }))
                        )
                      }
                      className="text-[10px] text-purple-700 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>🔍 Xem full màn hình</span>
                    </button>
                  )}
                </div>
                <UniversalVideoPlayer url={vid.url} title={vid.title} />
              </div>
            ))}
          </div>

          {isEditing && (
            <label className="block w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-purple-300 hover:bg-purple-50 text-purple-700 font-extrabold text-xs text-center cursor-pointer transition-colors mt-2">
              <input type="file" accept="video/*" onChange={handleUploadVideo} hidden />
              <span>{uploadingVideo ? "🎬 Đang tải video lên Cloudinary..." : "🎬 + Thêm Video Clip (Cloudinary)"}</span>
            </label>
          )}
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
  initialEvalData,
}: {
  proposal: KaizenProposal;
  isOwner: boolean;
  initialEvalData?: any;
}) {
  const { user, isExecutiveOrAdmin, levelRank } = usePermission();

  const isJudgeOrExecutive = useMemo(() => {
    if (isExecutiveOrAdmin || levelRank >= 3) return true;
    const rc = ((user as any)?.roleCode || "").toUpperCase();
    return ["TONG_GIAM_DOC", "PHO_TONG_GIAM_DOC", "GIAM_DOC", "PHO_GIAM_DOC", "TRUONG_PHONG", "CI_LEAD", "QC", "ADMIN"].includes(rc);
  }, [user, isExecutiveOrAdmin, levelRank]);

  const [loading, setLoading] = useState(!initialEvalData);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Server state data
  const [evalData, setEvalData] = useState<any>(initialEvalData || null);
  const catObj = CATEGORIES.find((c) => c.id === normalizeCategoryId(proposal.category || proposal.category_label)) || CATEGORIES[0];

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

  const totalScore = useMemo(() => {
    if (!prerequisitePass) return 0;
    return Math.round((c1Score + c2Score + c3Score + c4Score + c5Score) * 10) / 10;
  }, [prerequisitePass, c1Score, c2Score, c3Score, c4Score, c5Score]);

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

  useEffect(() => {
    fetchEvaluations();
  }, [proposal.id]);

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

  const handleResetForm = () => {
    setC1Score(0);
    setC2Score(0);
    setC3Score(0);
    setC4Score(0);
    setC5Score(0);
    setComments("");
    setErrorMsg(null);
  };

  const handleSubmitScore = async (action: "SAVE_DRAFT" | "CONFIRM") => {
    if (action === "CONFIRM" && !prerequisitePass) {
      setErrorMsg("Hồ sơ không đạt điều kiện tiên quyết. Vui lòng kiểm tra lại!");
      return;
    }
    if (action === "CONFIRM" && totalScore === 0) {
      setErrorMsg("Vui lòng chọn điểm cho ít nhất 1 tiêu chí chuyên môn trước khi gửi!");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/ci-kaizen/expert-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          proposalId: proposal.id,
          prerequisitePass,
          c1Score,
          c2Score,
          c3Score,
          c4Score,
          c5Score,
          comments,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        if (action === "CONFIRM") {
          setEvalStatus("CONFIRMED");
        }
        await fetchEvaluations();
      } else {
        setErrorMsg(json.message || "Lỗi khi lưu đánh giá!");
      }
    } catch (e: any) {
      setErrorMsg("Không thể gửi dữ liệu đánh giá!");
    } finally {
      setSaving(false);
    }
  };

  // Criterion 1 Options (Dynamic according to Category)
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
              <table className="w-full min-w-[720px] text-left border-collapse text-xs table-auto">
                <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-black text-slate-700 uppercase">
                  <tr>
                    <th className="py-2 px-1.5 text-center w-8 border-r border-slate-200 shrink-0 bg-slate-100">STT</th>
                    <th className="py-2 px-2 w-24 border-r border-slate-200 shrink-0 bg-slate-100">TIÊU CHÍ</th>
                    <th className="py-2 px-2 w-24 border-r border-slate-200 shrink-0 bg-slate-100">MÔ TẢ NGẮN</th>
                    <th className="py-2 px-1.5 text-center w-14 border-r border-slate-200 shrink-0 bg-slate-100 whitespace-nowrap">ĐIỂM TỐI ĐA</th>
                    <th className="py-2 px-2.5 bg-slate-100">BGK CHỌN ĐIỂM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {/* ROW 1: TIÊU CHÍ 1 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-1.5 text-center font-extrabold text-blue-600 border-r border-slate-200 w-8">1</td>
                    <td className="py-2 px-2 font-black text-slate-900 border-r border-slate-200 leading-tight text-[10.5px] w-24">
                      Hiệu quả thực tế đạt được
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-500 border-r border-slate-200 text-[10px] leading-tight whitespace-normal break-words w-24">
                      Mức độ hiệu quả mang lại (tùy danh mục)
                    </td>
                    <td className="py-2 px-1.5 text-center font-black text-slate-800 border-r border-slate-200 text-xs w-14">
                      35
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-700 block mb-1.5">
                        BAREM CHO "{catObj.label.toUpperCase()}" – Tiêu chí 1 ℹ️
                      </span>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1.5 w-full">
                        {c1Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between w-full min-w-0 overflow-hidden ${
                              c1Score === opt.score
                                ? "border-blue-600 bg-blue-50/90 text-blue-900 font-extrabold shadow-2xs ring-1 ring-blue-500/30 relative z-10"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 relative z-0"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <input
                                type="radio"
                                name="c1"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c1Score === opt.score}
                                onChange={() => setC1Score(opt.score)}
                                className="w-3 h-3 text-blue-600 border-slate-300 focus:ring-blue-500 shrink-0"
                              />
                              <span className="font-black text-[11px] leading-none truncate">{opt.label}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* ROW 2: TIÊU CHÍ 2 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-1.5 text-center font-extrabold text-emerald-600 border-r border-slate-200 w-8">2</td>
                    <td className="py-2 px-2 font-black text-slate-900 border-r border-slate-200 leading-tight text-[10.5px] w-24">
                      Tính khả thi &amp; hiệu quả đầu tư
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-500 border-r border-slate-200 text-[10px] leading-tight whitespace-normal break-words w-24">
                      Chi phí đầu tư so với lợi ích.
                    </td>
                    <td className="py-2 px-1.5 text-center font-black text-slate-800 border-r border-slate-200 text-xs w-14">
                      20
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1.5 w-full">
                        {c2Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between w-full min-w-0 overflow-hidden ${
                              c2Score === opt.score
                                ? "border-emerald-600 bg-emerald-50/90 text-emerald-900 font-extrabold shadow-2xs ring-1 ring-emerald-500/30 relative z-10"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 relative z-0"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <input
                                type="radio"
                                name="c2"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c2Score === opt.score}
                                onChange={() => setC2Score(opt.score)}
                                className="w-3 h-3 text-emerald-600 border-slate-300 focus:ring-emerald-500 shrink-0"
                              />
                              <span className="font-black text-[11px] leading-none truncate">{opt.label}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* ROW 3: TIÊU CHÍ 3 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-1.5 text-center font-extrabold text-purple-600 border-r border-slate-200 w-8">3</td>
                    <td className="py-2 px-2 font-black text-slate-900 border-r border-slate-200 leading-tight text-[10.5px] w-24">
                      Khả năng nhân rộng
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-500 border-r border-slate-200 text-[10px] leading-tight whitespace-normal break-words w-24">
                      Mức độ áp dụng cho nhiều vị trí / đơn vị.
                    </td>
                    <td className="py-2 px-1.5 text-center font-black text-slate-800 border-r border-slate-200 text-xs w-14">
                      20
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1.5 w-full">
                        {c3Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between w-full min-w-0 overflow-hidden ${
                              c3Score === opt.score
                                ? "border-purple-600 bg-purple-50/90 text-purple-900 font-extrabold shadow-2xs ring-1 ring-purple-500/30 relative z-10"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 relative z-0"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <input
                                type="radio"
                                name="c3"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c3Score === opt.score}
                                onChange={() => setC3Score(opt.score)}
                                className="w-3 h-3 text-purple-600 border-slate-300 focus:ring-purple-500 shrink-0"
                              />
                              <span className="font-black text-[11px] leading-none truncate">{opt.label}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* ROW 4: TIÊU CHÍ 4 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-1.5 text-center font-extrabold text-amber-600 border-r border-slate-200 w-8">4</td>
                    <td className="py-2 px-2 font-black text-slate-900 border-r border-slate-200 leading-tight text-[10.5px] w-24">
                      Tính sáng tạo &amp; chủ động
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-500 border-r border-slate-200 text-[10px] leading-tight whitespace-normal break-words w-24">
                      Mức độ sáng tạo và chủ động đề xuất.
                    </td>
                    <td className="py-2 px-1.5 text-center font-black text-slate-800 border-r border-slate-200 text-xs w-14">
                      15
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1.5 w-full">
                        {c4Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between w-full min-w-0 overflow-hidden ${
                              c4Score === opt.score
                                ? "border-amber-600 bg-amber-50/90 text-amber-900 font-extrabold shadow-2xs ring-1 ring-amber-500/30 relative z-10"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 relative z-0"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <input
                                type="radio"
                                name="c4"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c4Score === opt.score}
                                onChange={() => setC4Score(opt.score)}
                                className="w-3 h-3 text-amber-600 border-slate-300 focus:ring-amber-500 shrink-0"
                              />
                              <span className="font-black text-[11px] leading-none truncate">{opt.label}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>

                  {/* ROW 5: TIÊU CHÍ 5 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-1.5 text-center font-extrabold text-sky-600 border-r border-slate-200 w-8">5</td>
                    <td className="py-2 px-2 font-black text-slate-900 border-r border-slate-200 leading-tight text-[10.5px] w-24">
                      Lan tỏa &amp; tinh thần đội nhóm
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-500 border-r border-slate-200 text-[10px] leading-tight whitespace-normal break-words w-24">
                      Mức độ lan tỏa, hỗ trợ phối hợp.
                    </td>
                    <td className="py-2 px-1.5 text-center font-black text-slate-800 border-r border-slate-200 text-xs w-14">
                      10
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-1.5 w-full">
                        {c5Options.map((opt) => (
                          <label
                            key={opt.score}
                            className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between w-full min-w-0 overflow-hidden ${
                              c5Score === opt.score
                                ? "border-sky-600 bg-sky-50/90 text-sky-900 font-extrabold shadow-2xs ring-1 ring-sky-500/30 relative z-10"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 relative z-0"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <input
                                type="radio"
                                name="c5"
                                disabled={!isAssignedJudge || !prerequisitePass || evalStatus === "CONFIRMED"}
                                checked={c5Score === opt.score}
                                onChange={() => setC5Score(opt.score)}
                                className="w-3 h-3 text-sky-600 border-slate-300 focus:ring-sky-500 shrink-0"
                              />
                              <span className="font-black text-[11px] leading-none truncate">{opt.label}</span>
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5 whitespace-normal break-words">
                              {opt.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr className="bg-slate-900 text-white font-black text-xs">
                    <td colSpan={3} className="py-2.5 px-3 uppercase tracking-wider text-[11px]">
                      TỔNG ĐIỂM TỐI ĐA: 100
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-right text-xs">
                      TỔNG ĐIỂM BGK: <span className="text-emerald-400 text-base font-black ml-1.5">{totalScore} / 100</span>
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
   TAB 3: AWARD & RATING REVIEW CONTENT (THỜI GIAN / THƯỞNG — PHÒNG CỦA ẢNH 1)
   ═══════════════════════════════════════════════════════════════════════════════════ */
function TabAwardReviewContent({
  proposal,
  isJudgeOrExecutive,
  onEvaluate,
  onRate,
}: {
  proposal: KaizenProposal;
  isJudgeOrExecutive: boolean;
  onEvaluate: () => void;
  onRate?: () => void;
}) {
  const { user } = usePermission();
  const [impactRating, setImpactRating] = useState<number>(0);
  const [creativityRating, setCreativityRating] = useState<number>(0);
  const [sustainabilityRating, setSustainabilityRating] = useState<number>(0);
  const [hoverImpact, setHoverImpact] = useState<number>(0);
  const [hoverCreativity, setHoverCreativity] = useState<number>(0);
  const [hoverSustainability, setHoverSustainability] = useState<number>(0);
  const [commentText, setCommentText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const userName = (user as any)?.fullName || (user as any)?.name || (user as any)?.username || "Người dùng";
  const userAccount = user?.empCode || (user as any)?.username || "CAITIEN";

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (impactRating === 0 || creativityRating === 0 || sustainabilityRating === 0) {
      setSubmitMsg({ type: "error", text: "Vui lòng chọn số sao cho cả 3 tiêu chí (Tác động, Sáng tạo, Bền vững)!" });
      return;
    }

    setSubmitting(true);
    setSubmitMsg(null);

    const avgStars = Math.round(((impactRating + creativityRating + sustainabilityRating) / 3) * 10) / 10;

    try {
      const res = await fetch("/api/ci-kaizen/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          score: avgStars,
          comments: commentText,
          impactScore: impactRating,
          creativityScore: creativityRating,
          sustainabilityScore: sustainabilityRating,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitMsg({ type: "success", text: json.message || "⭐ Đã gửi nhận xét & đánh giá thành công!" });
        if (onRate) onRate();
      } else {
        setSubmitMsg({ type: "error", text: json.message || "Không thể lưu đánh giá!" });
      }
    } catch (err: any) {
      setSubmitMsg({ type: "error", text: "Lỗi kết nối máy chủ!" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 md:p-6 space-y-6">
      {/* FORM NHẬN XÉT (1-5 SAO) - CHUẨN MẪU ẢNH 1 */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-5 text-left">
        {/* Title */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="text-base">💬</span>
          <h3 className="text-sm md:text-base font-black text-slate-900">
            Nhận Xét (1-5 sao)
          </h3>
        </div>

        {submitMsg && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            submitMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <span>{submitMsg.type === "success" ? "✅" : "⚠️"}</span>
            <span>{submitMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmitRating} className="space-y-5">
          {/* Field 1: Người nhận xét */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">
              Người nhận xét
            </label>
            <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-700 shadow-2xs">
              {userName}
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              Tài khoản: <span className="text-slate-600">@{userAccount}</span>
            </p>
          </div>

          {/* 3 Criteria Star Rating Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* 1. Tác động */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>🎯</span>
                <span>Tác động <span className="text-red-500">*</span></span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setImpactRating(star)}
                    onMouseEnter={() => setHoverImpact(star)}
                    onMouseLeave={() => setHoverImpact(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                  >
                    <IconStar
                      size={22}
                      className={
                        star <= (hoverImpact || impactRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Sáng tạo */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>💡</span>
                <span>Sáng tạo <span className="text-red-500">*</span></span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCreativityRating(star)}
                    onMouseEnter={() => setHoverCreativity(star)}
                    onMouseLeave={() => setHoverCreativity(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                  >
                    <IconStar
                      size={22}
                      className={
                        star <= (hoverCreativity || creativityRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Bền vững */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>🌱</span>
                <span>Bền vững <span className="text-red-500">*</span></span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSustainabilityRating(star)}
                    onMouseEnter={() => setHoverSustainability(star)}
                    onMouseLeave={() => setHoverSustainability(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                  >
                    <IconStar
                      size={22}
                      className={
                        star <= (hoverSustainability || sustainabilityRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Textarea: Nhận xét (tùy chọn) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">
              Nhận xét (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Chia sẻ ý kiến..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#006838] hover:bg-[#00522c] active:bg-[#004022] text-white font-black text-xs md:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <IconSend size={16} />
            <span>{submitting ? "Đang gửi nhận xét..." : "Gửi Nhận Xét"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
