import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Utensils,
  Receipt,
  Tag,
  Gift,
  ChevronDown,
  CreditCard,
  MessageSquare,
  Star,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/badge";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/textarea";
import { useAuth } from "../../contexts/AuthContext";
import { useReservations } from "../../hooks/useReservations";
import { customerApi } from "../../lib/customerApi";
import { reservationApi } from "../../lib/reservationApi";
import { reservationDetailApi } from "../../lib/reservationDetailApi";
import { tableApi } from "../../lib/tableApi";
import { locationApi } from "../../lib/locationApi";
import { toast } from "sonner";

export function BookingManagementPage() {
  const { userProfile } = useAuth();
  const { reservations, fetchReservationsByCustomerId, loading } = useReservations();
  const [customers, setCustomers] = useState<any[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showVoucherSection, setShowVoucherSection] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [enrichedReservations, setEnrichedReservations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`[BookingManagementPage] useEffect triggered, userProfile?.id: "${userProfile?.id}"`);
        if (userProfile?.id) {
          console.log(`[BookingManagementPage] Calling fetchReservationsByCustomerId with: "${userProfile.id}"`);
          await fetchReservationsByCustomerId(userProfile.id);
        } else {
          console.warn(`[BookingManagementPage] userProfile?.id is falsy:`, userProfile);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Lỗi khi tải dữ liệu";
        toast.error(errorMsg);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [userProfile?.id, fetchReservationsByCustomerId]);

  useEffect(() => {
    const enrichReservations = async () => {
      try {
        const enriched = await Promise.all(
          reservations
            .filter((reservation: any) => reservation?.id) // Filter out reservations without ID
            .map(async (reservation: any) => {
              let tableNumber = "N/A";
              let locationName = "N/A";
              let formattedCreatedAt = "N/A";

              if (reservation.created_at) {
                const date = new Date(reservation.created_at);
                formattedCreatedAt = date.toISOString().split("T")[0];
              }

              try {
                const detailsResponse = await reservationDetailApi.getByReservationId(reservation.id);
                
                if (detailsResponse.success && detailsResponse.data && detailsResponse.data.length > 0) {
                  const tableId = detailsResponse.data[0].table_id;
                  
                  const tableResponse = await tableApi.getById(tableId);
                  if (tableResponse.success && tableResponse.data) {
                    tableNumber = tableResponse.data.table_number;
                    
                    if (tableResponse.data.location_id) {
                      const locationResponse = await locationApi.getById(tableResponse.data.location_id);
                      if (locationResponse.success && locationResponse.data) {
                        locationName = locationResponse.data.name;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error(`Error fetching details for reservation ${reservation.id}:`, err);
              }

              return {
                ...reservation,
                tableNumber,
                locationName,
                createdAtFormatted: formattedCreatedAt,
              };
            })
        );
        setEnrichedReservations(enriched);
      } catch (err) {
        console.error("Error enriching reservations:", err);
      }
    };

    if (reservations.length > 0) {
      enrichReservations();
    } else {
      setEnrichedReservations([]);
    }
  }, [reservations]);

  const bookings = enrichedReservations;

  // Mock data: Bookings with optional bills (fallback if no reservations)
  // const bookings = reservations.length > 0 ? reservations : [
  //   {
  //     id: "BK005",
  //     reservation_date: "2025-12-12",
  //     reservation_time: "20:00",
  //     number_of_guests: 5,
  //     tableNumber: "T08",
  //     area: "Khu VIP",
  //     floor: "Floor 1",
  //     special_requests: "Cần không gian riêng tư",
  //     deposit_amount: "200000",
  //     status: "confirmed",
  //     createdAt: "2025-12-12 14:30",
  //   },
  //   {
  //     id: "BK001",
  //     reservation_date: "2025-12-09",
  //     reservation_time: "19:00",
  //     number_of_guests: 4,
  //     tableNumber: "T05",
  //     area: "Khu ngoài trời",
  //     special_requests: "Gần cửa sổ",
  //     deposit_amount: "150000",
  //     status: "completed",
  //     createdAt: "2025-12-08",
  //   },
  //   {
  //     id: "BK002",
  //     reservation_date: "2025-12-09",
  //     reservation_time: "19:00",
  //     number_of_guests: 6,
  //     tableNumber: "T05",
  //     area: "Khu ngoài trời",
  //     special_requests: "Tổ chức sinh nhật, cần bánh kem",
  //     deposit_amount: "200000",
  //     status: "completed",
  //     createdAt: "2025-12-08",
  //   },
  //   {
  //     id: "BK003",
  //     reservation_date: "2025-12-05",
  //     reservation_time: "18:00",
  //     number_of_guests: 2,
  //     tableNumber: "T03",
  //     area: "Khu trong nhà",
  //     special_requests: "",
  //     deposit_amount: "100000",
  //     status: "completed",
  //     createdAt: "2025-12-04",
  //   },
  //   {
  //     id: "BK004",
  //     reservation_date: "2025-12-03",
  //     reservation_time: "12:30",
  //     number_of_guests: 3,
  //     tableNumber: "T12",
  //     area: "Khu trong nhà",
  //     special_requests: "Gần quầy bar",
  //     deposit_amount: "100000",
  //     status: "completed",
  //     createdAt: "2025-12-02",
  //   },
  // ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-orange-100 text-orange-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang tiến hành";
      case "in_progress":
        return "Sắp đến giờ hẹn";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "served":
        return "bg-green-100 text-green-700";
      case "cooking":
        return "bg-orange-100 text-orange-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getItemStatusText = (status: string) => {
    switch (status) {
      case "served":
        return "Đã phục vụ";
      case "cooking":
        return "Đang nấu";
      case "pending":
        return "Chờ xử lý";
      default:
        return status;
    }
  };

  // const handleSubmitFeedback = () => {
  //   if (feedback === "") {
  //     alert("Bạn hãy chia sẻ cho chúng tôi biết về cảm nhận của mình nhé!");
  //     return;
  //   }
  //   alert("Cảm ơn bạn đã gửi đánh giá!");
  //   setShowFeedbackModal(false);
  //   setFeedback("");
  // };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await reservationApi.updateStatus(selectedBooking.id, 'cancelled');
      
      if (response.success) {
        alert(
          "Yêu cầu hủy phiếu đặt bàn đã được gửi. Tiền cọc sẽ được hoàn lại trong vòng 3-5 ngày làm việc."
        );
        
        setShowCancelModal(false);
        setShowDetailModal(false);
        
        if (selectedBooking.customer_id) {
          await fetchReservationsByCustomerId(selectedBooking.customer_id);
        }
        
        setSelectedBooking(null);
      } else {
        toast.error(response.message || "Lỗi khi hủy phiếu đặt bàn");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi hủy phiếu đặt bàn";
      toast.error(errorMsg);
      console.error("Cancel booking error:", err);
    }
  };

  const handlePaymentComplete = async () => {
    if (!selectedBooking) return;

    try {
      const response = await reservationApi.updateStatus(selectedBooking.id, 'confirmed');
      
      if (response.success) {
        toast.success("Thanh toán thành công! Phiếu đặt bàn đã được xác nhận.");
        setShowPaymentModal(false);
        
        if (selectedBooking.customer_id) {
          await fetchReservationsByCustomerId(selectedBooking.customer_id);
        }
        
        setSelectedBooking(null);
      } else {
        toast.error(response.message || "Lỗi khi xử lý thanh toán");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi xử lý thanh toán";
      toast.error(errorMsg);
      console.error("Payment error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Quản lý đặt bàn</h2>
        <p className="text-gray-600 mt-1">Xem lại thông tin đặt bàn của bạn</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Bạn chưa có đặt bàn nào</p>
        </Card>
      ) : (
        <>
      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card
            key={booking.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-1">{booking.id}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {booking.reservation_date} {booking.reservation_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {booking.number_of_guests} khách
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <span className="text-gray-600">Tiền cọc:</span>
                <span className="ml-2 font-medium">
                  {parseInt(booking.deposit_amount || "0").toLocaleString()}đ
                </span>
              </div>
              {/* {booking.bill && (
                <div className="text-sm">
                  <span className="text-gray-600">Tổng bill:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {booking.bill.total.toLocaleString()}đ
                  </span>
                </div>
              )} */}
              {/* <div className="text-sm col-span-2">
                <span className="text-gray-600">Khu vực:</span>
                <span className="ml-2">{booking.area}</span>
              </div> */}
            </div>

            {/* View Details Button */}
            <Button
              size="sm"
              variant="secondary"
              fullWidth
              onClick={() => {
                setSelectedBooking(booking);
                if (booking.status === "pending") {
                  setShowPaymentModal(true);
                } else {
                  setShowDetailModal(true);
                }
              }}
            >
              Xem chi tiết
            </Button>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có phiếu đặt bàn nào</p>
        </div>
      )}

      {/* Detail Modal - Hiển thị chi tiết hóa đơn nếu có, nếu không hiển thị chi tiết đặt bàn */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBooking(null);
          setShowVoucherSection(false);
        }}
        title={`Chi tiết đặt bàn
        `}
        size="lg"
      >
        {selectedBooking ? (
          /* Hiển thị chi tiết hóa đơn */
          <div className="space-y-6">
            {/* Bill Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Bàn số</p>
                <p className="text-lg">{selectedBooking.tableNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Thời gian hẹn check-in</p>
                <p className="text-lg">
                  {selectedBooking.reservation_date}{" "}
                  {selectedBooking.reservation_time}
                </p>
              </div>
              <Badge className={getStatusColor(selectedBooking.status)}>
                {getStatusText(selectedBooking.status)}
              </Badge>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              {/* Booking Information */}
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Ngày đặt</span>
                    </div>
                    <p className="font-medium">{selectedBooking.createdAtFormatted}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Số khách</span>
                    </div>
                    <p className="font-medium">
                      {selectedBooking.number_of_guests} người
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Utensils className="w-4 h-4" />
                      <span className="text-sm">Bàn số</span>
                    </div>
                    <p className="font-medium">{selectedBooking.tableNumber}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Khu vực</span>
                    </div>
                    <p className="font-medium">
                      {selectedBooking.locationName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.special_requests && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
                  <p>{selectedBooking.special_requests}</p>
                </div>
              )}

              {/* Deposit Information */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tiền đặt cọc</p>
                    <p className="text-xl font-medium text-green-700">
                      {parseInt(selectedBooking.deposit_amount || "0").toLocaleString()}đ
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Đã thanh toán
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedBooking.status === "confirmed" ? (
                  <>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setShowCancelModal(true)}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Hủy đặt bàn
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedBooking(null);
                      }}
                    >
                      Đóng
                    </Button>
                  </>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedBooking(null);
                    }}
                  >
                    Đóng
                  </Button>
                )}
              </div>
            </div>

            {/* Booking Details */}
            {/* <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#625EE8]" />
                Thông tin đặt bàn
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2 pb-3 mb-3 border-b border-blue-200">
                  <p className="text-gray-600 text-xs mb-1">Mã phiếu đặt bàn</p>
                  <p className="font-bold text-xl text-[#625EE8]">
                    {selectedBooking.id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Số người:</p>
                  <p className="font-medium">{selectedBooking.guests} người</p>
                </div>
                <div>
                  <p className="text-gray-600">Giờ đặt:</p>
                  <p className="font-medium">{selectedBooking.reservation_time}</p>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Ghi chú:</p>
                    <p className="font-medium">{selectedBooking.notes}</p>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-blue-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tiền cọc đã thanh toán:
                    </span>
                    <span className="font-medium text-[#625EE8]">
                      {selectedBooking.depositAmount.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Items List */}
            {/* <div>
              <h4 className="mb-3">Món đã gọi</h4>
              <div className="space-y-3">
                {selectedBooking.bill.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <Utensils className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm mb-1">{item.name}</h4>
                          {item.notes && (
                            <p className="text-xs text-gray-600">
                              Ghi chú: {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm mb-1">
                            {item.price.toLocaleString()}đ x {item.quantity}
                          </p>
                          <p className="text-[#625EE8] text-sm">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                      {item.status && (
                        <Badge className={getItemStatusColor(item.status)}>
                          {getItemStatusText(item.status)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Bill Summary */}
            {/* <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{selectedBooking.bill.subtotal.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Thuế VAT (10%):</span>
                <span>{selectedBooking.bill.tax.toLocaleString()}đ</span>
              </div>
              {selectedBooking.bill.voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá (Voucher):</span>
                  <span>
                    -{selectedBooking.bill.voucherDiscount.toLocaleString()}đ
                  </span>
                </div>
              )}
              {selectedBooking.bill.pointsDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá (Điểm):</span>
                  <span>
                    -{selectedBooking.bill.pointsDiscount.toLocaleString()}đ
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-[#625EE8]">
                  {selectedBooking.bill.total.toLocaleString()}đ
                </span>
              </div>
            </div> */}
          </div>
        ) : (
          ""
        )}
      </Modal>

      {/* Feedback Modal */}
      {/* <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Gửi đánh giá"
      >
        <div className="space-y-6">
          <div>
            <label className="block mb-3 text-center">
              Bạn đánh giá thế nào về dịch vụ của chúng tôi?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2">Chia sẻ cảm nhận của bạn</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Món ăn ngon, phục vụ tận tình..."
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowFeedbackModal(false)}
            >
              Bỏ qua
            </Button>
            <Button fullWidth onClick={handleSubmitFeedback}>
              Gửi đánh giá
            </Button>
          </div>
        </div>
      </Modal> */}

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Xác nhận hủy đặt bàn"
      >
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Bạn có chắc chắn muốn hủy phiếu đặt bàn{" "}
              <span className="font-bold">{selectedBooking?.id}</span>?
            </p>
          </div>

          {/* <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                i
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Chính sách hoàn tiền:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tiền cọc sẽ được hoàn lại 100%</li>
                  <li>Thời gian xử lý: 3-5 ngày làm việc</li>
                  <li>Tiền sẽ được hoàn về phương thức thanh toán ban đầu</li>
                </ul>
              </div>
            </div>
          </div> */}

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowCancelModal(false)}
            >
              Giữ lại phiếu đặt
            </Button>
            <Button
              fullWidth
              onClick={handleCancelBooking}
              className="bg-red-500 hover:bg-red-600"
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal - For pending status (unpaid deposit) */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedBooking(null);
        }}
        title="Thanh toán tiền cọc"
        size="lg"
      >
        {selectedBooking ? (
          <div className="space-y-6">
            {/* Reservation Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Mã đặt bàn</p>
                  <p className="text-lg font-medium">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời gian hẹn</p>
                  <p className="text-lg font-medium">
                    {selectedBooking.reservation_date} {selectedBooking.reservation_time}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bàn số</p>
                  <p className="text-lg font-medium">{selectedBooking.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khu vực</p>
                  <p className="text-lg font-medium">{selectedBooking.locationName}</p>
                </div>
              </div>
            </div>

            {/* Deposit Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Bạn chưa thanh toán tiền cọc cho phiếu đặt bàn này. 
                Vui lòng thanh toán tiền cọc để hoàn tất quá trình đặt bàn.
              </p>
            </div>

            {/* Deposit Amount */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số tiền cọc cần thanh toán</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {parseInt(selectedBooking.deposit_amount || "0").toLocaleString()}đ
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-700">
                  Chưa thanh toán
                </Badge>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h4 className="mb-3 font-medium">Chi tiết đặt bàn</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-sm">
                  <p className="text-gray-600">Số khách:</p>
                  <p className="font-medium">{selectedBooking.number_of_guests} người</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Ngày đặt:</p>
                  <p className="font-medium">{selectedBooking.createdAtFormatted}</p>
                </div>
              </div>
              {selectedBooking.special_requests && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
                  <p className="text-sm">{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBooking(null);
                }}
              >
                Để sau
              </Button>
              <Button
                fullWidth
                onClick={handlePaymentComplete}
              >
                Thanh toán ngay
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
        </>
      )}
    </div>
  );
}
