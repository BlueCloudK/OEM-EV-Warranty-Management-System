package com.swp391.warrantymanagement.enums;

/**
 * Enum trạng thái của Warranty Claim.
 * <p>
 * <strong>Flow cho FREE WARRANTY:</strong>
 * {@code SUBMITTED → MANAGER_REVIEW → PROCESSING → COMPLETED}
 * <p>
 * <strong>Flow cho PAID WARRANTY:</strong>
 * {@code SUBMITTED → PENDING_PAYMENT → PAYMENT_CONFIRMED → MANAGER_REVIEW → PROCESSING → COMPLETED}
 * <p>
 * <strong>Reject flow:</strong>
 * Any status → {@code REJECTED}
 */
public enum WarrantyClaimStatus {
    SUBMITTED("Tiếp nhận"),

    /**
     * Chờ customer thanh toán phí bảo hành.
     * <strong>Chỉ áp dụng cho:</strong> Paid warranty claims
     */
    PENDING_PAYMENT("Chờ thanh toán"),

    /**
     * Customer đã thanh toán phí, chờ staff xác nhận.
     * <strong>Chỉ áp dụng cho:</strong> Paid warranty claims
     */
    PAYMENT_CONFIRMED("Đã xác nhận thanh toán"),

    MANAGER_REVIEW("Manager đang xem xét"),
    PROCESSING("Đang xử lý"),
    COMPLETED("Hoàn tất"),
    REJECTED("Từ chối");

    private final String vietnameseName;

    WarrantyClaimStatus(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }

    /**
     * Kiểm tra xem status này có phải là payment-related không.
     */
    public boolean isPaymentStatus() {
        return this == PENDING_PAYMENT || this == PAYMENT_CONFIRMED;
    }

    /**
     * Kiểm tra xem status này có phải là final state không.
     */
    public boolean isFinalStatus() {
        return this == COMPLETED || this == REJECTED;
    }
}
