package com.swp391.warrantymanagement.config;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Khởi tạo dữ liệu ban đầu cho hệ thống
 * - Tạo các Role cơ bản
 * - Chạy sau khi ứng dụng start up
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có role chưa, nếu chưa thì tạo
        if (roleRepository.count() == 0) {
            initializeRoles();
        }
    }

    private void initializeRoles() {
        // Tạo role Admin
        Role adminRole = new Role();
        adminRole.setRoleName("ADMIN");
        roleRepository.save(adminRole);

        // Tạo role Service Center Staff
        Role scStaffRole = new Role();
        scStaffRole.setRoleName("SC_STAFF");
        roleRepository.save(scStaffRole);

        // Tạo role Service Center Technician
        Role scTechnicianRole = new Role();
        scTechnicianRole.setRoleName("SC_TECHNICIAN");
        roleRepository.save(scTechnicianRole);

        // Tạo role EV Manufacturer Staff
        Role evmStaffRole = new Role();
        evmStaffRole.setRoleName("EVM_STAFF");
        roleRepository.save(evmStaffRole);

        // Tạo role Customer
        Role customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        roleRepository.save(customerRole);

        System.out.println("Initialized roles: ADMIN (ID=1), SC_STAFF (ID=2), SC_TECHNICIAN (ID=3), EVM_STAFF (ID=4), CUSTOMER (ID=5)");
    }
}
