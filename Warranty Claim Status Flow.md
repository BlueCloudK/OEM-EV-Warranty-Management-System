# Warranty Claim Status Flow

## 📊 Status State Machine

```
PENDING
  │
  ├─→ IN_PROGRESS (SC_STAFF, ADMIN)
  │     │
  │     ├─→ AWAITING_PARTS (SC_STAFF, ADMIN)
  │     │     │
  │     │     └─→ IN_PROGRESS (when parts arrive)
  │     │
  │     └─→ READY_FOR_APPROVAL (SC_STAFF completes work)
  │           │
  │           ├─→ APPROVED (EVM_STAFF, ADMIN)
  │           │     │
  │           │     └─→ COMPLETED (after payment)
  │           │
  │           └─→ REJECTED (EVM_STAFF, ADMIN)
  │
  └─→ REJECTED (EVM_STAFF, ADMIN - reject without review)
```

---

## 🔐 Role-Based Permissions

### SC_STAFF
**Allowed transitions:**
- PENDING → IN_PROGRESS
- IN_PROGRESS → AWAITING_PARTS
- AWAITING_PARTS → IN_PROGRESS
- IN_PROGRESS → READY_FOR_APPROVAL
- APPROVED → COMPLETED

**Cannot:**
- APPROVE/REJECT (only EVM_STAFF)

### EVM_STAFF
**Allowed transitions:**
- READY_FOR_APPROVAL → APPROVED
- READY_FOR_APPROVAL → REJECTED
- PENDING → REJECTED (early rejection)

**Cannot:**
- Update technical statuses (IN_PROGRESS, AWAITING_PARTS)

### ADMIN
**Allowed transitions:**
- ALL transitions
- Can override state machine rules
- Can reopen REJECTED/COMPLETED claims

---

## 📋 Transition Rules

| From / To | IN_PROGRESS | AWAITING_PARTS | READY_FOR_APPROVAL | APPROVED | REJECTED | COMPLETED |
|-----------|-------------|----------------|-------------------|----------|----------|-----------|
| **PENDING** | ✅ SC | ❌ | ❌ | ❌ | ✅ EVM | ❌ |
| **IN_PROGRESS** | - | ✅ SC | ✅ SC | ❌ | ❌ | ❌ |
| **AWAITING_PARTS** | ✅ SC | - | ❌ | ❌ | ❌ | ❌ |
| **READY_FOR_APPROVAL** | ❌ | ❌ | - | ✅ EVM | ✅ EVM | ❌ |
| **APPROVED** | ❌ | ❌ | ❌ | - | ❌ | ✅ SC |
| **REJECTED** | ❌ | ❌ | ❌ | ❌ | - | ❌ |
| **COMPLETED** | ❌ | ❌ | ❌ | ❌ | ❌ | - |

---

## 🔔 Notifications

| Transition | Notify |
|------------|--------|
| PENDING → IN_PROGRESS | Customer, Technician |
| IN_PROGRESS → AWAITING_PARTS | Customer, Parts Dept |
| AWAITING_PARTS → IN_PROGRESS | Customer, Technician |
| IN_PROGRESS → READY_FOR_APPROVAL | EVM_STAFF, Customer |
| READY_FOR_APPROVAL → APPROVED | Customer, SC_STAFF, Parts Dept |
| READY_FOR_APPROVAL → REJECTED | Customer, SC_STAFF |
| APPROVED → COMPLETED | Customer, SC_STAFF |

---

## 🛡️ Security

**Audit Log Required:**
```json
{
  "claimId": "uuid",
  "oldStatus": "IN_PROGRESS",
  "newStatus": "READY_FOR_APPROVAL",
  "changedBy": "staff_nguyen",
  "changedByRole": "SC_STAFF",
  "changedAt": "2024-01-16T14:30:00Z",
  "comment": "Work completed"
}
```

**Optimistic Locking:**
- Use `version` field
- Increment on every update
- Return 409 if conflict

---

**Version:** 1.0  
**Last Updated:** 2024-01-16