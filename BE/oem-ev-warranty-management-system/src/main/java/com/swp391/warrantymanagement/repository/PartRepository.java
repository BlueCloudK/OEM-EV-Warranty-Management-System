package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    // Spring Boot đã tự động cung cấp các phương thức CRUD cơ bản
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản
    // Này là Query method, tự động sinh câu truy vấn dựa trên tên phương thức
}

