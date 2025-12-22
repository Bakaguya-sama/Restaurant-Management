import { apiClient, ApiResponse } from './apiClient';

export interface RatingData {
  customer_id: string;
  description?: string;
  score: number;
}

export interface Rating {
  id: string;
  _id?: string;
  customer_id: string;
  description?: string;
  rating_date: string;
  score: number;
  created_at?: string;
  updated_at?: string;
  Customer?: any;
}

export interface RatingReplyData {
  staff_id: string;
  reply_text: string;
}

export interface RatingReply {
  id: string;
  _id?: string;
  rating_id: string;
  staff_id: string;
  reply_text: string;
  reply_date: string;
  Staff?: any;
}

export interface RatingStatistics {
  totalRatings: number;
  averageScore: number;
  scoreDistribution: {
    score: number;
    count: number;
  }[];
}

class RatingApi {
  private baseEndpoint = '/ratings';

  async getAll(filters?: {
    customer_id?: string;
    score?: number;
    min_score?: number;
    max_score?: number;
  }): Promise<ApiResponse<Rating[]>> {
    const params = new URLSearchParams();
    if (filters?.customer_id) params.append('customer_id', filters.customer_id);
    if (filters?.score) params.append('score', String(filters.score));
    if (filters?.min_score) params.append('min_score', String(filters.min_score));
    if (filters?.max_score) params.append('max_score', String(filters.max_score));

    const query = params.toString();
    const endpoint = query ? `${this.baseEndpoint}?${query}` : this.baseEndpoint;

    return apiClient.get<Rating[]>(endpoint);
  }

  async getById(id: string): Promise<ApiResponse<Rating>> {
    return apiClient.get<Rating>(`${this.baseEndpoint}/${id}`);
  }

  async create(data: RatingData): Promise<ApiResponse<Rating>> {
    return apiClient.post<Rating>(this.baseEndpoint, data);
  }

  async update(id: string, data: Partial<RatingData>): Promise<ApiResponse<Rating>> {
    return apiClient.put<Rating>(`${this.baseEndpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async getReplies(ratingId: string): Promise<ApiResponse<RatingReply[]>> {
    return apiClient.get<RatingReply[]>(`${this.baseEndpoint}/${ratingId}/replies`);
  }

  async createReply(ratingId: string, data: RatingReplyData): Promise<ApiResponse<RatingReply>> {
    return apiClient.post<RatingReply>(`${this.baseEndpoint}/${ratingId}/replies`, data);
  }

  async deleteReply(replyId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/replies/${replyId}`);
  }

  async getStatistics(): Promise<ApiResponse<RatingStatistics>> {
    return apiClient.get<RatingStatistics>(`${this.baseEndpoint}/statistics`);
  }
}

export const ratingApi = new RatingApi();
