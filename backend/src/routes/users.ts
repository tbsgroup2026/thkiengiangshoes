import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";

const router = Router();

// GET /api/users - Get all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        departmentId: true,
        roleId: true,
        isActive: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users?id=:id - Get user by ID or query parameter
router.get("/:id?", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id || req.query.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Create a new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, fullName, phone, departmentId, roleId, passwordHash } = req.body;

    if (!email || !fullName || !departmentId || !roleId || !passwordHash) {
      return res.status(400).json({ 
        error: "Missing required fields: email, fullName, departmentId, roleId, passwordHash" 
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        phone: phone || null,
        departmentId,
        roleId,
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        departmentId: true,
        roleId: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update a user
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phone, roleId, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(roleId && { roleId }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        roleId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error("Error updating user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Soft delete a user (mark as inactive)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    res.json({ message: "User deactivated successfully", user });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
