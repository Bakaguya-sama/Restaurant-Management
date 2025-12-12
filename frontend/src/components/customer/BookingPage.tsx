import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Card } from "../ui/Card";
// import { Modal } from "../ui/Modal";
import { mockTables, mockMenuItems } from "../../lib/mockData";
import { Table, MenuItem } from "../../types";
import { toast } from "sonner";
import {
  validateFutureDate,
  validateNumberRange,
  validateInteger,
} from "../../lib/validation";

export function BookingPage() {
  const navigate = useNavigate();
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
  // const [selectedDishes, setSelectedDishes] = useState<
  //   Array<{ item: MenuItem; quantity: number; notes: string }>
  // >([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Menu search and filter states
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDishForDetail, setSelectedDishForDetail] =
    useState<MenuItem | null>(null);
  const [dishNote, setDishNote] = useState("");

  const availableTables = mockTables.filter(
    (t) => t.status === "free" || t.status === "reserved"
  );

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setBookingData({ ...bookingData, tableId: table.id });
  };

  // const handleAddDish = (dish: MenuItem, notes: string) => {
  //   const existingIndex = selectedDishes.findIndex(
  //     (d) => d.item.id === dish.id && d.notes === notes
  //   );
  //   if (existingIndex >= 0) {
  //     const updated = [...selectedDishes];
  //     updated[existingIndex].quantity += 1;
  //     setSelectedDishes(updated);
  //   } else {
  //     setSelectedDishes([
  //       ...selectedDishes,
  //       { item: dish, quantity: 1, notes },
  //     ]);
  //   }
  //   toast.success(`Đã thêm ${dish.name} vào đơn hàng!`);
  //   setSelectedDishForDetail(null);
  //   setDishNote("");
  // };

  // const handleRemoveDish = (index: number) => {
  //   setSelectedDishes(selectedDishes.filter((_, i) => i !== index));
  // };

  // const handleUpdateQuantity = (index: number, delta: number) => {
  //   const updated = [...selectedDishes];
  //   updated[index].quantity += delta;
  //   if (updated[index].quantity <= 0) {
  //     setSelectedDishes(updated.filter((_, i) => i !== index));
  //   } else {
  //     setSelectedDishes(updated);
  //   }
  // };

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
            <Button onClick={() => navigate("/customer/home")}>
              Về trang chủ
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/customer/bills")}
            >
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
              label="Giờ (8:00 - 20:00)"
              type="time"
              icon={<Clock className="w-4 h-4" />}
              value={bookingData.time}
              onChange={(e) =>
                setBookingData({ ...bookingData, time: e.target.value })
              }
              min="08:00"
              max="20:00"
            />
            <Input
              label="Số người"
              type="number"
              icon={<Users className="w-4 h-4" />}
              value={bookingData.guests}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  guests: parseInt(e.target.value) || 1,
                })
              }
              min="1"
              max="8"
              step="1"
            />
          </div>
          <Button
            onClick={() => {
              // Validate date
              const dateValidation = validateFutureDate(
                bookingData.date,
                "Ngày đặt bàn"
              );
              if (!dateValidation.isValid) {
                toast.error(dateValidation.error);
                return;
              }

              // Validate time range (8:00 AM - 8:00 PM)
              if (bookingData.time) {
                const [hours, minutes] = bookingData.time
                  .split(":")
                  .map(Number);
                const timeInMinutes = hours * 60 + minutes;
                const minTime = 8 * 60; // 8:00 AM
                const maxTime = 20 * 60; // 8:00 PM

                if (timeInMinutes < minTime || timeInMinutes > maxTime) {
                  toast.error(
                    "Giờ đặt bàn phải trong khoảng 8:00 sáng đến 8:00 tối"
                  );
                  return;
                }
              }

              // Validate guests count
              const guestsValidation = validateInteger(
                bookingData.guests,
                "Số người"
              );
              if (!guestsValidation.isValid) {
                toast.error(guestsValidation.error);
                return;
              }

              const guestsRangeValidation = validateNumberRange(
                bookingData.guests,
                1,
                8,
                "Số người"
              );
              if (!guestsRangeValidation.isValid) {
                toast.error(guestsRangeValidation.error);
                return;
              }

              setStep(2);
            }}
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

            {/* <div className="border-t pt-6">
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
            </div> */}
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
                {/* {selectedDishes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Món đặt trước:</span>
                    <span>{selectedDishes.length} món</span>
                  </div>
                )} */}
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

      {/* Pre-order Menu Modal */}
      {/* <Modal
        isOpen={showPreOrderModal && !selectedDishForDetail}
        onClose={() => {
          setShowPreOrderModal(false);
          setMenuSearchQuery("");
          setSelectedCategory("all");
        }}
        title="Chọn món đặt trước"
        size="xl"
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <Input
              placeholder="Tìm kiếm món ăn..."
              icon={<Search className="w-4 h-4" />}
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["all", "Khai vị", "Món chính", "Đồ uống"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-[#0056D2] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "Tất cả" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {mockMenuItems
              .filter((item) => {
                const matchesSearch = item.name
                  .toLowerCase()
                  .includes(menuSearchQuery.toLowerCase());
                const matchesCategory =
                  selectedCategory === "all" ||
                  item.category === selectedCategory;
                return item.available && matchesSearch && matchesCategory;
              })
              .map((item) => (
                <Card
                  key={item.id}
                  hover
                  onClick={() => setSelectedDishForDetail(item)}
                  className="overflow-hidden cursor-pointer"
                >
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400"
                    }
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {item.description || "Món ăn ngon tuyệt vời"}
                    </p>
                    <span className="text-[#0056D2] text-sm">
                      {item.price.toLocaleString()}đ
                    </span>
                  </div>
                </Card>
              ))}
          </div>

          {selectedDishes.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4>
                  Món đã chọn (
                  {selectedDishes.reduce((sum, d) => sum + d.quantity, 0)})
                </h4>
                <span className="text-[#0056D2]">
                  {selectedDishes
                    .reduce((sum, d) => sum + d.item.price * d.quantity, 0)
                    .toLocaleString()}
                  đ
                </span>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedDishes.map((dish, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={
                        dish.item.image ||
                        "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=100"
                      }
                      alt={dish.item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{dish.item.name}</p>
                      {dish.notes && (
                        <p className="text-xs text-gray-600 truncate">
                          Ghi chú: {dish.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 border rounded">
                        <button
                          onClick={() => handleUpdateQuantity(index, -1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">
                          {dish.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, 1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        {(dish.item.price * dish.quantity).toLocaleString()}đ
                      </span>
                      <button
                        onClick={() => handleRemoveDish(index)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowPreOrderModal(false);
                setMenuSearchQuery("");
                setSelectedCategory("all");
              }}
              className="flex-1"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal> */}

      {/* Dish Detail Modal */}
      {/* <Modal
        isOpen={selectedDishForDetail !== null}
        onClose={() => {
          setSelectedDishForDetail(null);
          setDishNote("");
        }}
        title={selectedDishForDetail?.name || ""}
        size="lg"
      >
        {selectedDishForDetail && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={
                  selectedDishForDetail.image ||
                  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=600"
                }
                alt={selectedDishForDetail.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <p className="text-gray-600 mb-4">
                {selectedDishForDetail.description}
              </p>

              {selectedDishForDetail.ingredients && (
                <div className="mb-4">
                  <p className="mb-2">Thành phần:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDishForDetail.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm mb-2">Ghi chú đặc biệt:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["Không cay", "Ít đường", "Không hành", "Mang về"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setDishNote(dishNote ? `${dishNote}, ${tag}` : tag)
                        }
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
                <Input
                  placeholder="Hoặc nhập ghi chú tùy chỉnh..."
                  value={dishNote}
                  onChange={(e) => setDishNote(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-2xl text-[#0056D2]">
                  {selectedDishForDetail.price.toLocaleString()}đ
                </span>
                <Button
                  onClick={() => handleAddDish(selectedDishForDetail, dishNote)}
                >
                  Thêm vào đơn
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal> */}
    </div>
  );
}
