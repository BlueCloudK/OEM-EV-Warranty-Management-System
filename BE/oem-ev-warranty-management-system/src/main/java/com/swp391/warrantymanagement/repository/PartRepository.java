package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository để quản lý Part (catalog linh kiện)
 * - Tìm theo tên, nhà sản xuất, part number
 * - Part number là unique identifier
 */
@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    // Tìm theo tên part
    List<Part> findByPartNameContainingIgnoreCase(String partName);
    Page<Part> findByPartNameContainingIgnoreCase(String partName, Pageable pageable);

    // Tìm theo nhà sản xuất
    List<Part> findByManufacturerContainingIgnoreCase(String manufacturer);
    Page<Part> findByManufacturerContainingIgnoreCase(String manufacturer, Pageable pageable);

    /**
     * Tìm một Part duy nhất theo partNumber (unique).
     * REFACTOR: Trả về Optional<Part> thay vì Part.
     * - Lý do: Đây là cách làm an toàn và hiện đại, giúp tránh NullPointerException ở tầng service.
     * - Service sẽ phải xử lý trường hợp "không tìm thấy" một cách tường minh.
     */
    Optional<Part> findByPartNumber(String partNumber);

    // Tìm kiếm kết hợp tên hoặc nhà sản xuất
    Page<Part> findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
        String partName, String manufacturer, Pageable pageable);


    // ============= Custom Query Methods =============
    @Query("SELECT p FROM Part p WHERE " +
           "(:partName IS NULL OR LOWER(p.partName) LIKE LOWER(CONCAT('%', :partName, '%'))) AND " +
           "(:manufacturer IS NULL OR LOWER(p.manufacturer) LIKE LOWER(CONCAT('%', :manufacturer, '%'))) AND " +
           "(:partNumber IS NULL OR p.partNumber = :partNumber)")
    List<Part> findByMultipleCriteria(
        @Param("partName") String partName,
        @Param("manufacturer") String manufacturer,
        @Param("partNumber") String partNumber);

    boolean existsByPartNumber(String partNumber);

    /**
     * Tìm kiếm chung part theo name, manufacturer, hoặc partNumber (case-insensitive).
     * Sử dụng COALESCE để xử lý null values an toàn.
     * @param searchTerm Từ khóa tìm kiếm.
     * @param pageable Thông tin phân trang.
     * @return Một trang các Part thỏa mãn điều kiện.
     */
    @Query("SELECT p FROM Part p WHERE " +
            "LOWER(COALESCE(p.partName, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(p.manufacturer, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(p.partNumber, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Part> searchPartsGeneral(@Param("searchTerm") String searchTerm, Pageable pageable);
}
