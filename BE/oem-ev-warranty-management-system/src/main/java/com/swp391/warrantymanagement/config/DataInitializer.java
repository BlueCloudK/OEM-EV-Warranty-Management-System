package com.swp391.warrantymanagement.config;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Khởi tạo dữ liệu ban đầu cho hệ thống
 * - Tạo các Role cơ bản
 * - Tạo tài khoản Admin mặc định
 */
@Component
@RequiredArgsConstructor // REFACTOR: Sử dụng Lombok để tạo constructor, thay thế cho @Autowired
public class DataInitializer implements CommandLineRunner {

    // REFACTOR: Chuyển sang constructor injection, các dependency là final để đảm bảo bất biến.
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Khởi tạo roles nếu chưa có
        if (roleRepository.count() == 0) {
            initializeRoles();
        }

        // Khởi tạo admin nếu chưa có user admin
        if (userRepository.findByUsername("admin").isEmpty()) {
            initializeAdminUser();
        }

        // Khởi tạo các tài khoản mẫu cho testing
        initializeSampleUsers();
    }

    private void initializeRoles() {
        String[] roleNames = {"ADMIN", "SC_STAFF", "SC_TECHNICIAN", "EVM_STAFF", "CUSTOMER"};

        for (String roleName : roleNames) {
            Role role = new Role();
            role.setRoleName(roleName);
            roleRepository.save(role);
        }

        System.out.println("Initialized 5 roles successfully");
    }

    private void initializeAdminUser() {
        // REFACTOR: Tìm role bằng tên thay vì ID cứng để đảm bảo an toàn và linh hoạt.
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                // REFACTOR: Sử dụng IllegalStateException để báo hiệu lỗi khởi tạo nghiêm trọng.
                .orElseThrow(() -> new IllegalStateException("Required 'ADMIN' role not found during initialization."));

        // Tạo admin user với password đơn giản
        User adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@warranty.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setAddress("System Administrator");
        adminUser.setRole(adminRole);

        userRepository.save(adminUser);

        System.out.println("Default admin created: username=admin, password=admin123");
    }

    /**
     * Khởi tạo các tài khoản mẫu cho testing
     * Password: 1234567 cho tất cả các tài khoản
     */
    private void initializeSampleUsers() {
        System.out.println("===== Initializing Sample Users =====");

        // EVM Staff 1
        createUserIfNotExists("evm1", "evm1@example.com", "1234567", "EVM_STAFF", "EVM Headquarters");

        // SC Staff 1
        createUserIfNotExists("scstaff1", "scstaff1@example.com", "1234567", "SC_STAFF", "Service Center Branch 1");

        // SC Technician 1
        createUserIfNotExists("tech1", "tech1@example.com", "1234567", "SC_TECHNICIAN", "Service Center Workshop");

        System.out.println("===== Sample Users Initialization Complete =====");
    }

    /**
     * Helper method để tạo user nếu chưa tồn tại
     */
    private void createUserIfNotExists(String username, String email, String password, String roleName, String address) {
        // Kiểm tra user đã tồn tại chưa
        if (userRepository.findByUsername(username).isPresent()) {
            System.out.println("⏭️  User '" + username + "' already exists, skipping...");
            return;
        }

        // Tìm role theo tên
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new IllegalStateException("Required '" + roleName + "' role not found during initialization."));

        // Tạo user mới
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setAddress(address);
        user.setRole(role);

        userRepository.save(user);
        System.out.println("✅ Created sample user: " + username + " (Role: " + roleName + ", Password: " + password + ")");
    }
}
