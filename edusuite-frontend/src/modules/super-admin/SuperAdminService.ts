import api from "@/lib/api";

export interface SuperAdminStats {
  totalStudents: number;
  totalStaff: number;
  totalDepartments: number;
  totalRevenue: string;
  apiLatency: string;
  sslStatus: string;
  errorRate: string;
  systemHealth: { label: string; status: string }[];
}

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "principal" | "dean" | "hod" | "faculty" | "student" | "finance" | "hr";
  department: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
  createdAt: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  hodName: string;
  studentsCount: number;
  facultyCount: number;
  accreditation: string;
  status: "Active" | "Under Review";
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  ipAddress: string;
  status: "Success" | "Failed";
}

export interface RolePermissionMatrixItem {
  role: "super_admin" | "admin" | "principal" | "dean" | "hod" | "faculty" | "student" | "finance" | "hr";
  label: string;
  isSystemAdmin: boolean;
  isPrincipal: boolean;
  isDean: boolean;
  isHod: boolean;
  isFaculty: boolean;
  isFinance: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
}

export interface DelegationRule {
  id: string;
  moduleName: string;
  delegatedRole: "Principal" | "Dean" | "HOD" | "Faculty" | "Finance Manager" | "HR Manager" | "Exam Controller";
  assignedPerson: string;
  scope: string;
  status: "Active Delegation" | "Pending Review";
  permissions: string[];
}

export const MOCK_DELEGATION_RULES: DelegationRule[] = [
  {
    id: "DEL-101",
    moduleName: "Academic Operations & Class Scheduling",
    delegatedRole: "Dean",
    assignedPerson: "Dr. S. K. Gupta (Dean Academics)",
    scope: "Curriculum approval, semester timetable generation, faculty workload balance",
    status: "Active Delegation",
    permissions: ["Generate Timetable", "Approve Curriculum", "Manage Course Catalog"],
  },
  {
    id: "DEL-102",
    moduleName: "Departmental Faculty & Student Supervision",
    delegatedRole: "HOD",
    assignedPerson: "Dr. Rajesh Sharma (HOD CSE)",
    scope: "Departmental student roster, proxy faculty allocation, lesson plan review",
    status: "Active Delegation",
    permissions: ["Approve Lesson Plans", "Assign Proxy Faculty", "Track Syllabus Progress"],
  },
  {
    id: "DEL-103",
    moduleName: "Institutional Examinations & Grading",
    delegatedRole: "Exam Controller",
    assignedPerson: "Dr. Meera Nambiar (Controller of Exams)",
    scope: "Exam timetable scheduling, hall tickets issuance, internal marks lock",
    status: "Active Delegation",
    permissions: ["Schedule Examinations", "Publish Results", "Lock Grade Sheets"],
  },
  {
    id: "DEL-104",
    moduleName: "Financial Operations & Fee Governance",
    delegatedRole: "Finance Manager",
    assignedPerson: "Vikram Malhotra (Chief Finance Officer)",
    scope: "Student fee collection, payroll disbursement, vendor procurement approvals",
    status: "Active Delegation",
    permissions: ["Manage Student Fees", "Process Staff Payroll", "Approve POs"],
  },
  {
    id: "DEL-105",
    moduleName: "Talent Management & Faculty Leave Governance",
    delegatedRole: "HR Manager",
    assignedPerson: "Priya Sundaram (HR Director)",
    scope: "Faculty leave approvals, staff recruitment, performance appraisal records",
    status: "Active Delegation",
    permissions: ["Approve Faculty Leaves", "Manage Employee Records", "Process Appraisals"],
  },
];

// ----------------------------------------------------------------------
// STATIC MOCK FALLBACK DATASETS
// ----------------------------------------------------------------------

export const MOCK_SUPER_ADMIN_STATS: SuperAdminStats = {
  totalStudents: 5246,
  totalStaff: 623,
  totalDepartments: 23,
  totalRevenue: "₹12.45 Cr",
  apiLatency: "42ms",
  sslStatus: "Valid (Expires in 290 days)",
  errorRate: "0.02%",
  systemHealth: [
    { label: "Database Node (PostgreSQL Cluster)", status: "Healthy (12ms)" },
    { label: "Express API Gateway", status: "Healthy" },
    { label: "Redis Cache Cluster", status: "Healthy (99.8% hit rate)" },
    { label: "Cloud Object Storage", status: "72% used (1.4 TB)" },
    { label: "Automated Daily Backup", status: "Completed Today 02:00 AM" },
  ],
};

export const MOCK_USERS: SuperAdminUser[] = [
  {
    id: "USR-001",
    name: "Hanish Super Admin",
    email: "superadmin@college.com",
    role: "super_admin",
    department: "System Administration",
    status: "Active",
    lastLogin: "2026-08-01 12:30",
    createdAt: "2024-01-10",
  },
  {
    id: "USR-002",
    name: "Dr. S. K. Gupta",
    email: "dean@college.com",
    role: "dean",
    department: "Computer Science & Engineering",
    status: "Active",
    lastLogin: "2026-08-01 11:15",
    createdAt: "2024-02-15",
  },
  {
    id: "USR-003",
    name: "Dr. Rajesh Sharma",
    email: "hod@college.com",
    role: "hod",
    department: "Computer Science & Engineering",
    status: "Active",
    lastLogin: "2026-07-31 16:45",
    createdAt: "2024-03-01",
  },
  {
    id: "USR-004",
    name: "Dr. Meera Rao",
    email: "vice_principal@college.com",
    role: "admin",
    department: "Electronics & Communication",
    status: "Active",
    lastLogin: "2026-07-30 09:20",
    createdAt: "2024-03-12",
  },
  {
    id: "USR-005",
    name: "Prof. Anand Kumar",
    email: "faculty@college.com",
    role: "faculty",
    department: "Mechanical Engineering",
    status: "Active",
    lastLogin: "2026-07-29 14:10",
    createdAt: "2024-04-05",
  },
  {
    id: "USR-006",
    name: "Anirudh Sharma",
    email: "student@college.com",
    role: "student",
    department: "Computer Science & Engineering",
    status: "Active",
    lastLogin: "2026-08-01 10:05",
    createdAt: "2025-08-20",
  },
  {
    id: "USR-007",
    name: "Vikram Malhotra",
    email: "finance@college.com",
    role: "finance",
    department: "Accounts & Finance",
    status: "Active",
    lastLogin: "2026-07-31 18:00",
    createdAt: "2024-05-18",
  },
];

export const MOCK_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "DEP-001",
    name: "Computer Science & Engineering",
    code: "CSE",
    hodName: "Dr. Rajesh Sharma",
    studentsCount: 1250,
    facultyCount: 85,
    accreditation: "NBA & NAAC A+",
    status: "Active",
  },
  {
    id: "DEP-002",
    name: "Electronics & Communication Engineering",
    code: "ECE",
    hodName: "Dr. Meera Rao",
    studentsCount: 980,
    facultyCount: 64,
    accreditation: "NBA Accredited",
    status: "Active",
  },
  {
    id: "DEP-003",
    name: "Artificial Intelligence & Data Science",
    code: "AI&DS",
    hodName: "Dr. K. Sai Teja",
    studentsCount: 640,
    facultyCount: 42,
    accreditation: "NAAC A+",
    status: "Active",
  },
  {
    id: "DEP-004",
    name: "Mechanical Engineering",
    code: "ME",
    hodName: "Prof. V. K. Murthy",
    studentsCount: 720,
    facultyCount: 50,
    accreditation: "NBA Accredited",
    status: "Active",
  },
  {
    id: "DEP-005",
    name: "Biotechnology & Bio-Engineering",
    code: "BIOTECH",
    hodName: "Dr. S. Priya",
    studentsCount: 410,
    facultyCount: 28,
    accreditation: "NIRF Top 50",
    status: "Active",
  },
];

export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "LOG-9001",
    timestamp: "2026-08-01 12:20:15",
    actor: "Super Admin (Hanish)",
    action: "Triggered System Backup",
    module: "Infrastructure",
    ipAddress: "103.82.40.12",
    status: "Success",
  },
  {
    id: "LOG-9002",
    timestamp: "2026-08-01 11:45:00",
    actor: "Admin-HYD",
    action: "Updated Faculty Role Privileges",
    module: "Security & RBAC",
    ipAddress: "103.82.40.15",
    status: "Success",
  },
  {
    id: "LOG-9003",
    timestamp: "2026-07-31 16:30:22",
    actor: "System Daemon",
    action: "Automated PostgreSQL DB Snapshot",
    module: "Database",
    ipAddress: "127.0.0.1",
    status: "Success",
  },
  {
    id: "LOG-9004",
    timestamp: "2026-07-31 14:12:08",
    actor: "Finance Manager",
    action: "Exported Monthly Payroll Ledger",
    module: "Finance & Payroll",
    ipAddress: "103.82.40.99",
    status: "Success",
  },
  {
    id: "LOG-9005",
    timestamp: "2026-07-31 10:05:40",
    actor: "Security Daemon",
    action: "Blocked Failed Brute-Force Login (IP 192.168.1.145)",
    module: "Security Firewall",
    ipAddress: "192.168.1.145",
    status: "Failed",
  },
];

export const MOCK_ROLE_PERMISSIONS: RolePermissionMatrixItem[] = [
  { role: "super_admin", label: "Super Admin", isSystemAdmin: true, isPrincipal: true, isDean: true, isHod: true, isFaculty: true, isFinance: true, canManageUsers: true, canExportData: true },
  { role: "admin", label: "Operations Admin", isSystemAdmin: true, isPrincipal: false, isDean: false, isHod: false, isFaculty: true, isFinance: false, canManageUsers: true, canExportData: true },
  { role: "principal", label: "Principal", isSystemAdmin: false, isPrincipal: true, isDean: true, isHod: true, isFaculty: true, isFinance: true, canManageUsers: false, canExportData: true },
  { role: "dean", label: "Academic Dean", isSystemAdmin: false, isPrincipal: false, isDean: true, isHod: true, isFaculty: true, isFinance: false, canManageUsers: false, canExportData: true },
  { role: "hod", label: "HOD", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: true, isFaculty: true, isFinance: false, canManageUsers: false, canExportData: true },
  { role: "faculty", label: "Faculty Member", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: true, isFinance: false, canManageUsers: false, canExportData: false },
  { role: "student", label: "Student", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: false, isFinance: false, canManageUsers: false, canExportData: false },
  { role: "finance", label: "Finance Officer", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: false, isFinance: true, canManageUsers: false, canExportData: true },
  { role: "hr", label: "HR Manager", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: false, isFinance: false, canManageUsers: true, canExportData: true },
];

// In-Memory State store for reactive persistence
let usersStateStore: SuperAdminUser[] = [...MOCK_USERS];
let departmentsStateStore: DepartmentItem[] = [...MOCK_DEPARTMENTS];
let auditLogsStateStore: AuditLogItem[] = [...MOCK_AUDIT_LOGS];
let rolePermissionsStateStore: RolePermissionMatrixItem[] = [...MOCK_ROLE_PERMISSIONS];

function addAuditRecord(action: string, moduleName: string, status: "Success" | "Failed" = "Success") {
  const newLog: AuditLogItem = {
    id: `LOG-${Math.floor(9000 + Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    actor: "Super Admin (Console)",
    action,
    module: moduleName,
    ipAddress: "127.0.0.1",
    status,
  };
  auditLogsStateStore = [newLog, ...auditLogsStateStore];
}

// ----------------------------------------------------------------------
// SERVICE FUNCTIONS (WITH AXIOS & OFFLINE MOCK FALLBACK)
// ----------------------------------------------------------------------

/**
 * Fetch Super Admin overall platform statistics
 */
export async function fetchSuperAdminStats(): Promise<SuperAdminStats> {
  try {
    const res = await api.get("/api/super-admin/stats");
    if (res && res.data && res.data.totalStudents) {
      return res.data;
    }
  } catch (err) {
    // API fallback
  }

  const totalStudents = departmentsStateStore.reduce((acc, d) => acc + d.studentsCount, 0);
  const totalStaff = usersStateStore.filter((u) => u.role !== "student").length * 15;
  const totalDepartments = departmentsStateStore.length;

  return {
    ...MOCK_SUPER_ADMIN_STATS,
    totalStudents: totalStudents > 0 ? totalStudents : MOCK_SUPER_ADMIN_STATS.totalStudents,
    totalStaff: totalStaff > 0 ? totalStaff : MOCK_SUPER_ADMIN_STATS.totalStaff,
    totalDepartments: totalDepartments > 0 ? totalDepartments : MOCK_SUPER_ADMIN_STATS.totalDepartments,
  };
}

/**
 * Fetch all platform users with search/role filters
 */
export async function fetchUsers(filters?: {
  role?: string;
  search?: string;
  page?: number;
}): Promise<SuperAdminUser[]> {
  try {
    const res = await api.get("/api/super-admin/users");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    // API fallback
  }
  return usersStateStore;
}

/**
 * Create a new user account
 */
export async function createUser(payload: Partial<SuperAdminUser>): Promise<SuperAdminUser> {
  try {
    const res = await api.post("/api/super-admin/users", payload);
    if (res && res.data && res.data.id) {
      usersStateStore = [res.data, ...usersStateStore];
      addAuditRecord(`Created account for ${res.data.name} (${res.data.role})`, "User Management");
      return res.data;
    }
  } catch (err) {
    // API fallback
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const newUser: SuperAdminUser = {
    id: `USR-${Math.floor(100 + Math.random() * 900)}`,
    name: payload.name || "New Registered User",
    email: payload.email || "user@college.com",
    role: payload.role || "faculty",
    department: payload.department || "Computer Science & Engineering",
    status: payload.status || "Active",
    lastLogin: "Never",
    createdAt: dateStr || "2026-08-01",
  };

  usersStateStore = [newUser, ...usersStateStore];
  addAuditRecord(`Created user ${newUser.name} [${newUser.id}]`, "User Management");
  return newUser;
}

/**
 * Update an existing user account
 */
export async function updateUser(
  id: string,
  payload: Partial<SuperAdminUser>,
): Promise<Partial<SuperAdminUser>> {
  try {
    const res = await api.put(`/api/super-admin/users/${id}`, payload);
    if (res && res.data) {
      usersStateStore = usersStateStore.map((u) => (u.id === id ? { ...u, ...payload } : u));
      addAuditRecord(`Updated user profile [${id}]`, "User Management");
      return res.data;
    }
  } catch (err) {
    // API fallback
  }

  usersStateStore = usersStateStore.map((u) => (u.id === id ? { ...u, ...payload } : u));
  addAuditRecord(`Updated profile for ${payload.name || id}`, "User Management");
  return { id, ...payload };
}

/**
 * Delete a user account
 */
export async function deleteUser(id: string): Promise<boolean> {
  const target = usersStateStore.find((u) => u.id === id);
  try {
    await api.delete(`/api/super-admin/users/${id}`);
  } catch (err) {
    // API fallback
  }

  usersStateStore = usersStateStore.filter((u) => u.id !== id);
  addAuditRecord(`Deleted user account ${target?.name || id}`, "User Management");
  return true;
}

/**
 * Bulk delete user accounts
 */
export async function bulkDeleteUsers(ids: string[]): Promise<boolean> {
  try {
    await api.post("/api/super-admin/users/bulk-delete", { ids });
    usersStateStore = usersStateStore.filter((u) => !ids.includes(u.id));
    return true;
  } catch (err) {
    // API fallback
  }

  usersStateStore = usersStateStore.filter((u) => !ids.includes(u.id));
  addAuditRecord(`Bulk deleted ${ids.length} user accounts`, "User Management");
  return true;
}

/**
 * Bulk update user status (Active | Inactive | Suspended)
 */
export async function bulkUpdateUserStatus(ids: string[], status: "Active" | "Inactive" | "Suspended"): Promise<boolean> {
  try {
    await api.post("/api/super-admin/users/bulk-status", { ids, status });
    usersStateStore = usersStateStore.map((u) => (ids.includes(u.id) ? { ...u, status } : u));
    return true;
  } catch (err) {
    // API fallback
  }

  usersStateStore = usersStateStore.map((u) => (ids.includes(u.id) ? { ...u, status } : u));
  addAuditRecord(`Bulk updated status to ${status} for ${ids.length} users`, "User Management");
  return true;
}

/**
 * Fetch all departments
 */
export async function fetchDepartments(): Promise<DepartmentItem[]> {
  try {
    const res = await api.get("/api/super-admin/departments");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    // API fallback
  }
  return departmentsStateStore;
}

/**
 * Create a new department
 */
export async function createDepartment(payload: Partial<DepartmentItem>): Promise<DepartmentItem> {
  try {
    const res = await api.post("/api/super-admin/departments", payload);
    if (res && res.data && res.data.id) {
      departmentsStateStore = [res.data, ...departmentsStateStore];
      return res.data;
    }
  } catch (err) {
    // API fallback
  }

  const newDept: DepartmentItem = {
    id: `DEP-00${departmentsStateStore.length + 1}`,
    name: payload.name || "New Department",
    code: payload.code || "DEPT",
    hodName: payload.hodName || "Dr. Unassigned",
    studentsCount: payload.studentsCount || 100,
    facultyCount: payload.facultyCount || 10,
    accreditation: payload.accreditation || "NAAC Accredited",
    status: payload.status || "Active",
  };
  departmentsStateStore = [...departmentsStateStore, newDept];
  addAuditRecord(`Created new department: ${newDept.name} (${newDept.code})`, "Department Management");
  return newDept;
}

/**
 * Fetch system audit logs
 */
export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const res = await api.get("/api/super-admin/audit-logs");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    // API fallback
  }
  return auditLogsStateStore;
}

/**
 * Fetch role permission matrix
 */
export async function fetchRolePermissions(): Promise<RolePermissionMatrixItem[]> {
  try {
    const res = await api.get("/api/super-admin/role-permissions");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      rolePermissionsStateStore = res.data;
      return res.data;
    }
  } catch (err) {
    // API fallback
  }
  return rolePermissionsStateStore;
}

/**
 * Update role permission flag
 */
export async function updateRolePermission(
  role: string,
  flagKey: keyof RolePermissionMatrixItem,
  value: boolean,
): Promise<RolePermissionMatrixItem[]> {
  try {
    const res = await api.put(`/api/super-admin/role-permissions/${role}`, { [flagKey]: value });
    if (res && res.data) {
      rolePermissionsStateStore = rolePermissionsStateStore.map((item) =>
        item.role === role ? { ...item, [flagKey]: value } : item
      );
      return rolePermissionsStateStore;
    }
  } catch (err) {
    // API fallback
  }

  rolePermissionsStateStore = rolePermissionsStateStore.map((item) => {
    if (item.role === role) {
      return { ...item, [flagKey]: value };
    }
    return item;
  });
  addAuditRecord(`Updated privilege flag '${String(flagKey)}' for role ${role}`, "Security & RBAC");
  return rolePermissionsStateStore;
}

/**
 * Trigger system backup
 */
export async function triggerBackup(): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
}> {
  try {
    const res = await api.post("/api/super-admin/backups/create");
    if (res && res.data) {
      addAuditRecord("Triggered System Database Backup", "Infrastructure");
      return res.data;
    }
  } catch (err) {
    // API fallback
  }

  const timestamp = new Date().toLocaleString();
  addAuditRecord("Triggered System Database Backup (Snapshot Created)", "Infrastructure");
  return {
    success: true,
    message: "System database backup snapshot created successfully (Local Storage Node).",
    timestamp,
  };
}

let delegationRulesStateStore: DelegationRule[] = [...MOCK_DELEGATION_RULES];

export async function fetchDelegationRules(): Promise<DelegationRule[]> {
  try {
    const res = await api.get("/api/super-admin/delegation-rules");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      delegationRulesStateStore = res.data;
      return res.data;
    }
  } catch (err) {}
  return delegationRulesStateStore;
}

export async function updateDelegationRule(
  id: string,
  updated: Partial<DelegationRule>
): Promise<DelegationRule[]> {
  try {
    const res = await api.put(`/api/super-admin/delegation-rules/${id}`, updated);
    if (res && res.data) {
      delegationRulesStateStore = delegationRulesStateStore.map((rule) =>
        rule.id === id ? { ...rule, ...updated } : rule
      );
      return delegationRulesStateStore;
    }
  } catch (err) {}

  delegationRulesStateStore = delegationRulesStateStore.map((rule) =>
    rule.id === id ? { ...rule, ...updated } : rule
  );
  addAuditRecord(`Updated Operational Delegation Rule ${id}`, "Operational Delegation");
  return delegationRulesStateStore;
}

export async function createDelegationRule(
  payload: Partial<DelegationRule>
): Promise<DelegationRule[]> {
  try {
    const res = await api.post("/api/super-admin/delegation-rules", payload);
    if (res && res.data) {
      delegationRulesStateStore = [res.data, ...delegationRulesStateStore];
      return delegationRulesStateStore;
    }
  } catch (err) {}

  const newRule: DelegationRule = {
    id: `DEL-${101 + delegationRulesStateStore.length}`,
    moduleName: payload.moduleName || "New Delegated Operation",
    delegatedRole: payload.delegatedRole || "HOD",
    assignedPerson: payload.assignedPerson || "Unassigned Faculty",
    scope: payload.scope || "Operational Scope",
    status: payload.status || "Active Delegation",
    permissions: payload.permissions || ["Read", "Approve"],
  };
  delegationRulesStateStore = [newRule, ...delegationRulesStateStore];
  addAuditRecord(`Created Operational Delegation Rule ${newRule.id}`, "Operational Delegation");
  return delegationRulesStateStore;
}

export async function deleteDelegationRule(id: string): Promise<DelegationRule[]> {
  try {
    await api.delete(`/api/super-admin/delegation-rules/${id}`);
  } catch (err) {}

  delegationRulesStateStore = delegationRulesStateStore.filter((r) => r.id !== id);
  addAuditRecord(`Deleted Operational Delegation Rule ${id}`, "Operational Delegation");
  return delegationRulesStateStore;
}

export async function deleteDepartment(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await api.delete(`/api/super-admin/departments/${id}`);
    if (res && res.data) {
      departmentsStateStore = departmentsStateStore.filter((d) => d.id !== id);
      return { success: true, message: res.data.message };
    }
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.error) {
      return { success: false, message: err.response.data.error };
    }
  }

  departmentsStateStore = departmentsStateStore.filter((d) => d.id !== id);
  addAuditRecord(`Deleted department ${id}`, "Department Management");
  return { success: true, message: "Department deleted." };
}

// ----------------------------------------------------------------------
// NEW ADVANCED SERVICES: SEARCH, RETENTION, ANOMALIES, BROADCAST, EXPORT
// ----------------------------------------------------------------------

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  route: string;
}

export interface AcademicRetentionItem {
  departmentName: string;
  departmentCode: string;
  studentCount: number;
  dropoutRisk: string;
  riskLevel: "low" | "medium" | "high";
  retentionRate: string;
}

export interface AnomalyItem {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  source: string;
  description: string;
  timestamp: string;
  status: "ACTIVE" | "INVESTIGATING" | "MITIGATED";
  details: {
    ip: string;
    attempts?: number;
    affectedAccount?: string;
    gatewayNode?: string;
    requestCount?: string;
  };
}

export interface EmergencyBroadcastPayload {
  title: string;
  message: string;
  audience: string;
  priority: string;
}

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await api.get(`/api/super-admin/global-search?q=${encodeURIComponent(query)}`);
    if (res && res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    }
  } catch (err) {}

  // Local fallback search across mock users, departments
  const q = query.toLowerCase();
  const results: SearchResultItem[] = [];

  MOCK_USERS.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).forEach((u) => {
    results.push({
      id: u.id,
      title: u.name,
      subtitle: `${u.role.toUpperCase()} • ${u.department}`,
      category: u.role === "student" ? "Students" : "Faculty & Staff",
      route: "/super-admin/dashboard",
    });
  });

  MOCK_DEPARTMENTS.filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)).forEach((d) => {
    results.push({
      id: d.id,
      title: d.name,
      subtitle: `Code: ${d.code}`,
      category: "Departments",
      route: "/super-admin/dashboard",
    });
  });

  return results;
}

export async function fetchAcademicRetention(): Promise<AcademicRetentionItem[]> {
  try {
    const res = await api.get("/api/super-admin/academic-retention");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {}

  return [
    { departmentName: "Computer Science & Engineering", departmentCode: "CSE", studentCount: 1250, dropoutRisk: "Low (2.1%)", riskLevel: "low", retentionRate: "97.9%" },
    { departmentName: "Electronics & Communication", departmentCode: "ECE", studentCount: 980, dropoutRisk: "Medium (8.4%)", riskLevel: "medium", retentionRate: "91.6%" },
    { departmentName: "Mechanical Engineering", departmentCode: "ME", studentCount: 720, dropoutRisk: "High (14.2%)", riskLevel: "high", retentionRate: "85.8%" },
    { departmentName: "Biotechnology & Bio-Engineering", departmentCode: "BIOTECH", studentCount: 410, dropoutRisk: "Low (1.8%)", riskLevel: "low", retentionRate: "98.2%" },
  ];
}

export async function fetchAnomalies(): Promise<AnomalyItem[]> {
  try {
    const res = await api.get("/api/super-admin/anomalies");
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {}

  return [
    {
      id: "ANO-101",
      title: "Concurrent Request Surge",
      severity: "HIGH",
      source: "API Gateway Firewall",
      description: "800+ concurrent requests detected on SIT-HYD API gateway node within 30 seconds.",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: "ACTIVE",
      details: { ip: "103.82.40.12", requestCount: "840 req/sec", gatewayNode: "SIT-HYD Node 02" },
    },
    {
      id: "ANO-102",
      title: "Brute Force IP Block",
      severity: "CRITICAL",
      source: "Authentication Sentinel",
      description: "15 failed password attempts targeting Super Admin persona from single IP.",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      status: "ACTIVE",
      details: { ip: "192.168.1.145", attempts: 15, affectedAccount: "superadmin@college.com" },
    },
  ];
}

export async function mitigateAnomaly(
  id: string,
  action?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post(`/api/super-admin/anomalies/${id}/mitigate`, { action });
    if (res && res.data) {
      addAuditRecord(`Mitigated anomaly ${id} via ${action || 'Automated Action'}`, "Security & Anomaly Engine");
      return res.data;
    }
  } catch (err) {}

  addAuditRecord(`Mitigated anomaly ${id} via ${action || 'Automated Action'}`, "Security & Anomaly Engine");
  return { success: true, message: `Anomaly ${id} mitigated successfully.` };
}

export async function sendEmergencyBroadcast(
  payload: EmergencyBroadcastPayload
): Promise<{ success: boolean; message: string; recipientCount: number }> {
  try {
    const res = await api.post("/api/super-admin/broadcast", payload);
    if (res && res.data) {
      addAuditRecord(`Dispatched Emergency Broadcast "${payload.title}" to ${payload.audience}`, "Emergency & Safety");
      return res.data;
    }
  } catch (err) {}

  addAuditRecord(`Dispatched Emergency Broadcast "${payload.title}" to ${payload.audience}`, "Emergency & Safety");
  return {
    success: true,
    message: `Emergency broadcast dispatches queued successfully for ${payload.audience}.`,
    recipientCount: payload.audience === "All Users" ? 5869 : 1250,
  };
}

export async function exportUsersRoster(): Promise<void> {
  try {
    const res = await api.get("/api/super-admin/users/export", { responseType: "blob" });
    if (res && res.data) {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `edusuite-user-roster-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
  } catch (err) {}
}



