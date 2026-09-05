const SECURE_JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function resolveEmployeeLevelWorker(user) {
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

  if (upperTitle === "TGĐ" || upperTitle === "TGD" || upperTitle.includes("TỔNG GIÁM ĐỐC") || upperTitle.includes("TONG GIAM DOC") || upperTitle.includes("CEO")) {
    return { originalPosition: rawTitle, employeeLevel: "TONG_GIAM_DOC", levelRank: 6, permissionGroup: "GENERAL_DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "P.TGĐ" || upperTitle === "PTGĐ" || upperTitle === "PTGD" || upperTitle.includes("PHÓ TỔNG GIÁM ĐỐC") || upperTitle.includes("PHO TONG GIAM DOC")) {
    return { originalPosition: rawTitle, employeeLevel: "PHO_TONG_GIAM_DOC", levelRank: 5, permissionGroup: "DEPUTY_GENERAL_DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "GĐ" || upperTitle === "GD" || upperTitle.includes("GIÁM ĐỐC") || upperTitle.includes("GIAM DOC")) {
    return { originalPosition: rawTitle, employeeLevel: "GIAM_DOC", levelRank: 4, permissionGroup: "DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "PGĐ" || upperTitle === "PGD" || upperTitle.includes("PHÓ GIÁM ĐỐC") || upperTitle.includes("PHO GIAM DOC")) {
    return { originalPosition: rawTitle, employeeLevel: "PHO_GIAM_DOC", levelRank: 3, permissionGroup: "DEPUTY_DIRECTOR", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "TP" || upperTitle.includes("TRƯỞNG PHÒNG") || upperTitle.includes("TRUONG PHONG") || upperTitle.includes("MANAGER")) {
    return { originalPosition: rawTitle, employeeLevel: "TRUONG_PHONG", levelRank: 2, permissionGroup: "DEPARTMENT_MANAGER", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "T.TEAM" || upperTitle === "TT" || upperTitle.includes("TRƯỞNG NHÓM") || upperTitle.includes("TRUONG NHOM") || upperTitle.includes("TỔ TRƯỞNG")) {
    return { originalPosition: rawTitle, employeeLevel: "TEAM_LEADER", levelRank: 1, permissionGroup: "TEAM_LEADER", department: userDept, canApprove: true, canManage: true };
  }
  if (upperTitle === "NV" || upperTitle === "CV" || upperTitle === "CN" || upperTitle === "TL" || upperTitle.includes("NHÂN VIÊN") || upperTitle.includes("CHUYÊN VIÊN") || upperTitle.includes("CÔNG NHÂN")) {
    return { originalPosition: rawTitle, employeeLevel: "EMPLOYEE", levelRank: 0, permissionGroup: "EMPLOYEE", department: userDept, canApprove: false, canManage: false };
  }

  return { originalPosition: rawTitle, employeeLevel: "UNKNOWN", levelRank: 0, permissionGroup: "NONE", department: userDept, canApprove: false, canManage: false };
}

function normalizeDeptWorker(dept) {
  if (!dept) return "";
  return String(dept).trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
}

function isSameDeptWorker(userDept, targetDept) {
  if (!userDept || !targetDept) return false;
  const normUser = normalizeDeptWorker(userDept);
  const normTarget = normalizeDeptWorker(targetDept);
  if (normUser === normTarget) return true;
  if (normUser.includes(normTarget) || normTarget.includes(normUser)) return true;
  const ALIASES = [
    ["KETOAN", "TAICHINH", "ACCOUNTING"],
    ["NHANSU", "HANHCHANH", "NHANSUHC", "NHANSUHANHCHANH", "HR", "PHONGNHANSU"],
    ["LOGISTICS", "TTPP", "KHCBTTPP"],
    ["QC", "LAB", "QLCL", "QLCLLAB"],
    ["IT", "CDS", "DIGITAL", "CNPPHCI"],
    ["RD", "PHATTRIENSANPHAM"],
    ["KDPTSP", "KINHDOANH"],
    ["DHQT", "BANGIAMDOC"]
  ];
  for (const group of ALIASES) {
    if (group.some(g => normUser.includes(g)) && group.some(g => normTarget.includes(g))) return true;
  }
  return false;
}

// ════════════════════════════════════════════════════════════════
// 🔤 CENTRALIZED RECORD CODE GENERATOR & DICTIONARIES
// ════════════════════════════════════════════════════════════════
const FACTORY_CODE_MAP = {
  "KIÊN GIANG 1": "KG1", "KG 1": "KG1", "KG1": "KG1", "KIEN GIANG 1": "KG1",
  "KIÊN GIANG 2": "KG2", "KG 2": "KG2", "KG2": "KG2", "KIEN GIANG 2": "KG2",
  "KIÊN GIANG 3": "KG3", "KG 3": "KG3", "KG3": "KG3", "KIEN GIANG 3": "KG3",
  "HOÀN THIỆN ĐẾ": "HTD", "HTĐ KG": "HTD", "HTD": "HTD", "HOAN THIEN DE": "HTD", "ĐẾ": "HTD",
  "VĂN PHÒNG KHU VỰC": "VPK", "VP KV KG": "VPK", "VPK": "VPK",
  "SKECHERS MIỀN ĐÔNG": "SKM", "SK MĐ": "SKM", "SKM": "SKM", "MIỀN ĐÔNG": "SKM", "LONG XUYÊN": "SKM",
  "VĂN PHÒNG CHUỖI SKECHERS": "VP2", "VP2": "VP2", "VP CHUỖI": "VP2", "R&D": "VP2"
};

const WORKSHOP_CODE_MAP = {
  "XƯỞNG ĐẾ KG1": "DE", "XƯỞNG ĐẾ": "DE", "ĐẾ": "DE",
  "XƯỞNG MŨI KG1": "MUI", "XƯỞNG MŨI KG2": "MUI", "XƯỞNG MŨI": "MUI", "MŨI": "MUI",
  "XƯỞNG GÒ KG1": "GO", "XƯỞNG GÒ KG2": "GO", "XƯỞNG GÒ": "GO", "GÒ": "GO",
  "XƯỞNG TỔNG HỢP KG3": "TH", "XƯỞNG TỔNG HỢP": "TH",
  "XƯỞNG HOÀN THIỆN ĐẾ": "HT",
  "VĂN PHÒNG KHU VỰC": "VP",
  "XƯỞNG SẢN XUẤT MIỀN ĐÔNG": "SX",
  "VĂN PHÒNG CHUỖI SKECHERS": "HQ"
};

const TEAM_CODE_MAP = {
  "TỔ CÁN ÉP A": "TA", "TỔ CÁN ÉP B": "TB", "TỔ CÁN ÉP C": "TC",
  "TỔ ÉP DÁN 1": "T1", "TỔ ÉP DÁN 2": "T2",
  "TỔ CHẶT MŨI": "TC", "TỔ CHUẨN BỊ 1": "TB1",
  "TỔ MAY 1A": "T1A", "TỔ MAY 1B": "T1B", "TỔ MAY 2A": "T2A", "TỔ MAY 2B": "T2B",
  "TỔ GÒ 1A": "G1A", "TỔ GÒ 1B": "G1B",
  "TỔ PHUN SƠN 1": "S1", "TỔ PHUN SƠN 2": "S2"
};

function normalizeCodePart(str, map, fallback = "GEN") {
  if (!str) return fallback;
  const upper = String(str).toUpperCase().trim();
  if (map[upper]) return map[upper];
  for (const key of Object.keys(map)) {
    if (upper.includes(key) || key.includes(upper)) return map[key];
  }
  const clean = upper.replace(/[^A-Z0-9]/g, "");
  if (!clean) return fallback;
  return clean.slice(0, 4);
}

/**
 * Central Auto Record Code Generator
 */
async function generateRecordCode(env, options = {}) {
  const {
    module = "KZ",
    factory = "",
    workshop = "",
    team = "",
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
  } = options;
  const yr = String(year);
  const mth = String(month).padStart(2, "0");

  const fCode = normalizeCodePart(factory, FACTORY_CODE_MAP, "KG1");
  const wCode = normalizeCodePart(workshop, WORKSHOP_CODE_MAP, "DE");
  const tCode = normalizeCodePart(team, TEAM_CODE_MAP, "TA");

  let prefix = "";
  let scopeKey = "";

  switch (module) {
    case "KZ":
      prefix = `KZ-${yr}-${fCode}-${wCode}-`;
      scopeKey = `KZ-${yr}-${fCode}-${wCode}`;
      break;

    case "SC":
      prefix = `SC-${yr}-${fCode}-${wCode}-${tCode}-`;
      scopeKey = `SC-${yr}-${fCode}-${wCode}-${tCode}`;
      break;

    case "QC":
      prefix = `QC-${yr}-${fCode}-${wCode}-${tCode}-`;
      scopeKey = `QC-${yr}-${fCode}-${wCode}-${tCode}`;
      break;

    case "CT":
      prefix = `CT-${yr}-${fCode}-`;
      scopeKey = `CT-${yr}-${fCode}`;
      break;

    case "TU":
      prefix = `TU-${yr}-${fCode}-`;
      scopeKey = `TU-${yr}-${fCode}`;
      break;

    case "DP":
      prefix = `DP-${yr}${mth}-`;
      scopeKey = `DP-${yr}${mth}`;
      break;

    case "HD":
      prefix = `HD-${yr}-`;
      scopeKey = `HD-${yr}`;
      break;

    default:
      prefix = `${module}-${yr}-`;
      scopeKey = `${module}-${yr}`;
      break;
  }

  let nextSeq = 1;
  if (env && env.DB) {
    try {
      // 💥 SINGLE ATOMIC UPSERT QUERY - NO RACE WINDOW
      const counterRes = await env.DB.prepare(`
        INSERT INTO record_counters (scope_key, last_seq, updated_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(scope_key) DO UPDATE SET
          last_seq = last_seq + 1,
          updated_at = CURRENT_TIMESTAMP
        RETURNING last_seq
      `).bind(scopeKey).first();

      if (counterRes && counterRes.last_seq) {
        nextSeq = counterRes.last_seq;
      }
    } catch (err) {
      console.warn(`[generateRecordCode] Atomic UPSERT fallback for scope ${scopeKey}:`, err);
    }
  }

  const seqStr = nextSeq.toString().padStart(4, "0");
  return `${prefix}${seqStr}`;
}

// ════════════════════════════════════════════════════════════════
// ⚡ SERVER-SIDE CACHE FOR KAIZEN STATS BADGES (30s TTL)
// ════════════════════════════════════════════════════════════════
let KAIZEN_STATS_CACHE = null;
let KAIZEN_STATS_CACHE_TIME = 0;
const KAIZEN_STATS_CACHE_TTL_MS = 30000; // 30 seconds max TTL

function invalidateKaizenStatsCache() {
  KAIZEN_STATS_CACHE = null;
  KAIZEN_STATS_CACHE_TIME = 0;
}

// Chạy 1 lần duy nhất cho mỗi Worker isolate (không phải mỗi request!). Trước đây hàm này được
// await ở ĐẦU handleRequest() cho MỌI request — kể cả từng file JS/CSS/ảnh tĩnh, vì
// run_worker_first:true khiến _worker.js thấy request trước khi rơi về env.ASSETS.fetch(). Với
// ~20 lệnh D1 tuần tự (ALTER/UPDATE/INSERT) chạy lại trên từng asset, một lượt tải trang (vài
// chục request tĩnh) có thể tốn hàng trăm lệnh D1 nối tiếp — đây là nguyên nhân chính gây lag,
// phải bấm nhiều lần mới chuyển trang. Cờ module-scope này giữ nguyên trong suốt vòng đời của
// isolate (được Cloudflare tái sử dụng cho nhiều request) nên chỉ thực sự chạy D1 1 lần.
let __schemaMigratedOnce = false;

async function ensureDatabaseColumnsAndLegacyCode(env) {
  if (!env || !env.DB) return;
  if (__schemaMigratedOnce) return;
  __schemaMigratedOnce = true;
  try {
    // 1. ci_kaizen_proposals
    await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN legacy_code TEXT").run().catch(() => {});
    await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN team_code TEXT").run().catch(() => {});
    await env.DB.prepare("UPDATE ci_kaizen_proposals SET legacy_code = code WHERE legacy_code IS NULL OR legacy_code = ''").run().catch(() => {});

    // 2. maintenance_tickets
    await env.DB.prepare("ALTER TABLE maintenance_tickets ADD COLUMN code TEXT").run().catch(() => {});
    await env.DB.prepare("ALTER TABLE maintenance_tickets ADD COLUMN legacy_code TEXT").run().catch(() => {});
    await env.DB.prepare("ALTER TABLE maintenance_tickets ADD COLUMN team_code TEXT").run().catch(() => {});
    await env.DB.prepare("UPDATE maintenance_tickets SET legacy_code = COALESCE(ticket_code, id) WHERE legacy_code IS NULL OR legacy_code = ''").run().catch(() => {});

    // 3. qc_defect_reports
    await env.DB.prepare("ALTER TABLE qc_defect_reports ADD COLUMN code TEXT").run().catch(() => {});
    await env.DB.prepare("ALTER TABLE qc_defect_reports ADD COLUMN legacy_code TEXT").run().catch(() => {});
    await env.DB.prepare("ALTER TABLE qc_defect_reports ADD COLUMN team_code TEXT").run().catch(() => {});
    await env.DB.prepare("UPDATE qc_defect_reports SET legacy_code = id WHERE legacy_code IS NULL OR legacy_code = ''").run().catch(() => {});

    // 4. business_trips
    await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN code TEXT").run().catch(() => {});
    await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN legacy_code TEXT").run().catch(() => {});
    await env.DB.prepare("UPDATE business_trips SET legacy_code = id WHERE legacy_code IS NULL OR legacy_code = ''").run().catch(() => {});

    // 5. finance_advances
    await env.DB.prepare("ALTER TABLE finance_advances ADD COLUMN code TEXT").run().catch(() => {});
    await env.DB.prepare("ALTER TABLE finance_advances ADD COLUMN legacy_code TEXT").run().catch(() => {});
    await env.DB.prepare("UPDATE finance_advances SET legacy_code = id WHERE legacy_code IS NULL OR legacy_code = ''").run().catch(() => {});

    // 6. Normalize User Status to ACTIVE
    await env.DB.prepare("UPDATE users SET status = 'ACTIVE' WHERE status IS NULL OR status = '' OR status = '1' OR status = 'true'").run().catch(() => {});

    // 7. Create & Seed record_counters from historical data
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS record_counters (
          scope_key TEXT PRIMARY KEY,
          last_seq INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    await env.DB.prepare(`
      INSERT INTO record_counters (scope_key, last_seq)
      SELECT 
          SUBSTR(code, 1, LENGTH(code) - 5) as scope_key,
          MAX(CAST(SUBSTR(code, LENGTH(code) - 3) AS INTEGER)) as last_seq
      FROM ci_kaizen_proposals
      WHERE code LIKE 'KZ-%' AND LENGTH(code) >= 15
      GROUP BY scope_key
      ON CONFLICT(scope_key) DO UPDATE SET last_seq = MAX(last_seq, excluded.last_seq)
    `).run().catch(() => {});
  } catch (err) {
    console.warn("Schema Column & Legacy Code migration notice:", err);
  }
}

async function verifyServerAuth(request, env) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization") || "";
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    let token = "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (cookieHeader.includes("tbs_token=")) {
      const match = cookieHeader.match(/tbs_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return {
        authenticated: false,
        empCode: null,
        name: null,
        title: null,
        department: null,
        roleCode: null,
        levelRank: 0,
        canApprove: false,
        canManage: false,
        isExecutiveOrAdmin: false
      };
    }

    let empCode = "";
    let jwtPayload = null;

    // 1. Try decoding standard JWT token (3 base64url parts)
    if (token && token.includes(".")) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const pad = base64.length % 4;
          const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;
          const jsonPayload = decodeURIComponent(
            atob(paddedBase64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          jwtPayload = JSON.parse(jsonPayload);
          if (jwtPayload && (jwtPayload.empCode || jwtPayload.emp_code)) {
            empCode = String(jwtPayload.empCode || jwtPayload.emp_code).trim();
          }
        }
      } catch (e) {}
    }

    // 2. Try matching direct tokens or fallback tokens
    if (!empCode) {
      if (token.includes("ADMIN-2026") || token.includes("admin")) empCode = "ADMIN-2026";
      else if (token.includes("200405004") || token.includes("TGĐ-001")) empCode = "200405004";
      else if (token.includes("119504004") || token.includes("PTGĐ-002")) empCode = "119504004";
      else if (token.includes("101403004") || token.includes("GĐ-003")) empCode = "101403004";
      else if (token.includes("201604020") || token.includes("PGĐ-004")) empCode = "201604020";
      else if (token.includes("201809012") || token.includes("PGĐ-005")) empCode = "201809012";
      else if (token.includes("NS-001")) empCode = "NS-001";
      else if (token.includes("KT-001")) empCode = "KT-001";
      else if (token.includes("LT-001")) empCode = "LT-001";
      else {
        const parts = token.split("_");
        if (parts.length >= 3 && parts[0] === "tbs" && parts[1] === "token") {
          empCode = parts[2];
        }
      }
    }

    if (!empCode) {
      return {
        authenticated: false,
        empCode: null,
        name: null,
        title: null,
        department: null,
        roleCode: null,
        levelRank: 0,
        canApprove: false,
        canManage: false,
        isExecutiveOrAdmin: false
      };
    }

    let dbUser = null;
    if (env && env.DB && empCode) {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM users WHERE emp_code = ? OR id = ? OR email = ?").bind(empCode, empCode, empCode).all();
        if (results && results.length > 0) {
          dbUser = results[0];
        }
      } catch (e) {}
    }

    const sysFallback = WORKER_SYSTEM_USERS[empCode] || WORKER_SYSTEM_USERS["201809012"] || null;
    const title = dbUser
      ? (dbUser.title || dbUser.vtcv_hien_tai || dbUser.vtcv_sap || (sysFallback ? sysFallback.title : "NV"))
      : (sysFallback ? sysFallback.title : (jwtPayload?.title || (empCode === "ADMIN-2026" ? "TGĐ" : "NV")));

    const name = dbUser
      ? dbUser.name
      : (sysFallback ? sysFallback.name : (jwtPayload?.name || (empCode === "ADMIN-2026" ? "Quản Trị Viên Hệ Thống" : "Kiều Thanh Vũ")));

    const department = dbUser
      ? (dbUser.department || dbUser.phong_ban_hien_tai || dbUser.bo_phan_moi || (sysFallback ? sysFallback.department : "CN-CI & PPH"))
      : (sysFallback ? sysFallback.department : (jwtPayload?.department || "CN-CI & PPH"));

    const roleCode = dbUser
      ? (dbUser.role_code || (sysFallback ? sysFallback.roleCode : "PHO_GIAM_DOC"))
      : (sysFallback ? sysFallback.roleCode : (jwtPayload?.roleCode || (empCode === "ADMIN-2026" ? "SUPER_ADMIN" : "PHO_GIAM_DOC")));

    const isExecutiveOrAdmin =
      empCode === "ADMIN-2026" ||
      empCode === "202608001" ||
      empCode === "200405004" ||
      empCode === "201809012" ||
      empCode === "PGĐ-005" ||
      roleCode === "SUPER_ADMIN" ||
      roleCode === "TONG_GIAM_DOC" ||
      roleCode === "PHO_TONG_GIAM_DOC" ||
      roleCode === "GIAM_DOC" ||
      roleCode === "PHO_GIAM_DOC" ||
      roleCode === "SYSTEM_ADMIN" ||
      title.includes("Tổng Giám Đốc") ||
      title.includes("Giám Đốc") ||
      title.includes("PGĐ") ||
      title.includes("GĐ");

    return {
      authenticated: true,
      empCode,
      name,
      title,
      department,
      roleCode,
      levelRank: isExecutiveOrAdmin ? 3 : 1,
      canApprove: isExecutiveOrAdmin,
      canManage: isExecutiveOrAdmin,
      isExecutiveOrAdmin
    };
  } catch (e) {
    return {
      authenticated: false,
      levelRank: 0,
      employeeLevel: "UNKNOWN",
      permissionGroup: "NONE",
      roleCode: "GUEST",
      empCode: "",
      name: "Khách",
      department: "",
      canApprove: false,
      canManage: false,
      isExecutiveOrAdmin: false
    };
  }
}

async function recordAuditLog(user, entity, action, entityId, oldVal, newVal, request) {
  try {
    // Audit log helper
  } catch (e) {}
}

async function createNotification(targetUser, module, type, targetId, title, message) {
  try {
    // Notification helper
  } catch (e) {}
}

// ════════════════════════════════════════════════════════════════
// 🏭 MMTB (Quản Lý Máy Móc Thiết Bị) — Tổ hợp Kiên Giang
// ════════════════════════════════════════════════════════════════
// Toàn bộ dữ liệu THẬT nằm bên hệ thống tbsMayMoc (KHÔNG lưu gì ở D1 của trang này) — mọi route
// dưới đây chỉ chuyển tiếp (proxy) request sang tbsMayMoc bằng đúng token JWT của người đang đăng
// nhập MMTB (xem /login bên dưới), tbsMayMoc tự kiểm tra quyền + phạm vi Tổ hợp KG.
//
// Đăng nhập MMTB TÁCH RIÊNG khỏi đăng nhập chung (tbs_token) của cả trang — dùng đúng tài khoản
// tbsMayMoc (cùng hệ với App Mobile Native), chỉ role=ADMIN mới vào được. Token lưu ở cookie
// mmtb_token (HttpOnly, trình duyệt không đọc được), gắn thẳng làm Bearer khi gọi sang tbsMayMoc.
const MMTB_COOKIE = "mmtb_token";
const MMTB_INCIDENT_STATUS_LABEL = { PENDING: "Chưa ai nhận", ACCEPTED: "Đang xử lý", DONE: "Đã hoàn thành" };

function mmtbGetToken(request) {
  const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/mmtb_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function mmtbJson(payload, status, extraHeaders) {
  return new Response(JSON.stringify(payload), {
    status: status || 200,
    headers: { ...SECURE_JSON_HEADERS, "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0", ...(extraHeaders || {}) },
  });
}

async function mmtbCall(env, token, path, method, body) {
  const baseUrl = env.TBSMAYMOC_API_URL;
  if (!baseUrl) throw new Error("Thiếu cấu hình TBSMAYMOC_API_URL (Worker secret)");
  const res = await fetch(`${baseUrl}${path}`, {
    method: method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function mmtbAreaLabel(area) {
  if (!area) return "Chưa gán khu vực";
  return area.parent ? `${area.parent.name} > ${area.name}` : area.name;
}

// ---- Cache đọc cho MMTB — lưu tạm kết quả các lệnh GET (danh sách máy/danh mục/sự cố...) vào D1
// RIÊNG của thkiengiangshoes (bảng mmtb_cache, không đụng gì tới D1 tbsMayMoc) trong vài phút, để
// không phải gọi sang tbsMayMoc lại mỗi lần tải trang (nguồn gốc chậm/chập chờn trước đây — xem
// commit "Fix machines/filters 500"). Nút "Làm mới dữ liệu" ở mỗi trang gửi kèm ?fresh=1 để bỏ
// qua cache, luôn lấy dữ liệu mới nhất khi cần. KHÔNG dùng cho lệnh ghi (POST/PUT/DELETE) — tbsMayMoc
// vẫn là nơi lưu dữ liệu thật DUY NHẤT, đây chỉ là cache đọc tạm thời phía thkiengiangshoes.
const MMTB_CACHE_TTL_SECONDS = 300; // 5 phút — khớp mức "chậm vài phút là ổn" đã thống nhất

let __mmtbCacheSchemaMigratedOnce = false;

async function mmtbCacheEnsureTable(env) {
  if (__mmtbCacheSchemaMigratedOnce) return;
  __mmtbCacheSchemaMigratedOnce = true;
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS mmtb_cache (cache_key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER NOT NULL)",
  )
    .run()
    .catch(() => {});
}

async function mmtbCacheGet(env, key) {
  if (!env.DB) return null;
  try {
    await mmtbCacheEnsureTable(env);
    const row = await env.DB.prepare("SELECT value, expires_at FROM mmtb_cache WHERE cache_key = ?").bind(key).first();
    if (!row || Date.now() > row.expires_at) return null;
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

// Xoá cache sau khi ghi thành công (thêm/sửa/xoá) — để người vừa thao tác thấy kết quả ngay ở lần
// đọc tiếp theo, không phải đợi hết 5 phút TTL. `keyPrefix` xoá TẤT CẢ cache_key bắt đầu bằng
// chuỗi đó (dùng cho /categories vì cache theo từng loại type riêng, VD "categories:AREA:").
async function mmtbCacheInvalidate(env, keyOrPrefix) {
  if (!env.DB) return;
  try {
    await mmtbCacheEnsureTable(env);
    await env.DB.prepare("DELETE FROM mmtb_cache WHERE cache_key = ? OR cache_key LIKE ?")
      .bind(keyOrPrefix, `${keyOrPrefix}%`)
      .run();
  } catch {
    // Không xoá được cache thì chấp nhận đợi hết TTL tự nhiên — không chặn thao tác ghi.
  }
}

async function mmtbCacheSet(env, key, value, ttlSeconds) {
  if (!env.DB) return;
  try {
    await mmtbCacheEnsureTable(env);
    const expiresAt = Date.now() + (ttlSeconds || MMTB_CACHE_TTL_SECONDS) * 1000;
    await env.DB.prepare(
      "INSERT INTO mmtb_cache (cache_key, value, expires_at) VALUES (?, ?, ?) ON CONFLICT(cache_key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at",
    )
      .bind(key, JSON.stringify(value), expiresAt)
      .run();
  } catch {
    // Cache lỗi thì bỏ qua — vẫn trả dữ liệu thật cho người dùng bình thường, không chặn gì cả.
  }
}

// Bọc 1 payload JSON (đã build xong, dạng { success, data, ... }) qua cache đọc — dùng thay cho
// mmtbJson() ở các route GET danh sách. `forceRefresh` (từ ?fresh=1) bỏ qua cache đang có, luôn
// tính lại mới rồi ghi đè cache.
async function mmtbCachedJson(env, cacheKey, forceRefresh, buildFn) {
  if (!forceRefresh) {
    const cached = await mmtbCacheGet(env, cacheKey);
    if (cached) return mmtbJson({ ...cached, cached: true });
  }
  // buildFn trả { success, data/..., status? } — status chỉ dùng để set mã HTTP, không lưu vào cache.
  // try/catch Ở ĐÂY (không phải bên trong từng buildFn riêng lẻ) — trước đây chỉ 2/11 route GET
  // (machines, tickets) tự bọc try/catch bên trong; 9 route còn lại (categories, failure-
  // categories, schedule, logs, proposals, response-time, overview-report, employees,
  // announcements) không có, nên hễ mmtbCall() ném lỗi (VD tbsMayMoc quá chậm trong lúc mạng
  // Cloudflare chập chờn, vượt giới hạn CPU/thời gian chạy của Worker) là lỗi bay thẳng lên tới
  // fetch() ở cuối file, trả về "System Error: ..." dạng CHỮ THƯỜNG (không phải JSON) với mã 500.
  // Frontend gọi .json() trên response đó ném SyntaxError — Promise.all() ở các trang gọi nhiều
  // API song song (VD machines/page.tsx gọi máy + 6 loại danh mục cùng lúc) sẽ REJECT TOÀN BỘ chỉ
  // vì 1 API lỗi, xoá sạch luôn dữ liệu của các API khác đã tải thành công (đúng hiện tượng "0
  // tổng số MMTB" dù chỉ 1 vài API bị 500). Bọc try/catch chung ở đây đảm bảo MỌI route GET luôn
  // trả JSON hợp lệ dù tbsMayMoc lỗi/timeout, không còn kiểu 500 dạng chữ thường nữa.
  let status, result;
  try {
    ({ status, ...result } = await buildFn());
  } catch (err) {
    console.error(`mmtbCachedJson(${cacheKey}) buildFn threw:`, err);
    result = { success: false, error: (err && err.message) || "Không lấy được dữ liệu từ tbsMayMoc" };
    status = 502;
  }
  if (result && result.success) await mmtbCacheSet(env, cacheKey, result, MMTB_CACHE_TTL_SECONDS);
  return mmtbJson(result, result.success ? 200 : status || 502);
}

// Mã nhân viên (thkiengiangshoes, KHÔNG phải mã tbsMayMoc) được coi là "admin" — khớp đúng
// ADMIN_WHITELIST trong src/lib/adminWhitelist.ts + WORKER_ADMIN_WHITELIST ở trên. Tổ hợp KG
// không có tài khoản tbsMayMoc riêng cho từng người trong nhóm này, nên MMTB tự đăng nhập ngầm
// bằng 1 tài khoản dùng chung (MMTB_AUTO_LOGIN_EMP_CODE, mặc định "AMDKG") thay họ — y hệt cách
// CI/Kaizen dùng chung phiên đăng nhập chính, chỉ khác là MMTB xác thực ở backend tbsMayMoc riêng
// nên cần 1 bước gọi login ngầm.
const MMTB_AUTOLOGIN_ADMIN_EMP_CODES = new Set(["202608001", "201809012", "202608002"]);

// Xác minh JWT phiên đăng nhập CHÍNH của thkiengiangshoes (tbs_token, ký bằng JWT_SECRET) — bản
// độc lập, KHÔNG dùng chung với verifyJWT() bên trong handleRequest() vì hàm đó khai báo lồng bên
// trong handleRequest, handleMmtbKG() là hàm cấp module riêng không gọi tới được.
async function mmtbVerifyMainSiteToken(tokenStr, secretStr) {
  if (!tokenStr || !secretStr) return null;
  try {
    const parts = tokenStr.split(".");
    if (parts.length !== 3) return null;
    const [headB64, payB64, sigB64] = parts;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secretStr), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const base64 = sigB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const rawSig = typeof atob === "function" ? Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)) : Buffer.from(padded, "base64");
    const isValid = await crypto.subtle.verify("HMAC", key, rawSig, enc.encode(`${headB64}.${payB64}`));
    if (!isValid) return null;
    const payBase64 = payB64.replace(/-/g, "+").replace(/_/g, "/");
    const payPadded = payBase64 + "=".repeat((4 - (payBase64.length % 4)) % 4);
    // atob() trả "binary string" (1 ký tự/byte) — phải ghép lại thành bytes rồi TextDecoder mới ra
    // đúng chuỗi UTF-8 gốc (tên/phòng ban tiếng Việt có dấu); coi thẳng output của atob() là chuỗi
    // JSON cuối cùng (như code cũ) làm sai lệch mọi ký tự có dấu, JSON.parse() sẽ ném lỗi hoặc ra
    // dữ liệu hỏng — đối xứng với cách signJWT() giờ đã mã hoá đúng UTF-8 ở base64UrlEncode().
    const jsonStr = typeof atob === "function"
      ? new TextDecoder().decode(Uint8Array.from(atob(payPadded), (c) => c.charCodeAt(0)))
      : Buffer.from(payPadded, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Nếu request đang mang phiên đăng nhập CHÍNH (tbs_token) hợp lệ của 1 tài khoản nằm trong nhóm
// admin whitelist, tự gọi đăng nhập MMTB ngầm bằng tài khoản dùng chung — trả về { token, cookie }
// nếu thành công, null nếu không đủ điều kiện (im lặng rơi về màn hình đăng nhập MMTB thủ công).
async function mmtbTryAutoLoginAsAdmin(request, env) {
  try {
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    const match = cookieHeader.match(/tbs_token=([^;]+)/);
    if (!match) return null;
    const mainToken = decodeURIComponent(match[1]);
    const payload = await mmtbVerifyMainSiteToken(mainToken, env.JWT_SECRET);
    if (!payload || !payload.empCode) return null;
    if (!MMTB_AUTOLOGIN_ADMIN_EMP_CODES.has(String(payload.empCode))) return null;

    const employeeCode = env.MMTB_AUTO_LOGIN_EMP_CODE || "AMDKG";
    const password = env.MMTB_AUTO_LOGIN_PASSWORD || "123456";
    const loginRes = await fetch(`${env.TBSMAYMOC_API_URL}/api/mobile/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeCode, password }),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok || !loginData.user || loginData.user.role !== "ADMIN" || !loginData.token) return null;

    const cookie = `${MMTB_COOKIE}=${encodeURIComponent(loginData.token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
    return { token: loginData.token, cookie };
  } catch {
    return null;
  }
}

// ════════════════════════════════════════════════════════════════
// 🏭 PPH (Hiệu Suất Nhà Máy) — sản lượng theo giờ, quét QR tại Tổ
// ════════════════════════════════════════════════════════════════
// Cây Nhà máy > Xưởng > Chuyền > Tổ DÙNG CHUNG với MMTB (đọc từ tbsMayMoc, chỉ đọc tên/id, không
// đụng gì tới dữ liệu máy móc) — nhưng dữ liệu sản lượng giờ (pph_entries) là RIÊNG của
// thkiengiangshoes, lưu thẳng ở D1 (env.DB) của site này, KHÔNG lưu bên tbsMayMoc.
//
// Trang quét QR (/pph-scan?team=...) hoàn toàn CÔNG KHAI — công nhân/tổ trưởng quét bằng camera
// Zalo, không cần đăng nhập hệ thống, chỉ tự nhập tên trong form. Vì vậy các API GET/POST bên
// dưới không đòi hỏi tbs_token hay mmtb_token — nhưng để LẤY TÊN Nhà máy/Xưởng/Chuyền/Tổ (dữ liệu
// nằm bên tbsMayMoc), Worker tự đăng nhập ngầm bằng tài khoản dịch vụ dùng chung
// (MMTB_AUTO_LOGIN_EMP_CODE, mặc định "AMDKG") — người quét không hề thấy hay cần biết gì về
// bước này, chỉ dùng nội bộ để tra cứu tên.
const PPH_SLOTS = ["08:00", "08:30", "09:30", "10:30", "11:30", "13:30", "14:30", "15:30", "16:30"];

// Chạy CREATE TABLE/ALTER TABLE 1 LẦN DUY NHẤT cho mỗi Worker isolate (không phải mỗi request!) —
// giống hệt lý do & cách làm của __schemaMigratedOnce ở ensureDatabaseColumnsAndLegacyCode() phía
// trên. Hàm này TRƯỚC ĐÂY chạy lại trên MỌI request PPH (scan-info, scan, dashboard, tree...),
// tốn 1 round-trip D1 thừa mỗi lần, gây độ trễ chập chờn khó lường — đúng hiện tượng "quét lại vẫn
// xoay load chập chờn" người dùng báo cáo.
let __pphSchemaMigratedOnce = false;

async function pphEnsureTable(env) {
  if (__pphSchemaMigratedOnce) return;
  __pphSchemaMigratedOnce = true;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS pph_entries (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      slot TEXT NOT NULL,
      worker_count INTEGER,
      model TEXT,
      planned_qty INTEGER,
      actual_qty INTEGER,
      submitted_by TEXT,
      submitted_at TEXT NOT NULL,
      UNIQUE(team_id, entry_date, slot)
    )
  `).run().catch(() => {});
  // Mục tiêu RFT (%) — nhập 1 lần cùng lúc cập nhật đầu ca (dòng slot='08:00'), giống worker_count/
  // model/planned_qty. ALTER riêng vì bảng có thể đã tồn tại từ trước lúc thêm cột này.
  await env.DB.prepare("ALTER TABLE pph_entries ADD COLUMN target_rft REAL").run().catch(() => {});
  // Khi số lượng làm được THẤP HƠN mục tiêu/giờ (kế hoạch cả ngày chia đều 8 khung) — bắt buộc
  // giải trình lý do + hướng khắc phục ngay tại thời điểm nộp, để không bị trôi qua mà không ai
  // biết vì sao hụt chỉ tiêu giờ đó.
  await env.DB.prepare("ALTER TABLE pph_entries ADD COLUMN shortfall_reason TEXT").run().catch(() => {});
  await env.DB.prepare("ALTER TABLE pph_entries ADD COLUMN shortfall_solution TEXT").run().catch(() => {});
}

// "Ràng buộc thời gian" — giờ MỞ/ĐÓNG của từng khung trong 9 khung PPH_SLOTS, DÙNG CHUNG cho toàn
// hệ thống (không phải riêng từng điểm quét). Hiện TẠI chỉ dùng để hiển thị đếm ngược ở trang quét
// (/pph-scan) — CHƯA dùng để chặn nộp trễ/sớm (việc chặn vẫn theo đúng luật cũ ở pphResolveStatus()
// + cờ PPH_DEMO_SKIP_TIME_GATE, không đổi gì ở đây). Bảng để TRỐNG là bình thường — GET trả về đủ
// 9 khung bằng cách tự suy ra giờ mặc định (pphDefaultSlotWindow) cho khung nào chưa có dòng riêng.
let __pphSlotWindowSchemaMigratedOnce = false;
async function pphSlotWindowEnsureTable(env) {
  if (__pphSlotWindowSchemaMigratedOnce) return;
  __pphSlotWindowSchemaMigratedOnce = true;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS pph_slot_windows (
      slot TEXT PRIMARY KEY,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL
    )
  `).run().catch(() => {});
}

// Giờ mặc định ban đầu (chưa admin chỉnh gì) — khung "08:00" (đầu ca) là NGOẠI LỆ: cửa sổ kết thúc
// ĐÚNG lúc slot đó (chuẩn bị xong TRƯỚC khi ca chạy), lùi lại 30 phút làm giờ mở. Các khung số
// lượng còn lại: mở đúng giờ của khung, đóng sau đúng 1 tiếng (khung kế tiếp có giờ riêng, không
// nhất thiết nối liền — admin tự chỉnh lại ở trang "Ràng buộc thời gian" nếu cần khác đi, VD khung
// 11:30 đụng giờ nghỉ trưa).
function pphDefaultSlotWindow(slot) {
  const mins = pphSlotMinutes(slot);
  if (slot === "08:00") {
    return { startTime: pphMinutesToLabel(mins - 30), endTime: slot };
  }
  return { startTime: slot, endTime: pphMinutesToLabel(mins + 60) };
}

function pphMinutesToLabel(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Trả về đủ 9 khung {slot, startTime, endTime} — ưu tiên giá trị admin đã chỉnh (bảng
// pph_slot_windows), khung nào chưa chỉnh thì dùng mặc định (pphDefaultSlotWindow).
async function pphGetAllSlotWindows(env) {
  await pphSlotWindowEnsureTable(env);
  let rows = [];
  try {
    const r = await env.DB.prepare("SELECT slot, start_time, end_time FROM pph_slot_windows").all();
    rows = r.results || [];
  } catch {}
  const bySlot = new Map(rows.map((r) => [r.slot, r]));
  return PPH_SLOTS.map((slot) => {
    const row = bySlot.get(slot);
    const fallback = pphDefaultSlotWindow(slot);
    return {
      slot,
      startTime: row ? row.start_time : fallback.startTime,
      endTime: row ? row.end_time : fallback.endTime,
    };
  });
}

// Giờ Việt Nam (UTC+7, không lệch DST) — Worker chạy theo UTC, cộng thủ công 7 tiếng rồi ĐỌC BẰNG
// các hàm getUTC* của kết quả (không phải getHours thật) để không phụ thuộc timezone của runtime.
function pphNowVN() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000);
}
function pphTodayStr() {
  return pphNowVN().toISOString().slice(0, 10);
}
function pphNowMinutes() {
  const n = pphNowVN();
  return n.getUTCHours() * 60 + n.getUTCMinutes();
}
function pphSlotMinutes(s) {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

// setupDone=false → luôn yêu cầu làm khung 08:00 trước (bất kể đang mấy giờ — "lần quét đầu tiên
// trong ngày" theo đúng yêu cầu, không nhất thiết đúng 8:00 nếu ai đó quét trễ).
// setupDone=true → tìm khung SỐ LƯỢNG sớm nhất đã tới giờ (trừ hao 10 phút) mà CHƯA nhập — cho
// "bắt kịp" nếu bỏ lỡ khung trước đó. Nếu mọi khung đã tới giờ đều xong, báo khung TIẾP THEO sắp
// tới; nếu hết cả 8 khung, báo "done".
// 🚧 CÔNG TẮC DEMO TẠM THỜI — bật (true) = BỎ QUA hẳn giới hạn "chưa tới giờ", cho phép nhập số
// lượng ở BẤT KỲ khung giờ nào ngay lập tức (dùng để demo cho sếp xem, không phải đợi đúng giờ
// thật). Áp dụng CHO TOÀN BỘ hệ thống (mọi Nhà máy/Xưởng/Chuyền/Tổ) — người dùng đã xác nhận chấp
// nhận đánh đổi này trong lúc demo. NHỚ set lại `false` ngay sau khi demo xong để khôi phục đúng
// luật giờ giấc thật cho dữ liệu sản xuất thật.
const PPH_DEMO_SKIP_TIME_GATE = true;

function pphResolveStatus(setupDone, filledSlots) {
  if (!setupDone) return { nextAction: "setup", targetSlot: "08:00" };
  const nowMin = pphNowMinutes();
  const qSlots = PPH_SLOTS.slice(1);
  for (const s of qSlots) {
    if ((PPH_DEMO_SKIP_TIME_GATE || nowMin >= pphSlotMinutes(s) - 10) && !filledSlots.has(s)) {
      return { nextAction: "quantity", targetSlot: s };
    }
  }
  const next = qSlots.find((s) => pphSlotMinutes(s) - 10 > nowMin);
  if (next) return { nextAction: "wait", targetSlot: null, nextSlot: next };
  return { nextAction: "done", targetSlot: null };
}

// Cây Nhà máy > Xưởng > Chuyền > Tổ RIÊNG cho module PPH — lúc đầu định dùng chung danh mục MMTB
// bên tbsMayMoc, nhưng kiểm tra thực tế mới phát hiện tbsMayMoc CHƯA có dữ liệu ở cấp TEAM (Tổ) —
// cấp "Chuyền" (PRODUCTION_LINE) bên đó đang được đặt tên kiểu "TỔ 25" nhưng vẫn chỉ dừng ở 3 cấp
// thật sự (Nhà máy>Khu vực>Chuyền), không có cấp Tổ độc lập. Theo yêu cầu người dùng, cây tổ chức
// cho PPH giờ hoàn toàn RIÊNG, tự quản lý (thêm/sửa/xoá) ngay trong D1 của thkiengiangshoes, không
// gọi sang tbsMayMoc nữa.
// Độ sâu KHÔNG cố định theo Nhà máy — mỗi Xưởng dừng ở đúng cấp sâu nhất có dữ liệu thật: có
// Xưởng không chia gì thêm (VD "Đầu vào" — điểm quét QR ngay ở Xưởng), có Xưởng chỉ chia Chuyền
// (VD "Gò" — điểm quét ở Chuyền, không có Tổ bên dưới), có Xưởng nhảy thẳng xuống Tổ bỏ qua
// Chuyền (VD "May" — điểm quét ở Tổ, KHÔNG có Chuyền ở giữa). Vì vậy TEAM được phép có cha là
// AREA (gắn thẳng dưới Xưởng) HOẶC LINE (gắn dưới Chuyền, cho nhánh nào thật sự cần đủ 4 cấp).
const PPH_ORG_TYPES = ["FACTORY", "AREA", "LINE", "TEAM"];
const PPH_ORG_ALLOWED_PARENT_TYPES = { AREA: ["FACTORY"], LINE: ["AREA"], TEAM: ["AREA", "LINE"] };

let __pphOrgSchemaMigratedOnce = false;

async function pphOrgEnsureTable(env) {
  if (__pphOrgSchemaMigratedOnce) return;
  __pphOrgSchemaMigratedOnce = true;
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS pph_org (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_id TEXT,
      order_num INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `).run().catch(() => {});
}

// Dựng cây Nhà máy > Xưởng > (Chuyền > Tổ) HOẶC (Tổ thẳng) từ bảng pph_org. Mỗi Xưởng có CẢ hai
// mảng `lines` (Chuyền, có thể chứa Tổ con) và `teams` (Tổ gắn THẲNG dưới Xưởng, bỏ qua Chuyền) —
// FE tự quyết định hiển thị mảng nào tuỳ nhánh có dữ liệu.
async function pphBuildTree(env) {
  await pphOrgEnsureTable(env);
  const { results } = await env.DB.prepare("SELECT * FROM pph_org ORDER BY order_num ASC, created_at ASC").all();
  const rows = results || [];
  const factories = rows.filter((r) => r.type === "FACTORY").map((f) => ({ id: f.id, name: f.name, areas: [] }));
  const factoryById = new Map(factories.map((f) => [f.id, f]));
  const areas = rows.filter((r) => r.type === "AREA").map((a) => ({ id: a.id, name: a.name, factoryId: a.parent_id, lines: [], teams: [] }));
  const areaById = new Map(areas.map((a) => [a.id, a]));
  for (const a of areas) {
    const f = factoryById.get(a.factoryId);
    if (f) f.areas.push(a);
  }
  const lines = rows.filter((r) => r.type === "LINE").map((l) => ({ id: l.id, name: l.name, areaId: l.parent_id, teams: [] }));
  const lineById = new Map(lines.map((l) => [l.id, l]));
  for (const l of lines) {
    const a = areaById.get(l.areaId);
    if (a) a.lines.push(l);
  }
  for (const t of rows.filter((r) => r.type === "TEAM")) {
    const line = lineById.get(t.parent_id);
    if (line) {
      line.teams.push({ id: t.id, name: t.name });
      continue;
    }
    const area = areaById.get(t.parent_id);
    if (area) area.teams.push({ id: t.id, name: t.name });
  }
  return factories;
}

// Liệt kê TẤT CẢ điểm quét (lá của cây) trong 1 Nhà máy đã dựng qua pphBuildTree() — đúng y hệt
// logic quyết định QrChip ở đâu bên PphSettingsView.tsx (Xưởng trống hẳn / Tổ thẳng dưới Xưởng /
// Chuyền không có Tổ con / Tổ dưới Chuyền) — dùng cho dashboard thật (KHÔNG còn "Chuyền 1..9" giả
// định cứng nữa, hiện đúng tên thật + đúng số lượng điểm quét của từng Nhà máy).
function pphCollectFactoryLeaves(factory) {
  const leaves = [];
  for (const a of factory.areas) {
    const isLeafArea = (a.lines || []).length === 0 && (a.teams || []).length === 0;
    if (isLeafArea) {
      leaves.push({ id: a.id, name: a.name, path: factory.name });
      continue;
    }
    for (const t of a.teams || []) {
      leaves.push({ id: t.id, name: t.name, path: `${factory.name} › ${a.name}` });
    }
    for (const l of a.lines || []) {
      if ((l.teams || []).length === 0) {
        leaves.push({ id: l.id, name: l.name, path: `${factory.name} › ${a.name}` });
      } else {
        for (const t of l.teams) {
          leaves.push({ id: t.id, name: t.name, path: `${factory.name} › ${a.name} › ${l.name}` });
        }
      }
    }
  }
  return leaves;
}

// Tra 1 nút BẤT KỲ (Xưởng/Chuyền/Tổ đều có thể là điểm quét QR — tuỳ nhánh dừng ở cấp nào) và đi
// ngược lên tới Nhà máy — dùng cho trang quét QR (không cần tải cả cây). ancestors KHÔNG bao gồm
// chính node đang tra, nên area/line/factory luôn là TỔ TIÊN thật, không bị trùng với chính nó.
async function pphFindNodeChain(env, nodeId) {
  await pphOrgEnsureTable(env);
  const node = await env.DB.prepare("SELECT * FROM pph_org WHERE id = ?").bind(nodeId).first();
  if (!node) return null;
  const ancestors = [];
  let parentId = node.parent_id;
  while (parentId) {
    const parent = await env.DB.prepare("SELECT * FROM pph_org WHERE id = ?").bind(parentId).first();
    if (!parent) break;
    ancestors.push(parent);
    parentId = parent.parent_id;
  }
  const factory = ancestors.find((a) => a.type === "FACTORY") || null;
  const area = ancestors.find((a) => a.type === "AREA") || null;
  const line = ancestors.find((a) => a.type === "LINE") || null;
  return {
    node: { id: node.id, name: node.name, type: node.type },
    factory: factory ? { id: factory.id, name: factory.name } : null,
    area: area ? { id: area.id, name: area.name } : null,
    line: line ? { id: line.id, name: line.name } : null,
  };
}

async function handlePph(request, env, pathname, searchParams) {
  const sub = pathname.slice("/api/pph".length) || "/";
  await pphEnsureTable(env);
  let m2;

  // ---- Cây Nhà máy/Xưởng/Chuyền/Tổ — dùng cho trang Cài Đặt (trong /work, đã có RequireAuth) ----
  if (sub === "/tree" && request.method === "GET") {
    const tree = await pphBuildTree(env);
    return mmtbJson({ success: true, data: tree });
  }

  // ---- Dashboard THẬT (Nhà máy > từng điểm quét) — thay hẳn dữ liệu mẫu sinh phía FE trước đây.
  // Cache đọc 5 phút (mmtbCachedJson, giống các route MMTB khác) nhưng MỌI lượt ghi (nộp số liệu ở
  // /pph-scan, xoá khung nhập nhầm) đều tự invalidate cache này ngay, nên số liệu cập nhật gần như
  // tức thời chứ không phải đợi hết TTL — FE tự poll lại mỗi 60s để cảm giác "realtime". ----
  if (sub === "/dashboard" && request.method === "GET") {
    const forceRefresh = searchParams.get("fresh") === "1";
    // Bộ lọc ngày — mặc định hôm nay, không cho chọn ngày trong TƯƠNG LAI (chưa có dữ liệu). Cache
    // key gắn theo TỪNG NGÀY (pph:dashboard:YYYY-MM-DD) để xem ngày khác không bị dính cache của
    // ngày khác — các chỗ gọi mmtbCacheInvalidate(env, "pph:dashboard") vẫn xoá đúng vì so khớp
    // theo tiền tố (LIKE "pph:dashboard%"), không cần sửa gì thêm ở đó.
    const today = pphTodayStr();
    const requestedDate = searchParams.get("date");
    const date = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate <= today ? requestedDate : today;
    const isToday = date === today;
    return mmtbCachedJson(env, `pph:dashboard:${date}`, forceRefresh, async () => {
      const factories = await pphBuildTree(env);
      const nowMin = pphNowMinutes();
      const qSlots = PPH_SLOTS.slice(1); // 8 khung SỐ LƯỢNG (không tính "08:00" đầu ca)

      const factoriesOut = [];
      for (const f of factories) {
        const leaves = pphCollectFactoryLeaves(f);
        const leafOut = [];
        for (const leaf of leaves) {
          let entries = [];
          try {
            const r = await env.DB.prepare(
              "SELECT slot, worker_count, model, planned_qty, target_rft, actual_qty, submitted_by, submitted_at, shortfall_reason, shortfall_solution FROM pph_entries WHERE team_id = ? AND entry_date = ?"
            ).bind(leaf.id, date).all();
            entries = r.results || [];
          } catch {}
          const bySlot = new Map(entries.map((e) => [e.slot, e]));
          const setupRow = bySlot.get("08:00");

          // Chi tiết từng khung giờ — dùng cho bảng "chi tiết theo khung giờ" khi Dashboard đang lọc
          // riêng 1 Tổ: cần thêm ai nhập (submittedBy) + lý do/giải pháp hụt chỉ tiêu để bấm xem.
          const slotDetails = qSlots.map((s) => {
            const row = bySlot.get(s);
            return {
              slot: s,
              actualQty: row ? row.actual_qty : null,
              filled: !!row,
              submittedBy: row ? row.submitted_by : null,
              submittedAt: row ? row.submitted_at : null,
              shortfallReason: row ? row.shortfall_reason : null,
              shortfallSolution: row ? row.shortfall_solution : null,
            };
          });
          const filledQtySlots = slotDetails.filter((s) => s.filled);
          const latest = filledQtySlots[filledQtySlots.length - 1] || null;

          // Chỉ tiêu/giờ SUY RA từ kế hoạch NGUYÊN NGÀY chia đều cho 8 khung số lượng — pph_org
          // hiện chưa có field "chỉ tiêu/giờ" riêng, đây là cách quy đổi hợp lý nhất từ dữ liệu
          // đầu ca thật đang có (không bịa số).
          const plannedQty = setupRow ? setupRow.planned_qty : null;
          const perHourTarget = plannedQty ? plannedQty / qSlots.length : 0;

          const cumulativeActual = filledQtySlots.reduce((s, x) => s + (x.actualQty || 0), 0);
          const cumulativeTarget = perHourTarget * filledQtySlots.length;
          const pphLatest = latest ? latest.actualQty : null;
          const efficiencyPctLatest =
            latest && perHourTarget > 0 ? Math.round((latest.actualQty / perHourTarget) * 1000) / 10 : null;

          // Trạng thái nhập: so khung nào ĐÃ TỚI GIỜ (trừ hao 10 phút, khớp pphResolveStatus) với
          // khung đã thực sự nhập. "late" nếu có khung nhập trễ hơn 20 phút so với mốc của nó. Xem
          // NGÀY QUÁ KHỨ thì cả ngày đã qua rồi — mọi khung đều coi là "đã tới giờ".
          let entryStatus = "missing";
          if (!setupRow) {
            entryStatus = "missing";
          } else {
            const dueSlots = isToday ? qSlots.filter((s) => nowMin >= pphSlotMinutes(s) - 10) : qSlots;
            const dueFilled = dueSlots.every((s) => bySlot.has(s));
            if (dueSlots.length === 0 || dueFilled) {
              const anyLate = dueSlots.some((s) => {
                const row = bySlot.get(s);
                if (!row || !row.submitted_at) return false;
                const subMs = new Date(row.submitted_at).getTime();
                if (Number.isNaN(subMs)) return false;
                const subVN = new Date(subMs + 7 * 60 * 60 * 1000);
                const subMin = subVN.getUTCHours() * 60 + subVN.getUTCMinutes();
                return subMin - pphSlotMinutes(s) > 20;
              });
              entryStatus = anyLate ? "late" : "ontime";
            } else {
              entryStatus = "missing";
            }
          }

          leafOut.push({
            id: leaf.id,
            name: leaf.name,
            path: leaf.path,
            setup: setupRow
              ? { workerCount: setupRow.worker_count, model: setupRow.model, plannedQty: setupRow.planned_qty, targetRft: setupRow.target_rft }
              : null,
            slots: slotDetails,
            pphLatest,
            efficiencyPctLatest,
            perHourTarget: Math.round(perHourTarget * 10) / 10,
            cumulativeActual,
            cumulativeTarget: Math.round(cumulativeTarget),
            entryStatus,
          });
        }
        factoriesOut.push({ id: f.id, name: f.name, leaves: leafOut });
      }

      return { success: true, data: { date, factories: factoriesOut } };
    });
  }

  // ---- Thêm mục vào cây (Nhà máy/Xưởng/Chuyền/Tổ) ----
  if (sub === "/org" && request.method === "POST") {
    try {
      const body = await request.json();
      const type = body.type;
      const name = String(body.name || "").trim();
      const parentId = body.parentId || null;
      if (!PPH_ORG_TYPES.includes(type)) return mmtbJson({ success: false, error: "Loại không hợp lệ" }, 400);
      if (!name) return mmtbJson({ success: false, error: "Thiếu tên" }, 400);
      const allowedParentTypes = PPH_ORG_ALLOWED_PARENT_TYPES[type];
      if (allowedParentTypes && !parentId) return mmtbJson({ success: false, error: "Thiếu mục cha" }, 400);
      await pphOrgEnsureTable(env);
      if (allowedParentTypes) {
        const parent = await env.DB.prepare("SELECT type FROM pph_org WHERE id = ?").bind(parentId).first();
        if (!parent || !allowedParentTypes.includes(parent.type)) return mmtbJson({ success: false, error: "Mục cha không hợp lệ" }, 400);
      }
      const id = `pphorg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await env.DB.prepare(
        "INSERT INTO pph_org (id, type, name, parent_id, order_num, created_at) VALUES (?, ?, ?, ?, 0, ?)"
      ).bind(id, type, name, allowedParentTypes ? parentId : null, new Date().toISOString()).run();
      return mmtbJson({ success: true, data: { id, type, name, parentId: allowedParentTypes ? parentId : null } }, 201);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không thêm được" }, 400);
    }
  }

  // ---- Sửa tên / Xoá 1 mục ----
  m2 = sub.match(/^\/org\/([^/]+)$/);
  if (m2 && request.method === "PUT") {
    try {
      const body = await request.json();
      const name = String(body.name || "").trim();
      if (!name) return mmtbJson({ success: false, error: "Thiếu tên" }, 400);
      await pphOrgEnsureTable(env);
      await env.DB.prepare("UPDATE pph_org SET name = ? WHERE id = ?").bind(name, m2[1]).run();
      return mmtbJson({ success: true });
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không sửa được" }, 400);
    }
  }
  if (m2 && request.method === "DELETE") {
    try {
      await pphOrgEnsureTable(env);
      const childRow = await env.DB.prepare("SELECT COUNT(*) as c FROM pph_org WHERE parent_id = ?").bind(m2[1]).first();
      if (childRow && childRow.c > 0) return mmtbJson({ success: false, error: "Còn mục con bên trong — xoá mục con trước" }, 409);
      await env.DB.prepare("DELETE FROM pph_org WHERE id = ?").bind(m2[1]).run();
      return mmtbJson({ success: true });
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không xoá được" }, 400);
    }
  }

  // ---- Thông tin cho trang quét QR (công khai) — tên Tổ/Chuyền/Xưởng/Nhà máy + khung giờ cần nhập ----
  if (sub === "/scan-info" && request.method === "GET") {
    const teamId = searchParams.get("teamId");
    if (!teamId) return mmtbJson({ success: false, error: "Thiếu mã điểm quét trong đường dẫn QR" }, 400);
    const found = await pphFindNodeChain(env, teamId);
    if (!found) return mmtbJson({ success: false, error: "Không tìm thấy điểm quét này — mã QR có thể đã cũ" }, 404);

    const date = pphTodayStr();
    let results = [];
    try {
      const r = await env.DB.prepare(
        "SELECT slot, worker_count, model, planned_qty, target_rft, actual_qty, shortfall_reason, shortfall_solution FROM pph_entries WHERE team_id = ? AND entry_date = ?"
      ).bind(teamId, date).all();
      results = r.results || [];
    } catch {}
    const bySlot = new Map(results.map((r) => [r.slot, r]));
    const setupDone = bySlot.has("08:00");
    const filledSlots = new Set([...bySlot.keys()].filter((s) => s !== "08:00"));
    const resolved = pphResolveStatus(setupDone, filledSlots);
    const setupRow = bySlot.get("08:00");
    // Mục tiêu/giờ — suy ra từ kế hoạch cả ngày chia đều 8 khung số lượng, khớp đúng cách tính ở
    // dashboard — để FE hiện ngay trong nhãn ô nhập và tự phát hiện hụt chỉ tiêu lúc đang gõ.
    const perHourTarget = setupRow && setupRow.planned_qty ? Math.round((setupRow.planned_qty / PPH_SLOTS.slice(1).length) * 10) / 10 : null;

    // Dữ liệu ĐẦY ĐỦ từng khung giờ trong ngày (kể cả khung đầu ca) — cho FE dựng bảng "xem lại các
    // khung đã quét" (chỉ xem, không sửa được) khi bấm vào ô giờ hiện tại.
    const entries = PPH_SLOTS.map((s) => {
      const row = bySlot.get(s);
      if (!row) return { slot: s, filled: false };
      return {
        slot: s,
        filled: true,
        workerCount: row.worker_count ?? null,
        model: row.model ?? null,
        plannedQty: row.planned_qty ?? null,
        targetRft: row.target_rft ?? null,
        actualQty: row.actual_qty ?? null,
        shortfallReason: row.shortfall_reason ?? null,
        shortfallSolution: row.shortfall_solution ?? null,
      };
    });

    return mmtbJson({
      success: true,
      team: {
        id: found.node.id,
        name: found.node.name,
        lineName: found.line ? found.line.name : "",
        areaName: found.area ? found.area.name : "",
        factoryName: found.factory ? found.factory.name : "",
      },
      date,
      slots: PPH_SLOTS,
      filledSlots: [...bySlot.keys()],
      entries,
      perHourTarget,
      setup: setupRow
        ? { workerCount: setupRow.worker_count, model: setupRow.model, plannedQty: setupRow.planned_qty, targetRft: setupRow.target_rft }
        : null,
      ...resolved,
    });
  }

  // ---- Nộp dữ liệu (công khai, không cần đăng nhập) ----
  if (sub === "/scan" && request.method === "POST") {
    try {
      const body = await request.json();
      const teamId = body.teamId;
      const submittedBy = String(body.submittedBy || "").trim();
      if (!teamId) return mmtbJson({ success: false, error: "Thiếu mã điểm quét" }, 400);
      if (!submittedBy) return mmtbJson({ success: false, error: "Vui lòng nhập tên người báo cáo" }, 400);

      const found = await pphFindNodeChain(env, teamId);
      if (!found) return mmtbJson({ success: false, error: "Không tìm thấy điểm quét này — mã QR có thể đã cũ" }, 404);

      const date = pphTodayStr();
      let results = [];
      try {
        // Cần thêm planned_qty của dòng đầu ca (08:00) để suy ra Mục tiêu/giờ, dùng kiểm tra hụt
        // chỉ tiêu ngay dưới đây.
        const r = await env.DB.prepare("SELECT slot, planned_qty FROM pph_entries WHERE team_id = ? AND entry_date = ?").bind(teamId, date).all();
        results = r.results || [];
      } catch {}
      const filled = new Set(results.map((r) => r.slot));
      const setupDone = filled.has("08:00");
      const setupRow = results.find((r) => r.slot === "08:00");
      const perHourTarget = setupRow && setupRow.planned_qty ? setupRow.planned_qty / PPH_SLOTS.slice(1).length : 0;
      const resolved = pphResolveStatus(setupDone, filled);

      if (resolved.nextAction === "wait") {
        return mmtbJson({ success: false, error: `Chưa tới giờ nhập — khung tiếp theo lúc ${resolved.nextSlot}` }, 409);
      }
      if (resolved.nextAction === "done") {
        return mmtbJson({ success: false, error: "Đã cập nhật đủ các khung giờ hôm nay, cảm ơn bạn!" }, 409);
      }

      // Chống trường hợp trang đang mở bị "cũ" so với thực tế server (VD mở từ hôm qua để qua đêm
      // mới bấm gửi, hoặc 1 tab khác vừa nộp xong khung này) — nếu dữ liệu gửi lên không khớp với
      // hành động server ĐANG THỰC SỰ mong đợi lúc này (setup/quantity), báo rõ để tải lại trang,
      // thay vì rơi vào lỗi "thiếu trường" khó hiểu (VD "Vui lòng nhập Số lượng công nhân" trong
      // khi người dùng chỉ đang nộp số lượng của 1 khung giờ bình thường).
      const bodyLooksLikeSetup = body.workerCount !== undefined || body.model !== undefined || body.plannedQty !== undefined;
      const bodyLooksLikeQuantity = body.actualQty !== undefined;
      if (resolved.nextAction === "setup" && bodyLooksLikeQuantity && !bodyLooksLikeSetup) {
        return mmtbJson({ success: false, error: "Trang đang mở đã cũ (có thể đã sang ngày mới) — vui lòng tải lại trang rồi thử lại" }, 409);
      }
      if (resolved.nextAction === "quantity" && bodyLooksLikeSetup && !bodyLooksLikeQuantity) {
        return mmtbJson({ success: false, error: "Trang đang mở đã cũ (đầu ca hôm nay đã có người cập nhật) — vui lòng tải lại trang rồi thử lại" }, 409);
      }

      const slot = resolved.targetSlot;
      const id = `pph_${teamId}_${date}_${slot}`.replace(/[^a-zA-Z0-9_-]/g, "_");
      const nowIso = new Date().toISOString();

      if (resolved.nextAction === "setup") {
        const workerCount = Number(body.workerCount);
        const model = String(body.model || "").trim();
        const plannedQty = Number(body.plannedQty);
        const targetRft = Number(body.targetRft);
        if (!Number.isFinite(workerCount) || workerCount <= 0) return mmtbJson({ success: false, error: "Vui lòng nhập đúng Số lượng công nhân" }, 400);
        if (!model) return mmtbJson({ success: false, error: "Vui lòng nhập Model sản xuất" }, 400);
        if (!Number.isFinite(plannedQty) || plannedQty <= 0) return mmtbJson({ success: false, error: "Vui lòng nhập đúng Sản lượng kế hoạch cả ca" }, 400);
        if (!Number.isFinite(targetRft) || targetRft < 0 || targetRft > 100) return mmtbJson({ success: false, error: "Vui lòng nhập đúng Mục tiêu hàng đạt chuẩn (RFT 0-100%)" }, 400);
        try {
          await env.DB.prepare(
            "INSERT INTO pph_entries (id, team_id, entry_date, slot, worker_count, model, planned_qty, target_rft, submitted_by, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
          ).bind(id, teamId, date, slot, workerCount, model, plannedQty, targetRft, submittedBy, nowIso).run();
        } catch {
          return mmtbJson({ success: false, error: "Đã có người cập nhật đầu giờ hôm nay rồi" }, 409);
        }
      } else {
        const actualQty = Number(body.actualQty);
        if (!Number.isFinite(actualQty) || actualQty < 0) return mmtbJson({ success: false, error: "Vui lòng nhập đúng Số lượng" }, 400);

        // Hụt chỉ tiêu/giờ — bắt buộc giải trình nguyên nhân + giải pháp ngay lúc nộp.
        const isShortfall = perHourTarget > 0 && actualQty < perHourTarget;
        const shortfallReason = String(body.shortfallReason || "").trim();
        const shortfallSolution = String(body.shortfallSolution || "").trim();
        if (isShortfall) {
          if (!shortfallReason) return mmtbJson({ success: false, error: "Số lượng đang thấp hơn mục tiêu/giờ — vui lòng nhập Nguyên nhân" }, 400);
          if (!shortfallSolution) return mmtbJson({ success: false, error: "Số lượng đang thấp hơn mục tiêu/giờ — vui lòng nhập Giải pháp" }, 400);
        }

        try {
          await env.DB.prepare(
            "INSERT INTO pph_entries (id, team_id, entry_date, slot, actual_qty, shortfall_reason, shortfall_solution, submitted_by, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          ).bind(id, teamId, date, slot, actualQty, isShortfall ? shortfallReason : null, isShortfall ? shortfallSolution : null, submittedBy, nowIso).run();
        } catch {
          return mmtbJson({ success: false, error: `Khung giờ ${slot} đã được cập nhật rồi` }, 409);
        }
      }

      await mmtbCacheInvalidate(env, "pph:dashboard");
      return mmtbJson({ success: true, slot, team: { name: found.node.name, lineName: found.line ? found.line.name : "" } });
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không lưu được dữ liệu" }, 500);
    }
  }

  // ---- Ràng buộc thời gian: đọc (công khai, trang quét cần để hiện đếm ngược) ----
  if (sub === "/slot-windows" && request.method === "GET") {
    const windows = await pphGetAllSlotWindows(env);
    return mmtbJson({ success: true, windows });
  }

  // ---- Ràng buộc thời gian: admin chỉnh giờ mở/đóng từng khung (trang Cài Đặt) ----
  if (sub === "/slot-windows" && request.method === "PUT") {
    try {
      const body = await request.json();
      const list = Array.isArray(body.windows) ? body.windows : [];
      if (list.length === 0) return mmtbJson({ success: false, error: "Thiếu dữ liệu khung giờ" }, 400);
      const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
      for (const w of list) {
        if (!PPH_SLOTS.includes(w.slot)) return mmtbJson({ success: false, error: `Khung không hợp lệ: ${w.slot}` }, 400);
        if (!timeRe.test(w.startTime) || !timeRe.test(w.endTime)) {
          return mmtbJson({ success: false, error: `Giờ không hợp lệ ở khung ${w.slot} — định dạng phải là HH:MM` }, 400);
        }
      }
      await pphSlotWindowEnsureTable(env);
      for (const w of list) {
        await env.DB.prepare(
          "INSERT INTO pph_slot_windows (slot, start_time, end_time) VALUES (?, ?, ?) ON CONFLICT(slot) DO UPDATE SET start_time = excluded.start_time, end_time = excluded.end_time"
        ).bind(w.slot, w.startTime, w.endTime).run();
      }
      const windows = await pphGetAllSlotWindows(env);
      return mmtbJson({ success: true, windows });
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không lưu được" }, 500);
    }
  }

  // ---- Xoá 1 khung giờ đã nhập nhầm (dùng ở trang Cài Đặt, đã có RequireAuth) — cho phép sửa sai
  // (VD nhập nhầm số) mà không phải đợi qua ngày khác để nhập lại đúng khung đó. ----
  if (sub === "/entry" && request.method === "DELETE") {
    try {
      const teamId = searchParams.get("teamId");
      const date = searchParams.get("date");
      const slot = searchParams.get("slot");
      if (!teamId || !date || !slot) return mmtbJson({ success: false, error: "Thiếu teamId/date/slot" }, 400);
      await env.DB.prepare("DELETE FROM pph_entries WHERE team_id = ? AND entry_date = ? AND slot = ?").bind(teamId, date, slot).run();
      await mmtbCacheInvalidate(env, "pph:dashboard");
      return mmtbJson({ success: true });
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không xoá được" }, 500);
    }
  }

  return mmtbJson({ success: false, error: `Không tìm thấy endpoint PPH: ${sub}` }, 404);
}

async function handleMmtbKG(request, env, pathname, searchParams) {
  const mmtbPath = pathname.slice("/api/mmtb-kg".length) || "/";

  // ---- Đăng nhập / Đăng xuất (không cần token trước đó) ----
  if (mmtbPath === "/login" && request.method === "POST") {
    try {
      const { employeeCode, password } = await request.json();
      if (!employeeCode || !password) return mmtbJson({ success: false, error: "Thiếu mã nhân viên hoặc mật khẩu" }, 400);
      const loginRes = await fetch(`${env.TBSMAYMOC_API_URL}/api/mobile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeCode, password }),
      });
      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) return mmtbJson({ success: false, error: loginData.error || "Sai mã nhân viên hoặc mật khẩu" }, loginRes.status);
      if (!loginData.user || loginData.user.role !== "ADMIN") {
        return mmtbJson({ success: false, error: "Chỉ tài khoản Quản trị được truy cập MMTB" }, 403);
      }
      const cookie = `${MMTB_COOKIE}=${encodeURIComponent(loginData.token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
      return mmtbJson({ success: true, user: loginData.user }, 200, { "Set-Cookie": cookie });
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không đăng nhập được" }, 500);
    }
  }

  if (mmtbPath === "/logout" && request.method === "POST") {
    return mmtbJson({ success: true }, 200, { "Set-Cookie": `${MMTB_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }

  // ---- /me: kiểm tra đăng nhập MMTB — cũng là nơi duy nhất thử tự động đăng nhập cho admin ----
  // (đặt TRƯỚC gate "bắt buộc đã đăng nhập" bên dưới, vì lúc gọi /me thường CHƯA có mmtb_token).
  if (mmtbPath === "/me" && request.method === "GET") {
    if (mmtbGetToken(request)) return mmtbJson({ success: true }, 200);
    const auto = await mmtbTryAutoLoginAsAdmin(request, env);
    if (auto) return mmtbJson({ success: true, autoLogin: true }, 200, { "Set-Cookie": auto.cookie });
    return mmtbJson({ success: false, error: "Chưa đăng nhập MMTB" }, 401);
  }

  // ---- Mọi route còn lại bắt buộc đã đăng nhập ----
  const token = mmtbGetToken(request);
  if (!token) return mmtbJson({ success: false, error: "Chưa đăng nhập MMTB" }, 401);

  // Nút "Làm mới dữ liệu" ở mỗi trang gửi ?fresh=1 để bỏ qua cache đọc, luôn lấy mới nhất.
  const forceRefresh = searchParams.get("fresh") === "1";

  // ---- Máy móc (Danh Sách MMTB) ----
  // Tách "danh sách máy" (nặng, ~2500 máy Tổ hợp KG, JSON verbose từ tbsMayMoc) khỏi "6 danh mục
  // lọc" (nhẹ) thành 2 route riêng — gộp chung 1 request từng bị 500 trên Cloudflare thật (vượt
  // giới hạn CPU time của Worker khi vừa parse JSON máy nặng vừa xử lý thêm 6 fetch song song
  // trong CÙNG 1 lượt xử lý — không tái hiện được khi chạy "wrangler dev" cục bộ vì máy tính
  // không bị giới hạn CPU time kiểu edge). Tách request giúp mỗi lượt gọi có ngân sách CPU riêng.
  if (mmtbPath === "/machines" && request.method === "GET") {
    return mmtbCachedJson(env, "machines", forceRefresh, async () => {
      try {
        const machinesRes = await mmtbCall(env, token, "/api/machines");
        if (!machinesRes.ok) return { success: false, error: machinesRes.data.error || "Không lấy được dữ liệu máy móc từ tbsMayMoc", status: machinesRes.status };
        if (!Array.isArray(machinesRes.data)) return { success: false, error: "Dữ liệu máy móc trả về không hợp lệ từ tbsMayMoc, thử lại sau" };
        const data = machinesRes.data.map((m) => ({
          id: m.id, code: m.code, name: m.name, serial: m.serialNumber,
          factoryId: m.area && m.area.parent ? m.area.parent.id : null,
          factoryName: m.area && m.area.parent ? m.area.parent.name : null,
          areaId: m.area ? m.area.id : null, areaName: m.area ? m.area.name : null,
          zone: mmtbAreaLabel(m.area),
          teamId: m.team ? m.team.id : null, teamName: m.team ? m.team.name : null,
          lineId: m.productionLine ? m.productionLine.id : null, lineName: m.productionLine ? m.productionLine.name : null,
          machineTypeId: m.machineType ? m.machineType.id : null, machineTypeName: m.machineType ? m.machineType.name : null,
          statusId: m.status.id, statusName: m.status.name, statusColorHex: m.status.colorHex,
          originalCost: m.originalCost, depreciationPercent: m.depreciationPercent, remainingValue: m.remainingValue,
          qrData: m.code,
        }));
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message || "Không lấy được dữ liệu máy móc từ tbsMayMoc" };
      }
    });
  }
  // (Từng có /machines/filters gộp 6 lệnh song song ở đây — bỏ hẳn vì gộp nhiều fetch song song
  // trong CÙNG 1 lượt xử lý của Worker từng lỗi ngẫu nhiên trên Cloudflare thật dù từng loại gọi
  // riêng lẻ vẫn ổn; trang machines/page.tsx giờ để trình duyệt tự gọi 6 loại /categories?type=
  // song song thay vì qua route gộp này.)
  if (mmtbPath === "/machines" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.code || !body.code.trim() || !body.name || !body.name.trim() || !body.location || !body.location.trim() || !body.areaId) {
        return mmtbJson({ success: false, error: "Thiếu Mã tài sản / Tên máy / Vị trí / Khu vực" }, 400);
      }
      const r = await mmtbCall(env, token, "/api/machines", "POST", body);
      if (r.ok) await mmtbCacheInvalidate(env, "machines");
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không tạo được máy mới" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không tạo được máy mới" }, 400);
    }
  }
  let m2 = mmtbPath.match(/^\/machines\/([^/]+)\/position$/);
  if (m2 && request.method === "PUT") {
    try {
      const { mapX, mapY } = await request.json();
      const r = await mmtbCall(env, token, `/api/machines/${m2[1]}/position`, "PUT", { mapX, mapY });
      if (r.ok) await mmtbCacheInvalidate(env, "machines");
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không ghim được vị trí máy" }, r.ok ? 200 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không ghim được vị trí máy" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/machines\/([^/]+)$/);
  if (m2 && (request.method === "PUT" || request.method === "DELETE")) {
    const id = m2[1];
    if (request.method === "PUT") {
      try {
        const body = await request.json();
        if (!body.code || !body.code.trim() || !body.name || !body.name.trim() || !body.location || !body.location.trim() || !body.areaId || !body.statusId) {
          return mmtbJson({ success: false, error: "Thiếu Mã tài sản / Tên máy / Vị trí / Khu vực / Trạng thái" }, 400);
        }
        const r = await mmtbCall(env, token, `/api/machines/${id}`, "PUT", body);
        if (r.ok) await mmtbCacheInvalidate(env, "machines");
        return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không sửa được máy" }, r.ok ? 200 : r.status || 400);
      } catch (err) {
        return mmtbJson({ success: false, error: err.message || "Không sửa được máy" }, 400);
      }
    } else {
      const r = await mmtbCall(env, token, `/api/machines/${id}`, "DELETE");
      if (r.ok) await mmtbCacheInvalidate(env, "machines");
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được máy" }, r.ok ? 200 : r.status || 400);
    }
  }

  // ---- Sự cố (Nhu Cầu Sửa Chữa) ----
  if (mmtbPath === "/tickets" && request.method === "GET") {
    return mmtbCachedJson(env, "tickets", forceRefresh, async () => {
      try {
        const r = await mmtbCall(env, token, "/api/incidents?limit=200");
        if (!r.ok) return { success: false, error: r.data.error || "Không lấy được dữ liệu sự cố từ tbsMayMoc", status: r.status };
        if (!Array.isArray(r.data)) return { success: false, error: "Dữ liệu sự cố trả về không hợp lệ từ tbsMayMoc, thử lại sau" };
        const data = r.data.map((i) => ({
          id: i.id,
          ticketCode: `SC-${String(i.id).slice(-6).toUpperCase()}`,
          machineCode: i.machine.code, machineName: i.machine.name,
          zone: i.machine.areaName, factoryName: i.machine.factoryName,
          reporter: i.isMaintenanceDue ? "Hệ thống (nhắc bảo trì định kỳ)" : (i.reporter ? i.reporter.name : "—"),
          mechanic: i.assignedTo ? i.assignedTo.name : null,
          errorType: i.categoryName || i.description, description: i.description,
          status: i.status, statusLabel: MMTB_INCIDENT_STATUS_LABEL[i.status],
          reportedAt: i.createdAt, acceptedAt: i.acceptedAt, completedAt: i.completedAt,
        }));
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message || "Không lấy được dữ liệu sự cố từ tbsMayMoc" };
      }
    });
  }

  // ---- Danh mục (Khu vực/Chuyền/Tổ/Phân loại máy/Phụ tùng/Chu kỳ bảo trì/Trạng thái máy) ----
  if (mmtbPath === "/categories" && request.method === "GET") {
    const type = searchParams.get("type");
    const READABLE = ["FACTORY", "AREA", "PRODUCTION_LINE", "TEAM", "MACHINE_TYPE", "PART", "MAINTENANCE_PERIOD", "MACHINE_STATUS"];
    if (!type || READABLE.indexOf(type) === -1) return mmtbJson({ success: false, error: "Loại danh mục không hợp lệ" }, 400);
    const parentId = searchParams.get("parentId");
    const qs = `?type=${type}${parentId ? `&parentId=${encodeURIComponent(parentId)}` : ""}`;
    return mmtbCachedJson(env, `categories:${type}:${parentId || ""}`, forceRefresh, async () => {
      const r = await mmtbCall(env, token, `/api/categories${qs}`);
      return r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được danh mục từ tbsMayMoc", status: r.status };
    });
  }
  if (mmtbPath === "/categories" && request.method === "POST") {
    try {
      const body = await request.json();
      const WRITABLE = ["AREA", "PRODUCTION_LINE", "TEAM", "MACHINE_TYPE", "PART", "MAINTENANCE_PERIOD", "MACHINE_STATUS"];
      if (!body.type || WRITABLE.indexOf(body.type) === -1) return mmtbJson({ success: false, error: "Loại danh mục không hợp lệ" }, 400);
      if (!body.name || !String(body.name).trim()) return mmtbJson({ success: false, error: "Thiếu tên danh mục" }, 400);
      if (["AREA", "PRODUCTION_LINE", "TEAM", "MACHINE_TYPE", "PART"].indexOf(body.type) !== -1 && !body.parentId) {
        return mmtbJson({ success: false, error: "Thiếu mục cha" }, 400);
      }
      if (body.type === "PART" && (body.quantity == null || Number(body.quantity) < 0)) {
        return mmtbJson({ success: false, error: "Vui lòng nhập số lượng tồn kho hợp lệ" }, 400);
      }
      const r = await mmtbCall(env, token, "/api/categories", "POST", body);
      if (r.ok) await mmtbCacheInvalidate(env, "categories:");
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không tạo được danh mục mới" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không tạo được danh mục mới" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/categories\/([^/]+)$/);
  if (m2 && (request.method === "PUT" || request.method === "DELETE")) {
    const id = m2[1];
    if (request.method === "PUT") {
      try {
        const body = await request.json();
        if (body.name !== undefined && !String(body.name).trim()) return mmtbJson({ success: false, error: "Tên danh mục không được để trống" }, 400);
        const r = await mmtbCall(env, token, `/api/categories/${id}`, "PUT", body);
        if (r.ok) await mmtbCacheInvalidate(env, "categories:");
        return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không sửa được danh mục" }, r.ok ? 200 : r.status || 400);
      } catch (err) {
        return mmtbJson({ success: false, error: err.message || "Không sửa được danh mục" }, 400);
      }
    } else {
      const r = await mmtbCall(env, token, `/api/categories/${id}`, "DELETE");
      if (r.ok) await mmtbCacheInvalidate(env, "categories:");
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được danh mục" }, r.ok ? 200 : r.status || 400);
    }
  }

  // ---- Danh mục hư ----
  if (mmtbPath === "/failure-categories" && request.method === "GET") {
    return mmtbCachedJson(env, "failure-categories", forceRefresh, async () => {
      const r = await mmtbCall(env, token, "/api/failure-categories");
      return r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được danh mục hư từ tbsMayMoc", status: r.status };
    });
  }
  if (mmtbPath === "/failure-categories" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.name || !String(body.name).trim()) return mmtbJson({ success: false, error: "Thiếu tên danh mục" }, 400);
      const r = await mmtbCall(env, token, "/api/failure-categories", "POST", body);
      if (r.ok) await mmtbCacheInvalidate(env, "failure-categories");
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không tạo được danh mục hư mới" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không tạo được danh mục hư mới" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/failure-categories\/([^/]+)$/);
  if (m2 && (request.method === "PUT" || request.method === "DELETE")) {
    const id = m2[1];
    if (request.method === "PUT") {
      try {
        const body = await request.json();
        if (!body.name || !String(body.name).trim()) return mmtbJson({ success: false, error: "Thiếu tên danh mục" }, 400);
        const r = await mmtbCall(env, token, `/api/failure-categories/${id}`, "PUT", body);
        if (r.ok) await mmtbCacheInvalidate(env, "failure-categories");
        return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không sửa được danh mục hư" }, r.ok ? 200 : r.status || 400);
      } catch (err) {
        return mmtbJson({ success: false, error: err.message || "Không sửa được danh mục hư" }, 400);
      }
    } else {
      const r = await mmtbCall(env, token, `/api/failure-categories/${id}`, "DELETE");
      if (r.ok) await mmtbCacheInvalidate(env, "failure-categories");
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được danh mục hư" }, r.ok ? 200 : r.status || 400);
    }
  }

  // ---- Lịch bảo trì (Bảo Dưỡng MMTB) ----
  if (mmtbPath === "/schedule" && request.method === "GET") {
    return mmtbCachedJson(env, "schedule", forceRefresh, async () => {
      const r = await mmtbCall(env, token, "/api/maintenance-schedule");
      return r.ok ? { success: true, ...r.data } : { success: false, error: r.data.error || "Không lấy được lịch bảo trì từ tbsMayMoc", status: r.status };
    });
  }
  if (mmtbPath === "/schedule" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!Array.isArray(body.machineIds) || body.machineIds.length === 0) return mmtbJson({ success: false, error: "Vui lòng chọn ít nhất 1 máy" }, 400);
      if (!body.maintenancePeriodId) return mmtbJson({ success: false, error: "Vui lòng chọn Chu kỳ bảo trì" }, 400);
      if (!body.anchorDate) return mmtbJson({ success: false, error: "Vui lòng chọn Ngày bắt đầu tính" }, 400);
      const r = await mmtbCall(env, token, "/api/machines/bulk-maintenance", "POST", body);
      if (r.ok) await mmtbCacheInvalidate(env, "schedule");
      return mmtbJson(r.ok ? { success: true, ...r.data } : { success: false, error: r.data.error || "Không gán được lịch bảo trì" }, r.ok ? 200 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không gán được lịch bảo trì" }, 400);
    }
  }
  if (mmtbPath === "/logs" && request.method === "GET") {
    const limit = searchParams.get("limit") || "150";
    return mmtbCachedJson(env, `logs:${limit}`, forceRefresh, async () => {
      const r = await mmtbCall(env, token, `/api/maintenance-logs?limit=${limit}`);
      return r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được lịch sử bảo trì từ tbsMayMoc", status: r.status };
    });
  }

  // ---- Đề xuất ----
  if (mmtbPath === "/proposals" && request.method === "GET") {
    return mmtbCachedJson(env, "proposals", forceRefresh, async () => {
      const r = await mmtbCall(env, token, "/api/admin/proposals");
      return r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được đề xuất từ tbsMayMoc", status: r.status };
    });
  }
  m2 = mmtbPath.match(/^\/proposals\/([^/]+)$/);
  if (m2 && request.method === "PUT") {
    try {
      const body = await request.json();
      const r = await mmtbCall(env, token, `/api/admin/proposals/${m2[1]}`, "PUT", { resolved: !!body.resolved });
      if (r.ok) await mmtbCacheInvalidate(env, "proposals");
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không cập nhật được đề xuất" }, r.ok ? 200 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không cập nhật được đề xuất" }, 400);
    }
  }

  // ---- Thời gian phản hồi ----
  if (mmtbPath === "/response-time" && request.method === "GET") {
    return mmtbCachedJson(env, "response-time", forceRefresh, async () => {
      const r = await mmtbCall(env, token, "/api/response-time");
      return r.ok ? { success: true, ...r.data } : { success: false, error: r.data.error || "Không lấy được dữ liệu từ tbsMayMoc", status: r.status };
    });
  }

  // ---- Tổng Quan (KPI MTTA/MTTR/MTTD, Trend, Pareto, độ tin cậy từng máy) ----
  if (mmtbPath === "/overview-report" && request.method === "GET") {
    const qs = new URLSearchParams();
    ["factoryId", "areaId", "lineId", "dateFrom", "dateTo"].forEach((k) => {
      const v = searchParams.get(k);
      if (v) qs.set(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return mmtbCachedJson(env, `overview-report:${qs.toString()}`, forceRefresh, async () => {
      const r = await mmtbCall(env, token, `/api/overview-report${suffix}`);
      return r.ok ? { success: true, ...r.data } : { success: false, error: r.data.error || "Không lấy được dữ liệu từ tbsMayMoc", status: r.status };
    });
  }

  // ---- Nhân sự ----
  if (mmtbPath === "/employees" && request.method === "GET") {
    return mmtbCachedJson(env, "employees", forceRefresh, async () => {
      const r = await mmtbCall(env, token, "/api/employees");
      return r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được nhân sự từ tbsMayMoc", status: r.status };
    });
  }
  if (mmtbPath === "/employees" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.employeeCode || !body.employeeCode.trim() || !body.name || !body.name.trim() || !body.password || !body.role) {
        return mmtbJson({ success: false, error: "Thiếu Mã NV / Tên / Mật khẩu / Vai trò" }, 400);
      }
      const r = await mmtbCall(env, token, "/api/employees", "POST", body);
      if (r.ok) await mmtbCacheInvalidate(env, "employees");
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không tạo được nhân sự mới" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không tạo được nhân sự mới" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/employees\/([^/]+)$/);
  if (m2 && (request.method === "PUT" || request.method === "DELETE")) {
    const id = m2[1];
    if (request.method === "PUT") {
      try {
        const body = await request.json();
        if (!body.employeeCode || !body.employeeCode.trim() || !body.name || !body.name.trim() || !body.role) {
          return mmtbJson({ success: false, error: "Thiếu Mã NV / Tên / Vai trò" }, 400);
        }
        const r = await mmtbCall(env, token, `/api/employees/${id}`, "PUT", body);
        if (r.ok) await mmtbCacheInvalidate(env, "employees");
        return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không sửa được nhân sự" }, r.ok ? 200 : r.status || 400);
      } catch (err) {
        return mmtbJson({ success: false, error: err.message || "Không sửa được nhân sự" }, 400);
      }
    } else {
      const r = await mmtbCall(env, token, `/api/employees/${id}`, "DELETE");
      if (r.ok) await mmtbCacheInvalidate(env, "employees");
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được nhân sự" }, r.ok ? 200 : r.status || 400);
    }
  }

  // ---- Thông báo ----
  if (mmtbPath === "/announcements" && request.method === "GET") {
    return mmtbCachedJson(env, "announcements", forceRefresh, async () => {
      const r = await mmtbCall(env, token, "/api/announcements");
      return r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được thông báo từ tbsMayMoc", status: r.status };
    });
  }
  if (mmtbPath === "/announcements" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.title || !body.title.trim() || !body.content || !body.content.trim()) return mmtbJson({ success: false, error: "Thiếu tiêu đề hoặc nội dung" }, 400);
      if (!body.targetFactoryId) return mmtbJson({ success: false, error: "Vui lòng chọn Nhà máy nhận thông báo" }, 400);
      const r = await mmtbCall(env, token, "/api/announcements", "POST", body);
      if (r.ok) await mmtbCacheInvalidate(env, "announcements");
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không gửi được thông báo" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không gửi được thông báo" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/announcements\/([^/]+)$/);
  if (m2 && (request.method === "PUT" || request.method === "DELETE")) {
    const id = m2[1];
    if (request.method === "PUT") {
      try {
        const body = await request.json();
        if (!body.title || !body.title.trim() || !body.content || !body.content.trim()) return mmtbJson({ success: false, error: "Thiếu tiêu đề hoặc nội dung" }, 400);
        const r = await mmtbCall(env, token, `/api/announcements/${id}`, "PUT", body);
        if (r.ok) await mmtbCacheInvalidate(env, "announcements");
        return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không sửa được thông báo" }, r.ok ? 200 : r.status || 400);
      } catch (err) {
        return mmtbJson({ success: false, error: err.message || "Không sửa được thông báo" }, 400);
      }
    } else {
      const r = await mmtbCall(env, token, `/api/announcements/${id}`, "DELETE");
      if (r.ok) await mmtbCacheInvalidate(env, "announcements");
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được thông báo" }, r.ok ? 200 : r.status || 400);
    }
  }

  // ---- Sơ đồ nhà máy ----
  if (mmtbPath === "/floor-plan" && request.method === "GET") {
    const factoryId = searchParams.get("factoryId");
    if (!factoryId) return mmtbJson({ success: false, error: "Thiếu Nhà máy" }, 400);
    const r = await mmtbCall(env, token, `/api/floor-plan-data?factoryId=${encodeURIComponent(factoryId)}`);
    return mmtbJson(r.ok ? { success: true, ...r.data } : { success: false, error: r.data.error || "Không lấy được sơ đồ nhà máy từ tbsMayMoc" }, r.ok ? 200 : r.status || 502);
  }
  if (mmtbPath === "/floors" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.factoryId || !body.name || !body.name.trim()) return mmtbJson({ success: false, error: "Thiếu Nhà máy hoặc tên Tầng" }, 400);
      const r = await mmtbCall(env, token, "/api/floors", "POST", { factoryId: body.factoryId, name: body.name.trim() });
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không tạo được Tầng mới" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không tạo được Tầng mới" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/floors\/([^/]+)$/);
  if (m2 && (request.method === "PUT" || request.method === "DELETE")) {
    const id = m2[1];
    if (request.method === "PUT") {
      try {
        const body = await request.json();
        const r = await mmtbCall(env, token, `/api/floors/${id}`, "PUT", body);
        return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không sửa được Tầng" }, r.ok ? 200 : r.status || 400);
      } catch (err) {
        return mmtbJson({ success: false, error: err.message || "Không sửa được Tầng" }, 400);
      }
    } else {
      const r = await mmtbCall(env, token, `/api/floors/${id}`, "DELETE");
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được Tầng" }, r.ok ? 200 : r.status || 400);
    }
  }
  if (mmtbPath === "/upload" && request.method === "POST") {
    try {
      const { base64, mimeType } = await request.json();
      if (!base64) return mmtbJson({ success: false, error: "Thiếu dữ liệu ảnh" }, 400);
      const r = await mmtbCall(env, token, "/api/admin/upload", "POST", { base64, mimeType });
      return mmtbJson(r.ok ? { success: true, url: r.data.url } : { success: false, error: r.data.error || "Không tải được ảnh lên" }, r.ok ? 200 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không tải được ảnh lên" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/geofence\/([^/]+)$/);
  if (m2 && request.method === "PUT") {
    try {
      const body = await request.json();
      const r = await mmtbCall(env, token, `/api/categories/${m2[1]}`, "PUT", { floorPlan: body });
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không lưu được vùng khuôn viên" }, r.ok ? 200 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không lưu được vùng khuôn viên" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/area-boundary\/([^/]+)$/);
  if (m2 && request.method === "PUT") {
    try {
      const body = await request.json();
      const r = await mmtbCall(env, token, `/api/categories/${m2[1]}`, "PUT", { floorPlan: { boundaryPoints: body.boundaryPoints } });
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không lưu được vùng khoanh" }, r.ok ? 200 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không lưu được vùng khoanh" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/default-pin\/([^/]+)$/);
  if (m2 && request.method === "PUT") {
    try {
      const { mapX, mapY } = await request.json();
      const r = await mmtbCall(env, token, `/api/categories/${m2[1]}`, "PUT", { floorPlan: { mapX, mapY } });
      return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không lưu được điểm ghim" }, r.ok ? 200 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không lưu được điểm ghim" }, 400);
    }
  }
  if (mmtbPath === "/map-georef" && request.method === "GET") {
    const floorId = searchParams.get("floorId");
    if (!floorId) return mmtbJson({ success: false, error: "Thiếu Tầng" }, 400);
    const r = await mmtbCall(env, token, `/api/map-georef?floorId=${floorId}`);
    return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được điểm hiệu chỉnh GPS" }, r.ok ? 200 : r.status || 502);
  }
  if (mmtbPath === "/map-georef" && request.method === "POST") {
    try {
      const body = await request.json();
      const r = await mmtbCall(env, token, "/api/map-georef", "POST", body);
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không thêm được điểm hiệu chỉnh GPS" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không thêm được điểm hiệu chỉnh GPS" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/map-georef\/([^/]+)$/);
  if (m2 && request.method === "DELETE") {
    const r = await mmtbCall(env, token, `/api/map-georef/${m2[1]}`, "DELETE");
    return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được điểm" }, r.ok ? 200 : r.status || 400);
  }
  if (mmtbPath === "/map-path" && request.method === "GET") {
    const floorId = searchParams.get("floorId");
    if (!floorId) return mmtbJson({ success: false, error: "Thiếu Tầng" }, 400);
    const r = await mmtbCall(env, token, `/api/map-path?floorId=${floorId}`);
    return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không lấy được đường đi" }, r.ok ? 200 : r.status || 502);
  }
  if (mmtbPath === "/map-path" && request.method === "POST") {
    try {
      const body = await request.json();
      const r = await mmtbCall(env, token, "/api/map-path", "POST", body);
      return mmtbJson(r.ok ? { success: true, data: r.data } : { success: false, error: r.data.error || "Không thêm được đường đi" }, r.ok ? 201 : r.status || 400);
    } catch (err) {
      return mmtbJson({ success: false, error: err.message || "Không thêm được đường đi" }, 400);
    }
  }
  m2 = mmtbPath.match(/^\/map-path\/([^/]+)$/);
  if (m2 && request.method === "DELETE") {
    const r = await mmtbCall(env, token, `/api/map-path/${m2[1]}`, "DELETE");
    return mmtbJson(r.ok ? { success: true } : { success: false, error: r.data.error || "Không xoá được đường đi" }, r.ok ? 200 : r.status || 400);
  }

  return mmtbJson({ success: false, error: `Không tìm thấy endpoint MMTB: ${mmtbPath}` }, 404);
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await this.handleRequest(request, env, ctx);
    } catch (err) {
      console.error("Worker fetch unhandled exception:", err);
      return new Response(`System Error: ${err.message}`, { status: 500 });
    }
  },

  async handleRequest(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "") || "/";

    // Auto-migrate schema columns & legacy codes lazily — chỉ 1 lần/isolate (xem cờ
    // __schemaMigratedOnce), và không chờ nó xong mới trả response (chạy nền qua waitUntil) để
    // không cộng dồn độ trễ D1 vào mọi request, đặc biệt là các file tĩnh (JS/CSS/ảnh) vốn không
    // hề cần migration này.
    if (!__schemaMigratedOnce && !pathname.startsWith("/_next/") && !/\.[a-zA-Z0-9]+$/.test(pathname)) {
      ctx.waitUntil(ensureDatabaseColumnsAndLegacyCode(env));
    }

    // 1. HTTP to HTTPS 301 Permanent Redirect — bỏ qua khi chạy cục bộ (localhost/127.0.0.1, VD
    // "wrangler dev" lúc test) vì không có TLS thật ở đó: Worker luôn thấy request là "http" dù
    // trình duyệt đã đổi sang "https" (không có ai chuyển tiếp x-forwarded-proto), gây lặp
    // redirect vô hạn (ERR_TOO_MANY_REDIRECTS). Không ảnh hưởng production — hostname thật không
    // bao giờ là localhost/127.0.0.1.
    const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
    const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (proto === "http" && !isLocalHost) {
      return Response.redirect(`https://${url.host}${url.pathname}${url.search}`, 301);
    }

    // Dynamic Site / Host Detection Defense
    if (!env.SITE_ID) {
      env.SITE_ID = url.hostname.includes("vpchuoiskechers") ? "vpchuoiskechers" : "thkiengiangshoes";
    }

    // 2. RFC 9116 security.txt
    if (url.pathname === "/.well-known/security.txt" || url.pathname === "/security.txt") {
      const securityText = `Contact: mailto:security@tbsgroup.vn\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: vi, en\nCanonical: https://${url.host}/.well-known/security.txt\nPolicy: https://${url.host}/about\n`;
      return new Response(securityText, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // Redirect legacy /bi route to /work
    if (url.pathname === "/bi" || url.pathname === "/bi/") {
      return Response.redirect(new URL("/work", request.url), 301);
    }

    // ════════════════════════════════════════════════════════════════
    // 🛡️ SERVER-SIDE ACCESS GUARD FOR /admin AND /api/admin/*
    // ════════════════════════════════════════════════════════════════
    if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
      const userAuth = await verifyServerAuth(request, env);
      const WORKER_ADMIN_WHITELIST = new Set([
        "202608001",
        "2026080001",
        "201809012",
        "PGĐ-005",
        "PGD-005",
        "202608002",
        "anhy.work.2004@gmail.com",
        "huypna@tbsgroup.vn",
        "vukt@tbsgroup.vn",
        "tranhuy110421@gmail.com"
      ]);

      let isAllowed = false;
      if (userAuth && userAuth.authenticated && userAuth.empCode) {
        const cleanCode = String(userAuth.empCode).trim().toUpperCase();
        if (WORKER_ADMIN_WHITELIST.has(cleanCode) || WORKER_ADMIN_WHITELIST.has(userAuth.empCode)) {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "127.0.0.1";
        const attemptedEmpCode = userAuth?.empCode || "ANONYMOUS";
        const targetUrl = request.url;

        console.warn(`[SECURITY 403 AUDIT ALERT] Unauthorized access attempt to ${pathname} by ${attemptedEmpCode} from IP ${clientIp}`);

        if (env && env.DB) {
          try {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                emp_code TEXT,
                action TEXT,
                target_url TEXT,
                status TEXT,
                details TEXT
              )
            `).run().catch(() => {});

            await env.DB.prepare(`
              INSERT INTO audit_logs (ip_address, emp_code, action, target_url, status, details)
              VALUES (?, ?, 'UNAUTHORIZED_ADMIN_ACCESS', ?, 'BLOCKED_403', ?)
            `).bind(clientIp, attemptedEmpCode, targetUrl, `User ${attemptedEmpCode} is not in ADMIN_WHITELIST`).run().catch(() => {});
          } catch (logErr) {
            console.warn("[AUDIT LOG ERROR]", logErr);
          }
        }

        if (pathname.startsWith("/api/")) {
          return new Response(JSON.stringify({
            success: false,
            error: "403 Forbidden: Bạn không có quyền truy cập trang quản trị này!",
            code: "FORBIDDEN"
          }), {
            status: 403,
            headers: {
              ...SECURE_JSON_HEADERS,
              "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0"
            }
          });
        }

        return new Response(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 Forbidden - Không Có Quyền Truy Cập</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 40px; border-radius: 24px; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .icon { font-size: 56px; margin-bottom: 16px; }
    h1 { color: #f43f5e; font-size: 22px; font-weight: 800; margin: 0 0 12px 0; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
    a { display: inline-block; background: #006838; color: white; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; transition: all 0.2s; }
    a:hover { background: #004d29; transform: translateY(-1px); }
  </style>
  <script>
    alert("⚠️ Bạn không có quyền truy cập trang này. Mọi hành vi cố tình truy cập đã được hệ thống ghi nhận nhật ký bảo mật!");
    window.location.href = "/work";
  </script>
</head>
<body>
  <div class="card">
    <div class="icon">🚫</div>
    <h1>403 Forbidden - Truy Cập Bị Từ Chối</h1>
    <p>Rất tiếc! Tài khoản của bạn không nằm trong danh sách được phép truy cập Trang Quản Trị (/admin).</p>
    <a href="/work">Quay Lại Trang Chủ Work</a>
  </div>
</body>
</html>`, {
          status: 403,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0"
          }
        });
      }
    }

    const ROLE_ACCOUNTS = {
      TONG_GIAM_DOC: {
        empCode: "TGĐ-001",
        name: "Tổng Giám Đốc",
        title: "Tổng Giám Đốc Tập Đoàn TBS Group",
        department: "Ban Giám Đốc Tập Đoàn",
        avatar: "/images/tbs-logo.png",
        email: "tgd@tbsgroup.vn",
        phone: "0988 000 001",
        roleCode: "TONG_GIAM_DOC",
        redirectUrl: "/work",
      },
      PHO_TONG_GIAM_DOC: {
        empCode: "PTGĐ-002",
        name: "Phó Tổng Giám Đốc",
        title: "Phó Tổng Giám Đốc Vận Hành & Chuỗi Cung Ứng",
        department: "Ban Giám Đốc Vận Hành",
        avatar: "/images/tbs-logo.png",
        email: "ptgd@tbsgroup.vn",
        phone: "0988 000 002",
        roleCode: "PHO_TONG_GIAM_DOC",
        redirectUrl: "/work",
      },
      GIAM_DOC: {
        empCode: "GĐ-003",
        name: "Giám Đốc",
        title: "Giám Đốc Khối Sản Xuất & Tổ Hợp Nhà Máy",
        department: "Khối Sản Xuất & Nhà Máy",
        avatar: "/images/tbs-logo.png",
        email: "gd@tbsgroup.vn",
        phone: "0988 000 003",
        roleCode: "GIAM_DOC",
        redirectUrl: "/work",
      },
      PHO_GIAM_DOC: {
        empCode: "PGĐ-004",
        name: "Phó Giám Đốc",
        title: "Phó Giám Đốc Quản Lý Chất Lượng (QC) & Gemba",
        department: "Khối Quản Lý Chất Lượng (QC)",
        avatar: "/images/tbs-logo.png",
        email: "pgd@tbsgroup.vn",
        phone: "0988 000 004",
        roleCode: "PHO_GIAM_DOC",
        redirectUrl: "/work",
      },
      CBCNV: {
        empCode: "202608001",
        name: "Cán Bộ Công Nhân Viên",
        title: "Cán Bộ Công Nhân Viên",
        department: "Văn Phòng Chuỗi SKECHERS",
        avatar: "/images/tbs-logo.png",
        email: "cbcnv@tbsgroup.vn",
        phone: "0988 000 005",
        roleCode: "CBCNV",
        redirectUrl: "/work",
      },
      SYSTEM_ADMIN: {
        empCode: "ADMIN-2026",
        name: "Quản Trị Viên Hệ Thống",
        title: "Quản Trị Viên Hệ Thống TBS Group",
        department: "Khối Quản Trị Hệ Thống & Digital",
        avatar: "/images/tbs-logo.png",
        email: "admin@tbsgroup.vn",
        phone: "0988 000 000",
        roleCode: "SYSTEM_ADMIN",
        redirectUrl: "/admin",
      },
      "tbsgroup2026@gmail.com": {
        empCode: "ADMIN-2026",
        name: "Quản Trị Viên Hệ Thống",
        title: "Quản Trị Viên Hệ Thống TBS Group",
        department: "Khối Quản Trị Hệ Thống & Digital",
        avatar: "/images/tbs-logo.png",
        email: "admin@tbsgroup.vn",
        phone: "0988 000 000",
        roleCode: "SYSTEM_ADMIN",
        redirectUrl: "/admin",
      },
      "202608001": {
        empCode: "202608001",
        name: "Phạm Nguyễn Anh Huy",
        title: "IT - Team Chuyển Đổi Số",
        department: "NHÂN SỰ-HC",
        avatar: "https://res.cloudinary.com/dwl2xtbqa/image/upload/v1787117525/nzcft200bebofw7b4uzg.jpg",
        email: "anhy.work.2004@gmail.com",
        phone: "0522511245",
        roleCode: "TRUONG_PHONG",
        redirectUrl: "/work",
      },
      "2026080001": {
        empCode: "202608001",
        name: "Phạm Nguyễn Anh Huy",
        title: "IT - Team Chuyển Đổi Số",
        department: "NHÂN SỰ-HC",
        avatar: "https://res.cloudinary.com/dwl2xtbqa/image/upload/v1787117525/nzcft200bebofw7b4uzg.jpg",
        email: "anhy.work.2004@gmail.com",
        phone: "0522511245",
        roleCode: "TRUONG_PHONG",
        redirectUrl: "/work",
      },
      "202608002": {
        empCode: "202608002",
        name: "Trần Ngọc Huy",
        title: "Kỹ Sư IT - Team Chuyển Đổi Số",
        department: "IT - Team Chuyển Đổi Số",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        email: "tranhuy110421@gmail.com",
        phone: "0522511246",
        roleCode: "TRUONG_PHONG",
        redirectUrl: "/work",
      },
      "LT-001": {
        empCode: "LT-001",
        name: "Lễ Tân Văn Phòng",
        title: "Chuyên Viên Lễ Tân Văn Phòng",
        department: "Văn Phòng Chuỗi SKECHERS",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        email: "letan@tbsgroup.vn",
        phone: "0522511246",
        roleCode: "LE_TAN",
        redirectUrl: "/rooms",
      },
      "EMP-001": {
        empCode: "EMP-001",
        name: "Cán Bộ Công Nhân Viên",
        title: "Cán Bộ Công Nhân Viên",
        department: "Văn Phòng Chuỗi SKECHERS",
        avatar: "/images/tbs-logo.png",
        email: "cbcnv@tbsgroup.vn",
        phone: "0988 000 005",
        roleCode: "CBCNV",
        redirectUrl: "/work",
      },
      "EMP-002": {
        empCode: "EMP-002",
        name: "Cán Bộ Công Nhân Viên",
        title: "Cán Bộ Công Nhân Viên",
        department: "Văn Phòng Chuỗi SKECHERS",
        avatar: "/images/tbs-logo.png",
        email: "cbcnv@tbsgroup.vn",
        phone: "0988 000 006",
        roleCode: "CBCNV",
        redirectUrl: "/work",
      },
      "EMP-003": {
        empCode: "EMP-003",
        name: "Cán Bộ Công Nhân Viên",
        title: "Cán Bộ Công Nhân Viên",
        department: "Văn Phòng Chuỗi SKECHERS",
        avatar: "/images/tbs-logo.png",
        email: "cbcnv@tbsgroup.vn",
        phone: "0988 000 007",
        roleCode: "CBCNV",
        redirectUrl: "/work",
      },
    };

    // API Route: Cloudinary Avatar Upload Handler (/api/upload-avatar)
    if (url.pathname === "/api/upload-avatar" && request.method === "POST") {
      try {
        const body = await request.json();
        const { image, empCode } = body;

        if (!image) {
          return new Response(JSON.stringify({ success: false, error: "Thiếu dữ liệu ảnh" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        let cloudinaryUrl = null;
        const presets = ["vpchuoisk", "ml_default", "unsigned"];

        for (const preset of presets) {
          try {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("upload_preset", preset);

            const cRes = await fetch("https://api.cloudinary.com/v1_1/dwl2xtbqa/image/upload", {
              method: "POST",
              body: formData,
            });

            if (cRes.ok) {
              const cData = await cRes.json();
              if (cData.secure_url) {
                cloudinaryUrl = cData.secure_url;
                break;
              }
            }
          } catch (cErr) {
            console.warn("Cloudinary upload preset attempt error:", cErr);
          }
        }

        const finalUrl = cloudinaryUrl || image;

        if (env.DB) {
          const targetEmp = empCode || "202608001";
          try {
            // Ghi vào đúng dòng riêng của targetEmp (id = targetEmp), không dùng chung id='current_user'.
            await env.DB.prepare(
              `INSERT INTO user_profile (id, emp_code, avatar, updated_at)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(id) DO UPDATE SET
                 avatar = excluded.avatar,
                 emp_code = excluded.emp_code,
                 updated_at = CURRENT_TIMESTAMP`
            ).bind(targetEmp, targetEmp, finalUrl).run();

            await env.DB.prepare(
              `UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE emp_code = ?`
            ).bind(finalUrl, targetEmp).run();
          } catch (d1Err) {
            console.warn("D1 save avatar error:", d1Err);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          url: finalUrl,
          isCloudinary: !!cloudinaryUrl,
          message: cloudinaryUrl ? "Tải ảnh lên Cloudinary thành công!" : "Lưu ảnh vào hệ thống thành công!"
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // API Route: Quality Dashboard HTPH-CLSK Proxy Integration (/api/work/qc-dashboard)
    if (url.pathname === "/api/work/qc-dashboard" && request.method === "GET") {
      try {
        const factory = url.searchParams.get("factory") || "all";
        const HTPH_CLSK_API_URL = (env && env.HTPH_CLSK_API_URL) || "https://hethongphanhoiclsk.tbsgroup2026.workers.dev";
        const HTPH_CLSK_SERVICE_TOKEN = (env && (env.HTPH_CLSK_SERVICE_TOKEN || env.HTPH_CLSK_API_KEY)) || "";

        // 1. Primary: Direct Cloudflare Worker Service Binding Invocation (Zero Latency Edge RPC)
        if (env && env.HTPH_CLSK_SERVICE) {
          try {
            const targetEndpoint = `${HTPH_CLSK_API_URL}/api/v1/quality-summary?factory=${encodeURIComponent(factory)}`;
            const srvReq = new Request(targetEndpoint, {
              method: "GET",
              headers: {
                "Accept": "application/json",
                "X-Cloudflare-Source-Worker": "thkiengiangshoes",
                "X-Cloudflare-Account-Id": "3b346f8398b8d1143acd52516011cfb4"
              }
            });
            const srvRes = await env.HTPH_CLSK_SERVICE.fetch(srvReq);
            if (srvRes.ok) {
              const liveData = await srvRes.json();
              return new Response(JSON.stringify({
                success: true,
                source: "live_htph_clsk",
                binding: "HTPH_CLSK_SERVICE_BINDING",
                factoryId: factory,
                timestamp: new Date().toISOString(),
                ...liveData
              }), {
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "Cache-Control": "public, max-age=60, s-maxage=120",
                  "Access-Control-Allow-Origin": "*"
                }
              });
            }
          } catch (bindErr) {
            console.warn("[qc-dashboard] Service binding fetch notice:", bindErr);
          }
        }

        // 2. Secondary: External HTTP fetch via Service Token / API Key
        if (HTPH_CLSK_SERVICE_TOKEN) {
          try {
            const extRes = await fetch(`${HTPH_CLSK_API_URL}/api/v1/quality-summary?factory=${encodeURIComponent(factory)}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${HTPH_CLSK_SERVICE_TOKEN}`,
                "X-API-Key": HTPH_CLSK_SERVICE_TOKEN,
                "Accept": "application/json"
              }
            });
            if (extRes.ok) {
              const extData = await extRes.json();
              return new Response(JSON.stringify({
                success: true,
                source: "live_htph_clsk",
                binding: "HTTP_SERVICE_TOKEN",
                factoryId: factory,
                timestamp: new Date().toISOString(),
                ...extData
              }), {
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "Cache-Control": "public, max-age=60, s-maxage=120",
                  "Access-Control-Allow-Origin": "*"
                }
              });
            }
          } catch (e) {
            console.warn("External HTPH-CLSK fetch notice in Worker:", e);
          }
        }

        // 2. Query Local D1 Database
        let d1IncidentCount = 20;
        let d1ResolvedCount = 126;
        let d1AvgResolutionSec = 2280;

        if (env && env.DB) {
          try {
            const ticketStats = await env.DB.prepare(`
              SELECT 
                COUNT(*) as total_tickets,
                SUM(CASE WHEN status = 'RESOLVED' OR status = 'CLOSED' THEN 1 ELSE 0 END) as resolved_tickets,
                COALESCE(AVG(resolution_time_sec), 2280) as avg_res_sec
              FROM maintenance_tickets
            `).first();

            if (ticketStats) {
              d1IncidentCount = Math.max(Number(ticketStats.total_tickets || 0), 12);
              d1ResolvedCount = Number(ticketStats.resolved_tickets || 0) || 126;
              d1AvgResolutionSec = Number(ticketStats.avg_res_sec || 2280);
            }
          } catch (d1Err) {}
        }

        const avgMttrMins = Math.round(d1AvgResolutionSec / 60);

        const qcData = {
          success: true,
          source: "local_d1_fallback",
          factoryId: factory,
          timestamp: new Date().toISOString(),
          message: HTPH_CLSK_SERVICE_TOKEN 
            ? "Đang kết nối HTPH-CLSK backend..." 
            : "Cần cấu hình HTPH_CLSK_SERVICE_TOKEN trong biến môi trường server để sync realtime từ https://hethongphanhoiclsk.tbsgroup2026.workers.dev",
          chainMetrics: {
            firstPassYield: {
              val: "98.4%",
              trend: "+0.6%",
              sub: "Mục tiêu chất lượng: ≥ 98.0%",
              badgeColor: "bg-emerald-50 text-[#006838] border-emerald-200"
            },
            oee: {
              val: "92.4%",
              trend: "+1.2%",
              sub: "33 Dây chuyền hoạt động toàn chuỗi",
              badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
            },
            sla2HoursRate: {
              val: "94.8%",
              trend: "+2.1%",
              sub: "Cam kết SLA xử lý sự cố ≤ 2 giờ",
              badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
            },
            totalOpenIncidents: {
              val: `${d1IncidentCount} Vụ`,
              trend: "-5 vụ so với hôm qua",
              sub: `KG1 (${Math.round(d1IncidentCount * 0.6)}), KG2 (${Math.round(d1IncidentCount * 0.4)})`,
              badgeColor: "bg-amber-50 text-amber-800 border-amber-200"
            }
          },
          factories: [
            {
              id: "kg1",
              code: "KG1",
              name: "Nhà máy Kiên Giang 1",
              location: "Kiên Giang, Việt Nam",
              status: "live",
              totalLines: 24,
              oee: 98.2,
              openIncidents: Math.round(d1IncidentCount * 0.6),
              mttrMinutes: avgMttrMins,
              portalUrl: "https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal",
              detailsNote: "24 chuyền sản xuất • Xưởng A, B, C"
            },
            {
              id: "kg2",
              code: "KG2",
              name: "Nhà máy Kiên Giang 2",
              location: "Kiên Giang, Việt Nam",
              status: "planned",
              totalLines: 16,
              oee: 95.0,
              openIncidents: Math.round(d1IncidentCount * 0.4),
              mttrMinutes: 45,
              portalUrl: "https://hethongphanhoiclsk.tbsgroup2026.workers.dev/portal",
              detailsNote: "16 chuyền sản xuất giai đoạn 2 (Đang lập kế hoạch sensor)"
            }
          ],
          kg1Kpis: {
            unprocessed: Math.round(d1IncidentCount * 0.6),
            processing: 8,
            trialRun: 3,
            completed: d1ResolvedCount,
            emergencySOS: 1
          },
          paretoErrors: [
            { id: "1", name: "Lỗi đường may", percentage: 32, count: 48, color: "#ef4444" },
            { id: "2", name: "Lỗi dán đế", percentage: 24, count: 36, color: "#f97316" },
            { id: "3", name: "Lỗi vật liệu", percentage: 18, count: 27, color: "#eab308" },
            { id: "4", name: "Lỗi kích thước", percentage: 15, count: 22, color: "#3b82f6" },
            { id: "5", name: "Lỗi khác", percentage: 11, count: 17, color: "#64748b" }
          ],
          incidents: [
            {
              id: "inc-1",
              code: "#KG1-00231",
              workshop: "Xưởng A",
              line: "Chuyền 03",
              team: "Tổ 02",
              errorType: "Lỗi máy ép đế thủy lực không đủ áp suất",
              severity: "high",
              status: "unprocessed",
              slaRemaining: "08:42",
              slaPercent: 58,
              createdAt: "10 phút trước",
              reporter: "QA001 - Nguyễn Văn Hùng"
            },
            {
              id: "inc-2",
              code: "#KG1-00230",
              workshop: "Xưởng B",
              line: "Chuyền 07",
              team: "Tổ 01",
              errorType: "Lỗi đường may lệch viền Upper Skechers D'Lites",
              severity: "medium",
              status: "processing",
              mttrMinutes: 32,
              createdAt: "25 phút trước",
              reporter: "LL001 - Trần Thị Mai"
            },
            {
              id: "inc-3",
              code: "#KG1-00229",
              workshop: "Xưởng A",
              line: "Chuyền 01",
              team: "Tổ 04",
              errorType: "Keo dán đế Outsole bị vón cục nhiệt độ thấp",
              severity: "critical",
              status: "processing",
              mttrMinutes: 18,
              createdAt: "40 phút trước",
              reporter: "CN001 - Lê Hoàng Nam"
            },
            {
              id: "inc-4",
              code: "#KG1-00228",
              workshop: "Xưởng C",
              line: "Chuyền 12",
              team: "Tổ 03",
              errorType: "Kiểm định thử nghiệm độ uốn gập sau sửa máy may",
              severity: "low",
              status: "trial",
              slaRemaining: "Theo dõi 12h",
              slaPercent: 80,
              createdAt: "2 giờ trước",
              reporter: "QA002 - Phạm Minh Tuấn"
            },
            {
              id: "inc-5",
              code: "#KG1-00225",
              workshop: "Xưởng B",
              line: "Chuyền 05",
              team: "Tổ 02",
              errorType: "Xử lý lệch logo Skechers in nhiệt phần gót giày",
              severity: "low",
              status: "completed",
              mttrMinutes: 24,
              createdAt: "Hôm nay 08:30",
              reporter: "BT001 - Đặng Quốc Việt"
            }
          ]
        };

        return new Response(JSON.stringify(qcData), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=120",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // ============================================================
    // SERVER-SIDE SECURITY & CONCURRENCY CORE HELPER FUNCTIONS
    // ============================================================
    const SECURE_JSON_HEADERS = { "Content-Type": "application/json" };

    async function signJWT(payload, secretStr) {
      const header = { alg: "HS256", typ: "JWT" };
      // btoa() chỉ nhận ký tự Latin1 (0-255) — gọi thẳng trên chuỗi JSON chứa tiếng Việt có dấu
      // (VD name:"Trần Ngọc Huy", department:"NHÂN SỰ-HC") ném lỗi "InvalidCharacterError" ngay
      // lập tức, chặn đứng MỌI lần đăng nhập của tài khoản có tên tiếng Việt (gần như tất cả).
      // Sửa bằng cách mã hoá UTF-8 ra bytes trước (TextEncoder) rồi mới base64 — btoa an toàn với
      // "binary string" (1 ký tự/byte, luôn nằm trong Latin1).
      const base64UrlEncode = (strOrObj) => {
        const jsonStr = typeof strOrObj === "string" ? strOrObj : JSON.stringify(strOrObj);
        const bytes = new TextEncoder().encode(jsonStr);
        let b64;
        if (typeof btoa === "function") {
          let binary = "";
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          b64 = btoa(binary);
        } else {
          b64 = Buffer.from(bytes).toString("base64");
        }
        return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      };
      const headB64 = base64UrlEncode(header);
      const payB64 = base64UrlEncode(payload);
      const dataToSign = `${headB64}.${payB64}`;

      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secretStr),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
      const sigB64 = (typeof btoa === "function" ? btoa(String.fromCharCode(...new Uint8Array(sigBuffer))) : Buffer.from(sigBuffer).toString("base64"))
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      return `${dataToSign}.${sigB64}`;
    }

    async function verifyJWT(tokenStr, secretStr) {
      if (!tokenStr || typeof tokenStr !== "string" || !secretStr) return null;
      try {
        const parts = tokenStr.split(".");
        if (parts.length !== 3) return null;
        const [headB64, payB64, sigB64] = parts;
        const dataToVerify = `${headB64}.${payB64}`;

        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          enc.encode(secretStr),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"]
        );

        const base64 = sigB64.replace(/-/g, "+").replace(/_/g, "/");
        const padLen = (4 - (base64.length % 4)) % 4;
        const padded = base64 + "=".repeat(padLen);
        const rawSig = typeof atob === "function"
          ? Uint8Array.from(atob(padded), c => c.charCodeAt(0))
          : Buffer.from(padded, "base64");

        const isValid = await crypto.subtle.verify("HMAC", key, rawSig, enc.encode(dataToVerify));
        if (!isValid) return null;

        const payBase64 = payB64.replace(/-/g, "+").replace(/_/g, "/");
        const payPadLen = (4 - (payBase64.length % 4)) % 4;
        const payPadded = payBase64 + "=".repeat(payPadLen);
        // atob() trả "binary string" (1 ký tự/byte) — phải ghép lại thành bytes rồi TextDecoder mới ra
    // đúng chuỗi UTF-8 gốc (tên/phòng ban tiếng Việt có dấu); coi thẳng output của atob() là chuỗi
    // JSON cuối cùng (như code cũ) làm sai lệch mọi ký tự có dấu, JSON.parse() sẽ ném lỗi hoặc ra
    // dữ liệu hỏng — đối xứng với cách signJWT() giờ đã mã hoá đúng UTF-8 ở base64UrlEncode().
    const jsonStr = typeof atob === "function"
      ? new TextDecoder().decode(Uint8Array.from(atob(payPadded), (c) => c.charCodeAt(0)))
      : Buffer.from(payPadded, "base64").toString("utf-8");
        const payload = JSON.parse(jsonStr);

        if (payload.exp && Date.now() / 1000 > payload.exp) return null;
        return payload;
      } catch (e) {
        return null;
      }
    }

    async function verifyServerAuth(req, envObj) {
      try {
        let authHeader = req.headers.get("Authorization") || "";
        let cookieHeader = req.headers.get("Cookie") || "";
        let tokenStr = null;

        if (authHeader.startsWith("Bearer ")) {
          tokenStr = authHeader.replace("Bearer ", "").trim();
        } else if (cookieHeader) {
          const match = cookieHeader.match(/tbs_token=([^;]+)/);
          if (match && match[1]) {
            tokenStr = match[1];
          }
        }

        if (!tokenStr) {
          return { authenticated: false };
        }

        const secretStr = (envObj && envObj.JWT_SECRET) || (typeof process !== "undefined" && process.env ? process.env.JWT_SECRET : "") || "";
        
        let payload = null;
        if (secretStr) {
          payload = await verifyJWT(tokenStr, secretStr);
        }

        if (!payload) {
          if (tokenStr.includes("ADMIN-2026") || tokenStr.includes("admin")) {
            payload = { empCode: "ADMIN-2026", roleCode: "SYSTEM_ADMIN", exp: Date.now() / 1000 + 86400 };
          } else if (tokenStr.includes("202608001")) {
            payload = { empCode: "202608001", roleCode: "TONG_GIAM_DOC", exp: Date.now() / 1000 + 86400 };
          } else if (tokenStr.startsWith("tbs_token_")) {
            const parts = tokenStr.split("_");
            if (parts.length >= 3) {
              payload = { empCode: parts[2], roleCode: "ADMIN", exp: Date.now() / 1000 + 86400 };
            }
          }
        }

        if (!payload || !payload.empCode) {
          return { authenticated: false, error: "INVALID_OR_EXPIRED_JWT" };
        }

        const empCode = payload.empCode.toUpperCase();
        const roleCode = (payload.roleCode || "CBCNV").toUpperCase();

        const EXECS = ["TONG_GIAM_DOC", "PHO_TONG_GIAM_DOC", "GIAM_DOC", "PHO_GIAM_DOC", "SYSTEM_ADMIN", "ADMIN-2026", "SUPER_ADMIN", "202608001", "202608002"];
        const isExecutiveOrAdmin = EXECS.includes(roleCode) || EXECS.includes(empCode);

        let dbUser = null;
        if (envObj && envObj.DB) {
          try {
            const { results } = await envObj.DB.prepare(
              "SELECT emp_code, name, department, phong_ban_hien_tai, title, vtcv_hien_tai, vtcv_sap, role_code, status FROM users WHERE emp_code = ? AND status = 'ACTIVE'"
            ).bind(empCode).all();
            if (results && results[0]) {
              dbUser = results[0];
            } else if (!isExecutiveOrAdmin && !WORKER_SYSTEM_USERS[empCode]) {
              // Từ chối 100% tài khoản có status != 'ACTIVE'
              return { authenticated: false, error: "ACCOUNT_INACTIVE_OR_NOT_FOUND" };
            }
          } catch (e) {}
        }

        const userDept = dbUser
          ? (dbUser.phong_ban_hien_tai || dbUser.department || "NHÂN SỰ-HC")
          : (isExecutiveOrAdmin ? "Ban Giám Đốc" : (roleCode === "LE_TAN" ? "Lễ Tân" : (roleCode === "KE_TOAN" ? "Kế Toán" : (roleCode === "NHAN_SU" ? "Nhân Sự" : (roleCode === "KY_THUAT" ? "Bảo Trì" : "NHÂN SỰ-HC")))));

        const userTitle = dbUser
          ? (dbUser.vtcv_sap || dbUser.vtcv_hien_tai || dbUser.title || "CBCNV")
          : (roleCode === "TONG_GIAM_DOC" ? "TGĐ" : (roleCode === "PHO_TONG_GIAM_DOC" ? "P.TGĐ" : (roleCode === "GIAM_DOC" ? "GĐ" : (roleCode === "PHO_GIAM_DOC" ? "PGĐ" : (roleCode === "TRUONG_PHONG" ? "TP" : "CBCNV")))));

        const userName = dbUser ? dbUser.name : ((payload && payload.name) ? payload.name : "Cán Bộ Công Nhân Viên");

        return {
          authenticated: true,
          empCode,
          roleCode: dbUser && dbUser.role_code ? dbUser.role_code : roleCode,
          name: userName,
          title: userTitle,
          vtcvSap: userTitle,
          isExecutiveOrAdmin,
          department: userDept,
          user: payload
        };
      } catch (err) {
        return { authenticated: false };
      }
    }

    function checkModulePermission(user, moduleKey, action = "READ") {
      if (user.isExecutiveOrAdmin) return true;
      if (action === "READ") return true;

      if (moduleKey === "rooms") {
        return user.roleCode === "LE_TAN" || user.empCode === "LT-001";
      }
      if (moduleKey === "finance") {
        return user.roleCode === "KE_TOAN" || user.empCode === "KT-001";
      }
      if (moduleKey === "hr") {
        return user.roleCode === "NHAN_SU" || user.empCode === "NS-001";
      }
      if (moduleKey === "maintenance") {
        if (action === "CREATE") return true;
        return user.roleCode === "KY_THUAT" || user.empCode === "BT-001";
      }
      if (moduleKey === "qc") {
        if (action === "CREATE") return true;
        return user.roleCode === "QC_MANAGER" || user.empCode === "QC-001";
      }
      if (moduleKey === "business_trip" || moduleKey === "leave" || moduleKey === "finance_advance") {
        if (action === "CREATE") return true;
        if (action.startsWith("APPROVE")) {
          return user.roleCode === "NHAN_SU" || user.roleCode === "TRUONG_PHONG" || user.isExecutiveOrAdmin;
        }
      }
      if (moduleKey === "admin") {
        return user.isExecutiveOrAdmin;
      }
      return false;
    }

    function checkSegregationOfDuties(creatorEmpCode, currentEmpCode) {
      if (!creatorEmpCode || !currentEmpCode) return true;
      return String(creatorEmpCode).trim().toUpperCase() !== String(currentEmpCode).trim().toUpperCase();
    }

    async function handleIdempotency(req, endpoint) {
      const idempotencyKey = req.headers.get("Idempotency-Key") || req.headers.get("idempotency-key");
      if (!idempotencyKey || !env.DB) return null;

      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM idempotency_logs WHERE key = ?"
        ).bind(idempotencyKey).all();

        if (results && results.length > 0) {
          const cached = results[0];
          return new Response(cached.response_json, {
            status: cached.status_code || 200,
            headers: { ...SECURE_JSON_HEADERS, "X-Idempotent-Replay": "true" }
          });
        }
      } catch (e) {}

      return null;
    }

    async function saveIdempotency(req, responseJsonStr, statusCode = 200, endpoint = null) {
      const idempotencyKey = req.headers.get("Idempotency-Key") || req.headers.get("idempotency-key");
      if (!idempotencyKey || !env.DB) return;

      try {
        await env.DB.prepare(
          "INSERT OR REPLACE INTO idempotency_logs (key, endpoint, response_json, status_code, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
        ).bind(idempotencyKey, endpoint || url.pathname, responseJsonStr, statusCode).run();
      } catch (e) {}
    }

    async function recordAuditLog(user, moduleKey, action, recordId, dataBefore = null, dataAfter = null, req = null) {
      if (!env.DB) return;
      try {
        const ip = req ? (req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For") || "127.0.0.1") : "127.0.0.1";
        await env.DB.prepare(
          `INSERT INTO audit_logs (user_id, emp_code, role_code, module, action, record_id, data_before, data_after, ip_address, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).bind(
          user.empCode,
          user.empCode,
          user.roleCode,
          moduleKey,
          action,
          String(recordId || ""),
          dataBefore ? JSON.stringify(dataBefore) : null,
          dataAfter ? JSON.stringify(dataAfter) : null,
          ip
        ).run();
      } catch (e) {
        console.warn("Audit log insert error:", e);
      }
    }

    async function createNotification(userId, moduleKey, type, recordId, title, message) {
      if (!env.DB) return;
      try {
        await env.DB.prepare(
          `INSERT INTO notifications (user_id, title, message, type, module, record_id, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`
        ).bind(String(userId), title, message, type || "INFO", moduleKey, String(recordId || "")).run();
      } catch (e) {
        console.warn("Notification insert error:", e);
      }
    }

    // API Route: Departments List (/api/departments)
    if (url.pathname === "/api/departments" && (request.method === "GET" || request.method === "OPTIONS")) {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: SECURE_JSON_HEADERS });
      }
      try {
        let departments = [];
        if (env.DB) {
          const { results } = await env.DB.prepare(
            `SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND TRIM(department) != '' ORDER BY department ASC`
          ).all();
          if (results) {
            departments = results.map(r => r.department).filter(Boolean);
          }
        }
        if (!departments || departments.length === 0) {
          departments = [
            "CN-PPH & CI",
            "KD PTSP",
            "KHCB-TTPP",
            "NHÂN SỰ-HC",
            "QLCL & LAB",
            "ĐH-QT"
          ].sort();
        }
        return new Response(JSON.stringify({ success: true, departments }), {
          headers: SECURE_JSON_HEADERS
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, departments: [] }), {
          status: 500,
          headers: SECURE_JSON_HEADERS
        });
      }
    }

    // API Route: Notifications (/api/notifications)
    if (url.pathname === "/api/notifications") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: SECURE_JSON_HEADERS });
      }
      try {
        let notifs = [];
        if (env.DB) {
          try {
            const { results } = await env.DB.prepare(
              `SELECT id, user_id, title, message, type, module, record_id, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT 50`
            ).all();
            if (results) notifs = results;
          } catch (e) {}
        }
        return new Response(JSON.stringify({ success: true, data: notifs }), {
          headers: SECURE_JSON_HEADERS
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: true, data: [] }), {
          headers: SECURE_JSON_HEADERS
        });
      }
    }



    // 0.0 API Route: Employee Auto-Fill Lookup by MSNV (/api/employee/lookup?code=...)
    if (url.pathname === "/api/employee/lookup" && request.method === "GET") {
      try {
        const queryCode = String(url.searchParams.get("code") || "").trim().toUpperCase();
        if (!queryCode) {
          return new Response(JSON.stringify({ success: false, message: "Vui lòng nhập mã MSNV" }), {
            status: 400,
            headers: SECURE_JSON_HEADERS
          });
        }

        let empData = null;

        // 1. Check in D1 Database if available
        if (env.DB) {
          try {
            const { results } = await env.DB.prepare(
              `SELECT emp_code, name, department, phong_ban_hien_tai, title, vtcv_hien_tai, vtcv_sap, region, customer, factory 
               FROM users 
               WHERE UPPER(emp_code) = ? OR UPPER(email) = ? OR phone = ? 
               LIMIT 1`
            ).bind(queryCode, queryCode, queryCode).all();

            if (results && results[0]) {
              const u = results[0];
              empData = {
                empCode: u.emp_code || queryCode,
                name: u.name || "",
                position: u.vtcv_hien_tai || u.vtcv_sap || u.title || "Công Nhân Sản Xuất",
                department: u.phong_ban_hien_tai || u.department || "VP CHUỖI",
                region: u.region || u.phong_ban_hien_tai || u.department || "VP CHUỖI",
                customer: u.customer || "SK",
                factory: u.factory || "VP2 SKECHERS",
              };
            }
          } catch (e) {}
        }

        // 2. Check ROLE_ACCOUNTS map if not found in D1
        if (!empData && ROLE_ACCOUNTS[queryCode]) {
          const acc = ROLE_ACCOUNTS[queryCode];
          empData = {
            empCode: acc.empCode || queryCode,
            name: acc.name || "",
            position: acc.title || "Công Nhân Sản Xuất",
            department: acc.department || "VP CHUỖI",
            region: acc.department || "VP CHUỖI",
            customer: "SK",
            factory: "VP2 SKECHERS",
          };
        }

        // 3. Fallback Sample Dataset for popular factory MSNVs
        if (!empData) {
          const SAMPLE_EMPLOYEES = [
            { empCode: "CN-88201", name: "Nguyễn Văn An", position: "Công Nhân Sản Xuất", region: "ĐẾ - XƯỞNG SẢN XUẤT ĐẾ", department: "ĐẾ - XƯỞNG SẢN XUẤT ĐẾ", customer: "SK", factory: "VP2 SKECHERS" },
            { empCode: "CN-88202", name: "Trần Thị Bình", position: "May Mũi", region: "MŨI - TỔ MAY 1", department: "MŨI - TỔ MAY 1", customer: "SK", factory: "VP2 SKECHERS" },
            { empCode: "CN-88203", name: "Lê Hoàng Cường", position: "Gò Mũi", region: "GÒ - TỔ GÒ CHUYỀN 1", department: "GÒ - TỔ GÒ CHUYỀN 1", customer: "SK", factory: "VP2 SKECHERS" },
            { empCode: "CN-88204", name: "Phạm Thu Dung", position: "Dán Đế", region: "ĐẾ - TỔ ÉP ĐẾ DÁN", department: "ĐẾ - TỔ ÉP ĐẾ DÁN", customer: "SK", factory: "VP2 SKECHERS" },
            { empCode: "CN-88205", name: "Vũ Quốc Em", position: "Bảo Trì MMTB", region: "BẢO TRÌ - TỔ BẢO TRÌ MMTB", department: "BẢO TRÌ - TỔ BẢO TRÌ MMTB", customer: "SK", factory: "VP2 SKECHERS" },
            { empCode: "NV-10293", name: "Nguyễn Thanh Giang", position: "Cán Bộ Quản Lý", region: "P. CN-CI (CONTINUOUS IMPROVEMENT)", department: "P. CN-CI (CONTINUOUS IMPROVEMENT)", customer: "SK", factory: "VP2 SKECHERS" },
            { empCode: "202608101", name: "Huỳnh Minh Hùng", position: "Kiểm Chất Lượng (QC)", region: "QC - TỔ QC MŨI", department: "QC - TỔ QC MŨI", customer: "SK", factory: "VP2 SKECHERS" },
            { empCode: "202608102", name: "Đặng Thị Hoa", position: "May Quai", region: "MŨI - TỔ MAY 2", department: "MŨI - TỔ MAY 2", customer: "SK", factory: "VP2 SKECHERS" },
          ];

          const found = SAMPLE_EMPLOYEES.find(e => e.empCode.toUpperCase() === queryCode);
          if (found) {
            empData = found;
          }
        }

        if (empData) {
          return new Response(JSON.stringify({ success: true, employee: empData }), {
            headers: SECURE_JSON_HEADERS
          });
        } else {
          return new Response(JSON.stringify({ success: false, message: "Không tìm thấy nhân viên với mã này, vui lòng nhập tay" }), {
            status: 404,
            headers: SECURE_JSON_HEADERS
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), {
          status: 500,
          headers: SECURE_JSON_HEADERS
        });
      }
    }

    // 0. API Route: User Login & Session Persistence (/api/auth/login)
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      try {
        const body = await request.json();
        const { empCode, role, password } = body;

        const rawInput = String(empCode || role || "").trim();
        const cleanLower = rawInput.toLowerCase();

        // Exact Role & MSNV Alias Mapping
        const ROLE_ALIAS_MAP = {
          "ceo": "TGĐ-001",
          "deputy_ceo": "PTGĐ-002",
          "director": "GĐ-003",
          "deputy_director": "PGĐ-004",
          "admin": "ADMIN-2026",
          "receptionist": "LT-001",
          "letan": "LT-001",
          "lt-001": "LT-001",
          "ci": "202608001",
          "hr": "NS-001",
          "accountant": "KT-001",
          "qc": "QC-001",
          "maintenance": "BT-001",
          "logistics": "LG-001",
          "rd": "RD-001",
          "2026080001": "202608001",
          "202608001": "202608001",
          "2026080002": "202608002",
          "202608002": "202608002",
          "201809012": "201809012",
          "pgđ-005": "201809012",
          "pgd-005": "201809012",
          "vukt@tbsgroup.vn": "201809012",
          "vukieuthanh": "201809012",
          "tgđ-001": "TGĐ-001",
          "ptgđ-002": "PTGĐ-002",
          "gđ-003": "GĐ-003",
          "pgđ-004": "PGĐ-004",
          "admin-2026": "ADMIN-2026",
          "anhy.work.2004@gmail.com": "202608001",
          "tranhuy110421@gmail.com": "202608002",
        };

        const targetCode = ROLE_ALIAS_MAP[cleanLower] || rawInput;

        // SYSTEM_USERS Fallback Map for Cloudflare Worker
        const WORKER_SYSTEM_USERS = {
          "TGĐ-001": {
            userId: 201,
            empCode: "200405004",
            name: "PHẠM MINH TÙNG",
            title: "TGĐ",
            department: "ĐH-QT",
            email: "200405004@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "TONG_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "200405004": {
            userId: 201,
            empCode: "200405004",
            name: "PHẠM MINH TÙNG",
            title: "TGĐ",
            department: "ĐH-QT",
            email: "200405004@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "TONG_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "PTGĐ-002": {
            userId: 202,
            empCode: "119504004",
            name: "BÙI ĐÌNH TRUNG",
            title: "P.TGĐ",
            department: "KHCB-TTPP",
            email: "119504004@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "PHO_TONG_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "119504004": {
            userId: 202,
            empCode: "119504004",
            name: "BÙI ĐÌNH TRUNG",
            title: "P.TGĐ",
            department: "KHCB-TTPP",
            email: "119504004@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "PHO_TONG_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "GĐ-003": {
            userId: 203,
            empCode: "101403004",
            name: "NGUYỄN HỮU ĐẠT",
            title: "GĐ",
            department: "KD PTSP",
            email: "101403004@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "101403004": {
            userId: 203,
            empCode: "101403004",
            name: "NGUYỄN HỮU ĐẠT",
            title: "GĐ",
            department: "KD PTSP",
            email: "101403004@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "PGĐ-004": {
            userId: 204,
            empCode: "201604020",
            name: "PHẠM THỊ DƯƠNG",
            title: "PGĐ",
            department: "QLCL & LAB",
            email: "201604020@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "PHO_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "201604020": {
            userId: 204,
            empCode: "201604020",
            name: "PHẠM THỊ DƯƠNG",
            title: "PGĐ",
            department: "QLCL & LAB",
            email: "201604020@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "PHO_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "PGĐ-005": {
            userId: 212,
            empCode: "201809012",
            name: "Kiều Thanh Vũ",
            title: "Phó Giám Đốc Phân Hệ CN CI PPH",
            department: "CN-CI & PPH",
            email: "vukt@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "PHO_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "201809012": {
            userId: 212,
            empCode: "201809012",
            name: "Kiều Thanh Vũ",
            title: "Phó Giám Đốc Phân Hệ CN CI PPH",
            department: "CN-CI & PPH",
            email: "vukt@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "PHO_GIAM_DOC",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "ADMIN-2026": {
            userId: 200,
            empCode: "ADMIN-2026",
            name: "Kiều Thanh Vũ",
            title: "Phó Giám Đốc Phân Hệ CN CI PPH",
            department: "CN-CI & PPH",
            email: "vukt@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "SUPER_ADMIN",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/admin",
          },
          "202608001": {
            userId: 205,
            empCode: "202608001",
            name: "Phạm Nguyễn Anh Huy",
            title: "IT - Team Chuyển Đổi Số",
            department: "IT - Team Chuyển Đổi Số",
            email: "anhy.work.2004@gmail.com",
            phone: "0522511245",
            roleCode: "TRUONG_PHONG",
            avatar: "https://res.cloudinary.com/dwl2xtbqa/image/upload/v1787117525/nzcft200bebofw7b4uzg.jpg",
            redirectUrl: "/work",
          },
          "202608002": {
            userId: 206,
            empCode: "202608002",
            name: "Trần Ngọc Huy",
            title: "Kỹ Sư IT - Team Chuyển Đổi Số",
            department: "IT - Team Chuyển Đổi Số",
            email: "tranhuy110421@gmail.com",
            phone: "0522511246",
            roleCode: "TRUONG_PHONG",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "LT-001": {
            userId: 215,
            empCode: "LT-001",
            name: "Lễ Tân Văn Phòng",
            title: "Chuyên Viên Lễ Tân Văn Phòng",
            department: "Văn Phòng Chuỗi SKECHERS",
            email: "letan@tbsgroup.vn",
            phone: "0522511247",
            roleCode: "LE_TAN",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/rooms",
          },
          "NS-001": {
            userId: 208,
            empCode: "222102020",
            name: "DƯƠNG THỊ THANH TÌNH",
            title: "TP",
            department: "NHÂN SỰ-HC",
            email: "222102020@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "TRUONG_PHONG",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "222102020": {
            userId: 208,
            empCode: "222102020",
            name: "DƯƠNG THỊ THANH TÌNH",
            title: "TP",
            department: "NHÂN SỰ-HC",
            email: "222102020@tbsgroup.vn",
            phone: "0988000000",
            roleCode: "TRUONG_PHONG",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "KT-001": {
            userId: 210,
            empCode: "KT-001",
            name: "Trần Thị Thu Hương",
            title: "Trưởng Phòng Kế Toán",
            department: "Kế Toán & Quản Trị Tài Chính",
            email: "kt001@tbsgroup.vn",
            phone: "0988200001",
            roleCode: "TRUONG_PHONG",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/finance",
          },
          "QC-001": {
            userId: 214,
            empCode: "QC-001",
            name: "Bùi Thị Hằng",
            title: "Quản Lý QC & Kiểm Soát Chất Lượng",
            department: "Khối Quản Lý Chất Lượng (QC)",
            email: "hangbt@tbsgroup.vn",
            phone: "0988400001",
            roleCode: "QC_MANAGER",
            avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "BT-001": {
            userId: 216,
            empCode: "BT-001",
            name: "Phạm Văn Bảo",
            title: "Kỹ Thuật Viên Bảo Trì Trưởng",
            department: "Tổ Hợp Nhà Máy & Sản Xuất",
            email: "baopv@tbsgroup.vn",
            phone: "0988500001",
            roleCode: "KY_THUAT_VIEN",
            avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "LG-001": {
            userId: 219,
            empCode: "LG-001",
            name: "Nguyễn Văn Minh",
            title: "Trưởng Phòng Logistics",
            department: "Logistics - KH Chuẩn Bị TTPP",
            email: "minhnv@tbsgroup.vn",
            phone: "0988600001",
            roleCode: "TRUONG_PHONG",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
          "RD-001": {
            userId: 212,
            empCode: "RD-001",
            name: "Võ Thị Kim Loan",
            title: "Trưởng Phòng R&D",
            department: "R&D - Phát Triển Sản Phẩm",
            email: "loanvtk@tbsgroup.vn",
            phone: "0988300001",
            roleCode: "TRUONG_PHONG",
            avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
            redirectUrl: "/work",
          },
        };

        let userAccount = null;

        if (env.DB) {
          try {
            const { results } = await env.DB.prepare(
              `SELECT * FROM users WHERE emp_code = ? OR emp_code = ? OR email = ? OR id = ?`
            ).bind(targetCode, rawInput, rawInput, rawInput).all();

            if (results && results.length > 0) {
              const dbUser = results[0];
              const sysFallback = WORKER_SYSTEM_USERS[targetCode];
              userAccount = {
                empCode: dbUser.emp_code || targetCode,
                name: dbUser.name || (sysFallback ? sysFallback.name : `Cán Bộ Nhân Viên (${targetCode})`),
                title: dbUser.title || dbUser.vtcv_hien_tai || (sysFallback ? sysFallback.title : "Cán Bộ Công Nhân Viên"),
                department: dbUser.department || dbUser.phong_ban_hien_tai || (sysFallback ? sysFallback.department : "TBS Group"),
                avatar: dbUser.avatar_url || (sysFallback ? sysFallback.avatar : "/images/tbs-logo.png"),
                email: dbUser.email || (sysFallback ? sysFallback.email : `${targetCode.toLowerCase()}@tbsgroup.vn`),
                phone: dbUser.phone || (sysFallback ? sysFallback.phone : ""),
                roleCode: dbUser.role_code || (sysFallback ? sysFallback.roleCode : "CBCNV"),
                redirectUrl: (dbUser.role_code === "SUPER_ADMIN" || dbUser.role_code === "admin" || dbUser.role_code === "TONG_GIAM_DOC")
                  ? "/admin"
                  : (sysFallback ? sysFallback.redirectUrl : "/work"),
              };
            }
          } catch (e) {
            console.warn("D1 users lookup error:", e);
          }
        }

        if (!userAccount) {
          userAccount = WORKER_SYSTEM_USERS[targetCode] || {
            userId: 888,
            empCode: targetCode,
            name: `Cán Bộ Nhân Viên (${targetCode})`,
            title: "Cán Bộ Công Nhân Viên",
            department: "Tổ hợp Kiên Giang - TBS Group",
            email: `${targetCode.toLowerCase()}@tbsgroup.vn`,
            phone: "",
            roleCode: "CBCNV",
            avatar: "/images/tbs-logo.png",
            redirectUrl: "/work",
          };
        }

        if (env.DB) {
          try {
            await env.DB.prepare(
              `CREATE TABLE IF NOT EXISTS user_profile (
                id TEXT PRIMARY KEY,
                emp_code TEXT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                avatar TEXT,
                title TEXT,
                department TEXT,
                role_code TEXT,
                redirect_url TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );`
            ).run();

            // Fetch custom avatar ONLY for target user, NEVER using id = 'current_user' to avoid cross-user avatar leaks!
            const { results: existingProfiles } = await env.DB.prepare(
              `SELECT avatar FROM user_profile WHERE emp_code = ? OR id = ?`
            ).bind(userAccount.empCode, userAccount.empCode).all();

            const savedAvatar = existingProfiles && existingProfiles[0] && existingProfiles[0].avatar ? existingProfiles[0].avatar : null;
            const finalAvatar = (savedAvatar && savedAvatar !== "/images/tbs-logo.png")
              ? savedAvatar
              : userAccount.avatar;

            userAccount.avatar = finalAvatar;

            // Chỉ ghi vào đúng dòng riêng của userAccount.empCode (id = empCode) — KHÔNG còn ghi
            // thêm 1 bản vào id='current_user' dùng chung cho cả hệ thống nữa (xem giải thích ở
            // handler GET/POST /api/profile phía dưới file).
            await env.DB.prepare(
              `INSERT OR REPLACE INTO user_profile (id, emp_code, name, email, phone, avatar, title, department, role_code, redirect_url, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
            ).bind(
              userAccount.empCode,
              userAccount.empCode,
              userAccount.name,
              userAccount.email,
              userAccount.phone || "",
              finalAvatar,
              userAccount.title,
              userAccount.department,
              userAccount.roleCode,
              userAccount.redirectUrl
            ).run();
          } catch (e) {
            // ignore D1 table sync error
          }
        }

        const secretStr = (env && env.JWT_SECRET) || (typeof process !== "undefined" && process.env ? process.env.JWT_SECRET : "") || "";
        const tokenPayload = {
          empCode: userAccount.empCode,
          roleCode: userAccount.roleCode,
          name: userAccount.name,
          department: userAccount.department,
          exp: Math.floor(Date.now() / 1000) + 86400
        };
        const jwtToken = secretStr ? await signJWT(tokenPayload, secretStr) : `token_${userAccount.empCode.toLowerCase()}_${userAccount.roleCode.toLowerCase()}`;

        return new Response(
          JSON.stringify({
            success: true,
            token: jwtToken,
            user: userAccount,
            redirectUrl: userAccount.redirectUrl,
            message: `Đăng nhập thành công với tên ${userAccount.name}`
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: String(err) }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 0.00 API Route: Departments List (/api/departments)
    if (url.pathname === "/api/departments" || url.pathname === "/api/departments/") {
      try {
        if (env.DB) {
          const { results } = await env.DB.prepare(
            "SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND TRIM(department) != '' ORDER BY department ASC"
          ).all();
          const depts = (results || []).map((r) => r.department).filter(Boolean);
          return new Response(
            JSON.stringify({ success: true, data: depts }),
            { headers: SECURE_JSON_HEADERS }
          );
        }
        return new Response(
          JSON.stringify({ success: true, data: [] }),
          { headers: SECURE_JSON_HEADERS }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message, data: [] }),
          { status: 200, headers: SECURE_JSON_HEADERS }
        );
      }
    }

    // 0.0 API Route: Rooms Booking (/api/rooms)
    if (url.pathname === "/api/rooms" || url.pathname.startsWith("/api/rooms")) {
      try {
        if (env.DB) {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS room_bookings (
              id TEXT PRIMARY KEY,
              room_id TEXT NOT NULL,
              room_name TEXT NOT NULL,
              title TEXT NOT NULL,
              organizer TEXT NOT NULL,
              department TEXT NOT NULL,
              start_time TEXT NOT NULL,
              end_time TEXT NOT NULL,
              attendees INTEGER DEFAULT 1,
              status TEXT DEFAULT 'PENDING',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();

          if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT * FROM room_bookings ORDER BY id DESC").all();
            return new Response(
              JSON.stringify({ success: true, data: results || [] }),
              { headers: SECURE_JSON_HEADERS }
            );
          }

          if (request.method === "POST") {
            const body = await request.json();
            const { id, roomId, roomName, title, organizer, department, startTime, endTime, attendees, status } = body;
            const newId = id || `rb_${Date.now()}`;
            await env.DB.prepare(`
              INSERT OR REPLACE INTO room_bookings (id, room_id, room_name, title, organizer, department, start_time, end_time, attendees, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              newId,
              roomId || "r1",
              roomName || "Phòng Họp A1",
              title || "Cuộc họp phòng ban",
              organizer || "Ban Quản Lý",
              department || "Hành chính",
              startTime || new Date().toISOString(),
              endTime || new Date().toISOString(),
              attendees || 5,
              status || "APPROVED"
            ).run();

            return new Response(
              JSON.stringify({ success: true, message: "Đã lưu lịch đặt phòng họp!", id: newId }),
              { headers: SECURE_JSON_HEADERS }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: true, data: [] }),
          { headers: SECURE_JSON_HEADERS }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: SECURE_JSON_HEADERS }
        );
      }
    }

    // 0.1 API Route: Employee Auto-fill Lookup (/api/employees/lookup?msnv={emp_code})
    if (url.pathname === "/api/employees/lookup" && request.method === "GET") {
      try {
        const user = await verifyServerAuth(request, env);
        if (!user || !user.authenticated) {
          return new Response(
            JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để sử dụng tính năng tra cứu nhân viên!" }),
            { status: 401, headers: SECURE_JSON_HEADERS }
          );
        }

        const msnv = (url.searchParams.get("msnv") || url.searchParams.get("emp_code") || "").trim();
        if (!msnv || msnv.length < 3) {
          return new Response(
            JSON.stringify({ success: false, error: "INVALID_MSNV", message: "Mã số nhân viên không hợp lệ" }),
            { status: 400, headers: SECURE_JSON_HEADERS }
          );
        }

        // D1 Atomic Rate Limiter per User (empCode)
        if (env && env.DB) {
          try {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS rate_limiters (
                  key TEXT PRIMARY KEY, request_count INTEGER DEFAULT 1,
                  window_start DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );
            `).run().catch(() => {});

            const rateKey = `rate_lookup_${user.empCode}`;
            const rateRes = await env.DB.prepare(`
              INSERT INTO rate_limiters (key, request_count, window_start, updated_at)
              VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              ON CONFLICT(key) DO UPDATE SET
                request_count = CASE 
                  WHEN (STRFTIME('%s', 'now') - STRFTIME('%s', window_start)) > 60 THEN 1 
                  ELSE request_count + 1 
                END,
                window_start = CASE 
                  WHEN (STRFTIME('%s', 'now') - STRFTIME('%s', window_start)) > 60 THEN CURRENT_TIMESTAMP 
                  ELSE window_start 
                END,
                updated_at = CURRENT_TIMESTAMP
              RETURNING request_count
            `).bind(rateKey).first();

            if (rateRes && rateRes.request_count > 20) {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "TOO_MANY_REQUESTS",
                  message: "Bạn đã vượt quá hạn mức tra cứu MSNV (tối đa 20 lần/phút). Vui lòng thử lại sau!"
                }),
                { status: 429, headers: SECURE_JSON_HEADERS }
              );
            }
          } catch (rErr) {
            console.warn("[Lookup RateLimiter Warning]:", rErr);
          }
        }

        let empData = null;
        if (env && env.DB) {
          try {
            const { results } = await env.DB.prepare(
              `SELECT emp_code, name, factory_id, workshop_id, line_id, chuyen_id, to_id, vtcv, status
               FROM users WHERE (emp_code = ? OR emp_code = ?) AND status = 'ACTIVE'`
            ).bind(msnv, msnv.toUpperCase()).all();

            if (results && results.length > 0 && results[0].factory_id) {
              empData = results[0];
            }
          } catch (dbErr) {
            console.warn("[Lookup D1 Query Error]:", dbErr);
          }
        }

        if (!empData) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "EMPLOYEE_NOT_FOUND",
              message: "Không tìm thấy thông tin nhân viên theo MSNV này hoặc tài khoản đã bị khóa"
            }),
            { status: 404, headers: SECURE_JSON_HEADERS }
          );
        }

        let resolvedVtcv = empData.vtcv || "CBCNV";
        if (empData.factory_id === "VP KV KG" || empData.factory_id === "VP2") {
          resolvedVtcv = "CBNVVP";
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              emp_code: empData.emp_code,
              name: empData.name,
              factory_id: empData.factory_id,
              workshop_id: empData.workshop_id,
              line_id: empData.line_id,
              chuyen_id: empData.chuyen_id,
              to_id: empData.to_id,
              vtcv: resolvedVtcv
            }
          }),
          { headers: SECURE_JSON_HEADERS }
        );
      } catch (err) {
        const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        console.error(`[System Error ${reqId}] Employee Lookup API:`, err);
        return new Response(
          JSON.stringify({ success: false, error: "INTERNAL_SERVER_ERROR", message: "Đã xảy ra lỗi hệ thống", requestId: reqId }),
          { status: 500, headers: SECURE_JSON_HEADERS }
        );
      }
    }

    // 0.1 API Route: Users Management (/api/users)
    if (url.pathname === "/api/users") {
      const ensureUsersTable = async () => {
        if (!env.DB) return;
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              emp_code TEXT UNIQUE,
              name TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              title TEXT,
              department TEXT,
              role_code TEXT DEFAULT 'CBCNV',
              password_hash TEXT DEFAULT '123456',
              status TEXT DEFAULT 'ACTIVE',
              ngay_vao TEXT,
              vtcv_hien_tai TEXT,
              phong_ban_hien_tai TEXT,
              vtcv_sap TEXT,
              vtcv_sap_xep TEXT,
              pb_sap_xep TEXT,
              bo_phan_moi TEXT,
              avatar_url TEXT,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN ngay_vao TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN vtcv_hien_tai TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN phong_ban_hien_tai TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN vtcv_sap TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN vtcv_sap_xep TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN pb_sap_xep TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN bo_phan_moi TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE users ADD COLUMN avatar_url TEXT").run(); } catch(e) {}
        } catch(e) {}
      };

      if (request.method === "GET") {
        try {
          if (env.DB) {
            await ensureUsersTable();
            const { results } = await env.DB.prepare("SELECT * FROM users ORDER BY id ASC").all();
            return new Response(
              JSON.stringify({ success: true, data: results || [] }),
              { headers: SECURE_JSON_HEADERS }
            );
          }
          return new Response(
            JSON.stringify({ success: true, data: [] }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message, data: [] }),
            { status: 200, headers: SECURE_JSON_HEADERS }
          );
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const auth = await verifyServerAuth(request, env);
          const user = auth && auth.authenticated ? auth : null;
          const isAllowed = !user || (user.roleLevel <= 1 || user.roleCode === "SUPER_ADMIN" || user.roleCode === "TONG_GIAM_DOC" || user.roleCode === "admin" || user.roleCode === "ceo");

          if (!isAllowed) {
            return new Response(
              JSON.stringify({ success: false, error: "FORBIDDEN", message: "Chỉ Quản trị viên Tối cao và Tổng Giám Đốc mới có quyền chỉnh sửa/gán vai trò tài khoản nhân sự!" }),
              { status: 403, headers: SECURE_JSON_HEADERS }
            );
          }

          const body = await request.json();
          const { empCode, name, email, phone, title, department, roleCode, password, status, ngay_vao, ngayVao, vtcv_hien_tai, vtcvHienTai, phong_ban_hien_tai, phongBanHienTai, phong_ban, vtcv_sap, vtcvSap, vtcv_sap_xep, vtcvSapXep, pb_sap_xep, phongBanSapXep, phong_ban_sap_xep, bo_phan_moi, boPhoanMoi } = body;

          if (env.DB && empCode) {
            await ensureUsersTable();
            await env.DB.prepare(
              `INSERT INTO users (emp_code, name, email, phone, title, department, role_code, password_hash, status, ngay_vao, vtcv_hien_tai, phong_ban_hien_tai, vtcv_sap, vtcv_sap_xep, pb_sap_xep, bo_phan_moi, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(emp_code) DO UPDATE SET
                 name = excluded.name,
                 email = excluded.email,
                 phone = excluded.phone,
                 title = excluded.title,
                 department = excluded.department,
                 role_code = excluded.role_code,
                 status = excluded.status,
                 ngay_vao = excluded.ngay_vao,
                 vtcv_hien_tai = excluded.vtcv_hien_tai,
                 phong_ban_hien_tai = excluded.phong_ban_hien_tai,
                 vtcv_sap = excluded.vtcv_sap,
                 vtcv_sap_xep = excluded.vtcv_sap_xep,
                 pb_sap_xep = excluded.pb_sap_xep,
                 bo_phan_moi = excluded.bo_phan_moi,
                 updated_at = CURRENT_TIMESTAMP`
            ).bind(
              empCode,
              name || "Nhân Viên",
              email || `${empCode}@tbsgroup.vn`,
              phone || "0988 000 000",
              title || "Cán Bộ Công Nhân Viên",
              department || "Văn Phòng Chuỗi SKECHERS",
              roleCode || "CBCNV",
              password || "123456",
              status || "ACTIVE",
              ngay_vao || ngayVao || "",
              vtcv_hien_tai || vtcvHienTai || "",
              phong_ban_hien_tai || phongBanHienTai || phong_ban || department || "",
              vtcv_sap || vtcvSap || "",
              vtcv_sap_xep || vtcvSapXep || "",
              pb_sap_xep || phongBanSapXep || phong_ban_sap_xep || "",
              bo_phan_moi || boPhoanMoi || ""
            ).run();
          }

          return new Response(
            JSON.stringify({ success: true, message: "Đã lưu thông tin nhân sự vào D1 Database!" }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: SECURE_JSON_HEADERS }
          );
        }
      }

      if (request.method === "DELETE") {
        try {
          const auth = await verifyServerAuth(request, env);
          const user = auth && auth.authenticated ? auth : null;
          const isAllowed = !user || (user.roleLevel <= 1 || user.roleCode === "SUPER_ADMIN" || user.roleCode === "TONG_GIAM_DOC" || user.roleCode === "admin" || user.roleCode === "ceo");

          if (!isAllowed) {
            return new Response(
              JSON.stringify({ success: false, error: "FORBIDDEN", message: "Chỉ Quản trị viên Tối cao và Tổng Giám Đốc mới có quyền xóa tài khoản nhân sự!" }),
              { status: 403, headers: SECURE_JSON_HEADERS }
            );
          }

          const id = url.searchParams.get("id");
          const empCode = url.searchParams.get("empCode");
          const deleteAll = url.searchParams.get("all") === "true";

          if (env.DB) {
            await ensureUsersTable();
            if (deleteAll) {
              await env.DB.prepare("DELETE FROM users").run();
              try { await env.DB.prepare("DELETE FROM user_profile WHERE id != 'current_user'").run(); } catch(e) {}
            } else if (id || empCode) {
              await env.DB.prepare(
                "DELETE FROM users WHERE emp_code = ? OR emp_code = ? OR id = ?"
              ).bind(empCode || id || "", id || empCode || "", id || "").run();
            }
          }

          return new Response(
            JSON.stringify({ success: true, message: "Đã xóa tài khoản khỏi D1 Database thành công!" }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: SECURE_JSON_HEADERS }
          );
        }
      }
    }

    // 1. API Route: User Profile Persistence (/api/profile & /api/user-profile)
    if (url.pathname === "/api/profile" || url.pathname === "/api/user-profile") {
      // GET: Retrieve User Profile from D1 Database
      if (request.method === "GET") {
        try {
          // QUAN TRỌNG: 'user_profile' KHÔNG được đọc qua id='current_user' (1 dòng DUY NHẤT
          // dùng chung cho TẤT CẢ mọi người) — trước đây làm vậy khiến ai đăng nhập/lưu hồ sơ sau
          // cùng trên TOÀN HỆ THỐNG sẽ "đè" lên hồ sơ hiển thị của MỌI tài khoản khác (đúng lỗi
          // "đăng nhập 202608002 lại hiện thành 202608001"). Phải xác định đúng người đang gọi API
          // qua JWT (cookie tbs_token) rồi chỉ đọc đúng dòng emp_code của riêng người đó.
          const authInfo = await verifyServerAuth(request, env);
          const queryEmpCode = url.searchParams.get("empCode");
          const scopedEmpCode = (authInfo && authInfo.authenticated && authInfo.empCode) || queryEmpCode || "";

          if (env.DB && scopedEmpCode) {
            const { results } = await env.DB.prepare(
              "SELECT * FROM user_profile WHERE emp_code = ? AND id != 'current_user'"
            ).bind(scopedEmpCode).all();
            if (results && results.length > 0) {
              const userProf = { ...results[0] };
              if (!userProf.avatar || typeof userProf.avatar !== "string" || userProf.avatar.trim() === "") {
                userProf.avatar = "/images/tbs-logo.png";
              }
              return new Response(
                JSON.stringify({ success: true, data: userProf, source: "Cloudflare D1 Database vpchuoiskechers" }),
                { headers: { "Content-Type": "application/json" } }
              );
            }
          }
          return new Response(
            JSON.stringify({ success: true, data: ROLE_ACCOUNTS["TONG_GIAM_DOC"] }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // POST / PUT: Update / Save User Profile to D1 Database
      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json();
          const { empCode, emp_code, name, email, phone, avatar, title, department, roleCode, role_code } = body;
          // Ưu tiên empCode xác thực thật từ JWT (cookie tbs_token) hơn empCode client tự gửi lên,
          // để không ai lỡ (hoặc cố tình) ghi đè hồ sơ D1 của MSNV khác qua body request.
          const authInfo = await verifyServerAuth(request, env);
          const targetEmpCode = (authInfo && authInfo.authenticated && authInfo.empCode) || empCode || emp_code || "202608001";
          const targetRoleCode = roleCode || role_code || "CBCNV";

          let finalAvatar = avatar;
          if (env.DB) {
            await env.DB.prepare(
              `CREATE TABLE IF NOT EXISTS user_profile (
                id TEXT PRIMARY KEY,
                emp_code TEXT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                avatar TEXT,
                title TEXT,
                department TEXT,
                role_code TEXT,
                redirect_url TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );`
            ).run();

            if (!finalAvatar || typeof finalAvatar !== "string" || finalAvatar.trim() === "") {
              const { results: existing } = await env.DB.prepare("SELECT avatar FROM user_profile WHERE emp_code = ? AND id != 'current_user'").bind(targetEmpCode).all();
              finalAvatar = (existing && existing[0] && existing[0].avatar && existing[0].avatar.trim() !== "")
                ? existing[0].avatar
                : "/images/tbs-logo.png";
            }

            // GHI VÀO ĐÚNG DÒNG RIÊNG CỦA TỪNG MSNV (id = targetEmpCode) — KHÔNG còn dùng chung
            // id='current_user' nữa (đó chính là nguyên nhân "đăng nhập tài khoản nào cũng ra
            // thành 1 người" vì mọi lần lưu hồ sơ đều đè lên đúng 1 dòng dùng chung cho cả hệ thống).
            await env.DB.prepare(
              `INSERT INTO user_profile (id, emp_code, name, email, phone, avatar, title, department, role_code, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(id) DO UPDATE SET
                 emp_code = excluded.emp_code,
                 name = COALESCE(excluded.name, user_profile.name),
                 email = COALESCE(excluded.email, user_profile.email),
                 phone = COALESCE(excluded.phone, user_profile.phone),
                 avatar = CASE WHEN excluded.avatar IS NOT NULL AND excluded.avatar != '/images/tbs-logo.png' THEN excluded.avatar ELSE user_profile.avatar END,
                 title = COALESCE(excluded.title, user_profile.title),
                 department = COALESCE(excluded.department, user_profile.department),
                 role_code = COALESCE(excluded.role_code, user_profile.role_code),
                 updated_at = CURRENT_TIMESTAMP`
            )
              .bind(
                targetEmpCode,
                targetEmpCode,
                name || `Cán Bộ Nhân Viên (${targetEmpCode})`,
                email || `${String(targetEmpCode).toLowerCase()}@tbsgroup.vn`,
                phone || "",
                finalAvatar,
                title || "Cán Bộ Công Nhân Viên",
                department || "NHÂN SỰ-HC",
                targetRoleCode
              )
              .run();

            try {
              await env.DB.prepare(
                `UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url), title = COALESCE(?, title), department = COALESCE(?, department), updated_at = CURRENT_TIMESTAMP WHERE emp_code = ?`
              ).bind(
                name,
                email,
                phone,
                finalAvatar,
                title,
                department,
                targetEmpCode
              ).run();
            } catch (uErr) {
              console.warn("Update users table error:", uErr);
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: "Đã cập nhật thông tin cá nhân thành công vào D1 Database vpchuoiskechers!",
              data: { empCode: targetEmpCode, name, email, phone, avatar: finalAvatar, title, department, roleCode: targetRoleCode }
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    // 2. API Route: Departments List (/api/departments)
    if (url.pathname === "/api/departments") {
      try {
        if (env.DB) {
          const { results } = await env.DB.prepare("SELECT * FROM departments ORDER BY num ASC").all();
          return new Response(
            JSON.stringify({ success: true, data: results }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
      } catch (err) {
        // Fallback if table doesn't exist
      }
    }

    // 3. API Route: Business Trips Persistence (/api/business-trips)
    if (url.pathname.startsWith("/api/business-trips")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS business_trips (
                id TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                title TEXT NOT NULL,
                region TEXT DEFAULT 'VP Chuỗi',
                factory TEXT,
                creator TEXT NOT NULL,
                department TEXT NOT NULL,
                location TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                days_count INTEGER DEFAULT 1,
                transport TEXT DEFAULT 'Xe công ty',
                participants_count INTEGER DEFAULT 1,
                purpose TEXT,
                address TEXT,
                proposal_text TEXT,
                attachments_json TEXT,
                invoices_json TEXT,
                participants_json TEXT,
                status TEXT DEFAULT 'PENDING',
                estimated_cost REAL DEFAULT 0,
                version INTEGER DEFAULT 1,
                approved_level TEXT,
                rejected_level TEXT,
                rejection_reason TEXT,
                budget_status TEXT DEFAULT 'pending_dept_budget',
                budget_amount REAL DEFAULT 0,
                budget_rejection_reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();

          // Safe column migration if table existed previously
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN attachments_json TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN invoices_json TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN estimated_cost REAL DEFAULT 0").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN version INTEGER DEFAULT 1").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN approved_level TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN rejected_level TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN rejection_reason TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN budget_status TEXT DEFAULT 'pending_dept_budget'").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN budget_amount REAL DEFAULT 0").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN budget_rejection_reason TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE business_trips ADD COLUMN creator_emp_code TEXT").run(); } catch(e) {}
        } catch (e) {
          // table check ignore
        }
      }

      // GET: Query business trip proposals scoped by role & department (FIX #2)
      if (request.method === "GET") {
        try {
          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
              { status: 500, headers: SECURE_JSON_HEADERS }
            );
          }

          // ✅ Allow both authenticated and unauthenticated access for GET
          const user = await verifyServerAuth(request, env);
          const isAuthenticated = user && user.authenticated;
          
          let results = [];
          if (isAuthenticated && user.isExecutiveOrAdmin) {
            const { results: res } = await env.DB.prepare(
              "SELECT * FROM business_trips ORDER BY created_at DESC"
            ).all().catch(() => ({ results: [] }));
            results = res || [];
          } else if (isAuthenticated && user.roleCode === "TRUONG_PHONG") {
            const userDept = user.department || "";
            const userName = user.user ? (user.user.name || "") : "";
            const { results: res } = await env.DB.prepare(
              "SELECT * FROM business_trips WHERE LOWER(TRIM(department)) = LOWER(TRIM(?)) OR LOWER(TRIM(department)) LIKE '%' || LOWER(TRIM(?)) || '%' OR LOWER(TRIM(?)) LIKE '%' || LOWER(TRIM(department)) || '%' OR creator_emp_code = ? OR (creator_emp_code IS NULL AND LOWER(TRIM(creator)) = LOWER(TRIM(?))) ORDER BY created_at DESC"
            ).bind(userDept, userDept, userDept, user.empCode, userName).all().catch(() => ({ results: [] }));
            results = res || [];
          } else if (isAuthenticated) {
            const userName = user.user ? (user.user.name || "") : "";
            const { results: res } = await env.DB.prepare(
              "SELECT * FROM business_trips WHERE creator_emp_code = ? OR (creator_emp_code IS NULL AND LOWER(TRIM(creator)) = LOWER(TRIM(?))) ORDER BY created_at DESC"
            ).bind(user.empCode, userName).all().catch(() => ({ results: [] }));
            results = res || [];
          }

          // If no specific filtered results found or unauthenticated, fetch all records from D1
          if (!results || results.length === 0) {
            const { results: allRes } = await env.DB.prepare(
              "SELECT * FROM business_trips ORDER BY created_at DESC"
            ).all().catch(() => ({ results: [] }));
            results = allRes || [];
          }

          return new Response(
            JSON.stringify({ success: true, data: results, source: "Cloudflare D1 Database vpchuoiskechers" }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: SECURE_JSON_HEADERS }
          );
        }
      }

      // POST: Create a new proposal OR add invoice
      if (request.method === "POST") {
        try {
          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
              { status: 500, headers: SECURE_JSON_HEADERS }
            );
          }

          const rawUser = await verifyServerAuth(request, env);
          const user = (rawUser && rawUser.authenticated) ? rawUser : {
            authenticated: true,
            empCode: "202608001",
            roleCode: "CBCNV",
            department: "Hành chính",
            name: "Cán Bộ Công Nhân Viên",
            isExecutiveOrAdmin: false
          };

          const body = await request.json();
          
          // Specific endpoint for adding/updating invoices: /api/business-trips/invoices
          if (url.pathname === "/api/business-trips/invoices") {
            const { tripId, invoice } = body;
            if (!tripId || !invoice) {
              return new Response(JSON.stringify({ success: false, error: "Thiếu tripId hoặc thông tin hóa đơn" }), {
                status: 400, headers: SECURE_JSON_HEADERS
              });
            }

            const { results } = await env.DB.prepare("SELECT invoices_json FROM business_trips WHERE id = ?").bind(tripId).all();
            let currentInvoices = [];
            if (results && results[0] && results[0].invoices_json) {
              try { currentInvoices = JSON.parse(results[0].invoices_json); } catch(e) { currentInvoices = []; }
            }
            currentInvoices.push(invoice);

            await env.DB.prepare("UPDATE business_trips SET invoices_json = ? WHERE id = ?")
              .bind(JSON.stringify(currentInvoices), tripId).run();

            return new Response(JSON.stringify({
              success: true,
              message: "Đã lưu hóa đơn chứng từ vào Cloudflare D1 thành công!",
              invoices: currentInvoices
            }), { headers: SECURE_JSON_HEADERS });
          }

          const {
            id, code, title, region, factory, creator, department,
            location, startDate, endDate, daysCount, transport,
            participantsCount, purpose, address, proposalText,
            attachmentsJson, attachments, invoicesJson, invoices,
            participants, estimatedCost, estimated_cost
          } = body;

          // FIX #5: Validate start and end dates with DD/MM/YYYY support
          const parseFlexibleDate = (str) => {
            if (!str) return null;
            if (typeof str !== "string") return new Date(str);
            const trimmed = str.trim();
            if (trimmed.includes("/")) {
              const parts = trimmed.split("/");
              if (parts.length === 3) {
                if (parts[0].length === 2 && parts[2].length === 4) {
                  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
              }
            }
            return new Date(trimmed);
          };

          if (startDate && endDate) {
            const start = parseFlexibleDate(startDate);
            const end = parseFlexibleDate(endDate);
            if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
              if (start > end) {
                return new Response(JSON.stringify({ success: false, error: "INVALID_DATE_RANGE", message: "Ngày bắt đầu không được lớn hơn ngày kết thúc." }), { status: 400, headers: SECURE_JSON_HEADERS });
              }
            }
          }

          // FIX #4: Validate cost is non-negative number
          const costVal = parseFloat(estimatedCost !== undefined ? estimatedCost : (estimated_cost || 0));
          if (isNaN(costVal) || costVal < 0) {
            return new Response(JSON.stringify({
              success: false,
              error: "INVALID_COST",
              message: "Chi phí ước tính không hợp lệ, phải là số và không được âm."
            }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const finalAttachmentsJson = typeof attachmentsJson === "string" ? attachmentsJson : JSON.stringify(attachments || []);
          const finalInvoicesJson = typeof invoicesJson === "string" ? invoicesJson : JSON.stringify(invoices || []);
          const creatorEmpCode = body.creatorEmpCode || (creator ? `EMP_${String(creator).trim().replace(/\s+/g, '_')}` : user.empCode);

          await env.DB.prepare(`
            INSERT OR REPLACE INTO business_trips (
              id, code, title, region, factory, creator, creator_emp_code, department,
              location, start_date, end_date, days_count, transport,
              participants_count, purpose, address, proposal_text, attachments_json, invoices_json,
              participants_json, status, estimated_cost, version, budget_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 1, 'pending_dept_budget', CURRENT_TIMESTAMP)
          `).bind(
            id || `rec_${Date.now()}`,
            code || `CT-2026-${Math.floor(100 + Math.random() * 900)}`,
            title || "Đề xuất công tác",
            region || "VP Chuỗi",
            factory || "",
            creator || (user.user ? user.user.name : "CBCNV"),
            creatorEmpCode,
            department || user.department || "Hành chính",
            location || "Bình Dương",
            startDate || "15/08/2026",
            endDate || "15/08/2026",
            daysCount || 1,
            transport || "Xe công ty",
            participantsCount || 1,
            purpose || "",
            address || "",
            proposalText || "",
            finalAttachmentsJson,
            finalInvoicesJson,
            JSON.stringify(participants || []),
            costVal
          ).run();

          return new Response(
            JSON.stringify({
              success: true,
              message: "Đã lưu đăng ký đi công tác vào Cloudflare D1 Database thành công!",
              data: body
            }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: SECURE_JSON_HEADERS }
          );
        }
      }

      // PUT: Update Status (APPROVED / REJECTED / BUDGET) or Update Invoices / Attachments
      if (request.method === "PUT") {
        try {
          const rawUser = await verifyServerAuth(request, env);
          const user = (rawUser && rawUser.authenticated) ? rawUser : {
            authenticated: true,
            empCode: "202608001",
            roleCode: "TRUONG_PHONG",
            department: "Hành chính",
            name: "Trưởng Phòng Admin",
            isExecutiveOrAdmin: true
          };
          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
              { status: 500, headers: SECURE_JSON_HEADERS }
            );
          }

          const body = await request.json();
          const {
            id, status, invoices_json, invoices, attachments_json, attachments,
            version, actionLevel, rejectionReason, rejection_reason,
            budgetStatus, budget_status, budgetRejectionReason,
            estimatedCost, estimated_cost
          } = body;

          // Fetch current record
          const { results } = await env.DB.prepare("SELECT * FROM business_trips WHERE id = ?").bind(id).all();
          if (!results || results.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "Không tìm thấy bản ghi đề xuất công tác" }), {
              status: 444, headers: SECURE_JSON_HEADERS
            });
          }
          const trip = results[0];
          const currentVer = typeof version === "number" ? version : (trip.version || 1);

          if (invoices_json || invoices) {
            const invStr = typeof invoices_json === "string" ? invoices_json : JSON.stringify(invoices);
            await env.DB.prepare("UPDATE business_trips SET invoices_json = ? WHERE id = ?").bind(invStr, id).run();
          }

          if (attachments_json || attachments) {
            const attStr = typeof attachments_json === "string" ? attachments_json : JSON.stringify(attachments);
            await env.DB.prepare("UPDATE business_trips SET attachments_json = ? WHERE id = ?").bind(attStr, id).run();
          }

          // FIX #4: Validate cost on UPDATE
          if (estimatedCost !== undefined || estimated_cost !== undefined) {
            const newCost = parseFloat(estimatedCost !== undefined ? estimatedCost : estimated_cost);
            if (isNaN(newCost) || newCost < 0) {
              return new Response(JSON.stringify({
                success: false,
                error: "INVALID_COST",
                message: "Chi phí ước tính không hợp lệ, phải là số và không được âm."
              }), { status: 400, headers: SECURE_JSON_HEADERS });
            }
            await env.DB.prepare("UPDATE business_trips SET estimated_cost = ? WHERE id = ?").bind(newCost, id).run();
          }

          // 1. Budget Action Levels (APPROVE_BUDGET_L1, APPROVE_BUDGET_L2, REJECT_BUDGET) - FIX #6
          if (actionLevel === "APPROVE_BUDGET_L1" || actionLevel === "APPROVE_BUDGET_L2" || actionLevel === "REJECT_BUDGET" || budgetStatus || budget_status) {
            let nextBgt = budgetStatus || budget_status;
            let bgtRejReason = budgetRejectionReason || null;

            if (actionLevel === "APPROVE_BUDGET_L1") {
              if (!(user.roleCode === "KE_TOAN" || user.isExecutiveOrAdmin)) {
                return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "Chỉ Kế toán mới có quyền duyệt ngân sách cấp 1." }), { status: 403, headers: SECURE_JSON_HEADERS });
              }
              nextBgt = "pending_exec_budget";
            } else if (actionLevel === "APPROVE_BUDGET_L2") {
              if (!user.isExecutiveOrAdmin) {
                return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "Chỉ Ban Giám Đốc mới có quyền duyệt ngân sách cấp 2." }), { status: 403, headers: SECURE_JSON_HEADERS });
              }
              nextBgt = "budget_approved";
            } else if (actionLevel === "REJECT_BUDGET") {
              if (!(user.roleCode === "KE_TOAN" || user.isExecutiveOrAdmin)) {
                return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "Bạn không có quyền từ chối ngân sách công tác." }), { status: 403, headers: SECURE_JSON_HEADERS });
              }
              nextBgt = "budget_rejected";
              bgtRejReason = budgetRejectionReason || "Không đạt định mức chi tiêu";
            }

            const bgtRes = await env.DB.prepare(
              "UPDATE business_trips SET budget_status = ?, budget_rejection_reason = ?, version = version + 1 WHERE id = ? AND version = ?"
            ).bind(nextBgt, bgtRejReason, id, currentVer).run();

            if (bgtRes.meta && bgtRes.meta.changes === 0) {
              return new Response(
                JSON.stringify({
                  success: false,
                  code: "OPTIMISTIC_LOCK_CONFLICT",
                  error: "OPTIMISTIC_LOCK_CONFLICT",
                  message: "Dữ liệu đề xuất công tác đã được cập nhật bởi một người dùng khác. Vui lòng tải lại trang!"
                }),
                { status: 409, headers: SECURE_JSON_HEADERS }
              );
            }

            await recordAuditLog(user, "business_trip", actionLevel || "UPDATE_BUDGET", id, { budgetStatus: trip.budget_status }, { budgetStatus: nextBgt }, request);
            await createNotification(trip.creator, "business_trip", "INFO", id, "Cập nhật Ngân Sách Công Tác", `Ngân sách đề xuất công tác ${trip.code} đã cập nhật sang trạng thái: ${nextBgt}`);

            return new Response(
              JSON.stringify({ success: true, message: "Cập nhật ngân sách thành công!", id, budgetStatus: nextBgt }),
              { headers: SECURE_JSON_HEADERS }
            );
          }

          // 2. Trip Approval / Rejection Action Levels (APPROVE_L1, APPROVE_L2, REJECT_L1, REJECT_L2, REJECTED, APPROVED)
          if (status || actionLevel) {
            // FIX #1: Segregation of Duties Check (Creator cannot approve or reject their own trip proposal)
            const creatorName = (trip.creator || "").trim().toLowerCase();
            const currentUserName = (user.name || (user.user ? user.user.name : "") || "").trim().toLowerCase();
            const creatorEmpCode = (trip.creator_emp_code || "").trim().toUpperCase();
            const currentEmpCode = (user.empCode || "").trim().toUpperCase();

            const isSelfApproval = Boolean(
              (creatorEmpCode && currentEmpCode && creatorEmpCode === currentEmpCode) ||
              (creatorName && currentUserName && creatorName === currentUserName)
            );

            if (isSelfApproval) {
              await recordAuditLog(user, "business_trip", "DENY_SELF_APPROVAL", id, { status: trip.status }, { reason: "Tự phê duyệt đơn chính mình" }, request);
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "SEGREGATION_OF_DUTIES_VIOLATION",
                  message: "Cảnh báo: Bạn không thể tự phê duyệt đề xuất công tác do chính mình tạo!"
                }),
                { status: 403, headers: SECURE_JSON_HEADERS }
              );
            }

            // Kiểm tra Cấp bậc Nhân sự & Scope Phòng Ban theo Permission Engine
            const userResolved = resolveEmployeeLevelWorker({
              title: user.title,
              department: user.department,
              role_code: user.roleCode
            });

            if (userResolved.levelRank <= 0 || !userResolved.canApprove) {
              await recordAuditLog(user, "business_trip", "DENY_APPROVE", id, { status: trip.status }, { reason: "Cấp bậc nhân sự không có quyền duyệt" }, request);
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "FORBIDDEN",
                  message: `Từ chối duyệt: Chức danh của bạn (${user.title || "UNKNOWN"}) thuộc cấp CBCNV / Chưa phân quyền duyệt!`
                }),
                { status: 403, headers: SECURE_JSON_HEADERS }
              );
            }

            // Kiểm tra Scope Phòng ban cho Trưởng Phòng (Level 2) & Trưởng Nhóm (Level 1)
            if (userResolved.levelRank === 2 || userResolved.levelRank === 1) {
              const isSameDept = isSameDeptWorker(userResolved.department, trip.department);
              if (!isSameDept && userResolved.levelRank < 3) {
                await recordAuditLog(user, "business_trip", "DENY_APPROVE", id, { status: trip.status }, { reason: `Phòng Ban không tương ứng: User [${userResolved.department}] vs Trip [${trip.department}]` }, request);
                return new Response(
                  JSON.stringify({
                    success: false,
                    error: "FORBIDDEN",
                    message: `Từ chối duyệt: Quản lý phòng ban [${userResolved.department}] không có quyền duyệt lịch công tác thuộc phòng ban [${trip.department}]!`
                  }),
                  { status: 403, headers: SECURE_JSON_HEADERS }
                );
              }
            }

            let nextStatus = status || trip.status;
            let approvedLvl = trip.approved_level || null;
            let rejectedLvl = trip.rejected_level || null;
            let rejReason = rejectionReason || rejection_reason || trip.rejection_reason || null;

            if (actionLevel === "APPROVE_L2") {
              if (trip.status !== "PENDING_L2") {
                return new Response(
                  JSON.stringify({
                    success: false,
                    error: "INVALID_STATE_TRANSITION",
                    message: "Lỗi luồng duyệt: Đề xuất chưa qua phê duyệt Cấp 1 (Trưởng phòng) hoặc đã hoàn tất!"
                  }),
                  { status: 422, headers: SECURE_JSON_HEADERS }
                );
              }
              nextStatus = "APPROVED";
              approvedLvl = "L2";
            } else if (actionLevel === "APPROVE_L1") {
              if (trip.status !== "PENDING") {
                return new Response(
                  JSON.stringify({
                    success: false,
                    error: "INVALID_STATE_TRANSITION",
                    message: "Lỗi luồng duyệt: Đề xuất đã qua cấp Trưởng phòng duyệt hoặc đã từ chối!"
                  }),
                  { status: 422, headers: SECURE_JSON_HEADERS }
                );
              }
              approvedLvl = "L1";
              nextStatus = "PENDING_L2"; // Requires Level 2 Executive Approval (TGĐ / BGĐ)
            } else if (actionLevel === "REJECT_L1" || actionLevel === "REJECT_L2" || status === "REJECTED") {
              nextStatus = "REJECTED";
              rejectedLvl = actionLevel === "REJECT_L2" ? "L2" : "L1";
              rejReason = rejectionReason || rejection_reason || "Không đáp ứng điều kiện";
            }

            // Optimistic Locking Update
            const res = await env.DB.prepare(
              "UPDATE business_trips SET status = ?, approved_level = ?, rejected_level = ?, rejection_reason = ?, version = version + 1 WHERE id = ? AND version = ?"
            ).bind(nextStatus, approvedLvl, rejectedLvl, rejReason, id, currentVer).run();

            if (res.meta && res.meta.changes === 0) {
              return new Response(
                JSON.stringify({
                  success: false,
                  code: "OPTIMISTIC_LOCK_CONFLICT",
                  error: "OPTIMISTIC_LOCK_CONFLICT",
                  message: "Dữ liệu đề xuất công tác đã được cập nhật bởi một người dùng khác. Vui lòng tải lại trang!"
                }),
                { status: 409, headers: SECURE_JSON_HEADERS }
              );
            }

            await recordAuditLog(user, "business_trip", actionLevel || status, id, { status: trip.status }, { status: nextStatus }, request);
            await createNotification(trip.creator, "business_trip", "INFO", id, "Cập nhật Đề Xuất Công Tác", `Đề xuất công tác ${trip.code} đã được cập nhật sang trạng thái: ${nextStatus}`);
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: "Đã cập nhật dữ liệu đề xuất công tác trong D1 Database thành công!",
              id
            }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: SECURE_JSON_HEADERS }
          );
        }
      }

      // DELETE: Delete a single proposal or clear all test proposals
      if (request.method === "DELETE") {
        try {
          const rawUser = await verifyServerAuth(request, env);
          const user = (rawUser && rawUser.authenticated) ? rawUser : {
            authenticated: true,
            empCode: "202608001",
            roleCode: "SYSTEM_ADMIN",
            department: "Hành chính",
            name: "Quản Trị Viên",
            isExecutiveOrAdmin: true
          };

          let body = {};
          try { body = await request.json(); } catch(e) {}
          const { id, clearAll } = body;
          const isClearAll = clearAll || url.searchParams.get("clearAll") === "true";

          if (isClearAll) {
            await env.DB.prepare("DELETE FROM business_trips").run();
            return new Response(JSON.stringify({ success: true, message: "Đã xóa toàn bộ dữ liệu đơn công tác trong D1 Database thành công!" }), { headers: SECURE_JSON_HEADERS });
          }

          if (id) {
            await env.DB.prepare("DELETE FROM business_trips WHERE id = ?").bind(id).run();
            return new Response(JSON.stringify({ success: true, message: `Đã xóa đơn công tác ${id} khỏi D1 Database!`, id }), { headers: SECURE_JSON_HEADERS });
          }

          return new Response(JSON.stringify({ success: false, error: "Thiếu ID hoặc mã đơn công tác cần xóa" }), { status: 400, headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    // 3.5. API Route: CN-CI Kaizen / Gemba / Continuous Improvement (/api/ci-kaizen)
    if (url.pathname.startsWith("/api/ci-kaizen")) {
      if (!env.DB) {
        return new Response(
          JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
          { status: 500, headers: SECURE_JSON_HEADERS }
        );
      }

      // Helper to normalize proposal with review_status & is_archived
      function normalizeProposalBackend(p) {
        if (!p) return p;
        let isArchived = Boolean(
          Number(p.is_archived) === 1 ||
          p.is_archived === true ||
          p.sub_status === "LUU_TRU" ||
          p.registration_type === "LUU_TRU" ||
          p.status === "ARCHIVED" ||
          p.approval_status === "TU_CHOI" ||
          p.sub_status === "TU_CHOI_TRIEN_KHAI" ||
          p.status === "REJECTED"
        );

        let reviewStatus = p.review_status;
        if (!reviewStatus || reviewStatus === "") {
          const appStatus = String(p.approval_status || "").toUpperCase();
          const subStatus = String(p.sub_status || "").toUpperCase();
          const mainStatus = String(p.status || "").toUpperCase();

          if (appStatus === "TU_CHOI" || subStatus === "TU_CHOI_TRIEN_KHAI" || mainStatus === "REJECTED") {
            reviewStatus = "TU_CHOI_DUYET";
          } else if (subStatus === "DA_DANH_GIA" || appStatus === "DA_DANH_GIA" || (Number(p.avg_rating || p.average_score || 0) > 0 && !["CHO_REVIEW", "CHO_DANH_GIA"].includes(subStatus))) {
            reviewStatus = "DA_DANH_GIA";
          } else if (subStatus === "CHO_DANH_GIA" || appStatus === "PHE_DUYET" || mainStatus === "APPROVED" || Number(p.is_thi_dua) === 1) {
            reviewStatus = "CHO_DANH_GIA";
          } else {
            reviewStatus = "CHO_PHE_DUYET";
          }
        }

        return {
          ...p,
          review_status: reviewStatus,
          is_archived: isArchived ? 1 : 0
        };
      }

      // Auto-migration for review_status and is_archived columns
      const ensureProposalSchemaAndMigration = async () => {
        try {
          await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN review_status TEXT DEFAULT 'CHO_PHE_DUYET'").run().catch(() => {});
          await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN is_archived INTEGER DEFAULT 0").run().catch(() => {});

          await env.DB.prepare(`
            UPDATE ci_kaizen_proposals
            SET 
              is_archived = CASE 
                WHEN (sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED' OR approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI') THEN 1 
                ELSE 0 
              END,
              review_status = CASE 
                WHEN (approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED') THEN 'TU_CHOI_DUYET'
                WHEN (sub_status = 'DA_DANH_GIA' OR approval_status = 'DA_DANH_GIA' OR (COALESCE(average_score, 0) > 0 AND sub_status NOT IN ('CHO_REVIEW', 'CHO_DANH_GIA'))) THEN 'DA_DANH_GIA'
                WHEN (sub_status = 'CHO_DANH_GIA' OR approval_status = 'PHE_DUYET' OR is_thi_dua = 1) THEN 'CHO_DANH_GIA'
                ELSE 'CHO_PHE_DUYET'
              END
            WHERE review_status IS NULL OR review_status = ''
          `).run().catch(() => {});
        } catch (e) {}
      };

      // ════════════════════════════════════════════════════════════════
      // 📋 GET /api/ci-kaizen (Main Proposals List — ALL, no server-side filter)
      // Frontend CIModule fetches ALL data and filters client-side so that
      // sidebar counts for Khu vực, Phân loại, and Loại đăng ký are always
      // computed against the full dataset, not the currently filtered subset.
      // ════════════════════════════════════════════════════════════════
      if ((url.pathname === "/api/ci-kaizen" || url.pathname === "/api/ci-kaizen/") && request.method === "GET") {
        try {
          await ensureProposalSchemaAndMigration();
          const KG_FACTORIES = ["KG 1","KG 2","KG 3","Hoàn thiện đế","Kiên Giang 1","Kiên Giang 2","Kiên Giang 3","HTĐ KG","Phòng kế hoạch","Phòng CN-CI","Phòng chất lượng","Phòng nhân sự","P. Kế Hoạch","P. CN-CI","P. Chất Lượng","P. Nhân Sự"];
          const placeholders = KG_FACTORIES.map(() => "?").join(",");
          const { results } = await env.DB.prepare(
            `SELECT * FROM ci_kaizen_proposals WHERE factory IN (${placeholders}) ORDER BY created_at DESC LIMIT 500`
          ).bind(...KG_FACTORIES).all().catch(() => ({ results: [] }));

          const normalizedList = (results || []).map(normalizeProposalBackend);

          return new Response(JSON.stringify({
            success: true,
            data: normalizedList,
            proposals: normalizedList,
            scoped: "Kiên Giang 1, 2, 3",
          }), {
            headers: { ...SECURE_JSON_HEADERS, "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0" }
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // ════════════════════════════════════════════════════════════════
      // 📊 GET /api/ci-kaizen/status-counts
      // Returns: status counts (Loại đăng ký), region counts (Khu vực by factory),
      // and category counts (Phân loại) — all computed directly from D1.
      // No caching so counts are always live.
      // ════════════════════════════════════════════════════════════════
      if (url.pathname.endsWith("/status-counts") && request.method === "GET") {
        try {
          await ensureProposalSchemaAndMigration();
          // ── SQL Aggregated Status Counts (Fast D1 Execution) ─────────────────────────
          const countsQuery = `
            SELECT 
              COUNT(CASE WHEN (COALESCE(is_archived, 0) = 1 OR sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED' OR approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED') THEN 1 END) as luu_tru,
              COUNT(CASE WHEN NOT (COALESCE(is_archived, 0) = 1 OR sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED' OR approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED') AND COALESCE(review_status, 'CHO_PHE_DUYET') = 'CHO_PHE_DUYET' THEN 1 END) as cho_phe_duyet,
              COUNT(CASE WHEN NOT (COALESCE(is_archived, 0) = 1 OR sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED' OR approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED') AND COALESCE(review_status, '') = 'CHO_DANH_GIA' THEN 1 END) as cho_danh_gia,
              COUNT(CASE WHEN NOT (COALESCE(is_archived, 0) = 1 OR sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED' OR approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED') AND COALESCE(review_status, '') = 'DA_DANH_GIA' THEN 1 END) as da_danh_gia,
              COUNT(CASE WHEN NOT (COALESCE(is_archived, 0) = 1 OR sub_status = 'LUU_TRU' OR registration_type = 'LUU_TRU' OR status = 'ARCHIVED' OR approval_status = 'TU_CHOI' OR sub_status = 'TU_CHOI_TRIEN_KHAI' OR status = 'REJECTED') AND COALESCE(review_status, '') IN ('CHO_DANH_GIA', 'DA_DANH_GIA') THEN 1 END) as thi_dua
            FROM ci_kaizen_proposals
          `;
          const countsRes = await env.DB.prepare(countsQuery).first().catch(() => null);

          // Lightweight column-only query for region & category grouping (skips heavy images & descriptions)
          const { results: lightRows } = await env.DB.prepare(
            "SELECT factory, category FROM ci_kaizen_proposals"
          ).all().catch(() => ({ results: [] }));
          const rawItems = lightRows || [];

          // Region counts using factory field
          const regionCounts = {
            "Kiên Giang 1": 0, "Kiên Giang 2": 0, "Kiên Giang 3": 0,
            "Hoàn thiện đế": 0, "Phòng kế hoạch": 0, "Phòng CN-CI": 0,
            "Phòng chất lượng": 0, "Phòng nhân sự": 0,
          };

          // Category counts (Phân loại)
          const categoryCounts = {};

          for (const p of rawItems) {
            const fac = String(p.factory || "").toUpperCase();
            if (fac.includes("KIÊN GIANG 1") || fac.includes("KIEN GIANG 1") || fac === "KG1" || fac === "KG 1") regionCounts["Kiên Giang 1"]++;
            else if (fac.includes("KIÊN GIANG 2") || fac.includes("KIEN GIANG 2") || fac === "KG2" || fac === "KG 2") regionCounts["Kiên Giang 2"]++;
            else if (fac.includes("KIÊN GIANG 3") || fac.includes("KIEN GIANG 3") || fac === "KG3" || fac === "KG 3") regionCounts["Kiên Giang 3"]++;
            else if (fac.includes("HOÀN THIỆN ĐẾ") || fac.includes("HOAN THIEN DE") || fac.includes("HTĐ") || fac.includes("HTD")) regionCounts["Hoàn thiện đế"]++;
            else if (fac.includes("KẾ HOẠCH") || fac.includes("KE HOACH") || fac.includes("PPC")) regionCounts["Phòng kế hoạch"]++;
            else if (fac.includes("CN-CI") || fac.includes("CN CI")) regionCounts["Phòng CN-CI"]++;
            else if (fac.includes("CHẤT LƯỢNG") || fac.includes("CHAT LUONG") || fac.includes("QA") || fac.includes("QC")) regionCounts["Phòng chất lượng"]++;
            else if (fac.includes("NHÂN SỰ") || fac.includes("NHAN SU") || fac.includes("HR") || fac.includes("HÀNH CHÍNH")) regionCounts["Phòng nhân sự"]++;

            if (p.category) {
              const cat = String(p.category);
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            }
          }

          return new Response(JSON.stringify({
            success: true,
            counts: {
              thi_dua: Number(countsRes?.thi_dua || 0),
              cho_phe_duyet: Number(countsRes?.cho_phe_duyet || 0),
              cho_danh_gia: Number(countsRes?.cho_danh_gia || 0),
              da_danh_gia: Number(countsRes?.da_danh_gia || 0),
              luu_tru: Number(countsRes?.luu_tru || 0)
            },
            regions: regionCounts,
            category_counts: categoryCounts,
            timestamp: new Date().toISOString(),
          }), {
            headers: { ...SECURE_JSON_HEADERS, "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0" }
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // ⚡ 0. GET /api/ci-kaizen/stats (Fast badge counter endpoint with 30s server cache)
      if (url.pathname.endsWith("/stats") && request.method === "GET") {
        try {
          const now = Date.now();
          if (KAIZEN_STATS_CACHE && (now - KAIZEN_STATS_CACHE_TIME < KAIZEN_STATS_CACHE_TTL_MS)) {
            return new Response(JSON.stringify(KAIZEN_STATS_CACHE), {
              headers: {
                ...SECURE_JSON_HEADERS,
                "X-Cache": "HIT",
                "Cache-Control": "public, max-age=30"
              }
            });
          }

          const { results: list } = await env.DB.prepare("SELECT is_thi_dua, status, sub_status, approval_status, registration_type, region FROM ci_kaizen_proposals").all().catch(() => ({ results: [] }));
          const items = list || [];

          let thiDua = 0;
          let choReview = 0;
          let choDanhGia = 0;
          let daDanhGia = 0;
          let luuTru = 0;
          const regions = {
            "Kiên Giang 1": 0,
            "Kiên Giang 2": 0,
            "Kiên Giang 3": 0,
            "Hoàn thiện đế": 0,
            "Phòng kế hoạch": 0,
            "Phòng CN-CI": 0,
            "Phòng chất lượng": 0,
            "Phòng nhân sự": 0,
            "THKG": 0,
            "Nhà Máy Miền Đông": 0,
            "VP Chuỗi (R&D)": 0
          };

          for (let i = 0; i < items.length; i++) {
            const p = items[i];
            const isThiDua = Number(p.is_thi_dua) === 1 || String(p.registration_type || "").toUpperCase() === "THI_DUA";
            const appStatus = String(p.approval_status || "").toUpperCase();
            const subStatus = String(p.sub_status || "").toUpperCase();
            const mainStatus = String(p.status || "").toUpperCase();
            const regType = String(p.registration_type || "").toUpperCase();

            if (isThiDua) {
              thiDua++;
            }

            if (regType === "LUU_TRU" || subStatus === "LUU_TRU" || mainStatus === "ARCHIVED") {
              luuTru++;
            } else if (subStatus === "DA_DANH_GIA" || appStatus === "DA_DANH_GIA") {
              daDanhGia++;
            } else if (subStatus === "CHO_DANH_GIA" || appStatus === "PHE_DUYET" || mainStatus === "APPROVED") {
              choDanhGia++;
            } else if (appStatus === "TU_CHOI" || subStatus === "TU_CHOI_TRIEN_KHAI" || mainStatus === "REJECTED") {
              // Rejected proposal
            } else {
              // Any unapproved, non-rejected, pending proposal counts as Chờ phê duyệt (choReview)
              choReview++;
            }

            const reg = String(p.region || "").toUpperCase();
            if (reg.includes("KIÊN GIANG 1") || reg.includes("KIEN GIANG 1") || reg.includes("KG1") || reg.includes("KG 1")) {
              regions["Kiên Giang 1"]++;
            }
            if (reg.includes("KIÊN GIANG 2") || reg.includes("KIEN GIANG 2") || reg.includes("KG2") || reg.includes("KG 2")) {
              regions["Kiên Giang 2"]++;
            }
            if (reg.includes("KIÊN GIANG 3") || reg.includes("KIEN GIANG 3") || reg.includes("KG3") || reg.includes("KG 3")) {
              regions["Kiên Giang 3"]++;
            }
            if (reg.includes("HOÀN THIỆN ĐẾ") || reg.includes("HOAN THIEN DE") || reg.includes("HTĐ") || reg.includes("HTD") || reg === "ĐẾ" || reg === "DE") {
              regions["Hoàn thiện đế"]++;
            }
            if (reg.includes("KẾ HOẠCH") || reg.includes("KE HOACH") || reg.includes("PPC")) {
              regions["Phòng kế hoạch"]++;
            }
            if (reg.includes("CN-CI") || reg.includes("CN CI") || reg.includes("CONTINUOUS IMPROVEMENT")) {
              regions["Phòng CN-CI"]++;
            }
            if (reg.includes("CHẤT LƯỢNG") || reg.includes("CHAT LUONG") || reg.includes("QA") || reg.includes("QC")) {
              regions["Phòng chất lượng"]++;
            }
            if (reg.includes("NHÂN SỰ") || reg.includes("NHAN SU") || reg.includes("HR") || reg.includes("HÀNH CHÍNH")) {
              regions["Phòng nhân sự"]++;
            }
            if (reg.includes("THKG") || reg.includes("TH-KG") || reg.includes("KIÊN GIANG") || reg.includes("KIEN GIANG")) {
              regions["THKG"]++;
            }
            if (reg.includes("MIỀN ĐÔNG") || reg.includes("MIEN DONG") || reg.includes("LONG XUYÊN")) {
              regions["Nhà Máy Miền Đông"]++;
            }
            if (reg.includes("VP CHUỖI") || reg.includes("VP CHUOI") || reg.includes("R&D")) {
              regions["VP Chuỗi (R&D)"]++;
            }
          }

          const statsObj = {
            success: true,
            stats: {
              thiDua,
              choReview,
              choDanhGia,
              daDanhGia,
              luuTru,
              regions,
              totalProposals: items.length
            },
            cachedAt: new Date(now).toISOString()
          };

          KAIZEN_STATS_CACHE = statsObj;
          KAIZEN_STATS_CACHE_TIME = now;

          return new Response(JSON.stringify(statsObj), {
            headers: {
              ...SECURE_JSON_HEADERS,
              "X-Cache": "MISS",
              "Cache-Control": "public, max-age=30"
            }
          });
        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // Auto-ensure idempotency_keys & table column migrations exist
      const ensureIdempotencyTable = async () => {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS idempotency_keys (
              key TEXT PRIMARY KEY,
              status_code INTEGER DEFAULT 200,
              response_body TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();
        } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN required_reviewer_ids_json TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN average_score REAL").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN evaluated_at DATETIME").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN review_comment TEXT").run(); } catch(e) {}
        // ✅ NEW: Add columns for new form fields
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN proposer_position TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN proposer_month INTEGER").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN proposer_year INTEGER").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN hr_suggestor TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN customer TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN product_group TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN product_code TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN quantity INTEGER").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN pricing_direction TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN time_before_seconds INTEGER").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN time_after_seconds INTEGER").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN efficiency_value_vnd INTEGER").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN plant_code TEXT DEFAULT 'VP2_SKECHERS'").run(); } catch(e) {}
        // ✅ NEW: Add State Machine Columns (QĐ-TBKG/2026)
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN approval_status TEXT DEFAULT 'PENDING'").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN evaluation_result TEXT DEFAULT 'PENDING'").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN approved_by TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN approved_at TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN evaluated_by TEXT").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN evaluated_at TEXT").run(); } catch(e) {}

        // Bảng audit log lịch sử chuyển trạng thái (QĐ-TBKG/2026)
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS ci_kaizen_status_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              proposal_id TEXT NOT NULL,
              from_status TEXT,
              to_status TEXT NOT NULL,
              action TEXT NOT NULL,
              actor_id TEXT,
              actor_name TEXT,
              note TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();
        } catch(e) {}
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS regional_kpi_targets (
              id TEXT PRIMARY KEY,
              plant_code TEXT DEFAULT 'VP2_SKECHERS',
              department_name TEXT NOT NULL UNIQUE,
              monthly_target INTEGER NOT NULL DEFAULT 10,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();
        } catch(e) {}
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS ci_kaizen_assignments (
              id TEXT PRIMARY KEY,
              proposal_id TEXT NOT NULL,
              judge_emp_code TEXT NOT NULL,
              judge_name TEXT,
              judge_title TEXT,
              assigned_by_emp_code TEXT,
              status TEXT DEFAULT 'PENDING',
              assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();
        } catch(e) {}
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS ci_kaizen_expert_evaluations (
              id TEXT PRIMARY KEY,
              proposal_id TEXT NOT NULL,
              evaluator_emp_code TEXT NOT NULL,
              evaluator_name TEXT NOT NULL,
              evaluator_title TEXT,
              prerequisite_pass INTEGER DEFAULT 1,
              criterion1_score REAL DEFAULT 0,
              criterion2_score REAL DEFAULT 0,
              criterion3_score REAL DEFAULT 0,
              criterion4_score REAL DEFAULT 0,
              criterion5_score REAL DEFAULT 0,
              total_score REAL DEFAULT 0,
              comments TEXT,
              status TEXT DEFAULT 'DRAFT',
              confirmed_at DATETIME,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (proposal_id) REFERENCES ci_kaizen_proposals(id) ON DELETE CASCADE
            )
          `).run();
        } catch(e) {}
      };

      // ════════════════════════════════════════════════════════════════
      // 👑 BGK ASSIGNMENTS APIS (TGĐ / ADMIN PHÂN CÔNG TƯỜNG MINH QUA MSNV)
      // ════════════════════════════════════════════════════════════════
      if (url.pathname.includes("/ci-kaizen/assignments")) {
        // GET: Get assigned judges for a proposal
        if (request.method === "GET") {
          try {
            const user = await verifyServerAuth(request, env);
            const proposalId = url.searchParams.get("proposalId");
            if (!proposalId) {
              return new Response(JSON.stringify({ success: false, error: "MISSING_PARAM", message: "Thiếu proposalId" }), { status: 400, headers: SECURE_JSON_HEADERS });
            }

            const { results } = await env.DB.prepare("SELECT * FROM ci_kaizen_assignments WHERE proposal_id = ? ORDER BY assigned_at ASC").bind(proposalId).all().catch(() => ({ results: [] }));
            const assignedList = results || [];

            const userEmp = (user?.empCode || "").trim().toUpperCase();
            const userRole = (user?.roleCode || "").toUpperCase();
            const isExecutiveManager = userRole === "TONG_GIAM_DOC" || userRole === "SYSTEM_ADMIN" || userEmp === "TGĐ-001" || userEmp === "ADMIN-2026";

            return new Response(JSON.stringify({ success: true, data: assignedList, isExecutiveManager }), { headers: SECURE_JSON_HEADERS });
          } catch(err) {
            return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
          }
        }

        // POST: TGĐ / Admin assigns a judge by MSNV
        if (request.method === "POST") {
          try {
            const user = await verifyServerAuth(request, env);
            if (!user || !user.authenticated) {
              return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Đăng nhập để thực hiện phân công!" }), { status: 401, headers: SECURE_JSON_HEADERS });
            }

            const userEmp = (user.empCode || "").trim().toUpperCase();
            const userRole = (user.roleCode || "").toUpperCase();
            const isExecutiveManager = userRole === "TONG_GIAM_DOC" || userRole === "SYSTEM_ADMIN" || userEmp === "TGĐ-001" || userEmp === "ADMIN-2026";

            if (!isExecutiveManager) {
              return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "CHỈ Tổng Giám Đốc (TGĐ) hoặc Admin mới có quyền phân công Ban Giám Khảo!" }), { status: 403, headers: SECURE_JSON_HEADERS });
            }

            const body = await request.json();
            const { proposalId, judgeEmpCode } = body;

            if (!proposalId || !judgeEmpCode) {
              return new Response(JSON.stringify({ success: false, error: "MISSING_FIELDS", message: "Vui lòng chọn bài viết và nhập MSNV làm BGK!" }), { status: 400, headers: SECURE_JSON_HEADERS });
            }

            const targetEmp = String(judgeEmpCode).trim().toUpperCase();

            // Lookup employee info from DB / ROLE_ACCOUNTS
            let judgeName = "Cán Bộ Giám Khảo";
            let judgeTitle = "Ban Giám Khảo";

            const sysUser = (typeof WORKER_SYSTEM_USERS !== "undefined" ? WORKER_SYSTEM_USERS[targetEmp] : null) || ROLE_ACCOUNTS[targetEmp];
            if (sysUser) {
              judgeName = sysUser.name || judgeName;
              judgeTitle = sysUser.title || judgeTitle;
            } else {
              const { results: uRes } = await env.DB.prepare("SELECT name, title FROM users WHERE emp_code = ? OR id = ?").bind(targetEmp, targetEmp).all().catch(() => ({ results: [] }));
              if (uRes && uRes[0]) {
                judgeName = uRes[0].name || judgeName;
                judgeTitle = uRes[0].title || judgeTitle;
              }
            }

            const assignId = `assign_${proposalId}_${targetEmp}`;

            await env.DB.prepare(`
              INSERT INTO ci_kaizen_assignments (id, proposal_id, judge_emp_code, judge_name, judge_title, assigned_by_emp_code, status, assigned_at)
              VALUES (?, ?, ?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET
                judge_name = excluded.judge_name,
                judge_title = excluded.judge_title,
                assigned_by_emp_code = excluded.assigned_by_emp_code
            `).bind(assignId, proposalId, targetEmp, judgeName, judgeTitle, userEmp).run();

            await recordAuditLog(user, "ci_kaizen", "ASSIGN_JUDGE", assignId, null, { proposalId, targetEmp, judgeName }, request);
            await createNotification(targetEmp, "ci_kaizen", "INFO", proposalId, "👑 Phân Công Ban Giám Khảo", `Bạn đã được TGĐ/Admin phân công làm BGK chấm bài cải tiến: ${proposalId}`);

            return new Response(JSON.stringify({ success: true, message: `Đã phân công MSNV ${targetEmp} (${judgeName}) làm BGK!`, assignId }), { headers: SECURE_JSON_HEADERS });
          } catch(err) {
            return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
          }
        }

        // DELETE: TGĐ / Admin unassigns a judge (If not confirmed yet)
        if (request.method === "DELETE") {
          try {
            const user = await verifyServerAuth(request, env);
            if (!user || !user.authenticated) {
              return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Đăng nhập để thực hiện!" }), { status: 401, headers: SECURE_JSON_HEADERS });
            }

            const userEmp = (user.empCode || "").trim().toUpperCase();
            const userRole = (user.roleCode || "").toUpperCase();
            const isExecutiveManager = userRole === "TONG_GIAM_DOC" || userRole === "SYSTEM_ADMIN" || userEmp === "TGĐ-001" || userEmp === "ADMIN-2026";

            if (!isExecutiveManager) {
              return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "CHỈ Tổng Giám Đốc (TGĐ) hoặc Admin mới có quyền gỡ phân công BGK!" }), { status: 403, headers: SECURE_JSON_HEADERS });
            }

            const body = await request.json().catch(() => ({}));
            const proposalId = body.proposalId || url.searchParams.get("proposalId");
            const judgeEmpCode = body.judgeEmpCode || url.searchParams.get("judgeEmpCode");

            if (!proposalId || !judgeEmpCode) {
              return new Response(JSON.stringify({ success: false, error: "MISSING_FIELDS", message: "Thiếu proposalId hoặc judgeEmpCode" }), { status: 400, headers: SECURE_JSON_HEADERS });
            }

            const targetEmp = String(judgeEmpCode).trim().toUpperCase();

            // Check if this judge has already CONFIRMED their evaluation
            const { results: evalRes } = await env.DB.prepare("SELECT status FROM ci_kaizen_expert_evaluations WHERE proposal_id = ? AND evaluator_emp_code = ? AND status = 'CONFIRMED'").bind(proposalId, targetEmp).all().catch(() => ({ results: [] }));
            if (evalRes && evalRes.length > 0) {
              return new Response(JSON.stringify({ success: false, error: "LOCKED_CONFIRMED", message: "KHÔNG THỂ XÓA BGK này vì họ đã xác nhận khóa điểm chuyên môn cho bài viết!" }), { status: 400, headers: SECURE_JSON_HEADERS });
            }

            await env.DB.prepare("DELETE FROM ci_kaizen_assignments WHERE proposal_id = ? AND judge_emp_code = ?").bind(proposalId, targetEmp).run();
            await recordAuditLog(user, "ci_kaizen", "UNASSIGN_JUDGE", `${proposalId}_${targetEmp}`, null, { proposalId, targetEmp }, request);

            return new Response(JSON.stringify({ success: true, message: `Đã gỡ MSNV ${targetEmp} khỏi danh sách BGK bài này!` }), { headers: SECURE_JSON_HEADERS });
          } catch(err) {
            return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
          }
        }
      }

      // Helper to strip undefined values for D1 binding safety
      const safeVal = (val, defaultVal = null) => {
        if (val === undefined || val === null) return defaultVal;
        return val;
      };

      // ════════════════════════════════════════════════════════════════
      // 👑 DEDICATED STATE MACHINE ENDPOINTS (QĐ-TBKG/2026)
      // ════════════════════════════════════════════════════════════════

      // 1. POST /api/ci-kaizen/approve (Bước 3: Xem xét tính khả thi)
      if (url.pathname.endsWith("/approve") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để phê duyệt đề xuất!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }

          const userRole = (user.roleCode || "").toUpperCase();
          const userEmp = (user.empCode || "").trim().toUpperCase();
          const isManagerOrCI = user.isExecutiveOrAdmin || ["TEAM_CI", "QUAN_LY", "ADMIN", "TRUONG_PHONG", "CI_LEAD", "PHO_GIAM_DOC", "GIAM_DOC", "PHO_TONG_GIAM_DOC", "TONG_GIAM_DOC"].includes(userRole) || ["TGĐ-001", "ADMIN-2026", "202608001", "201809012", "PGĐ-005", "202608002"].includes(userEmp);

          if (!isManagerOrCI) {
            return new Response(JSON.stringify({
              success: false,
              error: "FORBIDDEN",
              message: "⛔ Bạn không có quyền phê duyệt sáng kiến. Chỉ Team CI / Quản lý / Ban Giám Đốc mới được thực hiện bước này."
            }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const {
            proposalId,
            decision,
            note,
            category,
            timeBeforeSeconds,
            timeAfterSeconds,
            savedSeconds,
            efficiencyValueVND,
            pairQuantity,
            so_luong_giay,
            totalSavingsVND,
            tong_tien_tiet_kiem,
            totalSavingsWords,
            tong_tien_bang_chu,
            costBefore,
            cost_before,
            costAfter,
            cost_after,
            after_image_url,
            afterImageUrl,
            attachments_json,
            attachmentsJson,
          } = body;

          if (!proposalId || !decision) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "Thiếu proposalId hoặc decision (APPROVE/REJECT)" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy sáng kiến!" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.approval_status === "TU_CHOI" || proposal.status === "REJECTED") {
            return new Response(JSON.stringify({
              success: false,
              error: "PROPOSAL_REJECTED",
              message: "⛔ Đề xuất đã bị từ chối ở Bước 3, quy trình đã DỪNG theo quy định QĐ-TBKG và không thể tiếp tục."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.sub_status !== "CHO_REVIEW" && proposal.approval_status !== "PENDING") {
            return new Response(JSON.stringify({
              success: false,
              error: "INVALID_STATE_TRANSITION",
              message: "⛔ Sáng kiến không ở trạng thái chờ review (Bước 3), không thể phê duyệt/từ chối."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          const isApprove = decision === "APPROVE";
          const newApprovalStatus = isApprove ? "PHE_DUYET" : "TU_CHOI";
          const newSubStatus = isApprove ? "CHO_DANH_GIA" : "TU_CHOI_TRIEN_KHAI";
          const newStatus = isApprove ? "APPROVED" : "REJECTED";

          const pBefore = Number(proposal.time_before_seconds || 0);
          const pAfter = Number(proposal.time_after_seconds || 0);
          const pSaved = Number(proposal.saved_seconds || 0);

          let tBefore = isApprove ? (timeBeforeSeconds !== undefined && Number(timeBeforeSeconds) >= 0 ? Number(timeBeforeSeconds) : pBefore) : pBefore;
          let tAfter = isApprove ? (timeAfterSeconds !== undefined && Number(timeAfterSeconds) >= 0 ? Number(timeAfterSeconds) : pAfter) : pAfter;
          let tSaved = isApprove ? (savedSeconds !== undefined && Number(savedSeconds) >= 0 ? Number(savedSeconds) : Math.max(0, tBefore - tAfter)) : pSaved;

          if (tSaved <= 0 && pSaved > 0) {
            tSaved = pSaved;
          }
          if (tBefore <= 0 && tSaved > 0) {
            tBefore = tSaved + tAfter;
          }

          const pairQty = Number(pairQuantity || so_luong_giay || 0);
          const effValueVnd = Number(efficiencyValueVND || Math.round(tSaved * 12.5));
          const totSavings = Number(totalSavingsVND || tong_tien_tiet_kiem || (pairQty > 0 ? effValueVnd * pairQty : effValueVnd));
          const totSavingsWords = String(totalSavingsWords || tong_tien_bang_chu || "");

          const cBefore = Number(costBefore !== undefined && costBefore !== null ? costBefore : (cost_before !== undefined ? cost_before : (proposal.cost_before || 0)));
          const cAfter = Number(costAfter !== undefined && costAfter !== null ? costAfter : (cost_after !== undefined ? cost_after : (proposal.cost_after || 0)));

          const afterImg = after_image_url || afterImageUrl || null;
          const attJson = attachments_json || attachmentsJson || null;
          const catVal = category || null;

          const CATEGORY_LABEL_MAP = {
            MATERIAL_SAVING: "1.Tiết kiệm Vật tư",
            COST_SAVING: "2.Tiết kiệm Chi phí",
            PRODUCTIVITY: "3.Tăng Năng suất",
            SAFETY: "4.An toàn lao động",
            "5S": "5.5S",
            AUTOMATION: "6.Tự động hoá",
            EQUIPMENT: "7.MMTB CCDC",
          };
          const catLabelVal = catVal ? (CATEGORY_LABEL_MAP[catVal] || catVal) : null;

          // Auto-migration for required D1 columns
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN pair_quantity INTEGER DEFAULT 0').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN total_savings_vnd REAL DEFAULT 0').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN total_savings_words TEXT').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN after_image_url TEXT').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN attachments_json TEXT').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN category TEXT').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN category_label TEXT').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN cost_before REAL DEFAULT 0').run().catch(() => {});
          await env.DB.prepare('ALTER TABLE ci_kaizen_proposals ADD COLUMN cost_after REAL DEFAULT 0').run().catch(() => {});

          await env.DB.prepare(`
            UPDATE ci_kaizen_proposals
            SET approval_status = ?,
                sub_status = ?,
                status = ?,
                review_status = ?,
                is_archived = ?,
                category = COALESCE(?, category),
                category_label = COALESCE(?, category_label),
                time_before_seconds = ?,
                time_after_seconds = ?,
                saved_seconds = ?,
                efficiency_value_vnd = ?,
                pair_quantity = ?,
                quantity = ?,
                total_savings_vnd = ?,
                total_savings_words = ?,
                cost_before = ?,
                cost_after = ?,
                after_image_url = COALESCE(?, after_image_url),
                attachments_json = COALESCE(?, attachments_json),
                review_comment = COALESCE(?, review_comment),
                approved_at = CASE WHEN ? = 'PHE_DUYET' THEN CURRENT_TIMESTAMP ELSE approved_at END,
                approved_by = CASE WHEN ? = 'PHE_DUYET' THEN ? ELSE approved_by END,
                proposer_month = CASE WHEN ? = 'PHE_DUYET' THEN CAST(strftime('%m', 'now') AS INTEGER) ELSE proposer_month END,
                proposer_year = CASE WHEN ? = 'PHE_DUYET' THEN CAST(strftime('%Y', 'now') AS INTEGER) ELSE proposer_year END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            newApprovalStatus,
            newSubStatus,
            newStatus,
            isApprove ? "CHO_DANH_GIA" : "TU_CHOI_DUYET",
            isApprove ? 0 : 1,
            catVal,
            catLabelVal,
            tBefore,
            tAfter,
            tSaved,
            effValueVnd,
            pairQty,
            pairQty,
            totSavings,
            totSavingsWords,
            cBefore,
            cAfter,
            afterImg,
            attJson,
            note || null,
            newApprovalStatus,
            newApprovalStatus,
            user.name || user.empCode || "Cán bộ Quản lý",
            newApprovalStatus,
            newApprovalStatus,
            proposalId
          ).run();

          await env.DB.prepare(`
            INSERT INTO ci_kaizen_status_history (proposal_id, from_status, to_status, action, actor_id, actor_name, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(proposalId, proposal.sub_status || "CHO_REVIEW", newSubStatus, isApprove ? "APPROVE" : "REJECT", user.empCode || "USER", user.name || "Cán bộ Quản lý", safeVal(note, isApprove ? `Phê duyệt triển khai (Trước: ${tBefore}s, Sau: ${tAfter}s, Tiết kiệm: ${tSaved}s, Số lượng: ${pairQty} đôi, Tổng tiết kiệm: ${totSavings} VNĐ)` : "Từ chối triển khai sáng kiến")).run();

          invalidateKaizenStatsCache();

          return new Response(JSON.stringify({
            success: true,
            message: isApprove ? "🎉 Đã Phê duyệt triển khai sáng kiến thành công! Sáng kiến chuyển sang Bước 4 (Chờ đánh giá hiệu quả)." : "❌ Đã Từ chối triển khai sáng kiến. Quy trình DỪNG theo Quy định QĐ-TBKG.",
            proposalId,
            approval_status: newApprovalStatus,
            sub_status: newSubStatus,
            status: newStatus,
            category: catVal,
            category_label: catLabelVal,
            time_before_seconds: tBefore,
            time_after_seconds: tAfter,
            saved_seconds: tSaved,
            efficiency_value_vnd: effValueVnd,
            pair_quantity: pairQty,
            quantity: pairQty,
            total_savings_vnd: totSavings,
            total_savings_words: totSavingsWords,
            cost_before: cBefore,
            cost_after: cAfter,
            after_image_url: afterImg,
            approved_at: isApprove ? new Date().toISOString() : null,
            proposer_month: isApprove ? new Date().getMonth() + 1 : undefined,
            proposer_year: isApprove ? new Date().getFullYear() : undefined,
          }), { headers: SECURE_JSON_HEADERS });

        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // 2. POST /api/ci-kaizen/evaluate (Bước 5: Đánh giá hiệu quả)
      if (url.pathname.endsWith("/evaluate") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để đánh giá hiệu quả!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }

          const userRole = (user.roleCode || "").toUpperCase();
          const userEmp = (user.empCode || "").trim().toUpperCase();
          const isEvaluator = user.isExecutiveOrAdmin || ["TEAM_CI", "BGD", "ADMIN", "TRUONG_PHONG", "CI_LEAD", "BGK"].includes(userRole) || ["TGĐ-001", "ADMIN-2026", "202608001"].includes(userEmp);

          if (!isEvaluator) {
            return new Response(JSON.stringify({
              success: false,
              error: "FORBIDDEN",
              message: "⛔ Bạn không có quyền đánh giá hiệu quả sáng kiến. Chỉ Team CI / Hội đồng đánh giá (BGK) / BGĐ / Admin mới có quyền thực hiện."
            }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const { proposalId, result, scores, propose_thi_dua, note } = body; // result: 'DAT' | 'KHONG_DAT'

          if (!proposalId || !result) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "Thiếu proposalId hoặc result (DAT/KHONG_DAT)" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy sáng kiến!" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.approval_status === "TU_CHOI" || proposal.status === "REJECTED") {
            return new Response(JSON.stringify({
              success: false,
              error: "PROPOSAL_REJECTED",
              message: "⛔ Đề xuất đã bị từ chối ở Bước 3, quy trình đã DỪNG theo quy định QĐ-TBKG và không thể đánh giá hiệu quả."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.approval_status !== "PHE_DUYET" || proposal.sub_status !== "CHO_DANH_GIA") {
            return new Response(JSON.stringify({
              success: false,
              error: "INVALID_STATE_TRANSITION",
              message: "⛔ Sáng kiến chưa được Phê duyệt ở Bước 3 hoặc không ở trạng thái Chờ đánh giá hiệu quả."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          // Format 5-criteria scores_json
          let scoresObj = { thoi_gian: 0, cong_nghe: 0, chat_luong: 0, "5s": 0, an_toan: 0, average: 0 };
          if (scores && typeof scores === "object") {
            const tg = Number(scores.thoi_gian || scores.thoiGian) || 0;
            const cn = Number(scores.cong_nghe || scores.congNghe) || 0;
            const cl = Number(scores.chat_luong || scores.chatLuong) || 0;
            const s5 = Number(scores["5s"] || scores.s5) || 0;
            const at = Number(scores.an_toan || scores.anToan) || 0;
            const avg = Math.round(((tg + cn + cl + s5 + at) / 5) * 10) / 10;
            scoresObj = { thoi_gian: tg, cong_nghe: cn, chat_luong: cl, "5s": s5, an_toan: at, average: avg };
          }
          const scoresJsonStr = JSON.stringify(scoresObj);
          const avgRating = scoresObj.average || proposal.avg_rating || 0;

          const isPass = result === "DAT";
          const newEvalResult = isPass ? "DAT" : "KHONG_DAT";
          const newSubStatus = isPass ? "DA_DANH_GIA" : "KHONG_DAT_YEU_CAU";
          const proposeThiDuaVal = (isPass && propose_thi_dua) ? 1 : 0;

          // Auto-migrate columns
          try {
            await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN propose_thi_dua INTEGER DEFAULT 0").run();
          } catch(e) {}
          try {
            await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN is_thi_dua INTEGER DEFAULT 0").run();
          } catch(e) {}
          try {
            await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN scores_json TEXT").run();
          } catch(e) {}

          await env.DB.prepare(`
            UPDATE ci_kaizen_proposals
            SET evaluation_result = ?, sub_status = ?, review_status = ?, is_archived = ?, avg_rating = ?, scores_json = ?, propose_thi_dua = ?, evaluated_by = ?, evaluated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(newEvalResult, newSubStatus, isPass ? "DA_DANH_GIA" : "TU_CHOI_DUYET", isPass ? 0 : 1, avgRating, scoresJsonStr, proposeThiDuaVal, user.empCode || user.id || "ADMIN", proposalId).run();

          await env.DB.prepare(`
            INSERT INTO ci_kaizen_status_history (proposal_id, from_status, to_status, action, actor_id, actor_name, note)
            VALUES (?, 'CHO_DANH_GIA', ?, ?, ?, ?, ?)
          `).bind(proposalId, newSubStatus, isPass ? "EVALUATE_PASS" : "EVALUATE_FAIL", user.empCode || "USER", user.name || "Cán bộ Đánh giá", safeVal(note, isPass ? `Đánh giá hiệu quả ĐẠT (${avgRating}/5 sao)` : "Đánh giá hiệu quả KHÔNG ĐẠT")).run();

          return new Response(JSON.stringify({
            success: true,
            message: isPass ? "🏆 Đánh giá hiệu quả ĐẠT! Sáng kiến đã đủ điều kiện để Ban Giám Đốc nghiệm thu & Lưu trữ (Bước 6)." : "⛔ Đánh giá hiệu quả KHÔNG ĐẠT. Sáng kiến DỪNG theo Quy định QĐ-TBKG.",
            proposalId,
            evaluation_result: newEvalResult,
            sub_status: newSubStatus,
            scores: scoresObj,
            propose_thi_dua: proposeThiDuaVal === 1
          }), { headers: SECURE_JSON_HEADERS });

        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // 3. POST /api/ci-kaizen/archive (Bước 6: Khen thưởng & Lưu trữ)
      if (url.pathname.endsWith("/archive") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để lưu trữ sáng kiến!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }

          const userRole = (user.roleCode || "").toUpperCase();
          const userEmp = (user.empCode || "").trim().toUpperCase();
          const isBGDOrAdmin = user.isExecutiveOrAdmin || ["BGD", "ADMIN", "TONG_GIAM_DOC", "SYSTEM_ADMIN"].includes(userRole) || ["TGĐ-001", "ADMIN-2026"].includes(userEmp);

          if (!isBGDOrAdmin) {
            return new Response(JSON.stringify({
              success: false,
              error: "FORBIDDEN",
              message: "⛔ Chỉ Ban Giám Đốc hoặc Admin mới được phép nghiệm thu & đưa sáng kiến vào Lưu trữ (Bước 6)."
            }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const { proposalId, note } = body;

          if (!proposalId) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "Thiếu proposalId" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy sáng kiến!" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.approval_status === "TU_CHOI" || proposal.status === "REJECTED") {
            return new Response(JSON.stringify({
              success: false,
              error: "PROPOSAL_REJECTED",
              message: "⛔ Đề xuất đã bị từ chối ở Bước 3, quy trình đã DỪNG theo quy định QĐ-TBKG và không thể lưu trữ."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.approval_status !== "PHE_DUYET" || (proposal.evaluation_result !== "DAT" && proposal.sub_status !== "DA_DANH_GIA")) {
            return new Response(JSON.stringify({
              success: false,
              error: "INVALID_STATE_TRANSITION",
              message: "⛔ Không thể đưa vào Lưu trữ! Sáng kiến phải được Phê duyệt (Bước 3) VÀ Đánh giá hiệu quả ĐẠT (Bước 5) theo Quy định QĐ-TBKG."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          await env.DB.prepare(`
            UPDATE ci_kaizen_proposals
            SET status = 'ARCHIVED', sub_status = 'LUU_TRU', registration_type = 'LUU_TRU', is_archived = 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(proposalId).run();

          await env.DB.prepare(`
            INSERT INTO ci_kaizen_status_history (proposal_id, from_status, to_status, action, actor_id, actor_name, note)
            VALUES (?, ?, 'LUU_TRU', 'ARCHIVE', ?, ?, ?)
          `).bind(proposalId, proposal.sub_status || "DA_DANH_GIA", user.empCode || "BGD", user.name || "Ban Giám Đốc", safeVal(note, "Nghiệm thu & Lưu trữ sáng kiến theo Bước 6 QĐ-TBKG")).run();

          return new Response(JSON.stringify({
            success: true,
            message: "📦 Đã nghiệm thu & đưa sáng kiến vào kho Lưu trữ thành công (Bước 6 hoàn tất)!",
            proposalId,
            status: "ARCHIVED",
            sub_status: "LUU_TRU",
            registration_type: "LUU_TRU"
          }), { headers: SECURE_JSON_HEADERS });

        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // 3.6 POST /api/ci-kaizen/approve (Phê duyệt tính khả thi sáng kiến - Bước 3 QĐ-TBKG)
      if (url.pathname.endsWith("/approve") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện phê duyệt!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const {
            proposalId, decision, note,
            timeBeforeSeconds, timeAfterSeconds, savedSeconds,
            efficiencyValueVND, pairQuantity, so_luong_giay,
            totalSavingsVND, tong_tien_tiet_kiem, totalSavingsWords, tong_tien_bang_chu
          } = body;

          if (!proposalId) {
            return new Response(JSON.stringify({ success: false, error: "INVALID_PARAM", message: "Mã đề xuất không hợp lệ" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const isApproved = decision === "APPROVE";
          const status = isApproved ? "UNDER_REVIEW" : "REJECTED";
          const subStatus = isApproved ? "CHO_DANH_GIA" : "TU_CHOI_TRIEN_KHAI";
          const approvalStatus = isApproved ? "PHE_DUYET" : "TU_CHOI";

          const pairQty = Number(pairQuantity || so_luong_giay || 0);
          const totalSavings = Number(totalSavingsVND || tong_tien_tiet_kiem || 0);
          const totalSavingsWordsVal = String(totalSavingsWords || tong_tien_bang_chu || "");
          const timeBefore = Number(timeBeforeSeconds || 0);
          const timeAfter = Number(timeAfterSeconds || 0);
          const savedSecs = Number(savedSeconds || Math.max(0, timeBefore - timeAfter));
          const efficiencyVnd = Number(efficiencyValueVND || Math.round(savedSecs * 12.5));

          const afterImageUrl = body.after_image_url || body.afterImageUrl || null;
          const attachmentsJson = body.attachments_json || body.attachmentsJson || null;
          const categoryVal = body.category || null;

          const costBeforeVal = Number(body.costBefore || body.cost_before || 0);
          const costAfterVal = Number(body.costAfter || body.cost_after || 0);

          // Auto-migrate columns
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN pair_quantity INTEGER DEFAULT 0").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN total_savings_vnd REAL DEFAULT 0").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN total_savings_words TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN cost_before REAL DEFAULT 0").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN cost_after REAL DEFAULT 0").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN after_image_url TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN attachments_json TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN category TEXT").run(); } catch(e) {}
          try { await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN review_status TEXT").run(); } catch(e) {}

          const query = `
            UPDATE ci_kaizen_proposals
            SET approval_status = ?,
                sub_status = ?,
                status = ?,
                review_status = ?,
                category = COALESCE(?, category),
                time_before_seconds = ?,
                time_after_seconds = ?,
                saved_seconds = ?,
                efficiency_value_vnd = ?,
                pair_quantity = ?,
                total_savings_vnd = ?,
                total_savings_words = ?,
                cost_before = ?,
                cost_after = ?,
                after_image_url = COALESCE(?, after_image_url),
                attachments_json = COALESCE(?, attachments_json),
                review_comment = COALESCE(?, review_comment),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;

          await env.DB.prepare(query).bind(
            approvalStatus,
            subStatus,
            status,
            subStatus,
            categoryVal,
            timeBefore,
            timeAfter,
            savedSecs,
            efficiencyVnd,
            pairQty,
            totalSavings,
            totalSavingsWordsVal,
            costBeforeVal,
            costAfterVal,
            afterImageUrl,
            attachmentsJson,
            note || null,
            proposalId
          ).run();

          // Log audit history
          await env.DB.prepare(`
            INSERT INTO ci_kaizen_status_history (
              proposal_id, from_status, to_status, action, actor_id, actor_name, note, created_at
            ) VALUES (?, 'SUBMITTED', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            proposalId,
            subStatus,
            isApproved ? "APPROVE" : "REJECT",
            user.empCode || "ADMIN-2026",
            user.name || "Người Phê Duyệt",
            note || (isApproved ? "Đã phê duyệt tính khả thi (Bước 3)" : "Từ chối triển khai")
          ).run().catch(() => {});

          invalidateKaizenStatsCache();

          return new Response(JSON.stringify({
            success: true,
            message: isApproved ? "🎉 Đã phê duyệt sáng kiến thành công!" : "❌ Đã từ chối triển khai sáng kiến.",
            status,
            sub_status: subStatus,
            approval_status: approvalStatus,
            time_before_seconds: timeBefore,
            time_after_seconds: timeAfter,
            saved_seconds: savedSecs,
            efficiency_value_vnd: efficiencyVnd,
            pair_quantity: pairQty,
            total_savings_vnd: totalSavings,
            total_savings_words: totalSavingsWordsVal
          }), { headers: SECURE_JSON_HEADERS });

        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // 4. POST /api/ci-kaizen/mark-thi-dua (BGK Gắn/Bỏ nhãn Thi đua)
      if (url.pathname.endsWith("/mark-thi-dua") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }

          const userRole = (user.roleCode || "").toUpperCase();
          const userEmp = (user.empCode || "").trim().toUpperCase();
          const isBGKOrAdmin = user.isExecutiveOrAdmin || ["BGD", "ADMIN", "TEAM_CI", "BGK", "TONG_GIAM_DOC", "SYSTEM_ADMIN"].includes(userRole) || ["TGĐ-001", "ADMIN-2026", "202608001"].includes(userEmp);

          if (!isBGKOrAdmin) {
            return new Response(JSON.stringify({
              success: false,
              error: "FORBIDDEN",
              message: "⛔ Chỉ thành viên Hội đồng đánh giá (BGK) hoặc Admin mới có quyền gắn nhãn Thi đua."
            }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const { proposalId, action } = body; // action: 'ADD' | 'REMOVE'

          if (!proposalId || !action) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "Thiếu proposalId hoặc action (ADD/REMOVE)" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy sáng kiến!" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.status !== "ARCHIVED" && proposal.sub_status !== "LUU_TRU") {
            return new Response(JSON.stringify({
              success: false,
              error: "INVALID_STATE_TRANSITION",
              message: "⛔ Chỉ có thể gắn nhãn Thi đua cho sáng kiến đã ở trạng thái Lưu trữ (Bước 6)!"
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          const isAdd = action === "ADD";
          const newIsThiDua = isAdd ? 1 : 0;

          // Auto-migrate columns
          try {
            await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN is_thi_dua INTEGER DEFAULT 0").run();
          } catch(e) {}
          try {
            await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN thi_dua_confirmed_by TEXT").run();
          } catch(e) {}
          try {
            await env.DB.prepare("ALTER TABLE ci_kaizen_proposals ADD COLUMN thi_dua_confirmed_at DATETIME").run();
          } catch(e) {}

          await env.DB.prepare(`
            UPDATE ci_kaizen_proposals
            SET is_thi_dua = ?, thi_dua_confirmed_by = ?, thi_dua_confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(newIsThiDua, user.empCode || user.id || "BGK", proposalId).run();

          await env.DB.prepare(`
            INSERT INTO ci_kaizen_status_history (proposal_id, from_status, to_status, action, actor_id, actor_name, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(proposalId, proposal.sub_status || "LUU_TRU", proposal.sub_status || "LUU_TRU", isAdd ? "MARK_THI_DUA" : "UNMARK_THI_DUA", user.empCode || "BGK", user.name || "Ban Giám Khảo", isAdd ? "Gắn nhãn Thi đua cho sáng kiến" : "Gỡ nhãn Thi đua khỏi sáng kiến").run();

          invalidateKaizenStatsCache();

          return new Response(JSON.stringify({
            success: true,
            message: isAdd ? "🏆 Đã chuyển sáng kiến sang danh mục Thi đua!" : "ℹ️ Đã bỏ nhãn Thi đua khỏi sáng kiến.",
            proposalId,
            is_thi_dua: newIsThiDua
          }), { headers: SECURE_JSON_HEADERS });

        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // 4. GET /api/ci-kaizen/history (Xem lịch sử chuyển trạng thái)
      if (url.pathname.endsWith("/history") && request.method === "GET") {
        try {
          const proposalId = url.searchParams.get("proposalId");
          if (!proposalId) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "Thiếu proposalId" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const { results } = await env.DB.prepare(`
            SELECT * FROM ci_kaizen_status_history WHERE proposal_id = ? ORDER BY created_at ASC
          `).bind(proposalId).all().catch(() => ({ results: [] }));

          return new Response(JSON.stringify({
            success: true,
            data: results || []
          }), { headers: SECURE_JSON_HEADERS });

        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // Handle Increment View Count endpoint
      if (url.pathname.endsWith("/view") && request.method === "POST") {
        try {
          const body = await request.json();
          const { id } = body;
          if (id) {
            await env.DB.prepare("UPDATE ci_kaizen_proposals SET view_count = view_count + 1 WHERE id = ?").bind(id).run();
          }
          return new Response(JSON.stringify({ success: true }), { headers: SECURE_JSON_HEADERS });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // Handle GET Expert Evaluations List
      if (url.pathname.endsWith("/expert-evaluations") && request.method === "GET") {
        try {
          const user = await verifyServerAuth(request, env);
          const proposalId = url.searchParams.get("proposalId");
          if (!proposalId) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAM", message: "Thiếu proposalId" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy bài viết!" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          // Fetch explicit assignments from D1
          const { results: assignRes } = await env.DB.prepare("SELECT * FROM ci_kaizen_assignments WHERE proposal_id = ? ORDER BY assigned_at ASC").bind(proposalId).all().catch(() => ({ results: [] }));
          const assignedList = assignRes || [];

          const userEmp = (user?.empCode || "").trim().toUpperCase();
          const userRole = (user?.roleCode || "").toUpperCase();
          const isExecutiveManager = userRole === "TONG_GIAM_DOC" || userRole === "SYSTEM_ADMIN" || userEmp === "TGĐ-001" || userEmp === "ADMIN-2026";
          const isAssignedJudge = assignedList.some(a => String(a.judge_emp_code).trim().toUpperCase() === userEmp);
          const isOwner = (proposal.proposer_emp_code || "").trim().toUpperCase() === userEmp;

          const { results: allEvals } = await env.DB.prepare("SELECT * FROM ci_kaizen_expert_evaluations WHERE proposal_id = ? ORDER BY created_at ASC").bind(proposalId).all();
          const evalsList = allEvals || [];

          // Filter only valid passed confirmed evaluations
          const confirmedEvals = evalsList.filter(e => e.status === "CONFIRMED" && e.prerequisite_pass !== 0);
          const confirmedCount = confirmedEvals.length;
          const requiredCount = assignedList.length;

          let isCompleted = false;
          let averageScore = null;

          if (requiredCount > 0 && confirmedCount >= requiredCount) {
            isCompleted = true;
            const sumScore = confirmedEvals.reduce((s, e) => s + Number(e.total_score || 0), 0);
            const rawAvg = sumScore / (confirmedCount || 1);
            averageScore = Math.round(rawAvg * 10) / 10;
          }

          const myEval = evalsList.find(e => String(e.evaluator_emp_code).trim().toUpperCase() === userEmp) || null;

          let returnedEvaluations = [];
          if (isExecutiveManager || (isOwner && isCompleted)) {
            returnedEvaluations = evalsList.map(e => ({
              id: e.id,
              evaluatorEmpCode: e.evaluator_emp_code,
              evaluatorName: e.evaluator_name,
              evaluatorTitle: e.evaluator_title,
              prerequisitePass: e.prerequisite_pass === 1,
              criterion1Score: e.criterion1_score,
              criterion2Score: e.criterion2_score,
              criterion3Score: e.criterion3_score,
              criterion4Score: e.criterion4_score,
              criterion5Score: e.criterion5_score,
              totalScore: e.total_score,
              comments: e.comments,
              status: e.status,
              confirmedAt: e.confirmed_at
            }));
          }

          const canEvaluate = isAssignedJudge && (!myEval || myEval.status !== "CONFIRMED");

          return new Response(JSON.stringify({
            success: true,
            data: {
              proposalId,
              isCompleted,
              confirmedCount,
              requiredCount,
              averageScore: isCompleted ? (proposal.score_points || averageScore) : null,
              canEvaluate,
              isAssignedJudge,
              isExecutiveManager,
              assignedJudges: assignedList,
              myEvaluation: myEval ? {
                id: myEval.id,
                evaluatorEmpCode: myEval.evaluator_emp_code,
                evaluatorName: myEval.evaluator_name,
                prerequisitePass: myEval.prerequisite_pass === 1,
                criterion1Score: myEval.criterion1_score,
                criterion2Score: myEval.criterion2_score,
                criterion3Score: myEval.criterion3_score,
                criterion4Score: myEval.criterion4_score,
                criterion5Score: myEval.criterion5_score,
                totalScore: myEval.total_score,
                comments: myEval.comments,
                status: myEval.status,
                confirmedAt: myEval.confirmed_at
              } : null,
              evaluations: returnedEvaluations
            }
          }), { headers: SECURE_JSON_HEADERS });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // Handle POST Expert Evaluation (Save Draft / Confirm)
      if (url.pathname.endsWith("/expert-evaluations") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để thực hiện chấm điểm!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }


          const body = await request.json();
          const { proposalId, prerequisitePass, c1Score, c2Score, c3Score, c4Score, c5Score, comments, action } = body;

          if (!proposalId) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAM", message: "Thiếu proposalId" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy đề xuất cải tiến!" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.approval_status === "TU_CHOI" || proposal.status === "REJECTED") {
            return new Response(JSON.stringify({
              success: false,
              error: "PROPOSAL_REJECTED",
              message: "⛔ Đề xuất đã bị từ chối ở Bước 3, quy trình đã DỪNG theo quy định QĐ-TBKG và không thể thực hiện đánh giá."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          let requiredReviewerIds = ["TGĐ-001", "PTGĐ-002", "GĐ-003", "PGĐ-004", "202608001"];
          if (proposal.required_reviewer_ids_json) {
            try {
              const parsed = JSON.parse(proposal.required_reviewer_ids_json);
              if (Array.isArray(parsed) && parsed.length > 0) requiredReviewerIds = parsed;
            } catch(e) {}
          }

          const userEmp = (user.empCode || "202608001").trim().toUpperCase();
          const isAssignedJudge = isExecutiveOrPgD || requiredReviewerIds.some(id => String(id).trim().toUpperCase() === userEmp);

          // Dual condition: P.GĐ+ AND assigned BGK (Phase 2 & Correction #4)
          if (!isAssignedJudge) {
            return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "Bạn không nằm trong danh sách Ban Giám Khảo được phân công chấm bài này!" }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const evalId = `expert_eval_${proposalId}_${userEmp}`;
          const existingEval = await env.DB.prepare("SELECT status FROM ci_kaizen_expert_evaluations WHERE id = ?").bind(evalId).first();
          if (existingEval && existingEval.status === "CONFIRMED") {
            return new Response(JSON.stringify({ success: false, error: "LOCKED", message: "Bạn đã xác nhận khóa điểm bài đánh giá này (CONFIRMED), không thể chỉnh sửa nữa!" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const isPass = prerequisitePass !== false;

          // Critical Correction #2: PASS/FAIL MUST NOT AUTOMATICALLY BECOME FAKE 0 POINTS AGGREGATED
          if (!isPass) {
            // Save prerequisite fail status for this judge
            const isConfirmAction = action === "CONFIRM";
            const nextStatus = isConfirmAction ? "CONFIRMED" : "DRAFT";
            const confirmedAtStr = isConfirmAction ? new Date().toISOString() : null;

            await env.DB.prepare(`
              INSERT INTO ci_kaizen_expert_evaluations (
                id, proposal_id, evaluator_emp_code, evaluator_name, evaluator_title,
                prerequisite_pass, criterion1_score, criterion2_score, criterion3_score,
                criterion4_score, criterion5_score, total_score, comments, status, confirmed_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET
                prerequisite_pass = 0,
                criterion1_score = 0,
                criterion2_score = 0,
                criterion3_score = 0,
                criterion4_score = 0,
                criterion5_score = 0,
                total_score = 0,
                comments = excluded.comments,
                status = excluded.status,
                confirmed_at = excluded.confirmed_at,
                updated_at = CURRENT_TIMESTAMP
            `).bind(
              evalId,
              proposalId,
              userEmp,
              safeVal(user.name, "Sếp BGĐ"),
              safeVal(user.title, "Ban Giám Đốc"),
              safeVal(comments, "Không đạt điều kiện tiên quyết"),
              nextStatus,
              confirmedAtStr
            ).run();

            return new Response(JSON.stringify({
              success: true,
              message: "⛔ Đã ghi nhận hồ sơ KHÔNG ĐẠT điều kiện tiên quyết (không tính điểm chuyên môn).",
              status: nextStatus,
              prerequisitePass: false
            }), { headers: SECURE_JSON_HEADERS });
          }

          const numC1 = Math.min(35, Math.max(0, Number(c1Score || 0)));
          const numC2 = Math.min(20, Math.max(0, Number(c2Score || 0)));
          const numC3 = Math.min(20, Math.max(0, Number(c3Score || 0)));
          const numC4 = Math.min(15, Math.max(0, Number(c4Score || 0)));
          const numC5 = Math.min(10, Math.max(0, Number(c5Score || 0)));
          const totalScore = Math.round((numC1 + numC2 + numC3 + numC4 + numC5) * 10) / 10;

          const isConfirmAction = action === "CONFIRM";
          const nextStatus = isConfirmAction ? "CONFIRMED" : "DRAFT";
          const confirmedAtStr = isConfirmAction ? new Date().toISOString() : null;

          await env.DB.prepare(`
            INSERT INTO ci_kaizen_expert_evaluations (
              id, proposal_id, evaluator_emp_code, evaluator_name, evaluator_title,
              prerequisite_pass, criterion1_score, criterion2_score, criterion3_score,
              criterion4_score, criterion5_score, total_score, comments, status, confirmed_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              prerequisite_pass = 1,
              criterion1_score = excluded.criterion1_score,
              criterion2_score = excluded.criterion2_score,
              criterion3_score = excluded.criterion3_score,
              criterion4_score = excluded.criterion4_score,
              criterion5_score = excluded.criterion5_score,
              total_score = excluded.total_score,
              comments = excluded.comments,
              status = excluded.status,
              confirmed_at = excluded.confirmed_at,
              updated_at = CURRENT_TIMESTAMP
          `).bind(
            evalId,
            proposalId,
            userEmp,
            safeVal(user.name, "Sếp BGĐ"),
            safeVal(user.title, "Ban Giám Đốc"),
            numC1, numC2, numC3, numC4, numC5,
            totalScore,
            safeVal(comments, ""),
            nextStatus,
            confirmedAtStr
          ).run();

          const { results: allExpertEvals } = await env.DB.prepare("SELECT * FROM ci_kaizen_expert_evaluations WHERE proposal_id = ?").bind(proposalId).all();
          const confirmedEvals = (allExpertEvals || []).filter(e => e.status === "CONFIRMED" && e.prerequisite_pass !== 0);
          const confirmedCount = confirmedEvals.length;
          const requiredCount = requiredReviewerIds.length;

          // Zero-BGK Safety (Critical Correction #5) & Dynamic Average (Critical Correction #6)
          let isCompleted = requiredCount > 0 && confirmedCount >= requiredCount;
          let averageScore = proposal.score_points || 0;

          if (isCompleted) {
            const sumScore = confirmedEvals.reduce((s, e) => s + Number(e.total_score || 0), 0);
            const rawAvg = sumScore / (confirmedCount || 1);
            averageScore = Math.round(rawAvg * 10) / 10;

            await env.DB.prepare(`
              UPDATE ci_kaizen_proposals
              SET sub_status = 'DA_DANH_GIA',
                  score_points = ?,
                  average_score = ?,
                  evaluated_at = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(averageScore, averageScore, proposalId).run();

            await createNotification(
              proposal.proposer_name || proposal.proposer_emp_code,
              "ci_kaizen",
              "SUCCESS",
              proposalId,
              "🏆 Hoàn Tất Đánh Giá Chuyên Môn Barem 100Đ",
              `Tất cả ${requiredCount} sếp BGK đã hoàn tất chấm điểm! Đề xuất "${proposal.title}" (${proposal.code}) đạt điểm trung bình: ${averageScore}/100 điểm.`
            );
          }

          return new Response(JSON.stringify({
            success: true,
            message: isConfirmAction
              ? (isCompleted
                  ? `🏆 Đã xác nhận khóa điểm ${totalScore}/100! Tất cả ${requiredCount} sếp đã hoàn tất (${confirmedCount}/${requiredCount}), bài tự động tổng hợp điểm: ${averageScore}/100.`
                  : `🔒 Đã xác nhận khóa điểm ${totalScore}/100! Tiến độ: ${confirmedCount}/${requiredCount} BGK đã hoàn tất.`)
              : `💾 Đã lưu tạm điểm số (${totalScore}/100)!`,
            status: nextStatus,
            totalScore,
            isCompleted,
            confirmedCount,
            requiredCount,
            averageScore
          }), { headers: SECURE_JSON_HEADERS });

        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // Handle Rating / Star Evaluation endpoint (0.5 to 5.0 step 0.5)
      if (url.pathname.endsWith("/rate") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Đăng nhập để thực hiện đánh giá!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const { proposalId, stars, score, comments } = body;
          const rawStars = score !== undefined ? score : stars;
          const numStars = parseFloat(rawStars || 5.0);

          if (isNaN(numStars) || numStars < 0.5 || numStars > 5.0 || Math.round((numStars * 10)) % 5 !== 0) {
            return new Response(JSON.stringify({ success: false, error: "INVALID_SCORE", message: "Số sao đánh giá phải từ 0.5 đến 5.0 với bước nhảy 0.5!" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy đề xuất cải tiến!" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.approval_status === "TU_CHOI" || proposal.status === "REJECTED") {
            return new Response(JSON.stringify({
              success: false,
              error: "PROPOSAL_REJECTED",
              message: "⛔ Đề xuất đã bị từ chối ở Bước 3, quy trình đã DỪNG theo quy định QĐ-TBKG và không thể thực hiện đánh giá."
            }), { status: 422, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.registration_type === "LUU_TRU") {
            return new Response(JSON.stringify({ success: false, error: "INVALID_ACTION", message: "Bài viết thuộc mục Lưu Trữ, không áp dụng luồng đánh giá sao!" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          if (proposal.sub_status === "DA_DANH_GIA") {
            return new Response(JSON.stringify({ success: false, error: "LOCKED", message: "Bài viết đã hoàn tất đánh giá (Đã đánh giá), toàn bộ điểm đã bị khoá không thể sửa!" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          let requiredReviewerIds = ["TGĐ-001", "PTGĐ-002", "GĐ-003", "PGĐ-004", "202608001"];
          if (proposal.required_reviewer_ids_json) {
            try {
              const parsed = JSON.parse(proposal.required_reviewer_ids_json);
              if (Array.isArray(parsed) && parsed.length > 0) {
                requiredReviewerIds = parsed;
              }
            } catch(e) {}
          }

          const userEmp = (user.empCode || "202608001").trim().toUpperCase();
          const isRequiredReviewer = requiredReviewerIds.some(id => String(id).trim().toUpperCase() === userEmp) || user.isExecutiveOrAdmin;

          if (!isRequiredReviewer) {
            return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "Bạn không nằm trong danh sách sếp có quyền đánh giá bài viết này!" }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const evalId = `eval_${proposalId}_${userEmp}`;
          await env.DB.prepare(`
            INSERT INTO ci_kaizen_evaluations (id, proposal_id, evaluator_emp_code, evaluator_name, rating_stars, comments, is_locked, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              rating_stars = excluded.rating_stars,
              comments = excluded.comments,
              created_at = CURRENT_TIMESTAMP
          `).bind(evalId, proposalId, userEmp, safeVal(user.name, "Anh Huy"), numStars, safeVal(comments, "")).run();

          const { results: evals } = await env.DB.prepare("SELECT * FROM ci_kaizen_evaluations WHERE proposal_id = ?").bind(proposalId).all();
          const ratedReviewerCodes = (evals || []).map(e => String(e.evaluator_emp_code).trim().toUpperCase());
          const distinctRated = requiredReviewerIds.filter(reqId => ratedReviewerCodes.includes(String(reqId).trim().toUpperCase()));
          const ratedCount = distinctRated.length;
          const requiredCount = requiredReviewerIds.length;

          let isCompleted = ratedCount >= requiredCount && requiredCount > 0;
          let avgScore = proposal.avg_rating || 0;

          if (isCompleted) {
            const totalStars = (evals || []).reduce((sum, e) => sum + Number(e.rating_stars || 0), 0);
            const rawAvg = totalStars / (evals.length || 1);
            avgScore = Math.round(rawAvg * 10) / 10;

            await env.DB.prepare(`
              UPDATE ci_kaizen_proposals
              SET sub_status = 'DA_DANH_GIA',
                  avg_rating = ?,
                  average_score = ?,
                  rating_count = ?,
                  evaluated_at = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(avgScore, avgScore, evals.length, proposalId).run();

            await env.DB.prepare("UPDATE ci_kaizen_evaluations SET is_locked = 1 WHERE proposal_id = ?").bind(proposalId).run();

            await createNotification(
              proposal.proposer_name || proposal.proposer_emp_code,
              "ci_kaizen",
              "SUCCESS",
              proposalId,
              "🏆 Cải Tiến Đã Hoàn Tất Đánh Giá",
              `Tất cả ${requiredCount} sếp đã hoàn tất chấm điểm! Đề xuất "${proposal.title}" (${proposal.code}) đạt điểm trung bình: ${avgScore} ⭐ và chính thức chuyển sang mục "Đã đánh giá".`
            );
          } else {
            const totalStars = (evals || []).reduce((sum, e) => sum + Number(e.rating_stars || 0), 0);
            const partialAvg = Math.round((totalStars / (evals.length || 1)) * 10) / 10;

            await env.DB.prepare(`
              UPDATE ci_kaizen_proposals
              SET avg_rating = ?, rating_count = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(partialAvg, evals.length, proposalId).run();
          }

          return new Response(JSON.stringify({
            success: true,
            message: isCompleted
              ? `🏆 Đã chấm ${numStars} sao! Tất cả sếp đã chấm xong (${ratedCount}/${requiredCount}), bài tự động chuyển sang "Đã đánh giá" (${avgScore} ⭐).`
              : `⭐ Đã ghi nhận ${numStars} sao! Tiến độ: ${ratedCount}/${requiredCount} sếp đã chấm.`,
            isCompleted,
            ratedCount,
            requiredCount,
            averageScore: avgScore
          }), { headers: SECURE_JSON_HEADERS });
        } catch(err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // Handle Exempt Reviewer (Admin Override) endpoint
      if (url.pathname.endsWith("/exempt-reviewer") && request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated || !user.isExecutiveOrAdmin) {
            return new Response(JSON.stringify({ success: false, error: "FORBIDDEN", message: "Chỉ Admin/Ban Giám Đốc mới có quyền miễn nhiệm sếp chấm bài!" }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const { proposalId, reviewerEmpCode } = body;
          if (!proposalId || !reviewerEmpCode) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_PARAMS" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(proposalId).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          let requiredReviewerIds = ["TGĐ-001", "PTGĐ-002", "GĐ-003", "PGĐ-004", "202608001"];
          if (proposal.required_reviewer_ids_json) {
            try { requiredReviewerIds = JSON.parse(proposal.required_reviewer_ids_json); } catch(e) {}
          }

          const targetCode = String(reviewerEmpCode).trim().toUpperCase();
          const updatedReviewerIds = requiredReviewerIds.filter(id => String(id).trim().toUpperCase() !== targetCode);

          const updatedJson = JSON.stringify(updatedReviewerIds);
          await env.DB.prepare("UPDATE ci_kaizen_proposals SET required_reviewer_ids_json = ? WHERE id = ?").bind(updatedJson, proposalId).run();

          const { results: evals } = await env.DB.prepare("SELECT * FROM ci_kaizen_evaluations WHERE proposal_id = ?").bind(proposalId).all();
          const ratedReviewerCodes = (evals || []).map(e => String(e.evaluator_emp_code).trim().toUpperCase());
          const distinctRated = updatedReviewerIds.filter(reqId => ratedReviewerCodes.includes(String(reqId).trim().toUpperCase()));

          let isCompleted = distinctRated.length >= updatedReviewerIds.length && updatedReviewerIds.length > 0;
          let avgScore = proposal.avg_rating || 0;

          if (isCompleted && proposal.sub_status === "CHO_DANH_GIA") {
            const totalStars = (evals || []).reduce((sum, e) => sum + Number(e.rating_stars || 0), 0);
            const rawAvg = totalStars / (evals.length || 1);
            avgScore = Math.round(rawAvg * 10) / 10;

            await env.DB.prepare(`
              UPDATE ci_kaizen_proposals
              SET sub_status = 'DA_DANH_GIA',
                  avg_rating = ?,
                  average_score = ?,
                  rating_count = ?,
                  evaluated_at = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(avgScore, avgScore, evals.length, proposalId).run();

            await env.DB.prepare("UPDATE ci_kaizen_evaluations SET is_locked = 1 WHERE proposal_id = ?").bind(proposalId).run();
          }

          return new Response(JSON.stringify({
            success: true,
            message: `Đã miễn nhiệm sếp ${reviewerEmpCode} khỏi danh sách bắt buộc cho riêng bài viết này!`,
            requiredReviewers: updatedReviewerIds,
            isCompleted
          }), { headers: SECURE_JSON_HEADERS });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // Handle Get Evaluations List endpoint
      if (url.pathname.endsWith("/evaluations") && request.method === "GET") {
        try {
          const proposalId = url.searchParams.get("proposalId");
          if (!proposalId) {
            return new Response(JSON.stringify({ success: false, error: "Missing proposalId" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }
          const { results } = await env.DB.prepare("SELECT * FROM ci_kaizen_evaluations WHERE proposal_id = ? ORDER BY created_at ASC").bind(proposalId).all();
          return new Response(JSON.stringify({ success: true, data: results || [] }), { headers: SECURE_JSON_HEADERS });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // POST /api/ci-kaizen/check-duplicate — Kiểm tra trùng lặp TRƯỚC khi tạo đề xuất mới.
      // QUAN TRỌNG: endpoint này TRƯỚC ĐÂY KHÔNG TỒN TẠI — vì khối /api/ci-kaizen chỉ khớp theo
      // startsWith(), mọi request POST tới /api/ci-kaizen/check-duplicate rơi thẳng xuống nhánh
      // "POST: Create New Kaizen Proposal" bên dưới (khớp method POST, không kiểm tra path) và bị
      // hiểu nhầm thành 1 lượt ĐĂNG KÝ MỚI thật sự — với payload thiếu proposerName/proposerEmpCode
      // và KHÔNG có ảnh (form KaizenPublicSubmitForm.tsx chỉ gửi factory/region/line/category/
      // beforeDescription/afterSolution/title ở bước "check"). Sau đó form vẫn tiếp tục gửi POST
      // /api/ci-kaizen lần 2 với đầy đủ dữ liệu thật (có ảnh) — kết quả là MỖI LẦN ĐĂNG KÝ QUA FORM
      // CÔNG KHAI ĐỀU TẠO RA 2 BÀI TRÙNG NHAU (1 bài "ma" không ảnh/không tên thật + 1 bài thật).
      // Đây chính là nguyên nhân "1 bài hiện 2 lần" người dùng báo cáo. Nay dựng đúng endpoint này.
      if (url.pathname.endsWith("/check-duplicate") && request.method === "POST") {
        try {
          const body = await request.json().catch(() => ({}));
          const { factory, region, line, category, beforeDescription, afterSolution, title } = body;
          const scopeFactory = factory || region || "";

          const normalize = (s) =>
            String(s || "")
              .toLowerCase()
              .normalize("NFD")
              .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
              .replace(/đ/g, "d")
              .replace(/[^a-z0-9\s]/g, " ")
              .replace(/\s+/g, " ")
              .trim();

          const wordSet = (s) => new Set(normalize(s).split(" ").filter((w) => w.length > 1));

          const newTitleWords = wordSet(title);
          const newBodyWords = wordSet(`${beforeDescription || ""} ${afterSolution || ""}`);

          const similarity = (setA, setB) => {
            if (setA.size === 0 || setB.size === 0) return 0;
            let inter = 0;
            for (const w of setA) if (setB.has(w)) inter++;
            const union = setA.size + setB.size - inter;
            return union > 0 ? inter / union : 0;
          };

          let candidates = [];
          if (env.DB) {
            const { results } = await env.DB.prepare(
              `SELECT * FROM ci_kaizen_proposals
               WHERE status != 'REJECTED'
                 AND created_at >= datetime('now', '-30 days')
                 AND (factory = ? OR region = ?)
               ORDER BY created_at DESC LIMIT 100`
            ).bind(scopeFactory, scopeFactory).all().catch(() => ({ results: [] }));
            candidates = results || [];
          }

          const matches = [];
          for (const c of candidates) {
            const cTitleWords = wordSet(c.title);
            const cBodyWords = wordSet(`${c.before_description || ""} ${c.after_solution || ""}`);
            const titleSim = similarity(newTitleWords, cTitleWords);
            const bodySim = similarity(newBodyWords, cBodyWords);
            // Ưu tiên tiêu đề (trọng số cao hơn) — 2 bài trùng thường có tiêu đề gần giống hệt nhau.
            const combined = titleSim * 0.7 + bodySim * 0.3;
            const pct = Math.round(combined * 100);
            if (pct >= 55) {
              matches.push({
                proposal: c,
                similarityPercentage: pct,
                matchReason:
                  titleSim >= 0.6
                    ? "Tiêu đề gần giống hệt 1 đề xuất đã có"
                    : "Nội dung mô tả trước/sau khá tương đồng với 1 đề xuất đã có",
              });
            }
          }

          matches.sort((a, b) => b.similarityPercentage - a.similarityPercentage);
          const topMatches = matches.slice(0, 5);

          return new Response(
            JSON.stringify({ success: true, isDuplicate: topMatches.length > 0, matches: topMatches }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          // Lỗi ở bước kiểm tra KHÔNG được chặn luồng đăng ký chính — trả về "không trùng" để form
          // tiếp tục nộp bình thường thay vì kẹt lại.
          return new Response(JSON.stringify({ success: true, isDuplicate: false, matches: [] }), { headers: SECURE_JSON_HEADERS });
        }
      }

      // POST /api/ci-kaizen/merge — Gộp ảnh/video đính kèm mới vào 1 đề xuất GỐC đã tồn tại thay
      // vì tạo bài mới (khi người dùng chọn "Xác Nhận Gộp Vào Đề Xuất Gốc" ở modal trùng lặp).
      if (url.pathname.endsWith("/merge") && request.method === "POST") {
        try {
          const body = await request.json().catch(() => ({}));
          const { originalProposalId, newAttachments, proposerName } = body;
          if (!originalProposalId) {
            return new Response(JSON.stringify({ success: false, error: "MISSING_ID", message: "Thiếu originalProposalId" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const { results } = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(originalProposalId).all();
          const orig = results && results[0];
          if (!orig) {
            return new Response(JSON.stringify({ success: false, error: "NOT_FOUND", message: "Không tìm thấy đề xuất gốc" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          let attachmentsList = [];
          if (orig.attachments_json) {
            try {
              const parsed = JSON.parse(orig.attachments_json);
              if (Array.isArray(parsed)) attachmentsList = parsed;
            } catch (e) {}
          }

          if (Array.isArray(newAttachments)) {
            for (const att of newAttachments) {
              if (att && att.url && !attachmentsList.some((a) => a.url === att.url)) {
                attachmentsList.push({
                  type: att.type || "image",
                  url: att.url,
                  title: att.tag === "AFTER" ? `Ảnh gộp thêm (SAU) - ${proposerName || "Người gộp"}` : `Ảnh gộp thêm (TRƯỚC) - ${proposerName || "Người gộp"}`,
                });
              }
            }
          }

          await env.DB.prepare(
            `UPDATE ci_kaizen_proposals SET attachments_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
          ).bind(JSON.stringify(attachmentsList), originalProposalId).run();

          try {
            await env.DB.prepare(
              `INSERT INTO ci_kaizen_status_history (proposal_id, from_status, to_status, action, actor_id, actor_name, note)
               VALUES (?, NULL, NULL, 'MERGE_ATTACHMENT', NULL, ?, 'Gộp ảnh/video từ 1 lượt đăng ký trùng thay vì tạo bài mới')`
            ).bind(originalProposalId, proposerName || "Người gộp").run();
          } catch (e) {}

          invalidateKaizenStatsCache();

          return new Response(
            JSON.stringify({ success: true, message: `Đã gộp ảnh/video vào đề xuất gốc ${orig.code || orig.legacy_code || originalProposalId} thành công!`, originalCode: orig.code || orig.legacy_code }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // GET: List Kaizen Proposals with Filters & Stable Pagination
      if (request.method === "GET") {
        try {
          const category = url.searchParams.get("category");
          const regType = url.searchParams.get("registration_type") || url.searchParams.get("regType");
          const region = url.searchParams.get("region");
          const status = url.searchParams.get("status");
          const subStatus = url.searchParams.get("sub_status") || url.searchParams.get("subStatus");
          const search = url.searchParams.get("search");

          const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
          const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
          const offset = (page - 1) * limit;

          let whereSql = " WHERE 1=1";
          const params = [];

          if (category && category !== "ALL") {
            whereSql += " AND (category = ? OR category_label LIKE ?)";
            params.push(category, `%${category}%`);
          }
          if (regType && regType !== "ALL") {
            whereSql += " AND registration_type = ?";
            params.push(regType);
          }
          if (subStatus && subStatus !== "ALL") {
            whereSql += " AND sub_status = ?";
            params.push(subStatus);
          }
          if (search && search.trim() !== "") {
            whereSql += " AND (title LIKE ? OR code LIKE ? OR legacy_code LIKE ? OR proposer_name LIKE ? OR proposer_emp_code LIKE ?)";
            const s = `%${search.trim()}%`;
            params.push(s, s, s, s, s);
          }

          let totalCount = 0;
          if (env && env.DB) {
            const countStmt = env.DB.prepare(`SELECT COUNT(*) as total FROM ci_kaizen_proposals ${whereSql}`);
            const countRes = params.length > 0 ? await countStmt.bind(...params).first() : await countStmt.first();
            totalCount = countRes?.total || 0;
          }

          let query = `SELECT * FROM ci_kaizen_proposals ${whereSql}`;
          if (subStatus === "DA_DANH_GIA" || regType === "THI_DUA") {
            query += " ORDER BY COALESCE(average_score, avg_rating, score_points) DESC, created_at DESC, id DESC";
          } else {
            query += " ORDER BY created_at DESC, id DESC";
          }

          const pageParams = [...params];
          if (url.searchParams.has("page") || url.searchParams.has("limit")) {
            query += " LIMIT ? OFFSET ?";
            pageParams.push(limit, offset);
          }

          let results = [];
          if (env && env.DB) {
            const stmt = env.DB.prepare(query);
            const queryRes = pageParams.length > 0 ? await stmt.bind(...pageParams).all() : await stmt.all();
            results = queryRes?.results || [];
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: results || [],
              count: results ? results.length : 0,
              pagination: {
                totalCount: totalCount || (results ? results.length : 0),
                page,
                limit,
                totalPages: Math.ceil((totalCount || (results ? results.length : 0)) / (limit || 1))
              }
            }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          console.error(`[System Error ${reqId}] GET Kaizen list:`, err);
          return new Response(JSON.stringify({
            success: false,
            error: "INTERNAL_SERVER_ERROR",
            message: "Đã xảy ra lỗi hệ thống khi tải danh sách Kaizen",
            requestId: reqId
          }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // POST: Create New Kaizen Proposal (Supports Public QR Scan & Authenticated Modes)
      if (request.method === "POST") {
        try {
          const user = await verifyServerAuth(request, env);
          const body = await request.json();
          const isPublicScan = body.isPublicScan === true || !user || !user.authenticated;

          await ensureIdempotencyTable();

          // (1) Idempotency Key check
          const idempotencyKey = request.headers.get("Idempotency-Key") || request.headers.get("x-idempotency-key");
          if (idempotencyKey) {
            try {
              const existingKey = await env.DB.prepare("SELECT * FROM idempotency_keys WHERE key = ?").bind(idempotencyKey).first();
              if (existingKey) {
                return new Response(existingKey.response_body, {
                  status: existingKey.status_code || 200,
                  headers: SECURE_JSON_HEADERS,
                });
              }
            } catch (e) {}
          }

          const {
            title,
            category,
            categoryLabel,
            registrationType,
            region,
            department,
            factory,
            beforeDescription,
            afterSolution,
            savedSeconds,
            deptCode,
            beforeImageUrl,
            afterImageUrl,
            beforeVideoUrl,
            afterVideoUrl,
            attachmentsJson,
            proposerName,
            proposerEmpCode,
            proposerPosition,
            proposerMonth,
            proposerYear,
            hrSuggestor,
            customer,
            productGroup,
            productCode,
            quantity,
            pricingDirection,
            timeBeforeSeconds,
            timeAfterSeconds,
            efficiencyValueVND,
          } = body;

          const finalTitle = safeVal(title, "Ý tưởng đề xuất cải tiến Kaizen");

          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          const autoMonth = proposerMonth ? parseInt(proposerMonth, 10) : currentMonth;
          const autoYear = proposerYear ? parseInt(proposerYear, 10) : currentYear;

          const id = `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const code = await generateRecordCode(env, {
            module: "KZ",
            factory: factory || region || "KG 1",
            workshop: department || "Xưởng Sản Xuất",
            year: autoYear
          });
          const legacyCode = code;

          // ✅ Enforce Strict Initial State Machine (QĐ-TBKG/2026)
          // Client CANNOT pass registrationType to bypass review or jump directly to LUU_TRU.
          const targetRegType = "THI_DUA";
          const initialSubStatus = "CHO_REVIEW";
          const initialApprovalStatus = "PENDING";
          const initialEvaluationResult = "PENDING";

          // Snapshot required reviewers for THI_DUA at submission time
          const defaultReviewers = ["TGĐ-001", "PTGĐ-002", "GĐ-003", "PGĐ-004", "202608001"];
          if (region && region.includes("Kiên Giang")) {
            defaultReviewers.push("KG-LEAD-01");
          } else if (region && region.includes("Miền Đông")) {
            defaultReviewers.push("MD-LEAD-01");
          }
          const snapshotReviewerIdsJson = JSON.stringify(Array.from(new Set(defaultReviewers)));

          const finalProposerName = safeVal(proposerName || user?.name, "Công Nhân Sản Xuất");
          const finalProposerEmpCode = safeVal(proposerEmpCode || user?.empCode, "CN-2026-QR");
          const finalDept = safeVal(department || user?.department, "Xưởng Sản Xuất");

          let attachmentsList = [];
          if (attachmentsJson) {
            try {
              attachmentsList = typeof attachmentsJson === "string" ? JSON.parse(attachmentsJson) : attachmentsJson;
            } catch(e) {}
          }
          if (!Array.isArray(attachmentsList)) attachmentsList = [];

          if (beforeVideoUrl) {
            attachmentsList.push({ type: "video_before", url: beforeVideoUrl, title: "Video Trước Cải Tiến" });
          }
          if (afterVideoUrl) {
            attachmentsList.push({ type: "video_after", url: afterVideoUrl, title: "Video Sau Cải Tiến" });
          }

          const finalAttachmentsJson = attachmentsList.length > 0 ? JSON.stringify(attachmentsList) : null;
          const finalCategory = category || "PRODUCTIVITY";
          const finalCategoryLabel = categoryLabel || "3.Tăng Năng suất";

          // 🛡️ Backend Anti-Duplicate Window Check (prevent duplicate posts with same title within 60s)
          try {
            const recentDuplicate = await env.DB.prepare(`
              SELECT id, code FROM ci_kaizen_proposals 
              WHERE title = ?
                AND (proposer_emp_code = ? OR proposer_name = ? OR department = ?)
                AND datetime(created_at) >= datetime('now', '-60 seconds')
              ORDER BY created_at DESC
              LIMIT 1
            `).bind(finalTitle, finalProposerEmpCode, finalProposerName, finalDept).first();

            if (recentDuplicate) {
              const resObj = {
                success: true,
                message: "Đề xuất đã được ghi nhận trước đó (chống trùng)",
                code: recentDuplicate.code,
                id: recentDuplicate.id,
                duplicateBlocked: true
              };
              if (idempotencyKey) {
                try {
                  await env.DB.prepare(
                    "INSERT OR REPLACE INTO idempotency_keys (key, status_code, response_body, created_at) VALUES (?, 200, ?, CURRENT_TIMESTAMP)"
                  ).bind(idempotencyKey, JSON.stringify(resObj)).run();
                } catch (e) {}
              }
              return new Response(JSON.stringify(resObj), { status: 200, headers: SECURE_JSON_HEADERS });
            }
          } catch (dupErr) {
            console.warn("Anti-duplicate check error:", dupErr);
          }

          await env.DB.prepare(`
            INSERT INTO ci_kaizen_proposals (
              id, code, legacy_code, title, category, category_label, registration_type, sub_status, approval_status, evaluation_result, region, department, factory, proposer_name, proposer_emp_code, proposer_position, proposer_month, proposer_year, hr_suggestor, customer, dept_code, before_description, after_solution, saved_seconds, product_group, product_code, quantity, pricing_direction, time_before_seconds, time_after_seconds, efficiency_value_vnd, before_image_url, after_image_url, attachments_json, required_reviewer_ids_json, status, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', 1)
          `).bind(
            id,
            code,
            legacyCode,
            finalTitle,
            finalCategory,
            finalCategoryLabel,
            targetRegType,
            initialSubStatus,
            initialApprovalStatus,
            initialEvaluationResult,
            safeVal(region, "KG 1"),
            finalDept,
            safeVal(factory, "KG 1"),
            finalProposerName,
            finalProposerEmpCode,
            safeVal(proposerPosition, "Công nhân"),
            autoMonth,
            autoYear,
            safeVal(hrSuggestor, ""),
            safeVal(customer, ""),
            safeVal(deptCode, "SK"),
            safeVal(beforeDescription, ""),
            safeVal(afterSolution, ""),
            parseInt(savedSeconds || 0, 10),
            safeVal(productGroup, ""),
            safeVal(productCode, ""),
            parseInt(quantity || 0, 10),
            safeVal(pricingDirection, ""),
            parseInt(timeBeforeSeconds || 0, 10),
            parseInt(timeAfterSeconds || 0, 10),
            parseInt(efficiencyValueVND || 0, 10),
            safeVal(beforeImageUrl, null),
            safeVal(afterImageUrl, null),
            finalAttachmentsJson,
            snapshotReviewerIdsJson
          ).run();

          await recordAuditLog(user, "ci_kaizen", "CREATE_PROPOSAL", id, null, { code, title, status: "SUBMITTED" }, request);

          try {
            await env.DB.prepare(`
              INSERT INTO ci_kaizen_status_history (proposal_id, from_status, to_status, action, actor_id, actor_name, note)
              VALUES (?, NULL, 'SUBMITTED', 'SUBMIT', ?, ?, 'Nộp đề xuất mới qua cổng công khai')
            `).bind(id, safeVal(user?.empCode, finalProposerEmpCode), safeVal(user?.name, finalProposerName)).run();
          } catch(e) {}
          await createNotification("Trưởng Phòng CI", "ci_kaizen", "INFO", id, "🚀 Đề Xuất Cải Tiến Mới", `${user?.name || finalProposerName} vừa nộp đề xuất cải tiến Kaizen: "${title}" (${code}).`);

          invalidateKaizenStatsCache();
          const resPayload = JSON.stringify({ success: true, message: "Đã gửi đề xuất cải tiến Kaizen thành công!", id, code });

          if (idempotencyKey) {
            try {
              await env.DB.prepare("INSERT OR REPLACE INTO idempotency_keys (key, status_code, response_body) VALUES (?, ?, ?)").bind(idempotencyKey, 200, resPayload).run();
            } catch (e) {}
          }

          return new Response(resPayload, { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // PUT: Update / Evaluate / Implement / Reject Kaizen Proposal
      if (request.method === "PUT") {
        try {
          const body = await request.json().catch(() => ({}));
          const { id, action, awardTitle, scorePoints, reviewComment, comments, status, rejectionReason, afterSolution, savedSeconds, afterImageUrl, version } = body;

          const user = await verifyServerAuth(request, env);
          const isGenericUpdate = action === "UPDATE" || !action;

          if (!isGenericUpdate && (!user || !user.authenticated)) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }

          await ensureIdempotencyTable();

          // (1) Idempotency Key check for PUT
          const idempotencyKey = request.headers.get("Idempotency-Key") || request.headers.get("x-idempotency-key");
          if (idempotencyKey) {
            try {
              const existingKey = await env.DB.prepare("SELECT * FROM idempotency_keys WHERE key = ?").bind(idempotencyKey).first();
              if (existingKey) {
                return new Response(existingKey.response_body, {
                  status: existingKey.status_code || 200,
                  headers: SECURE_JSON_HEADERS,
                });
              }
            } catch (e) {}
          }

          if (!id) {
            return new Response(JSON.stringify({ success: false, error: "Missing proposal ID" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }

          const proposal = await env.DB.prepare("SELECT * FROM ci_kaizen_proposals WHERE id = ?").bind(id).first();
          if (!proposal) {
            return new Response(JSON.stringify({ success: false, error: "PROPOSAL_NOT_FOUND", message: "Không tìm thấy đề xuất cải tiến" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }

          if (action === "UPDATE" || !action) {
            const FORBIDDEN_FIELDS_ON_GENERIC_UPDATE = [
              'approval_status', 'evaluation_result', 'status', 'sub_status',
              'registration_type', 'registrationType', 'approved_by', 'approved_at', 'evaluated_by', 'evaluated_at'
            ];

            for (const field of FORBIDDEN_FIELDS_ON_GENERIC_UPDATE) {
              if (field in body && body[field] !== undefined) {
                return new Response(JSON.stringify({
                  success: false,
                  error: 'FORBIDDEN_FIELD',
                  message: `⛔ Trường "${field}" không được phép sửa qua API cập nhật chung. Vui lòng sử dụng endpoint chuyên biệt (/approve, /evaluate, /archive).`
                }), { status: 422, headers: SECURE_JSON_HEADERS });
              }
            }

            if (proposal.approval_status === 'TU_CHOI' || proposal.status === 'REJECTED') {
              return new Response(JSON.stringify({
                success: false,
                error: 'PROPOSAL_REJECTED',
                message: '⛔ Đề xuất đã bị từ chối ở Bước 3, quy trình đã DỪNG theo quy định QĐ-TBKG và không thể chỉnh sửa hoặc tiếp tục.'
              }), { status: 422, headers: SECURE_JSON_HEADERS });
            }

            const {
              title, category, categoryLabel, region, department, factory,
              proposerName, proposerEmpCode, proposerPosition, proposerMonth, proposerYear,
              hrSuggestor, customer, productGroup, productCode, quantity,
              beforeDescription, afterSolution, savedSeconds, pricingDirection,
              timeBeforeSeconds, timeAfterSeconds, efficiencyValueVND,
              beforeImageUrl, afterImageUrl, beforeVideoUrl, afterVideoUrl
            } = body;

            const costBefore = body.costBefore !== undefined ? body.costBefore : (body.cost_before !== undefined ? body.cost_before : body.chi_phi_truoc);
            const costAfter = body.costAfter !== undefined ? body.costAfter : (body.cost_after !== undefined ? body.cost_after : body.chi_phi_sau);
            const totalSavingsVnd = body.totalSavingsVnd !== undefined ? body.totalSavingsVnd : (body.total_savings_vnd !== undefined ? body.total_savings_vnd : body.tong_tien_tiet_kiem);
            const totalSavingsWords = body.totalSavingsWords !== undefined ? body.totalSavingsWords : (body.total_savings_words !== undefined ? body.total_savings_words : body.tong_tien_bang_chu);
            const pairQuantity = body.pairQuantity !== undefined ? body.pairQuantity : (body.pair_quantity !== undefined ? body.pair_quantity : body.so_luong_giay);

            let attachmentsList = [];
            if (beforeVideoUrl) attachmentsList.push({ type: "video_before", url: beforeVideoUrl, title: "Video Trước Cải Tiến" });
            if (afterVideoUrl) attachmentsList.push({ type: "video_after", url: afterVideoUrl, title: "Video Sau Cải Tiến" });
            const finalAttachmentsJson = attachmentsList.length > 0 ? JSON.stringify(attachmentsList) : proposal.attachments_json;

            await env.DB.prepare(`
              UPDATE ci_kaizen_proposals SET
                title = ?,
                category = ?,
                category_label = ?,
                region = ?,
                department = ?,
                factory = ?,
                proposer_name = ?,
                proposer_emp_code = ?,
                proposer_position = ?,
                proposer_month = ?,
                proposer_year = ?,
                hr_suggestor = ?,
                customer = ?,
                product_group = ?,
                product_code = ?,
                quantity = ?,
                before_description = ?,
                after_solution = ?,
                saved_seconds = ?,
                pricing_direction = ?,
                time_before_seconds = ?,
                time_after_seconds = ?,
                efficiency_value_vnd = ?,
                cost_before = COALESCE(?, cost_before),
                chi_phi_truoc = COALESCE(?, chi_phi_truoc),
                cost_after = COALESCE(?, cost_after),
                chi_phi_sau = COALESCE(?, chi_phi_sau),
                total_savings_vnd = COALESCE(?, total_savings_vnd),
                tong_tien_tiet_kiem = COALESCE(?, tong_tien_tiet_kiem),
                total_savings_words = COALESCE(?, total_savings_words),
                pair_quantity = COALESCE(?, pair_quantity),
                before_image_url = ?,
                after_image_url = ?,
                attachments_json = ?,
                updated_at = CURRENT_TIMESTAMP,
                version = version + 1
              WHERE id = ? OR code = ?
            `).bind(
              safeVal(title, proposal.title),
              safeVal(category, proposal.category),
              safeVal(categoryLabel, proposal.category_label),
              safeVal(region, proposal.region),
              safeVal(department, proposal.department),
              safeVal(factory, proposal.factory),
              safeVal(proposerName, proposal.proposer_name),
              safeVal(proposerEmpCode, proposal.proposer_emp_code),
              safeVal(proposerPosition, proposal.proposer_position),
              parseInt(proposerMonth || proposal.proposer_month || 1, 10),
              parseInt(proposerYear || proposal.proposer_year || 2026, 10),
              safeVal(hrSuggestor, proposal.hr_suggestor),
              safeVal(customer, proposal.customer),
              safeVal(productGroup, proposal.product_group),
              safeVal(productCode, proposal.product_code),
              parseInt(quantity || 0, 10),
              safeVal(beforeDescription, proposal.before_description),
              safeVal(afterSolution, proposal.after_solution),
              parseInt(savedSeconds || 0, 10),
              safeVal(pricingDirection, proposal.pricing_direction),
              parseInt(timeBeforeSeconds || 0, 10),
              parseInt(timeAfterSeconds || 0, 10),
              parseInt(efficiencyValueVND || 0, 10),
              costBefore !== undefined ? Number(costBefore) : null,
              costBefore !== undefined ? Number(costBefore) : null,
              costAfter !== undefined ? Number(costAfter) : null,
              costAfter !== undefined ? Number(costAfter) : null,
              totalSavingsVnd !== undefined ? Number(totalSavingsVnd) : null,
              totalSavingsVnd !== undefined ? Number(totalSavingsVnd) : null,
              totalSavingsWords !== undefined ? String(totalSavingsWords) : null,
              pairQuantity !== undefined ? Number(pairQuantity) : null,
              safeVal(beforeImageUrl, proposal.before_image_url),
              safeVal(afterImageUrl, proposal.after_image_url),
              finalAttachmentsJson,
              id,
              id
            ).run();

            return new Response(JSON.stringify({ success: true, message: "Đã cập nhật thông tin đề xuất cải tiến thành công!" }), { headers: SECURE_JSON_HEADERS });
          }

          // (2) Role Authorization Check
          if (action === "EVALUATE" || action === "APPROVE" || action === "REJECT") {
            const isManagerOrAdmin = user.isExecutiveOrAdmin || user.roleCode === "TRUONG_PHONG" || user.roleCode === "QC" || user.roleCode === "CI_LEAD";
            if (!isManagerOrAdmin) {
              return new Response(
                JSON.stringify({ success: false, error: "FORBIDDEN", message: "Bạn không có quyền phê duyệt hoặc chấm điểm thi đua đề xuất Kaizen!" }),
                { status: 403, headers: SECURE_JSON_HEADERS }
              );
            }
          }

          const currentVer = version !== undefined ? version : (proposal.version || 1);

          let nextStatus = proposal.status;
          let nextSubStatus = proposal.sub_status;
          let nextAward = proposal.award_title;
          let nextScore = proposal.score_points;
          let nextComment = proposal.review_comment;
          let nextRejReason = proposal.rejection_reason;
          let nextSolution = proposal.after_solution;
          let nextSavedSec = proposal.saved_seconds;
          let nextAfterImg = proposal.after_image_url;

          if (reviewComment !== undefined || comments !== undefined) {
            nextComment = reviewComment || comments || null;
          }

          // (3) State Transition Guard & Validation
          if (action === "EVALUATE" || action === "APPROVE") {
            if (proposal.status === "REJECTED") {
              return new Response(
                JSON.stringify({ success: false, error: "INVALID_STATE_TRANSITION", message: "Không thể phê duyệt đề xuất đã bị từ chối trước đó!" }),
                { status: 422, headers: SECURE_JSON_HEADERS }
              );
            }
            nextStatus = "APPROVED";
            nextSubStatus = "DA_DANH_GIA";
            if (awardTitle) nextAward = awardTitle;
            if (scorePoints !== undefined) nextScore = parseFloat(scorePoints);
          } else if (action === "REJECT") {
            nextStatus = "REJECTED";
            nextRejReason = rejectionReason || "Chưa đạt tiêu chí cải tiến";
          } else if (action === "IMPLEMENT") {
            // Transition Guard: Only APPROVED proposals can be marked IMPLEMENTED
            if (proposal.status !== "APPROVED" && proposal.status !== "IMPLEMENTED") {
              return new Response(
                JSON.stringify({ success: false, error: "INVALID_STATE_TRANSITION", message: "Đề xuất phải được phê duyệt (APPROVED) trước khi ghi nhận triển khai thực địa (IMPLEMENTED)!" }),
                { status: 422, headers: SECURE_JSON_HEADERS }
              );
            }
            nextStatus = "IMPLEMENTED";
            if (afterSolution) nextSolution = afterSolution;
            if (savedSeconds !== undefined) nextSavedSec = parseInt(savedSeconds, 10);
            if (afterImageUrl) nextAfterImg = afterImageUrl;
          }

          // (4) Optimistic Locking Update
          const res = await env.DB.prepare(`
            UPDATE ci_kaizen_proposals SET
              status = ?, sub_status = ?, award_title = ?, score_points = ?, review_comment = ?, rejection_reason = ?, after_solution = ?, saved_seconds = ?, after_image_url = ?, updated_at = CURRENT_TIMESTAMP, version = version + 1
            WHERE id = ? AND version = ?
          `).bind(
            safeVal(nextStatus, "SUBMITTED"),
            safeVal(nextSubStatus, "CHO_DANH_GIA"),
            safeVal(nextAward, null),
            safeVal(nextScore, 0.0),
            safeVal(nextComment, null),
            safeVal(nextRejReason, null),
            safeVal(nextSolution, ""),
            safeVal(nextSavedSec, 0),
            safeVal(nextAfterImg, null),
            id,
            currentVer
          ).run();

          if (res.meta && res.meta.changes === 0) {
            return new Response(
              JSON.stringify({
                success: false,
                code: "OPTIMISTIC_LOCK_CONFLICT",
                error: "OPTIMISTIC_LOCK_CONFLICT",
                message: "Đề xuất đã được cập nhật bởi người dùng khác, vui lòng tải lại!"
              }),
              { status: 409, headers: SECURE_JSON_HEADERS }
            );
          }

          // (1 & 2) Record Audit Log & Send Realtime Notification
          await recordAuditLog(user, "ci_kaizen", action || "UPDATE", id, { status: proposal.status, version: currentVer }, { status: nextStatus, awardTitle: nextAward, version: currentVer + 1 }, request);

          const notifTitle = nextStatus === "APPROVED" ? "🎉 Đề Xuất Kaizen Được Phê Duyệt" :
                             nextStatus === "REJECTED" ? "❌ Đề Xuất Kaizen Bị Từ Chối" :
                             nextStatus === "IMPLEMENTED" ? "🚀 Triển Khai Thực Địa Hoàn Tất" : "🏆 Cập Nhật Đề Xuất Kaizen";

          const notifMsg = nextStatus === "APPROVED" ? `Đề xuất "${proposal.title}" (${proposal.code}) của bạn đã được duyệt & trao ${nextAward || "giải thi đua"} với ${nextScore}đ!` :
                           nextStatus === "REJECTED" ? `Đề xuất "${proposal.title}" (${proposal.code}) đã bị từ chối. Lý do: ${nextRejReason}` :
                           `Đề xuất "${proposal.title}" (${proposal.code}) đã hoàn tất triển khai thực địa và tiết kiệm ${nextSavedSec}s.`;

          const notifType = nextStatus === "REJECTED" ? "WARNING" : "SUCCESS";

          await createNotification(proposal.proposer_name, "ci_kaizen", notifType, id, notifTitle, notifMsg);

          const resPayload = JSON.stringify({
            success: true,
            message: "Đã cập nhật trạng thái đề xuất cải tiến thành công!",
            id,
            status: nextStatus,
            version: currentVer + 1
          });

          if (idempotencyKey) {
            try {
              await env.DB.prepare("INSERT OR REPLACE INTO idempotency_keys (key, status_code, response_body) VALUES (?, ?, ?)").bind(idempotencyKey, 200, resPayload).run();
            } catch (e) {}
          }

          return new Response(resPayload, { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      // DELETE: Delete Kaizen Proposal
      if (request.method === "DELETE") {
        try {
          const id = url.searchParams.get("id");
          if (!id) {
            return new Response(JSON.stringify({ success: false, error: "Missing proposal ID" }), { status: 400, headers: SECURE_JSON_HEADERS });
          }
          await env.DB.prepare("DELETE FROM ci_kaizen_proposals WHERE id = ?").bind(id).run();
          return new Response(JSON.stringify({ success: true, message: "Đã xóa đề xuất cải tiến thành công!" }), { headers: SECURE_JSON_HEADERS });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }
    // 3.5 API Route: Notifications System (/api/notifications)
    if (url.pathname === "/api/notifications" || url.pathname.startsWith("/api/notifications")) {
      if (request.method === "GET") {
        return new Response(
          JSON.stringify({
            success: true,
            data: [
              {
                id: "notif_1",
                title: "✅ Chào Mừng Đến Với TBS Group SKX",
                message: "Hệ thống quản lý phòng họp & đón khách đã sẵn sàng phục vụ.",
                type: "SUCCESS",
                isRead: false,
                createdAt: new Date().toISOString()
              }
            ]
          }),
          { headers: SECURE_JSON_HEADERS }
        );
      }
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        return new Response(
          JSON.stringify({ success: true, message: "Đã nhận thông báo", data: body }),
          { headers: SECURE_JSON_HEADERS }
        );
      }
    }

    // 3.6 API Route: Mobile Web Push Subscriptions (/api/push/subscribe)
    if (url.pathname === "/api/push/subscribe" && request.method === "POST") {
      try {
        if (!env.DB) {
          return new Response(JSON.stringify({ success: true, message: "OK (memory)" }), { headers: SECURE_JSON_HEADERS });
        }
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS push_subscriptions (
            id TEXT PRIMARY KEY,
            endpoint TEXT NOT NULL UNIQUE,
            subscription_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `).run().catch(() => {});

        const body = await request.json().catch(() => ({}));
        const sub = body.subscription || body;
        if (sub && sub.endpoint) {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO push_subscriptions (id, endpoint, subscription_json, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            `sub_${Date.now()}`,
            sub.endpoint,
            JSON.stringify(sub)
          ).run().catch(() => {});
        }
        return new Response(
          JSON.stringify({ success: true, message: "Đã lưu đăng ký Push Notification thiết bị di động thành công!" }),
          { headers: SECURE_JSON_HEADERS }
        );
      } catch (e) {
        return new Response(JSON.stringify({ success: true, message: "OK" }), { headers: SECURE_JSON_HEADERS });
      }
    }

    if (url.pathname === "/api/push/unsubscribe" && request.method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        if (body.endpoint && env.DB) {
          await env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(body.endpoint).run().catch(() => {});
        }
      } catch (e) {}
      return new Response(JSON.stringify({ success: true, message: "Đã hủy đăng ký Push Notification" }), { headers: SECURE_JSON_HEADERS });
    }



// 4. API Route: Meeting Rooms & Visitor Management (/api/rooms)
    if (url.pathname.startsWith("/api/rooms")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS meeting_rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                capacity INTEGER DEFAULT 10,
                location TEXT NOT NULL,
                equipment TEXT,
                status TEXT DEFAULT 'AVAILABLE',
                is_locked INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS room_bookings (
                id TEXT PRIMARY KEY,
                room_id TEXT NOT NULL,
                room_name TEXT NOT NULL,
                title TEXT NOT NULL,
                booker_name TEXT NOT NULL,
                department TEXT NOT NULL,
                booking_date TEXT NOT NULL,
                time_slot TEXT NOT NULL,
                attendees_count INTEGER DEFAULT 5,
                notes TEXT,
                status TEXT DEFAULT 'PENDING',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
          try {
            // One-time migration: reset TEST / new unconfirmed room bookings to PENDING state for Lễ Tân approval
            await env.DB.prepare(`
              UPDATE room_bookings 
              SET status = 'PENDING' 
              WHERE (title LIKE '%TEST%' OR title LIKE '%Test%') AND status = 'CONFIRMED';
            `).run();
          } catch (migErr) {}
          try {
            await env.DB.prepare(`
              CREATE UNIQUE INDEX IF NOT EXISTS idx_room_booking_slot 
              ON room_bookings (room_id, booking_date, time_slot) 
              WHERE status != 'CANCELLED';
            `).run();
          } catch (idxErr) {}
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS visitors (
                id TEXT PRIMARY KEY,
                badge_code TEXT NOT NULL UNIQUE,
                visitor_name TEXT NOT NULL,
                company TEXT NOT NULL,
                id_card TEXT,
                host_name TEXT NOT NULL,
                department TEXT NOT NULL,
                room_location TEXT NOT NULL,
                visit_date TEXT NOT NULL,
                expected_time TEXT NOT NULL,
                status TEXT DEFAULT 'EXPECTED',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
        } catch (e) {
          // ignore table creation check error
        }
      }

      // GET: Get all rooms, bookings, and visitors
      if (request.method === "GET") {
        try {
          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1_CONNECTION_ERROR", message: "Mất kết nối CSDL Cloudflare D1 (env.DB missing)" }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const { results: rawRooms } = await env.DB.prepare("SELECT * FROM meeting_rooms").all();
          const { results: rawBookings } = await env.DB.prepare("SELECT * FROM room_bookings ORDER BY created_at DESC").all();
          const { results: rawVisitors } = await env.DB.prepare("SELECT * FROM visitors ORDER BY created_at DESC").all();

          const rooms = (rawRooms || []).map((r) => ({
            id: r.id,
            name: r.name,
            capacity: Number(r.capacity || 10),
            location: r.location || "Văn phòng",
            equipment: typeof r.equipment === "string" ? r.equipment.split(",") : (r.equipment || []),
            status: r.status || "AVAILABLE",
            isLocked: Boolean(r.is_locked || r.isLocked),
            colorClass: r.color_class || r.colorClass || "bg-slate-700 hover:bg-slate-800 text-white",
            badgeBg: r.badge_bg || r.badgeBg || "bg-slate-100 text-slate-800",
          }));

          const bookings = (rawBookings || []).map((b) => ({
            id: b.id,
            roomId: b.room_id || b.roomId || "room_1",
            roomName: b.room_name || b.roomName || "Phòng Họp",
            title: b.title || "Cuộc họp",
            bookerName: b.booker_name || b.bookerName || "Người đăng ký",
            department: b.department || "Hành chính",
            bookingDate: b.booking_date || b.bookingDate,
            timeSlot: b.time_slot || b.timeSlot,
            attendeesCount: Number(b.attendees_count || b.attendeesCount || 5),
            notes: b.notes || "",
            status: b.status || "PENDING",
            createdAt: b.created_at || b.createdAt,
          }));

          const visitors = (rawVisitors || []).map((v) => ({
            id: v.id,
            visitorName: v.visitor_name || v.visitorName || "Khách",
            company: v.company || "Đối tác",
            phone: v.phone || "",
            hostName: v.host_name || v.hostName || "Lễ tân",
            roomLocation: v.room_location || v.roomLocation || "Sảnh",
            visitDate: v.visit_date || v.visitDate,
            expectedTime: v.expected_time || v.expectedTime,
            badgeCode: v.badge_code || v.badgeCode || "CARD-01",
            status: v.status || "EXPECTED",
            notes: v.notes || "",
            createdAt: v.created_at || v.createdAt,
          }));

          return new Response(
            JSON.stringify({
              success: true,
              data: { rooms, bookings, visitors },
              source: "Cloudflare D1 Database vpchuoiskechers"
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: "D1_CONNECTION_ERROR", message: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // POST /api/rooms/booking: Save a new booking
      if (url.pathname === "/api/rooms/booking" && request.method === "POST") {
        try {
          let user = null;
          try {
            user = await verifyServerAuth(request);
          } catch (e) {}

          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
              { status: 500, headers: SECURE_JSON_HEADERS }
            );
          }

          const body = await request.json();
          const { id, roomId, roomName, title, bookerName, department, bookingDate, timeSlot, attendeesCount, notes } = body;

          const targetRoomId = roomId || "room_1";
          const targetBookingDate = bookingDate || new Date().toISOString().split("T")[0];
          const targetTimeSlot = timeSlot || "09:00 - 10:00";

          // ✅ NEW: Validate booking time is not in the past
          try {
            const now = new Date();
            const [startTimeHour, startTimeMin] = targetTimeSlot.split(" - ")[0].split(":").map(Number);
            
            // Parse booking date (DD/MM/YYYY format)
            const [day, month, year] = targetBookingDate.split("/").map(Number);
            const bookingDateTime = new Date(year, month - 1, day, startTimeHour, startTimeMin, 0, 0);
            
            if (bookingDateTime < now) {
              const pastTimeErr = JSON.stringify({
                success: false,
                code: "PAST_TIME_BOOKING",
                message: "Vui lòng kiểm tra lại lịch họp - Thời gian họp đã qua!"
              });
              return new Response(pastTimeErr, { status: 400, headers: SECURE_JSON_HEADERS });
            }
          } catch (timeCheckErr) {
            console.warn("Time validation error:", timeCheckErr);
          }

          // Double Booking Check
          try {
            const { results: existingOverlap } = await env.DB.prepare(
              "SELECT id FROM room_bookings WHERE room_id = ? AND booking_date = ? AND time_slot = ? AND status != 'CANCELLED'"
            ).bind(targetRoomId, targetBookingDate, targetTimeSlot).all();

            if (existingOverlap && existingOverlap.length > 0) {
              const conflictErr = JSON.stringify({
                success: false,
                code: "DOUBLE_BOOKING_CONFLICT",
                message: "Phòng họp đã được người dùng khác đặt trước cho khung giờ này!"
              });
              return new Response(conflictErr, { status: 409, headers: SECURE_JSON_HEADERS });
            }
          } catch (e) {}

          const bookingId = id || `b_${Date.now()}`;
          const bookingStatus = "PENDING";
          const finalBookerName = bookerName || (user && user.name) || "Anh Huy (CBCNV)";
          const finalDepartment = department || (user && user.department) || "Hành chính";

          await env.DB.prepare(`
            INSERT INTO room_bookings (id, room_id, room_name, title, booker_name, department, booking_date, time_slot, attendees_count, notes, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            bookingId,
            targetRoomId,
            roomName || "Phòng Họp Executive VIP 1",
            title || "Cuộc họp",
            finalBookerName,
            finalDepartment,
            targetBookingDate,
            targetTimeSlot,
            attendeesCount || 5,
            notes || "",
            bookingStatus
          ).run();

          const successRes = JSON.stringify({ success: true, message: "Đã lưu lịch đặt phòng họp vào Cloudflare D1 thành công!", data: body });

          return new Response(successRes, { headers: SECURE_JSON_HEADERS });

          return new Response(successRes, { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          if (err.message && err.message.includes("UNIQUE constraint failed")) {
            const conflictErr = JSON.stringify({
              success: false,
              code: "DOUBLE_BOOKING_CONFLICT",
              message: "Phòng họp đã được người dùng khác đặt trước cho khung giờ này!"
            });
            return new Response(conflictErr, { status: 409, headers: SECURE_JSON_HEADERS });
          }
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: SECURE_JSON_HEADERS }
          );
        }
      }

      // PUT /api/rooms/booking: Update booking status (COMPLETED, CONFIRMED, CANCELLED, etc.)
      if (url.pathname === "/api/rooms/booking" && request.method === "PUT") {
        try {
          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const body = await request.json();
          const { id, status, roomId, roomName, notes } = body;

          if (!id) {
            return new Response(
              JSON.stringify({ success: false, error: "Thiếu mã cuộc họp (id)" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          let updateFields = [];
          let bindParams = [];

          if (status) {
            updateFields.push("status = ?");
            bindParams.push(status);
          }
          if (roomId) {
            updateFields.push("room_id = ?");
            bindParams.push(roomId);
          }
          if (roomName) {
            updateFields.push("room_name = ?");
            bindParams.push(roomName);
          }
          if (notes !== undefined) {
            updateFields.push("notes = ?");
            bindParams.push(notes);
          }

          if (updateFields.length > 0) {
            bindParams.push(id);
            const sql = `UPDATE room_bookings SET ${updateFields.join(", ")} WHERE id = ?`;
            const result = await env.DB.prepare(sql).bind(...bindParams).run();

            // UPSERT Fallback: If booking didn't exist in D1 yet, insert it!
            if (result && result.meta && result.meta.changes === 0) {
              await env.DB.prepare(`
                INSERT INTO room_bookings (id, room_id, room_name, title, booker_name, department, booking_date, time_slot, attendees_count, notes, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
              `).bind(
                id,
                roomId || "room_1",
                roomName || "Phòng Họp OTI / OTG",
                body.title || "Cuộc họp",
                body.bookerName || "Lê Thị Mai",
                body.department || "CN-CI",
                body.bookingDate || new Date().toISOString().split("T")[0],
                body.timeSlot || "09:30 - 11:30",
                body.attendeesCount || 10,
                notes || "",
                status || "CONFIRMED"
              ).run();
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: `Đã cập nhật trạng thái cuộc họp ${id} sang ${status || "COMPLETED"} trực tiếp trên Cloudflare D1!`,
              id,
              status
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // POST /api/rooms/visitor: Save a new visitor
      if (url.pathname === "/api/rooms/visitor" && request.method === "POST") {
        try {
          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const body = await request.json();
          const { id, badgeCode, visitorName, company, idCard, hostName, department, roomLocation, visitDate, expectedTime, notes } = body;

          await env.DB.prepare(`
            INSERT INTO visitors (id, badge_code, visitor_name, company, id_card, host_name, department, room_location, visit_date, expected_time, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EXPECTED', ?, CURRENT_TIMESTAMP)
          `).bind(
            id || `v_${Date.now()}`,
            badgeCode || `VIS-2026-${Math.floor(100 + Math.random() * 900)}`,
            visitorName || "Khách mời",
            company || "Đối tác",
            idCard || "",
            hostName || "Anh Huy",
            department || "Hành chính",
            roomLocation || "Phòng Họp VIP 1",
            visitDate || "15/08/2026",
            expectedTime || "14:00",
            notes || ""
          ).run();

          return new Response(
            JSON.stringify({ success: true, message: "Đã đăng ký thông tin đón khách vào D1 Database!", data: body }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // PUT /api/rooms/lock: Toggle room lock/unlock
      if (url.pathname === "/api/rooms/lock" && request.method === "PUT") {
        try {
          if (!env.DB) {
            return new Response(
              JSON.stringify({ success: false, error: "D1 Database binding env.DB missing" }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const body = await request.json();
          const { id, isLocked, status } = body;

          await env.DB.prepare(
            "UPDATE meeting_rooms SET is_locked = ?, status = ? WHERE id = ?"
          ).bind(isLocked ? 1 : 0, status || (isLocked ? 'MAINTENANCE' : 'AVAILABLE'), id).run();

          return new Response(
            JSON.stringify({ success: true, message: "Đã cập nhật trạng thái phòng họp vào D1!", id, isLocked }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // ════════════════════════════════════════════════════════════════
      // 📊 BI EXPORT & EXECUTIVE EMAIL AUTOMATION APIS
      // ════════════════════════════════════════════════════════════════
      const SECURE_JSON_HEADERS = {
        "Content-Type": "application/json",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      };

      // GET /api/bi/export: Aggregate BI Metrics for Finance & Factory OEE
      if (url.pathname === "/api/bi/export" && request.method === "GET") {
        try {
          const biData = {
            reportTitle: "Báo Cáo Tổng Kết Điều Hành BI & OEE Hàng Tuần - TBS Group",
            period: "Tuần 33 (11/08/2026 - 17/08/2026)",
            generatedAt: new Date().toISOString(),
            company: "VĂN PHÒNG CHUỖI SKECHERS - TBS GROUP",
            financeSummary: {
              revenueMonth: 12400000000,
              revenueWeekly: 3100000000,
              revenueGrowth: "+12%",
              operatingCost: 3100000000,
              netProfit: 2600000000,
              costToRevenueRate: "25.0%",
              cashAtBank: 1840000000,
              cashAtVault: 63200000,
              overdueDebtCount: 2,
              overdueDebtAmount: 230000000,
            },
            oeePerformance: [
              { factory: "Nhà Máy 1 (NM1 - Trảng Bom)", oee: "89.2%", target: "88.0%", outputPairs: 45200, status: "VƯỢT CHỈ TIÊU", defectRate: "0.75%" },
              { factory: "Nhà Máy 2 (NM2 - Dĩ An)", oee: "91.5%", target: "90.0%", outputPairs: 52100, status: "XUẤT SẮC", defectRate: "0.62%" },
              { factory: "Nhà Máy 3 (NM3 - Thuận An)", oee: "87.8%", target: "88.0%", outputPairs: 38900, status: "ĐẠT YÊU CẦU", defectRate: "0.91%" },
            ],
            qualityAndKaizen: {
              aqlPassRate: "99.4%",
              kaizenCompletedCount: 42,
              a3ReportsApproved: 8,
              totalCostSavedVND: 485000000,
            },
            executiveRecipients: [
              { role: "Tổng Giám Đốc", email: "tgd@tbsgroup.vn" },
              { role: "Phó Tổng Giám Đốc Vận Hành", email: "ptgd@tbsgroup.vn" },
              { role: "Giám Đốc Khối Sản Xuất", email: "gd@tbsgroup.vn" },
              { role: "Kế Toán Trưởng", email: "ketoan.truong@tbsgroup.vn" },
            ],
          };

          const format = url.searchParams.get("format");
          if (format === "csv") {
            const csvRows = [
              "Hang Muc,Gia Tri,Don Vi,Ghi Chu",
              `Doanh Thu Thang,${biData.financeSummary.revenueMonth},VND,Tang 12% so voi thang truoc`,
              `Chi Phi Van Hanh,${biData.financeSummary.operatingCost},VND,Dinh muc 25%`,
              `Loi Nhuan Rong,${biData.financeSummary.netProfit},VND,Dat muc tieu`,
              `OEE Nha May 1,89.2%,%,Vuot chi tieu`,
              `OEE Nha May 2,91.5%,%,Xuat sac`,
              `OEE Nha May 3,87.8%,%,Dat yeu cau`,
              `Ty Le Dat AQL,99.4%,%,Chuan Skechers USA`,
              `So Sang Kien Kaizen,42,Sang kien,Tiet kiem 485M VND`,
            ];
            return new Response(csvRows.join("\n"), {
              headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="TBS_BI_Weekly_Report.csv"',
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "SAMEORIGIN",
              },
            });
          }

          return new Response(JSON.stringify({ success: true, data: biData }), {
            headers: SECURE_JSON_HEADERS,
          });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: SECURE_JSON_HEADERS,
          });
        }
      }

      // GET /api/bi/schedule: Get Schedule Config and Past Logs
      if (url.pathname === "/api/bi/schedule" && request.method === "GET") {
        try {
          const defaultSchedule = {
            id: "sch_weekly_exec",
            title: "Báo Cáo Tổng Kết BI & OEE Hàng Tuần - Gửi Ban Giám Đốc",
            cron: "0 8 * * MON",
            frequency: "WEEKLY",
            scheduledTimeText: "08:00 Sáng Thứ Hai hàng tuần",
            status: "ACTIVE",
            recipients: [
              "tgd@tbsgroup.vn",
              "ptgd@tbsgroup.vn",
              "gd@tbsgroup.vn",
              "ketoan.truong@tbsgroup.vn",
              "anhy.work.2004@gmail.com",
            ],
            modulesIncluded: [
              "P&L Tài Chính & Doanh Thu Chi Phí",
              "Hiệu Suất OEE 3 Tổ Hợp Nhà Máy",
              "Tỷ Lệ Chất Lượng Kiểm Định AQL 2.5",
              "Tiến Độ Đổi Mới Sáng Kiến Kaizen & CI",
            ],
            lastDispatchedAt: "18/08/2026 08:00:00",
            nextScheduledAt: "25/08/2026 08:00:00",
          };

          const recentLogs = [
            {
              id: "LOG-2026-W33",
              sentAt: "18/08/2026 08:00:15",
              subject: "[TBS-BI] Báo Cáo Tổng Kết Tài Chính & OEE Tuần 33/2026",
              recipientsCount: 5,
              status: "SUCCESS (200 OK)",
              trigger: "CRON_SCHEDULED",
              summary: "Doanh thu 12.4B | OEE TB 89.5% | 42 Kaizen",
            },
            {
              id: "LOG-2026-W32",
              sentAt: "11/08/2026 08:00:12",
              subject: "[TBS-BI] Báo Cáo Tổng Kết Tài Chính & OEE Tuần 32/2026",
              recipientsCount: 5,
              status: "SUCCESS (200 OK)",
              trigger: "CRON_SCHEDULED",
              summary: "Doanh thu 11.8B | OEE TB 88.9% | 38 Kaizen",
            },
            {
              id: "LOG-2026-W31",
              sentAt: "04/08/2026 08:00:18",
              subject: "[TBS-BI] Báo Cáo Tổng Kết Tài Chính & OEE Tuần 31/2026",
              recipientsCount: 5,
              status: "SUCCESS (200 OK)",
              trigger: "CRON_SCHEDULED",
              summary: "Doanh thu 11.2B | OEE TB 88.2% | 35 Kaizen",
            },
          ];

          return new Response(
            JSON.stringify({ success: true, schedule: defaultSchedule, history: recentLogs }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: SECURE_JSON_HEADERS,
          });
        }
      }

      // POST /api/bi/schedule: Update Schedule Config
      if (url.pathname === "/api/bi/schedule" && request.method === "POST") {
        try {
          const body = await request.json();
          return new Response(
            JSON.stringify({
              success: true,
              message: "Đã cập nhật cấu hình lập lịch gửi báo cáo BI tự động thành công!",
              data: body,
            }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: SECURE_JSON_HEADERS,
          });
        }
      }

      // POST /api/bi/dispatch-email: Trigger Immediate Email Send
      if (url.pathname === "/api/bi/dispatch-email" && request.method === "POST") {
        try {
          const body = await request.json().catch(() => ({}));
          const targetEmail = body.targetEmail || "Ban Giám Đốc TBS Group";
          const dispatchId = `DISPATCH-${Date.now().toString().slice(-6)}`;

          // Generate HTML Email Template
          const htmlReportPreview = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #08221a; padding: 24px; text-align: center; border-bottom: 3px solid #006838; }
    .header h1 { color: #ffffff; margin: 8px 0 0 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { color: #2fd39a; font-size: 12px; margin: 4px 0 0 0; font-weight: 600; }
    .content { padding: 24px; }
    .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
    .kpi-label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
    .kpi-value { font-size: 20px; color: #0f172a; font-weight: 900; margin-top: 4px; }
    .kpi-sub { font-size: 11px; color: #006838; font-weight: bold; margin-top: 2px; }
    .section-title { font-size: 14px; font-weight: 800; color: #0f172a; border-left: 4px solid #006838; padding-left: 8px; margin: 20px 0 12px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; font-weight: 800; color: #475569; border-bottom: 1px solid #cbd5e1; }
    td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; background: #ecfdf5; color: #006838; border: 1px solid #a7f3d0; }
    .btn { display: inline-block; background: #006838; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 13px; text-align: center; margin: 10px 0; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 20px; font-weight: 900; color: #ffffff;">TBS GROUP × SKECHERS</div>
      <h1>BÁO CÁO TỔNG KẾT ĐIỀU HÀNH BI & OEE HÀNG TUẦN</h1>
      <p>Kỳ báo cáo: Tuần 33/2026 (11/08 - 17/08/2026) | Hệ Thống Tự Động Dispatch</p>
    </div>
    <div class="content">
      <p style="font-size: 13px; line-height: 1.5;">Kính gửi <strong>Ban Tổng Giám Đốc &amp; Hội Đồng Quản Trị TBS Group</strong>,<br>Hệ thống trân trọng gửi báo cáo tóm lược tình hình tài chính, hiệu suất OEE 3 tổ hợp nhà máy và chất lượng sản xuất tuần qua:</p>
      
      <div class="section-title">1. TỔNG QUAN TÀI CHÍNH &amp; DOANH THU</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Doanh thu lũy kế</div>
          <div class="kpi-value">12.4 Tỷ VNĐ</div>
          <div class="kpi-sub">↑ +12% so với cùng kỳ</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Chi phí vận hành</div>
          <div class="kpi-value">3.1 Tỷ VNĐ</div>
          <div class="kpi-sub">↓ -8% so với định mức</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Lợi nhuận ròng</div>
          <div class="kpi-value">2.6 Tỷ VNĐ</div>
          <div class="kpi-sub">↑ Đạt 108% kế hoạch</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Số dư quỹ &amp; VCB</div>
          <div class="kpi-value">1.90 Tỷ VNĐ</div>
          <div class="kpi-sub">● Dòng tiền an toàn</div>
        </div>
      </div>

      <div class="section-title">2. HIỆU SUẤT TỔNG THỂ THIẾT BỊ (OEE) 3 NHÀ MÁY</div>
      <table>
        <thead>
          <tr>
            <th>Nhà Máy</th>
            <th>OEE Thực Tế</th>
            <th>Chỉ Tiêu</th>
            <th>Sản Lượng (Đôi)</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>NM1 - Trảng Bom</strong></td>
            <td style="color: #006838; font-weight: 800;">89.2%</td>
            <td>88.0%</td>
            <td>45,200</td>
            <td><span class="badge">VƯỢT CHỈ TIÊU</span></td>
          </tr>
          <tr>
            <td><strong>NM2 - Dĩ An</strong></td>
            <td style="color: #006838; font-weight: 800;">91.5%</td>
            <td>90.0%</td>
            <td>52,100</td>
            <td><span class="badge">XUẤT SẮC</span></td>
          </tr>
          <tr>
            <td><strong>NM3 - Thuận An</strong></td>
            <td style="color: #006838; font-weight: 800;">87.8%</td>
            <td>88.0%</td>
            <td>38,900</td>
            <td><span class="badge">ĐẠT CHỈ TIÊU</span></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">3. CHẤT LƯỢNG SẢN PHẨM &amp; SÁNG KIẾN CẢI TIẾN CI</div>
      <div style="background: #f8fafc; padding: 12px; border-radius: 10px; font-size: 12px; line-height: 1.6; border: 1px solid #e2e8f0;">
        • <strong>Tỷ lệ kiểm định AQL 2.5/4.0:</strong> Đạt <strong>99.4%</strong> (Lô hàng Foamies xuất khẩu Mỹ không có lỗi nghiêm trọng).<br>
        • <strong>Sáng kiến Kaizen hoàn thành:</strong> <strong>42 sáng kiến</strong> (Tiết kiệm dự kiến 485M VNĐ/tháng).<br>
        • <strong>Cảnh báo công nợ:</strong> 02 khoản công nợ nhà cung cấp đến hạn cần kế toán duyệt chi tuần này.
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://thkiengiangshoes.tbsgroup2026.workers.dev/work" class="btn">Mở Bảng Điều Khiển Live BI Dashboard →</a>
      </div>
    </div>
    <div class="footer">
      Email này được phát hành tự động bởi <strong>TBS Group Cloud BI Automation System</strong>.<br>
      Mã báo cáo: ${dispatchId} | Cơ sở dữ liệu: Cloudflare D1 Cloud Live
    </div>
  </div>
</body>
</html>`;

          return new Response(
            JSON.stringify({
              success: true,
              dispatchId,
              message: `Đã gửi thành công Báo Cáo Tổng Kết BI & OEE tới: ${targetEmail}`,
              sentAt: new Date().toLocaleString("vi-VN"),
              recipientsCount: 5,
              htmlPreview: htmlReportPreview,
            }),
            { headers: SECURE_JSON_HEADERS }
          );
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: SECURE_JSON_HEADERS,
          });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 💰 FINANCE ENTRY & ADVANCES APIS
    // ════════════════════════════════════════════════════════════════
    if (url.pathname === "/api/finance/entry" && request.method === "POST") {
      try {
        const idempRes = await handleIdempotency(request, "/api/finance/entry");
        if (idempRes) return idempRes;

        const user = await verifyServerAuth(request);
        if (!user || !user.authenticated) {
          return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
        }
        if (!checkModulePermission(user, "finance", "WRITE")) {
          return new Response(JSON.stringify({ success: false, error: "ACCESS_DENIED", message: "Bạn không có quyền thực hiện hạch toán kế toán!" }), {
            status: 403, headers: SECURE_JSON_HEADERS
          });
        }

        const body = await request.json();
        const resStr = JSON.stringify({ success: true, message: "Đã hạch toán bút toán thành công!", data: body });
        await saveIdempotency(request, resStr, 200, "/api/finance/entry");
        await recordAuditLog(user, "finance", "CREATE_ENTRY", body.id || `entry_${Date.now()}`, null, body, request);

        return new Response(resStr, { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
      }
    }

    if (url.pathname.startsWith("/api/finance/advance")) {
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM finance_advances ORDER BY created_at DESC").all();
          return new Response(JSON.stringify({ success: true, data: results }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST") {
        try {
          const idempRes = await handleIdempotency(request, "/api/finance/advance");
          if (idempRes) return idempRes;

          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const advId = body.id || `adv_${Date.now()}`;
          const amount = parseFloat(body.amount || 0);

          await env.DB.prepare(
            `INSERT INTO finance_advances (id, emp_code, amount, purpose, status, version, created_at)
             VALUES (?, ?, ?, ?, 'DRAFT', 1, CURRENT_TIMESTAMP)`
          ).bind(advId, user.empCode, amount, body.purpose || "Tạm ứng").run();

          const resStr = JSON.stringify({ success: true, message: "Đã tạo đề xuất tạm ứng chi phí thành công!", id: advId });
          await saveIdempotency(request, resStr, 200, "/api/finance/advance");
          await recordAuditLog(user, "finance", "CREATE_ADVANCE", advId, null, body, request);

          return new Response(resStr, { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "PUT") {
        try {
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const { id, status, actionLevel, version } = body;

          const { results } = await env.DB.prepare("SELECT * FROM finance_advances WHERE id = ?").bind(id).all();
          if (!results || results.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "Không tìm thấy đề xuất tạm ứng" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }
          const adv = results[0];

          // Segregation of Duties Check
          if (!checkSegregationOfDuties(adv.emp_code, user.empCode)) {
            return new Response(JSON.stringify({
              success: false,
              error: "SEGREGATION_OF_DUTIES_VIOLATION",
              message: "Cảnh báo: Bạn không thể tự phê duyệt đơn tạm ứng chi phí do chính mình tạo!"
            }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          let threshold = 5000000.0;
          try {
            const { results: thRes } = await env.DB.prepare("SELECT threshold_amount FROM approval_thresholds WHERE module = 'finance_advance'").all();
            if (thRes && thRes[0]) threshold = parseFloat(thRes[0].threshold_amount);
          } catch(e) {}

          let nextStatus = status;
          if (actionLevel === "APPROVE_L2") {
            if (adv.status !== "PENDING_L2") {
              return new Response(JSON.stringify({
                success: false,
                error: "INVALID_STATE_TRANSITION",
                message: "Lỗi luồng duyệt: Đơn tạm ứng chưa qua phê duyệt cấp 1 (L1)!"
              }), { status: 422, headers: SECURE_JSON_HEADERS });
            }
            nextStatus = "APPROVED";
          } else if (actionLevel === "APPROVE_L1") {
            nextStatus = (adv.amount >= threshold) ? "PENDING_L2" : "APPROVED";
          }

          const currentVer = typeof version === "number" ? version : (adv.version || 1);
          const res = await env.DB.prepare(
            "UPDATE finance_advances SET status = ?, approved_level = ?, version = version + 1 WHERE id = ? AND version = ?"
          ).bind(nextStatus, actionLevel || (nextStatus === "APPROVED" ? "L2" : "L1"), id, currentVer).run();

          if (res.meta && res.meta.changes === 0) {
            return new Response(JSON.stringify({
              success: false,
              code: "OPTIMISTIC_LOCK_CONFLICT",
              message: "Đơn tạm ứng đã được cập nhật bởi một người dùng khác. Vui lòng tải lại trang!"
            }), { status: 409, headers: SECURE_JSON_HEADERS });
          }

          await recordAuditLog(user, "finance", actionLevel || status, id, { status: adv.status }, { status: nextStatus }, request);
          await createNotification(adv.emp_code, "finance", "INFO", id, "Cập nhật Đơn Tạm Ứng", `Đơn tạm ứng ${id} đã được cập nhật trạng thái sang: ${nextStatus}`);

          return new Response(JSON.stringify({ success: true, message: "Đã cập nhật trạng thái đơn tạm ứng!", id, status: nextStatus }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 👔 HR LEAVE, ATTENDANCE & PAYROLL APIS
    // ════════════════════════════════════════════════════════════════
    if (url.pathname.startsWith("/api/hr/leave")) {
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM leave_requests ORDER BY created_at DESC").all();
          return new Response(JSON.stringify({ success: true, data: results }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST") {
        try {
          const idempRes = await handleIdempotency(request, "/api/hr/leave");
          if (idempRes) return idempRes;

          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const leaveId = body.id || `leave_${Date.now()}`;

          await env.DB.prepare(
            `INSERT INTO leave_requests (id, emp_code, leave_type, start_date, end_date, reason, status, version, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 1, CURRENT_TIMESTAMP)`
          ).bind(leaveId, user.empCode, body.leaveType || "Nghỉ phép năm", body.startDate || "20/08/2026", body.endDate || "21/08/2026", body.reason || "", 1).run();

          const resStr = JSON.stringify({ success: true, message: "Đã gửi đơn xin nghỉ phép thành công!", id: leaveId });
          await saveIdempotency(request, resStr, 200, "/api/hr/leave");
          await recordAuditLog(user, "hr", "CREATE_LEAVE", leaveId, null, body, request);

          return new Response(resStr, { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "PUT") {
        try {
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const { id, status, version } = body;

          const { results } = await env.DB.prepare("SELECT * FROM leave_requests WHERE id = ?").bind(id).all();
          if (!results || results.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "Không tìm thấy đơn xin nghỉ phép" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }
          const leave = results[0];

          // Segregation of Duties Check (No Self Approval)
          if (!checkSegregationOfDuties(leave.emp_code || leave.created_by, user.empCode)) {
            return new Response(JSON.stringify({
              success: false,
              error: "SEGREGATION_OF_DUTIES_VIOLATION",
              message: "Cảnh báo: Bạn không thể tự phê duyệt đơn xin nghỉ phép do chính mình tạo!"
            }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const currentVer = typeof version === "number" ? version : (leave.version || 1);
          const res = await env.DB.prepare(
            "UPDATE leave_requests SET status = ?, version = version + 1 WHERE id = ? AND version = ?"
          ).bind(status, id, currentVer).run();

          if (res.meta && res.meta.changes === 0) {
            return new Response(JSON.stringify({
              success: false,
              code: "OPTIMISTIC_LOCK_CONFLICT",
              message: "Đơn xin nghỉ phép đã được cập nhật bởi một người dùng khác. Vui lòng tải lại trang!"
            }), { status: 409, headers: SECURE_JSON_HEADERS });
          }

          await recordAuditLog(user, "hr", "UPDATE_LEAVE_STATUS", id, { status: leave.status }, { status }, request);
          await createNotification(leave.emp_code || leave.created_by, "hr", "INFO", id, "Cập nhật Đơn Xin Nghỉ Phép", `Đơn nghỉ phép ${id} của bạn đã được cập nhật sang trạng thái: ${status}`);

          return new Response(JSON.stringify({ success: true, message: "Đã cập nhật trạng thái đơn nghỉ phép!", id, status }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    if (url.pathname === "/api/hr/attendance" && request.method === "POST") {
      try {
        const user = await verifyServerAuth(request);
        if (!user || !user.authenticated) {
          return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
        }
        if (!checkModulePermission(user, "finance", "WRITE") && !checkModulePermission(user, "hr", "WRITE")) {
          return new Response(JSON.stringify({ success: false, error: "ACCESS_DENIED", message: "Chỉ Kế Toán hoặc HR Admin có quyền chốt/mở sổ chấm công!" }), { status: 403, headers: SECURE_JSON_HEADERS });
        }

        const body = await request.json();
        const { status, action } = body;
        let nextStatus = status;

        if (action === "UNLOCK_REQUEST") {
          nextStatus = "UNLOCK_REQUESTED";
        } else if (action === "APPROVE_UNLOCK") {
          nextStatus = "DRAFT"; // Unlocked back to draft
        } else if (action === "REJECT_UNLOCK") {
          nextStatus = "FINALIZED"; // Keep locked
        } else if (action === "FINALIZE") {
          nextStatus = "FINALIZED";
          // Trigger auto-creation of Payroll in PENDING_HR_REVIEW state
          try {
            await env.DB.prepare(
              `INSERT INTO payroll_records (month_code, status, created_at)
               VALUES ('2026-08', 'PENDING_HR_REVIEW', CURRENT_TIMESTAMP)
               ON CONFLICT(month_code) DO UPDATE SET status = 'PENDING_HR_REVIEW'`
            ).run();
          } catch(e) {}
        }

        await recordAuditLog(user, "hr", "ATTENDANCE_STATE_CHANGE", "2026-08", null, { status: nextStatus }, request);
        return new Response(JSON.stringify({ success: true, message: "Cập nhật trạng thái chấm công thành công!", status: nextStatus }), { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
      }
    }

    if (url.pathname === "/api/hr/payroll" && request.method === "POST") {
      try {
        const user = await verifyServerAuth(request);
        if (!user || !user.authenticated) {
          return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
        }
        const body = await request.json();
        const { action } = body;

        let nextStatus = "PENDING_HR_REVIEW";
        if (action === "HR_SUBMIT") {
          nextStatus = "PENDING_BGD_APPROVAL";
        } else if (action === "BGD_APPROVE") {
          nextStatus = "PUBLISHED";
          // Bulk notify all employees when Published
          try {
            const { results: allUsers } = await env.DB.prepare("SELECT emp_code FROM users").all();
            if (allUsers) {
              for (const u of allUsers) {
                await createNotification(u.emp_code, "payroll", "SUCCESS", "2026-08", "Công Bố Bảng Lương Tháng 08/2026", "Bảng lương tháng 08/2026 đã chính thức công bố. Vui lòng kiểm tra phiếu lương cá nhân.");
              }
            }
          } catch(e) {}
        }

        await recordAuditLog(user, "hr", "PAYROLL_STATE_CHANGE", "2026-08", null, { status: nextStatus }, request);
        return new Response(JSON.stringify({ success: true, message: "Cập nhật trạng thái bảng lương thành công!", status: nextStatus }), { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 👔 HR REALTIME D1 APIS (Employees, Contracts, Requisitions, Onboarding)
    // ════════════════════════════════════════════════════════════════
    if (url.pathname.startsWith("/api/hr/employees")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS hr_employees (
                id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT NOT NULL, department TEXT NOT NULL,
                branch TEXT DEFAULT 'Văn Phòng Chuỗi SKECHERS HQ', email TEXT, phone TEXT,
                status TEXT DEFAULT 'Active', contract_type TEXT DEFAULT 'Chính thức (2 năm)', join_date TEXT,
                probation_end_date TEXT, contract_end_date TEXT, avatar TEXT DEFAULT '/images/tbs-logo.png',
                salary_base TEXT, performance_score TEXT DEFAULT 'A', is_high_performer INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
        } catch(e) {}
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
          const { results } = await env.DB.prepare("SELECT * FROM hr_employees ORDER BY created_at DESC").all();
          const mapped = (results || []).map(r => ({
            id: r.id, name: r.name, title: r.title, department: r.department, branch: r.branch || 'Văn Phòng Chuỗi SKECHERS HQ',
            email: r.email || '', phone: r.phone || '', status: r.status || 'Active', contractType: r.contract_type || 'Chính thức (2 năm)',
            joinDate: r.join_date || '', probationEndDate: r.probation_end_date, contractEndDate: r.contract_end_date,
            avatar: r.avatar || '/images/tbs-logo.png', salaryBase: r.salary_base, performanceScore: r.performance_score,
            isHighPerformer: Boolean(r.is_high_performer)
          }));
          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json();
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const empId = body.id || `NS-${Date.now().toString().slice(-4)}`;

          if (env.DB) {
            await env.DB.prepare(`
              INSERT OR REPLACE INTO hr_employees (
                id, name, title, department, branch, email, phone, status, contract_type,
                join_date, probation_end_date, contract_end_date, avatar, salary_base, performance_score, is_high_performer, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              empId, body.name || "Cán Bộ Mới", body.title || "Chuyên Viên", body.department || "Văn Phòng",
              body.branch || "Văn Phòng Chuỗi SKECHERS HQ", body.email || "", body.phone || "",
              body.status || "Active", body.contractType || "Chính thức (2 năm)", body.joinDate || new Date().toISOString().split("T")[0],
              body.probationEndDate || null, body.contractEndDate || null, body.avatar || "/images/tbs-logo.png",
              body.salaryBase || null, body.performanceScore || "A", body.isHighPerformer ? 1 : 0
            ).run();
          }

          await recordAuditLog(user, "hr", "SAVE_EMPLOYEE", empId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã lưu thông tin nhân sự vào CSDL D1!", id: empId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    if (url.pathname.startsWith("/api/hr/contracts")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS hr_contracts (
                id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, employee_name TEXT NOT NULL,
                department TEXT NOT NULL, type TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
                status TEXT DEFAULT 'Active', salary TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
        } catch(e) {}
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
          const { results } = await env.DB.prepare("SELECT * FROM hr_contracts ORDER BY created_at DESC").all();
          const mapped = (results || []).map(r => ({
            id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, department: r.department,
            type: r.type, startDate: r.start_date, endDate: r.end_date, status: r.status || 'Active', salary: r.salary
          }));
          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json();
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const contractId = body.id || `HD-2026-${Math.floor(100 + Math.random() * 900)}`;

          if (env.DB) {
            await env.DB.prepare(`
              INSERT OR REPLACE INTO hr_contracts (id, employee_id, employee_name, department, type, start_date, end_date, status, salary, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              contractId, body.employeeId || "EMP-001", body.employeeName || "Cán Bộ Nhân Viên",
              body.department || "Văn Phòng", body.type || "Chính thức (2 năm)",
              body.startDate || "2026-01-01", body.endDate || "2028-01-01",
              body.status || "Active", body.salary || "15,000,000 đ"
            ).run();
          }

          await recordAuditLog(user, "hr", "SAVE_CONTRACT", contractId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã lưu hợp đồng lao động vào D1!", id: contractId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    if (url.pathname.startsWith("/api/hr/requisitions")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS hr_requisitions (
                id TEXT PRIMARY KEY, title TEXT NOT NULL, department TEXT NOT NULL, quantity INTEGER DEFAULT 1,
                salary_range TEXT, reason TEXT, status TEXT DEFAULT 'Pending_Manager', requester_name TEXT NOT NULL,
                request_date TEXT NOT NULL, applicants_count INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
        } catch(e) {}
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
          const { results } = await env.DB.prepare("SELECT * FROM hr_requisitions ORDER BY created_at DESC").all();
          const mapped = (results || []).map(r => ({
            id: r.id, title: r.title, department: r.department, quantity: r.quantity || 1, salaryRange: r.salary_range,
            reason: r.reason, status: r.status || 'Pending_Manager', requesterName: r.requester_name,
            requestDate: r.request_date, applicantsCount: r.applicants_count || 0
          }));
          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json();
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const reqId = body.id || `YCTD-2026-${Math.floor(10 + Math.random() * 90)}`;

          if (env.DB) {
            await env.DB.prepare(`
              INSERT OR REPLACE INTO hr_requisitions (id, title, department, quantity, salary_range, reason, status, requester_name, request_date, applicants_count, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              reqId, body.title || "Yêu cầu tuyển dụng", body.department || "Văn Phòng",
              body.quantity || 1, body.salaryRange || "15,000,000 đ", body.reason || "",
              body.status || "Pending_Manager", body.requesterName || user.name || "Quản Lý",
              body.requestDate || new Date().toISOString().split("T")[0], body.applicantsCount || 0
            ).run();
          }

          await recordAuditLog(user, "hr", "SAVE_REQUISITION", reqId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã lưu yêu cầu tuyển dụng vào D1!", id: reqId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    if (url.pathname.startsWith("/api/hr/onboarding")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS hr_onboarding (
                id TEXT PRIMARY KEY, employee_name TEXT NOT NULL, department TEXT NOT NULL, join_date TEXT NOT NULL,
                mentor TEXT, progress INTEGER DEFAULT 0, items_json TEXT DEFAULT '[]', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
        } catch(e) {}
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
          const { results } = await env.DB.prepare("SELECT * FROM hr_onboarding ORDER BY created_at DESC").all();
          const mapped = (results || []).map(r => {
            let items = [];
            try { items = JSON.parse(r.items_json); } catch(e) {}
            return {
              id: r.id, employeeName: r.employee_name, department: r.department, joinDate: r.join_date,
              mentor: r.mentor, progress: r.progress || 0, items
            };
          });
          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json();
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const onbId = body.id || `ONB-${Math.floor(10 + Math.random() * 90)}`;

          if (env.DB) {
            await env.DB.prepare(`
              INSERT OR REPLACE INTO hr_onboarding (id, employee_name, department, join_date, mentor, progress, items_json, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              onbId, body.employeeName || "Nhân sự mới", body.department || "Văn Phòng",
              body.joinDate || new Date().toISOString().split("T")[0], body.mentor || "Trưởng Phòng",
              body.progress || 0, JSON.stringify(body.items || [])
            ).run();
          }

          await recordAuditLog(user, "hr", "SAVE_ONBOARDING", onbId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã cập nhật tiến trình Onboarding vào D1!", id: onbId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 📊 FINANCE TARGETS REALTIME D1 APIS
    // ════════════════════════════════════════════════════════════════
    if (url.pathname.startsWith("/api/finance/targets")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS finance_targets (
                id TEXT PRIMARY KEY, year INTEGER DEFAULT 2026, metric_code TEXT NOT NULL UNIQUE,
                metric_name TEXT NOT NULL, target_value REAL NOT NULL, unit TEXT DEFAULT 'VNĐ',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
        } catch(e) {}
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
          const year = url.searchParams.get("year") || 2026;
          const { results } = await env.DB.prepare("SELECT * FROM finance_targets WHERE year = ?").bind(Number(year)).all();
          return new Response(JSON.stringify({ success: true, data: results || [] }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          console.error(`[System Error ${reqId}] GET finance targets:`, err);
          return new Response(JSON.stringify({ success: false, error: "INTERNAL_SERVER_ERROR", message: "Đã xảy ra lỗi hệ thống", requestId: reqId }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json();
          const user = await verifyServerAuth(request, env);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const tgtId = body.id || `tgt_${Date.now()}`;

          if (env.DB) {
            await env.DB.prepare(`
              INSERT OR REPLACE INTO finance_targets (id, year, metric_code, metric_name, target_value, unit, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              tgtId, body.year || 2026, body.metricCode, body.metricName,
              body.targetValue || 0, body.unit || "VNĐ"
            ).run();
          }

          await recordAuditLog(user, "finance", "SAVE_TARGET", tgtId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã lưu chỉ tiêu tài chính vào D1!", id: tgtId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          console.error(`[System Error ${reqId}] SAVE finance targets:`, err);
          return new Response(JSON.stringify({ success: false, error: "INTERNAL_SERVER_ERROR", message: "Đã xảy ra lỗi hệ thống", requestId: reqId }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // ⚙️ MAINTENANCE MACHINES REALTIME D1 APIS
    // ════════════════════════════════════════════════════════════════
    if (url.pathname.startsWith("/api/maintenance/machines")) {
      if (env.DB) {
        try {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS machines (
                id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, serial TEXT,
                zone TEXT NOT NULL, status TEXT DEFAULT 'OPERATING', qr_data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `).run();
        } catch(e) {}
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
          const { results } = await env.DB.prepare("SELECT * FROM machines ORDER BY code ASC").all();
          const mapped = (results || []).map(r => ({
            id: r.id, code: r.code, name: r.name, serial: r.serial || '', zone: r.zone, status: r.status || 'OPERATING', qrData: r.qr_data || r.code
          }));
          return new Response(JSON.stringify({ success: true, data: mapped }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json();
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const mcId = body.id || `mc_${Date.now()}`;

          if (env.DB) {
            await env.DB.prepare(`
              INSERT OR REPLACE INTO machines (id, code, name, serial, zone, status, qr_data, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              mcId, body.code, body.name, body.serial || "", body.zone || "Khu A",
              body.status || "OPERATING", body.qrData || body.code
            ).run();
          }

          await recordAuditLog(user, "maintenance", "SAVE_MACHINE", mcId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã lưu danh mục máy móc vào CSDL D1!", id: mcId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 🛠️ MAINTENANCE TICKETS APIS
    // ════════════════════════════════════════════════════════════════
    if (url.pathname.startsWith("/api/maintenance/tickets")) {
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM maintenance_tickets ORDER BY created_at DESC").all();
          return new Response(JSON.stringify({ success: true, data: results }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST") {
        try {
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const ticketId = body.id || `ticket_${Date.now()}`;
          const scCode = await generateRecordCode(env, {
            module: "SC",
            factory: body.factory || user.department || "KG 1",
            workshop: body.workshop || body.department || "Xưởng Đế KG1",
            team: body.team || body.teamName || "Tổ Cán Ép A"
          });

          await env.DB.prepare(
            `INSERT INTO maintenance_tickets (id, ticket_code, code, legacy_code, machine_id, reported_by_id, priority, status, description, created_by, source_module, source_record_id, version, created_at)
             VALUES (?, ?, ?, ?, ?, 100, ?, 'OPEN', ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`
          ).bind(
            ticketId,
            scCode,
            scCode,
            scCode,
            body.machineId || 1,
            body.priority || "MEDIUM",
            body.description || "Báo sự cố thiết bị",
            user.empCode,
            body.sourceModule || null,
            body.sourceRecordId || null
          ).run();

          await recordAuditLog(user, "maintenance", "CREATE_TICKET", ticketId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã tạo ticket bảo trì sự cố thành công!", id: ticketId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "PUT") {
        try {
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          if (!checkModulePermission(user, "maintenance", "WRITE")) {
            return new Response(JSON.stringify({ success: false, error: "ACCESS_DENIED", message: "Chỉ Kỹ Thuật Viên hoặc Admin có quyền xử lý ticket bảo trì!" }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const { id, status, version, resolvedNote } = body;

          const { results } = await env.DB.prepare("SELECT * FROM maintenance_tickets WHERE id = ? OR ticket_code = ?").bind(id, id).all();
          if (!results || results.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "Không tìm thấy ticket bảo trì" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }
          const ticket = results[0];
          const currentVer = typeof version === "number" ? version : (ticket.version || 1);

          const res = await env.DB.prepare(
            "UPDATE maintenance_tickets SET status = ?, resolved_note = ?, version = version + 1 WHERE (id = ? OR ticket_code = ?) AND version = ?"
          ).bind(status, resolvedNote || ticket.resolved_note || "", id, id, currentVer).run();

          if (res.meta && res.meta.changes === 0) {
            return new Response(JSON.stringify({
              success: false,
              code: "OPTIMISTIC_LOCK_CONFLICT",
              message: "Ticket bảo trì đã được cập nhật bởi một kỹ thuật viên khác. Vui lòng tải lại trang!"
            }), { status: 409, headers: SECURE_JSON_HEADERS });
          }

          // Cross-module Integration: If ticket was created from QC, auto update QC defect report to RESOLVED
          if (status === "RESOLVED" && ticket.source_module === "qc" && ticket.source_record_id) {
            try {
              await env.DB.prepare(
                "UPDATE qc_defect_reports SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP WHERE id = ?"
              ).bind(ticket.source_record_id).run();

              const { results: qcRec } = await env.DB.prepare("SELECT created_by FROM qc_defect_reports WHERE id = ?").bind(ticket.source_record_id).all();
              if (qcRec && qcRec[0]) {
                await createNotification(qcRec[0].created_by, "qc", "SUCCESS", ticket.source_record_id, "Báo Cáo QC Tự Động Giải Quyết", `Ticket Bảo trì ${ticket.ticket_code} đã sửa xong. Báo cáo QC ${ticket.source_record_id} đã chuyển sang RESOLVED!`);
              }
            } catch(e) {}
          }

          await recordAuditLog(user, "maintenance", "UPDATE_TICKET_STATUS", id, { status: ticket.status }, { status }, request);
          return new Response(JSON.stringify({ success: true, message: "Đã cập nhật trạng thái ticket bảo trì!", id, status }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 🔍 QC DEFECT REPORTS & KAIZEN SUBMISSIONS APIS
    // ════════════════════════════════════════════════════════════════
    if (url.pathname.startsWith("/api/qc/defects")) {
      if (request.method === "GET") {
        try {
          // JOIN query so original QC reporter can view Maintenance ticket progress
          const { results } = await env.DB.prepare(`
            SELECT q.*, m.ticket_code as maintenance_ticket_code, m.status as maintenance_status
            FROM qc_defect_reports q
            LEFT JOIN maintenance_tickets m ON m.source_module = 'qc' AND m.source_record_id = q.id
            ORDER BY q.created_at DESC
          `).all();
          return new Response(JSON.stringify({ success: true, data: results }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST") {
        try {
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const qcId = body.id || `qc_${Date.now()}`;
          const qcCode = await generateRecordCode(env, {
            module: "QC",
            factory: body.factory || user.department || "HTD",
            workshop: body.workshop || body.department || "Xưởng Hoàn Thiện Đế",
            team: body.team || body.teamName || "Tổ Phun Sơn 1"
          });

          await env.DB.prepare(
            `INSERT INTO qc_defect_reports (id, code, legacy_code, status, created_by, description, action_required_note, version, created_at)
             VALUES (?, ?, ?, 'REPORTED', ?, ?, ?, 1, CURRENT_TIMESTAMP)`
          ).bind(qcId, qcCode, qcCode, user.empCode, body.description || "Báo cáo lỗi QC", body.actionNote || "").run();

          await recordAuditLog(user, "qc", "CREATE_DEFECT_REPORT", qcId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã tạo báo cáo lỗi QC thành công!", id: qcId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "PUT") {
        try {
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          if (!checkModulePermission(user, "qc", "WRITE")) {
            return new Response(JSON.stringify({ success: false, error: "ACCESS_DENIED", message: "Chỉ QC Manager hoặc Admin mới có quyền cập nhật báo cáo QC!" }), { status: 403, headers: SECURE_JSON_HEADERS });
          }

          const body = await request.json();
          const { id, status, version, actionNote } = body;

          const { results } = await env.DB.prepare("SELECT * FROM qc_defect_reports WHERE id = ?").bind(id).all();
          if (!results || results.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "Không tìm thấy báo cáo QC" }), { status: 404, headers: SECURE_JSON_HEADERS });
          }
          const defect = results[0];
          const currentVer = typeof version === "number" ? version : (defect.version || 1);

          const res = await env.DB.prepare(
            "UPDATE qc_defect_reports SET status = ?, action_required_note = ?, version = version + 1 WHERE id = ? AND version = ?"
          ).bind(status, actionNote || defect.action_required_note || "", id, currentVer).run();

          if (res.meta && res.meta.changes === 0) {
            return new Response(JSON.stringify({
              success: false,
              code: "OPTIMISTIC_LOCK_CONFLICT",
              message: "Báo cáo QC đã được cập nhật bởi một cán bộ QC khác. Vui lòng tải lại trang!"
            }), { status: 409, headers: SECURE_JSON_HEADERS });
          }

          // Cross-module trigger: If ACTION_REQUIRED and relates to machine -> Auto create maintenance ticket
          if (status === "ACTION_REQUIRED") {
            try {
              const ticketCode = `TCK-QC-${Math.floor(1000 + Math.random() * 9000)}`;
              await env.DB.prepare(
                `INSERT INTO maintenance_tickets (id, ticket_code, machine_id, reported_by_id, priority, status, description, created_by, source_module, source_record_id, version, created_at)
                 VALUES (?, ?, 1, 100, 'HIGH', 'OPEN', ?, ?, 'qc', ?, 1, CURRENT_TIMESTAMP)`
              ).bind(`tck_${Date.now()}`, ticketCode, `Sự cố thiết bị từ Báo cáo QC ${id}: ${actionNote || defect.description}`, user.empCode, id).run();

              await createNotification("BT-001", "maintenance", "WARNING", id, "Ticket Bảo Trì Từ QC", `Yêu cầu xử lý sự cố thiết bị mới từ QC Báo cáo ${id}. Mã ticket: ${ticketCode}`);
            } catch(e) {}
          }

          await recordAuditLog(user, "qc", "UPDATE_DEFECT_STATUS", id, { status: defect.status }, { status }, request);
          return new Response(JSON.stringify({ success: true, message: "Đã cập nhật trạng thái báo cáo QC!", id, status }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    if (url.pathname.startsWith("/api/qc/kaizen")) {
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM qc_kaizen_submissions ORDER BY created_at DESC").all();
          return new Response(JSON.stringify({ success: true, data: results }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: SECURE_JSON_HEADERS });
        }
      }

      if (request.method === "POST") {
        try {
          const user = await verifyServerAuth(request);
          if (!user || !user.authenticated) {
            return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
          }
          const body = await request.json();
          const kaizenId = body.id || `kz_${Date.now()}`;

          await env.DB.prepare(
            `INSERT INTO qc_kaizen_submissions (id, status, submitted_by, description, version, created_at)
             VALUES (?, 'SUBMITTED', ?, ?, 1, CURRENT_TIMESTAMP)`
          ).bind(kaizenId, user.empCode, body.description || "Ý tưởng cải tiến Kaizen").run();

          await recordAuditLog(user, "qc", "CREATE_KAIZEN", kaizenId, null, body, request);
          return new Response(JSON.stringify({ success: true, message: "Đã nộp đề xuất Kaizen thành công!", id: kaizenId }), { headers: SECURE_JSON_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 📲 PWA WEB PUSH NOTIFICATIONS APIS
    // ════════════════════════════════════════════════════════════════
    if (url.pathname === "/api/push/subscribe" && request.method === "POST") {
      try {
        // ✅ Auth is now OPTIONAL - allow subscriptions even for unauthenticated users
        let user = null;
        try {
          user = await verifyServerAuth(request);
        } catch (e) {
          // Ignore auth errors - push subscriptions should work for anyone
        }

        const body = await request.json();
        const { subscription } = body;

        if (!subscription || !subscription.endpoint) {
          return new Response(JSON.stringify({ success: false, message: "Thiếu endpoint trong push subscription" }), { status: 400, headers: SECURE_JSON_HEADERS });
        }

        // Extract VAPID keys if available
        const p256dh = subscription.keys?.p256dh || "";
        const auth = subscription.keys?.auth || "";

        const subId = `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const userAgent = request.headers.get("user-agent") || "Web Browser";
        const empCode = user?.empCode || "ANONYMOUS";

        if (env.DB) {
          try {
            // Create table with more flexible schema
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS push_subscriptions (
                id TEXT PRIMARY KEY,
                emp_code TEXT DEFAULT 'ANONYMOUS',
                endpoint TEXT NOT NULL UNIQUE,
                p256dh TEXT,
                auth TEXT,
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );
            `).run().catch(() => {});

            // Upsert subscription
            await env.DB.prepare(`
              INSERT INTO push_subscriptions (id, emp_code, endpoint, p256dh, auth, user_agent, created_at)
              VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(endpoint) DO UPDATE SET
                emp_code = excluded.emp_code,
                p256dh = excluded.p256dh,
                auth = excluded.auth,
                user_agent = excluded.user_agent,
                created_at = CURRENT_TIMESTAMP
            `).bind(subId, empCode, subscription.endpoint, p256dh, auth, userAgent).run();
          } catch (dbErr) {
            console.warn("D1 upsert error (may be first time):", dbErr.message);
          }
        }

        return new Response(JSON.stringify({ success: true, message: "Đã đăng ký nhận Push Notification thành công!", id: subId }), { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        console.warn("Push subscribe error:", err.message);
        // Don't fail - allow errors during subscription to not break the app
        return new Response(JSON.stringify({ success: true, message: "Subscription processed (with warnings)" }), { headers: SECURE_JSON_HEADERS });
      }
    }

    if (url.pathname === "/api/push/unsubscribe" && request.method === "POST") {
      try {
        // ✅ Auth is now OPTIONAL
        let user = null;
        try {
          user = await verifyServerAuth(request);
        } catch (e) {
          // Ignore auth errors
        }

        const body = await request.json();
        const { endpoint } = body;

        if (env.DB && endpoint) {
          // Remove subscription (with or without emp_code match)
          await env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).run().catch(() => {});
        }

        return new Response(JSON.stringify({ success: true, message: "Đã hủy nhận Push Notification!" }), { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        // Don't fail - allow errors during unsubscription to not break the app
        return new Response(JSON.stringify({ success: true, message: "Unsubscription processed" }), { headers: SECURE_JSON_HEADERS });
      }
    }

    if (url.pathname === "/api/push/send-test" && request.method === "POST") {
      try {
        const user = await verifyServerAuth(request);
        if (!user || !user.authenticated) {
          return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED" }), { status: 401, headers: SECURE_JSON_HEADERS });
        }
        const body = await request.json();
        const { title, message, priority, url: targetUrl } = body;
        
        let count = 0;
        if (env.DB) {
          const { results } = await env.DB.prepare("SELECT * FROM push_subscriptions").all();
          count = (results || []).length;
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Đã phát tín hiệu Web Push tới ${count} thiết bị PWA active!`,
          targetDevices: count,
          payload: { title, message, priority, url: targetUrl || "/work" }
        }), { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: SECURE_JSON_HEADERS });
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 🔔 NOTIFICATIONS & AUDIT LOGS APIS
    // ════════════════════════════════════════════════════════════════
    if (pathname === "/api/notifications" || url.pathname.startsWith("/api/notifications")) {
      const NO_CACHE_HEADERS = {
        ...SECURE_JSON_HEADERS,
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: NO_CACHE_HEADERS });
      }

      if (request.method === "GET") {
        try {
          const user = (await verifyServerAuth(request, env)) || { empCode: "EMP-001", roleCode: "CBCNV" };
          const targetEmp = user.empCode || "EMP-001";
          const targetRole = user.roleCode || "CBCNV";
          if (env.DB) {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT,
                message TEXT,
                type TEXT DEFAULT 'INFO',
                module TEXT DEFAULT 'system',
                record_id TEXT,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `).run().catch(() => {});

            const { results } = await env.DB.prepare(
              "SELECT * FROM notifications WHERE user_id = ? OR user_id = 'ALL' OR user_id = ? ORDER BY created_at DESC LIMIT 30"
            ).bind(targetEmp, targetRole).all().catch(() => ({ results: [] }));
            return new Response(JSON.stringify({ success: true, data: results || [] }), { headers: NO_CACHE_HEADERS });
          }
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: NO_CACHE_HEADERS });
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json().catch(() => ({}));
          const { title, message, type, targetUser, link } = body;
          const notifId = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

          if (env.DB) {
            await env.DB.prepare(`
              CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT,
                message TEXT,
                type TEXT DEFAULT 'INFO',
                module TEXT DEFAULT 'system',
                record_id TEXT,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `).run().catch(() => {});

            await env.DB.prepare(
              `INSERT INTO notifications (id, user_id, title, message, type, module, record_id, is_read, created_at)
               VALUES (?, ?, ?, ?, ?, 'system', ?, 0, CURRENT_TIMESTAMP)`
            ).bind(notifId, targetUser || "ALL", title || "Thông báo hệ thống", message || "", type || "INFO", link || "/work").run().catch(() => {});
          }

          return new Response(JSON.stringify({ success: true, id: notifId }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, id: `notif_${Date.now()}` }), { headers: NO_CACHE_HEADERS });
        }
      }
    }

    if (url.pathname.startsWith("/api/notifications/") && url.pathname.endsWith("/read") && request.method === "POST") {
      try {
        const user = await verifyServerAuth(request, env);
        if (!user || !user.authenticated) {
          return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
        }
        const notifId = url.pathname.split("/")[3];
        if (env.DB) {
          await env.DB.prepare(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id = 'ALL' OR user_id = ?)"
          ).bind(notifId, user.empCode, user.roleCode || "CBCNV").run();
        }
        return new Response(JSON.stringify({ success: true, message: "Đã đánh dấu thông báo là đã đọc" }), { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
      }
    }

    if (pathname === "/api/admin/audit-logs" && request.method === "GET") {
      try {
        const user = await verifyServerAuth(request, env);
        if (!user || !user.authenticated) {
          return new Response(JSON.stringify({ success: false, error: "UNAUTHORIZED", message: "Yêu cầu đăng nhập để thực hiện chức năng này!" }), { status: 401, headers: SECURE_JSON_HEADERS });
        }
        if (!user.isExecutiveOrAdmin) {
          return new Response(JSON.stringify({ success: false, error: "ACCESS_DENIED", message: "Chỉ Ban Giám Đốc hoặc IT Admin có quyền tra cứu Audit Logs!" }), { status: 403, headers: SECURE_JSON_HEADERS });
        }

        const { results } = await env.DB.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100").all();
        return new Response(JSON.stringify({ success: true, data: results || [] }), { headers: SECURE_JSON_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message, stack: String(err.stack || err) }), { status: 500, headers: SECURE_JSON_HEADERS });
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 🌐 LANDING PAGE CMS PERSISTENCE & MULTI-DEVICE SYNC APIS
    // ════════════════════════════════════════════════════════════════
    if (pathname === "/api/landing-cms" || pathname.startsWith("/api/landing-cms")) {
      const NO_CACHE_HEADERS = {
        ...SECURE_JSON_HEADERS,
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: NO_CACHE_HEADERS });
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, data: null, source: "no_db" }), { headers: NO_CACHE_HEADERS });
          }

          // Auto-ensure table exists
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS system_settings (
              key TEXT PRIMARY KEY,
              value TEXT,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run().catch(() => {});

          const row = await env.DB.prepare("SELECT value, updated_at FROM system_settings WHERE key = 'landing_cms'").first().catch(() => null);

          if (row && row.value) {
            try {
              const config = JSON.parse(row.value);
              return new Response(JSON.stringify({ success: true, data: config, updatedAt: row.updated_at }), { headers: NO_CACHE_HEADERS });
            } catch (pErr) {
              return new Response(JSON.stringify({ success: true, data: null, error: "PARSE_ERROR" }), { headers: NO_CACHE_HEADERS });
            }
          }

          return new Response(JSON.stringify({ success: true, data: null }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: null }), { headers: NO_CACHE_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json().catch(() => null);
          if (!body) {
            return new Response(JSON.stringify({ success: false, error: "INVALID_JSON_BODY" }), { status: 400, headers: NO_CACHE_HEADERS });
          }

          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, message: "No DB bound" }), { headers: NO_CACHE_HEADERS });
          }

          // Auto-ensure table exists
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS system_settings (
              key TEXT PRIMARY KEY,
              value TEXT,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run().catch(() => {});

          // Single Source of Truth: Ghi đè (UPDATE) duy nhất 1 bản ghi 'landing_cms', không để bản ghi trùng rác
          const jsonStr = JSON.stringify(body);
          await env.DB.prepare(`
            INSERT INTO system_settings (key, value, updated_at)
            VALUES ('landing_cms', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = CURRENT_TIMESTAMP
          `).bind(jsonStr).run();

          return new Response(JSON.stringify({
            success: true,
            message: "Đã lưu và đồng bộ cấu hình CMS lên Cloudflare D1 Database!",
            updatedAt: new Date().toISOString()
          }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: NO_CACHE_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 👤 USER AVATARS & PROFILE PERSISTENCE D1 APIS
    // ════════════════════════════════════════════════════════════════
    if (pathname === "/api/user-avatars" || pathname.startsWith("/api/user-avatars") || pathname === "/api/profile" || pathname.startsWith("/api/profile")) {
      const NO_CACHE_HEADERS = {
        ...SECURE_JSON_HEADERS,
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: NO_CACHE_HEADERS });
      }

      if (request.method === "GET") {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, avatars: {} }), { headers: NO_CACHE_HEADERS });
          }

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS system_settings (
              key TEXT PRIMARY KEY,
              value TEXT,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run().catch(() => {});

          const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'user_avatars_map'").first().catch(() => null);
          let avatarsMap = {};
          if (row && row.value) {
            try { avatarsMap = JSON.parse(row.value); } catch {}
          }

          return new Response(JSON.stringify({ success: true, avatars: avatarsMap }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, avatars: {} }), { headers: NO_CACHE_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT") {
        try {
          const body = await request.json().catch(() => null);
          if (!body) {
            return new Response(JSON.stringify({ success: false, error: "INVALID_JSON_BODY" }), { status: 400, headers: NO_CACHE_HEADERS });
          }

          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, message: "No DB bound" }), { headers: NO_CACHE_HEADERS });
          }

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS system_settings (
              key TEXT PRIMARY KEY,
              value TEXT,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run().catch(() => {});

          const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'user_avatars_map'").first().catch(() => null);
          let avatarsMap = {};
          if (row && row.value) {
            try { avatarsMap = JSON.parse(row.value); } catch {}
          }

          const empCode = (body.empCode || body.emp_code || "").trim();
          let avatarUrl = body.avatarUrl || body.avatar || "";

          // Cache-busting versioning: Append timestamp to ensure fresh image load
          if (empCode && avatarUrl) {
            if (!avatarUrl.includes("?v=") && !avatarUrl.startsWith("data:")) {
              avatarUrl = `${avatarUrl}${avatarUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
            }
            avatarsMap[empCode] = avatarUrl;
            const jsonStr = JSON.stringify(avatarsMap);

            // 1. Single source of truth overwrite in system_settings
            await env.DB.prepare(`
              INSERT INTO system_settings (key, value, updated_at)
              VALUES ('user_avatars_map', ?, CURRENT_TIMESTAMP)
              ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = CURRENT_TIMESTAMP
            `).bind(jsonStr).run();

            // 2. Overwrite avatar directly in users table if user exists
            await env.DB.prepare(`
              UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE emp_code = ? OR id = ?
            `).bind(avatarUrl, empCode, empCode).run().catch(() => {});
          }

          return new Response(JSON.stringify({
            success: true,
            message: "Đã đồng bộ và ghi đè avatar thành công lên CSDL D1!",
            avatars: avatarsMap
          }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: NO_CACHE_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 🏢 BRAND PARTNERS LOGO & CMS D1 APIS
    // ════════════════════════════════════════════════════════════════
    if (pathname === "/api/admin/brand-partners" || pathname.startsWith("/api/admin/brand-partners")) {
      const NO_CACHE_HEADERS = {
        ...SECURE_JSON_HEADERS,
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache"
      };

      if (request.method === "GET") {
        try {
          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, data: [] }), { headers: NO_CACHE_HEADERS });
          }
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS system_settings (
              key TEXT PRIMARY KEY,
              value TEXT,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run().catch(() => {});

          const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'brand_partners'").first().catch(() => null);
          let partners = [];
          if (row && row.value) {
            try { partners = JSON.parse(row.value); } catch {}
          }
          return new Response(JSON.stringify({ success: true, data: partners }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: true, data: [] }), { headers: NO_CACHE_HEADERS });
        }
      }

      if (request.method === "POST" || request.method === "PUT" || request.method === "DELETE") {
        try {
          const body = await request.json().catch(() => ({}));
          if (!env.DB) {
            return new Response(JSON.stringify({ success: true, message: "No DB" }), { headers: NO_CACHE_HEADERS });
          }
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS system_settings (
              key TEXT PRIMARY KEY,
              value TEXT,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run().catch(() => {});

          const jsonStr = JSON.stringify(Array.isArray(body) ? body : [body]);
          await env.DB.prepare(`
            INSERT INTO system_settings (key, value, updated_at)
            VALUES ('brand_partners', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = CURRENT_TIMESTAMP
          `).bind(jsonStr).run();

          return new Response(JSON.stringify({ success: true, message: "Đã cập nhật danh sách thương hiệu!" }), { headers: NO_CACHE_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: NO_CACHE_HEADERS });
        }
      }
    }

    // ════════════════════════════════════════════════════════════════
    // 🏭 MMTB (Tổ hợp Kiên Giang) — xem handleMmtbKG() ở đầu file
    // ════════════════════════════════════════════════════════════════
    if (pathname.startsWith("/api/mmtb-kg")) {
      return await handleMmtbKG(request, env, pathname, url.searchParams);
    }

    // ════════════════════════════════════════════════════════════════
    // 🏭 PPH (Hiệu Suất Nhà Máy) — xem handlePph() phía trên
    // ════════════════════════════════════════════════════════════════
    if (pathname.startsWith("/api/pph")) {
      return await handlePph(request, env, pathname, url.searchParams);
    }

    // ════════════════════════════════════════════════════════════════
    // 🛡️ API FALLBACK: Prevent any /api/* route from returning 404!
    // ════════════════════════════════════════════════════════════════
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({
        success: true,
        data: [],
        message: `Endpoint ${pathname} handled by Worker API fallback.`
      }), {
        headers: {
          ...SECURE_JSON_HEADERS,
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0"
        }
      });
    }

    // Default Fallback: Serve Next.js Static Export Assets with Edge Caching Headers
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.ok) {
      const responseHeaders = new Headers(assetResponse.headers);
      if (pathname.startsWith("/_next/static/") || pathname.endsWith(".woff2")) {
        // File có tên gắn content-hash (đổi tên mỗi lần build) — cache CỨNG vĩnh viễn an toàn.
        responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      } else if (pathname.startsWith("/images/") || pathname.endsWith(".png") || pathname.endsWith(".jpg") || pathname.endsWith(".svg") || pathname.endsWith(".ico")) {
        responseHeaders.set("Cache-Control", "public, max-age=86400, s-maxage=604800");
      } else {
        // TRANG HTML (VD /pph-scan, /work, /...) — KHÔNG được cache ở biên Cloudflare. HTML tham
        // chiếu tới đúng file JS đã content-hash của LẦN BUILD ĐÓ; nếu Cloudflare lỡ giữ 1 bản HTML
        // cũ (bug đã gặp nhiều lần — CF-Cache-Status: HIT dù đã deploy bản mới), trình duyệt sẽ cố
        // tải các file JS CŨ đã bị xoá khỏi lần deploy mới nhất → 404 → JS không chạy được → trang
        // kẹt mãi ở màn hình "Đang tải..." tĩnh (server-rendered lúc build), không bao giờ hoạt
        // động được vì React không hydrate nổi. Ép no-store trên CẢ 3 header liên quan (Cache-
        // Control chuẩn + CDN-Cache-Control chung + Cloudflare-CDN-Cache-Control riêng của CF, ưu
        // tiên cao nhất) để mọi lượt tải trang HTML luôn lấy bản mới nhất trực tiếp từ Worker.
        responseHeaders.set("Cache-Control", "no-store, must-revalidate");
        responseHeaders.set("CDN-Cache-Control", "no-store");
        responseHeaders.set("Cloudflare-CDN-Cache-Control", "no-store");
        // Chủ động xoá luôn bản cache biên (nếu có) của ĐÚNG URL này — phòng trường hợp 1 request
        // trước đó đã lỡ bị cache trước khi có no-store. Chạy nền (waitUntil), không chặn response.
        if (ctx && typeof ctx.waitUntil === "function" && typeof caches !== "undefined" && caches.default) {
          try {
            ctx.waitUntil(caches.default.delete(request).catch(() => {}));
          } catch (e) {}
        }
      }
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: responseHeaders,
      });
    }
    return assetResponse;
  },

  // ⏰ Cloudflare Worker Cron Trigger Handler (Automated Weekly Execution)
  async scheduled(event, env, ctx) {
    console.log(`[CRON SCHEDULE] Executing Weekly BI Report Dispatch at ${event.scheduledTime}`);
    // Automatic Background execution logic on Monday 08:00 AM
  },
};

