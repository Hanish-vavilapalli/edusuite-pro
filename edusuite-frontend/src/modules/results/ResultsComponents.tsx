import React, { useEffect, useState } from "react";
import {
  Award,
  Plus,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  GraduationCap,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useRole } from "@/context/role-context";
import {
  fetchInstitutionalResults,
  fetchDepartmentToppers,
  fetchStudentTranscript,
  fetchAllResultsForExport,
  uploadBatchResults,
  type StudentResultEntry,
  type ResultsStats,
} from "./ResultsService";

export function ResultsModuleView() {
  const { role, flags, department: userDept, profile } = useRole();
  const isHod = role === "hod" || flags?.includes("isHod");
  const hodDept = userDept || (profile?.department as string) || "CSE";

  const [results, setResults] = useState<StudentResultEntry[]>([]);
  const [toppers, setToppers] = useState<StudentResultEntry[]>([]);
  const [stats, setStats] = useState<ResultsStats>({
    passRate: 96.8,
    distinctionHolders: 0,
    avgCgpa: 8.5,
    totalTranscripts: 0,
    examinationPeriod: "Spring 2026 Examination",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 25,
    totalPages: 1,
  });

  const [activeTab, setActiveTab] = useState<"results" | "toppers">("results");
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [toppersLoading, setToppersLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResultEntry | null>(null);

  const [form, setForm] = useState<Partial<StudentResultEntry>>({
    rollNo: "",
    studentName: "",
    department: hodDept,
    semester: "Semester 6",
    sgpa: 8.90,
    cgpa: 8.85,
  });

  const loadResultsData = async (page = 1, searchQuery = search, sem = semesterFilter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchInstitutionalResults({
        page,
        pageSize: 25,
        search: searchQuery,
        semester: sem,
        department: isHod ? hodDept : undefined,
      });
      setResults(response.data);
      setPagination(response.pagination);
      setStats(response.stats);
    } catch (err: any) {
      console.error("Results fetch error:", err);
      setError("Unable to load semester examination results.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadToppersData = async () => {
    setToppersLoading(true);
    try {
      const data = await fetchDepartmentToppers(isHod ? hodDept : undefined);
      setToppers(data);
    } catch (err) {
      console.error("Toppers fetch error:", err);
      setToppers([]);
    } finally {
      setToppersLoading(false);
    }
  };

  useEffect(() => {
    loadResultsData(1, search, semesterFilter);
  }, [semesterFilter]);

  useEffect(() => {
    if (activeTab === "toppers" && toppers.length === 0) {
      loadToppersData();
    }
  }, [activeTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    loadResultsData(1, val, semesterFilter);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadResultsData(newPage, search, semesterFilter);
    }
  };

  const handleRefresh = () => {
    loadResultsData(pagination.page, search, semesterFilter);
    if (activeTab === "toppers") loadToppersData();
    toast.success("Semester examination results refreshed.");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rollNo || !form.studentName) {
      toast.error("Enter roll no and student name");
      return;
    }
    try {
      const created = await uploadBatchResults({
        ...form,
        department: form.department || hodDept,
      });
      setIsAddOpen(false);
      toast.success(`Result published for ${created.studentName} (${created.rollNo}): SGPA ${created.sgpa}!`);
      loadResultsData(1, search, semesterFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish result.");
    }
  };

  const handleOpenDossier = async (s: StudentResultEntry) => {
    setSelectedStudent(s);
    setIsDossierOpen(true);
    setDossierLoading(true);
    try {
      const fullTranscript = await fetchStudentTranscript(s.id);
      setSelectedStudent(fullTranscript);
    } catch (err: any) {
      console.error("Dossier load error:", err);
      toast.error(err.message || "Could not load complete transcript.");
    } finally {
      setDossierLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const exportData = await fetchAllResultsForExport({
        search,
        semester: semesterFilter,
        department: isHod ? hodDept : undefined,
      });

      const headers = ["Roll No", "Student Name", "Department", "Semester", "SGPA", "CGPA", "Result Class"];
      const rows = exportData.map((r) => [
        r.rollNo,
        `"${r.studentName}"`,
        r.department,
        `"${r.semester}"`,
        r.sgpa,
        r.cgpa,
        `"${r.resultClass}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Semester_Results_${hodDept}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${exportData.length} result records to CSV!`);
    } catch (err: any) {
      toast.error(err.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Award className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Institutional Results & Academic Transcripts
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                {hodDept} Department Scope
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Semester examination grades, CGPA transcripts, rank list, and official degree eligibility.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-9 gap-2 text-xs font-medium"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={exporting || loading}
            className="h-9 gap-2 text-xs font-medium"
          >
            <Download className={`size-3.5 ${exporting ? "animate-bounce" : ""}`} /> Export Results
          </Button>
          {!isHod && (
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="h-9 bg-brand-gradient text-white gap-2 text-xs font-semibold shadow-glow"
            >
              <Plus className="size-4" /> Publish Result
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Overall Pass Rate</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{stats.passRate}% Passed</p>
          <p className="text-[0.68rem] text-muted-foreground">{stats.examinationPeriod}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Distinction Holders</span>
            <Award className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">{stats.distinctionHolders} Scholars</p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">SGPA &gt; 9.0 / CGPA &ge; 8.5 Standing</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>{isHod ? `${hodDept} Average CGPA` : "Institutional CGPA"}</span>
            <GraduationCap className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">{stats.avgCgpa} CGPA Avg</p>
          <p className="text-[0.68rem] text-muted-foreground">Across {stats.totalTranscripts} department students</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Official Transcripts</span>
            <FileText className="size-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-600">{stats.totalTranscripts} Active</p>
          <p className="text-[0.68rem] text-purple-600 font-medium">Verified PostgreSQL Records</p>
        </div>
      </div>

      {/* SUBPARTS TAB SWITCHER */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80">
        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "results" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
          }`}
        >
          1. Semester Examination Results ({pagination.total})
        </button>
        <button
          onClick={() => setActiveTab("toppers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "toppers" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
          }`}
        >
          2. Gold Medalists & Department Toppers
        </button>
      </div>

      {/* TAB 1: RESULTS */}
      {activeTab === "results" && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
          {/* Controls: Search & Semester Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search Roll No or Student Name..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="size-3.5" /> Semester:
              </span>
              <Select value={semesterFilter} onValueChange={(val) => setSemesterFilter(val)}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Error State */}
          {error ? (
            <div className="p-8 text-center space-y-3 bg-destructive/5 rounded-xl border border-destructive/20">
              <AlertCircle className="size-8 text-destructive mx-auto" />
              <p className="text-sm font-semibold text-foreground">{error}</p>
              <Button size="sm" variant="outline" onClick={handleRefresh} className="text-xs">
                Retry Loading Results
              </Button>
            </div>
          ) : loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="size-8 text-primary animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Loading semester examination results from database...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="size-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">
                No semester examination results available for this department.
              </p>
              <p className="text-xs text-muted-foreground">
                Try clearing search query or changing semester filter.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                    <tr>
                      <th className="py-3 px-3">Roll No</th>
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3">Department & Semester</th>
                      <th className="py-3 px-3">SGPA</th>
                      <th className="py-3 px-3">CGPA</th>
                      <th className="py-3 px-3">Result Class</th>
                      <th className="py-3 px-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{r.rollNo}</td>
                        <td className="py-3 px-3 font-semibold text-foreground">{r.studentName}</td>
                        <td className="py-3 px-3">
                          {r.department} ({r.semester})
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-primary">{r.sgpa}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600">{r.cgpa}</td>
                        <td className="py-3 px-3">
                          <Badge
                            className={
                              r.resultClass.includes("Distinction")
                                ? "bg-purple-500/10 text-purple-600 border-purple-200"
                                : r.resultClass.includes("First Class")
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                                : "bg-amber-500/10 text-amber-600 border-amber-200"
                            }
                          >
                            {r.resultClass}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right pr-4">
                          <Button
                            size="sm"
                            onClick={() => handleOpenDossier(r)}
                            variant="ghost"
                            className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="size-3.5" /> Transcript
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Server-Side Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
                <span className="text-muted-foreground">
                  Showing <strong className="text-foreground">{startRecord}</strong>–
                  <strong className="text-foreground">{endRecord}</strong> of{" "}
                  <strong className="text-foreground">{pagination.total}</strong> students
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="h-8 px-2.5 text-xs gap-1"
                  >
                    <ChevronLeft className="size-3.5" /> Previous
                  </Button>
                  <span className="px-3 py-1 text-xs font-medium font-mono text-foreground bg-muted/50 rounded-md border border-border/50">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages || loading}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="h-8 px-2.5 text-xs gap-1"
                  >
                    Next <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: TOPPERS */}
      {activeTab === "toppers" && (
        <div className="space-y-4">
          {toppersLoading ? (
            <div className="py-12 text-center space-y-3 bg-card border border-border/80 rounded-2xl">
              <RefreshCw className="size-8 text-primary animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Loading toppers rank list from database...</p>
            </div>
          ) : toppers.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-card border border-border/80 rounded-2xl">
              <Award className="size-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">
                No topper records found for {hodDept} department.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toppers.map((top) => (
                <div
                  key={top.id}
                  className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-500/10 text-amber-600 font-mono text-xs border-amber-300/40">
                      Rank #{top.rank} Gold Medalist
                    </Badge>
                    <Badge className="bg-primary/10 text-primary font-mono text-xs">
                      {top.department}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {top.studentName} ({top.rollNo})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Semester SGPA: <span className="font-bold text-primary font-mono">{top.sgpa}</span> &middot; CGPA:{" "}
                    <span className="font-bold text-emerald-600 font-mono">{top.cgpa}</span>
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                    <span>{top.semester}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDossier(top)}
                      className="h-7 text-xs font-medium gap-1 hover:text-foreground"
                    >
                      <Eye className="size-3.5" /> View Transcript
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIALOG 1: ADD RESULT */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Publish Student Grade Result</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Roll No *</Label>
              <Input
                required
                placeholder="26CSB01"
                value={form.rollNo || ""}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                className="h-9 text-xs font-mono uppercase"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Student Name *</Label>
              <Input
                required
                placeholder="Meera Kulkarni"
                value={form.studentName || ""}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Semester CGPA</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cgpa ?? 8.85}
                onChange={(e) => setForm({ ...form, cgpa: Number(e.target.value) })}
                className="h-9 text-xs font-mono"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Publish Result
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: TRANSCRIPT DOSSIER */}
      <Dialog open={isDossierOpen} onOpenChange={setIsDossierOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center justify-between pr-6">
              Official Transcript{" "}
              <Badge className="bg-emerald-500/10 text-emerald-600 ml-2">Verified</Badge>
            </DialogTitle>
          </DialogHeader>
          {dossierLoading ? (
            <div className="py-8 text-center space-y-2">
              <RefreshCw className="size-6 text-primary animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground">Loading student transcript dossier from database...</p>
            </div>
          ) : selectedStudent ? (
            <div className="space-y-4 pt-1 text-xs">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  {selectedStudent.studentName} ({selectedStudent.rollNo})
                </h3>
                <p className="text-muted-foreground">
                  {selectedStudent.department} &middot; {selectedStudent.semester}
                </p>
                <div className="flex items-center gap-3 pt-2 font-mono">
                  <span className="text-primary font-bold">SGPA: {selectedStudent.sgpa}</span>
                  <span className="text-emerald-600 font-bold">CGPA: {selectedStudent.cgpa}</span>
                  <Badge variant="outline" className="text-xs font-sans">
                    {selectedStudent.resultClass}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-foreground">Course Subject Grades:</p>
                {selectedStudent.grades && selectedStudent.grades.length > 0 ? (
                  selectedStudent.grades.map((g, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60 font-mono"
                    >
                      <span>
                        {g.subjectCode}: {g.subjectTitle}
                      </span>
                      <Badge variant="outline" className="text-primary border-primary/30 font-bold">
                        {g.grade} ({g.credits} Cr)
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No course subject grades recorded.</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDossierOpen(false)} className="w-full text-xs">
                  Close Transcript
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
