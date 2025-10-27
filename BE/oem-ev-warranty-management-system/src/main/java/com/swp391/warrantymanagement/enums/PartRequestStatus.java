package com.swp391.warrantymanagement.enums;

/**
 * PartRequestStatus - Trạng thái yêu cầu linh kiện từ technician đến hãng
 */
public enum PartRequestStatus {
    PENDING("Chờ duyệt"),           // Technician vừa tạo yêu cầu
    APPROVED("Đã duyệt"),           // EVM_STAFF đã duyệt, chuẩn bị gửi part
    SHIPPED("Đang vận chuyển"),     // Part đã được gửi đi
    DELIVERED("Đã giao"),           // Part đã giao đến service center
    REJECTED("Từ chối"),            // EVM_STAFF từ chối yêu cầu
    CANCELLED("Đã hủy");            // Technician hủy yêu cầu

    private final String vietnameseName;

    PartRequestStatus(String vietnameseName) {
        this.vietnameseName = vietnameseName;
    }

    public String getVietnameseName() {
        return vietnameseName;
    }
}

