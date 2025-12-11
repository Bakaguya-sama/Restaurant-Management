import React, { useState } from "react";
import { Search, ShoppingCart, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { mockMenuItems } from "../../lib/mockData";
import { MenuItem } from "../../types";
import { toast } from "sonner";
import { useCart } from "../../contexts/CartContext";

export function MenuPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const { cart, addToCart, updateQuantity, clearCart, totalItems, totalPrice } =
    useCart();
  const [dishNote, setDishNote] = useState("");
  const [showCart, setShowCart] = useState(false);

  // Mock: Check if customer has an active booking
  // Set to true to test checkout with booking, false to test redirect to booking page
  const hasActiveBooking = true; // TODO: Replace with actual booking check from context/API

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống"];

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: MenuItem, notes: string) => {
    addToCart(item, notes);
    setSelectedDish(null);
    setDishNote("");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    // Check if customer has an active booking
    if (!hasActiveBooking) {
      toast.error("Cần phải đặt bàn");
      navigate("/customer/booking");
      return;
    }

    // Create a new bill/invoice from cart
    toast.success(
      'Đã tạo đơn hàng! Vui lòng kiểm tra trong "Hóa đơn của tôi" để thanh toán.'
    );

    // Clear cart and close modal
    clearCart();
    setShowCart(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2>Thực đơn</h2>
          <p className="text-gray-600 mt-1">
            Khám phá món ăn phong phú và hấp dẫn
          </p>
        </div>
        <Button onClick={() => setShowCart(true)} className="relative">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Giỏ hàng
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
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
                  ? "bg-[#0056D2] text-white"
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
                <span className="text-[#0056D2]">
                  {item.price.toLocaleString()}đ
                </span>
                {item.available && (
                  <Button size="sm" onClick={() => setSelectedDish(item)}>
                    Thêm
                  </Button>
                )}
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
        onClose={() => {
          setSelectedDish(null);
          setDishNote("");
        }}
        size="lg"
      >
        {selectedDish && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={
                  selectedDish.image ||
                  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=600"
                }
                alt={selectedDish.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="mb-4">{selectedDish.name}</h3>
              <p className="text-gray-600 mb-4">{selectedDish.description}</p>

              {selectedDish.ingredients && (
                <div className="mb-4">
                  <p className="mb-2">Thành phần:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDish.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm mb-2">Ghi chú đặc biệt:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["Không cay", "Ít đường", "Không hành", "Mang về"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setDishNote(dishNote ? `${dishNote}, ${tag}` : tag)
                        }
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
                <Input
                  placeholder="Hoặc nhập ghi chú tùy chỉnh..."
                  value={dishNote}
                  onChange={(e) => setDishNote(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-2xl text-[#0056D2]">
                  {selectedDish.price.toLocaleString()}đ
                </span>
                <Button onClick={() => handleAddToCart(selectedDish, dishNote)}>
                  Thêm vào giỏ
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title="Giỏ hàng của bạn"
        size="lg"
      >
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map((cartItem, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={
                      cartItem.item.image ||
                      "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=100"
                    }
                    alt={cartItem.item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="mb-1">{cartItem.item.name}</h4>
                    {cartItem.notes && (
                      <p className="text-sm text-gray-600 mb-2">
                        Ghi chú: {cartItem.notes}
                      </p>
                    )}
                    <p className="text-[#0056D2]">
                      {cartItem.item.price.toLocaleString()}đ
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2 border rounded-lg">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm">
                      {(
                        cartItem.item.price * cartItem.quantity
                      ).toLocaleString()}
                      đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-4">
                <span>Tổng cộng:</span>
                <span className="text-xl text-[#0056D2]">
                  {totalPrice.toLocaleString()}đ
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" onClick={() => setShowCart(false)}>
                  Tiếp tục chọn
                </Button>
                <Button onClick={handleCheckout}>Đặt món & Thanh toán</Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
