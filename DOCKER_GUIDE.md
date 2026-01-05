# 🐳 Docker Setup Guide - Restaurant Management System

Hướng dẫn chi tiết để chạy dự án Restaurant Management System với Docker.

## 📋 Yêu Cầu

- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- Docker Compose v2.0+
- Ít nhất 4GB RAM còn trống
- Ít nhất 10GB ổ đĩa còn trống

## 🚀 Khởi Động Nhanh

### 1. Khởi động tất cả services

```bash
docker-compose up -d
```

- `-d`: Chạy ở chế độ detached (chạy ngầm)
- Lệnh này sẽ:
  - Build images cho backend và frontend
  - Download MongoDB và Mongo Express images
  - Tạo network và volumes
  - Khởi động tất cả containers

### 2. Seed dữ liệu mẫu (BẮT BUỘC cho lần đầu)

```bash
docker-compose exec backend npm run seed
```

- ⚠️ **QUAN TRỌNG**: Database sẽ trống sau khi khởi động lần đầu
- Lệnh này tạo dữ liệu mẫu bao gồm:
  - 6 nhân viên (waiter, cashier, manager)
  - 6 khách hàng
  - 13 bàn ăn, 8 món ăn, 10 nguyên liệu
  - Đơn hàng, hóa đơn, và dữ liệu test khác
- **Tài khoản test được tạo**:
  - Manager: `minh.manager@restaurant.vn` / `password123`
  - Waiter: `hung.waiter@restaurant.vn` / `password123`
  - Customer: `tuan.nguyen@gmail.com` / `password123`

### 3. Truy cập ứng dụng

Sau khi seed xong, bạn có thể đăng nhập tại http://localhost:5173

### 4. Xem logs của tất cả services

```bash
docker-compose logs -f
```

- `-f`: Follow mode, hiển thị logs real-time

### 5. Xem logs của một service cụ thể

```bash
# Xem logs backend
docker-compose logs -f backend

# Xem logs frontend
docker-compose logs -f frontend

# Xem logs MongoDB
docker-compose logs -f mongodb
```

### 6. Kiểm tra trạng thái các containers

```bash
docker-compose ps
```

## 🌐 Truy Cập Các Services

Sau khi khởi động thành công, truy cập:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Mongo Express** (DB Admin): http://localhost:8081
  - Username: `admin`
  - Password: `admin123`
- **MongoDB**: `mongodb://localhost:27017`

## 🛠️ Các Lệnh Thường Dùng

### Dừng tất cả services

```bash
docker-compose stop
```

- Dừng containers nhưng không xóa

### Khởi động lại services đã dừng

```bash
docker-compose start
```

### Dừng và xóa containers

```bash
docker-compose down
```

- Xóa containers nhưng giữ lại volumes (data không bị mất)

### Dừng, xóa containers và xóa volumes

```bash
docker-compose down -v
```

- ⚠️ **CẢNH BÁO**: Lệnh này sẽ xóa toàn bộ dữ liệu trong database!

### Rebuild images

```bash
docker-compose up --build
```

- Sử dụng khi có thay đổi trong Dockerfile hoặc dependencies

### Rebuild một service cụ thể

```bash
# Rebuild backend
docker-compose build backend

# Rebuild frontend
docker-compose build frontend
```

### Khởi động lại một service cụ thể

```bash
docker-compose restart backend
docker-compose restart frontend
```

## 🔧 Debug và Troubleshooting

### Vào shell của container

```bash
# Vào backend container
docker-compose exec backend sh

# Vào frontend container
docker-compose exec frontend sh

# Vào MongoDB container
docker-compose exec mongodb mongosh
```

### Kiểm tra logs lỗi

```bash
# Xem 50 dòng logs cuối
docker-compose logs --tail=50 backend

# Xem logs từ 10 phút trước
docker-compose logs --since 10m backend
```

### Xóa tất cả và khởi động lại từ đầu

```bash
# Dừng và xóa containers, networks, images
docker-compose down --rmi all -v

# Build lại và khởi động
docker-compose up --build -d
```

### Port bị chiếm dụng

Nếu gặp lỗi port đã được sử dụng:

```bash
# Tìm process đang dùng port (Windows)
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Tìm process đang dùng port (Linux/Mac)
lsof -i :5000
lsof -i :5173

# Hoặc thay đổi port trong docker-compose.yml
# Ví dụ: "5001:5000" thay vì "5000:5000"
```

## 📊 Quản Lý Dữ Liệu

### Backup database

```bash
# Tạo backup
docker-compose exec mongodb mongodump --out /data/backup

# Copy backup ra host
docker cp restaurant-mongodb:/data/backup ./mongodb-backup
```

### Restore database

```bash
# Copy backup vào container
docker cp ./mongodb-backup restaurant-mongodb:/data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

### Seed dữ liệu mẫu

```bash
docker-compose exec backend npm run seed
```

**Chú ý**:

- Lệnh này sẽ **XÓA TẤT CẢ** dữ liệu hiện có và tạo lại từ đầu
- Chỉ chạy khi muốn reset database về trạng thái ban đầu
- Xem danh sách tài khoản test trong output sau khi seed xong

## 🔄 Development Workflow

### Hot Reload

Cả backend và frontend đều hỗ trợ hot reload:

- **Backend**: Sử dụng nodemon, tự động restart khi có thay đổi
- **Frontend**: Vite HMR, tự động reload khi có thay đổi

### Cài thêm package mới

```bash
# Backend
docker-compose exec backend npm install package-name

# Frontend
docker-compose exec frontend npm install package-name

# Sau đó rebuild image
docker-compose up --build -d
```

## 📝 Environment Variables

### Backend Environment Variables

Các biến môi trường được định nghĩa trong `docker-compose.yml`:

- `MONGODB_URI`: Địa chỉ kết nối MongoDB
- `JWT_SECRET`: Secret key cho JWT token
- `FRONTEND_URL`: URL của frontend (cho CORS)
- `PORT`: Port server lắng nghe

### Frontend Environment Variables

- `VITE_API_URL`: URL của backend API

Để thay đổi, chỉnh sửa trong `docker-compose.yml` hoặc tạo file `.env` trong thư mục gốc.

## 🔒 Production Setup

### Tạo docker-compose.prod.yml cho production

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      target: production # Tạo multi-stage build trong Dockerfile
    environment:
      NODE_ENV: production
      # Sử dụng biến môi trường từ hệ thống
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
    restart: always # Luôn restart khi có lỗi

  frontend:
    build:
      context: ./frontend
      target: production
    # Cấu hình nginx để serve static files
```

### Chạy production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🧹 Dọn Dẹp

### Xóa containers không dùng

```bash
docker container prune
```

### Xóa images không dùng

```bash
docker image prune -a
```

### Xóa volumes không dùng

```bash
docker volume prune
```

### Dọn dẹp toàn bộ (cẩn thận!)

```bash
docker system prune -a --volumes
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra status: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. Rebuild từ đầu: `docker-compose down -v && docker-compose up --build`

## 📚 Tài Liệu Tham Khảo

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
