import { useState, useCallback } from 'react';
import { reservationDetailApi } from '../lib/reservationDetailApi';
import { ReservationDetail, ReservationDetailData } from '../types';
import { toast } from 'sonner';

export function useReservationDetails() {
  const [details, setDetails] = useState<ReservationDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetailsByReservationId = useCallback(async (reservationId: string) => {
    try {
      setLoading(true);
      const response = await reservationDetailApi.getByReservationId(reservationId);
      if (response.success && response.data) {
        setDetails(response.data);
        setError(null);
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

  const fetchDetailById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await reservationDetailApi.getById(id);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError('Không thể tải chi tiết');
        toast.error('Không thể tải chi tiết');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải chi tiết';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDetail = useCallback(async (data: ReservationDetailData) => {
    try {
      setLoading(true);
      const response = await reservationDetailApi.create(data);
      if (response.success && response.data) {
        setDetails((prev) => [...prev, response.data]);
        toast.success('Thêm chi tiết đặt bàn thành công');
        return response.data;
      } else {
        setError('Không thể tạo chi tiết');
        toast.error('Không thể tạo chi tiết');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tạo chi tiết';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDetail = useCallback(async (id: string, data: Partial<ReservationDetailData>) => {
    try {
      setLoading(true);
      const response = await reservationDetailApi.update(id, data);
      if (response.success && response.data) {
        setDetails((prev) =>
          prev.map((d) => (d.id === id ? response.data : d))
        );
        toast.success('Cập nhật chi tiết thành công');
        return response.data;
      } else {
        setError('Không thể cập nhật chi tiết');
        toast.error('Không thể cập nhật chi tiết');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi cập nhật';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDetail = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await reservationDetailApi.delete(id);
      if (response.success) {
        setDetails((prev) => prev.filter((d) => d.id !== id));
        toast.success('Xóa chi tiết thành công');
      } else {
        setError('Không thể xóa chi tiết');
        toast.error('Không thể xóa chi tiết');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi xóa';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetailsByTableId = useCallback(async (tableId: string) => {
    try {
      setLoading(true);
      const response = await reservationDetailApi.getByTableId(tableId);
      if (response.success && response.data) {
        setDetails(response.data);
        setError(null);
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

  return {
    details,
    loading,
    error,
    fetchDetailsByReservationId,
    fetchDetailsByTableId,
    fetchDetailById,
    createDetail,
    updateDetail,
    deleteDetail,
  };
}
