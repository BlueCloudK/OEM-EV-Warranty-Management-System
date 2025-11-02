package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import lombok.Data;
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

    // Audit information - track thông tin cập nhật
    private String comments; // Comments khi approve/reject
    private String updatedBy; // Staff đã cập nhật status
    private LocalDateTime lastUpdated; // Thời gian update cuối
}
