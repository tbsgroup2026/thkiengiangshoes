import express from "express";
import http from "http";
import cors from "cors";
import { config } from "./config";
import { setSecurityHeaders, blockSensitiveFiles, globalRateLimiter, sanitizeInputs } from "./middleware/security";
import { initWebSocket } from "./utils/websocket";
import { seedDatabase } from "./utils/seed";
import helmet from "helmet";
import prisma from "./utils/prisma";
import { redis } from "./utils/redis";

// Import Routers
import authRouter from "./routes/auth";
import departmentsRouter from "./routes/departments";
import documentsRouter from "./routes/documents";
import machinesRouter from "./routes/machines";
import chatRouter from "./routes/chat";
import adminRouter from "./routes/admin";
import compatibilityRouter from "./routes/compatibility";
import recruitmentRouter from "./routes/recruitment";
import aiChatRouter from "./routes/ai-chat";
import notificationsRouter from "./routes/notifications";
import usersRouter from "./routes/users";
import roomsRouter from "./routes/rooms";
import path from "path";

const app = express();
const server = http.createServer(app);

// 1. WebSocket Server Initialization
initWebSocket(server, config.allowedOrigins);

// 2. Global Security Hardening Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(setSecurityHeaders);
app.use(blockSensitiveFiles);
app.use(globalRateLimiter);
app.use(sanitizeInputs);

// 3. CORS Configuration
const isProd = process.env.NODE_ENV === "production";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      
      const isAllowed = config.allowedOrigins.includes(origin);
      if (isAllowed) {
        if (origin === "*" && isProd) {
          callback(new Error("CORS Policy: Wildcard origin not allowed in production with credentials."));
        } else {
          callback(null, true);
        }
      } else {
        callback(new Error("CORS Policy: Access Denied."));
      }
    },
    credentials: true
  })
);

// 4. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Setup Routes
app.use("/api/auth", authRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/machines", machinesRouter);
app.use("/api/chat", chatRouter);
app.use("/api/admin", adminRouter);
app.use("/api/v1", compatibilityRouter);
app.use("/api/recruitment", recruitmentRouter);
app.use("/api/ai", aiChatRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/rooms", roomsRouter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 5.B Public Synced News Endpoint (Crawled from TBS Group main portal)
app.get("/api/public/news", async (req, res) => {
  try {
    const news = await prisma.document.findMany({
      where: {
        documentType: "HR",
        state: "APPROVED"
      },
      orderBy: { createdAt: "desc" },
      take: 6
    });

    const parsedNews = news
      .filter((item: any) => {
        const d = item.data as any;
        return d && (d.origin === "tbsgroup.vn" || d.type === "NEWS");
      })
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        createdAt: item.createdAt,
        origin: (item.data as any)?.origin || "tbsgroup.vn",
        excerpt: (item.data as any)?.desc || "Tin tức hoạt động công nghiệp và chuyển đổi số tại tổ hợp nhà máy TBS Group."
      }));

    if (parsedNews.length === 0) {
      return res.json([
        {
          id: "news-1",
          title: "TBS Group tổ chức hội nghị Tổng kết 6 tháng đầu năm và Triển khai kế hoạch 6 tháng cuối năm 2026 Ngành Sản xuất Công nghiệp",
          createdAt: new Date("2026-07-16").toISOString(),
          origin: "tbsgroup.vn",
          excerpt: "Ngày 11/7/2026, tại văn phòng trụ sở, TBS Group đã tổ chức thành công Hội nghị Tổng kết 6 tháng đầu năm và triển khai kế hoạch 6 tháng cuối năm 2026 ngành Sản xuất Công nghiệp."
        },
        {
          id: "news-2",
          title: "Khoa học công nghệ và đổi mới sáng tạo: Tương lai của ngành da giày - túi xách Việt Nam trong kỷ nguyên mới",
          createdAt: new Date("2026-06-25").toISOString(),
          origin: "tbsgroup.vn",
          excerpt: "Trong bối cảnh chuỗi cung ứng toàn cầu đang tái cấu trúc mạnh mẽ, bài toán của ngành sản xuất công nghiệp thời trang không còn nằm ở việc gia tăng sản lượng mà là chuyển dịch công nghệ."
        },
        {
          id: "news-3",
          title: "Hội thảo Khoa học Công nghệ TBS lần 1 – TBS Innovation Summit 2026: Động lực số hóa và chiến lược nâng tầm vị thế toàn cầu",
          createdAt: new Date("2026-06-20").toISOString(),
          origin: "tbsgroup.vn",
          excerpt: "Ngày 20/06/2026 vừa qua, Ngành Sản xuất Công nghiệp TBS Group đã tổ chức thành công Hội thảo Khoa học Công nghệ lần 1 – TBS Innovation Summit 2026."
        }
      ]);
    }

    return res.json(parsedNews);
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch news stream" });
  }
});

// 6. Uptime Liveness & Dependency Readiness Checks
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.get("/health/detailed", async (req, res) => {
  const healthInfo: any = {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date(),
    checks: {
      database: "UNKNOWN",
      redis: "UNKNOWN"
    }
  };

  let hasErrors = false;

  // 1. Check PostgreSQL database latency
  try {
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = performance.now() - start;
    healthInfo.checks.database = { status: "UP", latencyMs: Math.round(latency) };
  } catch (err: any) {
    healthInfo.checks.database = { status: "DOWN", error: err.message };
    hasErrors = true;
  }

  // 2. Check Redis connection
  try {
    if (redis && redis.status === "ready") {
      const start = performance.now();
      await redis.ping();
      const latency = performance.now() - start;
      healthInfo.checks.redis = { status: "UP", latencyMs: Math.round(latency) };
    } else {
      healthInfo.checks.redis = { status: "DOWN", error: redis ? `Status: ${redis.status}` : "Client not initialized" };
      hasErrors = true;
    }
  } catch (err: any) {
    healthInfo.checks.redis = { status: "DOWN", error: err.message };
    hasErrors = true;
  }

  if (hasErrors) {
    healthInfo.status = "degraded";
    return res.status(500).json(healthInfo);
  }

  return res.json(healthInfo);
});

// 7. Seed Database and Start Server
async function startServer() {
  try {
    // Perform database seed checks on start
    await seedDatabase();
    
    server.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`  TBS II Server is running on port ${config.port}`);
      console.log(`  CORS Origins: ${config.allowedOrigins.join(", ")}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error("Critical: Failed to launch backend server", error);
    process.exit(1);
  }
}

startServer();

export { app, server };
