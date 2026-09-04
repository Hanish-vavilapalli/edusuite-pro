import React, { useState, useMemo } from "react";
import { 
  mockSummaryMetrics, 
  mockWeeklyTimetableSlots, 
  mockFacultyList, 
  mockExamSchedule, 
  mockCalendarEvents, 
  mockNotifications 
} from "./mock-data";
import { TimetableSlot, FilterState } from "./types";
import { SummaryCards } from "./summary-cards";
import { Filters } from "./filters";
import { TodaySchedule } from "./today-schedule";
import { WeeklyGrid } from "./weekly-grid";
import { MonthlyCalendar } from "./calendar";
import { FacultySchedule } from "./faculty-schedule";
import { ExamTimetable } from "./exam-timetable";
import { ClassDetailsModal } from "./class-details-modal";
import { QuickActionsSidebar } from "./quick-actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Download, 
  Printer, 
  Share2, 
  BookOpen, 
  Award, 
  User, 
  RefreshCw 
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { TimetableModuleView } from "@/modules/timetable";

export function StudentTimetableModule() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <TimetableModuleView
        isStudentView={true}
        initialBranch="CSE"
        initialSem={5}
        initialSec="Section A"
      />
    </div>
  );
}
