import React, { useState } from "react";
import {
  CreditCard,
  Wallet,
  Printer,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Tag,
  Gift,
  Percent,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import {
  mockInvoices,
  mockTables,
  mockPromotions,
} from "../../../lib/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";

export function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "wallet"
  >("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cashierSelectedPromotion, setCashierSelectedPromotion] =
    useState<any>(null);

  // Mock data - in real app, this would come from API
  const [invoices, setInvoices] = useState([
    {
      id: "INV001",
      tableId: "2",
      tableNumber: "T02",
      customerId: "C003",
      customerName: "Nguyễn Thị C",
      items: [
        { id: "1", name: "Phở Bò Đặc Biệt", quantity: 2, price: 85000 },
        { id: "2", name: "Gỏi Cuốn Tôm Thịt", quantity: 1, price: 45000 },
        { id: "3", name: "Trà Đá Chanh", quantity: 2, price: 20000 },
      ],
      subtotal: 255000,
      tax: 25500,
      discount: 0,
      total: 280500,
      status: "pending",
      paymentRequested: false,
      createdAt: "2025-12-11T14:30:00",
      customerSelectedVoucher: false,
      customerSelectedPoints: 0,
    },
    {
      id: "INV002",
      tableId: "7",
      tableNumber: "T07",
      customerId: "C007",
      customerName: "Phạm Văn G",
      items: [
        { id: "8", name: "Bún Bò Huế", quantity: 2, price: 80000 },
        { id: "9", name: "Nem Rán", quantity: 1, price: 55000 },
        { id: "10", name: "Cà Phê Sữa Đá", quantity: 2, price: 25000 },
      ],
      subtotal: 265000,
      tax: 26500,
      discount: 0,
      total: 291500,
      status: "payment-requested",
      paymentRequested: true,
      createdAt: "2025-12-11T15:30:00",
      customerSelectedVoucher: false,
      customerSelectedPoints: 0,
    },
    {
      id: "INV003",
      tableId: "9",
      tableNumber: "T09",
      customerId: "C009",
      customerName: "Hoàng Thị H",
      items: [
        { id: "11", name: "Cơm Gà Xối Mỡ", quantity: 1, price: 70000 },
        { id: "12", name: "Canh Chua", quantity: 1, price: 40000 },
        { id: "13", name: "Trà Đá", quantity: 1, price: 10000 },
      ],
      subtotal: 120000,
      tax: 12000,
      discount: 0,
      total: 132000,
      status: "payment-requested",
      paymentRequested: true,
      createdAt: "2025-12-11T15:45:00",
      customerSelectedVoucher: false,
      customerSelectedPoints: 0,
    },
    {
      id: "INV005",
      tableId: "4",
      tableNumber: "T04",
      customerId: "C004",
      customerName: "Trần Văn D",
      items: [
        { id: "4", name: "Bún Chả Hà Nội", quantity: 2, price: 75000 },
        { id: "5", name: "Sinh Tố Bơ", quantity: 2, price: 35000 },
      ],
      subtotal: 220000,
      tax: 22000,
      discount: 50000,
      total: 192000,
      voucherCode: "SAVE50K",
      voucherAmount: 50000,
      status: "payment-requested",
      paymentRequested: true,
      createdAt: "2025-12-11T15:00:00",
      customerSelectedVoucher: true,
      customerSelectedPoints: 0,
    },
    {
      id: "INV006",
      tableId: "5",
      tableNumber: "T05",
      customerId: "C005",
      customerName: "Lê Thị E",
      items: [
        { id: "6", name: "Phở Bò Đặc Biệt", quantity: 1, price: 85000 },
        { id: "7", name: "Trà Đá Chanh", quantity: 1, price: 20000 },
      ],
      subtotal: 105000,
      tax: 10500,
      discount: 1000,
      total: 114500,
      pointsUsed: 1000,
      pointsDiscount: 1000,
      status: "payment-requested",
      paymentRequested: true,
      createdAt: "2025-12-11T15:15:00",
      customerSelectedVoucher: false,
      customerSelectedPoints: 1000,
    },
  ]);

  const pendingInvoices = invoices.filter(
    (inv) => inv.status === "pending" || inv.status === "payment-requested"
  );
  const paidInvoices = mockInvoices.filter((inv) => inv.status === "paid");

  // Get available promotions for selected invoice
  const getAvailablePromotions = () => {
    if (!selectedInvoice) return [];

    return mockPromotions
      .filter((promo) => {
        // Must be active
        if (!promo.isActive) return false;

        // Check minimum order value
        if (
          promo.minOrderValue &&
          selectedInvoice.subtotal < promo.minOrderValue
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Calculate discount value for sorting
        const getDiscountValue = (promo: any) => {
          if (promo.discountType === "fixed") {
            return promo.discountValue;
          } else if (promo.discountType === "percentage") {
            const discount =
              selectedInvoice.subtotal * (promo.discountValue / 100);
            return Math.min(discount, promo.maxDiscount || Infinity);
          }
          return 0;
        };
        return getDiscountValue(b) - getDiscountValue(a);
      });
  };

  const availablePromotions = getAvailablePromotions();

  // Calculate final total with cashier-selected promotion
  const calculateFinalTotal = () => {
    if (!selectedInvoice) return 0;

    let discount = selectedInvoice.discount || 0;

    if (
      cashierSelectedPromotion &&
      !selectedInvoice.customerSelectedVoucher &&
      selectedInvoice.customerSelectedPoints === 0
    ) {
      if (cashierSelectedPromotion.discountType === "fixed") {
        discount = cashierSelectedPromotion.discountValue;
      } else if (cashierSelectedPromotion.discountType === "percentage") {
        discount = Math.min(
          selectedInvoice.subtotal *
            (cashierSelectedPromotion.discountValue / 100),
          cashierSelectedPromotion.maxDiscount || Infinity
        );
      }
    }

    return selectedInvoice.subtotal + selectedInvoice.tax - discount;
  };

  const finalTotal = calculateFinalTotal();
  const currentDiscount =
    cashierSelectedPromotion &&
    !selectedInvoice?.customerSelectedVoucher &&
    selectedInvoice?.customerSelectedPoints === 0
      ? selectedInvoice.subtotal + selectedInvoice.tax - finalTotal
      : selectedInvoice?.discount || 0;

  const handlePayment = () => {
    if (!selectedInvoice) return;

    const totalAmount = finalTotal;

    if (
      paymentMethod === "cash" &&
      (!cashReceived || parseFloat(cashReceived) < totalAmount)
    ) {
      toast.error("Số tiền không đủ!");
      return;
    }

    // Calculate loyalty points earned (10 points per 10,000đ spent)
    const pointsEarned = Math.floor(totalAmount / 10000) * 10;

    // Update invoice status
    const updatedInvoice = {
      ...selectedInvoice,
      status: "paid",
      paymentMethod,
      paidAt: new Date().toISOString(),
      finalTotal: totalAmount,
      finalDiscount: currentDiscount,
      appliedPromotion: cashierSelectedPromotion
        ? {
            code: cashierSelectedPromotion.code,
            name: cashierSelectedPromotion.name,
            discountAmount: currentDiscount,
          }
        : null,
      pointsEarned,
    };

    setInvoices(
      invoices.map((inv) =>
        inv.id === selectedInvoice.id ? updatedInvoice : inv
      )
    );

    // Show success message with details
    const change =
      paymentMethod === "cash" && cashReceived
        ? parseFloat(cashReceived) - totalAmount
        : 0;

    toast.success(
      <div>
        <p>Thanh toán thành công!</p>
        <p className="text-sm mt-1">Hóa đơn: {selectedInvoice.id}</p>
        {change > 0 && (
          <p className="text-sm">Tiền thừa: {change.toLocaleString()}đ</p>
        )}
        {pointsEarned > 0 && (
          <p className="text-sm text-green-600">
            +{pointsEarned} điểm tích lũy
          </p>
        )}
      </div>
    );

    // Reset states
    setSelectedInvoice(null);
    setCashReceived("");
    setCashierSelectedPromotion(null);
    setPaymentMethod("cash");

    // Auto print invoice
    setTimeout(() => {
      toast.info("Đang in hóa đơn cho khách hàng...");
    }, 1000);
  };

  const handlePrint = () => {
    toast.success("Đang in hóa đơn...");
  };

  return (
    <div>
      <div className="mb-6">
        <h2>Quản lý thanh toán</h2>
        <p className="text-gray-600 mt-1">
          Xử lý thanh toán và quản lý hóa đơn
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Chờ thanh toán ({pendingInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            <CheckCircle className="w-4 h-4 mr-2" />
            Đã thanh toán ({paidInvoices.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Payments Tab */}
        <TabsContent value="pending">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tables List */}
            <div className="lg:col-span-1">
              <h3 className="mb-4">Bàn cần xử lý</h3>
              <div className="space-y-3">
                {pendingInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    hover
                    onClick={() => setSelectedInvoice(invoice)}
                    className={`p-4 cursor-pointer ${
                      selectedInvoice?.id === invoice.id
                        ? "ring-2 ring-[#0056D2]"
                        : ""
                    } ${
                      invoice.paymentRequested
                        ? "border-l-4 border-l-red-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4>{invoice.tableNumber}</h4>
                      <Badge
                        className={
                          invoice.paymentRequested
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {invoice.paymentRequested ? (
                          <>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Yêu cầu thanh toán
                          </>
                        ) : (
                          "Đang dùng"
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {invoice.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoice.items.length} món •{" "}
                      {invoice.total.toLocaleString()}đ
                    </p>
                    {(invoice.customerSelectedVoucher ||
                      invoice.customerSelectedPoints > 0) && (
                      <div className="mt-2 pt-2 border-t text-xs text-blue-600">
                        Đã chọn ưu đãi
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Invoice Detail */}
            <div className="lg:col-span-2">
              {selectedInvoice ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3>Chi tiết hóa đơn</h3>
                      <p className="text-sm text-gray-600">
                        {selectedInvoice.tableNumber} •{" "}
                        {selectedInvoice.customerName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedInvoice(null)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {selectedInvoice.paymentRequested && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-800">
                          Khách hàng đã yêu cầu thanh toán. Vui lòng xử lý ngay!
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {new Date(
                            selectedInvoice.createdAt
                          ).toLocaleTimeString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Customer Applied Discounts */}
                  {(selectedInvoice.customerSelectedVoucher ||
                    selectedInvoice.customerSelectedPoints > 0) && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        Ưu đãi khách hàng đã chọn
                      </h4>
                      {selectedInvoice.customerSelectedVoucher &&
                        selectedInvoice.voucherCode && (
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-gray-700">
                              Voucher:{" "}
                              <span className="font-mono bg-white px-2 py-0.5 rounded">
                                {selectedInvoice.voucherCode}
                              </span>
                            </span>
                            <span className="text-green-600">
                              -{selectedInvoice.voucherAmount?.toLocaleString()}
                              đ
                            </span>
                          </div>
                        )}
                      {selectedInvoice.customerSelectedPoints > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 flex items-center gap-1">
                            <Gift className="w-4 h-4" />
                            Điểm: {selectedInvoice.customerSelectedPoints} điểm
                          </span>
                          <span className="text-green-600">
                            -{selectedInvoice.pointsDiscount?.toLocaleString()}đ
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-blue-600 mt-2">
                        ⚠️ Không thể thay đổi ưu đãi này
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="mb-6">
                    <h4 className="mb-3">Danh sách món</h4>
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p>{item.name}</p>
                            <p className="text-sm text-gray-600">
                              SL: {item.quantity}
                            </p>
                          </div>
                          <span>
                            {(item.price * item.quantity).toLocaleString()}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cashier can select promotion if customer hasn't selected */}
                  {!selectedInvoice.customerSelectedVoucher &&
                    selectedInvoice.customerSelectedPoints === 0 &&
                    availablePromotions.length > 0 && (
                      <div className="mb-6">
                        <h4 className="mb-3 flex items-center gap-2">
                          <Percent className="w-5 h-5 text-purple-600" />
                          Chọn khuyến mãi cho khách hàng
                        </h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          <button
                            onClick={() => setCashierSelectedPromotion(null)}
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                              !cashierSelectedPromotion
                                ? "border-[#0056D2] bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <p className="text-sm">Không áp dụng khuyến mãi</p>
                          </button>
                          {availablePromotions.map((promo) => {
                            const discountAmount =
                              promo.discountType === "fixed"
                                ? promo.discountValue
                                : Math.min(
                                    selectedInvoice.subtotal *
                                      (promo.discountValue / 100),
                                    promo.maxDiscount || Infinity
                                  );

                            return (
                              <button
                                key={promo.id}
                                onClick={() =>
                                  setCashierSelectedPromotion(promo)
                                }
                                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                  cashierSelectedPromotion?.id === promo.id
                                    ? "border-[#0056D2] bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="mb-1">{promo.name}</p>
                                    <p className="text-sm text-gray-600 mb-1">
                                      {promo.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                                        {promo.code}
                                      </Badge>
                                      {promo.minOrderValue && (
                                        <span className="text-xs text-gray-500">
                                          Đơn tối thiểu:{" "}
                                          {promo.minOrderValue.toLocaleString()}
                                          đ
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-green-600">
                                      -{discountAmount.toLocaleString()}đ
                                    </p>
                                    {promo.discountType === "percentage" && (
                                      <p className="text-xs text-gray-500">
                                        ({promo.discountValue}%)
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Khuyến mãi tốt nhất được hiển thị ở trên cùng
                        </p>
                      </div>
                    )}

                  {/* Payment Method - Only if customer hasn't selected voucher/points */}
                  {!selectedInvoice.customerSelectedVoucher &&
                    selectedInvoice.customerSelectedPoints === 0 && (
                      <div className="mb-6">
                        <h4 className="mb-3">Phương thức thanh toán</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => setPaymentMethod("cash")}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              paymentMethod === "cash"
                                ? "border-[#0056D2] bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-2xl mb-2">💵</div>
                            <p className="text-sm">Tiền mặt</p>
                          </button>
                          <button
                            onClick={() => setPaymentMethod("card")}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              paymentMethod === "card"
                                ? "border-[#0056D2] bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <CreditCard className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Thẻ</p>
                          </button>
                          <button
                            onClick={() => setPaymentMethod("wallet")}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              paymentMethod === "wallet"
                                ? "border-[#0056D2] bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <Wallet className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Ví điện tử</p>
                          </button>
                        </div>
                      </div>
                    )}

                  {paymentMethod === "cash" &&
                    !selectedInvoice.customerSelectedVoucher &&
                    selectedInvoice.customerSelectedPoints === 0 && (
                      <div className="mb-6">
                        <Input
                          label="Tiền khách đưa"
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder="Nhập số tiền"
                        />
                        {cashReceived &&
                          parseFloat(cashReceived) >= finalTotal && (
                            <div className="mt-2 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm text-green-700">
                                Tiền thừa:{" "}
                                {(
                                  parseFloat(cashReceived) - finalTotal
                                ).toLocaleString()}
                                đ
                              </p>
                            </div>
                          )}
                      </div>
                    )}

                  {/* Total */}
                  <div className="border-t pt-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span>
                          {selectedInvoice.subtotal.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">VAT (10%):</span>
                        <span>{selectedInvoice.tax.toLocaleString()}đ</span>
                      </div>
                      {selectedInvoice.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Giảm giá:</span>
                          <span>
                            -{selectedInvoice.discount.toLocaleString()}đ
                          </span>
                        </div>
                      )}
                      {currentDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Giảm giá nhân viên:</span>
                          <span>-{currentDiscount.toLocaleString()}đ</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t">
                        <span>Tổng cộng:</span>
                        <span className="text-2xl text-[#0056D2]">
                          {finalTotal.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      In hóa đơn
                    </Button>
                    <Button onClick={handlePayment}>Xác nhận thanh toán</Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-gray-600">
                    Chọn bàn để xem hóa đơn
                  </h3>
                  <p className="text-gray-500">
                    Chọn một bàn từ danh sách bên trái
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Paid Invoices Tab */}
        <TabsContent value="paid">
          <Card className="p-6">
            <h3 className="mb-4">Hóa đơn đã thanh toán</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Mã HĐ</th>
                    <th className="text-left py-3 px-4">Bàn</th>
                    <th className="text-left py-3 px-4">Thời gian</th>
                    <th className="text-left py-3 px-4">Phương thức</th>
                    <th className="text-right py-3 px-4">Tổng tiền</th>
                    <th className="text-center py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paidInvoices.map((invoice) => {
                    const table = mockTables.find(
                      (t) => t.id === invoice.tableId
                    );
                    return (
                      <tr
                        key={invoice.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{invoice.id}</td>
                        <td className="py-3 px-4">{table?.number}</td>
                        <td className="py-3 px-4">
                          {new Date(
                            invoice.paidAt || invoice.createdAt
                          ).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              invoice.paymentMethod === "online"
                                ? "bg-blue-100 text-blue-700"
                                : invoice.paymentMethod === "card"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {invoice.paymentMethod === "online"
                              ? "Online"
                              : invoice.paymentMethod === "card"
                              ? "Thẻ"
                              : "Tiền mặt"}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 text-[#0056D2]">
                          {invoice.total.toLocaleString()}đ
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setViewInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Xem
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handlePrint}
                            >
                              <Printer className="w-4 h-4 mr-1" />
                              In lại
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Invoice Detail Modal */}
      <Modal
        isOpen={viewInvoice !== null}
        onClose={() => setViewInvoice(null)}
        title="Chi tiết hóa đơn"
        size="lg"
      >
        {viewInvoice && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3>{viewInvoice.id}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(
                    viewInvoice.paidAt || viewInvoice.createdAt
                  ).toLocaleString("vi-VN")}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700">
                Đã thanh toán
              </Badge>
            </div>

            <div>
              <h4 className="mb-3">Danh sách món</h4>
              <div className="space-y-2">
                {viewInvoice.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p>{item.menuItem.name}</p>
                      <p className="text-sm text-gray-600">
                        SL: {item.quantity}
                      </p>
                    </div>
                    <span>
                      {(item.menuItem.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>{viewInvoice.subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (10%):</span>
                  <span>{viewInvoice.tax.toLocaleString()}đ</span>
                </div>
                {viewInvoice.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{viewInvoice.discount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-xl text-[#0056D2]">
                    {viewInvoice.total.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setViewInvoice(null)}
              >
                Đóng
              </Button>
              <Button fullWidth onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                In hóa đơn
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
