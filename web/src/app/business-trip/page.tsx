"use client";

import React, { useState, useEffect, useRef } from "react";
import NavLink from "@/components/NavLink";
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconSend,
  IconX,
  IconCheck,
  IconCalendar,
  IconMapPin,
  IconCar,
  IconUser,
  IconBriefcase,
  IconBuilding,
  IconPhone,
  IconFileText,
  IconSearch,
  IconFilter,
  IconBell,
  IconChevronDown,
  IconChecklist,
  IconEdit,
  IconEye,
  IconDownload,
  IconRefresh,
  IconPaperclip,
  IconPhoto,
  IconFileTypePdf,
  IconReceipt,
  IconUpload,
  IconExternalLink,
  IconCash,
  IconZoomIn,
} from "@tabler/icons-react";
import Can from "@/components/Can";
import UserAvatar from "@/components/UserAvatar";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import { getCurrentUser, formatTitleWithDepartment } from "@/lib/userProfiles";
import { broadcastNotification } from "@/lib/browserNotifications";

export interface TripAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  createdAt: string;
}

export interface TripInvoice {
  id: string;
  title: string;
  category: "Vé máy bay / Tàu xe" | "Khách sạn / Lưu trú" | "Ăn uống / Tiếp khách" | "Xăng xe / Cầu đường" | "Chi phí khác";
  amount: number;
  invoiceDate: string;
  invoiceNumber?: string;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  notes?: string;
  createdAt: string;
}

interface Participant {
  id: string;
  fullName: string;
  position: string;
  employeeId: string;
  department: string;
  phone: string;
  pickupLocation: string;
}

export type TripStatus =
  | "PENDING"
  | "PENDING_L2"
  | "APPROVED"
  | "REJECTED";

export type BudgetStatus =
  | "pending_dept_budget"
  | "pending_exec_budget"
  | "budget_approved"
  | "budget_rejected";

interface BusinessTripRecord {
  id: string;
  code: string;
  title: string;
  region: string;
  factory?: string;
  creator: string;
  creator_emp_code?: string;
  department: string;
  departmentId?: string;
  location: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  transport: string;
  participantsCount: number;
  purpose?: string;
  address?: string;
  proposalText?: string;
  attachmentsJson?: string;
  attachments?: TripAttachment[];
  invoicesJson?: string;
  invoices?: TripInvoice[];
  participantsJson?: string;
  status: TripStatus;
  estimatedCost?: number;
  version?: number;
  approvedLevel?: string;
  rejectedLevel?: "L1" | "L2";
  rejectionReason?: string;
  budgetStatus?: BudgetStatus;
  budgetAmount?: number;
  budgetRejectionReason?: string;
  createdAt: string;
}

// ✅ 6 Standard Region / Factory / Location Options
export const STANDARD_LOCATIONS = [
  "Kiên Giang 1",
  "Kiên Giang 2",
  "Kiên Giang 3",
  "Hoàn Thiện Đế",
  "Nhà Máy Miền Đông",
  "VP Chuỗi (R&D)",
];

const REGION_MAPPING: Record<string, { factories: string[]; locations: string[] }> = {
  "Kiên Giang 1": {
    factories: STANDARD_LOCATIONS,
    locations: STANDARD_LOCATIONS,
  },
  "Kiên Giang 2": {
    factories: STANDARD_LOCATIONS,
    locations: STANDARD_LOCATIONS,
  },
  "Kiên Giang 3": {
    factories: STANDARD_LOCATIONS,
    locations: STANDARD_LOCATIONS,
  },
  "Hoàn Thiện Đế": {
    factories: STANDARD_LOCATIONS,
    locations: STANDARD_LOCATIONS,
  },
  "Nhà Máy Miền Đông": {
    factories: STANDARD_LOCATIONS,
    locations: STANDARD_LOCATIONS,
  },
  "VP Chuỗi (R&D)": {
    factories: STANDARD_LOCATIONS,
    locations: STANDARD_LOCATIONS,
  },
};

const DEFAULT_DEPARTMENTS_LIST = [
  "CN-PPH & CI",
  "KD PTSP",
  "KHCB-TTPP",
  "NHÂN SỰ-HC",
  "QLCL & LAB",
  "ĐH-QT",
];

import { canApproveTrip as checkCanApproveTrip, resolveEmployeeLevel, isSameDepartmentScope } from "@/lib/permissionEngine";

export function canApproveTripLevel1(currentUser: any, rec: BusinessTripRecord, isExecutiveOrAdmin: boolean): boolean {
  if (!currentUser || !rec) return false;

  // Segregation of duties: Creator cannot approve own proposal
  const creatorEmpCode = (rec.creator_emp_code || "").trim().toUpperCase();
  const currentEmpCode = (currentUser.empCode || "").trim().toUpperCase();
  const creatorName = (rec.creator || "").trim().toLowerCase();
  const currentName = (currentUser.name || "").trim().toLowerCase();
  if ((creatorEmpCode && currentEmpCode && creatorEmpCode === currentEmpCode) || (creatorName && currentName && creatorName === currentName)) {
    return false;
  }

  const checkRes = checkCanApproveTrip(currentUser, rec);
  return checkRes.allowed;
}

export function canApproveTripLevel2(currentUser: any, rec: BusinessTripRecord, isExecutiveOrAdmin: boolean): boolean {
  if (!currentUser || !rec) return false;

  // Segregation of duties
  const creatorEmpCode = (rec.creator_emp_code || "").trim().toUpperCase();
  const currentEmpCode = (currentUser.empCode || "").trim().toUpperCase();
  const creatorName = (rec.creator || "").trim().toLowerCase();
  const currentName = (currentUser.name || "").trim().toLowerCase();
  if ((creatorEmpCode && currentEmpCode && creatorEmpCode === currentEmpCode) || (creatorName && currentName && creatorName === currentName)) {
    return false;
  }

  const resolved = resolveEmployeeLevel(currentUser);
  // Level 2 (BGĐ Approval) requires rank >= 3 (PGĐ, GĐ, P.TGĐ, TGĐ, Super Admin)
  return resolved.levelRank >= 3 || isExecutiveOrAdmin || currentUser.roleCode === "SUPER_ADMIN";
}

export default function BusinessTripRegistrationPage() {
  const { can, roles, managedDepartmentId, isExecutiveOrAdmin } = usePermission();
  const [activeTab, setActiveTab] = useState<"FORM" | "LIST">("FORM");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModalRecord, setSelectedModalRecord] = useState<BusinessTripRecord | null>(null);
  const [departmentsList, setDepartmentsList] = useState<string[]>(DEFAULT_DEPARTMENTS_LIST);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await fetch("/api/departments");
        if (res.ok) {
          const json = await res.json();
          const list = json.departments || json.data;
          if (json.success && Array.isArray(list) && list.length > 0) {
            const sortedList = Array.from(new Set<string>(list)).sort((a, b) => a.localeCompare(b, "vi"));
            setDepartmentsList(sortedList);
            return;
          }
        }

        // Fallback: fetch from /api/users
        const userRes = await fetch("/api/users");
        if (userRes.ok) {
          const userJson = await userRes.json();
          if (userJson.success && Array.isArray(userJson.data) && userJson.data.length > 0) {
            const fetchedDepts = new Set<string>();
            userJson.data.forEach((u: any) => {
              const d = u.department || u.phong_ban_hien_tai;
              if (d && typeof d === "string" && d.trim() && d.trim() !== "Khối Quản Trị Hệ Thống") {
                fetchedDepts.add(d.trim());
              }
            });
            if (fetchedDepts.size > 0) {
              const sortedList = Array.from(fetchedDepts).sort((a, b) => a.localeCompare(b, "vi"));
              setDepartmentsList(sortedList);
              return;
            }
          }
        }
      } catch (e) {}
      setDepartmentsList(DEFAULT_DEPARTMENTS_LIST);
    }
    loadDepartments();
  }, []);

  // File Upload State for Form Proposal
  const [attachments, setAttachments] = useState<TripAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Invoice Management Modal State (Tab 2: LIST)
  const [activeInvoiceTrip, setActiveInvoiceTrip] = useState<BusinessTripRecord | null>(null);
  const [globalImportModal, setGlobalImportModal] = useState(false);
  const [selectedTripIdForImport, setSelectedTripIdForImport] = useState<string>("");
  const invoiceFileInputRef = useRef<HTMLInputElement>(null);
  const [newInvoiceForm, setNewInvoiceForm] = useState<{
    title: string;
    category: "Vé máy bay / Tàu xe" | "Khách sạn / Lưu trú" | "Ăn uống / Tiếp khách" | "Xăng xe / Cầu đường" | "Chi phí khác";
    amount: string;
    invoiceDate: string;
    invoiceNumber: string;
    notes: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
  }>({
    title: "",
    category: "Vé máy bay / Tàu xe",
    amount: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    notes: "",
    fileName: "",
    fileType: "",
    fileUrl: "",
  });

  // Preview Modal for Images / PDFs
  const [previewModal, setPreviewModal] = useState<{ url: string; title: string; type: string } | null>(null);

  // Rejection Modal State
  const [rejectionTarget, setRejectionTarget] = useState<{ id: string; level: "department_head" | "executive_board" } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  const [currentUser, setCurrentUser] = useState<{ name: string; title: string; department: string; avatar: string; roleCode?: string; empCode?: string }>({
    name: "Cán Bộ Công Nhân Viên",
    title: "Cán Bộ Công Nhân Viên",
    department: "Tổ hợp Kiên Giang - TBS Group",
    avatar: "/images/tbs-logo.png",
    empCode: "",
  });

  useEffect(() => {
    async function loadUser() {
      const cur = getCurrentUser();
      if (!cur || !cur.name) return;

      // 🔍 DEBUG
      console.debug('[business-trip] Loaded user:', {
        empCode: cur.empCode,
        name: cur.name,
        title: cur.title,
        department: cur.department,
        employeeLevel: cur.employeeLevel,
        levelRank: cur.levelRank,
      });

      let userName = cur.name;
      let userDept = cur.department;
      let userEmpCode = cur.empCode || "";
      let userRoleCode = cur.roleCode || "CBCNV";
      let userTitle = cur.title || "Cán Bộ Công Nhân Viên";

      if (cur.empCode) {
        try {
          const res = await fetch(`/api/users?empCode=${encodeURIComponent(cur.empCode)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              const matched = json.data.find((u: any) => String(u.emp_code).toUpperCase() === String(cur.empCode).toUpperCase()) || json.data[0];
              if (matched) {
                if (matched.phong_ban_hien_tai || matched.department) userDept = matched.phong_ban_hien_tai || matched.department;
                if (matched.name) userName = matched.name;
                if (matched.role_code) userRoleCode = matched.role_code;
                if (matched.vtcv_sap || matched.vtcv_hien_tai || matched.title) userTitle = matched.vtcv_sap || matched.vtcv_hien_tai || matched.title;
              }
            }
          }
        } catch (e) {}
      }

      if (!userDept || userDept === "TBS Group" || userDept === "Tổ hợp Kiên Giang - TBS Group" || userDept === "Hành chính") {
        userDept = "NHÂN SỰ-HC";
      }

      setCurrentUser({
        name: userName,
        title: userTitle,
        department: userDept,
        avatar: cur.avatar || "/images/tbs-logo.png",
        roleCode: userRoleCode,
        empCode: userEmpCode,
      });
      
      // ✅ Auto-set creator and department from current user's real department in D1 DB
      setProposalForm(prev => ({
        ...prev,
        creator: userName,
        department: userDept
      }));
    }

    loadUser();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_profile_updated", loadUser);
      return () => window.removeEventListener("tbs_profile_updated", loadUser);
    }
  }, []);

  // Initialize factory and location on mount
  useEffect(() => {
    const defaultRegion = "VP Chuỗi (R&D)";
    setProposalForm(prev => ({
      ...prev,
      factory: prev.factory || defaultRegion,
      location: prev.location || defaultRegion
    }));
  }, []);

  // Sequential Approval Handlers with Real D1 Persistence
  const handleApproveTrip = async (id: string, level: "department_head" | "executive_board") => {
    const target = records.find((r) => r.id === id);
    const actionLevel = level === "department_head" ? "APPROVE_L1" : "APPROVE_L2";
    const currentVersion = target?.version || 1;

    try {
      setIsLoading(true);
      const res = await fetch("/api/business-trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          actionLevel,
          version: currentVersion,
        }),
      });

      const data = await res.json();

      if (res.status === 403 || data.error === "SEGREGATION_OF_DUTIES_VIOLATION") {
        alert(data.message || "Cảnh báo: Bạn không thể tự phê duyệt đề xuất công tác do chính mình tạo!");
        showToast("⚠️ Cảnh báo phân tách nhiệm vụ: Không thể tự phê duyệt!");
        return;
      }

      if (res.status === 409 || data.code === "OPTIMISTIC_LOCK_CONFLICT" || data.error === "OPTIMISTIC_LOCK_CONFLICT") {
        showToast("⚠️ Dữ liệu đã được người khác cập nhật, đang tải lại...");
        await fetchD1Records();
        return;
      }

      if (res.status === 422 || data.error === "INVALID_STATE_TRANSITION") {
        showToast(`❌ ${data.message || "Lỗi luồng duyệt: Đề xuất chưa qua phê duyệt cấp 1 hoặc đã hoàn tất!"}`);
        return;
      }

      if (!res.ok || !data.success) {
        showToast(`❌ Lỗi khi duyệt đơn: ${data.message || data.error || "Không thể kết nối D1"}`);
        return;
      }

      // Success: refresh from D1 to get exact status & updated version
      await fetchD1Records();

      showToast(
        level === "department_head"
          ? "✅ Trưởng phòng đã duyệt D1! Đã chuyển đơn lên Ban Giám Đốc (Cấp 2)."
          : "🎉 Ban Giám Đốc đã duyệt hoàn tất đơn công tác trên D1 Database!"
      );

      if (target) {
        if (level === "department_head") {
          broadcastNotification({
            title: "✅ Đã Phê Duyệt Cấp 1 (Trưởng Phòng)",
            message: `Trưởng phòng đã phê duyệt đề xuất công tác "${target.title}" của ${target.creator}. Đơn đã chuyển lên Ban Giám Đốc (Cấp 2).`,
            type: "SUCCESS",
            targetUser: target.creator, // ✅ CHỈ gửi cho người tạo
            link: "/business-trip",
          });

          broadcastNotification({
            title: "🛎️ Đơn Công Tác Chờ TGĐ Phê Duyệt Cấp 2",
            message: `Đơn công tác "${target.title}" của ${target.creator} (${target.department}) đã được Trưởng phòng duyệt, đang chờ Ban Giám Đốc phê duyệt Cấp 2.`,
            type: "INFO",
            targetUser: "Ban Giám Đốc", // ✅ CHỈ gửi cho Ban Giám Đốc
            link: "/business-trip",
          });
        } else {
          broadcastNotification({
            title: "🎉 Ban Giám Đốc Đã Phê Duyệt Hoàn Tất",
            message: `Đề xuất công tác "${target.title}" của bạn đã được Ban Giám Đốc phê duyệt chính thức. Lễ Tân sẽ bố trí phương tiện ${target.transport}.`,
            type: "SUCCESS",
            targetUser: target.creator, // ✅ CHỈ gửi cho người tạo
            link: "/business-trip",
          });

          broadcastNotification({
            title: "🚗 Bố Trí Xe Công Tác Mới",
            message: `Đơn công tác "${target.title}" của ${target.creator} (${target.startDate} - ${target.endDate}) đã duyệt hoàn tất. Vui lòng xếp xe công ty/phương tiện.`,
            type: "INFO",
            targetUser: "Lễ Tân", // ✅ CHỈ gửi cho Lễ Tân
            link: "/business-trip",
          });
        }
      }
    } catch (err) {
      showToast("❌ Lỗi mạng hoặc máy chủ, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRejectModal = (id: string, level: "department_head" | "executive_board") => {
    setRejectionTarget({ id, level });
    setRejectionReasonInput("");
  };

  const handleConfirmReject = async () => {
    if (!rejectionTarget) return;
    const { id, level } = rejectionTarget;
    const target = records.find((r) => r.id === id);
    const actionLevel = level === "department_head" ? "REJECT_L1" : "REJECT_L2";
    const currentVersion = target?.version || 1;

    try {
      setIsLoading(true);
      const res = await fetch("/api/business-trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "REJECTED",
          actionLevel,
          rejectionReason: rejectionReasonInput || "Không đáp ứng điều kiện",
          version: currentVersion,
        }),
      });

      const data = await res.json();

      if (res.status === 403 || data.error === "SEGREGATION_OF_DUTIES_VIOLATION") {
        alert(data.message || "Cảnh báo: Bạn không thể tự từ chối đề xuất do chính mình tạo!");
        showToast("⚠️ Cảnh báo phân tách nhiệm vụ: Không thể thao tác!");
        return;
      }

      if (res.status === 409 || data.code === "OPTIMISTIC_LOCK_CONFLICT" || data.error === "OPTIMISTIC_LOCK_CONFLICT") {
        showToast("⚠️ Dữ liệu đã được người khác cập nhật, đang tải lại...");
        await fetchD1Records();
        setRejectionTarget(null);
        return;
      }

      if (!res.ok || !data.success) {
        showToast(`❌ Lỗi khi từ chối đơn: ${data.message || data.error || "Không thể kết nối D1"}`);
        return;
      }

      await fetchD1Records();
      setRejectionTarget(null);
      showToast(`❌ Đã từ chối đơn công tác (${level === "department_head" ? "Trưởng phòng" : "Ban Giám Đốc"}) trên D1 Database!`);

      if (target) {
        broadcastNotification({
          title: "❌ Đề Xuất Công Tác Bị Từ Chối",
          message: `Đề xuất công tác "${target.title}" của bạn đã bị từ chối (${level === "department_head" ? "Trưởng phòng" : "Ban Giám Đốc"}). Lý do: ${rejectionReasonInput || "Không đáp ứng điều kiện"}.`,
          type: "WARNING",
          targetUser: target.creator, // ✅ CHỈ gửi cho người tạo
          link: "/business-trip",
        });
      }
    } catch (err) {
      showToast("❌ Lỗi mạng hoặc máy chủ, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Budget 2-Level Approval State & Handlers with Real D1 Persistence
  const [activeBudgetTrip, setActiveBudgetTrip] = useState<BusinessTripRecord | null>(null);
  const [budgetRejectionReason, setBudgetRejectionReason] = useState("");

  const handleApproveBudget = async (id: string, level: "dept_budget" | "exec_budget") => {
    const target = records.find((r) => r.id === id);
    const actionLevel = level === "dept_budget" ? "APPROVE_BUDGET_L1" : "APPROVE_BUDGET_L2";
    const currentVersion = target?.version || 1;

    try {
      setIsLoading(true);
      const res = await fetch("/api/business-trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          actionLevel,
          version: currentVersion,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.code === "OPTIMISTIC_LOCK_CONFLICT" || data.error === "OPTIMISTIC_LOCK_CONFLICT") {
        showToast("⚠️ Dữ liệu đã được người khác cập nhật, đang tải lại...");
        await fetchD1Records();
        return;
      }

      if (!res.ok || !data.success) {
        showToast(`❌ Lỗi duyệt ngân sách: ${data.message || data.error || "Lỗi kết nối D1"}`);
        return;
      }

      await fetchD1Records();
      if (activeBudgetTrip && activeBudgetTrip.id === id) {
        setActiveBudgetTrip({
          ...activeBudgetTrip,
          budgetStatus: level === "dept_budget" ? "pending_exec_budget" : "budget_approved",
        });
      }

      showToast(
        level === "dept_budget"
          ? "✅ Đã duyệt ngân sách Cấp 1! Đã chuyển đơn ngân sách lên Ban Giám Đốc / CFO (Cấp 2)."
          : "🎉 Ban Giám Đốc / CFO đã phê duyệt hoàn tất ngân sách công tác!"
      );

      if (target) {
        if (level === "dept_budget") {
          broadcastNotification({
            title: "✅ Duyệt Ngân Sách Cấp 1 (Trưởng Phòng)",
            message: `Ngân sách đề xuất công tác "${target.title}" của ${target.creator} đã qua Cấp 1. Đã chuyển lên Ban Giám Đốc / CFO duyệt Cấp 2.`,
            type: "SUCCESS",
            targetUser: target.creator, // ✅ CHỈ gửi cho người tạo
            link: "/business-trip",
          });

          broadcastNotification({
            title: "💰 Đề Xuất Ngân Sách Chờ BGĐ Duyệt (Cấp 2)",
            message: `Đề xuất ngân sách chuyến công tác "${target.title}" của ${target.creator} (${target.department}) đã qua Cấp 1, chờ Ban Giám Đốc / CFO duyệt Cấp 2.`,
            type: "INFO",
            targetUser: "Ban Giám Đốc", // ✅ CHỈ gửi cho Ban Giám Đốc
            link: "/business-trip",
          });
        } else {
          broadcastNotification({
            title: "🎉 Ngân Sách Đã Phê Duyệt Hoàn Tất (Cấp 2)",
            message: `Ngân sách chuyến công tác "${target.title}" của bạn đã được Ban Giám Đốc / CFO phê duyệt 2 Cấp chính thức. Kế toán sẽ thực hiện chi tạm ứng/thanh toán.`,
            type: "SUCCESS",
            targetUser: target.creator, // ✅ CHỈ gửi cho người tạo
            link: "/business-trip",
          });

          broadcastNotification({
            title: "💵 Giải Ngân / Tạm Ứng Ngân Sách Công Tác",
            message: `Chuyến công tác "${target.title}" của ${target.creator} đã được duyệt ngân sách 2 cấp. Kế toán tiến hành chi nạp/tạm ứng.`,
            type: "INFO",
            targetUser: "Kế Toán", // ✅ CHỈ gửi cho Kế Toán
            link: "/business-trip",
          });
        }
      }
    } catch (err) {
      showToast("❌ Lỗi mạng hoặc máy chủ, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectBudget = async (id: string, reason: string) => {
    const target = records.find((r) => r.id === id);
    const currentVersion = target?.version || 1;

    try {
      setIsLoading(true);
      const res = await fetch("/api/business-trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          actionLevel: "REJECT_BUDGET",
          budgetRejectionReason: reason || "Chưa phù hợp định mức chi tiêu",
          version: currentVersion,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(`❌ Lỗi từ chối ngân sách: ${data.message || data.error || "Lỗi kết nối D1"}`);
        return;
      }

      await fetchD1Records();
      if (activeBudgetTrip && activeBudgetTrip.id === id) {
        setActiveBudgetTrip({
          ...activeBudgetTrip,
          budgetStatus: "budget_rejected",
          budgetRejectionReason: reason,
        });
      }

      showToast("❌ Đã từ chối phê duyệt ngân sách công tác!");

      if (target) {
        broadcastNotification({
          title: "❌ Đề Xuất Ngân Sách Bị Từ Chối",
          message: `Đề xuất ngân sách công tác "${target.title}" của bạn đã bị từ chối. Lý do: ${reason || "Chưa phù hợp định mức chi tiêu"}.`,
          type: "WARNING",
          targetUser: target.creator, // ✅ CHỈ gửi cho người tạo
          link: "/business-trip",
        });
      }
    } catch (err) {
      showToast("❌ Lỗi mạng hoặc máy chủ, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Form State: Proposal Info
  const [proposalForm, setProposalForm] = useState({
    title: "",
    region: "VP Chuỗi (R&D)",
    factory: "VP Chuỗi (R&D)",
    creator: "Ban Quản Lý",
    department: "Hành chính",
    location: "VP Chuỗi (R&D)",
    transport: "",
    startDate: "2026-08-15",
    daysCount: 1,
    endDate: "2026-08-15",
    purpose: "",
    address: "",
    proposalText: "",
    estimatedCost: 0,
  });

  // Form State: Participants List
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "p_1",
      fullName: "",
      position: "",
      employeeId: "",
      department: "",
      phone: "",
      pickupLocation: "",
    },
  ]);

  // Submitted Records List (synced with D1)
  const [records, setRecords] = useState<BusinessTripRecord[]>([]);

  // List Search & 5 Filter Inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Business Trips from Cloudflare D1 Database on Mount & Tab Change
  const fetchD1Records = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/business-trips");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        const d1Records: BusinessTripRecord[] = result.data.map((item: any) => {
          let parsedAttachments: TripAttachment[] = [];
          if (item.attachments_json) {
            try { parsedAttachments = JSON.parse(item.attachments_json); } catch(e) {}
          }
          let parsedInvoices: TripInvoice[] = [];
          if (item.invoices_json) {
            try { parsedInvoices = JSON.parse(item.invoices_json); } catch(e) {}
          }

          let rawStatus = item.status || "PENDING";
          if (rawStatus === "pending_department_head") rawStatus = "PENDING";
          if (rawStatus === "pending_executive_board") rawStatus = "PENDING_L2";
          if (rawStatus === "approved" || rawStatus === "APPROVED") {
            if (item.approved_level === "L1" || item.approved_level === "department_head") {
              rawStatus = "PENDING_L2";
            } else {
              rawStatus = "APPROVED";
            }
          }
          if (typeof rawStatus === "string" && rawStatus.toLowerCase().includes("rejected")) rawStatus = "REJECTED";

          return {
            id: item.id || `rec_${Date.now()}`,
            code: item.code || `CT-2026-${Math.floor(100 + Math.random() * 900)}`,
            title: item.title || "Đề xuất công tác",
            region: item.region || "VP Chuỗi (R&D)",
            factory: item.factory || "",
            creator: item.creator || "Ban Quản Lý",
            creator_emp_code: item.creator_emp_code || item.creatorEmpCode || "",
            department: item.department || "Hành chính",
            location: item.location || "Bình Dương",
            startDate: item.start_date || item.startDate || "15/08/2026",
            endDate: item.end_date || item.endDate || "15/08/2026",
            daysCount: item.days_count || item.daysCount || 1,
            transport: item.transport || "Xe công ty",
            participantsCount: item.participants_count || item.participantsCount || 1,
            purpose: item.purpose || "",
            address: item.address || "",
            proposalText: item.proposal_text || item.proposalText || "",
            attachmentsJson: item.attachments_json || "[]",
            attachments: parsedAttachments,
            invoicesJson: item.invoices_json || "[]",
            invoices: parsedInvoices,
            participantsJson: item.participants_json || item.participantsJson || "[]",
            status: rawStatus as TripStatus,
            estimatedCost: Number(item.estimated_cost || 0),
            version: Number(item.version || 1),
            approvedLevel: item.approved_level,
            rejectedLevel: item.rejected_level,
            rejectionReason: item.rejection_reason,
            budgetStatus: item.budget_status || "pending_dept_budget",
            budgetAmount: Number(item.budget_amount || 0),
            budgetRejectionReason: item.budget_rejection_reason,
            createdAt: item.created_at || new Date().toLocaleString("vi-VN"),
          };
        });
        setRecords(d1Records);
      }
    } catch (err) {
      console.warn("D1 Database fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchD1Records();
  }, []);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setRegionFilter("ALL");
    setLocationFilter("ALL");
    setStatusFilter("ALL");
    setStartDateFilter("");
  };

  // Add a participant row
  const handleAddParticipant = () => {
    const newP: Participant = {
      id: `p_${Date.now()}`,
      fullName: "",
      position: "",
      employeeId: "",
      department: "",
      phone: "",
      pickupLocation: "",
    };
    setParticipants([...participants, newP]);
  };

  // Remove participant row
  const handleRemoveParticipant = (id: string) => {
    if (participants.length <= 1) {
      alert("Cần có ít nhất 01 người tham gia chuyến công tác!");
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
  };

  // Update participant field
  const handleUpdateParticipant = (id: string, field: keyof Participant, val: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Handle Attachment Upload (Images & PDFs) for Proposal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        const newAtt: TripAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl,
          createdAt: new Date().toLocaleTimeString("vi-VN"),
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Handle Invoice File Upload in Invoice Modal
  const handleInvoiceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setNewInvoiceForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: file.type,
        fileUrl: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save new invoice for active trip
  const handleSaveInvoice = async (tripId: string) => {
    if (!newInvoiceForm.title.trim()) {
      alert("Vui lòng nhập tên hóa đơn/chứng từ!");
      return;
    }
    const parsedAmount = parseFloat(newInvoiceForm.amount.replace(/[^0-9]/g, "")) || 0;
    if (parsedAmount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }

    const newInv: TripInvoice = {
      id: `inv_${Date.now()}`,
      title: newInvoiceForm.title.trim(),
      category: newInvoiceForm.category,
      amount: parsedAmount,
      invoiceDate: newInvoiceForm.invoiceDate,
      invoiceNumber: newInvoiceForm.invoiceNumber.trim(),
      fileName: newInvoiceForm.fileName,
      fileType: newInvoiceForm.fileType,
      fileUrl: newInvoiceForm.fileUrl,
      notes: newInvoiceForm.notes.trim(),
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    // Update Local State
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === tripId) {
          const currentInvoices = r.invoices ? [...r.invoices, newInv] : [newInv];
          return {
            ...r,
            invoices: currentInvoices,
            invoicesJson: JSON.stringify(currentInvoices),
          };
        }
        return r;
      })
    );

    // Update active modal trip state if open
    if (activeInvoiceTrip && activeInvoiceTrip.id === tripId) {
      const currentInvoices = activeInvoiceTrip.invoices ? [...activeInvoiceTrip.invoices, newInv] : [newInv];
      setActiveInvoiceTrip({
        ...activeInvoiceTrip,
        invoices: currentInvoices,
        invoicesJson: JSON.stringify(currentInvoices),
      });
    }

    // Persist to Cloudflare D1 Database
    try {
      await fetch("/api/business-trips/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, invoice: newInv }),
      });
      showToast("Đã lưu & đồng bộ hóa đơn chứng từ thành công vào D1!");
    } catch (e) {
      showToast("Đã lưu hóa đơn chứng từ vào ứng dụng!");
    }

    // Reset Invoice Input Form
    setNewInvoiceForm({
      title: "",
      category: "Vé máy bay / Tàu xe",
      amount: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      notes: "",
      fileName: "",
      fileType: "",
      fileUrl: "",
    });
    // ✅ FIX #3: Clear selectedTripIdForImport when closing modal
    if (globalImportModal) {
      setGlobalImportModal(false);
      setSelectedTripIdForImport("");
    }
  };

  // Delete an invoice from trip
  const handleDeleteInvoice = async (tripId: string, invoiceId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?")) return;

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === tripId) {
          const filtered = (r.invoices || []).filter((inv) => inv.id !== invoiceId);
          return {
            ...r,
            invoices: filtered,
            invoicesJson: JSON.stringify(filtered),
          };
        }
        return r;
      })
    );

    if (activeInvoiceTrip && activeInvoiceTrip.id === tripId) {
      const filtered = (activeInvoiceTrip.invoices || []).filter((inv) => inv.id !== invoiceId);
      setActiveInvoiceTrip({
        ...activeInvoiceTrip,
        invoices: filtered,
        invoicesJson: JSON.stringify(filtered),
      });
    }

    const targetTrip = records.find((r) => r.id === tripId);
    if (targetTrip) {
      const updatedInvoices = (targetTrip.invoices || []).filter((inv) => inv.id !== invoiceId);
      try {
        await fetch("/api/business-trips", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: tripId, invoices_json: JSON.stringify(updatedInvoices) }),
        });
        showToast("Đã xóa hóa đơn chứng từ!");
      } catch (e) {}
    }
  };

  // Calculate End Date when Start Date or Days Count changes
  const handleDaysChange = (days: number) => {
    const d = Math.max(1, days);
    setProposalForm((prev) => {
      const start = new Date(prev.startDate);
      if (!isNaN(start.getTime())) {
        start.setDate(start.getDate() + (d - 1));
        const endStr = start.toISOString().split("T")[0];
        return { ...prev, daysCount: d, endDate: endStr };
      }
      return { ...prev, daysCount: d };
    });
  };

  // Submit Business Trip Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation for all required fields
    if (!proposalForm.title || !proposalForm.title.trim()) {
      showToast("⚠️ Tên đề xuất công tác là bắt buộc!");
      return;
    }
    if (!proposalForm.region || !proposalForm.region.trim()) {
      showToast("⚠️ Khu vực là bắt buộc!");
      return;
    }
    if (!proposalForm.factory || !proposalForm.factory.trim()) {
      showToast("⚠️ Nhà máy là bắt buộc!");
      return;
    }
    if (!proposalForm.location || !proposalForm.location.trim()) {
      showToast("⚠️ Công tác tại là bắt buộc!");
      return;
    }
    if (!proposalForm.transport || !proposalForm.transport.trim()) {
      showToast("⚠️ Hình thức di chuyển là bắt buộc!");
      return;
    }
    if (!proposalForm.purpose || !proposalForm.purpose.trim()) {
      showToast("⚠️ Mục đích công tác là bắt buộc!");
      return;
    }

    const startFmt = proposalForm.startDate.split("-").reverse().join("/");
    const endFmt = proposalForm.endDate.split("-").reverse().join("/");
    const costVal = Number(proposalForm.estimatedCost || 0);

    const newRecord: BusinessTripRecord = {
      id: `rec_${Date.now()}`,
      code: `CT-2026-0${records.length + 20}`,
      title: proposalForm.title,
      region: proposalForm.region,
      factory: proposalForm.factory,
      creator: proposalForm.creator,
      department: proposalForm.department,
      location: proposalForm.location,
      startDate: startFmt,
      endDate: endFmt,
      daysCount: proposalForm.daysCount,
      transport: proposalForm.transport || "Xe công ty",
      participantsCount: participants.length,
      purpose: proposalForm.purpose,
      address: proposalForm.address,
      proposalText: proposalForm.proposalText,
      attachmentsJson: JSON.stringify(attachments),
      attachments,
      invoicesJson: JSON.stringify([]),
      invoices: [],
      participantsJson: JSON.stringify(participants),
      status: "PENDING",
      estimatedCost: costVal,
      version: 1,
      budgetStatus: "pending_dept_budget",
      createdAt: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
    };

    try {
      setIsLoading(true);
      const res = await fetch("/api/business-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRecord,
          startDate: startFmt,
          endDate: endFmt,
          daysCount: proposalForm.daysCount,
          participantsCount: participants.length,
          attachments,
          participants,
          estimatedCost: costVal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(`❌ Lỗi tạo đề xuất D1: ${data.message || data.error || "Không thể kết nối D1"}`);
        return;
      }

      await fetchD1Records();
      showToast("Đã lưu & gửi đề xuất công tác thành công vào D1 Database!");

      // Broadcast Notifications to Approver & Creator
      broadcastNotification({
        title: "✈️ Đề Xuất Công Tác Mới",
        message: `Cán bộ ${newRecord.creator} (${newRecord.department}) vừa đăng ký đi công tác "${newRecord.title}" tại ${newRecord.location} (${newRecord.startDate} - ${newRecord.endDate}). Chờ duyệt Cấp 1!`,
        type: "INFO",
        targetUser: "Trưởng Phòng",
        link: "/business-trip",
      });

      broadcastNotification({
        title: "⏳ Đã Gửi Đề Xuất Công Tác",
        message: `Đề xuất công tác "${newRecord.title}" của bạn đã gửi tới Trưởng phòng duyệt Cấp 1.`,
        type: "SUCCESS",
        targetUser: newRecord.creator,
        link: "/business-trip",
      });

      // Reset Form
      setAttachments([]);
      setProposalForm({
        title: "",
        region: "VP Chuỗi (R&D)",
        factory: "VP Chuỗi (R&D)",
        creator: currentUser.name || "Ban Quản Lý",
        department: currentUser.department || "Hành chính",
        location: "VP Chuỗi (R&D)",
        transport: "",
        startDate: new Date().toISOString().split("T")[0],
        daysCount: 1,
        endDate: new Date().toISOString().split("T")[0],
        purpose: "",
        address: "",
        proposalText: "",
        estimatedCost: 0,
      });

      setActiveTab("LIST");
    } catch (err) {
      showToast("❌ Lỗi kết nối máy chủ D1, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchSearch =
      !searchQuery.trim() ||
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.creator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRegion = regionFilter === "ALL" || rec.region === regionFilter;
    const matchLocation = locationFilter === "ALL" || rec.location.includes(locationFilter);
    const matchStatus =
      statusFilter === "ALL" ||
      rec.status === statusFilter ||
      (statusFilter === "PENDING" && rec.status === "PENDING_L2");
    const matchStartDate = !startDateFilter || rec.startDate.includes(startDateFilter.split("-").reverse().join("/"));

    return matchSearch && matchRegion && matchLocation && matchStatus && matchStartDate;
  });

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 flex flex-col justify-between font-sans">
      {/* ════════════════════════════════════════════════════════════════
          TOP EXECUTIVE HEADER BAR
         ════════════════════════════════════════════════════════════════ */}
      <header className="px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between sticky top-0 z-40">
        {/* Left: Brand Lockup */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <NavLink href="/work" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/images/tbs-logo.png"
              alt="TBS Group Logo"
              className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </NavLink>
          <span className="hidden md:inline-block px-2.5 py-1 rounded-full bg-[#e6f4ed] text-[#006838] text-xs font-bold border border-emerald-100 truncate">
            Phòng Nhân Sự Hành Chánh
          </span>
        </div>

        {/* Right Header Options */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-bold flex items-center gap-1 hover:bg-slate-200 transition-colors">
            <span>VN</span>
            <IconChevronDown size={12} />
          </button>
          <button className="p-1.5 sm:p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors relative">
            <IconBell size={16} />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border border-white" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            <UserAvatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
              showOnlineBadge={true}
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">{formatTitleWithDepartment(currentUser.title, currentUser.department)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          PAGE HERO SPINE & TITLE
         ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 min-w-0">
        {/* Back Link & Title Header (Flex Responsive - No Absolute Overlap on Mobile) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <NavLink
            href="/work"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-emerald-50 hover:text-[#006838] transition-colors shadow-2xs"
          >
            <IconArrowLeft size={16} />
            <span>Trở về Tổng quan</span>
          </NavLink>

          <div className="text-center sm:text-right">
            <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
              ĐĂNG KÝ ĐI CÔNG TÁC
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Vui lòng cung cấp đầy đủ thông tin để hoàn tất đăng ký công tác
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TOP NAVIGATION TABS (Nhập liệu vs Xem dữ liệu)
           ════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-start border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("FORM")}
            className={`px-5 py-2.5 rounded-t-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === "FORM"
                ? "bg-white text-[#006838] border-[#006838] shadow-2xs"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            <IconEdit size={18} />
            <span>📝 Nhập liệu</span>
          </button>

          <button
            onClick={() => setActiveTab("LIST")}
            className={`px-5 py-2.5 rounded-t-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === "LIST"
                ? "bg-white text-[#006838] border-[#006838] shadow-2xs"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            <IconChecklist size={18} />
            <span>📋 Xem dữ liệu</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006838] text-[11px] font-extrabold">
              {records.length}
            </span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB 1: FORM NHẬP LIỆU ĐĂNG KÝ CÔNG TÁC
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "FORM" && (
          <form onSubmit={handleSubmitForm} className="space-y-6 animate-in fade-in duration-200">
            {/* 📋 SECTION 1: THÔNG TIN ĐỀ XUẤT CÔNG TÁC */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#e6f4ed] text-[#006838] flex items-center justify-center border border-emerald-100">
                  <IconFileText size={18} />
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                  📋 THÔNG TIN ĐỀ XUẤT CÔNG TÁC
                </h2>
              </div>

              {/* Grid Inputs: Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Tên đề xuất */}
                <div className="lg:col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Tên đề xuất <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Nhập tên đề xuất công tác"
                      value={proposalForm.title}
                      onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-slate-50/50"
                    />
                    <IconFileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Khu vực */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Khu vực <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={proposalForm.region}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProposalForm({ ...proposalForm, region: val, factory: val, location: val });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white cursor-pointer"
                  >
                    {STANDARD_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>

                {/* Nhà máy */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nhà máy <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={proposalForm.factory}
                    onChange={(e) => setProposalForm({ ...proposalForm, factory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white cursor-pointer"
                  >
                    {STANDARD_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>

                {/* Người tạo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Người tạo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={proposalForm.creator}
                      readOnly
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none bg-slate-100 cursor-not-allowed text-slate-700"
                    />
                    <IconUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Tự động từ tài khoản hiện tại</p>
                </div>

                {/* Phòng Ban */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Phòng Ban <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={proposalForm.department}
                      readOnly
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none bg-slate-100 cursor-not-allowed text-slate-700"
                    />
                    <IconBuilding size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Tự động từ tài khoản hiện tại</p>
                </div>
              </div>

              {/* Grid Inputs: Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Công tác tại */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Công tác tại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={proposalForm.location}
                      onChange={(e) => setProposalForm({ ...proposalForm, location: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white cursor-pointer"
                    >
                      {STANDARD_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <IconMapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Hình thức di chuyển */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Hình thức di chuyển <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={proposalForm.transport}
                      onChange={(e) => setProposalForm({ ...proposalForm, transport: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white cursor-pointer"
                    >
                      <option value="">-- Chọn hình thức --</option>
                      <option value="Xe công ty">🚘 Xe công ty (Xe đưa đón)</option>
                      <option value="Máy bay">✈️ Máy bay</option>
                      <option value="Tàu hỏa">🚆 Tàu hỏa</option>
                      <option value="Xe khách">🚌 Xe khách chất lượng cao</option>
                      <option value="Phương tiện cá nhân">🛵 Phương tiện cá nhân</option>
                    </select>
                    <IconCar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Ngày bắt đầu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Ngày bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={proposalForm.startDate}
                      onChange={(e) => {
                        setProposalForm({ ...proposalForm, startDate: e.target.value });
                        handleDaysChange(proposalForm.daysCount);
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white cursor-pointer"
                    />
                    <IconCalendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Số ngày */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Số ngày</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={proposalForm.daysCount}
                      onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white"
                    />
                    <IconCalendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Ngày kết thúc */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Ngày kết thúc</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={proposalForm.endDate}
                      onChange={(e) => setProposalForm({ ...proposalForm, endDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white cursor-pointer"
                    />
                    <IconCalendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Grid Inputs: Row 2 (Cost) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chi phí dự toán (VNĐ) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Chi phí dự toán (VNĐ)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={500000}
                      placeholder="0"
                      value={proposalForm.estimatedCost || ""}
                      onChange={(e) => setProposalForm({ ...proposalForm, estimatedCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white"
                    />
                    <IconCash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Grid Inputs: Row 3 (Text areas & Attachments) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Mục đích công tác */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Mục đích công tác <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nhập mục đích công tác chi tiết..."
                    value={proposalForm.purpose}
                    onChange={(e) => setProposalForm({ ...proposalForm, purpose: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white resize-none"
                  />
                </div>

                {/* Địa chỉ công tác */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Địa chỉ công tác</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập địa chỉ công tác chi tiết nếu có..."
                    value={proposalForm.address}
                    onChange={(e) => setProposalForm({ ...proposalForm, address: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white resize-none"
                  />
                </div>

                {/* Đề xuất phụ cấp/hỗ trợ & Import file/ảnh */}
                <div className="space-y-1.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Đề xuất phụ cấp / hỗ trợ
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-[#006838] hover:text-[#00522c] font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors"
                    >
                      <IconPaperclip size={13} />
                      <span>+ Đính kèm File/Ảnh/PDF</span>
                    </button>
                  </div>

                  <textarea
                    rows={attachments.length > 0 ? 2 : 4}
                    placeholder="Ghi chú nội dung đề xuất phụ cấp/hỗ trợ chi phí đi lại, ăn ở, công tác phí (nếu có)..."
                    value={proposalForm.proposalText}
                    onChange={(e) => setProposalForm({ ...proposalForm, proposalText: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-white resize-none"
                  />

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Attachments List Badge */}
                  {attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Tệp đính kèm ({attachments.length}):
                      </span>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                        {attachments.map((att) => {
                          const isImage = att.type.startsWith("image/");
                          const isPdf = att.type.includes("pdf");
                          return (
                            <div
                              key={att.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs group hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                            >
                              {isImage ? (
                                <div
                                  onClick={() => setPreviewModal({ url: att.dataUrl, title: att.name, type: att.type })}
                                  className="cursor-pointer flex items-center gap-1"
                                  title="Bấm để xem ảnh"
                                >
                                  <img
                                    src={att.dataUrl}
                                    alt={att.name}
                                    className="w-4 h-4 rounded object-cover border border-slate-300"
                                  />
                                  <span className="font-semibold text-slate-800 max-w-[110px] truncate text-[11px]">
                                    {att.name}
                                  </span>
                                </div>
                              ) : isPdf ? (
                                <div
                                  onClick={() => setPreviewModal({ url: att.dataUrl, title: att.name, type: att.type })}
                                  className="cursor-pointer flex items-center gap-1 text-rose-600 font-bold"
                                  title="Bấm để xem PDF"
                                >
                                  <IconFileTypePdf size={14} />
                                  <span className="font-semibold text-slate-800 max-w-[110px] truncate text-[11px]">
                                    {att.name}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-slate-600">
                                  <IconFileText size={14} />
                                  <span className="font-semibold text-slate-800 max-w-[110px] truncate text-[11px]">
                                    {att.name}
                                  </span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                                title="Xóa tệp"
                              >
                                <IconX size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 👥 SECTION 2: THÔNG TIN NGƯỜI THAM GIA */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006838] flex items-center justify-center border border-emerald-200">
                    <IconUser size={18} />
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                    👥 THÔNG TIN NGƯỜI THAM GIA
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Tổng cộng: <span className="text-[#006838] font-black">{participants.length} người</span>
                </span>
              </div>

              {/* Dynamic Participants Table List */}
              <div className="space-y-3">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 items-end"
                  >
                    {/* Họ tên */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        Họ tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập họ tên"
                        value={p.fullName}
                        onChange={(e) => handleUpdateParticipant(p.id, "fullName", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                      />
                    </div>

                    {/* Chức vụ */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        Chức vụ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập chức vụ"
                        value={p.position}
                        onChange={(e) => handleUpdateParticipant(p.id, "position", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                      />
                    </div>

                    {/* MSNV */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        MSNV <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập MSNV"
                        value={p.employeeId}
                        onChange={(e) => handleUpdateParticipant(p.id, "employeeId", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                      />
                    </div>

                    {/* Phòng Ban */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        Phòng Ban <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={p.department}
                        onChange={(e) => handleUpdateParticipant(p.id, "department", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                      >
                        <option value="">-- Chọn phòng ban --</option>
                        {departmentsList.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Điện thoại */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        Điện thoại <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập số điện thoại"
                        value={p.phone}
                        onChange={(e) => handleUpdateParticipant(p.id, "phone", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                      />
                    </div>

                    {/* Địa điểm đón */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        Địa điểm đón <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập địa điểm đón"
                        value={p.pickupLocation}
                        onChange={(e) => handleUpdateParticipant(p.id, "pickupLocation", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                      />
                    </div>

                    {/* Delete Row Button */}
                    <div className="flex justify-center pb-0.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(p.id)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-200"
                        title="Xóa người tham gia"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddParticipant}
                className="px-4 py-2 rounded-xl border border-emerald-300 text-[#006838] bg-emerald-50/50 hover:bg-emerald-100 text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <IconPlus size={16} />
                <span>Thêm người tham gia</span>
              </button>
            </div>

            {/* 🚀 FORM ACTION FOOTER BUTTONS */}
            <div className="pt-2 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <NavLink
                  href="/work"
                  className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  ✕ Hủy bỏ
                </NavLink>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-[#006838] text-white text-xs font-extrabold hover:bg-[#00522c] transition-colors shadow-md shadow-emerald-900/20 flex items-center gap-2 cursor-pointer"
                >
                  <IconSend size={16} />
                  <span>🚀 Gửi đề xuất công tác</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <span>🛡️</span>
                <span>Thông tin đề xuất & tệp đính kèm được bảo mật và đồng bộ thời gian thực trên Cloudflare D1.</span>
              </div>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: DANH SÁCH DỮ LIỆU ĐĂNG KÝ CÔNG TÁC
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "LIST" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 5-Filter Bar with Import Invoices Button */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-end gap-3 text-xs">
              {/* 1. Tìm kiếm */}
              <div className="flex-1 min-w-[180px] space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Tìm kiếm</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập từ khóa mã đơn, tên đề xuất, người tạo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 font-medium outline-none focus:border-[#006838] bg-slate-50/50"
                  />
                  <IconSearch size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* 2. Lọc theo khu vực */}
              <div className="w-full sm:w-44 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Lọc theo khu vực</label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="Kiên Giang 1">Kiên Giang 1</option>
                  <option value="Kiên Giang 2">Kiên Giang 2</option>
                  <option value="Kiên Giang 3">Kiên Giang 3</option>
                  <option value="Hoàn Thiện Đế">Hoàn Thiện Đế</option>
                  <option value="Nhà Máy Miền Đông">Nhà Máy Miền Đông</option>
                  <option value="VP Chuỗi (R&D)">VP Chuỗi (R&D)</option>
                </select>
              </div>

              {/* 3. Lọc theo Công tác tại */}
              <div className="w-full sm:w-48 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Lọc theo Công tác tại</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  {STANDARD_LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Lọc theo Trạng thái */}
              <div className="w-full sm:w-40 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Lọc theo Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="PENDING">Chờ xét duyệt</option>
                  <option value="APPROVED">Được duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </div>

              {/* 5. Lọc theo ngày bắt đầu */}
              <div className="w-full sm:w-40 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Lọc theo ngày bắt đầu</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                />
              </div>

              {/* Action Buttons: Xóa lọc & Báo cáo (Chuẩn giao diện ban đầu) */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-extrabold transition-colors cursor-pointer shadow-2xs"
                >
                  Xóa lọc
                </button>

                <button
                  onClick={() => showToast("Đã xuất báo cáo lịch công tác & hóa đơn chi phí thành công (File Excel/CSV)!")}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <IconDownload size={14} />
                  <span>Báo cáo</span>
                </button>
              </div>
            </div>

            {/* Records Data Table (12 Headers with Dedicated IMPORT HÓA ĐƠN Column) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#242b35] border-b border-slate-700 text-white text-xs font-bold uppercase tracking-wider">
                      <th className="p-3 text-center w-12">STT</th>
                      <th className="p-3">Khu vực</th>
                      <th className="p-3">Tên đề xuất</th>
                      <th className="p-3">Người tạo</th>
                      <th className="p-3">Công tác tại</th>
                      <th className="p-3">Ngày bắt đầu</th>
                      <th className="p-3 text-center">Số ngày</th>
                      <th className="p-3">Ngày kết thúc</th>
                      <th className="p-3 text-center">Duyệt Lịch (2 Cấp)</th>
                      <th className="p-3 text-center">Duyệt Ngân Sách (2 Cấp)</th>
                      <th className="p-3">Hình thức di chuyển</th>
                      <th className="p-3 text-center">Import Hóa Đơn</th>
                      <th className="p-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-12 text-center text-slate-400 font-semibold">
                          Không có dữ liệu phù hợp
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec, idx) => {
                        const invoiceCount = rec.invoices?.length || 0;
                        const attachmentCount = rec.attachments?.length || 0;

                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/90 transition-colors border-b border-slate-100">
                            <td className="p-3 text-center font-extrabold text-slate-500">{idx + 1}</td>
                            <td className="p-3 font-semibold text-slate-700">{rec.region || "VP Chuỗi (R&D)"}</td>
                            <td className="p-3">
                              <div className="font-extrabold text-slate-900 line-clamp-1">{rec.title}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-[#006838] font-bold">{rec.code}</span>
                                {attachmentCount > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium flex items-center gap-0.5 border border-slate-200" title={`${attachmentCount} tệp đính kèm đề xuất`}>
                                    <IconPaperclip size={10} />
                                    <span>{attachmentCount} file</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{rec.creator}</div>
                              <div className="text-[10px] text-slate-500">{rec.department}</div>
                            </td>
                            <td className="p-3 font-medium text-slate-700">{rec.location}</td>
                            <td className="p-3 font-bold text-slate-800">{rec.startDate}</td>
                            <td className="p-3 text-center font-bold text-slate-900">{rec.daysCount}</td>
                            <td className="p-3 font-bold text-slate-800">{rec.endDate}</td>

                            {/* Cột DUYỆT LỊCH (2 CẤP THUẦN TÚY KHÔNG LIÊN QUAN CHI PHÍ) */}
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                {rec.status === "APPROVED" && (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-extrabold uppercase flex items-center gap-1 border border-emerald-300">
                                    <span>✓</span> Đã duyệt Lịch
                                  </span>
                                )}
                                {rec.status === "PENDING" && (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase flex items-center gap-1 border border-amber-300">
                                    <span>⏳</span> Chờ TP duyệt Lịch
                                  </span>
                                )}
                                {rec.status === "PENDING_L2" && (
                                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase flex items-center gap-1 border border-blue-300">
                                    <span>⏳</span> Chờ BGĐ duyệt Lịch
                                  </span>
                                )}
                                {rec.status === "REJECTED" && (
                                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase flex items-center gap-1 border border-rose-300">
                                    <span>✕</span> Đã từ chối Lịch
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Cột DUYỆT NGÂN SÁCH (2 CẤP ĐỘC LẬP) */}
                            <td className="p-3 text-center">
                              {((rec.invoices || []).reduce((sum, inv) => sum + Number(inv.amount), 0) + Number(rec.estimatedCost || 0)) === 0 ? (
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                                  Không phát sinh
                                </span>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  {(!rec.budgetStatus || rec.budgetStatus === "pending_dept_budget") && (
                                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase border border-amber-200 flex items-center gap-1">
                                      <span>🟡</span> Chờ TP Ngân Sách
                                    </span>
                                  )}
                                  {rec.budgetStatus === "pending_exec_budget" && (
                                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[10px] font-extrabold uppercase border border-blue-200 flex items-center gap-1">
                                      <span>🔵</span> Chờ BGĐ/CFO Duyệt
                                    </span>
                                  )}
                                  {rec.budgetStatus === "budget_approved" && (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-extrabold uppercase border border-emerald-300 flex items-center gap-1">
                                      <span>✓</span> Ngân Sách Đã Duyệt
                                    </span>
                                  )}
                                  {rec.budgetStatus === "budget_rejected" && (
                                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase border border-rose-200 flex items-center gap-1">
                                      <span>✕</span> Ngân Sách Từ Chối
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setActiveBudgetTrip(rec)}
                                    className="mt-0.5 px-2.5 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-[10px] hover:bg-amber-600 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                    title="Mở Modal Duyệt Ngân Sách 2 Cấp"
                                  >
                                    <IconCash size={12} />
                                    <span>Duyệt Ngân Sách</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            <td className="p-3 font-semibold text-slate-700">{rec.transport}</td>

                            {/* Cột IMPORT HÓA ĐƠN */}
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setActiveInvoiceTrip(rec)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer border shadow-2xs ${
                                  invoiceCount > 0
                                    ? "bg-emerald-50 text-[#006838] border-emerald-300 hover:bg-[#006838] hover:text-white"
                                    : "bg-[#e6f4ed] text-[#006838] border-emerald-200 hover:bg-[#006838] hover:text-white"
                                }`}
                                title="Bấm để Import hóa đơn & chứng từ chi phí"
                              >
                                <IconReceipt size={14} />
                                <span>{invoiceCount > 0 ? `🧾 ${invoiceCount} HĐ` : "📥 Import HĐ"}</span>
                              </button>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {/* Detail Modal View */}
                                <button
                                  onClick={() => setSelectedModalRecord(rec)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#006838] hover:text-white transition-colors cursor-pointer"
                                  title="Xem chi tiết đơn công tác"
                                >
                                  <IconEye size={15} />
                                </button>

                                {/* Level 1 Approval Actions */}
                                {rec.status === "PENDING" && (
                                  <Can permission={PERMISSIONS.TRIP_APPROVE_LEVEL1}>
                                    {canApproveTripLevel1(currentUser, rec, isExecutiveOrAdmin) && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleApproveTrip(rec.id, "department_head")}
                                          className="px-2 py-1 rounded-lg bg-emerald-50 text-[#006838] hover:bg-[#006838] hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-emerald-200"
                                          title="Duyệt cấp 1"
                                        >
                                          Duyệt TP
                                        </button>
                                        <button
                                          onClick={() => handleOpenRejectModal(rec.id, "department_head")}
                                          className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-rose-200"
                                        >
                                          Từ chối
                                        </button>
                                      </div>
                                    )}
                                  </Can>
                                )}

                                {/* Level 2 Approval Actions */}
                                {(rec.status === "PENDING_L2" || (rec.status === "PENDING" && isExecutiveOrAdmin)) && (
                                  <Can permission={PERMISSIONS.TRIP_APPROVE_LEVEL2}>
                                    {canApproveTripLevel2(currentUser, rec, isExecutiveOrAdmin) && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleApproveTrip(rec.id, "executive_board")}
                                          className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-blue-200"
                                        >
                                          Duyệt BGĐ
                                        </button>
                                        <button
                                          onClick={() => handleOpenRejectModal(rec.id, "executive_board")}
                                          className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-rose-200"
                                        >
                                          Từ chối
                                        </button>
                                      </div>
                                    )}
                                  </Can>
                                )}

                                {/* Level 1 Approval Actions - Trưởng Phòng & Cấp cao hơn */}
                                {rec.status === "PENDING" && (
                                  <Can permission={PERMISSIONS.TRIP_APPROVE_LEVEL1}>
                                    {(isExecutiveOrAdmin || (currentUser?.roleCode === "TRUONG_PHONG" && currentUser?.department?.trim().toLowerCase() === rec.department?.trim().toLowerCase())) && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleApproveTrip(rec.id, "department_head")}
                                          className="px-2 py-1 rounded-lg bg-emerald-50 text-[#006838] hover:bg-[#006838] hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-emerald-200"
                                          title={`Duyệt cấp 1 (Trưởng Phòng) - Đơn của ${rec.department}`}
                                        >
                                          Duyệt TP
                                        </button>
                                        <button
                                          onClick={() => handleOpenRejectModal(rec.id, "department_head")}
                                          className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-rose-200"
                                        >
                                          Từ chối
                                        </button>
                                      </div>
                                    )}
                                  </Can>
                                )}

                                {/* Level 2 Approval Actions (TGĐ / Ban Giám Đốc) */}
                                {(rec.status === "PENDING_L2" || (rec.status === "PENDING" && isExecutiveOrAdmin)) && (
                                  <Can permission={PERMISSIONS.TRIP_APPROVE_LEVEL2}>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleApproveTrip(rec.id, "executive_board")}
                                        className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-blue-200"
                                      >
                                        Duyệt BGĐ
                                      </button>
                                      <button
                                        onClick={() => handleOpenRejectModal(rec.id, "executive_board")}
                                        className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-extrabold text-[10px] transition-colors cursor-pointer border border-rose-200"
                                      >
                                        Từ chối
                                      </button>
                                    </div>
                                  </Can>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL 0: PHÊ DUYỆT NGÂN SÁCH CÔNG TÁC (QUY TRÌNH 2 CẤP ĐỘC LẬP)
           ════════════════════════════════════════════════════════════════ */}
        {activeBudgetTrip && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold backdrop-blur-xs">
                    <IconCash size={22} className="text-amber-200" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Phê Duyệt Ngân Sách Công Tác (2 Cấp)</h3>
                    <p className="text-xs text-amber-100 font-medium">Duyệt dự toán / chi phí công tác độc lập với Lịch trình</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveBudgetTrip(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs text-slate-800">
                {/* Trip Summary Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 text-sm">{activeBudgetTrip.title}</span>
                    <span className="font-mono text-xs font-bold text-[#006838] bg-white px-2 py-0.5 rounded-md border border-slate-200">{activeBudgetTrip.code}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1 border-t border-amber-200/50">
                    <div><span className="font-bold">Người tạo:</span> {activeBudgetTrip.creator} ({activeBudgetTrip.department})</div>
                    <div><span className="font-bold">Địa điểm:</span> {activeBudgetTrip.location}</div>
                    <div><span className="font-bold">Thời gian:</span> {activeBudgetTrip.startDate} - {activeBudgetTrip.endDate}</div>
                    <div><span className="font-bold">Số người:</span> {activeBudgetTrip.participantsCount} cán bộ</div>
                  </div>
                </div>

                {/* Calculated Budget Total */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Tổng Ngân Sách / Chi Phí Đề Xuất</span>
                    <span className="text-2xl font-black text-amber-400">
                      {((activeBudgetTrip.invoices || []).reduce((sum, inv) => sum + Number(inv.amount), 0) || activeBudgetTrip.estimatedCost || 0).toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>{activeBudgetTrip.invoices?.length || 0} hóa đơn đính kèm</div>
                    <div className="text-emerald-400 font-semibold">✓ Đã đồng bộ D1</div>
                  </div>
                </div>

                {/* 2-Level Budget Approval Gate Progress */}
                <div className="space-y-3">
                  <label className="font-extrabold text-slate-900 text-xs block uppercase">
                    Tiến Trình Duyệt Ngân Sách 2 Cấp:
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Step 1 */}
                    <div className={`p-3 rounded-2xl border ${
                      activeBudgetTrip.budgetStatus === "pending_exec_budget" || activeBudgetTrip.budgetStatus === "budget_approved"
                        ? "bg-emerald-50 border-emerald-300 text-[#006838]"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      <div className="font-extrabold text-xs">Cấp 1: TP Ngân Sách</div>
                      <div className="text-[11px] mt-0.5">
                        {activeBudgetTrip.budgetStatus === "pending_exec_budget" || activeBudgetTrip.budgetStatus === "budget_approved"
                          ? "✓ Đã phê duyệt Cấp 1"
                          : "⏳ Chờ TP Ngân sách duyệt"}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`p-3 rounded-2xl border ${
                      activeBudgetTrip.budgetStatus === "budget_approved"
                        ? "bg-emerald-50 border-emerald-300 text-[#006838]"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}>
                      <div className="font-extrabold text-xs">Cấp 2: Ban Giám Đốc / CFO</div>
                      <div className="text-[11px] mt-0.5">
                        {activeBudgetTrip.budgetStatus === "budget_approved"
                          ? "✓ Đã duyệt 2 Cấp hoàn tất"
                          : activeBudgetTrip.budgetStatus === "pending_exec_budget"
                          ? "⏳ Chờ BGĐ/CFO duyệt Cấp 2"
                          : "⏸ Chưa chuyển Cấp 2"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection notice if rejected */}
                {activeBudgetTrip.budgetStatus === "budget_rejected" && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    <span className="font-bold">❌ Ngân sách đã bị từ chối:</span> {activeBudgetTrip.budgetRejectionReason || "Không đạt định mức chi tiêu"}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveBudgetTrip(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Đóng
                </button>

                <div className="flex items-center gap-2">
                  {/* Reject Button */}
                  {activeBudgetTrip.budgetStatus !== "budget_approved" && (
                    <button
                      onClick={() => {
                        const reason = prompt("Nhập lý do từ chối ngân sách công tác:");
                        if (reason !== null) {
                          handleRejectBudget(activeBudgetTrip.id, reason);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white text-xs font-bold transition cursor-pointer border border-rose-200"
                    >
                      ✕ Từ Chối Ngân Sách
                    </button>
                  )}

                  {/* Level 1 Approval Button */}
                  {(!activeBudgetTrip.budgetStatus || activeBudgetTrip.budgetStatus === "pending_dept_budget") && (
                    <button
                      onClick={() => handleApproveBudget(activeBudgetTrip.id, "dept_budget")}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <IconCheck size={16} />
                      <span>Duyệt Ngân Sách Cấp 1</span>
                    </button>
                  )}

                  {/* Level 2 Approval Button */}
                  {activeBudgetTrip.budgetStatus === "pending_exec_budget" && (
                    <button
                      onClick={() => handleApproveBudget(activeBudgetTrip.id, "exec_budget")}
                      className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <IconCheck size={16} />
                      <span>🎉 Duyệt Ngân Sách Cấp 2 (Final)</span>
                    </button>
                  )}

                  {/* Approved state notification */}
                  {activeBudgetTrip.budgetStatus === "budget_approved" && (
                    <span className="px-4 py-2 rounded-xl bg-emerald-100 text-[#006838] text-xs font-extrabold flex items-center gap-1">
                      <span>✓</span> Ngân Sách Đã Duyệt 2 Cấp
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL 1: QUẢN LÝ & IMPORT HÓA ĐƠN CHỨNG TỪ (INVOICES MODAL)
           ════════════════════════════════════════════════════════════════ */}
        {activeInvoiceTrip && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-[#006838] to-slate-900 text-white flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded text-emerald-100 font-bold">
                      {activeInvoiceTrip.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-200">
                      {activeInvoiceTrip.location} ({activeInvoiceTrip.startDate} - {activeInvoiceTrip.endDate})
                    </span>
                  </div>
                  <h3 className="text-base font-black tracking-tight mt-1">
                    🧾 HÓA ĐƠN &amp; CHỨNG TỪ CHI PHÍ CÔNG TÁC
                  </h3>
                </div>
                <button
                  onClick={() => setActiveInvoiceTrip(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* Total Summary */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-600 font-semibold block">Tổng số hóa đơn đã đính kèm:</span>
                    <span className="text-lg font-black text-[#006838]">
                      {activeInvoiceTrip.invoices?.length || 0} chứng từ
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 font-semibold block">Tổng chi phí quyết toán:</span>
                    <span className="text-lg font-black text-slate-900">
                      {(activeInvoiceTrip.invoices || [])
                        .reduce((sum, inv) => sum + (inv.amount || 0), 0)
                        .toLocaleString("vi-VN")}{" "}
                      VND
                    </span>
                  </div>
                </div>

                {/* Existing Invoices List */}
                <div className="space-y-2.5">
                  <h4 className="font-black text-slate-800 uppercase tracking-tight text-xs flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Danh sách chứng từ đã tải lên</span>
                  </h4>

                  {!activeInvoiceTrip.invoices || activeInvoiceTrip.invoices.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400">
                      Chưa có hóa đơn hoặc chứng từ nào được đính kèm cho chuyến công tác này.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeInvoiceTrip.invoices.map((inv, iIndex) => (
                        <div
                          key={inv.id}
                          className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006838] flex items-center justify-center flex-shrink-0">
                              {inv.fileType?.includes("pdf") ? (
                                <IconFileTypePdf size={20} className="text-rose-600" />
                              ) : (
                                <IconReceipt size={20} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 truncate">{inv.title}</div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                                  {inv.category}
                                </span>
                                <span>•</span>
                                <span>Ngày: {inv.invoiceDate}</span>
                                {inv.invoiceNumber && (
                                  <>
                                    <span>•</span>
                                    <span>Số HĐ: {inv.invoiceNumber}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="font-black text-slate-900 text-sm">
                                {inv.amount.toLocaleString("vi-VN")} VND
                              </div>
                              <div className="text-[10px] text-emerald-600 font-semibold">Đã xác nhận</div>
                            </div>

                            <div className="flex items-center gap-1">
                              {inv.fileUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewModal({
                                      url: inv.fileUrl || "",
                                      title: inv.title,
                                      type: inv.fileType || "image/png",
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#006838] hover:text-white transition-colors cursor-pointer"
                                  title="Xem chứng từ đính kèm"
                                >
                                  <IconEye size={15} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteInvoice(activeInvoiceTrip.id, inv.id)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-200"
                                title="Xóa hóa đơn"
                              >
                                <IconTrash size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form to add a new invoice */}
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3.5">
                  <h4 className="font-black text-slate-800 uppercase tracking-tight text-xs flex items-center gap-1.5">
                    <span>➕</span>
                    <span>Thêm Hóa Đơn / Chứng Từ Mới</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Tên chứng từ / Hóa đơn <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Vé máy bay Vietnam Airlines..."
                        value={newInvoiceForm.title}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-[#006838] bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Loại chi phí</label>
                      <select
                        value={newInvoiceForm.category}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                      >
                        <option value="Vé máy bay / Tàu xe">✈️ Vé máy bay / Tàu xe</option>
                        <option value="Khách sạn / Lưu trú">🏨 Khách sạn / Lưu trú</option>
                        <option value="Ăn uống / Tiếp khách">🍽️ Ăn uống / Tiếp khách</option>
                        <option value="Xăng xe / Cầu đường">⛽ Xăng xe / Cầu đường</option>
                        <option value="Chi phí khác">📦 Chi phí khác</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Số tiền (VNĐ) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Ví dụ: 1500000"
                        value={newInvoiceForm.amount}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Ngày hóa đơn</label>
                      <input
                        type="date"
                        value={newInvoiceForm.invoiceDate}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceDate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* File Upload for Invoice */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Tệp đính kèm (Ảnh hóa đơn / File PDF)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => invoiceFileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <IconUpload size={15} />
                        <span>Chọn ảnh / PDF hóa đơn</span>
                      </button>

                      {newInvoiceForm.fileName && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#006838]">
                          {newInvoiceForm.fileType?.includes("pdf") ? (
                            <IconFileTypePdf size={16} className="text-rose-600" />
                          ) : (
                            <IconPhoto size={16} />
                          )}
                          <span className="max-w-[200px] truncate">{newInvoiceForm.fileName}</span>
                          <button
                            type="button"
                            onClick={() => setNewInvoiceForm({ ...newInvoiceForm, fileName: "", fileType: "", fileUrl: "" })}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      )}

                      <input
                        ref={invoiceFileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleInvoiceFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveInvoice(activeInvoiceTrip.id)}
                      className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <IconCheck size={16} />
                      <span>Lưu &amp; Đồng bộ Hóa đơn</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setActiveInvoiceTrip(null)}
                  className="px-5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL 2: IMPORT HÓA ĐƠN TOÀN CỤC (GLOBAL IMPORT MODAL)
           ════════════════════════════════════════════════════════════════ */}
        {globalImportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-r from-[#006838] to-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black tracking-tight">📥 IMPORT HÓA ĐƠN CHỨNG TỪ CÔNG TÁC</h3>
                  <p className="text-xs text-emerald-200 mt-0.5">Chọn chuyến công tác để tải lên chứng từ</p>
                </div>
                <button
                  onClick={() => {
                    setGlobalImportModal(false);
                    setSelectedTripIdForImport("");
                  }}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Chọn chuyến công tác <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedTripIdForImport}
                    onChange={(e) => setSelectedTripIdForImport(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                  >
                    {records.map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.code}] {r.title} - {r.creator} ({r.location}, {r.startDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Tên hóa đơn / chứng từ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Hóa đơn phòng khách sạn..."
                      value={newInvoiceForm.title}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold outline-none focus:border-[#006838] bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Loại chi phí</label>
                    <select
                      value={newInvoiceForm.category}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                    >
                      <option value="Vé máy bay / Tàu xe">✈️ Vé máy bay / Tàu xe</option>
                      <option value="Khách sạn / Lưu trú">🏨 Khách sạn / Lưu trú</option>
                      <option value="Ăn uống / Tiếp khách">🍽️ Ăn uống / Tiếp khách</option>
                      <option value="Xăng xe / Cầu đường">⛽ Xăng xe / Cầu đường</option>
                      <option value="Chi phí khác">📦 Chi phí khác</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Số tiền (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Ví dụ: 850000"
                      value={newInvoiceForm.amount}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Ngày hóa đơn</label>
                    <input
                      type="date"
                      value={newInvoiceForm.invoiceDate}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold outline-none focus:border-[#006838] bg-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Upload File */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-700 block">File đính kèm (Ảnh / PDF)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => invoiceFileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <IconUpload size={15} />
                      <span>Chọn file</span>
                    </button>
                    {newInvoiceForm.fileName && (
                      <span className="text-emerald-700 font-bold">{newInvoiceForm.fileName}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalImportModal(false);
                      setSelectedTripIdForImport("");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveInvoice(selectedTripIdForImport)}
                    className="px-5 py-2 rounded-xl bg-[#006838] text-white font-extrabold hover:bg-[#00522c] cursor-pointer shadow-md"
                  >
                    Lưu hóa đơn
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL 3: PREVIEW FILE MODAL (IMAGES & PDFS)
           ════════════════════════════════════════════════════════════════ */}
        {previewModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
                <h4 className="text-xs sm:text-sm font-black truncate max-w-md flex items-center gap-2">
                  <span>👁️</span>
                  <span>{previewModal.title}</span>
                </h4>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100 min-h-[300px]">
                {previewModal.type.startsWith("image/") ? (
                  <img
                    src={previewModal.url}
                    alt={previewModal.title}
                    className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-md"
                  />
                ) : previewModal.type.includes("pdf") ? (
                  <iframe
                    src={previewModal.url}
                    title={previewModal.title}
                    className="w-full h-[70vh] rounded-xl border border-slate-300"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-600 space-y-2">
                    <IconFileText size={48} className="mx-auto text-slate-400" />
                    <p className="font-bold">{previewModal.title}</p>
                    <a
                      href={previewModal.url}
                      download={previewModal.title}
                      className="inline-block px-4 py-2 rounded-xl bg-[#006838] text-white font-bold text-xs"
                    >
                      Tải về tệp
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🔴 REJECTION REASON MODAL POPUP */}
        {rejectionTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Từ chối đơn công tác ({rejectionTarget.level === "department_head" ? "Trưởng phòng" : "Ban Giám Đốc"})</span>
                </h3>
                <button
                  onClick={() => setRejectionTarget(null)}
                  className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>
              <div className="p-5 space-y-3 text-xs">
                <label className="font-bold text-slate-700 block">
                  Vui lòng nhập lý do từ chối <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Ví dụ: Lịch trình chưa hợp lý / Thiếu hồ sơ đính kèm..."
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium outline-none focus:border-rose-500 bg-slate-50"
                />
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectionTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODAL POPUP: CHI TIẾT ĐỀ XUẤT ĐĂNG KÝ CÔNG TÁC
           ════════════════════════════════════════════════════════════════ */}
        {selectedModalRecord && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-[#006838] to-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-emerald-200 font-bold block uppercase">
                    {selectedModalRecord.code}
                  </span>
                  <h3 className="text-base font-black tracking-tight">{selectedModalRecord.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedModalRecord(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-slate-500 font-semibold block">Người tạo đề xuất:</span>
                    <span className="text-slate-900 font-extrabold text-sm block mt-0.5">
                      {selectedModalRecord.creator} ({selectedModalRecord.department})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Khu vực / Nhà máy:</span>
                    <span className="text-slate-900 font-extrabold text-sm block mt-0.5">
                      {selectedModalRecord.region} {selectedModalRecord.factory ? `- ${selectedModalRecord.factory}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Địa điểm công tác:</span>
                    <span className="text-slate-900 font-extrabold text-sm block mt-0.5">
                      {selectedModalRecord.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Thời gian &amp; Phương tiện:</span>
                    <span className="text-slate-900 font-extrabold text-sm block mt-0.5">
                      {selectedModalRecord.startDate} - {selectedModalRecord.endDate} ({selectedModalRecord.daysCount} ngày) | {selectedModalRecord.transport}
                    </span>
                  </div>
                </div>

                {selectedModalRecord.purpose && (
                  <div className="space-y-1 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="font-extrabold text-[#006838] block uppercase text-[11px]">🎯 Mục đích công tác:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">{selectedModalRecord.purpose}</p>
                  </div>
                )}

                {/* Proposal Text & Attachments */}
                {selectedModalRecord.proposalText && (
                  <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-extrabold text-slate-800 block uppercase text-[11px]">📝 Đề xuất phụ cấp / hỗ trợ:</span>
                    <p className="text-slate-800 leading-relaxed font-medium">{selectedModalRecord.proposalText}</p>
                  </div>
                )}

                {/* Attachments */}
                {selectedModalRecord.attachments && selectedModalRecord.attachments.length > 0 && (
                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-extrabold text-slate-800 block uppercase text-[11px]">
                      📎 Tệp đính kèm ({selectedModalRecord.attachments.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedModalRecord.attachments.map((att) => (
                        <button
                          key={att.id}
                          type="button"
                          onClick={() => setPreviewModal({ url: att.dataUrl, title: att.name, type: att.type })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#006838] transition-colors cursor-pointer text-xs font-bold text-slate-800"
                        >
                          {att.type.includes("pdf") ? (
                            <IconFileTypePdf size={16} className="text-rose-600" />
                          ) : (
                            <IconPhoto size={16} className="text-[#006838]" />
                          )}
                          <span className="max-w-[150px] truncate">{att.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoices List */}
                {selectedModalRecord.invoices && selectedModalRecord.invoices.length > 0 && (
                  <div className="space-y-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                    <span className="font-extrabold text-[#006838] block uppercase text-[11px]">
                      🧾 Hóa đơn chứng từ đã hoàn ứng ({selectedModalRecord.invoices.length}):
                    </span>
                    <div className="space-y-1.5">
                      {selectedModalRecord.invoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{inv.title}</span>
                            <span className="text-slate-500 text-[10px] ml-2">({inv.category})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{inv.amount.toLocaleString("vi-VN")} VND</span>
                            {inv.fileUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewModal({ url: inv.fileUrl || "", title: inv.title, type: inv.fileType || "image/png" })}
                                className="p-1 rounded bg-slate-100 hover:bg-[#006838] hover:text-white transition-colors cursor-pointer"
                              >
                                <IconEye size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold">Trạng thái phê duyệt D1:</span>
                  <div>
                    {selectedModalRecord.status === "APPROVED" && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#006838] text-xs font-black uppercase">
                        ✓ Đã phê duyệt
                      </span>
                    )}
                    {selectedModalRecord.status === "PENDING" && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase">
                        ⏳ Chờ phê duyệt
                      </span>
                    )}
                    {selectedModalRecord.status === "REJECTED" && (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase">
                        ✕ Từ chối
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const rec = selectedModalRecord;
                    setSelectedModalRecord(null);
                    setActiveInvoiceTrip(rec);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-[#006838] hover:text-white text-[#006838] font-bold text-xs transition-colors border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <IconReceipt size={15} />
                  <span>Quản lý Hóa Đơn</span>
                </button>

                <button
                  onClick={() => setSelectedModalRecord(null)}
                  className="px-5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <IconCheck size={16} />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-3 px-6 border-t border-slate-200 text-xs text-slate-500 text-center bg-white">
        <span>© 2026 TBS Group System - Tổ hợp Kiên Giang. Tất cả các quyền được bảo lưu.</span>
      </footer>
    </div>
  );
}
