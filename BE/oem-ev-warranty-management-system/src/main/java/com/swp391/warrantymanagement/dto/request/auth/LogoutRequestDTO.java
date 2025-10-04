package com.swp391.warrantymanagement.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** DTO chức năng: Đăng xuất */
@Data
public class LogoutRequestDTO {
    @NotBlank(message = "Access token is required")
    private String accessToken;

    @NotBlank(message = "User ID is required")
    private Long userId;
}
