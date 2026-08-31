import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Award, 
  Eye, 
  Lock,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Send,
  Save,
  Layers,
  BookOpen,
  Users,
  Check,
  UserCheck,
  ClipboardList,
  Info
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useRole } from "@/context/role-context";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  getStoredEvaluationBatches,
  saveStoredEvaluationBatches,
  addStoredAuditLog,
  EvaluationBatch,
  AnswerBooklet
} from "@/lib/mock-evaluation-store";
import { getFacultyAssignedSections, toggleStudentCourseRegistration } from "@/lib/mock-examcell-state";

export const Route = createFileRoute("/faculty/evaluation-and-marks")({
  head: () => ({
    meta: [{ title: "Evaluations & Marks — EduSuite Pro" }],
  }),
  component: FacultyEvaluationAndMarksPage,
});

interface InternalStudentMarks {
  roll_number: string;
  name: string;
  attendance: number;
  mid1: number;
  mid2: number;
  assignment: number;
  status: 'Draft' | 'Submitted';
  is_registered?: boolean;
}

interface FacultyAssignedSubject {
  id: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  studentCount: number;
  status: 'Draft' | 'In Progress' | 'Submitted to Exam Cell';
  students: InternalStudentMarks[];
}

const DEFAULT_FACULTY_SUBJECTS: FacultyAssignedSubject[] = [
  {
    id: "fs-1",
    subjectCode: "CS501",
    subjectName: "Data Structures & Algorithms",
    department: "CSE",
    year: 3,
    semester: 5,
    section: "A",
    studentCount: 24,
    status: "In Progress",
    students: [
      { roll_number: "22CS101", name: "K. Sai Teja", attendance: 95, mid1: 18, mid2: 17, assignment: 9, status: "Draft" },
      { roll_number: "22CS102", name: "J. Rahul", attendance: 88, mid1: 15, mid2: 16, assignment: 8, status: "Draft" },
      { roll_number: "22CS103", name: "M. Sneha", attendance: 92, mid1: 19, mid2: 18, assignment: 10, status: "Draft" },
      { roll_number: "22CS104", name: "A. Vikram", attendance: 84, mid1: 14, mid2: 15, assignment: 7, status: "Draft" }
    ]
  },
  {
    id: "fs-2",
    subjectCode: "CS502",
    subjectName: "Database Management Systems",
    department: "CSE",
    year: 3,
    semester: 5,
    section: "B",
    studentCount: 24,
    status: "Submitted to Exam Cell",
    students: [
      { roll_number: "22CS114", name: "A. Meghana", attendance: 96, mid1: 19, mid2: 20, assignment: 10, status: "Submitted" },
      { roll_number: "22CS115", name: "P. Karthik", attendance: 90, mid1: 17, mid2: 18, assignment: 9, status: "Submitted" },
      { roll_number: "22CS116", name: "R. Ananya", attendance: 94, mid1: 18, mid2: 19, assignment: 9, status: "Submitted" }
    ]
  },
  {
    id: "fs-3",
    subjectCode: "AI301",
    subjectName: "Introduction to Neural Networks",
    department: "AIML",
    year: 2,
    semester: 3,
    section: "A",
    studentCount: 24,
    status: "Draft",
    students: [
      { roll_number: "AIML26001", name: "Alapati Charan", attendance: 100, mid1: 16, mid2: 0, assignment: 8, status: "Draft" },
      { roll_number: "AIML26002", name: "Meka Krishna", attendance: 100, mid1: 17, mid2: 0, assignment: 9, status: "Draft" },
      { roll_number: "AIML26003", name: "Boddu Varun", attendance: 90, mid1: 15, mid2: 0, assignment: 8, status: "Draft" }
    ]
  },
  {
    id: "fs-4",
    subjectCode: "26DS301",
    subjectName: "Java Programming",
    department: "AIDS",
    year: 1,
    semester: 1,
    section: "A",
    studentCount: 24,
    status: "Draft",
    students: [
      { roll_number: "26DS101", name: "S. Niharika", attendance: 91, mid1: 14, mid2: 16, assignment: 8, status: "Draft" },
      { roll_number: "26DS102", name: "T. Harsha", attendance: 87, mid1: 13, mid2: 15, assignment: 7, status: "Draft" }
    ]
  }
];

function FacultyEvaluationAndMarksPage() {
  const { profile } = useRole();
  const [activeMainTab, setActiveMainTab] = useState<'evaluations' | 'mid_marks'>('evaluations');

  // TAB 1: Answer Booklet Evaluation State
  const [allBatches, setAllBatches] = useState<EvaluationBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  const [evalWorkspaceOpen, setEvalWorkspaceOpen] = useState(false);
  const [activeBooklet, setActiveBooklet] = useState<AnswerBooklet | null>(null);
  const [evalPage, setEvalPage] = useState(1);

  const [totalMarksInput, setTotalMarksInput] = useState<string>("78");
  const [remarksInput, setRemarksInput] = useState("");

  const [updateAuditOpen, setUpdateAuditOpen] = useState(false);
  const [auditReason, setAuditReason] = useState("");
  const [updatingBooklet, setUpdatingBooklet] = useState<AnswerBooklet | null>(null);

  // TAB 2: Internal Marks Entry State
  const [facultySubjects, setFacultySubjects] = useState<FacultyAssignedSubject[]>([]);
  const [marksRosterModalOpen, setMarksRosterModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<FacultyAssignedSubject | null>(null);
  const [editingStudents, setEditingStudents] = useState<InternalStudentMarks[]>([]);

  const loadData = () => {
    const batches = getStoredEvaluationBatches();
    setAllBatches(batches);
    if (!selectedBatchId && batches.length > 0) {
      setSelectedBatchId(batches[0].id);
    }

    const assigned = getFacultyAssignedSections(profile.name || profile.personaName || "Amit Rathore");
    setFacultySubjects(assigned as any);
  };

  useEffect(() => {
    loadData();
  }, [activeMainTab]);

  // Filter assigned batches visible to faculty
  const facultyBatches = useMemo(() => {
    return allBatches.filter(b => 
      ['APPROVED', 'ASSIGNED_TO_FACULTY', 'IN_PROGRESS', 'FACULTY_COMPLETED', 'SUBMITTED_TO_EXAMCELL', 'COMPLETED'].includes(b.status)
    );
  }, [allBatches]);

  const selectedBatch = useMemo(() => {
    return facultyBatches.find(b => b.id === selectedBatchId) || facultyBatches[0] || null;
  }, [facultyBatches, selectedBatchId]);

  const currentBooklets = useMemo(() => {
    return selectedBatch ? selectedBatch.booklets : [];
  }, [selectedBatch]);

  // Aggregate KPIs for Tab 1
  const totalAssigned = useMemo(() => facultyBatches.reduce((acc, b) => acc + b.booklets.length, 0), [facultyBatches]);
  const totalCompleted = useMemo(() => {
    return facultyBatches.reduce((acc, b) => acc + b.booklets.filter(bk => bk.evaluationStatus === "Completed").length, 0);
  }, [facultyBatches]);
  const totalPending = totalAssigned - totalCompleted;
  const overallCompletionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  const handleOpenEvaluationModal = (bkt: AnswerBooklet) => {
    setActiveBooklet(bkt);
    setEvalPage(1);
    setTotalMarksInput(bkt.marksObtained !== null ? String(bkt.marksObtained) : "75");
    setRemarksInput(bkt.remarks || "");
    setEvalWorkspaceOpen(true);
  };

  const handleSaveEvaluation = async (evalStatus: 'In Progress' | 'Completed') => {
    if (!activeBooklet || !selectedBatch) return;

    const score = Math.min(100, Math.max(0, Number(totalMarksInput) || 0));

    try {
      try {
        await api.post(`/api/exams/faculty/booklets/${activeBooklet.id}/evaluate`, {
          marksObtained: score,
          remarks: remarksInput,
          status: evalStatus
        });
      } catch (e) {}

      const updatedBatches = allBatches.map(b => {
        if (b.id === selectedBatch.id) {
          const updatedBooklets = b.booklets.map(bk => 
            bk.id === activeBooklet.id
              ? {
                  ...bk,
                  marksObtained: score,
                  remarks: remarksInput,
                  evaluationStatus: evalStatus,
                  evaluatedBy: "Faculty Evaluator",
                  evaluatedAt: new Date().toISOString()
                }
              : bk
          );
          const comp = updatedBooklets.filter(bk => bk.evaluationStatus === 'Completed').length;
          const nextStatus = comp === updatedBooklets.length ? 'FACULTY_COMPLETED' as const : 'IN_PROGRESS' as const;
          return {
            ...b,
            status: nextStatus,
            booklets: updatedBooklets
          };
        }
        return b;
      });

      saveStoredEvaluationBatches(updatedBatches);
      setAllBatches(updatedBatches);

      addStoredAuditLog({
        bookletId: activeBooklet.id,
        action: "EVALUATED",
        performedBy: "Faculty Evaluator",
        role: "Faculty Evaluator",
        newValue: `Evaluated booklet score: ${score} / 100`
      });

      toast.success(evalStatus === 'Completed' ? "Booklet evaluation completed & saved!" : "Evaluation draft saved.");
      setEvalWorkspaceOpen(false);
    } catch (err: any) {
      toast.error("Failed to save evaluation.");
    }
  };

  const handleExecuteMarksUpdateWithAudit = async () => {
    if (!updatingBooklet || !selectedBatch) return;
    if (!auditReason.trim()) {
      toast.error("Please provide a valid reason for updating evaluation marks.");
      return;
    }

    const newScore = Math.min(100, Math.max(0, Number(totalMarksInput) || 0));

    try {
      try {
        await api.patch(`/api/exams/faculty/booklets/${updatingBooklet.id}/update-marks`, {
          marksObtained: newScore,
          remarks: remarksInput,
          updateReason: auditReason
        });
      } catch (e) {}

      const updatedBatches = allBatches.map(b => {
        if (b.id === selectedBatch.id) {
          const updatedBooklets = b.booklets.map(bk => 
            bk.id === updatingBooklet.id
              ? {
                  ...bk,
                  marksObtained: newScore,
                  remarks: remarksInput,
                  evaluatedAt: new Date().toISOString()
                }
              : bk
          );
          return { ...b, booklets: updatedBooklets };
        }
        return b;
      });

      saveStoredEvaluationBatches(updatedBatches);
      setAllBatches(updatedBatches);

      addStoredAuditLog({
        bookletId: updatingBooklet.id,
        action: "MARKS_UPDATED",
        performedBy: "Faculty Evaluator",
        role: "Faculty Evaluator",
        previousValue: String(updatingBooklet.marksObtained || 0),
        newValue: String(newScore),
        reason: auditReason
      });

      toast.success("Marks updated successfully with recorded audit trail!");
      setUpdateAuditOpen(false);
      setEvalWorkspaceOpen(false);
      setAuditReason("");
    } catch (err: any) {
      toast.error("Failed to update marks.");
    }
  };

  const handleSubmitBatchToExamCell = async () => {
    if (!selectedBatch) return;
    const completedCount = selectedBatch.booklets.filter(bk => bk.evaluationStatus === 'Completed').length;
    if (completedCount < selectedBatch.booklets.length) {
      toast.error(`Cannot submit batch. ${selectedBatch.booklets.length - completedCount} booklet(s) are still pending evaluation.`);
      return;
    }

    try {
      try {
        await api.post(`/api/exams/faculty/evaluation-assignments/${selectedBatch.id}/submit-batch`);
      } catch (e) {}

      const updatedBatches = allBatches.map(b => 
        b.id === selectedBatch.id ? { ...b, status: 'SUBMITTED_TO_EXAMCELL' as const, submittedToExamcellAt: new Date().toISOString() } : b
      );

      saveStoredEvaluationBatches(updatedBatches);
      setAllBatches(updatedBatches);

      toast.success("Completed evaluation batch submitted to Exam Cell Controller successfully!");
    } catch (err: any) {
      toast.error("Failed to submit batch.");
    }
  };

  // TAB 2: Handlers for Internal Marks Entry
  const handleOpenMarksRoster = (subj: FacultyAssignedSubject) => {
    const latestAssigned = getFacultyAssignedSections();
    const freshSubj = latestAssigned.find(s => s.id === subj.id) || subj;

    setSelectedSubject(freshSubj as any);
    setEditingStudents(JSON.parse(JSON.stringify(freshSubj.students)));
    setMarksRosterModalOpen(true);
  };

  const handleStudentMarkChange = (index: number, field: 'mid1' | 'mid2' | 'assignment', val: number) => {
    setEditingStudents(prev => prev.map((s, idx) => {
      if (idx === index) {
        return {
          ...s,
          [field]: Math.min(field === 'assignment' ? 10 : 20, Math.max(0, val || 0))
        };
      }
      return s;
    }));
  };

  const handleToggleStudentReg = (rollNumber: string) => {
    if (!selectedSubject) return;
    const isNowReg = toggleStudentCourseRegistration(rollNumber, selectedSubject.subjectCode);

    setEditingStudents(prev => prev.map(s => {
      if (s.roll_number === rollNumber) {
        return {
          ...s,
          is_registered: isNowReg,
          mid1: isNowReg ? 14 : 0,
          mid2: isNowReg ? 15 : 0,
          assignment: isNowReg ? 7 : 0
        };
      }
      return s;
    }));

    toast.info(
      isNowReg
        ? `Student ${rollNumber} completed Course Registration! Marks inputs unlocked.`
        : `Student ${rollNumber} course registration removed. Marks inputs locked.`
    );
  };

  const handleSaveInternalMarks = (submitToExamcell = false) => {
    if (!selectedSubject) return;

    const nextStatus = submitToExamcell ? "Submitted to Exam Cell" as const : "In Progress" as const;
    const updatedStudents = editingStudents.map(s => ({
      ...s,
      status: submitToExamcell ? "Submitted" as const : "Draft" as const
    }));

    const updatedSubjects = facultySubjects.map(sub => 
      sub.id === selectedSubject.id
        ? { ...sub, status: nextStatus, students: updatedStudents }
        : sub
    );

    setFacultySubjects(updatedSubjects);
    localStorage.setItem("faculty_assigned_mid_marks_v1", JSON.stringify(updatedSubjects));

    toast.success(
      submitToExamcell
        ? `Internal Marks for ${selectedSubject.subjectCode} (${selectedSubject.department} Sec ${selectedSubject.section}) submitted to Exam Cell!`
        : `Internal Marks draft saved for ${selectedSubject.subjectCode}!`
    );
    setMarksRosterModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardList className="size-6 text-indigo-600" />
            Faculty Evaluations & Internal Marks Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Evaluate anonymized answer booklets and enter mid-term / internal marks for assigned teaching subjects.
          </p>
        </div>

        <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200 px-3 py-1 self-start md:self-auto">
          Academic Year 2024-25
        </Badge>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setActiveMainTab('evaluations')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
            activeMainTab === 'evaluations'
              ? 'border-indigo-600 text-indigo-700 font-extrabold bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="size-4" />
          Answer Booklet Evaluation (Blind Console)
          <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
            {facultyBatches.length} Batches
          </Badge>
        </button>

        <button
          onClick={() => setActiveMainTab('mid_marks')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
            activeMainTab === 'mid_marks'
              ? 'border-indigo-600 text-indigo-700 font-extrabold bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="size-4 text-indigo-600" />
          Mid-Term & Internal Marks Entry
          <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
            {facultySubjects.length} Teaching Subjects
          </Badge>
        </button>
      </div>

      {/* TAB 1: ANSWER BOOKLET EVALUATION CONSOLE */}
      {activeMainTab === 'evaluations' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="TOTAL ASSIGNED COPIES"
              value={String(totalAssigned)}
              delta="Allocated"
              icon={FileText}
              tone="primary"
            />
            <KpiCard
              label="PENDING EVALUATION"
              value={String(totalPending)}
              delta="Action Needed"
              trend={totalPending > 0 ? "down" : "up"}
              icon={Clock}
              tone="warning"
            />
            <KpiCard
              label="CORRECTED & COMPLETED"
              value={String(totalCompleted)}
              delta="Evaluated"
              icon={CheckCircle2}
              tone="success"
            />
            <KpiCard
              label="VALUATION COMPLETION RATE"
              value={`${overallCompletionRate}%`}
              delta="Progress"
              icon={Award}
              tone="purple"
            />
          </div>

          {/* Main Workspace split */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Assigned Batches */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="size-4 text-indigo-600" />
                Assigned Valuation Batches ({facultyBatches.length})
              </h3>

              {facultyBatches.length === 0 ? (
                <Card className="p-6 text-center text-xs text-slate-500 font-semibold">
                  No evaluation batches currently assigned.
                </Card>
              ) : (
                facultyBatches.map(b => {
                  const comp = b.booklets.filter(bk => bk.evaluationStatus === 'Completed').length;
                  const total = b.booklets.length;
                  const percent = total > 0 ? Math.round((comp / total) * 100) : 0;
                  return (
                    <Card
                      key={b.id}
                      onClick={() => setSelectedBatchId(b.id)}
                      className={`p-5 rounded-2xl cursor-pointer transition border ${
                        selectedBatch?.id === b.id
                          ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
                          {b.branch}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {comp} / {total} Done
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{b.subjectCode} - {b.subjectName}</h4>

                      {/* Progress bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Valuation Progress</span>
                          <span className="text-indigo-700">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Right Column: Anonymized Booklet Console */}
            <div className="lg:col-span-2 space-y-4">
              {selectedBatch ? (
                <Card className="p-6 border border-slate-200 bg-white rounded-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-slate-700 font-bold">
                          Batch: {selectedBatch.id}
                        </Badge>
                        {selectedBatch.status === 'SUBMITTED_TO_EXAMCELL' && (
                          <Badge className="bg-emerald-50 text-emerald-800 font-bold border-emerald-200">
                            ✓ SUBMITTED TO EXAM CELL
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {selectedBatch.subjectCode} — {selectedBatch.subjectName} ({selectedBatch.branch})
                      </h3>
                    </div>

                    <Button
                      disabled={
                        selectedBatch.booklets.some(bk => bk.evaluationStatus !== 'Completed') ||
                        selectedBatch.status === 'SUBMITTED_TO_EXAMCELL'
                      }
                      onClick={handleSubmitBatchToExamCell}
                      className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider gap-2 shadow-xs disabled:opacity-50"
                    >
                      <Send className="size-4" /> SUBMIT COMPLETED EVALUATION TO EXAM CELL
                    </Button>
                  </div>

                  {/* Booklets Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">Anonymized Evaluation Code</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Marks Obtained</th>
                          <th className="px-4 py-3 text-right">Evaluation Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {currentBooklets.map(bkt => {
                          const isDone = bkt.evaluationStatus === 'Completed';
                          return (
                            <tr
                              key={bkt.id}
                              className={`transition ${isDone ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'bg-white hover:bg-slate-50'}`}
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <Lock className="size-3.5 text-slate-400" />
                                  <span className="font-mono font-extrabold text-indigo-700 text-sm">
                                    {bkt.evaluationCode}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">Student details securely masked</span>
                              </td>

                              <td className="px-4 py-3.5 text-center">
                                <Badge className={isDone ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold" : "bg-amber-50 text-amber-800 border-amber-200 font-bold"}>
                                  {isDone ? "✓ COMPLETED" : bkt.evaluationStatus}
                                </Badge>
                              </td>

                              <td className="px-4 py-3.5 text-center font-mono font-extrabold text-sm text-slate-900">
                                {bkt.marksObtained !== null ? `${bkt.marksObtained} / 100` : "--"}
                              </td>

                              <td className="px-4 py-3.5 text-right">
                                {isDone ? (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleOpenEvaluationModal(bkt)}
                                      className="h-8 text-xs font-bold border-emerald-200 text-emerald-800 hover:bg-emerald-100 rounded-lg gap-1"
                                    >
                                      <Eye className="size-3.5" /> Preview Marks
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setUpdatingBooklet(bkt);
                                        setTotalMarksInput(String(bkt.marksObtained || 75));
                                        setRemarksInput(bkt.remarks || "");
                                        setUpdateAuditOpen(true);
                                      }}
                                      className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg gap-1"
                                    >
                                      <Edit3 className="size-3.5" /> Update (Audited)
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => handleOpenEvaluationModal(bkt)}
                                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg px-4 gap-1"
                                  >
                                    <FileText className="size-3.5" /> Evaluate Booklet
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center text-slate-500">
                  Select an assignment batch to view booklets.
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MID-TERM & INTERNAL MARKS ENTRY CONSOLE */}
      {activeMainTab === 'mid_marks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="size-4 text-indigo-600" />
                Teaching Subjects Assigned by Exam Cell
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select your assigned subject section card to enter or update Mid-1, Mid-2, and Assignment internal marks.
              </p>
            </div>
          </div>

          {/* Cards of Teaching Subjects Assigned to Faculty */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {facultySubjects.map(subj => (
              <Card key={subj.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-indigo-50 text-indigo-700 font-extrabold border-indigo-200">
                      {subj.department} — Sec {subj.section}
                    </Badge>
                    <Badge className={
                      subj.status === "Submitted to Exam Cell" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold" 
                        : "bg-slate-100 text-slate-700 font-bold"
                    }>
                      {subj.status}
                    </Badge>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">
                    {subj.subjectCode} — {subj.subjectName}
                  </h4>

                  <div className="text-xs text-slate-600 font-semibold space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Cohort:</span>
                      <strong className="text-slate-800">Year {subj.year} (Sem {subj.semester})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Enrolled Students:</span>
                      <strong className="text-indigo-700 font-mono">{subj.studentCount} Students</strong>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenMarksRoster(subj)}
                  className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs"
                >
                  <Edit3 className="size-4" /> Enter / Edit Internal Marks
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SPLIT-SCREEN EVALUATION WORKSPACE MODAL */}
      <Dialog open={evalWorkspaceOpen} onOpenChange={setEvalWorkspaceOpen}>
        <DialogContent className="max-w-6xl max-h-[92vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="size-5 text-indigo-600" />
                Blind Evaluation Console — {activeBooklet?.evaluationCode}
              </span>
              <Badge className="bg-emerald-50 text-emerald-700 font-mono">
                {activeBooklet?.evaluationStatus === 'Completed' ? '✓ EVALUATION COMPLETED' : 'EVALUATION IN PROGRESS'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Split-Screen Console: Scanned PDF Booklet Viewer (Left) | Evaluation Marks Entry & Remarks (Right)
            </DialogDescription>
          </DialogHeader>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4 flex-1 overflow-hidden min-h-[500px]">
            {/* Left Split: Interactive PDF Viewer */}
            <div className="bg-slate-900 rounded-xl p-4 flex flex-col justify-between overflow-y-auto text-white">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="font-mono text-xs font-bold text-slate-300">SCANNED ANSWER SHEET PDF</span>
                <span className="font-mono text-xs font-bold text-indigo-400">PAGE {evalPage} OF 12</span>
              </div>

              <div className="my-4 bg-white text-slate-900 rounded-lg p-6 min-h-[420px] shadow-xl border-4 border-slate-300 space-y-4 font-mono text-xs overflow-y-auto">
                <div className="border-b pb-2 flex justify-between font-bold text-[11px] text-slate-500">
                  <span>ANONYMIZED EVALUATION CODE: {activeBooklet?.evaluationCode}</span>
                  <span>MID-TERM / END-TERM</span>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="font-extrabold text-indigo-900">
                    Q1. (a) Define Time Complexity and analyze QuickSort algorithm average case.
                  </p>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed text-[11px]">
                    Answer: Time complexity quantifies the amount of time taken by an algorithm to run as a function of the length of the input.
                    QuickSort divide-and-conquer strategy recurrence relation: T(N) = 2 T(N/2) + O(N).
                    Using Master Theorem, Case 2 applies, yielding T(N) = O(N log N) in average case.
                  </p>

                  <div className="h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-[11px]">
                    [Scanned Diagram: Binary Tree Recursion Tree Representation]
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-700 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={evalPage <= 1}
                  onClick={() => setEvalPage(p => Math.max(1, p - 1))}
                  className="h-8 text-xs text-slate-900"
                >
                  <ChevronLeft className="size-4 mr-1" /> Prev Page
                </Button>
                <span className="text-xs font-mono font-bold">Page {evalPage} / 12</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={evalPage >= 12}
                  onClick={() => setEvalPage(p => Math.min(12, p + 1))}
                  className="h-8 text-xs text-slate-900"
                >
                  Next Page <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Right Split: Marks & Remarks Input Panel */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between overflow-y-auto space-y-4">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Award className="size-4 text-indigo-600" />
                  Marks Evaluation Entry
                </h4>

                <div className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Total Marks Obtained (out of 100) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={totalMarksInput}
                      onChange={e => setTotalMarksInput(e.target.value)}
                      className="h-11 rounded-xl text-lg font-mono font-extrabold text-indigo-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Evaluator Feedback & Remarks
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Enter detailed evaluation feedback, key strengths, or deductions..."
                      value={remarksInput}
                      onChange={e => setRemarksInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1 text-[11px] text-indigo-900">
                    <span className="font-bold">Evaluation Audit Log Notice:</span>
                    <p className="text-indigo-700">
                      All marks entries are securely saved with timestamp and evaluator ID for academic compliance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleSaveEvaluation('In Progress')}
                  className="flex-1 h-10 rounded-xl text-xs font-bold border-slate-300"
                >
                  <Save className="size-4 mr-1.5" /> Save Draft
                </Button>
                <Button
                  onClick={() => handleSaveEvaluation('Completed')}
                  className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider"
                >
                  <CheckCircle2 className="size-4 mr-1.5" /> Submit Evaluation
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AUDIT MARKS UPDATE REASON MODAL */}
      <Dialog open={updateAuditOpen} onOpenChange={setUpdateAuditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="size-5 text-indigo-600" />
              Update Marks (Audit Trail Required)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide an official reason for updating previously evaluated booklet score.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs font-semibold my-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Updated Score (out of 100)
              </label>
              <Input
                type="number"
                value={totalMarksInput}
                onChange={e => setTotalMarksInput(e.target.value)}
                className="h-10 text-base font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Audit Reason for Revision <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Re-evaluating Q3 sub-part (b) diagram calculation..."
                value={auditReason}
                onChange={e => setAuditReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setUpdateAuditOpen(false)}
              className="h-9 text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteMarksUpdateWithAudit}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              Confirm Update & Record Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INTERNAL MARKS ROSTER WORKSPACE MODAL */}
      <Dialog open={marksRosterModalOpen} onOpenChange={setMarksRosterModalOpen}>
        <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Award className="size-5 text-indigo-600" />
              Internal Marks Entry — {selectedSubject?.subjectCode}: {selectedSubject?.subjectName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Department: {selectedSubject?.department} | Year {selectedSubject?.year} (Sem {selectedSubject?.semester}) • Section {selectedSubject?.section}
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-3 rounded-xl text-xs font-semibold flex justify-between items-center">
              <span>Formula: Internal Total (30 Marks) = Max(Mid-1, Mid-2) [20 M] + Assignment [10 M]</span>
              <Badge className="bg-indigo-600 text-white font-mono">Max Marks: 30</Badge>
            </div>

            <div className="bg-slate-50 border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2">
              <Info className="size-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Section Roster Notice ({editingStudents.length} Students):</strong> Faculty can enter internal marks only for students who have completed Course Registration. Mark fields are locked for unregistered students.
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs font-semibold text-left">
                <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-center">Course Status</th>
                    <th className="p-3 text-center">Attendance</th>
                    <th className="p-3 text-center">Mid-1 (Max 20)</th>
                    <th className="p-3 text-center">Mid-2 (Max 20)</th>
                    <th className="p-3 text-center">Assignment (Max 10)</th>
                    <th className="p-3 text-center">Calculated Internal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editingStudents.map((st, idx) => {
                    const isRegistered = st.is_registered !== false;
                    const bestMid = Math.max(st.mid1 || 0, st.mid2 || 0);
                    const totalInternal = isRegistered ? bestMid + (st.assignment || 0) : 0;

                    return (
                      <tr key={st.roll_number} className={`bg-white ${!isRegistered ? 'bg-slate-50/70' : 'hover:bg-slate-50'}`}>
                        <td className="p-3 font-mono font-bold text-indigo-700">{st.roll_number}</td>
                        <td className="p-3 font-bold text-slate-800">{st.name}</td>
                        <td className="p-3 text-center">
                          {isRegistered ? (
                            <div className="flex items-center justify-center gap-1">
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                                Registered
                              </Badge>
                              <button
                                onClick={() => handleToggleStudentReg(st.roll_number)}
                                title="Revoke registration for testing"
                                className="text-[10px] text-slate-400 hover:text-rose-600 font-extrabold px-1 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[10px]">
                                Not Registered
                              </Badge>
                              <button
                                onClick={() => handleToggleStudentReg(st.roll_number)}
                                title="Simulate student completing course registration"
                                className="text-[9px] font-extrabold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                              >
                                + Enroll
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isRegistered ? (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-mono font-bold">
                              {st.attendance}%
                            </Badge>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs font-semibold" title="Attendance tracking unavailable until course enrollment is completed">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            disabled={!isRegistered}
                            value={isRegistered ? st.mid1 : 0}
                            onChange={e => handleStudentMarkChange(idx, 'mid1', Number(e.target.value))}
                            title={!isRegistered ? "Course registration pending by student" : "Mid-1 Marks"}
                            className={`h-8 w-20 text-center font-mono font-bold rounded-lg mx-auto ${
                              !isRegistered ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
                            }`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            disabled={!isRegistered}
                            value={isRegistered ? st.mid2 : 0}
                            onChange={e => handleStudentMarkChange(idx, 'mid2', Number(e.target.value))}
                            title={!isRegistered ? "Course registration pending by student" : "Mid-2 Marks"}
                            className={`h-8 w-20 text-center font-mono font-bold rounded-lg mx-auto ${
                              !isRegistered ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
                            }`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            disabled={!isRegistered}
                            value={isRegistered ? st.assignment : 0}
                            onChange={e => handleStudentMarkChange(idx, 'assignment', Number(e.target.value))}
                            title={!isRegistered ? "Course registration pending by student" : "Assignment Marks"}
                            className={`h-8 w-20 text-center font-mono font-bold rounded-lg mx-auto ${
                              !isRegistered ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
                            }`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          {isRegistered ? (
                            <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 text-sm">
                              {totalInternal} / 30
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                              Locked
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => handleSaveInternalMarks(false)}
              className="h-9 text-xs font-bold rounded-xl gap-1.5"
            >
              <Save className="size-4" /> Save Internal Marks Draft
            </Button>
            <Button
              onClick={() => handleSaveInternalMarks(true)}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl gap-1.5"
            >
              <Send className="size-4" /> Submit Internal Marks to Exam Cell
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
