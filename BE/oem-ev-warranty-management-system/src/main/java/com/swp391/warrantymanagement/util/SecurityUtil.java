package com.swp391.warrantymanagement.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class để lấy thông tin user hiện tại từ Security Context
 */
public class SecurityUtil {

    /**
     * Lấy Authentication object hiện tại
     */
    public static Authentication getCurrentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Lấy username của user hiện tại
     */
    public static String getCurrentUsername() {
        Authentication auth = getCurrentAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        return auth.getName();
    }

    /**
     * Lấy tất cả roles của user hiện tại
     * @return Set roles (ví dụ: ["ROLE_ADMIN", "ROLE_USER"])
     */
    public static Set<String> getCurrentRoles() {
        Authentication auth = getCurrentAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Set.of();
        }

        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }

    /**
     * Kiểm tra user hiện tại có role cụ thể không
     * @param role tên role (ví dụ: "ADMIN" hoặc "ROLE_ADMIN")
     */
    public static boolean hasRole(String role) {
        Set<String> roles = getCurrentRoles();
        return roles.contains("ROLE_" + role) || roles.contains(role);
    }

    /**
     * Lấy UserDetails object của user hiện tại
     */
    public static UserDetails getCurrentUserDetails() {
        Authentication auth = getCurrentAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails) {
            return (UserDetails) principal;
        }
        return null;
    }

    /**
     * Kiểm tra user đã authenticated chưa
     */
    public static boolean isAuthenticated() {
        Authentication auth = getCurrentAuthentication();
        return auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName());
    }
}
