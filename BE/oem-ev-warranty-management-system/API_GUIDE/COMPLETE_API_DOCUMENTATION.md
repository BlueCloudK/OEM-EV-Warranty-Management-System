# Complete API Documentation - OEM EV Warranty Management System

**Last Updated:** October 23, 2025
**Base URL:** `http://localhost:8080`
**Authentication:** JWT Bearer Token (except public endpoints)

---

## 📋 Table of Contents
1. [Authentication APIs](#1-authentication-apis) - `/api/auth`
2. [User Management APIs](#2-user-management-apis) - `/api/admin/users`
3. [Customer APIs](#3-customer-apis) - `/api/customers`
4. [Vehicle APIs](#4-vehicle-apis) - `/api/vehicles`
5. [Part APIs](#5-part-apis) - `/api/parts`
6. [Installed Part APIs](#6-installed-part-apis) - `/api/installed-parts`
7. [Warranty Claim APIs](#7-warranty-claim-apis) - `/api/warranty-claims`
8. [Service History APIs](#8-service-history-apis) - `/api/service-histories`
9. [Service Center APIs](#9-service-center-apis) - `/api/service-centers`
10. [Feedback APIs](#10-feedback-apis) - `/api/feedbacks`
11. [Work Log APIs](#11-work-log-apis) - `/api/work-logs`
12. [User Info APIs](#12-user-info-apis) - `/api/me`

---

## 🔐 Quick Security Reference

| Role | Access Level |
|------|-------------|
| **ADMIN** | Full access to everything |
| **EVM_STAFF** | Vehicles, Parts, Warranty Claims, Service Histories, Work Logs |
| **SC_STAFF** | Customers, Vehicles (read Parts), Warranty Claims, Service Histories, Service Centers, Feedbacks, Work Logs |
| **SC_TECHNICIAN** | Vehicles (read), Warranty Claims (process), Service Histories, Installed Parts (read), Service Centers (read) |
| **CUSTOMER** | Own vehicles/histories, **🆕 Own warranty claims (view only)**, Feedbacks, Service Centers (read) |

**Authentication:** `Authorization: Bearer <token>`

---

## 1. Authentication APIs

**Base Path:** `/api/auth`
**Role Requirements:** Public (except where noted)

### 1.1 Login 🔓
```http
POST /api/auth/login

{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer"
}
```

### 1.2 Register 🔓
```http
POST /api/auth/register

{
  "username": "string",
  "password": "string",
  "email": "user@example.com",
  "fullName": "string",
  "phoneNumber": "string"
}
```

### 1.3 Refresh Token 🔓
```http
POST /api/auth/refresh

{
  "refreshToken": "string"
}
```

### 1.4 Create User (Admin) 👤 ADMIN
```http
POST /api/auth/admin/create-user

{
  "username": "string",
  "password": "string",
  "email": "user@example.com",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "ADMIN|EVM_STAFF|SC_STAFF|SC_TECHNICIAN"
}
```

### 1.5 Register Customer (Staff) 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
POST /api/auth/staff/register-customer

{
  "username": "string",
  "password": "string",
  "email": "user@example.com",
  "fullName": "string",
  "phoneNumber": "string",
  "address": "string"
}
```

### 1.6 Forgot Password 🔓
```http
POST /api/auth/forgot-password

{
  "email": "user@example.com"
}
```

### 1.7 Reset Password 🔓
```http
POST /api/auth/reset-password

{
  "token": "string",
  "newPassword": "string"
}
```

### 1.8 Logout 🔒 Authenticated
```http
POST /api/auth/logout
```

### 1.9 Validate Token 🔒 Authenticated
```http
GET /api/auth/validate
```

---

## 2. User Management APIs

**Base Path:** `/api/admin/users`
**Role Requirements:** 👤 ADMIN only

### 2.1 Get All Users
```http
GET /api/admin/users?page=0&size=10&search=keyword
```

### 2.2 Get User By ID
```http
GET /api/admin/users/{userId}
```

### 2.3 Update User
```http
PUT /api/admin/users/{userId}

{
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "string",
  "enabled": true
}
```

### 2.4 Delete User
```http
DELETE /api/admin/users/{userId}
```

---

## 3. Customer APIs

**Base Path:** `/api/customers`

### 3.1 Get All Customers 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/customers?page=0&size=10&search=keyword
```

### 3.2 Get Customer By ID 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/customers/{customerId}
```

### 3.3 Create Customer 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
POST /api/customers

{
  "fullName": "string",
  "email": "user@example.com",
  "phoneNumber": "string",
  "address": "string"
}
```

### 3.4 Update Customer 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
PUT /api/customers/{customerId}

{
  "fullName": "string",
  "email": "user@example.com",
  "phoneNumber": "string",
  "address": "string"
}
```

### 3.5 Delete Customer 👤 ADMIN
```http
DELETE /api/customers/{customerId}
```

---

## 4. Vehicle APIs

**Base Path:** `/api/vehicles`

### 4.1 Get All Vehicles 🔒 All roles
```http
GET /api/vehicles?page=0&size=10&search=keyword
```

### 4.2 Get Vehicle By ID 🔒 All roles
```http
GET /api/vehicles/{vehicleId}
```

### 4.3 Create Vehicle 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
POST /api/vehicles

{
  "vehicleName": "Tesla Model 3",
  "vehicleVin": "5YJ3E1EA5KF123456",
  "modelYear": 2024,
  "customerId": "uuid"
}
```

### 4.4 Update Vehicle 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
PUT /api/vehicles/{vehicleId}

{
  "vehicleName": "string",
  "modelYear": 2024
}
```

### 4.5 Delete Vehicle 👤 ADMIN
```http
DELETE /api/vehicles/{vehicleId}
```

### 4.6 Get Vehicles By Customer 🔒 All roles
```http
GET /api/vehicles/by-customer/{customerId}?page=0&size=10
```

---

## 5. Part APIs

**Base Path:** `/api/parts`
**Role Requirements:** 👥 ADMIN, EVM_STAFF, SC_STAFF

### 5.1 Get All Parts
```http
GET /api/parts?page=0&size=10&search=keyword
```

### 5.2 Get Part By ID
```http
GET /api/parts/{partId}
```

### 5.3 Create Part 👥 ADMIN, EVM_STAFF
```http
POST /api/parts

{
  "partId": "PART-001",
  "partName": "Battery Pack",
  "partNumber": "BP-12345",
  "manufacturer": "LG Chem",
  "price": 5000.00
}
```

### 5.4 Update Part 👥 ADMIN, EVM_STAFF
```http
PUT /api/parts/{partId}

{
  "partName": "string",
  "manufacturer": "string",
  "price": 5500.00
}
```

### 5.5 Delete Part 👤 ADMIN
```http
DELETE /api/parts/{partId}
```

---

## 6. Installed Part APIs

**Base Path:** `/api/installed-parts`

### 6.1 Get All Installed Parts 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/installed-parts?page=0&size=10
```

### 6.2 Get Installed Part By ID 🔒 ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER
```http
GET /api/installed-parts/{installedPartId}
```

### 6.3 Create Installed Part 👥 ADMIN, SC_STAFF
```http
POST /api/installed-parts

{
  "installedPartId": "INST-001",
  "partId": "PART-001",
  "vehicleId": 1,
  "installationDate": "2024-10-22",
  "warrantyExpirationDate": "2026-10-22"
}
```

### 6.4 Update Installed Part 👥 ADMIN, SC_STAFF
```http
PUT /api/installed-parts/{installedPartId}

{
  "warrantyExpirationDate": "2027-10-22"
}
```

### 6.5 Delete Installed Part 👤 ADMIN
```http
DELETE /api/installed-parts/{installedPartId}
```

### 6.6 Get By Vehicle 🔒 ADMIN, SC_STAFF, EVM_STAFF, SC_TECHNICIAN, CUSTOMER
```http
GET /api/installed-parts/by-vehicle/{vehicleId}?page=0&size=10
```

### 6.7 Get By Part 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/installed-parts/by-part/{partId}?page=0&size=10
```

---

## 7. Warranty Claim APIs

**Base Path:** `/api/warranty-claims`

### 7.1 Get All Claims 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
GET /api/warranty-claims?page=0&size=10&search=keyword
```

### 7.2 Get Claim By ID 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
GET /api/warranty-claims/{claimId}
```

### 7.3 Create Claim 👥 ADMIN, SC_STAFF
```http
POST /api/warranty-claims

{
  "installedPartId": "INST-001",
  "issueDescription": "Battery not charging properly",
  "failureDate": "2024-10-22"
}
```
**Note:** Customers **CANNOT** create claims online. They must visit service center where SC_STAFF creates claims for them.

### 7.4 Create Claim (SC Staff Alternative) 👥 SC_STAFF
```http
POST /api/warranty-claims/sc-create

{
  "installedPartId": "INST-001",
  "issueDescription": "string",
  "failureDate": "2024-10-22"
}
```

### 7.5 Update Claim 👥 ADMIN, SC_STAFF
```http
PUT /api/warranty-claims/{claimId}

{
  "issueDescription": "string",
  "status": "string"
}
```

### 7.6 Delete Claim 👤 ADMIN
```http
DELETE /api/warranty-claims/{claimId}
```

### 7.7 EVM Accept Claim 👥 EVM_STAFF
```http
PUT /api/warranty-claims/{claimId}/evm-accept
```

### 7.8 EVM Reject Claim 👥 EVM_STAFF
```http
PUT /api/warranty-claims/{claimId}/evm-reject

{
  "rejectionReason": "Part not covered under warranty"
}
```

### 7.9 Tech Start Processing 👥 SC_TECHNICIAN
```http
PUT /api/warranty-claims/{claimId}/tech-start
```

### 7.10 Tech Complete Claim 👥 SC_TECHNICIAN
```http
PUT /api/warranty-claims/{claimId}/tech-complete

{
  "resolutionNotes": "Battery replaced successfully"
}
```

### 7.11 Get Claims By Status 👥 ADMIN, SC_STAFF, SC_TECHNICIAN
```http
GET /api/warranty-claims/by-status/{status}?page=0&size=10
```
**Status values:** `SUBMITTED`, `MANAGER_REVIEW`, `PROCESSING`, `COMPLETED`, `REJECTED`

### 7.12 Get Admin Pending Claims 👤 ADMIN
```http
GET /api/warranty-claims/admin-pending?page=0&size=10
```

### 7.13 Get Tech Pending Claims 👥 SC_TECHNICIAN
```http
GET /api/warranty-claims/tech-pending?page=0&size=10
```

### 7.14 Get My Claims 🆕 👤 CUSTOMER
```http
GET /api/warranty-claims/my-claims?page=0&size=10
```
**Response:**
```json
{
  "content": [
    {
      "warrantyClaimId": 1,
      "claimDate": "2024-10-20T10:00:00",
      "status": "PROCESSING",
      "description": "Battery not charging properly",
      "vehicleId": 5,
      "serviceCenterId": 1
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 3,
  "totalPages": 1
}
```
**Note:** Customer chỉ xem được claims của **xe mình sở hữu**. Không thể xem claims của người khác.

### 7.15 Get My Claim Detail 🆕 👤 CUSTOMER
```http
GET /api/warranty-claims/my-claims/{claimId}
```
**Response:**
```json
{
  "warrantyClaimId": 1,
  "claimDate": "2024-10-20T10:00:00",
  "status": "COMPLETED",
  "resolutionDate": "2024-10-22T15:30:00",
  "description": "Battery not charging\n[Admin Accepted]\n[Tech Start]: Starting diagnostic\n[Tech Complete]: Battery replaced successfully",
  "installedPartId": "INST-001",
  "vehicleId": 5,
  "serviceCenterId": 1
}
```
**Security:** Endpoint kiểm tra claim có thuộc về customer không. Nếu không thuộc về → 403 Forbidden.

---

## 8. Service History APIs

**Base Path:** `/api/service-histories`

### 8.1 Get All 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
GET /api/service-histories?page=0&size=10&search=keyword
```

### 8.2 Get By ID 🔒 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF, CUSTOMER
```http
GET /api/service-histories/{id}
```

### 8.3 Create 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
POST /api/service-histories

{
  "serviceDate": "2024-10-22T10:00:00",
  "serviceType": "Maintenance",
  "description": "Regular maintenance service",
  "partId": "PART-001",
  "vehicleId": 1
}
```

### 8.4 Update 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
PUT /api/service-histories/{id}

{
  "serviceDate": "2024-10-22T10:00:00",
  "serviceType": "Repair",
  "description": "Battery repair",
  "partId": "PART-001",
  "vehicleId": 1
}
```

### 8.5 Delete 👤 ADMIN
```http
DELETE /api/service-histories/{id}
```

### 8.6 Get By Vehicle 🔒 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF, CUSTOMER
```http
GET /api/service-histories/by-vehicle/{vehicleId}?page=0&size=10
```

### 8.7 Get By Part 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
GET /api/service-histories/by-part/{partId}?page=0&size=10
```

### 8.8 Get My Services 🔐 CUSTOMER
```http
GET /api/service-histories/my-services?page=0&size=10
```

### 8.9 Get By Date Range 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
GET /api/service-histories/by-date-range?startDate=2024-01-01&endDate=2024-12-31&page=0&size=10
```

---

## 9. Service Center APIs

**Base Path:** `/api/service-centers`
**Read Access:** 🔒 All authenticated users
**Write Access:** 👤 ADMIN only

### 9.1 Get All
```http
GET /api/service-centers?page=0&size=10
```

### 9.2 Get By ID
```http
GET /api/service-centers/{id}
```

### 9.3 Create 👤 ADMIN
```http
POST /api/service-centers

{
  "centerName": "Tesla Service Center Downtown",
  "address": "123 Main St, City",
  "phoneNumber": "+1234567890",
  "email": "service@example.com"
}
```

### 9.4 Update 👤 ADMIN
```http
PUT /api/service-centers/{id}

{
  "centerName": "string",
  "address": "string",
  "phoneNumber": "string",
  "email": "string"
}
```

### 9.5 Delete 👤 ADMIN
```http
DELETE /api/service-centers/{id}
```

### 9.6 Search By Location 🔒 All roles
```http
GET /api/service-centers/by-location?location=City&page=0&size=10
```

---

## 10. Feedback APIs

**Base Path:** `/api/feedbacks`

### 10.1 Get All 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks?page=0&size=10
```

### 10.2 Get By ID 🔒 ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER
```http
GET /api/feedbacks/{id}
```

### 10.3 Create 🔐 CUSTOMER
```http
POST /api/feedbacks

{
  "warrantyClaimId": 1,
  "rating": 5,
  "comment": "Excellent service, very satisfied"
}
```

### 10.4 Update 🔐 CUSTOMER (own), ADMIN
```http
PUT /api/feedbacks/{id}

{
  "rating": 4,
  "comment": "Good service"
}
```

### 10.5 Delete 👤 ADMIN
```http
DELETE /api/feedbacks/{id}
```

### 10.6 Get My Feedbacks 🔐 CUSTOMER
```http
GET /api/feedbacks/my-feedbacks?page=0&size=10
```

### 10.7 Get By Claim 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/by-claim/{claimId}
```

### 10.8 Get By Rating 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/by-rating/{rating}?page=0&size=10
```

---

## 11. Work Log APIs

**Base Path:** `/api/work-logs`
**Role Requirements:** 👥 ADMIN, EVM_STAFF, SC_STAFF (read only)

### 11.1 Get All 👥 ADMIN, EVM_STAFF
```http
GET /api/work-logs?page=0&size=10
```

### 11.2 Get By ID 👥 ADMIN, EVM_STAFF
```http
GET /api/work-logs/{id}
```

### 11.3 Create 👥 ADMIN, EVM_STAFF
```http
POST /api/work-logs

{
  "warrantyClaimId": 1,
  "technicianId": "uuid",
  "workDescription": "Replaced battery pack",
  "hoursSpent": 2.5,
  "workDate": "2024-10-22"
}
```

### 11.4 Update 👥 ADMIN, EVM_STAFF
```http
PUT /api/work-logs/{id}

{
  "workDescription": "string",
  "hoursSpent": 3.0
}
```

### 11.5 Delete 👤 ADMIN
```http
DELETE /api/work-logs/{id}
```

### 11.6 Get By Claim 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/work-logs/by-claim/{claimId}?page=0&size=10
```

### 11.7 Get By Technician 👥 ADMIN, EVM_STAFF
```http
GET /api/work-logs/by-technician/{technicianId}?page=0&size=10
```

---

## 12. User Info APIs

**Base Path:** `/api`

### 12.1 Get My Info 🔒 All authenticated users
```http
GET /api/me
```
**Response:**
```json
{
  "userId": "uuid",
  "username": "string",
  "email": "user@example.com",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "ADMIN|EVM_STAFF|SC_STAFF|SC_TECHNICIAN|CUSTOMER",
  "enabled": true
}
```

---

## 📊 Common Response Formats

### Success Response (Paginated)
```json
{
  "content": [...],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false
}
```

### Success Response (Single Object)
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  ...
}
```

### Error Response
```json
{
  "timestamp": "2024-10-22T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/..."
}
```

---

## 🔄 Warranty Claim Workflow

```
1. CUSTOMER visits service center → SC_STAFF creates claim → Status: SUBMITTED
2. ADMIN reviews:
   - Accept → Status: MANAGER_REVIEW
   - Reject → Status: REJECTED (END)
3. SC_TECHNICIAN starts work → Status: PROCESSING
4. SC_TECHNICIAN completes → Status: COMPLETED
5. CUSTOMER provides feedback (optional)
```

**Important:** Customers **CANNOT** create claims through API. They must physically visit a service center where SC_STAFF will create the claim for them.

---

## 🔒 Authentication Flow

1. **Login** → Receive `accessToken` and `refreshToken`
2. **Use Token** → Include in `Authorization: Bearer <token>` header
3. **Token Expires** → Use `refreshToken` to get new tokens
4. **Logout** → Clear tokens from client

---

## 📖 Additional Documentation

- **Role Permissions:** See `ROLE_BASED_ACCESS_CONTROL.md`
- **JWT Details:** See `JWT_AUTHENTICATION_FLOW.md`
- **Auth API:** See `AUTH_API_POSTMAN_GUIDE.md`

---

## 🧪 Testing với Postman

**Postman Collection đã sẵn sàng để test!**

### **Files:**
- 📦 `postman/OEM_EV_Warranty_System.postman_collection.json`
- 🌍 `postman/Local_Environment.postman_environment.json`
- 📖 `postman/README.md`

### **Cách sử dụng:**
1. Import collection và environment vào Postman
2. Chọn **Local Development** environment
3. Login để lấy token (tự động save vào environment)
4. Test các endpoints

### **NEW - Customer Warranty Claims:**
- 🆕 `GET /api/warranty-claims/my-claims` - Xem tất cả claims
- 🆕 `GET /api/warranty-claims/my-claims/{id}` - Xem chi tiết claim

**Xem chi tiết:** `postman/README.md`

---

**System Status:** ✅ PRODUCTION READY

**Last Updated:** October 23, 2025 - Thêm Customer warranty claims viewing + Postman Collection
