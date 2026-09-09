import React, { useEffect, useState, useMemo } from "react";
import {
  ShoppingBag,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Download,
  Eye,
  Building2,
  FileText,
  DollarSign,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Tag,
  MapPin,
  Calendar,
  Lock,
  Boxes,
  HelpCircle,
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

import { useRole } from "@/context/role-context";
import {
  fetchProcurementStats,
  fetchProcurementRecords,
  fetchDepartmentAssets,
  createEquipmentRequest,
  submitDamageReport,
  type ProcurementRecord,
  type ProcurementStats,
  type DepartmentAsset,
} from "./ProcurementService";

const EQUIPMENT_CATEGORIES = [
  "Workstations & Computing",
  "Lab Equipment & Instruments",
  "Networking Equipment",
  "AV & Projectors",
  "Classroom & Lab Furniture",
  "Software & Academic Licenses",
  "Consumables & Materials",
  "Other",
];

const PROBLEM_TYPES = [
  "Non-functional / System Failure",
  "Broken Equipment",
  "Physically Damaged",
  "Missing / Unaccounted",
  "Requires Maintenance",
  "Requires Replacement",
];

export function ProcurementModuleView() {
  const { role, flags, department: userDept, profile } = useRole();
  const isSuperAdmin =
    role === "super_admin" ||
    role === "superadmin" ||
    flags?.includes("isSystemAdmin");
  const hodDept = userDept || (profile?.department as string) || "CSE";

  // Data states
  const [stats, setStats] = useState<ProcurementStats>({
    departmentScope: hodDept,
    openRequests: 0,
    pendingApprovals: 0,
    approvedRequests: 0,
    damageReports: 0,
    totalEstimatedSpend: 0,
  });
  const [records, setRecords] = useState<ProcurementRecord[]>([]);
  const [departmentAssets, setDepartmentAssets] = useState<DepartmentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"requests" | "damage" | "workflow">("requests");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal dialog states
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProcurementRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // New Equipment Form State
  const [equipmentForm, setEquipmentForm] = useState({
    equipmentName: "",
    category: "Workstations & Computing",
    quantity: 1,
    requiredFor: "",
    location: "",
    priority: "High",
    estimatedUnitCost: 50000,
    estimatedTotalCost: 50000,
    justification: "",
    requiredByDate: "",
  });

  // Damage Report Form State
  const [damageForm, setDamageForm] = useState({
    assetId: "",
    assetCode: "",
    assetName: "",
    category: "",
    location: "",
    problemType: "Non-functional / System Failure",
    severity: "High",
    problemDescription: "",
    dateDiscovered: new Date().toISOString().split("T")[0],
    reportedBy: profile?.name || "HOD",
  });

  // Load all real data from backend
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsData, recordsData, assetsData] = await Promise.all([
        fetchProcurementStats(),
        fetchProcurementRecords(),
        fetchDepartmentAssets(),
      ]);

      setStats(statsData);
      setRecords(recordsData);
      setDepartmentAssets(assetsData);

      if (isManualRefresh) {
        toast.success("Procurement records refreshed successfully");
      }
    } catch (err: any) {
      console.error("Error loading procurement data:", err);
      toast.error(err.response?.data?.error || "Failed to load procurement records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Tab filter
      if (activeTab === "requests" && r.requestType !== "EQUIPMENT_REQUEST") return false;
      if (activeTab === "damage" && r.requestType !== "DAMAGE_REPORT") return false;

      // Status filter
      if (statusFilter !== "All") {
        if (statusFilter === "PENDING" && r.status !== "PENDING" && r.status !== "SUBMITTED") return false;
        if (statusFilter === "APPROVED" && r.status !== "APPROVED" && r.status !== "EXECUTED" && r.status !== "FINALIZED") return false;
        if (statusFilter === "REJECTED" && r.status !== "REJECTED") return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesReqNo = r.requestNumber.toLowerCase().includes(q);
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = (r.description || "").toLowerCase().includes(q);
        const matchesReqBy = (r.requestedBy || "").toLowerCase().includes(q);
        const matchesDept = (r.department || "").toLowerCase().includes(q);
        const matchesAssetCode = r.metadata?.assetCode?.toLowerCase().includes(q);
        if (!matchesReqNo && !matchesTitle && !matchesDesc && !matchesReqBy && !matchesDept && !matchesAssetCode) {
          return false;
        }
      }

      return true;
    });
  }, [records, activeTab, statusFilter, search]);

  // Handle Equipment Form Change
  const handleQtyCostChange = (qty: number, unitCost: number) => {
    const total = qty * unitCost;
    setEquipmentForm((prev) => ({
      ...prev,
      quantity: qty,
      estimatedUnitCost: unitCost,
      estimatedTotalCost: total,
    }));
  };

  // Submit New Equipment Request
  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentForm.equipmentName.trim() || !equipmentForm.justification.trim()) {
      toast.error("Please provide equipment name and justification.");
      return;
    }

    try {
      const created = await createEquipmentRequest(equipmentForm);
      toast.success(`Equipment request ${created.requestNumber} submitted for administrative approval!`);
      setIsEquipmentModalOpen(false);
      setEquipmentForm({
        equipmentName: "",
        category: "Workstations & Computing",
        quantity: 1,
        requiredFor: "",
        location: "",
        priority: "High",
        estimatedUnitCost: 50000,
        estimatedTotalCost: 50000,
        justification: "",
        requiredByDate: "",
      });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit equipment request");
    }
  };

  // Handle Asset Selector Change in Damage Report Form
  const handleAssetSelect = (assetId: string) => {
    const selected = departmentAssets.find((a) => a.id === assetId || a.assetTag === assetId);
    if (selected) {
      setDamageForm((prev) => ({
        ...prev,
        assetId: selected.id,
        assetCode: selected.assetTag,
        assetName: selected.name,
        category: selected.category,
        location: selected.location,
      }));
    }
  };

  // Submit Damage Report
  const handleDamageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageForm.assetId) {
      toast.error("Please select a department asset.");
      return;
    }
    if (!damageForm.problemDescription.trim()) {
      toast.error("Please provide details of the defect/damage.");
      return;
    }

    try {
      const created = await submitDamageReport({
        assetId: damageForm.assetId,
        problemType: damageForm.problemType,
        problemDescription: damageForm.problemDescription,
        severity: damageForm.severity,
        dateDiscovered: damageForm.dateDiscovered,
        reportedBy: damageForm.reportedBy,
        location: damageForm.location,
      });

      toast.success(
        `Damage report ${created.requestNumber} logged! Asset status set to 'Under Maintenance'.`
      );
      setIsDamageModalOpen(false);
      setDamageForm({
        assetId: "",
        assetCode: "",
        assetName: "",
        category: "",
        location: "",
        problemType: "Non-functional / System Failure",
        severity: "High",
        problemDescription: "",
        dateDiscovered: new Date().toISOString().split("T")[0],
        reportedBy: profile?.name || "HOD",
      });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit damage report");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records available to export.");
      return;
    }

    const headers = [
      "Request Number",
      "Type",
      "Title / Item",
      "Department",
      "Requested By",
      "Priority / Severity",
      "Status",
      "Stage",
      "Amount (INR)",
      "Created Date",
    ];

    const rows = filteredRecords.map((r) => [
      r.requestNumber,
      r.requestType === "EQUIPMENT_REQUEST" ? "Equipment Request" : "Damage Report",
      `"${r.title.replace(/"/g, '""')}"`,
      r.department,
      `"${r.requestedBy}"`,
      r.priority,
      r.status,
      r.currentStage,
      r.amount,
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Procurement_${stats.departmentScope}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredRecords.length} department records to CSV!`);
  };

  const openDetailsModal = (record: ProcurementRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <ShoppingBag className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Department Procurement & Equipment
              </h1>
              <Badge
                variant="outline"
                className="font-mono text-xs flex items-center gap-1.5 bg-primary/5 text-primary border-primary/30"
              >
                <Lock className="size-3" />
                <span>Scope: {stats.departmentScope}</span>
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Submit equipment requisitions, log damaged lab equipment, and track administrative approvals.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || filteredRecords.length === 0}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <Download className="size-3.5" /> Export CSV
          </Button>

          {/* Prominent Action 1: Request New Equipment */}
          <Button
            size="sm"
            onClick={() => setIsEquipmentModalOpen(true)}
            className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow hover:opacity-95"
          >
            <Plus className="size-4" /> Request New Equipment
          </Button>

          {/* Prominent Action 2: Report Damaged Equipment */}
          <Button
            size="sm"
            onClick={() => setIsDamageModalOpen(true)}
            className="h-9 bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold text-xs shadow-sm"
          >
            <AlertTriangle className="size-4" /> Report Damaged Equipment
          </Button>
        </div>
      </div>

      {/* Real PostgreSQL Department Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Open Requests */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>My Open Requests</span>
            <Clock className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {stats.openRequests}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">
            Under active review or processing
          </p>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Pending Approvals</span>
            <AlertCircle className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">
            {stats.pendingApprovals}
          </p>
          <p className="text-[0.68rem] text-amber-600 font-medium">
            Awaiting Admin / Finance clearance
          </p>
        </div>

        {/* Card 3: Approved Requests */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Approved Requests</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">
            {stats.approvedRequests}
          </p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">
            Sanctioned / PO released
          </p>
        </div>

        {/* Card 4: Damage Reports */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Damage Reports</span>
            <Wrench className="size-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600">
            {stats.damageReports}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">
            Assets flagged under maintenance
          </p>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "requests"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Boxes className="size-3.5" /> Equipment Requests
          </button>

          <button
            onClick={() => setActiveTab("damage")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "damage"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="size-3.5 text-amber-500" /> Damage Reports
          </button>

          <button
            onClick={() => setActiveTab("workflow")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "workflow"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-3.5 text-purple-500" /> All / Workflow Status
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-1 sm:flex-none items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search request #, equipment, asset tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="PENDING" className="text-xs">Pending / In Review</SelectItem>
              <SelectItem value="APPROVED" className="text-xs">Approved / Finalized</SelectItem>
              <SelectItem value="REJECTED" className="text-xs">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            {activeTab === "requests" ? (
              <>
                <Boxes className="size-4 text-primary" /> Department Equipment Requisitions
              </>
            ) : activeTab === "damage" ? (
              <>
                <Wrench className="size-4 text-amber-500" /> Department Equipment Damage Reports
              </>
            ) : (
              <>
                <ShieldCheck className="size-4 text-purple-500" /> Multi-Tier Approval Status
              </>
            )}
            <Badge variant="secondary" className="font-mono text-xs">
              {filteredRecords.length} Records
            </Badge>
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="size-6 animate-spin text-primary" />
            Loading PostgreSQL procurement data for {stats.departmentScope}...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl space-y-3">
            {activeTab === "requests" ? (
              <>
                <Boxes className="size-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-semibold text-foreground">
                  No equipment requests have been submitted by your department.
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  When new workstations, lab equipment, or classroom materials are needed, click &quot;Request New Equipment&quot; above.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEquipmentModalOpen(true)}
                  className="gap-2 text-xs"
                >
                  <Plus className="size-3.5" /> Create First Equipment Request
                </Button>
              </>
            ) : (
              <>
                <Wrench className="size-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-semibold text-foreground">
                  No damaged equipment reports found for your department.
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  All equipment in {stats.departmentScope} laboratories and classrooms is in active operating condition.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Item / Asset</th>
                  <th className="py-3 px-3">Location / Lab</th>
                  <th className="py-3 px-3">Requested By</th>
                  <th className="py-3 px-3">Amount / Cost</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRecords.map((r) => {
                  const isEquip = r.requestType === "EQUIPMENT_REQUEST";
                  const isPending =
                    r.status === "PENDING" ||
                    r.status === "SUBMITTED" ||
                    r.status === "IN_REVIEW";
                  const isApproved =
                    r.status === "APPROVED" ||
                    r.status === "EXECUTED" ||
                    r.status === "FINALIZED";

                  return (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      {/* Request Number */}
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {r.requestNumber}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3">
                        {isEquip ? (
                          <Badge variant="outline" className="text-[0.68rem] bg-blue-500/10 text-blue-600 border-blue-500/20">
                            New Equipment
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[0.68rem] bg-amber-500/10 text-amber-600 border-amber-500/20">
                            Damage Report
                          </Badge>
                        )}
                      </td>

                      {/* Item Title */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-foreground">{r.title}</div>
                        <div className="text-[0.68rem] text-muted-foreground truncate" title={r.description}>
                          {r.description}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-muted-foreground">
                        {r.metadata?.location || `${r.department} Department`}
                      </td>

                      {/* Requested By */}
                      <td className="py-3 px-3 font-medium text-foreground">
                        <div>{r.requestedBy}</div>
                        <div className="text-[0.65rem] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                        {r.amount > 0 ? `₹${r.amount.toLocaleString("en-IN")}` : "—"}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <Badge
                          variant="secondary"
                          className={
                            r.priority === "Urgent" || r.priority === "Critical"
                              ? "bg-red-500/10 text-red-600 font-semibold text-[0.68rem]"
                              : r.priority === "High"
                              ? "bg-amber-500/10 text-amber-600 font-semibold text-[0.68rem]"
                              : "text-muted-foreground text-[0.68rem]"
                          }
                        >
                          {r.priority}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <Badge
                          className={
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                              : r.status === "REJECTED"
                              ? "bg-red-500/10 text-red-600 border-red-500/20 text-[0.68rem]"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[0.68rem]"
                          }
                        >
                          {r.currentStage ? r.currentStage.replace(/_/g, " ") : r.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsModal(r)}
                          className="h-7 text-xs font-medium gap-1 text-primary hover:bg-primary/10"
                        >
                          <Eye className="size-3.5" /> Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DIALOG 1: REQUEST NEW EQUIPMENT MODAL (Strictly scoped to HOD department)  */}
      {/* ========================================================================= */}
      <Dialog open={isEquipmentModalOpen} onOpenChange={setIsEquipmentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Plus className="size-5 text-primary" /> Request New Equipment & Materials
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit a departmental equipment requisition for administrative review and financial approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEquipmentSubmit} className="space-y-4 pt-2">
            {/* Department Info - Read-only */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <span className="text-[0.68rem] uppercase font-bold text-muted-foreground block">
                  Requisitioning Department (Read-Only)
                </span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="size-4 text-primary" /> {stats.departmentScope} Department
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-background">
                Auto-assigned
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Equipment Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">Equipment / Item Name *</Label>
                <Input
                  required
                  placeholder="e.g. High Performance Desktop Workstations"
                  value={equipmentForm.equipmentName}
                  onChange={(e) =>
                    setEquipmentForm({ ...equipmentForm, equipmentName: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category *</Label>
                <Select
                  value={equipmentForm.category}
                  onValueChange={(val) =>
                    setEquipmentForm({ ...equipmentForm, category: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority *</Label>
                <Select
                  value={equipmentForm.priority}
                  onValueChange={(val) =>
                    setEquipmentForm({ ...equipmentForm, priority: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low" className="text-xs">Low</SelectItem>
                    <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                    <SelectItem value="High" className="text-xs">High</SelectItem>
                    <SelectItem value="Urgent" className="text-xs">Urgent / Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={equipmentForm.quantity}
                  onChange={(e) =>
                    handleQtyCostChange(
                      parseInt(e.target.value, 10) || 1,
                      equipmentForm.estimatedUnitCost
                    )
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Estimated Unit Cost */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Unit Cost (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={equipmentForm.estimatedUnitCost}
                  onChange={(e) =>
                    handleQtyCostChange(
                      equipmentForm.quantity,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Estimated Total Cost */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Total Cost (₹) *</Label>
                <Input
                  type="number"
                  readOnly
                  value={equipmentForm.estimatedTotalCost}
                  className="h-9 text-xs font-mono bg-muted font-bold text-emerald-600"
                />
              </div>

              {/* Required By Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Required By Date</Label>
                <Input
                  type="date"
                  value={equipmentForm.requiredByDate}
                  onChange={(e) =>
                    setEquipmentForm({ ...equipmentForm, requiredByDate: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              {/* Required For */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">Required For *</Label>
                <Input
                  required
                  placeholder="e.g. CSE AI/ML Lab & Practical Hands-on Sessions"
                  value={equipmentForm.requiredFor}
                  onChange={(e) =>
                    setEquipmentForm({ ...equipmentForm, requiredFor: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              {/* Laboratory / Classroom Location */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">
                  Laboratory / Classroom / Department Location *
                </Label>
                <Input
                  required
                  placeholder="e.g. Block A - Room 302 (AI Lab)"
                  value={equipmentForm.location}
                  onChange={(e) =>
                    setEquipmentForm({ ...equipmentForm, location: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              {/* Justification */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">
                  Justification / Requirement Description *
                </Label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Explain why this equipment is needed for academic, research, or operational requirements..."
                  value={equipmentForm.justification}
                  onChange={(e) =>
                    setEquipmentForm({ ...equipmentForm, justification: e.target.value })
                  }
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEquipmentModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-gradient text-white text-xs font-semibold"
              >
                Submit Requisition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: REPORT DAMAGED EQUIPMENT MODAL (Selector restricted to Dept)   */}
      {/* ========================================================================= */}
      <Dialog open={isDamageModalOpen} onOpenChange={setIsDamageModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5" /> Report Damaged or Defective Equipment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Flag equipment needing repair, maintenance, or replacement. Assets are restricted strictly to {stats.departmentScope} department.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDamageSubmit} className="space-y-4 pt-2">
            {/* Department Isolation Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-[0.68rem] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                  Department Asset Validation
                </span>
                <span className="text-xs text-muted-foreground">
                  Showing only assets belonging to <strong>{stats.departmentScope}</strong>
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-600">
                {departmentAssets.length} Available Assets
              </Badge>
            </div>

            {/* Asset Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Damaged Asset *</Label>
              <Select value={damageForm.assetId} onValueChange={handleAssetSelect}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose an asset from your department..." />
                </SelectTrigger>
                <SelectContent>
                  {departmentAssets.length === 0 ? (
                    <SelectItem value="none" disabled className="text-xs">
                      No assets found in department inventory
                    </SelectItem>
                  ) : (
                    departmentAssets.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">
                        {a.assetTag} — {a.name} ({a.location})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-filled details */}
            {damageForm.assetCode && (
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[0.72rem]">
                <div>
                  <span className="text-muted-foreground block">Asset Code:</span>
                  <span className="font-mono font-bold text-foreground">{damageForm.assetCode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Category:</span>
                  <span className="font-medium text-foreground">{damageForm.category}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Registered Location:</span>
                  <span className="font-medium text-foreground">{damageForm.location}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Problem Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Problem Type *</Label>
                <Select
                  value={damageForm.problemType}
                  onValueChange={(val) =>
                    setDamageForm({ ...damageForm, problemType: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROBLEM_TYPES.map((pt) => (
                      <SelectItem key={pt} value={pt} className="text-xs">
                        {pt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Severity *</Label>
                <Select
                  value={damageForm.severity}
                  onValueChange={(val) =>
                    setDamageForm({ ...damageForm, severity: val })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low" className="text-xs">Low (Minor cosmetic / partial feature)</SelectItem>
                    <SelectItem value="Medium" className="text-xs">Medium (Degraded performance)</SelectItem>
                    <SelectItem value="High" className="text-xs">High (Equipment inoperable)</SelectItem>
                    <SelectItem value="Critical" className="text-xs">Critical (Safety hazard / total breakdown)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Discovered */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date Discovered *</Label>
                <Input
                  type="date"
                  required
                  value={damageForm.dateDiscovered}
                  onChange={(e) =>
                    setDamageForm({ ...damageForm, dateDiscovered: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              {/* Reported By */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reported By</Label>
                <Input
                  value={damageForm.reportedBy}
                  onChange={(e) =>
                    setDamageForm({ ...damageForm, reportedBy: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              {/* Problem Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">Problem Description & Defect Details *</Label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Describe the exact physical damage, symptoms, error codes, or reason for failure..."
                  value={damageForm.problemDescription}
                  onChange={(e) =>
                    setDamageForm({ ...damageForm, problemDescription: e.target.value })
                  }
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDamageModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Log Damage Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 3: REQUEST & DAMAGE REPORT DETAILS VIEW MODAL                      */}
      {/* ========================================================================= */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    <span>{selectedRecord.requestNumber}</span>
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={
                      selectedRecord.status === "APPROVED" ||
                      selectedRecord.status === "EXECUTED" ||
                      selectedRecord.status === "FINALIZED"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : selectedRecord.status === "REJECTED"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }
                  >
                    {selectedRecord.currentStage?.replace(/_/g, " ") || selectedRecord.status}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedRecord.requestType === "EQUIPMENT_REQUEST"
                    ? "Equipment Requisition Details & Approval History"
                    : "Equipment Damage Report & Technical Inspection Status"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                {/* Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                  <div>
                    <span className="text-[0.68rem] text-muted-foreground uppercase font-bold block">
                      Department
                    </span>
                    <span className="font-semibold text-foreground">{selectedRecord.department}</span>
                  </div>

                  <div>
                    <span className="text-[0.68rem] text-muted-foreground uppercase font-bold block">
                      Submitted By
                    </span>
                    <span className="font-semibold text-foreground">{selectedRecord.requestedBy}</span>
                  </div>

                  <div>
                    <span className="text-[0.68rem] text-muted-foreground uppercase font-bold block">
                      Priority / Severity
                    </span>
                    <span className="font-semibold text-foreground">{selectedRecord.priority}</span>
                  </div>

                  <div>
                    <span className="text-[0.68rem] text-muted-foreground uppercase font-bold block">
                      Location / Lab
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedRecord.metadata?.location || `${selectedRecord.department} Lab`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[0.68rem] text-muted-foreground uppercase font-bold block">
                      Submission Date
                    </span>
                    <span className="font-semibold text-foreground">
                      {new Date(selectedRecord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[0.68rem] text-muted-foreground uppercase font-bold block">
                      Amount / Cost
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      {selectedRecord.amount > 0 ? `₹${selectedRecord.amount.toLocaleString("en-IN")}` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Main Item & Description */}
                <div className="p-3.5 rounded-xl border border-border space-y-2 bg-card">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Tag className="size-4 text-primary" /> {selectedRecord.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedRecord.description}
                  </p>

                  {selectedRecord.metadata?.requiredFor && (
                    <div className="pt-2 border-t border-border/60 text-[0.72rem]">
                      <strong className="text-foreground">Required For: </strong>
                      <span className="text-muted-foreground">{selectedRecord.metadata.requiredFor}</span>
                    </div>
                  )}

                  {selectedRecord.metadata?.problemType && (
                    <div className="pt-2 border-t border-border/60 text-[0.72rem]">
                      <strong className="text-foreground">Problem Type: </strong>
                      <span className="text-muted-foreground">{selectedRecord.metadata.problemType}</span>
                    </div>
                  )}
                </div>

                {/* Workflow Progression Timeline */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-purple-600" />
                    Approval & Inspection Workflow Timeline
                  </h4>

                  <div className="space-y-2">
                    {(selectedRecord.steps || []).map((step, idx) => {
                      const isDone = step.status === "APPROVED";
                      const isCurr = step.status === "PENDING" && idx + 1 === selectedRecord.currentStep;

                      return (
                        <div
                          key={step.stepNumber}
                          className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                            isDone
                              ? "bg-emerald-500/5 border-emerald-500/20"
                              : isCurr
                              ? "bg-blue-500/5 border-blue-500/30"
                              : "bg-muted/20 border-border/60 opacity-60"
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              isDone
                                ? "bg-emerald-500 text-white"
                                : isCurr
                                ? "bg-blue-500 text-white animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <Clock className="size-3.5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground text-xs">
                                Step {step.stepNumber}: {step.label}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[0.62rem] font-mono ${
                                  isDone
                                    ? "text-emerald-600 border-emerald-500/30"
                                    : isCurr
                                    ? "text-blue-600 border-blue-500/30"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {step.status}
                              </Badge>
                            </div>

                            {step.comment && (
                              <p className="text-[0.7rem] text-muted-foreground mt-1 italic">
                                &quot;{step.comment}&quot;
                              </p>
                            )}

                            {step.actedAt && (
                              <span className="text-[0.65rem] text-muted-foreground block mt-0.5">
                                Acted at: {new Date(step.actedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProcurementModuleView;
