package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.User;

/**
 * Service xử lý JWT Token
 * - Generate: Tạo access token (15 min) và refresh token (7 days)
 * - Validate: Kiểm tra token hợp lệ (signature, expiration)
 * - Extract: Lấy username, role từ token claims
 */
public interface JwtService {
    // Tạo access token (short-lived, 15 minutes)
    String generateToken(User user);

    // Tạo refresh token (long-lived, 7 days)
    String generateRefreshToken(User user);

    // Lấy username từ JWT token claims
    String extractUsername(String token);

    // Kiểm tra token hợp lệ (signature + expiration)
    boolean isTokenValid(String token);
}
