import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Users,
  CheckCircle2,
  GraduationCap,
  UserCog,
  Award,
  Briefcase,
  FileSpreadsheet,
  TrendingUp,
  Plus,
  FileText,
  Activity,
  Bell,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { ChartLegend, DonutChart, GroupedBarChart } from "@/components/dashboard/charts";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/context/role-context";
import {
  DEPARTMENT_NAMES,
  FACULTY_DASHBOARD_DATA_BY_DEPT,
  type FacultyDashboardData,
} from "@/data/faculty-mock-data";
import { getFacultyAssignedSections } from "@/lib/mock-examcell-state";
import { toast } from "sonner";
import { FacultyModuleView } from "@/modules/faculty";
import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import api from "@/lib/api";
import { HodIdentityScopeCard } from "../hod-identity-scope-card";

interface HodDashboardResponse {
  department: string;
  departmentName?: string;
  stats: {
    todaysClasses: number;
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
    pendingApprovals: number;
    pendingAssignments: number;
    attendancePendingText: string;
    upcomingExams: number;
    researchPublications: number;
    averageCgpa: number;
    averageAttendance: number;
    atRiskStudentsCount: number;
  };
  timetable: Array<{
    id?: string;
    time: string;
    subject: string;
    section: string;
    room: string;
    status: "Completed" | "Ongoing" | "Upcoming";
    facultyName?: string;
  }>;
  attendance: {
    present: number;
    absent: number;
    pending: number;
    percentage: number;
  };
  performance: {
    averageAttendance: number;
    averageMarks: number;
    assignmentsSubmitted: number;
    studentsAtRisk: number;
    chartData: Array<{
      name: string;
      attendance: number;
      marks: number;
      submissions: number;
    }>;
  };
  facultyMembers?: any[];
  recentAuditLogs?: any[];
}

export function StaffDashboard() {
  const { hasFlag, profile } = useRole();
  const navigate = useNavigate();
  const deptCode = profile.department || "CSE";
  const fallbackDeptName = DEPARTMENT_NAMES[deptCode] || "Computer Science & Engineering";

  // Real-time PostgreSQL database state for HOD Dashboard
  const [hodLiveStats, setHodLiveStats] = useState<HodDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchRealTimeHodStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    try {
      const res = await api.get("/api/hod/dashboard-stats");
      if (res.status === 200 && res.data && res.data.stats) {
        setHodLiveStats(res.data);
        if (isManualRefresh) {
          toast.success("Dashboard metrics refreshed from PostgreSQL database.");
        }
      } else {
        setFetchError("Unable to load department dashboard data.");
      }
    } catch (err: any) {
      console.error("Error fetching real-time HOD stats from database:", err);
      const errMsg = err.response?.data?.error || "Unable to load department dashboard data.";
      setFetchError(errMsg);
      toast.error("Dashboard Load Error", { description: errMsg });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealTimeHodStats();
  }, [profile.department, profile.role]);

  // Dynamic department name from PostgreSQL or fallback
  const resolvedDeptName = hodLiveStats?.departmentName || fallbackDeptName;
  const currentDeptCode = hodLiveStats?.department || deptCode;

  // Fallback dashboardData for non-HOD roles only
  const fallbackDashboardData = (FACULTY_DASHBOARD_DATA_BY_DEPT[deptCode] || FACULTY_DASHBOARD_DATA_BY_DEPT["CSE"]) as FacultyDashboardData;

  const assignedSections = useMemo(() => {
    return getFacultyAssignedSections(profile.name || profile.personaName || "Amit Rathore");
  }, [profile.name, profile.personaName]);

  const userProfileRoll = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cms_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed.rollNumber || parsed.roll_number || parsed.employeeId || parsed.empId;
        }
      } catch (e) {}
    }
    return null;
  }, []);

  const activeEmpId = (profile as any).rollNumber || userProfileRoll || "HOD-CSE-01";

  // Format current greeting based on time of day
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleQuickAction = (label: string) => {
    switch (label) {
      case "Take Attendance":
        navigate({ to: "/hod/attendance" as any });
        break;
      case "Upload Materials":
        navigate({ to: "/faculty/materials" as any });
        break;
      case "Create Assignment":
        navigate({ to: "/faculty/assignments" as any });
        break;
      case "Enter Marks":
        navigate({ to: "/faculty/evaluation-and-marks" as any });
        break;
      case "View Timetable":
        navigate({ to: "/faculty/timetable" as any });
        break;
      case "Student List":
        navigate({ to: "/hod/faculty" as any });
        break;
      default:
        toast.info(`Navigating to ${label}`);
    }
  };

  // Real database Attendance Donut Data
  const attendanceDonutData = useMemo(() => {
    if (!hodLiveStats) {
      return [
        { name: "Present", value: 85 },
        { name: "Absent", value: 10 },
        { name: "Pending", value: 5 },
      ];
    }
    return [
      { name: "Present", value: hodLiveStats.attendance.present },
      { name: "Absent", value: hodLiveStats.attendance.absent },
      { name: "Pending", value: hodLiveStats.attendance.pending },
    ];
  }, [hodLiveStats]);

  const realTimetable = hodLiveStats?.timetable || [];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME SECTION HERO CARD */}
      <HodIdentityScopeCard
        onRefresh={() => fetchRealTimeHodStats(true)}
        isRefreshing={isRefreshing}
        dbConnected={!fetchError}
        departmentCode={currentDeptCode}
        departmentName={resolvedDeptName}
      />

      {/* ERROR BANNER IF DATABASE FETCH FAILED */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-5 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={() => fetchRealTimeHodStats(true)}
            className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. DYNAMIC COMPOSABLE SECTIONS FOR ADMINISTRATIVE OVERLAYS */}
      {(hasFlag("isSuperAdmin") || profile.role === "super-admin" || profile.role === "super_admin") && (
        <div className="space-y-4 border-b border-border/60 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary flex items-center gap-2">
              <UserCog className="size-4" /> Super Admin Faculty Governance Portal
            </h3>
            <Badge variant="secondary">Super Admin Privileges</Badge>
          </div>
          <FacultyModuleView initialTab="faculty-status" />
        </div>
      )}

      {(hasFlag("isHod") || profile.role === "hod") && (
        <div className="space-y-4 border-b border-border/60 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary flex items-center gap-2">
              <UserCog className="size-4" /> HOD Live Database Governance — {currentDeptCode} Department
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live PostgreSQL DB
              </span>
              <Badge variant="secondary">HOD Privileges</Badge>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Dept. Students (PostgreSQL)"
              value={isLoading ? "Loading..." : String(hodLiveStats?.stats?.totalStudents ?? 0)}
              icon={Users}
              tone="info"
            />
            <KpiCard
              label="Dept. Faculty (PostgreSQL)"
              value={isLoading ? "Loading..." : String(hodLiveStats?.stats?.totalFaculty ?? 0)}
              icon={UserCog}
            />
            <KpiCard
              label="Active Department Courses"
              value={isLoading ? "Loading..." : String(hodLiveStats?.stats?.totalCourses ?? 0)}
              icon={BookOpen}
              tone="success"
            />
            <KpiCard
              label="Pending Approvals"
              value={isLoading ? "Loading..." : String(hodLiveStats?.stats?.pendingApprovals ?? 0)}
              icon={CheckCircle2}
              tone="warning"
            />
          </div>
        </div>
      )}

      {/* 3. REAL DATABASE KPI METRICS CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-2">
            <span>Performance Overview — {currentDeptCode} Department</span>
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {isLoading ? "Fetching DB data..." : "100% Real PostgreSQL Data"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KpiCard
            label="Today's Classes"
            value={isLoading ? "..." : String(hodLiveStats?.stats?.todaysClasses ?? 0)}
            icon={CalendarCheck}
            tone="info"
            className="hover:-translate-y-1 transition-all duration-300"
          />
          <KpiCard
            label="Total Students"
            value={isLoading ? "..." : String(hodLiveStats?.stats?.totalStudents ?? 0)}
            icon={Users}
            className="hover:-translate-y-1 transition-all duration-300"
          />
          <KpiCard
            label="Pending Homework"
            value={isLoading ? "..." : String(hodLiveStats?.stats?.pendingAssignments ?? 0)}
            icon={ClipboardList}
            tone="warning"
            className="hover:-translate-y-1 transition-all duration-300"
          />
          <KpiCard
            label="Attendance Status"
            value={isLoading ? "..." : hodLiveStats?.stats?.attendancePendingText ?? "0 Classes"}
            icon={CheckCircle2}
            className="hover:-translate-y-1 transition-all duration-300 text-xs"
          />
          <KpiCard
            label="Upcoming Exams"
            value={isLoading ? "..." : String(hodLiveStats?.stats?.upcomingExams ?? 0)}
            icon={GraduationCap}
            tone="success"
            className="hover:-translate-y-1 transition-all duration-300"
          />
          <KpiCard
            label="Research Publications"
            value={isLoading ? "..." : String(hodLiveStats?.stats?.researchPublications ?? 0)}
            icon={TrendingUp}
            className="hover:-translate-y-1 transition-all duration-300"
          />
        </div>
      </div>

      {/* 4. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's Timetable Card */}
          <Panel
            title="Today's Timetable"
            description={`Scheduled periods for ${resolvedDeptName}`}
            action={
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Period Status</Badge>
                <button
                  onClick={() => navigate({ to: "/faculty/timetable" as any })}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Full Schedule &rarr;
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-[100px]">Section</TableHead>
                    <TableHead className="w-[100px]">Room</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                        Loading today's department timetable from database...
                      </TableCell>
                    </TableRow>
                  ) : realTimetable.length > 0 ? (
                    realTimetable.map((slot, index) => (
                      <TableRow key={slot.id || index} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="size-3 shrink-0" /> {slot.time}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {slot.subject}
                          {slot.facultyName && (
                            <span className="block text-[0.65rem] text-muted-foreground font-normal">
                              Faculty: {slot.facultyName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{slot.section}</TableCell>
                        <TableCell className="font-mono text-xs">{slot.room}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              slot.status === "Completed"
                                ? "secondary"
                                : slot.status === "Ongoing"
                                  ? "outline"
                                  : "default"
                            }
                            className={
                              slot.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : slot.status === "Ongoing"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            }
                          >
                            {slot.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                        No classes scheduled for today.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Panel>

          {/* Student Performance Snapshot Card */}
          <Panel
            title="Student Performance Snapshot"
            description={`Average metrics across ${currentDeptCode} department sections`}
          >
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/40 text-center">
              <div>
                <p className="text-[0.65rem] uppercase font-extrabold tracking-wider text-muted-foreground">Avg Attendance</p>
                <p className="text-lg font-black mt-0.5 text-indigo-600">
                  {isLoading ? "..." : `${hodLiveStats?.performance?.averageAttendance ?? 0}%`}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase font-extrabold tracking-wider text-muted-foreground">Average Marks</p>
                <p className="text-lg font-black mt-0.5 text-emerald-600">
                  {isLoading ? "..." : `${hodLiveStats?.performance?.averageMarks ?? 0}%`}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase font-extrabold tracking-wider text-muted-foreground">Assignments</p>
                <p className="text-lg font-black mt-0.5 text-blue-600">
                  {isLoading ? "..." : `${hodLiveStats?.performance?.assignmentsSubmitted ?? 0}%`}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase font-extrabold tracking-wider text-muted-foreground">At Risk Students</p>
                <p className="text-lg font-black mt-0.5 text-rose-600">
                  {isLoading ? "..." : (hodLiveStats?.performance?.studentsAtRisk ?? 0)}
                </p>
              </div>
            </div>

            {hodLiveStats?.performance?.chartData && hodLiveStats.performance.chartData.length > 0 ? (
              <GroupedBarChart
                data={hodLiveStats.performance.chartData}
                xKey="name"
                series={[
                  { key: "attendance", label: "Attendance (%)" },
                  { key: "marks", label: "Avg Marks (%)" },
                  { key: "submissions", label: "Submissions (%)" },
                ]}
                height={220}
              />
            ) : (
              <div className="h-[180px] grid place-items-center text-xs text-muted-foreground italic">
                {isLoading ? "Loading performance chart..." : "No performance records available for chart."}
              </div>
            )}
          </Panel>

          {/* Assignment Status Card */}
          <Panel
            title="Assignment Evaluation Status"
            description={`Tracking task submissions and scoring progress for ${currentDeptCode}`}
          >
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-[0.7rem] uppercase font-extrabold tracking-wider text-amber-600">Pending Evaluation</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-2xl font-black">{hodLiveStats?.stats?.pendingAssignments ?? 0}</span>
                  <span className="text-xs text-muted-foreground">Tasks</span>
                </div>
                <Progress value={Math.min(100, (hodLiveStats?.stats?.pendingAssignments ?? 0) * 10)} className="h-1 bg-amber-500/10 [&>div]:bg-amber-500" />
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[0.7rem] uppercase font-extrabold tracking-wider text-emerald-600">Avg CGPA</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-2xl font-black">{hodLiveStats?.stats?.averageCgpa ?? 0}</span>
                  <span className="text-xs text-muted-foreground">Scale 10</span>
                </div>
                <Progress value={Math.min(100, (hodLiveStats?.stats?.averageCgpa ?? 0) * 10)} className="h-1 bg-emerald-500/10 [&>div]:bg-emerald-500" />
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                <span className="text-[0.7rem] uppercase font-extrabold tracking-wider text-rose-600">At Risk Count</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-2xl font-black">{hodLiveStats?.stats?.atRiskStudentsCount ?? 0}</span>
                  <span className="text-xs text-rose-500">Students</span>
                </div>
                <Progress value={Math.min(100, (hodLiveStats?.stats?.atRiskStudentsCount ?? 0) * 15)} className="h-1 bg-rose-500/10 [&>div]:bg-rose-500" />
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <span className="text-[0.7rem] uppercase font-extrabold tracking-wider text-blue-600">Submission Rate</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-2xl font-black">{hodLiveStats?.performance?.assignmentsSubmitted ?? 0}%</span>
                  <span className="text-xs text-blue-600">Rate</span>
                </div>
                <Progress value={hodLiveStats?.performance?.assignmentsSubmitted ?? 0} className="h-1 bg-blue-500/10 [&>div]:bg-blue-500" />
              </div>
            </div>
          </Panel>

        </div>

        {/* Right Side (Spans 1 column on desktop) */}
        <div className="space-y-6">

          {/* Attendance Summary Card */}
          <Panel title="Attendance Summary" description={`Current stats for ${currentDeptCode} department`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <DonutChart
                data={attendanceDonutData}
                centerLabel={`${hodLiveStats?.attendance?.percentage ?? 85}%`}
              />
              <ChartLegend items={attendanceDonutData} />
            </div>
          </Panel>

          {/* Quick Action Cockpit Panel */}
          <Panel title="Quick Action Cockpit" description="Primary operational buttons">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Take Attendance", icon: CalendarCheck, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-blue-500/20" },
                { label: "Upload Materials", icon: FileText, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-emerald-500/20" },
                { label: "Create Assignment", icon: Plus, color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/15 border-violet-500/20" },
                { label: "Enter Marks", icon: FileSpreadsheet, color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-amber-500/20" },
                { label: "View Timetable", icon: Clock, color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/15 border-indigo-500/20" },
                { label: "Student List", icon: Users, color: "bg-teal-500/10 text-teal-600 hover:bg-teal-500/15 border-teal-500/20" },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(btn.label)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${btn.color}`}
                >
                  <btn.icon className="size-5 mb-1.5 shrink-0" />
                  <span className="text-[0.7rem] font-bold leading-tight">{btn.label}</span>
                </button>
              ))}
            </div>
          </Panel>

          {/* Recent Audit Activity Card */}
          <Panel
            title="Department Audit Activity"
            description={`Recent logs for ${currentDeptCode}`}
            action={<Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Audit Log</Badge>}
          >
            <div className="relative border-l-2 border-indigo-600/25 pl-4 ml-2 space-y-4 py-1.5">
              {hodLiveStats?.recentAuditLogs && hodLiveStats.recentAuditLogs.length > 0 ? (
                hodLiveStats.recentAuditLogs.map((log: any) => (
                  <div key={log.id} className="relative group">
                    <div className="absolute -left-[21px] top-1 size-2 rounded-full border-2 border-white bg-indigo-600 group-hover:scale-125 transition-transform duration-300" />
                    <div>
                      <h5 className="text-xs font-bold leading-snug">{log.action || "Department Update"}</h5>
                      <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                        By {log.actorName || "HOD"} &middot; {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2 italic">No recent audit activity recorded.</p>
              )}
            </div>
          </Panel>

          {/* Faculty Members List Panel */}
          <Panel title="Department Faculty Members" description={`${hodLiveStats?.stats?.totalFaculty ?? 0} active faculty members`}>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {hodLiveStats?.facultyMembers && hodLiveStats.facultyMembers.length > 0 ? (
                hodLiveStats.facultyMembers.map((fac: any) => (
                  <div
                    key={fac.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card text-xs hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold grid place-items-center">
                        {fac.name ? fac.name.slice(0, 2).toUpperCase() : "FC"}
                      </div>
                      <div>
                        <p className="font-bold leading-snug">{fac.name}</p>
                        <p className="text-[0.65rem] text-muted-foreground">{fac.rollNumber} &middot; {fac.department || currentDeptCode}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[0.65rem] border-emerald-500/30 text-emerald-600">
                      {fac.status || "Active"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2 italic text-center">No faculty members found in department.</p>
              )}
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}

