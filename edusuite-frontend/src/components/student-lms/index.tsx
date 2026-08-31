import React, { useState, useEffect } from "react";
import { LmsTabType } from "./types";
import {
  MOCK_LMS_KPIS,
  MOCK_COURSES,
  MOCK_MATERIALS,
  MOCK_ASSIGNMENTS,
  MOCK_QUIZZES,
  MOCK_LIVE_CLASSES,
  MOCK_FORUM_POSTS,
  MOCK_CERTIFICATES,
} from "./mock-data";

import { LmsDashboardHeader } from "./lms-dashboard";
import { CourseMaterials } from "./course-materials";
import { VideoLectures } from "./video-lectures";
import { Assignments } from "./assignments";
import { Quizzes } from "./quizzes";
import { OnlineClasses } from "./online-classes";
import { ProgressAnalytics } from "./progress";
import { Certificates } from "./certificates";
import { AiLearningWidget } from "./ai-learning-widget";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RefreshCw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { fetchLMSVideos } from "@/modules/lms/LMSService";

export function StudentLmsModule() {
  const [activeTab, setActiveTab] = useState<LmsTabType>("course-materials");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);

  // DB Data states
  const [profile, setProfile] = useState<any>(null);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  const loadStudentLMSData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const profileRes = await api.get("/api/auth/profile");
      if (profileRes.data) {
        setProfile(profileRes.data);
      }

      // 2. Fetch Registrations
      const regsRes = await api.get("/api/exams/registrations");
      const studentId = profileRes.data?.id;

      if (regsRes.data && Array.isArray(regsRes.data) && studentId) {
        const studentRegs = regsRes.data.filter((r: any) => r.userId === studentId);
        
        // Map to CourseItem structure
        const mappedCourses = studentRegs.map((r: any) => {
          const c = r.course;
          
          let facultyName = "Dr. Arjun Dutta";
          try {
            if (c.faculty && c.faculty.startsWith("[")) {
              const parsed = JSON.parse(c.faculty);
              if (parsed[0]?.mentor_name) facultyName = parsed[0].mentor_name;
            } else if (c.faculty) {
              facultyName = c.faculty;
            }
          } catch (e) {}

          return {
            id: c.id,
            code: c.code,
            name: c.name,
            faculty: facultyName,
            credits: c.credits,
            semester: c.semester,
            status: "Active",
            completionPct: 80,
            totalModules: 8,
            completedModules: 6,
            syllabusUrl: "#",
            description: `${c.name} course offered in Semester ${c.semester} for ${c.department || "CSE"} department.`
          };
        });
        setDbCourses(mappedCourses);
      }

      // 3. Fetch LMS Resources
      const lmsRes = await api.get("/api/lms/student/resources");
      if (lmsRes.data && Array.isArray(lmsRes.data)) {
        const mappedMaterials = lmsRes.data.map((r: any) => ({
          id: r.id,
          courseCode: r.subject && r.subject.includes(":") ? r.subject.split(":")[0].trim() : "GEN",
          courseName: r.subject && r.subject.includes(":") ? r.subject.split(":")[1].trim() : r.subject,
          category: "PDFs",
          title: r.title,
          faculty: r.uploadedBy,
          uploadDate: r.createdAt,
          fileType: "PDF",
          size: r.size || "4.2 MB",
          downloads: 148,
          url: r.url || "",
          description: r.description || "Course study notes provided by department faculty."
        }));
        setMaterials(mappedMaterials);
      }

      // 4. Fetch Video Lectures
      const vids = await fetchLMSVideos();
      setVideos(vids);
    } catch (err) {
      console.error("Failed to load student LMS details", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudentLMSData();
  }, []);

  // Compute dynamic KPI metrics
  const dynamicKpis = {
    ...MOCK_LMS_KPIS,
    registeredCourses: dbCourses.length || MOCK_LMS_KPIS.registeredCourses,
    activeCourses: dbCourses.length || MOCK_LMS_KPIS.activeCourses,
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "upload-assignment":
        setActiveTab("assignments");
        toast.info("Navigated to Assignments tab to upload solution.");
        break;
      case "join-class":
        setActiveTab("online-classes");
        toast.info("Navigated to Online Classes tab.");
        break;
      case "download-notes":
        setActiveTab("course-materials");
        toast.info("Navigated to Course Materials repository.");
        break;
      case "open-library":
        toast.info("Opening EduSuite Digital Library...");
        break;
      case "ask-ai":
        toast.info("AI Tutor ready in sidebar!");
        break;
      case "take-quiz":
        setActiveTab("quizzes");
        toast.info("Navigated to Quizzes tab.");
        break;
      default:
        break;
    }
  };

  const toggleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 700);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">


      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : isEmptyState ? (
        <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <EmptyState
            title="No LMS Data Available"
            description="Your learning workspace currently has no registered courses or pending materials."
            actionLabel="Reset LMS Workspace"
            onAction={() => setIsEmptyState(false)}
          />
        </div>
      ) : (
        <>
          {/* HEADER & TOP KPIS */}
          <LmsDashboardHeader
            kpis={dynamicKpis}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onQuickAction={handleQuickAction}
          />

          {/* MAIN LMS CONTENT */}
          <div className="space-y-6 w-full">
            {activeTab === "course-materials" && (
              <CourseMaterials materials={materials} searchQuery={searchQuery} />
            )}

            {activeTab === "video-lectures" && (
              <VideoLectures videos={videos} searchQuery={searchQuery} />
            )}

            {activeTab === "assignments" && (
              <Assignments searchQuery={searchQuery} />
            )}

            {activeTab === "quizzes" && (
              <Quizzes quizzes={MOCK_QUIZZES} searchQuery={searchQuery} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
