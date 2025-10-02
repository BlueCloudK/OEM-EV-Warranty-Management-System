package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.Token;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.TokenRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.AuthService;
import com.swp391.warrantymanagement.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    /**
     * 1. Login
     * - Client gọi POST /auth/login?username=...&password=...
     * - Trả về chuỗi JWT.
     * 2. Validate
     * - Client gọi GET /auth/validate?token=...
     * - Trả về thông tin user nếu token hợp lệ.
     */

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenRepository tokenRepository;

    // Login -> return JWT
    public String login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtService.generateToken(user.getUsername());
    }

    // Validate token -> return user
    public User validateToken(String token) {
        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid token");
        }

        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }

    // Yêu cầu reset mật khẩu - tạo token reset
    public String requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User with email not found");
        }

        // Xóa token reset cũ nếu có
        tokenRepository.deleteByUserIdAndTokenType(user.getUserId(), "PASSWORD_RESET");

        // Tạo token reset mới
        String resetToken = UUID.randomUUID().toString();
        Token token = new Token();
        token.setId(UUID.randomUUID().toString());
        token.setToken(resetToken);
        token.setUserId(user.getUserId());
        token.setTokenType("PASSWORD_RESET");
        token.setExpired(false);
        token.setRevoked(false);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusHours(1)); // Token hết hạn sau 1 tiếng

        tokenRepository.save(token);

        // TODO: Gửi email với link reset chứa token này
        // Tạm thời trả về token để test
        return resetToken;
    }

    // Reset mật khẩu với token
    @Transactional
    public void resetPassword(String resetToken, String newPassword) {
        Token token = tokenRepository.findByToken(resetToken);

        if (token == null) {
            throw new RuntimeException("Invalid reset token");
        }

        if (token.isExpired() || token.isRevoked()) {
            throw new RuntimeException("Reset token has been expired or revoked");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        if (!"PASSWORD_RESET".equals(token.getTokenType())) {
            throw new RuntimeException("Invalid token type");
        }

        // Tìm user và cập nhật mật khẩu
        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setRevoked(true);
        token.setExpired(true);
        tokenRepository.save(token);
    }

    // Đăng ký người dùng mới
    @Override
    public User registerUser(User user) {
        // Kiểm tra username đã tồn tại chưa
        if (userRepository.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }

        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        // Mã hóa mật khẩu
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Thiết lập thời gian tạo
        user.setCreatedAt(new java.util.Date());

        // Lưu user vào database
        return userRepository.save(user);
    }
}
