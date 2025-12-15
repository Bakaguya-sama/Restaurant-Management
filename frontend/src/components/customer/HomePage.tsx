import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { mockMenuItems, mockPromotions } from "../../lib/mockData";
import { MenuItem } from "../../types";
import { PromotionCard } from "./PromotionCard";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // Get first 3 available dishes
  const featuredDishes = mockMenuItems
    .filter((item) => item.available)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
        <img
          src="https://images.unsplash.com/photo-1651209315802-12190ccfee26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwdGFibGUlMjBkaW5pbmd8ZW58MXx8fHwxNzY1MzgzODU5fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Restaurant dining"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="text-white px-12 max-w-2xl">
            <h1 className="text-white mb-4">Trải nghiệm ẩm thực tuyệt vời</h1>
            <p className="text-white/90 text-lg mb-6">
              Đặt bàn ngay hôm nay và nhận ưu đãi đặc biệt dành cho thành viên
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => navigate("/customer/booking")}>
                Đặt bàn ngay
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/customer/menu")}
              >
                Xem thực đơn
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card
          hover
          onClick={() => navigate("/customer/booking")}
          className="p-6 text-center cursor-pointer"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-[#625EE8]" />
          </div>
          <h4 className="mb-2">Đặt bàn</h4>
          <p className="text-sm text-gray-600">Đặt chỗ trước dễ dàng</p>
        </Card>

        <Card
          hover
          onClick={() => navigate("/customer/menu")}
          className="p-6 text-center cursor-pointer"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="w-6 h-6 text-[#625EE8]" />
          </div>
          <h4 className="mb-2">Thực đơn</h4>
          <p className="text-sm text-gray-600">Khám phá món ăn</p>
        </Card>

        <Card
          hover
          onClick={() => navigate("/customer/membership")}
          className="p-6 text-center cursor-pointer"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <h4 className="mb-2">Ưu đãi</h4>
          <p className="text-sm text-gray-600">Nhận voucher hấp dẫn</p>
        </Card>

        <Card
          hover
          onClick={() => navigate("/customer/bills")}
          className="p-6 text-center cursor-pointer"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <h4 className="mb-2">Hóa đơn</h4>
          <p className="text-sm text-gray-600">Theo dõi chi tiêu</p>
        </Card>
      </div> */}

      {/* Featured Dishes */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2>Món ăn nổi bật</h2>
          <Button variant="ghost" onClick={() => navigate("/customer/menu")}>
            Xem tất cả
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDishes.map((item) => (
            <Card key={item.id} hover className="overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="mb-2">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#625EE8]">
                    {item.price.toLocaleString()}đ
                  </span>
                  <Button size="sm" onClick={() => setSelectedDish(item)}>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Promotions */}
      <div>
        <h2 className="mb-6">Khuyến mãi đang diễn ra</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockPromotions
            .filter(
              (p) =>
                p.promotionQuantity === undefined || p.promotionQuantity > 0
            )
            .map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
        </div>
      </div>

      {/* Dish Detail Modal */}
      <Modal
        isOpen={selectedDish !== null}
        onClose={() => setSelectedDish(null)}
        title={selectedDish?.name || ""}
        size="xl"
      >
        {selectedDish && (
          <div className="space-y-6">
            {/* Ảnh ở trên */}
            <div>
              <img
                src={
                  selectedDish.image ||
                  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=800"
                }
                alt={selectedDish.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Thông tin ở dưới */}
            <div className="space-y-4">
              <p className="text-gray-600 text-lg">
                {selectedDish.description}
              </p>

              {selectedDish.ingredients &&
                selectedDish.ingredients.length > 0 && (
                  <div>
                    <p className="font-medium text-lg mb-3">Thành phần:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDish.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-gray-100 rounded-full text-sm"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600 text-lg">Giá:</span>
                <span className="text-3xl text-[#625EE8] font-medium">
                  {selectedDish.price.toLocaleString()}đ
                </span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-gray-700 italic text-base">
                  Hãy đến hoặc đặt bàn trước để thưởng thức nhé! 👋
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
