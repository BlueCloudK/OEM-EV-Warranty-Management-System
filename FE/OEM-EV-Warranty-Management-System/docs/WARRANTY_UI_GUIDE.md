# Warranty Business Rules UI - Usage Guide

## Overview

The Hierarchy Warranty Model has been fully integrated into the frontend application, providing comprehensive warranty validation and paid warranty support.

## Features

### 1. **SC Staff Warranty Claims Management** (`/scstaff/warranty-claims`)

#### Creating a New Warranty Claim

**Flow**:
1. Click "Tạo Yêu cầu" (Create Request) button
2. **Step 1**: Select Vehicle and Installed Part
   - Choose a vehicle from dropdown
   - Select an installed part for that vehicle
   - Click "Tiếp tục" (Continue)

3. **Step 2**: Automatic Warranty Validation
   - System automatically checks warranty status
   - Shows visual indicator:
     - 🟢 **Green**: Valid free warranty
     - 🟠 **Orange**: Expired but eligible for paid warranty
     - 🔴 **Red**: Cannot provide warranty (beyond grace period)

4. **Step 3**: Fill Claim Details
   - Enter problem description (minimum 10 characters)
   - If paid warranty:
     - Warranty fee is auto-calculated and displayed
     - Can adjust fee if needed
     - Payment notice is shown
   - Click "Tạo Claim" to submit

#### Viewing Claims

The claims table now shows:
- **Loại BH**: Warranty type (Miễn phí / Tính phí)
- **Phí**: Warranty fee amount (if paid warranty)
- Enhanced status filter with payment-related statuses:
  - Tiếp nhận (SUBMITTED)
  - Chờ thanh toán (PENDING_PAYMENT)
  - Đã xác nhận thanh toán (PAYMENT_CONFIRMED)
  - Manager đang xem xét (MANAGER_REVIEW)
  - Đang xử lý (PROCESSING)
  - Hoàn thành (COMPLETED)
  - Từ chối (REJECTED)

### 2. **Customer Warranty Checker** (`/customer/warranty-checker`)

#### Features

Customers can independently check warranty status without creating a claim.

**Two Check Modes**:

1. **Vehicle-Level Warranty Check**:
   - Select "Kiểm tra Bảo hành Xe" tab
   - Choose a vehicle
   - View comprehensive warranty information:
     - Warranty start/end dates
     - Days remaining
     - Current mileage vs. limit
     - Mileage remaining
     - Warranty status

2. **Part-Level Warranty Check**:
   - Select "Kiểm tra Bảo hành Linh kiện" tab
   - Choose a vehicle
   - Select an installed part
   - View part-specific warranty info
   - Extended warranty parts (Battery, Motor) show part-level warranty
   - Standard parts show vehicle-level warranty

#### Paid Warranty Fee Calculation

For expired warranties within grace period:
- Enter estimated repair cost
- System calculates warranty fee based on:
  - Days expired
  - Part-specific fee percentages
  - Minimum fee threshold (500,000 VNĐ)
- Fee increases linearly from min% to max% over grace period

## Components

### PaidWarrantyClaimForm

**Location**: `src/components/PaidWarrantyClaimForm.jsx`

**Props**:
- `vehicleId`: ID of the vehicle
- `installedPartId`: ID of the installed part
- `onSuccess`: Callback when claim is successfully created
- `onCancel`: Callback when form is cancelled

**Features**:
- 3-step wizard interface
- Integrated warranty validation
- Auto-fill warranty fee from validation
- Visual status indicators
- Payment notices for paid warranties

### WarrantyChecker

**Location**: `src/components/WarrantyChecker.jsx`

**Props**:
- `vehicleId`: ID of vehicle to check (optional)
- `installedPartId`: ID of installed part to check (optional)
- `onWarrantyChecked`: Callback with warranty validation result

**Features**:
- Color-coded status badges
- Detailed warranty information display
- Fee calculation form
- Visual progress indicators
- Responsive design

## API Integration

### warrantyValidation API

**Location**: `src/api/warrantyValidation.js`

**Endpoints**:

1. **Check Vehicle Warranty**
   ```javascript
   warrantyValidationApi.validateVehicleWarranty(vehicleId)
   ```

2. **Check Vehicle Warranty by VIN**
   ```javascript
   warrantyValidationApi.validateVehicleWarrantyByVin(vehicleVin)
   ```

3. **Check Installed Part Warranty**
   ```javascript
   warrantyValidationApi.validateInstalledPartWarranty(installedPartId)
   ```

4. **Calculate Paid Warranty Fee for Vehicle**
   ```javascript
   warrantyValidationApi.calculatePaidWarrantyFee(vehicleId, estimatedRepairCost)
   ```

5. **Calculate Paid Warranty Fee for Part**
   ```javascript
   warrantyValidationApi.calculatePaidWarrantyFeeForPart(installedPartId, estimatedRepairCost)
   ```

**Response Structure**:
```javascript
{
  warrantyStatus: "VALID" | "EXPIRED_DATE" | "EXPIRED_MILEAGE" | "EXPIRED_BOTH" | "PART_WARRANTY_EXPIRED",
  statusDescription: string,
  isValidForFreeWarranty: boolean,
  canProvidePaidWarranty: boolean,
  estimatedWarrantyFee: number,
  feeNote: string,
  warrantyStartDate: string,
  warrantyEndDate: string,
  daysRemaining: number,
  currentMileage: number,
  mileageLimit: number,
  mileageRemaining: number,
  vehicleId: number,
  vehicleVin: string,
  vehicleName: string,
  installedPartId: number,
  partName: string,
  expirationReasons: string
}
```

## Business Rules

### Free Warranty Eligibility

Vehicle/Part is eligible for free warranty if:
- Current date ≤ Warranty end date **AND**
- Current mileage ≤ Mileage limit

### Paid Warranty Eligibility

Paid warranty is available if:
- Warranty has expired **AND**
- Days expired ≤ Grace period (typically 180 days)

### Fee Calculation

```
feePercentage = minFeePercentage + (maxFeePercentage - minFeePercentage) × (daysExpired / gracePeriodDays)

warrantyFee = MAX(baseFee, estimatedRepairCost × feePercentage)
```

**Default Parameters**:
- Base Fee: 500,000 VNĐ
- Min Fee %: 20% (day 1 of expiration)
- Max Fee %: 50% (end of grace period)
- Grace Period: 180 days

**Part-Specific Overrides**:
- Battery: 365-day grace period, 15-35% fee range
- Motor: 365-day grace period, 15-35% fee range
- Standard parts: Use defaults

### Hierarchy Warranty Logic

#### Extended Warranty Parts
- Examples: Battery (8 years/192,000 km), Motor (4 years/80,000 km)
- Check part-level warranty based on:
  - `installedPart.warrantyExpirationDate`
  - `installedPart.mileageAtInstallation` + `part.defaultWarrantyMileage`

#### Standard Parts
- Examples: Lights, Interior, Entertainment System
- Check vehicle-level warranty based on:
  - `vehicle.warrantyEndDate`
  - `vehicle.mileage` vs `vehicle.mileageLimit`

## User Workflows

### Workflow 1: Free Warranty Claim (SC Staff)

1. Customer brings vehicle to service center
2. SC Staff navigates to `/scstaff/warranty-claims`
3. Clicks "Tạo Yêu cầu"
4. Selects customer's vehicle and problem part
5. System checks warranty → Shows "Bảo hành Miễn phí" (green)
6. Staff enters problem description
7. Submits claim
8. Status: SUBMITTED → MANAGER_REVIEW → PROCESSING → COMPLETED

### Workflow 2: Paid Warranty Claim (SC Staff)

1. Customer brings vehicle with expired warranty
2. SC Staff navigates to `/scstaff/warranty-claims`
3. Clicks "Tạo Yêu cầu"
4. Selects customer's vehicle and problem part
5. System checks warranty → Shows "Bảo hành Tính Phí" (orange)
6. System displays calculated fee (e.g., 700,000 VNĐ)
7. Staff consults with customer about the fee
8. Customer agrees
9. Staff enters problem description
10. Submits claim with fee information
11. Status: SUBMITTED → **PENDING_PAYMENT** → **PAYMENT_CONFIRMED** → MANAGER_REVIEW → PROCESSING → COMPLETED

### Workflow 3: Customer Checks Warranty

1. Customer logs into portal
2. Navigates to `/customer/warranty-checker`
3. Selects their vehicle
4. Clicks "Kiểm Tra Ngay"
5. Views comprehensive warranty information
6. If expired but within grace period:
   - Enters estimated repair cost
   - Sees calculated warranty fee
   - Can contact service center to proceed

## Styling

All components use styled-components with:
- **Primary gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Success color**: `#4caf50` (green)
- **Warning color**: `#ff9800` (orange)
- **Error color**: `#f44336` (red)
- **Info color**: `#2196f3` (blue)

Icons from `react-icons/fa`.

## Future Enhancements

1. **Payment Integration**
   - Connect to payment gateway
   - Automatic payment status updates
   - Receipt generation

2. **Email Notifications**
   - Notify customer when warranty expires
   - Alert about grace period ending
   - Payment reminders

3. **Analytics Dashboard**
   - Track free vs paid warranty ratio
   - Revenue from paid warranties
   - Popular parts requiring paid warranty

4. **Mobile App**
   - Customer mobile app for warranty checking
   - Push notifications
   - QR code scanning for quick vehicle lookup

## Technical Notes

- All monetary values in VNĐ (Vietnamese Dong)
- Date format: `DD/MM/YYYY` or `vi-VN` locale
- API responses cached for 5 minutes to reduce server load
- All warranty calculations done server-side for security
- Frontend displays pre-calculated values

## Testing

### Manual Testing Scenarios

1. **Valid Warranty**:
   - Vehicle: Tesla Model 3, purchased 2023-01-15, 30,000 km
   - Expected: Green status, no fee

2. **Expired by Date (90 days)**:
   - Vehicle: Warranty ended 2024-10-01, 50,000 km
   - Repair cost: 2,000,000 VNĐ
   - Expected: Orange status, ~700,000 VNĐ fee

3. **Expired Beyond Grace Period**:
   - Vehicle: Warranty ended 2023-01-01, 150,000 km
   - Expected: Red status, cannot provide warranty

4. **Extended Warranty Part (Battery)**:
   - Part: Battery installed 2020-01-01, warranty until 2028-01-01
   - Vehicle: Warranty ended 2024-01-01
   - Expected: Green status for battery (uses part warranty)

## Support

For issues or questions:
- Backend API documentation: `/BE/oem-ev-warranty-management-system/docs/WARRANTY_BUSINESS_RULES.md`
- Frontend components: `/FE/OEM-EV-Warranty-Management-System/src/components/`
- GitHub Issues: Report bugs and feature requests

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
