import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

// Mock Data & Types
import {
  MOCK_STUDENT_INFO,
  MOCK_SCHEDULE,
  MOCK_TASKS,
  MOCK_EVENTS,
  MOCK_ANNOUNCEMENTS,
  MOCK_ATTENDANCE_SNAPSHOT,
  MOCK_EXAM_SNAPSHOT,
  MOCK_FINANCE_SNAPSHOT,
  MOCK_LMS_SNAPSHOT,
  MOCK_LIBRARY_SNAPSHOT,
  MOCK_HOSTEL_SNAPSHOT,
  MOCK_TRANSPORT_SNAPSHOT,
  MOCK_PLACEMENT_SNAPSHOT,
  MOCK_RECENT_ACTIVITIES,
} from "./mock-data";
import { EventItem, AnnouncementItem } from "./types";

// 20 Component Sub-modules
import { DashboardHeader } from "./dashboard-header";
import { AcademicOverview } from "./academic-overview";
import { TodaySchedule } from "./today-schedule";
import { MyTasks } from "./my-tasks";
import { UpcomingEvents } from "./upcoming-events";
import { AttendanceWidget } from "./attendance-widget";
import { ExamWidget } from "./exam-widget";
import { FinanceWidget } from "./finance-widget";
import { LmsWidget } from "./lms-widget";
import { LibraryWidget } from "./library-widget";
import { TransportWidget } from "./transport-widget";
import { PlacementWidget } from "./placement-widget";
import { AnnouncementWidget } from "./announcement-widget";
import { ActivityWidget } from "./activity-widget";
import { CalendarWidget } from "./calendar-widget";
import { AiWidget } from "./ai-widget";
import { QuickActions } from "./quick-actions";
import { Shortcuts } from "./shortcuts";

// UI Components & Modals
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Bell,
  IdCard,
  FileText,
  CalendarPlus,
  RefreshCw,
  QrCode,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const [student] = useState(MOCK_STUDENT_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);

  // Modals & Drawers
  const [digitalIdOpen, setDigitalIdOpen] = useState(false);
  const [bonafideOpen, setBonafideOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  // Form State
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDays, setLeaveDays] = useState("1");

  const unreadAnnouncements = MOCK_ANNOUNCEMENTS.filter((a) => a.unread);

  const handleNavigate = (route: string) => {
    navigate({ to: route });
  };

  const handleScrollToTimetable = () => {
    const el = document.getElementById("student-timetable-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleApplyLeave = () => {
    if (!leaveReason.trim()) {
      toast.error("Please enter a reason for leave application");
      return;
    }
    toast.success(`Leave application for ${leaveDays} day(s) sent to HOD!`);
    setLeaveModalOpen(false);
    setLeaveReason("");
  };

  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* STATE DEMO CONTROLLER */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-600 text-white text-[10px] font-mono font-bold">
            STUDENT ERP WORKSPACE
          </Badge>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Role Access Level: B.Tech Student (CampX Standard ERP)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            onClick={toggleLoading}
            size="sm"
            variant="ghost"
            className="h-7 text-[11px] rounded-lg text-slate-500 hover:text-slate-900 gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Skeleton Demo
          </Button>

          <Button
            onClick={() => setIsEmptyState(!isEmptyState)}
            size="sm"
            variant="ghost"
            className="h-7 text-[11px] rounded-lg text-slate-500 hover:text-slate-900"
          >
            {isEmptyState ? "Normal View" : "Empty View"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      ) : isEmptyState ? (
        <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <EmptyState
            title="No Active Student Workspace Data"
            description="Your student dashboard workspace is empty or resetting."
            actionLabel="Restore Dashboard Data"
            onAction={() => setIsEmptyState(false)}
          />
        </div>
      ) : (
        <>
          {/* SECTION 1: WELCOME HEADER */}
          <DashboardHeader
            student={student}
            unreadNotificationsCount={unreadAnnouncements.length}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenDigitalId={() => setDigitalIdOpen(true)}
            onGenerateBonafide={() => setBonafideOpen(true)}
          />

          {/* DISPATCHED PLACEMENT ASSESSMENT LIVE LINK BANNER */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-sm space-y-3 font-sans">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-600 text-white grid place-items-center font-extrabold text-sm shadow-xs shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600 text-white font-mono text-[0.62rem]">LIVE DISPATCHED EXAM</Badge>
                    <span className="text-[0.68rem] text-muted-foreground font-mono font-bold">Campus Hiring Drive Assessment</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground font-display">
                    Google Cloud Aptitude &amp; Coding Round 1
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate({ to: "/exam/take" })}
                  className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-4 cursor-pointer gap-1.5 shadow-glow"
                >
                  Attempt Test Now 🚀
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground font-mono gap-2 pt-1">
              <span>Company: <strong className="text-foreground font-sans">Google Cloud India</strong></span>
              <span>Duration: <strong className="text-foreground">90 Mins</strong></span>
              <span>Total Marks: <strong className="text-emerald-700 dark:text-emerald-300">100 Marks (Passing: 75%)</strong></span>
              <span>Target Batch: <strong className="text-foreground font-sans">2023 Series (23341A4229)</strong></span>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC OVERVIEW KPI CARDS */}
          <AcademicOverview onNavigate={handleNavigate} />

          {/* SECTION 20: MODULE SHORTCUTS NAVIGATOR */}
          <Shortcuts onNavigate={handleNavigate} />

          {/* MAIN 2-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLUMNS: TIMETABLE, TASKS, MODULE SNAPSHOTS, EVENTS, CIRCULARS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SECTION 3: TODAY'S TIMETABLE */}
              <TodaySchedule
                schedule={MOCK_SCHEDULE}
                onViewTimetable={() => handleNavigate("/student/timetable")}
              />

              {/* MODULE SNAPSHOTS GRID (2 COLUMNS INSIDE LEFT) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SECTION 6: ATTENDANCE */}
                <AttendanceWidget percentage={86.4} classesNeeded={0} onViewAttendance={() => handleNavigate("/student/attendance")} />

                {/* SECTION 7: EXAMINATION */}
                <ExamWidget exam={MOCK_EXAM_SNAPSHOT} onNavigate={handleNavigate} />

                {/* SECTION 8: FINANCE */}
                <FinanceWidget finance={MOCK_FINANCE_SNAPSHOT} onNavigate={handleNavigate} />

                {/* SECTION 9: LMS */}
                <LmsWidget lms={MOCK_LMS_SNAPSHOT} onNavigate={handleNavigate} />

                {/* SECTION 10: LIBRARY */}
                <LibraryWidget onOpenLibrary={() => handleNavigate("/student/library")} />

                {/* SECTION 12: TRANSPORT */}
                <TransportWidget transport={MOCK_TRANSPORT_SNAPSHOT} onNavigate={handleNavigate} />

                {/* SECTION 13: PLACEMENT */}
                <PlacementWidget placement={MOCK_PLACEMENT_SNAPSHOT} onNavigate={handleNavigate} />
              </div>

              {/* SECTION 5: UPCOMING EVENTS & DRIVES */}
              <UpcomingEvents
                events={MOCK_EVENTS}
                onOpenCalendar={() => handleScrollToTimetable()}
                onOpenEventDetails={(evt) => setSelectedEvent(evt)}
              />

              {/* SECTION 14 & 19: ANNOUNCEMENTS, CIRCULARS & NOTIFICATIONS */}
              <AnnouncementWidget
                announcements={MOCK_ANNOUNCEMENTS}
                onOpenAnnouncement={(ann) => setSelectedAnnouncement(ann)}
              />

            </div>

            {/* RIGHT 1 COLUMN: SIDE PANELS (AI ASSISTANT, RECENT ACTIVITY, CALENDAR) */}
            <div className="space-y-6">
              
              {/* SECTION 16: AI STUDENT ASSISTANT */}
              <AiWidget />

              {/* SECTION 18: MINI CALENDAR */}
              <CalendarWidget />

              {/* SECTION 15: RECENT SYSTEM ACTIVITY */}
              <ActivityWidget activities={MOCK_RECENT_ACTIVITIES} />

            </div>

          </div>
        </>
      )}

      {/* ========================================= */}
      {/* MODALS */}
      {/* ========================================= */}

      {/* DIGITAL ID CARD MODAL */}
      <Dialog open={digitalIdOpen} onOpenChange={setDigitalIdOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <IdCard className="h-4 w-4 text-blue-600" /> Digital Student Identity Card
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified EduSuite Smart ID Card for Security & Library Access.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl space-y-4 relative overflow-hidden border border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-wider text-blue-400">EDUSUITE ERP</span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-mono">
                AUTHENTICATED ID
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-md"
              />
              <div className="space-y-0.5 text-xs">
                <h4 className="font-bold text-sm text-white">{student.name}</h4>
                <p className="text-blue-300 font-mono text-[11px]">{student.rollNumber}</p>
                <p className="text-slate-300 text-[10px]">{student.program} - {student.department}</p>
                <p className="text-slate-400 text-[9px]">Valid: {student.batch}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span>REG: {student.registrationNumber}</span>
              <QrCode className="h-8 w-8 text-white p-0.5 bg-white/10 rounded" />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                toast.success("Digital ID Card PDF Downloaded!");
                setDigitalIdOpen(false);
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 w-full"
            >
              <Download className="h-3.5 w-3.5" /> Download Digital ID PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BONAFIDE CERTIFICATE MODAL */}
      <Dialog open={bonafideOpen} onOpenChange={setBonafideOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> Bonafide Certificate Generator
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Instantly generate an officially signed digital bonafide certificate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold">Certificate Purpose</label>
              <Input
                placeholder="e.g. Education Loan / Bus Pass / Bank Verification"
                defaultValue="Education Loan Verification"
                className="h-9 rounded-xl"
              />
            </div>
            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-500/20 text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-blue-600">Verified Details Included:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Student Name: {student.name}</li>
                <li>Roll Number: {student.rollNumber}</li>
                <li>Program: {student.program} ({student.department})</li>
                <li>Academic Status: Active Regular Student</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                toast.success("Bonafide Certificate PDF downloaded with digital seal!");
                setBonafideOpen(false);
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 w-full"
            >
              <Download className="h-3.5 w-3.5" /> Download Signed PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* APPLY LEAVE MODAL */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-amber-600" /> Apply Academic Leave
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit leave request for approval by Class Advisor & HOD.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-semibold">Number of Days</label>
              <Input
                type="number"
                value={leaveDays}
                onChange={(e) => setLeaveDays(e.target.value)}
                min={1}
                className="h-9 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-semibold">Reason for Absence</label>
              <Textarea
                placeholder="State the medical or personal reason for absence..."
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="h-24 text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLeaveModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleApplyLeave}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5"
            >
              Submit Leave Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
              <Badge variant="outline" className="w-fit mb-1 text-[10px] font-mono">
                {selectedEvent.category}
              </Badge>
              <DialogTitle className="text-base font-bold">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedEvent.date} at {selectedEvent.time}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs text-slate-600 dark:text-slate-300">
              <p>{selectedEvent.description}</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono space-y-1 text-[11px]">
                <p>📍 Location: {selectedEvent.location}</p>
                <p>⚡ Priority: {selectedEvent.priority}</p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedEvent(null)} className="rounded-xl text-xs w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ANNOUNCEMENT DETAILS MODAL */}
      {selectedAnnouncement && (
        <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
          <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
              <Badge className="w-fit mb-1 text-[10px] font-mono bg-purple-500/10 text-purple-600 border-purple-500/20">
                {selectedAnnouncement.category} Notice
              </Badge>
              <DialogTitle className="text-base font-bold">
                {selectedAnnouncement.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-mono">
                Issued by {selectedAnnouncement.author} on {selectedAnnouncement.date}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{selectedAnnouncement.content}</p>
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedAnnouncement(null)} className="rounded-xl text-xs w-full">
                Mark as Read & Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* NOTIFICATIONS DRAWER */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" /> Notifications & Alerts Center
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Unread notices and system alerts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-2 max-h-80 overflow-y-auto">
            {unreadAnnouncements.map((ann) => (
              <div key={ann.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{ann.title}</span>
                <p className="text-slate-500 text-[11px] line-clamp-2">{ann.content}</p>
                <span className="text-[10px] font-mono text-purple-600 font-semibold">{ann.date}</span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setNotificationsOpen(false)} className="rounded-xl text-xs w-full">
              Close Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
