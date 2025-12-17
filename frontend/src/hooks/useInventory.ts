import { useEffect, useState } from "react";
import { InventoryItem, Supplier } from "../types";
import { fetchInventory, fetchSuppliers } from "../lib/inventoryPageApi";

// ==================== CUSTOM HOOKS ====================

/**
 * Custom hook to fetch and manage inventory data
 * 
 * @returns Object containing inventory items, loading state, error, and refresh function
 * 
 * @example
 * ```tsx
 * const { items, loading, error, refresh } = useInventory();
 * ```
 */
export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchInventory();
      setItems(data);
    } catch (err: any) {
      console.error("Failed to load inventory:", err);
      setError(err?.message || "Không thể tải dữ liệu kho hàng");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return {
    items,
    loading,
    error,
    refresh: loadInventory,
  };
}

/**
 * Custom hook to fetch and manage suppliers data
 * 
 * @returns Object containing suppliers, loading state, error, and refresh function
 * 
 * @example
 * ```tsx
 * const { suppliers, loading, error, refresh } = useSuppliers();
 * ```
 */
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      console.error("Failed to load suppliers:", err);
      setError(err?.message || "Không thể tải dữ liệu nhà cung cấp");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    refresh: loadSuppliers,
  };
}
