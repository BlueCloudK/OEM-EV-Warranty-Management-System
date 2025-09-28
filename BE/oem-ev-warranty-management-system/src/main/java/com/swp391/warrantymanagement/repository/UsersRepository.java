package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản
}

