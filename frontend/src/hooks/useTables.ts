import { useState, useCallback, useEffect } from 'react';
import { Table, TableStatus } from '../types';
import { tableApi, TableData } from '../lib/tableApi';

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tableApi.getAll();
      setTables(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tables';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const createTable = async (data: TableData) => {
    try {
      setError(null);
      const response = await tableApi.create(data);
      const newTable = response.data;
      setTables([...tables, newTable]);
      return newTable;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create table';
      setError(message);
      throw err;
    }
  };

  const updateTable = async (id: string, data: Partial<TableData>) => {
    try {
      setError(null);
      const response = await tableApi.update(id, data);
      const updated = response.data;
      setTables(tables.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update table';
      setError(message);
      throw err;
    }
  };

  const updateTableStatus = async (id: string, status: TableStatus, brokenReason?: string) => {
    try {
      setError(null);
      const response = await tableApi.updateStatus(id, status, brokenReason);
      const updated = response.data;
      setTables(tables.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update table status';
      setError(message);
      throw err;
    }
  };

  const deleteTable = async (id: string) => {
    try {
      setError(null);
      await tableApi.delete(id);
      setTables(tables.filter(t => t.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete table';
      setError(message);
      throw err;
    }
  };

  return {
    tables,
    setTables,
    loading,
    error,
    fetchTables,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
  };
}
