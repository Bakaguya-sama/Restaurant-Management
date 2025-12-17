import React, { useState } from "react";
import { Plus, Minus, Utensils, X } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Badge } from "../../ui/badge";
import { mockMenuItems } from "../../../lib/mockData";
import { MenuItem } from "../../../types";
import { toast } from "sonner";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { mockTables } from "../../../lib/mockData";

interface OrderItem {
  item: MenuItem;
  quantity: number;
  notes: string;
  status: "pending" | "cooking" | "served";
}

export function OrderingPage() {
  const [selectedTable, setSelectedTable] = useState("T02");
  const [ordersByTable, setOrdersByTable] = useState<
    Record<string, OrderItem[]>
  >({
    T02: [
      {
        item: mockMenuItems[0],
        quantity: 2,
        notes: "Không hành",
        status: "cooking",
      },
      {
        item: mockMenuItems[1],
        quantity: 1,
        notes: "",
        status: "served",
      },
    ],
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<OrderItem | null>(
    null
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmCancelText, setConfirmCancelText] = useState("Hủy");
  const [confirmVariant, setConfirmVariant] = useState<
    "info" | "warning" | "danger"
  >("info");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isProcessingInvoice, setIsProcessingInvoice] = useState(false);

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống"];
  const quickNotes = ["Ít đá", "Không cay", "Không hành", "Ít dầu", "Thêm rau"];

  // Available tables for waiter - only show occupied tables
  const availableTables = mockTables.filter(
    (table) => table.status === "occupied"
  );

  const filteredItems = mockMenuItems.filter((item) => {
    if (!item.available) return false;
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  // Get current table orders
  const tableOrders = ordersByTable[selectedTable] || [];

  const handleAddToOrder = (item: MenuItem) => {
    const currentOrders = ordersByTable[selectedTable] || [];
    const existing = currentOrders.find(
      (o) => o.item.id === item.id && !o.notes
    );

    if (existing) {
      setOrdersByTable({
        ...ordersByTable,
        [selectedTable]: currentOrders.map((o) =>
          o.item.id === item.id && !o.notes
            ? { ...o, quantity: o.quantity + 1 }
            : o
        ),
      });
    } else {
      setOrdersByTable({
        ...ordersByTable,
        [selectedTable]: [
          ...currentOrders,
          { item, quantity: 1, notes: "", status: "pending" },
        ],
      });
    }
    toast.success(`Đã thêm ${item.name}`);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const currentOrders = [...(ordersByTable[selectedTable] || [])];
    currentOrders[index].quantity += delta;
    if (currentOrders[index].quantity <= 0) {
      currentOrders.splice(index, 1);
      toast.success("Đã xóa món");
    }
    setOrdersByTable({
      ...ordersByTable,
      [selectedTable]: currentOrders,
    });
  };

  const handleCustomize = (orderItem: OrderItem, index: number) => {
    setCustomizingItem({ ...orderItem, notes: orderItem.notes || "" });
    setShowCustomizeModal(true);
  };

  const handleSaveCustomization = () => {
    if (!customizingItem) return;

    const currentOrders = ordersByTable[selectedTable] || [];
    const index = currentOrders.findIndex(
      (o) =>
        o.item.id === customizingItem.item.id &&
        o.notes === (customizingItem.notes || "")
    );

    if (index >= 0) {
      const newOrder = [...currentOrders];
      newOrder[index] = customizingItem;
      setOrdersByTable({
        ...ordersByTable,
        [selectedTable]: newOrder,
      });
    }

    setShowCustomizeModal(false);
    setCustomizingItem(null);
    toast.success("Đã lưu tùy chỉnh");
  };

  const handleUpdateStatus = (
    index: number,
    newStatus: "pending" | "cooking" | "served"
  ) => {
    const currentOrders = [...(ordersByTable[selectedTable] || [])];
    currentOrders[index].status = newStatus;
    setOrdersByTable({
      ...ordersByTable,
      [selectedTable]: currentOrders,
    });
    toast.success(`Đã cập nhật trạng thái: ${getStatusText(newStatus)}`);
  };

  const handleOrderComplete = async () => {
    setIsProcessingInvoice(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/invoices', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authToken}`,
      //   },
      //   body: JSON.stringify({
      //     tableNumber: selectedTable,
      //     items: tableOrders.map(o => ({
      //       dishId: o.item.id,
      //       quantity: o.quantity,
      //       notes: o.notes,
      //       price: o.item.price
      //     })),
      //     totalAmount: tableOrders.reduce((sum, o) => sum + o.item.price * o.quantity, 0),
      //     timestamp: new Date().toISOString()
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to create invoice');
      // }

      // const invoiceData = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Only clear order if API call succeeds
      setOrdersByTable({
        ...ordersByTable,
        [selectedTable]: [],
      });

      // TODO: Update table status to 'available' or keep as 'occupied' depending on business logic
      // await updateTableStatus(selectedTable, 'available');

      // TODO: Log order history for tracking
      // await logOrderHistory({
      //   tableNumber: selectedTable,
      //   orders: tableOrders,
      //   completedAt: new Date().toISOString(),
      //   invoiceId: invoiceData.id
      // });

      toast.success("Đã tạo hóa đơn và gửi cho thu ngân!");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Không thể tạo hóa đơn. Vui lòng thử lại!");
    } finally {
      setIsProcessingInvoice(false);
    }
  };

  const handleConfirmInvoice = () => {
    setConfirmTitle("Xác nhận tạo hóa đơn");
    setConfirmMessage(
      `Bạn có chắc muốn tạo hóa đơn cho bàn ${selectedTable}?\nTổng: ${tableOrders
        .reduce((sum, o) => sum + o.item.price * o.quantity, 0)
        .toLocaleString()}đ`
    );
    setConfirmText("Xác nhận");
    setConfirmCancelText("Hủy");
    setConfirmVariant("info");
    setPendingAction(() => handleOrderComplete);
    setShowConfirmModal(true);
  };

  const handleRemoveItem = (index: number) => {
    const currentOrders = ordersByTable[selectedTable] || [];
    const item = currentOrders[index];

    setConfirmTitle(`Xác nhận hủy món`);
    setConfirmMessage(`Bạn có chắc hủy món này?`);
    setConfirmText("Xác nhận");
    setConfirmCancelText("Hủy");
    setConfirmVariant(`warning`);
    setPendingAction(() => () => {
      const newOrders = [...currentOrders];
      newOrders.splice(index, 1);
      setOrdersByTable({
        ...ordersByTable,
        [selectedTable]: newOrders,
      });
      toast.success("Đã hủy món");
    });
    setShowConfirmModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cooking":
        return "bg-orange-100 text-orange-700";
      case "served":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "cooking":
        return "Đang nấu";
      case "served":
        return "Đã phục vụ";
      default:
        return "Không rõ";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          if (pendingAction) {
            pendingAction();
          }
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText={confirmCancelText}
        variant={confirmVariant}
      />
      {/* Left: Menu Selection */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="mb-4">Chọn bàn</h3>
            {/* Table Selection Grid - Prominent Display */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6 p-4 bg-white rounded-lg border-2 border-[#625EE8]">
              {availableTables.map((table) => {
                const hasOrders = ordersByTable[table.number]?.length > 0;
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.number)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTable === table.number
                        ? "bg-[#625EE8] text-white border-[#625EE8] shadow-lg scale-105"
                        : hasOrders
                        ? "bg-green-50 text-green-700 border-green-400 hover:border-green-500 hover:bg-green-100"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#625EE8] hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-center">
                      <Utensils className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-sm">{table.number}</span>
                      {hasOrders && (
                        <span className="block text-xs mt-1">
                          ({ordersByTable[table.number].length} món)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-[#625EE8]">
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
                <p className="text-[#625EE8]">{item.price.toLocaleString()}đ</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div>
        <Card className="p-4">
          <h3 className="mb-4">Đơn hàng - Bàn {selectedTable}</h3>
          {tableOrders.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chưa có món nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto">
                {tableOrders.map((orderItem, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm mb-1">{orderItem.item.name}</h4>
                        {orderItem.notes && (
                          <p className="text-xs text-gray-600 mb-1">
                            Ghi chú: {orderItem.notes}
                          </p>
                        )}
                        <Badge className={getStatusColor(orderItem.status)}>
                          {getStatusText(orderItem.status)}
                        </Badge>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hủy món"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 border rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(index, -1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {orderItem.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, 1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm text-[#625EE8] font-medium">
                        {(
                          orderItem.item.price * orderItem.quantity
                        ).toLocaleString()}
                        đ
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCustomize(orderItem, index)}
                      >
                        Tùy chỉnh
                      </Button>

                      {/* Status update dropdown */}
                      <select
                        value={orderItem.status}
                        onChange={(e) =>
                          handleUpdateStatus(index, e.target.value as any)
                        }
                        className="px-2 py-1 text-sm border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="cooking">Đang nấu</option>
                        <option value="served">Đã phục vụ</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng cộng:</span>
                  <span className="text-xl text-[#625EE8] font-bold">
                    {tableOrders
                      .reduce((sum, o) => sum + o.item.price * o.quantity, 0)
                      .toLocaleString()}
                    đ
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Tổng món:{" "}
                  {tableOrders.reduce((sum, o) => sum + o.quantity, 0)}
                </div>

                {/* Confirm Invoice Button */}
                <Button
                  fullWidth
                  className="mt-4"
                  disabled={
                    tableOrders.length === 0 ||
                    !tableOrders.every((o) => o.status === "served") ||
                    isProcessingInvoice
                  }
                  onClick={handleConfirmInvoice}
                >
                  {isProcessingInvoice ? "Đang xử lý..." : "Xác nhận hóa đơn"}
                </Button>
                {tableOrders.length > 0 &&
                  !tableOrders.every((o) => o.status === "served") && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      Tất cả món phải ở trạng thái "Đã phục vụ" để xác nhận hóa
                      đơn
                    </p>
                  )}
              </div>
            </>
          )}
        </Card>
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
    </div>
  );
}
