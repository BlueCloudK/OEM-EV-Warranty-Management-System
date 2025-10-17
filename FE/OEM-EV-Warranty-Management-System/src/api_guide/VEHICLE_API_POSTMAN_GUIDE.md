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

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

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

### 2. Get Vehicle by ID
**GET** `/api/vehicles/{id}`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER only

**Path Parameters:**
- `id`: Vehicle ID

**Note:** Customers chỉ có thể xem vehicles của mình thông qua business logic filtering

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
  "customerName": "John Doe"
}
```

### 3. Create Vehicle
**POST** `/api/vehicles`

**Permissions:** ADMIN, EVM_STAFF ,SC_STAFF only

**Request Body:**
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

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Path Parameters:**
- `id`: Vehicle ID

**Request Body:**
```json
{
  "vehicleName": "Tesla Model 3 Updated",
  "vehicleModel": "Model 3 Long Range",
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleYear": 2023,
  "vehicleColor": "Red",
  "vehicleEngine": "Electric Motor",
  "customerId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 5. Delete Vehicle
**DELETE** `/api/vehicles/{id}`

**Permissions:** ADMIN, EVM_STAFF only

**Path Parameters:**
- `id`: Vehicle ID

**Response Success (204):** No Content

### 6. Get Vehicles by Customer ID
**GET** `/api/vehicles/by-customer/{customerId}`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Path Parameters:**
- `customerId`: Customer UUID

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

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
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### 7. Get My Vehicles (Customer Self-Service)
**GET** `/api/vehicles/my-vehicles`

**Permissions:** CUSTOMER only

**Description:** Customer xem danh sách vehicles của mình

**Query Parameters:**
- `page` (optional): Số trang (default: 0)
- `size` (optional): Kích thước trang (default: 10)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

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
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### 8. Get Vehicle by VIN
**GET** `/api/vehicles/by-vin`

**Permissions:** ADMIN, EVM_STAFF, SC_STAFF only

**Query Parameters:**
- `vin` (required): Vehicle VIN number

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

### Get Vehicle by ID
```
Method: GET
URL: http://localhost:8080/api/vehicles/1
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
  "vehicleName": "Tesla Model Y",
  "vehicleModel": "Model Y Long Range",
  "vehicleVin": "5YJ3E1EA4KF123456",
  "vehicleYear": 2024,
  "vehicleColor": "Blue",
  "vehicleEngine": "Dual Motor AWD",
  "customerId": "456e7890-e89b-12d3-a456-426614174001"
}
```

### Update Vehicle
```
Method: PUT
URL: http://localhost:8080/api/vehicles/1
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "vehicleName": "Tesla Model 3 Updated",
  "vehicleModel": "Model 3 Long Range",
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleYear": 2023,
  "vehicleColor": "Red",
  "vehicleEngine": "Electric Motor",
  "customerId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Delete Vehicle
```
Method: DELETE
URL: http://localhost:8080/api/vehicles/1
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Vehicles by Customer ID
```
Method: GET
URL: http://localhost:8080/api/vehicles/by-customer/123e4567-e89b-12d3-a456-426614174000?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get My Vehicles (Customer)
```
Method: GET
URL: http://localhost:8080/api/vehicles/my-vehicles?page=0&size=10
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Get Vehicle by VIN
```
Method: GET
URL: http://localhost:8080/api/vehicles/by-vin?vin=1HGBH41JXMN109186
Headers:
  Authorization: Bearer {{jwt_token}}
```
