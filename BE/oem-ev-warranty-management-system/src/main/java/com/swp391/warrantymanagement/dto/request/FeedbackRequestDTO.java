package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * FeedbackRequestDTO - Customer submits feedback for completed warranty claim
 */
@Data
public class FeedbackRequestDTO {
    @NotNull(message = "Warranty claim ID is required")
    @Positive(message = "Warranty claim ID must be positive")
    private Long warrantyClaimId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String comment;
}
