package com.swp391.warrantymanagement.config;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Unit tests for CustomUserDetailsService
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CustomUserDetailsService Tests")
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User mockUser;
    private Role mockRole;

    @BeforeEach
    void setUp() {
        mockRole = new Role();
        mockRole.setRoleId(1L);
        mockRole.setRoleName("ADMIN");

        mockUser = new User();
        mockUser.setUserId(1L);
        mockUser.setUsername("admin");
        mockUser.setPassword("$2a$10$encodedPassword");
        mockUser.setRole(mockRole);
    }

    @Test
    @DisplayName("Should load user by username successfully")
    void loadUserByUsername_Success() {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("admin")).thenReturn(Optional.of("ADMIN"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin");

        // Assert
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("admin");
        assertThat(userDetails.getPassword()).isEqualTo("$2a$10$encodedPassword");
        assertThat(userDetails.getAuthorities()).hasSize(1);

        GrantedAuthority authority = userDetails.getAuthorities().iterator().next();
        assertThat(authority.getAuthority()).isEqualTo("ROLE_ADMIN");
    }

    @Test
    @DisplayName("Should load user with CUSTOMER role")
    void loadUserByUsername_CustomerRole_Success() {
        // Arrange
        mockUser.setUsername("customer1");
        mockRole.setRoleName("CUSTOMER");

        when(userRepository.findByUsername("customer1")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("customer1")).thenReturn(Optional.of("CUSTOMER"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("customer1");

        // Assert
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("customer1");

        GrantedAuthority authority = userDetails.getAuthorities().iterator().next();
        assertThat(authority.getAuthority()).isEqualTo("ROLE_CUSTOMER");
    }

    @Test
    @DisplayName("Should load user with SC_STAFF role")
    void loadUserByUsername_ScStaffRole_Success() {
        // Arrange
        mockUser.setUsername("scstaff");
        mockRole.setRoleName("SC_STAFF");

        when(userRepository.findByUsername("scstaff")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("scstaff")).thenReturn(Optional.of("SC_STAFF"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("scstaff");

        // Assert
        assertThat(userDetails).isNotNull();

        GrantedAuthority authority = userDetails.getAuthorities().iterator().next();
        assertThat(authority.getAuthority()).isEqualTo("ROLE_SC_STAFF");
    }

    @Test
    @DisplayName("Should load user with EVM_STAFF role")
    void loadUserByUsername_EvmStaffRole_Success() {
        // Arrange
        mockUser.setUsername("evmstaff");
        mockRole.setRoleName("EVM_STAFF");

        when(userRepository.findByUsername("evmstaff")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("evmstaff")).thenReturn(Optional.of("EVM_STAFF"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("evmstaff");

        // Assert
        assertThat(userDetails).isNotNull();

        GrantedAuthority authority = userDetails.getAuthorities().iterator().next();
        assertThat(authority.getAuthority()).isEqualTo("ROLE_EVM_STAFF");
    }

    @Test
    @DisplayName("Should load user with SC_TECHNICIAN role")
    void loadUserByUsername_ScTechnicianRole_Success() {
        // Arrange
        mockUser.setUsername("technician");
        mockRole.setRoleName("SC_TECHNICIAN");

        when(userRepository.findByUsername("technician")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("technician")).thenReturn(Optional.of("SC_TECHNICIAN"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("technician");

        // Assert
        assertThat(userDetails).isNotNull();

        GrantedAuthority authority = userDetails.getAuthorities().iterator().next();
        assertThat(authority.getAuthority()).isEqualTo("ROLE_SC_TECHNICIAN");
    }

    @Test
    @DisplayName("Should verify user account is not expired")
    void loadUserByUsername_AccountNotExpired() {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("admin")).thenReturn(Optional.of("ADMIN"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin");

        // Assert
        assertThat(userDetails.isAccountNonExpired()).isTrue();
    }

    @Test
    @DisplayName("Should verify user account is not locked")
    void loadUserByUsername_AccountNotLocked() {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("admin")).thenReturn(Optional.of("ADMIN"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin");

        // Assert
        assertThat(userDetails.isAccountNonLocked()).isTrue();
    }

    @Test
    @DisplayName("Should verify user credentials are not expired")
    void loadUserByUsername_CredentialsNotExpired() {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("admin")).thenReturn(Optional.of("ADMIN"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin");

        // Assert
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
    }

    @Test
    @DisplayName("Should verify user is enabled")
    void loadUserByUsername_UserEnabled() {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("admin")).thenReturn(Optional.of("ADMIN"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin");

        // Assert
        assertThat(userDetails.isEnabled()).isTrue();
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when user not found")
    void loadUserByUsername_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("nonexistent"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found: nonexistent");
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when role not found")
    void loadUserByUsername_RoleNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("admin")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername("admin"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("Role not found for user: admin");
    }

    @Test
    @DisplayName("Should handle username with special characters")
    void loadUserByUsername_SpecialCharacters_Success() {
        // Arrange
        mockUser.setUsername("user.name@example.com");
        when(userRepository.findByUsername("user.name@example.com")).thenReturn(Optional.of(mockUser));
        when(userRepository.findRoleNameByUsername("user.name@example.com")).thenReturn(Optional.of("ADMIN"));

        // Act
        UserDetails userDetails = customUserDetailsService.loadUserByUsername("user.name@example.com");

        // Assert
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("user.name@example.com");
    }

    @Test
    @DisplayName("Should handle empty username")
    void loadUserByUsername_EmptyUsername_ThrowsException() {
        // Arrange
        when(userRepository.findByUsername("")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(""))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found: ");
    }
}

