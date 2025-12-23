import React, { useState } from "react";
import { Ticket, Calendar, Tag, Copy, Check } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Promotion } from "../../types";
import { copyToClipboard } from "../../lib/clipboard";
import { toast } from "sonner";

interface PromotionCardProps {
  promotion: Promotion;
  variant?: "card" | "list";
}

export function PromotionCard({
  promotion,
  variant = "card",
}: PromotionCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const codeToCopy =
      (promotion as any).code ||
      (promotion as any).promo_code ||
      (promotion as any).promotion_code ||
      promotion.code ||
      "";
    const success = await copyToClipboard(codeToCopy);
    if (success) {
      setCopiedCode(true);
      toast.success("Đã sao chép mã khuyến mãi!");
      setTimeout(() => setCopiedCode(false), 3000);
    } else {
      toast.error("Không thể sao chép mã. Vui lòng thử lại.");
    }
  };

  // Normalize promotion fields (support camelCase and snake_case from API)
  const promoCode =
    (promotion as any).code ||
    (promotion as any).promo_code ||
    (promotion as any).promotion_code ||
    "";
  const promoName =
    (promotion as any).name ||
    (promotion as any).promotion_name ||
    (promotion as any).promoName ||
    "";

  const rawDiscountType =
    (promotion as any).discountType ||
    (promotion as any).discount_type ||
    (promotion as any).promotionType ||
    (promotion as any).promotion_type ||
    (promotion as any).type ||
    "";

  const rawDiscountValue =
    (promotion as any).discountValue ||
    (promotion as any).discount_value ||
    (promotion as any).discountAmount ||
    (promotion as any).discount_amount ||
    (promotion as any).value ||
    0;

  const discountType = String(rawDiscountType).toLowerCase();
  const discountValue = Number(rawDiscountValue) || 0;

  const discountText =
    discountType === "percentage" || discountType === "percent"
      ? `${discountValue}%`
      : `${discountValue.toLocaleString()}đ`;

  const rawMinOrder =
    (promotion as any).minOrderAmount ||
    (promotion as any).min_order_amount ||
    (promotion as any).minOrder ||
    0;
  const minOrderAmount = Number(rawMinOrder) || 0;
  const minOrderText = minOrderAmount
    ? `Đơn tối thiểu: ${minOrderAmount.toLocaleString()}đ`
    : "Không giới hạn đơn hàng";

  const rawMaxDiscount =
    (promotion as any).maxDiscountAmount ||
    (promotion as any).max_discount_amount ||
    0;
  const maxDiscountAmount = Number(rawMaxDiscount) || 0;
  const maxDiscountText = maxDiscountAmount
    ? `Giảm tối đa: ${maxDiscountAmount.toLocaleString()}đ`
    : "";

  const promoStart =
    (promotion as any).startDate ||
    (promotion as any).start_date ||
    (promotion as any).from;
  const promoEnd =
    (promotion as any).endDate ||
    (promotion as any).end_date ||
    (promotion as any).to;

  const promotionQuantity =
    (promotion as any).promotionQuantity ||
    (promotion as any).promotion_quantity ||
    (promotion as any).quantity;

  if (variant === "list") {
    return (
      <>
        <Card className="overflow-hidden">
          <div className="flex">
            <div className="w-32 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
              <div className="text-white text-center">
                <div className="text-3xl mb-1">{discountText}</div>
                <div className="text-xs">GIẢM GIÁ</div>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="mb-2">{promoName || promotion.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      Mã:{" "}
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {promoCode || promotion.code}
                      </span>
                    </p>
                    <p>
                      Thời gian:{" "}
                      {new Date(
                        promoStart || promotion.startDate
                      ).toLocaleDateString("vi-VN")}{" "}
                      -{" "}
                      {new Date(
                        promoEnd || promotion.endDate
                      ).toLocaleDateString("vi-VN")}
                    </p>
                    {promotionQuantity !== undefined && (
                      <p
                        className={
                          promotionQuantity <= 10 ? "text-orange-600" : ""
                        }
                      >
                        Còn {promotionQuantity} lượt sử dụng
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  {promotion.active ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowDetails(true)}
                      >
                        Xem chi tiết
                      </Button>
                      <Button size="sm" onClick={handleCopyCode}>
                        {copiedCode ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy mã
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Đã hết hạn</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Chi tiết khuyến mãi"
        >
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2">{promoName || promotion.name}</h3>
              <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Mã khuyến mãi</p>
                <p className="text-xl text-[#625EE8] font-mono">
                  {promoCode || promotion.code}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Giảm giá</p>
                  <p className="text-lg text-green-600">{discountText}</p>
                  {maxDiscountText && (
                    <p className="text-sm text-gray-500">{maxDiscountText}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Thời gian áp dụng</p>
                  <p>
                    {new Date(
                      promoStart || promotion.startDate
                    ).toLocaleDateString("vi-VN")}{" "}
                    -{" "}
                    {new Date(promoEnd || promotion.endDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Điều kiện</p>
                  <p>{minOrderText}</p>
                  {promotion.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {promotion.description}
                    </p>
                  )}
                  {promotionQuantity !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                      Còn{" "}
                      <span
                        className={
                          promotionQuantity <= 10
                            ? "text-orange-600 font-medium"
                            : "font-medium"
                        }
                      >
                        {promotionQuantity}
                      </span>{" "}
                      lượt sử dụng
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button fullWidth onClick={handleCopyCode}>
                {copiedCode ? "Đã sao chép mã" : "Sao chép mã khuyến mãi"}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Card variant for HomePage
  return (
    <>
      <Card
        hover
        onClick={() => setShowDetails(true)}
        className="p-6 bg-gradient-to-r from-green-400 to-green-600 text-white cursor-pointer"
      >
        <h3 className="text-white mb-2">{promoName || promotion.name}</h3>
        <p className="text-white/90 mb-4">
          {promotion.description || minOrderText}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl">{discountText}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
          >
            Xem chi tiết
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Chi tiết khuyến mãi"
      >
        <div className="space-y-4">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2">{promoName || promotion.name}</h3>
            <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Mã khuyến mãi</p>
              <p className="text-xl text-[#625EE8] font-mono">
                {promoCode || promotion.code}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Giảm giá</p>
                <p className="text-lg text-green-600">{discountText}</p>
                {maxDiscountText && (
                  <p className="text-sm text-gray-500">{maxDiscountText}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Thời gian áp dụng</p>
                <p>
                  {new Date(
                    promoStart || promotion.startDate
                  ).toLocaleDateString("vi-VN")}{" "}
                  -{" "}
                  {new Date(promoEnd || promotion.endDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ticket className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Điều kiện</p>
                <p>{minOrderText}</p>
                {promotion.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {promotion.description}
                  </p>
                )}
                {promotionQuantity !== undefined && (
                  <p className="text-sm text-gray-600 mt-1">
                    Còn{" "}
                    <span
                      className={
                        promotionQuantity <= 10
                          ? "text-orange-600 font-medium"
                          : "font-medium"
                      }
                    >
                      {promotionQuantity}
                    </span>{" "}
                    lượt sử dụng
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button fullWidth onClick={handleCopyCode}>
              {copiedCode ? "Đã sao chép mã" : "Sao chép mã khuyến mãi"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
