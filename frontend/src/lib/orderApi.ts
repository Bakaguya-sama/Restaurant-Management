// ==================== TYPE DEFINITIONS ====================

import { getApiBaseUrl } from "./apiConfig";

export interface OrderItemDTO {
  dish_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface CreateOrderParams {
  order_number: string;
  order_type: 'dine-in-customer' | 'takeaway-customer' | 'dine-in-waiter' | 'takeaway-staff';
  order_time: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  notes?: string;
  orderItems?: OrderItemDTO[];
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

// API base URL is now dynamically determined from apiConfig
// Falls back to localhost:5000 if not configured

// ==================== API FUNCTIONS ====================


export async function getPendingOrderByTableId(tableId: string): Promise<Order | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/orders?table_id=${tableId}&status=pending`,
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
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching pending order:", error);
    throw error;
  }
}


export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.data) {
      return data.data;
    }
    throw new Error("Order not found");
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}


export async function getPendingTakeawayOrders(): Promise<Order[]> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/orders?order_type=takeaway-staff&status=pending`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pending takeaway orders: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching pending takeaway orders:", error);
    throw error;
  }
}


export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const response = await fetch(`${getApiBaseUrl()}/orders`, {
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


export async function createOrderDetail(
  params: OrderDetailParams
): Promise<OrderDetail> {
  const orderId = params.order_id;
  const response = await fetch(`${getApiBaseUrl()}/orders/${orderId}/details`, {
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


export async function updateOrderDetailStatus(
  orderId: string,
  detailId: string,
  params: UpdateOrderDetailStatusParams
): Promise<OrderDetail> {
  const response = await fetch(
    `${getApiBaseUrl()}/orders/${orderId}/details/${detailId}`,
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


export async function updateOrderDetailQuantity(
  orderId: string,
  detailId: string,
  quantity: number
): Promise<OrderDetail> {
  const response = await fetch(
    `${getApiBaseUrl()}/orders/${orderId}/details/${detailId}`,
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


export async function updateOrderDetailNotes(
  orderId: string,
  detailId: string,
  special_instructions: string,
  quantity?: number
): Promise<OrderDetail> {
  const body: any = { special_instructions };
  if (quantity !== undefined) {
    body.quantity = quantity;
  }
  
  const response = await fetch(
    `${getApiBaseUrl()}/orders/${orderId}/details/${detailId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Failed to update order detail notes",
    };
  }

  return data.data;
}


export async function patchOrderDetailStatus(
  orderId: string,
  detailId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
): Promise<OrderDetail> {
  const response = await fetch(
    `${getApiBaseUrl()}/orders/${orderId}/details/${detailId}/status`,
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


export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
): Promise<Order> {
  const response = await fetch(`${getApiBaseUrl()}/orders/${orderId}`, {
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


export async function patchOrderStatus(
  orderId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
): Promise<Order> {
  const response = await fetch(`${getApiBaseUrl()}/orders/${orderId}/status`, {
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


export async function getOrderDetails(orderId: string): Promise<OrderDetail[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/orders/${orderId}/details`,
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
  const random = Math.floor(Math.random() * 10000); 
  const prefix = orderType === 'dine-in-waiter' ? 'DIN' : 'TO';
  return `${prefix}-${timestamp}-${random}`;
}


