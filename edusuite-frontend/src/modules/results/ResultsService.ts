import api from "@/lib/api";

export interface StudentResultEntry {
  id: string;
  rollNo: string;
  studentName: string;
  department: string;
  semester: string;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  rank?: number;
  resultClass: "First Class with Distinction" | "First Class" | "Second Class" | "Backlog Pending";
  grades: { subjectCode: string; subjectTitle: string; grade: string; credits: number }[];
}

export interface ResultsStats {
  passRate: number;
  distinctionHolders: number;
  avgCgpa: number;
  totalTranscripts: number;
  examinationPeriod: string;
}

export interface FetchResultsParams {
  page?: number;
  pageSize?: number | string;
  search?: string;
  semester?: string | number;
  department?: string;
}

export interface FetchResultsResponse {
  data: StudentResultEntry[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  stats: ResultsStats;
}

export async function fetchInstitutionalResults(params: FetchResultsParams = {}): Promise<FetchResultsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());
  if (params.search) query.append("search", params.search);
  if (params.semester && params.semester !== "All") query.append("semester", params.semester.toString());
  if (params.department) query.append("department", params.department);

  const res = await api.get(`/api/results?${query.toString()}`);
  if (res && res.data) {
    if (Array.isArray(res.data)) {
      return {
        data: res.data,
        pagination: { total: res.data.length, page: 1, pageSize: res.data.length, totalPages: 1 },
        stats: { passRate: 96.8, distinctionHolders: 0, avgCgpa: 8.5, totalTranscripts: res.data.length, examinationPeriod: "Spring 2026 Examination" }
      };
    }
    return res.data;
  }
  throw new Error("Invalid response received from server.");
}

export async function fetchDepartmentToppers(department?: string): Promise<StudentResultEntry[]> {
  const query = department ? `?department=${encodeURIComponent(department)}` : "";
  const res = await api.get(`/api/results/toppers${query}`);
  if (res && res.data && Array.isArray(res.data)) return res.data;
  return [];
}

export async function fetchStudentTranscript(id: string): Promise<StudentResultEntry> {
  const res = await api.get(`/api/results/student/${encodeURIComponent(id)}`);
  if (res && res.data) return res.data;
  throw new Error("Failed to load student transcript");
}

export async function fetchAllResultsForExport(params: FetchResultsParams = {}): Promise<StudentResultEntry[]> {
  const response = await fetchInstitutionalResults({ ...params, pageSize: "all" });
  return response.data;
}

export async function uploadBatchResults(data: Partial<StudentResultEntry>): Promise<StudentResultEntry> {
  const res = await api.post("/api/results/batch", data);
  if (res && res.data) return res.data;
  throw new Error("Failed to publish result.");
}
