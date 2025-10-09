package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.User;

/**
 * Service xử lý JWT Token
 * - Tạo access token và refresh token
 * - Validate token và extract thông tin
 * - Hỗ trợ cả username string và User object
 */
public interface JwtService {

    /**
     * Tạo access token từ username (legacy method)
     * @param username tên đăng nhập
     * @return JWT access token
     */
    String generateToken(String username);

    /**
     * Tạo access token từ User object
     * @param user đối tượng User
     * @return JWT access token
     */
    String generateToken(User user);

    /**
     * Tạo refresh token từ User object
     * @param user đối tượng User
     * @return JWT refresh token (thời gian sống lâu hơn)
     */
    String generateRefreshToken(User user);

    /**
     * Lấy username từ token
     * @param token JWT token
     * @return username
     */
    String extractUsername(String token);

    /**
     * Kiểm tra token có hợp lệ không
     * @param token JWT token cần kiểm tra
     * @return true nếu token hợp lệ
     */
    boolean isTokenValid(String token);

    /**
     * Kiểm tra token có hợp lệ cho user cụ thể không
     * @param token JWT token cần kiểm tra
     * @param user User object để so sánh
     * @return true nếu token hợp lệ và thuộc về user
     */
    boolean isTokenValid(String token, User user);
}
