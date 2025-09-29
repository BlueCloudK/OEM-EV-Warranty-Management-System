package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> { // JPA Repository interface cần 2 tham số: Entity và kiểu dữ liệu của khóa chính (ID)
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản
    // Này là Query method, tự động sinh câu truy vấn dựa trên tên phương thức
}

