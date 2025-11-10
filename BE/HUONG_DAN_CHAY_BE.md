# Hướng Dẫn Chạy Backend (BE)

## 📋 Yêu Cầu Hệ Thống

- **Java JDK 21** (bắt buộc)
- **Maven 3.9+** (hoặc dùng Maven Wrapper có sẵn)
- **MySQL 8.0+** (hoặc dùng Docker)
- **Git** (đã có)

## 🚀 Các Bước Chạy Backend

### Bước 1: Kiểm tra Java Version

```bash
java -version
```

Kết quả phải hiển thị version 21 hoặc cao hơn:

```
openjdk version "21.x.x"
```

Nếu chưa có Java 21, tải về từ: https://adoptium.net/

### Bước 2: Tạo File .env

Tạo file `.env` trong thư mục `BE/oem-ev-warranty-management-system/`:

**Windows (PowerShell):**

```powershell
cd BE\oem-ev-warranty-management-system
New-Item -Path .env -ItemType File
```

**Linux/Mac:**

```bash
cd BE/oem-ev-warranty-management-system
touch .env
```

### Bước 3: Cấu Hình File .env

Mở file `.env` và thêm các biến môi trường sau:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=warranty_management
DB_USER=root
DB_PASSWORD=your_password_here

# JWT Secret Key (tạo một chuỗi ngẫu nhiên, dài ít nhất 32 ký tự)
JWT_SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters-long

# CORS Configuration (tùy chọn - chỉ cần khi deploy production)
# CORS_ALLOWED_ORIGINS=https://your-domain.com
```

**Lưu ý:**

- Thay `your_password_here` bằng mật khẩu MySQL của bạn
- Thay `your-super-secret-jwt-key-minimum-32-characters-long` bằng một chuỗi bí mật ngẫu nhiên (có thể dùng: https://randomkeygen.com/)
- Nếu dùng MySQL trên Docker, `DB_HOST` có thể là `mysql` (tên service trong docker-compose)

### Bước 4: Tạo Database MySQL

**Cách 1: Dùng MySQL Command Line**

```bash
mysql -u root -p
```

Sau đó chạy:

```sql
CREATE DATABASE warranty_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Cách 2: Dùng Docker (Khuyến nghị nếu chưa có MySQL)**

Chạy MySQL container:

```bash
docker run --name mysql-warranty \
  -e MYSQL_ROOT_PASSWORD=your_password_here \
  -e MYSQL_DATABASE=warranty_management \
  -p 3306:3306 \
  -d mysql:8.0
```

Sau đó cập nhật `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
```

### Bước 5: Chạy Backend

**Windows:**

```powershell
cd BE\oem-ev-warranty-management-system
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**

```bash
cd BE/oem-ev-warranty-management-system
./mvnw spring-boot:run
```

**Hoặc nếu đã cài Maven:**

```bash
mvn spring-boot:run
```

### Bước 6: Kiểm Tra Backend Đã Chạy

Sau khi chạy, bạn sẽ thấy log tương tự:

```
Started WarrantyManagementApplication in X.XXX seconds
```

Backend sẽ chạy tại: **http://localhost:8080**

**Kiểm tra bằng cách:**

- Mở browser: http://localhost:8080
- Hoặc dùng curl:
  ```bash
  curl http://localhost:8080
  ```

**API Documentation (Swagger UI):**

- Mở: http://localhost:8080/swagger-ui.html
- Hoặc: http://localhost:8080/swagger-ui/index.html

## 🐳 Chạy Bằng Docker (Tùy chọn)

Nếu muốn chạy cả MySQL + Backend bằng Docker:

```bash
# Từ thư mục gốc của project
docker-compose up -d mysql backend
```

Xem logs:

```bash
docker-compose logs -f backend
```

## 🔧 Troubleshooting

### Lỗi: "Port 8080 already in use"

- Tắt ứng dụng đang dùng port 8080
- Hoặc đổi port trong `application.properties`: `server.port=8081`

### Lỗi: "Cannot connect to MySQL"

- Kiểm tra MySQL đã chạy chưa: `mysql -u root -p`
- Kiểm tra thông tin trong file `.env` (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD)
- Kiểm tra firewall có chặn port 3306 không

### Lỗi: "Database does not exist"

- Tạo database: `CREATE DATABASE warranty_management;`
- Hoặc kiểm tra tên database trong `.env` đúng chưa

### Lỗi: "Java version không đúng"

- Cài đặt Java 21
- Kiểm tra: `java -version` phải hiển thị version 21

### Lỗi: "Maven không tìm thấy"

- Dùng Maven Wrapper: `./mvnw` (Linux/Mac) hoặc `.\mvnw.cmd` (Windows)
- Hoặc cài Maven: https://maven.apache.org/download.cgi

## 📝 Các Endpoint Quan Trọng

- **Health Check:** http://localhost:8080/actuator/health
- **API Docs:** http://localhost:8080/swagger-ui.html
- **Login:** POST http://localhost:8080/api/auth/login
- **Public Service Centers:** GET http://localhost:8080/api/public/service-centers

## 🔐 CORS Configuration

Backend đã được cấu hình CORS tự động cho:

- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:8080`
- `http://localhost:8081`

Xem thêm chi tiết trong: `docs/CORS_CONFIGURATION.md`

## ✅ Kiểm Tra Backend Hoạt Động

1. **Kiểm tra log:** Xem console có log "Started WarrantyManagementApplication"
2. **Test API:**
   ```bash
   curl http://localhost:8080/api/public/service-centers?page=0&size=10
   ```
3. **Mở Swagger UI:** http://localhost:8080/swagger-ui.html

## 🎯 Next Steps

Sau khi Backend chạy thành công:

1. Kiểm tra database đã được tạo tables tự động (do `spring.jpa.hibernate.ddl-auto=update`)
2. Có thể chạy script test data nếu có: `src/main/resources/sql-update/test-data.sql`
3. Bắt đầu chạy Frontend và kết nối với Backend
