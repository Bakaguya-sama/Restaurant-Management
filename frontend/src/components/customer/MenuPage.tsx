import { useState, useEffect } from "react";
import { Search, MessageCircle, ChevronRight } from "lucide-react";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Dish } from "../../types";
import { useMenuDishes } from "../../hooks/useMenuDishes";
import { buildImageUrl } from "../../lib/uploadApi";
import { useImageLoader } from "../../hooks/useImageLoader";
import { dishRatingApi, DishRating } from "../../lib/dishRatingApi";

const PLACEHOLDER_IMAGE = "/placeholder_images/placeholder_dish_image.jpg";

function DishCard({
  item,
  onSelect,
}: {
  item: Dish;
  onSelect: (dish: Dish) => void;
}) {
  const displayImage = useImageLoader(item.image_url || "", PLACEHOLDER_IMAGE);

  return (
    <Card
      hover
      onClick={() => item.is_available && onSelect(item)}
      className={`overflow-hidden ${!item.is_available ? "opacity-60" : ""}`}
    >
      <div className="relative">
        <img
          src={displayImage}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white px-4 py-2 bg-red-500 rounded-lg">
              Tạm hết
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="mb-2">{item.name}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description || "Món ăn ngon tuyệt vời"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[#625EE8]">{item.price.toLocaleString()}đ</span>
        </div>
      </div>
    </Card>
  );
}

export function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [dishComments, setDishComments] = useState<DishRating[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống"];

  const { items } = useMenuDishes(searchQuery, selectedCategory);

  const filteredItems = items;

  // Always call useImageLoader, even if selectedDish is null
  const displayImage = useImageLoader(
    selectedDish?.image_url || "",
    PLACEHOLDER_IMAGE
  );

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2>Thực đơn</h2>
        <p className="text-gray-600 mt-1">
          Khám phá món ăn phong phú và hấp dẫn
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8">
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm món ăn..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#625EE8] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat === "all" ? "Tất cả" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <DishCard key={item.id} item={item} onSelect={setSelectedDish} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy món ăn phù hợp</p>
        </div>
      )}

      {/* Dish Detail Modal */}
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
                src={displayImage}
                alt={selectedDish.name}
                className="w-full h-96 object-cover rounded-lg"
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
                        <div className="flex items-start gap-2 mb-1">
                          <div className="flex gap-1 text-[#fbbf24]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-sm">
                                {star <= comment.score ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(comment.created_at || comment.rating_date || "").toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
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
                  Hãy đến hoặc đặt bàn trước để thưởng thức nhé! 👋
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
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-1 text-[#fbbf24]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-lg">
                        {star <= comment.score ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at || comment.rating_date || "").toLocaleDateString("vi-VN")}
                  </span>
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
