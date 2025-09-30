package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartRepository extends JpaRepository<Part, String> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với String ID
}
