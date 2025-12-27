import { apiClient } from './apiClient';
import { Table, TableStatus } from '../types';

export interface TableData {
    id?: string;
    table_number: string;
    location_id: string;
    capacity: number;
    floor?: string;
    status?: TableStatus;
    createdAt?: string;
}

export const tableApi = {
  getAll: () => apiClient.get<Table[]>('/tables'),

  getById: (id: string) => apiClient.get<Table>(`/tables/${id}`),

  getByStatus: (status: TableStatus) => 
    apiClient.get<Table[]>(`/tables/status/${status}`),

  getByLocation: (locationId: string) => 
    apiClient.get<Table[]>(`/tables/location/${locationId}`),

  getStatusSummary: () => 
    apiClient.get<Record<TableStatus, number>>('/tables/status/summary'),

  create: (data: TableData) => apiClient.post<Table>('/tables', data),

  update: (id: string, data: Partial<TableData>) =>
    apiClient.put<Table>(`/tables/${id}`, data),

  updateStatus: (id: string, status: TableStatus, brokenReason?: string, staffId?: string) =>
    apiClient.patch<Table>(`/tables/${id}/status`, { 
      status, 
      ...(brokenReason && { brokenReason }),
      ...(staffId && { staff_id: staffId })
    }),

  delete: (id: string) => apiClient.delete<void>(`/tables/${id}`),
};
