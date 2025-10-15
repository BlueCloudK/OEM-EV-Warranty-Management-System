# Service History API Guide

## Overview
Service History API cho hệ thống OEM EV Warranty Management với JWT authentication và role-based authorization.

## Base URL
```
http://localhost:8080/api/service-histories
```

## Authentication
**Tất cả endpoints đều yêu cầu JWT token**

**Header:**
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### 1. Get All Service Histories
**GET** `/api/service-histories`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)
- `search` (optional): Tìm kiếm theo description hoặc service type

**Response Success (200):**
```json
{
  "content": [
    {
      "serviceHistoryId": 1,
      "serviceDate": "2024-10-14T14:30:00.000+00:00",
      "serviceType": "REPLACEMENT",
      "description": "Battery replacement service",
      "partId": "PART-BAT-001",
      "partName": "Battery Pack",
      "vehicleId": 1,
      "vehicleName": "Tesla Model 3",
      "vehicleVin": "1HGBH41JXMN109186"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 25,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

### 2. Get Service History by ID
**GET** `/api/service-histories/{id}`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF, CUSTOMER (own vehicles only)

**Path Parameters:**
- `id`: Service History ID

**Response Success (200):**
```json
{
  "serviceHistoryId": 1,
  "serviceDate": "2024-10-14T14:30:00.000+00:00",
  "serviceType": "REPLACEMENT",
  "description": "Battery replacement service completed successfully",
  "partId": "PART-BAT-001",
  "partName": "Battery Pack",
  "vehicleId": 1,
  "vehicleName": "Tesla Model 3",
  "vehicleVin": "1HGBH41JXMN109186"
}
```

### 3. Create Service History
**POST** `/api/service-histories`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF

**Request Body:**
```json
{
  "serviceDate": "2024-10-14T10:30:00.000+00:00",
  "serviceType": "REPAIR",
  "description": "Motor repair service",
  "partId": "PART-MOT-001",
  "vehicleId": 1
}
```

**Response Success (201):**
```json
{
  "serviceHistoryId": 2,
  "serviceDate": "2024-10-14T10:30:00.000+00:00",
  "serviceType": "REPAIR",
  "description": "Motor repair service",
  "partId": "PART-MOT-001",
  "vehicleId": 1,
  "vehicleName": "Tesla Model 3",
  "vehicleVin": "1HGBH41JXMN109186"
}
```

### 4. Update Service History
**PUT** `/api/service-histories/{id}`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF

**Path Parameters:**
- `id`: Service History ID

**Request Body:**
```json
{
  "serviceDate": "2024-10-14T10:30:00.000+00:00",
  "serviceType": "REPAIR",
  "description": "Motor repair service - Updated with additional diagnostics",
  "partId": "PART-MOT-001",
  "vehicleId": 1
}
```

**Response Success (200):** Same structure as Get Service History

### 5. Delete Service History
**DELETE** `/api/service-histories/{id}`

**Permissions:** ADMIN only

**Path Parameters:**
- `id`: Service History ID

**Response Success (204):** No Content

### 6. Get Service Histories by Vehicle ID
**GET** `/api/service-histories/by-vehicle/{vehicleId}`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF, CUSTOMER (own vehicles only)

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
      "serviceHistoryId": 1,
      "serviceDate": "2024-10-14T14:30:00.000+00:00",
      "serviceType": "REPLACEMENT",
      "description": "Battery replacement service",
      "partId": "PART-BAT-001",
      "partName": "Battery Pack",
      "vehicleId": 1,
      "vehicleName": "Tesla Model 3",
      "vehicleVin": "1HGBH41JXMN109186"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 3,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### 7. Get Service Histories by Part ID
**GET** `/api/service-histories/by-part/{partId}`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF

**Path Parameters:**
- `partId`: Part ID

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):** Paginated list of service histories using the specified part

### 8. Get My Service Histories (Customer Self-service)
**GET** `/api/service-histories/my-services`

**Permissions:** CUSTOMER only

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Headers:**
- `Authorization`: Bearer token (required)

**Response Success (200):**
```json
{
  "content": [
    {
      "serviceHistoryId": 1,
      "serviceDate": "2024-10-14T14:30:00.000+00:00",
      "serviceType": "REPLACEMENT",
      "description": "Battery replacement service",
      "partId": "PART-BAT-001",
      "partName": "Battery Pack",
      "vehicleId": 1,
      "vehicleName": "Tesla Model 3",
      "vehicleVin": "1HGBH41JXMN109186"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### 9. Get Service Histories by Date Range
**GET** `/api/service-histories/by-date-range`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD) - Required
- `endDate`: End date (YYYY-MM-DD) - Required
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):** Paginated list of service histories within date range

---

## Postman Collection Examples

### Environment Variables
```
BASE_URL: http://localhost:8080
JWT_TOKEN: {{auth_token}}
```

### 1. Get All Service Histories
```
Method: GET
URL: {{BASE_URL}}/api/service-histories?page=0&size=10&search=battery
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
```

### 2. Get Service History by ID
```
Method: GET
URL: {{BASE_URL}}/api/service-histories/1
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
```

### 3. Create Service History
```
Method: POST
URL: {{BASE_URL}}/api/service-histories
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
Body (raw JSON):
{
  "serviceDate": "2024-10-14T09:00:00.000+00:00",
  "serviceType": "MAINTENANCE",
  "description": "Brake system maintenance and inspection",
  "partId": "PART-BRK-001",
  "vehicleId": 1
}
```

### 4. Update Service History
```
Method: PUT
URL: {{BASE_URL}}/api/service-histories/1
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
Body (raw JSON):
{
  "serviceDate": "2024-10-14T09:00:00.000+00:00",
  "serviceType": "MAINTENANCE",
  "description": "Brake system maintenance and inspection - Updated with additional checks",
  "partId": "PART-BRK-001",
  "vehicleId": 1
}
```

### 5. Delete Service History (Admin Only)
```
Method: DELETE
URL: {{BASE_URL}}/api/service-histories/1
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
```

### 6. Get Service Histories by Vehicle
```
Method: GET
URL: {{BASE_URL}}/api/service-histories/by-vehicle/1?page=0&size=10
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
```

### 7. Get Service Histories by Part
```
Method: GET
URL: {{BASE_URL}}/api/service-histories/by-part/PART-BAT-001?page=0&size=10
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
```

### 8. Get My Service Histories (Customer)
```
Method: GET
URL: {{BASE_URL}}/api/service-histories/my-services?page=0&size=10
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
```

### 9. Get Service Histories by Date Range
```
Method: GET
URL: {{BASE_URL}}/api/service-histories/by-date-range?startDate=2024-10-01&endDate=2024-10-31&page=0&size=10
Headers:
  Authorization: Bearer {{JWT_TOKEN}}
  Content-Type: application/json
```

---

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "timestamp": "2024-10-14T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Service cost must be greater than 0",
  "path": "/api/service-histories"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2024-10-14T10:15:30.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "path": "/api/service-histories"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-10-14T10:15:30.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Insufficient permissions",
  "path": "/api/service-histories"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-10-14T10:15:30.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Service history with ID 123 does not exist",
  "path": "/api/service-histories/123"
}
```

---

## Security & Business Rules

### Role-Based Access Control
- **ADMIN**: Full CRUD access to all service histories
- **SC_STAFF**: Full CRUD access to all service histories  
- **SC_TECHNICIAN**: Full CRUD access to all service histories
- **EVM_STAFF**: Full CRUD access (can create/update for warranty claims)
- **CUSTOMER**: Read-only access to own vehicle service histories only

### Data Validation & Business Rules
1. **Service Date**: Cannot be in the future (@PastOrPresent validation)
2. **Service Type**: Required, 3-100 characters, only letters/spaces/hyphens/slashes
3. **Description**: Required, 10-500 characters
4. **Part ID**: Required, max 50 characters, uppercase letters/numbers/hyphens only
5. **Vehicle ID**: Required, must reference existing vehicle

### Request Field Specifications
- `serviceDate`: Date (ISO format), cannot be future date
- `serviceType`: String (3-100 chars), pattern: `^[a-zA-Z\\s\\-\\/]+$`
- `description`: String (10-500 chars), required
- `partId`: String (max 50 chars), pattern: `^[A-Z0-9-]+$`  
- `vehicleId`: Long, required, must exist in database

### Response Field Specifications
- `serviceHistoryId`: Long, auto-generated
- `serviceDate`: Date (ISO format)
- `serviceType`: String
- `description`: String
- `partId`: String
- `partName`: String (populated from Part entity)
- `vehicleId`: Long
- `vehicleName`: String (populated from Vehicle entity)
- `vehicleVin`: String (populated from Vehicle entity)
