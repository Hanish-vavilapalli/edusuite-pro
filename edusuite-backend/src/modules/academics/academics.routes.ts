import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";
import { requireSuperAdmin, auditLog } from "../super-admin/super-admin.routes";

const router = Router();

// ==========================================
// 1. DASHBOARD STATISTICS
// ==========================================
router.get("/stats", authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalDepartments = await prisma.department.count();
    const totalCourses = await prisma.course.count();
    const totalCurriculums = await prisma.curriculumScheme.count();

    return res.json({
      totalDepartments,
      totalCourses,
      totalCurriculums,
      accreditationStandard: "NBA & NAAC A+",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. DEPARTMENT APIS
// ==========================================

// GET /api/academics/departments: Fetch all academic departments with dynamic counts
router.get("/departments", authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
    });

    // Initial seed if table is completely empty
    if (departments.length === 0) {
      const initialDepts = [
        { code: "CSE", name: "Computer Science & Engineering", hodName: "Dr. Rajesh K. Varma", accreditation: "NBA & NAAC A+" },
        { code: "ECE", name: "Electronics & Communication Engineering", hodName: "Dr. Meera Nambiar", accreditation: "NBA Accredited" },
        { code: "EEE", name: "Electrical & Electronics Engineering", hodName: "Dr. Suresh Kumar", accreditation: "NAAC A+" },
        { code: "ME", name: "Mechanical Engineering", hodName: "Dr. Sankar Narayan", accreditation: "NBA Accredited" },
        { code: "CE", name: "Civil Engineering", hodName: "Dr. Anand Rao", accreditation: "NAAC A+" },
        { code: "IT", name: "Information Technology", hodName: "Dr. Preethi Menon", accreditation: "NBA Accredited" },
        { code: "AIML", name: "Artificial Intelligence & Machine Learning", hodName: "Dr. Vikram Seth", accreditation: "NAAC A+" },
        { code: "AIDS", name: "Artificial Intelligence & Data Science", hodName: "Prof. Arvind Swaminathan", accreditation: "NAAC A+" },
      ];

      for (const d of initialDepts) {
        await prisma.department.upsert({
          where: { code: d.code },
          update: {},
          create: d,
        });
      }

      departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
    }

    const result = [];
    for (const d of departments) {
      const facultyCount = await prisma.faculty.count({ where: { department: d.name } });
      const studentCount = await prisma.student.count({ where: { department: d.name } });

      const hod = await prisma.faculty.findFirst({
        where: { department: d.name, role: "hod" },
      });
      const hodName = hod ? hod.name : (d.hodName || `Dr. HOD ${d.code}`);

      result.push({
        id: d.id,
        code: d.code,
        name: d.name,
        hodName,
        facultyCount,
        studentCount,
        studentCapacity: studentCount, // Mapped for frontend UI compatibility
        laboratoriesCount: d.code === "CSE" ? 12 : d.code === "ECE" ? 10 : 8,
        accreditation: d.accreditation || "NAAC A+",
        establishedYear: "2002",
        status: d.status,
      });
    }

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/academics/departments: Create new department
router.post("/departments", authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { code, name, hodName, accreditation, status } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: "Department code and name are required." });
  }

  try {
    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ code }, { name }],
      },
    });

    if (existing) {
      return res.status(409).json({ error: `Department with code '${code}' or name '${name}' already exists.` });
    }

    const created = await prisma.department.create({
      data: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        hodName: hodName || null,
        accreditation: accreditation || "NAAC A+",
        status: status || "Active",
      },
    });

    await auditLog(req, "DEPARTMENT_CREATED", "Academic Management", "Department", created.id);

    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. COURSE CATALOG APIS
// ==========================================

// Helper function to map Prisma Course model to frontend shape
function mapCourseToFrontend(c: any) {
  let deptName = "CSE";
  if (c.code.startsWith("CS")) deptName = "CSE";
  else if (c.code.startsWith("AM")) deptName = "AI&ML";
  else if (c.code.startsWith("AD")) deptName = "AI&DS";
  else if (c.code.startsWith("IT")) deptName = "IT";
  else if (c.code.startsWith("EE")) deptName = "EEE";
  else if (c.code.startsWith("EC")) deptName = "ECE";
  else if (c.code.startsWith("CE")) deptName = "CIVIL";
  else if (c.code.startsWith("ME")) deptName = "MECHANICAL";

  return {
    id: c.id,
    code: c.code,
    name: c.name,
    department: deptName,
    semester: `Semester ${c.semester}`,
    credits: c.credits,
    type: c.category === "Lab" ? "Lab Practical" : "Core Theory",
    instructor: c.faculty,
    regulations: "R24 Regulation",
    prerequisite: "None",
    syllabusOverview: "Core course module, laboratory exercises, and continuous evaluation.",
    theoryHours: c.category === "Lab" ? 0 : 3,
    practicalHours: c.category === "Lab" ? 3 : 0,
    status: "Active",
  };
}

// GET /api/academics/courses & GET /api/academic/subjects
router.get(["/courses", "/subjects"], authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const department = req.query.department as string;
  const semesterStr = req.query.semester as string;
  const search = (req.query.search as string || "").toLowerCase();

  try {
    const whereClause: any = {};

    if (department && department !== "All" && department !== "All Departments") {
      let codePrefix = "";
      if (department === "CSE") codePrefix = "CS";
      else if (department === "AI&ML" || department === "AIML") codePrefix = "AM";
      else if (department === "AI&DS" || department === "AIDS") codePrefix = "AD";
      else if (department === "IT") codePrefix = "IT";
      else if (department === "EEE") codePrefix = "EE";
      else if (department === "ECE") codePrefix = "EC";
      else if (department === "CIVIL" || department === "Civil") codePrefix = "CE";
      else if (department === "MECHANICAL" || department === "ME") codePrefix = "ME";

      if (codePrefix) {
        whereClause.code = { startsWith: codePrefix };
      }
    }

    if (semesterStr && semesterStr !== "All" && semesterStr !== "All Semesters") {
      const match = semesterStr.match(/\d+/);
      if (match) {
        whereClause.semester = parseInt(match[0], 10);
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { faculty: { contains: search, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { code: "asc" },
    });

    return res.json(courses.map(mapCourseToFrontend));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/academics/courses & POST /api/academic/subjects: Create course
router.post(["/courses", "/subjects"], authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { code, name, department: _department, semester, credits, type, category, instructor, faculty } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: "Course code and course name are required." });
  }

  try {
    const existing = await prisma.course.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (existing) {
      return res.status(409).json({ error: `Course with code '${code}' already exists.` });
    }

    const semNumber = typeof semester === "number" ? semester : parseInt(String(semester).replace(/\D/g, ""), 10) || 1;

    const created = await prisma.course.create({
      data: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        credits: Number(credits) || 3,
        category: (type && type.includes("Lab")) || category === "Lab" ? "Lab" : "Core",
        semester: semNumber,
        faculty: instructor || faculty || "Dr. Designated Faculty",
      },
    });

    await auditLog(req, "COURSE_CREATED", "Academic Management", "Course", created.id);

    return res.status(201).json(mapCourseToFrontend(created));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/academics/courses/:id: Update course
router.put(["/courses/:id", "/subjects/:id"], authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { code, name, credits, instructor, faculty, type, category, semester } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase().trim() }),
        ...(name && { name: name.trim() }),
        ...(credits !== undefined && { credits: Number(credits) }),
        ...(instructor || faculty ? { faculty: instructor || faculty } : {}),
        ...((type || category) ? { category: (type?.includes("Lab") || category === "Lab") ? "Lab" : "Core" } : {}),
        ...(semester !== undefined ? { semester: typeof semester === "number" ? semester : parseInt(String(semester).replace(/\D/g, ""), 10) || 1 } : {}),
      },
    });

    await auditLog(req, "COURSE_UPDATED", "Academic Management", "Course", id);

    return res.json(mapCourseToFrontend(updated));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/academics/courses/:id: Delete course
router.delete(["/courses/:id", "/subjects/:id"], authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    await prisma.course.delete({ where: { id } });

    await auditLog(req, "COURSE_DELETED", "Academic Management", "Course", id);

    return res.json({ message: "Course deleted successfully." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. CURRICULUM SCHEMES APIS
// ==========================================

// GET /api/academics/curriculum: List curriculum schemes from PostgreSQL
router.get("/curriculum", authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let schemes = await prisma.curriculumScheme.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Seed initial schemes if table is empty
    if (schemes.length === 0) {
      const defaultSchemes = [
        { regulationCode: "R24 Regulation", programName: "B.Tech Computer Science & Engineering", effectiveBatch: "2026-2030", totalCredits: 160, coreTheoryCredits: 80, labCredits: 32, electiveCredits: 28, projectCredits: 20, status: "Active" },
        { regulationCode: "R23 Regulation", programName: "B.Tech Electronics & Communication Eng.", effectiveBatch: "2025-2029", totalCredits: 160, coreTheoryCredits: 82, labCredits: 30, electiveCredits: 28, projectCredits: 20, status: "Active" },
        { regulationCode: "R22 Regulation", programName: "B.Tech Mechanical Engineering", effectiveBatch: "2024-2028", totalCredits: 160, coreTheoryCredits: 84, labCredits: 28, electiveCredits: 28, projectCredits: 20, status: "Archived" },
      ];

      for (const s of defaultSchemes) {
        await prisma.curriculumScheme.upsert({
          where: { regulationCode: s.regulationCode },
          update: {},
          create: s,
        });
      }

      schemes = await prisma.curriculumScheme.findMany({ orderBy: { createdAt: "desc" } });
    }

    return res.json(schemes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/academics/curriculum: Create curriculum scheme
router.post("/curriculum", authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const {
    regulationCode,
    programName,
    effectiveBatch,
    totalCredits,
    coreTheoryCredits,
    labCredits,
    electiveCredits,
    projectCredits,
    status,
  } = req.body;

  if (!regulationCode || !programName || !effectiveBatch) {
    return res.status(400).json({ error: "Regulation code, program name, and effective batch are required." });
  }

  try {
    const existing = await prisma.curriculumScheme.findUnique({
      where: { regulationCode: regulationCode.trim() },
    });

    if (existing) {
      return res.status(409).json({ error: `Curriculum scheme with regulation code '${regulationCode}' already exists.` });
    }

    const created = await prisma.curriculumScheme.create({
      data: {
        regulationCode: regulationCode.trim(),
        programName: programName.trim(),
        effectiveBatch: effectiveBatch.trim(),
        totalCredits: Number(totalCredits) || 160,
        coreTheoryCredits: Number(coreTheoryCredits) || 80,
        labCredits: Number(labCredits) || 32,
        electiveCredits: Number(electiveCredits) || 28,
        projectCredits: Number(projectCredits) || 20,
        status: status || "Active",
      },
    });

    await auditLog(req, "CURRICULUM_SCHEME_CREATED", "Academic Management", "CurriculumScheme", created.id);

    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. MASTER TIMETABLE APIS (POSTGRESQL SINGLE SOURCE OF TRUTH)
// ==========================================

// GET /api/academics/timetable: Fetch authoritative timetable for branch, semester, section
router.get("/timetable", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const branch = (req.query.branch as string || "CSE").toUpperCase().trim();
  const semester = parseInt(req.query.semester as string || "5", 10);
  const section = (req.query.section as string || "Section A").trim();

  try {
    const records = await prisma.masterTimetable.findMany({
      where: { branch, semester, section },
      include: { faculty: true, course: true },
      orderBy: [{ day: "asc" }, { periodNumber: "asc" }],
    });

    const schedule = records.map((r) => ({
      id: r.id,
      day: r.day,
      periodNumber: r.periodNumber,
      startTime: r.startTime,
      endTime: r.endTime,
      subjectCode: r.course ? r.course.code : "",
      subjectName: r.course ? r.course.name : "Assigned Lecture",
      facultyId: r.facultyId || "",
      facultyName: r.faculty ? r.faculty.name : "Faculty Member",
      roomNo: r.roomNo || "LH-101",
      isLab: r.isLab,
      branch: r.branch,
      semester: r.semester,
      section: r.section,
    }));

    return res.json({
      branch,
      semester,
      section,
      academicYear: "2026-2027",
      schedule,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/academics/timetable/update-period: Update single period assignment with conflict validation
router.put("/timetable/update-period", authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { branch, semester, section, day, periodNumber, facultyId, courseId, roomNo, isLab } = req.body;

  if (!branch || !semester || !section || !day || !periodNumber) {
    return res.status(400).json({ error: "branch, semester, section, day, and periodNumber are required." });
  }

  try {
    // Conflict check: Ensure faculty is not teaching another class in the same day and period
    if (facultyId) {
      const facultyClash = await prisma.masterTimetable.findFirst({
        where: {
          day,
          periodNumber: Number(periodNumber),
          facultyId,
          NOT: {
            AND: [
              { branch },
              { semester: Number(semester) },
              { section },
            ],
          },
        },
        include: { faculty: true, course: true },
      });

      if (facultyClash) {
        const facName = facultyClash.faculty ? facultyClash.faculty.name : "Faculty member";
        return res.status(409).json({
          error: `⚠️ CLASH ALERT: ${facName} is already assigned to ${facultyClash.branch}-${facultyClash.semester} (${facultyClash.section}) in Period ${facultyClash.periodNumber} on ${day}!`,
        });
      }
    }

    const updated = await prisma.masterTimetable.upsert({
      where: {
        branch_semester_section_day_periodNumber: {
          branch,
          semester: Number(semester),
          section,
          day,
          periodNumber: Number(periodNumber),
        },
      },
      update: {
        ...(facultyId !== undefined && { facultyId: facultyId || null }),
        ...(courseId !== undefined && { courseId: courseId || null }),
        ...(roomNo !== undefined && { roomNo: roomNo || null }),
        ...(isLab !== undefined && { isLab: Boolean(isLab) }),
      },
      create: {
        branch,
        semester: Number(semester),
        section,
        day,
        periodNumber: Number(periodNumber),
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        facultyId: facultyId || null,
        courseId: courseId || null,
        roomNo: roomNo || null,
        isLab: Boolean(isLab),
      },
    });

    await auditLog(req, "TIMETABLE_PERIOD_UPDATED", "Academic Management", "MasterTimetable", updated.id);

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
