package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.auth.*;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.entity.User;
import org.springframework.stereotype.Service;

/**
 * Service interface for authentication-related business logic.
 * Handles user registration, login, token refresh, password reset, and logout.
 * All methods use DTOs for API communication, following N-Layer architecture.
 */
@Service
public interface AuthService {
    AuthResponseDTO authenticateUser(LoginRequestDTO loginRequest);
    AuthResponseDTO refreshUserToken(RefreshTokenRequestDTO refreshRequest);
    AuthResponseDTO registerNewUser(UserRegistrationDTO registrationRequest);
    void logoutUser(LogoutRequestDTO logoutRequest);
    void processForgotPassword(ForgotPasswordRequestDTO forgotRequest);
    void processResetPassword(ResetPasswordRequestDTO resetRequest);
    AuthResponseDTO validateToken(String token);
    void saveRefreshToken(User user, String refreshToken);
}
