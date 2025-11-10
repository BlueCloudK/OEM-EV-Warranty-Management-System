package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.auth.*;
import com.swp391.warrantymanagement.dto.request.AdminUserCreationDTO;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.Token;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.exception.InvalidCredentialsException;
import com.swp391.warrantymanagement.mapper.CustomerMapper;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.TokenRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.AuthService;
import com.swp391.warrantymanagement.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Implementation của AuthService
 * Xử lý authentication, authorization, và token management
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final TokenRepository tokenRepository;
    private final CustomerRepository customerRepository;

    /**
     * Xác thực user và tạo JWT tokens
     *
     * @param loginRequest chứa username và password
     * @return AuthResponseDTO với access token, refresh token, và thông tin user
     * @throws InvalidCredentialsException nếu user không tồn tại hoặc password không đúng (HTTP 401)
     */
    @Override
    @Transactional
    public AuthResponseDTO authenticateUser(LoginRequestDTO loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        saveRefreshToken(user, refreshToken);

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
     * Làm mới access token bằng refresh token (Token Rotation strategy)
     *
     * @param refreshRequest chứa refresh token
     * @return AuthResponseDTO với access token và refresh token mới
     * @throws RuntimeException nếu refresh token không hợp lệ hoặc hết hạn
     */
    @Override
    public AuthResponseDTO refreshUserToken(RefreshTokenRequestDTO refreshRequest) {
        Token tokenEntity = tokenRepository.findByToken(refreshRequest.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (tokenEntity.getExpirationDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(tokenEntity);
            throw new RuntimeException("Refresh token expired");
        }

        User user = tokenEntity.getUser();
        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        // Token Rotation: update token mới và reset expiration date
        tokenEntity.setToken(newRefreshToken);
        tokenEntity.setExpirationDate(LocalDateTime.now().plusDays(7));
        tokenRepository.save(tokenEntity);

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
     * Đăng ký user mới với role CUSTOMER (dành cho SC_STAFF)
     *
     * @param registrationRequest chứa username, email, password, address
     * @return AuthResponseDTO với tokens để auto-login
     * @throws RuntimeException nếu username hoặc email đã tồn tại
     */
    @Override
    @Transactional
    public AuthResponseDTO registerNewUser(UserRegistrationDTO registrationRequest) {
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Customer role not found"));

        User newUser = new User();
        newUser.setUsername(registrationRequest.getUsername());
        newUser.setEmail(registrationRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        newUser.setAddress(registrationRequest.getAddress());
        newUser.setRole(customerRole);

        User savedUser = userRepository.save(newUser);

        String accessToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        saveRefreshToken(savedUser, refreshToken);

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
     * Tạo user với bất kỳ role nào (dành cho ADMIN)
     *
     * @param adminCreationRequest chứa username, email, password, address, roleId
     * @return AuthResponseDTO không có tokens (user phải login riêng)
     * @throws RuntimeException nếu username, email đã tồn tại hoặc role không tìm thấy
     */
    @Override
    @Transactional
    public AuthResponseDTO createUserByAdmin(AdminUserCreationDTO adminCreationRequest) {
        if (userRepository.existsByUsername(adminCreationRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(adminCreationRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findById(adminCreationRequest.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User newUser = new User();
        newUser.setUsername(adminCreationRequest.getUsername());
        newUser.setEmail(adminCreationRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(adminCreationRequest.getPassword()));
        newUser.setAddress(adminCreationRequest.getAddress());
        newUser.setRole(role);

        User savedUser = userRepository.save(newUser);

        return new AuthResponseDTO(
                null,
                null,
                "User created successfully by Admin",
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getRole().getRoleName()
        );
    }

    /**
     * Đăng ký Customer hoàn chỉnh với User và Customer profile
     *
     * @param registrationRequest chứa username, email, password, address, name, phone
     * @return CustomerResponseDTO với đầy đủ thông tin
     * @throws RuntimeException nếu username, email, hoặc phone đã tồn tại
     */
    @Override
    @Transactional
    public CustomerResponseDTO registerCustomerByStaff(CustomerRegistrationByStaffDTO registrationRequest) {
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new RuntimeException("Username already exists: " + registrationRequest.getUsername());
        }
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email already exists: " + registrationRequest.getEmail());
        }
        if (customerRepository.findByPhone(registrationRequest.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already exists: " + registrationRequest.getPhone());
        }

        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Customer role not found"));

        User newUser = new User();
        newUser.setUsername(registrationRequest.getUsername());
        newUser.setEmail(registrationRequest.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        newUser.setAddress(registrationRequest.getAddress());
        newUser.setRole(customerRole);

        User savedUser = userRepository.save(newUser);

        Customer newCustomer = new Customer();
        newCustomer.setCustomerId(UUID.randomUUID());
        newCustomer.setName(registrationRequest.getName());
        newCustomer.setPhone(registrationRequest.getPhone());
        newCustomer.setUser(savedUser);

        Customer savedCustomer = customerRepository.save(newCustomer);

        return CustomerMapper.toResponseDTO(savedCustomer);
    }

    /**
     * Logout user bằng cách xóa tất cả refresh tokens
     *
     * @param logoutRequest chứa access token
     * @throws RuntimeException nếu token không hợp lệ hoặc user không tồn tại
     */
    @Override
    @Transactional
    public void logoutUser(LogoutRequestDTO logoutRequest) {
        String token = logoutRequest.getAccessToken();

        try {
            String username = jwtService.extractUsername(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            tokenRepository.deleteByUser(user);
        } catch (Exception e) {
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Tạo reset token cho forgot password (thời hạn 15 phút)
     *
     * @param forgotRequest chứa email
     * @throws RuntimeException nếu email không tồn tại
     */
    @Override
    @Transactional
    public void processForgotPassword(ForgotPasswordRequestDTO forgotRequest) {
        User user = userRepository.findByEmail(forgotRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String resetToken = java.util.UUID.randomUUID().toString();

        tokenRepository.deleteByUserAndTokenType(user, "RESET");

        Token tokenEntity = new Token();
        tokenEntity.setToken(resetToken);
        tokenEntity.setUser(user);
        tokenEntity.setTokenType("RESET");
        tokenEntity.setExpirationDate(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(tokenEntity);

        // TODO: Implement email service
        System.out.println("Reset token generated for " + user.getEmail() + ": " + resetToken);
        System.out.println("Reset token expires at: " + tokenEntity.getExpirationDate());
    }

    /**
     * Reset password bằng reset token (one-time use)
     *
     * @param resetRequest chứa resetToken, newPassword, confirmPassword
     * @throws RuntimeException nếu passwords không match, token không hợp lệ hoặc hết hạn
     */
    @Override
    @Transactional
    public void processResetPassword(ResetPasswordRequestDTO resetRequest) {
        if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        Token tokenEntity = tokenRepository.findByTokenAndTokenType(resetRequest.getResetToken(), "RESET")
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (tokenEntity.getExpirationDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(tokenEntity);
            throw new RuntimeException("Reset token has expired");
        }

        User user = tokenEntity.getUser();
        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(tokenEntity);

        System.out.println("Password reset successfully for user: " + user.getUsername());
    }

    /**
     * Validate JWT token và trả về thông tin user
     *
     * @param token JWT access token
     * @return AuthResponseDTO với thông tin user (không có token mới)
     * @throws RuntimeException nếu token không hợp lệ hoặc user không tồn tại
     */
    @Override
    @Transactional
    public AuthResponseDTO validateToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!jwtService.isTokenValid(token)) {
                throw new RuntimeException("Invalid token");
            }

            return new AuthResponseDTO(
                    null,
                    null,
                    "Token is valid",
                    user.getUserId(),
                    user.getUsername(),
                    user.getRole().getRoleName()
            );
        } catch (Exception e) {
            throw new RuntimeException("Token validation failed: " + e.getMessage());
        }
    }

    /**
     * Lưu refresh token vào database (thời hạn 7 ngày)
     *
     * @param user User entity
     * @param refreshToken JWT refresh token string
     */
    @Transactional
    public void saveRefreshToken(User user, String refreshToken) {
        tokenRepository.deleteByUserAndTokenType(user, "REFRESH");

        Token tokenEntity = new Token();
        tokenEntity.setToken(refreshToken);
        tokenEntity.setUser(user);
        tokenEntity.setTokenType("REFRESH");
        tokenEntity.setExpirationDate(LocalDateTime.now().plusDays(7));

        tokenRepository.save(tokenEntity);
    }
}
