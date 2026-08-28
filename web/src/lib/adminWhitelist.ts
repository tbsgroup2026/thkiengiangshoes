/**
 * Single Source of Truth for Admin Access Control Whitelist
 * Strictly limits access to /admin and /api/admin/* to:
 * 1. Phạm Nguyễn Anh Huy (Admin - IT Team Chuyển Đổi Số)
 * 2. Kiều Thanh Vũ (Phó Giám Đốc Phân Hệ CN CI PPH)
 */

export interface WhitelistAdminUser {
  empCode: string;
  name: string;
  roleTitle: string;
  email: string;
  userId?: number;
}

export const ADMIN_WHITELIST: WhitelistAdminUser[] = [
  {
    empCode: "202608001",
    name: "Phạm Nguyễn Anh Huy",
    roleTitle: "Admin - IT Team Chuyển Đổi Số",
    email: "anhy.work.2004@gmail.com",
    userId: 205,
  },
  {
    empCode: "201809012",
    name: "Kiều Thanh Vũ",
    roleTitle: "Phó Giám Đốc Phân Hệ CN CI PPH",
    email: "vukt@tbsgroup.vn",
    userId: 212,
  },
];

const ALLOWED_ADMIN_CODES = new Set<string>([
  "202608001",
  "2026080001",
  "201809012",
  "PGĐ-005",
  "PGD-005",
]);

const ALLOWED_ADMIN_EMAILS = new Set<string>([
  "anhy.work.2004@gmail.com",
  "huypna@tbsgroup.vn",
  "vukt@tbsgroup.vn",
]);

const ALLOWED_ADMIN_USER_IDS = new Set<number>([205, 212]);

/**
 * Validates whether a user identity is authorized to access /admin
 */
export function isUserInAdminWhitelist(user: {
  empCode?: string;
  email?: string;
  userId?: number | string;
} | null | undefined): boolean {
  if (!user) return false;

  // 1. Check empCode
  if (user.empCode) {
    const cleanCode = String(user.empCode).trim().toUpperCase();
    if (ALLOWED_ADMIN_CODES.has(cleanCode)) {
      return true;
    }
  }

  // 2. Check email
  if (user.email) {
    const cleanEmail = String(user.email).trim().toLowerCase();
    if (ALLOWED_ADMIN_EMAILS.has(cleanEmail)) {
      return true;
    }
  }

  // 3. Check userId
  if (user.userId !== undefined && user.userId !== null) {
    const numId = Number(user.userId);
    if (!isNaN(numId) && ALLOWED_ADMIN_USER_IDS.has(numId)) {
      return true;
    }
  }

  return false;
}
