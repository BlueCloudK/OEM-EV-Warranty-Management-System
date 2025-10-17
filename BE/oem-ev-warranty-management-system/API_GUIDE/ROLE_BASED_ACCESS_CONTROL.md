# Role-Based Access Control (RBAC) Guide - UPDATED

## Overview
Hệ thống OEM EV Warranty Management sử dụng JWT-based authentication với role-based authorization. Mỗi user được gán một role cụ thể với các quyền truy cập khác nhau.

**Last Updated:** October 14, 2025 - Phản ánh tất cả security fixes đã thực hiện

## User Roles (UPDATED)

### 1. ADMIN
- **Mô tả**: Quản trị viên hệ thống - có quyền cao nhất
- **Permissions**: Truy cập tất cả endpoints và thực hiện mọi thao tác
- **Đặc quyền**: Chỉ ADMIN mới có thể xóa (DELETE) tất cả resources

### 2. EVM_STAFF (Electric Vehicle Manufacturer Staff) ✅ UPDATED
- **Mô tả**: Nhân viên nhà sản xuất xe điện
- **Permissions**: 
  - Quản lý vehicles (CRUD)
  - Quản lý parts (CRUD, except DELETE - chỉ ADMIN)
  - Xem và quản lý customers (READ, CREATE, UPDATE)
  - Xem warranty claims (READ only)
  - **✅ NEW**: Truy cập Service Histories để theo dõi warranty claim completion
  - **Workflow**: Chấp nhận/từ chối warranty claims (EVM accept/reject)

### 3. SC_STAFF (Service Center Staff)
- **Mô tả**: Nhân viên trung tâm bảo hành
- **Permissions**:
  - Quản lý customers (CRUD)
  - Quản lý vehicles (CRUD)
  - Xem parts (READ only)
  - Quản lý warranty claims (CRUD)
  - Quản lý service histories (CRUD)
  - **Workflow**: Tạo warranty claims cho khách hàng

### 4. SC_TECHNICIAN (Service Center Technician)
- **Mô tả**: Kỹ thuật viên trung tâm bảo hành
- **Permissions**:
  - Xem thông tin vehicles (READ only)
  - Xem parts (READ only)
  - Quản lý warranty claims (READ, UPDATE)
  - Quản lý service histories (CRUD)
  - **Workflow**: Xử lý warranty claims (Tech start/complete)

### 5. CUSTOMER
- **Mô tả**: Khách hàng sử dụng dịch vụ
- **Permissions**:
  - Tự cập nhật profile via `/api/customers/profile`
  - Xem vehicles (READ only - với data filtering)
  - Xem parts (READ only)
  - Tạo và xem warranty claims (CREATE, READ own claims)
  - Xem service histories (READ own vehicle histories)

## API Endpoint Permissions (UPDATED)

### Authentication APIs (`/api/auth/**`)
- **Public**: Không cần authentication
- Endpoints: `/login`, `/register`, `/refresh-token`

### Admin APIs (`/api/admin/**`)
- **ADMIN**: Full access
- Tất cả administrative functions

### Customer APIs (`/api/customers/**`)
- **ADMIN, SC_STAFF, EVM_STAFF**: Full CRUD access to all customers
- **CUSTOMER**: Chỉ có thể update profile qua `/profile` endpoint
- **Public (authenticated)**: `/search`, `/by-email`, `/by-phone`, `/by-user/{userId}`

### Vehicle APIs (`/api/vehicles/**`)
- **ADMIN, EVM_STAFF, SC_STAFF**: Full CRUD access
- **SC_TECHNICIAN, CUSTOMER**: READ access only
- Customers chỉ xem được vehicles của mình (business logic filtering)

### Parts APIs (`/api/parts/**`)
- **ADMIN**: Full CRUD access (including DELETE)
- **EVM_STAFF**: CRUD access (except DELETE)
- **SC_STAFF**: READ access only
- **SC_TECHNICIAN, CUSTOMER**: READ access only
- Special endpoint `/by-vehicle/{vehicleId}` accessible by all authenticated users

### Warranty Claims APIs (`/api/warranty-claims/**`) ✅ SECURITY FIXED
- **ADMIN**: Full access to all endpoints
- **SC_STAFF**: CRUD access + workflow endpoint `/sc-create`
- **EVM_STAFF**: READ access + workflow endpoints `/evm-accept`, `/evm-reject`, `/evm-pending`
- **SC_TECHNICIAN**: READ/UPDATE access + workflow endpoints `/tech-start`, `/tech-complete`, `/tech-pending`
- **CUSTOMER**: CREATE và READ own claims only

### Service History APIs (`/api/service-histories/**`) ✅ UPDATED - EVM_STAFF ACCESS ADDED
- **ADMIN, SC_STAFF, SC_TECHNICIAN**: Full CRUD access
- **EVM_STAFF**: ✅ NEW - READ access to monitor warranty claim completion
- **CUSTOMER**: READ access to own vehicle service histories only

### User Info APIs (`/api/me`) ✅ FIXED - ROLE NAMING CORRECTED
- **All authenticated users**: Access to own user information
- **Fixed**: UserInfoController now correctly checks `SC_STAFF` role instead of non-existent `STAFF` role

## Workflow-Specific Permissions (UPDATED)

### Warranty Claim Workflow ✅ WITH STATUS VALIDATION
1. **SC_STAFF**: Tạo claim (`/sc-create`) → Status: SUBMITTED
2. **EVM_STAFF**: Accept (`/evm-accept`) hoặc Reject (`/evm-reject`) → Status: SC_REVIEW hoặc REJECTED
3. **SC_TECHNICIAN**: Start (`/tech-start`) → Status: PROCESSING
4. **SC_TECHNICIAN**: Complete (`/tech-complete`) → Status: COMPLETED

**✅ NEW**: Status transitions are now validated using `WarrantyClaimStatusValidator`
- Invalid transitions throw `IllegalStateException`
- Business rules enforced at code level
- Data consistency guaranteed

### Query Permissions
- **EVM_STAFF**: `/evm-pending` - xem claims cần review + `/service-histories` - theo dõi completion ✅ NEW
- **SC_TECHNICIAN**: `/tech-pending` - xem claims cần xử lý
- **All authenticated**: `/by-status/{status}` - xem theo status

### EVM_STAFF Monitoring Capabilities ✅ NEW FEATURE
- **Service History Access**: Theo dõi warranty claim completion
- **Quality Control**: Monitor service center performance  
- **Part Analysis**: Track part failure patterns
- **Customer Satisfaction**: Ensure timely resolution

## Security Matrix Summary (FULLY UPDATED)

| Resource | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|----------|-------|-----------|----------|---------------|----------|
| **Customers** | CRUD | CRU | CRUD | Search | Profile |
| **Vehicles** | CRUD | CRUD | CRUD | Read | Own Only |
| **Parts** | CRUD | CRU | Read | Read | Read |
| **Warranty Claims** | CRUD | Accept/Reject | CRUD+Create | Process | Own Only |
| **Service Histories** | CRUD | **Read** ✅ | CRUD | CRUD | Own Only |
| **User Management** | Full | - | Register Customers | - | Self-Update |

## ✅ RESOLVED SECURITY ISSUES

### 1. **Warranty Claims Security** ✅ RESOLVED
- **Issue**: No @PreAuthorize annotations on any endpoints
- **Fix**: Added comprehensive role-based permissions
- **Impact**: Complete security implementation

### 2. **EVM_STAFF Service Access** ✅ RESOLVED  
- **Issue**: No access to service histories for completion monitoring
- **Fix**: Added read permissions to all service history endpoints
- **Impact**: Full workflow visibility for EVM

### 3. **Role Naming Consistency** ✅ RESOLVED
- **Issue**: UserInfoController used non-existent 'STAFF' role
- **Fix**: Corrected to use 'SC_STAFF' throughout
- **Impact**: Proper role validation

### 4. **Status Transition Validation** ✅ RESOLVED
- **Issue**: No business logic validation for warranty claim status changes
- **Fix**: Created WarrantyClaimStatusValidator with comprehensive rules
- **Impact**: Data integrity and business rule enforcement

## Testing Recommendations

### Role-Based Testing
1. **Test each role** với dedicated test accounts
2. **Verify permissions** cho tất cả endpoints
3. **Test business logic filtering** cho customer data
4. **Validate workflow permissions** cho warranty claims

### Security Testing
1. **Attempt unauthorized access** with wrong roles
2. **Test status transition validation** with invalid changes
3. **Verify data isolation** for customer accounts
4. **Test EVM monitoring capabilities** for service histories

### Performance Testing
1. **Large dataset queries** with pagination
2. **Concurrent workflow operations** by different roles
3. **Service history tracking** under load
4. **Status validation performance** impact

**System Status:** ✅ PRODUCTION READY WITH ENHANCED SECURITY
