# JWT Authentication & Authorization Flow Guide

## 📋 Tổng quan hệ thống

Hệ thống OEM EV Warranty Management sử dụng JWT (JSON Web Token) để xác thực và phân quyền người dùng.

## 🔐 Các Role trong hệ thống

1. **ADMIN** - Quản trị viên hệ thống
   - Có thể CRUD tất cả resources
   - Truy cập tất cả endpoints
   - Quản lý users và roles
   - Duy nhất có quyền DELETE hầu hết resources

2. **EVM_STAFF** - Nhân viên nhà sản xuất xe điện
   - CRUD vehicles và parts (trừ DELETE parts - chỉ ADMIN)
   - CRU customers (không DELETE)
   - **Workflow**: Xem xét và chấp nhận/từ chối warranty claims
   - **Không có access**: Service histories

3. **SC_STAFF** - Nhân viên trung tâm bảo hành
   - CRUD customers, vehicles, warranty claims, service histories
   - READ parts (không thể CUD parts)
   - **Workflow**: Tạo warranty claims cho khách hàng
   - Quản lý toàn bộ quy trình bảo hành

4. **SC_TECHNICIAN** - Kỹ thuật viên trung tâm bảo hành
   - READ vehicles, parts
   - RU warranty claims (không thể CREATE/DELETE)
   - CRUD service histories
   - **Workflow**: Xử lý warranty claims (start/complete processing)
   - **Không có access**: Customers management

5. **CUSTOMER** - Khách hàng
   - READ vehicles của mình (qua `/my-vehicles`)
   - READ parts information
   - CR warranty claims của mình (không thể UPDATE/DELETE)
   - READ service histories của vehicles mình sở hữu
   - Self-service: Update profile qua `/profile`

## 🚀 Flow Authentication (Đăng nhập)

### 1. User Login
```
POST /api/auth/login
Body: {
  "username": "admin",
  "password": "admin123"
}
```

### 2. Server xử lý
```
AuthController.login()
  ↓
AuthService.authenticateUser()
  ↓
1. Tìm user trong database (UserRepository.findByUsername())
2. Verify password với BCrypt
3. Generate JWT access token (JwtService.generateToken())
4. Generate refresh token (JwtService.generateRefreshToken())
5. Lưu refresh token vào database
```

### 3. Response trả về
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
}
```

## 🔒 Flow Authorization (Phân quyền)

### 1. Client gửi request với JWT
```
POST /api/vehicles
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9...",
  "Content-Type": "application/json"
}
Body: {
  "vehicleName": "Tesla Model 3",
  "vehicleVin": "1HGBH41JXMN109186"
}
```

### 2. Spring Security Filter Chain
```
Request vào hệ thống
  ↓
JwtAuthenticationFilter.doFilterInternal()
  ↓
1. Extract token từ Authorization header
2. Validate token format (Bearer xxx)
3. Extract username từ JWT (JwtService.extractUsername())
4. Load UserDetails từ database (CustomUserDetailsService.loadUserByUsername())
5. Validate JWT token (JwtService.isTokenValid())
6. Set Authentication trong SecurityContext
  ↓
SecurityFilterChain kiểm tra @PreAuthorize
  ↓
Controller method được gọi nếu có quyền
```

### 3. Method-level Security
```java
@PostMapping("/vehicles")
@PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
public ResponseEntity<VehicleResponseDTO> createVehicle(@RequestBody VehicleRequestDTO request) {
    // Code chỉ chạy nếu user có role ADMIN hoặc EVM_STAFF
}
```

## 📊 Flow xác định User hiện tại

### 1. Trong Controller
```java
@PostMapping("/vehicles")
public ResponseEntity<?> createVehicle(@RequestBody VehicleRequestDTO request) {
    // Lấy thông tin user hiện tại
    String currentUser = SecurityUtil.getCurrentUsername();
    Set<String> roles = SecurityUtil.getCurrentRoles();
    
    // Log để audit
    logger.info("User: {} creating vehicle with roles: {}", currentUser, roles);
    
    // Xử lý logic theo role
    if (SecurityUtil.hasRole("ADMIN")) {
        // Logic cho Admin
    } else if (SecurityUtil.hasRole("EVM_STAFF")) {
        // Logic cho EVM Staff
    }
}
```

### 2. SecurityUtil Flow
```
SecurityUtil.getCurrentUsername()
  ↓
SecurityContextHolder.getContext().getAuthentication()
  ↓
Authentication.getName() → return username
```

## 🔄 Flow Refresh Token

### 1. Access token hết hạn
```
Client request → Server response 401 Unauthorized
```

### 2. Client refresh token
```
POST /api/auth/refresh
Body: {
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Server xử lý
```
AuthService.refreshUserToken()
  ↓
1. Validate refresh token từ database
2. Kiểm tra expiration date
3. Generate new access token
4. Generate new refresh token
5. Update refresh token trong database
6. Return new tokens
```

## 🛡️ Security Features

### 1. Password Encryption
```
User password → BCryptPasswordEncoder → Hashed password lưu trong DB
```

### 2. JWT Token Structure
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "username",
  "iat": 1696838400,
  "exp": 1696842000
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### 3. Token Validation
```
JwtService.isTokenValid()
  ↓
1. Check token format
2. Verify signature với secret key
3. Check expiration date
4. Validate username
```

## 📱 API Endpoints Security Matrix (CHÍNH XÁC)

| Endpoint | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|----------|-------|-----------|----------|---------------|----------|
| **VEHICLES** |
| `GET /api/vehicles` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST /api/vehicles` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/vehicles/{id}` | ✅ | ✅ | ✅ | ❌ | ✅ (own only) |
| `PUT /api/vehicles/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/vehicles/{id}` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/vehicles/my-vehicles` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `GET /api/vehicles/by-customer/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/vehicles/by-vin` | ✅ | ✅ | ✅ | ❌ | ❌ |
| **PARTS** |
| `GET /api/parts` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/parts/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/parts` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/parts/{id}` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `DELETE /api/parts/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/parts/by-vehicle/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CUSTOMERS** |
| `GET /api/customers` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/customers/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST /api/customers` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `PUT /api/customers/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/customers/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT /api/customers/profile` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `GET /api/customers/search` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/customers/by-email` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/customers/by-phone` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **WARRANTY CLAIMS** |
| `GET /api/warranty-claims` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/warranty-claims/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST /api/warranty-claims` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /api/warranty-claims/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/warranty-claims/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **WORKFLOW ENDPOINTS** |
| `POST /api/warranty-claims/sc-create` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `PATCH /api/warranty-claims/{id}/evm-accept` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `PATCH /api/warranty-claims/{id}/evm-reject` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `PATCH /api/warranty-claims/{id}/tech-start` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `PATCH /api/warranty-claims/{id}/tech-complete` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `GET /api/warranty-claims/evm-pending` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/warranty-claims/tech-pending` | ❌ | ❌ | ❌ | ✅ | ❌ |
| **SERVICE HISTORIES** |
| `GET /api/service-histories` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /api/service-histories/{id}` | ✅ | ❌ | ✅ | ✅ | ✅ (own vehicles) |
| `POST /api/service-histories` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `PUT /api/service-histories/{id}` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `DELETE /api/service-histories/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🚨 Lưu ý quan trọng về Security

### 1. Data Isolation cho Customer
- Customer chỉ truy cập được data của vehicles mình sở hữu
- Business logic filtering được implement tại service layer
- JWT claims chứa user info để xác định ownership

### 2. Workflow Security
- Warranty claim workflow có strict role-based transitions
- Chỉ specific roles mới có thể thực hiện workflow actions
- Status transitions được validate trước khi thực hiện

### 3. Sensitive Information Protection
- VIN lookup chỉ cho phép ADMIN/STAFF roles
- Customer data chỉ accessible cho authorized roles
- Audit logging cho tất cả critical operations

### 4. Token Security
- Access token có thời gian expire ngắn
- Refresh token được store và validate trong database
- Automatic token refresh khi access token hết hạn

## 🔧 Error Handling

### 401 Unauthorized
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/vehicles"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 403,
  "error": "Forbidden", 
  "message": "Access denied. Insufficient permissions",
  "path": "/api/vehicles"
}
```

### 400 Bad Request (Invalid Credentials)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid username or password",
  "path": "/api/auth/login"
}
```
