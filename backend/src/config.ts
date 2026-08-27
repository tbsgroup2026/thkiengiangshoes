import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || "8000",
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tbs2?schema=public",
  jwtSecret: process.env.JWT_SECRET || "TBS2_SECRET_KEY_SUPER_SECURE_2026",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000").split(","),
  adminApiKey: process.env.ADMIN_API_KEY || "TBS2_PLC_TELEMETRY_API_KEY_SECRET_2026",
  slaDefaultHours: 3, // SLA breach timeout in hours
};
