package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.response.CustomerProfileResponseDTO;
import com.swp391.warrantymanagement.dto.response.UserProfileResponseDTO;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
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
import java.util.Optional;

/**
 * Controller chịu trách nhiệm cung cấp các API cho phép người dùng lấy thông tin của chính họ.
 * <p>
 * <strong>Thiết kế:</strong>
 * <ul>
 *     <li>Controller này chứa các endpoint quan trọng như {@code /api/profile} để người dùng xem thông tin chi tiết.</li>
 *     <li>Nó cũng bao gồm các endpoint ví dụ ({@code /api/admin/test}, {@code /api/staff/test}) để minh họa và kiểm tra
 *     cách hoạt động của hệ thống phân quyền {@code @PreAuthorize} và lớp tiện ích {@link SecurityUtil}.</li>
 *     <li>Tất cả các endpoint yêu cầu xác thực đều lấy định danh người dùng một cách an toàn từ {@code SecurityContext}
 *     thay vì tin tưởng vào dữ liệu do client gửi lên.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserInfoController {
    private static final Logger logger = LoggerFactory.getLogger(UserInfoController.class);

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok kết hợp với các trường {@code final} để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc trong Spring vì:
     * <ul>
     *     <li><b>Bất biến (Immutability):</b> Các dependency không thể bị thay đổi sau khi đối tượng được tạo.</li>
     *     <li><b>An toàn (Null-safety):</b> Đảm bảo các dependency bắt buộc phải được cung cấp khi khởi tạo, tránh lỗi {@code NullPointerException}.</li>
     *     <li><b>Dễ dàng cho việc Test:</b> Rất dễ dàng để tạo một instance của Controller với các đối tượng mock trong Unit Test.</li>
     * </ul>
     */
    private final UserService userService;
    private final CustomerService customerService;

    /**
     * Lấy thông tin cơ bản về người dùng đang đăng nhập.
     * Thường được sử dụng bởi frontend khi khởi động để xác định trạng thái xác thực và vai trò của người dùng.
     *
     * @return {@link ResponseEntity} chứa một Map các thông tin cơ bản như username, roles, và trạng thái xác thực.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        logger.info("Get current user info request");
        Map<String, Object> userInfo = new HashMap<>();
        // FIX: SecurityUtil.getCurrentUsername() trả về Optional<String>.
        // .orElse(null) sẽ lấy giá trị nếu có, hoặc trả về null nếu không có user đăng nhập.
        userInfo.put("username", SecurityUtil.getCurrentUsername().orElse(null));
        userInfo.put("roles", SecurityUtil.getCurrentRoles());
        userInfo.put("isAuthenticated", SecurityUtil.isAuthenticated());
        userInfo.put("hasAdminRole", SecurityUtil.hasRole("ADMIN"));
        userInfo.put("hasStaffRole", SecurityUtil.hasRole("SC_STAFF"));
        userInfo.put("hasCustomerRole", SecurityUtil.hasRole("CUSTOMER"));
        logger.info("Current user info: {}", userInfo);
        return ResponseEntity.ok(userInfo);
    }

    /**
     * Endpoint ví dụ để kiểm tra quyền truy cập chỉ dành cho ADMIN.
     * @param requestData Dữ liệu bất kỳ được gửi lên để test.
     * @return {@link ResponseEntity} xác nhận hành động đã được thực hiện bởi ADMIN.
     */
    @PostMapping("/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminOnlyPost(@RequestBody Map<String, Object> requestData) {
        // FIX: Lấy username một cách an toàn từ Optional.
        // .orElse("Unknown Admin") cung cấp một giá trị mặc định nếu không có user nào đăng nhập.
        String currentUser = SecurityUtil.getCurrentUsername().orElse("Unknown Admin");
        logger.info("Admin only POST request by: {}, data: {}", currentUser, requestData);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin action performed successfully");
        response.put("performedBy", currentUser);
        response.put("userRoles", SecurityUtil.getCurrentRoles());
        response.put("requestData", requestData);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint ví dụ để kiểm tra quyền truy cập dành cho ADMIN hoặc SC_STAFF.
     * @param requestData Dữ liệu bất kỳ được gửi lên để test.
     * @return {@link ResponseEntity} xác nhận hành động đã được thực hiện bởi người có vai trò phù hợp.
     */
    @PostMapping("/staff/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'SC_STAFF')")
    public ResponseEntity<Map<String, Object>> staffPost(@RequestBody Map<String, Object> requestData) {
        // FIX: Lấy username một cách an toàn từ Optional.
        String currentUser = SecurityUtil.getCurrentUsername().orElse("Unknown Staff");
        logger.info("Staff POST request by: {}, data: {}", currentUser, requestData);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Staff action performed");
        response.put("performedBy", currentUser);
        response.put("userRoles", SecurityUtil.getCurrentRoles());
        response.put("isAdmin", SecurityUtil.hasRole("ADMIN"));
        response.put("isStaff", SecurityUtil.hasRole("SC_STAFF"));
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint ví dụ để minh họa việc kiểm tra quyền một cách tường minh trong code bằng {@link SecurityUtil}.
     * @param requestData Dữ liệu bất kỳ được gửi lên để test.
     * @return {@link ResponseEntity} chứa các hành động được phép dựa trên vai trò của người dùng.
     */
    @PostMapping("/dynamic-auth")
    public ResponseEntity<Map<String, Object>> dynamicAuth(@RequestBody Map<String, Object> requestData) {
        // FIX: Lấy username một cách an toàn từ Optional.
        String currentUser = SecurityUtil.getCurrentUsername().orElse("Anonymous");
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
     * Lấy thông tin profile đầy đủ của người dùng đang đăng nhập.
     * <p>
     * <strong>Thiết kế "Polymorphic Response":</strong>
     * <ul>
     *     <li>Nếu người dùng là <b>CUSTOMER</b>, trả về {@link CustomerProfileResponseDTO} chứa lịch sử bảo hành, danh sách xe, v.v.</li>
     *     <li>Nếu người dùng là <b>nhân viên/quản trị</b>, trả về {@link UserProfileResponseDTO} chứa các thống kê công việc.</li>
     * </ul>
     *
     * @return {@link ResponseEntity} chứa DTO profile tương ứng với vai trò của người dùng.
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<?> getMyProfile() {
        // Thiết kế bảo mật: Luôn lấy định danh của người dùng từ một nguồn đáng tin cậy là Security Context.
        // .orElseThrow() đảm bảo rằng nếu không có người dùng nào được xác thực, một exception sẽ được ném ra
        // và GlobalExceptionHandler sẽ trả về lỗi 401 Unauthorized.
        String currentUsername = SecurityUtil.getCurrentUsername().orElseThrow(
                () -> new AuthenticationRequiredException("Authentication is required to access profile"));
        logger.info("Get profile request from user: {}", currentUsername);

        // REFACTOR: Không truy cập repository trực tiếp. Luôn đi qua tầng Service.
        User currentUser = userService.findByUsername(currentUsername);

        String roleName = currentUser.getRole().getRoleName();
        logger.info("User {} has role: {}", currentUsername, roleName);

        // Dựa vào vai trò để quyết định loại profile sẽ trả về.
        // FIX: So sánh role với "ROLE_CUSTOMER" theo chuẩn Spring Security.
        if ("ROLE_CUSTOMER".equals(roleName)) {
            // REFACTOR: Lấy customer profile thông qua service.
            // Thiết kế: Tầng Service sẽ chịu trách nhiệm tìm User, sau đó tìm Customer profile tương ứng.
            // Nếu không tìm thấy, service sẽ ném ResourceNotFoundException -> 404 Not Found.
            CustomerProfileResponseDTO profile = customerService.getCustomerProfileByUsername(currentUsername);

            return ResponseEntity.ok(profile);
        }

        // For other roles (ADMIN, EVM_STAFF, SC_STAFF, SC_TECHNICIAN), return user profile
        UserProfileResponseDTO profile = userService.getUserFullProfile(currentUser.getUserId());
        return ResponseEntity.ok(profile);
    }

    /**
     * Lấy thông tin cơ bản của người dùng đang đăng nhập (phiên bản "nhẹ" của /profile).
     * Thường được sử dụng cho các mục đích hiển thị nhanh như tên người dùng, vai trò trên header của trang web.
     *
     * @return {@link ResponseEntity} chứa một Map các thông tin cơ bản.
     */
    @GetMapping("/me/basic")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyBasicInfo() {
        // Thiết kế bảo mật: Tương tự như getMyProfile, lấy username từ Security Context.
        String currentUsername = SecurityUtil.getCurrentUsername().orElseThrow(
                () -> new AuthenticationRequiredException("Authentication is required to access basic info"));
        logger.info("Get basic info request from user: {}", currentUsername);

        User currentUser = userService.findByUsername(currentUsername);

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
        // FIX: So sánh role với "ROLE_CUSTOMER".
        if ("ROLE_CUSTOMER".equals(currentUser.getRole().getRoleName())) {
            // Thiết kế: Sử dụng Optional và ifPresent để xử lý một cách an toàn trường hợp một User có vai trò CUSTOMER
            // nhưng vì lý do nào đó chưa có Customer profile tương ứng trong database.
            // REFACTOR: Lấy customer profile thông qua service một cách an toàn.
            Optional<CustomerProfileResponseDTO> customerOpt = customerService.findCustomerProfileByUsername(currentUsername);
            customerOpt.ifPresent(customer -> {
                basicInfo.put("customerId", customer.getCustomerId());
                basicInfo.put("customerName", customer.getCustomerName());
                basicInfo.put("phone", customer.getCustomerPhone());
            });
        }

        return ResponseEntity.ok(basicInfo);
    }
}
