# Role-Based Access Control (RBAC) Guide

## Overview
Hệ thống OEM EV Warranty Management sử dụng JWT-based authentication với role-based authorization. Mỗi user được gán một role cụ thể với các quyền truy cập khác nhau.

**Last Updated:** October 23, 2025 - Thêm tính năng Customer xem warranty claims

## User Roles

### 1. ADMIN
- **Mô tả**: Quản trị viên hệ thống - có quyền cao nhất
- **Permissions**: Truy cập tất cả endpoints và thực hiện mọi thao tác
- **Đặc quyền**: Chỉ ADMIN mới có thể xóa (DELETE) hầu hết các resources

### 2. EVM_STAFF (Electric Vehicle Manufacturer Staff)
- **Mô tả**: Nhân viên nhà sản xuất xe điện
- **Permissions**:
  - Quản lý vehicles (CRUD)
  - Quản lý parts (CRUD)
  - Xem customers (READ)
  - Quản lý warranty claims (full access)
  - Quản lý service histories (full access)
  - Quản lý work logs (full access)
  - Xem service centers (READ)
  - Xem feedbacks (READ)
  - Xem installed parts (READ)

### 3. SC_STAFF (Service Center Staff)
- **Mô tả**: Nhân viên trung tâm bảo hành
- **Permissions**:
  - Quản lý customers (CRUD)
  - Quản lý vehicles (CRUD)
  - Xem parts (READ)
  - Quản lý warranty claims (CRUD)
  - Quản lý service histories (CRUD)
  - Quản lý installed parts (CRUD)
  - Quản lý service centers (full access)
  - Quản lý feedbacks (full access)
  - Quản lý work logs (full access)

### 4. SC_TECHNICIAN (Service Center Technician)
- **Mô tả**: Kỹ thuật viên trung tâm bảo hành
- **Permissions**:
  - Xem thông tin vehicles (READ)
  - Quản lý warranty claims (READ, UPDATE)
  - Quản lý service histories (CRUD)
  - Xem installed parts (READ)
  - Xem service centers (READ)

### 5. CUSTOMER
- **Mô tả**: Khách hàng sử dụng dịch vụ
- **Permissions**:
  - Tự cập nhật profile
  - Xem vehicles của mình (READ only)
  - **🆕 Xem warranty claims của mình** (READ only via `/my-claims` - NEW Oct 23, 2025)
  - **❌ KHÔNG THỂ tạo warranty claims** (phải đến service center để SC_STAFF tạo giúp)
  - Xem service histories của xe mình (READ via `/my-services`)
  - Xem installed parts của xe mình (READ only)
  - Xem service centers (READ)
  - Tạo và quản lý feedbacks (CREATE, READ, UPDATE)

## API Endpoint Permissions

### Authentication APIs (`/api/auth/**`)
- **Public**: `/login`, `/register`, `/refresh`, `/forgot-password`, `/reset-password`
- **Authenticated**: Các endpoints khác
- **ADMIN only**: `/api/auth/admin/**`

### Admin APIs (`/api/admin/**`)
- **ADMIN**: Full access

### User Management (`/api/admin/users/**`)
- **ADMIN**: Full access to manage all users

### Customer APIs (`/api/customers/**`)
| Endpoint | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|----------|-------|-----------|----------|---------------|----------|
| General CRUD | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/me/**` | ✅ | ❌ | ✅ | ✅ | ✅ |

### Vehicle APIs (`/api/vehicles/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full CRUD |
| EVM_STAFF | Full CRUD |
| SC_STAFF | Full CRUD |
| SC_TECHNICIAN | READ only |
| CUSTOMER | READ only (own vehicles) |

### Parts APIs (`/api/parts/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full CRUD |
| EVM_STAFF | Full CRUD |
| SC_STAFF | Full CRUD |

### Installed Parts APIs (`/api/installed-parts/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full CRUD |
| EVM_STAFF | Full CRUD |
| SC_STAFF | Full CRUD |
| SC_TECHNICIAN | READ only |
| CUSTOMER | READ only (own vehicles) |

### Warranty Claims APIs (`/api/warranty-claims/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full CRUD + admin accept/reject |
| EVM_STAFF | READ only |
| SC_STAFF | CREATE claims for customers, READ, UPDATE |
| SC_TECHNICIAN | READ + process claims (start/complete) |
| CUSTOMER | **🆕 READ only (own claims via `/my-claims`)** - Cannot create (must visit service center) |

**🆕 NEW Customer Endpoints (Oct 23, 2025):**
- `GET /api/warranty-claims/my-claims` - Customer xem tất cả claims của mình (with pagination)
- `GET /api/warranty-claims/my-claims/{id}` - Customer xem chi tiết 1 claim của mình

**Security:**
- ✅ Customer chỉ xem được claims của **xe mình sở hữu**
- ✅ Kiểm tra ownership ở DB query: `findByVehicleCustomerCustomerId()`
- ✅ @PreAuthorize("hasRole('CUSTOMER')") bảo vệ endpoints
- ❌ Customer vẫn **KHÔNG THỂ** tạo/sửa/xóa claims

### Service History APIs (`/api/service-histories/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full CRUD |
| EVM_STAFF | Full CRUD |
| SC_STAFF | Full CRUD |
| SC_TECHNICIAN | Full CRUD |
| CUSTOMER | READ only (own vehicle histories via `/my-services`) |

### Service Centers APIs (`/api/service-centers/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full CRUD |
| EVM_STAFF | READ only |
| SC_STAFF | READ only |
| SC_TECHNICIAN | READ only |
| CUSTOMER | READ only |

### Feedbacks APIs (`/api/feedbacks/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full access |
| EVM_STAFF | READ only |
| SC_STAFF | READ only |
| CUSTOMER | CREATE, READ, UPDATE own feedbacks |

### Work Logs APIs (`/api/work-logs/**`)
| Role | Permissions |
|------|-------------|
| ADMIN | Full CRUD |
| EVM_STAFF | Full CRUD |
| SC_STAFF | READ only |

### User Info API (`/api/me`)
- **All authenticated users**: Access to own user information

## Security Configuration Summary

```java
// Public endpoints
/api/auth/login, /api/auth/register, /api/auth/refresh
/api/auth/forgot-password, /api/auth/reset-password
/swagger-ui/**, /v3/api-docs/**
/actuator/**, /health

// Protected endpoints
/api/admin/**                        → ADMIN
/api/admin/users/**                  → ADMIN
/api/customers/**                    → ADMIN, SC_STAFF, EVM_STAFF
/api/vehicles/**                     → ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER
/api/parts/**                        → ADMIN, EVM_STAFF, SC_STAFF
/api/installed-parts/**              → ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER
/api/warranty-claims/my-claims/**    → CUSTOMER 🆕
/api/warranty-claims/**              → ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF
/api/service-histories/**            → ADMIN, SC_STAFF, SC_TECHNICIAN, EVM_STAFF, CUSTOMER
/api/service-centers/**              → ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN, CUSTOMER
/api/feedbacks/**                    → ADMIN, EVM_STAFF, SC_STAFF, CUSTOMER
/api/work-logs/**                    → ADMIN, EVM_STAFF, SC_STAFF
/api/me                              → Authenticated
```

## Security Matrix Summary

| Resource | ADMIN | EVM_STAFF | SC_STAFF | SC_TECHNICIAN | CUSTOMER |
|----------|-------|-----------|--------|---------------|----------|
| **Admin** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Users** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Customers** | ✅ | ✅ | ✅ | Me only | Me only |
| **Vehicles** | ✅ | ✅ | ✅ | Read | Read (own) |
| **Parts** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Installed Parts** | ✅ | ✅ | ✅ | Read | Read (own) |
| **Warranty Claims** | ✅ | Read | Create | Process | 🆕 Read (own) |
| **Service Histories** | ✅ | ✅ | ✅ | ✅ | Own only |
| **Service Centers** | ✅ | Read | Read | Read | Read |
| **Feedbacks** | ✅ | Read | Read | ❌ | ✅ |
| **Work Logs** | ✅ | ✅ | Read | ❌ | ❌ |

## Two-Layer Security

Hệ thống sử dụng 2 lớp bảo mật:

1. **SecurityConfig (URL-based)**: Kiểm tra role có được phép truy cập URL pattern không
2. **@PreAuthorize (Method-level)**: Kiểm tra chi tiết hơn ở từng method trong controller

→ Ngay cả khi user qua được SecurityConfig, họ vẫn bị block bởi @PreAuthorize nếu cố truy cập endpoint không được phép.

## Testing Recommendations

### Role-Based Testing
1. Test mỗi role với dedicated test accounts
2. Verify permissions cho tất cả endpoints
3. Test business logic filtering cho customer data
4. Validate workflow permissions cho warranty claims

### Security Testing
1. Attempt unauthorized access với wrong roles
2. Test status transition validation với invalid changes
3. Verify data isolation cho customer accounts
4. Test cross-role access attempts

### Performance Testing
1. Large dataset queries với pagination
2. Concurrent workflow operations bởi different roles
3. Service history tracking under load

---

## 🆕 Update Log - October 23, 2025

### **Tính năng mới: Customer có thể xem Warranty Claims**

#### **Vấn đề trước đây:**
- ❌ Customer không thể theo dõi trạng thái warranty claims của mình
- ❌ Phải gọi điện hoặc đến trung tâm để hỏi tiến độ
- ❌ Thiếu tính minh bạch trong quy trình xử lý

#### **Giải pháp được implement:**

**1. Endpoints mới cho CUSTOMER:**
```
GET /api/warranty-claims/my-claims?page=0&size=10
GET /api/warranty-claims/my-claims/{claimId}
```

**2. Quyền truy cập:**
- ✅ Customer có thể **XEM** tất cả warranty claims của các xe mình sở hữu
- ✅ Customer có thể **XEM** chi tiết từng claim (trạng thái, mô tả, ngày giải quyết...)
- ❌ Customer **KHÔNG THỂ** tạo, sửa, xóa claims (vẫn phải đến service center)

**3. Bảo mật:**
```java
// SecurityConfig - URL level
.requestMatchers("/api/warranty-claims/my-claims/**").hasRole("CUSTOMER")

// Controller - Method level
@PreAuthorize("hasRole('CUSTOMER')")

// Service - Business logic
- Lấy username từ SecurityContext
- Tìm Customer từ User
- Query claims theo customerId
- Chỉ trả về claims của xe thuộc về customer
```

**4. Repository Query:**
```java
// Chỉ lấy claims của vehicles thuộc về customer
findByVehicleCustomerCustomerId(UUID customerId, Pageable pageable)

// Security check khi xem chi tiết
findByWarrantyClaimIdAndVehicleCustomerCustomerId(Long claimId, UUID customerId)
```

**5. Workflow giữ nguyên:**
```
1. Customer đến Service Center
2. SC_STAFF tạo warranty claim cho customer
3. Customer về nhà → Login vào app
4. 🆕 Customer xem trạng thái claim qua /my-claims
5. Customer theo dõi các trạng thái:
   - SUBMITTED → Đã gửi, chờ admin duyệt
   - MANAGER_REVIEW → Admin đã duyệt, chờ kỹ thuật viên
   - PROCESSING → Đang được xử lý
   - COMPLETED → Hoàn thành
   - REJECTED → Bị từ chối
```

**6. Lợi ích:**
- ✅ Customer chủ động theo dõi tiến độ
- ✅ Giảm gọi điện hỏi status → giảm tải cho SC_STAFF
- ✅ Tăng độ hài lòng khách hàng
- ✅ Minh bạch quy trình xử lý
- ✅ Customer có thể tra cứu lịch sử claims

**7. Files đã thay đổi:**
- `WarrantyClaimRepository.java` - Thêm query methods
- `WarrantyClaimService.java` - Interface methods
- `WarrantyClaimServiceImpl.java` - Business logic
- `WarrantyClaimController.java` - 2 endpoints mới
- `SecurityConfig.java` - URL security rules
- `ROLE_BASED_ACCESS_CONTROL.md` - Documentation
- `JWT_AUTHENTICATION_FLOW.md` - Documentation

---

**System Status:** ✅ PRODUCTION READY - Updated with Customer warranty claims viewing feature
