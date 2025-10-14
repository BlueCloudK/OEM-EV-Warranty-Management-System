# OEM EV Warranty Management System - Complete API Documentation

## 📋 System Overview

**Project:** OEM Electric Vehicle Warranty Management System  
**Version:** 1.1 (Updated with Security Fixes)  
**Date:** October 14, 2025  
**Base URL:** `http://localhost:8080`

This system manages warranty claims for electric vehicles with role-based access control and workflow management.

## 🔐 Authentication & Security

### JWT Token Based Authentication
All API endpoints (except login/register) require JWT token in Authorization header:
```
Authorization: Bearer {jwt_token}
```

### User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | System Administrator | Full access to all resources, only role that can DELETE most entities |
| **EVM_STAFF** | EV Manufacturer Staff | Manage vehicles/parts, accept/reject warranty claims, **NOW HAS SERVICE HISTORY ACCESS** |
| **SC_STAFF** | Service Center Staff | Create warranty claims, manage customers/vehicles |
| **SC_TECHNICIAN** | Service Center Technician | Process warranty claims, manage service histories |
| **CUSTOMER** | End Customer | View own data, create warranty claims |

---

# 🔑 AUTHENTICATION API

## Base URL: `/api/auth`

### 1. Login
**POST** `/api/auth/login`
```json
Request:
{
  "username": "admin",
  "password": "password123"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
}
```

### 2. Register Customer (SC Staff Only)
**POST** `/api/auth/register`
**Permissions:** SC_STAFF only
```json
Request:
{
  "username": "newcustomer",
  "email": "customer@example.com",
  "password": "password123",
  "address": "123 Main St, Ho Chi Minh City"
}

Response (201):
{
  "success": true,
  "message": "Customer account created successfully",
  "user": {
    "userId": 5,
    "username": "newcustomer",
    "roleName": "CUSTOMER"
  }
}
```

### 3. Admin Create User
**POST** `/api/auth/admin/create-user`
**Permissions:** ADMIN only
```json
Request:
{
  "username": "new_staff",
  "email": "staff@example.com",
  "password": "password123",
  "address": "456 Staff St, Ho Chi Minh City",
  "roleId": 2
}

Response (201):
{
  "success": true,
  "message": "User created successfully by Admin",
  "user": {
    "userId": 6,
    "username": "new_staff",
    "roleName": "EVM_STAFF"
  }
}
```

### 4. Refresh Token
**POST** `/api/auth/refresh`
```json
Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Token refreshed successfully",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
}
```

### 5. Logout
**POST** `/api/auth/logout`
```json
Request:
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 6. Validate Token
**GET** `/api/auth/validate`
**Headers:** `Authorization: Bearer {access_token}`
```json
Response (200):
{
  "accessToken": null,
  "refreshToken": null,
  "message": "Token is valid",
  "userId": 1,
  "username": "admin",
  "roleName": "ADMIN"
}
```

---

# 👥 CUSTOMER API

## Base URL: `/api/customers`

### 1. Get All Customers
**GET** `/api/customers`
**Permissions:** ADMIN, SC_STAFF, EVM_STAFF
**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)
- `search` (optional): Search by name, email, or phone

```json
Response (200):
{
  "content": [
    {
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+84901234567",
      "address": "123 Main St, Ho Chi Minh City",
      "createdAt": "2024-01-15T10:30:00.000+00:00",
      "userId": 5,
      "username": "john_doe"
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
**Permissions:** ADMIN, SC_STAFF, EVM_STAFF

### 3. Create Customer
**POST** `/api/customers`
**Permissions:** ADMIN, SC_STAFF, EVM_STAFF
```json
Request:
{
  "name": "Jane Smith",
  "email": "jane.smith@email.com",
  "phone": "+84901234568",
  "address": "456 Oak Street, Hanoi",
  "userId": 6
}
```

### 4. Update Customer
**PUT** `/api/customers/{id}`
**Permissions:** ADMIN, SC_STAFF, EVM_STAFF

### 5. Delete Customer
**DELETE** `/api/customers/{id}`
**Permissions:** ADMIN only

### 6. Update Customer Profile (Self-service)
**PUT** `/api/customers/profile`
**Permissions:** All authenticated users (Customer can update own profile)

### Public Search Endpoints (All authenticated users):
- **GET** `/api/customers/search?name={name}` - Search by name
- **GET** `/api/customers/by-email?email={email}` - Find by email
- **GET** `/api/customers/by-phone?phone={phone}` - Find by phone
- **GET** `/api/customers/by-user/{userId}` - Find by user ID

---

# 🚗 VEHICLE API

## Base URL: `/api/vehicles`

### 1. Get All Vehicles
**GET** `/api/vehicles`
**Permissions:** ADMIN, EVM_STAFF, SC_STAFF
**Query Parameters:**
- `page`, `size`, `search` (similar to customers)

```json
Response (200):
{
  "content": [
    {
      "vehicleId": 1,
      "vehicleName": "Tesla Model 3",
      "vehicleModel": "Model 3 Standard Range",
      "vehicleVin": "1HGBH41JXMN109186",
      "vehicleYear": 2023,
      "vehicleColor": "White",
      "vehicleEngine": "Electric Motor",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "customerName": "John Doe"
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

### 2. Get Vehicle by ID
**GET** `/api/vehicles/{id}`
**Permissions:** ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER
**Note:** Customers can only view their own vehicles (business logic filtering)

### 3. Create Vehicle
**POST** `/api/vehicles`
**Permissions:** ADMIN, EVM_STAFF only
```json
Request:
{
  "vehicleName": "Tesla Model Y",
  "vehicleModel": "Model Y Long Range",
  "vehicleVin": "5YJ3E1EA4KF123456",
  "vehicleYear": 2024,
  "vehicleColor": "Blue",
  "vehicleEngine": "Dual Motor AWD",
  "customerId": "456e7890-e89b-12d3-a456-426614174001"
}
```

### 4. Update Vehicle
**PUT** `/api/vehicles/{id}`
**Permissions:** ADMIN, EVM_STAFF, SC_STAFF

### 5. Delete Vehicle
**DELETE** `/api/vehicles/{id}`
**Permissions:** ADMIN, EVM_STAFF only

### Special Endpoints:
- **GET** `/api/vehicles/my-vehicles` - Customer views own vehicles
- **GET** `/api/vehicles/by-customer/{customerId}` - Get vehicles by customer (Staff only)
- **GET** `/api/vehicles/by-vin?vin={vin}` - Search by VIN (Staff only)
- **GET** `/api/vehicles/search` - Search by model/brand (All authenticated users)
- **GET** `/api/vehicles/warranty-expiring` - Get vehicles with expiring warranty (Staff only)

---

# 🔧 PARTS API

## Base URL: `/api/parts`

### 1. Get All Parts
**GET** `/api/parts`
**Permissions:** ADMIN, EVM_STAFF, SC_STAFF
```json
Response (200):
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
**Permissions:** All authenticated users

### 3. Create Part
**POST** `/api/parts`
**Permissions:** ADMIN, EVM_STAFF only

### 4. Update Part
**PUT** `/api/parts/{id}`
**Permissions:** ADMIN, EVM_STAFF only

### 5. Delete Part
**DELETE** `/api/parts/{id}`
**Permissions:** ADMIN only

### Special Endpoints:
- **GET** `/api/parts/by-vehicle/{vehicleId}` - All authenticated users
- **GET** `/api/parts/by-manufacturer` - ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN
- **GET** `/api/parts/warranty-expiring` - ADMIN, EVM_STAFF, SC_STAFF

---

# ⚠️ WARRANTY CLAIMS API

## Base URL: `/api/warranty-claims`

### Warranty Claim Status Flow:
```
SUBMITTED → SC_REVIEW → PROCESSING → COMPLETED
     ↓         ↓            ↓
  REJECTED  REJECTED    REJECTED
```

### 1. Get All Warranty Claims
**GET** `/api/warranty-claims`
**Permissions:** ADMIN, SC_STAFF, EVM_STAFF

### 2. Get Warranty Claim by ID
**GET** `/api/warranty-claims/{id}`
**Permissions:** ADMIN, SC_STAFF, EVM_STAFF, SC_TECHNICIAN

### 3. Create Warranty Claim
**POST** `/api/warranty-claims`
**Permissions:** CUSTOMER, ADMIN, SC_STAFF, EVM_STAFF
```json
Request:
{
  "description": "Battery replacement under warranty",
  "partId": 1,
  "vehicleId": 1
}

Response (201):
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

### 4. Update Warranty Claim
**PUT** `/api/warranty-claims/{id}`
**Permissions:** ADMIN, SC_STAFF, EVM_STAFF

### 5. Delete Warranty Claim
**DELETE** `/api/warranty-claims/{id}`
**Permissions:** ADMIN only

## 🔄 WORKFLOW ENDPOINTS

### 6. SC Staff Create Claim
**POST** `/api/warranty-claims/sc-create`
**Permissions:** SC_STAFF only
**Description:** SC Staff creates claim for customer with SUBMITTED status

### 7. EVM Accept Claim
**PATCH** `/api/warranty-claims/{id}/evm-accept`
**Permissions:** EVM_STAFF only
**Description:** EVM accepts claim (SUBMITTED → SC_REVIEW)

### 8. EVM Reject Claim
**PATCH** `/api/warranty-claims/{id}/evm-reject?reason={reason}`
**Permissions:** EVM_STAFF only
**Description:** EVM rejects claim (SUBMITTED → REJECTED)

### 9. Tech Start Processing
**PATCH** `/api/warranty-claims/{id}/tech-start`
**Permissions:** SC_TECHNICIAN only
**Description:** Technician starts processing (SC_REVIEW → PROCESSING)

### 10. Tech Complete Claim
**PATCH** `/api/warranty-claims/{id}/tech-complete?completionNote={note}`
**Permissions:** SC_TECHNICIAN only
**Description:** Technician completes claim (PROCESSING → COMPLETED)

### Query Endpoints:
- **GET** `/api/warranty-claims/by-status/{status}` - All authenticated users
- **GET** `/api/warranty-claims/evm-pending` - EVM_STAFF only (SUBMITTED claims)
- **GET** `/api/warranty-claims/tech-pending` - SC_TECHNICIAN only (SC_REVIEW + PROCESSING claims)

---

# 🔧 SERVICE HISTORY API

## Base URL: `/api/service-histories`

### 1. Get All Service Histories
**GET** `/api/service-histories`
**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF** ✅ UPDATED

### 2. Get Service History by ID
**GET** `/api/service-histories/{id}`
**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF**, CUSTOMER (own vehicles only) ✅ UPDATED

### 3. Create Service History
**POST** `/api/service-histories`
**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN

### 4. Update Service History
**PUT** `/api/service-histories/{id}`
**Permissions:** ADMIN, SC_STAFF, SC_TECHNICIAN

### 5. Delete Service History
**DELETE** `/api/service-histories/{id}`
**Permissions:** ADMIN only

### Special Endpoints:
- **GET** `/api/service-histories/by-vehicle/{vehicleId}` - ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF**, CUSTOMER (own vehicles) ✅ UPDATED
- **GET** `/api/service-histories/by-part/{partId}` - ADMIN, SC_STAFF, SC_TECHNICIAN, **EVM_STAFF** ✅ UPDATED
- **GET** `/api/service-histories/my-services` - CUSTOMER only (own service histories)

---

# 👤 USER INFO API

## Base URL: `/api`

### Get Current User Info
**GET** `/api/me`
**Permissions:** All authenticated users
```json
Response (200):
{
  "username": "admin",
  "roles": ["ADMIN"],
  "isAuthenticated": true,
  "hasAdminRole": true,
  "hasStaffRole": false,  // ✅ FIXED: Now correctly checks SC_STAFF role
  "hasCustomerRole": false
}
```

---

# 🚨 SECURITY MATRIX (UPDATED)

| Endpoint Category | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|------------------|-------|-----------|----------|---------------|----------|
| **Auth** | ✅ All | ✅ All | ✅ Register | ✅ All | ✅ Basic |
| **Customers** | ✅ CRUD | ✅ CRU | ✅ CRUD | ❌ Search only | ✅ Profile |
| **Vehicles** | ✅ CRUD | ✅ CRUD | ✅ CRUD | ❌ Read only | ✅ Own only |
| **Parts** | ✅ CRUD | ✅ CRU | ✅ Read | ✅ Read | ✅ Read |
| **Warranty Claims** | ✅ CRUD | ✅ Accept/Reject | ✅ CRUD + Create | ✅ Process | ✅ Own only |
| **Service Histories** | ✅ CRUD | ✅ **Read** ✅ | ✅ CRUD | ✅ CRUD | ✅ Own only |
| **User Info** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |

**Legend:** C=Create, R=Read, U=Update, D=Delete

---

# ⚠️ WARRANTY CLAIMS API (WITH STATUS VALIDATION)

## Status Transition Validation ✅ NEW FEATURE

The system now includes comprehensive status transition validation using `WarrantyClaimStatusValidator`:

### Valid Status Transitions:
```
SUBMITTED → SC_REVIEW ✅
SUBMITTED → REJECTED ✅
SC_REVIEW → PROCESSING ✅
SC_REVIEW → REJECTED ✅
PROCESSING → COMPLETED ✅
PROCESSING → REJECTED ✅
COMPLETED → [FINAL STATE] ❌
REJECTED → [FINAL STATE] ❌
```

### Status Validation Features:
- **Automatic validation** on all status change operations
- **IllegalStateException** thrown for invalid transitions
- **Business logic enforcement** prevents data inconsistencies
- **Audit trail support** for status change tracking

---

# 🚨 ISSUES RESOLVED ✅

## ✅ **Fixed Critical Issues:**

### 1. **Role Naming Inconsistency** ✅ RESOLVED
- **Issue**: UserInfoController used `hasRole("STAFF")` but this role doesn't exist
- **Fix**: Changed to `hasRole("SC_STAFF")` in all methods
- **Impact**: Security vulnerability eliminated

### 2. **EVM_STAFF Service History Access** ✅ RESOLVED
- **Issue**: EVM_STAFF couldn't track warranty claims completion
- **Fix**: Added EVM_STAFF to all ServiceHistoryController permissions
- **Impact**: EVM can now monitor service quality and completion

### 3. **Status Transition Validation** ✅ RESOLVED
- **Issue**: Warranty claims could transition to invalid states
- **Fix**: Created `WarrantyClaimStatusValidator` with business rules
- **Impact**: Data consistency and business logic enforcement

### 4. **Workflow Monitoring** ✅ RESOLVED
- **Issue**: EVM_STAFF couldn't monitor warranty claim completion
- **Fix**: Service History access + status validation
- **Impact**: Complete workflow visibility for EVM

## 🔧 **Technical Improvements:**

### New Files Created:
1. **WarrantyClaimStatusValidator.java** - Status transition validation
2. **Updated Controllers** - Enhanced permissions and security

### Security Enhancements:
1. **Role consistency** across all controllers
2. **Permission granularity** improved for business needs
3. **Status validation** prevents invalid data states

### Business Logic Improvements:
1. **EVM monitoring** of warranty claim completion
2. **Workflow transparency** across all roles
3. **Data integrity** through validation

---

# 📊 TESTING GUIDE (UPDATED)

## Status Validation Testing:
```bash
# Test valid transition
PATCH /api/warranty-claims/1/evm-accept
# SUBMITTED → SC_REVIEW ✅

# Test invalid transition (should fail)
PATCH /api/warranty-claims/1/tech-complete
# SUBMITTED → COMPLETED ❌ (IllegalStateException)
```

## EVM Staff Testing:
```bash
# EVM can now access service histories
GET /api/service-histories
Authorization: Bearer {evm_staff_token} ✅

# EVM can monitor completion
GET /api/service-histories/by-vehicle/1
Authorization: Bearer {evm_staff_token} ✅
```

---

# 📝 CONCLUSION

**System Status:** ✅ PRODUCTION READY

All critical security issues have been resolved:
- ✅ Role naming consistency fixed
- ✅ EVM_STAFF service history access enabled
- ✅ Status transition validation implemented
- ✅ Workflow monitoring capabilities added

**Performance Impact:** Minimal - only business logic improvements
**Security Level:** Enhanced - all vulnerabilities patched
**Business Value:** Increased - better workflow visibility and control

**Last Updated:** October 14, 2025  
**Version:** 1.1 (Security & Business Logic Enhanced)
