package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.response.UserProfileResponseDTO;
import com.swp391.warrantymanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

/**
 * Service xử lý business logic cho User Management
 * - CRUD: Tạo, đọc, cập nhật, xóa user (chỉ ADMIN)
 * - Search: Tìm theo username, role
 * - Role: Cập nhật role của user
 * - Password: Reset password cho user
 * - Statistics: Thống kê số lượng user theo role
 */
public interface UserService {
    /**
     * Lấy danh sách user với phân trang, tìm kiếm, và filter theo role.
     * @param pageable Thông tin phân trang (page, size, sort)
     * @param search Từ khóa tìm kiếm (tìm trong username, email)
     * @param role Filter theo role name (vd: "ROLE_ADMIN", null = tất cả)
     * @return Page chứa danh sách User
     */
    Page<User> getAllUsers(Pageable pageable, String search, String role);

    /**
     * Lấy thông tin user theo ID.
     * @param userId ID của user cần lấy
     * @return User entity
     * @throws com.swp391.warrantymanagement.exception.ResourceNotFoundException nếu không tìm thấy user
     */
    User getUserById(Long userId);

    /**
     * Tìm kiếm user theo username (không phân biệt hoa thường).
     * @param username Username cần tìm
     * @param pageable Thông tin phân trang
     * @return Page chứa danh sách User khớp với username
     */
    Page<User> searchByUsername(String username, Pageable pageable);

    /**
     * Lấy danh sách user theo role.
     * @param roleName Tên role (vd: "ROLE_SC_TECHNICIAN")
     * @param pageable Thông tin phân trang
     * @return Page chứa danh sách User có role tương ứng
     */
    Page<User> getUsersByRole(String roleName, Pageable pageable);

    /**
     * Cập nhật thông tin user (email, address, etc).
     * @param userId ID của user cần cập nhật
     * @param updateRequest Map chứa các field cần cập nhật
     * @return User entity đã cập nhật
     */
    User updateUser(Long userId, Map<String, Object> updateRequest);

    /**
     * Thay đổi role của user (chỉ ADMIN).
     * @param userId ID của user
     * @param newRoleId ID của role mới
     * @return User entity với role đã thay đổi
     */
    User updateUserRole(Long userId, Long newRoleId);

    /**
     * Xóa user (soft delete hoặc hard delete tùy implementation).
     * @param userId ID của user cần xóa
     */
    void deleteUser(Long userId);

    /**
     * Reset password cho user (admin reset hoặc forgot password flow).
     * @param userId ID của user
     * @param newPassword Password mới (đã hash hoặc sẽ hash ở service layer)
     * @return Message xác nhận reset thành công
     */
    String resetUserPassword(Long userId, String newPassword);

    /**
     * Thống kê số lượng user theo từng role.
     * @return Map chứa thống kê (vd: {"ROLE_ADMIN": 2, "ROLE_CUSTOMER": 150})
     */
    Map<String, Object> getUserStatistics();

    /**
     * Get full user profile (for staff/admin roles)
     * @param userId User ID
     * @return Full user profile with work statistics
     */
    UserProfileResponseDTO getUserFullProfile(Long userId);

    /**
     * Tìm một User duy nhất bằng username.
     * Sẽ ném ra ResourceNotFoundException nếu không tìm thấy.
     * @param username Username cần tìm.
     * @return Đối tượng User nếu tìm thấy.
     */
    User findByUsername(String username);
}
