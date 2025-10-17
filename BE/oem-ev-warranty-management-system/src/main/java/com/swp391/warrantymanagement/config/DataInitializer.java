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
}
