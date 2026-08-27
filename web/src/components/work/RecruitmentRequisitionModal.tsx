"use client";

import React, { useState, useEffect } from "react";
import {
  IconX,
  IconUserPlus,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconSend,
  IconBuilding,
  IconCoins,
  IconFileText,
  IconShieldCheck,
  IconBriefcase,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import { getCurrentUser } from "@/lib/userProfiles";

export interface RecruitmentRequisitionItem {
  id: string;
  positionTitle: string;
  department: string;
  quantity: number;
  reason: string;
  salaryRange: string;
  jobDescription: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  requestedBy: {
    empCode: string;
    name: string;
    title: string;
  };
  status: "PENDING_CEO" | "APPROVED_CEO" | "REJECTED_CEO" | "POSTED_HR";
  createdAt: string;
  ceoComment?: string;
}

const INITIAL_REQUISITIONS: RecruitmentRequisitionItem[] = [
  {
    id: "YCTD-2026-001",
    positionTitle: "Kỹ Sư Kiểm Soát Chất Lượng (QC Lead) Chuyền May 05",
    department: "Khối Quản Lý Chất Lượng (QC)",
    quantity: 2,
    reason: "Mở rộng dây chuyền dán đế giày SKECHERS D'Lites ca 2",
    salaryRange: "14.000.000 - 18.000.000 VNĐ",
    jobDescription: "Kiểm soát chỉ số lỗi QC, tiêu chuẩn kỹ thuật keo dán và độ bền kéo đế giày SKECHERS.",
    priority: "HIGH",
    requestedBy: {
      empCode: "QC-001",
      name: "Bùi Thị Hằng",
      title: "Quản Lý QC & Kiểm Soát Chất Lượng",
    },
    status: "PENDING_CEO",
    createdAt: "19/08/2026 14:30",
  },
  {
    id: "YCTD-2026-002",
    positionTitle: "Chuyên Viên Số Hóa & Tự Động Hóa Năng Suất CI",
    department: "CN-CI (Cải Tiến Liên Tục)",
    quantity: 1,
    reason: "Triển khai dự án Kaizen 4.0 Chuỗi SKECHERS",
    salaryRange: "18.000.000 - 25.000.000 VNĐ",
    jobDescription: "Phân tích lãng phí Lean, lập bản đồ Gemba và lập trình IoT cảm biến chuyền gò.",
    priority: "MEDIUM",
    requestedBy: {
      empCode: "202608001",
      name: "Phạm Nguyễn Anh Huy",
      title: "IT - Team Chuyển Đổi Số",
    },
    status: "APPROVED_CEO",
    createdAt: "18/08/2026 09:15",
    ceoComment: "Đã phê duyệt. Ưu tiên tuyển ứng viên có kinh nghiệm ngành da giày.",
  },
];

export function getStoredRequisitions(): RecruitmentRequisitionItem[] {
  if (typeof window === "undefined") return INITIAL_REQUISITIONS;
  try {
    const data = localStorage.getItem("tbs_recruitment_requisitions");
    if (data) {
      return JSON.parse(data);
    } else {
      localStorage.setItem("tbs_recruitment_requisitions", JSON.stringify(INITIAL_REQUISITIONS));
      return INITIAL_REQUISITIONS;
    }
  } catch {
    return INITIAL_REQUISITIONS;
  }
}

export function saveStoredRequisitions(items: RecruitmentRequisitionItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("tbs_recruitment_requisitions", JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("tbs_requisition_updated"));
  } catch (e) {
    console.error("Lỗi lưu yêu cầu tuyển dụng:", e);
  }
}

interface RecruitmentRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRoleType: "CBNV" | "EXECUTIVE" | "HR";
  onSuccessToast?: (msg: string) => void;
}

export default function RecruitmentRequisitionModal({
  isOpen,
  onClose,
  userRoleType,
  onSuccessToast,
}: RecruitmentRequisitionModalProps) {
  const [requisitions, setRequisitions] = useState<RecruitmentRequisitionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"CREATE" | "LIST">("CREATE");

  // Form state
  const [positionTitle, setPositionTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [salaryRange, setSalaryRange] = useState("12.000.000 - 16.000.000 VNĐ");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [jobDescription, setJobDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const data = getStoredRequisitions();
      setRequisitions(data);

      const curUser = getCurrentUser();
      if (curUser) {
        setDepartment(curUser.department || "Bộ Phận Chuyên Môn");
      }

      if (userRoleType === "EXECUTIVE" || userRoleType === "HR") {
        setActiveTab("LIST");
      } else {
        setActiveTab("CREATE");
      }
    }
  }, [isOpen, userRoleType]);

  if (!isOpen) return null;

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionTitle.trim() || !reason.trim()) {
      alert("Vui lòng điền tên vị trí và lý do tuyển dụng.");
      return;
    }

    setIsSubmitting(true);
    const curUser = getCurrentUser() || {
      empCode: "202608001",
      name: "Cán Bộ Nhân Viên",
      title: "Quản Lý Chuyên Môn",
      department: department || "Bộ Phận Sản Xuất",
    };

    const newItem: RecruitmentRequisitionItem = {
      id: `YCTD-2026-${String(requisitions.length + 1).padStart(3, "0")}`,
      positionTitle: positionTitle.trim(),
      department: department || curUser.department || "Bộ phận chuyên môn",
      quantity: Number(quantity) || 1,
      reason: reason.trim(),
      salaryRange: salaryRange.trim(),
      jobDescription: jobDescription.trim() || "Mô tả công việc đang được cập nhật theo tiêu chuẩn TBS Group.",
      priority,
      requestedBy: {
        empCode: curUser.empCode,
        name: curUser.name,
        title: curUser.title || "Cán Bộ Nhân Viên",
      },
      status: "PENDING_CEO",
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    const updated = [newItem, ...requisitions];
    saveStoredRequisitions(updated);
    setRequisitions(updated);
    setIsSubmitting(false);

    if (onSuccessToast) {
      onSuccessToast(`Đã gửi Yêu cầu tuyển dụng "${newItem.positionTitle}" thành công cho Sếp Tổng phê duyệt!`);
    } else {
      alert(`Đã gửi Yêu cầu tuyển dụng "${newItem.positionTitle}" thành công cho Sếp Tổng phê duyệt!`);
    }

    // Reset form
    setPositionTitle("");
    setReason("");
    setJobDescription("");
    setActiveTab("LIST");
  };

  const handleCEOApprove = (id: string) => {
    const updated = requisitions.map((req) => {
      if (req.id === id) {
        return {
          ...req,
          status: "APPROVED_CEO" as const,
          ceoComment: "Đã phê duyệt bởi Tổng Giám Đốc. Chuyển Phòng Nhân Sự đăng bài tuyển dụng.",
        };
      }
      return req;
    });

    saveStoredRequisitions(updated);
    setRequisitions(updated);

    if (onSuccessToast) {
      onSuccessToast("Đã phê duyệt Yêu cầu tuyển dụng thành công! Thông tin đã chuyển sang Phòng Nhân Sự.");
    }
  };

  const handleCEOReject = (id: string) => {
    const updated = requisitions.map((req) => {
      if (req.id === id) {
        return {
          ...req,
          status: "REJECTED_CEO" as const,
          ceoComment: "Cần xem xét lại định biên nhân sự của xưởng.",
        };
      }
      return req;
    });

    saveStoredRequisitions(updated);
    setRequisitions(updated);

    if (onSuccessToast) {
      onSuccessToast("Đã từ chối Yêu cầu tuyển dụng.");
    }
  };

  const handleHRPostJob = (req: RecruitmentRequisitionItem) => {
    const updated = requisitions.map((item) => {
      if (item.id === req.id) {
        return {
          ...item,
          status: "POSTED_HR" as const,
        };
      }
      return item;
    });

    saveStoredRequisitions(updated);
    setRequisitions(updated);

    if (onSuccessToast) {
      onSuccessToast(`Đã chuyển Yêu cầu tuyển dụng "${req.positionTitle}" thành tin tuyển dụng trên Cổng Careers thành công!`);
    }
  };

  const pendingCEOCount = requisitions.filter((r) => r.status === "PENDING_CEO").length;
  const approvedCEOCount = requisitions.filter((r) => r.status === "APPROVED_CEO").length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start">
      <div className="bg-white rounded-3xl max-w-3xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-8 sm:my-12">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#006838] via-[#00552e] to-[#00381e] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <IconUserPlus size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {userRoleType === "EXECUTIVE"
                  ? "Duyệt Yêu Cầu Tuyển Dụng Nhân Sự"
                  : userRoleType === "HR"
                  ? "Tiếp Nhận & Đăng Bài Tuyển Dụng"
                  : "Đề Xuất / Yêu Cầu Tuyển Dụng Nhân Sự"}
              </h3>
              <p className="text-xs text-emerald-200 font-medium mt-0.5">
                Tổ hợp Kiên Giang - TBS Group - Quy trình phê duyệt &amp; số hóa tuyển dụng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Sub-Header Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-shrink-0 text-xs font-bold">
          <div className="flex items-center gap-2">
            {userRoleType === "CBNV" && (
              <button
                onClick={() => setActiveTab("CREATE")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeTab === "CREATE"
                    ? "bg-[#006838] text-white font-extrabold shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                📝 Tạo Yêu Cầu Mới
              </button>
            )}

            <button
              onClick={() => setActiveTab("LIST")}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === "LIST"
                  ? "bg-[#006838] text-white font-extrabold shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>📋 Danh Sách Yêu Cầu</span>
              {userRoleType === "EXECUTIVE" && pendingCEOCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {pendingCEOCount} mới
                </span>
              )}
              {userRoleType === "HR" && approvedCEOCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  {approvedCEOCount} chờ đăng
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold hidden sm:block">
            {userRoleType === "CBNV"
              ? "Gửi Sếp Tổng ➔ Sếp Duyệt ➔ HR Đăng Bài"
              : userRoleType === "EXECUTIVE"
              ? "Phê duyệt định biên & ngân sách tuyển dụng"
              : "Bộ phận Nhân Sự đăng tuyển công khai"}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-800">
          {/* TAB 1: FORM TẠO YÊU CẦU MỚI (CHỦ YẾU CHO CBNV / TRƯỞNG BỘ PHẬN) */}
          {activeTab === "CREATE" && (
            <form onSubmit={handleCreateRequisition} className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex items-start gap-3 text-xs text-[#006838]">
                <IconSparkles size={20} className="flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">
                  <strong>Quy trình số hóa:</strong> Yêu cầu tuyển dụng của bạn sẽ được gửi thẳng tới màn hình phê duyệt của <strong>Tổng Giám Đốc (Sếp Tổng)</strong>. Ngay khi Sếp phê duyệt, thông tin sẽ chuyển tự động cho <strong>Phòng Nhân Sự</strong> để phát hành tin tuyển dụng!
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vị trí tuyển dụng */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <IconBriefcase size={15} className="text-[#006838]" />
                    <span>Vị trí / Chức danh cần tuyển dụng <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Kỹ Sư Kiểm Soát Chất Lượng (QC Lead) Chuyền May 05"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                  />
                </div>

                {/* Bộ phận đề xuất */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <IconBuilding size={15} className="text-[#006838]" />
                    <span>Bộ phận / Xưởng sản xuất <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                  />
                </div>

                {/* Số lượng */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <IconUserPlus size={15} className="text-[#006838]" />
                    <span>Số lượng nhân sự cần tuyển <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                  />
                </div>

                {/* Mức lương đề xuất */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <IconCoins size={15} className="text-[#006838]" />
                    <span>Mức lương đề xuất (Khung ngân sách)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 14.000.000 - 18.000.000 VNĐ"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                  />
                </div>

                {/* Mức độ ưu tiên */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <IconClock size={15} className="text-[#006838]" />
                    <span>Mức độ ưu tiên</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                  >
                    <option value="HIGH">🔥 Gấp (Cần bổ sung trong 7 - 14 ngày)</option>
                    <option value="MEDIUM">⚡ Bình thường (Trong 30 ngày)</option>
                    <option value="LOW">🌱 Dài hạn (Quy hoạch định biên)</option>
                  </select>
                </div>

                {/* Lý do tuyển dụng */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <IconFileText size={15} className="text-[#006838]" />
                    <span>Lý do cần tuyển dụng <span className="text-rose-500">*</span></span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="VD: Mở rộng chuyền sản xuất may dán đế mẫu SKECHERS D'Lites ca 2; Thay thế NV nghỉ thai sản..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                  />
                </div>

                {/* Mô tả công việc */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <IconFileText size={15} className="text-[#006838]" />
                    <span>Tóm tắt mô tả công việc &amp; yêu cầu kỹ năng</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Có ít nhất 2 năm kinh nghiệm QC da giày; Hiểu tiêu chuẩn kiểm hàng AQL SKECHERS..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#004d29] text-white text-xs font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <IconSend size={16} />
                  <span>Gửi Yêu Cầu Sang Sếp Tổng Duyệt</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DANH SÁCH YÊU CẦU & QUY TRÌNH PHÊ DUYỆT */}
          {activeTab === "LIST" && (
            <div className="space-y-3">
              {requisitions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">
                  Chưa có yêu cầu tuyển dụng nào được tạo.
                </div>
              ) : (
                requisitions.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.id}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 leading-snug">
                            {item.positionTitle}
                          </h4>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {item.status === "PENDING_CEO" && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-black flex items-center gap-1 animate-pulse">
                              <IconClock size={13} />
                              <span>Chờ Sếp Tổng Duyệt</span>
                            </span>
                          )}

                          {item.status === "APPROVED_CEO" && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black flex items-center gap-1">
                              <IconShieldCheck size={13} className="text-[#006838]" />
                              <span>Sếp Duyệt ➔ Chờ HR Đăng Bài</span>
                            </span>
                          )}

                          {item.status === "POSTED_HR" && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black flex items-center gap-1">
                              <IconCheck size={13} />
                              <span>Đã Đăng Tuyển (Live)</span>
                            </span>
                          )}

                          {item.status === "REJECTED_CEO" && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-black flex items-center gap-1">
                              <IconAlertCircle size={13} />
                              <span>Sếp Từ Chối</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Người đề xuất:</span>
                          <span className="font-extrabold text-slate-800">{item.requestedBy.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{item.requestedBy.title}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Bộ phận / Xưởng:</span>
                          <span className="font-extrabold text-slate-800">{item.department}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Số lượng &amp; Khung lương:</span>
                          <span className="font-extrabold text-[#006838]">{item.quantity} nhân sự</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{item.salaryRange}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Thời gian tạo:</span>
                          <span className="font-semibold text-slate-600 font-mono">{item.createdAt}</span>
                        </div>
                      </div>

                      {/* Reason & Description */}
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                        <div className="font-bold text-slate-800">
                          📌 <span className="underline">Lý do tuyển:</span> {item.reason}
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          📝 <span className="underline">Mô tả:</span> {item.jobDescription}
                        </div>
                        {item.ceoComment && (
                          <div className="text-emerald-800 font-bold text-[11px] pt-1 border-t border-slate-200/60 mt-1">
                            💬 <span className="underline">Ý kiến Tổng Giám Đốc:</span> {item.ceoComment}
                          </div>
                        )}
                      </div>

                      {/* Action buttons depending on User Role */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        {/* If Sếp Tổng (EXECUTIVE) and item is PENDING_CEO */}
                        {(userRoleType === "EXECUTIVE" || userRoleType === "HR") && item.status === "PENDING_CEO" && (
                          <>
                            <button
                              onClick={() => handleCEOReject(item.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                            >
                              Từ Chối
                            </button>
                            <button
                              onClick={() => handleCEOApprove(item.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#006838] hover:bg-[#004d29] text-white text-xs font-extrabold transition shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <IconCheck size={14} />
                              <span>Sếp Phê Duyệt ➔ Chuyển HR</span>
                            </button>
                          </>
                        )}

                        {/* If HR and item is APPROVED_CEO */}
                        {userRoleType === "HR" && item.status === "APPROVED_CEO" && (
                          <button
                            onClick={() => handleHRPostJob(item)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <IconArrowRight size={14} />
                            <span>🚀 Đăng Bài Tuyển Dụng Ngay</span>
                          </button>
                        )}

                        {item.status === "POSTED_HR" && (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <IconCheck size={14} />
                            <span>Đã phát hành công khai trên Cổng Careers</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
