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
12. [User Info APIs](#12-user-info-apis) - `/api`

---

## 🔐 Quick Security Reference

| Role | Access Level |
|------|-------------|
| **ADMIN** | Full access to everything |
| **EVM_STAFF** | Vehicles, Parts, Warranty Claims, Service Histories, Work Logs |
| **SC_STAFF** | Customers, Vehicles (read Parts), Warranty Claims, Service Histories, Service Centers, Feedbacks, Work Logs (read) |
| **SC_TECHNICIAN** | Vehicles (read), Warranty Claims (process), Service Histories, Installed Parts (read), Service Centers (read) |
| **CUSTOMER** | Own vehicles/histories, Own warranty claims (view only), Feedbacks, Service Centers (read) |

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
  "tokenType": "Bearer",
  "username": "string",
  "roleName": "string",
  "userId": 1
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
**Note:** Tạo tài khoản CUSTOMER

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

{
  "refreshToken": "string"
}
```

### 1.9 Validate Token 🔒 Authenticated
```http
GET /api/auth/validate
Authorization: Bearer <token>
```

---

## 2. User Management APIs

**Base Path:** `/api/admin/users`
**Role Requirements:** 👤 ADMIN only

### 2.1 Get All Users
```http
GET /api/admin/users?page=0&size=10&search=keyword&role=ADMIN
```

### 2.2 Get User By ID
```http
GET /api/admin/users/{userId}
```

### 2.3 Search Users By Username
```http
GET /api/admin/users/search?username=john&page=0&size=10
```

### 2.4 Get Users By Role
```http
GET /api/admin/users/by-role/{roleName}?page=0&size=10
```

### 2.5 Update User
```http
PUT /api/admin/users/{userId}

{
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "string"
}
```
**Note:** Có thể update email, fullName, phoneNumber, hoặc role

### 2.6 Update User Role
```http
PATCH /api/admin/users/{userId}/role?newRoleId=2
```

### 2.7 Delete User
```http
DELETE /api/admin/users/{userId}
```

### 2.8 Reset User Password
```http
POST /api/admin/users/{userId}/reset-password?newPassword=optional
```
**Note:** Nếu không truyền `newPassword`, hệ thống sẽ tự động generate password mới

### 2.9 Get User Statistics
```http
GET /api/admin/users/statistics
```
**Response:**
```json
{
  "totalUsers": 100,
  "usersByRole": {
    "ADMIN": 5,
    "EVM_STAFF": 20,
    "SC_STAFF": 30,
    "SC_TECHNICIAN": 15,
    "CUSTOMER": 30
  },
  "enabledUsers": 95,
  "disabledUsers": 5
}
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

### 3.3 Search Customers By Name 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/customers/search?name=john&page=0&size=10
```

### 3.4 Get Customer By Email 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/customers/by-email?email=customer@example.com
```

### 3.5 Get Customer By Phone 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/customers/by-phone?phone=0123456789
```

### 3.6 Get Customers By User ID 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/customers/by-user/{userId}?page=0&size=10
```

### 3.7 Create Customer 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
POST /api/customers

{
  "fullName": "string",
  "email": "user@example.com",
  "phoneNumber": "string",
  "address": "string"
}
```

### 3.8 Update Customer 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
PUT /api/customers/{customerId}

{
  "fullName": "string",
  "email": "user@example.com",
  "phoneNumber": "string",
  "address": "string"
}
```

### 3.9 Update Customer Profile (Self) 👤 CUSTOMER
```http
PUT /api/customers/profile
Authorization: Bearer <token>

{
  "fullName": "string",
  "email": "user@example.com",
  "phoneNumber": "string",
  "address": "string"
}
```

### 3.10 Delete Customer 👤 ADMIN
```http
DELETE /api/customers/{customerId}
```

---

## 4. Vehicle APIs

**Base Path:** `/api/vehicles`

### 4.1 Get All Vehicles 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/vehicles?page=0&size=10&search=keyword
```

### 4.2 Get Vehicle By ID 🔒 ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER
```http
GET /api/vehicles/{vehicleId}
```

### 4.3 Get Vehicle By VIN 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/vehicles/by-vin?vin=5YJ3E1EA5KF123456
```

### 4.4 Search Vehicles 🔒 All authenticated users
```http
GET /api/vehicles/search?model=Tesla&brand=Model3&page=0&size=10
```

### 4.5 Get Vehicles By Customer 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/vehicles/by-customer/{customerId}?page=0&size=10
```

### 4.6 Get My Vehicles 👤 CUSTOMER
```http
GET /api/vehicles/my-vehicles?page=0&size=10
Authorization: Bearer <token>
```

### 4.7 Get Vehicles With Expiring Warranty 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/vehicles/warranty-expiring?daysFromNow=30&page=0&size=10
```

### 4.8 Create Vehicle 👥 ADMIN, EVM_STAFF
```http
POST /api/vehicles

{
  "vehicleName": "Tesla Model 3",
  "vehicleVin": "5YJ3E1EA5KF123456",
  "modelYear": 2024,
  "customerId": "uuid"
}
```

### 4.9 Update Vehicle 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
PUT /api/vehicles/{vehicleId}

{
  "vehicleName": "string",
  "modelYear": 2024
}
```

### 4.10 Delete Vehicle 👥 ADMIN, EVM_STAFF
```http
DELETE /api/vehicles/{vehicleId}
```

---

## 5. Part APIs

**Base Path:** `/api/parts`
**Role Requirements:** 👥 ADMIN, EVM_STAFF, SC_STAFF (read), SC_TECHNICIAN (read)

### 5.1 Get All Parts
```http
GET /api/parts?page=0&size=10&search=keyword
```

### 5.2 Get Part By ID
```http
GET /api/parts/{partId}
```

### 5.3 Get Parts By Manufacturer
```http
GET /api/parts/by-manufacturer?manufacturer=LG Chem&page=0&size=10
```

### 5.4 Create Part 👥 ADMIN, EVM_STAFF
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

### 5.5 Update Part 👥 ADMIN, EVM_STAFF
```http
PUT /api/parts/{partId}

{
  "partName": "string",
  "manufacturer": "string",
  "price": 5500.00
}
```

### 5.6 Delete Part 👤 ADMIN
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

### 6.3 Get By Vehicle 🔒 ADMIN, SC_STAFF, EVM_STAFF, SC_TECHNICIAN, CUSTOMER
```http
GET /api/installed-parts/by-vehicle/{vehicleId}?page=0&size=10
```

### 6.4 Get By Part 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/installed-parts/by-part/{partId}?page=0&size=10
```

### 6.5 Get Installed Parts With Expiring Warranty 👥 ADMIN, SC_STAFF, EVM_STAFF
```http
GET /api/installed-parts/warranty-expiring?daysFromNow=30&page=0&size=10
```

### 6.6 Create Installed Part 👥 ADMIN, SC_STAFF
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

### 6.7 Update Installed Part 👥 ADMIN, SC_STAFF
```http
PUT /api/installed-parts/{installedPartId}

{
  "warrantyExpirationDate": "2027-10-22"
}
```

### 6.8 Delete Installed Part 👤 ADMIN
```http
DELETE /api/installed-parts/{installedPartId}
```

---

## 7. Warranty Claim APIs

**Base Path:** `/api/warranty-claims`

### 7.1 Get All Claims 👥 ADMIN, SC_STAFF
```http
GET /api/warranty-claims?page=0&size=10
```

### 7.2 Get Claim By ID 👥 ADMIN, SC_STAFF, SC_TECHNICIAN
```http
GET /api/warranty-claims/{claimId}
```

### 7.3 Get Claims By Status 👥 ADMIN, SC_STAFF, SC_TECHNICIAN
```http
GET /api/warranty-claims/by-status/{status}?page=0&size=10
```
**Status values:** `SUBMITTED`, `MANAGER_REVIEW`, `PROCESSING`, `COMPLETED`, `REJECTED`

### 7.4 Get Admin Pending Claims 👤 ADMIN
```http
GET /api/warranty-claims/admin-pending?page=0&size=10
```

### 7.5 Get Tech Pending Claims 👥 SC_TECHNICIAN
```http
GET /api/warranty-claims/tech-pending?page=0&size=10
```

### 7.6 Get My Assigned Claims 👤 ADMIN
```http
GET /api/warranty-claims/my-assigned-claims?userId={userId}&page=0&size=10
```

### 7.7 Create Claim 👥 ADMIN, SC_STAFF
```http
POST /api/warranty-claims

{
  "installedPartId": "INST-001",
  "issueDescription": "Battery not charging properly",
  "failureDate": "2024-10-22"
}
```

### 7.8 Create Claim (SC Staff Alternative) 👥 SC_STAFF
```http
POST /api/warranty-claims/sc-create

{
  "installedPartId": "INST-001",
  "issueDescription": "string",
  "failureDate": "2024-10-22"
}
```

### 7.9 Update Claim 👥 ADMIN, SC_STAFF
```http
PUT /api/warranty-claims/{claimId}

{
  "issueDescription": "string",
  "status": "string"
}
```

### 7.10 Update Claim Status 👤 ADMIN
```http
PATCH /api/warranty-claims/{claimId}/status

{
  "status": "string",
  "note": "string"
}
```

### 7.11 Admin Accept Claim 👤 ADMIN
```http
PATCH /api/warranty-claims/{claimId}/admin-accept

"Admin approved the claim"
```

### 7.12 Admin Reject Claim 👤 ADMIN
```http
PATCH /api/warranty-claims/{claimId}/admin-reject?reason=Part not covered
```

### 7.13 Tech Start Processing 👥 SC_TECHNICIAN
```http
PATCH /api/warranty-claims/{claimId}/tech-start

"Starting diagnostic"
```

### 7.14 Tech Complete Claim 👥 SC_TECHNICIAN
```http
PATCH /api/warranty-claims/{claimId}/tech-complete?completionNote=Battery replaced successfully
```

### 7.15 Assign Claim To Me 👤 ADMIN
```http
POST /api/warranty-claims/{claimId}/assign-to-me?userId={userId}
```

### 7.16 Delete Claim 👤 ADMIN
```http
DELETE /api/warranty-claims/{claimId}
```

### 7.17 Get My Claims 👤 CUSTOMER
```http
GET /api/warranty-claims/my-claims?page=0&size=10
```

### 7.18 Get My Claim Detail 👤 CUSTOMER
```http
GET /api/warranty-claims/my-claims/{claimId}
```

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

### 8.3 Get By Vehicle 🔒 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF, CUSTOMER
```http
GET /api/service-histories/by-vehicle/{vehicleId}?page=0&size=10
```

### 8.4 Get By Part 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
GET /api/service-histories/by-part/{partId}?page=0&size=10
```

### 8.5 Get My Services 🔐 CUSTOMER
```http
GET /api/service-histories/my-services?page=0&size=10
Authorization: Bearer <token>
```

### 8.6 Get By Date Range 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
```http
GET /api/service-histories/by-date-range?startDate=2024-01-01&endDate=2024-12-31&page=0&size=10
```

### 8.7 Create 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
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

### 8.8 Update 👥 ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
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

### 8.9 Delete 👤 ADMIN
```http
DELETE /api/service-histories/{id}
```

---

## 9. Service Center APIs

**Base Path:** `/api/service-centers`
**Read Access:** 🔒 All authenticated users
**Write Access:** 👤 ADMIN only

### 9.1 Get All Service Centers
```http
GET /api/service-centers?page=0&size=10&sortBy=serviceCenterName&sortDir=ASC
```

### 9.2 Get Service Center By ID
```http
GET /api/service-centers/{id}
```

### 9.3 Search Service Centers
```http
GET /api/service-centers/search?keyword=hanoi&page=0&size=10&sortBy=serviceCenterId&sortDir=ASC
```

### 9.4 Find Service Centers Nearby
```http
GET /api/service-centers/nearby?latitude=10.762622&longitude=106.660172&radius=10
```
**Parameters:**
- `latitude`: -90.0 to 90.0
- `longitude`: -180.0 to 180.0
- `radius`: Distance in kilometers (default: 10)

### 9.5 Get All Ordered By Distance
```http
GET /api/service-centers/ordered-by-distance?latitude=10.762622&longitude=106.660172
```

### 9.6 Create Service Center 👤 ADMIN
```http
POST /api/service-centers

{
  "centerName": "Tesla Service Center Downtown",
  "address": "123 Main St, City",
  "phoneNumber": "+1234567890",
  "email": "service@example.com",
  "latitude": 10.762622,
  "longitude": 106.660172
}
```

### 9.7 Update Service Center 👤 ADMIN
```http
PUT /api/service-centers/{id}

{
  "centerName": "string",
  "address": "string",
  "phoneNumber": "string",
  "email": "string"
}
```

### 9.8 Update Service Center Location 👤 ADMIN
```http
PATCH /api/service-centers/{id}/location?latitude=10.762622&longitude=106.660172
```

### 9.9 Delete Service Center 👤 ADMIN
```http
DELETE /api/service-centers/{id}
```

---

## 10. Feedback APIs

**Base Path:** `/api/feedbacks`

### 10.1 Get All Feedbacks 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks?page=0&size=10&sortBy=createdAt&sortDir=DESC
```

### 10.2 Get Feedback By ID 🔒 ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER
```http
GET /api/feedbacks/{id}
```

### 10.3 Get Feedback By Claim ID 🔒 ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER
```http
GET /api/feedbacks/by-claim/{claimId}
```

### 10.4 Get Feedbacks By Customer 🔒 ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER
```http
GET /api/feedbacks/by-customer/{customerId}?page=0&size=10&sortBy=createdAt&sortDir=DESC
```

### 10.5 Get Feedbacks By Rating 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/by-rating/{rating}?page=0&size=10
```

### 10.6 Get Feedbacks By Minimum Rating 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/min-rating/{rating}?page=0&size=10
```

### 10.7 Get Average Rating 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/statistics/average-rating
```

### 10.8 Get Average Rating By Service Center 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/statistics/service-center/{serviceCenterId}/average-rating
```

### 10.9 Get Count By Rating 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/statistics/count-by-rating/{rating}
```

### 10.10 Get Feedback Statistics Summary 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/feedbacks/statistics/summary
```
**Response:**
```json
{
  "averageRating": 4.5,
  "ratingCounts": {
    "1": 5,
    "2": 10,
    "3": 20,
    "4": 30,
    "5": 35
  }
}
```

### 10.11 Create Feedback 🔐 CUSTOMER
```http
POST /api/feedbacks?customerId={customerId}

{
  "warrantyClaimId": 1,
  "rating": 5,
  "comment": "Excellent service, very satisfied"
}
```

### 10.12 Update Feedback 🔐 CUSTOMER
```http
PUT /api/feedbacks/{id}?customerId={customerId}

{
  "rating": 4,
  "comment": "Good service"
}
```

### 10.13 Delete Feedback 🔐 CUSTOMER or ADMIN
```http
DELETE /api/feedbacks/{id}?customerId={customerId}
```

---

## 11. Work Log APIs

**Base Path:** `/api/work-logs`
**Role Requirements:** 👥 ADMIN, EVM_STAFF

### 11.1 Get All Work Logs 👥 ADMIN, EVM_STAFF
```http
GET /api/work-logs?page=0&size=10
```

### 11.2 Get Work Log By ID 👥 ADMIN, EVM_STAFF
```http
GET /api/work-logs/{id}
```

### 11.3 Get Work Logs By Claim 👥 ADMIN, EVM_STAFF, SC_STAFF
```http
GET /api/work-logs/by-claim/{claimId}?page=0&size=10
```

### 11.4 Get Work Logs By User 👥 ADMIN, EVM_STAFF
```http
GET /api/work-logs/by-user/{userId}?page=0&size=10
```

### 11.5 Create Work Log 👥 ADMIN, EVM_STAFF
```http
POST /api/work-logs

{
  "warrantyClaimId": 1,
  "workDescription": "Replaced battery pack",
  "hoursSpent": 2.5,
  "workDate": "2024-10-22"
}
```
**Note:** `technicianId` sẽ được lấy tự động từ authentication

### 11.6 Update Work Log 👥 ADMIN, EVM_STAFF
```http
PUT /api/work-logs/{id}

{
  "workDescription": "string",
  "hoursSpent": 3.0
}
```

### 11.7 Delete Work Log 👤 ADMIN
```http
DELETE /api/work-logs/{id}
```

---

## 12. User Info APIs

**Base Path:** `/api`

### 12.1 Get Current User Info 🔒 All authenticated users
```http
GET /api/me
```
**Response:**
```json
{
  "username": "string",
  "roles": ["ROLE_ADMIN"],
  "isAuthenticated": true,
  "hasAdminRole": true,
  "hasStaffRole": false,
  "hasCustomerRole": false
}
```

### 12.2 Get My Basic Info 🔒 All authenticated users
```http
GET /api/me/basic
```
**Response:**
```json
{
  "userId": 1,
  "username": "string",
  "email": "user@example.com",
  "roleName": "ADMIN",
  "roleId": 1,
  "serviceCenterId": 1,
  "serviceCenterName": "Downtown Service Center",
  "customerId": "uuid",
  "customerName": "John Doe",
  "phone": "0123456789"
}
```

### 12.3 Get My Full Profile 🔒 All authenticated users
```http
GET /api/profile
```
**Response for CUSTOMER:**
```json
{
  "customerId": "uuid",
  "name": "John Doe",
  "email": "customer@example.com",
  "phone": "0123456789",
  "address": "123 Main St",
  "vehicles": [...],
  "warrantyClaims": [...],
  "feedbacks": [...]
}
```
**Response for STAFF/ADMIN:**
```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@example.com",
  "roleName": "ADMIN",
  "assignedClaims": [...],
  "workLogs": [...]
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

**Xem chi tiết:** `postman/README.md`

---

**System Status:** ✅ PRODUCTION READY

**Last Updated:** October 23, 2025 - Complete API documentation synced with actual implementation
