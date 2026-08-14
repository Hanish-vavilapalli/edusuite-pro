const API_BASE_URL = "http://localhost:5000/api/library";

function getAuthHeaders(): HeadersInit {
  const token = (typeof window !== "undefined" ? localStorage.getItem("token") : null) || "super-admin-auth-token";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export interface LibraryDashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  issuedBooks: number;
  reservedBooks: number;
  lostBooks: number;
  damagedBooks: number;
  overdueBooks: number;
  activeMembers: number;
  pendingReservations: number;
  pendingFines: number;
  totalFineCollected: number;
  todayIssues: number;
  todayReturns: number;
  todayVisitors: number;
  readingHallOccupancy: number;
  readingHallCapacity: number;
  totalDigitalResources: number;
  categoryWiseBooks: Array<{ category: string; count: number }>;
  topBorrowedBooks: Array<{ title: string; count: number }>;
}

export interface BookCopyItem {
  id: string;
  bookId: string;
  copyNumber: number;
  accessionNo: string;
  barcode: string;
  rfidTag?: string;
  status: "Available" | "Issued" | "Reserved" | "Lost" | "Damaged";
  condition: "Mint" | "Good" | "Slightly Worn" | "Damaged";
  building?: string;
  floor?: string;
  rack?: string;
  shelf?: string;
}

export interface LibraryBookItem {
  id: string;
  accessionNo: string;
  barcode?: string;
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedYear: number;
  edition?: string;
  category: string;
  subject?: string;
  department?: string;
  language: string;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  reservedCopies: number;
  lostCopies: number;
  damagedCopies: number;
  callNumber?: string;
  rack?: string;
  shelf?: string;
  building?: string;
  floor?: string;
  price: number;
  status: string;
  description?: string;
  coverUrl?: string;
  copies?: BookCopyItem[];
}

export interface BorrowRecordItem {
  id: string;
  bookId: string;
  copyId?: string;
  borrowerId: string;
  borrowerType: string;
  borrowerName: string;
  borrowerRollNo: string;
  borrowerEmail?: string;
  borrowerDept?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  renewCount: number;
  maxRenewals: number;
  status: "Active" | "Returned" | "Overdue" | "Lost";
  returnCondition?: string;
  issuedBy: string;
  receivedBy?: string;
  book?: LibraryBookItem;
  copy?: BookCopyItem;
}

export interface ReservationItem {
  id: string;
  bookId: string;
  memberId: string;
  memberType: string;
  memberName: string;
  memberRollNo: string;
  requestDate: string;
  expiryDate: string;
  priority: "High" | "Normal" | "Low";
  queuePosition: number;
  status: "Pending" | "Fulfilled" | "Cancelled" | "Expired";
  notes?: string;
  book?: LibraryBookItem;
}

export interface FineRecordItem {
  id: string;
  borrowId?: string;
  memberId: string;
  memberType: string;
  memberName: string;
  memberRollNo: string;
  bookTitle?: string;
  amount: number;
  paidAmount: number;
  fineType: string;
  status: "Unpaid" | "Paid" | "Waived";
  receiptNo?: string;
  paymentMode?: string;
  waiveReason?: string;
  paidAt?: string;
  createdAt: string;
}

export interface ReadingHallSeatItem {
  id: string;
  seatNo: string;
  zone: string;
  status: "Available" | "Occupied" | "Reserved";
  currentMemberId?: string;
  currentMemberName?: string;
  currentRollNo?: string;
  entryTime?: string;
}

export interface GateEntryItem {
  id: string;
  memberId: string;
  memberType: string;
  memberName: string;
  memberRollNo: string;
  department?: string;
  entryTime: string;
  exitTime?: string;
  purpose: string;
  method: string;
  gateNumber: string;
}

export interface IDCardItem {
  id: string;
  memberId: string;
  memberType: string;
  memberName: string;
  memberRollNo: string;
  department?: string;
  cardNo: string;
  barcode: string;
  rfidTag?: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  handoverStatus: "Pending" | "HandedOver";
  status: string;
}

export interface DigitalResourceItem {
  id: string;
  title: string;
  authors: string[];
  resourceType: string;
  publisher?: string;
  publishedYear: number;
  department?: string;
  subject?: string;
  doi?: string;
  accessLevel: string;
  fileUrl: string;
  downloadCount: number;
  viewCount: number;
}

export interface AcquisitionItem {
  id: string;
  poNumber: string;
  vendor: string;
  titlesCount: number;
  totalQuantity: number;
  totalAmount: number;
  status: string;
  requestedBy: string;
  notes?: string;
  createdAt: string;
}

export interface AuditSessionItem {
  id: string;
  sessionName: string;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  status: string;
  scope: string;
  totalScanned: number;
  verified: number;
  missing: number;
  damaged: number;
}

export const LibraryService = {
  // 1. Dashboard Stats
  async fetchDashboardStats(): Promise<LibraryDashboardStats> {
    const res = await fetch(`${API_BASE_URL}/dashboard-stats`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  // 2. Books Catalog
  async fetchBooks(params?: { category?: string; department?: string; search?: string; availability?: string }): Promise<{ total: number; books: LibraryBookItem[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.department) query.set("department", params.department);
    if (params?.search) query.set("search", params.search);
    if (params?.availability) query.set("availability", params.availability);

    const res = await fetch(`${API_BASE_URL}/books?${query.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch books");
    return res.json();
  },

  async fetchBook(id: string): Promise<LibraryBookItem> {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch book");
    return res.json();
  },

  async createBook(payload: any): Promise<LibraryBookItem> {
    const res = await fetch(`${API_BASE_URL}/books`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create book");
    }
    return res.json();
  },

  async updateBook(id: string, payload: any): Promise<LibraryBookItem> {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update book");
    return res.json();
  },

  async archiveBook(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to archive book");
    return res.json();
  },

  // 3. Circulation
  async fetchIssues(params?: { status?: string; borrowerRollNo?: string }): Promise<BorrowRecordItem[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.borrowerRollNo) query.set("borrowerRollNo", params.borrowerRollNo);

    const res = await fetch(`${API_BASE_URL}/issues?${query.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch issues");
    return res.json();
  },

  async issueBook(payload: { bookId: string; copyId?: string; borrowerRollNo: string; borrowerType?: string; loanDays?: number }): Promise<BorrowRecordItem> {
    const res = await fetch(`${API_BASE_URL}/issue`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to issue book");
    }
    return res.json();
  },

  async returnBook(payload: { issueId: string; condition?: string; receivedBy?: string }): Promise<{ message: string; borrow: BorrowRecordItem; fineAmount: number }> {
    const res = await fetch(`${API_BASE_URL}/return`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to return book");
    }
    return res.json();
  },

  async renewBook(payload: { issueId: string; extensionDays?: number }): Promise<{ message: string; borrow: BorrowRecordItem }> {
    const res = await fetch(`${API_BASE_URL}/renew`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to renew book");
    }
    return res.json();
  },

  // 4. Reservations
  async fetchReservations(): Promise<ReservationItem[]> {
    const res = await fetch(`${API_BASE_URL}/reservations`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch reservations");
    return res.json();
  },

  async placeReservation(payload: { bookId: string; memberRollNo?: string; priority?: string; notes?: string }): Promise<ReservationItem> {
    const res = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to place reservation");
    }
    return res.json();
  },

  async cancelReservation(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to cancel reservation");
    return res.json();
  },

  // 5. Fines
  async fetchFines(): Promise<FineRecordItem[]> {
    const res = await fetch(`${API_BASE_URL}/fines`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch fines");
    return res.json();
  },

  async collectFine(id: string, payload: { amount?: number; paymentMode?: string }): Promise<{ message: string; fine: FineRecordItem; receiptNo: string }> {
    const res = await fetch(`${API_BASE_URL}/fines/${id}/collect`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to collect fine");
    return res.json();
  },

  async waiveFine(id: string, payload: { reason?: string }): Promise<{ message: string; fine: FineRecordItem }> {
    const res = await fetch(`${API_BASE_URL}/fines/${id}/waive`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to waive fine");
    return res.json();
  },

  // 6. Reading Hall Seats
  async fetchSeats(): Promise<ReadingHallSeatItem[]> {
    const res = await fetch(`${API_BASE_URL}/seats`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch seats");
    return res.json();
  },

  async allocateSeat(payload: { seatNo: string; memberRollNo?: string }): Promise<ReadingHallSeatItem> {
    const res = await fetch(`${API_BASE_URL}/seats/allocate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to allocate seat");
    }
    return res.json();
  },

  async releaseSeat(seatNo: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/seats/release`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ seatNo })
    });
    if (!res.ok) throw new Error("Failed to release seat");
    return res.json();
  },

  // 7. Gate Entries
  async fetchGateEntries(): Promise<GateEntryItem[]> {
    const res = await fetch(`${API_BASE_URL}/gate-entries`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch gate entries");
    return res.json();
  },

  async recordGateEntry(payload: { memberRollNo: string; purpose?: string; method?: string; gateNumber?: string }): Promise<GateEntryItem> {
    const res = await fetch(`${API_BASE_URL}/gate-entries`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to record gate entry");
    }
    return res.json();
  },

  // 8. ID Cards
  async fetchIDCards(): Promise<IDCardItem[]> {
    const res = await fetch(`${API_BASE_URL}/id-cards`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch ID cards");
    return res.json();
  },

  async approveIDCard(payload: { cardId?: string; rollNumber?: string }): Promise<{ message: string; card: IDCardItem }> {
    const res = await fetch(`${API_BASE_URL}/id-cards/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to approve ID card");
    return res.json();
  },

  async handoverIDCard(cardId: string): Promise<{ message: string; card: IDCardItem }> {
    const res = await fetch(`${API_BASE_URL}/id-cards/handover`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ cardId })
    });
    if (!res.ok) throw new Error("Failed to confirm handover");
    return res.json();
  },

  // 9. Digital Library
  async fetchDigitalResources(params?: { resourceType?: string; department?: string; search?: string }): Promise<DigitalResourceItem[]> {
    const query = new URLSearchParams();
    if (params?.resourceType) query.set("resourceType", params.resourceType);
    if (params?.department) query.set("department", params.department);
    if (params?.search) query.set("search", params.search);

    const res = await fetch(`${API_BASE_URL}/digital?${query.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch digital resources");
    return res.json();
  },

  async createDigitalResource(payload: any): Promise<DigitalResourceItem> {
    const res = await fetch(`${API_BASE_URL}/digital`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create digital resource");
    return res.json();
  },

  async downloadDigitalResource(id: string): Promise<{ fileUrl: string; downloadCount: number }> {
    const res = await fetch(`${API_BASE_URL}/digital/${id}/download`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to record resource download");
    return res.json();
  },

  // 10. Acquisitions & Audit Sessions
  async fetchAcquisitions(): Promise<AcquisitionItem[]> {
    const res = await fetch(`${API_BASE_URL}/acquisitions`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch acquisitions");
    return res.json();
  },

  async createAcquisition(payload: any): Promise<AcquisitionItem> {
    const res = await fetch(`${API_BASE_URL}/acquisitions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create acquisition order");
    return res.json();
  },

  async fetchAuditSessions(): Promise<AuditSessionItem[]> {
    const res = await fetch(`${API_BASE_URL}/audit-sessions`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch audit sessions");
    return res.json();
  },

  async startAuditSession(payload: any): Promise<AuditSessionItem> {
    const res = await fetch(`${API_BASE_URL}/audit-sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to start audit session");
    return res.json();
  },

  // 11. Student Self-Service
  async fetchMyLibrary(): Promise<{
    activeBorrows: BorrowRecordItem[];
    borrowHistory: BorrowRecordItem[];
    reservations: ReservationItem[];
    fines: FineRecordItem[];
    totalFinesDue: number;
  }> {
    const res = await fetch(`${API_BASE_URL}/my-library`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch student library records");
    return res.json();
  }
};
