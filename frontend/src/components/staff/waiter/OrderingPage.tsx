import { useState } from "react";
import { Plus, Minus, Utensils, X } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Badge } from "../../ui/badge";
import { useOrderingDishes } from "../../../hooks/useOrderingDishes";
import { useTables } from "../../../hooks/useTables";
import { Dish } from "../../../types";
import { toast } from "sonner";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { RiTakeawayLine } from "react-icons/ri";
import { createOrder, generateOrderNumber } from "../../../lib/orderApi";
import { MOCK_STAFF_ID } from "../../../lib/orderingConstants";

interface OrderItem {
  item: Dish;
  quantity: number;
  notes: string;
  status: "pending" | "cooking" | "served";
}

export function OrderingPage() {
  const [orderType, setOrderType] = useState<"table" | "takeaway">("table");
  const [selectedTable, setSelectedTable] = useState("T02");
  const [ordersByTable, setOrdersByTable] = useState<
    Record<string, OrderItem[]>
  >({});

  // Takeaway orders management
  const [takeawayOrders, setTakeawayOrders] = useState<
    Record<string, OrderItem[]>
  >({});
  const [selectedTakeawayOrder, setSelectedTakeawayOrder] = useState("TO-001");
  const [takeawayOrderCounter, setTakeawayOrderCounter] = useState(2);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<OrderItem | null>(
    null
  );
  const [customizingIndex, setCustomizingIndex] = useState<number>(-1);

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

  // Fetch dishes from API
  const { items: filteredItems } = useOrderingDishes(selectedCategory);
  
  // Fetch tables from API - only show occupied tables
  const { tables, loading: isLoadingTables, error: tablesError } = useTables();

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống"];
  const quickNotes = ["Ít đá", "Không cay", "Không hành", "Ít dầu", "Thêm rau"];

  // Get current orders based on order type
  const currentOrders =
    orderType === "table"
      ? ordersByTable[selectedTable] || []
      : takeawayOrders[selectedTakeawayOrder] || [];

  const currentOrderId =
    orderType === "table" ? selectedTable : selectedTakeawayOrder;

  const [addingItem, setAddingItem] = useState<string | null>(null);

  const handleAddToOrder = async (item: Dish) => {
    // Prevent spam clicking
    if (addingItem === item.id) {
      return;
    }

    const orders = orderType === "table" ? ordersByTable : takeawayOrders;
    const setOrders =
      orderType === "table" ? setOrdersByTable : setTakeawayOrders;
    const orderId = currentOrderId;

    const currentOrderList = orders[orderId] || [];
    const existing = currentOrderList.find(
      (o) => o.item.id === item.id && !o.notes
    );

    setAddingItem(item.id);
    try {
      // Just add to local state - no inventory deduction yet
      if (existing) {
        setOrders({
          ...orders,
          [orderId]: currentOrderList.map((o) =>
            o.item.id === item.id && !o.notes
              ? { ...o, quantity: o.quantity + 1 }
              : o
          ),
        });
      } else {
        setOrders({
          ...orders,
          [orderId]: [
            ...currentOrderList,
            { item, quantity: 1, notes: "", status: "pending" },
          ],
        });
      }
      
      toast.success(`Đã thêm ${item.name} (chưa trừ kho)`);
    } catch (error: any) {
      console.error("Error adding item to order:", error);
      toast.error(`Không thể thêm món: ${error.message || "Lỗi không xác định"}`);
    } finally {
      setAddingItem(null);
    }
  };

  const handleUpdateQuantity = async (index: number, delta: number) => {
    const orders = orderType === "table" ? ordersByTable : takeawayOrders;
    const setOrders =
      orderType === "table" ? setOrdersByTable : setTakeawayOrders;
    const orderId = currentOrderId;

    const currentOrderList = [...(orders[orderId] || [])];
    const orderItem = currentOrderList[index];
    const newQuantity = orderItem.quantity + delta;

    if (newQuantity <= 0) {
      currentOrderList.splice(index, 1);
      setOrders({
        ...orders,
        [orderId]: currentOrderList,
      });
      toast.success("Đã xóa món");
      return;
    }

    // Just update quantity locally (no inventory deduction until cooking/served)
    currentOrderList[index].quantity = newQuantity;
    setOrders({
      ...orders,
      [orderId]: currentOrderList,
    });
    
    if (delta > 0) {
      toast.success(`Đã tăng số lượng ${orderItem.item.name}`);
    } else {
      toast.info(`Đã giảm số lượng ${orderItem.item.name}`);
    }
  };

  const handleCustomize = (orderItem: OrderItem, index: number) => {
    setCustomizingItem({ ...orderItem, notes: orderItem.notes || "" });
    setCustomizingIndex(index);
    setShowCustomizeModal(true);
  };

  const handleSaveCustomization = () => {
    if (!customizingItem || customizingIndex < 0) return;

    const orders = orderType === "table" ? ordersByTable : takeawayOrders;
    const setOrders =
      orderType === "table" ? setOrdersByTable : setTakeawayOrders;
    const orderId = currentOrderId;

    const currentOrderList = orders[orderId] || [];
    const newOrder = [...currentOrderList];
    newOrder[customizingIndex] = customizingItem;
    
    setOrders({
      ...orders,
      [orderId]: newOrder,
    });

    setShowCustomizeModal(false);
    setCustomizingItem(null);
    setCustomizingIndex(-1);
    toast.success("Đã lưu tùy chỉnh");
  };

  const handleUpdateStatus = async (
    index: number,
    newStatus: "pending" | "cooking" | "served"
  ) => {
    const orders = orderType === "table" ? ordersByTable : takeawayOrders;
    const setOrders =
      orderType === "table" ? setOrdersByTable : setTakeawayOrders;
    const orderId = currentOrderId;

    const currentOrderList = [...(orders[orderId] || [])];
    const orderItem = currentOrderList[index];
    const oldStatus = orderItem.status;

    // If changing to cooking or served from pending, deduct inventory
    if (
      oldStatus === "pending" &&
      (newStatus === "cooking" || newStatus === "served")
    ) {
      try {
        const tableData = tables.find(t => t.table_number === selectedTable);
        const tableId = tableData?.id;
        
        const orderNumber = generateOrderNumber(
          orderType === "table" ? "dine-in-waiter" : "takeaway-staff"
        );

        const orderParams = {
          order_number: orderNumber,
          order_type: (orderType === "table"
            ? "dine-in-waiter"
            : "takeaway-staff") as "dine-in-waiter" | "takeaway-staff",
          order_time: new Date().toTimeString().split(" ")[0],
          table_id: orderType === "table" ? tableId : undefined,
          staff_id: MOCK_STAFF_ID,
          notes: orderItem.notes || "", // Save individual item notes
          orderItems: [
            {
              dish_id: orderItem.item.id,
              quantity: orderItem.quantity,
            },
          ],
        };

        await createOrder(orderParams);

        // Update status after successful inventory deduction
        currentOrderList[index].status = newStatus;
        setOrders({
          ...orders,
          [orderId]: currentOrderList,
        });
        toast.success(
          `Đã cập nhật: ${getStatusText(newStatus)} và trừ nguyên liệu`
        );
      } catch (error: any) {
        console.error("Error deducting inventory:", error);

        if (
          error.message === "INSUFFICIENT_INVENTORY" &&
          error.insufficientItems
        ) {
          const itemsList = error.insufficientItems
            .map(
              (i: any) =>
                `${i.ingredientName}: cần ${i.required}${i.unit}, còn ${i.available}${i.unit}`
            )
            .join("\n");
          toast.error(`Không đủ nguyên liệu:\n${itemsList}`);
        } else {
          toast.error(
            `Không thể trừ kho: ${error.message || "Lỗi không xác định"}`
          );
        }
        // Don't update status if inventory deduction failed
        return;
      }
    } else {
      // Just update status without inventory deduction
      currentOrderList[index].status = newStatus;
      setOrders({
        ...orders,
        [orderId]: currentOrderList,
      });
      toast.success(`Đã cập nhật trạng thái: ${getStatusText(newStatus)}`);
    }
  };

  const handleOrderComplete = async () => {
    setIsProcessingInvoice(true);

    try {
      const orders = orderType === "table" ? ordersByTable : takeawayOrders;
      const setOrders =
        orderType === "table" ? setOrdersByTable : setTakeawayOrders;
      const orderId = currentOrderId;

      // Calculate total amount
      const totalAmount = currentOrders.reduce(
        (sum, o) => sum + o.item.price * o.quantity,
        0
      );

      // Get table info
      const tableData = tables.find(t => t.table_number === selectedTable);
      const tableId = tableData?.id;

      // Step 1: Create order in database first
      const orderNumber = generateOrderNumber(
        orderType === "table" ? "dine-in-waiter" : "takeaway-staff"
      );

      // Combine all item notes into order notes
      const itemNotes = currentOrders
        .filter(o => o.notes && o.notes.trim())
        .map(o => `${o.item.name} (x${o.quantity}): ${o.notes}`)
        .join("\n");
      
      const baseNotes = orderType === "takeaway" ? `Đơn mang về ${selectedTakeawayOrder}` : "";
      const combinedNotes = itemNotes ? (baseNotes ? `${baseNotes}\n\n${itemNotes}` : itemNotes) : baseNotes;

      const orderData = {
        order_number: orderNumber,
        order_type: orderType === "table" ? "dine-in-waiter" : "takeaway-staff",
        order_time: new Date().toTimeString().split(" ")[0],
        table_id: orderType === "table" ? tableId : undefined,
        staff_id: MOCK_STAFF_ID,
        status: "completed",
        notes: combinedNotes,
      };

      const orderResponse = await fetch(
        `${(import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.message || "Failed to create order");
      }

      const orderResult = await orderResponse.json();
      const createdOrder = orderResult.data;

      // Step 2: Create invoice with order_id
      // Note: payment_method is temporary default - cashier will update it during payment
      const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        order_id: createdOrder._id || createdOrder.id,
        subtotal: totalAmount,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: totalAmount,
        payment_method: "cash", // Temporary default - will be updated by cashier
        payment_status: "pending",
        table_id: orderType === "table" ? tableId : undefined,
        staff_id: MOCK_STAFF_ID,
        invoice_time: new Date().toISOString(),
        notes: orderType === "takeaway" ? `Đơn mang về ${selectedTakeawayOrder}` : `Bàn ${selectedTable}`,
      };

      const response = await fetch(
        `${(import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create invoice");
      }

      const result = await response.json();

      // Clear orders immediately after successful invoice creation
      setOrders({
        ...orders,
        [orderId]: [],
      });

      toast.success(
        `Đã tạo hóa đơn ${result.data?.invoice_number || ""} và gửi cho thu ngân!`
      );
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(
        `Không thể tạo hóa đơn: ${error.message || "Vui lòng thử lại!"}`
      );
    } finally {
      setIsProcessingInvoice(false);
    }
  };

  const handleConfirmInvoice = () => {
    const orderLabel =
      orderType === "table"
        ? `bàn ${selectedTable}`
        : `đơn ${selectedTakeawayOrder}`;
    setConfirmTitle("Xác nhận tạo hóa đơn");
    setConfirmMessage(
      `Bạn có chắc muốn tạo hóa đơn cho ${orderLabel}?\nTổng: ${currentOrders
        .reduce((sum, o) => sum + o.item.price * o.quantity, 0)
        .toLocaleString()}đ`
    );
    setConfirmText("Xác nhận");
    setConfirmCancelText("Hủy");
    setConfirmVariant("info");
    setPendingAction(() => handleOrderComplete);
    setShowConfirmModal(true);
  };

  const handleAddTakeawayOrder = () => {
    const newOrderId = `TO-${String(takeawayOrderCounter).padStart(3, "0")}`;
    setTakeawayOrders({
      ...takeawayOrders,
      [newOrderId]: [],
    });
    setSelectedTakeawayOrder(newOrderId);
    setTakeawayOrderCounter(takeawayOrderCounter + 1);
    toast.success(`Đã tạo đơn mang về ${newOrderId}`);
  };

  const handleRemoveItem = (index: number) => {
    const orders = orderType === "table" ? ordersByTable : takeawayOrders;
    const setOrders =
      orderType === "table" ? setOrdersByTable : setTakeawayOrders;
    const orderId = currentOrderId;
    const currentOrderList = orders[orderId] || [];
    const item = currentOrderList[index];

    setConfirmTitle(`Xác nhận hủy món`);
    setConfirmMessage(`Bạn có chắc hủy món này?`);
    setConfirmText("Xác nhận");
    setConfirmCancelText("Hủy");
    setConfirmVariant(`warning`);
    setPendingAction(() => () => {
      const newOrders = [...currentOrderList];
      newOrders.splice(index, 1);
      setOrders({
        ...orders,
        [orderId]: newOrders,
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
            {/* Order Type Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setOrderType("table")}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  orderType === "table"
                    ? "bg-[#625EE8] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <Utensils className="w-5 h-5 inline-block mr-2" />
                Gọi món bàn
              </button>
              <button
                onClick={() => setOrderType("takeaway")}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  orderType === "takeaway"
                    ? "bg-[#625EE8] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <RiTakeawayLine className="w-5 h-5 inline-block mr-2" />
                Đơn mang về
              </button>
            </div>

            {orderType === "table" ? (
              <>
                <h3 className="mb-4">Chọn bàn</h3>
                {/* Table Selection Grid - Prominent Display */}
                {isLoadingTables ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Đang tải danh sách bàn...</p>
                  </div>
                ) : tablesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Lỗi: {tablesError}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6 p-4 bg-white rounded-lg border-2 border-[#625EE8]">
                    {tables.map((table) => {
                      const hasOrders = ordersByTable[table.table_number]?.length > 0;
                      return (
                        <button
                          key={table.id}
                          onClick={() => setSelectedTable(table.table_number)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedTable === table.table_number
                              ? "bg-[#625EE8] text-white border-[#625EE8] shadow-lg scale-105"
                              : hasOrders
                              ? "bg-green-50 text-green-700 border-green-400 hover:border-green-500 hover:bg-green-100"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#625EE8] hover:bg-blue-50"
                          }`}
                        >
                          <div className="text-center">
                            <Utensils className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm">{table.table_number}</span>
                            {hasOrders && (
                              <span className="block text-xs mt-1">
                                ({ordersByTable[table.table_number].length} món)
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-[#625EE8]">
                    <span>Đang gọi món cho: </span>
                    <span className="text-lg">Bàn {selectedTable}</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3>Chọn đơn mang về</h3>
                  <Button onClick={handleAddTakeawayOrder} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm đơn
                  </Button>
                </div>

                {/* Takeaway Orders Grid */}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6 p-4 bg-white rounded-lg border-2 border-[#625EE8]">
                  {Object.keys(takeawayOrders).map((orderId) => {
                    const hasOrders = takeawayOrders[orderId]?.length > 0;
                    return (
                      <button
                        key={orderId}
                        onClick={() => setSelectedTakeawayOrder(orderId)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedTakeawayOrder === orderId
                            ? "bg-[#625EE8] text-white border-[#625EE8] shadow-lg scale-105"
                            : hasOrders
                            ? "bg-green-50 text-green-700 border-green-400 hover:border-green-500 hover:bg-green-100"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#625EE8] hover:bg-blue-50"
                        }`}
                      >
                        <div className="text-center">
                          <RiTakeawayLine className="w-6 h-6 mx-auto mb-1" />
                          <span className="text-xs">{orderId}</span>
                          {hasOrders && (
                            <span className="block text-xs mt-1">
                              ({takeawayOrders[orderId].length} món)
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
                    <span className="text-lg">Đơn {selectedTakeawayOrder}</span>
                  </p>
                </div>
              </>
            )}
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
          <h3 className="mb-4">
            Đơn hàng -{" "}
            {orderType === "table"
              ? `Bàn ${selectedTable}`
              : `${selectedTakeawayOrder}`}
          </h3>
          {currentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chưa có món nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto">
                {currentOrders.map((orderItem, index) => (
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
                    {currentOrders
                      .reduce((sum, o) => sum + o.item.price * o.quantity, 0)
                      .toLocaleString()}
                    đ
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Tổng món:{" "}
                  {currentOrders.reduce((sum, o) => sum + o.quantity, 0)}
                </div>

                {/* Confirm Invoice Button */}
                <Button
                  fullWidth
                  className="mt-4"
                  disabled={
                    currentOrders.length === 0 ||
                    !currentOrders.every((o) => o.status === "served") ||
                    isProcessingInvoice
                  }
                  onClick={handleConfirmInvoice}
                >
                  {isProcessingInvoice ? "Đang xử lý..." : "Xác nhận hóa đơn"}
                </Button>
                {currentOrders.length > 0 &&
                  !currentOrders.every((o) => o.status === "served") && (
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
