package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.entity.WarrantyClaimStatus;
import lombok.Data;
import java.util.Date;

/** Response DTO: Dữ liệu trả về FE cho WarrantyClaim - đầy đủ thông tin */
@Data
public class WarrantyClaimResponseDTO {
    private Long warrantyClaimId;
    private Date claimDate;
    private WarrantyClaimStatus status;
    private String description;
    private Date resolutionDate;

    // Part information - đầy đủ thông tin part
    private String partId;
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

    // Audit information - track thông tin cập nhật
    private String comments; // Comments khi approve/reject
    private String updatedBy; // Staff đã cập nhật status
    private Date lastUpdated; // Thời gian update cuối
}
