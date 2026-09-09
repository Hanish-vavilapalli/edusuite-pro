import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  RefreshCw,
  Download,
  Award,
  TrendingUp,
  Building2,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useRole } from "@/context/role-context";
import {
  fetchHodPlacementStats,
  fetchPlacementDrives,
  fetchPlacedStudents,
  createPlacementDrive,
  addPlacedStudentOffer,
  type PlacementDrive,
  type PlacedStudent,
  type PlacementStats,
} from "./PlacementService";

// ─── KPI Skeleton ────────────────────────────────────────────────────────────
function KpiSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm animate-pulse space-y-2">
      <div className="h-3 bg-muted rounded w-2/3" />
      <div className="h-7 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-3/4" />
    </div>
  );
}

// ─── Empty Row ───────────────────────────────────────────────────────────────
function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="size-8 opacity-40" />
          <p className="text-xs font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function PlacementModuleView() {
  const { role, flags, department: userDept } = useRole();
  const isHod = role === "hod" || flags?.includes("isHod");

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats, setStats]   = useState<PlacementStats | null>(null);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [placed, setPlaced] = useState<PlacedStudent[]>([]);

  const [statsLoading,  setStatsLoading]  = useState(true);
  const [drivesLoading, setDrivesLoading] = useState(true);
  const [placedLoading, setPlacedLoading] = useState(true);
  const [statsError,    setStatsError]    = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"drives" | "placed">("drives");
  const [search,    setSearch]    = useState("");
  const isRefreshing = useRef(false);

  // Dialog state
  const [isAddDriveOpen, setIsAddDriveOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [driveSubmitting, setDriveSubmitting] = useState(false);
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // Forms — minimal defaults, NO hardcoded company/CTC/dept values
  const [driveForm, setDriveForm] = useState<Partial<PlacementDrive>>({});
  const [offerForm, setOfferForm] = useState<{
    rollNo?: string; companyName?: string; jobRole?: string; ctcLpa?: number; offerDate?: string;
  }>({});

  // ── Data loading ───────────────────────────────────────────────────────────
  const loadAll = useCallback(async (searchQuery = "") => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setStatsLoading(true);
    setDrivesLoading(true);
    setPlacedLoading(true);
    setStatsError(null);

    try {
      const [s, d, p] = await Promise.all([
        fetchHodPlacementStats(),
        fetchPlacementDrives(searchQuery || undefined),
        fetchPlacedStudents(searchQuery || undefined),
      ]);

      if (s === null) {
        setStatsError("Could not load placement statistics. Ensure your account has a department assigned.");
      }
      setStats(s);
      setDrives(d);
      setPlaced(p);
    } finally {
      setStatsLoading(false);
      setDrivesLoading(false);
      setPlacedLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Search with 400ms debounce ─────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => loadAll(search), 400);
    return () => clearTimeout(t);
  }, [search, loadAll]);

  const handleRefresh = () => {
    toast.promise(loadAll(search), {
      loading: "Refreshing placement data…",
      success: "Placement data refreshed.",
      error: "Failed to refresh placement data.",
    });
  };

  // ── Add Drive ──────────────────────────────────────────────────────────────
  const handleAddDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveForm.companyName || !driveForm.jobRole) {
      return toast.error("Company name and job role are required.");
    }
    setDriveSubmitting(true);
    try {
      const created = await createPlacementDrive(driveForm);
      setDrives((prev) => [created, ...prev]);
      setIsAddDriveOpen(false);
      setDriveForm({});
      toast.success(`Drive for "${created.companyName}" scheduled and saved to database.`);
      // Refresh stats to reflect new recruiter count
      fetchHodPlacementStats().then((s) => s && setStats(s));
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule drive.");
    } finally {
      setDriveSubmitting(false);
    }
  };

  // ── Add Offer ──────────────────────────────────────────────────────────────
  const handleAddOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.rollNo || !offerForm.companyName || !offerForm.jobRole) {
      return toast.error("Roll number, company name, and job role are required.");
    }
    setOfferSubmitting(true);
    try {
      const created = await addPlacedStudentOffer(offerForm);
      setPlaced((prev) => [created, ...prev]);
      setIsAddOfferOpen(false);
      setOfferForm({});
      toast.success(`Offer for ${created.studentName} at ${created.companyName} saved to database.`);
      // Refresh stats after new placement record
      fetchHodPlacementStats().then((s) => s && setStats(s));
    } catch (err: any) {
      toast.error(err.message || "Failed to add offer.");
    } finally {
      setOfferSubmitting(false);
    }
  };

  // ── Export — HOD-scoped data only ──────────────────────────────────────────
  const handleExportCSV = () => {
    const dept = stats?.department || "DEPT";
    const today = new Date().toISOString().split("T")[0];
    const headers = ["Drive ID", "Company Name", "Job Role", "CTC LPA", "Drive Date", "Location", "Applicants", "Selected", "Status"];
    const rows = drives.map((d) => [
      d.id, `"${d.companyName}"`, `"${d.jobRole}"`, d.ctcLpa,
      d.driveDate, `"${d.location || ""}"`, d.totalApplicants, d.selectedCount, d.status,
    ]);
    const csv = "data:text/csv;charset=utf-8," +
      encodeURIComponent([headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
    const a = document.createElement("a");
    a.href = csv;
    a.download = `Placement_Report_${dept}_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Exported ${dept} placement report.`);
  };

  const loading = statsLoading || drivesLoading || placedLoading;
  const deptLabel = stats?.departmentName || stats?.department || userDept || "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Briefcase className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Placement &amp; Career Guidance Cell
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                Enterprise Career Portal
              </Badge>
              {/* Read-only department badge — from authenticated HOD scope */}
              {deptLabel && (
                <Badge variant="secondary" className="text-xs font-semibold">
                  Dept: {deptLabel}
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Corporate recruitment drives, CTC packages, placed student offers, and recruiter partnerships.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="h-9 gap-2 text-xs font-medium">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={loading || drives.length === 0} className="h-9 gap-2 text-xs font-medium">
            <Download className="size-3.5" /> Export Report
          </Button>
          {isHod && (
            <>
              <Button size="sm" onClick={() => setIsAddOfferOpen(true)} variant="outline" className="h-9 border-primary/30 text-primary gap-2 text-xs font-semibold">
                <Award className="size-4" /> Add Student Offer
              </Button>
              <Button size="sm" onClick={() => setIsAddDriveOpen(true)} className="h-9 bg-brand-gradient text-white gap-2 text-xs font-semibold shadow-glow">
                <Plus className="size-4" /> Schedule Drive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Department scope error (HOD has no dept assigned) ─────────────── */}
      {statsError && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-destructive">
          <ShieldAlert className="size-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Department Scope Error</p>
            <p className="text-xs mt-0.5">{statsError}</p>
          </div>
        </div>
      )}

      {/* ── KPI Cards — live PostgreSQL data, no hardcoded fallback ──────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">

        {/* Placement Rate */}
        {statsLoading ? <KpiSkeleton /> : (
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Placement Rate</span>
              <TrendingUp className="size-4 text-primary" />
            </div>
            {stats ? (
              <>
                <p className="text-2xl font-bold font-mono text-primary">{stats.placementRate}% Placed</p>
                <p className="text-[0.68rem] text-muted-foreground">
                  {stats.placedCount} of {stats.totalStudents} students &bull; {stats.departmentName}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">—</p>
                <p className="text-[0.68rem] text-muted-foreground">No placement data available</p>
              </>
            )}
          </div>
        )}

        {/* Highest CTC */}
        {statsLoading ? <KpiSkeleton /> : (
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Highest CTC Offered</span>
              <Award className="size-4 text-emerald-500" />
            </div>
            {stats?.highestCtc != null ? (
              <>
                <p className="text-2xl font-bold font-mono text-emerald-600">₹{stats.highestCtc} LPA</p>
                <p className="text-[0.68rem] text-emerald-600 font-medium">{stats.highestCtcCompany}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">No offers yet</p>
                <p className="text-[0.68rem] text-muted-foreground">No placement records in dept</p>
              </>
            )}
          </div>
        )}

        {/* Average Package */}
        {statsLoading ? <KpiSkeleton /> : (
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Average Package CTC</span>
              <Briefcase className="size-4 text-blue-500" />
            </div>
            {stats?.averageCtc != null ? (
              <>
                <p className="text-2xl font-bold font-mono text-blue-600">₹{stats.averageCtc} LPA</p>
                <p className="text-[0.68rem] text-muted-foreground">Dept: {stats.departmentName}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">No offers yet</p>
                <p className="text-[0.68rem] text-muted-foreground">Dept: {deptLabel || "—"}</p>
              </>
            )}
          </div>
        )}

        {/* Corporate Recruiters */}
        {statsLoading ? <KpiSkeleton /> : (
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Corporate Recruiters</span>
              <Building2 className="size-4 text-purple-500" />
            </div>
            {stats ? (
              <>
                <p className="text-2xl font-bold font-mono text-purple-600">{stats.recruiterCount} Companies</p>
                <p className="text-[0.68rem] text-purple-600 font-medium">
                  {stats.recruiterCount > 0 ? "Recruited from dept" : "No recruiter data yet"}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">—</p>
                <p className="text-[0.68rem] text-muted-foreground">No placement data available</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search drives or students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80">
        <button
          onClick={() => setActiveTab("drives")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "drives" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
        >
          1. Corporate Recruitment Drives ({drivesLoading ? "…" : drives.length})
        </button>
        <button
          onClick={() => setActiveTab("placed")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "placed" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
        >
          2. Placed Students &amp; Offer Letters ({placedLoading ? "…" : placed.length})
        </button>
      </div>

      {/* ── Tab 1: Drives ─────────────────────────────────────────────────── */}
      {activeTab === "drives" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Drive ID</th>
                  <th className="py-3 px-3">Company Name</th>
                  <th className="py-3 px-3">Job Role Offered</th>
                  <th className="py-3 px-3">CTC Package</th>
                  <th className="py-3 px-3">Drive Date &amp; Venue</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {drivesLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      <Loader2 className="size-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : drives.length === 0 ? (
                  <EmptyRow colSpan={6} message="No placement drives available for this department." />
                ) : (
                  drives.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-foreground">{d.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-3 px-3 font-bold text-foreground">{d.companyName}</td>
                      <td className="py-3 px-3 font-semibold text-primary">{d.jobRole}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                        {d.ctcLpa > 0 ? `₹${d.ctcLpa} LPA` : "—"}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {d.driveDate}{d.location ? ` (${d.location})` : ""}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={
                          d.status === "Upcoming"  ? "bg-blue-500/10 text-blue-600" :
                          d.status === "Ongoing"   ? "bg-amber-500/10 text-amber-600" :
                          "bg-emerald-500/10 text-emerald-600"
                        }>{d.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Placed Students ────────────────────────────────────────── */}
      {activeTab === "placed" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Hired By Company</th>
                  <th className="py-3 px-3">Role &amp; Package</th>
                  <th className="py-3 px-3">Offer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {placedLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      <Loader2 className="size-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : placed.length === 0 ? (
                  <EmptyRow colSpan={6} message="No placement data available for this department." />
                ) : (
                  placed.map((pl) => (
                    <tr key={pl.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-foreground">{pl.rollNo}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">{pl.studentName}</td>
                      <td className="py-3 px-3">{pl.department}</td>
                      <td className="py-3 px-3 font-bold text-primary">{pl.companyName}</td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {pl.jobRole}{" "}
                        {pl.ctcLpa > 0 && (
                          <span className="font-mono text-emerald-600 font-bold">(₹{pl.ctcLpa} LPA)</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={
                          pl.offerLetterStatus === "Accepted"            ? "bg-emerald-500/10 text-emerald-600" :
                          pl.offerLetterStatus === "Pending Verification" ? "bg-amber-500/10 text-amber-600" :
                          "bg-blue-500/10 text-blue-600"
                        }>{pl.offerLetterStatus}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Dialog: Schedule Drive ─────────────────────────────────────────── */}
      <Dialog open={isAddDriveOpen} onOpenChange={setIsAddDriveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Schedule Recruitment Drive</DialogTitle>
            {deptLabel && (
              <p className="text-xs text-muted-foreground mt-1">
                Drive will be scoped to your department: <strong>{deptLabel}</strong>
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleAddDriveSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Company Name *</Label>
              <Input required placeholder="e.g. Infosys Technologies" value={driveForm.companyName || ""} onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Job Role *</Label>
              <Input required placeholder="e.g. Systems Engineer" value={driveForm.jobRole || ""} onChange={(e) => setDriveForm({ ...driveForm, jobRole: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">CTC Package (LPA)</Label>
              <Input type="number" step="0.5" min="0" placeholder="0" value={driveForm.ctcLpa ?? ""} onChange={(e) => setDriveForm({ ...driveForm, ctcLpa: Number(e.target.value) })} className="h-9 text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Drive Date</Label>
              <Input type="date" value={driveForm.driveDate || ""} onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Location / Venue</Label>
              <Input placeholder="e.g. Campus Auditorium" value={driveForm.location || ""} onChange={(e) => setDriveForm({ ...driveForm, location: e.target.value })} className="h-9 text-xs" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddDriveOpen(false)} className="text-xs">Cancel</Button>
              <Button type="submit" disabled={driveSubmitting} className="bg-brand-gradient text-white text-xs font-semibold">
                {driveSubmitting ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
                Schedule Drive
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Add Student Offer ─────────────────────────────────────── */}
      <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Placed Student Offer</DialogTitle>
            {deptLabel && (
              <p className="text-xs text-muted-foreground mt-1">
                Student must belong to your department: <strong>{deptLabel}</strong>. Cross-department submissions are rejected.
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleAddOfferSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Student Roll No *</Label>
              <Input required placeholder="e.g. 22CS001" value={offerForm.rollNo || ""} onChange={(e) => setOfferForm({ ...offerForm, rollNo: e.target.value.toUpperCase() })} className="h-9 text-xs font-mono uppercase" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Company Name *</Label>
              <Input required placeholder="e.g. Wipro Technologies" value={offerForm.companyName || ""} onChange={(e) => setOfferForm({ ...offerForm, companyName: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Job Role *</Label>
              <Input required placeholder="e.g. Software Engineer" value={offerForm.jobRole || ""} onChange={(e) => setOfferForm({ ...offerForm, jobRole: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">CTC Package (LPA)</Label>
              <Input type="number" step="0.5" min="0" placeholder="0" value={offerForm.ctcLpa ?? ""} onChange={(e) => setOfferForm({ ...offerForm, ctcLpa: Number(e.target.value) })} className="h-9 text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Offer Date</Label>
              <Input type="date" value={offerForm.offerDate || ""} onChange={(e) => setOfferForm({ ...offerForm, offerDate: e.target.value })} className="h-9 text-xs" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOfferOpen(false)} className="text-xs">Cancel</Button>
              <Button type="submit" disabled={offerSubmitting} className="bg-brand-gradient text-white text-xs font-semibold">
                {offerSubmitting ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
                Save Offer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
