import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  FileText,
  UserCheck,
  Building2,
  Trash2,
  Check,
  AlertCircle,
  FileCheck,
  Award,
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

import {
  fetchAdmissionApplications,
  createAdmissionApplication,
  updateAdmissionStatus,
  deleteAdmissionApplication,
  INITIAL_ADMISSIONS,
  type AdmissionApplication,
} from "./AdmissionService";

const COURSES = [
  "All Courses",
  "B.Tech Computer Science (CSE)",
  "B.Tech Electronics (ECE)",
  "B.Tech Mechanical (ME)",
  "B.Tech AI & Data Science",
  "MBA (Data Analytics)",
  "B.Sc Biotech",
];

const STATUS_TABS = ["All", "Under Review", "Verified", "Seat Allotted", "Admitted"] as const;

export function AdmissionModuleView() {
  const [applications, setApplications] = useState<AdmissionApplication[]>(INITIAL_ADMISSIONS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [loading, setLoading] = useState(false);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AdmissionApplication>>({
    name: "",
    email: "",
    phone: "",
    course: "B.Tech Computer Science (CSE)",
    category: "General",
    meritScore: "95.0%",
    status: "Under Review",
    previousInstitute: "Narayana STEM Academy",
    documents: "Marksheets & Transfer Certificate Attached",
  });

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdmissionApplications();
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Roster
  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.id.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.course.toLowerCase().includes(search.toLowerCase()) ||
      app.meritScore.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === "All" || app.status === activeTab;
    const matchesCourse = selectedCourse === "All Courses" || app.course === selectedCourse;

    return matchesSearch && matchesTab && matchesCourse;
  });

  // KPI Metrics
  const totalApps = applications.length;
  const admittedCount = applications.filter((a) => a.status === "Admitted").length;
  const pendingCount = applications.filter((a) => a.status === "Under Review").length;
  const verifiedCount = applications.filter(
    (a) => a.status === "Verified" || a.status === "Seat Allotted",
  ).length;

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      name: "Siddharth Malhotra",
      email: "sid.m@gmail.com",
      phone: "+91 9811223344",
      course: "B.Tech Computer Science (CSE)",
      category: "General",
      meritScore: "96.8%",
      status: "Under Review",
      previousInstitute: "Delhi Public School, R.K. Puram",
      documents: "All 10th/12th Marksheets Verified",
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please enter applicant name and email address.");
      return;
    }

    const created = await createAdmissionApplication(formData);
    setApplications((prev) => [created, ...prev]);
    setIsCreateOpen(false);
    toast.success(
      `Applicant ${created.name} (${created.id}) registered successfully for ${created.course}!`,
    );
  };

  const handleApproveSeat = async (app: AdmissionApplication) => {
    await updateAdmissionStatus(app.id, "Admitted");
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: "Admitted" } : a)),
    );
    toast.success(`Application ${app.id} for ${app.name} approved for ENROLMENT!`);
  };

  const handleVerifyDocs = async (app: AdmissionApplication) => {
    await updateAdmissionStatus(app.id, "Verified");
    setApplications((prev) =>
      prev.map((a) =>
        a.id === app.id
          ? { ...a, status: "Verified", documents: "All 5 Certificates Verified & Audited" }
          : a,
      ),
    );
    toast.info(`Documents verified for applicant ${app.name} (${app.id}).`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete applicant record for ${name} (${id})?`)) {
      await deleteAdmissionApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Applicant record ${id} deleted.`);
    }
  };

  const handleOpenView = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setIsViewOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      "App ID",
      "Applicant Name",
      "Email Address",
      "Phone",
      "Target Course",
      "Category",
      "Merit Score",
      "Status",
      "Date Submitted",
      "Previous Institute",
      "Documents Audit",
    ];
    const rows = filtered.map((a) => [
      a.id,
      `"${a.name}"`,
      a.email,
      `"${a.phone}"`,
      `"${a.course}"`,
      a.category,
      a.meritScore,
      a.status,
      a.dateSubmitted,
      `"${a.previousInstitute || "N/A"}"`,
      `"${a.documents}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Admissions_Roster_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} admission applications to CSV!`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Admission Management Module
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                Student Admissions Core
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Enquiry tracking, document verification, merit list cutoff scoring, and seat allotment.
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
            onClick={handleOpenCreate}
            className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow hover:opacity-95"
          >
            <Plus className="size-4" /> New Applicant
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total Applications</span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{totalApps} Received</p>
          <p className="text-[0.68rem] text-muted-foreground">Active admission cycle 2026</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Enrolled Students</span>
            <UserCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">{admittedCount} Admitted</p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">Fees paid & seat confirmed</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Verified Candidates</span>
            <FileCheck className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">{verifiedCount} Verified</p>
          <p className="text-[0.68rem] text-muted-foreground">Ready for counseling allotment</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Pending Review</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">{pendingCount} Pending</p>
          <p className="text-[0.68rem] text-muted-foreground">Requires officer review</p>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-1 sm:flex-none items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search applicant, ID, course, score..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Course Filter */}
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="h-9 w-[160px] text-xs" aria-label="Course Filter">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              {COURSES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Submitted Applications Ledger
            <Badge variant="secondary" className="font-mono text-xs">
              {filtered.length} Applicants
            </Badge>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="size-5 animate-spin text-primary" />
            Loading admissions roster...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
            <GraduationCap className="size-7 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">No admission records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">App ID</th>
                  <th className="py-3 px-3">Applicant Name</th>
                  <th className="py-3 px-3">Target Course</th>
                  <th className="py-3 px-3">Merit Score</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Documents Audit</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{app.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{app.name}</div>
                      <div className="text-[0.68rem] text-muted-foreground font-mono">{app.email}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">{app.course}</td>
                    <td className="py-3 px-3 font-mono font-bold text-primary text-sm">
                      {app.meritScore}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="font-mono text-[0.68rem]">
                        {app.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 max-w-xs text-muted-foreground truncate" title={typeof app.documents === "string" ? app.documents : JSON.stringify(app.documents)}>
                      {typeof app.documents === "string"
                        ? app.documents
                        : typeof app.documents === "object" && app.documents !== null
                        ? Object.values(app.documents)
                            .map((d: any) => d?.name || d?.uploadedFileName || "Document")
                            .join(", ")
                        : "No Documents"}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        className={
                          app.status === "Admitted"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                            : app.status === "Verified" || app.status === "Seat Allotted"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[0.68rem]"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.68rem]"
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(app)}
                          className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                          title="View Dossier"
                        >
                          <Eye className="size-3.5" /> Details
                        </Button>

                        {app.status === "Under Review" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyDocs(app)}
                            className="h-7 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
                          >
                            <FileCheck className="size-3" /> Verify
                          </Button>
                        )}

                        {app.status !== "Admitted" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveSeat(app)}
                            className="h-7 text-xs font-semibold bg-brand-gradient text-white gap-1"
                          >
                            <UserCheck className="size-3" /> Enroll Seat
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(app.id, app.name)}
                          className="size-7 text-muted-foreground hover:text-red-600"
                          title="Delete Applicant"
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

      {/* DIALOG 1: REGISTER NEW APPLICANT MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Register New Student Applicant
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter applicant credentials, target program, qualifying score, and document status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Applicant Name *</Label>
                <Input
                  required
                  placeholder="e.g. Siddharth Malhotra"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address *</Label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. sid.m@gmail.com"
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
                <Label className="text-xs font-semibold">Target Program / Course</Label>
                <Select
                  value={formData.course}
                  onValueChange={(val) => setFormData({ ...formData, course: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.filter((c) => c !== "All Courses").map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Qualifying Merit Score (%)</Label>
                <Input
                  placeholder="e.g. 95.4%"
                  value={formData.meritScore || ""}
                  onChange={(e) => setFormData({ ...formData, meritScore: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Admission Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General" className="text-xs">
                      General Merit
                    </SelectItem>
                    <SelectItem value="OBC" className="text-xs">
                      OBC Non-Creamy
                    </SelectItem>
                    <SelectItem value="SC/ST" className="text-xs">
                      SC / ST Reservation
                    </SelectItem>
                    <SelectItem value="Management Quota" className="text-xs">
                      Management Quota
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Previous School / Junior College</Label>
              <Input
                placeholder="e.g. Delhi Public School, R.K. Puram"
                value={formData.previousInstitute || ""}
                onChange={(e) => setFormData({ ...formData, previousInstitute: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Document Audit Remarks</Label>
              <Textarea
                placeholder="State 10th/12th marksheets, transfer certificates, or migration verification status..."
                value={formData.documents || ""}
                onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Register Applicant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: VIEW APPLICANT DOSSIER MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" /> Applicant Dossier & Audit
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedApp.id}
                  </Badge>
                  <Badge
                    className={
                      selectedApp.status === "Admitted"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }
                  >
                    {selectedApp.status}
                  </Badge>
                </div>
                <h2 className="text-base font-bold text-foreground">{selectedApp.name}</h2>
                <p className="text-xs text-primary font-mono">{selectedApp.email} &middot; {selectedApp.phone}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Target Program:</span>
                  <span className="font-semibold text-foreground">{selectedApp.course}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60 font-mono">
                  <span className="text-muted-foreground font-sans">Qualifying Merit Score:</span>
                  <span className="font-bold text-base text-primary">{selectedApp.meritScore}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Quota Category:</span>
                  <Badge variant="outline" className="font-mono text-xs">{selectedApp.category}</Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Previous Institution:</span>
                  <span className="font-medium text-foreground">{selectedApp.previousInstitute || "N/A"}</span>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <span className="text-muted-foreground font-semibold">Document Audit Notes:</span>
                  <p className="text-xs text-foreground font-medium">
                    {typeof selectedApp.documents === "string"
                      ? selectedApp.documents
                      : typeof selectedApp.documents === "object" && selectedApp.documents !== null
                      ? Object.values(selectedApp.documents)
                          .map((d: any) => `${d?.name || "Doc"}: ${d?.status || "Uploaded"}`)
                          .join(" | ")
                      : "No document notes"}
                  </p>
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
