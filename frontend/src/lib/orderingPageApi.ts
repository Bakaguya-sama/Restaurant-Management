// Single, validated implementation for orderingPageApi
export interface OrderDTO {
  id: string;
  order_number: string;
  order_type: 'dine-in-customer' | 'takeaway-customer' | 'dine-in-waiter' | 'takeaway-staff';
  order_date?: string;
  order_time: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal?: number;
  tax?: number;
  total_amount?: number;
  notes?: string;
  table_id?: string | null;
  customer_id?: string | null;
  staff_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderDetailDTO {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status?: 'pending' | 'cooking' | 'served';
}

export interface CreateOrderRequest {
  order_number: string;
  order_type: 'dine-in-customer' | 'takeaway-customer' | 'dine-in-waiter' | 'takeaway-staff';
  order_time: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  notes?: string;
  orderItems?: any[];
}

export interface AddOrderItemRequest {
  dish_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status?: 'pending' | 'cooking' | 'served';
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  notes?: string;
  status?: 'pending' | 'cooking' | 'served';
}

export interface TableDTO {
  id: string;
  table_number: string;
  floor_id?: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location?: string;
}

import { API_BASE_URL } from './api';

export async function fetchTables(status?: 'available' | 'occupied' | 'reserved' | 'maintenance') {
  const url = new URL(`${API_BASE_URL}/tables`);
  if (status) url.searchParams.set('status', status);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch tables: ${res.status}`);
  const data = await res.json();
  return data.data || data;
}

export async function fetchOrderByTableId(tableId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/table/${tableId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch order: ${res.status}`);
  }
  const data = await res.json();
  if (data.data && Array.isArray(data.data) && data.data.length > 0) return data.data[0];
  return null;
}

export async function fetchOrderDetails(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/details`);
  if (!res.ok) throw new Error(`Failed to fetch order details: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export async function createOrder(orderData: CreateOrderRequest) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to create order: ${res.status}`);
  return data.data || data;
}

export async function addItemToOrder(orderId: string, item: AddOrderItemRequest) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to add item to order: ${res.status}`);
  return data.data || data;
}

export async function updateOrderItem(orderId: string, detailId: string, updates: UpdateOrderItemRequest) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to update order item: ${res.status}`);
  return data.data || data;
}

export async function removeOrderItem(orderId: string, detailId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Failed to remove order item: ${res.status}`);
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to update order status: ${res.status}`);
  return data.data || data;
}

export async function patchOrderStatus(orderId: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to patch order status: ${res.status}`);
  return data.data || data;
}

export async function calculateOrderTotal(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/calculate`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to calculate order total: ${res.status}`);
  const data = await res.json();
  return data.total || data.data?.total || 0;
}

export async function updateTableStatus(tableId: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to update table status: ${res.status}`);
  return data.data || data;
}

export async function getPendingTakeawayOrders() {
  const res = await fetch(`${API_BASE_URL}/orders?order_type=takeaway-staff&status=pending`);
  if (!res.ok) throw new Error(`Failed to fetch pending takeaway orders: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export async function getOrderById(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
  const data = await res.json();
  return data.data || data;
}

export async function updateOrderDetailStatus(orderId: string, detailId: string, params: UpdateOrderItemRequest) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Failed to update order detail status: ${res.status}`);
  return data.data || data;
}

export function generateOrderNumber(orderType: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const prefix = orderType === 'dine-in-waiter' ? 'DIN' : 'TO';
  return `${prefix}-${timestamp}-${random}`;
}
// ==================== TYPE DEFINITIONS ====================

export interface OrderDTO {
  id: string;
  order_number: string;
  order_type: 'dine-in-customer' | 'takeaway-customer' | 'dine-in-waiter' | 'takeaway-staff';
  order_date?: string;
  order_time: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal?: number;
  tax?: number;
  total_amount?: number;
  notes?: string;
  table_id?: string | null;
  customer_id?: string | null;
  staff_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderDetailDTO {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status?: 'pending' | 'cooking' | 'served';
}

export interface CreateOrderRequest {
  order_number: string;
  order_type: 'dine-in-customer' | 'takeaway-customer' | 'dine-in-waiter' | 'takeaway-staff';
  order_time: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  notes?: string;
  orderItems?: any[];
}

export interface AddOrderItemRequest {
  dish_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status?: 'pending' | 'cooking' | 'served';
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  notes?: string;
  status?: 'pending' | 'cooking' | 'served';
}

export interface TableDTO {
  id: string;
  table_number: string;
  floor_id?: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location?: string;
}

// ==================== API CONFIGURATION ====================

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  'http://localhost:5000/api/v1';

// ==================== API FUNCTIONS ====================

export async function fetchTables(
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
): Promise<TableDTO[]> {
  const url = new URL(`${API_BASE_URL}/tables`);
  if (status) url.searchParams.set('status', status);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Failed to fetch tables: ${response.status}`);
  const data = await response.json();
  return data.data || data;
}

export async function fetchOrderByTableId(tableId: string): Promise<OrderDTO | null> {
  const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch order: ${response.status}`);
  }
  const data = await response.json();
  if (data.data && Array.isArray(data.data) && data.data.length > 0) return data.data[0];
  return null;
}

export async function fetchOrderDetails(orderId: string): Promise<OrderDetailDTO[]> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`);
  if (!response.ok) throw new Error(`Failed to fetch order details: ${response.status}`);
  const data = await response.json();
  return data.data || [];
}

export async function createOrder(orderData: CreateOrderRequest): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to create order: ${response.status}`);
  return data.data || data;
}

export async function addItemToOrder(orderId: string, item: AddOrderItemRequest): Promise<OrderDetailDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to add item to order: ${response.status}`);
  return data.data || data;
}

export async function updateOrderItem(orderId: string, detailId: string, updates: UpdateOrderItemRequest): Promise<OrderDetailDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to update order item: ${response.status}`);
  return data.data || data;
}

export async function removeOrderItem(orderId: string, detailId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`, { method: 'DELETE' });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Failed to remove order item: ${response.status}`);
  }
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to update order status: ${response.status}`);
  return data.data || data;
}

export async function patchOrderStatus(orderId: string, status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to patch order status: ${response.status}`);
  return data.data || data;
}

export async function calculateOrderTotal(orderId: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/calculate`, { method: 'POST' });
  if (!response.ok) throw new Error(`Failed to calculate order total: ${response.status}`);
  const data = await response.json();
  return data.total || data.data?.total || 0;
}

export async function updateTableStatus(tableId: string, status: 'available' | 'occupied' | 'reserved' | 'maintenance'): Promise<TableDTO> {
  const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to update table status: ${response.status}`);
  return data.data || data;
}

export async function getPendingTakeawayOrders(): Promise<OrderDTO[]> {
  const response = await fetch(`${API_BASE_URL}/orders?order_type=takeaway-staff&status=pending`);
  if (!response.ok) throw new Error(`Failed to fetch pending takeaway orders: ${response.status}`);
  const data = await response.json();
  return data.data || [];
}

export async function getOrderById(orderId: string): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  if (!response.ok) throw new Error(`Failed to fetch order: ${response.status}`);
  const data = await response.json();
  return data.data || data;
}

export async function updateOrderDetailStatus(orderId: string, detailId: string, params: UpdateOrderItemRequest): Promise<OrderDetailDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Failed to update order detail status: ${response.status}`);
  return data.data || data;
}

export function generateOrderNumber(orderType: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const prefix = orderType === 'dine-in-waiter' ? 'DIN' : 'TO';
  return `${prefix}-${timestamp}-${random}`;
}
// ==================== TYPE DEFINITIONS ====================

export interface OrderDTO {
  id: string;
  order_number: string;
  order_type: "dine-in-customer" | "takeaway-customer" | "dine-in-waiter" | "takeaway-staff";
  order_date?: string;
  order_time: string;
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  subtotal?: number;
  tax?: number;
  total_amount?: number;
  notes?: string;
  table_id?: string | null;
  customer_id?: string | null;
  staff_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderDetailDTO {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status?: "pending" | "cooking" | "served";
}

export interface CreateOrderRequest {
  order_number: string;
  order_type: "dine-in-customer" | "takeaway-customer" | "dine-in-waiter" | "takeaway-staff";
  order_time: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  orderItems?: any[];
}

export interface AddOrderItemRequest {
  dish_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status?: "pending" | "cooking" | "served";
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  notes?: string;
  status?: "pending" | "cooking" | "served";
}

export interface TableDTO {
  id: string;
  table_number: string;
  floor_id?: string;
  seats: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
  location?: string;
}

// ==================== API CONFIGURATION ====================

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// ==================== API FUNCTIONS ====================

/**
 * Fetch all tables with optional status filter
 */
export async function fetchTables(
  status?: "available" | "occupied" | "reserved" | "maintenance"
): Promise<TableDTO[]> {
  const url = new URL(`${API_BASE_URL}/tables`);
  if (status) {
    url.searchParams.set("status", status);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Failed to fetch tables: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Fetch order by table ID
 */
export async function fetchOrderByTableId(
  tableId: string
): Promise<OrderDTO | null> {
  const response = await fetch(`${API_BASE_URL}/orders/table/${tableId}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No active order for this table
    }
    throw new Error(
      `Failed to fetch order: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (data.data && Array.isArray(data.data) && data.data.length > 0) {
    return data.data[0];
  }
  return null;
}

/**
 * Fetch order details for a specific order
 */
export async function fetchOrderDetails(
  orderId: string
): Promise<OrderDetailDTO[]> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch order details: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Create a new order
 */
export async function createOrder(
  orderData: CreateOrderRequest
): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create order: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Add item to an existing order
 */
export async function addItemToOrder(
  orderId: string,
  item: AddOrderItemRequest
): Promise<OrderDetailDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to add item to order: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Update an order item (quantity, notes, or status)
 */
export async function updateOrderItem(
  orderId: string,
  detailId: string,
  updates: UpdateOrderItemRequest
): Promise<OrderDetailDTO> {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/details/${detailId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update order item: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Remove an item from order
 */
export async function removeOrderItem(
  orderId: string,
  detailId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/details/${detailId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to remove order item: ${response.status}`);
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled"
): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update order status: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Patch order status
 */
export async function patchOrderStatus(
  orderId: string,
  status: "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled"
): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to patch order status: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Calculate order total
 */
export async function calculateOrderTotal(orderId: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/calculate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to calculate order total: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.total || data.data?.total || 0;
}

/**
 * Update table status
 */
export async function updateTableStatus(
  tableId: string,
  status: "available" | "occupied" | "reserved" | "maintenance"
): Promise<TableDTO> {
  const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update table status: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}
export async function fetchOrderDetails(
  orderId: string
): Promise<OrderDetailDTO[]> {
  const response = await fetch(`${API_BASE}/orders/${orderId}/details`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch order details: ${response.status} ${response.statusText}`
    );
  }
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`,
  return data.data || data;
}

/**
 * Create a new order
 */
export async function createOrder(
  orderData: CreateOrderRequest
): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to create order: ${response.status}`
    );
  }

  const data = await response.json();
  return data.data || data;
}
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details/${detailId}`,
 * Add item to an existing order
 */
export async function addItemToOrder(
  orderId: string,
  item: AddOrderItemRequest
): Promise<OrderDetailDTO> {
  const response = await fetch(`${API_BASE}/orders/${orderId}/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to add item to order: ${response.status}`
    );
  }
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
  const data = await response.json();
  return data.data || data;
}

/**
 * Update an order item (quantity, notes, or status)
 */
export async function updateOrderItem(
  orderId: string,
  detailId: string,
  updates: UpdateOrderItemRequest
): Promise<OrderDetailDTO> {
  const response = await fetch(
    `${API_BASE}/orders/${orderId}/details/${detailId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/calculate`, {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to update order item: ${response.status}`
    );
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Remove an item from order
 */
export async function removeOrderItem(
  orderId: string,
  detailId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/orders/${orderId}/details/${detailId}`,
    const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to remove order item: ${response.status}`
    );
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "in_progress" | "completed" | "cancelled"
): Promise<OrderDTO> {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to update order status: ${response.status}`
    );
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Calculate order total
 */
export async function calculateOrderTotal(orderId: string): Promise<number> {
  const response = await fetch(`${API_BASE}/orders/${orderId}/calculate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to calculate order total: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.total || data.data?.total || 0;
}

/**
 * Update table status
 */
export async function updateTableStatus(
  tableId: string,
  status: "available" | "occupied" | "reserved" | "maintenance"
): Promise<TableDTO> {
  const response = await fetch(`${API_BASE}/tables/${tableId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Failed to update table status: ${response.status}`
    );
  }

  const data = await response.json();
  return data.data || data;
}
