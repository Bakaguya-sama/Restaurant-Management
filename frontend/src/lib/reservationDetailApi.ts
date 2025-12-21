import { apiClient, ApiResponse } from './apiClient';
import { ReservationDetail, ReservationDetailData } from '../types';

export const reservationDetailApi = {
  getAll: (filters?: { reservation_id?: string; table_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.reservation_id) params.append('reservation_id', filters.reservation_id);
    if (filters?.table_id) params.append('table_id', filters.table_id);

    const query = params.toString();
    const endpoint = query ? `/reservation-details?${query}` : '/reservation-details';
    return apiClient.get<ReservationDetail[]>(endpoint);
  },

  getByReservationId: (reservationId: string) =>
    apiClient.get<ReservationDetail[]>(
      `/reservation-details/reservation/${reservationId}`
    ),

  getByTableId: (tableId: string) =>
    apiClient.get<ReservationDetail[]>(
      `/reservation-details/table/${tableId}`
    ),

  getById: (id: string) =>
    apiClient.get<ReservationDetail>(`/reservation-details/${id}`),

  create: (data: ReservationDetailData) =>
    apiClient.post<ReservationDetail>('/reservation-details', data),

  update: (id: string, data: Partial<ReservationDetailData>) =>
    apiClient.put<ReservationDetail>(`/reservation-details/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/reservation-details/${id}`),

  deleteByReservationIdAndTableId: (
    reservationId: string,
    tableId: string
  ) =>
    apiClient.delete<void>(
      `/reservation-details?reservation_id=${reservationId}&table_id=${tableId}`
    ),
};
