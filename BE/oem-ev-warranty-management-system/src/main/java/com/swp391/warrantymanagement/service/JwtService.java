package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.User;

/**
 * Service xử lý JWT Token
 * - Tạo access token và refresh token
 * - Validate token và extract thông tin
 * - Hỗ trợ cả username string và User object
 */
public interface JwtService {

    String generateToken(User user);
    String generateRefreshToken(User user);
    String extractUsername(String token);
    boolean isTokenValid(String token);
}
