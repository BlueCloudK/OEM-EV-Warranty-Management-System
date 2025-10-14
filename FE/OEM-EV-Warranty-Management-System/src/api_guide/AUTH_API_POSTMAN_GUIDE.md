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
  "error": "Invalid credentials"
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

### 2. Register - Đăng ký
**POST** `/api/auth/register`

**Description:** Đăng ký user mới

**Request:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "address": "123 Main St, Ho Chi Minh City",
  "roleId": 3
}
```

**Response Success (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "User registered successfully",
  "userId": 2,
  "username": "newuser",
  "roleName": "CUSTOMER"
}
```

### 3. Refresh Token
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

### 4. Logout
**POST** `/api/auth/logout`

**Description:** Đăng xuất và vô hiệu hóa refresh token

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response Success (200):**
```json
{
  "message": "Logout successful"
}
```

### 5. Forgot Password
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
  "message": "Reset token generated successfully"
}
```

### 6. Reset Password
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
  "message": "Password reset successfully"
}
```

### 7. Validate Token
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
  "message": "Token is valid",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
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
│   ├── 📝 Register Customer
│   ├── 🔄 Refresh Token
│   ├── ✅ Validate Token
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
