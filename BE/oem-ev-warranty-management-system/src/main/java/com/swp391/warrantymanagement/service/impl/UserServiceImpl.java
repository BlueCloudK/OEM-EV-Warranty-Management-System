package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.TokenRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of UserService
 * Handles all user management business logic
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable, String search, String role) {
        logger.info("Getting all users with search: {}, role: {}", search, role);

        // Create sort by createdAt DESC
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        // Apply filters if provided
        if ((search != null && !search.trim().isEmpty()) || (role != null && !role.trim().isEmpty())) {
            return getUsersWithFilter(search, role, sortedPageable);
        }

        return userRepository.findAll(sortedPageable);
    }

    private Page<User> getUsersWithFilter(String search, String role, Pageable pageable) {
        // ✅ FIXED: Implement actual filtering logic
        if (search != null && !search.trim().isEmpty() && role != null && !role.trim().isEmpty()) {
            // Filter by both search and role
            Role roleEntity = roleRepository.findByRoleName(role.trim())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + role));
            // For now, filter by role only - can extend with search later
            return userRepository.findByRole(roleEntity, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            // Filter by search (username contains search term)
            return userRepository.findByUsernameContainingIgnoreCase(search.trim(), pageable);
        } else if (role != null && !role.trim().isEmpty()) {
            // Filter by role only
            Role roleEntity = roleRepository.findByRoleName(role.trim())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + role));
            return userRepository.findByRole(roleEntity, pageable);
        }

        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        logger.info("Getting user by id: {}", userId);

        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> searchByUsername(String username, Pageable pageable) {
        logger.info("Searching users by username: {}", username);

        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Username search parameter cannot be empty");
        }

        // Create sort by username ASC
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "username")
        );

        // ✅ FIXED: Search users by username containing the search term
        return userRepository.findByUsernameContainingIgnoreCase(username.trim(), sortedPageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> getUsersByRole(String roleName, Pageable pageable) {
        logger.info("Getting users by role: {}", roleName);

        if (roleName == null || roleName.trim().isEmpty()) {
            throw new RuntimeException("Role name cannot be empty");
        }

        // Create sort by username ASC
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "username")
        );

        // ✅ FIXED: Find role by name first, then filter users by that role
        Role role = roleRepository.findByRoleName(roleName.trim())
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        // Filter users by role
        return userRepository.findByRole(role, sortedPageable);
    }

    @Override
    public User updateUser(Long userId, Map<String, Object> updateRequest) {
        logger.info("Updating user: {} with data: {}", userId, updateRequest);

        User user = getUserById(userId);

        // Update allowed fields
        if (updateRequest.containsKey("username")) {
            String newUsername = (String) updateRequest.get("username");
            if (newUsername != null && !newUsername.trim().isEmpty()) {
                // Check if username already exists
                if (userRepository.existsByUsername(newUsername) && !user.getUsername().equals(newUsername)) {
                    throw new RuntimeException("Username already exists: " + newUsername);
                }
                user.setUsername(newUsername.trim());
            }
        }

        if (updateRequest.containsKey("email")) {
            String newEmail = (String) updateRequest.get("email");
            if (newEmail != null && !newEmail.trim().isEmpty()) {
                // Check if email already exists
                if (userRepository.existsByEmail(newEmail) && !user.getEmail().equals(newEmail)) {
                    throw new RuntimeException("Email already exists: " + newEmail);
                }
                user.setEmail(newEmail.trim().toLowerCase());
            }
        }

        if (updateRequest.containsKey("address")) {
            String newAddress = (String) updateRequest.get("address");
            if (newAddress != null && !newAddress.trim().isEmpty()) {
                user.setAddress(newAddress.trim());
            }
        }

        return userRepository.save(user);
    }

    @Override
    public User updateUserRole(Long userId, Long newRoleId) {
        logger.info("Updating user role: userId={}, newRoleId={}", userId, newRoleId);

        User user = getUserById(userId);
        Role newRole = roleRepository.findById(newRoleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + newRoleId));

        user.setRole(newRole);

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        logger.info("Deleting user: {}", userId);

        User user = getUserById(userId);

        // Xóa tất cả token liên quan đến user trước khi xóa user
        logger.info("Deleting all tokens for user: {}", userId);
        tokenRepository.deleteByUser(user);

        // Soft delete - you might want to add a 'deleted' flag to User entity
        // For now, we'll do hard delete but log it as soft delete
        logger.warn("Performing hard delete for user: {} (consider implementing soft delete)", userId);

        userRepository.delete(user);
    }

    @Override
    public String resetUserPassword(Long userId, String newPassword) {
        logger.info("Resetting password for user: {}", userId);

        User user = getUserById(userId);

        String passwordToSet;
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            passwordToSet = newPassword.trim();
        } else {
            // Generate random password
            passwordToSet = generateRandomPassword();
        }

        // Encode password
        String encodedPassword = passwordEncoder.encode(passwordToSet);
        user.setPassword(encodedPassword);

        userRepository.save(user);

        // Return the plain password (for admin to share with user)
        return passwordToSet;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics() {
        logger.info("Getting user statistics");

        Map<String, Object> statistics = new HashMap<>();

        // Total users
        long totalUsers = userRepository.count();
        statistics.put("totalUsers", totalUsers);

        // For now, set active/inactive as placeholders
        statistics.put("activeUsers", totalUsers); // All users are active for now
        statistics.put("inactiveUsers", 0);

        // ✅ FIXED: Count users by role properly
        Map<String, Long> usersByRole = new HashMap<>();
        List<Role> allRoles = roleRepository.findAll();

        for (Role role : allRoles) {
            // Count users for each role
            long count = userRepository.countByRole(role);
            usersByRole.put(role.getRoleName(), count);
        }
        statistics.put("usersByRole", usersByRole);

        // Recent registrations (last 10 users)
        Pageable recentPageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> recentUsers = userRepository.findAll(recentPageable);

        List<Map<String, Object>> recentRegistrations = recentUsers.getContent().stream()
                .map(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", user.getUserId());
                    userInfo.put("username", user.getUsername());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("roleName", user.getRole().getRoleName());
                    userInfo.put("createdAt", user.getCreatedAt());
                    return userInfo;
                })
                .toList();

        statistics.put("recentRegistrations", recentRegistrations);

        return statistics;
    }

    /**
     * Generate a random password
     */
    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
}
