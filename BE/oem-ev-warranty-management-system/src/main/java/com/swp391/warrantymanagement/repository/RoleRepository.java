package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository để quản lý Role
 * - Tìm role theo tên (ROLE_ADMIN, ROLE_CUSTOMER, etc.)
 * - Dùng cho authentication và phân quyền
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Tìm role theo tên (VD: "ROLE_ADMIN", "ROLE_CUSTOMER")
    Optional<Role> findByRoleName(String roleName);
}
