import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Plus,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  BookOpen,
  UserCheck,
  UserX,
  Award,
  ShieldCheck,
  Sparkles,
  Check,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  fetchAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  INITIAL_ATTENDANCE,
  type AttendanceRecord,
} from "./AttendanceService";

import {
  fetchAllClassesAttendance,
  fetchClassStudents,
  submitAttendanceMark,
  type AllClassesAttendance,
  type ClassStudent,
} from "@/modules/academics/AcademicsService";

const DEPARTMENTS = [
  "All Departments",
  "CSE",
  "ECE",
  "ME",
  "AI&DS",
  "Biotech",
];

const SECTIONS = [
  "All Sections",
  "CSE-A",
  "ECE-B",
  "ME-A",
  "AIDS-A",
  "BIO-A",
];

const RANGES = ["All Ranges", "Above 90%", "75% - 90%", "Below 75% Shortage"] as const;

export type AttendanceSubpart =
  | "all-classes-attendance"
  | "attendance-mark"
  | "records";

export function AttendanceModuleView({ initialTab = "all-classes-attendance" }: { initialTab?: AttendanceSubpart }) {
  const [activeSubpart, setActiveSubpart] = useState<AttendanceSubpart>(initialTab);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedSec, setSelectedSec] = useState("All Sections");
  const [selectedRange, setSelectedRange] = useState<string>("All Ranges");
  const [loading, setLoading] = useState(false);

  // Subpart 1: All Classes Attendance Dashboard State
  const [allClassesAttendance, setAllClassesAttendance] = useState<AllClassesAttendance[]>([]);
  const [attendanceViewMode, setAttendanceViewMode] = useState<"daily" | "weekly" | "monthly">("daily");

  // Subpart 2: Faculty Attendance Portal State
  const [studentRoster, setStudentRoster] = useState<ClassStudent[]>([]);
  const [selectedClass, setSelectedClass] = useState("CSE-5A");
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAtt, setSelectedAtt] = useState<AttendanceRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({
    date: new Date().toISOString().split("T")[0] || "",
    courseCode: "CS401",
    courseTitle: "Advanced Artificial Intelligence & Deep Learning",
    department: "CSE",
    section: "CSE-A",
    instructor: "Dr. K. Sai Teja",
    totalStudents: 60,
    presentCount: 56,
    status: "Submitted",
  });

  const loadData = async () => {
    setLoading(true);
    const [data, allClasses, students] = await Promise.all([
      fetchAttendanceRecords(),
      fetchAllClassesAttendance(),
      fetchClassStudents("CSE-5A"),
    ]);
    setAttendance(data);
    setAllClassesAttendance(allClasses);
    setStudentRoster(students);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAttendance = (studentId: string, status: "Present" | "Absent" | "Late") => {
    setStudentRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setStudentRoster((prev) => prev.map((s) => ({ ...s, status: "Present" })));
    toast.success("Marked all students in class as Present!");
  };

  const handleSubmitAttendanceMark = async () => {
    setSubmittingAttendance(true);
    const presentCount = studentRoster.filter((s) => s.status === "Present").length;
    await submitAttendanceMark({
      classId: "CSE-5A",
      subjectId: "CS302",
      date: new Date().toISOString().split("T")[0] || "",
      period: 2,
      records: studentRoster.map((s) => ({ studentId: s.id, status: s.status })),
    });
    setSubmittingAttendance(false);
    toast.success(`Period 2 Attendance Submitted for CSE-5A! ${presentCount}/${studentRoster.length} Present.`);
  };

  const filteredAllClassesAttendance = allClassesAttendance.filter((c) => {
    const matchesSearch =
      c.className.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.classTeacher.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "All Departments" || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Filtered Roster
  const filtered = attendance.filter((a) => {
    const matchesSearch =
      a.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      a.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase()) ||
      a.section.toLowerCase().includes(search.toLowerCase()) ||
      a.instructor.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === "All Departments" || a.department === selectedDept;
    const matchesSec = selectedSec === "All Sections" || a.section === selectedSec;

    let matchesRange = true;
    if (selectedRange === "Above 90%") matchesRange = a.percentage >= 90;
    else if (selectedRange === "75% - 90%") matchesRange = a.percentage >= 75 && a.percentage < 90;
    else if (selectedRange === "Below 75% Shortage") matchesRange = a.percentage < 75;

    return matchesSearch && matchesDept && matchesSec && matchesRange;
  });

  // KPI Metrics
  const avgAttendance =
    attendance.length > 0
      ? (attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length).toFixed(1)
      : "88.4";

  const totalPresentToday = attendance.reduce((sum, a) => sum + a.presentCount, 0);
  const totalAbsentToday = attendance.reduce((sum, a) => sum + a.absentCount, 0);
  const shortageCount = attendance.filter((a) => a.percentage < 75).length;

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0] || "",
      courseCode: "CS405",
      courseTitle: "Cloud Computing & Microservices",
      department: "CSE",
      section: "CSE-B",
      instructor: "Dr. S. K. Gupta",
      totalStudents: 60,
      presentCount: 55,
      status: "Submitted",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (a: AttendanceRecord) => {
    setSelectedAtt(a);
    setFormData({ ...a });
    setIsEditOpen(true);
  };

  const handleOpenView = (a: AttendanceRecord) => {
    setSelectedAtt(a);
    setIsViewOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseCode || !formData.section) {
      toast.error("Please enter course code and section.");
      return;
    }

    const created = await createAttendanceRecord(formData);
    setAttendance((prev) => [created, ...prev]);
    setIsAddOpen(false);
    toast.success(`Attendance submitted for ${created.section} (${created.courseCode}): ${created.presentCount}/${created.totalStudents} Present!`);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtt) return;

    const total = Number(formData.totalStudents) || selectedAtt.totalStudents;
    const present = Number(formData.presentCount) || selectedAtt.presentCount;
    const absent = total - present;
    const pct = Number(((present / total) * 100).toFixed(1));

    const updated = {
      ...formData,
      totalStudents: total,
      presentCount: present,
      absentCount: absent,
      percentage: pct,
    };

    await updateAttendanceRecord(selectedAtt.id, updated);
    setAttendance((prev) =>
      prev.map((a) => (a.id === selectedAtt.id ? ({ ...a, ...updated } as AttendanceRecord) : a)),
    );
    setIsEditOpen(false);
    toast.success(`Attendance log updated for ${selectedAtt.section}!`);
  };

  const handleGrantCondonation = async (a: AttendanceRecord) => {
    await updateAttendanceRecord(a.id, { status: "Condoned" });
    setAttendance((prev) =>
      prev.map((item) => (item.id === a.id ? { ...item, status: "Condoned" } : item)),
    );
    toast.info(`Medical Condonation granted for attendance record ${a.section} (${a.courseCode}).`);
  };

  const handleDelete = async (id: string, code: string, sec: string) => {
    if (confirm(`Are you sure you want to delete attendance record for ${sec} (${code})?`)) {
      await deleteAttendanceRecord(id);
      setAttendance((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Attendance record ${id} deleted.`);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Attendance ID",
      "Date",
      "Course Code",
      "Course Title",
      "Department",
      "Section",
      "Lead Instructor",
      "Total Students",
      "Present Count",
      "Absent Count",
      "Attendance %",
      "Status",
    ];

    const rows = filtered.map((a) => [
      a.id,
      a.date,
      a.courseCode,
      `"${a.courseTitle}"`,
      a.department,
      a.section,
      `"${a.instructor}"`,
      a.totalStudents,
      a.presentCount,
      a.absentCount,
      `${a.percentage}%`,
      a.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Attendance_Ledger_Report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} attendance logs to CSV!`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <CalendarCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Attendance & Biometric Tracking Module
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                Institutional Attendance Core
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Daily class attendance marking, biometric sync, shortage alerts (&lt;75%), and HOD condonation approvals.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <Download className="size-3.5" /> Export Attendance Log
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow hover:opacity-95"
          >
            <Plus className="size-4" /> Mark Class Attendance
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Institutional Average</span>
            <CalendarCheck className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{avgAttendance}% Avg</p>
          <p className="text-[0.68rem] text-muted-foreground">Overall Campus Rate</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Present Today</span>
            <UserCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">{totalPresentToday} Present</p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">Biometric & RFID verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Absent / On Leave</span>
            <UserX className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">{totalAbsentToday} Absent</p>
          <p className="text-[0.68rem] text-muted-foreground">Recorded in today's sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Shortage Alerts (&lt;75%)</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">{shortageCount} Classes Alert</p>
          <p className="text-[0.68rem] text-muted-foreground">Requires HOD condonation</p>
        </div>
      </div>

      {/* THREE SUBPARTS NAVIGATION TAB BAR */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/60 border border-border/80 overflow-x-auto">
        <button
          onClick={() => setActiveSubpart("all-classes-attendance")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "all-classes-attendance" ? "bg-card text-primary shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="size-3.5" /> 🏛️ All Classes Attendance Dashboard
        </button>

        <button
          onClick={() => setActiveSubpart("attendance-mark")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "attendance-mark" ? "bg-card text-primary shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-3.5" /> 📝 Faculty Attendance Portal
        </button>

        <button
          onClick={() => setActiveSubpart("records")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "records" ? "bg-card text-primary shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarCheck className="size-3.5" /> 📊 Class Attendance Records Ledger
        </button>
      </div>

      {/* SUBPART 1: ALL CLASSES ATTENDANCE DASHBOARD */}
      {activeSubpart === "all-classes-attendance" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase shrink-0">Timeframe:</span>
              <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/60">
                <button
                  onClick={() => setAttendanceViewMode("daily")}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    attendanceViewMode === "daily" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📅 Daily View
                </button>
                <button
                  onClick={() => setAttendanceViewMode("weekly")}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    attendanceViewMode === "weekly" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📆 Weekly View
                </button>
                <button
                  onClick={() => setAttendanceViewMode("monthly")}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    attendanceViewMode === "monthly" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🗓️ Monthly View
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="h-9 text-xs w-[160px] rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (<SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input placeholder="Search class or teacher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-xs rounded-xl" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                  <tr>
                    <th className="py-3 px-3">Class / Section</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Total Enrolled</th>
                    <th className="py-3 px-3">Present</th>
                    <th className="py-3 px-3">Absent</th>
                    <th className="py-3 px-3">Late</th>
                    <th className="py-3 px-3">Attendance % ({attendanceViewMode.toUpperCase()})</th>
                    <th className="py-3 px-3">Class Teacher</th>
                    <th className="py-3 px-3">Governance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredAllClassesAttendance.map((c) => {
                    const pct = attendanceViewMode === "daily" ? c.dailyPct : attendanceViewMode === "weekly" ? c.weeklyPct : c.monthlyPct;
                    const isDefaulter = pct < 75;
                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{c.className}</td>
                        <td className="py-3 px-3 font-semibold">{c.department}</td>
                        <td className="py-3 px-3 font-mono">{c.totalStudents} Students</td>
                        <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{c.presentCount}</td>
                        <td className="py-3 px-3 font-mono text-rose-600 font-bold">{c.absentCount}</td>
                        <td className="py-3 px-3 font-mono text-amber-600 font-bold">{c.lateCount}</td>
                        <td className="py-3 px-3 min-w-[130px]">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-2 flex-1" />
                            <span className={`font-mono text-xs font-bold ${isDefaulter ? "text-rose-600" : "text-emerald-600"}`}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{c.classTeacher}</td>
                        <td className="py-3 px-3">
                          {isDefaulter ? (
                            <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/30">
                              ⚠️ &lt;75% Defaulter Alert
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600">
                              ✅ Satisfactory ({pct}%)
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBPART 2: FACULTY ATTENDANCE MARKING PORTAL */}
      {activeSubpart === "attendance-mark" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck className="size-4 text-primary" /> Period Attendance Marking Access
              </h2>
              <p className="text-xs text-muted-foreground">
                Class: <strong className="text-foreground">{selectedClass}</strong> • Data Structures & Algorithms • Date: {new Date().toLocaleDateString()} (Period 2)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleMarkAllPresent} className="h-9 gap-1.5 text-xs font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-50">
                <CheckCircle2 className="size-3.5 text-emerald-500" /> Mark All Present
              </Button>
              <Button size="sm" onClick={handleSubmitAttendanceMark} disabled={submittingAttendance} className="h-9 bg-brand-gradient text-white gap-1.5 text-xs font-semibold shadow-glow">
                {submittingAttendance ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Submit Attendance
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex items-center gap-4 font-semibold">
              <span className="text-emerald-600">Present: {studentRoster.filter((s) => s.status === "Present").length}</span>
              <span className="text-rose-600">Absent: {studentRoster.filter((s) => s.status === "Absent").length}</span>
              <span className="text-amber-600">Late: {studentRoster.filter((s) => s.status === "Late").length}</span>
            </div>
            <span className="font-mono text-muted-foreground">Total Enrolled: {studentRoster.length} Students</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Roll Number</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3 text-center">Attendance Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {studentRoster.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{s.rollNo}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">{s.name}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
                        <button
                          onClick={() => handleToggleAttendance(s.id, "Present")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            s.status === "Present" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          P (Present)
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(s.id, "Absent")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            s.status === "Absent" ? "bg-rose-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          A (Absent)
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(s.id, "Late")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            s.status === "Late" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          L (Late)
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBPART 3: CLASS ATTENDANCE RECORDS LEDGER */}
      {activeSubpart === "records" && (
        <div className="space-y-4">
          {/* Control Bar & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search course code, title, section, instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Department Filter */}
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs">
              <Building2 className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Section Filter */}
          <Select value={selectedSec} onValueChange={setSelectedSec}>
            <SelectTrigger className="h-9 w-full sm:w-[140px] text-xs">
              <BookOpen className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Range Filter */}
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Attendance Range" />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r} value={r} className="text-xs">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary" /> Daily Attendance Ledger
            <Badge variant="secondary" className="font-mono text-xs">
              {filtered.length} Sessions Logged
            </Badge>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="size-5 animate-spin text-primary" />
            Loading attendance records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
            <CalendarCheck className="size-7 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">No attendance logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Date & ID</th>
                  <th className="py-3 px-3">Course & Section</th>
                  <th className="py-3 px-3">Lead Instructor</th>
                  <th className="py-3 px-3">Present / Enrolled</th>
                  <th className="py-3 px-3">Attendance %</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-foreground">{a.date}</div>
                      <div className="text-[0.68rem] text-muted-foreground font-mono">{a.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{a.courseCode}: {a.courseTitle}</div>
                      <div className="text-[0.68rem] text-muted-foreground">
                        <span className="font-bold text-foreground">{a.department}</span> &middot; {a.section}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">{a.instructor}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className="text-emerald-600">{a.presentCount}</span> / {a.totalStudents}
                      <span className="text-[0.68rem] text-muted-foreground font-sans ml-1">({a.absentCount} Absent)</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sm">
                      <span className={a.percentage < 75 ? "text-amber-600 font-bold" : "text-emerald-600"}>
                        {a.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        className={
                          a.status === "Submitted"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                            : a.status === "Condoned"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[0.68rem]"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.68rem]"
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(a)}
                          className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="size-3.5" /> Details
                        </Button>

                        {a.percentage < 75 && a.status !== "Condoned" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGrantCondonation(a)}
                            className="h-7 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
                          >
                            <ShieldCheck className="size-3" /> Condone
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(a)}
                          className="size-7 text-muted-foreground hover:text-primary"
                          title="Edit Record"
                        >
                          <Edit className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(a.id, a.courseCode, a.section)}
                          className="size-7 text-muted-foreground hover:text-red-600"
                          title="Delete Log"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )}

      {/* DIALOG 1: MARK CLASS ATTENDANCE MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Submit Class Attendance Log
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record date, department, section strength, and present student counts for the session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input
                  type="date"
                  required
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Course Code *</Label>
                <Input
                  required
                  placeholder="e.g. CS405"
                  value={formData.courseCode || ""}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Course Title</Label>
                <Input
                  placeholder="e.g. Cloud Computing & Microservices"
                  value={formData.courseTitle || ""}
                  onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department</Label>
                <Select
                  value={formData.department || ""}
                  onValueChange={(val) => setFormData({ ...formData, department: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((d) => (
                      <SelectItem key={d} value={d} className="text-xs">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Section / Batch *</Label>
                <Input
                  required
                  placeholder="e.g. CSE-B"
                  value={formData.section || ""}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Instructor</Label>
                <Input
                  placeholder="e.g. Dr. S. K. Gupta"
                  value={formData.instructor || ""}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Total Students</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.totalStudents ?? 60}
                  onChange={(e) =>
                    setFormData({ ...formData, totalStudents: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Present Count</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.presentCount ?? 55}
                  onChange={(e) =>
                    setFormData({ ...formData, presentCount: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Submit Attendance Log
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT ATTENDANCE MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit className="size-5 text-primary" /> Update Class Attendance ({selectedAtt?.section})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Total Students</Label>
              <Input
                type="number"
                value={formData.totalStudents ?? selectedAtt?.totalStudents ?? 60}
                onChange={(e) =>
                  setFormData({ ...formData, totalStudents: Number(e.target.value) })
                }
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Present Count</Label>
              <Input
                type="number"
                value={formData.presentCount ?? selectedAtt?.presentCount ?? 54}
                onChange={(e) =>
                  setFormData({ ...formData, presentCount: Number(e.target.value) })
                }
                className="h-9 text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: VIEW ATTENDANCE DOSSIER MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" /> Attendance Session Dossier
            </DialogTitle>
          </DialogHeader>

          {selectedAtt && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedAtt.section} &middot; {selectedAtt.date}
                  </Badge>
                  <Badge
                    className={
                      selectedAtt.status === "Submitted"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }
                  >
                    {selectedAtt.status}
                  </Badge>
                </div>
                <h2 className="text-base font-bold text-foreground">
                  {selectedAtt.courseCode}: {selectedAtt.courseTitle}
                </h2>
                <p className="text-xs text-primary font-medium">Instructor: {selectedAtt.instructor}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60 font-mono">
                  <span className="text-muted-foreground font-sans">Session Attendance Rate:</span>
                  <span className={`font-bold text-base ${selectedAtt.percentage < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                    {selectedAtt.percentage}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[0.68rem] text-emerald-700 font-sans block">Present Students</span>
                    <span className="font-bold text-base text-emerald-700">{selectedAtt.presentCount}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-[0.68rem] text-red-700 font-sans block">Absent Students</span>
                    <span className="font-bold text-base text-red-700">{selectedAtt.absentCount}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewOpen(false)}
                  className="w-full text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
