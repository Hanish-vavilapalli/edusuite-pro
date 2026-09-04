import React, { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  Download,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CreditCard,
  Building2,
  AlertCircle,
  Plus,
  FileText,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Percent,
  Calendar,
  AlertTriangle,
  Send,
  Lock,
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
  fetchPayrollLedger,
  generatePayslip,
  updateSalaryStatus,
  requestBankChange,
  type SalarySlip,
  type ReimbursementRecord,
  type BankDetails,
  type PayrollInsightsData,
} from "./PayrollService";

// Helper function for CSS classes conditionally
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* SUB-COMPONENTS */

export function PayrollHeader({ department }: { department: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
        <Wallet className="size-6 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
            Payroll & Payslips Dashboard
          </h1>
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
            Department Scope: {department}
          </Badge>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Review monthly disbursements, allowances breakdown, tax deductions, and download signed payslips.
        </p>
      </div>
    </div>
  );
}

export function PayrollToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  financialYear,
  setFinancialYear,
  onRefresh,
  onExport,
  loading,
}: {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  financialYear: string;
  setFinancialYear: (val: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto mt-4 xl:mt-0">
      <div className="relative flex-1 sm:flex-initial sm:w-44">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search Payroll ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-xs rounded-xl"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-9 w-full sm:w-[130px] text-xs bg-card border-border">
          <Filter className="size-3.5 mr-1 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {["All Status", "Paid", "Processing", "Pending Approval"].map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={financialYear} onValueChange={setFinancialYear}>
        <SelectTrigger className="h-9 w-full sm:w-[130px] text-xs bg-card border-border font-mono">
          <SelectValue placeholder="FY Year" />
        </SelectTrigger>
        <SelectContent>
          {["FY 2026-27", "FY 2025-26"].map((y) => (
            <SelectItem key={y} value={y} className="text-xs">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className="h-9 gap-1.5 text-xs font-semibold border-border hover:bg-accent cursor-pointer"
      >
        <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        Refresh
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        className="h-9 gap-1.5 text-xs font-semibold border-border hover:bg-accent cursor-pointer"
      >
        <Download className="size-3.5" /> Export
      </Button>
    </div>
  );
}

export function PayrollSummaryCards({ activeSlip }: { activeSlip: SalarySlip | null }) {
  if (!activeSlip) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
      {[
        { label: "Gross Salary", val: `₹${activeSlip.basicPay + activeSlip.hra + activeSlip.allowances}`, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
        { label: "Net Salary", val: `₹${activeSlip.netSalary}`, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" },
        { label: "Total Deductions", val: `₹${activeSlip.deductions}`, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
        { label: "Pending Claims", val: `₹${activeSlip.insights.pendingReimbursementAmount}`, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
        { label: "Disbursement Status", val: activeSlip.status, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
      ].map((card, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-sm space-y-1 hover:border-primary/30 transition-colors duration-300"
        >
          <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
          <p className="font-display text-lg font-bold text-foreground mt-1">{card.val}</p>
        </div>
      ))}
    </div>
  );
}

export function NetSalaryCard({ activeSlip, onDownload }: { activeSlip: SalarySlip | null; onDownload: () => void }) {
  if (!activeSlip) return null;

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-sm space-y-4 hover:border-primary/45 transition-colors relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute right-0 bottom-0 size-32 bg-primary/5 rounded-full translate-x-12 translate-y-12 pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-primary/10 pb-3.5">
        <div>
          <span className="text-[0.68rem] text-primary/70 uppercase tracking-widest font-semibold block">Salary Period</span>
          <span className="font-display text-base font-extrabold text-foreground">{activeSlip.monthYear}</span>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          Credited Status: {activeSlip.status}
        </Badge>
      </div>

      <div className="space-y-1 pt-1">
        <span className="text-[0.68rem] text-muted-foreground uppercase tracking-wider block">Net Credited Amount</span>
        <p className="font-display text-3xl font-extrabold text-primary">₹{activeSlip.netSalary.toLocaleString("en-IN")}</p>
        <p className="text-[0.68rem] text-muted-foreground font-mono">Credit Date: {activeSlip.paymentDate || "Pending"}</p>
      </div>

      <div className="pt-2 flex flex-wrap gap-2">
        <Button
          onClick={onDownload}
          className="bg-brand-gradient text-white text-xs font-semibold shadow-glow rounded-xl hover:opacity-95 cursor-pointer h-9 px-4 flex items-center gap-1.5"
        >
          <Download className="size-3.5" /> Download Payslip PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs rounded-xl h-9 border-border bg-card hover:bg-accent"
        >
          View Tax Form-16
        </Button>
      </div>
    </div>
  );
}

export function SalaryBreakdown({ activeSlip }: { activeSlip: SalarySlip | null }) {
  if (!activeSlip) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Earnings Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-emerald-500" /> Gross Earnings Breakdown
        </h3>
        <div className="space-y-2.5 text-xs font-semibold">
          {[
            { label: "Basic Pay", val: activeSlip.earnings.basicPay },
            { label: "Dearness Allowance (DA)", val: activeSlip.earnings.da },
            { label: "House Rent Allowance (HRA)", val: activeSlip.earnings.hra },
            { label: "Medical Allowance", val: activeSlip.earnings.medical },
            { label: "Academic Allowance", val: activeSlip.earnings.academic },
            { label: "Research Incentive Allowance", val: activeSlip.earnings.research },
            { label: "Transport Allowance", val: activeSlip.earnings.transport },
            { label: "Other Allowances", val: activeSlip.earnings.other },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-0.5 border-b border-border/20">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono text-foreground">₹{item.val.toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2.5 text-sm font-extrabold text-primary border-t border-border/60">
            <span>Total Earnings</span>
            <span className="font-mono">₹{activeSlip.earnings.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Deductions Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
          <AlertTriangle className="size-4 text-rose-500" /> Deductions Breakdown
        </h3>
        <div className="space-y-3.5 text-xs">
          {[
            { label: "Provident Fund (PF)", val: activeSlip.deductionsList.pf, totalLimit: 6000, color: "bg-blue-500" },
            { label: "Professional Tax", val: activeSlip.deductionsList.profTax, totalLimit: 500, color: "bg-amber-500" },
            { label: "TDS / Income Tax", val: activeSlip.deductionsList.incomeTax, totalLimit: 10000, color: "bg-rose-500" },
            { label: "ESI Deduction", val: activeSlip.deductionsList.esi, totalLimit: 1000, color: "bg-emerald-500" },
            { label: "Late Roster Penalty", val: activeSlip.deductionsList.lateAttendance, totalLimit: 1000, color: "bg-violet-500" },
            { label: "Loss of Pay Leaves", val: activeSlip.deductionsList.leaveDeduction, totalLimit: 5000, color: "bg-orange-500" },
            { label: "Group Insurance Deductible", val: activeSlip.deductionsList.insurance, totalLimit: 2000, color: "bg-teal-500" },
          ].map((item, idx) => {
            const ratio = Math.min(100, Math.round((item.val / item.totalLimit) * 100));
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono text-foreground">₹{item.val.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", item.color)} style={{ width: `${ratio}%` }} />
                </div>
              </div>
            );
          })}
          <div className="flex justify-between items-center pt-2.5 text-sm font-extrabold text-rose-600 border-t border-border/60">
            <span>Total Deductions</span>
            <span className="font-mono">₹{activeSlip.deductionsList.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttendanceImpact({ activeSlip }: { activeSlip: SalarySlip | null }) {
  if (!activeSlip) return null;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3">
        Attendance & ERP Contribution Impact
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Working Days", value: activeSlip.attendanceImpact.workingDays, desc: "Days in Period" },
          { label: "Present Attendance", value: activeSlip.attendanceImpact.presentDays, desc: "Physically Present" },
          { label: "Approved Leaves", value: activeSlip.attendanceImpact.approvedLeave, desc: "Within Quota limits" },
          { label: "Loss of Pay Days", value: activeSlip.attendanceImpact.lopDays, desc: "Salary Deductible" },
          { label: "Late Logins", value: activeSlip.attendanceImpact.lateEntries, desc: "Late penalties applied" },
          { label: "Extra Classes Taken", value: activeSlip.attendanceImpact.extraClasses, desc: "Teaching incentives" },
          { label: "Exam Invigilation", value: `${activeSlip.attendanceImpact.invigilationHours} Hrs`, desc: "Incentive hours log" },
          { label: "Financial Impact", value: `₹${activeSlip.attendanceImpact.attendanceContribution}`, desc: "Extra earnings / loss", highlight: true },
        ].map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl border border-border/60 bg-muted/10">
            <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider block font-semibold">{item.label}</span>
            <p className={cn("font-display text-lg font-bold mt-1", item.highlight && (activeSlip.attendanceImpact.attendanceContribution >= 0 ? "text-emerald-600" : "text-rose-600"))}>
              {item.value}
            </p>
            <span className="text-[0.6rem] text-muted-foreground block mt-0.5">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaveDeductionCard({ activeSlip }: { activeSlip: SalarySlip | null }) {
  if (!activeSlip || activeSlip.leaveDeductions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3">
        Leave Deduction Statement
      </h3>
      <div className="space-y-3">
        {activeSlip.leaveDeductions.map((ded, i) => (
          <div key={i} className="p-3.5 rounded-xl border border-border/60 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-foreground">{ded.leaveType} Absence Summary</p>
              <p className="text-muted-foreground text-[0.68rem]">Approved Days: {ded.approvedDays} &middot; LOP Days: {ded.lopDays}</p>
              <p className="text-primary text-[0.68rem] italic mt-0.5">"{ded.explanation}"</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[0.65rem] text-muted-foreground block uppercase font-semibold">Absence Deduction</span>
              <span className="font-mono text-sm font-extrabold text-rose-600">₹{ded.deductionAmount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalaryTrendChart() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3">
        Salary Disbursement Trend (Last 5 Months)
      </h3>
      <div className="h-44 border border-border/40 bg-muted/10 rounded-xl p-3.5 flex items-end justify-between gap-1.5 relative">
        {/* Gridlines */}
        <div className="absolute inset-x-0 top-1/4 border-t border-border/20" />
        <div className="absolute inset-x-0 top-2/4 border-t border-border/20" />
        <div className="absolute inset-x-0 top-3/4 border-t border-border/20" />

        {[
          { label: "March", value: 99800 },
          { label: "April", value: 99800 },
          { label: "May", value: 100400 },
          { label: "June", value: 99800 },
          { label: "July", value: 101580 },
        ].map((item, idx) => {
          const heightPct = Math.round(((item.value - 90000) / 15000) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
              <div className="w-10 bg-brand-gradient text-[0.6rem] font-bold text-white text-center rounded-t-md hover:opacity-90 transition-all cursor-pointer relative group flex justify-center items-start pt-1.5" style={{ height: `${Math.max(25, heightPct)}%` }}>
                <span className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-foreground text-background px-1.5 py-0.5 rounded text-[0.6rem] font-mono transition-opacity pointer-events-none whitespace-nowrap">
                  ₹{item.value.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="text-[0.68rem] font-semibold text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TaxBreakdownChart() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3">
        Tax & Statutory Contribution Breakdown
      </h3>
      <div className="h-44 border border-border/40 bg-muted/10 rounded-xl p-3.5 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-4">
          {/* Custom Circular Donut SVG */}
          <div className="size-20 relative shrink-0">
            <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Income Tax 45% */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f43f5e" strokeWidth="4.5" strokeDasharray="45 100" strokeDashoffset="0" />
              {/* Provident Fund 40% */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="40 100" strokeDashoffset="-45" />
              {/* ESI 10% */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="10 100" strokeDashoffset="-85" />
              {/* Professional Tax 5% */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="5 100" strokeDashoffset="-95" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-[0.65rem] text-foreground font-mono">
              ₹9.7k PM
            </div>
          </div>

          {/* Legend */}
          <div className="text-[0.68rem] space-y-1">
            <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-rose-500 shrink-0" /> Income Tax (TDS): 45%</div>
            <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-500 shrink-0" /> Provident Fund: 40%</div>
            <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500 shrink-0" /> ESI contribution: 10%</div>
            <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-yellow-500 shrink-0" /> Professional Tax: 5%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReimbursementCards({ reimbursements }: { reimbursements: ReimbursementRecord[] }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3">
        Active Reimbursement & Travel Claims
      </h3>
      {reimbursements.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No active reimbursement claims found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reimbursements.map((reim) => (
            <div key={reim.id} className="p-3.5 rounded-xl border border-border/60 bg-muted/10 space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="truncate">{reim.category}</span>
                <Badge
                  className={cn(
                    reim.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.6rem]" :
                    reim.status === "Approved" ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[0.6rem]" :
                    reim.status === "Rejected" ? "bg-red-500/10 text-red-600 border-red-500/20 text-[0.6rem]" :
                    "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.6rem]"
                  )}
                >
                  {reim.status}
                </Badge>
              </div>
              <p className="font-mono font-extrabold text-foreground text-sm">₹{reim.amount.toLocaleString("en-IN")}</p>
              <p className="text-[0.68rem] text-muted-foreground font-mono">Claim ID: {reim.id} &middot; {reim.claimDate}</p>
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/30 mt-1 justify-end">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[0.65rem] hover:bg-muted font-bold text-primary">
                  Details
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-1.5 hover:bg-muted font-bold">
                  <Download className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BankDetailsCard({ bank, onRequestChange }: { bank: BankDetails; onRequestChange: () => void }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
        <Building2 className="size-4 text-primary" /> Credited Bank Account Info
      </h3>
      <div className="grid grid-cols-2 gap-3.5 text-xs">
        <div>
          <span className="text-[0.68rem] text-muted-foreground block font-semibold uppercase">Creditor Bank</span>
          <span className="font-bold text-foreground">{bank.bankName}</span>
        </div>
        <div>
          <span className="text-[0.68rem] text-muted-foreground block font-semibold uppercase">Account Number</span>
          <span className="font-bold text-foreground font-mono">{bank.accountNumber}</span>
        </div>
        <div>
          <span className="text-[0.68rem] text-muted-foreground block font-semibold uppercase">Branch Code & IFSC</span>
          <span className="font-bold text-foreground font-mono">{bank.ifscCode}</span>
        </div>
        <div>
          <span className="text-[0.68rem] text-muted-foreground block font-semibold uppercase">Nominee Beneficiary</span>
          <span className="font-bold text-foreground">{bank.nomineeName}</span>
        </div>
      </div>
      <div className="pt-2 flex items-center justify-between border-t border-border/40">
        <span className="text-[0.68rem] text-emerald-600 font-semibold flex items-center gap-1">
          <CheckCircle2 className="size-3.5" /> Salary Credit Active
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestChange}
          className="text-[0.68rem] font-bold rounded-xl h-8 border-border bg-card hover:bg-accent cursor-pointer"
        >
          Request Bank Change
        </Button>
      </div>
    </div>
  );
}

export function PayslipTimeline({ slips, onView, onDownload }: { slips: SalarySlip[]; onView: (slip: SalarySlip) => void; onDownload: () => void }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3 flex items-center gap-1.5">
        <Calendar className="size-4 text-primary shrink-0" /> Payslips Timeline
      </h3>

      <div className="relative pl-5 border-l-2 border-border/60 ml-2.5 space-y-4 py-1">
        {slips.map((slip) => (
          <div key={slip.id} className="relative group">
            {/* Timeline node */}
            <span className="absolute -left-[27px] top-1.5 rounded-full border-2 border-primary bg-card size-3.5 z-10 flex items-center justify-center">
              <span className="size-1.5 rounded-full bg-primary" />
            </span>

            <div className="p-3 rounded-xl border border-border/60 hover:border-primary/30 bg-muted/10 space-y-1.5 transition-all duration-300">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground text-sm">{slip.monthYear}</span>
                <Badge
                  className={cn(
                    slip.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.6rem]" :
                    "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.6rem]"
                  )}
                >
                  {slip.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-mono font-extrabold text-foreground text-sm">₹{slip.netSalary.toLocaleString("en-IN")}</p>
                  <p className="text-[0.62rem] text-muted-foreground font-mono">Credit: {slip.paymentDate || "Pending"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(slip)}
                    className="h-7 text-[0.65rem] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDownload}
                    className="h-7 size-7 rounded-lg text-primary hover:text-primary/80 cursor-pointer"
                  >
                    <Download className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PayrollHistoryTable({
  slips,
  onView,
  onDownload,
}: {
  slips: SalarySlip[];
  onView: (slip: SalarySlip) => void;
  onDownload: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
        <FileText className="size-4 text-primary" /> Historic Payroll Ledgers
      </h3>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        {/* Desktop view */}
        <table className="w-full text-left text-xs hidden md:table">
          <thead className="bg-muted/40 text-muted-foreground font-mono text-[0.68rem] uppercase border-b border-border/60">
            <tr>
              <th className="py-3 px-3.5">Payroll ID</th>
              <th className="py-3 px-3.5">Salary Month</th>
              <th className="py-3 px-3.5">Gross Pay</th>
              <th className="py-3 px-3.5">Deductions</th>
              <th className="py-3 px-3.5">Net Credit</th>
              <th className="py-3 px-3.5">Credit Date</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {slips.map((s) => (
              <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-3.5 font-mono font-bold text-foreground">{s.id}</td>
                <td className="py-3 px-3.5 font-semibold text-foreground">{s.monthYear}</td>
                <td className="py-3 px-3.5 font-mono text-muted-foreground">₹{s.basicPay + s.hra + s.allowances}</td>
                <td className="py-3 px-3.5 font-mono text-rose-500">₹{s.deductions}</td>
                <td className="py-3 px-3.5 font-bold font-mono text-primary">₹{s.netSalary}</td>
                <td className="py-3 px-3.5 text-muted-foreground font-mono">{s.paymentDate || "Pending"}</td>
                <td className="py-3 px-3.5">
                  <Badge
                    className={cn(
                      s.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.65rem]" :
                      "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.65rem]"
                    )}
                  >
                    {s.status}
                  </Badge>
                </td>
                <td className="py-3 px-3.5 text-right pr-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(s)}
                      className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      title="View Payslip"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onDownload}
                      className="size-7 rounded-lg text-muted-foreground hover:text-primary cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards fallback */}
        <div className="block md:hidden divide-y divide-border/60">
          {slips.map((s) => (
            <div key={s.id} className="p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-foreground">{s.id}</span>
                <Badge
                  className={cn(
                    s.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}
                >
                  {s.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{s.monthYear} Period</p>
                <p className="text-[0.68rem] text-muted-foreground font-mono">
                  Net Salary: <span className="font-bold text-primary">₹{s.netSalary}</span> (Deducted: ₹{s.deductions})
                </p>
                <p className="text-[0.68rem] text-muted-foreground font-mono">Credit Date: {s.paymentDate || "Pending"}</p>
              </div>
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/30 mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(s)}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Eye className="size-3.5 mr-1" /> View Payslip
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                  className="h-7 text-xs text-primary"
                >
                  <Download className="size-3.5 mr-1" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PayrollInsights({ insights }: { insights: PayrollInsightsData | null }) {
  if (!insights) return null;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3 flex items-center gap-1.5">
        <TrendingUp className="size-4 text-primary shrink-0" /> Salary & Tax Insights
      </h3>

      <div className="space-y-3">
        {[
          { text: "Base slab grade updated this cycle", active: insights.salaryIncreased, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
          { text: "Research grant incentives credited", active: insights.researchIncentiveAdded, icon: Award, color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
          { text: `Pending reimbursement claim: ₹${insights.pendingReimbursementAmount}`, active: insights.pendingReimbursementAmount > 0, icon: Clock, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
          { text: `Upcoming payment: ${insights.upcomingSalaryDate}`, active: true, icon: Calendar, color: "text-primary bg-primary/10 border-primary/20" },
          { text: `Highest deduction source: ${insights.highestDeductionName}`, active: true, icon: AlertTriangle, color: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
        ].filter(i => i.active).map((ins, idx) => {
          const Icon = ins.icon;
          return (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-border/40 bg-muted/10">
              <span className={cn("p-1.5 rounded-lg shrink-0", ins.color)}>
                <Icon className="size-4" />
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5">{ins.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuickActions({ onDownload, onExport }: { onDownload: () => void; onExport: () => void }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm md:text-base text-foreground border-b border-border/60 pb-3">
        Payroll Operations
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Download Latest Payslip", desc: "PDF signed document", icon: Download, onClick: onDownload, color: "text-blue-500 bg-blue-500/10" },
          { label: "Export Ledgers CSV", desc: "Payroll ledger spreadsheet", icon: FileText, onClick: onExport, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Tax Declaration", desc: "Submit investment plans", icon: ShieldCheck, color: "text-violet-500 bg-violet-500/10" },
          { label: "Salary Certificate", desc: "Generate credit letter", icon: Award, color: "text-amber-500 bg-amber-500/10" },
        ].map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={act.onClick}
              className="p-3.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/10 text-left transition-all duration-300 space-y-1 hover:shadow-sm"
            >
              <span className={cn("p-1.5 rounded-lg shrink-0 block w-fit", act.color)}>
                <Icon className="size-4" />
              </span>
              <p className="text-xs font-bold text-foreground mt-2 line-clamp-1">{act.label}</p>
              <p className="text-[0.65rem] text-muted-foreground line-clamp-1">{act.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* MAIN PAYROLL VIEW */

export function PayrollModuleView() {
  const { profile } = useRole();
  const department = profile?.department || "CSE";

  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [financialYear, setFinancialYear] = useState("FY 2026-27");

  // Bank request dialog state
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isSubmittingBankChange, setIsSubmittingBankChange] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    nomineeName: "",
  });

  // View slip detail modal state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSlipDetail, setSelectedSlipDetail] = useState<SalarySlip | null>(null);

  const [approvalProgress, setApprovalProgress] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPayroll();
      if (data && data.payrollHistory && data.payrollHistory.length > 0) {
        setSlips(data.payrollHistory);
        setApprovalProgress(data.approvalProgress);
      } else {
        const ledger = await fetchPayrollLedger(department);
        setSlips(ledger);
      }
    } catch (err) {
      try {
        const ledger = await fetchPayrollLedger(department);
        setSlips(ledger);
      } catch (e) {
        setError("Failed to synchronize payroll disbursement ledgers.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [department]);

  // Client filtering
  const filteredSlips = useMemo(() => {
    return slips.filter((s) => {
      const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) || s.monthYear.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || s.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [slips, search, statusFilter]);

  // Primary active slip (usually most recent credited slip)
  const activeSlip = useMemo(() => {
    return filteredSlips[0] || null;
  }, [filteredSlips]);

  // Download payslip trigger
  const handleDownloadLatestPayslip = () => {
    toast.success(`Payslip PDF for ${activeSlip?.monthYear || "Period"} generated & downloaded successfully.`);
  };

  // Submit bank change request
  const handleBankChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName.trim() || !bankForm.accountNumber.trim()) {
      toast.error("Please fill required bank change parameters.");
      return;
    }

    setIsSubmittingBankChange(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await requestBankChange(bankForm);
      toast.success("Bank credit account modification request submitted to HRMS Dean office.");
      setIsBankDialogOpen(false);
      setBankForm({ bankName: "", accountNumber: "", ifscCode: "", branch: "", nomineeName: "" });
    } catch (err) {
      toast.error("Failed to request bank details change.");
    } finally {
      setIsSubmittingBankChange(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-up">
      {/* Header & Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border pb-5">
        <PayrollHeader department={department} />
        <PayrollToolbar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          financialYear={financialYear}
          setFinancialYear={setFinancialYear}
          onRefresh={loadData}
          onExport={handleDownloadLatestPayslip}
          loading={loading}
        />
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/60 animate-pulse rounded-2xl border border-border/80" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-[200px] bg-muted/60 animate-pulse rounded-2xl border border-border/80" />
              <div className="h-[300px] bg-muted/60 animate-pulse rounded-2xl border border-border/80" />
            </div>
            <div className="space-y-6">
              <div className="h-[250px] bg-muted/60 animate-pulse rounded-2xl border border-border/80" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadData} className="ml-auto text-xs border-destructive/20 hover:bg-destructive/10">
            Try Again
          </Button>
        </div>
      ) : filteredSlips.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-xl space-y-2.5">
          <Wallet className="size-8 text-muted-foreground mx-auto" />
          <p className="text-xs font-bold">No payroll records available.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <PayrollSummaryCards activeSlip={activeSlip} />

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left side (2/3 width on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              {approvalProgress && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-display uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-primary" /> 3-Tier Institutional Governance Workflow
                    </h4>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                      Status: {approvalProgress.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {[
                      { name: "Generated", done: true, by: "HR System" },
                      { name: "HR Verify", done: ["HR_VERIFIED", "FINANCE_REVIEWED", "SUPER_ADMIN_ACCEPTED", "Paid", "Processing"].includes(approvalProgress.status), by: approvalProgress.hrVerifiedBy || "HR Director" },
                      { name: "Finance Audit", done: ["FINANCE_REVIEWED", "SUPER_ADMIN_ACCEPTED", "Paid", "Processing"].includes(approvalProgress.status), by: approvalProgress.financeReviewedBy || "Finance Dean" },
                      { name: "Super Admin", done: ["SUPER_ADMIN_ACCEPTED", "Paid", "Processing"].includes(approvalProgress.status), by: approvalProgress.superAdminDecisionBy || "Super Admin" },
                      { name: "Disbursed", done: approvalProgress.status === "Paid", by: "Bank Credit" },
                    ].map((s, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center space-y-1">
                        <div className={cn(
                          "size-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                          s.done ? "bg-emerald-500 text-white border-emerald-600" : "bg-muted text-muted-foreground border-border"
                        )}>
                          {s.done ? <CheckCircle2 className="size-4" /> : idx + 1}
                        </div>
                        <span className="text-[11px] font-semibold text-foreground leading-tight">{s.name}</span>
                        <span className="text-[9px] text-muted-foreground truncate w-full">{s.by ? s.by.split(" ")[0] : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <NetSalaryCard activeSlip={activeSlip} onDownload={handleDownloadLatestPayslip} />
              <SalaryBreakdown activeSlip={activeSlip} />
              <AttendanceImpact activeSlip={activeSlip} />
              <LeaveDeductionCard activeSlip={activeSlip} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SalaryTrendChart />
                <TaxBreakdownChart />
              </div>

              {activeSlip && <ReimbursementCards reimbursements={activeSlip.reimbursements} />}
              <QuickActions onDownload={handleDownloadLatestPayslip} onExport={handleDownloadLatestPayslip} />
              
              <PayrollHistoryTable
                slips={filteredSlips}
                onView={(s) => {
                  setSelectedSlipDetail(s);
                  setIsViewDialogOpen(true);
                }}
                onDownload={handleDownloadLatestPayslip}
              />
            </div>

            {/* Right side (1/3 width on desktop) */}
            <div className="space-y-6">
              {activeSlip && (
                <BankDetailsCard bank={activeSlip.bankDetails} onRequestChange={() => setIsBankDialogOpen(true)} />
              )}
              <PayslipTimeline
                slips={filteredSlips}
                onView={(s) => {
                  setSelectedSlipDetail(s);
                  setIsViewDialogOpen(true);
                }}
                onDownload={handleDownloadLatestPayslip}
              />
              <PayrollInsights insights={activeSlip ? activeSlip.insights : null} />
            </div>
          </div>
        </>
      )}

      {/* BANK CHANGE REQUEST DIALOG */}
      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary shrink-0" /> Request Salary Account Change
            </DialogTitle>
            <DialogDescription>Submit alternate banking parameters below for HRMS review.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBankChangeSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Bank Institution Name</Label>
              <Input
                required
                placeholder="e.g. ICICI Bank Ltd"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Account Number</Label>
              <Input
                required
                placeholder="e.g. 50200011223344"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">IFSC Branch Code</Label>
                <Input
                  required
                  placeholder="e.g. ICIC0000021"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Branch Location</Label>
                <Input
                  placeholder="e.g. Madhapur, Hyd"
                  value={bankForm.branch}
                  onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nominee Beneficiary Name</Label>
              <Input
                placeholder="e.g. Nominee Full Name"
                value={bankForm.nomineeName}
                onChange={(e) => setBankForm({ ...bankForm, nomineeName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 p-2.5 bg-yellow-500/5 text-yellow-600 rounded-xl border border-yellow-500/10 text-[0.68rem] font-semibold leading-relaxed">
              <Lock className="size-4 shrink-0" />
              <span>Verifying authorization details. Requests undergo secondary approval cycle.</span>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsBankDialogOpen(false)} className="rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingBankChange}
                className="bg-brand-gradient text-white text-xs font-bold shadow-glow rounded-xl hover:opacity-95 cursor-pointer h-9 px-4 flex items-center gap-1.5"
              >
                {isSubmittingBankChange ? "Submitting..." : "Submit Bank Modification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW SLIP DETAILS MODAL */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-4 text-primary shrink-0" /> Payslip Ledger &mdash; {selectedSlipDetail?.monthYear}
            </DialogTitle>
            <DialogDescription>Disbursement ID: {selectedSlipDetail?.id}</DialogDescription>
          </DialogHeader>

          {selectedSlipDetail && (
            <div className="space-y-4 text-xs pt-1.5 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl font-mono text-[0.68rem]">
                <div>
                  <span className="text-muted-foreground block">Employee Name</span>
                  <span className="font-bold text-foreground">{selectedSlipDetail.employeeName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Employee ID & Dept</span>
                  <span className="font-bold text-foreground">{selectedSlipDetail.employeeId} &middot; {selectedSlipDetail.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Designation</span>
                  <span className="font-bold text-foreground">{selectedSlipDetail.designation}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Bank Account</span>
                  <span className="font-bold text-foreground">{selectedSlipDetail.bankAccount}</span>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Disbursement Allowances (Earnings)</span>
                <div className="p-3 border border-border/60 rounded-xl space-y-1.5 bg-card font-mono text-[0.68rem]">
                  <div className="flex justify-between"><span>Basic Salary Code</span><span className="font-bold text-foreground">₹{selectedSlipDetail.earnings.basicPay}</span></div>
                  <div className="flex justify-between"><span>Dearness Allowance</span><span className="font-bold text-foreground">₹{selectedSlipDetail.earnings.da}</span></div>
                  <div className="flex justify-between"><span>HRA Allowance</span><span className="font-bold text-foreground">₹{selectedSlipDetail.earnings.hra}</span></div>
                  <div className="flex justify-between"><span>Medical & Travel</span><span className="font-bold text-foreground">₹{selectedSlipDetail.earnings.medical + selectedSlipDetail.earnings.transport}</span></div>
                  <div className="flex justify-between"><span>Academic Incentives</span><span className="font-bold text-foreground">₹{selectedSlipDetail.earnings.academic + selectedSlipDetail.earnings.research}</span></div>
                  <div className="flex justify-between border-t border-border/40 pt-1 text-primary font-bold"><span>Total Gross Pay</span><span>₹{selectedSlipDetail.earnings.total}</span></div>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Statutory Deductions</span>
                <div className="p-3 border border-border/60 rounded-xl space-y-1.5 bg-card font-mono text-[0.68rem]">
                  <div className="flex justify-between"><span>Provident Fund (PF)</span><span className="font-bold text-foreground">₹{selectedSlipDetail.deductionsList.pf}</span></div>
                  <div className="flex justify-between"><span>Income Tax (TDS)</span><span className="font-bold text-foreground">₹{selectedSlipDetail.deductionsList.incomeTax}</span></div>
                  <div className="flex justify-between"><span>ESI Contribution</span><span className="font-bold text-foreground">₹{selectedSlipDetail.deductionsList.esi}</span></div>
                  <div className="flex justify-between"><span>Late Login Penalty</span><span className="font-bold text-foreground">₹{selectedSlipDetail.deductionsList.lateAttendance}</span></div>
                  <div className="flex justify-between border-t border-border/40 pt-1 text-rose-600 font-bold"><span>Total Deductions</span><span>₹{selectedSlipDetail.deductionsList.total}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[0.68rem] font-semibold uppercase">Net Credited</span>
                  <span className="font-mono text-base font-extrabold text-primary">₹{selectedSlipDetail.netSalary}</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600">
                  Status: {selectedSlipDetail.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsViewDialogOpen(false)} className="rounded-xl cursor-pointer bg-brand-gradient text-white text-xs font-semibold px-4 py-2">
              Close Window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
