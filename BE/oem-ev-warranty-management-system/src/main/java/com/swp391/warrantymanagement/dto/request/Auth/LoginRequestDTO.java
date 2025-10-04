package com.swp391.warrantymanagement.dto.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// DTO nhận thông tin đăng nhập
@Data
public class LoginRequestDTO {
    @NotBlank(message = "Username is required")
    private String username;
    @NotBlank(message = "Password is required")
    private String password;
}
