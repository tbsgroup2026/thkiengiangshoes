import { Router, Response } from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { broadcast } from "../utils/websocket";

const router = Router();

/**
 * Checks if a specific department currently has any workflows delayed beyond their SLA.
 * Used to block downstream document creation.
 */
async function isDepartmentBlocked(departmentId: string): Promise<boolean> {
  const delayedCount = await prisma.document.count({
    where: {
      departmentId,
      state: "DELAYED"
    }
  });
  return delayedCount > 0;
}

/**
 * @route POST /api/documents
 * @desc Create a new digital document and start its workflow chain
 */
router.post("/", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { documentType, title, data, linkedDocumentIds } = req.body;
  if (!req.user || !documentType || !title || !data) {
    return res.status(400).json({ error: "Bad Request", message: "Missing required document parameters." });
  }

  try {
    // 1. Check if department is blocked due to SLA trì trệ (3h breach)
    const isBlocked = await isDepartmentBlocked(req.user.departmentId);
    if (isBlocked && req.user.role !== "ADMIN" && req.user.role !== "GIAM_DOC") {
      return res.status(400).json({
        error: "Workflow Blocked",
        message: "Department workflows are currently suspended due to an outstanding SLA delay. Please resolve pending tasks first."
      });
    }

    // 2. Load the workflow definition for this document type
    const workflow = await prisma.workflow.findUnique({
      where: { triggerDocumentType: documentType }
    });

    let initialState = "APPROVED"; // Default if no workflow exists
    let nextAssigneeId: string | null = null;
    let slaDeadline: Date | null = null;

    if (workflow) {
      const steps = JSON.parse(workflow.steps) as any[];
      if (steps && steps.length > 0) {
        const firstStep = steps[0];
        initialState = firstStep.name; // e.g., "DEPT_HEAD_APPROVAL"
        
        // Find a user in the target role and department to assign the first step
        const assignee = await prisma.user.findFirst({
          where: {
            role: { name: firstStep.role },
            departmentId: firstStep.department === "SAME" ? req.user.departmentId : undefined
          }
        });
        
        nextAssigneeId = assignee ? assignee.id : null;
        
        const slaHours = firstStep.slaHours || 3;
        slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
      }
    }

    // 3. Create the document in DB
    const doc = await prisma.document.create({
      data: {
        documentType,
        title,
        state: initialState,
        creatorId: req.user.id,
        currentAssigneeId: nextAssigneeId,
        departmentId: req.user.departmentId,
        data,
        slaDeadline
      },
      include: {
        creator: { select: { fullName: true } },
        currentAssignee: { select: { fullName: true } }
      }
    });

    // 4. Create initial history record
    await prisma.documentHistory.create({
      data: {
        documentId: doc.id,
        actorId: req.user.id,
        previousState: "DRAFT",
        nextState: initialState,
        comment: "Document created and workflow initiated."
      }
    });

    // 5. Link documents if requested (cross-linking departments)
    if (linkedDocumentIds && Array.isArray(linkedDocumentIds)) {
      await Promise.all(
        linkedDocumentIds.map((linkId: string) =>
          prisma.documentLink.create({
            data: {
              documentAId: doc.id,
              documentBId: linkId,
              linkageType: "REFERENCE"
            }
          })
        )
      );
    }

    // 6. Broadcast notification to office channels
    broadcast("new-document", doc);

    return res.json({ success: true, document: doc });
  } catch (error) {
    console.error("Document creation error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route GET /api/documents
 * @desc Retrieve documents that the user has permission to see (RBAC filtered)
 */
router.get("/", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const role = req.user.role;
    let whereClause: any = {};

    if (role !== "ADMIN" && role !== "GIAM_DOC") {
      // Normal staff and managers see:
      // 1. Documents they created
      // 2. Documents assigned to them
      // 3. (If Trưởng phòng) Documents belonging to their department
      // 4. Linked documents where they are involved in either side
      const clauses: any[] = [
        { creatorId: req.user.id },
        { currentAssigneeId: req.user.id }
      ];

      if (role === "TRUONG_PHONG") {
        clauses.push({ departmentId: req.user.departmentId });
      }

      whereClause.OR = clauses;
    }

    const docs = await prisma.document.findMany({
      where: whereClause,
      include: {
        creator: { select: { fullName: true, departmentId: true } },
        currentAssignee: { select: { fullName: true } },
        department: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/documents/:id/approve
 * @desc Approve a document and transition it to the next workflow step
 */
router.post("/:id/approve", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { comment } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const doc = await prisma.document.findUnique({
      where: { id }
    });

    if (!doc) {
      return res.status(404).json({ error: "Not Found", message: "Document not found." });
    }

    // Only current assignee or Admin can approve
    if (doc.currentAssigneeId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden", message: "You are not assigned to approve this document." });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { triggerDocumentType: doc.documentType }
    });

    let nextState = "APPROVED";
    let nextAssigneeId: string | null = null;
    let nextSlaDeadline: Date | null = null;
    let currentStepName = doc.state;

    if (workflow) {
      const steps = JSON.parse(workflow.steps) as any[];
      const currentIndex = steps.findIndex(step => step.name === doc.state);
      
      if (currentIndex !== -1 && currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        nextState = nextStep.name;
        
        // Find user for the next workflow step
        const assignee = await prisma.user.findFirst({
          where: {
            role: { name: nextStep.role },
            departmentId: nextStep.department === "SAME" ? doc.departmentId : undefined
          }
        });
        
        nextAssigneeId = assignee ? assignee.id : null;
        
        const slaHours = nextStep.slaHours || 3;
        nextSlaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
      }
    }

    const now = new Date();
    const isSlaBreached = doc.slaDeadline ? now > doc.slaDeadline : false;
    const timeTaken = doc.slaDeadline ? Math.floor((now.getTime() - doc.updatedAt.getTime()) / 1000) : 0;

    const [updatedDoc] = await prisma.$transaction([
      // 1. Update Document State
      prisma.document.update({
        where: { id },
        data: {
          state: nextState,
          currentAssigneeId: nextAssigneeId,
          slaDeadline: nextSlaDeadline
        },
        include: {
          creator: { select: { fullName: true } },
          currentAssignee: { select: { fullName: true } }
        }
      }),
      // 2. Log workflow step completion
      prisma.workflowLog.create({
        data: {
          documentId: id,
          stepName: currentStepName,
          executorId: req.user.id,
          action: "APPROVE",
          timeTaken,
          status: isSlaBreached ? "EXPIRED" : "COMPLETED",
          slaBreached: isSlaBreached
        }
      }),
      // 3. Log History
      prisma.documentHistory.create({
        data: {
          documentId: id,
          actorId: req.user.id,
          previousState: doc.state,
          nextState: nextState,
          comment: comment || "Approved step"
        }
      })
    ]);

    broadcast("document-updated", updatedDoc);

    return res.json({ success: true, document: updatedDoc });
  } catch (error) {
    console.error("Document approval error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/documents/:id/reject
 * @desc Reject a document, stopping the workflow
 */
router.post("/:id/reject", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { comment } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const doc = await prisma.document.findUnique({
      where: { id }
    });

    if (!doc) {
      return res.status(404).json({ error: "Not Found" });
    }

    if (doc.currentAssigneeId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [updatedDoc] = await prisma.$transaction([
      prisma.document.update({
        where: { id },
        data: {
          state: "REJECTED",
          currentAssigneeId: null,
          slaDeadline: null
        },
        include: {
          creator: { select: { fullName: true } }
        }
      }),
      prisma.documentHistory.create({
        data: {
          documentId: id,
          actorId: req.user.id,
          previousState: doc.state,
          nextState: "REJECTED",
          comment: comment || "Document rejected."
        }
      })
    ]);

    broadcast("document-updated", updatedDoc);

    return res.json({ success: true, document: updatedDoc });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /api/documents/cron/check-sla
 * @desc Admin/Cron trigger to verify SLA deadlines and flag delayed documents
 */
router.post("/cron/check-sla", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    
    // Find all active documents that have breached their SLA deadline
    const expiredDocs = await prisma.document.findMany({
      where: {
        slaDeadline: { lt: now },
        state: { notIn: ["APPROVED", "REJECTED", "DELAYED"] }
      }
    });

    if (expiredDocs.length > 0) {
      await Promise.all(
        expiredDocs.map(async (doc: any) => {
          // 1. Update state to DELAYED
          const updatedDoc = await prisma.document.update({
            where: { id: doc.id },
            data: { state: "DELAYED" },
            include: {
              creator: { select: { fullName: true } },
              currentAssignee: { select: { fullName: true } }
            }
          });

          // 2. Log step violation
          await prisma.documentHistory.create({
            data: {
              documentId: doc.id,
              actorId: doc.currentAssigneeId || doc.creatorId, // Flag current assignee
              previousState: doc.state,
              nextState: "DELAYED",
              comment: "System flagged document as OVERDUE due to SLA 3-hour breach."
            }
          });

          // 3. Broadcast Alert to office WebSocket channel
          broadcast("workflow-sla-breached", {
            documentId: doc.id,
            title: doc.title,
            documentType: doc.documentType,
            creator: updatedDoc.creator.fullName,
            assignee: updatedDoc.currentAssignee?.fullName || "Unassigned",
            departmentId: doc.departmentId
          });
        })
      );
    }

    return res.json({ success: true, processedCount: expiredDocs.length });
  } catch (error) {
    console.error("SLA Check error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
