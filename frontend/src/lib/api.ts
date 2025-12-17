const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API request failed');
  }
  const data = await response.json();
  return data.data;
}

export const customerApi = {
  getAll: async (params?: { membershipLevel?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.membershipLevel) queryParams.append('membershipLevel', params.membershipLevel);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/customers?${queryParams}`);
    return handleResponse<any[]>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  },

  ban: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/ban`, {
      method: 'PATCH',
    });
    return handleResponse<any>(response);
  },

  unban: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/unban`, {
      method: 'PATCH',
    });
    return handleResponse<any>(response);
  },

  addPoints: async (id: string, points: number) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/points`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    });
    return handleResponse<any>(response);
  },

  addSpending: async (id: string, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}/spending`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    return handleResponse<any>(response);
  },

  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/customers/statistics`);
    return handleResponse<any>(response);
  },

  getTop: async (limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/customers/top?${queryParams}`);
    return handleResponse<any[]>(response);
  },
};

export const staffApi = {
  getAll: async (params?: { role?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/staff?${queryParams}`);
    return handleResponse<any[]>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`);
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  },

  deactivate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}/deactivate`, {
      method: 'PATCH',
    });
    return handleResponse<any>(response);
  },

  activate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/staff/${id}/activate`, {
      method: 'PATCH',
    });
    return handleResponse<any>(response);
  },

  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/staff/statistics`);
    return handleResponse<any>(response);
  },
};

export const violationApi = {
  getAll: async (params?: { customer_id?: string; violation_type?: string; start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params?.violation_type) queryParams.append('violation_type', params.violation_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const response = await fetch(`${API_BASE_URL}/violations?${queryParams}`);
    return handleResponse<any[]>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/violations/${id}`);
    return handleResponse<any>(response);
  },

  getByCustomerId: async (customerId: string) => {
    const response = await fetch(`${API_BASE_URL}/violations/customer/${customerId}`);
    return handleResponse<any[]>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/violations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/violations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/violations/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  },

  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/violations/statistics`);
    return handleResponse<any>(response);
  },

  getTopViolators: async () => {
    const response = await fetch(`${API_BASE_URL}/violations/statistics/top-violators`);
    return handleResponse<any[]>(response);
  },
};

export const ratingApi = {
  getAll: async (params?: { customer_id?: string; score?: number; min_score?: number; max_score?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params?.score) queryParams.append('score', params.score.toString());
    if (params?.min_score) queryParams.append('min_score', params.min_score.toString());
    if (params?.max_score) queryParams.append('max_score', params.max_score.toString());
    
    const response = await fetch(`${API_BASE_URL}/ratings?${queryParams}`);
    return handleResponse<any[]>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${id}`);
    return handleResponse<any>(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  },

  getReplies: async (ratingId: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${ratingId}/replies`);
    return handleResponse<any[]>(response);
  },

  createReply: async (ratingId: string, staff_id: string, reply_text: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${ratingId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_id, reply_text }),
    });
    return handleResponse<any>(response);
  },

  deleteReply: async (replyId: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings/replies/${replyId}`, {
      method: 'DELETE',
    });
    return handleResponse<any>(response);
  },

  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/ratings/statistics`);
    return handleResponse<any>(response);
  },
};
