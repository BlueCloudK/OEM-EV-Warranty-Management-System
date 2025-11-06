package com.swp391.warrantymanagement.util;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for SecurityUtil class
 * Updated to work with Optional return types after refactoring
 */
@DisplayName("SecurityUtil Tests")
class SecurityUtilTest {

    private SecurityContext securityContext;

    @BeforeEach
    void setUp() {
        securityContext = SecurityContextHolder.createEmptyContext();
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should return current authentication")
    void getCurrentAuthentication_Success() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "testuser", "password", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        securityContext.setAuthentication(authentication);

        // Act
        Optional<Authentication> result = SecurityUtil.getCurrentAuthentication();

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should return empty Optional when no authentication")
    void getCurrentAuthentication_NoAuth_ReturnsEmpty() {
        // Act
        Optional<Authentication> result = SecurityUtil.getCurrentAuthentication();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return current username")
    void getCurrentUsername_Success() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "john.doe", "password", List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        securityContext.setAuthentication(authentication);

        // Act
        Optional<String> username = SecurityUtil.getCurrentUsername();

        // Assert
        assertThat(username).isPresent();
        assertThat(username.get()).isEqualTo("john.doe");
    }

    @Test
    @DisplayName("Should return empty Optional when not authenticated")
    void getCurrentUsername_NotAuthenticated_ReturnsEmpty() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "testuser", "password", List.of()
        );
        authentication.setAuthenticated(false);
        securityContext.setAuthentication(authentication);

        // Act
        Optional<String> username = SecurityUtil.getCurrentUsername();

        // Assert
        assertThat(username).isEmpty();
    }

    @Test
    @DisplayName("Should return empty Optional when authentication is null")
    void getCurrentUsername_NullAuth_ReturnsEmpty() {
        // Act
        Optional<String> username = SecurityUtil.getCurrentUsername();

        // Assert
        assertThat(username).isEmpty();
    }

    @Test
    @DisplayName("Should return current roles")
    void getCurrentRoles_Success() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "admin", "password",
                List.of(
                        new SimpleGrantedAuthority("ROLE_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_USER")
                )
        );
        securityContext.setAuthentication(authentication);

        // Act
        Set<String> roles = SecurityUtil.getCurrentRoles();

        // Assert
        assertThat(roles).hasSize(2);
        assertThat(roles).contains("ROLE_ADMIN", "ROLE_USER");
    }

    @Test
    @DisplayName("Should return empty set when not authenticated")
    void getCurrentRoles_NotAuthenticated_ReturnsEmptySet() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "testuser", "password", List.of()
        );
        authentication.setAuthenticated(false);
        securityContext.setAuthentication(authentication);

        // Act
        Set<String> roles = SecurityUtil.getCurrentRoles();

        // Assert
        assertThat(roles).isEmpty();
    }

    @Test
    @DisplayName("Should return empty set when authentication is null")
    void getCurrentRoles_NullAuth_ReturnsEmptySet() {
        // Act
        Set<String> roles = SecurityUtil.getCurrentRoles();

        // Assert
        assertThat(roles).isEmpty();
    }

    @Test
    @DisplayName("Should check hasRole with ROLE_ prefix")
    void hasRole_WithPrefix_ReturnsTrue() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "admin", "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        securityContext.setAuthentication(authentication);

        // Act & Assert
        assertThat(SecurityUtil.hasRole("ADMIN")).isTrue();
        assertThat(SecurityUtil.hasRole("ROLE_ADMIN")).isTrue();
    }

    @Test
    @DisplayName("Should return false when role not found")
    void hasRole_NotFound_ReturnsFalse() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "user", "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        securityContext.setAuthentication(authentication);

        // Act & Assert
        assertThat(SecurityUtil.hasRole("ADMIN")).isFalse();
    }

    @Test
    @DisplayName("Should return UserDetails when principal is UserDetails")
    void getCurrentUserDetails_Success() {
        // Arrange
        UserDetails userDetails = User.builder()
                .username("testuser")
                .password("password")
                .authorities("ROLE_USER")
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, "password", userDetails.getAuthorities()
        );
        securityContext.setAuthentication(authentication);

        // Act
        Optional<UserDetails> result = SecurityUtil.getCurrentUserDetails();

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should return empty Optional when principal is not UserDetails")
    void getCurrentUserDetails_NotUserDetails_ReturnsEmpty() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "stringprincipal", "password", List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        securityContext.setAuthentication(authentication);

        // Act
        Optional<UserDetails> result = SecurityUtil.getCurrentUserDetails();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty Optional when authentication is null")
    void getCurrentUserDetails_NullAuth_ReturnsEmpty() {
        // Act
        Optional<UserDetails> result = SecurityUtil.getCurrentUserDetails();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return true when user is authenticated")
    void isAuthenticated_Success() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "testuser", "password", List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        securityContext.setAuthentication(authentication);

        // Act
        boolean result = SecurityUtil.isAuthenticated();

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when user is not authenticated")
    void isAuthenticated_NotAuthenticated_ReturnsFalse() {
        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "testuser", "password", List.of()
        );
        authentication.setAuthenticated(false);
        securityContext.setAuthentication(authentication);

        // Act
        boolean result = SecurityUtil.isAuthenticated();

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should return true for anonymousUser when authenticated")
    void isAuthenticated_AnonymousUser_ButAuthenticated_ReturnsTrue() {
        // Note: After refactoring, we removed the anonymousUser check from SecurityUtil
        // because it was causing false positives with JWT authentication.
        // Now we only check isAuthenticated() flag.
        // If principal is "anonymousUser" but isAuthenticated() = true, we trust that.

        // Arrange
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "anonymousUser", "password", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
        );
        // Key: authentication is marked as authenticated
        securityContext.setAuthentication(authentication);

        // Act
        boolean result = SecurityUtil.isAuthenticated();

        // Assert
        // After fix: If isAuthenticated() = true, we return true
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when authentication is null")
    void isAuthenticated_NullAuth_ReturnsFalse() {
        // Act
        boolean result = SecurityUtil.isAuthenticated();

        // Assert
        assertThat(result).isFalse();
    }
}
