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
Request:
```json
{
  "username": "admin",
  "password": "password123"
}
```

Response (200):
```json
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
Request:
```json
{
  "username": "newcustomer",
  "email": "customer@example.com",
  "password": "password123",
  "address": "123 Main St, Ho Chi Minh City"
}
```

Response (201):
```json
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
Request:
```json
{
  "username": "new_staff",
  "email": "staff@example.com",
  "password": "password123",
  "address": "456 Staff St, Ho Chi Minh City",
  "roleId": 2
}
```

Response (201):
```json
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
Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

Response (200):
```json
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
Request:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

Response (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 6. Validate Token
**GET** `/api/auth/validate`
**Headers:** `Authorization: Bearer {access_token}`
Response (200):
```json
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

Response (200):
```json
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
Request:
```json
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

Response (200):
```json
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
Request:
```json
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
Response (200):
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
Request:
```json
{
  "description": "Battery replacement under warranty",
  "partId": 1,
  "vehicleId": 1
}
```

Response (201):
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
**Permissions:** ADMIN only

### 4. Update Service History
**PUT** `/api/service-histories/{id}`
**Permissions:** ADMIN only

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
Response (200):
```json
{
  "username": "admin",
  "roles": ["ADMIN"],
  "isAuthenticated": true,
  "hasAdminRole": true,
  "hasStaffRole": false,
  "hasCustomerRole": false
}
```

---

# 👤 USER MANAGEMENT API (ADMIN ONLY)

## Base URL: `/api/admin/users`

**⚠️ IMPORTANT:** All User Management endpoints require ADMIN role only. No other roles can access these endpoints.

### Get All Users
**GET** `/api/admin/users`
**Permissions:** ADMIN only
**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)  
- `search` (optional): Search by username or email
- `role` (optional): Filter by role name

Response (200):
```json
{
  "content": [
    {
      "userId": 1,
      "username": "admin",
      "email": "admin@company.com",
      "address": "Admin Office, District 1, Ho Chi Minh City",
      "roleName": "ADMIN",
      "roleId": 1,
      "createdAt": "2024-01-01T10:00:00.000+00:00"
    },
    {
      "userId": 5,
      "username": "john_customer",
      "email": "john@email.com",
      "address": "123 Main St, Ho Chi Minh City", 
      "roleName": "CUSTOMER",
      "roleId": 5,
      "createdAt": "2024-01-15T10:30:00.000+00:00"
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

### Get User by ID
**GET** `/api/admin/users/{userId}`
**Permissions:** ADMIN only
Response (200):
```json
{
  "userId": 5,
  "username": "john_customer",
  "email": "john@email.com",
  "address": "123 Main St, Ho Chi Minh City",
  "roleName": "CUSTOMER", 
  "roleId": 5,
  "createdAt": "2024-01-15T10:30:00.000+00:00"
}
```

Error Response (404):
```json
{
  "success": false,
  "message": "User not found with id: 999"
}
```

### Search Users
**GET** `/api/admin/users/search?username={username}`
**Permissions:** ADMIN only
**Query Parameters:**
- `username` (required): Username to search for (partial match)
- `page`, `size`: Standard pagination

Response (200):
```json
{
  "content": [
    {
      "userId": 5,
      "username": "john_customer",
      "email": "john@email.com",
      "address": "123 Main St",
      "roleName": "CUSTOMER",
      "roleId": 5,
      "createdAt": "2024-01-15T10:30:00.000+00:00"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### Get Users by Role  
**GET** `/api/admin/users/by-role/{roleName}`
**Permissions:** ADMIN only
**Path Parameters:**
- `roleName`: ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER

Response (200):
```json
{
  "content": [
    {
      "userId": 8,
      "username": "jane_staff",
      "email": "jane@company.com",
      "address": "456 Office St, Hanoi",
      "roleName": "SC_STAFF",
      "roleId": 3,
      "createdAt": "2024-02-20T14:15:00.000+00:00"
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

### Update User Information
**PUT** `/api/admin/users/{userId}`
**Permissions:** ADMIN only
Request:
```json
{
  "username": "updated_username",
  "email": "newemail@company.com",
  "address": "New Address 123, District 1, Ho Chi Minh City"
}
```

Response (200):
```json
{
  "success": true,
  "message": "User updated successfully",
  "userId": 5,
  "updatedFields": ["email", "address"],
  "user": {
    "userId": 5,
    "username": "john_customer",
    "email": "newemail@company.com",
    "address": "New Address 123, District 1, Ho Chi Minh City",
    "roleName": "CUSTOMER",
    "roleId": 5,
    "createdAt": "2024-01-15T10:30:00.000+00:00"
  }
}
```

Error Response (400):
```json
{
  "success": false,
  "message": "Email already exists: duplicate@email.com"
}
```

### Update User Role
**PATCH** `/api/admin/users/{userId}/role?newRoleId={roleId}`
**Permissions:** ADMIN only
**⚠️ Use with extreme caution - affects user permissions immediately**
Response (200):
```json
{
  "success": true,
  "message": "User role updated successfully",
  "userId": 5,
  "newRoleId": 3,
  "newRoleName": "SC_STAFF",
  "user": {
    "userId": 5,
    "username": "john_customer",
    "email": "john@email.com",
    "address": "123 Main St",
    "roleName": "SC_STAFF",
    "roleId": 3,
    "createdAt": "2024-01-15T10:30:00.000+00:00"
  }
}
```

Error Response (400):
```json
{
  "success": false,
  "message": "Role not found with id: 999"
}
```

### Reset User Password
**POST** `/api/admin/users/{userId}/reset-password`
**Permissions:** ADMIN only
**Query Parameters:**
- `newPassword` (optional): If not provided, generates random secure password

Auto-generated password response:
Response (200):
```json
{
  "success": true,
  "message": "User password reset successfully", 
  "userId": 5,
  "newPassword": "A8k9L2mN5pQ7",
  "note": "Please share this password securely with the user"
}
```

Custom password response:
Response (200):
```json
{
  "success": true,
  "message": "User password reset successfully",
  "userId": 5
}
```

### Delete User
**DELETE** `/api/admin/users/{userId}`
**Permissions:** ADMIN only
**⚠️ EXTREME CAUTION: Implements soft delete to preserve data integrity**
Response (200):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "userId": 5
}
```

Error Response (400):
```json
{
  "success": false,
  "message": "Cannot delete user: User has active warranty claims"
}
```

### Get User Statistics
**GET** `/api/admin/users/statistics`
**Permissions:** ADMIN only
Response (200):
```json
{
  "totalUsers": 125,
  "activeUsers": 125,
  "inactiveUsers": 0,
  "usersByRole": {
    "ADMIN": 2,
    "EVM_STAFF": 8,
    "SC_STAFF": 15,
    "SC_TECHNICIAN": 25,
    "CUSTOMER": 75
  },
  "recentRegistrations": [
    {
      "userId": 125,
      "username": "newest_user",
      "email": "newest@email.com",
      "roleName": "CUSTOMER",
      "createdAt": "2024-10-14T08:30:00.000+00:00"
    },
    {
      "userId": 124,
      "username": "recent_staff",
      "email": "staff@company.com", 
      "roleName": "SC_STAFF",
      "createdAt": "2024-10-13T16:45:00.000+00:00"
    }
  ]
}
```

## 🚨 SECURITY MATRIX

| Endpoint Category     | ADMIN      | EVM_STAFF         | SC_STAFF         | SC_TECHNICIAN     | CUSTOMER        |
|----------------------|------------|-------------------|------------------|-------------------|----------------|
| **Auth**             | ✅ All      | ✅ All             | ✅ Register       | ✅ All            | ✅ Basic        |
| **Customers**        | ✅ CRUD     | ✅ CRU             | ✅ CRUD           | ❌                | ✅ Profile      |
| **Vehicles**         | ✅ CRUD     | ✅ CRUD            | ✅ CRUD           | ❌                | ✅ Own only     |
| **Parts**            | ✅ CRUD     | ✅ CRU             | ✅ Read           | ✅ Read           | ✅ Read         |
| **Warranty Claims**  | ✅ CRUD     | ✅ Accept/Reject   | ✅ CRUD + Create  | ✅ Process        | ✅ Own only     |
| **Service Histories**| ✅ CRUD     | ✅ CRUD            | ✅ CRUD           | ✅ CRUD           | ✅ Own only     |
| **User Info**        | ✅ All      | ❌                | ✅ Some           | ❌                | ❌             |
| **User Management**  | ✅ Full CRUD| ❌                | ❌                | ❌                | ❌             |

**Legend:** C=Create, R=Read, U=Update, D=Delete

## 🔐 User Management API Security Details

### ADMIN-ONLY Endpoints:
- **GET** `/api/admin/users` - List all users with filtering
- **GET** `/api/admin/users/{id}` - Get user details
- **GET** `/api/admin/users/search` - Search users by username
- **GET** `/api/admin/users/by-role/{role}` - Filter users by role
- **PUT** `/api/admin/users/{id}` - Update user information
- **PATCH** `/api/admin/users/{id}/role` - Change user role
- **DELETE** `/api/admin/users/{id}` - Delete user (soft delete)
- **POST** `/api/admin/users/{id}/reset-password` - Reset user password
- **GET** `/api/admin/users/statistics` - Get user statistics

