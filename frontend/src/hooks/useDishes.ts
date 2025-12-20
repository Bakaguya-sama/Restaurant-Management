import { useState, useCallback, useEffect } from 'react';
import { Dish } from '../types';
import { dishApi, DishData } from '../lib/dishApi';

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDishes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dishApi.getAll();
      setDishes(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dishes';
      setError(message);
      console.error('Error fetching dishes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const createDish = async (data: DishData) => {
    try {
      setError(null);
      const response = await dishApi.create(data);
      const newDish = response.data;
      setDishes([...dishes, newDish]);
      return newDish;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dish';
      setError(message);
      throw err;
    }
  };

  const updateDish = async (id: string, data: Partial<DishData>) => {
    try {
      setError(null);
      const response = await dishApi.update(id, data);
      const updated = response.data;
      setDishes(dishes.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dish';
      setError(message);
      throw err;
    }
  };

  const deleteDish = async (id: string) => {
    try {
      setError(null);
      await dishApi.delete(id);
      setDishes(dishes.filter(d => d.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dish';
      setError(message);
      throw err;
    }
  };

  const toggleDishAvailability = async (id: string, is_available: boolean) => {
    try {
      setError(null);
      const response = await dishApi.toggleAvailability(id, is_available);
      const updated = response.data;
      setDishes(dishes.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle dish availability';
      setError(message);
      throw err;
    }
  };

  return {
    dishes,
    loading,
    error,
    fetchDishes,
    createDish,
    updateDish,
    deleteDish,
    toggleDishAvailability,
  };
}
