package com.swp391.warrantymanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.warrantymanagement.config.JwtAuthenticationFilter;
import com.swp391.warrantymanagement.dto.request.auth.*;
import com.swp391.warrantymanagement.dto.request.AdminUserCreationDTO;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.service.AuthService;
import com.swp391.warrantymanagement.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AuthController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@Import(AuthControllerTest.ControllerTestConfig.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @TestConfiguration
    @EnableMethodSecurity
    static class ControllerTestConfig {
        @Bean
        public AuthService authService() {
            return Mockito.mock(AuthService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    private LoginRequestDTO loginRequestDTO;
    private AuthResponseDTO authResponseDTO;

    @BeforeEach
    void setUp() {
        // Reset mock before each test
        Mockito.reset(authService);

        loginRequestDTO = new LoginRequestDTO();
        loginRequestDTO.setUsername("user");
        loginRequestDTO.setPassword("password");

        authResponseDTO = new AuthResponseDTO("access-token", "refresh-token", "Login successful", 1L, "user", "CUSTOMER");
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("Should return 200 OK with tokens for successful login")
        void login_Success() throws Exception {
            // Arrange
            when(authService.authenticateUser(any(LoginRequestDTO.class))).thenReturn(authResponseDTO);

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("access-token"))
                    .andExpect(jsonPath("$.username").value("user"));
        }

        @Test
        @DisplayName("Should return 401 Unauthorized for failed login")
        void login_Failure() throws Exception {
            // Arrange
            when(authService.authenticateUser(any(LoginRequestDTO.class))).thenThrow(new RuntimeException("Invalid credentials"));

            // Act & Assert
            mockMvc.perform(post("/api/auth/login")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequestDTO)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/staff/register-customer")
    class RegisterCustomer {

        @Test
        @WithMockUser(roles = "SC_STAFF")
        @DisplayName("Should return 201 Created for successful registration by staff")
        void register_Success() throws Exception {
            // Arrange
            CustomerRegistrationByStaffDTO registrationDTO = new CustomerRegistrationByStaffDTO();
            registrationDTO.setUsername("newstaffcust");
            registrationDTO.setEmail("newstaffcust@example.com");
            registrationDTO.setPassword("password123");
            registrationDTO.setName("New Staff Customer");
            registrationDTO.setPhone("0987654321");
            registrationDTO.setAddress("123 Staff St");

            CustomerResponseDTO customerResponse = new CustomerResponseDTO();
            customerResponse.setCustomerId(UUID.randomUUID());
            customerResponse.setName("New Staff Customer");

            when(authService.registerCustomerByStaff(any(CustomerRegistrationByStaffDTO.class))).thenReturn(customerResponse);

            // Act & Assert
            mockMvc.perform(post("/api/auth/staff/register-customer")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registrationDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for unauthorized role")
        void register_Forbidden() throws Exception {
            // Arrange
            CustomerRegistrationByStaffDTO registrationDTO = new CustomerRegistrationByStaffDTO();
            registrationDTO.setUsername("newcust");
            registrationDTO.setEmail("newcust@example.com");
            registrationDTO.setPassword("password123");
            registrationDTO.setName("New Customer");
            registrationDTO.setPhone("0987654321");
            registrationDTO.setAddress("123 Test St");

            // Act & Assert
            mockMvc.perform(post("/api/auth/staff/register-customer")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registrationDTO)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshToken {

        @Test
        @DisplayName("Should return 200 OK with new tokens for valid refresh token")
        void refresh_Success() throws Exception {
            // Arrange
            RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO();
            refreshRequest.setRefreshToken("valid-refresh-token");

            AuthResponseDTO authResponse = new AuthResponseDTO("new-access-token", "new-refresh-token", "Token refreshed", 1L, "user", "CUSTOMER");
            when(authService.refreshUserToken(any(RefreshTokenRequestDTO.class))).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/auth/refresh")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("new-access-token"));
        }

        @Test
        @DisplayName("Should return 401 Unauthorized for invalid refresh token")
        void refresh_InvalidToken() throws Exception {
            // Arrange
            RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO();
            refreshRequest.setRefreshToken("invalid-token");

            when(authService.refreshUserToken(any(RefreshTokenRequestDTO.class))).thenThrow(new RuntimeException("Invalid refresh token"));

            // Act & Assert
            mockMvc.perform(post("/api/auth/refresh")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(refreshRequest)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    class Register {

        @Test
        @DisplayName("Should return 201 Created for successful registration")
        void register_Success() throws Exception {
            // Arrange
            UserRegistrationDTO registrationDTO = new UserRegistrationDTO();
            registrationDTO.setUsername("newuser");
            registrationDTO.setEmail("newuser@example.com");
            registrationDTO.setPassword("password123");
            registrationDTO.setAddress("123 Main Street, District 1");

            AuthResponseDTO authResponse = new AuthResponseDTO(null, null, "Registration successful", 1L, "newuser", "CUSTOMER");
            when(authService.registerNewUser(any(UserRegistrationDTO.class))).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registrationDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Customer account created successfully"));
        }

        @Test
        @DisplayName("Should return 400 Bad Request for duplicate username")
        void register_DuplicateUsername() throws Exception {
            // Arrange
            UserRegistrationDTO registrationDTO = new UserRegistrationDTO();
            registrationDTO.setUsername("existinguser");
            registrationDTO.setEmail("user@example.com");
            registrationDTO.setPassword("password123");
            registrationDTO.setAddress("456 Second Street, District 2");

            when(authService.registerNewUser(any(UserRegistrationDTO.class))).thenThrow(new RuntimeException("Username already exists"));

            // Act & Assert
            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registrationDTO)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("POST /api/auth/admin/create-user")
    class CreateUserByAdmin {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("Should return 201 Created for successful user creation by admin")
        void createUser_Success() throws Exception {
            // Arrange
            AdminUserCreationDTO adminRequest = new AdminUserCreationDTO();
            adminRequest.setUsername("newstaff");
            adminRequest.setEmail("staff@example.com");
            adminRequest.setPassword("password123");
            adminRequest.setAddress("123 Staff St");
            adminRequest.setRoleId(2L); // Use roleId instead of roleName

            AuthResponseDTO authResponse = new AuthResponseDTO(null, null, "User created", 1L, "newstaff", "SC_STAFF");
            when(authService.createUserByAdmin(any(AdminUserCreationDTO.class))).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/auth/admin/create-user")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(adminRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("User created successfully by Admin"));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("Should return 403 Forbidden for non-admin user")
        void createUser_Forbidden() throws Exception {
            // Arrange
            AdminUserCreationDTO adminRequest = new AdminUserCreationDTO();
            adminRequest.setUsername("newstaff");
            adminRequest.setEmail("staff@example.com");
            adminRequest.setPassword("password123");
            adminRequest.setAddress("123 Staff Street");
            adminRequest.setRoleId(2L);

            // Act & Assert
            mockMvc.perform(post("/api/auth/admin/create-user")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(adminRequest)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/logout")
    class Logout {

        @Test
        @DisplayName("Should return 200 OK for successful logout")
        void logout_Success() throws Exception {
            // Arrange
            LogoutRequestDTO logoutRequest = new LogoutRequestDTO();
            logoutRequest.setAccessToken("valid-token"); // Use setAccessToken instead of setToken
            logoutRequest.setUserId(1L);

            doNothing().when(authService).logoutUser(any(LogoutRequestDTO.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/logout")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Logged out successfully"));
        }

        @Test
        @DisplayName("Should return 400 Bad Request for logout failure")
        void logout_Failure() throws Exception {
            // Arrange
            LogoutRequestDTO logoutRequest = new LogoutRequestDTO();
            logoutRequest.setAccessToken("invalid-token");
            logoutRequest.setUserId(1L);

            doThrow(new RuntimeException("Invalid token")).when(authService).logoutUser(any(LogoutRequestDTO.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/logout")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(logoutRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("POST /api/auth/forgot-password")
    class ForgotPassword {

        @Test
        @DisplayName("Should return 200 OK for successful forgot password request")
        void forgotPassword_Success() throws Exception {
            // Arrange
            ForgotPasswordRequestDTO forgotRequest = new ForgotPasswordRequestDTO();
            forgotRequest.setEmail("user@example.com");

            doNothing().when(authService).processForgotPassword(any(ForgotPasswordRequestDTO.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/forgot-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(forgotRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Password reset email sent"));
        }

        @Test
        @DisplayName("Should return 400 Bad Request for invalid email")
        void forgotPassword_InvalidEmail() throws Exception {
            // Arrange
            ForgotPasswordRequestDTO forgotRequest = new ForgotPasswordRequestDTO();
            forgotRequest.setEmail("nonexistent@example.com");

            doThrow(new RuntimeException("Email not found")).when(authService).processForgotPassword(any(ForgotPasswordRequestDTO.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/forgot-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(forgotRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("POST /api/auth/reset-password")
    class ResetPassword {

        @Test
        @DisplayName("Should return 200 OK for successful password reset")
        void resetPassword_Success() throws Exception {
            // Arrange
            ResetPasswordRequestDTO resetRequest = new ResetPasswordRequestDTO();
            resetRequest.setResetToken("valid-reset-token");
            resetRequest.setNewPassword("newPassword123");
            resetRequest.setConfirmPassword("newPassword123");

            doNothing().when(authService).processResetPassword(any(ResetPasswordRequestDTO.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/reset-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(resetRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Password reset successfully"));
        }

        @Test
        @DisplayName("Should return 400 Bad Request for invalid reset token")
        void resetPassword_InvalidToken() throws Exception {
            // Arrange
            ResetPasswordRequestDTO resetRequest = new ResetPasswordRequestDTO();
            resetRequest.setResetToken("invalid-token");
            resetRequest.setNewPassword("newPassword123");
            resetRequest.setConfirmPassword("newPassword123");

            doThrow(new RuntimeException("Invalid or expired reset token")).when(authService).processResetPassword(any(ResetPasswordRequestDTO.class));

            // Act & Assert
            mockMvc.perform(post("/api/auth/reset-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(resetRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("GET /api/auth/validate")
    class ValidateToken {

        @Test
        @DisplayName("Should return 200 OK for valid token")
        void validateToken_Success() throws Exception {
            // Arrange
            String validToken = "Bearer valid-jwt-token";
            AuthResponseDTO authResponse = new AuthResponseDTO(null, null, "Token is valid", 1L, "user", "CUSTOMER");
            when(authService.validateToken(anyString())).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(get("/api/auth/validate")
                            .header("Authorization", validToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Token is valid"));
        }

        @Test
        @DisplayName("Should return 401 Unauthorized for invalid token")
        void validateToken_Invalid() throws Exception {
            // Arrange
            String invalidToken = "Bearer invalid-token";
            when(authService.validateToken(anyString())).thenThrow(new RuntimeException("Invalid token"));

            // Act & Assert
            mockMvc.perform(get("/api/auth/validate")
                            .header("Authorization", invalidToken))
                    .andExpect(status().isUnauthorized());
        }
    }
}
