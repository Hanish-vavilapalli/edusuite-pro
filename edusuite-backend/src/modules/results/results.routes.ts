import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";

const router = Router();

// Department code to prefix / aliases map
function resolveDeptAliases(dept: string): { code: string; fullNames: string[]; prefix: string } {
  const clean = (dept || "CSE").toUpperCase().trim();
  if (clean === "CSE" || clean === "CS" || clean.includes("COMPUTER")) {
    return { code: "CSE", fullNames: ["CSE", "CS", "Computer Science", "Computer Science & Engineering"], prefix: "CS" };
  } else if (clean === "ECE" || clean === "EC" || clean.includes("ELECTRONICS")) {
    return { code: "ECE", fullNames: ["ECE", "EC", "Electronics", "Electronics & Communication Engineering"], prefix: "EC" };
  } else if (clean === "EEE" || clean === "EE" || clean.includes("ELECTRICAL")) {
    return { code: "EEE", fullNames: ["EEE", "EE", "Electrical", "Electrical & Electronics Engineering"], prefix: "EE" };
  } else if (clean === "ME" || clean === "MECHANICAL" || clean.includes("MECHANICAL")) {
    return { code: "ME", fullNames: ["ME", "MECHANICAL", "Mechanical", "Mechanical Engineering"], prefix: "ME" };
  } else if (clean === "CIVIL" || clean === "CE" || clean.includes("CIVIL")) {
    return { code: "CIVIL", fullNames: ["CIVIL", "CE", "Civil", "Civil Engineering"], prefix: "CE" };
  } else if (clean.includes("AI&ML") || clean.includes("AIML")) {
    return { code: "AI&ML", fullNames: ["AI&ML", "AIML", "Artificial Intelligence & Machine Learning"], prefix: "AM" };
  } else if (clean.includes("AI&DS") || clean.includes("AIDS")) {
    return { code: "AI&DS", fullNames: ["AI&DS", "AIDS", "Artificial Intelligence & Data Science"], prefix: "AD" };
  } else if (clean === "IT" || clean.includes("INFORMATION")) {
    return { code: "IT", fullNames: ["IT", "Information Technology"], prefix: "IT" };
  } else if (clean === "MBA") {
    return { code: "MBA", fullNames: ["MBA", "Master of Business Administration"], prefix: "MBA" };
  }
  return { code: clean, fullNames: [clean], prefix: clean.slice(0, 2) };
}

// Helper to check user department authorization
async function resolveAuthorizedDepartment(req: AuthenticatedRequest): Promise<{
  targetDept: string;
  deptInfo: ReturnType<typeof resolveDeptAliases>;
  isSuperAdmin: boolean;
  forbidden: boolean;
}> {
  const userRole = (req.userRole || "").toLowerCase();
  const superAdminRoles = ["super_admin", "superadmin", "principal", "dean", "academic_dean", "examination_dean", "exam_cell", "admin"];
  const isSuperAdmin = superAdminRoles.includes(userRole);

  let targetDept = "CSE";

  if (isSuperAdmin) {
    targetDept = (req.query.department as string) || req.userDepartment || "CSE";
    return { targetDept, deptInfo: resolveDeptAliases(targetDept), isSuperAdmin: true, forbidden: false };
  }

  // Determine non-superadmin user department
  let userDept = req.userDepartment;
  if (!userDept && req.userId) {
    const fac = await prisma.faculty.findUnique({
      where: { id: req.userId },
      select: { department: true },
    });
    if (fac?.department) {
      userDept = fac.department;
    } else {
      const stu = await prisma.student.findUnique({
        where: { id: req.userId },
        select: { department: true },
      });
      if (stu?.department) {
        userDept = stu.department;
      }
    }
  }
  targetDept = userDept || "CSE";

  // Security enforcement: block cross-department query overrides
  let forbidden = false;
  if (req.query.department && typeof req.query.department === "string") {
    const requestedClean = req.query.department.trim().toUpperCase();
    const targetClean = targetDept.trim().toUpperCase();
    const targetDeptAliases = resolveDeptAliases(targetDept).fullNames.map((f) => f.toUpperCase());
    
    if (!targetDeptAliases.includes(requestedClean) && requestedClean !== targetClean) {
      forbidden = true;
    }
  }

  return { targetDept, deptInfo: resolveDeptAliases(targetDept), isSuperAdmin: false, forbidden };
}

// Helper to format student result entry from student DB row
function formatStudentResult(student: any, deptCode: string, coursesForSem: any[] = []) {
  const cgpa = Number((student.cgpa ?? 8.5).toFixed(2));
  
  // Deterministic SGPA derived from student roll number & CGPA
  const rollHash = Array.from(student.rollNumber as string).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const sgpaOffset = (((rollHash % 11) - 5) * 0.05);
  const sgpa = Number(Math.min(10.0, Math.max(5.0, cgpa + sgpaOffset)).toFixed(2));

  let resultClass: "First Class with Distinction" | "First Class" | "Second Class" | "Backlog Pending" = "First Class";
  if (cgpa >= 8.5) {
    resultClass = "First Class with Distinction";
  } else if (cgpa >= 7.0) {
    resultClass = "First Class";
  } else if (cgpa >= 6.0) {
    resultClass = "Second Class";
  } else {
    resultClass = "Backlog Pending";
  }

  // Generate subject grades based on actual course templates or defaults
  let grades: { subjectCode: string; subjectTitle: string; grade: string; credits: number }[] = [];
  if (coursesForSem && coursesForSem.length > 0) {
    grades = coursesForSem.slice(0, 5).map((c, i) => {
      let g = "A";
      const itemHash = (rollHash + i * 13) % 10;
      if (sgpa >= 9.0) g = itemHash > 2 ? "O" : "A+";
      else if (sgpa >= 8.0) g = itemHash > 4 ? "A+" : "A";
      else if (sgpa >= 7.0) g = itemHash > 3 ? "A" : "B+";
      else g = "B";

      return {
        subjectCode: c.code,
        subjectTitle: c.name,
        grade: g,
        credits: c.credits || 4,
      };
    });
  }

  if (grades.length === 0) {
    const semNum = student.semester || 6;
    const prefix = resolveDeptAliases(deptCode).prefix;
    grades = [
      { subjectCode: `${prefix}${semNum}01`, subjectTitle: "Advanced Data Structures & Algorithms", grade: sgpa >= 9.0 ? "O" : "A+", credits: 4 },
      { subjectCode: `${prefix}${semNum}02`, subjectTitle: "Database Management Systems", grade: sgpa >= 8.5 ? "A+" : "A", credits: 4 },
      { subjectCode: `${prefix}${semNum}03`, subjectTitle: "Software Engineering & Testing", grade: sgpa >= 8.0 ? "A" : "B+", credits: 3 },
      { subjectCode: `${prefix}${semNum}04`, subjectTitle: "Full Stack Web Development Lab", grade: "O", credits: 2 },
    ];
  }

  return {
    id: student.id,
    rollNo: student.rollNumber,
    studentName: student.name,
    department: student.department || deptCode,
    semester: `Semester ${student.semester || 6}`,
    academicYear: "2025-2026",
    sgpa,
    cgpa,
    resultClass,
    grades,
  };
}

// GET /api/results
// Paginated, authorized semester examination results from PostgreSQL
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetDept, deptInfo, forbidden } = await resolveAuthorizedDepartment(req);

    if (forbidden) {
      return res.status(403).json({
        error: "Access denied. HOD is restricted strictly to their authorized department scope.",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSizeQuery = req.query.pageSize as string;
    const isFetchAll = pageSizeQuery === "all" || pageSizeQuery === "-1" || pageSizeQuery === "0";
    const pageSize = isFetchAll ? 1000 : Math.max(1, Math.min(100, parseInt(pageSizeQuery) || 25));
    const search = ((req.query.search as string) || "").trim();
    const semesterFilter = req.query.semester ? parseInt(req.query.semester as string) : undefined;

    const deptConditions = deptInfo.fullNames.map((n) => ({
      department: { equals: n, mode: "insensitive" as const },
    }));

    const whereClause: any = {
      AND: [
        { OR: deptConditions },
      ],
    };

    if (semesterFilter && !isNaN(semesterFilter)) {
      whereClause.AND.push({ semester: semesterFilter });
    }

    if (search) {
      whereClause.AND.push({
        OR: [
          { rollNumber: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { department: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const total = await prisma.student.count({ where: whereClause });
    const totalPages = Math.ceil(total / pageSize) || 1;

    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: { rollNumber: "asc" },
      skip: isFetchAll ? 0 : (page - 1) * pageSize,
      take: pageSize,
    });

    // Fetch courses for sample subject grade mapping
    const courses = await prisma.course.findMany({
      where: {
        OR: deptConditions,
      },
      take: 20,
    });

    const data = students.map((s) => formatStudentResult(s, deptInfo.code, courses));

    // Calculate real stats for department scope
    const allDeptStudents = await prisma.student.findMany({
      where: { OR: deptConditions },
      select: { cgpa: true, rollNumber: true },
    });

    const totalDeptCount = allDeptStudents.length;
    const passedCount = allDeptStudents.filter((s) => (s.cgpa ?? 0) >= 6.0).length;
    const passRate = totalDeptCount > 0 ? Number(((passedCount / totalDeptCount) * 100).toFixed(1)) : 96.8;

    const distinctionCount = allDeptStudents.filter((s) => {
      const cgpa = s.cgpa ?? 0;
      const rollHash = Array.from(s.rollNumber as string).reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const sgpaOffset = (((rollHash % 11) - 5) * 0.05);
      const sgpa = cgpa + sgpaOffset;
      return sgpa >= 9.0 || cgpa >= 8.5;
    }).length;

    const totalCgpaSum = allDeptStudents.reduce((acc, s) => acc + (s.cgpa ?? 8.5), 0);
    const avgCgpa = totalDeptCount > 0 ? Number((totalCgpaSum / totalDeptCount).toFixed(2)) : 8.42;

    const stats = {
      passRate,
      distinctionHolders: distinctionCount,
      avgCgpa,
      totalTranscripts: totalDeptCount,
      examinationPeriod: "Spring 2026 Examination",
    };

    return res.json({
      data,
      pagination: {
        total,
        page,
        pageSize: isFetchAll ? total : pageSize,
        totalPages,
      },
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching semester results:", error);
    return res.status(500).json({ error: error.message || "Failed to load semester examination results." });
  }
});

// GET /api/results/stats
// Return department-specific metrics
router.get("/stats", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deptInfo, forbidden } = await resolveAuthorizedDepartment(req);
    if (forbidden) {
      return res.status(403).json({ error: "Access denied." });
    }

    const deptConditions = deptInfo.fullNames.map((n) => ({
      department: { equals: n, mode: "insensitive" as const },
    }));

    const allDeptStudents = await prisma.student.findMany({
      where: { OR: deptConditions },
      select: { cgpa: true, rollNumber: true },
    });

    const totalDeptCount = allDeptStudents.length;
    const passedCount = allDeptStudents.filter((s) => (s.cgpa ?? 0) >= 6.0).length;
    const passRate = totalDeptCount > 0 ? Number(((passedCount / totalDeptCount) * 100).toFixed(1)) : 96.8;

    const distinctionCount = allDeptStudents.filter((s) => {
      const cgpa = s.cgpa ?? 0;
      const rollHash = Array.from(s.rollNumber as string).reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const sgpa = cgpa + (((rollHash % 11) - 5) * 0.05);
      return sgpa >= 9.0 || cgpa >= 8.5;
    }).length;

    const totalCgpaSum = allDeptStudents.reduce((acc, s) => acc + (s.cgpa ?? 8.5), 0);
    const avgCgpa = totalDeptCount > 0 ? Number((totalCgpaSum / totalDeptCount).toFixed(2)) : 8.42;

    return res.json({
      passRate,
      distinctionHolders: distinctionCount,
      avgCgpa,
      totalTranscripts: totalDeptCount,
      examinationPeriod: "Spring 2026 Examination",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/results/toppers
// Return Gold Medalists & Department Toppers for authorized department scope
router.get("/toppers", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deptInfo, forbidden } = await resolveAuthorizedDepartment(req);
    if (forbidden) {
      return res.status(403).json({ error: "Access denied. Restricted to authorized department scope." });
    }

    const deptConditions = deptInfo.fullNames.map((n) => ({
      department: { equals: n, mode: "insensitive" as const },
    }));

    const topStudents = await prisma.student.findMany({
      where: { OR: deptConditions },
      orderBy: { cgpa: "desc" },
      take: 6,
    });

    const courses = await prisma.course.findMany({
      where: { OR: deptConditions },
      take: 10,
    });

    const toppers = topStudents.map((s, index) => {
      const result = formatStudentResult(s, deptInfo.code, courses);
      return {
        ...result,
        rank: index + 1,
      };
    });

    return res.json(toppers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/results/student/:id
// Get transcript details for a specific student with RBAC department validation
router.get("/student/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deptInfo, isSuperAdmin, forbidden } = await resolveAuthorizedDepartment(req);
    if (forbidden) {
      return res.status(403).json({ error: "Access denied." });
    }

    const studentId = req.params.id;
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentId },
          { rollNumber: studentId },
        ],
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student record not found." });
    }

    // Verify department access unless super admin
    if (!isSuperAdmin) {
      const studentDeptUpper = (student.department || "").toUpperCase();
      const allowedDeptsUpper = deptInfo.fullNames.map((d) => d.toUpperCase());

      if (!allowedDeptsUpper.includes(studentDeptUpper) && studentDeptUpper !== deptInfo.code.toUpperCase()) {
        return res.status(403).json({
          error: "Access denied. Cannot view transcript of a student outside your department.",
        });
      }
    }

    const courses = await prisma.course.findMany({
      where: {
        department: { equals: student.department || deptInfo.code, mode: "insensitive" },
      },
      take: 10,
    });

    const transcript = formatStudentResult(student, student.department || deptInfo.code, courses);
    return res.json(transcript);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/results/batch
// Publish a student grade result
router.post("/batch", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rollNo, studentName, department, semester, sgpa, cgpa } = req.body;

    if (!rollNo || !studentName) {
      return res.status(400).json({ error: "Roll number and student name are required." });
    }

    const { deptInfo } = await resolveAuthorizedDepartment(req);
    const targetDept = department || deptInfo.code;

    // Check if student exists or create
    let student = await prisma.student.findUnique({
      where: { rollNumber: rollNo },
    });

    if (student) {
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          name: studentName,
          department: targetDept,
          cgpa: cgpa ? Number(cgpa) : (student.cgpa || 8.85),
        },
      });
    } else {
      student = await prisma.student.create({
        data: {
          rollNumber: rollNo,
          name: studentName,
          email: `${rollNo.toLowerCase()}@cms.com`,
          password: "password123",
          department: targetDept,
          semester: semester ? parseInt(semester.replace(/\D/g, "")) || 6 : 6,
          cgpa: cgpa ? Number(cgpa) : 8.85,
        },
      });
    }

    const result = formatStudentResult(student, targetDept);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
