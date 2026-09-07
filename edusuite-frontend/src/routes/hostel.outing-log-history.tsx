import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hostel/outing-log-history")({
  beforeLoad: () => {
    throw redirect({ to: "/hostel/log-history" });
  },
});
