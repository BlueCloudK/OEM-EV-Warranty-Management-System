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

**Response Success (201):**
```json
{
  "serviceHistoryId": 2,
  "serviceDate": "2024-10-09",
  "serviceType": "MAINTENANCE",
  "serviceDescription": "Regular maintenance check",
  "serviceCost": 200.00,
  "serviceNotes": "Standard maintenance performed",
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleName": "Tesla Model 3",
  "partId": "PART-FILTER-001",
  "partName": "Air Filter",
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "technicianName": "Mike Johnson",
  "laborHours": 2.0,
  "createdBy": "current_user",
  "createdDate": "2024-10-09T15:30:00"
}
```

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

### 5. Delete Service History
**DELETE** `/api/service-histories/{id}`

**Permissions:** ADMIN, SC_STAFF only

**Path Parameters:**
- `id`: Service History ID

**Response Success (204):** No content

### 6. Get My Vehicle Service Histories (Customer endpoint)
**GET** `/api/service-histories/my-vehicles`

**Permissions:** CUSTOMER only

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
  ]
}
```

### 7. Get Service History by Vehicle
**GET** `/api/service-histories/vehicle/{vehicleId}`

**Permissions:** 
- ADMIN, SC_STAFF, SC_TECHNICIAN: Any vehicle
- CUSTOMER: Own vehicles only

**Path Parameters:**
- `vehicleId`: Vehicle ID

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
      "partName": "Tesla Model 3 Battery Pack",
      "technicianName": "Mike Johnson"
    }
  ]
}
```

### 8. Get Service Statistics
**GET** `/api/service-histories/statistics`

**Permissions:** ADMIN, SC_STAFF only

**Response Success (200):**
```json
{
  "totalServices": 85,
  "totalCost": 125000.00,
  "averageCost": 1470.59,
  "servicesByType": {
    "MAINTENANCE": 45,
    "REPAIR": 25,
    "REPLACEMENT": 15
  },
  "servicesByMonth": {
    "2024-10": 12,
    "2024-09": 18,
    "2024-08": 15
  }
}
```

## Postman Collection Examples

### Get All Service Histories
```
Method: GET
URL: http://localhost:8080/api/service-histories?page=0&size=10&search=battery
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
  "technicianName": "John Tech",
  "laborHours": 6.0
}
```

## Error Responses

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions to access service history data"
}
```

### 404 Not Found
```json
{
  "error": "Service history not found",
  "message": "Service history with ID 123 does not exist"
}
```

## Note on Access Levels
- **CUSTOMER**: Chỉ có thể xem service histories của vehicles mình sở hữu (read-only)
- **SC_TECHNICIAN**: Full CRUD access trên tất cả service histories
- **SC_STAFF**: Full CRUD access trên tất cả service histories
- **ADMIN**: Full access tất cả operations
- **EVM_STAFF**: Không có direct access đến service histories API theo SecurityConfig
