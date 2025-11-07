# 🚗 OEM EV Warranty Management System

Hệ thống quản lý bảo hành xe điện toàn diện dành cho nhà sản xuất, trung tâm dịch vụ và khách hàng.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Vai trò người dùng](#-vai-trò-người-dùng)
- [Bảo mật](#-bảo-mật)
- [Tài liệu](#-tài-liệu)

## 🎯 Giới thiệu

**OEM EV Warranty Management System** là một hệ thống quản lý bảo hành xe điện toàn diện, được thiết kế để tối ưu hóa quy trình bảo hành từ khách hàng, trung tâm dịch vụ đến nhà sản xuất. Hệ thống hỗ trợ quản lý yêu cầu bảo hành, theo dõi lịch sử dịch vụ, quản lý phụ tùng, và xử lý các chiến dịch triệu hồi.

### Đặc điểm nổi bật

- ✅ **Đa vai trò**: Hỗ trợ 5+ vai trò người dùng với quyền truy cập phân cấp
- ✅ **Quy trình tự động**: Tự động hóa quy trình xử lý yêu cầu bảo hành
- ✅ **Theo dõi thời gian thực**: Cập nhật trạng thái yêu cầu bảo hành ngay lập tức
- ✅ **Quản lý triệu hồi**: Hệ thống triệu hồi xe tích hợp với thông báo khách hàng
- ✅ **Phân tích & Báo cáo**: Dashboard phân tích với biểu đồ và metrics
- ✅ **Bảo mật cao**: Xác thực JWT với cơ chế refresh token

## 🚀 Tính năng chính

### 🔧 Quản lý Bảo hành
- Tạo và theo dõi yêu cầu bảo hành
- Quy trình duyệt/từ chối tự động
- Cập nhật trạng thái theo thời gian thực
- Lưu trữ chứng từ và hình ảnh

### 🚙 Quản lý Xe
- Đăng ký xe qua mã VIN
- Theo dõi lịch sử bảo hành và bảo dưỡng
- Quản lý thông tin xe chi tiết

### 🔩 Quản lý Phụ tùng
- Danh mục phụ tùng đầy đủ
- Yêu cầu và theo dõi phụ tùng
- Lịch sử lắp đặt phụ tùng

### 🏢 Quản lý Trung tâm Dịch vụ
- Quản lý thông tin trung tâm dịch vụ
- Tích hợp bản đồ tìm kiếm trung tâm gần nhất
- Đánh giá và phản hồi từ khách hàng

### 📢 Quản lý Triệu hồi
- Tạo chiến dịch triệu hồi
- Thông báo tự động đến khách hàng
- Theo dõi phản hồi và xử lý triệu hồi

### 📊 Phân tích & Báo cáo
- Dashboard tổng quan theo vai trò
- Biểu đồ và thống kê chi tiết
- Báo cáo hiệu suất trung tâm dịch vụ

### 💬 Quản lý Phản hồi
- Thu thập đánh giá từ khách hàng
- Phân tích mức độ hài lòng
- Cải thiện chất lượng dịch vụ

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Java** | 21 | Ngôn ngữ lập trình chính |
| **Spring Boot** | 3.5.6 | Framework REST API |
| **Spring Security** | Latest | Bảo mật và xác thực |
| **Hibernate/JPA** | Latest | ORM cho database |
| **MySQL** | 8.0 | Cơ sở dữ liệu quan hệ |
| **JWT (jjwt)** | 0.13.0 | Xác thực token |
| **Springdoc OpenAPI** | 2.8.13 | Tài liệu API (Swagger) |
| **Maven** | 3.9.11 | Quản lý dependencies |
| **JUnit 5** | Latest | Unit testing |
| **JaCoCo** | Latest | Test coverage |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | 19.1.1 | UI framework |
| **Vite** | 7.1.2 | Build tool với HMR |
| **React Router** | 7.9.1 | Client-side routing |
| **Styled Components** | 6.1.19 | CSS-in-JS styling |
| **Recharts** | 3.3.0 | Biểu đồ và visualization |
| **React Icons** | 5.5.0 | Thư viện icon |
| **jwt-decode** | 4.0.0 | Xử lý JWT token |
| **Node.js** | 22+ | Runtime environment |

### DevOps
- **Docker** & **Docker Compose**: Container orchestration
- **Nginx**: Web server cho frontend
- **Git**: Version control

## 🏗️ Kiến trúc hệ thống

### Kiến trúc phân lớp (Layered Architecture)

```
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER (Frontend)       │
│  React Components, Pages, Routing       │
└────────────────┬────────────────────────┘
                 │ HTTP/JSON (REST API)
┌────────────────▼────────────────────────┐
│    API LAYER (Controllers)              │
│  15+ Controllers, DTOs, Validation      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     SECURITY LAYER                      │
│  JWT Filter, Security Config, RBAC      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   BUSINESS LOGIC LAYER                  │
│  Services, Mappers, Validators          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   DATA ACCESS LAYER                     │
│  Repositories, JPA Queries              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   PERSISTENCE LAYER                     │
│  JPA Entities, MySQL Database           │
└─────────────────────────────────────────┘
```

### Mô hình triển khai Docker

```
┌────────────────────────────────────────────────┐
│              Docker Network (app-network)      │
│                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────┐│
│  │  Frontend    │  │   Backend    │  │ MySQL││
│  │  (React +    │◄─┤ (Spring Boot)│◄─┤  8.0 ││
│  │   Nginx)     │  │   Java 21    │  │      ││
│  │  Port: 3000  │  │  Port: 8080  │  │ 3308 ││
│  └──────────────┘  └──────────────┘  └──────┘│
└────────────────────────────────────────────────┘
```

## 💻 Yêu cầu hệ thống

### Yêu cầu tối thiểu

- **JDK**: 21 hoặc mới hơn
- **Maven**: 3.9.11 hoặc mới hơn
- **Node.js**: 22 hoặc mới hơn
- **MySQL**: 8.0 hoặc mới hơn
- **Docker**: Latest (cho triển khai container)
- **Docker Compose**: Latest

### Cấu hình khuyến nghị

- **RAM**: 4GB trở lên
- **CPU**: 2 cores trở lên
- **Disk**: 10GB dung lượng trống

## 📦 Cài đặt và chạy

### Phương án 1: Sử dụng Docker Compose (Khuyến nghị)

#### 1. Clone repository

```bash
git clone https://github.com/your-username/OEM-EV-Warranty-Management-System.git
cd OEM-EV-Warranty-Management-System
```

#### 2. Tạo file `.env`

Tạo file `.env` trong thư mục gốc với nội dung:

```env
# MySQL Configuration
DB_HOST=mysql
DB_PORT=3306
DB_NAME=warranty_db
DB_USER=warranty_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_at_least_32_characters_long_for_security
```

#### 3. Khởi chạy Docker Compose

```bash
docker-compose up --build
```

#### 4. Truy cập hệ thống

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

### Phương án 2: Chạy Local Development

#### Backend

```bash
# Di chuyển vào thư mục backend
cd BE/oem-ev-warranty-management-system

# Tạo file .env hoặc cấu hình application.properties
# với thông tin database và JWT secret

# Build project
mvn clean install

# Chạy Spring Boot
mvn spring-boot:run
```

Backend sẽ chạy tại: http://localhost:8080

#### Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd FE/OEM-EV-Warranty-Management-System

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173 (hoặc cổng mà Vite chỉ định)

#### MySQL Database

Đảm bảo MySQL đang chạy và tạo database:

```sql
CREATE DATABASE warranty_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'warranty_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON warranty_db.* TO 'warranty_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📁 Cấu trúc dự án

```
OEM-EV-Warranty-Management-System/
│
├── BE/                                          # Backend (Spring Boot)
│   ├── Dockerfile
│   └── oem-ev-warranty-management-system/
│       ├── pom.xml                              # Maven dependencies
│       ├── src/main/java/com/swp391/warrantymanagement/
│       │   ├── controller/                      # 15+ REST Controllers
│       │   │   ├── AuthController.java
│       │   │   ├── CustomerController.java
│       │   │   ├── VehicleController.java
│       │   │   ├── WarrantyClaimController.java
│       │   │   ├── PartController.java
│       │   │   ├── RecallRequestController.java
│       │   │   └── ...
│       │   ├── service/                         # Business logic
│       │   ├── entity/                          # JPA Entities (16 tables)
│       │   ├── dto/                             # Data Transfer Objects
│       │   ├── repository/                      # Data access layer
│       │   ├── config/                          # Security, JWT, CORS config
│       │   ├── exception/                       # Exception handling
│       │   └── mapper/                          # Entity-DTO mappers
│       ├── src/main/resources/
│       │   └── application.properties           # Spring configuration
│       └── docs/                                # Documentation
│           ├── API_DOCUMENTATION.md
│           ├── SYSTEM_ARCHITECTURE_EXPLANATION.md
│           ├── DATA_FLOW_SCENARIOS.md
│           ├── SECURITY_GUIDE.md
│           └── CORS_CONFIGURATION.md
│
├── FE/                                          # Frontend (React)
│   ├── Dockerfile
│   └── OEM-EV-Warranty-Management-System/
│       ├── package.json                         # NPM dependencies
│       ├── vite.config.js                       # Vite configuration
│       └── src/
│           ├── pages/                           # Page components
│           │   ├── Admin/                       # Admin pages (11 pages)
│           │   ├── Customer/                    # Customer pages (7 pages)
│           │   ├── EVM/                         # EVM Staff pages (8 pages)
│           │   ├── SCStaff/                     # SC Staff pages (5 pages)
│           │   └── SCTechnician/                # Technician pages (8 pages)
│           ├── components/                      # Reusable components
│           ├── api/                             # API client functions
│           ├── context/                         # React Context (State mgmt)
│           ├── hooks/                           # Custom React hooks
│           ├── utils/                           # Utility functions
│           ├── App.jsx                          # Main routing
│           └── main.jsx                         # Entry point
│
├── Requirements/                                # Tài liệu yêu cầu
│   ├── use-case-analysis-table.md              # 26 use cases
│   ├── Physical ERD.png                         # Database schema
│   ├── Context Diagram.drawio.png               # System context
│   ├── Use Case Diagram.jpg                     # Use case diagram
│   └── Feature List.docx                        # Feature specifications
│
├── docker-compose.yml                           # Docker orchestration
├── README.md                                    # This file
└── .gitignore
```

## 📚 API Documentation

### Swagger UI

Truy cập tài liệu API tương tác tại:
```
http://localhost:8080/swagger-ui.html
```

### API Endpoints

Hệ thống cung cấp 15+ controllers với 100+ endpoints:

| Controller | Chức năng chính |
|-----------|-----------------|
| **AuthController** | Login, logout, refresh token, đăng ký, reset password |
| **CustomerController** | Quản lý hồ sơ khách hàng, xe, lịch sử bảo hành |
| **VehicleController** | Đăng ký xe, tra cứu VIN, quản lý thông tin xe |
| **WarrantyClaimController** | Tạo/quản lý yêu cầu bảo hành, cập nhật trạng thái |
| **PartController** | Quản lý danh mục phụ tùng |
| **PartRequestController** | Yêu cầu và theo dõi phụ tùng |
| **ServiceCenterController** | Quản lý trung tâm dịch vụ, đánh giá |
| **RecallRequestController** | Tạo/quản lý chiến dịch triệu hồi |
| **WorkLogController** | Theo dõi công việc kỹ thuật viên |
| **FeedbackController** | Quản lý phản hồi và đánh giá |
| **AdminController** | Quản lý người dùng và hệ thống |

### Authentication

Tất cả API (trừ public endpoints) yêu cầu JWT token:

```bash
Authorization: Bearer <your_jwt_token>
```

### Ví dụ API Call

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password"}'

# Get warranty claims (cần token)
curl -X GET http://localhost:8080/api/warranty-claims \
  -H "Authorization: Bearer <token>"
```

## 👥 Vai trò người dùng

### 1. CUSTOMER (Khách hàng)
**Quyền truy cập:**
- Xem thông tin xe và bảo hành của mình
- Xem lịch sử dịch vụ
- Gửi phản hồi và đánh giá
- Phản hồi thông báo triệu hồi
- Tìm kiếm trung tâm dịch vụ

**Dashboard:** 7 trang chức năng

### 2. SC_STAFF (Nhân viên Trung tâm Dịch vụ)
**Quyền truy cập:**
- Đăng ký xe mới
- Tạo yêu cầu bảo hành
- Quản lý thông tin khách hàng
- Xem phản hồi khách hàng
- Quản lý lịch sử dịch vụ

**Dashboard:** 5 trang chức năng

### 3. SC_TECHNICIAN (Kỹ thuật viên)
**Quyền truy cập:**
- Xem công việc được giao
- Tạo work log
- Yêu cầu phụ tùng
- Tra cứu xe và phụ tùng
- Quản lý lịch sử dịch vụ

**Dashboard:** 8 trang chức năng

### 4. EVM_STAFF (Nhân viên Nhà sản xuất)
**Quyền truy cập:**
- Quản lý danh mục phụ tùng
- Duyệt yêu cầu phụ tùng
- Tạo chiến dịch triệu hồi
- Xem work logs và phản hồi
- Phân tích dữ liệu bảo hành

**Dashboard:** 8 trang chức năng

### 5. ADMIN (Quản trị viên)
**Quyền truy cập:**
- Toàn quyền quản lý hệ thống
- Quản lý người dùng và phân quyền
- Quản lý tất cả dữ liệu
- Cấu hình hệ thống
- Báo cáo và phân tích

**Dashboard:** 11 trang chức năng

## 🔒 Bảo mật

### JWT Authentication

- **Access Token**: Thời gian sống 15-60 phút
- **Refresh Token**: Thời gian sống 7-30 ngày
- **Encryption**: Secret key tối thiểu 32 ký tự

### RBAC (Role-Based Access Control)

- Phân quyền dựa trên vai trò
- Endpoints được bảo vệ bởi annotations
- Kiểm tra quyền truy cập tại Security Layer

### Security Best Practices

- Password hashing với BCrypt
- CORS configuration cho production
- Input validation
- SQL injection prevention (JPA Prepared Statements)
- XSS protection

### Cấu hình CORS

```java
// Cho phép frontend truy cập từ các domain được cấu hình
allowedOrigins: http://localhost:3000, http://localhost:5173
```

## 📖 Tài liệu

### Tài liệu Backend (BE/docs/)

- **API_DOCUMENTATION.md**: Tài liệu API đầy đủ
- **SYSTEM_ARCHITECTURE_EXPLANATION.md**: Giải thích kiến trúc hệ thống
- **DATA_FLOW_SCENARIOS.md**: Kịch bản luồng dữ liệu
- **SECURITY_GUIDE.md**: Hướng dẫn bảo mật
- **CORS_CONFIGURATION.md**: Cấu hình CORS

### Tài liệu Yêu cầu (Requirements/)

- **use-case-analysis-table.md**: Bảng phân tích 26 use cases
- **Physical ERD.png**: Sơ đồ ERD database
- **Context Diagram.drawio.png**: Sơ đồ ngữ cảnh hệ thống
- **Use Case Diagram.jpg**: Sơ đồ use case
- **Feature List.docx**: Danh sách tính năng chi tiết

## 🔄 Quy trình nghiệp vụ chính

### 1. Quy trình Yêu cầu Bảo hành

```
Khách hàng thông báo SC → SC Staff tạo yêu cầu →
Hệ thống xác thực bảo hành → Admin duyệt →
Kỹ thuật viên sửa chữa → Khách hàng phản hồi → Hoàn tất
```

### 2. Quy trình Triệu hồi

```
EVM Staff tạo chiến dịch triệu hồi → Admin duyệt →
Hệ thống thông báo khách hàng → Khách hàng chấp nhận/từ chối →
SC Staff tạo yêu cầu bảo hành → Kỹ thuật viên xử lý → Hoàn tất
```

### 3. Quy trình Yêu cầu Phụ tùng

```
Kỹ thuật viên yêu cầu phụ tùng → EVM Staff duyệt →
Phụ tùng được cấp → Lắp đặt → Cập nhật lịch sử
```

## 🧪 Testing

### Backend Testing

```bash
cd BE/oem-ev-warranty-management-system

# Run unit tests
mvn test

# Run with coverage
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Frontend Testing

```bash
cd FE/OEM-EV-Warranty-Management-System

# Run tests (if configured)
npm test
```

## 🚀 Deployment

### Production Build

#### Backend

```bash
cd BE/oem-ev-warranty-management-system
mvn clean package -DskipTests
# Output: target/oem-ev-warranty-management-system-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
cd FE/OEM-EV-Warranty-Management-System
npm run build
# Output: dist/
```

### Docker Production

```bash
# Build và chạy tất cả services
docker-compose up -d --build

# Kiểm tra logs
docker-compose logs -f

# Dừng services
docker-compose down
```

## 🛠️ Troubleshooting

### Lỗi kết nối Database

- Kiểm tra MySQL đang chạy
- Xác nhận thông tin trong `.env` chính xác
- Kiểm tra port 3308 (hoặc 3306) không bị chiếm dụng

### Lỗi JWT Token

- Đảm bảo `JWT_SECRET_KEY` trong `.env` đủ dài (≥32 ký tự)
- Kiểm tra token chưa hết hạn
- Refresh token nếu access token hết hạn

### Lỗi CORS

- Kiểm tra cấu hình CORS trong backend
- Đảm bảo frontend URL trong danh sách `allowedOrigins`

### Port bị chiếm dụng

```bash
# Linux/Mac
lsof -i :8080  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>
```

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Hệ thống quản lý bảo hành hoàn chỉnh
- ✅ 5 vai trò người dùng với dashboard riêng
- ✅ JWT authentication với refresh token
- ✅ Quản lý triệu hồi tích hợp
- ✅ Smart refresh system
- ✅ Service center mapping
- ✅ Docker containerization
- ✅ API documentation với Swagger

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được cấp phép theo [MIT License](LICENSE).

## 👨‍💻 Team

Được phát triển bởi nhóm SWP391.

## 📧 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng:
- Tạo [Issue](https://github.com/your-username/OEM-EV-Warranty-Management-System/issues)
- Email: your-email@example.com

---

⭐ **Star repo này nếu bạn thấy hữu ích!**

Made with ❤️ by SWP391 Team
