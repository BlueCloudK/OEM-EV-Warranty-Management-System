# Role-Based Access Control (RBAC) Guide

## Overview
Hệ thống OEM EV Warranty Management sử dụng JWT-based authentication với role-based authorization. Mỗi user được gán một role cụ thể với các quyền truy cập khác nhau.

## User Roles

### 1. ADMIN
- **Mô tả**: Quản trị viên hệ thống - có quyền cao nhất
- **Permissions**: Truy cập tất cả endpoints và thực hiện mọi thao tác
- **Đặc quyền**: Chỉ ADMIN mới có thể xóa (DELETE) tất cả resources

### 2. EVM_STAFF (Electric Vehicle Manufacturer Staff)
- **Mô tả**: Nhân viên nhà sản xuất xe điện
- **Permissions**: 
  - Quản lý vehicles (CRUD)
  - Quản lý parts (CRUD, except DELETE - chỉ ADMIN)
  - Xem và quản lý customers (READ, CREATE, UPDATE)
  - Xem warranty claims (READ only)
  - **Workflow**: Chấp nhận/từ chối warranty claims (EVM accept/reject)

### 3. SC_STAFF (Service Center Staff)
- **Mô tả**: Nhân viên trung tâm bảo hành
- **Permissions**:
  - Quản lý customers (CRUD)
  - Quản lý vehicles (CRUD)
  - Xem parts (READ only)
  - Quản lý warranty claims (CRUD)
  - Quản lý service histories (CRUD)
  - **Workflow**: Tạo warranty claims cho khách hàng

### 4. SC_TECHNICIAN (Service Center Technician)
- **Mô tả**: Kỹ thuật viên trung tâm bảo hành
- **Permissions**:
  - Xem thông tin vehicles (READ only)
  - Xem parts (READ only)
  - Quản lý warranty claims (READ, UPDATE)
  - Quản lý service histories (CRUD)
  - **Workflow**: Xử lý warranty claims (Tech start/complete)

### 5. CUSTOMER
- **Mô tả**: Khách hàng sử dụng dịch vụ
- **Permissions**:
  - Tự cập nhật profile via `/api/customers/profile`
  - Xem vehicles (READ only - với data filtering)
  - Xem parts (READ only)
  - Tạo và xem warranty claims (CREATE, READ own claims)
  - Xem service histories (READ own vehicle histories)

## API Endpoint Permissions

### Authentication APIs (`/api/auth/**`)
- **Public**: Không cần authentication
- Endpoints: `/login`, `/register`, `/refresh-token`

### Admin APIs (`/api/admin/**`)
- **ADMIN**: Full access
- Tất cả administrative functions

### Customer APIs (`/api/customers/**`)
- **ADMIN, SC_STAFF, EVM_STAFF**: Full CRUD access to all customers
- **CUSTOMER**: Chỉ có thể update profile qua `/profile` endpoint
- **Public (authenticated)**: `/search`, `/by-email`, `/by-phone`, `/by-user/{userId}`

### Vehicle APIs (`/api/vehicles/**`)
- **ADMIN, EVM_STAFF, SC_STAFF**: Full CRUD access
- **SC_TECHNICIAN, CUSTOMER**: READ access only
- Customers chỉ xem được vehicles của mình (business logic filtering)

### Parts APIs (`/api/parts/**`)
- **ADMIN**: Full CRUD access (including DELETE)
- **EVM_STAFF**: CRUD access (except DELETE)
- **SC_STAFF**: READ access only
- **SC_TECHNICIAN, CUSTOMER**: READ access only
- Special endpoint `/by-vehicle/{vehicleId}` accessible by all authenticated users

### Warranty Claims APIs (`/api/warranty-claims/**`)
- **ADMIN**: Full access to all endpoints
- **SC_STAFF**: CRUD access + workflow endpoint `/sc-create`
- **EVM_STAFF**: READ access + workflow endpoints `/evm-accept`, `/evm-reject`, `/evm-pending`
- **SC_TECHNICIAN**: READ/UPDATE access + workflow endpoints `/tech-start`, `/tech-complete`, `/tech-pending`
- **CUSTOMER**: CREATE và READ own claims only

### Service History APIs (`/api/service-histories/**`)
- **ADMIN, SC_STAFF, SC_TECHNICIAN**: Full CRUD access
- **CUSTOMER**: READ access to own vehicle service histories only
- EVM_STAFF không có access đến service histories

## Workflow-Specific Permissions

### Warranty Claim Workflow
1. **SC_STAFF**: Tạo claim (`/sc-create`) → Status: SUBMITTED
2. **EVM_STAFF**: Accept (`/evm-accept`) hoặc Reject (`/evm-reject`) → Status: SC_REVIEW hoặc REJECTED
3. **SC_TECHNICIAN**: Start (`/tech-start`) → Status: PROCESSING
4. **SC_TECHNICIAN**: Complete (`/tech-complete`) → Status: COMPLETED

### Query Permissions
- **EVM_STAFF**: `/evm-pending` - xem claims cần review
- **SC_TECHNICIAN**: `/tech-pending` - xem claims cần xử lý
- **All authenticated**: `/by-status/{status}` - xem theo status

## Security Implementation

### JWT Token
- Tất cả protected endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer {jwt_token}
```

### Role Validation
- Roles được validate tại Spring Security level
- Sử dụng `@PreAuthorize` annotations trong controllers:
  ```java
  @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
  ```
- Method-level security được enable qua `@EnableMethodSecurity`

### Data Filtering
- **Customer Data Isolation**: Customers chỉ truy cập được data của mình
- **Business Logic Filtering**: Implemented tại service layer
- **JWT Claims**: User info và role được embed trong JWT token

### Session Management
- Stateless session management với JWT
- Không sử dụng HTTP sessions
- Token expiration và refresh token mechanism

## Permission Matrix

| Resource | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|----------|-------|-----------|----------|---------------|----------|
| Users | CRUD | - | - | - | Update own profile |
| Customers | CRUD | CRU | CRUD | - | Update own profile |
| Vehicles | CRUD | CRUD | CRUD | R | R (own only) |
| Parts | CRUD | CRU | R | R | R |
| Warranty Claims | CRUD | R + Workflow | CRUD + Workflow | RU + Workflow | CR (own only) |
| Service Histories | CRUD | - | CRUD | CRUD | R (own only) |

**Legend:**
- C: Create, R: Read, U: Update, D: Delete
- Workflow: Specific workflow endpoints

## Error Responses

### 401 Unauthorized
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/customers"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Insufficient permissions for this operation",
  "path": "/api/parts"
}
```

## Best Practices

1. **Token Security**: Luôn truyền JWT token qua HTTPS
2. **Role Separation**: Mỗi role chỉ có quyền truy cập tối thiểu cần thiết (Principle of Least Privilege)
3. **Data Isolation**: Customers chỉ truy cập được data của mình
4. **Workflow Control**: Strict validation cho warranty claim workflow
5. **Audit Trail**: Log tất cả operations với user information
6. **Input Validation**: Validate permissions trước khi thực hiện business logic
7. **Error Handling**: Không expose sensitive information trong error messages

## Security Notes

### Role Hierarchy
- ADMIN > EVM_STAFF/SC_STAFF > SC_TECHNICIAN > CUSTOMER
- Higher roles không tự động inherit permissions của lower roles
- Mỗi role có specific permissions được define rõ ràng

### Special Cases
- **Public endpoints**: `/search`, `/by-email`, `/by-phone` trong Customer API
- **Self-service**: Customer có thể update own profile via `/profile`
- **Workflow restrictions**: Chỉ specific roles mới có thể thực hiện workflow actions
- **DELETE restrictions**: Chỉ ADMIN mới có thể DELETE hầu hết resources
