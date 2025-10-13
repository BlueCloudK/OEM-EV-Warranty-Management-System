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

**Permissions:** All authenticated users (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER)

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

**Permissions:** ADMIN, EVM_STAFF only

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

**Permissions:** ADMIN, EVM_STAFF only

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

**Response Success (200):** Same as Get Part by ID

### 5. Delete Part
**DELETE** `/api/parts/{id}`

**Permissions:** ADMIN only

**Path Parameters:**
- `id`: Part ID

**Response Success (204):** No Content

### 6. Get Parts by Vehicle ID
**GET** `/api/parts/by-vehicle/{vehicleId}`

**Permissions:** All authenticated users (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER)

**Path Parameters:**
- `vehicleId`: Vehicle ID

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

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
  "totalElements": 5,
  "totalPages": 1,
  "first": true,
  "last": true
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

### Get Part by ID
```
Method: GET
URL: http://localhost:8080/api/parts/PART-BAT-001
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

### Update Part
```
Method: PUT
URL: http://localhost:8080/api/parts/PART-BAT-001
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "partName": "Updated Part Name",
  "partNumber": "1234567890",
  "partDescription": "Updated description",
  "partCategory": "BATTERY",
  "partPrice": 16000.00,
  "partQuantity": 30,
  "partSupplier": "Tesla Inc.",
  "partWarrantyPeriod": 96,
  "isActive": true
}
```

### Delete Part
```
Method: DELETE
URL: http://localhost:8080/api/parts/PART-BAT-001
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Parts by Vehicle ID
```
Method: GET
URL: http://localhost:8080/api/parts/by-vehicle/1?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Part name must be between 5 and 100 characters",
  "path": "/api/parts"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Only ADMIN and EVM_STAFF can create parts",
  "path": "/api/parts"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Part with ID PART-001 does not exist",
  "path": "/api/parts/PART-001"
}
```

## Validation Rules

### Part Name Field
- **Required:** Yes
- **Length:** 5-100 characters
- **Description:** Tên part phải rõ ràng và mô tả

### Part Number Field
- **Required:** Yes
- **Length:** 5-50 characters
- **Pattern:** Alphanumeric và dấu gạch ngang
- **Unique:** Part number phải unique trong hệ thống

### Part Price Field
- **Required:** Yes
- **Type:** Positive number
- **Minimum:** 0.01
- **Description:** Giá part tính bằng USD

### Part Quantity Field
- **Required:** Yes
- **Type:** Non-negative integer
- **Minimum:** 0
- **Description:** Số lượng part trong kho

### Warranty Period Field
- **Required:** Yes
- **Type:** Positive integer
- **Unit:** Months
- **Range:** 1-120 months
- **Description:** Thời gian bảo hành part
