import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  CheckCircle2,
  Users,
  Percent,
  Layers,
  GraduationCap,
  Bell,
  Volume2,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { useRole } from "@/context/role-context";

interface DepartmentDetails {
  code: string;
  name: string;
  totalStudents: number;
  totalFaculty: number;
  attendanceRate: number;
  passRate: number;
  sectionsCount: number;
}

const DEPARTMENTS_DATA: DepartmentDetails[] = [
  { code: "CSE", name: "Computer Science & Engineering", totalStudents: 1200, totalFaculty: 45, attendanceRate: 86, passRate: 88, sectionsCount: 8 },
  { code: "AIML", name: "Artificial Intelligence & ML", totalStudents: 450, totalFaculty: 18, attendanceRate: 89, passRate: 90, sectionsCount: 3 },
  { code: "AIDS", name: "Artificial Intelligence & DS", totalStudents: 480, totalFaculty: 20, attendanceRate: 88, passRate: 91, sectionsCount: 3 },
  { code: "IT", name: "Information Technology", totalStudents: 400, totalFaculty: 16, attendanceRate: 87, passRate: 89, sectionsCount: 3 },
  { code: "EEE", name: "Electrical & Electronics Engineering", totalStudents: 320, totalFaculty: 14, attendanceRate: 82, passRate: 81, sectionsCount: 2 },
  { code: "ECE", name: "Electronics & Communication Engg", totalStudents: 600, totalFaculty: 28, attendanceRate: 84, passRate: 82, sectionsCount: 4 },
  { code: "CIVIL", name: "Civil Engineering", totalStudents: 280, totalFaculty: 12, attendanceRate: 81, passRate: 78, sectionsCount: 2 },
  { code: "MECH", name: "Mechanical Engineering", totalStudents: 250, totalFaculty: 15, attendanceRate: 80, passRate: 76, sectionsCount: 2 }
];

const GENDER_PASS_DATA = [
  { year: "1st Year", Male: 82, Female: 86 },
  { year: "2nd Year", Male: 84, Female: 88 },
  { year: "3rd Year", Male: 87, Female: 91 },
  { year: "4th Year", Male: 92, Female: 95 }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: "Fee Submission Extended", message: "Fee payment deadline for backlog examinations extended to Aug 15.", time: "2 hours ago", type: "urgent" },
  { id: 2, title: "Timetables Approved", message: "Draft timetables for AIML Year 2 Sem 3 released and approved.", time: "1 day ago", type: "info" },
  { id: 3, title: "Booklet Valuation Schedule", message: "Physical answer sheet booklet collection scheduled for next Monday.", time: "2 days ago", type: "warning" },
  { id: 4, title: "Invigilation Duties Draft", message: "Draft invigilation duty mappings dispatched to department heads.", time: "3 days ago", type: "info" }
];

export function ExamCellDashboard() {
  const { role, flags } = useRole();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const isOfficer = flags.includes("isExamController") || role === "super-admin";

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get("/api/exams/dashboard");
        if (res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard from API", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleResetDemoData = () => {
    localStorage.removeItem("mock_students_db_v3");
    localStorage.removeItem("mock_answer_copy_roster_v3");
    localStorage.removeItem("mock_scheduled_exams_v3");
    localStorage.removeItem("mock_timetables_v3");
    localStorage.removeItem("mock_offered_courses_v3");
    toast.success("Exam cell demo data reset successfully! Reloading page...");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  // Consistent full departmental metrics for both Exam Officer & Assistant
  const deptsList = (dashboardData?.departmentsData && dashboardData.departmentsData.length >= 5) 
    ? dashboardData.departmentsData 
    : DEPARTMENTS_DATA;

  const notificationsList = dashboardData?.notifications || DEFAULT_NOTIFICATIONS;
  const genderPassList = dashboardData?.genderPassData || GENDER_PASS_DATA;

  const displayTotalStudents = loading 
    ? "..." 
    : (dashboardData?.totalStudents && dashboardData.totalStudents > 100) 
      ? dashboardData.totalStudents.toLocaleString() 
      : "2,980";

  const displayTotalFaculty = loading 
    ? "..." 
    : (dashboardData?.totalFaculty && dashboardData.totalFaculty > 10) 
      ? dashboardData.totalFaculty.toString() 
      : "126";

  const displayAttendanceAvg = loading 
    ? "..." 
    : `${dashboardData?.attendanceAvg || 86.4}%`;

  const displayPassRateAvg = loading 
    ? "..." 
    : `${dashboardData?.passRateAvg || 85.8}%`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="size-6 text-indigo-600" />
            Exam Cell Central Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Real-time overall academic metrics across all departments, gender pass demographics, and active bulletins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetDemoData}
            className="h-8 text-[10px] font-black border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1 cursor-pointer rounded-xl"
          >
            <RotateCcw className="size-3" /> Reset Demo Data
          </Button>
          <Badge className="bg-indigo-600 text-white font-mono text-[10px] px-3 py-1 font-bold">
            {isOfficer ? "EXAM CONTROLLER CONSOLE" : "EXAM CELL ASSISTANT CONSOLE"}
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-card border border-border/70 shadow-xs rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Total Students</p>
            <h4 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">{displayTotalStudents}</h4>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/70 shadow-xs rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Total Faculty</p>
            <h4 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">{displayTotalFaculty}</h4>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/70 shadow-xs rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Percent className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Attendance Avg</p>
            <h4 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">{displayAttendanceAvg}</h4>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/70 shadow-xs rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">Avg Pass Rate</p>
            <h4 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">{displayPassRateAvg}</h4>
          </div>
        </Card>
      </div>

      {/* Department Details Table / Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Layers className="size-4 text-indigo-600" /> Departmental Metrics Overview
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {deptsList.map((dept: DepartmentDetails) => (
            <Card key={dept.code} className="p-4 bg-card border border-border/70 hover:border-indigo-300 transition shadow-xs rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-indigo-700 bg-indigo-50 border-indigo-200 font-extrabold text-[10px] px-2 py-0.5">
                  {dept.code}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground">{dept.sectionsCount} Sections</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 truncate" title={dept.name}>
                  {dept.name}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[10px] font-semibold text-slate-700">
                <div>
                  <span className="text-muted-foreground block text-[9px]">Students</span>
                  <span className="font-extrabold text-slate-900">{dept.totalStudents}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px]">Faculty</span>
                  <span className="font-extrabold text-slate-900">{dept.totalFaculty}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px]">Attendance</span>
                  <span className="font-extrabold text-emerald-600">{dept.attendanceRate}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px]">Pass %</span>
                  <span className="font-extrabold text-indigo-600">{dept.passRate}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Year-wise Pass charts & notifications panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gender Pass Rate Chart */}
        <Card className="lg:col-span-2 p-5 bg-card border border-border/70 shadow-xs rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Percent className="size-4 text-indigo-600" /> Year-Wise Pass Demographics
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
              Compares average pass ratios by student gender group and academic year.
            </p>
          </div>
          
          <div className="h-[240px] w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderPassList} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Legend iconSize={8} iconType="circle" />
                <Bar dataKey="Male" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Female" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Notifications and Alerts Card */}
        <Card className="p-5 bg-card border border-border/70 shadow-xs rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Bell className="size-4 text-indigo-600" /> Exam Cell Bulletins & Notifications
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Logs of active schedules, updates and notices.</p>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {notificationsList.map((notif: any) => (
              <div 
                key={notif.id} 
                className="p-3 border border-border/60 bg-slate-50/30 rounded-xl space-y-1 hover:border-slate-300 transition"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1">
                    {notif.type === "urgent" && <Volume2 className="size-3 text-red-500 animate-bounce" />}
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold">{notif.time}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">{notif.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
