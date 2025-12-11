const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ==================== STAFF & MANAGER ====================

const StaffSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  hire_date: { type: Date, default: Date.now },
  salary: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
  role: { 
    type: String, 
    enum: ['service', 'cashier', 'warehouse', 'chef'], 
    required: true 
  },
  // For authentication
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const ManagerSchema = new Schema({
  staff_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  department: { type: String, enum: ['operations', 'kitchen', 'service', 'admin'] },
  access_level: { type: String, enum: ['manager', 'senior_manager', 'director'], default: 'manager' },
  created_at: { type: Date, default: Date.now }
});

// ==================== CUSTOMER ====================

const CustomerSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  membership_level: { type: String, enum: ['regular', 'silver', 'gold', 'platinum'], default: 'regular' },
  points: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// ==================== TABLE ====================

const TableSchema = new Schema({
  table_number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  location: { type: String, enum: ['indoor', 'outdoor', 'vip'], default: 'indoor' },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'maintenance'], default: 'available' },
  created_at: { type: Date, default: Date.now }
});

// ==================== RESERVATION ====================

const ReservationSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }, // ServiceStaff
  table_id: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  reservation_date: { type: Date, required: true },
  reservation_time: { type: String, required: true }, // "18:30"
  number_of_guests: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  special_requests: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// ==================== COMPLAINT ====================

const ComplaintSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['food', 'service', 'cleanliness', 'other'], default: 'other' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assigned_to_staff_id: { type: Schema.Types.ObjectId, ref: 'Staff' },
  resolution: String,
  created_at: { type: Date, default: Date.now },
  resolved_at: Date
});

// ==================== INGREDIENT ====================

const IngredientSchema = new Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true }, // kg, g, l, ml, pieces
  quantity_in_stock: { type: Number, default: 0 },
  minimum_quantity: { type: Number, default: 0 },
  unit_price: { type: Number, required: true },
  supplier_name: String,
  supplier_contact: String,
  expiry_date: Date,
  status: { type: String, enum: ['available', 'low_stock', 'out_of_stock'], default: 'available' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// ==================== STOCK IMPORT ====================

const StockImportSchema = new Schema({
  import_number: { type: String, required: true, unique: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }, // WarehouseStaff
  import_date: { type: Date, default: Date.now },
  total_cost: { type: Number, default: 0 },
  supplier_name: String,
  notes: String,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

const StockImportDetailSchema = new Schema({
  import_id: { type: Schema.Types.ObjectId, ref: 'StockImport', required: true },
  ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  line_total: { type: Number, required: true },
  expiry_date: Date
});

// ==================== DISH ====================

const DishSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'special'], 
    required: true 
  },
  price: { type: Number, required: true },
  image_url: String,
  preparation_time: { type: Number, default: 15 }, // minutes
  is_available: { type: Boolean, default: true },
  is_special: { type: Boolean, default: false },
  calories: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// DishIngredient - Junction table
const DishIngredientSchema = new Schema({
  dish_id: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
  ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity_required: { type: Number, required: true },
  unit: { type: String, required: true }
});

// ==================== MENU ====================

const MenuSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  menu_type: { type: String, enum: ['regular', 'seasonal', 'special', 'lunch', 'dinner'], default: 'regular' },
  is_active: { type: Boolean, default: true },
  valid_from: Date,
  valid_to: Date,
  created_at: { type: Date, default: Date.now }
});

// MenuEntry - Junction table
const MenuEntrySchema = new Schema({
  menu_id: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  dish_id: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
  display_order: { type: Number, default: 0 },
  is_featured: { type: Boolean, default: false }
});

// ==================== ORDER ====================

const OrderSchema = new Schema({
  order_number: { type: String, required: true, unique: true },
  table_id: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }, // ServiceStaff
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer' },
  order_date: { type: Date, default: Date.now },
  order_time: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const OrderDetailSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  dish_id: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  line_total: { type: Number, required: true },
  special_instructions: String,
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending' }
});

// ==================== PROMOTION ====================

const PromotionSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  promotion_type: { type: String, enum: ['percentage', 'fixed_amount', 'buy_x_get_y'], default: 'percentage' },
  discount_value: { type: Number, required: true }, // 20 for 20% or 50000 for 50k VND
  minimum_order_amount: { type: Number, default: 0 },
  promo_code: { type: String, unique: true, sparse: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
  max_uses: { type: Number, default: -1 }, // -1 = unlimited
  current_uses: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

// ==================== INVOICE ====================

const InvoiceSchema = new Schema({
  invoice_number: { type: String, required: true, unique: true },
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }, // Cashier
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer' },
  invoice_date: { type: Date, default: Date.now },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  total_amount: { type: Number, required: true },
  payment_method: { type: String, enum: ['cash', 'card', 'transfer', 'e-wallet'], required: true },
  payment_status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paid_at: Date,
  created_at: { type: Date, default: Date.now }
});

// InvoicePromotion - Junction table
const InvoicePromotionSchema = new Schema({
  invoice_id: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  promotion_id: { type: Schema.Types.ObjectId, ref: 'Promotion', required: true },
  discount_applied: { type: Number, required: true }
});

// ==================== INDEXES ====================

StaffSchema.index({ email: 1 });
CustomerSchema.index({ email: 1 });
OrderSchema.index({ order_number: 1 });
InvoiceSchema.index({ invoice_number: 1 });

// ==================== EXPORTS ====================

const Staff = mongoose.model('Staff', StaffSchema);
const Manager = mongoose.model('Manager', ManagerSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Table = mongoose.model('Table', TableSchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);
const Ingredient = mongoose.model('Ingredient', IngredientSchema);
const StockImport = mongoose.model('StockImport', StockImportSchema);
const StockImportDetail = mongoose.model('StockImportDetail', StockImportDetailSchema);
const Dish = mongoose.model('Dish', DishSchema);
const DishIngredient = mongoose.model('DishIngredient', DishIngredientSchema);
const Menu = mongoose.model('Menu', MenuSchema);
const MenuEntry = mongoose.model('MenuEntry', MenuEntrySchema);
const Order = mongoose.model('Order', OrderSchema);
const OrderDetail = mongoose.model('OrderDetail', OrderDetailSchema);
const Promotion = mongoose.model('Promotion', PromotionSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const InvoicePromotion = mongoose.model('InvoicePromotion', InvoicePromotionSchema);

module.exports = {
  Staff,
  Manager,
  Customer,
  Table,
  Reservation,
  Complaint,
  Ingredient,
  StockImport,
  StockImportDetail,
  Dish,
  DishIngredient,
  Menu,
  MenuEntry,
  Order,
  OrderDetail,
  Promotion,
  Invoice,
  InvoicePromotion
};
