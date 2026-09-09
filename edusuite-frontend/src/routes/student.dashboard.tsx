import { createFileRoute } from "@tanstack/react-router";
import { StudentDashboardPage } from "@/components/student-dashboard";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [{ title: "Student Dashboard — EduSuite Pro" }],
  }),
  component: StudentDashboardPage,
});
