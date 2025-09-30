package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.AuthService;
import com.swp391.warrantymanagement.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
}
