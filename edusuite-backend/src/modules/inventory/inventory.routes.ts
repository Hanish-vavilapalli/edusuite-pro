import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";

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
  const isSA = (req.userRole || "").toLowerCase().includes("super_admin") || (req.userRole || "").toLowerCase().includes("superadmin");
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

function formatItem(item: any) {
  return {
    id: item.assetTag || item.id,
    dbId: item.id,
    assetTag: item.assetTag,
    name: item.name,
    category: item.category,
    department: item.department,
    departmentId: item.departmentId,
    location: item.location,
    building: item.building,
    room: item.room,
    roomType: item.roomType,
    serialNumber: item.serialNumber,
    quantity: item.quantity,
    minThreshold: item.minThreshold,
    unitCost: item.unitCost,
    status: item.status,
    assignedTo: item.assignedTo,
    lastRestockedOn: item.lastRestockedOn,
    purchaseDate: item.purchaseDate,
    vendor: item.vendor,
    remarks: item.remarks,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inventory/stats — Department-scoped KPI summary metrics
// ─────────────────────────────────────────────────────────────────────────────
router.get("/stats", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isSA = (req.userRole || "").toLowerCase().includes("super_admin") || (req.userRole || "").toLowerCase().includes("superadmin");
    const userDept = await resolveUserDepartment(req);

    if (!userDept && !isSA) {
      return res.status(403).json({ error: "Access denied. HOD has no department assigned." });
    }
    if (userDept && blockCrossDeptQuery(req, userDept, res)) return;

    let whereClause: any = {};
    let deptInfo = null;

    if (userDept) {
      deptInfo = resolveDeptAliases(userDept);
      whereClause = {
        OR: [
          ...deptInfo.fullNames.map((n) => ({ department: { equals: n, mode: "insensitive" as const } })),
          { department: { equals: deptInfo.code, mode: "insensitive" as const } },
        ],
      };
    }

    const items = await prisma.inventoryItem.findMany({ where: whereClause });
    const totalItems = items.length;
    const totalValuation = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const inStockCount = items.filter((i) => i.status === "In Stock").length;
    const lowStockCount = items.filter((i) => i.status !== "In Stock").length;

    return res.json({
      department: deptInfo?.code || "ALL",
      departmentName: deptInfo?.fullNames[deptInfo.fullNames.length - 1] || "All Institution Assets",
      totalItems,
      totalValuation,
      inStockCount,
      lowStockCount,
    });
  } catch (error: any) {
    console.error("GET /api/inventory/stats error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch inventory stats." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inventory — Department-scoped asset list with search and filters
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isSA = (req.userRole || "").toLowerCase().includes("super_admin") || (req.userRole || "").toLowerCase().includes("superadmin");
    const userDept = await resolveUserDepartment(req);

    if (!userDept && !isSA) {
      return res.status(403).json({ error: "Access denied. HOD has no department assigned." });
    }
    if (userDept && blockCrossDeptQuery(req, userDept, res)) return;

    let deptConditions: any[] = [];
    if (userDept) {
      const deptInfo = resolveDeptAliases(userDept);
      deptConditions = [
        ...deptInfo.fullNames.map((n) => ({ department: { equals: n, mode: "insensitive" as const } })),
        { department: { equals: deptInfo.code, mode: "insensitive" as const } },
      ];
    }

    const search = ((req.query.search as string) || "").trim();
    const category = (req.query.category as string) || "";
    const status = (req.query.status as string) || "";

    const andConditions: any[] = [];

    if (deptConditions.length > 0) {
      andConditions.push({ OR: deptConditions });
    }

    if (category && category !== "All Categories") {
      andConditions.push({ category: { equals: category, mode: "insensitive" } });
    }

    if (status && status !== "All Statuses") {
      andConditions.push({ status: { equals: status, mode: "insensitive" } });
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { assetTag: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
          { serialNumber: { contains: search, mode: "insensitive" } },
          { assignedTo: { contains: search, mode: "insensitive" } },
          { room: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(items.map(formatItem));
  } catch (error: any) {
    console.error("GET /api/inventory error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch inventory." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/inventory — Register new asset (enforces HOD's department)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isSA = (req.userRole || "").toLowerCase().includes("super_admin") || (req.userRole || "").toLowerCase().includes("superadmin");
    const userDept = await resolveUserDepartment(req);

    if (!userDept && !isSA) {
      return res.status(403).json({ error: "Access denied. HOD has no department assigned." });
    }

    const {
      name,
      category,
      quantity,
      minThreshold,
      unitCost,
      location,
      building,
      room,
      roomType,
      serialNumber,
      status,
      assignedTo,
      vendor,
      remarks,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Asset item name is required." });
    }

    // Resolve final department: for HOD, always force HOD's own department code and departmentId
    let finalDeptCode = "CSE";
    let finalDeptId: string | null = null;

    if (isSA) {
      finalDeptCode = req.body.department ? req.body.department.trim().toUpperCase() : "INSTITUTION";
      if (req.body.departmentId) {
        finalDeptId = req.body.departmentId;
      } else if (finalDeptCode !== "INSTITUTION") {
        const d = await prisma.department.findFirst({ where: { code: finalDeptCode } });
        finalDeptId = d?.id || null;
      }
    } else {
      const di = resolveDeptAliases(userDept!);
      finalDeptCode = di.code;
      const d = await prisma.department.findFirst({ where: { code: di.code } });
      finalDeptId = d?.id || null;
    }

    const qty = Number(quantity) || 0;
    const min = Number(minThreshold) || 5;
    const computedStatus = status || (qty === 0 ? "Out of Stock" : qty <= min ? "Low Stock" : "In Stock");

    const assetTag = req.body.assetTag || `INV-${finalDeptCode}-${Math.floor(100 + Math.random() * 900)}`;

    const newItem = await prisma.inventoryItem.create({
      data: {
        assetTag,
        name: name.trim(),
        category: category || "IT Hardware",
        department: finalDeptCode,
        departmentId: finalDeptId,
        location: location || `${finalDeptCode} Department`,
        building: building || null,
        room: room || null,
        roomType: roomType || "Lab",
        serialNumber: serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
        quantity: qty,
        minThreshold: min,
        unitCost: Number(unitCost) || 0,
        status: computedStatus,
        assignedTo: assignedTo || null,
        lastRestockedOn: new Date().toISOString().split("T")[0],
        vendor: vendor || null,
        remarks: remarks || null,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: req.userId,
          actorName: "HOD",
          actorRole: req.userRole || "hod",
          action: "CREATE_INVENTORY_ITEM",
          module: "Inventory",
          targetEntity: `InventoryItem:${newItem.id}`,
          targetId: newItem.id,
          status: "Success",
        },
      });
    } catch (_) {}

    return res.status(201).json(formatItem(newItem));
  } catch (error: any) {
    console.error("POST /api/inventory error:", error);
    return res.status(500).json({ error: error.message || "Failed to register asset." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/inventory/:id/restock — Restock asset transactionally in PostgreSQL
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/restock", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isSA = (req.userRole || "").toLowerCase().includes("super_admin") || (req.userRole || "").toLowerCase().includes("superadmin");
    const userDept = await resolveUserDepartment(req);
    const { id } = req.params;
    const { quantity } = req.body;

    const restockAmount = Number(quantity);
    if (isNaN(restockAmount) || restockAmount <= 0) {
      return res.status(400).json({ error: "Restock quantity must be a positive integer." });
    }

    const item = await prisma.inventoryItem.findFirst({
      where: {
        OR: [{ id }, { assetTag: id }],
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Asset not found." });
    }

    // HOD authorization check
    if (!isSA && userDept) {
      const di = resolveDeptAliases(userDept);
      const itemDept = (item.department || "").toUpperCase();
      if (itemDept !== di.code && !di.fullNames.some((n) => n.toUpperCase() === itemDept)) {
        return res.status(403).json({ error: "Access denied. You cannot restock assets belonging to another department." });
      }
    }

    const newQty = item.quantity + restockAmount;
    const computedStatus = newQty <= item.minThreshold ? "Low Stock" : "In Stock";
    const today = new Date().toISOString().split("T")[0];

    const updated = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: newQty,
        status: computedStatus,
        lastRestockedOn: today,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: req.userId,
          actorName: "HOD",
          actorRole: req.userRole || "hod",
          action: "RESTOCK_INVENTORY_ITEM",
          module: "Inventory",
          targetEntity: `InventoryItem:${updated.id}`,
          targetId: updated.id,
          status: "Success",
        },
      });
    } catch (_) {}

    return res.json(formatItem(updated));
  } catch (error: any) {
    console.error("POST /api/inventory/:id/restock error:", error);
    return res.status(500).json({ error: error.message || "Failed to restock asset." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/inventory/:id — Edit asset (enforces department ownership)
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isSA = (req.userRole || "").toLowerCase().includes("super_admin") || (req.userRole || "").toLowerCase().includes("superadmin");
    const userDept = await resolveUserDepartment(req);
    const { id } = req.params;

    const item = await prisma.inventoryItem.findFirst({
      where: {
        OR: [{ id }, { assetTag: id }],
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Asset not found." });
    }

    // HOD authorization check
    if (!isSA && userDept) {
      const di = resolveDeptAliases(userDept);
      const itemDept = (item.department || "").toUpperCase();
      if (itemDept !== di.code && !di.fullNames.some((n) => n.toUpperCase() === itemDept)) {
        return res.status(403).json({ error: "Access denied. You cannot edit assets belonging to another department." });
      }
    }

    const {
      name,
      category,
      quantity,
      minThreshold,
      unitCost,
      location,
      building,
      room,
      roomType,
      serialNumber,
      status,
      assignedTo,
      vendor,
      remarks,
    } = req.body;

    const qty = quantity !== undefined ? Number(quantity) : item.quantity;
    const min = minThreshold !== undefined ? Number(minThreshold) : item.minThreshold;
    const computedStatus = status || (qty === 0 ? "Out of Stock" : qty <= min ? "Low Stock" : "In Stock");

    const updated = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        name: name !== undefined ? name.trim() : item.name,
        category: category !== undefined ? category : item.category,
        quantity: qty,
        minThreshold: min,
        unitCost: unitCost !== undefined ? Number(unitCost) : item.unitCost,
        location: location !== undefined ? location : item.location,
        building: building !== undefined ? building : item.building,
        room: room !== undefined ? room : item.room,
        roomType: roomType !== undefined ? roomType : item.roomType,
        serialNumber: serialNumber !== undefined ? serialNumber : item.serialNumber,
        status: computedStatus,
        assignedTo: assignedTo !== undefined ? assignedTo : item.assignedTo,
        vendor: vendor !== undefined ? vendor : item.vendor,
        remarks: remarks !== undefined ? remarks : item.remarks,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: req.userId,
          actorName: "HOD",
          actorRole: req.userRole || "hod",
          action: "UPDATE_INVENTORY_ITEM",
          module: "Inventory",
          targetEntity: `InventoryItem:${updated.id}`,
          targetId: updated.id,
          status: "Success",
        },
      });
    } catch (_) {}

    return res.json(formatItem(updated));
  } catch (error: any) {
    console.error("PUT /api/inventory/:id error:", error);
    return res.status(500).json({ error: error.message || "Failed to update asset." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/inventory/:id — Delete asset (enforces department ownership)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isSA = (req.userRole || "").toLowerCase().includes("super_admin") || (req.userRole || "").toLowerCase().includes("superadmin");
    const userDept = await resolveUserDepartment(req);
    const { id } = req.params;

    const item = await prisma.inventoryItem.findFirst({
      where: {
        OR: [{ id }, { assetTag: id }],
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Asset not found." });
    }

    // HOD authorization check
    if (!isSA && userDept) {
      const di = resolveDeptAliases(userDept);
      const itemDept = (item.department || "").toUpperCase();
      if (itemDept !== di.code && !di.fullNames.some((n) => n.toUpperCase() === itemDept)) {
        return res.status(403).json({ error: "Access denied. You cannot delete assets belonging to another department." });
      }
    }

    await prisma.inventoryItem.delete({
      where: { id: item.id },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: req.userId,
          actorName: "HOD",
          actorRole: req.userRole || "hod",
          action: "DELETE_INVENTORY_ITEM",
          module: "Inventory",
          targetEntity: `InventoryItem:${item.id}`,
          targetId: item.id,
          status: "Success",
        },
      });
    } catch (_) {}

    return res.json({ success: true, message: `Asset ${item.name} (${item.assetTag || item.id}) deleted.` });
  } catch (error: any) {
    console.error("DELETE /api/inventory/:id error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete asset." });
  }
});

export default router;
