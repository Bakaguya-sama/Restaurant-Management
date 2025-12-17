import { useState, useCallback, useEffect } from 'react';
import { locationApi, LocationData } from '../lib/locationApi';
import { Location } from '../types';

interface UseLocationsState {
  locations: Location[];
  loading: boolean;
  error: string | null;
}

export function useLocations() {
  const [state, setState] = useState<UseLocationsState>({
    locations: [],
    loading: false,
    error: null,
  });

  const fetchLocations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await locationApi.getAll();
      setState({
        locations: response.data,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch locations';
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const createLocation = useCallback(async (data: LocationData) => {
    try {
      const response = await locationApi.create(data);
      setState(prev => ({
        ...prev,
        locations: [...prev.locations, response.data],
      }));
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateLocation = useCallback(async (id: string, data: Partial<LocationData>) => {
    try {
      const response = await locationApi.update(id, data);
      setState(prev => ({
        ...prev,
        locations: prev.locations.map(l => l.id === id ? response.data : l),
      }));
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteLocation = useCallback(async (id: string) => {
    try {
      await locationApi.delete(id);
      setState(prev => ({
        ...prev,
        locations: prev.locations.filter(l => l.id !== id),
      }));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    ...state,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}
