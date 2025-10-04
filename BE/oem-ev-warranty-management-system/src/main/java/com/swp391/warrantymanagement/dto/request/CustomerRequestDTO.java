package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/** Request DTO: Dữ liệu đầu vào từ FE cho Customer operations */
@Data
public class CustomerRequestDTO {
    // chặn từ form
    @NotBlank(message = "Name is required")
    @Size(min=5, max = 100, message = "Name must be between 5 and 100 characters")
    @Pattern(
            regexp = "^(\\p{Lu}\\p{Ll}+)(\\s\\p{Lu}\\p{Ll}+)*$",
            message = "Each word must start with a capital letter, no numbers/special characters, no extra spaces"
    )
    private String name;

    @NotBlank(message = "Email is required")
    @Pattern(
            regexp ="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", // may be 99% email hiện tại ^_^
            message = "Email format is invalid"
    )
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+84|0)\\d{9,10}$", // format VN: +84xxxxxxxxx hoặc 0xxxxxxxxx
            message = "Phone must be Vietnamese format: +84xxxxxxxxx or 0xxxxxxxxx"
    )
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be a positive number")
    private Long userId; // chủ sở hữu (User)
}
