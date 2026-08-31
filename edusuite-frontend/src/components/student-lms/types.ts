export type LmsTabType =
  | "course-materials"
  | "video-lectures"
  | "assignments"
  | "quizzes"
  | "online-classes"
  | "progress"
  | "certificates";

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
  facultyAvatar: string;
  credits: number;
  semester: number;
  status: "Active" | "Completed" | "Upcoming";
  completionPct: number;
  nextClass: string;
  totalModules: number;
  completedModules: number;
  syllabusUrl: string;
  description: string;
}

export interface MaterialItem {
  id: string;
  title: string;
  courseCode: string;
  category:
    | "Lecture Notes"
    | "PPTs"
    | "PDFs"
    | "Lab Manuals"
    | "Reference Books"
    | "Recorded Videos"
    | "Code Files"
    | "Previous Papers";
  faculty: string;
  uploadDate: string;
  fileType: string;
  downloads: number;
  size: string;
  isBookmarked: boolean;
  fileUrl: string;
}

export interface AssignmentItem {
  id: string;
  courseCode: string;
  title: string;
  faculty: string;
  assignedDate: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded" | "Overdue" | "In Review";
  marks: string;
  totalMarks: number;
  submissionType: "Online PDF" | "Code File" | "ZIP Archive" | "Rich Text";
  isLateSubmissionAllowed: boolean;
  lateFeeDeduction: string;
  instructions: string;
  submissionDate?: string;
  gradeFeedback?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizItem {
  id: string;
  name: string;
  courseCode: string;
  faculty: string;
  durationMins: number;
  questionsCount: number;
  totalMarks: number;
  maxAttempts: number;
  attemptsUsed: number;
  deadline: string;
  status: "Available" | "Attempted" | "Passed" | "Expired";
  scoreObtained?: number;
  questions: QuizQuestion[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  rollNo: string;
  score: number;
  timeSpent: string;
}

export interface LiveClassItem {
  id: string;
  courseCode: string;
  courseName: string;
  faculty: string;
  meetingTime: string;
  duration: string;
  platform: "Zoom" | "Google Meet" | "EduSuite Virtual Room";
  status: "Live Now" | "Upcoming" | "Completed";
  attendanceStatus: "Present" | "Absent" | "Pending";
  joinUrl: string;
  recordingUrl?: string;
  notesUrl?: string;
}

export interface ForumPost {
  id: string;
  courseCode: string;
  author: string;
  authorRole: "Student" | "Faculty" | "TA";
  authorAvatar: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  isUpvoted: boolean;
  isPinned: boolean;
  hasFacultyReply: boolean;
  createdAt: string;
  replies: {
    id: string;
    author: string;
    authorRole: "Student" | "Faculty" | "TA";
    authorAvatar: string;
    content: string;
    createdAt: string;
    upvotes: number;
  }[];
}

export interface CertificateItem {
  id: string;
  title: string;
  type: "Completed Course" | "Workshop" | "Internship" | "Hackathon" | "Skill Badge";
  issuer: string;
  issueDate: string;
  credentialId: string;
  verifyQrUrl: string;
  pdfUrl: string;
  skills: string[];
}

export interface LmsKpiMetrics {
  registeredCourses: number;
  activeCourses: number;
  completedCourses: number;
  pendingAssignments: number;
  upcomingQuizzes: number;
  studyHours: number;
  avgQuizScore: number;
  learningProgressPct: number;
}
