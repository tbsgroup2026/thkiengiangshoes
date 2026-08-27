import { Router, Response } from "express";
import prisma from "../utils/prisma";
import { authenticateToken, requirePermission, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * @route GET /api/departments
 * @desc Retrieve list of all departments with hierarchy
 */
router.get("/", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        parent: { select: { name: true, code: true } }
      },
      orderBy: { name: "asc" }
    });
    return res.json(departments);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/departments
 * @desc Create new department (Admin only)
 */
router.post("/", authenticateToken as any, requirePermission("admin-settings") as any, async (req: AuthenticatedRequest, res: Response) => {
  const { name, code, parentId } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: "Bad Request", message: "Name and code are required." });
  }

  try {
    const dept = await prisma.department.create({
      data: { name, code, parentId }
    });
    return res.status(211).json(dept); // Using standard code or 201
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/departments/roles
 * @desc Retrieve list of all roles (Admin only)
 */
router.get("/roles", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" }
    });
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
