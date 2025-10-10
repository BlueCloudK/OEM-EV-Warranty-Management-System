package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface PartRepository extends JpaRepository<Part, String> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với String ID

    // ============= Basic Search Methods =============
    List<Part> findByPartNameContainingIgnoreCase(String partName);
    List<Part> findByManufacturerContainingIgnoreCase(String manufacturer);
    List<Part> findByVehicleVehicleId(Long vehicleId);
    List<Part> findByPartId(String partId);

    // ============= Pagination Support Methods =============
    // Phương thức tìm kiếm với phân trang và sắp xếp
    Page<Part> findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
        String partName, String manufacturer, Pageable pageable);

    // Tìm kiếm parts theo vehicleId với phân trang
    Page<Part> findByVehicleVehicleId(Long vehicleId, Pageable pageable);

    // Tìm kiếm parts theo partName hoặc manufacturer với phân trang
    Page<Part> findByManufacturerContainingIgnoreCase(String manufacturer, Pageable pageable);

    // Warranty-related methods (using actual field name from Part entity)
    Page<Part> findByWarrantyExpirationDateBefore(Date date, Pageable pageable);
    Page<Part> findByWarrantyExpirationDateBetween(Date startDate, Date endDate, Pageable pageable);

    // ============= Custom Query Methods =============
    // Custom query với JOIN FETCH để tối ưu hiệu suất - giữ nguyên vì dùng @Query
    @Query("SELECT p FROM Part p JOIN FETCH p.vehicle v WHERE v.vehicleId = :vehicleId")
    List<Part> findByVehicleIdWithVehicle(@Param("vehicleId") Long vehicleId);

    // Tìm kiếm parts theo nhiều tiêu chí với @Query và @Param để tránh SQL Injection và hỗ trợ null parameters
    @Query("SELECT p FROM Part p WHERE " +
           "(:partName IS NULL OR LOWER(p.partName) LIKE LOWER(CONCAT('%', :partName, '%'))) AND " +
           "(:manufacturer IS NULL OR LOWER(p.manufacturer) LIKE LOWER(CONCAT('%', :manufacturer, '%'))) AND " +
           "(:vehicleId IS NULL OR p.vehicle.vehicleId = :vehicleId) AND " +
           "(:partNumber IS NULL OR p.partNumber = :partNumber)")
    List<Part> findByPartNameAndManufacturer(@Param("partName") String partName, @Param("manufacturer") String manufacturer,
                                             @Param("vehicleId") Long vehicleId, @Param("partNumber") String partNumber);
}
