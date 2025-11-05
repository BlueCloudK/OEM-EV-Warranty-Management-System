# DATA FLOW SCENARIOS - OEM EV WARRANTY MANAGEMENT SYSTEM

## Table of Contents
1. [Authentication Flows](#authentication-flows)
2. [Customer Flows](#customer-flows)
3. [Service Center Staff Flows](#service-center-staff-flows)
4. [Service Center Technician Flows](#service-center-technician-flows)
5. [EVM Staff Flows](#evm-staff-flows)
6. [Admin Flows](#admin-flows)
7. [Warranty Claim Lifecycle](#warranty-claim-lifecycle)
8. [Part Request Lifecycle](#part-request-lifecycle)

---

## Authentication Flows

### 1. User Login Flow
**Actors:** All users

**Steps:**
1. User opens login page
2. Frontend displays login form
3. User enters `username` and `password`
4. User clicks "Login" button

**API Calls:**
```
POST /api/auth/login
Request Body:
{
  "username": "john_doe",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "def502...",
  "userId": 42,
  "username": "john_doe",
  "roleName": "CUSTOMER",
  "message": "Login successful"
}
```

5. Frontend stores tokens in localStorage/sessionStorage
6. Frontend redirects user based on role:
   - ADMIN → `/admin/dashboard`
   - EVM_STAFF → `/evm/dashboard`
   - SC_STAFF → `/service-center/dashboard`
   - SC_TECHNICIAN → `/technician/dashboard`
   - CUSTOMER → `/customer/dashboard`

**Error Handling:**
- 401: Invalid credentials → Display error message
- 403: Account locked → Display locked message

---

### 2. Token Refresh Flow
**Actors:** All authenticated users

**Trigger:** Access token expires (typically after 15-60 minutes)

**Steps:**
1. User makes an API request with expired access token
2. Backend returns 401 Unauthorized
3. Frontend intercepts 401 response
4. Frontend attempts to refresh token

**API Calls:**
```
POST /api/auth/refresh
Request Body:
{
  "refreshToken": "def502..."
}

Response (200 OK):
{
  "accessToken": "eyJhbGc...",  // New access token
  "refreshToken": "abc123...",   // New refresh token
  "userId": 42,
  "username": "john_doe",
  "roleName": "CUSTOMER"
}
```

5. Frontend updates stored tokens
6. Frontend retries original API request with new token

**Error Handling:**
- 401: Refresh token invalid/expired → Logout user, redirect to login

---

### 3. User Registration Flow (Customer Self-Registration)
**Actors:** Anonymous users

**Steps:**
1. User navigates to registration page
2. User fills registration form:
   - Username
   - Email
   - Password
   - Confirm Password
   - Address

3. User clicks "Register" button

**API Calls:**
```
POST /api/auth/register
Request Body:
{
  "username": "jane_smith",
  "email": "jane@example.com",
  "password": "SecurePass456",
  "address": "123 Main St, Hanoi, Vietnam"
}

Response (201 Created):
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

4. Frontend displays success message
5. Frontend redirects to login page

**Error Handling:**
- 409 Conflict: Username/email already exists
- 400 Bad Request: Validation errors (weak password, invalid email, etc.)

---

### 4. Forgot Password Flow
**Actors:** All users

**Steps:**
1. User clicks "Forgot Password" on login page
2. User enters email address
3. User clicks "Send Reset Link"

**API Calls:**
```
POST /api/auth/forgot-password
Request Body:
{
  "email": "john_doe@example.com"
}

Response (200 OK):
{
  "success": true,
  "message": "Password reset email sent"
}
```

4. Backend sends email with reset token
5. User receives email with reset link (e.g., `https://app.com/reset-password?token=xyz123`)
6. User clicks link and opens reset password page
7. User enters new password
8. User clicks "Reset Password"

**API Calls:**
```
POST /api/auth/reset-password
Request Body:
{
  "resetToken": "xyz123",
  "newPassword": "NewSecurePass789"
}

Response (200 OK):
{
  "success": true,
  "message": "Password reset successfully"
}
```

9. Frontend redirects to login page

---

## Customer Flows

### 1. View My Vehicles
**Actor:** CUSTOMER

**Steps:**
1. Customer logs in and navigates to "My Vehicles" page

**API Calls:**
```
GET /api/vehicles/my-vehicles?page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
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
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

2. Frontend displays vehicles in cards/table format
3. Each vehicle shows:
   - Vehicle name & model
   - VIN
   - Warranty status (active/expired)
   - Days until warranty expiry
   - Quick actions: View Details, Service History

---

### 2. View Vehicle Details
**Actor:** CUSTOMER

**Steps:**
1. Customer clicks on a vehicle from "My Vehicles"
2. Frontend navigates to vehicle detail page

**API Calls:**
```
GET /api/vehicles/101
Authorization: Bearer <accessToken>

Response (200 OK):
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
```

3. Fetch installed parts for this vehicle:

```
GET /api/installed-parts/by-vehicle/101?page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "installedPartId": 501,
      "partId": 201,
      "partName": "Battery Pack",
      "partNumber": "BP-001-LR",
      "manufacturer": "Panasonic",
      "vehicleId": 101,
      "vehicleName": "Tesla Model 3",
      "installationDate": "2023-01-15",
      "warrantyExpiryDate": "2031-01-15"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 3,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

4. Fetch service history:

```
GET /api/service-histories/by-vehicle/101?page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "serviceHistoryId": 301,
      "vehicleId": 101,
      "serviceType": "Routine Maintenance",
      "serviceDate": "2023-06-15T10:00:00",
      "description": "10,000 km service check",
      "partId": "201",
      "partName": "Battery Pack"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

5. Frontend displays comprehensive vehicle information:
   - Basic info
   - Installed parts with warranty status
   - Service history timeline

---

### 3. View My Warranty Claims
**Actor:** CUSTOMER

**Steps:**
1. Customer navigates to "My Claims" page

**API Calls:**
```
GET /api/warranty-claims/my-claims?page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
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
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

2. Frontend displays claims with:
   - Status badges (color-coded)
   - Vehicle info
   - Part info
   - Date submitted
   - Current status
   - Action: View Details

---

### 4. View Warranty Claim Details
**Actor:** CUSTOMER

**Steps:**
1. Customer clicks on a specific claim
2. Frontend fetches claim details:

**API Calls:**
```
GET /api/warranty-claims/my-claims/1001
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "warrantyClaimId": 1001,
  "claimDate": "2024-03-15T14:30:00",
  "status": "COMPLETED",
  "description": "Battery degradation issue",
  "resolutionDate": "2024-03-20T16:00:00",
  ...
}
```

3. Fetch work logs for this claim:

```
GET /api/work-logs/by-claim/1001?page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "workLogId": 2001,
      "warrantyClaimId": 1001,
      "description": "Initial diagnosis",
      "startTime": "2024-03-16T09:00:00",
      "endTime": "2024-03-16T11:00:00",
      "userId": 5,
      "username": "tech_mike"
    },
    {
      "workLogId": 2002,
      "warrantyClaimId": 1001,
      "description": "Battery replacement",
      "startTime": "2024-03-20T13:00:00",
      "endTime": "2024-03-20T16:00:00",
      "userId": 5,
      "username": "tech_mike"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

4. Check if feedback exists for this claim:

```
GET /api/feedbacks/by-claim/1001
Authorization: Bearer <accessToken>

Response (200 OK or 404 Not Found):
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

5. Frontend displays:
   - Claim status timeline (visual progress indicator)
   - Work logs (chronological order)
   - Part request history (if any)
   - Feedback (if submitted) or "Submit Feedback" button (if completed and no feedback)

---

### 5. Submit Feedback for Completed Claim
**Actor:** CUSTOMER

**Pre-condition:** Warranty claim status is COMPLETED and no feedback exists

**Steps:**
1. Customer clicks "Submit Feedback" button on claim detail page
2. Frontend displays feedback modal/form
3. Customer selects rating (1-5 stars)
4. Customer enters comments (optional)
5. Customer clicks "Submit"

**API Calls:**
```
POST /api/feedbacks
Authorization: Bearer <accessToken>
Request Body:
{
  "warrantyClaimId": 1001,
  "rating": 5,
  "comment": "Excellent service! Battery replaced quickly."
}

Response (201 Created):
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

6. Frontend displays success message
7. Feedback form is replaced with feedback display

---

### 6. View and Respond to Recall Requests
**Actor:** CUSTOMER

**Steps:**
1. Customer navigates to "My Recalls" page or sees notification

**API Calls:**
```
GET /api/recall-requests/my-recalls
Authorization: Bearer <accessToken>

Response (200 OK):
[
  {
    "recallRequestId": 4001,
    "installedPartId": 501,
    "partName": "Battery Pack",
    "partNumber": "BP-001-LR",
    "vehicleId": 101,
    "vehicleName": "Tesla Model 3",
    "reason": "Potential fire hazard due to manufacturing defect in batch XYZ",
    "status": "APPROVED",
    "customerResponse": null,
    "customerResponseDate": null,
    "createdAt": "2024-04-01T08:00:00",
    "createdBy": "evm_staff_alice"
  }
]
```

2. Customer sees unconfirmed recalls highlighted
3. Customer clicks "Respond" on a recall
4. Frontend displays recall details with confirmation options
5. Customer selects response: ACCEPTED or REJECTED
6. Customer enters optional notes
7. Customer clicks "Submit Response"

**API Calls:**
```
PATCH /api/recall-requests/4001/customer-confirm
Authorization: Bearer <accessToken>
Request Body:
{
  "response": "ACCEPTED",
  "notes": "I will bring my vehicle next week"
}

Response (200 OK):
{
  "recallRequestId": 4001,
  "installedPartId": 501,
  ...
  "customerResponse": "ACCEPTED",
  "customerResponseDate": "2024-04-02T10:00:00"
}
```

8. Frontend updates recall status and displays confirmation message

---

### 7. Find Nearby Service Centers
**Actor:** CUSTOMER or Anonymous User

**Steps:**
1. User navigates to "Find Service Center" page
2. Frontend requests user's geolocation (browser API)
3. User grants location permission
4. Frontend receives coordinates (lat, lng)

**API Calls:**
```
GET /api/service-centers/nearby?latitude=21.0285&longitude=105.8542&radius=10
Authorization: Bearer <accessToken> (optional for authenticated users)

Response (200 OK):
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
  {
    "serviceCenterId": 2,
    "name": "VinFast Service Ha Dong",
    "address": "456 Ha Dong, Hanoi",
    "phone": "0249876543",
    "email": "hadong@vinfastservice.com",
    "latitude": 20.9800,
    "longitude": 105.7800
  }
]
```

5. Frontend displays service centers on map (Google Maps / Leaflet)
6. Frontend also shows list view with distance calculated
7. User can click on a service center to see details

**API Calls:**
```
GET /api/service-centers/1
Authorization: Bearer <accessToken> (optional)

Response (200 OK):
{
  "serviceCenterId": 1,
  "name": "Tesla Service Center Hanoi",
  "address": "123 Ba Dinh, Hanoi",
  "phone": "0241234567",
  "email": "hanoi@teslaservice.com",
  "latitude": 21.0350,
  "longitude": 105.8450
}
```

8. Frontend displays service center details with:
   - Contact info
   - Map location
   - Directions link (open in Google Maps)
   - Average rating (if available)

---

## Service Center Staff Flows

### 1. Create Warranty Claim for Customer
**Actor:** SC_STAFF

**Steps:**
1. Staff member logs in and navigates to "Create Claim" page
2. Staff searches for customer by phone/email

**API Calls:**
```
GET /api/customers/by-phone?phone=0901234567
Authorization: Bearer <accessToken>

Response (200 OK):
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

3. Staff selects customer
4. Frontend fetches customer's vehicles:

```
GET /api/vehicles/by-customer/550e8400-e29b-41d4-a716-446655440000?page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "vehicleId": 101,
      "vehicleName": "Tesla Model 3",
      ...
    }
  ],
  ...
}
```

5. Staff selects affected vehicle
6. Frontend fetches installed parts for selected vehicle:

```
GET /api/installed-parts/by-vehicle/101?page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "installedPartId": 501,
      "partId": 201,
      "partName": "Battery Pack",
      ...
    }
  ],
  ...
}
```

7. Staff selects faulty part
8. Staff enters problem description
9. Staff attaches photos (optional, via file upload)
10. Staff clicks "Submit Claim"

**API Calls:**
```
POST /api/warranty-claims/sc-create
Authorization: Bearer <accessToken>
Request Body:
{
  "vehicleId": 101,
  "installedPartId": 501,
  "description": "Customer reports battery degradation, capacity dropped to 70%"
}

Response (201 Created):
{
  "warrantyClaimId": 1002,
  "claimDate": "2024-04-05T09:30:00",
  "status": "PENDING_ADMIN_APPROVAL",
  "description": "Customer reports battery degradation, capacity dropped to 70%",
  "resolutionDate": null,
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
  "assignedToUserId": null,
  "assignedToUsername": null,
  "assignedToEmail": null,
  "comments": null,
  "updatedBy": "staff_susan",
  "lastUpdated": "2024-04-05T09:30:00"
}
```

11. Frontend displays success message with claim ID
12. Frontend provides option to print claim receipt for customer

---

### 2. Register New Customer (with Account)
**Actor:** SC_STAFF

**Steps:**
1. Staff navigates to "Register Customer" page
2. Staff fills customer registration form:
   - Username
   - Email
   - Temporary password
   - Address
   - Customer name
   - Customer phone

3. Staff clicks "Register"

**API Calls:**
```
POST /api/auth/staff/register-customer
Authorization: Bearer <accessToken>
Request Body:
{
  "username": "mary_nguyen",
  "email": "mary@example.com",
  "password": "TempPass123",
  "address": "789 Tran Hung Dao, Hanoi",
  "customerName": "Mary Nguyen",
  "customerPhone": "0912345678"
}

Response (201 Created):
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

4. Frontend displays success message
5. Frontend prints temporary credentials for customer
6. Staff provides credentials to customer

**Note:** Transaction ensures both User account and Customer profile are created together or rollback if either fails.

---

### 3. Register Vehicle for Customer
**Actor:** SC_STAFF

**Steps:**
1. Staff navigates to "Register Vehicle" page
2. Staff searches and selects customer (similar to claim creation)
3. Staff enters vehicle details:
   - Vehicle name
   - Model
   - Year
   - VIN
   - Purchase date
   - Warranty start date
   - Warranty end date
   - Current mileage

4. Staff clicks "Register Vehicle"

**API Calls:**
```
POST /api/vehicles
Authorization: Bearer <accessToken>
Request Body:
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

Response (201 Created):
{
  "vehicleId": 102,
  "vehicleName": "VinFast VF 8",
  "vehicleModel": "VF 8 Plus",
  "vehicleYear": 2024,
  "vehicleVin": "VF8VN2024ABC12345",
  "purchaseDate": "2024-04-01",
  "warrantyStartDate": "2024-04-01",
  "warrantyEndDate": "2034-04-01",
  "mileage": 50,
  "customerId": "660f9511-f39c-52e5-b827-557766551111",
  "customerName": "Mary Nguyen"
}
```

5. Frontend displays success message
6. Frontend provides option to register installed parts for this vehicle

---

### 4. Record Part Installation
**Actor:** SC_STAFF

**Steps:**
1. Staff navigates to "Install Part" page
2. Staff selects vehicle (either from search or recent registrations)
3. Frontend fetches available parts catalog:

**API Calls:**
```
GET /api/parts?page=0&size=50&search=battery
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "partId": 201,
      "partName": "Battery Pack",
      "partNumber": "BP-001-LR",
      "manufacturer": "Panasonic",
      "warrantyMonths": 96,
      "createdAt": "2023-01-01T00:00:00"
    },
    ...
  ],
  ...
}
```

4. Staff selects part from catalog
5. Staff enters installation date
6. Frontend auto-calculates warranty expiry date based on installation date + part warranty months
7. Staff clicks "Record Installation"

**API Calls:**
```
POST /api/installed-parts
Authorization: Bearer <accessToken>
Request Body:
{
  "partId": 201,
  "vehicleId": 102,
  "installationDate": "2024-04-01"
}

Response (201 Created):
{
  "installedPartId": 502,
  "partId": 201,
  "partName": "Battery Pack",
  "partNumber": "BP-001-LR",
  "manufacturer": "Panasonic",
  "vehicleId": 102,
  "vehicleName": "VinFast VF 8",
  "installationDate": "2024-04-01",
  "warrantyExpiryDate": "2032-04-01"
}
```

8. Frontend displays success confirmation
9. Frontend updates vehicle's installed parts list

---

### 5. View Service Center's Pending Claims
**Actor:** SC_STAFF

**Steps:**
1. Staff navigates to "Pending Claims" dashboard

**API Calls:**
```
GET /api/warranty-claims?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "warrantyClaimId": 1002,
      "claimDate": "2024-04-05T09:30:00",
      "status": "PENDING_ADMIN_APPROVAL",
      "description": "Customer reports battery degradation",
      ...
    },
    {
      "warrantyClaimId": 1003,
      "claimDate": "2024-04-05T14:00:00",
      "status": "ADMIN_APPROVED",
      ...
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

2. Frontend displays claims in sortable table
3. Frontend highlights claims by status:
   - PENDING_ADMIN_APPROVAL: Yellow
   - ADMIN_APPROVED: Blue (ready for technician)
   - IN_PROGRESS: Orange
   - COMPLETED: Green

4. Staff can filter by status, date range, vehicle, or customer

---

## Service Center Technician Flows

### 1. View Assigned Claims (Tech Pending Queue)
**Actor:** SC_TECHNICIAN

**Steps:**
1. Technician logs in and is presented with dashboard
2. Frontend loads pending claims:

**API Calls:**
```
GET /api/warranty-claims/tech-pending?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "warrantyClaimId": 1003,
      "claimDate": "2024-04-05T14:00:00",
      "status": "ADMIN_APPROVED",
      "description": "Motor overheating issue",
      "vehicleId": 103,
      "vehicleName": "Tesla Model Y",
      "vehicleVin": "5YJYGDEE7MF654321",
      "partName": "Electric Motor",
      "customerName": "Alice Johnson",
      "customerPhone": "0923456789"
    }
  ],
  ...
}
```

3. Frontend displays claims sorted by:
   - Priority (high/medium/low)
   - Date submitted (oldest first)
   - Warranty expiry date

---

### 2. Start Processing a Warranty Claim
**Actor:** SC_TECHNICIAN

**Steps:**
1. Technician selects a claim from pending queue
2. Technician reviews claim details (vehicle, part, issue description)
3. Technician clicks "Start Work" button

**API Calls:**
```
PATCH /api/warranty-claims/1003/tech-start
Authorization: Bearer <accessToken>
Request Body: (optional note as plain text)
"Starting diagnosis of motor issue"

Response (200 OK):
{
  "warrantyClaimId": 1003,
  "claimDate": "2024-04-05T14:00:00",
  "status": "IN_PROGRESS",
  "description": "Motor overheating issue",
  "comments": "Starting diagnosis of motor issue",
  "updatedBy": "tech_mike",
  "lastUpdated": "2024-04-06T08:00:00",
  ...
}
```

4. Frontend updates claim status to IN_PROGRESS
5. Frontend opens work log panel for technician to record activities

---

### 3. Log Work Activities
**Actor:** SC_TECHNICIAN

**Steps:**
1. While working on claim, technician periodically logs activities
2. Technician clicks "Add Work Log" button
3. Technician enters:
   - Description of work performed
   - Start time
   - End time (or click "Stop Timer")

4. Technician clicks "Save Log"

**API Calls:**
```
POST /api/work-logs
Authorization: Bearer <accessToken>
Request Body:
{
  "warrantyClaimId": 1003,
  "description": "Diagnosed motor overheating. Found faulty cooling sensor.",
  "startTime": "2024-04-06T08:00:00",
  "endTime": "2024-04-06T10:30:00"
}

Response (201 Created):
{
  "workLogId": 2003,
  "warrantyClaimId": 1003,
  "description": "Diagnosed motor overheating. Found faulty cooling sensor.",
  "startTime": "2024-04-06T08:00:00",
  "endTime": "2024-04-06T10:30:00",
  "userId": 5,
  "username": "tech_mike"
}
```

5. Frontend adds log entry to claim's work log list
6. Frontend calculates total hours spent on claim

---

### 4. Request Parts for Warranty Claim
**Actor:** SC_TECHNICIAN

**Pre-condition:** Claim status is IN_PROGRESS

**Steps:**
1. Technician determines that a part needs to be replaced
2. Technician clicks "Request Part" button on claim detail page
3. Frontend displays part request form
4. Technician searches for part in catalog:

**API Calls:**
```
GET /api/parts?search=cooling+sensor&page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "partId": 205,
      "partName": "Motor Cooling Sensor",
      "partNumber": "MCS-002",
      "manufacturer": "Bosch",
      "warrantyMonths": 24,
      "createdAt": "2023-06-01T00:00:00"
    }
  ],
  ...
}
```

5. Technician selects part
6. Technician enters quantity (usually 1 for warranty claims)
7. Technician enters reason/justification
8. Technician clicks "Submit Request"

**API Calls:**
```
POST /api/part-requests
Authorization: Bearer <accessToken>
Request Body:
{
  "warrantyClaimId": 1003,
  "partId": 205,
  "quantity": 1,
  "reason": "Faulty cooling sensor causing motor overheating"
}

Response (201 Created):
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

9. Frontend displays success message
10. Part request appears in "My Requests" section with status PENDING
11. Technician can monitor part request status

---

### 5. Monitor Part Request Status
**Actor:** SC_TECHNICIAN

**Steps:**
1. Technician navigates to "My Part Requests" page

**API Calls:**
```
GET /api/part-requests/my-requests?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "partRequestId": 5001,
      "warrantyClaimId": 1003,
      "partId": 205,
      "partName": "Motor Cooling Sensor",
      "quantity": 1,
      "requestDate": "2024-04-06T11:00:00",
      "status": "APPROVED",
      "reason": "Faulty cooling sensor causing motor overheating",
      "requestedBy": "tech_mike",
      "approvedBy": "evm_alice",
      "approvalDate": "2024-04-06T15:00:00"
    }
  ],
  ...
}
```

2. Frontend displays part requests with status badges:
   - PENDING: Yellow (awaiting approval)
   - APPROVED: Blue (approved, will be shipped)
   - SHIPPED: Purple (in transit)
   - DELIVERED: Green (received at service center)
   - REJECTED: Red (denied)
   - CANCELLED: Gray

3. When status changes to SHIPPED, frontend shows tracking number (if available)
4. When parts arrive, technician marks as DELIVERED:

**API Calls:**
```
PATCH /api/part-requests/5001/deliver
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "partRequestId": 5001,
  ...
  "status": "DELIVERED"
}
```

5. Technician can now proceed with part replacement

---

### 6. Complete Warranty Claim
**Actor:** SC_TECHNICIAN

**Pre-condition:**
- All necessary parts have been received
- Repair/replacement work is completed
- Vehicle tested and working properly

**Steps:**
1. Technician adds final work log entry describing completion
2. Technician clicks "Complete Claim" button
3. Frontend displays completion confirmation dialog
4. Technician enters completion notes (summary of work done)
5. Technician clicks "Confirm Completion"

**API Calls:**
```
PATCH /api/warranty-claims/1003/tech-complete?completionNote=Motor%20cooling%20sensor%20replaced.%20Motor%20temperature%20now%20normal.
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "warrantyClaimId": 1003,
  "claimDate": "2024-04-05T14:00:00",
  "status": "COMPLETED",
  "description": "Motor overheating issue",
  "resolutionDate": "2024-04-08T16:00:00",
  "comments": "Motor cooling sensor replaced. Motor temperature now normal.",
  "updatedBy": "tech_mike",
  "lastUpdated": "2024-04-08T16:00:00",
  ...
}
```

6. Frontend updates claim status to COMPLETED
7. Frontend displays success message
8. Claim is moved to "Completed Claims" section
9. Customer is notified (via email/SMS if configured)
10. Customer can now submit feedback for this claim

---

## EVM Staff Flows

### 1. Approve Part Request
**Actor:** EVM_STAFF

**Steps:**
1. EVM staff logs in and navigates to "Pending Part Requests"

**API Calls:**
```
GET /api/part-requests/pending?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "partRequestId": 5002,
      "warrantyClaimId": 1004,
      "partId": 210,
      "partName": "Inverter Board",
      "quantity": 1,
      "requestDate": "2024-04-07T10:00:00",
      "status": "PENDING",
      "reason": "Inverter failure detected during diagnostics",
      "requestedBy": "tech_sarah",
      "approvedBy": null,
      "approvalDate": null
    }
  ],
  ...
}
```

2. Staff reviews request details:
   - Part details
   - Warranty claim info
   - Technician's justification
   - Request date

3. Staff clicks "Approve" button
4. Frontend displays approval confirmation
5. Staff optionally enters approval notes
6. Staff clicks "Confirm Approval"

**API Calls:**
```
PATCH /api/part-requests/5002/approve?notes=Approved.%20Part%20available%20in%20warehouse.
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "partRequestId": 5002,
  "warrantyClaimId": 1004,
  "partId": 210,
  "partName": "Inverter Board",
  "quantity": 1,
  "requestDate": "2024-04-07T10:00:00",
  "status": "APPROVED",
  "reason": "Inverter failure detected during diagnostics",
  "requestedBy": "tech_sarah",
  "approvedBy": "evm_alice",
  "approvalDate": "2024-04-07T14:00:00"
}
```

7. Frontend updates request status to APPROVED
8. Technician is notified about approval
9. Part can now be prepared for shipment

---

### 2. Ship Approved Part Request
**Actor:** EVM_STAFF

**Pre-condition:** Part request status is APPROVED

**Steps:**
1. After physical shipment is arranged, staff updates status to SHIPPED
2. Staff navigates to approved part requests
3. Staff selects a request
4. Staff clicks "Mark as Shipped"
5. Frontend displays shipping dialog
6. Staff enters tracking number (optional)
7. Staff clicks "Confirm Shipment"

**API Calls:**
```
PATCH /api/part-requests/5002/ship?trackingNumber=VN1234567890
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "partRequestId": 5002,
  ...
  "status": "SHIPPED",
  "trackingNumber": "VN1234567890"
}
```

8. Frontend updates request status to SHIPPED
9. Technician receives notification with tracking number
10. Part is in transit to service center

---

### 3. Reject Part Request
**Actor:** EVM_STAFF

**Steps:**
1. Staff reviews part request and determines it should be rejected
   - Reasons: Part not covered by warranty, insufficient justification, etc.
2. Staff clicks "Reject" button
3. Frontend displays rejection dialog
4. Staff enters rejection reason (required)
5. Staff clicks "Confirm Rejection"

**API Calls:**
```
PATCH /api/part-requests/5003/reject?rejectionReason=Part%20damage%20appears%20to%20be%20due%20to%20improper%20use,%20not%20covered%20by%20warranty
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "partRequestId": 5003,
  ...
  "status": "REJECTED",
  "rejectionReason": "Part damage appears to be due to improper use, not covered by warranty"
}
```

6. Frontend updates request status to REJECTED
7. Technician is notified about rejection with reason
8. Technician can contact EVM staff for clarification or submit a new request with additional justification

---

### 4. Create Recall Request
**Actor:** EVM_STAFF

**Scenario:** Manufacturing defect identified in a batch of parts

**Steps:**
1. EVM staff navigates to "Create Recall" page
2. Staff searches for affected part:

**API Calls:**
```
GET /api/parts?search=battery&page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
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

3. Staff selects affected part
4. Frontend fetches all installed instances of this part:

**API Calls:**
```
GET /api/installed-parts/by-part/201?page=0&size=100
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "installedPartId": 501,
      "partId": 201,
      "partName": "Battery Pack",
      "partNumber": "BP-001-LR",
      "manufacturer": "Panasonic",
      "vehicleId": 101,
      "vehicleName": "Tesla Model 3",
      "installationDate": "2023-01-15",
      "warrantyExpiryDate": "2031-01-15"
    },
    {
      "installedPartId": 502,
      ...
    }
    // Could be hundreds of entries
  ],
  ...
}
```

5. Staff filters installations by criteria (e.g., installation date range, serial number batch)
6. Staff enters recall reason (detailed explanation of defect)
7. Staff clicks "Create Recall for Selected Parts"
8. Frontend creates recall request for EACH affected installed part:

**API Calls (executed in loop or batch):**
```
POST /api/recall-requests
Authorization: Bearer <accessToken>
Request Body:
{
  "installedPartId": 501,
  "reason": "Potential fire hazard due to manufacturing defect in battery cells produced between Jan-Mar 2023. Recall ID: RC-2024-001"
}

Response (201 Created):
{
  "recallRequestId": 4001,
  "installedPartId": 501,
  "partName": "Battery Pack",
  "partNumber": "BP-001-LR",
  "vehicleId": 101,
  "vehicleName": "Tesla Model 3",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "customerName": "John Doe",
  "reason": "Potential fire hazard due to manufacturing defect in battery cells produced between Jan-Mar 2023. Recall ID: RC-2024-001",
  "status": "PENDING_APPROVAL",
  "customerResponse": null,
  "customerResponseDate": null,
  "createdAt": "2024-04-10T09:00:00",
  "createdBy": "evm_alice"
}
```

9. Frontend displays summary of recall requests created
10. Recall requests are now visible to ADMIN/SC_STAFF for approval
11. Once approved by ADMIN, customers are notified via email/SMS

---

### 5. Manage Parts Catalog
**Actor:** EVM_STAFF

**Steps:**
1. **Add New Part:**

   a. Staff navigates to "Parts Catalog" page
   b. Staff clicks "Add New Part"
   c. Staff fills form:
      - Part name
      - Part number (unique identifier)
      - Manufacturer
      - Warranty period (in months)
   d. Staff clicks "Save Part"

**API Calls:**
```
POST /api/parts
Authorization: Bearer <accessToken>
Request Body:
{
  "partName": "Advanced Driver Assistance Module",
  "partNumber": "ADAM-005",
  "manufacturer": "Mobileye",
  "warrantyMonths": 36
}

Response (201 Created):
{
  "partId": 215,
  "partName": "Advanced Driver Assistance Module",
  "partNumber": "ADAM-005",
  "manufacturer": "Mobileye",
  "warrantyMonths": 36,
  "createdAt": "2024-04-10T10:00:00"
}
```

2. **Update Existing Part:**

   a. Staff searches for part
   b. Staff clicks "Edit" button
   c. Staff updates fields (e.g., warranty period extended)
   d. Staff clicks "Update Part"

**API Calls:**
```
PUT /api/parts/215
Authorization: Bearer <accessToken>
Request Body:
{
  "partName": "Advanced Driver Assistance Module",
  "partNumber": "ADAM-005",
  "manufacturer": "Mobileye",
  "warrantyMonths": 48
}

Response (200 OK):
{
  "partId": 215,
  "partName": "Advanced Driver Assistance Module",
  "partNumber": "ADAM-005",
  "manufacturer": "Mobileye",
  "warrantyMonths": 48,
  "createdAt": "2024-04-10T10:00:00"
}
```

---

## Admin Flows

### 1. Review and Approve Warranty Claim
**Actor:** ADMIN

**Steps:**
1. Admin logs in and navigates to "Pending Claims" dashboard

**API Calls:**
```
GET /api/warranty-claims/admin-pending?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "warrantyClaimId": 1005,
      "claimDate": "2024-04-10T11:00:00",
      "status": "PENDING_ADMIN_APPROVAL",
      "description": "Touchscreen display not responding",
      "installedPartId": 520,
      "partId": 220,
      "partName": "Central Display Unit",
      "partNumber": "CDU-010",
      "manufacturer": "Samsung",
      "vehicleId": 105,
      "vehicleName": "VinFast VF 9",
      "vehicleVin": "VF9VN2024XYZ98765",
      "customerId": "770fa622-g40d-63f6-c938-668877662222",
      "customerName": "Bob Wilson",
      "customerEmail": "bob@example.com",
      "customerPhone": "0934567890",
      "comments": null,
      "updatedBy": "staff_susan",
      "lastUpdated": "2024-04-10T11:00:00"
    }
  ],
  ...
}
```

2. Admin reviews claim details:
   - Customer information
   - Vehicle details
   - Part under warranty
   - Installation date
   - Warranty expiry date
   - Problem description from service center staff
   - Photos/evidence (if uploaded)

3. Admin verifies warranty is valid:
   - Check warranty expiry date
   - Check installation date
   - Verify part is genuine OEM part

4. **If Approved:**

   a. Admin clicks "Approve" button
   b. Admin optionally enters approval notes
   c. Admin may assign claim to themselves
   d. Admin clicks "Confirm Approval"

**API Calls:**
```
PATCH /api/warranty-claims/1005/admin-accept
Authorization: Bearer <accessToken>
Request Body: (optional note as plain text)
"Warranty valid. Approve for repair."

Response (200 OK):
{
  "warrantyClaimId": 1005,
  "claimDate": "2024-04-10T11:00:00",
  "status": "ADMIN_APPROVED",
  "description": "Touchscreen display not responding",
  "comments": "Warranty valid. Approve for repair.",
  "updatedBy": "admin_tom",
  "lastUpdated": "2024-04-10T14:00:00",
  ...
}
```

   e. Claim status changes to ADMIN_APPROVED
   f. Claim appears in technician's pending queue
   g. Service center is notified

5. **If Rejected:**

   a. Admin clicks "Reject" button
   b. Admin enters detailed rejection reason (required)
   c. Admin clicks "Confirm Rejection"

**API Calls:**
```
PATCH /api/warranty-claims/1005/admin-reject?reason=Warranty%20expired%20on%202024-03-01.%20Claim%20submitted%20after%20expiry.
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "warrantyClaimId": 1005,
  "claimDate": "2024-04-10T11:00:00",
  "status": "ADMIN_REJECTED",
  "description": "Touchscreen display not responding",
  "comments": "Warranty expired on 2024-03-01. Claim submitted after expiry.",
  "updatedBy": "admin_tom",
  "lastUpdated": "2024-04-10T14:00:00",
  ...
}
```

   d. Claim status changes to ADMIN_REJECTED
   e. Service center and customer are notified with rejection reason

---

### 2. Assign Claim to Self
**Actor:** ADMIN

**Use Case:** Admin wants to personally oversee a complex or high-value claim

**Steps:**
1. Admin views claim details
2. Admin clicks "Assign to Me" button

**API Calls:**
```
POST /api/warranty-claims/1005/assign-to-me
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "warrantyClaimId": 1005,
  ...
  "assignedToUserId": 3,
  "assignedToUsername": "admin_tom",
  "assignedToEmail": "tom@oemwarranty.com",
  "updatedBy": "admin_tom",
  "lastUpdated": "2024-04-10T14:05:00"
}
```

3. Frontend updates claim to show assignment
4. Claim appears in admin's "My Assigned Claims" list

---

### 3. View My Assigned Claims
**Actor:** ADMIN

**Steps:**
1. Admin navigates to "My Assigned Claims" page

**API Calls:**
```
GET /api/warranty-claims/my-assigned-claims?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "warrantyClaimId": 1005,
      ...
      "assignedToUserId": 3,
      "assignedToUsername": "admin_tom"
    }
  ],
  ...
}
```

2. Admin can monitor progress of assigned claims
3. Admin can override claim status if necessary using:
   - PATCH /api/warranty-claims/{id}/status

---

### 4. User Management
**Actor:** ADMIN

**Steps:**

**4.1 View All Users:**

```
GET /api/admin/users?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "userId": 42,
      "username": "john_doe",
      "email": "john@example.com",
      "roleName": "CUSTOMER",
      "roleId": 5,
      "isActive": true,
      "createdAt": "2023-01-10T12:00:00"
    },
    {
      "userId": 5,
      "username": "tech_mike",
      "email": "mike@servicecentre.com",
      "roleName": "SC_TECHNICIAN",
      "roleId": 4,
      "serviceCenterId": 1,
      "serviceCenterName": "Tesla Service Center Hanoi",
      "isActive": true,
      "createdAt": "2022-06-15T09:00:00"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

**4.2 Search Users:**

```
GET /api/admin/users/search?username=mike&page=0&size=10
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "userId": 5,
      "username": "tech_mike",
      ...
    }
  ],
  ...
}
```

**4.3 Filter Users by Role:**

```
GET /api/admin/users/by-role/SC_TECHNICIAN?page=0&size=20
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "content": [
    {
      "userId": 5,
      "username": "tech_mike",
      "roleName": "SC_TECHNICIAN",
      ...
    },
    {
      "userId": 12,
      "username": "tech_sarah",
      "roleName": "SC_TECHNICIAN",
      ...
    }
  ],
  ...
}
```

**4.4 Create New User:**

```
POST /api/auth/admin/create-user
Authorization: Bearer <accessToken>
Request Body:
{
  "username": "new_tech_john",
  "email": "john@servicecentre.com",
  "password": "TempPass123!",
  "roleId": 4
}

Response (201 Created):
{
  "success": true,
  "message": "User created successfully by Admin",
  "user": {
    "userId": 45,
    "username": "new_tech_john",
    "roleName": "SC_TECHNICIAN"
  }
}
```

**4.5 Change User Role:**

```
PATCH /api/admin/users/42/role?newRoleId=3
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "User role updated successfully",
  "userId": 42,
  "newRoleId": 3,
  "newRoleName": "SC_STAFF",
  "user": {
    "userId": 42,
    "username": "john_doe",
    "roleName": "SC_STAFF",
    ...
  }
}
```

**4.6 Reset User Password:**

```
POST /api/admin/users/42/reset-password
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Password reset successfully",
  "userId": 42,
  "newPassword": "TempRand567!",
  "note": "User should change password on next login"
}
```

**4.7 Delete User:**

```
DELETE /api/admin/users/42
Authorization: Bearer <accessToken>

Response (204 No Content)
```

---

### 5. View User Statistics
**Actor:** ADMIN

**Steps:**
1. Admin navigates to "User Statistics" dashboard

**API Calls:**
```
GET /api/admin/users/statistics
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "totalUsers": 150,
  "activeUsers": 145,
  "inactiveUsers": 5,
  "usersByRole": {
    "ADMIN": 2,
    "EVM_STAFF": 5,
    "SC_STAFF": 10,
    "SC_TECHNICIAN": 25,
    "CUSTOMER": 108
  },
  "newUsersThisMonth": 8,
  "newUsersThisWeek": 2
}
```

2. Frontend displays statistics with charts:
   - Pie chart: Users by role
   - Bar chart: New users over time
   - Gauge: Active vs inactive users

---

### 6. Manage Service Centers
**Actor:** ADMIN

**Steps:**

**6.1 Create Service Center:**

```
POST /api/service-centers
Authorization: Bearer <accessToken>
Request Body:
{
  "name": "VinFast Service Cau Giay",
  "address": "789 Cau Giay, Hanoi",
  "phone": "0247654321",
  "email": "caugiay@vinfastservice.com",
  "latitude": 21.0300,
  "longitude": 105.8000
}

Response (201 Created):
{
  "serviceCenterId": 3,
  "name": "VinFast Service Cau Giay",
  "address": "789 Cau Giay, Hanoi",
  "phone": "0247654321",
  "email": "caugiay@vinfastservice.com",
  "latitude": 21.0300,
  "longitude": 105.8000
}
```

**6.2 Update Service Center:**

```
PUT /api/service-centers/3
Authorization: Bearer <accessToken>
Request Body:
{
  "name": "VinFast Service Cau Giay",
  "address": "789 Cau Giay, Hanoi, Vietnam",
  "phone": "0247654321",
  "email": "caugiay@vinfastservice.com",
  "latitude": 21.0300,
  "longitude": 105.8000
}

Response (200 OK):
{
  "serviceCenterId": 3,
  ...
}
```

**6.3 Update Service Center Location:**

```
PATCH /api/service-centers/3/location?latitude=21.0310&longitude=105.8010
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "serviceCenterId": 3,
  ...
  "latitude": 21.0310,
  "longitude": 105.8010
}
```

**6.4 Delete Service Center:**

```
DELETE /api/service-centers/3
Authorization: Bearer <accessToken>

Response (204 No Content)
```

---

## Warranty Claim Lifecycle

### Complete Workflow from Creation to Completion

**Actors:** SC_STAFF, ADMIN, SC_TECHNICIAN, CUSTOMER

**Status Flow:**
```
PENDING_ADMIN_APPROVAL
  → ADMIN_APPROVED
  → IN_PROGRESS
  → COMPLETED

Alternative:
PENDING_ADMIN_APPROVAL
  → ADMIN_REJECTED (end)

ADMIN_APPROVED
  → CANCELLED (if needed)
```

### Detailed Step-by-Step Flow:

**Step 1: Claim Creation (SC_STAFF)**
- Customer visits service center with vehicle issue
- SC_STAFF creates warranty claim
- API: `POST /api/warranty-claims/sc-create`
- Initial Status: `PENDING_ADMIN_APPROVAL`

**Step 2: Admin Review (ADMIN)**
- Admin receives notification of new claim
- Admin reviews claim details, verifies warranty validity
- Admin decides: Approve or Reject

**Step 2a: If Approved**
- API: `PATCH /api/warranty-claims/{id}/admin-accept`
- Status changes to: `ADMIN_APPROVED`
- Service center notified
- Claim enters technician queue

**Step 2b: If Rejected**
- API: `PATCH /api/warranty-claims/{id}/admin-reject`
- Status changes to: `ADMIN_REJECTED`
- Customer and service center notified with reason
- **Workflow ends**

**Step 3: Technician Assignment (SC_TECHNICIAN)**
- Approved claim appears in technician's pending queue
- API: `GET /api/warranty-claims/tech-pending`
- Technician selects claim to work on

**Step 4: Start Processing (SC_TECHNICIAN)**
- Technician clicks "Start Work"
- API: `PATCH /api/warranty-claims/{id}/tech-start`
- Status changes to: `IN_PROGRESS`
- Claim removed from pending queue, added to "In Progress"

**Step 5: Diagnosis and Work Logging (SC_TECHNICIAN)**
- Technician diagnoses issue
- Technician logs work activities
- API: `POST /api/work-logs` (multiple times)
- Work logs are associated with claim

**Step 6: Part Request (if needed) (SC_TECHNICIAN)**
- If part replacement needed:
  - Technician creates part request
  - API: `POST /api/part-requests`
  - Part request status: `PENDING`

**Step 7: Part Request Approval (EVM_STAFF)**
- EVM staff reviews part request
- EVM staff approves:
  - API: `PATCH /api/part-requests/{id}/approve`
  - Part request status: `APPROVED`

**Step 8: Part Shipment (EVM_STAFF)**
- Parts prepared and shipped
- API: `PATCH /api/part-requests/{id}/ship`
- Part request status: `SHIPPED`

**Step 9: Part Delivery (SC_TECHNICIAN)**
- Parts arrive at service center
- Technician confirms receipt
- API: `PATCH /api/part-requests/{id}/deliver`
- Part request status: `DELIVERED`

**Step 10: Part Replacement (SC_TECHNICIAN)**
- Technician installs replacement part
- Technician logs work
- API: `POST /api/work-logs`

**Step 11: Claim Completion (SC_TECHNICIAN)**
- Repair completed and tested
- Technician clicks "Complete Claim"
- API: `PATCH /api/warranty-claims/{id}/tech-complete`
- Status changes to: `COMPLETED`
- Resolution date recorded

**Step 12: Customer Notification**
- Customer notified claim is completed (email/SMS)
- Vehicle ready for pickup

**Step 13: Customer Feedback (CUSTOMER)**
- Customer picks up vehicle
- Customer receives notification to submit feedback
- Customer submits feedback:
  - API: `POST /api/feedbacks`
  - Rating: 1-5 stars
  - Optional comments

**Step 14: Feedback Review (SC_STAFF / EVM_STAFF / ADMIN)**
- Staff can view feedback
- API: `GET /api/feedbacks/by-claim/{claimId}`
- Feedback used to improve service quality

---

## Part Request Lifecycle

### Complete Workflow from Request to Delivery

**Actors:** SC_TECHNICIAN, EVM_STAFF

**Status Flow:**
```
PENDING
  → APPROVED
  → SHIPPED
  → DELIVERED

Alternative:
PENDING
  → REJECTED (end)

PENDING
  → CANCELLED (by technician)
```

### Detailed Step-by-Step Flow:

**Step 1: Request Creation (SC_TECHNICIAN)**
- Technician working on warranty claim determines part replacement needed
- Technician searches parts catalog
- Technician creates part request
- API: `POST /api/part-requests`
- Initial Status: `PENDING`

**Step 2: EVM Staff Review (EVM_STAFF)**
- EVM staff views pending requests
- API: `GET /api/part-requests/pending`
- EVM staff reviews:
  - Part details
  - Warranty claim justification
  - Part availability in inventory

**Step 3a: Approval (EVM_STAFF)**
- EVM staff approves request
- API: `PATCH /api/part-requests/{id}/approve`
- Status changes to: `APPROVED`
- Technician notified of approval

**Step 3b: Rejection (EVM_STAFF)**
- EVM staff rejects request (e.g., part not covered by warranty)
- API: `PATCH /api/part-requests/{id}/reject`
- Status changes to: `REJECTED`
- Technician notified with rejection reason
- **Workflow ends**

**Step 4: Shipment (EVM_STAFF)**
- Parts picked from warehouse
- Shipment arranged with logistics
- Tracking number generated
- EVM staff updates status:
- API: `PATCH /api/part-requests/{id}/ship`
- Status changes to: `SHIPPED`
- Technician can track shipment

**Step 5: Delivery Confirmation (SC_TECHNICIAN)**
- Parts arrive at service center
- Technician receives parts
- Technician verifies parts against request
- Technician confirms delivery:
- API: `PATCH /api/part-requests/{id}/deliver`
- Status changes to: `DELIVERED`

**Step 6: Part Installation**
- Technician installs parts on vehicle
- Part installation recorded:
  - If new part: `POST /api/installed-parts`
  - If replacement: `PUT /api/installed-parts/{id}`
- Work logged: `POST /api/work-logs`

**Alternative: Cancellation (SC_TECHNICIAN)**
- If technician finds part not needed (e.g., issue resolved differently)
- Technician can cancel pending request
- API: `PATCH /api/part-requests/{id}/cancel`
- Status changes to: `CANCELLED`
- EVM staff notified

---

## Summary

This document provides comprehensive data flow scenarios covering:

1. **Authentication**: Login, token refresh, registration, password reset
2. **Customer Flows**: View vehicles, claims, submit feedback, find service centers
3. **SC Staff Flows**: Create claims, register customers/vehicles, record installations
4. **SC Technician Flows**: Process claims, log work, request parts, complete repairs
5. **EVM Staff Flows**: Approve part requests, ship parts, create recalls, manage catalog
6. **Admin Flows**: Approve claims, manage users, manage service centers, view statistics
7. **Complete Lifecycles**: Warranty claim and part request workflows from start to finish

Each flow includes:
- Actor roles
- Step-by-step actions
- Exact API calls with request/response examples
- Status transitions
- Error handling considerations

This specification enables frontend developers to implement all user journeys with complete API integration knowledge.
