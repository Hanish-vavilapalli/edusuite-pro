import { createFileRoute } from "@tanstack/react-router";
import { LMSModuleView } from "@/modules/lms";

export const Route = createFileRoute("/faculty/lms")({
  head: () => ({
    meta: [{ title: "LMS — EduSuite Pro" }],
  }),
  component: FacultyLmsPage,
});

function FacultyLmsPage() {
  return <LMSModuleView isFaculty={true} />;
}
