import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import prisma from "../utils/prisma";
import { redis } from "../utils/redis";

// Extend the Express Request interface to carry authenticated user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    departmentId: string;
    permissions: {
      screens: string[];
      endpoints: string[];
      writeAccess: boolean;
    };
  };
}

/**
 * JWT Authentication verification middleware
 */
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "Access token is missing." });
  }
  
  try {
    // Check Redis Blacklist
    if (redis && redis.status === "ready") {
      const isBlacklisted = await redis.get(`blacklist:token:${token}`);
      if (isBlacklisted === "1") {
        return res.status(401).json({ error: "Unauthorized", message: "Session revoked. Please log in again." });
      }
    }
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; iat?: number };
    
    // Fetch full user details along with role and permissions from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id, isActive: true },
      include: {
        role: true,
        department: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", message: "User account is suspended or invalid." });
    }
    
    // Invalidate token if it was issued before a password change
    if (user.lastPasswordChange && decoded.iat) {
      const tokenIssueTime = new Date(decoded.iat * 1000);
      if (user.lastPasswordChange > tokenIssueTime) {
        return res.status(401).json({ error: "Unauthorized", message: "Password was changed recently. Please log in again." });
      }
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      departmentId: user.departmentId,
      permissions: user.role.permissions as any
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden", message: "Session expired or token is invalid." });
  }
}

/**
 * Endpoint-level role & permission check middleware
 */
export function requirePermission(requiredPermission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userRole = req.user.role;
    const permissions = req.user.permissions;
    
    // Admin has access to everything
    if (userRole === "ADMIN") {
      return next();
    }
    
    // Check if permissions contains the endpoint/action permission
    const hasPermission = permissions.endpoints.includes(requiredPermission) || 
                          permissions.endpoints.includes("*");
                          
    if (!hasPermission) {
      return res.status(403).json({
        error: "Access Denied",
        message: "You do not have permission to access this resource."
      });
    }
    
    next();
  };
}

/**
 * Restricts query records so users can only access documents linked to their own department,
 * unless they have global read permissions (GIAM_DOC/ADMIN).
 */
export function restrictToDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const role = req.user.role;
  
  // Directors and Admins can view records across all departments
  if (role === "GIAM_DOC" || role === "ADMIN") {
    return next();
  }
  
  // Normal users are restricted to their department ID. We attach this to query options or check it in endpoint.
  next();
}
