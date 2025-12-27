import { apiClient } from './apiClient';
import { Dish } from '../types';


export interface DishData {
  id?: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  is_available: boolean;
}


export const dishApi = {
  getAll: () => apiClient.get<Dish[]>('/dishes'),

  getById: (id: string) => apiClient.get<Dish>(`/dishes/${id}`),

  getByCategory: (category: string) => 
    apiClient.get<Dish[]>(`/dishes/category/${category}`),

  create: (data: DishData) => apiClient.post<Dish>('/dishes', data),

  update: (id: string, data: Partial<DishData>) =>
    apiClient.put<Dish>(`/dishes/${id}`, data),

  delete: (id: string) => apiClient.delete(`/dishes/${id}`),

  toggleAvailability: (id: string, is_available: boolean, staffId?: string, reason?: string) => {
    const payload: any = { is_available };
    if (reason) {
      payload.reason = reason;
    }
    if (!is_available && staffId) {
      payload.manual_unavailable_by = staffId;
    }
    return apiClient.patch<Dish>(`/dishes/${id}/availability`, payload);
  },
};
