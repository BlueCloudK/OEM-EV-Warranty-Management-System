package com.swp391.warrantymanagement.dto.request.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

/** DTO chức năng: Đặt lại mật khẩu */
@Data
public class ResetPasswordRequestDTO {
    @NotBlank(message = "Reset token is required")
    private String resetToken;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
