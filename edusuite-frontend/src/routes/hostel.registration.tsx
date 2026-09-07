import { createFileRoute } from "@tanstack/react-router";
import { HostelRegistrationPage } from "@/modules/hostel/HostelRegistrationPage";

export const Route = createFileRoute("/hostel/registration")({
  head: () => ({ meta: [{ title: "Student Hostel Registration — CampusStay Portal" }] }),
  component: () => <HostelRegistrationPage />,
});
