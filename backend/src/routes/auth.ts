import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { verifyPassword, hashPassword, isPasswordStrong } from "../utils/crypto";
import { config } from "../config";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { authRateLimiter, recordFailedLogin, clearFailedLogin } from "../middleware/security";
import { redis } from "../utils/redis";

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT
 */
router.post("/login", authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  // Accept both `email` and `empCode` field names
  const email = req.body.email || req.body.empCode;
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Bad Request", message: "Email and password are required." });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
      include: {
        role: true,
        department: true
      }
    });
    
    if (!user) {
      await recordFailedLogin(req.ip || "unknown-ip");
      return res.status(401).json({ error: "Unauthorized", message: "Invalid email or password." });
    }
    
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await recordFailedLogin(req.ip || "unknown-ip");
      return res.status(401).json({ error: "Unauthorized", message: "Invalid email or password." });
    }
    
    // Generate JWT token (expires in 12 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "12h" }
    );
    
    // Record login audit log
    await prisma.ticketLog.create({
      data: {
        ticketId: "", // Empty or custom string since it's general audit log
        action: "USER_LOGIN",
        actorId: user.id,
        comment: `User logged in from IP ${req.ip}`
      }
    }).catch(() => {}); // Gracefully catch if no ticket relationship constraints break (we can customize log model later or use fallback)

    await clearFailedLogin(req.ip || "unknown-ip");

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role.name,
        department: user.department.name,
        departmentId: user.departmentId,
        permissions: user.role.permissions
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error", message: "An unexpected error occurred." });
  }
});

/**
 * @route GET /api/auth/profile
 * @desc Retrieve current logged-in user profile
 */
router.get("/profile", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: true,
        department: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "Not Found", message: "User not found." });
    }
    
    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role.name,
      department: user.department.name,
      departmentId: user.departmentId,
      permissions: user.role.permissions
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 */
router.post("/change-password", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!req.user || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Bad Request", message: "Missing current or new password." });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: "Not Found" });
    }
    
    const isValid = verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: "Bad Request", message: "Current password check failed." });
    }

    // Verify password complexity
    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({
        error: "Weak Password",
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special symbol."
      });
    }
    
    const hashed = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashed,
        lastPasswordChange: new Date()
      }
    });

    // Revoke current session token immediately
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token && redis && redis.status === "ready") {
      await redis.setex(`blacklist:token:${token}`, 12 * 60 * 60, "1");
    }
    
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user and blacklist their JWT token
 */
router.post("/logout", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (token && redis && redis.status === "ready") {
    // Add token to blacklist in Redis for 12 hours (same as token expiration)
    await redis.setex(`blacklist:token:${token}`, 12 * 60 * 60, "1");
  }
  
  return res.json({ success: true, message: "Logged out successfully." });
});

export default router;
