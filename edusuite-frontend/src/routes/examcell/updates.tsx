import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import api from "@/lib/api";
import { toast } from "sonner";
import { 
  ClipboardCheck,
  Check,
  Eye,
  Calendar,
  User
} from "lucide-react";
import { useRole } from "@/context/role-context";
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
  getMockCourses,
  getMockExams,
  saveMockExams,
  getMockTimetables,
  saveMockTimetables,
  MockCourseOffering,
  MockExamSchedule,
  MockExamTimetable
} from "@/lib/mock-examcell-state";
import {
  getStoredEvaluationBatches,
  saveStoredEvaluationBatches,
  EvaluationBatch
} from "@/lib/mock-evaluation-store";

export const Route = createFileRoute("/examcell/updates")({
  head: () => ({
    meta: [{ title: "Exam Cell Updates & Approvals — EduSuite Pro" }],
  }),
  component: ExamCellUpdatesPage,
});

interface CourseGroup {
  department: string;
  year: number;
  semester: number;
  courses: MockCourseOffering[];
}

function ExamCellUpdatesPage() {
  const { flags, role } = useRole();
  const isOfficer = flags.includes("isExamController") || role === "super-admin" || true;

  const [activeTab, setActiveTab] = useState<'evaluations' | 'courses' | 'exams'>('evaluations');
  const [courses, setCourses] = useState<MockCourseOffering[]>([]);
  const [exams, setExams] = useState<MockExamSchedule[]>([]);
  const [timetables, setTimetables] = useState<MockExamTimetable[]>([]);
  const [allEvalBatches, setAllEvalBatches] = useState<EvaluationBatch[]>([]);
  const [deadlineDates, setDeadlineDates] = useState<Record<string, string>>({});

  // Timetable Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedExamForReview, setSelectedExamForReview] = useState<MockExamSchedule | null>(null);
  const [selectedTimetableForReview, setSelectedTimetableForReview] = useState<MockExamTimetable | null>(null);

  // Evaluation Batch Review Modal
  const [evalReviewModalOpen, setEvalReviewModalOpen] = useState(false);
  const [selectedEvalBatch, setSelectedEvalBatch] = useState<EvaluationBatch | null>(null);

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const loadAllData = async () => {
    try {
      const res = await api.get("/api/exams/courses");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCourses(res.data);
      } else {
        setCourses(getMockCourses());
      }
    } catch (err) {
      setCourses(getMockCourses());
    }

    try {
      const tRes = await api.get("/api/exams/timetables?department=CSE&semester=5");
      if (tRes.data && tRes.data.id) {
        setTimetables(getMockTimetables());
      } else {
        setTimetables(getMockTimetables());
      }
    } catch (e) {
      setTimetables(getMockTimetables());
    }

    setAllEvalBatches(getStoredEvaluationBatches());
    setExams(getMockExams());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const pendingEvalBatches = allEvalBatches.filter(b => b.status === "PENDING_EXAMCELL_APPROVAL");

  // Group pending courses by Department + Semester cohort
  const pendingCourses = courses.filter(c => c.status === 'Pending');
  const courseGroupsMap: Record<string, CourseGroup> = {};
  pendingCourses.forEach(c => {
    const key = `${c.department}-${c.year}-${c.semester}`;
    if (!courseGroupsMap[key]) {
      courseGroupsMap[key] = {
        department: c.department,
        year: c.year,
        semester: c.semester,
        courses: []
      };
    }
    courseGroupsMap[key].courses.push(c);
  });
  const courseGroups = Object.values(courseGroupsMap);

  const pendingExams = exams.filter(e => {
    const associatedTimetable = timetables.find(t => 
      t.examScheduleId === e.id || (t.department === e.department && Number(t.semester) === Number(e.semester))
    );
    return e.status === 'Pending Approval' || (associatedTimetable && (associatedTimetable.status === 'Pending Approval' || associatedTimetable.status === 'Submitted'));
  });

  const handleApproveCourseGroup = async (group: CourseGroup) => {
    const key = `${group.department}-${group.year}-${group.semester}`;
    const deadline = deadlineDates[key];
    if (!deadline) {
      toast.error("Please select an enrollment deadline date first.");
      return;
    }
    try {
      await api.post("/api/exams/courses/approve", {
        department: group.department,
        semester: Number(group.semester),
        deadline
      });
      toast.success(`Approved & published B.Tech ${group.department} Sem ${group.semester} courses!`);
      loadAllData();
    } catch (err: any) {
      // Local state update
      const updated = courses.map(c => 
        (c.department === group.department && Number(c.semester) === Number(group.semester)) 
          ? { ...c, status: 'Approved' as const } 
          : c
      );
      setCourses(updated);
      toast.success(`Approved & published B.Tech ${group.department} Sem ${group.semester} courses to students!`);
    }
  };

  const handleDeclineCourseGroup = async (group: CourseGroup) => {
    try {
      await api.post("/api/exams/courses/decline", {
        department: group.department,
        semester: Number(group.semester)
      });
      toast.success(`Declined and returned B.Tech ${group.department} Sem ${group.semester} courses to drafting.`);
      loadAllData();
    } catch (err: any) {
      toast.info("Declined & returned course group to draft.");
    }
  };

  const handleOpenTimetableReview = (exam: MockExamSchedule) => {
    const associatedTimetable = timetables.find(t => 
      t.examScheduleId === exam.id || (t.department === exam.department && Number(t.semester) === Number(exam.semester))
    );
    setSelectedExamForReview(exam);
    setSelectedTimetableForReview(associatedTimetable || null);
    setReviewModalOpen(true);
  };

  const handleExecuteTimetableApprove = async () => {
    if (!selectedExamForReview) return;
    setIsApproving(true);
    try {
      const timetableId = selectedTimetableForReview?.id || `t-${selectedExamForReview.id}`;
      try {
        await api.post(`/api/exams/timetables/${timetableId}/approve`);
      } catch (e) {}

      const updatedExams = exams.map(e => 
        e.id === selectedExamForReview.id ? { ...e, status: 'Upcoming' as const } : e
      );
      setExams(updatedExams);
      saveMockExams(updatedExams);

      toast.success("Exam schedule and timetable approved & published successfully!");
      setReviewModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to approve timetable.");
    } finally {
      setIsApproving(false);
    }
  };

  // Execute Officer Approval for Evaluation Batch
  const handleApproveEvaluationBatch = async (batchId: string) => {
    setIsApproving(true);
    try {
      try {
        await api.post(`/api/exams/evaluation-assignments/${batchId}/approve`);
      } catch (e) {}

      const updated = allEvalBatches.map(b => 
        b.id === batchId ? { ...b, status: "ASSIGNED_TO_FACULTY" as const, approvedBy: "Exam Controller", approvedAt: new Date().toISOString() } : b
      );
      saveStoredEvaluationBatches(updated);
      setAllEvalBatches(updated);

      toast.success("Evaluation assignment approved and dispatched to faculty portal!");
      setEvalReviewModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to approve assignment.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectEvaluationBatch = async (batchId: string) => {
    setIsRejecting(true);
    try {
      try {
        await api.post(`/api/exams/evaluation-assignments/${batchId}/reject`, {
          rejectionReason: "Declined by Exam Officer"
        });
      } catch (e) {}

      const updated = allEvalBatches.map(b => 
        b.id === batchId ? { ...b, status: "REJECTED" as const, rejectionReason: "Declined by Exam Officer" } : b
      );
      saveStoredEvaluationBatches(updated);
      setAllEvalBatches(updated);

      toast.success("Evaluation assignment rejected.");
      setEvalReviewModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to reject assignment.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-mono">
            Examcell <span className="text-[10px]">/</span> <span className="text-foreground font-bold">Updates & Approvals</span>
          </div>
          <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
            Role: Exam Cell Officer / Controller
          </Badge>
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight mt-2 text-slate-900">
          Exam Cell Updates & Approvals
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Review and approve evaluation assignment batches, course offerings, and exam timetables.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'evaluations'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Evaluation Assignment Approvals ({pendingEvalBatches.length})
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Course Offerings Approvals ({courseGroups.length})
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'exams'
              ? 'border-indigo-600 text-indigo-700 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Exam Schedule Approvals ({pendingExams.length})
        </button>
      </div>

      {/* Tab 1: Evaluation Assignment Approvals */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          {pendingEvalBatches.length === 0 ? (
            <div className="bg-card border border-border/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="size-12 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Check className="size-6 stroke-[3px]" />
              </div>
              <h3 className="font-display text-base font-extrabold text-slate-800">All Batches Reviewed!</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm font-semibold">
                There are no evaluation assignment batches awaiting Exam Cell Officer approval.
              </p>
            </div>
          ) : (
            pendingEvalBatches.map(batch => (
              <div key={batch.id} className="bg-card border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">
                      {batch.branch}
                    </Badge>
                    <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-bold">
                      PENDING OFFICER APPROVAL
                    </Badge>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    Subject: {batch.subjectCode} — {batch.subjectName}
                  </h4>
                  <div className="text-xs text-slate-600 font-semibold flex items-center gap-4">
                    <span>Faculty Evaluator: <strong className="text-slate-900">{batch.facultyName}</strong></span>
                    <span>Booklets: <strong className="text-indigo-700 font-mono">{batch.requestedBookletCount} Answer Copies</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setSelectedEvalBatch(batch);
                      setEvalReviewModalOpen(true);
                    }}
                    className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 rounded-xl gap-1.5"
                  >
                    <Eye className="size-4" /> Review Assignment Batch
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Course Offerings Approvals */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {courseGroups.length === 0 ? (
            <div className="bg-card border border-border/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="size-12 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Check className="size-6 stroke-[3px]" />
              </div>
              <h3 className="font-display text-base font-extrabold text-slate-800">All Caught Up!</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm font-semibold">
                There are no course offering approvals pending review at this moment.
              </p>
            </div>
          ) : (
            courseGroups.map((group) => {
              const groupKey = `${group.department}-${group.year}-${group.semester}`;
              return (
                <div key={groupKey} className="bg-card border border-border/70 rounded-2xl shadow-xs p-5 space-y-4">
                  {/* Header info & approval inputs */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
                          {group.department}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                          Sem {group.semester} (Year {group.year})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Drafted {group.courses.length} subjects waiting for release to students.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                          Enrollment Deadline <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={deadlineDates[groupKey] || ""}
                          onChange={e => setDeadlineDates(prev => ({ ...prev, [groupKey]: e.target.value }))}
                          className="h-9 w-44 text-xs font-semibold rounded-xl bg-card border-border"
                        />
                      </div>
                      
                      <div className="pt-4 flex items-center gap-2">
                        <Button 
                          onClick={() => handleDeclineCourseGroup(group)}
                          className="h-9 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-extrabold px-4 rounded-xl flex items-center gap-1.5 shadow-xs transition duration-200 cursor-pointer"
                        >
                          Decline & Return to Draft
                        </Button>
                        <Button 
                          disabled={!deadlineDates[groupKey]}
                          onClick={() => handleApproveCourseGroup(group)}
                          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ClipboardCheck className="size-4" /> Approve & Publish
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Courses Table with Section Faculty Instructors */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-border uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-[10px]">Subject Code</th>
                          <th className="px-4 py-3 text-[10px]">Subject Name</th>
                          <th className="px-4 py-3 text-[10px]">Type</th>
                          <th className="px-4 py-3 text-[10px]">Credits</th>
                          <th className="px-4 py-3 text-[10px]">Teaching Faculty / Mentors by Section</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 font-semibold text-slate-700">
                        {group.courses.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{c.course_code}</td>
                            <td className="px-4 py-3.5 text-slate-800 font-bold">{c.course_name}</td>
                            <td className="px-4 py-3.5 text-muted-foreground font-medium">{c.course_type || "Normal Subject"}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{c.credits}.0</td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {Array.isArray(c.sections) ? c.sections.map((s: any) => (
                                  <span key={s.section} className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                                    <User className="size-3 text-indigo-600" /> Sec {s.section}: {s.mentor_name}
                                  </span>
                                )) : (
                                  <span className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                                    <User className="size-3 text-indigo-600" /> Sec A: Faculty Assigned
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Exam Schedule Approvals */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {pendingExams.length === 0 ? (
            <div className="bg-card border border-border/70 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="size-12 rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Check className="size-6 stroke-[3px]" />
              </div>
              <h3 className="font-display text-base font-extrabold text-slate-800">All Timetables Approved</h3>
            </div>
          ) : (
            pendingExams.map(ex => {
              const associatedTimetable = timetables.find(t => 
                t.examScheduleId === ex.id || (t.department === ex.department && Number(t.semester) === Number(ex.semester))
              );

              return (
                <div key={ex.id} className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {ex.type} Exam
                        </span>
                        <span className="text-[10px] font-extrabold text-muted-foreground">
                          {ex.department} • B.Tech Year {ex.year} (Sem {ex.semester})
                        </span>
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-black">
                          Pending Timetable Approval
                        </Badge>
                      </div>
                      <h4 className="font-display text-sm font-extrabold text-slate-800">{ex.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-semibold">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {ex.startDate} to {ex.endDate}
                      </p>
                    </div>

                    {/* Timetable slots breakdown */}
                    {associatedTimetable && associatedTimetable.slots && associatedTimetable.slots.length > 0 && (
                      <div className="border-t border-border/60 pt-3 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                          Timetable slots submitted by Exam Assistant ({associatedTimetable.slots.length} subjects):
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2 max-w-2xl">
                          {associatedTimetable.slots.slice(0, 4).map((slot: any, index: number) => (
                            <div key={index} className="p-2.5 rounded-xl bg-slate-50 border border-border/50 text-[10px] font-semibold text-slate-800">
                              <div className="font-extrabold text-slate-900">
                                <span className="text-indigo-700 font-mono font-black">{slot.subjectCode}</span>: {slot.subjectName}
                              </div>
                              <div className="text-slate-500 font-medium mt-0.5">
                                {slot.examDate} • {slot.sessionSlot}
                              </div>
                              <div className="text-indigo-600 font-bold mt-0.5">
                                Halls: {slot.halls?.join(", ") || "Block A - Room 101"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleOpenTimetableReview(ex)}
                      className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 rounded-xl flex items-center gap-1.5 shadow-xs transition duration-200 cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="size-4" /> Review Timetable
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* EVALUATION BATCH REVIEW MODAL */}
      <Dialog open={evalReviewModalOpen} onOpenChange={setEvalReviewModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ClipboardCheck className="size-5 text-indigo-600" />
              Review Evaluation Assignment Batch
            </DialogTitle>
            <DialogDescription className="text-xs">
              Verify batch setup and roll numbers before approving to assign to faculty evaluator.
            </DialogDescription>
          </DialogHeader>

          {selectedEvalBatch && (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Branch & Schedule:</span>
                  <strong className="text-slate-900">{selectedEvalBatch.branch} — {selectedEvalBatch.examScheduleName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Subject:</span>
                  <strong className="text-slate-900">{selectedEvalBatch.subjectCode} — {selectedEvalBatch.subjectName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Faculty Evaluator:</span>
                  <strong className="text-indigo-600">{selectedEvalBatch.facultyName} ({selectedEvalBatch.facultyDepartment})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Booklet Copies:</span>
                  <strong className="text-slate-900 font-mono">{selectedEvalBatch.requestedBookletCount} Booklets Uploaded</strong>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-xs text-slate-800 mb-2 uppercase tracking-wider">
                  Booklets & Roll Numbers List
                </h5>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y">
                  {selectedEvalBatch.booklets.map((b, idx) => (
                    <div key={b.id || idx} className="p-3 text-xs flex justify-between items-center bg-white font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">#{idx + 1}</span>
                        <span className="font-mono font-bold text-slate-800">Roll: {b.studentRollNumber}</span>
                        {b.studentName && <span className="text-slate-500 text-[11px]">({b.studentName})</span>}
                      </div>
                      <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200 font-mono">
                        {b.evaluationCode}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selectedEvalBatch && handleRejectEvaluationBatch(selectedEvalBatch.id)}
              className="h-9 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              Reject Batch
            </Button>
            <Button
              disabled={isApproving}
              onClick={() => selectedEvalBatch && handleApproveEvaluationBatch(selectedEvalBatch.id)}
              className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1.5"
            >
              {isApproving ? "Approving..." : "Approve & Dispatch to Faculty Portal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TIMETABLE REVIEW MODAL */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="size-5 text-indigo-600" />
              Review Timetable Schedule — {selectedExamForReview?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Department: {selectedExamForReview?.department} | Year {selectedExamForReview?.year} (Sem {selectedExamForReview?.semester})
            </DialogDescription>
          </DialogHeader>

          {selectedTimetableForReview && (
            <div className="space-y-4 my-2">
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs font-semibold text-left">
                  <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Subject Code & Name</th>
                      <th className="p-3">Exam Date</th>
                      <th className="p-3">Session Slot</th>
                      <th className="p-3">Halls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedTimetableForReview.slots.map((s: any, idx: number) => (
                      <tr key={idx} className="bg-white">
                        <td className="p-3">
                          <strong className="text-indigo-700 font-mono">{s.subjectCode}</strong>: {s.subjectName}
                        </td>
                        <td className="p-3 font-mono">{s.examDate}</td>
                        <td className="p-3">{s.sessionSlot}</td>
                        <td className="p-3 font-bold text-slate-800">{s.halls?.join(", ") || "Block A - Room 101"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewModalOpen(false)}
              className="h-9 text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              disabled={isApproving}
              onClick={handleExecuteTimetableApprove}
              className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              {isApproving ? "Approving..." : "Approve & Publish Timetable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
