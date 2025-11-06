package com.swp391.warrantymanagement.enums;

/**
 * RecallRequestStatus - Trạng thái của chiến dịch triệu hồi (Recall Campaign)
 * <p>
 * <strong>Flow trạng thái:</strong>
 * <pre>
 * PENDING (EVM_STAFF vừa tạo)
 *    ├─→ APPROVED (Admin đã duyệt, tự động tạo RecallResponse cho customers bị ảnh hưởng)
 *    │      └─→ COMPLETED (Tất cả RecallResponse đã xử lý xong)
 *    │
 *    └─→ REJECTED (Admin từ chối)
 * </pre>
 */
public enum RecallRequestStatus {
    PENDING("Chờ Admin duyệt"),           // EVM_STAFF vừa tạo recall request
    APPROVED("Admin đã duyệt"),           // Admin duyệt, đã tạo RecallResponse cho customers
    REJECTED("Admin đã từ chối"),         // Admin từ chối recall request
    COMPLETED("Đã hoàn thành");           // Tất cả RecallResponse đã xử lý xong

    private final String vietnameseName;

    RecallRequestStatus(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}
