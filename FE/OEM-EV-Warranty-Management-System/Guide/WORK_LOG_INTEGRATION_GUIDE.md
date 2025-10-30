# Hướng dẫn tích hợp Work Log tự động

## Mục đích
Tự động tạo Work Log khi Technician bắt đầu và hoàn thành warranty claim để theo dõi:
- Technician nào đã xử lý claim
- Thời gian bắt đầu (startTime)
- Thời gian kết thúc (endTime)
- Tổng thời gian làm việc

---

## Workflow hiện tại

```
1. SC_STAFF tạo claim → Status: SUBMITTED
   POST /api/warranty-claims/sc-create

2. ADMIN accept claim → Status: MANAGER_REVIEW
   PATCH /api/warranty-claims/{id}/admin-accept

3. TECHNICIAN bắt đầu xử lý → Status: PROCESSING ⏰ GHI START TIME
   PATCH /api/warranty-claims/{id}/tech-start

4. TECHNICIAN hoàn thành → Status: COMPLETED ⏰ GHI END TIME
   PATCH /api/warranty-claims/{id}/tech-complete
```

---

## Cần thực hiện trong Backend

### File cần sửa:
`WarrantyClaimServiceImpl.java`

### 1. Thêm dependency WorkLogRepository

```java
@Autowired
private WorkLogRepository workLogRepository;
```

### 2. Sửa method `techStartProcessing`

**Vị trí:** Line 269-286 trong `WarrantyClaimServiceImpl.java`

**Code hiện tại:**
```java
@Override
@Transactional
public WarrantyClaimResponseDTO techStartProcessing(Long claimId, String note) {
    WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
        .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

    if (claim.getStatus() != WarrantyClaimStatus.MANAGER_REVIEW) {
        throw new RuntimeException("Claim must be in MANAGER_REVIEW status");
    }

    claim.setStatus(WarrantyClaimStatus.PROCESSING);
    if (note != null && !note.trim().isEmpty()) {
        claim.setDescription(claim.getDescription() + "\n[Tech Start]: " + note);
    }

    WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
    return WarrantyClaimMapper.toResponseDTO(savedClaim);
}
```

**Code cần thêm:**
```java
@Override
@Transactional
public WarrantyClaimResponseDTO techStartProcessing(Long claimId, String note, Authentication authentication) {
    WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
        .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

    if (claim.getStatus() != WarrantyClaimStatus.MANAGER_REVIEW) {
        throw new RuntimeException("Claim must be in MANAGER_REVIEW status");
    }

    claim.setStatus(WarrantyClaimStatus.PROCESSING);
    if (note != null && !note.trim().isEmpty()) {
        claim.setDescription(claim.getDescription() + "\n[Tech Start]: " + note);
    }

    WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);

    // ⭐ TẠO WORK LOG - GHI START TIME
    WorkLog workLog = new WorkLog();
    workLog.setStartTime(LocalDateTime.now());
    workLog.setEndTime(null); // Chưa kết thúc
    workLog.setDescription(note != null ? note : "Technician started processing claim");
    workLog.setWarrantyClaim(savedClaim);

    // Lấy user hiện tại từ authentication
    String username = authentication.getName();
    User currentUser = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));
    workLog.setUser(currentUser);

    workLogRepository.save(workLog);
    logger.info("Work log created for claim {} by user {}", claimId, username);

    return WarrantyClaimMapper.toResponseDTO(savedClaim);
}
```

### 3. Sửa method `techCompleteClaim`

**Vị trí:** Line 290-310 trong `WarrantyClaimServiceImpl.java`

**Code hiện tại:**
```java
@Override
@Transactional
public WarrantyClaimResponseDTO techCompleteClaim(Long claimId, String completionNote) {
    WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
        .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

    if (claim.getStatus() != WarrantyClaimStatus.PROCESSING) {
        throw new RuntimeException("Claim must be in PROCESSING status");
    }

    claim.setStatus(WarrantyClaimStatus.COMPLETED);
    claim.setDescription(claim.getDescription() + "\n[Tech Completion]: " + completionNote);
    claim.setResolutionDate(LocalDateTime.now());

    WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
    createWarrantyServiceHistory(savedClaim);

    return WarrantyClaimMapper.toResponseDTO(savedClaim);
}
```

**Code cần thêm:**
```java
@Override
@Transactional
public WarrantyClaimResponseDTO techCompleteClaim(Long claimId, String completionNote, Authentication authentication) {
    WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
        .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

    if (claim.getStatus() != WarrantyClaimStatus.PROCESSING) {
        throw new RuntimeException("Claim must be in PROCESSING status");
    }

    claim.setStatus(WarrantyClaimStatus.COMPLETED);
    claim.setDescription(claim.getDescription() + "\n[Tech Completion]: " + completionNote);
    claim.setResolutionDate(LocalDateTime.now());

    WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
    createWarrantyServiceHistory(savedClaim);

    // ⭐ CẬP NHẬT WORK LOG - GHI END TIME
    String username = authentication.getName();
    User currentUser = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Tìm work log chưa hoàn thành của user này cho claim này
    List<WorkLog> workLogs = workLogRepository.findByWarrantyClaimAndUser(savedClaim, currentUser);

    if (!workLogs.isEmpty()) {
        // Lấy work log gần nhất chưa có endTime
        WorkLog activeWorkLog = workLogs.stream()
            .filter(wl -> wl.getEndTime() == null)
            .findFirst()
            .orElse(null);

        if (activeWorkLog != null) {
            activeWorkLog.setEndTime(LocalDateTime.now());
            activeWorkLog.setDescription(activeWorkLog.getDescription() + "\n[Completion]: " + completionNote);
            workLogRepository.save(activeWorkLog);
            logger.info("Work log completed for claim {} by user {}", claimId, username);
        }
    }

    return WarrantyClaimMapper.toResponseDTO(savedClaim);
}
```

### 4. Cập nhật Controller signatures

**File:** `WarrantyClaimController.java`

**Thêm `Authentication authentication` vào parameters:**

```java
@PatchMapping("/{id}/tech-start")
@PreAuthorize("hasRole('SC_TECHNICIAN')")
public ResponseEntity<WarrantyClaimResponseDTO> techStartProcessing(
        @PathVariable Long id,
        @RequestBody(required = false) String note,
        Authentication authentication) {  // ⭐ THÊM PARAMETER
    logger.info("Technician start processing claim: id={}, note={}", id, note);
    WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.techStartProcessing(id, note, authentication);
    logger.info("Claim processing started by technician: {}", id);
    return ResponseEntity.ok(updatedClaim);
}

@PatchMapping("/{id}/tech-complete")
@PreAuthorize("hasRole('SC_TECHNICIAN')")
public ResponseEntity<WarrantyClaimResponseDTO> techCompleteClaim(
        @PathVariable Long id,
        @RequestParam String completionNote,
        Authentication authentication) {  // ⭐ THÊM PARAMETER
    logger.info("Technician complete claim: id={}, note={}", id, completionNote);
    WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.techCompleteClaim(id, completionNote, authentication);
    logger.info("Claim completed by technician: {}", id);
    return ResponseEntity.ok(updatedClaim);
}
```

### 5. Thêm method trong WorkLogRepository (nếu chưa có)

**File:** `WorkLogRepository.java`

```java
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    List<WorkLog> findByWarrantyClaim(WarrantyClaim warrantyClaim);
    List<WorkLog> findByUser(User user);

    // ⭐ THÊM METHOD MỚI
    List<WorkLog> findByWarrantyClaimAndUser(WarrantyClaim warrantyClaim, User user);
}
```

---

## Kết quả mong đợi

### Khi Technician bắt đầu claim:
```json
{
  "workLogId": 1,
  "startTime": "2025-01-25T10:00:00",
  "endTime": null,
  "description": "Started fixing battery issue",
  "userId": 5,
  "username": "technician01",
  "userEmail": "tech@sc.com",
  "warrantyClaimId": 123,
  "claimDescription": "Battery not charging"
}
```

### Khi Technician hoàn thành claim:
```json
{
  "workLogId": 1,
  "startTime": "2025-01-25T10:00:00",
  "endTime": "2025-01-25T12:30:00",  // ⭐ ĐÃ CẬP NHẬT
  "description": "Started fixing battery issue\n[Completion]: Replaced battery module",
  "userId": 5,
  "username": "technician01",
  "userEmail": "tech@sc.com",
  "warrantyClaimId": 123,
  "claimDescription": "Battery not charging"
}
```

---

## Testing checklist

- [ ] Tạo claim mới bằng SC_STAFF
- [ ] Admin accept claim (status → MANAGER_REVIEW)
- [ ] Technician call `/tech-start` → Kiểm tra work log được tạo với startTime
- [ ] Technician call `/tech-complete` → Kiểm tra work log được cập nhật endTime
- [ ] Admin vào `/admin/work-logs` để xem work logs
- [ ] Filter work logs by claim ID
- [ ] Filter work logs by user ID
- [ ] Verify duration calculation (endTime - startTime)

---

## Frontend đã sẵn sàng

✅ Trang Admin Work Logs: `/admin/work-logs`
- Xem tất cả work logs (pagination)
- Filter theo Claim ID
- Filter theo User ID
- Hiển thị: Start time, End time, Duration, User info, Description

---

## Lưu ý quan trọng

1. **Transaction safety**: Đảm bảo tạo work log trong cùng transaction với update claim
2. **Error handling**: Nếu tạo work log fail, không nên fail toàn bộ claim update
3. **Multiple technicians**: Nếu nhiều tech làm cùng 1 claim, cần logic phân biệt work logs
4. **Audit trail**: Work logs là audit trail, KHÔNG được phép xóa, chỉ được xem

---

## Support

Nếu cần hỗ trợ implementation, liên hệ Frontend team.
