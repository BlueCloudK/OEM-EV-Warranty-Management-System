package com.swp391.warrantymanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

/**
 * Request DTO: Dữ liệu đầu vào từ FE cho Customer operations
 * Chỉ chứa thông tin Customer (name, phone)
 * Email và Address được lưu trong User entity
 */
@Data
public class CustomerRequestDTO {
    @NotBlank(message = "Name is required")
    @Size(min=5, max = 100, message = "Name must be between 5 and 100 characters")
    @Pattern(
            regexp = "^[\\p{Lu}][\\p{Ll}\\p{M}]*(\\s+[\\p{Lu}][\\p{Ll}\\p{M}]*)*$",
            message = "Each word must start with a capital letter, support Vietnamese characters, no numbers/special characters"
    )
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+84|0)\\d{9,10}$", // format VN: +84xxxxxxxxx hoặc 0xxxxxxxxx
            message = "Phone must be Vietnamese format: +84xxxxxxxxx or 0xxxxxxxxx"
    )
    private String phone;

    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be a positive number")
    private Long userId; // chủ sở hữu (User)
}
