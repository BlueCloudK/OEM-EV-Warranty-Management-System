package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

import java.math.BigDecimal;

/**
 * ServiceCenterResponseDTO - Response DTO for service center information
 */
@Data
public class ServiceCenterResponseDTO {
    private Long serviceCenterId;
    private String serviceCenterName;
    private String address;
    private String phone;
    private String openingHours;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Statistics
    private Integer totalStaff;
    private Integer totalClaims;
    private Integer activeClaims;
    private Double averageRating;
}
