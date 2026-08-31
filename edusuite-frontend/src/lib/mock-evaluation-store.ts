// Unified Evaluation Pipeline State Store & Backend Synchronization
export interface AnswerBooklet {
  id: string;
  assignmentBatchId: string;
  studentRollNumber: string;
  studentName?: string;
  pdfUrl: string;
  fileName: string;
  pageCount: number;
  evaluationCode: string; // BLIND-2026-XXXXX
  evaluationStatus: 'Pending' | 'In Progress' | 'Completed';
  marksObtained: number | null;
  maxMarks: number;
  remarks: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

export interface EvaluationBatch {
  id: string;
  examScheduleId: string;
  examScheduleName: string;
  branch: string;
  subjectCode: string;
  subjectName: string;
  facultyDepartment: string;
  facultyId: string;
  facultyName: string;
  requestedBookletCount: number;
  actualBookletCount: number;
  status: 'DRAFT' | 'PENDING_EXAMCELL_APPROVAL' | 'APPROVED' | 'ASSIGNED_TO_FACULTY' | 'IN_PROGRESS' | 'FACULTY_COMPLETED' | 'SUBMITTED_TO_EXAMCELL' | 'COMPLETED' | 'REJECTED';
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedToExamcellAt?: string;
  booklets: AnswerBooklet[];
}

export interface EvaluationAuditLog {
  id: string;
  bookletId: string;
  action: string;
  performedBy: string;
  role: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

const STORAGE_KEY_BATCHES = "edusuite_evaluation_batches_v4";
const STORAGE_KEY_AUDITS = "edusuite_evaluation_audits_v4";

const INITIAL_BATCHES: EvaluationBatch[] = [
  {
    id: "EVAL-BATCH-SEED-1",
    examScheduleId: "sch-1",
    examScheduleName: "B.Tech CSE Sem 5 End Exams 2026",
    branch: "CSE",
    subjectCode: "CS501",
    subjectName: "Data Structures & Algorithms",
    facultyDepartment: "CSE",
    facultyId: "f1",
    facultyName: "Dr. P. V. Ramana",
    requestedBookletCount: 3,
    actualBookletCount: 3,
    status: "ASSIGNED_TO_FACULTY",
    createdBy: "Exam Assistant",
    createdAt: "2026-08-20T10:00:00.000Z",
    booklets: [
      {
        id: "bkt-seed-1",
        assignmentBatchId: "EVAL-BATCH-SEED-1",
        studentRollNumber: "22CS101",
        studentName: "Ramesh Kumar",
        pdfUrl: "/sample-answer-sheet.pdf",
        fileName: "Answer_Sheet_22CS101.pdf",
        pageCount: 12,
        evaluationCode: "BLIND-2026-848113",
        evaluationStatus: "Completed",
        marksObtained: 78,
        maxMarks: 100,
        remarks: "Excellent diagrams for Binary Search Trees and Big-O proof.",
        evaluatedBy: "Dr. P. V. Ramana",
        evaluatedAt: "2026-08-21T14:30:00.000Z"
      },
      {
        id: "bkt-seed-2",
        assignmentBatchId: "EVAL-BATCH-SEED-1",
        studentRollNumber: "22CS102",
        studentName: "Priya Sharma",
        pdfUrl: "/sample-answer-sheet.pdf",
        fileName: "Answer_Sheet_22CS102.pdf",
        pageCount: 12,
        evaluationCode: "BLIND-2026-378474",
        evaluationStatus: "Completed",
        marksObtained: 65,
        maxMarks: 100,
        remarks: "Good attempt, minor syntax error in Graph Traversal logic.",
        evaluatedBy: "Dr. P. V. Ramana",
        evaluatedAt: "2026-08-21T15:10:00.000Z"
      },
      {
        id: "bkt-seed-3",
        assignmentBatchId: "EVAL-BATCH-SEED-1",
        studentRollNumber: "22CS103",
        studentName: "Anil Reddy",
        pdfUrl: "/sample-answer-sheet.pdf",
        fileName: "Answer_Sheet_22CS103.pdf",
        pageCount: 12,
        evaluationCode: "BLIND-2026-921054",
        evaluationStatus: "Pending",
        marksObtained: null,
        maxMarks: 100,
        remarks: ""
      }
    ]
  }
];

export function getStoredEvaluationBatches(): EvaluationBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BATCHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(INITIAL_BATCHES));
      return INITIAL_BATCHES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_BATCHES;
  }
}

export function saveStoredEvaluationBatches(batches: EvaluationBatch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
  } catch (e) {
    console.error("Failed to save evaluation batches", e);
  }
}

export function getStoredAuditLogs(): EvaluationAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDITS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addStoredAuditLog(log: Omit<EvaluationAuditLog, 'id' | 'timestamp'>): void {
  try {
    const logs = getStoredAuditLogs();
    const newLog: EvaluationAuditLog = {
      ...log,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_AUDITS, JSON.stringify([newLog, ...logs]));
  } catch (e) {}
}
