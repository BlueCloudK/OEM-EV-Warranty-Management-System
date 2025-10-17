package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

/**
 * Service interface for User Management
 * Provides business logic for user operations
 */
public interface UserService {

    /**
     * Get all users with pagination and filtering
     */
    Page<User> getAllUsers(Pageable pageable, String search, String role);

    /**
     * Get user by ID
     */
    User getUserById(Long userId);

    /**
     * Search users by username with pagination
     */
    Page<User> searchByUsername(String username, Pageable pageable);

    /**
     * Get users by role name with pagination
     */
    Page<User> getUsersByRole(String roleName, Pageable pageable);

    /**
     * Update user information
     */
    User updateUser(Long userId, Map<String, Object> updateRequest);

    /**
     * Update user role
     */
    User updateUserRole(Long userId, Long newRoleId);

    /**
     * Delete user (soft delete)
     */
    void deleteUser(Long userId);

    /**
     * Reset user password
     */
    String resetUserPassword(Long userId, String newPassword);

    /**
     * Get user statistics
     */
    Map<String, Object> getUserStatistics();
}
