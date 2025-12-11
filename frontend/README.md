# Restaurant Management System - Frontend

## Tổng quan

Ứng dụng quản lý nhà hàng được xây dựng với React + TypeScript + Vite, sử dụng Tailwind CSS và Radix UI components.

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Màn hình đăng nhập/đăng ký
│   │   ├── customer/       # Giao diện khách hàng
│   │   ├── staff/          # Giao diện nhân viên
│   │   │   ├── manager/    # Trang quản lý
│   │   │   ├── cashier/    # Trang thu ngân
│   │   │   └── waiter/     # Trang phục vụ
│   │   ├── ui/             # UI Components (Radix UI + shadcn/ui)
│   │   └── figma/          # Components hỗ trợ
│   ├── contexts/           # React Contexts (Auth, Cart)
│   ├── lib/                # Utilities và mock data
│   ├── types/              # TypeScript types
│   └── styles/             # Global styles
├── public/                 # Static assets
└── ...config files
```

## Cài đặt

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## Routes

### Authentication

- `/login` - Đăng nhập (Customer/Staff)
- `/register` - Đăng ký (khách hàng mới)

### Customer Portal

- `/customer/home` - Trang chủ
- `/customer/menu` - Thực đơn
- `/customer/booking` - Đặt bàn
- `/customer/membership` - Ưu đãi & Thành viên
- `/customer/bills` - Hóa đơn
- `/customer/profile` - Hồ sơ cá nhân

### Staff Portal

#### Manager

- `/staff/manager/dashboard` - Tổng quan
- `/staff/manager/tables` - Quản lý bàn
- `/staff/manager/staff` - Nhân sự
- `/staff/manager/inventory` - Kho
- `/staff/manager/menu` - Thực đơn
- `/staff/manager/customers` - Khách hàng
- `/staff/manager/reports` - Báo cáo

#### Cashier

- `/staff/cashier/invoices` - Quản lý thanh toán

#### Waiter

- `/staff/waiter/tables` - Sơ đồ bàn
- `/staff/waiter/orders` - Gọi món

#### Common

- `/staff/profile` - Hồ sơ cá nhân

## Demo Login

### Customer

- Email/Phone: bất kỳ
- Password: bất kỳ

### Staff

- Manager: Mã NV bắt đầu với `MGR` (vd: MGR001)
- Cashier: Mã NV bắt đầu với `CSH` (vd: CSH001)
- Waiter: Mã NV khác (vd: WAI001)
- Password: bất kỳ

## Công nghệ sử dụng

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Radix UI** - Unstyled UI primitives
- **Lucide React** - Icons
- **Recharts** - Charts
- **Sonner** - Toast notifications

## Ghi chú quan trọng

### Cần cập nhật thêm

Một số component vẫn còn sử dụng prop `onNavigate` cũ thay vì React Router's `useNavigate` hook. Các file cần cập nhật:

1. `src/components/customer/HomePage.tsx` - Thay `onNavigate('page')` bằng `navigate('/customer/page')`
2. `src/components/customer/BookingPage.tsx` - Xóa interface `BookingPageProps`
3. `src/components/customer/BillsPage.tsx` - Xóa interface `BillsPageProps`

Ví dụ thay đổi trong HomePage.tsx:

```typescript
// Cũ
onClick={() => onNavigate('booking')}

// Mới
onClick={() => navigate('/customer/booking')}
```

### ProfilePage Staff

`src/components/staff/ProfilePage.tsx` cần cập nhật để lấy role từ AuthContext thay vì prop:

```typescript
// Thêm import
import { useAuth } from "../../contexts/AuthContext";

// Trong component
export function ProfilePage() {
  const { userProfile } = useAuth();
  const role = userProfile?.role || "manager";
  // ...
}
```

## Development

Server sẽ chạy trên `http://localhost:3000` (được cấu hình trong `vite.config.ts`).

Hot reload được bật mặc định với Vite.

## Build

```bash
npm run build
```

Output sẽ được tạo trong thư mục `build/`.

## Linting

```bash
npm run lint
```

---

**Lưu ý**: Đây là phiên bản frontend đã được migrate từ Figma design. Một số component có thể cần điều chỉnh thêm để tích hợp với backend API thực tế.
