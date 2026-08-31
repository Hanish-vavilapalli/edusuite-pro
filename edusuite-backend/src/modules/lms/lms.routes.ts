import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";
import fs from "fs";
import path from "path";

const router = Router();

// Helper to check if faculty is assigned to a course
async function isFacultyAssignedToCourse(facultyId: string, courseId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });
  if (!course) return false;

  // Try parsing JSON format first
  try {
    if (course.faculty && course.faculty.startsWith("[")) {
      const sections = JSON.parse(course.faculty);
      if (Array.isArray(sections)) {
        return sections.some((s: any) => s.mentor_id === facultyId);
      }
    }
  } catch (e) {
    // Ignore JSON error
  }

  // Fallback to name matching
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId }
  });
  if (faculty && course.faculty && course.faculty.includes(faculty.name)) {
    return true;
  }

  // HOD fallback: allow if HOD is in the same department
  if (faculty && faculty.role === "hod" && faculty.department === course.department) {
    return true;
  }

  return false;
}

// GET /api/lms/resources: Get offered LMS resources
router.get("/resources", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resourceType, subjectId, facultyId } = req.query;

    // Student specific filtering: only show enrolled subjects or department-level general resources
    if (req.userRole === "student") {
      const registrations = await prisma.courseRegistration.findMany({
        where: { userId: req.userId },
        select: { courseId: true }
      });
      const courseIds = registrations.map(r => r.courseId);

      const student = await prisma.student.findUnique({
        where: { id: req.userId },
        select: { department: true }
      });

      const resources = await prisma.lmsResource.findMany({
        where: {
          OR: [
            { subjectId: { in: courseIds } },
            { 
              subjectId: null,
              departmentId: student?.department || undefined 
            }
          ],
          resourceType: (resourceType as string) || undefined,
          isPublished: true
        },
        include: {
          faculty: {
            select: { id: true, name: true, email: true, department: true }
          },
          course: true
        },
        orderBy: { createdAt: "desc" }
      });

      const mapped = resources.map((r) => ({
        id: r.id,
        title: r.title,
        type: "PDF Document",
        subject: r.course ? `${r.course.code}: ${r.course.name}` : "General Resource",
        department: r.departmentId || "CSE",
        size: r.fileSize || "0 KB",
        url: r.fileUrl || "",
        uploadedBy: r.faculty.name,
        createdAt: r.createdAt.toISOString().split("T")[0]
      }));

      return res.json(mapped);
    }

    // Faculty or HOD/Admin general query
    const whereClause: any = {};
    if (resourceType) whereClause.resourceType = resourceType as string;
    if (subjectId) whereClause.subjectId = subjectId as string;
    if (facultyId) whereClause.facultyId = facultyId as string;

    const resources = await prisma.lmsResource.findMany({
      where: whereClause,
      include: {
        faculty: {
          select: { id: true, name: true, email: true, department: true }
        },
        course: true
      },
      orderBy: { createdAt: "desc" }
    });

    const mapped = resources.map((r) => ({
      id: r.id,
      title: r.title,
      type: "PDF Document",
      subject: r.course ? `${r.course.code}: ${r.course.name}` : (r.departmentId ? `General Resource (${r.departmentId})` : "General Resource"),
      department: r.departmentId || "CSE",
      size: r.fileSize || "0 KB",
      url: r.fileUrl || "",
      uploadedBy: r.faculty ? r.faculty.name : "Faculty Member",
      createdAt: r.createdAt.toISOString().split("T")[0]
    }));

    return res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lms/videos: Get video lectures
router.get("/videos", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const videos = await prisma.lmsResource.findMany({
      where: { resourceType: "VIDEO_LECTURE" },
      include: {
        faculty: {
          select: { id: true, name: true, email: true, department: true }
        },
        course: true
      },
      orderBy: { createdAt: "desc" }
    });

    const mapped = videos.map((v) => ({
      id: v.id,
      title: v.title,
      subject: v.course ? `${v.course.code}: ${v.course.name}` : (v.departmentId ? `General (${v.departmentId})` : "General Resource"),
      department: v.departmentId || "CSE",
      duration: v.fileSize || "45 mins",
      instructor: v.faculty ? v.faculty.name : "Faculty Member",
      videoUrl: v.videoUrl || "https://www.youtube.com/embed/aircAruvnKk",
      createdAt: v.createdAt.toISOString().split("T")[0]
    }));

    return res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lms/videos: Add a new video lecture
router.post("/videos", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { title, subject, subjectId, duration, videoUrl } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    let faculty = await prisma.faculty.findUnique({ where: { id: req.userId } });
    let facultyId = req.userId!;
    let uploaderName = faculty?.name;

    if (!faculty) {
      const adminUser = await prisma.admin.findUnique({ where: { id: req.userId } });
      if (adminUser) uploaderName = adminUser.name;
      const anyFaculty = await prisma.faculty.findFirst();
      if (anyFaculty) facultyId = anyFaculty.id;
    }

    const newVideo = await prisma.lmsResource.create({
      data: {
        title,
        resourceType: "VIDEO_LECTURE",
        facultyId: facultyId,
        subjectId: subjectId || null,
        departmentId: faculty?.department || "CSE",
        videoUrl: videoUrl || "https://www.youtube.com/embed/aircAruvnKk",
        fileSize: duration || "45 mins",
        isPublished: true
      },
      include: {
        faculty: { select: { name: true } },
        course: true
      }
    });

    const mapped = {
      id: newVideo.id,
      title: newVideo.title,
      subject: newVideo.course ? `${newVideo.course.code}: ${newVideo.course.name}` : (subject || "General Resource"),
      department: newVideo.departmentId || "CSE",
      duration: newVideo.fileSize || "45 mins",
      instructor: uploaderName || (newVideo.faculty ? newVideo.faculty.name : "Faculty Member"),
      videoUrl: newVideo.videoUrl || "https://www.youtube.com/embed/aircAruvnKk",
      createdAt: newVideo.createdAt.toISOString().split("T")[0]
    };

    return res.status(201).json(mapped);
  } catch (error: any) {
    console.error("LMS video creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/lms/videos/:id: Delete video lecture
router.delete("/videos/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.lmsResource.delete({ where: { id } });
    res.json({ message: "Video lecture deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/lms/resources: Alias endpoint for student LMS
router.get(["/student/resources", "/student/lms/resources", "/resources/student"], authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const registrations = await prisma.courseRegistration.findMany({
      where: { userId: req.userId },
      select: { courseId: true }
    });
    const courseIds = registrations.map(r => r.courseId);

    const student = await prisma.student.findUnique({
      where: { id: req.userId },
      select: { department: true }
    });

    const resources = await prisma.lmsResource.findMany({
      where: {
        OR: [
          { subjectId: { in: courseIds } },
          { 
            subjectId: null,
            departmentId: student?.department || undefined 
          }
        ],
        resourceType: (req.query.resourceType as string) || undefined,
        isPublished: true
      },
      include: {
        faculty: {
          select: { id: true, name: true, email: true, department: true }
        },
        course: true
      },
      orderBy: { createdAt: "desc" }
    });

    const mapped = resources.map((r) => ({
      id: r.id,
      title: r.title,
      type: "PDF Document",
      subject: r.course ? `${r.course.code}: ${r.course.name}` : "General Resource",
      department: r.departmentId || "CSE",
      size: r.fileSize || "0 KB",
      url: r.fileUrl || "",
      uploadedBy: r.faculty ? r.faculty.name : "Faculty Member",
      createdAt: r.createdAt.toISOString().split("T")[0]
    }));

    return res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lms/resources/count: Dynamic document count
router.get("/resources/count", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await prisma.lmsResource.count({
      where: { resourceType: "STUDY_NOTE" }
    });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lms/resources: Create new resource (supports base64 PDF upload)
router.post("/resources", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { title, subjectId, resourceType, fileName, fileSize, fileData } = req.body;

  if (!title || !resourceType) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Check roles: only faculty, HOD, or admins allowed
  const isAuthorizedRole = ["faculty", "hod", "admin", "super_admin"].includes(req.userRole || "");
  if (!isAuthorizedRole) {
    return res.status(403).json({ error: "Unauthorized role for uploads." });
  }

  try {
    let departmentId = null;
    let faculty = await prisma.faculty.findUnique({ where: { id: req.userId } });
    let facultyId = req.userId!;
    let uploaderName = faculty?.name;

    if (!faculty) {
      const adminUser = await prisma.admin.findUnique({ where: { id: req.userId } });
      if (adminUser) uploaderName = adminUser.name;
      const anyFaculty = await prisma.faculty.findFirst();
      if (anyFaculty) facultyId = anyFaculty.id;
    }

    if (subjectId) {
      const course = await prisma.course.findUnique({
        where: { id: subjectId }
      });
      if (!course) {
        return res.status(400).json({ error: "Related subject not found." });
      }
      departmentId = course.department;
    } else {
      departmentId = faculty?.department || "CSE";
    }

    let fileUrl = "";
    let finalFileName = fileName || "document.pdf";
    let finalMimeType = "application/pdf";

    // Decode and save base64 file data if present
    if (fileData) {
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid file format. Base64 payload incorrect." });
      }

      finalMimeType = matches[1];
      const base64Content = matches[2];

      if (finalMimeType !== "application/pdf" && !finalFileName.endsWith(".pdf")) {
        return res.status(400).json({ error: "Only PDF files are accepted." });
      }

      const uploadDir = path.join(__dirname, "../../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExt = ".pdf";
      const fileUuid = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = `${fileUuid}${fileExt}`;
      const filePath = path.join(uploadDir, safeName);

      fs.writeFileSync(filePath, Buffer.from(base64Content, "base64"));
      fileUrl = `/uploads/${safeName}`;
    }

    // Save metadata in database
    const resource = await prisma.lmsResource.create({
      data: {
        title,
        resourceType,
        facultyId: facultyId,
        subjectId: subjectId || null,
        departmentId: departmentId,
        fileUrl,
        fileName: finalFileName,
        fileSize: fileSize || "unknown",
        mimeType: finalMimeType,
        isPublished: true
      },
      include: {
        faculty: {
          select: { name: true }
        },
        course: true
      }
    });

    const mapped = {
      id: resource.id,
      title: resource.title,
      type: "PDF Document",
      subject: resource.course ? `${resource.course.code}: ${resource.course.name}` : "General Resource",
      department: resource.departmentId || "CSE",
      size: resource.fileSize || "0 KB",
      url: resource.fileUrl || "",
      uploadedBy: uploaderName || (resource.faculty ? resource.faculty.name : "Faculty Member"),
      createdAt: resource.createdAt.toISOString().split("T")[0]
    };

    res.status(201).json(mapped);
  } catch (error: any) {
    console.error("LMS upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/lms/resources/:id: Deletes study note
router.delete("/resources/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const resource = await prisma.lmsResource.findUnique({
      where: { id }
    });

    if (!resource) {
      return res.status(404).json({ error: "LMS resource not found." });
    }

    // Access control: only owner or admin can delete
    const isOwner = resource.facultyId === req.userId;
    const isAdmin = ["admin", "super_admin"].includes(req.userRole || "");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own this resource." });
    }

    if (resource.fileUrl) {
      const fileName = path.basename(resource.fileUrl);
      const filePath = path.join(__dirname, "../../../uploads", fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete physical file:", e);
        }
      }
    }

    await prisma.lmsResource.delete({
      where: { id }
    });

    res.json({ message: "LMS resource deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-initialize SQL tables for Assignments and Submissions if not present
async function initLmsTables() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS lms_assignments (
        id VARCHAR(100) PRIMARY KEY,
        title TEXT NOT NULL,
        subject_id VARCHAR(100) NOT NULL,
        faculty_id VARCHAR(100) NOT NULL,
        faculty_name VARCHAR(255),
        department_id VARCHAR(100),
        question_paper_url TEXT,
        question_paper_file_name TEXT,
        question_paper_file_size VARCHAR(50),
        mime_type VARCHAR(100) DEFAULT 'application/pdf',
        max_marks INT DEFAULT 30,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS lms_assignment_submissions (
        id VARCHAR(100) PRIMARY KEY,
        assignment_id VARCHAR(100) NOT NULL,
        student_id VARCHAR(100) NOT NULL,
        student_name VARCHAR(255),
        student_roll_number VARCHAR(100),
        answer_file_url TEXT,
        answer_file_name TEXT,
        answer_file_size VARCHAR(50),
        mime_type VARCHAR(100) DEFAULT 'application/pdf',
        question_paper_viewed BOOLEAN DEFAULT FALSE,
        question_paper_viewed_at TIMESTAMP,
        submitted_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'NOT_SUBMITTED',
        marks INT,
        graded_by VARCHAR(255),
        graded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_assignment_student UNIQUE (assignment_id, student_id)
      );
    `);
  } catch (e) {
    console.error("LMS Tables Init Error:", e);
  }
}
initLmsTables();

// ==========================================
// ASSIGNMENTS HUB ENDPOINTS
// ==========================================

// GET /api/lms/assignments: Get assignments for faculty / admin
router.get("/assignments", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isAdmin = ["admin", "super_admin"].includes(req.userRole || "");
    let sql = `SELECT * FROM lms_assignments ORDER BY created_at DESC`;
    let params: any[] = [];

    if (!isAdmin) {
      sql = `SELECT * FROM lms_assignments WHERE faculty_id = $1 ORDER BY created_at DESC`;
      params = [req.userId];
    }

    const assignments: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    const formatted = await Promise.all(
      assignments.map(async (a: any) => {
        // Course info lookup by id or code
        const course = await prisma.course.findFirst({
          where: {
            OR: [
              { id: a.subject_id },
              { code: a.subject_id }
            ]
          }
        });

        const subjectCode = course ? course.code : a.subject_id;
        const subjectName = course ? course.name : "General Course";
        const targetCourseIds = course ? [course.id, course.code] : [a.subject_id];

        // Registered student count for course
        const regCount = await prisma.courseRegistration.count({
          where: {
            OR: [
              { courseId: { in: targetCourseIds } },
              { course: { code: { in: targetCourseIds } } }
            ]
          }
        });

        // Submission counts
        const subRes: any[] = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM lms_assignment_submissions WHERE assignment_id = $1 AND status IN ('SUBMITTED', 'GRADED')`,
          a.id
        );
        const submittedCount = Number(subRes[0]?.count || 0);

        const gradedRes: any[] = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM lms_assignment_submissions WHERE assignment_id = $1 AND status = 'GRADED'`,
          a.id
        );
        const gradedCount = Number(gradedRes[0]?.count || 0);

        return {
          id: a.id,
          title: a.title,
          subjectId: a.subject_id,
          subjectCode,
          subjectName,
          subject: `${subjectCode}: ${subjectName}`,
          facultyId: a.faculty_id,
          facultyName: a.faculty_name || "Faculty",
          department: a.department_id || (course ? course.department : "CSE"),
          questionPaperUrl: a.question_paper_url || "",
          questionPaperFileName: a.question_paper_file_name || "Question_Paper.pdf",
          questionPaperFileSize: a.question_paper_file_size || "1.2 MB",
          maxMarks: a.max_marks || 30,
          status: a.status || "ACTIVE",
          registeredStudentsCount: regCount || 60,
          submittedCount,
          gradedCount,
          pendingGradingCount: Math.max(0, submittedCount - gradedCount),
          createdAt: a.created_at ? new Date(a.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
        };
      })
    );

    res.json(formatted);
  } catch (error: any) {
    console.error("GET /assignments error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lms/assignments: Launch a new assignment
router.post("/assignments", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { title, subjectId, questionPaperData, questionPaperFileName, questionPaperFileSize, maxMarks } = req.body;

  if (!title || !subjectId) {
    return res.status(400).json({ error: "Assignment title and subject are required." });
  }

  if (!questionPaperData) {
    return res.status(400).json({ error: "Question paper PDF file is required." });
  }

  // Security check: faculty must teach subjectId
  const isAdmin = ["admin", "super_admin"].includes(req.userRole || "");
  if (!isAdmin) {
    const isAssigned = await isFacultyAssignedToCourse(req.userId!, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ error: "You are not authorized to create an assignment for this subject." });
    }
  }

  try {
    let faculty = await prisma.faculty.findUnique({ where: { id: req.userId } });
    let facultyName = faculty?.name;

    if (!faculty) {
      const adminUser = await prisma.admin.findUnique({ where: { id: req.userId } });
      if (adminUser) facultyName = adminUser.name;
    }

    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: subjectId },
          { code: subjectId }
        ]
      }
    });
    const departmentId = course?.department || faculty?.department || "CSE";

    // Decode & Save base64 PDF
    let questionPaperUrl = "";
    let finalFileName = questionPaperFileName || "Question_Paper.pdf";

    const matches = questionPaperData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid file format for Question Paper." });
    }

    const base64Content = matches[2];
    const uploadDir = path.join(__dirname, "../../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileUuid = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = `qp_${fileUuid}.pdf`;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, Buffer.from(base64Content, "base64"));
    questionPaperUrl = `/uploads/${safeName}`;

    const assignmentId = `ASN-${Date.now().toString().slice(-6)}`;
    const marks = Number(maxMarks) || 30;

    await prisma.$executeRawUnsafe(
      `INSERT INTO lms_assignments 
       (id, title, subject_id, faculty_id, faculty_name, department_id, question_paper_url, question_paper_file_name, question_paper_file_size, max_marks, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      assignmentId,
      title,
      subjectId,
      req.userId,
      facultyName || "Faculty Member",
      departmentId,
      questionPaperUrl,
      finalFileName,
      questionPaperFileSize || "2.5 MB",
      marks,
      "ACTIVE"
    );

    const targetCourseIds = course ? [course.id, course.code] : [subjectId];
    const regCount = await prisma.courseRegistration.count({
      where: {
        OR: [
          { courseId: { in: targetCourseIds } },
          { course: { code: { in: targetCourseIds } } }
        ]
      }
    });

    const createdObj = {
      id: assignmentId,
      title,
      subjectId,
      subjectCode: course ? course.code : subjectId,
      subjectName: course ? course.name : "Subject",
      subject: course ? `${course.code}: ${course.name}` : "Subject",
      facultyId: req.userId,
      facultyName: facultyName || "Faculty Member",
      department: departmentId,
      questionPaperUrl,
      questionPaperFileName: finalFileName,
      questionPaperFileSize: questionPaperFileSize || "2.5 MB",
      maxMarks: marks,
      status: "ACTIVE",
      registeredStudentsCount: regCount || 60,
      submittedCount: 0,
      gradedCount: 0,
      pendingGradingCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };

    res.status(201).json(createdObj);
  } catch (error: any) {
    console.error("POST /assignments error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lms/assignments/:id: Single assignment detail
router.get("/assignments/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const list: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM lms_assignments WHERE id = $1`, id);
    if (!list || list.length === 0) return res.status(404).json({ error: "Assignment not found." });

    const a = list[0];
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: a.subject_id },
          { code: a.subject_id }
        ]
      }
    });

    res.json({
      id: a.id,
      title: a.title,
      subjectId: a.subject_id,
      subjectCode: course ? course.code : a.subject_id,
      subjectName: course ? course.name : "Subject",
      subject: course ? `${course.code}: ${course.name}` : "Subject",
      facultyId: a.faculty_id,
      facultyName: a.faculty_name || "Faculty",
      department: a.department_id,
      questionPaperUrl: a.question_paper_url,
      questionPaperFileName: a.question_paper_file_name,
      questionPaperFileSize: a.question_paper_file_size,
      maxMarks: a.max_marks || 30,
      status: a.status,
      createdAt: new Date(a.created_at).toISOString().split("T")[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/lms/assignments/:id: Delete assignment
router.delete("/assignments/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM lms_assignment_submissions WHERE assignment_id = $1`, id);
    await prisma.$executeRawUnsafe(`DELETE FROM lms_assignments WHERE id = $1`, id);
    res.json({ message: "Assignment deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lms/assignments/:id/submissions: Faculty views all student submissions for an assignment
router.get("/assignments/:id/submissions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const assignList: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM lms_assignments WHERE id = $1`, id);
    if (!assignList || assignList.length === 0) return res.status(404).json({ error: "Assignment not found." });

    const assignment = assignList[0];

    const targetCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { id: assignment.subject_id },
          { code: assignment.subject_id }
        ]
      }
    });

    const targetCourseIds = targetCourse ? [targetCourse.id, targetCourse.code] : [assignment.subject_id];

    // Find all registered students for assignment's subject
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        OR: [
          { courseId: { in: targetCourseIds } },
          { course: { code: { in: targetCourseIds } } }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, rollNumber: true }
        }
      }
    });

    // Existing submissions from DB
    const dbSubmissions: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM lms_assignment_submissions WHERE assignment_id = $1`,
      id
    );

    const subMap = new Map<string, any>();
    dbSubmissions.forEach((s) => subMap.set(s.student_id, s));

    const result = registrations.map((r) => {
      const student = r.user;
      const sub = subMap.get(student.id);

      return {
        submissionId: sub ? sub.id : null,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        status: sub ? sub.status : "NOT_SUBMITTED",
        questionPaperViewed: sub ? Boolean(sub.question_paper_viewed) : false,
        answerFileUrl: sub ? sub.answer_file_url : null,
        answerFileName: sub ? sub.answer_file_name : null,
        answerFileSize: sub ? sub.answer_file_size : null,
        submittedAt: sub && sub.submitted_at ? new Date(sub.submitted_at).toISOString().split("T")[0] : null,
        marks: sub && sub.marks !== null ? sub.marks : null,
        maxMarks: assignment.max_marks || 30,
        gradedBy: sub ? sub.graded_by : null,
        gradedAt: sub && sub.graded_at ? new Date(sub.graded_at).toISOString().split("T")[0] : null
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error("GET /submissions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lms/assignments/:id/submissions/:submissionId/grade: Faculty grades submission
router.post("/assignments/:id/submissions/:submissionId/grade", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id, submissionId } = req.params;
  const { marks, studentId } = req.body;

  const numericMarks = Number(marks);

  try {
    const assignList: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM lms_assignments WHERE id = $1`, id);
    if (!assignList || assignList.length === 0) return res.status(404).json({ error: "Assignment not found." });

    const assignment = assignList[0];
    const maxMarks = assignment.max_marks || 30;

    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > maxMarks) {
      return res.status(400).json({ error: `Marks must be between 0 and ${maxMarks}.` });
    }

    let faculty = await prisma.faculty.findUnique({ where: { id: req.userId } });
    let graderName = faculty?.name;
    if (!faculty) {
      const adminUser = await prisma.admin.findUnique({ where: { id: req.userId } });
      if (adminUser) graderName = adminUser.name;
    }

    let subRecord: any = null;
    if (submissionId && submissionId !== "new") {
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM lms_assignment_submissions WHERE id = $1`,
        submissionId
      );
      if (existing.length > 0) subRecord = existing[0];
    }

    if (!subRecord && studentId) {
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM lms_assignment_submissions WHERE assignment_id = $1 AND student_id = $2`,
        id,
        studentId
      );
      if (existing.length > 0) subRecord = existing[0];
    }

    if (subRecord) {
      await prisma.$executeRawUnsafe(
        `UPDATE lms_assignment_submissions 
         SET marks = $1, status = 'GRADED', graded_by = $2, graded_at = NOW(), updated_at = NOW() 
         WHERE id = $3`,
        numericMarks,
        graderName || "Faculty Member",
        subRecord.id
      );
    } else if (studentId) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      const newSubId = `SUB-${Date.now().toString().slice(-6)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO lms_assignment_submissions 
         (id, assignment_id, student_id, student_name, student_roll_number, status, marks, graded_by, graded_at, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())`,
        newSubId,
        id,
        studentId,
        student?.name || "Student",
        student?.rollNumber || "22CSE101",
        "GRADED",
        numericMarks,
        graderName || "Faculty Member"
      );
    } else {
      return res.status(400).json({ error: "Missing submission or student identifier." });
    }

    res.json({ message: "Marks saved successfully.", marks: numericMarks });
  } catch (error: any) {
    console.error("POST grade error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// STUDENT ASSIGNMENT ENDPOINTS
// ==========================================

// GET /api/student/lms/assignments: Get assignments for logged-in student
router.get(["/student/lms/assignments", "/student/assignments", "/assignments/student"], authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.userId!;
    
    // 1. Find explicit course registrations
    const registrations = await prisma.courseRegistration.findMany({
      where: { userId: studentId },
      include: { course: true }
    });

    const registeredCourseIds = registrations.map(r => r.courseId);
    const registeredCourseCodes = registrations.map(r => r.course ? r.course.code : "").filter(Boolean);

    // 2. Find student profile for department matching
    const student = await prisma.student.findUnique({ where: { id: studentId } });

    let deptCourseIds: string[] = [];
    let deptCourseCodes: string[] = [];
    if (student) {
      const userDept = student.department || "CSE";
      const deptVariations = [
        userDept,
        userDept === "AI&ML" ? "AIML" : userDept === "AIML" ? "AI&ML" : null,
        userDept === "AI&DS" ? "AIDS" : userDept === "AIDS" ? "AI&DS" : null,
        userDept === "MECHANICAL" ? "MECH" : userDept === "MECH" ? "MECHANICAL" : null,
      ].filter(Boolean) as string[];

      const deptCourses = await prisma.course.findMany({
        where: { department: { in: deptVariations } }
      });

      deptCourseIds = deptCourses.map(c => c.id);
      deptCourseCodes = deptCourses.map(c => c.code);
    }

    const allIdentifiers = Array.from(new Set([
      ...registeredCourseIds,
      ...registeredCourseCodes,
      ...deptCourseIds,
      ...deptCourseCodes
    ]));

    let sql = `SELECT * FROM lms_assignments ORDER BY created_at DESC`;
    let params: any[] = [];

    if (allIdentifiers.length > 0) {
      sql = `SELECT * FROM lms_assignments WHERE subject_id = ANY($1::varchar[]) OR department_id = $2 ORDER BY created_at DESC`;
      params = [allIdentifiers, student?.department || "CSE"];
    }

    let assignments: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    // Fallback: if no assignments match department filter, return all active assignments
    if (assignments.length === 0) {
      assignments = await prisma.$queryRawUnsafe(`SELECT * FROM lms_assignments ORDER BY created_at DESC`);
    }

    const formatted = await Promise.all(
      assignments.map(async (a: any) => {
        const course = await prisma.course.findFirst({
          where: {
            OR: [
              { id: a.subject_id },
              { code: a.subject_id }
            ]
          }
        });
        
        // Find submission record
        const subRes: any[] = await prisma.$queryRawUnsafe(
          `SELECT * FROM lms_assignment_submissions WHERE assignment_id = $1 AND student_id = $2`,
          a.id,
          studentId
        );
        const sub = subRes.length > 0 ? subRes[0] : null;

        let status = "NOT_STARTED";
        if (sub) {
          if (sub.status === "GRADED") status = "GRADED";
          else if (sub.status === "SUBMITTED") status = "SUBMITTED";
          else if (sub.question_paper_viewed) status = "VIEWED";
        }

        return {
          id: a.id,
          title: a.title,
          subjectId: a.subject_id,
          subjectCode: course ? course.code : a.subject_id,
          subjectName: course ? course.name : "Subject",
          subject: course ? `${course.code}: ${course.name}` : a.subject_id,
          facultyName: a.faculty_name || "Faculty",
          questionPaperUrl: a.question_paper_url,
          questionPaperFileName: a.question_paper_file_name,
          questionPaperFileSize: a.question_paper_file_size,
          maxMarks: a.max_marks || 30,
          assignedDate: a.created_at ? new Date(a.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          status,
          questionPaperViewed: sub ? Boolean(sub.question_paper_viewed) : false,
          answerFileUrl: sub ? sub.answer_file_url : null,
          answerFileName: sub ? sub.answer_file_name : null,
          submittedAt: sub && sub.submitted_at ? new Date(sub.submitted_at).toISOString().split("T")[0] : null,
          marks: sub && sub.marks !== null ? sub.marks : null,
          gradedBy: sub ? sub.graded_by : null,
          gradedAt: sub && sub.graded_at ? new Date(sub.graded_at).toISOString().split("T")[0] : null
        };
      })
    );

    // SORTING ALGORITHM FOR STUDENT:
    // Incomplete assignments (NOT_STARTED, VIEWED, SUBMITTED) on TOP
    // Completed assignments (GRADED) on BOTTOM
    const incomplete = formatted.filter(item => item.status !== "GRADED");
    const completed = formatted.filter(item => item.status === "GRADED");

    res.json([...incomplete, ...completed]);
  } catch (error: any) {
    console.error("GET student assignments error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/student/lms/assignments/:id/view-question-paper: Track question paper open action
router.post(["/student/lms/assignments/:id/view-question-paper", "/student/assignments/:id/view-question-paper", "/assignments/:id/view-question-paper"], authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const studentId = req.userId!;

  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM lms_assignment_submissions WHERE assignment_id = $1 AND student_id = $2`,
      id,
      studentId
    );

    if (existing.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE lms_assignment_submissions 
         SET question_paper_viewed = TRUE, question_paper_viewed_at = NOW(), updated_at = NOW() 
         WHERE id = $1`,
        existing[0].id
      );
    } else {
      const subId = `SUB-${Date.now().toString().slice(-6)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO lms_assignment_submissions 
         (id, assignment_id, student_id, student_name, student_roll_number, question_paper_viewed, question_paper_viewed_at, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), 'VIEWED', NOW(), NOW())`,
        subId,
        id,
        studentId,
        student?.name || "Student",
        student?.rollNumber || "22CSE101"
      );
    }

    res.json({ success: true, message: "Question paper view recorded." });
  } catch (error: any) {
    console.error("View question paper error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/student/lms/assignments/:id/submit: Student submits answer PDF
router.post(["/student/lms/assignments/:id/submit", "/student/assignments/:id/submit", "/assignments/:id/submit"], authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const studentId = req.userId!;
  const { answerFileData, answerFileName, answerFileSize } = req.body;

  if (!answerFileData) {
    return res.status(400).json({ error: "Answer copy PDF file is required." });
  }

  try {
    const assignList: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM lms_assignments WHERE id = $1`, id);
    if (!assignList || assignList.length === 0) {
      return res.status(404).json({ error: "Assignment not found." });
    }
    const assignment = assignList[0];

    // Check student course registration
    const isRegistered = await prisma.courseRegistration.findFirst({
      where: { userId: studentId, courseId: assignment.subject_id }
    });
    if (!isRegistered) {
      return res.status(403).json({ error: "You are not registered for this subject." });
    }

    // CHECK QUESTION PAPER VIEWED (REQUIREMENT STEP 25 & 28)
    const existingSub: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM lms_assignment_submissions WHERE assignment_id = $1 AND student_id = $2`,
      id,
      studentId
    );

    const hasViewed = existingSub.length > 0 && Boolean(existingSub[0].question_paper_viewed);
    if (!hasViewed) {
      return res.status(400).json({
        error: "Please open the question paper before submitting your assignment."
      });
    }

    // Decode & Save base64 Answer PDF
    const matches = answerFileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid PDF file format." });
    }

    const base64Content = matches[2];
    const uploadDir = path.join(__dirname, "../../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileUuid = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = `ans_${fileUuid}.pdf`;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, Buffer.from(base64Content, "base64"));
    const answerFileUrl = `/uploads/${safeName}`;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const subRecord = existingSub[0];

    await prisma.$executeRawUnsafe(
      `UPDATE lms_assignment_submissions 
       SET answer_file_url = $1, answer_file_name = $2, answer_file_size = $3, status = 'SUBMITTED', submitted_at = NOW(), updated_at = NOW() 
       WHERE id = $4`,
      answerFileUrl,
      answerFileName || "Answer_Copy.pdf",
      answerFileSize || "3.8 MB",
      subRecord.id
    );

    res.json({
      message: "Assignment submitted successfully.",
      status: "SUBMITTED",
      answerFileUrl,
      submittedAt: new Date().toISOString().split("T")[0]
    });
  } catch (error: any) {
    console.error("POST student submit error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
