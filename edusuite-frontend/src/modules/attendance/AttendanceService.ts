import api from "@/lib/api";

export interface AttendanceRecord {
  id: string;
  date: string;
  courseCode: string;
  courseTitle: string;
  department: string;
  section: string;
  instructor: string;
  classTeacher?: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount?: number;
  percentage: number;
  dailyPct?: number;
  weeklyPct?: number;
  monthlyPct?: number;
  status: string;
  governanceStatus?: string;
}

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export interface AttendanceStats {
  averageAttendance: number;
  presentToday: number;
  absentToday: number;
  shortageAlertsCount: number;
  totalRecords: number;
  timeframe?: string;
  date: string;
}

export interface AttendanceLedgerItem {
  id: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  department: string;
  section?: string;
  semester: number;
  date: string;
  periodNumber: number;
  status: string;
  courseCode: string;
  courseTitle: string;
  instructor: string;
}

export interface ClassStudentRoster {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  section: string;
  status: "Present" | "Absent" | "Late";
}

export async function fetchAttendanceStats(
  department?: string,
  timeframe: string = "daily",
  date?: string
): Promise<AttendanceStats> {
  const query = new URLSearchParams();
  if (department && department !== "All Departments" && department !== "All") {
    query.append("department", department);
  }
  if (timeframe) query.append("timeframe", timeframe);
  if (date) query.append("date", date);

  const res = await api.get(`/api/attendance/stats?${query.toString()}`);
  if (res && res.data && typeof res.data.averageAttendance === "number") {
    return res.data;
  }
  return {
    averageAttendance: 0,
    presentToday: 0,
    absentToday: 0,
    shortageAlertsCount: 0,
    totalRecords: 0,
    timeframe,
    date: date || new Date().toISOString().split("T")[0],
  };
}

export async function fetchAttendanceRecords(
  department?: string,
  search?: string,
  timeframe: string = "daily",
  date?: string
): Promise<AttendanceRecord[]> {
  const query = new URLSearchParams();
  if (department && department !== "All Departments" && department !== "All") {
    query.append("department", department);
  }
  if (search) query.append("search", search);
  if (timeframe) query.append("timeframe", timeframe);
  if (date) query.append("date", date);

  const res = await api.get(`/api/attendance/classes?${query.toString()}`);
  if (res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function fetchAttendanceLedger(
  department?: string,
  status?: string,
  search?: string,
  timeframe?: string
): Promise<AttendanceLedgerItem[]> {
  const query = new URLSearchParams();
  if (department && department !== "All Departments" && department !== "All") {
    query.append("department", department);
  }
  if (status && status !== "All") query.append("status", status);
  if (search) query.append("search", search);
  if (timeframe && timeframe !== "all") query.append("timeframe", timeframe);

  const res = await api.get(`/api/attendance/ledger?${query.toString()}`);
  if (res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export interface ClassOption {
  id: string;
  semester: number;
  year: number;
  label: string;
}

export interface SessionInfo {
  hasSubject: boolean;
  timetableId?: string;
  subjectCode?: string;
  subjectName?: string;
  facultyName?: string;
  room?: string;
  periodNumber?: number;
  message?: string;
}

export async function fetchDepartmentClasses(department?: string): Promise<ClassOption[]> {
  const query = new URLSearchParams();
  if (department && department !== "All Departments") query.append("department", department);

  const res = await api.get(`/api/attendance/classes-list?${query.toString()}`);
  if (res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function fetchClassSections(department?: string, semester?: string): Promise<string[]> {
  const query = new URLSearchParams();
  if (department && department !== "All Departments") query.append("department", department);
  if (semester) query.append("semester", semester);

  const res = await api.get(`/api/attendance/sections-list?${query.toString()}`);
  if (res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function fetchSessionInfo(
  department?: string,
  semester?: string,
  section?: string,
  periodNumber: number = 1,
  date?: string
): Promise<SessionInfo> {
  const query = new URLSearchParams();
  if (department && department !== "All Departments") query.append("department", department);
  if (semester) query.append("semester", semester);
  if (section) query.append("section", section);
  query.append("periodNumber", String(periodNumber));
  if (date) query.append("date", date);

  const res = await api.get(`/api/attendance/session-info?${query.toString()}`);
  if (res && res.data) {
    return res.data;
  }
  return { hasSubject: false, message: "Unable to load session info." };
}

export async function fetchClassRoster(
  classId?: string,
  department?: string,
  section?: string,
  date?: string,
  periodNumber: number = 2
): Promise<ClassStudentRoster[]> {
  const query = new URLSearchParams();
  if (classId) query.append("classId", classId);
  if (department && department !== "All Departments") query.append("department", department);
  if (section) query.append("section", section);
  if (date) query.append("date", date);
  query.append("periodNumber", String(periodNumber));

  const res = await api.get(`/api/attendance/roster?${query.toString()}`);
  if (res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function submitClassAttendanceMark(payload: {
  timetableId?: string;
  date: string;
  periodNumber: number;
  records: { studentId: string; status: string }[];
}) {
  const res = await api.post("/api/attendance/mark", payload);
  return res.data;
}

export async function exportAttendanceLogs(
  department?: string,
  search?: string,
  timeframe?: string
): Promise<any[]> {
  const query = new URLSearchParams();
  if (department && department !== "All Departments" && department !== "All") {
    query.append("department", department);
  }
  if (search) query.append("search", search);
  if (timeframe) query.append("timeframe", timeframe);

  const res = await api.get(`/api/attendance/export?${query.toString()}`);
  if (res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function updateAttendanceRecord(
  id: string,
  updates: Partial<AttendanceRecord>
): Promise<Partial<AttendanceRecord>> {
  const res = await api.put(`/api/attendance/${id}`, updates);
  if (res && res.data) return res.data;
  return { id, ...updates };
}

export async function deleteAttendanceRecord(id: string): Promise<boolean> {
  await api.delete(`/api/attendance/${id}`);
  return true;
}

