import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/hostel")({
  head: () => ({
    meta: [
      { title: "Hostel Management — Student Portal" },
      {
        name: "description",
        content: "Manage hostel accommodation, room details, mess services, gate passes, complaints and hostel records.",
      },
    ],
  }),
  component: StudentHostelRoute,
});

function StudentHostelRoute() {
  return <PersonalizedStudentPortal initialTab="dashboard" />;
}
