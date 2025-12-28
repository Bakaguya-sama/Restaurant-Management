import { useState, useCallback } from 'react';
import { reservationApi } from '../lib/reservationApi';
import { Reservation, ReservationData, ReservationStatus } from '../types';
import { toast } from 'sonner';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(
    async (filters?: { status?: ReservationStatus; customerId?: string; tableId?: string }) => {
      try {
        setLoading(true);
        const response = await reservationApi.getAll(filters);
        if (response.success && response.data) {
          setReservations(response.data);
          setError(null);
        } else {
          setError('Không thể tải danh sách đặt bàn');
          toast.error('Không thể tải danh sách đặt bàn');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải đặt bàn';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchReservationById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await reservationApi.getById(id);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError('Không thể tải chi tiết đặt bàn');
        toast.error('Không thể tải chi tiết đặt bàn');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải chi tiết';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReservationsByCustomerId = useCallback(async (customerId: string) => {
    try {
      setLoading(true);
      console.log(`[useReservations] fetchReservationsByCustomerId called with: "${customerId}" (type: ${typeof customerId})`);
      const response = await reservationApi.getByCustomerId(customerId);
      console.log(`[useReservations] API response:`, response);
      if (response.success && response.data) {
        console.log(`[useReservations] Setting ${response.data.length} reservations`);
        setReservations(response.data);
        setError(null);
      } else {
        console.warn(`[useReservations] API returned success=false or no data`);
        setError('Không thể tải danh sách đặt bàn');
        toast.error('Không thể tải danh sách đặt bàn');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải đặt bàn';
      console.error(`[useReservations] Error:`, errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReservationsByTableId = useCallback(async (tableId: string) => {
    try {
      setLoading(true);
      const response = await reservationApi.getByTableId(tableId);
      if (response.success && response.data) {
        setReservations(response.data);
        setError(null);
      } else {
        setError('Không thể tải danh sách đặt bàn');
        toast.error('Không thể tải danh sách đặt bàn');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải đặt bàn';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (data: ReservationData) => {
    try {
      setLoading(true);
      const response = await reservationApi.create(data);
      if (response.success && response.data) {
        setReservations((prev) => [...prev, response.data]);
        toast.success('Đặt bàn thành công');
        return response.data;
      } else {
        setError('Không thể tạo đặt bàn');
        toast.error('Không thể tạo đặt bàn');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tạo đặt bàn';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservation = useCallback(async (id: string, data: Partial<ReservationData>) => {
    try {
      setLoading(true);
      const response = await reservationApi.update(id, data);
      if (response.success && response.data) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? response.data : r))
        );
        toast.success('Cập nhật đặt bàn thành công');
        return response.data;
      } else {
        setError('Không thể cập nhật đặt bàn');
        toast.error('Không thể cập nhật đặt bàn');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi cập nhật';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservationStatus = useCallback(
    async (id: string, status: ReservationStatus) => {
      try {
        setLoading(true);
        const response = await reservationApi.updateStatus(id, status);
        if (response.success && response.data) {
          setReservations((prev) =>
            prev.map((r) => (r.id === id ? response.data : r))
          );
          return response.data;
        } else {
          setError('Không thể cập nhật trạng thái');
          toast.error('Không thể cập nhật trạng thái');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteReservation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await reservationApi.delete(id);
      if (response.success) {
        setReservations((prev) => prev.filter((r) => r.id !== id));
        toast.success('Xóa đặt bàn thành công');
      } else {
        setError('Không thể xóa đặt bàn');
        toast.error('Không thể xóa đặt bàn');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi xóa';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTableToReservation = useCallback(async (id: string, tableId: string) => {
    try {
      setLoading(true);
      const response = await reservationApi.addTable(id, tableId);
      if (response.success) {
        toast.success('Thêm bàn vào đặt bàn thành công');
        return true;
      } else {
        toast.error('Không thể thêm bàn');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi thêm bàn';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTableFromReservation = useCallback(async (id: string, tableId: string) => {
    try {
      setLoading(true);
      const response = await reservationApi.removeTable(id, tableId);
      if (response.success) {
        toast.success('Xóa bàn khỏi đặt bàn thành công');
        return true;
      } else {
        toast.error('Không thể xóa bàn');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi xóa bàn';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reservationApi.getStatistics();
      if (response.success) {
        return response.data;
      } else {
        toast.error('Không thể tải thống kê');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải thống kê';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    fetchReservationById,
    fetchReservationsByCustomerId,
    fetchReservationsByTableId,
    createReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation,
    addTableToReservation,
    removeTableFromReservation,
    getStatistics,
  };
}
