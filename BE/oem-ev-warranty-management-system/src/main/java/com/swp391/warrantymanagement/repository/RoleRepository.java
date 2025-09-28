package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    // Spring Boot đã tự động cung cấp các phương thức CRUD cơ bản
}
