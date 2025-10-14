package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for User Management APIs (Admin only)
 * Handles CRUD operations for user accounts management
 * Business Rules: Only ADMIN can manage user accounts
 */
@RestController
@RequestMapping("api/admin/users")
@CrossOrigin
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {
    private static final Logger logger = LoggerFactory.getLogger(UserManagementController.class);

    @Autowired
    private UserService userService;

    /**
     * Get all users with pagination and filtering
     * ADMIN only
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {

        logger.info("Admin get all users request: page={}, size={}, search={}, role={}\n", page, size, search, role);

        try {
            Page<User> userPage = userService.getAllUsers(PageRequest.of(page, size), search, role);

            // Convert to response format
            List<Map<String, Object>> userList = userPage.getContent().stream()
                .map(this::convertUserToResponse)
                .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("content", userList);
            response.put("pageNumber", page);
            response.put("pageSize", size);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("first", userPage.isFirst());
            response.put("last", userPage.isLast());

            logger.info("Get all users successful, page: {}, totalElements: {}\n", page, userPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Get all users failed: {}\n", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get user by ID
     * ADMIN only
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long userId) {
        logger.info("Admin get user by id: {}\n", userId);

        try {
            User user = userService.getUserById(userId);
            Map<String, Object> response = convertUserToResponse(user);

            logger.info("Get user by id successful: {}\n", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Get user by id failed: {} - Error: {}\n", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Search users by username
     * ADMIN only
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(
            @RequestParam String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Admin search users by username: {}, page={}, size={}\n", username, page, size);

        try {
            Page<User> userPage = userService.searchByUsername(username, PageRequest.of(page, size));

            List<Map<String, Object>> userList = userPage.getContent().stream()
                .map(this::convertUserToResponse)
                .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("content", userList);
            response.put("pageNumber", page);
            response.put("pageSize", size);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("first", userPage.isFirst());
            response.put("last", userPage.isLast());

            logger.info("Search users successful for username: {}, found: {} users\n", username, userPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Search users failed for username: {} - Error: {}\n", username, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get users by role
     * ADMIN only
     */
    @GetMapping("/by-role/{roleName}")
    public ResponseEntity<Map<String, Object>> getUsersByRole(
            @PathVariable String roleName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Admin get users by role: {}, page={}, size={}\n", roleName, page, size);

        try {
            Page<User> userPage = userService.getUsersByRole(roleName, PageRequest.of(page, size));

            List<Map<String, Object>> userList = userPage.getContent().stream()
                .map(this::convertUserToResponse)
                .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("content", userList);
            response.put("pageNumber", page);
            response.put("pageSize", size);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("first", userPage.isFirst());
            response.put("last", userPage.isLast());

            logger.info("Get users by role successful for role: {}, found: {} users\n", roleName, userPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Get users by role failed for role: {} - Error: {}\n", roleName, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Update user information
     * ADMIN only
     */
    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody Map<String, Object> updateRequest) {

        logger.info("Admin update user request: userId={}, data={}\n", userId, updateRequest);

        try {
            User updatedUser = userService.updateUser(userId, updateRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("userId", userId);
            response.put("updatedFields", updateRequest.keySet());
            response.put("user", convertUserToResponse(updatedUser));

            logger.info("Update user successful: {}\n", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Update user failed: {} - Error: {}\n", userId, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Update user role
     * ADMIN only - Special endpoint for role changes
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long userId,
            @RequestParam Long newRoleId) {

        logger.info("Admin update user role: userId={}, newRoleId={}\n", userId, newRoleId);

        try {
            User updatedUser = userService.updateUserRole(userId, newRoleId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User role updated successfully");
            response.put("userId", userId);
            response.put("newRoleId", newRoleId);
            response.put("newRoleName", updatedUser.getRole().getRoleName());
            response.put("user", convertUserToResponse(updatedUser));

            logger.info("Update user role successful: userId={}, newRoleId={}, newRoleName={}\n",
                userId, newRoleId, updatedUser.getRole().getRoleName());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Update user role failed: userId={}, newRoleId={} - Error: {}\n", userId, newRoleId, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Delete user (Soft delete recommended)
     * ADMIN only - Use with extreme caution
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long userId) {
        logger.info("Admin delete user request: {}\n", userId);

        try {
            userService.deleteUser(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User deleted successfully");
            response.put("userId", userId);

            logger.info("Delete user successful: {}\n", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Delete user failed: {} - Error: {}\n", userId, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Reset user password
     * ADMIN only
     */
    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<Map<String, Object>> resetUserPassword(
            @PathVariable Long userId,
            @RequestParam(required = false) String newPassword) {

        logger.info("Admin reset user password: userId={}\n", userId);

        try {
            String resetPassword = userService.resetUserPassword(userId, newPassword);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User password reset successfully");
            response.put("userId", userId);

            // Only return new password if it was auto-generated
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("newPassword", resetPassword);
                response.put("note", "Please share this password securely with the user");
            }

            logger.info("Reset user password successful: {}\n", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Reset user password failed: {} - Error: {}\n", userId, e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get user statistics
     * ADMIN only
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        logger.info("Admin get user statistics request\n");

        try {
            Map<String, Object> statistics = userService.getUserStatistics();

            logger.info("Get user statistics successful\n");
            return ResponseEntity.ok(statistics);

        } catch (RuntimeException e) {
            logger.error("Get user statistics failed: {}\n", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Helper method to convert User entity to response format
     */
    private Map<String, Object> convertUserToResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("address", user.getAddress());
        response.put("roleName", user.getRole().getRoleName());
        response.put("roleId", user.getRole().getRoleId());
        response.put("createdAt", user.getCreatedAt());
        return response;
    }
}
