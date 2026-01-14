import { useState, useEffect } from "react";
import {
  Clock,
  Check,
  Utensils,
  MessageSquare,
  Eye,
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
import { RatingStars } from "../ui/RatingStars";
import { toast } from "sonner";
import { invoiceApi } from "../../lib/invoiceApi";
import { customerApi } from "../../lib/customerApi";
import { ratingApi } from "../../lib/ratingApi";
import { dishRatingApi } from "../../lib/dishRatingApi";
import { promotionApi } from "../../lib/promotionApi";
import { authService } from "../../lib/authService";
import { Promotion } from "../../types";

export function BillsPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "card" | "cash" | "online" | null
  >(null);
  const [feedback, setFeedback] = useState("");
  const [itemRatings, setItemRatings] = useState<Record<string, { score: number; comment: string }>>({});
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showVoucherSection, setShowVoucherSection] = useState(false);
  const [allBills, setAllBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [customerPoints, setCustomerPoints] = useState(0);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const response = await authService.getCurrentUser();
      const currentUserId = response.data.id || response.data._id;

      if (!currentUserId) {
        toast.error("Không thể xác định người dùng hiện tại");
        setLoading(false);
        return;
      }

      setCustomerId(currentUserId);

      // Fetch customer data to get current points
      try {
        const customerResponse = await customerApi.getById(currentUserId);
        if (customerResponse.success && customerResponse.data) {
          setCustomerPoints(customerResponse.data.points || 0);
        }
      } catch (error) {
        console.error("Error fetching customer points:", error);
        setCustomerPoints(0);
      }

      const invoicesResponse = await invoiceApi.getByCustomerId(currentUserId);

      if (!invoicesResponse.success || !invoicesResponse.data) {
        setAllBills([]);
        setLoading(false);
        return;
      }

      // Fetch invoice_promotions to get voucher details
      let invoicePromotions: any = {};
      try {
        const apiBaseUrl =
          (import.meta as any).env?.VITE_API_URL ||
          "http://localhost:5000/api/v1";
        const ipResponse = await fetch(`${apiBaseUrl}/invoice-promotions`);
        if (ipResponse.ok) {
          const ipResult = await ipResponse.json();
          if (ipResult.success && ipResult.data) {
            // Map invoice_promotions by invoice_id
            ipResult.data.forEach((ip: any) => {
              const invId =
                ip.invoice_id?._id || ip.invoice_id?.id || ip.invoice_id;
              if (invId) {
                invoicePromotions[invId] = {
                  promotionId:
                    ip.promotion_id?._id ||
                    ip.promotion_id?.id ||
                    ip.promotion_id,
                  voucherCode: ip.promotion_id?.promo_code || null,
                  discountAmount: ip.discount_applied || 0,
                };
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching invoice promotions:", error);
      }

      let customerRatings: any = {};
      try {
        const ratingsResponse = await ratingApi.getAll({
          customer_id: currentUserId,
        });
        if (
          ratingsResponse.success &&
          ratingsResponse.data &&
          ratingsResponse.data.length > 0
        ) {
          const ratings = ratingsResponse.data;

          for (const rating of ratings) {
            const invoiceId = rating.invoice_id;
            if (invoiceId) {
              const ratingId = rating._id || rating.id;
              const repliesResponse = await ratingApi.getReplies(ratingId);
              const reply =
                repliesResponse.success &&
                repliesResponse.data &&
                repliesResponse.data.length > 0
                  ? repliesResponse.data[0]
                  : null;

              // Lưu rating chung cho invoice
              if (!customerRatings[invoiceId]) {
                customerRatings[invoiceId] = {
                  description: rating.description,
                  score: rating.score,
                  reply_text: reply?.reply_text,
                  reply_date: reply?.reply_date,
                  itemRatings: {}, // Thêm object để lưu rating từng item
                };

                // Fetch dish ratings for this rating
                try {
                  const dishRatingsResponse = await dishRatingApi.getByRatingId(ratingId);
                  if (dishRatingsResponse.success && dishRatingsResponse.data) {
                    dishRatingsResponse.data.forEach((dishRating: any) => {
                      const dishId = dishRating.dish_id;
                      if (dishId) {
                        customerRatings[invoiceId].itemRatings[dishId] = {
                          score: dishRating.score,
                          comment: dishRating.comment || dishRating.description,
                          dishName: dishRating.dish_id?.name || "Món ăn",
                        };
                      }
                    });
                  }
                } catch (error) {
                  console.error("Error fetching dish ratings:", error);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching ratings/replies:", error);
      }

      const transformedBills = invoicesResponse.data.map((invoice: any) => {
        const invoiceObj = invoice._id ? invoice : invoice;
        const orderItems = invoiceObj.order_id?.items || [];
        const invoiceId = invoiceObj._id || invoiceObj.id;
        const invoiceRating = customerRatings[invoiceId];
        const invoicePromotion = invoicePromotions[invoiceId];

        // Calculate discounts
        const pointsUsed = invoiceObj.points_used || 0;
        const pointsDiscount = pointsUsed * 1;

        // Voucher discount from invoice_promotion or from discount_amount
        const voucherDiscount =
          invoicePromotion?.discountAmount || invoiceObj.discount_amount || 0;
        const voucherCode = invoicePromotion?.voucherCode || null;
        const promotionId = invoicePromotion?.promotionId || null;

        // Total discount is voucher + points
        const totalDiscount = voucherDiscount + pointsDiscount;

        return {
          id: invoiceId,
          date: new Date(invoiceObj.created_at).toISOString().split("T")[0],
          time: new Date(invoiceObj.created_at).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          items: orderItems.map((item: any) => ({
            id: item._id,
            dishId: item.dish_id?._id || item.dish_id?.id || item.dish_id,
            name: item.dish_id?.name || "Món ăn",
            quantity: item.quantity,
            price: item.unit_price,
            status: item.status,
            notes: item.special_instructions,
          })),
          subtotal: invoiceObj.subtotal,
          tax: invoiceObj.tax,
          discount: totalDiscount,
          voucherDiscount: voucherDiscount,
          pointsDiscount: pointsDiscount,
          total: invoiceObj.total_amount,
          status: invoiceObj.payment_status,
          createdAt: invoiceObj.created_at,
          voucherCode: voucherCode,
          voucherUsed: voucherCode,
          promotionId: promotionId,
          pointsUsed: pointsUsed,
          paymentMethod: invoiceObj.payment_method,
          orderId: invoiceObj.order_id?._id,
          invoiceId: invoiceId,

          feedback:
            invoiceObj.payment_status === "paid" && invoiceRating
              ? invoiceRating.description
              : null,
          feedbackReply:
            invoiceObj.payment_status === "paid" && invoiceRating
              ? invoiceRating.reply_text
              : null,
          feedbackReplyDate:
            invoiceObj.payment_status === "paid" && invoiceRating
              ? invoiceRating.reply_date
              : null,
          itemRatings:
            invoiceObj.payment_status === "paid" && invoiceRating
              ? invoiceRating.itemRatings
              : {},
        };
      });

      setAllBills(transformedBills);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      toast.error(error.message || "Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await promotionApi.getAll();
      if (response.success && response.data) {
        setPromotions(response.data);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const handleApplyVoucher = () => {
    const voucher = promotions.find(
      (p) =>
        p.promo_code?.toUpperCase() === voucherCode.toUpperCase() && p.is_active
    );
    if (voucher) {
      // Check if promotion has available uses (unlimited if max_uses = -1)
      if (
        voucher.max_uses !== undefined &&
        voucher.max_uses !== -1 &&
        voucher.current_uses !== undefined &&
        voucher.current_uses >= voucher.max_uses
      ) {
        toast.error("Đã hết lượt sử dụng cho mã khuyến mãi này");
        return;
      }

      const orderTotal = selectedBill.subtotal + selectedBill.tax;
      if (
        voucher.minimum_order_amount &&
        orderTotal < voucher.minimum_order_amount
      ) {
        toast.error(
          `Đơn hàng phải từ ${voucher.minimum_order_amount.toLocaleString()}đ`
        );
        return;
      }

      let voucherDiscount = 0;
      if (voucher.promotion_type === "percentage") {
        voucherDiscount = Math.floor(
          selectedBill.subtotal * (voucher.discount_value / 100)
        );
      } else {
        voucherDiscount = voucher.discount_value;
      }

      setAppliedVoucher(voucher);
      const updatedBills = [...allBills];
      const billIndex = updatedBills.findIndex((b) => b.id === selectedBill.id);

      const totalDiscount =
        voucherDiscount + updatedBills[billIndex].pointsDiscount;

      updatedBills[billIndex] = {
        ...updatedBills[billIndex],
        voucherDiscount: voucherDiscount,
        voucherCode: voucher.promo_code,
        promotionId: voucher._id || voucher.id,
        discount: totalDiscount,
        total:
          updatedBills[billIndex].subtotal -
          totalDiscount +
          updatedBills[billIndex].subtotal * 0.1,
      };
      setAllBills(updatedBills);
      setSelectedBill(updatedBills[billIndex]);
      setShowVoucherModal(false);
      toast.success("Áp dụng voucher thành công!");
    } else {
      toast.error("Mã voucher không hợp lệ hoặc đã hết hạn");
    }
  };

  const handleSelectPromotion = (promo: Promotion) => {
    // Check if promotion has available uses (unlimited if max_uses = -1)
    if (
      promo.max_uses !== undefined &&
      promo.max_uses !== -1 &&
      promo.current_uses !== undefined &&
      promo.current_uses >= promo.max_uses
    ) {
      toast.error("Đã hết lượt sử dụng cho mã khuyến mãi này");
      return;
    }

    const orderTotal = selectedBill.subtotal + selectedBill.tax;
    if (promo.minimum_order_amount && orderTotal < promo.minimum_order_amount) {
      toast.error(
        `Đơn hàng phải từ ${promo.minimum_order_amount.toLocaleString()}đ`
      );
      return;
    }

    let voucherDiscount = 0;
    if (promo.promotion_type === "percentage") {
      voucherDiscount = Math.floor(
        selectedBill.subtotal * (promo.discount_value / 100)
      );
    } else {
      voucherDiscount = promo.discount_value;
    }

    setAppliedVoucher(promo);
    const updatedBills = [...allBills];
    const billIndex = updatedBills.findIndex((b) => b.id === selectedBill.id);

    const totalDiscount =
      voucherDiscount + updatedBills[billIndex].pointsDiscount;

    updatedBills[billIndex] = {
      ...updatedBills[billIndex],
      voucherDiscount: voucherDiscount,
      voucherCode: promo.promo_code,
      promotionId: promo._id || promo.id,
      discount: totalDiscount,
      total:
        updatedBills[billIndex].subtotal -
        totalDiscount +
        updatedBills[billIndex].subtotal * 0.1,
    };
    setAllBills(updatedBills);
    setSelectedBill(updatedBills[billIndex]);
    setVoucherCode(promo.promo_code);
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

    const pointsDiscount = pointsToUse; // 1000 points = 1000đ
    const updatedBills = [...allBills];
    const billIndex = updatedBills.findIndex((b) => b.id === selectedBill.id);

    const totalDiscount =
      updatedBills[billIndex].voucherDiscount + pointsDiscount;

    updatedBills[billIndex] = {
      ...updatedBills[billIndex],
      pointsDiscount: pointsDiscount,
      pointsUsed: pointsToUse,
      discount: totalDiscount,
      total:
        updatedBills[billIndex].subtotal -
        totalDiscount +
        updatedBills[billIndex].subtotal * 0.1,
    };
    setAllBills(updatedBills);
    setSelectedBill(updatedBills[billIndex]);
    toast.success(
      `Đã quy đổi ${pointsToUse} điểm = ${pointsDiscount.toLocaleString()}đ`
    );
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (!selectedBill || !selectedBill.invoiceId) {
      console.error("Selected bill:", selectedBill);
      toast.error("Không tìm thấy thông tin hóa đơn");
      return;
    }

    try {
      const paymentMethodMap: any = {
        wallet: "e-wallet",
        card: "card",
        cash: "cash",
        online: "transfer",
      };

      const mappedPaymentMethod = paymentMethodMap[paymentMethod];

      await invoiceApi.update(selectedBill.invoiceId, {
        payment_method: mappedPaymentMethod,
        points_used: selectedBill.pointsUsed || 0,
      });

      if (paymentMethod === "cash") {
        toast.success(
          "Đã gửi yêu cầu thanh toán! Vui lòng chờ nhân viên xác nhận."
        );
      } else {
        await invoiceApi.markAsPaid(
          selectedBill.invoiceId,
          mappedPaymentMethod,
          selectedBill.promotionId || null,
          selectedBill.pointsUsed || 0
        );

        const updatedBills = allBills.map((bill) =>
          bill.invoiceId === selectedBill.invoiceId
            ? { ...bill, status: "paid", paymentMethod: mappedPaymentMethod }
            : bill
        );
        setAllBills(updatedBills);

        toast.success("Thanh toán thành công!");
      }

      setShowPaymentModal(false);
      setSelectedBill(null);
      setPaymentMethod(null);
      setPointsToUse(0);
      setShowVoucherSection(false);
      setAppliedVoucher(null);
      setVoucherCode("");
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Thanh toán thất bại");
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedback === "") {
      toast.error("Vui lòng nhập nhận xét chung");
      return;
    }

    // Check if at least one item has a rating
    const hasItemRating = Object.values(itemRatings).some(
      (rating) => rating.score > 0
    );
    if (!hasItemRating) {
      toast.error("Vui lòng đánh giá ít nhất một món ăn");
      return;
    }

    if (!customerId) {
      toast.error("Không tìm thấy thông tin khách hàng");
      return;
    }

    if (!selectedBill) {
      toast.error("Không tìm thấy hóa đơn");
      return;
    }

    try {
      const invoiceId = selectedBill._id || selectedBill.id;

      // 1. Submit general feedback for invoice
      const generalRatingResponse = await ratingApi.create({
        customer_id: customerId,
        invoice_id: invoiceId,
        description: feedback,
        score: 5,
      });

      const ratingId = generalRatingResponse.data?.id || generalRatingResponse.data?._id;

      // 2. Submit individual item ratings using dishRatingApi
      for (const item of selectedBill.items) {
        const itemRating = itemRatings[item.id];
        if (itemRating && itemRating.score > 0) {
          // Create dish rating entry with the actual dish_id
          await dishRatingApi.create({
            dish_id: item.dishId,
            rating_id: ratingId,
            score: itemRating.score,
            comment: itemRating.comment,
          });
        }
      }

      toast.success("Cảm ơn bạn đã gửi đánh giá chi tiết!");
      setShowFeedbackModal(false);
      setFeedback("");
      setItemRatings({});

      await fetchInvoices();
      
      // Update selectedBill with the refreshed data
      const updatedBills = await (async () => {
        const response = await authService.getCurrentUser();
        const currentUserId = response.data.id || response.data._id;
        const invoicesResponse = await invoiceApi.getByCustomerId(currentUserId);
        return invoicesResponse.data || [];
      })();
      
      const updatedBill = updatedBills.find((bill: any) => {
        const billId = bill._id || bill.id;
        return billId === selectedBill.invoiceId;
      });
      
      if (updatedBill) {
        const orderItems = updatedBill.order_id?.items || [];
        const invoiceId = updatedBill._id || updatedBill.id;
        
        // Fetch ratings for this invoice
        let customerRatings: any = {};
        try {
          const ratingsResponse = await ratingApi.getAll({
            customer_id: currentUserId,
          });
          if (ratingsResponse.success && ratingsResponse.data) {
            const ratings = ratingsResponse.data;
            for (const rating of ratings) {
              const ratingInvoiceId = rating.invoice_id;
              if (ratingInvoiceId === invoiceId) {
                const ratingId = rating._id || rating.id;
                customerRatings[invoiceId] = {
                  description: rating.description,
                  score: rating.score,
                  itemRatings: {},
                };

                // Fetch dish ratings
                try {
                  const dishRatingsResponse = await dishRatingApi.getByRatingId(ratingId);
                  if (dishRatingsResponse.success && dishRatingsResponse.data) {
                    dishRatingsResponse.data.forEach((dishRating: any) => {
                      const dishId = dishRating.dish_id;
                      if (dishId) {
                        customerRatings[invoiceId].itemRatings[dishId] = {
                          score: dishRating.score,
                          comment: dishRating.comment || dishRating.description,
                          dishName: dishRating.dish_id?.name || "Món ăn",
                        };
                      }
                    });
                  }
                } catch (error) {
                  console.error("Error fetching dish ratings:", error);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching ratings:", error);
        }

        const invoiceRating = customerRatings[invoiceId];
        const newSelectedBill = {
          ...selectedBill,
          feedback: invoiceRating?.description || null,
          itemRatings: invoiceRating?.itemRatings || {},
        };
        setSelectedBill(newSelectedBill);
      }
    } catch (error: any) {
      console.error("Rating error:", error);
      toast.error(error.message || "Gửi đánh giá thất bại");
    }
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#625EE8]"></div>
        </div>
      ) : allBills.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg mb-2">Chưa có hóa đơn nào</h3>
              <p className="text-gray-600">
                Hóa đơn của bạn sẽ hiển thị ở đây sau khi đặt món
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {allBills.map((bill) => (
            <Card
              key={bill.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedBill(bill)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      bill.status === "paid" ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    {bill.status === "paid" ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="mb-1">{bill.id}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {bill.date} {bill.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl mb-1">{bill.total.toLocaleString()}đ</p>
                  <Badge
                    className={
                      bill.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {bill.status === "paid"
                      ? "Đã thanh toán"
                      : "Đang tiến hành"}
                  </Badge>
                </div>
              </div>

              {/* Discount Info */}
              {(bill.voucherUsed || bill.pointsUsed > 0) && (
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
                  {bill.pointsUsed > 0 && (
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

              {/* Manager Reply - NOT IN API SPEC - COMMENTED OUT FOR NOW */}
              {/* {bill.feedbackReply && (
              <div className="mt-3 pt-3 border-t">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-[#625EE8] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-[#625EE8] font-medium mb-1">
                        Phản hồi từ nhà hàng
                      </p>
                      <p className="text-sm text-gray-700">
                        {bill.feedbackReply}
                      </p>
                      {bill.feedbackReplyDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(bill.feedbackReplyDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )} */}
            </Card>
          ))}
        </div>
      )}

      {/* Bill Detail Modal */}
      <Modal
        isOpen={selectedBill !== null}
        onClose={() => {
          setSelectedBill(null);
          setShowVoucherSection(false);
        }}
        title={`Chi tiết hóa đơn - ${selectedBill?.id}`}
        size="lg"
      >
        {selectedBill && (
          <div className="space-y-6">
            {/* Bill Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="text-left">
                <p className="text-sm text-gray-600">Ngày giờ</p>
                <p className="text-lg">
                  {selectedBill.date} {selectedBill.time}
                </p>
              </div>
              <Badge
                className={
                  selectedBill.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }
              >
                {selectedBill.status === "paid"
                  ? "Đã thanh toán"
                  : "Đang tiến hành"}
              </Badge>
            </div>

            {/* Booking Details */}
            {/* {selectedBill.booking && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#625EE8]" />
                  Thông tin đặt bàn
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 pb-3 mb-3 border-b border-blue-200">
                    <p className="text-gray-600 text-xs mb-1">
                      Mã phiếu đặt bàn
                    </p>
                    <p className="font-bold text-xl text-[#625EE8]">
                      {selectedBill.bookingId}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tên khách hàng:</p>
                    <p className="font-medium">
                      {selectedBill.booking.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Số điện thoại:</p>
                    <p className="font-medium">{selectedBill.booking.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Số người:</p>
                    <p className="font-medium">
                      {selectedBill.booking.guests} người
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Giờ đặt:</p>
                    <p className="font-medium">
                      {selectedBill.booking.bookingTime}
                    </p>
                  </div>
                  {selectedBill.booking.notes && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Ghi chú:</p>
                      <p className="font-medium">
                        {selectedBill.booking.notes}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2 pt-2 border-t border-blue-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Tiền cọc đã thanh toán:
                      </span>
                      <span className="font-medium text-[#625EE8]">
                        {selectedBill.booking.depositPaid.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {/* Items List */}
            <div>
              <h4 className="mb-3">Món đã gọi</h4>
              <div className="space-y-3">
                {selectedBill.items.map((item: any) => (
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
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher/Points Section - Only for pending bills */}
            {selectedBill.status === "pending" && (
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowVoucherSection(!showVoucherSection)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#625EE8]" />
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
                        <div className="flex gap-2">
                          {appliedVoucher ? (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setShowVoucherModal(true)}
                              >
                                Đổi voucher
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const updatedBills = [...allBills];
                                  const billIndex = updatedBills.findIndex(
                                    (b) => b.id === selectedBill.id
                                  );
                                  updatedBills[billIndex] = {
                                    ...updatedBills[billIndex],
                                    voucherDiscount: 0,
                                    voucherCode: null,
                                    promotionId: null,
                                    discount:
                                      updatedBills[billIndex].pointsDiscount,
                                    total:
                                      updatedBills[billIndex].subtotal -
                                      updatedBills[billIndex].pointsDiscount +
                                      updatedBills[billIndex].subtotal * 0.1,
                                  };
                                  setAllBills(updatedBills);
                                  setSelectedBill(updatedBills[billIndex]);
                                  setAppliedVoucher(null);
                                  setVoucherCode("");
                                  toast.success("Đã hủy voucher");
                                }}
                              >
                                Hủy
                              </Button>
                            </>
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
                      </div>
                      {appliedVoucher && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">
                              {appliedVoucher.promo_code || voucherCode}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {appliedVoucher.name}
                            </span>
                            <span className="text-green-600">
                              -{selectedBill.voucherDiscount.toLocaleString()}đ
                            </span>
                          </div>
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
                          disabled={selectedBill.pointsUsed > 0}
                        />
                        {selectedBill.pointsUsed > 0 ? (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              const updatedBills = [...allBills];
                              const billIndex = updatedBills.findIndex(
                                (b) => b.id === selectedBill.id
                              );
                              updatedBills[billIndex] = {
                                ...updatedBills[billIndex],
                                pointsDiscount: 0,
                                pointsUsed: 0,
                                discount:
                                  updatedBills[billIndex].voucherDiscount,
                                total:
                                  updatedBills[billIndex].subtotal -
                                  updatedBills[billIndex].voucherDiscount +
                                  updatedBills[billIndex].subtotal * 0.1,
                              };
                              setAllBills(updatedBills);
                              setSelectedBill(updatedBills[billIndex]);
                              setPointsToUse(0);
                              toast.success("Đã hủy sử dụng điểm");
                            }}
                          >
                            Hủy
                          </Button>
                        ) : (
                          <Button onClick={handleUsePoints}>Áp dụng</Button>
                        )}
                      </div>
                      {selectedBill.pointsUsed > 0 && (
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">
                            Đã quy đổi: {selectedBill.pointsUsed} điểm
                          </span>
                          <span className="text-green-600">
                            -{selectedBill.pointsDiscount?.toLocaleString()}đ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bill Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{selectedBill.subtotal.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Thuế VAT (10%):</span>
                <span>{selectedBill.tax.toLocaleString()}đ</span>
              </div>
              {selectedBill.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Tổng giảm giá:</span>
                  <span>-{selectedBill.discount.toLocaleString()}đ</span>
                </div>
              )}
              {selectedBill.voucherDiscount > 0 && (
                <div className="flex justify-between text-sm text-gray-500 ml-4">
                  <span>Từ voucher:</span>
                  <span>-{selectedBill.voucherDiscount.toLocaleString()}đ</span>
                </div>
              )}
              {selectedBill.pointsDiscount > 0 && (
                <div className="flex justify-between text-sm text-gray-500 ml-4">
                  <span>Từ điểm:</span>
                  <span>-{selectedBill.pointsDiscount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between text-xl pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-[#625EE8]">
                  {selectedBill.total.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Actions */}
            {(() => {
              const hasFeedback = !!selectedBill.feedback;
              return (
                <div className="flex gap-3">
                  {selectedBill.status === "pending" ? (
                    <Button fullWidth onClick={() => setShowPaymentModal(true)}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Thanh toán
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant={hasFeedback ? "secondary" : undefined}
                      className={
                        hasFeedback
                          ? "bg-blue-50 text-[#625EE8] border-none"
                          : ""
                      }
                      onClick={() => setShowFeedbackModal(true)}
                    >
                      {hasFeedback ? (
                        <Eye className="w-4 h-4 mr-2 text-[#625EE8]" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      {hasFeedback ? "Xem đánh giá" : "Gửi đánh giá"}
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

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
              {promotions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Không có khuyến mãi nào
                </p>
              ) : (
                promotions
                  .filter((p) => {
                    if (!p.is_active) return false;

                    // Check minimum order amount
                    if (p.minimum_order_amount && selectedBill) {
                      const orderTotal =
                        selectedBill.subtotal + selectedBill.tax;
                      if (orderTotal < p.minimum_order_amount) return false;
                    }

                    // Unlimited promotions (max_uses = -1) are always available
                    if (p.max_uses === -1) return true;
                    // Limited promotions must have uses remaining
                    return (
                      p.max_uses !== undefined &&
                      p.current_uses !== undefined &&
                      p.current_uses < p.max_uses
                    );
                  })
                  .map((promo) => (
                    <div
                      key={promo.id || promo._id}
                      onClick={() => handleSelectPromotion(promo)}
                      className="p-4 border-2 rounded-lg hover:border-[#625EE8] cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4>{promo.name}</h4>
                        <span className="px-3 py-1 bg-[#625EE8] text-white rounded-full text-sm">
                          {promo.promotion_type === "percentage"
                            ? `${promo.discount_value}%`
                            : `${promo.discount_value.toLocaleString()}đ`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Mã: {promo.promo_code}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          HSD:{" "}
                          {new Date(promo.end_date).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {promo.max_uses === -1
                            ? "Không giới hạn"
                            : `Còn ${
                                (promo.max_uses || 0) -
                                (promo.current_uses || 0)
                              } lượt`}
                        </p>
                      </div>
                      {promo.minimum_order_amount > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          Đơn tối thiểu:{" "}
                          {promo.minimum_order_amount.toLocaleString()}đ
                        </p>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentMethod(null);
        }}
        title="Thanh toán hóa đơn"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="text-2xl text-[#625EE8]">
                {selectedBill?.total.toLocaleString()}đ
              </span>
            </div>
          </div>

          <div>
            <label className="block mb-3">Chọn phương thức thanh toán:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "cash"
                    ? "border-[#625EE8] bg-blue-50"
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
                    ? "border-[#625EE8] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-6 h-6 text-[#625EE8] mb-2" />
                <p className="mb-1">Ví điện tử</p>
                <p className="text-xs text-gray-600">MoMo, ZaloPay</p>
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "card"
                    ? "border-[#625EE8] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-6 h-6 text-[#625EE8] mb-2" />
                <p className="mb-1">Thẻ ngân hàng</p>
                <p className="text-xs text-gray-600">ATM, Visa, Master</p>
              </button>
              <button
                onClick={() => setPaymentMethod("online")}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === "online"
                    ? "border-[#625EE8] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">🌐</div>
                <p className="mb-1">Chuyển khoản</p>
                <p className="text-xs text-gray-600">QR Banking</p>
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
          {selectedBill?.feedback ? (
            <>
              <div>
                <label className="block mb-2">Nhận xét chung</label>
                <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">
                  {selectedBill.feedback}
                </div>
              </div>

              {/* Hiển thị đánh giá từng item */}
              {selectedBill.itemRatings && Object.keys(selectedBill.itemRatings).length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Đánh giá từng món ăn</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedBill.itemRatings).map(
                      ([itemId, itemRating]: [string, any]) => (
                        <div
                          key={itemId}
                          className="p-4 border rounded-lg bg-gray-50"
                        >
                          {/* Item Name */}
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-sm">
                              {itemRating.dishName}
                            </h5>
                            <span className="text-sm font-medium text-yellow-600">
                              {itemRating.score}/5
                            </span>
                          </div>

                          {/* Stars Display */}
                          <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= itemRating.score
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Comment */}
                          {itemRating.comment && (
                            <p className="text-sm text-gray-700 p-3 bg-white rounded border border-gray-200">
                              {itemRating.comment}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedBill.feedbackReply && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-[#625EE8] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-[#625EE8] font-medium mb-1">
                        Phản hồi từ nhà hàng
                      </p>
                      <p className="text-sm text-gray-700">
                        {selectedBill.feedbackReply}
                      </p>
                      {selectedBill.feedbackReplyDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            selectedBill.feedbackReplyDate
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Bỏ qua
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Overall Feedback */}
              <div>
                <label className="block mb-2 font-medium">
                  Nhận xét chung về trải nghiệm
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về nhà hàng, dịch vụ..."
                  rows={3}
                />
              </div>

              {/* Individual Item Ratings */}
              {selectedBill && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">
                  Đánh giá từng món ăn (tối thiểu 1 món)
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedBill.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      {/* Item Name and Stars */}
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-sm">
                              {item.name}
                            </h5>
                            <p className="text-xs text-gray-500">
                              x{item.quantity}
                            </p>
                          </div>
                          <span className="text-sm text-gray-600">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </span>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-2 my-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  setItemRatings({
                                    ...itemRatings,
                                    [item.id]: {
                                      score: star,
                                      comment:
                                        itemRatings[item.id]?.comment || "",
                                    },
                                  })
                                }
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    star <=
                                    (itemRatings[item.id]?.score || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {itemRatings[item.id]?.score > 0 && (
                            <span className="text-sm font-medium text-yellow-600">
                              {itemRatings[item.id]?.score}/5
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      {itemRatings[item.id]?.score > 0 && (
                        <Textarea
                          value={itemRatings[item.id]?.comment || ""}
                          onChange={(e) =>
                            setItemRatings({
                              ...itemRatings,
                              [item.id]: {
                                score: itemRatings[item.id].score,
                                comment: e.target.value,
                              },
                            })
                          }
                          placeholder="Chia sẻ chi tiết về món này (tùy chọn)..."
                          rows={2}
                          className="text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 border-t pt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedback("");
                    setItemRatings({});
                  }}
                >
                  Bỏ qua
                </Button>
                <Button fullWidth onClick={handleSubmitFeedback}>
                  <Star className="w-4 h-4 mr-2" />
                  Gửi đánh giá
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
