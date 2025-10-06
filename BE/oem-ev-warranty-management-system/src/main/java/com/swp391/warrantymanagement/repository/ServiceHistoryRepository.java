package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceHistoryRepository extends JpaRepository<ServiceHistory, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với Long ID

    // ============= Basic Search Methods =============
    List<ServiceHistory> findByServiceTypeContainingIgnoreCase(String serviceType);
    List<ServiceHistory> findByPartPartId(String partId);
    List<ServiceHistory> findByVehicleVehicleId(Long vehicleId);

    // ============= Pagination Support Methods =============
    // Basic pagination methods
    Page<ServiceHistory> findByServiceTypeContainingIgnoreCase(String serviceType, Pageable pageable);

    // Search methods with pagination
    Page<ServiceHistory> findByServiceTypeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String serviceType, String description, Pageable pageable);

    Page<ServiceHistory> findByVehicleVehicleId(Long vehicleId, Pageable pageable);
    Page<ServiceHistory> findByPartPartId(String partId, Pageable pageable);
    Page<ServiceHistory> findByVehicleCustomerCustomerId(UUID customerId, Pageable pageable);

    // Date range search
    Page<ServiceHistory> findByServiceDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    // ============= Custom Query Methods =============
    // Custom query với JOIN FETCH để tối ưu hiệu suất
    @Query("SELECT sh FROM ServiceHistory sh JOIN FETCH sh.part p WHERE p.partId = :partId")
    List<ServiceHistory> findByPartIdWithPart(@Param("partId") String partId);

    @Query("SELECT sh FROM ServiceHistory sh JOIN FETCH sh.vehicle v WHERE v.vehicleId = :vehicleId")
    List<ServiceHistory> findByVehicleIdWithVehicle(@Param("vehicleId") Long vehicleId);
}
