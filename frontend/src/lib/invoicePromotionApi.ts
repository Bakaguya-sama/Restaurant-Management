import { apiClient } from './apiClient';

export interface InvoicePromotion {
  _id?: string;
  id?: string;
  invoice_id: any;
  promotion_id: any;
  discount_applied: number;
  created_at?: string;
  updated_at?: string;
}

export const invoicePromotionApi = {
  getAll: (params?: {
    invoice_id?: string;
    promotion_id?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.invoice_id) queryParams.append('invoice_id', params.invoice_id);
    if (params?.promotion_id) queryParams.append('promotion_id', params.promotion_id);

    const query = queryParams.toString();
    const endpoint = query ? `/invoice-promotions?${query}` : '/invoice-promotions';
    return apiClient.get<InvoicePromotion[]>(endpoint);
  },

  getById: (id: string) => 
    apiClient.get<InvoicePromotion>(`/invoice-promotions/${id}`),

  getByInvoiceId: (invoiceId: string) => 
    apiClient.get<InvoicePromotion[]>(`/invoice-promotions?invoice_id=${invoiceId}`),

  getByPromotionId: (promotionId: string) => 
    apiClient.get<InvoicePromotion[]>(`/invoice-promotions?promotion_id=${promotionId}`),

  create: (data: Omit<InvoicePromotion, '_id' | 'id' | 'created_at' | 'updated_at'>) => 
    apiClient.post<InvoicePromotion>('/invoice-promotions', data),

  delete: (id: string) => 
    apiClient.delete(`/invoice-promotions/${id}`),
};
