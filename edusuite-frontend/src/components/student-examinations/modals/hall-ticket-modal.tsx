import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentExamProfile, UpcomingExamItem, HallTicketRecordItem } from "../types";
import { Download, Printer, Share2, QrCode, CheckCircle2, MapPin, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface HallTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: StudentExamProfile;
  exams: UpcomingExamItem[];
  hallTicketRecord?: HallTicketRecordItem | null;
}

const STATUS_BADGE: Record<string, React.ReactNode> = {
  Released: <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono px-2 py-0.5">RELEASED</Badge>,
  Downloaded: <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-mono px-2 py-0.5">DOWNLOADED</Badge>,
  "Verified & Issued": <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-mono px-2 py-0.5">VERIFIED & ISSUED</Badge>,
  Pending: <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-mono px-2 py-0.5">PENDING</Badge>,
  Withheld: <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-mono px-2 py-0.5">WITHHELD</Badge>,
  "Not Released": <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 text-[10px] font-mono px-2 py-0.5">NOT RELEASED</Badge>,
};

export function HallTicketModal({ open, onOpenChange, profile, exams, hallTicketRecord }: HallTicketModalProps) {
  // Use hallTicketRecord data if available, otherwise fall back to exams prop
  const displayExams = hallTicketRecord && hallTicketRecord.subjects.length > 0
    ? hallTicketRecord.subjects
    : exams;

  const htSemester = hallTicketRecord?.semester || profile.currentSemester || 1;
  const htNumber = hallTicketRecord?.hallTicketNumber || `HT-2026-SEM${htSemester}-0542`;
  const htStatus = hallTicketRecord?.status || "Verified & Issued";
  const htCenter = hallTicketRecord?.examCenter || profile.examCenter || "Block A - Main Exam Centre";
  const htYear = hallTicketRecord?.academicYear || profile.academicYear || "2025-2026";
  const htReportingTime = hallTicketRecord?.reportingTime || profile.examSession;
  const htInstructions = hallTicketRecord?.instructions || [
    "Hall Ticket and College ID Card are mandatory for entry into examination hall.",
    "Electronic devices, smartwatches, and programmable calculators are strictly prohibited.",
    "Candidates must occupy designated seats 15 minutes before exam commencement.",
    "Check question paper code and page count immediately upon receipt.",
  ];

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened for Hall Ticket.");
  };

  const handleDownload = () => {
    const pdfText = `EDUSUITE PRO UNIVERSITY — OFFICIAL HALL TICKET / ADMIT CARD
===========================================================
Hall Ticket Number : ${htNumber}
Status             : ${htStatus}
Student Name       : ${profile.name}
Roll Number        : ${profile.rollNumber}
Degree / Program   : ${profile.program}
Branch             : ${profile.branch} (${profile.section})
Semester           : ${htSemester} | Academic Year: ${htYear}
Examination Centre : ${htCenter}
Reporting Time     : ${htReportingTime}

REGISTERED EXAMINATION SCHEDULE:
${displayExams.map((e) => `- ${e.subjectCode}: ${e.subjectName} | ${e.examDate} | ${e.timeSlot} | Hall: ${e.hallNumber} | Seat: ${e.seatNumber}`).join("\n")}

CANDIDATE INSTRUCTIONS:
${htInstructions.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

Barcode: ||||||||||||||||||||||||||||||||||||||||||||
QR Code: QR-VERIFIED-${htNumber}
Controller of Examinations — EduSuite Pro Academic Board`;

    const blob = new Blob([pdfText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HallTicket_${htNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded Hall Ticket PDF — ${htNumber}`);
  };

  const handleShare = () => {
    const verifyUrl = `https://edusuite.edu/verify/hallticket/${profile.rollNumber}/${htNumber}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Hall Ticket verification link copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl">

        {/* HEADER */}
        <DialogHeader className="space-y-1 text-left border-b pb-4 border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {/* College Logo */}
              <div className="h-11 w-11 rounded-xl bg-[#0b193c] text-white font-black grid place-items-center font-display text-sm leading-none text-center shrink-0">
                <span className="text-[10px] font-extrabold leading-tight">EDUSUITE<br/>UNIV</span>
              </div>
              <div>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  EduSuite University — Examination Hall Ticket / Admit Card
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500 font-mono">
                  HT No: <strong className="text-blue-600">{htNumber}</strong> &middot; Semester {htSemester} &middot; AY: {htYear}
                </DialogDescription>
              </div>
            </div>
            {STATUS_BADGE[htStatus] || STATUS_BADGE["Verified & Issued"]}
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-5 my-4">

          {/* STUDENT IDENTIFIER BLOCK */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Student Photo Initials Badge + Info */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-[#0b193c] text-white font-extrabold text-xl flex items-center justify-center border-2 border-[#0b193c] shadow-sm tracking-wider font-display shrink-0 uppercase">
                {(() => {
                  const n = profile.name || "Vikram Malhotra";
                  const clean = n.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, "").trim();
                  const parts = clean.split(/\s+/);
                  return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : clean.slice(0, 2).toUpperCase();
                })()}
              </div>
              <div className="space-y-0.5 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{profile.name}</h3>
                <p className="text-slate-500 font-mono">Roll No: <strong className="text-blue-600">{profile.rollNumber}</strong></p>
                <p className="text-slate-500">{profile.program} &middot; {profile.branch}</p>
                <p className="text-slate-600 font-semibold">{profile.degree} · Semester {htSemester} ({profile.section})</p>
              </div>
            </div>

            {/* Centre & Reporting Block */}
            <div className="text-xs space-y-2 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Examination Centre</span>
                  <strong className="text-slate-900 dark:text-white">{htCenter}</strong>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Reporting Time</span>
                  <strong className="text-amber-600 font-mono">{htReportingTime}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* EXAM SCHEDULE TABLE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Registered Examination Schedule
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Subject Name</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Time Slot</th>
                    <th className="p-2.5">Hall No</th>
                    <th className="p-2.5">Seat No</th>
                    <th className="p-2.5">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayExams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400">No subjects listed for this hall ticket.</td>
                    </tr>
                  ) : (
                    displayExams.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono font-bold text-blue-600">{ex.subjectCode}</td>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{ex.subjectName}</td>
                        <td className="p-2.5 font-mono">{ex.examDate}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{ex.timeSlot}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">{ex.hallNumber}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600">{ex.seatNumber}</td>
                        <td className="p-2.5 border-l border-dashed border-slate-200 dark:border-slate-700 w-24 text-slate-300 text-[9px] italic">
                          Sign here
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* INSTRUCTIONS + BARCODE & QR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* INSTRUCTIONS */}
            <div className="md:col-span-2 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" /> Candidate Mandatory Instructions:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                {htInstructions.map((instr, i) => (
                  <li key={i}>{instr}</li>
                ))}
              </ul>
            </div>

            {/* BARCODE + QR + SEAL COLUMN */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
              {/* Barcode simulation */}
              <div className="font-mono text-[8px] tracking-widest font-black text-slate-800 dark:text-slate-200 border-b border-t border-slate-300 py-1 w-full leading-tight">
                |||| | |||||| ||| ||||||| |||| | ||||||
              </div>
              <span className="text-[9px] text-slate-400 font-mono">{htNumber}</span>

              {/* QR Placeholder */}
              <div className="w-10 h-10 grid grid-cols-3 grid-rows-3 gap-0.5 mx-auto">
                {[1,1,0,1,0,1,0,1,1].map((v, i) => (
                  <div key={i} className={`rounded-sm ${v ? "bg-slate-800 dark:bg-slate-200" : "bg-slate-100 dark:bg-slate-800"}`} />
                ))}
              </div>

              <div className="text-[10px] font-bold text-blue-600">Controller of Examinations</div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
              <span className="text-[9px] text-emerald-600 font-bold">VERIFIED</span>
            </div>
          </div>

        </div>

        {/* FOOTER BUTTONS */}
        <DialogFooter className="pt-2 flex flex-wrap justify-between gap-2 border-t border-slate-100 dark:border-slate-800 no-print">
          <Button type="button" variant="outline" onClick={handleShare} className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-700 cursor-pointer">
            <Share2 className="h-3.5 w-3.5 text-blue-600" /> Share Verification Link
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handlePrint} className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-700 cursor-pointer">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-xs border-slate-200 dark:border-slate-700 cursor-pointer">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
