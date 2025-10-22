package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.response.CustomerProfileResponseDTO;
import com.swp391.warrantymanagement.dto.response.UserProfileResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.CustomerService;
import com.swp391.warrantymanagement.service.UserService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller để kiểm tra thông tin user hiện tại và test authorization
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserInfoController {
    private static final Logger logger = LoggerFactory.getLogger(UserInfoController.class);

    private final UserService userService;
    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    // Lấy thông tin user hiện tại (tên, roles, trạng thái xác thực)
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        logger.info("Get current user info request");
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", SecurityUtil.getCurrentUsername());
        userInfo.put("roles", SecurityUtil.getCurrentRoles());
        userInfo.put("isAuthenticated", SecurityUtil.isAuthenticated());
        userInfo.put("hasAdminRole", SecurityUtil.hasRole("ADMIN"));
        userInfo.put("hasStaffRole", SecurityUtil.hasRole("SC_STAFF"));
        userInfo.put("hasCustomerRole", SecurityUtil.hasRole("CUSTOMER"));
        logger.info("Current user info: {}", userInfo);
        return ResponseEntity.ok(userInfo);
    }

    // VÍ DỤ: POST endpoint chỉ cho ADMIN
    @PostMapping("/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminOnlyPost(@RequestBody Map<String, Object> requestData) {
        String currentUser = SecurityUtil.getCurrentUsername();
        logger.info("Admin only POST request by: {}, data: {}", currentUser, requestData);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin action performed successfully");
        response.put("performedBy", currentUser);
        response.put("userRoles", SecurityUtil.getCurrentRoles());
        response.put("requestData", requestData);
        return ResponseEntity.ok(response);
    }

    // VÍ DỤ: POST endpoint cho ADMIN hoặc STAFF
    @PostMapping("/staff/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'SC_STAFF')")
    public ResponseEntity<Map<String, Object>> staffPost(@RequestBody Map<String, Object> requestData) {
        String currentUser = SecurityUtil.getCurrentUsername();
        logger.info("Staff POST request by: {}, data: {}", currentUser, requestData);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Staff action performed");
        response.put("performedBy", currentUser);
        response.put("userRoles", SecurityUtil.getCurrentRoles());
        response.put("isAdmin", SecurityUtil.hasRole("ADMIN"));
        response.put("isStaff", SecurityUtil.hasRole("SC_STAFF"));
        return ResponseEntity.ok(response);
    }

    // VÍ DỤ: POST endpoint với logic phân quyền phức tạp hơn
    @PostMapping("/dynamic-auth")
    public ResponseEntity<Map<String, Object>> dynamicAuth(@RequestBody Map<String, Object> requestData) {
        String currentUser = SecurityUtil.getCurrentUsername();
        logger.info("Dynamic auth POST request by: {}, data: {}", currentUser, requestData);
        if (!SecurityUtil.isAuthenticated()) {
            logger.warn("Dynamic auth failed: not authenticated");
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        Map<String, Object> response = new HashMap<>();
        if (SecurityUtil.hasRole("ADMIN")) {
            response.put("message", "Admin can do everything");
            response.put("allowedActions", new String[]{"CREATE", "READ", "UPDATE", "DELETE"});
        } else if (SecurityUtil.hasRole("SC_STAFF")) {
            response.put("message", "Staff has limited permissions");
            response.put("allowedActions", new String[]{"CREATE", "READ", "UPDATE"});
        } else if (SecurityUtil.hasRole("CUSTOMER")) {
            response.put("message", "Customer can only view");
            response.put("allowedActions", new String[]{"READ"});
        } else {
            logger.warn("Dynamic auth failed: no valid role");
            return ResponseEntity.status(403).body(Map.of("error", "No valid role found"));
        }
        response.put("user", currentUser);
        response.put("roles", SecurityUtil.getCurrentRoles());
        logger.info("Dynamic auth success for user: {} with roles: {}", currentUser, SecurityUtil.getCurrentRoles());
        return ResponseEntity.ok(response);
    }

    /**
     * Get full profile for current user
     * - CUSTOMER: Returns CustomerProfileResponseDTO with claim history, vehicles, feedbacks
     * - STAFF/ADMIN: Returns UserProfileResponseDTO with assigned claims and work statistics
     * GET /api/profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<?> getMyProfile() {
        String currentUsername = SecurityUtil.getCurrentUsername();
        logger.info("Get profile request from user: {}", currentUsername);

        // Find current user
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentUsername));

        String roleName = currentUser.getRole().getRoleName();
        logger.info("User {} has role: {}", currentUsername, roleName);

        // If CUSTOMER role, return customer profile with full details
        if ("CUSTOMER".equals(roleName)) {
            Customer customer = customerRepository.findByUser(currentUser);
            if (customer == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "error", "Customer profile not found. Please contact administrator to create your profile."
                ));
            }

            CustomerProfileResponseDTO profile = customerService.getCustomerFullProfile(customer.getCustomerId());
            return ResponseEntity.ok(profile);
        }

        // For other roles (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN), return user profile
        UserProfileResponseDTO profile = userService.getUserFullProfile(currentUser.getUserId());
        return ResponseEntity.ok(profile);
    }

    /**
     * Get basic user info (lightweight version of /profile)
     * GET /api/me
     */
    @GetMapping("/me/basic")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyBasicInfo() {
        String currentUsername = SecurityUtil.getCurrentUsername();
        logger.info("Get basic info request from user: {}", currentUsername);

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + currentUsername));

        Map<String, Object> basicInfo = new HashMap<>();
        basicInfo.put("userId", currentUser.getUserId());
        basicInfo.put("username", currentUser.getUsername());
        basicInfo.put("email", currentUser.getEmail());
        basicInfo.put("roleName", currentUser.getRole().getRoleName());
        basicInfo.put("roleId", currentUser.getRole().getRoleId());

        // If has service center
        if (currentUser.getServiceCenter() != null) {
            basicInfo.put("serviceCenterId", currentUser.getServiceCenter().getServiceCenterId());
            basicInfo.put("serviceCenterName", currentUser.getServiceCenter().getName());
        }

        // If CUSTOMER, add customer ID
        if ("CUSTOMER".equals(currentUser.getRole().getRoleName())) {
            Customer customer = customerRepository.findByUser(currentUser);
            if (customer != null) {
                basicInfo.put("customerId", customer.getCustomerId());
                basicInfo.put("customerName", customer.getName());
                basicInfo.put("phone", customer.getPhone());
            }
        }

        return ResponseEntity.ok(basicInfo);
    }
}
