# API Integration Documentation

**Version**: 1.3  
**Last Updated**: December 14, 2025

## Changelog

### Version 1.3 (December 14, 2025)

- ✅ Thêm automatic inventory deduction khi waiter gọi món (POST /orders)
- ✅ Thêm logic hoàn nguyên liệu khi hủy món ở trạng thái `pending`
- ✅ Thêm chi tiết xử lý Race Conditions và Conflicts trong inventory management
- ✅ Cập nhật GET /menu: thêm `unavailableReason` khi món hết nguyên liệu
- ✅ Thêm Business Logic Notes về Inventory Management với database transaction patterns
- ✅ Thêm error handling cho `INSUFFICIENT_INVENTORY` và `CANNOT_CANCEL`

### Version 1.2 (December 13, 2025)

- ✅ Cập nhật Menu Management APIs: chi tiết về ingredients từ inventory
- ✅ Cập nhật Upload APIs: hỗ trợ base64 image upload
- ✅ Thêm ConfirmationModal component documentation

### Version 1.1 (December 13, 2025)

- ✅ Thêm 5 membership tiers: diamond, platinum, gold, silver, bronze (thay vì 3 tiers)
- ✅ Thêm `promotionQuantity` vào Promotion để quản lý số lượng lượt dùng
- ✅ Thêm `customerSelectedVoucher` và `customerSelectedPoints` vào Invoice
- ✅ Thêm `isBlacklisted` vào Customer response
- ✅ Thêm `brokenReason` vào Table khi status = "broken"
- ✅ Thêm Location & Floor Management APIs (section 2.8)
- ✅ Thêm Booking eligibility check API (section 5.0)
- ✅ Cập nhật Business Logic Notes với logic blacklist và promotion quantity
- ✅ Thêm `paymentMethod` và `paidAt` vào Invoice response
- ✅ Cập nhật invoice status: thêm "payment-requested"

## Overview

Tài liệu này mô tả các API endpoints cần thiết để tích hợp backend với frontend của hệ thống quản lý nhà hàng.

**Base URL**: `/api/v1`

**Authentication**: Sử dụng JWT token trong header `Authorization: Bearer <token>`

---

## 1. Authentication APIs

### 1.1 Đăng nhập

```
POST /auth/login
```

**Request Body:**

```json
{
  "username": "string",
  "password": "string",
  "role": "customer" | "manager" | "cashier" | "waiter"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "role": "customer" | "manager" | "cashier" | "waiter",
      "employeeId": "string" // chỉ có với staff
    }
  }
}
```

### 1.2 Đăng ký (Customer)

```
POST /auth/register
```

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "message": "Đăng ký thành công"
  }
}
```

### 1.3 Đăng xuất

```
POST /auth/logout
```

**Response:**

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

### 1.4 Lấy thông tin user hiện tại

```
GET /auth/me
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "string",
    "membershipTier": "diamond" | "platinum" | "gold" | "silver" | "bronze", // chỉ customer
    "points": 0, // chỉ customer
    "isBlacklisted": false // chỉ customer
  }
}
```

---

## 2. Table Management APIs (Staff only)

### 2.1 Lấy danh sách bàn

```
GET /tables
```

**Query Parameters:**

- `area`: string (optional) - Lọc theo khu vực
- `status`: string (optional) - Lọc theo trạng thái
- `floor`: string (optional) - Lọc theo tầng

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "number": "string",
      "area": "string",
      "seats": 4,
      "status": "free" | "occupied" | "reserved" | "dirty" | "broken",
      "floor": "string",
      "brokenReason": "string" // optional, chỉ khi status = "broken"
    }
  ]
}
```

### 2.2 Tạo bàn mới

```
POST /tables
```

**Request Body:**

```json
{
  "number": "string",
  "area": "string",
  "seats": 4,
  "floor": "string"
}
```

### 2.3 Cập nhật thông tin bàn

```
PUT /tables/:id
```

**Request Body:**

```json
{
  "number": "string",
  "area": "string",
  "seats": 4,
  "status": "free" | "occupied" | "reserved" | "dirty" | "broken",
  "floor": "string"
}
```

### 2.4 Xóa bàn

```
DELETE /tables/:id
```

### 2.5 Cập nhật trạng thái bàn

```
PATCH /tables/:id/status
```

**Request Body:**

```json
{
  "status": "free" | "occupied" | "reserved" | "dirty" | "broken"
}
```

### 2.6 Lấy bàn được phân công (Waiter)

```
GET /tables/my-assigned
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "number": "string",
      "area": "string",
      "seats": 4,
      "status": "free" | "occupied" | "reserved" | "dirty" | "broken",
      "floor": "string",
      "assignedAt": "2025-12-11T09:00:00Z"
    }
  ]
}
```

### 2.7 Phân công bàn cho waiter (Manager)

```
POST /tables/:id/assign
```

**Request Body:**

```json
{
  "waiterId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đã phân công bàn thành công"
}
```

---

## 2.8 Location & Floor Management APIs (Manager only)

### 2.8.1 Lấy danh sách locations

```
GET /locations
```

**Query Parameters:**

- `floor`: string (optional) - Lọc theo tầng

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "floor": "string",
      "description": "string",
      "createdAt": "2025-12-11T09:00:00Z"
    }
  ]
}
```

### 2.8.2 Tạo location mới

```
POST /locations
```

**Request Body:**

```json
{
  "name": "string",
  "floor": "string",
  "description": "string"
}
```

### 2.8.3 Cập nhật location

```
PUT /locations/:id
```

### 2.8.4 Xóa location

```
DELETE /locations/:id
```

**Note:** Không được xóa location nếu còn bàn thuộc location đó

### 2.8.5 Lấy danh sách floors

```
GET /floors
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "level": 1,
      "description": "string"
    }
  ]
}
```

### 2.8.6 Tạo floor mới

```
POST /floors
```

**Request Body:**

```json
{
  "name": "string",
  "level": 1,
  "description": "string"
}
```

### 2.8.7 Cập nhật floor

```
PUT /floors/:id
```

### 2.8.8 Xóa floor

```
DELETE /floors/:id
```

**Note:** Không được xóa floor nếu còn location trên floor đó

---

## 3. Menu Management APIs

### 3.1 Lấy danh sách món ăn

```
GET /menu
```

**Query Parameters:**

- `category`: string (optional) - Lọc theo danh mục
- `available`: boolean (optional) - Lọc món còn/hết
- `search`: string (optional) - Tìm kiếm theo tên

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "price": 85000,
      "description": "string",
      "image": "string", // base64 hoặc URL
      "available": true,
      "unavailableReason": "Hết nguyên liệu", // chỉ hiển thị khi available = false
      "ingredients": [
        {
          "inventoryItemId": "string",
          "name": "string",
          "quantity": 0.5,
          "unit": "kg"
        }
      ]
    }
  ]
}
```

**Business Logic:**

- Khi load danh sách món ăn, backend cần kiểm tra tồn kho (inventory) của từng nguyên liệu
- Nếu bất kỳ nguyên liệu nào trong `ingredients` không đủ số lượng:
  - Set `available = false`
  - Thêm `unavailableReason` (VD: "Hết nguyên liệu: Tôm hùm", "Nguyên liệu không đủ")
- Frontend hiển thị món ăn không khả dụng với badge "Hết món" và ghi chú lý do

### 3.2 Tạo món ăn mới (Manager only)

```
POST /menu
```

**Request Body:**

```json
{
  "name": "string",
  "category": "string",
  "price": 85000,
  "description": "string",
  "image": "string", // base64 encoded image hoặc URL
  "ingredients": [
    {
      "inventoryItemId": "string",
      "quantity": 0.5
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category": "string",
    "price": 85000,
    "description": "string",
    "image": "string",
    "available": true,
    "ingredients": [...]
  }
}
```

**Note:**

- `ingredients` chứa danh sách nguyên liệu từ inventory
- Frontend sẽ chọn nguyên liệu từ dropdown (inventory items)
- Backend cần validate `inventoryItemId` có tồn tại
- Khi tạo món mới, mặc định `available = true`

### 3.3 Cập nhật món ăn (Manager only)

```
PUT /menu/:id
```

**Request Body:** Same as POST /menu

**Response:** Same as POST /menu

**Note:**

- Có thể cập nhật cả image (base64 mới) hoặc giữ nguyên image cũ
- Ingredients có thể được thay đổi hoàn toàn

### 3.4 Xóa món ăn (Manager only)

```
DELETE /menu/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Xóa món ăn thành công"
}
```

### 3.5 Cập nhật trạng thái món (Manager/Staff)

```
PATCH /menu/:id/availability
```

**Request Body:**

```json
{
  "available": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "available": true
  }
}
```

**Note:**

- Manager có thể thủ công set `available = false` khi muốn tạm ngưng phục vụ món (không phụ thuộc vào inventory)
- Tuy nhiên, **backend vẫn luôn tự động override `available = false`** nếu thiếu nguyên liệu trong inventory
- Logic ưu tiên:
  1. Check inventory trước → nếu thiếu nguyên liệu → force `available = false`
  2. Nếu đủ nguyên liệu → check giá trị `available` do manager/staff set
- Khi manager xem danh sách món trong MenuPromotionPage, món nào hết nguyên liệu sẽ hiển thị badge "Hết món" và có `unavailableReason`
- Manager có thể:
  - Nhập thêm nguyên liệu vào kho → món tự động available trở lại
  - Tạm ngưng món thủ công (VD: nghỉ phục vụ tạm thời)
  - Xem lý do món không available (thiếu nguyên liệu hay bị tắt thủ công)

---

## 4. Order Management APIs

### 4.1 Tạo order mới (Waiter)

```
POST /orders
```

**Request Body:**

```json
{
  "tableId": "string",
  "customerId": "string", // optional nếu khách vãng lai
  "items": [
    {
      "menuItemId": "string",
      "quantity": 2,
      "notes": "string"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "string",
    "tableId": "string",
    "items": [...],
    "status": "pending"
  }
}
```

**Business Logic - Tự động trừ nguyên liệu khi tạo order:**

1. **Validate tồn kho trước khi tạo order:**
   - Với mỗi `menuItemId`, lấy danh sách `ingredients` và `quantity` cần thiết
   - Tính tổng nguyên liệu cần = `ingredient.quantity * orderItem.quantity`
   - Kiểm tra inventory có đủ nguyên liệu không
   - Nếu KHÔNG ĐỦ → Return error: `INSUFFICIENT_INVENTORY` với chi tiết nguyên liệu thiếu
2. **Trừ nguyên liệu ngay lập tức (Pessimistic Locking):**
   - Khi order được tạo thành công, tự động trừ số lượng nguyên liệu trong inventory
   - Sử dụng database transaction để đảm bảo tính nhất quán
   - Log lại việc trừ kho với `reason = "order_created"`, `orderId`, `orderItemId`
3. **Xử lý xung đột (Race Condition):**
   - Sử dụng database row-level locking khi cập nhật inventory
   - Nếu có nhiều waiter cùng order món cần cùng nguyên liệu:
     - Transaction đầu tiên thành công → order được tạo, nguyên liệu bị trừ
     - Transaction sau nếu không đủ nguyên liệu → rollback và báo lỗi
   - Pattern: `SELECT ... FOR UPDATE` trong transaction
4. **Đảm bảo Atomicity:**
   - Toàn bộ quá trình (tạo order + trừ inventory) phải trong 1 database transaction
   - Nếu trừ inventory thất bại → rollback việc tạo order
   - Nếu tạo order thất bại → không trừ inventory

**Error Responses:**

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_INVENTORY",
    "message": "Không đủ nguyên liệu để phục vụ món ăn",
    "details": {
      "missingIngredients": [
        {
          "name": "Tôm hùm",
          "required": 1.5,
          "available": 0.8,
          "unit": "kg"
        }
      ]
    }
  }
}
```

### 4.2 Lấy orders theo bàn

```
GET /orders/table/:tableId
```

### 4.3 Cập nhật trạng thái món trong order

```
PATCH /orders/:orderId/items/:itemId/status
```

**Request Body:**

```json
{
  "status": "pending" | "cooking" | "served"
}
```

### 4.4 Thêm món vào order hiện tại

```
POST /orders/:orderId/items
```

**Request Body:**

```json
{
  "menuItemId": "string",
  "quantity": 1,
  "notes": "string"
}
```

**Business Logic - Tự động trừ nguyên liệu:**

- Áp dụng CÙNG logic như `POST /orders` (section 4.1)
- Validate tồn kho → Trừ nguyên liệu ngay lập tức
- Sử dụng transaction với row-level locking
- Log: `reason = "order_item_added"`

### 4.5 Hủy món trong order

```
DELETE /orders/:orderId/items/:itemId
```

**Business Logic - Hoàn lại nguyên liệu khi hủy món:**

1. **Kiểm tra trạng thái món ăn:**
   - Lấy trạng thái hiện tại của order item: `pending` | `cooking` | `served`
2. **Logic hoàn nguyên liệu:**

   - **TRẠNG THÁI `pending` (Chờ xử lý):**

     - Món chưa vào bếp → Hoàn lại TOÀN BỘ nguyên liệu đã trừ
     - Cộng lại số lượng vào inventory
     - Log: `reason = "order_item_cancelled"`, `orderId`, `orderItemId`

   - **TRẠNG THÁI `cooking` (Đang nấu):**

     - Món đã vào bếp → KHÔNG hoàn lại nguyên liệu
     - Nguyên liệu đã được sử dụng/đang chế biến

   - **TRẠNG THÁI `served` (Đã phục vụ):**
     - Món đã ra khách → KHÔNG hoàn lại nguyên liệu
     - Món đã được tiêu thụ

3. **Xử lý xung đột (Race Condition):**

   - **Trường hợp 1: Waiter hủy món ĐỒNG THỜI với việc bếp chuyển status sang `cooking`:**

     - Sử dụng row-level locking trên order_items table
     - Transaction lock order item trước khi check status
     - Nếu status đã thay đổi → báo lỗi không thể hủy

   - **Trường hợp 2: Nhiều waiter cùng hủy món:**

     - Transaction đầu tiên lock order item → hủy thành công
     - Transaction sau nhận lỗi `ORDER_ITEM_NOT_FOUND` hoặc `ALREADY_DELETED`

   - **Trường hợp 3: Hủy món ĐỒNG THỜI với việc tạo món mới cần cùng nguyên liệu:**
     - Transaction hoàn nguyên liệu (DELETE) lock inventory row
     - Transaction tạo món mới (POST) phải chờ lock được release
     - Đảm bảo inventory quantity luôn chính xác

4. **Database Transaction Pattern:**

   ```sql
   BEGIN TRANSACTION;

   -- Lock order item
   SELECT status FROM order_items
   WHERE id = :orderItemId
   FOR UPDATE;

   IF status = 'pending' THEN
     -- Lock inventory rows
     SELECT quantity FROM inventory
     WHERE id IN (:ingredientIds)
     FOR UPDATE;

     -- Restore ingredients
     UPDATE inventory
     SET quantity = quantity + :returnAmount
     WHERE id = :ingredientId;

     -- Log inventory transaction
     INSERT INTO inventory_logs (...);
   END IF;

   -- Delete order item
   DELETE FROM order_items WHERE id = :orderItemId;

   COMMIT;
   ```

5. **Đảm bảo Consistency:**
   - Toàn bộ quá trình (kiểm tra status + hoàn nguyên liệu + xóa item) trong 1 transaction
   - Nếu bất kỳ bước nào thất bại → rollback toàn bộ
   - Inventory quantity luôn chính xác dù có bao nhiêu concurrent requests

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Đã hủy món",
    "ingredientsRestored": true, // true nếu hoàn nguyên liệu, false nếu không
    "restoredItems": [
      {
        "name": "Tôm hùm",
        "quantity": 0.5,
        "unit": "kg"
      }
    ]
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_CANCEL",
    "message": "Không thể hủy món đang nấu hoặc đã phục vụ",
    "details": {
      "currentStatus": "cooking",
      "reason": "Món đã vào bếp, không thể hoàn nguyên liệu"
    }
  }
}
```

**Note quan trọng:**

- **Pessimistic Locking Strategy**: Sử dụng database locks để đảm bảo consistency
- **ACID Transactions**: Mọi thao tác phải tuân thủ ACID properties
- **Idempotency**: API hủy món nên idempotent - gọi nhiều lần không gây side effects
- **Audit Trail**: Log đầy đủ mọi thay đổi inventory để audit và debug
- **Performance**: Monitor lock wait time, optimize query nếu cần
- **Deadlock Prevention**: Luôn lock resources theo thứ tự nhất định (order_items → inventory)

---

## 5. Booking APIs

### 5.0 Kiểm tra điều kiện đặt bàn (Customer)

```
GET /bookings/check-eligibility
```

**Response:**

```json
{
  "success": true,
  "data": {
    "canBook": false,
    "isBlacklisted": true,
    "violations": [
      {
        "id": "string",
        "type": "no-show" | "late-cancel" | "damage",
        "description": "string",
        "date": "2025-11-20"
      }
    ],
    "message": "Tài khoản bị hạn chế do vi phạm chính sách"
  }
}
```

### 5.1 Tạo booking (Customer)

```
POST /bookings
```

**Request Body:**

```json
{
  "tableId": "string",
  "date": "2025-12-15",
  "time": "19:00",
  "guests": 4,
  "specialRequests": "string",
  "preOrders": [
    {
      "menuItemId": "string",
      "quantity": 2
    }
  ],
  "depositAmount": 200000
}
```

### 5.2 Lấy danh sách bookings

```
GET /bookings
```

**Query Parameters:**

- `customerId`: string (optional) - Lọc theo khách hàng
- `date`: string (optional) - Lọc theo ngày
- `status`: string (optional) - Lọc theo trạng thái

### 5.3 Lấy booking của customer hiện tại

```
GET /bookings/my-bookings
```

### 5.4 Cập nhật trạng thái booking (Staff)

```
PATCH /bookings/:id/status
```

**Request Body:**

```json
{
  "status": "pending" | "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show"
}
```

### 5.5 Hủy booking (Customer/Staff)

```
DELETE /bookings/:id
```

**Request Body:**

```json
{
  "reason": "string" // optional - lý do hủy
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookingId": "string",
    "refundAmount": 200000, // số tiền cọc được hoàn
    "refundPercentage": 100, // % hoàn cọc
    "message": "Đã hủy đặt bàn và hoàn 100% tiền cọc"
  }
}
```

**Business Logic - Chính sách hoàn cọc:**

1. **Điều kiện hủy:**

   - Customer chỉ có thể hủy booking với status `pending` hoặc `confirmed`
   - Không thể hủy booking đã `checked-in`, `completed`, hoặc `no-show`
   - Staff có thể hủy bất kỳ booking nào (trừ `completed`)

2. **Chính sách hoàn tiền cọc:**

   - **Hủy trước >= 24 giờ**: Hoàn 100% tiền cọc (200,000đ)
   - **Hủy trước 12-24 giờ**: Hoàn 50% tiền cọc (100,000đ)
   - **Hủy trước 2-12 giờ**: Hoàn 30% tiền cọc (60,000đ)
   - **Hủy < 2 giờ hoặc no-show**: Không hoàn tiền cọc (0đ)

3. **Cập nhật trạng thái:**

   - Booking status → `cancelled`
   - Table status → `free` (nếu đang `reserved`)
   - Ghi lại lý do hủy và thời điểm hủy

4. **Vi phạm và Blacklist:**

   - Nếu hủy < 2 giờ: Ghi nhận vi phạm `late-cancel`
   - Nếu không đến (no-show): Ghi nhận vi phạm `no-show`
   - 3 vi phạm no-show → tự động blacklist

5. **Notifications:**
   - Gửi email/SMS thông báo hủy booking cho customer
   - Thông báo số tiền được hoàn và thời gian xử lý
   - Nếu có vi phạm → cảnh báo về chính sách

**Error Responses:**

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_CANCEL",
    "message": "Không thể hủy booking đã check-in",
    "details": {
      "currentStatus": "checked-in",
      "reason": "Booking đã được check-in, vui lòng liên hệ nhân viên"
    }
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "LATE_CANCELLATION",
    "message": "Hủy muộn - chỉ được hoàn 30% tiền cọc",
    "details": {
      "hoursUntilBooking": 3,
      "refundAmount": 60000,
      "refundPercentage": 30,
      "willAddViolation": true,
      "violationType": "late-cancel"
    }
  }
}
```

### 5.6 Check-in booking (Staff)

```
POST /bookings/:id/check-in
```

---

## 6. Invoice/Payment APIs

### 6.1 Tạo hóa đơn từ order (Cashier)

```
POST /invoices
```

**Request Body:**

```json
{
  "tableId": "string",
  "customerId": "string", // optional
  "orderId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "tableId": "string",
    "items": [...],
    "subtotal": 500000,
    "tax": 50000,
    "discount": 0,
    "total": 550000,
    "status": "pending" | "payment-requested" | "paid" | "cancelled",
    "paymentMethod": "cash" | "card" | "wallet" | "online", // optional
    "paidAt": "2025-12-11T09:00:00Z", // optional
    "customerSelectedVoucher": false, // optional
    "customerSelectedPoints": 0 // optional
  }
}
```

### 6.2 Lấy danh sách hóa đơn

```
GET /invoices
```

**Query Parameters:**

- `status`: string (optional)
- `customerId`: string (optional)
- `tableId`: string (optional)
- `from`: date (optional)
- `to`: date (optional)

### 6.3 Lấy hóa đơn của customer hiện tại

```
GET /invoices/my-invoices
```

### 6.4 Lấy hóa đơn hiện tại tại bàn

```
GET /invoices/current-table/:tableId
```

### 6.5 Áp dụng voucher

```
POST /invoices/:id/apply-voucher
```

**Request Body:**

```json
{
  "voucherCode": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "discountAmount": 50000,
    "newTotal": 500000
  }
}
```

### 6.6 Quy đổi điểm

```
POST /invoices/:id/use-points
```

**Request Body:**

```json
{
  "pointsToUse": 1000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "discountAmount": 100000,
    "newTotal": 450000,
    "remainingPoints": 500
  }
}
```

### 6.7 Yêu cầu thanh toán (Customer tại bàn)

```
POST /invoices/:id/request-payment
```

### 6.8 Xử lý thanh toán (Cashier)

```
POST /invoices/:id/process-payment
```

**Request Body:**

```json
{
  "paymentMethod": "cash" | "card" | "wallet" | "online",
  "amountPaid": 550000
}
```

### 6.9 Gửi đánh giá (Customer)

```
POST /invoices/:id/feedback
```

**Request Body:**

```json
{
  "rating": 5,
  "comment": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedbackId": "string",
    "message": "Cảm ơn bạn đã gửi đánh giá!"
  }
}
```

**Business Logic:**

- Customer chỉ có thể feedback cho invoice đã thanh toán (`status = "paid"`)
- Mỗi invoice chỉ được feedback 1 lần
- Nếu đã có feedback → return error `FEEDBACK_ALREADY_EXISTS`
- Rating: 1-5 sao (bắt buộc)
- Comment: text (bắt buộc)

### 6.10 Lấy danh sách feedback (Manager)

```
GET /feedbacks
```

**Query Parameters:**

- `status`: "pending" | "replied" (optional) - Lọc theo trạng thái
- `rating`: 1-5 (optional) - Lọc theo rating
- `from`: date (optional)
- `to`: date (optional)
- `limit`: number (optional, default: 20)
- `page`: number (optional, default: 1)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "invoiceId": "string",
      "customerId": "string",
      "customerName": "string",
      "rating": 5,
      "comment": "Món ăn rất ngon!",
      "createdAt": "2025-12-14T10:00:00Z",
      "reply": {
        "content": "Cảm ơn bạn đã đánh giá!",
        "repliedBy": "Manager Nguyễn Văn A",
        "repliedAt": "2025-12-14T11:00:00Z"
      } // null if not replied yet
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 6.11 Phản hồi feedback (Manager)

```
POST /feedbacks/:id/reply
```

**Request Body:**

```json
{
  "content": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedbackId": "string",
    "reply": {
      "content": "Cảm ơn bạn đã đánh giá!",
      "repliedBy": "Manager Nguyễn Văn A",
      "repliedAt": "2025-12-14T11:00:00Z"
    }
  }
}
```

**Business Logic:**

- Chỉ Manager mới có quyền reply feedback
- Mỗi feedback chỉ được reply 1 lần
- Nếu đã reply → return error `FEEDBACK_ALREADY_REPLIED`
- Customer không thể feedback lại sau khi Manager đã reply
- Reply được lưu vào database với thông tin manager (name, id, timestamp)

### 6.12 Xóa feedback (Manager)

```
DELETE /feedbacks/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Đã xóa feedback"
}
```

**Note:** Chỉ Manager mới có quyền xóa feedback

### 6.13 Lấy chi tiết invoice (bao gồm feedback)

Khi gọi API lấy invoice detail, response sẽ bao gồm cả feedback (nếu có):

```
GET /invoices/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "items": [...],
    "total": 500000,
    "status": "paid",
    "feedback": {
      "id": "string",
      "rating": 5,
      "comment": "Món ăn rất ngon!",
      "createdAt": "2025-12-14T10:00:00Z",
      "reply": {
        "content": "Cảm ơn bạn đã đánh giá!",
        "repliedBy": "Manager Nguyễn Văn A",
        "repliedAt": "2025-12-14T11:00:00Z"
      } // null if not replied
    } // null if no feedback
  }
}
```

---

## 7. Customer Management APIs (Manager only)

### 7.1 Lấy danh sách khách hàng

```
GET /customers
```

**Query Parameters:**

- `tier`: string (optional) - Lọc theo hạng
- `search`: string (optional) - Tìm kiếm theo tên/SĐT
- `isBlacklisted`: boolean (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "phone": "string",
      "email": "string",
      "membershipTier": "diamond" | "platinum" | "gold" | "silver" | "bronze",
      "points": 1500,
      "totalSpent": 15000000,
      "violations": [...],
      "isBlacklisted": false
    }
  ]
}
```

### 7.2 Lấy chi tiết khách hàng

```
GET /customers/:id
```

### 7.2.1 Tìm kiếm khách hàng theo số điện thoại (Waiter)

```
GET /customers/search-by-phone
```

**Query Parameters:**

- `phone`: string (required) - Số điện thoại khách hàng

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "phone": "string",
    "email": "string",
    "membershipTier": "gold",
    "points": 1500,
    "isBlacklisted": false
  }
}
```

**Note:** API này dùng cho waiter khi tạo order mới và cần tìm thông tin customer

### 7.3 Cập nhật thông tin khách hàng

```
PUT /customers/:id
```

### 7.4 Thêm vi phạm

```
POST /customers/:id/violations
```

**Request Body:**

```json
{
  "type": "no-show" | "late-cancel" | "damage",
  "description": "string"
}
```

### 7.5 Thêm/xóa blacklist

```
PATCH /customers/:id/blacklist
```

**Request Body:**

```json
{
  "isBlacklisted": true
}
```

---

## 8. Staff Management APIs (Manager only)

### 8.1 Lấy danh sách nhân viên

```
GET /staff
```

**Query Parameters:**

- `role`: string (optional)
- `status`: string (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "username": "string",
      "role": "manager" | "cashier" | "waiter",
      "phone": "string",
      "email": "string",
      "status": "active" | "inactive",
      "permissions": ["string"]
    }
  ]
}
```

### 8.2 Tạo nhân viên mới

```
POST /staff
```

**Request Body:**

```json
{
  "name": "string",
  "username": "string",
  "password": "string",
  "role": "manager" | "cashier" | "waiter",
  "phone": "string",
  "email": "string",
  "permissions": ["string"]
}
```

### 8.3 Cập nhật thông tin nhân viên

```
PUT /staff/:id
```

### 8.4 Xóa nhân viên

```
DELETE /staff/:id
```

### 8.5 Cập nhật quyền hạn

```
PATCH /staff/:id/permissions
```

**Request Body:**

```json
{
  "permissions": ["view_reports", "manage_inventory"]
}
```

---

## 9. Inventory Management APIs (Manager only)

### 9.1 Lấy danh sách tồn kho

```
GET /inventory
```

**Query Parameters:**

- `lowStock`: boolean (optional) - Lọc nguyên liệu sắp hết
- `expiring`: boolean (optional) - Lọc nguyên liệu sắp hết hạn

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "quantity": 100,
      "unit": "kg",
      "expiryDate": "2025-12-31",
      "supplierId": "string",
      "lastUpdated": "2025-12-11T09:00:00Z"
    }
  ]
}
```

### 9.2 Nhập kho

```
POST /inventory/import
```

**Request Body:**

```json
{
  "items": [
    {
      "itemId": "string",
      "quantity": 50,
      "supplierId": "string",
      "expiryDate": "2025-12-31"
    }
  ]
}
```

### 9.3 Xuất kho

```
POST /inventory/export
```

**Request Body:**

```json
{
  "items": [
    {
      "itemId": "string",
      "quantity": 10,
      "reason": "string"
    }
  ]
}
```

### 9.4 Cập nhật nguyên liệu

```
PUT /inventory/:id
```

### 9.5 Lấy danh sách nhà cung cấp

```
GET /suppliers
```

### 9.6 Tạo nhà cung cấp mới

```
POST /suppliers
```

**Request Body:**

```json
{
  "name": "string",
  "phone": "string",
  "address": "string"
}
```

---

## 10. Promotion Management APIs

### 10.1 Lấy danh sách khuyến mãi

```
GET /promotions
```

**Query Parameters:**

- `active`: boolean (optional) - Lọc khuyến mãi đang hoạt động

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "code": "string",
      "discountType": "percentage" | "fixed",
      "discountValue": 20,
      "description": "string",
      "minOrderAmount": 200000,
      "maxDiscountAmount": 100000,
      "promotionQuantity": 100, // optional, số lượng lượt dùng còn lại
      "startDate": "2025-12-01",
      "endDate": "2025-12-31",
      "active": true
    }
  ]
}
```

### 10.2 Tạo khuyến mãi (Manager)

```
POST /promotions
```

### 10.3 Cập nhật khuyến mãi (Manager)

```
PUT /promotions/:id
```

### 10.4 Xóa khuyến mãi (Manager)

```
DELETE /promotions/:id
```

### 10.5 Kiểm tra mã khuyến mãi

```
POST /promotions/validate
```

**Request Body:**

```json
{
  "code": "string",
  "orderAmount": 500000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "promotion": {...},
    "discountAmount": 50000
  }
}
```

---

## 11. Membership & Rewards APIs

### 11.1 Lấy thông tin membership hiện tại

```
GET /membership/me
```

**Response:**

```json
{
  "success": true,
  "data": {
    "tier": "gold",
    "points": 1500,
    "nextTierPoints": 2000,
    "totalSpent": 15000000,
    "benefits": ["string"]
  }
}
```

### 11.2 Lấy lịch sử điểm

```
GET /membership/points-history
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "type": "earned" | "redeemed" | "expired",
      "amount": 100,
      "description": "string",
      "date": "2025-12-11",
      "invoiceId": "string"
    }
  ]
}
```

### 11.3 Lấy danh sách rewards

```
GET /rewards
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "pointsCost": 1000,
      "description": "string",
      "image": "string"
    }
  ]
}
```

### 11.4 Đổi reward

```
POST /rewards/:id/redeem
```

**Response:**

```json
{
  "success": true,
  "data": {
    "voucherCode": "string",
    "remainingPoints": 500
  }
}
```

### 11.5 Lấy lịch sử sử dụng voucher

```
GET /membership/voucher-history
```

---

## 12. Dashboard APIs (Manager only)

### 12.1 Lấy thống kê tổng quan

```
GET /dashboard/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "todayRevenue": {
      "value": "15.5M",
      "change": "+12.5%"
    },
    "todayCustomers": {
      "value": "234",
      "change": "+8.2%"
    },
    "todayOrders": {
      "value": "89",
      "change": "+5.4%"
    },
    "lowStockAlerts": {
      "value": "5",
      "change": "-2"
    }
  }
}
```

### 12.2 Lấy dữ liệu biểu đồ doanh thu

```
GET /dashboard/revenue-chart
```

**Query Parameters:**

- `period`: "week" | "month" | "year" (default: "week")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "T2",
      "revenue": 12000000,
      "orders": 45
    },
    {
      "name": "T3",
      "revenue": 15000000,
      "orders": 52
    }
  ]
}
```

### 12.3 Lấy danh sách món ăn bán chạy

```
GET /dashboard/popular-dishes
```

**Query Parameters:**

- `limit`: number (optional, default: 10)
- `period`: "today" | "week" | "month" (default: "week")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "Phở Bò",
      "orders": 45,
      "revenue": 3825000
    },
    {
      "name": "Bún Chả",
      "orders": 38,
      "revenue": 2850000
    }
  ]
}
```

---

## 13. Reports & Analytics APIs (Manager only)

### 13.1 Báo cáo doanh thu

```
GET /reports/revenue
```

**Query Parameters:**

- `from`: date (required)
- `to`: date (required)
- `groupBy`: "day" | "week" | "month" (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 145800000,
    "totalOrders": 856,
    "averageOrderValue": 170327,
    "revenueByDate": [
      {
        "date": "2025-12-01",
        "revenue": 5200000,
        "orders": 32
      }
    ]
  }
}
```

### 12.2 Báo cáo món ăn phổ biến

```
GET /reports/popular-dishes
```

**Query Parameters:**

- `from`: date (required)
- `to`: date (required)
- `limit`: number (optional, default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "menuItemId": "string",
      "name": "string",
      "totalOrders": 156,
      "totalRevenue": 13260000
    }
  ]
}
```

### 12.3 Báo cáo khách hàng

```
GET /reports/customers
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalCustomers": 1445,
    "newCustomers": 128,
    "returningCustomers": 467,
    "vipCustomers": 850,
    "customersByTier": {
      "bronze": 595,
      "silver": 500,
      "gold": 350
    }
  }
}
```

### 12.4 Báo cáo nhân viên

```
GET /reports/staff-performance
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "staffId": "string",
      "name": "string",
      "role": "waiter",
      "ordersServed": 145,
      "averageRating": 4.8
    }
  ]
}
```

### 12.5 Báo cáo tồn kho

```
GET /reports/inventory
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalItems": 128,
    "lowStockItems": 12,
    "expiringItems": 8,
    "totalValue": 45800000
  }
}
```

---

## 14. Search & Filter APIs

### 14.1 Tìm kiếm global

```
GET /search
```

**Query Parameters:**

- `q`: string (required) - Từ khóa tìm kiếm
- `type`: "all" | "customers" | "menu" | "orders" | "staff" (optional, default: "all")
- `limit`: number (optional, default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "string",
        "name": "string",
        "phone": "string",
        "email": "string",
        "membershipTier": "gold"
      }
    ],
    "menuItems": [
      {
        "id": "string",
        "name": "string",
        "category": "string",
        "price": 85000,
        "image": "string"
      }
    ],
    "orders": [
      {
        "id": "string",
        "tableNumber": "string",
        "status": "string",
        "total": 500000
      }
    ],
    "staff": [
      {
        "id": "string",
        "name": "string",
        "role": "waiter",
        "status": "active"
      }
    ]
  }
}
```

---

## 15. Upload APIs

### 15.1 Upload ảnh món ăn

**Option 1: Base64 Upload (Recommended for quick implementation)**

```
POST /upload/menu-image
Content-Type: application/json
```

**Request Body:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // base64 encoded image
  "menuItemId": "string" // optional, ID món ăn nếu đang cập nhật
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://storage.example.com/menu/abc123.jpg",
    "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." // optional, trả về base64 nếu không dùng storage
  }
}
```

**Option 2: File Upload (For production with cloud storage)**

```
POST /upload/menu-image
Content-Type: multipart/form-data
```

**Request Body:**

- `image`: File (required) - File ảnh (jpg, jpeg, png)
- `menuItemId`: string (optional) - ID món ăn nếu đang cập nhật

**Response:**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://storage.example.com/menu/abc123.jpg",
    "thumbnailUrl": "https://storage.example.com/menu/abc123_thumb.jpg"
  }
}
```

**Note:**

- Frontend hiện đang sử dụng FileReader để convert image thành base64
- Backend có thể:
  - **Development**: Lưu trực tiếp base64 trong DB (nhanh, không cần storage service)
  - **Production**: Upload base64 lên cloud storage (S3, Cloudinary) và trả về URL

### 15.2 Upload ảnh khuyến mãi

**Same as 15.1**, endpoint: `POST /upload/promotion-image`

### 15.3 Upload avatar

**Same as 15.1**, endpoint: `POST /upload/avatar`

**Validation Rules:**

- Chỉ chấp nhận: image/jpeg, image/jpg, image/png
- Max file size: 5MB (base64 encoded ~ 6.7MB)
- Tự động resize và tạo thumbnail (nếu dùng storage)
- Compress quality: 80%
- Base64 format: `data:image/jpeg;base64,<encoded_string>`

---

## 16. Profile Management APIs

### 16.1 Cập nhật thông tin cá nhân

```
PUT /profile
```

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

### 16.2 Đổi mật khẩu

```
PUT /profile/change-password
```

**Request Body:**

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### 16.3 Upload avatar

```
POST /profile/avatar
Content-Type: multipart/form-data
```

**Response:**

```json
{
  "success": true,
  "data": {
    "avatarUrl": "string"
  }
}
```

---

## Error Response Format

Tất cả API errors sẽ trả về format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // optional
  }
}
```

### Common Error Codes:

- `UNAUTHORIZED`: Chưa đăng nhập hoặc token hết hạn
- `FORBIDDEN`: Không có quyền truy cập
- `NOT_FOUND`: Không tìm thấy resource
- `VALIDATION_ERROR`: Dữ liệu đầu vào không hợp lệ
- `BUSINESS_ERROR`: Lỗi logic nghiệp vụ (VD: bàn đã được đặt)
- `INTERNAL_ERROR`: Lỗi server

---

## WebSocket Events (Real-time updates)

### Connect

```javascript
const socket = io("ws://api.example.com", {
  auth: { token: "JWT_TOKEN" },
});
```

### Events to Subscribe:

#### 1. Table Status Updates

```javascript
socket.on("table:status-changed", (data) => {
  // data: { tableId, newStatus, updatedBy }
});
```

#### 2. Order Updates

```javascript
socket.on("order:updated", (data) => {
  // data: { orderId, tableId, status, items }
});
```

#### 3. Payment Requests

```javascript
socket.on("payment:requested", (data) => {
  // data: { tableId, invoiceId, amount }
});
```

#### 4. New Booking

```javascript
socket.on("booking:created", (data) => {
  // data: { bookingId, tableId, date, time }
});
```

#### 5. Inventory Low Stock Alert

```javascript
socket.on("inventory:low-stock", (data) => {
  // data: { itemId, name, currentQuantity }
});
```

---

## Notes cho Backend Developers

### 1. Authentication & Authorization

- Implement JWT với refresh token mechanism
- Role-based access control (RBAC)
- Permissions được check ở middleware level

### 2. Data Validation

- Validate tất cả input data
- Sanitize để tránh SQL injection, XSS
- Return clear validation error messages

### 3. Pagination

- Các list APIs nên support pagination
- Default: `page=1`, `limit=20`
- Response format:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 4. File Upload

- Support cho avatar và menu images
- Validate file type (chỉ images)
- Max size: 5MB
- Store trên cloud (S3, Cloudinary, etc.)

### 5. Real-time Features

- Implement WebSocket cho:
  - Table status updates
  - Order status changes
  - Payment notifications
  - Kitchen display system

### 6. Business Logic Notes

- **Points**:
  - 10,000 VND chi tiêu = 10 điểm tích lũy
  - 1000 điểm = 1,000 VND giảm giá khi quy đổi
- **Membership tiers** (5 cấp):
  - **Bronze (Đồng)**: 0-5M VND tổng chi tiêu
  - **Silver (Bạc)**: 5M-10M VND tổng chi tiêu
  - **Gold (Vàng)**: 10M-20M VND tổng chi tiêu
  - **Platinum (Bạch kim)**: 20M-50M VND tổng chi tiêu
  - **Diamond (Kim cương)**: >50M VND tổng chi tiêu
- **Violations & Blacklist**:
  - **No-show**: Không đến nhận bàn đã đặt
  - **Late-cancel**: Hủy bàn muộn (< 2 giờ trước giờ đặt)
  - **Damage**: Gây hư hại tài sản nhà hàng
  - 3 vi phạm no-show → tự động blacklist
  - Customer bị blacklist không thể đặt bàn online
- **Booking & Deposit**:

  - Deposit cố định: 200,000 VND
  - Deposit được hoàn lại khi check-in thành công
  - Deposit bị mất nếu no-show

- **Inventory Management - Automatic Deduction**:

  - **Khi load menu (GET /menu)**:

    - Backend tự động check tồn kho của tất cả nguyên liệu
    - Món nào thiếu nguyên liệu → `available = false`
    - Thêm `unavailableReason` để frontend hiển thị (VD: "Hết nguyên liệu: Tôm hùm")
    - Frontend disable món hết và hiển thị badge "Hết món"

  - **Khi waiter gọi món (POST /orders, POST /orders/:id/items)**:

    - Backend validate đủ nguyên liệu trước khi tạo order
    - TỰ ĐỘNG TRỪ nguyên liệu trong inventory NGAY LẬP TỨC
    - Sử dụng database transaction với row-level locking (`SELECT ... FOR UPDATE`)
    - Nếu không đủ → return error `INSUFFICIENT_INVENTORY` với chi tiết
    - Log: `reason = "order_created"` hoặc `"order_item_added"`

  - **Khi hủy món (DELETE /orders/:orderId/items/:itemId)**:

    - **Status = `pending` (Chờ xử lý)**:
      - Món chưa vào bếp → HOÀN LẠI toàn bộ nguyên liệu vào inventory
      - Cộng lại số lượng đã trừ
      - Log: `reason = "order_item_cancelled"`
    - **Status = `cooking` hoặc `served`**:
      - Món đã vào bếp/đã phục vụ → KHÔNG hoàn nguyên liệu
      - Nguyên liệu đã được sử dụng/tiêu thụ
    - Return response với `ingredientsRestored: true/false`

  - **Xử lý Race Conditions & Conflicts**:

    - **Problem 1**: Nhiều waiter cùng order món cần cùng nguyên liệu

      - Solution: Row-level locking trên inventory table
      - Transaction đầu tiên thành công, transaction sau fail nếu hết hàng

    - **Problem 2**: Waiter hủy món ĐỒNG THỜI bếp chuyển status sang `cooking`

      - Solution: Lock order_items row trước khi check status
      - Nếu status đã thay đổi → báo lỗi không thể hủy

    - **Problem 3**: Hủy món ĐỒNG THỜI tạo món mới cùng nguyên liệu

      - Solution: Transaction hoàn nguyên liệu lock inventory
      - Transaction tạo món mới phải chờ lock release
      - Đảm bảo inventory quantity luôn chính xác

    - **Deadlock Prevention**:
      - Luôn lock theo thứ tự: order_items → inventory
      - Timeout cho transactions (VD: 5 seconds)
      - Retry mechanism với exponential backoff

  - **Database Transaction Pattern**:

    ```
    1. BEGIN TRANSACTION
    2. Lock order_items (FOR UPDATE)
    3. Check status
    4. If status allows → Lock inventory rows (FOR UPDATE)
    5. Update inventory quantities
    6. Insert inventory_logs
    7. Delete/Update order_items
    8. COMMIT (hoặc ROLLBACK nếu có lỗi)
    ```

  - **Monitoring & Alerts**:
    - Log tất cả inventory transactions với timestamp, user, reason
    - Alert manager khi nguyên liệu sắp hết (< 20% threshold)
    - Dashboard hiển thị realtime inventory status
    - Track lock wait times và optimize nếu > 1s

- **Promotion Quantity**:
  - Mỗi promotion có thể giới hạn số lượng lượt dùng (`promotionQuantity`)
  - Mỗi lần áp dụng khuyến mãi → trừ 1 từ `promotionQuantity`
  - Khi `promotionQuantity = 0` → promotion không khả dụng
  - Frontend hiển thị số lượng còn lại
- **Promotions**:

  - Mỗi promotion có `promotionQuantity` (số lượt dùng)
  - Khi `promotionQuantity = 0`: không thể sử dụng
  - Customer chỉ được chọn 1 trong: voucher HOẶC quy đổi điểm
  - Cashier có thể áp dụng promotion cho customer nếu customer chưa chọn

- **Invoice & Payment**:

  - Customer có thể yêu cầu thanh toán từ bàn (`payment-requested`)
  - Cashier xử lý thanh toán và invoice chuyển sang `paid`
  - Invoice có thể có: voucherCode, pointsUsed, hoặc promotion do cashier áp dụng

- **Menu & Ingredients**:
  - Mỗi món ăn có danh sách nguyên liệu từ inventory
  - Khi tạo/sửa món, ingredients được chọn từ inventory items có sẵn
  - Frontend hiển thị dropdown với format: "Tên nguyên liệu (SL đơn vị trong kho)"
  - Mỗi ingredient trong menu item có: inventoryItemId, quantity cần dùng
  - Backend cần check tồn kho khi nhận order để xác nhận món có thể làm được

### 7. Performance Considerations

- Implement caching cho menu, promotions
- Use database indexing cho queries thường dùng
- Optimize image loading (thumbnails)
- Rate limiting cho APIs

### 8. Testing Requirements

- Unit tests cho business logic
- Integration tests cho APIs
- Load testing cho concurrent users
- Mock data for development

---

## Contact

Nếu có thắc mắc về API spec, liên hệ Frontend Team.

---

## Appendix A: Frontend UI Components

### A.1 ConfirmationModal Component

**Location:** `frontend/src/components/ui/ConfirmationModal.tsx`

**Purpose:** Reusable confirmation dialog cho các hành động quan trọng (xóa, đăng xuất, etc.)

**Props:**

- `isOpen`: boolean - Điều khiển hiển thị modal
- `onClose`: () => void - Callback khi đóng modal
- `onConfirm`: () => void - Callback khi xác nhận (tự động đóng modal)
- `title?`: string - Tiêu đề (default: "Xác nhận")
- `message?`: string - Nội dung (default: "Bạn có chắc chắn...")
- `confirmText?`: string - Text nút confirm (default: "Xác nhận")
- `cancelText?`: string - Text nút cancel (default: "Hủy")
- `variant?`: 'danger' | 'warning' | 'info' - Style variant (default: 'warning')

**Variants:**

- `danger`: Màu đỏ - dùng cho hành động nguy hiểm (xóa, hủy vĩnh viễn)
- `warning`: Màu vàng - dùng cho cảnh báo (đăng xuất, rời khỏi trang)
- `info`: Màu xanh - dùng cho thông tin (lưu, xác nhận thay đổi)

**Usage Example:**

```tsx
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { useState } from "react";

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>Xóa món ăn</Button>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          handleDelete(itemId);
          toast.success("Xóa thành công!");
        }}
        title="Xóa món ăn"
        message="Bạn có chắc chắn muốn xóa món ăn này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </>
  );
}
```

### A.2 User Dropdown Menu

**Location:**

- `frontend/src/components/customer/CustomerLayout.tsx`
- `frontend/src/components/staff/StaffLayout.tsx`

**Changes (v1.2):**

- Đã di chuyển nút "Đăng xuất" từ sidebar lên header
- User click vào tên/avatar ở góc phải header để mở dropdown
- Dropdown chứa: Đăng xuất (có thể thêm Profile, Settings sau)

**UI Details:**

- Icon: ChevronDown từ lucide-react
- Dropdown position: absolute right-0
- Styling: white background, shadow, border, rounded corners
- Hover effect: background color change

### A.3 Image Upload Component (Menu Items)

**Location:** `frontend/src/components/staff/manager/MenuPromotionPage.tsx`

**Implementation:**

- File selection via `<input type="file" accept="image/*">`
- FileReader API để convert sang base64
- Preview ảnh với overlay hover effects
- Buttons: Edit (blue) và Delete (red) hiện khi hover
- Empty state: Dashed border box với ImageIcon và text "Nhấn để chọn ảnh"

**Features:**

- Click anywhere on box để chọn ảnh mới
- Hover lên ảnh hiện overlay với 2 buttons
- Edit button: cho phép thay đổi ảnh
- Delete button: xóa ảnh hiện tại
- Support format: PNG, JPG, GIF up to 10MB

**Integration Notes:**

- Image được lưu dưới dạng base64 string trong state
- Khi submit, gửi base64 string lên backend
- Backend có thể lưu trực tiếp base64 hoặc upload lên cloud storage

---

## Appendix B: Frontend State Management

### B.1 Menu Form State

```tsx
const [menuForm, setMenuForm] = useState({
  name: "",
  category: "Món chính",
  price: 0,
  description: "",
  image: "", // base64 string hoặc URL
});
```

### B.2 Ingredient Rows State

```tsx
const [ingredientRows, setIngredientRows] = useState<
  Array<{ ingredientId: string; quantity: number }>
>([{ ingredientId: "", quantity: 0 }]);
```

**Note:**

- Frontend chỉ lưu `ingredientId` và `quantity`
- Tên nguyên liệu và unit được lấy từ `mockInventory` để hiển thị
- Khi submit, gửi array of `{ inventoryItemId: string, quantity: number }`

---
