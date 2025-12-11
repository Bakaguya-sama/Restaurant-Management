# Restaurant Management System - Backend

Backend API cho hệ thống quản lý nhà hàng sử dụng Node.js, Express và MongoDB.

## 🗂️ Cấu trúc Database

### Entities (18 bảng)

#### 1. **Staff** (Nhân viên)
- Quản lý thông tin nhân viên
- Roles: service, cashier, warehouse, chef
- Kế thừa cho ServiceStaff, Cashier, WarehouseStaff, Chef

#### 2. **Manager** (Quản lý)
- Thông tin quản lý cấp cao
- Liên kết với Staff
- Departments: operations, kitchen, service, admin

#### 3. **Customer** (Khách hàng)
- Thông tin khách hàng
- Membership levels: regular, silver, gold, platinum
- Điểm tích lũy và tổng chi tiêu

#### 4. **Table** (Bàn ăn)
- Quản lý bàn ăn
- Locations: indoor, outdoor, vip
- Trạng thái: available, occupied, reserved, maintenance

#### 5. **Reservation** (Đặt bàn)
- Quản lý đặt bàn trước
- Liên kết: Customer, Staff (service), Table

#### 6. **Complaint** (Khiếu nại)
- Quản lý khiếu nại khách hàng
- Categories: food, service, cleanliness, other
- Priority levels: low, medium, high

#### 7. **Ingredient** (Nguyên liệu)
- Quản lý kho nguyên liệu
- Tracking: quantity, minimum_quantity, unit_price
- Status: available, low_stock, out_of_stock

#### 8. **StockImport** (Phiếu nhập kho)
- Quản lý nhập kho
- Người nhập: WarehouseStaff

#### 9. **StockImportDetail** (Chi tiết nhập kho)
- Chi tiết từng nguyên liệu trong phiếu nhập

#### 10. **Dish** (Món ăn)
- Danh sách món ăn
- Categories: appetizer, main_course, dessert, beverage, special
- Thông tin: giá, thời gian chuẩn bị, calories

#### 11. **DishIngredient** (Junction Table)
- Liên kết Dish ↔ Ingredient
- Số lượng nguyên liệu cần cho mỗi món

#### 12. **Menu** (Thực đơn)
- Các menu khác nhau
- Types: regular, seasonal, special, lunch, dinner

#### 13. **MenuEntry** (Junction Table)
- Liên kết Menu ↔ Dish
- Thứ tự hiển thị, món nổi bật

#### 14. **Order** (Đơn hàng)
- Quản lý order từ khách
- Liên kết: Table, Staff (service), Customer
- Status: pending, preparing, ready, served, completed, cancelled

#### 15. **OrderDetail** (Chi tiết đơn hàng)
- Chi tiết món ăn trong order

#### 16. **Promotion** (Khuyến mãi)
- Quản lý chương trình khuyến mãi
- Types: percentage, fixed_amount, buy_x_get_y
- Promo code và điều kiện áp dụng

#### 17. **Invoice** (Hóa đơn)
- Hóa đơn thanh toán
- Liên kết: Order, Staff (cashier), Customer
- Payment methods: cash, card, transfer, e-wallet

#### 18. **InvoicePromotion** (Junction Table)
- Liên kết Invoice ↔ Promotion
- Số tiền giảm giá đã áp dụng

---

## 🚀 Cài đặt & Chạy

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình môi trường
File `.env` đã được tạo sẵn với:
```
MONGODB_URI=mongodb://localhost:27017/restaurant_management
PORT=5001
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Chạy MongoDB
Đảm bảo MongoDB đang chạy:
```bash
# Windows
net start MongoDB

# hoặc dùng MongoDB Compass
```

### 4. Seed dữ liệu mẫu
```bash
npm run seed
```

Seed sẽ tạo:
- **7 Staff** (service, cashier, warehouse, chef roles)
- **2 Managers**
- **5 Customers** (các membership levels khác nhau)
- **8 Tables** (indoor, outdoor, vip)
- **3 Reservations**
- **2 Complaints**
- **10 Ingredients**
- **2 Stock Imports** với chi tiết
- **8 Dishes** (các loại món ăn)
- **7 Dish-Ingredient links**
- **3 Menus**
- **6 Menu Entries**
- **3 Promotions**
- **3 Orders** với chi tiết
- **2 Invoices** với promotion

### 5. Chạy server
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5001`

---

## 🔑 Tài khoản test

### Staff
- **Service**: `hung.service@restaurant.vn` / `password123`
- **Cashier**: `nam.cashier@restaurant.vn` / `password123`
- **Warehouse**: `tu.warehouse@restaurant.vn` / `password123`
- **Chef**: `minh.chef@restaurant.vn` / `password123`

### Customer
- **Gold Member**: `tuan@gmail.com` / `password123`
- **Platinum Member**: `huy@gmail.com` / `password123`

---

## 📊 Relationships (Mối quan hệ)

```
Staff 1-1 Manager (một số staff là manager)

Customer 1-N Reservation
Customer 1-N Complaint

ServiceStaff 1-N Reservation
ServiceStaff 1-N Order

WarehouseStaff 1-N StockImport
StockImport 1-N StockImportDetail
StockImportDetail N-1 Ingredient

Dish N-N Ingredient (qua DishIngredient)
Menu N-N Dish (qua MenuEntry)

Order 1-1 Table
Order 1-N OrderDetail
OrderDetail N-1 Dish

Cashier 1-N Invoice
Invoice 1-1 Order
Invoice N-N Promotion (qua InvoicePromotion)
```

---

## 🛠️ Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

---

## 📝 Notes

- Database sử dụng Mongoose với schema validation
- Passwords được hash bằng bcryptjs
- Tất cả timestamps (created_at, updated_at) tự động
- Indexes được tạo cho các trường thường xuyên query (email, order_number, invoice_number)
- Junction tables được sử dụng cho many-to-many relationships

---

## 🔜 Next Steps

1. Tạo các API routes cho từng entity
2. Implement authentication & authorization
3. Add validation middleware
4. Create API documentation (Swagger/OpenAPI)
5. Add unit tests
6. Implement real-time features (Socket.io)
