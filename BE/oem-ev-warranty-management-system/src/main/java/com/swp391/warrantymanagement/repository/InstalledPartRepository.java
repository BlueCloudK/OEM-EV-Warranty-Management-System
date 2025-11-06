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
 * Repository for managing InstalledParts (parts installed in a vehicle).
 * - Find installed parts by vehicle, part, warranty expiration.
 * - Used for warranty checks.
 */
@Repository
public interface InstalledPartRepository extends JpaRepository<InstalledPart, Long> {
    // Find all parts installed in a specific vehicle
    Page<InstalledPart> findByVehicleVehicleId(Long vehicleId, Pageable pageable);

    // Find all installations of a specific part
    Page<InstalledPart> findByPartPartId(Long partId, Pageable pageable);

    // Find parts with warranty expiring before a specific date
    Page<InstalledPart> findByWarrantyExpirationDateBefore(LocalDate date, Pageable pageable);

    // Find parts with warranty expiring within a specific date range
    Page<InstalledPart> findByWarrantyExpirationDateBetween(LocalDate warrantyExpirationDateAfter, LocalDate warrantyExpirationDateBefore, Pageable pageable);

    /**
     * Checks if any installed part is associated with a specific part ID.
     * This is an efficient way to check for usage before deleting a Part.
     * @param partId The ID of the Part to check.
     * @return true if the part is in use, false otherwise.
     */
    boolean existsByPart_PartId(Long partId);
}
