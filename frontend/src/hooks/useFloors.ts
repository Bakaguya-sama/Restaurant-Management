import { useState, useCallback, useEffect } from 'react';
import { floorApi, FloorData } from '../lib/floorApi';
import { Floor } from '../types';

interface UseFloorsState {
  floors: Floor[];
  loading: boolean;
  error: string | null;
}

export function useFloors() {
  const [state, setState] = useState<UseFloorsState>({
    floors: [],
    loading: false,
    error: null,
  });

  const fetchFloors = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await floorApi.getAll();
      setState({
        floors: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch floors';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const createFloor = useCallback(async (data: FloorData) => {
    try {
      const response = await floorApi.create(data);
      setState(prev => ({
        ...prev,
        floors: [...prev.floors, response.data],
      }));
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateFloor = useCallback(async (id: string, data: Partial<FloorData>) => {
    try {
      const response = await floorApi.update(id, data);
      setState(prev => ({
        ...prev,
        floors: prev.floors.map(f => f.id === id ? response.data : f),
      }));
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteFloor = useCallback(async (id: string) => {
    try {
      await floorApi.delete(id);
      setState(prev => ({
        ...prev,
        floors: prev.floors.filter(f => f.id !== id),
      }));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  return {
    ...state,
    fetchFloors,
    createFloor,
    updateFloor,
    deleteFloor,
  };
}
