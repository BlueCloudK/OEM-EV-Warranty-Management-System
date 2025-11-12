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

/**
 * Repository để quản lý ServiceHistory
 * - Lịch sử bảo dưỡng/sửa chữa xe
 * - Tìm theo xe, customer, loại dịch vụ, thời gian
 */
@Repository
public interface ServiceHistoryRepository extends JpaRepository<ServiceHistory, Long> {
    // Tìm theo loại dịch vụ
    List<ServiceHistory> findByServiceTypeContainingIgnoreCase(String serviceType);
    Page<ServiceHistory> findByServiceTypeContainingIgnoreCase(String serviceType, Pageable pageable);

    // Tìm theo xe
    Page<ServiceHistory> findByVehicleVehicleId(Long vehicleId, Pageable pageable);

    // Tìm theo part (qua ServiceHistoryDetail)
    Page<ServiceHistory> findByServiceHistoryDetailsPartPartId(String partId, Pageable pageable);

    // Tìm theo customer (qua Vehicle)
    Page<ServiceHistory> findByVehicleCustomerCustomerId(UUID customerId, Pageable pageable);

    // Tìm theo khoảng thời gian
    Page<ServiceHistory> findByServiceDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * Tìm kiếm chung service history theo serviceType, description, vehicleName, hoặc VIN (case-insensitive).
     * Join với Vehicle để search trong vehicle information.
     * @param searchTerm Từ khóa tìm kiếm.
     * @param pageable Thông tin phân trang.
     * @return Một trang các ServiceHistory thỏa mãn điều kiện.
     */
    @Query("SELECT sh FROM ServiceHistory sh LEFT JOIN sh.vehicle v WHERE " +
            "LOWER(sh.serviceType) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(sh.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(v.vehicleName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(v.vehicleVin) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<ServiceHistory> searchServiceHistoriesGeneral(@Param("searchTerm") String searchTerm, Pageable pageable);

}
