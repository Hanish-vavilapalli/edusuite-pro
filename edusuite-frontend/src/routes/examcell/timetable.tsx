import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { 
  CalendarRange, 
  Plus, 
  Trash2, 
  Info, 
  Save, 
  X,
  FileText,
  MapPin,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useRole } from "@/context/role-context";
import api from "@/lib/api";
import {
  getMockExams,
  saveMockExams,
  getMockCourses,
  getMockTimetables,
  saveMockTimetables,
  MockExamSchedule,
  MockCourseOffering,
  MockExamTimetable,
  MockTimetableSlot
} from "@/lib/mock-examcell-state";

export const Route = createFileRoute("/examcell/timetable")({
  head: () => ({
    meta: [{ title: "Exam Timetable Builder — EduSuite Pro" }],
  }),
  component: TimetablePage,
});

export function TimetablePage() {
  const { role, flags, department: assistantDept } = useRole();
  const isOfficer = flags.includes("isExamController") || role === "super-admin";
  const activeDeptCode = assistantDept || "CSE";

  // Filter selection states
  const [selectedDept, setSelectedDept] = useState(activeDeptCode);
  const [selectedYear, setSelectedYear] = useState("3");
  const [selectedSem, setSelectedSem] = useState("5");

  // Datasets from API & Fallback
  const [exams, setExams] = useState<MockExamSchedule[]>([]);
  const [courses, setCourses] = useState<MockCourseOffering[]>([]);
  const [timetables, setTimetables] = useState<MockExamTimetable[]>([]);
  const [loading, setLoading] = useState(true);

  // Active schedule & timetable state
  const [activeExam, setActiveExam] = useState<MockExamSchedule | null>(null);
  const [timetableState, setTimetableState] = useState<MockExamTimetable | null>(null);

  // Slots being configured by assistant
  const [slots, setSlots] = useState<MockTimetableSlot[]>([]);
  const [currentHallInput, setCurrentHallInput] = useState<Record<number, string>>({});

  // Confirmation modal state for delete slot
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [slotToDeleteIndex, setSlotToDeleteIndex] = useState<number | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock department selector if assistant
  useEffect(() => {
    if (!isOfficer) {
      setSelectedDept(activeDeptCode);
    }
  }, [isOfficer, activeDeptCode]);

  // Load all exams, courses, timetables from backend DB and fallback to mock
  const loadTimetableData = async () => {
    setLoading(true);
    try {
      // 1. Load exam schedules
      let schedulesData: MockExamSchedule[] = [];
      try {
        const res = await api.get(`/api/exams/schedules?department=${selectedDept}&year=${selectedYear}&semester=${selectedSem}`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          schedulesData = res.data;
        }
      } catch (e) {}

      const mockSchedules = getMockExams();
      const combinedSchedules = [...schedulesData];
      mockSchedules.forEach(m => {
        if (!combinedSchedules.some(s => s.id === m.id)) {
          combinedSchedules.push(m);
        }
      });
      setExams(combinedSchedules);

      // 2. Load offered courses
      let coursesData: MockCourseOffering[] = [];
      try {
        const cRes = await api.get(`/api/exams/courses?department=${selectedDept}&semester=${selectedSem}`);
        if (cRes.data && Array.isArray(cRes.data)) {
          coursesData = cRes.data;
        }
      } catch (e) {}

      const mockCourses = getMockCourses();
      const combinedCourses = [...coursesData];
      mockCourses.forEach(m => {
        if (!combinedCourses.some(c => c.course_code === m.course_code)) {
          combinedCourses.push(m);
        }
      });
      setCourses(combinedCourses);

      // 3. Load timetable
      let loadedTimetable: MockExamTimetable | null = null;
      try {
        const tRes = await api.get(`/api/exams/timetables?department=${selectedDept}&year=${selectedYear}&semester=${selectedSem}`);
        if (tRes.data && tRes.data.id) {
          loadedTimetable = tRes.data;
        }
      } catch (e) {}

      if (!loadedTimetable) {
        const mockTs = getMockTimetables();
        const found = mockTs.find(t => 
          t.department === selectedDept && 
          Number(t.year) === Number(selectedYear) && 
          Number(t.semester) === Number(selectedSem)
        );
        if (found) loadedTimetable = found;
      }

      setTimetables(getMockTimetables());
      setTimetableState(loadedTimetable);
    } catch (err) {
      console.error("Failed to load timetable dataset", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetableData();
  }, [selectedDept, selectedYear, selectedSem]);

  // Identify published exam schedule for selected cohort
  useEffect(() => {
    const found = exams.find(e => 
      e.department === selectedDept && 
      Number(e.year) === Number(selectedYear) && 
      Number(e.semester) === Number(selectedSem) &&
      (e.status === 'Published' || e.status === 'Upcoming' || e.status === 'Pending Approval')
    );
    setActiveExam(found || null);
  }, [exams, selectedDept, selectedYear, selectedSem]);

  // Find offered courses for this cohort
  const cohortCourses = courses.filter(c => 
    c.department === selectedDept && 
    Number(c.semester) === Number(selectedSem)
  );

  // Initialize slots whenever cohort, active exam, or timetableState updates
  useEffect(() => {
    if (timetableState && timetableState.slots && timetableState.slots.length > 0) {
      setSlots(timetableState.slots);
    } else if (activeExam && cohortCourses.length > 0) {
      // Auto-generate 1 slot for each subject in published exam cohort
      const autoSlots: MockTimetableSlot[] = cohortCourses.map((c, index) => {
        // Pre-calculate realistic date spread within exam start & end date
        let defaultDate = "";
        if (activeExam.startDate) {
          const startDateObj = new Date(activeExam.startDate);
          if (!isNaN(startDateObj.getTime())) {
            startDateObj.setDate(startDateObj.getDate() + (index * 2));
            defaultDate = startDateObj.toISOString().split("T")[0];
          }
        }

        return {
          id: `slot-auto-${c.course_code}`,
          subjectCode: c.course_code,
          subjectName: c.course_name,
          examDate: defaultDate || activeExam.startDate || "",
          sessionSlot: index % 2 === 0 ? "Morning (10:00 AM - 01:00 PM)" : "Afternoon (02:00 PM - 05:00 PM)",
          halls: ["Block A - Room 101"],
          duration: "3 Hours",
          reportingTime: index % 2 === 0 ? "09:30 AM" : "01:30 PM"
        };
      });
      setSlots(autoSlots);
    } else {
      setSlots([]);
    }
  }, [selectedDept, selectedYear, selectedSem, activeExam, timetableState]);

  // Handle "+ Add Exam Slot" — finds next unassigned subject automatically
  const handleAddExamSlot = () => {
    if (!activeExam) {
      toast.error("No published examination schedule available.");
      return;
    }

    if (cohortCourses.length === 0) {
      toast.error("No subjects are available for this examination cohort.");
      return;
    }

    // Find subjects that have not yet been assigned to slots
    const assignedCodes = new Set(slots.map(s => s.subjectCode));
    const unassignedCourses = cohortCourses.filter(c => !assignedCodes.has(c.course_code));

    if (unassignedCourses.length === 0) {
      toast.info("All subjects for this examination have already been assigned to timetable slots.");
      return;
    }

    // Pick next unassigned subject
    const nextSubject = unassignedCourses[0];
    const newSlot: MockTimetableSlot = {
      id: `slot-new-${Date.now()}`,
      subjectCode: nextSubject.course_code,
      subjectName: nextSubject.course_name,
      examDate: activeExam.startDate || "",
      sessionSlot: "Morning (10:00 AM - 01:00 PM)",
      halls: ["Block A - Room 101"],
      duration: "3 Hours",
      reportingTime: "09:30 AM"
    };

    setSlots(prev => [...prev, newSlot]);
    toast.success(`Added timetable slot for ${nextSubject.course_code} - ${nextSubject.course_name}`);
  };

  // Open delete slot confirmation dialog
  const promptDeleteSlot = (index: number) => {
    setSlotToDeleteIndex(index);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete slot
  const handleConfirmDeleteSlot = () => {
    if (slotToDeleteIndex !== null) {
      const removedSlot = slots[slotToDeleteIndex];
      setSlots(slots.filter((_, i) => i !== slotToDeleteIndex));
      toast.success(`Removed slot for ${removedSlot.subjectCode}. Subject is now available to be added again.`);
    }
    setDeleteConfirmOpen(false);
    setSlotToDeleteIndex(null);
  };

  // Handle Slot changes
  const handleSlotChange = (index: number, field: keyof MockTimetableSlot, value: any) => {
    setSlots(prev => prev.map((slot, idx) => {
      if (idx === index) {
        return { ...slot, [field]: value };
      }
      return slot;
    }));
  };

  // Tag/Chip Hall Addition
  const handleAddHall = (slotIndex: number) => {
    const hallName = currentHallInput[slotIndex]?.trim();
    if (!hallName) return;

    const currentHalls = slots[slotIndex].halls || [];
    if (currentHalls.some(h => h.toLowerCase() === hallName.toLowerCase())) {
      toast.error(`Hall "${hallName}" is already assigned to this slot.`);
      return;
    }

    handleSlotChange(slotIndex, "halls", [...currentHalls, hallName]);
    setCurrentHallInput(prev => ({ ...prev, [slotIndex]: "" }));
  };

  // Remove Hall Tag
  const handleRemoveHall = (slotIndex: number, hallName: string) => {
    const currentHalls = slots[slotIndex].halls || [];
    if (currentHalls.length <= 1) {
      toast.error("At least one examination hall is required per slot.");
      return;
    }
    handleSlotChange(slotIndex, "halls", currentHalls.filter(h => h !== hallName));
  };

  // Validation & Submit Timetable
  const handleSaveAndSubmitTimetable = async () => {
    if (!activeExam) {
      toast.error("No published examination schedule available for this cohort.");
      return;
    }

    if (slots.length === 0) {
      toast.error("Please add at least one exam slot before submitting.");
      return;
    }

    // Validation 1: Required fields check
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.subjectCode || !slot.subjectName) {
        toast.error(`Subject code and name are required for Slot #${i + 1}.`);
        return;
      }
      if (!slot.examDate) {
        toast.error(`Please assign an exam date for ${slot.subjectCode}.`);
        return;
      }
      if (!slot.halls || slot.halls.length === 0) {
        toast.error(`Please assign at least one examination hall for ${slot.subjectCode}.`);
        return;
      }

      // Validation 2: Exam date bounds check
      if (activeExam.startDate && activeExam.endDate) {
        const slotTime = new Date(slot.examDate).getTime();
        const startTime = new Date(activeExam.startDate).getTime();
        const endTime = new Date(activeExam.endDate).getTime();

        if (isNaN(slotTime) || slotTime < startTime || slotTime > endTime) {
          toast.error(`Exam date for ${slot.subjectCode} (${slot.examDate}) must fall within the published examination period (${activeExam.startDate} to ${activeExam.endDate}).`);
          return;
        }
      }
    }

    // Validation 3: Hall Conflict Detection across slots on same date & session
    const hallMap = new Map<string, string>();
    for (const slot of slots) {
      for (const hall of slot.halls) {
        const key = `${slot.examDate}_${slot.sessionSlot}_${hall.toLowerCase()}`;
        if (hallMap.has(key)) {
          const conflictingSubject = hallMap.get(key);
          toast.error(`Hall ${hall} is already allocated for another examination (${conflictingSubject}) on ${slot.examDate} during ${slot.sessionSlot}.`);
          return;
        }
        hallMap.set(key, slot.subjectCode);
      }
    }

    // Validation 4: Duplicate subject slots
    const seenSubjects = new Set<string>();
    for (const slot of slots) {
      if (seenSubjects.has(slot.subjectCode)) {
        toast.error(`Subject ${slot.subjectCode} has duplicate timetable slots. Each subject should appear only once.`);
        return;
      }
      seenSubjects.add(slot.subjectCode);
    }

    setIsSubmitting(true);
    try {
      // 1. Submit via Express backend API
      let resData: any = null;
      try {
        const res = await api.post("/api/exams/timetables", {
          examScheduleId: activeExam.id,
          department: selectedDept,
          year: Number(selectedYear),
          semester: Number(selectedSem),
          slots
        });
        if (res.status === 200 && res.data) {
          resData = res.data;
        }
      } catch (e: any) {
        console.warn("Backend submit warning, syncing state locally:", e);
      }

      // 2. Sync to local mock state persistence
      const currentTimetables = getMockTimetables();
      const filtered = currentTimetables.filter(t => 
        !(t.department === selectedDept && Number(t.year) === Number(selectedYear) && Number(t.semester) === Number(selectedSem))
      );

      const newTimetable: MockExamTimetable = {
        id: resData?.timetableId || timetableState?.id || `t-${Date.now()}`,
        examScheduleId: activeExam.id,
        department: selectedDept,
        year: Number(selectedYear),
        semester: Number(selectedSem),
        academicYear: "2025-2026",
        status: "Pending Approval",
        createdBy: "Exam Assistant",
        submittedAt: new Date().toISOString(),
        slots
      };

      const nextList = [...filtered, newTimetable];
      saveMockTimetables(nextList);
      setTimetables(nextList);
      setTimetableState(newTimetable);

      toast.success("Timetable submitted successfully for Exam Officer approval.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit timetable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine current lifecycle status
  const currentStatus = timetableState?.status || "Draft";
  const isPendingApproval = currentStatus === "Pending Approval" || currentStatus === "Submitted";
  const isApproved = currentStatus === "Approved";
  const isRejected = currentStatus === "Rejected";

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-mono">
            Home <span className="text-[10px]">/</span> Examcell <span className="text-[10px]">/</span> <span className="text-foreground font-bold">Timetable</span>
          </div>
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight mt-2 text-slate-900">
          Timetable Builder
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Schedule subject-wise theory exams, set examination sessions, and structure final timetables.
        </p>
      </div>

      {/* 2. Cohort Selectors (Department, Year, Semester) */}
      <Card className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-2xs">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Department</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              disabled={!isOfficer}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold outline-none cursor-pointer disabled:bg-slate-100 disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              <option value="CSE">CSE</option>
              <option value="AIML">AIML</option>
              <option value="AIDS">AIDS</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="IT">IT</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Target Year</label>
            <select
              value={selectedYear}
              onChange={e => {
                const yr = e.target.value;
                setSelectedYear(yr);
                const sems = yr === "1" ? [1, 2] : yr === "2" ? [3, 4] : yr === "3" ? [5, 6] : [7, 8];
                setSelectedSem(String(sems[0]));
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Semester</label>
            <select
              value={selectedSem}
              onChange={e => setSelectedSem(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              {(() => {
                const sems = selectedYear === "1" ? [1, 2] : selectedYear === "2" ? [3, 4] : selectedYear === "3" ? [5, 6] : [7, 8];
                return sems.map(s => (
                  <option key={s} value={String(s)}>Sem {s}</option>
                ));
              })()}
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Main Workspace Condition Check */}
      {loading ? (
        <Card className="p-12 text-center border rounded-2xl bg-card">
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading published examination schedule...</p>
        </Card>
      ) : !activeExam ? (
        /* STATE 1: NO PUBLISHED EXAM SCHEDULE FOUND */
        <Card className="bg-card border border-border/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[320px] shadow-xs space-y-3">
          <div className="size-12 rounded-full border-2 border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="font-display text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            No Published Examination Schedule Available
          </h3>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed font-semibold">
            No published examination schedule is available for <strong>{selectedDept} - Year {selectedYear}, Sem {selectedSem}</strong>. Please schedule and publish the exam under the <strong>"Schedule Exam"</strong> console first.
          </p>
        </Card>
      ) : (
        /* STATE 2: VALID PUBLISHED EXAM FOUND -> SHOW EDITOR */
        <div className="space-y-6">
          {/* Rejection Alert Banner if status is REJECTED */}
          {isRejected && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertCircle className="size-4 text-rose-600 shrink-0" />
                  <span className="font-extrabold uppercase">Timetable Status: REJECTED</span>
                </div>
                <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300 font-extrabold text-[10px]">
                  Requires Corrections
                </Badge>
              </div>
              <p className="text-xs font-semibold pl-6">
                <strong>Officer Rejection Reason:</strong> "{timetableState?.rejectionReason || "Hall allocation or timing conflict detected."}"
              </p>
              <p className="text-[11px] text-rose-700 pl-6">
                Please make the required adjustments to exam dates, sessions, or room allocations below and click <strong>"EDIT & RESUBMIT TIMETABLE"</strong>.
              </p>
            </div>
          )}

          {/* Active Schedule Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-white shadow-xs text-xs font-bold">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-450 uppercase text-[10px] font-black tracking-wider">ACTIVE SCHEDULE:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {activeExam.name}
              </span>
              <Badge className={
                isApproved
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-black"
                  : isPendingApproval
                  ? "bg-amber-50 text-amber-800 border-amber-200 font-black"
                  : isRejected
                  ? "bg-rose-50 text-rose-800 border-rose-200 font-black"
                  : "bg-indigo-50 text-indigo-800 border-indigo-200 font-black"
              }>
                {isApproved
                  ? "Approved & Published"
                  : isPendingApproval
                  ? "Pending Officer Approval"
                  : isRejected
                  ? "Rejected"
                  : "Published Exam Schedule Active"}
              </Badge>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Period: {activeExam.startDate} → {activeExam.endDate}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {!isApproved && !isPendingApproval && (
                <button
                  onClick={handleAddExamSlot}
                  className="px-3.5 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer flex items-center gap-1 font-extrabold text-xs"
                >
                  <Plus className="size-4" /> Add Exam Slot
                </button>
              )}

              {isPendingApproval ? (
                <Button
                  disabled
                  className="bg-amber-500 text-white rounded-xl h-9 font-extrabold text-[10px] uppercase tracking-wider opacity-90"
                >
                  <Clock className="size-3.5 mr-1" /> SUBMITTED FOR APPROVAL
                </Button>
              ) : isApproved ? (
                <Badge className="bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
                  <CheckCircle2 className="size-4" /> APPROVED & LIVE FOR STUDENTS
                </Badge>
              ) : (
                <Button
                  onClick={handleSaveAndSubmitTimetable}
                  disabled={isSubmitting}
                  className="bg-[#6366f1] hover:bg-indigo-700 text-white rounded-xl h-9.5 px-4 font-extrabold shadow-md cursor-pointer flex items-center gap-1.5 uppercase text-[10px] tracking-wider"
                >
                  <Save className="size-3.5" />
                  {isSubmitting
                    ? "Submitting..."
                    : isRejected
                    ? "EDIT & RESUBMIT TIMETABLE"
                    : "SAVE & SUBMIT TIMETABLE"}
                </Button>
              )}
            </div>
          </div>

          {/* Slots List Container */}
          <div className="space-y-5">
            {slots.length === 0 ? (
              <Card className="p-12 text-center border border-dashed rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
                <FileText className="size-8 text-slate-400" />
                <p className="font-bold text-slate-800 text-xs">No exam slots configured yet</p>
                <p className="text-[11px] text-muted-foreground max-w-sm">
                  Click <strong>"+ Add Exam Slot"</strong> above to assign exam dates and halls to offered subjects.
                </p>
              </Card>
            ) : (
              slots.map((slot, idx) => (
                <Card key={slot.id || idx} className="p-5 border border-slate-100 bg-white shadow-xs rounded-2xl space-y-4">
                  {/* Slot Header */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md tracking-wider">
                        EXAM SLOT #{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-900">
                        {slot.subjectCode} - {slot.subjectName}
                      </span>
                    </div>

                    {!isApproved && !isPendingApproval && (
                      <button
                        onClick={() => promptDeleteSlot(idx)}
                        className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> Delete Slot
                      </button>
                    )}
                  </div>

                  {/* Slot Fields */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs font-semibold text-slate-700">
                    
                    {/* READ ONLY SUBJECT CODE */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        SUBJECT CODE <span className="text-muted-foreground font-normal">(Read-Only)</span>
                      </label>
                      <Input
                        value={slot.subjectCode}
                        readOnly
                        disabled
                        className="h-10 text-xs font-mono font-extrabold bg-slate-100 text-slate-800 border-slate-200 rounded-xl cursor-not-allowed"
                      />
                    </div>

                    {/* READ ONLY SUBJECT NAME */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        SUBJECT NAME <span className="text-muted-foreground font-normal">(Read-Only)</span>
                      </label>
                      <Input
                        value={slot.subjectName}
                        readOnly
                        disabled
                        className="h-10 text-xs font-extrabold bg-slate-100 text-slate-800 border-slate-200 rounded-xl cursor-not-allowed"
                      />
                    </div>

                    {/* EXAM DATE */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        EXAM DATE <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        min={activeExam.startDate}
                        max={activeExam.endDate}
                        value={slot.examDate}
                        onChange={e => handleSlotChange(idx, "examDate", e.target.value)}
                        disabled={isApproved || isPendingApproval}
                        className="h-10 text-xs font-semibold rounded-xl bg-card border-border"
                      />
                    </div>

                    {/* SESSION SLOT */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        SESSION SLOT <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={slot.sessionSlot}
                        onChange={e => handleSlotChange(idx, "sessionSlot", e.target.value)}
                        disabled={isApproved || isPendingApproval}
                        className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2.5 text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:bg-slate-100 disabled:text-muted-foreground"
                      >
                        <option value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</option>
                        <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                      </select>
                    </div>

                    {/* EXAM HALLS */}
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        EXAM HALLS <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Block A - Room 101"
                          value={currentHallInput[idx] || ""}
                          onChange={e => setCurrentHallInput(prev => ({ ...prev, [idx]: e.target.value }))}
                          disabled={isApproved || isPendingApproval}
                          className="h-10 text-xs font-semibold rounded-xl"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddHall(idx);
                            }
                          }}
                        />
                        {!isApproved && !isPendingApproval && (
                          <Button 
                            type="button" 
                            onClick={() => handleAddHall(idx)}
                            className="bg-[#6366f1] hover:bg-indigo-700 text-white rounded-xl h-10 px-3 font-bold text-xs shrink-0 cursor-pointer"
                          >
                            + Add Hall
                          </Button>
                        )}
                      </div>

                      {/* Halls Chip List */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(slot.halls || []).map(hall => (
                          <span 
                            key={hall} 
                            className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <MapPin className="size-3 text-indigo-600" /> {hall}
                            {!isApproved && !isPendingApproval && (
                              <button 
                                type="button" 
                                onClick={() => handleRemoveHall(idx, hall)}
                                className="hover:text-rose-600 transition ml-0.5"
                                title="Remove hall"
                              >
                                <X className="size-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* DURATION */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                        DURATION
                      </label>
                      <select
                        value={slot.duration}
                        onChange={e => handleSlotChange(idx, "duration", e.target.value)}
                        disabled={isApproved || isPendingApproval}
                        className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2.5 text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:bg-slate-100 disabled:text-muted-foreground"
                      >
                        <option value="3 Hours">3 Hours</option>
                        <option value="2 Hours">2 Hours</option>
                        <option value="1.5 Hours">1.5 Hours</option>
                      </select>
                    </div>

                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* DELETE SLOT CONFIRMATION DIALOG */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-extrabold text-rose-600 flex items-center gap-2">
              <Trash2 className="size-5" /> Remove Timetable Slot?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-2 text-xs font-semibold text-slate-700 leading-relaxed">
            Are you sure you want to remove this timetable slot?
            <br />
            This will make the subject available again for <strong>"+ Add Exam Slot"</strong> without deleting the course from the catalog.
          </DialogDescription>
          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDeleteSlot}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl"
            >
              Remove Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
