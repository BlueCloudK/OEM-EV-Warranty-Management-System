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

### Environment Variables
```
jwt_token: (sẽ được set sau khi login)
refresh_token: (sẽ được set sau khi login)
base_url: http://localhost:8080
```

### Pre-request Script cho Auto Login
```javascript
// Tự động login nếu chưa có token
if (!pm.environment.get("jwt_token")) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/auth/login",
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: {
            mode: "raw",
            raw: JSON.stringify({
                "username": "admin",
                "password": "password123"
            })
        }
    }, function(err, response) {
        if (!err && response.code === 200) {
            const responseJson = response.json();
            pm.environment.set("jwt_token", responseJson.accessToken);
            pm.environment.set("refresh_token", responseJson.refreshToken);
        }
    });
}
```

### Test Script để lưu token
```javascript
// Lưu tokens sau khi login thành công
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    if (responseJson.accessToken) {
        pm.environment.set("jwt_token", responseJson.accessToken);
        pm.environment.set("refresh_token", responseJson.refreshToken);
        pm.test("Token saved successfully", function () {
            pm.expect(responseJson.accessToken).to.not.be.undefined;
        });
    }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "Username is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Default Users

### Admin User
```
Username: admin
Password: admin123
Role: ADMIN
```

### Staff User
```
Username: staff
Password: staff123
Role: STAFF
```

### Customer User
```
Username: customer
Password: customer123
Role: CUSTOMER
```

## Role Permissions

| Role | Description |
|------|-------------|
| ADMIN | Full access to all resources |
| STAFF | Access to vehicles, parts, service histories, warranty claims |
| CUSTOMER | Access to own vehicles and warranty claims only |

## Usage Flow

1. **Login** để lấy JWT tokens
2. **Lưu access token** vào environment variable
3. **Sử dụng token** trong Authorization header cho các API khác
4. **Refresh token** khi access token hết hạn (15 phút)
5. **Logout** khi cần đăng xuất

## Security Notes

- Access token có thời hạn 15 phút
- Refresh token có thời hạn 7 ngày
- Tokens được lưu trong database và có thể bị vô hiệu hóa
- Password được mã hóa bằng BCrypt
- Tất cả endpoints authentication đều stateless
