package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.auth.*;
import com.swp391.warrantymanagement.dto.request.AdminUserCreationDTO;
import com.swp391.warrantymanagement.dto.response.AuthResponseDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.entity.User;

/**
 * Service xử lý Authentication và Authorization
 * - Login/Logout: Đăng nhập, đăng xuất, refresh token
 * - Registration: Đăng ký user mới (customer tự đăng ký, admin tạo staff)
 * - Password: Quên mật khẩu, reset password
 * - Token: Validate JWT token, lưu refresh token
 */
public interface AuthService {
    // Đăng nhập (username/email + password) → Trả về access token + refresh token
    AuthResponseDTO authenticateUser(LoginRequestDTO loginRequest);

    // Refresh access token (khi hết hạn) bằng refresh token
    AuthResponseDTO refreshUserToken(RefreshTokenRequestDTO refreshRequest);

    // Customer tự đăng ký tài khoản (public endpoint)
    AuthResponseDTO registerNewUser(UserRegistrationDTO registrationRequest);

    // Admin tạo user (staff, technician) - chỉ ADMIN
    AuthResponseDTO createUserByAdmin(AdminUserCreationDTO adminCreationRequest);

    // Staff tạo customer (tại service center) - SC_STAFF, EVM_STAFF
    CustomerResponseDTO registerCustomerByStaff(CustomerRegistrationByStaffDTO registrationRequest);

    // Đăng xuất (invalidate refresh token)
    void logoutUser(LogoutRequestDTO logoutRequest);

    // Gửi email reset password khi quên mật khẩu
    void processForgotPassword(ForgotPasswordRequestDTO forgotRequest);

    // Reset password với token từ email
    void processResetPassword(ResetPasswordRequestDTO resetRequest);

    // Validate JWT token (check signature, expiration)
    AuthResponseDTO validateToken(String token);

    // Lưu refresh token vào database (cho logout, revoke)
    void saveRefreshToken(User user, String refreshToken);
}

