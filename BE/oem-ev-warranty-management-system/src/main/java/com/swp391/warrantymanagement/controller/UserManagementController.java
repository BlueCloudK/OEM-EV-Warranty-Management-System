package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.response.UserResponseDTO;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.mapper.UserMapper;
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

        logger.info("========================================");
        logger.info("GET ALL USERS REQUEST");
        logger.info("Page: {}, Size: {}", page, size);
        logger.info("Search: {}, Role: {}", search, role);
        logger.info("========================================");

        try {
            Page<User> userPage = userService.getAllUsers(PageRequest.of(page, size), search, role);

            // Convert to DTO using UserMapper
            List<UserResponseDTO> userList = UserMapper.toResponseDTOList(userPage.getContent());

            Map<String, Object> response = new HashMap<>();
            response.put("content", userList);
            response.put("pageNumber", page);
            response.put("pageSize", size);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("first", userPage.isFirst());
            response.put("last", userPage.isLast());

            logger.info("Get all users successful - Total: {}", userPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Get all users failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get user by ID
     * ADMIN only
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        logger.info(">>> GET USER BY ID: {}", userId);

        try {
            User user = userService.getUserById(userId);
            UserResponseDTO response = UserMapper.toResponseDTO(user);

            logger.info("User found: {}", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Get user by id failed: {} - Error: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
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

        logger.info(">>> SEARCH USERS: username={}, page={}, size={}", username, page, size);

        try {
            Page<User> userPage = userService.searchByUsername(username, PageRequest.of(page, size));

            // Convert to DTO using UserMapper
            List<UserResponseDTO> userList = UserMapper.toResponseDTOList(userPage.getContent());

            Map<String, Object> response = new HashMap<>();
            response.put("content", userList);
            response.put("pageNumber", page);
            response.put("pageSize", size);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("first", userPage.isFirst());
            response.put("last", userPage.isLast());

            logger.info("Search successful - Found: {} users", userPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Search failed: {}", e.getMessage());
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

        logger.info(">>> GET USERS BY ROLE: {}, page={}, size={}", roleName, page, size);

        try {
            Page<User> userPage = userService.getUsersByRole(roleName, PageRequest.of(page, size));

            // Convert to DTO using UserMapper
            List<UserResponseDTO> userList = UserMapper.toResponseDTOList(userPage.getContent());

            Map<String, Object> response = new HashMap<>();
            response.put("content", userList);
            response.put("pageNumber", page);
            response.put("pageSize", size);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("first", userPage.isFirst());
            response.put("last", userPage.isLast());

            logger.info("Get by role successful - Found: {} users", userPage.getTotalElements());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Get by role failed: {}", e.getMessage());
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

        logger.info("========================================");
        logger.info("UPDATE USER REQUEST");
        logger.info("User ID: {}", userId);
        logger.info("Data: {}", updateRequest);
        logger.info("========================================");

        try {
            User updatedUser = userService.updateUser(userId, updateRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("userId", userId);
            response.put("updatedFields", updateRequest.keySet());
            response.put("user", UserMapper.toResponseDTO(updatedUser)); // Use DTO

            logger.info("Update user successful: {}", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Update user failed: {} - Error: {}", userId, e.getMessage());
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

        logger.info(">>> UPDATE USER ROLE: userId={}, newRoleId={}", userId, newRoleId);

        try {
            User updatedUser = userService.updateUserRole(userId, newRoleId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User role updated successfully");
            response.put("userId", userId);
            response.put("newRoleId", newRoleId);
            response.put("newRoleName", updatedUser.getRole().getRoleName());
            response.put("user", UserMapper.toResponseDTO(updatedUser)); // ✅ Use DTO

            logger.info("Update role successful: {} → {}", userId, updatedUser.getRole().getRoleName());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Update role failed: {}", e.getMessage());
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
        logger.info("DELETE USER REQUEST: {}", userId);

        try {
            userService.deleteUser(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User deleted successfully");
            response.put("userId", userId);

            logger.info("Delete user successful: {}", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Delete user failed: {} - Error: {}", userId, e.getMessage());
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

        logger.info("RESET PASSWORD REQUEST: userId={}", userId);

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

            logger.info("Reset password successful: {}", userId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.error("Reset password failed: {}", e.getMessage());
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
        logger.info("GET USER STATISTICS REQUEST");

        try {
            Map<String, Object> statistics = userService.getUserStatistics();

            logger.info("Get statistics successful");
            return ResponseEntity.ok(statistics);

        } catch (RuntimeException e) {
            logger.error("Get statistics failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}

