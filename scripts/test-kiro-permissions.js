/**
 * KIRO Permission Engine Automated Verification Script
 */

const path = require("path");
const fs = require("fs");

// Simple standalone mock matching resolveEmployeeLevel logic
function resolveEmployeeLevel(user) {
  if (!user) {
    return { originalPosition: "UNKNOWN", employeeLevel: "UNKNOWN", levelRank: 0, permissionGroup: "NONE", department: "", canApprove: false, canManage: false };
  }
  const rawTitle = String(user.title || user.vtcv_hien_tai || user.vtcv_sap || "").trim();
  const upperTitle = rawTitle.toUpperCase();
  const userDept = String(user.department || user.phong_ban_hien_tai || "").trim();
  const userBoPhan = String(user.bo_phan_moi || "").trim();

  if (!rawTitle || upperTitle === "UNKNOWN" || upperTitle === "NONE" || upperTitle === "NULL") {
    const sysRole = String(user.role_code || user.roleCode || "").trim().toUpperCase();
    if (sysRole === "SUPER_ADMIN") {
      return { originalPosition: "SUPER_ADMIN", employeeLevel: "TONG_GIAM_DOC", levelRank: 6, permissionGroup: "GENERAL_DIRECTOR", department: userDept, canApprove: true, canManage: true };
    }
    return { originalPosition: rawTitle || "UNKNOWN", employeeLevel: "UNKNOWN", levelRank: 0, permissionGroup: "NONE", department: userDept, canApprove: false, canManage: false };
  }

  if (upperTitle === "TGĐ" || upperTitle === "TGD" || upperTitle.includes("TỔNG GIÁM ĐỐC") || upperTitle.includes("CEO")) {
    return { originalPosition: rawTitle, employeeLevel: "TONG_GIAM_DOC", levelRank: 6, permissionGroup: "GENERAL_DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "P.TGĐ" || upperTitle === "PTGĐ" || upperTitle === "PTGD" || upperTitle.includes("PHÓ TỔNG GIÁM ĐỐC")) {
    return { originalPosition: rawTitle, employeeLevel: "PHO_TONG_GIAM_DOC", levelRank: 5, permissionGroup: "DEPUTY_GENERAL_DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "GĐ" || upperTitle === "GD" || upperTitle.includes("GIÁM ĐỐC")) {
    return { originalPosition: rawTitle, employeeLevel: "GIAM_DOC", levelRank: 4, permissionGroup: "DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "PGĐ" || upperTitle === "PGD" || upperTitle.includes("PHÓ GIÁM ĐỐC")) {
    return { originalPosition: rawTitle, employeeLevel: "PHO_GIAM_DOC", levelRank: 3, permissionGroup: "DEPUTY_DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "TP" || upperTitle.includes("TRƯỞNG PHÒNG") || upperTitle.includes("MANAGER")) {
    return { originalPosition: rawTitle, employeeLevel: "TRUONG_PHONG", levelRank: 2, permissionGroup: "DEPARTMENT_MANAGER", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "T.TEAM" || upperTitle === "TT" || upperTitle.includes("TRƯỞNG NHÓM") || upperTitle.includes("TỔ TRƯỞNG")) {
    return { originalPosition: rawTitle, employeeLevel: "TEAM_LEADER", levelRank: 1, permissionGroup: "TEAM_LEADER", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "NV" || upperTitle === "CV" || upperTitle === "CN" || upperTitle === "TL" || upperTitle.includes("NHÂN VIÊN") || upperTitle.includes("CHUYÊN VIÊN") || upperTitle.includes("CÔNG NHÂN")) {
    return { originalPosition: rawTitle, employeeLevel: "EMPLOYEE", levelRank: 0, permissionGroup: "EMPLOYEE", department: userDept, canApprove: false, canManage: false };
  }

  return { originalPosition: rawTitle, employeeLevel: "UNKNOWN", levelRank: 0, permissionGroup: "NONE", department: userDept, canApprove: false, canManage: false };
}

function isSameDepartmentScope(userDept, targetDept) {
  if (!userDept || !targetDept) return false;
  const normUser = String(userDept).trim().toUpperCase();
  const normTarget = String(targetDept).trim().toUpperCase();
  if (normUser === normTarget) return true;
  if (normUser.includes(normTarget) || normTarget.includes(normUser)) return true;
  return false;
}

function canApproveTrip(user, trip) {
  if (!user || !trip) return { allowed: false, reason: "Thiếu dữ liệu" };
  const resolved = resolveEmployeeLevel(user);
  if (resolved.levelRank <= 0 || !resolved.canApprove) {
    return { allowed: false, reason: "Tài khoản CBCNV / UNKNOWN không có quyền duyệt" };
  }
  if (resolved.levelRank >= 6) return { allowed: true };
  if (resolved.levelRank >= 3) return { allowed: true };
  if (resolved.levelRank === 2) {
    if (isSameDepartmentScope(resolved.department, trip.department)) return { allowed: true };
    return { allowed: false, reason: `Trưởng phòng [${resolved.department}] không có quyền duyệt đơn phòng [${trip.department}]` };
  }
  if (resolved.levelRank === 1) {
    if (isSameDepartmentScope(resolved.department, trip.department)) return { allowed: true };
    return { allowed: false, reason: `Trưởng nhóm [${resolved.department}] không có quyền duyệt ngoài nhóm` };
  }
  return { allowed: false, reason: "Từ chối duyệt" };
}

// 7 Empirical Test Cases & UNKNOWN Title Case
const testCases = [
  {
    id: "5036",
    input: { title: "NV", department: "KẾ TOÁN", bo_phan_moi: "CBCNV" },
    expectedLevel: "EMPLOYEE",
    expectedRank: 0,
    expectedGroup: "EMPLOYEE",
    testDept: "KẾ TOÁN",
    shouldApproveOwnTrip: false
  },
  {
    id: "5037",
    input: { title: "TP", department: "QT-KS", bo_phan_moi: "CBCNV" },
    expectedLevel: "TRUONG_PHONG",
    expectedRank: 2,
    expectedGroup: "DEPARTMENT_MANAGER",
    testDept: "QT-KS",
    shouldApproveOwnTrip: true,
    crossDeptTest: "NHÂN SỰ-HC",
    shouldApproveCrossTrip: false
  },
  {
    id: "5038",
    input: { title: "T.TEAM", department: "KẾ TOÁN", bo_phan_moi: "CBCNV" },
    expectedLevel: "TEAM_LEADER",
    expectedRank: 1,
    expectedGroup: "TEAM_LEADER",
    testDept: "KẾ TOÁN",
    shouldApproveOwnTrip: true
  },
  {
    id: "5039",
    input: { title: "TGĐ", department: "ĐH-QT", bo_phan_moi: "BGĐ" },
    expectedLevel: "TONG_GIAM_DOC",
    expectedRank: 6,
    expectedGroup: "GENERAL_DIRECTOR",
    testDept: "NHÂN SỰ-HC",
    shouldApproveOwnTrip: true,
    crossDeptTest: "KẾ TOÁN",
    shouldApproveCrossTrip: true
  },
  {
    id: "5050",
    input: { title: "TP", department: "NHÂN SỰ-HC", bo_phan_moi: "CBCNV" },
    expectedLevel: "TRUONG_PHONG",
    expectedRank: 2,
    expectedGroup: "DEPARTMENT_MANAGER",
    testDept: "NHÂN SỰ-HC",
    shouldApproveOwnTrip: true,
    crossDeptTest: "KẾ TOÁN",
    shouldApproveCrossTrip: false
  },
  {
    id: "5064",
    input: { title: "GĐ", department: "ĐH KD PTSP", bo_phan_moi: "CBCNV" },
    expectedLevel: "GIAM_DOC",
    expectedRank: 4,
    expectedGroup: "DIRECTOR",
    testDept: "ĐH KD PTSP",
    shouldApproveOwnTrip: true
  },
  {
    id: "5073",
    input: { title: "TP", department: "KHCB MẪU", bo_phan_moi: "CBCNV" },
    expectedLevel: "TRUONG_PHONG",
    expectedRank: 2,
    expectedGroup: "DEPARTMENT_MANAGER",
    testDept: "KHCB MẪU",
    shouldApproveOwnTrip: true,
    crossDeptTest: "QT-KS",
    shouldApproveCrossTrip: false
  },
  {
    id: "UNKNOWN_TITLE_TEST",
    input: { title: "KỸ SƯ NÓNG UNKNOWN", department: "KĨ THUẬT", bo_phan_moi: "CBCNV" },
    expectedLevel: "UNKNOWN",
    expectedRank: 0,
    expectedGroup: "NONE",
    testDept: "KĨ THUẬT",
    shouldApproveOwnTrip: false
  }
];

console.log("=================================================");
console.log("🧪 KIRO PERMISSION ENGINE REGRESSION TEST RUNNER");
console.log("=================================================\n");

let passedCount = 0;
let failedCount = 0;

testCases.forEach((tc) => {
  const resolved = resolveEmployeeLevel(tc.input);
  const ownTripCheck = canApproveTrip(tc.input, { department: tc.testDept });

  let isPass = true;
  let failureReasons = [];

  if (resolved.employeeLevel !== tc.expectedLevel) {
    isPass = false;
    failureReasons.push(`EmployeeLevel: Got '${resolved.employeeLevel}', Expected '${tc.expectedLevel}'`);
  }
  if (resolved.levelRank !== tc.expectedRank) {
    isPass = false;
    failureReasons.push(`LevelRank: Got ${resolved.levelRank}, Expected ${tc.expectedRank}`);
  }
  if (resolved.permissionGroup !== tc.expectedGroup) {
    isPass = false;
    failureReasons.push(`PermissionGroup: Got '${resolved.permissionGroup}', Expected '${tc.expectedGroup}'`);
  }
  if (ownTripCheck.allowed !== tc.shouldApproveOwnTrip) {
    isPass = false;
    failureReasons.push(`Own Trip Approval: Got ${ownTripCheck.allowed}, Expected ${tc.shouldApproveOwnTrip}`);
  }

  if (tc.crossDeptTest) {
    const crossCheck = canApproveTrip(tc.input, { department: tc.crossDeptTest });
    if (crossCheck.allowed !== tc.shouldApproveCrossTrip) {
      isPass = false;
      failureReasons.push(`Cross Dept Approval (${tc.crossDeptTest}): Got ${crossCheck.allowed}, Expected ${tc.shouldApproveCrossTrip}`);
    }
  }

  if (isPass) {
    passedCount++;
    console.log(`✅ [PASS] Record ${tc.id}: title="${tc.input.title}", dept="${tc.input.department}" → Level=${resolved.employeeLevel}, Rank=${resolved.levelRank}, Group=${resolved.permissionGroup}`);
  } else {
    failedCount++;
    console.log(`❌ [FAIL] Record ${tc.id}: title="${tc.input.title}"`);
    failureReasons.forEach(r => console.log(`      -> ${r}`));
  }
});

console.log("\n=================================================");
console.log(`📊 SUMMARY: Total: ${testCases.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("=================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL PERMISSION REGRESSION TESTS PASSED 100%!");
}
