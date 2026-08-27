import { Router, Response } from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { emitToRoom } from "../utils/websocket";

const router = Router();

/**
 * @route GET /api/chat/rooms
 * @desc List all rooms user can access
 */
router.get("/rooms", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Rooms are filterable:
    // 1. Department chat rooms matching user's department
    // 2. Document coordination groups
    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { departmentId: req.user.departmentId },
          { type: "DOCUMENT_GROUP" } // Coordination groups open to office
        ]
      },
      include: {
        department: { select: { name: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return res.json(rooms);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/chat/rooms/:id/messages
 * @desc Retrieve message logs for a room
 */
router.get("/rooms/:id/messages", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { roomId: id },
      include: {
        sender: { select: { fullName: true, roleId: true } },
        document: {
          select: {
            id: true,
            title: true,
            documentType: true,
            state: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/chat/messages
 * @desc Send new message (text, attachment, or attached document card)
 */
router.post("/messages", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { roomId, text, attachmentUrl, documentId } = req.body;
  if (!req.user || !roomId || (!text && !attachmentUrl && !documentId)) {
    return res.status(400).json({ error: "Bad Request", message: "Missing message payload details." });
  }

  try {
    // 1. Create chat message
    const msg = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: req.user.id,
        text: text || "",
        attachmentUrl,
        documentId
      },
      include: {
        sender: { select: { fullName: true } },
        document: {
          select: {
            id: true,
            title: true,
            documentType: true,
            state: true
          }
        }
      }
    });

    // 2. Update room timestamp
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    });

    // 3. Emit message via WebSockets to room participants
    emitToRoom(roomId, "chat-msg", msg);

    return res.json({ success: true, message: msg });
  } catch (error) {
    console.error("Chat message error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
