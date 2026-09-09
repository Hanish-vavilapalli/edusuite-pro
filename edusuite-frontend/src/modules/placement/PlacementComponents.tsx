import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  Building2,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  FileCheck,
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

import { useRole } from "@/context/role-context";
import {
  fetchPlacementDrives,
  fetchPlacedStudents,
  createPlacementDrive,
  addPlacedStudentOffer,
  INITIAL_DRIVES,
  INITIAL_PLACED,
  type PlacementDrive,
  type PlacedStudent,
} from "./PlacementService";

export function PlacementModuleView() {
  const { role, flags, department: userDept, profile } = useRole();
  const isHod = role === "hod" || flags?.includes("isHod");
  const hodDept = userDept || (profile?.department as string) || "CSE";

  const [drives, setDrives] = useState<PlacementDrive[]>(INITIAL_DRIVES);
  const [placed, setPlaced] = useState<PlacedStudent[]>(INITIAL_PLACED);
  const [activeTab, setActiveTab] = useState<"drives" | "placed">("drives");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Dialog States
  const [isAddDriveOpen, setIsAddDriveOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);

  // Forms
  const [driveForm, setDriveForm] = useState<Partial<PlacementDrive>>({
    companyName: "Amazon Web Services",
    jobRole: "Cloud Systems Engineer",
    ctcLpa: 18.0,
    eligibleDepts: [hodDept],
    driveDate: "2026-08-25",
    location: "Campus Placement Block",
  });

  const [offerForm, setOfferForm] = useState<Partial<PlacedStudent>>({
    rollNo: "22AIDS012",
    studentName: "Rohan Varma",
    department: hodDept,
    companyName: "Google India",
    jobRole: "SDE-1",
    ctcLpa: 32.5,
  });

  const loadData = async () => {
    setLoading(true);
    const [drv, pl] = await Promise.all([fetchPlacementDrives(), fetchPlacedStudents()]);
    setDrives(drv);
    setPlaced(pl);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDrives = drives.filter((d) => {
    const matchesDept = !isHod || d.eligibleDepts.includes(hodDept) || d.eligibleDepts.includes("All");
    return (
      matchesDept &&
      (d.companyName.toLowerCase().includes(search.toLowerCase()) ||
        d.jobRole.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const filteredPlaced = placed.filter((p) => {
    const matchesDept = !isHod || p.department.trim().toUpperCase() === hodDept.trim().toUpperCase();
    return (
      matchesDept &&
      (p.studentName.toLowerCase().includes(search.toLowerCase()) ||
        p.companyName.toLowerCase().includes(search.toLowerCase()) ||
        p.rollNo.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleAddDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveForm.companyName || !driveForm.jobRole) return toast.error("Enter company name and job role");
    const created = await createPlacementDrive(driveForm);
    setDrives((prev) => [created, ...prev]);
    setIsAddDriveOpen(false);
    toast.success(`Placement drive for "${created.companyName}" scheduled!`);
  };

  const handleAddOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.rollNo || !offerForm.studentName) return toast.error("Enter student roll number and name");
    const created = await addPlacedStudentOffer(offerForm);
    setPlaced((prev) => [created, ...prev]);
    setIsAddOfferOpen(false);
    toast.success(`Placement offer logged for ${created.studentName} at ${created.companyName} (₹${created.ctcLpa} LPA)!`);
  };

  const handleExportCSV = () => {
    const headers = ["Drive ID", "Company Name", "Job Role", "CTC LPA", "Drive Date", "Location", "Applicants", "Selected", "Status"];
    const rows = filteredDrives.map((d) => [d.id, `"${d.companyName}"`, `"${d.jobRole}"`, d.ctcLpa, d.driveDate, `"${d.location}"`, d.totalApplicants, d.selectedCount, d.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Placement_Drives_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported placement drives to CSV!");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Briefcase className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Placement & Career Guidance Cell
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                Enterprise Career Portal
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Corporate recruitment drives, CTC packages, placed student offers, and recruiter partnerships.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-9 gap-2 text-xs font-medium">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 gap-2 text-xs font-medium">
            <Download className="size-3.5" /> Export Report
          </Button>
          <Button size="sm" onClick={() => setIsAddOfferOpen(true)} variant="outline" className="h-9 border-primary/30 text-primary gap-2 text-xs font-semibold">
            <Award className="size-4" /> Add Student Offer
          </Button>
          <Button size="sm" onClick={() => setIsAddDriveOpen(true)} className="h-9 bg-brand-gradient text-white gap-2 text-xs font-semibold shadow-glow">
            <Plus className="size-4" /> Schedule Drive
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Placement Rate</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">94.2% Placed</p>
          <p className="text-[0.68rem] text-muted-foreground">Class of 2026</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Highest CTC Offered</span>
            <Award className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">₹45.0 LPA</p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">Microsoft Corp Offer</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Average Package CTC</span>
            <Briefcase className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">₹9.8 LPA</p>
          <p className="text-[0.68rem] text-muted-foreground">Across all engineering streams</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Corporate Recruiters</span>
            <Building2 className="size-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-600">140+ Companies</p>
          <p className="text-[0.68rem] text-purple-600 font-medium">MNCs & Fortune 500 Partners</p>
        </div>
      </div>

      {/* SUBPARTS TAB SWITCHER */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80">
        <button onClick={() => setActiveTab("drives")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "drives" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
          1. Corporate Recruitment Drives ({drives.length})
        </button>
        <button onClick={() => setActiveTab("placed")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "placed" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
          2. Placed Students & Offer Letters ({placed.length})
        </button>
      </div>

      {/* TAB 1: DRIVES */}
      {activeTab === "drives" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Drive ID</th>
                  <th className="py-3 px-3">Company Name</th>
                  <th className="py-3 px-3">Job Role Offered</th>
                  <th className="py-3 px-3">CTC Package</th>
                  <th className="py-3 px-3">Drive Date & Venue</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDrives.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{d.id}</td>
                    <td className="py-3 px-3 font-bold text-foreground">{d.companyName}</td>
                    <td className="py-3 px-3 font-semibold text-primary">{d.jobRole}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">₹{d.ctcLpa} LPA</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">{d.driveDate} ({d.location})</td>
                    <td className="py-3 px-3"><Badge className={d.status === "Upcoming" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"}>{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PLACED */}
      {activeTab === "placed" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Hired By Company</th>
                  <th className="py-3 px-3">Role & Package</th>
                  <th className="py-3 px-3">Offer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {placed.map((pl) => (
                  <tr key={pl.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{pl.rollNo}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">{pl.studentName}</td>
                    <td className="py-3 px-3">{pl.department}</td>
                    <td className="py-3 px-3 font-bold text-primary">{pl.companyName}</td>
                    <td className="py-3 px-3 font-medium text-foreground">{pl.jobRole} (<span className="font-mono text-emerald-600 font-bold">₹{pl.ctcLpa} LPA</span>)</td>
                    <td className="py-3 px-3"><Badge className="bg-emerald-500/10 text-emerald-600">{pl.offerLetterStatus}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DIALOG 1: ADD DRIVE */}
      <Dialog open={isAddDriveOpen} onOpenChange={setIsAddDriveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-lg font-bold">Schedule Recruitment Drive</DialogTitle></DialogHeader>
          <form onSubmit={handleAddDriveSubmit} className="space-y-3 pt-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Company Name *</Label><Input required placeholder="Amazon Web Services" value={driveForm.companyName || ""} onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })} className="h-9 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Job Role *</Label><Input required placeholder="Cloud Systems Engineer" value={driveForm.jobRole || ""} onChange={(e) => setDriveForm({ ...driveForm, jobRole: e.target.value })} className="h-9 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">CTC Package (LPA)</Label><Input type="number" step="0.5" value={driveForm.ctcLpa ?? 18.0} onChange={(e) => setDriveForm({ ...driveForm, ctcLpa: Number(e.target.value) })} className="h-9 text-xs font-mono" /></div>
            <DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => setIsAddDriveOpen(false)} className="text-xs">Cancel</Button><Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">Schedule Drive</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: ADD OFFER */}
      <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-lg font-bold">Add Placed Student Offer</DialogTitle></DialogHeader>
          <form onSubmit={handleAddOfferSubmit} className="space-y-3 pt-2">
            <div className="space-y-1"><Label className="text-xs font-semibold">Student Roll No *</Label><Input required placeholder="22AIDS012" value={offerForm.rollNo || ""} onChange={(e) => setOfferForm({ ...offerForm, rollNo: e.target.value })} className="h-9 text-xs font-mono uppercase" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Student Name *</Label><Input required placeholder="Rohan Varma" value={offerForm.studentName || ""} onChange={(e) => setOfferForm({ ...offerForm, studentName: e.target.value })} className="h-9 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Company Name *</Label><Input required placeholder="Google India" value={offerForm.companyName || ""} onChange={(e) => setOfferForm({ ...offerForm, companyName: e.target.value })} className="h-9 text-xs" /></div>
            <DialogFooter className="pt-2"><Button type="button" variant="outline" onClick={() => setIsAddOfferOpen(false)} className="text-xs">Cancel</Button><Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">Save Offer</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
