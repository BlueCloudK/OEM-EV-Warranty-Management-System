# Parts API Guide

## Overview
Parts API cho hệ thống OEM EV Warranty Management với JWT authentication và role-based authorization.

## Base URL
```
http://localhost:8080/api/parts
```

## Authentication
**Tất cả endpoints đều yêu cầu JWT token**

**Header:**
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### 1. Get All Parts
**GET** `/api/parts`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)
- `search` (optional): Tìm kiếm theo tên hoặc part number

**Response Success (200):**
```json
{
  "content": [
    {
      "partId": "PART-BAT-001",
      "partName": "Tesla Model 3 Battery Pack",
      "partNumber": "1234567890",
      "partDescription": "Lithium-ion battery pack for Tesla Model 3",
      "partCategory": "BATTERY",
      "partPrice": 15000.00,
      "partQuantity": 25,
      "partSupplier": "Tesla Inc.",
      "partWarrantyPeriod": 96,
      "isActive": true,
      "createdDate": "2024-01-15",
      "lastUpdated": "2024-10-01"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 150,
  "totalPages": 15,
  "first": true,
  "last": false
}
```

### 2. Get Part by ID
**GET** `/api/parts/{id}`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Path Parameters:**
- `id`: Part ID

**Response Success (200):**
```json
{
  "partId": "PART-BAT-001",
  "partName": "Tesla Model 3 Battery Pack",
  "partNumber": "1234567890",
  "partDescription": "Lithium-ion battery pack for Tesla Model 3",
  "partCategory": "BATTERY",
  "partPrice": 15000.00,
  "partQuantity": 25,
  "partSupplier": "Tesla Inc.",
  "partWarrantyPeriod": 96,
  "isActive": true,
  "createdDate": "2024-01-15",
  "lastUpdated": "2024-10-01",
  "usageHistory": [
    {
      "serviceHistoryId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "serviceDate": "2024-09-15",
      "serviceType": "REPLACEMENT"
    }
  ]
}
```

### 3. Create Part
**POST** `/api/parts`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Request Body:**
```json
{
  "partName": "Tesla Model Y Motor",
  "partNumber": "9876543210",
  "partDescription": "Electric motor for Tesla Model Y",
  "partCategory": "MOTOR",
  "partPrice": 8000.00,
  "partQuantity": 15,
  "partSupplier": "Tesla Inc.",
  "partWarrantyPeriod": 60,
  "isActive": true
}
```

**Response Success (201):**
```json
{
  "partId": "PART-MOT-002",
  "partName": "Tesla Model Y Motor",
  "partNumber": "9876543210",
  "partDescription": "Electric motor for Tesla Model Y",
  "partCategory": "MOTOR",
  "partPrice": 8000.00,
  "partQuantity": 15,
  "partSupplier": "Tesla Inc.",
  "partWarrantyPeriod": 60,
  "isActive": true,
  "createdDate": "2024-10-09",
  "lastUpdated": "2024-10-09"
}
```

### 4. Update Part
**PUT** `/api/parts/{id}`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Path Parameters:**
- `id`: Part ID

**Request Body:**
```json
{
  "partName": "Tesla Model 3 Battery Pack Updated",
  "partNumber": "1234567890",
  "partDescription": "Updated lithium-ion battery pack for Tesla Model 3",
  "partCategory": "BATTERY",
  "partPrice": 16000.00,
  "partQuantity": 30,
  "partSupplier": "Tesla Inc.",
  "partWarrantyPeriod": 96,
  "isActive": true
}
```

### 5. Delete Part
**DELETE** `/api/parts/{id}`

**Permissions:** ADMIN, EVM_STAFF only

**Path Parameters:**
- `id`: Part ID

**Response Success (204):** No content

### 6. Search Parts by Category
**GET** `/api/parts/category/{category}`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Path Parameters:**
- `category`: Part category (BATTERY, MOTOR, BRAKE, etc.)

**Response Success (200):**
```json
{
  "content": [
    {
      "partId": "PART-BAT-001",
      "partName": "Tesla Model 3 Battery Pack",
      "partNumber": "1234567890",
      "partCategory": "BATTERY",
      "partPrice": 15000.00,
      "partQuantity": 25,
      "isActive": true
    }
  ]
}
```

## Postman Collection Examples

### Get All Parts
```
Method: GET
URL: http://localhost:8080/api/parts?page=0&size=10&search=Tesla
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Create Part
```
Method: POST
URL: http://localhost:8080/api/parts
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "partName": "New Part",
  "partNumber": "NEW123",
  "partDescription": "New part description",
  "partCategory": "ENGINE",
  "partPrice": 5000.00,
  "partQuantity": 10,
  "partSupplier": "Supplier Name",
  "partWarrantyPeriod": 24,
  "isActive": true
}
```

## Error Responses

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions to access parts data"
}
```

### 404 Not Found
```json
{
  "error": "Part not found",
  "message": "Part with ID PART-001 does not exist"
}
```

## Note on Access Restrictions
- **SC_TECHNICIAN** và **CUSTOMER** không có quyền truy cập vào Parts API theo SecurityConfig
- Chỉ **ADMIN**, **EVM_STAFF**, và **SC_STAFF** mới có thể truy cập parts data
- **SC_STAFF** có read-only access trong thực tế, nhưng API level cho phép CRUD
