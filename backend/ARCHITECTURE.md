# Cấu trúc Backend - Clean Architecture với 4 Layer

## 📁 Cấu trúc Folder Mới

```
backend/src/
├── domain_layer/              # Tầng Domain - Business Entities & Rules
│   ├── staff/
│   │   └── staff.entity.js
│   └── customer/
│       └── customer.entity.js
│
├── infrastructure_layer/      # Tầng Infrastructure - Database & External Services
│   ├── staff/
│   │   └── staff.repository.js
│   └── customer/
│       └── customer.repository.js
│
├── application_layer/         # Tầng Application - Business Logic & Use Cases
│   ├── staff/
│   │   └── staff.service.js
│   └── customer/
│       └── customer.service.js
│
├── presentation_layer/        # Tầng Presentation - HTTP Handlers & Routes
│   ├── controllers/
│   │   ├── staff/
│   │   │   └── staff.controller.js
│   │   └── customer/
│   │       └── customer.controller.js
│   └── routes/
│       ├── staff.routes.js
│       └── customer.routes.js
│
├── models/                    # Mongoose Models
│   └── index.js
│
├── routes/                    # Other Routes (floors, locations, tables)
│   ├── floors.js
│   ├── locations.js
│   └── tables.js
│
└── test/                      # Integration Tests
    ├── staff/
    │   └── staff.integration.js
    └── customer/
        └── customer.integration.js
```

## 🔄 Thay đổi so với cấu trúc cũ

### Đổi tên folder
- `domain` → `domain_layer`
- `infrastructure` → `infrastructure_layer`
- `application` → `application_layer`
- `presentation` → `presentation_layer`

### Tái cấu trúc presentation_layer
**Trước:**
```
presentation/
├── staff/
│   └── staff.controller.js
├── customer/
│   └── customer.controller.js
└── routes/
    ├── staff.routes.js
    └── customer.routes.js
```

**Sau:**
```
presentation_layer/
├── controllers/
│   ├── staff/
│   │   └── staff.controller.js
│   └── customer/
│       └── customer.controller.js
└── routes/
    ├── staff.routes.js
    └── customer.routes.js
```

## 📝 Import Paths đã cập nhật

### Domain Layer
```javascript
// Không có imports từ layer khác
class StaffEntity { ... }
module.exports = StaffEntity;
```

### Infrastructure Layer
```javascript
const { Staff } = require('../../models');
const StaffEntity = require('../../domain_layer/staff/staff.entity');
```

### Application Layer
```javascript
const StaffRepository = require('../../infrastructure_layer/staff/staff.repository');
const StaffEntity = require('../../domain_layer/staff/staff.entity');
```

### Presentation Layer - Controllers
```javascript
// presentation_layer/controllers/staff/staff.controller.js
const StaffService = require('../../../application_layer/staff/staff.service');
```

### Presentation Layer - Routes
```javascript
// presentation_layer/routes/staff.routes.js
const StaffController = require('../controllers/staff/staff.controller');
```

### Server.js
```javascript
const staffRouter = require('./src/presentation_layer/routes/staff.routes');
const customerRouter = require('./src/presentation_layer/routes/customer.routes');
```

## ✅ Kiểm tra hoạt động

Server chạy thành công với:
- ✅ MongoDB Connected
- ✅ Tất cả routes hoạt động
- ✅ Staff API endpoints
- ✅ Customer API endpoints
- ✅ Table Management endpoints

## 🎯 Ưu điểm của cấu trúc mới

1. **Rõ ràng hơn**: Tên folder có `_layer` giúp dễ phân biệt các tầng
2. **Chuẩn Architecture**: Presentation layer được tách rõ controllers và routes
3. **Dễ mở rộng**: Thêm module mới chỉ cần tạo folder trong mỗi layer
4. **Maintainable**: Code tổ chức tốt, dễ bảo trì và test

## 🚀 Chạy ứng dụng

```bash
# Từ thư mục root
npm run dev

# Hoặc chỉ chạy backend
cd backend
npm run dev
```

Server sẽ chạy trên: http://localhost:5001
Frontend sẽ chạy trên: http://localhost:5173

## 📚 Next Steps

- Cập nhật integration tests với đường dẫn mới (nếu cần)
- Thêm các module mới theo cấu trúc này
- Cân nhắc thêm middleware authentication vào presentation_layer
