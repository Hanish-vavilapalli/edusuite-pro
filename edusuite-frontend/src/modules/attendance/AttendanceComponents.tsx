import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BookOpen,
  UserCheck,
  UserX,
  ShieldCheck,
  Check,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRole } from "@/context/role-context";

import {
  fetchAttendanceStats,
  fetchAttendanceRecords,
  fetchAttendanceLedger,
  fetchClassRoster,
  submitClassAttendanceMark,
  exportAttendanceLogs,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  type AttendanceRecord,
  type AttendanceStats,
  type AttendanceLedgerItem,
  type ClassStudentRoster,
} from "./AttendanceService";

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
  const roleContext = useRole();
  const userRole = (roleContext?.role || "").toLowerCase();
  const userDept = roleContext?.department || roleContext?.profile?.department;
  const isHod = userRole === "hod" || userRole.includes("hod");

  const [activeSubpart, setActiveSubpart] = useState<AttendanceSubpart>(initialTab);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState(isHod && userDept ? userDept : "All Departments");
  const [selectedSec, setSelectedSec] = useState("All Sections");
  const [selectedRange, setSelectedRange] = useState<string>("All Ranges");
  const [loading, setLoading] = useState(false);

  // Subpart 1: All Classes Attendance Dashboard State
  const [allClassesAttendance, setAllClassesAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceViewMode, setAttendanceViewMode] = useState<"daily" | "weekly" | "monthly">("daily");

  // Subpart 2: Cascading Attendance Marking State
  const [studentRoster, setStudentRoster] = useState<ClassStudentRoster[]>([]);
  const [classList, setClassList] = useState<ClassOption[]>([]);
  const [selectedClassSem, setSelectedClassSem] = useState<string>("");
  const [sectionList, setSectionList] = useState<string[]>([]);
  const [selectedMarkSection, setSelectedMarkSection] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(2);
  const [markDate, setMarkDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // Subpart 3: Ledger State
  const [attendanceLedger, setAttendanceLedger] = useState<AttendanceLedgerItem[]>([]);

  // KPI Stats State
  const [stats, setStats] = useState<AttendanceStats>({
    averageAttendance: 0,
    presentToday: 0,
    absentToday: 0,
    shortageAlertsCount: 0,
    totalRecords: 0,
    date: new Date().toISOString().split("T")[0],
  });

  // Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAtt, setSelectedAtt] = useState<AttendanceRecord | null>(null);

  // Form State for Editing
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});

  const activeDept = isHod && userDept ? userDept : (selectedDept === "All Departments" ? "CSE" : selectedDept);

  // Auto-enforce HOD department
  useEffect(() => {
    if (isHod && userDept) {
      setSelectedDept(userDept);
    }
  }, [isHod, userDept]);

  // 1. Fetch available classes for department when activeDept changes
  useEffect(() => {
    async function loadClasses() {
      setLoadingClasses(true);
      try {
        const classes = await fetchDepartmentClasses(activeDept);
        setClassList(classes);
      } catch {
        toast.error("Failed to load department classes.");
      } finally {
        setLoadingClasses(false);
      }
    }
    loadClasses();
  }, [activeDept]);

  // 2. Fetch sections when selectedClassSem changes
  useEffect(() => {
    async function loadSections() {
      if (!selectedClassSem) {
        setSectionList([]);
        setSelectedMarkSection("");
        setStudentRoster([]);
        setSessionInfo(null);
        return;
      }
      setLoadingSections(true);
      setSelectedMarkSection("");
      setStudentRoster([]);
      setSessionInfo(null);
      try {
        const secs = await fetchClassSections(activeDept, selectedClassSem);
        setSectionList(secs);
      } catch {
        toast.error("Failed to load sections for selected class.");
      } finally {
        setLoadingSections(false);
      }
    }
    loadSections();
  }, [activeDept, selectedClassSem]);

  // 3. Fetch roster & session info when class, section, period & date are selected
  useEffect(() => {
    async function loadMarkingRoster() {
      if (!selectedClassSem || !selectedMarkSection) {
        setStudentRoster([]);
        setSessionInfo(null);
        return;
      }
      setLoadingRoster(true);
      try {
        const [sInfo, roster] = await Promise.all([
          fetchSessionInfo(activeDept, selectedClassSem, selectedMarkSection, selectedPeriod, markDate),
          fetchClassRoster(selectedClassSem, activeDept, selectedMarkSection, markDate, selectedPeriod),
        ]);
        setSessionInfo(sInfo);
        setStudentRoster(roster);
      } catch {
        toast.error("Failed to load student roster for selected section.");
      } finally {
        setLoadingRoster(false);
      }
    }
    loadMarkingRoster();
  }, [activeDept, selectedClassSem, selectedMarkSection, selectedPeriod, markDate]);

  const loadData = async (deptFilter = selectedDept, timeframe = attendanceViewMode, searchVal = search) => {
    setLoading(true);
    try {
      const activeDeptFilter = isHod && userDept ? userDept : deptFilter;
      const [fetchedStats, classesData, ledgerData] = await Promise.all([
        fetchAttendanceStats(activeDeptFilter, timeframe),
        fetchAttendanceRecords(activeDeptFilter, searchVal, timeframe),
        fetchAttendanceLedger(activeDeptFilter, selectedRange, searchVal, timeframe),
      ]);

      setStats(fetchedStats);
      setAllClassesAttendance(classesData);
      setAttendanceLedger(ledgerData);
    } catch (err: any) {
      toast.error("Failed to load attendance data from PostgreSQL backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDept, attendanceViewMode, search);
  }, [selectedDept, attendanceViewMode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    loadData(selectedDept, attendanceViewMode, val);
  };

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
    if (!selectedClassSem || !selectedMarkSection) {
      toast.error("Please select a class and section before submitting attendance.");
      return;
    }
    if (studentRoster.length === 0) {
      toast.error("No students enrolled in the selected section roster.");
      return;
    }

    setSubmittingAttendance(true);
    try {
      const presentCount = studentRoster.filter((s) => s.status === "Present").length;
      await submitClassAttendanceMark({
        timetableId: sessionInfo?.timetableId,
        date: markDate,
        periodNumber: selectedPeriod,
        records: studentRoster.map((s) => ({ studentId: s.id, status: s.status })),
      });

      const selectedClassObj = classList.find((c) => c.id === selectedClassSem);
      const classLabel = selectedClassObj ? selectedClassObj.label : `Sem ${selectedClassSem}`;
      toast.success(
        `Attendance recorded for ${activeDept} ${classLabel} Sec ${selectedMarkSection} (Period ${selectedPeriod})! ${presentCount}/${studentRoster.length} Present.`
      );

      // Re-fetch roster to verify database state
      const updatedRoster = await fetchClassRoster(selectedClassSem, activeDept, selectedMarkSection, markDate, selectedPeriod);
      setStudentRoster(updatedRoster);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to submit attendance to database: " + err.message);
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const filteredAllClassesAttendance = allClassesAttendance.filter((c) => {
    const matchesSearch =
      c.className?.toLowerCase().includes(search.toLowerCase()) ||
      c.department?.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor || c.classTeacher || "").toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "All Departments" || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const filteredLedger = attendanceLedger.filter((a) => {
    const matchesSearch =
      a.courseCode?.toLowerCase().includes(search.toLowerCase()) ||
      a.courseTitle?.toLowerCase().includes(search.toLowerCase()) ||
      a.department?.toLowerCase().includes(search.toLowerCase()) ||
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      a.instructor?.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === "All Departments" || a.department === selectedDept;
    const matchesSec = selectedSec === "All Sections" || a.section === selectedSec;

    return matchesSearch && matchesDept && matchesSec;
  });

  const handleOpenEdit = (a: AttendanceRecord) => {
    setSelectedAtt(a);
    setFormData({ ...a });
    setIsEditOpen(true);
  };

  const handleOpenView = (a: AttendanceRecord) => {
    setSelectedAtt(a);
    setIsViewOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtt) return;

    try {
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
      setIsEditOpen(false);
      toast.success(`Attendance log updated for ${selectedAtt.section}!`);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to update attendance record.");
    }
  };

  const handleGrantCondonation = async (a: AttendanceRecord) => {
    try {
      await updateAttendanceRecord(a.id, { status: "Condoned" });
      toast.info(`Condonation granted for attendance record ${a.section} (${a.courseCode}).`);
      await loadData();
    } catch (err: any) {
      toast.error("Failed to grant condonation.");
    }
  };

  const handleDelete = async (id: string, code: string, sec: string) => {
    if (confirm(`Are you sure you want to delete attendance record for ${sec} (${code})?`)) {
      try {
        await deleteAttendanceRecord(id);
        toast.success(`Attendance record ${id} deleted.`);
        await loadData();
      } catch (err: any) {
        toast.error("Failed to delete attendance record.");
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const dataToExport = await exportAttendanceLogs(
        isHod && userDept ? userDept : selectedDept,
        search,
        attendanceViewMode
      );

      if (!dataToExport || dataToExport.length === 0) {
        toast.info("No attendance logs available to export.");
        return;
      }

      const headers = Object.keys(dataToExport[0] || {});
      const rows = dataToExport.map((row) =>
        headers.map((h) => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`)
      );

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Attendance_Log_Report_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${dataToExport.length} attendance records from PostgreSQL!`);
    } catch (err: any) {
      toast.error("Failed to export attendance logs: " + err.message);
    }
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
              {isHod && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                  🔒 {userDept} Department Scope Enforced
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Daily class attendance marking, biometric sync, shortage alerts (&lt;75%), and HOD condonation approvals.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner (Mark Class Attendance REMOVED) */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
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
        </div>
      </div>

      {/* KPI Metrics - Dynamic from PostgreSQL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Institutional Average</span>
            <CalendarCheck className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">
            {loading ? "..." : `${stats.averageAttendance}% Avg`}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">Overall Campus Rate</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Present Today</span>
            <UserCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">
            {loading ? "..." : `${stats.presentToday} Present`}
          </p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">Biometric & RFID verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Absent / On Leave</span>
            <UserX className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">
            {loading ? "..." : `${stats.absentToday} Absent`}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">Recorded in today's sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Shortage Alerts (&lt;75%)</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">
            {loading ? "..." : `${stats.shortageAlertsCount} Classes Alert`}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">Requires HOD condonation</p>
        </div>
      </div>

      {/* THREE SUBPARTS NAVIGATION TAB BAR */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/60 border border-border/80 overflow-x-auto">
        <button
          onClick={() => setActiveSubpart("all-classes-attendance")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "all-classes-attendance"
              ? "bg-card text-primary shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="size-3.5" /> 🏛️ All Classes Attendance Dashboard
        </button>

        <button
          onClick={() => setActiveSubpart("attendance-mark")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "attendance-mark"
              ? "bg-card text-primary shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="size-3.5" /> 📝 Faculty Attendance Portal
        </button>

        {!isHod && (
          <button
            onClick={() => setActiveSubpart("records")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSubpart === "records"
                ? "bg-card text-primary shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarCheck className="size-3.5" /> 📊 Class Attendance Records Ledger
          </button>
        )}
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
                    attendanceViewMode === "daily"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📅 Daily View
                </button>
                <button
                  onClick={() => setAttendanceViewMode("weekly")}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    attendanceViewMode === "weekly"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📆 Weekly View
                </button>
                <button
                  onClick={() => setAttendanceViewMode("monthly")}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    attendanceViewMode === "monthly"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🗓️ Monthly View
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedDept}
                onValueChange={(val) => {
                  if (isHod && userDept && val !== userDept) {
                    toast.error(`HOD is restricted to ${userDept} department only.`);
                    return;
                  }
                  setSelectedDept(val);
                }}
                disabled={isHod}
              >
                <SelectTrigger className="h-9 text-xs w-[160px] rounded-xl">
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
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search class or teacher..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-8 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="size-5 animate-spin text-primary" />
                Loading PostgreSQL class attendance data...
              </div>
            ) : filteredAllClassesAttendance.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
                <CalendarCheck className="size-7 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">No matching class attendance records found.</p>
              </div>
            ) : (
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
                      const pct = c.percentage;
                      const isDefaulter = pct < 75;
                      return (
                        <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-foreground">{c.className || `${c.department}-${c.section}`}</td>
                          <td className="py-3 px-3 font-semibold">{c.department}</td>
                          <td className="py-3 px-3 font-mono">{c.totalStudents} Students</td>
                          <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{c.presentCount}</td>
                          <td className="py-3 px-3 font-mono text-rose-600 font-bold">{c.absentCount}</td>
                          <td className="py-3 px-3 font-mono text-amber-600 font-bold">{c.lateCount || 0}</td>
                          <td className="py-3 px-3 min-w-[130px]">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-2 flex-1" />
                              <span className={`font-mono text-xs font-bold ${isDefaulter ? "text-rose-600" : "text-emerald-600"}`}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{c.classTeacher || c.instructor}</td>
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
            )}
          </div>
        </div>
      )}

      {/* SUBPART 2: FACULTY & HOD ATTENDANCE MARKING PORTAL */}
      {activeSubpart === "attendance-mark" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-5 shadow-sm">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck className="size-4 text-primary" /> Period Attendance Marking Access
              </h2>
              <p className="text-xs text-muted-foreground">
                Select Class/Year, Section, Period and Date to record period-level student attendance into PostgreSQL.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllPresent}
                disabled={!selectedClassSem || !selectedMarkSection || studentRoster.length === 0}
                className="h-9 gap-1.5 text-xs font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" /> Mark All Present
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitAttendanceMark}
                disabled={submittingAttendance || !selectedClassSem || !selectedMarkSection || studentRoster.length === 0}
                className="h-9 bg-brand-gradient text-white gap-1.5 text-xs font-semibold shadow-glow disabled:opacity-50 cursor-pointer"
              >
                {submittingAttendance ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Submit Attendance
              </Button>
            </div>
          </div>

          {/* CASCADING SELECTION PANEL */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Filter className="size-3.5 text-primary" /> Attendance Session Selector
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              {/* Department (Fixed / Read-only for HOD) */}
              <div className="space-y-1">
                <label className="text-[0.68rem] font-bold text-muted-foreground uppercase">Department</label>
                <div className="h-9 px-3 py-2 rounded-xl bg-muted border border-border text-xs font-bold text-foreground flex items-center gap-2">
                  <Building2 className="size-3.5 text-primary" />
                  <span className="truncate">{activeDept}</span>
                  {isHod && <Badge variant="outline" className="ml-auto text-[0.65rem] py-0 bg-primary/10 text-primary border-primary/20">HOD Scope</Badge>}
                </div>
              </div>

              {/* Class / Year Dropdown */}
              <div className="space-y-1">
                <label className="text-[0.68rem] font-bold text-muted-foreground uppercase">Class / Year *</label>
                <Select value={selectedClassSem || undefined} onValueChange={setSelectedClassSem}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-card">
                    <SelectValue placeholder={loadingClasses ? "Loading classes..." : "[ Select Class / Year ▼ ]"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classList.length === 0 ? (
                      <SelectItem value="_empty" disabled className="text-xs text-muted-foreground">
                        {loadingClasses ? "Loading classes..." : `No classes for ${activeDept}`}
                      </SelectItem>
                    ) : (
                      classList.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs font-medium cursor-pointer">
                          {c.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Dropdown */}
              <div className="space-y-1">
                <label className="text-[0.68rem] font-bold text-muted-foreground uppercase">Section *</label>
                <Select
                  value={selectedMarkSection || undefined}
                  onValueChange={setSelectedMarkSection}
                  disabled={!selectedClassSem || loadingSections}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-card disabled:opacity-50">
                    <SelectValue placeholder={!selectedClassSem ? "Select Class First" : loadingSections ? "Loading..." : "[ Select Section ▼ ]"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionList.length === 0 ? (
                      <SelectItem value="_empty_sec" disabled className="text-xs text-muted-foreground">
                        {loadingSections ? "Loading sections..." : "No sections available"}
                      </SelectItem>
                    ) : (
                      sectionList.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs font-semibold cursor-pointer">
                          Section {s}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Dropdown */}
              <div className="space-y-1">
                <label className="text-[0.68rem] font-bold text-muted-foreground uppercase">Period / Session</label>
                <Select value={String(selectedPeriod)} onValueChange={(val) => setSelectedPeriod(Number(val))}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-card">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                      <SelectItem key={p} value={String(p)} className="text-xs">
                        Period {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[0.68rem] font-bold text-muted-foreground uppercase">Date</label>
                <Input
                  type="date"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                  className="h-9 text-xs rounded-xl bg-card"
                />
              </div>
            </div>

            {/* Timetable Session Banner */}
            {selectedClassSem && selectedMarkSection && (
              <div className="p-3 rounded-xl bg-card border border-border/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-[0.68rem] bg-primary/10 text-primary border-primary/20 font-bold">
                    Class: {activeDept}-{classList.find((c) => c.id === selectedClassSem)?.label || `Sem ${selectedClassSem}`} &bull; Sec {selectedMarkSection}
                  </Badge>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" /> Period {selectedPeriod}
                  </span>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="font-mono text-muted-foreground flex items-center gap-1">
                    <CalendarCheck className="size-3 text-muted-foreground" /> {markDate}
                  </span>
                </div>

                {sessionInfo && (
                  <div className="text-[0.72rem] font-medium text-muted-foreground flex items-center gap-2">
                    {sessionInfo.hasSubject ? (
                      <>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <BookOpen className="size-3" /> {sessionInfo.subjectName} ({sessionInfo.subjectCode})
                        </span>
                        <span>&bull;</span>
                        <span className="text-foreground font-semibold flex items-center gap-1">
                          <UserCheck className="size-3 text-muted-foreground" /> {sessionInfo.facultyName}
                        </span>
                        <span>&bull;</span>
                        <span className="font-mono flex items-center gap-1">
                          Room: {sessionInfo.room}
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-600 font-medium italic flex items-center gap-1">
                        <AlertTriangle className="size-3" /> {sessionInfo.message || "No timetable subject assigned for this period."}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SUMMARY COUNTERS BAR */}
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-muted/30 border border-border/60">
            <div className="flex items-center gap-4 font-semibold">
              <span className="text-emerald-600">Present: {studentRoster.filter((s) => s.status === "Present").length}</span>
              <span className="text-rose-600">Absent: {studentRoster.filter((s) => s.status === "Absent").length}</span>
              <span className="text-amber-600">Late: {studentRoster.filter((s) => s.status === "Late").length}</span>
            </div>
            <span className="font-mono text-muted-foreground">Total Enrolled: {studentRoster.length} Students</span>
          </div>

          {/* STUDENT ROSTER TABLE OR EMPTY/UNSELECTED STATE */}
          {!selectedClassSem || !selectedMarkSection ? (
            <div className="p-10 text-center border border-dashed border-border rounded-xl space-y-3 bg-muted/10">
              <div className="size-10 rounded-full bg-amber-500/10 text-amber-600 grid place-items-center mx-auto">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Class & Section Selection Required</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Select a Class / Year and Section from the dropdown controls above to load the enrolled student roster and mark attendance.
                </p>
              </div>
            </div>
          ) : loadingRoster ? (
            <div className="p-10 text-center border border-dashed border-border rounded-xl space-y-2">
              <RefreshCw className="size-6 text-primary animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">Loading enrolled PostgreSQL student roster...</p>
            </div>
          ) : studentRoster.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-border rounded-xl space-y-2 bg-muted/10">
              <UserCheck className="size-7 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">
                No active students enrolled in {activeDept} Class {selectedClassSem} Section {selectedMarkSection}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                  <tr>
                    <th className="py-3 px-3">Roll Number</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3 text-center">Attendance Status Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {studentRoster.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-foreground">{s.rollNo}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">{s.name}</td>
                      <td className="py-3 px-3 text-muted-foreground">{s.department}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
                          <button
                            onClick={() => handleToggleAttendance(s.id, "Present")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              s.status === "Present"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            P (Present)
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(s.id, "Absent")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              s.status === "Absent"
                                ? "bg-rose-600 text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            A (Absent)
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(s.id, "Late")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              s.status === "Late"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
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
          )}
        </div>
      )}

      {/* SUBPART 3: CLASS ATTENDANCE RECORDS LEDGER */}
      {!isHod && activeSubpart === "records" && (
        <div className="space-y-4">
          {/* Control Bar & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search student, roll no, course code, section..."
                  value={search}
                  onChange={handleSearchChange}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Department Filter */}
              <Select
                value={selectedDept}
                onValueChange={(val) => {
                  if (isHod && userDept && val !== userDept) {
                    toast.error(`HOD is restricted to ${userDept} department only.`);
                    return;
                  }
                  setSelectedDept(val);
                }}
                disabled={isHod}
              >
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
                  {filteredLedger.length} Sessions Logged
                </Badge>
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="size-5 animate-spin text-primary" />
                Loading attendance ledger records...
              </div>
            ) : filteredLedger.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
                <CalendarCheck className="size-7 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">No attendance ledger records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                    <tr>
                      <th className="py-3 px-3">Date & ID</th>
                      <th className="py-3 px-3">Student & Roll No</th>
                      <th className="py-3 px-3">Course & Section</th>
                      <th className="py-3 px-3">Instructor</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredLedger.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-foreground">{a.date}</div>
                          <div className="text-[0.68rem] text-muted-foreground font-mono">Period {a.periodNumber}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-foreground">{a.studentName}</div>
                          <div className="text-[0.68rem] text-muted-foreground font-mono">{a.rollNo}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-foreground">{a.courseCode}: {a.courseTitle}</div>
                          <div className="text-[0.68rem] text-muted-foreground">
                            <span className="font-bold text-foreground">{a.department}</span> &middot; {a.section || "CSE-A"}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-foreground">{a.instructor}</td>
                        <td className="py-3 px-3">
                          <Badge
                            className={
                              a.status === "Present"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                                : a.status === "Condoned"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[0.68rem]"
                                : a.status === "Late"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.68rem]"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20 text-[0.68rem]"
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
                              onClick={() => handleOpenView({
                                id: a.id,
                                date: a.date,
                                courseCode: a.courseCode,
                                courseTitle: a.courseTitle,
                                department: a.department,
                                section: a.section || "CSE-A",
                                instructor: a.instructor,
                                totalStudents: 60,
                                presentCount: a.status === "Present" ? 1 : 0,
                                absentCount: a.status === "Absent" ? 1 : 0,
                                percentage: a.status === "Present" ? 100 : 0,
                                status: a.status,
                              })}
                              className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                              title="View Details"
                            >
                              <Eye className="size-3.5" /> Details
                            </Button>

                            {a.status === "Absent" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGrantCondonation({
                                  id: a.id,
                                  date: a.date,
                                  courseCode: a.courseCode,
                                  courseTitle: a.courseTitle,
                                  department: a.department,
                                  section: a.section || "CSE-A",
                                  instructor: a.instructor,
                                  totalStudents: 60,
                                  presentCount: 0,
                                  absentCount: 1,
                                  percentage: 0,
                                  status: a.status,
                                })}
                                className="h-7 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
                              >
                                <ShieldCheck className="size-3" /> Condone
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(a.id, a.courseCode, a.section || "CSE-A")}
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

      {/* DIALOG 1: EDIT ATTENDANCE MODAL */}
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

      {/* DIALOG 2: VIEW ATTENDANCE DOSSIER MODAL */}
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
                      selectedAtt.status === "Submitted" || selectedAtt.status === "Present"
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
