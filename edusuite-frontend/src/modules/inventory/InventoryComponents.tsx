import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle,
  Search,
  RefreshCw,
  Download,
  Filter,
  Layers,
  Edit,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  Building2,
  DollarSign,
  Box,
  PlusCircle,
  Barcode,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useRole } from "@/context/role-context";

import {
  fetchInventoryItems,
  fetchInventoryStats,
  addInventoryItem,
  updateInventoryItem,
  restockInventoryItem,
  deleteInventoryItem,
  type InventoryItem,
  type InventoryStats,
} from "./InventoryService";

const CATEGORIES = [
  "All Categories",
  "IT Hardware",
  "Lab Equipment",
  "Furniture",
  "Stationery",
  "Sports Gear",
];

const STATUS_OPTIONS = ["All Statuses", "In Stock", "Low Stock", "Out of Stock", "Under Maintenance"];

export function InventoryModuleView() {
  const { role, flags, department: userDept } = useRole();
  const isHod = role === "hod" || flags?.includes("isHod");

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "IT Hardware",
    quantity: 10,
    minThreshold: 5,
    unitCost: 5000,
    location: "",
    building: "Block A",
    room: "",
    roomType: "Lab",
    serialNumber: "",
    status: "In Stock",
    assignedTo: "",
    vendor: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, statsData] = await Promise.all([
        fetchInventoryItems(),
        fetchInventoryStats(),
      ]);
      setItems(itemsData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Error loading inventory:", err);
      toast.error("Failed to load department inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic (operates strictly over department-scoped assets returned by PostgreSQL)
  const filtered = items.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.assetTag && item.assetTag.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(q)) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All Statuses" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Metrics (strictly scoped to authenticated HOD's department from PostgreSQL)
  const totalItems = stats?.totalItems ?? items.length;
  const totalValuation = stats?.totalValuation ?? items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
  const inStockCount = stats?.inStockCount ?? items.filter((i) => i.status === "In Stock").length;
  const lowStockCount = stats?.lowStockCount ?? items.filter((i) => i.status !== "In Stock").length;

  // Handlers
  const handleOpenAdd = () => {
    const currentDept = stats?.department || userDept || "CSE";
    setFormData({
      name: "",
      category: "IT Hardware",
      quantity: 25,
      minThreshold: 5,
      unitCost: 15000,
      location: `${currentDept} Lab 1 (Block A)`,
      building: "Block A",
      room: "Lab 1",
      roomType: "Lab",
      serialNumber: `SN-${currentDept}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "In Stock",
      assignedTo: "",
      vendor: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleOpenView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleOpenRestock = (item: InventoryItem) => {
    setSelectedItem(item);
    setRestockQty(10);
    setIsRestockDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Please provide an asset item name.");
      return;
    }
    try {
      const created = await addInventoryItem(formData);
      setItems((prev) => [created, ...prev]);
      const updatedStats = await fetchInventoryStats();
      if (updatedStats) setStats(updatedStats);
      setIsAddDialogOpen(false);
      toast.success(`Asset "${created.name}" registered with ID ${created.id}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to register asset.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      const qty = Number(formData.quantity) || 0;
      const min = Number(formData.minThreshold) || 5;
      const computedStatus = qty === 0 ? "Out of Stock" : qty <= min ? "Low Stock" : "In Stock";

      const updatedData = { ...formData, status: computedStatus };
      const updated = await updateInventoryItem(selectedItem.id, updatedData);
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? updated : i)),
      );
      const updatedStats = await fetchInventoryStats();
      if (updatedStats) setStats(updatedStats);
      setIsEditDialogOpen(false);
      toast.success(`Asset "${updated.name}" updated successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset.");
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      const updated = await restockInventoryItem(selectedItem.id, Number(restockQty));
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? updated : i)),
      );
      const updatedStats = await fetchInventoryStats();
      if (updatedStats) setStats(updatedStats);
      setIsRestockDialogOpen(false);
      toast.success(
        `Restocked ${restockQty} units of ${updated.name}. New Quantity: ${updated.quantity} (${updated.status})!`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to restock asset.");
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (confirm(`Are you sure you want to delete asset ${item.name} (${item.id})?`)) {
      try {
        await deleteInventoryItem(item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        const updatedStats = await fetchInventoryStats();
        if (updatedStats) setStats(updatedStats);
        toast.success(`Asset ${item.name} deleted from inventory.`);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete asset.");
      }
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Asset Name",
      "Category",
      "Department",
      "Quantity",
      "Min Threshold",
      "Unit Cost (INR)",
      "Total Valuation (INR)",
      "Location",
      "Serial Number",
      "Status",
      "Assigned To",
      "Last Restocked",
    ];
    const rows = filtered.map((i) => [
      i.id,
      `"${i.name}"`,
      i.category,
      `"${i.department || stats?.department || ""}"`,
      i.quantity,
      i.minThreshold,
      i.unitCost,
      i.quantity * i.unitCost,
      `"${i.location}"`,
      `"${i.serialNumber || "N/A"}"`,
      i.status,
      `"${i.assignedTo || "N/A"}"`,
      i.lastRestockedOn || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const deptCode = stats?.department || userDept || "All";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Inventory_Catalog_${deptCode}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} department inventory items to CSV!`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Package className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                Inventory & Asset Tracking Module
              </h1>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                {stats?.departmentName ? `${stats.departmentName}` : isHod ? `${userDept || "Department"} Scope` : "Institution Scope"}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Track department lab equipment, IT assets, classrooms, staff areas, and department stores.
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
            <Download className="size-3.5" /> Export Catalog
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="h-9 bg-brand-gradient text-white gap-2 font-semibold text-xs shadow-glow hover:opacity-95"
          >
            <Plus className="size-4" /> Register New Asset
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total Unique Assets</span>
            <Box className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-primary">{totalItems} Items</p>
          <p className="text-[0.68rem] text-muted-foreground">Cataloged across department labs & stores</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Total Inventory Value</span>
            <DollarSign className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600">
            ₹{totalValuation.toLocaleString("en-IN")}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">Department asset valuation</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Healthy Stock</span>
            <CheckCircle className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600">{inStockCount} Items</p>
          <p className="text-[0.68rem] text-muted-foreground">Above minimum threshold</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600">{lowStockCount} Items</p>
          <p className="text-[0.68rem] text-amber-600 font-medium">Reorder required</p>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by asset name, category, location, serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs" aria-label="Category Filter">
              <Layers className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs" aria-label="Status Filter">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((st) => (
                <SelectItem key={st} value={st} className="text-xs">
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/40 self-end sm:self-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="size-7 rounded-md"
            title="Grid View"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
            className="size-7 rounded-md"
            title="Table View"
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Assets View (Grid vs Table) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <RefreshCw className="size-5 animate-spin text-primary" />
          Loading asset catalog...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <Package className="size-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            {items.length === 0
              ? "No inventory assets found for your department."
              : "No assets match your search filters."}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {items.length === 0
              ? "No equipment or facilities have been cataloged yet for your department."
              : "Try adjusting your search query, category, or status filter."}
          </p>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All Categories");
                setSelectedStatus("All Statuses");
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-[0.68rem] bg-muted">
                    {item.id}
                  </Badge>
                  <Badge
                    className={
                      item.status === "In Stock"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                        : item.status === "Low Stock"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.68rem]"
                        : "bg-red-500/10 text-red-600 border-red-500/20 text-[0.68rem]"
                    }
                  >
                    {item.status !== "In Stock" && <AlertTriangle className="size-3 mr-1 inline" />}
                    {item.status === "In Stock" && <CheckCircle className="size-3 mr-1 inline" />}
                    {item.status}
                  </Badge>
                </div>

                {/* Name & Category */}
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Category: <span className="font-semibold text-primary">{item.category}</span>
                  </p>
                </div>

                {/* Location & Serial */}
                <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary/70 shrink-0" /> Location:
                    </span>
                    <span className="font-medium text-foreground truncate max-w-[200px]">
                      {item.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Barcode className="size-3.5 text-primary/70 shrink-0" /> Serial No:
                    </span>
                    <span className="font-mono text-foreground">{item.serialNumber || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-mono">
                    <div>
                      <span className="text-muted-foreground font-sans">Stock: </span>
                      <span className="font-bold text-foreground text-sm">{item.quantity}</span>
                      <span className="text-[0.65rem] text-muted-foreground ml-1">
                        (Min: {item.minThreshold})
                      </span>
                    </div>
                    <div className="text-right font-bold text-emerald-600">
                      ₹{item.unitCost.toLocaleString("en-IN")} / unit
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenView(item)}
                  className="h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="size-3.5" /> Details
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenRestock(item)}
                    className="h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 gap-1 px-2"
                  >
                    <PlusCircle className="size-3.5" /> Restock
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(item)}
                    className="size-8 text-muted-foreground hover:text-primary"
                    title="Edit Asset"
                  >
                    <Edit className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item)}
                    className="size-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                    title="Delete Asset"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[0.68rem]">
                <tr>
                  <th className="p-3.5 pl-4">Asset ID</th>
                  <th className="p-3.5">Asset Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 font-mono">Qty (Min)</th>
                  <th className="p-3.5 font-mono">Unit Cost</th>
                  <th className="p-3.5 font-mono">Total Valuation</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-bold text-foreground">
                      {item.id}
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">{item.name}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="font-mono text-[0.68rem]">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{item.location}</td>
                    <td className="p-3.5 font-mono font-bold text-foreground">
                      {item.quantity} <span className="text-[0.65rem] font-normal text-muted-foreground">({item.minThreshold})</span>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      ₹{item.unitCost.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">
                      ₹{(item.quantity * item.unitCost).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        className={
                          item.status === "In Stock"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[0.68rem]"
                            : item.status === "Low Stock"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[0.68rem]"
                            : "bg-red-500/10 text-red-600 border-red-500/20 text-[0.68rem]"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRestock(item)}
                          className="h-7 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          + Restock
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenView(item)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="size-7 text-muted-foreground hover:text-primary"
                          title="Edit Asset"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          className="size-7 text-muted-foreground hover:text-red-600"
                          title="Delete Asset"
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
        </div>
      )}

      {/* DIALOG 1: REGISTER NEW ASSET MODAL */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Register New Campus Asset
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add lab equipment, IT hardware, or classroom assets to your department inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Asset Name *</Label>
                <Input
                  required
                  placeholder="e.g. Cisco Catalyst Switches"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department Scope</Label>
                <Input
                  disabled
                  value={stats?.departmentName || userDept || "CSE"}
                  className="h-9 text-xs bg-muted text-muted-foreground font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Campus Location</Label>
                <Input
                  required
                  placeholder="e.g. CSE Lab 1 (Block A)"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Initial Quantity</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Min Threshold (Reorder Point)</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={formData.minThreshold || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, minThreshold: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Unit Cost (₹)</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.unitCost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, unitCost: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Serial / Model Number</Label>
                <Input
                  placeholder="e.g. SN-CISCO-88102"
                  value={formData.serialNumber || ""}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Register Asset Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT ASSET MODAL */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit className="size-5 text-primary" /> Edit Asset ({selectedItem?.id})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update quantity, location, reorder thresholds, and serial numbers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Asset Name</Label>
                <Input
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Current Quantity</Label>
                <Input
                  type="number"
                  required
                  value={formData.quantity ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Min Threshold Point</Label>
                <Input
                  type="number"
                  required
                  value={formData.minThreshold ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, minThreshold: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Unit Cost (₹)</Label>
                <Input
                  type="number"
                  required
                  value={formData.unitCost ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, unitCost: Number(e.target.value) })
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Campus Location</Label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Serial Number</Label>
              <Input
                value={formData.serialNumber || ""}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-gradient text-white text-xs font-semibold">
                Save Asset Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: RESTOCK QUANTITY MODAL */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <PlusCircle className="size-5 text-emerald-600" /> Restock Asset ({selectedItem?.name})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add new stock units received from purchase order delivery.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <form onSubmit={handleRestockSubmit} className="space-y-4 pt-1">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Current Stock: </span>
                  <span className="font-bold font-mono text-foreground text-sm">
                    {selectedItem.quantity} units
                  </span>
                  <span className="text-[0.68rem] text-muted-foreground ml-1">
                    (Min: {selectedItem.minThreshold})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span className="font-medium text-foreground">{selectedItem.location}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Additional Units to Add *</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <DialogFooter className="pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRestockDialogOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Confirm Restock (+{restockQty} units)
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: VIEW ASSET DOSSIER MODAL */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="size-5 text-primary" /> Asset Specification Dossier
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedItem.id}
                  </Badge>
                  <Badge
                    className={
                      selectedItem.status === "In Stock"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
                <h2 className="text-base font-bold text-foreground">{selectedItem.name}</h2>
                <p className="text-xs text-primary font-medium">{selectedItem.category}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 font-mono">
                  <span className="text-muted-foreground font-sans">Current Quantity:</span>
                  <span className="font-bold text-foreground text-sm">
                    {selectedItem.quantity} units (Min: {selectedItem.minThreshold})
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 font-mono">
                  <span className="text-muted-foreground font-sans">Unit Cost:</span>
                  <span className="font-bold text-foreground">
                    ₹{selectedItem.unitCost.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30 font-mono">
                  <span className="text-foreground font-bold font-sans">TOTAL VALUATION:</span>
                  <span className="font-bold text-base text-primary">
                    ₹{(selectedItem.quantity * selectedItem.unitCost).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium text-foreground">{selectedItem.department || stats?.department || "CSE"}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Campus Location:</span>
                  <span className="font-medium text-foreground">{selectedItem.location}</span>
                </div>

                {selectedItem.building && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-muted-foreground">Building / Room:</span>
                    <span className="font-medium text-foreground">
                      {selectedItem.building} {selectedItem.room ? `- ${selectedItem.room}` : ""}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Serial Number:</span>
                  <span className="font-mono text-foreground">
                    {selectedItem.serialNumber || "N/A"}
                  </span>
                </div>

                {selectedItem.assignedTo && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-muted-foreground">Assigned To:</span>
                    <span className="font-medium text-foreground">{selectedItem.assignedTo}</span>
                  </div>
                )}

                {selectedItem.vendor && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="font-medium text-foreground">{selectedItem.vendor}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Last Restocked:</span>
                  <span className="font-mono text-foreground">
                    {selectedItem.lastRestockedOn || "N/A"}
                  </span>
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
