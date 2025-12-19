import { useState, useCallback, useEffect } from 'react';
import { ingredientApi, Ingredient, IngredientData } from '../lib/ingredientApi';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ingredientApi.getAll();
      setIngredients(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ingredients';
      setError(message);
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const createIngredient = async (data: IngredientData) => {
    try {
      setError(null);
      const response = await ingredientApi.create(data);
      const newIngredient = response.data;
      setIngredients([...ingredients, newIngredient]);
      return newIngredient;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create ingredient';
      setError(message);
      throw err;
    }
  };

  const updateIngredient = async (id: string, data: Partial<IngredientData>) => {
    try {
      setError(null);
      const response = await ingredientApi.update(id, data);
      const updated = response.data;
      setIngredients(ingredients.map(i => i.id === id ? updated : i));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update ingredient';
      setError(message);
      throw err;
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      setError(null);
      await ingredientApi.delete(id);
      setIngredients(ingredients.filter(i => i.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete ingredient';
      setError(message);
      throw err;
    }
  };

  const getIngredientById = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await ingredientApi.getById(id);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ingredient';
      setError(message);
      throw err;
    }
  }, []);

  return {
    ingredients,
    loading,
    error,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    getIngredientById,
  };
}
