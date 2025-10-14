package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.auth.LoginRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.UserRegistrationDTO;
import com.swp391.warrantymanagement.dto.request.auth.ForgotPasswordRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.LogoutRequestDTO;
import com.swp391.warrantymanagement.dto.request.user.AdminUserCreationDTO;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
@CrossOrigin
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private AuthService authService;

    // Đăng nhập - sử dụng service để xử lý logic
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        logger.info("Login attempt for username: {}", request.getUsername());
        try {
            // Service xử lý authentication và trả về AuthResponseDTO
            AuthResponseDTO response = authService.authenticateUser(request);
            logger.info("Login successful for username: {} with role: {}", request.getUsername(), response.getRoleName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Login failed for username: {} - Error: {}", request.getUsername(), e.getMessage());
            // Giữ nguyên format response khi lỗi
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, e.getMessage(), null, null, null));
        }
    }


    // Làm mới token - sử dụng service
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        logger.info("Token refresh attempt");
        try {
            // Service xử lý refresh token logic
            AuthResponseDTO response = authService.refreshUserToken(request);
            logger.info("Token refresh successful");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, e.getMessage(), null, null, null));
        }
    }

    // Đăng ký - sử dụng service, giữ nguyên response format
    // CHỈ DÀNH CHO SC STAFF TẠO TÀI KHOẢN CUSTOMER
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        logger.info("Registration attempt for username: {}", registrationDTO.getUsername());
        try {
            // Service xử lý registration logic - chỉ tạo customer
            AuthResponseDTO authResponse = authService.registerNewUser(registrationDTO);
            logger.info("Registration successful for username: {}", registrationDTO.getUsername());

            // Giữ nguyên format response Map như cũ
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Customer account created successfully");
            response.put("user", Map.of(
                "userId", authResponse.getUserId(),
                "username", authResponse.getUsername(),
                "roleName", authResponse.getRoleName() //get role name from AuthResponseDTO
            ));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            logger.error("Registration failed for username: {} - Error: {}", registrationDTO.getUsername(), e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // TẠO TÀI KHOẢN BỞI ADMIN - CHỈ ADMIN MỚI TRUY CẬP ĐƯỢC
    @PostMapping("/admin/create-user")
    public ResponseEntity<Map<String, Object>> createUserByAdmin(@Valid @RequestBody AdminUserCreationDTO adminCreationRequest) {
        logger.info("Admin user creation attempt for username: {}", adminCreationRequest.getUsername());
        try {
            // Service xử lý tạo user với bất kỳ role nào
            AuthResponseDTO authResponse = authService.createUserByAdmin(adminCreationRequest);
            logger.info("Admin user creation successful for username: {}", adminCreationRequest.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User created successfully by Admin");
            response.put("user", Map.of(
                "userId", authResponse.getUserId(),
                "username", authResponse.getUsername(),
                "roleName", authResponse.getRoleName()
            ));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            logger.error("Admin user creation failed for username: {} - Error: {}", adminCreationRequest.getUsername(), e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Đăng xuất - sử dụng service
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@Valid @RequestBody LogoutRequestDTO logoutRequest) {
        logger.info("Logout attempt");
        try {
            // Service xử lý logout logic
            authService.logoutUser(logoutRequest);
            logger.info("Logout successful");
            // Giữ nguyên response format
            return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
        } catch (RuntimeException e) {
            logger.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Quên mật khẩu - endpoint mới với DTO Auth
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        logger.info("Forgot password request for email: {}", request.getEmail());
        try {
            authService.processForgotPassword(request);
            logger.info("Forgot password email sent to: {}", request.getEmail());
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset email sent"));
        } catch (RuntimeException e) {
            logger.error("Forgot password failed for email: {} - Error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Đặt lại mật khẩu - endpoint mới
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        logger.info("Reset password attempt");
        try {
            authService.processResetPassword(request);
            logger.info("Password reset successful");
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
        } catch (RuntimeException e) {
            logger.error("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Validate token - nhận token từ header Authorization thay vì query param
    @GetMapping("/validate")
    public ResponseEntity<AuthResponseDTO> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
        logger.info("Token validation request");
        try {
            // Lấy token từ header (định dạng: Bearer <token>)
            String token = null;
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
            } else {
                throw new RuntimeException("Invalid Authorization header format");
            }
            AuthResponseDTO response = authService.validateToken(token);
            logger.info("Token validation successful");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponseDTO(null, null, e.getMessage(), null, null, null));
        }
    }
}
