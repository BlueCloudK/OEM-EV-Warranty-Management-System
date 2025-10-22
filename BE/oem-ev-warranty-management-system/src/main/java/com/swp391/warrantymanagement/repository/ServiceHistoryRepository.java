package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.ServiceHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceHistoryRepository extends JpaRepository<ServiceHistory, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với Long ID

    // ============= Basic Search Methods =============
    // Tìm kiếm theo loại dịch vụ (serviceType)
    List<ServiceHistory> findByServiceTypeContainingIgnoreCase(String serviceType);

    // ============= Pagination Support Methods =============
    // Tìm kiếm theo loại dịch vụ (serviceType)
    Page<ServiceHistory> findByServiceTypeContainingIgnoreCase(String serviceType, Pageable pageable);

    // Tìm kiếm theo xe, phụ tùng, khách hàng
    Page<ServiceHistory> findByVehicleVehicleId(Long vehicleId, Pageable pageable);
    Page<ServiceHistory> findByServiceHistoryDetailsPartPartId(String partId, Pageable pageable);
    Page<ServiceHistory> findByVehicleCustomerCustomerId(UUID customerId, Pageable pageable);

    // Tìm kiếm theo khoảng thời gian
    Page<ServiceHistory> findByServiceDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

}
