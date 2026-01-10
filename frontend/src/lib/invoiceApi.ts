import { apiClient } from './apiClient';

export interface Invoice {
  _id?: string;
  id?: string;
  invoice_number: string;
  order_id: string;
  staff_id?: string;
  customer_id?: string;
  invoice_date?: string;
  subtotal: number;
  tax: number;
  discount_amount?: number;
  total_amount: number;
  payment_method?: 'cash' | 'card' | 'transfer' | 'e-wallet';
  payment_status?: 'pending' | 'paid' | 'cancelled';
  points_used?: number;
  points_earned?: number;
  paid_at?: string;
  created_at?: string;
}

export interface CreateInvoiceParams {
  order_id: string;
  customer_id?: string;
  payment_method?: string;
  notes?: string;
}

export interface UpdateInvoiceParams {
  payment_method?: string;
  points_used?: number;
  notes?: string;
}

export interface InvoiceStatistics {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  cancelledInvoices: number;
}

export const invoiceApi = {
  getAll: (params?: { 
    status?: string; 
    search?: string; 
    start_date?: string; 
    end_date?: string;
    customer_id?: string;
    payment_status?: string;
    payment_method?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);

    const query = queryParams.toString();
    const endpoint = query ? `/invoices?${query}` : '/invoices';
    return apiClient.get<Invoice[]>(endpoint);
  },

  getByCustomerId: (customerId: string) => 
    apiClient.get<Invoice[]>(`/invoices?customer_id=${customerId}`),

  getById: (id: string) => 
    apiClient.get<Invoice>(`/invoices/${id}`),

  getByInvoiceNumber: (invoiceNumber: string) => 
    apiClient.get<Invoice>(`/invoices/number/${invoiceNumber}`),

  getByOrderId: (orderId: string) => 
    apiClient.get<Invoice>(`/invoices/order/${orderId}`),

  create: (params: CreateInvoiceParams) => 
    apiClient.post<Invoice>('/invoices', params),

  update: (id: string, params: UpdateInvoiceParams) => 
    apiClient.put<Invoice>(`/invoices/${id}`, params),

  delete: (id: string) => 
    apiClient.delete(`/invoices/${id}`),

  markAsPaid: (
    id: string, 
    payment_method?: string,
    promotion_id?: string | null,
    points_used?: number
  ) => 
    apiClient.patch<Invoice>(`/invoices/${id}/paid`, { 
      payment_method,
      promotion_id,
      points_used
    }),

  cancel: (id: string) => 
    apiClient.patch<Invoice>(`/invoices/${id}/cancel`, {}),

  getStatistics: () => 
    apiClient.get<InvoiceStatistics>(`/invoices/statistics`),

  getRevenue: (start_date: string, end_date: string) => 
    apiClient.get<any>(`/invoices/revenue?start_date=${start_date}&end_date=${end_date}`),
};
