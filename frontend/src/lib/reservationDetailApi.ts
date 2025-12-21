import { apiClient, ApiResponse } from './apiClient';
import { ReservationDetail, ReservationDetailData } from '../types';

export const reservationDetailApi = {
  getByReservationId: (reservationId: string) =>
    apiClient.get<ReservationDetail[]>(
      `/reservationdetails?reservation_id=${reservationId}`
    ),

  getById: (id: string) =>
    apiClient.get<ReservationDetail>(`/reservationdetails/${id}`),

  create: (data: ReservationDetailData) =>
    apiClient.post<ReservationDetail>('/reservationdetails', data),

  update: (id: string, data: Partial<ReservationDetailData>) =>
    apiClient.put<ReservationDetail>(`/reservationdetails/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/reservationdetails/${id}`),

  deleteByReservationIdAndTableId: (
    reservationId: string,
    tableId: string
  ) =>
    apiClient.delete<void>(
      `/reservationdetails?reservation_id=${reservationId}&table_id=${tableId}`
    ),
};
