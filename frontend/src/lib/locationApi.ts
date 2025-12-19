import { apiClient } from './apiClient';
import { Location } from '../types';

export interface LocationData {
    id?: string;
    name: string;
    floor_id: string;
    description?: string;
    createdAt?: string;
}

export const locationApi = {
  getAll: () => apiClient.get<Location[]>('/locations'),

  getByFloor: (floorId: string) => apiClient.get<Location[]>(`/locations/floor/${floorId}`),

  getById: (id: string) => apiClient.get<Location>(`/locations/${id}`),

  create: (data: LocationData) => apiClient.post<Location>('/locations', data),

  update: (id: string, data: Partial<LocationData>) =>
    apiClient.put<Location>(`/locations/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/locations/${id}`),
};
