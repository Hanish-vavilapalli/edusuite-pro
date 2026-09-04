import React, { useEffect, useState } from "react";
import { useAcademic } from "@/context/academic-context";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

import {
  fetchStudentRecords,
  createStudentRecord,
  updateStudentRecord,
  deleteStudentRecord,
  getStudents,
  INITIAL_STUDENTS,
  type StudentRecord,
} from "./StudentsService";

const DEPARTMENTS = [
  "All Departments",
  "CSE",
  "ECE",
  "EEE",
  "ME",
  "CIVIL",
  "IT",
  "AI&ML",
  "AI&DS",
  "MBA",
];

const YEARS = [
  "All Years",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
];

const FEE_STATUSES = ["All Fee Status", "Paid", "Pending", "Partial"] as const;

export function StudentsModuleView() {
  const { selectedDepartment, setSelectedDepartment } = useAcademic();
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState(selectedDepartment);
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedFee, setSelectedFee] = useState<string>("All Fee Status");
  const [loading, setLoading] = useState(false);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<StudentRecord>>({
    rollNo: "",
    fullName: "",
    email: "",
    phone: "",
    department: "CSE",
    academicYear: "Year 3 (Sem 6)",
    batchCode: "2023-2027",
    cgpa: 8.8,
    attendancePct: 92.0,
    feeStatus: "Paid",
    guardianName: "",
    guardianPhone: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getStudents({
        department: selectedDept,
        search: search,
        filters: {
          feeStatus: selectedFee,
          academicYear: selectedYear,
        }
      });
      setStudents(response.students);
    } catch (err) {
      toast.error("Failed to load department student roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, search, selectedYear, selectedFee]);

  useEffect(() => {
    setSelectedDept(selectedDepartment);
  }, [selectedDepartment]);

  // Filtered Students Roster (handled by service layer, mapped directly)
  const filtered = students;

  // KPI Metrics
  const totalStudents = students.length;
  const highAchievers = students.filter((s) => s.cgpa >= 8.5).length;
  const attendanceRisk = students.filter((s) => s.attendancePct < 75).length;
  const pendingFees = students.filter((s) => s.feeStatus !== "Paid").length;

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      rollNo: "23CSE088",
      fullName: "Siddharth Nambiar",
      email: "sid.n@college.edu",
      phone: "+91 9811223344",
      department: "CSE",
      academicYear: "Year 2 (Sem 4)",
      batchCode: "2024-2028",
      cgpa: 9.05,
      attendancePct: 91.5,
      feeStatus: "Paid",
      guardianName: "Ramesh Nambiar",
      guardianPhone: "+91 9811200001",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (s: StudentRecord) => {
    setSelectedStudent(s);
    setFormData({ ...s });
    setIsEditOpen(true);
  };

  const handleOpenView = (s: StudentRecord) => {
    setSelectedStudent(s);
    setIsViewOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rollNo || !formData.fullName) {
      toast.error("Please enter roll number and full name.");
      return;
    }

    const created = await createStudentRecord(formData);
    setStudents((prev) => [created, ...prev]);
    setIsAddOpen(false);
    toast.success(`Student ${created.fullName} (${created.rollNo}) registered successfully!`);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    await updateStudentRecord(selectedStudent.id, formData);
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudent.id ? ({ ...s, ...formData } as StudentRecord) : s)),
    );
    setIsEditOpen(false);
    toast.success(`Student record for ${formData.fullName} (${formData.rollNo}) updated!`);
  };

  const handleDelete = async (id: string, rollNo: string, name: string) => {
    if (confirm(`Are you sure you want to delete student record for ${name} (${rollNo})?`)) {
      await deleteStudentRecord(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Student record ${rollNo} deleted.`);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Student ID",
      "Roll No",
      "Full Name",
      "Email Address",
      "Phone",
      "Department",
      "Academic Year",
      "Batch Code",
      "CGPA",
      "Attendance %",
      "Fee Status",
      "Guardian Name",
      "Guardian Phone",
    ];

    const rows = filtered.map((s) => [
      s.id,
      s.rollNo,
      `"${s.fullName}"`,
      s.email,
      `"${s.phone}"`,
      s.department,
      `"${s.academicYear}"`,
      s.batchCode,
      s.cgpa,
      `${s.attendancePct}%`,
      s.feeStatus,
      `"${s.guardianName}"`,
      `"${s.guardianPhone}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Student_Registry_Roster_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} student records to CSV!`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Users className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Students & Student Lifecycle Management
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                Super Admin Central Registry
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Comprehensive student roster, academic GPA tracking, attendance alerts, and fee ledgers.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <Download className="size-3.5" /> Export Roster
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow hover:opacity-95"
          >
            <Plus className="size-4" /> Add New Student
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Enrolled Students</span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{totalStudents} Students</p>
          <p className="text-[0.68rem] text-muted-foreground">Across 4 Academic Batches</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>High Achievers</span>
            <Award className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">{highAchievers} Honor Roll</p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">CGPA ≥ 8.5 Honor Students</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Attendance Risk</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">{attendanceRisk} Low Attendance</p>
          <p className="text-[0.68rem] text-muted-foreground">Attendance &lt; 75% Alert</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Fee Dues Pending</span>
            <CreditCard className="size-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-600">{pendingFees} Dues Pending</p>
          <p className="text-[0.68rem] text-purple-600 font-medium">Accounts follow-up needed</p>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search roll no, name, email, department, guardian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Department Filter */}
          <Select
            value={selectedDept}
            onValueChange={(val) => {
              setSelectedDept(val);
              if (val !== "All Departments") {
                setSelectedDepartment(val);
              }
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs">
              <Building2 className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Academic Year Filter */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-9 w-full sm:w-[130px] text-xs">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fee Status Filter */}
          <Select value={selectedFee} onValueChange={setSelectedFee}>
            <SelectTrigger className="h-9 w-full sm:w-[140px] text-xs">
              <CreditCard className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Fee Status" />
            </SelectTrigger>
            <SelectContent>
              {FEE_STATUSES.map((f) => (
                <SelectItem key={f} value={f} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Roster Table */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Users className="size-4 text-primary" /> Central Student Roster
            <Badge variant="secondary" className="font-mono text-xs">
              {filtered.length} Students
            </Badge>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="size-5 animate-spin text-primary" />
            Loading student records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
            <Users className="size-7 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">No student records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Dept & Year</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Attendance %</th>
                  <th className="py-3 px-3">Fee Status</th>
                  <th className="py-3 px-3">Guardian Contact</th>
                  <th className="py-3 px-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{s.rollNo}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{s.fullName}</div>
                      <div className="text-[0.68rem] text-muted-foreground font-mono">{s.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-foreground">{s.department}</div>
                      <div className="text-[0.68rem] text-muted-foreground">{s.academicYear}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-primary text-sm">{s.cgpa}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={s.attendancePct < 75 ? "text-amber-600 font-bold" : "text-emerald-600"}>
                        {s.attendancePct}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        className={
                          s.feeStatus === "Paid"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                            : s.feeStatus === "Partial"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[0.68rem]"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.68rem]"
                        }
                      >
                        {s.feeStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-foreground">{s.guardianName}</div>
                      <div className="text-[0.68rem] text-muted-foreground font-mono">{s.guardianPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(s)}
                          className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                          title="View Dossier"
                        >
                          <Eye className="size-3.5" /> Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(s)}
                          className="size-7 text-muted-foreground hover:text-primary"
                          title="Edit Record"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id, s.rollNo, s.fullName)}
                          className="size-7 text-muted-foreground hover:text-red-600"
                          title="Delete Student"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DIALOG 1: ADD NEW STUDENT MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Register New Student
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter student roll number, full name, department, academic standing, and guardian contact.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Roll Number *</Label>
                <Input
                  required
                  placeholder="e.g. 23CSE088"
                  value={formData.rollNo || ""}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Siddharth Nambiar"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  placeholder="e.g. sid.n@college.edu"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  placeholder="e.g. +91 9811223344"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department</Label>
                <Select
                  value={formData.department || "CSE"}
                  onValueChange={(val) => setFormData({ ...formData, department: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((d) => (
                      <SelectItem key={d} value={d} className="text-xs">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Academic Year</Label>
                <Input
                  placeholder="e.g. Year 2 (Sem 4)"
                  value={formData.academicYear || ""}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">CGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa ?? 8.5}
                  onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Attendance %</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.attendancePct ?? 90.0}
                  onChange={(e) =>
                    setFormData({ ...formData, attendancePct: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Fee Status</Label>
                <Select
                  value={formData.feeStatus || "Paid"}
                  onValueChange={(val: any) => setFormData({ ...formData, feeStatus: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Fee Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid" className="text-xs">
                      Paid
                    </SelectItem>
                    <SelectItem value="Pending" className="text-xs">
                      Pending
                    </SelectItem>
                    <SelectItem value="Partial" className="text-xs">
                      Partial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Guardian Name</Label>
                <Input
                  placeholder="e.g. Ramesh Nambiar"
                  value={formData.guardianName || ""}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Guardian Contact Phone</Label>
              <Input
                placeholder="e.g. +91 9811200001"
                value={formData.guardianPhone || ""}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Register Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT STUDENT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit className="size-5 text-primary" /> Edit Student ({selectedStudent?.rollNo})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name</Label>
                <Input
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">CGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cgpa ?? 8.5}
                  onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Attendance %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.attendancePct ?? 90.0}
                  onChange={(e) =>
                    setFormData({ ...formData, attendancePct: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Fee Status</Label>
                <Select
                  value={formData.feeStatus || "Paid"}
                  onValueChange={(val: any) => setFormData({ ...formData, feeStatus: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Fee Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid" className="text-xs">
                      Paid
                    </SelectItem>
                    <SelectItem value="Pending" className="text-xs">
                      Pending
                    </SelectItem>
                    <SelectItem value="Partial" className="text-xs">
                      Partial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: VIEW STUDENT DOSSIER MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" /> Student Profile Dossier
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedStudent.rollNo}
                  </Badge>
                  <Badge
                    className={
                      selectedStudent.feeStatus === "Paid"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }
                  >
                    Fee: {selectedStudent.feeStatus}
                  </Badge>
                </div>
                <h2 className="text-base font-bold text-foreground">{selectedStudent.fullName}</h2>
                <p className="text-xs text-primary font-mono">{selectedStudent.email} &middot; {selectedStudent.phone}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Department & Year:</span>
                  <span className="font-semibold text-foreground">{selectedStudent.department} ({selectedStudent.academicYear})</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60 font-mono">
                  <span className="text-muted-foreground font-sans">Cumulative GPA:</span>
                  <span className="font-bold text-base text-primary">{selectedStudent.cgpa} / 10.0</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60 font-mono">
                  <span className="text-muted-foreground font-sans">Attendance Record:</span>
                  <span className={`font-bold text-sm ${selectedStudent.attendancePct < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                    {selectedStudent.attendancePct}%
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <span className="text-muted-foreground font-semibold">Guardian Information:</span>
                  <p className="text-xs text-foreground font-medium">{selectedStudent.guardianName} &middot; <span className="font-mono text-primary">{selectedStudent.guardianPhone}</span></p>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewOpen(false)}
                  className="w-full text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
