package com.swp391.warrantymanagement.enums;

/**
 * RecallRequestStatus - Trạng thái yêu cầu recall từ EVM đến khách hàng
 */
public enum RecallRequestStatus {
    PENDING_ADMIN_APPROVAL("Chờ Admin duyệt"),           // EVM vừa tạo recall request
    REJECTED_BY_ADMIN("Admin đã từ chối"),               // Admin từ chối recall request
    APPROVED_BY_ADMIN("Admin đã duyệt"),                 // Admin duyệt (không dùng - deprecated)
    WAITING_CUSTOMER_CONFIRM("Chờ khách hàng xác nhận"), // Admin đã duyệt, chờ customer
    REJECTED_BY_CUSTOMER("Khách hàng từ chối"),          // Customer từ chối recall
    ACCEPTED_BY_CUSTOMER("Khách hàng chấp nhận"),        // Customer chấp nhận (không dùng - deprecated)
    CLAIM_CREATED("Đã tạo yêu cầu bảo hành");            // Đã tự động tạo warranty claim

    private final String vietnameseName;

    RecallRequestStatus(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}


