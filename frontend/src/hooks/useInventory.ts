import { useState, useCallback, useEffect } from 'react';
import { InventoryItem, Supplier } from '../types';
import { fetchInventory, fetchSuppliers } from '../lib/inventoryPageApi';

/**
 * Custom hook to fetch and manage inventory data
 * 
 * @returns Object containing inventory items, loading state, error, and refresh function
 */
export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInventory();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(message);
      console.error('Error fetching inventory:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
  };
}

/**
 * Custom hook to fetch and manage suppliers data
 * 
 * @returns Object containing suppliers, loading state, error, and refresh function
 */
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch suppliers';
      setError(message);
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliersData();
  }, [fetchSuppliersData]);

  return {
    suppliers,
    loading,
    error,
    refresh: fetchSuppliersData,
  };
}
