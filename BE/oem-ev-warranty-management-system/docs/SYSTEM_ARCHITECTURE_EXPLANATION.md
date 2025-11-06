# HỆ THỐNG QUẢN LÝ BẢO HÀNH XE ĐIỆN - TÀI LIỆU KIẾN TRÚC

## 📋 TỔNG QUAN HỆ THỐNG

### Mục đích
Hệ thống quản lý quy trình bảo hành xe điện từ khi khách hàng tạo yêu cầu đến khi hoàn thành sửa chữa và đánh giá.

### Các Actor (Vai trò người dùng)
1. **CUSTOMER (Khách hàng)** - Chủ sở hữu xe điện
2. **SC_STAFF (Service Center Staff)** - Nhân viên trung tâm bảo hành
3. **SC_TECHNICIAN (Technician)** - Kỹ thuật viên sửa chữa
4. **EVM_STAFF (EV Manufacturer Staff)** - Nhân viên nhà sản xuất
5. **ADMIN** - Quản trị viên hệ thống

---

## 1. KIẾN TRÚC HỆ THỐNG (LAYERED ARCHITECTURE)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  - Controller: Nhận HTTP request, trả về HTTP response      │
│  - DTO: Data Transfer Object (request/response)             │
│  - Exception Handler: Xử lý lỗi tập trung                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYER                          │
│  - JWT Filter: Kiểm tra token trong mỗi request             │
│  - Security Config: Phân quyền endpoint theo role           │
│  - Custom UserDetailsService: Load user từ database         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                    │
│  - Service Interface: Định nghĩa business operations        │
│  - Service Implementation: Logic nghiệp vụ                  │
│  - Mapper: Convert Entity ↔ DTO                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  - Repository: Interface kế thừa JpaRepository              │
│  - Custom Queries: @Query annotation                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                        │
│  - Entity: JPA entities mapping với database tables         │
│  - Database: MySQL/PostgreSQL                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 QUY TRÌNH BẢO HÀNH VÀ TRIỆU HỒI

### 1️⃣ KHÁCH HÀNG ĐẾN TRUNG TÂM BẢO HÀNH
```
Khách hàng phát hiện xe bị lỗi
    ↓
Sử dụng ứng dụng/web để xem bản đồ các Trung tâm bảo hành (Service Center) và tìm địa điểm gần nhất
    ↓
Khách hàng mang xe đến Trung tâm bảo hành đã chọn
```

### 2️⃣ NHÂN VIÊN (SC_STAFF) TIẾP NHẬN VÀ TẠO CLAIM
```
SC_STAFF chào đón khách hàng và tiếp nhận xe
    ↓
Tra cứu thông tin khách hàng (qua SĐT, email, hoặc VIN xe)
    ↓
Nếu khách hàng chưa có tài khoản → SC_STAFF hỗ trợ đăng ký tài khoản mới
    ↓
SC_STAFF đăng nhập và tạo WarrantyClaim:
  - Chọn xe của khách hàng, ghi nhận mô tả lỗi
  - Kiểm tra sơ bộ và xác định linh kiện có thể bị lỗi
    ↓
Hệ thống tự động kiểm tra điều kiện bảo hành
    ↓
Nếu hợp lệ → Tạo WarrantyClaim với status = SUBMITTED
Nếu không → SC_STAFF thông báo lý do từ chối cho khách hàng
```

### 3️⃣ ADMIN DUYỆT CLAIM
```
ADMIN đăng nhập và xem danh sách claim PENDING
    ↓
Review thông tin claim
    ↓
Quyết định:
  → APPROVE: Assign Technician cho Service Center tương ứng
  → REJECT: Nhập lý do từ chối
    ↓
Hệ thống cập nhật status và gửi notification cho các bên liên quan (Technician, SC_STAFF, Customer)
```

### 4️⃣ TECHNICIAN SỬA CHỮA
```
Technician nhận notification và xem claim được assign
    ↓
Bắt đầu sửa chữa và tạo WorkLog
    ↓
Trong quá trình sửa:
  - Nếu cần part mới → Tạo PartRequest gửi EVM_STAFF
    ↓
Hoàn thành sửa chữa → Update WorkLog và Claim status = COMPLETED
```

### 5️⃣ CUSTOMER ĐÁNH GIÁ (FEEDBACK)
```
Hệ thống gửi email/notification yêu cầu đánh giá
    ↓
Customer đăng nhập, xem claim đã hoàn thành và tạo Feedback (rating, comment)
    ↓
Hệ thống tính lại average rating cho Service Center
```

### 6️⃣ QUY TRÌNH TRIỆU HỒI (RECALL)
```
EVM_STAFF phát hiện lỗi hàng loạt → Tạo RecallRequest với status PENDING
    ↓
ADMIN review danh sách các RecallRequest đang PENDING
    ↓
ADMIN quyết định:
  → APPROVE: Chấp thuận yêu cầu triệu hồi.
  → REJECT: Từ chối, nhập lý do.
    ↓
Nếu APPROVED, hệ thống xác định khách hàng bị ảnh hưởng, tạo RecallResponse (status=PENDING) và gửi thông báo
    ↓
CUSTOMER nhận thông báo, đăng nhập và phản hồi:
  → ACCEPT: Đồng ý tham gia. Status `RecallResponse` đổi thành ACCEPTED.
  → DECLINE: Từ chối. Status `RecallResponse` đổi thành DECLINED (lưu lại để miễn trừ trách nhiệm).
    ↓
Nếu ACCEPTED, khách hàng được hướng dẫn đến trung tâm bảo hành.
    ↓
SC_STAFF tạo WarrantyClaim mới liên kết với RecallRequest.
    ↓
Quy trình sửa chữa tiếp diễn như bước 4️⃣ và 5️⃣.
```

---

## 🔐 HỆ THỐNG BẢO MẬT (SECURITY ARCHITECTURE)

### JWT Authentication Flow
```
1. LOGIN: Client gửi {username, password} → Server kiểm tra → Tạo JWT → Trả về {accessToken, refreshToken}
2. AUTHENTICATED REQUEST: Client gửi request với header `Authorization: Bearer <JWT>` → Filter xác thực token → Controller xử lý
```

### Role-Based Access Control (RBAC)
```
┌─────────────┬─────────────────────────────────────────────┐
│   ROLE      │          PERMISSIONS                        │
├─────────────┼─────────────────────────────────────────────┤
│ ADMIN       │ - Quản lý user (CRUD)                       │
│             │ - Approve/Reject WarrantyClaim              │
│             │ - Approve/Reject RecallRequest              │
│             │ - Assign claim cho technician               │
│             │ - Xem tất cả thống kê                       │
├─────────────┼─────────────────────────────────────────────┤
│ EVM_STAFF   │ - Quản lý Part (CRUD)                       │
│             │ - Approve/Reject PartRequest                │
│             │ - Tạo RecallRequest                         │
├─────────────┼─────────────────────────────────────────────┤
│ SC_STAFF    │ - Tạo WarrantyClaim cho khách hàng          │
│             │ - Hỗ trợ đăng ký tài khoản khách hàng       │
│             │ - Xem thống kê của service center mình      │
├─────────────┼─────────────────────────────────────────────┤
│SC_TECHNICIAN│ - Xem claim được assign                     │
│             │ - Tạo/Update WorkLog                        │
│             │ - Tạo PartRequest                           │
│             │ - Update claim status                       │
├─────────────┼─────────────────────────────────────────────┤
│ CUSTOMER    │ - Xem lịch sử claim của mình                │
│             │ - Tạo Feedback                              │
│             │ - Xem thông tin vehicle của mình            │
│             │ - Phản hồi yêu cầu triệu hồi (Accept/Decline)│
└─────────────┴─────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE DESIGN - CÁC ENTITY CHÍNH

### 1. User & Authentication
- **User**: Thông tin đăng nhập (username, password, email)
- **Role**: Vai trò (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER)
- **Customer**: Thông tin bổ sung cho user có role CUSTOMER (phone, name)
- **Token**: JWT refresh token để renew access token

### 2. Vehicle & Parts
- **Vehicle**: Xe điện của khách hàng (VIN, model, warranty dates, mileage)
- **Part**: Danh mục linh kiện (catalog) - battery, motor, controller...
- **InstalledPart**: Linh kiện CỤ THỂ được lắp vào xe CỤ THỂ (installation date, warranty expiration)

### 3. Warranty Process
- **WarrantyClaim**: Yêu cầu bảo hành (status, description, resolution)
- **WorkLog**: Nhật ký công việc của technician (start time, end time, work done)
- **PartRequest**: Yêu cầu linh kiện từ technician đến EVM (status, tracking)
- **RecallRequest**: Thông báo triệu hồi từ EVM đến customer

### 4. Service & Feedback
- **ServiceCenter**: Trung tâm bảo hành (address, GPS coordinates, opening hours)
- **ServiceHistory**: Lịch sử bảo dưỡng/sửa chữa
- **Feedback**: Đánh giá của customer (rating 1-5, comment)

---

## 🔄 MỐI QUAN HỆ GIỮA CÁC ENTITY

### Vehicle-Centric Design (Xe là trung tâm)
```
        Customer (1) ──────── (N) Vehicle
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            (N) InstalledPart  (N) ServiceHistory  (N) WarrantyClaim
                    │                                   │
                    │                       ┌───────────┼───────────┐
                    │                       │           │           │
            (N) ServiceHistoryDetail   (N) WorkLog  (1) Feedback  (N) PartRequest
                    │                       │
                    │                       │
                   Part              SC_TECHNICIAN (User)
```

### Workflow Relationship
```
WarrantyClaim ────→ WorkLog (Technician ghi nhật ký)
      │
      └──────────→ PartRequest (Nếu cần part mới)
                        │
                        └──→ EVM_STAFF approve ──→ Ship part
```

---

## 🎯 ĐIỂM ĐẶC BIỆT CỦA THIẾT KẾ

### 1. **Tách Part ra khỏi Vehicle** (3-tier architecture)
- **Tại sao?** Part là thông tin CHUNG (catalog), Vehicle là thông tin CỤ THỂ
- **Lợi ích:** Tránh duplicate data, dễ quản lý recall, dễ tracking part quality

### 2. **UUID cho Customer ID**
- **Tại sao?** Bảo mật (khó đoán), privacy (không lộ số lượng customer)
- **Trade-off:** Chiếm nhiều bộ nhớ hơn Long, nhưng đáng giá cho security

### 3. **GPS Coordinates cho Service Center**
- **Tại sao?** Tích hợp Goong Maps, tìm center gần nhất
- **Sử dụng:** Haversine formula tính khoảng cách

### 4. **WorkLog tracking chi tiết**
- **Tại sao?** Audit trail, tính lương, đánh giá performance
- **Thiết kế:** Cho phép nhiều worklog/claim (sửa có thể bị gián đoạn)

### 5. **Feedback 1-1 với Claim**
- **Tại sao?** Tránh spam, mỗi claim chỉ 1 đánh giá
- **Sử dụng:** CSAT score, service center ranking

### 6. **JWT Stateless Authentication**
- **Tại sao?** Scalable, không cần lưu session server-side
- **Thiết kế:** Access token (3 hours) + Refresh token (7 days)

---

## 📊 CÁC BUSINESS METRIC QUAN TRỌNG

### 1. Warranty Metrics
- **Claim Success Rate** = (RESOLVED claims / Total claims) × 100%
- **Average Resolution Time** = AVG(resolutionDate - claimDate)
- **SLA Compliance** = (Claims resolved within 24h / Total claims) × 100%

### 2. Quality Metrics
- **CSAT Score** = (Feedbacks ≥ 4 stars / Total feedbacks) × 100%
- **Part Failure Rate** = (Claims for Part X / Total Part X installed) × 100%
- **Repeat Claim Rate** = (Vehicles with >1 claim / Total vehicles) × 100%

### 3. Efficiency Metrics
- **Technician Productivity** = Total claims resolved / Total working hours
- **Part Request Approval Time** = AVG(approvedDate - requestDate)
- **Service Center Workload** = Active claims / Available technicians

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Backend Stack
- **Spring Boot 3.x** - Framework chính
- **Spring Security + JWT** - Authentication & Authorization
- **Spring Data JPA** - ORM (Object-Relational Mapping)
- **Hibernate** - JPA implementation
- **MySQL/PostgreSQL** - Relational database
- **Lombok** - Giảm boilerplate code
- **BCrypt** - Password hashing

### Design Patterns
- **Layered Architecture** - Controller → Service → Repository
- **DTO Pattern** - Tách entity khỏi API response
- **Dependency Injection** - Spring IoC container
- **Repository Pattern** - Data access abstraction
- **Filter Chain** - JWT authentication filter

---

## 📝 CÂU HỎI THƯỜNG GẶP KHI BẢO VỆ

### Q1: Tại sao dùng JWT thay vì Session?
**A:** JWT stateless (không lưu server-side) → Scalable hơn. Phù hợp microservices, mobile app. Session phù hợp web app truyền thống cần server remember state.

### Q2: Tại sao tách Part ra khỏi Vehicle?
**A:** Part là CATALOG (thông tin chung), InstalledPart là INSTANCE (cụ thể). Tránh duplicate, dễ quản lý recall, tracking quality.

### Q3: Làm sao đảm bảo security?
**A:**
- Password hash bằng BCrypt
- JWT token expire sau 15 phút
- RBAC (role-based access control)
- Input validation ở DTO layer
- SQL injection prevention (JPA Parameterized Query)

### Q4: Xử lý concurrency như thế nào?
**A:**
- Database transaction (@Transactional)
- Optimistic locking (JPA @Version)
- Unique constraints (email, phone, VIN, partNumber)

### Q5: Tại sao dùng BigDecimal cho price/coordinates?
**A:** Float/Double có lỗi làm tròn (0.1 + 0.2 ≠ 0.3). BigDecimal chính xác tuyệt đối, quan trọng cho tiền tệ và GPS.

### Q6: Làm sao scale hệ thống khi có nhiều user?
**A:**
- JWT stateless → Dễ horizontal scaling
- Database indexing (VIN, partNumber, email)
- Lazy loading (@FetchType.LAZY)
- Pagination (PagedResponse)
- Caching (Redis cho catalog data)

---

## 🚀 HƯỚNG MỞ RỘNG TƯƠNG LAI

1. **Real-time Notification** - WebSocket cho live updates
2. **Mobile App** - React Native/Flutter connect qua REST API
3. **Analytics Dashboard** - Business Intelligence reports
4. **IoT Integration** - Xe tự động gửi diagnostic data
5. **AI/ML** - Predict part failure, recommend maintenance schedule
6. **Blockchain** - Immutable warranty history record

---

**📌 LƯU Ý:** File này giải thích TOÀN BỘ kiến trúc và quy trình. Đọc kỹ để hiểu logic, sẵn sàng trả lời mọi câu hỏi của giáo viên!
