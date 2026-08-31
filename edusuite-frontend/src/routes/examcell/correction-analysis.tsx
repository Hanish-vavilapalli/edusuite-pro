import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import api from "@/lib/api";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Award, 
  BarChart3,
  Building2,
  Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  getStoredEvaluationBatches,
  EvaluationBatch
} from "@/lib/mock-evaluation-store";

export const Route = createFileRoute("/examcell/correction-analysis")({
  head: () => ({
    meta: [{ title: "Correction Analysis & Valuation Dashboard — EduSuite Pro" }],
  }),
  component: CorrectionAnalysisPage,
});

interface BranchStat {
  code: string;
  name: string;
  allocated: number;
  corrected: number;
  pending: number;
  progressPercent: number;
}

interface EvaluatorBreakdownItem {
  name: string;
  allocated: number;
  corrected: number;
  scoreAvg: number;
}

const BRANCH_NAME_MAP: Record<string, string> = {
  CSE: "Computer Science & Engineering",
  AIML: "Artificial Intelligence & ML",
  AIDS: "Artificial Intelligence & DS",
  ECE: "Electronics & Communication",
  EEE: "Electrical & Electronics",
  MECH: "Mechanical Engineering"
};

function CorrectionAnalysisPage() {
  const [allBatches, setAllBatches] = useState<EvaluationBatch[]>([]);

  // Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBranchForDetails, setSelectedBranchForDetails] = useState<BranchStat | null>(null);

  const fetchRealtimeAnalysis = async () => {
    try {
      await api.get("/api/exams/correction-analysis");
    } catch (e) {}
    setAllBatches(getStoredEvaluationBatches());
  };

  useEffect(() => {
    fetchRealtimeAnalysis();
  }, []);

  // Compute Overall KPIs dynamically
  const allBooklets = useMemo(() => allBatches.flatMap(b => b.booklets), [allBatches]);
  const allocated = allBooklets.length;
  const corrected = allBooklets.filter(bk => bk.evaluationStatus === 'Completed').length;
  const pending = allocated - corrected;
  const valuationRate = allocated > 0 ? Number(((corrected / allocated) * 100).toFixed(1)) : 0;

  // Compute Branch Stats dynamically
  const branchStats = useMemo(() => {
    const branches = ["CSE", "AIML", "AIDS", "ECE", "EEE", "MECH"];
    const result: Record<string, BranchStat> = {};

    branches.forEach(b => {
      const bBatches = allBatches.filter(batch => batch.branch === b);
      const bBooklets = bBatches.flatMap(batch => batch.booklets);
      const bAlloc = bBooklets.length;
      const bCorr = bBooklets.filter(bk => bk.evaluationStatus === 'Completed').length;
      const bPend = bAlloc - bCorr;
      const bProg = bAlloc > 0 ? Math.round((bCorr / bAlloc) * 100) : 0;

      result[b] = {
        code: b,
        name: BRANCH_NAME_MAP[b] || `${b} Department`,
        allocated: bAlloc,
        corrected: bCorr,
        pending: bPend,
        progressPercent: bProg
      };
    });

    return result;
  }, [allBatches]);

  // Compute Evaluator Breakdown per branch
  const evaluatorBreakdowns = useMemo(() => {
    const result: Record<string, EvaluatorBreakdownItem[]> = {};

    Object.keys(branchStats).forEach(branchCode => {
      const bBatches = allBatches.filter(b => b.branch === branchCode);
      const evalMap: Record<string, { allocated: number; corrected: number; scoreSum: number }> = {};

      bBatches.forEach(b => {
        const facName = b.facultyName;
        if (!evalMap[facName]) {
          evalMap[facName] = { allocated: 0, corrected: 0, scoreSum: 0 };
        }
        b.booklets.forEach(bk => {
          evalMap[facName].allocated += 1;
          if (bk.evaluationStatus === 'Completed') {
            evalMap[facName].corrected += 1;
            evalMap[facName].scoreSum += Number(bk.marksObtained || 0);
          }
        });
      });

      const list: EvaluatorBreakdownItem[] = Object.keys(evalMap).map(facName => {
        const item = evalMap[facName];
        return {
          name: facName,
          allocated: item.allocated,
          corrected: item.corrected,
          scoreAvg: item.corrected > 0 ? Math.round(item.scoreSum / item.corrected) : 0
        };
      });

      result[branchCode] = list;
    });

    return result;
  }, [allBatches, branchStats]);

  const handleOpenDetails = (stat: BranchStat) => {
    setSelectedBranchForDetails(stat);
    setDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="size-6 text-indigo-600" />
            Exam Cell Correction Analysis & Valuation Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Monitor real-time valuation metrics, branch-wise valuation progress, and evaluator completion breakdown.
          </p>
        </div>

        <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200 px-3 py-1 self-start md:self-auto">
          Live Real-Time Metrics
        </Badge>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="ALLOCATED BOOKLETS"
          value={String(allocated)}
          delta="Total Copies"
          icon={FileText}
          tone="primary"
        />
        <KpiCard
          label="PAPERS CORRECTED"
          value={String(corrected)}
          delta="Evaluated"
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard
          label="PENDING CORRECTION"
          value={String(pending)}
          delta="In Progress"
          trend={pending > 0 ? "down" : "up"}
          icon={Clock}
          tone="warning"
        />
        <KpiCard
          label="VALUATION RATE"
          value={`${valuationRate}%`}
          delta="Overall Rate"
          icon={Award}
          tone="purple"
        />
      </div>

      {/* Branch-Wise Progress Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Building2 className="size-4 text-indigo-600" />
            Branch-Wise Evaluation Progress Overview
          </h3>
          <span className="text-xs text-slate-500 font-semibold">6 Academic Branches</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(branchStats).map(b => (
            <Card key={b.code} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 hover:border-indigo-300 transition">
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-50 text-indigo-700 font-extrabold border-indigo-200">
                  {b.code}
                </Badge>
                <span className="text-xs font-mono font-bold text-slate-600">
                  {b.corrected} / {b.allocated} Corrected
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{b.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pending Papers: <span className="font-bold text-slate-800">{b.pending}</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Valuation Progress</span>
                  <span className="text-indigo-700 font-mono">{b.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${b.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDetails(b)}
                  className="h-8 rounded-lg text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1"
                >
                  <Eye className="size-3.5" /> View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* EVALUATOR BREAKDOWN MODAL */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="size-5 text-indigo-600" />
              {selectedBranchForDetails?.name} ({selectedBranchForDetails?.code}) — Evaluator Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs">
              Detailed valuation progress per faculty member assigned in this branch.
            </DialogDescription>
          </DialogHeader>

          {selectedBranchForDetails && (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-xl border text-xs font-semibold">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Allocated</span>
                  <strong className="text-slate-900 text-sm">{selectedBranchForDetails.allocated}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Corrected</span>
                  <strong className="text-emerald-700 text-sm">{selectedBranchForDetails.corrected}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Completion</span>
                  <strong className="text-indigo-700 text-sm">{selectedBranchForDetails.progressPercent}%</strong>
                </div>
              </div>

              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Assigned Faculty Evaluators
              </h5>

              <div className="border rounded-xl divide-y text-xs font-semibold overflow-hidden">
                {(evaluatorBreakdowns[selectedBranchForDetails.code] || []).length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No evaluator assignments recorded for this branch yet.
                  </div>
                ) : (
                  (evaluatorBreakdowns[selectedBranchForDetails.code] || []).map((ev, idx) => (
                    <div key={idx} className="p-3 bg-white flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">{ev.name}</strong>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Progress: {ev.corrected}/{ev.allocated} Copies
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge className="bg-indigo-50 text-indigo-700 font-mono">
                          Avg Score: {ev.scoreAvg} / 100
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setDetailsModalOpen(false)}
              className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              Close Breakdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
