package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với Long ID
    User findByUsername(String username);
}
