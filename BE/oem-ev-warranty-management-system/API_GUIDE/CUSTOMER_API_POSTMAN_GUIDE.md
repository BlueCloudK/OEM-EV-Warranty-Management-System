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
      "customerName": "John Doe",
      "customerEmail": "john.doe@email.com",
      "customerPhone": "+84901234567",
      "customerAddress": "123 Main St, Ho Chi Minh City",
      "dateOfBirth": "1985-06-15",
      "createdDate": "2024-01-15",
      "userId": 5,
      "username": "john_doe",
      "totalVehicles": 2,
      "totalClaims": 3
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

**Permissions:** 
- ADMIN, SC_STAFF, EVM_STAFF: Any customer
- CUSTOMER: Own profile only

**Path Parameters:**
- `id`: Customer UUID

**Response Success (200):**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "customerEmail": "john.doe@email.com",
  "customerPhone": "+84901234567",
  "customerAddress": "123 Main St, Ho Chi Minh City",
  "dateOfBirth": "1985-06-15",
  "createdDate": "2024-01-15",
  "userId": 5,
  "username": "john_doe",
  "vehicles": [
    {
      "vehicleId": 1,
      "vehicleName": "Tesla Model 3",
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleYear": 2023
    }
  ],
  "recentClaims": [
    {
      "claimId": 1,
      "claimNumber": "WC-2024-001",
      "claimStatus": "PENDING",
      "claimDate": "2024-10-09"
    }
  ]
}
```

### 3. Create Customer
**POST** `/api/customers`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Request Body:**
```json
{
  "customerName": "Jane Smith",
  "customerEmail": "jane.smith@email.com",
  "customerPhone": "+84901234568",
  "customerAddress": "456 Oak Street, Hanoi",
  "dateOfBirth": "1990-03-20",
  "userId": 6
}
```

**Response Success (201):**
```json
{
  "customerId": "456e7890-e89b-12d3-a456-426614174001",
  "customerName": "Jane Smith",
  "customerEmail": "jane.smith@email.com",
  "customerPhone": "+84901234568",
  "customerAddress": "456 Oak Street, Hanoi",
  "dateOfBirth": "1990-03-20",
  "createdDate": "2024-10-09",
  "userId": 6,
  "username": "jane_smith",
  "totalVehicles": 0,
  "totalClaims": 0
}
```

### 4. Update Customer
**PUT** `/api/customers/{id}`

**Permissions:** 
- ADMIN, SC_STAFF, EVM_STAFF: Any customer (all fields)
- CUSTOMER: Own profile only (limited fields)

**Path Parameters:**
- `id`: Customer UUID

**Request Body (ADMIN/SC_STAFF/EVM_STAFF):**
```json
{
  "customerName": "John Doe Updated",
  "customerEmail": "john.doe.new@email.com",
  "customerPhone": "+84901234569",
  "customerAddress": "789 New Street, Ho Chi Minh City",
  "dateOfBirth": "1985-06-15"
}
```

**Request Body (CUSTOMER - own profile only):**
```json
{
  "customerName": "John Doe Updated",
  "customerPhone": "+84901234569",
  "customerAddress": "789 New Street, Ho Chi Minh City"
}
```

**Response Success (200):** Same as Get Customer

### 5. Delete Customer
**DELETE** `/api/customers/{id}`

**Permissions:** ADMIN, SC_STAFF only

**Path Parameters:**
- `id`: Customer UUID

**Response Success (204):** No Content

### 6. Get My Profile (Customer endpoint)
**GET** `/api/customers/me`

**Permissions:** CUSTOMER, SC_STAFF, SC_TECHNICIAN, ADMIN

**Response Success (200):**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "customerEmail": "john.doe@email.com",
  "customerPhone": "+84901234567",
  "customerAddress": "123 Main St, Ho Chi Minh City",
  "dateOfBirth": "1985-06-15",
  "createdDate": "2024-01-15",
  "userId": 5,
  "username": "john_doe",
  "vehicles": [
    {
      "vehicleId": 1,
      "vehicleName": "Tesla Model 3",
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleYear": 2023
    }
  ],
  "recentClaims": [
    {
      "claimId": 1,
      "claimNumber": "WC-2024-001",
      "claimStatus": "PENDING",
      "claimDate": "2024-10-09"
    }
  ]
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

### Create Customer
```
Method: POST
URL: http://localhost:8080/api/customers
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "customerName": "New Customer",
  "customerEmail": "new@email.com",
  "customerPhone": "+84901234567",
  "customerAddress": "123 Street, City",
  "dateOfBirth": "1990-01-01",
  "userId": 10
}
```

## Error Responses

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions to access customer data"
}
```

### 404 Not Found
```json
{
  "error": "Customer not found",
  "message": "Customer with ID 123 does not exist"
}
```
