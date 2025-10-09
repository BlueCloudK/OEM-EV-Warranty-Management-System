# Warranty Claims API Guide

## Overview
Warranty Claims API cho hệ thống OEM EV Warranty Management với JWT authentication và role-based authorization.

## Base URL
```
http://localhost:8080/api/warranty-claims
```

## Authentication
**Tất cả endpoints đều yêu cầu JWT token**

**Header:**
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### 1. Get All Warranty Claims
**GET** `/api/warranty-claims`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)
- `search` (optional): Tìm kiếm theo description hoặc claim number

**Response Success (200):**
```json
{
  "content": [
    {
      "claimId": 1,
      "claimNumber": "WC-2024-001",
      "claimDescription": "Battery replacement under warranty",
      "claimDate": "2024-10-09",
      "claimStatus": "PENDING",
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "customerName": "John Doe",
      "estimatedCost": 5000.00,
      "actualCost": null,
      "approvedDate": null,
      "completedDate": null
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 15,
  "totalPages": 2,
  "first": true,
  "last": false
}
```

### 2. Get Warranty Claim by ID
**GET** `/api/warranty-claims/{id}`

**Permissions:** 
- ADMIN, SC_STAFF, SC_TECHNICIAN: Any claim
- CUSTOMER: Own claims only

**Path Parameters:**
- `id`: Warranty Claim ID

**Response Success (200):**
```json
{
  "claimId": 1,
  "claimNumber": "WC-2024-001",
  "claimDescription": "Battery replacement under warranty",
  "claimDate": "2024-10-09",
  "claimStatus": "PENDING",
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleName": "Tesla Model 3",
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "estimatedCost": 5000.00,
  "actualCost": null,
  "approvedDate": null,
  "completedDate": null,
  "notes": "Customer reported battery degradation",
  "createdBy": "customer123",
  "createdDate": "2024-10-09T10:30:00"
}
```

### 3. Create Warranty Claim
**POST** `/api/warranty-claims`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, CUSTOMER

**Request Body:**
```json
{
  "claimDescription": "Motor replacement under warranty",
  "vehicleId": 1,
  "estimatedCost": 8000.00,
  "notes": "Customer reported unusual motor noise"
}
```

**Response Success (201):**
```json
{
  "claimId": 2,
  "claimNumber": "WC-2024-002",
  "claimDescription": "Motor replacement under warranty",
  "claimDate": "2024-10-09",
  "claimStatus": "PENDING",
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleName": "Tesla Model 3",
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "estimatedCost": 8000.00,
  "actualCost": null,
  "createdBy": "current_user",
  "createdDate": "2024-10-09T15:30:00"
}
```

### 4. Update Warranty Claim
**PUT** `/api/warranty-claims/{id}`

**Permissions:** 
- ADMIN, SC_STAFF: Full update (all fields)
- SC_TECHNICIAN: Limited update (status, notes, actual cost)
- CUSTOMER: Limited update (description, notes) for own claims only

**Path Parameters:**
- `id`: Warranty Claim ID

**Request Body (ADMIN/SC_STAFF):**
```json
{
  "claimDescription": "Battery replacement under warranty - Updated",
  "claimStatus": "APPROVED",
  "estimatedCost": 5500.00,
  "actualCost": 5200.00,
  "notes": "Claim approved after technical review"
}
```

**Request Body (SC_TECHNICIAN):**
```json
{
  "claimStatus": "IN_PROGRESS",
  "actualCost": 5200.00,
  "notes": "Work in progress - battery testing completed"
}
```

**Request Body (CUSTOMER - own claims only):**
```json
{
  "claimDescription": "Battery replacement under warranty - Additional details",
  "notes": "Updated description with more details"
}
```

### 5. Delete Warranty Claim
**DELETE** `/api/warranty-claims/{id}`

**Permissions:** ADMIN, SC_STAFF only

**Path Parameters:**
- `id`: Warranty Claim ID

**Response Success (204):** No content

### 6. Get My Warranty Claims (Customer endpoint)
**GET** `/api/warranty-claims/my-claims`

**Permissions:** CUSTOMER only

**Response Success (200):**
```json
{
  "content": [
    {
      "claimId": 1,
      "claimNumber": "WC-2024-001",
      "claimDescription": "Battery replacement under warranty",
      "claimDate": "2024-10-09",
      "claimStatus": "PENDING",
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleName": "Tesla Model 3",
      "estimatedCost": 5000.00,
      "actualCost": null
    }
  ]
}
```

### 7. Update Claim Status
**PATCH** `/api/warranty-claims/{id}/status`

**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN only

**Path Parameters:**
- `id`: Warranty Claim ID

**Request Body:**
```json
{
  "status": "APPROVED",
  "notes": "Claim approved after technical review"
}
```

## Postman Collection Examples

### Get All Warranty Claims
```
Method: GET
URL: http://localhost:8080/api/warranty-claims?page=0&size=10&search=battery
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Create Warranty Claim
```
Method: POST
URL: http://localhost:8080/api/warranty-claims
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "claimDescription": "New warranty claim",
  "vehicleId": 1,
  "estimatedCost": 3000.00,
  "notes": "Initial claim submission"
}
```

## Error Responses

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions to access warranty claim data"
}
```

### 404 Not Found
```json
{
  "error": "Warranty claim not found",
  "message": "Warranty claim with ID 123 does not exist"
}
```

## Note on Access Levels
- **CUSTOMER**: Có thể tạo claims cho vehicles của mình và xem/cập nhật claims của mình
- **SC_TECHNICIAN**: Có thể xem tất cả claims và cập nhật status/notes nhưng không thể xóa
- **SC_STAFF**: Full CRUD access trên tất cả claims
- **ADMIN**: Full access tất cả operations
- **EVM_STAFF**: Không có direct access đến warranty claims API theo SecurityConfig
