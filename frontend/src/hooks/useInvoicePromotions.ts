import { useState, useCallback, useEffect } from 'react';
import { InvoicePromotion, invoicePromotionApi } from '../lib/invoicePromotionApi';

export function useInvoicePromotions(filters?: {
  invoice_id?: string;
  promotion_id?: string;
}) {
  const [invoicePromotions, setInvoicePromotions] = useState<InvoicePromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoicePromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoicePromotionApi.getAll(filters);
      setInvoicePromotions(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoice promotions';
      setError(message);
      console.error('Error fetching invoice promotions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoicePromotions();
  }, [fetchInvoicePromotions]);

  const getByInvoiceId = async (invoiceId: string) => {
    try {
      setError(null);
      const response = await invoicePromotionApi.getByInvoiceId(invoiceId);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoice promotions';
      setError(message);
      throw err;
    }
  };

  const getByPromotionId = async (promotionId: string) => {
    try {
      setError(null);
      const response = await invoicePromotionApi.getByPromotionId(promotionId);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoice promotions';
      setError(message);
      throw err;
    }
  };

  return {
    invoicePromotions,
    loading,
    error,
    fetchInvoicePromotions,
    getByInvoiceId,
    getByPromotionId,
  };
}
