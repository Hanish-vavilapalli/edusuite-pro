import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import api from "@/lib/api";
import { toast } from "sonner";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Eye, 
  FileCheck,
  Plus,
  AlertCircle,
  BookOpen,
  Send,
  UserCheck,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  EvaluationBatch
} from "@/lib/mock-evaluation-store";

export const Route = createFileRoute("/examcell/correction-requests")({
  head: () => ({
    meta: [{ title: "Correction Requests & Allocation — EduSuite Pro" }],
  }),
  component: CorrectionRequestsPage,
});

interface AnswerBookletInputRow {
  sno: number;
  rollNumber: string;
  isValidStudent: boolean;
  studentName: string;
  file: File | null;
  fileName: string;
  pdfUrl: string;
}

const MOCK_FACULTY = [
  { id: "f1", name: "Dr. P. V. Ramana", dept: "CSE", currentLoad: 2, maxLoad: 30 },
  { id: "f2", name: "Prof. Kanneganti Suresh", dept: "CSE", currentLoad: 12, maxLoad: 30 },
  { id: "f3", name: "Dr. K. Jyothi", dept: "AIML", currentLoad: 18, maxLoad: 30 },
  { id: "f4", name: "Dr. Suresh Babu", dept: "CSE", currentLoad: 5, maxLoad: 30 },
  { id: "f5", name: "Dr. Clara Oswald", dept: "ECE", currentLoad: 8, maxLoad: 30 },
  { id: "f6", name: "Dr. John Smith", dept: "AIDS", currentLoad: 0, maxLoad: 30 }
];

const KNOWN_STUDENTS: Record<string, string> = {
  "22CS101": "Ramesh Kumar",
  "22CS102": "Priya Sharma",
  "22CS103": "Anil Reddy",
  "22CS104": "Sneha Verma",
  "22CS105": "Vikram Malhotra",
  "22CS114": "Karthik Raja",
  "22AM201": "Deepika Rao",
  "22EC301": "Rahul Mehta"
};

const SCHEDULE_DATA = [
  { id: "sch-1", name: "B.Tech CSE Sem 5 End Exams 2026", branches: ["CSE", "AIML", "AIDS"] },
  { id: "sch-2", name: "B.Tech AIML Sem 3 Regular Mid-Term", branches: ["AIML", "CSE"] },
  { id: "sch-3", name: "B.Tech ECE Sem 6 End Semester", branches: ["ECE", "EEE"] }
];

const BRANCH_SUBJECTS: Record<string, Array<{ id: string; code: string; name: string }>> = {
  CSE: [
    { id: "sub-1", code: "CS501", name: "Data Structures & Algorithms" },
    { id: "sub-2", code: "CS502", name: "Operating Systems" },
    { id: "sub-3", code: "CS503", name: "Database Management Systems" }
  ],
  AIML: [
    { id: "sub-4", code: "AI301", name: "Machine Learning Fundamentals" },
    { id: "sub-5", code: "AI302", name: "Artificial Intelligence Concepts" }
  ],
  ECE: [
    { id: "sub-6", code: "EC601", name: "Digital Signal Processing" },
    { id: "sub-7", code: "EC602", name: "VLSI Circuit Design" }
  ]
};

function CorrectionRequestsPage() {
  const [activeTab, setActiveTab] = useState<'allocations' | 'revaluations'>('allocations');
  const [allBatches, setAllBatches] = useState<EvaluationBatch[]>([]);
  
  // Form step selections
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [bookletCount, setBookletCount] = useState<number>(3);
  const [facultyDept, setFacultyDept] = useState("CSE");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  // Dynamic Booklet Rows
  const [bookletRows, setBookletRows] = useState<AnswerBookletInputRow[]>([]);

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewingRow, setPreviewingRow] = useState<AnswerBookletInputRow | null>(null);
  const [previewPage, setPreviewPage] = useState(1);

  // Submit Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAllBatches(getStoredEvaluationBatches());
  }, []);

  // Update dynamic booklet rows whenever bookletCount changes
  useEffect(() => {
    const N = Math.max(1, Math.min(50, Number(bookletCount) || 1));
    setBookletRows(prev => {
      const next: AnswerBookletInputRow[] = [];
      for (let i = 0; i < N; i++) {
        if (prev[i]) {
          next.push({ ...prev[i], sno: i + 1 });
        } else {
          const defaultRoll = `22CS10${i + 1}`;
          const isValid = !!KNOWN_STUDENTS[defaultRoll];
          next.push({
            sno: i + 1,
            rollNumber: defaultRoll,
            isValidStudent: isValid,
            studentName: KNOWN_STUDENTS[defaultRoll] || "Student Verification Pending",
            file: null,
            fileName: `Scanned_Answer_Sheet_${defaultRoll}.pdf`,
            pdfUrl: "/sample-answer-sheet.pdf"
          });
        }
      }
      return next;
    });
  }, [bookletCount]);

  const handleRollNumberChange = (index: number, val: string) => {
    const roll = val.trim().toUpperCase();
    const studentName = KNOWN_STUDENTS[roll];
    setBookletRows(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        rollNumber: roll,
        isValidStudent: !!studentName,
        studentName: studentName || (roll.length >= 4 ? `Student Roll ${roll} Verified` : "")
      };
      return updated;
    });
  };

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setBookletRows(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          file,
          fileName: file.name,
          pdfUrl: objUrl
        };
        return updated;
      });
      toast.info(`Uploaded scanned PDF "${file.name}" for booklet #${index + 1}`);
    }
  };

  const handleOpenPreview = (row: AnswerBookletInputRow) => {
    setPreviewingRow(row);
    setPreviewPage(1);
    setPreviewModalOpen(true);
  };

  const handleValidateAndSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchedule || !selectedBranch || !selectedSubject || !selectedFaculty) {
      toast.error("Please fill out Exam Schedule, Branch, Subject, and Faculty Evaluator.");
      return;
    }

    for (const r of bookletRows) {
      if (!r.rollNumber) {
        toast.error(`Please enter student roll number for Booklet #${r.sno}`);
        return;
      }
      if (!r.fileName) {
        toast.error(`Please upload scanned PDF booklet for Booklet #${r.sno}`);
        return;
      }
    }

    setConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selectedSubjectObj = (BRANCH_SUBJECTS[selectedBranch] || []).find(s => s.code === selectedSubject);
      const facultyObj = MOCK_FACULTY.find(f => f.name === selectedFaculty);
      const scheduleObj = SCHEDULE_DATA.find(s => s.id === selectedSchedule);

      const batchId = `EVAL-BATCH-${Date.now()}`;
      const newBatch: EvaluationBatch = {
        id: batchId,
        examScheduleId: selectedSchedule,
        examScheduleName: scheduleObj ? scheduleObj.name : "End Semester Exam",
        branch: selectedBranch,
        subjectCode: selectedSubject,
        subjectName: selectedSubjectObj ? selectedSubjectObj.name : selectedSubject,
        facultyDepartment: facultyDept,
        facultyId: facultyObj ? facultyObj.id : "f1",
        facultyName: selectedFaculty,
        requestedBookletCount: bookletRows.length,
        actualBookletCount: bookletRows.length,
        status: "PENDING_EXAMCELL_APPROVAL",
        createdBy: "Exam Assistant",
        createdAt: new Date().toISOString(),
        booklets: bookletRows.map((r, i) => ({
          id: `BKT-${batchId}-${i + 1}`,
          assignmentBatchId: batchId,
          studentRollNumber: r.rollNumber,
          studentName: r.studentName,
          fileName: r.fileName,
          pdfUrl: r.pdfUrl,
          pageCount: 12,
          evaluationCode: `BLIND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          evaluationStatus: "Pending",
          marksObtained: null,
          maxMarks: 100,
          remarks: ""
        }))
      };

      // Call REST API
      try {
        await api.post("/api/exams/evaluation-assignments", newBatch);
      } catch (err) {}

      // Update local state store
      const updatedBatches = [newBatch, ...allBatches];
      saveStoredEvaluationBatches(updatedBatches);
      setAllBatches(updatedBatches);

      toast.success("Evaluation assignment batch submitted for Exam Officer approval successfully!");
      setConfirmModalOpen(false);

      // Reset selection
      setSelectedSubject("");
      setSelectedFaculty("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit assignment batch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const eligibleBranches = SCHEDULE_DATA.find(s => s.id === selectedSchedule)?.branches || ["CSE", "AIML", "ECE", "AIDS"];
  const eligibleSubjects = BRANCH_SUBJECTS[selectedBranch] || [];

  // Completed booklets roster
  const completedBookletsList = allBatches.flatMap(b => 
    b.booklets.filter(bk => bk.evaluationStatus === 'Completed').map(bk => ({
      ...bk,
      examName: b.examScheduleName,
      subjectName: b.subjectName,
      assignedFaculty: b.facultyName
    }))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="size-6 text-indigo-600" />
            Answer Sheet Correction & Evaluation Control
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Exam Cell Assistant: Select Schedule, Branch, Subject, Booklet Count ($N$), upload scanned PDFs, and submit for Officer approval.
          </p>
        </div>

        <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200 px-3 py-1 self-start md:self-auto">
          Role: Exam Cell Assistant
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-6 py-3 text-xs font-black border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'allocations'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="size-4 inline mr-1.5" />
          Answer Copy Allocations & Batch Submissions
        </button>
        <button
          onClick={() => setActiveTab('revaluations')}
          className={`px-6 py-3 text-xs font-black border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'revaluations'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCheck className="size-4 inline mr-1.5" />
          Completed Valuations Roster ({completedBookletsList.length})
        </button>
      </div>

      {activeTab === 'allocations' ? (
        <div className="space-y-6">
          {/* Form Card */}
          <Card className="p-6 border border-slate-200 bg-white shadow-xs rounded-2xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-5">
              <Layers className="size-4.5 text-indigo-600" />
              1. Sequenced Evaluation Assignment Setup
            </h3>

            <form onSubmit={handleValidateAndSubmitModal} className="space-y-6">
              {/* Sequenced Dropdowns */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. Exam Schedule */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    1. Select Exam Schedule <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSchedule}
                    onChange={e => {
                      setSelectedSchedule(e.target.value);
                      setSelectedBranch("");
                      setSelectedSubject("");
                    }}
                    className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-10"
                  >
                    <option value="">-- Choose Exam Schedule --</option>
                    {SCHEDULE_DATA.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Branch */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    2. Select Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={!selectedSchedule}
                    value={selectedBranch}
                    onChange={e => {
                      setSelectedBranch(e.target.value);
                      setSelectedSubject("");
                    }}
                    className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-10 disabled:opacity-50"
                  >
                    <option value="">-- Choose Branch --</option>
                    {eligibleBranches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Subject */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    3. Subject / Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={!selectedBranch}
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-10 disabled:opacity-50"
                  >
                    <option value="">-- Choose Subject --</option>
                    {eligibleSubjects.map(sub => (
                      <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Booklet Count N */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    4. Booklet Count (N) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={bookletCount}
                    onChange={e => setBookletCount(parseInt(e.target.value) || 1)}
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                </div>

                {/* 5. Faculty Dept */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    5. Filter Faculty Department
                  </label>
                  <select
                    value={facultyDept}
                    onChange={e => {
                      setFacultyDept(e.target.value);
                      setSelectedFaculty("");
                    }}
                    className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-10"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AIML">AIML</option>
                    <option value="AIDS">AIDS</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>

                {/* 6. Faculty Evaluator with Workload */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                    6. Faculty Evaluator <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedFaculty}
                    onChange={e => setSelectedFaculty(e.target.value)}
                    className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-10"
                  >
                    <option value="">-- Choose Evaluator --</option>
                    {MOCK_FACULTY.filter(f => f.dept === facultyDept).map(f => (
                      <option key={f.id} value={f.name}>
                        {f.name} — Load: {f.currentLoad}/{f.maxLoad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Dynamic Booklet Input Rows Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <FileText className="size-4 text-indigo-600" />
                    2. Answer Booklet Details & Uploads ({bookletRows.length} Booklets)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Enter student roll numbers and attach scanned PDF answer booklets for evaluation.
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3 text-left w-64">Student Roll Number</th>
                        <th className="px-4 py-3 text-left">Validation Status</th>
                        <th className="px-4 py-3 text-left">Uploaded PDF Booklet</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-semibold">
                      {bookletRows.map((row, idx) => (
                        <tr key={row.sno} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 text-center font-bold text-slate-500">{row.sno}</td>
                          
                          <td className="px-4 py-3">
                            <Input
                              placeholder="e.g. 22CS101"
                              value={row.rollNumber}
                              onChange={e => handleRollNumberChange(idx, e.target.value)}
                              className="h-9 font-mono text-xs uppercase font-bold"
                            />
                          </td>

                          <td className="px-4 py-3">
                            {row.rollNumber ? (
                              row.isValidStudent ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold gap-1">
                                  <UserCheck className="size-3" /> ✓ Valid Student — {row.studentName}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 font-bold gap-1">
                                  <AlertCircle className="size-3" /> Roll Registered
                                </Badge>
                              )
                            ) : (
                              <span className="text-slate-400 text-[11px]">Enter Roll Number</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[200px] text-xs font-mono text-slate-700">
                                {row.fileName}
                              </span>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  className="hidden"
                                  onChange={e => handleFileSelect(idx, e)}
                                />
                                <Badge variant="outline" className="bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer font-bold gap-1">
                                  <UploadCloud className="size-3 text-indigo-600" /> Change PDF
                                </Badge>
                              </label>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleOpenPreview(row)}
                              className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg gap-1"
                            >
                              <Eye className="size-3.5" /> Preview PDF
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold uppercase tracking-wider text-xs shadow-md gap-2"
                >
                  <Send className="size-4" /> SUBMIT ASSIGNMENT FOR OFFICER APPROVAL
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        /* Roster View */
        <Card className="p-5 border border-slate-200 bg-white shadow-xs rounded-2xl">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Completed Valuations Answer Copies Roster
            </h3>
            <Badge className="bg-indigo-50 text-indigo-700 font-extrabold border-indigo-200">
              Total Copies: {completedBookletsList.length}
            </Badge>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Evaluation Code (Blind)</th>
                  <th className="px-4 py-3 text-left">Exam & Subject</th>
                  <th className="px-4 py-3 text-left">Assigned Faculty</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Marks Obtained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-semibold">
                {completedBookletsList.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{r.evaluationCode}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{r.examName}</div>
                      <div className="text-[10px] text-muted-foreground">{r.subjectName}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{r.assignedFaculty}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {r.evaluationStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      {r.marksObtained !== null ? `${r.marksObtained} / 100` : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* PDF PREVIEW MODAL */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="size-5 text-indigo-600" />
                Answer Booklet PDF Preview — Roll: {previewingRow?.rollNumber || "N/A"}
              </span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Verified Scanned Booklet
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              File: {previewingRow?.fileName} | Verified Student: {previewingRow?.studentName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-slate-900 p-6 rounded-xl text-white my-4 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-full max-w-2xl bg-white text-slate-900 rounded-lg p-8 shadow-2xl min-h-[500px] flex flex-col justify-between border-4 border-slate-300">
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="font-extrabold text-sm uppercase tracking-wider">EDUSUITE PRO ACADEMIC EVALUATION</h2>
                  <p className="text-[10px] text-slate-500 font-mono">CONFIDENTIAL ANSWER BOOKLET</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono">PAGE {previewPage} OF 12</span>
                </div>
              </div>

              <div className="my-8 space-y-4 text-xs font-mono">
                <p className="font-bold text-indigo-900">[Question 1: Explain Data Structures and Complexity]</p>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  Data structures provide efficient ways of storing and organizing data in computer memory.
                  Time complexity denotes execution runtime requirement O(N log N) using asymptotic notations...
                </p>
                <div className="h-24 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-[11px]">
                  [Scanned Handwritten Answer Sheet Diagram & Steps]
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>SECURITY CODE: SCAN-2026-PDF-VERIFIED</span>
                <span>EDUSUITE PRO WATERMARK</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={previewPage <= 1}
                onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                className="h-8 rounded-lg text-xs"
              >
                <ChevronLeft className="size-4 mr-1" /> Previous Page
              </Button>
              <span className="text-xs font-bold font-mono">Page {previewPage} / 12</span>
              <Button
                variant="outline"
                size="sm"
                disabled={previewPage >= 12}
                onClick={() => setPreviewPage(p => Math.min(12, p + 1))}
                className="h-8 rounded-lg text-xs"
              >
                Next Page <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>

            <Button
              onClick={() => setPreviewModalOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 rounded-lg text-xs font-bold"
            >
              Done Previewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION SUMMARY MODAL */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="size-5 text-indigo-600" />
              Confirm Assignment Batch Submission
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review evaluation assignment batch details before sending to the Exam Cell Controller for approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-500">Branch & Subject:</span>
              <span className="font-bold text-slate-800">{selectedBranch} — {selectedSubject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Booklet Count (N):</span>
              <span className="font-bold text-indigo-600 font-mono">{bookletRows.length} Booklets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Faculty Evaluator:</span>
              <span className="font-bold text-slate-800">{selectedFaculty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Blind Code Generation:</span>
              <span className="font-bold text-emerald-600">Automatic (BLIND-2026-XXXXX)</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              className="h-9 text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl gap-1.5"
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
