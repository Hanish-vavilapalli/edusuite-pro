import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  GitBranch,
  CheckCircle2,
  XCircle,
  Building,
  UserCheck,
  FileCheck,
  Lock,
  RefreshCw,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/role-context";

import {
  fetchApprovalRequests,
  acceptApproval,
  rejectApproval,
  returnApproval,
  seedApprovalRequests,
  type ApprovalRecordItem,
} from "@/modules/approval/ApprovalService";

export const Route = createFileRoute("/approval-workflows")({
  head: () => ({
    meta: [{ title: "Approval Workflows — EduSuite Pro" }],
  }),
  component: ApprovalWorkflowsPage,
});

export function ApprovalWorkflowsPage() {
  const { hasFlag, role } = useRole();
  const [requests, setRequests] = useState<ApprovalRecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      let data = await fetchApprovalRequests();
      if (data.length === 0) {
        await seedApprovalRequests();
        data = await fetchApprovalRequests();
      }
      setRequests(data);
    } catch (err) {
      toast.error("Failed to load approval workflows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await acceptApproval(id, "Step approved via workflow portal.");
      toast.success("Workflow step approved successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to approve step.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter mandatory rejection reason:");
    if (!reason || !reason.trim()) {
      toast.error("Rejection reason is mandatory.");
      return;
    }
    try {
      await rejectApproval(id, reason.trim());
      toast.error("Workflow request rejected.");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reject request.");
    }
  };

  const handleReturn = async (id: string) => {
    const notes = window.prompt("Enter return for review notes:");
    try {
      await returnApproval(id, notes || "Returned for review.");
      toast.info("Request returned for review.");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to return request.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <GitBranch className="size-6" />
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold sm:text-2xl">
                Multi-Level Institutional Approval Workflows
              </h1>
              <p className="text-sm text-muted-foreground">
                Centralized engine for high-risk operations (Attendance, Leaves, Marks, Budgets, Payroll, Clearances).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-2 text-xs font-medium"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Badge className="bg-brand-gradient text-white font-mono">
              CENTRAL WORKFLOW ENGINE
            </Badge>
          </div>
        </header>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground font-mono text-sm">
            Loading active institutional workflow engine requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border rounded-2xl bg-card">
            No active approval workflow requests found.
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((wf) => {
              const steps = wf.steps || [
                { stepNumber: 1, requiredRole: wf.requestedByRole, label: "Submission", status: "APPROVED" },
                { stepNumber: 2, requiredRole: "hod", label: "HOD Verification", status: "PENDING" },
                { stepNumber: 3, requiredRole: "super_admin", label: "Executive Sign-off", status: "PENDING" },
              ];
              const curStepNum = wf.currentStep || 1;
              const isCompleted = wf.status === "EXECUTED" || wf.status === "FINALIZED" || wf.status === "SUPER_ADMIN_ACCEPTED" || wf.status === "REJECTED";
              const currentStepDef = steps.find((s) => s.stepNumber === curStepNum) || steps[1] || steps[0];

              return (
                <Panel
                  key={wf.id}
                  title={wf.title}
                  description={`Module: ${wf.module || wf.requestType} | Code: ${wf.workflowCode || "CUSTOM"} | Requested by ${wf.requestedBy} (${wf.department}) on ${new Date(wf.createdAt).toLocaleDateString("en-IN")}`}
                  action={
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {wf.requestNumber}
                      </Badge>
                      <Badge
                        className={
                          wf.status === "EXECUTED" || wf.status === "SUPER_ADMIN_ACCEPTED"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : wf.status === "REJECTED"
                            ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                            : wf.status === "RETURNED_FOR_REVIEW"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                            : "bg-blue-500/15 text-blue-600 border-blue-500/30"
                        }
                      >
                        {wf.status}
                      </Badge>
                    </div>
                  }
                >
                  <div className="space-y-6">
                    {/* WORKFLOW STEP DIAGRAM */}
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                      {steps.map((step, idx) => {
                        const stepNum = step.stepNumber || idx + 1;
                        const isPast = step.status === "APPROVED";
                        const isCurrent = !isPast && stepNum === curStepNum && !isCompleted;
                        const isRejected = step.status === "REJECTED" || wf.status === "REJECTED";
                        const isReturned = step.status === "RETURNED" || wf.status === "RETURNED_FOR_REVIEW";

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                              isPast
                                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                                : isCurrent
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : isRejected
                                ? "border-rose-500/30 bg-rose-500/5"
                                : isReturned
                                ? "border-amber-500/30 bg-amber-500/5"
                                : "border-border/60 bg-muted/20 opacity-70"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                Step {stepNum} ({step.requiredRole.toUpperCase()})
                              </span>
                              {isPast && <CheckCircle2 className="size-4 text-emerald-600" />}
                              {isCurrent && (
                                <Badge className="bg-primary text-primary-foreground text-[0.65rem] px-1.5 py-0">
                                  ACTIVE STEP
                                </Badge>
                              )}
                              {isRejected && <XCircle className="size-4 text-rose-600" />}
                              {!isPast && !isCurrent && !isRejected && <Lock className="size-3.5 text-muted-foreground" />}
                            </div>

                            <h4 className="font-display text-sm font-bold">{step.label}</h4>
                            {step.comment && <p className="text-xs text-muted-foreground mt-1">{step.comment}</p>}
                            {step.actorName && (
                              <p className="text-[0.68rem] font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                                Signed: {step.actorName}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* ACTION FOOTER */}
                    {!isCompleted && (
                      <div className="p-4 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Active Step {curStepNum}:{" "}
                            <span className="text-primary">{currentStepDef?.label || "Authorization Required"}</span>
                          </p>
                          <p className="text-[0.72rem] text-muted-foreground mt-0.5">
                            Required Role: <span className="font-mono font-semibold">{currentStepDef?.requiredRole?.toUpperCase()}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(wf.id)}
                            className="bg-brand-gradient text-xs cursor-pointer gap-1.5 shadow-glow"
                          >
                            <CheckCircle2 className="size-4" /> Approve Step
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturn(wf.id)}
                            className="text-xs cursor-pointer gap-1.5 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                          >
                            Return for Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(wf.id)}
                            className="text-xs cursor-pointer gap-1.5 text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                          >
                            <XCircle className="size-4" /> Reject Request
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
