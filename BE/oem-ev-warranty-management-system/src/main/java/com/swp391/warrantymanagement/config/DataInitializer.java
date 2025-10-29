package com.swp391.warrantymanagement.config;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.repository.RoleRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Khởi tạo dữ liệu ban đầu cho hệ thống
 * - Tạo các Role cơ bản
 * - Tạo tài khoản Admin mặc định
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        // Lấy role ADMIN
        Role adminRole = roleRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));

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
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

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
