package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/** Request DTO: Dữ liệu đầu vào từ FE cho tạo WarrantyClaim */
@Data
public class WarrantyClaimRequestDTO {
    @NotNull(message = "Vehicle ID is required")
    @Positive(message = "Vehicle ID must be a positive number")
    private Long vehicleId;

    @NotBlank(message = "Part ID is required")
    @Size(max = 50, message = "Part ID cannot exceed 50 characters")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Part ID must contain only uppercase letters, numbers and hyphens")
    private String partId;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;
}
