# User Management API Guide

## 📋 Overview
This guide provides comprehensive documentation for the User Management API endpoints. These endpoints are exclusively for ADMIN users to manage system users, roles, and permissions.

**Base URL:** `/api/admin/users`  
**Authentication:** JWT Token required  
**Authorization:** ADMIN role only  

---

## 🔐 Authentication Required

All endpoints require:
```
Authorization: Bearer {jwt_token}
```

**Role Required:** ADMIN only

---

## 📊 API Endpoints

### 1. Get All Users with Pagination & Filtering

**GET** `/api/admin/users`

**Description:** Retrieve paginated list of all users with optional search and role filtering.

**Query Parameters:**
- `page` (optional): Page number starting from 0 (default: 0)
- `size` (optional): Number of items per page (default: 10)  
- `search` (optional): Search by username or email
- `role` (optional): Filter by role name (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER)

**Example Request:**
```bash
GET /api/admin/users?page=0&size=20&search=john&role=CUSTOMER
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
```json
{
  "content": [
    {
      "userId": 5,
      "username": "john_customer",
      "email": "john@email.com",
      "address": "123 Main St, Ho Chi Minh City",
      "roleName": "CUSTOMER",
      "roleId": 5,
      "createdAt": "2024-01-15T10:30:00.000+00:00"
    },
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
  "pageSize": 20,
  "totalElements": 125,
  "totalPages": 7,
  "first": true,
  "last": false
}
```

---

### 2. Get User by ID

**GET** `/api/admin/users/{userId}`

**Description:** Retrieve detailed information for a specific user.

**Path Parameters:**
- `userId`: The unique ID of the user

**Example Request:**
```bash
GET /api/admin/users/5
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
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

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found with id: 999"
}
```

---

### 3. Search Users by Username

**GET** `/api/admin/users/search`

**Description:** Search for users by username with pagination.

**Query Parameters:**
- `username` (required): Username to search for (partial match)
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)

**Example Request:**
```bash
GET /api/admin/users/search?username=john&page=0&size=10
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
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

---

### 4. Get Users by Role

**GET** `/api/admin/users/by-role/{roleName}`

**Description:** Get all users with a specific role.

**Path Parameters:**
- `roleName`: Role name (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER)

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)

**Example Request:**
```bash
GET /api/admin/users/by-role/SC_STAFF?page=0&size=15
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
```json
{
  "content": [
    {
      "userId": 8,
      "username": "jane_staff",
      "email": "jane@company.com",
      "address": "456 Office St",
      "roleName": "SC_STAFF",
      "roleId": 3,
      "createdAt": "2024-02-20T14:15:00.000+00:00"
    }
  ],
  "pageNumber": 0,
  "pageSize": 15,
  "totalElements": 15,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

---

### 5. Update User Information

**PUT** `/api/admin/users/{userId}`

**Description:** Update user information such as username, email, or address.

**Path Parameters:**
- `userId`: The unique ID of the user to update

**Request Body:**
```json
{
  "username": "new_username",
  "email": "newemail@company.com", 
  "address": "New Address 123, District 1, Ho Chi Minh City"
}
```

**Example Request:**
```bash
PUT /api/admin/users/5
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "email": "john.doe.updated@email.com",
  "address": "789 New Street, District 3, Ho Chi Minh City"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "userId": 5,
  "updatedFields": ["email", "address"],
  "user": {
    "userId": 5,
    "username": "john_customer",
    "email": "john.doe.updated@email.com",
    "address": "789 New Street, District 3, Ho Chi Minh City",
    "roleName": "CUSTOMER",
    "roleId": 5,
    "createdAt": "2024-01-15T10:30:00.000+00:00"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists: john@existing.com"
}
```

---

### 6. Update User Role

**PATCH** `/api/admin/users/{userId}/role`

**Description:** Change a user's role. Use with extreme caution as this affects permissions.

**Path Parameters:**
- `userId`: The unique ID of the user

**Query Parameters:**
- `newRoleId` (required): The ID of the new role to assign

**Example Request:**
```bash
PATCH /api/admin/users/5/role?newRoleId=3
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Role not found with id: 999"
}
```

---

### 7. Delete User

**DELETE** `/api/admin/users/{userId}`

**Description:** Delete a user account. **Use with extreme caution!** This operation should implement soft delete to preserve data integrity.

**Path Parameters:**
- `userId`: The unique ID of the user to delete

**Example Request:**
```bash
DELETE /api/admin/users/5
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "userId": 5
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete user: User has active warranty claims"
}
```

---

### 8. Reset User Password

**POST** `/api/admin/users/{userId}/reset-password`

**Description:** Reset a user's password. If no new password is provided, a secure random password will be generated.

**Path Parameters:**
- `userId`: The unique ID of the user

**Query Parameters:**
- `newPassword` (optional): New password to set. If not provided, system generates a random password.

**Example Request (with custom password):**
```bash
POST /api/admin/users/5/reset-password?newPassword=NewSecurePass123!
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Example Request (auto-generate password):**
```bash
POST /api/admin/users/5/reset-password
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200) - Auto-generated:**
```json
{
  "success": true,
  "message": "User password reset successfully",
  "userId": 5,
  "newPassword": "A8k9L2mN5pQ7",
  "note": "Please share this password securely with the user"
}
```

**Response (200) - Custom password:**
```json
{
  "success": true,
  "message": "User password reset successfully",
  "userId": 5
}
```

---

### 9. Get User Statistics

**GET** `/api/admin/users/statistics`

**Description:** Get comprehensive statistics about users in the system.

**Example Request:**
```bash
GET /api/admin/users/statistics
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
```json
{
  "totalUsers": 125,
  "activeUsers": 118,
  "inactiveUsers": 7,
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

---

## ⚠️ Important Security Notes

### 🔒 Role-Based Access Control
- **ALL endpoints require ADMIN role**
- Users with other roles will receive `403 Forbidden`
- JWT token must be valid and not expired

### 🛡️ Data Validation
- **Username uniqueness:** System prevents duplicate usernames
- **Email uniqueness:** System prevents duplicate emails  
- **Role validation:** Only valid role IDs are accepted
- **Input sanitization:** All inputs are validated and sanitized

### 🚨 Sensitive Operations
- **Role changes:** Affect user permissions immediately
- **Password resets:** Generate secure audit logs
- **User deletion:** Should implement soft delete for data integrity
- **Statistics access:** May contain sensitive user counts

---

## 🔍 Error Handling

### Common Error Responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Username already exists: duplicate_user"
}
```

**403 Forbidden:**
```json
{
  "error": "Access Denied",
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found with id: 999"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Database connection error"
}
```

---

## 📋 Business Rules

### User Management Constraints:
1. **Admin Protection:** Cannot delete the last ADMIN user
2. **Role Hierarchy:** Some role changes may require additional validation
3. **Active Claims:** Users with active warranty claims may require special handling for deletion
4. **Audit Trail:** All user changes should be logged for compliance

### Data Integrity:
1. **Soft Delete:** User deletion should preserve data relationships
2. **Cascade Updates:** Role changes update related permissions immediately
3. **Password Security:** Generated passwords meet security requirements
4. **Session Management:** Role changes may invalidate existing user sessions

---

## 🧪 Testing Examples

### Test Scenario 1: Create and Manage Staff User
```bash
# 1. Get current user statistics
GET /api/admin/users/statistics

# 2. Search for existing staff
GET /api/admin/users/by-role/SC_STAFF

# 3. Create new staff via auth endpoint (ADMIN creates user)
POST /api/auth/admin/create-user
{
  "username": "new_technician",
  "email": "tech@company.com",
  "password": "TempPass123!",
  "address": "Tech Center, District 7",
  "roleId": 4
}

# 4. Update user information
PUT /api/admin/users/{newUserId}
{
  "address": "Updated Tech Center Address"
}

# 5. Change role from SC_TECHNICIAN to SC_STAFF
PATCH /api/admin/users/{userId}/role?newRoleId=3
```

### Test Scenario 2: User Search and Password Management
```bash
# 1. Search for users by username
GET /api/admin/users/search?username=john

# 2. Get specific user details  
GET /api/admin/users/5

# 3. Reset password (auto-generate)
POST /api/admin/users/5/reset-password

# 4. Reset password (custom)
POST /api/admin/users/5/reset-password?newPassword=CustomPass123!
```

---

## 📚 Related Documentation

- **[Authentication API Guide](./AUTH_API_POSTMAN_GUIDE.md)** - For user creation and login
- **[Role-Based Access Control](./ROLE_BASED_ACCESS_CONTROL.md)** - For understanding permissions
- **[Complete API Documentation](./COMPLETE_API_DOCUMENTATION.md)** - For full system overview

---

## 🏷️ Version Information

**API Version:** 1.1  
**Last Updated:** October 14, 2025  
**Status:** ✅ Production Ready  

**Security Features:**
- ✅ JWT Authentication
- ✅ Role-based authorization  
- ✅ Input validation
- ✅ Error handling
- ✅ Audit logging support

**Business Logic:**
- ✅ User lifecycle management
- ✅ Role hierarchy enforcement
- ✅ Data integrity protection
- ✅ Statistics and reporting
