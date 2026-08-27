import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";

const router = Router();

// GET /api/rooms - Get all chat rooms
router.get("/", async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(rooms);
  } catch (error: any) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms/:id - Get room by ID with messages
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        messages: {
          select: {
            id: true,
            text: true,
            attachmentUrl: true,
            sender: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 50, // Limit to last 50 messages
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (error: any) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms - Create a new chat room
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, type, departmentId } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Missing required fields: name, type" });
    }

    if (!["DEPARTMENT", "DOCUMENT_GROUP"].includes(type)) {
      return res.status(400).json({ error: "Invalid room type" });
    }

    const room = await prisma.chatRoom.create({
      data: {
        name,
        type,
        departmentId: departmentId || null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        departmentId: true,
        createdAt: true,
      },
    });

    res.status(201).json(room);
  } catch (error: any) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms/:id/messages - Post a message to a room
router.post("/:id/messages", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { senderId, text, attachmentUrl, documentId } = req.body;

    if (!senderId || !text) {
      return res.status(400).json({ error: "Missing required fields: senderId, text" });
    }

    // Verify room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId: id,
        senderId,
        text,
        attachmentUrl: attachmentUrl || null,
        documentId: documentId || null,
      },
      select: {
        id: true,
        text: true,
        attachmentUrl: true,
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        createdAt: true,
      },
    });

    res.status(201).json(message);
  } catch (error: any) {
    console.error("Error posting message:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User or room not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/rooms/:id - Update a room
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, departmentId } = req.body;

    const room = await prisma.chatRoom.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(departmentId !== undefined && { departmentId }),
      },
      select: {
        id: true,
        name: true,
        type: true,
        departmentId: true,
        updatedAt: true,
      },
    });

    res.json(room);
  } catch (error: any) {
    console.error("Error updating room:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/rooms/:id - Delete a room
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.chatRoom.delete({
      where: { id },
    });

    res.json({ message: "Room deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
