import { apiClient, ApiResponse } from './apiClient';

export interface InvoiceData {
  invoice_number?: string;
  order_id: string;
  staff_id: string;
  customer_id?: string;
  subtotal: number;
  tax?: number;
  discount_amount?: number;
  total_amount: number;
  payment_method?: 'cash' | 'card' | 'online' | 'wallet';
  payment_status?: 'pending' | 'paid' | 'cancelled';
  promo_codes?: string[];
}

export interface Invoice {
  id: string;
  _id?: string;
  invoice_number: string;
  order_id: string;
  staff_id: string;
  customer_id?: string;
  subtotal: number;
  tax: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: 'cash' | 'card' | 'online' | 'wallet';
  payment_status: 'pending' | 'paid' | 'cancelled';
  paid_at?: string;
  created_at: string;
  updated_at: string;
  Order?: any;
  Staff?: any;
  Customer?: any;
  Promotions?: any[];
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  cancelledInvoices: number;
  averageInvoiceValue: number;
}

export interface RevenueData {
  totalRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
}

class InvoiceApi {
  private baseEndpoint = '/invoices';

  async getAll(filters?: {
    payment_status?: 'pending' | 'paid' | 'cancelled';
    payment_method?: 'cash' | 'card' | 'online' | 'wallet';
    customer_id?: string;
    staff_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<ApiResponse<Invoice[]>> {
    const params = new URLSearchParams();
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.customer_id) params.append('customer_id', filters.customer_id);
    if (filters?.staff_id) params.append('staff_id', filters.staff_id);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    const endpoint = query ? `${this.baseEndpoint}?${query}` : this.baseEndpoint;

    return apiClient.get<Invoice[]>(endpoint);
  }

  async getById(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`${this.baseEndpoint}/${id}`);
  }

  async getByInvoiceNumber(invoiceNumber: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`${this.baseEndpoint}/number/${invoiceNumber}`);
  }

  async getByOrderId(orderId: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`${this.baseEndpoint}/order/${orderId}`);
  }

  async create(data: InvoiceData): Promise<ApiResponse<Invoice>> {
    return apiClient.post<Invoice>(this.baseEndpoint, data);
  }

  async update(id: string, data: Partial<InvoiceData>): Promise<ApiResponse<Invoice>> {
    return apiClient.put<Invoice>(`${this.baseEndpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async markAsPaid(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.patch<Invoice>(`${this.baseEndpoint}/${id}/paid`, {});
  }

  async cancel(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.patch<Invoice>(`${this.baseEndpoint}/${id}/cancel`, {});
  }

  async getStatistics(): Promise<ApiResponse<InvoiceStatistics>> {
    return apiClient.get<InvoiceStatistics>(`${this.baseEndpoint}/statistics`);
  }

  async getRevenue(startDate: string, endDate: string): Promise<ApiResponse<RevenueData>> {
    return apiClient.get<RevenueData>(`${this.baseEndpoint}/revenue?start_date=${startDate}&end_date=${endDate}`);
  }
}

export const invoiceApi = new InvoiceApi();
