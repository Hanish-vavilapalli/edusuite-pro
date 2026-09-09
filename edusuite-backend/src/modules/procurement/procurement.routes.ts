import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";
import { auditLog } from "../super-admin/super-admin.routes";
import { WORKFLOW_DEFINITIONS, WorkflowStepDef } from "../approvals/workflowEngine";

const router = Router();

// Department code to prefix / aliases map
function resolveDeptAliases(dept: string): { code: string; fullNames: string[]; prefix: string } {
  const clean = (dept || "CSE").toUpperCase().trim();
  if (clean === "CSE" || clean === "CS" || clean.includes("COMPUTER")) {
    return { code: "CSE", fullNames: ["CSE", "CS", "Computer Science", "Computer Science & Engineering"], prefix: "CS" };
  } else if (clean === "ECE" || clean === "EC" || clean.includes("ELECTRONICS")) {
    return { code: "ECE", fullNames: ["ECE", "EC", "Electronics", "Electronics & Communication Engineering"], prefix: "EC" };
  } else if (clean === "EEE" || clean === "EE" || clean.includes("ELECTRICAL")) {
    return { code: "EEE", fullNames: ["EEE", "EE", "Electrical", "Electrical & Electronics Engineering"], prefix: "EE" };
  } else if (clean === "ME" || clean === "MECHANICAL" || clean.includes("MECHANICAL")) {
    return { code: "ME", fullNames: ["ME", "MECHANICAL", "Mechanical", "Mechanical Engineering"], prefix: "ME" };
  } else if (clean === "CIVIL" || clean === "CE" || clean.includes("CIVIL")) {
    return { code: "CIVIL", fullNames: ["CIVIL", "CE", "Civil", "Civil Engineering"], prefix: "CE" };
  } else if (clean.includes("AI&ML") || clean.includes("AIML")) {
    return { code: "AI&ML", fullNames: ["AI&ML", "AIML", "Artificial Intelligence & Machine Learning"], prefix: "AM" };
  } else if (clean.includes("AI&DS") || clean.includes("AIDS")) {
    return { code: "AI&DS", fullNames: ["AI&DS", "AIDS", "Artificial Intelligence & Data Science"], prefix: "AD" };
  } else if (clean === "IT" || clean.includes("INFORMATION")) {
    return { code: "IT", fullNames: ["IT", "Information Technology"], prefix: "IT" };
  } else if (clean === "MBA") {
    return { code: "MBA", fullNames: ["MBA", "Master of Business Administration"], prefix: "MBA" };
  }
  return { code: clean, fullNames: [clean], prefix: clean.slice(0, 2) };
}

async function resolveUserDepartment(req: AuthenticatedRequest): Promise<string | null> {
  const role = (req.userRole || "").toLowerCase();
  if (role === "super_admin" || role === "superadmin") {
    return (req.query.department as string) || (req.query.departmentId as string) || null;
  }
  let dept = req.userDepartment || null;
  if (!dept && req.userId) {
    const fac = await prisma.faculty.findUnique({ where: { id: req.userId }, select: { department: true } });
    dept = fac?.department || null;
  }
  return dept;
}

function blockCrossDeptQuery(req: AuthenticatedRequest, userDept: string, res: Response): boolean {
  const role = (req.userRole || "").toLowerCase();
  const isSA = role.includes("super_admin") || role.includes("superadmin");
  if (isSA) return false;

  const requestedDept = (req.query.department as string) || (req.query.departmentId as string);
  if (requestedDept) {
    const di = resolveDeptAliases(userDept);
    const reqClean = requestedDept.trim().toUpperCase();
    if (reqClean !== di.code && !di.fullNames.some((n) => n.toUpperCase() === reqClean)) {
      res.status(403).json({ error: "Access denied. HOD is restricted strictly to their own department scope." });
      return true;
    }
  }
  return false;
}

// Format an ApprovalRequest record for procurement presentation
function formatProcurementRecord(r: any) {
  let metadata: any = {};
  try {
    if (r.metadata) metadata = typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata;
  } catch {}

  let steps: any[] = [];
  try {
    if (r.stepsJson) steps = typeof r.stepsJson === "string" ? JSON.parse(r.stepsJson) : r.stepsJson;
  } catch {}

  return {
    id: r.id,
    requestNumber: r.requestNumber,
    requestType: r.requestType, // "EQUIPMENT_REQUEST" | "DAMAGE_REPORT"
    module: r.module,
    workflowCode: r.workflowCode,
    title: r.title,
    description: r.description,
    department: r.department,
    requestedBy: r.requestedBy,
    requestedByRole: r.requestedByRole,
    priority: r.priority || "High",
    status: r.status,
    currentStage: r.currentStage,
    currentStep: r.currentStep,
    totalSteps: r.totalSteps,
    amount: r.amount,
    entityType: r.entityType,
    entityId: r.entityId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    metadata,
    steps,
  };
}

// ==========================================
// 1. GET DEPARTMENT-SCOPED ASSETS (FOR DAMAGE REPORT SELECTOR)
// ==========================================
router.get("/department-assets", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userDept = await resolveUserDepartment(req);
    const role = (req.userRole || "").toLowerCase();
    const isSA = role.includes("super_admin") || role.includes("superadmin");

    let where: any = {};
    if (!isSA) {
      if (!userDept) {
        return res.json([]);
      }
      const di = resolveDeptAliases(userDept);
      where.OR = [
        { department: { in: di.fullNames, mode: "insensitive" } },
        { department: { equals: di.code, mode: "insensitive" } },
        { location: { contains: di.code, mode: "insensitive" } },
        { assetTag: { startsWith: di.prefix, mode: "insensitive" } },
      ];
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { assetTag: "asc" },
      select: {
        id: true,
        assetTag: true,
        name: true,
        category: true,
        department: true,
        location: true,
        status: true,
        quantity: true,
        unitCost: true,
      },
    });

    return res.json(
      items.map((it) => ({
        ...it,
        itemCode: it.assetTag,
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. GET PROCUREMENT STATS (DEPARTMENT-SCOPED)
// ==========================================
router.get("/stats", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userDept = await resolveUserDepartment(req);
    const role = (req.userRole || "").toLowerCase();
    const isSA = role.includes("super_admin") || role.includes("superadmin");

    if (userDept && blockCrossDeptQuery(req, userDept, res)) return;

    let where: any = {
      OR: [
        { module: { in: ["PROCUREMENT", "INVENTORY"] } },
        { workflowCode: { in: ["EQUIPMENT_PROCUREMENT", "EQUIPMENT_DAMAGE_REPORT"] } },
        { requestType: { in: ["EQUIPMENT_REQUEST", "DAMAGE_REPORT", "PURCHASE_ORDER"] } },
      ],
    };

    if (!isSA && userDept) {
      const di = resolveDeptAliases(userDept);
      where.department = { in: [...di.fullNames, di.code], mode: "insensitive" };
    }

    const records = await prisma.approvalRequest.findMany({ where });

    const openRequests = records.filter(
      (r) =>
        r.requestType === "EQUIPMENT_REQUEST" &&
        r.status !== "REJECTED" &&
        r.status !== "EXECUTED" &&
        r.status !== "FINALIZED"
    ).length;

    const pendingApprovals = records.filter(
      (r) => r.status === "PENDING" || r.status === "SUBMITTED" || r.status === "IN_REVIEW"
    ).length;

    const approvedRequests = records.filter(
      (r) =>
        r.status === "APPROVED" ||
        r.status === "EXECUTED" ||
        r.status === "FINALIZED" ||
        r.status === "SUPER_ADMIN_ACCEPTED"
    ).length;

    const damageReports = records.filter((r) => r.requestType === "DAMAGE_REPORT").length;

    const totalEstimatedSpend = records
      .filter((r) => r.requestType === "EQUIPMENT_REQUEST")
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return res.json({
      departmentScope: isSA ? "Institution-Wide" : userDept || "All",
      openRequests,
      pendingApprovals,
      approvedRequests,
      damageReports,
      totalEstimatedSpend,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. GET PROCUREMENT RECORDS LIST (FILTERED & SCOPED)
// ==========================================
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userDept = await resolveUserDepartment(req);
    const role = (req.userRole || "").toLowerCase();
    const isSA = role.includes("super_admin") || role.includes("superadmin");

    if (userDept && blockCrossDeptQuery(req, userDept, res)) return;

    const { type, status, search } = req.query;

    const where: any = {
      OR: [
        { module: { in: ["PROCUREMENT", "INVENTORY"] } },
        { workflowCode: { in: ["EQUIPMENT_PROCUREMENT", "EQUIPMENT_DAMAGE_REPORT"] } },
        { requestType: { in: ["EQUIPMENT_REQUEST", "DAMAGE_REPORT"] } },
      ],
    };

    if (!isSA && userDept) {
      const di = resolveDeptAliases(userDept);
      where.department = { in: [...di.fullNames, di.code], mode: "insensitive" };
    } else if (isSA && req.query.department && req.query.department !== "All Departments") {
      const di = resolveDeptAliases(String(req.query.department));
      where.department = { in: [...di.fullNames, di.code], mode: "insensitive" };
    }

    if (type && type !== "All" && type !== "all") {
      where.requestType = String(type);
    }

    if (status && status !== "All" && status !== "all") {
      where.status = String(status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.AND = [
        {
          OR: [
            { requestNumber: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { requestedBy: { contains: q, mode: "insensitive" } },
            { department: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    const records = await prisma.approvalRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(records.map(formatProcurementRecord));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CREATE NEW EQUIPMENT REQUEST (POST /api/procurement/request)
// ==========================================
router.post("/request", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = (req.userRole || "").toLowerCase();
    const isSA = role.includes("super_admin") || role.includes("superadmin");

    // Strictly resolve department on the server side
    let resolvedDept = await resolveUserDepartment(req);
    if (!resolvedDept && !isSA) {
      return res.status(400).json({ error: "Authenticated user is not linked to any recognized academic department." });
    }
    if (isSA && req.body.department) {
      resolvedDept = req.body.department;
    }
    const deptInfo = resolveDeptAliases(resolvedDept || "CSE");

    const {
      equipmentName,
      category = "Lab Equipment",
      quantity = 1,
      requiredFor,
      location,
      priority = "High",
      estimatedUnitCost,
      estimatedTotalCost,
      justification,
      requiredByDate,
      supportingDoc,
    } = req.body;

    if (!equipmentName || !justification) {
      return res.status(400).json({ error: "Equipment name and justification are required." });
    }

    const qty = parseInt(quantity, 10) || 1;
    const unitCost = estimatedUnitCost ? parseFloat(estimatedUnitCost) : 0;
    const totalCost = estimatedTotalCost ? parseFloat(estimatedTotalCost) : unitCost * qty;

    // Resolve workflow definition
    const wfDef = WORKFLOW_DEFINITIONS.EQUIPMENT_PROCUREMENT;
    const count = await prisma.approvalRequest.count();
    const requestNumber = `REQ-2026-${String(count + 1).padStart(4, "0")}`;

    const initialSteps: WorkflowStepDef[] = wfDef.steps.map((s, idx) => {
      if (idx === 0) {
        return {
          ...s,
          status: "APPROVED",
          action: "SUBMITTED",
          comment: `Equipment request initiated by ${req.userId || req.userRole}`,
          actedAt: new Date().toISOString(),
          actorId: req.userId,
          actorName: req.userRole,
        };
      }
      return { ...s, status: "PENDING" };
    });

    const metadata = {
      equipmentName,
      category,
      quantity: qty,
      requiredFor: requiredFor || `${deptInfo.code} Department`,
      location: location || `${deptInfo.code} Department`,
      estimatedUnitCost: unitCost,
      estimatedTotalCost: totalCost,
      justification,
      requiredByDate: requiredByDate || null,
      supportingDoc: supportingDoc || null,
      submittedAt: new Date().toISOString(),
    };

    const record = await prisma.approvalRequest.create({
      data: {
        requestNumber,
        requestType: "EQUIPMENT_REQUEST",
        module: "PROCUREMENT",
        workflowCode: "EQUIPMENT_PROCUREMENT",
        title: `${equipmentName} (${qty} ${qty > 1 ? "units" : "unit"})`,
        description: justification,
        amount: totalCost,
        department: deptInfo.code,
        currentStep: 2,
        totalSteps: wfDef.totalSteps,
        stepsJson: JSON.stringify(initialSteps),
        metadata: JSON.stringify(metadata),
        requestedBy: req.userId || "HOD",
        requestedByRole: req.userRole || "hod",
        currentStage: "ADMIN_REVIEW",
        status: "PENDING",
        priority,
      },
    });

    await auditLog(
      req,
      "EQUIPMENT_REQUEST_CREATED",
      "PROCUREMENT",
      "ApprovalRequest",
      record.id
    );

    return res.status(201).json(formatProcurementRecord(record));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. REPORT DAMAGED EQUIPMENT (POST /api/procurement/damage-report)
// ==========================================
router.post("/damage-report", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = (req.userRole || "").toLowerCase();
    const isSA = role.includes("super_admin") || role.includes("superadmin");

    // Strictly resolve department from authenticated user
    let userDept = await resolveUserDepartment(req);
    if (!userDept && !isSA) {
      return res.status(400).json({ error: "Authenticated user is not linked to any recognized academic department." });
    }
    const deptInfo = resolveDeptAliases(userDept || "CSE");

    const {
      assetId, // can be dbId or itemCode
      problemType = "Non-functional",
      problemDescription,
      severity = "High",
      dateDiscovered,
      reportedBy,
      location,
      supportingDoc,
    } = req.body;

    if (!assetId || !problemDescription) {
      return res.status(400).json({ error: "Asset selection and problem description are mandatory." });
    }

    // 1. Fetch asset from InventoryItem
    const asset = await prisma.inventoryItem.findFirst({
      where: {
        OR: [{ id: assetId }, { assetTag: assetId }],
      },
    });

    if (!asset) {
      return res.status(404).json({ error: `Asset '${assetId}' not found in institutional inventory.` });
    }

    // 2. CRITICAL ASSET VALIDATION:
    // Backend verifies asset.department === authenticatedUser.department
    if (!isSA) {
      const assetDeptClean = (asset.department || "").trim().toUpperCase();
      const isAuthorizedAsset =
        assetDeptClean === deptInfo.code ||
        deptInfo.fullNames.some((fn) => fn.toUpperCase() === assetDeptClean) ||
        (asset.location && asset.location.toUpperCase().includes(deptInfo.code)) ||
        (asset.assetTag && asset.assetTag.toUpperCase().startsWith(deptInfo.prefix));

      if (!isAuthorizedAsset) {
        return res.status(403).json({
          error: `Forbidden: Asset '${asset.assetTag || asset.id}' belongs to '${asset.department}', not '${deptInfo.code}'. You can only report damage for assets within your department scope.`,
        });
      }
    }

    // 3. Update asset status in InventoryItem: Set to "Under Maintenance"
    await prisma.inventoryItem.update({
      where: { id: asset.id },
      data: {
        status: "Under Maintenance",
        remarks: `Damage reported (${problemType}): ${problemDescription.slice(0, 150)}`,
      },
    });

    // 4. Generate report sequence number
    const count = await prisma.approvalRequest.count({ where: { requestType: "DAMAGE_REPORT" } });
    const requestNumber = `DMG-2026-${String(count + 1).padStart(4, "0")}`;

    const wfDef = WORKFLOW_DEFINITIONS.EQUIPMENT_DAMAGE_REPORT;
    const initialSteps: WorkflowStepDef[] = wfDef.steps.map((s, idx) => {
      if (idx === 0) {
        return {
          ...s,
          status: "APPROVED",
          action: "SUBMITTED",
          comment: `Equipment defect reported by ${reportedBy || req.userId || req.userRole}`,
          actedAt: new Date().toISOString(),
          actorId: req.userId,
          actorName: req.userRole,
        };
      }
      return { ...s, status: "PENDING" };
    });

    const metadata = {
      assetId: asset.id,
      assetCode: asset.assetTag,
      assetName: asset.name,
      category: asset.category,
      location: location || asset.location,
      problemType,
      problemDescription,
      severity,
      dateDiscovered: dateDiscovered || new Date().toISOString().split("T")[0],
      reportedBy: reportedBy || req.userId || "HOD",
      supportingDoc: supportingDoc || null,
      submittedAt: new Date().toISOString(),
    };

    const record = await prisma.approvalRequest.create({
      data: {
        requestNumber,
        requestType: "DAMAGE_REPORT",
        module: "INVENTORY",
        workflowCode: "EQUIPMENT_DAMAGE_REPORT",
        title: `Damage: ${asset.name} (${asset.assetTag})`,
        description: `${problemType} - ${problemDescription}`,
        amount: asset.unitCost || 0,
        entityType: "InventoryItem",
        entityId: asset.id,
        department: asset.department || deptInfo.code,
        currentStep: 2,
        totalSteps: wfDef.totalSteps,
        stepsJson: JSON.stringify(initialSteps),
        metadata: JSON.stringify(metadata),
        requestedBy: req.userId || "HOD",
        requestedByRole: req.userRole || "hod",
        currentStage: "TECHNICAL_INSPECTION",
        status: "PENDING",
        priority: severity === "Critical" ? "Urgent" : severity,
      },
    });

    await auditLog(
      req,
      "DAMAGE_REPORT_CREATED",
      "INVENTORY",
      "InventoryItem",
      asset.id
    );

    return res.status(201).json(formatProcurementRecord(record));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. GET SINGLE PROCUREMENT / DAMAGE RECORD DETAILS
// ==========================================
router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userDept = await resolveUserDepartment(req);
    const role = (req.userRole || "").toLowerCase();
    const isSA = role.includes("super_admin") || role.includes("superadmin");

    const record = await prisma.approvalRequest.findFirst({
      where: {
        OR: [{ id }, { requestNumber: id }],
      },
    });

    if (!record) {
      return res.status(404).json({ error: "Procurement or damage report record not found." });
    }

    // Enforce department isolation
    if (!isSA && userDept) {
      const di = resolveDeptAliases(userDept);
      const reqDept = (record.department || "").toUpperCase();
      if (reqDept !== di.code && !di.fullNames.some((fn) => fn.toUpperCase() === reqDept)) {
        return res.status(403).json({ error: "Forbidden: You are not authorized to view records of other departments." });
      }
    }

    return res.json(formatProcurementRecord(record));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
