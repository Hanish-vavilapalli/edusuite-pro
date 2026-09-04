import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  ShieldCheck,
  Building2,
  Users,
  Wallet,
  Clock,
  Calendar,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  CreditCard,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
} from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import {
  fetchApprovalRequests,
  fetchApprovalStats,
  fetchApprovalDetail,
  acceptApproval,
  rejectApproval,
  returnApproval,
  seedApprovalRequests,
  type ApprovalRecordItem,
  type ApprovalStatsResponse,
} from "@/modules/approval/ApprovalService";

export const Route = createFileRoute("/super-admin/approval-requests")({
  head: () => ({
    meta: [{ title: "Super Admin Acceptance Requests — EduSuite Pro" }],
  }),
  component: SuperAdminApprovalRequestsPage,
});

function SuperAdminApprovalRequestsPage() {
  return <SubPageComponent />;
}

function SubPageComponent() {
  const [requests, setRequests] = useState<ApprovalRecordItem[]>([]);
  const [stats, setStats] = useState<ApprovalStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Request & Modal States
  const [selectedReq, setSelectedReq] = useState<ApprovalRecordItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [acceptNotes, setAcceptNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, statData] = await Promise.all([
        fetchApprovalRequests({ stage: "SUPER_ADMIN_PENDING" }),
        fetchApprovalStats(),
      ]);

      // If backend has no approval records yet, trigger initial seed automatically
      if (reqData.length === 0 && statData.superAdminPendingCount === 0) {
        try {
          await seedApprovalRequests();
          const [reseededReq, reseededStats] = await Promise.all([
            fetchApprovalRequests({ stage: "SUPER_ADMIN_PENDING" }),
            fetchApprovalStats(),
          ]);
          setRequests(reseededReq);
          setStats(reseededStats);
          setLoading(false);
          return;
        } catch {}
      }

      setRequests(reqData);
      setStats(statData);
    } catch {
      toast.error("Failed to fetch pending approval requests from database.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === "all" || r.requestType.toUpperCase().includes(typeFilter.toUpperCase());
      const matchDept = deptFilter === "all" || r.department.toLowerCase().includes(deptFilter.toLowerCase());

      return matchSearch && matchType && matchDept;
    });
  }, [requests, search, typeFilter, deptFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage]);

  // ACTION: View Request Detail
  const handleView = async (reqItem: ApprovalRecordItem) => {
    const detail = await fetchApprovalDetail(reqItem.id);
    setSelectedReq(detail || reqItem);
    setIsDetailOpen(true);
  };

  // ACTION: Execute Super Admin Accept
  const handleConfirmAccept = async () => {
    if (!selectedReq) return;
    try {
      await acceptApproval(selectedReq.id, acceptNotes || "Accepted and authorized by Super Admin.");
      toast.success(`Request ${selectedReq.requestNumber} accepted & authorized for disbursement!`);
      setIsAcceptOpen(false);
      setIsDetailOpen(false);
      setSelectedReq(null);
      setAcceptNotes("");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept request.");
    }
  };

  // ACTION: Execute Super Admin Reject
  const handleConfirmReject = async () => {
    if (!selectedReq) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a valid rejection reason.");
      return;
    }
    try {
      await rejectApproval(selectedReq.id, rejectionReason.trim());
      toast.error(`Request ${selectedReq.requestNumber} rejected.`);
      setIsRejectOpen(false);
      setIsDetailOpen(false);
      setSelectedReq(null);
      setRejectionReason("");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reject request.");
    }
  };

  // ACTION: Return for Review
  const handleReturnReview = async (reqItem: ApprovalRecordItem) => {
    try {
      await returnApproval(reqItem.id, "Returned for Finance Dean re-examination.");
      toast.info(`Request ${reqItem.requestNumber} returned for review.`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to return request.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[0.65rem] uppercase text-amber-600 border-amber-500/30 bg-amber-500/10">
              3-TIER GOVERNANCE
            </Badge>
            <span className="text-xs text-muted-foreground">• Institutional Approval System</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Super Admin Acceptance Requests</h1>
          <p className="text-sm text-muted-foreground">Review & authorize pending HR-verified and Finance-audited institutional requests.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadData} className="h-8 text-xs gap-1.5 cursor-pointer">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
          </Button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Pending Acceptance"
          value={stats ? `${stats.superAdminPendingCount} Requests` : "..."}
          icon={FileCheck}
          tone="warning"
        />
        <KpiCard
          label="Payroll Requests"
          value={stats ? `${stats.payrollCount} Pending` : "..."}
          icon={CreditCard}
          tone="purple"
        />
        <KpiCard
          label="Reimbursements"
          value={stats ? `${stats.reimbursementCount} Claims` : "..."}
          icon={Wallet}
          tone="info"
        />
        <KpiCard
          label="Bank Account Changes"
          value={stats ? `${stats.bankChangeCount} Pending` : "..."}
          icon={UserCheck}
          tone="success"
        />
        <KpiCard
          label="Total Pending Amount"
          value={stats ? `₹${(stats.totalPendingAmount / 100000).toFixed(2)} Lakhs` : "..."}
          icon={Database}
          tone="danger"
        />
      </div>

      {/* MAIN ACCEPTANCE TABLE */}
      <Panel title="Institutional Pending Approval Queue" description="3-Tier Workflow: Faculty/Staff -> HR Verification -> Finance Dean Review -> Super Admin Acceptance">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Request ID, title, requester..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="h-9 w-[160px] text-xs">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Request Types</SelectItem>
                  <SelectItem value="payroll">Payroll Requests</SelectItem>
                  <SelectItem value="reimbursement">Reimbursement Claims</SelectItem>
                  <SelectItem value="bank_change">Bank Account Changes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deptFilter} onValueChange={(val) => { setDeptFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="h-9 w-[150px] text-xs">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cse">CSE Department</SelectItem>
                  <SelectItem value="ece">ECE Department</SelectItem>
                  <SelectItem value="me">ME Department</SelectItem>
                  <SelectItem value="eee">EEE Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Req ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Title & Request Details</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Requested By</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground">
                      <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading pending approval queue from InsForge Cloud PostgreSQL...
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground">
                      <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-2" />
                      No pending acceptance requests requiring Super Admin action.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-semibold text-foreground">{item.requestNumber}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono text-[0.65rem] uppercase">
                          {item.requestType}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-foreground max-w-[240px] truncate">{item.title}</td>
                      <td className="p-3 text-muted-foreground">{item.department}</td>
                      <td className="p-3 text-muted-foreground">{item.requestedBy}</td>
                      <td className="p-3 font-mono font-semibold text-foreground">
                        {item.amount ? `₹${item.amount.toLocaleString("en-IN")}` : "N/A"}
                      </td>
                      <td className="p-3">
                        <Badge className="bg-amber-500/10 text-amber-600 font-mono text-[0.65rem]">
                          SUPER_ADMIN_PENDING
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={item.priority === "Critical" ? "destructive" : "secondary"} className="text-[0.65rem]">
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 cursor-pointer" onClick={() => handleView(item)}>
                            <Eye className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-[0.65rem] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer gap-1"
                            onClick={() => { setSelectedReq(item); setIsAcceptOpen(true); }}
                          >
                            <CheckCircle2 className="size-3" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2 text-[0.65rem] font-bold cursor-pointer gap-1"
                            onClick={() => { setSelectedReq(item); setIsRejectOpen(true); }}
                          >
                            <XCircle className="size-3" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
            <span className="text-xs text-muted-foreground font-mono">
              Showing {filteredRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} pending requests
            </span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="size-3.5" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" className="h-7 w-7 p-0 text-xs font-mono cursor-pointer" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      {/* DETAIL MODAL WITH 3-TIER TIMELINE HISTORY */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Request Detail: {selectedReq?.requestNumber}</span>
              <Badge className="bg-amber-500/10 text-amber-600 font-mono text-[0.65rem]">
                {selectedReq?.currentStage}
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedReq?.title}</DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-4 pt-2">
              {selectedReq.payrollRecord && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2 text-xs">
                  <div className="font-bold text-primary flex items-center justify-between border-b border-primary/20 pb-1">
                    <span>Payroll Breakdown — {selectedReq.payrollRecord.monthYear}</span>
                    <span className="font-mono text-[0.7rem] bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                      {selectedReq.payrollRecord.financialYear || "FY 2026-27"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[0.75rem]">
                    <div><span className="text-muted-foreground block">Employee:</span> {selectedReq.payrollRecord.employeeName}</div>
                    <div><span className="text-muted-foreground block">Emp ID:</span> {selectedReq.payrollRecord.employeeId}</div>
                    <div><span className="text-muted-foreground block">Designation:</span> {selectedReq.payrollRecord.designation}</div>
                    <div><span className="text-muted-foreground block">Basic Pay:</span> ₹{(selectedReq.payrollRecord.basicPay || 0).toLocaleString("en-IN")}</div>
                    <div><span className="text-muted-foreground block">Allowances:</span> ₹{(selectedReq.payrollRecord.allowances || 0).toLocaleString("en-IN")}</div>
                    <div><span className="text-muted-foreground block">Deductions:</span> ₹{(selectedReq.payrollRecord.deductions || 0).toLocaleString("en-IN")}</div>
                    <div><span className="text-muted-foreground block">Gross Salary:</span> ₹{(selectedReq.payrollRecord.grossSalary || 0).toLocaleString("en-IN")}</div>
                    <div className="col-span-2"><span className="text-muted-foreground block">Net Salary Disbursed:</span> <strong className="text-emerald-600 font-bold">₹{(selectedReq.payrollRecord.netSalary || 0).toLocaleString("en-IN")}</strong></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg text-xs font-mono">
                <div>
                  <span className="text-muted-foreground block">Department:</span>
                  <span className="font-semibold text-foreground">{selectedReq.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Requested By:</span>
                  <span className="font-semibold text-foreground">{selectedReq.requestedBy}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Amount:</span>
                  <span className="font-semibold text-emerald-600">
                    {selectedReq.amount ? `₹${selectedReq.amount.toLocaleString("en-IN")}` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Masked Bank Credit:</span>
                  <span className="font-semibold text-foreground">{selectedReq.maskedBankAccount || "HDFC-****-8812"}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  3-Tier Institutional Governance Timeline
                </h4>
                <div className="space-y-2 border-l-2 border-primary/30 pl-3">
                  {selectedReq.timeline?.map((step, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-foreground">{step.stage}</span>
                        <Badge variant="outline" className="text-[0.6rem] font-mono">
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[0.7rem]">
                        Actor: {step.actor} ({step.role}) • {new Date(step.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground italic text-[0.7rem] bg-muted/20 p-1.5 rounded">
                        "{step.notes}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleReturnReview(selectedReq)} className="h-8 text-xs cursor-pointer gap-1">
                  <RotateCcw className="size-3.5" /> Return for Review
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsRejectOpen(true)}
                  className="h-8 text-xs cursor-pointer gap-1"
                >
                  <XCircle className="size-3.5" /> Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAcceptOpen(true)}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer gap-1"
                >
                  <CheckCircle2 className="size-3.5" /> Accept Request
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRM ACCEPTANCE DIALOG */}
      <Dialog open={isAcceptOpen} onOpenChange={setIsAcceptOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Accept Institutional Request?</DialogTitle>
            <DialogDescription>
              This will grant final Super Admin acceptance and transition the status to PROCESSING/APPROVED.
            </DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-800 dark:text-emerald-300 font-mono">
                <div><strong>Request:</strong> {selectedReq.requestNumber}</div>
                <div><strong>Title:</strong> {selectedReq.title}</div>
                <div><strong>Amount:</strong> ₹{(selectedReq.amount || 0).toLocaleString("en-IN")}</div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Super Admin Acceptance Notes</label>
                <Input
                  placeholder="e.g. Authorized for monthly bank direct credit disbursement."
                  value={acceptNotes}
                  onChange={(e) => setAcceptNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsAcceptOpen(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmAccept} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Confirm & Authorize
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REJECTION DIALOG (REQUIRES MANDATORY REASON) */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-1.5">
              <AlertTriangle className="size-4" /> Reject Request
            </DialogTitle>
            <DialogDescription>
              Please specify the institutional reason for rejecting request {selectedReq?.requestNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Rejection Reason *</label>
              <Input
                placeholder="e.g. Discrepancy in attendance LOP records; requires re-verification by HR."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsRejectOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmReject} className="h-8 text-xs font-bold">
                Confirm Rejection
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
