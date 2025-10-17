# Customer API Guide

## Overview
Customer API cho hệ thống OEM EV Warranty Management với JWT authentication và role-based authorization.

## Base URL
```
http://localhost:8080/api/customers
```

## Authentication
**Tất cả endpoints đều yêu cầu JWT token**

**Header:**
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### 1. Get All Customers
**GET** `/api/customers`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)
- `search` (optional): Tìm kiếm theo tên, email, hoặc phone

**Response Success (200):**
```json
{
  "content": [
    {
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+84901234567",
      "address": "123 Main St, Ho Chi Minh City",
      "createdAt": "2024-01-15T10:30:00.000+00:00",
      "userId": 5,
      "username": "john_doe"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 50,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

### 2. Get Customer by ID
**GET** `/api/customers/{id}`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Path Parameters:**
- `id`: Customer UUID

**Response Success (200):**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+84901234567",
  "address": "123 Main St, Ho Chi Minh City",
  "createdAt": "2024-01-15T10:30:00.000+00:00",
  "userId": 5,
  "username": "john_doe"
}
```
T
### 3. Create Customer
**POST** `/api/customers`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@email.com",
  "phone": "+84901234568",
  "address": "456 Oak Street, Hanoi",
  "userId": 6
}
```

**Response Success (201):**
```json
{
  "customerId": "456e7890-e89b-12d3-a456-426614174001",
  "name": "Jane Smith",
  "email": "jane.smith@email.com",
  "phone": "+84901234568",
  "address": "456 Oak Street, Hanoi",
  "createdAt": "2024-10-13T10:30:00.000+00:00",
  "userId": 6,
  "username": "jane_smith"
}
```ua 

### 4. Update Customer
**PUT** `/api/customers/{id}`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Path Parameters:**
- `id`: Customer UUID

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.doe.new@email.com",
  "phone": "+84901234569",
  "address": "789 New Street, Ho Chi Minh City",
  "userId": 5
}
```

**Response Success (200):** Same as Get Customer

### 5. Delete Customer
**DELETE** `/api/customers/{id}`

**Permissions:** ADMIN only

**Path Parameters:**
- `id`: Customer UUID

**Response Success (204):** No Content

### 6. Search Customers by Name
**GET** `/api/customers/search`

**Permissions:** Tất cả authenticated users (Public)

**Query Parameters:**
- `name` (required): Tên customer cần tìm
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):**
```json
{
  "content": [
    {
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+84901234567",
      "address": "123 Main St, Ho Chi Minh City",
      "createdAt": "2024-01-15T10:30:00.000+00:00",
      "userId": 5,
      "username": "john_doe"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### 7. Get Customer by Email
**GET** `/api/customers/by-email`

**Permissions:** Tất cả authenticated users (Public)

**Query Parameters:**
- `email` (required): Email customer cần tìm

**Response Success (200):**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+84901234567",
  "address": "123 Main St, Ho Chi Minh City",
  "createdAt": "2024-01-15T10:30:00.000+00:00",
  "userId": 5,
  "username": "john_doe"
}
```

### 8. Get Customer by Phone
**GET** `/api/customers/by-phone`

**Permissions:** Tất cả authenticated users (Public)

**Query Parameters:**
- `phone` (required): Số điện thoại customer cần tìm

**Response Success (200):**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+84901234567",
  "address": "123 Main St, Ho Chi Minh City",
  "createdAt": "2024-01-15T10:30:00.000+00:00",
  "userId": 5,
  "username": "john_doe"
}
```

### 9. Get Customers by User ID
**GET** `/api/customers/by-user/{userId}`

**Permissions:** Tất cả authenticated users (Public)

**Path Parameters:**
- `userId`: User ID

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):**
```json
{
  "content": [
    {
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+84901234567",
      "address": "123 Main St, Ho Chi Minh City",
      "createdAt": "2024-01-15T10:30:00.000+00:00",
      "userId": 5,
      "username": "john_doe"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### 10. Update Customer Profile (Self-service)
**PUT** `/api/customers/profile`

**Permissions:** Tất cả authenticated users (Customer tự cập nhật profile)

**Description:** Customer tự cập nhật thông tin cá nhân của mình

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.doe.new@email.com",
  "phone": "+84901234569",
  "address": "789 New Street, Ho Chi Minh City",
  "userId": 5
}
```

**Response Success (200):**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe Updated",
  "email": "john.doe.new@email.com",
  "phone": "+84901234569",
  "address": "789 New Street, Ho Chi Minh City",
  "createdAt": "2024-01-15T10:30:00.000+00:00",
  "userId": 5,
  "username": "john_doe"
}
```

**Response Error (400):**
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed or unauthorized access",
  "path": "/api/customers/profile"
}
```

## Postman Collection Examples

### Get All Customers
```
Method: GET
URL: http://localhost:8080/api/customers?page=0&size=10&search=John
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Customer by ID
```
Method: GET
URL: http://localhost:8080/api/customers/123e4567-e89b-12d3-a456-426614174000
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Create Customer
```
Method: POST
URL: http://localhost:8080/api/customers
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "name": "New Customer",
  "email": "new@email.com",
  "phone": "+84901234567",
  "address": "123 Street, City",
  "userId": 10
}
```

### Update Customer
```
Method: PUT
URL: http://localhost:8080/api/customers/123e4567-e89b-12d3-a456-426614174000
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phone": "+84901234569",
  "address": "Updated Address",
  "userId": 5
}
```

### Delete Customer
```
Method: DELETE
URL: http://localhost:8080/api/customers/123e4567-e89b-12d3-a456-426614174000
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Search Customers by Name
```
Method: GET
URL: http://localhost:8080/api/customers/search?name=John&page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Customer by Email
```
Method: GET
URL: http://localhost:8080/api/customers/by-email?email=john.doe@email.com
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Customer by Phone
```
Method: GET
URL: http://localhost:8080/api/customers/by-phone?phone=+84901234567
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Customers by User ID
```
Method: GET
URL: http://localhost:8080/api/customers/by-user/5?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Update Customer Profile (Self-service)
```
Method: PUT
URL: http://localhost:8080/api/customers/profile
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phone": "+84901234569",
  "address": "Updated Address",
  "userId": 5
}
```

## Validation Rules

### Name Field
- **Required:** Yes
- **Length:** 5-100 characters
- **Pattern:** Each word must start with capital letter, supports Vietnamese characters
- **Example:** "Nguyễn Văn An", "John Doe"

### Email Field
- **Required:** Yes
- **Pattern:** Valid email format
- **Example:** "user@example.com"

### Phone Field  
- **Required:** Yes
- **Pattern:** Vietnamese format (+84xxxxxxxxx or 0xxxxxxxxx)
- **Example:** "+84901234567", "0901234567"

### Address Field
- **Required:** Yes
- **Length:** Maximum 255 characters

### User ID Field
- **Required:** Yes
- **Type:** Positive number
- **Description:** Must be existing User ID

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Name must be between 5 and 100 characters",
  "path": "/api/customers"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Insufficient permissions",
  "path": "/api/customers"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Customer with ID 123e4567-e89b-12d3-a456-426614174000 does not exist",
  "path": "/api/customers/123e4567-e89b-12d3-a456-426614174000"
}
```

### 409 Conflict (Duplicate Data)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 409,
  "error": "Conflict",
  "message": "Email already exists: user@example.com",
  "path": "/api/customers"
}
```
