import api from "@/lib/api";

export interface WorkflowStep {
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

export interface EquipmentRequestMetadata {
  equipmentName?: string;
  category?: string;
  quantity?: number;
  requiredFor?: string;
  location?: string;
  estimatedUnitCost?: number;
  estimatedTotalCost?: number;
  justification?: string;
  requiredByDate?: string;
  supportingDoc?: string;
  submittedAt?: string;
}

export interface DamageReportMetadata {
  assetId?: string;
  assetCode?: string;
  assetName?: string;
  category?: string;
  location?: string;
  problemType?: string;
  problemDescription?: string;
  severity?: string;
  dateDiscovered?: string;
  reportedBy?: string;
  supportingDoc?: string;
  submittedAt?: string;
}

export interface ProcurementRecord {
  id: string;
  requestNumber: string;
  requestType: "EQUIPMENT_REQUEST" | "DAMAGE_REPORT";
  module: string;
  workflowCode: string;
  title: string;
  description: string;
  department: string;
  requestedBy: string;
  requestedByRole: string;
  priority: string;
  status: string;
  currentStage: string;
  currentStep: number;
  totalSteps: number;
  amount: number;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: EquipmentRequestMetadata & DamageReportMetadata;
  steps?: WorkflowStep[];
}

export interface ProcurementStats {
  departmentScope: string;
  openRequests: number;
  pendingApprovals: number;
  approvedRequests: number;
  damageReports: number;
  totalEstimatedSpend: number;
}

export interface DepartmentAsset {
  id: string;
  itemCode: string;
  assetTag: string;
  name: string;
  category: string;
  department: string;
  location: string;
  status: string;
  quantity: number;
  unitCost?: number;
}

export async function fetchProcurementStats(): Promise<ProcurementStats> {
  const res = await api.get("/api/procurement/stats");
  return res.data;
}

export async function fetchProcurementRecords(params?: {
  type?: string;
  status?: string;
  search?: string;
  department?: string;
}): Promise<ProcurementRecord[]> {
  const res = await api.get("/api/procurement", { params });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchDepartmentAssets(): Promise<DepartmentAsset[]> {
  const res = await api.get("/api/procurement/department-assets");
  return Array.isArray(res.data) ? res.data : [];
}

export async function createEquipmentRequest(data: {
  equipmentName: string;
  category: string;
  quantity: number;
  requiredFor: string;
  location: string;
  priority: string;
  estimatedUnitCost?: number;
  estimatedTotalCost: number;
  justification: string;
  requiredByDate?: string;
  supportingDoc?: string;
}): Promise<ProcurementRecord> {
  const res = await api.post("/api/procurement/request", data);
  return res.data;
}

export async function submitDamageReport(data: {
  assetId: string;
  problemType: string;
  problemDescription: string;
  severity: string;
  dateDiscovered?: string;
  reportedBy?: string;
  location?: string;
  supportingDoc?: string;
}): Promise<ProcurementRecord> {
  const res = await api.post("/api/procurement/damage-report", data);
  return res.data;
}

export async function fetchProcurementDetail(id: string): Promise<ProcurementRecord> {
  const res = await api.get(`/api/procurement/${id}`);
  return res.data;
}
