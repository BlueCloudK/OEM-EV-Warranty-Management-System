package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/** Request DTO: Dữ liệu đầu vào từ FE cho tạo WarrantyClaim */
@Data
public class WarrantyClaimRequestDTO {
    @NotNull(message = "Vehicle ID is required")
    @Positive(message = "Vehicle ID must be a positive number")
    private Long vehicleId;

    @NotNull(message = "Installed part ID is required")
    @Positive(message = "Installed part ID must be a positive number")
    private Long installedPartId;

    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;
}
