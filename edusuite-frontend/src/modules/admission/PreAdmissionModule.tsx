import React, { useState } from "react";
import {
  FileText,
  User,
  GraduationCap,
  Layers,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Printer,
  FileCheck,
  ShieldCheck,
  Check,
  Download,
  AlertCircle,
  Building2,
  SearchCheck,
  School,
  Users,
  Search,
  Clock,
  QrCode,
  Mail,
  PhoneCall,
  XCircle,
  AlertTriangle,
  FileX,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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

import {
  submitCategoryAConvenerApplication,
  submitCategoryBManagementApplication,
  fetchAdmissionApplications,
  checkDuplicateApplication,
  generateVerificationQRCode,
  INITIAL_ADMISSIONS,
  type QuotaCategory,
  type CategoryASocialGroup,
  type AdmissionApplication,
  type AdmissionLifecycleStage,
} from "./AdmissionService";

const BRANCH_LIST = [
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication (ECE)",
  "Artificial Intelligence & Data Science (AI&DS)",
  "Electrical & Electronics (EEE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
];

const COMPLETE_9_STAGE_TIMELINE: { stage: AdmissionLifecycleStage; label: string }[] = [
  { stage: "Application Submitted", label: "App Submitted" },
  { stage: "Documents Uploaded", label: "Docs Uploaded" },
  { stage: "Documents Verified", label: "Docs Verified" },
  { stage: "Seat Allocated", label: "Seat Allocated" },
  { stage: "Fee Paid", label: "Fee Paid" },
  { stage: "Admission Approved", label: "Approved" },
  { stage: "Student ID Generated", label: "ID Generated" },
  { stage: "ERP Activated", label: "ERP Activated" },
];

export function PreAdmissionCandidatePortal() {
  const [activeTab, setActiveTab] = useState<"APPLY" | "TRACK">("APPLY");
  const [selectedQuotaCategory, setSelectedQuotaCategory] = useState<QuotaCategory | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);

  // Status Tracking State
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [trackedApplication, setTrackedApplication] = useState<AdmissionApplication | null>(INITIAL_ADMISSIONS[0]);

  // Duplicate Check Alert State
  const [duplicateMatch, setDuplicateMatch] = useState<AdmissionApplication | null>(null);

  // Category A Form
  const [catAForm, setCatAForm] = useState({
    name: "Sai Teja Varma",
    email: "saiteja.v@gmail.com",
    phone: "+91 9849011223",
    aadhaarNumber: "8842-1049-9021",
    dob: "2008-04-16",
    gender: "Male" as "Male" | "Female" | "Other",
    address: "Brodipet, Guntur, AP - 522002",
    eamcetHallTicketNo: "2451099887",
    eamcetRank: 10450,
    allotmentOrderNo: "AP-EAMCET-2026-90412",
    category: "OC" as CategoryASocialGroup,
    counselingPhase: "Phase 1" as const,
    allottedBranch: "Computer Science & Engineering (CSE)",
    isGovtFeeReimbursementEligible: true,
  });

  // Category B Form
  const [catBForm, setCatBForm] = useState({
    name: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    phone: "+91 9123456789",
    dob: "2008-05-18",
    gender: "Female" as "Male" | "Female" | "Other",
    address: "Banjara Hills, Hyderabad, TS",
    fatherName: "Mahesh Sharma",
    tenthPercentage: 94.5,
    interPercentage: 93.8,
    mpcPercentage: 95.2,
    boardName: "Board of Intermediate Education (BIE AP)",
    preferredBranch: "Computer Science & Engineering (CSE)",
    secondaryBranchPref: "Artificial Intelligence & Data Science (AI&DS)",
    tertiaryBranchPref: "Electronics & Communication (ECE)",
  });

  const handleSelectCategory = (quota: QuotaCategory) => {
    setSelectedQuotaCategory(quota);
    setCurrentStep(1);
  };

  const handleCatASubmit = async () => {
    if (!catAForm.name || !catAForm.eamcetHallTicketNo || !catAForm.allotmentOrderNo) {
      toast.error("Please fill in candidate name, EAPCET Hall Ticket No, and Allotment Order No.");
      return;
    }

    const allApps = await fetchAdmissionApplications();
    const existingDup = checkDuplicateApplication(allApps, {
      email: catAForm.email,
      phone: catAForm.phone,
      aadhaarNumber: catAForm.aadhaarNumber,
      eamcetHallTicketNo: catAForm.eamcetHallTicketNo,
    });

    if (existingDup) {
      setDuplicateMatch(existingDup);
      toast.warning("Duplicate application detected! Reviewing existing record.");
      return;
    }

    const created = await submitCategoryAConvenerApplication(catAForm);
    setSubmittedApp(created);
    setCurrentStep(6);
    toast.success(`Category A Application ${created.id} submitted!`);
  };

  const handleCatBSubmit = async () => {
    if (!catBForm.name || !catBForm.fatherName || !catBForm.interPercentage) {
      toast.error("Please fill in candidate name, father's name, and Inter %.");
      return;
    }

    const allApps = await fetchAdmissionApplications();
    const existingDup = checkDuplicateApplication(allApps, {
      email: catBForm.email,
      phone: catBForm.phone,
    });

    if (existingDup) {
      setDuplicateMatch(existingDup);
      toast.warning("Duplicate application detected!");
      return;
    }

    const created = await submitCategoryBManagementApplication(catBForm);
    setSubmittedApp(created);
    setCurrentStep(6);
    toast.success(`Category B Application ${created.id} submitted!`);
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const apps = await fetchAdmissionApplications();
    const query = trackSearchQuery.toLowerCase().trim();
    const found = apps.find(
      (a) =>
        a.id.toLowerCase() === query ||
        a.phone.includes(query) ||
        a.email.toLowerCase() === query ||
        (a.admissionNumber && a.admissionNumber.toLowerCase() === query) ||
        (a.convenerDetails && a.convenerDetails.eamcetHallTicketNo.includes(query))
    );

    if (found) {
      setTrackedApplication(found);
      toast.success(`Found Application ${found.id}`);
    } else {
      toast.error("No application found with the entered query.");
    }
  };

  return (
    <div className="pre-admission-portal-root p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
              Candidate Pre-Admission Portal
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Autonomous College Candidate Online Application, Status Tracker & Document Auditor 2026-27.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 shrink-0">
          <button
            onClick={() => setActiveTab("APPLY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "APPLY"
                ? "bg-card text-primary shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Online Application
          </button>
          <button
            onClick={() => setActiveTab("TRACK")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "TRACK"
                ? "bg-card text-primary shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Track Status
          </button>
        </div>
      </div>

      {/* TRACK APPLICATION TAB */}
      {activeTab === "TRACK" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <SearchCheck className="size-5 text-primary" /> Track Application Status & Document Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter Application ID (e.g. <span className="font-mono">PRE-2026-101</span>), Admission No (e.g. <span className="font-mono font-bold">2026CSE0001</span>), or EAPCET Hall Ticket No.
            </p>

            <form onSubmit={handleTrackSearch} className="flex gap-2 max-w-md">
              <Input
                required
                value={trackSearchQuery}
                onChange={(e) => setTrackSearchQuery(e.target.value)}
                placeholder="PRE-2026-101 or 2026CSE0001"
                className="h-9 text-xs font-mono"
              />
              <Button type="submit" className="bg-primary text-primary-foreground h-9 text-xs gap-1 font-semibold">
                <Search className="size-3.5" /> Track Status
              </Button>
            </form>
          </div>

          {trackedApplication && (
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{trackedApplication.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        trackedApplication.quota.includes("Category A")
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-bold"
                          : "bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs font-bold"
                      }
                    >
                      {trackedApplication.quota}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Branch: <span className="font-semibold text-foreground">{trackedApplication.targetBranch}</span> &middot; Admission No: <span className="font-mono font-bold text-emerald-600">{trackedApplication.admissionNumber || "Pending"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {trackedApplication.qrVerificationCode && (
                    <img src={trackedApplication.qrVerificationCode} alt="QR Code" className="size-12 rounded border p-1 bg-white shrink-0" />
                  )}
                  <div className="text-right space-y-1">
                    <Badge variant="secondary" className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-600 block">
                      {trackedApplication.status}
                    </Badge>
                    <Badge variant="outline" className="text-[0.65rem] font-mono text-slate-700">
                      Seat: {trackedApplication.fee.seatLockStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* COMPLETE 9-STAGE TIMELINE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Complete 9-Stage Admission Progress
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {COMPLETE_9_STAGE_TIMELINE.map((s, idx) => {
                    const isCompleted = trackedApplication.currentWorkflowStep > idx + 1 || trackedApplication.status === "ERP Activated";
                    const isCurrent = trackedApplication.currentWorkflowStep === idx + 1 && trackedApplication.status !== "ERP Activated";

                    return (
                      <div
                        key={s.stage}
                        className={`p-2.5 rounded-xl border text-center space-y-1 transition-all ${
                          isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 font-bold"
                            : isCurrent
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                            : "bg-muted/30 border-border text-muted-foreground"
                        }`}
                      >
                        <div className="size-5 rounded-full mx-auto flex items-center justify-center text-[0.65rem] font-bold font-mono">
                          {isCompleted ? <Check className="size-3 text-emerald-600" /> : idx + 1}
                        </div>
                        <span className="text-[0.65rem] block leading-tight">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INDIVIDUAL DOCUMENT VERIFICATION STATUS LIST */}
              <div className="space-y-3 border-t border-border/60 pt-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" /> Individual Certificate Verification Status
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trackedApplication.documents && typeof trackedApplication.documents === "object" ? (
                    Object.entries(trackedApplication.documents).map(([key, doc]: [string, any]) => (
                      <div key={key} className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{typeof doc === "object" && doc ? doc.name || key : String(doc)}</span>
                        <Badge
                          variant="outline"
                          className={
                            typeof doc === "object" && doc?.status === "Verified"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                              : typeof doc === "object" && doc?.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold"
                          }
                        >
                          {typeof doc === "object" && doc?.status === "Verified" && <Check className="size-3 mr-1" />}
                          {typeof doc === "object" && doc?.status === "Rejected" && <XCircle className="size-3 mr-1" />}
                          {typeof doc === "object" && doc?.status === "Pending" && <Clock className="size-3 mr-1" />}
                          {typeof doc === "object" && doc?.status ? doc.status : "Uploaded"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground col-span-2">
                      {String(trackedApplication.documents || "No documents uploaded.")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONLINE APPLICATION TAB */}
      {activeTab === "APPLY" && (
        <div className="space-y-6">
          {!selectedQuotaCategory ? (
            <div className="space-y-4">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h2 className="text-xl font-bold font-display text-foreground">Select Admission Quota Entry</h2>
                <p className="text-xs text-muted-foreground">Select Category A (Government Counseling) or Category B (Management Direct Admission).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div
                  onClick={() => handleSelectCategory("Category A (Convener / EAPCET)")}
                  className="p-6 rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-card hover:border-blue-500 hover:shadow-md transition-all cursor-pointer space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20">
                      <School className="size-6" />
                    </div>
                    <Badge className="bg-blue-600 text-white font-mono text-[0.68rem]">Category A</Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      Category A (Convener Quota)
                    </h3>
                    <p className="text-xs text-muted-foreground">EAPCET Hall Ticket No, Rank, Allotment Order, Phase, and Reservation Verification.</p>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5">
                    Start Category A Application <ArrowRight className="size-3.5" />
                  </Button>
                </div>

                <div
                  onClick={() => handleSelectCategory("Category B (Management Quota)")}
                  className="p-6 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-card hover:border-purple-500 hover:shadow-md transition-all cursor-pointer space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20">
                      <Users className="size-6" />
                    </div>
                    <Badge className="bg-purple-600 text-white font-mono text-[0.68rem]">Category B</Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-purple-600 transition-colors">
                      Category B (Management Quota)
                    </h3>
                    <p className="text-xs text-muted-foreground">Direct application for institutional merit seats based on Inter/MPC %.</p>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1.5">
                    Start Category B Application <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* FORM WIZARD (STEPS 1 TO 6) */
            <div className="space-y-6">
              {/* Wizard Progress Bar */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                    {selectedQuotaCategory} — Step {currentStep} of 6
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedQuotaCategory(null); setCurrentStep(1); }} className="text-xs h-7 text-muted-foreground">
                    Change Quota Entry
                  </Button>
                </div>

                <div className="grid grid-cols-6 gap-1 text-center">
                  {[
                    "1. Personal",
                    selectedQuotaCategory.includes("Category A") ? "2. EAPCET" : "2. Academic",
                    selectedQuotaCategory.includes("Category A") ? "3. Academic" : "3. Branches",
                    "4. Documents",
                    "5. Preview",
                    "6. Submit",
                  ].map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = currentStep === stepNum;
                    const isDone = currentStep > stepNum;
                    return (
                      <div
                        key={label}
                        onClick={() => { if (isDone) setCurrentStep(stepNum); }}
                        className={`p-2 rounded-xl text-[0.68rem] font-bold border transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : isDone
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 cursor-pointer"
                            : "bg-muted/40 text-muted-foreground border-border"
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CATEGORY A 6-STEP WIZARD */}
              {selectedQuotaCategory === "Category A (Convener / EAPCET)" && (
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
                  {/* STEP 1: PERSONAL DETAILS */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <User className="size-4 text-blue-600" /> Step 1: Personal Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Student Name *</Label>
                          <Input value={catAForm.name} onChange={(e) => setCatAForm({ ...catAForm, name: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Email Address *</Label>
                          <Input type="email" value={catAForm.email} onChange={(e) => setCatAForm({ ...catAForm, email: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Mobile Number *</Label>
                          <Input value={catAForm.phone} onChange={(e) => setCatAForm({ ...catAForm, phone: e.target.value })} className="h-9 text-xs font-mono" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Aadhaar Number</Label>
                          <Input value={catAForm.aadhaarNumber} onChange={(e) => setCatAForm({ ...catAForm, aadhaarNumber: e.target.value })} className="h-9 text-xs font-mono" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Date of Birth</Label>
                          <Input type="date" value={catAForm.dob} onChange={(e) => setCatAForm({ ...catAForm, dob: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Residential Address</Label>
                          <Input value={catAForm.address} onChange={(e) => setCatAForm({ ...catAForm, address: e.target.value })} className="h-9 text-xs" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: EAPCET DETAILS */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <School className="size-4 text-blue-600" /> Step 2: EAPCET Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">EAPCET Hall Ticket No *</Label>
                          <Input value={catAForm.eamcetHallTicketNo} onChange={(e) => setCatAForm({ ...catAForm, eamcetHallTicketNo: e.target.value })} className="h-9 text-xs font-mono font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">EAPCET Rank *</Label>
                          <Input type="number" value={catAForm.eamcetRank} onChange={(e) => setCatAForm({ ...catAForm, eamcetRank: Number(e.target.value) })} className="h-9 text-xs font-mono" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Counselling Phase *</Label>
                          <Select value={catAForm.counselingPhase} onValueChange={(v) => setCatAForm({ ...catAForm, counselingPhase: v as any })}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Phase 1" className="text-xs">Phase 1</SelectItem>
                              <SelectItem value="Phase 2" className="text-xs">Phase 2</SelectItem>
                              <SelectItem value="Final Phase" className="text-xs">Final Phase</SelectItem>
                              <SelectItem value="Spot Admissions" className="text-xs">Spot Admissions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Allotment Order No *</Label>
                          <Input value={catAForm.allotmentOrderNo} onChange={(e) => setCatAForm({ ...catAForm, allotmentOrderNo: e.target.value })} className="h-9 text-xs font-mono" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Reservation Category *</Label>
                          <Select value={catAForm.category} onValueChange={(v) => setCatAForm({ ...catAForm, category: v as any })}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OC" className="text-xs">OC (General)</SelectItem>
                              <SelectItem value="BC-A" className="text-xs">BC-A</SelectItem>
                              <SelectItem value="BC-B" className="text-xs">BC-B</SelectItem>
                              <SelectItem value="BC-C" className="text-xs">BC-C</SelectItem>
                              <SelectItem value="BC-D" className="text-xs">BC-D</SelectItem>
                              <SelectItem value="BC-E" className="text-xs">BC-E</SelectItem>
                              <SelectItem value="SC" className="text-xs">SC</SelectItem>
                              <SelectItem value="ST" className="text-xs">ST</SelectItem>
                              <SelectItem value="EWS" className="text-xs">EWS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Allotted Department Branch *</Label>
                          <Select value={catAForm.allottedBranch} onValueChange={(v) => setCatAForm({ ...catAForm, allottedBranch: v })}>
                            <SelectTrigger className="h-9 text-xs font-bold text-blue-600"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {BRANCH_LIST.map((b) => (
                                <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ACADEMIC DETAILS */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <GraduationCap className="size-4 text-blue-600" /> Step 3: Academic Record
                      </h3>
                      <div className="p-4 rounded-xl bg-muted/30 border space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="font-semibold text-foreground block">Qualifying Exam</span>
                            <span className="text-muted-foreground">Intermediate / 10+2 / Diploma</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">Board / Council</span>
                            <span className="text-muted-foreground">State Board of Intermediate Education</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
                          Category A candidates receive government fee reimbursement verification based on submitted EAPCET rank and category records.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: UPLOAD DOCUMENTS */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <Upload className="size-4 text-blue-600" /> Step 4: Documents Upload
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {["SSC Memo", "Inter Memo", "EAPCET Allotment Order", "Transfer Certificate", "Study Certificate", "Income Certificate", "Caste Certificate", "Aadhaar Card", "Photograph"].map((doc) => (
                          <div key={doc} className="p-3 rounded-xl border border-border/80 bg-card flex items-center justify-between">
                            <span className="font-semibold text-foreground">{doc}</span>
                            <Badge variant="outline" className="text-[0.65rem] text-emerald-600 border-emerald-300 bg-emerald-50 font-bold">
                              ✓ Ready to Upload
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 5: PREVIEW */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <FileCheck className="size-4 text-blue-600" /> Step 5: Application Summary Preview
                      </h3>
                      <div className="p-4 rounded-xl bg-card border space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div><span className="text-muted-foreground">Candidate:</span> <span className="font-bold text-foreground">{catAForm.name}</span></div>
                          <div><span className="text-muted-foreground">Email:</span> <span className="font-semibold">{catAForm.email}</span></div>
                          <div><span className="text-muted-foreground">EAPCET Hall Ticket:</span> <span className="font-mono font-bold text-blue-600">{catAForm.eamcetHallTicketNo}</span></div>
                          <div><span className="text-muted-foreground">EAPCET Rank:</span> <span className="font-mono font-bold">{catAForm.eamcetRank}</span></div>
                          <div><span className="text-muted-foreground">Allotted Branch:</span> <span className="font-bold text-foreground">{catAForm.allottedBranch}</span></div>
                          <div><span className="text-muted-foreground">Category:</span> <span className="font-bold">{catAForm.category}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP NAVIGATION BUTTONS */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="text-xs gap-1 font-bold">
                      <ArrowLeft className="size-3.5" /> Back
                    </Button>
                    {currentStep < 5 ? (
                      <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1">
                        Next Step <ArrowRight className="size-3.5" />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleCatASubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1">
                        Submit Category A Application <Check className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* CATEGORY B 6-STEP WIZARD */}
              {selectedQuotaCategory === "Category B (Management Quota)" && (
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
                  {/* STEP 1: PERSONAL DETAILS */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <User className="size-4 text-purple-600" /> Step 1: Personal & Guardian Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Student Name *</Label>
                          <Input value={catBForm.name} onChange={(e) => setCatBForm({ ...catBForm, name: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Father / Guardian Name *</Label>
                          <Input value={catBForm.fatherName} onChange={(e) => setCatBForm({ ...catBForm, fatherName: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Email Address *</Label>
                          <Input type="email" value={catBForm.email} onChange={(e) => setCatBForm({ ...catBForm, email: e.target.value })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Mobile Number *</Label>
                          <Input value={catBForm.phone} onChange={(e) => setCatBForm({ ...catBForm, phone: e.target.value })} className="h-9 text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ACADEMIC DETAILS */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <GraduationCap className="size-4 text-purple-600" /> Step 2: Academic Performance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">10th Class Percentage (%)</Label>
                          <Input type="number" step="0.1" value={catBForm.tenthPercentage} onChange={(e) => setCatBForm({ ...catBForm, tenthPercentage: Number(e.target.value) })} className="h-9 text-xs font-mono" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Inter Total Percentage (%) *</Label>
                          <Input type="number" step="0.1" value={catBForm.interPercentage} onChange={(e) => setCatBForm({ ...catBForm, interPercentage: Number(e.target.value) })} className="h-9 text-xs font-mono" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">MPC Group Percentage (%)</Label>
                          <Input type="number" step="0.1" value={catBForm.mpcPercentage} onChange={(e) => setCatBForm({ ...catBForm, mpcPercentage: Number(e.target.value) })} className="h-9 text-xs font-mono" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Board Name</Label>
                          <Input value={catBForm.boardName} onChange={(e) => setCatBForm({ ...catBForm, boardName: e.target.value })} className="h-9 text-xs" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PREFERRED BRANCHES */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <Layers className="size-4 text-purple-600" /> Step 3: Preferred Engineering Branches
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">First Preference *</Label>
                          <Select value={catBForm.preferredBranch} onValueChange={(v) => setCatBForm({ ...catBForm, preferredBranch: v })}>
                            <SelectTrigger className="h-9 text-xs font-bold text-purple-600"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {BRANCH_LIST.map((b) => (
                                <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: UPLOAD DOCUMENTS */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <Upload className="size-4 text-purple-600" /> Step 4: Documents Upload
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {["SSC Certificate", "Inter Marks Memo", "Transfer Certificate", "Aadhaar Card", "Passport Photo"].map((doc) => (
                          <div key={doc} className="p-3 rounded-xl border border-border/80 bg-card flex items-center justify-between">
                            <span className="font-semibold text-foreground">{doc}</span>
                            <Badge variant="outline" className="text-[0.65rem] text-emerald-600 border-emerald-300 bg-emerald-50 font-bold">
                              ✓ Attached
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 5: PREVIEW */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-2">
                        <FileCheck className="size-4 text-purple-600" /> Step 5: Application Summary Preview
                      </h3>
                      <div className="p-4 rounded-xl bg-card border space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div><span className="text-muted-foreground">Candidate:</span> <span className="font-bold text-foreground">{catBForm.name}</span></div>
                          <div><span className="text-muted-foreground">Father Name:</span> <span className="font-semibold">{catBForm.fatherName}</span></div>
                          <div><span className="text-muted-foreground">Inter Percentage:</span> <span className="font-mono font-bold text-purple-600">{catBForm.interPercentage}%</span></div>
                          <div><span className="text-muted-foreground">Preferred Branch:</span> <span className="font-bold text-foreground">{catBForm.preferredBranch}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP NAVIGATION BUTTONS */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="text-xs gap-1 font-bold">
                      <ArrowLeft className="size-3.5" /> Back
                    </Button>
                    {currentStep < 5 ? (
                      <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1">
                        Next Step <ArrowRight className="size-3.5" />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleCatBSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1">
                        Submit Category B Application <Check className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DUPLICATE DETECTED MODAL */}
      {duplicateMatch && (
        <Dialog open={Boolean(duplicateMatch)} onOpenChange={() => setDuplicateMatch(null)}>
          <DialogContent className="max-w-md border-amber-500">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-600">
                <AlertTriangle className="size-5" /> Existing Record Found (Duplicate Protection)
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs pt-1">
              <p className="text-muted-foreground">An active application already exists with matching Aadhaar / Mobile / Email.</p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="font-bold text-amber-950">{duplicateMatch.name} (App ID: {duplicateMatch.id})</div>
                <div className="text-amber-900 font-mono">Admission No: {duplicateMatch.admissionNumber || "N/A"}</div>
                <div className="text-amber-900 font-semibold">Status: {duplicateMatch.status}</div>
              </div>

              <DialogFooter>
                <Button onClick={() => setDuplicateMatch(null)} className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold">
                  Close & Review Existing Record
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* SUBMISSION MODAL */}
      {submittedApp && (
        <Dialog open={Boolean(submittedApp)} onOpenChange={() => setSubmittedApp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="size-5" /> Application Submitted & QR Slip Issued
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-1 text-center">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                {submittedApp.qrVerificationCode && (
                  <img src={submittedApp.qrVerificationCode} alt="QR Code" className="size-16 mx-auto bg-white p-1 rounded-lg border shadow-sm" />
                )}
                <div className="font-bold text-emerald-950">App ID: {submittedApp.id}</div>
              </div>

              <DialogFooter>
                <Button onClick={() => window.print()} className="w-full bg-primary text-primary-foreground text-xs font-bold gap-1">
                  <Printer className="size-3.5" /> Print Acknowledgement Slip
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
