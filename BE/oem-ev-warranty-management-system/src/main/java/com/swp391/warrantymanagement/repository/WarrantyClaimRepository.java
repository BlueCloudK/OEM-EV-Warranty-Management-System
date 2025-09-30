package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarrantyClaimRepository extends JpaRepository<WarrantyClaim, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với Long ID

}
