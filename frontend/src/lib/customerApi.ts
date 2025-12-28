import { apiClient, ApiResponse } from './apiClient';

export interface CustomerData {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  date_of_birth?: string;
  membership_level?: 'regular' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points?: number;
  total_spent?: number;
  image_url?: string;
  isBanned?: boolean;
}

export interface Customer extends CustomerData {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  bannedCustomers: number;
  totalPoints: number;
  totalSpent: number;
}

export interface TopCustomer {
  id: string;
  full_name: string;
  email: string;
  points: number;
  total_spent: number;
  membership_level: string;
}

class CustomerApi {
  private baseEndpoint = '/customers';

  async getAll(filters?: {
    membership_level?: string;
    isBanned?: boolean;
    search?: string;
  }): Promise<ApiResponse<Customer[]>> {
    const params = new URLSearchParams();
    if (filters?.membership_level) params.append('membership_level', filters.membership_level);
    if (filters?.isBanned !== undefined) params.append('isBanned', String(filters.isBanned));
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    const endpoint = query ? `${this.baseEndpoint}?${query}` : this.baseEndpoint;

    return apiClient.get<Customer[]>(endpoint);
  }

  async getById(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.get<Customer>(`${this.baseEndpoint}/${id}`);
  }

  async create(data: CustomerData): Promise<ApiResponse<Customer>> {
    return apiClient.post<Customer>(this.baseEndpoint, data);
  }

  async update(id: string, data: Partial<CustomerData>): Promise<ApiResponse<Customer>> {
    return apiClient.put<Customer>(`${this.baseEndpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async ban(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.patch<Customer>(`${this.baseEndpoint}/${id}/ban`, {});
  }

  async unban(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.patch<Customer>(`${this.baseEndpoint}/${id}/unban`, {});
  }

  async addPoints(id: string, points: number): Promise<ApiResponse<Customer>> {
    return apiClient.patch<Customer>(`${this.baseEndpoint}/${id}/points`, { points });
  }

  async addSpending(id: string, amount: number): Promise<ApiResponse<Customer>> {
    return apiClient.patch<Customer>(`${this.baseEndpoint}/${id}/spending`, { amount });
  }

  async getStatistics(): Promise<ApiResponse<CustomerStatistics>> {
    return apiClient.get<CustomerStatistics>(`${this.baseEndpoint}/statistics`);
  }

  async getTopCustomers(limit?: number): Promise<ApiResponse<TopCustomer[]>> {
    const endpoint = limit ? `${this.baseEndpoint}/top?limit=${limit}` : `${this.baseEndpoint}/top`;
    return apiClient.get<TopCustomer[]>(endpoint);
  }

  async login(email: string, password: string): Promise<ApiResponse<Customer>> {
    return apiClient.post<Customer>(`${this.baseEndpoint}/login`, { email, password });
  }
}

export const customerApi = new CustomerApi();
