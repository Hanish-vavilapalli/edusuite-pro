import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useRole } from "@/context/role-context";
import {
  FACULTY_DASHBOARD_DATA_BY_DEPT,
  type FacultyDashboardData,
} from "@/data/faculty-mock-data";
import { getFacultyAssignedSections } from "@/lib/mock-examcell-state";

// Subcomponents imports
import { TimetableHeader } from "@/components/dashboard/timetable/timetable-header";
import { FilterPanel } from "@/components/dashboard/timetable/filter-panel";
import { TodaySchedule } from "@/components/dashboard/timetable/today-schedule";
import { WeeklyGrid } from "@/components/dashboard/timetable/weekly-grid";
import { MonthlyCalendar } from "@/components/dashboard/timetable/monthly-calendar";
import { UpcomingClasses } from "@/components/dashboard/timetable/upcoming-classes";
import { SubjectSummary } from "@/components/dashboard/timetable/subject-summary";
import { RoomAllocationTable } from "@/components/dashboard/timetable/room-allocation-table";
import { TeachingLoadCards } from "@/components/dashboard/timetable/teaching-load-cards";
import { FreePeriodCards } from "@/components/dashboard/timetable/free-period-cards";
import { ConflictPanel } from "@/components/dashboard/timetable/conflict-panel";
import { Legend } from "@/components/dashboard/timetable/legend";
import { SkeletonLoader } from "@/components/dashboard/timetable/skeleton-loader";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/timetable")({
  head: () => ({
    meta: [{ title: "Timetable — EduSuite Pro" }],
  }),
  component: FacultyTimetablePage,
});

function FacultyTimetablePage() {
  const { profile } = useRole();
  const deptCode = profile.department || "CSE";
  
  // Retrieve mock data dynamically based on active department
  const dashboardData = (FACULTY_DASHBOARD_DATA_BY_DEPT[deptCode] || FACULTY_DASHBOARD_DATA_BY_DEPT["CSE"]) as FacultyDashboardData;
  const tData = dashboardData.timetableData;

  const assignedSections = useMemo(() => {
    return getFacultyAssignedSections(profile.name || profile.personaName || "Amit Rathore");
  }, [profile.name, profile.personaName]);

  const dynamicTodaySchedule = useMemo(() => {
    if (assignedSections.length === 0) return dashboardData.timetable;
    return assignedSections.map((sec, idx) => ({
      time: idx === 0 ? "09:00 - 10:00 AM" : idx === 1 ? "10:15 - 11:15 AM" : idx === 2 ? "11:30 - 12:30 PM" : "02:00 - 03:00 PM",
      subject: `${sec.subjectCode}: ${sec.subjectName}`,
      section: `${sec.department} Sec ${sec.section}`,
      room: `Block A - Room ${101 + idx}`,
      status: idx === 0 ? ("Completed" as const) : idx === 1 ? ("Ongoing" as const) : ("Upcoming" as const)
    }));
  }, [assignedSections, dashboardData.timetable]);

  const [loading, setLoading] = useState(false);
  const [activeWeek, setActiveWeek] = useState("Week 5 (Active)");

  const handleRefresh = () => {
    setLoading(true);
    toast.success("Synchronizing timetable calendar...", {
      description: "Fetching latest schedules.",
    });
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    setLoading(true);
    setActiveWeek(filters["week"] || "Week 5 (Active)");
    toast.success(`Filter applied: ${filters["week"] || "Current Week"}`, {
      description: `Loading schedules for AY ${filters["ay"] || "2026-27"}.`,
    });
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <TimetableHeader
        academicYear={dashboardData.academicYear}
        semester={dashboardData.semester}
        onRefresh={handleRefresh}
      />

      {/* 2. Loading state vs Content */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-6">
          {/* Today's Schedule horizontal cards */}
          <TodaySchedule schedule={dynamicTodaySchedule} />

          {/* Load Summary Statistics Cards */}
          <TeachingLoadCards load={tData.teachingLoad} />

          {/* Grid filter options */}
          <FilterPanel onFilterChange={handleFilterChange} />

          {/* Layout Grid split */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column (Spans 2 on desktop: Weekly Grid, Monthly Calendar, Summary) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly timetable table */}
              <WeeklyGrid slots={tData.weeklyGrid} />
              
              {/* Monthly calendar view */}
              <MonthlyCalendar events={tData.monthlyEvents} />
              
              {/* Rooms & Labs Assigned */}
              <RoomAllocationTable allocations={tData.roomAllocations} />
              
              {/* Courses Summary details */}
              <SubjectSummary subjects={tData.subjectSummary} />
            </div>

            {/* Right Column (Sidebar helper widgets: Upcoming periods, Free spaces, conflict rad, legend) */}
            <div className="space-y-6 lg:col-span-1">
              <UpcomingClasses classes={tData.upcomingClasses} />
              <FreePeriodCards freePeriods={tData.freePeriods} />
              <ConflictPanel conflicts={tData.conflicts} />
              <Legend />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
