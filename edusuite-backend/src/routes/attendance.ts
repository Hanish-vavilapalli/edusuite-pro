import { Router, Response } from "express";
import { prisma } from "../db";
import { authenticateToken, AuthenticatedRequest } from "./auth";

const router = Router();

// GET /api/attendance: Fetch attendance records for active student
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Fetch existing attendance logs
    let records = await prisma.attendanceRecord.findMany({
      where: { userId },
    });

    // Seed mock attendance logs for August 2026 if empty (to match our attendance-calendar)
    if (records.length === 0) {
      const mockLogs = [
        { userId, date: "2026-08-03", status: "Present" },
        { userId, date: "2026-08-04", status: "Present" },
        { userId, date: "2026-08-05", status: "Absent" },
        { userId, date: "2026-08-06", status: "Present" },
        { userId, date: "2026-08-07", status: "Present" },
        { userId, date: "2026-08-10", status: "Present" },
        { userId, date: "2026-08-11", status: "Present" },
        { userId, date: "2026-08-12", status: "Absent" },
        { userId, date: "2026-08-13", status: "Present" },
        { userId, date: "2026-08-14", status: "Present" },
      ];

      await prisma.attendanceRecord.createMany({
        data: mockLogs,
      });

      records = await prisma.attendanceRecord.findMany({
        where: { userId },
      });
    }

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/attendance: Log or update student attendance
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { date, status } = req.body;

  if (!date || !status) {
    return res.status(400).json({ error: "Please specify both date (YYYY-MM-DD) and status." });
  }

  try {
    const userId = req.userId!;

    const record = await prisma.attendanceRecord.upsert({
      where: {
        userId_date: { userId, date },
      },
      update: {
        status,
      },
      create: {
        userId,
        date,
        status,
      },
    });

    res.json({ message: "Attendance logged successfully!", record });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
