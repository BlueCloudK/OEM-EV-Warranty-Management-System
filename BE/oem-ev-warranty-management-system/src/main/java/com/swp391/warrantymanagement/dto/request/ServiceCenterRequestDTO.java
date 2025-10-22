package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * ServiceCenterRequestDTO - Request DTO for creating/updating service centers
 * Used by ADMIN to manage service centers
 */
@Data
public class ServiceCenterRequestDTO {
    @NotBlank(message = "Service center name is required")
    @Size(max = 100, message = "Service center name cannot exceed 100 characters")
    private String serviceCenterName;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be 10-15 digits")
    private String phone;

    @NotBlank(message = "Opening hours is required")
    @Size(max = 100, message = "Opening hours cannot exceed 100 characters")
    private String openingHours;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Digits(integer = 3, fraction = 6, message = "Latitude must have maximum 3 integer digits and 6 decimal places")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Digits(integer = 3, fraction = 6, message = "Longitude must have maximum 3 integer digits and 6 decimal places")
    private BigDecimal longitude;
}
