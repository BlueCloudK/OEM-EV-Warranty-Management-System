package com.swp391.warrantymanagement.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * UserProfileResponseDTO - User profile for staff/admin roles
 * Used when staff/admin views their own profile
 */
@Data
public class UserProfileResponseDTO {
    // User basic info
    private Long userId;
    private String username;
    private String email;
    private String address;
    private LocalDateTime createdAt;

    // Role info
    private String roleName;
    private Long roleId;

    // Service center info (for staff only)
    private Long serviceCenterId;
    private String serviceCenterName;
    private String serviceCenterAddress;

    // Work statistics
    private Integer totalAssignedClaims;
    private Integer totalWorkLogs;
    private List<WarrantyClaimResponseDTO> assignedClaims;
}
