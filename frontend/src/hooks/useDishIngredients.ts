import { useState, useCallback, useEffect } from 'react';
import { DishIngredient } from '../types';
import { dishIngredientApi, DishIngredientData } from '../lib/dishIngredientApi';

export function useDishIngredients() {
  const [dishIngredients, setDishIngredients] = useState<DishIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ingredients for a specific dish
  const fetchIngredientsByDish = useCallback(async (dishId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dishIngredientApi.getByDish(dishId);
      
      // Accumulate ingredients from multiple dishes, don't replace
      setDishIngredients(prev => {
        // Remove any existing ingredients for this dish to avoid duplicates
        const filtered = prev.filter(di => di.dish_id !== dishId);
        // Add the new ingredients for this dish
        return [...filtered, ...response.data];
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dish ingredients';
      setError(message);
      console.error('Error fetching dish ingredients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get ingredients for a specific dish (from local state)
  const getIngredientsByDish = useCallback((dishId: string) => {
    return dishIngredients.filter(di => di.dish_id === dishId);
  }, [dishIngredients]);

  const createDishIngredient = async (data: DishIngredientData) => {
    try {
      setError(null);
      const response = await dishIngredientApi.create(data);
      const newDishIngredient = response.data;
      setDishIngredients([...dishIngredients, newDishIngredient]);
      return newDishIngredient;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dish ingredient';
      setError(message);
      throw err;
    }
  };

  const updateDishIngredient = async (dishId: string, ingredientId: string, data: Partial<DishIngredientData>) => {
    try {
      setError(null);
      const response = await dishIngredientApi.update(dishId, ingredientId, data);
      const updated = response.data;
      setDishIngredients(dishIngredients.map(di => 
        (di.dish_id === dishId && di.ingredient_id === ingredientId) ? updated : di
      ));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dish ingredient';
      setError(message);
      throw err;
    }
  };

  const deleteDishIngredient = async (dishId: string, ingredientId: string) => {
    try {
      setError(null);
      await dishIngredientApi.delete(dishId, ingredientId);
      setDishIngredients(dishIngredients.filter(di => 
        !(di.dish_id === dishId && di.ingredient_id === ingredientId)
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dish ingredient';
      setError(message);
      throw err;
    }
  };

  const deleteDishIngredientsByDish = async (dishId: string) => {
    try {
      setError(null);
      await dishIngredientApi.deleteByDish(dishId);
      setDishIngredients(dishIngredients.filter(di => di.dish_id !== dishId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dish ingredients';
      setError(message);
      throw err;
    }
  };

  return {
    dishIngredients,
    loading,
    error,
    fetchIngredientsByDish,
    getIngredientsByDish,
    createDishIngredient,
    updateDishIngredient,
    deleteDishIngredient,
    deleteDishIngredientsByDish,
  };
}
