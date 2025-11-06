package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.response.UserProfileResponseDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.exception.DuplicateResourceException;
import com.swp391.warrantymanagement.exception.ResourceInUseException;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.WarrantyClaimMapper;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.TokenRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
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
import java.util.stream.Collectors;

/**
 * Implementation của UserService - quản lý users trong hệ thống (admin operations).
 * <p>
 * <strong>Security features:</strong>
 * <ul>
 *     <li>BCrypt password encoding</li>
 *     <li>Token cleanup on delete</li>
 *     <li>Unique constraints validation (username, email)</li>
 *     <li>SecureRandom password generation</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    // SLF4J Logger cho audit trail
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    // Repository dependencies
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder; // BCrypt encoder
    private final WarrantyClaimRepository warrantyClaimRepository;

    /**
     * Lấy danh sách users với phân trang, search và role filter.
     * <p>
     * Kết quả luôn được sort theo createdAt DESC (newest first).
     *
     * @param pageable Thông tin phân trang (page, size)
     * @param search Từ khóa tìm kiếm theo username (optional)
     * @param role Filter theo role name (optional)
     * @return Page chứa danh sách User
     */
    @Override
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable, String search, String role) {
        logger.info("Getting all users with search: {}, role: {}", search, role);

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        if ((search != null && !search.trim().isEmpty()) || (role != null && !role.trim().isEmpty())) {
            return getUsersWithFilter(search, role, sortedPageable);
        }

        return userRepository.findAll(sortedPageable);
    }

    /**
     * Helper method xử lý filter logic (search và/hoặc role).
     * <p>
     * <strong>Note:</strong> Combined filter (search + role) hiện tại chỉ filter theo role.
     * TODO: Implement combined filter với custom query.
     */
    private Page<User> getUsersWithFilter(String search, String role, Pageable pageable) {
        if (search != null && !search.trim().isEmpty() && role != null && !role.trim().isEmpty()) {
            Role roleEntity = roleRepository.findByRoleName(role.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", role));

            // TODO: Implement combined filter (search + role)
            return userRepository.findByRole(roleEntity, pageable);
        }
        else if (search != null && !search.trim().isEmpty()) {
            return userRepository.findByUsernameContainingIgnoreCase(search.trim(), pageable);
        }
        else if (role != null && !role.trim().isEmpty()) {
            Role roleEntity = roleRepository.findByRoleName(role.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", role));
            return userRepository.findByRole(roleEntity, pageable);
        }

        return userRepository.findAll(pageable);
    }

    /**
     * Lấy thông tin user theo ID.
     *
     * @param userId ID của user cần lấy
     * @return User entity
     * @throws ResourceNotFoundException nếu không tìm thấy user
     */
    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        logger.info("Getting user by id: {}", userId);

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    /**
     * Tìm kiếm user theo username (case-insensitive partial match).
     * <p>
     * Kết quả được sort theo username ASC (A-Z).
     *
     * @param username Từ khóa tìm kiếm
     * @param pageable Thông tin phân trang
     * @return Page chứa danh sách User khớp với username
     * @throws IllegalArgumentException nếu username trống
     */
    @Override
    @Transactional(readOnly = true)
    public Page<User> searchByUsername(String username, Pageable pageable) {
        logger.info("Searching users by username: {}", username);

        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username search parameter cannot be empty");
        }

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "username")
        );

        return userRepository.findByUsernameContainingIgnoreCase(username.trim(), sortedPageable);
    }

    /**
     * Lấy danh sách user theo role.
     * <p>
     * Kết quả được sort theo username ASC (A-Z).
     *
     * @param roleName Tên role (vd: "ROLE_ADMIN")
     * @param pageable Thông tin phân trang
     * @return Page chứa danh sách User có role tương ứng
     * @throws IllegalArgumentException nếu roleName trống
     * @throws ResourceNotFoundException nếu không tìm thấy role
     */
    @Override
    @Transactional(readOnly = true)
    public Page<User> getUsersByRole(String roleName, Pageable pageable) {
        logger.info("Getting users by role: {}", roleName);

        if (roleName == null || roleName.trim().isEmpty()) {
            throw new IllegalArgumentException("Role name cannot be empty");
        }

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "username")
        );

        Role role = roleRepository.findByRoleName(roleName.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

        return userRepository.findByRole(role, sortedPageable);
    }

    /**
     * Cập nhật thông tin user với partial update support.
     * <p>
     * Hỗ trợ dynamic update pattern - chỉ update các fields có trong request.
     * Validate unique constraints (username, email) trước khi update.
     *
     * @param userId        ID của user cần update
     * @param updateRequest Map chứa các fields cần update (username, email, address)
     * @return User entity đã được cập nhật
     * @throws ResourceNotFoundException   nếu user không tồn tại
     * @throws DuplicateResourceException  nếu username hoặc email đã được sử dụng
     */
    @Override
    public User updateUser(Long userId, Map<String, Object> updateRequest) {
        logger.info("Updating user: {} with data: {}", userId, updateRequest);

        User user = getUserById(userId);

        if (updateRequest.containsKey("username")) {
            String newUsername = (String) updateRequest.get("username");
            if (newUsername != null && !newUsername.trim().isEmpty()) {
                if (userRepository.existsByUsername(newUsername) && !user.getUsername().equals(newUsername)) {
                    throw new DuplicateResourceException("User", "username", newUsername);
                }
                user.setUsername(newUsername.trim());
            }
        }

        if (updateRequest.containsKey("email")) {
            String newEmail = (String) updateRequest.get("email");
            if (newEmail != null && !newEmail.trim().isEmpty()) {
                if (userRepository.existsByEmail(newEmail) && !user.getEmail().equals(newEmail)) {
                    throw new DuplicateResourceException("User", "email", newEmail);
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

    /**
     * Cập nhật role của user.
     * <p>
     * <strong>Lưu ý:</strong> Permissions thay đổi ngay lập tức trong database,
     * nhưng user cần login lại để JWT token được refresh với role mới.
     *
     * @param userId    ID của user cần thay đổi role
     * @param newRoleId ID của role mới
     * @return User entity với role đã được cập nhật
     * @throws ResourceNotFoundException nếu user hoặc role không tồn tại
     */
    @Override
    public User updateUserRole(Long userId, Long newRoleId) {
        logger.info("Updating user role: userId={}, newRoleId={}", userId, newRoleId);

        User user = getUserById(userId);

        Role newRole = roleRepository.findById(newRoleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", newRoleId));

        user.setRole(newRole);

        return userRepository.save(user);
    }

    /**
     * Xóa user khỏi hệ thống.
     * <p>
     * Thực hiện các bước:
     * <ul>
     * <li>Kiểm tra user có warranty claims được assigned hay không</li>
     * <li>Xóa tất cả tokens (refresh tokens, reset tokens) của user</li>
     * <li>Xóa user khỏi database (hard delete)</li>
     * </ul>
     * <p>
     * <strong>Lưu ý:</strong> Hiện tại sử dụng hard delete. Production nên cân nhắc
     * implement soft delete để giữ audit trail.
     *
     * @param userId ID của user cần xóa
     * @throws ResourceNotFoundException nếu user không tồn tại
     * @throws ResourceInUseException    nếu user đang có warranty claims được assigned
     */
    @Override
    public void deleteUser(Long userId) {
        logger.info("Deleting user: {}", userId);

        User user = getUserById(userId);

        if (warrantyClaimRepository.existsByAssignedTo((user))) {
            throw new ResourceInUseException("Cannot delete user '" + user.getUsername() + "' because they have one or more assigned warranty claims.");
        }

        logger.info("Deleting all tokens for user: {}", userId);
        tokenRepository.deleteByUser(user);

        logger.warn("Performing hard delete for user: {} (consider implementing soft delete)", userId);
        userRepository.delete(user);
    }

    /**
     * Reset password cho user.
     * <p>
     * Hỗ trợ 2 modes:
     * <ul>
     * <li><strong>Manual mode:</strong> Admin cung cấp password mới</li>
     * <li><strong>Auto-generate mode:</strong> System tự động tạo random password (12 ký tự)</li>
     * </ul>
     * <p>
     * <strong>Security note:</strong> Plain password chỉ được return 1 lần.
     * Admin cần gửi password cho user qua secure channel và user nên đổi password sau khi login.
     *
     * @param userId      ID của user cần reset password
     * @param newPassword Password mới (có thể null để auto-generate)
     * @return Plain text password để admin gửi cho user
     * @throws ResourceNotFoundException nếu user không tồn tại
     */
    @Override
    public String resetUserPassword(Long userId, String newPassword) {
        logger.info("Resetting password for user: {}", userId);

        User user = getUserById(userId);

        String passwordToSet;
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            passwordToSet = newPassword.trim();
        } else {
            passwordToSet = generateRandomPassword();
        }

        String encodedPassword = passwordEncoder.encode(passwordToSet);

        user.setPassword(encodedPassword);
        userRepository.save(user);

        return passwordToSet;
    }

    /**
     * Lấy user statistics cho admin dashboard.
     * <p>
     * Thống kê bao gồm:
     * <ul>
     * <li><strong>totalUsers:</strong> Tổng số users trong hệ thống</li>
     * <li><strong>activeUsers/inactiveUsers:</strong> Phân loại users theo trạng thái (hiện tại tất cả = active)</li>
     * <li><strong>usersByRole:</strong> Số lượng users theo từng role</li>
     * <li><strong>recentRegistrations:</strong> 10 users đăng ký gần nhất</li>
     * </ul>
     *
     * @return Map chứa các thống kê về users
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics() {
        logger.info("Getting user statistics");

        Map<String, Object> statistics = new HashMap<>();

        long totalUsers = userRepository.count();
        statistics.put("totalUsers", totalUsers);

        statistics.put("activeUsers", totalUsers);
        statistics.put("inactiveUsers", 0);

        Map<String, Long> usersByRole = new HashMap<>();
        List<Role> allRoles = roleRepository.findAll();

        for (Role role : allRoles) {
            long count = userRepository.countByRole(role);
            usersByRole.put(role.getRoleName(), count);
        }
        statistics.put("usersByRole", usersByRole);

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
     * Lấy complete user profile với thông tin chi tiết và relationships.
     * <p>
     * Profile bao gồm:
     * <ul>
     * <li><strong>Basic info:</strong> userId, username, email, address, createdAt</li>
     * <li><strong>Role info:</strong> roleName, roleId</li>
     * <li><strong>Service Center info:</strong> serviceCenterId, name, address (chỉ cho SC_STAFF)</li>
     * <li><strong>Assigned claims:</strong> Danh sách warranty claims được assign (cho EVM_STAFF, SC_STAFF)</li>
     * <li><strong>Work logs:</strong> Tổng số work log entries</li>
     * </ul>
     *
     * @param userId ID của user cần lấy profile
     * @return UserProfileResponseDTO chứa đầy đủ thông tin user
     * @throws ResourceNotFoundException nếu user không tồn tại
     */
    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserFullProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserProfileResponseDTO profile = new UserProfileResponseDTO();

        profile.setUserId(user.getUserId());
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setAddress(user.getAddress());
        profile.setCreatedAt(user.getCreatedAt());

        if (user.getRole() != null) {
            profile.setRoleName(user.getRole().getRoleName());
            profile.setRoleId(user.getRole().getRoleId());
        }

        if (user.getServiceCenter() != null) {
            profile.setServiceCenterId(user.getServiceCenter().getServiceCenterId());
            profile.setServiceCenterName(user.getServiceCenter().getName());
            profile.setServiceCenterAddress(user.getServiceCenter().getAddress());
        }

        List<WarrantyClaimResponseDTO> assignedClaims = warrantyClaimRepository
                .findByAssignedToUserId(userId, Pageable.unpaged())
                .getContent().stream()
                .map(WarrantyClaimMapper::toResponseDTO)
                .collect(Collectors.toList());

        profile.setAssignedClaims(assignedClaims);
        profile.setTotalAssignedClaims(assignedClaims.size());

        profile.setTotalWorkLogs(user.getWorkLogs() != null ? user.getWorkLogs().size() : 0);

        return profile;
    }

    /**
     * Generate random password cho password reset.
     * <p>
     * Tạo password 12 ký tự với character set bao gồm:
     * uppercase letters, lowercase letters, digits, và special characters (!@#$%^&*).
     * Sử dụng SecureRandom để đảm bảo tính cryptographically strong.
     *
     * @return Random password string (12 characters)
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

    /**
     * Tìm user theo username.
     *
     * @param username Username cần tìm
     * @return User entity
     * @throws ResourceNotFoundException nếu user không tồn tại
     */
    @Override
    public User findByUsername(String username) {
        logger.info("Finding user by username: {}", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}
