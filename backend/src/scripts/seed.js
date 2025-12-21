const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  User, StaffWaiter, StaffCashier, StaffManager, Customer, Floor, Location, Table, Reservation, ReservationDetail, Complaint,
  Supplier, Ingredient, StockImport, StockImportDetail, Dish, DishIngredient,
  StockExport, StockExportDetail,
  Order, OrderDetail, Promotion, Invoice, InvoicePromotion,
  Violation, Rating, RatingReply
} = require('../models');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Connection Error:', error.message);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    await connectDB();
    console.log('\nBẮT ĐẦU SEED DATABASE...\n');
    
    // XÓA DỮ LIỆU CŨ
    console.log('Xóa dữ liệu cũ...');
    // Ensure all models are loaded; fail fast if any missing
    const modelsToCheck = {
      User, StaffWaiter, StaffCashier, StaffManager, Customer, Floor, Location, Table, Reservation, ReservationDetail, Complaint,
      Supplier, Ingredient, StockImport, StockImportDetail, StockExport, StockExportDetail, Dish, DishIngredient,
      Order, OrderDetail, Promotion, Invoice, InvoicePromotion,
      Violation, Rating, RatingReply
    };
    const missing = Object.entries(modelsToCheck).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) throw new Error(`Missing model(s): ${missing.join(', ')}`);
    await Promise.all([
      User.deleteMany({}),
      Floor.deleteMany({}), Location.deleteMany({}), Table.deleteMany({}), 
      Reservation.deleteMany({}), ReservationDetail.deleteMany({}), Complaint.deleteMany({}),
      Supplier.deleteMany({}),
      Ingredient.deleteMany({}), StockImport.deleteMany({}), StockImportDetail.deleteMany({}), StockExport.deleteMany({}), StockExportDetail.deleteMany({}),
      Dish.deleteMany({}), DishIngredient.deleteMany({}),
      Order.deleteMany({}), OrderDetail.deleteMany({}),
      Promotion.deleteMany({}), Invoice.deleteMany({}), InvoicePromotion.deleteMany({}),
      Violation.deleteMany({}), Rating.deleteMany({}), RatingReply.deleteMany({})
    ]);
    console.log('Đã xóa dữ liệu cũ\n');

    const password = await bcrypt.hash('password123', 10);
    
    // ==================== 1. STAFF ====================
    console.log('1/24 Tạo Staff...');
    const waiterData = [
      { 
        full_name: 'Nguyễn Văn Hùng', 
        email: 'hung.waiter@restaurant.vn', 
        phone: '0901234567', 
        address: '123 Đường Cách Mạng Tháng 8, Q.1, TP.HCM',
        date_of_birth: new Date('1995-05-15'),
        hire_date: new Date('2022-03-10'),
        role: 'waiter', 
        image_url: '/images/staff/waiter1.jpg', 
        username: 'hung.waiter', 
        password_hash: password,
        is_active: true
      },
      { 
        full_name: 'Trần Thị Mai', 
        email: 'mai.waiter@restaurant.vn', 
        phone: '0901234568', 
        address: '456 Đường Lê Lợi, Q.1, TP.HCM',
        date_of_birth: new Date('1998-08-22'),
        hire_date: new Date('2023-01-15'),
        role: 'waiter', 
        image_url: '/images/staff/waiter2.jpg', 
        username: 'mai.waiter', 
        password_hash: password,
        is_active: true
      }
    ];
    
    const cashierData = [
      { 
        full_name: 'Lê Văn Nam', 
        email: 'nam.cashier@restaurant.vn', 
        phone: '0901234569', 
        address: '789 Đường Nguyễn Huệ, Q.1, TP.HCM',
        date_of_birth: new Date('1992-12-08'),
        hire_date: new Date('2021-06-20'),
        role: 'cashier', 
        image_url: '/images/staff/cashier1.jpg', 
        username: 'nam.cashier', 
        password_hash: password,
        is_active: true
      },
      { 
        full_name: 'Phạm Thị Lan', 
        email: 'lan.cashier@restaurant.vn', 
        phone: '0901234570', 
        address: '321 Đường Pasteur, Q.1, TP.HCM',
        date_of_birth: new Date('1996-03-18'),
        hire_date: new Date('2022-09-05'),
        role: 'cashier', 
        image_url: '/images/staff/cashier2.jpg', 
        username: 'lan.cashier', 
        password_hash: password,
        is_active: true
      }
    ];
    
    const managerData = [
      { 
        full_name: 'Đỗ Văn Minh', 
        email: 'minh.manager@restaurant.vn', 
        phone: '0901234571', 
        address: '654 Đường Võ Văn Tần, Q.3, TP.HCM',
        date_of_birth: new Date('1988-07-25'),
        hire_date: new Date('2020-01-10'),
        role: 'manager', 
        image_url: '/images/staff/manager1.jpg', 
        username: 'minh.manager', 
        password_hash: password,
        is_active: true
      },
      { 
        full_name: 'Vũ Thị Hoa', 
        email: 'hoa.manager@restaurant.vn', 
        phone: '0901234572', 
        address: '987 Đường Trần Quốc Thảo, Q.3, TP.HCM',
        date_of_birth: new Date('1990-11-02'),
        hire_date: new Date('2019-05-15'),
        role: 'manager', 
        image_url: '/images/staff/manager2.jpg', 
        username: 'hoa.manager', 
        password_hash: password,
        is_active: true
      }
    ];
    
    const waiters = await StaffWaiter.insertMany(waiterData);
    const cashiers = await StaffCashier.insertMany(cashierData);
    const managers = await StaffManager.insertMany(managerData);
    const staffs = [...waiters, ...cashiers, ...managers];
    console.log(`   OK ${staffs.length} staff\n`);

    // ==================== 2. CUSTOMERS ====================
    console.log('2/24 Tạo Customers...');
    const customers = await Customer.insertMany([
      { 
        full_name: 'Nguyễn Minh Tuấn', 
        email: 'tuan.nguyen@gmail.com', 
        phone: '0912345678', 
        address: '100 Đường Đông Khởi, Q.1, TP.HCM',
        date_of_birth: new Date('1990-03-10'),
        membership_level: 'diamond', 
        points: 5000, 
        total_spent: 50000000, 
        image_url: '/images/customers/customer1.jpg',
        role: 'customer',
        username: 'tuan.customer',
        password_hash: password,
        is_active: true,
        isBanned: false
      },
      { 
        full_name: 'Trần Thu Hương', 
        email: 'huong.tran@gmail.com', 
        phone: '0912345679', 
        address: '200 Đường Hàm Nghi, Q.1, TP.HCM',
        date_of_birth: new Date('1992-07-22'),
        membership_level: 'platinum', 
        points: 3000, 
        total_spent: 30000000, 
        image_url: '/images/customers/customer2.jpg',
        role: 'customer',
        username: 'huong.customer',
        password_hash: password,
        is_active: true,
        isBanned: false
      },
      { 
        full_name: 'Lê Quang Huy', 
        email: 'huy.le@gmail.com', 
        phone: '0912345680', 
        address: '300 Đường Tôn Đức Thắng, Q.1, TP.HCM',
        date_of_birth: new Date('1988-11-14'),
        membership_level: 'gold', 
        points: 1800, 
        total_spent: 15000000, 
        image_url: '/images/customers/customer3.jpg',
        role: 'customer',
        username: 'huy.customer',
        password_hash: password,
        is_active: true,
        isBanned: false
      },
      { 
        full_name: 'Phạm Thị Nga', 
        email: 'nga.pham@gmail.com', 
        phone: '0912345681', 
        address: '400 Đường Ngô Đức Kế, Q.1, TP.HCM',
        date_of_birth: new Date('1995-05-30'),
        membership_level: 'silver', 
        points: 800, 
        total_spent: 5000000, 
        image_url: '/images/customers/customer4.jpg',
        role: 'customer',
        username: 'nga.customer',
        password_hash: password,
        is_active: true,
        isBanned: false
      },
      { 
        full_name: 'Võ Văn Khoa', 
        email: 'khoa.vo@gmail.com', 
        phone: '0912345682', 
        address: '500 Đường Trần Hưng Đạo, Q.5, TP.HCM',
        date_of_birth: new Date('1993-09-18'),
        membership_level: 'bronze', 
        points: 300, 
        total_spent: 2000000, 
        image_url: '/images/customers/customer5.jpg',
        role: 'customer',
        username: 'khoa.customer',
        password_hash: password,
        is_active: true,
        isBanned: false
      },
      {
        full_name: 'Hoàng Văn Sơn',
        email: 'son.hoang@gmail.com',
        phone: '0912345683',
        address: '600 Đường Ba Tháng Hai, Q.10, TP.HCM',
        date_of_birth: new Date('1994-12-12'),
        membership_level: 'regular',
        points: 50,
        total_spent: 500000,
        image_url: '/images/customers/customer6.jpg',
        role: 'customer',
        username: 'son.customer',
        password_hash: password,
        is_active: true,
        isBanned: false
      }
    ]);
    console.log(`   OK ${customers.length} customers\n`);

    // ==================== 3. FLOORS & LOCATIONS ====================
    console.log('3/24 Tạo Floors...');
    const floors = await Floor.insertMany([
      { floor_name: 'Tầng 1 - Khu trong nhà', floor_number: 1, description: 'Khu vực ăn trong nhà' },
      { floor_name: 'Tầng 2 - VIP', floor_number: 2, description: 'Khu vực VIP riêng tư' }
    ]);
    console.log(`   OK ${floors.length} floors\n`);

    console.log('4/24 Tạo Locations...');
    const locations = await Location.insertMany([
      { name: 'Trong nhà phía trước', floor_id: floors[0]._id, description: 'Phía trước cửa chính' },
      { name: 'Trong nhà phía sau', floor_id: floors[0]._id, description: 'Phía sau nhà hàng' },
      { name: 'Sân ngoài trời', floor_id: floors[0]._id, description: 'Bàn ngoài trời' },
      { name: 'Phòng VIP A', floor_id: floors[1]._id, description: 'Phòng riêng VIP A' },
      { name: 'Phòng VIP B', floor_id: floors[1]._id, description: 'Phòng riêng VIP B' }
    ]);
    console.log(`   OK ${locations.length} locations\n`);

    // ==================== 5. TABLES ====================
    console.log('5/24 Tạo Tables...');
    const tables = await Table.insertMany([
      { table_number: 'T01', capacity: 2, location_id: locations[0]._id, status: 'free' },
      { table_number: 'T02', capacity: 4, location_id: locations[0]._id, status: 'free' },
      { table_number: 'T03', capacity: 4, location_id: locations[0]._id, status: 'occupied' },
      { table_number: 'T04', capacity: 6, location_id: locations[1]._id, status: 'free' },
      { table_number: 'T05', capacity: 8, location_id: locations[3]._id, status: 'occupied' },
      { table_number: 'T06', capacity: 4, location_id: locations[1]._id, status: 'free' },
      { table_number: 'T07', capacity: 2, location_id: locations[2]._id, status: 'free' },
      { table_number: 'T08', capacity: 6, location_id: locations[4]._id, status: 'free' },
      { table_number: 'T09', capacity: 4, location_id: locations[0]._id, status: 'dirty' },
      { table_number: 'T10', capacity: 10, location_id: locations[3]._id, status: 'free' },
      { table_number: 'T11', capacity: 4, location_id: locations[0]._id, status: 'occupied' },
      { table_number: 'T12', capacity: 2, location_id: locations[1]._id, status: 'occupied' },
      { table_number: 'T13', capacity: 6, location_id: locations[0]._id, status: 'occupied' }
    ]);
    console.log(`   OK ${tables.length} tables\n`);

    // ==================== 6. RESERVATIONS ====================
    console.log('6/24 Tạo Reservations...');
    const reservations = await Reservation.insertMany([
      { 
        customer_id: customers[0]._id, 
        reservation_date: new Date('2025-12-15'), 
        reservation_time: '19:00',
        reservation_checkout_time: '21:00',
        number_of_guests: 6,
        deposit_amount: '200000',
        status: 'confirmed', 
        special_requests: 'Trang trí bàn sinh nhật, không có cà chua' 
      },
      { 
        customer_id: customers[2]._id, 
        reservation_date: new Date('2025-12-16'), 
        reservation_time: '20:00',
        reservation_checkout_time: '22:00',
        number_of_guests: 8,
        deposit_amount: '200000',
        status: 'pending',
        special_requests: 'Bàn yên tĩnh, có đèn nến'
      },
      { 
        customer_id: customers[1]._id, 
        reservation_date: new Date('2025-12-14'), 
        reservation_time: '18:30',
        reservation_checkout_time: '20:30',
        number_of_guests: 4,
        deposit_amount: '200000',
        status: 'completed',
        special_requests: 'Menu vegetarian'
      },
      { 
        customer_id: customers[4]._id, 
        reservation_date: new Date('2025-12-18'), 
        reservation_time: '12:00',
        reservation_checkout_time: '14:00',
        number_of_guests: 2,
        deposit_amount: '200000',
        status: 'confirmed'
      }
    ]);
    console.log(`   OK ${reservations.length} reservations\n`);

    // ==================== 7. RESERVATION DETAILS ====================
    console.log('7/24 Tạo Reservation Details...');
    const reservationDetails = await ReservationDetail.insertMany([
      { reservation_id: reservations[0]._id, table_id: tables[4]._id },
      { reservation_id: reservations[1]._id, table_id: tables[7]._id },
      { reservation_id: reservations[2]._id, table_id: tables[3]._id },
      { reservation_id: reservations[3]._id, table_id: tables[0]._id }
    ]);
    console.log(`   OK ${reservationDetails.length} reservation details\n`);

    // ==================== 8. COMPLAINTS ====================
    console.log('8/24 Tạo Complaints...');
    const complaints = await Complaint.insertMany([
      { 
        customer_id: customers[3]._id, 
        subject: 'Thịt quá cứng', 
        description: 'Miếng thịt bò trong bát cơm quá cứng, không thể ăn được', 
        category: 'food', 
        status: 'resolved', 
        priority: 'high', 
        assigned_to_staff_id: staffs[4]._id, 
        resolution: 'Đã đổi thịt mới và giảm 30% giá' 
      },
      { 
        customer_id: customers[1]._id, 
        subject: 'Phục vụ chậm', 
        description: 'Chờ đợi 50 phút để được phục vụ, quá lâu', 
        category: 'service', 
        status: 'in_progress', 
        priority: 'medium', 
        assigned_to_staff_id: staffs[4]._id 
      },
      { 
        customer_id: customers[4]._id, 
        subject: 'Bàn bị bẩn', 
        description: 'Tìm thấy dầu mỡ trên bàn ăn', 
        category: 'cleanliness', 
        status: 'resolved', 
        priority: 'high', 
        assigned_to_staff_id: staffs[5]._id, 
        resolution: 'Vệ sinh lại ngay và tặng nước uống'
      }
    ]);
    console.log(`   OK ${complaints.length} complaints\n`);

    // ==================== 9. SUPPLIERS ====================
    console.log('9/24 Tạo Suppliers...');
    const suppliers = await Supplier.insertMany([
      { name: 'Meat Pro', phone_contact: '0906-111-222', address: '123 Meat St, HCMC' },
      { name: 'Seafood Vietnam', phone_contact: '0906-333-444', address: '45 Ocean Ave, Da Nang' },
      { name: 'Dalat Farm', phone_contact: '0906-555-666', address: '12 Dalat Rd, Lam Dong' },
      { name: 'Metro', phone_contact: '0906-777-888', address: 'Metro Wholesale' },
      { name: 'Phú Quốc', phone_contact: '0906-999-000', address: 'Phu Quoc Island' },
      { name: 'Lộc Trời', phone_contact: '0906-111-333', address: 'Loc Troi HQ' }
    ]);
    console.log(`   OK ${suppliers.length} suppliers\n`);

    // ==================== 10. INGREDIENTS ====================
    console.log('10/24 Tạo Ingredients...');
    const ingredients = await Ingredient.insertMany([
      { 
        name: 'Thịt bò Úc', 
        unit: 'kg', 
        quantity_in_stock: 0, 
        minimum_quantity: 20, 
        unit_price: 350000, 
        supplier_name: suppliers[0].name, 
        supplier_contact: suppliers[0].phone_contact,
        expiry_date: new Date('2026-01-15'),
        stock_status: 'available',
        expiry_status: 'valid'
      },
      { 
        name: 'Cá hồi Na Uy', 
        unit: 'kg', 
        quantity_in_stock: 0, 
        minimum_quantity: 10, 
        unit_price: 450000, 
        supplier_name: suppliers[1].name, 
        supplier_contact: suppliers[1].phone_contact,
        expiry_date: new Date('2025-12-25'),
        stock_status: 'available',
        expiry_status: 'valid'
      },
      { 
        name: 'Tôm sú', 
        unit: 'kg', 
        quantity_in_stock: 0, 
        minimum_quantity: 15, 
        unit_price: 280000, 
        supplier_name: suppliers[1].name, 
        supplier_contact: suppliers[1].phone_contact,
        expiry_date: new Date('2025-12-20'),
        stock_status: 'low_stock',
        expiry_status: 'near_expiry'
      },
      { 
        name: 'Rau xà lách', 
        unit: 'kg', 
        quantity_in_stock: 0, 
        minimum_quantity: 10, 
        unit_price: 25000, 
        supplier_name: suppliers[2].name, 
        supplier_contact: suppliers[2].phone_contact,
        expiry_date: new Date('2025-12-16'),
        stock_status: 'available',
        expiry_status: 'valid'
      },
      { 
        name: 'Cà chua', 
        unit: 'kg', 
        quantity_in_stock: 0,
        minimum_quantity: 10, 
        unit_price: 30000, 
        supplier_name: suppliers[2].name, 
        supplier_contact: suppliers[2].phone_contact,
        expiry_date: new Date('2025-12-18'),
        stock_status: 'available',
        expiry_status: 'valid'
      },
      { 
        name: 'Hành tây', 
        unit: 'kg', 
        quantity_in_stock: 0,
        minimum_quantity: 8, 
        unit_price: 20000, 
        supplier_name: suppliers[2].name, 
        supplier_contact: suppliers[2].phone_contact,
        expiry_date: new Date('2025-12-17'),
        stock_status: 'low_stock',
        expiry_status: 'valid'
      },
      { 
        name: 'Bơ', 
        unit: 'kg', 
        quantity_in_stock: 0, 
        minimum_quantity: 5, 
        unit_price: 120000, 
        supplier_name: suppliers[3].name, 
        supplier_contact: suppliers[3].phone_contact,
        expiry_date: new Date('2025-12-19'),
        stock_status: 'available',
        expiry_status: 'valid'
      },
      { 
        name: 'Nước mắm', 
        unit: 'l', 
        quantity_in_stock: 0, 
        minimum_quantity: 10, 
        unit_price: 45000, 
        supplier_name: suppliers[4].name, 
        supplier_contact: suppliers[4].phone_contact,
        expiry_date: new Date('2026-06-14'),
        stock_status: 'available',
        expiry_status: 'valid'
      },
      { 
        name: 'Gạo Japonica', 
        unit: 'kg', 
        quantity_in_stock: 0, 
        minimum_quantity: 50, 
        unit_price: 35000, 
        supplier_name: suppliers[5].name, 
        supplier_contact: suppliers[5].phone_contact,
        expiry_date: new Date('2026-03-14'),
        stock_status: 'available',
        expiry_status: 'valid'
      },
      { 
        name: 'Dầu ô liu', 
        unit: 'l', 
        quantity_in_stock: 0, 
        minimum_quantity: 5, 
        unit_price: 180000, 
        supplier_name: suppliers[3].name, 
        supplier_contact: suppliers[3].phone_contact,
        expiry_date: new Date('2025-12-16'),
        stock_status: 'out_of_stock',
        expiry_status: 'near_expiry'
      }
    ]);
    console.log(`   OK ${ingredients.length} ingredients\n`);

    // ==================== 11. STOCK IMPORTS ====================
    console.log('11/24 Tạo Stock Imports...');
    const stockImports = await StockImport.insertMany([
      { 
        import_number: 'IMP-001', 
        staff_id: staffs[4]._id, 
        import_date: new Date('2025-12-01'), 
        total_cost: 17500000, 
        supplier_name: suppliers[0].name, 
        notes: 'Nhập 50kg thịt bò Úc chất lượng cao', 
        status: 'completed' 
      },
      { 
        import_number: 'IMP-002', 
        staff_id: staffs[4]._id, 
        import_date: new Date('2025-12-05'), 
        total_cost: 20500000, 
        supplier_name: suppliers[1].name, 
        notes: 'Nhập cá hồi và tôm sú', 
        status: 'completed' 
      },
      { 
        import_number: 'IMP-003', 
        staff_id: staffs[4]._id, 
        import_date: new Date('2025-12-10'), 
        total_cost: 3500000, 
        supplier_name: suppliers[2].name, 
        notes: 'Rau tươi hàng ngày', 
        status: 'completed' 
      }
    ]);
    console.log(`   OK ${stockImports.length} stock imports\n`);

    // ==================== 12. STOCK IMPORT DETAILS ====================
    console.log('12/24 Tạo Stock Import Details...');
    const stockImportDetails = await StockImportDetail.insertMany([
      { import_id: stockImports[0]._id, ingredient_id: ingredients[0]._id, quantity: 50, unit_price: 350000, line_total: 17500000, expiry_date: new Date('2026-01-01') },
      { import_id: stockImports[1]._id, ingredient_id: ingredients[1]._id, quantity: 30, unit_price: 450000, line_total: 13500000, expiry_date: new Date('2025-12-25') },
      { import_id: stockImports[1]._id, ingredient_id: ingredients[2]._id, quantity: 25, unit_price: 280000, line_total: 7000000, expiry_date: new Date('2025-12-20') },
      { import_id: stockImports[2]._id, ingredient_id: ingredients[3]._id, quantity: 15, unit_price: 25000, line_total: 375000, expiry_date: new Date('2025-12-17') },
      { import_id: stockImports[2]._id, ingredient_id: ingredients[4]._id, quantity: 20, unit_price: 30000, line_total: 600000, expiry_date: new Date('2025-12-18') },
      { import_id: stockImports[2]._id, ingredient_id: ingredients[5]._id, quantity: 18, unit_price: 20000, line_total: 360000, expiry_date: new Date('2025-12-16') }
    ]);
    console.log(`   OK ${stockImportDetails.length} import details\n`);

    // Update ingredient quantities from batches
    console.log('12.1/24 Đồng bộ số lượng ingredient từ batches...');
    for (const ingredient of ingredients) {
      const batches = stockImportDetails.filter(d => d.ingredient_id.toString() === ingredient._id.toString());
      const totalQty = batches.reduce((sum, b) => sum + b.quantity, 0);
      ingredient.quantity_in_stock = totalQty;
      await ingredient.save();
    }
    console.log(`   OK Đã đồng bộ ${ingredients.length} ingredients\n`);

    // ==================== 13. STOCK EXPORTS ====================
    console.log('13/24 Tạo Stock Exports...');
    const stockExports = await StockExport.insertMany([
      { export_number: 'EXP-001', staff_id: staffs[4]._id, export_date: new Date('2025-12-12'), total_cost: 1750000, notes: 'Xuất cho sự kiện', status: 'completed' },
      { export_number: 'EXP-002', staff_id: staffs[5]._id, export_date: new Date('2025-12-13'), total_cost: 360000, notes: 'Đơn mang đi', status: 'completed' }
    ]);
    console.log(`   OK ${stockExports.length} stock exports\n`);

    // ==================== 14. STOCK EXPORT DETAILS ====================
    console.log('14/24 Tạo Stock Export Details...');
    const stockExportDetails = await StockExportDetail.insertMany([
      { export_id: stockExports[0]._id, ingredient_id: ingredients[0]._id, quantity: 5, unit_price: 350000, line_total: 1750000 },
      { export_id: stockExports[0]._id, ingredient_id: ingredients[3]._id, quantity: 2, unit_price: 25000, line_total: 50000 },
      { export_id: stockExports[1]._id, ingredient_id: ingredients[6]._id, quantity: 3, unit_price: 120000, line_total: 360000 }
    ]);
    console.log(`   OK ${stockExportDetails.length} stock export details\n`);

    // ==================== 15. DISHES ====================
    console.log('15/24 Tạo Dishes...');
    const dishes = await Dish.insertMany([
      { name: 'Bò bít tết Úc', description: 'Bò Úc nướng chín vừa, kèm khoai tây chiên vàng, salad rau tươi và sốt tiêu đen', category: 'main_course', price: 350000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' },
      { name: 'Cá hồi nướng chanh bơ', description: 'Cá hồi Na Uy nướng lửa, kèm bơ tươi, chanh và rau thơm', category: 'main_course', price: 420000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' },
      { name: 'Tôm sú nướng bơ tỏi', description: 'Tôm sú to tươi, nướng bơ tỏi thơm phức, kèm bánh mì nướng', category: 'main_course', price: 280000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' },
      { name: 'Salad rau xà lách tươi', description: 'Rau xà lách, cà chua, bơ tươi, sốt dầu giấm balsamic', category: 'appetizer', price: 85000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' },
      { name: 'Gỏi tôm', description: 'Tôm sú, nước mắm chua cay vừa vặn, kèm rau sống', category: 'appetizer', price: 120000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' },
      { name: 'Tiramisu', description: 'Bánh Tiramisu truyền thống Ý, kem mịn mềm', category: 'dessert', price: 95000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' },
      { name: 'Coca Cola', description: 'Nước ngọt Coca Cola lạnh mát', category: 'beverage', price: 25000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' },
      { name: 'Nước cam vắt tươi', description: 'Nước cam tươi vắt 100%, không đường', category: 'beverage', price: 35000, is_available: true, image_url: 'https://images.unsplash.com/photo-1676300183339-09e3824b215d?w=400' }
    ]);
    console.log(`   OK ${dishes.length} dishes\n`);

    // ==================== 16. DISH INGREDIENTS ====================
    console.log('16/24 Tạo Dish Ingredients...');
    const dishIngredients = await DishIngredient.insertMany([
      { dish_id: dishes[0]._id, ingredient_id: ingredients[0]._id, quantity_required: 0.25, unit: 'kg' },
      { dish_id: dishes[0]._id, ingredient_id: ingredients[3]._id, quantity_required: 0.05, unit: 'kg' },
      { dish_id: dishes[1]._id, ingredient_id: ingredients[1]._id, quantity_required: 0.2, unit: 'kg' },
      { dish_id: dishes[1]._id, ingredient_id: ingredients[6]._id, quantity_required: 0.03, unit: 'kg' },
      { dish_id: dishes[2]._id, ingredient_id: ingredients[2]._id, quantity_required: 0.15, unit: 'kg' },
      { dish_id: dishes[2]._id, ingredient_id: ingredients[6]._id, quantity_required: 0.02, unit: 'kg' },
      { dish_id: dishes[3]._id, ingredient_id: ingredients[3]._id, quantity_required: 0.1, unit: 'kg' },
      { dish_id: dishes[3]._id, ingredient_id: ingredients[4]._id, quantity_required: 0.05, unit: 'kg' },
      { dish_id: dishes[4]._id, ingredient_id: ingredients[2]._id, quantity_required: 0.1, unit: 'kg' },
      { dish_id: dishes[4]._id, ingredient_id: ingredients[7]._id, quantity_required: 0.05, unit: 'l' }
    ]);
    console.log(`   OK ${dishIngredients.length} dish-ingredient links\n`);

    // ==================== 17. PROMOTIONS ====================
    console.log('17/24 Tạo Promotions...');
    const promotions = await Promotion.insertMany([
      { name: 'Giảm 20% Tháng 12', description: 'Giảm 20% toàn bộ hóa đơn trong tháng 12', promotion_type: 'percentage', discount_value: 20, minimum_order_amount: 500000, promo_code: 'DEC20', start_date: new Date('2025-12-01'), end_date: new Date('2025-12-31'), is_active: true, max_uses: 100, current_uses: 5 },
      { name: 'Giảm 150k', description: 'Giảm 150,000đ cho hóa đơn trên 1.5 triệu', promotion_type: 'fixed_amount', discount_value: 150000, minimum_order_amount: 1500000, promo_code: 'SAVE150K', start_date: new Date('2025-12-01'), end_date: new Date('2025-12-31'), is_active: true, max_uses: 50, current_uses: 8 },
      { name: 'Happy Hour 14h-16h', description: 'Giảm 25% từ 14h-16h hàng ngày', promotion_type: 'percentage', discount_value: 25, minimum_order_amount: 200000, promo_code: 'HAPPY25', start_date: new Date('2025-12-01'), end_date: new Date('2025-12-31'), is_active: true, max_uses: -1, current_uses: 25 }
    ]);
    console.log(`   OK ${promotions.length} promotions\n`);

    // ==================== 18. ORDERS ====================
    console.log('18/24 Tạo Orders...');
    const orders = await Order.insertMany([
      { 
        order_number: 'ORD-001', 
        order_type: 'dine-in-waiter',
        order_date: new Date('2025-12-11'),
        order_time: '12:30', 
        customer_id: customers[0]._id,
        status: 'served', 
        subtotal: 770000, 
        tax: 77000, 
        total_amount: 847000,
        table_id: tables[2]._id,
        staff_id: staffs[0]._id,
        notes: 'Khách VIP, phục vụ tận tình'
      },
      { 
        order_number: 'ORD-002', 
        order_type: 'dine-in-waiter',
        order_date: new Date('2025-12-11'),
        order_time: '13:15', 
        customer_id: customers[1]._id,
        status: 'completed', 
        subtotal: 360000, 
        tax: 36000, 
        total_amount: 396000,
        table_id: tables[1]._id,
        staff_id: staffs[1]._id,
        notes: 'Không thích hành'
      },
      { 
        order_number: 'ORD-003', 
        order_type: 'dine-in-customer',
        order_date: new Date('2025-12-11'),
        order_time: '14:00', 
        customer_id: customers[3]._id,
        status: 'completed', 
        subtotal: 150000, 
        tax: 15000, 
        total_amount: 165000,
        table_id: tables[0]._id
      },
      { 
        order_number: 'ORD-004', 
        order_type: 'takeaway-customer',
        order_date: new Date('2025-12-11'),
        order_time: '15:30', 
        customer_id: customers[0]._id,
        status: 'completed', 
        subtotal: 635000, 
        tax: 63500, 
        total_amount: 698500,
        notes: 'Đóng gói chắc chắn'
      },
      { 
        order_number: 'ORD-005', 
        order_type: 'dine-in-waiter',
        order_date: new Date('2025-12-18'),
        order_time: '18:45', 
        customer_id: customers[1]._id,
        status: 'served', 
        subtotal: 520000, 
        tax: 52000, 
        total_amount: 572000,
        table_id: tables[10]._id,
        staff_id: staffs[0]._id,
        notes: 'Yêu cầu thêm tương ớt'
      },
      { 
        order_number: 'ORD-006', 
        order_type: 'dine-in-customer',
        order_date: new Date('2025-12-18'),
        order_time: '19:15', 
        customer_id: customers[2]._id,
        status: 'served', 
        subtotal: 245000, 
        tax: 24500, 
        total_amount: 269500,
        table_id: tables[11]._id
      },
      { 
        order_number: 'ORD-007', 
        order_type: 'dine-in-waiter',
        order_date: new Date('2025-12-18'),
        order_time: '20:00', 
        customer_id: customers[4]._id,
        status: 'served', 
        subtotal: 890000, 
        tax: 89000, 
        total_amount: 979000,
        table_id: tables[12]._id,
        staff_id: staffs[1]._id,
        notes: 'Khách yêu cầu thanh toán'
      }
    ]);
    console.log(`   OK ${orders.length} orders\n`);

    // ==================== 19. ORDER DETAILS ====================
    console.log('19/24 Tạo Order Details...');
    const orderDetails = await OrderDetail.insertMany([
      { order_id: orders[0]._id, dish_id: dishes[0]._id, quantity: 1, unit_price: 350000, line_total: 350000, status: 'served' },
      { order_id: orders[0]._id, dish_id: dishes[1]._id, quantity: 1, unit_price: 420000, line_total: 420000, status: 'served' },
      { order_id: orders[1]._id, dish_id: dishes[3]._id, quantity: 2, unit_price: 85000, line_total: 170000, status: 'served' },
      { order_id: orders[1]._id, dish_id: dishes[7]._id, quantity: 1, unit_price: 35000, line_total: 35000, special_instructions: 'Không đường', status: 'served' },
      { order_id: orders[1]._id, dish_id: dishes[6]._id, quantity: 1, unit_price: 25000, line_total: 25000, status: 'served' },
      { order_id: orders[2]._id, dish_id: dishes[3]._id, quantity: 1, unit_price: 85000, line_total: 85000, status: 'served' },
      { order_id: orders[2]._id, dish_id: dishes[7]._id, quantity: 1, unit_price: 35000, line_total: 35000, status: 'served' },
      { order_id: orders[3]._id, dish_id: dishes[0]._id, quantity: 1, unit_price: 350000, line_total: 350000, status: 'ready' },
      { order_id: orders[3]._id, dish_id: dishes[2]._id, quantity: 1, unit_price: 280000, line_total: 280000, status: 'ready' },
      { order_id: orders[3]._id, dish_id: dishes[6]._id, quantity: 1, unit_price: 25000, line_total: 25000, status: 'ready' },
      { order_id: orders[4]._id, dish_id: dishes[1]._id, quantity: 1, unit_price: 420000, line_total: 420000, status: 'served' },
      { order_id: orders[4]._id, dish_id: dishes[4]._id, quantity: 1, unit_price: 95000, line_total: 95000, status: 'served' },
      { order_id: orders[4]._id, dish_id: dishes[6]._id, quantity: 1, unit_price: 25000, line_total: 25000, status: 'served' },
      { order_id: orders[5]._id, dish_id: dishes[3]._id, quantity: 2, unit_price: 85000, line_total: 170000, status: 'served' },
      { order_id: orders[5]._id, dish_id: dishes[7]._id, quantity: 2, unit_price: 35000, line_total: 70000, status: 'served' },
      { order_id: orders[5]._id, dish_id: dishes[6]._id, quantity: 1, unit_price: 25000, line_total: 25000, status: 'served' },
      { order_id: orders[6]._id, dish_id: dishes[0]._id, quantity: 2, unit_price: 350000, line_total: 700000, status: 'served' },
      { order_id: orders[6]._id, dish_id: dishes[2]._id, quantity: 1, unit_price: 280000, line_total: 280000, status: 'served' },
      { order_id: orders[6]._id, dish_id: dishes[5]._id, quantity: 1, unit_price: 110000, line_total: 110000, status: 'served' }
    ]);
    console.log(`   OK ${orderDetails.length} order details\n`);

    // ==================== 20. INVOICES ====================
    console.log('20/24 Tạo Invoices...');
    const invoices = await Invoice.insertMany([
      { 
        invoice_number: 'INV-001', 
        order_id: orders[0]._id, 
        staff_id: staffs[2]._id, 
        customer_id: customers[0]._id, 
        invoice_date: new Date('2025-12-11'),
        subtotal: 770000, 
        tax: 77000, 
        discount_amount: 170000, 
        total_amount: 677000, 
        payment_method: 'card', 
        payment_status: 'paid', 
        paid_at: new Date('2025-12-11')
      },
      { 
        invoice_number: 'INV-002', 
        order_id: orders[2]._id, 
        staff_id: staffs[3]._id, 
        invoice_date: new Date('2025-12-11'),
        subtotal: 150000, 
        tax: 15000, 
        discount_amount: 0, 
        total_amount: 165000, 
        payment_method: 'cash', 
        payment_status: 'paid', 
        paid_at: new Date('2025-12-11')
      },
      { 
        invoice_number: 'INV-003', 
        order_id: orders[1]._id, 
        staff_id: staffs[2]._id, 
        invoice_date: new Date('2025-12-11'),
        subtotal: 360000, 
        tax: 36000, 
        discount_amount: 0, 
        total_amount: 396000, 
        payment_method: 'e-wallet', 
        payment_status: 'paid',
        paid_at: new Date('2025-12-11')
      },
      { 
        invoice_number: 'INV-004', 
        order_id: orders[4]._id, 
        staff_id: staffs[2]._id, 
        customer_id: customers[1]._id, 
        invoice_date: new Date('2025-12-18'),
        subtotal: 520000, 
        tax: 52000, 
        discount_amount: 0, 
        total_amount: 572000, 
        payment_method: 'cash', 
        payment_status: 'pending'
      },
      { 
        invoice_number: 'INV-005', 
        order_id: orders[5]._id, 
        staff_id: staffs[2]._id, 
        customer_id: customers[2]._id, 
        invoice_date: new Date('2025-12-18'),
        subtotal: 245000, 
        tax: 24500, 
        discount_amount: 0, 
        total_amount: 269500, 
        payment_method: 'cash', 
        payment_status: 'pending'
      },
      { 
        invoice_number: 'INV-006', 
        order_id: orders[6]._id, 
        staff_id: staffs[3]._id, 
        customer_id: customers[4]._id, 
        invoice_date: new Date('2025-12-18'),
        subtotal: 890000, 
        tax: 89000, 
        discount_amount: 0, 
        total_amount: 979000, 
        payment_method: 'card', 
        payment_status: 'pending'
      }
    ]);
    console.log(`   OK ${invoices.length} invoices\n`);

    // ==================== 21. INVOICE PROMOTIONS ====================
    console.log('21/24 Tạo Invoice Promotions...');
    const invoicePromotions = await InvoicePromotion.insertMany([
      { invoice_id: invoices[0]._id, promotion_id: promotions[0]._id, discount_applied: 170000 }
    ]);
    console.log(`   OK ${invoicePromotions.length} invoice promotions\n`);

    // ==================== 22. VIOLATIONS ====================
    console.log('22/24 Tạo Violations...');
    const violations = await Violation.insertMany([
      { 
        customer_id: customers[1]._id, 
        description: 'Khách gọi 3 lần để hủy đặt bàn mà không thông báo trước', 
        violation_date: new Date('2025-12-01'),
        violation_type: 'late_cancel'
      },
      {
        customer_id: customers[4]._id,
        description: 'Không có mặt vào giờ đặt bàn, đã hủy phòng VIP',
        violation_date: new Date('2025-12-05'),
        violation_type: 'no_show'
      }
    ]);
    console.log(`   OK ${violations.length} violations\n`);

    // ==================== 23. RATINGS & REPLIES ====================
    console.log('23/24 Tạo Ratings...');
    const ratings = await Rating.insertMany([
      { 
        customer_id: customers[0]._id, 
        description: 'Thức ăn tuyệt vời, phục vụ rất tốt, sẽ quay lại!', 
        rating_date: new Date('2025-12-11'),
        score: 5
      },
      { 
        customer_id: customers[1]._id, 
        description: 'Thức ăn ngon nhưng chờ đợi lâu, cải thiện tốc độ', 
        rating_date: new Date('2025-12-10'),
        score: 3
      },
      { 
        customer_id: customers[2]._id, 
        description: 'Bình thường, không có gì đặc biệt, giá hơi cao', 
        rating_date: new Date('2025-12-09'),
        score: 3
      },
      { 
        customer_id: customers[3]._id, 
        description: 'Rất tốt, được xử lý khiếu nại một cách chuyên nghiệp!', 
        rating_date: new Date('2025-12-08'),
        score: 4
      }
    ]);
    console.log(`   OK ${ratings.length} ratings\n`);

    console.log('24/24 Tạo Replies...');
    const ratingReplies = await RatingReply.insertMany([
      { 
        rating_id: ratings[0]._id, 
        staff_id: staffs[4]._id, 
        reply_text: 'Cảm ơn bạn rất nhiều! Chúng tôi sẽ tiếp tục cải thiện!', 
        reply_date: new Date('2025-12-11')
      },
      { 
        rating_id: ratings[1]._id, 
        staff_id: staffs[5]._id, 
        reply_text: 'Xin lỗi vì chờ đợi lâu, chúng tôi đã tối ưu hóa quy trình', 
        reply_date: new Date('2025-12-11')
      }
    ]);
    console.log(`   OK ${ratingReplies.length} replies\n`);

    // TỔNG KẾT
    console.log('\n========================================');
    console.log('SEED DATABASE HOÀN TẤT!');
    console.log('========================================');
    console.log('TỔNG KẾT DỮ LIỆU:');
    console.log(`   1. Staff: ${staffs.length}`);
    console.log(`   2. Customers: ${customers.length}`);
    console.log(`   3. Floors: ${floors.length}`);
    console.log(`   4. Locations: ${locations.length}`);
    console.log(`   5. Tables: ${tables.length}`);
    console.log(`   6. Reservations: ${reservations.length}`);
    console.log(`   7. Reservation Details: ${reservationDetails.length}`);
    console.log(`   8. Complaints: ${complaints.length}`);
    console.log(`   9. Suppliers: ${suppliers.length}`);
    console.log(`   10. Ingredients: ${ingredients.length}`);
    console.log(`   11. Stock Imports: ${stockImports.length}`);
    console.log(`   12. Stock Import Details: ${stockImportDetails.length}`);
    console.log(`   13. Stock Exports: ${stockExports.length}`);
    console.log(`   14. Stock Export Details: ${stockExportDetails.length}`);
    console.log(`   15. Dishes: ${dishes.length}`);
    console.log(`   16. Dish Ingredients: ${dishIngredients.length}`);
    console.log(`   17. Promotions: ${promotions.length}`);
    console.log(`   18. Orders: ${orders.length}`);
    console.log(`   19. Order Details: ${orderDetails.length}`);
    console.log(`   20. Invoices: ${invoices.length}`);
    console.log(`   21. Invoice Promotions: ${invoicePromotions.length}`);
    console.log(`   22. Violations: ${violations.length}`);
    console.log(`   23. Ratings: ${ratings.length}`);
    console.log(`   24. Rating Replies: ${ratingReplies.length}`);
    console.log('========================================');
    console.log('Test Accounts:');
    console.log('   Waiter: hung.waiter@restaurant.vn / password123');
    console.log('   Cashier: nam.cashier@restaurant.vn / password123');
    console.log('   Manager: minh.manager@restaurant.vn / password123');
    console.log('   Customer (Diamond): tuan.nguyen@gmail.com / password123');
    console.log('   Customer (Regular): hoang.son@gmail.com / password123');
    console.log('========================================\n');

  } catch (error) {
    console.error('LỖI:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Đã đóng kết nối database');
    process.exit(0);
  }
}

seedDatabase();
