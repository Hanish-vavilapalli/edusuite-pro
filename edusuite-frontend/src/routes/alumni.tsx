import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Globe,
  Users,
  Award,
  Heart,
  Search,
  Plus,
  UserPlus,
  Briefcase,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  Star,
  LayoutDashboard,
  Target,
  BarChart3,
  TrendingUp,
  DollarSign,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/alumni")({
  head: () => ({
    meta: [{ title: "Enterprise Alumni Management Portal — EduSuite Pro" }],
  }),
  component: AlumniPage,
});

// ============================================================================
// ALUMNI DATA SCHEMAS & MOCK DATA
// ============================================================================

export type AlumniTab = "dashboard" | "directory" | "analytics";

export interface AlumniProfileItem {
  id: string;
  name: string;
  avatar: string;
  batch: string;
  dept: string;
  company: string;
  designation: string;
  location: string;
  country: string;
  experienceYears: number;
  skills: string[];
  mentoringStatus: "Active Mentor" | "Open to Referrals" | "Guest Speaker" | "Industry Advisor";
  employmentStatus: "Employed" | "Entrepreneur" | "Higher Studies" | "Research Fellow";
  email: string;
  phone: string;
  bio: string;
  achievements: string[];
  educationTimeline: { degree: string; institution: string; year: string }[];
  workExperience: { role: string; company: string; duration: string }[];
  referralsSharedCount: number;
  contributionsTotal: string;
}

export interface AlumniJobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: "Full-Time" | "Remote" | "Hybrid" | "Contract";
  ctcRange: string;
  expRequired: string;
  postedBy: string;
  postedByBatch: string;
  skills: string[];
  postedDate: string;
}

export interface MentorItem {
  id: string;
  name: string;
  designation: string;
  company: string;
  domain: string;
  expYears: number;
  availableSlots: string[];
  status: "Available" | "Busy" | "Upcoming Session";
  rating: number;
  sessionsCompleted: number;
}

export interface AlumniEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  description: string;
  speakers: string[];
  registeredCount: number;
  category: "Global Reunion" | "Tech Symposium" | "Career Fireside" | "Regional Meetup";
}

export interface SuccessStoryItem {
  id: string;
  name: string;
  batch: string;
  dept: string;
  currentRole: string;
  company: string;
  image: string;
  headline: string;
  storySummary: string;
  achievement: string;
}

const INITIAL_ALUMNI_PROFILES: AlumniProfileItem[] = [
  {
    id: "ALM-2020-001",
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    batch: "Batch of 2020",
    dept: "Computer Science (CSE)",
    company: "Google Cloud",
    designation: "Senior Staff Software Engineer",
    location: "Mountain View, CA, USA",
    country: "USA",
    experienceYears: 6,
    skills: ["Distributed Systems", "Kubernetes", "Go", "Cloud Architecture"],
    mentoringStatus: "Active Mentor",
    employmentStatus: "Employed",
    email: "sarah.jenkins@alumni.edu",
    phone: "+1 (650) 890-4123",
    bio: "Lead architect for Google Cloud Distributed Database Engine. Passionate about guiding young CSE undergrads in cloud microservices.",
    achievements: ["Google Founder's Award 2024", "Published 4 IEEE Papers on Cloud Security", "Keynote Speaker at CloudNext 2025"],
    educationTimeline: [
      { degree: "B.Tech in Computer Science", institution: "EduSuite Pro University", year: "2016 – 2020" },
      { degree: "M.S. in Software Systems", institution: "Stanford University", year: "2020 – 2022" },
    ],
    workExperience: [
      { role: "Senior Staff Engineer", company: "Google Cloud", duration: "2022 – Present" },
      { role: "Software Engineering Intern", company: "Amazon AWS", duration: "2019 – 2020" },
    ],
    referralsSharedCount: 14,
    contributionsTotal: "₹2,50,000",
  },
  {
    id: "ALM-2019-042",
    name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    batch: "Batch of 2019",
    dept: "Electronics & Communication (ECE)",
    company: "Qualcomm India",
    designation: "Lead Systems Architect & Chip Designer",
    location: "Bengaluru, KA, India",
    country: "India",
    experienceYears: 7,
    skills: ["VLSI Design", "ARM Architecture", "C++", "Embedded Systems"],
    mentoringStatus: "Active Mentor",
    employmentStatus: "Employed",
    email: "vikram.m@qualcomm.com",
    phone: "+91 98765 43210",
    bio: "Silicon design specialist working on next-gen Snapdragon mobile processors and AI edge accelerators.",
    achievements: ["Patent Holder for Low-Power RF Transceivers", "Keynote Speaker at IEEE VLSI 2025"],
    educationTimeline: [
      { degree: "B.Tech in Electronics & Communication", institution: "EduSuite Pro University", year: "2015 – 2019" },
    ],
    workExperience: [
      { role: "Lead Systems Architect", company: "Qualcomm India", duration: "2021 – Present" },
      { role: "Hardware Engineer", company: "Intel Corporation", duration: "2019 – 2021" },
    ],
    referralsSharedCount: 9,
    contributionsTotal: "₹1,80,000",
  },
  {
    id: "ALM-2018-102",
    name: "Deepa Krishnan",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    batch: "Batch of 2018",
    dept: "Mechanical Engineering (ME)",
    company: "Tesla Motors",
    designation: "Senior Powertrain Design Manager",
    location: "Austin, TX, USA",
    country: "USA",
    experienceYears: 8,
    skills: ["EV Battery Systems", "SolidWorks", "Thermal Dynamics", "FEA Analysis"],
    mentoringStatus: "Guest Speaker",
    employmentStatus: "Employed",
    email: "dkrishnan@tesla.com",
    phone: "+1 (512) 441-9082",
    bio: "EV enthusiast heading battery pack thermal management at Tesla Gigafactory Austin.",
    achievements: ["Women in Automotive Innovation Award 2023", "Alumni Star Achiever"],
    educationTimeline: [
      { degree: "B.Tech in Mechanical Engineering", institution: "EduSuite Pro University", year: "2014 – 2018" },
      { degree: "M.S. in Automotive Tech", institution: "UT Austin", year: "2018 – 2020" },
    ],
    workExperience: [
      { role: "Senior Powertrain Manager", company: "Tesla Motors", duration: "2020 – Present" },
    ],
    referralsSharedCount: 6,
    contributionsTotal: "₹5,00,000",
  },
  {
    id: "ALM-2021-089",
    name: "Dr. Rohan Varma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    batch: "Batch of 2021",
    dept: "Computer Science (CSE)",
    company: "Stanford AI Lab",
    designation: "Postdoctoral Quantum AI Fellow",
    location: "Palo Alto, CA, USA",
    country: "USA",
    experienceYears: 5,
    skills: ["Quantum Computing", "LLM Fine-Tuning", "PyTorch", "Graph Neural Networks"],
    mentoringStatus: "Industry Advisor",
    employmentStatus: "Research Fellow",
    email: "rohan.varma@stanford.edu",
    phone: "+1 (650) 332-9011",
    bio: "Pioneering research in quantum machine learning algorithms for drug discovery.",
    achievements: ["Best Paper Award at NeurIPS 2025", "Stanford Presidential Postdoctoral Fellowship"],
    educationTimeline: [
      { degree: "B.Tech in CSE", institution: "EduSuite Pro University", year: "2017 – 2021" },
      { degree: "Ph.D. in Artificial Intelligence", institution: "Stanford University", year: "2021 – 2025" },
    ],
    workExperience: [
      { role: "Postdoctoral Quantum Fellow", company: "Stanford AI Lab", duration: "2025 – Present" },
    ],
    referralsSharedCount: 3,
    contributionsTotal: "₹1,20,000",
  },
  {
    id: "ALM-2017-015",
    name: "Ananya Sharma",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    batch: "Batch of 2017",
    dept: "Information Technology (IT)",
    company: "CloudScale AI",
    designation: "Co-Founder & CEO",
    location: "Bengaluru, KA, India",
    country: "India",
    experienceYears: 9,
    skills: ["SaaS Growth", "Venture Capital", "Product Strategy", "AI Infrastructure"],
    mentoringStatus: "Open to Referrals",
    employmentStatus: "Entrepreneur",
    email: "ananya@cloudscale.ai",
    phone: "+91 99000 11223",
    bio: "Built CloudScale AI to $1.2B valuation. Raised $85M Series C from Sequoia Capital.",
    achievements: ["Forbes 30 Under 30 Enterprise Tech", "ET Startup Founder of the Year 2025"],
    educationTimeline: [
      { degree: "B.Tech in IT", institution: "EduSuite Pro University", year: "2013 – 2017" },
    ],
    workExperience: [
      { role: "Founder & CEO", company: "CloudScale AI", duration: "2020 – Present" },
      { role: "Product Manager", company: "Microsoft India", duration: "2017 – 2020" },
    ],
    referralsSharedCount: 28,
    contributionsTotal: "₹25,00,000",
  },
  {
    id: "ALM-2022-077",
    name: "Karthik Subramanian",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    batch: "Batch of 2022",
    dept: "Computer Science (CSE)",
    company: "Microsoft India",
    designation: "Software Engineer II (Azure Core)",
    location: "Hyderabad, TS, India",
    country: "India",
    experienceYears: 4,
    skills: ["C#", ".NET Core", "Azure Microservices", "Distributed Caching"],
    mentoringStatus: "Active Mentor",
    employmentStatus: "Employed",
    email: "karthik.s@microsoft.com",
    phone: "+91 91234 56789",
    bio: "Azure Cloud Core storage engineer. Regular mentor for campus hackathons.",
    achievements: ["Microsoft Gold Star Performance 2024", "Smart India Hackathon National Winner"],
    educationTimeline: [
      { degree: "B.Tech in CSE", institution: "EduSuite Pro University", year: "2018 – 2022" },
    ],
    workExperience: [
      { role: "Software Engineer II", company: "Microsoft India", duration: "2022 – Present" },
    ],
    referralsSharedCount: 18,
    contributionsTotal: "₹1,50,000",
  },
];

const ALUMNI_REFERRAL_JOBS: AlumniJobItem[] = [
  {
    id: "JOB-ALM-01",
    title: "Senior Backend Engineer (Cloud Services)",
    company: "Google Cloud India",
    location: "Bengaluru, KA (Hybrid)",
    jobType: "Hybrid",
    ctcRange: "₹38 - ₹45 LPA",
    expRequired: "3 - 6 Years",
    postedBy: "Sarah Jenkins",
    postedByBatch: "Batch of 2020",
    skills: ["Go", "Kubernetes", "gRPC", "Distributed Systems"],
    postedDate: "2026-08-01",
  },
  {
    id: "JOB-ALM-02",
    title: "SDE-2 (Azure Infrastructure & Storage)",
    company: "Microsoft India",
    location: "Hyderabad, TS",
    jobType: "Full-Time",
    ctcRange: "₹32 - ₹40 LPA",
    expRequired: "2 - 5 Years",
    postedBy: "Karthik Subramanian",
    postedByBatch: "Batch of 2022",
    skills: ["C#", ".NET Core", "Azure", "Distributed Caching"],
    postedDate: "2026-07-29",
  },
  {
    id: "JOB-ALM-03",
    title: "Staff VLSI & SoC Design Engineer",
    company: "Qualcomm India",
    location: "Bengaluru, KA",
    jobType: "Full-Time",
    ctcRange: "₹42 - ₹55 LPA",
    expRequired: "5 - 8 Years",
    postedBy: "Vikram Malhotra",
    postedByBatch: "Batch of 2019",
    skills: ["Verilog", "ARM Architecture", "Physical Design", "VLSI"],
    postedDate: "2026-07-25",
  },
  {
    id: "JOB-ALM-04",
    title: "Full Stack AI Engineer (React + Python)",
    company: "CloudScale AI",
    location: "Remote (Global)",
    jobType: "Remote",
    ctcRange: "₹28 - ₹36 LPA",
    expRequired: "1 - 4 Years",
    postedBy: "Ananya Sharma",
    postedByBatch: "Batch of 2017",
    skills: ["React", "Python", "FastAPI", "OpenAI APIs"],
    postedDate: "2026-08-02",
  },
];

const ALUMNI_MENTORS: MentorItem[] = [
  {
    id: "MNT-01",
    name: "Sarah Jenkins",
    designation: "Senior Staff Engineer",
    company: "Google Cloud",
    domain: "Distributed Systems & Cloud Computing",
    expYears: 6,
    availableSlots: ["Saturday 10:00 AM", "Sunday 04:00 PM"],
    status: "Available",
    rating: 4.9,
    sessionsCompleted: 34,
  },
  {
    id: "MNT-02",
    name: "Vikram Malhotra",
    designation: "Lead Systems Architect",
    company: "Qualcomm",
    domain: "Hardware VLSI & Embedded Systems",
    expYears: 7,
    availableSlots: ["Sunday 11:30 AM"],
    status: "Available",
    rating: 4.8,
    sessionsCompleted: 28,
  },
  {
    id: "MNT-03",
    name: "Karthik Subramanian",
    designation: "Software Engineer II",
    company: "Microsoft",
    domain: "Interview Prep & System Design",
    expYears: 4,
    availableSlots: ["Friday 07:00 PM", "Saturday 03:00 PM"],
    status: "Available",
    rating: 5.0,
    sessionsCompleted: 52,
  },
];

const ALUMNI_EVENTS: AlumniEventItem[] = [
  {
    id: "EVT-2026-01",
    title: "Global Grand Alumni Reunion & Endowment Gala 2026",
    date: "2026-10-15",
    time: "05:00 PM – 10:00 PM IST",
    venue: "Main University Auditorium & Lawn, Campus Central",
    organizer: "Directorate of Alumni Relations & TPO Cell",
    description: "Annual homecoming event celebrating 25 years of excellence. Networking dinner, alumni awards ceremony, and research fund announcements.",
    speakers: ["Dr. Anand Sharma (VC)", "Ananya Sharma (CEO, CloudScale AI)", "Sarah Jenkins (Google)"],
    registeredCount: 420,
    category: "Global Reunion",
  },
  {
    id: "EVT-2026-02",
    title: "Silicon Valley Alumni Tech Symposium: GenAI & Quantum Computing",
    date: "2026-09-08",
    time: "09:00 AM PST (Online Global Webcast)",
    venue: "Google Developer Center, Sunnyvale, CA & Zoom Webcast",
    organizer: "US Bay Area Alumni Chapter",
    description: "Technical keynote sessions on large-scale AI deployment, LLM infra, and quantum algorithms delivered by alumni leaders in California.",
    speakers: ["Dr. Rohan Varma (Stanford)", "Sarah Jenkins (Google Cloud)"],
    registeredCount: 680,
    category: "Tech Symposium",
  },
];

const SUCCESS_STORIES: SuccessStoryItem[] = [
  {
    id: "STR-01",
    name: "Ananya Sharma",
    batch: "Batch of 2017",
    dept: "Information Technology",
    currentRole: "Founder & CEO, CloudScale AI",
    company: "CloudScale AI",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    headline: "From Campus Hackathon Winner to Building a $1.2B AI Unicorn",
    storySummary: "Ananya started coding her first cloud parser in the university CS lab during her final year project. Today, CloudScale AI serves over 400 Fortune 500 enterprises globally.",
    achievement: "Secured $85M Series C VC Funding & Forbes 30 Under 30 Honor",
  },
  {
    id: "STR-02",
    name: "Dr. Rohan Varma",
    batch: "Batch of 2021",
    dept: "Computer Science",
    currentRole: "Quantum AI Fellow, Stanford University",
    company: "Stanford AI Lab",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    headline: "Pioneering Quantum Algorithms for Life-Saving Oncology Therapeutics",
    storySummary: "After completing his B.Tech with 9.8 CGPA, Rohan published breakthrough quantum chemistry research that was recognized at NeurIPS and Stanford University.",
    achievement: "Published 12 High-Impact IEEE Papers & Awarded Stanford Presidential Fellowship",
  },
];

// ============================================================================
// ALUMNI PAGE COMPONENT
// ============================================================================

import { useRole } from "@/context/role-context";

export function AlumniPage() {
  const location = useLocation();
  const { role, flags, department: userDept, profile } = useRole();
  const isHod = role === "hod" || flags?.includes("isHod");
  const hodDept = userDept || (profile?.department as string) || "CSE";

  const searchObj = (location.search || {}) as Record<string, string | undefined>;
  const activeModule: AlumniTab = (searchObj["tab"] as AlumniTab) || "dashboard";

  const [alumniList, setAlumniList] = useState<AlumniProfileItem[]>(INITIAL_ALUMNI_PROFILES);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState(isHod ? hodDept : "All");

  // Modals & Drawers State
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfileItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);

  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isDonationsModalOpen, setIsDonationsModalOpen] = useState(false);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);

  const [isAddAlumniModalOpen, setIsAddAlumniModalOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  const [newAlumniForm, setNewAlumniForm] = useState({
    name: "",
    batch: "Batch of 2023",
    dept: `Computer Science (${hodDept})`,
    company: "",
    designation: "",
    location: "Bengaluru, KA, India",
  });

  const [jobListings, setJobListings] = useState<AlumniJobItem[]>(ALUMNI_REFERRAL_JOBS);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    company: "Google Cloud India",
    location: "Bengaluru, KA",
    ctcRange: "₹18 - ₹24 LPA",
    expRequired: "2+ Years",
  });

  const [donationAmount, setDonationAmount] = useState("50000");

  const filteredAlumni = alumniList.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter === "All" || a.batch === batchFilter;
    const matchesDept = isHod
      ? a.dept.toUpperCase().includes(hodDept.toUpperCase())
      : deptFilter === "All" || a.dept.includes(deptFilter);
    return matchesSearch && matchesBatch && matchesDept;
  });

  const handleAddAlumniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlumniForm.name || !newAlumniForm.company) return;

    const newRecord: AlumniProfileItem = {
      id: `ALM-2023-${Math.floor(100 + Math.random() * 900)}`,
      name: newAlumniForm.name,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      batch: newAlumniForm.batch,
      dept: newAlumniForm.dept,
      company: newAlumniForm.company,
      designation: newAlumniForm.designation || "Senior Software Engineer",
      location: newAlumniForm.location,
      country: "India",
      experienceYears: 3,
      skills: ["System Architecture", "Cloud"],
      mentoringStatus: "Active Mentor",
      employmentStatus: "Employed",
      email: `${newAlumniForm.name.toLowerCase().replace(/\s+/g, ".")}@alumni.edu`,
      phone: "+91 98000 00000",
      bio: "Experienced professional passionate about alumni networking.",
      achievements: ["Recognized Alumni Supporter"],
      educationTimeline: [
        { degree: "B.Tech in CSE", institution: "EduSuite Pro University", year: "2019 – 2023" },
      ],
      workExperience: [
        { role: newAlumniForm.designation || "Senior Engineer", company: newAlumniForm.company, duration: "2023 – Present" },
      ],
      referralsSharedCount: 2,
      contributionsTotal: "₹50,000",
    };

    setAlumniList((prev) => [newRecord, ...prev]);
    setIsAddAlumniModalOpen(false);
    toast.success(`Registered alumni record for ${newRecord.name}!`);
  };

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title || !newJobForm.company) return;

    const newJob: AlumniJobItem = {
      id: `JOB-ALM-0${jobListings.length + 1}`,
      title: newJobForm.title,
      company: newJobForm.company,
      location: newJobForm.location,
      jobType: "Full-Time",
      ctcRange: newJobForm.ctcRange,
      expRequired: newJobForm.expRequired,
      postedBy: "David Miller (Alumni Ambassador)",
      postedByBatch: "Batch of 2019",
      skills: ["React", "Cloud", "Node.js"],
      postedDate: new Date().toISOString().split("T")[0] || "",
    };

    setJobListings((prev) => [newJob, ...prev]);
    setIsPostJobModalOpen(false);
    toast.success(`Published job referral for ${newJob.title}!`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans animate-fade-up w-full">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Globe className="size-5 text-primary" /> Enterprise Alumni Network Portal
            </h1>
            <p className="text-xs text-muted-foreground">
              Scope: <strong className="text-foreground capitalize">{activeModule}</strong> • 5,420+ Global Network Roster
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddAlumniModalOpen(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl h-8 px-3 cursor-pointer gap-1"
            >
              <UserPlus className="size-3.5" /> + Register Alumni
            </Button>
            <Button
              onClick={() => setIsPostJobModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-8 px-3 cursor-pointer gap-1"
            >
              <Plus className="size-3.5" /> Share Job Referral
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. DASHBOARD VIEW (`/alumni?tab=dashboard`)                                */}
        {/* ========================================================================= */}
        {activeModule === "dashboard" && (
          <div className="space-y-6">
            {/* EXECUTIVE SUMMARY KPI CARDS */}
            <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              {[
                { label: "Total Alumni", val: "5,420", color: "text-blue-600" },
                { label: "Employed", val: "4,890", color: "text-emerald-600" },
                { label: "Higher Studies", val: "380", color: "text-purple-600" },
                { label: "Entrepreneurs", val: "150", color: "text-amber-600" },
                { label: "Active Mentors", val: "480", color: "text-cyan-600" },
                { label: "Donations", val: "₹4.2 Cr", color: "text-rose-600" },
                { label: "Job Referrals", val: "180", color: "text-indigo-600" },
                { label: "Upcoming Events", val: "15", color: "text-teal-600" },
              ].map((kpi) => (
                <div key={kpi.label} className="p-3.5 rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card space-y-1 shadow-2xs">
                  <span className="text-[0.68rem] font-semibold text-muted-foreground block truncate">{kpi.label}</span>
                  <p className={`font-display text-xl font-extrabold ${kpi.color}`}>{kpi.val}</p>
                </div>
              ))}
            </div>

            {/* QUICK-ACCESS FEATURE CARDS (5 MAIN SECTIONS ACCESSIBLE FROM DASHBOARD) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* 💼 JOB REFERRALS CARD */}
              <div className="p-5 rounded-3xl border border-border bg-card space-y-3 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-2xl bg-blue-500/10 text-blue-600 grid place-items-center font-bold">
                      <Briefcase className="size-5" />
                    </span>
                    <Badge variant="outline" className="text-[0.65rem] font-mono text-blue-600 bg-blue-50">180 Active Openings</Badge>
                  </div>
                  <h3 className="font-extrabold text-base text-foreground font-sans">Job Referrals Exchange</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Access job openings posted directly by alumni at Google, Microsoft, Qualcomm, and Tesla with instant referral requests.
                  </p>
                </div>
                <Button
                  onClick={() => setIsJobsModalOpen(true)}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-9 rounded-xl cursor-pointer gap-1.5 shadow-2xs mt-2"
                >
                  Explore Referral Openings <ArrowUpRight className="size-4" />
                </Button>
              </div>

              {/* 🎓 MENTORSHIP MATCHING CARD */}
              <div className="p-5 rounded-3xl border border-border bg-card space-y-3 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-2xl bg-purple-500/10 text-purple-600 grid place-items-center font-bold">
                      <Award className="size-5" />
                    </span>
                    <Badge variant="outline" className="text-[0.65rem] font-mono text-purple-600 bg-purple-50">480 Active Mentors</Badge>
                  </div>
                  <h3 className="font-extrabold text-base text-foreground font-sans">1-on-1 Student Mentorship</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Book private 30-minute career counseling and mock technical interviews with industry senior architects.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedMentor(ALUMNI_MENTORS[0] || null);
                    setIsMentorModalOpen(true);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 rounded-xl cursor-pointer gap-1.5 shadow-2xs mt-2"
                >
                  Book Mentorship Session <ArrowUpRight className="size-4" />
                </Button>
              </div>

              {/* 🗓️ REUNIONS & EVENTS CARD */}
              <div className="p-5 rounded-3xl border border-border bg-card space-y-3 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-2xl bg-teal-500/10 text-teal-600 grid place-items-center font-bold">
                      <Calendar className="size-5" />
                    </span>
                    <Badge variant="outline" className="text-[0.65rem] font-mono text-teal-600 bg-teal-50">15 Events</Badge>
                  </div>
                  <h3 className="font-extrabold text-base text-foreground font-sans">Events &amp; Reunions</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Global alumni reunions, Silicon Valley tech symposiums, and campus homecoming galas.
                  </p>
                </div>
                <Button
                  onClick={() => setIsEventsModalOpen(true)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-9 rounded-xl cursor-pointer gap-1.5 shadow-2xs mt-2"
                >
                  View Upcoming Events <ArrowUpRight className="size-4" />
                </Button>
              </div>

              {/* ❤️ ENDOWMENT DONATIONS CARD */}
              <div className="p-5 rounded-3xl border border-border bg-card space-y-3 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center font-bold">
                      <Heart className="size-5 fill-amber-500 text-amber-500" />
                    </span>
                    <Badge variant="outline" className="text-[0.65rem] font-mono text-amber-600 bg-amber-50">₹4.2 Cr Fund</Badge>
                  </div>
                  <h3 className="font-extrabold text-base text-foreground font-sans">Endowment &amp; Giving</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contribute to merit scholarships, AI research labs, and campus infrastructure with Section 80G tax benefits.
                  </p>
                </div>
                <Button
                  onClick={() => setIsDonationsModalOpen(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-9 rounded-xl cursor-pointer gap-1.5 shadow-2xs mt-2"
                >
                  Make Contribution <Heart className="size-4 fill-slate-950" />
                </Button>
              </div>

              {/* 🏆 SUCCESS STORIES CARD */}
              <div className="p-5 rounded-3xl border border-border bg-card space-y-3 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="size-10 rounded-2xl bg-rose-500/10 text-rose-600 grid place-items-center font-bold">
                      <Star className="size-5" />
                    </span>
                    <Badge variant="outline" className="text-[0.65rem] font-mono text-rose-600 bg-rose-50">Featured Stories</Badge>
                  </div>
                  <h3 className="font-extrabold text-base text-foreground font-sans">Alumni Success Stories</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Read inspiring journeys of alumni who built unicorn startups and achieved research breakthroughs.
                  </p>
                </div>
                <Button
                  onClick={() => setIsStoriesModalOpen(true)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 rounded-xl cursor-pointer gap-1.5 shadow-2xs mt-2"
                >
                  Read Success Stories <ArrowUpRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. ALUMNI DIRECTORY VIEW (`/alumni?tab=directory`)                         */}
        {/* ========================================================================= */}
        {activeModule === "directory" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-4 shadow-2xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alumni by name, company, designation, or skills..."
                  className="h-10 border-input bg-background/60 pl-9 text-xs focus-visible:ring-primary rounded-xl"
                />
              </div>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold cursor-pointer font-mono"
              >
                <option value="All">All Graduation Batches</option>
                <option value="Batch of 2022">Batch of 2022</option>
                <option value="Batch of 2021">Batch of 2021</option>
                <option value="Batch of 2020">Batch of 2020</option>
                <option value="Batch of 2019">Batch of 2019</option>
                <option value="Batch of 2018">Batch of 2018</option>
              </select>
            </div>

            {/* ALUMNI CARDS GRID */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAlumni.map((alumnus) => (
                <div key={alumnus.id} className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 space-y-3 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={alumnus.avatar} alt={alumnus.name} className="size-12 rounded-2xl object-cover border border-slate-200" />
                      <div>
                        <h3 className="font-extrabold text-sm text-foreground">{alumnus.name}</h3>
                        <span className="text-[0.68rem] text-muted-foreground font-mono block">{alumnus.batch} • {alumnus.dept}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl space-y-1 font-mono text-xs border border-border/50">
                      <p className="font-bold text-foreground font-sans">{alumnus.designation}</p>
                      <p className="text-primary font-bold">{alumnus.company}</p>
                      <p className="text-[0.68rem] text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3 text-rose-500" /> {alumnus.location}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 font-mono text-[0.62rem]">
                      {alumnus.skills.slice(0, 3).map((sk) => (
                        <Badge key={sk} variant="outline" className="bg-slate-50 dark:bg-muted">{sk}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProfile(alumnus);
                        setIsProfileModalOpen(true);
                      }}
                      className="h-8 text-[0.68rem] rounded-xl font-bold cursor-pointer gap-1"
                    >
                      <UserPlus className="size-3" /> View Profile
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toast.success(`Connected with ${alumnus.name}!`)}
                      className="h-8 text-[0.68rem] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl cursor-pointer gap-1"
                    >
                      <MessageSquare className="size-3" /> Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ANALYTICS VIEW (`/alumni?tab=analytics`)                              */}
        {/* ========================================================================= */}
        {activeModule === "analytics" && (
          <div className="space-y-6">
            <Panel title="Comprehensive Alumni Analytics & Metrics">
              <div className="grid gap-4 sm:grid-cols-2 pt-1 font-mono text-xs">
                {/* GEOGRAPHIC DISTRIBUTION */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <span className="font-bold text-foreground font-sans block text-sm">🌍 Geographic Footprint</span>
                  <div className="space-y-2">
                    {[
                      { region: "India (Bengaluru, Hyd, NCR)", pct: "62%", count: "3,360 Alumni" },
                      { region: "United States (Bay Area, Austin)", pct: "22%", count: "1,190 Alumni" },
                      { region: "United Kingdom & Europe", pct: "8%", count: "430 Alumni" },
                      { region: "Singapore & East Asia", pct: "5%", count: "270 Alumni" },
                    ].map((g) => (
                      <div key={g.region} className="space-y-1">
                        <div className="flex items-center justify-between text-[0.72rem]">
                          <span className="font-sans font-medium text-foreground">{g.region}</span>
                          <span className="font-bold text-primary">{g.pct}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2563EB] rounded-full" style={{ width: g.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RECRUITING EMPLOYERS */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <span className="font-bold text-foreground font-sans block text-sm">🏢 Top Employer Representation</span>
                  <div className="space-y-2">
                    {[
                      { company: "Google & Alphabet", count: "142 Alumni" },
                      { company: "Microsoft Corporation", count: "128 Alumni" },
                      { company: "Amazon & AWS", count: "165 Alumni" },
                      { company: "Qualcomm & Chipsets", count: "94 Alumni" },
                      { company: "Tesla & EV Motors", count: "58 Alumni" },
                    ].map((e) => (
                      <div key={e.company} className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/50">
                        <span className="font-sans font-bold text-foreground">{e.company}</span>
                        <span className="font-bold text-emerald-600">{e.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* REFERRAL PIPELINE STATS */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                  <span className="font-bold text-foreground font-sans block text-sm">📌 Job Referral Statistics</span>
                  <p className="text-muted-foreground">• Total Referrals Submitted: <strong className="text-foreground">180</strong></p>
                  <p className="text-muted-foreground">• Candidates Placed: <strong className="text-emerald-600">138 (76.6% Success Rate)</strong></p>
                  <p className="text-muted-foreground">• Pending Interviews: <strong className="text-purple-600">42 Candidates</strong></p>
                </div>

                {/* DONATION STATS */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                  <span className="font-bold text-foreground font-sans block text-sm">💰 Endowment Donation Statistics</span>
                  <p className="text-muted-foreground">• Total Endowment Fund: <strong className="text-amber-600">₹4.2 Crore</strong></p>
                  <p className="text-muted-foreground">• Scholarships Sponsored: <strong className="text-foreground">120 Students</strong></p>
                  <p className="text-muted-foreground">• Section 80G Tax Certificates: <strong className="text-blue-600">100% Issued</strong></p>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODALS & FEATURE DRAWERS                                                  */}
        {/* ========================================================================= */}

        {/* ALUMNI PROFILE MULTI-TAB MODAL */}
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogContent className="sm:max-w-2xl rounded-3xl p-6">
            {selectedProfile && (
              <div className="space-y-4 font-sans">
                <DialogHeader className="pb-3 border-b border-border">
                  <div className="flex items-center gap-4">
                    <img src={selectedProfile.avatar} alt={selectedProfile.name} className="size-16 rounded-2xl object-cover border border-border shadow-xs" />
                    <div>
                      <DialogTitle className="font-extrabold text-lg">{selectedProfile.name}</DialogTitle>
                      <DialogDescription className="text-xs font-mono text-primary font-bold">
                        {selectedProfile.designation} @ {selectedProfile.company}
                      </DialogDescription>
                      <span className="text-[0.68rem] text-muted-foreground font-mono">{selectedProfile.batch} • {selectedProfile.dept}</span>
                    </div>
                  </div>
                </DialogHeader>

                {/* PROFILE MULTI-TAB NAVIGATION */}
                <Tabs defaultValue="profile" className="space-y-3">
                  <TabsList className="bg-muted/40 border border-border p-1 rounded-xl flex flex-wrap gap-1">
                    <TabsTrigger value="profile" className="text-xs font-bold font-mono">Profile</TabsTrigger>
                    <TabsTrigger value="career" className="text-xs font-bold font-mono">Career</TabsTrigger>
                    <TabsTrigger value="referrals" className="text-xs font-bold font-mono">Referrals ({selectedProfile.referralsSharedCount})</TabsTrigger>
                    <TabsTrigger value="mentorship" className="text-xs font-bold font-mono">Mentorship</TabsTrigger>
                    <TabsTrigger value="achievements" className="text-xs font-bold font-mono">Achievements</TabsTrigger>
                    <TabsTrigger value="contributions" className="text-xs font-bold font-mono">Contributions</TabsTrigger>
                  </TabsList>

                  {/* TAB 1: PROFILE */}
                  <TabsContent value="profile" className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-[0.72rem]">
                      <p>📍 Location: <strong>{selectedProfile.location}</strong></p>
                      <p>📧 Email: <strong className="text-blue-600">{selectedProfile.email}</strong></p>
                      <p>📞 Phone: <strong>{selectedProfile.phone}</strong></p>
                      <p>Status: <strong className="text-emerald-600">{selectedProfile.mentoringStatus}</strong></p>
                    </div>
                    <p className="text-muted-foreground font-sans leading-relaxed text-xs">{selectedProfile.bio}</p>
                  </TabsContent>

                  {/* TAB 2: CAREER */}
                  <TabsContent value="career" className="space-y-3 text-xs font-mono">
                    <div className="space-y-2">
                      <span className="font-bold font-sans text-foreground">Work Experience:</span>
                      {selectedProfile.workExperience.map((w, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-card border border-border flex justify-between items-center">
                          <div>
                            <p className="font-sans font-bold text-foreground">{w.role}</p>
                            <p className="text-primary text-[0.68rem]">{w.company}</p>
                          </div>
                          <span className="text-[0.65rem] text-muted-foreground">{w.duration}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB 3: REFERRALS */}
                  <TabsContent value="referrals" className="space-y-2 text-xs font-mono">
                    <p className="text-muted-foreground">This alumni has submitted <strong>{selectedProfile.referralsSharedCount}</strong> candidate referrals for positions at {selectedProfile.company}.</p>
                  </TabsContent>

                  {/* TAB 4: MENTORSHIP */}
                  <TabsContent value="mentorship" className="space-y-2 text-xs font-mono">
                    <p className="text-emerald-600 font-bold">Status: {selectedProfile.mentoringStatus}</p>
                    <p className="text-muted-foreground">Available for 1-on-1 resume reviews and mock technical interviews.</p>
                  </TabsContent>

                  {/* TAB 5: ACHIEVEMENTS */}
                  <TabsContent value="achievements" className="space-y-2 text-xs font-sans">
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {selectedProfile.achievements.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </TabsContent>

                  {/* TAB 6: CONTRIBUTIONS */}
                  <TabsContent value="contributions" className="space-y-2 text-xs font-mono">
                    <p className="font-bold text-amber-600">Total Endowment Contributions: {selectedProfile.contributionsTotal}</p>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="pt-2 border-t border-border">
                  <Button variant="outline" onClick={() => setIsProfileModalOpen(false)} className="rounded-xl">Close</Button>
                  <Button
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      toast.success(`Connected with ${selectedProfile.name}! Invitation sent.`);
                    }}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl gap-1"
                  >
                    <MessageSquare className="size-4" /> Send Connection Note
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* JOB REFERRALS MODAL */}
        <Dialog open={isJobsModalOpen} onOpenChange={setIsJobsModalOpen}>
          <DialogContent className="sm:max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-extrabold text-lg">Alumni Job Referrals Exchange</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {jobListings.map((j) => (
                <div key={j.id} className="p-3.5 rounded-2xl border border-border bg-card space-y-1.5 font-mono text-xs">
                  <h4 className="font-sans font-extrabold text-sm text-foreground">{j.title}</h4>
                  <p className="text-primary font-bold">{j.company} • {j.location}</p>
                  <p className="text-emerald-600 font-bold">Package: {j.ctcRange}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsJobsModalOpen(false);
                      toast.success(`Requested referral from ${j.postedBy} for ${j.title}!`);
                    }}
                    className="w-full bg-[#2563EB] text-white font-bold h-7 rounded-lg cursor-pointer mt-1"
                  >
                    Request Referral
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* EVENTS MODAL */}
        <Dialog open={isEventsModalOpen} onOpenChange={setIsEventsModalOpen}>
          <DialogContent className="sm:max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-extrabold text-lg">Upcoming Reunions &amp; Events</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {ALUMNI_EVENTS.map((e) => (
                <div key={e.id} className="p-4 rounded-2xl border border-border bg-card space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-foreground">{e.title}</h4>
                  <p className="text-muted-foreground font-mono">{e.date} • {e.venue}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsEventsModalOpen(false);
                      toast.success(`Registered for ${e.title}!`);
                    }}
                    className="bg-[#2563EB] text-white font-bold h-7 px-3 rounded-lg cursor-pointer"
                  >
                    Register Ticket
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* DONATIONS MODAL */}
        <Dialog open={isDonationsModalOpen} onOpenChange={setIsDonationsModalOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <div className="space-y-3 text-xs">
              <DialogHeader>
                <DialogTitle className="font-extrabold text-base">Make Endowment Contribution</DialogTitle>
              </DialogHeader>
              <Input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} className="h-9 font-mono" />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDonationsModalOpen(false)}>Cancel</Button>
                <Button onClick={() => { setIsDonationsModalOpen(false); toast.success(`Donation of ₹${donationAmount} processed!`); }} className="bg-amber-500 text-slate-950 font-bold">Donate</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* STORIES MODAL */}
        <Dialog open={isStoriesModalOpen} onOpenChange={setIsStoriesModalOpen}>
          <DialogContent className="sm:max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-extrabold text-lg">Alumni Success Stories</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {SUCCESS_STORIES.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl border border-border bg-card space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-foreground">{s.headline}</h4>
                  <p className="text-primary font-bold font-mono">{s.name} — {s.currentRole}</p>
                  <p className="text-muted-foreground">{s.storySummary}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* REGISTER ALUMNI MODAL */}
        <Dialog open={isAddAlumniModalOpen} onOpenChange={setIsAddAlumniModalOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <form onSubmit={handleAddAlumniSubmit} className="space-y-3 text-xs">
              <DialogHeader>
                <DialogTitle className="font-extrabold text-base">Register New Alumni Record</DialogTitle>
              </DialogHeader>
              <Input placeholder="Full Name" value={newAlumniForm.name} onChange={(e) => setNewAlumniForm({ ...newAlumniForm, name: e.target.value })} />
              <Input placeholder="Company" value={newAlumniForm.company} onChange={(e) => setNewAlumniForm({ ...newAlumniForm, company: e.target.value })} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddAlumniModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#2563EB] text-white font-bold">Save Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* SHARE JOB REFERRAL MODAL */}
        <Dialog open={isPostJobModalOpen} onOpenChange={setIsPostJobModalOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <form onSubmit={handlePostJobSubmit} className="space-y-3 text-xs">
              <DialogHeader>
                <DialogTitle className="font-extrabold text-base">Share Job Referral</DialogTitle>
              </DialogHeader>
              <Input placeholder="Job Title" value={newJobForm.title} onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })} />
              <Input placeholder="Company Name" value={newJobForm.company} onChange={(e) => setNewJobForm({ ...newJobForm, company: e.target.value })} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPostJobModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 text-white font-bold">Post Referral</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
