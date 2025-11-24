# Backend Requirements for Sorting Implementation

## 📋 Overview

Frontend đã implement sorting cho 13 management pages. Backend cần hỗ trợ sorting parameters cho các API endpoints tương ứng.

---

## 🔧 Required Changes

### General Pattern

Tất cả các API endpoints cần hỗ trợ 2 query parameters:

```java
@RequestParam(required = false) String sortBy
@RequestParam(required = false) String sortDir  // "ASC" or "DESC"
```

**Default behavior:** Nếu không có `sortBy` hoặc `sortDir`, backend nên sử dụng default sorting (thường là ID DESC hoặc createdAt DESC).

---

## 📊 API Endpoints Cần Update

### 1. **Warranty Claims APIs**

#### Endpoint: `GET /api/warranty-claims`

**Sortable fields:**

- `warrantyClaimId` (hoặc `claimId`)
- `vehicleVin`
- `partName`
- `createdAt` (hoặc `claimDate`)
- `status`

**Example:**

```
GET /api/warranty-claims?page=0&size=10&sortBy=createdAt&sortDir=DESC
```

---

### 2. **Vehicles APIs**

#### Endpoint: `GET /api/vehicles`

**Sortable fields:**

- `vehicleId`
- `vehicleVin`
- `vehicleName`
- `vehicleModel`
- `vehicleYear`
- `purchaseDate`

**Example:**

```
GET /api/vehicles?page=0&size=10&sortBy=vehicleVin&sortDir=ASC
```

---

### 3. **Parts APIs**

#### Endpoint: `GET /api/parts`

**Sortable fields:**

- `partId`
- `partName`
- `partNumber`
- `category.categoryName` (hoặc `categoryName` nếu join)
- `manufacturer`
- `price`
- `stockQuantity`

**Example:**

```
GET /api/parts?page=0&size=10&sortBy=partName&sortDir=ASC
```

---

### 4. **Part Categories APIs**

#### Endpoint: `GET /api/part-categories`

**Sortable fields:**

- `categoryId`
- `categoryName`
- `maxQuantityPerVehicle`
- `partCount` (nếu có computed field)
- `isActive`

**Example:**

```
GET /api/part-categories?page=0&size=10&sortBy=categoryName&sortDir=ASC
```

---

### 5. **Customers APIs**

#### Endpoint: `GET /api/customers`

**Sortable fields:**

- `customerId`
- `name`
- `email`
- `phone`

**Example:**

```
GET /api/customers?page=0&size=10&sortBy=name&sortDir=ASC
```

**Note:** Cần hỗ trợ cả search endpoint:

```
GET /api/customers/search/by-name?name=...&page=0&size=10&sortBy=name&sortDir=ASC
```

---

### 6. **Users APIs**

#### Endpoint: `GET /api/users` (Admin)

**Sortable fields:**

- `id`
- `username`
- `email`

**Example:**

```
GET /api/users?page=0&size=10&sortBy=username&sortDir=ASC
```

---

### 7. **Service Histories APIs**

#### Endpoint: `GET /api/service-histories`

**Sortable fields:**

- `serviceHistoryId`
- `vehicleName`
- `vehicleVin`
- `serviceDate`

**Example:**

```
GET /api/service-histories?page=0&size=10&sortBy=serviceDate&sortDir=DESC
```

---

## 🎯 Implementation Recommendations

### Spring Data JPA Approach

```java
@GetMapping("/api/warranty-claims")
public Page<WarrantyClaim> getAllClaims(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(required = false) String sortBy,
    @RequestParam(required = false) String sortDir,
    @RequestParam(required = false) String search,
    @RequestParam(required = false) String status
) {
    // Create Sort object
    Sort sort = Sort.unsorted();
    if (sortBy != null && !sortBy.isEmpty()) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        sort = Sort.by(direction, sortBy);
    } else {
        // Default sort
        sort = Sort.by(Sort.Direction.DESC, "createdAt");
    }
    
    Pageable pageable = PageRequest.of(page, size, sort);
    
    // Use pageable in repository query
    return claimRepository.findAll(pageable);
}
```

### Handling Nested Fields

Cho fields như `category.categoryName`, có 2 cách:

**Option 1: Join và sort trực tiếp**

```java
Sort sort = Sort.by(direction, "category.categoryName");
```

**Option 2: Map field name**

```java
String actualField = sortBy;
if ("categoryName".equals(sortBy)) {
    actualField = "category.categoryName";
}
Sort sort = Sort.by(direction, actualField);
```

---

## ⚠️ Important Notes

### 1. **Validation**

Backend nên validate `sortBy` field để tránh SQL injection:

```java
private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
    "claimId", "vehicleVin", "partName", "createdAt", "status"
);

if (sortBy != null && !ALLOWED_SORT_FIELDS.contains(sortBy)) {
    throw new IllegalArgumentException("Invalid sort field: " + sortBy);
}
```

### 2. **Default Sorting**

Mỗi endpoint nên có default sorting hợp lý:

- **Claims/Histories:** `createdAt DESC` hoặc `serviceDate DESC`
- **Master data (Parts, Vehicles, etc.):** `id DESC` hoặc `name ASC`

### 3. **Compatibility**

Đảm bảo sorting works với:

- ✅ Pagination
- ✅ Search/filtering
- ✅ Existing query parameters

### 4. **Performance**

- Đảm bảo có **indexes** trên các sortable columns
- Đặc biệt quan trọng cho: `createdAt`, `serviceDate`, `name`, `email`, `vin`

---

## 📝 Testing Checklist

Cho mỗi endpoint, test:

- [ ] Sort ascending works
- [ ] Sort descending works
- [ ] Default sort (no params) works
- [ ] Sort + pagination works
- [ ] Sort + search works
- [ ] Sort + filters works
- [ ] Invalid field name returns error
- [ ] Case-insensitive direction ("asc", "ASC", "desc", "DESC")

---

## 🔍 Endpoints Summary

| Endpoint | Default Sort | Priority |
|----------|-------------|----------|
| `/api/warranty-claims` | `createdAt DESC` | High |
| `/api/vehicles` | `vehicleId DESC` | High |
| `/api/parts` | `partId DESC` | High |
| `/api/part-categories` | `categoryId DESC` | High |
| `/api/customers` | `customerId DESC` | High |
| `/api/users` | `id DESC` | Medium |
| `/api/service-histories` | `serviceDate DESC` | Medium |

---

## 📌 Next Steps

1. **Review** danh sách endpoints và sortable fields
2. **Implement** sorting cho từng endpoint theo priority
3. **Add validation** cho sort fields
4. **Add indexes** cho performance
5. **Test** thoroughly với frontend
6. **Document** API changes trong Swagger/OpenAPI

---

## 💡 Example API Documentation

```yaml
/api/warranty-claims:
  get:
    parameters:
      - name: page
        in: query
        schema:
          type: integer
          default: 0
      - name: size
        in: query
        schema:
          type: integer
          default: 10
      - name: sortBy
        in: query
        schema:
          type: string
          enum: [claimId, vehicleVin, partName, createdAt, status]
      - name: sortDir
        in: query
        schema:
          type: string
          enum: [ASC, DESC]
          default: DESC
```
