# Warranty Claims API Guide

## Overview
Warranty Claims API cho hệ thống OEM EV Warranty Management với JWT authentication, role-based authorization và workflow management.

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

## Warranty Claim Status Flow
```
SUBMITTED → SC_REVIEW → PROCESSING → COMPLETED
     ↓         ↓            ↓
  REJECTED  REJECTED    REJECTED
```

**Status Descriptions:**
- `SUBMITTED`: SC Staff đã tạo claim, chờ EVM xem xét
- `SC_REVIEW`: EVM đã chấp nhận, chờ Technician xử lý
- `PROCESSING`: Technician đang xử lý
- `COMPLETED`: Đã hoàn tất
- `REJECTED`: Bị từ chối (có thể ở bất kỳ bước nào)

## Endpoints

### 1. Get All Warranty Claims
**GET** `/api/warranty-claims`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):**
```json
{
  "content": [
    {
      "warrantyClaimId": 1,
      "description": "Battery replacement under warranty",
      "claimDate": "2024-10-09T10:30:00.000+00:00",
      "resolutionDate": null,
      "status": "SUBMITTED",
      "partId": 1,
      "partName": "Battery Pack",
      "vehicleId": 1,
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleBrand": "Tesla",
      "vehicleModel": "Model 3"
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

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF, SC_TECHNICIAN

**Path Parameters:**
- `id`: Warranty Claim ID

**Response Success (200):**
```json
{
  "warrantyClaimId": 1,
  "description": "Battery replacement under warranty",
  "claimDate": "2024-10-09T10:30:00.000+00:00",
  "resolutionDate": null,
  "status": "SUBMITTED",
  "partId": 1,
  "partName": "Battery Pack",
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleBrand": "Tesla",
  "vehicleModel": "Model 3"
}
```

### 3. Create Warranty Claim (General)
**POST** `/api/warranty-claims`

**Permissions:** CUSTOMER, ADMIN, SC_STAFF, EVM_STAFF

**Request Body:**
```json
{
  "description": "Battery replacement under warranty",
  "partId": 1,
  "vehicleId": 1
}
```

**Response Success (201):** Same as Get Warranty Claim

### 4. Update Warranty Claim
**PUT** `/api/warranty-claims/{id}`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Path Parameters:**
- `id`: Warranty Claim ID

**Request Body:**
```json
{
  "description": "Updated battery replacement description",
  "partId": 1,
  "vehicleId": 1
}
```

**Response Success (200):** Same as Get Warranty Claim

### 5. Update Claim Status (Manual)
**PATCH** `/api/warranty-claims/{id}/status`

**Permissions:** ADMIN, SC_STAFF, EVM_STAFF only

**Path Parameters:**
- `id`: Warranty Claim ID

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Response Success (200):** Same as Get Warranty Claim

### 6. Delete Warranty Claim
**DELETE** `/api/warranty-claims/{id}`

**Permissions:** ADMIN only

**Path Parameters:**
- `id`: Warranty Claim ID

**Response Success (204):** No Content

---

## 🔄 WORKFLOW ENDPOINTS

### 7. SC Staff Create Claim
**POST** `/api/warranty-claims/sc-create`

**Permissions:** SC_STAFF only

**Description:** SC Staff tạo claim cho khách hàng với status SUBMITTED

**Request Body:**
```json
{
  "description": "Customer reported battery issues, needs replacement",
  "partId": 1,
  "vehicleId": 1
}
```

**Response Success (201):**
```json
{
  "warrantyClaimId": 1,
  "description": "Customer reported battery issues, needs replacement",
  "claimDate": "2024-10-13T10:30:00.000+00:00",
  "resolutionDate": null,
  "status": "SUBMITTED",
  "partId": 1,
  "partName": "Battery Pack",
  "vehicleId": 1,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleBrand": "Tesla",
  "vehicleModel": "Model 3"
}
```

### 8. EVM Accept Claim
**PATCH** `/api/warranty-claims/{id}/evm-accept`

**Permissions:** EVM_STAFF only

**Description:** EVM chấp nhận claim (SUBMITTED → SC_REVIEW)

**Path Parameters:**
- `id`: Warranty Claim ID

**Request Body (optional):**
```json
"Approved for warranty coverage - proceed with repair"
```

**Response Success (200):** Same as Get Warranty Claim with status = SC_REVIEW

### 9. EVM Reject Claim
**PATCH** `/api/warranty-claims/{id}/evm-reject`

**Permissions:** EVM_STAFF only

**Description:** EVM từ chối claim (SUBMITTED → REJECTED)

**Path Parameters:**
- `id`: Warranty Claim ID

**Query Parameters:**
- `reason` (required): Lý do từ chối

**Example:**
```
PATCH /api/warranty-claims/1/evm-reject?reason=Out of warranty period
```

**Response Success (200):** Same as Get Warranty Claim with status = REJECTED

### 10. Tech Start Processing
**PATCH** `/api/warranty-claims/{id}/tech-start`

**Permissions:** SC_TECHNICIAN only

**Description:** Technician bắt đầu xử lý (SC_REVIEW → PROCESSING)

**Path Parameters:**
- `id`: Warranty Claim ID

**Request Body (optional):**
```json
"Started diagnostic and repair process"
```

**Response Success (200):** Same as Get Warranty Claim with status = PROCESSING

### 11. Tech Complete Claim
**PATCH** `/api/warranty-claims/{id}/tech-complete`

**Permissions:** SC_TECHNICIAN only

**Description:** Technician hoàn tất xử lý (PROCESSING → COMPLETED)

**Path Parameters:**
- `id`: Warranty Claim ID

**Query Parameters:**
- `completionNote` (required): Ghi chú hoàn tất

**Example:**
```
PATCH /api/warranty-claims/1/tech-complete?completionNote=Battery replaced successfully, vehicle tested OK
```

**Response Success (200):** Same as Get Warranty Claim with status = COMPLETED

---

## 📋 QUERY ENDPOINTS

### 12. Get Claims by Status
**GET** `/api/warranty-claims/by-status/{status}`

**Permissions:** All authenticated users

**Path Parameters:**
- `status`: Warranty claim status (SUBMITTED, SC_REVIEW, PROCESSING, COMPLETED, REJECTED)

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Example:**
```
GET /api/warranty-claims/by-status/SUBMITTED?page=0&size=10
```

**Response Success (200):** Paginated list of claims with specified status

### 13. Get EVM Pending Claims
**GET** `/api/warranty-claims/evm-pending`

**Permissions:** EVM_STAFF only

**Description:** Lấy claims cần EVM xử lý (status = SUBMITTED)

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):** Paginated list of SUBMITTED claims

### 14. Get Tech Pending Claims
**GET** `/api/warranty-claims/tech-pending`

**Permissions:** SC_TECHNICIAN only

**Description:** Lấy claims cần Technician xử lý (status = SC_REVIEW hoặc PROCESSING)

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Response Success (200):** Paginated list of SC_REVIEW and PROCESSING claims

---

## 🚀 Postman Collection Examples

### SC Staff Create Claim
```
Method: POST
URL: http://localhost:8080/api/warranty-claims/sc-create
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "description": "Customer battery degradation issue",
  "partId": 1,
  "vehicleId": 1
}
```

### EVM Accept Claim
```
Method: PATCH
URL: http://localhost:8080/api/warranty-claims/1/evm-accept
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
"Approved - valid warranty claim"
```

### EVM Reject Claim
```
Method: PATCH
URL: http://localhost:8080/api/warranty-claims/1/evm-reject?reason=Vehicle out of warranty period
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Tech Start Processing
```
Method: PATCH
URL: http://localhost:8080/api/warranty-claims/1/tech-start
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
"Beginning battery diagnostics and replacement"
```

### Tech Complete Claim
```
Method: PATCH
URL: http://localhost:8080/api/warranty-claims/1/tech-complete?completionNote=Battery replaced, all systems functioning normally
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get EVM Pending Claims
```
Method: GET
URL: http://localhost:8080/api/warranty-claims/evm-pending?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Tech Pending Claims
```
Method: GET
URL: http://localhost:8080/api/warranty-claims/tech-pending?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Claims by Status
```
Method: GET
URL: http://localhost:8080/api/warranty-claims/by-status/COMPLETED?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

---

## 📊 Workflow Usage Examples

### Complete Warranty Claim Flow

1. **SC Staff tạo claim:**
```bash
POST /api/warranty-claims/sc-create
# Status: SUBMITTED
```

2. **EVM xem danh sách cần xử lý:**
```bash
GET /api/warranty-claims/evm-pending
```

3. **EVM chấp nhận hoặc từ chối:**
```bash
# Chấp nhận
PATCH /api/warranty-claims/1/evm-accept
# Status: MANAGER_REVIEW

# Hoặc từ chối
PATCH /api/warranty-claims/1/evm-reject?reason=...
# Status: REJECTED
```

4. **Tech xem danh sách cần xử lý:**
```bash
GET /api/warranty-claims/tech-pending
```

5. **Tech bắt đầu xử lý:**
```bash
PATCH /api/warranty-claims/1/tech-start
# Status: PROCESSING
```

6. **Tech hoàn tất:**
```bash
PATCH /api/warranty-claims/1/tech-complete?completionNote=...
# Status: COMPLETED
```

---

## Validation Rules

### Description Field
- **Required:** Yes
- **Length:** 10-500 characters
- **Description:** Mô tả chi tiết vấn đề warranty

### Part ID Field
- **Required:** Yes
- **Type:** Positive number
- **Description:** Must be existing Part ID

### Vehicle ID Field
- **Required:** Yes
- **Type:** Positive number
- **Description:** Must be existing Vehicle ID

---

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Description must be between 10 and 500 characters",
  "path": "/api/warranty-claims"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00", 
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Only EVM_STAFF can accept claims",
  "path": "/api/warranty-claims/1/evm-accept"
}
```

### 409 Conflict (Invalid Status Transition)
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 409,
  "error": "Conflict", 
  "message": "Claim must be in SUBMITTED status to accept. Current status: COMPLETED",
  "path": "/api/warranty-claims/1/evm-accept"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-10-13T10:15:30.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Warranty claim not found with id: 999",
  "path": "/api/warranty-claims/999"
}
```
