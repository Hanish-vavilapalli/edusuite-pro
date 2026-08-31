// Mock local state storage for the Exam Cell workflow
// Allows developers to test the full flow (Assistant schedule -> Officer approve -> Results consolidation) purely on the frontend.

export interface MockCourseOffering {
  id: string;
  course_code: string;
  course_name: string;
  department: string;
  year: number;
  semester: number;
  credits: number;
  course_type?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  sections: any[];
  enrolledCount?: number;
  registrationsCount?: number;
}

export interface MockExamSchedule {
  id: string;
  name: string;
  type: string;
  department: string;
  year: number;
  semester: number;
  startDate: string;
  endDate: string;
  status: 'Pending Approval' | 'Upcoming' | 'Completed';
  enrollmentDeadline?: string;
  examFee?: number;
}

export interface MockStudent {
  id: string;
  roll_number: string;
  full_name: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  is_registered: boolean;
  mid1_marks?: number;
  assignment_marks?: number;
  external_marks?: number;
  grade?: string;
  status?: string;
  
  attendance_percentage?: number;
  fee_balance?: number;
  hall_ticket_status?: 'Not Generated' | 'Generated';
  is_overridden?: boolean;
}

export interface MockTimetableSlot {
  subjectCode: string;
  subjectName: string;
  examDate: string;
  sessionSlot: string;
  halls: string[];
}

export interface MockExamTimetable {
  id: string;
  examScheduleId: string;
  department: string;
  year: number;
  semester: number;
  status: 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved';
  slots: MockTimetableSlot[];
}

export interface FacultyAssignedSubjectItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  studentCount: number;
  courseType: string;
  credits: number;
  status: 'Draft' | 'In Progress' | 'Submitted to Exam Cell';
  students: {
    roll_number: string;
    name: string;
    attendance: number;
    mid1: number;
    mid2: number;
    assignment: number;
    status: 'Draft' | 'Submitted';
    is_registered: boolean;
  }[];
}

const DEFAULT_COURSES: MockCourseOffering[] = [
  {
    id: 'ece-1',
    course_code: '26ECE301',
    course_name: 'Basic of Programming',
    department: 'ECE',
    year: 1,
    semester: 1,
    credits: 3.0,
    course_type: 'Normal Subject',
    status: 'Approved',
    enrolledCount: 1,
    sections: [
      { section: 'A', dept: 'ECE', mentor_id: 'f_amit', mentor_name: 'Amit Rathore' },
      { section: 'B', dept: 'ECE', mentor_id: 'f_pooja', mentor_name: 'Pooja Chawla' }
    ]
  },
  {
    id: 'ece-2',
    course_code: '26ECE302',
    course_name: 'Digital Signal Processing',
    department: 'ECE',
    year: 1,
    semester: 1,
    credits: 4.0,
    course_type: 'Integrated Subject',
    status: 'Approved',
    enrolledCount: 1,
    sections: [
      { section: 'A', dept: 'ECE', mentor_id: 'f_pooja', mentor_name: 'Pooja Chawla' },
      { section: 'B', dept: 'ECE', mentor_id: 'f_amit', mentor_name: 'Amit Rathore' }
    ]
  },
  {
    id: 'aids-1',
    course_code: '26DS301',
    course_name: 'Java Programming',
    department: 'AIDS',
    year: 1,
    semester: 1,
    credits: 4.0,
    course_type: 'Integrated Subject',
    status: 'Approved',
    enrolledCount: 1,
    sections: [
      { section: 'A', dept: 'AIDS', mentor_id: 'f1', mentor_name: 'Arjun Shastri' },
      { section: 'B', dept: 'AIDS', mentor_id: 'f2', mentor_name: 'Karan Mishra' }
    ]
  },
  {
    id: 'aids-2',
    course_code: '23DS302',
    course_name: 'C Programming',
    department: 'AIDS',
    year: 1,
    semester: 1,
    credits: 3.0,
    course_type: 'Normal Subject',
    status: 'Approved',
    enrolledCount: 1,
    sections: [
      { section: 'A', dept: 'AIDS', mentor_id: 'f2', mentor_name: 'Karan Mishra' },
      { section: 'B', dept: 'AIDS', mentor_id: 'f1', mentor_name: 'Arjun Shastri' }
    ]
  },
  {
    id: 'cse-1',
    course_code: 'CS501',
    course_name: 'Data Structures & Algorithms',
    department: 'CSE',
    year: 3,
    semester: 5,
    credits: 4.0,
    course_type: 'Integrated Subject',
    status: 'Approved',
    enrolledCount: 1,
    sections: [
      { section: 'A', dept: 'CSE', mentor_id: 'f1', mentor_name: 'Arjun Shastri' },
      { section: 'B', dept: 'CSE', mentor_id: 'f3', mentor_name: 'Dr. Suresh Babu' }
    ]
  },
  {
    id: 'cse-2',
    course_code: 'CS502',
    course_name: 'Database Management Systems',
    department: 'CSE',
    year: 3,
    semester: 5,
    credits: 3.0,
    course_type: 'Normal Subject',
    status: 'Approved',
    enrolledCount: 1,
    sections: [
      { section: 'A', dept: 'CSE', mentor_id: 'f3', mentor_name: 'Dr. Suresh Babu' },
      { section: 'B', dept: 'CSE', mentor_id: 'f1', mentor_name: 'Arjun Shastri' }
    ]
  }
];

const DEFAULT_EXAMS: MockExamSchedule[] = [
  { id: 'e1', name: 'B.Tech CSE Sem 5 End Exams 2026', type: 'Regular', department: 'CSE', year: 3, semester: 5, startDate: '2026-08-10', endDate: '2026-08-20', status: 'Upcoming', enrollmentDeadline: '2026-08-08', examFee: 2000 },
  { id: 'e2', name: 'B.Tech AIML Sem 3 Regular Mid-term', type: 'Mid-term', department: 'AIML', year: 2, semester: 3, startDate: '2026-08-15', endDate: '2026-08-22', status: 'Pending Approval', examFee: 1500 },
  { id: 'e3', name: 'B.Tech CSE Sem 1 End Exams 2026', type: 'Regular', department: 'CSE', year: 1, semester: 1, startDate: '2026-11-20', endDate: '2026-11-30', status: 'Upcoming', enrollmentDeadline: '2026-11-15', examFee: 1800 }
];

const DEFAULT_TIMETABLES: MockExamTimetable[] = [
  {
    id: "t1",
    examScheduleId: "e1",
    department: "CSE",
    year: 3,
    semester: 5,
    status: "Approved",
    slots: [
      { subjectCode: "CS301", subjectName: "Formal Languages and Automata", examDate: "2026-08-10", sessionSlot: "FN (09:30 AM - 12:30 PM)", halls: ["Block A - Room 101", "Block A - Room 102"] },
      { subjectCode: "CS302", subjectName: "Computer Networks", examDate: "2026-08-12", sessionSlot: "FN (09:30 AM - 12:30 PM)", halls: ["Block A - Room 101", "Block A - Room 102"] }
    ]
  }
];

const DEFAULT_STUDENTS: MockStudent[] = [
  { id: 's1', roll_number: '26ECA01', full_name: 'Aditi Das', department: 'ECE', year: 1, semester: 1, section: 'A', is_registered: true, mid1_marks: 18, assignment_marks: 8, attendance_percentage: 88, fee_balance: 0, hall_ticket_status: 'Not Generated' },
  { id: 's2', roll_number: '26ECA02', full_name: 'Dev Mehta', department: 'ECE', year: 1, semester: 1, section: 'A', is_registered: false, mid1_marks: 0, assignment_marks: 0, attendance_percentage: 0, fee_balance: 0, hall_ticket_status: 'Not Generated' },
  { id: 's3', roll_number: '26ECA03', full_name: 'Ishaan Bose', department: 'ECE', year: 1, semester: 1, section: 'A', is_registered: false, mid1_marks: 0, assignment_marks: 0, attendance_percentage: 0, fee_balance: 0, hall_ticket_status: 'Not Generated' },
  { id: 's4', roll_number: '26ECA04', full_name: 'Kabir Pillai', department: 'ECE', year: 1, semester: 1, section: 'A', is_registered: false, mid1_marks: 0, assignment_marks: 0, attendance_percentage: 0, fee_balance: 0, hall_ticket_status: 'Not Generated' },
  { id: 's5', roll_number: '26ECA05', full_name: 'Meera Kulkarni', department: 'ECE', year: 1, semester: 1, section: 'A', is_registered: false, mid1_marks: 0, assignment_marks: 0, attendance_percentage: 0, fee_balance: 0, hall_ticket_status: 'Not Generated' },
  { id: 's6', roll_number: '26ECA06', full_name: 'Riya Shastri', department: 'ECE', year: 1, semester: 1, section: 'A', is_registered: false, mid1_marks: 0, assignment_marks: 0, attendance_percentage: 0, fee_balance: 0, hall_ticket_status: 'Not Generated' }
];

const DEFAULT_STUDENT_COURSE_REGISTRATIONS: Record<string, string[]> = {
  "26ECA01": ["26ECE301", "26ECE302"],
  "Aditi Das": ["26ECE301", "26ECE302"],
  "26ADA01": ["26DS301", "23DS302"],
  "24CSA01": ["CS501", "CS502"]
};

const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

export const getMockCourses = (): MockCourseOffering[] => {
  if (!isBrowser) return DEFAULT_COURSES;
  try {
    const data = localStorage.getItem('mock_offered_courses_v3');
    if (!data) {
      localStorage.setItem('mock_offered_courses_v3', JSON.stringify(DEFAULT_COURSES));
      return DEFAULT_COURSES;
    }
    const parsed = JSON.parse(data);
    const combined = [...parsed];
    DEFAULT_COURSES.forEach(dc => {
      if (!combined.some(c => c.course_code === dc.course_code)) {
        combined.push(dc);
      }
    });
    return combined;
  } catch (e) {
    return DEFAULT_COURSES;
  }
};

export const saveMockCourses = (courses: MockCourseOffering[]) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem('mock_offered_courses_v3', JSON.stringify(courses));
  } catch (e) {}
};

export const getMockExams = (): MockExamSchedule[] => {
  if (!isBrowser) return DEFAULT_EXAMS;
  try {
    const data = localStorage.getItem('mock_scheduled_exams_v3');
    if (!data) {
      localStorage.setItem('mock_scheduled_exams_v3', JSON.stringify(DEFAULT_EXAMS));
      return DEFAULT_EXAMS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_EXAMS;
  }
};

export const saveMockExams = (exams: MockExamSchedule[]) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem('mock_scheduled_exams_v3', JSON.stringify(exams));
  } catch (e) {}
};

export const getMockTimetables = (): MockExamTimetable[] => {
  if (!isBrowser) return DEFAULT_TIMETABLES;
  try {
    const data = localStorage.getItem('mock_timetables_v3');
    if (!data) {
      localStorage.setItem('mock_timetables_v3', JSON.stringify(DEFAULT_TIMETABLES));
      return DEFAULT_TIMETABLES;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_TIMETABLES;
  }
};

export const saveMockTimetables = (timetables: MockExamTimetable[]) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem('mock_timetables_v3', JSON.stringify(timetables));
  } catch (e) {}
};

export const getMockStudents = (): MockStudent[] => {
  if (!isBrowser) return DEFAULT_STUDENTS;
  try {
    const data = localStorage.getItem('mock_students_db_v3');
    if (!data) {
      localStorage.setItem('mock_students_db_v3', JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_STUDENTS;
  }
};

export const saveMockStudents = (students: MockStudent[]) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem('mock_students_db_v3', JSON.stringify(students));
  } catch (e) {}
};

export const getStudentCourseRegistrations = (): Record<string, string[]> => {
  if (!isBrowser) return DEFAULT_STUDENT_COURSE_REGISTRATIONS;
  try {
    const data = localStorage.getItem('mock_student_course_registrations');
    if (!data) {
      localStorage.setItem('mock_student_course_registrations', JSON.stringify(DEFAULT_STUDENT_COURSE_REGISTRATIONS));
      return DEFAULT_STUDENT_COURSE_REGISTRATIONS;
    }
    const map: Record<string, string[]> = JSON.parse(data);
    return { ...DEFAULT_STUDENT_COURSE_REGISTRATIONS, ...map };
  } catch (e) {
    return DEFAULT_STUDENT_COURSE_REGISTRATIONS;
  }
};

export const saveStudentCourseRegistration = (identifier: string, courseCode: string) => {
  if (!isBrowser || !identifier) return;
  try {
    const current = getStudentCourseRegistrations();
    const cleanId = identifier.trim();
    const userRegs = current[cleanId] || [];
    if (!userRegs.includes(courseCode)) {
      current[cleanId] = [...userRegs, courseCode];
      localStorage.setItem('mock_student_course_registrations', JSON.stringify(current));
    }
  } catch (e) {}
};

export const toggleStudentCourseRegistration = (identifier: string, courseCode: string) => {
  if (!isBrowser || !identifier) return false;
  try {
    const current = getStudentCourseRegistrations();
    const cleanId = identifier.trim();
    const userRegs = current[cleanId] || [];
    let isNowReg = false;
    if (userRegs.includes(courseCode)) {
      current[cleanId] = userRegs.filter(c => c !== courseCode);
      isNowReg = false;
    } else {
      current[cleanId] = [...userRegs, courseCode];
      isNowReg = true;
    }
    localStorage.setItem('mock_student_course_registrations', JSON.stringify(current));
    return isNowReg;
  } catch (e) {
    return false;
  }
};

// Database-Seeded Student Roster per Section (EXACT 6 students per section matching PostgreSQL DB seeder)
const DB_SECTION_STUDENTS: Record<string, { roll: string; name: string }[]> = {
  "A": [
    { roll: "01", name: "Aditi Das" },
    { roll: "02", name: "Dev Mehta" },
    { roll: "03", name: "Ishaan Bose" },
    { roll: "04", name: "Kabir Pillai" },
    { roll: "05", name: "Meera Kulkarni" },
    { roll: "06", name: "Riya Shastri" }
  ],
  "B": [
    { roll: "01", name: "Shreya Trivedi" },
    { roll: "02", name: "Tanish Dubey" },
    { roll: "03", name: "Varun Saxena" },
    { roll: "04", name: "Yash Bannerjee" },
    { roll: "05", name: "Aarav Sharma" },
    { roll: "06", name: "Vihaan Gupta" }
  ]
};

const getDeptCode = (dept: string) => {
  const clean = (dept || "").toUpperCase();
  if (clean.includes("EC")) return "EC";
  if (clean.includes("AD") || clean.includes("DS")) return "AD";
  if (clean.includes("AM") || clean.includes("ML")) return "AM";
  if (clean.includes("CS")) return "CS";
  if (clean.includes("IT")) return "IT";
  if (clean.includes("EE")) return "EE";
  if (clean.includes("ME")) return "ME";
  if (clean.includes("CE")) return "CE";
  return "EC";
};

const generateStudentsForSection = (dept: string, secLabel: string, courseCode: string, year = 1) => {
  const studentRegsMap = getStudentCourseRegistrations();
  const branchCode = getDeptCode(dept);
  const yearSuffix = (27 - year).toString(); // 26 for 1st Year, 24 for 3rd Year
  const secKey = (secLabel || "A").toUpperCase() === "B" ? "B" : "A";
  const studentTemplates = DB_SECTION_STUDENTS[secKey];

  return studentTemplates.map((st) => {
    const rollNum = `${yearSuffix}${branchCode}${secKey}${st.roll}`;
    const studentName = st.name;

    const rollRegs = studentRegsMap[rollNum] || [];
    const nameRegs = studentRegsMap[studentName] || [];

    // Evaluate exact registration status for this specific course
    const isRegistered = rollRegs.includes(courseCode) || nameRegs.includes(courseCode);

    return {
      roll_number: rollNum,
      name: studentName,
      attendance: isRegistered ? 88 : 0,
      mid1: isRegistered ? 18 : 0,
      mid2: isRegistered ? 17 : 0,
      assignment: isRegistered ? 8 : 0,
      status: "Draft" as const,
      is_registered: isRegistered
    };
  });
};

// Dynamic helper to resolve exact appointed/assigned section subjects for a logged-in faculty
export const getFacultyAssignedSections = (facultyName?: string): FacultyAssignedSubjectItem[] => {
  const courses = getMockCourses();
  let activeName = (facultyName || "").trim();

  if (typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("cms_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u && u.name && (!activeName || activeName === "Arjun Shastri")) {
          activeName = u.name;
        }
      }
    } catch (e) {}
  }
  if (!activeName) activeName = "Pooja Chawla";

  const assigned: FacultyAssignedSubjectItem[] = [];

  courses.forEach(c => {
    // Only pick up courses approved by Exam Cell
    if (c.status !== "Approved") return;

    if (Array.isArray(c.sections)) {
      c.sections.forEach((sec: any) => {
        let mentorName = "";
        let secLabel = "A";

        if (typeof sec === "object" && sec !== null) {
          mentorName = sec.mentor_name || sec.mentorName || "";
          secLabel = sec.section || "A";
        } else if (typeof sec === "string") {
          secLabel = sec;
          mentorName = "Pooja Chawla";
        }

        const isMatch = !mentorName || 
                        mentorName.toLowerCase().includes(activeName.toLowerCase()) || 
                        activeName.toLowerCase().includes(mentorName.toLowerCase());

        if (isMatch) {
          const studentRoster = generateStudentsForSection(c.department, secLabel, c.course_code, c.year || 1);
          const enrolledCount = studentRoster.filter(s => s.is_registered).length || 1;

          assigned.push({
            id: `${c.id}-${secLabel}`,
            subjectCode: c.course_code,
            subjectName: c.course_name,
            department: c.department,
            year: c.year,
            semester: c.semester,
            section: secLabel,
            studentCount: enrolledCount,
            courseType: c.course_type || "Normal Subject",
            credits: c.credits || 3,
            status: 'In Progress',
            students: studentRoster
          });
        }
      });
    }
  });

  return assigned;
};
