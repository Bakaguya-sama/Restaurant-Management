# Restaurant Management System - Backend

Backend API cho hệ thống quản lý nhà hàng sử dụng Node.js, Express và MongoDB.

## 🗂️ Cấu trúc Project

```
backend/
├── server.js                 # Main server entry point
├── package.json
├── config/
│   └── database.js          # MongoDB connection config
├── scripts/
│   └── seed.js              # Database seeding script
├── src/
│   ├── models/
│   │   └── index.js         # All Mongoose schemas & models (24 bảng)
│   ├── presentation_layer/
│   │   ├── controllers/     # HTTP request handlers
│   │   │   ├── floor/
│   │   │   ├── location/
│   │   │   ├── table/
│   │   │   ├── staff/
│   │   │   └── customer/
│   │   └── routes/          # API route definitions
│   │       ├── floors.routes.js
│   │       ├── locations.routes.js
│   │       ├── tables.routes.js
│   │       ├── staff.routes.js
│   │       └── customer.routes.js
│   ├── application_layer/
│   │   ├── floor/           # Business logic for floors
│   │   ├── location/        # Business logic for locations
│   │   ├── table/           # Business logic for tables
│   │   ├── staff/           # Business logic for staff
│   │   └── customer/        # Business logic for customers
│   ├── domain_layer/
│   │   ├── floor/           # Floor entity & validation
│   │   ├── location/        # Location entity & validation
│   │   ├── table/           # Table entity & validation
│   │   ├── staff/           # Staff entity & validation
│   │   └── customer/        # Customer entity & validation
│   ├── infrastructure_layer/
│   │   ├── floor/           # Floor data access (repository)
│   │   ├── location/        # Location data access (repository)
│   │   ├── table/           # Table data access (repository)
│   │   ├── staff/           # Staff data access (repository)
│   │   └── customer/        # Customer data access (repository)
│   ├── middleware/          # Authentication & validation middleware
│   └── test/                # Integration tests
│       ├── floor/
│       ├── location/
│       ├── table/
│       ├── staff/
│       └── customer/
└── README.md
```

## 🗂️ Cấu trúc Database

### Entities (24 bảng)

#### 1. **Staff** (Nhân viên)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| full_name | String | Họ tên nhân viên (bắt buộc) |
| email | String | Email (bắt buộc, duy nhất) |
| phone | String | Số điện thoại (bắt buộc) |
| address | String | Địa chỉ |
| date_of_birth | Date | Ngày sinh |
| hire_date | Date | Ngày vào làm (mặc định: hiện tại) |
| role | String | Vai trò: waiter, cashier, manager (bắt buộc) |
| is_active | Boolean | Trạng thái hoạt động (mặc định: true) |
| image_url | String | URL ảnh đại diện |
| username | String | Tên đăng nhập (bắt buộc, duy nhất) |
| password_hash | String | Mật khẩu hash (bắt buộc) |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 2. **Customer** (Khách hàng)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| full_name | String | Họ tên (bắt buộc) |
| email | String | Email (bắt buộc, duy nhất) |
| phone | String | Số điện thoại (bắt buộc) |
| address | String | Địa chỉ |
| date_of_birth | Date | Ngày sinh |
| membership_level | String | Cấp độ: regular, bronze, silver, gold, platinum, diamond (mặc định: regular) |
| points | Number | Điểm tích lũy (mặc định: 0) |
| total_spent | Number | Tổng chi tiêu (mặc định: 0) |
| image_url | String | URL ảnh đại diện |
| isBanned | Boolean | Bị cấm (mặc định: false) |
| password_hash | String | Mật khẩu hash (bắt buộc) |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 3. **Floor** (Tầng - Mới)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| floor_name | String | Tên tầng (bắt buộc, duy nhất) |
| floor_number | Number | Số tầng (bắt buộc, duy nhất) |
| description | String | Mô tả |

#### 4. **Location** (Khu vực - Mới)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên khu vực (bắt buộc, duy nhất) |
| floor_id | ObjectId | Tầng (bắt buộc) |
| description | String | Mô tả |

#### 5. **Table** (Bàn ăn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| table_number | String | Số bàn (bắt buộc, duy nhất) |
| capacity | Number | Sức chứa (bắt buộc) |
| location_id | ObjectId | Khu vực (tham chiếu Location) |
| status | String | Trạng thái: free, occupied, reserved, dirty, broken (mặc định: free) |
| brokenReason | String | Lý do bàn bị hỏng (optional, chỉ khi status = broken) |
| created_at | Date | Ngày tạo |

#### 6. **Reservation** (Đặt bàn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| customer_id | ObjectId | Khách hàng (bắt buộc) |
| reservation_date | Date | Ngày đặt (bắt buộc) |
| reservation_time | String | Giờ đặt (bắt buộc, ví dụ: "18:30") |
| number_of_guests | Number | Số khách (bắt buộc) |
| status | String | Trạng thái: pending, confirmed, cancelled, completed (mặc định: pending) |
| special_requests | String | Yêu cầu đặc biệt |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 7. **ReservationDetail** (Chi tiết đặt bàn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| reservation_id | ObjectId | Đặt bàn (bắt buộc) |
| table_id | ObjectId | Bàn ăn (bắt buộc) |

#### 8. **Complaint** (Khiếu nại)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| customer_id | ObjectId | Khách hàng (bắt buộc) |
| subject | String | Tiêu đề (bắt buộc) |
| description | String | Mô tả (bắt buộc) |
| category | String | Loại: food, service, cleanliness, other (mặc định: other) |
| status | String | Trạng thái: open, in_progress, resolved, closed (mặc định: open) |
| priority | String | Mức độ: low, medium, high (mặc định: medium) |
| assigned_to_staff_id | ObjectId | Nhân viên xử lý |
| resolution | String | Giải pháp |
| created_at | Date | Ngày tạo |
| resolved_at | Date | Ngày giải quyết |

#### 9. **Supplier** (Nhà cung cấp - Mới)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên nhà cung cấp (bắt buộc) |
| phone_contact | String | Số điện thoại |
| address | String | Địa chỉ |

#### 10. **Ingredient** (Nguyên liệu)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên nguyên liệu (bắt buộc) |
| unit | String | Đơn vị (kg, g, l, ml, pieces) (bắt buộc) |
| quantity_in_stock | Number | Số lượng trong kho (mặc định: 0) |
| minimum_quantity | Number | Số lượng tối thiểu (mặc định: 0) |
| unit_price | Number | Giá đơn vị (bắt buộc) |
| supplier_name | String | Tên nhà cung cấp |
| supplier_contact | String | Thông tin liên hệ |
| expiry_date | Date | Ngày hết hạn |
| stock_status | String | Trạng thái: available, low_stock, out_of_stock (mặc định: available) |
| expiry_status | String | Trạng thái hạn: valid, near_expiry, expired (mặc định: valid) |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 11. **StockImport** (Phiếu nhập kho)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| import_number | String | Mã phiếu nhập (bắt buộc, duy nhất) |
| staff_id | ObjectId | Nhân viên nhập (bắt buộc) |
| import_date | Date | Ngày nhập (mặc định: hiện tại) |
| total_cost | Number | Tổng chi phí (mặc định: 0) |
| supplier_name | String | Tên nhà cung cấp |
| notes | String | Ghi chú |
| status | String | Trạng thái: pending, completed, cancelled (mặc định: pending) |
| created_at | Date | Ngày tạo |

#### 12. **StockImportDetail** (Chi tiết nhập kho)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| import_id | ObjectId | Phiếu nhập (bắt buộc) |
| ingredient_id | ObjectId | Nguyên liệu (bắt buộc) |
| quantity | Number | Số lượng (bắt buộc) |
| unit_price | Number | Giá đơn vị (bắt buộc) |
| line_total | Number | Tổng dòng (bắt buộc) |
| expiry_date | Date | Ngày hết hạn |

#### 13. **Dish** (Món ăn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên món (bắt buộc) |
| description | String | Mô tả |
| category | String | Loại: appetizer, main_course, dessert, beverage (bắt buộc) |
| price | Number | Giá (bắt buộc) |
| image_url | String | URL ảnh |
| is_available | Boolean | Có sẵn (mặc định: true) |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 14. **DishIngredient** (Junction Table: Món - Nguyên liệu)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| dish_id | ObjectId | Món ăn (bắt buộc) |
| ingredient_id | ObjectId | Nguyên liệu (bắt buộc) |
| quantity_required | Number | Số lượng cần (bắt buộc) |
| unit | String | Đơn vị (bắt buộc) |

#### 15. **Menu** (Thực đơn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên menu (bắt buộc) |
| description | String | Mô tả |
| menu_type | String | Loại: regular, seasonal, special, lunch, dinner (bắt buộc) |
| is_active | Boolean | Hoạt động (mặc định: true) |
| valid_from | Date | Ngày bắt đầu |
| valid_to | Date | Ngày kết thúc |
| created_at | Date | Ngày tạo |

#### 16. **MenuEntry** (Junction Table: Menu - Món)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| menu_id | ObjectId | Menu (bắt buộc) |
| dish_id | ObjectId | Món ăn (bắt buộc) |
| display_order | Number | Thứ tự hiển thị (mặc định: 0) |
| is_featured | Boolean | Nổi bật (mặc định: false) |

#### 17. **Order** (Đơn hàng) - Sử dụng Discriminators
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| order_number | String | Mã đơn (bắt buộc, duy nhất) |
| order_type | String | Loại: dine-in-waiter, dine-in-customer, takeaway-customer, takeaway-staff (bắt buộc) |
| order_date | Date | Ngày tạo (mặc định: hiện tại) |
| order_time | String | Giờ tạo (bắt buộc) |
| status | String | Trạng thái: pending, preparing, ready, served, completed, cancelled (mặc định: pending) |
| subtotal | Number | Tổng cộng trước thuế (mặc định: 0) |
| tax | Number | Thuế (mặc định: 0) |
| total_amount | Number | Tổng tiền (mặc định: 0) |
| table_id | ObjectId | Bàn ăn (cho dine-in) |
| customer_id | ObjectId | Khách hàng (cho dine-in-customer, takeaway-customer) |
| staff_id | ObjectId | Nhân viên (cho dine-in-waiter, takeaway-staff) |
| notes | String | Ghi chú |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 18. **OrderDetail** (Chi tiết đơn hàng)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| order_id | ObjectId | Đơn hàng (bắt buộc) |
| dish_id | ObjectId | Món ăn (bắt buộc) |
| quantity | Number | Số lượng (bắt buộc) |
| unit_price | Number | Giá đơn vị (bắt buộc) |
| line_total | Number | Tổng dòng (bắt buộc) |
| special_instructions | String | Yêu cầu đặc biệt |
| status | String | Trạng thái: pending, preparing, ready, served (mặc định: pending) |

#### 19. **Promotion** (Khuyến mãi)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên khuyến mãi (bắt buộc) |
| description | String | Mô tả |
| promotion_type | String | Loại: percentage, fixed_amount (bắt buộc, mặc định: percentage) |
| discount_value | Number | Giá trị giảm (bắt buộc) |
| minimum_order_amount | Number | Số tiền tối thiểu áp dụng (mặc định: 0) |
| promo_code | String | Mã khuyến mãi (duy nhất, tùy chọn) |
| start_date | Date | Ngày bắt đầu (bắt buộc) |
| end_date | Date | Ngày kết thúc (bắt buộc) |
| is_active | Boolean | Hoạt động (mặc định: true) |
| max_uses | Number | Số lần sử dụng tối đa, -1 = không giới hạn (mặc định: -1) |
| current_uses | Number | Số lần đã sử dụng (mặc định: 0) |
| created_at | Date | Ngày tạo |

#### 20. **Invoice** (Hóa đơn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| invoice_number | String | Mã hóa đơn (bắt buộc, duy nhất) |
| order_id | ObjectId | Đơn hàng (bắt buộc) |
| staff_id | ObjectId | Nhân viên (cashier) (bắt buộc) |
| customer_id | ObjectId | Khách hàng |
| invoice_date | Date | Ngày lập (mặc định: hiện tại) |
| subtotal | Number | Tổng cộng trước thuế (bắt buộc) |
| tax | Number | Thuế (mặc định: 0) |
| discount_amount | Number | Số tiền giảm (mặc định: 0) |
| total_amount | Number | Tổng tiền (bắt buộc) |
| payment_method | String | Phương thức: cash, card, transfer, e-wallet (bắt buộc) |
| payment_status | String | Trạng thái: pending, paid, cancelled (mặc định: pending) |
| paid_at | Date | Ngày thanh toán |
| created_at | Date | Ngày tạo |

#### 21. **InvoicePromotion** (Junction Table: Hóa đơn - Khuyến mãi)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| invoice_id | ObjectId | Hóa đơn (bắt buộc) |
| promotion_id | ObjectId | Khuyến mãi (bắt buộc) |
| discount_applied | Number | Số tiền giảm áp dụng (bắt buộc) |

#### 22. **Violation** (Vi phạm)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| customer_id | ObjectId | Khách hàng (bắt buộc) |
| description | String | Mô tả vi phạm (bắt buộc) |
| violation_date | Date | Ngày vi phạm (mặc định: hiện tại) |
| violation_type | String | Loại: no_show, late_cancel, property_damage, other (mặc định: no_show) |

#### 23. **Rating** (Đánh giá)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| customer_id | ObjectId | Khách hàng (bắt buộc) |
| description | String | Nội dung đánh giá |
| rating_date | Date | Ngày đánh giá (mặc định: hiện tại) |
| score | Number | Điểm (1-5, bắt buộc) |

#### 24. **RatingReply** (Phản hồi đánh giá)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| rating_id | ObjectId | Đánh giá (bắt buộc) |
| staff_id | ObjectId | Nhân viên phản hồi (bắt buộc) |
| reply_text | String | Nội dung phản hồi (bắt buộc) |
| reply_date | Date | Ngày phản hồi (mặc định: hiện tại) |

---

## Cài đặt & Chạy

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

Seed sẽ tạo dữ liệu đầy đủ cho 22 bảng:
- **6 Staff** (2 waiter, 2 cashier, 2 manager)
- **6 Customers** (các membership level: diamond, platinum, gold, silver, bronze, regular)
- **2 Floors** (tầng 1, tầng 2)
- **5 Locations** (trong nhà, ngoài trời, VIP phòng)
- **10 Tables** (với location_id)
- **4 Reservations** với chi tiết đầy đủ
- **3 Complaints** với resolution
- **10 Ingredients** với supplier, expiry_date, stock_status, expiry_status
- **3 Stock Imports** và 6 chi tiết import
- **8 Dishes** (appetizer, main_course, dessert, beverage)
- **10 Dish-Ingredient links**
- **3 Menus** (regular, lunch, dinner)
- **11 Menu Entries**
- **3 Promotions** (percentage, fixed_amount, happy hour)
- **4 Orders** với discriminators khác nhau
- **10 Order Details**
- **3 Invoices** với payment tracking
- **1 Invoice Promotion**
- **2 Violations** (no_show, late_cancel)
- **4 Ratings** với 2 replies từ staff

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

### Staff Accounts
| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Waiter | hung.waiter@restaurant.vn | password123 |
| Waiter | mai.waiter@restaurant.vn | password123 |
| Cashier | nam.cashier@restaurant.vn | password123 |
| Cashier | lan.cashier@restaurant.vn | password123 |
| Manager | minh.manager@restaurant.vn | password123 |
| Manager | hoa.manager@restaurant.vn | password123 |

### Customer Accounts
| Membership | Email | Mật khẩu | Điểm | Chi tiêu |
|-----------|-------|----------|------|---------|
| Diamond | tuan.nguyen@gmail.com | password123 | 5000 | 50M |
| Platinum | huong.tran@gmail.com | password123 | 3000 | 30M |
| Gold | huy.le@gmail.com | password123 | 1800 | 15M |
| Silver | nga.pham@gmail.com | password123 | 800 | 5M |
| Bronze | khoa.vo@gmail.com | password123 | 300 | 2M |
| Regular | son.hoang@gmail.com | password123 | 50 | 0.5M |

---

## 📊 Relationships (Mối quan hệ)

```
Floor:
└─ 1-N → Location (floor_id)

Location:
├─ N-1 → Floor (floor_id)
└─ 1-N → Table (location_id)

Staff:
├─ 1-N → Complaint (assigned_to_staff_id)
├─ 1-N → StockImport (staff_id)
├─ 1-N → Order (staff_id cho dine-in-waiter, takeaway-staff)
├─ 1-N → Invoice (staff_id cho cashier)
└─ 1-N → RatingReply (staff_id)

Customer:
├─ 1-N → Reservation (customer_id)
├─ 1-N → Complaint (customer_id)
├─ 1-N → Order (customer_id cho dine-in-customer, takeaway-customer)
├─ 1-N → Invoice (customer_id)
├─ 1-N → Violation (customer_id)
└─ 1-N → Rating (customer_id)

Table:
├─ 1-N → ReservationDetail (table_id)
├─ N-1 → Location (location_id)
└─ 1-N → Order (table_id cho dine-in orders)

Reservation:
├─ 1-N → ReservationDetail (reservation_id)
└─ N-1 → Customer (customer_id)

Ingredient:
├─ 1-N → StockImportDetail (ingredient_id)
└─ 1-N → DishIngredient (ingredient_id)

Dish:
├─ 1-N → DishIngredient (dish_id)
├─ 1-N → MenuEntry (dish_id)
└─ 1-N → OrderDetail (dish_id)

Menu:
├─ 1-N → MenuEntry (menu_id)
└─ N-N → Dish (qua MenuEntry)

Order (Polymorphic - Discriminators):
├─ dine-in-waiter → Staff + Table
├─ dine-in-customer → Customer + Table
├─ takeaway-customer → Customer
├─ takeaway-staff → Staff
└─ 1-N → OrderDetail (order_id)
└─ 1-1 → Invoice (order_id)

OrderDetail:
├─ N-1 → Order (order_id)
└─ N-1 → Dish (dish_id)

Invoice:
├─ 1-1 → Order (order_id)
├─ N-1 → Staff (staff_id)
├─ N-1 → Customer (customer_id)
└─ 1-N → InvoicePromotion (invoice_id)
└─ N-N → Promotion (qua InvoicePromotion)

Promotion:
└─ 1-N → InvoicePromotion (promotion_id)

Rating:
├─ N-1 → Customer (customer_id)
└─ 1-N → RatingReply (rating_id)

RatingReply:
├─ N-1 → Rating (rating_id)
└─ N-1 → Staff (staff_id)

Violation:
└─ N-1 → Customer (customer_id)
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

## API Routes

### Floor Management (`/api/v1/floors`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy danh sách tất cả tầng |
| GET | `/:id` | Lấy chi tiết tầng |
| POST | `/` | Tạo tầng mới |
| PUT | `/:id` | Cập nhật tầng |
| DELETE | `/:id` | Xóa tầng |

**Seed Data (2 tầng):**
- Tầng 1 - Khu trong nhà (floor_number: 1)
- Tầng 2 - VIP (floor_number: 2)

### Location Management (`/api/v1/locations`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy danh sách tất cả khu vực |
| GET | `/:id` | Lấy chi tiết khu vực |
| GET | `/floor/:floorId` | Lấy khu vực theo tầng |
| POST | `/` | Tạo khu vực mới |
| PUT | `/:id` | Cập nhật khu vực |
| DELETE | `/:id` | Xóa khu vực |

**Seed Data (5 khu vực):**
- Trong nhà phía trước (Tầng 1)
- Trong nhà phía sau (Tầng 1)
- Sân ngoài trời (Tầng 1)
- Phòng VIP A (Tầng 2)
- Phòng VIP B (Tầng 2)

### Table Management (`/api/v1/tables`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Lấy danh sách bàn (filter: status, location_id) |
| GET | `/:id` | Lấy chi tiết bàn |
| GET | `/location/:locationId` | Lấy bàn theo khu vực |
| GET | `/status/available` | Lấy tất cả bàn trống |
| GET | `/status/summary` | Tóm tắt số bàn theo trạng thái |
| POST | `/` | Tạo bàn mới |
| PUT | `/:id` | Cập nhật bàn |
| PATCH | `/:id/status` | Cập nhật trạng thái bàn |
| DELETE | `/:id` | Xóa bàn |

**Seed Data (15 bàn):**
- T01-T03: Bàn 2 chỗ (Khu trong nhà phía trước)
- T04-T06: Bàn 4 chỗ (Khu trong nhà phía sau)
- T07-T09: Bàn 2-6 chỗ (Sân ngoài trời)
- T10-T12: Bàn VIP 8 chỗ (Phòng VIP A)
- T13-T15: Bàn VIP 10 chỗ (Phòng VIP B)

**Table Status:**
- `available` - Bàn trống
- `occupied` - Bàn đang sử dụng
- `reserved` - Bàn được đặt
- `cleaning` - Bàn đang làm sạch
- `maintenance` - Bàn bảo trì

---

##  Notes

- Database sử dụng Mongoose với schema validation
- Passwords được hash bằng bcryptjs
- Tất cả timestamps (created_at, updated_at) tự động
- Indexes được tạo cho các trường thường xuyên query (email, order_number, invoice_number)
- Junction tables được sử dụng cho many-to-many relationships
- Tất cả routes có response format thống nhất: `{ success: boolean, data: any, message: string }`
- Validation dữ liệu đầu vào cho tất cả endpoints
- Error handling và logging cho các operation

---

##  Database Seeding

Chạy script seed để tạo dữ liệu mẫu:

```bash
npm run seed
```

**Seed Data được tạo:**
- **2 Staff accounts**: 1 waiter + 1 cashier + 1 manager (password: password123)
- **5 Customers**: Với các membership levels khác nhau
- **2 Floors**: Tầng 1 & Tầng 2
- **5 Locations**: 3 khu vực tầng 1, 2 khu vực tầng 2
- **15 Tables**: Phân bố theo các locations khác nhau
- **Ingredients**: Các nguyên liệu nhà hàng
- **Dishes**: Các món ăn (appetizer, main_course, dessert, beverage)
- **Menu**: Thực đơn hàng ngày
- **Promotions**: Các khuyến mãi (percentage & fixed_amount)
- **và các bảng khác**: Orders, Invoices, Reservations, etc.

---

##  Getting Started

### 1. Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update MongoDB URI in .env
MONGODB_URI=mongodb://localhost:27017/restaurant_management
```

### 2. Run Development Server

```bash
# Start development server (with nodemon)
npm run dev

# Or run production server
npm start
```

### 3. Seed Database

```bash
npm run seed
```


##  Next Steps

1. Done: Tạo API routes cho Floor, Location, Table
2.  Tạo API routes cho các entity khác (Order, Invoice, Reservation, etc.)
3.  Implement authentication & authorization middleware
4.  Add validation middleware
5.  Create API documentation (Swagger/OpenAPI)
6.  Add unit tests
7.  Implement real-time features (Socket.io)
