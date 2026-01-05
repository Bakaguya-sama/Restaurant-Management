# ========================================
# Dockerfile for Backend (Node.js + Express)
# ========================================

# Sử dụng Node.js phiên bản 20 trên Alpine Linux (image nhẹ)
FROM node:20-alpine

# Cài đặt các dependencies cần thiết cho Alpine
# - python3, make, g++: cần cho một số native dependencies của Node
RUN apk add --no-cache python3 make g++

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy các file package.json và package-lock.json trước
# Việc copy riêng giúp tận dụng Docker cache layer
# Nếu package.json không thay đổi, Docker sẽ không cài lại dependencies
COPY package*.json ./

# Cài đặt tất cả dependencies (bao gồm cả devDependencies)
# Sử dụng npm install vì có thể không có package-lock.json
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Tạo thư mục uploads nếu chưa có
RUN mkdir -p uploads

# Expose port 5000 để container lắng nghe request
EXPOSE 5000

# Lệnh khởi động ứng dụng
# Trong development: npm run dev (sử dụng nodemon)
# Trong production: npm start (sử dụng node)
CMD ["npm", "run", "dev"]
