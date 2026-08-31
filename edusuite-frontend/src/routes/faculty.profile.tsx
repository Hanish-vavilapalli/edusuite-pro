import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/context/role-context";
import {
  FACULTY_DASHBOARD_DATA_BY_DEPT,
  DEPARTMENT_NAMES,
  type FacultyProfileData,
  type FacultyDashboardData,
} from "@/data/faculty-mock-data";
import { getFacultyAssignedSections } from "@/lib/mock-examcell-state";

// Subcomponents imports
import { ProfileHeader } from "@/components/dashboard/faculty-profile/profile-header";
import { PersonalInfoCard } from "@/components/dashboard/faculty-profile/personal-info-card";
import { ProfessionalInfoCard } from "@/components/dashboard/faculty-profile/professional-info-card";
import { AcademicInfoCard } from "@/components/dashboard/faculty-profile/academic-info-card";
import { ResearchCard } from "@/components/dashboard/faculty-profile/research-card";
import { DocumentsGrid } from "@/components/dashboard/faculty-profile/documents-grid";
import { StatisticsCards } from "@/components/dashboard/faculty-profile/statistics-cards";

export const Route = createFileRoute("/faculty/profile")({
  head: () => ({
    meta: [{ title: "My Profile — EduSuite Pro" }],
  }),
  component: FacultyProfilePage,
});

function FacultyProfilePage() {
  const { profile } = useRole();
  const deptCode = profile.department || "ECE";
  
  // Retrieve mock data dynamically based on active department
  const dashboardData = (FACULTY_DASHBOARD_DATA_BY_DEPT[deptCode] || FACULTY_DASHBOARD_DATA_BY_DEPT["CSE"]) as FacultyDashboardData;
  
  const activeName = profile.name || profile.personaName || "Amit Rathore";
  
  const activeEmpId = (profile as any).rollNumber || (typeof window !== "undefined" ? (() => {
    try {
      const u = localStorage.getItem("cms_user");
      if (u) {
        const parsed = JSON.parse(u);
        return parsed.rollNumber || parsed.roll_number || parsed.employeeId || parsed.empId;
      }
    } catch(e) {}
    return "FAC-EC-6";
  })() : "FAC-EC-6");

  const activeDept = DEPARTMENT_NAMES[deptCode] || profile.department || "Electronics & Communication Engineering";
  const activeEmail = profile.email || "faculty.ece@cms.com";

  const assignedSections = useMemo(() => {
    return getFacultyAssignedSections(activeName);
  }, [activeName]);

  // Compute dynamic stats for Publications, Projects, Workshops, and Teaching Experience
  const dynamicPublications = useMemo(() => {
    const r = dashboardData.profileData?.researchPublications;
    if (r) {
      return (r.journalPublications || 0) + (r.conferencePapers || 0) + (r.patents || 0);
    }
    return 18;
  }, [dashboardData]);

  const dynamicProjects = useMemo(() => {
    return dashboardData.profileData?.researchPublications?.researchProjects || 8;
  }, [dashboardData]);

  const dynamicWorkshops = useMemo(() => {
    return dashboardData.profileData?.researchPublications?.workshopsConducted || 6;
  }, [dashboardData]);

  const dynamicExperience = useMemo(() => {
    const expYears = dashboardData.profileData?.professionalInfo?.experienceYears || 8;
    return `${expYears} Years`;
  }, [dashboardData]);

  // Local state to keep track of edited fields (Frontend-only simulation)
  const [activeProfileData, setActiveProfileData] = useState<FacultyProfileData>(
    dashboardData.profileData
  );

  // Sync profile data dynamically with database user profile, research items, and assigned sections
  useEffect(() => {
    const base = dashboardData.profileData;
    const assignedCount = assignedSections.length;
    const assignedStudentSum = assignedSections.reduce((sum, s) => sum + (s.studentCount || 6), 0);

    setActiveProfileData({
      ...base,
      name: activeName,
      employeeId: activeEmpId,
      department: activeDept,
      stats: {
        ...base.stats,
        experience: dynamicExperience,
        subjectsHandled: assignedCount > 0 ? assignedCount : base.stats.subjectsHandled,
        studentsMentored: assignedStudentSum > 0 ? assignedStudentSum : base.stats.studentsMentored,
        publications: dynamicPublications,
        projectsGuided: dynamicProjects,
        workshopsConducted: dynamicWorkshops,
      },
      personalInfo: {
        ...base.personalInfo,
        fullName: activeName,
        email: activeEmail,
        department: activeDept,
      },
      professionalInfo: {
        ...base.professionalInfo,
        employeeId: activeEmpId,
        department: activeDept,
      },
      academicInfo: {
        ...base.academicInfo,
        assignedSubjects: assignedSections.map(s => `${s.subjectCode}: ${s.subjectName}`),
        sections: assignedSections.map(s => `Section ${s.section}`),
        coursesHandled: assignedSections.map(s => s.subjectName),
      }
    });
  }, [
    deptCode,
    activeName,
    activeEmpId,
    activeDept,
    activeEmail,
    assignedSections,
    dynamicPublications,
    dynamicProjects,
    dynamicWorkshops,
    dynamicExperience
  ]);

  const handleSaveProfile = (updatedData: Partial<FacultyProfileData>) => {
    setActiveProfileData((prev) => {
      const next = { ...prev };
      
      if (updatedData.personalInfo) {
        next.personalInfo = {
          ...prev.personalInfo,
          ...updatedData.personalInfo,
        };
      }
      
      if (updatedData.personalInfo?.emergencyContact && prev.profileCompletion.percentage === 92) {
        next.profileCompletion = {
          percentage: 96,
          missingFields: ["Current Profile Photo (High Resolution)"],
        };
      }

      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Profile Header with embedded Integrity Score & Skills Matrix */}
      <ProfileHeader
        profileData={activeProfileData}
        onSaveProfile={handleSaveProfile}
      />

      {/* 2. Fully Dynamic Stats Bar (Experience, Subjects, Mentees, Publications, Projects, Workshops) */}
      <StatisticsCards stats={activeProfileData.stats} />

      {/* 3. Full-width Main Tabs */}
      <div className="w-full">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1 bg-muted p-1.5 rounded-2xl border">
            <TabsTrigger value="personal" className="rounded-xl text-xs py-2.5 font-bold cursor-pointer">Personal</TabsTrigger>
            <TabsTrigger value="professional" className="rounded-xl text-xs py-2.5 font-bold cursor-pointer">Professional</TabsTrigger>
            <TabsTrigger value="academic" className="rounded-xl text-xs py-2.5 font-bold cursor-pointer">Academic</TabsTrigger>
            <TabsTrigger value="research" className="rounded-xl text-xs py-2.5 font-bold cursor-pointer">Research</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-xl text-xs py-2.5 font-bold cursor-pointer sm:col-span-1 col-span-2">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <PersonalInfoCard personalInfo={activeProfileData.personalInfo} />
          </TabsContent>

          <TabsContent value="professional" className="mt-4">
            <ProfessionalInfoCard professionalInfo={activeProfileData.professionalInfo} />
          </TabsContent>

          <TabsContent value="academic" className="mt-4">
            <AcademicInfoCard academicInfo={activeProfileData.academicInfo} />
          </TabsContent>

          <TabsContent value="research" className="mt-4">
            <ResearchCard researchInfo={activeProfileData.researchPublications} />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <DocumentsGrid documents={activeProfileData.documents} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
