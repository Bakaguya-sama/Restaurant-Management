// ==================== TYPE DEFINITIONS ====================

export interface OrderItemDTO {
  dish_id: string;
  quantity: number;
  notes?: string;
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

// ==================== API CONFIGURATION ====================

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5001/api/v1";

// ==================== API FUNCTIONS ====================

/**
 * Create a new order with automatic inventory deduction
 */
export async function createOrder(params: CreateOrderParams): Promise<OrderResponse> {
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

  return data;
}

/**
 * Generate unique order number with random suffix to avoid collision
 */
export function generateOrderNumber(orderType: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000); // Add 4-digit random number
  const prefix = orderType === 'dine-in-waiter' ? 'DIN' : 'TO';
  return `${prefix}-${timestamp}-${random}`;
}
