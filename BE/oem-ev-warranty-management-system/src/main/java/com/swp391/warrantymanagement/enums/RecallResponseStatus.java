package com.swp391.warrantymanagement.enums;

/**
 * RecallResponseStatus - Trạng thái phản hồi của từng xe trong một chiến dịch triệu hồi
 * <p>
 * <strong>Flow trạng thái:</strong>
 * <pre>
 * PENDING (chờ khách hàng xác nhận)
 *    ├─→ ACCEPTED (khách hàng chấp nhận)
 *    │      └─→ IN_PROGRESS (đã tạo claim, đang sửa chữa)
 *    │             └─→ COMPLETED (hoàn thành sửa chữa)
 *    │
 *    └─→ DECLINED (khách hàng từ chối)
 * </pre>
 */
public enum RecallResponseStatus {
    PENDING("Chờ khách hàng xác nhận"),           // Admin đã duyệt campaign, chờ customer phản hồi
    ACCEPTED("Khách hàng đã chấp nhận"),          // Customer chấp nhận tham gia recall
    DECLINED("Khách hàng đã từ chối"),            // Customer từ chối recall (final state)
    IN_PROGRESS("Đang thực hiện sửa chữa"),       // Đã tạo WarrantyClaim, đang sửa
    COMPLETED("Đã hoàn thành");                   // Claim đã resolved (final state)

    private final String vietnameseName;

    RecallResponseStatus(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}
