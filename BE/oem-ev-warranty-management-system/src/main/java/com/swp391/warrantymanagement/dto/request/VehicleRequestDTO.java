package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/** Request DTO: Dữ liệu đầu vào từ FE cho Vehicle operations */
@Data
public class VehicleRequestDTO {
    @NotBlank(message = "Vehicle name is required")
    @Size(min = 2, max = 100, message = "Vehicle name must be between 2 and 100 characters")
    @Pattern(
            regexp = "^[a-zA-Z0-9\\s\\-]+$",
            message = "Vehicle name can only contain letters, numbers, spaces and hyphens"
    )
    private String vehicleName;

    @NotBlank(message = "Vehicle model is required")
    @Size(min = 2, max = 50, message = "Vehicle model must be between 2 and 50 characters")
    private String vehicleModel;

    @NotNull(message = "Vehicle year is required")
    @Min(value = 1900, message = "Vehicle year must be at least 1900")
    @Max(value = 2030, message = "Vehicle year cannot exceed 2030")
    private Integer vehicleYear;

    @NotBlank(message = "License plate is required")
    @Pattern(
            regexp = "^[0-9]{2}-MĐ-[0-9]{3}\\.[0-9]{2}$",
            message = "Biển số xe điện phải đúng định dạng XX-MĐ-YYY.ZZ"
    )
    private String vehicleVin;

    @NotBlank(message = "Customer ID is required")
    private String customerId; // UUID của customer
}
