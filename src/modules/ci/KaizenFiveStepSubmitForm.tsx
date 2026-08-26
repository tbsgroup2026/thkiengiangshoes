"use client";

import React, { useState } from "react";
import {
  IconCheck,
  IconSparkles,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconQrcode,
  IconUserCheck,
  IconTag,
  IconClock,
  IconArrowLeft,
  IconRefresh,
  IconVideo,
  IconBuildingFactory,
  IconMapPin,
  IconShieldCheck,
  IconFileText,
  IconAlertCircle,
  IconCalendar,
  IconSend,
  IconBox,
  IconLoader2,
  IconLock,
  IconLockOpen,
} from "@tabler/icons-react";

const TOPIC_GROUPS = [
  { id: "PRODUCTIVITY", label: "3. Tăng Năng Suất", category: "NĂNG SUẤT", color: "bg-blue-600 text-white", desc: "Tối ưu thao tác, tăng sản lượng, giảm thời gian sản xuất" },
  { id: "COST_SAVING", label: "2. Tiết Kiệm Chi Phí", category: "LÃNG PHÍ", color: "bg-emerald-600 text-white", desc: "Giảm lãng phí nguyên phụ liệu, năng lượng, chi phí vận hành" },
  { id: "MATERIAL_SAVING", label: "1. Tiết Kiệm Vật Tư", category: "LÃNG PHÍ", color: "bg-amber-600 text-white", desc: "Tận dụng phế liệu, định mức vật tư, cắt giảm tiêu hao" },
  { id: "SAFETY", label: "4. An Toàn Lao Động", category: "AN TOÀN", color: "bg-[#006838] text-white", desc: "Cải thiện môi trường làm việc, Ergonomics, chống tai nạn" },
  { id: "5S", label: "5. 5S & Bề Mặt", category: "LÃNG PHÍ", color: "bg-sky-600 text-white", desc: "Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng" },
  { id: "AUTOMATION", label: "6. Tự Động Hoá", category: "NĂNG SUẤT", color: "bg-indigo-600 text-white", desc: "Gá kẹp tự động, robot, cải tiến thiết bị thông minh" },
  { id: "EQUIPMENT", label: "7. MMTB CCDC", category: "NĂNG SUẤT", color: "bg-purple-600 text-white", desc: "Bảo trì phòng ngừa, gá kẹp dưỡng may, cải tiến máy" },
];

import { REAL_DEPARTMENTS } from "./KaizenPublicSubmitForm";

const REGIONS = REAL_DEPARTMENTS;

const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
const CLOUDINARY_PRESETS = {
  image: "vpchuoisk",
  video: "vpchuoisk",
};

interface KaizenFiveStepSubmitFormProps {
  onSuccessClose?: () => void;
  onCancel?: () => void;
}

export default function KaizenFiveStepSubmitForm({ onSuccessClose, onCancel }: KaizenFiveStepSubmitFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Auto-Fill States for MSNV Lookup
  const [lookupLoading, setLookupLoading] = useState(false);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  // 5-Step Form State
  const [form, setForm] = useState({
    // Step 1: Đăng ký & Thông tin tác giả
    proposerName: "",
    proposerEmpCode: "",
    proposerPosition: "",
    factory: "VP2 SKECHERS",
    department: "",
    region: "Kiên Giang 1",
    category: "PRODUCTIVITY",
    categoryLabel: "3. Tăng Năng Suất",
    topicGroup: "NĂNG SUẤT",

    // Step 2: Triển khai & Minh chứng
    title: "",
    beforeDescription: "",
    afterSolution: "",
    pricingDirection: "THOI_GIAN",
    timeBeforeSeconds: 0,
    timeAfterSeconds: 0,
    efficiencyValueVND: 0,
    savedSeconds: 30,
    beforeImageUrl: "",
    afterImageUrl: "",
    beforeVideoUrl: "",
    afterVideoUrl: "",

    // Step 3: Hoàn thiện hồ sơ
    registrationType: "THI_DUA", // THI_DUA or LUU_TRU
    productGroup: "",
    productCode: "",
    quantity: 0,
    customer: "Skechers",
    proposerMonth: new Date().getMonth() + 1,
    proposerYear: new Date().getFullYear(),

    // Step 4: Xác nhận đơn vị
    supervisorName: "",
    departmentApprovalStatus: "DA_XAC_NHAN",

    // Step 5: Điều khoản & Nộp trước 25
    agreedToTerms: true,
  });

  // Debounced Employee Auto-Fill Lookup by MSNV (Blur + Debounce ~500ms, >= 4 chars)
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    const code = form.proposerEmpCode.trim();
    if (!code || code.length < 4) {
      setNotFoundMsg(null);
      setLookupLoading(false);
      setAutoFilled(false);
      return;
    }

    // Protect initial mount load: do not auto-fill over pre-existing form values on mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    setLookupLoading(true);
    setNotFoundMsg(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/employees/lookup?msnv=${encodeURIComponent(code)}`);
        const json = await res.json();

        if (json.success && json.data) {
          const emp = json.data;
          // Sequential auto-fill: Factory -> Workshop -> Line -> Chuyền -> Tổ
          setForm((prev) => ({
            ...prev,
            proposerName: emp.name || prev.proposerName,
            proposerPosition: emp.vtcv || emp.position || prev.proposerPosition,
            factory: emp.factory_id || prev.factory,
            department: emp.workshop_id || prev.department,
            region: emp.factory_id || prev.region,
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
    }, 500);

    return () => clearTimeout(timer);
  }, [form.proposerEmpCode]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Cloudinary File Upload
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
        throw new Error(error.error?.message || `Lỗi tải lên ${fileType}`);
      }

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error(`Cloudinary ${fileType} upload error:`, err);
      throw err;
    }
  };

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
      setUploading(true);
      showToast("☁️ Đang tải ảnh minh chứng lên hệ thống...");
      const cloudinaryUrl = await uploadToCloudinary(file, "image");
      setForm((prev) => ({ ...prev, [fieldName]: cloudinaryUrl }));
      showToast("✅ Tải ảnh thành công!");
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
      showToast("❌ Vui lòng chọn file video (MP4, WEBM, MOV)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast("❌ Dung lượng video tối đa là 50MB");
      return;
    }

    try {
      setUploading(true);
      showToast("🎬 Đang tải video minh chứng lên...");
      const cloudinaryUrl = await uploadToCloudinary(file, "video");
      setForm((prev) => ({ ...prev, [fieldName]: cloudinaryUrl }));
      showToast("✅ Tải video thành công!");
    } catch (err: any) {
      showToast(`❌ Lỗi tải video: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!form.proposerName.trim() || !form.proposerEmpCode.trim() || !form.proposerPosition.trim() || !form.department.trim()) {
        showToast("⚠️ Vui lòng điền đầy đủ Thông tin công nhân & Đơn vị làm việc ở Bước 1!");
        return false;
      }
    }
    if (step === 2) {
      if (!form.title.trim() || !form.beforeDescription.trim() || !form.afterSolution.trim()) {
        showToast("⚠️ Vui lòng điền Tên tiêu đề, Mô tả hiện trạng & Giải pháp mới ở Bước 2!");
        return false;
      }
      if (form.pricingDirection === "THOI_GIAN" && (!form.timeBeforeSeconds || !form.timeAfterSeconds)) {
        showToast("⚠️ Vui lòng nhập Thời gian sản xuất trước và sau cải tiến!");
        return false;
      }
      if (form.pricingDirection === "TRI_GIA" && !form.efficiencyValueVND) {
        showToast("⚠️ Vui lòng nhập Giá trị hiệu quả tiết kiệm VND!");
        return false;
      }
    }
    if (step === 3) {
      if (!form.registrationType) {
        showToast("⚠️ Vui lòng chọn Hình thức nộp bài (Thi đua hoặc Lưu trữ)!");
        return false;
      }
    }
    if (step === 4) {
      if (!form.supervisorName.trim()) {
        showToast("⚠️ Vui lòng điền Họ tên Quản lý/Tổ trưởng xác nhận ở Bước 4!");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/ci-kaizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sub_status: form.registrationType === "THI_DUA" ? "CHO_DANH_GIA" : "LUU_TRU",
          submitted_via_wizard_5step: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmittedCode(json.code || "CI-2026-OK");
        showToast("🎉 Nộp hồ sơ cải tiến 5 bước thành công!");
      } else {
        showToast(`❌ ${json.message || "Không thể nộp hồ sơ!"}`);
      }
    } catch (err) {
      showToast("❌ Lỗi kết nối máy chủ D1 Database!");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate days remaining to 25th deadline
  const today = new Date();
  const currentDay = today.getDate();
  const daysLeft = currentDay <= 25 ? 25 - currentDay : 30 - currentDay + 25;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl animate-in slide-in-from-top-3 flex items-center gap-2 border border-amber-300">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER BANNER & DEADLINE ALERT */}
      <div className="bg-gradient-to-r from-[#006838] via-[#0b1739] to-[#0b1739] p-5 sm:p-6 text-white flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-3 py-1 flex items-center justify-center shadow-md">
              <img src="/images/tbs-logo.png" alt="TBS Group" className="h-6 w-auto object-contain" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              QUY TRÌNH NỘP HỒ SƠ 5 BƯỚC CHUẨN TBS
            </span>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-300 hover:text-white font-bold bg-white/10 px-3 py-1 rounded-xl transition-all"
            >
              Thoát
            </button>
          )}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Đăng Ký Hồ Sơ Sáng Kiến Cải Tiến Kaizen
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Được thiết kế đầy đủ 5 bước theo quy định: Đăng ký &bull; Minh chứng &bull; Hoàn thiện &bull; Xác nhận đơn vị &bull; Deadline ngày 25
          </p>
        </div>

        {/* Deadline Alert Banner */}
        <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <IconCalendar size={18} className="text-amber-400 shrink-0" />
            <span>
              Hạn chót nộp hồ sơ Thi đua Tháng {form.proposerMonth}/{form.proposerYear}: <strong className="text-white">Ngày 25 hàng tháng</strong>
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] tracking-wide shrink-0">
            ⏳ Còn {daysLeft} ngày để nộp
          </span>
        </div>
      </div>

      {/* 5-STEP WIZARD STEPPER BAR */}
      {!submittedCode && (
        <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
          <div className="grid grid-cols-5 gap-1 text-center">
            {[
              { step: 1, name: "1. Đăng Ký", desc: "Chủ đề & Công nhân" },
              { step: 2, name: "2. Minh Chứng", desc: "Giải pháp & Ảnh/Video" },
              { step: 3, name: "3. Hoàn Thiện", desc: "Thi đua vs Lưu trữ" },
              { step: 4, name: "4. Xác Nhận", desc: "Tổ xưởng phê duyệt" },
              { step: 5, name: "5. Hạn Ngày 25", desc: "Nộp chính thức" },
            ].map((item) => {
              const isActive = currentStep === item.step;
              const isPassed = currentStep > item.step;

              return (
                <div
                  key={item.step}
                  onClick={() => isPassed && setCurrentStep(item.step)}
                  className={`flex flex-col items-center p-1.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#006838] text-white shadow-md font-bold"
                      : isPassed
                      ? "bg-slate-800 text-emerald-400 hover:bg-slate-700"
                      : "bg-slate-950 text-slate-500 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                        isActive
                          ? "bg-white text-[#006838]"
                          : isPassed
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isPassed ? "✓" : item.step}
                    </span>
                    <span className="text-[11px] font-black hidden sm:inline">{item.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-300 font-medium truncate max-w-full hidden md:inline">
                    {item.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FORM BODY */}
      <div className="p-5 sm:p-8">
        {submittedCode ? (
          /* SUCCESS SUBMISSION RESULT */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#006838] flex items-center justify-center mx-auto shadow-xl border-4 border-emerald-300">
              <IconCheck size={48} className="stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-[#006838] text-sm font-black font-mono tracking-wider border border-emerald-300">
                MÃ HỒ SƠ 5 BƯỚC: {submittedCode}
              </span>
              <h2 className="text-2xl font-black text-slate-900 pt-3">Đã Nộp Hồ Sơ Cải Tiến Thành Công!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Hồ sơ sáng kiến đã đi qua đủ 5 bước chuẩn hóa, được gắn mã định danh tự động và chuyển thẳng đến Ban 2.2 để tổng hợp thi đua tháng {form.proposerMonth}/{form.proposerYear}.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmittedCode(null);
                  setCurrentStep(1);
                }}
                className="px-6 py-3 rounded-2xl bg-[#006838] text-white font-black text-xs hover:bg-[#004d29] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <IconRefresh size={16} />
                <span>NỘP THÊM HỒ SƠ KHÁC</span>
              </button>

              {onSuccessClose && (
                <button
                  type="button"
                  onClick={onSuccessClose}
                  className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 font-black text-xs hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                >
                  Xem Thư Viện Cải Tiến
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* ════════════════════════════════════════════════════════════════
                BƯỚC 1: ĐĂNG KÝ & CHỌN NHÓM CHỦ ĐỀ
               ════════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 text-[#006838]">
                      <IconUserCheck size={20} />
                      BƯỚC 1: ĐĂNG KÝ THÔNG TIN TÁC GIẢ & CHỌN NHÓM CHỦ ĐỀ
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chọn 1 trong 3 nhóm chủ đề trọng tâm (Năng suất / Lãng phí / An toàn) và điền thông tin tác giả
                    </p>
                  </div>
                </div>

                {/* 3 CHỦ ĐỀ TRỌNG TÂM SELECTOR */}
                <div className="space-y-2">
                  <label className="font-black text-slate-900 text-xs flex items-center gap-1">
                    <span>Nhóm Chủ Đề Cải Tiến Trọng Tâm</span>
                    <span className="text-rose-600 font-bold">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {TOPIC_GROUPS.map((tg) => {
                      const isSelected = form.category === tg.id;
                      return (
                        <div
                          key={tg.id}
                          onClick={() =>
                            setForm({
                              ...form,
                              category: tg.id,
                              categoryLabel: tg.label,
                              topicGroup: tg.category,
                            })
                          }
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? "border-[#006838] bg-emerald-50/70 shadow-md ring-2 ring-[#006838]/20"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${tg.color}`}>
                              {tg.category}
                            </span>
                            {isSelected && <IconCheck size={16} className="text-[#006838] stroke-[3]" />}
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-900">{tg.label}</h4>
                            <p className="text-[10px] text-slate-500 leading-tight mt-1">{tg.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* THÔNG TIN CÔNG NHÂN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Mã Thẻ / Mã Nhân Viên */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-slate-900 text-xs">
                        Mã Thẻ / MSNV <span className="text-rose-600 font-bold">*</span>
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

                  {/* Họ và Tên Tác Giả */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">
                      Họ và Tên Tác Giả <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.proposerName}
                      onChange={(e) => setForm({ ...form, proposerName: e.target.value })}
                      placeholder="VD: Nguyễn Văn Trãi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                    />
                  </div>

                  {/* Vị Trí Công Việc (VTCV) */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">
                      Vị Trí Công Việc (VTCV) <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.proposerPosition}
                      onChange={(e) => setForm({ ...form, proposerPosition: e.target.value })}
                      placeholder="VD: Công nhân May Quai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                    />
                  </div>
                </div>

                {/* ĐƠN VỊ & KHU VỰC */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">
                      Nhà Máy / Chi Nhánh <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.factory}
                      onChange={(e) => setForm({ ...form, factory: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">
                      Tổ / Xưởng Làm Việc <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="VD: Tổ May 2 - Xưởng 1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">
                      Khu Vực Quản Lý <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <select
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838]"
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                BƯỚC 2: TRIỂN KHAI & MINH CHỨNG
               ════════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 text-blue-600">
                      <IconSparkles size={20} />
                      BƯỚC 2: TRIỂN KHAI & TẢI MINH CHỨNG (ẢNH / VIDEO TRƯỚC & SAU)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ghi rõ tên cải tiến, khó khăn hiện trạng, giải pháp đề xuất và tải ảnh/video thực tế
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-black text-slate-900 text-xs">
                    Tên Tiêu Đề Sáng Kiến Cải Tiến <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="VD: Chế gá dưỡng định hình đường may giúp giảm 30% thời gian thao tác"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">
                      Mô Tả Hiện Trạng (Trước cải tiến) <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.beforeDescription}
                      onChange={(e) => setForm({ ...form, beforeDescription: e.target.value })}
                      placeholder="Mô tả lãng phí, thao tác thừa, nguyên nhân gây chậm tiến độ hoặc rủi ro..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">
                      Giải Pháp Mới (Sau cải tiến) <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.afterSolution}
                      onChange={(e) => setForm({ ...form, afterSolution: e.target.value })}
                      placeholder="Mô tả ý tưởng, gá kẹp mới, cải tiến quy trình và kết quả đạt được..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-600 resize-none"
                    />
                  </div>
                </div>

                {/* HƯỚNG ĐÁNH GIÁ & TIẾT KIỆM */}
                <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-slate-900 text-xs">
                      Hướng Đánh Giá Hiệu Quả <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
                        <input
                          type="radio"
                          name="pricingDir"
                          value="THOI_GIAN"
                          checked={form.pricingDirection === "THOI_GIAN"}
                          onChange={() => setForm({ ...form, pricingDirection: "THOI_GIAN" })}
                        />
                        <span>Tiết kiệm Thời gian (Giây)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs">
                        <input
                          type="radio"
                          name="pricingDir"
                          value="TRI_GIA"
                          checked={form.pricingDirection === "TRI_GIA"}
                          onChange={() => setForm({ ...form, pricingDirection: "TRI_GIA" })}
                        />
                        <span>Trị giá Tiền (VNĐ)</span>
                      </label>
                    </div>
                  </div>

                  {form.pricingDirection === "THOI_GIAN" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="font-black text-slate-800 text-xs">Thời gian sản xuất Trước (Giây)</label>
                        <input
                          type="number"
                          value={form.timeBeforeSeconds}
                          onChange={(e) => setForm({ ...form, timeBeforeSeconds: parseInt(e.target.value || "0", 10) })}
                          placeholder="7200"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-black text-slate-800 text-xs">Thời gian sản xuất Sau (Giây)</label>
                        <input
                          type="number"
                          value={form.timeAfterSeconds}
                          onChange={(e) => setForm({ ...form, timeAfterSeconds: parseInt(e.target.value || "0", 10) })}
                          placeholder="4800"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1">
                      <label className="font-black text-slate-800 text-xs">Giá trị Tiết kiệm ước tính (VNĐ)</label>
                      <input
                        type="number"
                        value={form.efficiencyValueVND}
                        onChange={(e) => setForm({ ...form, efficiencyValueVND: parseInt(e.target.value || "0", 10) })}
                        placeholder="5000000"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* UPLOAD MINH CHỨNG ẢNH TRƯỚC / SAU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Image */}
                  <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-xs">Ảnh Trước Cải Tiến</span>
                      {form.beforeImageUrl && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, beforeImageUrl: "" })}
                          className="text-[11px] text-rose-600 font-bold"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    {form.beforeImageUrl ? (
                      <img src={form.beforeImageUrl} alt="Before" className="w-full h-32 object-cover rounded-xl border" />
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 bg-white rounded-xl border border-slate-200 cursor-pointer text-center hover:bg-blue-50/40">
                        <IconUpload size={22} className="text-blue-600 mb-1" />
                        <span className="text-[11px] font-bold text-slate-800">Tải ảnh Trước cải tiến</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "beforeImageUrl")}
                        />
                      </label>
                    )}
                  </div>

                  {/* After Image */}
                  <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-xs">Ảnh Sau Cải Tiến</span>
                      {form.afterImageUrl && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, afterImageUrl: "" })}
                          className="text-[11px] text-rose-600 font-bold"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    {form.afterImageUrl ? (
                      <img src={form.afterImageUrl} alt="After" className="w-full h-32 object-cover rounded-xl border" />
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 bg-white rounded-xl border border-slate-200 cursor-pointer text-center hover:bg-emerald-50/40">
                        <IconUpload size={22} className="text-emerald-600 mb-1" />
                        <span className="text-[11px] font-bold text-slate-800">Tải ảnh Sau cải tiến</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "afterImageUrl")}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                BƯỚC 3: HOÀN THIỆN HỒ SƠ (THI ĐUA VS LƯU TRỮ)
               ════════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 text-amber-600">
                      <IconBox size={20} />
                      BƯỚC 3: HOÀN THIỆN HỒ SƠ (CHỌN HÌNH THỨC NỘP & CHI TIẾT SẢN PHẨM)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phân loại bài nộp vào chương trình Thi đua khen thưởng tháng hoặc Lưu trữ tri thức cải tiến
                    </p>
                  </div>
                </div>

                {/* HÌNH THỨC NỘP CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setForm({ ...form, registrationType: "THI_DUA" })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                      form.registrationType === "THI_DUA"
                        ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-md"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white font-black text-xs">
                        🏆 THI ĐUA KHEN THƯỞNG
                      </span>
                      {form.registrationType === "THI_DUA" && <IconCheck size={18} className="text-amber-600 stroke-[3]" />}
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Hồ sơ được đưa vào danh sách chấm điểm 5 tiêu chí của Ban Đánh Giá để tham gia xét Giải Nhất, Nhì, Ba, Khuyến Khích hàng tháng.
                    </p>
                  </div>

                  <div
                    onClick={() => setForm({ ...form, registrationType: "LUU_TRU" })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                      form.registrationType === "LUU_TRU"
                        ? "border-[#006838] bg-emerald-50/70 ring-2 ring-[#006838]/20 shadow-md"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-[#006838] text-white font-black text-xs">
                        📁 LƯU TRỮ TRI THỨC
                      </span>
                      {form.registrationType === "LUU_TRU" && <IconCheck size={18} className="text-[#006838] stroke-[3]" />}
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Đưa hồ sơ vào Thư viện Cải tiến lưu trữ tri thức áp dụng nội bộ, không tham gia chấm giải thi đua tháng.
                    </p>
                  </div>
                </div>

                {/* SẢN PHẨM & KHÁCH HÀNG */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">Nhóm SP/DV</label>
                    <input
                      type="text"
                      value={form.productGroup}
                      onChange={(e) => setForm({ ...form, productGroup: e.target.value })}
                      placeholder="VD: Quai, Mũi, Đế..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">Mã Hàng Áp Dụng</label>
                    <input
                      type="text"
                      value={form.productCode}
                      onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                      placeholder="VD: SK-2026-01"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-900 text-xs">Khách Hàng</label>
                    <select
                      value={form.customer}
                      onChange={(e) => setForm({ ...form, customer: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                    >
                      <option value="DP">DP (Decathlon)</option>
                      <option value="WR">WR (Wrangler)</option>
                      <option value="RB">RB (Reebok)</option>
                      <option value="SK">SK (Skechers)</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                BƯỚC 4: XÁC NHẬN ĐƠN VỊ
               ════════════════════════════════════════════════════════════════ */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 text-[#006838]">
                      <IconShieldCheck size={20} />
                      BƯỚC 4: XÁC NHẬN CỦA ĐƠN VỊ / QUẢN LÝ TRỰC TIẾP
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Xác nhận tính chân thực, khả thi và sự đồng ý của Tổ/Xưởng trực tiếp
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-4">
                  <div className="flex items-center gap-2 text-[#006838]">
                    <IconCheck size={20} className="stroke-[3]" />
                    <span className="font-black text-xs">Cam kết của Quản lý / Tổ trưởng đơn vị</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="font-black text-slate-900 text-xs">
                        Họ và Tên Quản Lý / Tổ Trưởng Xác Nhận <span className="text-rose-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.supervisorName}
                        onChange={(e) => setForm({ ...form, supervisorName: e.target.value })}
                        placeholder="VD: Lê Hoàng Nam (Quản đốc Xưởng 1)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                BƯỚC 5: NỘP TRƯỚC NGÀY 25 & PREVIEW
               ════════════════════════════════════════════════════════════════ */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2 text-rose-600">
                      <IconCalendar size={20} />
                      BƯỚC 5: XEM LẠI HỒ SƠ & NỘP CHÍNH THỨC TRƯỚC HẠN NGÀY 25
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hồ sơ được gửi chính thức đến Ban 2.2 để tham gia tổng hợp thi đua tháng {form.proposerMonth}/{form.proposerYear}
                    </p>
                  </div>
                </div>

                {/* PREVIEW SUMMARY CARD */}
                <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-xs text-slate-900">Tóm Tắt Hồ Sơ Đã Nhập</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#006838] text-white font-black text-[10px]">
                      {form.registrationType === "THI_DUA" ? "THI ĐUA THÁNG" : "LƯU TRỮ"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div><strong>Tác giả:</strong> {form.proposerName} ({form.proposerEmpCode})</div>
                    <div><strong>Đơn vị:</strong> {form.department} - {form.region}</div>
                    <div><strong>Chủ đề:</strong> {form.categoryLabel}</div>
                    <div><strong>Tên sáng kiến:</strong> {form.title}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50 flex items-start gap-3">
                  <IconAlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-black text-amber-900">Quy định hạn chót ngày 25 hàng tháng</h4>
                    <p className="text-amber-800 font-medium leading-relaxed">
                      Để hồ sơ được đưa vào danh sách chấm điểm và xét giải thi đua Tháng {form.proposerMonth}, tác giả cần đảm bảo hồ sơ hoàn tất và nộp chính thức trước 23:59 ngày 25. Các bài nộp sau ngày 25 sẽ chuyển sang xét thi đua của tháng tiếp theo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEPPER CONTROLS & NAVIGATION */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <IconArrowLeft size={16} />
                  <span>Quay lại Bước {currentStep - 1}</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#006838] text-white hover:bg-[#004d29] font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Tiếp tục sang Bước {currentStep + 1}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || uploading}
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#006838] to-[#0b1739] text-white hover:opacity-95 font-black text-xs shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <span>ĐANG GỬI HỒ SƠ 5 BƯỚC...</span>
                  ) : (
                    <>
                      <IconSend size={18} />
                      <span>XÁC NHẬN NỘP HỒ SƠ CHÍNH THỨC</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
