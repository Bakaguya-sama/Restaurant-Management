import React, { useState } from "react";
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
import {
  mockRewards,
  mockPromotions,
  mockPointHistory,
  mockVoucherHistory,
} from "../../lib/mockData";
import { toast } from "sonner";
import { copyToClipboard } from "../../lib/clipboard";
import { PromotionCard } from "./PromotionCard";

export function MembershipPage() {
  const [activeTab, setActiveTab] = useState<
    "rewards" | "promotions" | "history"
  >("rewards");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPointsRedemption, setShowPointsRedemption] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const memberData = {
    name: "Nguyễn Văn An",
    tier: "gold",
    points: 1500,
    nextTierPoints: 2000,
    totalSpent: 15000000,
  };

  const tierConfig = {
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Ưu đãi & Thành viên</h2>
        <p className="text-gray-600 mt-1">
          Nhận phần thưởng và tận hưởng ưu đãi đặc biệt
        </p>
      </div>

      {/* Membership Card */}
      <Card
        className={`mb-8 bg-gradient-to-r ${currentTier.color} text-white overflow-hidden`}
      >
        <div className="p-8 relative">
          <div className="absolute top-0 right-0 text-9xl opacity-10">
            {currentTier.icon}
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/80 mb-1">Thành viên</p>
                <h2 className="text-white">{memberData.name}</h2>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <Award className="w-8 h-8" />
                  <span className="text-2xl">{currentTier.name}</span>
                </div>
                <p className="text-white/80 text-sm">Hạng thành viên</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5" />
                  <span className="text-2xl">{memberData.points}</span>
                </div>
                <p className="text-white/80 text-sm">Điểm tích lũy</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl">
                    {memberData.totalSpent.toLocaleString()}đ
                  </span>
                </div>
                <p className="text-white/80 text-sm">Tổng chi tiêu</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5" />
                  <span className="text-2xl">{mockRewards.length}</span>
                </div>
                <p className="text-white/80 text-sm">Quà có thể đổi</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/80">
                  Tiến độ lên hạng tiếp theo
                </span>
                <span className="text-white">
                  {memberData.points}/{memberData.nextTierPoints} điểm
                </span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/80 text-sm mt-2">
                Còn {memberData.nextTierPoints - memberData.points} điểm nữa để
                lên hạng Platinum
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
              ? "bg-[#0056D2] text-white"
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
              ? "bg-[#0056D2] text-white"
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
              ? "bg-[#0056D2] text-white"
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

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#0056D2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              <h3 className="mb-2">Quy đổi điểm</h3>
              <p className="text-gray-600">
                Bạn có{" "}
                <span className="text-[#0056D2]">
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
                  <span className="text-[#0056D2]">1.000đ</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 Lưu ý: Số điểm tối thiểu để quy đổi là 1000 điểm. Bạn sẽ áp
                  dụng điểm khi thanh toán hóa đơn.
                </p>
              </div>
            </div>
          </Card>
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
          <div className="space-y-4">
            {mockPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                variant="list"
              />
            ))}
          </div>

          {/* Member Benefits */}
          <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <h4 className="mb-4">Đặc quyền thành viên {currentTier.name}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="mb-1">Tích điểm x1.5</p>
                  <p className="text-sm text-gray-600">
                    Nhận 1.5 điểm cho mỗi 10.000đ chi tiêu
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="mb-1">Quà sinh nhật</p>
                  <p className="text-sm text-gray-600">
                    Voucher 200.000đ vào tháng sinh nhật
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="mb-1">Ưu tiên đặt bàn</p>
                  <p className="text-sm text-gray-600">
                    Được ưu tiên trong giờ cao điểm
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="mb-1">Voucher độc quyền</p>
                  <p className="text-sm text-gray-600">
                    Nhận ưu đãi đặc biệt mỗi tháng
                  </p>
                </div>
              </div>
            </div>
          </Card>
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
              Lịch sử điểm
            </h4>
            <div className="space-y-3">
              {mockPointHistory.map((history) => (
                <Card key={history.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            history.type === "earned"
                              ? "bg-green-100 text-green-700"
                              : history.type === "redeemed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {history.type === "earned"
                            ? "Tích điểm"
                            : history.type === "redeemed"
                            ? "Quy đổi"
                            : "Hết hạn"}
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
                    <div
                      className={`text-lg ${
                        history.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {history.amount > 0 ? "+" : ""}
                      {history.amount.toLocaleString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Voucher History */}
          <div>
            <h4 className="mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#0056D2]" />
              Lịch sử sử dụng voucher
            </h4>
            <div className="space-y-3">
              {mockVoucherHistory.length > 0 ? (
                mockVoucherHistory.map((history) => (
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
                        -{history.discountAmount.toLocaleString()}đ
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#0056D2]"
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
