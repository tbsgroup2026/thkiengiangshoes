import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { broadcast, emitToRoom } from "../utils/websocket";

const router = Router();

// Helper to map and format response for mobile
function formatIncident(ticket: any) {
  return {
    id: ticket.id,
    machine_id: ticket.machineId,
    reporter_id: ticket.reporterId,
    maintainer_id: ticket.maintainerId,
    description: ticket.description,
    priority: "HIGH", // Default or fallback
    status: ticket.status,
    response_time_seconds: ticket.responseTimeSeconds,
    resolution_time_seconds: ticket.resolutionTimeSeconds,
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
    machine: ticket.machine ? {
      id: ticket.machine.id,
      name: ticket.machine.name,
      qr_code: ticket.machine.qrCode,
      area: ticket.machine.area,
      status: ticket.machine.status
    } : null,
    reporter: ticket.reporter ? {
      fullName: ticket.reporter.fullName
    } : null
  };
}

/**
 * @route GET /api/v1/incidents
 * @desc Compatibility list active incidents for mobile app
 */
router.get("/incidents", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.query;
  try {
    const filter: any = {};
    if (status) filter.status = status;

    const tickets = await prisma.ticket.findMany({
      where: filter,
      include: { machine: true, reporter: true }
    });

    return res.json(tickets.map(formatIncident));
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/v1/incidents
 * @desc Compatibility report incident (error machinery)
 */
router.post("/incidents", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { machine_id, description } = req.body;
  if (!req.user || !machine_id || !description) {
    return res.status(400).json({ error: "Bad Request", message: "Missing required incident fields." });
  }

  try {
    const machine = await prisma.machine.findUnique({
      where: { id: machine_id }
    });

    if (!machine) {
      // Try resolving by numeric/string id matching fallback or direct string
      return res.status(404).json({ error: "Not Found", message: "Machine not found in database." });
    }

    const [ticket, updatedMachine] = await prisma.$transaction([
      prisma.ticket.create({
        data: {
          machineId: machine.id,
          reporterId: req.user.id,
          description,
          status: "PENDING"
        },
        include: { machine: true, reporter: true }
      }),
      prisma.machine.update({
        where: { id: machine.id },
        data: { status: "REPAIR" }
      })
    ]);

    await prisma.ticketLog.create({
      data: {
        ticketId: ticket.id,
        action: "REPORT",
        actorId: req.user.id,
        comment: `Incident reported via mobile API/v1. Desc: ${description}`
      }
    });

    broadcast("machine-status-change", updatedMachine);
    emitToRoom("maintenance", "new-ticket", ticket);

    return res.json(formatIncident(ticket));
  } catch (error) {
    console.error("Compatibility report error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/v1/incidents/:id/accept
 * @desc Compatibility claim incident
 */
router.post("/incidents/:id/accept", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: "Not Found" });

    const responseTimeSecs = Math.floor((Date.now() - ticket.createdAt.getTime()) / 1000);

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        maintainerId: req.user.id,
        responseTimeSeconds: responseTimeSecs
      },
      include: { machine: true, reporter: true }
    });

    await prisma.ticketLog.create({
      data: {
        ticketId: id,
        action: "CLAIM",
        actorId: req.user.id,
        comment: `Incident claimed via mobile API/v1.`
      }
    });

    broadcast("ticket-claimed", updatedTicket);

    return res.json(formatIncident(updatedTicket));
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/v1/incidents/:id/resolve
 * @desc Compatibility resolve incident
 */
router.post("/incidents/:id/resolve", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { root_cause, resolution_notes } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: "Not Found" });

    const resolutionTimeSecs = Math.floor((Date.now() - ticket.createdAt.getTime()) / 1000);

    const [updatedTicket, updatedMachine] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id },
        data: {
          status: "COMPLETED",
          resolutionTimeSeconds: resolutionTimeSecs
        },
        include: { machine: true, reporter: true }
      }),
      prisma.machine.update({
        where: { id: ticket.machineId },
        data: { status: "ACTIVE" }
      })
    ]);

    await prisma.ticketLog.create({
      data: {
        ticketId: id,
        action: "RESOLVE",
        actorId: req.user.id,
        comment: `Incident resolved via mobile API/v1. Cause: ${root_cause}. Notes: ${resolution_notes}`
      }
    });

    broadcast("machine-status-change", updatedMachine);
    broadcast("ticket-updated", updatedTicket);

    return res.json(formatIncident(updatedTicket));
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/v1/office-docs
 * @desc Compatibility fetch office docs
 */
router.get("/office-docs", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const docs = await prisma.document.findMany({
      where: {
        OR: [
          { creatorId: req.user.id },
          { currentAssigneeId: req.user.id }
        ]
      },
      include: { creator: true }
    });

    // Match output format
    return res.json(docs.map((d: any) => ({
      id: d.id,
      doc_type: d.documentType,
      title: d.title,
      content: JSON.stringify(d.data),
      status: d.state,
      creator_name: d.creator.fullName,
      created_at: d.createdAt
    })));
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/v1/office-docs
 * @desc Compatibility create office doc
 */
router.post("/office-docs", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { doc_type, title, content } = req.body;
  if (!req.user || !doc_type || !title) return res.status(400).json({ error: "Bad Request" });

  try {
    const doc = await prisma.document.create({
      data: {
        documentType: doc_type,
        title,
        state: "PENDING", // fallback state
        creatorId: req.user.id,
        departmentId: req.user.departmentId,
        data: JSON.stringify({ text_content: content })
      },
      include: { creator: true }
    }) as any;

    return res.json({
      id: doc.id,
      doc_type: doc.documentType,
      title: doc.title,
      content: doc.data,
      status: doc.state,
      creator_name: doc.creator?.fullName || ""
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
