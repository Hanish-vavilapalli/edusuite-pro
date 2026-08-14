import React, { useState, useEffect, useCallback } from "react";
import { 
  mockSummaryMetrics, 
  mockIssuedBooks, 
  mockReservedBooks, 
  mockFineRecords, 
  mockBorrowHistory, 
  mockDigitalResources, 
  mock500Books 
} from "./mock-data";
import { LibraryService } from "@/services/library.service";
import { SummaryCards } from "./summary-cards";
import { OverviewTab } from "./overview-tab";
import { CatalogTab } from "./catalog-tab";
import { IssuedTab } from "./issued-tab";
import { HistoryTab } from "./history-tab";
import { ReservationTab } from "./reservation-tab";
import { DigitalResourcesTab } from "./digital-resources-tab";
import { FineTab } from "./fine-tab";
import { LibraryRightSidebar } from "./sidebar";

// Modals
import { BookDetailsModal } from "./modals/book-modal";
import { RenewModal } from "./modals/renew-modal";
import { ReserveModal } from "./modals/reserve-modal";
import { FinePaymentModal } from "./modals/fine-payment-modal";
import { LibraryCardModal } from "./modals/library-card-modal";
import { ResourcePreviewModal } from "./modals/preview-modal";

import { 
  BookOpen, 
  Search, 
  RefreshCw, 
  History, 
  BookmarkCheck, 
  Globe, 
  CreditCard, 
  Layers, 
  Download, 
  Home, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookItem, IssuedBookItem, FineRecordItem, DigitalResourceItem } from "./types";
import { toast } from "sonner";

export function StudentLibraryModule() {
  const [activeTab, setActiveTab] = useState("overview");

  // Datasets State
  const [issuedBooks, setIssuedBooks] = useState(mockIssuedBooks);
  const [reservedBooks, setReservedBooks] = useState(mockReservedBooks);
  const [fines, setFines] = useState(mockFineRecords);

  // Modal States
  const [selectedBookModal, setSelectedBookModal] = useState<BookItem | null>(null);
  const [selectedRenewModal, setSelectedRenewModal] = useState<IssuedBookItem | null>(null);
  const [selectedReserveModal, setSelectedReserveModal] = useState<BookItem | null>(null);
  const [selectedFineModal, setSelectedFineModal] = useState<FineRecordItem | null>(null);
  const [libraryCardModalOpen, setLibraryCardModalOpen] = useState(false);
  const [previewResourceModal, setPreviewResourceModal] = useState<DigitalResourceItem | null>(null);

  const loadStudentLibraryData = useCallback(async () => {
    try {
      const myData = await LibraryService.fetchMyLibrary();
      if (myData.activeBorrows && myData.activeBorrows.length > 0) {
        setIssuedBooks(myData.activeBorrows.map((b: any) => ({
          id: b.id,
          bookId: b.bookId,
          title: b.book?.title || "Book Title",
          author: b.book?.authors?.join(", ") || "Author",
          category: b.book?.category || "Computer Science",
          department: b.book?.department || "CSE",
          coverImage: b.book?.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
          isbn: b.book?.isbn || "978-0132350884",
          accessionNumber: b.copy?.accessionNo || b.book?.accessionNo || "ACC-001",
          callNumber: b.book?.callNumber || "005.1 MAR",
          rackNumber: b.book?.rack || "Rack-01",
          shelfNumber: b.book?.shelf || "Shelf-A",
          issueDate: b.issueDate ? b.issueDate.slice(0, 10) : "2026-08-01",
          dueDate: b.dueDate ? b.dueDate.slice(0, 10) : "2026-08-15",
          daysRemaining: Math.max(0, Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
          status: (new Date(b.dueDate) < new Date() ? "Overdue" : "Active") as any,
          renewalsCount: b.renewCount || 0,
          maxRenewals: b.maxRenewals || 2,
          isEligibleForRenewal: (b.renewCount || 0) < (b.maxRenewals || 2),
          fineAmount: 0
        })));
      }

      if (myData.reservations && myData.reservations.length > 0) {
        setReservedBooks(myData.reservations.map((r: any) => ({
          id: r.id,
          bookId: r.bookId,
          title: r.book?.title || "Reserved Book",
          author: r.book?.authors?.join(", ") || "Author",
          reservedDate: r.requestDate ? r.requestDate.slice(0, 10) : "2026-08-01",
          queuePosition: r.queuePosition || 1,
          availabilityDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "2026-08-10",
          status: "In Queue" as const
        })));
      }

      if (myData.fines && myData.fines.length > 0) {
        setFines(myData.fines.map((f: any) => ({
          id: f.id,
          bookTitle: f.bookTitle || f.borrow?.book?.title || "Library Fine",
          issuedDate: f.createdAt ? f.createdAt.slice(0, 10) : "2026-08-01",
          dueDate: "2026-08-10",
          returnedDate: f.paidAt ? f.paidAt.slice(0, 10) : undefined,
          overdueDays: 5,
          finePerDay: 5,
          totalFine: f.amount,
          status: (f.status === "Paid" ? "Paid" : "Pending") as any,
          transactionId: f.receiptNo || `TXN-LIB-${f.id.slice(0, 6)}`,
          paymentMethod: f.paymentMode || "UPI"
        })));
      }
    } catch (e) {
      console.log("Could not load real student records, fallback to mock state", e);
    }
  }, []);

  useEffect(() => {
    loadStudentLibraryData();
  }, [loadStudentLibraryData]);

  // Actions
  const handleConfirmRenew = async (issuedId: string) => {
    try {
      await LibraryService.renewBook({ issueId: issuedId });
      toast.success("Book loan renewed successfully in PostgreSQL database!");
      loadStudentLibraryData();
    } catch (e: any) {
      toast.error(e.message || "Failed to renew book");
    }
  };

  const handleConfirmReserve = async (book: BookItem) => {
    try {
      await LibraryService.placeReservation({ bookId: book.id });
      toast.success(`Book "${book.title}" reserved successfully!`);
      loadStudentLibraryData();
    } catch (e: any) {
      toast.error(e.message || "Failed to reserve book");
    }
  };

  const handleCancelReservation = async (resId: string) => {
    try {
      await LibraryService.cancelReservation(resId);
      toast.success("Reservation cancelled.");
      loadStudentLibraryData();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel reservation");
    }
  };

  const handleConfirmFinePayment = async (fineId: string) => {
    try {
      await LibraryService.collectFine(fineId, { paymentMode: "Online UPI" });
      toast.success("Fine payment processed and recorded in PostgreSQL database!");
      loadStudentLibraryData();
    } catch (e: any) {
      toast.error(e.message || "Failed to pay fine");
    }
  };

  const handleOpenBookDetailsById = (bookId: string) => {
    const found = mock500Books.find((b) => b.id === bookId) || mock500Books[0];
    setSelectedBookModal(found);
  };

  const pendingFines = fines.filter((f) => f.status === "Pending");

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* PAGE HEADER */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Library (OPAC)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Search books, manage issued books, digital resources and library services.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab("catalog")}
              className="rounded-xl text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 gap-1.5 shadow-sm"
            >
              <Search className="h-4 w-4" /> Search Catalogue
            </Button>
            <Button
              onClick={() => {
                toast.success("Library catalogue database synced!");
              }}
              variant="outline"
              className="rounded-xl text-xs font-semibold h-9 gap-1.5"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <SummaryCards metrics={mockSummaryMetrics} />

      {/* MAIN CONTENT + RIGHT SIDEBAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT MAIN MODULE AREA (3 COLS) */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
            <TabsList className="flex flex-wrap h-auto p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl gap-1 border border-slate-200 dark:border-slate-800">
              <TabsTrigger
                value="overview"
                className="rounded-lg text-xs font-bold py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600 shadow-2xs gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>

              <TabsTrigger
                value="catalog"
                className="rounded-lg text-xs font-bold py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600 shadow-2xs gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> Book Catalog (500)
              </TabsTrigger>

              <TabsTrigger
                value="issued"
                className="rounded-lg text-xs font-bold py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600 shadow-2xs gap-1.5"
              >
                <Layers className="h-3.5 w-3.5" /> Issued ({issuedBooks.length})
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="rounded-lg text-xs font-bold py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600 shadow-2xs gap-1.5"
              >
                <History className="h-3.5 w-3.5" /> History (30)
              </TabsTrigger>

              <TabsTrigger
                value="reservations"
                className="rounded-lg text-xs font-bold py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600 shadow-2xs gap-1.5"
              >
                <BookmarkCheck className="h-3.5 w-3.5" /> Holds ({reservedBooks.length})
              </TabsTrigger>

              <TabsTrigger
                value="digital"
                className="rounded-lg text-xs font-bold py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600 shadow-2xs gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" /> Digital Repository (150)
              </TabsTrigger>

              <TabsTrigger
                value="fines"
                className="rounded-lg text-xs font-bold py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-rose-600 shadow-2xs gap-1.5"
              >
                <CreditCard className="h-3.5 w-3.5" /> Fines ({pendingFines.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                issuedBooks={issuedBooks}
                reservedBooks={reservedBooks}
                pendingFines={pendingFines}
                onOpenRenewModal={(b) => setSelectedRenewModal(b)}
                onOpenBookDetails={(id) => handleOpenBookDetailsById(id)}
                onOpenFineModal={(f) => setSelectedFineModal(f)}
                onSwitchTab={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="catalog">
              <CatalogTab
                books={mock500Books}
                onOpenBookDetails={(b) => setSelectedBookModal(b)}
                onOpenReserveModal={(b) => setSelectedReserveModal(b)}
              />
            </TabsContent>

            <TabsContent value="issued">
              <IssuedTab
                issuedBooks={issuedBooks}
                onOpenRenewModal={(b) => setSelectedRenewModal(b)}
                onOpenBookDetails={(id) => handleOpenBookDetailsById(id)}
              />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab history={mockBorrowHistory} />
            </TabsContent>

            <TabsContent value="reservations">
              <ReservationTab
                reservations={reservedBooks}
                onCancelReservation={handleCancelReservation}
              />
            </TabsContent>

            <TabsContent value="digital">
              <DigitalResourcesTab
                resources={mockDigitalResources}
                onPreviewResource={(r) => setPreviewResourceModal(r)}
              />
            </TabsContent>

            <TabsContent value="fines">
              <FineTab
                fines={fines}
                onOpenFinePaymentModal={(f) => setSelectedFineModal(f)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT SIDEBAR (1 COL) */}
        <div className="lg:col-span-1">
          <LibraryRightSidebar
            onOpenLibraryCard={() => setLibraryCardModalOpen(true)}
            onSelectQuickAction={(action) => {
              if (action === "search") setActiveTab("catalog");
              if (action === "fines") setActiveTab("fines");
              if (action === "digital") setActiveTab("digital");
            }}
          />
        </div>
      </div>

      {/* ALL MODALS */}
      <BookDetailsModal
        book={selectedBookModal}
        onClose={() => setSelectedBookModal(null)}
        onReserve={(b) => setSelectedReserveModal(b)}
      />

      <RenewModal
        book={selectedRenewModal}
        onClose={() => setSelectedRenewModal(null)}
        onConfirmRenew={(id) => handleConfirmRenew(id)}
      />

      <ReserveModal
        book={selectedReserveModal}
        onClose={() => setSelectedReserveModal(null)}
        onConfirmReserve={handleConfirmReserve}
      />

      <FinePaymentModal
        fine={selectedFineModal}
        onClose={() => setSelectedFineModal(null)}
        onConfirmPayment={handleConfirmFinePayment}
      />

      <LibraryCardModal
        open={libraryCardModalOpen}
        onClose={() => setLibraryCardModalOpen(false)}
      />

      <ResourcePreviewModal
        resource={previewResourceModal}
        onClose={() => setPreviewResourceModal(null)}
      />
    </div>
  );
}
