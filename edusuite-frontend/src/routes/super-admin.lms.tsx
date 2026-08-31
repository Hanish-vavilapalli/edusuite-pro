import { createFileRoute } from "@tanstack/react-router";
import { 
  BookOpen, 
  FileText, 
  Video, 
  ClipboardList, 
  Award, 
  Download, 
  RefreshCw,
  TrendingUp,
  Layers,
  GraduationCap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BarChart } from "@/shared/components/Charts/BarChart";
import { AreaChart } from "@/shared/components/Charts/AreaChart";
import { PieChart } from "@/shared/components/Charts/PieChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/super-admin/lms")({
  head: () => ({
    meta: [{ title: "LMS Institutional Analytics — EduSuite Pro" }],
  }),
  component: SuperAdminLmsPage,
});

// Mock Analytics Data
const SYLLABUS_COVERAGE_DATA = [
  { name: "CSE", Coverage: 85 },
  { name: "AIML", Coverage: 78 },
  { name: "AIDS", Coverage: 74 },
  { name: "ECE", Coverage: 72 },
  { name: "EEE", Coverage: 68 },
  { name: "MECH", Coverage: 62 },
  { name: "CIVIL", Coverage: 54 },
  { name: "IT", Coverage: 89 }
];

const ENGAGEMENT_TRENDS_DATA = [
  { name: "Jan", Views: 4200, Downloads: 2100 },
  { name: "Feb", Views: 5100, Downloads: 2800 },
  { name: "Mar", Views: 7800, Downloads: 4500 },
  { name: "Apr", Views: 9600, Downloads: 5900 },
  { name: "May", Views: 12400, Downloads: 7800 },
  { name: "Jun", Views: 8200, Downloads: 3900 },
  { name: "Jul", Views: 6100, Downloads: 2400 },
  { name: "Aug", Views: 14200, Downloads: 9400 }
];

const DEPT_DISTRIBUTION_DATA = [
  { name: "CSE", value: 450 },
  { name: "AIML", value: 320 },
  { name: "AIDS", value: 240 },
  { name: "ECE", value: 210 },
  { name: "Others", value: 380 }
];

const PIE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#94a3b8"];

const TOP_COURSES = [
  { code: "23CS301", name: "Java Programming", dept: "CSE", students: 184, documents: 18, submissions: 142, engagement: "98%" },
  { code: "23ML101", name: "Introduction to ML & Deep Learning", dept: "AIML", students: 160, documents: 14, submissions: 118, engagement: "94%" },
  { code: "CS401", name: "Advanced Artificial Intelligence", dept: "CSE", students: 94, documents: 12, submissions: 86, engagement: "92%" },
  { code: "EC304", name: "VLSI System Design", dept: "ECE", students: 120, documents: 16, submissions: 74, engagement: "88%" },
  { code: "ME308", name: "Computer Aided Design (CAD)", dept: "MECH", students: 68, documents: 10, submissions: 48, engagement: "81%" }
];

function SuperAdminLmsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="size-7 text-primary" />
            LMS Institutional Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time multi-campus monitoring of study materials, video streams, assignments submissions, and overall syllabus completion status.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" className="h-9 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer">
            <RefreshCw className="size-3.5" /> Refresh Analytics
          </Button>
          <Button className="h-9 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/95 text-white gap-1.5 cursor-pointer">
            <Download className="size-3.5" /> Export Summary
          </Button>
        </div>
      </div>

      {/* KPI HIGHLIGHTS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          label="Total Study Notes & PDFs" 
          value="1,424 Docs" 
          icon={FileText} 
          delta="+14% this month"
          tone="info"
        />
        <KpiCard 
          label="Video Lectures Recorded" 
          value="312 Lectures" 
          icon={Video} 
          delta="+8% this month"
          tone="success"
        />
        <KpiCard 
          label="Active Assignments" 
          value="518 Uploaded" 
          icon={ClipboardList} 
          delta="+22% this week"
          tone="primary"
        />
        <KpiCard 
          label="Online Quizzes & Tests" 
          value="96 Quizzes" 
          icon={Award} 
          delta="+5% this week"
          tone="purple"
        />
      </div>

      {/* CORE CHARTS ROW */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SYLLABUS COMPLETION COVERAGE BY DEPARTMENT */}
        <Card className="border border-border/70 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-4 text-primary" />
              Syllabus Completion Coverage by Department (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={SYLLABUS_COVERAGE_DATA}
              xAxisKey="name"
              bars={[
                { key: "Coverage", name: "Syllabus Coverage %", fill: "rgb(59, 130, 246)" }
              ]}
              height={260}
            />
          </CardContent>
        </Card>

        {/* LMS MONTHLY ENGAGEMENT TRENDS */}
        <Card className="border border-border/70 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-600" />
              Monthly LMS Platform Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart 
              data={ENGAGEMENT_TRENDS_DATA}
              xAxisKey="name"
              areas={[
                { key: "Views", name: "Student Views", fill: "#3b82f6", stroke: "#2563eb" },
                { key: "Downloads", name: "Content Downloads", fill: "#10b981", stroke: "#059669" }
              ]}
              height={260}
            />
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM SECTION - PIE CHART & STATS TABLE */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* PIE CHART - CONTENT DISTRIBUTION */}
        <Card className="border border-border/70 shadow-xs rounded-2xl lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Content Uploads by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <PieChart 
              data={DEPT_DISTRIBUTION_DATA}
              colors={PIE_COLORS}
              height={220}
            />
          </CardContent>
        </Card>

        {/* TOP PERFORMING COURSES TABLE */}
        <Card className="border border-border/70 shadow-xs rounded-2xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="size-4 text-purple-650" />
              Active Courses Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-muted-foreground uppercase text-[9px] tracking-wider border-b border-border/50">
                  <tr>
                    <th className="px-5 py-3 font-black">Course Code</th>
                    <th className="px-5 py-3 font-black">Course Name</th>
                    <th className="px-5 py-3 font-black">Dept</th>
                    <th className="px-5 py-3 font-black text-center">Enrolled</th>
                    <th className="px-5 py-3 font-black text-center">Notes</th>
                    <th className="px-5 py-3 font-black text-center">Submissions</th>
                    <th className="px-5 py-3 font-black text-right">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-semibold text-slate-700 dark:text-slate-300">
                  {TOP_COURSES.map((course) => (
                    <tr key={course.code} className="hover:bg-slate-50/30 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">{course.code}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-850 dark:text-slate-200">{course.name}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50/40 text-[10px]">
                          {course.dept}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold">{course.students}</td>
                      <td className="px-5 py-3.5 text-center">{course.documents}</td>
                      <td className="px-5 py-3.5 text-center">{course.submissions}</td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-600">{course.engagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
