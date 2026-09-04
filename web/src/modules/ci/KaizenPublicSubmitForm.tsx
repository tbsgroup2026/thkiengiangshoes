"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  IconSend,
  IconCheck,
  IconSparkles,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconUserCheck,
  IconClock,
  IconRefresh,
  IconVideo,
  IconX,
  IconLoader2,
  IconAlertCircle,
  IconLock,
  IconLockOpen,
  IconBuildingFactory,
} from "@tabler/icons-react";
import { INITIAL_ORG_TREE } from "./organizationTree";
import KaizenDuplicateCompareModal from "./KaizenDuplicateCompareModal";

export const CATEGORIES = [
  { id: "MATERIAL_SAVING", label: "1.Tiết kiệm Vật tư", color: "bg-amber-600 text-white" },
  { id: "COST_SAVING", label: "2.Tiết kiệm Chi phí", color: "bg-emerald-600 text-white" },
  { id: "PRODUCTIVITY", label: "3.Tăng Năng suất", color: "bg-blue-600 text-white" },
  { id: "SAFETY", label: "4.An toàn lao động", color: "bg-[#006838] text-white" },
  { id: "5S", label: "5.5S", color: "bg-sky-500 text-white" },
  { id: "AUTOMATION", label: "6.Tự động hoá", color: "bg-indigo-600 text-white" },
  { id: "EQUIPMENT", label: "7.MMTB CCDC", color: "bg-purple-600 text-white" },
];

export function normalizeCategoryId(catRaw?: string): string {
  if (!catRaw) return "PRODUCTIVITY";
  const cat = catRaw.trim();
  if (cat === "MATERIAL_SAVING" || cat === "SAVE_MATERIAL" || cat.includes("1.") || cat.includes("Vật tư") || cat.includes("Vat tu")) {
    return "MATERIAL_SAVING";
  }
  if (cat === "COST_SAVING" || cat === "SAVE_COST" || cat.includes("2.") || cat.includes("Chi phí") || cat.includes("Chi phi")) {
    return "COST_SAVING";
  }
  if (cat === "PRODUCTIVITY" || cat === "INCREASE_PRODUCTIVITY" || cat.includes("3.") || cat.includes("Năng suất") || cat.includes("Nang suat")) {
    return "PRODUCTIVITY";
  }
  if (cat === "SAFETY" || cat.includes("4.") || cat.includes("An toàn") || cat.includes("An toan")) {
    return "SAFETY";
  }
  if (cat === "5S" || cat.includes("5.")) {
    return "5S";
  }
  if (cat === "AUTOMATION" || cat.includes("6.") || cat.includes("Tự động") || cat.includes("Tu dong")) {
    return "AUTOMATION";
  }
  if (cat === "EQUIPMENT" || cat === "MMTB_CCDC" || cat.includes("7.") || cat.includes("MMTB") || cat.includes("CCDC")) {
    return "EQUIPMENT";
  }
  return "PRODUCTIVITY";
}

export const REAL_FACTORIES = [
  "Kiên Giang 1",
  "Kiên Giang 2",
  "Kiên Giang 3",
  "Hoàn thiện đế",
  "Phòng kế hoạch",
  "Phòng CN-CI",
  "Phòng chất lượng",
  "Phòng nhân sự",
];

export const REAL_DEPARTMENTS = [
  "VP CHUỖI",
  "VP R&D",
  "ĐẾ - XƯỞNG SẢN XUẤT ĐẾ",
  "ĐẾ - TỔ CÁN ÉP",
  "ĐẾ - TỔ ÉP ĐẾ DÁN",
  "MŨI - XƯỞNG SẢN XUẤT MŨI",
  "MŨI - TỔ CHẶT",
  "MŨI - TỔ CHUẨN BỊ",
  "MŨI - TỔ MAY 1",
  "MŨI - TỔ MAY 2",
  "MŨI - TỔ MAY 3",
  "GÒ - XƯỞNG SẢN XUẤT GÒ",
  "GÒ - TỔ GÒ CHUYỀN 1",
  "GÒ - TỔ GÒ CHUYỀN 2",
  "GÒ - TỔ GÒ CHUYỀN 3",
  "BẢO TRÌ - TỔ BẢO TRÌ MMTB",
  "BẢO TRÌ - TỔ BẢO TRÌ ĐIỆN",
  "QC - TỔ QC MŨI",
  "QC - TỔ QC ĐẾ",
  "QC - TỔ QC GÒ",
  "KHO - TỔ KHO VẬT TƯ",
  "KHO - TỔ KHO THÀNH PHẨM",
  "KHO - TỔ KHO PHỤ LIỆU",
  "P. CN-CI (CONTINUOUS IMPROVEMENT)",
  "P. QUẢN LÝ CHẤT LƯỢNG (QA)",
  "P. KĨ THUẬT CÔNG NGHỆ (IE)",
  "P. NHÂN SỰ & HÀNH CHÍNH (HR)",
  "P. KẾ TOÁN & TÀI CHÍNH",
  "P. KẾ HOẠCH SẢN XUẤT (PPC)",
];

const VTCV_OPTIONS = [
  "Cán bộ quản lý",
  "Công nhân",
  "Nhân viên",
];

const CUSTOMER_OPTIONS = ["DP", "WR", "RB", "SK", "Khác"];

const PRODUCT_GROUPS = [
  "Quai",
  "Mũi",
  "Gót",
  "Đế",
  "Thành phẩm",
  "Phụ liệu",
  "Dịch vụ",
  "Khác",
];

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
const CLOUDINARY_PRESETS = {
  image: "vpchuoisk",
  video: "vpchuoisk",
};

export interface KaizenPublicSubmitFormProps {
  isModal?: boolean;
  isEdit?: boolean;
  proposalId?: string;
  initialData?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function KaizenPublicSubmitForm({
  isModal = false,
  isEdit = false,
  proposalId,
  initialData,
  onClose,
  onSuccess,
}: KaizenPublicSubmitFormProps) {
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = React.useRef(false);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [unitTitle, setUnitTitle] = useState<string>("THNM Kiên Giang");
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [duplicatePayload, setDuplicatePayload] = useState<any>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (host.includes("vpchuoi")) {
        setUnitTitle("VP CHUỖI SKECHERS");
      } else {
        setUnitTitle("THNM Kiên Giang");
      }
    }
  }, []);

  // Auto-Fill States for MSNV Lookup
  const [lookupLoading, setLookupLoading] = useState(false);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [isReadOnlyAutoFill, setIsReadOnlyAutoFill] = useState(false);

  // Single-select cascading org selection for submission form
  const [selectedFormFactory, setSelectedFormFactory] = useState<string>("KG 1");
  const [selectedFormWorkshop, setSelectedFormWorkshop] = useState<string>("Xưởng Đế KG1");
  const [selectedFormLine, setSelectedFormLine] = useState<string>("");
  const [selectedFormChuyen, setSelectedFormChuyen] = useState<string>("");
  const [selectedFormTo, setSelectedFormTo] = useState<string>("");

  // Available sub-level items
  const availableFormWorkshops = useMemo(() => {
    if (!selectedFormFactory || !INITIAL_ORG_TREE[selectedFormFactory]) return [];
    const node = INITIAL_ORG_TREE[selectedFormFactory];
    if (typeof node === "object" && !Array.isArray(node)) {
      return Object.keys(node);
    }
    return Array.isArray(node) ? node : [];
  }, [selectedFormFactory]);

  const availableFormLines = useMemo(() => {
    if (!selectedFormFactory || !selectedFormWorkshop) return [];
    const fNode = INITIAL_ORG_TREE[selectedFormFactory];
    if (fNode && typeof fNode === "object" && !Array.isArray(fNode)) {
      const wsNode = fNode[selectedFormWorkshop];
      if (wsNode && typeof wsNode === "object" && !Array.isArray(wsNode)) {
        return Object.keys(wsNode);
      }
      if (Array.isArray(wsNode)) return wsNode;
    }
    return [];
  }, [selectedFormFactory, selectedFormWorkshop]);

  const availableFormChuyens = useMemo(() => {
    if (!selectedFormFactory || !selectedFormWorkshop || !selectedFormLine) return [];
    const fNode = INITIAL_ORG_TREE[selectedFormFactory];
    if (fNode && typeof fNode === "object" && !Array.isArray(fNode)) {
      const wsNode = fNode[selectedFormWorkshop];
      if (wsNode && typeof wsNode === "object" && !Array.isArray(wsNode)) {
        const lineNode = wsNode[selectedFormLine];
        if (lineNode && typeof lineNode === "object" && !Array.isArray(lineNode)) {
          return Object.keys(lineNode);
        }
        if (Array.isArray(lineNode)) return lineNode;
      }
    }
    return [];
  }, [selectedFormFactory, selectedFormWorkshop, selectedFormLine]);

  const availableFormTos = useMemo(() => {
    if (!selectedFormFactory || !selectedFormWorkshop || !selectedFormLine || !selectedFormChuyen) return [];
    const fNode = INITIAL_ORG_TREE[selectedFormFactory];
    if (fNode && typeof fNode === "object" && !Array.isArray(fNode)) {
      const wsNode = fNode[selectedFormWorkshop];
      if (wsNode && typeof wsNode === "object" && !Array.isArray(wsNode)) {
        const lineNode = wsNode[selectedFormLine];
        if (lineNode && typeof lineNode === "object" && !Array.isArray(lineNode)) {
          const chuyenNode = lineNode[selectedFormChuyen];
          if (Array.isArray(chuyenNode)) return chuyenNode;
        }
      }
    }
    return [];
  }, [selectedFormFactory, selectedFormWorkshop, selectedFormLine, selectedFormChuyen]);

  const [form, setForm] = useState({
    // Section A: Thông tin người đăng ký
    region: "KG 1",
    proposerEmpCode: "",
    proposerPosition: "Công nhân",
    proposerMonth: new Date().getMonth() + 1,
    proposerYear: new Date().getFullYear(),
    proposerName: "",
    customer: "",
    factory: "KG 1",
    department: "Xưởng Đế KG1",

    // Section B: Thông tin cải tiến
    title: "",
    category: "PRODUCTIVITY",
    categoryLabel: "3.Tăng Năng suất",
    productGroup: "",
    productCode: "",
    quantity: 0,
    beforeDescription: "",
    afterSolution: "",
    pricingDirection: "THOI_GIAN",
    savedSeconds: 0,
    timeBeforeSeconds: 0,
    timeAfterSeconds: 0,
    efficiencyValueVND: 0,
    beforeImageUrl: "",
    afterImageUrl: "",
    beforeImageLink: "",
    afterImageLink: "",
    beforeVideoUrl: "",
    afterVideoUrl: "",
    beforeVideoLink: "",
    afterVideoLink: "",
    registrationType: "LUU_TRU",
  });

  // Debounced Employee Auto-Fill Lookup by MSNV (Blur + Debounce ~500ms, >= 4 chars)
  React.useEffect(() => {
    const code = form.proposerEmpCode.trim();
    if (!code || code.length < 4) {
      setNotFoundMsg(null);
      setLookupLoading(false);
      setAutoFilled(false);
      return;
    }

    // Skip auto-fill lookup if editing existing proposal
    if (isEdit && initialData && (initialData.proposer_emp_code === code || initialData.proposerEmpCode === code)) {
      return;
    }

    setLookupLoading(true);
    setNotFoundMsg(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/employees/lookup?msnv=${encodeURIComponent(code)}`);
        const json = await res.json();

        if (json.success && json.data) {
          const emp = json.data;
          if (emp.factory_id) setSelectedFormFactory(emp.factory_id);
          if (emp.workshop_id) setSelectedFormWorkshop(emp.workshop_id);
          if (emp.line_id) setSelectedFormLine(emp.line_id);
          if (emp.chuyen_id) setSelectedFormChuyen(emp.chuyen_id);
          if (emp.to_id) setSelectedFormTo(emp.to_id);

          let mappedPos = "Công nhân";
          if (emp.vtcv || emp.position) {
            const rawPos = (emp.vtcv || emp.position).toLowerCase();
            if (rawPos.includes("quản lý") || rawPos.includes("cán bộ") || rawPos.includes("chuyền trưởng") || rawPos.includes("tổ trưởng")) {
              mappedPos = "Cán bộ quản lý";
            } else if (rawPos.includes("nhân viên") || rawPos.includes("vp") || rawPos.includes("văn phòng")) {
              mappedPos = "Nhân viên";
            } else {
              mappedPos = "Công nhân";
            }
          }

          setForm((prev) => ({
            ...prev,
            proposerName: emp.name || prev.proposerName,
            proposerPosition: mappedPos,
            region: emp.factory_id || prev.region,
            factory: emp.factory_id || prev.factory,
            department: emp.workshop_id || prev.department,
          }));
          setAutoFilled(true);
          setNotFoundMsg(null);
          showToast("✨ Đã tự động điền thông tin nhân sự và tổ xưởng theo MSNV!");
        } else {
          // 404: Show gentle warning toast, do NOT wipe existing values, do NOT block form
          setNotFoundMsg("Không tìm thấy MSNV, vui lòng chọn thủ công");
          showToast("⚠️ Không tìm thấy MSNV, vui lòng chọn tổ xưởng thủ công");
          setAutoFilled(false);
        }
      } catch (err) {
        setNotFoundMsg("Không tìm thấy MSNV, vui lòng chọn thủ công");
        setAutoFilled(false);
      } finally {
        setLookupLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.proposerEmpCode, isEdit, initialData]);

  React.useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        region: initialData.region || "KG 1",
        proposerEmpCode: initialData.proposer_emp_code || initialData.proposerEmpCode || "",
        proposerPosition: initialData.proposer_position || initialData.proposerPosition || "Công nhân",
        proposerMonth: initialData.proposer_month || new Date().getMonth() + 1,
        proposerYear: initialData.proposer_year || new Date().getFullYear(),
        proposerName: initialData.proposer_name || initialData.proposerName || "",
        customer: "",
        factory: initialData.factory || "KG 1",
        department: initialData.department || "",
        title: initialData.title || "",
        category: initialData.category ? normalizeCategoryId(initialData.category) : "PRODUCTIVITY",
        categoryLabel: initialData.category_label || initialData.categoryLabel || "3.Tăng Năng suất",
        productGroup: "",
        productCode: initialData.product_code || initialData.productCode || "",
        quantity: 0,
        beforeDescription: initialData.before_description || initialData.beforeDescription || "",
        afterSolution: initialData.after_solution || initialData.afterSolution || "",
        pricingDirection: "THOI_GIAN",
        savedSeconds: 0,
        timeBeforeSeconds: 0,
        timeAfterSeconds: 0,
        efficiencyValueVND: 0,
        beforeImageUrl: initialData.before_image_url || initialData.beforeImageUrl || "",
        afterImageUrl: initialData.after_image_url || initialData.afterImageUrl || "",
        beforeImageLink: "",
        afterImageLink: "",
        beforeVideoUrl: "",
        afterVideoUrl: "",
        beforeVideoLink: "",
        afterVideoLink: "",
        registrationType: "LUU_TRU",
      });
    }
  }, [isEdit, initialData]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Upload file to Cloudinary
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "beforeImageUrl" | "afterImageUrl") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      showToast(`☁️ Đang tải ảnh lên Cloudinary...`);
      
      const uploadPromises = Array.from(files).map((file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error("Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)");
        }
        if (file.size > 15 * 1024 * 1024) {
          throw new Error("Dung lượng ảnh tối đa là 15MB");
        }
        return uploadToCloudinary(file, "image");
      });

      const urls = await Promise.all(uploadPromises);
      setForm((prev) => {
        const existing = prev[fieldName] ? prev[fieldName].split(",").map((s) => s.trim()).filter(Boolean) : [];
        const combined = Array.from(new Set([...existing, ...urls]));
        return {
          ...prev,
          [fieldName]: combined.join(","),
        };
      });
      showToast("✅ Ảnh đã tải lên thành công!");
    } catch (err: any) {
      showToast(`❌ Lỗi tải ảnh: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "beforeVideoUrl" | "afterVideoUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast("❌ Vui lòng chọn file video (MP4, MOV, WEBM, AVI)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast("❌ Dung lượng video tối đa là 50MB");
      return;
    }

    try {
      setUploading(true);
      showToast("🎬 Đang tải video lên Cloudinary...");
      const videoUrl = await uploadToCloudinary(file, "video");
      setForm((prev) => ({
        ...prev,
        [fieldName]: videoUrl,
      }));
      showToast("✅ Video đã tải lên thành công!");
    } catch (err: any) {
      showToast(`❌ Lỗi tải video: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting || submitLockRef.current) return;
    submitLockRef.current = true;

    const targetDept = selectedFormWorkshop
      ? `${selectedFormWorkshop}${selectedFormLine ? ` - ${selectedFormLine}` : ""}`
      : form.department || "Xưởng Sản Xuất";

    const targetFactory = selectedFormFactory || form.factory || "KG 1";

    if (
      !form.proposerEmpCode.trim() ||
      !form.proposerName.trim() ||
      !form.proposerPosition.trim() ||
      !targetFactory ||
      !targetDept ||
      !form.beforeDescription.trim()
    ) {
      showToast("⚠️ Vui lòng điền mã số nhân viên, họ tên, đơn vị và mô tả hiện trạng trước cải tiến!");
      submitLockRef.current = false;
      return;
    }

    const finalAfterSolution = form.afterSolution.trim() || "Đề xuất đăng ký hiện trạng trước cải tiến";

    try {
      setSubmitting(true);
      const finalBeforeImg = form.beforeImageUrl || form.beforeImageLink.trim();
      const finalAfterImg = form.afterImageUrl || form.afterImageLink.trim();

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const finalTitle = form.title.trim() || "Ý tưởng đề xuất cải tiến Kaizen";

      const method = isEdit ? "PUT" : "POST";
      const idempotencyKey = `kz_pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const payload = {
        ...form,
        id: isEdit ? proposalId : undefined,
        action: isEdit ? "UPDATE" : undefined,
        title: finalTitle,
        factory: targetFactory,
        region: targetFactory,
        department: targetDept,
        line: selectedFormLine,
        proposerMonth: currentMonth,
        proposerYear: currentYear,
        beforeImageUrl: finalBeforeImg,
        afterImageUrl: finalAfterImg,
        beforeVideoUrl: "",
        afterVideoUrl: "",
        efficiencyValueVND: 0,
        registrationType: "THI_DUA",
        sub_status: "CHO_DUYET",
        trang_thai: "CHO_DUYET",
        isPublicScan: true,
      };

      // ── Stage 1: Duplicate check before creating new record ──────────
      if (!isEdit) {
        showToast("🔍 Đang kiểm tra trùng lặp với các đề xuất hiện có...");
        try {
          const checkRes = await fetch("/api/ci-kaizen/check-duplicate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              factory: targetFactory,
              region: targetFactory,
              line: selectedFormLine,
              category: form.category,
              beforeDescription: form.beforeDescription,
              afterSolution: form.afterSolution,
              title: finalTitle,
            }),
          });
          const checkJson = await checkRes.json();
          if (checkJson.success && checkJson.isDuplicate && checkJson.matches?.length > 0) {
            setDuplicateMatches(checkJson.matches);
            setDuplicatePayload({
              ...payload,
              attachments: [
                ...(finalBeforeImg ? [{ url: finalBeforeImg, tag: "BEFORE", type: "image" }] : []),
                ...(finalAfterImg ? [{ url: finalAfterImg, tag: "AFTER", type: "image" }] : []),
              ],
            });
            setShowDuplicateModal(true);
            setSubmitting(false);
            submitLockRef.current = false;
            return;
          }
        } catch (e) {}
      }

      const res = await fetch("/api/ci-kaizen", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });


      const json = await res.json();
      if (json.success) {
        if (isEdit) {
          showToast("🎉 Cập nhật thông tin đề xuất cải tiến thành công!");
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        } else {
          setSubmittedCode(json.code || "CI-2026-OK");
          if (onSuccess) onSuccess();
        }
      } else {
        showToast(`❌ ${json.message || "Không thể xử lý đề xuất"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi mạng hoặc kết nối máy chủ!");
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const handleResetForm = () => {
    setSubmittedCode(null);
    setForm({
      region: "Kiên Giang 1",
      proposerEmpCode: "",
      proposerPosition: "Công Nhân Sản Xuất",
      proposerMonth: new Date().getMonth() + 1,
      proposerYear: new Date().getFullYear(),
      proposerName: "",
      customer: "Skechers",
      factory: "VP2 SKECHERS",
      department: "",
      title: "",
      category: "PRODUCTIVITY",
      categoryLabel: "3.Tăng Năng suất",
      productGroup: "Quai",
      productCode: "",
      quantity: 0,
      beforeDescription: "",
      afterSolution: "",
      pricingDirection: "THOI_GIAN",
      savedSeconds: 30,
      timeBeforeSeconds: 0,
      timeAfterSeconds: 0,
      efficiencyValueVND: 0,
      beforeImageUrl: "",
      afterImageUrl: "",
      beforeImageLink: "",
      afterImageLink: "",
      beforeVideoUrl: "",
      afterVideoUrl: "",
      beforeVideoLink: "",
      afterVideoLink: "",
      registrationType: "LUU_TRU",
    });
  };

  const content = (
    <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col w-full ${isModal ? "max-h-[90vh]" : "max-w-4xl mx-auto"}`}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl animate-in slide-in-from-top-3 flex items-center gap-2 border border-amber-300">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#006838] via-[#0b1739] to-[#0b1739] p-5 sm:p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-3 py-1 flex items-center justify-center shadow-md">
              <img src="/images/tbs-logo.png" alt="TBS Group" className="h-6 w-auto object-contain" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              {unitTitle} - CỔNG CẢI TIẾN KAIZEN
            </span>
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <IconX size={18} />
            </button>
          )}
        </div>

        <div className="pt-2">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            Đăng Ký Đề Xuất Cải Tiến Kaizen
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Cổng tiếp nhận sáng kiến cải tiến chuẩn hóa dành cho công nhân & cán bộ nhà máy
          </p>
        </div>
      </div>

      {/* Form Body or Success View */}
      {submittedCode ? (
        <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[75vh]">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006838] flex items-center justify-center mx-auto shadow-lg border-2 border-emerald-300">
            <IconCheck size={36} className="stroke-[3]" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#006838] text-xs font-black font-mono">
              MÃ ĐỀ XUẤT: {submittedCode}
            </span>
            <h2 className="text-xl font-black text-slate-900 pt-2">Gửi Đề Xuất Thành Công!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Đề xuất Kaizen của bạn đã được ghi nhận trực tiếp vào hệ thống cơ sở dữ liệu và đang chuyển đến luồng phê duyệt &amp; chấm điểm thi đua. Cảm ơn đóng góp của bạn!
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-3 rounded-2xl bg-[#006838] text-white font-black text-xs hover:bg-[#004d29] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconRefresh size={16} />
              <span>GỬI THÊM ĐỀ XUẤT KHÁC</span>
            </button>
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <IconX size={16} />
                <span>ĐÓNG VÀ HOÀN TẤT</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-xs text-slate-700 flex-1 overflow-y-auto">
          {/* ════════════════════════════════════════════════════════════════
              SECTION A: THÔNG TIN NGƯỜI ĐĂNG KÝ
             ════════════════════════════════════════════════════════════════ */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-[#006838]">
              <IconUserCheck size={18} />
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                A. THÔNG TIN NGƯỜI ĐĂNG KÝ
              </h3>
            </div>

            {/* CASCADING ORGANIZATIONAL SELECTION (Nhà máy → Xưởng → Line) */}
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200 space-y-2 mb-3">
              <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-[11px] uppercase tracking-wider">
                <IconBuildingFactory size={15} className="text-[#006838]" />
                <span>Đơn Vị & Khu Vực Sản Xuất Phân Cấp (Nhà máy → Xưởng → Line)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* 1. Dropdown Nhà Máy* */}
                <div className="space-y-1">
                  <label className="font-black text-slate-900 text-[11px]">
                    1. Nhà Máy <span className="text-rose-600 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    required
                    value={selectedFormFactory}
                    onChange={(e) => {
                      setSelectedFormFactory(e.target.value);
                      setSelectedFormWorkshop("");
                      setSelectedFormLine("");
                      setSelectedFormChuyen("");
                      setSelectedFormTo("");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                  >
                    <option value="">-- Chọn Nhà Máy --</option>
                    {REAL_FACTORIES.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Dropdown Xưởng* */}
                <div className="space-y-1">
                  <label className="font-black text-slate-900 text-[11px]">
                    2. Xưởng Sản Xuất <span className="text-rose-600 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    required
                    disabled={!selectedFormFactory || availableFormWorkshops.length === 0}
                    value={selectedFormWorkshop}
                    onChange={(e) => {
                      setSelectedFormWorkshop(e.target.value);
                      setSelectedFormLine("");
                      setSelectedFormChuyen("");
                      setSelectedFormTo("");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white disabled:bg-slate-100 disabled:opacity-60"
                  >
                    <option value="">
                      {!selectedFormFactory
                        ? "-- Chọn Nhà Máy Trước --"
                        : availableFormWorkshops.length > 0
                        ? "-- Chọn Xưởng --"
                        : "Không có Xưởng con"}
                    </option>
                    {availableFormWorkshops.map((ws) => (
                      <option key={ws} value={ws}>
                        {ws}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Dropdown Line (Conditional) */}
                {selectedFormWorkshop && availableFormLines.length > 0 && (
                  <div className="space-y-1 animate-in fade-in duration-200">
                    <label className="font-black text-slate-900 text-[11px]">3. Line Sản Xuất</label>
                    <select
                      value={selectedFormLine}
                      onChange={(e) => {
                        setSelectedFormLine(e.target.value);
                        setSelectedFormChuyen("");
                        setSelectedFormTo("");
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                    >
                      <option value="">-- Chọn Line (Không bắt buộc) --</option>
                      {availableFormLines.map((ln) => (
                        <option key={ln} value={ln}>
                          {ln}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Thứ tự field: MSNV → Người đăng ký → VTCV */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. MSNV* */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-900">
                    MSNV <span className="text-rose-600 font-bold ml-0.5">*</span>
                  </label>
                  {autoFilled && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in">
                      <IconCheck size={12} /> Đã khớp dữ liệu
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.proposerEmpCode}
                    onChange={(e) => setForm({ ...form, proposerEmpCode: e.target.value })}
                    placeholder="VD: CN-88201 hoặc 202608101"
                    className={`w-full px-3.5 py-2.5 pr-9 rounded-xl border text-xs font-bold outline-none transition-all ${
                      notFoundMsg
                        ? "border-amber-400 bg-amber-50/20 focus:border-amber-500"
                        : autoFilled
                        ? "border-emerald-500 bg-emerald-50/20 focus:border-emerald-600"
                        : "border-slate-300 focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                    }`}
                  />
                  {lookupLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <IconLoader2 size={16} className="animate-spin" />
                    </div>
                  )}
                  {!lookupLoading && autoFilled && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <IconCheck size={16} className="font-black" />
                    </div>
                  )}
                </div>
                {notFoundMsg && (
                  <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 mt-1.5 animate-in fade-in">
                    <IconAlertCircle size={14} className="shrink-0 text-amber-600" />
                    <span>{notFoundMsg}</span>
                  </p>
                )}
              </div>

              {/* 2. Người đăng ký* */}
              <div className="space-y-1">
                <label className="font-black text-slate-900">
                  Người đăng ký <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.proposerName}
                  onChange={(e) => setForm({ ...form, proposerName: e.target.value })}
                  placeholder="Họ và Tên Công Nhân / Cán Bộ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
                />
              </div>

              {/* 3. VTCV* (3 lựa chọn: Cán bộ quản lý, Công nhân, Nhân viên) */}
              <div className="space-y-1">
                <label className="font-black text-slate-900">
                  VTCV <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <select
                  value={form.proposerPosition}
                  onChange={(e) => setForm({ ...form, proposerPosition: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
                >
                  {VTCV_OPTIONS.map((vt) => (
                    <option key={vt} value={vt}>
                      {vt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              SECTION B: THÔNG TIN CẢI TIẾN
             ════════════════════════════════════════════════════════════════ */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-blue-600">
              <IconSparkles size={18} />
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                B. THÔNG TIN CẢI TIẾN
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Phân loại cải tiến (Bắt buộc chọn 1 trong 7) */}
              <div className="space-y-1">
                <label className="font-black text-slate-900 flex items-center justify-between text-xs">
                  <span>Phân loại cải tiến <span className="text-rose-600 font-bold ml-0.5">*</span></span>
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const found = CATEGORIES.find((c) => c.id === catId);
                    setForm({
                      ...form,
                      category: catId,
                      categoryLabel: found ? found.label : "3.Tăng Năng suất",
                    });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer ${
                    !form.category ? "border-amber-400 bg-amber-50/50" : "border-slate-300 text-slate-800"
                  }`}
                >
                  <option value="">-- Bắt buộc chọn Phân loại --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tiêu đề cải tiến */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-black text-slate-900 text-xs">
                  Tiêu đề cải tiến
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Tự chế gá kẹp dưỡng may giúp giảm thao tác thừa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
                />
              </div>
            </div>

            {/* Mô tả hiện trạng trước cải tiến* */}
            <div className="space-y-1">
              <label className="font-black text-slate-900">
                Mô tả hiện trạng trước cải tiến <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.beforeDescription}
                onChange={(e) => setForm({ ...form, beforeDescription: e.target.value })}
                placeholder="Mô tả lãng phí, thao tác thừa, nguyên nhân gây chậm tiến độ hoặc rủi ro phát hiện trước cải tiến..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838] resize-none"
              />
            </div>

            {/* Nội dung ý tưởng đề xuất cải tiến (Không bắt buộc khi mới đăng ký hiện trạng) */}
            <div className="space-y-1">
              <label className="font-black text-slate-900">
                Nội dung ý tưởng đề xuất cải tiến <span className="text-slate-400 font-normal ml-1">(Không bắt buộc khi mới đăng ký hiện trạng)</span>
              </label>
              <textarea
                rows={2}
                value={form.afterSolution}
                onChange={(e) => setForm({ ...form, afterSolution: e.target.value })}
                placeholder="Có thể để trống và bổ sung giải pháp sau khi được duyệt hiện trạng..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838] resize-none"
              />
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              SECTION D: HÌNH ẢNH & VIDEO TRƯỚC CẢI TIẾN (Nhiều ảnh / Video)
             ════════════════════════════════════════════════════════════════ */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-indigo-600">
              <IconPhoto size={18} />
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                D. HÌNH ẢNH &amp; VIDEO TRƯỚC CẢI TIẾN (ĐÃ XẢY RA / LÃNG PHÍ)
              </h3>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] font-bold text-[#006838] flex items-center gap-2">
              <span>📸</span>
              <span>Bạn chỉ cần chọn tải lên ảnh/video hiện trạng TRƯỚC cải tiến (Có thể chọn nhiều ảnh cùng lúc)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BEFORE IMAGES (Multiple Photos Upload & Grid Preview) */}
              <div className="space-y-2 p-3.5 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/30">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <IconPhoto size={16} className="text-[#006838]" />
                    <span>Ảnh TRƯỚC Cải Tiến (Chọn nhiều ảnh):</span>
                  </label>
                  {form.beforeImageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, beforeImageUrl: "" })}
                      className="text-[11px] text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <IconTrash size={13} />
                      <span>Xóa tất cả</span>
                    </button>
                  )}
                </div>

                {/* Grid preview of uploaded before images */}
                {form.beforeImageUrl ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                      {form.beforeImageUrl.split(",").map((url, idx) => {
                        const cleanUrl = url.trim();
                        if (!cleanUrl) return null;
                        return (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                            <img src={cleanUrl} alt={`Before ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const currentUrls = form.beforeImageUrl.split(",").map((s) => s.trim()).filter(Boolean);
                                const updated = currentUrls.filter((_, i) => i !== idx);
                                setForm({ ...form, beforeImageUrl: updated.join(",") });
                              }}
                              className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition cursor-pointer"
                              title="Xóa ảnh này"
                            >
                              <IconX size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <label className="flex items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-emerald-300 cursor-pointer text-center hover:bg-emerald-50 text-[11px] font-bold text-[#006838]">
                      <IconUpload size={14} />
                      <span>Thêm ảnh khác</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "beforeImageUrl")}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 h-32 bg-white rounded-xl border border-slate-200 cursor-pointer text-center hover:bg-emerald-50/50 transition-colors">
                    <IconUpload size={24} className="text-[#006838] mb-1" />
                    <span className="text-[11px] font-black text-slate-900">Upload ảnh (Có thể chọn nhiều ảnh cùng lúc)</span>
                    <span className="text-[10px] text-slate-500 font-medium">Hỗ trợ JPG, PNG, WEBP tối đa 15MB/ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "beforeImageUrl")}
                    />
                  </label>
                )}

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold text-slate-600 block">HOẶC Dán Link Ảnh TRƯỚC (Google Drive...):</label>
                  <textarea
                    rows={2}
                    value={form.beforeImageLink}
                    onChange={(e) => setForm({ ...form, beforeImageLink: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-[11px] font-medium outline-none focus:border-[#006838] resize-none"
                  />
                </div>
              </div>

              {/* BEFORE VIDEO (Video Upload & Link) */}
              <div className="space-y-2 p-3.5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <IconVideo size={16} className="text-indigo-600" />
                    <span>Video TRƯỚC Cải Tiến (Quay clip hiện trạng):</span>
                  </label>
                  {form.beforeVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, beforeVideoUrl: "" })}
                      className="text-[11px] text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <IconTrash size={13} />
                      <span>Xóa video</span>
                    </button>
                  )}
                </div>

                {form.beforeVideoUrl ? (
                  <div className="space-y-1">
                    <video src={form.beforeVideoUrl} controls className="w-full h-32 object-cover rounded-xl border bg-black" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 h-32 bg-white rounded-xl border border-slate-200 cursor-pointer text-center hover:bg-indigo-50/50 transition-colors">
                    <IconVideo size={24} className="text-indigo-600 mb-1" />
                    <span className="text-[11px] font-black text-slate-900">Upload Video TRƯỚC Cải Tiến</span>
                    <span className="text-[10px] text-slate-500 font-medium">Hỗ trợ MP4, MOV, WEBM tối đa 50MB</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleVideoUpload(e, "beforeVideoUrl")}
                    />
                  </label>
                )}

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold text-slate-600 block">HOẶC Dán Link Video TRƯỚC (Google Drive, Youtube...):</label>
                  <input
                    type="text"
                    value={form.beforeVideoLink}
                    onChange={(e) => setForm({ ...form, beforeVideoLink: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-[11px] font-medium outline-none focus:border-[#006838]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-[11px] text-slate-500 font-medium italic">
              * Vui lòng rà soát lại thông tin trước khi nhấn Gửi Đề Xuất
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isModal && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  HỦY BỎ
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#006838] text-white font-black text-xs hover:bg-[#004d29] shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <IconRefresh className="animate-spin" size={16} />
                    <span>ĐANG GỬI HỒ SƠ...</span>
                  </>
                ) : (
                  <>
                    <IconSend size={16} />
                    <span>GỬI ĐỀ XUẤT CẢI TIẾN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <>
      {content}

      {showDuplicateModal && duplicatePayload && (
        <KaizenDuplicateCompareModal
          newSubmission={duplicatePayload}
          matchedMatches={duplicateMatches}
          onConfirmMerge={async (orig) => {
            try {
              const res = await fetch("/api/ci-kaizen/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  originalProposalId: orig.id,
                  newAttachments: duplicatePayload.attachments || [],
                  proposerName: duplicatePayload.proposerName,
                }),
              });
              const json = await res.json();
              if (json.success) {
                showToast(`🎉 ${json.message}`);
                setShowDuplicateModal(false);
                setSubmittedCode(json.originalCode || "MERGED");
                if (onSuccess) onSuccess();
              } else {
                showToast(`❌ ${json.error || "Lỗi khi gộp"}`);
              }
            } catch (e) {
              showToast("❌ Lỗi mạng khi thực hiện gộp!");
            }
          }}
          onProceedAsNew={async () => {
            try {
              const res = await fetch("/api/ci-kaizen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(duplicatePayload),
              });
              const json = await res.json();
              if (json.success) {
                setShowDuplicateModal(false);
                setSubmittedCode(json.code || "CI-2026-OK");
                if (onSuccess) onSuccess();
              } else {
                showToast(`❌ ${json.error || "Lỗi khi gửi đề xuất"}`);
              }
            } catch (e) {
              showToast("❌ Lỗi mạng!");
            }
          }}
          onClose={() => setShowDuplicateModal(false)}
        />
      )}
    </>
  );
}

