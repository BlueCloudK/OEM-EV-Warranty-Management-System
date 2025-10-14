package com.swp391.warrantymanagement.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Response DTO for User Management
 * Used by ADMIN to manage user accounts
 */
@Data
public class UserResponseDTO {
    private Long userId;
    private String username;
    private String email;
    private String address;
    private String roleName;
    private Long roleId;
    private LocalDateTime createdAt;
}

