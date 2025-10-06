package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.auth.*;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.Token;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.TokenRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.AuthService;
import com.swp391.warrantymanagement.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * Implementation của AuthService
 * - Xử lý đăng nhập, đăng ký, refresh token
 * - Sử dụng DTO pattern cho API communication
 * - Entity pattern cho business logic
 * - Mapping giữa DTO và Entity trong service layer
 */
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private TokenRepository tokenRepository;

    // ============= NEW METHODS - Sử dụng DTO pattern =============

    /**
     * Xác thực user và tạo token
     * Input: LoginRequestDTO từ controller
     * Output: AuthResponseDTO trả về cho client
     */
    @Override
    public AuthResponseDTO authenticateUser(LoginRequestDTO loginRequest) {
        // Validate user credentials - tìm user theo username
        User user = userRepository.findByUsername(loginRequest.getUsername());
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Kiểm tra password với bcrypt
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate tokens - sử dụng User object
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Save refresh token vào database
        saveRefreshToken(user, refreshToken);

        // Return AuthResponseDTO - mapping từ Entity sang DTO
        return new AuthResponseDTO(
                accessToken,
                refreshToken,
                "Login successful",
                user.getUserId(),
                user.getUsername(),
                user.getRole().getRoleName()
        );
    }

    /**
     * Refresh access token bằng refresh token
     * Input: RefreshTokenRequestDTO
     * Output: AuthResponseDTO với token mới
     */
    @Override
    public AuthResponseDTO refreshUserToken(RefreshTokenRequestDTO refreshRequest) {
        // Validate refresh token - tìm token trong database
        Token tokenEntity = tokenRepository.findByToken(refreshRequest.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        // Kiểm tra token có hết hạn không
        if (tokenEntity.getExpirationDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(tokenEntity);
            throw new RuntimeException("Refresh token expired");
        }

        User user = tokenEntity.getUser();

        // Generate new tokens
        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        // Update refresh token trong database
        tokenEntity.setToken(newRefreshToken);
        tokenEntity.setExpirationDate(LocalDateTime.now().plusDays(7));
        tokenRepository.save(tokenEntity);

        // Return response với token mới
        return new AuthResponseDTO(
                newAccessToken,
                newRefreshToken,
                "Token refreshed successfully",
                user.getUserId(),
                user.getUsername(),
                user.getRole().getRoleName()
        );
    }

    /**
     * Đăng ký user mới
     * Input: UserRegistrationDTO từ client
     * Output: AuthResponseDTO với token để auto-login
     */
    @Override
    @Transactional
    public AuthResponseDTO registerNewUser(UserRegistrationDTO registrationRequest) {
        // Check if username or email already exists - sử dụng method mới
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Load role từ database
        Role role = roleRepository.findById(registrationRequest.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Create new user entity từ DTO
        User newUser = new User();
        newUser.setUsername(registrationRequest.getUsername());
        newUser.setEmail(registrationRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        newUser.setAddress(registrationRequest.getAddress());
        newUser.setRole(role);

        User savedUser = userRepository.save(newUser);

        // Generate tokens for immediate login
        String accessToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        saveRefreshToken(savedUser, refreshToken);

        // Return response để client tự động đăng nhập
        return new AuthResponseDTO(
                accessToken,
                refreshToken,
                "User registered successfully",
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getRole().getRoleName()
        );
    }

    /**
     * Logout user - xóa tất cả refresh token
     * Input: LogoutRequestDTO
     * Output: void
     */
    @Override
    @Transactional
    public void logoutUser(LogoutRequestDTO logoutRequest) {
        // Extract userId from accessToken trong DTO
        String token = logoutRequest.getAccessToken(); // Sửa từ getToken() thành getAccessToken()

        try {
            String username = jwtService.extractUsername(token);
            User user = userRepository.findByUsername(username);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Xóa tất cả token của user để logout trên tất cả device
            tokenRepository.deleteByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Xử lý forgot password - gửi email reset
     * Input: ForgotPasswordRequestDTO
     * Output: void
     */
    @Override
    public void processForgotPassword(ForgotPasswordRequestDTO forgotRequest) {
        // Find user by email - sử dụng Optional để an toàn
        User user = userRepository.findByEmail(forgotRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found"));

        // TODO: Generate reset token and send email
        // For now, just log the action
        System.out.println("Password reset requested for: " + user.getEmail());

        // In real implementation:
        // 1. Generate reset token
        // 2. Save token with expiration
        // 3. Send email with reset link
    }

    /**
     * Xử lý reset password với token
     * Input: ResetPasswordRequestDTO
     * Output: void
     */
    @Override
    public void processResetPassword(ResetPasswordRequestDTO resetRequest) {
        // Validate passwords match
        if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // TODO: Validate reset token and update password
        // For now, just log the action
        System.out.println("Password reset processed for token: " + resetRequest.getResetToken());

        // In real implementation:
        // 1. Find user by reset token
        // 2. Check token expiration
        // 3. Update user password
        // 4. Delete reset token
    }

    /**
     * Validate JWT token và trả về thông tin user
     * Input: token string
     * Output: AuthResponseDTO với thông tin user nếu token hợp lệ
     */
    @Override
    public AuthResponseDTO validateToken(String token) {
        try {
            // Extract username from token
            String username = jwtService.extractUsername(token);

            // Find user by username
            User user = userRepository.findByUsername(username);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Validate token
            if (!jwtService.isTokenValid(token)) {
                throw new RuntimeException("Invalid token");
            }

            // Return user info without new tokens
            return new AuthResponseDTO(
                    null, // không tạo token mới
                    null, // không tạo refresh token mới
                    "Token is valid",
                    user.getUserId(),
                    user.getUsername(),
                    user.getRole().getRoleName()
            );
        } catch (Exception e) {
            throw new RuntimeException("Token validation failed: " + e.getMessage());
        }
    }

    // ============= HELPER METHODS =============

    /**
     * Lưu refresh token vào database
     * - Xóa token cũ của user
     * - Tạo token mới với expiration date
     */
    private void saveRefreshToken(User user, String refreshToken) {
        // Remove existing refresh tokens for this user
        tokenRepository.deleteByUser(user);

        // Save new refresh token
        Token tokenEntity = new Token();
        tokenEntity.setToken(refreshToken);
        tokenEntity.setUser(user);
        tokenEntity.setExpirationDate(LocalDateTime.now().plusDays(7));
        tokenRepository.save(tokenEntity);
    }
}
