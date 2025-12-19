import { useState, useEffect } from "react";
import { fetchTables, TableDTO } from "../lib/orderingPageApi";

interface UseTablesResult {
  tables: TableDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch tables from API
 * @param status - Optional status filter
 */
export function useTables(
  status?: "available" | "occupied" | "reserved" | "maintenance"
): UseTablesResult {
  const [tables, setTables] = useState<TableDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTables(status);
      setTables(data);
    } catch (err: any) {
      console.error("Error fetching tables:", err);
      setError(err.message || "Failed to fetch tables");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  return {
    tables,
    isLoading,
    error,
    refetch: fetchData,
  };
}
