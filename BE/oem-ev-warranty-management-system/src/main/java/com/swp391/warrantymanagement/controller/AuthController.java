package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.auth.LoginRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.RefreshTokenRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.UserRegistrationDTO;
import com.swp391.warrantymanagement.dto.request.auth.ForgotPasswordRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.ResetPasswordRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.LogoutRequestDTO;
import com.swp391.warrantymanagement.dto.request.auth.CustomerRegistrationByStaffDTO;
import com.swp391.warrantymanagement.dto.request.AdminUserCreationDTO;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
@CrossOrigin
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // REFACTOR: Chuyển sang Constructor Injection.
    // - @RequiredArgsConstructor sẽ tự động tạo constructor cho các trường `final`.
    // - Đây là cách được khuyến khích để tiêm phụ thuộc, giúp code dễ test và đảm bảo các dependency là bất biến.
    private final AuthService authService;

    /**
     * Xử lý yêu cầu đăng nhập của người dùng.
     * @param request DTO chứa username và password.
     * @return ResponseEntity chứa accessToken, refreshToken và thông tin người dùng nếu thành công.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        // Thiết kế: Controller chỉ chịu trách nhiệm điều hướng request.
        // Toàn bộ logic xử lý lỗi (ví dụ: sai mật khẩu, tài khoản không tồn tại) được ủy thác cho tầng Service ném ra exception,
        // và được GlobalExceptionHandler xử lý một cách tập trung để trả về response lỗi nhất quán.
        logger.info("Login attempt for username: {}", request.getUsername());
        AuthResponseDTO response = authService.authenticateUser(request);
        logger.info("Login successful for username: {} with role: {}", request.getUsername(), response.getRoleName());
        return ResponseEntity.ok(response);
    }

    /**
     * Làm mới accessToken khi nó hết hạn bằng cách sử dụng refreshToken.
     * @param request DTO chứa refreshToken.
     * @return ResponseEntity chứa một cặp accessToken và refreshToken mới.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        logger.info("Token refresh attempt");
        AuthResponseDTO response = authService.refreshUserToken(request);
        logger.info("Token refresh successful");
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint đăng ký tài khoản cơ bản (chỉ tạo User, không tạo Customer profile).
     * Thường được sử dụng trong các kịch bản mà việc tạo profile chi tiết được thực hiện ở một bước khác.
     * @param registrationDTO DTO chứa thông tin đăng ký người dùng.
     * @return ResponseEntity chứa thông tin tài khoản đã được tạo.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        // Thiết kế: Nếu username hoặc email đã tồn tại, AuthService sẽ ném ra `DuplicateResourceException`.
        // GlobalExceptionHandler sẽ bắt exception này và tự động trả về HTTP status 409 Conflict,
        // báo cho client biết rằng tài nguyên đã tồn tại và không thể tạo mới.
        logger.info("Registration attempt for username: {}", registrationDTO.getUsername());
        AuthResponseDTO authResponse = authService.registerNewUser(registrationDTO);
        logger.info("Registration successful for username: {}", registrationDTO.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Customer account created successfully");
        response.put("user", Map.of(
            "userId", authResponse.getUserId(),
            "username", authResponse.getUsername(),
            "roleName", authResponse.getRoleName()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint dành cho ADMIN để tạo một tài khoản người dùng mới với một vai trò bất kỳ.
     * @param adminCreationRequest DTO chứa thông tin người dùng và roleId.
     * @return ResponseEntity chứa thông tin tài khoản đã được tạo.
     */
    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createUserByAdmin(@Valid @RequestBody AdminUserCreationDTO adminCreationRequest) {
        // Bảo mật: @PreAuthorize("hasRole('ADMIN')") đảm bảo chỉ những người dùng có vai trò ADMIN mới có thể gọi endpoint này.
        logger.info("Admin user creation attempt for username: {}", adminCreationRequest.getUsername());
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
    }

    /**
     * Endpoint dành cho nhân viên (Staff) để đăng ký một khách hàng hoàn chỉnh.
     * Thao tác này sẽ tạo cả tài khoản User và Customer profile trong cùng một giao dịch (transaction).
     * @param registrationRequest DTO chứa thông tin của cả User và Customer.
     * @return ResponseEntity chứa thông tin Customer profile đã được tạo.
     */
    @PostMapping("/staff/register-customer")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<Map<String, Object>> registerCustomerByStaff(@Valid @RequestBody CustomerRegistrationByStaffDTO registrationRequest) {
        // Thiết kế: Toàn bộ thao tác được bọc trong @Transactional ở tầng Service để đảm bảo tính toàn vẹn dữ liệu.
        // Nếu việc tạo User thành công nhưng tạo Customer thất bại, toàn bộ giao dịch sẽ được rollback.
        logger.info("Staff customer registration attempt for username: {}", registrationRequest.getUsername());
        CustomerResponseDTO customerResponse = authService.registerCustomerByStaff(registrationRequest);
        logger.info("Staff customer registration successful for username: {} - Customer ID: {}",
            registrationRequest.getUsername(), customerResponse.getCustomerId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Customer account and profile created successfully");
        response.put("customer", customerResponse);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Xử lý yêu cầu đăng xuất của người dùng.
     * @param logoutRequest DTO chứa accessToken cần bị vô hiệu hóa.
     * @return ResponseEntity xác nhận đăng xuất thành công.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@Valid @RequestBody LogoutRequestDTO logoutRequest) {
        // Thiết kế: Tầng Service sẽ xử lý logic vô hiệu hóa token, ví dụ như lưu vào blacklist
        // cho đến khi token tự hết hạn, nhằm ngăn chặn việc tái sử dụng token đã bị lộ.
        logger.info("Logout attempt");
        authService.logoutUser(logoutRequest);
        logger.info("Logout successful");
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    /**
     * Bắt đầu quy trình quên mật khẩu.
     * Service sẽ tạo một reset token và gửi email cho người dùng.
     * @param request DTO chứa email của người dùng.
     * @return ResponseEntity xác nhận email đã được gửi.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        logger.info("Forgot password request for email: {}", request.getEmail());
        authService.processForgotPassword(request);
        logger.info("Forgot password email sent to: {}", request.getEmail());
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset email sent"));
    }

    /**
     * Hoàn tất quy trình đặt lại mật khẩu bằng cách sử dụng reset token.
     * @param request DTO chứa reset token và mật khẩu mới.
     * @return ResponseEntity xác nhận mật khẩu đã được đặt lại thành công.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        logger.info("Reset password attempt");
        authService.processResetPassword(request);
        logger.info("Password reset successful");
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
    }

    /**
     * Kiểm tra tính hợp lệ của một accessToken.
     * Thường được sử dụng bởi client khi khởi động ứng dụng để kiểm tra xem phiên đăng nhập cũ còn hợp lệ hay không.
     * @param authorizationHeader Header chứa token (định dạng "Bearer <token>").
     * @return ResponseEntity chứa thông tin người dùng nếu token hợp lệ.
     */
    @GetMapping("/validate")
    public ResponseEntity<AuthResponseDTO> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
        logger.info("Token validation request");
        String token = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
        } else {
            // Thiết kế: Ném ra `IllegalArgumentException` vì đây là lỗi do client gửi lên sai định dạng.
            // GlobalExceptionHandler có thể được cấu hình để bắt lỗi này và trả về HTTP status 400 Bad Request,
            // thay vì một lỗi 500 Internal Server Error chung chung.
            throw new IllegalArgumentException("Invalid Authorization header format");
        }
        AuthResponseDTO response = authService.validateToken(token);
        logger.info("Token validation successful");
        return ResponseEntity.ok(response);
    }
}
