package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.auth.CustomerRegistrationByStaffDTO;
import com.swp391.warrantymanagement.dto.request.auth.LoginRequestDTO;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.TokenRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private Role role;

    @BeforeEach
    void setUp() {
        role = new Role();
        role.setRoleId(1L);
        role.setRoleName("CUSTOMER");

        user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now()); // Initialize createdAt
    }

    @Nested
    @DisplayName("Authenticate User")
    class AuthenticateUser {

        @Test
        @DisplayName("Should authenticate successfully with correct credentials")
        void authenticateUser_Success() {
            // Arrange
            LoginRequestDTO loginRequest = new LoginRequestDTO();
            loginRequest.setUsername("testuser");
            loginRequest.setPassword("password");

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
            when(jwtService.generateToken(user)).thenReturn("accessToken");
            when(jwtService.generateRefreshToken(user)).thenReturn("refreshToken");

            // Act
            AuthResponseDTO response = authService.authenticateUser(loginRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("accessToken");
            assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
            assertThat(response.getUsername()).isEqualTo("testuser");
            verify(tokenRepository).save(any());
        }

        @Test
        @DisplayName("Should throw exception for incorrect password")
        void authenticateUser_InvalidCredentials_ThrowsException() {
            // Arrange
            LoginRequestDTO loginRequest = new LoginRequestDTO();
            loginRequest.setUsername("testuser");
            loginRequest.setPassword("wrongpassword");

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.authenticateUser(loginRequest));
            assertThat(exception.getMessage()).isEqualTo("Invalid credentials");
        }
    }

    @Nested
    @DisplayName("Register Customer By Staff")
    class RegisterCustomerByStaff {

        private CustomerRegistrationByStaffDTO registrationDTO;

        @BeforeEach
        void setup() {
            registrationDTO = new CustomerRegistrationByStaffDTO();
            registrationDTO.setUsername("newcust");
            registrationDTO.setEmail("newcust@example.com");
            registrationDTO.setPassword("password123");
            registrationDTO.setName("New Customer");
            registrationDTO.setPhone("0987654321");
            registrationDTO.setAddress("456 New Ave");
        }

        @Test
        @DisplayName("Should register user and customer successfully")
        void registerCustomerByStaff_Success() {
            // Arrange
            User savedUser = new User();
            savedUser.setUserId(2L);
            savedUser.setUsername(registrationDTO.getUsername());
            savedUser.setEmail(registrationDTO.getEmail());
            savedUser.setPassword("encodedPassword");
            savedUser.setRole(role);
            savedUser.setCreatedAt(LocalDateTime.now()); // Initialize createdAt

            Customer savedCustomer = new Customer();
            savedCustomer.setCustomerId(UUID.randomUUID());
            savedCustomer.setName(registrationDTO.getName());
            savedCustomer.setPhone(registrationDTO.getPhone());
            savedCustomer.setUser(savedUser);

            when(userRepository.existsByUsername(anyString())).thenReturn(false);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(customerRepository.findByPhone(anyString())).thenReturn(Optional.empty());
            when(roleRepository.findByRoleName("CUSTOMER")).thenReturn(Optional.of(role));
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

            // Act
            CustomerResponseDTO response = authService.registerCustomerByStaff(registrationDTO);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("New Customer");
            assertThat(response.getPhone()).isEqualTo("0987654321");

            verify(userRepository).save(any(User.class));
            verify(customerRepository).save(any(Customer.class));
        }

        @Test
        @DisplayName("Should throw exception if username already exists")
        void registerCustomerByStaff_UsernameExists_ThrowsException() {
            // Arrange
            when(userRepository.existsByUsername("newcust")).thenReturn(true);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.registerCustomerByStaff(registrationDTO));
            assertThat(exception.getMessage()).isEqualTo("Username already exists: newcust");
        }

        @Test
        @DisplayName("Should throw exception if email already exists")
        void registerCustomerByStaff_EmailExists_ThrowsException() {
            // Arrange
            when(userRepository.existsByUsername(anyString())).thenReturn(false);
            when(userRepository.existsByEmail("newcust@example.com")).thenReturn(true);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.registerCustomerByStaff(registrationDTO));
            assertThat(exception.getMessage()).isEqualTo("Email already exists: newcust@example.com");
        }

        @Test
        @DisplayName("Should throw exception if phone already exists")
        void registerCustomerByStaff_PhoneExists_ThrowsException() {
            // Arrange
            when(userRepository.existsByUsername(anyString())).thenReturn(false);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(customerRepository.findByPhone("0987654321")).thenReturn(Optional.of(new Customer()));

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.registerCustomerByStaff(registrationDTO));
            assertThat(exception.getMessage()).isEqualTo("Phone number already exists: 0987654321");
        }
    }

    @Nested
    @DisplayName("Refresh User Token")
    class RefreshUserToken {

        @Test
        @DisplayName("Should refresh token successfully with valid refresh token")
        void refreshUserToken_Success() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO refreshRequest =
                new com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO();
            refreshRequest.setRefreshToken("validRefreshToken");

            com.swp391.warrantymanagement.entity.Token tokenEntity = new com.swp391.warrantymanagement.entity.Token();
            tokenEntity.setToken("validRefreshToken");
            tokenEntity.setUser(user);
            tokenEntity.setExpirationDate(LocalDateTime.now().plusDays(1));

            when(tokenRepository.findByToken("validRefreshToken")).thenReturn(Optional.of(tokenEntity));
            when(jwtService.generateToken(user)).thenReturn("newAccessToken");
            when(jwtService.generateRefreshToken(user)).thenReturn("newRefreshToken");
            when(tokenRepository.save(any())).thenReturn(tokenEntity);

            // Act
            AuthResponseDTO response = authService.refreshUserToken(refreshRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("newAccessToken");
            assertThat(response.getRefreshToken()).isEqualTo("newRefreshToken");
            verify(tokenRepository).save(any());
        }

        @Test
        @DisplayName("Should throw exception for invalid refresh token")
        void refreshUserToken_InvalidToken_ThrowsException() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO refreshRequest =
                new com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO();
            refreshRequest.setRefreshToken("invalidToken");

            when(tokenRepository.findByToken("invalidToken")).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.refreshUserToken(refreshRequest));
            assertThat(exception.getMessage()).isEqualTo("Invalid refresh token");
        }

        @Test
        @DisplayName("Should throw exception for expired refresh token")
        void refreshUserToken_ExpiredToken_ThrowsException() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO refreshRequest =
                new com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO();
            refreshRequest.setRefreshToken("expiredToken");

            com.swp391.warrantymanagement.entity.Token tokenEntity = new com.swp391.warrantymanagement.entity.Token();
            tokenEntity.setToken("expiredToken");
            tokenEntity.setUser(user);
            tokenEntity.setExpirationDate(LocalDateTime.now().minusDays(1)); // Expired

            when(tokenRepository.findByToken("expiredToken")).thenReturn(Optional.of(tokenEntity));
            doNothing().when(tokenRepository).delete(tokenEntity);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.refreshUserToken(refreshRequest));
            assertThat(exception.getMessage()).isEqualTo("Refresh token expired");
            verify(tokenRepository).delete(tokenEntity);
        }
    }

    @Nested
    @DisplayName("Register New User")
    class RegisterNewUser {

        @Test
        @DisplayName("Should register new customer user successfully")
        void registerNewUser_Success() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.UserRegistrationDTO registrationDTO =
                new com.swp391.warrantymanagement.dto.request.auth.UserRegistrationDTO();
            registrationDTO.setUsername("newuser");
            registrationDTO.setEmail("newuser@example.com");
            registrationDTO.setPassword("password123");
            registrationDTO.setAddress("123 Street");

            when(userRepository.existsByUsername("newuser")).thenReturn(false);
            when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
            when(roleRepository.findByRoleName("CUSTOMER")).thenReturn(Optional.of(role));
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(jwtService.generateToken(any())).thenReturn("accessToken");
            when(jwtService.generateRefreshToken(any())).thenReturn("refreshToken");

            // Act
            AuthResponseDTO response = authService.registerNewUser(registrationDTO);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("accessToken");
            assertThat(response.getMessage()).contains("Customer account created successfully");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception if username exists")
        void registerNewUser_UsernameExists_ThrowsException() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.UserRegistrationDTO registrationDTO =
                new com.swp391.warrantymanagement.dto.request.auth.UserRegistrationDTO();
            registrationDTO.setUsername("existinguser");

            when(userRepository.existsByUsername("existinguser")).thenReturn(true);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.registerNewUser(registrationDTO));
            assertThat(exception.getMessage()).isEqualTo("Username already exists");
        }
    }

    @Nested
    @DisplayName("Create User By Admin")
    class CreateUserByAdmin {

        @Test
        @DisplayName("Should create user by admin successfully")
        void createUserByAdmin_Success() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.AdminUserCreationDTO adminDTO =
                new com.swp391.warrantymanagement.dto.request.AdminUserCreationDTO();
            adminDTO.setUsername("adminuser");
            adminDTO.setEmail("admin@example.com");
            adminDTO.setPassword("password123");
            adminDTO.setAddress("Admin Street");
            adminDTO.setRoleId(2L);

            Role adminRole = new Role();
            adminRole.setRoleId(2L);
            adminRole.setRoleName("ADMIN");

            when(userRepository.existsByUsername("adminuser")).thenReturn(false);
            when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
            when(roleRepository.findById(2L)).thenReturn(Optional.of(adminRole));
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenReturn(user);

            // Act
            AuthResponseDTO response = authService.createUserByAdmin(adminDTO);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isNull(); // No token for admin-created users
            assertThat(response.getMessage()).contains("User created successfully by Admin");
            verify(userRepository).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Logout User")
    class LogoutUser {

        @Test
        @DisplayName("Should logout user and delete tokens successfully")
        void logoutUser_Success() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.LogoutRequestDTO logoutRequest =
                new com.swp391.warrantymanagement.dto.request.auth.LogoutRequestDTO();
            logoutRequest.setAccessToken("validAccessToken");

            when(jwtService.extractUsername("validAccessToken")).thenReturn("testuser");
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
            doNothing().when(tokenRepository).deleteByUser(user);

            // Act
            authService.logoutUser(logoutRequest);

            // Assert
            verify(jwtService).extractUsername("validAccessToken");
            verify(tokenRepository).deleteByUser(user);
        }

        @Test
        @DisplayName("Should throw exception when user not found during logout")
        void logoutUser_UserNotFound_ThrowsException() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.LogoutRequestDTO logoutRequest =
                new com.swp391.warrantymanagement.dto.request.auth.LogoutRequestDTO();
            logoutRequest.setAccessToken("invalidToken");

            when(jwtService.extractUsername("invalidToken")).thenReturn("unknownuser");
            when(userRepository.findByUsername("unknownuser")).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.logoutUser(logoutRequest));
            assertThat(exception.getMessage()).contains("Logout failed");
        }
    }

    @Nested
    @DisplayName("Forgot Password")
    class ForgotPassword {

        @Test
        @DisplayName("Should generate reset token for valid email")
        void processForgotPassword_Success() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.ForgotPasswordRequestDTO forgotRequest =
                new com.swp391.warrantymanagement.dto.request.auth.ForgotPasswordRequestDTO();
            forgotRequest.setEmail("test@example.com");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
            doNothing().when(tokenRepository).deleteByUserAndTokenType(user, "RESET");
            when(tokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            // Act
            authService.processForgotPassword(forgotRequest);

            // Assert
            verify(userRepository).findByEmail("test@example.com");
            verify(tokenRepository).deleteByUserAndTokenType(user, "RESET");
            verify(tokenRepository).save(any());
        }

        @Test
        @DisplayName("Should throw exception for non-existent email")
        void processForgotPassword_EmailNotFound_ThrowsException() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.ForgotPasswordRequestDTO forgotRequest =
                new com.swp391.warrantymanagement.dto.request.auth.ForgotPasswordRequestDTO();
            forgotRequest.setEmail("notfound@example.com");

            when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.processForgotPassword(forgotRequest));
            assertThat(exception.getMessage()).isEqualTo("Email not found");
        }
    }

    @Nested
    @DisplayName("Reset Password")
    class ResetPassword {

        @Test
        @DisplayName("Should reset password successfully with valid token")
        void processResetPassword_Success() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO resetRequest =
                new com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO();
            resetRequest.setResetToken("validResetToken");
            resetRequest.setNewPassword("newPassword123");
            resetRequest.setConfirmPassword("newPassword123");

            com.swp391.warrantymanagement.entity.Token tokenEntity = new com.swp391.warrantymanagement.entity.Token();
            tokenEntity.setToken("validResetToken");
            tokenEntity.setUser(user);
            tokenEntity.setTokenType("RESET");
            tokenEntity.setExpirationDate(LocalDateTime.now().plusMinutes(10));

            when(tokenRepository.findByTokenAndTokenType("validResetToken", "RESET")).thenReturn(Optional.of(tokenEntity));
            when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword");
            when(userRepository.save(any(User.class))).thenReturn(user);
            doNothing().when(tokenRepository).delete(tokenEntity);

            // Act
            authService.processResetPassword(resetRequest);

            // Assert
            verify(passwordEncoder).encode("newPassword123");
            verify(userRepository).save(user);
            verify(tokenRepository).delete(tokenEntity);
        }

        @Test
        @DisplayName("Should throw exception when passwords don't match")
        void processResetPassword_PasswordMismatch_ThrowsException() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO resetRequest =
                new com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO();
            resetRequest.setNewPassword("password1");
            resetRequest.setConfirmPassword("password2");

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.processResetPassword(resetRequest));
            assertThat(exception.getMessage()).isEqualTo("Passwords do not match");
        }

        @Test
        @DisplayName("Should throw exception for expired reset token")
        void processResetPassword_ExpiredToken_ThrowsException() {
            // Arrange
            com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO resetRequest =
                new com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO();
            resetRequest.setResetToken("expiredToken");
            resetRequest.setNewPassword("newPassword123");
            resetRequest.setConfirmPassword("newPassword123");

            com.swp391.warrantymanagement.entity.Token tokenEntity = new com.swp391.warrantymanagement.entity.Token();
            tokenEntity.setToken("expiredToken");
            tokenEntity.setUser(user);
            tokenEntity.setTokenType("RESET");
            tokenEntity.setExpirationDate(LocalDateTime.now().minusMinutes(10)); // Expired

            when(tokenRepository.findByTokenAndTokenType("expiredToken", "RESET")).thenReturn(Optional.of(tokenEntity));
            doNothing().when(tokenRepository).delete(tokenEntity);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.processResetPassword(resetRequest));
            assertThat(exception.getMessage()).isEqualTo("Reset token has expired");
            verify(tokenRepository).delete(tokenEntity);
        }
    }

    @Nested
    @DisplayName("Validate Token")
    class ValidateToken {

        @Test
        @DisplayName("Should validate token successfully")
        void validateToken_Success() {
            // Arrange
            String validToken = "validJwtToken";

            when(jwtService.extractUsername(validToken)).thenReturn("testuser");
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
            when(jwtService.isTokenValid(validToken)).thenReturn(true);

            // Act
            AuthResponseDTO response = authService.validateToken(validToken);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isNull(); // No new token
            assertThat(response.getUsername()).isEqualTo("testuser");
            assertThat(response.getMessage()).isEqualTo("Token is valid");
            verify(jwtService).isTokenValid(validToken);
        }

        @Test
        @DisplayName("Should throw exception for invalid token")
        void validateToken_InvalidToken_ThrowsException() {
            // Arrange
            String invalidToken = "invalidToken";

            when(jwtService.extractUsername(invalidToken)).thenReturn("testuser");
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
            when(jwtService.isTokenValid(invalidToken)).thenReturn(false);

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.validateToken(invalidToken));
            assertThat(exception.getMessage()).contains("Token validation failed");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void validateToken_UserNotFound_ThrowsException() {
            // Arrange
            String token = "tokenForNonExistentUser";

            when(jwtService.extractUsername(token)).thenReturn("unknownuser");
            when(userRepository.findByUsername("unknownuser")).thenReturn(Optional.empty());

            // Act & Assert
            Exception exception = assertThrows(RuntimeException.class, () -> authService.validateToken(token));
            assertThat(exception.getMessage()).contains("Token validation failed");
        }
    }
}
