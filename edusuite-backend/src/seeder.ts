import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const FIRST_NAMES = [
  "Aarav", "Vihaan", "Aditya", "Sai", "Rahul", "Ananya", "Diya", "Sanya", "Neha", "Arjun",
  "Karan", "Pooja", "Vikram", "Sneha", "Kiran", "Amit", "Sanjay", "Deepak", "Rohan", "Priya",
  "Aditi", "Dev", "Ishaan", "Kabir", "Meera", "Riya", "Shreya", "Tanish", "Varun", "Yash"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Reddy", "Rao", "Patel", "Kumar", "Singh", "Joshi", "Nair",
  "Das", "Sen", "Mehta", "Chawla", "Bose", "Choudhury", "Pillai", "Iyer", "Kulkarni", "Deshmukh",
  "Shastri", "Pandey", "Trivedi", "Mishra", "Dubey", "Rathore", "Saxena", "Roy", "Bannerjee", "Dutta"
];

const BRANCHES = [
  { name: "CSE", code: "CS", emailCode: "cse", fullname: "Computer Science & Engineering" },
  { name: "AI&ML", code: "AM", emailCode: "aiml", fullname: "Artificial Intelligence & Machine Learning" },
  { name: "AI&DS", code: "AD", emailCode: "aids", fullname: "Artificial Intelligence & Data Science" },
  { name: "IT", code: "IT", emailCode: "it", fullname: "Information Technology" },
  { name: "EEE", code: "EE", emailCode: "eee", fullname: "Electrical & Electronics Engineering" },
  { name: "ECE", code: "EC", emailCode: "ece", fullname: "Electronics & Communication Engineering" },
  { name: "CIVIL", code: "CE", emailCode: "civil", fullname: "Civil Engineering" },
  { name: "MECHANICAL", code: "ME", emailCode: "mechanical", fullname: "Mechanical Engineering" }
];

const COURSE_TEMPLATES = [
  { sem: 1, suffix: "101", name: "Programming in C", credits: 4.0, category: "Core" },
  { sem: 1, suffix: "102", name: "Engineering Physics", credits: 3.0, category: "Core" },
  { sem: 2, suffix: "201", name: "Data Structures", credits: 4.0, category: "Core" },
  { sem: 2, suffix: "202", name: "Discrete Mathematics", credits: 3.0, category: "Core" },
  { sem: 3, suffix: "301", name: "Object Oriented Programming", credits: 4.0, category: "Core" },
  { sem: 3, suffix: "302", name: "Database Systems", credits: 4.0, category: "Core" },
  { sem: 4, suffix: "401", name: "Operating Systems", credits: 4.0, category: "Core" },
  { sem: 4, suffix: "402", name: "Design & Analysis of Algorithms", credits: 4.0, category: "Core" },
  { sem: 5, suffix: "501", name: "Web Technologies", credits: 4.0, category: "Core" },
  { sem: 5, suffix: "502", name: "Computer Networks", credits: 4.0, category: "Core" },
  { sem: 6, suffix: "601", name: "Software Engineering", credits: 4.0, category: "Core" },
  { sem: 6, suffix: "602", name: "Compiler Design", credits: 4.0, category: "Core" },
  { sem: 6, suffix: "603", name: "Computer Networks Lab", credits: 2.0, category: "Lab" },
  { sem: 6, suffix: "604", name: "Professional Elective - II", credits: 3.0, category: "Elective" },
  { sem: 6, suffix: "605", name: "Open Elective - I", credits: 3.0, category: "Elective" },
  { sem: 7, suffix: "701", name: "Artificial Intelligence", credits: 4.0, category: "Core" },
  { sem: 7, suffix: "702", name: "Cloud Computing", credits: 4.0, category: "Core" },
  { sem: 8, suffix: "801", name: "Major Project", credits: 8.0, category: "Core" },
  { sem: 8, suffix: "802", name: "Technical Seminar", credits: 2.0, category: "Core" }
];

export async function seedDatabase() {
  console.log("Cleaning database tables...");
  await prisma.nptelRecord.deleteMany({});
  await prisma.courseRegistration.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.notification.deleteMany({});
  
  // Wipe normalized tables
  await prisma.auditLog.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.delegationRule.deleteMany({});
  await prisma.department.deleteMany({});

  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.admin.deleteMany({});
  
  await prisma.course.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 0. Seed Departments, Role Permissions, Delegation Rules & Initial Audit Log
  console.log("Seeding departments, role permissions, and delegation rules...");
  for (const branch of BRANCHES) {
    await prisma.department.create({
      data: {
        name: branch.fullname,
        code: branch.name,
        hodName: `Dr. HOD ${branch.name}`,
        accreditation: "NBA & NAAC A+",
        status: "Active",
      },
    });
  }

  const DEFAULT_ROLES = [
    { role: "super_admin", label: "Super Admin", isSystemAdmin: true, isPrincipal: true, isDean: true, isHod: true, isFaculty: true, isFinance: true, canManageUsers: true, canExportData: true },
    { role: "admin", label: "Operations Admin", isSystemAdmin: true, isPrincipal: false, isDean: false, isHod: false, isFaculty: true, isFinance: false, canManageUsers: true, canExportData: true },
    { role: "principal", label: "Principal", isSystemAdmin: false, isPrincipal: true, isDean: true, isHod: true, isFaculty: true, isFinance: true, canManageUsers: false, canExportData: true },
    { role: "dean", label: "Academic Dean", isSystemAdmin: false, isPrincipal: false, isDean: true, isHod: true, isFaculty: true, isFinance: false, canManageUsers: false, canExportData: true },
    { role: "hod", label: "HOD", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: true, isFaculty: true, isFinance: false, canManageUsers: false, canExportData: true },
    { role: "faculty", label: "Faculty Member", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: true, isFinance: false, canManageUsers: false, canExportData: false },
    { role: "student", label: "Student", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: false, isFinance: false, canManageUsers: false, canExportData: false },
    { role: "finance", label: "Finance Officer", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: false, isFinance: true, canManageUsers: false, canExportData: true },
    { role: "hr", label: "HR Manager", isSystemAdmin: false, isPrincipal: false, isDean: false, isHod: false, isFaculty: false, isFinance: false, canManageUsers: true, canExportData: true },
  ];

  for (const r of DEFAULT_ROLES) {
    await prisma.rolePermission.create({ data: r });
  }

  const DEFAULT_DELEGATIONS = [
    {
      ruleId: "DEL-101",
      moduleName: "Academic Operations & Class Scheduling",
      delegatedRole: "Dean",
      assignedPerson: "Dr. S. K. Gupta (Dean Academics)",
      scope: "Curriculum approval, semester timetable generation, faculty workload balance",
      status: "Active Delegation",
      permissions: JSON.stringify(["Generate Timetable", "Approve Curriculum", "Manage Course Catalog"]),
    },
    {
      ruleId: "DEL-102",
      moduleName: "Departmental Faculty & Student Supervision",
      delegatedRole: "HOD",
      assignedPerson: "Dr. Rajesh Sharma (HOD CSE)",
      scope: "Departmental student roster, proxy faculty allocation, lesson plan review",
      status: "Active Delegation",
      permissions: JSON.stringify(["Approve Lesson Plans", "Assign Proxy Faculty", "Track Syllabus Progress"]),
    },
    {
      ruleId: "DEL-103",
      moduleName: "Institutional Examinations & Grading",
      delegatedRole: "Exam Controller",
      assignedPerson: "Dr. Meera Nambiar (Controller of Exams)",
      scope: "Exam timetable scheduling, hall tickets issuance, internal marks lock",
      status: "Active Delegation",
      permissions: JSON.stringify(["Schedule Examinations", "Publish Results", "Lock Grade Sheets"]),
    },
    {
      ruleId: "DEL-104",
      moduleName: "Financial Operations & Fee Governance",
      delegatedRole: "Finance Manager",
      assignedPerson: "Vikram Malhotra (Chief Finance Officer)",
      scope: "Student fee collection, payroll disbursement, vendor procurement approvals",
      status: "Active Delegation",
      permissions: JSON.stringify(["Manage Student Fees", "Process Staff Payroll", "Approve POs"]),
    },
    {
      ruleId: "DEL-105",
      moduleName: "Talent Management & Faculty Leave Governance",
      delegatedRole: "HR Manager",
      assignedPerson: "Priya Sundaram (HR Director)",
      scope: "Faculty leave approvals, staff recruitment, performance appraisal records",
      status: "Active Delegation",
      permissions: JSON.stringify(["Approve Faculty Leaves", "Manage Employee Records", "Process Appraisals"]),
    },
  ];

  for (const del of DEFAULT_DELEGATIONS) {
    await prisma.delegationRule.create({ data: del });
  }

  await prisma.auditLog.create({
    data: {
      actorName: "System Seeder",
      actorRole: "super_admin",
      action: "DATABASE_SEEDED",
      module: "System Infrastructure",
      status: "Success",
      ipAddress: "127.0.0.1",
    },
  });

  // 1. Seed Default Institution Module Logins
  console.log("Seeding default institution logins...");
  const testLogins = [
    { rollNumber: "SA-ADMIN", name: "Super Admin", email: "superadmin@cms.com", role: "super_admin" },
    { rollNumber: "AD-ADMIN", name: "Rajesh Sharma (Admin)", email: "admin@cms.com", role: "admin" },
    { rollNumber: "PR-DEAN", name: "Dr. Meera Rao", email: "principal@cms.com", role: "principal" },
    { rollNumber: "VP-DEAN", name: "Prof. V. K. Murthy", email: "vice_principal@cms.com", role: "vice_principal" },
    { rollNumber: "DN-ACAD", name: "Prof. Anand Kumar", email: "dean@cms.com", role: "dean" },
    { rollNumber: "AD-ACAD", name: "Prof. Anand Kumar", email: "academicdean@cms.com", role: "academic_dean" },
    { rollNumber: "SD-STUD", name: "Dr. Sunita Sharma", email: "studentdean@cms.com", role: "student_dean" },
    { rollNumber: "IQ-DEAN", name: "Prof. K. V. Raman", email: "iqacdean@cms.com", role: "iqac_dean" },
    { rollNumber: "IM-DEAN", name: "Dr. R. K. Varma", email: "imadean@cms.com", role: "ima_dean" },
    { rollNumber: "RD-DEAN", name: "Dr. A. P. J. Reddy", email: "researchdean@cms.com", role: "research_dean" },
    { rollNumber: "FD-DEAN", name: "Ramesh Agarwal", email: "financedean@cms.com", role: "finance_dean" },
    { rollNumber: "ED-DEAN", name: "Dr. P. V. Ramana", email: "examinationdean@cms.com", role: "examination_dean" },
    { rollNumber: "PD-DEAN", name: "Vikram Malhotra", email: "placementdean@cms.com", role: "placement_dean" },
    { rollNumber: "EX-CELL", name: "Dr. P. V. Ramana (Controller)", email: "examcell@cms.com", role: "exam_cell" },
    { rollNumber: "LB-LIBR", name: "M. N. Swamy (Librarian)", email: "librarian@cms.com", role: "librarian" },
    { rollNumber: "PL-OFFC", name: "Vikram Malhotra (TPO)", email: "placement@cms.com", role: "placement" },
    { rollNumber: "WD-WARD", name: "Col. R. S. Rathore (Warden)", email: "warden@cms.com", role: "warden" },
    { rollNumber: "HOD-CSE", name: "Dr. S. K. Gupta (HOD CSE)", email: "hod@cms.com", role: "hod", department: "CSE" },
    { rollNumber: "FAC-CSE", name: "Dr. Ravi Kumar", email: "faculty@cms.com", role: "faculty", department: "CSE" },
    { rollNumber: "ST-CSE", name: "K. Sai Teja (Student)", email: "student@cms.com", role: "student", department: "CSE", semester: 6 },
    { rollNumber: "PT-CSE", name: "S. Anitha (Parent)", email: "parent@cms.com", role: "parent" },
    { rollNumber: "AD-DESK", name: "Admission Desk Control", email: "admission@cms.com", role: "super_admin" },
    { rollNumber: "TR-MNGR", name: "Gurpreet Singh (Transport)", email: "transport@cms.com", role: "transport" },
    { rollNumber: "AC-FINC", name: "Ramesh Agarwal (Finance)", email: "accounts@cms.com", role: "accounts" },
    { rollNumber: "LM-MNGR", name: "Anita Deshmukh (LMS)", email: "lms@cms.com", role: "lms" },
    { rollNumber: "AL-COOR", name: "Priya Nair (Alumni Coordinator)", email: "alumni.coordinator@cms.com", role: "alumni_coordinator" },
    { rollNumber: "AL-STUD", name: "Sarah Jenkins (Alumni)", email: "alumni@cms.com", role: "alumni" }
  ];

  for (const log of testLogins) {
    const data = {
      rollNumber: log.rollNumber,
      name: log.name,
      email: log.email,
      password: passwordHash,
      role: log.role,
      department: log.department || null,
    };

    if (log.role === "student") {
      await prisma.student.create({
        data: {
          ...data,
          semester: log.semester || 6,
          cgpa: 8.85,
          creditsEarned: 112,
        }
      });
    } else if (log.role === "parent") {
      await prisma.parent.create({ data });
    } else if (log.role === "hod" || log.role === "faculty") {
      await prisma.faculty.create({ data });
    } else {
      await prisma.admin.create({ data });
    }
  }

  // 2. Seed Faculty members (6 faculty per branch)
  console.log("Seeding branch faculty members...");
  for (const branch of BRANCHES) {
    for (let i = 1; i <= 6; i++) {
      const isHod = i === 1;
      const role = isHod ? "hod" : "faculty";

      const fName = FIRST_NAMES[(i + branch.code.charCodeAt(0)) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(i * 3 + branch.code.charCodeAt(1)) % LAST_NAMES.length];
      const name = `${fName} ${lName}${isHod ? " (HOD)" : ""}`;

      const email = `faculty${i}.${branch.emailCode}@cms.com`;
      const rollNumber = `FAC-${branch.code}-${i}`;

      await prisma.faculty.create({
        data: {
          rollNumber,
          name,
          email,
          password: passwordHash,
          role,
          department: branch.name,
        }
      });
    }
  }

  // 3. Seed Course Catalog templates
  console.log("Seeding course catalogs...");
  for (const branch of BRANCHES) {
    for (const temp of COURSE_TEMPLATES) {
      const code = `${branch.code}${temp.suffix}`;
      const fName = FIRST_NAMES[(temp.sem + branch.code.charCodeAt(0)) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(temp.sem * 2 + branch.code.charCodeAt(1)) % LAST_NAMES.length];
      const faculty = `Dr. ${fName} ${lName}`;

      try {
        await prisma.course.upsert({
          where: { code },
          update: { name: temp.name, faculty, credits: temp.credits, category: temp.category, semester: temp.sem, department: branch.name, sections: "A,B,C,D" },
          create: {
            code,
            name: temp.name,
            faculty,
            credits: temp.credits,
            category: temp.category,
            semester: temp.sem,
            department: branch.name,
            sections: "A,B,C,D",
            isOffered: true,
            status: "Active",
          },
        });
      } catch (err) {}
    }
  }

  // 4. Seed Students & Parents (8 branches * 4 years * 2 semesters * 2 sections * 6 students = 768 students + 768 parents = 1536 users total)
  console.log("Generating B.Tech student and parent data list...");
  const parentsToInsert: any[] = [];
  const studentsToInsert: any[] = [];

  for (const branch of BRANCHES) {
    let absoluteStudentIndex = 1;

    for (let year = 1; year <= 4; year++) {
      const yearSuffix = (27 - year).toString();
      for (let semOffset = 1; semOffset <= 2; semOffset++) {
        const semester = (year - 1) * 2 + semOffset;
        for (const section of ["A", "B"]) {
          for (let index = 1; index <= 6; index++) {
            const rollIndex = semOffset === 1 ? index : index + 6;
            const rollNumber = `${yearSuffix}${branch.code}${section}${rollIndex.toString().padStart(2, "0")}`;
            
            const studentEmail = `student${absoluteStudentIndex}.${branch.emailCode}@cms.com`;
            const parentEmail = `student${absoluteStudentIndex}.${branch.emailCode}.parent@cms.com`;

            const seedVal = absoluteStudentIndex + semester * 3 + year * 7 + branch.code.charCodeAt(0);
            const sFName = FIRST_NAMES[seedVal % FIRST_NAMES.length];
            const sLName = LAST_NAMES[(seedVal * 2) % LAST_NAMES.length];
            const studentName = `${sFName} ${sLName}`;

            const pFName = FIRST_NAMES[(seedVal + 5) % FIRST_NAMES.length];
            const parentName = `${pFName} ${sLName} (Parent)`;

            let studentType = "Day Scholar";
            if (index === 3 || index === 4) {
              studentType = "Hostel";
            } else if (index === 5 || index === 6) {
              studentType = "College Bus";
            }

            const studentId = randomUUID();
            const parentId = randomUUID();

            parentsToInsert.push({
              id: parentId,
              rollNumber: `PR-${rollNumber}`,
              name: parentName,
              email: parentEmail,
              password: passwordHash,
              role: "parent",
              department: branch.name,
            });

            studentsToInsert.push({
              id: studentId,
              rollNumber,
              name: studentName,
              email: studentEmail,
              password: passwordHash,
              role: "student",
              department: branch.name,
              semester,
              section,
              year,
              studentType,
              parentId,
              cgpa: Number((7.0 + (seedVal % 30) / 10).toFixed(2)),
              creditsEarned: (semester - 1) * 20,
              avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (seedVal * 100000)}?auto=format&fit=crop&q=80&w=256`
            });

            absoluteStudentIndex++;
          }
        }
      }
    }
  }

  console.log(`Writing ${parentsToInsert.length} parent records to PostgreSQL...`);
  await prisma.parent.createMany({
    data: parentsToInsert,
    skipDuplicates: true,
  });

  console.log(`Writing ${studentsToInsert.length} student records to PostgreSQL...`);
  await prisma.student.createMany({
    data: studentsToInsert,
    skipDuplicates: true,
  });

  console.log("Database seed completed successfully.");
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}

