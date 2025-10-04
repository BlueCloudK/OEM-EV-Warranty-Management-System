package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceHistoryRepository extends JpaRepository<ServiceHistory, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với Long ID

    // Derived query methods - Spring tự động tạo queries
    List<ServiceHistory> findByServiceTypeContainingIgnoreCase(String serviceType);

    // Đổi tên để match field thật trong entity Part (part.partId)
    List<ServiceHistory> findByPartPartId(String partId);

    List<ServiceHistory> findByVehicleVehicleId(Long vehicleId);

    // Custom query với JOIN FETCH để tối ưu hiệu suất
    @Query("SELECT sh FROM ServiceHistory sh JOIN FETCH sh.part p WHERE p.partId = :partId")
    List<ServiceHistory> findByPartIdWithPart(@Param("partId") String partId);

    @Query("SELECT sh FROM ServiceHistory sh JOIN FETCH sh.vehicle v WHERE v.vehicleId = :vehicleId")
    List<ServiceHistory> findByVehicleIdWithVehicle(@Param("vehicleId") Long vehicleId);
}
