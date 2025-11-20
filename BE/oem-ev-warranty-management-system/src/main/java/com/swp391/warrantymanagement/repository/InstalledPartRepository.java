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
 * - Các query method mặc định filter out những installed parts đã bị soft delete (isActive = false).
 */
@Repository
public interface InstalledPartRepository extends JpaRepository<InstalledPart, Long> {
    // Find all ACTIVE parts installed in a specific vehicle (soft delete aware)
    Page<InstalledPart> findByVehicleVehicleIdAndIsActiveTrue(Long vehicleId, Pageable pageable);

    // Find all ACTIVE installations of a specific part (soft delete aware)
    Page<InstalledPart> findByPartPartIdAndIsActiveTrue(Long partId, Pageable pageable);

    // Find ACTIVE parts with warranty expiring before a specific date (soft delete aware)
    Page<InstalledPart> findByWarrantyExpirationDateBeforeAndIsActiveTrue(LocalDate date, Pageable pageable);

    // Find ACTIVE parts with warranty expiring within a specific date range (soft delete aware)
    Page<InstalledPart> findByWarrantyExpirationDateBetweenAndIsActiveTrue(LocalDate warrantyExpirationDateAfter, LocalDate warrantyExpirationDateBefore, Pageable pageable);

    // Find all ACTIVE installed parts (for pagination)
    Page<InstalledPart> findByIsActiveTrue(Pageable pageable);

    /**
     * Checks if any ACTIVE installed part is associated with a specific part ID.
     * This is an efficient way to check for usage before deleting a Part.
     * Only counts active installed parts (soft delete aware).
     * @param partId The ID of the Part to check.
     * @return true if the part is in use (and active), false otherwise.
     */
    boolean existsByPart_PartIdAndIsActiveTrue(Long partId);

    /**
     * Find all ACTIVE installed parts of a specific Part type.
     * Used for recall campaigns to find all affected vehicles.
     * Only returns active installed parts (soft delete aware).
     * @param partId The ID of the Part type.
     * @return List of all active InstalledPart instances using this Part.
     */
    List<InstalledPart> findByPart_PartIdAndIsActiveTrue(Long partId);

    // ======= LEGACY METHODS (for backward compatibility with existing code) =======
    // These methods return ALL installed parts (including soft-deleted ones)
    // Kept for specific use cases like recall management where we need ALL parts

    /**
     * @deprecated Use existsByPart_PartIdAndIsActiveTrue for new code.
     * Checks if any installed part (including inactive) is associated with a specific part ID.
     */
    @Deprecated
    boolean existsByPart_PartId(Long partId);

    /**
     * @deprecated Use findByPart_PartIdAndIsActiveTrue for new code that should filter out inactive parts.
     * Find ALL installed parts (including inactive) of a specific Part type.
     * Used for recall campaigns and audit where we need to see ALL installations.
     */
    @Deprecated
    List<InstalledPart> findByPart_PartId(Long partId);
}
