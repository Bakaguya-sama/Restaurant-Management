import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { mockTables, mockMenuItems } from "../../lib/mockData";
import { Table, MenuItem } from "../../types";

interface BookingPageProps {
  onNavigate: (page: string) => void;
}

export function BookingPage({ onNavigate }: BookingPageProps) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    guests: 2,
    name: "",
    phone: "",
    notes: "",
    tableId: "",
    preOrder: false,
  });
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<MenuItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableTables = mockTables.filter(
    (t) => t.status === "free" || t.status === "reserved"
  );

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setBookingData({ ...bookingData, tableId: table.id });
  };

  const handleAddDish = (dish: MenuItem) => {
    setSelectedDishes([...selectedDishes, dish]);
  };

  const handleRemoveDish = (dishId: string) => {
    setSelectedDishes(selectedDishes.filter((d) => d.id !== dishId));
  };

  const handleConfirmBooking = () => {
    setShowSuccess(true);
  };

  const depositAmount = 200000;

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Card className="p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="mb-4 text-green-600">Đặt bàn thành công!</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-6xl mb-4">
              <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
                <span className="text-sm">QR Code</span>
              </div>
            </div>
            <p className="text-gray-600 mb-2">Mã đặt bàn</p>
            <p className="text-2xl mb-4">BK12345</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Ngày giờ</p>
                <p>
                  {bookingData.date} {bookingData.time}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Số người</p>
                <p>{bookingData.guests} người</p>
              </div>
              <div>
                <p className="text-gray-600">Bàn số</p>
                <p>{selectedTable?.number}</p>
              </div>
              <div>
                <p className="text-gray-600">Khu vực</p>
                <p>{selectedTable?.area}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => onNavigate("home")}>Về trang chủ</Button>
            <Button variant="secondary" onClick={() => onNavigate("bills")}>
              Xem chi tiết
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Đặt bàn</h2>
        <p className="text-gray-600 mt-1">
          Đặt chỗ trước dễ dàng và nhanh chóng
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {["Chọn thời gian", "Chọn bàn", "Thông tin", "Thanh toán"].map(
          (label, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step > index + 1
                      ? "bg-green-500 text-white"
                      : step === index + 1
                      ? "bg-[#0056D2] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > index + 1 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600">{label}</span>
              </div>
              {index < 3 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    step > index + 1 ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          )
        )}
      </div>

      {/* Step 1: Date & Time */}
      {step === 1 && (
        <Card className="p-8">
          <h3 className="mb-6">Chọn ngày giờ đặt bàn</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Input
              label="Ngày"
              type="date"
              icon={<Calendar className="w-4 h-4" />}
              value={bookingData.date}
              onChange={(e) =>
                setBookingData({ ...bookingData, date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
            />
            <Input
              label="Giờ"
              type="time"
              icon={<Clock className="w-4 h-4" />}
              value={bookingData.time}
              onChange={(e) =>
                setBookingData({ ...bookingData, time: e.target.value })
              }
            />
            <Input
              label="Số người"
              type="number"
              icon={<Users className="w-4 h-4" />}
              value={bookingData.guests}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  guests: parseInt(e.target.value),
                })
              }
              min="1"
            />
          </div>
          <Button
            onClick={() => setStep(2)}
            disabled={!bookingData.date || !bookingData.time}
          >
            Tiếp tục
          </Button>
        </Card>
      )}

      {/* Step 2: Select Table */}
      {step === 2 && (
        <div>
          <Card className="p-8 mb-6">
            <h3 className="mb-6">Chọn vị trí bàn</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTable?.id === table.id
                      ? "border-[#0056D2] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <p className="mb-1">{table.number}</p>
                    <p className="text-sm text-gray-600">{table.area}</p>
                    <p className="text-xs text-gray-500">
                      {table.seats} chỗ ngồi
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <Button onClick={() => setStep(3)} disabled={!selectedTable}>
              Tiếp tục
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Information */}
      {step === 3 && (
        <div>
          <Card className="p-8 mb-6">
            <h3 className="mb-6">Thông tin đặt bàn</h3>
            <div className="space-y-4 mb-6">
              <Input
                label="Họ và tên"
                value={bookingData.name}
                onChange={(e) =>
                  setBookingData({ ...bookingData, name: e.target.value })
                }
                placeholder="Nhập họ tên"
              />
              <Input
                label="Số điện thoại"
                value={bookingData.phone}
                onChange={(e) =>
                  setBookingData({ ...bookingData, phone: e.target.value })
                }
                placeholder="Nhập số điện thoại"
              />
              <Textarea
                label="Ghi chú yêu cầu đặc biệt"
                value={bookingData.notes}
                onChange={(e) =>
                  setBookingData({ ...bookingData, notes: e.target.value })
                }
                placeholder="VD: Cần ghế em bé, khu vực yên tĩnh..."
                rows={3}
              />
            </div>

            <div className="border-t pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingData.preOrder}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      preOrder: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300"
                />
                <div>
                  <p>Đặt món trước</p>
                  <p className="text-sm text-gray-600">
                    Chọn món ăn ngay để tiết kiệm thời gian
                  </p>
                </div>
              </label>
              {bookingData.preOrder && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPreOrderModal(true)}
                  >
                    Chọn món ({selectedDishes.length})
                  </Button>
                </div>
              )}
            </div>
          </Card>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Quay lại
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={!bookingData.name || !bookingData.phone}
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div>
          <Card className="p-8 mb-6">
            <h3 className="mb-6">Thanh toán cọc</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Bạn cần thanh toán tiền cọc {depositAmount.toLocaleString()}đ để
                hoàn tất đặt bàn
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-[#0056D2] rounded-lg bg-blue-50 text-left">
                  <CreditCard className="w-6 h-6 text-[#0056D2] mb-2" />
                  <p>Ví điện tử</p>
                  <p className="text-sm text-gray-600">MoMo, ZaloPay</p>
                </button>
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 text-left">
                  <CreditCard className="w-6 h-6 text-gray-600 mb-2" />
                  <p>Thẻ ngân hàng</p>
                  <p className="text-sm text-gray-600">ATM, Visa, Master</p>
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="mb-4">Tóm tắt đặt bàn</h4>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày giờ:</span>
                  <span>
                    {bookingData.date} {bookingData.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bàn số:</span>
                  <span>
                    {selectedTable?.number} - {selectedTable?.area}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số người:</span>
                  <span>{bookingData.guests} người</span>
                </div>
                {selectedDishes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Món đặt trước:</span>
                    <span>{selectedDishes.length} món</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span>Tiền cọc:</span>
                  <span>{depositAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </Card>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setStep(3)}>
              Quay lại
            </Button>
            <Button onClick={handleConfirmBooking}>
              Xác nhận & Thanh toán
            </Button>
          </div>
        </div>
      )}

      {/* Pre-order Modal */}
      <Modal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        title="Chọn món đặt trước"
        size="lg"
      >
        <div className="space-y-4">
          {mockMenuItems
            .filter((m) => m.available)
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=100"
                  }
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                  <span className="text-[#0056D2]">
                    {item.price.toLocaleString()}đ
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddDish(item)}
                  disabled={selectedDishes.some((d) => d.id === item.id)}
                >
                  {selectedDishes.some((d) => d.id === item.id)
                    ? "Đã chọn"
                    : "Thêm"}
                </Button>
              </div>
            ))}
        </div>
        {selectedDishes.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="mb-4">Món đã chọn ({selectedDishes.length})</h4>
            <div className="space-y-2">
              {selectedDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{dish.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      {dish.price.toLocaleString()}đ
                    </span>
                    <button
                      onClick={() => handleRemoveDish(dish.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
