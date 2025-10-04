package com.swp391.warrantymanagement.dto.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** DTO chức năng: làm mới token */
@Data
public class RefreshTokenRequestDTO {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
