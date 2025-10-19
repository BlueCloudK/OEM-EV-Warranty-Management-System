package com.swp391.warrantymanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO phản hồi đăng nhập thành công */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String refreshToken;
    private String message;
    // Thông tin user cơ bản để client biết ai đang đăng nhập
    private Long userId;
    private String username;
    private String roleName;
}

