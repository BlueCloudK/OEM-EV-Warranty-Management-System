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

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF** ✅ UPDATED

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
      "description": "Battery replacement service",
      "serviceDate": "2024-10-09T14:30:00.000+00:00",
      "serviceType": "REPLACEMENT",
      "serviceCost": 15000.00,
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "partId": "PART-BAT-001",
      "partName": "Battery Pack",
      "technicianName": "John Smith"
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

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF**, CUSTOMER (own vehicles only) ✅ UPDATED

**Path Parameters:**
- `id`: Service History ID

**Note:** Customers chỉ có thể xem service histories của vehicles mình sở hữu (business logic filtering)
**Note:** **EVM_STAFF giờ có thể xem để theo dõi warranty claim completion** ✅ NEW

**Response Success (200):**
```json
{
  "serviceHistoryId": 1,
  "description": "Battery replacement service completed successfully",
  "serviceDate": "2024-10-09T14:30:00.000+00:00",
  "serviceType": "REPLACEMENT",
  "serviceCost": 15000.00,
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleName": "Tesla Model 3",
  "partId": "PART-BAT-001",
  "partName": "Battery Pack",
  "technicianName": "John Smith",
  "warrantyClaimId": 5,
  "completionNotes": "Battery replaced under warranty, all systems tested OK"
}
```

### 3. Create Service History
**POST** `/api/service-histories`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Request Body:**
```json
{
  "description": "Motor repair service",
  "serviceType": "REPAIR",
  "serviceCost": 8000.00,
  "vehicleId": 1,
  "partId": "PART-MOT-001",
  "technicianName": "Jane Doe",
  "warrantyClaimId": 3
}
```

**Response Success (201):**
```json
{
  "serviceHistoryId": 2,
  "description": "Motor repair service",
  "serviceDate": "2024-10-14T10:30:00.000+00:00",
  "serviceType": "REPAIR",
  "serviceCost": 8000.00,
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleName": "Tesla Model 3",
  "partId": "PART-MOT-001",
  "partName": "Electric Motor",
  "technicianName": "Jane Doe",
  "warrantyClaimId": 3
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
  "description": "Motor repair service - Updated with additional notes",
  "serviceType": "REPAIR",
  "serviceCost": 8500.00,
  "vehicleId": 1,
  "partId": "PART-MOT-001",
  "technicianName": "Jane Doe",
  "warrantyClaimId": 3,
  "completionNotes": "Motor repaired and tested successfully"
}
```

**Response Success (200):** Same as Get Service History

### 5. Delete Service History
**DELETE** `/api/service-histories/{id}`

**Permissions:** ADMIN only

**Path Parameters:**
- `id`: Service History ID

**Response Success (204):** No Content

### 6. Get Service Histories by Vehicle ID
**GET** `/api/service-histories/by-vehicle/{vehicleId}`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF**, CUSTOMER (own vehicles only) ✅ UPDATED

**Path Parameters:**
- `vehicleId`: Vehicle ID

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Use Case for EVM_STAFF:** ✅ NEW
- Monitor warranty claim completion for specific vehicles
- Track service quality and resolution times
- Verify parts usage and replacement patterns

**Response Success (200):**
```json
{
  "content": [
    {
      "serviceHistoryId": 1,
      "description": "Battery replacement service",
      "serviceDate": "2024-10-09T14:30:00.000+00:00",
      "serviceType": "REPLACEMENT",
      "serviceCost": 15000.00,
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "partId": "PART-BAT-001",
      "partName": "Battery Pack",
      "technicianName": "John Smith",
      "warrantyClaimId": 5
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

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF** ✅ UPDATED

**Path Parameters:**
- `partId`: Part ID

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Use Case for EVM_STAFF:** ✅ NEW
- Track warranty claim patterns for specific parts
- Monitor part failure rates and replacement frequency
- Analyze part quality and durability issues

**Response Success (200):** Paginated list of service histories using the specified part

### 8. Get My Service Histories (Customer Self-service)
**GET** `/api/service-histories/my-services`

**Permissions:** CUSTOMER only

**Description:** Customer xem service histories của vehicles mình sở hữu

**Headers:**
```
Authorization: Bearer {customer_jwt_token}
Content-Type: application/json
```

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):**
```json
{
  "content": [
    {
      "serviceHistoryId": 1,
      "description": "Battery replacement service",
      "serviceDate": "2024-10-09T14:30:00.000+00:00",
      "serviceType": "REPLACEMENT",
      "serviceCost": 15000.00,
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "partId": "PART-BAT-001",
      "partName": "Battery Pack",
      "technicianName": "John Smith"
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

---

## 🔍 EVM_STAFF Monitoring Use Cases ✅ NEW FEATURE

### Warranty Claim Completion Tracking
**EVM_STAFF can now monitor the entire warranty claim lifecycle:**

1. **Track Claim Progress:**
```bash
# Get service histories for a specific vehicle after EVM approval
GET /api/service-histories/by-vehicle/1
Authorization: Bearer {evm_staff_token}
```

2. **Monitor Part Performance:**
```bash
# Track all services using a specific part
GET /api/service-histories/by-part/PART-BAT-001
Authorization: Bearer {evm_staff_token}
```

3. **Quality Assurance:**
```bash
# Review all service completions
GET /api/service-histories?search=completion
Authorization: Bearer {evm_staff_token}
```

### Business Benefits for EVM:
- ✅ **Completion Visibility:** Track warranty claim resolution
- ✅ **Quality Control:** Monitor service center performance
- ✅ **Part Analysis:** Identify recurring issues
- ✅ **Customer Satisfaction:** Ensure timely resolution

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
