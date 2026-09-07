import api from "@/lib/api";

export interface CampusBlock {
  id: string;
  name: string;
  code?: string;
  type: "Boys Hostel" | "Girls Hostel";
  letter: "B" | "G";
  totalCapacity: number;
  occupied: number;
  vacant: number;
  maintenance: number;
  vacancyRate: string;
  isRedRate: boolean;
  floorsCount?: number;
}

export interface CampusOutingRequest {
  id: string;
  studentName: string;
  studentId: string;
  destination?: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "OUT" | "RETURNED";
  parentApproval: "PENDING" | "APPROVED" | "REJECTED";
  wardenApproval?: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
}

export interface MessMealTiming {
  id?: string;
  name: string;
  time?: string;
  timeRange?: string;
  startTime?: string;
  endTime?: string;
  status: "Active" | "Inactive";
}

export interface MenuScheduleRow {
  id?: string;
  date?: string;
  dateString?: string;
  day?: string;
  dayName?: string;
  breakfastNonVeg: boolean;
  lunchNonVeg: boolean;
  snacksNonVeg: boolean;
  dinnerNonVeg: boolean;
  notes: string;
}

export interface AttendanceLogItem {
  id: string;
  name?: string;
  studentName?: string;
  userId: string;
  block?: string;
  blockName?: string;
  floor?: string;
  floorName?: string;
  room?: string;
  roomNumber?: string;
  type?: "CHECK-IN" | "CHECK-OUT";
  eventType?: "CHECK-IN" | "CHECK-OUT";
  timestamp: string;
  device?: string;
  deviceName?: string;
  method: string;
}

export interface SystemUserItem {
  id: string;
  name: string;
  username: string;
  rollNumber: string;
  jntuNumber?: string;
  email: string;
  contact: string;
  parentContact?: string;
  department: string;
  branch?: string;
  year: number;
  yearText?: string;
  semester: number;
  semesterText?: string;
  section?: string;
  blockName?: string;
  floorName?: string;
  roomNumber?: string;
  bedNumber?: string;
  allocationStatus?: "ALLOCATED" | "PENDING" | "UNALLOCATED";
  role: "Student" | "Admin" | "Staff";
  status: "ACTIVE" | "PENDING" | "DEACTIVATED";
  defaultPassword?: string;
  lastActive: string;
  lastActiveIp: string;
  hasLoginAccess?: boolean;
}

export interface DashboardMetricsResponse {
  students: {
    total: number;
    active: number;
    onLeave: number;
    suspended: number;
  };
  rooms: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
    occupancyRate: string;
    vacancyRate: string;
  };
  outing: {
    pending: number;
    approved: number;
    activeOut: number;
  };
  attendance: {
    inside: number;
    outside: number;
  };
  violations: {
    today: number;
    unresolved: number;
  };
  blocksSummary: CampusBlock[];
}

export interface HostelRegistrationApplicant {
  id: string;
  applicationId?: string;
  fullName: string;
  registrationNumber: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  profilePhoto?: string;
  permanentAddress: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  mobileNumber: string;
  alternateNumber?: string;
  email: string;
  parentName: string;
  parentContact: string;
  parentEmail?: string;
  guardianName?: string;
  guardianMobileNumber?: string;
  guardianEmail?: string;
  emergencyContact: string;
  college?: string;
  course: string;
  department: string;
  yearOfStudy: string;
  semester: string;
  section?: string;
  admissionNumber?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyMedicalInfo?: string;
  specialRequirements?: string;
  medications?: string;
  hostelRequired?: boolean;
  preferredBlock?: string;
  roomTypePreference?: string;
  specialAccommodationReq?: string;
  preferredRoomId?: string;
  status: "PENDING_ALLOCATION" | "PENDING" | "ALLOCATED" | "REJECTED";
  allocatedBlockId?: string;
  allocatedBlockName?: string;
  allocatedFloorId?: string;
  allocatedFloorName?: string;
  allocatedRoomId?: string;
  allocatedRoomNumber?: string;
  allocatedBedId?: string;
  allocatedBedNumber?: string;
  allocatedAt?: string;
  allocatedBy?: string;
  rejectionReason?: string;
  agreeTerms?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const HostelService = {
  // ── 1. Dashboard ──
  async getDashboard(): Promise<DashboardMetricsResponse> {
    const res = await api.get<DashboardMetricsResponse>("/api/hostel/dashboard");
    return res.data;
  },

  // ── 2. Blocks ──
  async getBlocks(): Promise<CampusBlock[]> {
    const res = await api.get<CampusBlock[]>("/api/hostel/blocks");
    return res.data;
  },

  async createBlock(data: { blockName: string; type: string; totalCapacity: number }): Promise<CampusBlock> {
    const res = await api.post<CampusBlock>("/api/hostel/blocks", data);
    return res.data;
  },

  async deleteBlock(id: string): Promise<CampusBlock> {
    const res = await api.delete<CampusBlock>(`/api/hostel/blocks/${id}`);
    return res.data;
  },

  // ── 3. Mess ──
  async getMealSlots(): Promise<MessMealTiming[]> {
    const res = await api.get<MessMealTiming[]>("/api/hostel/mess/slots");
    return res.data.map((m) => ({
      ...m,
      time: m.timeRange || m.time || `${m.startTime || ""} - ${m.endTime || ""}`,
    }));
  },

  async getMenuSchedule(): Promise<MenuScheduleRow[]> {
    const res = await api.get<MenuScheduleRow[]>("/api/hostel/mess/menu");
    return res.data.map((row) => ({
      ...row,
      date: row.dateString || row.date || "",
      day: row.dayName || row.day || "",
      notes: row.notes || "",
    }));
  },

  async updateMenuSchedule(
    dateString: string,
    data: Partial<MenuScheduleRow>
  ): Promise<MenuScheduleRow> {
    const res = await api.patch<MenuScheduleRow>(`/api/hostel/mess/menu/${encodeURIComponent(dateString)}`, data);
    return res.data;
  },

  // ── 4. Outings ──
  async getOutings(): Promise<CampusOutingRequest[]> {
    const res = await api.get<CampusOutingRequest[]>("/api/hostel/outings");
    return res.data;
  },

  async createOuting(data: {
    studentName: string;
    studentId: string;
    destination?: string;
    fromDate: string;
    toDate: string;
    reason: string;
  }): Promise<CampusOutingRequest> {
    const res = await api.post<CampusOutingRequest>("/api/hostel/outings", data);
    return res.data;
  },

  async approveOuting(id: string, role: string, action: "APPROVED" | "REJECTED", comments?: string) {
    const res = await api.patch(`/api/hostel/outings/${id}/approve`, { role, action, comments });
    return res.data;
  },

  // ── 5. Attendance & Logs ──
  async getAttendanceLogs(): Promise<AttendanceLogItem[]> {
    try {
      const res = await api.get<AttendanceLogItem[]>("/api/hostel/presence/logs");
      return res.data.map((l: any) => ({
        ...l,
        name: l.studentName || l.name || "Student",
        block: l.blockName || l.block || "",
        floor: l.floorName || l.floor || "",
        room: l.roomNumber || l.room || "",
        type: l.movementType || l.eventType || l.type || "CHECK-IN",
        device: l.deviceName || l.device || "Main Gate Biometric",
        timestamp: new Date(l.timestamp).toLocaleString("en-IN"),
      }));
    } catch {
      const res = await api.get<AttendanceLogItem[]>("/api/hostel/attendance/logs");
      return res.data.map((l) => ({
        ...l,
        name: l.studentName || l.name || "Student",
        block: l.blockName || l.block || "",
        floor: l.floorName || l.floor || "",
        room: l.roomNumber || l.room || "",
        type: l.eventType || l.type || "CHECK-IN",
        device: l.deviceName || l.device || "Turnstile",
        timestamp: new Date(l.timestamp).toLocaleString("en-GB"),
      }));
    }
  },

  // ── Presence & Log History Suite ──
  async getGateLogs(params?: any): Promise<{ data: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const res = await api.get("/api/hostel/gate-logs", { params });
      if (res.data && Array.isArray(res.data.data)) {
        return res.data;
      }
      if (Array.isArray(res.data)) {
        return { data: res.data, total: res.data.length, page: 1, pageSize: res.data.length, totalPages: 1 };
      }
      return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    } catch (e) {
      return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }
  },

  async getGateLogById(id: string): Promise<any> {
    const res = await api.get(`/api/hostel/gate-logs/${id}`);
    return res.data?.data || res.data;
  },

  async getStudentsStillInHostel(): Promise<any[]> {
    try {
      const res = await api.get("/api/hostel/presence/still-in-hostel");
      return res.data;
    } catch (e) {
      return [];
    }
  },

  async getOutingStudentsList(): Promise<any[]> {
    try {
      const res = await api.get("/api/hostel/presence/outing-students");
      return res.data;
    } catch (e) {
      return [];
    }
  },

  async getMovementViolations(params?: any): Promise<{ data: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const res = await api.get("/api/hostel/violations", { params });
      if (res.data && Array.isArray(res.data.data)) {
        return res.data;
      }
      if (Array.isArray(res.data)) {
        return { data: res.data, total: res.data.length, page: 1, pageSize: res.data.length, totalPages: 1 };
      }
      return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    } catch (e) {
      return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }
  },

  async getViolationById(id: string): Promise<any> {
    const res = await api.get(`/api/hostel/violations/${id}`);
    return res.data?.data || res.data;
  },

  async reviewViolation(id: string, remarks?: string, reviewedBy = "Chief Warden"): Promise<any> {
    const res = await api.patch(`/api/hostel/violations/${id}/review`, { remarks, reviewedBy });
    return res.data;
  },

  async resolveViolation(id: string, actionTaken: string, remarks?: string, resolvedBy = "Chief Warden"): Promise<any> {
    const res = await api.patch(`/api/hostel/violations/${id}/resolve`, { actionTaken, remarks, resolvedBy });
    return res.data;
  },

  async getPresenceAnalytics(): Promise<any> {
    try {
      const res = await api.get("/api/hostel/presence/analytics");
      return res.data;
    } catch (e) {
      return null;
    }
  },

  async recordMovement(data: any): Promise<any> {
    const res = await api.post("/api/hostel/presence/movement", data);
    return res.data;
  },

  // ── 6. Users (Strictly Student Users) ──
  async getUsers(): Promise<SystemUserItem[]> {
    const res = await api.get<SystemUserItem[]>("/api/hostel/users");
    return res.data;
  },

  async createStudentUser(data: {
    name: string;
    rollNumber: string;
    department: string;
    year: number | string;
    semester: number | string;
    section?: string;
    email?: string;
    contact: string;
    parentContact?: string;
    blockName?: string;
    floorName?: string;
    roomNumber?: string;
    bedNumber?: string;
    password?: string;
  }): Promise<{ student: any; credentials: { name: string; username: string; rollNumber: string; email: string; password: string; role: string; loginUrl: string } }> {
    const res = await api.post("/api/hostel/users", data);
    return res.data;
  },

  async resetStudentPassword(id: string, password?: string): Promise<any> {
    const res = await api.post(`/api/hostel/users/${id}/reset-password`, { password });
    return res.data;
  },

  async deallocateStudentRoom(id: string): Promise<any> {
    const res = await api.post(`/api/hostel/users/${id}/deallocate-room`);
    return res.data;
  },

  // ── 7. Guest Billing ──
  async getGuestBills(): Promise<any[]> {
    const res = await api.get<any[]>("/api/hostel/bills");
    return res.data;
  },

  async createGuestBill(data: {
    guestName: string;
    contactNumber: string;
    purpose: string;
    fromDate: string;
    toDate: string;
    roomCharges: number;
    messCharges: number;
    extraCharges?: number;
  }) {
    const res = await api.post("/api/hostel/bills", data);
    return res.data;
  },

  // ── 8. Leaves & Suspensions ──
  async getLeaves(): Promise<any[]> {
    const res = await api.get<any[]>("/api/hostel/leaves");
    return res.data;
  },

  async createLeave(data: {
    studentName: string;
    studentId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) {
    const res = await api.post("/api/hostel/leaves", data);
    return res.data;
  },

  async getSuspensions(): Promise<any[]> {
    const res = await api.get<any[]>("/api/hostel/suspensions");
    return res.data;
  },

  // ── 9. Devices ──
  async getDevices(): Promise<any[]> {
    const res = await api.get<any[]>("/api/hostel/devices");
    return res.data;
  },

  // ── 10. Violations ──
  async getViolations(): Promise<any[]> {
    const res = await api.get<any[]>("/api/hostel/violations");
    return res.data;
  },

  // ── 11. Audit Logs ──
  async getAuditLogs(): Promise<any[]> {
    const res = await api.get<any[]>("/api/hostel/audit-logs");
    return res.data;
  },

  // ── 12. Student Online Registration & Room Allocation ──
  async getRegistrationMeta(): Promise<any> {
    try {
      const res = await api.get("/api/hostel/registration-meta");
      if (res.data && res.data.success) return res.data;
    } catch (e) {
      console.warn("Using local registration meta fallback");
    }
    return {
      courses: [
        { id: "btech", name: "B.Tech (Bachelor of Technology)", max_year: 4 },
        { id: "mtech", name: "M.Tech (Master of Technology)", max_year: 2 },
        { id: "mca", name: "MCA (Master of Computer Applications)", max_year: 2 },
        { id: "mba", name: "MBA (Master of Business Administration)", max_year: 2 },
        { id: "bpharm", name: "B.Pharmacy", max_year: 4 },
      ],
      departments: [
        { id: "cse", name: "Computer Science & Engineering (CSE)" },
        { id: "ai_ds", name: "Artificial Intelligence & Data Science (AI & DS)" },
        { id: "ece", name: "Electronics & Communication Engineering (ECE)" },
        { id: "eee", name: "Electrical & Electronics Engineering (EEE)" },
        { id: "mech", name: "Mechanical Engineering (ME)" },
        { id: "civil", name: "Civil Engineering (CE)" },
        { id: "it", name: "Information Technology (IT)" },
        { id: "chem", name: "Chemical Engineering" },
      ],
      roomTypes: [
        { id: "ac_single", name: "AC Single Deluxe Room", price: "₹1,10,000 / Sem", description: "Private room with AC, personal study desk, wardrobe, attached bath.", features: "Air Conditioned, Attached Bath, High Speed Wi-Fi, Daily Housekeeping" },
        { id: "ac_double", name: "AC Double Sharing", price: "₹85,000 / Sem", description: "Twin sharing with AC, two study workstations, built-in wardrobes.", features: "Air Conditioned, High Speed Wi-Fi, Balcony, Housekeeping" },
        { id: "non_ac_double", name: "Non-AC Double Sharing", price: "₹65,000 / Sem", description: "Spacious twin sharing room with ample natural ventilation and wardrobes.", features: "Ceiling Fan, High Speed Wi-Fi, Shared Bath, Hot Water" },
        { id: "ac_triple", name: "AC Triple Sharing", price: "₹70,000 / Sem", description: "Three sharing room with centralized AC, individual study tables.", features: "Air Conditioned, Study Units, Storage Lockers" },
        { id: "non_ac_four", name: "Non-AC 4 Sharing", price: "₹50,000 / Sem", description: "Economy 4-student sharing room with spacious layout and lockers.", features: "Spacious Layout, Personal Lockers, Study Tables" },
      ],
    };
  },

  async submitRegistration(data: any): Promise<{ success: boolean; data?: HostelRegistrationApplicant; error?: string }> {
    try {
      const res = await api.post("/api/hostel/registrations", data);
      if (res.data && (res.data.success || res.data.id)) {
        // Also persist in localStorage queue for instant sync
        saveLocalRegistration(res.data.data || res.data);
        return { success: true, data: res.data.data || res.data };
      }
      if (res.data?.error) return { success: false, error: res.data.error };
    } catch (e: any) {
      console.warn("Backend API unavailable, saving locally:", e);
    }
    // Offline / direct storage fallback
    const mockApp: HostelRegistrationApplicant = {
      ...data,
      id: `REG-${Date.now()}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    saveLocalRegistration(mockApp);
    return { success: true, data: mockApp };
  },

  async getRegistrations(status?: string): Promise<HostelRegistrationApplicant[]> {
    let list: HostelRegistrationApplicant[] = [];
    try {
      const endpoint = status ? `/api/hostel/registrations?status=${status}` : "/api/hostel/registrations";
      const res = await api.get<HostelRegistrationApplicant[]>(endpoint);
      if (Array.isArray(res.data) && res.data.length > 0) {
        list = res.data;
      }
    } catch (e) {
      console.warn("Using local registrations dataset");
    }

    // Merge with localStorage items
    const local = getLocalRegistrations();
    const map = new Map<string, HostelRegistrationApplicant>();
    [...local, ...list, ...INITIAL_REGISTRATIONS].forEach((item) => {
      map.set(item.id || item.registrationNumber, item);
    });

    const result = Array.from(map.values());
    if (status) return result.filter((r) => r.status === status);
    return result;
  },

  async allocateRegistrationRoom(
    registrationId: string,
    allocation: { blockId: string; floorId: string; roomId: string; bedId: string; allocatedBy?: string; blockName?: string; floorName?: string; roomNumber?: string; bedNumber?: string }
  ) {
    try {
      const res = await api.post(`/api/hostel/registrations/${registrationId}/allocate`, allocation);
      if (res.data && res.data.success) {
        updateLocalRegistrationStatus(registrationId, "ALLOCATED", allocation);
        return res.data;
      }
    } catch (e) {
      console.warn("Allocating locally fallback:", e);
    }
    // Update local state
    updateLocalRegistrationStatus(registrationId, "ALLOCATED", allocation);
    return { success: true };
  },

  async rejectRegistration(registrationId: string, reason?: string) {
    try {
      const res = await api.patch(`/api/hostel/registrations/${registrationId}/status`, { reason });
      if (res.data && res.data.success) {
        updateLocalRegistrationStatus(registrationId, "REJECTED", { rejectionReason: reason });
        return res.data;
      }
    } catch (e) {
      console.warn("Rejecting locally fallback:", e);
    }
    updateLocalRegistrationStatus(registrationId, "REJECTED", { rejectionReason: reason });
    return { success: true };
  },
};

const LOCAL_STORAGE_REG_KEY = "edusuite_hostel_registrations_v2";

export const INITIAL_REGISTRATIONS: HostelRegistrationApplicant[] = [
  {
    id: "REG-2026-001",
    fullName: "Vadamodula Pravallika",
    registrationNumber: "24331A05P9",
    dateOfBirth: "2006-05-14",
    gender: "Female",
    bloodGroup: "O+",
    permanentAddress: "D.No 4-12, Main Road, Kothavalasa",
    city: "Vizianagaram",
    state: "Andhra Pradesh",
    pincode: "535183",
    mobileNumber: "9876543219",
    alternateNumber: "9876543210",
    email: "pravallika.v@gmail.com",
    parentName: "V. Satyanarayana",
    parentContact: "9440123456",
    parentEmail: "v.satya@gmail.com",
    emergencyContact: "9440123456",
    course: "B.Tech (Bachelor of Technology)",
    department: "Computer Science & Engineering (CSE)",
    yearOfStudy: "1st Year",
    semester: "1st Semester",
    roomTypePreference: "AC Double Sharing",
    preferredBlock: "Girls Hostel",
    status: "PENDING",
    agreeTerms: true,
    createdAt: "2026-08-26T10:30:00Z",
  },
  {
    id: "REG-2026-002",
    fullName: "Tarunya Jogi",
    registrationNumber: "24331A1253",
    dateOfBirth: "2006-03-22",
    gender: "Female",
    bloodGroup: "B+",
    permanentAddress: "Plot 88, Sector 4, MVP Colony",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pincode: "530017",
    mobileNumber: "8500789579",
    email: "tarunyajogi@gmail.com",
    parentName: "J. Appa Rao",
    parentContact: "9848123987",
    parentEmail: "j.apparao@gmail.com",
    emergencyContact: "9848123987",
    course: "B.Tech (Bachelor of Technology)",
    department: "Information Technology (IT)",
    yearOfStudy: "1st Year",
    semester: "1st Semester",
    roomTypePreference: "AC Triple Sharing",
    preferredBlock: "Girls Hostel",
    status: "PENDING",
    agreeTerms: true,
    createdAt: "2026-08-26T11:15:00Z",
  },
  {
    id: "REG-2026-003",
    fullName: "Kakarla Sai Teja",
    registrationNumber: "23331A0482",
    dateOfBirth: "2005-09-18",
    gender: "Male",
    bloodGroup: "A+",
    permanentAddress: "Flat 302, Sri Krishna Apts, Gajuwaka",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pincode: "530026",
    mobileNumber: "7675922209",
    email: "saiteja.k@gmail.com",
    parentName: "K. Venkateswara Rao",
    parentContact: "9490123789",
    parentEmail: "k.venkat@gmail.com",
    emergencyContact: "9490123789",
    course: "B.Tech (Bachelor of Technology)",
    department: "Electronics & Communication Engineering (ECE)",
    yearOfStudy: "2nd Year",
    semester: "3rd Semester",
    roomTypePreference: "AC Single Deluxe Room",
    preferredBlock: "Boys Hostel",
    status: "PENDING",
    agreeTerms: true,
    createdAt: "2026-08-26T12:05:00Z",
  },
];

function getLocalRegistrations(): HostelRegistrationApplicant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Local storage error:", e);
  }
  return [];
}

function saveLocalRegistration(reg: HostelRegistrationApplicant) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalRegistrations();
    const updated = [reg, ...existing.filter((item) => item.registrationNumber !== reg.registrationNumber && item.id !== reg.id)];
    localStorage.setItem(LOCAL_STORAGE_REG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Save local storage error:", e);
  }
}

function updateLocalRegistrationStatus(
  id: string,
  status: "ALLOCATED" | "REJECTED",
  extra?: any
) {
  if (typeof window === "undefined") return;
  try {
    const all = [...getLocalRegistrations(), ...INITIAL_REGISTRATIONS];
    const item = all.find((r) => r.id === id || r.registrationNumber === id);
    if (item) {
      item.status = status;
      if (status === "ALLOCATED" && extra) {
        item.allocatedBlockId = extra.blockId;
        item.allocatedBlockName = extra.blockName || "Hostel Block";
        item.allocatedFloorId = extra.floorId;
        item.allocatedFloorName = extra.floorName || "Floor 1";
        item.allocatedRoomId = extra.roomId;
        item.allocatedRoomNumber = extra.roomNumber || "101";
        item.allocatedBedId = extra.bedId;
        item.allocatedBedNumber = extra.bedNumber || "Bed-1";
        item.allocatedAt = new Date().toISOString();
        item.allocatedBy = extra.allocatedBy || "Chief Warden";
      } else if (status === "REJECTED" && extra) {
        item.rejectionReason = extra.rejectionReason;
      }
      saveLocalRegistration(item);
    }
  } catch (e) {
    console.error("Update local storage error:", e);
  }
}
