import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Percent, 
  Info,
  FileCheck2,
  AlertCircle,
  Activity,
  UserCheck,
  Clock,
  Send,
  Sparkles,
  Lock,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useRole } from "@/context/role-context";
import api from "@/lib/api";
import { 
  getMockStudents, 
  saveMockStudents, 
  getMockExams, 
  MockStudent, 
  MockExamSchedule 
} from "@/lib/mock-examcell-state";

export const Route = createFileRoute("/examcell/hall-tickets")({
  head: () => ({
    meta: [{ title: "Hall Ticket Authorization & Audit — EduSuite Pro" }],
  }),
  component: HallTicketControlPage,
});

export interface ExtendedStudentAuditItem {
  id: string;
  rollNumber: string;
  name: string;
  full_name: string;
  roll_number: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  isRegistered: boolean;
  is_registered: boolean;
  registeredCoursesCount: number;
  attendancePercentage: number;
  attendance_percentage: number;
  attendanceOk: boolean;
  feeBalance: number;
  fee_balance: number;
  feesOk: boolean;
  eligibilityStatus: "ELIGIBLE" | "BLOCKED";
  authorizationStatus: "AUTHORIZED" | "PENDING";
  isOverridden: boolean;
  is_overridden: boolean;
  blockReasons: string[];
  hallTicketStatus: "Not Generated" | "GENERATED" | "RELEASED" | "Generated" | "Released";
  hall_ticket_status: "Not Generated" | "GENERATED" | "RELEASED" | "Generated" | "Released";
}

function HallTicketControlPage() {
  const { role, flags, department: userDept } = useRole();
  const isOfficer = role === "super-admin" || flags.includes("isExamController");

  // Filters
  const [department, setDepartment] = useState("CSE");
  const [semesterText, setSemesterText] = useState("Sem 5");
  const [search, setSearch] = useState("");

  // Roster datasets
  const [students, setStudents] = useState<ExtendedStudentAuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab & Selection State
  const [activeTab, setActiveTab] = useState<'blocked' | 'eligible'>('blocked');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [checkedStudentIds, setCheckedStudentIds] = useState<string[]>([]);

  // Modals
  const [passConfirmOpen, setPassConfirmOpen] = useState(false);
  const [singleStudentToPass, setSingleStudentToPass] = useState<ExtendedStudentAuditItem | null>(null);
  const [isPassing, setIsPassing] = useState(false);

  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [singleStudentToGenerate, setSingleStudentToGenerate] = useState<ExtendedStudentAuditItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const semNumber = Number(semesterText.replace("Sem ", ""));

  // Fetch Cohort Student Roster dynamically from API & fallback
  const fetchRoster = async () => {
    setLoading(true);
    try {
      let apiRoster: ExtendedStudentAuditItem[] = [];
      try {
        const res = await api.get(
          `/api/exams/eligibility?department=${encodeURIComponent(department)}&semester=${semNumber}&search=${encodeURIComponent(search)}`
        );
        if (res.data && Array.isArray(res.data)) {
          apiRoster = res.data;
        }
      } catch (e) {}

      if (apiRoster.length > 0) {
        setStudents(apiRoster);
      } else {
        // Fallback to local mock data calculations
        const mockList = getMockStudents();
        const filtered = mockList.filter(s => {
          const matchDept = department === "All Branches" || s.department === department;
          const matchSem = s.semester === semNumber;
          const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
                              s.roll_number.toLowerCase().includes(search.toLowerCase());
          return matchDept && matchSem && matchSearch;
        });

        const mapped: ExtendedStudentAuditItem[] = filtered.map(s => {
          const attendancePct = s.attendance_percentage || 85;
          const attendanceOk = attendancePct >= 75;
          const feeBal = s.fee_balance || 0;
          const feesOk = feeBal === 0;
          const isReg = s.is_registered;

          const blockReasons: string[] = [];
          if (!attendanceOk) blockReasons.push(`Attendance Shortfall (${attendancePct}%)`);
          if (!feesOk) blockReasons.push(`Fee Due (₹${feeBal.toLocaleString()})`);
          if (!isReg) blockReasons.push(`Unregistered`);

          const naturalEligible = attendanceOk && feesOk && isReg;
          const isOverridden = Boolean(s.is_overridden);
          const finalEligible = naturalEligible || isOverridden;

          return {
            id: s.id,
            rollNumber: s.roll_number,
            name: s.full_name,
            full_name: s.full_name,
            roll_number: s.roll_number,
            department: s.department,
            year: s.year || Math.ceil(semNumber / 2),
            semester: semNumber,
            section: s.section || "A",
            isRegistered: isReg,
            is_registered: isReg,
            registeredCoursesCount: isReg ? 4 : 0,
            attendancePercentage: attendancePct,
            attendance_percentage: attendancePct,
            attendanceOk,
            feeBalance: feeBal,
            fee_balance: feeBal,
            feesOk,
            eligibilityStatus: naturalEligible ? "ELIGIBLE" : "BLOCKED",
            authorizationStatus: (isOverridden || naturalEligible) ? "AUTHORIZED" : "PENDING",
            isOverridden,
            is_overridden: isOverridden,
            blockReasons,
            hallTicketStatus: s.hall_ticket_status || "Not Generated",
            hall_ticket_status: s.hall_ticket_status || "Not Generated"
          };
        });

        setStudents(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch student roster", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
    setCheckedStudentIds([]);
  }, [department, semesterText, search]);

  // Tab splits
  const blockedStudents = students.filter(s => 
    s.authorizationStatus !== "AUTHORIZED" && !s.isOverridden && s.eligibilityStatus === "BLOCKED" && s.hallTicketStatus === "Not Generated"
  );

  const eligibleStudents = students.filter(s => 
    s.authorizationStatus === "AUTHORIZED" || s.isOverridden || s.eligibilityStatus === "ELIGIBLE" || s.hallTicketStatus !== "Not Generated"
  );

  // Currently selected student for right-side audit panel
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Auto-select first student when roster updates
  useEffect(() => {
    const currentList = activeTab === 'blocked' ? blockedStudents : eligibleStudents;
    if (currentList.length > 0 && (!selectedStudentId || !currentList.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(currentList[0].id);
    }
  }, [activeTab, students, selectedStudentId]);

  // Checkbox Selection Helpers
  const handleToggleCheck = (id: string) => {
    setCheckedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (list: ExtendedStudentAuditItem[]) => {
    const allIds = list.map(s => s.id);
    const areAllSelected = allIds.every(id => checkedStudentIds.includes(id));
    if (areAllSelected) {
      setCheckedStudentIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      const merged = new Set([...checkedStudentIds, ...allIds]);
      setCheckedStudentIds(Array.from(merged));
    }
  };

  // 1. Action: PASS TO ELIGIBLE (Officer Manual Override)
  const promptPassToEligible = (student?: ExtendedStudentAuditItem) => {
    if (student) {
      setSingleStudentToPass(student);
    } else {
      setSingleStudentToPass(null);
    }
    setPassConfirmOpen(true);
  };

  const handleConfirmPassToEligible = async () => {
    const targetIds = singleStudentToPass ? [singleStudentToPass.id] : checkedStudentIds;
    if (targetIds.length === 0) return;

    setIsPassing(true);
    try {
      // Call Backend API
      try {
        await api.post("/api/exams/eligibility/override", {
          studentIds: targetIds,
          semester: semNumber
        });
      } catch (e) {}

      // Update Local Roster State & localStorage
      const mockStudents = getMockStudents();
      const updatedMock = mockStudents.map(s => 
        targetIds.includes(s.id) ? { ...s, is_overridden: true } : s
      );
      saveMockStudents(updatedMock);

      setStudents(prev => prev.map(s => {
        if (targetIds.includes(s.id)) {
          return {
            ...s,
            authorizationStatus: "AUTHORIZED",
            isOverridden: true,
            is_overridden: true
          };
        }
        return s;
      }));

      toast.success(`Successfully passed ${targetIds.length} student(s) to eligible status!`);
      setCheckedStudentIds(prev => prev.filter(id => !targetIds.includes(id)));
      setPassConfirmOpen(false);
      setSingleStudentToPass(null);
      
      // Auto-switch to Eligible tab
      setActiveTab('eligible');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to authorize students.");
    } finally {
      setIsPassing(false);
    }
  };

  // 2. Action: GENERATE HALL TICKETS
  const promptGenerateHallTickets = (student?: ExtendedStudentAuditItem) => {
    if (student) {
      setSingleStudentToGenerate(student);
    } else {
      setSingleStudentToGenerate(null);
    }
    setGenerateConfirmOpen(true);
  };

  const handleConfirmGenerate = async () => {
    const targetIds = singleStudentToGenerate ? [singleStudentToGenerate.id] : checkedStudentIds;
    if (targetIds.length === 0) return;

    setIsGenerating(true);
    try {
      // Call Backend API
      try {
        const res = await api.post("/api/exams/hall-tickets/generate", {
          studentIds: targetIds,
          department,
          semester: semNumber
        });
        if (res.data?.error) {
          toast.error(res.data.error);
          setIsGenerating(false);
          setGenerateConfirmOpen(false);
          return;
        }
      } catch (e: any) {
        if (e.response?.data?.error) {
          toast.error(e.response.data.error);
          setIsGenerating(false);
          setGenerateConfirmOpen(false);
          return;
        }
      }

      // Update Local Roster State & localStorage
      const mockStudents = getMockStudents();
      const updatedMock = mockStudents.map(s => 
        targetIds.includes(s.id) ? { ...s, hall_ticket_status: 'Generated' as const } : s
      );
      saveMockStudents(updatedMock);

      setStudents(prev => prev.map(s => {
        if (targetIds.includes(s.id)) {
          return {
            ...s,
            hallTicketStatus: "GENERATED",
            hall_ticket_status: "GENERATED"
          };
        }
        return s;
      }));

      toast.success(`Successfully generated hall tickets for ${targetIds.length} eligible student(s)!`);
      setCheckedStudentIds(prev => prev.filter(id => !targetIds.includes(id)));
      setGenerateConfirmOpen(false);
      setSingleStudentToGenerate(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to generate hall tickets.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Action: RELEASE HALL TICKETS TO STUDENTS
  const handleConfirmRelease = async () => {
    const targetIds = checkedStudentIds.length > 0 
      ? checkedStudentIds 
      : eligibleStudents.filter(s => s.hallTicketStatus === 'GENERATED' || s.hallTicketStatus === 'Generated').map(s => s.id);

    if (targetIds.length === 0) {
      toast.info("No generated hall tickets selected for release.");
      return;
    }

    setIsReleasing(true);
    try {
      try {
        await api.post("/api/exams/hall-tickets/release", {
          studentIds: targetIds,
          department,
          semester: semNumber
        });
      } catch (e) {}

      // Update Local Roster State & localStorage
      const mockStudents = getMockStudents();
      const updatedMock = mockStudents.map(s => 
        targetIds.includes(s.id) ? { ...s, hall_ticket_status: 'Generated' as const } : s
      );
      saveMockStudents(updatedMock);

      setStudents(prev => prev.map(s => {
        if (targetIds.includes(s.id)) {
          return {
            ...s,
            hallTicketStatus: "RELEASED",
            hall_ticket_status: "RELEASED"
          };
        }
        return s;
      }));

      toast.success(`Successfully released hall tickets for ${targetIds.length} student(s) to student portal!`);
      setCheckedStudentIds(prev => prev.filter(id => !targetIds.includes(id)));
      setReleaseConfirmOpen(false);
    } catch (err: any) {
      toast.error("Failed to release hall tickets.");
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. PAGE HEADER */}
      <div className="border-b border-border pb-4">
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-mono">
          Examcell <span className="text-[10px]">/</span> <span className="text-foreground font-bold">Hall-tickets</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight mt-2 text-slate-900">
          Hall Ticket Authorization & Audit
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Audit student registration status, attendance percentage, and fee dues to authorize and release examination admit cards.
        </p>
      </div>

      {/* 2. BRANCH + SEMESTER + SEARCH FILTERS */}
      <Card className="bg-card border border-border/70 p-5 rounded-2xl shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Department / Branch</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All Branches">All Branches</option>
              <option value="CSE">CSE - Computer Science</option>
              <option value="AIML">AIML - Artificial Intelligence & ML</option>
              <option value="AIDS">AIDS - Artificial Intelligence & DS</option>
              <option value="ECE">ECE - Electronics & Comm</option>
              <option value="EEE">EEE - Electrical Eng</option>
              <option value="MECH">MECH - Mechanical Eng</option>
              <option value="CIVIL">CIVIL - Civil Eng</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Semester</label>
            <select
              value={semesterText}
              onChange={e => setSemesterText(e.target.value)}
              className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="Sem 1">Sem 1</option>
              <option value="Sem 2">Sem 2</option>
              <option value="Sem 3">Sem 3</option>
              <option value="Sem 4">Sem 4</option>
              <option value="Sem 5">Sem 5</option>
              <option value="Sem 6">Sem 6</option>
              <option value="Sem 7">Sem 7</option>
              <option value="Sem 8">Sem 8</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or roll number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-card border-border placeholder:text-muted-foreground/60 font-semibold"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. MASTER DETAILS SPLIT WORKSPACE */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* LEFT 2 COLUMNS: TABBED AUDIT ROSTER TABLE */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* TAB HEADERS & MASTER ACTIONS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/80 gap-3">
            <div className="flex">
              <button
                onClick={() => setActiveTab('blocked')}
                className={`px-5 py-3 text-xs font-black border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === 'blocked'
                    ? 'border-rose-500 text-rose-700 font-extrabold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Blocked / Dues Pending ({blockedStudents.length})
              </button>
              <button
                onClick={() => setActiveTab('eligible')}
                className={`px-5 py-3 text-xs font-black border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === 'eligible'
                    ? 'border-emerald-600 text-emerald-700 font-extrabold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Eligible / Cleared ({eligibleStudents.length})
              </button>
            </div>

            {/* ACTION BUTTONS BASED ON ACTIVE TAB */}
            <div className="flex items-center gap-2 pb-2 sm:pb-0">
              {activeTab === 'blocked' ? (
                <Button
                  onClick={() => promptPassToEligible()}
                  disabled={checkedStudentIds.length === 0}
                  className="bg-[#6366f1] hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-wider h-8 rounded-lg flex items-center gap-1.5 px-4 shadow-sm cursor-pointer"
                >
                  <UserCheck className="size-3.5" /> PASS TO ELIGIBLE ({checkedStudentIds.length})
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => promptGenerateHallTickets()}
                    disabled={checkedStudentIds.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-wider h-8 rounded-lg flex items-center gap-1.5 px-3.5 shadow-sm cursor-pointer"
                  >
                    <FileCheck2 className="size-3.5" /> GENERATE HALL TICKETS ({checkedStudentIds.length})
                  </Button>
                  <Button
                    onClick={() => setReleaseConfirmOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider h-8 rounded-lg flex items-center gap-1.5 px-3.5 shadow-sm cursor-pointer"
                  >
                    <Send className="size-3.5" /> RELEASE HALL TICKETS
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: BLOCKED / DUES PENDING TABLE */}
          {activeTab === 'blocked' && (
            <Card className="bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden p-0">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground font-semibold">Loading student eligibility audit...</div>
              ) : blockedStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-semibold flex flex-col items-center justify-center gap-1.5">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                  <span>No students are currently blocked for this cohort!</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-border/60 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-[10px] text-center w-12">
                          <input 
                            type="checkbox"
                            checked={blockedStudents.length > 0 && blockedStudents.every(s => checkedStudentIds.includes(s.id))}
                            onChange={() => handleSelectAll(blockedStudents)}
                            className="size-3.5 accent-indigo-600 rounded cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-[10px]">Student</th>
                        <th className="px-4 py-3 text-[10px] text-center">Registered</th>
                        <th className="px-4 py-3 text-[10px] text-center">Block Reason / Audit Indicators</th>
                        <th className="px-4 py-3 text-[10px] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-semibold text-slate-700">
                      {blockedStudents.map(s => {
                        const isSelected = selectedStudentId === s.id;

                        return (
                          <tr 
                            key={s.id} 
                            onClick={() => setSelectedStudentId(s.id)}
                            className={`hover:bg-slate-50/50 transition cursor-pointer ${
                              isSelected ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-500/10' : ''
                            }`}
                          >
                            <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                checked={checkedStudentIds.includes(s.id)}
                                onChange={() => handleToggleCheck(s.id)}
                                className="size-3.5 accent-indigo-600 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-extrabold text-slate-900">{s.full_name}</div>
                              <div className="text-[10px] font-bold text-slate-450 font-mono mt-0.5">{s.roll_number} ({s.section})</div>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`font-mono font-bold ${s.is_registered ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : 'text-red-750 bg-rose-50 px-2 py-0.5 rounded'}`}>
                                {s.is_registered ? 'Registered' : 'No Form'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                {s.blockReasons.map((reason, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-rose-50/30 text-rose-700 border-rose-200 text-[9px] font-bold">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  promptPassToEligible(s);
                                }}
                                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg cursor-pointer px-3.5 shadow-xs"
                              >
                                Pass to Eligible
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* TAB 2: ELIGIBLE / CLEARED TABLE */}
          {activeTab === 'eligible' && (
            <Card className="bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden p-0">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground font-semibold">Loading eligible roster...</div>
              ) : eligibleStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-semibold">
                  No eligible or authorized students in this cohort.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-border/60 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-[10px] text-center w-12">
                          <input 
                            type="checkbox"
                            checked={eligibleStudents.length > 0 && eligibleStudents.every(s => checkedStudentIds.includes(s.id))}
                            onChange={() => handleSelectAll(eligibleStudents)}
                            className="size-3.5 accent-indigo-600 rounded cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-[10px]">Student</th>
                        <th className="px-4 py-3 text-[10px] text-center">Attendance</th>
                        <th className="px-4 py-3 text-[10px] text-center">Fee Balance</th>
                        <th className="px-4 py-3 text-[10px] text-center">Authorization Status</th>
                        <th className="px-4 py-3 text-[10px] text-center">Hall Ticket Status</th>
                        <th className="px-4 py-3 text-[10px] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-semibold text-slate-700">
                      {eligibleStudents.map(s => {
                        const isSelected = selectedStudentId === s.id;
                        const isGenerated = s.hallTicketStatus === 'GENERATED' || s.hallTicketStatus === 'Generated' || s.hallTicketStatus === 'RELEASED' || s.hallTicketStatus === 'Released';
                        const isReleased = s.hallTicketStatus === 'RELEASED' || s.hallTicketStatus === 'Released';

                        return (
                          <tr 
                            key={s.id} 
                            onClick={() => setSelectedStudentId(s.id)}
                            className={`hover:bg-slate-50/50 transition cursor-pointer ${
                              isSelected ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-500/10' : ''
                            }`}
                          >
                            <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                checked={checkedStudentIds.includes(s.id)}
                                onChange={() => handleToggleCheck(s.id)}
                                className="size-3.5 accent-indigo-600 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-extrabold text-slate-900">{s.full_name}</div>
                              <div className="text-[10px] font-bold text-slate-450 font-mono mt-0.5">{s.roll_number}</div>
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                              {s.attendancePercentage}%
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                              {s.feeBalance && s.feeBalance > 0 ? `₹${s.feeBalance.toLocaleString()}` : "₹0 Paid"}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-[9px]">
                                Authorized / Cleared
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <Badge className={
                                isReleased 
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-black text-[9px]"
                                  : isGenerated
                                  ? "bg-blue-50 text-blue-800 border-blue-200 font-black text-[9px]"
                                  : "bg-slate-100 text-slate-700 border-slate-200 font-black text-[9px]"
                              }>
                                {isReleased ? "Released" : isGenerated ? "Generated" : "Pending Generation"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {isReleased ? (
                                <span className="text-emerald-700 font-black text-[10px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  Released
                                </span>
                              ) : isGenerated ? (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmRelease();
                                  }}
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg cursor-pointer px-3 shadow-xs"
                                >
                                  Release
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    promptGenerateHallTickets(s);
                                  }}
                                  className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg cursor-pointer px-3.5 shadow-xs"
                                >
                                  Generate
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN: DUES AUDIT SUMMARY & OVERRIDE PANEL */}
        <div>
          <Card className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs space-y-5">
            <div className="border-b pb-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Activity className="size-4.5 text-indigo-650" />
                Dues Audit Summary & Override
              </h3>
            </div>

            {!selectedStudent ? (
              <div className="text-center py-12 text-muted-foreground font-semibold flex flex-col items-center justify-center gap-1">
                <Info className="size-8 text-slate-350" />
                <span>No student selected for audit.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Student Header Info */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">{selectedStudent.full_name}</h4>
                  <p className="text-[10px] text-indigo-700 font-bold font-mono">{selectedStudent.roll_number}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    B.Tech {selectedStudent.department} · Sem {selectedStudent.semester} ({selectedStudent.section})
                  </p>
                </div>

                {/* Audit Cards Checklist */}
                <div className="space-y-3">
                  
                  {/* 1. Financial Audit */}
                  <div className="p-3 border border-slate-150 rounded-xl space-y-1 bg-slate-50/20">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500">Financial Audit</span>
                      {selectedStudent.feeBalance === 0 ? (
                        <Badge className="bg-emerald-50 text-emerald-800 text-[9px] font-black">Fee Cleared</Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-800 text-[9px] font-black">Dues Pending</Badge>
                      )}
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 pt-1">
                      Outstanding Fee: {selectedStudent.feeBalance > 0 ? `₹${selectedStudent.feeBalance.toLocaleString()}` : "₹0 Paid"}
                    </div>
                    <p className="text-[9px] text-muted-foreground font-semibold">
                      Must have zero outstanding fee dues for natural eligibility.
                    </p>
                  </div>

                  {/* 2. Attendance Audit */}
                  <div className="p-3 border border-slate-150 rounded-xl space-y-1 bg-slate-50/20">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500">Attendance Audit</span>
                      {selectedStudent.attendancePercentage >= 75 ? (
                        <Badge className="bg-emerald-50 text-emerald-800 text-[9px] font-black">Passed</Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-800 text-[9px] font-black">Shortage</Badge>
                      )}
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 pt-1">
                      Attendance Rate: {selectedStudent.attendancePercentage}%
                    </div>
                    <p className="text-[9px] text-muted-foreground font-semibold">
                      Minimum required attendance threshold: 75%.
                    </p>
                  </div>

                  {/* 3. Registration Check */}
                  <div className="p-3 border border-slate-150 rounded-xl space-y-1 bg-slate-50/20">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500">Registration Check</span>
                      {selectedStudent.isRegistered ? (
                        <Badge className="bg-emerald-50 text-emerald-800 text-[9px] font-black">Registered</Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-800 text-[9px] font-black">Unregistered</Badge>
                      )}
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 pt-1 font-mono">
                      Status: {selectedStudent.isRegistered ? `Registered (${selectedStudent.registeredCoursesCount || 4} Courses Offered)` : "No Form"}
                    </div>
                  </div>

                </div>

                {/* Audit Override Action Panel */}
                <div className="border-t pt-4 space-y-2">
                  {selectedStudent.authorizationStatus !== "AUTHORIZED" && !selectedStudent.isOverridden ? (
                    <Button 
                      onClick={() => promptPassToEligible(selectedStudent)}
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <UserCheck className="size-4" /> Pass to Eligible (Override)
                    </Button>
                  ) : selectedStudent.hallTicketStatus !== "GENERATED" && selectedStudent.hallTicketStatus !== "RELEASED" ? (
                    <Button 
                      onClick={() => promptGenerateHallTickets(selectedStudent)}
                      className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <FileCheck2 className="size-4" /> Generate Hall Ticket
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleConfirmRelease}
                      className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="size-4" /> Release Hall Ticket
                    </Button>
                  )}

                  <p className="text-[9px] text-center text-muted-foreground font-medium leading-relaxed">
                    {selectedStudent.isOverridden
                      ? "Student manually authorized by Officer. Original audit shortage indicators retained."
                      : "Passing a student authorizes hall ticket generation despite current audit indicators."}
                  </p>
                </div>

              </div>
            )}
          </Card>
        </div>

      </div>

      {/* MODAL 1: PASS TO ELIGIBLE CONFIRMATION DIALOG */}
      <Dialog open={passConfirmOpen} onOpenChange={setPassConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-extrabold text-indigo-700 flex items-center gap-2">
              <UserCheck className="size-5" /> Pass to Eligible Status?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-2 text-xs font-semibold text-slate-700 leading-relaxed">
            Are you sure you want to pass the selected student(s) to eligible status?
            <br /><br />
            This will authorize them for hall ticket generation despite their current audit indicators (attendance shortage or fee dues). Original audit values will be retained for record keeping.
          </DialogDescription>
          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPassConfirmOpen(false)}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPassToEligible}
              disabled={isPassing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl px-4 cursor-pointer"
            >
              {isPassing ? "Authorizing..." : "Pass to Eligible"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: GENERATE HALL TICKETS CONFIRMATION DIALOG */}
      <Dialog open={generateConfirmOpen} onOpenChange={setGenerateConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-extrabold text-indigo-700 flex items-center gap-2">
              <FileCheck2 className="size-5" /> Generate Examination Hall Tickets?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-2 text-xs font-semibold text-slate-700 leading-relaxed">
            Generate hall tickets for the selected eligible students?
            <br /><br />
            The system will verify approved timetable slots, assign room seat allocations, and prepare admit cards.
          </DialogDescription>
          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGenerateConfirmOpen(false)}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmGenerate}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl px-4 cursor-pointer"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: RELEASE HALL TICKETS CONFIRMATION DIALOG */}
      <Dialog open={releaseConfirmOpen} onOpenChange={setReleaseConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-extrabold text-emerald-700 flex items-center gap-2">
              <Send className="size-5" /> Release Hall Tickets to Students?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-2 text-xs font-semibold text-slate-700 leading-relaxed">
            Are you sure you want to release generated hall tickets to student portals?
            <br /><br />
            Released students will be notified and can view and download their official admit card PDF.
          </DialogDescription>
          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReleaseConfirmOpen(false)}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRelease}
              disabled={isReleasing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl px-4 cursor-pointer"
            >
              {isReleasing ? "Releasing..." : "Release to Students"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
