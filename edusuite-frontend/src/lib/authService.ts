import { normalizeRole, type RoleId } from "./roleResolver";
import { DEPARTMENTS, type CoreRoleKey, type DepartmentCode, type ExternalPersona, type LoginRole } from "@/config/roles";

export interface UserCredential {
  canonicalRole: RoleId;
  roleName: string;
  email: string;
  defaultPassword: "password123";
  primaryScope: string;
  personaName: string;
}

export interface DesignationOption {
  id: string;
  label: string;
}

export interface ScopeOption {
  value: string;
  label: string;
}

export interface RoleResolutionContext {
  role: LoginRole;
  flags: string[];
  department?: DepartmentCode;
  externalPersona?: ExternalPersona;
  toastMessage: string;
}

export const SYSTEM_TEST_CREDENTIALS: UserCredential[] = [
  {
    canonicalRole: "super_admin",
    roleName: "Admission Desk",
    email: "admission@cms.com",
    defaultPassword: "password123",
    primaryScope: "Admission Office",
    personaName: "Admission Desk Control",
  },
  {
    canonicalRole: "super_admin",
    roleName: "Super Admin",
    email: "superadmin@cms.com",
    defaultPassword: "password123",
    primaryScope: "System Control & Governance",
    personaName: "Super Admin",
  },
  {
    canonicalRole: "admin",
    roleName: "Admin / Operations",
    email: "admin@cms.com",
    defaultPassword: "password123",
    primaryScope: "Daily Operations & Workflows",
    personaName: "Rajesh Sharma (Admin)",
  },
  {
    canonicalRole: "principal",
    roleName: "Principal",
    email: "principal@cms.com",
    defaultPassword: "password123",
    primaryScope: "Executive Oversight",
    personaName: "Dr. Meera Rao (Principal)",
  },
  {
    canonicalRole: "vice_principal",
    roleName: "Vice Principal",
    email: "vice_principal@cms.com",
    defaultPassword: "password123",
    primaryScope: "Operations & Student Conduct",
    personaName: "Prof. V. K. Murthy",
  },
  {
    canonicalRole: "academic_dean",
    roleName: "Academic Dean",
    email: "academicdean@cms.com",
    defaultPassword: "password123",
    primaryScope: "Academic Leadership",
    personaName: "Prof. Anand Kumar (Academic Dean)",
  },
  {
    canonicalRole: "student_dean",
    roleName: "Student Dean",
    email: "studentdean@cms.com",
    defaultPassword: "password123",
    primaryScope: "Student Welfare & Affairs",
    personaName: "Dr. Sunita Sharma (Student Dean)",
  },
  {
    canonicalRole: "iqac_dean",
    roleName: "IQAC Dean",
    email: "iqacdean@cms.com",
    defaultPassword: "password123",
    primaryScope: "Quality Assurance & NAAC",
    personaName: "Prof. K. V. Raman (IQAC Dean)",
  },
  {
    canonicalRole: "ima_dean",
    roleName: "IMA Dean",
    email: "imadean@cms.com",
    defaultPassword: "password123",
    primaryScope: "Infrastructure & Management",
    personaName: "Dr. R. K. Varma (IMA Dean)",
  },
  {
    canonicalRole: "research_dean",
    roleName: "Research & Development Dean",
    email: "researchdean@cms.com",
    defaultPassword: "password123",
    primaryScope: "R&D, Grants & Innovations",
    personaName: "Dr. A. P. J. Reddy (Research Dean)",
  },
  {
    canonicalRole: "finance_dean",
    roleName: "Finance Dean",
    email: "financedean@cms.com",
    defaultPassword: "password123",
    primaryScope: "Institutional Finance",
    personaName: "Ramesh Agarwal (Finance Dean)",
  },
  {
    canonicalRole: "examination_dean",
    roleName: "Examination Dean",
    email: "examinationdean@cms.com",
    defaultPassword: "password123",
    primaryScope: "Examinations & Evaluations",
    personaName: "Dr. P. V. Ramana (Exam Dean)",
  },
  {
    canonicalRole: "placement_dean",
    roleName: "Placement Dean",
    email: "placementdean@cms.com",
    defaultPassword: "password123",
    primaryScope: "Corporate Relations & Placements",
    personaName: "Vikram Malhotra (Placement Dean)",
  },
  {
    canonicalRole: "hod",
    roleName: "Head of Department (HOD)",
    email: "hod@cms.com",
    defaultPassword: "password123",
    primaryScope: "Department Administration",
    personaName: "Dr. S. K. Gupta (HOD CSE)",
  },
  {
    canonicalRole: "faculty",
    roleName: "Faculty / Teacher",
    email: "faculty@cms.com",
    defaultPassword: "password123",
    primaryScope: "Teaching & Evaluation",
    personaName: "Dr. Ravi Kumar",
  },
  {
    canonicalRole: "student",
    roleName: "Student",
    email: "student@vignan_student.edu.in",
    defaultPassword: "password123",
    primaryScope: "Learning & Academic Self-Service",
    personaName: "K. Sai Teja (22CS101)",
  },
  {
    canonicalRole: "parent",
    roleName: "Parent / Guardian",
    email: "parent@cms.com",
    defaultPassword: "password123",
    primaryScope: "Guardian Monitoring",
    personaName: "S. Anitha (Parent)",
  },
  {
    canonicalRole: "exam_cell",
    roleName: "Exam Controller",
    email: "examcell@cms.com",
    defaultPassword: "password123",
    primaryScope: "Examination Management",
    personaName: "Dr. P. V. Ramana (Controller)",
  },
  {
    canonicalRole: "librarian",
    roleName: "Librarian",
    email: "librarian@cms.com",
    defaultPassword: "password123",
    primaryScope: "Library System",
    personaName: "M. N. Swamy (Librarian)",
  },
  {
    canonicalRole: "placement",
    roleName: "Placement Officer",
    email: "placement@cms.com",
    defaultPassword: "password123",
    primaryScope: "Career & Placements",
    personaName: "Vikram Malhotra (TPO)",
  },
  {
    canonicalRole: "warden",
    roleName: "Hostel Warden",
    email: "warden@cms.com",
    defaultPassword: "password123",
    primaryScope: "Hostel Management",
    personaName: "Col. R. S. Rathore (Warden)",
  },
  {
    canonicalRole: "transport",
    roleName: "Transport Manager",
    email: "transport@cms.com",
    defaultPassword: "password123",
    primaryScope: "Fleet & Logistics",
    personaName: "Gurpreet Singh (Transport)",
  },
  {
    canonicalRole: "accounts",
    roleName: "Accounts & Finance",
    email: "accounts@cms.com",
    defaultPassword: "password123",
    primaryScope: "Financial Operations",
    personaName: "Ramesh Agarwal (Finance)",
  },
  {
    canonicalRole: "lms",
    roleName: "LMS Manager",
    email: "lms@cms.com",
    defaultPassword: "password123",
    primaryScope: "E-Learning Management",
    personaName: "Anita Deshmukh (LMS Admin)",
  },
  {
    canonicalRole: "alumni_coordinator",
    roleName: "Alumni Coordinator",
    email: "alumni.coordinator@cms.com",
    defaultPassword: "password123",
    primaryScope: "Graduate Engagement",
    personaName: "Priya Nair (Alumni Cell)",
  },
  {
    canonicalRole: "alumni",
    roleName: "Alumni",
    email: "alumni@cms.com",
    defaultPassword: "password123",
    primaryScope: "Graduate Network Portal",
    personaName: "Sarah Jenkins (Alumni 2022)",
  },
];

// ----------------------------------------------------------------------
// DYNAMIC SELECTION METADATA & REUSABLE MOCK SERVICE METHODS
// ----------------------------------------------------------------------

export const DESIGNATION_OPTIONS_MAP: Record<CoreRoleKey, DesignationOption[]> = {
  "super-admin": [
    { id: "global_admin", label: "Global System & Platform Owner" },
    { id: "admission_desk", label: "Admission Desk" },
    { id: "security_admin", label: "Security & Compliance Officer" },
    { id: "audit_admin", label: "Institutional Audit Auditor" },
  ],
  staff: [
    { id: "hod", label: "HOD (Head of Department)" },
    { id: "faculty", label: "Faculty / Teacher (Default)" },
    { id: "academic_dean", label: "Academic Dean" },
    { id: "student_dean", label: "Student Dean" },
    { id: "iqac_dean", label: "IQAC Dean" },
    { id: "ima_dean", label: "IMA Dean" },
    { id: "research_dean", label: "Research & Development Dean" },
    { id: "finance_dean", label: "Finance Dean" },
    { id: "examination_dean", label: "Examination Dean" },
    { id: "placement_dean", label: "Placement Dean" },
    { id: "exam_controller", label: "Exam Controller" },
    { id: "exam_assistant", label: "Exam Assistant" },
    { id: "placement_officer", label: "Placement Officer" },
    { id: "transport_officer", label: "Transport Officer" },
    { id: "hostel_warden", label: "Hostel Warden" },
    { id: "finance_officer", label: "Finance Officer" },
    { id: "library_admin", label: "Library Admin" },
    { id: "hr_manager", label: "HR Manager" },
    { id: "principal", label: "Principal" },
    { id: "vice_principal", label: "Vice Principal" },
    { id: "lab_incharge", label: "Lab Incharge" },
    { id: "naac_coordinator", label: "NAAC / IQAC Coordinator" },
  ],
  student: [
    { id: "btech", label: "B.Tech (Undergraduate Eng.)" },
    { id: "mtech", label: "M.Tech (Postgraduate Eng.)" },
    { id: "mba", label: "MBA (Master of Business Admin)" },
  ],
  parent: [
    { id: "ward_22cs101", label: "K. Sai Teja (Roll 22CS101)" },
    { id: "ward_22ece044", label: "Priya Sundaram (Roll 22ECE044)" },
    { id: "ward_22me089", label: "Anish Kulkarni (Roll 22ME089)" },
  ],
  "external-user": [
    { id: "recruiter", label: "Recruiter (Campus Drives)" },
    { id: "applicant", label: "Applicant (Pre-Admissions)" },
    { id: "alumni", label: "Alumni (Graduate Network)" },
    { id: "vendor", label: "Vendor (Suppliers & Services)" },
    { id: "guest_faculty", label: "Guest Faculty / Speaker" },
  ],
};

export function getDesignationOptionsForCoreRole(coreRole: CoreRoleKey): DesignationOption[] {
  return DESIGNATION_OPTIONS_MAP[coreRole] || [];
}

export function getScopeOptionsForDesignation(coreRole: CoreRoleKey, designation: string): ScopeOption[] {
  if (coreRole === "staff" || coreRole === "student") {
    return DEPARTMENTS.map((d) => ({
      value: d.code,
      label: `Branch: ${d.code} — ${d.name}`,
    }));
  }

  if (coreRole === "super-admin") {
    if (designation === "admission_desk") {
      return [
        { value: "Admission Office", label: "Scope: Admission Office & Main Campus" },
      ];
    }
    return [
      { value: "All Campuses (Global)", label: "Scope: All Campuses & Departments (Global)" },
      { value: "Main Campus (Hyderabad)", label: "Scope: Main Campus (Hyderabad)" },
      { value: "North Campus (Bengaluru)", label: "Scope: North Campus (Bengaluru)" },
    ];
  }

  if (coreRole === "parent") {
    return [
      { value: "Academic & Marks Overview", label: "View: Academic Performance & Marks" },
      { value: "Attendance Ledger & Alerts", label: "View: Attendance Ledger & Alerts" },
      { value: "Online Fee Payment & Invoices", label: "View: Online Fee Payment & Invoices" },
      { value: "Hostel & Transport Status", label: "View: Hostel & Transport Status" },
    ];
  }

  if (coreRole === "external-user") {
    switch (designation) {
      case "recruiter":
        return [
          { value: "Google Cloud", label: "Company: Google Cloud" },
          { value: "Microsoft India", label: "Company: Microsoft India" },
          { value: "Qualcomm", label: "Company: Qualcomm India" },
          { value: "Tesla Motors", label: "Company: Tesla Motors" },
        ];
      case "vendor":
        return [
          { value: "Cafeteria & Mess Services", label: "Vendor: Cafeteria & Mess Services" },
          { value: "IT Hardware Supplier", label: "Vendor: IT Hardware Supplier" },
          { value: "Transport Fleet Service", label: "Vendor: Transport Fleet Service" },
          { value: "Lab Equipment Supplier", label: "Vendor: Lab Equipment Supplier" },
        ];
      case "alumni":
        return [
          { value: "Batch of 2022", label: "Batch: Batch of 2022" },
          { value: "Batch of 2021", label: "Batch: Batch of 2021" },
          { value: "Batch of 2020", label: "Batch: Batch of 2020" },
        ];
      case "applicant":
        return [
          { value: "B.Tech CSE Admissions", label: "Target: B.Tech CSE Admissions" },
          { value: "B.Tech ECE Admissions", label: "Target: B.Tech ECE Admissions" },
          { value: "MBA Admissions", label: "Target: MBA Admissions" },
        ];
      case "guest_faculty":
        return [
          { value: "Computer Science Dept", label: "Visiting: Computer Science Dept" },
          { value: "Electronics Dept", label: "Visiting: Electronics Dept" },
        ];
      default:
        return [{ value: "General Scope", label: "Scope: General Access" }];
    }
  }

  return [{ value: "Default Scope", label: "Scope: Default" }];
}

export function getDefaultCredentialsForSelection(
  coreRole: CoreRoleKey,
  designation?: string,
): { email: string; password: string } {
  let email = "faculty@cms.com";
  let password = "password123";

  if (coreRole === "super-admin") {
    if (designation === "admission_desk") {
      email = "admission@cms.com";
    } else {
      email = "superadmin@cms.com";
    }
  } else if (coreRole === "student") email = "student@vignan_student.edu.in";
  else if (coreRole === "parent") email = "parent@cms.com";
  else if (coreRole === "external-user") {
    if (designation === "alumni") email = "alumni@cms.com";
    else email = "recruiter@cms.com";
  } else if (coreRole === "staff") {
    if (designation === "admin") email = "admin@cms.com";
    else if (designation === "hod") email = "hod@cms.com";
    else if (designation === "dean" || designation === "academic_dean") email = "academicdean@cms.com";
    else if (designation === "student_dean") email = "studentdean@cms.com";
    else if (designation === "iqac_dean") email = "iqacdean@cms.com";
    else if (designation === "ima_dean") email = "imadean@cms.com";
    else if (designation === "research_dean") email = "researchdean@cms.com";
    else if (designation === "finance_dean") email = "financedean@cms.com";
    else if (designation === "examination_dean") email = "examinationdean@cms.com";
    else if (designation === "placement_dean") email = "placementdean@cms.com";
    else if (designation === "principal") email = "principal@cms.com";
    else if (designation === "vice_principal") email = "vice_principal@cms.com";
    else if (designation === "exam_controller") email = "examcell@cms.com";
    else if (designation === "placement_officer") email = "placement@cms.com";
    else if (designation === "transport_officer") email = "transport@cms.com";
    else if (designation === "hostel_warden") email = "warden@cms.com";
    else if (designation === "finance_officer") email = "accounts@cms.com";
    else if (designation === "library_admin") email = "librarian@cms.com";
  }
  return { email, password };
}

export function resolveRoleContextFromSelection(
  coreRole: CoreRoleKey,
  designation: string,
  branch: string,
): RoleResolutionContext & { targetRoute?: string } {
  if (coreRole === "super-admin") {
    if (designation === "admission_desk") {
      return {
        role: "super-admin",
        flags: ["isAdmissionsOfficer", "isSystemAdmin"],
        toastMessage: "Logged in as Admission Desk — Admission Office Dashboard",
        targetRoute: "/dashboard/admission",
      };
    }
    return {
      role: "super-admin",
      flags: ["isSystemAdmin", "isPrincipal"],
      toastMessage: `Logged in as Super Admin [${branch}]`,
      targetRoute: "/super-admin/dashboard",
    };
  }

  if (coreRole === "staff") {
    const deptCode = (branch as DepartmentCode) || "CSE";
    if (designation === "admin") {
      return {
        role: "admin",
        flags: ["isAdmin", "isOperationsAdmin"],
        department: deptCode,
        toastMessage: `Logged in as Admin / Operations Console — Scope: ${deptCode}`,
      };
    }

    let flag = "isHod";
    let targetRoute = "/dashboard";

    if (designation === "hod") { flag = "isHod"; targetRoute = "/hod/dashboard"; }
    else if (designation === "dean" || designation === "academic_dean") { flag = "isDean"; targetRoute = "/staff/academic-dean"; }
    else if (designation === "student_dean") { flag = "isDean"; targetRoute = "/staff/student-dean"; }
    else if (designation === "iqac_dean") { flag = "isDean"; targetRoute = "/staff/iqac"; }
    else if (designation === "ima_dean") { flag = "isDean"; targetRoute = "/staff/ima"; }
    else if (designation === "research_dean") { flag = "isDean"; targetRoute = "/staff/research-development"; }
    else if (designation === "finance_dean") { flag = "isDean"; targetRoute = "/staff/finance-dean"; }
    else if (designation === "examination_dean") { flag = "isDean"; targetRoute = "/staff/examination-dean"; }
    else if (designation === "placement_dean") { flag = "isDean"; targetRoute = "/staff/placement-dean"; }
    else if (designation === "exam_controller") { flag = "isExamController"; targetRoute = "/examinations"; }
    else if (designation === "placement_officer") { flag = "isPlacementOfficer"; targetRoute = "/placement/dashboard"; }
    else if (designation === "transport_officer") { flag = "isTransportOfficer"; targetRoute = "/transport"; }
    else if (designation === "hostel_warden") { flag = "isHostelWarden"; targetRoute = "/hostel"; }
    else if (designation === "finance_officer") { flag = "isFinanceOfficer"; targetRoute = "/finance/dashboard"; }
    else if (designation === "library_admin") { flag = "isLibraryAdmin"; targetRoute = "/librarian"; }
    else if (designation === "hr_manager") { flag = "isHRManager"; targetRoute = "/hr/dashboard"; }
    else if (designation === "principal") { flag = "isPrincipal"; targetRoute = "/dashboard"; }
    else if (designation === "vice_principal") { flag = "isVicePrincipal"; targetRoute = "/dashboard"; }
    else { flag = "isMentor"; targetRoute = "/faculty/dashboard"; }

    let role: LoginRole = "staff";
    if (designation === "dean") role = "academic_dean";
    else if (designation.includes("_dean")) role = designation as LoginRole;

    return {
      role,
      flags: [flag, "isClassAdvisor", "isMentor"],
      department: deptCode,
      toastMessage: `Logged in as Staff: ${designation.toUpperCase()} — Branch: ${deptCode}`,
      targetRoute,
    };
  }

  if (coreRole === "student") {
    const deptCode = (branch as DepartmentCode) || "CSE";
    return {
      role: "student",
      flags: [],
      department: deptCode,
      toastMessage: `Logged in as Student (${designation.toUpperCase()} — ${branch})`,
    };
  }

  if (coreRole === "parent") {
    return {
      role: "parent",
      flags: [],
      toastMessage: `Logged in as Parent (${designation}) — View: ${branch}`,
    };
  }

  // external-user
  const persona = (designation as ExternalPersona) || "recruiter";
  return {
    role: "external-user",
    flags: [],
    externalPersona: persona,
    toastMessage: `Logged in as External User [${persona.toUpperCase()}] — ${branch}`,
  };
}

export interface LoginResult {
  success: boolean;
  user?: {
    email: string;
    role: RoleId;
    roleName: string;
    token: string;
    personaName: string;
  };
  message?: string;
}

export function loginWithCredentials(email: string, password: string): LoginResult {
  const match = SYSTEM_TEST_CREDENTIALS.find(
    (c) => c.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!match) {
    const normRole = normalizeRole(email);
    const roleMatch = SYSTEM_TEST_CREDENTIALS.find((c) => c.canonicalRole === normRole);
    if (roleMatch) {
      return {
        success: true,
        user: {
          email: roleMatch.email,
          role: roleMatch.canonicalRole,
          roleName: roleMatch.roleName,
          token: `jwt-mock-token-${roleMatch.canonicalRole}-${Date.now()}`,
          personaName: roleMatch.personaName,
        },
      };
    }
    return { success: false, message: "Invalid email or role credential." };
  }

  if (password !== "password123" && password !== "demo1234" && password !== "Admission@123") {
    return { success: false, message: "Invalid password. Use 'password123' or 'Admission@123'." };
  }

  return {
    success: true,
    user: {
      email: match.email,
      role: match.canonicalRole,
      roleName: match.roleName,
      token: `jwt-mock-token-${match.canonicalRole}-${Date.now()}`,
      personaName: match.personaName,
    },
  };
}
