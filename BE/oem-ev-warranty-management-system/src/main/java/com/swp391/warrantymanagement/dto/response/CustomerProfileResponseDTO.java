package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * CustomerProfileResponseDTO - Full customer profile with claim history
 * Used when customer views their own profile
 */
@Data
public class CustomerProfileResponseDTO {
    // Customer basic info
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String address;

    // User account info
    private Long userId;
    private String username;
    private LocalDateTime accountCreatedAt;

    // Claim history
    private List<WarrantyClaimResponseDTO> warrantyClaims;

    // Vehicles
    private List<VehicleResponseDTO> vehicles;

    // Feedbacks
    private List<FeedbackResponseDTO> feedbacks;

    // Statistics
    private Integer totalClaims;
    private Integer completedClaims;
    private Integer pendingClaims;
    private Integer totalVehicles;
    private Integer totalFeedbacks;
}
