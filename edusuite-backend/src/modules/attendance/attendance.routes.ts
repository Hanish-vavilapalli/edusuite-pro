import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";
import { auditLog } from "../super-admin/super-admin.routes";

const router = Router();

// Helper to compute YYYY-MM-DD date range bounds based on timeframe
function getDateBounds(timeframe: string = "daily", baseDateStr?: string) {
  const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();
  const endDateStr = baseDate.toISOString().split("T")[0];

  const startDateObj = new Date(baseDate);
  if (timeframe === "weekly") {
    startDateObj.setDate(startDateObj.getDate() - 6);
  } else if (timeframe === "monthly") {
    startDateObj.setDate(startDateObj.getDate() - 29);
  }

  const startDateStr = startDateObj.toISOString().split("T")[0];
  return { startDateStr, endDateStr };
}

// Helper to normalize department code and name variations (e.g. "Computer Science & Engineering" -> "CSE")
export function normalizeDeptCode(deptStr?: string): string {
  if (!deptStr) return "";
  const d = deptStr.trim().toUpperCase();
  if (d.includes("COMPUTER") || d.includes("CSE") || d === "CS" || d === "COMP") return "CSE";
  if (d.includes("ELECTRONICS") || d.includes("COMMUNICATION") || d === "ECE") return "ECE";
  if (d.includes("ELECTRICAL") || d === "EEE") return "EEE";
  if (d.includes("MECHANICAL") || d === "ME") return "MECHANICAL";
  if (d.includes("CIVIL") || d === "CE") return "CIVIL";
  if (d.includes("INFORMATION") || d === "IT") return "IT";
  if (d.includes("DATA") || d.includes("AIDS") || d.includes("AI&DS")) return "AI&DS";
  if (d.includes("MACHINE") || d.includes("AIML") || d.includes("AI&ML")) return "AI&ML";
  return d;
}

// Helper to resolve and enforce department RBAC scope
async function resolveDepartmentScope(
  req: AuthenticatedRequest,
  res: Response
): Promise<{ department?: string; isAuthorized: boolean }> {
  const role = (req.userRole || "").toLowerCase();

  if (role === "hod" || role.includes("hod")) {
    let dept = req.userDepartment;
    if (!dept && req.userId) {
      const faculty = await prisma.faculty.findUnique({ where: { id: req.userId } });
      if (faculty?.department) {
        dept = faculty.department;
      }
    }

    const normDept = normalizeDeptCode(dept);
    const requestedDept = req.query.department as string;

    if (
      requestedDept &&
      requestedDept !== "All" &&
      requestedDept !== "All Departments" &&
      normDept &&
      normalizeDeptCode(requestedDept) !== normDept
    ) {
      res.status(403).json({
        error: `Access denied. HOD is restricted to viewing ${dept} department data only.`,
      });
      return { isAuthorized: false };
    }

    return { department: normDept || dept || undefined, isAuthorized: true };
  }

  const requestedDept = req.query.department as string;
  if (requestedDept && requestedDept !== "All" && requestedDept !== "All Departments") {
    return { department: normalizeDeptCode(requestedDept), isAuthorized: true };
  }

  return { department: undefined, isAuthorized: true };
}

// ==========================================
// 1. DASHBOARD STATS API (TOP 4 KPI CARDS)
// ==========================================
router.get("/stats", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const timeframe = (req.query.timeframe as string) || "daily";
    const requestedDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const { startDateStr, endDateStr } = getDateBounds(timeframe, requestedDate);

    const studentFilter = scope.department
      ? { user: { department: { contains: scope.department, mode: "insensitive" as const } } }
      : {};

    const timeframeDateFilter = {
      date: { gte: startDateStr, lte: endDateStr },
    };

    const todayDateFilter = {
      date: requestedDate,
    };

    // Calculate timeframe aggregates
    const [
      totalRecordsTimeframe,
      presentTimeframe,
      lateTimeframe,
      todayPresent,
      todayAbsent,
      todayLate,
    ] = await Promise.all([
      prisma.attendanceRecord.count({
        where: { ...studentFilter, ...timeframeDateFilter },
      }),
      prisma.attendanceRecord.count({
        where: { ...studentFilter, ...timeframeDateFilter, status: "Present" },
      }),
      prisma.attendanceRecord.count({
        where: { ...studentFilter, ...timeframeDateFilter, status: "Late" },
      }),
      prisma.attendanceRecord.count({
        where: { ...studentFilter, ...todayDateFilter, status: "Present" },
      }),
      prisma.attendanceRecord.count({
        where: { ...studentFilter, ...todayDateFilter, status: "Absent" },
      }),
      prisma.attendanceRecord.count({
        where: { ...studentFilter, ...todayDateFilter, status: "Late" },
      }),
    ]);

    const attendedTimeframe = presentTimeframe + lateTimeframe;
    const averageAttendance =
      totalRecordsTimeframe > 0
        ? Number(((attendedTimeframe / totalRecordsTimeframe) * 100).toFixed(1))
        : 0;

    const presentTodayCount = todayPresent + todayLate;
    const absentTodayCount = todayAbsent;

    // Calculate Shortage Alerts (<75%)
    // Group records by student to check individual attendance rates
    const groupedStudents = await prisma.attendanceRecord.groupBy({
      by: ["userId", "status"],
      where: { ...studentFilter },
      _count: { id: true },
    });

    const studentTotals: Record<string, { total: number; attended: number }> = {};
    for (const g of groupedStudents) {
      if (!studentTotals[g.userId]) {
        studentTotals[g.userId] = { total: 0, attended: 0 };
      }
      studentTotals[g.userId].total += g._count.id;
      if (g.status === "Present" || g.status === "Late") {
        studentTotals[g.userId].attended += g._count.id;
      }
    }

    let shortageAlertsCount = 0;
    for (const uId in studentTotals) {
      const st = studentTotals[uId];
      if (st.total > 0 && (st.attended / st.total) * 100 < 75) {
        shortageAlertsCount++;
      }
    }

    // Also check timetables/classes with <75% attendance for shortage count if zero student alerts
    const timetables = await prisma.masterTimetable.findMany({
      where: scope.department
        ? { branch: { contains: scope.department, mode: "insensitive" as const } }
        : {},
      select: { id: true },
    });

    if (timetables.length > 0) {
      const ttIds = timetables.map((t) => t.id);
      const classAttGrouped = await prisma.attendanceRecord.groupBy({
        by: ["timetableId", "status"],
        where: {
          timetableId: { in: ttIds },
          ...timeframeDateFilter,
        },
        _count: { id: true },
      });

      const classTotals: Record<string, { total: number; attended: number }> = {};
      for (const cg of classAttGrouped) {
        if (!cg.timetableId) continue;
        if (!classTotals[cg.timetableId]) {
          classTotals[cg.timetableId] = { total: 0, attended: 0 };
        }
        classTotals[cg.timetableId].total += cg._count.id;
        if (cg.status === "Present" || cg.status === "Late") {
          classTotals[cg.timetableId].attended += cg._count.id;
        }
      }

      let classShortageCount = 0;
      for (const tId in classTotals) {
        const ct = classTotals[tId];
        if (ct.total > 0 && (ct.attended / ct.total) * 100 < 75) {
          classShortageCount++;
        }
      }

      shortageAlertsCount = Math.max(shortageAlertsCount, classShortageCount);
    }

    return res.json({
      averageAttendance,
      presentToday: presentTodayCount,
      absentToday: absentTodayCount,
      shortageAlertsCount,
      totalRecords: totalRecordsTimeframe,
      timeframe,
      date: requestedDate,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. ALL CLASSES ATTENDANCE DASHBOARD
// ==========================================
router.get("/classes", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const timeframe = (req.query.timeframe as string) || "daily";
    const requestedDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const searchQuery = (req.query.search as string || "").trim().toLowerCase();

    const { startDateStr: dailyStart, endDateStr: dailyEnd } = getDateBounds("daily", requestedDate);
    const { startDateStr: weeklyStart, endDateStr: weeklyEnd } = getDateBounds("weekly", requestedDate);
    const { startDateStr: monthlyStart, endDateStr: monthlyEnd } = getDateBounds("monthly", requestedDate);

    const timetables = await prisma.masterTimetable.findMany({
      where: {
        ...(scope.department
          ? { branch: { contains: scope.department, mode: "insensitive" as const } }
          : {}),
      },
      include: { faculty: true, course: true },
      take: 50,
    });

    const ttIds = timetables.map((t) => t.id);

    // Group students by department & semester
    const studentGrouped = await prisma.student.groupBy({
      by: ["department", "semester"],
      _count: { id: true },
    });

    const studentMap: Record<string, number> = {};
    for (const sg of studentGrouped) {
      const key = `${(sg.department || "CSE").toLowerCase()}-${sg.semester}`;
      studentMap[key] = sg._count.id;
    }

    // Fetch attendance records for daily, weekly, monthly ranges
    const [dailyAtt, weeklyAtt, monthlyAtt] = await Promise.all([
      prisma.attendanceRecord.groupBy({
        by: ["timetableId", "status"],
        where: {
          timetableId: { in: ttIds },
          date: { gte: dailyStart, lte: dailyEnd },
        },
        _count: { id: true },
      }),
      prisma.attendanceRecord.groupBy({
        by: ["timetableId", "status"],
        where: {
          timetableId: { in: ttIds },
          date: { gte: weeklyStart, lte: weeklyEnd },
        },
        _count: { id: true },
      }),
      prisma.attendanceRecord.groupBy({
        by: ["timetableId", "status"],
        where: {
          timetableId: { in: ttIds },
          date: { gte: monthlyStart, lte: monthlyEnd },
        },
        _count: { id: true },
      }),
    ]);

    const buildAttMap = (grouped: typeof dailyAtt) => {
      const map: Record<string, Record<string, number>> = {};
      for (const g of grouped) {
        if (!g.timetableId) continue;
        if (!map[g.timetableId]) map[g.timetableId] = { Present: 0, Absent: 0, Late: 0 };
        map[g.timetableId][g.status] = g._count.id;
      }
      return map;
    };

    const dailyMap = buildAttMap(dailyAtt);
    const weeklyMap = buildAttMap(weeklyAtt);
    const monthlyMap = buildAttMap(monthlyAtt);

    const result = [];

    for (const tt of timetables) {
      const className = `${tt.branch}-${tt.semester}${tt.section.replace(/section\s*/i, "").trim() || "A"}`;
      const teacherName = tt.faculty ? tt.faculty.name : "Faculty Member";

      if (
        searchQuery &&
        !className.toLowerCase().includes(searchQuery) &&
        !teacherName.toLowerCase().includes(searchQuery) &&
        !tt.branch.toLowerCase().includes(searchQuery) &&
        !(tt.course?.code || "").toLowerCase().includes(searchQuery) &&
        !(tt.course?.name || "").toLowerCase().includes(searchQuery)
      ) {
        continue;
      }

      const totalStudents = studentMap[`${tt.branch.toLowerCase()}-${tt.semester}`] || 60;

      const calcPct = (map: Record<string, Record<string, number>>) => {
        const stats = map[tt.id] || { Present: 0, Absent: 0, Late: 0 };
        const total = stats.Present + stats.Absent + stats.Late;
        if (total === 0) return 0;
        return Number((((stats.Present + stats.Late) / total) * 100).toFixed(1));
      };

      const dailyPct = calcPct(dailyMap);
      const weeklyPct = calcPct(weeklyMap);
      const monthlyPct = calcPct(monthlyMap);

      const activeMap = timeframe === "weekly" ? weeklyMap : timeframe === "monthly" ? monthlyMap : dailyMap;
      const activeStats = activeMap[tt.id] || { Present: 0, Absent: 0, Late: 0 };

      const presentCount = activeStats.Present;
      const absentCount = activeStats.Absent;
      const lateCount = activeStats.Late;
      const currentPct = timeframe === "weekly" ? weeklyPct : timeframe === "monthly" ? monthlyPct : dailyPct;

      result.push({
        id: tt.id,
        timetableId: tt.id,
        className,
        department: tt.branch,
        section: tt.section,
        semester: tt.semester,
        courseCode: tt.course ? tt.course.code : `${tt.branch}${tt.semester}01`,
        courseTitle: tt.course ? tt.course.name : "Assigned Subject",
        instructor: teacherName,
        classTeacher: teacherName,
        facultyId: tt.facultyId,
        totalStudents,
        presentCount,
        absentCount,
        lateCount,
        percentage: currentPct,
        dailyPct,
        weeklyPct,
        monthlyPct,
        status: currentPct >= 75 ? "Normal" : "Defaulter Warning",
        governanceStatus: currentPct >= 75 ? "SATISFACTORY" : "SHORTAGE / ACTION REQUIRED",
        date: requestedDate,
      });
    }

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. ATTENDANCE RECORDS LEDGER API
// ==========================================
router.get("/ledger", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const statusFilter = req.query.status as string;
    const searchQuery = (req.query.search as string || "").trim();
    const timeframe = (req.query.timeframe as string) || "daily";
    const requestedDate = req.query.date as string;

    const where: any = {};

    if (scope.department) {
      where.user = { department: { contains: scope.department, mode: "insensitive" as const } };
    }

    if (statusFilter && statusFilter !== "All") {
      where.status = statusFilter;
    }

    if (timeframe && timeframe !== "all") {
      const { startDateStr, endDateStr } = getDateBounds(timeframe, requestedDate);
      where.date = { gte: startDateStr, lte: endDateStr };
    }

    if (searchQuery) {
      where.OR = [
        { user: { name: { contains: searchQuery, mode: "insensitive" as const } } },
        { user: { rollNumber: { contains: searchQuery, mode: "insensitive" as const } } },
        { user: { department: { contains: searchQuery, mode: "insensitive" as const } } },
        { timetable: { course: { code: { contains: searchQuery, mode: "insensitive" as const } } } },
        { timetable: { course: { name: { contains: searchQuery, mode: "insensitive" as const } } } },
      ];
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        user: true,
        timetable: { include: { course: true, faculty: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    });

    const result = records.map((r) => ({
      id: r.id,
      studentId: r.userId,
      rollNo: r.user ? r.user.rollNumber : "N/A",
      studentName: r.user ? r.user.name : "Student",
      department: r.user ? r.user.department : "CSE",
      section: r.user?.section || "CSE-A",
      semester: r.user ? r.user.semester : 3,
      date: r.date,
      periodNumber: r.periodNumber || 1,
      status: r.status,
      courseCode: r.timetable?.course ? r.timetable.course.code : "CS502",
      courseTitle: r.timetable?.course ? r.timetable.course.name : "Subject Lecture",
      instructor: r.timetable?.faculty ? r.timetable.faculty.name : "Faculty Member",
    }));

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. CASCADING ATTENDANCE SELECTORS & ROSTER API
// ==========================================

// GET /api/attendance/classes-list: Fetch available classes/semesters for department
router.get("/classes-list", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const dept = scope.department || (req.query.department as string) || "CSE";

    // Query distinct semesters in Student and MasterTimetable for this department
    const studentSemesters = await prisma.student.groupBy({
      by: ["semester"],
      where: {
        department: { contains: dept, mode: "insensitive" as const },
        semester: { not: null },
      },
    });

    const ttSemesters = await prisma.masterTimetable.groupBy({
      by: ["semester"],
      where: {
        branch: { contains: dept, mode: "insensitive" as const },
      },
    });

    const semSet = new Set<number>();
    studentSemesters.forEach((s) => { if (s.semester) semSet.add(s.semester); });
    ttSemesters.forEach((t) => { if (t.semester) semSet.add(t.semester); });

    // Default to semesters 1..8 if database empty
    if (semSet.size === 0) {
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((s) => semSet.add(s));
    }

    const sortedSems = Array.from(semSet).sort((a, b) => a - b);
    const classes = sortedSems.map((sem) => {
      const yr = Math.ceil(sem / 2);
      const yearSuffix = yr === 1 ? "1st" : yr === 2 ? "2nd" : yr === 3 ? "3rd" : `${yr}th`;
      return {
        id: String(sem),
        semester: sem,
        year: yr,
        label: `${yearSuffix} Year (Sem ${sem})`,
      };
    });

    return res.json(classes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/attendance/sections-list: Fetch available sections for selected department + class/semester
router.get("/sections-list", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const dept = scope.department || (req.query.department as string) || "CSE";
    const semParam = req.query.semester || req.query.classId;
    const sem = semParam ? Number(semParam) : undefined;

    const studentSections = await prisma.student.groupBy({
      by: ["section"],
      where: {
        department: { contains: dept, mode: "insensitive" as const },
        ...(sem ? { semester: sem } : {}),
        section: { not: "" },
      },
    });

    const ttSections = await prisma.masterTimetable.groupBy({
      by: ["section"],
      where: {
        branch: { contains: dept, mode: "insensitive" as const },
        ...(sem ? { semester: sem } : {}),
      },
    });

    const secSet = new Set<string>();
    studentSections.forEach((s) => {
      if (s.section) {
        const clean = s.section.replace(/^(CSE|ECE|ME|CE|EEE|IT)-?/i, "").trim() || s.section;
        secSet.add(clean.toUpperCase());
      }
    });

    ttSections.forEach((t) => {
      if (t.section) {
        const clean = t.section.replace(/^(section\s*|CSE|ECE|ME|CE|EEE|IT)-?/i, "").trim() || t.section;
        secSet.add(clean.toUpperCase());
      }
    });

    if (secSet.size === 0) {
      ["A", "B"].forEach((sec) => secSet.add(sec));
    }

    const sections = Array.from(secSet).sort();
    return res.json(sections);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/attendance/session-info: Fetch timetable subject/faculty info for class, section, period & date
router.get("/session-info", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const dept = scope.department || (req.query.department as string) || "CSE";
    const semParam = req.query.semester || req.query.classId;
    const sem = semParam ? Number(semParam) : undefined;
    const section = (req.query.section as string || "").trim();
    const periodNumber = Number(req.query.periodNumber || 1);

    if (!sem || !section) {
      return res.json({ hasSubject: false, message: "Select a class and section to view timetable session details." });
    }

    const tt = await prisma.masterTimetable.findFirst({
      where: {
        branch: { contains: dept, mode: "insensitive" as const },
        ...(sem ? { semester: sem } : {}),
        section: { contains: section, mode: "insensitive" as const },
        periodNumber,
      },
      include: { course: true, faculty: true },
    });

    if (!tt) {
      return res.json({
        hasSubject: false,
        message: `No timetable subject assigned for Period ${periodNumber}.`,
      });
    }

    return res.json({
      hasSubject: true,
      timetableId: tt.id,
      subjectCode: tt.course?.code || `${dept}${sem}0${periodNumber}`,
      subjectName: tt.course?.name || "Department Course",
      facultyName: tt.faculty?.name || "Faculty Member",
      room: tt.roomNo || "Room 101",
      periodNumber: tt.periodNumber || periodNumber,
      day: tt.day || "Today",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/attendance/roster: Fetch real enrolled students with existing PostgreSQL attendance status
router.get("/roster", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const semParam = req.query.semester || req.query.classId;
    const section = (req.query.section as string || "").trim();
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const periodNumber = Number(req.query.periodNumber || 2);
    const dept = scope.department || (req.query.department as string) || "CSE";

    // DO NOT return students if class or section is missing!
    if (!semParam || !section || semParam === "all" || section === "all") {
      return res.json([]);
    }

    const sem = Number(semParam);

    // Build section filter matching "A", "CSE-A", "Section A", etc.
    const sectionPattern = section.length === 1 ? section : section;

    const students = await prisma.student.findMany({
      where: {
        department: { contains: dept, mode: "insensitive" as const },
        ...(isNaN(sem) ? {} : { semester: sem }),
        OR: [
          { section: { contains: sectionPattern, mode: "insensitive" as const } },
          { section: { endsWith: sectionPattern, mode: "insensitive" as const } },
        ],
        status: "Active",
      },
      select: {
        id: true,
        rollNumber: true,
        name: true,
        department: true,
        section: true,
        semester: true,
      },
      take: 100,
      orderBy: { rollNumber: "asc" },
    });

    if (students.length === 0) {
      // Fallback: If section specific search returns empty, fetch active department students for that semester
      const deptStudents = await prisma.student.findMany({
        where: {
          department: { contains: dept, mode: "insensitive" as const },
          ...(isNaN(sem) ? {} : { semester: sem }),
          status: "Active",
        },
        select: {
          id: true,
          rollNumber: true,
          name: true,
          department: true,
          section: true,
          semester: true,
        },
        take: 60,
        orderBy: { rollNumber: "asc" },
      });
      students.push(...deptStudents);
    }

    const studentIds = students.map((s) => s.id);

    // Fetch existing attendance records for these students on that date & period
    const existingRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId: { in: studentIds },
        date,
        periodNumber,
      },
    });

    const recordMap: Record<string, string> = {};
    existingRecords.forEach((r) => {
      recordMap[r.userId] = r.status;
    });

    const formatted = students.map((s) => ({
      id: s.id,
      rollNo: s.rollNumber,
      name: s.name,
      department: s.department || dept,
      section: s.section || section,
      semester: s.semester,
      status: (recordMap[s.id] as "Present" | "Absent" | "Late") || "Present",
    }));

    return res.json(formatted);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. BULK TRANSACTIONAL ATTENDANCE MARKING API
// ==========================================
router.post("/mark", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { timetableId, date, periodNumber, records } = req.body;

  if (!date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "date (YYYY-MM-DD) and non-empty records array are required." });
  }

  const period = Number(periodNumber) || 1;

  try {
    const results = await prisma.$transaction(
      records.map((r: { studentId: string; status: string }) =>
        prisma.attendanceRecord.upsert({
          where: {
            userId_date_periodNumber: {
              userId: r.studentId,
              date,
              periodNumber: period,
            },
          },
          update: {
            status: r.status,
            ...(timetableId && { timetableId }),
          },
          create: {
            userId: r.studentId,
            date,
            periodNumber: period,
            status: r.status,
            ...(timetableId && { timetableId }),
          },
        })
      )
    );

    await auditLog(req, "ATTENDANCE_MARKED", "Attendance & Biometrics", "AttendanceRecord", timetableId || date);

    return res.json({
      success: true,
      message: `Successfully recorded attendance for ${results.length} students on ${date} (Period ${period}).`,
      count: results.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. EXPORT ATTENDANCE LOG API
// ==========================================
router.get("/export", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const scope = await resolveDepartmentScope(req, res);
    if (!scope.isAuthorized) return;

    const timeframe = (req.query.timeframe as string) || "all";
    const searchQuery = (req.query.search as string || "").trim();

    const where: any = {};

    if (scope.department) {
      where.user = { department: { contains: scope.department, mode: "insensitive" as const } };
    }

    if (timeframe && timeframe !== "all") {
      const { startDateStr, endDateStr } = getDateBounds(timeframe);
      where.date = { gte: startDateStr, lte: endDateStr };
    }

    if (searchQuery) {
      where.OR = [
        { user: { name: { contains: searchQuery, mode: "insensitive" as const } } },
        { user: { rollNumber: { contains: searchQuery, mode: "insensitive" as const } } },
      ];
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        user: true,
        timetable: { include: { course: true, faculty: true } },
      },
      orderBy: { date: "desc" },
      take: 500,
    });

    await auditLog(
      req,
      "ATTENDANCE_EXPORTED",
      "Attendance & Biometrics",
      "AttendanceRecord",
      scope.department || "All Departments"
    );

    const exportData = records.map((r) => ({
      ID: r.id,
      RollNumber: r.user?.rollNumber || "",
      StudentName: r.user?.name || "",
      Department: r.user?.department || "",
      Semester: r.user?.semester || "",
      Date: r.date,
      Period: r.periodNumber || 1,
      Status: r.status,
      CourseCode: r.timetable?.course?.code || "",
      CourseName: r.timetable?.course?.name || "",
      FacultyName: r.timetable?.faculty?.name || "",
    }));

    return res.json(exportData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. COMPATIBILITY ATTENDANCE ENDPOINTS
// ==========================================

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const records = await prisma.attendanceRecord.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return res.json(records);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { date, status, periodNumber } = req.body;

  if (!date || !status) {
    return res.status(400).json({ error: "Please specify both date (YYYY-MM-DD) and status." });
  }

  const period = Number(periodNumber) || 1;

  try {
    const userId = req.userId!;

    const record = await prisma.attendanceRecord.upsert({
      where: {
        userId_date_periodNumber: { userId, date, periodNumber: period },
      },
      update: {
        status,
      },
      create: {
        userId,
        date,
        periodNumber: period,
        status,
      },
    });

    return res.json({ message: "Attendance logged successfully!", record });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

