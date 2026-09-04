import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Plus,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  FileText,
  DollarSign,
  Building2,
  Trash2,
  XCircle,
  TrendingUp,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  deletePO,
  INITIAL_PURCHASE_ORDERS,
  type PurchaseOrder,
} from "./ProcurementService";

const DEPARTMENTS = [
  "All Departments",
  "CSE",
  "ECE",
  "ME",
  "Biotech",
  "Admin",
  "Library",
];

const STATUS_TABS = [
  "All",
  "Submitted",
  "HOD Approved",
  "Finance Approved",
  "Principal Approved",
  "Rejected",
] as const;

export function ProcurementModuleView() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [loading, setLoading] = useState(false);

  // Dialog States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Form State for Creating PO
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    vendorName: "",
    requestedBy: "Dr. Rajesh Sharma",
    department: "CSE",
    itemsDescription: "",
    totalAmount: 250000,
    deliveryDate: "2026-08-30",
  });

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPurchaseOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filtered = orders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      po.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
      po.department.toLowerCase().includes(search.toLowerCase()) ||
      po.itemsDescription.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === "All" || po.approvalStatus === activeTab;
    const matchesDept = selectedDept === "All Departments" || po.department === selectedDept;

    return matchesSearch && matchesTab && matchesDept;
  });

  // KPI Metrics
  const totalPOValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const approvedCount = orders.filter(
    (o) => o.approvalStatus === "Finance Approved" || o.approvalStatus === "Principal Approved",
  ).length;
  const pendingCount = orders.filter(
    (o) => o.approvalStatus === "Submitted" || o.approvalStatus === "HOD Approved",
  ).length;

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      vendorName: "Dell India Pvt Ltd",
      requestedBy: "Dr. Rajesh Sharma",
      department: "CSE",
      itemsDescription: "15 High-End Graphics Workstations for CAD Lab",
      totalAmount: 1250000,
      deliveryDate: "2026-08-30",
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName || !formData.itemsDescription) {
      toast.error("Please enter vendor name and items description.");
      return;
    }

    const created = await createPurchaseOrder(formData);
    setOrders((prev) => [created, ...prev]);
    setIsCreateDialogOpen(false);
    toast.success(
      `Purchase Order ${created.poNumber} created successfully! Amount: ₹${created.totalAmount.toLocaleString("en-IN")}`,
    );
  };

  const handleAdvanceStatus = async (
    po: PurchaseOrder,
    nextStatus: PurchaseOrder["approvalStatus"],
  ) => {
    await updatePOStatus(po.poNumber, nextStatus);
    setOrders((prev) =>
      prev.map((o) => (o.poNumber === po.poNumber ? { ...o, approvalStatus: nextStatus } : o)),
    );
    if (nextStatus === "Rejected") {
      toast.error(`PO ${po.poNumber} rejected.`);
    } else {
      toast.success(`PO ${po.poNumber} advanced to ${nextStatus}!`);
    }
  };

  const handleDelete = async (poNumber: string) => {
    if (confirm(`Are you sure you want to delete purchase order ${poNumber}?`)) {
      await deletePO(poNumber);
      setOrders((prev) => prev.filter((o) => o.poNumber !== poNumber));
      toast.success(`Purchase Order ${poNumber} deleted.`);
    }
  };

  const handleOpenView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsViewDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      "PO Number",
      "Vendor Name",
      "Requested By",
      "Department",
      "Items Description",
      "Total Amount (INR)",
      "Request Date",
      "Delivery Date",
      "Approval Status",
    ];
    const rows = filtered.map((o) => [
      o.poNumber,
      `"${o.vendorName}"`,
      `"${o.requestedBy}"`,
      o.department,
      `"${o.itemsDescription}"`,
      o.totalAmount,
      o.requestDate,
      o.deliveryDate || "N/A",
      o.approvalStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Procurement_Orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} purchase orders to CSV!`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <ShoppingBag className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Procurement & Requisition Module
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                Supply Chain Core
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Manage vendor quotes, purchase requisitions, multi-tier approvals, and order fulfillment.
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right Corner */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-2 text-xs font-medium border-border hover:bg-accent"
          >
            <Download className="size-3.5" /> Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow hover:opacity-95"
          >
            <Plus className="size-4" /> Create Purchase Order
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total PO Requisitions</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">
            ₹{totalPOValue.toLocaleString("en-IN")}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">{orders.length} total active orders</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Approved Orders</span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">{approvedCount} Orders</p>
          <p className="text-[0.68rem] text-emerald-600 font-medium">Ready for vendor fulfillment</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Pending Approvals</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">{pendingCount} Orders</p>
          <p className="text-[0.68rem] text-muted-foreground">Awaiting HOD/Finance approval</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Fulfillment Pipeline</span>
            <Truck className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">
            {orders.filter((o) => o.deliveryDate).length} Deliveries
          </p>
          <p className="text-[0.68rem] text-muted-foreground">Scheduled this month</p>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-1 sm:flex-none items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search vendor, PO#, dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Department Filter */}
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="h-9 w-[140px] text-xs" aria-label="Department Filter">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept} className="text-xs">
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" /> Purchase Requisition Ledger
            <Badge variant="secondary" className="font-mono text-xs">
              {filtered.length} Requisitions
            </Badge>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="size-5 animate-spin text-primary" />
            Loading purchase requisitions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
            <ShoppingBag className="size-7 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              No purchase orders found matching criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="py-3 px-3">PO Number</th>
                  <th className="py-3 px-3">Vendor & Description</th>
                  <th className="py-3 px-3">Requested By</th>
                  <th className="py-3 px-3">Dept</th>
                  <th className="py-3 px-3">Amount (₹)</th>
                  <th className="py-3 px-3">Req Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((po) => (
                  <tr key={po.poNumber} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{po.poNumber}</td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-foreground">{po.vendorName}</div>
                      <div className="text-[0.68rem] text-muted-foreground truncate" title={po.itemsDescription}>
                        {po.itemsDescription}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">{po.requestedBy}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="font-mono text-[0.68rem]">
                        {po.department}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600 text-sm">
                      ₹{po.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">{po.requestDate}</td>
                    <td className="py-3 px-3">
                      <Badge
                        className={
                          po.approvalStatus === "Principal Approved" || po.approvalStatus === "Finance Approved"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                            : po.approvalStatus === "Rejected"
                            ? "bg-red-500/10 text-red-600 border-red-500/20 text-[0.68rem]"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.68rem]"
                        }
                      >
                        {po.approvalStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenView(po)}
                          className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="size-3.5" /> Details
                        </Button>

                        {/* Approval Stage Buttons */}
                        {po.approvalStatus === "Submitted" && (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStatus(po, "HOD Approved")}
                            className="h-7 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                          >
                            <CheckCircle className="size-3" /> HOD Approve
                          </Button>
                        )}

                        {po.approvalStatus === "HOD Approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStatus(po, "Finance Approved")}
                            className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCircle className="size-3" /> Finance Approve
                          </Button>
                        )}

                        {po.approvalStatus === "Finance Approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStatus(po, "Principal Approved")}
                            className="h-7 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white gap-1"
                          >
                            <ShieldCheck className="size-3" /> Final Approve
                          </Button>
                        )}

                        {po.approvalStatus !== "Rejected" && po.approvalStatus !== "Principal Approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAdvanceStatus(po, "Rejected")}
                            className="size-7 text-red-500 hover:bg-red-500/10"
                            title="Reject PO"
                          >
                            <XCircle className="size-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(po.poNumber)}
                          className="size-7 text-muted-foreground hover:text-red-600"
                          title="Delete PO"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DIALOG 1: CREATE PURCHASE ORDER MODAL */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Create Purchase Requisition
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit new equipment or supplies purchase requisition for HOD & Finance approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Vendor Name *</Label>
                <Input
                  required
                  placeholder="e.g. Dell India Pvt Ltd"
                  value={formData.vendorName || ""}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Requested By *</Label>
                <Input
                  required
                  value={formData.requestedBy || ""}
                  onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(val) => setFormData({ ...formData, department: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Amount (₹) *</Label>
                <Input
                  type="number"
                  required
                  value={formData.totalAmount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Expected Delivery Date</Label>
              <Input
                type="date"
                value={formData.deliveryDate || ""}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Items Description & Specifications *</Label>
              <Textarea
                required
                placeholder="List quantity, technical specifications, and purpose of purchase..."
                value={formData.itemsDescription || ""}
                onChange={(e) => setFormData({ ...formData, itemsDescription: e.target.value })}
                className="text-xs min-h-[80px]"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Submit Purchase Requisition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: VIEW PO DOSSIER MODAL */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="size-5 text-primary" /> Purchase Order Dossier
            </DialogTitle>
          </DialogHeader>

          {selectedPO && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedPO.poNumber}
                  </Badge>
                  <Badge
                    className={
                      selectedPO.approvalStatus === "Principal Approved" ||
                      selectedPO.approvalStatus === "Finance Approved"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }
                  >
                    {selectedPO.approvalStatus}
                  </Badge>
                </div>
                <h2 className="text-base font-bold text-foreground">{selectedPO.vendorName}</h2>
                <p className="text-xs text-primary font-medium">
                  Requested by: {selectedPO.requestedBy} ({selectedPO.department})
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30 font-mono">
                  <span className="text-foreground font-bold font-sans">TOTAL REQUISITION AMOUNT:</span>
                  <span className="font-bold text-base text-primary">
                    ₹{selectedPO.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Request Date:</span>
                  <span className="font-mono text-foreground">{selectedPO.requestDate}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Target Delivery Date:</span>
                  <span className="font-mono text-foreground">{selectedPO.deliveryDate || "N/A"}</span>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                  <span className="text-muted-foreground font-semibold">Items & Specifications:</span>
                  <p className="text-xs text-foreground font-medium">{selectedPO.itemsDescription}</p>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="w-full text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
