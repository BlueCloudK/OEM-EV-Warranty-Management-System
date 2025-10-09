# Role-Based Access Control (RBAC) Guide

## Overview
Hệ thống OEM EV Warranty Management sử dụng JWT-based authentication với role-based authorization. Mỗi user được gán một role cụ thể với các quyền truy cập khác nhau.

## User Roles

### 1. ADMIN
- **Mô tả**: Quản trị viên hệ thống - có quyền cao nhất
- **Permissions**: Truy cập tất cả endpoints và thực hiện mọi thao tác

### 2. EVM_STAFF (Electric Vehicle Manufacturer Staff)
- **Mô tả**: Nhân viên nhà sản xuất xe điện
- **Permissions**: 
  - Quản lý vehicles (CRUD)
  - Quản lý parts (CRUD)
  - Xem thông tin customers
  - Xem warranty claims và service histories

### 3. SC_STAFF (Service Center Staff)
- **Mô tả**: Nhân viên trung tâm bảo hành
- **Permissions**:
  - Quản lý customers (CRUD)
  - Quản lý vehicles (CRUD)
  - Quản lý parts (Read only)
  - Quản lý warranty claims (CRUD)
  - Quản lý service histories (CRUD)

### 4. SC_TECHNICIAN (Service Center Technician)
- **Mô tả**: Kỹ thuật viên trung tâm bảo hành
- **Permissions**:
  - Xem thông tin vehicles
  - Quản lý warranty claims (Read, Update)
  - Quản lý service histories (CRUD)

### 5. CUSTOMER
- **Mô tả**: Khách hàng sử dụng dịch vụ
- **Permissions**:
  - Xem thông tin profile của mình
  - Xem vehicles của mình
  - Tạo và xem warranty claims của mình
  - Xem service histories của vehicles mình sở hữu

## API Endpoint Permissions

### Authentication APIs (`/api/auth/**`)
- **Public**: Không cần authentication

### Admin APIs (`/api/admin/**`)
- **ADMIN**: Full access

### Customer APIs (`/api/customers/**`)
- **ADMIN, SC_STAFF, EVM_STAFF**: Full access to all customers
- **CUSTOMER**: Access to own profile only via `/api/customers/me/**`

### Vehicle APIs (`/api/vehicles/**`)
- **ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN**: Full access
- **CUSTOMER**: Read access to own vehicles only

### Parts APIs (`/api/parts/**`)
- **ADMIN, EVM_STAFF, SC_STAFF**: Full access
- **SC_TECHNICIAN, CUSTOMER**: No access

### Warranty Claims APIs (`/api/warranty-claims/**`)
- **ADMIN, SC_STAFF, SC_TECHNICIAN**: Full access
- **CUSTOMER**: Access to own claims only

### Service History APIs (`/api/service-histories/**`)
- **ADMIN, SC_STAFF, SC_TECHNICIAN**: Full access
- **CUSTOMER**: Read access to own vehicle service histories only

## Security Implementation

### JWT Token
- Tất cả protected endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer {jwt_token}
```

### Role Validation
- Roles được validate tại Spring Security level
- Sử dụng `@PreAuthorize` annotations trong controllers
- Method-level security được enable qua `@EnableMethodSecurity`

### Session Management
- Stateless session management với JWT
- Không sử dụng HTTP sessions

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide valid JWT token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions for this operation"
}
```

## Best Practices

1. **Token Security**: Luôn truyền JWT token qua HTTPS
2. **Role Separation**: Mỗi role chỉ có quyền truy cập cần thiết
3. **Data Isolation**: Customers chỉ truy cập được data của mình
4. **Audit Trail**: Log tất cả operations với user information
