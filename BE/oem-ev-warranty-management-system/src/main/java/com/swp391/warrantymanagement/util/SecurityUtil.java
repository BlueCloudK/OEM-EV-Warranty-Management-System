package com.swp391.warrantymanagement.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Set;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Utility class để lấy thông tin user hiện tại từ Security Context
 * - Cung cấp các phương thức static, an toàn để truy cập thông tin xác thực.
 * - Sử dụng Optional để tránh NullPointerException.
 */
public final class SecurityUtil {

    /**
     * Private constructor để ngăn không cho class này được khởi tạo.
     * Đây là best practice cho các utility class.
     */
    private SecurityUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Lấy Optional chứa Authentication object hiện tại từ SecurityContext.
     *
     * @return Optional chứa Authentication nếu user đã xác thực, ngược lại trả về Optional.empty().
     */
    public static Optional<Authentication> getCurrentAuthentication() {
        // Step 1: Lấy Authentication object từ SecurityContextHolder.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Step 2: Kiểm tra nếu object là null hoặc chưa được xác thực (ví dụ: anonymous user).
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty();
        }
        // Step 3: Trả về Optional chứa Authentication object.
        return Optional.of(authentication);
    }

    /**
     * Lấy username (tên đăng nhập) của user hiện tại.
     *
     * @return Optional chứa username nếu user đã xác thực, ngược lại trả về Optional.empty().
     */
    public static Optional<String> getCurrentUsername() {
        // Sử dụng Optional để xử lý chuỗi một cách an toàn và hiện đại.
        return getCurrentAuthentication().map(Authentication::getName);
    }

    /**
     * Lấy tất cả các roles (quyền) của user hiện tại.
     *
     * @return Một Set các chuỗi roles (ví dụ: ["ROLE_ADMIN", "ROLE_USER"]). Trả về Set rỗng nếu không xác thực.
     */
    public static Set<String> getCurrentRoles() {
        // orElse(Set.of()) đảm bảo phương thức này luôn trả về một Set, không bao giờ là null.
        return getCurrentAuthentication()
                .map(auth -> auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet()))
                .orElse(Set.of());
    }

    /**
     * Kiểm tra user hiện tại có một role cụ thể hay không.
     *
     * @param role Tên role cần kiểm tra (ví dụ: "ADMIN" hoặc "ROLE_ADMIN").
     * @return true nếu user có role đó, ngược lại là false.
     */
    public static boolean hasRole(String role) {
        // Lý do: Logic này linh hoạt, chấp nhận cả tên role có và không có prefix "ROLE_".
        Set<String> roles = getCurrentRoles();
        // Chuẩn hóa input để tránh lỗi.
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
        return roles.contains(roleWithPrefix);
    }

    /**
     * Lấy UserDetails object của user hiện tại.
     * UserDetails là interface của Spring Security chứa thông tin chi tiết về user.
     *
     * @return Optional chứa UserDetails nếu user đã xác thực, ngược lại trả về Optional.empty().
     */
    public static Optional<UserDetails> getCurrentUserDetails() {
        return getCurrentAuthentication()
                .map(Authentication::getPrincipal)
                .filter(UserDetails.class::isInstance)
                .map(UserDetails.class::cast);
    }

    /**
     * Kiểm tra user hiện tại đã được xác thực hay chưa.
     *
     * @return true nếu có một user đã đăng nhập và không phải là anonymous, ngược lại là false.
     */
    public static boolean isAuthenticated() {
        // .isPresent() là cách kiểm tra an toàn xem Optional có chứa giá trị hay không.
        return getCurrentAuthentication().isPresent();
    }
}
