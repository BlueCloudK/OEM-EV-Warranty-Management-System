package com.swp391.warrantymanagement.dto.response;

import com.swp391.warrantymanagement.enums.PartRequestStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * PartRequestResponseDTO - Response DTO trả về thông tin yêu cầu linh kiện
 */
@Data
public class PartRequestResponseDTO {

    private Long requestId;
    private Long warrantyClaimId;

    // Faulty Part information
    private Long faultyPartId;
    private String faultyPartName;
    private String faultyPartNumber;

    // Requester information
    private Long requestedByUserId;
    private String requestedByUsername;
    private String requestedByFullName;

    // Approver information
    private Long approvedByUserId;
    private String approvedByUsername;
    private String approvedByFullName;

    // Service Center information
    private Long serviceCenterId;
    private String serviceCenterName;
    private String serviceCenterAddress;

    // Request details
    private LocalDateTime requestDate;
    private String issueDescription;
    private PartRequestStatus status;
    private Integer quantity;

    // Tracking information
    private LocalDateTime approvedDate;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private String rejectionReason;
    private String trackingNumber;
    private String notes;
}


