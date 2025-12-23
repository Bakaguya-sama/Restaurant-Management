import { useState, useCallback, useEffect } from 'react';
import { Promotion } from '../types';
import { promotionApi, PromotionData } from '../lib/promotionApi';

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await promotionApi.getAll();
      setPromotions(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch promotions';
      setError(message);
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const getPromotionById = async (id: string) => {
    try {
      setError(null);
      const response = await promotionApi.getById(id);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch promotion';
      setError(message);
      throw err;
    }
  };

  const getPromotionByCode = async (code: string) => {
    try {
      setError(null);
      const response = await promotionApi.getByPromoCode(code);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch promotion';
      setError(message);
      throw err;
    }
  };

  const validatePromoCode = async (code: string, orderAmount?: number) => {
    try {
      setError(null);
      const response = await promotionApi.validatePromoCode(code, orderAmount);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate promo code';
      setError(message);
      throw err;
    }
  };

  const getStatistics = async () => {
    try {
      setError(null);
      const response = await promotionApi.getStatistics();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(message);
      throw err;
    }
  };

  const createPromotion = async (data: PromotionData) => {
    try {
      setError(null);
      const response = await promotionApi.create(data);
      const newPromotion = response.data;
      setPromotions([...promotions, newPromotion]);
      return newPromotion;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create promotion';
      setError(message);
      throw err;
    }
  };

  const updatePromotion = async (id: string, data: Partial<PromotionData>) => {
    try {
      setError(null);
      const response = await promotionApi.update(id, data);
      const updated = response.data;
      setPromotions(promotions.map(p => (p.id === id || p._id === id) ? updated : p));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update promotion';
      setError(message);
      throw err;
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      setError(null);
      await promotionApi.delete(id);
      setPromotions(promotions.filter(p => p.id !== id && p._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete promotion';
      setError(message);
      throw err;
    }
  };

  const activatePromotion = async (id: string) => {
    try {
      setError(null);
      const response = await promotionApi.activate(id);
      const updated = response.data;
      setPromotions(promotions.map(p => (p.id === id || p._id === id) ? updated : p));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate promotion';
      setError(message);
      throw err;
    }
  };

  const deactivatePromotion = async (id: string) => {
    try {
      setError(null);
      const response = await promotionApi.deactivate(id);
      const updated = response.data;
      setPromotions(promotions.map(p => (p.id === id || p._id === id) ? updated : p));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate promotion';
      setError(message);
      throw err;
    }
  };

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    getPromotionById,
    getPromotionByCode,
    validatePromoCode,
    getStatistics,
    createPromotion,
    updatePromotion,
    deletePromotion,
    activatePromotion,
    deactivatePromotion,
  };
}
