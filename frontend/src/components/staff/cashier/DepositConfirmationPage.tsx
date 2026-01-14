import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Image as ImageIcon,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import { reservationApi } from "../../../lib/reservationApi";
import { customerApi } from "../../../lib/customerApi";
import { buildImageUrl } from "../../../lib/uploadApi";
import { Reservation, Customer } from "../../../types";

interface ReservationWithCustomer extends Reservation {
  customer?: Partial<Customer>;
}

export function DepositConfirmationPage() {
  const [reservations, setReservations] = useState<ReservationWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithCustomer | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingReservations();
  }, []);

  const fetchPendingReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationApi.getAll({ status: "pending" });
      
      if (response.success && response.data) {
        // Fetch customer info for each reservation
        const reservationsWithCustomers = await Promise.all(
          response.data.map(async (reservation) => {
            try {
              const customerResponse = await customerApi.getById(reservation.customer_id);
              return {
                ...reservation,
                customer: customerResponse.data,
              };
            } catch {
              return reservation;
            }
          })
        );
        setReservations(reservationsWithCustomers);
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      toast.error("Lỗi khi tải danh sách đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedReservation) return;

    try {
      setProcessing(true);
      
      // Update isPaid to true and status to confirmed
      await reservationApi.updateIsPaid(selectedReservation.id, true);
      await reservationApi.updateStatus(selectedReservation.id, "confirmed");
      
      toast.success("Đã xác nhận thanh toán cọc thành công!");
      setShowConfirmModal(false);
      setSelectedReservation(null);
      fetchPendingReservations();
    } catch (err) {
      console.error("Error confirming payment:", err);
      toast.error("Lỗi khi xác nhận thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedReservation) return;

    try {
      setProcessing(true);
      
      // Update status to cancelled
      await reservationApi.updateStatus(selectedReservation.id, "cancelled");
      
      toast.success("Đã từ chối đơn đặt bàn");
      setShowRejectModal(false);
      setSelectedReservation(null);
      fetchPendingReservations();
    } catch (err) {
      console.error("Error rejecting payment:", err);
      toast.error("Lỗi khi từ chối đơn đặt bàn");
    } finally {
      setProcessing(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    return `${date} ${time}`;
  };

  const filteredReservations = reservations.filter((reservation) => {
    const searchLower = searchQuery.toLowerCase();
    const customerName = reservation.customer?.full_name?.toLowerCase() || "";
    const customerPhone = reservation.customer?.phone?.toLowerCase() || "";
    const reservationId = reservation.id.toLowerCase();
    
    return (
      customerName.includes(searchLower) ||
      customerPhone.includes(searchLower) ||
      reservationId.includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Xác nhận thanh toán cọc</h2>
          <p className="text-gray-600 mt-1">
            Xác nhận các đơn đặt bàn đang chờ thanh toán
          </p>
        </div>
        <Button onClick={fetchPendingReservations} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Tìm theo tên, SĐT hoặc mã đặt bàn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chờ xác nhận</p>
              <p className="text-xl font-semibold">{reservations.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Không có đơn đặt bàn nào đang chờ xác nhận</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Ảnh xác nhận thanh toán */}
                <div className="lg:w-48 flex-shrink-0">
                  <p className="text-sm text-gray-500 mb-2">Ảnh thanh toán</p>
                  {reservation.deposit_proof_image ? (
                    <div 
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setShowImageModal(true);
                      }}
                    >
                      <img
                        src={buildImageUrl(reservation.deposit_proof_image)}
                        alt="Deposit proof"
                        className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition"
                      />
                      <p className="text-xs text-blue-600 mt-1 text-center">Nhấn để phóng to</p>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                        <p className="text-xs">Chưa có ảnh</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thông tin đặt bàn */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Chờ xác nhận
                    </Badge>
                    <span className="text-sm text-gray-500">#{reservation.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Khách hàng</p>
                      <p className="font-medium">{reservation.customer?.full_name || "N/A"}</p>
                      <p className="text-gray-600">{reservation.customer?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ngày giờ</p>
                      <p className="font-medium">
                        {formatDateTime(reservation.reservation_date, reservation.reservation_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Số người</p>
                      <p className="font-medium">{reservation.number_of_guests} người</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tiền cọc</p>
                      <p className="font-medium text-green-600">
                        {reservation.deposit_amount?.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex lg:flex-col gap-2 lg:justify-center">
                  <Button
                    variant="secondary"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowRejectModal(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowConfirmModal(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Xác nhận
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setSelectedReservation(null);
        }}
        title="Ảnh xác nhận thanh toán"
      >
        <div className="space-y-4">
          {selectedReservation?.deposit_proof_image ? (
            <div className="flex flex-col items-center">
              <img
                src={buildImageUrl(selectedReservation.deposit_proof_image)}
                alt="Deposit proof"
                className="max-w-full max-h-96 object-contain rounded-lg border"
              />
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Khách hàng:</strong> {selectedReservation.customer?.full_name}</p>
                <p><strong>SĐT:</strong> {selectedReservation.customer?.phone}</p>
                <p><strong>Số tiền cọc:</strong> {selectedReservation.deposit_amount?.toLocaleString()}đ</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Không có ảnh xác nhận</p>
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowImageModal(false);
                setSelectedReservation(null);
              }}
            >
              Đóng
            </Button>
            <Button
              variant="secondary"
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                setShowImageModal(false);
                setShowRejectModal(true);
              }}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Từ chối
            </Button>
            <Button
              onClick={() => {
                setShowImageModal(false);
                setShowConfirmModal(true);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedReservation(null);
        }}
        title="Xác nhận thanh toán cọc"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Bạn có chắc chắn muốn xác nhận thanh toán cọc cho đơn đặt bàn này?
            </p>
          </div>
          
          {selectedReservation && (
            <>
              {/* Ảnh thanh toán trong modal xác nhận */}
              <div className="border rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-2">Ảnh xác nhận thanh toán</p>
                {selectedReservation.deposit_proof_image ? (
                  <img
                    src={buildImageUrl(selectedReservation.deposit_proof_image)}
                    alt="Deposit proof"
                    className="max-h-48 mx-auto object-contain rounded-lg border"
                  />
                ) : (
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs">Khách hàng chưa upload ảnh</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p><strong>Mã đặt bàn:</strong> {selectedReservation.id}</p>
                <p><strong>Khách hàng:</strong> {selectedReservation.customer?.full_name}</p>
                <p><strong>SĐT:</strong> {selectedReservation.customer?.phone}</p>
                <p><strong>Ngày giờ:</strong> {formatDateTime(selectedReservation.reservation_date, selectedReservation.reservation_time)}</p>
                <p><strong>Số người:</strong> {selectedReservation.number_of_guests} người</p>
                <p><strong>Tiền cọc:</strong> {selectedReservation.deposit_amount?.toLocaleString()}đ</p>
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowConfirmModal(false);
                setSelectedReservation(null);
              }}
              disabled={processing}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmPayment} disabled={processing}>
              {processing ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedReservation(null);
        }}
        title="Từ chối đơn đặt bàn"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Bạn có chắc chắn muốn từ chối đơn đặt bàn này? Đơn sẽ bị hủy và khách hàng sẽ được thông báo.
            </p>
          </div>
          
          {selectedReservation && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p><strong>Mã đặt bàn:</strong> {selectedReservation.id}</p>
              <p><strong>Khách hàng:</strong> {selectedReservation.customer?.full_name}</p>
              <p><strong>SĐT:</strong> {selectedReservation.customer?.phone}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedReservation(null);
              }}
              disabled={processing}
            >
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRejectPayment}
              disabled={processing}
            >
              {processing ? "Đang xử lý..." : "Từ chối đơn"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
