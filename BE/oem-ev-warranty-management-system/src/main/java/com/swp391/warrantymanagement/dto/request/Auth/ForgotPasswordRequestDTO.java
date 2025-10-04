package com.swp391.warrantymanagement.dto.request.Auth;

import jakarta.validation.constraints.*;
import lombok.Data;

/** DTO chức năng: Quên mật khẩu */
@Data
public class ForgotPasswordRequestDTO {
    @NotBlank(message = "Email is required")
    @Pattern(
            regexp ="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email format is invalid"
    )
    private String email;
}
