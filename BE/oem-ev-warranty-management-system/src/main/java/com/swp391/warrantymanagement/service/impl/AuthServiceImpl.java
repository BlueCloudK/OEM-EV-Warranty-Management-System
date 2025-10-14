package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.auth.*;
import com.swp391.warrantymanagement.dto.request.user.AdminUserCreationDTO;
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
    @Transactional
    public AuthResponseDTO authenticateUser(LoginRequestDTO loginRequest) {
        // Validate user credentials - tìm user theo username thông thường
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kiểm tra password với bcrypt
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate tokens - sử dụng User object
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Save refresh token vào database
        saveRefreshToken(user, refreshToken);

        // Return AuthResponseDTO - mapping từ Entity sang DTO, lazy loading sẽ tự động fetch role khi cần
        return new AuthResponseDTO(
                accessToken,
                refreshToken,
                "Login successful",
                user.getUserId(),
                user.getUsername(),
                user.getRole().getRoleName() // Hibernate sẽ tự động fetch role khi truy cập trong transaction
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
     * Đăng ký user mới - chỉ dành cho SC Staff tạo tài khoản Customer
     * Input: UserRegistrationDTO từ client
     * Output: AuthResponseDTO với token để auto-login
     */
    @Override
    @Transactional
    public AuthResponseDTO registerNewUser(UserRegistrationDTO registrationRequest) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // SC Staff chỉ có thể tạo tài khoản Customer - tìm role Customer
        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Customer role not found"));

        // Create new user entity từ DTO với role Customer
        User newUser = new User();
        newUser.setUsername(registrationRequest.getUsername());
        newUser.setEmail(registrationRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        newUser.setAddress(registrationRequest.getAddress());
        newUser.setRole(customerRole);

        User savedUser = userRepository.save(newUser);

        // Generate tokens for immediate login
        String accessToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        saveRefreshToken(savedUser, refreshToken);

        // Return response để client tự động đăng nhập
        return new AuthResponseDTO(
                accessToken,
                refreshToken,
                "Customer account created successfully",
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getRole().getRoleName()
        );
    }

    /**
     * Tạo user mới bởi Admin - có thể tạo với bất kỳ role nào
     * Input: AdminUserCreationDTO từ Admin
     * Output: AuthResponseDTO với thông tin user được tạo (không có token)
     */
    @Override
    @Transactional
    public AuthResponseDTO createUserByAdmin(AdminUserCreationDTO adminCreationRequest) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(adminCreationRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(adminCreationRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Load role từ database theo roleId
        Role role = roleRepository.findById(adminCreationRequest.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Create new user entity từ DTO
        User newUser = new User();
        newUser.setUsername(adminCreationRequest.getUsername());
        newUser.setEmail(adminCreationRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(adminCreationRequest.getPassword()));
        newUser.setAddress(adminCreationRequest.getAddress());
        newUser.setRole(role);

        User savedUser = userRepository.save(newUser);

        // Return response không có token (user cần login riêng)
        return new AuthResponseDTO(
                null, // no access token
                null, // no refresh token
                "User created successfully by Admin",
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
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Xóa tất cả token của user để logout trên tất cả device
            tokenRepository.deleteByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Xử lý forgot password - tạo reset token và lưu vào database
     * Input: ForgotPasswordRequestDTO
     * Output: void
     */
    @Override
    @Transactional
    public void processForgotPassword(ForgotPasswordRequestDTO forgotRequest) {
        // Find user by email
        User user = userRepository.findByEmail(forgotRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found"));

        // Generate reset token (UUID)
        String resetToken = java.util.UUID.randomUUID().toString();

        // Xóa chỉ reset token cũ của user này, không xóa refresh token
        tokenRepository.deleteByUserAndTokenType(user, "RESET");

        // Lưu reset token vào database với expiration 15 phút
        Token tokenEntity = new Token();
        tokenEntity.setToken(resetToken);
        tokenEntity.setUser(user);
        tokenEntity.setTokenType("RESET");
        tokenEntity.setExpirationDate(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(tokenEntity);

        // Log reset token để test (trong production sẽ gửi email)
        System.out.println("Reset token generated for " + user.getEmail() + ": " + resetToken);
        System.out.println("Reset token expires at: " + tokenEntity.getExpirationDate());
    }

    /**
     * Xử lý reset password với token
     * Input: ResetPasswordRequestDTO
     * Output: void
     */
    @Override
    @Transactional
    public void processResetPassword(ResetPasswordRequestDTO resetRequest) {
        // Validate passwords match
        if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Tìm reset token theo type để tránh xung đột với refresh token
        Token tokenEntity = tokenRepository.findByTokenAndTokenType(resetRequest.getResetToken(), "RESET")
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        // Check token expiration
        if (tokenEntity.getExpirationDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(tokenEntity);
            throw new RuntimeException("Reset token has expired");
        }

        User user = tokenEntity.getUser();

        // Update user password
        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);

        // Delete reset token after successful password reset
        tokenRepository.delete(tokenEntity);

        System.out.println("Password reset successfully for user: " + user.getUsername());
    }

    /**
     * Validate JWT token và trả về thông tin user
     * Input: token string
     * Output: AuthResponseDTO với thông tin user nếu token hợp lệ
     */
    @Override
    @Transactional
    public AuthResponseDTO validateToken(String token) {
        try {
            // Extract username from token
            String username = jwtService.extractUsername(token);

            // Find user by username - lazy loading sẽ tự động hoạt động trong transaction
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate token
            if (!jwtService.isTokenValid(token)) {
                throw new RuntimeException("Invalid token");
            }

            // Return user info without new tokens - role sẽ được lazy load khi cần
            return new AuthResponseDTO(
                    null, // không tạo token mới
                    null, // không tạo refresh token mới
                    "Token is valid",
                    user.getUserId(),
                    user.getUsername(),
                    user.getRole().getRoleName() // Lazy loading hoạt động trong transaction
            );
        } catch (Exception e) {
            throw new RuntimeException("Token validation failed: " + e.getMessage());
        }
    }

    // ============= HELPER METHODS =============

    /**
     * Lưu refresh token vào database
     * - Xóa refresh token cũ của user
     * - Tạo refresh token mới với expiration date
     */
    @Transactional
    public void saveRefreshToken(User user, String refreshToken) {
        // Remove existing refresh tokens for this user (chỉ xóa refresh token, không xóa reset token)
        tokenRepository.deleteByUserAndTokenType(user, "REFRESH");

        // Save new refresh token
        Token tokenEntity = new Token();
        tokenEntity.setToken(refreshToken);
        tokenEntity.setUser(user);
        tokenEntity.setTokenType("REFRESH");
        tokenEntity.setExpirationDate(LocalDateTime.now().plusDays(7));
        tokenRepository.save(tokenEntity);
    }
}
