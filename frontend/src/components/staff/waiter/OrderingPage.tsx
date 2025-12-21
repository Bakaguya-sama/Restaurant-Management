import { useState, useEffect } from "react";
import { Plus, Minus, Utensils, X } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { Badge } from "../../ui/badge";
import { useOrderingDishes } from "../../../hooks/useOrderingDishes";
import { useTables } from "../../../hooks/useTables";
import { useStaff } from "../../../hooks/useStaff";
import { Dish } from "../../../types";
import { toast } from "sonner";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { RiTakeawayLine } from "react-icons/ri";
import {
  createOrder,
  createOrderDetail,
  getPendingOrderByTableId,
  getOrderDetails,
  updateOrderStatus,
  updateOrderDetailStatus,
  updateOrderDetailQuantity,
  updateOrderDetailNotes,
  patchOrderStatus,
  patchOrderDetailStatus,
  generateOrderNumber,
  Order,
  OrderDetail,
} from "../../../lib/orderApi";
import { invoiceApi } from "../../../lib/invoiceApi";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=300";

interface OrderItem {
  item: Dish;
  quantity: number;
  notes: string;
  status: "pending" | "cooking" | "served";
  orderDetailId?: string; 
}

interface TableOrder {
  order: Order;
  orderDetails: OrderDetail[];
}

export function OrderingPage() {
  const [orderType, setOrderType] = useState<"table" | "takeaway">("table");
  const [selectedTable, setSelectedTable] = useState("T02");
  
  
  const [tableOrdersMap, setTableOrdersMap] = useState<Record<string, TableOrder>>({});
  
  
  const [takeawayOrdersMap, setTakeawayOrdersMap] = useState<Record<string, TableOrder>>({});
  const [selectedTakeawayOrder, setSelectedTakeawayOrder] = useState<string | null>(null);
  const [takeawayOrderCounter, setTakeawayOrderCounter] = useState(1);

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

  
  const { items: filteredItems } = useOrderingDishes(selectedCategory);
  
  
  const { tables, loading: isLoadingTables, error: tablesError, updateTableStatus } = useTables();
  
  
  const { staff } = useStaff();
  const firstWaiterId = staff.find((s) => s.role === "waiter")?.id || undefined;

  const categories = ["all", "Khai vị", "Món chính", "Đồ uống"];
  const quickNotes = ["Ít đá", "Không cay", "Không hành", "Ít dầu", "Thêm rau"];

  
  useEffect(() => {
    if (orderType === "table") {
      loadPendingOrder();
    }
  }, [selectedTable, orderType]);

  const loadPendingOrder = async () => {
    try {
      const selectedTableObj = tables.find(
        (t) => t.table_number === selectedTable
      );
      if (!selectedTableObj) return;

      
      if (tableOrdersMap[selectedTableObj.id]) {
        return;
      }

      
      const existingOrder = await getPendingOrderByTableId(selectedTableObj.id);
      
      if (existingOrder) {
        console.log(`Pending order found for table ${selectedTable}:`, existingOrder._id || existingOrder.id);
        
        const orderId = existingOrder._id || existingOrder.id;
        if (!orderId) {
          console.error('Order ID is undefined:', existingOrder);
          return;
        }
        const orderDetails = await getOrderDetails(orderId);
        setTableOrdersMap({
          ...tableOrdersMap,
          [selectedTableObj.id]: {
            order: existingOrder,
            orderDetails: orderDetails,
          },
        });
      } else {
        console.log(`No pending order found for table ${selectedTable} (id: ${selectedTableObj.id})`);
      }
    } catch (error) {
      console.error("Error loading pending order:", error);
      
    }
  };

  
  const getCurrentTableOrder = (): TableOrder | null => {
    const selectedTableObj = tables.find((t) => t.table_number === selectedTable);
    if (!selectedTableObj) return null;
    const order = tableOrdersMap[selectedTableObj.id] || null;
    return order;
  };

  const currentTableOrder = getCurrentTableOrder();
  const currentOrders: OrderItem[] =
    orderType === "table" && currentTableOrder
      ? currentTableOrder.orderDetails.map((od) => {
          const dish = filteredItems.find((d) => d.id === od.dish_id);
          return {
            item: dish || ({ id: od.dish_id, name: "Unknown", price: 0 } as Dish),
            quantity: od.quantity,
            notes: od.special_instructions || "",
            status: od.status as "pending" | "cooking" | "served",
            orderDetailId: od._id || od.id,
          };
        })
      : orderType === "takeaway" && selectedTakeawayOrder && takeawayOrdersMap[selectedTakeawayOrder]
      ? takeawayOrdersMap[selectedTakeawayOrder].orderDetails.map((od) => {
          const dish = filteredItems.find((d) => d.id === od.dish_id);
          return {
            item: dish || ({ id: od.dish_id, name: "Unknown", price: 0 } as Dish),
            quantity: od.quantity,
            notes: od.special_instructions || "",
            status: od.status as "pending" | "cooking" | "served",
            orderDetailId: od._id || od.id,
          };
        })
      : [];

  const currentOrderId =
    orderType === "table" ? selectedTable : selectedTakeawayOrder;

  const [addingItem, setAddingItem] = useState<string | null>(null);

  const handleAddToOrder = async (item: Dish) => {
    
    if (addingItem === item.id) {
      return;
    }

    
    if (orderType === "table") {
      const selectedTableObj = tables.find((t) => t.table_number === selectedTable);
      if (!selectedTableObj || selectedTableObj.status !== "occupied") {
        toast.error(`Bàn ${selectedTable} không ở trạng thái có khách. Không thể tạo order.`);
        return;
      }
    }

    setAddingItem(item.id);
    try {
      if (orderType === "table") {
        
        const selectedTableObj = tables.find(
          (t) => t.table_number === selectedTable
        );
        if (!selectedTableObj) {
          toast.error("Bàn không tồn tại");
          return;
        }

        let tableOrder = tableOrdersMap[selectedTableObj.id];

        
        if (!tableOrder) {
          const pendingOrder = await getPendingOrderByTableId(selectedTableObj.id);
          if (pendingOrder) {
            const orderId = pendingOrder._id || pendingOrder.id;
            if (!orderId) {
              console.error('Order ID is undefined:', pendingOrder);
              toast.error('Không thể tải đơn hàng: thiếu ID');
              return;
            }
            const orderDetails = await getOrderDetails(orderId);
            tableOrder = {
              order: pendingOrder,
              orderDetails: orderDetails,
            };
            
            setTableOrdersMap({
              ...tableOrdersMap,
              [selectedTableObj.id]: tableOrder,
            });
          } else {
            toast.error("Không tìm thấy đơn hàng đang chờ cho bàn này");
            return;
          }
        }

        
        const lineTotal = item.price * 1;
        const orderId = tableOrder.order._id || tableOrder.order.id;
        if (!orderId) {
          console.error("Order ID is undefined. Order object:", tableOrder.order);
          throw new Error("Cannot create order detail: Order ID is undefined");
        }
        const orderDetail = await createOrderDetail({
          order_id: orderId,
          dish_id: item.id,
          quantity: 1,
          unit_price: item.price,
          line_total: lineTotal,
          status: "pending",
        });

        
        setTableOrdersMap({
          ...tableOrdersMap,
          [selectedTableObj.id]: {
            order: tableOrder.order,
            orderDetails: [...tableOrder.orderDetails, orderDetail],
          },
        });

        toast.success(`Đã thêm ${item.name} vào đơn`);
      } else {
        
        if (!selectedTakeawayOrder) {
          toast.error('Vui lòng chọn đơn mang về');
          return;
        }

        const takeawayOrder = takeawayOrdersMap[selectedTakeawayOrder];
        if (!takeawayOrder) {
          toast.error('Không tìm thấy đơn mang về');
          return;
        }

        
        const lineTotal = item.price * 1;
        const orderId = takeawayOrder.order._id || takeawayOrder.order.id;
        if (!orderId) {
          console.error('Order ID is undefined. Order object:', takeawayOrder.order);
          throw new Error('Cannot create order detail: Order ID is undefined');
        }

        const orderDetail = await createOrderDetail({
          order_id: orderId,
          dish_id: item.id,
          quantity: 1,
          unit_price: item.price,
          line_total: lineTotal,
          status: 'pending',
        });

        
        setTakeawayOrdersMap({
          ...takeawayOrdersMap,
          [selectedTakeawayOrder]: {
            order: takeawayOrder.order,
            orderDetails: [...takeawayOrder.orderDetails, orderDetail],
          },
        });

        toast.success(`Đã thêm ${item.name} vào đơn`);
      }
    } catch (error: any) {
      console.error("Error adding item to order:", error);
      toast.error(`Không thể thêm món: ${error.message || "Lỗi không xác định"}`);
    } finally {
      setAddingItem(null);
    }
  };

  const handleUpdateQuantity = async (index: number, delta: number) => {
    try {
      if (orderType === "table" && currentTableOrder) {
        
        const orderDetail = currentTableOrder.orderDetails[index];
        if (!orderDetail) return;

        const newQuantity = orderDetail.quantity + delta;

        if (newQuantity <= 0) {
          
          
          const updated = currentTableOrder.orderDetails.filter((_, i) => i !== index);
          const selectedTableObj = tables.find(
            (t) => t.table_number === selectedTable
          );
          if (selectedTableObj) {
            setTableOrdersMap({
              ...tableOrdersMap,
              [selectedTableObj.id]: {
                order: currentTableOrder.order,
                orderDetails: updated,
              },
            });
          }
          toast.success("Đã xóa món");
          return;
        }

        
        const orderId = currentTableOrder.order._id || currentTableOrder.order.id as string;
        const detailId = orderDetail._id || orderDetail.id as string;
        
        await updateOrderDetailQuantity(orderId, detailId, newQuantity);

        
        const updated = [...currentTableOrder.orderDetails];
        updated[index] = {
          ...updated[index],
          quantity: newQuantity,
          line_total: newQuantity * updated[index].unit_price,
        };

        const selectedTableObj = tables.find(
          (t) => t.table_number === selectedTable
        );
        if (selectedTableObj) {
          setTableOrdersMap({
            ...tableOrdersMap,
            [selectedTableObj.id]: {
              order: currentTableOrder.order,
              orderDetails: updated,
            },
          });
        }

        if (delta > 0) {
          toast.success("Đã tăng số lượng");
        } else {
          toast.info("Đã giảm số lượng");
        }
      } else if (orderType === "takeaway" && selectedTakeawayOrder && takeawayOrdersMap[selectedTakeawayOrder]) {
        
        const takeawayOrder = takeawayOrdersMap[selectedTakeawayOrder];
        const orderDetail = takeawayOrder.orderDetails[index];
        if (!orderDetail) return;

        const newQuantity = orderDetail.quantity + delta;

        if (newQuantity <= 0) {
          
          const updated = takeawayOrder.orderDetails.filter((_, i) => i !== index);
          setTakeawayOrdersMap({
            ...takeawayOrdersMap,
            [selectedTakeawayOrder]: {
              order: takeawayOrder.order,
              orderDetails: updated,
            },
          });
          toast.success("Đã xóa món");
          return;
        }

        
        const orderId = takeawayOrder.order._id || takeawayOrder.order.id as string;
        const detailId = orderDetail._id || orderDetail.id as string;
        
        await updateOrderDetailQuantity(orderId, detailId, newQuantity);

        
        const updated = [...takeawayOrder.orderDetails];
        updated[index] = {
          ...updated[index],
          quantity: newQuantity,
          line_total: newQuantity * updated[index].unit_price,
        };

        setTakeawayOrdersMap({
          ...takeawayOrdersMap,
          [selectedTakeawayOrder]: {
            order: takeawayOrder.order,
            orderDetails: updated,
          },
        });

        if (delta > 0) {
          toast.success("Đã tăng số lượng");
        } else {
          toast.info("Đã giảm số lượng");
        }
      }
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleCustomize = (orderItem: OrderItem, index: number) => {
    setCustomizingItem({ ...orderItem, notes: orderItem.notes || "" });
    setCustomizingIndex(index);
    setShowCustomizeModal(true);
  };

  const handleSaveCustomization = async () => {
    if (!customizingItem || customizingIndex < 0) return;

    try {
      if (orderType === "table" && currentTableOrder) {
        
        const orderDetail = currentTableOrder.orderDetails[customizingIndex];
        if (!orderDetail) return;

        const orderId = currentTableOrder.order._id || currentTableOrder.order.id as string;
        const detailId = orderDetail._id || orderDetail.id as string;

        
        await updateOrderDetailNotes(orderId, detailId, customizingItem.notes);
        
        
        if (customizingItem.quantity !== orderDetail.quantity) {
          await updateOrderDetailQuantity(orderId, detailId, customizingItem.quantity);
        }

        
        const updated = [...currentTableOrder.orderDetails];
        updated[customizingIndex] = {
          ...updated[customizingIndex],
          special_instructions: customizingItem.notes,
          quantity: customizingItem.quantity,
          line_total: customizingItem.quantity * updated[customizingIndex].unit_price,
        };

        const selectedTableObj = tables.find(
          (t) => t.table_number === selectedTable
        );
        if (selectedTableObj) {
          setTableOrdersMap({
            ...tableOrdersMap,
            [selectedTableObj.id]: {
              order: currentTableOrder.order,
              orderDetails: updated,
            },
          });
        }
      } else if (orderType === "takeaway" && selectedTakeawayOrder && takeawayOrdersMap[selectedTakeawayOrder]) {
        
        const takeawayOrder = takeawayOrdersMap[selectedTakeawayOrder];
        const orderDetail = takeawayOrder.orderDetails[customizingIndex];
        if (!orderDetail) return;

        const orderId = takeawayOrder.order._id || takeawayOrder.order.id as string;
        const detailId = orderDetail._id || orderDetail.id as string;

        
        await updateOrderDetailNotes(orderId, detailId, customizingItem.notes);
        
        
        if (customizingItem.quantity !== orderDetail.quantity) {
          await updateOrderDetailQuantity(orderId, detailId, customizingItem.quantity);
        }

        
        const updated = [...takeawayOrder.orderDetails];
        updated[customizingIndex] = {
          ...updated[customizingIndex],
          special_instructions: customizingItem.notes,
          quantity: customizingItem.quantity,
          line_total: customizingItem.quantity * updated[customizingIndex].unit_price,
        };

        setTakeawayOrdersMap({
          ...takeawayOrdersMap,
          [selectedTakeawayOrder]: {
            order: takeawayOrder.order,
            orderDetails: updated,
          },
        });
      }

      setShowCustomizeModal(false);
      setCustomizingItem(null);
      setCustomizingIndex(-1);
      toast.success("Đã lưu tùy chỉnh");
    } catch (error: any) {
      console.error("Error saving customization:", error);
      toast.error(`Không thể lưu tùy chỉnh: ${error.message || "Lỗi không xác định"}`);
    }
  };

  const handleUpdateStatus = async (
    index: number,
    newStatus: "pending" | "cooking" | "served"
  ) => {
    try {
      if (orderType === "table" && currentTableOrder) {
        
        const orderDetail = currentTableOrder.orderDetails[index];
        if (!orderDetail || !orderDetail._id && !orderDetail.id) return;

        
        const orderId = currentTableOrder.order._id || currentTableOrder.order.id as string;
        const detailId = orderDetail._id || orderDetail.id as string;
        const statusMap: Record<string, "pending" | "preparing" | "ready" | "served"> = {
          pending: "pending",
          cooking: "preparing",
          served: "served",
        };

        await patchOrderDetailStatus(orderId, detailId, statusMap[newStatus] || "pending");

        
        const updated = [...currentTableOrder.orderDetails];
        updated[index] = {
          ...updated[index],
          status: statusMap[newStatus] || "pending",
        };

        const selectedTableObj = tables.find(
          (t) => t.table_number === selectedTable
        );
        if (selectedTableObj) {
          setTableOrdersMap({
            ...tableOrdersMap,
            [selectedTableObj.id]: {
              order: currentTableOrder.order,
              orderDetails: updated,
            },
          });
        }

        toast.success(
          `Đã cập nhật: ${getStatusText(newStatus)}`
        );
      } else if (orderType === "takeaway" && selectedTakeawayOrder && takeawayOrdersMap[selectedTakeawayOrder]) {
        
        const takeawayOrder = takeawayOrdersMap[selectedTakeawayOrder];
        const orderDetail = takeawayOrder.orderDetails[index];
        if (!orderDetail || !orderDetail._id && !orderDetail.id) return;

        
        const orderId = takeawayOrder.order._id || takeawayOrder.order.id as string;
        const detailId = orderDetail._id || orderDetail.id as string;
        const statusMap: Record<string, "pending" | "preparing" | "ready" | "served"> = {
          pending: "pending",
          cooking: "preparing",
          served: "served",
        };

        await patchOrderDetailStatus(orderId, detailId, statusMap[newStatus] || "pending");

        
        const updated = [...takeawayOrder.orderDetails];
        updated[index] = {
          ...updated[index],
          status: statusMap[newStatus] || "pending",
        };

        setTakeawayOrdersMap({
          ...takeawayOrdersMap,
          [selectedTakeawayOrder]: {
            order: takeawayOrder.order,
            orderDetails: updated,
          },
        });

        toast.success(
          `Đã cập nhật: ${getStatusText(newStatus)}`
        );
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(`Không thể cập nhật: ${error.message || "Lỗi không xác định"}`);
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "cooking":
      case "preparing":
        return "Đang nấu";
      case "served":
        return "Đã phục vụ";
      default:
        return status;
    }
  };

  const handleOrderComplete = async () => {
    
    if (!firstWaiterId) {
      toast.error("Không tìm thấy nhân viên phục vụ. Vui lòng kiểm tra danh sách nhân viên.");
      return;
    }

    setIsProcessingInvoice(true);

    try {
      if (orderType === "table" && currentTableOrder) {
        
        const allServed = currentTableOrder.orderDetails.every(
          (od) => od.status === "served"
        );

        if (!allServed) {
          toast.error("Tất cả các món phải được phục vụ trước khi kết thúc đơn");
          setIsProcessingInvoice(false);
          return;
        }

        
        const totalAmount = currentTableOrder.orderDetails.reduce(
          (sum, od) => sum + od.line_total,
          0
        );

        const invoiceData = {
          invoice_number: `INV-${Date.now()}`,
          order_id: currentTableOrder.order._id || currentTableOrder.order.id,
          subtotal: totalAmount,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: totalAmount,
          payment_method: "cash",
          payment_status: "pending",
          table_id: currentTableOrder.order.table_id,
          staff_id: firstWaiterId,
          invoice_time: new Date().toISOString(),
          notes: `Bàn ${selectedTable}`,
        };

        await invoiceApi.create({
          order_id: currentTableOrder.order._id || currentTableOrder.order.id as string,
          notes: `Bàn ${selectedTable}`,
        });

        
        const orderId = currentTableOrder.order._id || currentTableOrder.order.id as string;
        await patchOrderStatus(
          orderId,
          "served"
        );

        
        const selectedTableObj = tables.find(
          (t) => t.table_number === selectedTable
        );
        if (selectedTableObj) {
          await updateTableStatus(selectedTableObj.id, "dirty");
          
          const newMap = { ...tableOrdersMap };
          delete newMap[selectedTableObj.id];
          setTableOrdersMap(newMap);
        }

        toast.success("Đã tạo hóa đơn và kết thúc đơn hàng");
      } else if (orderType === "takeaway" && selectedTakeawayOrder && takeawayOrdersMap[selectedTakeawayOrder]) {
        
        const takeawayOrder = takeawayOrdersMap[selectedTakeawayOrder];

        
        const allServed = takeawayOrder.orderDetails.every(
          (od) => od.status === "served"
        );

        if (!allServed) {
          toast.error("Tất cả các món phải được phục vụ trước khi kết thúc đơn");
          setIsProcessingInvoice(false);
          return;
        }

        
        const totalAmount = takeawayOrder.orderDetails.reduce(
          (sum, od) => sum + od.line_total,
          0
        );

        const invoiceData = {
          invoice_number: `INV-${Date.now()}`,
          order_id: takeawayOrder.order._id || takeawayOrder.order.id,
          subtotal: totalAmount,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: totalAmount,
          payment_method: "cash",
          payment_status: "pending",
          staff_id: firstWaiterId,
          invoice_time: new Date().toISOString(),
          notes: `Đơn mang về ${takeawayOrder.order.order_number || selectedTakeawayOrder}`,
        };

        await invoiceApi.create({
          order_id: takeawayOrder.order._id || takeawayOrder.order.id as string,
          notes: `Đơn mang về ${takeawayOrder.order.order_number || selectedTakeawayOrder}`,
        });

        
        const orderId = takeawayOrder.order._id || takeawayOrder.order.id as string;
        await patchOrderStatus(orderId, "served");

        
        const newMap = { ...takeawayOrdersMap };
        delete newMap[selectedTakeawayOrder];
        setTakeawayOrdersMap(newMap);

        
        setSelectedTakeawayOrder(null);

        toast.success("Đã tạo hóa đơn");
      }
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast.error(
        `Không thể tạo hóa đơn: ${error.message || "Lỗi không xác định"}`
      );
    } finally {
      setIsProcessingInvoice(false);
    }
  };

  const handleConfirmInvoice = () => {
    let totalAmount = 0;
    if (orderType === "table" && currentTableOrder) {
      totalAmount = currentTableOrder.orderDetails.reduce(
        (sum, od) => sum + od.line_total,
        0
      );
    } else if (orderType === "takeaway" && selectedTakeawayOrder && takeawayOrdersMap[selectedTakeawayOrder]) {
      const takeawayOrder = takeawayOrdersMap[selectedTakeawayOrder];
      totalAmount = takeawayOrder.orderDetails.reduce(
        (sum, od) => sum + od.line_total,
        0
      );
    }

    const orderLabel =
      orderType === "table"
        ? `bàn ${selectedTable}`
        : `đơn ${selectedTakeawayOrder}`;
    setConfirmTitle("Xác nhận tạo hóa đơn");
    setConfirmMessage(
      `Bạn có chắc muốn tạo hóa đơn cho ${orderLabel}?\nTổng: ${totalAmount.toLocaleString()}đ`
    );
    setConfirmText("Xác nhận");
    setConfirmCancelText("Hủy");
    setConfirmVariant("info");
    setPendingAction(() => handleOrderComplete);
    setShowConfirmModal(true);
  };

  const handleAddTakeawayOrder = async () => {
    try {
      
      const orderNumber = await generateOrderNumber('takeaway-staff');
      const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const order = await createOrder({
        order_number: orderNumber,
        order_type: 'takeaway-staff',
        order_time: currentTime,
        staff_id: firstWaiterId,
        notes: `Đơn mang về ${orderNumber}`,
      });

      const orderId = order._id || order.id;
      if (!orderId) {
        toast.error('Không thể tạo đơn: thiếu ID');
        return;
      }

      
      setTakeawayOrdersMap({
        ...takeawayOrdersMap,
        [orderId]: {
          order,
          orderDetails: [],
        },
      });

      setSelectedTakeawayOrder(orderId);
      setTakeawayOrderCounter(takeawayOrderCounter + 1);
      toast.success(`Đã tạo đơn mang về ${orderNumber}`);
    } catch (error: any) {
      console.error('Error creating takeaway order:', error);
      toast.error(`Không thể tạo đơn: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  const handleRemoveItem = (index: number) => {
    const item = currentOrders[index];
    if (!item) return;

    setConfirmTitle(`Xác nhận hủy món`);
    setConfirmMessage(`Bạn có chắc hủy món ${item.item.name}?`);
    setConfirmText("Xác nhận");
    setConfirmCancelText("Hủy");
    setConfirmVariant(`warning`);
    setPendingAction(() => async () => {
      try {
        if (orderType === "table" && currentTableOrder) {
          
          const orderDetail = currentTableOrder.orderDetails[index];
          if (!orderDetail) return;

          const orderId = currentTableOrder.order._id || currentTableOrder.order.id as string;
          const detailId = orderDetail._id || orderDetail.id as string;

          
          await patchOrderDetailStatus(orderId, detailId, "cancelled");

          
          const updated = [...currentTableOrder.orderDetails];
          updated[index] = {
            ...updated[index],
            status: "cancelled",
          };

          const selectedTableObj = tables.find(
            (t) => t.table_number === selectedTable
          );
          if (selectedTableObj) {
            setTableOrdersMap({
              ...tableOrdersMap,
              [selectedTableObj.id]: {
                order: currentTableOrder.order,
                orderDetails: updated,
              },
            });
          }
          toast.success("Đã hủy món");
        } else if (orderType === "takeaway" && selectedTakeawayOrder && takeawayOrdersMap[selectedTakeawayOrder]) {
          
          const takeawayOrder = takeawayOrdersMap[selectedTakeawayOrder];
          const orderDetail = takeawayOrder.orderDetails[index];
          if (!orderDetail) return;

          const orderId = takeawayOrder.order._id || takeawayOrder.order.id as string;
          const detailId = orderDetail._id || orderDetail.id as string;

          
          await patchOrderDetailStatus(orderId, detailId, "cancelled");

          
          const updated = [...takeawayOrder.orderDetails];
          updated[index] = {
            ...updated[index],
            status: "cancelled",
          };

          setTakeawayOrdersMap({
            ...takeawayOrdersMap,
            [selectedTakeawayOrder]: {
              order: takeawayOrder.order,
              orderDetails: updated,
            },
          });

          toast.success("Đã hủy món");
        }
      } catch (error: any) {
        console.error("Error cancelling item:", error);
        toast.error(`Không thể hủy món: ${error.message || "Lỗi không xác định"}`);
      }
    });
    setShowConfirmModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cooking":
      case "preparing":
        return "bg-orange-100 text-orange-700";
      case "served":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
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
      {}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <div className="mb-4">
            {}
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
                {}
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
                      const tableOrder = tableOrdersMap[table.id];
                      const hasOrders = tableOrder && tableOrder.orderDetails.length > 0;
                      const isOccupied = table.status === "occupied";
                      const isSelectable = isOccupied;
                      
                      return (
                        <button
                          key={table.id}
                          onClick={() => {
                            if (!isSelectable) {
                              toast.error(`Bàn ${table.table_number} không ở trạng thái có khách. Chỉ có thể tạo order trên bàn có khách.`);
                              return;
                            }
                            setSelectedTable(table.table_number);
                          }}
                          disabled={!isSelectable}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            !isSelectable
                              ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
                              : selectedTable === table.table_number
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
                                ({tableOrder?.orderDetails.length} món)
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

                {}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6 p-4 bg-white rounded-lg border-2 border-[#625EE8]">
                  {Object.keys(takeawayOrdersMap).map((orderId) => {
                    const takeawayOrder = takeawayOrdersMap[orderId];
                    const hasOrders = takeawayOrder?.orderDetails?.length > 0;
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
                          <span className="text-xs">{takeawayOrder?.order?.order_number || orderId}</span>
                          {hasOrders && (
                            <span className="block text-xs mt-1">
                              ({takeawayOrder?.orderDetails?.length} món)
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

          {}
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

        {}
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
                    item.image_url ||
                    PLACEHOLDER_IMAGE
                  }
                  alt={item.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="p-3">
                  <h4 className="text-sm mb-1">{item.name}</h4>
                  <p className="text-[#625EE8]">{item.price.toLocaleString()}đ</p>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {}
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

                    {}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCustomize(orderItem, index)}
                      >
                        Tùy chỉnh
                      </Button>

                      {}
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

                {}
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

      {}
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
