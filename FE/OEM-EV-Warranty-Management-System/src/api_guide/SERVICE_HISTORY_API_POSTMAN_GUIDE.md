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

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)
- `search` (optional): Tìm kiếm theo service type hoặc description

**Response Success (200):**
```json
{
  "content": [
    {
      "serviceHistoryId": 1,
      "serviceDate": "2024-10-09",
      "serviceType": "REPLACEMENT",
      "serviceDescription": "Battery pack replacement under warranty",
      "serviceCost": 5000.00,
      "serviceNotes": "Customer reported battery degradation",
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "partId": "PART-BAT-001",
      "partName": "Tesla Model 3 Battery Pack",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "customerName": "John Doe",
      "technicianName": "Mike Johnson",
      "createdBy": "staff123",
      "createdDate": "2024-10-09T14:30:00"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 85,
  "totalPages": 9,
  "first": true,
  "last": false
}
```

### 2. Get Service History by ID
**GET** `/api/service-histories/{id}`

**Permissions:** 
- ADMIN, SC_STAFF, SC_TECHNICIAN: Any service history
- CUSTOMER: Own vehicle's service histories only

**Path Parameters:**
- `id`: Service History ID

**Response Success (200):**
```json
{
  "serviceHistoryId": 1,
  "serviceDate": "2024-10-09",
  "serviceType": "REPLACEMENT",
  "serviceDescription": "Battery pack replacement under warranty",
  "serviceCost": 5000.00,
  "serviceNotes": "Customer reported battery degradation. Battery tested and found below acceptable capacity. Replaced under warranty.",
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleName": "Tesla Model 3",
  "partId": "PART-BAT-001",
  "partName": "Tesla Model 3 Battery Pack",
  "partWarrantyPeriod": 96,
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "technicianName": "Mike Johnson",
  "laborHours": 4.5,
  "warrantyClaimId": 1,
  "createdBy": "staff123",
  "createdDate": "2024-10-09T14:30:00",
  "lastUpdated": "2024-10-09T16:45:00"
}
```

### 3. Create Service History
**POST** `/api/service-histories`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Request Body:**
```json
{
  "serviceDate": "2024-10-09",
  "serviceType": "MAINTENANCE",
  "serviceDescription": "Regular maintenance check",
  "serviceCost": 200.00,
  "serviceNotes": "Standard maintenance performed",
  "vehicleId": 1,
  "partId": "PART-FILTER-001",
  "technicianName": "Mike Johnson",
  "laborHours": 2.0
}
```

**Response Success (201):** Same as Get Service History by ID

### 4. Update Service History  
**PUT** `/api/service-histories/{id}`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Path Parameters:**
- `id`: Service History ID

**Request Body:**
```json
{
  "serviceDate": "2024-10-09",
  "serviceType": "REPLACEMENT",
  "serviceDescription": "Battery pack replacement under warranty - Updated",
  "serviceCost": 5200.00,
  "serviceNotes": "Updated service notes with final cost",
  "technicianName": "Mike Johnson",
  "laborHours": 5.0
}
```

**Response Success (200):** Same as Get Service History by ID

### 5. Delete Service History
**DELETE** `/api/service-histories/{id}`

**Permissions:** ADMIN only

**Path Parameters:**
- `id`: Service History ID

**Response Success (204):** No Content

### 6. Get Service Histories by Vehicle ID
**GET** `/api/service-histories/by-vehicle/{vehicleId}`

**Permissions:** 
- ADMIN, SC_STAFF, SC_TECHNICIAN: Any vehicle
- CUSTOMER: Own vehicles only

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
      "serviceDate": "2024-10-09",
      "serviceType": "REPLACEMENT",
      "serviceDescription": "Battery pack replacement under warranty",
      "serviceCost": 5000.00,
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "partName": "Tesla Model 3 Battery Pack",
      "technicianName": "Mike Johnson",
      "createdDate": "2024-10-09T14:30:00"
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

### 7. Get Service Histories by Part ID
**GET** `/api/service-histories/by-part/{partId}`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Path Parameters:**
- `partId`: Part ID

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):** Paginated list of service histories using the specified part

### 8. Get My Service Histories (Customer Self-Service)
**GET** `/api/service-histories/my-services`

**Permissions:** CUSTOMER only

**Description:** Customer xem service histories của vehicles mình sở hữu

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
  "content": [
    {
      "serviceHistoryId": 1,
      "serviceDate": "2024-10-09",
      "serviceType": "REPLACEMENT",
      "serviceDescription": "Battery pack replacement under warranty",
      "serviceCost": 5000.00,
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "partName": "Tesla Model 3 Battery Pack",
      "technicianName": "Mike Johnson"
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

### 9. Get Service Histories by Date Range
**GET** `/api/service-histories/by-date-range`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Query Parameters:**
- `startDate` (required): Start date (format: YYYY-MM-DD)
- `endDate` (required): End date (format: YYYY-MM-DD)
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):** Paginated list of service histories within date range

## Postman Collection Examples

### Get All Service Histories
```
Method: GET
URL: http://localhost:8080/api/service-histories?page=0&size=10&search=battery
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Service History by ID
```
Method: GET
URL: http://localhost:8080/api/service-histories/1
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Create Service History
```
Method: POST
URL: http://localhost:8080/api/service-histories
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "serviceDate": "2024-10-09",
  "serviceType": "REPAIR",
  "serviceDescription": "Motor repair",
  "serviceCost": 3000.00,
  "serviceNotes": "Motor issue resolved",
  "vehicleId": 1,
  "partId": "PART-MOT-001",
  "technicianName": "John Tech",
  "laborHours": 6.0
}
```

### Update Service History
```
Method: PUT
URL: http://localhost:8080/api/service-histories/1
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "serviceDate": "2024-10-09",
  "serviceType": "REPLACEMENT",
  "serviceDescription": "Updated description",
  "serviceCost": 5200.00,
  "serviceNotes": "Updated notes",
  "technicianName": "Mike Johnson",
  "laborHours": 5.0
}
```

### Delete Service History
```
Method: DELETE
URL: http://localhost:8080/api/service-histories/1
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Service Histories by Vehicle ID
```
Method: GET
URL: http://localhost:8080/api/service-histories/by-vehicle/1?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Service Histories by Part ID
```
Method: GET
URL: http://localhost:8080/api/service-histories/by-part/PART-BAT-001?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get My Service Histories (Customer)
```
Method: GET
URL: http://localhost:8080/api/service-histories/my-services?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Service Histories by Date Range
```
Method: GET
URL: http://localhost:8080/api/service-histories/by-date-range?startDate=2024-10-01&endDate=2024-10-31&page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

## Validation Rules

### Service Date Field
- **Required:** Yes
- **Format:** YYYY-MM-DD or ISO datetime
- **Description:** Ngày thực hiện service

### Service Type Field
- **Required:** Yes
- **Enum:** MAINTENANCE, REPAIR, REPLACEMENT, INSPECTION
- **Description:** Loại service được thực hiện

### Service Cost Field
- **Required:** Yes
- **Type:** Positive number
- **Minimum:** 0.00
- **Description:** Chi phí service tính bằng USD

### Vehicle ID Field
- **Required:** Yes
- **Type:** Positive number
- **Description:** Must be existing Vehicle ID

### Labor Hours Field
- **Optional:** Yes
- **Type:** Positive number
- **Range:** 0.1-24.0 hours
- **Description:** Số giờ công lao động

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Service cost must be greater than 0",
  "path": "/api/service-histories"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Only ADMIN, SC_STAFF, and SC_TECHNICIAN can create service histories",
  "path": "/api/service-histories"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Service history with ID 123 does not exist",
  "path": "/api/service-histories/123"
}
```

## Security Notes

### Data Access Control
- **CUSTOMER**: Chỉ có thể xem service histories của vehicles mình sở hữu thông qua business logic filtering
- **SC_TECHNICIAN**: Full CRUD access trên tất cả service histories
- **SC_STAFF**: Full CRUD access trên tất cả service histories  
- **ADMIN**: Full access tất cả operations including DELETE
- **EVM_STAFF**: Không có access đến service histories API

### Business Logic Filtering
- Customer data isolation được implement tại service layer
- Vehicle ownership validation cho customer endpoints
- Date range validation để tránh performance issues
- Audit logging cho tất cả critical operations
