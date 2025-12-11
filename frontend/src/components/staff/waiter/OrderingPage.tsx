import React, { useState } from "react";
import { Plus, Minus, Send, Clock, Check, Utensils, X } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { mockMenuItems } from "../../../lib/mockData";
import { MenuItem } from "../../../types";
import { toast } from "sonner";

interface OrderItem {
  item: MenuItem;
  quantity: number;
  notes: string;
  status?: "pending" | "sent" | "cooking" | "served";
}

export function OrderingPage() {
  const [selectedTable, setSelectedTable] = useState("T02");
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [sentOrders, setSentOrders] = useState<OrderItem[]>([
    {
      item: mockMenuItems[0],
      quantity: 2,
      notes: "Không hành",
      status: "cooking",
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<OrderItem | null>(
    null
  );
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<OrderItem | null>(null);

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống"];
  const quickNotes = ["Ít đá", "Không cay", "Không hành", "Ít dầu", "Thêm rau"];

  // Available tables for waiter
  const availableTables = [
    "T01",
    "T02",
    "T03",
    "T04",
    "T05",
    "T06",
    "T07",
    "T08",
  ];

  const filteredItems = mockMenuItems.filter((item) => {
    if (!item.available) return false;
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const handleAddToOrder = (item: MenuItem) => {
    const existing = currentOrder.find(
      (o) => o.item.id === item.id && !o.notes
    );
    if (existing) {
      setCurrentOrder(
        currentOrder.map((o) =>
          o.item.id === item.id && !o.notes
            ? { ...o, quantity: o.quantity + 1 }
            : o
        )
      );
    } else {
      setCurrentOrder([...currentOrder, { item, quantity: 1, notes: "" }]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const newOrder = [...currentOrder];
    newOrder[index].quantity += delta;
    if (newOrder[index].quantity <= 0) {
      newOrder.splice(index, 1);
    }
    setCurrentOrder(newOrder);
  };

  const handleCustomize = (orderItem: OrderItem, index: number) => {
    setCustomizingItem({ ...orderItem, notes: orderItem.notes || "" });
    setShowCustomizeModal(true);
  };

  const handleSaveCustomization = () => {
    if (!customizingItem) return;

    const index = currentOrder.findIndex(
      (o) =>
        o.item.id === customizingItem.item.id &&
        o.notes === (customizingItem.notes || "")
    );

    if (index >= 0) {
      const newOrder = [...currentOrder];
      newOrder[index] = customizingItem;
      setCurrentOrder(newOrder);
    }

    setShowCustomizeModal(false);
    setCustomizingItem(null);
  };

  const handleSendOrder = () => {
    if (currentOrder.length === 0) {
      toast.error("Chưa có món nào được chọn");
      return;
    }

    const ordersToSend = currentOrder.map((o) => ({
      ...o,
      status: "sent" as const,
    }));
    setSentOrders([...sentOrders, ...ordersToSend]);
    setCurrentOrder([]);
    toast.success(`Đã gửi ${ordersToSend.length} món cho bếp`);
  };

  const handleChangeItem = (item: OrderItem) => {
    setUpdatingItem(item);
    setShowUpdateModal(true);
  };

  const handleReturnItem = (item: OrderItem) => {
    const reason = prompt("Lý do trả món:");
    if (reason) {
      setSentOrders(sentOrders.filter((o) => o !== item));
      toast.success("Đã gửi yêu cầu trả món");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "cooking":
        return "bg-orange-100 text-orange-700";
      case "served":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "sent":
        return "Đã gửi";
      case "cooking":
        return "Đang nấu";
      case "served":
        return "Đã phục vụ";
      default:
        return "Chờ gửi";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Menu Selection */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="mb-4">Chọn bàn</h3>
            {/* Table Selection Grid - Prominent Display */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6 p-4 bg-white rounded-lg border-2 border-[#0056D2]">
              {availableTables.map((tableNum) => (
                <button
                  key={tableNum}
                  onClick={() => setSelectedTable(tableNum)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTable === tableNum
                      ? "bg-[#0056D2] text-white border-[#0056D2] shadow-lg scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#0056D2] hover:bg-blue-50"
                  }`}
                >
                  <div className="text-center">
                    <Utensils className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">{tableNum}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-[#0056D2]">
                <span>Đang gọi món cho: </span>
                <span className="text-lg">Bàn {selectedTable}</span>
              </p>
            </div>
          </div>

          {/* Category Filter */}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              hover
              onClick={() => handleAddToOrder(item)}
              className="cursor-pointer overflow-hidden"
            >
              <img
                src={
                  item.image ||
                  "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=300"
                }
                alt={item.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h4 className="text-sm mb-1">{item.name}</h4>
                <p className="text-[#0056D2]">{item.price.toLocaleString()}đ</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div>
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">
              Đang chọn ({currentOrder.length})
            </TabsTrigger>
            <TabsTrigger value="sent">Đã gửi ({sentOrders.length})</TabsTrigger>
          </TabsList>

          {/* Current Order Tab */}
          <TabsContent value="current">
            <Card className="p-4">
              {currentOrder.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Chưa có món nào</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {currentOrder.map((orderItem, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg"
                        onClick={() => handleCustomize(orderItem, index)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm mb-1">
                              {orderItem.item.name}
                            </h4>
                            {orderItem.notes && (
                              <p className="text-xs text-gray-600">
                                Ghi chú: {orderItem.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateQuantity(index, -orderItem.quantity);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border rounded-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(index, -1);
                              }}
                              className="p-1 hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm">
                              {orderItem.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(index, 1);
                              }}
                              className="p-1 hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-sm text-[#0056D2]">
                            {(
                              orderItem.item.price * orderItem.quantity
                            ).toLocaleString()}
                            đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between">
                      <span>Tổng:</span>
                      <span className="text-xl text-[#0056D2]">
                        {currentOrder
                          .reduce(
                            (sum, o) => sum + o.item.price * o.quantity,
                            0
                          )
                          .toLocaleString()}
                        đ
                      </span>
                    </div>
                  </div>

                  <Button fullWidth onClick={handleSendOrder}>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi bếp
                  </Button>
                </>
              )}
            </Card>
          </TabsContent>

          {/* Sent Orders Tab */}
          <TabsContent value="sent">
            <Card className="p-4">
              {sentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Chưa gửi món nào</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sentOrders.map((orderItem, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm mb-1">
                            {orderItem.item.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            SL: {orderItem.quantity}
                          </p>
                          {orderItem.notes && (
                            <p className="text-xs text-gray-600">
                              Ghi chú: {orderItem.notes}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(orderItem.status)}>
                          {getStatusText(orderItem.status)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          onClick={() => handleChangeItem(orderItem)}
                        >
                          Đổi món
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          onClick={() => handleReturnItem(orderItem)}
                        >
                          Trả món
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Customize Modal */}
      <Modal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        title="Tùy chỉnh món ăn"
      >
        {customizingItem && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2">{customizingItem.item.name}</h4>
              <p className="text-gray-600">
                {customizingItem.item.price.toLocaleString()}đ
              </p>
            </div>

            <div>
              <label className="block mb-2">Số lượng:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setCustomizingItem({
                      ...customizingItem,
                      quantity: Math.max(1, customizingItem.quantity - 1),
                    })
                  }
                  className="p-2 border rounded-lg hover:bg-gray-100"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center text-xl">
                  {customizingItem.quantity}
                </span>
                <button
                  onClick={() =>
                    setCustomizingItem({
                      ...customizingItem,
                      quantity: customizingItem.quantity + 1,
                    })
                  }
                  className="p-2 border rounded-lg hover:bg-gray-100"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2">Ghi chú nhanh:</label>
              <div className="flex flex-wrap gap-2">
                {quickNotes.map((note) => (
                  <button
                    key={note}
                    onClick={() => {
                      const current = customizingItem.notes || "";
                      const newNotes = current ? `${current}, ${note}` : note;
                      setCustomizingItem({
                        ...customizingItem,
                        notes: newNotes,
                      });
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2">Ghi chú khác:</label>
              <textarea
                value={customizingItem.notes}
                onChange={(e) =>
                  setCustomizingItem({
                    ...customizingItem,
                    notes: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Nhập ghi chú..."
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowCustomizeModal(false)}
              >
                Hủy
              </Button>
              <Button fullWidth onClick={handleSaveCustomization}>
                Lưu
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Order Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Cập nhật món"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Chọn hành động cho món: {updatingItem?.item.name}
          </p>
          <div className="space-y-2">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                setShowUpdateModal(false);
                toast.success("Đã gửi yêu cầu đổi món");
              }}
            >
              Đổi sang món khác
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                const reason = prompt("Lý do trả món lỗi:");
                if (reason) {
                  setShowUpdateModal(false);
                  toast.success("Đã gửi yêu cầu trả món");
                }
              }}
            >
              Trả món lỗi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
