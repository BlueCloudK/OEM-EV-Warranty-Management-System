package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * PartRequestDTO - Request DTO cho SC_TECHNICIAN tạo yêu cầu linh kiện
 */
@Data
public class PartRequestRequestDTO {

    @NotNull(message = "Warranty claim ID is required")
    private Long warrantyClaimId;

    @NotBlank(message = "Faulty part ID is required")
    private String faultyPartId;

    @NotBlank(message = "Issue description is required")
    @Size(min = 10, max = 1000, message = "Issue description must be between 10 and 1000 characters")
    private String issueDescription;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 100, message = "Quantity cannot exceed 100")
    private Integer quantity;

    @NotNull(message = "Service center ID is required")
    private Long serviceCenterId;
}

