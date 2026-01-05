# ========================================
# Dockerfile for Frontend (React + Vite)
# ========================================

# Sử dụng Node.js phiên bản 20 trên Alpine Linux (image nhẹ)
FROM node:20-alpine

# Cài đặt các dependencies cần thiết
RUN apk add --no-cache python3 make g++

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy các file package.json và package-lock.json trước
# Việc copy riêng giúp tận dụng Docker cache layer
COPY package*.json ./

# Cài đặt tất cả dependencies
# Sử dụng npm install với --legacy-peer-deps để tránh conflict
RUN npm install --legacy-peer-deps

# Copy toàn bộ source code vào container
COPY . .

# Expose port 5173 (Vite default port)
EXPOSE 5173

# Lệnh khởi động Vite dev server
# --host 0.0.0.0: Cho phép truy cập từ bên ngoài container
# --port 5173: Chỉ định port (mặc định của Vite)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
