package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Implementation của JwtService
 * Xử lý generation, validation, và extraction của JWT tokens
 */
@Service
public class JwtServiceImpl implements JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtServiceImpl.class);

    @Value("${jwt.secret-key}")
    private String secretKey;

    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 60 * 3; // 3 giờ
    private static final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7; // 7 ngày

    /**
     * Tạo access token với thời hạn 3 giờ
     *
     * @param user User entity
     * @return JWT access token string
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
     * Tạo refresh token với thời hạn 7 ngày
     *
     * @param user User entity
     * @return JWT refresh token string
     */
    @Override
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("tokenType", "refresh");
        return createToken(claims, user.getUsername(), REFRESH_TOKEN_EXPIRATION);
    }

    @Override
    public String extractUsername(String token) {
        try {
            String username = extractClaim(token, Claims::getSubject);
            logger.debug("📝 [JwtService] Username extracted: {}", username);
            return username;
        } catch (Exception e) {
            logger.error("❌ [JwtService] Failed to extract username: {}", e.getMessage());
            throw e;
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            logger.debug("✅ [JwtService] Token signature verified successfully");
            return claims;
        } catch (Exception e) {
            logger.error("❌ [JwtService] Token signature verification FAILED: {} - {}",
                    e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        Date now = new Date();
        boolean expired = expiration.before(now);

        if (expired) {
            logger.warn("⏰ [JwtService] Token EXPIRED. Expiration: {}, Now: {}", expiration, now);
        } else {
            logger.debug("✅ [JwtService] Token NOT expired. Expiration: {}, Now: {}", expiration, now);
        }

        return expired;
    }

    @Override
    public boolean isTokenValid(String token) {
        try {
            logger.debug("🔍 [JwtService] Validating token...");
            boolean notExpired = !isTokenExpired(token);

            if (notExpired) {
                logger.info("✅ [JwtService] Token is VALID");
            } else {
                logger.warn("❌ [JwtService] Token is INVALID (expired)");
            }

            return notExpired;
        } catch (Exception e) {
            logger.error("❌ [JwtService] Token validation FAILED: {} - {}",
                    e.getClass().getSimpleName(), e.getMessage());
            return false;
        }
    }

    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignKey())
                .compact();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
