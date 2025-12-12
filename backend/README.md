# Restaurant Management System - Backend

Backend API cho hệ thống quản lý nhà hàng sử dụng Node.js, Express và MongoDB.

## 🗂️ Cấu trúc Database

### Entities (20 bảng)

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
| membership_level | String | Cấp độ: regular, silver, gold (mặc định: regular) |
| points | Number | Điểm tích lũy (mặc định: 0) |
| total_spent | Number | Tổng chi tiêu (mặc định: 0) |
| image_url | String | URL ảnh đại diện |
| isBanned | Boolean | Bị cấm (mặc định: false) |
| password_hash | String | Mật khẩu hash (bắt buộc) |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 3. **Table** (Bàn ăn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| table_number | String | Số bàn (bắt buộc, duy nhất) |
| capacity | Number | Sức chứa (bắt buộc) |
| location | String | Vị trí: indoor, outdoor, vip (mặc định: indoor) |
| floor | Number | Tầng (mặc định: 1) |
| status | String | Trạng thái: available, occupied, reserved, maintenance (mặc định: available) |
| created_at | Date | Ngày tạo |

#### 4. **Reservation** (Đặt bàn)
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

#### 5. **ReservationDetail** (Chi tiết đặt bàn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| reservation_id | ObjectId | Đặt bàn (bắt buộc) |
| table_id | ObjectId | Bàn ăn (bắt buộc) |

#### 6. **Complaint** (Khiếu nại)
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

#### 7. **Ingredient** (Nguyên liệu)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên nguyên liệu (bắt buộc) |
| unit | String | Đơn vị (kg, g, l, ml, pieces) (bắt buộc) |
| quantity_in_stock | Number | Số lượng trong kho (mặc định: 0) |
| minimum_quantity | Number | Số lượng tối thiểu (mặc định: 0) |
| unit_price | Number | Giá đơn vị |
| supplier_name | String | Tên nhà cung cấp |
| supplier_contact | String | Thông tin liên hệ |
| status | String | Trạng thái: available, low_stock, out_of_stock |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 8. **StockImport** (Phiếu nhập kho)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| import_number | String | Mã phiếu nhập |
| staff_id | ObjectId | Nhân viên nhập |
| import_date | Date | Ngày nhập (bắt buộc) |
| total_cost | Number | Tổng chi phí |
| supplier_name | String | Tên nhà cung cấp |
| notes | String | Ghi chú |
| status | String | Trạng thái: pending, completed |
| created_at | Date | Ngày tạo |

#### 9. **StockImportDetail** (Chi tiết nhập kho)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| import_id | ObjectId | Phiếu nhập (bắt buộc) |
| ingredient_id | ObjectId | Nguyên liệu (bắt buộc) |
| quantity | Number | Số lượng (bắt buộc) |
| unit_price | Number | Giá đơn vị (bắt buộc) |
| line_total | Number | Tổng dòng |
| expiry_date | Date | Ngày hết hạn |

#### 10. **Dish** (Món ăn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên món (bắt buộc) |
| description | String | Mô tả |
| category | String | Loại: appetizer, main_course, beverage (bắt buộc) |
| price | Number | Giá (bắt buộc) |
| preparation_time | Number | Thời gian chuẩn bị (phút) |
| is_available | Boolean | Có sẵn (mặc định: true) |
| image_url | String | URL ảnh |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 11. **DishIngredient** (Junction Table: Món - Nguyên liệu)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| dish_id | ObjectId | Món ăn (bắt buộc) |
| ingredient_id | ObjectId | Nguyên liệu (bắt buộc) |
| quantity_required | Number | Số lượng cần (bắt buộc) |
| unit | String | Đơn vị (bắt buộc) |

#### 12. **Menu** (Thực đơn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên menu (bắt buộc) |
| description | String | Mô tả |
| menu_type | String | Loại: regular, lunch, dinner (bắt buộc) |
| is_active | Boolean | Hoạt động (mặc định: true) |
| valid_from | Date | Ngày bắt đầu |
| valid_to | Date | Ngày kết thúc |
| created_at | Date | Ngày tạo |

#### 13. **MenuEntry** (Junction Table: Menu - Món)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| menu_id | ObjectId | Menu (bắt buộc) |
| dish_id | ObjectId | Món ăn (bắt buộc) |
| display_order | Number | Thứ tự hiển thị (bắt buộc) |
| is_featured | Boolean | Nổi bật (mặc định: false) |

#### 14. **Order** (Đơn hàng) - Sử dụng Discriminators
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| order_number | String | Mã đơn (bắt buộc, duy nhất) |
| order_type | String | Loại: dine-in-waiter, dine-in-customer, takeaway-customer, takeaway-staff (bắt buộc) |
| order_date | Date | Ngày tạo (bắt buộc) |
| order_time | String | Giờ tạo |
| status | String | Trạng thái: pending, preparing, ready, served, completed (mặc định: pending) |
| subtotal | Number | Tổng cộng trước thuế |
| tax | Number | Thuế |
| total_amount | Number | Tổng tiền |
| table_id | ObjectId | Bàn ăn (cho dine-in) |
| customer_id | ObjectId | Khách hàng (cho dine-in-customer, takeaway-customer) |
| staff_id | ObjectId | Nhân viên (cho dine-in-waiter, takeaway-staff) |
| notes | String | Ghi chú |
| created_at | Date | Ngày tạo |
| updated_at | Date | Ngày cập nhật |

#### 15. **OrderDetail** (Chi tiết đơn hàng)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| order_id | ObjectId | Đơn hàng (bắt buộc) |
| dish_id | ObjectId | Món ăn (bắt buộc) |
| quantity | Number | Số lượng (bắt buộc) |
| unit_price | Number | Giá đơn vị (bắt buộc) |
| line_total | Number | Tổng dòng |
| special_instructions | String | Yêu cầu đặc biệt |
| status | String | Trạng thái: preparing, ready, served |

#### 16. **Promotion** (Khuyến mãi)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| name | String | Tên khuyến mãi (bắt buộc) |
| description | String | Mô tả |
| promotion_type | String | Loại: percentage, fixed_amount (bắt buộc) |
| discount_value | Number | Giá trị giảm (bắt buộc) |
| minimum_order_amount | Number | Số tiền tối thiểu áp dụng |
| promo_code | String | Mã khuyến mãi |
| start_date | Date | Ngày bắt đầu (bắt buộc) |
| end_date | Date | Ngày kết thúc (bắt buộc) |
| is_active | Boolean | Hoạt động (mặc định: true) |
| max_uses | Number | Số lần sử dụng tối đa (-1 = không giới hạn) |
| created_at | Date | Ngày tạo |

#### 17. **Invoice** (Hóa đơn)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| invoice_number | String | Mã hóa đơn (bắt buộc, duy nhất) |
| order_id | ObjectId | Đơn hàng |
| staff_id | ObjectId | Nhân viên (cashier) |
| customer_id | ObjectId | Khách hàng |
| invoice_date | Date | Ngày lập (bắt buộc) |
| subtotal | Number | Tổng cộng trước thuế (bắt buộc) |
| tax | Number | Thuế (bắt buộc) |
| discount_amount | Number | Số tiền giảm |
| total_amount | Number | Tổng tiền (bắt buộc) |
| payment_method | String | Phương thức: cash, card, e-wallet (bắt buộc) |
| payment_status | String | Trạng thái: pending, paid (mặc định: pending) |
| paid_at | Date | Ngày thanh toán |
| notes | String | Ghi chú |
| created_at | Date | Ngày tạo |

#### 18. **InvoicePromotion** (Junction Table: Hóa đơn - Khuyến mãi)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| invoice_id | ObjectId | Hóa đơn (bắt buộc) |
| promotion_id | ObjectId | Khuyến mãi (bắt buộc) |
| discount_applied | Number | Số tiền giảm áp dụng (bắt buộc) |

#### 19. **Violation** (Vi phạm)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| customer_id | ObjectId | Khách hàng (bắt buộc) |
| description | String | Mô tả vi phạm (bắt buộc) |
| violation_date | Date | Ngày vi phạm (mặc định: hiện tại) |
| resolution | String | Giải pháp |
| resolved_at | Date | Ngày giải quyết |

#### 20. **Rating** (Đánh giá)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| customer_id | ObjectId | Khách hàng (bắt buộc) |
| description | String | Nội dung đánh giá |
| rating_date | Date | Ngày đánh giá (mặc định: hiện tại) |
| score | Number | Điểm (1-5, bắt buộc) |

#### 21. **RatingReply** (Phản hồi đánh giá)
| Trường | Kiểu | Mô tả |
|--------|------|-------|
| rating_id | ObjectId | Đánh giá (bắt buộc) |
| staff_id | ObjectId | Nhân viên phản hồi (bắt buộc) |
| reply_text | String | Nội dung phản hồi (bắt buộc) |
| reply_date | Date | Ngày phản hồi (mặc định: hiện tại) |

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

Seed sẽ tạo dữ liệu đầy đủ cho 20 bảng:
- **6 Staff** (2 waiter, 2 cashier, 2 manager)
- **5 Customers** (với các membership level khác nhau)
- **10 Tables** (indoor, outdoor, vip với các sàn khác nhau)
- **4 Reservations** với chi tiết đầy đủ
- **3 Complaints** với resolution
- **10 Ingredients** với suppliers và stock levels
- **3 Stock Imports** và 6 chi tiết import
- **8 Dishes** (appetizer, main_course, beverage)
- **10 Dish-Ingredient links**
- **3 Menus** (regular, lunch, dinner)
- **11 Menu Entries**
- **3 Promotions** (percentage, fixed_amount, happy hour)
- **4 Orders** với discriminators khác nhau (dine-in-waiter, dine-in-customer, takeaway-customer)
- **10 Order Details**
- **3 Invoices** với payment tracking
- **1 Invoice Promotion**
- **1 Violation** (tracking customer behavior)
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
| Vai trò | Email | Mật khẩu | Ghi chú |
|---------|-------|----------|--------|
| Waiter | hung.waiter@restaurant.vn | password123 | Phục vụ bàn |
| Waiter | mai.waiter@restaurant.vn | password123 | Phục vụ bàn |
| Cashier | nam.cashier@restaurant.vn | password123 | Lập hóa đơn |
| Cashier | lan.cashier@restaurant.vn | password123 | Lập hóa đơn |
| Manager | minh.manager@restaurant.vn | password123 | Quản lý nhà hàng |
| Manager | hoa.manager@restaurant.vn | password123 | Quản lý nhà hàng |

### Customer Accounts
| Cấp độ | Email | Mật khẩu | Điểm | Chi tiêu |
|-------|-------|----------|------|---------|
| Gold | tuan.nguyen@gmail.com | password123 | 2500 | 12.5M |
| Silver | huong.tran@gmail.com | password123 | 1200 | 6M |
| Gold | huy.le@gmail.com | password123 | 1800 | 9M |
| Regular | nga.pham@gmail.com | password123 | 350 | 1.75M |
| Silver | khoa.vo@gmail.com | password123 | 900 | 4.5M |

---

## 📊 Relationships (Mối quan hệ)

```
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
└─ 1-N → Order (table_id cho dine-in orders)

Reservation:
├─ 1-N → ReservationDetail (reservation_id)
└─ N-1 → Customer (customer_id)

Ingredient:
├─ 1-N → StockImportDetail (ingredient_id)
├─ 1-N → DishIngredient (ingredient_id)
└─ N-1 → StockImport (qua StockImportDetail)

Dish:
├─ 1-N → DishIngredient (dish_id)
├─ 1-N → MenuEntry (dish_id)
└─ 1-N → OrderDetail (dish_id)

Menu:
├─ 1-N → MenuEntry (menu_id)
└─ N-N → Dish (qua MenuEntry)

Order (Polymorphic - sử dụng Discriminators):
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
