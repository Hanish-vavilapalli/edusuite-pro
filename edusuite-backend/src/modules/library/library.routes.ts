import { Router, Response, NextFunction } from "express";
import { prisma } from "../../db";
import { authenticateToken, AuthenticatedRequest } from "../auth/auth.routes";

const router = Router();

// Staff roles permitted to execute librarian operations
const AUTHORIZED_LIBRARY_STAFF = [
  "super_admin",
  "admin",
  "librarian",
  "library_admin",
  "library_staff",
  "principal",
  "vice_principal",
  "academic_dean",
  "student_dean"
];

// Helper to check staff permissions
function isLibraryStaff(role?: string): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/-/g, "_");
  return AUTHORIZED_LIBRARY_STAFF.includes(normalized);
}

// Middleware: Require Librarian / Staff authorization
export function requireLibraryStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.userId || !req.userRole) {
    return res.status(401).json({ error: "Unauthorized. Authentication token required." });
  }

  const role = req.userRole.toLowerCase().replace(/-/g, "_");

  // Explicitly deny HOD users unless they have explicit isLibraryAdmin flag
  if (role === "hod") {
    return res.status(403).json({
      error: "Access denied. HOD role is not authorized for Library Management."
    });
  }

  if (isLibraryStaff(req.userRole)) {
    return next();
  }

  return res.status(403).json({
    error: "Access denied. Insufficient institutional permissions for Library Management."
  });
}

// Audit logger helper
async function logLibraryAction(
  req: AuthenticatedRequest,
  action: string,
  targetEntity: string,
  targetId?: string,
  _details?: string
) {
  try {
    const actorId = req.userId || null;
    let actorName = req.userRole || "User";
    let actorRole = req.userRole || "unknown";

    if (actorId) {
      const admin = await prisma.admin.findUnique({ where: { id: actorId } });
      if (admin) {
        actorName = admin.name;
        actorRole = admin.role;
      } else {
        const student = await prisma.student.findUnique({ where: { id: actorId } });
        if (student) {
          actorName = student.name;
          actorRole = "student";
        } else {
          const faculty = await prisma.faculty.findUnique({ where: { id: actorId } });
          if (faculty) {
            actorName = faculty.name;
            actorRole = faculty.role;
          }
        }
      }
    }

    const ipAddress = (req.headers["x-forwarded-for"]?.toString() || req.ip || "127.0.0.1").split(",")[0];

    await prisma.auditLog.create({
      data: {
        actorId,
        actorName,
        actorRole,
        action,
        module: "Library Management",
        targetEntity,
        targetId,
        status: "Success",
        ipAddress
      }
    });
  } catch (e) {
    console.error("Failed to write library audit log:", e);
  }
}

// Helper to create notifications for members
async function notifyMember(userId: string, title: string, message: string) {
  try {
    await prisma.notification.create({
      data: {
        studentId: userId,
        title,
        message,
        type: "INFO",
        isRead: false
      }
    });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}

// ==========================================
// 1. DASHBOARD ANALYTICS & STATS
// ==========================================
router.get("/dashboard-stats", authenticateToken, requireLibraryStaff, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalBooks = await prisma.libraryBook.count({ where: { status: "Active" } });
    const copiesAgg = await prisma.libraryBook.aggregate({
      where: { status: "Active" },
      _sum: {
        totalCopies: true,
        availableCopies: true,
        issuedCopies: true,
        reservedCopies: true,
        lostCopies: true,
        damagedCopies: true
      }
    });

    const totalCopies = copiesAgg._sum.totalCopies || 0;
    const availableCopies = copiesAgg._sum.availableCopies || 0;
    const issuedCopies = copiesAgg._sum.issuedCopies || 0;
    const reservedCopies = copiesAgg._sum.reservedCopies || 0;

    const overdueBooks = await prisma.bookBorrow.count({
      where: {
        status: "Active",
        dueDate: { lt: new Date() }
      }
    });

    const activeReservations = await prisma.bookReservation.count({
      where: { status: "Pending" }
    });

    const finesAgg = await prisma.libraryFine.aggregate({
      where: { status: "Unpaid" },
      _sum: { amount: true }
    });
    const pendingFines = finesAgg._sum.amount || 0;

    const finesCollectedAgg = await prisma.libraryFine.aggregate({
      where: { status: "Paid" },
      _sum: { paidAmount: true }
    });
    const totalFineCollected = finesCollectedAgg._sum.paidAmount || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayIssues = await prisma.bookBorrow.count({
      where: { issueDate: { gte: todayStart } }
    });

    const todayReturns = await prisma.bookBorrow.count({
      where: { returnDate: { gte: todayStart } }
    });

    const todayVisitors = await prisma.libraryGateEntry.count({
      where: { entryTime: { gte: todayStart } }
    });

    const readingHallOccupancy = await prisma.readingHallSeat.count({
      where: { status: "Occupied" }
    });
    const readingHallCapacity = await prisma.readingHallSeat.count();

    const totalStudents = await prisma.student.count({ where: { status: "Active" } });
    const totalFaculty = await prisma.faculty.count({ where: { status: "Active" } });
    const activeMembers = totalStudents + totalFaculty;

    const totalDigitalResources = await prisma.digitalResource.count();

    // Category breakdown
    const categoryGroups = await prisma.libraryBook.groupBy({
      by: ["category"],
      where: { status: "Active" },
      _sum: { totalCopies: true }
    });
    const categoryWiseBooks = categoryGroups.map(g => ({
      category: g.category,
      count: g._sum.totalCopies || 0
    }));

    // Top borrowed books
    const topBorrowed = await prisma.libraryBook.findMany({
      where: { status: "Active" },
      orderBy: { issuedCopies: "desc" },
      take: 5,
      select: { title: true, issuedCopies: true }
    });

    return res.json({
      totalBooks,
      totalCopies,
      availableCopies,
      issuedBooks: issuedCopies,
      reservedBooks: reservedCopies,
      lostBooks: copiesAgg._sum.lostCopies || 0,
      damagedBooks: copiesAgg._sum.damagedCopies || 0,
      overdueBooks,
      activeMembers,
      pendingReservations: activeReservations,
      pendingFines,
      totalFineCollected,
      todayIssues,
      todayReturns,
      todayVisitors,
      readingHallOccupancy,
      readingHallCapacity: readingHallCapacity || 60,
      totalDigitalResources,
      categoryWiseBooks,
      topBorrowedBooks: topBorrowed.map(b => ({ title: b.title, count: b.issuedCopies }))
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load library stats: " + error.message });
  }
});

// ==========================================
// 2. BOOK CATALOG CRUD
// ==========================================
router.get("/books", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, department, search, availability, page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;

    const where: any = { status: "Active" };

    if (category && category !== "all" && category !== "All") {
      where.category = category as string;
    }
    if (department && department !== "all" && department !== "All") {
      where.department = department as string;
    }
    if (availability === "available") {
      where.availableCopies = { gt: 0 };
    }

    if (search) {
      const q = search as string;
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { isbn: { contains: q, mode: "insensitive" } },
        { accessionNo: { contains: q, mode: "insensitive" } },
        { publisher: { contains: q, mode: "insensitive" } },
        { authors: { hasSome: [q] } }
      ];
    }

    const [total, books] = await Promise.all([
      prisma.libraryBook.count({ where }),
      prisma.libraryBook.findMany({
        where,
        include: {
          copies: true,
          _count: { select: { borrows: true, reservations: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      })
    ]);

    return res.json({
      total,
      page: pageNum,
      limit: limitNum,
      books
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch books: " + error.message });
  }
});

router.get("/books/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const book = await prisma.libraryBook.findUnique({
      where: { id: req.params.id },
      include: {
        copies: true,
        borrows: {
          where: { status: "Active" },
          orderBy: { issueDate: "desc" }
        },
        reservations: {
          where: { status: "Pending" },
          orderBy: { queuePosition: "asc" }
        }
      }
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.json(book);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch book: " + error.message });
  }
});

router.post("/books", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      isbn,
      title,
      authors = [],
      publisher,
      publishedYear,
      edition = "1st Edition",
      category,
      subject,
      department,
      language = "English",
      totalCopies = 1,
      callNumber,
      building = "Central Library",
      floor = "1st Floor",
      rack = "Rack-04",
      shelf = "Shelf-B",
      price = 0,
      source = "Acquisition",
      description,
      coverUrl
    } = req.body;

    if (!isbn || !title || !publisher || !publishedYear || !category) {
      return res.status(400).json({ error: "Missing required fields (ISBN, Title, Publisher, Published Year, Category)." });
    }

    const count = await prisma.libraryBook.count();
    const accessionNo = `GMRIT/${new Date().getFullYear()}/${String(count + 1).padStart(4, "0")}`;
    const barcode = `BC-${Date.now().toString().slice(-8)}`;

    const numCopies = Math.max(1, parseInt(totalCopies, 10) || 1);

    const newBook = await prisma.$transaction(async (tx) => {
      const book = await tx.libraryBook.create({
        data: {
          accessionNo,
          barcode,
          isbn,
          title,
          authors: Array.isArray(authors) ? authors : [authors],
          publisher,
          publishedYear: parseInt(publishedYear, 10),
          edition,
          category,
          subject,
          department,
          language,
          totalCopies: numCopies,
          availableCopies: numCopies,
          issuedCopies: 0,
          callNumber: callNumber || `005.${Math.floor(Math.random() * 900 + 100)}`,
          building,
          floor,
          rack,
          shelf,
          price: parseFloat(price) || 0,
          source,
          description,
          coverUrl
        }
      });

      // Auto-generate physical BookCopy items
      for (let i = 1; i <= numCopies; i++) {
        await tx.bookCopy.create({
          data: {
            bookId: book.id,
            copyNumber: i,
            accessionNo: `${accessionNo}-C${i}`,
            barcode: `${barcode}-${i}`,
            rfidTag: `RFID-${book.id.slice(0, 6)}-${i}`,
            status: "Available",
            condition: "Good",
            building,
            floor,
            rack,
            shelf
          }
        });
      }

      return book;
    });

    await logLibraryAction(req, "BOOK_CREATED", "LibraryBook", newBook.id, `Created book ${newBook.title} (${numCopies} copies)`);

    return res.status(201).json(newBook);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create book: " + error.message });
  }
});

router.put("/books/:id", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    const updated = await prisma.libraryBook.update({
      where: { id },
      data: {
        title: req.body.title ?? existing.title,
        authors: req.body.authors ? (Array.isArray(req.body.authors) ? req.body.authors : [req.body.authors]) : existing.authors,
        publisher: req.body.publisher ?? existing.publisher,
        publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear, 10) : existing.publishedYear,
        edition: req.body.edition ?? existing.edition,
        category: req.body.category ?? existing.category,
        subject: req.body.subject ?? existing.subject,
        department: req.body.department ?? existing.department,
        language: req.body.language ?? existing.language,
        callNumber: req.body.callNumber ?? existing.callNumber,
        rack: req.body.rack ?? existing.rack,
        shelf: req.body.shelf ?? existing.shelf,
        building: req.body.building ?? existing.building,
        floor: req.body.floor ?? existing.floor,
        price: req.body.price !== undefined ? parseFloat(req.body.price) : existing.price,
        description: req.body.description ?? existing.description,
        coverUrl: req.body.coverUrl ?? existing.coverUrl,
        status: req.body.status ?? existing.status
      }
    });

    await logLibraryAction(req, "BOOK_UPDATED", "LibraryBook", updated.id, `Updated book ${updated.title}`);

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update book: " + error.message });
  }
});

router.delete("/books/:id", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.libraryBook.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Soft archive book to preserve historical borrow records
    const archived = await prisma.libraryBook.update({
      where: { id },
      data: { status: "Archived", availableCopies: 0 }
    });

    await logLibraryAction(req, "BOOK_ARCHIVED", "LibraryBook", id, `Archived book ${book.title}`);

    return res.json({ message: "Book archived successfully", book: archived });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to archive book: " + error.message });
  }
});

// ==========================================
// 3. CIRCULATION: ISSUE, RETURN, RENEW
// ==========================================
router.get("/issues", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, borrowerRollNo } = req.query;
    const where: any = {};

    // If student/faculty, only show their own issues
    if (!isLibraryStaff(req.userRole)) {
      where.borrowerId = req.userId;
    } else if (borrowerRollNo) {
      where.borrowerRollNo = borrowerRollNo as string;
    }

    if (status && status !== "all") {
      where.status = status as string;
    }

    const issues = await prisma.bookBorrow.findMany({
      where,
      include: {
        book: true,
        copy: true,
        fines: true
      },
      orderBy: { issueDate: "desc" }
    });

    return res.json(issues);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch issues: " + error.message });
  }
});

router.post("/issue", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookId, copyId, borrowerRollNo, borrowerType = "Student", loanDays } = req.body;

    if (!bookId || !borrowerRollNo) {
      return res.status(400).json({ error: "Book ID and Borrower Roll Number are required." });
    }

    // Look up borrower
    let borrowerName = "Member";
    let borrowerId = "";
    let borrowerDept = "";
    let borrowerEmail = "";

    const normalizedType = borrowerType.toLowerCase();
    if (normalizedType === "student") {
      const student = await prisma.student.findUnique({ where: { rollNumber: borrowerRollNo } });
      if (!student) return res.status(404).json({ error: `Student with roll number ${borrowerRollNo} not found.` });
      if (student.status !== "Active") return res.status(400).json({ error: `Student account is ${student.status}.` });
      borrowerName = student.name;
      borrowerId = student.id;
      borrowerDept = student.department || "CSE";
      borrowerEmail = student.email;
    } else if (normalizedType === "faculty") {
      const faculty = await prisma.faculty.findUnique({ where: { rollNumber: borrowerRollNo } });
      if (!faculty) return res.status(404).json({ error: `Faculty with ID ${borrowerRollNo} not found.` });
      borrowerName = faculty.name;
      borrowerId = faculty.id;
      borrowerDept = faculty.department || "Academic";
      borrowerEmail = faculty.email;
    } else {
      const admin = await prisma.admin.findUnique({ where: { rollNumber: borrowerRollNo } });
      if (!admin) return res.status(404).json({ error: `Staff with ID ${borrowerRollNo} not found.` });
      borrowerName = admin.name;
      borrowerId = admin.id;
      borrowerDept = admin.department || "Staff";
      borrowerEmail = admin.email;
    }

    // Check borrower active loan limit (Student max 4, Faculty max 10)
    const maxLimit = normalizedType === "faculty" ? 10 : 4;
    const activeLoans = await prisma.bookBorrow.count({
      where: { borrowerId, status: "Active" }
    });
    if (activeLoans >= maxLimit) {
      return res.status(400).json({ error: `Borrowing capacity limit reached (${activeLoans}/${maxLimit} books currently active).` });
    }

    // Check unpaid fines
    const unpaidFine = await prisma.libraryFine.findFirst({
      where: { memberId: borrowerId, status: "Unpaid" }
    });
    if (unpaidFine) {
      return res.status(400).json({ error: `Borrower has an outstanding fine of ₹${unpaidFine.amount}. Please clear fine first.` });
    }

    const days = loanDays ? parseInt(loanDays, 10) : (normalizedType === "faculty" ? 30 : 14);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const borrowRecord = await prisma.$transaction(async (tx) => {
      const book = await tx.libraryBook.findUnique({ where: { id: bookId } });
      if (!book) throw new Error("Book not found");
      if (book.availableCopies < 1) throw new Error("No available copies in stock");

      // Find available copy
      let targetCopyId = copyId;
      if (!targetCopyId) {
        const availCopy = await tx.bookCopy.findFirst({
          where: { bookId, status: "Available" }
        });
        if (!availCopy) throw new Error("No physical copy available for issue");
        targetCopyId = availCopy.id;
      } else {
        const specifiedCopy = await tx.bookCopy.findUnique({ where: { id: targetCopyId } });
        if (!specifiedCopy || specifiedCopy.status !== "Available") {
          throw new Error("Specified copy is not available");
        }
      }

      // 1. Create borrow record
      const borrow = await tx.bookBorrow.create({
        data: {
          bookId,
          copyId: targetCopyId,
          borrowerId,
          borrowerType: borrowerType,
          borrowerName,
          borrowerRollNo,
          borrowerEmail,
          borrowerDept,
          dueDate,
          status: "Active",
          issuedBy: req.userRole || "Librarian Desk"
        }
      });

      // 2. Mark copy as Issued
      await tx.bookCopy.update({
        where: { id: targetCopyId },
        data: { status: "Issued" }
      });

      // 3. Decrement available copies, increment issued copies
      await tx.libraryBook.update({
        where: { id: bookId },
        data: {
          availableCopies: { decrement: 1 },
          issuedCopies: { increment: 1 }
        }
      });

      return borrow;
    });

    await logLibraryAction(req, "BOOK_ISSUED", "BookBorrow", borrowRecord.id, `Issued book to ${borrowerName} (${borrowerRollNo})`);
    await notifyMember(borrowerId, "Library Book Issued", `You have borrowed book. Due date is ${dueDate.toLocaleDateString("en-IN")}.`);

    return res.status(201).json(borrowRecord);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Failed to issue book." });
  }
});

router.post("/return", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { issueId, condition = "Good", receivedBy } = req.body;

    if (!issueId) {
      return res.status(400).json({ error: "Issue ID is required." });
    }

    const borrow = await prisma.bookBorrow.findUnique({
      where: { id: issueId },
      include: { book: true, copy: true }
    });

    if (!borrow) {
      return res.status(404).json({ error: "Borrow record not found." });
    }
    if (borrow.status === "Returned") {
      return res.status(400).json({ error: "Book has already been returned." });
    }

    const returnDate = new Date();
    const isOverdue = returnDate > new Date(borrow.dueDate);
    let fineAmount = 0;

    if (isOverdue) {
      const diffTime = Math.abs(returnDate.getTime() - new Date(borrow.dueDate).getTime());
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // ₹5 per day after 2 days grace period
      const chargeableDays = Math.max(0, overdueDays - 2);
      fineAmount = chargeableDays * 5;
    }

    if (condition === "Damaged") {
      fineAmount += 150;
    } else if (condition === "Lost") {
      fineAmount += Math.max(500, borrow.book.price * 2);
    }

    const returnedBorrow = await prisma.$transaction(async (tx) => {
      // 1. Update borrow record
      const updatedBorrow = await tx.bookBorrow.update({
        where: { id: issueId },
        data: {
          returnDate,
          status: "Returned",
          returnCondition: condition,
          receivedBy: receivedBy || req.userRole || "Librarian Desk"
        }
      });

      // 2. Update physical copy status
      const copyStatus = condition === "Lost" ? "Lost" : condition === "Damaged" ? "Damaged" : "Available";
      if (borrow.copyId) {
        await tx.bookCopy.update({
          where: { id: borrow.copyId },
          data: {
            status: copyStatus,
            condition: condition
          }
        });
      }

      // 3. Update book counters
      const bookUpdateData: any = {
        issuedCopies: { decrement: 1 }
      };

      if (copyStatus === "Available") {
        bookUpdateData.availableCopies = { increment: 1 };
      } else if (copyStatus === "Lost") {
        bookUpdateData.lostCopies = { increment: 1 };
      } else if (copyStatus === "Damaged") {
        bookUpdateData.damagedCopies = { increment: 1 };
      }

      await tx.libraryBook.update({
        where: { id: borrow.bookId },
        data: bookUpdateData
      });

      // 4. Create fine if applicable
      if (fineAmount > 0) {
        await tx.libraryFine.create({
          data: {
            borrowId: borrow.id,
            memberId: borrow.borrowerId,
            memberType: borrow.borrowerType,
            memberName: borrow.borrowerName,
            memberRollNo: borrow.borrowerRollNo,
            bookTitle: borrow.book.title,
            amount: fineAmount,
            fineType: condition === "Lost" ? "Lost Book" : condition === "Damaged" ? "Damaged Book" : "Overdue",
            status: "Unpaid"
          }
        });
      }

      return updatedBorrow;
    });

    await logLibraryAction(req, "BOOK_RETURNED", "BookBorrow", issueId, `Returned book (${condition}) with fine ₹${fineAmount}`);

    return res.json({
      message: "Book returned successfully",
      borrow: returnedBorrow,
      fineAmount
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to return book: " + error.message });
  }
});

router.post("/renew", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { issueId, extensionDays = 7 } = req.body;

    if (!issueId) {
      return res.status(400).json({ error: "Issue ID is required." });
    }

    const borrow = await prisma.bookBorrow.findUnique({
      where: { id: issueId },
      include: { book: true }
    });

    if (!borrow) {
      return res.status(404).json({ error: "Borrow record not found." });
    }
    if (borrow.status !== "Active") {
      return res.status(400).json({ error: `Cannot renew a loan that is ${borrow.status}.` });
    }

    // Check renew count limit
    if (borrow.renewCount >= borrow.maxRenewals) {
      return res.status(400).json({ error: `Maximum renewal limit (${borrow.maxRenewals}) reached for this book.` });
    }

    // Check if another member has an active reservation on this book
    const pendingReservation = await prisma.bookReservation.findFirst({
      where: { bookId: borrow.bookId, status: "Pending" }
    });
    if (pendingReservation) {
      return res.status(400).json({ error: "Cannot renew: This title is reserved by another member in the hold queue." });
    }

    const newDueDate = new Date(borrow.dueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(extensionDays, 10));

    const renewed = await prisma.bookBorrow.update({
      where: { id: issueId },
      data: {
        dueDate: newDueDate,
        renewCount: { increment: 1 }
      }
    });

    await logLibraryAction(req, "BOOK_RENEWED", "BookBorrow", issueId, `Renewed book loan due date to ${newDueDate.toLocaleDateString("en-IN")}`);

    return res.json({
      message: "Loan renewed successfully",
      borrow: renewed
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to renew book: " + error.message });
  }
});

// ==========================================
// 4. RESERVATIONS
// ==========================================
router.get("/reservations", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const where: any = {};
    if (!isLibraryStaff(req.userRole)) {
      where.memberId = req.userId;
    }

    const reservations = await prisma.bookReservation.findMany({
      where,
      include: { book: true },
      orderBy: { queuePosition: "asc" }
    });

    return res.json(reservations);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch reservations: " + error.message });
  }
});

router.post("/reservations", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookId, memberRollNo, priority = "Normal", notes } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: "Book ID is required." });
    }

    let targetRollNo = memberRollNo;
    let memberName = "Member";
    let memberId = req.userId || "";
    let memberType = "Student";

    if (isLibraryStaff(req.userRole) && targetRollNo) {
      const s = await prisma.student.findUnique({ where: { rollNumber: targetRollNo } });
      if (s) {
        memberName = s.name;
        memberId = s.id;
      }
    } else {
      const student = await prisma.student.findUnique({ where: { id: memberId } });
      if (student) {
        memberName = student.name;
        targetRollNo = student.rollNumber;
      }
    }

    // Check duplicate reservation
    const existing = await prisma.bookReservation.findFirst({
      where: { bookId, memberId, status: "Pending" }
    });
    if (existing) {
      return res.status(400).json({ error: "You already have an active reservation for this book." });
    }

    const existingCount = await prisma.bookReservation.count({
      where: { bookId, status: "Pending" }
    });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    const reservation = await prisma.$transaction(async (tx) => {
      const resRecord = await tx.bookReservation.create({
        data: {
          bookId,
          memberId,
          memberType,
          memberName,
          memberRollNo: targetRollNo || "STUDENT-001",
          queuePosition: existingCount + 1,
          expiryDate,
          priority,
          notes,
          status: "Pending"
        }
      });

      await tx.libraryBook.update({
        where: { id: bookId },
        data: { reservedCopies: { increment: 1 } }
      });

      return resRecord;
    });

    await logLibraryAction(req, "RESERVATION_CREATED", "BookReservation", reservation.id, `Placed reservation queue #${reservation.queuePosition}`);

    return res.status(201).json(reservation);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to place reservation: " + error.message });
  }
});

router.delete("/reservations/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.bookReservation.findUnique({ where: { id } });
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookReservation.update({
        where: { id },
        data: { status: "Cancelled" }
      });

      await tx.libraryBook.update({
        where: { id: reservation.bookId },
        data: { reservedCopies: { decrement: 1 } }
      });
    });

    await logLibraryAction(req, "RESERVATION_CANCELLED", "BookReservation", id, "Cancelled book reservation");

    return res.json({ message: "Reservation cancelled successfully." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to cancel reservation: " + error.message });
  }
});

// ==========================================
// 5. FINES MANAGEMENT
// ==========================================
router.get("/fines", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const where: any = {};
    if (!isLibraryStaff(req.userRole)) {
      where.memberId = req.userId;
    }

    const fines = await prisma.libraryFine.findMany({
      where,
      include: { borrow: { include: { book: true } } },
      orderBy: { createdAt: "desc" }
    });

    return res.json(fines);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch fines: " + error.message });
  }
});

router.post("/fines/:id/collect", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, paymentMode = "Cash" } = req.body;

    const fine = await prisma.libraryFine.findUnique({ where: { id } });
    if (!fine) {
      return res.status(404).json({ error: "Fine record not found." });
    }

    const paidAmt = amount ? parseFloat(amount) : fine.amount;
    const receiptNo = `RCP-LIB-${Date.now().toString().slice(-6)}`;

    const updated = await prisma.libraryFine.update({
      where: { id },
      data: {
        paidAmount: paidAmt,
        status: paidAmt >= fine.amount ? "Paid" : "Unpaid",
        receiptNo,
        paymentMode,
        paidAt: new Date()
      }
    });

    await logLibraryAction(req, "FINE_COLLECTED", "LibraryFine", id, `Collected fine ₹${paidAmt} (${paymentMode}) - Receipt: ${receiptNo}`);

    return res.json({
      message: "Fine collected successfully.",
      fine: updated,
      receiptNo
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to collect fine: " + error.message });
  }
});

router.post("/fines/:id/waive", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = "Approved by Principal / Dean" } = req.body;

    const fine = await prisma.libraryFine.findUnique({ where: { id } });
    if (!fine) {
      return res.status(404).json({ error: "Fine record not found." });
    }

    const updated = await prisma.libraryFine.update({
      where: { id },
      data: {
        status: "Waived",
        waiveReason: reason,
        waivedBy: req.userRole || "Library Admin"
      }
    });

    await logLibraryAction(req, "FINE_WAIVED", "LibraryFine", id, `Waived fine ₹${fine.amount}. Reason: ${reason}`);

    return res.json({ message: "Fine waived successfully.", fine: updated });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to waive fine: " + error.message });
  }
});

// ==========================================
// 6. READING HALL & SEATS
// ==========================================
router.get("/seats", authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const seats = await prisma.readingHallSeat.findMany({
      orderBy: { seatNo: "asc" }
    });
    return res.json(seats);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch seats: " + error.message });
  }
});

router.post("/seats/allocate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { seatNo, memberRollNo } = req.body;

    if (!seatNo) {
      return res.status(400).json({ error: "Seat number is required." });
    }

    const seat = await prisma.readingHallSeat.findUnique({ where: { seatNo } });
    if (!seat) {
      return res.status(404).json({ error: "Seat not found." });
    }
    if (seat.status === "Occupied") {
      return res.status(400).json({ error: "Seat is already occupied." });
    }

    let memberName = "Student";
    let rollNo = memberRollNo || "21B91A0501";
    let memberId = req.userId || "";

    if (rollNo) {
      const s = await prisma.student.findUnique({ where: { rollNumber: rollNo } });
      if (s) {
        memberName = s.name;
        memberId = s.id;
      }
    }

    const allocated = await prisma.readingHallSeat.update({
      where: { seatNo },
      data: {
        status: "Occupied",
        currentMemberId: memberId,
        currentMemberName: memberName,
        currentRollNo: rollNo,
        entryTime: new Date()
      }
    });

    await logLibraryAction(req, "SEAT_ALLOCATED", "ReadingHallSeat", allocated.id, `Allocated seat ${seatNo} to ${memberName}`);

    return res.json(allocated);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to allocate seat: " + error.message });
  }
});

router.post("/seats/release", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { seatNo } = req.body;
    if (!seatNo) return res.status(400).json({ error: "Seat number is required." });

    const released = await prisma.readingHallSeat.update({
      where: { seatNo },
      data: {
        status: "Available",
        currentMemberId: null,
        currentMemberName: null,
        currentRollNo: null,
        entryTime: null
      }
    });

    return res.json({ message: `Seat ${seatNo} released.`, seat: released });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to release seat: " + error.message });
  }
});

// ==========================================
// 7. GATE ENTRY
// ==========================================
router.get("/gate-entries", authenticateToken, requireLibraryStaff, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const entries = await prisma.libraryGateEntry.findMany({
      orderBy: { entryTime: "desc" },
      take: 100
    });
    return res.json(entries);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch gate entries: " + error.message });
  }
});

router.post("/gate-entries", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { memberRollNo, purpose = "Reading / Study", method = "Barcode", gateNumber = "Main Gate" } = req.body;

    if (!memberRollNo) {
      return res.status(400).json({ error: "Member roll number is required." });
    }

    let memberName = "Visitor";
    let memberId = "";
    let department = "General";
    let memberType = "Student";

    const student = await prisma.student.findUnique({ where: { rollNumber: memberRollNo } });
    if (student) {
      memberName = student.name;
      memberId = student.id;
      department = student.department || "CSE";
    } else {
      const faculty = await prisma.faculty.findUnique({ where: { rollNumber: memberRollNo } });
      if (faculty) {
        memberName = faculty.name;
        memberId = faculty.id;
        department = faculty.department || "Academic";
        memberType = "Faculty";
      }
    }

    const entry = await prisma.libraryGateEntry.create({
      data: {
        memberId: memberId || "GUEST",
        memberType,
        memberName,
        memberRollNo,
        department,
        purpose,
        method,
        gateNumber
      }
    });

    await logLibraryAction(req, "GATE_ENTRY_RECORDED", "LibraryGateEntry", entry.id, `Gate scan for ${memberName} (${memberRollNo})`);

    return res.status(201).json(entry);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to record gate entry: " + error.message });
  }
});

// ==========================================
// 8. ID CARDS
// ==========================================
router.get("/id-cards", authenticateToken, requireLibraryStaff, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const cards = await prisma.libraryIDCard.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.json(cards);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch ID cards: " + error.message });
  }
});

router.post("/id-cards/approve", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cardId, rollNumber } = req.body;
    const where = cardId ? { id: cardId } : { memberRollNo: rollNumber };

    const card = await prisma.libraryIDCard.update({
      where: where as any,
      data: {
        approvalStatus: "Approved",
        issuedAt: new Date()
      }
    });

    await logLibraryAction(req, "ID_CARD_APPROVED", "LibraryIDCard", card.id, `Approved ID Card for ${card.memberName} (${card.memberRollNo})`);

    return res.json({ message: "ID card approved successfully", card });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to approve ID card: " + error.message });
  }
});

router.post("/id-cards/handover", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cardId } = req.body;
    const card = await prisma.libraryIDCard.update({
      where: { id: cardId },
      data: { handoverStatus: "HandedOver" }
    });

    await logLibraryAction(req, "ID_CARD_HANDED_OVER", "LibraryIDCard", card.id, `Handed over ID card to ${card.memberName}`);

    return res.json({ message: "Physical handover confirmed", card });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to confirm handover: " + error.message });
  }
});

// ==========================================
// 9. DIGITAL RESOURCES
// ==========================================
router.get("/digital", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resourceType, department, search } = req.query;
    const where: any = {};

    if (resourceType && resourceType !== "all") where.resourceType = resourceType as string;
    if (department && department !== "all") where.department = department as string;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { subject: { contains: search as string, mode: "insensitive" } },
        { publisher: { contains: search as string, mode: "insensitive" } }
      ];
    }

    const resources = await prisma.digitalResource.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return res.json(resources);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch digital resources: " + error.message });
  }
});

router.post("/digital", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      authors = [],
      resourceType = "Journal",
      publisher = "IEEE",
      publishedYear,
      department,
      subject,
      doi,
      accessLevel = "Campus Only",
      fileUrl = "/resources/sample.pdf"
    } = req.body;

    if (!title || !publishedYear) {
      return res.status(400).json({ error: "Title and Published Year are required." });
    }

    const resource = await prisma.digitalResource.create({
      data: {
        title,
        authors: Array.isArray(authors) ? authors : [authors],
        resourceType,
        publisher,
        publishedYear: parseInt(publishedYear, 10),
        department,
        subject,
        doi,
        accessLevel,
        fileUrl
      }
    });

    return res.status(201).json(resource);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create digital resource: " + error.message });
  }
});

router.post("/digital/:id/download", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await prisma.digitalResource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    });

    return res.json({ fileUrl: resource.fileUrl, downloadCount: resource.downloadCount });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to download resource: " + error.message });
  }
});

// ==========================================
// 10. ACQUISITIONS & AUDIT SESSIONS
// ==========================================
router.get("/acquisitions", authenticateToken, requireLibraryStaff, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const acquisitions = await prisma.libraryAcquisition.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.json(acquisitions);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch acquisitions: " + error.message });
  }
});

router.post("/acquisitions", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vendor, titlesCount = 1, totalQuantity = 10, totalAmount = 0, notes } = req.body;
    const count = await prisma.libraryAcquisition.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const order = await prisma.libraryAcquisition.create({
      data: {
        poNumber,
        vendor: vendor || "Pearson India",
        titlesCount: parseInt(titlesCount, 10) || 1,
        totalQuantity: parseInt(totalQuantity, 10) || 10,
        totalAmount: parseFloat(totalAmount) || 0,
        status: "Ordered",
        requestedBy: req.userRole || "Library Committee",
        notes
      }
    });

    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create acquisition order: " + error.message });
  }
});

router.get("/audit-sessions", authenticateToken, requireLibraryStaff, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await prisma.libraryAuditSession.findMany({
      orderBy: { startedAt: "desc" }
    });
    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch audit sessions: " + error.message });
  }
});

router.post("/audit-sessions", authenticateToken, requireLibraryStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionName = "Annual Central Stock Audit", scope = "All Categories" } = req.body;
    const session = await prisma.libraryAuditSession.create({
      data: {
        sessionName,
        scope,
        startedBy: req.userRole || "Head Librarian",
        status: "InProgress"
      }
    });
    return res.status(201).json(session);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to start audit session: " + error.message });
  }
});

// ==========================================
// 11. STUDENT / FACULTY SELF-SERVICE VIEWS
// ==========================================
router.get("/my-library", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memberId = req.userId;
    if (!memberId) return res.status(401).json({ error: "Unauthorized" });

    const [borrows, reservations, fines] = await Promise.all([
      prisma.bookBorrow.findMany({
        where: { borrowerId: memberId },
        include: { book: true, copy: true },
        orderBy: { issueDate: "desc" }
      }),
      prisma.bookReservation.findMany({
        where: { memberId, status: "Pending" },
        include: { book: true },
        orderBy: { queuePosition: "asc" }
      }),
      prisma.libraryFine.findMany({
        where: { memberId },
        include: { borrow: { include: { book: true } } },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const activeBorrows = borrows.filter(b => b.status === "Active");
    const totalFinesDue = fines.filter(f => f.status === "Unpaid").reduce((sum, f) => sum + f.amount, 0);

    return res.json({
      activeBorrows,
      borrowHistory: borrows,
      reservations,
      fines,
      totalFinesDue
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load student library records: " + error.message });
  }
});

export default router;
