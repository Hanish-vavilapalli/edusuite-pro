import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  UtensilsCrossed,
  Footprints,
  CalendarDays,
  Activity,
  Wrench,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  QrCode,
  Copy,
  Printer,
  FileText,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Bed,
  Layers,
  ArrowRight,
  Check,
  Send,
  Eye,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Download,
  ExternalLink,
  Ban,
  DoorClosed,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";

export interface StudentAuthData {
  id: string;
  name: string;
  rollNumber: string;
  collegeId: string;
  email: string;
  department: string;
  branch: string;
  year: number;
  semester: number;
  cgpa: number;
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  contact: string;
  parentName: string;
  parentContact: string;
  emergencyContact: string;
  address: string;
  hostel: {
    hostelName: string;
    block: string;
    floor: string;
    room: string;
    bed: string;
    roomType: string;
    status: string;
    joinedDate: string;
  };
}

export type StudentNavTab =
  | "dashboard"
  | "room"
  | "mess"
  | "outings"
  | "leaves"
  | "biometric"
  | "complaints"
  | "notifications"
  | "profile";

export const PersonalizedStudentPortal: React.FC<{ initialTab?: StudentNavTab }> = ({
  initialTab = "dashboard",
}) => {
  const [activeTab, setActiveTab] = useState<StudentNavTab>(initialTab);
  const [student, setStudent] = useState<StudentAuthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-data states
  const [roomData, setRoomData] = useState<any>(null);
  const [outings, setOutings] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [biometricLogs, setBiometricLogs] = useState<any[]>([]);
  const [messData, setMessData] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [biometricSubTab, setBiometricSubTab] = useState<"logs" | "analytics">("logs");

  // Modals
  const [applyLeaveModal, setApplyLeaveModal] = useState(false);
  const [outingModal, setOutingModal] = useState(false);
  const [complaintModal, setComplaintModal] = useState(false);
  const [activeGatePassModal, setActiveGatePassModal] = useState<any | null>(null);

  // Form States
  const [outingForm, setOutingForm] = useState({
    date: new Date().toISOString().split("T")[0],
    reason: "",
    destination: "",
    outTime: "05:00 PM",
    expectedReturnTime: "08:00 PM",
    remarks: "",
  });

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Home Visit",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    reason: "",
    emergencyContact: "+91 94401 23456",
  });

  const [complaintForm, setComplaintForm] = useState({
    category: "Room Maintenance",
    issue: "",
    priority: "HIGH",
    description: "",
  });

  // Fetch student profile & modules from backend
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("student_token") || localStorage.getItem("token");

      let headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:5000/api/student/me", { headers });
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      } else {
        // Fallback default student
        setStudent({
          id: "stu-001",
          name: "B. Vishnu Vardhan",
          rollNumber: "23341A4219",
          collegeId: "STU2026CSE001",
          email: "vishnu.cse@college.edu",
          department: "Computer Science (CSE)",
          branch: "Computer Science and Engineering",
          year: 3,
          semester: 6,
          cgpa: 8.92,
          gender: "Male",
          bloodGroup: "O+ positive",
          dateOfBirth: "15-08-2004",
          contact: "+91 94401 23456",
          parentName: "B. Nageswara Rao (Father)",
          parentContact: "+91 94401 23456",
          emergencyContact: "+91 94401 23456",
          address: "Flat 402, Sri Sai Towers, Vijayawada, AP",
          hostel: {
            hostelName: "CampusStay Men's Residency",
            block: "Boys Block A",
            floor: "Floor 1",
            room: "103",
            bed: "Bed 3",
            roomType: "3 Sharing AC Deluxe",
            status: "ALLOCATED",
            joinedDate: "12-07-2024",
          },
        });
      }

      // Fetch Sub-resources
      fetch("http://localhost:5000/api/student/me/room", { headers })
        .then((r) => r.json())
        .then((d) => setRoomData(d))
        .catch(() => {});

      fetch("http://localhost:5000/api/student/me/outings", { headers })
        .then((r) => r.json())
        .then((d) => setOutings(Array.isArray(d) ? d : []))
        .catch(() => {});

      fetch("http://localhost:5000/api/student/me/leaves", { headers })
        .then((r) => r.json())
        .then((d) => setLeaves(Array.isArray(d) ? d : []))
        .catch(() => {});

      fetch("http://localhost:5000/api/student/me/biometric-history", { headers })
        .then((r) => r.json())
        .then((d) => setBiometricLogs(Array.isArray(d) ? d : []))
        .catch(() => {});

      fetch("http://localhost:5000/api/student/me/mess", { headers })
        .then((r) => r.json())
        .then((d) => setMessData(d))
        .catch(() => {});

      fetch("http://localhost:5000/api/student/me/complaints", { headers })
        .then((r) => r.json())
        .then((d) => setComplaints(Array.isArray(d) ? d : []))
        .catch(() => {});

      fetch("http://localhost:5000/api/student/me/notifications", { headers })
        .then((r) => r.json())
        .then((d) => setNotifications(Array.isArray(d) ? d : []))
        .catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleCreateOuting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outingForm.reason || !outingForm.destination) {
      toast.error("Please fill in destination and reason.");
      return;
    }

    try {
      const token = localStorage.getItem("student_token") || localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/student/me/outings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          outingDate: outingForm.date,
          reason: outingForm.reason,
          outTime: outingForm.outTime,
          expectedReturnTime: outingForm.expectedReturnTime,
          destination: outingForm.destination,
          remarks: outingForm.remarks,
        }),
      });

      if (res.ok) {
        toast.success("Outing request submitted to Chief Warden for approval!");
        setOutingModal(false);
        setOutingForm({
          date: new Date().toISOString().split("T")[0],
          reason: "",
          destination: "",
          outTime: "05:00 PM",
          expectedReturnTime: "08:00 PM",
          remarks: "",
        });
        fetchStudentData();
      } else {
        toast.error("Could not submit outing request.");
      }
    } catch {
      toast.error("Network error submitting outing request.");
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason) {
      toast.error("Please specify a reason for leave.");
      return;
    }

    try {
      const token = localStorage.getItem("student_token") || localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/student/me/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(leaveForm),
      });

      if (res.ok) {
        toast.success("Leave application submitted! Parent verification call initiated.");
        setApplyLeaveModal(false);
        setLeaveForm({
          leaveType: "Home Visit",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
          reason: "",
          emergencyContact: "+91 94401 23456",
        });
        fetchStudentData();
      }
    } catch {
      toast.error("Error submitting leave application.");
    }
  };

  const handleToggleMealToken = async (mealId: string, currentStatus: string) => {
    const action = currentStatus === "BOOKED" ? "CANCEL" : "BOOK";
    try {
      const token = localStorage.getItem("student_token") || localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/student/me/mess-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mealId, action }),
      });

      if (res.ok) {
        toast.success(action === "BOOK" ? "Mess meal token booked!" : "Meal token cancelled.");
        if (messData && messData.meals) {
          setMessData({
            ...messData,
            meals: messData.meals.map((m: any) =>
              m.id === mealId ? { ...m, tokenStatus: action === "BOOK" ? "BOOKED" : "NOT BOOKED" } : m
            ),
          });
        }
      }
    } catch {
      toast.error("Failed to update meal token.");
    }
  };

  const handleRegisterComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.issue || !complaintForm.description) {
      toast.error("Please fill in issue title and description.");
      return;
    }

    try {
      const token = localStorage.getItem("student_token") || localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/student/me/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: complaintForm.category,
          issue: complaintForm.issue,
          description: complaintForm.description,
          priority: complaintForm.priority,
          roomNumber: student?.hostel?.room || "103",
        }),
      });

      if (res.ok) {
        toast.success("Maintenance complaint registered! Ticket dispatched to staff.");
        setComplaintModal(false);
        setComplaintForm({
          category: "Room Maintenance",
          issue: "",
          priority: "HIGH",
          description: "",
        });
        fetchStudentData();
      }
    } catch {
      toast.error("Error creating maintenance ticket.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    toast.success("Logged out from Student Portal.");
    window.location.href = "/login";
  };

  if (loading && !student) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] text-slate-700 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-bold tracking-wide text-slate-500">
            Loading Personalized Student Portal...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "biometric", label: "Biometric Tracking", icon: Activity },
    { id: "room", label: "My Room", icon: Building2 },
    { id: "mess", label: "Mess Tokens", icon: UtensilsCrossed },
    { id: "outings", label: "Outing Requests", icon: Footprints },
    { id: "complaints", label: "Complaints", icon: Wrench },
    { id: "leaves", label: "Leaves & Suspension", icon: CalendarDays },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notifications.filter((n) => !n.read).length },
  ];

  const studentInitials = student?.name
    ? student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "ST";

  return (
    <div className="flex min-h-screen bg-[#fcfcfd] text-slate-800 font-sans antialiased">
      {/* ── LEFT SIDEBAR (Matching Exact Screenshot: Pure White with CampusStay Logo) ── */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200/90 text-slate-800 flex flex-col justify-between hidden md:flex min-h-screen py-6 px-3.5 shadow-2xs">
        <div className="space-y-6">
          {/* Logo & Portal Branding */}
          <div className="px-2 py-1 flex items-center">
            <Logo showName className="h-10 w-auto" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as StudentNavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#e0f2fe] text-[#0284c7] font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-[#0284c7]" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-extrabold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Collapse icon button */}
        <div className="px-2 pt-4 flex items-center justify-between">
          <button
            onClick={handleLogout}
            title="Logout"
            className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-300 shadow-2xs transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>

          <button
            className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CANVAS ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fcfcfd] overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>CampusStay</span>
            <span>›</span>
            <span className="text-slate-900 font-bold capitalize">{activeTab}</span>
          </div>

          {/* Right Header: Student Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4f46e5] text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {student?.name ? student.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {student?.name || "MANI MANASVI GAVARA"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Student</p>
            </div>
          </div>
        </header>

        {/* ── CONTENT CONTAINER ── */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ── TAB 1: DASHBOARD (Matching Exact Screenshot Layout) ── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Greeting White Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Hi {student?.name ? student.name.toUpperCase() : "MANI MANASVI GAVARA"},
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Always stay updated with your campus
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("profile")}
                  className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>View Profile Options</span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>

              {/* 4 Pastel Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Room & Stay (Light Blue #e0f2fe) */}
                <div
                  onClick={() => setActiveTab("room")}
                  className="bg-[#e0f2fe] rounded-2xl p-5 border border-sky-200/60 shadow-2xs flex flex-col justify-between min-h-[140px] cursor-pointer hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                      <Bed className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-3">Room & Stay</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-2">
                      ALLOCATED
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {student?.hostel?.block || "Block A Girls"} - {student?.hostel?.room || "GA408"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchStudentData();
                        toast.success("Room status refreshed!");
                      }}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Active Outings (Light Purple #f3e8ff) */}
                <div
                  onClick={() => setActiveTab("outings")}
                  className="bg-[#f3e8ff] rounded-2xl p-5 border border-purple-200/60 shadow-2xs flex flex-col justify-between min-h-[140px] cursor-pointer hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-[#9333ea] text-white flex items-center justify-center shadow-xs">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-3">Active Outings</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-2">
                      USED THIS MONTH
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {outings.filter((o) => o.status === "APPROVED").length} / 3
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchStudentData();
                        toast.success("Outings refreshed!");
                      }}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Mess Tokens (Light Pink #ffe4e6) */}
                <div
                  onClick={() => setActiveTab("mess")}
                  className="bg-[#ffe4e6] rounded-2xl p-5 border border-rose-200/60 shadow-2xs flex flex-col justify-between min-h-[140px] cursor-pointer hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-[#e11d48] text-white flex items-center justify-center shadow-xs">
                      <UtensilsCrossed className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-3">Mess Tokens</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-2">
                      CURRENT STATUS
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {messData?.meals?.some((m: any) => m.tokenStatus === "BOOKED") ? "Booked" : "Not booked"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchStudentData();
                        toast.success("Mess tokens refreshed!");
                      }}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. Leave Management (Light Green #dcfce7) */}
                <div
                  onClick={() => setActiveTab("leaves")}
                  className="bg-[#dcfce7] rounded-2xl p-5 border border-emerald-200/60 shadow-2xs flex flex-col justify-between min-h-[140px] cursor-pointer hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-3">Leave Management</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-2">
                      ACTIVE LEAVES
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {leaves.filter((l) => l.status === "APPROVED").length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchStudentData();
                        toast.success("Leaves refreshed!");
                      }}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS Section (4 Solid Navy Buttons) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  QUICK ACTIONS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setOutingModal(true)}
                    className="h-11 rounded-xl bg-[#141b4d] hover:bg-[#1e2768] text-white font-bold text-xs flex items-center px-4 gap-3 transition-all cursor-pointer shadow-xs"
                  >
                    <Footprints className="h-4 w-4" />
                    <span>Outing Request</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("biometric")}
                    className="h-11 rounded-xl bg-[#141b4d] hover:bg-[#1e2768] text-white font-bold text-xs flex items-center px-4 gap-3 transition-all cursor-pointer shadow-xs"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Biometric</span>
                  </button>

                  <button
                    onClick={() => setComplaintModal(true)}
                    className="h-11 rounded-xl bg-[#141b4d] hover:bg-[#1e2768] text-white font-bold text-xs flex items-center px-4 gap-3 transition-all cursor-pointer shadow-xs"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Complaint</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("mess")}
                    className="h-11 rounded-xl bg-[#141b4d] hover:bg-[#1e2768] text-white font-bold text-xs flex items-center px-4 gap-3 transition-all cursor-pointer shadow-xs"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>Mess Tokens</span>
                  </button>
                </div>
              </div>

              {/* 2 Columns Split: RECENT COMPLAINTS & RECENT OUTINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Left: RECENT COMPLAINTS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      RECENT COMPLAINTS
                    </h3>
                    <button
                      onClick={() => setActiveTab("complaints")}
                      className="text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs min-h-[140px] flex flex-col justify-center">
                    {complaints.length === 0 ? (
                      <div className="text-center py-4 space-y-1">
                        <p className="text-xs font-bold text-slate-700">No complaints yet</p>
                        <p className="text-[11px] text-slate-400">Raise a complaint to report hostel issues.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {complaints.slice(0, 2).map((c) => (
                          <div key={c.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{c.issue || c.category}</p>
                              <p className="text-[10px] text-slate-400">{c.submittedAt}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: RECENT OUTINGS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      RECENT OUTINGS
                    </h3>
                    <button
                      onClick={() => setActiveTab("outings")}
                      className="text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs min-h-[140px] flex flex-col justify-center">
                    {outings.length === 0 ? (
                      <div className="text-center py-4 space-y-1">
                        <p className="text-xs font-bold text-slate-700">No recent outings</p>
                        <p className="text-[11px] text-slate-400">Apply for a pass when you need to leave the campus.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {outings.slice(0, 2).map((o) => (
                          <div key={o.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{o.destination || o.reason}</p>
                              <p className="text-[10px] text-slate-400">{o.outingDate} ({o.outTime || "05:00 PM"})</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              o.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-purple-50 text-purple-800 border-purple-200"
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: MY ROOM ── */}
          {activeTab === "room" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 md:col-span-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Building2 className="h-4 w-4 text-blue-600" /> Hostel Accommodation Dossier
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Hostel Block</p>
                      <p className="text-sm font-black text-slate-900 mt-1">{student?.hostel?.block || "Boys Block A"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Floor & Room</p>
                      <p className="text-sm font-black text-blue-700 mt-1">
                        {student?.hostel?.floor || "Floor 1"} • Room {student?.hostel?.room || "103"}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Assigned Bed</p>
                      <p className="text-sm font-black text-emerald-700 mt-1">{student?.hostel?.bed || "Bed 3"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Room Category</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{student?.hostel?.roomType || "3 Sharing AC Deluxe"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Warden in Charge</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{roomData?.room?.wardenInCharge || "Dr. V. Rao"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Warden Hotline</p>
                      <p className="text-xs font-mono font-bold text-blue-700 mt-1">{roomData?.room?.wardenContact || "+91 98490 55443"}</p>
                    </div>
                  </div>

                  {/* Room Amenities */}
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-2">Room Amenities Provided:</p>
                    <div className="flex flex-wrap gap-2">
                      {(roomData?.room?.amenities || [
                        "Split AC 1.5 Ton",
                        "High Speed Wi-Fi 6",
                        "Individual Study Table",
                        "Attached Washroom",
                        "Geyser",
                      ]).map((am: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 flex items-center gap-1.5"
                        >
                          <Check className="h-3 w-3 text-emerald-600" /> {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Roommates List */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <User className="h-4 w-4 text-blue-600" /> Room Occupants
                  </h3>
                  <div className="space-y-3">
                    {(roomData?.roommates || [
                      { name: "K. Sai Teja", rollNumber: "23341A0512", branch: "CSE", bed: "Bed 1", status: "Present" },
                      { name: "Rohan Verma", rollNumber: "STU2026ECE018", branch: "ECE", bed: "Bed 2", status: "Present" },
                      { name: student?.name || "B. Vishnu Vardhan", rollNumber: student?.rollNumber || "23341A4219", branch: "CSE", bed: "Bed 3", status: "Self" },
                    ]).map((r: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          r.status === "Self"
                            ? "border-blue-300 bg-blue-50/50"
                            : "border-slate-200 bg-slate-50"
                        } flex items-center justify-between`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            {r.name} {r.status === "Self" && <span className="text-[10px] text-blue-700 font-extrabold">(You)</span>}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">{r.rollNumber} • {r.branch}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                          {r.bed}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: MESS / FOOD ── */}
          {activeTab === "mess" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(messData?.meals || []).map((meal: any) => (
                  <div
                    key={meal.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-slate-900">{meal.meal}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            meal.tokenStatus === "BOOKED"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {meal.tokenStatus}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {meal.time}
                      </p>
                      <p className="text-xs text-slate-700 font-medium mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {meal.menu}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {meal.dietType}
                      </span>
                      <button
                        onClick={() => handleToggleMealToken(meal.id, meal.tokenStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          meal.tokenStatus === "BOOKED"
                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            : "bg-[#162354] hover:bg-[#1d4ed8] text-white shadow-sm"
                        }`}
                      >
                        {meal.tokenStatus === "BOOKED" ? "Cancel Token" : "Book Token"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: OUTINGS ── */}
          {activeTab === "outings" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setOutingModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> New Outing Request
                </button>
              </div>

              {/* Table Matching Image 2 Navy Table Header */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#162354] text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">OUTING DATE & TIME</th>
                        <th className="py-3 px-4">DESTINATION</th>
                        <th className="py-3 px-4">PURPOSE</th>
                        <th className="py-3 px-4">PARENT APPROVAL</th>
                        <th className="py-3 px-4">WARDEN STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                      {outings.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{o.outingDate}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{o.outTime} – {o.expectedReturnTime}</p>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{o.destination}</td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{o.reason}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {o.parentApproval || "APPROVED"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                o.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : o.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {o.status === "APPROVED" && (
                              <button
                                onClick={() => setActiveGatePassModal(o)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-bold text-[11px] text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="h-3 w-3 text-blue-600" /> View Gatepass
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: LEAVES ── */}
          {activeTab === "leaves" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setApplyLeaveModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Apply Leave
                </button>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#162354] text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">LEAVE TYPE</th>
                        <th className="py-3 px-4">FROM – TO DATES</th>
                        <th className="py-3 px-4">REASON</th>
                        <th className="py-3 px-4">PARENT CONSENT</th>
                        <th className="py-3 px-4">WARDEN APPROVAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                      {leaves.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{l.leaveType}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {l.startDate} → {l.endDate}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs">{l.reason}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              {l.parentApproval || "VERIFIED"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                l.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: BIOMETRIC (Matches Exact Pic 2 Design) ── */}
          {activeTab === "biometric" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Title & Subtitle */}
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
                  Biometric Tracking
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Monitor and analyze student attendance and movement patterns
                </p>
              </div>

              {/* Sub-tabs: Logs & Analytics */}
              <div className="flex items-center gap-6 border-b border-slate-200 pt-1">
                <button
                  onClick={() => setBiometricSubTab("logs")}
                  className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                    biometricSubTab === "logs"
                      ? "text-[#141b4d]"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Logs
                  {biometricSubTab === "logs" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#141b4d] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setBiometricSubTab("analytics")}
                  className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                    biometricSubTab === "analytics"
                      ? "text-[#141b4d]"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Analytics
                  {biometricSubTab === "analytics" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#141b4d] rounded-full" />
                  )}
                </button>
              </div>

              {/* SUB-TAB 1: LOGS */}
              {biometricSubTab === "logs" && (
                <div className="space-y-4 pt-1">
                  {/* Attendance Logs Header + Filter Button */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#0f172a]">
                      Attendance Logs
                    </h2>
                    <button
                      onClick={() => {
                        toast.info("Showing biometric turnstile logs filter");
                      }}
                      className="px-4 py-2 rounded-lg bg-[#141b4d] hover:bg-[#1e2768] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </button>
                  </div>

                  {/* Clean White Rounded Card with Deep Navy Table Header */}
                  <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141b4d] text-white font-bold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="py-3.5 px-5">STUDENT</th>
                            <th className="py-3.5 px-5">BLOCK</th>
                            <th className="py-3.5 px-5">FLOOR</th>
                            <th className="py-3.5 px-5">ROOM</th>
                            <th className="py-3.5 px-5">TYPE</th>
                            <th className="py-3.5 px-5">TIMESTAMP</th>
                            <th className="py-3.5 px-5">DEVICE</th>
                            <th className="py-3.5 px-5">METHOD</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {biometricLogs.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-14 text-center text-slate-400 text-xs font-medium">
                                No records found.
                              </td>
                            </tr>
                          ) : (
                            biometricLogs.map((b) => (
                              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-5 font-bold text-slate-900">
                                  {student?.name || "Student"}
                                </td>
                                <td className="py-3.5 px-5">{student?.hostel?.block || "Block A Girls"}</td>
                                <td className="py-3.5 px-5">{student?.hostel?.floor || "Floor 1"}</td>
                                <td className="py-3.5 px-5 font-bold text-slate-900">
                                  {student?.hostel?.room || "GA408"}
                                </td>
                                <td className="py-3.5 px-5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      b.movement === "CHECK-IN" || b.movement === "IN"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {b.movement}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 font-mono text-slate-600">
                                  {b.date || "2026-08-27"} {b.time || "08:30 AM"}
                                </td>
                                <td className="py-3.5 px-5 text-slate-600">{b.device || "Gate-01 Turnstile"}</td>
                                <td className="py-3.5 px-5 font-medium text-slate-700">Biometric</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: ANALYTICS */}
              {biometricSubTab === "analytics" && (
                <div className="space-y-6 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Total Turnstile Logs</p>
                      <p className="text-2xl font-black text-slate-900">{biometricLogs.length}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Recorded this semester</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Current Presence</p>
                      <p className="text-lg font-black text-emerald-700 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Inside Hostel
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">{student?.hostel?.block || "Block A Girls"}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Outings Count</p>
                      <p className="text-2xl font-black text-slate-900">{outings.length}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Approved permissions</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Turnstile Device Health</p>
                      <p className="text-base font-black text-blue-700">Online & Syncing</p>
                      <p className="text-[11px] text-slate-500 font-medium">Turnstile Gateway 01</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 7: COMPLAINTS ── */}
          {activeTab === "complaints" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setComplaintModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Raise Complaint
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-blue-700">{c.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          c.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{c.issue}</h4>
                      <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Category: <strong className="text-slate-800">{c.category}</strong></span>
                      <span>Assigned: <strong className="text-slate-800">{c.assignedTo || "Staff Pool"}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 8: NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 mt-0.5">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">{n.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB 9: PROFILE ── */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ID Card Display */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-center">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {studentInitials}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">{student?.name}</h3>
                  <p className="text-xs text-blue-700 font-mono font-bold mt-0.5">{student?.collegeId}</p>
                  <p className="text-xs text-slate-500">{student?.department}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">JNTU Roll No:</span> <span className="font-mono font-bold text-slate-900">{student?.rollNumber}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Academic Year:</span> <span className="font-bold text-slate-900">{student?.year}rd Year (Sem {student?.semester})</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">CGPA:</span> <span className="font-bold text-emerald-600">{student?.cgpa}</span></div>
                </div>
              </div>

              {/* Personal & Hostel Details */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 md:col-span-2">
                <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">Personal & Contact Record</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Date of Birth</p>
                    <p className="text-slate-900 font-bold mt-0.5">{student?.dateOfBirth}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Blood Group</p>
                    <p className="text-slate-900 font-bold mt-0.5">{student?.bloodGroup}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Parent / Guardian</p>
                    <p className="text-slate-900 font-bold mt-0.5">{student?.parentName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Emergency Contact</p>
                    <p className="text-blue-700 font-mono font-bold mt-0.5">{student?.emergencyContact}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Permanent Address</p>
                  <p className="text-slate-800 font-medium mt-0.5">{student?.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── MODALS (Enterprise White Theme) ── */}
      {/* 1. Apply Leave Modal */}
      {applyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Apply For Student Leave</h3>
              <button onClick={() => setApplyLeaveModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Leave Category</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Home Visit">Home Visit</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Academic / Internship">Academic / Internship</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Explain purpose of leave..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyLeaveModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#162354] hover:bg-[#1d4ed8] text-white font-bold shadow-md"
                >
                  Submit Leave Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Outing Modal */}
      {outingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">New Outing Request</h3>
              <button onClick={() => setOutingModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateOuting} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Outing Date</label>
                  <input
                    type="date"
                    value={outingForm.date}
                    onChange={(e) => setOutingForm({ ...outingForm, date: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination</label>
                  <input
                    type="text"
                    value={outingForm.destination}
                    onChange={(e) => setOutingForm({ ...outingForm, destination: e.target.value })}
                    placeholder="e.g. City Center Bookstore"
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Out Time</label>
                  <input
                    type="text"
                    value={outingForm.outTime}
                    onChange={(e) => setOutingForm({ ...outingForm, outTime: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Return Time</label>
                  <input
                    type="text"
                    value={outingForm.expectedReturnTime}
                    onChange={(e) => setOutingForm({ ...outingForm, expectedReturnTime: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Purpose / Reason</label>
                <input
                  type="text"
                  value={outingForm.reason}
                  onChange={(e) => setOutingForm({ ...outingForm, reason: e.target.value })}
                  placeholder="e.g. Project component purchase"
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOutingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#162354] hover:bg-[#1d4ed8] text-white font-bold shadow-md"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Complaint Modal */}
      {complaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Raise Maintenance Ticket</h3>
              <button onClick={() => setComplaintModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleRegisterComplaint} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none"
                  >
                    <option value="Room Maintenance">Room Maintenance</option>
                    <option value="Electrical Problem">Electrical Problem</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Wi-Fi">Wi-Fi</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Title</label>
                <input
                  type="text"
                  value={complaintForm.issue}
                  onChange={(e) => setComplaintForm({ ...complaintForm, issue: e.target.value })}
                  placeholder="e.g. Ceiling fan regulator broken"
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  placeholder="Provide details about the issue in your room..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComplaintModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#162354] hover:bg-[#1d4ed8] text-white font-bold shadow-md"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Gatepass Modal */}
      {activeGatePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white text-slate-900 p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">CampusStay Gate Clearance</h3>
                <p className="text-[10px] text-slate-500">Official Warden Departure Pass</p>
              </div>
              <button onClick={() => setActiveGatePassModal(null)} className="text-slate-500 hover:text-black">✕</button>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <QrCode className="h-20 w-20 mx-auto text-slate-900" />
              <p className="font-mono text-xs font-bold text-blue-900">PASS ID: {activeGatePassModal.id || "OUT-101"}</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Student:</span> <strong className="text-slate-900">{student?.name}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Roll Number:</span> <strong className="font-mono text-slate-900">{student?.rollNumber}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Hostel Room:</span> <strong className="text-slate-900">{student?.hostel?.block} • Room {student?.hostel?.room}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Departure Date:</span> <strong className="text-slate-900">{activeGatePassModal.outingDate}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Allowed Time:</span> <strong className="font-mono text-blue-700">{activeGatePassModal.outTime} – {activeGatePassModal.expectedReturnTime}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Destination:</span> <strong className="text-slate-900">{activeGatePassModal.destination}</strong></div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                ✓ CHIEF WARDEN SIGNED
              </span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#162354] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="h-3 w-3" /> Print Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedStudentPortal;
