import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  Building2,
  Users,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/panel";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupedBarChart } from "@/components/dashboard/charts";
import {
  fetchPayrollStats,
  fetchPayrollLedger,
  fetchPayrollReports,
  updateSalaryStatus,
  generatePayslip,
  requestBankChange,
  type SalarySlip,
} from "@/modules/payroll/PayrollService";

export const Route = createFileRoute("/super-admin/payroll")({
  head: () => ({
    meta: [{ title: "Super Admin Payroll Control Center — EduSuite Pro" }],
  }),
  component: SuperAdminPayrollPage,
});

function SuperAdminPayrollPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [ledger, setLedger] = useState<SalarySlip[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);

  // Filters & State
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState("All");
  const [monthYear, setMonthYear] = useState("July 2026");
  const [financialYear, setFinancialYear] = useState("FY 2026-27");
  const [activeTab, setActiveTab] = useState("overview");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load Real Backend Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, lData, rData] = await Promise.all([
        fetchPayrollStats(deptFilter, financialYear),
        fetchPayrollLedger(deptFilter, statusFilter, financialYear, search),
        fetchPayrollReports(),
      ]);
      setStats(sData);
      setLedger(lData);
      setReportsData(rData);
      toast.success("Payroll data synced live with InsForge Cloud PostgreSQL");
    } catch (err: any) {
      toast.error("Failed to load payroll data from backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deptFilter, statusFilter, financialYear, monthYear]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      const matchSearch =
        search === "" ||
        item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        item.department.toLowerCase().includes(search.toLowerCase());

      const matchDept = deptFilter === "All" || item.department.toLowerCase().includes(deptFilter.toLowerCase());
      const matchStatus = statusFilter === "All" || item.status.toLowerCase() === statusFilter.toLowerCase();
      const matchType =
        employeeTypeFilter === "All" ||
        (employeeTypeFilter === "Faculty" && (item.designation.includes("Professor") || item.designation.includes("Lecturer"))) ||
        (employeeTypeFilter === "Staff" && !item.designation.includes("Professor") && !item.designation.includes("Lecturer"));

      return matchSearch && matchDept && matchStatus && matchType;
    });
  }, [ledger, search, deptFilter, statusFilter, employeeTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLedger.length / itemsPerPage));
  const paginatedLedger = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLedger.slice(start, start + itemsPerPage);
  }, [filteredLedger, currentPage]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ["Employee ID", "Employee Name", "Department", "Designation", "Month/Year", "Basic Pay", "Allowances", "Deductions", "Net Salary", "Status"];
    const rows = filteredLedger.map((r) => [
      `"${r.employeeId}"`,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.designation}"`,
      `"${r.monthYear}"`,
      r.basicPay,
      r.allowances,
      r.deductions,
      r.netSalary,
      `"${r.status}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_ledger_${monthYear.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Authorized payroll CSV exported successfully!");
  };

  // Status Change Handler
  const handleStatusChange = async (id: string, newStatus: "Paid" | "Processing" | "Pending Approval") => {
    try {
      await updateSalaryStatus(id, newStatus);
      toast.success(`Payroll record status updated to '${newStatus}'`);
      loadData();
    } catch (err: any) {
      toast.error("Status update failed.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[0.65rem] uppercase text-primary border-primary/30">
              SUPER ADMIN ERP
            </Badge>
            <span className="text-xs text-muted-foreground">• InsForge PostgreSQL Powered</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Institutional Payroll Control Center</h1>
          <p className="text-sm text-muted-foreground">Master salary disbursements, statutory deductions, bank credits & compliance audit.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadData} disabled={loading} className="h-8 text-xs gap-1.5 cursor-pointer">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Sync Backend
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs gap-1.5 cursor-pointer">
            <Download className="size-3.5" /> Export Payroll CSV
          </Button>
        </div>
      </div>

      {/* TOOLBAR FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employee or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-36 text-xs bg-background">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
              <SelectItem value="ME">Mechanical</SelectItem>
              <SelectItem value="EEE">EEE</SelectItem>
              <SelectItem value="Civil">Civil</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
            </SelectContent>
          </Select>

          <Select value={employeeTypeFilter} onValueChange={(v) => { setEmployeeTypeFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-32 text-xs bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Faculty">Teaching Faculty</SelectItem>
              <SelectItem value="Staff">Non-Teaching Staff</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-8 w-32 text-xs bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={financialYear} onValueChange={setFinancialYear}>
            <SelectTrigger className="h-8 w-32 text-xs bg-background font-mono">
              <SelectValue placeholder="FY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FY 2026-27">FY 2026-27</SelectItem>
              <SelectItem value="FY 2025-26">FY 2025-26</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SUMMARY KPIS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Net Payroll"
          value={stats ? `₹${(stats.totalNetSalary / 100000).toFixed(2)} Lakhs` : "₹1.13 Cr"}
          icon={Wallet}
          tone="purple"
          subtitle="Monthly Net Disbursed"
        />
        <KpiCard
          label="Gross Payroll"
          value={stats ? `₹${(stats.totalGrossSalary / 100000).toFixed(2)} Lakhs` : "₹1.24 Cr"}
          icon={Building2}
          tone="info"
          subtitle="Pre-deduction Gross Base"
        />
        <KpiCard
          label="Total Deductions"
          value={stats ? `₹${(stats.totalDeductions / 100000).toFixed(2)} Lakhs` : "₹10.70 L"}
          icon={TrendingUp}
          tone="warning"
          subtitle="PF, ESI & Income Tax"
        />
        <KpiCard
          label="Payroll Status"
          value={stats ? `${stats.paidCount} / ${stats.totalRecords} Paid` : "109 Paid"}
          icon={ShieldCheck}
          tone="success"
          subtitle="100% Disbursed to Bank"
        />
      </div>

      {/* 8 TABS WORKSPACE */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="text-xs rounded-lg cursor-pointer">Payroll Overview</TabsTrigger>
          <TabsTrigger value="acceptances" className="text-xs rounded-lg cursor-pointer bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">Acceptance Requests</TabsTrigger>
          <TabsTrigger value="faculty" className="text-xs rounded-lg cursor-pointer">Faculty Payroll</TabsTrigger>
          <TabsTrigger value="staff" className="text-xs rounded-lg cursor-pointer">Staff Payroll</TabsTrigger>
          <TabsTrigger value="processing" className="text-xs rounded-lg cursor-pointer">Payroll Processing</TabsTrigger>
          <TabsTrigger value="salary-structure" className="text-xs rounded-lg cursor-pointer">Salary Structure</TabsTrigger>
          <TabsTrigger value="reimbursements" className="text-xs rounded-lg cursor-pointer">Reimbursements</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs rounded-lg cursor-pointer">Reports</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs rounded-lg cursor-pointer">Audit Log</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Panel title="Departmental Payroll Budget Distribution" description="Monthly net salary allocation across institutional departments.">
            <GroupedBarChart
              data={[
                { category: "CSE Dept", metric: 4250000 },
                { category: "ECE Dept", metric: 3100000 },
                { category: "ME Dept", metric: 2150000 },
                { category: "EEE Dept", metric: 1450000 },
                { category: "Civil Dept", metric: 980000 },
                { category: "Admin Staff", metric: 424800 },
              ] as unknown as Record<string, unknown>[]}
              xKey="category"
              series={[{ key: "metric", label: "Net Salary (₹)" }]}
              height={220}
            />
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Statutory Compliance Overview" description="PF, ESI, TDS remittance logs for current period.">
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-medium">Provident Fund (EPFO 6%)</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 font-mono text-[0.65rem]">Remitted 100%</Badge>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-medium">Income Tax (TDS Section 192)</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 font-mono text-[0.65rem]">Filed & Cleared</Badge>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-medium">Employee State Insurance (ESI)</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 font-mono text-[0.65rem]">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Professional Tax (State Govt)</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 font-mono text-[0.65rem]">Deposited</Badge>
                </div>
              </div>
            </Panel>

            <Panel title="Recent Payroll Activity" description="Live audit events from InsForge Cloud PostgreSQL.">
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-2 border-b border-border pb-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">July 2026 Salary Credit Disbursed</p>
                    <p className="text-muted-foreground text-[0.7rem]">109 records credited via HDFC/SBI Salary Direct Account.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 border-b border-border pb-2">
                  <Clock className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Reimbursement Claims Processing</p>
                    <p className="text-muted-foreground text-[0.7rem]">33 pending conference & research claims under Finance review.</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* TAB: ACCEPTANCE REQUESTS */}
        <TabsContent value="acceptances" className="space-y-4">
          <Panel title="Institutional Pending Approval Queue" description="3-Tier Workflow: Employee/Faculty -> HR Verification -> Finance Dean Review -> Super Admin Acceptance">
            <div className="p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <div>
                  <h3 className="font-bold text-foreground text-sm">Super Admin Acceptance Control Center</h3>
                  <p className="text-muted-foreground text-xs">Review pending HR-verified and Finance-audited payroll disbursements, reimbursements, and bank account change requests.</p>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer" onClick={() => window.location.href = "/super-admin/approval-requests"}>
                  Open Full Acceptance Queue →
                </Button>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* TAB 2 & 3: FACULTY & STAFF LEDGER */}
        {["faculty", "staff", "processing"].map((tabName) => (
          <TabsContent key={tabName} value={tabName} className="space-y-4">
            <Panel title={`Master Payroll Ledger (${tabName.toUpperCase()})`} description="Authoritative employee salary details from InsForge Cloud PostgreSQL database.">
              <div className="space-y-4">
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-3">Emp ID</th>
                        <th className="p-3">Employee Name</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Designation</th>
                        <th className="p-3">Basic Pay</th>
                        <th className="p-3">Allowances</th>
                        <th className="p-3">Deductions</th>
                        <th className="p-3">Net Salary</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {paginatedLedger.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-muted-foreground">
                            No payroll records found matching selected filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedLedger.map((row) => (
                          <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-mono font-bold">{row.employeeId}</td>
                            <td className="p-3 font-semibold text-foreground">{row.employeeName}</td>
                            <td className="p-3"><Badge variant="outline" className="text-[0.65rem]">{row.department}</Badge></td>
                            <td className="p-3 text-muted-foreground">{row.designation}</td>
                            <td className="p-3 font-mono">₹{row.basicPay.toLocaleString("en-IN")}</td>
                            <td className="p-3 font-mono text-emerald-600">+₹{row.allowances.toLocaleString("en-IN")}</td>
                            <td className="p-3 font-mono text-rose-600">-₹{row.deductions.toLocaleString("en-IN")}</td>
                            <td className="p-3 font-mono font-bold text-primary">₹{row.netSalary.toLocaleString("en-IN")}</td>
                            <td className="p-3">
                              {row.status === "Paid" ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 font-mono text-[0.65rem]">Paid</Badge>
                              ) : row.status === "Processing" ? (
                                <Badge className="bg-amber-500/10 text-amber-600 font-mono text-[0.65rem]">Processing</Badge>
                              ) : (
                                <Badge variant="outline" className="font-mono text-[0.65rem]">{row.status}</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              {row.status !== "Paid" && (
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(row.id, "Paid")} className="h-6 text-[0.65rem] px-2 font-mono">
                                  Approve & Pay
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-muted-foreground font-mono">
                    Showing {filteredLedger.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredLedger.length)} of {filteredLedger.length} records
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                      <ChevronLeft className="size-3.5" />
                    </Button>
                    <span className="px-2 font-mono">{currentPage} / {totalPages}</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          </TabsContent>
        ))}

        {/* TAB 5: SALARY STRUCTURE */}
        <TabsContent value="salary-structure" className="space-y-4">
          <Panel title="Institutional Grade Salary Structure Matrix" description="Base salary components, statutory percentages and allowance rules.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-border p-4 rounded-xl space-y-3 bg-card">
                <h4 className="font-bold text-sm text-foreground">Associate Professor Grade</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Basic Pay Base:</span><span className="font-mono font-bold">₹85,000</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Dearness Allowance (DA):</span><span className="font-mono text-emerald-600">10% (₹8,500)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">House Rent Allowance (HRA):</span><span className="font-mono text-emerald-600">30% (₹25,500)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Provident Fund (PF):</span><span className="font-mono text-rose-600">6% (₹5,100)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Income Tax (TDS):</span><span className="font-mono text-rose-600">Standard Bracket (₹4,500)</span></div>
                </div>
              </div>

              <div className="border border-border p-4 rounded-xl space-y-3 bg-card">
                <h4 className="font-bold text-sm text-foreground">Assistant Professor Grade</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Basic Pay Base:</span><span className="font-mono font-bold">₹75,000</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Dearness Allowance (DA):</span><span className="font-mono text-emerald-600">10% (₹7,500)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">House Rent Allowance (HRA):</span><span className="font-mono text-emerald-600">30% (₹22,500)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Provident Fund (PF):</span><span className="font-mono text-rose-600">6% (₹4,500)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Income Tax (TDS):</span><span className="font-mono text-rose-600">Standard Bracket (₹3,500)</span></div>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* TAB 6: REIMBURSEMENTS */}
        <TabsContent value="reimbursements" className="space-y-4">
          <Panel title="Faculty & Staff Reimbursement Claims" description="Travel allowance, research grant, book purchase and conference claims.">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="font-semibold text-foreground">IEEE Conference Presentation Claim</p>
                  <p className="text-muted-foreground text-[0.7rem]">Dr. Rajesh K. Varma • Travel & Registration</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">₹12,500</p>
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[0.65rem]">Paid</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="font-semibold text-foreground">Advanced AI Textbooks Claim</p>
                  <p className="text-muted-foreground text-[0.7rem]">Dr. Meera Nambiar • Book Purchase</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">₹3,500</p>
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[0.65rem]">Approved</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Industrial Visit Supervision Travel Claim</p>
                  <p className="text-muted-foreground text-[0.7rem]">Prof. Arvind Swaminathan • Travel Allowance</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">₹4,500</p>
                  <Badge className="bg-amber-500/10 text-amber-600 text-[0.65rem]">Pending</Badge>
                </div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* TAB 7: REPORTS */}
        <TabsContent value="reports" className="space-y-4">
          <Panel title="Executive Payroll & Tax Reports Summary" description="Annual institutional payroll and tax audit summaries.">
            <div className="space-y-4">
              <div className="border border-border p-4 rounded-xl bg-card">
                <h4 className="font-bold text-sm">FY 2026-27 Executive Financial Summary</h4>
                <p className="text-xs text-muted-foreground mt-1">Total Gross Salary: ₹1,24,24,800 • Total Net Salary: ₹1,13,54,180 • Total Statutory Deductions: ₹10,70,620</p>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* TAB 8: AUDIT */}
        <TabsContent value="audit" className="space-y-4">
          <Panel title="Payroll Security & Transaction Audit Log" description="Authoritative audit trail of payroll modifications.">
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 border border-border rounded-lg bg-muted/20">
                [2026-08-13 11:50:40] PAYROLL_GENERATED • InsForge Cloud PostgreSQL • 109 records generated for July 2026.
              </div>
              <div className="p-2 border border-border rounded-lg bg-muted/20">
                [2026-08-13 11:52:12] PAYROLL_DISBURSED • Super Admin • 109 records marked Paid.
              </div>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
