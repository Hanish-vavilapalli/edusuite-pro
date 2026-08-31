import { useState, useEffect } from "react";
import { AvailableCourseItem } from "./types";
import { MOCK_AVAILABLE_COURSES } from "./mock-data";

export interface NptelCertificateRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  fileDataUrl?: string;
  remarks?: string;
  verificationStatus: "Pending Verification" | "Approved" | "Rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  uploadedAt: string;
}

export interface ExamRegistrationRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  semester: number;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  faculty: string;
  status: "Registered" | "Pending Verification" | "Rejected" | "Not Registered";
  nptelStatus: "None" | "Yes" | "No" | "Pending Verification" | "Approved" | "Rejected";
  submittedAt: string;
  certificate?: NptelCertificateRecord;
  hodStatus: "Pending" | "Approved" | "Rejected";
  examOfficeStatus: "Pending" | "Approved" | "Rejected";
  hodComment?: string;
  rejectionReason?: string;
}

const STORAGE_KEYS = {
  REGISTERED_COURSE_IDS: "edu_registered_course_ids_v2",
  SUBMITTED_SEMESTERS: "edu_submitted_semesters_v2",
  EXAM_REGISTRATIONS: "edu_exam_registrations_v2",
  NPTEL_CERTIFICATES: "edu_nptel_certificates_v2",
};

// Event for cross-component reactivity
const STORE_EVENT = "edu_exam_store_updated";

function emitStoreChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

// Initial state getters
export function getRegisteredCourseIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_COURSE_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSubmittedSemesters(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMITTED_SEMESTERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isSemesterCourseRegSubmitted(semester: number): boolean {
  return getSubmittedSemesters().includes(semester);
}

export function submitCourseRegistration(semester: number, courseIds: string[]) {
  if (typeof window === "undefined") return;
  const registered = Array.from(new Set([...getRegisteredCourseIds(), ...courseIds]));
  const semesters = Array.from(new Set([...getSubmittedSemesters(), semester]));

  localStorage.setItem(STORAGE_KEYS.REGISTERED_COURSE_IDS, JSON.stringify(registered));
  localStorage.setItem(STORAGE_KEYS.SUBMITTED_SEMESTERS, JSON.stringify(semesters));
  emitStoreChange();
}

export function getExamRegistrations(): ExamRegistrationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_REGISTRATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamRegistrations(records: ExamRegistrationRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.EXAM_REGISTRATIONS, JSON.stringify(records));
  emitStoreChange();
}

export function submitDirectExamRegistration(
  studentInfo: { studentId: string; studentName: string; rollNumber: string; department: string },
  selectedCourses: AvailableCourseItem[]
) {
  const current = getExamRegistrations();
  const now = new Date().toISOString();

  const newRecords: ExamRegistrationRecord[] = selectedCourses.map((c) => ({
    id: `EXM-${c.id}-${Date.now()}`,
    studentId: studentInfo.studentId,
    studentName: studentInfo.studentName,
    rollNumber: studentInfo.rollNumber,
    department: studentInfo.department,
    semester: c.semester,
    courseId: c.id,
    courseCode: c.code,
    courseName: c.name,
    credits: c.credits,
    faculty: c.faculty,
    status: "Registered",
    nptelStatus: "No",
    submittedAt: now,
    hodStatus: "Approved",
    examOfficeStatus: "Approved",
  }));

  // Merge replacing existing for same courseId
  const updated = current.filter((r) => !selectedCourses.some((sc) => sc.id === r.courseId)).concat(newRecords);
  saveExamRegistrations(updated);
}

export function submitNptelExamRegistration(
  studentInfo: { studentId: string; studentName: string; rollNumber: string; department: string },
  course: AvailableCourseItem,
  certMeta: { fileName: string; fileType: string; fileSizeMb: number; fileDataUrl?: string; remarks?: string }
) {
  const current = getExamRegistrations();
  const now = new Date().toISOString();

  const certRecord: NptelCertificateRecord = {
    id: `CERT-${Date.now()}`,
    studentId: studentInfo.studentId,
    courseId: course.id,
    courseCode: course.code,
    courseName: course.name,
    fileName: certMeta.fileName,
    fileType: certMeta.fileType,
    fileSizeMb: certMeta.fileSizeMb,
    fileDataUrl: certMeta.fileDataUrl,
    remarks: certMeta.remarks,
    verificationStatus: "Pending Verification",
    uploadedAt: now,
  };

  const regRecord: ExamRegistrationRecord = {
    id: `EXM-NPTEL-${course.id}-${Date.now()}`,
    studentId: studentInfo.studentId,
    studentName: studentInfo.studentName,
    rollNumber: studentInfo.rollNumber,
    department: studentInfo.department,
    semester: course.semester,
    courseId: course.id,
    courseCode: course.code,
    courseName: course.name,
    credits: course.credits,
    faculty: course.faculty,
    status: "Pending Verification",
    nptelStatus: "Pending Verification",
    submittedAt: now,
    certificate: certRecord,
    hodStatus: "Pending",
    examOfficeStatus: "Pending",
  };

  const updated = current.filter((r) => r.courseId !== course.id).concat(regRecord);
  saveExamRegistrations(updated);
}

export function approveByExamOffice(registrationId: string) {
  const current = getExamRegistrations();
  const updated = current.map((r) => {
    if (r.id === registrationId) {
      return {
        ...r,
        status: "Registered" as const,
        nptelStatus: "Approved" as const,
        examOfficeStatus: "Approved" as const,
        certificate: r.certificate
          ? { ...r.certificate, verificationStatus: "Approved" as const, verifiedBy: "Exam Cell Office", verifiedAt: new Date().toISOString() }
          : undefined,
      };
    }
    return r;
  });
  saveExamRegistrations(updated);
}

export function rejectByExamOffice(registrationId: string, reason?: string) {
  const current = getExamRegistrations();
  const updated = current.map((r) => {
    if (r.id === registrationId) {
      return {
        ...r,
        status: "Rejected" as const,
        nptelStatus: "Rejected" as const,
        examOfficeStatus: "Rejected" as const,
        rejectionReason: reason || "Certificate rejected by Examination Cell Office. Please re-upload.",
        certificate: r.certificate
          ? { ...r.certificate, verificationStatus: "Rejected" as const, rejectionReason: reason }
          : undefined,
      };
    }
    return r;
  });
  saveExamRegistrations(updated);
}

export function approveByHod(registrationId: string, comment?: string) {
  const current = getExamRegistrations();
  const updated = current.map((r) => {
    if (r.id === registrationId) {
      const newExamOfficeStatus = r.examOfficeStatus === "Approved" ? "Approved" : r.examOfficeStatus;
      const isFullyApproved = newExamOfficeStatus === "Approved";
      return {
        ...r,
        hodStatus: "Approved" as const,
        hodComment: comment,
        status: isFullyApproved ? ("Registered" as const) : r.status,
        nptelStatus: isFullyApproved ? ("Approved" as const) : r.nptelStatus,
      };
    }
    return r;
  });
  saveExamRegistrations(updated);
}

export function rejectByHod(registrationId: string, comment?: string) {
  const current = getExamRegistrations();
  const updated = current.map((r) => {
    if (r.id === registrationId) {
      return {
        ...r,
        hodStatus: "Rejected" as const,
        hodComment: comment,
        status: "Rejected" as const,
        nptelStatus: "Rejected" as const,
        rejectionReason: comment || "Rejected by Head of Department.",
      };
    }
    return r;
  });
  saveExamRegistrations(updated);
}

// React Hook to subscribe to store changes
export function useExamStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener(STORE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORE_EVENT, handleUpdate);
  }, []);

  return {
    registeredCourseIds: getRegisteredCourseIds(),
    submittedSemesters: getSubmittedSemesters(),
    examRegistrations: getExamRegistrations(),
    isSemesterSubmitted: isSemesterCourseRegSubmitted,
  };
}
