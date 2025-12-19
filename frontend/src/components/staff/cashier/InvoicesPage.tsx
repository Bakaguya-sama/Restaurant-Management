import React, { useState, useEffect } from "react";
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
import { mockInvoices, mockTables } from "../../../lib/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import { toast } from "sonner";
import { invoiceApi, promotionApi } from "../../../lib/api";

export function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "wallet"
  >("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cashierSelectedPromotion, setCashierSelectedPromotion] =
    useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [pendingQuery, setPendingQuery] = useState("");
  const [paidQuery, setPaidQuery] = useState("");

  useEffect(() => {
    fetchInvoices();
    fetchPromotions();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceApi.getAll();
      const transformedData = data.map((invoice: any) => {
        const items =
          invoice.order_id?.items?.map((item: any) => ({
            id: item.id || item._id,
            name: item.dish_id?.name || "Món ăn",
            quantity: item.quantity,
            price: item.unit_price || item.dish_id?.price || 0,
          })) || [];

        return {
          id: invoice.id,
          tableId: invoice.order_id?.table_id || "",
          tableNumber: invoice.order_id?.table?.table_number || "N/A",
          customerId: invoice.customer_id,
          customerName: invoice.customer?.full_name || "Khách hàng",
          items,
          subtotal: invoice.subtotal || 0,
          tax: invoice.tax || 0,
          discount: invoice.discount_amount || 0,
          total: invoice.total_amount || 0,
          status:
            invoice.payment_status === "paid"
              ? "paid"
              : invoice.payment_status === "pending"
              ? "payment-requested"
              : "pending",
          paymentRequested: invoice.payment_status === "pending",
          paymentMethod: invoice.payment_method,
          paidAt: invoice.paid_at,
          createdAt: invoice.invoice_date || invoice.created_at,
          customerSelectedVoucher: false,
          customerSelectedPoints: 0,
          invoiceNumber: invoice.invoice_number,
          orderId: invoice.order_id,
          staffId: invoice.staff_id,
        };
      });
      setInvoices(transformedData);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoadingPromotions(true);
      const data = await promotionApi.getAll({
        is_active: true,
        valid_now: true,
      });
      setPromotions(data);
    } catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
      toast.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoadingPromotions(false);
    }
  };

  const pendingInvoices = invoices.filter(
    (inv) => inv.status === "payment-requested"
  );
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");

  const filteredPending = pendingInvoices.filter((inv) => {
    const q = pendingQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      String(inv.tableNumber).toLowerCase().includes(q) ||
      String(inv.customerName).toLowerCase().includes(q) ||
      String(inv.invoiceNumber || inv.id)
        .toLowerCase()
        .includes(q)
    );
  });

  const filteredPaid = paidInvoices.filter((inv) => {
    const q = paidQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      String(inv.tableNumber).toLowerCase().includes(q) ||
      String(inv.customerName).toLowerCase().includes(q) ||
      String(inv.invoiceNumber || inv.id)
        .toLowerCase()
        .includes(q)
    );
  });

  // Get available promotions for selected invoice
  const getAvailablePromotions = () => {
    if (!selectedInvoice) return [];

    return promotions
      .filter((promo) => {
        // Check if promotion has available quantity
        if (
          promo.max_uses !== undefined &&
          promo.max_uses !== -1 &&
          promo.current_uses !== undefined &&
          promo.current_uses >= promo.max_uses
        ) {
          return false;
        }

        // Check minimum order amount
        if (
          promo.minimum_order_amount &&
          selectedInvoice.subtotal < promo.minimum_order_amount
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Calculate discount value for sorting
        const getDiscountValue = (promo: any) => {
          if (promo.promotion_type === "fixed_amount") {
            return promo.discount_value;
          } else if (promo.promotion_type === "percentage") {
            const discount =
              selectedInvoice.subtotal * (promo.discount_value / 100);
            return discount;
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
      if (cashierSelectedPromotion.promotion_type === "fixed_amount") {
        discount = cashierSelectedPromotion.discount_value;
      } else if (cashierSelectedPromotion.promotion_type === "percentage") {
        discount =
          selectedInvoice.subtotal *
          (cashierSelectedPromotion.discount_value / 100);
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

  const handlePayment = async () => {
    if (!selectedInvoice) return;

    const totalAmount = finalTotal;

    if (
      paymentMethod === "cash" &&
      (!cashReceived || parseFloat(cashReceived) < totalAmount)
    ) {
      toast.error("Số tiền không đủ!");
      return;
    }

    const pointsEarned = Math.floor(totalAmount / 10000) * 10;

    try {
      await invoiceApi.markAsPaid(selectedInvoice.id);
      await fetchInvoices();

      const change =
        paymentMethod === "cash" && cashReceived
          ? parseFloat(cashReceived) - totalAmount
          : 0;

      toast.success(
        <div>
          <p>Thanh toán thành công!</p>
          <p className="text-sm mt-1">
            Hóa đơn: {selectedInvoice.invoiceNumber || selectedInvoice.id}
          </p>
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

      setSelectedInvoice(null);
      setCashReceived("");
      setCashierSelectedPromotion(null);
      setPaymentMethod("cash");

      setTimeout(() => {
        toast.info("Đang in hóa đơn cho khách hàng...");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Không thể thanh toán hóa đơn");
    }
  };

  const handlePrint = () => {
    toast.success("Đang in hóa đơn...");
  };

  return (
    <div>
      <div className="mb-6">
        <h2>Quản lý hóa đơn đã thanh toán</h2>
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
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tables List */}
              <div className="lg:col-span-1">
                <h3 className="mb-4">Bàn cần xử lý</h3>
                <div className="mb-4">
                  <Input
                    placeholder="Tìm theo bàn, khách hoặc mã hóa đơn..."
                    value={pendingQuery}
                    onChange={(e) => setPendingQuery(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-3">
                  {filteredPending.map((invoice) => (
                    <Card
                      key={invoice.id}
                      hover
                      onClick={() => setSelectedInvoice(invoice)}
                      className={`p-4 cursor-pointer ${
                        selectedInvoice?.id === invoice.id
                          ? "ring-2 ring-[#625EE8]"
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
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Yêu cầu thanh toán
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
                            Khách hàng đã yêu cầu thanh toán. Vui lòng xử lý
                            ngay!
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
                                -
                                {selectedInvoice.voucherAmount?.toLocaleString()}
                                đ
                              </span>
                            </div>
                          )}
                        {selectedInvoice.customerSelectedPoints > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 flex items-center gap-1">
                              <Gift className="w-4 h-4" />
                              Điểm: {
                                selectedInvoice.customerSelectedPoints
                              }{" "}
                              điểm
                            </span>
                            <span className="text-green-600">
                              -
                              {selectedInvoice.pointsDiscount?.toLocaleString()}
                              đ
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
                        {selectedInvoice.items.map(
                          (item: any, index: number) => (
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
                          )
                        )}
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
                                  ? "border-[#625EE8] bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <p className="text-sm">
                                Không áp dụng khuyến mãi
                              </p>
                            </button>
                            {availablePromotions.map((promo) => {
                              const discountAmount =
                                promo.promotion_type === "fixed_amount"
                                  ? promo.discount_value
                                  : selectedInvoice.subtotal *
                                    (promo.discount_value / 100);

                              return (
                                <button
                                  key={promo.id}
                                  onClick={() =>
                                    setCashierSelectedPromotion(promo)
                                  }
                                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                    cashierSelectedPromotion?.id === promo.id
                                      ? "border-[#625EE8] bg-blue-50"
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
                                          {promo.promo_code}
                                        </Badge>
                                        {promo.minimum_order_amount && (
                                          <span className="text-xs text-gray-500">
                                            Đơn tối thiểu:{" "}
                                            {promo.minimum_order_amount.toLocaleString()}
                                            đ
                                          </span>
                                        )}
                                        {promo.max_uses !== undefined &&
                                          promo.max_uses !== -1 && (
                                            <span className="text-xs text-gray-500">
                                              • Còn{" "}
                                              {promo.max_uses -
                                                (promo.current_uses || 0)}{" "}
                                              lượt
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-green-600">
                                        -{discountAmount.toLocaleString()}đ
                                      </p>
                                      {promo.promotion_type ===
                                        "percentage" && (
                                        <p className="text-xs text-gray-500">
                                          ({promo.discount_value}%)
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
                                  ? "border-[#625EE8] bg-blue-50"
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
                                  ? "border-[#625EE8] bg-blue-50"
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
                                  ? "border-[#625EE8] bg-blue-50"
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
                          <span className="text-2xl text-[#625EE8]">
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
                      <Button onClick={handlePayment}>
                        Xác nhận thanh toán
                      </Button>
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
          )}
        </TabsContent>

        {/* Paid Invoices Tab */}
        <TabsContent value="paid">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </Card>
          ) : (
            <>
              <div className="mb-4 max-w-[500px]">
                <Input
                  placeholder="Tìm hóa đơn (bàn, khách, mã)..."
                  value={paidQuery}
                  onChange={(e) => setPaidQuery(e.target.value)}
                  className="h-10"
                />
              </div>
              <Card className="p-6">
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
                      {filteredPaid.map((invoice) => {
                        return (
                          <tr
                            key={invoice.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">{invoice.id}</td>
                            <td className="py-3 px-4">{invoice.tableNumber}</td>
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
                            <td className="text-right py-3 px-4 text-[#625EE8]">
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
            </>
          )}
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
                  <span className="text-xl text-[#625EE8]">
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
