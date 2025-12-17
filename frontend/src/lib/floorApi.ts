import { apiClient } from './apiClient';
import { Floor } from '../types';

export interface FloorData {
  floor_name: string;
  floor_number: number;
  description?: string;
}

export const floorApi = {
  getAll: () => apiClient.get<Floor[]>('/floors'),

  getById: (id: string) => apiClient.get<Floor>(`/floors/${id}`),

  create: (data: FloorData) => apiClient.post<Floor>('/floors', data),

  update: (id: string, data: Partial<FloorData>) =>
    apiClient.put<Floor>(`/floors/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/floors/${id}`),
};
