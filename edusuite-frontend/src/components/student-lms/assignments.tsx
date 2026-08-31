import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileCheck,
  Calendar,
  AlertCircle,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Eye,
  Check,
  User,
  BookOpen,
  Award
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchStudentAssignments,
  recordQuestionPaperView,
  submitStudentAssignment
} from "@/modules/lms/LMSService";

interface AssignmentsProps {
  assignments?: any[];
  searchQuery: string;
}

export function Assignments({ searchQuery }: AssignmentsProps) {
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activeModalAssignment, setActiveModalAssignment] = useState<any | null>(null);

  // Modal Submission State
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [answerBase64, setAnswerBase64] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [hasViewedQP, setHasViewedQP] = useState(false);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentAssignments();
      setAssignmentsList(data);
    } catch (e) {
      console.error("Failed to load student assignments:", e);
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const openAssignmentDetails = (asg: any) => {
    setActiveModalAssignment(asg);
    setAnswerFile(null);
    setAnswerBase64("");
    setHasViewedQP(asg.questionPaperViewed || asg.status === "VIEWED" || asg.status === "SUBMITTED" || asg.status === "GRADED");
  };

  const handleOpenQuestionPaper = async () => {
    if (!activeModalAssignment) return;
    try {
      await recordQuestionPaperView(activeModalAssignment.id);
      setHasViewedQP(true);
      setAssignmentsList((prev) =>
        prev.map((a) =>
          a.id === activeModalAssignment.id
            ? { ...a, questionPaperViewed: true, status: a.status === "NOT_STARTED" ? "VIEWED" : a.status }
            : a
        )
      );

      if (activeModalAssignment.questionPaperUrl) {
        window.open(activeModalAssignment.questionPaperUrl, "_blank");
      } else {
        toast.info("Opening Question Paper PDF...");
      }
      toast.success("Question paper view recorded.");
    } catch (e) {
      toast.error("Failed to record question paper view.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Only PDF files are accepted for assignment submissions.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size must be under 20MB.");
        return;
      }

      setAnswerFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAnswerBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!activeModalAssignment) return;

    if (!hasViewedQP) {
      toast.error("Please open the question paper before submitting your assignment.");
      return;
    }

    if (!answerFile || !answerBase64) {
      toast.error("Please select an answer copy PDF file to submit.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedSize = `${(answerFile.size / (1024 * 1024)).toFixed(1)} MB`;
      await submitStudentAssignment(activeModalAssignment.id, {
        answerFileData: answerBase64,
        answerFileName: answerFile.name,
        answerFileSize: formattedSize,
      });

      toast.success("Assignment submitted successfully!");
      setActiveModalAssignment(null);
      await loadAssignments();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to submit assignment.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Search
  const filtered = assignmentsList.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(q) ||
      a.subject.toLowerCase().includes(q) ||
      a.facultyName.toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === "Pending") matchesStatus = a.status === "NOT_STARTED" || a.status === "VIEWED";
    else if (statusFilter === "Submitted") matchesStatus = a.status === "SUBMITTED";
    else if (statusFilter === "Graded") matchesStatus = a.status === "GRADED";

    return matchesSearch && matchesStatus;
  });

  // SORTING ALGORITHM FOR STUDENT:
  // Incomplete assignments (NOT_STARTED, VIEWED, SUBMITTED) on TOP
  // Completed assignments (GRADED) on BOTTOM
  const incompleteAssignments = filtered.filter((a) => a.status !== "GRADED");
  const completedAssignments = filtered.filter((a) => a.status === "GRADED");

  const getStatusBadge = (status: string, marks?: number | null, maxMarks?: number) => {
    if (status === "GRADED") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold px-2.5 py-1 text-xs gap-1">
          <CheckCircle2 className="size-3" /> Completed ({marks !== null ? `${marks}/${maxMarks || 30}` : "Graded"})
        </Badge>
      );
    }
    if (status === "SUBMITTED") {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold px-2.5 py-1 text-xs gap-1">
          <Clock className="size-3" /> Submitted (Awaiting Grade)
        </Badge>
      );
    }
    if (status === "VIEWED") {
      return (
        <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 font-bold px-2.5 py-1 text-xs gap-1">
          <Eye className="size-3" /> Question Paper Viewed
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold px-2.5 py-1 text-xs gap-1">
        <Clock className="size-3" /> Pending Submission
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* STATUS FILTER CHIPS */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Pending", "Submitted", "Graded"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                statusFilter === st
                  ? "bg-primary text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm font-medium text-muted-foreground space-y-2">
          <Clock className="size-6 text-primary animate-spin mx-auto" />
          <p>Loading assignments from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-3">
          <FileCheck className="size-10 text-muted-foreground/60 mx-auto" />
          <h3 className="font-bold text-base text-foreground">No assignments available</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Assignments launched by your subject faculty will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: PENDING / IN PROGRESS ASSIGNMENTS (TOP) */}
          {incompleteAssignments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-amber-500" /> Pending & Submitted Assignments ({incompleteAssignments.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {incompleteAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                          {a.subjectCode || a.subject}
                        </Badge>
                        {getStatusBadge(a.status, a.marks, a.maxMarks)}
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {a.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <BookOpen className="size-3.5 text-muted-foreground/70" />
                          {a.subjectName || a.subject}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/60 text-xs space-y-1 font-medium text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                          <User className="size-3.5 text-primary" /> Faculty: <span className="font-semibold text-foreground">{a.facultyName}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-mono">
                          <Calendar className="size-3.5 text-muted-foreground" /> Assigned: {a.assignedDate}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => openAssignmentDetails(a)}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs h-9 shadow-xs gap-1.5"
                    >
                      <FileText className="size-3.5" /> Open Assignment
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: COMPLETED & GRADED ASSIGNMENTS (BOTTOM) */}
          {completedAssignments.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Completed & Graded Assignments ({completedAssignments.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {completedAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="font-mono text-xs text-emerald-700 border-emerald-300 bg-white">
                          {a.subjectCode || a.subject}
                        </Badge>
                        {getStatusBadge(a.status, a.marks, a.maxMarks)}
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-foreground line-clamp-2">{a.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <BookOpen className="size-3.5" /> {a.subjectName || a.subject}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-card border border-emerald-500/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-mono font-bold text-emerald-700">
                          <span>Marks Awarded:</span>
                          <span className="text-sm">{a.marks} / {a.maxMarks || 30}</span>
                        </div>
                        {a.gradedBy && (
                          <p className="text-[11px] text-muted-foreground">
                            Graded by <span className="font-semibold text-foreground">{a.gradedBy}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => openAssignmentDetails(a)}
                      variant="outline"
                      className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl text-xs h-9 gap-1.5"
                    >
                      <Eye className="size-3.5" /> View Graded Submission
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STUDENT ASSIGNMENT DETAILS & SUBMISSION MODAL */}
      {activeModalAssignment && (
        <Dialog open={!!activeModalAssignment} onOpenChange={() => setActiveModalAssignment(null)}>
          <DialogContent className="max-w-lg rounded-2xl p-6 bg-card border-border shadow-xl space-y-4">
            <DialogHeader className="border-b border-border/80 pb-3 text-left">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  {activeModalAssignment.subject}
                </Badge>
                {getStatusBadge(activeModalAssignment.status, activeModalAssignment.marks, activeModalAssignment.maxMarks)}
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">{activeModalAssignment.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Faculty: <span className="font-semibold text-foreground">{activeModalAssignment.facultyName}</span> &middot; Assigned: {activeModalAssignment.assignedDate}
              </DialogDescription>
            </DialogHeader>

            {/* QUESTION PAPER SECTION */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="size-4 text-primary" /> Question Paper PDF
                </span>
                {hasViewedQP && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
                    <Check className="size-3" /> Viewed
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="size-4 text-red-500 shrink-0" />
                  <span className="font-mono font-bold truncate">{activeModalAssignment.questionPaperFileName || "Question_Paper.pdf"}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={handleOpenQuestionPaper}
                    className="h-8 text-xs bg-primary text-white font-bold rounded-lg gap-1"
                  >
                    <ExternalLink className="size-3" /> Open Question Paper
                  </Button>
                </div>
              </div>

              {!hasViewedQP && (
                <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="size-3.5 shrink-0" /> You MUST click "Open Question Paper" before uploading your answer copy.
                </p>
              )}
            </div>

            {/* SUBMISSION / GRADED VIEW SECTION */}
            {activeModalAssignment.status === "GRADED" ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-700">
                  <span className="flex items-center gap-1.5">
                    <Award className="size-4" /> Grade & Marks:
                  </span>
                  <span className="text-base font-mono">{activeModalAssignment.marks} / {activeModalAssignment.maxMarks || 30}</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Graded by <span className="font-semibold text-foreground">{activeModalAssignment.gradedBy}</span> on {activeModalAssignment.gradedAt || activeModalAssignment.assignedDate}
                </p>
                {activeModalAssignment.answerFileName && (
                  <p className="text-[11px] font-mono text-muted-foreground pt-1 border-t border-emerald-500/20">
                    Your Answer Copy: <span className="font-bold text-foreground">{activeModalAssignment.answerFileName}</span>
                  </p>
                )}
              </div>
            ) : activeModalAssignment.status === "SUBMITTED" ? (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" /> Answer Copy Submitted
                  </span>
                  <Badge variant="outline" className="border-blue-300 text-blue-700 text-[10px]">Awaiting Grade</Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Submitted on: <span className="font-mono font-semibold text-foreground">{activeModalAssignment.submittedAt || "Today"}</span>
                </p>
                {activeModalAssignment.answerFileName && (
                  <p className="text-[11px] font-mono text-muted-foreground pt-1 border-t border-blue-500/20">
                    Uploaded File: <span className="font-bold text-foreground">{activeModalAssignment.answerFileName}</span>
                  </p>
                )}
              </div>
            ) : (
              /* ANSWER UPLOAD FORM */
              <div className="space-y-3 border-t border-border pt-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <UploadCloud className="size-4 text-primary" /> Upload Answer Copy PDF *
                </h4>

                <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-5 text-center space-y-2 bg-muted/20 transition-colors">
                  <UploadCloud className="size-7 text-primary mx-auto" />
                  <p className="font-bold text-xs text-foreground">
                    {answerFile ? answerFile.name : "Select or drag your answer PDF copy"}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    PDF format only (Max 20MB)
                  </p>

                  <label className="inline-block pt-1">
                    <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
                    <span className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold cursor-pointer shadow-xs">
                      Choose PDF Copy
                    </span>
                  </label>
                </div>

                {answerFile && (
                  <div className="p-2.5 rounded-lg bg-card border border-border text-xs font-mono flex items-center justify-between">
                    <span className="truncate font-semibold text-foreground">{answerFile.name}</span>
                    <span className="text-muted-foreground shrink-0 text-[11px]">{(answerFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setActiveModalAssignment(null)} className="rounded-xl text-xs h-9">
                Close
              </Button>
              {activeModalAssignment.status !== "GRADED" && activeModalAssignment.status !== "SUBMITTED" && (
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={submitting || !hasViewedQP || !answerFile}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 gap-1.5"
                >
                  {submitting ? "Submitting..." : "Submit Assignment"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
