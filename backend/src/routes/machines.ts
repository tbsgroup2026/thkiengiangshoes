import { Router, Response } from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { broadcast, emitToRoom } from "../utils/websocket";

const router = Router();

/**
 * @route GET /api/machines
 * @desc Retrieve all machines with current status (for BI screen / Admin)
 */
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { name: "asc" }
    });
    return res.json(machines);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/machines/qr/:code
 * @desc Retrieve machine by its scanned QR code
 */
router.get("/qr/:code", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.params;
  try {
    const machine = await prisma.machine.findUnique({
      where: { qrCode: code }
    });
    if (!machine) {
      return res.status(404).json({ error: "Not Found", message: "Machine QR Code not recognized." });
    }
    return res.json(machine);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/machines/report
 * @desc Worker reporting error on scanned machine
 */
router.post("/report", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { machineId, description, imageUrl } = req.body;
  if (!req.user || !machineId || !description) {
    return res.status(400).json({ error: "Bad Request", message: "Missing machine ID or description." });
  }

  try {
    const machine = await prisma.machine.findUnique({
      where: { id: machineId }
    });

    if (!machine) {
      return res.status(404).json({ error: "Not Found", message: "Machine not found." });
    }

    // Start database transaction
    const [ticket, updatedMachine] = await prisma.$transaction([
      // 1. Create a ticket in PENDING state
      prisma.ticket.create({
        data: {
          machineId,
          reporterId: req.user.id,
          description,
          imageUrl,
          status: "PENDING"
        },
        include: {
          machine: true,
          reporter: { select: { fullName: true, phone: true } }
        }
      }),
      // 2. Set machine status to REPAIR
      prisma.machine.update({
        where: { id: machineId },
        data: { status: "REPAIR" }
      })
    ]);

    // 3. Create Ticket Log
    await prisma.ticketLog.create({
      data: {
        ticketId: ticket.id,
        action: "REPORT",
        actorId: req.user.id,
        comment: `Machine reported with error: ${description}`
      }
    });

    // 4. Broadcast live update to Office/BI Screen & Maintenance Room via WebSockets
    broadcast("machine-status-change", updatedMachine);
    emitToRoom("maintenance", "new-ticket", ticket);

    return res.json({
      success: true,
      message: "Machine reported successfully. Maintenance team notified.",
      ticket
    });
  } catch (error) {
    console.error("Machine report error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/machines/tickets
 * @desc Retrieve all active tickets
 */
router.get("/tickets", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.query;
  try {
    const filter: any = {};
    if (status) {
      filter.status = status as string;
    }
    const tickets = await prisma.ticket.findMany({
      where: filter,
      include: {
        machine: true,
        reporter: { select: { fullName: true } },
        maintainer: { select: { fullName: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/machines/tickets/:id/claim
 * @desc Maintenance worker claims ticket to begin repair
 */
router.post("/tickets/:id/claim", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found", message: "Ticket not found." });
    }

    if (ticket.status !== "PENDING") {
      return res.status(400).json({ error: "Bad Request", message: "Ticket has already been claimed or completed." });
    }

    const responseTimeSecs = Math.floor((Date.now() - ticket.createdAt.getTime()) / 1000);

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        maintainerId: req.user.id,
        responseTimeSeconds: responseTimeSecs
      },
      include: {
        machine: true,
        reporter: { select: { fullName: true } },
        maintainer: { select: { fullName: true } }
      }
    });

    await prisma.ticketLog.create({
      data: {
        ticketId: id,
        action: "CLAIM",
        actorId: req.user.id,
        comment: `Ticket claimed by maintainer. Response time: ${responseTimeSecs} seconds.`
      }
    });

    // Notify all parties
    broadcast("ticket-claimed", updatedTicket);

    return res.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/machines/tickets/:id/update
 * @desc Update ticket status (e.g. COMPLETED, WAITING_PARTS)
 */
router.post("/tickets/:id/update", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, comment } = req.body; // "WAITING_PARTS" or "COMPLETED"
  
  if (!req.user || !status || !["WAITING_PARTS", "COMPLETED"].includes(status)) {
    return res.status(400).json({ error: "Bad Request", message: "Invalid status parameters." });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Not Found" });
    }

    const updates: any = { status };
    let machineStatus = "REPAIR";

    if (status === "COMPLETED") {
      const resolutionTimeSecs = Math.floor((Date.now() - ticket.createdAt.getTime()) / 1000);
      updates.resolutionTimeSeconds = resolutionTimeSecs;
      machineStatus = "ACTIVE"; // Machine is back operational
    }

    const [updatedTicket, updatedMachine] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id },
        data: updates,
        include: {
          machine: true,
          reporter: { select: { fullName: true } },
          maintainer: { select: { fullName: true } }
        }
      }),
      prisma.machine.update({
        where: { id: ticket.machineId },
        data: { status: machineStatus }
      })
    ]);

    await prisma.ticketLog.create({
      data: {
        ticketId: id,
        action: status === "COMPLETED" ? "RESOLVE" : "HOLD",
        actorId: req.user.id,
        comment: comment || `Ticket status updated to ${status}`
      }
    });

    // Broadcast status change to clients (BI screen, mobile app)
    broadcast("machine-status-change", updatedMachine);
    broadcast("ticket-updated", updatedTicket);

    return res.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/machines/stats
 * @desc Get aggregated stats for the 24/7 BI Screen
 */
router.get("/stats", async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Machine count by state
    const activeCount = await prisma.machine.count({ where: { status: "ACTIVE" } });
    const repairCount = await prisma.machine.count({ where: { status: "REPAIR" } });
    const offlineCount = await prisma.machine.count({ where: { status: "OFFLINE" } });

    // 2. Average response & resolution times (last 30 days)
    const completedTickets = await prisma.ticket.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      select: { responseTimeSeconds: true, resolutionTimeSeconds: true }
    });

    let avgResponse = 0;
    let avgResolution = 0;
    if (completedTickets.length > 0) {
      const totalResponse = completedTickets.reduce((acc: number, t: any) => acc + (t.responseTimeSeconds || 0), 0);
      const totalResolution = completedTickets.reduce((acc: number, t: any) => acc + (t.resolutionTimeSeconds || 0), 0);
      avgResponse = Math.round(totalResponse / completedTickets.length);
      avgResolution = Math.round(totalResolution / completedTickets.length);
    }

    // 3. Top failing machines (based on historical ticket counts)
    const ticketCounts = await prisma.ticket.groupBy({
      by: ["machineId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5
    });

    const topFailingMachines = await Promise.all(
      ticketCounts.map(async (tc: any) => {
        const mach = await prisma.machine.findUnique({
          where: { id: tc.machineId },
          select: { name: true, qrCode: true }
        });
        return {
          name: mach?.name || "Unknown Machine",
          qrCode: mach?.qrCode || "",
          failureCount: tc._count.id
        };
      })
    );

    // 4. Live tickets
    const activeTickets = await prisma.ticket.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS", "WAITING_PARTS"] } },
      include: {
        machine: true,
        reporter: { select: { fullName: true } },
        maintainer: { select: { fullName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      operationalSummary: {
        total: activeCount + repairCount + offlineCount,
        active: activeCount,
        repair: repairCount,
        offline: offlineCount
      },
      kpi: {
        averageResponseSeconds: avgResponse,
        averageResolutionSeconds: avgResolution
      },
      topFailingMachines,
      activeTickets
    });
  } catch (error) {
    console.error("Machine stats error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
