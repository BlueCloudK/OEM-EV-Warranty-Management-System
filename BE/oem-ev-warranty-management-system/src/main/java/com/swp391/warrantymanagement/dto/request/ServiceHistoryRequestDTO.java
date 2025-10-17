package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Date;

/** Request DTO: Dữ liệu đầu vào từ FE cho ServiceHistory operations */
@Data
public class ServiceHistoryRequestDTO {
    @NotNull(message = "Service date is required")
    @PastOrPresent(message = "Service date cannot be in the future")
    private Date serviceDate;

    @NotBlank(message = "Service type is required")
    @Size(min = 3, max = 100, message = "Service type must be between 3 and 100 characters")
    @Pattern(
            regexp = "^[a-zA-Z\\s\\-\\/]+$",
            message = "Service type can only contain letters, spaces, hyphens and slashes"
    )
    private String serviceType;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;

    @NotBlank(message = "Part ID is required")
    @Size(max = 50, message = "Part ID cannot exceed 50 characters")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Part ID must contain only uppercase letters, numbers and hyphens")
    private String partId;

    @NotNull(message = "Vehicle ID is required")
    @Positive(message = "Vehicle ID must be a positive number")
    private Long vehicleId;
}
