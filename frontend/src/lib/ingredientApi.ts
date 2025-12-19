import { apiClient } from './apiClient';

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity_in_stock: number;
  minimum_quantity: number;
  unit_price: number;
  supplier_name: string;
  supplier_contact: string;
  expiry_date?: string;
  stock_status: string;
  expiry_status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IngredientData {
  name: string;
  unit: string;
  quantity_in_stock: number;
  minimum_quantity: number;
  unit_price: number;
  supplier_name: string;
  supplier_contact: string;
  expiry_date?: string;
  stock_status?: string;
  expiry_status?: string;
}

export const ingredientApi = {
  getAll: () => 
    apiClient.get<Ingredient[]>('/ingredients'),

  getById: (id: string) => 
    apiClient.get<Ingredient>(`/ingredients/${id}`),

  getByName: (name: string) => 
    apiClient.get<Ingredient>(`/ingredients/name/${name}`),

  create: (data: IngredientData) => 
    apiClient.post<Ingredient>('/ingredients', data),

  update: (id: string, data: Partial<IngredientData>) => 
    apiClient.put<Ingredient>(`/ingredients/${id}`, data),

  delete: (id: string) => 
    apiClient.delete(`/ingredients/${id}`),
};
