/**
 * EduSuite Pro ERP — Centralized Module Barrel Exports
 * Allows cross-module component and service reuse across Staff, Student, Dean, HOD, and Super Admin portals.
 */

// Core Enterprise Operational Modules
export * as InventoryModule from "./inventory";
export * as ProcurementModule from "./procurement";
export * as HRModule from "./hr";
export * as EmployeeManagementModule from "./employee-management";
export * as LeaveModule from "./leave";
export * as PayrollModule from "./payroll";

// Academic & Student Governance Modules
export * as StudentsModule from "./students";
export * as FacultyModule from "./faculty";
export * as AcademicsModule from "./academics";
export * as AttendanceModule from "./attendance";
export * as TimetableModule from "./timetable";
export * as ExaminationsModule from "./examinations";
export * as LMSModule from "./lms";
export * as SubjectAllocationModule from "./subject-allocation";

// Institutional & Campus Operations
export * as LibraryModule from "./library";
export * as TransportModule from "./transport";
export * as CampusEventsModule from "./campus-events";
export * as FinanceModule from "./finance";
export * as PlacementModule from "./placement";
export * as SuperAdminModule from "./super-admin";
export * as AIAnalyticsModule from "./ai-analytics";
export * as AdmissionModule from "./admission";
export * as AccreditationModule from "./accreditation";
export * as ReportsModule from "./reports";
export * as ResultsModule from "./results";
