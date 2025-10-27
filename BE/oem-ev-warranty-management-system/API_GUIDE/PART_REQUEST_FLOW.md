# Part Request Flow - Technician Request Faulty Parts

## 📋 Tổng quan

Flow mới này cho phép **SC_TECHNICIAN** yêu cầu linh kiện từ hãng (EVM) khi phát hiện part bị lỗi trong quá trình xử lý warranty claim.

## 🔄 Workflow

```
1. SC_TECHNICIAN phát hiện part lỗi khi xử lý warranty claim
                    ↓
2. Tạo Part Request (status: PENDING)
                    ↓
3. EVM_STAFF xem xét yêu cầu
                    ↓
4a. Approve → status: APPROVED         4b. Reject → status: REJECTED
                    ↓
5. EVM_STAFF gửi part mới (status: SHIPPED)
                    ↓
6. SC_TECHNICIAN/SC_STAFF xác nhận nhận hàng (status: DELIVERED)
```

## 🎯 Roles & Permissions

### SC_TECHNICIAN
- ✅ Tạo part request mới
- ✅ Xem các yêu cầu của mình
- ✅ Hủy yêu cầu (chỉ khi status = PENDING)
- ✅ Xác nhận đã nhận hàng

### EVM_STAFF
- ✅ Xem tất cả part requests
- ✅ Duyệt/Từ chối yêu cầu
- ✅ Cập nhật trạng thái vận chuyển
- ✅ Xem thống kê

### SC_STAFF
- ✅ Xem part requests của service center
- ✅ Xác nhận đã nhận hàng

### ADMIN
- ✅ Full access tất cả operations

## 📡 API Endpoints

### 1. Tạo Part Request (SC_TECHNICIAN)
```http
POST /api/part-requests
Authorization: Bearer <token>

{
  "warrantyClaimId": 1,
  "faultyPartId": "PART-001",
  "issueDescription": "Battery pack không sạc được, cần thay thế",
  "quantity": 1,
  "serviceCenterId": 1
}
```

**Response:**
```json
{
  "requestId": 1,
  "warrantyClaimId": 1,
  "faultyPartId": "PART-001",
  "faultyPartName": "Battery Pack",
  "faultyPartNumber": "BP-2024-001",
  "requestedByUserId": 5,
  "requestedByUsername": "tech01",
  "requestedByFullName": "Nguyễn Văn Tech",
  "serviceCenterId": 1,
  "serviceCenterName": "Service Center HN",
  "requestDate": "2024-10-27T10:00:00",
  "issueDescription": "Battery pack không sạc được, cần thay thế",
  "status": "PENDING",
  "quantity": 1
}
```

### 2. Xem các yêu cầu của mình (SC_TECHNICIAN)
```http
GET /api/part-requests/my-requests?page=0&size=10
Authorization: Bearer <token>
```

### 3. Hủy yêu cầu (SC_TECHNICIAN)
```http
PATCH /api/part-requests/{id}/cancel
Authorization: Bearer <token>
```

### 4. Xem yêu cầu đang chờ duyệt (EVM_STAFF)
```http
GET /api/part-requests/pending?page=0&size=10
Authorization: Bearer <token>
```

### 5. Duyệt yêu cầu (EVM_STAFF)
```http
PATCH /api/part-requests/{id}/approve?notes=Đã kiểm tra, sẽ gửi part mới
Authorization: Bearer <token>
```

### 6. Từ chối yêu cầu (EVM_STAFF)
```http
PATCH /api/part-requests/{id}/reject?rejectionReason=Part này không thuộc bảo hành
Authorization: Bearer <token>
```

### 7. Cập nhật đã gửi hàng (EVM_STAFF)
```http
PATCH /api/part-requests/{id}/ship?trackingNumber=VN123456789
Authorization: Bearer <token>
```

### 8. Xác nhận đã nhận hàng (SC_TECHNICIAN/SC_STAFF)
```http
PATCH /api/part-requests/{id}/deliver
Authorization: Bearer <token>
```

### 9. Xem part requests theo warranty claim
```http
GET /api/part-requests/by-claim/{claimId}?page=0&size=10
Authorization: Bearer <token>
```

### 10. Xem part requests theo service center (ADMIN/EVM_STAFF/SC_STAFF)
```http
GET /api/part-requests/by-service-center/{serviceCenterId}?page=0&size=10
Authorization: Bearer <token>
```

### 11. Xem part requests theo status
```http
GET /api/part-requests/by-status/{status}?page=0&size=10
Authorization: Bearer <token>
```

**Available statuses:**
- `PENDING` - Chờ duyệt
- `APPROVED` - Đã duyệt
- `SHIPPED` - Đang vận chuyển
- `DELIVERED` - Đã giao
- `REJECTED` - Từ chối
- `CANCELLED` - Đã hủy

### 12. Xem thống kê (ADMIN/EVM_STAFF)
```http
GET /api/part-requests/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "pending": 5,
  "approved": 3,
  "shipped": 2,
  "delivered": 10,
  "rejected": 1,
  "cancelled": 2
}
```

## 🔐 Security

### URL-based Security (SecurityConfig)
```java
.requestMatchers("/api/part-requests/**").authenticated()
```

### Method-level Security (@PreAuthorize)
- **POST /api/part-requests** → SC_TECHNICIAN only
- **GET /api/part-requests** → ADMIN, EVM_STAFF
- **GET /api/part-requests/my-requests** → SC_TECHNICIAN
- **PATCH /api/part-requests/{id}/approve** → ADMIN, EVM_STAFF
- **PATCH /api/part-requests/{id}/reject** → ADMIN, EVM_STAFF
- **PATCH /api/part-requests/{id}/ship** → ADMIN, EVM_STAFF
- **PATCH /api/part-requests/{id}/deliver** → SC_STAFF, SC_TECHNICIAN
- **PATCH /api/part-requests/{id}/cancel** → SC_TECHNICIAN (owner only)

## 📊 Database Schema

```sql
CREATE TABLE part_requests (
    request_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    warranty_claim_id BIGINT NOT NULL,
    faulty_part_id VARCHAR(50) NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    approved_by_user_id BIGINT NULL,
    service_center_id BIGINT NOT NULL,
    request_date DATETIME NOT NULL,
    issue_description NVARCHAR(1000) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    quantity INT NOT NULL DEFAULT 1,
    approved_date DATETIME NULL,
    shipped_date DATETIME NULL,
    delivered_date DATETIME NULL,
    rejection_reason NVARCHAR(500) NULL,
    tracking_number VARCHAR(100) NULL,
    notes NVARCHAR(1000) NULL,
    
    FOREIGN KEY (warranty_claim_id) REFERENCES warranty_claims(warranty_claim_id),
    FOREIGN KEY (faulty_part_id) REFERENCES parts(part_id),
    FOREIGN KEY (requested_by_user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id),
    FOREIGN KEY (service_center_id) REFERENCES service_centers(service_center_id)
);
```

## 💼 Business Rules

1. **Tạo yêu cầu:**
   - Chỉ SC_TECHNICIAN mới có thể tạo part request
   - Phải liên kết với warranty claim đang xử lý
   - Status mặc định: PENDING

2. **Duyệt/Từ chối:**
   - Chỉ EVM_STAFF mới có thể duyệt/từ chối
   - Chỉ duyệt/từ chối được requests có status = PENDING

3. **Vận chuyển:**
   - Chỉ EVM_STAFF mới có thể cập nhật shipped
   - Chỉ cập nhật được requests có status = APPROVED

4. **Giao hàng:**
   - SC_TECHNICIAN/SC_STAFF xác nhận đã nhận
   - Chỉ xác nhận được requests có status = SHIPPED

5. **Hủy:**
   - Chỉ người tạo mới có thể hủy
   - Chỉ hủy được requests có status = PENDING

## 🎨 Frontend Integration

### Example: Technician tạo yêu cầu
```typescript
const createPartRequest = async (data: PartRequestDTO) => {
  const response = await fetch('/api/part-requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (response.ok) {
    const partRequest = await response.json();
    console.log('Part request created:', partRequest);
  }
};
```

### Example: EVM Staff duyệt yêu cầu
```typescript
const approvePartRequest = async (requestId: number, notes?: string) => {
  const url = `/api/part-requests/${requestId}/approve${notes ? `?notes=${encodeURIComponent(notes)}` : ''}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const updated = await response.json();
    console.log('Part request approved:', updated);
  }
};
```

## 📝 Validation Rules

### PartRequestDTO
- `warrantyClaimId`: Required, must exist
- `faultyPartId`: Required, must exist
- `issueDescription`: Required, 10-1000 characters
- `quantity`: Required, 1-100
- `serviceCenterId`: Required, must exist

## 🔔 Notifications (Future Enhancement)

Có thể mở rộng để gửi thông báo khi:
- Part request được tạo → Notify EVM_STAFF
- Part request được duyệt → Notify SC_TECHNICIAN
- Part được gửi đi → Notify SC_TECHNICIAN
- Part đã giao → Notify EVM_STAFF

## 📈 Reports & Analytics

Có thể tạo các báo cáo:
- Số lượng part requests theo service center
- Thời gian xử lý trung bình
- Tỷ lệ approved/rejected
- Parts được yêu cầu nhiều nhất
- Performance của từng technician

---

**Created:** October 27, 2024
**Version:** 1.0
**Author:** System Development Team

