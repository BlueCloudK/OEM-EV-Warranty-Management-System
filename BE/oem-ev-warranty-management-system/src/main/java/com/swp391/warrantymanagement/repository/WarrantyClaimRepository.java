package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WarrantyClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarrantyClaimRepository extends JpaRepository<WarrantyClaim, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với Long ID

    // Derived query methods - Spring automatically generates queries
    List<WarrantyClaim> findByStatus(WarrantyClaimStatus status);

    // Sửa từ findByVehicleId thành findByVehicleVehicleId để match với WarrantyClaim.vehicle.vehicleId
    List<WarrantyClaim> findByVehicleVehicleId(Long vehicleId);
}
