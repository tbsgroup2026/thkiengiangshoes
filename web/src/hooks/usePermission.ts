"use client";

import { useEffect, useState } from "react";
import { PERMISSIONS, ROLES, Permission } from "@/lib/permissions";
import { getCurrentUser, UserProfile } from "@/lib/userProfiles";
import { resolveEmployeeLevel, ResolvedUserPermission } from "@/lib/permissionEngine";

/**
 * SECURITY NOTE / BẢO MẬT:
 * Việc kiểm tra permission ở phía client (usePermission / <Can>) chủ yếu phục vụ trải nghiệm UI (ẩn/hiện nút & tab).
 * TOÀN BỘ các API endpoint (duyệt công tác, duyệt phòng họp, xóa dữ liệu...)
 * bắt buộc phải validate & authorize lại phía Server/API dựa trên Cloudflare D1.
 */

export interface UserSession extends UserProfile {
  managedDepartmentId?: string;
}

export function usePermission() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    function loadUser() {
      if (typeof window !== "undefined") {
        const cur = getCurrentUser();
        setUser(cur as unknown as UserSession | null);
      }
    }

    loadUser();

    if (typeof window !== "undefined") {
      window.addEventListener("tbs_profile_updated", loadUser);
      return () => window.removeEventListener("tbs_profile_updated", loadUser);
    }
  }, []);

  // Giải mã Cấp bậc Nhân sự động từ Title & Department của D1
  const resolved: ResolvedUserPermission = resolveEmployeeLevel(user);

  const roles = user?.roles || (user ? ["employee"] : []);
  const empCode = user?.empCode || "";
  const roleCode = (user as any)?.roleCode || "";

  // Ban Giám Đốc hoặc Admin (Rank >= 3 hoặc Super Admin hoặc PGĐ Kiều Thanh Vũ hoặc IT Team Chuyển
  // Đổi Số 202608001/202608002 — 2 tài khoản này đã nằm trong ADMIN_WHITELIST (trang /admin) và
  // MMTB_AUTOLOGIN_ADMIN_EMP_CODES từ trước, role_code thật trong CSDL (TRUONG_PHONG/LE_TAN) không
  // phản ánh đúng quyền hạn thật nên phải liệt kê thẳng MSNV ở đây, đồng bộ với isExecutiveOrAdmin
  // phía server (verifyServerAuth trong public/_worker.js).
  const isExecutiveOrAdmin =
    resolved.levelRank >= 3 ||
    roleCode === "SUPER_ADMIN" ||
    empCode === "ADMIN-2026" ||
    empCode === "201809012" ||
    empCode === "202608001" ||
    empCode === "202608002" ||
    roleCode === "PHO_GIAM_DOC";

  // Tính toán tập quyền (permissions) dựa trên vai trò thực tế của người dùng
  const userPermissions = new Set<Permission>();

  const activeRoles = new Set<string>(roles.map(r => r.toLowerCase()));
  if (resolved.employeeLevel === "TRUONG_PHONG") activeRoles.add("department_head");
  if (resolved.employeeLevel === "TEAM_LEADER") activeRoles.add("team_leader");
  if (resolved.employeeLevel === "PHO_GIAM_DOC") activeRoles.add("deputy_director");
  if (resolved.employeeLevel === "GIAM_DOC") activeRoles.add("director");
  if (resolved.employeeLevel === "PHO_TONG_GIAM_DOC") activeRoles.add("deputy_ceo");
  if (resolved.employeeLevel === "TONG_GIAM_DOC") activeRoles.add("ceo");
  if (roleCode === "LE_TAN") activeRoles.add("receptionist");
  if (roleCode) activeRoles.add(roleCode.toLowerCase());

  if (isExecutiveOrAdmin) {
    Object.values(PERMISSIONS).forEach((p) => userPermissions.add(p as Permission));
  } else {
    activeRoles.forEach((r) => {
      const perms = ROLES[r];
      if (perms) {
        perms.forEach((p) => userPermissions.add(p));
      }
    });

    if (userPermissions.size === 0 && user) {
      ROLES.employee.forEach((p) => userPermissions.add(p));
    }
  }

  const can = (permission: Permission): boolean => userPermissions.has(permission);
  const canAny = (permissions: Permission[]): boolean => permissions.some((p) => userPermissions.has(p));
  const canAll = (permissions: Permission[]): boolean => permissions.every((p) => userPermissions.has(p));

  const canEditModule = (
    moduleKey: "rooms" | "finance" | "hr" | "maintenance" | "qc" | "ci" | "logistics" | "rd" | "documents" | "trips"
  ): boolean => {
    if (isExecutiveOrAdmin) return true;
    if (moduleKey === "rooms") return can(PERMISSIONS.ROOMS_APPROVE);
    if (moduleKey === "trips") return resolved.levelRank >= 1 && resolved.canApprove;
    if (moduleKey === "maintenance") return can(PERMISSIONS.MAINT_MANAGE);
    if (moduleKey === "documents") return can(PERMISSIONS.DOC_APPROVE);
    if (moduleKey === "qc") return can(PERMISSIONS.QC_MANAGE);
    if (moduleKey === "ci") return can(PERMISSIONS.CI_MANAGE);
    return true;
  };

  const isReadOnlyModule = (
    moduleKey: "rooms" | "finance" | "hr" | "maintenance" | "qc" | "ci" | "logistics" | "rd" | "documents" | "trips"
  ): boolean => {
    return !canEditModule(moduleKey);
  };

  return {
    user,
    roles,
    managedDepartmentId: user?.managedDepartmentId,
    resolved,
    employeeLevel: resolved.employeeLevel,
    levelRank: resolved.levelRank,
    permissionGroup: resolved.permissionGroup,
    department: resolved.department,
    isExecutiveOrAdmin,
    canApprove: resolved.canApprove,
    canManage: resolved.canManage,
    canEditModule,
    isReadOnlyModule,
    can,
    canAny,
    canAll,
    permissions: Array.from(userPermissions),
  };
}

