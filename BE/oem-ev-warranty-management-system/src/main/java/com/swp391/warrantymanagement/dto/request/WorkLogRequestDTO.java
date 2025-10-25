package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * WorkLogRequestDTO - Used by EVM Staff to log work on warranty claims
 */
@Data
public class WorkLogRequestDTO {
    @NotNull(message = "Warranty claim ID is required")
    @Positive(message = "Warranty claim ID must be positive")
    private Long warrantyClaimId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
}
