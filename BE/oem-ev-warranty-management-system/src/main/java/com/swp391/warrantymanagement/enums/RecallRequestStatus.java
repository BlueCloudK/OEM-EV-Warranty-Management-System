package com.swp391.warrantymanagement.enums;

/**
 * RecallRequestStatus - Trạng thái của chiến dịch triệu hồi (Recall Campaign)
 * <p>
 * <strong>Mục đích:</strong> Status chi tiết để Admin/EVM_STAFF tracking và filtering trong dashboard.
 * <p>
 * <strong>Flow trạng thái:</strong>
 * <pre>
 * PENDING_ADMIN_APPROVAL (EVM_STAFF vừa tạo campaign)
 *    ├─→ APPROVED_BY_ADMIN (Admin duyệt → Tự động tạo RecallResponse cho customers)
 *    │      └─→ WAITING_CUSTOMER_CONFIRM (Chờ customers phản hồi qua RecallResponse)
 *    │             └─→ COMPLETED (Tất cả RecallResponse đã xử lý xong)
 *    │
 *    └─→ REJECTED_BY_ADMIN (Admin từ chối campaign)
 * </pre>
 *
 * <strong>Lưu ý:</strong>
 * - REJECTED_BY_CUSTOMER và ACCEPTED_BY_CUSTOMER là legacy (không dùng)
 * - Customer phản hồi thông qua RecallResponse, không phải RecallRequest
 */
public enum RecallRequestStatus {
    PENDING_ADMIN_APPROVAL("Chờ Admin duyệt"),           // EVM_STAFF vừa tạo
    APPROVED_BY_ADMIN("Admin đã duyệt"),                 // Admin duyệt, đã tạo RecallResponse
    REJECTED_BY_ADMIN("Admin đã từ chối"),               // Admin từ chối
    WAITING_CUSTOMER_CONFIRM("Chờ khách hàng xác nhận"), // Chờ customers phản hồi
    COMPLETED("Đã hoàn thành"),                          // Tất cả RecallResponse xử lý xong

    // Legacy statuses - kept for backward compatibility but not used in new flow
    @Deprecated REJECTED_BY_CUSTOMER("Khách hàng từ chối"),  // Deprecated: Use RecallResponse status
    @Deprecated ACCEPTED_BY_CUSTOMER("Khách hàng chấp nhận"), // Deprecated: Use RecallResponse status
    @Deprecated CLAIM_CREATED("Đã tạo yêu cầu bảo hành");     // Deprecated: Use RecallResponse status

    private final String vietnameseName;

    RecallRequestStatus(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}
