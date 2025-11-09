# Hướng dẫn Bảo mật: JWT & Phân quyền (RBAC)

## 📋 Tổng quan

Hệ thống sử dụng **JWT (JSON Web Token)** để xác thực (Authentication) và **Phân quyền dựa trên vai trò (Role-Based Access Control - RBAC)** để cấp quyền (Authorization).

- **Authentication**: Xác định "bạn là ai" thông qua JWT.
- **Authorization**: Xác định "bạn được làm gì" thông qua các Role được gán.

---

## 🔐 Luồng xác thực JWT (JWT Authentication Flow)

### 1. Đăng nhập (Login)

- **Client** gửi `username` và `password` đến `POST /api/auth/login`.
- **Server** xác thực thông tin. Nếu thành công, server tạo ra 2 token:
  - `accessToken`: Thời gian sống ngắn (~15-30 phút), dùng cho các request thông thường.
  - `refreshToken`: Thời gian sống dài (~7 ngày), dùng để lấy `accessToken` mới.
- **Server** trả về cả 2 token cùng thông tin cơ bản của người dùng.

### 2. Gửi Request đã được xác thực

- **Client** đính kèm `accessToken` vào header của mỗi request cần bảo vệ:
  `Authorization: Bearer <accessToken>`
- **`JwtAuthenticationFilter`** (một middleware của Spring Security) sẽ chặn request, kiểm tra và xác thực token.
- Nếu token hợp lệ, filter sẽ lấy thông tin người dùng (username, role) và lưu vào `SecurityContextHolder`.

### 3. Làm mới Token (Refresh Token)

- Khi `accessToken` hết hạn, server sẽ trả về lỗi `401 Unauthorized`.
- **Client** nhận lỗi 401, tự động gọi đến `POST /api/auth/refresh` và gửi kèm `refreshToken`.
- **Server** xác thực `refreshToken`. Nếu hợp lệ, server sẽ cấp một cặp `accessToken` và `refreshToken` mới.
- **Client** lưu lại token mới và thực hiện lại request đã thất bại trước đó.

### 4. Đăng xuất (Logout)

- **Client** gọi `POST /api/auth/logout` và gửi kèm `accessToken`.
- **Server** sẽ vô hiệu hóa token đó (ví dụ: bằng cách lưu vào blacklist cho đến khi nó hết hạn).
- **Client** xóa tất cả token đã lưu.

---

## 📊 Sơ đồ luồng JWT

```
┌──────────────┐
│    Client    │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. POST /login (username + password)
       ▼
┌─────────────────────────────────┐
│       AuthController            │
│   → AuthService                 │
│   - Verify credentials          │
│   - Generate accessToken        │
│   - Generate refreshToken       │
└──────────┬──────────────────────┘
           │
           │ 2. Return tokens
           ▼
┌─────────────────────────────────┐
│   Client saves tokens           │
│   - accessToken → memory        │
│   - refreshToken → localStorage │
└──────────┬──────────────────────┘
           │
           │ 3. API Request + accessToken
           ▼
┌─────────────────────────────────┐
│  JwtAuthenticationFilter        │
│  - Extract JWT from header      │
│  - Validate JWT                 │
│  - Extract username + roles     │
│  - Set SecurityContext          │
└──────────┬──────────────────────┘
           │
           │ 4. Check role permission
           ▼
┌─────────────────────────────────┐
│  @PreAuthorize("hasRole(...)")  │
│  - Allow or Deny                │
└──────────┬──────────────────────┘
           │
           │ 5. Execute business logic
           ▼
┌─────────────────────────────────┐
│  Controller → Service → DB      │
│  Return response                │
└─────────────────────────────────┘
```

---

## 🔑 Các vai trò trong hệ thống (User Roles)

1.  **ADMIN**:
    - **Mô tả**: Quản trị viên hệ thống, có quyền cao nhất.
    - **Quyền hạn**: Toàn quyền truy cập và thực hiện mọi thao tác (CRUD) trên tất cả các tài nguyên, bao gồm cả việc quản lý người dùng.

2.  **EVM_STAFF (Electric Vehicle Manufacturer Staff)**:
    - **Mô tả**: Nhân viên nhà sản xuất xe điện.
    - **Quyền hạn**:
        - Quản lý danh mục linh kiện (`Part`).
        - Xử lý các yêu cầu linh kiện (`PartRequest`): duyệt hoặc từ chối.
        - Tạo các yêu cầu triệu hồi (`RecallRequest`).

3.  **SC_STAFF (Service Center Staff)**:
    - **Mô tả**: Nhân viên tại trung tâm bảo hành.
    - **Quyền hạn**:
        - Tạo yêu cầu bảo hành (`WarrantyClaim`) cho khách hàng.
        - Quản lý vòng đời của `WarrantyClaim` (ví dụ: duyệt yêu cầu ban đầu).
        - Quản lý thông tin khách hàng (`Customer`).

4.  **SC_TECHNICIAN (Service Center Technician)**:
    - **Mô tả**: Kỹ thuật viên sửa chữa tại trung tâm bảo hành.
    - **Quyền hạn**:
        - Xử lý các `WarrantyClaim` đã được giao.
        - Ghi lại nhật ký công việc (`WorkLog`).
        - Tạo yêu cầu linh kiện (`PartRequest`) nếu cần.

5.  **CUSTOMER**:
    - **Mô tả**: Khách hàng, chủ sở hữu xe.
    - **Quyền hạn**:
        - Xem thông tin các xe của mình.
        - Xem lịch sử bảo hành, bảo dưỡng của xe.
        - Gửi đánh giá (`Feedback`) cho các lần bảo hành đã hoàn thành.
        - Xác nhận các yêu cầu triệu hồi (`RecallRequest`).

---

## 🛡️ Phân quyền API (API Permissions)

Hệ thống sử dụng 2 lớp bảo vệ:

1.  **`SecurityConfig` (Cấp độ URL)**: Cấu hình chung cho các pattern URL (ví dụ: `/api/admin/**` chỉ dành cho `ADMIN`).
2.  **`@PreAuthorize` (Cấp độ phương thức)**: Kiểm tra quyền chi tiết hơn ngay tại từng phương thức trong Controller. Đây là "nguồn chân lý" chính xác nhất cho việc phân quyền.

### Ma trận phân quyền tổng quan

| Tài nguyên | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|---|---|---|---|---|---|
| **Users** | ✅ (CRUD) | ❌ | ❌ | ❌ | ❌ |
| **Customers** | ✅ (CRUD) | ✅ (Read) | ✅ (CRUD) | ❌ | ✅ (Profile) |
| **Vehicles** | ✅ (CRUD) | ✅ (CRUD) | ✅ (CRUD) | ✅ (Read) | ✅ (Read Own) |
| **Parts** | ✅ (CRUD) | ✅ (CRUD) | ✅ (Read) | ✅ (Read) | ✅ (Read) |
| **Warranty Claims** | ✅ (CRUD + Daily Stats) | ✅ (Read All) | ✅ (CRUD + Daily Stats) | ✅ (Process + Read) | ✅ (Read Own) |
| **Installed Parts** | ✅ (CRUD) | ✅ (Read) | ✅ (CRUD) | ✅ (Read) | ❌ |
| **Work Logs** | ✅ (CRUD) | ✅ (Read) | ✅ (Read) | ✅ (CRUD) | ❌ |
| **Part Requests** | ✅ (CRUD) | ✅ (Approve) | ✅ (Read) | ✅ (Create) | ❌ |
| **Recall Requests** | ✅ (Approve/Reject) | ✅ (Create) | ✅ (Read) | ❌ | ✅ (Read Own) |
| **Recall Responses** | ✅ (Read All) | ✅ (Read) | ✅ (Read) | ❌ | ✅ (Confirm Own) |
| **Service Centers** | ✅ (CRUD) | ✅ (Read) | ✅ (Read) | ✅ (Read) | ✅ (Read - Public) |
| **Feedbacks** | ✅ (CRUD) | ✅ (Read) | ✅ (Read) | ✅ (Read) | ✅ (CRUD Own) |

> **Lưu ý quan trọng:** Bảng trên chỉ là tóm tắt. Để xem chi tiết quyền truy cập của từng endpoint (GET, POST, PUT, DELETE), hãy tham khảo **Swagger UI**.

---

## 📖 Cách xem tài liệu API chi tiết với Swagger

Thay vì duy trì một file tài liệu thủ công, hệ thống đã tích hợp **Swagger (OpenAPI)** để tự động tạo ra tài liệu API trực tiếp từ code.

1.  **Khởi động ứng dụng** Spring Boot.
2.  **Truy cập vào địa chỉ:** http://localhost:8080/swagger-ui.html
3.  Trên giao diện Swagger, bạn có thể:
    - Xem tất cả các endpoint được nhóm theo Controller.
    - Xem chi tiết các tham số, request body (DTO), và response body.
    - **Quan trọng:** Xem các quyền yêu cầu cho từng endpoint (dựa trên `@PreAuthorize`).
    - **Test API trực tiếp** trên trình duyệt.

**Việc sử dụng Swagger đảm bảo rằng tài liệu API luôn chính xác và được cập nhật cùng với code.**