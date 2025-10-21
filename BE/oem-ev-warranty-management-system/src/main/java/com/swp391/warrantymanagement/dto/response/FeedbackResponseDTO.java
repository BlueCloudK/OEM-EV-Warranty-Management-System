package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * FeedbackResponseDTO - Returns feedback information to frontend
 */
@Data
public class FeedbackResponseDTO {
    private Long feedbackId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    // Warranty claim information
    private Long warrantyClaimId;
    private String claimDescription;

    // Customer information
    private String customerId;
    private String customerName;
    private String customerEmail;
}
