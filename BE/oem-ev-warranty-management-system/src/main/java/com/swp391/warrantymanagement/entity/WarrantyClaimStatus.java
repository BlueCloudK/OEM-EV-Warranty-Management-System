package com.swp391.warrantymanagement.entity;

public enum WarrantyClaimStatus {
    SUBMITTED("Tiếp nhận"),
    SC_REVIEW("SC đang xem xét"), // SC staff review for vehicle
    EVM_REVIEW("EVM đang xem xét"), // EVM staff review for parts
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
