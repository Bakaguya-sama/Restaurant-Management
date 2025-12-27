import { apiClient } from './apiClient';
import { getApiBaseUrl } from './apiConfig';

// ==================== TYPE DEFINITIONS ====================

export interface Invoice {
  _id?: string;
  id?: string;
  invoice_number: string;
  order_id: string;
  customer_id?: string;
  total_amount: number;
  tax: number;
  subtotal: number;
  discount?: number;
  payment_method?: string;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInvoiceParams {
  order_id: string;
  customer_id?: string;
  payment_method?: string;
  notes?: string;
}

export interface UpdateInvoiceParams {
  payment_method?: string;
  notes?: string;
}

export interface InvoiceStatistics {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  cancelledInvoices: number;
}

// ==================== INVOICE API ====================

// API base URL is now dynamically determined from apiConfig
// Falls back to localhost:5000 if not configured

export const invoiceApi = {
  /**
   * Get all invoices with optional filtering and search
   */
  getAll: async (params?: { status?: string; search?: string; start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await fetch(`${getApiBaseUrl()}/invoices?${queryParams}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch invoices');
    }

    return result.data;
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: string) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/${id}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch invoice');
    }

    return result.data;
  },

  /**
   * Get invoice by invoice number
   */
  getByInvoiceNumber: async (invoiceNumber: string) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/number/${invoiceNumber}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch invoice');
    }

    return result.data;
  },

  /**
   * Get invoice by order ID
   */
  getByOrderId: async (orderId: string) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/order/${orderId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch invoice');
    }

    return result.data;
  },

  /**
   * Create a new invoice
   */
  create: async (params: CreateInvoiceParams) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create invoice');
    }

    return result.data;
  },

  /**
   * Update invoice details
   */
  update: async (id: string, params: UpdateInvoiceParams) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update invoice');
    }

    return result.data;
  },

  /**
   * Delete invoice
   */
  delete: async (id: string) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete invoice');
    }

    return result.data;
  },

  /**
   * Mark invoice as paid
   */
  markAsPaid: async (id: string) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/${id}/paid`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to mark invoice as paid');
    }

    return result.data;
  },

  /**
   * Cancel invoice
   */
  cancel: async (id: string) => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to cancel invoice');
    }

    return result.data;
  },

  /**
   * Get invoice statistics
   */
  getStatistics: async (): Promise<InvoiceStatistics> => {
    const response = await fetch(`${getApiBaseUrl()}/invoices/statistics`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch statistics');
    }

    return result.data;
  },

  /**
   * Get revenue data for a date range
   */
  getRevenue: async (start_date: string, end_date: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('start_date', start_date);
    queryParams.append('end_date', end_date);

    const response = await fetch(`${getApiBaseUrl()}/invoices/revenue?${queryParams}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch revenue data');
    }

    return result.data;
  },
};
