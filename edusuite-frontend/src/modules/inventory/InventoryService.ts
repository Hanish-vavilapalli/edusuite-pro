import api from "@/lib/api";

export interface InventoryItem {
  id: string;
  assetTag?: string;
  name: string;
  category: "IT Hardware" | "Lab Equipment" | "Furniture" | "Stationery" | "Sports Gear" | string;
  department?: string;
  departmentId?: string | null;
  location: string;
  building?: string | null;
  room?: string | null;
  roomType?: string | null;
  serialNumber?: string;
  quantity: number;
  minThreshold: number;
  unitCost: number;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Under Maintenance" | string;
  assignedTo?: string | null;
  lastRestockedOn?: string | null;
  purchaseDate?: string | null;
  vendor?: string | null;
  remarks?: string | null;
}

export interface InventoryStats {
  department: string;
  departmentName: string;
  totalItems: number;
  totalValuation: number;
  inStockCount: number;
  lowStockCount: number;
}

/**
 * Fetch department-scoped inventory assets from PostgreSQL backend.
 * Never returns mock data. Returns empty array if none found or on error.
 */
export async function fetchInventoryItems(params?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<InventoryItem[]> {
  try {
    const res = await api.get<InventoryItem[]>("/api/inventory", { params });
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err: any) {
    console.error("[InventoryService] Failed to fetch inventory items:", err?.response?.data || err.message);
    return [];
  }
}

/**
 * Fetch department-scoped inventory summary stats from PostgreSQL backend.
 */
export async function fetchInventoryStats(): Promise<InventoryStats | null> {
  try {
    const res = await api.get<InventoryStats>("/api/inventory/stats");
    if (res && res.data) {
      return res.data;
    }
    return null;
  } catch (err: any) {
    console.error("[InventoryService] Failed to fetch inventory stats:", err?.response?.data || err.message);
    return null;
  }
}

/**
 * Register a new asset in the PostgreSQL database.
 * The backend enforces that HODs can only register assets for their own department.
 */
export async function addInventoryItem(itemData: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await api.post<InventoryItem>("/api/inventory", itemData);
  if (res && res.data && res.data.id) {
    return res.data;
  }
  const errMsg = (res.data as any)?.error || "Failed to register asset.";
  throw new Error(errMsg);
}

/**
 * Update an existing asset in the PostgreSQL database.
 * The backend verifies department ownership (rejects cross-department edits with 403).
 */
export async function updateInventoryItem(
  id: string,
  updates: Partial<InventoryItem>,
): Promise<InventoryItem> {
  const res = await api.put<InventoryItem>(`/api/inventory/${id}`, updates);
  if (res && res.data) {
    return res.data;
  }
  const errMsg = (res.data as any)?.error || "Failed to update asset.";
  throw new Error(errMsg);
}

/**
 * Restock an asset transactionally in PostgreSQL.
 * Recalculates stock status based on minThreshold.
 */
export async function restockInventoryItem(id: string, quantity: number): Promise<InventoryItem> {
  const res = await api.post<InventoryItem>(`/api/inventory/${id}/restock`, { quantity });
  if (res && res.data) {
    return res.data;
  }
  const errMsg = (res.data as any)?.error || "Failed to restock asset.";
  throw new Error(errMsg);
}

/**
 * Delete an asset from the PostgreSQL database.
 * The backend verifies department ownership (rejects cross-department deletions with 403).
 */
export async function deleteInventoryItem(id: string): Promise<boolean> {
  const res = await api.delete(`/api/inventory/${id}`);
  if (res.status === 200 || res.status === 204) {
    return true;
  }
  const errMsg = (res.data as any)?.error || "Failed to delete asset.";
  throw new Error(errMsg);
}
