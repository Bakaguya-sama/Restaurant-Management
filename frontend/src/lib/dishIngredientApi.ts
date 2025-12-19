import { apiClient } from './apiClient';
import { DishIngredient } from '../types';

export interface DishIngredientData {
  id?: string;
  dishId: string;
  ingredientId: string;
  quantity_required: string;
  unit: string;
}

export const dishIngredientApi = {
  // Note: Backend doesn't have a single endpoint to get all dish ingredients
  // You must fetch ingredients per dish using getByDish()
  
  getByDish: (dishId: string) => 
    apiClient.get<DishIngredient[]>(`/dishes/${dishId}/ingredients`),

  create: (data: DishIngredientData) => 
    apiClient.post<DishIngredient>(`/dishes/${data.dishId}/ingredients`, {
      ingredient_id: data.ingredientId,
      quantity_required: data.quantity_required,
      unit: data.unit,
    }),

  update: (dishId: string, ingredientId: string, data: Partial<DishIngredientData>) =>
    apiClient.put<DishIngredient>(`/dishes/${dishId}/ingredients/${ingredientId}`, {
      ingredient_id: data.ingredientId,
      quantity_required: data.quantity_required,
      unit: data.unit,
    }),

  delete: (dishId: string, ingredientId: string) => 
    apiClient.delete(`/dishes/${dishId}/ingredients/${ingredientId}`),

  deleteByDish: (dishId: string) => 
    apiClient.delete(`/dishes/${dishId}/ingredients`),

  bulkReplace: (dishId: string, ingredients: Omit<DishIngredientData, 'dishId'>[]) =>
    apiClient.post<DishIngredient[]>(`/dishes/${dishId}/ingredients/bulk/replace`, {
      ingredients: ingredients.map(ing => ({
        ingredient_id: ing.ingredientId,
        quantity_required: ing.quantity_required,
        unit: ing.unit,
      }))
    }),
};
