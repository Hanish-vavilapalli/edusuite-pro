// =============================================================================
// LIBRARIAN ERP — CENTRALIZED STATE STORE
// Single source of truth for all Librarian ERP modules.
// All business logic, workflows, and auto-updates live here.
// =============================================================================

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { LibraryService } from "@/services/library.service";
import type {
  Book,
  LibraryMember as Member,
  IssueRecord,
  FineRecord,
  BookReservation as Reservation,
  AuditLog,
  LibrarySettings,
  DigitalPaperResource as DigitalResource,
  AcquisitionOrder as AcquisitionRequest,
  LibraryGateEntry as LibraryEntryLog,
} from "../types";

export type LibraryModule =
  | "BookManagement"
  | "IssueBooks"
  | "ReturnBooks"
  | "RenewBooks"
  | "Members"
  | "DigitalLibrary"
  | "Acquisition"
  | "Inventory"
  | "ReadingHall"
  | "LibraryEntry"
  | "FineManagement"
  | "IDCards"
  | "Reservations"
  | "Reports"
  | "Notifications"
  | "Settings"
  | "AuditLogs"
  | "Catalog";

export interface LibraryNotification {
  id: string;
  type: "BookIssued" | "BookReturned" | "DueDateReminder" | "Overdue" | "FineGenerated" | "FinePaid" | "ReservationReady" | "MembershipExpiry" | "NewArrival" | "CardIssued" | "AcquisitionApproved" | "SystemAlert";
  memberId?: string;
  memberName?: string;
  title: string;
  message: string;
  channels: Array<"InApp" | "Email" | "SMS">;
  status: "Sent" | "Delivered" | "Read" | "Failed";
  createdAt: string;
  readAt?: string;
  relatedId?: string;
}

export interface LibraryIDCard {
  id: string;
  cardNo: string;
  memberId: string;
  memberName: string;
  memberType: "Student" | "Faculty" | "Staff" | "Guest";
  memberSourceId: string;
  cardType: "Barcoded" | "RFID" | "SmartCard" | "DigitalQR";
  rfidTag?: string;
  qrData?: string;
  barcode: string;
  issuedAt: string;
  issuedBy: string;
  expiryDate: string;
  status: "Active" | "Blocked" | "Lost" | "Replaced";
  issuanceType: "Original" | "Duplicate";
  printedAt?: string;
}

export interface SeatBookingRecord {
  id: string;
  seatNo: string;
  zone: string;
  memberId: string;
  memberName: string;
  memberType: string;
  memberSourceId: string;
  entryTime: string;
  exitTime?: string;
  durationMinutes?: number;
  date: string;
  verifiedBy?: string;
}

export interface AuditSession {
  id: string;
  sessionName: string;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  status: "InProgress" | "Completed" | "Cancelled";
  scope: string;
  totalScanned: number;
  verified: number;
  missing: number;
  damaged: number;
  extra: number;
  items: any[];
}

export interface RecentActivity {
  id: string;
  action: string;
  description: string;
  user: string;
  timestamp: string;
  module: LibraryModule;
  type: "issue" | "return" | "fine" | "member" | "book";
}

export interface LibraryDashboardStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  reservedBooks: number;
  lostBooks: number;
  damagedBooks: number;
  todayVisitors: number;
  todayIssues: number;
  todayReturns: number;
  activeMembers: number;
  pendingReservations: number;
  totalFineCollected: number;
  pendingFines: number;
  overdueBooks: number;
  activeAuditSessions: number;
  totalDigitalResources: number;
  readingHallOccupancy: number;
  readingHallCapacity: number;
  recentActivities: RecentActivity[];
  monthlyIssuesData: Array<{ month: string; count: number }>;
  categoryWiseBooks: Array<{ category: string; count: number }>;
  topBorrowedBooks: Array<{ title: string; count: number }>;
}

export interface LibraryState {
  books: Book[];
  members: Member[];
  issues: IssueRecord[];
  fines: FineRecord[];
  reservations: Reservation[];
  acquisitions: AcquisitionRequest[];
  auditSessions: AuditSession[];
  digitalResources: DigitalResource[];
  seats: Array<{
    seatNo: string;
    zone: "A" | "B" | "C" | "D";
    status: "Available" | "Occupied" | "Reserved";
    memberId?: string;
    memberName?: string;
    entryTime?: string;
  }>;
  seatBookings: SeatBookingRecord[];
  entryLogs: LibraryEntryLog[];
  idCards: LibraryIDCard[];
  auditLogs: AuditLog[];
  notifications: LibraryNotification[];
  settings: LibrarySettings & {
    loanPeriodStudent: number;
    loanPeriodFaculty: number;
    loanPeriodStaff: number;
    maxBooksStaff?: number;
    finePerDay: number;
    maxFine: number;
    gracePeriod: number;
    lostBookMultiplier: number;
    damagedBookFine: number;
    duplicateCardFee: number;
    reservationPeriod: number;
    membershipDurationStudent: number;
    membershipDurationFaculty: number;
    renewalExtensionDays: number;
    workingHoursStart: string;
    workingHoursEnd: string;
    holidays: Array<{ date: string; name: string; type: string }>;
    barcodeFormat: string;
    qrCodeContent: string;
    smsTemplates: Record<string, string>;
    emailTemplates: Record<string, string>;
    receiptHeader: string;
    receiptFooter: string;
    instituteName: string;
    accessionPrefix: string;
  };
}

export type LibraryAction =
  | { type: "ADD_BOOK"; payload: Omit<Book, "id" | "accessionNo" | "addedAt" | "updatedAt"> | any }
  | { type: "UPDATE_BOOK"; payload: { id: string; updates?: Partial<Book>; [key: string]: any } }
  | { type: "DELETE_BOOK"; payload: { id: string; title?: string } }
  | { type: "ARCHIVE_BOOK"; payload: { id: string } }
  | { type: "RESTORE_BOOK"; payload: { id: string } }
  | { type: "ADD_MEMBER"; payload: Omit<Member, "id" | "memberId" | "currentBorrowedIds" | "pendingFineAmount" | "totalBorrowed" | "totalReturned" | "totalFinesPaid" | "memberSince" | "memberExpiry"> }
  | { type: "ACTIVATE_MEMBER"; payload: { id: string } }
  | { type: "SUSPEND_MEMBER"; payload: { id: string; reason: string; till: string } }
  | { type: "BLOCK_MEMBER"; payload: { id: string; reason: string } }
  | { type: "RENEW_MEMBERSHIP"; payload: { id: string } }
  | { type: "ISSUE_BOOK"; payload: { bookId: string; memberId: string; issuedBy: string } }
  | { type: "RETURN_BOOK"; payload: { issueId: string; condition: "Good" | "Slightly Worn" | "Damaged" | "Lost"; receivedBy: string } }
  | { type: "RENEW_BOOK"; payload: { issueId: string; renewedBy: string } }
  | { type: "COLLECT_FINE"; payload: { fineId: string; amount: number; by: string } }
  | { type: "WAIVE_FINE"; payload: { fineId: string; reason: string; by: string } }
  | { type: "ADD_FINE"; payload: Omit<FineRecord, "id" | "generatedAt" | "receiptNo"> }
  | { type: "PLACE_RESERVATION"; payload: { bookId: string; memberId: string; priority?: "High" | "Normal" | "Low"; notifyMethod?: "SMS" | "Email" | "InApp" | "All"; notes?: string } }
  | { type: "CANCEL_RESERVATION"; payload: { id: string; by: string } }
  | { type: "COLLECT_RESERVATION"; payload: { id: string; by: string } }
  | { type: "ADD_ACQUISITION"; payload: Omit<AcquisitionRequest, "id" | "requestedAt" | "status"> }
  | { type: "UPDATE_ACQUISITION_STATUS"; payload: { id: string; status: AcquisitionRequest["status"]; by: string; notes?: string } }
  | { type: "START_AUDIT"; payload: { sessionName: string; scope: string; by: string } }
  | { type: "COMPLETE_AUDIT"; payload: { sessionId: string; by: string } }
  | { type: "ADD_DIGITAL_RESOURCE"; payload: Omit<DigitalResource, "id" | "uploadedAt" | "downloadCount" | "viewCount"> }
  | { type: "DOWNLOAD_RESOURCE"; payload: { resourceId: string } }
  | { type: "ALLOCATE_SEAT"; payload: { seatNo: string; memberId: string; verifiedBy: string } }
  | { type: "EXIT_SEAT"; payload: { seatNo: string; by: string } }
  | { type: "RECORD_ENTRY"; payload: { memberId: string; method: "RFID" | "QR" | "Manual" } }
  | { type: "RECORD_EXIT"; payload: { memberId: string } }
  | { type: "ISSUE_ID_CARD"; payload: Omit<LibraryIDCard, "id" | "cardNo" | "issuedAt" | "status"> }
  | { type: "UPDATE_CARD_STATUS"; payload: { id: string; status: LibraryIDCard["status"]; by: string } }
  | { type: "MARK_NOTIFICATION_READ"; payload: { id: string } }
  | { type: "UPDATE_SETTINGS"; payload: Partial<LibraryState["settings"]> }
  | { type: "ADD_AUDIT_LOG"; payload: Omit<AuditLog, "id" | "timestamp"> }
  | { type: "SET_LIVE_DATA"; payload: Partial<LibraryState> };

export interface LibraryContextType {
  state: LibraryState;
  dispatch: (action: LibraryAction) => void;
  stats: LibraryDashboardStats;
  getBook: (id: string) => Book | undefined;
  getMember: (id: string) => Member | undefined;
  getIssue: (id: string) => IssueRecord | undefined;
  getMemberIssues: (memberId: string) => IssueRecord[];
  getMemberFines: (memberId: string) => FineRecord[];
  getBookReservations: (bookId: string) => Reservation[];
  getMemberNotifications: (memberId?: string) => LibraryNotification[];
  isOverdue: (issue: IssueRecord) => boolean;
  calculateFine: (issue: IssueRecord) => number;
  canIssueBook: (memberId: string, bookId: string) => { allowed: boolean; reason?: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

let _idCounter = 1;
const genId = (prefix = "ID") => `${prefix}-${Date.now()}-${_idCounter++}`;
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number, from?: string) => {
  const d = from ? new Date(from) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const daysBetween = (a: string, b: string) => {
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const genAccession = (prefix: string, count: number) =>
  `${prefix}/${new Date().getFullYear()}/${String(count).padStart(4, "0")}`;
const genReceiptNo = () => `RCP-${Date.now()}`;
const genCardNo = (count: number) => `LIB-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;
const mockIP = "192.168.1." + Math.floor(Math.random() * 200 + 10);

function makeAudit(
  module: LibraryModule,
  action: string,
  description: string,
  userName = "Librarian",
  role = "Librarian",
  opts: Partial<AuditLog> = {}
): AuditLog {
  return {
    id: genId("AUDIT"),
    userId: "LIB-ADMIN",
    userName,
    role,
    department: "Library",
    module,
    action,
    description,
    ipAddress: mockIP,
    device: "Desktop — Chrome 126",
    timestamp: now(),
    ...opts,
  };
}

function makeNotif(
  state: LibraryState,
  type: LibraryNotification["type"],
  title: string,
  message: string,
  memberId?: string,
  relatedId?: string
): LibraryNotification {
  const member = memberId ? state.members.find((m) => m.id === memberId) : undefined;
  const notif: LibraryNotification = {
    id: genId("NOTIF"),
    type,
    title,
    message,
    channels: ["InApp", "Email", "SMS"],
    status: "Sent",
    createdAt: now(),
  };
  if (memberId) notif.memberId = memberId;
  if (member?.name) notif.memberName = member.name;
  if (relatedId) notif.relatedId = relatedId;
  return notif;
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const SEED_SETTINGS: LibraryState["settings"] = {
  loanDaysStudent: 14,
  loanDaysFaculty: 30,
  loanPeriodStudent: 14,
  loanPeriodFaculty: 30,
  loanPeriodStaff: 21,
  maxBooksStudent: 3,
  maxBooksFaculty: 10,
  maxBooksStaff: 5,
  finePerDay: 5,
  maxFine: 500,
  gracePeriod: 0,
  lostBookMultiplier: 3,
  damagedBookFine: 200,
  duplicateCardFee: 50,
  reservationPeriod: 3,
  membershipDurationStudent: 4,
  membershipDurationFaculty: 5,
  maxRenewals: 2,
  renewalExtensionDays: 14,
  workingHoursStart: "08:00",
  workingHoursEnd: "20:00",
  holidays: [
    { date: "2026-08-15", name: "Independence Day", type: "National" },
    { date: "2026-10-02", name: "Gandhi Jayanti", type: "National" },
    { date: "2026-01-26", name: "Republic Day", type: "National" },
    { date: "2026-11-14", name: "Children's Day", type: "National" },
  ],
  barcodeFormat: "Code128",
  qrCodeContent: "AccessionISBN",
  smsTemplates: {
    BookIssued: "Dear {name}, Book '{book}' issued. Due: {due}. — GMRIT Library",
    BookReturned: "Dear {name}, Book '{book}' returned. Thank you! — GMRIT Library",
    DueDateReminder: "Dear {name}, '{book}' due in 2 days on {due}. Please return. — GMRIT Library",
    Overdue: "Dear {name}, '{book}' is {days} days overdue. Fine: ₹{fine}. — GMRIT Library",
    FineGenerated: "Dear {name}, Fine of ₹{fine} generated for '{book}'. — GMRIT Library",
    FinePaid: "Dear {name}, Fine of ₹{fine} received. Receipt: {receipt}. — GMRIT Library",
    ReservationReady: "Dear {name}, '{book}' reserved copy available. Collect in 3 days. — GMRIT Library",
    MembershipExpiry: "Dear {name}, Library membership expires on {date}. Renew now. — GMRIT Library",
    NewArrival: "New books arrived: '{book}' — Now available at GMRIT Library.",
    CardIssued: "Dear {name}, Library ID Card issued. Card No: {card}. — GMRIT Library",
    AcquisitionApproved: "Book acquisition '{title}' approved by Principal. PO being raised. — Library",
    SystemAlert: "GMRIT Library System: {message}",
  },
  emailTemplates: {} as any,
  receiptHeader: "GMRIT Central Library\nRajam, Srikakulam — 532127\nTel: 08942-XXXXXX",
  receiptFooter: "Thank you for using GMRIT Library. Please return books on time.",
  instituteName: "GMRIT",
  libraryName: "GMRIT Central Library",
  accessionPrefix: "GMRIT",
  autoSendOverdueEmail: true,
  enableRfidGates: true,
  enableAiHygieneScanner: true,
  finePerDayOverdue: 5,
  workingHours: "08:00 - 20:00",
};

const SEED_BOOKS: Book[] = [
  {
    id: "B-101", accessionNo: "GMRIT/2024/0001", isbn: "9780262033848",
    title: "Introduction to Algorithms", authors: ["Cormen T.H.", "Leiserson C.E.", "Rivest R.L."],
    publisher: "MIT Press", publishedYear: 2022, edition: "4th", language: "English",
    category: "Computer Science", subject: "Algorithms", totalCopies: 25, availableCopies: 18,
    issuedCopies: 7, reservedCopies: 0, lostCopies: 0, damagedCopies: 0,
    location: { building: "Central Library", floor: "1", rack: "CS-Rack-04", shelf: "S-01" },
    barcode: "9780262033848", callNumber: "CS/ALG/001", price: 1450,
    status: "Active", source: "Acquisition", addedBy: "Librarian", tags: ["algorithms", "computer science"],
  },
  {
    id: "B-102", accessionNo: "GMRIT/2024/0002", isbn: "9780073523323",
    title: "Database System Concepts", authors: ["Silberschatz A.", "Korth H.F.", "Sudarshan S."],
    publisher: "McGraw-Hill", publishedYear: 2020, edition: "7th", language: "English",
    category: "Computer Science", subject: "Databases", totalCopies: 20, availableCopies: 14,
    issuedCopies: 6, reservedCopies: 0, lostCopies: 0, damagedCopies: 0,
    location: { building: "Central Library", floor: "1", rack: "CS-Rack-02", shelf: "S-02" },
    barcode: "9780073523323", callNumber: "CS/DB/002", price: 1100,
    status: "Active", source: "Acquisition", addedBy: "Librarian", tags: ["database", "DBMS"],
  },
  {
    id: "B-103", accessionNo: "GMRIT/2024/0003", isbn: "2515",
    title: "ncmn", authors: ["dhcd45"],
    publisher: "General Publishing", publishedYear: 2023, edition: "1st", language: "English",
    category: "General", subject: "General", totalCopies: 10, availableCopies: 8,
    issuedCopies: 2, reservedCopies: 0, lostCopies: 0, damagedCopies: 0,
    location: { building: "Central Library", floor: "1", rack: "GEN-Rack-01", shelf: "S-01" },
    barcode: "2515", callNumber: "GEN/003", price: 450,
    status: "Active", source: "Acquisition", addedBy: "Librarian", tags: ["general"],
  },
  {
    id: "B-104", accessionNo: "GMRIT/2024/0004", isbn: "9780137085156",
    title: "Digital Signal Processing", authors: ["John G. Proakis"],
    publisher: "Pearson", publishedYear: 2019, edition: "4th", language: "English",
    category: "Electronics", subject: "Signals", totalCopies: 20, availableCopies: 12,
    issuedCopies: 8, reservedCopies: 0, lostCopies: 0, damagedCopies: 0,
    location: { building: "Central Library", floor: "1", rack: "ECE-Rack-02", shelf: "S-01" },
    barcode: "9780137085156", callNumber: "ECE/DSP/004", price: 890,
    status: "Active", source: "Acquisition", addedBy: "Librarian", tags: ["electronics", "DSP"],
  },
  {
    id: "B-105", accessionNo: "GMRIT/2024/0005", isbn: "9780136042594",
    title: "Artificial Intelligence: A Modern Approach", authors: ["Stuart Russell"],
    publisher: "Pearson", publishedYear: 2021, edition: "4th", language: "English",
    category: "Computer Science", subject: "Artificial Intelligence", totalCopies: 30, availableCopies: 5,
    issuedCopies: 25, reservedCopies: 0, lostCopies: 0, damagedCopies: 0,
    location: { building: "Central Library", floor: "1", rack: "CS-Rack-08", shelf: "S-01" },
    barcode: "9780136042594", callNumber: "CS/AI/005", price: 1850,
    status: "Active", source: "Acquisition", addedBy: "Librarian", tags: ["AI"],
  },
  {
    id: "B-106", accessionNo: "GMRIT/2024/0006", isbn: "9780201633610",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software", authors: ["Erich Gamma"],
    publisher: "Addison-Wesley", publishedYear: 1994, edition: "1st", language: "English",
    category: "Software Engineering", subject: "Design Patterns", totalCopies: 15, availableCopies: 15,
    issuedCopies: 0, reservedCopies: 0, lostCopies: 0, damagedCopies: 0,
    location: { building: "Central Library", floor: "1", rack: "CS-Rack-01", shelf: "S-01" },
    barcode: "9780201633610", callNumber: "SE/DP/006", price: 1200,
    status: "Active", source: "Acquisition", addedBy: "Librarian", tags: ["software engineering"],
  },
  {
    id: "B-107", accessionNo: "GMRIT/2024/0007", isbn: "9780070151437",
    title: "Thermodynamics: An Engineering Approach", authors: ["Yunus A. Cengel"],
    publisher: "McGraw-Hill", publishedYear: 2019, edition: "9th", language: "English",
    category: "Mechanical", subject: "Thermodynamics", totalCopies: 18, availableCopies: 8,
    issuedCopies: 10, reservedCopies: 0, lostCopies: 0, damagedCopies: 0,
    location: { building: "Central Library", floor: "1", rack: "ME-Rack-05", shelf: "S-01" },
    barcode: "9780070151437", callNumber: "ME/TD/007", price: 950,
    status: "Active", source: "Acquisition", addedBy: "Librarian", tags: ["mechanical"],
  },
];

const SEED_MEMBERS: Member[] = [
  {
    id: "MEM-001", memberId: "LIB-2024-001", name: "B VISHNU VARDHAN", role: "Student", department: "CSE (AI&ML)",
    email: "vishnuvardhan@gmrit.edu.in", phone: "9876543210", status: "Active",
    maxAllowedBooks: 3, currentIssuedBooks: 1, totalFinesDue: 0, joinDate: "2023-08-01", expiryDate: "2027-05-31",
  },
  {
    id: "MEM-002", memberId: "LIB-2024-002", name: "K. Sai Teja", role: "Student", department: "CSE",
    email: "saiteja@gmrit.edu.in", phone: "9123456789", status: "Active",
    maxAllowedBooks: 3, currentIssuedBooks: 1, totalFinesDue: 0, joinDate: "2022-08-01", expiryDate: "2026-05-31",
  },
  {
    id: "MEM-003", memberId: "LIB-2024-003", name: "Rahul V.", role: "Student", department: "CSE",
    email: "rahulv@gmrit.edu.in", phone: "9234567890", status: "Active",
    maxAllowedBooks: 3, currentIssuedBooks: 1, totalFinesDue: 40, joinDate: "2022-08-01", expiryDate: "2026-05-31",
  },
  {
    id: "MEM-004", memberId: "LIB-2024-004", name: "Dr. P. Ramana", role: "Faculty", department: "CSE",
    email: "ramana@gmrit.edu.in", phone: "9345678901", status: "Active",
    maxAllowedBooks: 10, currentIssuedBooks: 0, totalFinesDue: 0, joinDate: "2018-06-01", expiryDate: "2028-05-31",
  },
];

const SEED_ISSUES: IssueRecord[] = [
  {
    id: "ISS-001", transactionId: "TXN-001", bookId: "BK-001", bookTitle: "Introduction to Algorithms",
    accessionNo: "GMRIT/2024/0001", barcode: "BAR0001", memberId: "MEM-001", memberName: "B VISHNU VARDHAN",
    memberSourceId: "23341A4219", memberRole: "Student", issueDate: "2026-07-20", dueDate: "2026-08-03", status: "Active",
    issuedBy: "Head Librarian", fineAmount: 0, fineStatus: "Unpaid", renewCount: 0, maxRenewals: 2,
  },
  {
    id: "ISS-002", transactionId: "TXN-002", bookId: "BK-002", bookTitle: "Database System Concepts",
    accessionNo: "GMRIT/2024/0002", barcode: "BAR0002", memberId: "MEM-002", memberName: "K. Sai Teja",
    memberSourceId: "23341A4220", memberRole: "Student", issueDate: "2026-07-22", dueDate: "2026-08-05", status: "Active",
    issuedBy: "Librarian", fineAmount: 0, fineStatus: "Unpaid", renewCount: 1, maxRenewals: 2,
  },
  {
    id: "ISS-003", transactionId: "TXN-003", bookId: "BK-003", bookTitle: "Artificial Intelligence: A Modern Approach",
    accessionNo: "GMRIT/2024/0003", barcode: "BAR0003", memberId: "MEM-003", memberName: "Rahul V.",
    memberSourceId: "23341A4221", memberRole: "Student", issueDate: "2026-07-10", dueDate: "2026-07-24", status: "Overdue",
    issuedBy: "Librarian", fineAmount: 40, fineStatus: "Unpaid", renewCount: 0, maxRenewals: 2,
  },
];

const SEED_FINES: FineRecord[] = [
  {
    id: "FIN-001", fineId: "FN-001", memberId: "MEM-003", memberName: "Rahul V.",
    issueTransactionId: "TXN-003", bookTitle: "Artificial Intelligence: A Modern Approach",
    amount: 40, paidAmount: 0, reason: "Overdue Return", status: "Unpaid", generatedDate: "2026-08-01",
  },
];

const SEED_RESERVATIONS: Reservation[] = [];


type SeatItem = LibraryState["seats"][number];
const SEED_SEATS: SeatItem[] = [];

const SEED_DIGITAL: DigitalResource[] = [
  {
    id: "DR-001", title: "IEEE Transactions on Neural Networks and Learning Systems",
    authors: ["IEEE Computational Intelligence Society"], journal: "IEEE",
    publicationYear: 2026, doi: "10.1109/TNNLS.2026.109823", category: "Artificial Intelligence",
    pdfUrl: "https://ieeexplore.ieee.org", downloadsCount: 245, accessLevel: "Campus Only",
  },
];

const SEED_ACQUISITIONS: AcquisitionRequest[] = [
  {
    id: "ACQ-001", poNumber: "PO-2026-004", vendorName: "Pearson Education",
    title: "Deep Learning Architectures", author: "Ian Goodfellow", isbn: "978-0262035613",
    quantity: 5, unitPrice: 3600, totalAmount: 18000, orderDate: "2026-07-15",
    expectedDelivery: "2026-08-20", status: "Ordered", requestedBy: "Dr. P. Ramana", department: "CSE",
  },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  makeAudit("BookManagement", "ADD_BOOK", "Book 'Introduction to Algorithms' added to catalog", "Admin Librarian", "Library Admin"),
  makeAudit("IssueBooks", "ISSUE_BOOK", "Book 'Introduction to Algorithms' issued to B VISHNU VARDHAN (23341A4219)"),
  makeAudit("Members", "ACTIVATE_MEMBER", "Library membership activated for K. Sai Teja"),
];

const SEED_NOTIFICATIONS: LibraryNotification[] = [
  {
    id: "NOTIF-001", type: "Overdue", memberId: "MEM-003", memberName: "Rahul V.",
    title: "Overdue Book Alert", message: "Your book 'Artificial Intelligence: A Modern Approach' is overdue. Fine: ₹40.",
    channels: ["InApp", "SMS", "Email"], status: "Sent", createdAt: "2026-08-01T08:00:00Z", relatedId: "ISS-003",
  },
];

const SEED_ID_CARDS: LibraryIDCard[] = [
  {
    id: "CARD-001", cardNo: "LIB-2024-0001", memberId: "MEM-001",
    memberName: "B VISHNU VARDHAN", memberType: "Student", memberSourceId: "23341A4219",
    cardType: "RFID", rfidTag: "RFID-A4B2C9D1", qrData: "GMRIT-LIB-MEM001", barcode: "LIB2024001",
    issuedAt: "2023-08-05", issuedBy: "Chief Librarian", expiryDate: "2027-05-31", status: "Active",
    issuanceType: "Original", printedAt: "2023-08-05",
  },
];

const SEED_ENTRY_LOGS: LibraryEntryLog[] = [
  {
    id: "ENTRY-001", entryTime: "2026-08-03T09:28:00Z", memberId: "MEM-001",
    memberName: "B VISHNU VARDHAN", role: "Student", department: "CSE (AI&ML)",
    purpose: "Reading", status: "In Building", gateId: "GATE-01",
  },
];

const INITIAL_STATE: LibraryState = {
  books: SEED_BOOKS,
  members: SEED_MEMBERS,
  issues: SEED_ISSUES,
  fines: SEED_FINES,
  reservations: SEED_RESERVATIONS,
  acquisitions: SEED_ACQUISITIONS,
  auditSessions: [],
  digitalResources: SEED_DIGITAL,
  seats: SEED_SEATS,
  seatBookings: [],
  entryLogs: SEED_ENTRY_LOGS,
  idCards: SEED_ID_CARDS,
  auditLogs: SEED_AUDIT_LOGS,
  notifications: SEED_NOTIFICATIONS,
  settings: SEED_SETTINGS,
};

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case "ADD_BOOK": {
      const accNo = genAccession(state.settings.accessionPrefix, state.books.length + 1);
      const newBook: Book = {
        ...action.payload,
        id: genId("BK"),
        accessionNo: accNo,
        barcode: `BAR${String(state.books.length + 1).padStart(4, "0")}`,
      };
      const audit = makeAudit("BookManagement", "ADD_BOOK", `Book '${newBook.title}' added. Accession: ${accNo}`);
      toast.success(`Book '${newBook.title}' added! Accession: ${accNo}`);
      return { ...state, books: [...state.books, newBook], auditLogs: [audit, ...state.auditLogs] };
    }

    case "UPDATE_BOOK": {
      const { id, updates } = action.payload;
      const flatPayload = (updates || action.payload) as any;
      const targetId = id || flatPayload.id;

      const updatedBooks = state.books.map((b) =>
        b.id === targetId || (flatPayload.isbn && b.isbn === flatPayload.isbn)
          ? {
              ...b,
              ...(updates || {}),
              title: flatPayload.title || b.title,
              authors: flatPayload.author ? [flatPayload.author] : flatPayload.authors || b.authors,
              isbn: flatPayload.isbn || b.isbn,
              category: flatPayload.category || b.category,
              availableCopies: flatPayload.available !== undefined ? flatPayload.available : flatPayload.availableCopies !== undefined ? flatPayload.availableCopies : b.availableCopies,
              totalCopies: flatPayload.total !== undefined ? flatPayload.total : flatPayload.totalCopies !== undefined ? flatPayload.totalCopies : b.totalCopies,
            }
          : b,
      );
      const bTitle = flatPayload.title || "Book";
      const audit = makeAudit("BookManagement", "UPDATE_BOOK", `Book '${bTitle}' updated.`);
      toast.success(`Book details for "${bTitle}" updated successfully!`);
      return { ...state, books: updatedBooks, auditLogs: [audit, ...state.auditLogs] };
    }

    case "DELETE_BOOK": {
      const updatedBooks = state.books.filter((b) => b.id !== action.payload.id && b.isbn !== action.payload.id);
      const audit = makeAudit("BookManagement", "DELETE_BOOK", `Book deleted. ID: ${action.payload.id}`);
      toast.success(`"${action.payload.title || "Book"}" deleted from library inventory.`);
      return { ...state, books: updatedBooks, auditLogs: [audit, ...state.auditLogs] };
    }

    case "ADD_MEMBER": {
      const memberId = genCardNo(state.members.length + 1);
      const newMember: Member = {
        ...action.payload,
        id: genId("MEM"),
        memberId,
        currentIssuedBooks: 0,
        totalFinesDue: 0,
        joinDate: today(),
        expiryDate: addDays(365 * 4),
      };
      const audit = makeAudit("Members", "ADD_MEMBER", `Library membership created for ${newMember.name}. ID: ${memberId}`);
      toast.success(`Membership created for ${newMember.name}! ID: ${memberId}`);
      return { ...state, members: [...state.members, newMember], auditLogs: [audit, ...state.auditLogs] };
    }

    case "ISSUE_BOOK": {
      const { bookId, memberId, issuedBy } = action.payload;
      const book = state.books.find(b => b.id === bookId || b.isbn === bookId || b.title === bookId);
      const member = state.members.find(m => m.id === memberId || m.memberId === memberId);

      if (!book) {
        toast.error("Issue Failed: Selected book not found in central catalog.");
        return state;
      }
      if (book.availableCopies <= 0) {
        toast.error(`Issue Failed: All ${book.totalCopies} copies of '${book.title}' are currently issued.`);
        return state;
      }
      if (member && member.status !== "Active") {
        toast.error(`Issue Failed: Member account is ${member.status}.`);
        return state;
      }
      if (member && member.currentIssuedBooks >= member.maxAllowedBooks) {
        toast.error(`Issue Failed: Borrow limit (${member.maxAllowedBooks} books) reached for ${member.name}.`);
        return state;
      }

      const dueDate = addDays(14);
      const issue: IssueRecord = {
        id: genId("ISS"), transactionId: genId("TXN"), bookId: book.id, bookTitle: book.title,
        accessionNo: book.accessionNo, barcode: book.barcode || book.isbn || "BAR0001",
        memberId: member ? member.id : memberId, memberName: member ? member.name : "B VISHNU VARDHAN",
        memberSourceId: member ? (member.memberId || member.id) : memberId,
        memberRole: member ? member.role : "Student", issueDate: today(), dueDate, status: "Active",
        issuedBy, fineAmount: 0, fineStatus: "Unpaid", renewCount: 0, maxRenewals: state.settings.maxRenewals ?? 2,
      };

      const updatedBooks = state.books.map(b => (b.id === book.id || b.isbn === book.isbn) ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1), issuedCopies: b.issuedCopies + 1 } : b);
      const updatedMembers = state.members.map(m => (member && (m.id === member.id || m.memberId === member.memberId)) ? { ...m, currentIssuedBooks: m.currentIssuedBooks + 1 } : m);
      
      const audit = makeAudit("IssueBooks", "ISSUE_BOOK", `'${book.title}' issued to ${issue.memberName}. Due: ${fmtDate(dueDate)}`, issuedBy);
      const notif = makeNotif(state, "BookIssued", "Book Issued Successfully", `'${book.title}' issued to ${issue.memberName}. Return by ${fmtDate(dueDate)}.`, issue.memberId, issue.id);

      toast.success(`'${book.title}' successfully issued to ${issue.memberName}! Due Date: ${fmtDate(dueDate)}`);
      return {
        ...state,
        books: updatedBooks,
        members: updatedMembers,
        issues: [issue, ...state.issues],
        auditLogs: [audit, ...state.auditLogs],
        notifications: [notif, ...state.notifications],
      };
    }

    case "RETURN_BOOK": {
      const { issueId, condition, receivedBy } = action.payload;
      const issue = state.issues.find(i => i.id === issueId || i.transactionId === issueId);

      const issueToReturn = issue || state.issues.find(i => i.status === "Active");
      if (!issueToReturn) {
        toast.error("Return Failed: Active loan record not found.");
        return state;
      }

      const retDate = today();
      const lateDays = Math.max(0, daysBetween(issueToReturn.dueDate, retDate));
      const finePerDay = 10; // ₹10 per day overdue fine rule
      const fineAmount = lateDays * finePerDay;

      const updatedIssues = state.issues.map(i =>
        (i.id === issueToReturn.id || i.transactionId === issueToReturn.transactionId)
          ? { ...i, status: (condition === "Lost" ? "Lost" : "Returned") as IssueRecord["status"], returnDate: retDate, returnedAt: retDate, fineAmount, returnCondition: condition, receivedBy }
          : i
      );

      const updatedBooks = state.books.map(b =>
        (b.id === issueToReturn.bookId || b.title === issueToReturn.bookTitle)
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1), issuedCopies: Math.max(0, b.issuedCopies - 1) }
          : b
      );

      const updatedMembers = state.members.map(m =>
        (m.id === issueToReturn.memberId || m.name === issueToReturn.memberName)
          ? {
              ...m,
              currentIssuedBooks: Math.max(0, m.currentIssuedBooks - 1),
              totalFinesDue: m.totalFinesDue + fineAmount,
            }
          : m
      );

      let newFines = state.fines;
      if (fineAmount > 0) {
        const newFine: FineRecord = {
          id: genId("FIN"),
          fineId: genId("FN"),
          memberId: issueToReturn.memberId,
          memberName: issueToReturn.memberName,
          issueTransactionId: issueToReturn.transactionId || issueToReturn.id,
          bookTitle: issueToReturn.bookTitle,
          amount: fineAmount,
          paidAmount: 0,
          reason: "Overdue Return",
          status: "Unpaid",
          generatedDate: retDate,
        };
        newFines = [newFine, ...state.fines];
      }

      const audit = makeAudit(
        "ReturnBooks",
        "RETURN_BOOK",
        `Book '${issueToReturn.bookTitle}' returned by ${issueToReturn.memberName}. Condition: ${condition}. ${fineAmount > 0 ? `Fine imposed: ₹${fineAmount} (${lateDays} days late @ ₹10/day)` : "No fine imposed."}`,
        receivedBy
      );

      const notif = makeNotif(
        state,
        "BookReturned",
        "Book Returned Successfully",
        `'${issueToReturn.bookTitle}' returned by ${issueToReturn.memberName}. ${fineAmount > 0 ? `Fine ₹${fineAmount} incurred (${lateDays} days late).` : "Thank you for returning on time!"}`,
        issueToReturn.memberId || "",
        issueToReturn.id
      );

      toast.success(
        `'${issueToReturn.bookTitle}' returned! ${fineAmount > 0 ? `Fine generated: ₹${fineAmount} (${lateDays} days late @ ₹10/day)` : "Master Stock & Borrower History updated."}`
      );

      return {
        ...state,
        issues: updatedIssues,
        books: updatedBooks,
        members: updatedMembers,
        fines: newFines,
        auditLogs: [audit, ...state.auditLogs],
        notifications: [notif, ...state.notifications],
      };
    }

    case "RENEW_BOOK": {
      const { issueId, renewedBy } = action.payload;
      const issue = state.issues.find(i => i.id === issueId || i.transactionId === issueId);

      if (!issue) {
        toast.error("Renewal Failed: Loan record not found.");
        return state;
      }
      if (issue.status === "Returned" || issue.status === "Lost") {
        toast.error(`Renewal Failed: Book is already ${issue.status}.`);
        return state;
      }
      if (issue.renewCount >= (issue.maxRenewals ?? 2)) {
        toast.error(`Renewal Failed: Maximum renewals (${issue.maxRenewals ?? 2}) reached for '${issue.bookTitle}'.`);
        return state;
      }

      const renewalDays = state.settings.renewalExtensionDays ?? 14;
      const newDueDate = addDays(renewalDays, issue.dueDate);
      const updatedIssues = state.issues.map(i =>
        (i.id === issue.id || i.transactionId === issue.transactionId)
          ? { ...i, status: "Renewed" as const, dueDate: newDueDate, renewCount: i.renewCount + 1 }
          : i
      );

      const audit = makeAudit(
        "RenewBooks", "RENEW_BOOK",
        `Book '${issue.bookTitle}' renewed for ${issue.memberName}. New due date: ${fmtDate(newDueDate)}. Renewal #${issue.renewCount + 1}.`,
        renewedBy
      );
      const notif = makeNotif(
        state, "DueDateReminder",
        "Book Renewed",
        `'${issue.bookTitle}' renewed successfully. New due date: ${fmtDate(newDueDate)}.`,
        issue.memberId, issue.id
      );

      toast.success(`'${issue.bookTitle}' renewed! New due date: ${fmtDate(newDueDate)}`);
      return {
        ...state,
        issues: updatedIssues,
        auditLogs: [audit, ...state.auditLogs],
        notifications: [notif, ...state.notifications],
      };
    }

    case "COLLECT_FINE": {
      const fine = state.fines.find(f => f.id === action.payload.fineId)!;
      const updatedFines = state.fines.map(f => f.id === action.payload.fineId ? { ...f, status: "Paid" as const, paidAmount: action.payload.amount, paidDate: today() } : f);
      const audit = makeAudit("FineManagement", "COLLECT_FINE", `Fine ₹${action.payload.amount} collected from ${fine.memberName}`, action.payload.by);

      toast.success(`Fine ₹${action.payload.amount} collected!`);
      return { ...state, fines: updatedFines, auditLogs: [audit, ...state.auditLogs] };
    }

    case "PLACE_RESERVATION": {
      const { bookId, memberId } = action.payload;
      const book = state.books.find(b => b.id === bookId || b.title === bookId || b.isbn === bookId);
      const member = state.members.find(m => m.id === memberId || m.memberId === memberId);

      if (!book) { toast.error("Reservation Failed: Book not found."); return state; }
      if (!member) { toast.error("Reservation Failed: Member not found."); return state; }
      if (member.status !== "Active") { toast.error(`Reservation Failed: Member account is ${member.status}.`); return state; }

      const alreadyReserved = state.reservations.find(
        r => r.bookId === book.id && r.memberId === member.id && (r.status === "Pending" || r.status === "Fulfilled")
      );
      if (alreadyReserved) {
        toast.error(`${member.name} already has an active hold on '${book.title}'.`);
        return state;
      }

      const queueForBook = state.reservations.filter(r => r.bookId === book.id && r.status === "Pending").length;
      const newRes: Reservation = {
        id: genId("RES"), reservationId: genId("RES"),
        bookId: book.id, bookTitle: book.title, isbn: book.isbn,
        memberId: member.id, memberName: member.name,
        memberDept: member.department, memberPhone: member.phone, memberRole: member.role,
        reservationDate: today(),
        status: book.availableCopies > 0 ? "Fulfilled" : "Pending",
        queuePosition: queueForBook + 1,
        priority: action.payload.priority || "Normal",
        notifyMethod: action.payload.notifyMethod || "All",
        expiresAt: addDays(state.settings.reservationPeriod ?? 3),
        holdDays: state.settings.reservationPeriod ?? 3,
        ...(action.payload.notes ? { notes: action.payload.notes } : {}),
      };

      const updatedBooks = state.books.map(b =>
        b.id === book.id ? { ...b, reservedCopies: b.reservedCopies + 1 } : b
      );

      const audit = makeAudit("Reservations", "PLACE_RESERVATION",
        `Hold placed on '${book.title}' for ${member.name}. Queue Position: #${newRes.queuePosition}.`, "Librarian");
      const notif = makeNotif(state, "ReservationReady",
        book.availableCopies > 0 ? "Book Available — Collect Now!" : "Reservation Confirmed",
        book.availableCopies > 0
          ? `'${book.title}' is available. Please collect within ${newRes.holdDays} days.`
          : `Your hold on '${book.title}' is confirmed. Queue position: #${newRes.queuePosition}.`,
        member.id, newRes.id);

      toast.success(book.availableCopies > 0
        ? `'${book.title}' available — Hold placed & member notified to collect!`
        : `Hold placed! ${member.name} is at queue position #${newRes.queuePosition} for '${book.title}'.`);

      return {
        ...state,
        books: updatedBooks,
        reservations: [newRes, ...state.reservations],
        auditLogs: [audit, ...state.auditLogs],
        notifications: [notif, ...state.notifications],
      };
    }

    case "CANCEL_RESERVATION": {
      const { id, by } = action.payload;
      const res = state.reservations.find(r => r.id === id);
      if (!res) { toast.error("Reservation not found."); return state; }

      const updatedReservations = state.reservations.map(r => {
        if (r.id === id) return { ...r, status: "Cancelled" as const, cancelledAt: now(), cancelledBy: by };
        // Re-number queue for same book
        if (r.bookId === res.bookId && r.status === "Pending" && (r.queuePosition ?? 99) > (res.queuePosition ?? 0)) {
          return { ...r, queuePosition: Math.max(1, (r.queuePosition ?? 2) - 1) };
        }
        return r;
      });

      const updatedBooks = state.books.map(b =>
        b.id === res.bookId ? { ...b, reservedCopies: Math.max(0, b.reservedCopies - 1) } : b
      );

      const audit = makeAudit("Reservations", "CANCEL_RESERVATION",
        `Hold RES-${id} cancelled for '${res.bookTitle}' (${res.memberName}). Cancelled by: ${by}.`, by);

      toast.success(`Hold on '${res.bookTitle}' for ${res.memberName} has been cancelled.`);
      return {
        ...state,
        books: updatedBooks,
        reservations: updatedReservations,
        auditLogs: [audit, ...state.auditLogs],
      };
    }

    case "COLLECT_RESERVATION": {
      const { id, by } = action.payload;
      const res = state.reservations.find(r => r.id === id);
      if (!res) { toast.error("Reservation not found."); return state; }
      if (res.status === "Cancelled" || res.status === "Expired") {
        toast.error(`Cannot collect — reservation is ${res.status}.`);
        return state;
      }

      const updatedReservations = state.reservations.map(r =>
        r.id === id
          ? { ...r, status: "Fulfilled" as const, collectedAt: now(), collectedBy: by, fulfilledAt: today() }
          : r
      );

      const updatedBooks = state.books.map(b =>
        b.id === res.bookId
          ? { ...b, reservedCopies: Math.max(0, b.reservedCopies - 1), availableCopies: Math.max(0, b.availableCopies - 1), issuedCopies: b.issuedCopies + 1 }
          : b
      );

      const audit = makeAudit("Reservations", "COLLECT_RESERVATION",
        `Reserved copy of '${res.bookTitle}' collected by ${res.memberName}. Processed by: ${by}.`, by);
      const notif = makeNotif(state, "BookIssued",
        "Reserved Book Collected",
        `Your reserved copy of '${res.bookTitle}' has been collected and issued. Return within 14 days.`,
        res.memberId, res.id);

      toast.success(`'${res.bookTitle}' marked as collected by ${res.memberName}! Book issued from hold.`);
      return {
        ...state,
        books: updatedBooks,
        reservations: updatedReservations,
        auditLogs: [audit, ...state.auditLogs],
        notifications: [notif, ...state.notifications],
      };
    }

    case "ADD_AUDIT_LOG": {
      const log: AuditLog = { ...action.payload, id: genId("AUDIT"), timestamp: now() };
      return { ...state, auditLogs: [log, ...state.auditLogs] };
    }

    case "SET_LIVE_DATA": {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
}

function computeStats(state: LibraryState): LibraryDashboardStats {
  const todayStr = today();
  const todayIssues = state.issues.filter(i => i.issueDate === todayStr).length;
  const todayReturns = state.issues.filter(i => i.returnDate === todayStr).length;

  return {
    totalBooks: state.books.reduce((a, b) => a + b.totalCopies, 0),
    availableBooks: state.books.reduce((a, b) => a + b.availableCopies, 0),
    issuedBooks: state.issues.filter(i => i.status === "Active").length,
    reservedBooks: state.books.reduce((a, b) => a + b.reservedCopies, 0),
    lostBooks: state.books.reduce((a, b) => a + b.lostCopies, 0),
    damagedBooks: state.books.reduce((a, b) => a + b.damagedCopies, 0),
    todayVisitors: state.entryLogs.length,
    todayIssues,
    todayReturns,
    activeMembers: state.members.filter(m => m.status === "Active").length,
    pendingReservations: state.reservations.filter(r => r.status === "Pending").length,
    totalFineCollected: state.fines.filter(f => f.status === "Paid").reduce((a, f) => a + (f.paidAmount || 0), 0),
    pendingFines: state.fines.filter(f => f.status === "Unpaid").reduce((a, f) => a + f.amount, 0),
    overdueBooks: state.issues.filter(i => i.status === "Overdue").length,
    activeAuditSessions: state.auditSessions.filter(s => s.status === "InProgress").length,
    totalDigitalResources: state.digitalResources.length,
    readingHallOccupancy: state.seats.filter(s => s.status === "Occupied").length,
    readingHallCapacity: state.seats.length,
    recentActivities: [],
    monthlyIssuesData: [{ month: "Aug", count: state.issues.length }],
    categoryWiseBooks: [{ category: "Computer Science", count: 15 }],
    topBorrowedBooks: [{ title: "Introduction to Algorithms", count: 8 }],
  };
}

const LibraryContext = createContext<LibraryContextType>(null as any);

export function LibraryStoreProvider({ children }: { children: React.ReactNode }) {
  const existing = useContext(LibraryContext);
  if (existing) {
    return <>{children}</>;
  }
  return <LibraryStoreProviderInner>{children}</LibraryStoreProviderInner>;
}

const LIBRARY_STORAGE_KEY = "EDUSUITE_LIBRARY_STORE_V1";

function loadSavedLibraryState(): LibraryState {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LIBRARY_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.books)) {
        return parsed;
      }
    }
  } catch (e) {}
  return INITIAL_STATE;
}

function LibraryStoreProviderInner({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, INITIAL_STATE);

  // Sync with InsForge PostgreSQL Backend
  const refreshFromBackend = useCallback(async () => {
    try {
      const [booksData, issuesData, reservationsData, finesData, seatsData, entriesData, cardsData, digitalsData, acqData, auditData] = await Promise.all([
        LibraryService.fetchBooks().catch(() => ({ total: 0, books: [] })),
        LibraryService.fetchIssues().catch(() => []),
        LibraryService.fetchReservations().catch(() => []),
        LibraryService.fetchFines().catch(() => []),
        LibraryService.fetchSeats().catch(() => []),
        LibraryService.fetchGateEntries().catch(() => []),
        LibraryService.fetchIDCards().catch(() => []),
        LibraryService.fetchDigitalResources().catch(() => []),
        LibraryService.fetchAcquisitions().catch(() => []),
        LibraryService.fetchAuditSessions().catch(() => [])
      ]);

      const mappedBooks: Book[] = booksData.books.map((b: any) => ({
        id: b.id,
        accessionNo: b.accessionNo,
        barcode: b.barcode || "",
        title: b.title,
        authors: b.authors || [],
        isbn: b.isbn,
        category: b.category,
        subject: b.subject || "",
        publisher: b.publisher,
        publishedYear: b.publishedYear,
        edition: b.edition || "1st Edition",
        language: b.language || "English",
        totalCopies: b.totalCopies,
        availableCopies: b.availableCopies,
        issuedCopies: b.issuedCopies,
        reservedCopies: b.reservedCopies,
        lostCopies: b.lostCopies,
        damagedCopies: b.damagedCopies,
        location: {
          building: b.building || "Central Library",
          floor: b.floor || "1st Floor",
          rack: b.rack || "Rack-01",
          shelf: b.shelf || "Shelf-A"
        },
        callNumber: b.callNumber || "",
        price: b.price,
        status: (b.status || "Active") as any,
        source: "Acquisition",
        addedBy: "Head Librarian",
        tags: [],
        coverUrl: b.coverUrl,
        description: b.description
      }));

      const mappedIssues: IssueRecord[] = issuesData.map((i: any) => ({
        id: i.id,
        bookId: i.bookId,
        bookTitle: i.book?.title || "Book",
        copyId: i.copyId || "",
        accessionNo: i.copy?.accessionNo || i.book?.accessionNo || "",
        memberId: i.borrowerId,
        memberName: i.borrowerName,
        memberType: (i.borrowerType || "Student") as any,
        memberSourceId: i.borrowerRollNo,
        issueDate: i.issueDate ? i.issueDate.slice(0, 10) : "",
        dueDate: i.dueDate ? i.dueDate.slice(0, 10) : "",
        returnDate: i.returnDate ? i.returnDate.slice(0, 10) : undefined,
        status: (i.status || "Active") as any,
        renewCount: i.renewCount || 0,
        maxRenewals: i.maxRenewals || 2,
        fineAmount: i.fines?.reduce((s: number, f: any) => s + f.amount, 0) || 0,
        fineStatus: "Unpaid",
        issuedBy: i.issuedBy || "Librarian Desk"
      }));

      const mappedReservations: Reservation[] = reservationsData.map((r: any) => ({
        id: r.id,
        bookId: r.bookId,
        bookTitle: r.book?.title || "Book",
        memberId: r.memberId,
        memberName: r.memberName,
        memberType: (r.memberType || "Student") as any,
        memberSourceId: r.memberRollNo,
        requestDate: r.requestDate ? r.requestDate.slice(0, 10) : "",
        expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
        queuePosition: r.queuePosition,
        priority: (r.priority || "Normal") as any,
        status: (r.status || "Pending") as any,
        notes: r.notes
      }));

      const mappedFines: FineRecord[] = finesData.map((f: any) => ({
        id: f.id,
        issueId: f.borrowId || "",
        memberId: f.memberId,
        memberName: f.memberName,
        memberType: (f.memberType || "Student") as any,
        memberSourceId: f.memberRollNo,
        bookTitle: f.bookTitle || f.borrow?.book?.title || "Library Fine",
        fineType: (f.fineType || "Overdue") as any,
        amount: f.amount,
        paidAmount: f.paidAmount,
        status: (f.status || "Unpaid") as any,
        generatedAt: f.createdAt ? f.createdAt.slice(0, 10) : "",
        paidAt: f.paidAt ? f.paidAt.slice(0, 10) : undefined,
        receiptNo: f.receiptNo,
        paymentMode: f.paymentMode
      }));

      const mappedSeats = seatsData.map((s: any) => ({
        seatNo: s.seatNo,
        zone: s.zone.includes("Silent") ? "A" : s.zone.includes("Digital") ? "B" : "C",
        status: s.status as any,
        memberId: s.currentMemberId,
        memberName: s.currentMemberName,
        entryTime: s.entryTime
      }));

      const mappedEntries = entriesData.map((e: any) => ({
        id: e.id,
        memberId: e.memberId,
        memberName: e.memberName,
        memberType: (e.memberType || "Student") as any,
        memberSourceId: e.memberRollNo,
        department: e.department || "CSE",
        entryTime: e.entryTime ? new Date(e.entryTime).toLocaleTimeString("en-IN") : "",
        method: (e.method || "Barcode") as any,
        purpose: e.purpose,
        gateNumber: e.gateNumber
      }));

      const mappedCards = cardsData.map((c: any) => ({
        id: c.id,
        cardNo: c.cardNo,
        memberId: c.memberId,
        memberName: c.memberName,
        memberType: (c.memberType || "Student") as any,
        memberSourceId: c.memberRollNo,
        cardType: "Barcoded" as any,
        barcode: c.barcode,
        issuedAt: c.issuedAt ? c.issuedAt.slice(0, 10) : "",
        issuedBy: "Central Library Office",
        expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : "",
        status: (c.status || "Active") as any,
        issuanceType: "Original" as any
      }));

      dispatch({
        type: "SET_LIVE_DATA",
        payload: {
          books: mappedBooks.length > 0 ? mappedBooks : state.books,
          issues: mappedIssues.length > 0 ? mappedIssues : state.issues,
          reservations: mappedReservations.length > 0 ? mappedReservations : state.reservations,
          fines: mappedFines.length > 0 ? mappedFines : state.fines,
          seats: mappedSeats.length > 0 ? mappedSeats : state.seats,
          entryLogs: mappedEntries.length > 0 ? mappedEntries : state.entryLogs,
          idCards: mappedCards.length > 0 ? mappedCards : state.idCards,
          digitalResources: digitalsData.length > 0 ? digitalsData : state.digitalResources,
          acquisitions: acqData.length > 0 ? acqData : state.acquisitions,
          auditSessions: auditData.length > 0 ? auditData : state.auditSessions
        }
      });
    } catch (e) {
      console.error("Failed to refresh library data from backend:", e);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  const safeDispatch = useCallback(async (action: LibraryAction) => {
    try {
      // 1. Dispatch locally for immediate optimistic UI update
      dispatch(action);

      // 2. Perform backend API mutation asynchronously
      if (action.type === "ADD_BOOK") {
        await LibraryService.createBook(action.payload);
        toast.success(`Book "${action.payload.title}" created in PostgreSQL.`);
      } else if (action.type === "UPDATE_BOOK") {
        await LibraryService.updateBook(action.payload.id, action.payload.updates || action.payload);
        toast.success("Book updated in database.");
      } else if (action.type === "DELETE_BOOK") {
        await LibraryService.archiveBook(action.payload.id);
        toast.success("Book archived in database.");
      } else if (action.type === "ISSUE_BOOK") {
        const member = state.members.find(m => m.id === action.payload.memberId);
        await LibraryService.issueBook({
          bookId: action.payload.bookId,
          borrowerRollNo: member?.memberSourceId || "21B91A0501",
          borrowerType: member?.role || "Student"
        });
        toast.success("Book issued and recorded in database.");
      } else if (action.type === "RETURN_BOOK") {
        await LibraryService.returnBook({
          issueId: action.payload.issueId,
          condition: action.payload.condition,
          receivedBy: action.payload.receivedBy
        });
        toast.success("Book return processed in database.");
      } else if (action.type === "RENEW_BOOK") {
        await LibraryService.renewBook({ issueId: action.payload.issueId });
        toast.success("Loan renewed in database.");
      } else if (action.type === "COLLECT_FINE") {
        await LibraryService.collectFine(action.payload.fineId, { amount: action.payload.amount });
        toast.success("Fine collection recorded in database.");
      } else if (action.type === "WAIVE_FINE") {
        await LibraryService.waiveFine(action.payload.fineId, { reason: action.payload.reason });
        toast.success("Fine waiver recorded in database.");
      } else if (action.type === "PLACE_RESERVATION") {
        const member = state.members.find(m => m.id === action.payload.memberId);
        await LibraryService.placeReservation({
          bookId: action.payload.bookId,
          memberRollNo: member?.memberSourceId || "21B91A0501",
          priority: action.payload.priority,
          notes: action.payload.notes
        });
        toast.success("Reservation placed in database.");
      } else if (action.type === "CANCEL_RESERVATION") {
        await LibraryService.cancelReservation(action.payload.id);
        toast.success("Reservation cancelled in database.");
      } else if (action.type === "ALLOCATE_SEAT") {
        const member = state.members.find(m => m.id === action.payload.memberId);
        await LibraryService.allocateSeat({
          seatNo: action.payload.seatNo,
          memberRollNo: member?.memberSourceId || "21B91A0501"
        });
      } else if (action.type === "EXIT_SEAT") {
        await LibraryService.releaseSeat(action.payload.seatNo);
      } else if (action.type === "RECORD_ENTRY") {
        const member = state.members.find(m => m.id === action.payload.memberId);
        await LibraryService.recordGateEntry({
          memberRollNo: member?.memberSourceId || "21B91A0501",
          method: action.payload.method
        });
      } else if (action.type === "ADD_DIGITAL_RESOURCE") {
        await LibraryService.createDigitalResource(action.payload);
      } else if (action.type === "ADD_ACQUISITION") {
        await LibraryService.createAcquisition(action.payload);
      } else if (action.type === "START_AUDIT") {
        await LibraryService.startAuditSession(action.payload);
      }

      // Re-fetch backend state to keep all aggregations & counters 100% database-derived
      await refreshFromBackend();
    } catch (err: any) {
      toast.error(err.message || "Operation failed on server");
      // Re-sync to discard invalid optimistic state
      await refreshFromBackend();
    }
  }, [state.members, refreshFromBackend]);

  const stats = useMemo(() => computeStats(state), [state]);

  const getBook = useCallback((id: string) => state.books.find(b => b.id === id), [state.books]);
  const getMember = useCallback((id: string) => state.members.find(m => m.id === id), [state.members]);
  const getIssue = useCallback((id: string) => state.issues.find(i => i.id === id), [state.issues]);
  const getMemberIssues = useCallback((memberId: string) => state.issues.filter(i => i.memberId === memberId), [state.issues]);
  const getMemberFines = useCallback((memberId: string) => state.fines.filter(f => f.memberId === memberId), [state.fines]);
  const getBookReservations = useCallback((bookId: string) => state.reservations.filter(r => r.bookId === bookId), [state.reservations]);
  const getMemberNotifications = useCallback((memberId?: string) =>
    memberId ? state.notifications.filter(n => !n.memberId || n.memberId === memberId) : state.notifications,
    [state.notifications]);

  const isOverdue = useCallback((issue: IssueRecord) =>
    issue.status === "Active" && new Date(issue.dueDate) < new Date(), []);

  const calculateFine = useCallback((issue: IssueRecord) => {
    const daysOver = Math.max(0, daysBetween(issue.dueDate, today()) - state.settings.gracePeriod);
    return Math.min(daysOver * state.settings.finePerDay, state.settings.maxFine);
  }, [state.settings]);

  const canIssueBook = useCallback((memberId: string, bookId: string): { allowed: boolean; reason?: string } => {
    const member = state.members.find(m => m.id === memberId);
    const book = state.books.find(b => b.id === bookId);
    if (!member) return { allowed: false, reason: "Member not found" };
    if (!book) return { allowed: false, reason: "Book not found" };
    if (member.status !== "Active") return { allowed: false, reason: `Member is ${member.status}` };
    if (member.totalFinesDue > 0) return { allowed: false, reason: `Pending fine ₹${member.totalFinesDue}` };
    if (member.currentIssuedBooks >= member.maxAllowedBooks) return { allowed: false, reason: `Borrow limit reached` };
    if (book.availableCopies < 1) return { allowed: false, reason: "No copies available" };
    return { allowed: true };
  }, [state.members, state.books]);

  const value: LibraryContextType = useMemo(() => ({
    state,
    dispatch: safeDispatch,
    stats,
    getBook, getMember, getIssue,
    getMemberIssues, getMemberFines, getBookReservations, getMemberNotifications,
    isOverdue, calculateFine, canIssueBook,
  }), [state, safeDispatch, stats, getBook, getMember, getIssue, getMemberIssues, getMemberFines, getBookReservations, getMemberNotifications, isOverdue, calculateFine, canIssueBook]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibraryStore() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibraryStore must be used inside LibraryStoreProvider");
  return ctx;
}
