package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.enums.WarrantyStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Response DTO: Dữ liệu trả về FE cho WarrantyClaim - đầy đủ thông tin */
@Data
public class WarrantyClaimResponseDTO {
    private Long warrantyClaimId;
    private LocalDateTime claimDate;
    private WarrantyClaimStatus status;
    private String description;
    private LocalDateTime resolutionDate;

    // InstalledPart information - đầy đủ thông tin installed part
    private Long installedPartId;
    private Long partId; // Changed from String to Long
    private String partName;
    private String partNumber;
    private String manufacturer;

    // Vehicle information - đầy đủ thông tin vehicle
    private Long vehicleId;
    private String vehicleName;
    private String vehicleModel;
    private int vehicleYear;
    private String vehicleVin;

    // Customer information - để FE biết claim của ai
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Assigned staff information - EVM Staff được assign claim
    private Long assignedToUserId;
    private String assignedToUsername;
    private String assignedToEmail;

    // Service Center information - trung tâm xử lý claim
    private Long serviceCenterId;
    private String serviceCenterName;

    // Audit information - track thông tin cập nhật
    private String comments; // Comments khi approve/reject
    private String updatedBy; // Staff đã cập nhật status
    private LocalDateTime lastUpdated; // Thời gian update cuối

    // Paid warranty information - thông tin bảo hành tính phí
    /**
     * Trạng thái bảo hành khi tạo claim (VALID, EXPIRED_DATE, etc.)
     */
    private WarrantyStatus warrantyStatus;

    /**
     * Có phải bảo hành tính phí không
     */
    private Boolean isPaidWarranty;

    /**
     * Phí bảo hành (nếu là bảo hành tính phí)
     */
    private BigDecimal warrantyFee;

    /**
     * Ghi chú về phí bảo hành
     */
    private String paidWarrantyNote;

    /**
     * Claim đã có feedback chưa (để customer biết đã đánh giá hay chưa)
     */
    private Boolean hasFeedback;
}
