import { Router, Response } from "express";
import prisma from "../utils/prisma";
import { hashPassword, isPasswordStrong } from "../utils/crypto";
import { authenticateToken, requirePermission, AuthenticatedRequest } from "../middleware/auth";
import { runContentSync } from "../services/sync";

const router = Router();

/**
 * @route POST /api/admin/users/import
 * @desc Mass import users (from parsed CSV/Excel)
 */
router.post("/users/import", authenticateToken as any, requirePermission("admin-settings") as any, async (req: AuthenticatedRequest, res: Response) => {
  const { users } = req.body; // Array of objects: { email, fullName, password, phone, departmentCode, roleName }
  
  if (!users || !Array.isArray(users)) {
    return res.status(400).json({ error: "Bad Request", message: "Users array is missing or invalid." });
  }

  const results = {
    created: 0,
    skipped: 0,
    errors: [] as string[]
  };

  try {
    // Fetch all departments & roles for fast cache mapping
    const departments = await prisma.department.findMany();
    const roles = await prisma.role.findMany();

    const deptMap = new Map(departments.map((d: any) => [d.code.toUpperCase(), d.id]));
    const roleMap = new Map(roles.map((r: any) => [r.name.toUpperCase(), r.id]));

    await Promise.all(
      users.map(async (u, idx) => {
        const { email, fullName, password, phone, departmentCode, roleName } = u;

        if (!email || !fullName || !password || !departmentCode || !roleName) {
          results.errors.push(`Row ${idx + 1}: Missing required fields.`);
          results.skipped++;
          return;
        }

        const deptId = deptMap.get(departmentCode.toUpperCase());
        const roleId = roleMap.get(roleName.toUpperCase());

        if (!deptId) {
          results.errors.push(`Row ${idx + 1}: Department code "${departmentCode}" not found.`);
          results.skipped++;
          return;
        }

        if (!roleId) {
          results.errors.push(`Row ${idx + 1}: Role name "${roleName}" not found.`);
          results.skipped++;
          return;
        }

        // Check if user already exists
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
          results.errors.push(`Row ${idx + 1}: Email "${email}" already registered.`);
          results.skipped++;
          return;
        }

        // Validate password complexity
        if (!isPasswordStrong(password)) {
          results.errors.push(`Row ${idx + 1}: Password does not meet security requirements.`);
          results.skipped++;
          return;
        }

        const passwordHash = hashPassword(password);

        await prisma.user.create({
          data: {
            email,
            passwordHash,
            fullName,
            phone,
            departmentId: deptId,
            roleId
          }
        });
        results.created++;
      })
    );

    // Audit Log the bulk import
    await prisma.ticketLog.create({
      data: {
        ticketId: "",
        action: "BULK_IMPORT_USERS",
        actorId: req.user!.id,
        comment: `Admin imported ${results.created} accounts (skipped ${results.skipped}).`
      }
    }).catch(() => {});

    return res.json({ success: true, results });
  } catch (error) {
    console.error("Bulk import error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/admin/workflows
 * @desc Retrieve workflows configuration
 */
router.get("/workflows", authenticateToken as any, requirePermission("admin-settings") as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workflows = await prisma.workflow.findMany();
    return res.json(workflows);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/admin/workflows
 * @desc Configure/Create custom workflows
 */
router.post("/workflows", authenticateToken as any, requirePermission("admin-settings") as any, async (req: AuthenticatedRequest, res: Response) => {
  const { triggerDocumentType, name, steps } = req.body;
  if (!triggerDocumentType || !name || !steps || !Array.isArray(steps)) {
    return res.status(400).json({ error: "Bad Request", message: "Missing required workflow definitions." });
  }

  try {
    const workflow = await prisma.workflow.upsert({
      where: { triggerDocumentType },
      update: { name, steps: JSON.stringify(steps) },
      create: { triggerDocumentType, name, steps: JSON.stringify(steps) }
    });

    return res.json({ success: true, workflow });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/admin/audit-logs
 * @desc Retrieve system operation audit logs
 */
router.get("/audit-logs", authenticateToken as any, requirePermission("admin-settings") as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.ticketLog.findMany({
      include: {
        actor: { select: { fullName: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/admin/sync
 * @desc Trigger manual synchronization crawler
 */
router.post("/sync", authenticateToken as any, requirePermission("admin-settings") as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const results = await runContentSync();
    return res.json({ success: true, results });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
