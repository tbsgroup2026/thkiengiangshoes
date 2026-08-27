import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";

const router = Router();

// ============================================================
// GROK AI CONFIGURATION
// ============================================================
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_API_KEY = process.env.GROK_API_KEY || "";

// ============================================================
// IN-MEMORY RATE LIMITER
// ============================================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // Requests per minute per IP
const RATE_WINDOW = 60_000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ============================================================
// BUILD DYNAMIC SYSTEM PROMPT WITH LIVE JOB DATA
// ============================================================
async function buildSystemPrompt(): Promise<string> {
  let jobContext = "";

  try {
    const activeJobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        salary: true,
        location: true,
        description: true,
        requirements: true,
        benefits: true,
        category: true,
        slots: true,
        contactEmail: true,
        contactPhone: true,
      },
    });

    if (activeJobs.length > 0) {
      jobContext = "\n\n## CÁC VỊ TRÍ ĐANG TUYỂN DỤNG HIỆN TẠI:\n\n";
      for (const job of activeJobs) {
        jobContext += `- **${job.title}**\n`;
        jobContext += `  - Mức lương: ${job.salary}\n`;
        jobContext += `  - Địa điểm: ${job.location}\n`;
        jobContext += `  - Số lượng: ${job.slots} vị trí\n`;
        jobContext += `  - Mô tả: ${job.description.substring(0, 200)}...\n`;
        jobContext += `  - Yêu cầu: ${job.requirements.substring(0, 200)}...\n`;
        jobContext += `  - Liên hệ: ${job.contactEmail} | ${job.contactPhone}\n\n`;
      }
    }
  } catch {
    // If DB fails, proceed without job context
  }

  return `Bạn là trợ lý tuyển dụng AI của TBS Group — một tập đoàn sản xuất công nghiệp đa ngành hàng đầu Việt Nam.

## GIỚI THIỆU TBS GROUP:
- Tên đầy đủ: TBS Group — Tập Đoàn Sản Xuất & Đầu Tư Đa Ngành
- Slogan: "Thế giới làm được, ắt ta sẽ làm được"
- Trụ sở: Số 5, Đường ĐT 743, Phường An Bình, TP. Dĩ An, Bình Dương
- Chuỗi SKECHERS: 33 chuyền sản xuất, 5.000+ nhân sự
- Năng lực: 25 triệu đôi giày/năm, 10 triệu túi xách/năm
- 50.000+ nhân sự toàn hệ thống

## 6 LĨNH VỰC TRỤ CỘT:
1. Sản Xuất Da Giày (25 triệu đôi/năm, 33 chuyền)
2. Sản Xuất Túi Xách (10 triệu sản phẩm/năm)
3. Đầu Tư BĐS & Hạ Tầng Công Nghiệp
4. Cảng & Logistics (ICD Tân Vạn — 220.000m²)
5. Du Lịch Khách Sạn (Mai House 5★, Sân Golf)
6. Thương Mại & Dịch Vụ (Phân phối ECCO)

## QUY TRÌNH ỨNG TUYỂN:
1. Ứng viên xem tin tuyển dụng tại trang Tuyển Dụng
2. Điền form ứng tuyển (họ tên, email, số điện thoại) và tải CV lên (PDF/DOC/DOCX)
3. Bộ phận Nhân sự xem xét hồ sơ trong 3-5 ngày làm việc
4. HR liên hệ để sắp xếp lịch phỏng vấn (điện thoại hoặc trực tiếp)
5. Thông báo kết quả trong vòng 7 ngày sau phỏng vấn

## THÔNG TIN LIÊN HỆ:
- Email tuyển dụng: tuyendungdaotaovp2@tbsgroup.vn
- Điện thoại: 0905 359 017 (Miss Lịch)
- Phòng Nhân sự TBS Group

${jobContext}

## HƯỚNG DẪN:
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Khi được hỏi về vị trí tuyển dụng, cung cấp đầy đủ thông tin từ danh sách trên
- Nếu có câu hỏi không liên quan đến tuyển dụng/TBS Group, lịch sự từ chối
- Khuyến khích ứng viên nộp hồ sơ và tư vấn cách chuẩn bị CV tốt
- Giữ câu trả lời ngắn gọn, súc tích (tối đa 500 từ)
- Không hứa hẹn về kết quả tuyển dụng hoặc mức lương cụ thể ngoài thông tin đã công bố
- Nếu câu hỏi cần thông tin cá nhân (CMND, tài khoản ngân hàng...), từ chối và yêu cầu liên hệ HR trực tiếp`;
}

// ============================================================
// POST /api/ai/chat — AI chat endpoint
// ============================================================
router.post("/chat", async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  // Rate limit check
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: "Quá nhiều yêu cầu. Vui lòng đợi một phút trước khi gửi tiếp.",
    });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Validate message format
  for (const msg of messages) {
    if (!msg.role || !msg.content || !["user", "assistant", "system"].includes(msg.role)) {
      return res.status(400).json({ error: "Invalid message format. Each message needs role and content." });
    }
  }

  // If no API key configured, return a fallback response
  if (!GROK_API_KEY) {
    return res.json({
      reply: "Xin chào! Tôi là trợ lý tuyển dụng TBS Group. Hiện tại hệ thống AI đang trong quá trình thiết lập. Vui lòng liên hệ trực tiếp Phòng Nhân sự qua email tuyendungdaotaovp2@tbsgroup.vn hoặc số điện thoại 0905 359 017 (Miss Lịch) để được hỗ trợ. Cảm ơn bạn đã quan tâm đến TBS Group!",
    });
  }

  try {
    const systemPrompt = await buildSystemPrompt();

    const response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.filter((m: any) => m.role !== "system"),
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Grok API error:", response.status, errText);

      // Fallback response on API error
      return res.json({
        reply: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ Phòng Nhân sự qua email tuyendungdaotaovp2@tbsgroup.vn hoặc số điện thoại 0905 359 017 (Miss Lịch) để được hỗ trợ trực tiếp.",
      });
    }

    const data = await response.json() as any;
    const reply = data.choices?.[0]?.message?.content || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại hoặc liên hệ Phòng Nhân sự TBS Group để được hỗ trợ.";

    return res.json({ reply });
  } catch (error: any) {
    console.error("AI chat error:", error.message);

    // Fallback on network error
    return res.json({
      reply: "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau hoặc liên hệ Phòng Nhân sự TBS Group qua email tuyendungdaotaovp2@tbsgroup.vn để được hỗ trợ.",
    });
  }
});

// ============================================================
// GET /api/ai/health — Check AI service status
// ============================================================
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: GROK_API_KEY ? "ready" : "unconfigured",
    model: "grok-2",
    provider: "xAI / Grok",
  });
});

export default router;
