"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import KaizenDashboard from "./KaizenDashboard";
import KaizenEarlyWarning from "./KaizenEarlyWarning";
import KaizenFiveStepSubmitForm from "./KaizenFiveStepSubmitForm";
import KaizenPublicSubmitForm from "./KaizenPublicSubmitForm";
import KaizenDetailModal from "./KaizenDetailModal";
import EvaluationModal from "./EvaluationModal";
import FeasibilityApprovalModal from "./FeasibilityApprovalModal";
import {
  IconLayoutGrid,
  IconList,
  IconRefresh,
  IconPlus,
  IconDownload,
  IconSearch,
  IconFilter,
  IconRotate,
  IconStar,
  IconEye,
  IconTrophy,
  IconSparkles,
  IconCheck,
  IconX,
  IconSend,
  IconBuildingFactory,
  IconMapPin,
  IconUser,
  IconClock,
  IconBuilding,
  IconPhoto,
  IconThumbUp,
  IconShieldCheck,
  IconAward,
  IconChevronDown,
  IconChevronRight,
  IconChevronLeft,
  IconArrowLeft,
  IconCloudUpload,
  IconUpload,
  IconTrash,
  IconTag,
  IconBox,
  IconCircleCheck,
  IconHelpCircle,
  IconChartBar,
  IconDotsVertical,
  IconQrcode,
  IconCopy,
  IconUserCheck,
  IconVideo,
  IconExternalLink,
} from "@tabler/icons-react";
import { formatTitleWithDepartment } from "@/lib/userProfiles";
import { usePermission } from "@/hooks/usePermission";

export interface KaizenProposal {
  id: string;
  code: string;
  title: string;
  category: string;
  category_label: string;
  registration_type: string; // THI_DUA, LUU_TRU
  sub_status: string; // CHO_DANH_GIA, DA_DANH_GIA
  region: string;
  department: string;
  factory?: string;
  customer?: string;
  proposer_name: string;
  proposer_emp_code: string;
  dept_code: string;
  before_description?: string;
  after_solution?: string;
  saved_seconds: number;
  time_before_seconds?: number;
  time_after_seconds?: number;
  efficiency_value_vnd?: number;
  pair_quantity?: number;
  so_luong_giay?: number;
  total_savings_vnd?: number;
  tong_tien_tiet_kiem?: number;
  total_savings_words?: string;
  tong_tien_bang_chu?: string;
  before_image_url?: string;
  after_image_url?: string;
  attachments_json?: string;
  status: string; // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED
  award_title?: string; // Giải Nhất, Giải Nhì, Giải Ba, Giải Khuyến Khích
  score_points: number;
  review_comment?: string;
  avg_rating: number;
  average_score?: number;
  rating_count: number;
  vote_count: number;
  view_count: number;
  rejection_reason?: string;
  required_reviewer_ids_json?: string;
  evaluated_at?: string;
  is_thi_dua?: number;
  propose_thi_dua?: number;
  scores_json?: string;
  evaluation_result?: string;
  approval_status?: string;
  version: number;
  created_at: string;
}

const CATEGORIES = [
  { id: "MATERIAL_SAVING", label: "1.Tiết kiệm Vật tư", color: "bg-blue-600 text-white" },
  { id: "COST_SAVING", label: "2.Tiết kiệm Chi phí", color: "bg-emerald-600 text-white" },
  { id: "PRODUCTIVITY", label: "3.Tăng Năng suất", color: "bg-blue-500 text-white" },
  { id: "SAFETY", label: "4.An toàn lao động", color: "bg-[#006838] text-white" },
  { id: "5S", label: "5.5S", color: "bg-sky-500 text-white" },
  { id: "AUTOMATION", label: "6.Tự động hoá", color: "bg-indigo-600 text-white" },
  { id: "EQUIPMENT", label: "7.MMTB CCDC", color: "bg-purple-600 text-white" },
];

import { REAL_DEPARTMENTS } from "./KaizenPublicSubmitForm";

const REGIONS = REAL_DEPARTMENTS;

interface HalfStarRatingProps {
  value: number; // current rating 0.5 - 5.0
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: number;
}

export function HalfStarRating({ value, onChange, readOnly = false, size = 22 }: HalfStarRatingProps) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const displayVal = hoverVal !== null ? hoverVal : value;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-1">
        {stars.map((starIdx) => {
          const leftVal = starIdx - 0.5;
          const rightVal = starIdx;
          const isLeftFilled = displayVal >= leftVal;
          const isRightFilled = displayVal >= rightVal;

          return (
            <div key={starIdx} className="relative inline-block cursor-pointer" style={{ width: size, height: size }}>
              {!readOnly && (
                <>
                  <div
                    className="absolute left-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => setHoverVal(leftVal)}
                    onMouseLeave={() => setHoverVal(null)}
                    onClick={() => onChange && onChange(leftVal)}
                    title={`Chấm ${leftVal} sao`}
                  />
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full z-10"
                    onMouseEnter={() => setHoverVal(rightVal)}
                    onMouseLeave={() => setHoverVal(null)}
                    onClick={() => onChange && onChange(rightVal)}
                    title={`Chấm ${rightVal} sao`}
                  />
                </>
              )}

              <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
                <IconStar size={size} className="text-slate-300 fill-slate-200" />
                {isRightFilled ? (
                  <IconStar size={size} className="absolute inset-0 text-amber-400 fill-amber-400" />
                ) : isLeftFilled ? (
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <IconStar size={size} className="text-amber-400 fill-amber-400" />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 min-w-[40px] text-center">
        {displayVal > 0 ? `${displayVal.toFixed(1)} ⭐` : "Chưa chấm"}
      </span>
    </div>
  );
}

const TH_KG_SUB_ITEMS = [
  "Kiên Giang 1",
  "Kiên Giang 2",
  "Kiên Giang 3",
  "Hoàn thiện đế",
  "Phòng kế hoạch",
  "Phòng CN-CI",
  "Phòng chất lượng",
  "Phòng nhân sự",
];
const MAIN_REGIONS = ["THKG"];

const matchRegionFilter = (propRegion: string, filterRegion: string) => {
  if (!filterRegion || filterRegion === "ALL") return true;
  if (!propRegion) return false;

  const pr = propRegion.toUpperCase();

  if (filterRegion === "Kiên Giang 1" || filterRegion === "KG 1") {
    return pr.includes("KIÊN GIANG 1") || pr.includes("KIEN GIANG 1") || pr.includes("KG 1") || pr.includes("KG1");
  }
  if (filterRegion === "Kiên Giang 2" || filterRegion === "KG 2") {
    return pr.includes("KIÊN GIANG 2") || pr.includes("KIEN GIANG 2") || pr.includes("KG 2") || pr.includes("KG2");
  }
  if (filterRegion === "Kiên Giang 3" || filterRegion === "KG 3") {
    return pr.includes("KIÊN GIANG 3") || pr.includes("KIEN GIANG 3") || pr.includes("KG 3") || pr.includes("KG3");
  }
  if (filterRegion === "Hoàn thiện đế" || filterRegion === "Hoàn Thiện Đế") {
    return pr.includes("HOÀN THIỆN ĐẾ") || pr.includes("HOAN THIEN DE") || pr.includes("HTĐ") || pr.includes("HTD") || pr === "ĐẾ" || pr === "DE";
  }
  if (filterRegion === "Phòng kế hoạch") {
    return pr.includes("KẾ HOẠCH") || pr.includes("KE HOACH") || pr.includes("PPC");
  }
  if (filterRegion === "Phòng CN-CI") {
    return pr.includes("CN-CI") || pr.includes("CN CI") || pr.includes("CONTINUOUS IMPROVEMENT");
  }
  if (filterRegion === "Phòng chất lượng") {
    return pr.includes("CHẤT LƯỢNG") || pr.includes("CHAT LUONG") || pr.includes("QA") || pr.includes("QC");
  }
  if (filterRegion === "Phòng nhân sự") {
    return pr.includes("NHÂN SỰ") || pr.includes("NHAN SU") || pr.includes("HR") || pr.includes("HÀNH CHÍNH");
  }

  if (filterRegion === "THKG" || filterRegion === "TH-KG") {
    return (
      pr.includes("THKG") ||
      pr.includes("TH-KG") ||
      pr.includes("KIÊN GIANG") ||
      pr.includes("KIEN GIANG") ||
      pr.includes("HOÀN THIỆN ĐẾ") ||
      pr.includes("HOAN THIEN DE") ||
      pr === "ĐẾ" ||
      pr === "DE"
    );
  }

  if (filterRegion === "Nhà Máy Miền Đông") {
    return (
      pr.includes("MIỀN ĐÔNG") ||
      pr.includes("MIEN DONG") ||
      pr.includes("LONG XUYÊN") ||
      pr.includes("ĐÀ NẴNG") ||
      pr.includes("HỘI AN") ||
      pr.includes("ĐỒNG XOÀI")
    );
  }

  if (filterRegion === "VP Chuỗi (R&D)") {
    return pr.includes("VP CHUỖI") || pr.includes("VP CHUOI") || pr.includes("R&D") || pr.includes("NGÀNH S");
  }

  return pr.includes(filterRegion.toUpperCase());
};

export default function CIModule() {
  const { isExecutiveOrAdmin } = usePermission();
  const [proposals, setProposals] = useState<KaizenProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [activeTab, setActiveTab] = useState<"LIBRARY" | "DASHBOARD" | "EARLY_WARNING">("LIBRARY");
  const [isFiveStepModalOpen, setIsFiveStepModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedRegType, setSelectedRegType] = useState("ALL");
  const [selectedSubStatus, setSelectedSubStatus] = useState("CHO_DANH_GIA");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Evaluation Modal State (Step 5 Rating)
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evaluatingProposal, setEvaluatingProposal] = useState<KaizenProposal | null>(null);
    // Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRegTypeExpanded, setIsRegTypeExpanded] = useState(true);
  const [isRegionExpanded, setIsRegionExpanded] = useState(true);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isThKgExpanded, setIsThKgExpanded] = useState(true);
  // Synchronized Logged-in User Profile from /work session
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    title: string;
    avatar: string;
    empCode: string;
    roleCode?: string;
  }>({
    name: "Phạm Nguyễn Anh Huy",
    title: "IT - Team Chuyển Đổi Số",
    avatar: "https://res.cloudinary.com/dwl2xtbqa/image/upload/v1787117525/nzcft200bebofw7b4uzg.jpg",
    empCode: "202608001",
    roleCode: "TONG_GIAM_DOC",
  });

  useEffect(() => {
    if (selectedRegion === "Kiên Giang 3" || selectedRegion === "Nhà Máy Miền Đông" || selectedRegion === "VP Chuỗi (R&D)") {
      setSelectedRegion("ALL");
    }
  }, [selectedRegion]);

  useEffect(() => {
    function loadUser() {
      if (typeof window === "undefined") return;
      const curStr = localStorage.getItem("tbs_current_user");
      if (curStr) {
        try {
          const cur = JSON.parse(curStr);
          if (cur && cur.name) {
            setCurrentUser({
              name: cur.name,
              title: cur.title || cur.department || "Cán bộ công nhân viên",
              avatar: cur.avatar || "",
              empCode: cur.empCode || "CBCNV",
            });
          }
        } catch (e) {}
      }
    }
    loadUser();
    window.addEventListener("tbs_profile_updated", loadUser);
    return () => window.removeEventListener("tbs_profile_updated", loadUser);
  }, []);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<KaizenProposal | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailActiveTab, setDetailActiveTab] = useState<"INFO" | "EVALUATION" | "RATING">("INFO");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalProposal, setApprovalModalProposal] = useState<KaizenProposal | null>(null);
  const [activeProposal, setActiveProposal] = useState<KaizenProposal | null>(null);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // ⚡ Fast Badge Counter State (Stale-While-Revalidate with localStorage)
  const [statsData, setStatsData] = useState<{
    thiDua: number;
    choReview: number;
    choDanhGia: number;
    daDanhGia: number;
    luuTru: number;
    regions: Record<string, number>;
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("tbs_kaizen_stats_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object" && parsed.regions) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return {
      thiDua: 0,
      choReview: 0,
      choDanhGia: 0,
      daDanhGia: 0,
      luuTru: 0,
      regions: {}
    };
  });
  const [isSyncingStats, setIsSyncingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setIsSyncingStats(true);
      const res = await fetch("/api/ci-kaizen/stats");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) {
          setStatsData(json.stats);
          if (typeof window !== "undefined") {
            localStorage.setItem("tbs_kaizen_stats_v1", JSON.stringify(json.stats));
          }
        }
      }
    } catch (e) {
      console.warn("Lỗi đồng bộ badge stats:", e);
    } finally {
      setIsSyncingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCreateDropdownOpen(false);
      }
    };

    if (isCreateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isCreateDropdownOpen]);

  // Cloudinary Configuration
  const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
  const CLOUDINARY_PRESETS = {
    image: "vpchuoisk",
    video: "vpchuoisk",
  };

  const uploadToCloudinary = async (fileOrDataUrl: File | string, fileType: "image" | "video"): Promise<string> => {
    try {
      const formData = new FormData();
      const preset = CLOUDINARY_PRESETS[fileType];

      if (typeof fileOrDataUrl === "string") {
        const response = await fetch(fileOrDataUrl);
        const blob = await response.blob();
        formData.append("file", blob);
      } else {
        formData.append("file", fileOrDataUrl);
      }

      formData.append("upload_preset", preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${fileType}/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || `Failed to upload ${fileType}`);
      }

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error(`Cloudinary ${fileType} upload error:`, err);
      throw err;
    }
  };

  // Create Form State (Matching /work/kaizen/register structure)
  const [createForm, setCreateForm] = useState({
    proposerName: "",
    proposerEmpCode: "",
    proposerPosition: "",
    proposerMonth: new Date().getMonth() + 1,
    proposerYear: new Date().getFullYear(),
    factory: "VP2 SKECHERS",
    department: "",
    region: "Kiên Giang 1",
    customer: "",
    registrationType: "CHO_DANH_GIA",
    category: "PRODUCTIVITY",
    categoryLabel: "3.Tăng Năng suất",
    title: "",
    beforeDescription: "",
    afterSolution: "",
    productGroup: "",
    productCode: "",
    quantity: 0,
    savedSeconds: 30,
    pricingDirection: "THOI_GIAN",
    efficiencyValueVND: 0,
    beforeImageUrl: "",
    afterImageUrl: "",
    beforeVideoUrl: "",
    afterVideoUrl: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "beforeImageUrl" | "afterImageUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("❌ Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("❌ Dung lượng ảnh tối đa là 10MB");
      return;
    }

    try {
      showToast("☁️ Đang tải ảnh lên Cloudinary...");
      const cloudinaryUrl = await uploadToCloudinary(file, "image");
      setCreateForm((prev) => ({
        ...prev,
        [fieldName]: cloudinaryUrl,
      }));
      showToast("✅ Ảnh đã tải lên thành công!");
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCreateForm((prev) => ({
          ...prev,
          [fieldName]: event.target?.result as string,
        }));
        showToast("✅ Ảnh đã lưu!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "beforeVideoUrl" | "afterVideoUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast("❌ Vui lòng chọn file video (MP4, WEBM, MOV)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast("❌ Dung lượng video tối đa là 50MB");
      return;
    }

    try {
      showToast("🎬 Đang tải video lên Cloudinary...");
      const cloudinaryUrl = await uploadToCloudinary(file, "video");
      setCreateForm((prev) => ({
        ...prev,
        [fieldName]: cloudinaryUrl,
      }));
      showToast("✅ Video đã tải lên thành công!");
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCreateForm((prev) => ({
          ...prev,
          [fieldName]: event.target?.result as string,
        }));
        showToast("✅ Video đã lưu!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Evaluate Form State
  const [evalForm, setEvalForm] = useState({
    awardTitle: "Giải Nhất",
    scorePoints: 95.0,
    reviewComment: "",
  });
  const [evalErrors, setEvalErrors] = useState<{
    awardTitle?: string;
    scorePoints?: string;
    reviewComment?: string;
  }>({});

  // Star Rating Form State
  const [starRating, setStarRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Proposals from D1 Database
  const fetchProposals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedRegion !== "ALL") params.append("region", selectedRegion);
      if (selectedRegType !== "ALL") params.append("registration_type", selectedRegType);
      if (selectedSubStatus !== "ALL") params.append("sub_status", selectedSubStatus);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/ci-kaizen?${params.toString()}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProposals(json.data);
        // Refresh server stats whenever proposal list updates
        fetchStats();
      }
    } catch (err) {
      showToast("❌ Lỗi khi tải danh sách cải tiến Kaizen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [selectedCategory, selectedRegion, selectedRegType, selectedSubStatus, selectedStatus]);

  // Handle View Counter Increment
  const handleRecordView = async (prop: KaizenProposal) => {
    setActiveProposal(prop);
    setIsDetailModalOpen(true);
    try {
      await fetch("/api/ci-kaizen/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prop.id }),
      });
      // Local optimistic increment
      setProposals((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, view_count: p.view_count + 1 } : p))
      );
    } catch (e) {}
  };

  // Handle Vote Button Click
  const handleVote = async (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/ci-kaizen/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: propId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("👍 Đã bình chọn đề xuất cải tiến thành công!");
        setProposals((prev) =>
          prev.map((p) => (p.id === propId ? { ...p, vote_count: p.vote_count + 1 } : p))
        );
      } else {
        showToast(`⚠️ ${json.message || "Không thể bình chọn!"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi kết nối máy chủ");
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !createForm.proposerName.trim() ||
      !createForm.proposerEmpCode.trim() ||
      !createForm.proposerPosition.trim() ||
      !createForm.factory.trim() ||
      !createForm.department.trim() ||
      !createForm.region.trim() ||
      !createForm.category.trim() ||
      !createForm.title.trim() ||
      !createForm.beforeDescription.trim() ||
      !createForm.afterSolution.trim() ||
      !createForm.pricingDirection.trim()
    ) {
      showToast("⚠️ Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc có dấu (*) màu đỏ!");
      return;
    }

    try {
      const res = await fetch("/api/ci-kaizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          registrationType: createForm.registrationType || "CHO_DANH_GIA",
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Đã gửi thành công đề xuất cải tiến ${json.code || "mới"}!`);
        setIsCreateModalOpen(false);
        fetchProposals();
        fetchStats();
      } else {
        showToast(`❌ ${json.message || "Lỗi khi gửi đề xuất"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi mạng hoặc máy chủ!");
    }
  };

  // Handle Direct Star Rating (Single action 0.5 - 5.0)
  const handleDirectRating = async (proposalId: string, score: number) => {
    try {
      const res = await fetch("/api/ci-kaizen/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          score,
          comments: ratingComment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || `⭐ Đã gửi đánh giá ${score} sao thành công!`);
        fetchProposals();
        fetchStats();
        if (activeProposal && activeProposal.id === proposalId) {
          const updated = {
            ...activeProposal,
            sub_status: json.isCompleted ? "DA_DANH_GIA" : activeProposal.sub_status,
            avg_rating: json.averageScore || activeProposal.avg_rating,
            average_score: json.averageScore || activeProposal.average_score,
          };
          setActiveProposal(updated);
        }
      } else {
        showToast(`❌ ${json.message || "Lỗi khi gửi đánh giá"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi kết nối máy chủ!");
    }
  };

  // Handle Admin Exempt Reviewer Override
  const handleExemptReviewer = async (proposalId: string, reviewerEmpCode: string) => {
    try {
      const res = await fetch("/api/ci-kaizen/exempt-reviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, reviewerEmpCode }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✅ ${json.message}`);
        fetchProposals();
        if (activeProposal && activeProposal.id === proposalId) {
          const updated = {
            ...activeProposal,
            sub_status: json.isCompleted ? "DA_DANH_GIA" : activeProposal.sub_status,
            required_reviewer_ids_json: JSON.stringify(json.requiredReviewers),
          };
          setActiveProposal(updated);
        }
      } else {
        showToast(`❌ ${json.message || "Lỗi thực hiện miễn nhiệm"}`);
      }
    } catch (e) {
      showToast("❌ Lỗi kết nối!");
    }
  };

  // Handle Delete Proposal
  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đề xuất cải tiến này khỏi hệ thống D1 Database?")) return;
    try {
      const res = await fetch(`/api/ci-kaizen?id=${proposalId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("🗑️ Đã xóa đề xuất cải tiến thành công!");
        setIsDetailModalOpen(false);
        fetchProposals();
      } else {
        showToast(`❌ ${json.message || "Lỗi khi xóa đề xuất"}`);
      }
    } catch (e) {
      showToast("❌ Lỗi kết nối!");
    }
  };

  // Handle Evaluation Submit (Chấm Điểm & Phê Duyệt Thi Đua)
  const handleEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProposal) return;

    const errors: { awardTitle?: string; scorePoints?: string; reviewComment?: string } = {};
    if (!evalForm.awardTitle.trim()) {
      errors.awardTitle = "Vui lòng chọn Hạng Giải Thưởng!";
    }
    if (!evalForm.scorePoints || isNaN(evalForm.scorePoints) || evalForm.scorePoints <= 0) {
      errors.scorePoints = "Vui lòng nhập Điểm Đánh Giá hợp lệ (lớn hơn 0)!";
    }
    if (!evalForm.reviewComment.trim()) {
      errors.reviewComment = "Vui lòng nhập nhận xét, góp ý về sáng kiến!";
    }

    if (Object.keys(errors).length > 0) {
      setEvalErrors(errors);
      showToast("⚠️ Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc!");
      return;
    }
    setEvalErrors({});

    try {
      const res = await fetch("/api/ci-kaizen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeProposal.id,
          action: "EVALUATE",
          awardTitle: evalForm.awardTitle,
          scorePoints: evalForm.scorePoints,
          reviewComment: evalForm.reviewComment.trim(),
          version: activeProposal.version,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🏆 Đã chấm điểm ${evalForm.scorePoints}đ & trao ${evalForm.awardTitle} thành công!`);
        setIsEvalModalOpen(false);
        fetchProposals();
      } else {
        showToast(`❌ ${json.message || "Lỗi khi chấm điểm"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi kết nối!");
    }
  };

  // Handle Rating Submit (Đánh Giá 1-5 Sao)
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProposal) return;
    try {
      const res = await fetch("/api/ci-kaizen/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: activeProposal.id,
          stars: starRating,
          comments: ratingComment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`⭐ Đã gửi đánh giá ${starRating} sao thành công!`);
        setIsRatingModalOpen(false);
        fetchProposals();
      } else {
        showToast(`❌ ${json.message || "Lỗi khi gửi đánh giá"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi kết nối!");
    }
  };

  // Filtered List Computation
  const filteredProposals = proposals.filter((p) => {
    if (selectedRegion !== "ALL" && !matchRegionFilter(p.region, selectedRegion)) {
      return false;
    }
    // Filter by registration type or Thi đua flag
    if (selectedRegType === "THI_DUA") {
      if (Number(p.is_thi_dua) !== 1) return false;
    } else if (selectedRegType !== "ALL") {
      if (p.registration_type !== selectedRegType) return false;
    }
    // Filter by sub-status
    if (selectedSubStatus !== "ALL") {
      const appStatus = String(p.approval_status || "").toUpperCase();
      const subStatus = String(p.sub_status || "").toUpperCase();
      const mainStatus = String(p.status || "").toUpperCase();

      if (selectedSubStatus === "CHO_REVIEW") {
        const isNotChoReview = appStatus === "PHE_DUYET" || appStatus === "TU_CHOI" || subStatus === "CHO_DANH_GIA" || subStatus === "DA_DANH_GIA" || subStatus === "LUU_TRU" || mainStatus === "APPROVED" || mainStatus === "REJECTED" || mainStatus === "ARCHIVED";
        if (isNotChoReview) return false;
      } else if (selectedSubStatus === "CHO_DANH_GIA") {
        if (!(subStatus === "CHO_DANH_GIA" || appStatus === "PHE_DUYET" || mainStatus === "APPROVED")) return false;
      } else if (selectedSubStatus === "DA_DANH_GIA") {
        if (!(subStatus === "DA_DANH_GIA" || appStatus === "DA_DANH_GIA")) return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.proposer_name.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    return true;
  });

  // Badge Counters derived from persistent statsData state
  const countThiDua = statsData.thiDua || 0;
  const countChoReview = statsData.choReview || 0;
  const countDaDanhGia = statsData.daDanhGia || 0;
  const countChoDanhGia = statsData.choDanhGia || 0;
  const countLuuTru = statsData.luuTru || 0;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col md:flex-row w-full selection:bg-[#006838] selection:text-white">
      {/* ════════════════════════════════════════════════════════════════
          FULL-HEIGHT DARK NAVY SIDEBAR (Matching Target Reference Image)
         ════════════════════════════════════════════════════════════════ */}
      <aside
        className={`bg-[#0b1739] text-slate-200 flex-col flex-shrink-0 transition-all duration-300 select-none z-30 sticky top-0 h-screen overflow-y-auto ${
          isSidebarCollapsed ? "w-20 p-2.5" : "w-64 lg:w-72 p-3.5"
        } flex flex-col justify-between border-r border-slate-800 shadow-xl`}
      >
        <div className="space-y-4">
          {/* Sidebar Header Brand Logo + Help + Collapse */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/90">
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-xl px-2.5 py-1 flex items-center justify-center border border-slate-200 shadow-2xs">
                  <img
                    src="/images/tbs-logo.png"
                    alt="TBS Group Logo"
                    className="h-6 w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="mx-auto bg-white rounded-lg p-1">
                <img
                  src="/images/tbs-logo.png"
                  alt="TBS"
                  className="h-5 w-auto object-contain"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs font-black hover:bg-amber-500/30 transition-colors cursor-pointer"
                  title="Hướng dẫn sử dụng"
                >
                  ?
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-7 h-7 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                title={isSidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
              >
                {isSidebarCollapsed ? <IconChevronRight size={15} /> : <IconChevronLeft size={15} />}
              </button>
            </div>
          </div>

          {/* Navigation Section 1: MENU */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">
                MENU
              </h4>
            )}
            <div className="space-y-1">
              {/* Nút Quay lại /work */}
              <Link
                href="/work"
                className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2"
                } bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700/80 shadow-2xs mb-1`}
                title="Quay lại Trang Chủ Công Việc (/work)"
              >
                <IconArrowLeft size={18} className="shrink-0 text-emerald-400" />
                {!isSidebarCollapsed && <span className="truncate">Về Trang Chủ</span>}
              </Link>



              {/* Thư viện */}
              <button
                type="button"
                onClick={() => setActiveTab("LIBRARY")}
                className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2.5"
                } ${
                  activeTab === "LIBRARY"
                    ? "bg-gradient-to-r from-[#b38549] to-[#996d36] text-white font-extrabold shadow-md shadow-amber-950/40"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white font-bold text-xs"
                }`}
              >
                <IconPhoto size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span className="text-xs truncate">Thư viện</span>}
              </button>

              {/* Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab("DASHBOARD")}
                className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2.5"
                } ${
                  activeTab === "DASHBOARD"
                    ? "bg-gradient-to-r from-[#b38549] to-[#996d36] text-white font-extrabold shadow-md shadow-amber-950/40"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white font-bold text-xs"
                }`}
              >
                <IconChartBar size={18} className="shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
              </button>

              {/* Cảnh báo sớm Ban 2.2 */}
              <button
                type="button"
                onClick={() => setActiveTab("EARLY_WARNING")}
                className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2.5"
                } ${
                  activeTab === "EARLY_WARNING"
                    ? "bg-rose-900 text-white font-extrabold shadow-md border border-rose-600"
                    : "text-rose-300 hover:bg-rose-950/60 font-bold text-xs"
                }`}
              >
                <IconShieldCheck size={18} className="shrink-0 text-rose-400" />
                {!isSidebarCollapsed && <span className="truncate">Cảnh báo Ban 2.2</span>}
              </button>

              {/* Đăng tải */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSidebarCollapsed ? "p-2.5 justify-center" : "px-3.5 py-2"
                } text-slate-300 hover:bg-slate-800/80 hover:text-white font-bold text-xs`}
              >
                <IconCloudUpload size={18} className="shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span className="truncate">Đăng tải nhanh</span>}
              </button>
            </div>
          </div>

          {/* Navigation Section 2: LỌC NHANH (Embedded in Dark Navy Sidebar) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  LỌC NHANH
                </h4>
                {isSyncingStats && (
                  <span className="flex h-2 w-2 relative" title="Đang đồng bộ số liệu...">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            )}

            {/* Filter 1: Loại đăng ký */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsRegTypeExpanded(!isRegTypeExpanded)}
                className={`w-full flex items-center justify-between text-xs font-extrabold text-slate-200 rounded-lg ${
                  isSidebarCollapsed ? "justify-center p-2" : "px-2 py-1 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconTrophy size={16} className="text-amber-400 shrink-0" />
                  {!isSidebarCollapsed && <span>Loại đăng ký</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-slate-400">
                    {isRegTypeExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                )}
              </button>

              {(!isSidebarCollapsed && isRegTypeExpanded) && (
                <div className="space-y-0.5 pl-2 text-xs font-bold">
                  {/* Thi đua */}
                  <button
                    onClick={() => { setSelectedRegType("THI_DUA"); setSelectedSubStatus("ALL"); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      selectedRegType === "THI_DUA" && selectedSubStatus === "ALL"
                        ? "bg-[#006838] text-white font-extrabold"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>🏆 Thi đua</span>
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold">
                      {countThiDua}
                    </span>
                  </button>

                  {/* Chờ phê duyệt — top-level / sub */}
                  <button
                    onClick={() => { setSelectedRegType("ALL"); setSelectedSubStatus("CHO_REVIEW"); }}
                    className={`w-full text-left px-3 py-1 rounded-lg flex items-center justify-between text-[11px] transition-colors ${
                      selectedSubStatus === "CHO_REVIEW"
                        ? "bg-blue-950/80 text-blue-300 font-extrabold"
                        : "text-blue-400/80 hover:bg-slate-800/60 hover:text-blue-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <IconUserCheck size={13} className="text-blue-400 shrink-0" />
                      <span>Chờ phê duyệt</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-extrabold">
                      {countChoReview}
                    </span>
                  </button>

                  {/* Chờ đánh giá — top-level */}
                  <button
                    onClick={() => { setSelectedRegType("THI_DUA"); setSelectedSubStatus("CHO_DANH_GIA"); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      selectedSubStatus === "CHO_DANH_GIA"
                        ? "bg-amber-950/80 text-amber-300 font-extrabold"
                        : "text-amber-400/90 hover:bg-slate-800/60 hover:text-amber-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <IconClock size={13} className="text-amber-400 shrink-0" />
                      <span>Chờ đánh giá</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-extrabold">
                      {countChoDanhGia}
                    </span>
                  </button>

                  {/* Đã đánh giá — sub of Chờ đánh giá */}
                  <button
                    onClick={() => { setSelectedRegType("THI_DUA"); setSelectedSubStatus("DA_DANH_GIA"); }}
                    className={`w-full text-left px-3 py-1 rounded-lg flex items-center justify-between text-[11px] transition-colors ${
                      selectedSubStatus === "DA_DANH_GIA"
                        ? "bg-emerald-950/80 text-emerald-300 font-extrabold"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <IconCircleCheck size={13} className="text-emerald-400 shrink-0" />
                      <span>Đã đánh giá</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold">
                      {countDaDanhGia}
                    </span>
                  </button>

                  {/* Lưu trữ */}
                  <button
                    onClick={() => { setSelectedRegType("LUU_TRU"); setSelectedSubStatus("ALL"); }}
                    className={`w-full text-left px-2.5 py-1 rounded-lg flex items-center justify-between transition-colors ${
                      selectedRegType === "LUU_TRU"
                        ? "bg-slate-800 text-white font-extrabold"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <IconBox size={13} className="text-slate-400 shrink-0" />
                      <span>Lưu trữ</span>
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-extrabold">
                      {countLuuTru}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Filter 2: Khu vực */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsRegionExpanded(!isRegionExpanded)}
                className={`w-full flex items-center justify-between text-xs font-extrabold text-slate-200 rounded-lg ${
                  isSidebarCollapsed ? "justify-center p-2" : "px-2 py-1 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconBuilding size={16} className="text-slate-400 shrink-0" />
                  {!isSidebarCollapsed && <span>Khu vực</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-slate-400">
                    {isRegionExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                )}
              </button>

              {(!isSidebarCollapsed && isRegionExpanded) && (
                <div className="space-y-0.5 pl-2 text-xs font-bold">
                  {/* THKG header - non-clickable label */}
                  <div className="px-2 py-1 text-slate-400 text-[11px] font-extrabold tracking-wider uppercase">
                    THKG
                  </div>
                  {/* Sub-items */}
                  <div className="pl-4 space-y-0.5 border-l border-slate-700/80 ml-2 mb-1">
                    {TH_KG_SUB_ITEMS.map((subItem) => {
                      const cnt = (statsData.regions && statsData.regions[subItem] !== undefined)
                        ? statsData.regions[subItem]
                        : 0;
                      return (
                        <button
                          key={subItem}
                          onClick={() => setSelectedRegion(selectedRegion === subItem ? "ALL" : subItem)}
                          className={`w-full text-left px-2 py-0.5 rounded flex items-center justify-between text-[11px] transition-colors ${
                            selectedRegion === subItem ? "bg-emerald-900/80 text-emerald-200 font-black" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 font-medium"
                          }`}
                        >
                          <span>{subItem}</span>
                          <span className="text-[9px] text-slate-400 font-mono">({cnt})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filter 3: Phân loại */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                className={`w-full flex items-center justify-between text-xs font-extrabold text-slate-200 rounded-lg ${
                  isSidebarCollapsed ? "justify-center p-2" : "px-2 py-1 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconTag size={16} className="text-slate-400 shrink-0" />
                  {!isSidebarCollapsed && <span>Phân loại</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-slate-400">
                    {isCategoryExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                  </span>
                )}
              </button>

              {(!isSidebarCollapsed && isCategoryExpanded) && (
                <div className="space-y-0.5 pl-2 text-xs font-bold">
                  {CATEGORIES.map((c) => {
                    const cnt = proposals.filter((p) => p.category === c.id).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(selectedCategory === c.id ? "ALL" : c.id)}
                        className={`w-full text-left px-2 py-0.5 rounded-lg flex items-center justify-between transition-colors ${
                          selectedCategory === c.id ? "bg-[#006838] text-white font-extrabold" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{c.label}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[9px] font-extrabold">
                          {cnt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Info Pill (Synchronized with Logged-in Session) */}
        <div className="pt-3 border-t border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-400/40 shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#006838] text-white flex items-center justify-center text-xs font-black shrink-0 border border-emerald-400/40 shadow-2xs">
                {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : "SK"}
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="min-w-0 leading-tight">
                <span className="text-xs font-black text-white block truncate" title={currentUser.name}>
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium truncate max-w-[130px]" title={formatTitleWithDepartment(currentUser.title, (currentUser as any).department)}>
                  {formatTitleWithDepartment(currentUser.title, (currentUser as any).department)}
                </span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button type="button" className="text-slate-400 hover:text-white p-1 transition-colors">
              <IconDotsVertical size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════
          RIGHT MAIN CONTENT AREA
         ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 p-4 lg:p-6 space-y-4 min-w-0 overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <IconSparkles size={16} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeTab === "DASHBOARD" ? (
        <KaizenDashboard
          proposals={proposals}
          onBackToLibrary={() => setActiveTab("LIBRARY")}
        />
      ) : activeTab === "EARLY_WARNING" ? (
        <KaizenEarlyWarning
          proposals={proposals}
          onSelectProposal={(p) => {
            setActiveProposal(p);
            setIsDetailModalOpen(true);
          }}
        />
      ) : (
        <>
      {/* ════════════════════════════════════════════════════════════════
          ROW 1: TITLE & ACTION BUTTONS BAR (Exact Matching Image 2)
         ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
            <IconPhoto size={18} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Thư Viện Cải Tiến</h2>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={() => setActiveTab("EARLY_WARNING")}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <IconShieldCheck size={15} />
            <span>🚨 Cảnh Báo Ban 2.2</span>
          </button>

          <button
            onClick={() => setActiveTab("DASHBOARD")}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-2xs"
          >
            <IconChartBar size={15} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md border border-amber-300"
          >
            <IconQrcode size={16} />
            <span>📱 QR Công Nhân</span>
          </button>
          {/* Toggle View Mode (Lưới / Danh sách) */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => setViewMode("GRID")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-slate-100 text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <IconLayoutGrid size={15} />
              <span>Lưới</span>
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-slate-100 text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <IconList size={15} />
              <span>Danh sách</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchProposals}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-2xs"
            title="Tải lại dữ liệu"
          >
            <IconRefresh size={15} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>

          {/* Create New Proposal Button (Direct Open Modal) */}
          <button
            onClick={() => {
              setCreateForm({ ...createForm, registrationType: "THI_DUA" });
              setIsCreateModalOpen(true);
              setIsCreateDropdownOpen(false);
            }}
            className="px-4 py-1.5 rounded-xl bg-[#11244e] hover:bg-[#0c1a38] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Đăng ký</span>
          </button>

          {/* Excel Export Button (Emerald Outlined Matching Image 2) */}
          <button
            onClick={() => showToast("📊 Đã xuất file Excel dữ liệu cải tiến thành công!")}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-600 text-xs font-extrabold border border-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <IconDownload size={15} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 2: FILTER INPUTS BAR (8 Controls Pill Card Matching Image 2)
         ════════════════════════════════════════════════════════════════ */}
      <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 outline-none focus:border-[#006838]"
          >
            <option value="ALL">🏆 Tất cả loại</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative col-span-2 sm:col-span-1 md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Tìm mã hàng, tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-800 outline-none focus:border-[#006838]"
            />
            <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Danh mục */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 outline-none focus:border-[#006838]"
          >
            <option value="ALL">📁 Danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Khu vực */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 outline-none focus:border-[#006838]"
          >
            <option value="ALL">🏢 Khu vực</option>
            <option value="THKG">THKG</option>
            <option value="Kiên Giang 1">Kiên Giang 1</option>
            <option value="Kiên Giang 2">Kiên Giang 2</option>
            <option value="Hoàn Thiện Đế">Hoàn Thiện Đế</option>
          </select>

          {/* Nhóm SP */}
          <select className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 outline-none focus:border-[#006838]">
            <option value="ALL">📦 Nhóm SP</option>
            <option value="DAN_DE">Dán Đế</option>
            <option value="MAY_QUAI">May Quai</option>
            <option value="DE_CAU_TRUC">Đế Cấu Trúc</option>
          </select>

          {/* Tháng/Năm */}
          <select className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 outline-none focus:border-[#006838]">
            <option value="ALL">📅 Tháng/Năm</option>
            <option value="8/2026">T8/2026</option>
            <option value="7/2026">T7/2026</option>
          </select>

          {/* Reset Filters Button */}
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedRegion("ALL");
              setSelectedRegType("ALL");
              setSelectedSubStatus("ALL");
              setSelectedStatus("ALL");
            }}
            className="w-full px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
          >
            <IconRotate size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 3: COUNTS BAR (Separate Pill Card Matching Image 2)
         ════════════════════════════════════════════════════════════════ */}
      <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-6 text-xs font-extrabold text-slate-700">
        <span className="flex items-center gap-1.5">
          <span className="text-blue-600 font-bold">📁</span>
          <span>Tổng: <strong className="font-black text-slate-900">{proposals.length}</strong></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-bold">🔻</span>
          <span>Đã lọc: <strong className="font-black text-slate-900">{filteredProposals.length}</strong></span>
        </span>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PROPOSALS CONTENT AREA (FULL WIDTH 5 COLUMNS)
         ════════════════════════════════════════════════════════════════ */}
      <div className="w-full space-y-4">
          {/* GRID VIEW RENDERING (Exact Image 1 Cards) */}
          {viewMode === "GRID" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProposals.map((prop) => {
                const catObj = CATEGORIES.find((c) => c.id === prop.category) || CATEGORIES[7];
                return (
                  <div
                    key={prop.id}
                    onClick={() => handleRecordView(prop)}
                    className="rounded-2xl bg-[#ffffff] border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#006838]/60 transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Image / Thumbnail Section with Badges Overlay */}
                    <div className="relative h-28 bg-slate-100 border-b border-slate-100 overflow-hidden flex items-center justify-center group/img">
                      {prop.before_image_url ? (
                        <img
                          src={prop.before_image_url}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 text-slate-400">
                          <IconPhoto size={26} />
                          <span className="text-[10px] font-bold">Chưa có ảnh</span>
                        </div>
                      )}

                      {/* Top Badges Over Image (Matching Screenshot) */}
                      <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none gap-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs ${catObj.color}`}>
                          {prop.category_label || catObj.label}
                        </span>
                        {Number(prop.is_thi_dua) === 1 ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 text-[9px] font-black shadow-2xs flex items-center gap-0.5">
                            🏆 Thi đua
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-mono font-bold shadow-2xs">
                            T8/2026
                          </span>
                        )}
                      </div>

                      {/* Proposer Info Bar Overlay at Bottom of Image */}
                      <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent text-white flex items-center justify-between text-[10px] font-bold">
                        <div className="flex items-center gap-1 truncate max-w-[70%]">
                          <IconUser size={12} className="text-slate-300 shrink-0" />
                          <span className="truncate">{prop.proposer_name}</span>
                        </div>
                        <span className="text-[9px] text-amber-300 font-mono">#{prop.code}</span>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-snug group-hover:text-[#006838] transition-colors" title={prop.title}>
                          {prop.title}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 truncate">
                            <IconMapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{prop.region}</span>
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <IconBuildingFactory size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{prop.department}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <button
                          type="button"
                          onClick={(e) => handleVote(e, prop.id)}
                          className="flex items-center gap-1 hover:text-emerald-600 font-bold transition-colors cursor-pointer"
                        >
                          <IconThumbUp size={13} className="text-slate-400 hover:text-emerald-600" />
                          <span>{prop.vote_count || 0}</span>
                        </button>

                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <IconEye size={13} />
                            <span>{prop.view_count || 0}</span>
                          </span>

                          {/* 1. Nút "Phê duyệt" dành cho trạng thái CHỜ PHÊ DUYỆT (Bước 3 - QĐ-TBKG) */}
                          {(prop.sub_status === "CHO_REVIEW" || prop.status === "SUBMITTED" || prop.approval_status === "PENDING") && isExecutiveOrAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setApprovalModalProposal(prop);
                                setIsApprovalModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Phê duyệt tính khả thi sáng kiến (Bước 3)"
                            >
                              <IconShieldCheck size={12} />
                              <span>Phê duyệt</span>
                            </button>
                          )}

                          {/* 2. Nút "Chấm điểm" dành cho trạng thái CHỜ ĐÁNH GIÁ (Bước 5 - QĐ-TBKG) */}
                          {(prop.sub_status === "CHO_DANH_GIA" || prop.approval_status === "PHE_DUYET") && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEvaluatingProposal(prop);
                                setIsEvaluationModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Chấm điểm chuyên môn 5 tiêu chí QĐ-TBKG"
                            >
                              <IconStar size={12} />
                              <span>Chấm điểm</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW RENDERING */}
          {viewMode === "LIST" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase">
                      <th className="p-3">Mã</th>
                      <th className="p-3">Tiêu đề đề xuất</th>
                      <th className="p-3">Phân loại</th>
                      <th className="p-3">Khu vực</th>
                      <th className="p-3">Người đề xuất</th>
                      <th className="p-3 text-center">Trạng thái</th>
                      <th className="p-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredProposals.map((prop) => {
                      const isPendingFeasibility = prop.sub_status === "CHO_REVIEW" || prop.status === "SUBMITTED" || prop.approval_status === "PENDING";
                      const isPendingEvaluation = prop.sub_status === "CHO_DANH_GIA" || prop.approval_status === "PHE_DUYET";

                      return (
                        <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-700">#{prop.code}</td>
                          <td className="p-3 font-bold text-slate-900">{prop.title}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#006838] text-[10px] font-bold border border-emerald-200">
                              {prop.category_label}
                            </span>
                          </td>
                          <td className="p-3">{prop.region}</td>
                          <td className="p-3">{prop.proposer_name}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              isPendingFeasibility
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : isPendingEvaluation
                                ? "bg-amber-50 text-amber-900 border-amber-200"
                                : prop.sub_status === "DA_DANH_GIA"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              {isPendingFeasibility
                                ? "Chờ phê duyệt"
                                : isPendingEvaluation
                                ? "Chờ đánh giá"
                                : prop.sub_status === "DA_DANH_GIA"
                                ? "Đã đánh giá"
                                : "Lưu trữ"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleRecordView(prop)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#006838] hover:text-white transition-colors cursor-pointer text-[11px] font-bold"
                              >
                                Xem
                              </button>
                              {isPendingFeasibility && isExecutiveOrAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setApprovalModalProposal(prop);
                                    setIsApprovalModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-[11px] font-extrabold flex items-center gap-1"
                                >
                                  <IconShieldCheck size={12} />
                                  <span>Phê duyệt</span>
                                </button>
                              )}
                              {isPendingEvaluation && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEvaluatingProposal(prop);
                                    setIsEvaluationModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer text-[11px] font-extrabold flex items-center gap-1"
                                >
                                  <IconStar size={12} />
                                  <span>Chấm điểm</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        </>
      )}
      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL 1: CREATE NEW PROPOSAL FORM (MATCHING /work/kaizen/register)
         ════════════════════════════════════════════════════════════════ */}
      {isCreateModalOpen && (
        <KaizenPublicSubmitForm
          isModal={true}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchProposals();
          }}
        />
      )}

      {/* MODAL EDIT: EDIT PROPOSAL FORM */}
      {isEditModalOpen && editingProposal && (
        <KaizenPublicSubmitForm
          isModal={true}
          isEdit={true}
          proposalId={editingProposal.id}
          initialData={editingProposal}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProposal(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setEditingProposal(null);
            fetchProposals();
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL 2: DETAIL & EVALUATION MODAL (KaizenDetailModal)
         ════════════════════════════════════════════════════════════════ */}
      {isDetailModalOpen && activeProposal && (
        <KaizenDetailModal
          proposal={activeProposal}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={() => {
            setEditingProposal(activeProposal);
            setIsDetailModalOpen(false);
            setIsEditModalOpen(true);
          }}
          onDelete={() => handleDeleteProposal(activeProposal.id)}
          onEvaluate={() => {
            fetchProposals();
          }}
          onRate={() => {
            fetchProposals();
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL 3: EVALUATE & AWARD MODAL
         ════════════════════════════════════════════════════════════════ */}
      {isEvalModalOpen && activeProposal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between flex-shrink-0 z-10">
              <div className="flex items-center gap-2.5">
                <IconTrophy size={22} />
                <h3 className="text-base font-black tracking-tight">Chấm Điểm Thi Đua Kaizen</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEvalModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleEvalSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-bold text-slate-700">
              {/* Field 1: Hạng Giải Thưởng * */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-extrabold">
                  Hạng Giải Thưởng <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <select
                  value={evalForm.awardTitle}
                  onChange={(e) => {
                    setEvalForm({ ...evalForm, awardTitle: e.target.value });
                    if (evalErrors.awardTitle) setEvalErrors({ ...evalErrors, awardTitle: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${
                    evalErrors.awardTitle ? "border-rose-500 bg-rose-50/40 text-rose-900" : "border-slate-300 focus:border-amber-600"
                  }`}
                >
                  <option value="Giải Nhất">🥇 Giải Nhất (1.000.000đ)</option>
                  <option value="Giải Nhì">🥈 Giải Nhì (500.000đ)</option>
                  <option value="Giải Ba">🥉 Giải Ba (300.000đ)</option>
                  <option value="Giải Tư">🎖️ Giải Tư (200.000đ)</option>
                  <option value="Giải Khuyến Khích">🎗️ Giải Khuyến Khích (100.000đ)</option>
                </select>
                {evalErrors.awardTitle && (
                  <p className="text-[11px] font-bold text-rose-600 mt-1">{evalErrors.awardTitle}</p>
                )}
              </div>

              {/* Field 2: Điểm Đánh Giá Thang 100 * */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-extrabold">
                  Điểm Đánh Giá Thang 100 <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={evalForm.scorePoints}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value || "0");
                    const autoAward = val >= 90 ? "Giải Nhất" : val >= 80 ? "Giải Nhì" : val >= 70 ? "Giải Ba" : val >= 60 ? "Giải Tư" : "Giải Khuyến Khích";
                    setEvalForm({ ...evalForm, scorePoints: val, awardTitle: autoAward });
                    if (evalErrors.scorePoints) setEvalErrors({ ...evalErrors, scorePoints: undefined });
                    if (evalErrors.awardTitle) setEvalErrors({ ...evalErrors, awardTitle: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none transition-colors ${
                    evalErrors.scorePoints ? "border-rose-500 bg-rose-50/40 text-rose-900" : "border-slate-300 focus:border-amber-600"
                  }`}
                />
                <span className="text-[10px] text-amber-700 font-medium block">
                  💡 Hạng giải tự động xếp: ≥90đ (Nhất - 1TR), ≥80đ (Nhì - 500k), ≥70đ (Ba - 300k), ≥60đ (Tư - 200k), &lt;60đ (Khuyến Khích - 100k).
                </span>
                {evalErrors.scorePoints && (
                  <p className="text-[11px] font-bold text-rose-600 mt-1">{evalErrors.scorePoints}</p>
                )}
              </div>

              {/* Field 3: Nhận xét * (Mới) */}
              <div className="space-y-1">
                <label className="block text-slate-900 font-extrabold">
                  Nhận xét <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={evalForm.reviewComment}
                  onChange={(e) => {
                    setEvalForm({ ...evalForm, reviewComment: e.target.value });
                    if (evalErrors.reviewComment) setEvalErrors({ ...evalErrors, reviewComment: undefined });
                  }}
                  placeholder="Nhập nhận xét, góp ý về sáng kiến..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none resize-none transition-colors ${
                    evalErrors.reviewComment ? "border-rose-500 bg-rose-50/40 text-rose-900 placeholder:text-rose-400" : "border-slate-300 focus:border-amber-600"
                  }`}
                />
                {evalErrors.reviewComment && (
                  <p className="text-[11px] font-bold text-rose-600 mt-1">{evalErrors.reviewComment}</p>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEvalModalOpen(false);
                    setEvalErrors({});
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <IconAward size={16} />
                  <span>Xác Nhận Trao Giải</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL 4: STAR RATING MODAL (0.5 to 5.0 Step 0.5)
         ════════════════════════════════════════════════════════════════ */}
      {isRatingModalOpen && activeProposal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#0b1739] to-slate-800 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  ⭐
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Đánh Giá Sao Đề Xuất</h3>
                  <span className="text-[10px] text-slate-300 font-mono">#{activeProposal.code}</span>
                </div>
              </div>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
              {/* Proposal Header Banner */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-extrabold text-slate-900 text-xs line-clamp-2">{activeProposal.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-bold">
                  <span>Người đăng: {activeProposal.proposer_name}</span>
                  <span>Khu vực: {activeProposal.region}</span>
                </div>
              </div>

              {/* Status Tag Badge & Progress Notice */}
              {activeProposal.registration_type === "LUU_TRU" ? (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-slate-700 font-bold text-center">
                  📦 Đề xuất thuộc mục <strong>Lưu Trữ</strong> — Không thuộc luồng thi đua chấm điểm sao.
                </div>
              ) : activeProposal.sub_status === "DA_DANH_GIA" ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700">
                    <IconShieldCheck size={18} />
                    <span>🏆 ĐÃ HOÀN TẤT ĐÁNH GIÁ (Khoá chỉnh sửa)</span>
                  </div>
                  <p className="text-[11px] font-normal text-emerald-800">
                    Tất cả sếp có quyền đã chấm xong. Bài đạt điểm trung bình: <strong>{(activeProposal.average_score || activeProposal.avg_rating || 0).toFixed(1)} ⭐</strong>
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-amber-700 font-black">
                      ⏳ Đang Chờ Đánh Giá
                    </span>
                    <span className="text-[11px] font-black text-amber-800">
                      Tiến độ: {activeProposal.rating_count || 0}/5 sếp đã chấm
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(((activeProposal.rating_count || 0) / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Half-Star Rating Widget */}
              {activeProposal.registration_type === "THI_DUA" && (
                <div className="space-y-2 p-4 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
                  <label className="font-black text-slate-900 block text-xs">
                    {activeProposal.sub_status === "DA_DANH_GIA"
                      ? "Điểm Trung Bình Chính Thức:"
                      : "Bấm Chọn Số Sao (0.5 – 5.0 ⭐, bước 0.5):"}
                  </label>

                  <div className="flex justify-center py-2">
                    <HalfStarRating
                      value={activeProposal.average_score || activeProposal.avg_rating || starRating}
                      readOnly={activeProposal.sub_status === "DA_DANH_GIA"}
                      size={28}
                      onChange={(newScore) => {
                        setStarRating(newScore);
                        if (activeProposal.sub_status !== "DA_DANH_GIA") {
                          handleDirectRating(activeProposal.id, newScore);
                        }
                      }}
                    />
                  </div>

                  {activeProposal.sub_status !== "DA_DANH_GIA" && (
                    <p className="text-[10px] text-slate-500 font-semibold italic">
                      💡 Bấm nửa sao trái (ví dụ 3.5⭐) hoặc nửa sao phải (ví dụ 4.0⭐) để tự động duyệt &amp; ghi nhận điểm ngay lập tức.
                    </p>
                  )}
                </div>
              )}

              {/* Optional Comment Textarea */}
              {activeProposal.sub_status !== "DA_DANH_GIA" && activeProposal.registration_type === "THI_DUA" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-[11px]">Ghi chú / Nhận xét thêm (Không bắt buộc):</label>
                  <textarea
                    rows={2}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Nhập nhận xét về tính sáng tạo, hiệu quả..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Admin Reviewer Exemption Control */}
              {currentUser.roleCode === "TONG_GIAM_DOC" || currentUser.empCode === "202608001" ? (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>🛠️ Quyền Admin: Miễn nhiệm sếp chưa chấm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Mã NV sếp (VD: PTGĐ-002)"
                      id="exemptReviewerInput"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("exemptReviewerInput") as HTMLInputElement;
                        if (input && input.value) {
                          handleExemptReviewer(activeProposal.id, input.value.trim());
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-black border border-rose-200 transition-colors cursor-pointer"
                    >
                      Miễn Nhiệm
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Footer Close */}
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ════════════════════════════════════════════════════════════════
          MODAL 5: WORKER QR CODE MODAL FOR PUBLIC SCAN
         ════════════════════════════════════════════════════════════════ */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-center animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#006838] to-[#0b1739] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <IconQrcode size={22} className="text-amber-400" />
                <h3 className="text-sm font-black tracking-tight text-white">Mã QR Đăng Ký Cho Công Nhân</h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700">
              <p className="text-xs text-slate-600 font-bold">
                Công nhân chỉ cần dùng camera điện thoại quét mã QR này để trực tiếp nộp đề xuất Kaizen <strong>không cần đăng nhập</strong>:
              </p>

              {/* QR Code Container */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center gap-3">
                <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500 shadow-md">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen/register"
                    alt="Mã QR Công Nhân Nộp Bài Kaizen"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 break-all bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen/register
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen/register");
                    showToast("📋 Đã sao chép đường dẫn QR công nhân vào bộ nhớ tạm!");
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
                >
                  <IconCopy size={15} />
                  <span>Sao Chép Link</span>
                </button>

                <a
                  href="/work/kaizen/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#004d29] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <IconExternalLink size={15} />
                  <span>Xem Trang Form</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-black hover:bg-slate-900 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL STEP 5: EVALUATION MODAL */}
      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        proposal={evaluatingProposal}
        onClose={() => {
          setIsEvaluationModalOpen(false);
          setEvaluatingProposal(null);
        }}
        onSuccess={() => {
          showToast("🎉 Đã lưu kết quả đánh giá hiệu quả sáng kiến!");
          fetchProposals();
        }}
      />

      {/* MODAL STEP 3: FEASIBILITY APPROVAL MODAL */}
      <FeasibilityApprovalModal
        isOpen={isApprovalModalOpen}
        proposal={approvalModalProposal}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setApprovalModalProposal(null);
        }}
        onSuccess={() => {
          showToast("🎉 Đã hoàn tất phê duyệt tính khả thi sáng kiến!");
          fetchProposals();
        }}
      />
    </div>
  );
}
