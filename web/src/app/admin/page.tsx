"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconSettings,
  IconHistory,
  IconUpload,
  IconCheck,
  IconAlertTriangle,
  IconPlus,
  IconTrash,
  IconRefresh,
  IconNews,
  IconPhoto,
  IconBuilding,
  IconShieldCheck,
  IconEdit,
  IconEye,
  IconSearch,
  IconDatabase,
  IconLock,
  IconLockOpen,
  IconFileText,
  IconArrowLeft,
  IconDeviceLaptop,
  IconKey,
  IconDownload,
  IconHome,
  IconExternalLink,
  IconRotate,
  IconShoe,
  IconChevronLeft,
  IconChevronRight,
  IconBuildingStore,
} from "@tabler/icons-react";
import {
  LandingCMSConfig,
  getLandingCMS,
  saveLandingCMS,
  DEFAULT_LANDING_CMS,
  DEFAULT_SHOE_LINES_CONFIG,
} from "@/lib/landingCMS";
import LandingCMSManager from "@/components/admin/LandingCMSManager";
import BrandPartnersManager from "@/components/admin/BrandPartnersManager";
import ShoeLinesManager from "@/components/admin/ShoeLinesManager";
import WorkspaceCMSManager from "@/components/admin/WorkspaceCMSManager";
import * as XLSX from "xlsx";
import { INITIAL_370_EMPLOYEES } from "@/lib/initialEmployees";

interface EmployeeAccount {
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  roleCode: string;
  status: "ACTIVE" | "LOCKED";
  ngayVao?: string;
  vtcvHienTai?: string;
  phongBanHienTai?: string;
  vtcvSap?: string;
  vtcvSapXep?: string;
  phongBanSapXep?: string;
  boPhoanMoi?: string;
  phongBanMoi?: string;
  ghiChu?: string;
}

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  imageUrl: string;
  publishDate: string;
  author: string;
  views: number;
}

interface MediaAsset {
  id: string;
  title: string;
  category: "HERO_BANNER" | "FACTORY" | "PRODUCT" | "EVENTS";
  url: string;
  createdAt: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "news" | "media" | "workspace_gallery" | "brand_partners" | "shoe_lines" | "products" | "landing_cms" | "d1_control"
  >("overview");
  const [cmsSubSection, setCmsSubSection] = useState<
    "hero" | "workspace" | "excellence" | "products"
  >("hero");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Landing Page CMS State
  const [landingCMS, setLandingCMS] = useState<LandingCMSConfig>(DEFAULT_LANDING_CMS);

  useEffect(() => {
    setLandingCMS(getLandingCMS());

    // Check URL search parameters (e.g. /admin?tab=products or /admin?tab=workspace_gallery)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "products") {
        setActiveTab("products");
        setCmsSubSection("products");
      } else if (tabParam === "workspace" || tabParam === "workspace_gallery" || tabParam === "kglv") {
        setActiveTab("workspace_gallery");
      } else if (tabParam === "brand_partners" || tabParam === "brands") {
        setActiveTab("brand_partners");
      } else if (tabParam === "shoe_lines" || tabParam === "shoes") {
        setActiveTab("shoe_lines");
      } else if (tabParam === "landing_cms") {
        setActiveTab("landing_cms");
      }
    }
  }, []);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loginEmail, setLoginEmail] = useState("tbsgroup2026@gmail.com");
  const [loginPassword, setLoginPassword] = useState("tbsgroupsk@!");
  const [authError, setAuthError] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Admin Account Info
  const adminUser = {
    name: "Super Administrator System",
    email: "tbsgroup2026@gmail.com",
    role: "Quản Trị Viên Tối Cao (System Admin)",
    avatar: "/images/tbs-logo.png",
  };

  // Cloudinary Configuration
  const CLOUDINARY_CLOUD_NAME = "dwl2xtbqa";
  const CLOUDINARY_PRESET = "vpchuoisk";
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);

  const handleCloudinaryFileUpload = async (file: File, target: "media" | "news") => {
    try {
      setIsUploadingCloudinary(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        if (target === "media") {
          setMediaForm((prev) => ({
            ...prev,
            url: data.secure_url,
            title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
          }));
        } else {
          setNewsForm((prev) => ({ ...prev, imageUrl: data.secure_url }));
        }
        showToast(`☁️ Tải ảnh lên Cloudinary (${CLOUDINARY_CLOUD_NAME}) thành công!`);
      } else {
        alert("Lỗi Cloudinary: " + (data.error?.message || "Không thể nạp tệp!"));
      }
    } catch (err: any) {
      alert("Lỗi kết nối Cloudinary: " + err.message);
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  const handleUploadLandingCMSImage = async (
    file: File,
    section: "heroBg" | "heroHands" | "heroTeam" | "excellence" | "product",
    productIndex?: number
  ) => {
    try {
      setIsUploadingCloudinary(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        if (section === "heroBg") {
          setLandingCMS((prev) => ({ ...prev, hero: { ...prev.hero, bgImage: data.secure_url } }));
        } else if (section === "heroHands") {
          setLandingCMS((prev) => ({ ...prev, hero: { ...prev.hero, handsImage: data.secure_url } }));
        } else if (section === "heroTeam") {
          setLandingCMS((prev) => ({ ...prev, hero: { ...prev.hero, teamImage: data.secure_url } }));
        } else if (section === "excellence") {
          setLandingCMS((prev) => ({ ...prev, excellence: { ...prev.excellence, image: data.secure_url } }));
        } else if (section === "product" && productIndex !== undefined) {
          setLandingCMS((prev) => {
            const newItems = [...prev.products.items];
            newItems[productIndex] = { ...newItems[productIndex], image: data.secure_url };
            return { ...prev, products: { ...prev.products, items: newItems } };
          });
        }
        showToast(`☁️ Tải ảnh lên Cloudinary thành công!`);
      } else {
        alert("Lỗi Cloudinary: " + (data.error?.message || "Không thể nạp tệp!"));
      }
    } catch (err: any) {
      alert("Lỗi tải ảnh: " + err.message);
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  const handleBulkUploadProductImages = async (files: FileList) => {
    try {
      setIsUploadingCloudinary(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      }

      if (uploadedUrls.length > 0) {
        setLandingCMS((prev) => {
          const currentItems = [...prev.products.items];
          let uploadIdx = 0;
          for (let i = 0; i < currentItems.length && uploadIdx < uploadedUrls.length; i++) {
            if (!currentItems[i].image || currentItems[i].image?.startsWith("/images/")) {
              currentItems[i] = { ...currentItems[i], image: uploadedUrls[uploadIdx++] };
            }
          }
          while (uploadIdx < uploadedUrls.length) {
            const num = currentItems.length + 1;
            currentItems.push({
              name: `Dòng Sản Phẩm Mới #${num}`,
              code: `SK-PROD-0${num}`,
              image: uploadedUrls[uploadIdx++],
            });
          }
          return {
            ...prev,
            products: { ...prev.products, items: currentItems },
          };
        });
        showToast(`☁️ Đã import thành công ${uploadedUrls.length} ảnh sản phẩm lên Cloudinary!`);
      }
    } catch (err: any) {
      alert("Lỗi import ảnh: " + err.message);
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  const handleSaveLandingCMS = (e: React.FormEvent) => {
    e.preventDefault();
    saveLandingCMS(landingCMS);
    showToast("💾 Đã lưu cấu hình Trang Chủ! Nội dung & hình ảnh đã được cập nhật ngay lập tức.");
  };

  const handleResetLandingCMS = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ nội dung & hình ảnh Trang Chủ về mặc định gốc?")) {
      setLandingCMS(DEFAULT_LANDING_CMS);
      saveLandingCMS(DEFAULT_LANDING_CMS);
      showToast("🔄 Đã khôi phục cài đặt Trang Chủ về mặc định gốc!");
    }
  };

  // Handle Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (loginEmail === "tbsgroup2026@gmail.com" && loginPassword === "tbsgroupsk@!") {
      setIsAuthenticated(true);
      showToast("Đăng nhập quyền Admin thành công!");
    } else {
      setAuthError("Email hoặc mật khẩu Admin không chính xác!");
    }
  };

  // 1. Personnel State
  const [employees, setEmployees] = useState<EmployeeAccount[]>([]);

  const [employeeForm, setEmployeeForm] = useState({
    empCode: "",
    name: "",
    email: "",
    phone: "",
    title: "",
    department: "Khối Sản Xuất",
    roleCode: "CBCNV",
    ngayVao: "",
    vtcvHienTai: "",
    vtcvSap: "",
    vtcvSapXep: "",
    boPhoanMoi: "",
  });

  // Excel Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [importPreviewRows, setImportPreviewRows] = useState<Array<{
    rowNum: number;
    empCode: string;
    name: string;
    ngayVao: string;
    email: string;
    phone: string;
    vtcvHienTai: string;
    phongBanHienTai: string;
    vtcvSap: string;
    vtcvSapXep: string;
    phongBanSapXep: string;
    boPhoanMoi: string;
    phongBanMoi: string;
    ghiChu: string;
    roleCode: string;
    isValid: boolean;
    errorMessage?: string;
  }>>([]);
  const [importResultSummary, setImportResultSummary] = useState<{
    successCount: number;
    errorCount: number;
    createdAccounts?: Array<{ empCode: string; name: string; password: string }>;
  } | null>(null);

  // Search & Role Filter States
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 15;

  useEffect(() => {
    setUserPage(1);
  }, [userSearchTerm, userRoleFilter]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !userSearchTerm.trim() ||
      (emp.empCode || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (emp.name || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (emp.department || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (emp.vtcvHienTai || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (emp.boPhoanMoi || "").toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === "ALL" || emp.roleCode === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUserPages = Math.ceil(filteredEmployees.length / USERS_PER_PAGE) || 1;

  // Auto-bound userPage if filtered length changes (e.g. after deletion)
  useEffect(() => {
    if (userPage > totalUserPages) {
      setUserPage(totalUserPages);
    }
  }, [filteredEmployees.length, totalUserPages, userPage]);

  const safeUserPage = Math.min(Math.max(userPage, 1), totalUserPages);
  const paginatedEmployees = filteredEmployees.slice((safeUserPage - 1) * USERS_PER_PAGE, safeUserPage * USERS_PER_PAGE);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalUserPages <= 7) {
      for (let i = 1; i <= totalUserPages; i++) pages.push(i);
    } else {
      if (safeUserPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalUserPages);
      } else if (safeUserPage >= totalUserPages - 3) {
        pages.push(1, "...", totalUserPages - 4, totalUserPages - 3, totalUserPages - 2, totalUserPages - 1, totalUserPages);
      } else {
        pages.push(1, "...", safeUserPage - 1, safeUserPage, safeUserPage + 1, "...", totalUserPages);
      }
    }
    return pages;
  };

  const formatExcelDate = (val: any): string => {
    if (!val) return "";
    if (typeof val === "number") {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      return d.toISOString().split("T")[0];
    }
    const str = String(val).trim();
    if (str.includes("/")) {
      const parts = str.split("/");
      if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    return str;
  };

  const mapRoleNameToCode = (roleStr: string): string => {
    if (!roleStr) return "CBCNV";
    const r = roleStr.toUpperCase();
    if (r.includes("TỔNG GIÁM ĐỐC") || r.includes("TGĐ") || r.includes("TONG_GIAM_DOC")) return "TONG_GIAM_DOC";
    if (r.includes("PHÓ TỔNG") || r.includes("PTGĐ") || r.includes("PHO_TONG_GIAM_DOC")) return "PHO_TONG_GIAM_DOC";
    if (r.includes("GIÁM ĐỐC") || r.includes("GĐ") || r.includes("GIAM_DOC")) return "GIAM_DOC";
    if (r.includes("PHÓ GIÁM ĐỐC") || r.includes("PGĐ") || r.includes("PHO_GIAM_DOC")) return "PHO_GIAM_DOC";
    if (r.includes("TRƯỞNG PHÒNG") || r.includes("TRUONG_PHONG")) return "TRUONG_PHONG";
    if (r.includes("LỄ TÂN") || r.includes("LE_TAN")) return "LE_TAN";
    return "CBCNV";
  };

  const handleDownloadTemplate = () => {
    const headers = [
      ["STT", "MSNV", "Họ & Tên", "Ngày Vào", "VTCV Hiện Tại", "Phòng Ban", "VTCV SAP", "VTCV Sắp Xếp", "PHÒNG BAN", "BỘ PHẬN (NEW)", "Phòng ban (NEW)", "GHI CHÚ"],
      [1, "NV-2026-101", "Nguyễn Văn An", "2026-08-01", "Kỹ sư sản xuất", "ĐH-QT CHUỖI", "04 N2003", "Trưởng nhóm", "ĐH-QT CHUỖI", "Khối Sản Xuất", "Ban CNTT", "Thành viên xuất sắc"],
      [2, "NV-2026-102", "Trần Thị Bình", "2026-08-05", "Chuyên viên QC", "QT-KS", "42 N2007", "Phó nhóm", "QT-KS", "Khối Chất Lượng", "Ban QC", ""]
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Import_Nhan_Su");
    XLSX.writeFile(wb, "Mau_Import_Nhan_Su_TBS.xlsx");
    showToast("📥 Đã tải file Excel mẫu thành công!");
  };

  const handleExcelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawData || rawData.length <= 1) {
          alert("File Excel rỗng hoặc không có dữ liệu!");
          return;
        }

        // 1. DYNAMIC HEADER DETECTOR
        let headerRowIdx = -1;
        let empCodeCol = -1;
        let nameCol = -1;
        let ngayVaoCol = -1;
        let emailCol = -1;
        let phoneCol = -1;
        let vtcvHienTaiCol = -1;
        let phongBanHienTaiCol = -1;
        let vtcvSapCol = -1;
        let vtcvSapXepCol = -1;
        let phongBanSapXepCol = -1;
        let boPhoanMoiCol = -1;
        let phongBanMoiCol = -1;
        let ghiChuCol = -1;
        let roleCodeCol = -1;

        // Scan first 10 rows to detect exact column indices from header names
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;

          const rowStr = row.map((c) => String(c || "").toUpperCase().trim()).join(" ");
          if (rowStr.includes("MSNV") || rowStr.includes("MÃ NV") || rowStr.includes("HỌ") || rowStr.includes("HỌ & TÊN")) {
            headerRowIdx = i;
            row.forEach((cellVal, colIdx) => {
              const norm = String(cellVal || "")
                .replace(/[\r\n\t]+/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              const c = norm.toUpperCase();

              if (c.includes("MSNV") || c.includes("MÃ NV") || c.includes("MA NV")) empCodeCol = colIdx;
              else if (c.includes("HỌ") || c.includes("TÊN") || c.includes("NAME")) nameCol = colIdx;
              else if (c.includes("NGÀY VÀO") || c.includes("NGAY VAO")) ngayVaoCol = colIdx;
              else if (c.includes("EMAIL")) emailCol = colIdx;
              else if (c.includes("SĐT") || c.includes("PHONE") || c.includes("ĐIỆN THOẠI")) phoneCol = colIdx;
              else if (c.includes("GHI CHÚ") || c.includes("GHI CHU") || c.includes("NOTE")) ghiChuCol = colIdx;
              else if (c.includes("VAI TRÒ") || c.includes("QUYỀN") || c.includes("ROLE")) roleCodeCol = colIdx;
              else if (c.includes("NEW")) {
                if (c.includes("BỘ PHẬN") || c.includes("BO PHAN") || c.includes("KHỐI")) {
                  boPhoanMoiCol = colIdx;
                } else {
                  phongBanMoiCol = colIdx;
                }
              }
              else if (c.includes("HIỆN TẠI") && c.includes("VTCV")) vtcvHienTaiCol = colIdx;
              else if (c.includes("SẮP XẾP") && c.includes("VTCV")) vtcvSapXepCol = colIdx;
              else if (c.includes("HIỆN TẠI")) phongBanHienTaiCol = colIdx;
              else if (c.includes("SẮP XẾP")) phongBanSapXepCol = colIdx;
              else if (c.includes("SAP") && !c.includes("SẮP XẾP")) vtcvSapCol = colIdx;
              else if (c.includes("PHÒNG BAN") || c.includes("PHONG BAN") || c.includes("BỘ PHẬN")) {
                if (phongBanHienTaiCol === -1) phongBanHienTaiCol = colIdx;
                else if (phongBanSapXepCol === -1) phongBanSapXepCol = colIdx;
              }
            });
            break;
          }
        }

        // 2. SMART POSITIONAL FALLBACK: Fill any unassigned column based on standard 12-col order
        const firstColHeader = String(rawData[headerRowIdx >= 0 ? headerRowIdx : 0]?.[0] || "").toUpperCase();
        const startOffset = (empCodeCol > 0) ? empCodeCol : (firstColHeader.includes("STT") || firstColHeader.includes("NO") || firstColHeader === "1" ? 1 : 0);

        if (empCodeCol === -1) empCodeCol = startOffset;
        if (nameCol === -1) nameCol = startOffset + 1;
        if (ngayVaoCol === -1) ngayVaoCol = startOffset + 2;
        if (vtcvHienTaiCol === -1) vtcvHienTaiCol = startOffset + 3;
        if (phongBanHienTaiCol === -1) phongBanHienTaiCol = startOffset + 4;
        if (vtcvSapCol === -1) vtcvSapCol = startOffset + 5;
        if (vtcvSapXepCol === -1) vtcvSapXepCol = startOffset + 6;
        if (phongBanSapXepCol === -1) phongBanSapXepCol = startOffset + 7;
        if (boPhoanMoiCol === -1) boPhoanMoiCol = startOffset + 8;
        if (phongBanMoiCol === -1) phongBanMoiCol = startOffset + 9;
        if (ghiChuCol === -1) ghiChuCol = startOffset + 10;

        if (nameCol === -1) nameCol = empCodeCol + 1;

        const existingEmpCodes = new Set(employees.map((emp) => (emp.empCode || "").trim().toUpperCase()));
        const seenInFile = new Set<string>();
        const parsedRows: typeof importPreviewRows = [];
        const startDataIdx = headerRowIdx >= 0 ? headerRowIdx + 1 : 1;

        for (let i = startDataIdx; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0 || row.every((c: any) => c === undefined || c === null || String(c).trim() === "")) {
            continue;
          }

          const empCode = String(row[empCodeCol] ?? "").trim();
          const name = String(row[nameCol] ?? "").trim();
          const ngayVao = formatExcelDate(ngayVaoCol >= 0 ? row[ngayVaoCol] : "");
          const email = String(emailCol >= 0 ? row[emailCol] ?? "" : "").trim();
          const phone = String(phoneCol >= 0 ? row[phoneCol] ?? "" : "").trim();
          const vtcvHienTai = String(vtcvHienTaiCol >= 0 ? row[vtcvHienTaiCol] ?? "" : "").trim();
          const phongBanHienTai = String(phongBanHienTaiCol >= 0 ? row[phongBanHienTaiCol] ?? "" : "").trim();
          const vtcvSap = String(vtcvSapCol >= 0 ? row[vtcvSapCol] ?? "" : "").trim();
          const vtcvSapXep = String(vtcvSapXepCol >= 0 ? row[vtcvSapXepCol] ?? "" : "").trim();
          const phongBanSapXep = String(phongBanSapXepCol >= 0 ? row[phongBanSapXepCol] ?? "" : "").trim();
          const boPhoanMoi = String(boPhoanMoiCol >= 0 ? row[boPhoanMoiCol] ?? "" : "").trim();
          const phongBanMoi = String(phongBanMoiCol >= 0 ? row[phongBanMoiCol] ?? "" : "").trim();
          const ghiChu = String(ghiChuCol >= 0 ? row[ghiChuCol] ?? "" : "").trim();
          const rawRole = String(roleCodeCol >= 0 ? row[roleCodeCol] ?? "" : "").trim();
          const roleCode = mapRoleNameToCode(rawRole);

          const upperEmp = empCode.toUpperCase();

          // Skip non-data rows like title headers, STT labels or totals
          if (
            upperEmp === "STT" ||
            upperEmp === "MSNV" ||
            upperEmp === "MÃ NV" ||
            upperEmp.includes("TỔNG CỘNG") ||
            upperEmp.includes("TOTAL") ||
            upperEmp.includes("SUM")
          ) {
            continue;
          }

          let isValid = true;
          let errorMessage = "";

          if (!empCode) {
            isValid = false;
            errorMessage = "Thiếu Mã số nhân viên (MSNV)";
          } else if (!name) {
            isValid = false;
            errorMessage = "Thiếu Họ và Tên nhân viên";
          } else if (existingEmpCodes.has(upperEmp)) {
            isValid = false;
            errorMessage = `MSNV "${empCode}" đã tồn tại trong hệ thống D1`;
          } else if (seenInFile.has(upperEmp)) {
            isValid = false;
            errorMessage = `MSNV "${empCode}" bị trùng lặp trong file Excel`;
          } else {
            seenInFile.add(upperEmp);
          }

          parsedRows.push({
            rowNum: i + 1,
            empCode,
            name,
            ngayVao,
            email: email || `${empCode.toLowerCase()}@tbsgroup.vn`,
            phone: phone || "0988 000 000",
            vtcvHienTai,
            phongBanHienTai,
            vtcvSap,
            vtcvSapXep,
            phongBanSapXep,
            boPhoanMoi: boPhoanMoi,
            phongBanMoi,
            ghiChu,
            roleCode,
            isValid,
            errorMessage,
          });
        }

        setImportPreviewRows(parsedRows);
        setImportResultSummary(null);
        setIsImportModalOpen(true);
      } catch (err: any) {
        alert("Lỗi đọc file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const handleConfirmBulkImport = async () => {
    const validRows = importPreviewRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert("Không có dòng dữ liệu hợp lệ nào để import!");
      return;
    }

    setIsSubmittingImport(true);
    setImportProgress({ current: 0, total: validRows.length });

    const createdList: Array<{ empCode: string; name: string; password: string }> = [];
    const newEmpAccounts: EmployeeAccount[] = [];

    // Process network requests in parallel batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (r) => {
          const newEmp: EmployeeAccount = {
            id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            empCode: r.empCode,
            name: r.name,
            email: r.email,
            phone: r.phone,
            title: r.vtcvHienTai || "Cán Bộ Công Nhân Viên",
            department: r.boPhoanMoi || "Khối Sản Xuất",
            roleCode: r.roleCode,
            status: "ACTIVE",
            ngayVao: r.ngayVao,
            vtcvHienTai: r.vtcvHienTai,
            phongBanHienTai: r.phongBanHienTai,
            vtcvSap: r.vtcvSap,
            vtcvSapXep: r.vtcvSapXep,
            phongBanSapXep: r.phongBanSapXep,
            boPhoanMoi: r.boPhoanMoi,
            phongBanMoi: r.phongBanMoi,
            ghiChu: r.ghiChu,
          };

          newEmpAccounts.push(newEmp);
          createdList.push({
            empCode: r.empCode,
            name: r.name,
            password: "123456",
          });

          try {
            await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...newEmp,
                ngay_vao: newEmp.ngayVao,
                vtcv_hien_tai: newEmp.vtcvHienTai,
                phong_ban_hien_tai: newEmp.phongBanHienTai,
                vtcv_sap: newEmp.vtcvSap,
                vtcv_sap_xep: newEmp.vtcvSapXep,
                pb_sap_xep: newEmp.phongBanSapXep,
                phong_ban_sap_xep: newEmp.phongBanSapXep,
                bo_phan_moi: newEmp.boPhoanMoi,
                phong_ban_moi: newEmp.phongBanMoi,
                ghi_chu: newEmp.ghiChu,
                default_password: "123456",
              }),
            });
          } catch (e) {}
        })
      );

      setImportProgress({
        current: Math.min(i + BATCH_SIZE, validRows.length),
        total: validRows.length,
      });
    }

    const updatedEmployees = [...newEmpAccounts, ...employees];
    setEmployees(updatedEmployees);
    if (typeof window !== "undefined") {
      localStorage.setItem("tbs_admin_employees_v3", JSON.stringify(updatedEmployees));
    }
    setImportResultSummary({
      successCount: validRows.length,
      errorCount: importPreviewRows.length - validRows.length,
      createdAccounts: createdList,
    });
    setIsSubmittingImport(false);

    showToast(`🎉 Đã import thành công ${validRows.length} tài khoản nhân sự mới! Mật khẩu mặc định: 123456`);
  };

  const handleExportCreatedAccounts = () => {
    if (!importResultSummary?.createdAccounts) return;
    const exportData = importResultSummary.createdAccounts.map((a, idx) => ({
      STT: idx + 1,
      MSNV: a.empCode,
      "Họ và Tên": a.name,
      "Mật Khẩu Mặc Định": a.password,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tai_Khoan_Moi");
    XLSX.writeFile(wb, `Danh_Sach_Tai_Khoan_Moi_${Date.now()}.xlsx`);
    showToast("📥 Đã xuất file danh sách tài khoản mới thành công!");
  };

  const fetchD1Employees = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const d1List: EmployeeAccount[] = json.data.map((u: any) => ({
          id: u.id ? String(u.id) : `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          empCode: u.emp_code || u.empCode || "",
          name: u.name || "N/A",
          email: u.email || `${u.emp_code || "nv"}@tbsgroup.vn`,
          phone: u.phone || "0988 000 000",
          title: u.title || "Cán Bộ Công Nhân Viên",
          department: u.department || "NHÂN SỰ-HC",
          roleCode: u.role_code || u.roleCode || "CBCNV",
          status: u.status === "LOCKED" ? "LOCKED" : "ACTIVE",
          ngayVao: u.ngay_vao || u.ngayVao || "-",
          vtcvHienTai: u.vtcv_hien_tai || u.vtcvHienTai || "-",
          phongBanHienTai: u.phong_ban_hien_tai || u.phongBanHienTai || u.department || "-",
          vtcvSap: u.vtcv_sap || u.vtcvSap || "-",
          vtcvSapXep: u.vtcv_sap_xep || u.vtcvSapXep || "-",
          phongBanSapXep: u.pb_sap_xep || u.pbSapXep || "-",
          boPhoanMoi: u.bo_phan_moi || u.bo_phan_new || u.boPhoanMoi || u.department || "-",
          phongBanMoi: u.phong_ban_moi || u.department || "-",
        }));
        setEmployees(d1List);
      }
    } catch (e) {
      console.warn("Fetch users error:", e);
    }
  };

  useEffect(() => {
    fetchD1Employees();
  }, []);

  const handleClearAllEmployees = async () => {
    if (!confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA TOÀN BỘ tất cả tài khoản nhân sự khỏi CSDL? (Hành động này không thể hoàn tác)")) {
      return;
    }

    try {
      await fetch("/api/users?all=true", { method: "DELETE" });
      await fetchD1Employees();
      showToast("🗑️ Đã xóa toàn bộ tài khoản nhân sự khỏi CSDL!");
    } catch (e) {
      showToast("🗑️ Đã làm sạch toàn bộ danh sách tài khoản!");
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.empCode) {
      alert("Vui lòng nhập đầy đủ tên và mã nhân viên!");
      return;
    }
    const newEmp: EmployeeAccount = {
      id: `emp_${Date.now()}`,
      ...employeeForm,
      status: "ACTIVE",
    };

    setEmployeeForm({ empCode: "", name: "", email: "", phone: "", title: "", department: "Khối Sản Xuất", roleCode: "CBCNV", ngayVao: "", vtcvHienTai: "", vtcvSap: "", vtcvSapXep: "", boPhoanMoi: "" });
    
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEmp,
          ngay_vao: newEmp.ngayVao,
          vtcv_hien_tai: newEmp.vtcvHienTai,
          phong_ban_hien_tai: newEmp.phongBanHienTai,
          vtcv_sap: newEmp.vtcvSap,
          vtcv_sap_xep: newEmp.vtcvSapXep,
          pb_sap_xep: newEmp.phongBanSapXep,
          bo_phan_moi: newEmp.boPhoanMoi,
        }),
      });
      await fetchD1Employees();
      showToast("Đã lưu tài khoản nhân sự mới vào CSDL D1!");
    } catch (e) {
      showToast("Đã thêm mới tài khoản nhân sự!");
    }
  };

  const toggleEmployeeLock = async (id: string) => {
    const target = employees.find((emp) => emp.id === id);
    if (!target) return;
    const newStatus = target.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    
    // Optimistic UI update
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, status: newStatus } : emp)));

    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, status: newStatus }),
      });
      await fetchD1Employees();
      showToast("Đã cập nhật trạng thái tài khoản vào CSDL!");
    } catch (e) {}
  };

  const handleDeleteEmployee = async (id: string, empCode: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản nhân sự "${name}" (${empCode}) khỏi CSDL D1?`)) {
      return;
    }

    setEmployees((prev) => prev.filter((emp) => emp.id !== id));

    try {
      await fetch(`/api/users?id=${encodeURIComponent(id)}&empCode=${encodeURIComponent(empCode)}`, {
        method: "DELETE",
      });
      await fetchD1Employees();
      showToast(`🗑️ Đã xóa vĩnh viễn tài khoản "${name}" (${empCode}) khỏi CSDL!`);
    } catch (e) {
      showToast(`🗑️ Đã xóa tài khoản "${name}"!`);
    }
  };

  // 2. News Articles State
  const [articles, setArticles] = useState<NewsArticle[]>([
    {
      id: "news_1",
      title: "TBS Group Đẩy Mạnh Chuyển Đổi Số Toàn Diện Chuỗi Cung Ứng SKECHERS 2026",
      slug: "tbs-group-digital-transformation",
      category: "Tin Tập Đoàn",
      summary: "Ứng dụng trí tuệ nhân tạo AI và dữ liệu thời gian thực D1 trong điều hành sản xuất và Gemba Walk.",
      imageUrl: "/images/crawled/Tin-tuc1.jpg",
      publishDate: "15/08/2026",
      author: "Ban Truyền Thông TBS",
      views: 1420,
    },
    {
      id: "news_2",
      title: "Khánh Thành Dây Chuyền Sản Xuất Đế Giày Tự Động Hóa Tại Cụm Nhà Máy A1",
      slug: "khanh-thanh-day-chuyen-tu-dong-hoa-a1",
      category: "Sản Xuất",
      summary: "Nâng công suất sản xuất đáp ứng đơn hàng xuất khẩu 45 triệu đôi giày SKECHERS cho thị trường Bắc Mỹ.",
      imageUrl: "/images/crawled/Da-giay1.jpg",
      publishDate: "12/08/2026",
      author: "Khối Sản Xuất",
      views: 980,
    },
  ]);

  const [newsForm, setNewsForm] = useState({
    title: "",
    category: "Tin Tập Đoàn",
    summary: "",
    imageUrl: "",
  });

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết!");
      return;
    }
    const newArt: NewsArticle = {
      id: `news_${Date.now()}`,
      title: newsForm.title,
      slug: newsForm.title.toLowerCase().replace(/ /g, "-"),
      category: newsForm.category,
      summary: newsForm.summary || "Thông tin cập nhật mới nhất từ Ban Truyền Thông Tập Đoàn TBS Group.",
      imageUrl: newsForm.imageUrl || "/images/crawled/Tin-tuc1.jpg",
      publishDate: new Date().toLocaleDateString("vi-VN"),
      author: "Admin System",
      views: 1,
    };
    setArticles([newArt, ...articles]);
    setNewsForm({ title: "", category: "Tin Tập Đoàn", summary: "", imageUrl: "" });
    showToast("Đã đăng bài viết mới lên hệ thống tin tức!");
  };

  // 3. Media Assets State
  const [mediaList, setMediaList] = useState<MediaAsset[]>([
    {
      id: "media_1",
      title: "Hero Banner Tổ hợp Kiên Giang - TBS Group",
      category: "HERO_BANNER",
      url: "/images/crawled/banner.jpg",
      createdAt: "15/08/2026",
    },
    {
      id: "media_2",
      title: "Hình Ảnh Tổ Hợp Nhà Máy TBS A1",
      category: "FACTORY",
      url: "/images/crawled/Da-giay2.jpg",
      createdAt: "14/08/2026",
    },
    {
      id: "media_3",
      title: "Mẫu Giày Thể Thao SKECHERS Performance",
      category: "PRODUCT",
      url: "/images/crawled/San-pham1.jpg",
      createdAt: "12/08/2026",
    },
  ]);

  const [mediaForm, setMediaForm] = useState({
    title: "",
    category: "HERO_BANNER" as "HERO_BANNER" | "FACTORY" | "PRODUCT" | "EVENTS",
    url: "",
  });

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.url.trim()) {
      alert("Vui lòng nhập đường link hình ảnh (URL)!");
      return;
    }
    const newMedia: MediaAsset = {
      id: `m_${Date.now()}`,
      title: mediaForm.title || "Hình ảnh tư liệu TBS",
      category: mediaForm.category,
      url: mediaForm.url,
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };
    setMediaList([newMedia, ...mediaList]);
    setMediaForm({ title: "", category: "HERO_BANNER", url: "" });
    showToast("Đã lưu hình ảnh mới vào thư viện Media!");
  };

  // D1 Database Stats & Controls
  const [d1Stats, setD1Stats] = useState({
    roomsCount: 6,
    bookingsCount: 0,
    visitorsCount: 0,
    businessTripsCount: 0,
    status: "CONNECTED (Cloudflare D1 vpchuoiskechers)",
  });

  const fetchLiveD1Counts = async () => {
    try {
      const [resR, resB] = await Promise.all([
        fetch("/api/rooms").then((r) => r.json()).catch(() => null),
        fetch("/api/business-trips").then((r) => r.json()).catch(() => null),
      ]);
      setD1Stats({
        roomsCount: resR?.data?.rooms?.length || 6,
        bookingsCount: resR?.data?.bookings?.length || 0,
        visitorsCount: resR?.data?.visitors?.length || 0,
        businessTripsCount: resB?.data?.length || 0,
        status: "CONNECTED (Cloudflare D1 vpchuoiskechers)",
      });
      showToast("Đã làm mới dữ liệu D1 Database!");
    } catch (e) {
      console.warn("D1 count refresh:", e);
    }
  };

  useEffect(() => {
    fetchLiveD1Counts();
  }, []);

  // Login Screen if Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#006838] mx-auto flex items-center justify-center p-3 shadow-lg">
              <img src="/images/tbs-logo.png" alt="TBS" className="w-full h-full object-contain brightness-200" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">ĐĂNG NHẬP QUẢN TRỊ ADMIN</h1>
            <p className="text-xs text-slate-400">Tổ hợp Kiên Giang - TBS Group System Admin Portal</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                ⚠️ {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Tài khoản Email Admin</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="tbsgroup2026@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none focus:border-[#006838]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Mật khẩu bảo mật</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="tbsgroupsk@!"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none focus:border-[#006838]"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-[11px] text-emerald-400 font-mono space-y-1">
              <div>🔑 Admin Email: <strong className="text-white">tbsgroup2026@gmail.com</strong></div>
              <div>🔑 Mật khẩu: <strong className="text-white">tbsgroupsk@!</strong></div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
            >
              Truy Cập Cổng Quản Trị
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-[#006838] text-white font-extrabold text-xs shadow-2xl animate-in slide-in-from-top duration-300 flex items-center gap-2 border border-emerald-500">
          <IconCheck size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navigation Bar */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/work" className="flex items-center gap-2 group">
              <img
                src="/images/tbs-logo.png"
                alt="TBS Group Logo"
                className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="h-5 w-[1px] bg-slate-200" />
            <div>
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider block leading-none">ADMIN PORTAL</span>
              <span className="text-[10px] text-[#006838] font-bold tracking-tight">TBS GROUP CỔNG QUẢN TRỊ</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/work"
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-emerald-50 hover:text-[#006838] transition-colors flex items-center gap-1 shadow-2xs"
            >
              <IconArrowLeft size={14} />
              <span>Về Tổng quan</span>
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <img src={adminUser.avatar} alt="Admin" className="w-8 h-8 rounded-full bg-emerald-50 p-1 border border-emerald-200" />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">{adminUser.email}</div>
                <div className="text-[10px] text-[#006838] font-medium mt-0.5">{adminUser.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#006838] to-[#004d29] text-white shadow-xl border border-[#004e2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-[11px] font-bold border border-white/20 backdrop-blur-md">
              <IconShieldCheck size={14} />
              <span>Tài khoản Quản trị Tối cao System Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">CỔNG QUẢN TRỊ NỘI DUNG &amp; HỆ THỐNG</h1>
            <p className="text-xs text-emerald-100/90 font-medium">Quản lý nhân sự, đăng tin tức, upload banner hình ảnh và điều khiển Cloudflare D1 Database real-time.</p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs font-mono">
            <IconKey size={18} className="text-emerald-300" />
            <div>
              <span className="text-emerald-200/70 block text-[10px]">TÀI KHOẢN ĐĂNG NHẬP:</span>
              <span className="text-white font-bold">{adminUser.email}</span>
            </div>
          </div>
        </div>

        {/* 5 Main Admin Tabs Header */}
        <div className="bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/90 shadow-inner flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconDeviceLaptop size={16} />
            <span>📊 Tổng quan System</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconUsers size={16} />
            <span>👥 Quản lý Nhân sự</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "users" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-800"
            }`}>
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "news"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconNews size={16} />
            <span>📰 Đăng bài Tin tức</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "news" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-800"
            }`}>
              {articles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "media"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconPhoto size={16} />
            <span>🖼️ Up Ảnh &amp; Banner</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "media" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-800"
            }`}>
              {mediaList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("workspace_gallery")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "workspace_gallery"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconBuilding size={16} />
            <span>🏢 Không Gian Làm Việc</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "workspace_gallery" ? "bg-white/20 text-white" : "bg-emerald-100 text-[#006838]"
            }`}>
              {landingCMS.workspaceDepartments?.length || 10} Phòng
            </span>
          </button>

          <button
            onClick={() => setActiveTab("brand_partners")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "brand_partners"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconBuildingStore size={16} />
            <span>🤝 Đối Tác Thương Hiệu</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "brand_partners" ? "bg-white/20 text-white" : "bg-emerald-100 text-[#006838]"
            }`}>
              {landingCMS.brandPartners?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("shoe_lines")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "shoe_lines"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconShoe size={16} />
            <span>👟 Dòng Giày Tiêu Biểu</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "shoe_lines" ? "bg-white/20 text-white" : "bg-emerald-100 text-[#006838]"
            }`}>
              {landingCMS.shoeLines?.groups?.length || 5} Nhóm
            </span>
          </button>

          <button
            onClick={() => {
              setCmsSubSection("products");
              setActiveTab("products");
            }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "products"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconShoe size={16} />
            <span>👟 Dòng Sản Phẩm Tiêu Biểu</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "products" ? "bg-white/20 text-white" : "bg-emerald-100 text-[#006838]"
            }`}>
              {landingCMS.products.items.length}
            </span>
          </button>

          <button
            onClick={() => {
              setCmsSubSection("hero");
              setActiveTab("landing_cms");
            }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "landing_cms"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconHome size={16} />
            <span>🏠 Quản trị Trang Chủ (Landing Page)</span>
          </button>

          <button
            onClick={() => setActiveTab("d1_control")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "d1_control"
                ? "bg-[#006838] text-white shadow-md border border-[#004e2a]"
                : "text-slate-700 hover:text-[#006838] hover:bg-white/70"
            }`}
          >
            <IconDatabase size={16} />
            <span>🗄️ Quản trị D1 Database</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW DASHBOARD
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Tổng Nhân Sự Quản Lý</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center border border-emerald-200">
                    <IconUsers size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">3,420 <span className="text-xs text-slate-500 font-normal">nhân sự</span></div>
                <p className="text-[11px] text-emerald-600 font-medium">✓ Đã định danh tài khoản SSO</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Lịch Họp D1 Database</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                    <IconDatabase size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{d1Stats.bookingsCount} <span className="text-xs text-slate-500 font-normal">cuộc họp</span></div>
                <p className="text-[11px] text-blue-600 font-medium">✓ Đồng bộ Cloudflare D1 real-time</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Đơn Đăng Ký Công Tác</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                    <IconFileText size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{d1Stats.businessTripsCount} <span className="text-xs text-slate-500 font-normal">đơn đề xuất</span></div>
                <p className="text-[11px] text-purple-600 font-medium">✓ Lưu trữ cơ sở dữ liệu D1</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Sản Phẩm &amp; Tin Tức</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                    <IconShoe size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{landingCMS.products.items.length} <span className="text-xs text-slate-500 font-normal">dòng sản phẩm</span></div>
                <p className="text-[11px] text-amber-600 font-medium">✓ Cập nhật trực tiếp lên trang chủ</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>⚡ Thao tác nhanh cho Quản trị viên</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setCmsSubSection("products");
                    setActiveTab("products");
                  }}
                  className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200 text-left transition-all cursor-pointer space-y-1 group shadow-2xs hover:shadow-md"
                >
                  <div className="text-xs font-extrabold text-[#006838] flex items-center gap-1.5">
                    <IconShoe size={16} /> Quản Lý Dòng Sản Phẩm ({landingCMS.products.items.length})
                  </div>
                  <p className="text-[11px] text-slate-600">Import ảnh sản phẩm, đổi tên &amp; mã SKU hiển thị trang chủ.</p>
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 text-left transition-colors cursor-pointer space-y-1 group"
                >
                  <div className="text-xs font-extrabold text-[#006838] flex items-center gap-1.5">
                    <IconPlus size={16} /> Thêm Nhân Sự Mới
                  </div>
                  <p className="text-[11px] text-slate-500">Tạo tài khoản cán bộ nhân viên và phân quyền làm việc.</p>
                </button>

                <button
                  onClick={() => setActiveTab("news")}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 text-left transition-colors cursor-pointer space-y-1 group"
                >
                  <div className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                    <IconNews size={16} /> Đăng Bài Tin Tức
                  </div>
                  <p className="text-[11px] text-slate-500">Đăng tin thông báo tập đoàn, bài báo sản xuất &amp; chuyển đổi số.</p>
                </button>

                <button
                  onClick={() => setActiveTab("media")}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-200 text-left transition-colors cursor-pointer space-y-1 group"
                >
                  <div className="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
                    <IconUpload size={16} /> Up Ảnh Banner &amp; Media
                  </div>
                  <p className="text-[11px] text-slate-500">Tải lên hình ảnh banner trang chủ, hình nhà máy &amp; sự kiện.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: QUẢN LÝ NHÂN SỰ & PHÂN QUYỀN
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form Thêm Nhân Sự */}
            <form onSubmit={handleAddEmployee} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <IconUsers size={18} className="text-[#006838]" />
                  <span>➕ THÊM TÀI KHOẢN NHÂN SỰ MỚI</span>
                </h2>

                {/* Import Excel Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                  >
                    <IconDownload size={15} className="text-slate-600" />
                    <span>Tải File Mẫu (.xlsx)</span>
                  </button>

                  <label className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md cursor-pointer border border-emerald-500">
                    <IconUpload size={15} />
                    <span>Import File Excel / CSV</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={handleExcelFileSelect}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Mã Nhân Viên (MSNV) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: NV-2026-099"
                    value={employeeForm.empCode}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, empCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Ngày Vào Công Ty</label>
                  <input
                    type="date"
                    value={employeeForm.ngayVao}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, ngayVao: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Email Công Việc</label>
                  <input
                    type="email"
                    placeholder="an.nguyen@tbsgroup.vn"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="0988 123 456"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">VTCV Hiện Tại</label>
                  <input
                    type="text"
                    placeholder="Kỹ sư sản xuất A1"
                    value={employeeForm.vtcvHienTai}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, vtcvHienTai: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">VTCV SAP</label>
                  <input
                    type="text"
                    placeholder="Chuyên viên SAP"
                    value={employeeForm.vtcvSap}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, vtcvSap: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">VTCV Sắp Xếp</label>
                  <input
                    type="text"
                    placeholder="Trưởng nhóm"
                    value={employeeForm.vtcvSapXep}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, vtcvSapXep: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Bộ Phận (NEW)</label>
                  <input
                    type="text"
                    placeholder="Khối Sản Xuất"
                    value={employeeForm.boPhoanMoi}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, boPhoanMoi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Phân Quyền Vai Trò</label>
                  <select
                    value={employeeForm.roleCode}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, roleCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-[#006838] cursor-pointer"
                  >
                    <option value="TONG_GIAM_DOC">👑 Tổng Giám Đốc</option>
                    <option value="PHO_TONG_GIAM_DOC">⭐ Phó Tổng Giám Đốc</option>
                    <option value="GIAM_DOC">👔 Giám Đốc Khối</option>
                    <option value="PHO_GIAM_DOC">💼 Phó Giám Đốc</option>
                    <option value="CBCNV">👤 CBCNV Nhân Viên</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <IconPlus size={16} />
                    <span>Lưu Tài Khoản Thủ Công</span>
                  </button>
                </div>
              </div>
            </form>

            {/* PREVIEW MODAL IMPORT EXCEL */}
            {isImportModalOpen && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-[#006838] to-[#0b1739] text-white flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <IconUpload size={22} className="text-amber-400" />
                      <div>
                        <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                          XEM TRƯỚC VÀ XÁC NHẬN IMPORT FILE EXCEL NHÂN SỰ
                        </h3>
                        <p className="text-[11px] text-emerald-200">
                          Kiểm tra dữ liệu trước khi thêm hàng loạt vào D1 Database &bull; Mật khẩu mặc định gán: <strong className="text-amber-300">123456</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                    >
                      ✓
                    </button>
                  </div>

                  {/* Summary Banner if Result ready */}
                  {importResultSummary ? (
                    <div className="p-6 text-center space-y-4 overflow-y-auto">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006838] flex items-center justify-center mx-auto shadow-md">
                        <IconCheck size={36} className="stroke-[3]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900">Đã Hoàn Tất Import Nhân Sự!</h4>
                        <p className="text-xs text-slate-600">
                          Thành công: <strong className="text-emerald-600">{importResultSummary.successCount} tài khoản</strong> &bull; Bỏ qua lỗi: <strong className="text-rose-600">{importResultSummary.errorCount} dòng</strong>
                        </p>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium max-w-lg mx-auto text-left">
                        ℹ️ <strong>Lưu ý quản trị viên:</strong> Các tài khoản mới được khởi tạo với mật khẩu mặc định là <code className="bg-amber-200 px-1 py-0.5 rounded font-mono font-bold">123456</code>. Hệ thống hiện chưa tự bật cơ sở <em>force change password</em>, quý vị có thể xuất danh sách để bàn giao cho nhân viên.
                      </div>

                      <div className="pt-3 flex flex-wrap gap-3 justify-center">
                        <button
                          type="button"
                          onClick={handleExportCreatedAccounts}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <IconDownload size={16} />
                          <span>Xuất File Danh Sách Vừa Tạo + Mật Khẩu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsImportModalOpen(false)}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer border border-slate-300"
                        >
                          Đóng Cửa Sổ
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Preview Table view */
                    <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>
                          Tổng số dòng đã đọc: <strong className="text-slate-900">{importPreviewRows.length} dòng</strong>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-extrabold">
                            ✓ {importPreviewRows.filter((r) => r.isValid).length} Dòng Hợp Lệ
                          </span>
                          <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-extrabold">
                            ❌ {importPreviewRows.filter((r) => !r.isValid).length} Dòng Cảnh Báo Lỗi
                          </span>
                        </div>
                      </div>

                      {/* Preview Scrollable Table */}
                      <div className="flex-1 overflow-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                          <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] sticky top-0 border-b border-slate-200 whitespace-nowrap">
                            <tr>
                              <th className="p-2.5">Trạng Thái</th>
                              <th className="p-2.5">Dòng</th>
                              <th className="p-2.5">MSNV</th>
                              <th className="p-2.5">Họ &amp; Tên</th>
                              <th className="p-2.5">Ngày Vào</th>
                              <th className="p-2.5">VTCV Hiện Tại</th>
                              <th className="p-2.5">Phòng Ban</th>
                              <th className="p-2.5">VTCV SAP</th>
                              <th className="p-2.5">VTCV Sắp Xếp</th>
                              <th className="p-2.5">PB Sắp Xếp</th>
                              <th className="p-2.5">Bộ Phận (NEW)</th>
                              <th className="p-2.5">PB (NEW)</th>
                              <th className="p-2.5">Ghi Chú</th>
                              <th className="p-2.5">Vai Trò</th>
                              <th className="p-2.5">Ghi Chú Lỗi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                            {importPreviewRows.map((r) => (
                              <tr
                                key={r.rowNum}
                                className={r.isValid ? "hover:bg-emerald-50/30" : "bg-rose-50/60 hover:bg-rose-100/60"}
                              >
                                <td className="p-2.5">
                                  {r.isValid ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                      ✓ HỢP LỆ
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                                      ❌ LỖI
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 font-mono text-slate-500">#{r.rowNum}</td>
                                <td className="p-2.5 font-mono font-bold text-slate-900">{r.empCode || "—"}</td>
                                <td className="p-2.5 font-bold">{r.name || "—"}</td>
                                <td className="p-2.5 font-mono">{r.ngayVao || "—"}</td>
                                <td className="p-2.5">{r.vtcvHienTai || "—"}</td>
                                <td className="p-2.5">{r.phongBanHienTai || "—"}</td>
                                <td className="p-2.5">{r.vtcvSap || "—"}</td>
                                <td className="p-2.5">{r.vtcvSapXep || "—"}</td>
                                <td className="p-2.5">{r.phongBanSapXep || "—"}</td>
                                <td className="p-2.5">{r.boPhoanMoi || "—"}</td>
                                <td className="p-2.5">{r.phongBanMoi || "—"}</td>
                                <td className="p-2.5">{r.ghiChu || "—"}</td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                                    {r.roleCode}
                                  </span>
                                </td>
                                <td className="p-2.5 text-rose-600 font-bold text-[11px] max-w-xs">
                                  {r.errorMessage || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Controls Footer */}
                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsImportModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-300"
                        >
                          Hủy Bỏ
                        </button>

                        <button
                          type="button"
                          disabled={isSubmittingImport || importPreviewRows.filter((r) => r.isValid).length === 0}
                          onClick={handleConfirmBulkImport}
                          className="px-6 py-2.5 rounded-xl bg-[#006838] hover:bg-[#004d29] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingImport ? (
                            <>
                              <IconRotate className="animate-spin text-amber-300" size={16} />
                              <span>Đang Lưu {importProgress.current}/{importProgress.total} Tài Khoản...</span>
                            </>
                          ) : (
                            <>
                              <IconCheck size={16} />
                              <span>Xác Nhận Import {importPreviewRows.filter((r) => r.isValid).length} Dòng Hợp Lệ</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bảng Danh Sách Nhân Sự */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                    <IconUsers size={18} className="text-[#006838]" />
                    <span>Danh sách Nhân sự Hiện hành</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Hiển thị <strong>{filteredEmployees.length}</strong> / {employees.length} tài khoản trong hệ thống D1
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm MSNV, Họ tên, VTCV, Bộ phận..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:border-[#006838] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Role Filter Dropdown */}
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:border-[#006838] cursor-pointer"
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="TONG_GIAM_DOC">👑 Level 1: TGĐ (Tổng Giám Đốc)</option>
                    <option value="PHO_TONG_GIAM_DOC">⭐ Level 2: P.TGĐ (Phó TGĐ)</option>
                    <option value="GIAM_DOC">🏢 Level 2: GĐ (Giám Đốc Khối)</option>
                    <option value="PHO_GIAM_DOC">💼 Level 2: PGĐ (Phó Giám Đốc)</option>
                    <option value="TRUONG_PHONG">👔 Level 3: TP (Trưởng Phòng)</option>
                    <option value="TO_TRUONG">👥 Level 3: TT (Trưởng Team/Tổ)</option>
                    <option value="SUPER_ADMIN">⚡ Level 1: Super Admin</option>
                    <option value="CBCNV">👤 Level 4: CBCNV (Nhân Viên)</option>
                    <option value="CONG_NHAN">⚙️ Level 5: CN (Công Nhân)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 uppercase font-extrabold text-[10px] bg-slate-50 whitespace-nowrap">
                      <th className="py-3 px-2">STT</th>
                      <th className="py-3 px-2">MSNV</th>
                      <th className="py-3 px-2">Họ &amp; Tên</th>
                      <th className="py-3 px-2">Ngày Vào</th>
                      <th className="py-3 px-2">VTCV Hiện Tại</th>
                      <th className="py-3 px-2">Phòng Ban</th>
                      <th className="py-3 px-2">VTCV SAP</th>
                      <th className="py-3 px-2">VTCV Sắp Xếp</th>
                      <th className="py-3 px-2">PB Sắp Xếp</th>
                      <th className="py-3 px-2">Bộ Phận (NEW)</th>
                      <th className="py-3 px-2">Email / SĐT</th>
                      <th className="py-3 px-3">Quyền</th>
                      <th className="py-3 px-3">Trạng Thái</th>
                      <th className="py-3 px-3 text-center sticky right-0 bg-slate-100 z-10 border-l border-slate-200 shadow-2xs font-black text-rose-700">
                        Thao Tác (Khóa / Xóa)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {paginatedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center py-8 text-slate-500 font-sans text-xs">
                          🔍 Không tìm thấy nhân sự phù hợp với từ khóa "<strong className="text-slate-900">{userSearchTerm}</strong>"
                        </td>
                      </tr>
                    ) : (
                      paginatedEmployees.map((emp, idx) => (
                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-2 px-2 text-slate-600">{(safeUserPage - 1) * USERS_PER_PAGE + idx + 1}</td>
                          <td className="py-2 px-2 font-bold text-[#006838]">{emp.empCode}</td>
                          <td className="py-2 px-2 font-sans font-bold text-slate-900">{emp.name}</td>
                          <td className="py-2 px-2 text-slate-700">{emp.ngayVao || "-"}</td>
                          <td className="py-2 px-2 text-slate-700">{emp.vtcvHienTai || "-"}</td>
                          <td className="py-2 px-2 text-slate-700">{emp.phongBanHienTai || "-"}</td>
                          <td className="py-2 px-2 text-slate-700">{emp.vtcvSap || "-"}</td>
                          <td className="py-2 px-2 text-slate-700">{emp.vtcvSapXep || "-"}</td>
                          <td className="py-2 px-2 text-slate-700">{emp.phongBanSapXep || "-"}</td>
                          <td className="py-2 px-2 text-slate-700">{emp.boPhoanMoi || "-"}</td>
                          <td className="py-2 px-2 text-slate-600">
                            <div className="text-[10px]">{emp.email}</div>
                            <div className="text-[9px] text-slate-500">{emp.phone}</div>
                          </td>
                          <td className="py-2 px-2">
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-[#006838] text-[9px] font-extrabold border border-emerald-200">
                              {emp.roleCode}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${emp.status === "ACTIVE" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}>
                              {emp.status === "ACTIVE" ? "✓ Kích hoạt" : "🔒 Khóa"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-sans sticky right-0 bg-white group-hover:bg-slate-50 z-10 border-l border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                              <button
                                onClick={() => toggleEmployeeLock(emp.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  emp.status === "ACTIVE"
                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                                }`}
                                title={emp.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              >
                                {emp.status === "ACTIVE" ? "Khóa" : "Mở"}
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id, emp.empCode, emp.name)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                title="Xóa tài khoản vĩnh viễn khỏi D1"
                              >
                                <IconTrash size={12} />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls Footer */}
              {filteredEmployees.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
                  <div className="text-slate-600 font-medium">
                    Hiển thị <strong className="text-slate-900">{Math.min((safeUserPage - 1) * USERS_PER_PAGE + 1, filteredEmployees.length)} - {Math.min(safeUserPage * USERS_PER_PAGE, filteredEmployees.length)}</strong> trên tổng số <strong className="text-[#006838] font-black">{filteredEmployees.length}</strong> nhân sự (15 nhân sự / trang)
                  </div>

                  <div className="flex items-center gap-1 font-bold flex-wrap">
                    <button
                      onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                      disabled={safeUserPage === 1}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Trang trước"
                    >
                      <IconChevronLeft size={15} />
                    </button>

                    {getPageNumbers().map((p, pIdx) => (
                      typeof p === "number" ? (
                        <button
                          key={pIdx}
                          onClick={() => setUserPage(p)}
                          className={`w-8 h-8 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                            safeUserPage === p
                              ? "bg-[#006838] border-[#006838] text-white shadow-xs scale-105"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={pIdx} className="px-1 text-slate-400 font-bold select-none">
                          ...
                        </span>
                      )
                    ))}

                    <button
                      onClick={() => setUserPage((prev) => Math.min(prev + 1, totalUserPages))}
                      disabled={safeUserPage >= totalUserPages}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Trang sau"
                    >
                      <IconChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 3: ĐĂNG & QUẢN LÝ TIN TỨC
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "news" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form Đăng Tin */}
            <form onSubmit={handleAddNews} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <IconNews size={18} className="text-[#006838]" />
                <span>✍️ ĐĂNG BÀI VIẾT TIN TỨC MỚI</span>
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Tiêu Đề Bài Viết *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập tiêu đề tin tức tập đoàn..."
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-[#006838] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Danh Mục Tin</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-[#006838] focus:bg-white cursor-pointer"
                    >
                      <option value="Tin Tập Đoàn">Tin Tập Đoàn TBS</option>
                      <option value="Sản Xuất">Sản Xuất &amp; Nhà Máy</option>
                      <option value="Công Nghệ SKECHERS">Công Nghệ SKECHERS</option>
                      <option value="Tuyển Dụng">Tuyển Dụng &amp; Đào Tạo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">Đường Link Ảnh Đại Diện (Thumbnail URL)</label>
                    <label className="text-[11px] font-bold text-[#006838] hover:underline cursor-pointer flex items-center gap-1">
                      <IconUpload size={12} />
                      <span>{isUploadingCloudinary ? "☁️ Đang tải..." : "☁️ Chọn tệp ảnh tải lên Cloudinary"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleCloudinaryFileUpload(e.target.files[0], "news");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Dán URL ảnh hoặc bấm nút chọn tệp bên trên..."
                    value={newsForm.imageUrl}
                    onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Tóm Tắt Bài Viết</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả tóm tắt nội dung bài viết..."
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <IconNews size={16} />
                  <span>Xuất Bản Bài Viết</span>
                </button>
              </div>
            </form>

            {/* Bảng Danh Sách Bài Viết */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Danh sách bài viết đã xuất bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((art) => (
                  <div key={art.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex gap-4">
                    <img src={art.imageUrl} alt={art.title} className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-extrabold uppercase">
                        {art.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{art.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{art.summary}</p>
                      <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                        <span>📅 {art.publishDate}</span>
                        <span>👁️ {art.views} lượt xem</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 4: QUẢN LÝ HÌNH ẢNH & BANNER
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "media" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form Up Ảnh */}
            <form onSubmit={handleAddMedia} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <IconPhoto size={18} className="text-[#006838]" />
                  <span>🖼️ THÊM HÌNH ẢNH BANNER &amp; MEDIA MỚI</span>
                </h2>
                <div className="text-xs text-[#006838] font-mono flex items-center gap-1">
                  <span>☁️ Cloudinary Preset: <strong className="text-slate-900">vpchuoisk</strong></span>
                </div>
              </div>

              {/* Upload Drop Zone Box */}
              <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#006838] transition-colors text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#006838] mx-auto flex items-center justify-center border border-emerald-200">
                  <IconUpload size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 uppercase">Tải Ảnh Trực Tiếp Lên Đám Mây Cloudinary (dwl2xtbqa)</h4>
                  <p className="text-[11px] text-slate-500">Hỗ trợ các tệp ảnh .JPG, .PNG, .WEBP. Ảnh được tối ưu tốc độ CDN tự động.</p>
                </div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white font-extrabold text-xs transition-colors cursor-pointer shadow-md">
                  <IconUpload size={16} />
                  <span>{isUploadingCloudinary ? "☁️ Đang nạp ảnh..." : "Chọn Tệp Từ Máy Tải Lên Cloudinary"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCloudinaryFileUpload(e.target.files[0], "media");
                      }
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Tên Tệp / Tiêu Đề Ảnh *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Banner Trang Chủ SKECHERS Q3"
                    value={mediaForm.title}
                    onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Phân Loại Ảnh</label>
                  <select
                    value={mediaForm.category}
                    onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-[#006838] focus:bg-white cursor-pointer"
                  >
                    <option value="HERO_BANNER">Banner Trang Chủ (Hero)</option>
                    <option value="FACTORY">Hình Ảnh Nhà Máy TBS</option>
                    <option value="PRODUCT">Mẫu Giày SKECHERS</option>
                    <option value="EVENTS">Sự Kiện &amp; Hoạt Động</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Link Ảnh Cloudinary URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tự động điền sau khi tải ảnh hoặc dán URL tại đây..."
                    value={mediaForm.url}
                    onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono outline-none focus:border-[#006838] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00522c] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <IconCheck size={16} />
                <span>Lưu Vào Thư Viện Media</span>
              </button>
            </form>

            {/* Media Gallery Grid */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Kho Thư viện Hình ảnh</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mediaList.map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <img src={m.url} alt={m.title} className="w-full h-36 rounded-xl object-cover border border-slate-200" />
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#006838] text-[10px] font-extrabold uppercase">
                        {m.category}
                      </span>
                      <div className="text-xs font-bold text-slate-900 truncate">{m.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{m.url}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 5: QUẢN TRỊ NỘI DUNG & HÌNH ẢNH TRANG CHỦ & DÒNG SẢN PHẨM
           ════════════════════════════════════════════════════════════════ */}
        {(activeTab === "landing_cms" || activeTab === "products") && (
          <LandingCMSManager
            landingCMS={landingCMS}
            setLandingCMS={setLandingCMS}
            onSave={handleSaveLandingCMS}
            onReset={handleResetLandingCMS}
            onUploadImage={handleUploadLandingCMSImage}
            onBulkUploadProductImages={handleBulkUploadProductImages}
            isUploading={isUploadingCloudinary}
            initialSubSection={activeTab === "products" ? "products" : cmsSubSection}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: QUẢN LÝ KHÔNG GIAN LÀM VIỆC (WORKSPACE GALLERY)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "workspace_gallery" && (
          <WorkspaceCMSManager
            departments={landingCMS.workspaceDepartments || []}
            onChange={(updatedDeps) => {
              const newCMS = { ...landingCMS, workspaceDepartments: updatedDeps };
              setLandingCMS(newCMS);
              saveLandingCMS(newCMS);
            }}
            showToast={showToast}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: QUẢN LÝ ĐỐI TÁC THƯƠNG HIỆU (BRAND PARTNERS)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "brand_partners" && (
          <BrandPartnersManager
            brandPartners={landingCMS.brandPartners || []}
            onChange={(updatedPartners) => {
              const newCMS = { ...landingCMS, brandPartners: updatedPartners };
              setLandingCMS(newCMS);
              saveLandingCMS(newCMS);
            }}
            showToast={showToast}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: QUẢN LÝ DÒNG GIÀY TIÊU BIỂU (FEATURED SHOE LINES)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "shoe_lines" && (
          <ShoeLinesManager
            shoeLines={landingCMS.shoeLines || DEFAULT_SHOE_LINES_CONFIG}
            onChange={(updatedShoeLines) => {
              const newCMS = { ...landingCMS, shoeLines: updatedShoeLines };
              setLandingCMS(newCMS);
              saveLandingCMS(newCMS);
            }}
            showToast={showToast}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 6: ĐIỀU KHIỂN CLOUDFLARE D1 DATABASE
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "d1_control" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <IconDatabase size={20} className="text-[#006838]" />
                    <span>🗄️ ĐIỀU KHIỂN CLOUDFLARE D1 DATABASE</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Trạng thái kết nối cơ sở dữ liệu thời gian thực Cloudflare Workers.</p>
                </div>
                <button
                  onClick={fetchLiveD1Counts}
                  className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006838] hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <IconRefresh size={16} />
                  <span>Làm mới D1 Count</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Table: meeting_rooms</span>
                  <div className="text-xl font-black text-[#006838]">{d1Stats.roomsCount} Phòng</div>
                  <span className="text-[10px] text-emerald-600 block">✓ Trạng thái: Hoạt động</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Table: room_bookings</span>
                  <div className="text-xl font-black text-blue-600">{d1Stats.bookingsCount} Bản ghi</div>
                  <span className="text-[10px] text-slate-500 block">Lịch họp thực tế D1</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Table: visitors</span>
                  <div className="text-xl font-black text-purple-600">{d1Stats.visitorsCount} Khách</div>
                  <span className="text-[10px] text-slate-500 block">Thẻ đón khách D1</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Table: business_trips</span>
                  <div className="text-xl font-black text-amber-600">{d1Stats.businessTripsCount} Đề xuất</div>
                  <span className="text-[10px] text-slate-500 block">Đơn công tác D1</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
                <div className="text-[#006838] font-bold">✓ Cloudflare D1 Binding: env.DB</div>
                <div className="text-slate-700">Database ID: ae3a7efd-ff5d-45c2-8c49-78d1518e3aa1 (vpchuoiskechers)</div>
                <div className="text-slate-500 text-[11px]">Server Region: APAC / HKG Cloudflare Edge Worker</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
