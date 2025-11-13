package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.response.UserResponseDTO;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.exception.AuthenticationRequiredException;
import com.swp391.warrantymanagement.mapper.UserMapper;
import com.swp391.warrantymanagement.service.UserService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller chịu trách nhiệm xử lý các API quản lý người dùng, chỉ dành cho vai trò ADMIN.
 * <p>
 * <strong>Thiết kế Bảo mật và Kiến trúc:</strong>
 * <ul>
 *     <li><b>Bảo mật Cấp độ Lớp:</b> Annotation {@code @PreAuthorize("hasRole('ADMIN')")} được áp dụng ở cấp độ lớp,
 *     đảm bảo rằng tất cả các endpoint trong controller này đều yêu cầu người dùng phải có vai trò ADMIN.
 *     Đây là một lớp bảo vệ mạnh mẽ, ngăn chặn việc vô tình bỏ sót phân quyền cho một endpoint mới.</li>
 *     <li><b>Thiết kế "Lean Controller":</b> Controller này tuân thủ nguyên tắc "Lean Controller", chỉ tập trung vào việc
 *     nhận và xác thực request, sau đó điều hướng đến tầng Service để xử lý logic nghiệp vụ.</li>
 *     <li><b>Xử lý lỗi tập trung:</b> Toàn bộ việc xử lý lỗi (ví dụ: không tìm thấy tài nguyên, dữ liệu không hợp lệ)
 *     được tự động xử lý bởi {@code GlobalExceptionHandler} thông qua các exception được ném ra từ tầng Service.</li>
 * </ul>
 */
@RestController
@RequestMapping("api/admin/users")
@CrossOrigin
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserManagementController {
    private static final Logger logger = LoggerFactory.getLogger(UserManagementController.class);

    /**
     * <strong>Constructor Injection:</strong>
     * <p>
     * Sử dụng {@code @RequiredArgsConstructor} của Lombok kết hợp với trường {@code final} để thực hiện Constructor Injection.
     * Đây là cách được khuyến khích để tiêm phụ thuộc trong Spring vì:
     * <ul>
     *     <li><b>Bất biến (Immutability):</b> Các dependency không thể bị thay đổi sau khi đối tượng được tạo.</li>
     *     <li><b>An toàn (Null-safety):</b> Đảm bảo các dependency bắt buộc phải được cung cấp khi khởi tạo, tránh lỗi {@code NullPointerException}.</li>
     *     <li><b>Dễ dàng cho việc Test:</b> Rất dễ dàng để tạo một instance của Controller với các đối tượng mock trong Unit Test.</li>
     * </ul>
     */
    private final UserService userService;

    /**
     * Lấy danh sách tất cả người dùng, hỗ trợ phân trang, tìm kiếm và lọc theo vai trò.
     *
     * @param page   Số trang (mặc định là 0).
     * @param size   Số lượng phần tử trên mỗi trang (mặc định là 10).
     * @param search Từ khóa tìm kiếm chung (trong username hoặc email).
     * @param role   Tên vai trò để lọc.
     * @return {@link ResponseEntity} chứa một Map với dữ liệu người dùng và thông tin phân trang.
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

        // Thiết kế: Controller ủy thác hoàn toàn logic tìm kiếm và lọc cho tầng Service.
        // Tầng Service sẽ trả về một đối tượng `Page<User>`.
        Page<User> userPage = userService.getAllUsers(PageRequest.of(page, size), search, role);

        // Thiết kế: Controller chịu trách nhiệm chuyển đổi (map) từ `Page<User>` (Entity)
        // sang một cấu trúc JSON thân thiện với client, bao gồm danh sách người dùng (đã được chuyển thành DTO)
        // và các thông tin phân trang cần thiết cho UI.
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
    }

    /**
     * Lấy thông tin chi tiết của một người dùng dựa trên ID.
     *
     * @param userId ID của người dùng cần lấy thông tin.
     * @return {@link ResponseEntity} chứa {@link UserResponseDTO} nếu tìm thấy.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        logger.info(">>> GET USER BY ID: {}", userId);

        // Thiết kế "Happy Path": Controller không cần kiểm tra kết quả trả về có null hay không.
        // Tầng Service được thiết kế để ném ra `ResourceNotFoundException` nếu không tìm thấy người dùng.
        // `GlobalExceptionHandler` sẽ bắt exception này và tự động trả về HTTP status 404 Not Found.
        User user = userService.getUserById(userId);
        // Chuyển đổi từ Entity sang DTO trước khi trả về cho client để che giấu các thông tin không cần thiết.
        UserResponseDTO response = UserMapper.toResponseDTO(user);

        logger.info("User found: {}", userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Tìm kiếm người dùng theo username, hỗ trợ phân trang.
     *
     * @param username Từ khóa tìm kiếm trong username.
     * @param page     Số trang.
     * @param size     Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một Map với dữ liệu người dùng và thông tin phân trang.
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(
            @RequestParam String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info(">>> SEARCH USERS: username={}, page={}, size={}", username, page, size);

        Page<User> userPage = userService.searchByUsername(username, PageRequest.of(page, size));

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
    }

    /**
     * Lấy danh sách người dùng theo một vai trò cụ thể, hỗ trợ phân trang.
     *
     * @param roleName Tên vai trò cần lọc.
     * @param page     Số trang.
     * @param size     Số lượng phần tử trên trang.
     * @return {@link ResponseEntity} chứa một Map với dữ liệu người dùng và thông tin phân trang.
     */
    @GetMapping("/by-role/{roleName}")
    public ResponseEntity<Map<String, Object>> getUsersByRole(
            @PathVariable String roleName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info(">>> GET USERS BY ROLE: {}, page={}, size={}", roleName, page, size);

        Page<User> userPage = userService.getUsersByRole(roleName, PageRequest.of(page, size));

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
    }

    /**
     * Cập nhật một hoặc nhiều thông tin của người dùng (Partial Update).
     *
     * @param userId        ID của người dùng cần cập nhật.
     * @param updateRequest Một Map chứa các cặp key-value tương ứng với các trường cần cập nhật.
     *                      Ví dụ: `{"email": "new.email@example.com", "address": "New Address"}`.
     * @return {@link ResponseEntity} chứa thông tin người dùng đã được cập nhật.
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

        // Thiết kế: Sử dụng `Map<String, Object>` làm request body cho phép client thực hiện các cập nhật linh hoạt (partial updates)
        // mà không cần phải gửi toàn bộ thông tin của người dùng. Tầng Service sẽ chịu trách nhiệm
        // xác thực và xử lý các trường được phép cập nhật trong Map này.
        User updatedUser = userService.updateUser(userId, updateRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User updated successfully");
        response.put("userId", userId);
        response.put("updatedFields", updateRequest.keySet());
        response.put("user", UserMapper.toResponseDTO(updatedUser)); // Use DTO

        logger.info("Update user successful: {}", userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật vai trò cho một người dùng.
     * Đây là một endpoint riêng biệt (sử dụng PATCH) để thể hiện rõ ràng ý đồ thay đổi một thuộc tính quan trọng.
     *
     * @param userId    ID của người dùng cần thay đổi vai trò.
     * @param newRoleId ID của vai trò mới.
     * @return {@link ResponseEntity} chứa thông tin người dùng với vai trò đã được cập nhật.
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long userId,
            @RequestParam Long newRoleId) {

        logger.info(">>> UPDATE USER ROLE: userId={}, newRoleId={}", userId, newRoleId);

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
    }

    /**
     * Xóa một người dùng.
     * <p>
     * <strong>Security:</strong> Admin không thể xóa tài khoản của chính mình để tránh
     * tình huống hệ thống không còn admin nào.
     *
     * @param userId ID của người dùng cần xóa.
     * @return {@link ResponseEntity} với HTTP status 204 No Content nếu xóa thành công.
     * @throws IllegalStateException nếu admin cố gắng xóa chính mình.
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        logger.info("DELETE USER REQUEST: {}", userId);

        // Security check: Prevent admin from deleting their own account
        String currentUsername = SecurityUtil.getCurrentUsername()
                .orElseThrow(() -> new AuthenticationRequiredException("Authentication is required"));
        User currentUser = userService.findByUsername(currentUsername);

        if (currentUser.getUserId().equals(userId)) {
            logger.warn("⚠️ Admin '{}' attempted to delete their own account (userId: {}). Operation denied.",
                    currentUsername, userId);
            throw new IllegalStateException("You cannot delete your own account. " +
                    "Please ask another admin to perform this action if needed.");
        }

        logger.info("Admin '{}' is deleting user with ID: {}", currentUsername, userId);

        // Thiết kế: Tầng Service sẽ chịu trách nhiệm xử lý các ràng buộc trước khi xóa.
        // 1. Nếu không tìm thấy người dùng, ném `ResourceNotFoundException` -> 404 Not Found.
        // 2. Nếu người dùng đang có các tài nguyên liên quan (ví dụ: yêu cầu bảo hành),
        //    ném `ResourceInUseException` -> 409 Conflict.
        userService.deleteUser(userId);
        logger.info("Delete user successful: {} (deleted by admin: {})", userId, currentUsername);
        // Thiết kế: Trả về 204 No Content là một best practice cho các thao tác DELETE thành công,
        // báo cho client biết rằng yêu cầu đã được thực hiện và không có nội dung nào để trả về.
        return ResponseEntity.noContent().build();
    }

    /**
     * Đặt lại mật khẩu cho người dùng.
     * Nếu không cung cấp mật khẩu mới, một mật khẩu ngẫu nhiên sẽ được tạo.
     *
     * @param userId      ID của người dùng.
     * @param newPassword Mật khẩu mới (tùy chọn).
     * @return {@link ResponseEntity} chứa mật khẩu mới nếu nó được tạo tự động.
     */
    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<Map<String, Object>> resetUserPassword(
            @PathVariable Long userId,
            @RequestParam(required = false) String newPassword) {

        logger.info("RESET PASSWORD REQUEST: userId={}", userId);

        // Tầng Service sẽ xử lý logic tạo mật khẩu ngẫu nhiên (nếu cần) và mã hóa nó.
        String resetPassword = userService.resetUserPassword(userId, newPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User password reset successfully");
        response.put("userId", userId);

        // Thiết kế: Chỉ trả về mật khẩu mới nếu nó được hệ thống tự động tạo ra.
        // Nếu Admin tự đặt mật khẩu, không cần trả về để tăng tính bảo mật.
        if (newPassword == null || newPassword.trim().isEmpty()) {
            response.put("newPassword", resetPassword);
            response.put("note", "Please share this password securely with the user");
        }

        logger.info("Reset password successful: {}", userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy các thông tin thống kê về người dùng trong hệ thống.
     * @return {@link ResponseEntity} chứa một Map các thông tin thống kê.
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        logger.info("GET USER STATISTICS REQUEST");

        Map<String, Object> statistics = userService.getUserStatistics();

        logger.info("Get statistics successful");
        return ResponseEntity.ok(statistics);
    }
}
