import api from "@/lib/api";

// ─── Shared Types ───────────────────────────────────────────────────────────

export interface PlacementDrive {
  id: string;
  companyName: string;
  jobRole: string;
  ctcLpa: number;
  eligibleDepts: string | null;
  driveDate: string;
  location: string | null;
  totalApplicants: number;
  selectedCount: number;
  status: "Upcoming" | "Ongoing" | "Completed";
}

export interface PlacedStudent {
  id: string;
  rollNo: string;
  studentName: string;
  department: string;
  semester: number | null;
  companyName: string;
  jobRole: string;
  ctcLpa: number;
  offerLetterStatus: "Issued" | "Pending Verification" | "Accepted";
  offerDate: string | null;
  driveId: string | null;
  driveDate: string | null;
  remarks: string | null;
}

export interface PlacementStats {
  department: string;
  departmentName: string;
  totalStudents: number;
  placedCount: number;
  /** placedStudents / totalStudents * 100 — all dept students are placement-eligible */
  placementRate: number;
  highestCtc: number | null;
  highestCtcCompany: string | null;
  averageCtc: number | null;
  recruiterCount: number;
}

// ─── API Functions ───────────────────────────────────────────────────────────
// All endpoints are HOD-scoped on the backend. Department comes from JWT — never trusted from frontend.

/**
 * Fetch department-scoped placement KPI stats from backend.
 * Returns null on error — caller shows empty/error state, NEVER mock data.
 */
export async function fetchHodPlacementStats(): Promise<PlacementStats | null> {
  try {
    const res = await api.get<PlacementStats>("/api/hod/placements/stats");
    if (res.status === 200 && res.data) return res.data;
    if (res.status === 403) {
      console.warn("[PlacementService] 403 from /api/hod/placements/stats — HOD has no dept assigned.");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch placement drives relevant to HOD's department.
 * Returns [] if none exist or on error.
 */
export async function fetchPlacementDrives(search?: string): Promise<PlacementDrive[]> {
  try {
    const res = await api.get<PlacementDrive[]>("/api/hod/placements/drives", {
      params: search ? { search } : undefined,
    });
    if (res.status === 200 && Array.isArray(res.data)) return res.data;
    return [];
  } catch {
    return [];
  }
}

/**
 * Fetch placed students in HOD's department only.
 * Returns [] if none exist or on error.
 */
export async function fetchPlacedStudents(search?: string): Promise<PlacedStudent[]> {
  try {
    const res = await api.get<PlacedStudent[]>("/api/hod/placements/placed-students", {
      params: search ? { search } : undefined,
    });
    if (res.status === 200 && Array.isArray(res.data)) return res.data;
    return [];
  } catch {
    return [];
  }
}

/**
 * Create a new placement record for a student in HOD's dept.
 * Backend verifies student belongs to HOD's department — cross-dept submissions are rejected with 403.
 * Throws on failure so the caller can show an error toast.
 */
export async function addPlacedStudentOffer(data: {
  rollNo?: string;
  studentId?: string;
  companyName: string;
  jobRole: string;
  ctcLpa?: number;
  offerDate?: string;
  offerLetterStatus?: string;
  driveId?: string;
  remarks?: string;
}): Promise<PlacedStudent> {
  const res = await api.post<PlacedStudent>("/api/hod/placements/record", data);
  if (res.status === 201 && res.data) return res.data;
  const errMsg = (res.data as any)?.error || "Failed to add placement offer.";
  throw new Error(errMsg);
}

/**
 * Schedule a new placement drive for HOD's department.
 * Backend locks eligibleDepts to HOD's own dept — cannot schedule for other depts.
 * Throws on failure so the caller can show an error toast.
 */
export async function createPlacementDrive(data: Partial<PlacementDrive>): Promise<PlacementDrive> {
  const res = await api.post<PlacementDrive>("/api/hod/placements/drives", data);
  if (res.status === 201 && res.data) return res.data;
  const errMsg = (res.data as any)?.error || "Failed to schedule placement drive.";
  throw new Error(errMsg);
}
