# Authentication API Guide

## Overview
Authentication API cho hệ thống OEM EV Warranty Management sử dụng JWT tokens.

## Base URL
```
http://localhost:8080/api/auth
```

## Endpoints

### 1. Login - Đăng nhập
**POST** `/api/auth/login`

**Description:** Đăng nhập và nhận JWT tokens

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTY5NjgzODQwMCwiZXhwIjoxNjk2ODQyMDAwfQ...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTY5NjgzODQwMCwiZXhwIjoxNjk3NDQzMjAwfQ...",
  "message": "Login successful",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
}
```

**Response Error (401):**
```json
{
  "accessToken": null,
  "refreshToken": null,
  "message": "Invalid credentials",
  "userId": null,
  "username": null,
  "roleName": null
}
```

**Postman Setup:**
```
Method: POST
URL: http://localhost:8080/api/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "username": "admin",
  "password": "password123"
}
```

### 2. Register - Đăng ký Customer (Chỉ dành cho SC Staff)
**POST** `/api/auth/register`

**Description:** Đăng ký customer mới (chỉ SC Staff mới có quyền)

**Request:**
```json
{
  "username": "newcustomer",
  "email": "customer@example.com",
  "password": "password123",
  "address": "123 Main St, Ho Chi Minh City"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Customer account created successfully",
  "user": {
    "userId": 5,
    "username": "newcustomer",
    "roleName": "CUSTOMER"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### 3. Admin Create User - Tạo user bởi Admin
**POST** `/api/auth/admin/create-user`

**Description:** Admin tạo user với bất kỳ role nào

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Request:**
```json
{
  "username": "new_staff",
  "email": "staff@example.com",
  "password": "password123",
  "address": "456 Staff St, Ho Chi Minh City",
  "roleId": 2
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User created successfully by Admin",
  "user": {
    "userId": 6,
    "username": "new_staff",
    "roleName": "EVM_STAFF"
  }
}
```

### 4. Staff Register Customer - Đăng ký Customer đầy đủ bởi Staff
**POST** `/api/auth/staff/register-customer`

**Description:** ADMIN, SC_STAFF hoặc EVM_STAFF đăng ký customer mới với đầy đủ thông tin User + Customer trong 1 request

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Headers:**
```
Authorization: Bearer {staff_access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "username": "nguyenvana",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "address": "123 Nguyen Hue, Quan 1, TP.HCM",
  "name": "Nguyễn Văn A",
  "phone": "+84901234567"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Customer account and profile created successfully",
  "customer": {
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "+84901234567",
    "address": "123 Nguyen Hue, Quan 1, TP.HCM",
    "createdAt": "2024-10-21T10:30:00.000+00:00",
    "userId": 10,
    "username": "nguyenvana"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Username already exists: nguyenvana"
}
```

**Postman Setup:**
```
Method: POST
URL: http://localhost:8080/api/auth/staff/register-customer
Headers:
  Authorization: Bearer {{accessToken}}
  Content-Type: application/json
Body (raw JSON):
{
  "username": "nguyenvana",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "address": "123 Nguyen Hue, Quan 1, TP.HCM",
  "name": "Nguyễn Văn A",
  "phone": "+84901234567"
}
```

**Validation Rules:**
- **Username:** 3-50 ký tự, chỉ chữ cái, số và underscore
- **Email:** Format email hợp lệ, unique trong hệ thống
- **Password:** Tối thiểu 6 ký tự
- **Address:** 10-255 ký tự
- **Name:** 5-100 ký tự, mỗi từ viết hoa chữ cái đầu, hỗ trợ tiếng Việt
- **Phone:** Format Việt Nam (+84xxxxxxxxx hoặc 0xxxxxxxxx), unique trong hệ thống

**Note:** Endpoint này tạo đồng thời cả User account (với role CUSTOMER) và Customer profile, khác với `/api/auth/register` chỉ tạo User account.

### 5. Refresh Token
**POST** `/api/auth/refresh`

**Description:** Làm mới access token bằng refresh token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response Success (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Token refreshed successfully",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
}
```

### 5. Logout
**POST** `/api/auth/logout`

**Description:** Đăng xuất và vô hiệu hóa refresh token

**Request:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 6. Forgot Password
**POST** `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email not found"
}
```

### 7. Reset Password
**POST** `/api/auth/reset-password`

**Request:**
```json
{
  "resetToken": "uuid-reset-token",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

### 8. Validate Token
**GET** `/api/auth/validate`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
Không cần body.

**Response Success (200):**
```json
{
  "accessToken": null,
  "refreshToken": null,
  "message": "Token is valid",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
}
```

**Response Error (401):**
```json
{
  "accessToken": null,
  "refreshToken": null,
  "message": "Invalid Authorization header format",
  "userId": null,
  "username": null,
  "roleName": null
}
```

**Postman Setup:**
```
Method: GET
URL: http://localhost:8080/api/auth/validate
Headers:
  Authorization: Bearer <access_token>
```

> Lưu ý: Chỉ cần gửi header Authorization, không cần gửi body hay params.

## Postman Collection Setup

### 1. Tạo Environment Variables
Tạo environment trong Postman và thêm các variables:

**Environment Name:** `OEM EV Warranty API`

**Variables:**
```
baseUrl: http://localhost:8080
accessToken: {{accessToken}}
refreshToken: {{refreshToken}}
```

### 2. Pre-request Script cho Login
Thêm vào tab **Pre-request Script** của request Login:

```javascript
// Clear previous tokens
pm.environment.unset("accessToken");
pm.environment.unset("refreshToken");
```

### 3. Tests Script cho Login
Thêm vào tab **Tests** của request Login:

```javascript
// Parse response
var jsonData = pm.response.json();

// Set tokens to environment
if (jsonData.accessToken) {
    pm.environment.set("accessToken", jsonData.accessToken);
    console.log("Access Token saved:", jsonData.accessToken);
}

if (jsonData.refreshToken) {
    pm.environment.set("refreshToken", jsonData.refreshToken);
    console.log("Refresh Token saved:", jsonData.refreshToken);
}

// Test response
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    pm.expect(jsonData).to.have.property("accessToken");
    pm.expect(jsonData).to.have.property("refreshToken");
    pm.expect(jsonData).to.have.property("username");
    pm.expect(jsonData).to.have.property("roleName");
});
```

### 4. Sử dụng Token cho Các API Khác

**Cách 1: Manual Header**
```
Headers:
  Authorization: Bearer {{accessToken}}
  Content-Type: application/json
```

**Cách 2: Authorization Tab**
1. Chọn tab **Authorization**
2. Type: **Bearer Token**
3. Token: `{{accessToken}}`

### 5. Auto-refresh Token khi Expired

**Pre-request Script cho tất cả protected endpoints:**

```javascript
// Check if access token exists
const accessToken = pm.environment.get("accessToken");
const refreshToken = pm.environment.get("refreshToken");

if (!accessToken && refreshToken) {
    // Auto refresh token
    const refreshRequest = {
        url: pm.environment.get("baseUrl") + "/api/auth/refresh",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                "refreshToken": refreshToken
            })
        }
    };
    
    pm.sendRequest(refreshRequest, function (err, response) {
        if (err) {
            console.log("Refresh token failed:", err);
        } else {
            const jsonData = response.json();
            if (jsonData.accessToken) {
                pm.environment.set("accessToken", jsonData.accessToken);
                pm.environment.set("refreshToken", jsonData.refreshToken);
                console.log("Token refreshed successfully");
            }
        }
    });
}
```

## Sample Postman Collection

### Collection Structure:
```
📁 OEM EV Warranty API
├── 📁 Auth
│   ├── 🔑 Login (Admin)
│   ├── 🔑 Login (EVM Staff) 
│   ├── 🔑 Login (SC Staff)
│   ├── 🔑 Login (SC Technician)
│   ├── 🔑 Login (Customer)
│   ├── 📝 Register Customer (by SC Staff)
│   ├── 👨‍💼 Admin Create User
│   ├── 🔄 Refresh Token
│   ├── ✅ Validate Token
│   ├── 🔒 Forgot Password
│   ├── 🔑 Reset Password
│   └── 🚪 Logout
├── 📁 Vehicles
│   ├── 📋 Get All Vehicles
│   ├── 👁️ Get Vehicle by ID
│   ├── ➕ Create Vehicle
│   ├── ✏️ Update Vehicle
│   └── ❌ Delete Vehicle
├── 📁 Customers
│   ├── 📋 Get All Customers
│   ├── 👁️ Get Customer by ID
│   ├── 👤 Get My Profile
│   ├── ➕ Create Customer
│   └── ✏️ Update Customer
├── 📁 Parts
├── 📁 Warranty Claims
└── 📁 Service Histories
```

## Default Test Accounts

### Admin Account
```json
{
  "username": "admin",
  "password": "password123"
}
```
**Role:** ADMIN  
**Permissions:** Full access to all endpoints

### EVM Staff Account  
```json
{
  "username": "evm_staff",
  "password": "password123"
}
```
**Role:** EVM_STAFF  
**Permissions:** Vehicles, Parts (CRUD), Customers (Read)

### SC Staff Account
```json
{
  "username": "sc_staff", 
  "password": "password123"
}
```
**Role:** SC_STAFF  
**Permissions:** All except user management

### SC Technician Account
```json
{
  "username": "sc_tech",
  "password": "password123"
}
```
**Role:** SC_TECHNICIAN  
**Permissions:** Warranty Claims, Service Histories, Vehicles (Read)

### Customer Account
```json
{
  "username": "customer",
  "password": "password123"
}
```
**Role:** CUSTOMER  
**Permissions:** Own data only

## Common Error Responses

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
  "path": "/api/admin/users"
}
```

### 422 Token Expired
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "JWT token has expired",
  "path": "/api/vehicles"
}
```

## Tips & Best Practices

### 1. Token Management
- Always save `accessToken` và `refreshToken` từ login response
- Sử dụng environment variables trong Postman
- Implement auto-refresh mechanism

### 2. Testing Different Roles
- Tạo separate requests cho mỗi role
- Use descriptive names: "Login (Admin)", "Login (Customer)"
- Test permissions thoroughly

### 3. Error Handling
- Always check response status codes
- Handle 401/403 errors gracefully
- Implement retry logic for expired tokens

### 4. Security
- Không hardcode tokens trong requests
- Use environment variables
- Clear tokens khi logout

### 5. Debugging
- Check console logs for token values
- Verify token format (should start with "eyJ")
- Use jwt.io để decode và kiểm tra token content

### 6. Role-based Access
- **Register endpoint**: Chỉ SC Staff mới có thể tạo customer account
- **Admin Create User**: Chỉ Admin mới có thể tạo account với bất kỳ role nào
- **Customer tự đăng ký**: Hiện tại không có endpoint, phải thông qua SC Staff
