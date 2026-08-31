import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRole } from "@/context/role-context";
import {
  getMockExams,
  saveMockExams,
  MockExamSchedule
} from "@/lib/mock-examcell-state";

export const Route = createFileRoute("/examcell/schedule")({
  head: () => ({
    meta: [{ title: "Schedule Exams — EduSuite Pro" }],
  }),
  component: ScheduleExamsPage,
});

function ScheduleExamsPage() {
  const navigate = useNavigate();
  const { role, flags, department } = useRole();
  const isOfficer = flags.includes("isExamController") || role === "super-admin";
  const activeDeptCode = department || "CSE";

  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("Regular");
  const [deptSelection, setDeptSelection] = useState(activeDeptCode);
  const [year, setYear] = useState("3");
  const [semester, setSemester] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [examFee, setExamFee] = useState("2000");
  const [exams, setExams] = useState<MockExamSchedule[]>([]);

  useEffect(() => {
    setExams(getMockExams());
  }, []);

  // Filter department selection to match user scope if assistant
  useEffect(() => {
    if (!isOfficer) {
      setDeptSelection(activeDeptCode);
    }
  }, [isOfficer, activeDeptCode]);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !startDate || !endDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const currentExams = getMockExams();
    const newExam: MockExamSchedule = {
      id: `e-${Date.now()}`,
      name: examName,
      type: examType,
      department: isOfficer ? deptSelection : activeDeptCode,
      year: Number(year),
      semester: Number(semester),
      startDate,
      endDate,
      status: 'Pending Approval',
      examFee: Number(examFee) || 2000
    };

    const updated = [...currentExams, newExam];
    saveMockExams(updated);
    setExams(updated);
    toast.success("Exam schedule drafted! Awaiting officer approval.");
    
    // Clear Form
    setExamName("");
    setStartDate("");
    setEndDate("");

    // Redirect to Updates board if Officer, otherwise stay on page
    if (isOfficer) {
      navigate({ to: "/examcell/updates" });
    }
  };

  // Filter exams for display
  const displayExams = isOfficer 
    ? exams 
    : exams.filter(e => e.department === activeDeptCode);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
            Schedule New Examinations
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Exam Cell Assistant workspace to draft new Regular, Supplementary, or Revaluation exam schedules.
          </p>
        </div>
        <Badge className="bg-brand-gradient text-white w-fit font-mono text-[10px] px-2.5 py-1">
          {isOfficer ? "EXAM CONTROLLER" : `EXAM ASSISTANT - ${activeDeptCode}`}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schedule Form */}
        <div className="lg:col-span-2">
          <Panel title="Draft Examination Details" icon={Calendar}>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Examination Name / Title
                </label>
                <Input
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  placeholder="e.g. B.Tech AIML Sem 3 Regular Examinations 2026"
                  className="h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    Exam Type
                  </label>
                  <select
                    value={examType}
                    onChange={e => setExamType(e.target.value)}
                    className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-bold"
                  >
                    <option value="Regular">Regular (Mid-term/End-sem)</option>
                    <option value="Supplementary">Supplementary</option>
                    <option value="Revaluation">Revaluation Exam</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    Target Department
                  </label>
                  <select
                    value={deptSelection}
                    onChange={e => setDeptSelection(e.target.value)}
                    disabled={!isOfficer}
                    className="w-full bg-card border border-border text-foreground rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:bg-slate-100 disabled:text-muted-foreground disabled:cursor-not-allowed font-bold"
                  >
                    <option value="CSE">CSE - Computer Science</option>
                    <option value="AIML">AIML - Artificial Intelligence & ML</option>
                    <option value="AIDS">AIDS - Artificial Intelligence & Data Science</option>
                    <option value="ECE">ECE - Electronics & Comm</option>
                    <option value="EEE">EEE - Electrical Eng</option>
                    <option value="MECH">MECH - Mechanical Eng</option>
                    <option value="CIVIL">CIVIL - Civil Eng</option>
                    <option value="IT">IT - Information Technology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    Year & Semester
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={year}
                      onChange={e => {
                        setYear(e.target.value);
                        const yr = Number(e.target.value);
                        setSemester(yr === 1 ? '1' : yr === 2 ? '3' : yr === 3 ? '5' : '7');
                      }}
                      className="w-full bg-card border border-border text-foreground rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-bold"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>

                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="w-full bg-card border border-border text-foreground rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-bold"
                    >
                      {Number(year) === 1 && <><option value="1">Sem 1</option><option value="2">Sem 2</option></>}
                      {Number(year) === 2 && <><option value="3">Sem 3</option><option value="4">Sem 4</option></>}
                      {Number(year) === 3 && <><option value="5">Sem 5</option><option value="6">Sem 6</option></>}
                      {Number(year) === 4 && <><option value="7">Sem 7</option><option value="8">Sem 8</option></>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="h-10 text-xs font-semibold rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="h-10 text-xs font-semibold rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Exam Registration Fee (INR Flat overall)
                </label>
                <Input
                  type="number"
                  value={examFee}
                  onChange={e => setExamFee(e.target.value)}
                  placeholder="e.g. 2000"
                  className="h-10 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white rounded-xl h-10 font-bold shadow-glow cursor-pointer hover:bg-indigo-700"
                >
                  <Plus className="size-4 mr-2" /> Draft Exam Schedule
                </Button>
              </div>
            </form>
          </Panel>
        </div>

        {/* Informational Panel */}
        <div className="space-y-6">
          <Panel title="Schedule Guidelines" icon={AlertCircle}>
            <ul className="text-xs text-muted-foreground space-y-3 font-semibold leading-relaxed">
              <li>
                ● Timetables begin in <span className="text-amber-600 font-extrabold">Pending Approval</span> and are not visible on student portals.
              </li>
              <li>
                ● Once saved, notify the Exam Cell Officer to configure enrollment deadlines and authorize releasing the schedule.
              </li>
              <li>
                ● Make sure the dates do not overlap with scheduled lab evaluations.
              </li>
            </ul>
          </Panel>
        </div>
      </div>

      {/* Catalog Grid */}
      <Card className="p-5 border border-slate-100 bg-white shadow-xs rounded-2xl">
        <div className="flex items-center gap-2 mb-4 border-b pb-3">
          <Calendar className="size-4.5 text-indigo-600 animate-pulse" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            {isOfficer ? "All Scheduled Examinations" : `My Department scheduled exams (${activeDeptCode})`}
          </h3>
        </div>

        {displayExams.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center font-bold">No exam timetables scheduled or drafted yet.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-650 font-black uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Exam Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-center">Semester</th>
                  <th className="px-4 py-3 text-center">Start Date</th>
                  <th className="px-4 py-3 text-center">End Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-semibold text-slate-700">
                {displayExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-bold text-slate-800">{exam.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{exam.type}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">B.Tech Year {exam.year} Sem {exam.semester}</td>
                    <td className="px-4 py-3 text-center font-mono">{exam.startDate}</td>
                    <td className="px-4 py-3 text-center font-mono">{exam.endDate}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge className={
                        exam.status === 'Completed' 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : exam.status === 'Upcoming' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                      }>
                        {exam.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
