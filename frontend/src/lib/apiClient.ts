const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  post<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  put<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }

  patch<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
