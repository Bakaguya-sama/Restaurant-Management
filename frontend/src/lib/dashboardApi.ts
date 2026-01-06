import { apiClient } from './apiClient';

export interface DashboardStatistics {
  invoices: {
    count: number;
    revenue: number;
    list: Array<{
      id: string;
      date: string;
      customer: string;
      items: number;
      total: number;
      status: string;
    }>;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  topDishes: Array<{
    name: string;
    sold: number;
    revenue: number;
  }>;
  lowDishes: Array<{
    name: string;
    sold: number;
    revenue: number;
  }>;
  damagedItems: Array<{
    name: string;
    quantity: number;
    value: number;
    date: string;
    reason: string;
  }>;
  bookings: {
    count: number;
    guests: number;
  };
  newCustomers: number;
}

export interface InventoryAlert {
  name: string;
  current: number;
  minimum: number;
  expiryDate: string | null;
  status: 'low' | 'expiring' | 'expired' | 'ok';
}

export interface CustomerStatistics {
  total: number;
  vip: number;
  new: number;
  returning: number;
  avgSpending: number;
  segments?: Array<{
    tier: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
}

export interface Feedback {
  customer: string;
  comment: string;
  date: string;
  rating: number;
}

export const dashboardApi = {
  /**
   * Get dashboard statistics by date range
   * @param range - 'today', 'week', or 'month'
   * @param page - Page number for invoice list (default: 1)
   * @param limit - Items per page (default: 5)
   */
  getStatistics: (range: 'today' | 'week' | 'month' = 'week', page: number = 1, limit: number = 5) =>
    apiClient.get<DashboardStatistics>(`/dashboard/statistics?range=${range}&page=${page}&limit=${limit}`),

  /**
   * Get inventory alerts (low stock and expiring items)
   */
  getInventoryAlerts: () =>
    apiClient.get<InventoryAlert[]>('/dashboard/inventory-alerts'),

  /**
   * Get customer statistics
   */
  getCustomerStatistics: () =>
    apiClient.get<CustomerStatistics>('/dashboard/customer-statistics'),

  /**
   * Get recent feedback
   * @param limit - Number of recent feedback to fetch (default: 5)
   * @param range - Date range filter: 'today', 'week', or 'month' (default: 'week')
   */
  getRecentFeedback: (limit: number = 5, range: 'today' | 'week' | 'month' = 'week') =>
    apiClient.get<Feedback[]>(`/dashboard/recent-feedback?limit=${limit}&range=${range}`),
};
