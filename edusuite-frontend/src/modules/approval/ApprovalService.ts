export interface ApprovalStepItem {
  stepNumber: number;
  requiredRole: string;
  label: string;
  flagRequired?: string;
  assignedApprover?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "SKIPPED" | string;
  action?: string;
  comment?: string;
  actedAt?: string;
  actorId?: string;
  actorName?: string;
}

export interface ApprovalRecordItem {
  id: string;
  requestNumber: string;
  requestType: "PAYROLL" | "REIMBURSEMENT" | "BANK_CHANGE" | "PAYROLL_DISBURSEMENT" | string;
  module?: string;
  workflowCode?: string;
  title: string;
  description?: string;
  amount?: number;
  currentStep?: number;
  totalSteps?: number;
  steps?: ApprovalStepItem[];
  entityType?: string;
  entityId?: string;
  metadataObj?: any;
  payrollRecordId?: string;
  reimbursementId?: string;
  bankChangeRequestId?: string;
  requestedBy: string;
  requestedByRole: string;
  department: string;
  currentStage: "SUBMITTED" | "HR_VERIFICATION" | "FINANCE_REVIEW" | "SUPER_ADMIN_PENDING" | "FINALIZED" | string;
  status: string;
  priority: "Normal" | "High" | "Critical" | string;
  hrVerifiedBy?: string;
  hrVerifiedAt?: string;
  hrNotes?: string;
  financeReviewedBy?: string;
  financeReviewedAt?: string;
  financeNotes?: string;
  superAdminDecisionBy?: string;
  superAdminDecisionAt?: string;
  superAdminNotes?: string;
  rejectionReason?: string;
  returnedToStage?: string;
  createdAt: string;
  updatedAt: string;
  maskedBankAccount?: string;
  isCallerAuthorizedForCurrentStep?: boolean;
  timeline?: {
    stage: string;
    status: string;
    actor: string;
    role: string;
    timestamp: string;
    notes: string;
  }[];
  payrollRecord?: any;
  reimbursement?: any;
  bankChangeRequest?: any;
}

export interface ApprovalStatsResponse {
  superAdminPendingCount: number;
  hrPendingCount: number;
  financePendingCount: number;
  totalPendingAmount: number;
  payrollCount: number;
  reimbursementCount: number;
  bankChangeCount: number;
  attendanceCount?: number;
  leaveCount?: number;
  examCount?: number;
  clearanceCount?: number;
}

/**
 * Fetch aggregated approval stats & badge counts
 */
export async function fetchApprovalStats(): Promise<ApprovalStatsResponse> {
  try {
    const res = await api.get("/api/approvals/stats");
    if (res && res.data) return res.data;
  } catch {}

  return {
    superAdminPendingCount: 0,
    hrPendingCount: 0,
    financePendingCount: 0,
    totalPendingAmount: 0,
    payrollCount: 0,
    reimbursementCount: 0,
    bankChangeCount: 0,
  };
}

/**
 * Create a new workflow approval request from any module
 */
export async function createApprovalRequest(payload: {
  workflowCode?: string;
  module?: string;
  title: string;
  description?: string;
  amount?: number;
  department?: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  priority?: string;
}): Promise<ApprovalRecordItem> {
  const res = await api.post("/api/approvals", payload);
  return res.data;
}

/**
 * Fetch approval requests with stage, type, status, and department filters
 */
export async function fetchApprovalRequests(filters?: {
  stage?: string;
  type?: string;
  module?: string;
  status?: string;
  department?: string;
  search?: string;
  workflowCode?: string;
}): Promise<ApprovalRecordItem[]> {
  try {
    const res = await api.get("/api/approvals", { params: filters });
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
  } catch {}

  return [];
}

/**
 * Fetch single approval request detail with full timeline history
 */
export async function fetchApprovalDetail(id: string): Promise<ApprovalRecordItem | null> {
  try {
    const res = await api.get(`/api/approvals/${id}`);
    if (res && res.data) return res.data;
  } catch {}
  return null;
}

/**
 * HR Stage Verification Sign-off
 */
export async function hrVerifyApproval(id: string, notes?: string): Promise<ApprovalRecordItem> {
  const res = await api.post(`/api/approvals/${id}/hr-verify`, { notes });
  return res.data;
}

/**
 * Finance Stage Review Sign-off
 */
export async function financeReviewApproval(id: string, notes?: string): Promise<ApprovalRecordItem> {
  const res = await api.post(`/api/approvals/${id}/finance-review`, { notes });
  return res.data;
}

/**
 * Step Acceptance / Final Approval
 */
export async function acceptApproval(id: string, notes?: string): Promise<ApprovalRecordItem> {
  const res = await api.post(`/api/approvals/${id}/accept`, { notes });
  return res.data;
}

/**
 * Rejection (Mandatory rejectionReason)
 */
export async function rejectApproval(id: string, rejectionReason: string): Promise<ApprovalRecordItem> {
  const res = await api.post(`/api/approvals/${id}/reject`, { rejectionReason });
  return res.data;
}

/**
 * Return Request to Previous Stage
 */
export async function returnApproval(id: string, notes?: string): Promise<ApprovalRecordItem> {
  const res = await api.post(`/api/approvals/${id}/return`, { notes });
  return res.data;
}

/**
 * Seed initial approval records
 */
export async function seedApprovalRequests(): Promise<any> {
  const res = await api.post("/api/approvals/seed");
  return res.data;
}
