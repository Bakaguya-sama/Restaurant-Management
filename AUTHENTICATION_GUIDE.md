# Hướng dẫn Authentication & Login

## Tổng quan

Hệ thống authentication đã được triển khai đầy đủ với các tính năng:
- Đăng ký tài khoản mới (customer)
- Đăng nhập (customer & staff)
- Quản lý session với JWT access/refresh tokens
- Auto-refresh token khi hết hạn
- Phân quyền theo role

## Backend API

### Các endpoint authentication

#### 1. Đăng ký (Register)
```
POST /api/v1/auth/register
```
Body:
```json
{
  "full_name": "Nguyen Van A",
  "email": "example@email.com",
  "phone": "0912345678",
  "username": "vana",
  "password": "password123",
  "address": "123 ABC Street",
  "date_of_birth": "1990-01-01"
}
```

#### 2. Đăng nhập (Login)
```
POST /api/v1/auth/login
```
Body:
```json
{
  "identifier": "email hoặc username",
  "password": "password123",
  "role": "customer" | "waiter" | "cashier" | "manager"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "full_name": "...",
      "email": "...",
      "role": "..."
    }
  }
}
```

#### 3. Refresh Token
```
POST /api/v1/auth/refresh
```
Body:
```json
{
  "refreshToken": "..."
}
```

#### 4. Get Current User
```
GET /api/v1/auth/me
Headers: Authorization: Bearer {accessToken}
```

#### 5. Logout
```
POST /api/v1/auth/logout
Headers: Authorization: Bearer {accessToken}
```

#### 6. Change Password
```
POST /api/v1/auth/change-password
Headers: Authorization: Bearer {accessToken}
```
Body:
```json
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

## Tài khoản test

### Customer
- Email: `tuan.nguyen@gmail.com`
- Username: `tuan.nguyen`
- Password: `password123`
- Membership: Diamond

- Email: `hoang.son@gmail.com`
- Username: `hoang.son`
- Password: `password123`
- Membership: Regular

### Staff
**Waiter:**
- Username: `hung.waiter`
- Password: `password123`

**Cashier:**
- Username: `nam.cashier`
- Password: `password123`

**Manager:**
- Username: `minh.manager`
- Password: `password123`

## Frontend Implementation

### 1. AuthContext

AuthContext quản lý trạng thái authentication:
- `isAuthenticated`: Boolean kiểm tra đã đăng nhập
- `userProfile`: Thông tin user hiện tại
- `login(identifier, password, role)`: Hàm đăng nhập
- `logout()`: Hàm đăng xuất
- `updateProfile(profile)`: Cập nhật profile

### 2. API Service

File: `frontend/src/lib/authService.ts`

Các functions:
- `authService.register(data)`: Đăng ký
- `authService.login(data)`: Đăng nhập
- `authService.logout()`: Đăng xuất
- `authService.getCurrentUser()`: Lấy thông tin user
- `authService.refreshToken(token)`: Refresh token
- `authService.changePassword(data)`: Đổi mật khẩu

### 3. Auto Token Refresh

File: `frontend/src/lib/api.ts`

Axios interceptor tự động:
- Thêm Authorization header vào mọi request
- Tự động refresh token khi 401 Unauthorized
- Redirect về login nếu refresh token thất bại

### 4. Login Page

File: `frontend/src/components/auth/LoginPage.tsx`

Features:
- Tab switching giữa Customer và Staff
- Form validation
- Error handling
- Loading state
- Role selector cho staff (waiter/cashier/manager)

## Cách sử dụng

### 1. Khởi động server

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### 2. Test đăng nhập

1. Mở trình duyệt: `http://localhost:5173/login`
2. Chọn tab "Khách hàng" hoặc "Nhân viên"
3. Nhập thông tin đăng nhập từ danh sách tài khoản test
4. Click "Đăng nhập"

### 3. Test flow

**Customer flow:**
1. Login → Redirect to `/customer/home`
2. Có thể truy cập các trang customer
3. Logout → Redirect to `/login`

**Staff flow:**
1. Chọn role (Waiter/Cashier/Manager)
2. Login → Redirect tới dashboard tương ứng
3. Có thể truy cập các trang staff theo role
4. Logout → Redirect to `/login`

## Bảo mật

### JWT Tokens
- Access token: 24 giờ
- Refresh token: 7 ngày
- Secret keys được lưu trong .env

### Password
- Mã hóa bằng bcryptjs với salt rounds = 10
- Minimum length: 6 characters

### Protected Routes
- Sử dụng middleware `authenticateToken` để bảo vệ routes
- Sử dụng middleware `authorizeRoles` để phân quyền theo role

## Troubleshooting

### Lỗi CORS
Đảm bảo backend đã enable CORS cho frontend URL.

### Token expired
Frontend tự động refresh token. Nếu refresh token cũng hết hạn, user sẽ bị redirect về login.

### Connection refused
Kiểm tra MongoDB đã chạy và URL connection trong .env đúng.

## Files đã tạo/cập nhật

### Backend
- `src/presentation_layer/middleware/auth.middleware.js` - JWT middleware
- `src/application_layer/auth/auth.service.js` - Auth business logic
- `src/presentation_layer/controllers/auth/auth.controller.js` - Auth controller
- `src/presentation_layer/routes/auth.routes.js` - Auth routes
- `backend/.env` - Environment variables

### Frontend
- `src/lib/authService.ts` - Auth API service
- `src/lib/api.ts` - Axios config với interceptors
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/components/auth/LoginPage.tsx` - Login UI
- `frontend/.env` - Environment variables
