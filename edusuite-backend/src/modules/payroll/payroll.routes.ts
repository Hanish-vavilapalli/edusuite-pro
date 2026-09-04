import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";
import { requireSuperAdmin, auditLog } from "../super-admin/super-admin.routes";

const router = Router();

// Helper to format/mask bank account numbers
function maskBankAccount(accNo: string): string {
  if (!accNo) return "HDFC-****-8812";
  const clean = accNo.replace(/\D/g, "");
  const last4 = clean.slice(-4) || "8812";
  return `HDFC-****-${last4}`;
}

// ==========================================
// 1. PAYROLL STATS API (EXECUTIVE KPIS)
// ==========================================
router.get("/stats", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const department = req.query.department as string;
  const financialYear = (req.query.financialYear as string) || "FY 2026-27";

  try {
    const whereClause: any = {};
    if (department && department !== "All" && department !== "All Departments") {
      whereClause.department = { contains: department, mode: "insensitive" };
    }
    if (financialYear) {
      whereClause.financialYear = financialYear;
    }

    const [payrolls, reimbursements] = await Promise.all([
      prisma.payrollRecord.findMany({ where: whereClause }),
      prisma.reimbursement.findMany({ where: { status: "Pending" } }),
    ]);

    const totalGrossSalary = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalNetSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0);

    const paidCount = payrolls.filter((p) => p.status === "Paid").length;
    const processingCount = payrolls.filter((p) => p.status === "Processing").length;
    const pendingCount = payrolls.filter((p) => p.status === "Pending Approval").length;

    const pendingReimbursementAmount = reimbursements.reduce((sum, r) => sum + r.amount, 0);

    return res.json({
      totalGrossSalary,
      totalNetSalary,
      totalDeductions,
      paidCount,
      processingCount,
      pendingCount,
      totalRecords: payrolls.length,
      pendingReimbursementAmount,
      currency: "INR",
      financialYear,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. MASTER PAYROLL LEDGER API (PAGINATED & FILTERED)
// ==========================================
router.get(["/", "/ledger"], authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const department = req.query.department as string || req.query.dept as string;
  const status = req.query.status as string;
  const financialYear = req.query.financialYear as string;
  const monthYear = req.query.monthYear as string;
  const employeeType = req.query.employeeType as string;
  const search = (req.query.search as string || "").trim().toLowerCase();
  const page = parseInt(req.query.page as string || "1", 10);
  const limit = parseInt(req.query.limit as string || "50", 10);

  try {
    const whereClause: any = {};

    if (department && department !== "All" && department !== "All Departments") {
      whereClause.department = { contains: department, mode: "insensitive" };
    }

    if (status && status !== "All Status" && status !== "All") {
      whereClause.status = { equals: status, mode: "insensitive" };
    }

    if (financialYear) {
      whereClause.financialYear = financialYear;
    }

    if (monthYear) {
      whereClause.monthYear = { contains: monthYear, mode: "insensitive" };
    }

    if (employeeType && employeeType !== "All") {
      whereClause.employeeType = { equals: employeeType, mode: "insensitive" };
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { employeeName: { contains: search, mode: "insensitive" } },
        { employeeRollNumber: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { monthYear: { contains: search, mode: "insensitive" } },
      ];
    }

    const records = await prisma.payrollRecord.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mapped = records.map((p) => {
      let earnings = { basicPay: p.basicPay, da: p.da, hra: p.hra, medical: 2000, academic: 3000, research: 0, transport: 1500, other: 1000, total: p.grossSalary };
      let deductionsList = { pf: Math.round(p.basicPay * 0.06), profTax: 200, incomeTax: Math.round(p.deductions * 0.4), esi: 500, lateAttendance: 0, leaveDeduction: 0, loanEmi: 0, insurance: 1000, other: 0, total: p.deductions };
      let attendanceImpact = { workingDays: 26, presentDays: 25, approvedLeave: 1, lopDays: 0, lateEntries: 0, overtimeHours: 0, extraClasses: 0, invigilationHours: 4, attendanceContribution: 0 };

      if (p.earningsJson) {
        try { earnings = JSON.parse(p.earningsJson); } catch {}
      }
      if (p.deductionsJson) {
        try { deductionsList = JSON.parse(p.deductionsJson); } catch {}
      }
      if (p.attendanceImpactJson) {
        try { attendanceImpact = JSON.parse(p.attendanceImpactJson); } catch {}
      }

      return {
        id: p.id,
        employeeName: p.employeeName,
        employeeId: p.employeeRollNumber || p.employeeId,
        department: p.department,
        designation: p.designation,
        monthYear: p.monthYear,
        financialYear: p.financialYear,
        basicPay: p.basicPay,
        hra: p.hra,
        allowances: p.allowances,
        deductions: p.deductions,
        netSalary: p.netSalary,
        status: p.status,
        paymentDate: p.paymentDate || "Pending",
        bankAccount: p.bankAccount || "HDFC-****-8812",
        earnings,
        deductionsList,
        attendanceImpact,
        leaveDeductions: [],
        reimbursements: [],
        bankDetails: {
          bankName: "HDFC Bank Ltd",
          accountNumber: p.bankAccount || "HDFC-****-8812",
          ifscCode: "HDFC0000240",
          branch: "Hitech City, Hyderabad",
          nomineeName: `${p.employeeName.split(" ")[0]} Dependent`,
          salaryCreditAccount: true,
        },
        insights: {
          salaryIncreased: false,
          researchIncentiveAdded: p.allowances > 30000,
          pendingReimbursementAmount: 0,
          upcomingSalaryDate: "2026-08-31",
          highestDeductionName: "Income Tax",
          attendanceImpactDesc: "Invigilation duty logged.",
        },
      };
    });

    return res.json(mapped);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. GET EMPLOYEE PAYROLL HISTORY (WITH OWNERSHIP CHECK)
// ==========================================
router.get("/employee/:employeeId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { employeeId } = req.params;

  // Ownership verification: faculty role can only view their own rollNumber/employeeId
  if (req.userRole === "faculty" && req.userId) {
    const facultyObj = await prisma.faculty.findUnique({ where: { id: req.userId } });
    if (facultyObj && facultyObj.id !== employeeId && facultyObj.rollNumber !== employeeId) {
      return res.status(403).json({ error: "Access denied. You can only access your own payroll slips." });
    }
  }

  try {
    const records = await prisma.payrollRecord.findMany({
      where: {
        OR: [
          { employeeId },
          { facultyId: employeeId },
          { employeeRollNumber: employeeId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(records);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3B. AUTHENTICATED FACULTY ME PAYROLL API
// ==========================================
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Faculty authentication token required." });
  }

  try {
    const faculty = await prisma.faculty.findFirst({
      where: { OR: [{ id: userId }, { rollNumber: userId }] },
    });

    const empId = faculty?.rollNumber || faculty?.id || userId;

    const payrolls = await prisma.payrollRecord.findMany({
      where: {
        OR: [
          { facultyId: faculty?.id || userId },
          { employeeId: empId },
        ],
      },
      include: { approvalRequests: true },
      orderBy: { createdAt: "desc" },
    });

    const currentPayroll = payrolls[0] || null;

    let activeApproval = null;
    if (currentPayroll) {
      activeApproval = await prisma.approvalRequest.findFirst({
        where: { payrollRecordId: currentPayroll.id },
        orderBy: { createdAt: "desc" },
      });
    }

    const reimbursements = await prisma.reimbursement.findMany({
      where: { OR: [{ facultyId: faculty?.id || userId }, { employeeId: empId }] },
      orderBy: { claimDate: "desc" },
    });

    const bankDetails = await prisma.bankDetails.findFirst({
      where: { OR: [{ facultyId: faculty?.id || userId }, { employeeId: empId }] },
    });

    let earnings = { basicPay: currentPayroll?.basicPay || 75000, da: currentPayroll?.da || 7500, hra: currentPayroll?.hra || 22500, medical: 2000, academic: 3000, research: 2000, transport: 1500, other: 1000, total: currentPayroll?.grossSalary || 114500 };
    let deductionsList = { pf: Math.round((currentPayroll?.basicPay || 75000) * 0.06), profTax: 200, incomeTax: Math.round((currentPayroll?.deductions || 10420) * 0.4), esi: 500, lateAttendance: 0, leaveDeduction: 0, loanEmi: 0, insurance: 1000, other: 0, total: currentPayroll?.deductions || 10420 };
    let attendanceImpact = { workingDays: 26, presentDays: 26, approvedLeave: 0, lopDays: 0, lateEntries: 0, overtimeHours: 0, extraClasses: 0, invigilationHours: 4, attendanceContribution: 0 };

    if (currentPayroll?.earningsJson) { try { earnings = JSON.parse(currentPayroll.earningsJson); } catch {} }
    if (currentPayroll?.deductionsJson) { try { deductionsList = JSON.parse(currentPayroll.deductionsJson); } catch {} }
    if (currentPayroll?.attendanceImpactJson) { try { attendanceImpact = JSON.parse(currentPayroll.attendanceImpactJson); } catch {} }

    const approvalProgress = {
      stage: activeApproval?.currentStage || "HR_VERIFICATION",
      status: activeApproval?.status || currentPayroll?.status || "Pending Approval",
      hrVerifiedBy: activeApproval?.hrVerifiedBy || null,
      hrVerifiedAt: activeApproval?.hrVerifiedAt || null,
      financeReviewedBy: activeApproval?.financeReviewedBy || null,
      financeReviewedAt: activeApproval?.financeReviewedAt || null,
      superAdminDecisionBy: activeApproval?.superAdminDecisionBy || null,
      superAdminDecisionAt: activeApproval?.superAdminDecisionAt || null,
    };

    return res.json({
      faculty: {
        id: faculty?.id || userId,
        name: faculty?.name || currentPayroll?.employeeName || "Faculty Member",
        department: faculty?.department || currentPayroll?.department || "CSE",
        designation: currentPayroll?.designation || "Associate Professor",
      },
      currentPayroll,
      payrollHistory: payrolls,
      earnings,
      deductionsList,
      attendanceImpact,
      reimbursements,
      bankDetails: {
        bankName: bankDetails?.bankName || "HDFC Bank Ltd",
        accountNumber: maskBankAccount(bankDetails?.accountNumber || "5010022448812"),
        ifscCode: bankDetails?.ifscCode || "HDFC0000240",
        branch: bankDetails?.branch || "Hitech City, Hyderabad",
        nomineeName: bankDetails?.nomineeName || "Spouse / Dependent",
        salaryCreditAccount: true,
      },
      approvalProgress,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. GET SINGLE PAYSLIP DETAIL API
// ==========================================
router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const record = await prisma.payrollRecord.findUnique({
      where: { id },
      include: { faculty: true },
    });

    if (!record) {
      return res.status(404).json({ error: "Payroll record not found." });
    }

    // Ownership check for faculty
    if (req.userRole === "faculty" && record.facultyId && record.facultyId !== req.userId) {
      return res.status(403).json({ error: "Access denied to this payslip." });
    }

    let earnings = { basicPay: record.basicPay, da: record.da, hra: record.hra, medical: 2000, academic: 3000, research: 0, transport: 1500, other: 1000, total: record.grossSalary };
    let deductionsList = { pf: Math.round(record.basicPay * 0.06), profTax: 200, incomeTax: Math.round(record.deductions * 0.4), esi: 500, lateAttendance: 0, leaveDeduction: 0, loanEmi: 0, insurance: 1000, other: 0, total: record.deductions };
    let attendanceImpact = { workingDays: 26, presentDays: 25, approvedLeave: 1, lopDays: 0, lateEntries: 0, overtimeHours: 0, extraClasses: 0, invigilationHours: 4, attendanceContribution: 0 };

    if (record.earningsJson) { try { earnings = JSON.parse(record.earningsJson); } catch {} }
    if (record.deductionsJson) { try { deductionsList = JSON.parse(record.deductionsJson); } catch {} }
    if (record.attendanceImpactJson) { try { attendanceImpact = JSON.parse(record.attendanceImpactJson); } catch {} }

    // Fetch reimbursements for this employee
    const reimbursements = await prisma.reimbursement.findMany({
      where: { employeeId: record.employeeId },
      orderBy: { claimDate: "desc" },
    });

    // Fetch bank details
    const bankDetailsObj = await prisma.bankDetails.findFirst({
      where: { employeeId: record.employeeId },
    });

    return res.json({
      id: record.id,
      employeeName: record.employeeName,
      employeeId: record.employeeRollNumber || record.employeeId,
      department: record.department,
      designation: record.designation,
      monthYear: record.monthYear,
      financialYear: record.financialYear,
      basicPay: record.basicPay,
      hra: record.hra,
      allowances: record.allowances,
      deductions: record.deductions,
      netSalary: record.netSalary,
      status: record.status,
      paymentDate: record.paymentDate || "Pending",
      bankAccount: record.bankAccount || maskBankAccount(bankDetailsObj?.accountNumber || ""),
      earnings,
      deductionsList,
      attendanceImpact,
      leaveDeductions: [],
      reimbursements: reimbursements.map((r) => ({
        id: r.id,
        category: r.category,
        amount: r.amount,
        status: r.status,
        claimDate: r.claimDate,
        approvalDate: r.approvalDate,
      })),
      bankDetails: {
        bankName: bankDetailsObj?.bankName || "HDFC Bank Ltd",
        accountNumber: maskBankAccount(bankDetailsObj?.accountNumber || "5010022448812"),
        ifscCode: bankDetailsObj?.ifscCode || "HDFC0000240",
        branch: bankDetailsObj?.branch || "Hitech City, Hyderabad",
        nomineeName: bankDetailsObj?.nomineeName || `${record.employeeName.split(" ")[0]} Dependent`,
        salaryCreditAccount: true,
      },
      insights: {
        salaryIncreased: false,
        researchIncentiveAdded: record.allowances > 30000,
        pendingReimbursementAmount: reimbursements.filter((r) => r.status === "Pending").reduce((s, r) => s + r.amount, 0),
        upcomingSalaryDate: "2026-08-31",
        highestDeductionName: "Income Tax",
        attendanceImpactDesc: "Invigilation duty hours logged.",
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. GENERATE PAYROLL RECORD API (SERVER-SIDE CALCULATION & DUPLICATE PREVENTION)
// ==========================================
router.post("/generate", authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { employeeId, monthYear, basicPay: inputBasic, department, designation, employeeName } = req.body;

  const month = monthYear || "August 2026";
  const empId = employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`;

  try {
    // 1. Check duplicate payroll
    const existing = await prisma.payrollRecord.findUnique({
      where: { employeeId_monthYear: { employeeId: empId, monthYear: month } },
    });

    if (existing) {
      return res.status(409).json({ error: `Payroll for employee ${empId} for period '${month}' already exists.` });
    }

    // 2. Perform backend authoritative salary calculations inside a transaction
    const created = await prisma.$transaction(async (tx) => {
      // Find faculty if exists
      const fac = await tx.faculty.findFirst({
        where: { OR: [{ id: empId }, { rollNumber: empId }] },
      });

      const basicPay = Number(inputBasic) || (fac?.role === "hod" ? 85000 : 75000);
      const da = Math.round(basicPay * 0.1);
      const hra = Math.round(basicPay * 0.3);
      const medical = 2000;
      const academic = fac?.role === "hod" ? 4000 : 3000;
      const research = 2000;
      const transport = 1500;
      const other = 1000;

      const grossSalary = basicPay + da + hra + medical + academic + research + transport + other;

      const pf = Math.round(basicPay * 0.06);
      const profTax = 200;
      const incomeTax = fac?.role === "hod" ? 4500 : 3500;
      const esi = 500;
      const insurance = 1000;

      const totalDeductions = pf + profTax + incomeTax + esi + insurance;
      const netSalary = grossSalary - totalDeductions;

      const earningsJson = JSON.stringify({ basicPay, da, hra, medical, academic, research, transport, other, total: grossSalary });
      const deductionsJson = JSON.stringify({ pf, profTax, incomeTax, esi, lateAttendance: 0, leaveDeduction: 0, loanEmi: 0, insurance, other: 0, total: totalDeductions });
      const attendanceImpactJson = JSON.stringify({ workingDays: 26, presentDays: 26, approvedLeave: 0, lopDays: 0, lateEntries: 0, overtimeHours: 0, extraClasses: 0, invigilationHours: 4, attendanceContribution: 0 });

      const newRecord = await tx.payrollRecord.create({
        data: {
          employeeId: empId,
          facultyId: fac?.id || null,
          employeeName: employeeName || fac?.name || "Dr. Ravi Kumar",
          employeeRollNumber: fac?.rollNumber || empId,
          department: department || fac?.department || "CSE",
          designation: designation || (fac?.role === "hod" ? "Associate Professor" : "Assistant Professor"),
          employeeType: fac ? "Faculty" : "Staff",
          monthYear: month,
          financialYear: "FY 2026-27",
          basicPay,
          da,
          hra,
          allowances: da + hra + medical + academic + research + transport + other,
          deductions: totalDeductions,
          grossSalary,
          netSalary,
          status: "Pending Approval",
          paymentDate: "Pending",
          bankAccount: maskBankAccount(""),
          earningsJson,
          deductionsJson,
          attendanceImpactJson,
        },
      });

      // Create linked ApprovalRequest for 3-tier institutional workflow
      const reqNum = `REQ-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      await tx.approvalRequest.create({
        data: {
          requestNumber: reqNum,
          requestType: "PAYROLL",
          title: `${month} Monthly Payroll Approval for ${newRecord.employeeName}`,
          description: `Faculty salary disbursement for ${newRecord.department} (${newRecord.designation}). Net Salary: ₹${netSalary.toLocaleString("en-IN")}.`,
          amount: netSalary,
          payrollRecordId: newRecord.id,
          requestedBy: req.userRole || "HR Manager",
          requestedByRole: req.userRole || "hr",
          department: newRecord.department,
          currentStage: "HR_VERIFICATION",
          status: "SUBMITTED",
          priority: netSalary > 100000 ? "Critical" : "High",
        },
      });

      return newRecord;
    });

    await auditLog(req, "PAYROLL_GENERATED", "Payroll ERP", "PayrollRecord", created.id);

    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. UPDATE PAYROLL STATUS API (TRANSITION CONTROL)
// ==========================================
router.put("/:id/status", authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Paid", "Processing", "Pending Approval"].includes(status)) {
    return res.status(400).json({ error: "Invalid payroll status transition." });
  }

  try {
    const existing = await prisma.payrollRecord.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Payroll record not found." });
    }

    // Protection rule: Paid payroll cannot be casually altered
    if (existing.status === "Paid" && status !== "Paid") {
      return res.status(403).json({ error: "Finalized 'Paid' payroll records are immutable and cannot be reverted." });
    }

    const updated = await prisma.payrollRecord.update({
      where: { id },
      data: {
        status,
        ...(status === "Paid" ? { paymentDate: new Date().toISOString().split("T")[0] } : {}),
      },
    });

    await auditLog(req, `PAYROLL_STATUS_${status.toUpperCase().replace(/\s+/g, "_")}`, "Payroll ERP", "PayrollRecord", id);

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6B. PAYROLL DISBURSEMENT API (FINAL PAID TRANSITION)
// ==========================================
router.post("/:id/disburse", authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.payrollRecord.findUnique({
      where: { id },
      include: { approvalRequests: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Payroll record not found." });
    }

    if (existing.status === "Paid") {
      return res.status(400).json({ error: "Payroll for this period has already been disbursed and paid." });
    }

    // Disburse payroll inside a transaction
    const today = new Date().toISOString().split("T")[0];
    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.payrollRecord.update({
        where: { id },
        data: {
          status: "Paid",
          paymentDate: today,
        },
      });

      if (record.facultyId) {
        const student = await tx.student.findFirst({ where: { id: record.facultyId } });
        if (student) {
          await tx.notification.create({
            data: {
              studentId: student.id,
              title: `Salary Disbursed for ${record.monthYear}`,
              message: `Your net salary of ₹${record.netSalary.toLocaleString("en-IN")} has been credited to your bank account (${record.bankAccount || "HDFC Bank"}).`,
              type: "HIGH",
            },
          });
        }
      }

      return record;
    });

    await auditLog(req, "PAYROLL_DISBURSED", "Payroll ERP", "PayrollRecord", id);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. BANK DETAILS & CHANGE REQUEST APIS
// ==========================================
router.get("/bank-details", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  try {
    const bank = await prisma.bankDetails.findFirst({
      where: { OR: [{ employeeId: userId || "" }, { facultyId: userId || "" }] },
    });

    if (!bank) {
      return res.json({
        bankName: "HDFC Bank Ltd",
        accountNumber: "HDFC-****-8812",
        ifscCode: "HDFC0000240",
        branch: "Hitech City, Hyderabad",
        nomineeName: "Spouse / Dependent",
        salaryCreditAccount: true,
      });
    }

    return res.json({
      ...bank,
      accountNumber: maskBankAccount(bank.accountNumber),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/bank-change-request", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { bankName, accountNumber, ifscCode, branch, nomineeName } = req.body;
  const userId = req.userId || "EMP010";

  try {
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.bankChangeRequest.create({
        data: {
          employeeId: userId,
          facultyId: req.userRole === "faculty" ? userId : null,
          requestedBankName: bankName,
          requestedAccountNumber: accountNumber,
          requestedIfscCode: ifscCode,
          requestedBranch: branch,
          requestedNomineeName: nomineeName,
          status: "Pending",
        },
      });

      const reqNum = `REQ-BNK-${Math.floor(100000 + Math.random() * 900000)}`;
      await tx.approvalRequest.create({
        data: {
          requestNumber: reqNum,
          requestType: "BANK_CHANGE",
          title: `Bank Details Modification Request (${bankName})`,
          description: `Employee requested salary credit bank account change to ${bankName} (${accountNumber ? maskBankAccount(accountNumber) : "New Account"}).`,
          amount: 0,
          bankChangeRequestId: created.id,
          requestedBy: req.userRole === "faculty" ? "Faculty Member" : userId,
          requestedByRole: req.userRole || "faculty",
          department: "HRMS",
          currentStage: "HR_VERIFICATION",
          status: "SUBMITTED",
          priority: "Medium",
        },
      });

      return created;
    });

    await auditLog(req, "BANK_CHANGE_REQUESTED", "Payroll ERP", "BankChangeRequest", result.id);

    return res.status(201).json({ success: true, message: "Bank change request submitted successfully.", requestId: result.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. REIMBURSEMENT CLAIMS APIS
// ==========================================
router.get("/reimbursements", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  try {
    const claims = await prisma.reimbursement.findMany({
      where: req.userRole === "faculty" ? { OR: [{ employeeId: userId || "" }, { facultyId: userId || "" }] } : {},
      orderBy: { claimDate: "desc" },
    });
    return res.json(claims);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/reimbursements", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { category, amount, remarks } = req.body;
  const userId = req.userId || "EMP010";

  try {
    const created = await prisma.reimbursement.create({
      data: {
        employeeId: userId,
        facultyId: req.userRole === "faculty" ? userId : null,
        category: category || "Travel Allowance",
        amount: Number(amount) || 1000,
        status: "Pending",
        claimDate: new Date().toISOString().split("T")[0],
        remarks: remarks || "",
      },
    });

    await auditLog(req, "REIMBURSEMENT_CLAIMED", "Payroll ERP", "Reimbursement", created.id);

    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 9. PAYROLL REPORTS API
// ==========================================
router.get("/reports", authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await prisma.payrollRecord.findMany({
      orderBy: { monthYear: "desc" },
    });

    const summaryByDepartment: Record<string, { totalGross: number; totalNet: number; totalDeductions: number; count: number }> = {};

    for (const r of records) {
      if (!summaryByDepartment[r.department]) {
        summaryByDepartment[r.department] = { totalGross: 0, totalNet: 0, totalDeductions: 0, count: 0 };
      }
      summaryByDepartment[r.department].totalGross += r.grossSalary;
      summaryByDepartment[r.department].totalNet += r.netSalary;
      summaryByDepartment[r.department].totalDeductions += r.deductions;
      summaryByDepartment[r.department].count++;
    }

    return res.json({
      totalPayrollRecords: records.length,
      departmentSummaries: summaryByDepartment,
      records,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
