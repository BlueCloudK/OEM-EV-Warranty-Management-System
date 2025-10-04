package com.swp391.warrantymanagement.dto.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** DTO chức năng: Đăng xuất */
@Data
public class LogoutRequestDTO {
    @NotBlank(message = "Access token is required")
    private String accessToken;
}
