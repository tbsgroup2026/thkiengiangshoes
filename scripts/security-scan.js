#!/usr/bin/env node
/**
 * TBS II — Security Diff Scanner
 * ================================
 * Phân tích `git diff --cached` (staged changes) để phát hiện lỗ hổng bảo mật.
 * Chặn commit nếu phát hiện Critical/High (hoặc Medium với module HR/kế toán).
 *
 * Usage:
 *   node scripts/security-scan.js              # scan staged diff
 *   node scripts/security-scan.js --all         # scan entire repo
 *   node scripts/security-scan.js --file <path> # scan single file
 *   node scripts/security-scan.js --ci          # CI mode (JSON output)
 *
 * Exit codes:
 *   0 — PASS (no blocking issues)
 *   1 — BLOCKED (Critical/High/Medium issues found)
 *   2 — ERROR (scan failed to run)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ============================================================
// CONFIGURATION
// ============================================================

const MODULE_SEVERITY = {
  // HR, kế toán: chặn cả Critical, High, Medium
  hr: ["CRITICAL", "HIGH", "MEDIUM"],
  accounting: ["CRITICAL", "HIGH", "MEDIUM"],
  // QC, sản xuất, chat, chatbot, BI dashboard: chặn Critical và High
  qc: ["CRITICAL", "HIGH"],
  production: ["CRITICAL", "HIGH"],
  manufacturing: ["CRITICAL", "HIGH"],
  chat: ["CRITICAL", "HIGH"],
  chatbot: ["CRITICAL", "HIGH"],
  bi: ["CRITICAL", "HIGH"],
  dashboard: ["CRITICAL", "HIGH"],
  // Còn lại: chỉ chặn Critical
  default: ["CRITICAL"],
};

// Map file paths to modules
function detectModule(filePath) {
  const p = filePath.toLowerCase();
  if (/hr[/\\]|human.?resource|employees|payroll|tuyển.?dụng/i.test(p))
    return "hr";
  if (
    /account|kế.?toán|finance|invoice|general.?ledger|balance/i.test(p)
  )
    return "accounting";
  if (/qc[/\\]|quality|inspection|kiểm.?định/i.test(p)) return "qc";
  if (
    /production|manufactur|sản.?xuất|line[/\\]|machine|zone[/\\]/i.test(p)
  )
    return "production";
  if (/chat[/\\]|messag|tin.?nhắn|conversation/i.test(p)) return "chat";
  if (/chatbot|rag|vector|embedding|llm|prompt/i.test(p)) return "chatbot";
  if (/bi[/\\]|dashboard|analytics|chart|report|thống.?kê/i.test(p))
    return "bi";
  return "default";
}

function getBlockedLevels(filePath) {
  const module = detectModule(filePath);
  return MODULE_SEVERITY[module] || MODULE_SEVERITY["default"];
}

// ============================================================
// RULE ENGINE
// ============================================================

const RULES = [
  // ---- R1: Hardcoded Secrets ----
  {
    id: "R1-HARDCODED-SECRET",
    name: "Hardcoded Secrets / Credentials",
    severity: "CRITICAL",
    patterns: [
      // API keys / tokens
      /(?:api[_-]?key|apikey|api[_-]?secret|secret[_-]?key|access[_-]?key)\s*[:=]\s*['"`][A-Za-z0-9_\-]{16,}['"`]/gi,
      // Firebase config with real values
      /firebase\.(?:apiKey|authDomain|databaseURL|projectId|storageBucket|messagingSenderId|appId)\s*[:=]\s*['"`][^'"]{8,}['"`]/gi,
      // JWT secrets
      /(?:jwt[_-]?secret|jwt[_-]?key|token[_-]?secret|secret[_-]?token)\s*[:=]\s*['"`][A-Za-z0-9_\-]{10,}['"`]/gi,
      // DB credentials
      /(?:database[_-]?url|db[_-]?url|mongo(?:db)?[_-]?uri|connection[_-]?string|DATABASE_URL)\s*[:=]\s*['"`](?:mongodb|mysql|postgres(?:ql)?|sqlite):\/\/[^'"]+['"`]/gi,
      /(?:db[_-]?password|database[_-]?password|pgpassword|mysql[_-]?password)\s*[:=]\s*['"`][^'"]{4,}['"`]/gi,
      // Private keys
      /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/,
      /-----BEGIN\s+EC\s+PRIVATE\s+KEY-----/,
      // Generic password in code
      /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"]{4,}['"`]\s*(?:;|,|\))/gi,
    ],
    suggestion:
      'Di chuyển secret vào biến môi trường:\n' +
      '  // Trong .env:\n' +
      '  //   JWT_SECRET=<giá-trị>\n' +
      '  // Trong code:\n' +
      '  //   const jwtSecret = process.env.JWT_SECRET;\n' +
      '  //   if (!jwtSecret) throw new Error("JWT_SECRET is required");',
  },

  // ---- R2: Firebase Security Rules quá lỏng ----
  {
    id: "R2-FIREBASE-RULES",
    name: "Firebase Security Rules quá lỏng",
    severity: "CRITICAL",
    fileFilter: /\.rules$|firestore\.rules|storage\.rules|security[\\/]firebaseRules/,
    patterns: [
      /allow\s+read\s*,\s*write\s*:\s*if\s+true\s*;?/gi,
      /allow\s+read\s*,\s*write\s*:\s*if\s+request\.auth\s*!=\s*null\s*;?/gi,
      /allow\s+read\s*:\s*if\s+true\s*;?/gi,
      /allow\s+write\s*:\s*if\s+true\s*;?/gi,
      // Thiếu rule hoàn toàn
      /match\s+\/[^{]+\{[^}]*allow\s+read[^}]*\}[^}]*\}\s*$/gim,
    ],
    suggestion:
      "Áp dụng least-privilege:\n" +
      '  match /hr_records/{docId} {\n' +
      '    allow read, write: if request.auth != null\n' +
      '      && request.auth.token.role in ["admin", "hr_manager"];\n' +
      "  }",
  },

  // ---- R3: API endpoint thiếu xác thực ----
  {
    id: "R3-MISSING-AUTH",
    name: "API endpoint thiếu xác thực hoặc role check",
    severity: "CRITICAL",
    patterns: [
      // Express route không có middleware auth
      /app\.(?:get|post|put|delete|patch)\s*\(\s*['"`]\/[^'"]*(?:hr|accounting|qc|user|employee|salary|payroll)[^'"]*['"`]\s*,\s*(?!.*auth|.*middleware|.*verify|.*guard|.*protect)/gi,
      // FastAPI route không có Depends(get_current_user)
      /@router\.(?:get|post|put|delete|patch)\s*\(\s*['"`]\/[^'"]*['"`]\s*\)\s*\n\s*def\s+\w+\s*\([^)]*\)\s*:/gi,
      // Next.js API route không check auth
      /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{(?![^}]*auth|[^}]*session|[^}]*getServerSession)/gi,
    ],
    suggestion:
      "Thêm middleware xác thực:\n" +
      "  // FastAPI:\n" +
      "  //   @router.get('/hr/employees')\n" +
      "  //   def get_employees(current_user = Depends(get_current_user)):\n" +
      "  // Express:\n" +
      "  //   router.get('/hr/employees', authMiddleware, roleCheck(['hr']), handler);",
  },

  // ---- R4: Input không validate ----
  {
    id: "R4-NO-INPUT-VALIDATION",
    name: "Input không được validate/sanitize trước DB hoặc response",
    severity: "HIGH",
    patterns: [
      // Raw SQL query với template string từ input
      /db\.(?:execute|query|run)\s*\(\s*`[^`]*\$\{[^}]+(?:\b(?:req\.|request\.|params\.|body\.|query\.|input\.))[^`]*`/gi,
      // Direct string interpolation vào SQL
      /f['"]\s*(?:SELECT|INSERT|UPDATE|DELETE)\s+.*\{.*(?:req\.|request\.|params\.).*\}['"]/gi,
      // MongoDB raw query trực tiếp từ body
      /\.(?:find|findOne|insertOne|updateOne|deleteOne)\(\s*req\.body/gi,
      // Không escape HTML trước khi return
      /return\s+(?:<div|<p|<span|<h[1-6]|<li|<td).*\{.*(?:req\.|params\.|body\.|input\.).*\}.*>/gi,
      // dangerouslySetInnerHTML trong React
      /dangerouslySetInnerHTML\s*=\s*\{{\s*__html:\s*(?!.*sanitize|.*DOMPurify|.*escape)/gi,
    ],
    suggestion:
      "Validate và sanitize input:\n" +
      "  // Python (FastAPI):\n" +
      "  //   from validators import sanitize_html_input, has_sql_injection_attempt\n" +
      "  //   sanitized = sanitize_html_input(req.description)\n" +
      "  // TypeScript:\n" +
      "  //   import { z } from 'zod';\n" +
      "  //   const schema = z.string().max(5000).refine(s => !hasXSS(s));",
  },

  // ---- R5: Upload file không giới hạn ----
  {
    id: "R5-UNSAFE-UPLOAD",
    name: "Endpoint upload không giới hạn size/type hoặc không kiểm tra MIME",
    severity: "HIGH",
    patterns: [
      // Multer không limit
      /multer\s*\(\s*\{\s*(?:dest|storage)\s*:/gi,
      // FastAPI UploadFile không size check
      /UploadFile\s*\)/gi,
      // Không check MIME type
      /file\.save\s*\(/gi,
      /\.put\s*\(\s*['"`][^'"]*['"`]\s*,\s*(?:req\.file|file\.)/gi,
      // Firebase Storage upload không validate
      /uploadBytes\s*\(\s*ref\s*\(/gi,
      /putFile\s*\(/gi,
    ],
    suggestion:
      "Giới hạn upload:\n" +
      "  // Python:\n" +
      '  //   from security.uploadGuard import validate_upload\n' +
      '  //   validate_upload(file, max_size_mb=10, allowed_types=["image/jpeg","image/png"])\n' +
      "  // JavaScript:\n" +
      "  //   const upload = multer({\n" +
      "  //     storage, limits: { fileSize: 10 * 1024 * 1024 },\n" +
      "  //     fileFilter: (req, file, cb) => {\n" +
      "  //       if (!['image/jpeg','image/png'].includes(file.mimetype)) {\n" +
      "  //         cb(new Error('Invalid file type')); return;\n" +
      "  //       } cb(null, true);\n" +
      "  //     }\n" +
      "  //   });",
  },

  // ---- R6: Thiếu rate limiting ----
  {
    id: "R6-NO-RATE-LIMIT",
    name: "Thiếu rate limiting ở endpoint public/auth",
    severity: "HIGH",
    patterns: [
      // Route login/OTP/reset không rate limit
      /@router\.(?:post|get)\s*\(\s*['"`]\/[^'"]*(?:login|otp|reset|forgot|verify|signin|signup)[^'"]*['"`]\s*\)(?![\s\S]{0,200}?(?:rate.?limit|RateLimiter|limiter|throttle))/gi,
      /app\.(?:post|get)\s*\(\s*['"`]\/[^'"]*(?:login|otp|reset|forgot|signin)[^'"]*['"`]\s*,(?![\s\S]{0,200}?(?:rate.?limit|limiter|throttle))/gi,
    ],
    suggestion:
      "Thêm rate limit:\n" +
      "  // Python FastAPI (đã có sẵn global rate limiter trong main.py)\n" +
      '  // Đảm bảo LOGIN_MAX_ATTEMPTS đủ thấp (≤10/phút)\n' +
      "  // Cloudflare Workers:\n" +
      "  //   import { rateLimiter } from '../security/rateLimiter';\n" +
      '  //   await rateLimiter(request, { maxRequests: 5, windowSeconds: 60 });',
  },

  // ---- R7: RBAC không nhất quán ----
  {
    id: "R7-INCONSISTENT-RBAC",
    name: "RBAC không nhất quán: FE ẩn nút nhưng BE không chặn",
    severity: "HIGH",
    patterns: [
      // Route handler không gọi require_role/get_current_user nhưng xử lý dữ liệu nhạy cảm
      /@router\.(?:get|post|put|delete|patch)\s*\(\s*['"`]\/[^'"]*(?:admin|manage|delete|update|create|edit)[^'"]*['"`]\s*\)\s*\n\s*(?:async\s+)?def\s+\w+\s*\([^)]*(?<!Depends\(get_current_user\))(?<!Depends\(require_role)/gi,
    ],
    suggestion:
      "Đảm bảo BE kiểm tra role:\n" +
      "  // FastAPI:\n" +
      "  //   def delete_user(user_id: int,\n" +
      "  //       current_user = Depends(require_role([RoleEnum.ADMIN])),\n" +
      "  //       db: Session = Depends(get_db)):\n" +
      "  // Cloudflare Workers:\n" +
      '  //   if (user.role !== "admin") {\n' +
      "  //     return new Response(JSON.stringify({error:'Forbidden'}), {status:403});\n" +
      "  //   }",
  },

  // ---- R8: RAG prompt injection ----
  {
    id: "R8-RAG-INJECTION",
    name: "Chatbot RAG: không lọc prompt injection hoặc cross-department data leak",
    severity: "HIGH",
    fileFilter: /rag|chatbot|llm|prompt|vector|embedding/,
    patterns: [
      // Prompt được gửi thẳng vào LLM không qua filter
      /\.(?:chat|completion|generate)\s*\(\s*\{[^}]*messages\s*:\s*\[\s*\{\s*role\s*:\s*['"`]user['"`]\s*,\s*content\s*:\s*(?:req\.|body\.|query\.|input\.|userMessage)/gi,
      // Không giới hạn department scope
      /vectorSearch\s*\(\s*\{[^}]*\}\s*\)/gi,
      /similaritySearch\s*\(/gi,
    ],
    suggestion:
      "Lọc prompt injection và giới hạn phạm vi:\n" +
      "  // Python:\n" +
      "  //   from security.ragGuard import filter_prompt, limit_scope\n" +
      "  //   clean_prompt = filter_prompt(user_input)\n" +
      '  //   results = limit_scope(vector_search(clean_prompt), user.department)\n' +
      "  // Node:\n" +
      "  //   const { filterPrompt, limitScope } = require('../security/ragGuard');\n" +
      '  //   const cleanPrompt = filterPrompt(req.body.prompt);',
  },

  // ---- R9: Log lộ thông tin nhạy cảm ----
  {
    id: "R9-SENSITIVE-LOG",
    name: "Response/log lộ thông tin nội bộ ra production",
    severity: "MEDIUM",
    patterns: [
      /console\.(?:log|error|warn)\s*\(\s*(?:err|error)\.(?:stack|message)/gi,
      /console\.(?:log|error)\s*\(\s*['"`].*(?:SELECT|INSERT|UPDATE|DELETE).*['"`]/gi,
      /print\s*\(\s*(?:.*traceback|.*stack|.*exception)/gi,
      /response\s*=\s*\{[^}]*['"`](?:stack|traceback|exception|password|token|secret)[^}]*\}/gi,
      // Debug mode trong production
      /DEBUG\s*=\s*(?:True|true|1)\s*(?:#.*production|#.*prod)?/,
    ],
    suggestion:
      "Không log thông tin nhạy cảm:\n" +
      "  // Thay vì console.error(err.stack):\n" +
      "  //   console.error(`[${new Date().toISOString()}] Error in ${ctx}: ${err.message}`);\n" +
      "  // Dùng logger chuyên dụng với level-based filtering:\n" +
      '  //   logger.error({ msg: err.message, code: err.code, ctx: "module_name" });',
  },

  // ---- R10: Thiếu CSP / Security Headers ----
  {
    id: "R10-MISSING-HEADERS",
    name: "Thiếu security headers quan trọng (CSP, HSTS, X-Frame-Options)",
    severity: "MEDIUM",
    patterns: [
      // Response không set security headers
      /new\s+Response\s*\(\s*['"`][^'"]*['"`]\s*,\s*\{[^}]*\}\s*\)/gi,
      /return\s+(?:new\s+)?Response[^{]*\{[^}]*(?<!X-Frame-Options)(?<!Content-Security-Policy)(?<!Strict-Transport-Security)\}/gi,
    ],
    suggestion:
      "Thêm security headers (đã có sẵn trong main.py middleware của TBS II):\n" +
      "  response.headers['X-Frame-Options'] = 'DENY';\n" +
      "  response.headers['X-Content-Type-Options'] = 'nosniff';\n" +
      "  response.headers['Content-Security-Policy'] = \"default-src 'self';\";",
  },

  // ---- R11: SQL Injection (Python-specific) ----
  {
    id: "R11-SQL-INJECTION",
    name: "SQL Injection qua raw query hoặc string interpolation",
    severity: "CRITICAL",
    patterns: [
      // Python raw SQL với format string
      /db\.(?:execute|run)\s*\(\s*f['"][^'"]*\{/gi,
      /cursor\.(?:execute|executemany)\s*\(\s*f['"]/gi,
      /\.(?:execute|executemany)\s*\(\s*['"].*%s.*['"]\s*%\s*\(/gi,
      /session\.(?:execute|query)\s*\(\s*(?:text|Text|textClause)\s*\(/gi,
      // Prisma raw query
      /\$queryRaw/gi,
      /\$executeRaw/gi,
      // D1 raw query từ user input
      /\.prepare\s*\(\s*`[^`]*\$\{/gi,
    ],
    suggestion:
      "Sử dụng parameterized queries:\n" +
      "  // Python (SQLAlchemy):\n" +
      "  //   db.query(User).filter(User.id == user_id).first()\n" +
      "  // Thay vì:\n" +
      '  //   db.execute(f"SELECT * FROM users WHERE id = {user_id}")\n' +
      "  // Prisma:\n" +
      '  //   prisma.user.findUnique({ where: { id: userId } })',
  },

  // ---- R12: CORS quá rộng ----
  {
    id: "R12-WIDE-CORS",
    name: "CORS allow origin wildcard hoặc quá rộng",
    severity: "MEDIUM",
    patterns: [
      /['"]\*['"]\s*,\s*\/\/\s*(?:origin|CORS)/gi,
      /allow[_-]?origins?\s*[:=]\s*\[\s*['"]\*['"]/gi,
      /Access-Control-Allow-Origin\s*:\s*\*/gi,
    ],
    suggestion:
      "Giới hạn CORS origins:\n" +
      '  ALLOWED_ORIGINS = ["https://tbs2.example.com", "https://admin.tbs2.example.com"]\n' +
      "  // Không dùng '*' trong production",
  },
];

// ============================================================
// SCANNER CORE
// ============================================================

/**
 * Lấy nội dung diff để scan.
 */
function getDiff(options = {}) {
  const { all = false, filePath = null } = options;

  try {
    if (filePath) {
      return [
        {
          file: filePath,
          content: fs.readFileSync(filePath, "utf-8"),
          lines: [],
        },
      ];
    }

    if (all) {
      // Lấy toàn bộ file tracked (bỏ node_modules, .git, dist, build)
      const trackedFiles = execSync(
        'git ls-files --cached --others --exclude-standard -- "*.py" "*.js" "*.ts" "*.tsx" "*.jsx" "*.dart" "*.yaml" "*.yml" "*.rules" "*.sql" "*.prisma"',
        { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }
      )
        .split("\n")
        .filter(Boolean)
        .filter(
          (f) =>
            !f.includes("node_modules/") &&
            !f.includes(".next/") &&
            !f.includes("dist/") &&
            !f.includes("build/") &&
            !f.includes(".dart_tool/") &&
            !f.includes("__pycache__/") &&
            !f.includes("package-lock.json")
        );

      return trackedFiles.map((f) => ({
        file: f,
        content: fs.readFileSync(f, "utf-8"),
        lines: [],
      }));
    }

    // Staged diff (mặc định)
    const diffOutput = execSync(
      "git diff --cached --unified=0",
      { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }
    );

    if (!diffOutput.trim()) {
      console.log("ℹ️  Không có thay đổi staged để quét.");
      return [];
    }

    return parseDiff(diffOutput);
  } catch (err) {
    // Nếu không phải git repo hoặc git không khả dụng
    if (err.message.includes("not a git repository") || err.message.includes("git")) {
      console.error("❌ Lỗi: Không tìm thấy git repository hoặc git không khả dụng.");
      console.error("   Chạy lệnh này trong git repo hoặc dùng --file để quét file cụ thể.");
      process.exit(2);
    }
    throw err;
  }
}

/**
 * Parse unified diff output thành các file chunk.
 */
function parseDiff(diffText) {
  const files = [];
  const lines = diffText.split("\n");
  let currentFile = null;
  let currentLines = [];

  for (const line of lines) {
    // File header: diff --git a/path b/path hoặc --- a/path hoặc +++ b/path
    const newFileMatch = line.match(/^\+\+\+ b\/(.+)$/);
    if (newFileMatch) {
      if (currentFile && currentLines.length > 0) {
        files.push({ file: currentFile, content: "", lines: [...currentLines] });
      }
      currentFile = newFileMatch[1];
      currentLines = [];
      continue;
    }

    // Added lines (chỉ scan dòng mới thêm)
    if (currentFile && line.startsWith("+") && !line.startsWith("+++")) {
      // Lấy line number từ @@ header
      currentLines.push(line.substring(1));
    }
  }

  // File cuối cùng
  if (currentFile && currentLines.length > 0) {
    files.push({ file: currentFile, content: "", lines: [...currentLines] });
  }

  // Bỏ file trong node_modules, lock files
  return files.filter(
    (f) =>
      !f.file.includes("node_modules/") &&
      !f.file.includes(".next/") &&
      !f.file.includes("__pycache__/") &&
      f.file !== "package-lock.json" &&
      f.file !== "pnpm-lock.yaml" &&
      f.file !== "yarn.lock" &&
      f.file !== "poetry.lock"
  );
}

/**
 * Quét một file chunk.
 */
function scanFile({ file, content, lines }) {
  const findings = [];
  const blockedLevels = getBlockedLevels(file);
  const sourceLines = lines.length > 0 ? lines : (content || "").split("\n");

  for (const rule of RULES) {
    // Kiểm tra file filter nếu có
    if (rule.fileFilter && !rule.fileFilter.test(file)) {
      continue;
    }

    for (let lineNum = 0; lineNum < sourceLines.length; lineNum++) {
      const line = sourceLines[lineNum];
      for (const pattern of rule.patterns) {
        // Reset regex lastIndex
        pattern.lastIndex = 0;

        let match;
        while ((match = pattern.exec(line)) !== null) {
          // Với pattern global và multiline, tránh infinite loop
          if (match[0].length === 0) {
            pattern.lastIndex++;
            continue;
          }

          findings.push({
            ruleId: rule.id,
            name: rule.name,
            severity: rule.severity,
            file: file,
            line: lineNum + 1,
            match: match[0].substring(0, 100),
            suggestion: rule.suggestion,
            module: detectModule(file),
            blocked: blockedLevels.includes(rule.severity),
          });

          // Chỉ báo cáo 1 lần mỗi pattern trên mỗi dòng
          break;
        }
      }
    }
  }

  return findings;
}

// ============================================================
// OUTPUT FORMATTING
// ============================================================

function formatFindings(findings, ciMode = false) {
  if (findings.length === 0) {
    if (ciMode) {
      console.log(JSON.stringify({ status: "PASSED", findings: [] }));
    } else {
      console.log("\n✅ SECURITY CHECK PASSED");
      console.log("   Không phát hiện lỗ hổng ở mức bị chặn.\n");
    }
    return;
  }

  // Nhóm theo severity
  const blocked = findings.filter((f) => f.blocked);
  const warnings = findings.filter((f) => !f.blocked);

  if (ciMode) {
    console.log(
      JSON.stringify({
        status: blocked.length > 0 ? "BLOCKED" : "WARNING",
        blocked: blocked.map(formatFindingJSON),
        warnings: warnings.map(formatFindingJSON),
      })
    );
  } else {
    // Human-readable output
    if (blocked.length > 0) {
      console.log("\n" + "=".repeat(72));
      console.log("  🚫 COMMIT BỊ CHẶN — Phát hiện lỗ hổng bảo mật");
      console.log("=".repeat(72));

      for (const f of blocked) {
        console.log(formatFinding(f));
      }

      console.log(
        `\n📊 Tổng: ${blocked.length} lỗi BLOCKED | ${warnings.length} cảnh báo`
      );
      console.log(
        "💡 Sửa các lỗi trên trước khi commit. Nếu cần bỏ qua (chỉ trong trường hợp khẩn cấp):"
      );
      console.log("   git commit --no-verify  # ⚠️  Phải được team lead phê duyệt\n");
    }

    if (warnings.length > 0 && blocked.length === 0) {
      console.log("\n⚠️  WARNING — Phát hiện vấn đề bảo mật không nghiêm trọng:");
      for (const f of warnings) {
        console.log(formatFinding(f));
      }
      console.log(
        `\n📊 ${warnings.length} cảnh báo. Không chặn commit nhưng nên sửa sớm.\n`
      );
    }
  }
}

function formatFinding(f) {
  const emoji = f.severity === "CRITICAL" ? "🔴" : f.severity === "HIGH" ? "🟠" : "🟡";
  return [
    "",
    `${emoji} BLOCKED: ${f.name}`,
    `   Rule:      ${f.ruleId}`,
    `   Module:    ${f.module.toUpperCase()}`,
    `   File:      ${f.file}:${f.line}`,
    `   Mức độ:    ${f.severity}`,
    `   Match:     ${f.match}`,
    `   Đề xuất:   ${f.suggestion.split("\n").join("\n              ")}`,
    "─".repeat(72),
  ].join("\n");
}

function formatFindingJSON(f) {
  return {
    ruleId: f.ruleId,
    name: f.name,
    severity: f.severity,
    file: f.file,
    line: f.line,
    module: f.module,
    match: f.match,
    suggestion: f.suggestion,
  };
}

// ============================================================
// MAIN
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const options = {
    all: args.includes("--all"),
    ci: args.includes("--ci"),
    filePath: null,
  };

  const fileIdx = args.indexOf("--file");
  if (fileIdx !== -1 && fileIdx + 1 < args.length) {
    options.filePath = args[fileIdx + 1];
  }

  try {
    const files = getDiff(options);

    if (files.length === 0) {
      console.log("\n✅ SECURITY CHECK PASSED");
      console.log("   Không có thay đổi để quét.\n");
      process.exit(0);
    }

    const allFindings = [];
    for (const fileChunk of files) {
      const findings = scanFile(fileChunk);
      allFindings.push(...findings);
    }

    formatFindings(allFindings, options.ci);

    const blocked = allFindings.filter((f) => f.blocked);
    if (blocked.length > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi quét bảo mật:", err.message);
    if (options.ci) {
      console.log(
        JSON.stringify({ status: "ERROR", error: err.message })
      );
    }
    process.exit(2);
  }
}

// Export for testing
if (require.main === module) {
  main();
}

module.exports = { RULES, detectModule, getBlockedLevels, scanFile, parseDiff };
