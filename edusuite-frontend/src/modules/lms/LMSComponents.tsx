import React, { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  Video,
  FileCheck,
  HelpCircle,
  MessageSquare,
  VideoIcon,
  Plus,
  Search,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Play,
  Award,
  Calendar,
  ExternalLink,
  MessageCircle,
  Send,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import api from "@/lib/api";

import {
  fetchLMSSyllabus,
  fetchLMSResources,
  fetchLMSVideos,
  fetchLMSAssignments,
  fetchLMSQuizzes,
  fetchLMSForum,
  fetchLMSClasses,
  createLMSResource,
  createLMSVideo,
  createLMSAssignment,
  createLMSClass,
  deleteLMSResource,
  INITIAL_SYLLABUS,
  INITIAL_RESOURCES,
  INITIAL_VIDEOS,
  INITIAL_ASSIGNMENTS,
  INITIAL_QUIZZES,
  INITIAL_FORUM,
  INITIAL_CLASSES,
} from "./LMSService";

import type {
  ResourceItem,
  VideoLecture,
  AssignmentItem,
  QuizItem,
  ForumPost,
  ClassItem,
  SyllabusSubject,
} from "./types";

const SUBPARTS = [
  { id: "curriculum", label: "Curriculum & Syllabus", icon: BookOpen },
  { id: "notes", label: "Study Notes & PDFs", icon: FileText },
  { id: "videos", label: "Video Lectures", icon: Video },
  { id: "assignments", label: "Assignments Hub", icon: FileCheck },
  { id: "quizzes", label: "Quizzes & Tests", icon: HelpCircle },
  { id: "forum", label: "Discussion Forum", icon: MessageSquare },
  { id: "classes", label: "Virtual Classes", icon: VideoIcon },
] as const;

export function LMSModuleView({ isFaculty = false }: { isFaculty?: boolean } = {}) {
  const filteredSubparts = SUBPARTS.filter(
    (sp) => !isFaculty || (sp.id !== "curriculum" && sp.id !== "classes")
  );

  const [activeTab, setActiveTab] = useState<string>(
    isFaculty ? "notes" : "curriculum"
  );
  const [notesSubTab, setNotesSubTab] = useState<"my" | "others">("my");
  const [videosSubTab, setVideosSubTab] = useState<"my" | "others">("my");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Data states
  const [syllabus, setSyllabus] = useState<SyllabusSubject[]>(INITIAL_SYLLABUS);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [videos, setVideos] = useState<VideoLecture[]>(INITIAL_VIDEOS);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [quizzes, setQuizzes] = useState<QuizItem[]>(INITIAL_QUIZZES);
  const [forum, setForum] = useState<ForumPost[]>(INITIAL_FORUM);
  const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);

  // Dialog States
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  // Form States
  const [resForm, setResForm] = useState<{ title: string; subjectId: string; subject: string }>({
    title: "",
    subjectId: "",
    subject: ""
  });
  const [resFile, setResFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Profile & Assigned Courses lists
  const [profile, setProfile] = useState<any>(null);
  const [coursesList, setCoursesList] = useState<any[]>([]);

  // Delete Resource confirmation states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [vidForm, setVidForm] = useState<Partial<VideoLecture>>({
    title: "",
    subject: "CS401: Advanced AI",
    department: "CSE",
    duration: "45 mins",
    instructor: "Dr. K. Sai Teja",
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
  });
  const [asnForm, setAsnForm] = useState<{ title: string; subjectId: string; maxMarks: number }>({
    title: "",
    subjectId: "",
    maxMarks: 30
  });
  const [qpFile, setQpFile] = useState<File | null>(null);
  const [qpBase64, setQpBase64] = useState<string>("");
  const [launchingAsn, setLaunchingAsn] = useState(false);

  // Faculty Assignment Details & Submissions Modal States
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsFilter, setSubmissionsFilter] = useState<string>("All");

  // Grade Submission Dialog States
  const [gradeSubmissionTarget, setGradeSubmissionTarget] = useState<any | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  const handleQPFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Only PDF files are accepted for Question Paper.");
        return;
      }
      setQpFile(file);
      const reader = new FileReader();
      reader.onload = () => setQpBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLaunchAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asnForm.title) return toast.error("Enter assignment title");
    if (!asnForm.subjectId) return toast.error("Select subject taught by faculty");
    if (!qpFile || !qpBase64) return toast.error("Please upload Question Paper PDF file");

    setLaunchingAsn(true);
    try {
      const formattedSize = `${(qpFile.size / (1024 * 1024)).toFixed(1)} MB`;
      const created = await createLMSAssignment({
        title: asnForm.title,
        subjectId: asnForm.subjectId,
        questionPaperData: qpBase64,
        questionPaperFileName: qpFile.name,
        questionPaperFileSize: formattedSize,
        maxMarks: asnForm.maxMarks || 30
      });

      toast.success(`Assignment "${created.title}" launched successfully!`);
      setIsAddAssignmentOpen(false);
      setAsnForm({ title: "", subjectId: "", maxMarks: 30 });
      setQpFile(null);
      setQpBase64("");
      const freshAsn = await fetchLMSAssignments();
      setAssignments(freshAsn);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to launch assignment";
      toast.error(msg);
    } finally {
      setLaunchingAsn(false);
    }
  };

  const handleOpenAssignmentDetails = async (asg: any) => {
    setSelectedAssignment(asg);
    setSubmissionsFilter("All");
    setLoadingSubmissions(true);
    try {
      const subs = await fetchAssignmentSubmissions(asg.id);
      setAssignmentSubmissions(subs);
    } catch (err) {
      toast.error("Failed to load student submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGradeModal = (sub: any) => {
    setGradeSubmissionTarget(sub);
    setGradeMarks(sub.marks !== null ? sub.marks : 0);
  };

  const handleSaveGradeSubmit = async () => {
    if (!gradeSubmissionTarget || !selectedAssignment) return;
    const maxMarks = selectedAssignment.maxMarks || 30;
    if (isNaN(gradeMarks) || gradeMarks < 0 || gradeMarks > maxMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setGradingSubmitting(true);
    try {
      await gradeAssignmentSubmission(
        selectedAssignment.id,
        gradeSubmissionTarget.submissionId || "new",
        gradeMarks,
        gradeSubmissionTarget.studentId
      );

      toast.success(`Marks saved: ${gradeMarks}/${maxMarks} for ${gradeSubmissionTarget.studentName}`);
      setGradeSubmissionTarget(null);

      // Refresh submissions inside details modal & parent assignments list
      const freshSubs = await fetchAssignmentSubmissions(selectedAssignment.id);
      setAssignmentSubmissions(freshSubs);
      const freshAsn = await fetchLMSAssignments();
      setAssignments(freshAsn);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to save marks.";
      toast.error(msg);
    } finally {
      setGradingSubmitting(false);
    }
  };
  const [clsForm, setClsForm] = useState<Partial<ClassItem>>({
    subject: "CS401: Advanced AI",
    department: "CSE",
    topic: "",
    instructor: "Dr. K. Sai Teja",
    date: new Date().toISOString().split("T")[0],
    time: "04:00 PM - 05:00 PM",
    link: "https://meet.google.com/abc-defg-hij",
  });

  const loadAllLMS = async () => {
    setLoading(true);
    const [syl, res, vid, asn, qz, frm, cls] = await Promise.all([
      fetchLMSSyllabus(),
      fetchLMSResources(),
      fetchLMSVideos(),
      fetchLMSAssignments(),
      fetchLMSQuizzes(),
      fetchLMSForum(),
      fetchLMSClasses(),
    ]);
    setSyllabus(syl);
    setResources(res);
    setVideos(vid);
    setAssignments(asn);
    setQuizzes(qz);
    setForum(frm);
    setClasses(cls);
    setLoading(false);
  };

  useEffect(() => {
    loadAllLMS();

    // Fetch profile and course offerings assigned to logged-in faculty/admin
    async function loadProfileAndCourses() {
      try {
        const profileRes = await api.get("/api/auth/profile");
        if (profileRes.data) {
          setProfile(profileRes.data);
          
          const coursesRes = await api.get("/api/exams/courses");
          if (coursesRes.data && Array.isArray(coursesRes.data)) {
            const facultyName = profileRes.data.name || "";
            const facultyId = profileRes.data.id || "";
            const role = profileRes.data.role;

            const isAdmin = ["admin", "super_admin"].includes(role);
            if (isAdmin) {
              setCoursesList(coursesRes.data);
            } else {
              const cleanFName = facultyName.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s+/i, "").replace(/\s*\([^)]*\)/g, "").trim();

              const filtered = coursesRes.data.filter((c: any) => {
                // 1. Check sections array
                if (Array.isArray(c.sections)) {
                  const match = c.sections.some((s: any) => {
                    const mId = s.mentor_id || "";
                    const mName = (s.mentor_name || "").toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s+/i, "").trim();
                    return (
                      (facultyId && mId && facultyId === mId) ||
                      (cleanFName && mName && (mName.includes(cleanFName) || cleanFName.includes(mName)))
                    );
                  });
                  if (match) return true;
                }

                // 2. Check faculty string
                if (typeof c.faculty === "string") {
                  try {
                    if (c.faculty.startsWith("[")) {
                      const parsed = JSON.parse(c.faculty);
                      if (Array.isArray(parsed)) {
                        return parsed.some((s: any) => s.mentor_id === facultyId || s.mentor_name?.toLowerCase().includes(cleanFName));
                      }
                    }
                  } catch (e) {}
                  return c.faculty.toLowerCase().includes(cleanFName);
                }

                return false;
              });

              setCoursesList(filtered.length > 0 ? filtered : coursesRes.data);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile or courses in LMS", err);
      }
    }
    loadProfileAndCourses();
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are accepted.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setResFile(file);
  };

  const handleRemoveFile = () => {
    setResFile(null);
    const input = document.getElementById("pdf-file-upload-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  // Handlers for Add
  const handleAddResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.title) return toast.error("Enter document title");
    if (!resFile) return toast.error("Please choose a PDF file to upload");

    setUploading(true);
    try {
      const base64Data = await fileToBase64(resFile);
      const response = await api.post("/api/lms/resources", {
        title: resForm.title,
        subjectId: resForm.subjectId || null,
        resourceType: "STUDY_NOTE",
        fileName: resFile.name,
        fileSize: `${(resFile.size / (1024 * 1024)).toFixed(2)} MB`,
        fileData: base64Data
      });

      if (response.status === 201) {
        toast.success("Study note uploaded successfully.");
        setIsAddResourceOpen(false);
        setResForm({ title: "", subjectId: "", subject: "" });
        setResFile(null);
        // Refresh catalog list and count
        const freshRes = await fetchLMSResources();
        setResources(freshRes);
      } else {
        toast.error(response.data?.error || "Failed to upload study note.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload study note.");
    } finally {
      setUploading(false);
    }
  };

  // Handlers for Delete
  const handleOpenDeleteConfirm = (resource: ResourceItem) => {
    setResourceToDelete(resource);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);
    try {
      const success = await deleteLMSResource(resourceToDelete.id);
      if (success) {
        toast.success("Study note deleted successfully.");
        setIsDeleteConfirmOpen(false);
        setResourceToDelete(null);
        // Refresh catalog list
        const freshRes = await fetchLMSResources();
        setResources(freshRes);
      } else {
        toast.error("Failed to delete study note. You may not be authorized.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete study note.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (resource: ResourceItem) => {
    if (resource.url) {
      const downloadUrl = resource.url.startsWith("http")
        ? resource.url
        : `http://localhost:5000${resource.url}`;
      window.open(downloadUrl, "_blank");
    } else {
      toast.error("Download URL not available");
    }
  };


  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidForm.title) return toast.error("Enter video lecture title");
    try {
      const created = await createLMSVideo({
        ...vidForm,
        instructor: profile?.name || vidForm.instructor
      });
      setIsAddVideoOpen(false);
      setVidForm({ title: "", subject: "", duration: "45 mins", videoUrl: "" });
      toast.success(`Video Lecture "${created.title}" added!`);
      const freshVideos = await fetchLMSVideos();
      setVideos(freshVideos);
    } catch (err: any) {
      toast.error("Failed to add video lecture.");
    }
  };

  const handleAddAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asnForm.title) return toast.error("Enter assignment title");
    const created = await createLMSAssignment(asnForm);
    setAssignments((prev) => [created, ...prev]);
    setIsAddAssignmentOpen(false);
    toast.success(`Assignment "${created.title}" launched!`);
  };

  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsForm.topic) return toast.error("Enter class stream topic");
    const created = await createLMSClass(clsForm);
    setClasses((prev) => [created, ...prev]);
    setIsAddClassOpen(false);
    toast.success(`Virtual Class "${created.topic}" scheduled!`);
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `LMS_${activeTab.toUpperCase()}_${new Date().toISOString().split("T")[0]}.csv`;

    if (activeTab === "curriculum") {
      headers = ["Subject Code", "Subject Name", "Department", "Semester", "Coverage %", "Credits"];
      rows = syllabus.map((s) => [s.code, `"${s.name}"`, s.department, `"${s.semester}"`, `${s.coveragePct}%`, s.credits]);
    } else if (activeTab === "notes") {
      headers = ["ID", "Title", "Type", "Subject", "Department", "Size", "Uploaded By"];
      rows = resources.map((r) => [r.id, `"${r.title}"`, r.type, `"${r.subject}"`, r.department, r.size, `"${r.uploadedBy}"`]);
    } else if (activeTab === "videos") {
      headers = ["ID", "Title", "Subject", "Duration", "Instructor", "URL"];
      rows = videos.map((v) => [v.id, `"${v.title}"`, `"${v.subject}"`, v.duration, `"${v.instructor}"`, v.videoUrl]);
    } else {
      headers = ["ID", "Title/Topic", "Subject", "Department", "Date/Time"];
      rows = classes.map((c) => [c.id, `"${c.topic}"`, `"${c.subject}"`, c.department, `"${c.date} ${c.time}"`]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported LMS data to CSV!`);
  };

  const cleanName = (str: string) =>
    (str || "")
      .toLowerCase()
      .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s+/i, "")
      .replace(/\s*\([^)]*\)/g, "")
      .trim();

  const isMyResource = (r: ResourceItem) => {
    if (!profile?.name) return true;
    const pName = cleanName(profile.name);
    const rName = cleanName(r.uploadedBy);
    if (!pName || !rName) return false;
    return rName.includes(pName) || pName.includes(rName);
  };

  const myResources = resources.filter(isMyResource);
  const otherResources = resources.filter((r) => !isMyResource(r));

  const isMyVideo = (v: VideoLecture) => {
    if (!profile?.name) return true;
    const pName = cleanName(profile.name);
    const vName = cleanName(v.instructor);
    if (!pName || !vName) return false;
    return vName.includes(pName) || pName.includes(vName);
  };

  const myVideos = videos.filter(isMyVideo);
  const otherVideos = videos.filter((v) => !isMyVideo(v));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <BookOpen className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Learning Management System (LMS)
              </h1>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Course notes, video streams, assignments grading, MCQ online quizzes, doubts forum, and live classes.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {activeTab === "notes" && (
            <Button size="sm" onClick={() => setIsAddResourceOpen(true)} className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow">
              <Plus className="size-4" /> Upload Study Note
            </Button>
          )}

          {activeTab === "videos" && (
            <Button size="sm" onClick={() => setIsAddVideoOpen(true)} className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow">
              <Plus className="size-4" /> Add Video Lecture
            </Button>
          )}

          {activeTab === "assignments" && (
            <Button size="sm" onClick={() => setIsAddAssignmentOpen(true)} className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow">
              <Plus className="size-4" /> Launch Assignment
            </Button>
          )}

          {activeTab === "classes" && (
            <Button size="sm" onClick={() => setIsAddClassOpen(true)} className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow">
              <Plus className="size-4" /> Schedule Stream
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className={`grid grid-cols-2 ${isFaculty ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-3.5`}>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Study Notes & PDFs</span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{resources.length} Documents</p>
          <p className="text-[0.68rem] text-muted-foreground">PDF Study Materials</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Video Lectures</span>
            <Video className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{videos.length} Lectures</p>
          <p className="text-[0.68rem] text-muted-foreground">Recorded Video Library</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Assignments & Submissions</span>
            <FileCheck className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{assignments.length} Assignments</p>
          <p className="text-[0.68rem] text-muted-foreground">Worksheets & Grading</p>
        </div>

        {!isFaculty && (
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Live Virtual Classes</span>
              <VideoIcon className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-mono text-primary">{classes.length} Classes</p>
            <p className="text-[0.68rem] text-muted-foreground">Google Meet & Zoom Streams</p>
          </div>
        )}
      </div>

      {/* 7 LMS SUBPARTS TAB SWITCHER */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80 overflow-x-auto">
        <div className="flex items-center gap-4 w-full">
          {filteredSubparts.map((sp) => {
            const Icon = sp.icon;
            return (
              <button
                key={sp.id}
                onClick={() => setActiveTab(sp.id)}
                className={`flex-1 justify-center px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === sp.id
                    ? "bg-card text-primary shadow-sm border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {sp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBMODULE 1: CURRICULUM & SYLLABUS */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syllabus.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary font-mono text-xs">{s.code}</Badge>
                  <Badge variant="outline" className="font-mono text-xs">{s.regulation}</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.department} &middot; {s.semester}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground font-sans">Syllabus Completion Coverage:</span>
                    <span className="font-bold text-primary">{s.coveragePct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${s.coveragePct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMODULE 2: STUDY NOTES & PDF CATALOG */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          {/* SIDE-BY-SIDE SUB TABS */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <button
              onClick={() => setNotesSubTab("my")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                notesSubTab === "my"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <FileText className="size-3.5" />
              My Uploads
              <Badge variant="outline" className={`ml-1 text-[10px] px-1.5 py-0 h-4 ${notesSubTab === "my" ? "border-white/40 text-white" : "border-border text-muted-foreground"}`}>
                {myResources.length}
              </Badge>
            </button>

            <button
              onClick={() => setNotesSubTab("others")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                notesSubTab === "others"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Building2 className="size-3.5" />
              Other Faculty Uploads
              <Badge variant="outline" className={`ml-1 text-[10px] px-1.5 py-0 h-4 ${notesSubTab === "others" ? "border-white/40 text-white" : "border-border text-muted-foreground"}`}>
                {otherResources.length}
              </Badge>
            </button>
          </div>

          {/* ACTIVE CONTENT FOR NOTES */}
          {notesSubTab === "my" ? (
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> My Uploaded Study Notes & PDFs
                </h3>
              </div>
              {myResources.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                      <tr>
                        <th className="py-3 px-3">Resource Title</th>
                        <th className="py-3 px-3">Subject & Dept</th>
                        <th className="py-3 px-3">File Size</th>
                        <th className="py-3 px-3">Uploaded By</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3 text-right pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {myResources.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-3 font-bold text-foreground">{r.title}</td>
                          <td className="py-3 px-3">{r.subject} ({r.department})</td>
                          <td className="py-3 px-3 font-mono text-primary font-semibold">{r.size}</td>
                          <td className="py-3 px-3 font-medium text-foreground">{r.uploadedBy}</td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">{r.createdAt}</td>
                          <td className="py-3 px-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleDownload(r)} 
                                className="h-7 text-xs bg-brand-gradient text-white gap-1"
                              >
                                <Download className="size-3" /> Download
                              </Button>
                              {(!profile || ["admin", "super_admin"].includes(profile.role) || r.uploadedBy === profile.name) && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleOpenDeleteConfirm(r)} 
                                  className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 border border-red-200/60"
                                >
                                  <Trash2 className="size-3" /> Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground font-medium">
                  You haven't uploaded any study notes or PDFs yet. Click <span className="font-bold text-primary">Upload Study Note</span> above to share notes.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Building2 className="size-4 text-purple-600" /> Other Faculty Uploads
                </h3>
              </div>
              {otherResources.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                      <tr>
                        <th className="py-3 px-3">Resource Title</th>
                        <th className="py-3 px-3">Subject & Dept</th>
                        <th className="py-3 px-3">File Size</th>
                        <th className="py-3 px-3">Uploaded By</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3 text-right pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {otherResources.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-3 font-bold text-foreground">{r.title}</td>
                          <td className="py-3 px-3">{r.subject} ({r.department})</td>
                          <td className="py-3 px-3 font-mono text-primary font-semibold">{r.size}</td>
                          <td className="py-3 px-3 font-medium text-foreground">{r.uploadedBy}</td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">{r.createdAt}</td>
                          <td className="py-3 px-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleDownload(r)} 
                                className="h-7 text-xs bg-brand-gradient text-white gap-1"
                              >
                                <Download className="size-3" /> Download
                              </Button>
                              {(!profile || ["admin", "super_admin"].includes(profile.role) || r.uploadedBy === profile.name) && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleOpenDeleteConfirm(r)} 
                                  className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 border border-red-200/60"
                                >
                                  <Trash2 className="size-3" /> Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground font-medium">
                  No materials uploaded by other faculty members yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBMODULE 3: VIDEO LECTURES */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          {/* SIDE-BY-SIDE SUB TABS */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <button
              onClick={() => setVideosSubTab("my")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                videosSubTab === "my"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Video className="size-3.5" />
              My Uploads
              <Badge variant="outline" className={`ml-1 text-[10px] px-1.5 py-0 h-4 ${videosSubTab === "my" ? "border-white/40 text-white" : "border-border text-muted-foreground"}`}>
                {myVideos.length}
              </Badge>
            </button>

            <button
              onClick={() => setVideosSubTab("others")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                videosSubTab === "others"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <Building2 className="size-3.5" />
              Other Faculty Uploads
              <Badge variant="outline" className={`ml-1 text-[10px] px-1.5 py-0 h-4 ${videosSubTab === "others" ? "border-white/40 text-white" : "border-border text-muted-foreground"}`}>
                {otherVideos.length}
              </Badge>
            </button>
          </div>

          {/* ACTIVE CONTENT FOR VIDEOS */}
          {videosSubTab === "my" ? (
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Video className="size-4 text-primary" /> My Uploaded Video Lectures
                </h3>
              </div>
              {myVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myVideos.map((v) => (
                    <div key={v.id} className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
                      <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative group">
                        <iframe src={v.videoUrl} title={v.title} className="w-full h-full border-0" allowFullScreen />
                      </div>
                      <div>
                        <Badge variant="outline" className="font-mono text-xs text-primary mb-1">{v.subject}</Badge>
                        <h3 className="text-sm font-bold text-foreground">{v.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Instructor: {v.instructor} &middot; Duration: <span className="font-mono">{v.duration}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground font-medium">
                  You haven't uploaded any video lectures yet. Click <span className="font-bold text-primary">Add Video Lecture</span> above to publish video streams.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Building2 className="size-4 text-purple-600" /> Other Faculty Video Lectures
                </h3>
              </div>
              {otherVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherVideos.map((v) => (
                    <div key={v.id} className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
                      <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative group">
                        <iframe src={v.videoUrl} title={v.title} className="w-full h-full border-0" allowFullScreen />
                      </div>
                      <div>
                        <Badge variant="outline" className="font-mono text-xs text-primary mb-1">{v.subject}</Badge>
                        <h3 className="text-sm font-bold text-foreground">{v.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Instructor: {v.instructor} &middot; Duration: <span className="font-mono">{v.duration}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground font-medium">
                  No video lectures uploaded by other faculty members yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBMODULE 4: ASSIGNMENTS HUB (CARD-BASED) */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* SUMMARY CARDS TOP ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Active Assignments</span>
              <p className="text-2xl font-extrabold text-foreground">{assignments.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono">Total Submissions</span>
              <p className="text-2xl font-extrabold text-blue-600">
                {assignments.reduce((sum, a: any) => sum + Number(a.submittedCount || 0), 0)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider font-mono">Pending Grading</span>
              <p className="text-2xl font-extrabold text-amber-600">
                {assignments.reduce((sum, a: any) => sum + Number(a.pendingGradingCount || 0), 0)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider font-mono">Completed</span>
              <p className="text-2xl font-extrabold text-emerald-600">
                {assignments.reduce((sum, a: any) => sum + Number(a.gradedCount || 0), 0)}
              </p>
            </div>
          </div>

          {/* CARD-BASED ASSIGNMENT GRID */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileCheck className="size-4 text-primary" /> Active Assignment Hub
              </h3>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                {assignments.length} Total Launched
              </Badge>
            </div>

            {assignments.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground font-medium space-y-2">
                <p>No assignments launched yet.</p>
                <p>Click <span className="font-bold text-primary">+ Launch Assignment</span> above to create your first course assignment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignments.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                          {a.subjectCode || a.subject}
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 font-mono text-[10px]">
                          {a.status || "Active"}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-foreground line-clamp-2">{a.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <BookOpen className="size-3.5 text-muted-foreground/70" />
                          {a.subjectName || a.subject} ({a.department || "CSE"})
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/60 text-xs space-y-1.5">
                        <p className="text-muted-foreground">
                          Created by: <span className="font-semibold text-foreground">{a.facultyName}</span>
                        </p>
                        <p className="text-muted-foreground font-mono text-[11px]">
                          Created: {a.createdAt}
                        </p>

                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 space-y-1 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Submissions:</span>
                            <span className="font-bold text-primary">{a.submittedCount || 0} / {a.registeredStudentsCount || 60}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Graded:</span>
                            <span className="font-bold text-emerald-600">{a.gradedCount || 0} / {a.registeredStudentsCount || 60}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleOpenAssignmentDetails(a)}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs h-9 shadow-xs gap-1.5"
                    >
                      <Eye className="size-3.5" /> View Assignment Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMODULE 5: QUIZZES & TESTS */}
      {activeTab === "quizzes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((qz) => (
            <div key={qz.id} className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-500/10 text-purple-600 font-mono text-xs">{qz.subject}</Badge>
                <Badge variant="outline" className="font-mono text-xs">{qz.durationMins} Mins</Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">{qz.title}</h3>
              <p className="text-xs text-muted-foreground">Total Questions: <span className="font-bold text-foreground">{qz.questionsCount} MCQs</span> &middot; Date: {qz.date}</p>
              {qz.score && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-700 font-sans">Average Class Score:</span>
                  <span className="font-bold text-sm text-emerald-700">{qz.score}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUBMODULE 6: DISCUSSION FORUM */}
      {activeTab === "forum" && (
        <div className="space-y-4">
          {forum.map((post) => (
            <div key={post.id} className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary font-mono text-xs">{post.category}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{post.date}</span>
              </div>
              <h3 className="text-base font-bold text-foreground">{post.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <span className="font-medium text-foreground">Posted by {post.author} ({post.role})</span>
                <span className="text-primary font-bold">{post.comments.length} Responses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBMODULE 7: VIRTUAL CLASSES */}
      {activeTab === "classes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary font-mono text-xs">{c.subject}</Badge>
                <Badge className={c.status === "Live" ? "bg-red-500/10 text-red-600 border-red-500/20 font-bold animate-pulse" : "bg-blue-500/10 text-blue-600"}>
                  {c.status}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground">{c.topic}</h3>
              <p className="text-xs text-muted-foreground">Instructor: <span className="font-semibold text-foreground">{c.instructor}</span></p>
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-mono">
                <span className="text-muted-foreground">{c.date} ({c.time})</span>
                <Button size="sm" asChild className="h-7 text-xs bg-brand-gradient text-white gap-1">
                  <a href={c.link} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3" /> Join Stream
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOG: UPLOAD RESOURCE MODAL */}
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Upload Study Note / PDF
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddResourceSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input 
                required 
                placeholder="Unit 1: Neural Networks & Backpropagation Notes" 
                value={resForm.title || ""} 
                onChange={(e) => setResForm({ ...resForm, title: e.target.value })} 
                className="h-9 text-xs" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Related Subject</Label>
              <select
                value={resForm.subjectId || ""}
                onChange={(e) => {
                  const selectedCourse = coursesList.find((c) => c.id === e.target.value);
                  setResForm({
                    ...resForm,
                    subjectId: e.target.value,
                    subject: selectedCourse ? `${selectedCourse.code || selectedCourse.course_code}: ${selectedCourse.name || selectedCourse.course_name}` : ""
                  });
                }}
                className="w-full h-9 text-xs rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-hidden"
              >
                <option value="">Select a subject...</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code || c.course_code}: {c.name || c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">PDF File *</Label>
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-border bg-muted/30">
                <input
                  type="file"
                  accept=".pdf"
                  required={!resFile}
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-file-upload-input"
                />
                <label
                  htmlFor="pdf-file-upload-input"
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-card border border-border text-xs font-bold text-primary hover:bg-muted/40 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileText className="size-4 text-primary" /> Choose PDF file
                </label>
                {resFile && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs mt-1 animate-fadeIn">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate max-w-[200px]" title={resFile.name}>
                          📄 {resFile.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(resFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="h-6 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddResourceOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={uploading}
                className="bg-brand-gradient text-white text-xs font-semibold"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">Delete Study Note?</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-xs text-muted-foreground space-y-2">
            <p>
              Are you sure you want to delete <strong className="text-foreground">"{resourceToDelete?.title}"</strong>?
            </p>
            <p className="text-[10px] text-red-500 font-semibold">This action cannot be undone.</p>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirmDelete} 
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD VIDEO MODAL */}
      <Dialog open={isAddVideoOpen} onOpenChange={setIsAddVideoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Add Video Lecture URL
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVideoSubmit} className="space-y-3 pt-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Lecture Title *</Label><Input required placeholder="CNN Masterclass" value={vidForm.title || ""} onChange={(e) => setVidForm({ ...vidForm, title: e.target.value })} className="h-9 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Video Embed URL</Label><Input placeholder="https://www.youtube.com/embed/..." value={vidForm.videoUrl || ""} onChange={(e) => setVidForm({ ...vidForm, videoUrl: e.target.value })} className="h-9 text-xs font-mono" /></div>
            <DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => setIsAddVideoOpen(false)} className="text-xs">Cancel</Button><Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">Save Video</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: LAUNCH ASSIGNMENT MODAL */}
      <Dialog open={isAddAssignmentOpen} onOpenChange={setIsAddAssignmentOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card border-border shadow-xl space-y-4">
          <DialogHeader className="border-b border-border/80 pb-3 text-left">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Plus className="size-5 text-primary" /> Launch New Assignment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLaunchAssignmentSubmit} className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Assignment Title *</Label>
              <Input
                required
                placeholder="Assignment 1: CNN Image Classification"
                value={asnForm.title}
                onChange={(e) => setAsnForm({ ...asnForm, title: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Subject *</Label>
              <select
                required
                value={asnForm.subjectId}
                onChange={(e) => setAsnForm({ ...asnForm, subjectId: e.target.value })}
                className="w-full h-9 text-xs rounded-xl border border-border bg-card px-3 font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-hidden"
              >
                <option value="">Select subject taught by faculty...</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code || c.course_code}: {c.name || c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Maximum Marks</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={asnForm.maxMarks}
                onChange={(e) => setAsnForm({ ...asnForm, maxMarks: Number(e.target.value) })}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Question Paper PDF *</Label>
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-border bg-muted/30">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  required={!qpFile}
                  onChange={handleQPFileChange}
                  className="hidden"
                  id="qp-file-upload-input"
                />
                <label
                  htmlFor="qp-file-upload-input"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-card border border-border text-xs font-bold text-primary hover:bg-muted/40 cursor-pointer shadow-2xs transition-colors"
                >
                  <FileText className="size-4 text-primary" /> Choose Question Paper PDF
                </label>
                {qpFile && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs mt-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate max-w-[200px]">📄 {qpFile.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{(qpFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setQpFile(null); setQpBase64(""); }}
                      className="h-6 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsAddAssignmentOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={launchingAsn}
                className="bg-brand-gradient text-white text-xs font-bold h-9 shadow-xs"
              >
                {launchingAsn ? "Launching..." : "Launch Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: FACULTY ASSIGNMENT DETAILS & STUDENT SUBMISSIONS MODAL */}
      {selectedAssignment && (
        <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
          <DialogContent className="max-w-3xl rounded-2xl p-6 bg-card border-border shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border/80 pb-3 text-left">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  {selectedAssignment.subjectCode || selectedAssignment.subject}
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 font-mono text-xs">
                  Max Marks: {selectedAssignment.maxMarks || 30}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">{selectedAssignment.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Faculty: <span className="font-semibold text-foreground">{selectedAssignment.facultyName}</span> &middot; Department: {selectedAssignment.department} &middot; Created: {selectedAssignment.createdAt}
              </DialogDescription>
            </DialogHeader>

            {/* QUESTION PAPER DOWNLOAD SECTION */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-foreground font-mono">{selectedAssignment.questionPaperFileName || "Question_Paper.pdf"}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedAssignment.questionPaperFileSize || "Question Paper PDF"}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (selectedAssignment.questionPaperUrl) {
                    const url = selectedAssignment.questionPaperUrl.startsWith("http")
                      ? selectedAssignment.questionPaperUrl
                      : `http://localhost:5000${selectedAssignment.questionPaperUrl}`;
                    window.open(url, "_blank");
                  } else {
                    toast.info("Question paper PDF");
                  }
                }}
                className="h-8 bg-primary text-white font-bold rounded-lg text-xs gap-1.5"
              >
                <ExternalLink className="size-3.5" /> Open Question Paper
              </Button>
            </div>

            {/* SUBMISSIONS LIST SECTION */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <GraduationCap className="size-4 text-primary" /> Student Submissions ({assignmentSubmissions.length} Registered)
                </h4>

                {/* FILTER TABS */}
                <div className="flex items-center gap-1.5">
                  {["All", "Submitted", "Not Submitted", "Graded"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSubmissionsFilter(st)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        submissionsFilter === st
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {loadingSubmissions ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                  <Clock className="size-5 text-primary animate-spin mx-auto" />
                  <p>Loading student submission roster...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {assignmentSubmissions
                    .filter((sub) => {
                      if (submissionsFilter === "Submitted") return sub.status === "SUBMITTED" || sub.status === "GRADED";
                      if (submissionsFilter === "Not Submitted") return sub.status === "NOT_SUBMITTED" || sub.status === "VIEWED";
                      if (submissionsFilter === "Graded") return sub.status === "GRADED";
                      return true;
                    })
                    .map((sub) => (
                      <div
                        key={sub.studentId}
                        className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs space-y-2.5 text-xs flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{sub.studentName}</span>
                            {sub.status === "GRADED" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-[10px]">
                                Graded ({sub.marks}/{sub.maxMarks})
                              </Badge>
                            ) : sub.status === "SUBMITTED" ? (
                              <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold text-[10px]">
                                Submitted
                              </Badge>
                            ) : sub.status === "VIEWED" ? (
                              <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px]">
                                Viewed Paper
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                Not Submitted
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Roll No: <span className="font-semibold text-foreground">{sub.rollNumber}</span>
                          </p>
                          {sub.submittedAt && (
                            <p className="text-[10px] text-muted-foreground">
                              Submitted: {sub.submittedAt}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                          {sub.answerFileUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const url = sub.answerFileUrl.startsWith("http")
                                  ? sub.answerFileUrl
                                  : `http://localhost:5000${sub.answerFileUrl}`;
                                window.open(url, "_blank");
                              }}
                              className="h-7 text-[10px] gap-1 font-bold"
                            >
                              <FileText className="size-3 text-red-500" /> View Copy
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleOpenGradeModal(sub)}
                            className="h-7 text-[10px] bg-primary text-white font-bold gap-1"
                          >
                            <Award className="size-3" /> {sub.marks !== null ? "Edit Marks" : "Grade"}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAssignment(null)} className="text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG: GRADE SUBMISSION DIALOG */}
      {gradeSubmissionTarget && selectedAssignment && (
        <Dialog open={!!gradeSubmissionTarget} onOpenChange={() => setGradeSubmissionTarget(null)}>
          <DialogContent className="max-w-sm rounded-2xl p-5 bg-card border-border shadow-xl space-y-4">
            <DialogHeader className="border-b border-border/80 pb-2 text-left">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Award className="size-5 text-primary" /> Grade Submission
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-1">
                <p className="font-bold text-foreground">{gradeSubmissionTarget.studentName}</p>
                <p className="text-[11px] text-muted-foreground font-mono">Roll No: {gradeSubmissionTarget.rollNumber}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{selectedAssignment.title}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Marks Obtained (Max: {selectedAssignment.maxMarks || 30}) *
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={selectedAssignment.maxMarks || 30}
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(Number(e.target.value))}
                  className="h-9 text-sm font-mono font-bold"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border gap-2">
              <Button variant="outline" onClick={() => setGradeSubmissionTarget(null)} className="text-xs h-8">
                Cancel
              </Button>
              <Button
                onClick={handleSaveGradeSubmit}
                disabled={gradingSubmitting}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-8"
              >
                {gradingSubmitting ? "Saving..." : "Save Marks"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* DIALOG: SCHEDULE CLASS STREAM MODAL */}
      <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Schedule Google Meet / Zoom Stream
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddClassSubmit} className="space-y-3 pt-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Topic *</Label><Input required placeholder="Live Lecture: Llama-3 Fine-tuning" value={clsForm.topic || ""} onChange={(e) => setClsForm({ ...clsForm, topic: e.target.value })} className="h-9 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Stream Link (Google Meet / Zoom)</Label><Input placeholder="https://meet.google.com/..." value={clsForm.link || ""} onChange={(e) => setClsForm({ ...clsForm, link: e.target.value })} className="h-9 text-xs font-mono" /></div>
            <DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => setIsAddClassOpen(false)} className="text-xs">Cancel</Button><Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">Schedule Stream</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
