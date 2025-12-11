import React, { useState } from "react";
import {
  Clock,
  Check,
  Utensils,
  DollarSign,
  MessageSquare,
  Star,
  CreditCard,
  Tag,
  Gift,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/Input";
import {
  mockInvoices,
  mockMenuItems,
  mockPromotions,
} from "../../lib/mockData";
import { toast } from "sonner";

interface BillsPageProps {
  onNavigate: (page: string) => void;
}

export function BillsPage({ onNavigate }: BillsPageProps) {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "card" | "cash" | null
  >(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showVoucherSection, setShowVoucherSection] = useState(false);

  // Mock customer data
  const customerPoints = 1500;

  // Mock current bill at table
  const [currentBill, setCurrentBill] = useState({
    id: "BILL001",
    tableNumber: "T02",
    items: [
      {
        id: "1",
        name: "Phở Bò Đặc Biệt",
        quantity: 2,
        price: 85000,
        status: "served",
        notes: "Không hành",
      },
      {
        id: "2",
        name: "Gỏi Cuốn Tôm Thịt",
        quantity: 1,
        price: 45000,
        status: "cooking",
      },
      {
        id: "3",
        name: "Trà Đá Chanh",
        quantity: 2,
        price: 20000,
        status: "served",
      },
    ],
    subtotal: 215000,
    tax: 21500,
    discount: 0,
    voucherDiscount: 0,
    pointsDiscount: 0,
    total: 236500,
    status: "pending",
    createdAt: new Date().toISOString(),
    voucherCode: null,
    pointsUsed: 0,
  });

  // Mock bill history
  const billHistory = [
    {
      id: "BILL-H001",
      date: "2025-12-09",
      time: "19:30",
      subtotal: 450000,
      voucherUsed: "WINTER2025",
      voucherDiscount: 67500,
      pointsUsed: 0,
      total: 382500,
      status: "paid",
      tableNumber: "T05",
      paymentMethod: "online",
    },
    {
      id: "BILL-H002",
      date: "2025-12-05",
      time: "18:15",
      subtotal: 320000,
      pointsUsed: 1000,
      pointsDiscount: 1000,
      total: 319000,
      status: "paid",
      tableNumber: "T03",
      paymentMethod: "cash",
    },
  ];

  const handleApplyVoucher = () => {
    const voucher = mockPromotions.find(
      (p) => p.code === voucherCode && p.active
    );
    if (voucher) {
      let discount = 0;
      if (voucher.discountType === "percentage") {
        discount = Math.floor(
          (currentBill.subtotal + currentBill.tax) *
            (voucher.discountValue / 100)
        );
      } else {
        discount = voucher.discountValue;
      }

      setAppliedVoucher(voucher);
      setCurrentBill({
        ...currentBill,
        voucherDiscount: discount,
        voucherCode: voucher.code,
        total:
          currentBill.subtotal +
          currentBill.tax -
          discount -
          currentBill.pointsDiscount,
      });
      setShowVoucherModal(false);
      toast.success("Áp dụng voucher thành công!");
    } else {
      toast.error("Mã voucher không hợp lệ hoặc đã hết hạn");
    }
  };

  const handleSelectPromotion = (promo: any) => {
    let discount = 0;
    if (promo.discountType === "percentage") {
      discount = Math.floor(
        (currentBill.subtotal + currentBill.tax) * (promo.discountValue / 100)
      );
    } else {
      discount = promo.discountValue;
    }

    setAppliedVoucher(promo);
    setVoucherCode(promo.code);
    setCurrentBill({
      ...currentBill,
      voucherDiscount: discount,
      voucherCode: promo.code,
      total:
        currentBill.subtotal +
        currentBill.tax -
        discount -
        currentBill.pointsDiscount,
    });
    setShowVoucherModal(false);
    toast.success("Áp dụng voucher thành công!");
  };

  const handleUsePoints = () => {
    if (pointsToUse > customerPoints) {
      toast.error("Số điểm không đủ!");
      return;
    }
    if (pointsToUse < 1000) {
      toast.error("Số điểm tối thiểu là 1000 điểm");
      return;
    }

    const discount = pointsToUse; // 1000 points = 1000đ
    setCurrentBill({
      ...currentBill,
      pointsDiscount: discount,
      pointsUsed: pointsToUse,
      total:
        currentBill.subtotal +
        currentBill.tax -
        currentBill.voucherDiscount -
        discount,
    });
    toast.success(
      `Đã quy đổi ${pointsToUse} điểm = ${discount.toLocaleString()}đ`
    );
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    // Simulate payment processing
    setTimeout(() => {
      setShowPaymentModal(false);
      if (paymentMethod === "cash") {
        toast.success(
          "Đã gửi yêu cầu thanh toán! Vui lòng chờ nhân viên xác nhận."
        );
      } else {
        toast.success("Thanh toán thành công!");
      }
    }, 1500);
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    toast.success("Cảm ơn bạn đã gửi đánh giá!");
    setShowFeedbackModal(false);
    setRating(0);
    setFeedback("");
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Hóa đơn của tôi</h2>
        <p className="text-gray-600 mt-1">
          Quản lý và thanh toán hóa đơn của bạn
        </p>
      </div>

      {/* Current Bill Section */}
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="mb-2">Hóa đơn hiện tại</h3>
            <p className="text-gray-600">Bàn số: {currentBill.tableNumber}</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700">Đang sử dụng</Badge>
        </div>

        {/* Items List */}
        <div className="space-y-4 mb-6">
          {currentBill.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <Utensils className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="mb-1">{item.name}</h4>
                    {item.notes && (
                      <p className="text-sm text-gray-600">
                        Ghi chú: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="mb-1">
                      {item.price.toLocaleString()}đ x {item.quantity}
                    </p>
                    <p className="text-[#0056D2]">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusText(item.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Voucher/Points Section */}
        <div className="mb-6 border-t pt-4">
          <button
            onClick={() => setShowVoucherSection(!showVoucherSection)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#0056D2]" />
              <span>Áp dụng voucher hoặc quy đổi điểm</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showVoucherSection ? "rotate-180" : ""
              }`}
            />
          </button>

          {showVoucherSection && (
            <div className="mt-4 space-y-4">
              {/* Voucher Section */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm">Voucher giảm giá</h4>
                  {appliedVoucher ? (
                    <Badge className="bg-green-100 text-green-700">
                      Đã áp dụng: {appliedVoucher.code}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowVoucherModal(true)}
                    >
                      Chọn voucher
                    </Button>
                  )}
                </div>
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{appliedVoucher.name}</span>
                    <span className="text-green-600">
                      -{currentBill.voucherDiscount.toLocaleString()}đ
                    </span>
                  </div>
                )}
              </div>

              {/* Points Section */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm">Quy đổi điểm</h4>
                  <span className="text-sm text-gray-600">
                    Có: {customerPoints.toLocaleString()} điểm
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Nhập số điểm (1000 điểm = 1.000đ)"
                    value={pointsToUse || ""}
                    onChange={(e) =>
                      setPointsToUse(parseInt(e.target.value) || 0)
                    }
                    disabled={currentBill.pointsUsed > 0}
                  />
                  {currentBill.pointsUsed > 0 ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setCurrentBill({
                          ...currentBill,
                          pointsDiscount: 0,
                          pointsUsed: 0,
                          total:
                            currentBill.subtotal +
                            currentBill.tax -
                            currentBill.voucherDiscount,
                        });
                        setPointsToUse(0);
                      }}
                    >
                      Hủy
                    </Button>
                  ) : (
                    <Button onClick={handleUsePoints}>Áp dụng</Button>
                  )}
                </div>
                {currentBill.pointsUsed > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">
                      Đã quy đổi: {currentBill.pointsUsed} điểm
                    </span>
                    <span className="text-green-600">
                      -{currentBill.pointsDiscount.toLocaleString()}đ
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bill Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính:</span>
            <span>{currentBill.subtotal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Thuế VAT (10%):</span>
            <span>{currentBill.tax.toLocaleString()}đ</span>
          </div>
          {currentBill.voucherDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá (Voucher):</span>
              <span>-{currentBill.voucherDiscount.toLocaleString()}đ</span>
            </div>
          )}
          {currentBill.pointsDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá (Điểm):</span>
              <span>-{currentBill.pointsDiscount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between text-xl pt-2 border-t">
            <span>Tổng cộng:</span>
            <span className="text-[#0056D2]">
              {currentBill.total.toLocaleString()}đ
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <Button fullWidth onClick={() => setShowPaymentModal(true)}>
            <CreditCard className="w-4 h-4 mr-2" />
            Thanh toán
          </Button>
        </div>
      </Card>

      {/* Bill History */}
      <div>
        <h3 className="mb-4">Lịch sử hóa đơn</h3>
        <div className="space-y-4">
          {billHistory.map((bill) => (
            <Card
              key={bill.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="mb-1">{bill.id}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {bill.date} {bill.time}
                      </span>
                      <span>Bàn {bill.tableNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl mb-1">{bill.total.toLocaleString()}đ</p>
                  <Badge className="bg-green-100 text-green-700">
                    Đã thanh toán
                  </Badge>
                </div>
              </div>

              {/* Discount Info */}
              {(bill.voucherUsed || bill.pointsUsed) && (
                <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                  {bill.voucherUsed && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        Voucher: {bill.voucherUsed}
                      </span>
                      <span className="text-green-600">
                        -{bill.voucherDiscount?.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                  {bill.pointsUsed && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        Điểm: {bill.pointsUsed} điểm
                      </span>
                      <span className="text-green-600">
                        -{bill.pointsDiscount?.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Button - Only for paid bills */}
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowFeedbackModal(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Gửi đánh giá
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Voucher Selection Modal */}
      <Modal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title="Chọn voucher hoặc nhập mã"
      >
        <div className="space-y-6">
          {/* Manual Code Input */}
          <div>
            <label className="block mb-2 text-sm">Nhập mã voucher</label>
            <div className="flex gap-2">
              <Input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã..."
              />
              <Button onClick={handleApplyVoucher}>Áp dụng</Button>
            </div>
          </div>

          {/* Available Promotions */}
          <div>
            <label className="block mb-3 text-sm">
              Hoặc chọn khuyến mãi có sẵn
            </label>
            <div className="space-y-3">
              {mockPromotions
                .filter((p) => p.active)
                .map((promo) => (
                  <div
                    key={promo.id}
                    onClick={() => handleSelectPromotion(promo)}
                    className="p-4 border-2 rounded-lg hover:border-[#0056D2] cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4>{promo.name}</h4>
                      <span className="px-3 py-1 bg-[#0056D2] text-white rounded-full text-sm">
                        {promo.discountType === "percentage"
                          ? `${promo.discountValue}%`
                          : `${promo.discountValue.toLocaleString()}đ`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Mã: {promo.code}
                    </p>
                    <p className="text-xs text-gray-500">
                      HSD: {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Thanh toán hóa đơn"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="text-2xl text-[#0056D2]">
                {currentBill.total.toLocaleString()}đ
              </span>
            </div>
          </div>

          <div>
            <label className="block mb-3">Chọn phương thức thanh toán:</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "cash"
                    ? "border-[#0056D2] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">💵</div>
                <p className="mb-1">Tiền mặt</p>
                <p className="text-xs text-gray-600">Thanh toán tại quầy</p>
              </button>
              <button
                onClick={() => setPaymentMethod("wallet")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "wallet"
                    ? "border-[#0056D2] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-6 h-6 text-[#0056D2] mb-2" />
                <p className="mb-1">Ví điện tử</p>
                <p className="text-xs text-gray-600">MoMo, ZaloPay</p>
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "card"
                    ? "border-[#0056D2] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-6 h-6 text-[#0056D2] mb-2" />
                <p className="mb-1">Thẻ ngân hàng</p>
                <p className="text-xs text-gray-600">ATM, Visa, Master</p>
              </button>
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Vui lòng đến quầy thanh toán. Nhân viên sẽ xác nhận giao dịch
                của bạn.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowPaymentModal(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handlePayment}>
              Xác nhận thanh toán
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Gửi đánh giá"
      >
        <div className="space-y-6">
          <div>
            <label className="block mb-3 text-center">
              Bạn đánh giá thế nào về trải nghiệm?
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
            <label className="block mb-2">
              Chia sẻ cảm nhận của bạn (tùy chọn)
            </label>
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
      </Modal>
    </div>
  );
}
