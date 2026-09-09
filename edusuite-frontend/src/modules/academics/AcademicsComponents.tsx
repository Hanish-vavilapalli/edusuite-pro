import React, { useEffect, useState, useMemo } from "react";
import { useAcademic } from "@/context/academic-context";
import { useRole } from "@/context/role-context";
import api from "@/lib/api";
import { getDashboardData, type AcademicDashboardData } from "./AcademicsDashboardService";
import {
  GraduationCap,
  Plus,
  BookOpen,
  Layers,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  Award,
  Clock,
  CheckCircle,
  Building2,
  Bookmark,
  Sparkles,
  Users,
  FlaskConical,
  ShieldCheck,
  Calendar,
  PieChart,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  UserCheck,
  UserX,
  Play,
  RotateCcw,
  BarChart2,
  CalendarDays,
  CalendarRange,
  ExternalLink,
  MapPin,
  Mail,
  User,
  Coffee,
  X,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  fetchAcademicCourses,
  fetchAcademicDepartments,
  fetchCurriculumSchemes,
  fetchLiveFacultyStatus,
  fetchClassStudents,
  submitAttendanceMark,
  fetchSyllabusProgress,
  updateSyllabusUnitStatus,
  fetchAllClassesAttendance,
  fetchFacultyFullDaySchedule,
  createAcademicCourse,
  createAcademicDepartment,
  createCurriculumScheme,
  updateAcademicCourse,
  deleteAcademicCourse,
  INITIAL_COURSES,
  INITIAL_DEPARTMENTS,
  INITIAL_CURRICULUM_SCHEMES,
  INITIAL_FACULTY_STATUS,
  INITIAL_CLASS_STUDENTS,
  INITIAL_SYLLABUS_PROGRESS,
  INITIAL_ALL_CLASSES_ATTENDANCE,
  getSubjects,
  getCurriculum,
  type AcademicCourse,
  type AcademicDepartment,
  type CurriculumScheme,
  type LiveFacultyStatus,
  type ClassStudentAttendance,
  type SyllabusProgress,
  type SyllabusUnit,
  type AllClassesAttendanceItem,
  type FacultyFullDaySchedule,
} from "./AcademicsService";

const DEPARTMENTS_LIST = [
  "All Departments",
  "CSE",
  "ECE",
  "EEE",
  "ME",
  "CIVIL",
  "IT",
  "AI&ML",
  "AI&DS",
  "MBA",
];

export type AcademicsSubpart = "departments" | "courses" | "curriculum";

export function AcademicsModuleView({ initialTab }: { initialTab?: AcademicsSubpart }) {
  const { selectedDepartment, setSelectedDepartment } = useAcademic();
  const { role, flags, department: userDept, profile } = useRole();

  const isHod = role === "hod" || flags?.includes("isHod");
  const isSuperAdmin = role === "super-admin" || role === "super_admin" || flags?.includes("isSystemAdmin");
  const hodDeptCode = userDept || (profile?.department as string) || "CSE";

  const [courses, setCourses] = useState<AcademicCourse[]>(INITIAL_COURSES);
  const [departments, setDepartments] = useState<AcademicDepartment[]>(INITIAL_DEPARTMENTS);
  const [curriculumSchemes, setCurriculumSchemes] = useState<CurriculumScheme[]>(INITIAL_CURRICULUM_SCHEMES);
  const [deptStats, setDeptStats] = useState<{
    scope: string;
    departmentCode?: string;
    departmentName?: string;
    hodName?: string;
    facultyCount?: number;
    coursesCount?: number;
    activeSectionsCount?: number;
    studentCount?: number;
    syllabusProgressPct?: number;
    accreditationStandard?: string;
  } | null>(null);

  // Active Subpart Tab
  const [activeSubpart, setActiveSubpart] = useState<AcademicsSubpart>(initialTab || "departments");

  // Filters & Loading
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All Departments");
  const [selectedSemFilter, setSelectedSemFilter] = useState("All Semesters");
  const [loading, setLoading] = useState(false);

  // Dynamic Semester mapping based on active department
  const semestersList = useMemo(() => {
    const isMba = selectedDepartment === "MBA";
    const maxSem = isMba ? 4 : 8;
    const list = ["All Semesters"];
    for (let i = 1; i <= maxSem; i++) {
      list.push(`Semester ${i}`);
    }
    return list;
  }, [selectedDepartment]);

  // Synchronize local filter selectedDeptFilter with global context selection
  useEffect(() => {
    setSelectedDeptFilter(selectedDepartment);
  }, [selectedDepartment]);

  // Reset selected semester if it falls outside the mapped semesters list of the department
  useEffect(() => {
    if (!semestersList.includes(selectedSemFilter)) {
      setSelectedSemFilter("All Semesters");
    }
  }, [semestersList, selectedSemFilter]);

  // Fetch filtered courses and curriculum schemes
  useEffect(() => {
    let active = true;
    const fetchCoursesAndCurriculum = async () => {
      setLoading(true);
      try {
        const [crs, cur] = await Promise.all([
          getSubjects({
            department: selectedDepartment,
            semester: selectedSemFilter !== "All Semesters" ? selectedSemFilter : undefined,
            search: searchQuery || undefined,
          }),
          getCurriculum(selectedDepartment),
        ]);
        if (active) {
          setCourses(crs);
          setCurriculumSchemes(cur);
        }
      } catch (err) {
        toast.error("Failed to load subjects or curriculum.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCoursesAndCurriculum();

    return () => {
      active = false;
    };
  }, [selectedDepartment, selectedSemFilter, searchQuery]);

  // Fetch static departments list once
  useEffect(() => {
    let active = true;
    fetchAcademicDepartments().then((dps) => {
      if (active) setDepartments(dps);
    });
    return () => {
      active = false;
    };
  }, []);

  // Dialog States
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isAddSchemeOpen, setIsAddSchemeOpen] = useState(false);

  // Forms
  const [courseForm, setCourseForm] = useState<Partial<AcademicCourse>>({
    code: "",
    name: "",
    department: "CSE",
    semester: "Semester 5",
    credits: 3,
    type: "Core Theory",
    instructor: "",
    regulations: "R24 Regulation",
    prerequisite: "",
    syllabusOverview: "",
  });

  const [deptForm, setDeptForm] = useState<Partial<AcademicDepartment>>({
    code: "",
    name: "",
    hodName: "",
    facultyCount: 30,
    studentCapacity: 480,
    laboratoriesCount: 6,
    accreditation: "NAAC A+",
    establishedYear: "2026",
  });

  const [schemeForm, setSchemeForm] = useState<Partial<CurriculumScheme>>({
    regulationCode: "R24 Regulation",
    programName: "",
    effectiveBatch: "2024-2028",
    totalCredits: 160,
    coreTheoryCredits: 80,
    labCredits: 32,
    electiveCredits: 28,
    projectCredits: 20,
  });

  useEffect(() => {
    if (initialTab) {
      setActiveSubpart(initialTab);
    }
  }, [initialTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [crs, dpt, sch, statsRes] = await Promise.all([
        fetchAcademicCourses(),
        fetchAcademicDepartments(),
        fetchCurriculumSchemes(),
        api.get("/api/academics/stats").catch(() => null),
      ]);
      setCourses(crs);
      setDepartments(dpt);
      setCurriculumSchemes(sch);
      if (statsRes?.data) {
        setDeptStats(statsRes.data);
      }
    } catch (err) {
      console.error("Error loading academics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered lists
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const deptNorm = (c.department || "").trim().toUpperCase();
    const filterNorm = (selectedDeptFilter || "").trim().toUpperCase();
    const matchesDept =
      selectedDeptFilter === "All Departments" ||
      deptNorm === filterNorm ||
      (filterNorm === "ME" && (deptNorm === "MECHANICAL" || deptNorm === "ME")) ||
      (filterNorm === "CIVIL" && (deptNorm === "CIVIL" || deptNorm === "CE"));
    const matchesSem = selectedSemFilter === "All Semesters" || c.semester === selectedSemFilter;
    return matchesSearch && matchesDept && matchesSem;
  });

  const filteredDepts = departments.filter((d) => {
    return (
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hodName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredSchemes = curriculumSchemes.filter((s) => {
    return (
      s.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.regulationCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handlers for Courses
  const handleOpenAddCourse = () => {
    setCourseForm({
      code: "",
      name: "",
      department: "CSE",
      semester: "Semester 5",
      credits: 3,
      type: "Core Theory",
      instructor: "",
      regulations: "R24 Regulation",
      prerequisite: "",
      syllabusOverview: "",
    });
    setIsAddCourseOpen(true);
  };

  const handleAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name) {
      toast.error("Please enter course code and title.");
      return;
    }
    const created = await createAcademicCourse(courseForm);
    setCourses((prev) => [created, ...prev]);
    setIsAddCourseOpen(false);
    toast.success(`Course ${created.code}: ${created.name} added successfully!`);
  };

  const handleOpenEditCourse = (course: AcademicCourse) => {
    setCourseForm(course);
    setIsEditCourseOpen(true);
  };

  const handleEditCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.id) return;
    await updateAcademicCourse(courseForm.id, courseForm);
    setCourses((prev) =>
      prev.map((c) => (c.id === courseForm.id ? ({ ...c, ...courseForm } as AcademicCourse) : c))
    );
    setIsEditCourseOpen(false);
    toast.success(`Course ${courseForm.code} updated!`);
  };

  const handleDeleteCourse = async (id: string, code: string) => {
    if (confirm(`Delete course ${code}?`)) {
      await deleteAcademicCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Course ${code} deleted.`);
    }
  };

  // Handlers for Departments
  const handleAddDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.code || !deptForm.name) {
      toast.error("Please enter department code and name.");
      return;
    }
    const created = await createAcademicDepartment(deptForm);
    setDepartments((prev) => [created, ...prev]);
    setIsAddDeptOpen(false);
    toast.success(`Department ${created.name} (${created.code}) created successfully!`);
  };

  // Handlers for Curriculum
  const handleAddSchemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeForm.programName) {
      toast.error("Please enter degree program name.");
      return;
    }
    const created = await createCurriculumScheme(schemeForm);
    setCurriculumSchemes((prev) => [created, ...prev]);
    setIsAddSchemeOpen(false);
    toast.success(`Curriculum scheme for ${created.programName} added!`);
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = "";

    if (activeSubpart === "courses") {
      filename = `Academic_Course_Catalog_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Course ID", "Code", "Title", "Department", "Semester", "Credits", "Type", "Instructor"];
      rows = filteredCourses.map((c) => [c.id, c.code, `"${c.name}"`, c.department, `"${c.semester}"`, c.credits, `"${c.type}"`, `"${c.instructor}"`]);
    } else if (activeSubpart === "departments") {
      filename = `Academic_Departments_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Department ID", "Code", "Department Name", "HOD", "Faculty Count", "Student Capacity", "Labs", "Accreditation"];
      rows = filteredDepts.map((d) => [d.id, d.code, `"${d.name}"`, `"${d.hodName}"`, d.facultyCount, d.studentCapacity, d.laboratoriesCount, `"${d.accreditation}"`]);
    } else if (activeSubpart === "faculty-status") {
      filename = `Faculty_Live_Status_Period_${selectedPeriod}_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Faculty Name", "Department", "Live Status", "Assigned Class", "Subject", "Room No", "Time Slot"];
      rows = filteredFacultyStatus.map((f) => [f.name, f.department, f.status, f.currentClass || "N/A", f.subject || "N/A", f.roomNo || "N/A", f.timeSlot || "N/A"]);
    } else if (activeSubpart === "all-classes-attendance") {
      filename = `All_Classes_Attendance_${attendanceViewMode}_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Class Name", "Department", "Total Students", "Present", "Absent", "Late", "Daily %", "Weekly %", "Monthly %", "Class Teacher", "Status"];
      rows = filteredAllClassesAttendance.map((c) => [c.className, c.department, c.totalStudents, c.presentCount, c.absentCount, c.lateCount, c.dailyPct, c.weeklyPct, c.monthlyPct, `"${c.classTeacher}"`, c.status]);
    } else {
      filename = `Academic_Curriculum_Schemes_${new Date().toISOString().split("T")[0]}.csv`;
      headers = ["Scheme ID", "Regulation", "Program Name", "Batch", "Total Credits", "Core Credits", "Lab Credits", "Elective Credits"];
      rows = filteredSchemes.map((s) => [s.id, s.regulationCode, `"${s.programName}"`, s.effectiveBatch, s.totalCredits, s.coreTheoryCredits, s.labCredits, s.electiveCredits]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${rows.length} ${activeSubpart} records to CSV!`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <BookOpen className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                {isHod
                  ? `${deptStats?.departmentName || "Computer Science & Engineering"} — Academics`
                  : "Academics & Faculty Management Portal"}
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                {isHod
                  ? `Role: HOD / Department Head | Dept: ${deptStats?.departmentCode || hodDeptCode}`
                  : "Academic Council Core"}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {isHod
                ? "Department academic management, faculty allocation, courses, curriculum and syllabus tracking."
                : "Click any faculty card to inspect full-day period timetable. Live Faculty Status, Attendance & Syllabus Tracker."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={loadAllData} disabled={loading} className="h-9 gap-2 text-xs font-medium">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 gap-2 text-xs font-medium">
            <Download className="size-3.5" /> Export Data
          </Button>

          {activeSubpart === "courses" && (
            <Button size="sm" onClick={handleOpenAddCourse} className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow">
              <Plus className="size-4" /> Add New Course
            </Button>
          )}

          {activeSubpart === "departments" && isSuperAdmin && (
            <Button size="sm" onClick={() => setIsAddDeptOpen(true)} className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow">
              <Building2 className="size-4" /> Add Department
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {isHod ? (
          <>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Faculty</span>
                <Users className="size-4 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono text-primary">
                {deptStats?.facultyCount ?? (departments[0]?.facultyCount || 8)} Faculty
              </p>
              <p className="text-[0.68rem] text-muted-foreground font-mono">Department Professors</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Courses / Subjects</span>
                <BookOpen className="size-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-blue-600">
                {deptStats?.coursesCount ?? (courses.length || 19)} Courses
              </p>
              <p className="text-[0.68rem] text-muted-foreground">Theory, Labs & Electives</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Active Sections</span>
                <Layers className="size-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-purple-600">
                {deptStats?.activeSectionsCount ?? 6} Classes
              </p>
              <p className="text-[0.68rem] text-purple-600 font-medium">Active Department Classes</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Syllabus Progress</span>
                <Award className="size-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-600">
                {deptStats?.syllabusProgressPct ?? 78.5}%
              </p>
              <p className="text-[0.68rem] text-emerald-600 font-medium">Completed Syllabus</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Academic Departments</span>
                <Building2 className="size-4 text-primary" />
              </div>
              <p className="text-2xl font-bold font-mono text-primary">{departments.length} Depts</p>
              <p className="text-[0.68rem] text-muted-foreground font-mono">CSE, ECE, EEE, ME, Civil, MBA</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Course Catalog</span>
                <BookOpen className="size-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-blue-600">{courses.length} Subjects</p>
              <p className="text-[0.68rem] text-muted-foreground">Theory, Labs & Electives</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Curriculum Schemes</span>
                <Bookmark className="size-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-purple-600">{curriculumSchemes.length} Regulations</p>
              <p className="text-[0.68rem] text-purple-600 font-medium">R24, R22 Approved Frameworks</p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                <span>Accreditation Standard</span>
                <Award className="size-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-600">NAAC A+</p>
              <p className="text-[0.68rem] text-emerald-600 font-medium">NBA Accredited Programs</p>
            </div>
          </>
        )}
      </div>

      {/* THREE SUBPARTS NAVIGATION TAB BAR */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/60 border border-border/80 overflow-x-auto">
        <button
          onClick={() => setActiveSubpart("departments")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "departments" ? "bg-card text-primary shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-3.5" /> {isHod ? "Department Overview" : `Departments (${departments.length})`}
        </button>

        <button
          onClick={() => setActiveSubpart("courses")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "courses" ? "bg-card text-primary shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-3.5" /> Courses ({filteredCourses.length})
        </button>

        <button
          onClick={() => setActiveSubpart("curriculum")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeSubpart === "curriculum" ? "bg-card text-primary shadow-sm border border-border/80" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark className="size-3.5" /> Curriculum
        </button>
      </div>

      {/* SUBPART: DEPARTMENTS VIEW */}
      {activeSubpart === "departments" && (
        <div className="space-y-4">
          {isHod ? (
            <div className="p-6 rounded-2xl border border-primary/30 bg-card space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-primary tracking-wider uppercase">
                    {deptStats?.departmentCode || hodDeptCode}
                  </span>
                  <h3 className="font-bold text-xl text-foreground mt-0.5">
                    {deptStats?.departmentName || "Computer Science & Engineering"}
                  </h3>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 text-xs">
                  Department Active Scope
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-muted/40 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">HOD Name</p>
                  <p className="text-sm font-bold text-foreground">
                    {deptStats?.hodName || profile?.personaName || "Dr. S. K. Gupta"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Faculty Members</p>
                  <p className="text-sm font-bold font-mono text-primary">
                    {deptStats?.facultyCount ?? (departments[0]?.facultyCount || 8)} Professors
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Students</p>
                  <p className="text-sm font-bold font-mono text-blue-600">
                    {deptStats?.studentCount ?? (departments[0]?.studentCapacity || 97)} Enrolled
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Courses Offered</p>
                  <p className="text-sm font-bold font-mono text-purple-600">
                    {deptStats?.coursesCount ?? (courses.length || 19)} Courses
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Syllabus Progress</p>
                  <p className="text-sm font-bold font-mono text-emerald-600">
                    {deptStats?.syllabusProgressPct ?? 78.5}% Completed
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepts.map((d) => (
                <div key={d.id} className="p-5 rounded-2xl border border-border/80 bg-card space-y-3 shadow-sm hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">{d.code}</span>
                      <h3 className="font-bold text-sm text-foreground">{d.name}</h3>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">{d.accreditation}</Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p><span className="font-semibold text-foreground">HOD:</span> {d.hodName}</p>
                    <p><span className="font-semibold text-foreground">Faculty Members:</span> {d.facultyCount} Professors</p>
                    <p><span className="font-semibold text-foreground">Student Capacity:</span> {d.studentCapacity} Seats</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBPART: COURSES CATALOG VIEW */}
      {activeSubpart === "courses" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
          {/* Department Filter & Search Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by code, title, or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
                <Filter className="size-3.5 text-primary" /> Department:
              </div>
              <Select
                value={isHod ? hodDeptCode : selectedDeptFilter}
                onValueChange={(val) => !isHod && setSelectedDeptFilter(val)}
                disabled={isHod}
              >
                <SelectTrigger className="h-9 text-xs w-[190px]">
                  <SelectValue placeholder={isHod ? hodDeptCode : "All Departments"} />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS_LIST.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Course Code</th>
                  <th className="py-3 px-3">Course Title</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Semester</th>
                  <th className="py-3 px-3">Credits</th>
                  <th className="py-3 px-3">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{c.code}</td>
                    <td className="py-3 px-3 font-bold text-foreground">{c.name}</td>
                    <td className="py-3 px-3">{c.department}</td>
                    <td className="py-3 px-3">{c.semester}</td>
                    <td className="py-3 px-3 font-mono font-bold text-primary">{c.credits} Credits</td>
                    <td className="py-3 px-3 text-muted-foreground">{c.instructor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXISTING SUBPART: CURRICULUM SCHEMES */}
      {activeSubpart === "curriculum" && (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredSchemes.map((s) => (
            <div key={s.id} className="p-5 rounded-2xl border border-border/80 bg-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <Badge variant="outline" className="font-mono text-xs text-primary">{s.regulationCode}</Badge>
                  <h3 className="font-bold text-sm text-foreground mt-1">{s.programName}</h3>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600">{s.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">Total Credits: {s.totalCredits} (Core: {s.coreTheoryCredits}, Lab: {s.labCredits}, Electives: {s.electiveCredits})</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Dialog */}
      <Dialog open={isAddDeptOpen} onOpenChange={setIsAddDeptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new academic department profile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDeptSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept-code">Department Code</Label>
                <Input
                  id="dept-code"
                  placeholder="e.g. CSE"
                  value={deptForm.code || ""}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  placeholder="e.g. Computer Science"
                  value={deptForm.name || ""}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hod-name">HOD Name</Label>
              <Input
                id="hod-name"
                placeholder="e.g. Dr. Sarah Smith"
                value={deptForm.hodName || ""}
                onChange={(e) => setDeptForm({ ...deptForm, hodName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-count">Faculty Count</Label>
                <Input
                  id="faculty-count"
                  type="number"
                  value={deptForm.facultyCount || ""}
                  onChange={(e) => setDeptForm({ ...deptForm, facultyCount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-capacity">Student Capacity</Label>
                <Input
                  id="student-capacity"
                  type="number"
                  value={deptForm.studentCapacity || ""}
                  onChange={(e) => setDeptForm({ ...deptForm, studentCapacity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labs-count">Laboratories Count</Label>
                <Input
                  id="labs-count"
                  type="number"
                  value={deptForm.laboratoriesCount || ""}
                  onChange={(e) => setDeptForm({ ...deptForm, laboratoriesCount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accreditation">Accreditation</Label>
                <Input
                  id="accreditation"
                  placeholder="e.g. NAAC A+"
                  value={deptForm.accreditation || ""}
                  onChange={(e) => setDeptForm({ ...deptForm, accreditation: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDeptOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white">
                Add Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Course Dialog */}
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Academic Course</DialogTitle>
            <DialogDescription>
              Add a new course catalog subject connected to InsForge Cloud PostgreSQL.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCourseSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-code">Course Code</Label>
                <Input
                  id="course-code"
                  placeholder="e.g. CS405"
                  value={courseForm.code || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-credits">Credits</Label>
                <Input
                  id="course-credits"
                  type="number"
                  placeholder="3"
                  value={courseForm.credits ?? 3}
                  onChange={(e) => setCourseForm({ ...courseForm, credits: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-name">Course Title</Label>
              <Input
                id="course-name"
                placeholder="e.g. Cloud Computing & Distributed Systems"
                value={courseForm.name || ""}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={courseForm.department || "CSE"}
                  onValueChange={(val) => setCourseForm({ ...courseForm, department: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Dept" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                    <SelectItem value="CIVIL">CIVIL</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="AI&ML">AI&ML</SelectItem>
                    <SelectItem value="AI&DS">AI&DS</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={courseForm.semester || "Semester 5"}
                  onValueChange={(val) => setCourseForm({ ...courseForm, semester: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={`Semester ${s}`}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Type</Label>
                <Select
                  value={courseForm.type || "Core Theory"}
                  onValueChange={(val: any) => setCourseForm({ ...courseForm, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Core Theory">Core Theory</SelectItem>
                    <SelectItem value="Lab Practical">Lab Practical</SelectItem>
                    <SelectItem value="Professional Elective">Professional Elective</SelectItem>
                    <SelectItem value="Project Work">Project Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-instructor">Instructor / Faculty</Label>
                <Input
                  id="course-instructor"
                  placeholder="e.g. Dr. Neha Rathore"
                  value={courseForm.instructor || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white">
                Add Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
