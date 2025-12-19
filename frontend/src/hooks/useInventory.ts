import { useState, useCallback, useEffect } from 'react';
import { Ingredient, inventoryApi } from '../lib/inventoryApi';

export function useInventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getAll();
      setIngredients(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ingredients';
      setError(message);
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const updateIngredient = async (id: string, data: Partial<Ingredient>) => {
    try {
      setError(null);
      const response = await inventoryApi.update(id, data);
      setIngredients(ingredients.map(ing => ing.id === id ? response.data : ing));
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update ingredient';
      setError(message);
      throw err;
    }
  };

  return {
    ingredients,
    loading,
    error,
    fetchIngredients,
    updateIngredient,
  };
}
