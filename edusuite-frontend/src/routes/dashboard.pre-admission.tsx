import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/pre-admission")({
  component: () => <Navigate to="/pre-admission" replace />,
});
