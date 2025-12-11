const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  Staff, Customer, Table, Reservation, ReservationDetail, Complaint,
  Ingredient, StockImport, StockImportDetail, Dish, DishIngredient,
  Menu, MenuEntry, Order, OrderDetail, Promotion, Invoice, InvoicePromotion
} = require('../models');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    await connectDB();
    console.log('\n🌱 BẮT ĐẦU SEED DATABASE...\n');
    
    // XÓA DỮ LIỆU CŨ
    console.log('🗑️  Xóa dữ liệu cũ...');
    await Promise.all([
      Staff.deleteMany({}), Customer.deleteMany({}),
      Table.deleteMany({}), Reservation.deleteMany({}), ReservationDetail.deleteMany({}), Complaint.deleteMany({}),
      Ingredient.deleteMany({}), StockImport.deleteMany({}), StockImportDetail.deleteMany({}),
      Dish.deleteMany({}), DishIngredient.deleteMany({}), Menu.deleteMany({}),
      MenuEntry.deleteMany({}), Order.deleteMany({}), OrderDetail.deleteMany({}),
      Promotion.deleteMany({}), Invoice.deleteMany({}), InvoicePromotion.deleteMany({})
    ]);
    console.log('✅ Đã xóa dữ liệu cũ\n');

    const password = await bcrypt.hash('password123', 10);
    
    // ==================== 1. STAFF ====================
    console.log('1/18 👥 Tạo Staff...');
    const staffs = await Staff.insertMany([
      { full_name: 'Nguyễn Văn Hùng', email: 'hung.waiter@restaurant.vn', phone: '0901234567', address: 'TP.HCM', salary: 12000000, role: 'waiter', image_url: '/images/staff/waiter1.jpg', username: 'nguyenvanh', password_hash: password },
      { full_name: 'Trần Thị Mai', email: 'mai.waiter@restaurant.vn', phone: '0901234568', address: 'TP.HCM', salary: 11000000, role: 'waiter', image_url: '/images/staff/waiter2.jpg', username: 'tranthim', password_hash: password },
      { full_name: 'Lê Văn Nam', email: 'nam.cashier@restaurant.vn', phone: '0901234569', address: 'TP.HCM', salary: 10000000, role: 'cashier', image_url: '/images/staff/cashier1.jpg', username: 'levann', password_hash: password },
      { full_name: 'Phạm Thị Lan', email: 'lan.cashier@restaurant.vn', phone: '0901234570', address: 'TP.HCM', salary: 10000000, role: 'cashier', image_url: '/images/staff/cashier2.jpg', username: 'phamthil', password_hash: password },
      { full_name: 'Hoàng Văn Tú', email: 'tu.warehouse@restaurant.vn', phone: '0901234571', address: 'TP.HCM', salary: 13000000, role: 'warehouse', image_url: '/images/staff/warehouse1.jpg', username: 'hoangvant', password_hash: password },
      { full_name: 'Đỗ Văn Minh', email: 'minh.manager@restaurant.vn', phone: '0901234572', address: 'TP.HCM', salary: 25000000, role: 'manager', image_url: '/images/staff/manager1.jpg', department: 'kitchen', access_level: 'senior_manager', username: 'dovanm', password_hash: password },
      { full_name: 'Vũ Thị Hoa', email: 'hoa.manager@restaurant.vn', phone: '0901234573', address: 'TP.HCM', salary: 28000000, role: 'manager', image_url: '/images/staff/manager2.jpg', department: 'operations', access_level: 'director', username: 'vothih', password_hash: password }
    ]);
    console.log(`   ✅ ${staffs.length} staff\n`);

    // ==================== 2. CUSTOMERS ====================
    console.log('2/18 🛒 Tạo Customers...');
    const customers = await Customer.insertMany([
      { full_name: 'Nguyễn Minh Tuấn', email: 'tuan@gmail.com', phone: '0912345678', address: 'Q1, TP.HCM', membership_level: 'gold', points: 1500, total_spent: 8000000, image_url: '/images/customers/customer1.jpg', password_hash: password },
      { full_name: 'Trần Thu Hương', email: 'huong@gmail.com', phone: '0912345679', address: 'Q3, TP.HCM', membership_level: 'silver', points: 800, total_spent: 4000000, image_url: '/images/customers/customer2.jpg', password_hash: password },
      { full_name: 'Lê Quang Huy', email: 'huy@gmail.com', phone: '0912345680', address: 'Q5, TP.HCM', membership_level: 'platinum', points: 3000, total_spent: 15000000, image_url: '/images/customers/customer3.jpg', password_hash: password },
      { full_name: 'Phạm Thị Nga', email: 'nga@gmail.com', phone: '0912345681', address: 'Q10, TP.HCM', membership_level: 'regular', points: 200, total_spent: 1000000, image_url: '/images/customers/customer4.jpg', password_hash: password },
      { full_name: 'Võ Văn Khoa', email: 'khoa@gmail.com', phone: '0912345682', address: 'Q7, TP.HCM', membership_level: 'gold', points: 1200, total_spent: 6500000, image_url: '/images/customers/customer5.jpg', password_hash: password }
    ]);
    console.log(`   ✅ ${customers.length} customers\n`);

    // ==================== 3. TABLES ====================
    console.log('3/18 🪑 Tạo Tables...');
    const tables = await Table.insertMany([
      { table_number: 'T01', capacity: 2, location: 'indoor', status: 'available' },
      { table_number: 'T02', capacity: 4, location: 'indoor', status: 'available' },
      { table_number: 'T03', capacity: 4, location: 'indoor', status: 'occupied' },
      { table_number: 'T04', capacity: 6, location: 'outdoor', status: 'available' },
      { table_number: 'T05', capacity: 8, location: 'vip', status: 'reserved' },
      { table_number: 'T06', capacity: 4, location: 'indoor', status: 'available' },
      { table_number: 'T07', capacity: 2, location: 'outdoor', status: 'available' },
      { table_number: 'T08', capacity: 6, location: 'vip', status: 'available' }
    ]);
    console.log(`   ✅ ${tables.length} tables\n`);

    // ==================== 4. RESERVATIONS ====================
    console.log('4/18 📅 Tạo Reservations...');
    const reservations = await Reservation.insertMany([
      { customer_id: customers[0]._id, staff_id: staffs[0]._id, reservation_date: new Date('2024-12-15'), reservation_time: '19:00', number_of_guests: 6, status: 'confirmed', special_requests: 'Cần ghế em bé' },
      { customer_id: customers[2]._id, staff_id: staffs[1]._id, reservation_date: new Date('2024-12-16'), reservation_time: '20:00', number_of_guests: 8, status: 'pending' },
      { customer_id: customers[1]._id, staff_id: staffs[0]._id, reservation_date: new Date('2024-12-14'), reservation_time: '18:30', number_of_guests: 4, status: 'completed' }
    ]);
    console.log(`   ✅ ${reservations.length} reservations\n`);

    // ==================== 5. RESERVATION DETAILS ====================
    console.log('5/18 📋 Tạo Reservation Details...');
    const reservationDetails = await ReservationDetail.insertMany([
      { reservation_id: reservations[0]._id, table_id: tables[4]._id },
      { reservation_id: reservations[1]._id, table_id: tables[7]._id },
      { reservation_id: reservations[2]._id, table_id: tables[3]._id }
    ]);
    console.log(`   ✅ ${reservationDetails.length} reservation details\n`);

    // ==================== 6. COMPLAINTS ====================
    console.log('6/18 💬 Tạo Complaints...');
    const complaints = await Complaint.insertMany([
      { customer_id: customers[3]._id, subject: 'Món ăn quá mặn', description: 'Món canh chua quá mặn, không ăn được', category: 'food', status: 'resolved', priority: 'high', assigned_to_staff_id: staffs[5]._id, resolution: 'Đã đổi món mới và giảm 50% giá món' },
      { customer_id: customers[1]._id, subject: 'Phục vụ chậm', description: 'Đợi món hơn 40 phút', category: 'service', status: 'in_progress', priority: 'medium', assigned_to_staff_id: staffs[0]._id }
    ]);
    console.log(`   ✅ ${complaints.length} complaints\n`);

    // ==================== 7. INGREDIENTS ====================
    console.log('7/18 🥬 Tạo Ingredients...');
    const ingredients = await Ingredient.insertMany([
      { name: 'Thịt bò Úc', unit: 'kg', quantity_in_stock: 50, minimum_quantity: 20, unit_price: 350000, supplier_name: 'Nhà cung cấp Meat Pro', status: 'available' },
      { name: 'Cá hồi Na Uy', unit: 'kg', quantity_in_stock: 30, minimum_quantity: 10, unit_price: 450000, supplier_name: 'Seafood Vietnam', status: 'available' },
      { name: 'Tôm sú', unit: 'kg', quantity_in_stock: 25, minimum_quantity: 15, unit_price: 280000, supplier_name: 'Seafood Vietnam', status: 'available' },
      { name: 'Rau xà lách', unit: 'kg', quantity_in_stock: 15, minimum_quantity: 10, unit_price: 25000, supplier_name: 'Dalat Farm', status: 'available' },
      { name: 'Cà chua', unit: 'kg', quantity_in_stock: 20, minimum_quantity: 10, unit_price: 30000, supplier_name: 'Dalat Farm', status: 'available' },
      { name: 'Hành tây', unit: 'kg', quantity_in_stock: 18, minimum_quantity: 8, unit_price: 20000, supplier_name: 'Dalat Farm', status: 'available' },
      { name: 'Bơ', unit: 'kg', quantity_in_stock: 10, minimum_quantity: 5, unit_price: 120000, supplier_name: 'Metro', status: 'available' },
      { name: 'Nước mắm', unit: 'l', quantity_in_stock: 20, minimum_quantity: 10, unit_price: 45000, supplier_name: 'Phú Quốc', status: 'available' },
      { name: 'Gạo Japonica', unit: 'kg', quantity_in_stock: 100, minimum_quantity: 50, unit_price: 35000, supplier_name: 'Lộc Trời', status: 'available' },
      { name: 'Dầu ô liu', unit: 'l', quantity_in_stock: 8, minimum_quantity: 5, unit_price: 180000, supplier_name: 'Metro', status: 'low_stock' }
    ]);
    console.log(`   ✅ ${ingredients.length} ingredients\n`);

    // ==================== 8. STOCK IMPORT ====================
    console.log('8/18 📦 Tạo Stock Imports...');
    const stockImports = await StockImport.insertMany([
      { import_number: 'IMP-001', staff_id: staffs[4]._id, import_date: new Date('2024-12-01'), total_cost: 15000000, supplier_name: 'Meat Pro', status: 'completed' },
      { import_number: 'IMP-002', staff_id: staffs[4]._id, import_date: new Date('2024-12-05'), total_cost: 8500000, supplier_name: 'Seafood Vietnam', status: 'completed' }
    ]);
    console.log(`   ✅ ${stockImports.length} stock imports\n`);

    // ==================== 9. STOCK IMPORT DETAILS ====================
    console.log('9/18 📋 Tạo Stock Import Details...');
    const stockImportDetails = await StockImportDetail.insertMany([
      { import_id: stockImports[0]._id, ingredient_id: ingredients[0]._id, quantity: 50, unit_price: 350000, line_total: 17500000 },
      { import_id: stockImports[1]._id, ingredient_id: ingredients[1]._id, quantity: 30, unit_price: 450000, line_total: 13500000 },
      { import_id: stockImports[1]._id, ingredient_id: ingredients[2]._id, quantity: 25, unit_price: 280000, line_total: 7000000 }
    ]);
    console.log(`   ✅ ${stockImportDetails.length} import details\n`);

    // ==================== 10. DISHES ====================
    console.log('10/18 🍽️  Tạo Dishes...');
    const dishes = await Dish.insertMany([
      { name: 'Bò bít tết Úc', description: 'Bò Úc nướng chín vừa, kèm khoai tây chiên và salad', category: 'main_course', price: 350000, preparation_time: 25, is_available: true, calories: 650, image_url: '/images/beef-steak.jpg' },
      { name: 'Cá hồi nướng', description: 'Cá hồi Na Uy nướng chanh bơ, kèm rau củ', category: 'main_course', price: 420000, preparation_time: 30, is_available: true, calories: 580, image_url: '/images/salmon.jpg' },
      { name: 'Tôm sú nướng bơ tỏi', description: 'Tôm sú tươi nướng bơ tỏi thơm phức', category: 'appetizer', price: 280000, preparation_time: 15, is_available: true, calories: 320, image_url: '/images/garlic-shrimp.jpg' },
      { name: 'Salad rau trộn', description: 'Rau xà lách, cà chua, bơ, sốt dầu giấm', category: 'appetizer', price: 85000, preparation_time: 10, is_available: true, calories: 180, image_url: '/images/salad.jpg' },
      { name: 'Phở bò Hà Nội', description: 'Phở bò truyền thống Hà Nội', category: 'main_course', price: 75000, preparation_time: 15, is_available: true, calories: 450, image_url: '/images/pho.jpg' },
      { name: 'Tiramisu', description: 'Bánh Tiramisu Ý nguyên bản', category: 'dessert', price: 65000, preparation_time: 5, is_available: true, calories: 280, image_url: '/images/tiramisu.jpg' },
      { name: 'Nước cam vắt', description: 'Nước cam tươi vắt 100%', category: 'beverage', price: 35000, preparation_time: 5, is_available: true, calories: 110, image_url: '/images/orange-juice.jpg' },
      { name: 'Lẩu Thái hải sản', description: 'Lẩu Thái chua cay với tôm, mực, cá', category: 'special', price: 550000, preparation_time: 35, is_available: true, is_special: true, calories: 720, image_url: '/images/thai-hotpot.jpg' }
    ]);
    console.log(`   ✅ ${dishes.length} dishes\n`);

    // ==================== 11. DISH INGREDIENTS ====================
    console.log('11/18 🥘 Tạo Dish Ingredients...');
    const dishIngredients = await DishIngredient.insertMany([
      { dish_id: dishes[0]._id, ingredient_id: ingredients[0]._id, quantity_required: 0.25, unit: 'kg' },
      { dish_id: dishes[0]._id, ingredient_id: ingredients[3]._id, quantity_required: 0.05, unit: 'kg' },
      { dish_id: dishes[1]._id, ingredient_id: ingredients[1]._id, quantity_required: 0.2, unit: 'kg' },
      { dish_id: dishes[2]._id, ingredient_id: ingredients[2]._id, quantity_required: 0.15, unit: 'kg' },
      { dish_id: dishes[2]._id, ingredient_id: ingredients[6]._id, quantity_required: 0.02, unit: 'kg' },
      { dish_id: dishes[3]._id, ingredient_id: ingredients[3]._id, quantity_required: 0.1, unit: 'kg' },
      { dish_id: dishes[3]._id, ingredient_id: ingredients[4]._id, quantity_required: 0.05, unit: 'kg' }
    ]);
    console.log(`   ✅ ${dishIngredients.length} dish-ingredient links\n`);

    // ==================== 12. MENUS ====================
    console.log('12/18 📖 Tạo Menus...');
    const menus = await Menu.insertMany([
      { name: 'Menu Chính', description: 'Menu hàng ngày', menu_type: 'regular', is_active: true },
      { name: 'Menu Trưa', description: 'Menu ăn trưa đặc biệt', menu_type: 'lunch', is_active: true },
      { name: 'Menu Mùa Đông', description: 'Các món ấm áp mùa đông', menu_type: 'seasonal', is_active: true, valid_from: new Date('2024-12-01'), valid_to: new Date('2025-02-28') }
    ]);
    console.log(`   ✅ ${menus.length} menus\n`);

    // ==================== 13. MENU ENTRIES ====================
    console.log('13/18 📑 Tạo Menu Entries...');
    const menuEntries = await MenuEntry.insertMany([
      { menu_id: menus[0]._id, dish_id: dishes[0]._id, display_order: 1, is_featured: true },
      { menu_id: menus[0]._id, dish_id: dishes[1]._id, display_order: 2, is_featured: true },
      { menu_id: menus[0]._id, dish_id: dishes[2]._id, display_order: 3 },
      { menu_id: menus[0]._id, dish_id: dishes[3]._id, display_order: 4 },
      { menu_id: menus[1]._id, dish_id: dishes[4]._id, display_order: 1, is_featured: true },
      { menu_id: menus[2]._id, dish_id: dishes[7]._id, display_order: 1, is_featured: true }
    ]);
    console.log(`   ✅ ${menuEntries.length} menu entries\n`);

    // ==================== 14. PROMOTIONS ====================
    console.log('14/18 🎁 Tạo Promotions...');
    const promotions = await Promotion.insertMany([
      { name: 'Giảm 20% Tháng 12', description: 'Giảm 20% toàn bộ hóa đơn', promotion_type: 'percentage', discount_value: 20, minimum_order_amount: 500000, promo_code: 'DEC20', start_date: new Date('2024-12-01'), end_date: new Date('2024-12-31'), is_active: true },
      { name: 'Giảm 100k', description: 'Giảm 100,000đ cho hóa đơn trên 1 triệu', promotion_type: 'fixed_amount', discount_value: 100000, minimum_order_amount: 1000000, promo_code: 'SAVE100K', start_date: new Date('2024-12-01'), end_date: new Date('2024-12-31'), is_active: true },
      { name: 'Happy Hour', description: 'Giảm 30% từ 14h-16h', promotion_type: 'percentage', discount_value: 30, minimum_order_amount: 200000, promo_code: 'HAPPY30', start_date: new Date('2024-12-01'), end_date: new Date('2024-12-31'), is_active: true }
    ]);
    console.log(`   ✅ ${promotions.length} promotions\n`);

    // ==================== 15. ORDERS ====================
    console.log('15/18 📝 Tạo Orders...');
    const orders = await Order.insertMany([
      { order_number: 'ORD-001', table_id: tables[2]._id, staff_id: staffs[0]._id, customer_id: customers[0]._id, order_date: new Date(), order_time: '12:30', status: 'served', subtotal: 850000, tax: 85000, total_amount: 935000 },
      { order_number: 'ORD-002', table_id: tables[1]._id, staff_id: staffs[1]._id, customer_id: customers[1]._id, order_date: new Date(), order_time: '13:15', status: 'preparing', subtotal: 495000, tax: 49500, total_amount: 544500 },
      { order_number: 'ORD-003', table_id: tables[0]._id, staff_id: staffs[0]._id, order_date: new Date(), order_time: '14:00', status: 'completed', subtotal: 120000, tax: 12000, total_amount: 132000 }
    ]);
    console.log(`   ✅ ${orders.length} orders\n`);

    // ==================== 16. ORDER DETAILS ====================
    console.log('16/18 🍴 Tạo Order Details...');
    const orderDetails = await OrderDetail.insertMany([
      { order_id: orders[0]._id, dish_id: dishes[0]._id, quantity: 1, unit_price: 350000, line_total: 350000, status: 'served' },
      { order_id: orders[0]._id, dish_id: dishes[1]._id, quantity: 1, unit_price: 420000, line_total: 420000, status: 'served' },
      { order_id: orders[0]._id, dish_id: dishes[6]._id, quantity: 2, unit_price: 35000, line_total: 70000, status: 'served' },
      { order_id: orders[1]._id, dish_id: dishes[4]._id, quantity: 2, unit_price: 75000, line_total: 150000, status: 'preparing' },
      { order_id: orders[1]._id, dish_id: dishes[2]._id, quantity: 1, unit_price: 280000, line_total: 280000, status: 'preparing' },
      { order_id: orders[2]._id, dish_id: dishes[3]._id, quantity: 1, unit_price: 85000, line_total: 85000, status: 'served' },
      { order_id: orders[2]._id, dish_id: dishes[6]._id, quantity: 1, unit_price: 35000, line_total: 35000, status: 'served' }
    ]);
    console.log(`   ✅ ${orderDetails.length} order details\n`);

    // ==================== 17. INVOICES ====================
    console.log('17/18 🧾 Tạo Invoices...');
    const invoices = await Invoice.insertMany([
      { invoice_number: 'INV-001', order_id: orders[0]._id, staff_id: staffs[2]._id, customer_id: customers[0]._id, invoice_date: new Date(), subtotal: 850000, tax: 85000, discount_amount: 170000, total_amount: 765000, payment_method: 'card', payment_status: 'paid', paid_at: new Date() },
      { invoice_number: 'INV-002', order_id: orders[2]._id, staff_id: staffs[3]._id, invoice_date: new Date(), subtotal: 120000, tax: 12000, discount_amount: 0, total_amount: 132000, payment_method: 'cash', payment_status: 'paid', paid_at: new Date() }
    ]);
    console.log(`   ✅ ${invoices.length} invoices\n`);

    // ==================== 18. INVOICE PROMOTIONS ====================
    console.log('18/18 🏷️  Tạo Invoice Promotions...');
    const invoicePromotions = await InvoicePromotion.insertMany([
      { invoice_id: invoices[0]._id, promotion_id: promotions[0]._id, discount_applied: 170000 }
    ]);
    console.log(`   ✅ ${invoicePromotions.length} invoice promotions\n`);

    // TỔNG KẾT
    console.log('\n========================================');
    console.log('✨ SEED DATABASE HOÀN TẤT!');
    console.log('========================================');
    console.log('📊 TỔNG KẾT:');
    console.log(`   1. Staff: ${staffs.length}`);
    console.log(`   2. Customers: ${customers.length}`);
    console.log(`   3. Tables: ${tables.length}`);
    console.log(`   4. Reservations: ${reservations.length}`);
    console.log(`   5. Reservation Details: ${reservationDetails.length}`);
    console.log(`   6. Complaints: ${complaints.length}`);
    console.log(`   7. Ingredients: ${ingredients.length}`);
    console.log(`   8. Stock Imports: ${stockImports.length}`);
    console.log(`   9. Stock Import Details: ${stockImportDetails.length}`);
    console.log(`   10. Dishes: ${dishes.length}`);
    console.log(`   11. Dish Ingredients: ${dishIngredients.length}`);
    console.log(`   12. Menus: ${menus.length}`);
    console.log(`   13. Menu Entries: ${menuEntries.length}`);
    console.log(`   14. Promotions: ${promotions.length}`);
    console.log(`   15. Orders: ${orders.length}`);
    console.log(`   16. Order Details: ${orderDetails.length}`);
    console.log(`   17. Invoices: ${invoices.length}`);
    console.log(`   18. Invoice Promotions: ${invoicePromotions.length}`);
    console.log('========================================');
    console.log('🔑 Thông tin đăng nhập:');
    console.log('   Staff (Waiter): hung.waiter@restaurant.vn / password123');
    console.log('   Staff (Cashier): nam.cashier@restaurant.vn / password123');
    console.log('   Staff (Warehouse): tu.warehouse@restaurant.vn / password123');
    console.log('   Staff (Manager): minh.manager@restaurant.vn / password123');
    console.log('   Customer: tuan@gmail.com / password123');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ LỖI:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Đã đóng kết nối database');
    process.exit(0);
  }
}

seedDatabase();
