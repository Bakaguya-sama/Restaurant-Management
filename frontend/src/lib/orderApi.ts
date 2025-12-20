// ==================== TYPE DEFINITIONS ====================

export interface OrderItemDTO {
  dish_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface CreateOrderParams {
  order_number: string;
  order_type: 'dine-in-waiter' | 'takeaway-staff';
  order_time: string;
  table_id?: string;
  staff_id?: string;
  notes?: string;
  orderItems: OrderItemDTO[];
}

export interface OrderDetailParams {
  order_id: string;
  dish_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

export interface UpdateOrderDetailStatusParams {
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

export interface OrderResponse {
  success: boolean;
  data: any;
  message: string;
  details?: string;
  insufficientItems?: Array<{
    ingredientName: string;
    required: number;
    available: number;
    unit: string;
  }>;
}

export interface Order {
  _id: string;
  id?: string;
  order_number: string;
  order_type: string;
  order_date: string;
  order_time: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total_amount: number;
  notes?: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail {
  _id: string;
  id?: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

// ==================== API CONFIGURATION ====================

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// ==================== API FUNCTIONS ====================

/**
 * Fetch pending order for a table with status 'pending'
 */
export async function getPendingOrderByTableId(tableId: string): Promise<Order | null> {
  try {
    const response = await fetch(
      `${API_BASE}/orders?table_id=${tableId}&status=pending`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pending order: ${response.statusText}`);
    }

    const data = await response.json();
    // Return first pending order if exists
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching pending order:", error);
    throw error;
  }
}

/**
 * Create a new order with automatic inventory deduction
 */
export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to create order",
      details: data.details,
      insufficientItems: data.insufficientItems,
    };
  }

  return data.data;
}

/**
 * Create order detail for an existing order
 */
export async function createOrderDetail(
  params: OrderDetailParams
): Promise<OrderDetail> {
  const orderId = params.order_id;
  const response = await fetch(`${API_BASE}/orders/${orderId}/details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to create order detail",
      details: data.details,
    };
  }

  return data.data;
}

/**
 * Update order detail status
 */
export async function updateOrderDetailStatus(
  orderId: string,
  detailId: string,
  params: UpdateOrderDetailStatusParams
): Promise<OrderDetail> {
  const response = await fetch(
    `${API_BASE}/orders/${orderId}/details/${detailId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to update order detail status",
    };
  }

  return data.data;
}

/**
 * Update order detail quantity
 */
export async function updateOrderDetailQuantity(
  orderId: string,
  detailId: string,
  quantity: number
): Promise<OrderDetail> {
  const response = await fetch(
    `${API_BASE}/orders/${orderId}/details/${detailId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to update order detail quantity",
    };
  }

  return data.data;
}

/**
 * Patch order detail status (status-only update)
 */
export async function patchOrderDetailStatus(
  orderId: string,
  detailId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
): Promise<OrderDetail> {
  const response = await fetch(
    `${API_BASE}/orders/${orderId}/details/${detailId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to patch order detail status",
    };
  }

  return data.data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to update order status",
    };
  }

  return data.data;
}

/**
 * Patch order status (status-only update)
 */
export async function patchOrderStatus(
  orderId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to patch order status",
    };
  }

  return data.data;
}

/**
 * Get order details for an order
 */
export async function getOrderDetails(orderId: string): Promise<OrderDetail[]> {
  const response = await fetch(
    `${API_BASE}/orders/${orderId}/details`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to fetch order details",
    };
  }
  
  return Array.isArray(data.data) ? data.data : [];
}
export function generateOrderNumber(orderType: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000); // Add 4-digit random number
  const prefix = orderType === 'dine-in-waiter' ? 'DIN' : 'TO';
  return `${prefix}-${timestamp}-${random}`;
}
