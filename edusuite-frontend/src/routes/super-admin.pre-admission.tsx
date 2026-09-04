import { createFileRoute } from "@tanstack/react-router";
import { PreAdmissionCandidatePortal } from "@/modules/admission/PreAdmissionModule";

export const Route = createFileRoute("/super-admin/pre-admission")({
  head: () => ({
    meta: [
      { title: "Pre-Admission Portal — Super Admin | EduSuite Pro" },
      {
        name: "description",
        content:
          "Autonomous College Candidate Online Application, Status Tracker & Document Auditor 2026-27.",
      },
    ],
  }),
  component: PreAdmissionCandidatePortal,
});
