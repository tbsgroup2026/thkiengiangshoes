/**
 * KIRO — Core Personnel Permission Engine
 * Nguồn dữ liệu chuẩn: Cloudflare D1 `users` Table
 * Nguyên tắc phân cấp: `users.title` là nguồn chính xác định Cấp bậc nhân sự.
 * Không hard-code theo email, emp_code hay name.
 */

export type EmployeeLevel =
  | "EMPLOYEE"
  | "TEAM_LEADER"
  | "TRUONG_PHONG"
  | "PHO_GIAM_DOC"
  | "GIAM_DOC"
  | "PHO_TONG_GIAM_DOC"
  | "TONG_GIAM_DOC"
  | "UNKNOWN";

export type PermissionGroup =
  | "EMPLOYEE"
  | "TEAM_LEADER"
  | "DEPARTMENT_MANAGER"
  | "DEPUTY_DIRECTOR"
  | "DIRECTOR"
  | "DEPUTY_GENERAL_DIRECTOR"
  | "GENERAL_DIRECTOR"
  | "NONE";

export interface UserInput {
  title?: string | null;
  vtcv_hien_tai?: string | null;
  vtcv_sap?: string | null;
  department?: string | null;
  phong_ban_hien_tai?: string | null;
  bo_phan_moi?: string | null;
  role_code?: string | null;
  roleCode?: string | null;
  emp_code?: string | null;
  empCode?: string | null;
  approvalScope?: string | string[] | null;
}

export interface ResolvedUserPermission {
  originalPosition: string;         // Title gốc từ D1 users.title (TP, TGĐ, GĐ, NV...)
  employeeLevel: EmployeeLevel;     // Cấp bậc logic (EMPLOYEE -> TONG_GIAM_DOC)
  levelRank: number;                // Rank 0 đến 6 (UNKNOWN = 0)
  permissionGroup: PermissionGroup; // Nhóm phân quyền (EMPLOYEE -> GENERAL_DIRECTOR)
  department: string;               // Tên phòng ban hiện tại từ users.department
  boPhanMoi: string;                // Nhóm bộ phận mới từ users.bo_phan_moi
  canApprove: boolean;              // Quyền duyệt tổng quan
  canManage: boolean;               // Quyền quản lý phòng ban/nhóm
}

/**
 * Hàm duy nhất giải mã và xác định Cấp bậc Nhân sự từ dữ liệu D1
 * Thứ tự ưu tiên:
 * 1. users.title
 * 2. users.department
 * 3. users.bo_phan_moi
 * 4. users.vtcv_hien_tai / vtcv_sap
 * 5. role_code (Chỉ dùng cho System Role đặc biệt, KHÔNG dùng thay thế title)
 */
export function resolveEmployeeLevel(user?: UserInput | null): ResolvedUserPermission {
  if (!user) {
    return {
      originalPosition: "UNKNOWN",
      employeeLevel: "UNKNOWN",
      levelRank: 0,
      permissionGroup: "NONE",
      department: "",
      boPhanMoi: "",
      canApprove: false,
      canManage: false,
    };
  }

  // 1. Trích xuất Chức danh gốc (users.title > vtcv_hien_tai > vtcv_sap)
  const rawTitle = (user.title || user.vtcv_hien_tai || user.vtcv_sap || "").trim();
  const upperTitle = rawTitle.toUpperCase();

  // 🔍 DEBUG: Log incoming title for debugging
  if (typeof window !== 'undefined' && rawTitle) {
    console.debug('[resolveEmployeeLevel]', { rawTitle, upperTitle, user });
  }

  const userDept = (user.department || user.phong_ban_hien_tai || "").trim();
  const userBoPhan = (user.bo_phan_moi || "").trim();

  // Kiểm tra nếu title không hợp lệ hoặc UNKNOWN
  if (!rawTitle || upperTitle === "UNKNOWN" || upperTitle === "NONE" || upperTitle === "NULL") {
    // Kiểm tra đặc xá kỹ thuật nếu role_code là SUPER_ADMIN duy nhất
    const sysRole = (user.role_code || user.roleCode || "").trim().toUpperCase();
    if (sysRole === "SUPER_ADMIN") {
      return {
        originalPosition: "SUPER_ADMIN",
        employeeLevel: "TONG_GIAM_DOC",
        levelRank: 6,
        permissionGroup: "GENERAL_DIRECTOR",
        department: userDept,
        boPhanMoi: userBoPhan,
        canApprove: true,
        canManage: true,
      };
    }

    return {
      originalPosition: rawTitle || "UNKNOWN",
      employeeLevel: "UNKNOWN",
      levelRank: 0,
      permissionGroup: "NONE",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: false,
      canManage: false,
    };
  }

  // 2. Mapping theo quy tắc hierarchy chính xác

  // LEVEL 6: TGĐ / TỔNG GIÁM ĐỐC
  if (
    upperTitle === "TGĐ" ||
    upperTitle === "TGD" ||
    upperTitle.includes("TỔNG GIÁM ĐỐC") ||
    upperTitle.includes("TONG GIAM DOC") ||
    upperTitle.includes("GENERAL DIRECTOR") ||
    upperTitle.includes("CEO")
  ) {
    return {
      originalPosition: rawTitle,
      employeeLevel: "TONG_GIAM_DOC",
      levelRank: 6,
      permissionGroup: "GENERAL_DIRECTOR",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: true,
      canManage: true,
    };
  }

  // LEVEL 5: P.TGĐ / PHÓ TỔNG GIÁM ĐỐC
  if (
    upperTitle === "P.TGĐ" ||
    upperTitle === "PTGĐ" ||
    upperTitle === "PTGD" ||
    upperTitle.includes("PHÓ TỔNG GIÁM ĐỐC") ||
    upperTitle.includes("PHO TONG GIAM DOC") ||
    upperTitle.includes("DEPUTY GENERAL DIRECTOR")
  ) {
    return {
      originalPosition: rawTitle,
      employeeLevel: "PHO_TONG_GIAM_DOC",
      levelRank: 5,
      permissionGroup: "DEPUTY_GENERAL_DIRECTOR",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: true,
      canManage: true,
    };
  }

  // LEVEL 4: GĐ / GIÁM ĐỐC
  if (
    upperTitle === "GĐ" ||
    upperTitle === "GD" ||
    upperTitle.includes("GIÁM ĐỐC") ||
    upperTitle.includes("GIAM DOC") ||
    upperTitle.includes("DIRECTOR")
  ) {
    return {
      originalPosition: rawTitle,
      employeeLevel: "GIAM_DOC",
      levelRank: 4,
      permissionGroup: "DIRECTOR",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: true,
      canManage: true,
    };
  }

  // LEVEL 3: PGĐ / PHÓ GIÁM ĐỐC
  if (
    upperTitle === "PGĐ" ||
    upperTitle === "PGD" ||
    upperTitle.includes("PHÓ GIÁM ĐỐC") ||
    upperTitle.includes("PHO GIAM DOC") ||
    upperTitle.includes("DEPUTY DIRECTOR")
  ) {
    return {
      originalPosition: rawTitle,
      employeeLevel: "PHO_GIAM_DOC",
      levelRank: 3,
      permissionGroup: "DEPUTY_DIRECTOR",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: true,
      canManage: true,
    };
  }

  // LEVEL 2: TP / TRƯỞNG PHÒNG
  if (
    upperTitle === "TP" ||
    upperTitle.includes("TRƯỞNG PHÒNG") ||
    upperTitle.includes("TRUONG PHONG") ||
    upperTitle.includes("HEAD OF") ||
    upperTitle.includes("MANAGER")
  ) {
    return {
      originalPosition: rawTitle,
      employeeLevel: "TRUONG_PHONG",
      levelRank: 2,
      permissionGroup: "DEPARTMENT_MANAGER",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: true,
      canManage: true,
    };
  }

  // LEVEL 1: T.TEAM / TT / TỔ TRƯỞNG / TRƯỞNG NHÓM
  if (
    upperTitle === "T.TEAM" ||
    upperTitle === "TT" ||
    upperTitle.includes("TRƯỞNG NHÓM") ||
    upperTitle.includes("TRUONG NHOM") ||
    upperTitle.includes("TỔ TRƯỞNG") ||
    upperTitle.includes("TO TRUONG") ||
    upperTitle.includes("TEAM LEADER")
  ) {
    return {
      originalPosition: rawTitle,
      employeeLevel: "TEAM_LEADER",
      levelRank: 1,
      permissionGroup: "TEAM_LEADER",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: true,
      canManage: true,
    };
  }

  // LEVEL 0: CBCNV (NV, CV, CN, TL, NHÂN VIÊN, CHUYÊN VIÊN, CÔNG NHÂN)
  if (
    upperTitle === "NV" ||
    upperTitle === "CV" ||
    upperTitle === "CN" ||
    upperTitle === "TL" ||
    upperTitle.includes("NHÂN VIÊN") ||
    upperTitle.includes("NHAN VIEN") ||
    upperTitle.includes("CHUYÊN VIÊN") ||
    upperTitle.includes("CHUYEN VIEN") ||
    upperTitle.includes("CÔNG NHÂN") ||
    upperTitle.includes("CONG NHAN") ||
    upperTitle.includes("TRỢ LÝ") ||
    upperTitle.includes("TRO LY") ||
    upperTitle.includes("STAFF")
  ) {
    return {
      originalPosition: rawTitle,
      employeeLevel: "EMPLOYEE",
      levelRank: 0,
      permissionGroup: "EMPLOYEE",
      department: userDept,
      boPhanMoi: userBoPhan,
      canApprove: false,
      canManage: false,
    };
  }

  // Tiêu đề chưa xác định / không nằm trong mapping -> UNKNOWN (không tự nâng quyền)
  return {
    originalPosition: rawTitle,
    employeeLevel: "UNKNOWN",
    levelRank: 0,
    permissionGroup: "NONE",
    department: userDept,
    boPhanMoi: userBoPhan,
    canApprove: false,
    canManage: false,
  };
}

/**
 * Chuẩn hóa so sánh phòng ban (loại bỏ dấu, khoảng trắng thừa, viết hoa)
 */
export function normalizeDepartmentName(dept: string): string {
  if (!dept) return "";
  return dept
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Kiểm tra xem 2 tên phòng ban có thuộc cùng một Scope hay không
 */
export function isSameDepartmentScope(userDept: string, targetDept: string): boolean {
  if (!userDept || !targetDept) return false;
  const normUser = normalizeDepartmentName(userDept);
  const normTarget = normalizeDepartmentName(targetDept);

  if (normUser === normTarget) return true;
  if (normUser.includes(normTarget) || normTarget.includes(normUser)) return true;

  // Xử lý các bí danh phòng ban phổ biến (chuẩn hóa không dấu không khoảng trắng)
  const ALIAS_GROUPS = [
    ["KETOAN", "TAICHINH", "ACCOUNTING"],
    ["NHANSU", "HANHCHANH", "NHANSUHC", "NHANSUHANHCHANH", "HR", "PHONGNHANSU"],
    ["LOGISTICS", "TTPP", "KHCBTTPP"],
    ["QC", "LAB", "QLCL", "QLCLLAB"],
    ["IT", "CDS", "DIGITAL", "CNPPHCI"],
    ["RD", "PHATTRIENSANPHAM"],
    ["KDPTSP", "KINHDOANH"],
    ["DHQT", "BANGIAMDOC"],
  ];

  for (const group of ALIAS_GROUPS) {
    const userInGroup = group.some((g) => normUser.includes(g));
    const targetInGroup = group.some((g) => normTarget.includes(g));
    if (userInGroup && targetInGroup) return true;
  }

  return false;
}

/**
 * Helper kiểm tra quyền duyệt Lịch Công Tác (/business-trip)
 */
export function canApproveTrip(
  user?: UserInput | null,
  trip?: { department: string; creator_emp_code?: string; creator?: string } | null
): { allowed: boolean; reason?: string; requiredLevelRank?: number } {
  if (!user || !trip) return { allowed: false, reason: "Thiếu thông tin người dùng hoặc lịch công tác" };

  const resolved = resolveEmployeeLevel(user);
  
  // 🔍 DEBUG
  if (typeof window !== 'undefined') {
    console.debug('[canApproveTrip] Resolved:', { 
      user_title: user.title,
      resolved_level: resolved.employeeLevel,
      resolved_rank: resolved.levelRank,
      can_approve: resolved.canApprove,
      trip_dept: trip.department
    });
  }

  // LEVEL 0 & UNKNOWN: Không được duyệt
  if (resolved.levelRank <= 0 || !resolved.canApprove) {
    return { allowed: false, reason: "Tài khoản cấp CBCNV không có quyền duyệt lịch công tác", requiredLevelRank: 2 };
  }

  // LEVEL 6: TGĐ (Tổng Giám Đốc) -> Có quyền duyệt toàn hệ thống
  if (resolved.levelRank >= 6 || resolved.employeeLevel === "TONG_GIAM_DOC") {
    return { allowed: true };
  }

  // LEVEL 3, 4, 5: BGĐ (PGĐ, GĐ, P.TGĐ) -> Scope BGĐ / Khối phụ trách
  if (resolved.levelRank >= 3) {
    return { allowed: true };
  }

  // LEVEL 2: TP (Trưởng Phòng) -> CHỈ ĐƯỢC DUYỆT ĐÚNG PHÒNG BAN
  if (resolved.employeeLevel === "TRUONG_PHONG" || resolved.levelRank === 2) {
    const isSameDept = isSameDepartmentScope(resolved.department, trip.department);

    if (isSameDept) {
      return { allowed: true };
    } else {
      return {
        allowed: false,
        reason: `Trưởng phòng [${resolved.department}] không có quyền duyệt lịch công tác thuộc phòng ban [${trip.department}]`,
        requiredLevelRank: 2,
      };
    }
  }

  // LEVEL 1: T.TEAM (Trưởng Nhóm / Tổ Trưởng) -> Trong nhóm phụ trách
  if (resolved.employeeLevel === "TEAM_LEADER" || resolved.levelRank === 1) {
    const isSameDept = isSameDepartmentScope(resolved.department, trip.department);
    if (isSameDept) {
      return { allowed: true };
    } else {
      return {
        allowed: false,
        reason: `Trưởng nhóm [${resolved.department}] không có quyền duyệt lịch công tác ngoài scope nhóm [${trip.department}]`,
        requiredLevelRank: 1,
      };
    }
  }

  return { allowed: false, reason: "Không có quyền thực hiện thao tác này" };
}

/**
 * Helper kiểm tra quyền duyệt Đặt Phòng Họp (/rooms)
 */
export function canApproveRoom(
  user?: UserInput | null,
  booking?: { department: string } | null
): { allowed: boolean; reason?: string } {
  if (!user) return { allowed: false, reason: "Chưa đăng nhập" };

  const resolved = resolveEmployeeLevel(user);
  const sysRole = (user.role_code || user.roleCode || "").trim().toUpperCase();

  // Lễ tân hoặc Admin có quyền duyệt phòng họp
  if (sysRole === "LE_TAN" || sysRole === "SUPER_ADMIN" || resolved.levelRank >= 6) {
    return { allowed: true };
  }

  // BGĐ & Trưởng phòng được duyệt hoặc xác nhận phòng họp thuộc phòng ban mình
  if (resolved.levelRank >= 2) {
    if (!booking) return { allowed: true };
    if (isSameDepartmentScope(resolved.department, booking.department) || resolved.levelRank >= 3) {
      return { allowed: true };
    }
  }

  return { allowed: false, reason: "Chỉ Lễ Tân hoặc Quản Lý Phòng Ban mới có quyền duyệt phòng họp" };
}
