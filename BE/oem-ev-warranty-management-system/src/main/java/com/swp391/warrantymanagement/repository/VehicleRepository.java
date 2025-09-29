package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản
    // Này là Query method, tự động sinh câu truy vấn dựa trên tên phương thức
}

