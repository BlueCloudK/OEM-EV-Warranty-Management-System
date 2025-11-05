# OEM EV WARRANTY MANAGEMENT SYSTEM - API DOCUMENTATION

## 📋 Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [Roles & Permissions](#roles--permissions)
5. [Common Patterns](#common-patterns)
6. [API Endpoints](#api-endpoints)
   - [Authentication APIs](#authentication-apis)
   - [Customer Management APIs](#customer-management-apis)
   - [Vehicle Management APIs](#vehicle-management-apis)
   - [Warranty Claim APIs](#warranty-claim-apis)
   - [Parts Management APIs](#parts-management-apis)
   - [Part Request APIs](#part-request-apis)
   - [Service Center APIs](#service-center-apis)
   - [Service History APIs](#service-history-apis)
   - [Feedback APIs](#feedback-apis)
   - [Recall Request APIs](#recall-request-apis)
   - [Work Log APIs](#work-log-apis)
   - [Installed Part APIs](#installed-part-apis)
   - [User Management APIs](#user-management-apis)
   - [User Info APIs](#user-info-apis)
   - [Public APIs](#public-apis)
7. [Error Handling](#error-handling)
8. [Pagination](#pagination)

---

## Overview

The OEM EV Warranty Management System API provides comprehensive endpoints for managing electric vehicle warranties, service claims, parts inventory, service centers, and customer relationships.

**Version:** 1.0.0
**Base URL (Development):** `http://localhost:8080`
**Base URL (Production):** `https://api.oemwarranty.com`
**Protocol:** HTTPS (Production), HTTP (Development)
**Response Format:** JSON
**Authentication:** JWT Bearer Token

---

## Base Configuration

### Base URLs

```
Development: http://localhost:8080
Production:  https://api.oemwarranty.com
```

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
```

### Response Format

All responses are in JSON format with standard HTTP status codes.

---

## Authentication

### Authentication Method

The API uses **JWT (JSON Web Token)** based authentication with Bearer token scheme.

### How to Authenticate

1. **Login** to receive access token and refresh token
2. **Include access token** in Authorization header for all subsequent requests:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Refresh token** when access token expires using the refresh endpoint

### Token Expiry

- **Access Token:** Typically 15-60 minutes
- **Refresh Token:** Typically 7-30 days

### Token Refresh Flow

When you receive a `401 Unauthorized` response:
1. Call `POST /api/auth/refresh` with your refresh token
2. Receive new access token and refresh token
3. Update stored tokens
4. Retry original request with new access token

---

## Roles & Permissions

### Available Roles

| Role | Code | Description |
|------|------|-------------|
| Administrator | `ADMIN` | Full system access, user management, claim approval |
| EV Manufacturer Staff | `EVM_STAFF` | Parts catalog management, part request approval, recalls |
| Service Center Staff | `SC_STAFF` | Customer registration, claim creation, vehicle registration |
| Service Center Technician | `SC_TECHNICIAN` | Claim processing, work logging, part requests |
| Customer | `CUSTOMER` | View own vehicles/claims, submit feedback |

### Permission Matrix

| Endpoint Category | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|------------------|-------|-----------|----------|---------------|----------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Claims | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Claims | ✅ | ❌ | ✅ | ❌ | ❌ |
| Process Claims | ❌ | ❌ | ❌ | ✅ | ❌ |
| Part Requests | ❌ | ✅ (approve) | ❌ | ✅ (create) | ❌ |
| Parts Catalog | ✅ | ✅ | ✅ (view) | ✅ (view) | ❌ |
| Service Centers | ✅ (CRUD) | ✅ (view) | ✅ (view) | ✅ (view) | ✅ (view) |
| My Vehicles | ❌ | ❌ | ❌ | ❌ | ✅ |
| Submit Feedback | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create Recalls | ❌ | ✅ | ❌ | ❌ | ❌ |
| Respond to Recalls | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Common Patterns

### Pagination

Most list endpoints support pagination with query parameters:

```
?page=0&size=10
```

**Parameters:**
- `page` (integer, default: 0): Page number (0-indexed)
- `size` (integer, default: 10): Number of items per page (max: 100)

**Response Structure:**
```json
{
  "content": [ /* array of items */ ],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false
}
```

### Sorting

Some endpoints support sorting:

```
?sortBy=createdAt&sortDir=DESC
```

**Parameters:**
- `sortBy` (string): Field name to sort by
- `sortDir` (enum): `ASC` or `DESC` (default: ASC)

### Filtering & Searching

Many endpoints support filtering:

```
?search=tesla
?status=COMPLETED
?startDate=2024-01-01&endDate=2024-12-31
```

Parameters vary by endpoint. See individual endpoint documentation.

### Date Formats

- **Date:** `YYYY-MM-DD` (e.g., `2024-04-05`)
- **DateTime:** ISO 8601 format `YYYY-MM-DDTHH:mm:ss` (e.g., `2024-04-05T14:30:00`)

### UUID Format

Customer IDs use UUID format:
```
550e8400-e29b-41d4-a716-446655440000
```

---

## API Endpoints

### Authentication APIs

Base Path: `/api/auth`

#### POST /api/auth/login
**Description:** User login - authenticate and receive tokens
**Authentication:** None (Public)
**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```
**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def50200a1b2c3d4e5f6...",
  "userId": 42,
  "username": "john_doe",
  "roleName": "CUSTOMER",
  "message": "Login successful"
}
```
**Error Responses:**
- `401 Unauthorized`: Invalid username or password
- `403 Forbidden`: Account is locked or disabled

---

#### POST /api/auth/refresh
**Description:** Refresh access token using refresh token
**Authentication:** None (Public)
**Request Body:**
```json
{
  "refreshToken": "def50200a1b2c3d4e5f6..."
}
```
**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc12300f9e8d7c6b5a4...",
  "userId": 42,
  "username": "john_doe",
  "roleName": "CUSTOMER"
}
```
**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token

---

#### POST /api/auth/register
**Description:** Customer self-registration
**Authentication:** None (Public)
**Request Body:**
```json
{
  "username": "jane_smith",
  "email": "jane@example.com",
  "password": "SecurePass456",
  "address": "123 Main St, Hanoi, Vietnam"
}
```
**Validation Rules:**
- `username`: 3-50 characters, alphanumeric with underscores
- `email`: Valid email format
- `password`: Minimum 6 characters
- `address`: 10-255 characters

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer account created successfully",
  "user": {
    "userId": 43,
    "username": "jane_smith",
    "roleName": "CUSTOMER"
  }
}
```
**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Username or email already exists

---

#### POST /api/auth/logout
**Description:** Logout user and invalidate access token
**Authentication:** Required
**Request Body:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /api/auth/forgot-password
**Description:** Request password reset email
**Authentication:** None (Public)
**Request Body:**
```json
{
  "email": "john_doe@example.com"
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

#### POST /api/auth/reset-password
**Description:** Complete password reset with token from email
**Authentication:** None (Public)
**Request Body:**
```json
{
  "resetToken": "xyz123abc456def789",
  "newPassword": "NewSecurePass789"
}
```
**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```
**Error Responses:**
- `400 Bad Request`: Invalid or expired reset token

---

#### GET /api/auth/validate
**Description:** Validate current access token
**Authentication:** Required
**Headers:**
```http
Authorization: Bearer <accessToken>
```
**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def50200a1b2c3d4e5f6...",
  "userId": 42,
  "username": "john_doe",
  "roleName": "CUSTOMER"
}
```
**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

---

#### POST /api/auth/admin/create-user
**Description:** Create user with any role (Admin only)
**Authentication:** Required (ADMIN)
**Request Body:**
```json
{
  "username": "new_staff",
  "email": "staff@oemwarranty.com",
  "password": "TempPass123",
  "roleId": 2
}
```
**Role IDs:**
- 1: ADMIN
- 2: EVM_STAFF
- 3: SC_STAFF
- 4: SC_TECHNICIAN
- 5: CUSTOMER

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully by Admin",
  "user": {
    "userId": 45,
    "username": "new_staff",
    "roleName": "EVM_STAFF"
  }
}
```

---

#### POST /api/auth/staff/register-customer
**Description:** Register customer with user account (Staff only)
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Request Body:**
```json
{
  "username": "mary_nguyen",
  "email": "mary@example.com",
  "password": "TempPass123",
  "address": "789 Tran Hung Dao, Hanoi",
  "customerName": "Mary Nguyen",
  "customerPhone": "0912345678"
}
```
**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer account and profile created successfully",
  "customer": {
    "customerId": "660f9511-f39c-52e5-b827-557766551111",
    "name": "Mary Nguyen",
    "email": "mary@example.com",
    "phone": "0912345678",
    "address": "789 Tran Hung Dao, Hanoi",
    "createdAt": "2024-04-05T10:00:00",
    "userId": 44,
    "username": "mary_nguyen"
  }
}
```

---

### Customer Management APIs

Base Path: `/api/customers`

#### GET /api/customers
**Description:** Get paginated list of customers
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Query Parameters:**
- `page` (integer, default: 0): Page number
- `size` (integer, default: 10): Items per page
- `search` (string, optional): Search term

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0901234567",
      "address": "456 Le Loi, Hanoi",
      "createdAt": "2023-01-10T12:00:00",
      "userId": 42,
      "username": "john_doe"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false
}
```

---

#### GET /api/customers/{id}
**Description:** Get customer by ID
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Path Parameters:**
- `id` (UUID): Customer ID

**Success Response (200 OK):**
```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0901234567",
  "address": "456 Le Loi, Hanoi",
  "createdAt": "2023-01-10T12:00:00",
  "userId": 42,
  "username": "john_doe"
}
```
**Error Responses:**
- `404 Not Found`: Customer not found

---

#### POST /api/customers
**Description:** Create new customer
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Request Body:**
```json
{
  "name": "Alice Johnson",
  "phone": "0923456789",
  "userId": 46,
  "address": "321 Nguyen Trai, Hanoi"
}
```
**Validation Rules:**
- `name`: 5-100 characters, capitalized words
- `phone`: Vietnamese phone format (0xxxxxxxxx or +84xxxxxxxxx)
- `userId`: Positive integer
- `address`: 10-255 characters

**Success Response (201 Created):**
```json
{
  "customerId": "770fa622-g40d-63f6-c938-668877662222",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "0923456789",
  "address": "321 Nguyen Trai, Hanoi",
  "createdAt": "2024-04-05T11:00:00",
  "userId": 46,
  "username": "alice_johnson"
}
```

---

#### PUT /api/customers/{id}
**Description:** Update customer information
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Path Parameters:**
- `id` (UUID): Customer ID

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "0901234567",
  "userId": 42,
  "address": "456 Le Loi Street, Ba Dinh, Hanoi"
}
```
**Success Response (200 OK):** Returns updated CustomerResponseDTO

---

#### DELETE /api/customers/{id}
**Description:** Delete customer (Admin only)
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (UUID): Customer ID

**Success Response (204 No Content)**

---

#### GET /api/customers/search
**Description:** Search customers by name
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Query Parameters:**
- `name` (string, required): Search term
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<CustomerResponseDTO>

---

#### GET /api/customers/by-email
**Description:** Find customer by email
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Query Parameters:**
- `email` (string, required): Customer email

**Success Response (200 OK):** Returns CustomerResponseDTO

---

#### GET /api/customers/by-phone
**Description:** Find customer by phone number
**Authentication:** Required (ADMIN, SC_STAFF, EVM_STAFF)
**Query Parameters:**
- `phone` (string, required): Customer phone

**Success Response (200 OK):** Returns CustomerResponseDTO

---

#### PUT /api/customers/profile
**Description:** Update own profile (Customer only)
**Authentication:** Required (CUSTOMER)
**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "0901234567",
  "userId": 42,
  "address": "456 Le Loi, Hanoi"
}
```
**Success Response (200 OK):** Returns updated CustomerResponseDTO

---

### Vehicle Management APIs

Base Path: `/api/vehicles`

#### GET /api/vehicles
**Description:** Get all vehicles (paginated)
**Authentication:** Required (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `search` (string, optional)

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "vehicleId": 101,
      "vehicleName": "Tesla Model 3",
      "vehicleModel": "Model 3 Long Range",
      "vehicleYear": 2023,
      "vehicleVin": "5YJ3E1EA5KF123456",
      "purchaseDate": "2023-01-15",
      "warrantyStartDate": "2023-01-15",
      "warrantyEndDate": "2027-01-15",
      "mileage": 15000,
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "customerName": "John Doe"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 50,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

#### GET /api/vehicles/{id}
**Description:** Get vehicle by ID
**Authentication:** Required (All staff roles + CUSTOMER)
**Path Parameters:**
- `id` (long): Vehicle ID

**Success Response (200 OK):** Returns VehicleResponseDTO

---

#### POST /api/vehicles
**Description:** Register new vehicle
**Authentication:** Required (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN)
**Request Body:**
```json
{
  "vehicleName": "VinFast VF 8",
  "vehicleModel": "VF 8 Plus",
  "vehicleYear": 2024,
  "vehicleVin": "VF8VN2024ABC12345",
  "purchaseDate": "2024-04-01",
  "warrantyStartDate": "2024-04-01",
  "warrantyEndDate": "2034-04-01",
  "mileage": 50,
  "customerId": "660f9511-f39c-52e5-b827-557766551111"
}
```
**Validation Rules:**
- `vehicleName`: 2-100 characters
- `vehicleModel`: 2-50 characters
- `vehicleYear`: 1900-2030
- `vehicleVin`: Vietnamese VIN format
- `mileage`: >= 0

**Success Response (201 Created):** Returns VehicleResponseDTO

---

#### PUT /api/vehicles/{id}
**Description:** Update vehicle information
**Authentication:** Required (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN)
**Path Parameters:**
- `id` (long): Vehicle ID

**Request Body:** VehicleRequestDTO
**Success Response (200 OK):** Returns VehicleResponseDTO

---

#### DELETE /api/vehicles/{id}
**Description:** Delete vehicle
**Authentication:** Required (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN)
**Path Parameters:**
- `id` (long): Vehicle ID

**Success Response (204 No Content)**

---

#### GET /api/vehicles/by-customer/{customerId}
**Description:** Get vehicles by customer ID
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `customerId` (UUID): Customer ID

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<VehicleResponseDTO>

---

#### GET /api/vehicles/my-vehicles
**Description:** Get customer's own vehicles
**Authentication:** Required (CUSTOMER)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<VehicleResponseDTO>

---

#### GET /api/vehicles/by-vin
**Description:** Find vehicle by VIN
**Authentication:** Required (All staff roles)
**Query Parameters:**
- `vin` (string, required): Vehicle Identification Number

**Success Response (200 OK):** Returns VehicleResponseDTO

---

#### GET /api/vehicles/search
**Description:** Search vehicles
**Authentication:** Required (All staff roles + CUSTOMER)
**Query Parameters:**
- `model` (string, optional)
- `brand` (string, optional)
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<VehicleResponseDTO>

---

#### GET /api/vehicles/warranty-expiring
**Description:** Get vehicles with warranty expiring soon
**Authentication:** Required (All staff roles)
**Query Parameters:**
- `daysFromNow` (integer, default: 30): Days in future to check
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<VehicleResponseDTO>

---

### Warranty Claim APIs

Base Path: `/api/warranty-claims`

#### Warranty Claim Status Enum
```
PENDING_ADMIN_APPROVAL  - Awaiting admin review
ADMIN_APPROVED          - Approved by admin, ready for technician
ADMIN_REJECTED          - Rejected by admin
PENDING_TECHNICIAN      - (virtual status for tech queue)
IN_PROGRESS             - Technician working on claim
COMPLETED               - Claim resolved
CANCELLED               - Claim cancelled
```

---

#### GET /api/warranty-claims
**Description:** Get all warranty claims
**Authentication:** Required (ADMIN, SC_STAFF)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "warrantyClaimId": 1001,
      "claimDate": "2024-03-15T14:30:00",
      "status": "COMPLETED",
      "description": "Battery degradation issue",
      "resolutionDate": "2024-03-20T16:00:00",
      "installedPartId": 501,
      "partId": 201,
      "partName": "Battery Pack",
      "partNumber": "BP-001-LR",
      "manufacturer": "Panasonic",
      "vehicleId": 101,
      "vehicleName": "Tesla Model 3",
      "vehicleModel": "Model 3 Long Range",
      "vehicleYear": 2023,
      "vehicleVin": "5YJ3E1EA5KF123456",
      "customerId": "550e8400-e29b-41d4-a716-446655440000",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "0901234567",
      "assignedToUserId": 5,
      "assignedToUsername": "tech_mike",
      "assignedToEmail": "mike@servicecentre.com",
      "comments": "Battery replaced successfully",
      "updatedBy": "tech_mike",
      "lastUpdated": "2024-03-20T16:00:00"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 25,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

---

#### GET /api/warranty-claims/{id}
**Description:** Get warranty claim by ID
**Authentication:** Required (ADMIN, SC_STAFF, SC_TECHNICIAN)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Success Response (200 OK):** Returns WarrantyClaimResponseDTO

---

#### POST /api/warranty-claims
**Description:** Create warranty claim (Admin/Staff)
**Authentication:** Required (ADMIN, SC_STAFF)
**Request Body:**
```json
{
  "vehicleId": 101,
  "installedPartId": 501,
  "description": "Customer reports battery degradation, capacity dropped to 70%"
}
```
**Validation Rules:**
- `vehicleId`: Positive integer, required
- `installedPartId`: Positive integer, required
- `description`: 10-500 characters

**Success Response (201 Created):** Returns WarrantyClaimResponseDTO with status `PENDING_ADMIN_APPROVAL`

---

#### POST /api/warranty-claims/sc-create
**Description:** Create warranty claim (Service Center Staff)
**Authentication:** Required (SC_STAFF)
**Request Body:** Same as POST /api/warranty-claims
**Success Response (201 Created):** Returns WarrantyClaimResponseDTO

---

#### PUT /api/warranty-claims/{id}
**Description:** Update warranty claim
**Authentication:** Required (ADMIN, SC_STAFF)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Request Body:** WarrantyClaimRequestDTO
**Success Response (200 OK):** Returns WarrantyClaimResponseDTO

---

#### PATCH /api/warranty-claims/{id}/status
**Description:** Update claim status (Admin only)
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Request Body:**
```json
{
  "status": "CANCELLED",
  "notes": "Customer withdrew claim"
}
```
**Success Response (200 OK):** Returns WarrantyClaimResponseDTO

---

#### PATCH /api/warranty-claims/{id}/admin-accept
**Description:** Admin approve warranty claim
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Request Body (optional):**
```
"Warranty valid. Approve for repair."
```
**Success Response (200 OK):** Returns WarrantyClaimResponseDTO with status `ADMIN_APPROVED`

---

#### PATCH /api/warranty-claims/{id}/admin-reject
**Description:** Admin reject warranty claim
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Query Parameters:**
- `reason` (string, required): Rejection reason

**Example:**
```
PATCH /api/warranty-claims/1002/admin-reject?reason=Warranty%20expired
```
**Success Response (200 OK):** Returns WarrantyClaimResponseDTO with status `ADMIN_REJECTED`

---

#### PATCH /api/warranty-claims/{id}/tech-start
**Description:** Technician start processing claim
**Authentication:** Required (SC_TECHNICIAN)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Request Body (optional):**
```
"Starting diagnosis of motor issue"
```
**Success Response (200 OK):** Returns WarrantyClaimResponseDTO with status `IN_PROGRESS`

---

#### PATCH /api/warranty-claims/{id}/tech-complete
**Description:** Technician complete claim
**Authentication:** Required (SC_TECHNICIAN)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Query Parameters:**
- `completionNote` (string, required): Completion summary

**Example:**
```
PATCH /api/warranty-claims/1003/tech-complete?completionNote=Motor%20cooling%20sensor%20replaced.%20Motor%20temperature%20now%20normal.
```
**Success Response (200 OK):** Returns WarrantyClaimResponseDTO with status `COMPLETED`

---

#### DELETE /api/warranty-claims/{id}
**Description:** Delete warranty claim (Admin only)
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Warranty claim ID

**Success Response (204 No Content)**

---

#### GET /api/warranty-claims/by-status/{status}
**Description:** Get claims by status
**Authentication:** Required (ADMIN, SC_STAFF, SC_TECHNICIAN)
**Path Parameters:**
- `status` (string): Claim status

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<WarrantyClaimResponseDTO>

---

#### GET /api/warranty-claims/admin-pending
**Description:** Get claims pending admin approval
**Authentication:** Required (ADMIN)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<WarrantyClaimResponseDTO>

---

#### GET /api/warranty-claims/tech-pending
**Description:** Get claims pending technician action
**Authentication:** Required (SC_TECHNICIAN)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<WarrantyClaimResponseDTO> with status `ADMIN_APPROVED`

---

#### POST /api/warranty-claims/{claimId}/assign-to-me
**Description:** Assign claim to current admin
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `claimId` (long): Warranty claim ID

**Success Response (200 OK):** Returns WarrantyClaimResponseDTO with assigned user set

---

#### GET /api/warranty-claims/my-assigned-claims
**Description:** Get claims assigned to current admin
**Authentication:** Required (ADMIN)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<WarrantyClaimResponseDTO>

---

#### GET /api/warranty-claims/my-claims
**Description:** Get customer's own warranty claims
**Authentication:** Required (CUSTOMER)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<WarrantyClaimResponseDTO>

---

#### GET /api/warranty-claims/my-claims/{claimId}
**Description:** Get customer's specific claim
**Authentication:** Required (CUSTOMER)
**Path Parameters:**
- `claimId` (long): Warranty claim ID

**Success Response (200 OK):** Returns WarrantyClaimResponseDTO

---

### Parts Management APIs

Base Path: `/api/parts`

#### GET /api/parts
**Description:** Get parts catalog
**Authentication:** Required (ADMIN, EVM_STAFF, SC_STAFF)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `search` (string, optional): Search in part name or number

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "partId": 201,
      "partName": "Battery Pack",
      "partNumber": "BP-001-LR",
      "manufacturer": "Panasonic",
      "warrantyMonths": 96,
      "createdAt": "2023-01-01T00:00:00"
    }
  ],
  ...
}
```

---

#### GET /api/parts/{id}
**Description:** Get part by ID
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `id` (long): Part ID

**Success Response (200 OK):** Returns PartResponseDTO

---

#### POST /api/parts
**Description:** Create new part
**Authentication:** Required (ADMIN, EVM_STAFF)
**Request Body:**
```json
{
  "partName": "Advanced Driver Assistance Module",
  "partNumber": "ADAM-005",
  "manufacturer": "Mobileye",
  "warrantyMonths": 36
}
```
**Success Response (201 Created):** Returns PartResponseDTO

---

#### PUT /api/parts/{id}
**Description:** Update part
**Authentication:** Required (ADMIN, EVM_STAFF)
**Path Parameters:**
- `id` (long): Part ID

**Request Body:** PartRequestDTO
**Success Response (200 OK):** Returns PartResponseDTO

---

#### DELETE /api/parts/{id}
**Description:** Delete part (Admin only)
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Part ID

**Success Response (204 No Content)**

---

#### GET /api/parts/by-manufacturer
**Description:** Get parts by manufacturer
**Authentication:** Required (All staff roles)
**Query Parameters:**
- `manufacturer` (string, required): Manufacturer name
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<PartResponseDTO>

---

### Part Request APIs

Base Path: `/api/part-requests`

#### Part Request Status Enum
```
PENDING    - Awaiting approval
APPROVED   - Approved, ready to ship
SHIPPED    - In transit
DELIVERED  - Received at service center
REJECTED   - Request denied
CANCELLED  - Cancelled by technician
```

---

#### POST /api/part-requests
**Description:** Create part request (Technician only)
**Authentication:** Required (SC_TECHNICIAN)
**Request Body:**
```json
{
  "warrantyClaimId": 1003,
  "partId": 205,
  "quantity": 1,
  "reason": "Faulty cooling sensor causing motor overheating"
}
```
**Success Response (201 Created):**
```json
{
  "partRequestId": 5001,
  "warrantyClaimId": 1003,
  "partId": 205,
  "partName": "Motor Cooling Sensor",
  "quantity": 1,
  "requestDate": "2024-04-06T11:00:00",
  "status": "PENDING",
  "reason": "Faulty cooling sensor causing motor overheating",
  "requestedBy": "tech_mike",
  "approvedBy": null,
  "approvalDate": null
}
```

---

#### GET /api/part-requests/{id}
**Description:** Get part request by ID
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `id` (long): Part request ID

**Success Response (200 OK):** Returns PartRequestResponseDTO

---

#### GET /api/part-requests
**Description:** Get all part requests
**Authentication:** Required (ADMIN, EVM_STAFF)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `sortBy` (string, default: requestDate)
- `sortDir` (string, default: DESC)

**Success Response (200 OK):** Returns PagedResponse<PartRequestResponseDTO>

---

#### GET /api/part-requests/pending
**Description:** Get pending part requests
**Authentication:** Required (ADMIN, EVM_STAFF)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<PartRequestResponseDTO> with status `PENDING`

---

#### GET /api/part-requests/in-transit
**Description:** Get in-transit part requests
**Authentication:** Required (ADMIN, EVM_STAFF)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<PartRequestResponseDTO> with status `SHIPPED`

---

#### GET /api/part-requests/by-status/{status}
**Description:** Get part requests by status
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `status` (string): Part request status

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<PartRequestResponseDTO>

---

#### GET /api/part-requests/by-claim/{claimId}
**Description:** Get part requests by warranty claim
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `claimId` (long): Warranty claim ID

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<PartRequestResponseDTO>

---

#### GET /api/part-requests/by-service-center/{serviceCenterId}
**Description:** Get part requests by service center
**Authentication:** Required (ADMIN, EVM_STAFF, SC_STAFF)
**Path Parameters:**
- `serviceCenterId` (long): Service center ID

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<PartRequestResponseDTO>

---

#### GET /api/part-requests/my-requests
**Description:** Get technician's own part requests
**Authentication:** Required (SC_TECHNICIAN)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)

**Success Response (200 OK):** Returns PagedResponse<PartRequestResponseDTO>

---

#### PATCH /api/part-requests/{id}/approve
**Description:** Approve part request
**Authentication:** Required (ADMIN, EVM_STAFF)
**Path Parameters:**
- `id` (long): Part request ID

**Query Parameters:**
- `notes` (string, optional): Approval notes

**Success Response (200 OK):** Returns PartRequestResponseDTO with status `APPROVED`

---

#### PATCH /api/part-requests/{id}/reject
**Description:** Reject part request
**Authentication:** Required (ADMIN, EVM_STAFF)
**Path Parameters:**
- `id` (long): Part request ID

**Query Parameters:**
- `rejectionReason` (string, optional): Rejection reason

**Success Response (200 OK):** Returns PartRequestResponseDTO with status `REJECTED`

---

#### PATCH /api/part-requests/{id}/ship
**Description:** Mark part request as shipped
**Authentication:** Required (ADMIN, EVM_STAFF)
**Path Parameters:**
- `id` (long): Part request ID

**Query Parameters:**
- `trackingNumber` (string, optional): Shipment tracking number

**Success Response (200 OK):** Returns PartRequestResponseDTO with status `SHIPPED`

---

#### PATCH /api/part-requests/{id}/deliver
**Description:** Mark part request as delivered
**Authentication:** Required (SC_STAFF, SC_TECHNICIAN)
**Path Parameters:**
- `id` (long): Part request ID

**Success Response (200 OK):** Returns PartRequestResponseDTO with status `DELIVERED`

---

#### PATCH /api/part-requests/{id}/cancel
**Description:** Cancel part request (Technician only)
**Authentication:** Required (SC_TECHNICIAN)
**Path Parameters:**
- `id` (long): Part request ID

**Success Response (200 OK):** Returns PartRequestResponseDTO with status `CANCELLED`

---

#### GET /api/part-requests/statistics
**Description:** Get part request statistics
**Authentication:** Required (ADMIN, EVM_STAFF)

**Success Response (200 OK):**
```json
{
  "pending": 15,
  "approved": 8,
  "shipped": 5,
  "delivered": 50,
  "rejected": 2,
  "cancelled": 3
}
```

---

### Feedback APIs

Base Path: `/api/feedbacks`

#### POST /api/feedbacks
**Description:** Create feedback (Customer only)
**Authentication:** Required (CUSTOMER)
**Request Body:**
```json
{
  "warrantyClaimId": 1001,
  "rating": 5,
  "comment": "Excellent service! Battery replaced quickly."
}
```
**Validation Rules:**
- `warrantyClaimId`: Required
- `rating`: 1-5 (integer, required)
- `comment`: Optional

**Success Response (201 Created):**
```json
{
  "feedbackId": 3001,
  "warrantyClaimId": 1001,
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "rating": 5,
  "comment": "Excellent service! Battery replaced quickly.",
  "createdAt": "2024-03-21T10:00:00",
  "serviceCenterId": 1,
  "serviceCenterName": "Tesla Service Center Hanoi"
}
```

---

#### GET /api/feedbacks/{id}
**Description:** Get feedback by ID
**Authentication:** Required (All roles)
**Path Parameters:**
- `id` (long): Feedback ID

**Success Response (200 OK):** Returns FeedbackResponseDTO

---

#### GET /api/feedbacks/by-claim/{claimId}
**Description:** Get feedback by warranty claim ID
**Authentication:** Required (All roles)
**Path Parameters:**
- `claimId` (long): Warranty claim ID

**Success Response (200 OK):** Returns FeedbackResponseDTO or 404 if not found

---

#### GET /api/feedbacks/by-customer/{customerId}
**Description:** Get feedbacks by customer
**Authentication:** Required (All staff roles + CUSTOMER)
**Path Parameters:**
- `customerId` (UUID): Customer ID

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `sortBy` (string, default: createdAt)
- `sortDir` (string, default: DESC)

**Success Response (200 OK):** Returns PagedResponse<FeedbackResponseDTO>

---

#### GET /api/feedbacks
**Description:** Get all feedbacks
**Authentication:** Required (All staff roles)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `sortBy` (string, default: createdAt)
- `sortDir` (string, default: DESC)

**Success Response (200 OK):** Returns PagedResponse<FeedbackResponseDTO>

---

#### GET /api/feedbacks/by-rating/{rating}
**Description:** Get feedbacks by exact rating
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `rating` (integer): Rating value (1-5)

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `sortBy` (string, default: createdAt)
- `sortDir` (string, default: DESC)

**Success Response (200 OK):** Returns PagedResponse<FeedbackResponseDTO>

---

#### GET /api/feedbacks/min-rating/{rating}
**Description:** Get feedbacks with rating >= specified value
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `rating` (integer): Minimum rating (1-5)

**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `sortBy` (string, default: createdAt)
- `sortDir` (string, default: DESC)

**Success Response (200 OK):** Returns PagedResponse<FeedbackResponseDTO>

---

#### PUT /api/feedbacks/{id}
**Description:** Update feedback (Customer only)
**Authentication:** Required (CUSTOMER)
**Path Parameters:**
- `id` (long): Feedback ID

**Request Body:** FeedbackRequestDTO
**Success Response (200 OK):** Returns FeedbackResponseDTO

---

#### DELETE /api/feedbacks/{id}
**Description:** Delete feedback
**Authentication:** Required (CUSTOMER, ADMIN)
**Path Parameters:**
- `id` (long): Feedback ID

**Success Response (204 No Content)**

---

#### GET /api/feedbacks/statistics/average-rating
**Description:** Get overall average rating
**Authentication:** Required (All staff roles)

**Success Response (200 OK):**
```json
{
  "averageRating": 4.5
}
```

---

#### GET /api/feedbacks/statistics/service-center/{serviceCenterId}/average-rating
**Description:** Get average rating for service center
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `serviceCenterId` (long): Service center ID

**Success Response (200 OK):**
```json
{
  "serviceCenterId": 1,
  "averageRating": 4.7
}
```

---

#### GET /api/feedbacks/statistics/count-by-rating/{rating}
**Description:** Count feedbacks by rating
**Authentication:** Required (All staff roles)
**Path Parameters:**
- `rating` (integer): Rating value (1-5)

**Success Response (200 OK):**
```json
{
  "rating": 5,
  "count": 42
}
```

---

#### GET /api/feedbacks/statistics/summary
**Description:** Get feedback statistics summary
**Authentication:** Required (All staff roles)

**Success Response (200 OK):**
```json
{
  "averageRating": 4.5,
  "ratingCounts": {
    "1": 2,
    "2": 5,
    "3": 15,
    "4": 30,
    "5": 48
  }
}
```

---

### Service Center APIs

Base Path: `/api/service-centers`

#### POST /api/service-centers
**Description:** Create service center (Admin only)
**Authentication:** Required (ADMIN)
**Request Body:**
```json
{
  "name": "VinFast Service Cau Giay",
  "address": "789 Cau Giay, Hanoi",
  "phone": "0247654321",
  "email": "caugiay@vinfastservice.com",
  "latitude": 21.0300,
  "longitude": 105.8000
}
```
**Validation Rules:**
- `name`: Required, unique
- `phone`: Required, unique, Vietnamese format
- `latitude`: -90 to 90
- `longitude`: -180 to 180

**Success Response (201 Created):** Returns ServiceCenterResponseDTO

---

#### GET /api/service-centers/{id}
**Description:** Get service center by ID
**Authentication:** Required (All roles)
**Path Parameters:**
- `id` (long): Service center ID

**Success Response (200 OK):** Returns ServiceCenterResponseDTO

---

#### GET /api/service-centers
**Description:** Get all service centers
**Authentication:** Required (All roles)
**Query Parameters:**
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `sortBy` (string, default: serviceCenterId)
- `sortDir` (string, default: ASC)

**Success Response (200 OK):** Returns PagedResponse<ServiceCenterResponseDTO>

---

#### PUT /api/service-centers/{id}
**Description:** Update service center (Admin only)
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Service center ID

**Request Body:** ServiceCenterRequestDTO
**Success Response (200 OK):** Returns ServiceCenterResponseDTO

---

#### DELETE /api/service-centers/{id}
**Description:** Delete service center (Admin only)
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Service center ID

**Success Response (204 No Content)**

---

#### GET /api/service-centers/search
**Description:** Search service centers
**Authentication:** Required (All roles)
**Query Parameters:**
- `keyword` (string, required): Search term
- `page` (integer, default: 0)
- `size` (integer, default: 10)
- `sortBy` (string, default: serviceCenterId)
- `sortDir` (string, default: ASC)

**Success Response (200 OK):** Returns PagedResponse<ServiceCenterResponseDTO>

---

#### GET /api/service-centers/nearby
**Description:** Find nearby service centers
**Authentication:** Required (All roles)
**Query Parameters:**
- `latitude` (decimal, required): User latitude (-90 to 90)
- `longitude` (decimal, required): User longitude (-180 to 180)
- `radius` (decimal, default: 10.0): Search radius in kilometers

**Success Response (200 OK):**
```json
[
  {
    "serviceCenterId": 1,
    "name": "Tesla Service Center Hanoi",
    "address": "123 Ba Dinh, Hanoi",
    "phone": "0241234567",
    "email": "hanoi@teslaservice.com",
    "latitude": 21.0350,
    "longitude": 105.8450
  },
  ...
]
```

---

#### GET /api/service-centers/ordered-by-distance
**Description:** Get all service centers ordered by distance from location
**Authentication:** Required (All roles)
**Query Parameters:**
- `latitude` (decimal, required)
- `longitude` (decimal, required)

**Success Response (200 OK):** Returns List<ServiceCenterResponseDTO> ordered by distance (nearest first)

---

#### PATCH /api/service-centers/{id}/location
**Description:** Update service center location (Admin only)
**Authentication:** Required (ADMIN)
**Path Parameters:**
- `id` (long): Service center ID

**Query Parameters:**
- `latitude` (decimal, required)
- `longitude` (decimal, required)

**Success Response (200 OK):** Returns ServiceCenterResponseDTO

---

## Error Handling

### Standard Error Response Format

```json
{
  "timestamp": "2024-04-05T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: password must be at least 6 characters",
  "path": "/api/auth/register"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH request |
| 201 | Created | Successful POST request creating a resource |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for requested action |
| 404 | Not Found | Requested resource does not exist |
| 409 | Conflict | Resource already exists (duplicate username/email) |
| 500 | Internal Server Error | Unexpected server error |

### Common Error Scenarios

#### 1. Validation Errors (400)
```json
{
  "timestamp": "2024-04-05T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed on field 'email': must be a valid email address",
  "path": "/api/auth/register"
}
```

#### 2. Authentication Required (401)
```json
{
  "timestamp": "2024-04-05T14:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Access token is missing or invalid",
  "path": "/api/customers"
}
```

#### 3. Insufficient Permissions (403)
```json
{
  "timestamp": "2024-04-05T14:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "User does not have required role: ADMIN",
  "path": "/api/admin/users"
}
```

#### 4. Resource Not Found (404)
```json
{
  "timestamp": "2024-04-05T14:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Customer with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "path": "/api/customers/550e8400-e29b-41d4-a716-446655440000"
}
```

#### 5. Duplicate Resource (409)
```json
{
  "timestamp": "2024-04-05T14:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Username 'john_doe' is already taken",
  "path": "/api/auth/register"
}
```

---

## Pagination

### Request Parameters

All paginated endpoints accept these parameters:

```
GET /api/customers?page=2&size=20
```

- **page** (integer, default: 0): Zero-indexed page number
- **size** (integer, default: 10, max: 100): Items per page

### Response Structure

```json
{
  "content": [ /* array of items */ ],
  "page": 2,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": false,
  "last": false
}
```

**Response Fields:**
- **content**: Array of items for current page
- **page**: Current page number (0-indexed)
- **size**: Items per page
- **totalElements**: Total number of items across all pages
- **totalPages**: Total number of pages
- **first**: Boolean indicating if this is the first page
- **last**: Boolean indicating if this is the last page

### Navigation Examples

**First page:**
```
GET /api/customers?page=0&size=10
```

**Next page:**
```
GET /api/customers?page=1&size=10
```

**Last page calculation:**
```
lastPage = totalPages - 1
GET /api/customers?page=7&size=10
```

**Check if more pages exist:**
```javascript
hasNextPage = !response.last
hasPreviousPage = !response.first
```

---

## Additional Resources

- **OpenAPI Specification:** See `API_SPECIFICATION.json` for complete OpenAPI 3.0 schema
- **Data Flow Scenarios:** See `DATA_FLOW_SCENARIOS.md` for detailed user workflows
- **Postman Collection:** (Can be generated from OpenAPI spec)

---

**Last Updated:** 2024-11-05
**API Version:** 1.0.0
**Documentation Version:** 1.0
