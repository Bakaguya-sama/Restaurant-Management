import React, { useState, useEffect } from "react";
import {
  Award,
  Star,
  Gift,
  TrendingUp,
  Ticket,
  Copy,
  Check,
  History,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { toast } from "sonner";
import { copyToClipboard } from "../../lib/clipboard";
import { PromotionCard } from "./PromotionCard";
import { useAuth } from "../../contexts/AuthContext";

export function MembershipPage() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "rewards" | "promotions" | "history"
  >("rewards");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPointsRedemption, setShowPointsRedemption] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [voucherHistory, setVoucherHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [currentCustomerData, setCurrentCustomerData] = useState<any>(null);

  // ⭐ Dùng customer từ userProfile (đã đăng nhập)
  const currentCustomer = currentCustomerData || userProfile;

  // ⭐ Refetch customer data để có total_spent mới nhất
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!userProfile) {
        setIsLoading(false);
        toast.error("Vui lòng đăng nhập để xem thông tin thành viên");
        return;
      }

      try {
        const apiBaseUrl =
          (import.meta as any).env?.VITE_API_URL ||
          "http://localhost:5000/api/v1";
        
        const customerId = userProfile._id || userProfile.id;
        const response = await fetch(`${apiBaseUrl}/customers/${customerId}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setCurrentCustomerData(result.data);
            console.log("Refreshed customer data:", result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [userProfile]);

  // Fetch promotions từ API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoadingPromotions(true);
        const apiBaseUrl =
          (import.meta as any).env?.VITE_API_URL ||
          "http://localhost:5000/api/v1";

        const response = await fetch(`${apiBaseUrl}/promotions`);

        if (!response.ok) {
          throw new Error("Không thể tải danh sách khuyến mãi");
        }

        const result = await response.json();
        if (result.success && result.data) {
          // Tạm thời hiển thị tất cả promotions để debug
          console.log("All promotions from API:", result.data);
          setPromotions(result.data);
        }
      } catch (error: any) {
        console.error("Error fetching promotions:", error);
        toast.error(error.message || "Không thể tải danh sách khuyến mãi");
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    fetchPromotions();
  }, []);

  // Fetch voucher history (invoices with promotions)
  useEffect(() => {
    const fetchVoucherHistory = async () => {
      if (!currentCustomer) return;

      try {
        setIsLoadingHistory(true);
        const apiBaseUrl =
          (import.meta as any).env?.VITE_API_URL ||
          "http://localhost:5000/api/v1";

        // Fetch tất cả invoices
        const invoicesResponse = await fetch(`${apiBaseUrl}/invoices`);
        if (!invoicesResponse.ok) throw new Error("Không thể tải hóa đơn");

        const invoicesResult = await invoicesResponse.json();

        if (invoicesResult.success && invoicesResult.data) {
          // ⭐ Lọc invoices của customer hiện tại
          const customerId = currentCustomer._id || currentCustomer.id;
          console.log("Filtering invoices for customer ID:", customerId);
          
          const customerInvoices = invoicesResult.data.filter((inv: any) => {
            // Check both populated object and string ID
            const invoiceCustomerId = inv.customer_id?._id || inv.customer_id?.id || inv.customer_id;
            return invoiceCustomerId === customerId || 
                   invoiceCustomerId?.toString() === customerId?.toString();
          });
          
          console.log(`Found ${customerInvoices.length} invoices for customer`);

          // Fetch invoice_promotions cho mỗi invoice
          // ⭐ Fetch voucher history từ invoice_promotions (approach tốt hơn)
          try {
            const ipResponse = await fetch(
              `${apiBaseUrl}/invoice-promotions`
            );
            
            if (ipResponse.ok) {
              const ipResult = await ipResponse.json();
              
              if (ipResult.success && ipResult.data && ipResult.data.length > 0) {
                // Filter invoice_promotions của customer hiện tại
                const customerVouchers = ipResult.data
                  .filter((ip: any) => {
                    // Check nếu invoice_id được populate và có customer_id
                    if (!ip.invoice_id) return false;
                    
                    const invoiceCustomerId = 
                      ip.invoice_id.customer_id?._id?.toString() ||
                      ip.invoice_id.customer_id?.toString();
                    
                    const currentCustomerId =
                      currentCustomer?._id?.toString() ||
                      currentCustomer?.id?.toString();
                    
                    return invoiceCustomerId === currentCustomerId;
                  })
                  .map((ip: any) => ({
                    id: ip._id,
                    invoiceId: ip.invoice_id?.invoice_number || "N/A",
                    voucherCode: ip.promotion_id?.promo_code || "N/A",
                    voucherName: ip.promotion_id?.name || "Khuyến mãi",
                    promoType: ip.promotion_id?.promotion_type || "fixed_amount",
                    promoValue: ip.promotion_id?.discount_value ?? ip.discount_applied ?? 0,
                    discountAmount: ip.discount_applied || 0,
                    usedAt: ip.invoice_id?.paid_at || ip.invoice_id?.invoice_date || ip.createdAt,
                  }))
                  .sort((a: any, b: any) => 
                    new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
                  );
                
                setVoucherHistory(customerVouchers);
                console.log("Voucher history loaded:", customerVouchers);
              } else {
                setVoucherHistory([]);
              }
            }
          } catch (err) {
            console.error("Error loading voucher history:", err);
            setVoucherHistory([]);
          }

          // ⭐ TẠO POINT HISTORY từ invoices đã thanh toán
          const pointHistoryData = customerInvoices
            .filter((inv: any) => inv.payment_status === 'paid')
            .map((inv: any) => {
              // Tính điểm tích lũy: 10đ = 1 điểm (total_amount / 10)
              const points = Math.floor((inv.total_amount || 0) / 10);
              return {
                id: inv._id || inv.id,
                type: 'earned',
                amount: points,
                description: `Tích điểm từ hóa đơn ${inv.invoice_number}`,
                invoiceId: inv.invoice_number,
                date: inv.paid_at || inv.invoice_date || inv.created_at
              };
            })
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setPointHistory(pointHistoryData);
          console.log("Point history loaded:", pointHistoryData);
        }
      } catch (error: any) {
        console.error("Error fetching voucher history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchVoucherHistory();
  }, [currentCustomer]);

  // Tính toán next tier points dựa trên membership level
  const getNextTierPoints = (level: string) => {
    const tierMap: Record<string, number> = {
      bronze: 1000,
      silver: 2000,
      gold: 5000,
      platinum: 10000,
      diamond: 0, // Max tier
    };
    return tierMap[level] || 1000;
  };

  const memberData = {
    name:
      currentCustomer?.full_name ||
      currentCustomer?.name ||
      userProfile?.name ||
      "Khách hàng",
    tier: currentCustomer?.membership_level || "bronze",
    points: currentCustomer?.points || 0,
    nextTierPoints: getNextTierPoints(
      currentCustomer?.membership_level || "bronze"
    ),
    totalSpent: currentCustomer?.total_spent || 0,
  };

  const tierConfig = {
    diamond: {
      name: "Kim cương",
      color: "from-cyan-400 to-cyan-600",
      icon: "💎",
    },
    platinum: {
      name: "Bạch kim",
      color: "from-slate-300 to-slate-500",
      icon: "⚪",
    },
    gold: { name: "Vàng", color: "from-yellow-400 to-yellow-600", icon: "👑" },
    silver: { name: "Bạc", color: "from-gray-300 to-gray-500", icon: "🥈" },
    bronze: { name: "Đồng", color: "from-amber-600 to-amber-800", icon: "🥉" },
  };

  const currentTier = tierConfig[memberData.tier as keyof typeof tierConfig];
  const progress = (memberData.points / memberData.nextTierPoints) * 100;

  const handleCopyCode = async (code: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      toast.success(
        "Đã sao chép mã! Bạn có thể sử dụng mã này khi thanh toán."
      );
      setTimeout(() => setCopiedCode(null), 3000);
    } else {
      toast.error("Không thể sao chép mã. Vui lòng thử lại.");
    }
  };

  const handleConvertPoints = () => {
    if (pointsToRedeem < 1000) {
      toast.error("Số điểm tối thiểu để quy đổi là 1000 điểm");
      return;
    }
    if (pointsToRedeem > memberData.points) {
      toast.error("Số điểm không đủ!");
      return;
    }

    toast.success(
      `Đã chuẩn bị quy đổi ${pointsToRedeem} điểm = ${pointsToRedeem.toLocaleString()}đ. Áp dụng khi thanh toán!`
    );
    setShowPointsRedemption(false);
    setPointsToRedeem(0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#625EE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin thành viên...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - no customer data
  if (!currentCustomer) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Không tìm thấy thông tin thành viên
            </p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Ưu đãi & Thành viên</h2>
        <p className="text-gray-600 mt-1">
          Nhận phần thưởng và tận hưởng ưu đãi đặc biệt
        </p>
      </div>

      {/* Membership Card */}
      <Card className="mb-8 bg-white border-2 border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Thành viên</p>
              <h3 className="text-xl font-semibold text-gray-800">
                {memberData.name}
              </h3>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${currentTier.color}`}
            >
              <Award className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">
                {currentTier.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Điểm tích lũy</span>
              </div>
              <p className="text-2xl font-semibold text-blue-600">
                {memberData.points}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Tổng chi tiêu</span>
              </div>
              <p className="text-2xl font-semibold text-green-600">
                {(memberData.totalSpent / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("rewards")}
          className={`flex-1 py-3 rounded-lg transition-all ${
            activeTab === "rewards"
              ? "bg-[#625EE8] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Gift className="w-5 h-5 inline mr-2" />
          Đổi điểm
        </button>
        <button
          onClick={() => setActiveTab("promotions")}
          className={`flex-1 py-3 rounded-lg transition-all ${
            activeTab === "promotions"
              ? "bg-[#625EE8] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Ticket className="w-5 h-5 inline mr-2" />
          Khuyến mãi
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 rounded-lg transition-all ${
            activeTab === "history"
              ? "bg-[#625EE8] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <History className="w-5 h-5 inline mr-2" />
          Lịch sử
        </button>
      </div>

      {/* Rewards Tab - Points Redemption Only */}
      {activeTab === "rewards" && (
        <div>
          <div className="mb-6">
            <h3 className="mb-2">Quy đổi điểm thành giảm giá</h3>
            <p className="text-gray-600">
              Sử dụng điểm tích lũy để được giảm giá khi thanh toán (1000 điểm =
              1.000đ)
            </p>
          </div>

          {/* <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#625EE8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              <h3 className="mb-2">Quy đổi điểm</h3>
              <p className="text-gray-600">
                Bạn có{" "}
                <span className="text-[#625EE8]">
                  {memberData.points.toLocaleString()} điểm
                </span>
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">Tỷ lệ quy đổi:</p>
                <div className="flex items-center justify-center gap-4 text-xl">
                  <span className="text-[#F59E0B]">1000 điểm</span>
                  <span>=</span>
                  <span className="text-[#625EE8]">1.000đ</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 Lưu ý: Số điểm tối thiểu để quy đổi là 1000 điểm. Bạn sẽ áp
                  dụng điểm khi thanh toán hóa đơn.
                </p>
              </div>
            </div>
          </Card> */}
        </div>
      )}

      {/* Promotions Tab */}
      {activeTab === "promotions" && (
        <div>
          <div className="mb-6">
            <h3 className="mb-2">Chương trình khuyến mãi</h3>
            <p className="text-gray-600">
              Các ưu đãi và khuyến mãi đang diễn ra dành cho bạn
            </p>
          </div>

          {isLoadingPromotions ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#625EE8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Đang tải khuyến mãi...</p>
              </div>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Hiện tại chưa có chương trình khuyến mãi nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <PromotionCard
                  key={promotion._id || promotion.id}
                  promotion={{
                    id: promotion._id || promotion.id,
                    name: promotion.promotion_name || promotion.title,
                    description: promotion.description || "",
                    code: promotion.promo_code || promotion.code,
                    // prefer `promotion_type` (backend uses this); fallback to discount_type
                    discountType:
                      promotion.promotion_type ||
                      promotion.discount_type ||
                      "fixed_amount",
                    discountValue:
                      promotion.discount_value ?? promotion.discountValue ?? 0,
                    validUntil: promotion.end_date
                      ? new Date(promotion.end_date).toLocaleDateString("vi-VN")
                      : "",
                    minOrderAmount: promotion.minimum_order_amount || promotion.min_order_value || 0,
                    maxDiscountAmount: promotion.max_discount_amount,
                    promotionQuantity: promotion.promotion_quantity,
                    startDate: promotion.start_date,
                    endDate: promotion.end_date,
                    active: promotion.is_active !== false && new Date(promotion.end_date) >= new Date(),
                  }}
                  variant="list"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          <div className="mb-6">
            <h3 className="mb-2">Lịch sử sử dụng điểm và khuyến mãi</h3>
            <p className="text-gray-600">
              Theo dõi chi tiết việc sử dụng điểm tích lũy và voucher
            </p>
          </div>

          {/* Point History */}
          <div className="mb-8">
            <h4 className="mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F59E0B]" />
              Lịch sử tích điểm
            </h4>
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#625EE8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Đang tải lịch sử...</p>
                  </div>
                </div>
              ) : pointHistory.length > 0 ? (
                pointHistory.map((history) => (
                  <Card key={history.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                            Tích điểm
                          </span>
                          {history.invoiceId && (
                            <span className="text-xs text-gray-500">
                              HĐ: {history.invoiceId}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {history.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(history.date).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-lg text-green-600">
                        +{history.amount.toLocaleString()} điểm
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có lịch sử tích điểm</p>
                </Card>
              )}
            </div>
          </div>

          {/* Voucher History */}
          <div>
            <h4 className="mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#625EE8]" />
              Lịch sử sử dụng voucher
            </h4>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-[#625EE8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Đang tải lịch sử...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {voucherHistory.length > 0 ? (
                  voucherHistory.map((history) => (
                    <Card key={history.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                              Đã sử dụng
                            </span>
                            <span className="text-xs text-gray-500">
                              HĐ: {history.invoiceId}
                            </span>
                          </div>
                          <h4 className="mb-1">{history.voucherName}</h4>
                          <p className="text-sm text-gray-600 mb-1">
                            Mã: {history.voucherCode}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(history.usedAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-lg text-green-600">
                          {(() => {
                            const type = String(
                              history.promoType || ""
                            ).toLowerCase();
                            if (
                              type.includes("percent") ||
                              type.includes("percentage")
                            ) {
                              return `-${Number(
                                history.promoValue
                              ).toLocaleString()}%`;
                            }
                            const amount =
                              history.discountAmount || history.promoValue || 0;
                            return `-${Number(amount).toLocaleString()}đ`;
                          })()}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Chưa có lịch sử sử dụng voucher
                    </p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Points Redemption Modal */}
      <Modal
        isOpen={showPointsRedemption}
        onClose={() => setShowPointsRedemption(false)}
        title="Quy đổi điểm thành giảm giá"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              Bạn có <span>{memberData.points.toLocaleString()}</span> điểm
              <br />
              Tỷ lệ: 1000 điểm = 1.000đ
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm">
              Nhập số điểm muốn quy đổi (tối thiểu 1000):
            </label>
            <input
              type="number"
              value={pointsToRedeem || ""}
              onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
              placeholder="Nhập số điểm..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#625EE8]"
              min="1000"
              step="1000"
            />
            {pointsToRedeem >= 1000 && (
              <p className="mt-2 text-sm text-green-600">
                = Giảm giá: {pointsToRedeem.toLocaleString()}đ
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              💡 Điểm sẽ được áp dụng khi bạn thanh toán hóa đơn tiếp theo tại
              mục "Hóa đơn của tôi"
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowPointsRedemption(false)}
            >
              Hủy
            </Button>
            <Button fullWidth onClick={handleConvertPoints}>
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
