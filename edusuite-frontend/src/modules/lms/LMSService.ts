import api from "@/lib/api";
import type {
  ResourceItem,
  VideoLecture,
  AssignmentItem,
  QuizItem,
  ForumPost,
  ClassItem,
  SyllabusSubject,
} from "./types";

export const INITIAL_SYLLABUS: SyllabusSubject[] = [
  {
    id: "SYL-101",
    code: "CS401",
    name: "Advanced Artificial Intelligence & Deep Learning",
    department: "CSE",
    semester: "Semester 7",
    coveragePct: 85,
    credits: 4,
    regulation: "R24 Regulation",
  },
  {
    id: "SYL-102",
    code: "EC304",
    name: "VLSI System Design & Cadence Synthesis",
    department: "ECE",
    semester: "Semester 6",
    coveragePct: 78,
    credits: 4,
    regulation: "R24 Regulation",
  },
  {
    id: "SYL-103",
    code: "ME308",
    name: "Computer Aided Design (CAD) & Finite Element Analysis",
    department: "ME",
    semester: "Semester 5",
    coveragePct: 62,
    credits: 3,
    regulation: "R22 Regulation",
  },
  {
    id: "SYL-104",
    code: "AI402",
    name: "Natural Language Processing & Large Language Models",
    department: "AI&DS",
    semester: "Semester 7",
    coveragePct: 90,
    credits: 3,
    regulation: "R24 Regulation",
  },
];

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: "RES-201",
    title: "Unit 1: Neural Networks & Backpropagation Notes",
    type: "PDF Document",
    subject: "CS401: Advanced AI",
    department: "CSE",
    size: "4.2 MB",
    uploadedBy: "Dr. K. Sai Teja",
    createdAt: "2026-07-28",
  },
  {
    id: "RES-202",
    title: "VLSI CMOS Inverter Layout & DRC Rules Manual",
    type: "PDF Document",
    subject: "EC304: VLSI System Design",
    department: "ECE",
    size: "6.8 MB",
    uploadedBy: "Dr. Meera Rao",
    createdAt: "2026-07-29",
  },
  {
    id: "RES-203",
    title: "Transformer Architecture & Attention Mechanism PDF",
    type: "PDF Document",
    subject: "AI402: Natural Language Processing",
    department: "AI&DS",
    size: "3.5 MB",
    uploadedBy: "Dr. Rajesh Sharma",
    createdAt: "2026-07-30",
  },
];

export const INITIAL_VIDEOS: VideoLecture[] = [
  {
    id: "VID-301",
    title: "Deep Learning: Convolutional Neural Networks (CNN) Masterclass",
    subject: "CS401: Advanced AI",
    department: "CSE",
    duration: "45 mins",
    instructor: "Dr. K. Sai Teja",
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
    createdAt: "2026-07-25",
  },
  {
    id: "VID-302",
    title: "Cadence Virtuoso Schematic Capture & DRC Verification Walkthrough",
    subject: "EC304: VLSI System Design",
    department: "ECE",
    duration: "52 mins",
    instructor: "Dr. Meera Rao",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    createdAt: "2026-07-26",
  },
];

export const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "ASN-401",
    title: "Assignment 1: PyTorch ResNet-50 Image Classification Pipeline",
    subject: "CS401: Advanced AI",
    department: "CSE",
    dueDate: "2026-08-10",
    description: "Build an end-to-end PyTorch CNN script to classify CIFAR-10 dataset with >90% accuracy.",
    submissionCount: 52,
    totalStudents: 60,
    status: "Pending",
  },
  {
    id: "ASN-402",
    title: "Assignment 2: Verilog 8-bit ALU Design & Testbench Verification",
    subject: "EC304: VLSI System Design",
    department: "ECE",
    dueDate: "2026-08-08",
    description: "Write structural Verilog code for an 8-bit arithmetic logic unit with simulation waveform PDF.",
    submissionCount: 48,
    totalStudents: 58,
    status: "Graded",
    grade: "A+",
    feedback: "Outstanding Verilog testbench simulation waveforms!",
  },
];

export const INITIAL_QUIZZES: QuizItem[] = [
  {
    id: "QUIZ-501",
    title: "Mid-Term MCQ Quiz: Neural Networks & Optimization Algorithms",
    subject: "CS401: Advanced AI",
    department: "CSE",
    date: "2026-08-05",
    durationMins: 30,
    questionsCount: 4,
    questions: [
      {
        id: "Q1",
        question: "Which activation function helps mitigate the vanishing gradient problem in deep networks?",
        options: ["Sigmoid", "ReLU", "Tanh", "Linear"],
        correctIndex: 1,
      },
      {
        id: "Q2",
        question: "What is the primary mechanism behind Transformer models?",
        options: ["Recurrence", "Convolutions", "Self-Attention", "Pooling"],
        correctIndex: 2,
      },
    ],
    completed: true,
    score: 92,
  },
];

export const INITIAL_FORUM: ForumPost[] = [
  {
    id: "POST-601",
    title: "Doubt regarding PyTorch DataLoader batch collation error",
    category: "Doubts",
    department: "CSE",
    author: "Rohan Verma",
    role: "Student",
    date: "2026-07-31",
    content: "When attempting to stack variable length audio tensors in PyTorch DataLoader, RuntimeError is raised. Should pad_sequence be used in collate_fn?",
    comments: [
      {
        id: "C-1",
        author: "Dr. K. Sai Teja",
        role: "Faculty",
        content: "Yes Rohan! Use torch.nn.utils.rnn.pad_sequence in custom collate_fn to enforce uniform sequence lengths.",
        date: "2026-07-31 16:30",
      },
    ],
  },
  {
    id: "POST-602",
    title: "Announcement: Annual Hackathon & R24 Syllabus Workshop",
    category: "Announcements",
    department: "CSE",
    author: "Super Admin",
    role: "Super Admin",
    date: "2026-08-01",
    content: "All 3rd and 4th year CSE/AI&DS students are invited to register for the AI Hackathon 2026 in the Innovation Lab.",
    comments: [],
  },
];

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "CLS-701",
    subject: "CS401: Advanced AI",
    department: "CSE",
    topic: "Live Lecture: Fine-tuning Llama-3 & QLoRA Quantization",
    instructor: "Dr. K. Sai Teja",
    date: "2026-08-01",
    time: "05:00 PM - 06:00 PM",
    link: "https://meet.google.com/abc-defg-hij",
    status: "Live",
  },
  {
    id: "CLS-702",
    subject: "EC304: VLSI System Design",
    department: "ECE",
    topic: "Cadence Virtuoso Layout DRC Debugging Stream",
    instructor: "Dr. Meera Rao",
    date: "2026-08-02",
    time: "10:00 AM - 11:30 AM",
    link: "https://meet.google.com/xyz-uvwx-rst",
    status: "Upcoming",
  },
];

// API Call Handlers with static fallbacks
export async function fetchLMSSyllabus(): Promise<SyllabusSubject[]> {
  try {
    const res = await api.get("/api/lms/curriculum");
    if (res && Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {}
  return INITIAL_SYLLABUS;
}

export async function fetchLMSResources(): Promise<ResourceItem[]> {
  try {
    const res = await api.get("/api/lms/resources");
    if (res && Array.isArray(res.data)) return res.data;
  } catch {}
  return [];
}

export async function fetchLMSVideos(): Promise<VideoLecture[]> {
  try {
    const res = await api.get("/api/lms/videos");
    if (res && Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {}
  return INITIAL_VIDEOS;
}

export async function fetchLMSAssignments(): Promise<AssignmentItem[]> {
  try {
    const res = await api.get("/api/lms/assignments");
    if (res && Array.isArray(res.data)) return res.data;
  } catch (e) {
    console.error("fetchLMSAssignments error:", e);
  }
  return [];
}

export async function fetchStudentAssignments(): Promise<any[]> {
  try {
    const res = await api.get("/api/student/lms/assignments");
    if (res && Array.isArray(res.data)) return res.data;
  } catch (e) {
    console.error("fetchStudentAssignments error:", e);
  }
  return [];
}

export async function fetchLMSQuizzes(): Promise<QuizItem[]> {
  try {
    const res = await api.get("/api/lms/quizzes");
    if (res && Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {}
  return INITIAL_QUIZZES;
}

export async function fetchLMSForum(): Promise<ForumPost[]> {
  try {
    const res = await api.get("/api/lms/forum");
    if (res && Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {}
  return INITIAL_FORUM;
}

export async function fetchLMSClasses(): Promise<ClassItem[]> {
  try {
    const res = await api.get("/api/lms/classes");
    if (res && Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {}
  return INITIAL_CLASSES;
}

export async function createLMSResource(data: Partial<ResourceItem>): Promise<ResourceItem> {
  try {
    const res = await api.post("/api/lms/resources", data);
    if (res && res.data && res.data.id) return res.data;
  } catch {}
  return {
    id: `RES-${Math.floor(204 + Math.random() * 900)}`,
    title: data.title || "Lecture Notes PDF",
    type: "PDF Document",
    subject: data.subject || "CS401: Advanced AI",
    department: data.department || "CSE",
    size: "4.5 MB",
    uploadedBy: "Super Admin",
    createdAt: new Date().toISOString().split("T")[0],
  };
}

export async function createLMSVideo(data: Partial<VideoLecture>): Promise<VideoLecture> {
  try {
    const res = await api.post("/api/lms/videos", data);
    if (res && res.data && res.data.id) return res.data;
  } catch {}
  return {
    id: `VID-${Math.floor(303 + Math.random() * 900)}`,
    title: data.title || "New Lecture Video",
    subject: data.subject || "CS401: Advanced AI",
    department: data.department || "CSE",
    duration: data.duration || "40 mins",
    instructor: data.instructor || "Faculty",
    videoUrl: data.videoUrl || "https://www.youtube.com/embed/aircAruvnKk",
    createdAt: new Date().toISOString().split("T")[0],
  };
}

export async function createLMSAssignment(data: any): Promise<any> {
  const res = await api.post("/api/lms/assignments", data);
  if (res && res.data) return res.data;
  throw new Error("Failed to create assignment");
}

export async function fetchAssignmentSubmissions(assignmentId: string): Promise<any[]> {
  const res = await api.get(`/api/lms/assignments/${assignmentId}/submissions`);
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function gradeAssignmentSubmission(assignmentId: string, submissionId: string, marks: number, studentId?: string): Promise<any> {
  const res = await api.post(`/api/lms/assignments/${assignmentId}/submissions/${submissionId || "new"}/grade`, {
    marks,
    studentId
  });
  return res.data;
}

export async function recordQuestionPaperView(assignmentId: string): Promise<any> {
  try {
    const res = await api.post(`/api/student/lms/assignments/${assignmentId}/view-question-paper`);
    return res.data;
  } catch (e) {
    console.error("recordQuestionPaperView error:", e);
  }
}

export async function submitStudentAssignment(assignmentId: string, payload: any): Promise<any> {
  const res = await api.post(`/api/student/lms/assignments/${assignmentId}/submit`, payload);
  return res.data;
}

export async function createLMSClass(data: Partial<ClassItem>): Promise<ClassItem> {
  try {
    const res = await api.post("/api/lms/classes", data);
    if (res && res.data && res.data.id) return res.data;
  } catch {}
  return {
    id: `CLS-${Math.floor(703 + Math.random() * 900)}`,
    subject: data.subject || "CS401: Advanced AI",
    department: data.department || "CSE",
    topic: data.topic || "Live Stream Lecture",
    instructor: data.instructor || "Dr. K. Sai Teja",
    date: data.date || new Date().toISOString().split("T")[0],
    time: data.time || "04:00 PM - 05:00 PM",
    link: data.link || "https://meet.google.com/abc-defg-hij",
    status: "Upcoming",
  };
}

export async function deleteLMSResource(id: string): Promise<boolean> {
  try {
    const res = await api.delete(`/api/lms/resources/${id}`);
    if (res && res.status === 200) return true;
  } catch {}
  return false;
}

