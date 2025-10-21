package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.InstalledPart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * InstalledPartRepository - Data access layer for InstalledPart entity
 * Handles queries for parts installed on specific vehicles
 */
@Repository
public interface InstalledPartRepository extends JpaRepository<InstalledPart, String> {
    // Find all installed parts for a specific vehicle
    List<InstalledPart> findByVehicleVehicleId(Long vehicleId);
    Page<InstalledPart> findByVehicleVehicleId(Long vehicleId, Pageable pageable);

    // Find all installations of a specific part
    List<InstalledPart> findByPartPartId(String partId);
    Page<InstalledPart> findByPartPartId(String partId, Pageable pageable);

    // Find installed parts with warranty expiring soon
    Page<InstalledPart> findByWarrantyExpirationDateBefore(LocalDate date, Pageable pageable);
    Page<InstalledPart> findByWarrantyExpirationDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    // Find installed parts by vehicle and warranty status
    @Query("SELECT ip FROM InstalledPart ip WHERE ip.vehicle.vehicleId = :vehicleId " +
           "AND ip.warrantyExpirationDate > :currentDate")
    List<InstalledPart> findActiveWarrantiesByVehicle(
        @Param("vehicleId") Long vehicleId,
        @Param("currentDate") LocalDate currentDate);

    // Find installed parts by installation date range
    Page<InstalledPart> findByInstallationDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    // Custom query for detailed search
    @Query("SELECT ip FROM InstalledPart ip " +
           "WHERE (:vehicleId IS NULL OR ip.vehicle.vehicleId = :vehicleId) " +
           "AND (:partId IS NULL OR ip.part.partId = :partId) " +
           "AND (:hasActiveWarranty IS NULL OR " +
           "     (CASE WHEN :hasActiveWarranty = true THEN ip.warrantyExpirationDate > :currentDate " +
           "           ELSE ip.warrantyExpirationDate <= :currentDate END))")
    Page<InstalledPart> findByMultipleCriteria(
        @Param("vehicleId") Long vehicleId,
        @Param("partId") String partId,
        @Param("hasActiveWarranty") Boolean hasActiveWarranty,
        @Param("currentDate") LocalDate currentDate,
        Pageable pageable);
}
