import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Dish } from "../../types";
import { useNavigate } from "react-router-dom";
import { fetchTopDishes } from "../../lib/menuPageApi";
import { useImageLoader } from "../../hooks/useImageLoader";
import { buildImageUrl } from "../../lib/uploadApi";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400";

export function HomePage() {
  const navigate = useNavigate();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  // imageUrls removed — do not call hooks inside loops or effects

  // Hook to get selected dish image (called unconditionally to obey hooks rules)
  const selectedDishImage = useImageLoader(selectedDish?.image_url || "", PLACEHOLDER_IMAGE);

  // Load top 3 most ordered dishes
  useEffect(() => {
    async function loadTopDishes() {
      try {
        setLoading(true);
        const dishes = await fetchTopDishes(3);
        setFeaturedDishes(dishes);
      } catch (error) {
        console.error("Error loading top dishes:", error);
        setFeaturedDishes([]);
      } finally {
        setLoading(false);
      }
    }

    loadTopDishes();
  }, []);

  // Do not call hooks inside loops. For list images, use buildImageUrl and rely on onError fallback.

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

      {/* Featured Dishes */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2>Món ăn nổi bật</h2>
          <Button variant="ghost" onClick={() => navigate("/customer/menu")}>
            Xem tất cả
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải món ăn nổi bật...</p>
          </div>
        ) : featuredDishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có món ăn nổi bật</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDishes.map((item, index) => (
              <Card key={item.id} hover className="overflow-hidden">
                <img
                  src={item.image_url ? buildImageUrl(item.image_url) : PLACEHOLDER_IMAGE}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="p-4">
                  <h4 className="mb-2">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {item.description}
                  </p>
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
        )}
      </div>

      {/* Dish Detail Modal */}
      {/* Ensure we call the hook unconditionally at top level for the modal image */}
      {/** Hook call for selectedDish image (always called, even if selectedDish is null) */}
      {
        // call hook once at top-level
      }
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
                src={selectedDishImage}
                alt={selectedDish.name}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.onerror = null;
                  img.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* Thông tin ở dưới */}
            <div className="space-y-4">
              <p className="text-gray-600 text-lg">
                {selectedDish.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600 text-lg">Giá:</span>
                <span className="text-3xl text-[#625EE8] font-medium">
                  {selectedDish.price.toLocaleString()}đ
                </span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-gray-700 italic text-base">
                  Hãy đến hoặc đặt bàn trước để trải nghiệm!
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
