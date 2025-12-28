import { useState, useCallback, useEffect } from 'react';
import { Customer, CustomerData, customerApi, CustomerStatistics, TopCustomer } from '../lib/customerApi';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (filters?: {
    membership_level?: string;
    isBanned?: boolean;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerApi.getAll(filters);
      setCustomers(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const getCustomerById = async (id: string): Promise<Customer | null> => {
    try {
      setError(null);
      const response = await customerApi.getById(id);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch customer';
      setError(message);
      throw err;
    }
  };

  const createCustomer = async (data: CustomerData): Promise<Customer> => {
    try {
      setError(null);
      const response = await customerApi.create(data);
      const newCustomer = response.data;
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
      throw err;
    }
  };

  const updateCustomer = async (id: string, data: Partial<CustomerData>): Promise<Customer> => {
    try {
      setError(null);
      const response = await customerApi.update(id, data);
      const updated = response.data;
      setCustomers(customers.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update customer';
      setError(message);
      throw err;
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      setError(null);
      await customerApi.delete(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(message);
      throw err;
    }
  };

  const banCustomer = async (id: string): Promise<Customer> => {
    try {
      setError(null);
      const response = await customerApi.ban(id);
      const updated = response.data;
      setCustomers(customers.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to ban customer';
      setError(message);
      throw err;
    }
  };

  const unbanCustomer = async (id: string): Promise<Customer> => {
    try {
      setError(null);
      const response = await customerApi.unban(id);
      const updated = response.data;
      setCustomers(customers.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unban customer';
      setError(message);
      throw err;
    }
  };

  const addPoints = async (id: string, points: number): Promise<Customer> => {
    try {
      setError(null);
      const response = await customerApi.addPoints(id, points);
      const updated = response.data;
      setCustomers(customers.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add points';
      setError(message);
      throw err;
    }
  };

  const addSpending = async (id: string, amount: number): Promise<Customer> => {
    try {
      setError(null);
      const response = await customerApi.addSpending(id, amount);
      const updated = response.data;
      setCustomers(customers.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add spending';
      setError(message);
      throw err;
    }
  };

  const getStatistics = async (): Promise<CustomerStatistics | null> => {
    try {
      setError(null);
      const response = await customerApi.getStatistics();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(message);
      throw err;
    }
  };

  const getTopCustomers = async (limit?: number): Promise<TopCustomer[] | null> => {
    try {
      setError(null);
      const response = await customerApi.getTopCustomers(limit);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch top customers';
      setError(message);
      throw err;
    }
  };

  const loginCustomer = async (email: string, password: string): Promise<Customer> => {
    try {
      setError(null);
      const response = await customerApi.login(email, password);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError(message);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    banCustomer,
    unbanCustomer,
    addPoints,
    addSpending,
    getStatistics,
    getTopCustomers,
    loginCustomer
  };
}
