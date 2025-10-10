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
            initializeRoles(); // hàm nay sẽ tạo và lưu các role vào DB bằng cach gọi roleRepository.save()
        }
    }

    private void initializeRoles() {
        // Tạo role Admin
        Role adminRole = new Role();
        adminRole.setRoleName("ADMIN");
        roleRepository.save(adminRole); // Lưu role Admin với ID = 1

        // Tạo role Service Center Staff
        Role scStaffRole = new Role();
        scStaffRole.setRoleName("SC_STAFF");
        roleRepository.save(scStaffRole); // Lưu role SC_STAFF với ID = 2

        // Tạo role Service Center Technician
        Role scTechnicianRole = new Role();
        scTechnicianRole.setRoleName("SC_TECHNICIAN");
        roleRepository.save(scTechnicianRole); // Lưu role SC_TECHNICIAN với ID = 3

        // Tạo role EV Manufacturer Staff
        Role evmStaffRole = new Role();
        evmStaffRole.setRoleName("EVM_STAFF");
        roleRepository.save(evmStaffRole); // Lưu role EVM_STAFF với ID = 4

        // Tạo role Customer
        Role customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        roleRepository.save(customerRole); // Lưu role CUSTOMER với ID = 5

        //System.out.println("Initialized roles: ADMIN (ID=1), SC_STAFF (ID=2), SC_TECHNICIAN (ID=3), EVM_STAFF (ID=4), CUSTOMER (ID=5)");
    }
}
