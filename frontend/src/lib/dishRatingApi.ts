import { apiClient, ApiResponse } from './apiClient';

export interface DishRating {
  id: string;
  _id?: string;
  dish_id: string;
  rating_id: string;
  score: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
  Customer?: any;
  rating_date?: string;
  description?: string; // alias for comment
}

class DishRatingApi {
  private baseEndpoint = '/dish-ratings';

  async getAll(filters?: {
    dish_id?: string;
    rating_id?: string;
    score?: number;
    min_score?: number;
    max_score?: number;
    limit?: number;
  }): Promise<ApiResponse<DishRating[]>> {
    const params = new URLSearchParams();
    if (filters?.dish_id) params.append('dish_id', filters.dish_id);
    if (filters?.rating_id) params.append('rating_id', filters.rating_id);
    if (filters?.score) params.append('score', String(filters.score));
    if (filters?.min_score) params.append('min_score', String(filters.min_score));
    if (filters?.max_score) params.append('max_score', String(filters.max_score));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    const endpoint = query ? `${this.baseEndpoint}?${query}` : this.baseEndpoint;

    return apiClient.get<DishRating[]>(endpoint);
  }

  async getById(id: string): Promise<ApiResponse<DishRating>> {
    return apiClient.get<DishRating>(`${this.baseEndpoint}/${id}`);
  }

  async getByDishId(dishId: string): Promise<ApiResponse<DishRating[]>> {
    return apiClient.get<DishRating[]>(`${this.baseEndpoint}/dish/${dishId}`);
  }

  async getByRatingId(ratingId: string): Promise<ApiResponse<DishRating[]>> {
    return apiClient.get<DishRating[]>(`${this.baseEndpoint}/rating/${ratingId}`);
  }

  async create(data: {
    dish_id: string;
    rating_id: string;
    score: number;
    comment?: string;
  }): Promise<ApiResponse<DishRating>> {
    return apiClient.post<DishRating>(this.baseEndpoint, data);
  }

  async update(
    id: string,
    data: Partial<{ score: number; comment: string }>
  ): Promise<ApiResponse<DishRating>> {
    return apiClient.put<DishRating>(`${this.baseEndpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }
}

export const dishRatingApi = new DishRatingApi();
