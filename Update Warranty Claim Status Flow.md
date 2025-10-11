# Update Warranty Claim Status - Flow

## 🔄 Complete Flow

```
1. User truy cập Warranty Claims Management
   ↓
2. User chọn một claim cần update
   ↓
3. System hiển thị claim details + available actions theo role
   ↓
4. User chọn action update status
   ↓
5. Client gửi request:
   PUT /api/warranty-claims/{id}/status
   Headers: { Authorization: "Bearer <token>" }
   Body: { 
     "newStatus": "IN_PROGRESS",
     "comment": "Technician assigned"
   }
   ↓
6. <<include>> Validate JWT Token
   ├─ 6.1. JwtAuthenticationFilter extract token
   ├─ 6.2. JwtService validate token
   ├─ 6.3. Extract username & roles
   ├─ 6.4. Load UserDetails
   └─ 6.5. Set SecurityContext
   ↓
7. WarrantyClaimController.updateStatus()
   @PreAuthorize("hasAnyRole('SC_STAFF', 'EVM_STAFF', 'ADMIN')")
   ↓
8. System kiểm tra permissions theo role:

   IF role = SC_STAFF:
      ├─ Allowed transitions:
      │  ├─ PENDING → IN_PROGRESS
      │  ├─ IN_PROGRESS → AWAITING_PARTS
      │  ├─ AWAITING_PARTS → IN_PROGRESS
      │  └─ IN_PROGRESS → READY_FOR_APPROVAL
      └─ CANNOT: APPROVE/REJECT (only EVM_STAFF)
   
   ELSE IF role = EVM_STAFF:
      ├─ Allowed transitions:
      │  ├─ READY_FOR_APPROVAL → APPROVED
      │  ├─ READY_FOR_APPROVAL → REJECTED
      │  └─ PENDING → REJECTED (early rejection)
      └─ CANNOT: Update technical status
   
   ELSE IF role = ADMIN:
      └─ ALL transitions allowed
   ↓
9. System validate state transition:
   ├─ Check current status
   ├─ Check if transition is valid
   └─ Check business rules
   ↓
10. System update claim:
    ├─ Update status
    ├─ Add comment to history
    ├─ Log who changed (SecurityUtil.getCurrentUsername())
    ├─ Log timestamp
    └─ Increment version (optimistic locking)
    ↓
11. System trigger side effects:
    
    IF newStatus = APPROVED:
       ├─ Send notification to CUSTOMER
       ├─ Send notification to SC_STAFF
       └─ Update parts inventory (reserve parts)
    
    ELSE IF newStatus = REJECTED:
       ├─ Send notification to CUSTOMER (with reason)
       └─ Close claim
    
    ELSE IF newStatus = IN_PROGRESS:
       └─ Assign to technician (if specified)
    
    ELSE IF newStatus = AWAITING_PARTS:
       └─ Create parts order
    
    ELSE IF newStatus = READY_FOR_APPROVAL:
       └─ Notify EVM_STAFF for approval
    ↓
12. System return updated claim details
    ↓
13. UI refresh claim status + show success message
```

---

## 🔐 Step 8: Permission Validation Code

```java
private void validateSCStaffTransition(String currentStatus, String newStatus) {
    Map<String, List<String>> allowed = Map.of(
        "PENDING", List.of("IN_PROGRESS"),
        "IN_PROGRESS", List.of("AWAITING_PARTS", "READY_FOR_APPROVAL"),
        "AWAITING_PARTS", List.of("IN_PROGRESS"),
        "APPROVED", List.of("COMPLETED")
    );
    
    if (!allowed.getOrDefault(currentStatus, List.of()).contains(newStatus)) {
        throw new ForbiddenException(
            "SC_STAFF cannot transition from " + currentStatus + " to " + newStatus
        );
    }
}

private void validateEVMStaffTransition(String currentStatus, String newStatus) {
    if (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED")) {
        throw new ForbiddenException("EVM_STAFF can only approve or reject claims");
    }
    
    if (!currentStatus.equals("READY_FOR_APPROVAL") && !currentStatus.equals("PENDING")) {
        throw new ForbiddenException(
            "Can only approve/reject claims in READY_FOR_APPROVAL or PENDING status"
        );
    }
}
```

---

## ⚠️ Alternative Flows

### 8a. SC_STAFF tries to APPROVE
```
→ Return 403 Forbidden: "Only EVM_STAFF can approve claims"
→ Show allowed actions: IN_PROGRESS, AWAITING_PARTS, READY_FOR_APPROVAL
```

### 8b. EVM_STAFF tries technical status
```
→ Return 403 Forbidden: "EVM_STAFF can only approve or reject claims"
```

### 9a. Invalid state transition
```
Example: REJECTED → IN_PROGRESS
→ Return 400 Bad Request: "Cannot change status from REJECTED to IN_PROGRESS"
```

### 10a. Concurrent update (Optimistic Lock)
```
User A and User B update same claim
→ User B gets 409 Conflict: "Claim was updated by another user"
→ UI shows conflict dialog with latest data
```

### 11a. Parts not available for APPROVED
```
→ Rollback transaction
→ Return 400: "Parts not available. Change to AWAITING_PARTS first"
→ Show missing parts list
```

---

## 📝 Request/Response Examples

### Request
```http
PUT /api/warranty-claims/550e8400-e29b-41d4-a716-446655440000/status HTTP/1.1
Host: api.warranty-system.com
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "newStatus": "IN_PROGRESS",
  "comment": "Technician assigned. Starting diagnostic.",
  "assignedTechnicianId": "tech-uuid-12345"
}
```

### Success Response (200 OK)
```json
{
  "claimId": "550e8400-e29b-41d4-a716-446655440000",
  "claimNumber": "WC-2024-001234",
  "status": "IN_PROGRESS",
  "updatedAt": "2024-01-16T14:30:00Z",
  "updatedBy": "staff_nguyen",
  "assignedTechnician": "tech_tran",
  "statusHistory": [
    {
      "oldStatus": "PENDING",
      "newStatus": "IN_PROGRESS",
      "changedBy": "staff_nguyen",
      "changedAt": "2024-01-16T14:30:00Z",
      "comment": "Technician assigned. Starting diagnostic."
    }
  ]
}
```

### Error Response (403 Forbidden)
```json
{
  "error": "Forbidden",
  "message": "Only EVM_STAFF can approve claims",
  "allowedActions": ["IN_PROGRESS", "AWAITING_PARTS", "READY_FOR_APPROVAL"]
}
```

### Error Response (409 Conflict)
```json
{
  "error": "Conflict",
  "message": "Claim was updated by another user",
  "lastUpdatedBy": "user_a",
  "lastUpdatedAt": "2024-01-16T14:25:30Z",
  "currentData": { ...latest claim data... }
}
```

---

## 📊 Audit Log Entry

Every status update creates audit log:
```json
{
  "claimId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "UPDATE_STATUS",
  "oldStatus": "PENDING",
  "newStatus": "IN_PROGRESS",
  "changedBy": "staff_nguyen",
  "changedByRole": "SC_STAFF",
  "changedAt": "2024-01-16T14:30:00Z",
  "ipAddress": "192.168.1.100",
  "comment": "Technician assigned. Starting diagnostic.",
  "metadata": {
    "assignedTechnicianId": "tech-uuid-12345"
  }
}
```

---

**Version:** 1.0  
**Last Updated:** 2024-01-16