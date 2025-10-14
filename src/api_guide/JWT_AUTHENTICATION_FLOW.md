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
   - **✅ NEW**: Có quyền truy cập Service Histories để theo dõi completion

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

## 📱 API Endpoints Security Matrix (CHÍNH XÁC THEO IMPLEMENTATION - UPDATED)

| Endpoint | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|----------|-------|-----------|----------|---------------|----------|
| **VEHICLES** |
| `GET /api/vehicles` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST /api/vehicles` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/vehicles/{id}` | ✅ | ✅ | ✅ | ❌ | ✅ (với business logic filtering) |
| `PUT /api/vehicles/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/vehicles/{id}` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/vehicles/my-vehicles` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `GET /api/vehicles/by-customer/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/vehicles/by-vin` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/vehicles/search` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `GET /api/vehicles/warranty-expiring` | ✅ | ✅ | ✅ | ❌ | ❌ |
| **PARTS** |
| `GET /api/parts` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/parts/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/parts` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/parts/{id}` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `DELETE /api/parts/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/parts/by-vehicle/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/parts/by-manufacturer` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /api/parts/warranty-expiring` | ✅ | ✅ | ✅ | ❌ | ❌ |
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
| `GET /api/customers/by-user/{userId}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **WARRANTY CLAIMS** ✅ (ĐÃ CÓ @PreAuthorize - SECURITY FIXED) |
| `GET /api/warranty-claims` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/warranty-claims/{id}` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /api/warranty-claims` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `PUT /api/warranty-claims/{id}` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/warranty-claims/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /api/warranty-claims/{id}/status` | ✅ | ✅ | ✅ | ❌ | ❌ |
| **WORKFLOW ENDPOINTS** ✅ (ĐÃ CÓ @PreAuthorize - SECURITY FIXED) |
| `POST /api/warranty-claims/sc-create` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `PATCH /api/warranty-claims/{id}/evm-accept` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `PATCH /api/warranty-claims/{id}/evm-reject` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `PATCH /api/warranty-claims/{id}/tech-start` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `PATCH /api/warranty-claims/{id}/tech-complete` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `GET /api/warranty-claims/evm-pending` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `GET /api/warranty-claims/tech-pending` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `GET /api/warranty-claims/by-status/{status}` | ✅ | ✅ | ✅ | ✅ | ❌ |
| **SERVICE HISTORIES** ✅ UPDATED - EVM_STAFF NOW HAS ACCESS |
| `GET /api/service-histories` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /api/service-histories/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ (với business logic filtering) |
| `POST /api/service-histories` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `PUT /api/service-histories/{id}` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `DELETE /api/service-histories/{id}` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /api/service-histories/by-vehicle/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ (với business logic filtering) |
| `GET /api/service-histories/by-part/{id}` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `GET /api/service-histories/my-services` | ❌ | ❌ | ❌ | ❌ | ✅ |
| **USER INFO** ✅ FIXED - ROLE NAMING CORRECTED |
| `GET /api/me` | ✅ | ✅ | ✅ | ✅ | ✅ |

## ✅ **ĐÃ KHẮC PHỤC TẤT CẢ VẤN ĐỀ BẢO MẬT**

### ✅ **Warranty Claims Controller - Đã có bảo mật hoàn chỉnh!**
**Tất cả endpoints trong WarrantyClaimController ĐÃ CÓ @PreAuthorize annotation!**

Đã được sửa:
- ✅ **Phân quyền chính xác** cho từng endpoint theo business logic
- ✅ **Workflow security** đảm bảo chỉ đúng role mới thực hiện được action
- ✅ **Role-based access** hoàn toàn được thực thi

### ✅ **Service History Controller - EVM_STAFF đã có quyền truy cập!**
**EVM_STAFF giờ có thể theo dõi warranty claim completion!**

Đã được thêm vào:
- ✅ `GET /api/service-histories` - EVM có thể xem tất cả service histories
- ✅ `GET /api/service-histories/{id}` - EVM có thể xem chi tiết
- ✅ `GET /api/service-histories/by-vehicle/{id}` - EVM theo dõi theo vehicle
- ✅ `GET /api/service-histories/by-part/{id}` - EVM theo dõi theo part

### ✅ **UserInfo Controller - Role naming đã được sửa!**
**Không còn sử dụng role names không tồn tại!**

Đã sửa:
- ✅ `hasRole("STAFF")` → `hasRole("SC_STAFF")`
- ✅ Tất cả endpoints đều sử dụng role names chính xác
- ✅ Security check hoạt động đúng theo thiết kế

### ✅ **Status Transition Validation - Đã được implement!**
**Warranty claims không thể chuyển sang trạng thái invalid!**

Đã tạo:
- ✅ `WarrantyClaimStatusValidator` class
- ✅ Business rules validation cho tất cả status transitions
- ✅ IllegalStateException cho invalid transitions
