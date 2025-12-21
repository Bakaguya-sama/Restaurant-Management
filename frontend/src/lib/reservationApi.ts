import { apiClient, ApiResponse } from './apiClient';
import { Reservation, ReservationData, ReservationStatus } from '../types';

export const reservationApi = {
  getAll: (filters?: {
    status?: ReservationStatus;
    customerId?: string;
    tableId?: string;
  }) => {
    // Use dedicated endpoints for single filter optimization
    if (filters?.customerId && !filters?.status && !filters?.tableId) {
      return apiClient.get<Reservation[]>(`/reservations/customer/${filters.customerId}`);
    }
    if (filters?.tableId && !filters?.status && !filters?.customerId) {
      return apiClient.get<Reservation[]>(`/reservations/table/${filters.tableId}`);
    }
    
    // Fall back to query params for multiple filters
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.tableId) params.append('tableId', filters.tableId);

    const query = params.toString();
    const endpoint = query ? `/reservations?${query}` : '/reservations';
    return apiClient.get<Reservation[]>(endpoint);
  },

  getById: (id: string) => apiClient.get<Reservation>(`/reservations/${id}`),

  getByCustomerId: (customerId: string) =>
    apiClient.get<Reservation[]>(`/reservations/customer/${customerId}`),

  getByTableId: (tableId: string) =>
    apiClient.get<Reservation[]>(`/reservations/table/${tableId}`),

  getStatistics: () =>
    apiClient.get<{
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
    }>('/reservations/statistics'),

  create: (data: ReservationData) =>
    apiClient.post<Reservation>('/reservations', data),

  update: (id: string, data: Partial<ReservationData>) =>
    apiClient.put<Reservation>(`/reservations/${id}`, data),

  updateStatus: (id: string, status: ReservationStatus) =>
    apiClient.patch<Reservation>(`/reservations/${id}/status`, { status }),

  delete: (id: string) =>
    apiClient.delete<void>(`/reservations/${id}`),

  addTable: (id: string, tableId: string) =>
    apiClient.post(`/reservations/${id}/add-table`, { table_id: tableId }),

  removeTable: (id: string, tableId: string) =>
    apiClient.delete(`/reservations/${id}/remove-table/${tableId}`),
};
