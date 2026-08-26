import { JWTPayload } from './auth';

export const ROLE_LEVELS = {
  SUPER_ADMIN: 1,
  EXECUTIVE: 2,
  DEPARTMENT_HEAD: 3,
  OFFICE_STAFF: 4,
  MAINTENANCE: 5,
  WORKER: 6,
} as const;

export const DEFAULT_ROLES = [
  { id: 1, code: 'SUPER_ADMIN', name: 'Super Admin', level: 1, description: 'Toàn quyền quản trị hệ thống' },
  { id: 2, code: 'EXECUTIVE', name: 'Ban Giám đốc (Sếp lớn)', level: 2, description: 'Xem dashboard tổng và drill-down toàn công ty' },
  { id: 3, code: 'DEPT_HEAD', name: 'Trưởng phòng ban', level: 3, description: 'Quản lý và duyệt giấy tờ thuộc scope phòng ban' },
  { id: 4, code: 'OFFICE_STAFF', name: 'Nhân viên văn phòng', level: 4, description: 'Nhập liệu và số hóa giấy tờ phòng ban' },
  { id: 5, code: 'MAINTENANCE', name: 'Nhân viên bảo trì', level: 5, description: 'Nhận thông báo, xác nhận và sửa chữa máy móc (App mobile)' },
  { id: 6, code: 'WORKER', name: 'Công nhân', level: 6, description: 'Quét mã QR báo sự cố máy móc (App mobile)' },
];

/**
 * Check if the user has access based on minimum required level
 */
export function hasMinRoleLevel(user: JWTPayload | null, requiredLevel: number): boolean {
  if (!user) return false;
  return user.roleLevel <= requiredLevel; // Lower number means higher privileges
}

/**
 * Check if user is Super Admin or TGĐ
 */
export function isSuperAdmin(user: JWTPayload | null): boolean {
  if (!user) return false;
  return (
    user.roleLevel <= ROLE_LEVELS.SUPER_ADMIN ||
    user.roleCode === "SUPER_ADMIN" ||
    user.roleCode === "TONG_GIAM_DOC" ||
    user.roleCode === "admin" ||
    user.roleCode === "ceo"
  );
}

/**
 * Check if user can approve Level 1 (Trưởng phòng / Team Leader)
 */
export function canApproveTripLevel1(user: JWTPayload | null): boolean {
  if (!user) return false;
  return (
    user.roleLevel <= ROLE_LEVELS.DEPARTMENT_HEAD ||
    user.roleCode === "TRUONG_PHONG" ||
    user.roleCode === "department_head" ||
    user.roleCode === "TO_TRUONG" ||
    user.roleCode === "team_leader" ||
    isSuperAdmin(user)
  );
}

/**
 * Check if user can approve Level 2 (Ban Giám Đốc / TGĐ)
 */
export function canApproveTripLevel2(user: JWTPayload | null): boolean {
  if (!user) return false;
  return (
    user.roleLevel <= ROLE_LEVELS.EXECUTIVE ||
    user.roleCode === "TONG_GIAM_DOC" ||
    user.roleCode === "PHO_TONG_GIAM_DOC" ||
    user.roleCode === "GIAM_DOC" ||
    user.roleCode === "PHO_GIAM_DOC" ||
    user.roleCode === "ceo" ||
    user.roleCode === "deputy_ceo" ||
    user.roleCode === "director" ||
    user.roleCode === "deputy_director" ||
    isSuperAdmin(user)
  );
}

/**
 * Check if user can manage users / roles
 */
export function canManageUsers(user: JWTPayload | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Determine default route for user upon successful login
 */
export function getRedirectRouteForUser(user: JWTPayload): string {
  if (user.roleLevel === ROLE_LEVELS.WORKER || user.roleLevel === ROLE_LEVELS.MAINTENANCE) {
    return '/mobile-guide'; // Maintenance & Workers use mobile native app
  }
  if (user.roleLevel === ROLE_LEVELS.SUPER_ADMIN || user.roleCode === "TONG_GIAM_DOC" || user.roleCode === "ceo") {
    return '/admin';
  }
  if (user.roleLevel === ROLE_LEVELS.EXECUTIVE) {
    return '/work';
  }
  if (user.roleLevel === ROLE_LEVELS.DEPARTMENT_HEAD) {
    return '/documents/approvals';
  }
  return '/work';
}
