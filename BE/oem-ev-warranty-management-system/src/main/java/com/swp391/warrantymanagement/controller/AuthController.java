package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
@CrossOrigin
public class AuthController {
    @Autowired
    private AuthService authService;

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestParam String username, @RequestParam String password) {
        try {
            String token = authService.login(username, password);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("message", "Login successful");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // Xác thực token
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam String token) {
        try {
            User user = authService.validateToken(token);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            response.put("message", "Token is valid");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // Yêu cầu reset mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestParam String email) {
        try {
            String resetToken = authService.requestPasswordReset(email);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reset token sent to email");
            response.put("resetToken", resetToken); // For testing purposes
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Reset mật khẩu với token
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        try {
            authService.resetPassword(token, newPassword);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Đăng xuất (vô hiệu hóa token)
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestParam String token) {
        try {
            // Implement logout logic in AuthService if needed
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Đăng ký người dùng mới (nếu cần)
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody User user) {
        try {
            // Implement register logic in AuthService if needed
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}