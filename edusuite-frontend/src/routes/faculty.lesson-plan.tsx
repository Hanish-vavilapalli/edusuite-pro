import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useRole } from "@/context/role-context";
import {
  FACULTY_DASHBOARD_DATA_BY_DEPT,
  type FacultyDashboardData,
  type LessonPlanItem,
} from "@/data/faculty-mock-data";
import { getFacultyAssignedSections } from "@/lib/mock-examcell-state";

// Subcomponents imports
import { LessonPlanHeader } from "@/components/dashboard/lesson-plan/lesson-plan-header";
import { SearchFilterBar } from "@/components/dashboard/lesson-plan/search-filter-bar";
import { StatisticsCards } from "@/components/dashboard/lesson-plan/statistics-cards";
import { LessonPlanGrid } from "@/components/dashboard/lesson-plan/lesson-plan-grid";
import { LessonPlanDrawer } from "@/components/dashboard/lesson-plan/lesson-plan-drawer";
import { SkeletonLoader } from "@/components/dashboard/lesson-plan/skeleton-loader";
import { toast } from "sonner";

export const Route = createFileRoute("/faculty/lesson-plan")({
  head: () => ({
    meta: [{ title: "Lesson Plans — EduSuite Pro" }],
  }),
  component: FacultyLessonPlanPage,
});

function FacultyLessonPlanPage() {
  const { profile } = useRole();
  const deptCode = profile.department || "ECE";
  
  // Retrieve mock data dynamically based on active department
  const dashboardData = (FACULTY_DASHBOARD_DATA_BY_DEPT[deptCode] || FACULTY_DASHBOARD_DATA_BY_DEPT["CSE"]) as FacultyDashboardData;
  const activeName = profile.name || profile.personaName || "Amit Rathore";

  // Dynamically resolve assigned sections appointed by Exam Cell for logged-in faculty
  const assignedSections = useMemo(() => {
    return getFacultyAssignedSections(activeName);
  }, [activeName]);

  // Dynamically generate lesson plans ONLY for currently assigned teaching subjects with complete schema support
  const originalPlans: LessonPlanItem[] = useMemo(() => {
    return assignedSections.map((sec, idx) => {
      const typeLower = (sec.courseType || "").toLowerCase();
      const isIntegrated = typeLower.includes("integrated") || sec.credits >= 4;
      const isLab = typeLower.includes("lab");

      const typeLabel = isLab ? "Lab" : isIntegrated ? "Integrated" : "Theory";
      const weeklyHours = isIntegrated ? 5 : isLab ? 4 : 3;

      return {
        id: `lp-${sec.id || idx}`,
        code: sec.subjectCode,
        name: sec.subjectName,
        teachingMode: typeLabel,
        type: typeLabel as any,
        status: "Active" as const,
        academicYear: "2024-25",
        semester: `${sec.semester}`,
        assignedSections: [`${sec.department}-${sec.section}`],
        sections: [`${sec.department}-${sec.section}`],
        totalUnits: 5,
        unitsMapped: 5,
        completionPercentage: 65,
        syllabusCoveragePercentage: 65,
        weeklyHours: weeklyHours,
        regulation: "R22",
        classroom: sec.section === "A" ? "EC-101" : "EC-102",
        credits: sec.credits,
        teachingMethods: ["Blackboard & Interactive Slides", "Practical Problem Solving", "Case Studies"],
        timeline: [
          { date: "2024-08-01", title: "Course Orientation & Syllabus Handout", status: "Completed" },
          { date: "2024-08-20", title: "Unit 1 Assessment Test", status: "Completed" },
          { date: "2024-09-15", title: "Mid-Term Examination Review", status: "Scheduled" }
        ],
        weeklyPlan: [],
        monthlyPlan: [],
        units: [
          {
            unitNumber: 1,
            title: "Introduction & Foundational Concepts",
            plannedTopicsCount: 8,
            completedTopicsCount: 8,
            status: "Completed",
            startDate: "2024-08-01",
            endDate: "2024-08-20",
          },
          {
            unitNumber: 2,
            title: "Core Architecture & Principles",
            plannedTopicsCount: 10,
            completedTopicsCount: 7,
            status: "In Progress",
            startDate: "2024-08-21",
            endDate: "2024-09-15",
          },
          {
            unitNumber: 3,
            title: "Advanced System Operations",
            plannedTopicsCount: 9,
            completedTopicsCount: 0,
            status: "Pending",
            startDate: "2024-09-16",
            endDate: "2024-10-10",
          },
          {
            unitNumber: 4,
            title: "Real-World Applications & Labs",
            plannedTopicsCount: 8,
            completedTopicsCount: 0,
            status: "Pending",
            startDate: "2024-10-11",
            endDate: "2024-11-05",
          },
          {
            unitNumber: 5,
            title: "System Evaluation & Future Trends",
            plannedTopicsCount: 7,
            completedTopicsCount: 0,
            status: "Pending",
            startDate: "2024-11-06",
            endDate: "2024-11-30",
          },
        ],
      };
    }) as LessonPlanItem[];
  }, [assignedSections]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  
  // Detail Drawer state
  const [selectedPlan, setSelectedPlan] = useState<LessonPlanItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract unique subject names for filter
  const uniqueSubjects = Array.from(new Set(originalPlans.map((p) => p.name)));

  // Reset filters when department context swaps
  useEffect(() => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedSubject("ALL");
    setSelectedPlan(null);
    setDrawerOpen(false);
  }, [deptCode]);

  const handleRefresh = () => {
    setLoading(true);
    toast.success("Synchronizing lesson planning schedules...", {
      description: "Fetching updated curriculum maps.",
    });
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleSelectPlan = (plan: LessonPlanItem) => {
    setSelectedPlan(plan);
    setDrawerOpen(true);
  };

  // Filter lesson plans locally
  const filteredPlans = originalPlans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
    const matchesSubject = selectedSubject === "ALL" || p.name === selectedSubject;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <LessonPlanHeader
        academicYear={dashboardData.academicYear}
        semester={dashboardData.semester}
        onRefresh={handleRefresh}
      />

      {/* 2. Stats Dashboard */}
      <StatisticsCards plans={originalPlans} />

      {/* 3. Search and filter panel tools */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        uniqueSubjects={uniqueSubjects}
      />

      {/* 4. Cards grid view vs Skeleton loader */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <LessonPlanGrid
          plans={filteredPlans}
          onSelectPlan={handleSelectPlan}
        />
      )}

      {/* 5. Lesson Plan Details sliding Drawer */}
      <LessonPlanDrawer
        plan={selectedPlan}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
