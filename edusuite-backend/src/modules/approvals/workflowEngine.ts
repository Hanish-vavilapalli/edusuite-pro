import { prisma } from "../../db";

export interface WorkflowStepDef {
  stepNumber: number;
  requiredRole: string;
  label: string;
  flagRequired?: string;
  assignedApprover?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "SKIPPED";
  action?: string;
  comment?: string;
  actedAt?: string;
  actorId?: string;
  actorName?: string;
}

export interface WorkflowConfig {
  workflowCode: string;
  module: string;
  title: string;
  totalSteps: number;
  steps: WorkflowStepDef[];
}

export const WORKFLOW_DEFINITIONS: Record<string, WorkflowConfig> = {
  ATTENDANCE_MEDICAL_OVERRIDE: {
    workflowCode: "ATTENDANCE_MEDICAL_OVERRIDE",
    module: "ATTENDANCE",
    title: "Student Medical Attendance Waiver",
    totalSteps: 3,
    steps: [
      { stepNumber: 1, requiredRole: "faculty", label: "Faculty Verification", status: "APPROVED", comment: "Medical certificate verified" },
      { stepNumber: 2, requiredRole: "hod", flagRequired: "isHod", label: "HOD Department Review", status: "PENDING" },
      { stepNumber: 3, requiredRole: "academic_dean", flagRequired: "isDean", label: "Academic Dean Final Approval", status: "PENDING" },
    ],
  },
  FACULTY_LEAVE: {
    workflowCode: "FACULTY_LEAVE",
    module: "LEAVE",
    title: "Faculty Casual / Conference Leave Request",
    totalSteps: 3,
    steps: [
      { stepNumber: 1, requiredRole: "faculty", label: "Faculty Leave Application", status: "APPROVED", comment: "Application submitted" },
      { stepNumber: 2, requiredRole: "hod", flagRequired: "isHod", label: "HOD Review & Substitute Check", status: "PENDING" },
      { stepNumber: 3, requiredRole: "hr", flagRequired: "isHRManager", label: "HR Leave Balance Verification", status: "PENDING" },
    ],
  },
  GRADE_CORRECTION: {
    workflowCode: "GRADE_CORRECTION",
    module: "EXAM",
    title: "Internal Marks / Grade Change Request",
    totalSteps: 3,
    steps: [
      { stepNumber: 1, requiredRole: "faculty", label: "Faculty Grade Modification Proposal", status: "APPROVED" },
      { stepNumber: 2, requiredRole: "hod", flagRequired: "isHod", label: "HOD Department Endorsement", status: "PENDING" },
      { stepNumber: 3, requiredRole: "exam_cell", flagRequired: "isExamCell", label: "Controller of Examinations Final Lock", status: "PENDING" },
    ],
  },
  DEPARTMENT_BUDGET: {
    workflowCode: "DEPARTMENT_BUDGET",
    module: "FINANCE",
    title: "Department Budget & Major Disbursement Request",
    totalSteps: 3,
    steps: [
      { stepNumber: 1, requiredRole: "hod", flagRequired: "isHod", label: "HOD Budget Proposal", status: "PENDING" },
      { stepNumber: 2, requiredRole: "finance", flagRequired: "isFinance", label: "Finance Dean Voucher Verification", status: "PENDING" },
      { stepNumber: 3, requiredRole: "super_admin", flagRequired: "isSystemAdmin", label: "Super Admin Executive Lock", status: "PENDING" },
    ],
  },
  PAYROLL_DISBURSEMENT: {
    workflowCode: "PAYROLL_DISBURSEMENT",
    module: "PAYROLL",
    title: "Monthly Institutional Payroll Approval & Disbursement",
    totalSteps: 3,
    steps: [
      { stepNumber: 1, requiredRole: "hr", flagRequired: "isHRManager", label: "HR Attendance & LOP Sign-off", status: "PENDING" },
      { stepNumber: 2, requiredRole: "finance", flagRequired: "isFinance", label: "Finance Salary Ledger Audit", status: "PENDING" },
      { stepNumber: 3, requiredRole: "super_admin", flagRequired: "isSystemAdmin", label: "Super Admin Disbursement Execution", status: "PENDING" },
    ],
  },
  REIMBURSEMENT: {
    workflowCode: "REIMBURSEMENT",
    module: "REIMBURSEMENT",
    title: "Faculty Expense Reimbursement Claim",
    totalSteps: 3,
    steps: [
      { stepNumber: 1, requiredRole: "faculty", label: "Employee Claim Submission", status: "APPROVED" },
      { stepNumber: 2, requiredRole: "hr", flagRequired: "isHRManager", label: "HR Verification", status: "PENDING" },
      { stepNumber: 3, requiredRole: "finance", flagRequired: "isFinance", label: "Finance Audit & Authorization", status: "PENDING" },
    ],
  },
  BANK_CHANGE: {
    workflowCode: "BANK_CHANGE",
    module: "BANK_ACCOUNT",
    title: "Employee Salary Account & IFSC Update Request",
    totalSteps: 4,
    steps: [
      { stepNumber: 1, requiredRole: "faculty", label: "Employee Account Change Request", status: "APPROVED" },
      { stepNumber: 2, requiredRole: "hr", flagRequired: "isHRManager", label: "HR Identity & Document Verification", status: "PENDING" },
      { stepNumber: 3, requiredRole: "finance", flagRequired: "isFinance", label: "Finance Ledger Update", status: "PENDING" },
      { stepNumber: 4, requiredRole: "super_admin", flagRequired: "isSystemAdmin", label: "Super Admin Security Authorization", status: "PENDING" },
    ],
  },
  STUDENT_CLEARANCE: {
    workflowCode: "STUDENT_CLEARANCE",
    module: "CLEARANCE",
    title: "Student Institutional Graduation & No-Dues Clearance",
    totalSteps: 4,
    steps: [
      { stepNumber: 1, requiredRole: "student", label: "Student Clearance Application", status: "APPROVED" },
      { stepNumber: 2, requiredRole: "librarian", flagRequired: "isLibrarian", label: "Library Books & Fines Sign-off", status: "PENDING" },
      { stepNumber: 3, requiredRole: "warden", flagRequired: "isWarden", label: "Hostel Dues & Damage Inspection", status: "PENDING" },
      { stepNumber: 4, requiredRole: "accounts", flagRequired: "isFinance", label: "Accounts Final Dues Clearance", status: "PENDING" },
    ],
  },
  SECURITY_RBAC_CHANGE: {
    workflowCode: "SECURITY_RBAC_CHANGE",
    module: "SECURITY",
    title: "Role Permission & Critical Privilege Modification",
    totalSteps: 2,
    steps: [
      { stepNumber: 1, requiredRole: "admin", label: "Admin Security Change Proposal", status: "PENDING" },
      { stepNumber: 2, requiredRole: "super_admin", flagRequired: "isSystemAdmin", label: "Super Admin Executive Security Enforcement", status: "PENDING" },
    ],
  },
  EQUIPMENT_PROCUREMENT: {
    workflowCode: "EQUIPMENT_PROCUREMENT",
    module: "PROCUREMENT",
    title: "Department Equipment & Materials Requisition",
    totalSteps: 4,
    steps: [
      { stepNumber: 1, requiredRole: "hod", flagRequired: "isHod", label: "Department Requirement Proposal", status: "APPROVED" },
      { stepNumber: 2, requiredRole: "admin", label: "Procurement & Administrative Review", status: "PENDING" },
      { stepNumber: 3, requiredRole: "finance", flagRequired: "isFinance", label: "Finance Sanction & Fund Clearance", status: "PENDING" },
      { stepNumber: 4, requiredRole: "super_admin", flagRequired: "isSystemAdmin", label: "Executive Approval & PO Release", status: "PENDING" },
    ],
  },
  EQUIPMENT_DAMAGE_REPORT: {
    workflowCode: "EQUIPMENT_DAMAGE_REPORT",
    module: "INVENTORY",
    title: "Department Equipment Damage & Defect Report",
    totalSteps: 3,
    steps: [
      { stepNumber: 1, requiredRole: "hod", flagRequired: "isHod", label: "Damage & Breakdown Notification", status: "APPROVED" },
      { stepNumber: 2, requiredRole: "admin", label: "Technical & Lab Inspection", status: "PENDING" },
      { stepNumber: 3, requiredRole: "admin", label: "Action Resolution (Repair / Replacement / Write-off)", status: "PENDING" },
    ],
  },
};

/**
 * Check whether a user is authorized to act on a workflow step (direct role match or active DelegationRule)
 */
export async function isAuthorizedForStep(
  user: { userId: string; userRole: string; userName?: string },
  requiredRole: string,
  department?: string
): Promise<{ authorized: boolean; reason?: string; isDelegated?: boolean }> {
  const normUserRole = (user.userRole || "").toLowerCase().replace(/[- ]/g, "_");
  const normReqRole = (requiredRole || "").toLowerCase().replace(/[- ]/g, "_");

  // 1. Super Admin bypass (Super Admin has global authorization)
  if (normUserRole === "super_admin") {
    return { authorized: true };
  }

  // 2. Direct Role Match
  if (
    normUserRole === normReqRole ||
    (normReqRole === "hod" && (normUserRole === "hod" || normUserRole === "department_head")) ||
    (normReqRole === "academic_dean" && (normUserRole === "academic_dean" || normUserRole === "dean")) ||
    (normReqRole === "exam_cell" && (normUserRole === "exam_cell" || normUserRole === "exam_controller")) ||
    (normReqRole === "finance" && (normUserRole === "finance" || normUserRole === "finance_dean" || normUserRole === "accounts")) ||
    (normReqRole === "hr" && (normUserRole === "hr" || normUserRole === "admin")) ||
    (normReqRole === "librarian" && normUserRole === "librarian") ||
    (normReqRole === "warden" && normUserRole === "warden") ||
    (normReqRole === "accounts" && normUserRole === "accounts")
  ) {
    return { authorized: true };
  }

  // 3. Active Delegation Rule Check
  try {
    const activeDelegations = await prisma.delegationRule.findMany({
      where: {
        status: { in: ["Active Delegation", "Active"] },
      },
    });

    const now = new Date();
    for (const rule of activeDelegations) {
      // Validate optional start and end date boundaries if defined
      if (rule.startDate && new Date(rule.startDate) > now) continue;
      if (rule.endDate && new Date(rule.endDate) < now) continue;

      const normDelRole = rule.delegatedRole.toLowerCase().replace(/[- ]/g, "_");
      if (normDelRole === normReqRole) {
        const assigned = rule.assignedPerson.toLowerCase();
        const userName = (user.userName || "").toLowerCase();
        const userId = user.userId.toLowerCase();

        if (assigned.includes(userName) || assigned.includes(userId) || assigned.includes(normUserRole)) {
          return { authorized: true, isDelegated: true };
        }
      }
    }
  } catch (err) {
    console.error("Delegation lookup error:", err);
  }

  return {
    authorized: false,
    reason: `User role '${user.userRole}' is not authorized to sign off step requiring '${requiredRole}'.`,
  };
}
