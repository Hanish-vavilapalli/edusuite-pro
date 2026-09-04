import { Router, Response } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";

const router = Router();

// GET /api/courses: Fetch offered courses catalog for active semester
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.student.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    let semester = user.semester || 6;
    if (req.query.semester) {
      semester = Number(req.query.semester);
    }

    // Handle variations in department names (e.g. AI&ML vs AIML)
    const userDept = user.department || "CSE";
    const deptVariations = [
      userDept,
      userDept === "AI&ML" ? "AIML" : userDept === "AIML" ? "AI&ML" : null,
      userDept === "AI&DS" ? "AIDS" : userDept === "AIDS" ? "AI&DS" : null,
      userDept === "MECHANICAL" ? "MECH" : userDept === "MECH" ? "MECHANICAL" : null,
    ].filter(Boolean) as string[];

    // Fetch all courses offered in this semester for student department variations
    const courses = await prisma.course.findMany({
      where: {
        semester,
        department: { in: deptVariations },
        isOffered: true,
        status: "Approved"
      },
    });

    // Fetch existing registrations for this student to append active status flags
    const registrations = await prisma.courseRegistration.findMany({
      where: { studentId: user.id },
    });

    // Map registrations status back to catalog courses
    const mappedCourses = courses.map((c) => {
      const reg = registrations.find((r) => r.courseId === c.id);

      // Parse JSON faculty/sections details to build a human-friendly string
      let facultyString = c.faculty || "Dr. Ravi Kumar";
      try {
        if (c.faculty && c.faculty.startsWith("[")) {
          const sections = JSON.parse(c.faculty);
          if (Array.isArray(sections) && sections.length > 0) {
            const match = sections.find((s: any) => s.section === user.section);
            if (match) {
              facultyString = match.mentor_name;
            } else {
              facultyString = sections[0].mentor_name;
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse faculty json details", e);
      }

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        faculty: facultyString,
        credits: c.credits,
        category: c.category,
        semester: c.semester,
        status: reg ? reg.status : "course_registration",
        isRegistered: reg && reg.status !== "nptel_completed" ? true : false,
      };
    });

    return res.json(mappedCourses);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/courses/register: Moves selected courses to "exam_registration" directly
router.post("/register", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { courseIds } = req.body; // Array of course IDs

  if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ error: "Please select at least one course." });
  }

  try {
    const studentId = req.userId!;

    // Batch upsert course registrations as "exam_registration" status
    const operations = courseIds.map((courseId) =>
      prisma.courseRegistration.upsert({
        where: {
          studentId_courseId: { studentId, courseId },
        },
        update: {
          status: "exam_registration",
        },
        create: {
          studentId,
          courseId,
          status: "exam_registration",
        },
      })
    );

    await Promise.all(operations);
    return res.json({ message: "Courses registered and moved to exam registration successfully!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/courses/nptel: Save NPTEL certificate files and complete verification
router.post("/nptel", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { submissions } = req.body;
  // submissions is array of: { courseId: string, isNptel: boolean, certificateName?: string, comments?: string }

  if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
    return res.status(400).json({ error: "No NPTEL details provided." });
  }

  try {
    const studentId = req.userId!;

    const operations = submissions.map(async (sub) => {
      const { courseId, isNptel, certificateName } = sub;

      if (isNptel) {
        if (!certificateName) {
          throw new Error(`NPTEL certificate upload required for courseId ${courseId}`);
        }

        // Save NPTEL Record log
        await prisma.nptelRecord.upsert({
          where: {
            studentId_courseId: { studentId, courseId },
          },
          update: {
            certificateUrl: certificateName,
          },
          create: {
            studentId,
            courseId,
            certificateUrl: certificateName,
            score: 100,
          },
        });

        // Set status to "nptel_completed" in course registration
        await prisma.courseRegistration.upsert({
          where: {
            studentId_courseId: { studentId, courseId },
          },
          update: {
            status: "nptel_completed",
          },
          create: {
            studentId,
            courseId,
            status: "nptel_completed",
          },
        });
      } else {
        // Not NPTEL course: move it directly to "exam_registration" status
        await prisma.courseRegistration.upsert({
          where: {
            studentId_courseId: { studentId, courseId },
          },
          update: {
            status: "exam_registration",
          },
          create: {
            studentId,
            courseId,
            status: "exam_registration",
          },
        });
      }
    });

    await Promise.all(operations);
    return res.json({ message: "NPTEL details and exam registrations successfully submitted!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/courses/pay-exams: Complete fee payment and register student exams
router.post("/pay-exams", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { courseIds } = req.body;

  if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ error: "Please select at least one course exam for payment." });
  }

  try {
    const studentId = req.userId!;

    const operations = courseIds.map((courseId) =>
      prisma.courseRegistration.update({
        where: {
          studentId_courseId: { studentId, courseId },
        },
        data: {
          status: "exam_registered_paid",
        },
      })
    );

    await Promise.all(operations);
    return res.json({ message: "Exam fees paid and registrations confirmed successfully!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
