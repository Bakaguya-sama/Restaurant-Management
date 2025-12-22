import { apiClient } from './apiClient';
import { Promotion } from '../types';

export interface PromotionData {
  name: string;
  promotion_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount?: number;
  promo_code?: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  max_uses?: number;
}

export const promotionApi = {
  getAll: () => apiClient.get<Promotion[]>('/promotions'),

  getById: (id: string) => apiClient.get<Promotion>(`/promotions/${id}`),

  getByPromoCode: (code: string) => apiClient.get<Promotion>(`/promotions/code/${code}`),

  validatePromoCode: (code: string, orderAmount?: number) => 
    apiClient.post<{ valid: boolean; promotion?: Promotion; discount?: number }>('/promotions/validate', { 
      promo_code: code,
      order_amount: orderAmount 
    }),

  getStatistics: () => apiClient.get<any>('/promotions/statistics'),

  create: (data: PromotionData) => apiClient.post<Promotion>('/promotions', data),

  update: (id: string, data: Partial<PromotionData>) =>
    apiClient.put<Promotion>(`/promotions/${id}`, data),

  delete: (id: string) => apiClient.delete(`/promotions/${id}`),

  activate: (id: string) => apiClient.patch<Promotion>(`/promotions/${id}/activate`, {}),

  deactivate: (id: string) => apiClient.patch<Promotion>(`/promotions/${id}/deactivate`, {}),
};
