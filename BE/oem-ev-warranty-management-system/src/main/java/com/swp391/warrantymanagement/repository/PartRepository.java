package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * PartRepository - Data access layer for Part entity
 * Handles CRUD and search operations for standalone parts (NO vehicle associations)
 */
@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    // ============= Basic Search Methods =============
    List<Part> findByPartNameContainingIgnoreCase(String partName);
    List<Part> findByManufacturerContainingIgnoreCase(String manufacturer);
    Part findByPartNumber(String partNumber);

    // ============= Pagination Support Methods =============
    Page<Part> findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
        String partName, String manufacturer, Pageable pageable);

    Page<Part> findByManufacturerContainingIgnoreCase(String manufacturer, Pageable pageable);

    Page<Part> findByPartNameContainingIgnoreCase(String partName, Pageable pageable);

    // ============= Custom Query Methods =============
    @Query("SELECT p FROM Part p WHERE " +
           "(:partName IS NULL OR LOWER(p.partName) LIKE LOWER(CONCAT('%', :partName, '%'))) AND " +
           "(:manufacturer IS NULL OR LOWER(p.manufacturer) LIKE LOWER(CONCAT('%', :manufacturer, '%'))) AND " +
           "(:partNumber IS NULL OR p.partNumber = :partNumber)")
    List<Part> findByMultipleCriteria(
        @Param("partName") String partName,
        @Param("manufacturer") String manufacturer,
        @Param("partNumber") String partNumber);
}
