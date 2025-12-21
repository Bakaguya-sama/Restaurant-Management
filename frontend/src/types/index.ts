// User Types
export type UserRole = "customer" | "manager" | "cashier" | "waiter";
export type StaffRole = "waiter" | "cashier" | "manager";
export type MembershipLevel = "regular" | "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  date_of_birth?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Staff extends User {
  role: StaffRole;
  hire_date?: string;
  is_active: boolean;
  username: string;
}

export interface Customer extends User {
  membership_level: MembershipLevel;
  points: number;
  total_spent: number;
  isBanned: boolean;
}

// Table Types
export type TableStatus = "free" | "occupied" | "reserved" | "dirty" | "broken";

export interface Table {
  id: string;
  table_number: string;
  location_id: string;
  capacity: number;
  status: TableStatus;
  floor?: string;
  brokenReason?: string;
  created_at?: string;
}

// Location/Area Management Types
export interface Location {
  id: string;
  name: string;
  floor_id: string;
  description?: string;
  //capacity?: number; // Total capacity for this location
  createdAt?: string;
}

export interface Floor {
  id: string;
  floor_name: string;
  floor_number: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Menu Types
export interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  is_available: boolean;
  createdAt?: string;
  updatedAt?: string;
  manual_unavailable_reason?: string;
  manual_unavailable_at?: string;
  manual_unavailable_by?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity_in_stock: number;
  minimum_quantity: number;
  unit_price: number;
  supplier_name: string;
  supplier_contact: string;
  expiry_date?: string;
  stock_status: string;
  expiry_status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DishIngredient {
  id: string;
  dish_id: string;
  ingredient_id: string;
  quantity_required: string;
  unit: string;
}

export interface OrderItem {
  id: string;
  dish_id: string;
  quantity: number;
  notes?: string;
  status: "pending" | "cooking" | "served";
}

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tableId: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  preOrders?: OrderItem[];
  depositAmount: number;
  depositPaid: boolean;
  status:
    | "pending"
    | "confirmed"
    | "checked-in"
    | "completed"
    | "cancelled"
    | "no-show";
}

// Invoice Types
export interface Invoice {
  id: string;
  tableId?: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  promotionCode?: string;
  pointsUsed?: number;
  voucherCode?: string;
  voucherAmount?: number;
  paymentMethod?: "cash" | "card" | "wallet" | "online";
  paymentRequestedAt?: string;
  status: "pending" | "paid" | "cancelled" | "payment-requested";
  createdAt: string;
  paidAt?: string;
  customerSelectedVoucher?: boolean;
  customerSelectedPoints?: number;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  ingredientId: string; // The actual ingredient ID for backend operations
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  supplierId?: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

// Promotion Types
export interface Promotion {
  id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  promotionQuantity?: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

// Violation Types
export interface Violation {
  id: string;
  customerId: string;
  type: "no-show" | "late-cancel" | "damage";
  description: string;
  date: string;
}

// Membership Types
export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  image?: string;
}

export interface PointHistory {
  id: string;
  type: "earned" | "redeemed" | "expired";
  amount: number;
  description: string;
  date: string;
  invoiceId?: string;
}

export interface VoucherHistory {
  id: string;
  voucherCode: string;
  voucherName: string;
  discountAmount: number;
  usedAt: string;
  invoiceId: string;
}
