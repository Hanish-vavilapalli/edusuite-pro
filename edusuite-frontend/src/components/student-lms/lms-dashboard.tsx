import React from "react";
import { LmsKpiMetrics, LmsTabType } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  FileCheck,
  HelpCircle,
  TrendingUp,
  Search,
  Upload,
  Video,
  Download,
  Library,
  Sparkles,
  Zap,
} from "lucide-react";

interface LmsDashboardHeaderProps {
  kpis: LmsKpiMetrics;
  activeTab: LmsTabType;
  onTabChange: (tab: LmsTabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickAction: (actionId: string) => void;
}

export function LmsDashboardHeader({
  kpis,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onQuickAction,
}: LmsDashboardHeaderProps) {
  const tabs: { id: LmsTabType; label: string }[] = [
    { id: "course-materials", label: "Course Materials" },
    { id: "video-lectures", label: "Video Lectures" },
    { id: "assignments", label: "Assignments" },
    { id: "quizzes", label: "Quizzes" },
  ];

  const kpiList = [
    { label: "Registered Courses", value: `${kpis.registeredCourses}`, icon: BookOpen, color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
    { label: "Active Courses", value: `${kpis.activeCourses}`, icon: TrendingUp, color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20" },
    { label: "Completed Courses", value: `${kpis.completedCourses}`, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Assignments", value: `${kpis.pendingAssignments}`, icon: FileCheck, color: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
    { label: "Upcoming Quizzes", value: `${kpis.upcomingQuizzes}`, icon: HelpCircle, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
    { label: "Study Hours", value: `${kpis.studyHours}h`, icon: Clock, color: "text-purple-600 bg-purple-500/10 border-purple-500/20" },
    { label: "Avg Quiz Score", value: `${kpis.avgQuizScore}%`, icon: Award, color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20" },
    { label: "Learning Progress", value: `${kpis.learningProgressPct}%`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  ];

  const quickActions = [
    { id: "upload-assignment", label: "Upload Assignment", icon: Upload, color: "bg-blue-600 text-white" },
    { id: "join-class", label: "Join Live Class", icon: Video, color: "bg-emerald-600 text-white" },
    { id: "download-notes", label: "Download Notes", icon: Download, color: "bg-purple-600 text-white" },
    { id: "open-library", label: "Open Library", icon: Library, color: "bg-amber-600 text-white" },
    { id: "ask-ai", label: "Ask AI Tutor", icon: Sparkles, color: "bg-indigo-600 text-white" },
    { id: "take-quiz", label: "Take Quiz", icon: HelpCircle, color: "bg-rose-600 text-white" },
  ];

  return (
    <div className="space-y-5">
      {/* HEADER CARD */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student LMS & Learning Hub
            </h1>

          </div>
          <p className="text-xs text-slate-500 font-medium">
            Course materials, assignments, quizzes, virtual lectures, discussion forums & skill certificates.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80 relative z-10">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search courses, notes, assignments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
          />
        </div>
      </div>





      {/* TAB NAVIGATION */}
      <div className="flex border border-border bg-muted/20 rounded-xl p-1 gap-2 shadow-xs w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex-1 ${
              activeTab === tab.id
                ? "bg-card text-primary shadow-2xs border border-border"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
