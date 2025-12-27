import { InventoryItem, Supplier } from "../types";

// ==================== TYPE DEFINITIONS ====================

export interface InventoryBatchDTO {
  id: string;
  ingredientId: string | null;
  name: string | null;
  quantity: number;
  unit: string | null;
  expiryDate: string | null;
  supplierName: string | null;
  lastUpdated: string | null;
}

export interface SupplierDTO {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface ImportItemsParams {
  items: Array<{
    itemId?: string; // Optional for new ingredients
    name?: string; // Required for new ingredients
    unit?: string; // Required for new ingredients
    unitPrice?: number; // Optional for new ingredients
    quantity: number;
    supplierId: string;
    expiryDate: string;
  }>;
}

export interface ExportItemsParams {
  items: Array<{
    itemId: string;
    quantity: number;
    reason: string;
  }>;
}

// ==================== API CONFIGURATION ====================
import { API_BASE_URL } from "./api";

// ==================== UTILITY FUNCTIONS ====================

/**
 * Map API batch data to InventoryItem format for UI
 */
export function mapInventoryBatchToInventoryItem(
  batch: InventoryBatchDTO
): InventoryItem {
  return {
    id: batch.id,
    ingredientId: batch.ingredientId || batch.id,
    name: batch.name || "",
    quantity: batch.quantity,
    unit: batch.unit || "",
    expiryDate: batch.expiryDate || undefined,
    supplierId: batch.supplierName || "",
    lastUpdated: batch.lastUpdated || new Date().toISOString(),
  };
}

/**
 * Map API supplier data to Supplier format for UI
 */
export function mapSupplierDTOToSupplier(supplier: SupplierDTO): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    phone: supplier.phone,
    address: supplier.address,
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch inventory items from backend API
 */
export async function fetchInventory(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/inventory`);

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory: ${response.status}`);
  }

  const json = await response.json();
  const batches = (json?.data || []) as InventoryBatchDTO[];

  return batches.map(mapInventoryBatchToInventoryItem);
}

/**
 * Fetch suppliers from backend API
 */
export async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${API_BASE_URL}/suppliers`);

  if (!response.ok) {
    throw new Error(`Failed to fetch suppliers: ${response.status}`);
  }

  const json = await response.json();
  const suppliers = (json?.data || []) as SupplierDTO[];

  return suppliers.map(mapSupplierDTOToSupplier);
}

/**
 * Import items to inventory
 */
export async function importInventoryItems(
  params: ImportItemsParams
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/inventory/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || "Failed to import items");
  }
}

/**
 * Export/dispose items from inventory
 */
export async function exportInventoryItems(
  params: ExportItemsParams
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/inventory/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || "Failed to export items");
  }
}

/**
 * Fetch export history (disposals/exports)
 */
export interface ExportItemDTO {
  name: string;
  quantity: number;
  unit?: string | null;
  unitPrice?: number | null;
}

export interface ExportOrderDTO {
  id: string;
  code?: string | null;
  staffName?: string | null;
  items: ExportItemDTO[];
  date: string;
  total?: number | null;
  reason?: string | null;
}

export async function fetchExportHistory(): Promise<ExportOrderDTO[]> {
  const response = await fetch(`${API_BASE_URL}/inventory/exports`);
  if (!response.ok) {
    throw new Error(`Failed to fetch export history: ${response.status}`);
  }
  const json = await response.json();
  return (json?.data || []) as ExportOrderDTO[];
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(
  id: string,
  updates: {
    name?: string;
    unit?: string;
    expiryDate?: string;
    supplierId?: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || "Failed to update item");
  }
}

/**
 * Create new supplier
 */
export async function createSupplier(supplier: {
  name: string;
  phone: string;
  address: string;
}): Promise<Supplier> {
  const response = await fetch(`${API_BASE}/suppliers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || "Failed to create supplier");
  }

  const json = await response.json();
  return mapSupplierDTOToSupplier(json.data);
}

/**
 * Update supplier
 */
export async function updateSupplier(
  id: string,
  supplier: { name: string; phone: string; address: string }
): Promise<void> {
  const response = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || "Failed to update supplier");
  }
}

/**
 * Delete supplier
 */
export async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || "Failed to delete supplier");
  }
}
