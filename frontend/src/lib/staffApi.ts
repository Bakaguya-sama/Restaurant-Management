import { apiClient, ApiResponse } from './apiClient';

export type StaffRole = 'waiter' | 'cashier' | 'manager';

export interface StaffData {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  date_of_birth?: string;
  hire_date?: string;
  role: StaffRole;
  image_url?: string;
  username: string;
  password?: string;
  is_active?: boolean;
}

export interface Staff extends Omit<StaffData, 'password'> {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface StaffStatistics {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  byRole: {
    waiter: number;
    cashier: number;
    manager: number;
  };
}

export interface StaffFilterOptions {
  role?: StaffRole;
  is_active?: boolean;
  search?: string;
}

class StaffApi {
  private baseEndpoint = '/staff';

  async getAll(filters?: StaffFilterOptions): Promise<ApiResponse<Staff[]>> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    const endpoint = query ? `${this.baseEndpoint}?${query}` : this.baseEndpoint;

    return apiClient.get<Staff[]>(endpoint);
  }

  async getById(id: string): Promise<ApiResponse<Staff>> {
    return apiClient.get<Staff>(`${this.baseEndpoint}/${id}`);
  }

  async create(data: StaffData): Promise<ApiResponse<Staff>> {
    return apiClient.post<Staff>(this.baseEndpoint, data);
  }

  async update(id: string, data: Partial<StaffData>): Promise<ApiResponse<Staff>> {
    return apiClient.put<Staff>(`${this.baseEndpoint}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async deactivate(id: string): Promise<ApiResponse<Staff>> {
    return apiClient.patch<Staff>(`${this.baseEndpoint}/${id}/deactivate`, {});
  }

  async activate(id: string): Promise<ApiResponse<Staff>> {
    return apiClient.patch<Staff>(`${this.baseEndpoint}/${id}/activate`, {});
  }

  async getStatistics(): Promise<ApiResponse<StaffStatistics>> {
    return apiClient.get<StaffStatistics>(`${this.baseEndpoint}/statistics`);
  }

  async login(username: string, password: string): Promise<ApiResponse<Staff>> {
    return apiClient.post<Staff>(`${this.baseEndpoint}/login`, { username, password });
  }
}

export const staffApi = new StaffApi();
