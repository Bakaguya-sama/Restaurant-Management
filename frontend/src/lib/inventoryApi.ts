import { apiClient } from './apiClient';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export const inventoryApi = {
  getAll: () => apiClient.get<Ingredient[]>('/inventory'),

  getById: (id: string) => apiClient.get<Ingredient>(`/inventory/${id}`),

  update: (id: string, data: Partial<Ingredient>) =>
    apiClient.put<Ingredient>(`/inventory/${id}`, data),

  import: (items: any[]) =>
    apiClient.post('/inventory/import', { items }),

  export: (data: any) =>
    apiClient.post('/inventory/export', data),
};
