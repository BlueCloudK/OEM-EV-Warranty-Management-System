package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Implementation của JwtService
 * - Tạo và validate JWT token
 * - Hỗ trợ cả access token và refresh token
 * - Access token: thời gian ngắn (15 phút)
 * - Refresh token: thời gian dài (7 ngày)
 */
@Service
public class JwtServiceImpl implements JwtService {

    // Secret key để sign JWT - trong production nên lưu trong environment variable
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    // Thời gian sống của access token (15 phút)
    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 15;

    // Thời gian sống của refresh token (7 ngày)
    private static final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7;

    /**
     * Tạo access token từ username (legacy method)
     * @param username tên đăng nhập
     * @return JWT access token
     */
    @Override
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username, ACCESS_TOKEN_EXPIRATION);
    }

    /**
     * Tạo access token từ User object
     * @param user đối tượng User
     * @return JWT access token
     */
    @Override
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("role", user.getRole().getRoleName());
        claims.put("email", user.getEmail());
        return createToken(claims, user.getUsername(), ACCESS_TOKEN_EXPIRATION);
    }

    /**
     * Tạo refresh token từ User object
     * @param user đối tượng User
     * @return JWT refresh token (thời gian sống lâu hơn)
     */
    @Override
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("tokenType", "refresh");
        return createToken(claims, user.getUsername(), REFRESH_TOKEN_EXPIRATION);
    }

    /**
     * Lấy username từ token
     * @param token JWT token
     * @return username
     */
    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Lấy expiration date từ token
     * @param token JWT token
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Lấy một claim cụ thể từ token
     * @param token JWT token
     * @param claimsResolver function để extract claim
     * @return giá trị claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Lấy tất cả claims từ token
     * @param token JWT token
     * @return Claims object
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey()) // key dạng SecretKey hoặc PublicKey
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Kiểm tra token có hết hạn không
     * @param token JWT token
     * @return true nếu token đã hết hạn
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Kiểm tra token có hợp lệ không
     * @param token JWT token cần kiểm tra
     * @return true nếu token hợp lệ
     */
    @Override
    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Kiểm tra token có hợp lệ cho user cụ thể không
     * @param token JWT token cần kiểm tra
     * @param user User object để so sánh
     * @return true nếu token hợp lệ và thuộc về user
     */
    @Override
    public boolean isTokenValid(String token, User user) {
        try {
            final String username = extractUsername(token);
            return (username.equals(user.getUsername()) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Tạo JWT token với claims, subject và expiration time
     * @param claims dữ liệu bổ sung trong token
     * @param subject chủ đề (thường là username)
     * @param expirationTime thời gian hết hạn (milliseconds)
     * @return JWT token string
     */
    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Lấy signing key từ secret
     * @return Key object để sign JWT
     */
    private SecretKey getSignKey() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
