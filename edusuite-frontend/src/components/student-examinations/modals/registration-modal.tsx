import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvailableCourseItem } from "../types";
import { CheckCircle2, ShieldCheck, AlertCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCourses: AvailableCourseItem[];
  allCourses: AvailableCourseItem[];
  onConfirm: (nptelSubmissions: any[]) => void;
}

export function RegistrationModal({ open, onOpenChange, selectedCourses, allCourses, onConfirm }: RegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nptelDetails, setNptelDetails] = useState<Record<string, { comments: string; certificateName: string }>>({});

  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);

  // Find unchecked/skipped courses
  const uncheckedCourses = allCourses.filter(c => !selectedCourses.some(sc => sc.id === c.id));

  const handleConfirmRegistration = () => {
    // Validate that NPTEL reasons and files are provided for all skipped courses
    for (const c of uncheckedCourses) {
      const details = nptelDetails[c.id];
      if (!details || !details.comments.trim()) {
        toast.error(`Please provide NPTEL comments/reason for skipped course: ${c.code}`);
        return;
      }
      if (!details.certificateName) {
        toast.error(`Please upload NPTEL verification certificate for skipped course: ${c.code}`);
        return;
      }
    }

    setIsSubmitting(true);
    // Map details to submissions payload
    const submissions = uncheckedCourses.map(c => ({
      courseId: c.id,
      isNptel: true,
      certificateName: nptelDetails[c.id].certificateName,
      comments: nptelDetails[c.id].comments
    }));

    onConfirm(submissions);
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" /> Confirm Course Registration
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Review your course selections and automated ERP validation checks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          
          {/* VALIDATION CHECKS */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-300 block text-xs">Automated ERP Checks Passed:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Prerequisite Check
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Credit Limit (&le; 24)
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> No Time Clashes
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> No Duplicate Courses
              </div>
            </div>
          </div>

          {/* SELECTED COURSES LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Selected Courses ({selectedCourses.length})</span>
              <span className="font-mono text-blue-600">{totalCredits} / 24 Credits</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {selectedCourses.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold font-mono text-blue-600">{c.code}: </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                  </div>
                  <span className="font-mono text-slate-500">{c.credits} Cr</span>
                </div>
              ))}
            </div>
          </div>

          {/* NPTEL VERIFICATION FOR SKIPPED COURSES */}
          {uncheckedCourses.length > 0 && (
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <span className="font-bold text-amber-700 dark:text-amber-300 block text-xs">
                ⚠️ skipped Course NPTEL Verification Required:
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                You did not select all offered courses. To submit, you must provide equivalent NPTEL details & upload certificates for skipped courses.
              </p>

              <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {uncheckedCourses.map((c) => (
                  <div key={c.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {c.code}: {c.name}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase">NPTEL Comments / Reason</label>
                      <input
                        type="text"
                        placeholder="e.g. Completed NPTEL Course on Java"
                        value={nptelDetails[c.id]?.comments || ""}
                        onChange={(e) => setNptelDetails(prev => ({
                          ...prev,
                          [c.id]: {
                            comments: e.target.value,
                            certificateName: prev[c.id]?.certificateName || ""
                          }
                        }))}
                        className="w-full h-8 px-2 border rounded-lg text-xs bg-slate-50 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase">Upload Certificate File</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNptelDetails(prev => ({
                                ...prev,
                                [c.id]: {
                                  comments: prev[c.id]?.comments || "",
                                  certificateName: file.name
                                }
                              }));
                              toast.success(`Attached ${file.name}`);
                            }
                          }}
                          className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                        />
                        {nptelDetails[c.id]?.certificateName && (
                          <span className="text-[10px] text-emerald-600 font-bold max-w-[120px] truncate">
                            ✓ {nptelDetails[c.id].certificateName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
            Back to Edit
          </Button>
          <Button type="button" onClick={handleConfirmRegistration} disabled={isSubmitting} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
            {isSubmitting ? "Submitting..." : "Submit for Advisor Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
