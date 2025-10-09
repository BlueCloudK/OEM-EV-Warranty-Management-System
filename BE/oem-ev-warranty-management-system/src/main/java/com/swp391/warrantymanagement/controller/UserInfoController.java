package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.util.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller để kiểm tra thông tin user hiện tại và test authorization
 */
@RestController
@RequestMapping("/api")
public class UserInfoController {

    /**
     * Endpoint để xem thông tin user hiện tại (GET)
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", SecurityUtil.getCurrentUsername());
        userInfo.put("roles", SecurityUtil.getCurrentRoles());
        userInfo.put("isAuthenticated", SecurityUtil.isAuthenticated());
        userInfo.put("hasAdminRole", SecurityUtil.hasRole("ADMIN"));
        userInfo.put("hasStaffRole", SecurityUtil.hasRole("STAFF"));
        userInfo.put("hasCustomerRole", SecurityUtil.hasRole("CUSTOMER"));

        return ResponseEntity.ok(userInfo);
    }

    /**
     * VÍ DỤ: POST endpoint chỉ dành cho ADMIN
     */
    @PostMapping("/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminOnlyPost(@RequestBody Map<String, Object> requestData) {
        // Lấy thông tin user đang thực hiện action
        String currentUser = SecurityUtil.getCurrentUsername();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin action performed successfully");
        response.put("performedBy", currentUser);
        response.put("userRoles", SecurityUtil.getCurrentRoles());
        response.put("requestData", requestData);

        return ResponseEntity.ok(response);
    }

    /**
     * VÍ DỤ: POST endpoint cho ADMIN hoặc STAFF
     */
    @PostMapping("/staff/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Object>> staffPost(@RequestBody Map<String, Object> requestData) {
        String currentUser = SecurityUtil.getCurrentUsername();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Staff action performed");
        response.put("performedBy", currentUser);
        response.put("userRoles", SecurityUtil.getCurrentRoles());
        response.put("isAdmin", SecurityUtil.hasRole("ADMIN"));
        response.put("isStaff", SecurityUtil.hasRole("STAFF"));

        return ResponseEntity.ok(response);
    }

    /**
     * VÍ DỤ: POST endpoint với logic phân quyền trong code
     */
    @PostMapping("/dynamic-auth")
    public ResponseEntity<Map<String, Object>> dynamicAuth(@RequestBody Map<String, Object> requestData) {
        String currentUser = SecurityUtil.getCurrentUsername();

        if (!SecurityUtil.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Map<String, Object> response = new HashMap<>();

        // Logic khác nhau dựa trên role
        if (SecurityUtil.hasRole("ADMIN")) {
            response.put("message", "Admin có thể làm tất cả");
            response.put("allowedActions", new String[]{"CREATE", "READ", "UPDATE", "DELETE"});
        } else if (SecurityUtil.hasRole("STAFF")) {
            response.put("message", "Staff có quyền hạn chế");
            response.put("allowedActions", new String[]{"CREATE", "READ", "UPDATE"});
        } else if (SecurityUtil.hasRole("CUSTOMER")) {
            response.put("message", "Customer chỉ được xem");
            response.put("allowedActions", new String[]{"READ"});
        } else {
            return ResponseEntity.status(403).body(Map.of("error", "No valid role found"));
        }

        response.put("user", currentUser);
        response.put("roles", SecurityUtil.getCurrentRoles());

        return ResponseEntity.ok(response);
    }
}
