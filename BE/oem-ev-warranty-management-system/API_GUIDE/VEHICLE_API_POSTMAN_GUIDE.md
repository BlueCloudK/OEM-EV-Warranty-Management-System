# Vehicle API Guide

## Overview
Vehicle API cho hệ thống OEM EV Warranty Management với JWT authentication và role-based authorization.

## Base URL
```
http://localhost:8080/api/vehicles
```

## Authentication
**Tất cả endpoints đều yêu cầu JWT token** (trừ public endpoints)

**Header:**
```
Authorization: Bearer {jwt_token}
```

## Endpoints

### 1. Get All Vehicles
**GET** `/api/vehicles`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN only

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10) 
- `search` (optional): Tìm kiếm theo tên hoặc model

**Response Success (200):**
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

**Postman Setup:**
```
Method: GET
URL: http://localhost:8080/api/vehicles?page=0&size=10&search=Tesla
Headers:
  Authorization: Bearer {{jwt_token}}
```

### 2. Get Vehicle by ID
**GET** `/api/vehicles/{id}`

**Permissions:** 
- ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN: Any vehicle
- CUSTOMER: Own vehicles only

**Path Parameters:**
- `id`: Vehicle ID

**Response Success (200):**
```json
{
  "vehicleId": 1,
  "vehicleName": "Tesla Model 3",
  "vehicleModel": "Model 3 Standard Range",
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleYear": 2023,
  "vehicleColor": "White",
  "vehicleEngine": "Electric Motor",
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "warrantyInfo": {
    "warrantyStartDate": "2023-01-15",
    "warrantyEndDate": "2031-01-15",
    "isUnderWarranty": true
  },
  "serviceHistory": [
    {
      "serviceHistoryId": 1,
      "serviceDate": "2024-09-15",
      "serviceType": "MAINTENANCE",
      "serviceDescription": "Regular maintenance check"
    }
  ]
}
```

### 3. Create Vehicle
**POST** `/api/vehicles`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Request Body:**
```json
{
  "vehicleName": "Tesla Model Y",
  "vehicleModel": "Model Y Long Range",
  "vehicleVin": "5YJ3E1EA8KF123456",
  "vehicleYear": 2024,
  "vehicleColor": "Red",
  "vehicleEngine": "Electric Motor",
  "customerId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response Success (201):**
```json
{
  "vehicleId": 2,
  "vehicleName": "Tesla Model Y",
  "vehicleModel": "Model Y Long Range",
  "vehicleVin": "5YJ3E1EA8KF123456",
  "vehicleYear": 2024,
  "vehicleColor": "Red",
  "vehicleEngine": "Electric Motor",
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe",
  "createdDate": "2024-10-09"
}
```

### 4. Update Vehicle
**PUT** `/api/vehicles/{id}`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Path Parameters:**
- `id`: Vehicle ID

**Request Body:**
```json
{
  "vehicleName": "Tesla Model 3 Updated",
  "vehicleModel": "Model 3 Long Range",
  "vehicleColor": "Blue",
  "vehicleEngine": "Electric Motor",
  "customerId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 5. Delete Vehicle
**DELETE** `/api/vehicles/{id}`

**Permissions:** ADMIN, EVM_STAFF only

**Path Parameters:**
- `id`: Vehicle ID

**Response Success (204):** No content

### 6. Get My Vehicles (Customer endpoint)
**GET** `/api/vehicles/my-vehicles`

**Permissions:** CUSTOMER only

**Response Success (200):**
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
      "warrantyInfo": {
        "warrantyStartDate": "2023-01-15",
        "warrantyEndDate": "2031-01-15",
        "isUnderWarranty": true
      },
      "recentServices": [
        {
          "serviceDate": "2024-09-15",
          "serviceType": "MAINTENANCE"
        }
      ]
    }
  ]
}
```

### 7. Search Vehicles by VIN
**GET** `/api/vehicles/search/vin/{vin}`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN only

**Path Parameters:**
- `vin`: Vehicle VIN

**Response Success (200):**
```json
{
  "vehicleId": 1,
  "vehicleName": "Tesla Model 3",
  "vehicleVin": "1HGBH41JXMN109186",
  "customerId": "123e4567-e89b-12d3-a456-426614174000",
  "customerName": "John Doe"
}
```

## Postman Collection Examples

### Get All Vehicles
```
Method: GET
URL: http://localhost:8080/api/vehicles?page=0&size=10&search=Tesla
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Create Vehicle
```
Method: POST
URL: http://localhost:8080/api/vehicles
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "vehicleName": "New Vehicle",
  "vehicleModel": "Model X",
  "vehicleVin": "NEWVIN123456789",
  "vehicleYear": 2024,
  "vehicleColor": "Black",
  "vehicleEngine": "Electric Motor",
  "customerId": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Error Responses

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions to access vehicle data"
}
```

### 404 Not Found
```json
{
  "error": "Vehicle not found",
  "message": "Vehicle with ID 123 does not exist"
}
```

## Note on Access Levels
- **CUSTOMER**: Chỉ có thể xem vehicles của mình thông qua endpoint `/my-vehicles` hoặc specific vehicle ID nếu sở hữu
- **SC_TECHNICIAN**: Có thể xem tất cả vehicles nhưng không thể tạo/sửa/xóa
- **SC_STAFF, EVM_STAFF**: Có thể CRUD vehicles
- **ADMIN**: Full access tất cả operations
