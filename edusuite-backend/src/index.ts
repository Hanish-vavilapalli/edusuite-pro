import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// API health check
app.get("/api/health", (_req, res) => {
  return res.json({ status: "OK", timestamp: new Date() });
});

import { seedDatabase } from "./seeder";

// Database Seeder Utility Route (Secured for non-production/development use only)
app.post("/api/db/seed", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Database seeding is disabled in production environments." });
  }
  try {
    await seedDatabase();
    return res.json({ message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error("Seeder error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Import modular routes from modules folder
import authRoutes from "./modules/auth/auth.routes";
import courseRoutes from "./modules/courses/courses.routes";
import examRoutes from "./modules/exams/exams.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import studentRoutes from "./modules/students/students.routes";
import employeeRoutes from "./modules/employees/employees.routes";
import superAdminRoutes from "./modules/super-admin/super-admin.routes";
import academicsRoutes from "./modules/academics/academics.routes";
import payrollRoutes from "./modules/payroll/payroll.routes";
import deanRoutes from "./modules/dean/dean.routes";
import approvalsRoutes from "./modules/approvals/approvals.routes";
import alumniAnalyticsRoutes from "./modules/alumni-analytics/alumni-analytics.routes";
import libraryRoutes from "./modules/library/library.routes";

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/faculty", employeeRoutes);
app.use("/api/dean/faculty", employeeRoutes);
app.use("/api/academics/faculty", employeeRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/academics", academicsRoutes);
app.use("/api/academic", academicsRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dean", deanRoutes);
app.use("/api/approvals", approvalsRoutes);
app.use("/api/admin/alumni/analytics", alumniAnalyticsRoutes);
app.use("/api/library", libraryRoutes);

// Boot server
app.listen(PORT, () => {
  console.log(`EduSuite Backend API Server is listening on http://localhost:${PORT}`);
});

