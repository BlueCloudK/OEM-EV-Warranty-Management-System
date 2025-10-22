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
    Page<InstalledPart> findByVehicleVehicleId(Long vehicleId, Pageable pageable);

    // Find all installations of a specific part
    Page<InstalledPart> findByPartPartId(String partId, Pageable pageable);

    // Find installed parts with warranty expiring soon
    Page<InstalledPart> findByWarrantyExpirationDateBefore(LocalDate date, Pageable pageable);

    // Find installed part by vehicle and part (for warranty claim validation)
    @Query("SELECT ip FROM InstalledPart ip WHERE ip.vehicle.vehicleId = :vehicleId AND ip.part.partId = :partId")
    List<InstalledPart> findByVehicleAndPart(@Param("vehicleId") Long vehicleId, @Param("partId") String partId);

}
