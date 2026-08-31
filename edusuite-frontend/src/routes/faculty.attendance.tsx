import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useRole } from "@/context/role-context";
import {
  FACULTY_DASHBOARD_DATA_BY_DEPT,
  type FacultyDashboardData,
  type TimetableSlot,
} from "@/data/faculty-mock-data";
import { getFacultyAssignedSections } from "@/lib/mock-examcell-state";

// Subcomponents imports
import { AttendanceHeader } from "@/components/dashboard/attendance/attendance-header";
import { SearchFilterBar } from "@/components/dashboard/attendance/search-filter-bar";
import { StatisticsCards } from "@/components/dashboard/attendance/statistics-cards";
import { TodayClasses } from "@/components/dashboard/attendance/today-classes";
import { AttendanceForm } from "@/components/dashboard/attendance/attendance-form";
import { StudentAttendanceTable } from "@/components/dashboard/attendance/student-attendance-table";
import { AttendanceRegister } from "@/components/dashboard/attendance/attendance-register";
import { AttendanceCalendar } from "@/components/dashboard/attendance/attendance-calendar";
import { LeaveRequestPanel } from "@/components/dashboard/attendance/leave-request-panel";
import { AttendanceAnalytics } from "@/components/dashboard/attendance/attendance-analytics";
import { LowAttendanceAlerts } from "@/components/dashboard/attendance/low-attendance-alerts";
import { AttendanceHistory } from "@/components/dashboard/attendance/attendance-history";
import { QuickActions } from "@/components/dashboard/attendance/quick-actions";
import { SkeletonLoader } from "@/components/dashboard/attendance/skeleton-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/attendance")({
  head: () => ({
    meta: [{ title: "Attendance — EduSuite Pro" }],
  }),
  component: FacultyAttendancePage,
});

function FacultyAttendancePage() {
  const { profile } = useRole();
  const deptCode = profile.department || "CSE";

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("today");

  // Dynamically resolve assigned sections appointed by Examcell for logged-in faculty
  const assignedSections = useMemo(() => {
    return getFacultyAssignedSections(profile.name || profile.personaName || "Amit Rathore");
  }, [profile.name, profile.personaName]);

  const dynamicTimetable: TimetableSlot[] = useMemo(() => {
    return assignedSections.map((sec, idx) => ({
      time: idx === 0 ? "09:00 - 10:00" : idx === 1 ? "10:15 - 11:15" : idx === 2 ? "11:30 - 12:30" : "14:00 - 15:00",
      subject: `${sec.subjectCode} - ${sec.subjectName}`,
      section: `${sec.department} Sec ${sec.section}`,
      room: `Block A - Room ${101 + idx}`,
      status: idx === 0 ? ("Completed" as const) : idx === 1 ? ("Ongoing" as const) : ("Upcoming" as const)
    }));
  }, [assignedSections]);

  const attendanceModuleData = useMemo(() => {
    return {
      stats: {
        conducted: Math.max(12, assignedSections.length * 12),
        pending: 2,
        presentToday: Math.max(24, assignedSections.length * 20),
        absentToday: 4,
        average: 89,
        leavesPending: 3
      }
    };
  }, [assignedSections]);

  const [todayClasses, setTodayClasses] = useState<TimetableSlot[]>([]);
  const [activeFormSlot, setActiveFormSlot] = useState<TimetableSlot | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedSection, setSelectedSection] = useState("ALL");

  useEffect(() => {
    setTodayClasses(dynamicTimetable);
    setSearchQuery("");
    setSelectedSubject("ALL");
    setSelectedSection("ALL");
    setActiveFormSlot(null);
  }, [dynamicTimetable]);

  const handleRefresh = () => {
    setLoading(true);
    toast.success("Synchronizing attendance logs...", {
      description: "Fetching latest appointed section registers.",
    });
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const handleTakeAttendance = (slot: TimetableSlot) => {
    setActiveFormSlot(slot);
  };

  const handleViewRegister = (slot: TimetableSlot) => {
    setSelectedSubject(slot.subject);
    setSelectedSection(slot.section);
    setActiveTab("register");
  };

  const handleSubmitAttendance = (presentRolls: string[], absentRolls: string[]) => {
    if (activeFormSlot) {
      setTodayClasses((prev) =>
        prev.map((c) =>
          c.time === activeFormSlot.time && c.subject === activeFormSlot.subject
            ? { ...c, status: "Completed" as const }
            : c
        )
      );
      toast.success(`Attendance submitted for ${activeFormSlot.subject} (${activeFormSlot.section})`);
    }
    setActiveFormSlot(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <AttendanceHeader
        departmentName={deptCode}
        academicYear="2024-25"
        semester="Sem 1 / Sem 5"
      />

      {/* 2. Global Load Stats */}
      <StatisticsCards attendanceData={attendanceModuleData} />

      {/* 3. Search and filter tools */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
        onRefresh={handleRefresh}
        subjectsList={todayClasses.map(c => c.subject)}
        sectionsList={todayClasses.map(c => c.section)}
      />

      {/* 4. Tab Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-2">
          <TabsList className="bg-card border border-border/60 p-1 rounded-xl">
            <TabsTrigger value="today" className="text-xs font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              Today's Schedule & Attendance ({todayClasses.length})
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              Student Attendance Register
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs font-bold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              Attendance Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Today's Classes */}
        <TabsContent value="today" className="space-y-6">
          {activeFormSlot ? (
            <AttendanceForm
              slot={activeFormSlot}
              onCancel={() => setActiveFormSlot(null)}
              onSubmit={handleSubmitAttendance}
            />
          ) : loading ? (
            <SkeletonLoader />
          ) : (
            <TodayClasses
              classes={todayClasses}
              onTakeAttendance={handleTakeAttendance}
              onViewRegister={handleViewRegister}
            />
          )}
        </TabsContent>

        {/* Tab 2: Attendance Register */}
        <TabsContent value="register" className="space-y-6">
          <AttendanceRegister
            subject={selectedSubject}
            section={selectedSection}
          />
        </TabsContent>

        {/* Tab 3: Attendance Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <AttendanceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
