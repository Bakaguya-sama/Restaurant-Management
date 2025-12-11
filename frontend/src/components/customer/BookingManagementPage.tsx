import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Utensils,
  Receipt,
  Tag,
  Gift,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/badge";

export function BookingManagementPage() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Mock data: Bookings with optional bills
  const bookings = [
    {
      id: "BK001",
      date: "2025-12-09",
      time: "19:00",
      guests: 4,
      tableNumber: "T05",
      area: "Khu ngoài trời",
      notes: "Gần cửa sổ",
      preOrders: [
        { name: "Phở Bò Đặc Biệt", quantity: 2, price: 85000 },
        { name: "Gỏi Cuốn Tôm Thịt", quantity: 3, price: 45000 },
      ],
      depositAmount: 150000,
      status: "completed",
      createdAt: "2025-12-08",
      // Bill information (if customer ordered food)
      bill: {
        id: "BILL-H001",
        billDate: "2025-12-09",
        billTime: "19:30",
        subtotal: 450000,
        voucherUsed: "WINTER2025",
        voucherDiscount: 67500,
        pointsUsed: 0,
        total: 382500,
        status: "paid",
        paymentMethod: "online",
      },
    },
    {
      id: "BK002",
      date: "2025-12-07",
      time: "20:00",
      guests: 6,
      tableNumber: "T08",
      area: "Khu VIP",
      notes: "Sinh nhật, cần trang trí",
      preOrders: [
        { name: "Lẩu Thái", quantity: 1, price: 350000 },
        { name: "Salad Trộn", quantity: 2, price: 55000 },
      ],
      depositAmount: 200000,
      status: "confirmed",
      createdAt: "2025-12-06",
      // No bill yet - only booking
      bill: null,
    },
    {
      id: "BK003",
      date: "2025-12-05",
      time: "18:00",
      guests: 2,
      tableNumber: "T03",
      area: "Khu trong nhà",
      notes: "Không cay",
      preOrders: [{ name: "Bún Chả Hà Nội", quantity: 2, price: 65000 }],
      depositAmount: 100000,
      status: "completed",
      createdAt: "2025-12-04",
      bill: {
        id: "BILL-H002",
        billDate: "2025-12-05",
        billTime: "18:15",
        subtotal: 320000,
        pointsUsed: 1000,
        pointsDiscount: 1000,
        total: 319000,
        status: "paid",
        paymentMethod: "cash",
      },
    },
    {
      id: "BK004",
      date: "2025-12-03",
      time: "12:30",
      guests: 3,
      tableNumber: "T12",
      area: "Khu trong nhà",
      notes: "Gần quầy bar",
      preOrders: [],
      depositAmount: 100000,
      status: "completed",
      createdAt: "2025-12-02",
      // No pre-orders, no bill - just booking
      bill: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Quản lý đặt bàn</h2>
        <p className="text-gray-600 mt-1">
          Xem lại thông tin đặt bàn và hóa đơn của bạn
        </p>
      </div>

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
                      {booking.date} {booking.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {booking.guests} khách
                    </span>
                    <span>Bàn {booking.tableNumber}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(booking.status)}>
                  {getStatusText(booking.status)}
                </Badge>
                {booking.bill && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                    <Receipt className="w-4 h-4" />
                    <span>Có hóa đơn</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <span className="text-gray-600">Tiền cọc:</span>
                <span className="ml-2 font-medium">
                  {booking.depositAmount.toLocaleString()}đ
                </span>
              </div>
              {booking.bill && (
                <div className="text-sm">
                  <span className="text-gray-600">Tổng bill:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {booking.bill.total.toLocaleString()}đ
                  </span>
                </div>
              )}
              <div className="text-sm col-span-2">
                <span className="text-gray-600">Khu vực:</span>
                <span className="ml-2">{booking.area}</span>
              </div>
            </div>

            {/* View Details Button */}
            <Button
              size="sm"
              variant="secondary"
              fullWidth
              onClick={() => {
                setSelectedBooking(booking);
                setShowDetailModal(true);
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBooking(null);
        }}
        title={`Chi tiết - ${selectedBooking?.id}`}
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Booking Information */}
            <div>
              <h4 className="mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Thông tin đặt bàn
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Ngày đặt</span>
                  </div>
                  <p className="font-medium">
                    {selectedBooking.date} - {selectedBooking.time}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Số khách</span>
                  </div>
                  <p className="font-medium">{selectedBooking.guests} người</p>
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
                  <p className="font-medium">{selectedBooking.area}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedBooking.notes && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
                <p>{selectedBooking.notes}</p>
              </div>
            )}

            {/* Pre-orders */}
            {selectedBooking.preOrders &&
              selectedBooking.preOrders.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Món ăn đặt trước
                  </h4>
                  <div className="space-y-3">
                    {selectedBooking.preOrders.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#10B981]">
                              {item.price.toLocaleString()}đ
                            </p>
                            <p className="text-sm text-gray-600">
                              Tổng:{" "}
                              {(item.price * item.quantity).toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    {/* Pre-order Total */}
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Tổng món đặt trước:
                        </span>
                        <span className="text-lg font-medium">
                          {selectedBooking.preOrders
                            .reduce(
                              (sum: number, item: any) =>
                                sum + item.price * item.quantity,
                              0
                            )
                            .toLocaleString()}
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Deposit Information */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tiền đặt cọc</p>
                  <p className="text-xl font-medium text-green-700">
                    {selectedBooking.depositAmount.toLocaleString()}đ
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Đã thanh toán
                </Badge>
              </div>
            </div>

            {/* Bill Information (if exists) */}
            {selectedBooking.bill && (
              <div className="border-t pt-6">
                <h4 className="mb-3 flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Thông tin hóa đơn
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Mã hóa đơn:</span>
                      <span className="font-medium">
                        {selectedBooking.bill.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Thời gian:</span>
                      <span>
                        {selectedBooking.bill.billDate}{" "}
                        {selectedBooking.bill.billTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tạm tính:</span>
                      <span>
                        {selectedBooking.bill.subtotal.toLocaleString()}đ
                      </span>
                    </div>

                    {/* Discounts */}
                    {selectedBooking.bill.voucherUsed && (
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Tag className="w-4 h-4" />
                          Voucher: {selectedBooking.bill.voucherUsed}
                        </span>
                        <span className="text-green-600">
                          -
                          {selectedBooking.bill.voucherDiscount.toLocaleString()}
                          đ
                        </span>
                      </div>
                    )}
                    {selectedBooking.bill.pointsUsed > 0 && (
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Gift className="w-4 h-4" />
                          Điểm: {selectedBooking.bill.pointsUsed}
                        </span>
                        <span className="text-green-600">
                          -
                          {selectedBooking.bill.pointsDiscount.toLocaleString()}
                          đ
                        </span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="pt-3 border-t border-blue-200 flex items-center justify-between">
                      <span className="font-medium">Tổng thanh toán:</span>
                      <span className="text-xl font-bold text-green-600">
                        {selectedBooking.bill.total.toLocaleString()}đ
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Phương thức:
                      </span>
                      <span className="capitalize">
                        {selectedBooking.bill.paymentMethod}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-700 w-full justify-center">
                        Đã thanh toán
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Creation Date */}
            <div className="text-center text-sm text-gray-500">
              Đặt bàn lúc: {selectedBooking.createdAt}
            </div>

            <Button
              fullWidth
              onClick={() => {
                setShowDetailModal(false);
                setSelectedBooking(null);
              }}
            >
              Đóng
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
