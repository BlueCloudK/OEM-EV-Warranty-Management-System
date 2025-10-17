package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

/** Request DTO: Dữ liệu đầu vào từ FE cho Part operations */
@Data
public class PartRequestDTO {
    @NotBlank(message = "Part ID is required")
    @Size(max = 50, message = "Part ID cannot exceed 50 characters")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Part ID must contain only uppercase letters, numbers and hyphens")
    private String partId;

    @NotBlank(message = "Part name is required")
    @Size(min = 2, max = 100, message = "Part name must be between 2 and 100 characters")
    private String partName;

    @NotBlank(message = "Part number is required")
    @Size(max = 50, message = "Part number cannot exceed 50 characters")
    @Pattern(regexp = "^[A-Z0-9-_]+$", message = "Part number must contain only uppercase letters, numbers, hyphens and underscores")
    private String partNumber;

    @NotBlank(message = "Manufacturer is required")
    @Size(min = 2, max = 100, message = "Manufacturer must be between 2 and 100 characters")
    private String manufacturer;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "99999999.99", message = "Price cannot exceed 99,999,999.99")
    private BigDecimal price;

    @NotNull(message = "Installation date is required")
    @PastOrPresent(message = "Installation date cannot be in the future")
    private Date installationDate;

    @NotNull(message = "Warranty expiration date is required")
    @Future(message = "Warranty expiration date must be in the future")
    private Date warrantyExpirationDate;

    @NotNull(message = "Vehicle ID is required")
    @Positive(message = "Vehicle ID must be a positive number")
    private Long vehicleId;
}
