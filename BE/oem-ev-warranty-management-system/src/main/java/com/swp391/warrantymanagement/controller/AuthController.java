package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.auth.LoginRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.UserRegistrationDTO;
import com.swp391.warrantymanagement.dto.request.auth.ForgotPasswordRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.LogoutRequestDTO;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
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

    // Đăng nhập - sử dụng service để xử lý logic
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            // Service xử lý authentication và trả về AuthResponseDTO
            AuthResponseDTO response = authService.authenticateUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Giữ nguyên format response khi lỗi
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, e.getMessage(), null, null, null));
        }
    }


    // Làm mới token - sử dụng service
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        try {
            // Service xử lý refresh token logic
            AuthResponseDTO response = authService.refreshUserToken(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, e.getMessage(), null, null, null));
        }
    }

    // Đăng ký - sử dụng service, giữ nguyên response format
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        try {
            // Service xử lý registration logic
            AuthResponseDTO authResponse = authService.registerNewUser(registrationDTO);

            // Giữ nguyên format response Map như cũ
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", Map.of(
                "userId", authResponse.getUserId(),
                "username", authResponse.getUsername(),
                "roleName", authResponse.getRoleName()
            ));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Đăng xuất - sử dụng service
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@Valid @RequestBody LogoutRequestDTO logoutRequest) {
        try {
            // Service xử lý logout logic
            authService.logoutUser(logoutRequest);

            // Giữ nguyên response format
            return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Quên mật khẩu - endpoint mới với DTO Auth
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        try {
            authService.processForgotPassword(request);
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset email sent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Đặt lại mật khẩu - endpoint mới
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        try {
            authService.processResetPassword(request);
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Validate token - endpoint mới thiếu
    @GetMapping("/validate")
    public ResponseEntity<AuthResponseDTO> validateToken(@RequestParam String token) {
        try {
            AuthResponseDTO response = authService.validateToken(token);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, e.getMessage(), null, null, null));
        }
    }
}