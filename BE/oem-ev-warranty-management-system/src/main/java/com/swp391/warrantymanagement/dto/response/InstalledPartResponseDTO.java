package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * InstalledPartResponseDTO - Returns installed part information to frontend
 * Includes part details, vehicle information, and installation dates
 */
@Data
public class InstalledPartResponseDTO {
    // Installed Part info
    private Long installedPartId;
    private LocalDate installationDate;
    private LocalDate warrantyExpirationDate;

    // Part information
    private Long partId;
    private String partName;
    private String partNumber;
    private String manufacturer;
    private BigDecimal price;
    private BigDecimal paidWarrantyFeePercentageMin; // % markup min for paid warranty
    private BigDecimal paidWarrantyFeePercentageMax; // % markup max for paid warranty
    private Integer gracePeriodDays; // Grace period in days for paid warranty

    // Vehicle information
    private Long vehicleId;
    private String vehicleName;
    private String vehicleVin;
}
