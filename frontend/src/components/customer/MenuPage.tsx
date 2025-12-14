import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { mockMenuItems } from "../../lib/mockData";
import { MenuItem } from "../../types";

export function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống"];

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <Card
            key={item.id}
            hover
            onClick={() => item.available && setSelectedDish(item)}
            className={`overflow-hidden ${!item.available ? "opacity-60" : ""}`}
          >
            <div className="relative">
              <img
                src={
                  item.image ||
                  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400"
                }
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              {!item.available && (
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
                <span className="text-[#625EE8]">
                  {item.price.toLocaleString()}đ
                </span>
              </div>
            </div>
          </Card>
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
