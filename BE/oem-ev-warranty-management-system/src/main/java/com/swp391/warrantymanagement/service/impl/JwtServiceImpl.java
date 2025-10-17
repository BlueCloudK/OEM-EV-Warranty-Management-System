package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
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
 * - Access token: thời gian ngắn (1 giờ)
 * - Refresh token: thời gian dài (7 ngày)
 */
@Service
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.secret-key}")
    private String secretKey;

    // Thời gian sống của access token (1 giờ)
    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 60;

    // Thời gian sống của refresh token (7 ngày)
    private static final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7;

    // Tạo access token từ User object
    @Override
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("role", user.getRole().getRoleName());
        claims.put("email", user.getEmail());
        return createToken(claims, user.getUsername(), ACCESS_TOKEN_EXPIRATION);
    }

    // Tạo refresh token từ User object
    @Override
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("tokenType", "refresh");
        return createToken(claims, user.getUsername(), REFRESH_TOKEN_EXPIRATION);
    }

    // Lấy username từ token
    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Lấy thời gian hết hạn từ token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Lấy claim cụ thể từ token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Lấy tất cả claims từ token
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey()) // key dạng SecretKey hoặc PublicKey
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Kiểm tra token đã hết hạn chưa
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Kiểm tra token có hợp lệ không
    @Override
    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // Tạo token với claims, subject và thời gian hết hạn
    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignKey())
                .compact();
    }

    // Lấy SecretKey từ chuỗi secretKey đã mã hóa Base64
    private SecretKey getSignKey() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
