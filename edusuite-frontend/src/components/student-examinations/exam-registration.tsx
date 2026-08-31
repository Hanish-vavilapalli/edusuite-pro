import React from "react";
import {
  AvailableCourseItem,
  StudentExamProfile,
  ExamRegistrationItem,
  CourseRegWorkflowStatus,
  ExamRegWorkflowStatus,
  AcademicYearOption,
  YEAR_TO_SEMESTERS_MAP,
} from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface ExamRegistrationProps {
  profile: StudentExamProfile;
  examRegistrations: ExamRegistrationItem[];
  courses: AvailableCourseItem[];
  courseRegStatus: CourseRegWorkflowStatus;
  examRegStatus: ExamRegWorkflowStatus;
  selectedYear: AcademicYearOption;
  selectedSemester: number;
  flatFee: number;
  isFrozen: boolean;
  onYearChange: (year: AcademicYearOption) => void;
  onSemesterChange: (sem: number) => void;
  onRegisterExam: (id: string) => void;
  onCompleteAllExamReg: (courseIds: string[]) => void;
  onNavigateToCourseReg: () => void;
  onNavigateToHallTicket: () => void;
}

export function ExamRegistration({
  profile,
  courses,
  examRegistrations,
  courseRegStatus,
  examRegStatus,
  selectedYear,
  selectedSemester,
  flatFee,
  isFrozen,
  onYearChange,
  onSemesterChange,
  onRegisterExam,
  onCompleteAllExamReg,
  onNavigateToCourseReg,
  onNavigateToHallTicket,
}: ExamRegistrationProps) {
  const isExamRegPaid = examRegStatus === "Paid & Registered";
  const availableSemesters = YEAR_TO_SEMESTERS_MAP[selectedYear] || [5, 6];

  const currentSemester = profile.semester || 1;
  const isPreviousSem = selectedSemester < currentSemester;
  const isFutureSem = selectedSemester > currentSemester;
  const isReadOnly = isPreviousSem || isFutureSem || isFrozen || isExamRegPaid;

  // Dynamically filter courses to only show REGISTERED courses for this semester
  const filteredCourses = courses.filter((c) => c.semester === selectedSemester && c.isRegistered);

  const handleConfirmAndPay = () => {
    if (filteredCourses.length === 0) {
      toast.error("No registered courses found for exam payment.");
      return;
    }

    toast.success(`Processing payment of ₹${flatFee} for Semester ${selectedSemester} examinations...`);
    setTimeout(() => {
      const courseIds = filteredCourses.map(c => c.id);
      onCompleteAllExamReg(courseIds);
    }, 1000);
  };

  return (
    <div className="space-y-6">

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACADEMIC FILTERS (3 COLUMNS) */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Filters</h3>

          <div className="space-y-4 text-xs">
            {/* YEAR DROPDOWN */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-600 dark:text-slate-400 block">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value as AcademicYearOption)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* DEPENDENT SEMESTER DROPDOWN */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-600 dark:text-slate-400 block">Select Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => onSemesterChange(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {availableSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NOTE BOX */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs space-y-1 text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Note</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              Registering for an exam requires you to be registered for the course first. Hall tickets are generated based on registered exams.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: COURSE EXAM REGISTRATION (8 COLUMNS) */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Course Exam Registration</h3>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-100 dark:border-blue-900/60">
              Sem {selectedSemester} Exams
            </span>
          </div>

          {/* SEMESTER WARNING BANNERS */}
          {isPreviousSem && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Semester Completed (Academic History)</p>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-tight">
                  Examinations for this semester have been completed. All records are archived.
                </p>
              </div>
            </div>
          )}

          {isFutureSem && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/50 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-350 font-medium">
              <Lock className="h-4 w-4 text-slate-500 shrink-0" />
              <div>
                <p className="font-bold">Registration Closed</p>
                <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-tight">
                  This is a future semester. Exam registration is not open yet.
                </p>
              </div>
            </div>
          )}

          {isFrozen && !isPreviousSem && !isFutureSem && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-350 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <Lock className="h-5 w-5 text-amber-600 shrink-0 animate-pulse" />
                <span className="text-sm">Exam Registration Frozen</span>
              </div>
              <p className="leading-relaxed">
                The Exam Cell Office has not yet approved or released the examination schedule/notification for CSE Semester {selectedSemester}.
                Exam registration and fee payments are currently locked. Please contact the Exam Cell administration for updates.
              </p>
            </div>
          )}

          {/* COURSES CARD GRID */}
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
              No registered courses found for Semester {selectedSemester}. Complete course registration first.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map((c) => {
                  const isPaid = isPreviousSem || isExamRegPaid;
                  const borderClass = isPaid
                    ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20"
                    : "border-slate-100 dark:border-slate-800";

                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-3 ${borderClass}`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-bold text-blue-600">{c.code}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{c.category === "Core" ? "Normal Subject" : c.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{c.name}</h4>
                        
                        <div className="mt-2 space-y-1 text-xs text-slate-500">
                          <p className="font-mono text-[11px]">Credits: {c.credits.toFixed(1)} &bull; Semester: {c.semester}</p>
                          <p className="text-[11px]">Mentor: <span className="text-blue-600 font-semibold">{c.faculty}</span></p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        {isPaid ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                            <CheckCircle2 className="size-4" /> Exam Registered (Paid)
                          </div>
                        ) : (
                          <div className="text-xs text-blue-600 font-bold">
                            Status: Registered (Pending Payment)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Submit & Pay Button */}
              {!isReadOnly && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Semester Flat Exam Fee: <span className="text-emerald-600 text-sm">₹{flatFee}</span>
                  </div>
                  <Button
                    onClick={handleConfirmAndPay}
                    className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Confirm & Pay Exam Fee <ArrowRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
