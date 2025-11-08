# Quy Trình Nghiệp Vụ Bảo Hành (Warranty Business Rules)

## Tổng Quan

Hệ thống quản lý bảo hành OEM EV đã được mở rộng để hỗ trợ **kiểm tra tính hợp lệ của bảo hành** và **bảo hành tính phí** cho các trường hợp xe/linh kiện đã hết hạn bảo hành.

## Các Trạng Thái Bảo Hành

### WarrantyStatus Enum

| Trạng Thái | Mô Tả | Bảo Hành Miễn Phí | Bảo Hành Tính Phí |
|-----------|-------|-------------------|-------------------|
| `VALID` | Còn trong thời hạn bảo hành | ✅ Có | ❌ Không |
| `EXPIRED_DATE` | Hết hạn theo thời gian | ❌ Không | ✅ Có (trong grace period) |
| `EXPIRED_MILEAGE` | Hết hạn theo số km | ❌ Không | ✅ Có (trong grace period) |
| `EXPIRED_BOTH` | Hết hạn cả thời gian và km | ❌ Không | ✅ Có (trong grace period) |
| `PART_WARRANTY_EXPIRED` | Linh kiện hết hạn bảo hành | ❌ Không | ✅ Có (trong grace period) |

## Quy Tắc Kiểm Tra Bảo Hành

### 1. Bảo Hành Xe (Vehicle Warranty)

Bảo hành xe được kiểm tra dựa trên **điều kiện kép**:

- **Thời gian**: Ngày hiện tại ≤ `warrantyEndDate`
- **Số km**: `currentMileage` ≤ `mileageLimit` (mặc định: 100,000 km)

**Logic kiểm tra**:
```
IF (ngày hiện tại > warrantyEndDate) AND (mileage > mileageLimit) THEN
    Status = EXPIRED_BOTH
ELSE IF (ngày hiện tại > warrantyEndDate) THEN
    Status = EXPIRED_DATE
ELSE IF (mileage > mileageLimit) THEN
    Status = EXPIRED_MILEAGE
ELSE
    Status = VALID
```

### 2. Bảo Hành Linh Kiện (Installed Part Warranty)

Bảo hành linh kiện kiểm tra **cả bảo hành xe VÀ bảo hành riêng của linh kiện**:

1. Kiểm tra `installedPart.warrantyExpirationDate`
2. Kiểm tra `vehicle.warrantyEndDate` và `vehicle.mileage`
3. Áp dụng điều kiện nghiêm ngặt nhất

**Ví dụ**:
- Xe còn bảo hành đến 2026-01-01
- Battery (linh kiện) hết bảo hành 2025-06-01
- → Trạng thái: `PART_WARRANTY_EXPIRED`

## Bảo Hành Tính Phí (Paid Warranty)

### Grace Period

Hệ thống cho phép bảo hành tính phí trong **180 ngày** (6 tháng) sau khi hết hạn.

**Business Logic**:
```
IF (warrantyStatus != VALID) AND (daysExpired <= 180) THEN
    canProvidePaidWarranty = TRUE
ELSE
    canProvidePaidWarranty = FALSE
```

### Công Thức Tính Phí

Phí bảo hành được tính dựa trên:
1. **Chi phí sửa chữa ước tính** (estimatedRepairCost)
2. **Thời gian quá hạn** (daysExpired)

**Công thức**:
```
feePercentage = MIN_FEE_PERCENTAGE + (MAX_FEE_PERCENTAGE - MIN_FEE_PERCENTAGE) × (daysExpired / GRACE_PERIOD_DAYS)

warrantyFee = MAX(BASE_FEE, estimatedRepairCost × feePercentage)
```

**Tham số**:
- `MIN_FEE_PERCENTAGE` = 20% (ngày đầu quá hạn)
- `MAX_FEE_PERCENTAGE` = 50% (ngày cuối grace period)
- `BASE_FEE` = 500,000 VNĐ (phí tối thiểu)
- `GRACE_PERIOD_DAYS` = 180 ngày

**Ví dụ Tính Phí**:

| Ngày Quá Hạn | Chi Phí Sửa Chữa | Phần Trăm Phí | Phí Bảo Hành |
|--------------|------------------|---------------|--------------|
| 0 ngày | 2,000,000 VNĐ | 20% | 500,000 VNĐ |
| 30 ngày | 2,000,000 VNĐ | 25% | 500,000 VNĐ |
| 90 ngày | 2,000,000 VNĐ | 35% | 700,000 VNĐ |
| 180 ngày | 2,000,000 VNĐ | 50% | 1,000,000 VNĐ |
| 200 ngày | 2,000,000 VNĐ | - | ❌ Không được bảo hành |

## API Endpoints

### 1. Kiểm Tra Bảo Hành Xe

**Endpoint**: `GET /api/warranty-validation/vehicle/{vehicleId}`

**Request**:
```
GET /api/warranty-validation/vehicle/123
Authorization: Bearer {token}
```

**Response**:
```json
{
  "warrantyStatus": "VALID",
  "statusDescription": "Còn trong thời hạn bảo hành",
  "isValidForFreeWarranty": true,
  "canProvidePaidWarranty": false,
  "warrantyStartDate": "2023-01-15",
  "warrantyEndDate": "2026-01-15",
  "daysRemaining": 365,
  "currentMileage": 45000,
  "mileageLimit": 100000,
  "mileageRemaining": 55000,
  "vehicleId": 123,
  "vehicleVin": "1HGBH41JXMN109186",
  "vehicleName": "Tesla Model 3",
  "expirationReasons": "Bảo hành còn hiệu lực"
}
```

### 2. Kiểm Tra Bảo Hành Theo VIN

**Endpoint**: `GET /api/warranty-validation/vehicle/vin/{vin}`

**Use Case**: Tra cứu nhanh không cần biết vehicleId

### 3. Kiểm Tra Bảo Hành Linh Kiện

**Endpoint**: `GET /api/warranty-validation/installed-part/{installedPartId}`

### 4. Tính Phí Bảo Hành

**Endpoint**: `GET /api/warranty-validation/vehicle/{vehicleId}/calculate-fee?estimatedRepairCost=2000000`

**Response**:
```json
{
  "warrantyStatus": "EXPIRED_DATE",
  "statusDescription": "Hết hạn bảo hành theo thời gian",
  "isValidForFreeWarranty": false,
  "canProvidePaidWarranty": true,
  "estimatedWarrantyFee": 700000,
  "feeNote": "Phí bảo hành: 700,000 VNĐ\nLý do: Quá hạn bảo hành 90 ngày. \nPhí bao gồm: Chi phí linh kiện, công sửa chữa, và phí quản lý.\nLưu ý: Phí có thể thay đổi tùy thuộc vào tình trạng thực tế của xe.",
  "daysRemaining": -90,
  "expirationReasons": "Hết hạn bảo hành theo cả thời gian (quá 90 ngày)"
}
```

## Quy Trình Tạo Warranty Claim

### Kịch Bản 1: Bảo Hành Miễn Phí (Còn Hạn)

1. **Customer/SC_STAFF** kiểm tra bảo hành:
   ```
   GET /api/warranty-validation/vehicle/123
   → warrantyStatus = VALID
   ```

2. Tạo warranty claim:
   ```json
   POST /api/warranty-claims
   {
     "vehicleId": 123,
     "installedPartId": 456,
     "description": "Pin bị sụt áp, không sạc được",
     "isPaidWarranty": false
   }
   ```

3. Hệ thống tự động set:
   - `warrantyStatus = VALID`
   - `isPaidWarranty = false`
   - `warrantyFee = null`

### Kịch Bản 2: Bảo Hành Tính Phí (Hết Hạn)

1. **SC_STAFF** kiểm tra bảo hành:
   ```
   GET /api/warranty-validation/vehicle/123
   → warrantyStatus = EXPIRED_DATE
   → canProvidePaidWarranty = true
   ```

2. Tính phí bảo hành:
   ```
   GET /api/warranty-validation/vehicle/123/calculate-fee?estimatedRepairCost=2000000
   → estimatedWarrantyFee = 700000 VNĐ
   ```

3. **SC_STAFF** tư vấn khách hàng về phí

4. **Khách hàng đồng ý** → Tạo claim với phí:
   ```json
   POST /api/warranty-claims
   {
     "vehicleId": 123,
     "installedPartId": 456,
     "description": "Pin bị sụt áp, không sạc được",
     "isPaidWarranty": true,
     "estimatedRepairCost": 2000000,
     "warrantyFee": 700000,
     "paidWarrantyNote": "Khách hàng đồng ý thanh toán phí bảo hành 700,000 VNĐ. Xe quá hạn 90 ngày."
   }
   ```

5. Hệ thống lưu:
   - `warrantyStatus = EXPIRED_DATE`
   - `isPaidWarranty = true`
   - `warrantyFee = 700000`
   - `paidWarrantyNote = "..."`

### Kịch Bản 3: Từ Chối Bảo Hành (Quá Grace Period)

1. Kiểm tra bảo hành:
   ```
   GET /api/warranty-validation/vehicle/123
   → daysRemaining = -200
   → canProvidePaidWarranty = false
   ```

2. **SC_STAFF** thông báo khách hàng: "Xe đã quá hạn bảo hành 200 ngày, vượt quá thời hạn cho phép (180 ngày). Không thể áp dụng bảo hành tính phí."

## Database Schema

### Thêm Cột Mới Vào `warranty_claims`

```sql
ALTER TABLE warranty_claims
ADD COLUMN warranty_status VARCHAR(30),
ADD COLUMN is_paid_warranty BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN warranty_fee DECIMAL(10, 2),
ADD COLUMN paid_warranty_note NVARCHAR(500);
```

## Security & Permissions

| Endpoint | CUSTOMER | SC_STAFF | SC_TECHNICIAN | ADMIN |
|----------|----------|----------|---------------|-------|
| GET /warranty-validation/vehicle/{id} | ✅ (own vehicles) | ✅ | ❌ | ✅ |
| GET /warranty-validation/vehicle/vin/{vin} | ✅ (own vehicles) | ✅ | ❌ | ✅ |
| GET /warranty-validation/installed-part/{id} | ❌ | ✅ | ✅ | ✅ |
| GET /warranty-validation/vehicle/{id}/calculate-fee | ❌ | ✅ | ❌ | ✅ |
| GET /warranty-validation/installed-part/{id}/calculate-fee | ❌ | ✅ | ❌ | ✅ |

## Testing Scenarios

### Test Case 1: Valid Warranty
- **Given**: Vehicle với warrantyEndDate = 2026-01-01, mileage = 30,000 km
- **When**: Kiểm tra ngày 2025-06-01
- **Then**: Status = VALID, isValidForFreeWarranty = true

### Test Case 2: Expired by Date
- **Given**: Vehicle với warrantyEndDate = 2024-12-31, mileage = 30,000 km
- **When**: Kiểm tra ngày 2025-06-01
- **Then**: Status = EXPIRED_DATE, canProvidePaidWarranty = true

### Test Case 3: Expired by Mileage
- **Given**: Vehicle với warrantyEndDate = 2026-01-01, mileage = 120,000 km
- **When**: Kiểm tra ngày 2025-06-01
- **Then**: Status = EXPIRED_MILEAGE, canProvidePaidWarranty = true

### Test Case 4: Beyond Grace Period
- **Given**: Vehicle hết hạn 200 ngày trước
- **When**: Tính phí bảo hành
- **Then**: canProvidePaidWarranty = false

## Lưu Ý Implementation

1. **Validation**: Khi tạo claim với `isPaidWarranty=true`, phải có `warrantyFee > 0`
2. **Audit**: Lưu `warrantyStatus` tại thời điểm tạo claim để tracking
3. **Business Logic**: Service layer phải kiểm tra warranty status trước khi approve claim
4. **Customer Communication**: Frontend cần hiển thị rõ ràng phí bảo hành và lý do tính phí
5. **Payment**: Tích hợp với payment gateway để thu phí bảo hành (future enhancement)

## Tài Liệu Tham Khảo

- [WarrantyStatus.java](../src/main/java/com/swp391/warrantymanagement/enums/WarrantyStatus.java)
- [WarrantyValidationService.java](../src/main/java/com/swp391/warrantymanagement/service/WarrantyValidationService.java)
- [WarrantyValidationController.java](../src/main/java/com/swp391/warrantymanagement/controller/WarrantyValidationController.java)
- [WarrantyClaim.java](../src/main/java/com/swp391/warrantymanagement/entity/WarrantyClaim.java)
