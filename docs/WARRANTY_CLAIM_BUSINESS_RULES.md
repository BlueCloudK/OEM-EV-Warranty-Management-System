# Warranty Claim Business Rules

## Table of Contents
1. [Warranty Hierarchy Model](#warranty-hierarchy-model)
2. [Warranty Types](#warranty-types)
3. [Claim Workflow](#claim-workflow)
4. [Grace Period Rules](#grace-period-rules)
5. [Status Transitions](#status-transitions)
6. [Payment Workflow](#payment-workflow)
7. [Validation Rules](#validation-rules)
8. [Role-Based Permissions](#role-based-permissions)

---

## Warranty Hierarchy Model

### Overview
Hệ thống sử dụng **Hierarchy Warranty Model** để xác định warranty áp dụng cho từng loại linh kiện.

### Part Categories

#### 1. Extended Warranty Parts (Linh kiện bảo hành mở rộng)
**Đặc điểm:**
- `Part.hasExtendedWarranty = true`
- Các linh kiện QUAN TRỌNG, đắt tiền (Battery, Motor, Controller)
- Có warranty riêng độc lập với xe

**Warranty Check:**
- ✅ Kiểm tra `InstalledPart.warrantyExpirationDate`
- ✅ Kiểm tra `mileageSinceInstallation` vs `Part.defaultWarrantyMileage`
- ❌ KHÔNG kiểm tra warranty của xe

**Ví dụ:**
```
Battery Pack - hasExtendedWarranty = true
- Warranty: 8 years or 160,000 km (theo linh kiện)
- Xe có thể hết bảo hành sau 5 năm nhưng battery vẫn còn bảo hành
```

#### 2. Standard Parts (Linh kiện thường)
**Đặc điểm:**
- `Part.hasExtendedWarranty = false` hoặc `null`
- Các linh kiện THƯỜNG (Đèn, gương, nội thất, phanh)
- Bảo hành theo xe

**Warranty Check:**
- ✅ Kiểm tra `Vehicle.warrantyEndDate`
- ✅ Kiểm tra `Vehicle.mileage` vs mileage limit
- ❌ KHÔNG kiểm tra warranty của linh kiện

**Ví dụ:**
```
Headlight - hasExtendedWarranty = false
- Warranty: Theo xe (3 năm hoặc 100,000 km)
- Nếu xe còn bảo hành → Linh kiện được bảo hành
- Nếu xe hết bảo hành → Linh kiện không được bảo hành miễn phí
```

---

## Warranty Types

### 1. Free Warranty (Bảo hành miễn phí)

**Điều kiện:**
- Còn trong thời hạn bảo hành (theo hierarchy model)
- HOẶC Thời gian bảo hành chưa vượt quá mileage limit
- Warranty status = `VALID`

**Claim Creation:**
- Initial status: `SUBMITTED`
- Không cần thanh toán phí
- `isPaidWarranty = false`
- `warrantyFee = null`

**Workflow:**
```
SUBMITTED → MANAGER_REVIEW → PROCESSING → COMPLETED
```

### 2. Paid Warranty (Bảo hành tính phí)

**Điều kiện:**
- Hết hạn bảo hành NHƯNG vẫn trong grace period
- Warranty status = `EXPIRED_DATE` | `EXPIRED_MILEAGE` | `EXPIRED_BOTH`
- Grace period: Mặc định 180 ngày (có thể config theo Part)

**Claim Creation:**
- Initial status: `PENDING_PAYMENT` ⚠️
- Yêu cầu thanh toán phí trước khi xử lý
- `isPaidWarranty = true`
- `warrantyFee` được tính tự động (20%-50% của estimated repair cost)

**Workflow:**
```
PENDING_PAYMENT → PAYMENT_CONFIRMED → MANAGER_REVIEW → PROCESSING → COMPLETED
       ↓                   ↓
(Customer pays)    (Staff confirms)
```

**Fee Calculation:**
```java
daysExpired = |daysRemaining|
progressRatio = daysExpired / gracePeriodDays

feePercentage = minFee% + (maxFee% - minFee%) × progressRatio
warrantyFee = estimatedRepairCost × feePercentage

// Default: 20%-50% based on days expired
// Minimum fee: 500,000 VNĐ
```

---

## Claim Workflow

### Complete Status Flow

```
┌─────────────┐
│  SUBMITTED  │ ◄── Free warranty claims start here
└──────┬──────┘
       │
       ├──────► MANAGER_REVIEW → PROCESSING → COMPLETED
       │                ↓            ↓
       │            REJECTED    REJECTED
       │
       └──────► REJECTED

┌──────────────────┐
│ PENDING_PAYMENT  │ ◄── Paid warranty claims start here
└────────┬─────────┘
         │
         ├──────► PAYMENT_CONFIRMED → MANAGER_REVIEW → PROCESSING → COMPLETED
         │              ↓                   ↓            ↓
         │          REJECTED           REJECTED    REJECTED
         │
         └──────► REJECTED (if customer doesn't pay)
```

### Status Descriptions

| Status | Vietnamese | Description | Next Valid Status |
|--------|-----------|-------------|-------------------|
| `SUBMITTED` | Tiếp nhận | Free warranty claim đã tạo, chờ manager review | MANAGER_REVIEW, REJECTED |
| `PENDING_PAYMENT` | Chờ thanh toán | Paid warranty claim, chờ customer thanh toán | PAYMENT_CONFIRMED, REJECTED |
| `PAYMENT_CONFIRMED` | Đã xác nhận thanh toán | Staff đã xác nhận nhận được thanh toán | MANAGER_REVIEW, REJECTED |
| `MANAGER_REVIEW` | Manager đang xem xét | Manager review và assign technician | PROCESSING, REJECTED |
| `PROCESSING` | Đang xử lý | Technician đang sửa chữa | COMPLETED, REJECTED |
| `COMPLETED` | Hoàn tất | Claim đã hoàn thành (final) | - |
| `REJECTED` | Từ chối | Claim bị từ chối (final) | - |

---

## Grace Period Rules

### Definition
**Grace Period:** Thời gian cho phép tạo paid warranty claim SAU KHI warranty đã hết hạn.

### Default Configuration
```java
DEFAULT_GRACE_PERIOD_DAYS = 180 // 6 months
DEFAULT_MIN_FEE_PERCENTAGE = 20% // 0.20
DEFAULT_MAX_FEE_PERCENTAGE = 50% // 0.50
BASE_FEE = 500,000 VNĐ
```

### Part-Specific Configuration
Mỗi Part có thể config riêng:
```java
Part {
  gracePeriodDays: Integer           // Overrides default
  paidWarrantyFeePercentageMin: Decimal  // Overrides default
  paidWarrantyFeePercentageMax: Decimal  // Overrides default
}
```

**Ví dụ:**
```
Battery Pack:
- gracePeriodDays = 365 (1 năm)
- minFeePercentage = 15%
- maxFeePercentage = 40%
→ High-value part = longer grace, lower fee

Headlight:
- gracePeriodDays = 90 (3 tháng)
- minFeePercentage = 30%
- maxFeePercentage = 60%
→ Low-value part = shorter grace, higher fee
```

### Validation Logic

```java
// 1. Check warranty expiration
if (expirationDate.isBefore(today)) {
    long daysExpired = ChronoUnit.DAYS.between(expirationDate, today);

    // 2. Get grace period (Part config or default)
    int gracePeriod = part.getGracePeriodDays() ?? DEFAULT_GRACE_PERIOD_DAYS;

    // 3. Check if within grace period
    if (daysExpired <= gracePeriod) {
        // ✅ Can create PAID warranty claim
        canProvidePaidWarranty = true;
        isPaidWarranty = REQUIRED;
    } else {
        // ❌ Cannot create claim - beyond grace period
        throw IllegalArgumentException("Grace period expired");
    }
}
```

---

## Status Transitions

### Valid Transitions Matrix

| From Status | To Status | Condition | Performed By |
|------------|-----------|-----------|--------------|
| `SUBMITTED` | `MANAGER_REVIEW` | Free warranty claim approved | Manager/Admin |
| `SUBMITTED` | `REJECTED` | Claim rejected | Manager/Admin |
| `PENDING_PAYMENT` | `PAYMENT_CONFIRMED` | Customer paid, staff confirmed | SC_STAFF/Admin |
| `PENDING_PAYMENT` | `REJECTED` | Customer didn't pay or claim invalid | SC_STAFF/Admin |
| `PAYMENT_CONFIRMED` | `MANAGER_REVIEW` | Payment verified, ready for review | Manager/Admin |
| `PAYMENT_CONFIRMED` | `REJECTED` | Payment issue or claim invalid | Manager/Admin |
| `MANAGER_REVIEW` | `PROCESSING` | Technician assigned and started work | SC_TECHNICIAN |
| `MANAGER_REVIEW` | `REJECTED` | Manager rejected after review | Manager/Admin |
| `PROCESSING` | `COMPLETED` | Work completed successfully | SC_TECHNICIAN |
| `PROCESSING` | `REJECTED` | Cannot be completed | SC_TECHNICIAN |
| `COMPLETED` | - | Final state | - |
| `REJECTED` | - | Final state | - |

### Implementation
```java
private boolean isValidStatusTransition(WarrantyClaimStatus current, WarrantyClaimStatus target) {
    switch (current) {
        case SUBMITTED:
            return target == MANAGER_REVIEW || target == REJECTED;

        case PENDING_PAYMENT:
            return target == PAYMENT_CONFIRMED || target == REJECTED;

        case PAYMENT_CONFIRMED:
            return target == MANAGER_REVIEW || target == REJECTED;

        case MANAGER_REVIEW:
            return target == PROCESSING || target == REJECTED;

        case PROCESSING:
            return target == COMPLETED || target == REJECTED;

        default:
            return false; // Cannot transition from final states
    }
}
```

---

## Payment Workflow

### Step 1: Claim Creation (Paid Warranty)

**Frontend Flow:**
1. User chọn xe và linh kiện
2. System validate warranty → `isValidForFreeWarranty = false`, `canProvidePaidWarranty = true`
3. User nhập estimated repair cost
4. System calculate warranty fee (auto)
5. User xác nhận và submit

**Backend:**
```java
// WarrantyClaimMapper.toEntity()
if (requestDTO.isPaidWarranty) {
    entity.setStatus(WarrantyClaimStatus.PENDING_PAYMENT); // ⚠️ Not SUBMITTED
    entity.setWarrantyFee(requestDTO.getWarrantyFee());
    entity.setIsPaidWarranty(true);
}
```

**Result:**
- Claim created với status = `PENDING_PAYMENT`
- `warrantyFee` field populated
- Hiển thị trong payment queue

### Step 2: Customer Payment

**Methods:**
- Cash payment tại service center
- Bank transfer với proof
- QR code payment (future)

**Staff Action:**
Không cần customer action trong system - staff xác nhận payment offline.

### Step 3: Payment Confirmation

**API Endpoint:**
```http
PUT /api/warranty-claims/{id}/confirm-payment
Authorization: Bearer <token>
Roles: SC_STAFF, ADMIN
```

**Backend:**
```java
@Override
@Transactional
public WarrantyClaimResponseDTO confirmPayment(Long claimId) {
    WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
        .orElseThrow(() -> new ResourceNotFoundException(...));

    // Validate status
    if (claim.getStatus() != WarrantyClaimStatus.PENDING_PAYMENT) {
        throw new IllegalStateException("Must be in PENDING_PAYMENT status");
    }

    // Update status
    claim.setStatus(WarrantyClaimStatus.PAYMENT_CONFIRMED);
    return WarrantyClaimMapper.toResponseDTO(warrantyClaimRepository.save(claim));
}
```

**Result:**
- Status → `PAYMENT_CONFIRMED`
- Claim ready for manager review
- Cannot be cancelled without refund process

### Step 4: Move to Review

**API Endpoint:**
```http
PUT /api/warranty-claims/{id}/status
{
  "status": "MANAGER_REVIEW"
}
Authorization: Bearer <token>
Roles: ADMIN, EVM_MANAGER
```

**Result:**
- Status → `MANAGER_REVIEW`
- Same workflow as free warranty claims from this point

---

## Validation Rules

### 1. Vehicle & Part Validation

```java
// Vehicle must exist
Vehicle vehicle = vehicleRepository.findById(vehicleId)
    .orElseThrow(() -> new ResourceNotFoundException(...));

// Installed part must exist
InstalledPart installedPart = installedPartRepository.findById(installedPartId)
    .orElseThrow(() -> new ResourceNotFoundException(...));

// Part must belong to vehicle
if (!installedPart.getVehicle().getId().equals(vehicleId)) {
    throw new IllegalArgumentException("Part not installed on this vehicle");
}
```

### 2. Warranty Expiration Validation (HIERARCHY MODEL)

```java
LocalDate today = LocalDate.now();
Part part = installedPart.getPart();
Vehicle vehicle = installedPart.getVehicle();

// Determine expiration date based on hierarchy
LocalDate expirationDate;
if (part.hasExtendedWarranty) {
    // Extended warranty part → Check PART warranty
    expirationDate = installedPart.getWarrantyExpirationDate();
} else {
    // Standard part → Check VEHICLE warranty
    expirationDate = vehicle.getWarrantyEndDate();
}

// Check expiration
if (expirationDate.isBefore(today)) {
    long daysExpired = ChronoUnit.DAYS.between(expirationDate, today);
    int gracePeriod = part.getGracePeriodDays() ?? DEFAULT_GRACE_PERIOD_DAYS;

    if (daysExpired <= gracePeriod) {
        // Within grace period
        if (!requestDTO.isPaidWarranty) {
            throw new IllegalArgumentException("Expired warranty requires paid claim");
        }
    } else {
        // Beyond grace period
        throw new IllegalArgumentException("Cannot create claim - beyond grace period");
    }
}
```

### 3. Paid Warranty Fee Validation

```java
if (requestDTO.isPaidWarranty) {
    // Fee must be provided
    if (requestDTO.warrantyFee == null || requestDTO.warrantyFee <= 0) {
        throw new IllegalArgumentException("Warranty fee required for paid claims");
    }

    // Fee must meet minimum
    if (requestDTO.warrantyFee < BASE_FEE) {
        throw new IllegalArgumentException("Fee below minimum: " + BASE_FEE);
    }
}
```

### 4. Mileage Validation

```java
// For extended warranty parts
int mileageSinceInstallation = vehicle.getMileage() - installedPart.getMileageAtInstallation();
Integer mileageLimit = installedPart.getWarrantyMileageLimit();

if (mileageLimit != null && mileageSinceInstallation > mileageLimit) {
    // Mileage expired - same grace period logic applies
}
```

---

## Role-Based Permissions

### SC_STAFF (Service Center Staff)

**Can:**
- ✅ Create warranty claims (free or paid)
- ✅ View all claims
- ✅ Confirm payment (`/confirm-payment`)
- ✅ Update claim description/parts (SUBMITTED or PENDING_PAYMENT only)
- ✅ Delete claims (SUBMITTED or PENDING_PAYMENT status only)

**Cannot:**
- ❌ Approve claims for processing
- ❌ Assign technicians
- ❌ Complete claims
- ❌ Delete claims in PROCESSING/COMPLETED

### SC_TECHNICIAN

**Can:**
- ✅ View assigned claims
- ✅ Start processing (`/tech-start`)
- ✅ Complete claims (`/tech-complete`)
- ✅ Create work logs

**Cannot:**
- ❌ Create new claims
- ❌ Confirm payments
- ❌ Change claim status (except PROCESSING → COMPLETED)

### EVM_MANAGER / ADMIN

**Can:**
- ✅ All SC_STAFF permissions
- ✅ Approve claims (SUBMITTED → MANAGER_REVIEW)
- ✅ Move paid claims to review (PAYMENT_CONFIRMED → MANAGER_REVIEW)
- ✅ Assign technicians
- ✅ Reject claims at any stage
- ✅ Delete any claim (ADMIN only)
- ✅ View all service history

**Cannot:**
- ❌ Start processing as technician (role-specific)

### CUSTOMER

**Can:**
- ✅ View their own claims
- ✅ Track claim status
- ✅ View warranty information for their vehicles

**Cannot:**
- ❌ Create claims directly (must go through SC_STAFF)
- ❌ Update claim status
- ❌ Access other customers' claims

---

## API Endpoints Summary

### Claim Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/warranty-claims` | List all claims (paginated) | SC_STAFF, ADMIN |
| GET | `/api/warranty-claims/{id}` | Get claim details | SC_STAFF, ADMIN, CUSTOMER |
| POST | `/api/warranty-claims` | Create new claim | SC_STAFF, ADMIN |
| PUT | `/api/warranty-claims/{id}` | Update claim info | SC_STAFF, ADMIN |
| DELETE | `/api/warranty-claims/{id}` | Delete claim | SC_STAFF (limited), ADMIN |

### Status Workflow

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| PUT | `/api/warranty-claims/{id}/status` | Update claim status | ADMIN, EVM_MANAGER |
| PUT | `/api/warranty-claims/{id}/confirm-payment` | Confirm payment received | SC_STAFF, ADMIN |
| PATCH | `/api/warranty-claims/{id}/tech-start` | Technician start work | SC_TECHNICIAN |
| PATCH | `/api/warranty-claims/{id}/tech-complete` | Technician complete work | SC_TECHNICIAN |

### Warranty Validation

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/warranty-validation/vehicle/{id}` | Check vehicle warranty | SC_STAFF, ADMIN |
| GET | `/api/warranty-validation/part/{id}` | Check part warranty | SC_STAFF, ADMIN |
| POST | `/api/warranty-validation/calculate-fee` | Calculate paid warranty fee | SC_STAFF, ADMIN |

---

## Common Scenarios

### Scenario 1: Free Warranty Claim
```
1. Customer đến service center với vấn đề battery
2. Staff check: Battery lắp 2 năm trước, còn warranty 6 năm
   → isValidForFreeWarranty = true
3. Staff tạo claim:
   - isPaidWarranty = false
   - status = SUBMITTED
   - warrantyFee = null
4. Manager review → MANAGER_REVIEW
5. Assign technician → PROCESSING
6. Technician sửa xong → COMPLETED
```

### Scenario 2: Paid Warranty Claim (Within Grace Period)
```
1. Customer đến với headlight hỏng
2. Staff check: Xe mua 3.5 năm trước, warranty 3 năm
   → Hết hạn 6 tháng (180 ngày)
   → canProvidePaidWarranty = true (within grace period)
3. Staff nhập estimated repair cost: 3,000,000 VNĐ
4. System calculate fee: ~900,000 VNĐ (30% - mid-range)
5. Staff tạo claim:
   - isPaidWarranty = true
   - status = PENDING_PAYMENT
   - warrantyFee = 900,000 VNĐ
6. Customer thanh toán 900,000 VNĐ cash
7. Staff confirm payment → PAYMENT_CONFIRMED
8. Manager move to review → MANAGER_REVIEW
9. Normal workflow từ đây...
```

### Scenario 3: Cannot Create Claim (Beyond Grace Period)
```
1. Customer đến với xe đã hết bảo hành 2 năm (730 ngày)
2. Staff check warranty:
   → isValidForFreeWarranty = false
   → canProvidePaidWarranty = false (beyond 180 day grace)
3. System reject:
   - Error: "Grace period expired"
   - Cannot create claim
4. Staff inform customer: Phải thanh toán đầy đủ chi phí sửa chữa
```

### Scenario 4: Extended Warranty Part (Battery)
```
1. Customer có xe 5 năm (vehicle warranty hết)
2. Nhưng battery lắp 3 năm trước, warranty 8 năm
3. Staff check: Battery còn warranty 5 năm
   → Part.hasExtendedWarranty = true
   → Check installedPart.warrantyExpirationDate (NOT vehicle)
   → isValidForFreeWarranty = true
4. Tạo FREE warranty claim dù xe đã hết bảo hành
```

---

## Database Schema Reference

### WarrantyClaim Table
```sql
CREATE TABLE warranty_claim (
    warranty_claim_id BIGINT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    installed_part_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,  -- PENDING_PAYMENT, SUBMITTED, etc.
    description NVARCHAR(500),
    claim_date DATETIME NOT NULL DEFAULT GETDATE(),
    resolution_date DATETIME,
    assigned_to_user_id BIGINT,

    -- Paid warranty fields
    is_paid_warranty BIT NOT NULL DEFAULT 0,
    warranty_fee DECIMAL(10,2),
    paid_warranty_note NVARCHAR(500),

    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id),
    FOREIGN KEY (installed_part_id) REFERENCES installed_part(installed_part_id),
    FOREIGN KEY (assigned_to_user_id) REFERENCES user(user_id)
);
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `is_paid_warranty` | Boolean | `true` = paid warranty, `false` = free warranty |
| `warranty_fee` | Decimal | Phí bảo hành (VNĐ), null for free warranty |
| `paid_warranty_note` | String | Note về phí (auto-generated) |
| `status` | Enum | Current workflow status |
| `claim_date` | DateTime | Ngày tạo claim |
| `resolution_date` | DateTime | Ngày hoàn thành (null if not completed) |

---

## Change Log

### Version 1.2 (Current)
- ✅ Added PENDING_PAYMENT and PAYMENT_CONFIRMED status
- ✅ Paid warranty claims auto-set to PENDING_PAYMENT
- ✅ Status transition validation includes payment workflow
- ✅ Hierarchy warranty model implemented in claim creation

### Version 1.1
- ✅ Hierarchy warranty model (Extended vs Standard parts)
- ✅ Grace period support with Part-specific config
- ✅ Warranty fee calculation based on days expired

### Version 1.0
- ✅ Basic claim creation and workflow
- ✅ Status management
- ✅ Role-based permissions

---

## Future Enhancements

### Planned Features
- [ ] Online payment integration (VNPay, Momo)
- [ ] Email notifications for status changes
- [ ] Customer self-service portal
- [ ] Automated warranty reminder (expiring soon)
- [ ] Analytics dashboard (claim trends, success rate)
- [ ] Part replacement history tracking
- [ ] Warranty cost center reporting

### Under Consideration
- [ ] Multi-language support
- [ ] Mobile app for technicians
- [ ] Real-time claim tracking
- [ ] Customer satisfaction survey
- [ ] Warranty extension purchase

---

## Contact & Support

**Technical Owner:** Development Team
**Business Owner:** EVM Manager
**Last Updated:** 2025-01-12
**Version:** 1.2
