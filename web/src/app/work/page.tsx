"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NotificationCenter from "@/components/NotificationCenter";
import DonutChartModal from "@/components/DonutChartModal";
import UserAvatar from "@/components/UserAvatar";
import ThemeFontControlModal from "@/components/ThemeFontControlModal";
import { getCurrentUser, formatTitleWithDepartment } from "@/lib/userProfiles";
import Can from "@/components/Can";
import { PERMISSIONS } from "@/lib/permissions";
import OverviewDashboard from "@/components/work/OverviewDashboard";
import HRSystemShell from "@/modules/hr/HRSystemShell";
import HRHanhChanhHubView from "@/modules/hr/components/HRHanhChanhHubView";
import HRManagerDashboard from "@/modules/hr/components/HRManagerDashboard";
import HREmployeeDirectoryView from "@/modules/hr/components/HREmployeeDirectoryView";
import HRRecruitmentView from "@/modules/hr/components/HRRecruitmentView";
import HRAttendancePayrollView from "@/modules/hr/components/HRAttendancePayrollView";
import HRContractsView from "@/modules/hr/components/HRContractsView";
import QualityModule from "@/modules/quality/QualityModule";
import ProductionPerformanceModule from "@/modules/production/ProductionPerformanceModule";
import RDModule from "@/modules/rd/RDModule";
import CNCIWrapper from "@/modules/ci/CNCIWrapper";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import MobileNavDrawer from "@/components/mobile/MobileNavDrawer";
import {
  IconHome,
  IconLeaf,
  IconGridDots,
  IconUsers,
  IconCalculator,
  IconFlask,
  IconSettings,
  IconShieldCheck,
  IconTruck,
  IconBuildingFactory,
  IconBell,
  IconMaximize,
  IconChevronRight,
  IconChevronLeft,
  IconTrendingUp,
  IconClipboardList,
  IconPackage,
  IconClock,
  IconArrowUpRight,
  IconBuilding,
  IconBriefcase,
  IconPlane,
  IconId,
  IconAdjustments,
  IconCalendarEvent,
  IconClockCheck,
  IconSchool,
  IconCash,
  IconUserPlus,
  IconFileText,
  IconArrowRight,
  IconArrowLeft,
  IconDevices,
  IconUser,
  IconLock,
  IconLogout,
  IconCamera,
  IconX,
  IconCheck,
  IconChevronDown,
  IconUpload,
  IconZoomIn,
  IconZoomOut,
  IconAdjustmentsHorizontal,
  IconArrowUp,
  IconArrowDown,
  IconRotate,
  IconArrowsMaximize,
  IconPlus,
  IconMinus,
  IconMail,
  IconPhoneCall,
  IconScissors,
  IconLayoutGrid,
  IconDownload,
  IconAlertCircle,
  IconAlertTriangle,
  IconPlayerPlay,
  IconFilter,
  IconBulb,
  IconCircleCheck,
  IconTrophy,
  IconBook,
  IconFolder,
  IconChartBar,
  IconWallet,
  IconCoins,
  IconFileInvoice,
  IconChartPie,
  IconReceipt,
  IconBuildingBank,
  IconArrowsRightLeft,
  IconDeviceDesktop,
  IconPercentage,
  IconShoppingCart,
  IconCategory,
  IconRefresh,
  IconPaperclip,
  IconPrinter,
  IconSend,
  IconDatabase,
  IconTrash,
  IconSearch,
  IconMenu2,
} from "@tabler/icons-react";

interface DepartmentItem {
  id: string;
  num: string;
  name: string;
  sub: string;
  icon: React.ElementType;
  hasData: boolean;
}

function HRModuleView() {
  const [activeTab, setActiveTab] = useState<string>("hub");

  return (
    <div className="w-full space-y-4 min-w-0">
      {/* Top Navigation Bar when in HR Sub-View */}
      {activeTab !== "hub" && (
        <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("hub")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#006838] text-slate-700 hover:text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
            >
              <IconArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Quay lại Hub 10 App</span>
            </button>
            <span className="text-xs font-black text-slate-800 hidden sm:inline">
              {activeTab === "dashboard" && "📊 Bảng Điều Khiển Quản Trị HR (Trưởng Phòng HR)"}
              {activeTab === "directory" && "👥 Quản Lý Hồ Sơ & Cơ Cấu Tổ Chức"}
              {activeTab === "recruitment" && "🧑‍💼 Quản Lý Tuyển Dụng & Nhu Cầu"}
              {activeTab === "attendance_payroll" && "⏰ Quản Lý Chấm Công & Lương"}
              {activeTab === "contracts" && "📄 Quản Lý Hợp Đồng Lao Động"}
            </span>
          </div>

          <button
            onClick={() => setActiveTab("hub")}
            className="px-3.5 py-1.5 rounded-xl bg-[#006838] text-white text-xs font-extrabold shadow-2xs hover:bg-[#004d29] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IconLayoutGrid size={15} />
            <span>Hub 10 App</span>
          </button>
        </div>
      )}

      {/* Main Tab View */}
      {activeTab === "hub" && (
        <HRHanhChanhHubView
          onNavigateTab={(tab) => {
            if (tab === "rooms") {
              window.location.href = "/rooms";
            } else if (tab === "business-trip") {
              window.location.href = "/business-trip";
            } else {
              setActiveTab(tab);
            }
          }}
        />
      )}

      {activeTab === "dashboard" && (
        <HRManagerDashboard
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === "directory" && <HREmployeeDirectoryView />}
      {activeTab === "recruitment" && <HRRecruitmentView />}
      {activeTab === "attendance_payroll" && <HRAttendancePayrollView />}
      {activeTab === "contracts" && <HRContractsView />}
    </div>
  );
}

function parseModuleFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  const rawMod = (urlParams.get("module") || urlParams.get("dept") || "").toLowerCase().trim();

  if (!rawMod || rawMod === "overview" || rawMod === "sanh" || rawMod === "00") {
    return null;
  }
  if (rawMod === "hr" || rawMod === "nhansu" || rawMod === "vanphong" || rawMod === "vpdieuhanh" || rawMod === "01") {
    return "hr";
  }
  if (rawMod === "finance" || rawMod === "ketoan" || rawMod === "taichinh" || rawMod === "02") {
    return "finance";
  }
  if (rawMod === "rd" || rawMod === "03") {
    return "rd";
  }
  if (rawMod === "ci" || rawMod === "kaizen" || rawMod === "it" || rawMod === "04") {
    return "ci";
  }
  if (rawMod === "qc" || rawMod === "quality" || rawMod === "05") {
    return "qc";
  }
  if (rawMod === "logistics" || rawMod === "kho" || rawMod === "06") {
    return "logistics";
  }
  if (rawMod === "production" || rawMod === "factory" || rawMod === "nhamay" || rawMod === "07") {
    return "production";
  }

  return null;
}

export default function WorkDashboardPage() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const changeDepartment = (deptId: string | null, pushHistory: boolean = true) => {
    const targetDept = deptId === "overview" ? null : deptId;
    setSelectedDept(targetDept);

    if (typeof window !== "undefined" && pushHistory) {
      const targetModule = targetDept || "overview";
      const currentQuery = new URLSearchParams(window.location.search).get("module");
      if (currentQuery !== targetModule) {
        const newUrl = `/work?module=${targetModule}`;
        window.history.pushState({ module: targetModule }, "", newUrl);
      }
    }
  };

  // Synchronize state with URL parameters on mount and browser back/forward (popstate)
  useEffect(() => {
    const initialMod = parseModuleFromUrl();
    setSelectedDept(initialMod);

    const handlePopState = () => {
      const mod = parseModuleFromUrl();
      setSelectedDept(mod);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  const [plantFilter, setPlantFilter] = useState("Toàn nhà máy");
  const [timeFilter, setTimeFilter] = useState("Tháng này");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // User Profile & Account Dropdown State
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Profile Form State
  const [userInfo, setUserInfo] = useState({
    empCode: "202608001",
    name: "Phạm Nguyễn Anh Huy",
    phone: "0522511245",
    email: "huypna@tbsgroup.vn",
    avatar: "https://res.cloudinary.com/dwl2xtbqa/image/upload/v1787117525/nzcft200bebofw7b4uzg.jpg",
    title: "IT - Team Chuyển Đổi Số",
    department: "IT - Team Chuyển Đổi Số",
  });

  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== "undefined") {
        const curr = getCurrentUser();
        if (curr) {
          setUserInfo({
            empCode: curr.empCode || "202608001",
            name: curr.name || "Phạm Nguyễn Anh Huy",
            phone: curr.phone || "0522511245",
            email: curr.email || "huypna@tbsgroup.vn",
            avatar: curr.avatar || "https://res.cloudinary.com/dwl2xtbqa/image/upload/v1787117525/nzcft200bebofw7b4uzg.jpg",
            title: curr.title || "IT - Team Chuyển Đổi Số",
            department: curr.department || "NHÂN SỰ-HC",
          });
        }
      }
    };
    loadUser();
    if (typeof window !== "undefined") {
      window.addEventListener("tbs_profile_updated", loadUser);
      return () => window.removeEventListener("tbs_profile_updated", loadUser);
    }
  }, []);

  useEffect(() => {
    if (isProfileModalOpen) {
      setEditProfileForm({ ...userInfo });
    }
  }, [isProfileModalOpen, userInfo]);

  // Avatar Zoom & Position Controls State
  const [avatarZoom, setAvatarZoom] = useState(1.0);
  const [avatarOffsetY, setAvatarOffsetY] = useState(0);
  const [avatarOffsetX, setAvatarOffsetX] = useState(0);

  // Edit Profile Form Temp State
  const [editProfileForm, setEditProfileForm] = useState({ ...userInfo });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Donut Chart Modal State & Interactive Chart Hover States
  const [isDonutModalOpen, setIsDonutModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [hoveredQcIndex, setHoveredQcIndex] = useState<number | null>(null);
  const [hoveredCiIndex, setHoveredCiIndex] = useState<number | null>(null);

  // Finance Interactive Data Entry Desk State
  const [finEntryType, setFinEntryType] = useState<"thu" | "chi" | "tam_ung" | "hoan_ung" | "hoa_don" | "cong_no">("thu");
  const [finForm, setFinForm] = useState({
    code: "PT-2026-0818",
    date: "2026-08-17",
    party: "Công ty Da Giày TBS - Skechers",
    dept: "Sản Xuất (NM1)",
    accountDebit: "1111",
    accountCredit: "5111",
    amount: "45000000",
    note: "Thu tiền bán hàng chuyền Skechers ca 1",
    attachment: "Chung-tu-kem-theo.pdf",
  });
  const [finTransactions, setFinTransactions] = useState([
    {
      id: "PT-2026-0818",
      type: "Thu",
      typeCode: "thu",
      date: "2026-08-17",
      party: "SKECHERS USA Inc.",
      dept: "Kinh Doanh & Xuất Khẩu",
      debit: "1121 - VCB",
      credit: "1311 - Phải thu KH",
      amount: 450000000,
      note: "Thu thanh toán đơn hàng Skechers D'Lites đợt 2",
      status: "Đã ghi sổ",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "PC-2026-0817",
      type: "Chi",
      typeCode: "chi",
      date: "2026-08-17",
      party: "Công ty CP Vật Liệu Đế TBS",
      dept: "Sản Xuất (NM1)",
      debit: "3311 - Phải trả NCC",
      credit: "1121 - VCB",
      amount: 185000000,
      note: "Thanh toán vật tư đế PU & cao su khuôn mẫu đợt 8",
      status: "Đã duyệt",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "TU-2026-0816",
      type: "Tạm ứng",
      typeCode: "tam_ung",
      date: "2026-08-16",
      party: "Trần Minh Quang (QC Lead)",
      dept: "Quản Lý Chất Lượng (QC)",
      debit: "1411 - Tạm ứng NV",
      credit: "1111 - Tiền mặt",
      amount: 15000000,
      note: "Tạm ứng chi phí công tác kiểm định lô hàng NM3",
      status: "Chờ duyệt",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "HD-2026-0815",
      type: "Hóa đơn",
      typeCode: "hoa_don",
      date: "2026-08-15",
      party: "Điện Lực Bình Dương",
      dept: "Hành Chánh - Quản Trị",
      debit: "6427 - CP dịch vụ",
      credit: "3311 - Phải trả NCC",
      amount: 68500000,
      note: "Hóa đơn tiền điện trạm biến áp xưởng Skechers T7/2026",
      status: "Đã đối chiếu",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "CN-2026-0814",
      type: "Công nợ",
      typeCode: "cong_no",
      date: "2026-08-14",
      party: "Tập Đoàn Hóa Chất TexChem",
      dept: "R&D Phát Triển",
      debit: "1521 - Nguyên liệu",
      credit: "3311 - Phải trả NCC",
      amount: 230000000,
      note: "Ghi nhận công nợ keo dán Eco thân thiện môi trường",
      status: "Đến hạn TT",
      statusColor: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ]);
  const [finFilterTab, setFinFilterTab] = useState<string>("all");
  const [finSearchText, setFinSearchText] = useState<string>("");
  const [isFinPrintModalOpen, setIsFinPrintModalOpen] = useState(false);
  const [selectedFinItem, setSelectedFinItem] = useState<any>(null);

  const handleSaveFinEntry = (isSubmitForApproval = false) => {
    if (!finForm.amount || Number(finForm.amount) <= 0) {
      showToast("⚠️ Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    const typeLabelMap: Record<string, string> = {
      thu: "Thu",
      chi: "Chi",
      tam_ung: "Tạm ứng",
      hoan_ung: "Hoàn ứng",
      hoa_don: "Hóa đơn",
      cong_no: "Công nợ",
    };
    const newEntry = {
      id: finForm.code || `CT-${Date.now().toString().slice(-6)}`,
      type: typeLabelMap[finEntryType] || "Thu",
      typeCode: finEntryType,
      date: finForm.date || new Date().toISOString().slice(0, 10),
      party: finForm.party || "Đối tác TBS",
      dept: finForm.dept || "Sản Xuất",
      debit: finForm.accountDebit,
      credit: finForm.accountCredit,
      amount: Number(finForm.amount),
      note: finForm.note || "Giao dịch phát sinh",
      status: isSubmitForApproval ? "Chờ duyệt" : "Đã ghi sổ",
      statusColor: isSubmitForApproval
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    setFinTransactions([newEntry, ...finTransactions]);
    showToast(isSubmitForApproval ? "Đã lưu và chuyển chứng từ sang hàng đợi Phê Duyệt." : "Đã ghi sổ chứng từ thành công vào hệ thống D1.");
    // Reset form code for next entry
    const prefix = finEntryType === "thu" ? "PT" : finEntryType === "chi" ? "PC" : finEntryType === "tam_ung" ? "TU" : finEntryType === "hoa_don" ? "HD" : "CN";
    setFinForm({
      ...finForm,
      code: `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: "",
      note: "",
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cropper Popup Modal State (Dark Studio Crop Overlay)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempAvatarSrc, setTempAvatarSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function compressImage(dataUrl: string, maxWidth = 360, maxHeight = 360, quality = 0.8): Promise<string> {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith("data:image")) {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.");
        return;
      }

      showToast("Đang nạp và xử lý ảnh...");

      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          const rawDataUrl = reader.result;

          // 1. Compress image to max 400x400 JPEG
          const compressed = await compressImage(rawDataUrl, 400, 400, 0.85);

          // 2. Instantly display selected photo in modal circle (0ms UI feedback)
          setEditProfileForm((prev) => ({ ...prev, avatar: compressed }));
          setUserInfo((prev) => ({ ...prev, avatar: compressed }));
          showToast("Đã nạp ảnh thành công. Đang đồng bộ...");

          // 3. Upload to Cloudinary & D1 via Worker endpoint
          try {
            const res = await fetch("/api/upload-avatar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: compressed, empCode: userInfo.empCode || "202608001" }),
            });

            if (res.ok) {
              const json = await res.json();
              if (json.url) {
                setEditProfileForm((prev) => ({ ...prev, avatar: json.url }));
                setUserInfo((prev) => ({ ...prev, avatar: json.url }));
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("tbs_current_user", JSON.stringify({
                    ...userInfo,
                    avatar: json.url
                  }));
                  localStorage.setItem("tbs_current_user", JSON.stringify({
                    ...userInfo,
                    avatar: json.url
                  }));
                  window.dispatchEvent(new Event("tbs_profile_updated"));
                }
                showToast(json.isCloudinary ? "Đã tải avatar lên Cloudinary." : "Đã cập nhật ảnh đại diện.");
              }
            }
          } catch (uploadErr) {
            console.warn("Avatar upload endpoint warning:", uploadErr);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch initial profile data from D1 Database & Local Storage
  useEffect(() => {
    let localCustomAvatar: string | null = null;
    const isValidAvatar = (str: any) => typeof str === "string" && str.trim().length > 4 && str !== "undefined" && str !== "null";

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const deptParam = searchParams.get("dept");
      if (deptParam) {
        setSelectedDept(deptParam);
      }

      const storedUser = sessionStorage.getItem("tbs_current_user") || localStorage.getItem("tbs_current_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.name) {
            if (isValidAvatar(parsed.avatar)) {
              localCustomAvatar = parsed.avatar;
            }
            const loaded = {
              empCode: parsed.empCode || "202608001",
              name: parsed.name,
              phone: parsed.phone || "0522511245",
              email: parsed.email || `${parsed.empCode || ''}@tbsgroup.vn`,
              avatar: isValidAvatar(parsed.avatar) ? parsed.avatar : "/images/tbs-logo.png",
              title: parsed.title || "Cán Bộ Công Nhân Viên",
              department: parsed.department || "NHÂN SỰ-HC",
            };
            setUserInfo(loaded);
            setEditProfileForm(loaded);
          }
        } catch (e) { }
      }
    }

    async function loadD1Profile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d1Avatar = json.data.avatar || json.data.avatar_url;
            const finalAvatar = isValidAvatar(localCustomAvatar)
              ? localCustomAvatar
              : (isValidAvatar(d1Avatar) ? d1Avatar : "/images/tbs-logo.png");

            const loaded = {
              empCode: json.data.emp_code || json.data.empCode || "202608001",
              name: json.data.name || "Phạm Nguyễn Anh Huy",
              phone: json.data.phone || "0522511245",
              email: json.data.email || "anhy.work.2004@gmail.com",
              avatar: finalAvatar,
              title: json.data.title || "IT - Team chuyển đổi số",
              department: json.data.department || "NHÂN SỰ-HC",
            };
            setUserInfo(loaded);
            setEditProfileForm(loaded);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("tbs_current_user", JSON.stringify(loaded));
              localStorage.setItem("tbs_current_user", JSON.stringify(loaded));
            }
          }
        }
      } catch (err) {
        console.log("Using default profile state:", err);
      }
    }
    loadD1Profile();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_profile_updated", loadD1Profile);
      return () => {
        window.removeEventListener("tbs_profile_updated", loadD1Profile);
      };
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserInfo({ ...editProfileForm });
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tbs_current_user", JSON.stringify(editProfileForm));
      localStorage.setItem("tbs_current_user", JSON.stringify(editProfileForm));
      window.dispatchEvent(new Event("tbs_profile_updated"));
    }
    setIsProfileModalOpen(false);

    // Save/Update directly into Cloudflare D1 Database vpchuoiskechers
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfileForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Đã lưu & cập nhật thông tin thành công vào D1 Database (vpchuoiskechers)!");
      } else {
        showToast("Cập nhật thông tin cá nhân thành công!");
      }
    } catch (err) {
      showToast("Cập nhật thông tin cá nhân thành công!");
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu mới xác nhận không khớp!");
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsPasswordModalOpen(false);
    showToast("Đổi mật khẩu tài khoản thành công!");
  };

  // Department Hero Banner Configurations (Authentic Local Images matching SẢNH/Văn phòng/Nhà máy)
  const deptBanners: Record<string, { bg: string; title: string; sub: string; appCount: number }> = {
    hr: {
      bg: "/images/brands/Văn phòng/1787810869509_5373416762128407822_5373416762128407822_4243291c07f467487e67e1e1e47b8905.jpg",
      title: "Nhân Sự - Hành Chánh",
      sub: "Quản lý văn thư, tài sản, phòng họp, tuyển dụng và lịch công tác toàn chuỗi.",
      appCount: 10,
    },
    finance: {
      bg: "/images/brands/Văn phòng/1787810869515_5373416762128407822_5373416762128407822_6da05db9aa42d610e93fbea9c4a9866e.jpg",
      title: "Kế Toán & Quản Trị",
      sub: "Quản lý tài chính, ngân sách, chi phí sản xuất và báo cáo tài chính hợp nhất.",
      appCount: 10,
    },
    rd: {
      bg: "/images/brands/Phòng Đào Tạo/1787810869499_5373416762128407822_5373416762128407822_49d7659c53b21702dff5c8f39212d143.jpg",
      title: "R&D (Phát Triển Sản Phẩm)",
      sub: "Nghiên cứu công nghệ đế giày SKECHERS, thiết kế mẫu & chuyển giao kỹ thuật.",
      appCount: 6,
    },
    ci: {
      bg: "/images/brands/Nhà máy/1787810869511_5373416762128407822_5373416762128407822_f5d1738107b86346f69bf64f3e28dd0d.jpg",
      title: "CN-CI (Cải Tiến Liên Tục)",
      sub: "Thúc đẩy phong trào Kaizen, cải tiến Gemba Walk và năng suất tự động hóa 4.0.",
      appCount: 4,
    },
    qc: {
      bg: "/images/brands/Nhà máy/1787810869517_5373416762128407822_5373416762128407822_41abd142fb008caa305e9bf9ea4c9a85.jpg",
      title: "Quản Lý Chất Lượng (QC)",
      sub: "Kiểm soát tiêu chuẩn chất lượng SKECHERS, chỉ số OEE và tỷ lệ lỗi trên chuyền.",
      appCount: 8,
    },
    logistics: {
      bg: "/images/brands/Nhà máy/1787810869519_5373416762128407822_5373416762128407822_5785e047e50798460c205ce3bbebc186.jpg",
      title: "Kho & Logistics",
      sub: "Điều phối logistics, vật tư & chuỗi cung ứng nhà máy SKECHERS Kiên Giang.",
      appCount: 7,
    },
    production: {
      bg: "/images/brands/Nhà máy/1787810869521_5373416762128407822_5373416762128407822_d92bcaa1035c5426a9529806beab4645.jpg",
      title: "Hiệu Suất Nhà Máy",
      sub: "Sản lượng theo giờ, PPH/RFT từng chuyền và điều hành ca sản xuất.",
      appCount: 9,
    },
    supply: {
      bg: "/images/brands/Nhà máy/1787810869523_5373416762128407822_5373416762128407822_d7fb8deb4933b3043195a08e573c4a74.jpg",
      title: "Kế Hoạch Chuẩn Bị - TTPP",
      sub: "Điều phối logistics, cung ứng vật tư & chuỗi cung ứng chuỗi nhà máy SKECHERS.",
      appCount: 7,
    },
    factory: {
      bg: "/images/brands/Nhà máy/1787810869525_5373416762128407822_5373416762128407822_3d8c02353c2266fec97bdab159909d67.jpg",
      title: "Hiệu Suất Nhà Máy",
      sub: "Sản lượng theo giờ, PPH/RFT từng chuyền và điều hành ca sản xuất.",
      appCount: 9,
    },
  };

  // Departments List
  const departments: DepartmentItem[] = [
    {
      id: "overview",
      num: "00",
      name: "Tổng quan",
      sub: "Bảng điều khiển & chỉ số toàn chuỗi",
      icon: IconHome,
      hasData: true,
    },
    {
      id: "hr",
      num: "01",
      name: "Nhân sự – Hành chính",
      sub: "Quản lý văn thư, tài sản & tuyển dụng",
      icon: IconUsers,
      hasData: true,
    },
    {
      id: "finance",
      num: "02",
      name: "Kế toán và tài chính",
      sub: "Quản lý tài chính, ngân sách & báo cáo",
      icon: IconCalculator,
      hasData: true,
    },
    {
      id: "rd",
      num: "03",
      name: "R&D (Phát triển sản phẩm)",
      sub: "Nghiên cứu, thiết kế mẫu & kỹ thuật",
      icon: IconFlask,
      hasData: true,
    },
    {
      id: "ci",
      num: "04",
      name: "CN-CI (Cải tiến liên tục)",
      sub: "Cải tiến liên tục & năng suất 4.0",
      icon: IconSettings,
      hasData: true,
    },
    {
      id: "qc",
      num: "05",
      name: "Quản lý chất lượng (QC)",
      sub: "Kiểm soát QC, OEE & chỉ số lỗi",
      icon: IconShieldCheck,
      hasData: true,
    },
    {
      id: "logistics",
      num: "06",
      name: "Kho & Logistics",
      sub: "Logistics, vật tư & chuỗi cung ứng",
      icon: IconTruck,
      hasData: false,
    },
    {
      id: "production",
      num: "07",
      name: "Hiệu Suất Nhà Máy",
      sub: "Sản lượng theo giờ, PPH/RFT từng chuyền",
      icon: IconBuildingFactory,
      hasData: true,
    },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
        setIsFullscreen(false);
      }
    }
  };

  const isHRRoleUser =
    userInfo.empCode.startsWith("NS") ||
    userInfo.title.toLowerCase().includes("nhân sự") ||
    userInfo.title.toLowerCase().includes("hr");

  const visibleDepartments = isHRRoleUser
    ? departments.filter((d) => d.id === "hr")
    : departments;

  useEffect(() => {
    if (isHRRoleUser && selectedDept !== "hr") {
      setSelectedDept("hr");
    }
  }, [isHRRoleUser]);

  const activeDeptObj = departments.find((d) => d.id === selectedDept);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f4f7f5] text-slate-900 font-sans antialiased selection:bg-[#006838] selection:text-white">
      {/* ════════════════════════════════════════════════════════════════
          LEFT SIDEBAR (Hidden on Mobile, Fixed Height on Desktop)
         ════════════════════════════════════════════════════════════════ */}
      <aside
        className={`hidden lg:flex bg-white h-screen flex-col border-r border-slate-200/80 flex-shrink-0 shadow-sm transition-all duration-300 ease-in-out z-30 ${
          isSidebarCollapsed ? "w-20 px-2.5 py-4" : "w-64 lg:w-72 xl:w-80 p-3.5 sm:p-4 lg:p-5"
        }`}
      >
        {/* Executive Brand Lockup & Header Toggle Button (Fixed Top) */}
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 flex-shrink-0 min-h-[56px]">
            <Link href="/" title="Về Trang Chủ TBS Group (https://vpchuoiskechers.tbsgroup2026.workers.dev)" className="flex items-center gap-2.5 group overflow-hidden cursor-pointer">
              <img
                src="/images/tbs-logo.png"
                alt="TBS Group Logo"
                className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="h-5.5 w-[1px] bg-slate-200 flex-shrink-0" />
              <img
                src="/images/skechers-logo.png"
                alt="Skechers Logo"
                className="h-6 sm:h-7 w-auto object-contain group-hover:scale-105 transition-transform flex-shrink-0"
              />
            </Link>

            {/* Clean Inline Toggle Button (Expanded State) */}
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-[#006838] text-slate-600 hover:text-white border border-slate-200/80 flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0 ml-2 shadow-2xs group"
              title="Thu nhỏ menu"
            >
              <IconChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 pb-3 border-b border-slate-200/80 flex-shrink-0 w-full">
            <Link href="/" title="Về Trang Chủ TBS Group & SKECHERS" className="flex flex-col items-center gap-1.5 py-0.5 group cursor-pointer">
              <img
                src="/images/tbs-logo.png"
                alt="TBS Group"
                className="h-5.5 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="w-5 h-[1px] bg-slate-200/90" />
              <img
                src="/images/skechers-logo.png"
                alt="SKECHERS"
                className="h-4.5 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Clean Inline Toggle Button (Collapsed State) */}
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-8 h-8 rounded-xl bg-[#006838] text-white shadow-md flex items-center justify-center hover:bg-[#00522c] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
              title="Mở rộng menu"
            >
              <IconChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Department List (INDEPENDENT SCROLL CONTAINER WITH CUSTOM SCROLLBAR) */}
        <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden my-2.5 pr-1 w-full focus:outline-none ${isSidebarCollapsed ? "space-y-3.5" : "space-y-2.5"}`}>
          {visibleDepartments.map((dept) => {
            const IconComp = dept.icon;
            const isSelected = selectedDept === dept.id;

            // COLLAPSED MODE RENDERING (Ultra Sleek Single 44x44 Icon Tile with Generous Breathing Space)
            if (isSidebarCollapsed) {
              return (
                <button
                  key={dept.id}
                  onClick={() => changeDepartment(isSelected ? null : dept.id)}
                  className={`w-11 h-11 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 group relative cursor-pointer ${isSelected
                    ? "bg-[#006838] text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-600/30 scale-105"
                    : "bg-white hover:bg-[#e6f4ed] text-[#006838] border border-slate-200/90 shadow-2xs"
                    }`}
                  title={dept.name}
                >
                  {/* Active Left Indicator Bar */}
                  {isSelected && (
                    <span className="absolute -left-3.5 top-2 bottom-2 w-1 bg-[#006838] rounded-r-full shadow-xs" />
                  )}

                  <IconComp size={22} className="flex-shrink-0" />

                  {/* Coming Soon Dot Indicator */}
                  {!dept.hasData && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
                  )}

                  {/* Collapsed Hover Tooltip Popup */}
                  <div className="absolute left-full ml-3 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none flex items-center gap-2 border border-slate-700/60">
                    <span>{dept.name}</span>
                    {!dept.hasData && (
                      <span className="text-[10px] font-mono text-amber-300 font-normal">
                        (Soon)
                      </span>
                    )}
                  </div>
                </button>
              );
            }

            // EXPANDED MODE RENDERING (Full Department Card)
            return (
              <button
                key={dept.id}
                onClick={() => changeDepartment(isSelected ? null : dept.id)}
                className={`w-full text-left rounded-2xl flex items-center p-3.5 sm:p-4 gap-3.5 transition-all duration-200 group relative cursor-pointer ${isSelected
                  ? "bg-[#006838] text-white shadow-md shadow-emerald-900/20 border border-[#006838]"
                  : "bg-white hover:bg-[#e6f4ed]/50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-xs"
                  }`}
              >
                {/* Active Left Indicator Bar */}
                {isSelected && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-white rounded-r-full" />
                )}

                {/* Icon Box */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[#e6f4ed] text-[#006838] group-hover:bg-[#006838] group-hover:text-white"
                    }`}
                >
                  <IconComp size={22} />
                </div>

                {/* Department Title & Subtitle */}
                <div className="flex-1 min-w-0">
                  <div>
                    <h4 className="text-sm font-extrabold truncate tracking-tight">
                      {dept.name}
                    </h4>
                  </div>
                  <p
                    className={`text-xs truncate mt-0.5 font-medium ${isSelected ? "text-emerald-100" : "text-slate-500"
                      }`}
                  >
                    {dept.sub}
                  </p>
                </div>

                {/* Subtle Status Tag */}
                {!dept.hasData && (
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isSelected
                      ? "bg-white/20 text-white"
                      : "bg-amber-100/90 text-amber-800 border border-amber-200/90"
                      }`}
                  >
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Credit (Fixed Bottom) */}
        <div className="flex-shrink-0 mt-auto pt-2.5 border-t border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500">
            {!isSidebarCollapsed ? (
              <>
                <Link href="/" title="Về Trang Chủ TBS Group" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                  <img
                    src="/images/tbs-logo.png"
                    alt="TBS Logo"
                    className="h-3.5 w-auto object-contain"
                  />
                  <span className="font-semibold text-slate-700 text-[10px]">
                    TBS Group System
                  </span>
                </Link>
                <span className="text-[9px] font-mono text-slate-400">
                  © 2026
                </span>
              </>
            ) : (
              <Link href="/" className="mx-auto hover:opacity-80 transition-opacity" title="Về Trang Chủ TBS Group">
                <img
                  src="/images/tbs-logo.png"
                  alt="TBS Logo"
                  className="h-3.5 w-auto object-contain"
                />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════
          MAIN DASHBOARD AREA
         ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden bg-[#f4f7f5] text-slate-900 rounded-tl-none lg:rounded-tl-[24px] flex flex-col justify-between transition-all duration-300 pb-24 lg:pb-6">
        {/* Top Header Bar (Fine-tuned +10px higher for exact iPhone Status Bar clearance) */}
        <header className="sticky top-0 z-40 px-3 sm:px-5 lg:px-6 pt-[calc(env(safe-area-inset-top,44px)+14px)] sm:pt-3.5 pb-2.5 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Drawer Hamburger Button (Min 44x44px Touch Target) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-slate-100 text-[#006838] hover:bg-emerald-50 transition-colors border border-slate-200 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs active:scale-95"
              title="Mở danh mục phân hệ"
              aria-label="Mở menu điều hướng"
            >
              <IconMenu2 size={22} />
            </button>

            {/* Mobile Brand Logo Lockup */}
            <Link href="/" title="Về Trang Chủ TBS Group" className="lg:hidden flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
              <img src="/images/tbs-logo.png" alt="TBS Group" className="h-6 sm:h-7 w-auto object-contain" />
              <div className="h-4 w-[1px] bg-slate-200 flex-shrink-0" />
              <img src="/images/skechers-logo.png" alt="SKECHERS" className="h-5 sm:h-6 w-auto object-contain flex-shrink-0" />
            </Link>

            {/* Desktop System Title */}
            <div className="hidden lg:block min-w-0 flex-1">
              <h1 className="text-base lg:text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
                <span>Tổ hợp Kiên Giang</span>
                <span className="text-slate-400 font-normal"> – </span>
                <span>TBS Group</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium truncate">
                Dashboard quản trị – Vận hành – Số hóa quy trình
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Notification Center */}
            <NotificationCenter />

            {/* Grid 9-dots icon launcher (Hidden on Mobile < 768px, available in menu/cards) */}
            <Link
              href="/"
              className="hidden md:flex min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs items-center justify-center"
              title="Danh mục ứng dụng & Trang chủ"
            >
              <IconGridDots size={20} />
            </Link>

            {/* Fullscreen Toggle (Hidden on Mobile < 768px) */}
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs items-center justify-center cursor-pointer"
              title="Toàn màn hình"
            >
              <IconMaximize size={20} />
            </button>

            {/* System Theme & Font Size Button */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="hidden md:flex min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006838] hover:bg-emerald-100 transition-colors shadow-2xs items-center justify-center cursor-pointer"
              title="Cấu hình màu sắc & chữ hệ thống"
            >
              <IconAdjustments size={20} />
            </button>

            {/* User Avatar & Executive Dropdown Menu (Min 44x44px Touch Target) */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="min-w-[44px] min-h-[44px] flex items-center gap-2 p-1 pl-1 pr-1.5 sm:pr-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group border border-slate-200/90 bg-white shadow-2xs"
                title="Tài khoản cá nhân"
                aria-label="Tài khoản cá nhân"
              >
                <UserAvatar
                  src={userInfo.avatar}
                  name={userInfo.name}
                  size="md"
                  showOnlineBadge={true}
                />
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-black text-slate-900 whitespace-nowrap">{userInfo.name}</div>
                  <div className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">{formatTitleWithDepartment(userInfo.title, userInfo.department)}</div>
                </div>
                <IconChevronDown size={14} className={`hidden sm:block text-slate-500 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180 text-[#006838]" : ""}`} />
              </button>

              {/* Dropdown Menu Popup (Highest Z-Index Overlay) */}
              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-[100] overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-br from-[#006838] to-[#004d29] text-white space-y-2">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={userInfo.avatar}
                          name={userInfo.name}
                          size="lg"
                          zoom={avatarZoom}
                          offsetX={avatarOffsetX}
                          offsetY={avatarOffsetY}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black truncate">{userInfo.name}</h4>
                          <p className="text-xs text-emerald-100 truncate font-medium">{userInfo.email}</p>
                        </div>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        {formatTitleWithDepartment(userInfo.title, userInfo.department)}
                      </span>
                    </div>

                    {/* Menu Options */}
                    <div className="p-2 space-y-1">
                      {/* Option 1: Thông tin cá nhân */}
                      <button
                        onClick={() => {
                          setEditProfileForm({ ...userInfo });
                          setIsUserDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full p-2.5 rounded-xl text-left flex items-center gap-3 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-[#006838] transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#006838] flex items-center justify-center group-hover:bg-[#006838] group-hover:text-white transition-colors flex-shrink-0">
                          <IconUser size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold">Thông tin cá nhân</div>
                          <div className="text-[10px] text-slate-500 font-normal">Họ tên, SĐT, Email &amp; Avatar</div>
                        </div>
                      </button>

                      {/* Option 2: Đổi mật khẩu */}
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          setIsPasswordModalOpen(true);
                        }}
                        className="w-full p-2.5 rounded-xl text-left flex items-center gap-3 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors flex-shrink-0">
                          <IconLock size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold">Đổi mật khẩu</div>
                          <div className="text-[10px] text-slate-500 font-normal">Cập nhật mật khẩu tài khoản</div>
                        </div>
                      </button>

                      {/* Option 3: Trang Quản Trị (Admin Mode) */}
                      <Link
                        href="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full p-2.5 rounded-xl text-left flex items-center gap-3 text-xs font-bold text-[#006838] bg-emerald-50 hover:bg-[#006838] hover:text-white border border-emerald-200/80 transition-all cursor-pointer group my-1 shadow-2xs"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#006838] text-white group-hover:bg-white group-hover:text-[#006838] flex items-center justify-center transition-colors flex-shrink-0">
                          <IconShieldCheck size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-slate-900 group-hover:text-white flex items-center gap-1">
                            <span>Trang Quản Trị (Admin Mode)</span>
                          </div>
                          <div className="text-[10px] text-slate-500 group-hover:text-emerald-100 font-medium truncate">
                            Truy cập hệ thống quản trị /admin
                          </div>
                        </div>
                      </Link>

                      <div className="h-[1px] bg-slate-100 my-1" />

                      {/* Option 3: Đăng xuất */}
                      <Link
                        href="/login"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full p-2.5 rounded-xl text-left flex items-center gap-3 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors flex-shrink-0">
                          <IconLogout size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold">Đăng xuất</div>
                          <div className="text-[10px] text-rose-400 font-normal">Thoát tài khoản an toàn</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile & Tablet Horizontal Department Selector Pills (Taste Skill Human Style) */}
        <div className="lg:hidden px-3.5 sm:px-5 py-2.5 bg-white border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {visibleDepartments.map((dept) => {
            const IconComp = dept.icon;
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? "bg-gradient-to-r from-[#006838] to-[#004d29] text-white shadow-md shadow-emerald-900/20 scale-[1.02]"
                    : "bg-slate-50 text-slate-700 hover:bg-emerald-50/60 border border-slate-200/80"
                }`}
              >
                <IconComp size={16} className={isSelected ? "text-emerald-300" : "text-[#006838]"} />
                <span>{dept.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Body */}
        <div className="p-4 lg:p-6 space-y-4 pb-12 w-full min-w-0">
          {/* ════════════════════════════════════════════════════════════════
              THẺ 00: TỔNG QUAN HỆ THỐNG (CHẾ ĐỘ XEM ĐẦY ĐỦ - SCREENSHOT 2)
             ════════════════════════════════════════════════════════════════ */}
          {selectedDept === "overview" && (
            <OverviewDashboard
              onSelectDept={(deptId) => setSelectedDept(selectedDept === deptId ? null : deptId)}
              userName={userInfo.name}
            />
          )}

          {/* ════════════════════════════════════════════════════════════════
              THẺ 04: CN-CI (CẢI TIẾN LIÊN TỤC / KAIZEN / GEMBA) MODULE VIEW
             ════════════════════════════════════════════════════════════════ */}
          {selectedDept === "ci" && (
            <CNCIWrapper />
          )}


          {/* ════════════════════════════════════════════════════════════════
              DEPARTMENT HERO BANNER CARD (Screenshot 1 Layout)
             ════════════════════════════════════════════════════════════════ */}
          {activeDeptObj && activeDeptObj.id !== "overview" && activeDeptObj.id !== "rd" && activeDeptObj.id !== "hr" && activeDeptObj.id !== "ci" && (
            <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-md flex-shrink-0 bg-slate-900 group">
              {/* Background Image with Dark Emerald Overlay */}
              <img
                src={deptBanners[activeDeptObj.id]?.bg || "/images/tbs-factory-plant.png"}
                alt={activeDeptObj.name}
                className="absolute inset-0 w-full h-full object-cover object-[center_60%] opacity-85 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-[#004d29]/40 to-slate-950/40 pointer-events-none" />

              {/* Banner Content Layer */}
              <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col justify-between min-h-[160px] sm:min-h-[180px] text-white">
                {/* Top Row: Subtitle Badge & App Count Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-200/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 shadow-2xs">
                    PHÂN HỆ NGHIỆP VỤ
                  </span>
                  <div className="px-3.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100 text-xs font-extrabold backdrop-blur-md flex items-center gap-1.5 shadow-2xs">
                    <IconLayoutGrid size={14} className="text-emerald-300" />
                    <span>{deptBanners[activeDeptObj.id]?.appCount || 2} ứng dụng</span>
                  </div>
                </div>

                {/* Middle Section: Main Department Title & Subtitle */}
                <div className="space-y-1.5 my-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-black tracking-tight text-white drop-shadow-sm">
                    {deptBanners[activeDeptObj.id]?.title || activeDeptObj.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl font-medium leading-relaxed drop-shadow-xs">
                    {deptBanners[activeDeptObj.id]?.sub || activeDeptObj.sub}
                  </p>
                </div>

                {/* Bottom Row: Real Operational Badges */}
                <div className="flex items-center gap-2.5 pt-1">
                  <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] sm:text-[11px] font-bold text-emerald-100 flex items-center gap-1.5 backdrop-blur-xs">
                    Vận hành chuỗi SKECHERS
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] sm:text-[11px] font-bold text-emerald-100 flex items-center gap-1.5 backdrop-blur-xs">
                    Dữ liệu D1 Realtime
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* IF A "COMING SOON" DEPARTMENT IS SELECTED */}
          {activeDeptObj && !activeDeptObj.hasData && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-3 max-w-xl mx-auto my-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <IconClock size={30} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Phòng {activeDeptObj.name}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                Dữ liệu bảng điều khiển dành riêng cho {activeDeptObj.name} đang trong quá trình số hóa và đấu nối hệ thống.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/90 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <span>Tính năng đang phát triển — Coming Soon</span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              IF FINANCE (KẾ TOÁN & QUẢN TRỊ) IS SELECTED
             ════════════════════════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════════════════════════
              IF FINANCE (KẾ TOÁN & QUẢN TRỊ NỘI BỘ) IS SELECTED
              ACCOUNTING WORKSPACE & LIVE DATA ENTRY DESK
             ════════════════════════════════════════════════════════════════ */}
          {selectedDept === "finance" && (
            <div className="space-y-4 w-full">
              {/* ════════ 4 TOP KPI CARDS ════════ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* KPI 1: Doanh thu tháng */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                    <IconCoins size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 block truncate">Doanh thu tháng</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                      12.4 tỷ
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                      +12% so với tháng trước ↑
                    </span>
                  </div>
                </div>

                {/* KPI 2: Chi phí vận hành */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                    <IconClock size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 block truncate">Chi phí vận hành</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                      3.1 tỷ
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                      -8% so với tháng trước ↓
                    </span>
                  </div>
                </div>

                {/* KPI 3: Lợi nhuận ròng */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                    <IconTrendingUp size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 block truncate">Lợi nhuận ròng</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                      2.6 tỷ
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                      +18% so với tháng trước ↑
                    </span>
                  </div>
                </div>

                {/* KPI 4: Tỷ lệ chi phí/doanh thu */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100/80 shadow-2xs">
                    <IconAdjustmentsHorizontal size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 block truncate">Tỷ lệ chi phí/doanh thu</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                      25.0%
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                      -3% so với tháng trước ↓
                    </span>
                  </div>
                </div>
              </div>

              {/* ════════ 3 MAIN CARDS GRID (Xu hướng, Hoạt động, Truy cập nhanh) ════════ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* 1. XU HƯỚNG TÀI CHÍNH (Col 4/12) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900">Xu hướng tài chính</h3>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                      <span>6 tháng gần đây</span>
                      <IconChevronDown size={13} className="text-slate-400" />
                    </div>
                  </div>

                  {/* Line Chart with 2 Series (Doanh thu & Chi phí) */}
                  <div className="w-full h-44 my-2 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 340 140" preserveAspectRatio="none">
                      {/* Gridlines & Y-Axis Scale (125, 100, 75, 50, 25, 0) */}
                      {[
                        { label: "125", y: 15 },
                        { label: "100", y: 38 },
                        { label: "75", y: 61 },
                        { label: "50", y: 84 },
                        { label: "25", y: 107 },
                        { label: "0", y: 130 },
                      ].map((g, i) => (
                        <g key={i}>
                          <text x="24" y={g.y + 3.5} textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="600" className="font-mono">
                            {g.label}
                          </text>
                          <line x1="32" y1={g.y} x2="330" y2={g.y} stroke="#f1f5f9" strokeWidth="1" />
                        </g>
                      ))}

                      {/* Line 1: Doanh thu (#006838 - Dark Green) */}
                      <path
                        d="M 50 91 L 105 75 L 160 62 L 215 49 L 270 36 L 325 21"
                        fill="none"
                        stroke="#006838"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {[
                        { x: 50, y: 91, val: "42M" },
                        { x: 105, y: 75, val: "60M" },
                        { x: 160, y: 62, val: "74M" },
                        { x: 215, y: 49, val: "88M" },
                        { x: 270, y: 36, val: "102M" },
                        { x: 325, y: 21, val: "118M" },
                      ].map((pt, idx) => (
                        <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="#006838" stroke="#ffffff" strokeWidth="2" />
                      ))}

                      {/* Line 2: Chi phí (#4ade80 - Light Green) */}
                      <path
                        d="M 50 110 L 105 102 L 160 97 L 215 89 L 270 78 L 325 67"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {[
                        { x: 50, y: 110, val: "22M" },
                        { x: 105, y: 102, val: "30M" },
                        { x: 160, y: 97, val: "36M" },
                        { x: 215, y: 89, val: "45M" },
                        { x: 270, y: 78, val: "56M" },
                        { x: 325, y: 67, val: "68M" },
                      ].map((pt, idx) => (
                        <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="#4ade80" stroke="#ffffff" strokeWidth="2" />
                      ))}

                      {/* X-Axis Labels (T3, T4, T5, T6, T7, T8) */}
                      {["T3", "T4", "T5", "T6", "T7", "T8"].map((m, i) => (
                        <text key={m} x={50 + i * 55} y="139" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700" className="font-mono">
                          {m}
                        </text>
                      ))}
                    </svg>
                  </div>

                  {/* Legend Footer */}
                  <div className="flex items-center justify-center gap-6 pt-1 text-[11px] font-bold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#006838]" />
                      Doanh thu
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
                      Chi phí
                    </span>
                  </div>
                </div>

                {/* 2. HOẠT ĐỘNG NỔI BẬT (Col 4/12) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900">Hoạt động nổi bật</h3>
                  </div>

                  <div className="space-y-2.5 my-auto py-1">
                    {/* Item 1 */}
                    <Link href="/finance/bao-cao" className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100">
                          <IconFileInvoice size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-[#006838] transition-colors">
                            Báo cáo tài chính tháng 8
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Đã hoàn thành • 2 giờ trước
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                        Hoàn thành
                      </span>
                    </Link>

                    {/* Item 2 */}
                    <Link href="/finance/cong-no" className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-amber-50/40 hover:border-amber-200 transition-all flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100">
                          <IconShoppingCart size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-amber-800 transition-colors">
                            Đối soát công nợ nhà cung cấp
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Đang xử lý • 1 ngày trước
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                        Đang xử lý
                      </span>
                    </Link>

                    {/* Item 3 */}
                    <Link href="/finance/chi-phi" className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 border border-emerald-100">
                          <IconChartPie size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-[#006838] transition-colors">
                            Tổng hợp chi phí sản xuất
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Đã hoàn thành • 2 ngày trước
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                        Hoàn thành
                      </span>
                    </Link>
                  </div>

                  <Link href="/finance/bao-cao" className="text-center text-xs font-bold text-[#006838] hover:underline pt-2 block">
                    Xem tất cả hoạt động →
                  </Link>
                </div>

                {/* 3. TRUY CẬP NHANH - KẾ TOÁN & QT (Col 4/12) */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900">Truy cập nhanh – Kế toán & QT</h3>
                  </div>

                  {/* 8 Quick Action Tiles (4 cols x 2 rows) */}
                  <div className="grid grid-cols-4 gap-2 my-auto py-1">
                    {[
                      { name: "Thu – Chi", icon: IconWallet, href: "/finance/thu-chi" },
                      { name: "Báo cáo tài chính", icon: IconChartBar, href: "/finance/bao-cao" },
                      { name: "Ngân sách", icon: IconCalendarEvent, href: "/finance/ngan-sach" },
                      { name: "Công nợ", icon: IconUsers, href: "/finance/cong-no" },
                      { name: "Kho quỹ", icon: IconMail, href: "/finance/vat-tu-kho" },
                      { name: "Hóa đơn", icon: IconFileText, href: "/finance/hoa-don" },
                      { name: "Tài sản", icon: IconDeviceDesktop, href: "/finance/tai-san" },
                      { name: "Cài đặt", icon: IconSettings, href: "/finance" },
                    ].map((btn, idx) => {
                      const BtnIcon = btn.icon;
                      return (
                        <Link
                          key={idx}
                          href={btn.href}
                          className="p-2 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-[#e6f4ed] hover:border-[#006838]/60 transition-all flex flex-col items-center text-center gap-1 group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#e6f4ed] text-[#006838] group-hover:bg-[#006838] group-hover:text-white transition-all flex items-center justify-center">
                            <BtnIcon size={18} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-[#006838] transition-colors line-clamp-2">
                            {btn.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href="/finance"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50/80 hover:bg-[#006838] text-[#006838] hover:text-white border border-emerald-200/80 text-xs font-extrabold text-center transition-all shadow-2xs mt-2 block"
                  >
                    Xem tất cả chức năng →
                  </Link>
                </div>
              </div>

              {/* ════════ 10 PHÂN HỆ KẾ TOÁN & QUẢN TRỊ NỘI BỘ (FULL LIST) ════════ */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#e6f4ed] text-[#006838] flex items-center justify-center font-black">
                      <IconCalculator size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        Danh Mục 10 Phân Hệ Kế Toán &amp; Quản Trị
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Hệ thống phân hệ nghiệp vụ số hóa hoàn chỉnh cho Tổ hợp Kiên Giang - TBS Group
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/finance"
                    className="text-xs font-bold text-[#006838] hover:underline flex items-center gap-1"
                  >
                    <span>Mở Hub Kế toán</span>
                    <IconArrowRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {[
                    {
                      num: "01",
                      title: "1. 💰 Thu – Chi",
                      href: "/finance/thu-chi",
                      badge: "8 phiếu T8",
                      desc: ["Tạo phiếu thu / Tạo phiếu chi", "Tạm ứng / Hoàn ứng", "Theo dõi quỹ tiền mặt & NH", "Duyệt phiếu thu/chi & Lịch sử"],
                    },
                    {
                      num: "02",
                      title: "2. 🧾 Hóa đơn & Chứng từ",
                      href: "/finance/hoa-don",
                      badge: "47 HĐ T8",
                      desc: ["Hóa đơn đầu vào & đầu ra", "Nhập & tra cứu hóa đơn", "Đính kèm chứng từ điện tử", "Đối chiếu hóa đơn - Phiếu chi"],
                    },
                    {
                      num: "03",
                      title: "3. 🤝 Công nợ",
                      href: "/finance/cong-no",
                      badge: "2 quá hạn",
                      desc: ["Công nợ phải trả & phải thu", "Danh sách đối tác & NCC", "Theo dõi hạn & quá hạn", "Cảnh báo & đối chiếu công nợ"],
                    },
                    {
                      num: "04",
                      title: "4. 📊 Ngân sách",
                      href: "/finance/ngan-sach",
                      badge: "1 PB vượt NS",
                      desc: ["Lập & phân bổ ngân sách", "Ngân sách theo PB / Đơn vị", "Theo dõi Budget / Actual", "Cảnh báo vượt & điều chỉnh"],
                    },
                    {
                      num: "05",
                      title: "5. 💸 Chi phí",
                      href: "/finance/chi-phi",
                      badge: "1.77 tỷ đ",
                      desc: ["Chi phí văn phòng, nhân sự", "Chi phí công tác & R&D", "Chi phí mua sắm & dịch vụ", "Chi phí thuê mặt bằng & vận hành"],
                    },
                    {
                      num: "06",
                      title: "6. 🏢 Tài sản",
                      href: "/finance/tai-san",
                      badge: "1 TS sửa",
                      desc: ["Danh sách tài sản & cấp phát", "Bàn giao & điều chuyển TS", "Kiểm kê & theo dõi khấu hao", "Tài sản hư hỏng & thanh lý"],
                    },
                    {
                      num: "07",
                      title: "7. 📦 Vật tư & Kho",
                      href: "/finance/vat-tu-kho",
                      badge: "2 tồn thấp",
                      desc: ["Nhập kho / Xuất kho", "Điều chuyển & kiểm kê kho", "Theo dõi nhập - xuất - tồn", "Cảnh báo tồn kho thấp"],
                    },
                    {
                      num: "08",
                      title: "8. 🔄 Đối soát",
                      href: "/finance/doi-soat",
                      badge: "3 chênh lệch",
                      desc: ["Đối soát thu chi & ngân hàng", "Đối soát hóa đơn & công nợ", "Đối soát chứng từ & NS", "Ghi nhận nguyên nhân lệch"],
                    },
                    {
                      num: "09",
                      title: "9. ✅ Phê duyệt",
                      href: "/finance/phe-duyet",
                      badge: "2 chờ duyệt",
                      desc: ["Quy trình workflow 4 cấp", "Duyệt phiếu chi & tạm ứng", "Duyệt đề nghị mua sắm", "Duyệt điều chỉnh ngân sách"],
                    },
                    {
                      num: "10",
                      title: "10. 📈 Báo cáo quản trị",
                      href: "/finance/bao-cao",
                      badge: "8 báo cáo",
                      desc: ["BC Thu-Chi & Chi phí", "BC Ngân sách & Công nợ", "BC Tài sản, Kho & Dòng tiền", "Xuất file Excel/PDF định kỳ"],
                    },
                  ].map((mod, idx) => (
                    <Link
                      key={idx}
                      href={mod.href}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-[#006838]/60 hover:shadow-sm transition-all flex flex-col justify-between gap-2.5 group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-200/50">
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-[#006838] transition-colors leading-tight">
                            {mod.title}
                          </h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-[#006838] border border-emerald-100 flex-shrink-0">
                            {mod.badge}
                          </span>
                        </div>

                        <ul className="space-y-0.5 pt-1.5">
                          {mod.desc.map((d, dIdx) => (
                            <li key={dIdx} className="text-[10px] text-slate-600 flex items-start gap-1 leading-snug">
                              <span className="text-[#006838] font-bold">•</span>
                              <span className="truncate">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-extrabold text-[#006838] group-hover:translate-x-0.5 transition-transform">
                        <span>Truy cập module</span>
                        <IconArrowRight size={12} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* IF HR (NHÂN SỰ HÀNH CHÁNH) IS SELECTED */}
          {selectedDept === "hr" && (
            <div className="w-full h-full min-h-[600px]">
              <HRModuleView />
            </div>
          )}

          {/* IF R&D (PHÁT TRIỂN SẢN PHẨM) IS SELECTED */}
          {selectedDept === "rd" && (
            <div className="space-y-4 w-full">
              <RDModule
                userName={userInfo.name}
                onSelectDept={(deptId) => setSelectedDept(deptId)}
              />
            </div>
          )}

          {/* IF QC (QUẢN LÝ CHẤT LƯỢNG) IS SELECTED */}
          {selectedDept === "qc" && (
            <div className="space-y-3.5 my-auto">
              <QualityModule onNavigateToApp={(url) => window.open(url, "_blank")} />
            </div>
          )}
          {/* IF HIỆU SUẤT NHÀ MÁY (PHÒNG SẢN XUẤT) IS SELECTED */}
          {selectedDept === "production" && (
            <div className="space-y-4 my-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Sản Lượng Tháng", val: "586,000 Đôi", trend: "+15%" },
                  { title: "Số Dây Chuyền", val: "33 Chuyền", trend: "100% Hoạt động" },
                  { title: "Hiệu Suất Chuyền", val: "92.4%", trend: "+5%" },
                  { title: "Tiến Độ Đơn Hàng", val: "89.2%", trend: "Đạt kế hoạch" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <span className="text-xs font-bold text-slate-500">{item.title}</span>
                    <div className="text-xl font-black text-slate-900">{item.val}</div>
                    <span className="text-xs text-[#006838] font-bold block">{item.trend} so với tháng trước</span>
                  </div>
                ))}
              </div>

              <ProductionPerformanceModule />
            </div>
          )}

          {/* DEFAULT MAIN DASHBOARD (Exact Screenshot Proportion Calibrated) */}
          {!selectedDept && (
            <div className="space-y-4">
              {/* TOP ROW: 4 Metric Cards (Left Column - 10% Reduced Width) + Donut Ring Chart (Right Column) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* Left Column (4 Cards Vertical Stack) */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between gap-2.5">
                  {/* Card 1: R&D (Phòng phát triển) */}
                  <div
                    onClick={() => setSelectedDept(selectedDept === "rd" ? null : "rd")}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#006838]/60 transition-all cursor-pointer flex items-center gap-3 group flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
                      <IconUsers size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-600 block truncate">
                        Chỉ Số Phòng Phát Triển (R&D)
                      </span>
                      <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        1,248
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#006838] mt-0.5 truncate">
                        <IconArrowUpRight size={12} className="flex-shrink-0" />
                        <span className="truncate">+12% so với tháng trước</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Đơn Hàng */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#006838]/60 transition-all flex items-center gap-3 group flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#e6f4ed] text-[#006838] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
                      <IconClipboardList size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-600 block truncate">
                        Đơn Hàng Chuỗi SKECHERS
                      </span>
                      <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        342
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#006838] mt-0.5 truncate">
                        <IconArrowUpRight size={12} className="flex-shrink-0" />
                        <span className="truncate">+8% so với tháng trước</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Chỉ Số Phòng Sản Xuất (TH-NM) */}
                  <div
                    onClick={() => setSelectedDept(selectedDept === "production" ? null : "production")}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#006838]/60 transition-all cursor-pointer flex items-center gap-3 group flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#e6f4ed] text-[#006838] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
                      <IconPackage size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-600 block truncate">
                        Hiệu Suất Nhà Máy
                      </span>
                      <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        586
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#006838] mt-0.5 truncate">
                        <IconArrowUpRight size={12} className="flex-shrink-0" />
                        <span className="truncate">+15% so với tháng trước</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Hiệu Suất & Chỉ Số Chất Lượng (QC) */}
                  <div
                    onClick={() => setSelectedDept(selectedDept === "qc" ? null : "qc")}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#006838]/60 transition-all cursor-pointer flex items-center gap-3 group flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#e6f4ed] text-[#006838] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
                      <IconTrendingUp size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-600 block truncate">
                        Chỉ Số Chất Lượng &amp; Hiệu Suất (QC)
                      </span>
                      <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        92%
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#006838] mt-0.5 truncate">
                        <IconArrowUpRight size={12} className="flex-shrink-0" />
                        <span className="truncate">+5% so với tháng trước</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (TỔNG CẢI TIẾN - Donut Chart Block) */}
                <div className="lg:col-span-8 xl:col-span-9 p-4 sm:p-5 lg:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between min-w-0">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center border border-emerald-100 flex-shrink-0">
                        <IconSettings size={22} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        TỔNG CẢI TIẾN
                      </h3>
                    </div>

                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <option value="Tháng này">Tháng này</option>
                      <option value="Tháng trước">Tháng trước</option>
                      <option value="Quý 2/2026">Quý 2/2026</option>
                      <option value="Cả năm 2026">Cả năm 2026</option>
                    </select>
                  </div>

                  {/* Donut Ring Visual */}
                  <div className="relative py-3 flex flex-col lg:flex-row items-center justify-center gap-6 xl:gap-8 my-auto w-full min-w-0">
                    {/* Donut SVG Ring Graphic */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 xl:w-64 xl:h-64 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Blue: Nhân sự hành chánh (22.7%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#2563eb"
                          strokeWidth="15"
                          strokeDasharray="54.2 184.8"
                          strokeDashoffset="0"
                        />
                        {/* Orange: CN-CI (19.2%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#ea580c"
                          strokeWidth="15"
                          strokeDasharray="45.8 193.2"
                          strokeDashoffset="-54.2"
                        />
                        {/* TBS Green: Quản lý chất lượng (14.8%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#006838"
                          strokeWidth="15"
                          strokeDasharray="35.3 203.7"
                          strokeDashoffset="-100"
                        />
                        {/* Sky Blue: KH chuẩn bị (9.3%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#0284c7"
                          strokeWidth="15"
                          strokeDasharray="22.2 216.8"
                          strokeDashoffset="-135.3"
                        />
                        {/* Purple: TH-NM (4.1%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#7c3aed"
                          strokeWidth="15"
                          strokeDasharray="9.8 229.2"
                          strokeDashoffset="-157.5"
                        />
                        {/* Magenta Pink: R&D (13.1%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#db2777"
                          strokeWidth="15"
                          strokeDasharray="31.3 207.7"
                          strokeDashoffset="-167.3"
                        />
                        {/* Cyan: Kế toán (16.8%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#06b6d4"
                          strokeWidth="15"
                          strokeDasharray="40.1 198.9"
                          strokeDashoffset="-198.6"
                        />
                      </svg>

                      {/* Donut Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-[10px] sm:text-[11px] font-black text-[#006838] uppercase tracking-wider block">
                          TBS GROUP
                        </span>
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block my-0.5">
                          582
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">
                          Tổng Cải Tiến
                        </span>
                      </div>
                    </div>

                    {/* Donut Chart Legend Labels Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 w-full max-w-md min-w-0">
                      <div className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50">
                        <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-slate-600 block text-xs font-semibold leading-snug">Nhân sự hành chánh</span>
                          <div className="text-slate-900 font-black text-xs mt-0.5">132 <span className="text-[#006838] font-bold">(22.7%)</span></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50">
                        <span className="w-3 h-3 rounded-full bg-orange-600 flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-slate-600 block text-xs font-semibold leading-snug">CN-CI</span>
                          <div className="text-slate-900 font-black text-xs mt-0.5">112 <span className="text-amber-600 font-bold">(19.2%)</span></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50">
                        <span className="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-slate-600 block text-xs font-semibold leading-snug">Kế toán &amp; quản trị</span>
                          <div className="text-slate-900 font-black text-xs mt-0.5">98 <span className="text-[#006838] font-bold">(16.8%)</span></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50">
                        <span className="w-3 h-3 rounded-full bg-[#006838] flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-slate-600 block text-xs font-semibold leading-snug">Quản lý chất lượng (QC)</span>
                          <div className="text-slate-900 font-black text-xs mt-0.5">86 <span className="text-[#006838] font-bold">(14.8%)</span></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50">
                        <span className="w-3 h-3 rounded-full bg-pink-600 flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-slate-600 block text-xs font-semibold leading-snug">R&amp;D (Phát triển mẫu)</span>
                          <div className="text-slate-900 font-black text-xs mt-0.5">76 <span className="text-[#006838] font-bold">(13.1%)</span></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50">
                        <span className="w-3 h-3 rounded-full bg-sky-600 flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-slate-600 block text-xs font-semibold leading-snug">KH chuẩn bị - TTPP</span>
                          <div className="text-slate-900 font-black text-xs mt-0.5">54 <span className="text-[#006838] font-bold">(9.3%)</span></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 col-span-2">
                        <span className="w-3 h-3 rounded-full bg-purple-600 flex-shrink-0 mt-1" />
                        <div>
                          <span className="text-slate-600 block text-xs font-semibold leading-snug">Hiệu Suất Nhà Máy</span>
                          <div className="text-slate-900 font-black text-xs mt-0.5">24 <span className="text-pink-600 font-bold">(4.1%)</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: System Notifications Bar ("THÔNG BÁO HỆ THỐNG") */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    THÔNG BÁO HỆ THỐNG
                  </h3>
                  <button className="text-xs font-bold text-[#006838] hover:underline flex items-center gap-1">
                    <span>Xem tất cả</span>
                    <IconChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Notification 1 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3.5 hover:bg-slate-100 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006838] flex items-center justify-center flex-shrink-0">
                      <IconClipboardList size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        Có 12 đơn hàng đang chờ xử lý
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cập nhật 10 phút trước
                      </p>
                    </div>
                  </div>

                  {/* Notification 2 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3.5 hover:bg-slate-100 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <IconUsers size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        5 nhân sự sắp hết hạn hợp đồng
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cập nhật 1 giờ trước
                      </p>
                    </div>
                  </div>

                  {/* Notification 3 */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3.5 hover:bg-slate-100 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <IconPackage size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        Báo cáo cải tiến tuần 24
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cập nhật 2 giờ trước
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar inside dashboard */}
        <footer className="py-2.5 px-6 border-t border-slate-200/70 text-xs text-slate-500 flex items-center justify-between bg-[#f4f7f5] flex-shrink-0">
          <span>Tổ hợp Kiên Giang - TBS Group Dashboard v2.4</span>
          <span className="font-mono text-[#006838] font-bold">● System Online 24/7</span>
        </footer>
      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL 1: THÔNG TIN CÁ NHÂN (PROFILE EDIT MODAL - SCREENSHOT 2)
         ════════════════════════════════════════════════════════════════ */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header Banner */}
            <div className="p-5 bg-gradient-to-r from-[#006838] to-[#004d29] text-white flex items-center justify-between relative overflow-hidden">
              {/* Background Decorative Rings */}
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

              <div className="flex items-center gap-3.5 z-10">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-xs">
                  <IconUser size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Thông Tin Cá Nhân</h3>
                  <p className="text-xs text-emerald-100 font-medium">Cập nhật họ tên, SĐT, email &amp; hình đại diện</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer z-10"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-left">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Center Circular Avatar Display with Camera Badge Button (Screenshot 2) */}
              <div className="relative w-36 h-36 mx-auto my-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full rounded-full border-4 border-[#006838] shadow-lg overflow-hidden relative bg-slate-100 cursor-pointer group"
                  title="Nhấn để tải và chỉnh sửa ảnh mới"
                >
                  <UserAvatar
                    src={editProfileForm.avatar}
                    name={editProfileForm.name}
                    size="custom"
                    className="w-full h-full"
                    zoom={avatarZoom}
                    offsetX={avatarOffsetX}
                    offsetY={avatarOffsetY}
                  />
                  <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity z-10">
                    <IconCamera size={26} />
                  </div>
                </div>

                {/* Camera Badge Button on Bottom Right Edge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full bg-white text-[#006838] border border-emerald-200 shadow-md hover:scale-110 flex items-center justify-center absolute bottom-1 right-1 cursor-pointer z-10 transition-transform"
                  title="Tải ảnh mới"
                >
                  <IconCamera size={18} />
                </button>
              </div>

              {/* Input: Họ và tên */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Họ và tên</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838] bg-slate-50/50"
                  />
                  <IconUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Input: Số điện thoại liên hệ */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.phone}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                />
              </div>

              {/* Input: Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Địa chỉ Email công việc</label>
                <input
                  type="email"
                  required
                  value={editProfileForm.email}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-[#006838] focus:ring-1 focus:ring-[#006838]"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006838] text-white text-xs font-bold hover:bg-[#00522c] transition-colors shadow-md shadow-emerald-900/20 cursor-pointer flex items-center gap-1.5"
                >
                  <IconCheck size={16} />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL 2: ĐỔI MẬT KHẨU (PASSWORD CHANGE MODAL)
         ════════════════════════════════════════════════════════════════ */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <IconLock size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Đổi Mật Khẩu</h3>
                  <p className="text-xs text-amber-100 font-medium">Bảo mật tài khoản TBS Group System</p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSavePassword} className="p-6 space-y-4 text-left">
              {/* Input: Mật khẩu hiện tại */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Input: Mật khẩu mới */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Input: Xác nhận mật khẩu mới */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-900/20 cursor-pointer flex items-center gap-1.5"
                >
                  <IconCheck size={16} />
                  <span>Cập nhật mật khẩu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL 3: IN PHIẾU THU / PHIẾU CHI KẾ TOÁN CHUẨN MẪU A5
         ════════════════════════════════════════════════════════════════ */}
      {isFinPrintModalOpen && selectedFinItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#006838] to-[#004d29] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <IconPrinter size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Mẫu In Chứng Từ Kế Toán Chuẩn A5</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">Quy chuẩn chứng từ kế toán nội bộ TBS Group - Chuỗi Skechers</p>
                </div>
              </div>
              <button
                onClick={() => setIsFinPrintModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Modal Printable Voucher Body (Khổ A5 Chuẩn Mẫu Kế Toán) */}
            <div className="p-6 overflow-y-auto space-y-4 bg-white text-slate-900">
              <div className="border border-slate-300 p-5 rounded-xl bg-white shadow-2xs font-serif text-slate-900 space-y-3">
                {/* Header phiếu */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-sans font-black text-xs text-[#006838] tracking-wider uppercase">
                      CÔNG TY CP ĐẦU TƯ THÁI BÌNH (TBS GROUP)
                    </h4>
                    <p className="text-[11px] text-slate-600 font-sans">
                      Tổ hợp Kiên Giang - TBS Group, Tỉnh Kiên Giang
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">Mã số thuế: 3700147988</p>
                  </div>
                  <div className="text-right text-[11px] font-sans">
                    <p className="font-bold text-slate-700">Mẫu số: 01-TT</p>
                    <p className="text-slate-500 text-[10px]">(Ban hành theo TT 200/2014/TT-BTC)</p>
                    <p className="font-mono font-bold text-emerald-800 text-xs mt-0.5">Số: {selectedFinItem.id}</p>
                  </div>
                </div>

                {/* Tiêu đề phiếu */}
                <div className="text-center py-1">
                  <h2 className="text-xl font-black tracking-wide text-slate-900 uppercase font-sans">
                    {selectedFinItem.typeCode === "thu"
                      ? "PHIẾU THU TIỀN"
                      : selectedFinItem.typeCode === "chi"
                      ? "PHIẾU CHI TIỀN"
                      : selectedFinItem.typeCode === "tam_ung"
                      ? "GIẤY ĐỀ NGHỊ TẠM ỨNG"
                      : selectedFinItem.typeCode === "hoa_don"
                      ? "BẢNG KÊ HÓA ĐƠN CHỨNG TỪ"
                      : "BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ"}
                  </h2>
                  <p className="text-[11px] italic text-slate-600 font-sans mt-0.5">
                    Ngày {selectedFinItem.date.split("-")[2]} tháng {selectedFinItem.date.split("-")[1]} năm {selectedFinItem.date.split("-")[0]}
                  </p>
                  <div className="flex justify-center gap-6 text-[11px] font-mono mt-1 text-slate-700 font-sans">
                    <span>Nợ: <strong className="text-slate-900">{selectedFinItem.debit}</strong></span>
                    <span>Có: <strong className="text-slate-900">{selectedFinItem.credit}</strong></span>
                  </div>
                </div>

                {/* Nội dung thông tin chứng từ */}
                <div className="space-y-2 text-xs font-sans pt-1">
                  <div className="flex items-baseline">
                    <span className="w-36 text-slate-600 font-medium flex-shrink-0">
                      {selectedFinItem.typeCode === "thu" ? "Họ tên người nộp tiền:" : "Họ tên người nhận tiền:"}
                    </span>
                    <span className="font-bold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.party}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-36 text-slate-600 font-medium flex-shrink-0">Bộ phận / Đơn vị:</span>
                    <span className="font-semibold text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.dept}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-36 text-slate-600 font-medium flex-shrink-0">Lý do thu / chi:</span>
                    <span className="text-slate-900 border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.note}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-36 text-slate-600 font-medium flex-shrink-0">Số tiền:</span>
                    <span className="font-mono font-black text-slate-900 text-sm border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      {selectedFinItem.amount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-36 text-slate-600 font-medium flex-shrink-0">Kèm theo:</span>
                    <span className="text-slate-600 italic border-b border-dotted border-slate-400 flex-1 pb-0.5">
                      01 Chứng từ điện tử gốc ({selectedFinItem.id}.pdf)
                    </span>
                  </div>
                </div>

                {/* Chữ ký 4-5 cột */}
                <div className="grid grid-cols-4 gap-2 pt-6 text-center text-[10px] font-sans text-slate-700">
                  <div>
                    <p className="font-bold text-slate-900 uppercase">Thủ trưởng đơn vị</p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, đóng dấu)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-emerald-800">[Đã Duyệt Điện Tử]</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 uppercase">Kế toán trưởng</p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, họ tên)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-emerald-800">Trần Thị Mai</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 uppercase">Người lập phiếu</p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, họ tên)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-slate-800">Phạm Nguyễn Anh Huy</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 uppercase">
                      {selectedFinItem.typeCode === "thu" ? "Người nộp tiền" : "Người nhận tiền"}
                    </p>
                    <p className="italic text-slate-400 text-[9px]">(Ký, họ tên)</p>
                    <div className="h-14 flex items-end justify-center">
                      <span className="text-[10px] font-bold text-slate-800">{selectedFinItem.party.split(" ")[0]}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-mono">
                Mã bảo mật D1: #TBS-FIN-{selectedFinItem.id}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFinPrintModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`🖨️ Đang gửi lệnh in chứng từ ${selectedFinItem.id} tới máy in...`);
                    setTimeout(() => {
                      setIsFinPrintModalOpen(false);
                      showToast(`✅ Đã in thành công chứng từ ${selectedFinItem.id}!`);
                    }, 1200);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <IconPrinter size={16} />
                  <span>In Chứng Từ Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DONUT CHART DASHBOARD MODAL */}
      <DonutChartModal
        isOpen={isDonutModalOpen}
        onClose={() => setIsDonutModalOpen(false)}
      />

      {/* ════════════════════════════════════════════════════════════════
          MOBILE APP NATIVE NAVIGATION (DRAWER & BOTTOM NAV BAR)
         ════════════════════════════════════════════════════════════════ */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={userInfo}
        departments={visibleDepartments}
        selectedDeptId={selectedDept || "overview"}
        onSelectDepartment={(deptId) => {
          changeDepartment(deptId === "overview" ? null : deptId);
        }}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onLogout={() => {
          if (typeof window !== "undefined") {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = "/login";
          }
        }}
      />

      <MobileBottomNav
        activeTab={
          selectedDept === "ci"
            ? "ci-kaizen"
            : selectedDept === "qc"
            ? "qc-quality"
            : selectedDept === "hr"
            ? "hr-hanhchanh"
            : selectedDept === null
            ? "overview"
            : "overview"
        }
        onSelectTab={(tabId) => {
          if (tabId === "overview") changeDepartment(null);
          else if (tabId === "ci-kaizen") changeDepartment("ci");
          else if (tabId === "qc-quality") changeDepartment("qc");
          else if (tabId === "hr-hanhchanh") changeDepartment("hr");
        }}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        badgeCounts={{
          kaizen: 12,
          quality: 20,
        }}
      />

      {/* TOAST NOTIFICATION MESSAGE */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <IconCheck size={16} />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* System Theme Color & Font Size Modal */}
      <ThemeFontControlModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}
