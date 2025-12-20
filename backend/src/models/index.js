const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// ==================== USER ====================

const UserSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  date_of_birth: Date,
  image_url: String,
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['waiter', 'cashier', 'manager', 'customer'], 
    required: true 
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {discriminatorKey: 'role', collection: 'users'});

// ==================== STAFF (Discriminator of USER) ====================

const StaffSchema = new Schema({
  hire_date: { type: Date, default: Date.now }
});

// ==================== CUSTOMER (Discriminator of USER) ====================

const CustomerSchema = new Schema({
  membership_level: { type: String, enum: ['regular', 'bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'regular' },
  points: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false }
});

// Create discriminators for User schema
const UserModel = mongoose.model('User', UserSchema);
const StaffModel = UserModel.discriminator('waiter', StaffSchema);
const StaffModelCashier = UserModel.discriminator('cashier', StaffSchema);
const StaffModelManager = UserModel.discriminator('manager', StaffSchema);
const CustomerModel = UserModel.discriminator('customer', CustomerSchema);

// Legacy Staff and Customer models for backward compatibility (point to User)
// These collections will now use the 'users' collection with role discrimination


// ==================== TABLE ====================
const FloorSchema = new Schema({
  floor_name: { type: String, required: true, unique: true },
  floor_number: { type: Number, required: true, unique: true },
  description: String,
  created_at: { type: Date, default: Date.now }
});

const LocationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  floor_id: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
  description: String,
  created_at: { type: Date, default: Date.now }
});

const TableSchema = new Schema({
  table_number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  location_id: { type: Schema.Types.ObjectId, ref: 'Location' },
  //floor: { type: Number, default: 1 },
  status: { type: String, enum: ['free', 'occupied', 'reserved', 'dirty', 'broken'], default: 'free' },
  created_at: { type: Date, default: Date.now },
  brokenReason: String
});

// ==================== RESERVATION ====================

const ReservationSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  //staff_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Waiter
  reservation_date: { type: Date, required: true },
  reservation_time: { type: String, required: true }, // "18:30"
  number_of_guests: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  special_requests: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const ReservationDetailSchema = new Schema({
  reservation_id: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true },
  table_id: { type: Schema.Types.ObjectId, ref: 'Table', required: true }
});

// ==================== COMPLAINT ====================

const ComplaintSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['food', 'service', 'cleanliness', 'other'], default: 'other' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assigned_to_staff_id: { type: Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  created_at: { type: Date, default: Date.now },
  resolved_at: Date
});

// ==================== SUPPLIES ====================
const SupplierSchema = new Schema({
  name: { type: String, required: true },
  phone_contact: String,
  address: String,
});

const Supplier = mongoose.model('Supplier', SupplierSchema);

const IngredientSchema = new Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true }, // kg, g, l, ml, pieces
  quantity_in_stock: { type: Number, default: 0 },
  minimum_quantity: { type: Number, default: 0 },
  unit_price: { type: Number, required: true },
  supplier_name: String,
  supplier_contact: String,
  expiry_date: Date,
  stock_status: { type: String, enum: ['available', 'low_stock', 'out_of_stock'], default: 'available' },
  expiry_status: { type: String, enum: ['valid', 'near_expiry', 'expired'], default: 'valid' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// ==================== STOCK IMPORT ====================

const StockImportSchema = new Schema({
  import_number: { type: String, required: true, unique: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'User' }, // WarehouseStaff (optional)
  supplier_id: { type: Schema.Types.ObjectId, ref: 'Supplier' },
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

// ==================== STOCK EXPORT ====================

const StockExportSchema = new Schema({
  export_number: { type: String, required: true, unique: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'User' },
  export_date: { type: Date, default: Date.now },
  total_cost: { type: Number, default: 0 },
  notes: String,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

const StockExportDetailSchema = new Schema({
  export_id: { type: Schema.Types.ObjectId, ref: 'StockExport', required: true },
  ingredient_id: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  line_total: { type: Number, required: true }
});

// ==================== DISH ====================

const DishSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['appetizer', 'main_course', 'dessert', 'beverage'], 
    required: true 
  },
  price: { type: Number, required: true },
  image_url: String,

  is_available: { type: Boolean, default: true },

  manual_unavailable_reason: { type: String }, // e.g. "Tạm ngưng phục vụ"
  manual_unavailable_by: { type: Schema.Types.ObjectId, ref: 'User' },
  manual_unavailable_at: { type: Date },
  //is_special: { type: Boolean, default: false },
  //calories: Number,
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

// const MenuSchema = new Schema({
//   name: { type: String, required: true },
//   description: String,
//   menu_type: { type: String, enum: ['regular', 'seasonal', 'special', 'lunch', 'dinner'], default: 'regular' },
//   is_active: { type: Boolean, default: true },
//   valid_from: Date,
//   valid_to: Date,
//   created_at: { type: Date, default: Date.now }
// });

// // MenuEntry - Junction table
// const MenuEntrySchema = new Schema({
//   menu_id: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
//   dish_id: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
//   display_order: { type: Number, default: 0 },
//   is_featured: { type: Boolean, default: false }
// });

// ==================== ORDER ====================

const OrderSchema = new Schema({
  order_number: { type: String, required: true, unique: true },
  order_type: { type: String, default: false },
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
}, {discriminatorKey: 'order_type', collection: 'orders'});

//Add discriminators for different order types

const DineInByCustomer = OrderSchema.discriminator('dine-in-customer', new Schema({
  table_id: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  customer_id: { type: Schema.Types.ObjectId, ref: 'User'}
}));

const TakeawayByCustomer = OrderSchema.discriminator('takeaway-customer', new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User'}
}));

const DineInByWaiter = OrderSchema.discriminator('dine-in-waiter', new Schema({
  table_id: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Waiter
}));

const TakeawayByStaff = OrderSchema.discriminator('takeaway-staff', new Schema({
  staff_id: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Waiter
}));


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
  //description: String,
  promotion_type: { type: String, enum: ['percentage', 'fixed_amount'], default: 'percentage' }, // 'buy_x_get_y'
  discount_value: { type: Number, required: true }, // 20 for 20% or 50000 for 50k VND depending on type
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
  staff_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Cashier
  customer_id: { type: Schema.Types.ObjectId, ref: 'User' },
  invoice_date: { type: Date, default: Date.now },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  total_amount: { type: Number, required: true },
  payment_method: { type: String, enum: ['cash', 'card', 'transfer', 'e-wallet'] }, // Optional - set by cashier at payment time
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
// ==================== VIOLATIONS ====================
const ViolationSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  violation_date: { type: Date, default: Date.now },
  violation_type: { type: String, enum: ['no_show', 'late_cancel', 'property_damage', 'other'], default: 'no_show' },
  // resolution: String,
  // resolved_at: Date,
});
// ==================== RATINGS ====================
const RatingSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  rating_date: { type: Date, default: Date.now },
  score: { type: Number, required: true, min: 1, max: 5 },
});

//Replies to ratings
const RatingReplySchema = new Schema({
  rating_id: { type: Schema.Types.ObjectId, ref: 'Rating', required: true },
  staff_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reply_text: { type: String, required: true },
  reply_date: { type: Date, default: Date.now },
});

// ==================== EXPORTS ====================
const User = UserModel;
const Staff = StaffModel;
const Customer = CustomerModel;
const Floor = mongoose.model('Floor', FloorSchema);
const Location = mongoose.model('Location', LocationSchema);
const Table = mongoose.model('Table', TableSchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);
const ReservationDetail = mongoose.model('ReservationDetail', ReservationDetailSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);
const Ingredient = mongoose.model('Ingredient', IngredientSchema);
const StockImport = mongoose.model('StockImport', StockImportSchema);
const StockImportDetail = mongoose.model('StockImportDetail', StockImportDetailSchema);
const Dish = mongoose.model('Dish', DishSchema);
const DishIngredient = mongoose.model('DishIngredient', DishIngredientSchema);
// const Menu = mongoose.model('Menu', MenuSchema);
// const MenuEntry = mongoose.model('MenuEntry', MenuEntrySchema);
const Order = mongoose.model('Order', OrderSchema);
const OrderDetail = mongoose.model('OrderDetail', OrderDetailSchema);
const Promotion = mongoose.model('Promotion', PromotionSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const InvoicePromotion = mongoose.model('InvoicePromotion', InvoicePromotionSchema);
const Violation = mongoose.model('Violation', ViolationSchema);
const Rating = mongoose.model('Rating', RatingSchema);
const RatingReply = mongoose.model('RatingReply', RatingReplySchema);

const StockExport = mongoose.model('StockExport', StockExportSchema);
const StockExportDetail = mongoose.model('StockExportDetail', StockExportDetailSchema);

// Supplier model
// (exported below)

module.exports = {
  User,
  Staff: StaffModel,
  StaffWaiter: StaffModel,
  StaffCashier: StaffModelCashier,
  StaffManager: StaffModelManager,
  Customer: CustomerModel,
  Supplier,
  Floor,
  Location,
  Table,
  Reservation,
  ReservationDetail,
  Complaint,
  Ingredient,
  StockImport,
  StockImportDetail,
  Dish,
  DishIngredient,
  Order,
  OrderDetail,
  Promotion,
  Invoice,
  InvoicePromotion,
  Violation,
  Rating,
  RatingReply,
  StockExport,
  StockExportDetail
};

