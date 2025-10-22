package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.ServiceCenter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * ServiceCenterRepository - Data access layer for ServiceCenter entity
 */
@Repository
public interface ServiceCenterRepository extends JpaRepository<ServiceCenter, Long> {

    // Find by name (contains, case-insensitive)
    Page<ServiceCenter> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Find by phone
    Optional<ServiceCenter> findByPhone(String phone);

    // Find by address (contains, case-insensitive)
    Page<ServiceCenter> findByAddressContainingIgnoreCase(String address, Pageable pageable);

    // Search by name or address
    @Query("SELECT sc FROM ServiceCenter sc WHERE " +
           "LOWER(sc.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sc.address) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<ServiceCenter> searchByNameOrAddress(@Param("search") String search, Pageable pageable);

    // Find service centers near a location (within radius in kilometers)
    // Using Haversine formula to calculate distance
    @Query("SELECT sc FROM ServiceCenter sc WHERE " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(sc.latitude)) * " +
           "cos(radians(sc.longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(sc.latitude)))) <= :radiusKm")
    List<ServiceCenter> findServiceCentersNearLocation(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") double radiusKm);

    // Get all service centers ordered by distance from a location
    @Query(value = "SELECT *, " + // Dùng SELECT * (hoặc sc.*)
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(sc.latitude)) * " +
            "cos(radians(sc.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(sc.latitude)))) as distance " +
            "FROM service_center sc " + // Tên bảng thực tế trong DB
            "ORDER BY distance ASC", // Bây giờ có thể dùng 'distance'
            nativeQuery = true) // <-- ĐÁNH DẤU LÀ NATIVE QUERY
    List<Object[]> findAllOrderedByDistanceFrom(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude);

    // Count staff in service center
    @Query("SELECT COUNT(u) FROM User u WHERE u.serviceCenter.serviceCenterId = :serviceCenterId")
    Long countStaffByServiceCenter(@Param("serviceCenterId") Long serviceCenterId);

    // Count claims in service center
    @Query("SELECT COUNT(wc) FROM WarrantyClaim wc WHERE wc.serviceCenter.serviceCenterId = :serviceCenterId")
    Long countClaimsByServiceCenter(@Param("serviceCenterId") Long serviceCenterId);

    // Count active claims (not COMPLETED or REJECTED)
    @Query("SELECT COUNT(wc) FROM WarrantyClaim wc WHERE wc.serviceCenter.serviceCenterId = :serviceCenterId " +
           "AND wc.status NOT IN ('COMPLETED', 'REJECTED')")
    Long countActiveClaimsByServiceCenter(@Param("serviceCenterId") Long serviceCenterId);

    // Check if phone exists (for validation, excluding specific ID)
    @Query("SELECT CASE WHEN COUNT(sc) > 0 THEN true ELSE false END FROM ServiceCenter sc " +
           "WHERE sc.phone = :phone AND sc.serviceCenterId != :excludeId")
    boolean existsByPhoneAndIdNot(@Param("phone") String phone, @Param("excludeId") Long excludeId);

    // Check if phone exists (for validation on create)
    boolean existsByPhone(String phone);
}
