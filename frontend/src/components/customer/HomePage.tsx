import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { RatingStars } from "../ui/RatingStars";
import { Dish } from "../../types";
import { useNavigate } from "react-router-dom";
import { fetchTopDishes } from "../../lib/menuPageApi";
import { useImageLoader } from "../../hooks/useImageLoader";
import { buildImageUrl } from "../../lib/uploadApi";
import { dishRatingApi, DishRating } from "../../lib/dishRatingApi";
import { MessageCircle, ChevronRight } from "lucide-react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400";

export function HomePage() {
  const navigate = useNavigate();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [dishComments, setDishComments] = useState<DishRating[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  // imageUrls removed — do not call hooks inside loops or effects

  // Hook to get selected dish image (called unconditionally to obey hooks rules)
  const selectedDishImage = useImageLoader(
    selectedDish?.image_url || "",
    PLACEHOLDER_IMAGE
  );

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

  // Fetch comments for selected dish
  useEffect(() => {
    if (!selectedDish?.id) {
      setDishComments([]);
      return;
    }

    async function loadDishComments() {
      try {
        setLoadingComments(true);
        const response = await dishRatingApi.getByDishId(selectedDish.id!);
        
        if (response.success && response.data) {
          // Sort by most recent first
          const comments = response.data.sort(
            (a, b) =>
              new Date(b.created_at || b.rating_date || "").getTime() -
              new Date(a.created_at || a.rating_date || "").getTime()
          );
          
          setDishComments(comments);
        }
      } catch (error) {
        console.error("Error loading dish comments:", error);
        setDishComments([]);
      } finally {
        setLoadingComments(false);
      }
    }

    loadDishComments();
  }, [selectedDish?.id]);

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
                  src={
                    item.image_url
                      ? buildImageUrl(item.image_url)
                      : PLACEHOLDER_IMAGE
                  }
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
        onClose={() => {
          setSelectedDish(null);
          setShowAllComments(false);
        }}
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

              {/* Rating Stars */}
              <div className="pt-3 border-t">
                <RatingStars 
                  rating={selectedDish.average_rating || 4.5} 
                  totalReviews={selectedDish.total_reviews || 0}
                  size="md"
                  showCount={true}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600 text-lg">Giá:</span>
                <span className="text-3xl text-[#625EE8] font-medium">
                  {selectedDish.price.toLocaleString()}đ
                </span>
              </div>

              {/* Comments Section */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle size={18} className="text-[#625EE8]" />
                  <h4 className="font-semibold text-gray-800">
                    Bình luận từ khách hàng
                  </h4>
                </div>

                {loadingComments ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>Đang tải bình luận...</p>
                  </div>
                ) : dishComments.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>Chưa có bình luận nào</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {dishComments.slice(0, 5).map((comment) => (
                      <div
                        key={comment.id || comment._id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex gap-1 text-[#fbbf24]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-sm">
                                {star <= comment.score ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                          {comment.Customer?.full_name && (
                            <span className="text-xs text-gray-600 ml-auto">
                              {comment.Customer.full_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {comment.description || comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {dishComments.length > 5 && (
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="flex items-center gap-2 text-[#625EE8] hover:text-[#5149d4] font-medium text-sm w-full justify-center py-2 border border-[#625EE8] rounded-lg hover:bg-blue-50 transition"
                  >
                    Xem tất cả {dishComments.length} bình luận
                    <ChevronRight size={16} />
                  </button>
                )}
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

      {/* All Comments Modal */}
      <Modal
        isOpen={showAllComments}
        onClose={() => setShowAllComments(false)}
        title={`Tất cả bình luận - ${selectedDish?.name || ""}`}
        size="lg"
      >
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {dishComments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Không có bình luận nào</p>
            </div>
          ) : (
            dishComments.map((comment) => (
              <div
                key={comment.id || comment._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex gap-1 text-[#fbbf24] mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-lg">
                      {star <= comment.score ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <p className="text-gray-800 leading-relaxed">
                  {comment.description || comment.comment}
                </p>
                {comment.Customer?.full_name && (
                  <p className="text-xs text-gray-500 mt-2">
                    - {comment.Customer.full_name}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
