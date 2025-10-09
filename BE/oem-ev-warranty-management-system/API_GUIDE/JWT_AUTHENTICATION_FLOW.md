# JWT Authentication & Authorization Flow Guide

## 📋 Tổng quan hệ thống

Hệ thống OEM EV Warranty Management sử dụng JWT (JSON Web Token) để xác thực và phân quyền người dùng.

## 🔐 Các Role trong hệ thống

1. **ADMIN** - Quản trị viên hệ thống
   - Có thể CRUD tất cả resources
   - Truy cập tất cả endpoints
   - Quản lý users và roles

2. **EVM_STAFF** - Nhân viên nhà sản xuất xe điện
   - CRUD vehicles, parts
   - Xem customers
   - Không thể quản lý warranty claims và service histories

3. **SC_STAFF** - Nhân viên trung tâm bảo hành
   - CRUD customers, vehicles, warranty claims, service histories
   - Xem parts (read-only trong thực tế)
   - Quản lý toàn bộ quy trình bảo hành

4. **SC_TECHNICIAN** - Kỹ thuật viên trung tâm bảo hành
   - Xem vehicles
   - CRUD warranty claims và service histories
   - Không thể quản lý customers và parts

5. **CUSTOMER** - Khách hàng
   - Chỉ xem vehicles của mình
   - Tạo và xem warranty claims của mình
   - Xem service histories của vehicles mình sở hữu
   - Không thể xem dữ liệu của khách hàng khác

## 🚀 Flow Authentication (Đăng nhập)

### 1. User Login
```
POST /api/auth/login
Body: {
  "username": "admin",
  "password": "password123"
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
Controller method được gọi
```

### 3. Method-level Security
```java
@PostMapping("/vehicles")
@PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
public ResponseEntity<VehicleResponseDTO> createVehicle(@RequestBody VehicleRequestDTO request) {
    // Code chỉ chạy nếu user có role ADMIN, EVM_STAFF hoặc SC_STAFF
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
    } else if (SecurityUtil.hasRole("SC_STAFF")) {
        // Logic cho SC Staff
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

## 📱 API Endpoints Security Matrix

| Endpoint | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|----------|-------|-----------|----------|---------------|----------|
| `GET /api/vehicles` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /api/vehicles` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/vehicles/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ (own only) |
| `GET /api/vehicles/my-vehicles` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `GET /api/parts` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST /api/parts` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/customers` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /api/customers/me` | ✅ | ❌ | ✅ | ✅ | ✅ |
| `POST /api/warranty-claims` | ✅ | ❌ | ✅ | ✅ | ✅ (own only) |
| `GET /api/warranty-claims` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `POST /api/service-histories` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /api/service-histories` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `GET /api/admin/**` | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🚨 Error Handling Flow

### 1. No Token
```
Request without Authorization header → 401 Unauthorized
```

### 2. Invalid Token
```
Invalid/Expired JWT → JwtAuthenticationFilter → 401 Unauthorized
```

### 3. Insufficient Permissions
```
@PreAuthorize fails → 403 Forbidden
```

### 4. Database Connection Error
```
Cannot connect to MySQL → Application startup fails
Fix: Check MySQL service, credentials, database exists
```

## 🧪 Testing Flow

### 1. Test Authentication
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful",
  "userId": 1,
  "username": "admin", 
  "roleName": "ADMIN"
}
```

### 2. Test Authorization
```bash
# Use token in subsequent requests
curl -X GET http://localhost:8080/api/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."

# Response
{
  "username": "admin",
  "roles": ["ROLE_ADMIN"],
  "isAuthenticated": true
}
```

### 3. Test Protected Endpoint
```bash
# Create vehicle (ADMIN/EVM_STAFF/SC_STAFF only)
curl -X POST http://localhost:8080/api/vehicles \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"vehicleName":"Tesla Model 3","customerId":"123"}'
```

## 🔧 Configuration Files

### 1. application.properties
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/warranty_db
spring.datasource.username=root
spring.datasource.password=1234

# JWT
jwt.secret-key=mySecretKeyForJWTTokenGeneration123456789SecureKey
```

### 2. SecurityConfig.java
- Cấu hình Spring Security
- JWT Filter chain
- Endpoint permissions theo 5 roles
- Password encoder

### 3. JwtService.java
- Generate tokens
- Validate tokens
- Extract claims

## 📝 Key Classes & Their Roles

### Security Layer
- `SecurityConfig.java` - Spring Security configuration với 5 roles
- `JwtAuthenticationFilter.java` - Intercept requests, validate JWT
- `CustomUserDetailsService.java` - Load user from database
- `SecurityUtil.java` - Utility to get current user info

### Service Layer
- `AuthService.java` - Authentication business logic
- `JwtService.java` - JWT token operations
- `UserService.java` - User management

### Controller Layer
- `AuthController.java` - Login/logout endpoints
- `UserInfoController.java` - Current user info endpoints
- `VehicleController.java` - Vehicle CRUD với @PreAuthorize cho 5 roles
- `WarrantyClaimController.java` - Warranty claims với role-based access
- `ServiceHistoryController.java` - Service histories với role-based access

### Data Layer
- `User.java` - User entity
- `Role.java` - Role entity với 5 roles
- `Token.java` - Refresh token entity
- `UserRepository.java` - User database operations

## 🎯 Summary

1. **Login** → Get JWT tokens
2. **Include token** in Authorization header for protected endpoints
3. **JWT Filter** validates token và sets user context
4. **@PreAuthorize** checks permissions theo 5 roles
5. **SecurityUtil** provides current user info in controllers
6. **Refresh** tokens when access token expires

Hệ thống đảm bảo:
- ✅ Stateless authentication với JWT
- ✅ Role-based authorization với 5 distinct roles
- ✅ Secure password storage với BCrypt
- ✅ Token refresh mechanism
- ✅ Comprehensive logging và audit trail
- ✅ Fine-grained permissions cho từng role
