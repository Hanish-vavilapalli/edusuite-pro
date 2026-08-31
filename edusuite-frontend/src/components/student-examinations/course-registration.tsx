import React from "react";
import {
  AvailableCourseItem,
  StudentExamProfile,
  RegistrationWorkflowStep,
  CourseRegWorkflowStatus,
  AcademicYearOption,
  YEAR_TO_SEMESTERS_MAP,
} from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

interface CourseRegistrationProps {
  profile: StudentExamProfile;
  courses: AvailableCourseItem[];
  workflow: RegistrationWorkflowStep[];
  courseRegStatus: CourseRegWorkflowStatus;
  selectedYear: AcademicYearOption;
  selectedSemester: number;
  onYearChange: (year: AcademicYearOption) => void;
  onSemesterChange: (sem: number) => void;
  onToggleRegister: (courseId: string) => void;
  onOpenCourseDrawer: (course: AvailableCourseItem) => void;
  onOpenConfirmModal: () => void;
  onCompleteCourseRegistration: () => void;
  onNavigateToExamReg: () => void;
}

export function CourseRegistration({
  profile,
  courses,
  courseRegStatus,
  selectedYear,
  selectedSemester,
  onYearChange,
  onSemesterChange,
  onToggleRegister,
  onOpenConfirmModal,
  onCompleteCourseRegistration,
  onNavigateToExamReg,
}: CourseRegistrationProps) {
  const isCompleted = courseRegStatus === "Completed";
  const currentSemester = profile.semester || 1;
  const isPreviousSem = selectedSemester < currentSemester;
  const isFutureSem = selectedSemester > currentSemester;
  const isReadOnly = isCompleted || isPreviousSem || isFutureSem;

  const availableSemesters = YEAR_TO_SEMESTERS_MAP[selectedYear] || [5, 6];

  // Dynamically filter courses for selected semester
  const filteredCourses = courses.filter((c) => c.semester === selectedSemester);

  return (
    <div className="space-y-6">

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ACADEMIC FILTERS (4 COLUMNS) */}
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
          <div className="p-4 rounded-xl bg-[#0b193c]/10 border border-[#0b193c]/20 text-xs space-y-1 text-slate-900 dark:text-blue-200">
            <div className="flex items-center gap-1.5 font-bold text-[#0b193c] dark:text-blue-300">
              <Info className="h-4 w-4 text-[#0b193c] dark:text-blue-400 shrink-0" />
              <span>Note</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700 dark:text-blue-300">
              Courses are offered by the Exam Cell Office. Please verify subject names and codes before clicking register.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: OFFERED COURSES CATALOG (8 COLUMNS) */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0b193c] dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Offered Courses Catalog</h3>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#0b193c]/10 text-[#0b193c] dark:text-blue-400 border border-[#0b193c]/20">
              {profile.department || "CSE"} - Sem {selectedSemester}
            </span>
          </div>

          {/* SEMESTER WARNING BANNERS */}
          {isPreviousSem && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Semester Completed (Academic History)</p>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-tight">
                  You have successfully completed this semester. Registrations are finalized and archived.
                </p>
              </div>
            </div>
          )}

          {isFutureSem && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/50 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-350">
              <Clock className="h-4 w-4 text-slate-500 shrink-0" />
              <div>
                <p className="font-bold">Registration Closed</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  This is a future semester. Course registration is not open yet.
                </p>
              </div>
            </div>
          )}

          {/* COURSES CARD GRID */}
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
              No courses offered for Semester {selectedSemester} yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => !isReadOnly && onToggleRegister(c.id)}
                    className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                      !isReadOnly ? "cursor-pointer" : ""
                    } ${
                      c.isRegistered
                        ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20"
                        : "border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-[#0b193c] dark:text-blue-400">{c.code}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">{c.category === "Core" ? "Normal Subject" : c.category}</span>
                          <input
                            type="checkbox"
                            checked={c.isRegistered}
                            disabled={isReadOnly}
                            onChange={() => {}} // Card click handles changes
                            className="size-4 rounded border-slate-350 accent-emerald-600 cursor-pointer"
                          />
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{c.name}</h4>
                      
                      <div className="mt-2 space-y-1 text-xs text-slate-500">
                        <p className="font-mono text-[11px]">Credits: {c.credits.toFixed(1)} &bull; Semester: {c.semester}</p>
                        <p className="text-[11px]">Mentor: <span className="text-[#0b193c] dark:text-blue-400 font-semibold">{c.faculty}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Submit Button */}
              {!isReadOnly && filteredCourses.some((c) => c.isRegistered) && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    onClick={onOpenConfirmModal}
                    className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    Confirm & Submit Registered Courses <ArrowRight className="size-4" />
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
