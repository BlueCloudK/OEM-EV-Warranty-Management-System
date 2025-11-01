package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.impl.JwtServiceImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtServiceImpl Tests")
class JwtServiceImplTest {

    @InjectMocks
    private JwtServiceImpl jwtService;

    private User testUser;
    private String testSecretKey;

    @BeforeEach
    void setUp() {
        // Generate a valid secret key for testing (256-bit for HS256)
        byte[] keyBytes = new byte[32]; // 256 bits
        new java.security.SecureRandom().nextBytes(keyBytes);
        testSecretKey = Base64.getEncoder().encodeToString(keyBytes);

        // Inject the secret key into the service
        ReflectionTestUtils.setField(jwtService, "secretKey", testSecretKey);

        // Create test user
        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName("CUSTOMER");

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("testuser@example.com");
        testUser.setRole(role);
    }

    @Nested
    @DisplayName("generateToken Tests")
    class GenerateTokenTests {

        @Test
        @DisplayName("Should generate valid access token with correct claims")
        void generateToken_ValidUser_ReturnsTokenWithClaims() {
            // When
            String token = jwtService.generateToken(testUser);

            // Then
            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();

            // Verify claims
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(testSecretKey)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            assertThat(claims.getSubject()).isEqualTo("testuser");
            assertThat(claims.get("userId")).isEqualTo(1);
            assertThat(claims.get("role")).isEqualTo("CUSTOMER");
            assertThat(claims.get("email")).isEqualTo("testuser@example.com");
        }

        @Test
        @DisplayName("Should generate token with future expiration date")
        void generateToken_ValidUser_HasFutureExpiration() {
            // When
            String token = jwtService.generateToken(testUser);
            Date expiration = jwtService.extractExpiration(token);

            // Then
            assertThat(expiration).isAfter(new Date());
        }

        @Test
        @DisplayName("Should generate valid tokens for multiple calls")
        void generateToken_MultipleCalls_GeneratesValidTokens() {
            // When
            String token1 = jwtService.generateToken(testUser);
            String token2 = jwtService.generateToken(testUser);

            // Then - Both tokens should be valid and contain correct information
            assertThat(token1).isNotNull().isNotEmpty();
            assertThat(token2).isNotNull().isNotEmpty();

            assertThat(jwtService.isTokenValid(token1)).isTrue();
            assertThat(jwtService.isTokenValid(token2)).isTrue();

            assertThat(jwtService.extractUsername(token1)).isEqualTo("testuser");
            assertThat(jwtService.extractUsername(token2)).isEqualTo("testuser");
        }
    }

    @Nested
    @DisplayName("generateRefreshToken Tests")
    class GenerateRefreshTokenTests {

        @Test
        @DisplayName("Should generate valid refresh token")
        void generateRefreshToken_ValidUser_ReturnsToken() {
            // When
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // Then
            assertThat(refreshToken).isNotNull();
            assertThat(refreshToken).isNotEmpty();
        }

        @Test
        @DisplayName("Should generate refresh token with correct claims")
        void generateRefreshToken_ValidUser_HasCorrectClaims() {
            // When
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // Then
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(testSecretKey)))
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();

            assertThat(claims.getSubject()).isEqualTo("testuser");
            assertThat(claims.get("userId")).isEqualTo(1);
            assertThat(claims.get("tokenType")).isEqualTo("refresh");
        }

        @Test
        @DisplayName("Should generate refresh token with longer expiration than access token")
        void generateRefreshToken_ValidUser_HasLongerExpiration() {
            // When
            String accessToken = jwtService.generateToken(testUser);
            String refreshToken = jwtService.generateRefreshToken(testUser);

            Date accessExpiration = jwtService.extractExpiration(accessToken);
            Date refreshExpiration = jwtService.extractExpiration(refreshToken);

            // Then
            assertThat(refreshExpiration).isAfter(accessExpiration);
        }
    }

    @Nested
    @DisplayName("extractUsername Tests")
    class ExtractUsernameTests {

        @Test
        @DisplayName("Should extract username from valid token")
        void extractUsername_ValidToken_ReturnsUsername() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            String username = jwtService.extractUsername(token);

            // Then
            assertThat(username).isEqualTo("testuser");
        }

        @Test
        @DisplayName("Should extract username from refresh token")
        void extractUsername_RefreshToken_ReturnsUsername() {
            // Given
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // When
            String username = jwtService.extractUsername(refreshToken);

            // Then
            assertThat(username).isEqualTo("testuser");
        }
    }

    @Nested
    @DisplayName("extractExpiration Tests")
    class ExtractExpirationTests {

        @Test
        @DisplayName("Should extract expiration date from token")
        void extractExpiration_ValidToken_ReturnsDate() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            Date expiration = jwtService.extractExpiration(token);

            // Then
            assertThat(expiration).isNotNull();
            assertThat(expiration).isAfter(new Date());
        }
    }

    @Nested
    @DisplayName("isTokenValid Tests")
    class IsTokenValidTests {

        @Test
        @DisplayName("Should return true for valid token")
        void isTokenValid_ValidToken_ReturnsTrue() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            boolean isValid = jwtService.isTokenValid(token);

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should return true for valid refresh token")
        void isTokenValid_ValidRefreshToken_ReturnsTrue() {
            // Given
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // When
            boolean isValid = jwtService.isTokenValid(refreshToken);

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should return false for invalid token")
        void isTokenValid_InvalidToken_ReturnsFalse() {
            // Given
            String invalidToken = "invalid.token.here";

            // When
            boolean isValid = jwtService.isTokenValid(invalidToken);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should return false for empty token")
        void isTokenValid_EmptyToken_ReturnsFalse() {
            // Given
            String emptyToken = "";

            // When
            boolean isValid = jwtService.isTokenValid(emptyToken);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should return false for null token")
        void isTokenValid_NullToken_ReturnsFalse() {
            // When
            boolean isValid = jwtService.isTokenValid(null);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should return false for expired token")
        void isTokenValid_ExpiredToken_ReturnsFalse() {
            // Given - Create a token with very short expiration (1 millisecond)
            ReflectionTestUtils.setField(jwtService, "secretKey", testSecretKey);

            // Create an expired token manually
            SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(testSecretKey));
            String expiredToken = Jwts.builder()
                    .subject("testuser")
                    .issuedAt(new Date(System.currentTimeMillis() - 10000))
                    .expiration(new Date(System.currentTimeMillis() - 5000))
                    .signWith(key)
                    .compact();

            // When
            boolean isValid = jwtService.isTokenValid(expiredToken);

            // Then
            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("extractClaim Tests")
    class ExtractClaimTests {

        @Test
        @DisplayName("Should extract custom claim from token")
        void extractClaim_ValidToken_ReturnsCustomClaim() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            Long userId = jwtService.extractClaim(token, claims -> claims.get("userId", Integer.class)).longValue();
            String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
            String email = jwtService.extractClaim(token, claims -> claims.get("email", String.class));

            // Then
            assertThat(userId).isEqualTo(1L);
            assertThat(role).isEqualTo("CUSTOMER");
            assertThat(email).isEqualTo("testuser@example.com");
        }

        @Test
        @DisplayName("Should extract subject claim from token")
        void extractClaim_ValidToken_ReturnsSubject() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            String subject = jwtService.extractClaim(token, Claims::getSubject);

            // Then
            assertThat(subject).isEqualTo("testuser");
        }
    }
}

