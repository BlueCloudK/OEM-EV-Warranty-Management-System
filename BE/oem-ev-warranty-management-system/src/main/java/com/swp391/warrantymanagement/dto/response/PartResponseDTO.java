package com.swp391.warrantymanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;

/**
 * PartResponseDTO - Returns part information to frontend
 * Contains part details including warranty configuration
 */
@Data
public class PartResponseDTO {
    // Basic information
    private Long partId;
    private String partName;
    private String partNumber;
    private String manufacturer;
    private BigDecimal price;

    // Category information
    private Long categoryId;
    private String categoryName;
    private Integer maxQuantityPerVehicle;

    // Warranty configuration
    private Boolean hasExtendedWarranty;
    private Integer defaultWarrantyMonths;
    private Integer defaultWarrantyMileage;
    private Integer gracePeriodDays;
    private BigDecimal paidWarrantyFeePercentageMin;
    private BigDecimal paidWarrantyFeePercentageMax;
}
