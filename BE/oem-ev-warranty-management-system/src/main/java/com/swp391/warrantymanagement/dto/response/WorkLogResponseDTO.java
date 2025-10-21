package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * WorkLogResponseDTO - Returns work log information to frontend
 */
@Data
public class WorkLogResponseDTO {
    private Long workLogId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String description;

    // User information (who did the work)
    private Long userId;
    private String username;
    private String userEmail;

    // Warranty claim information
    private Long warrantyClaimId;
    private String claimDescription;
}
