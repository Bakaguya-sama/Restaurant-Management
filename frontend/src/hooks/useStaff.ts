import { useState, useCallback, useEffect } from 'react';
import { Staff, StaffData, StaffFilterOptions, staffApi, StaffStatistics } from '../lib/staffApi';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async (filters?: StaffFilterOptions) => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffApi.getAll(filters);
      setStaff(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch staff';
      setError(message);
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const getStaffById = async (id: string): Promise<Staff | null> => {
    try {
      setError(null);
      const response = await staffApi.getById(id);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch staff member';
      setError(message);
      throw err;
    }
  };

  const createStaff = async (data: StaffData): Promise<Staff> => {
    try {
      setError(null);
      const response = await staffApi.create(data);
      const newStaff = response.data;
      setStaff([...staff, newStaff]);
      return newStaff;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create staff member';
      setError(message);
      throw err;
    }
  };

  const updateStaff = async (id: string, data: Partial<StaffData>): Promise<Staff> => {
    try {
      setError(null);
      const response = await staffApi.update(id, data);
      const updated = response.data;
      setStaff(staff.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update staff member';
      setError(message);
      throw err;
    }
  };

  const deleteStaff = async (id: string): Promise<void> => {
    try {
      setError(null);
      await staffApi.delete(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete staff member';
      setError(message);
      throw err;
    }
  };

  const deactivateStaff = async (id: string): Promise<Staff> => {
    try {
      setError(null);
      const response = await staffApi.deactivate(id);
      const updated = response.data;
      setStaff(staff.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate staff member';
      setError(message);
      throw err;
    }
  };

  const activateStaff = async (id: string): Promise<Staff> => {
    try {
      setError(null);
      const response = await staffApi.activate(id);
      const updated = response.data;
      setStaff(staff.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate staff member';
      setError(message);
      throw err;
    }
  };

  const getStatistics = async (): Promise<StaffStatistics | null> => {
    try {
      setError(null);
      const response = await staffApi.getStatistics();
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(message);
      throw err;
    }
  };

  const loginStaff = async (username: string, password: string): Promise<Staff> => {
    try {
      setError(null);
      const response = await staffApi.login(username, password);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError(message);
      throw err;
    }
  };

  return {
    staff,
    loading,
    error,
    fetchStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    deactivateStaff,
    activateStaff,
    getStatistics,
    loginStaff
  };
}
