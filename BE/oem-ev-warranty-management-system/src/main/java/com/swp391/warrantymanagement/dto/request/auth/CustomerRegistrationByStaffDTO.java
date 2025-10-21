package com.swp391.warrantymanagement.dto.request.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for staff to register a complete customer account (User + Customer profile) in one request
 * Staff cần tạo cả tài khoản User và Customer profile cho khách hàng
 */
@Data
public class CustomerRegistrationByStaffDTO {

    // ===== USER INFORMATION =====
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscore")
    private String username;

    @NotBlank(message = "Email is required")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email format is invalid"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 255, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 255, message = "Address must be between 10 and 255 characters")
    private String address;

    // ===== CUSTOMER PROFILE INFORMATION =====
    @NotBlank(message = "Customer name is required")
    @Size(min = 5, max = 100, message = "Customer name must be between 5 and 100 characters")
    @Pattern(
            regexp = "^[\\p{Lu}][\\p{Ll}\\p{M}]*(\\s+[\\p{Lu}][\\p{Ll}\\p{M}]*)*$",
            message = "Each word must start with a capital letter, support Vietnamese characters, no numbers/special characters"
    )
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+84|0)\\d{9,10}$",
            message = "Phone must be Vietnamese format: +84xxxxxxxxx or 0xxxxxxxxx"
    )
    private String phone;
}
