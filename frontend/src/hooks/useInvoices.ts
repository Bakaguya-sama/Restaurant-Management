import { useState, useCallback, useEffect } from 'react';
import { Invoice, invoiceApi } from '../lib/invoiceApi';

export function useInvoices(filters?: {
  status?: string;
  customer_id?: string;
  payment_status?: string;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceApi.getAll(filters);
      setInvoices(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoices';
      setError(message);
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getInvoiceById = async (id: string) => {
    try {
      setError(null);
      const response = await invoiceApi.getById(id);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoice';
      setError(message);
      throw err;
    }
  };

  const getInvoicesByCustomerId = async (customerId: string) => {
    try {
      setError(null);
      const response = await invoiceApi.getByCustomerId(customerId);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch customer invoices';
      setError(message);
      throw err;
    }
  };

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    getInvoiceById,
    getInvoicesByCustomerId,
  };
}
