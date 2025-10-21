package com.swp391.warrantymanagement.enums;

public enum WarrantyClaimStatus {
    SUBMITTED("Tiếp nhận"),
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
}
