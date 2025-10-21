package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.WorkLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * WorkLogRepository - Data access layer for WorkLog entity
 */
@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    // Find all work logs for a specific warranty claim
    List<WorkLog> findByWarrantyClaimWarrantyClaimId(Long warrantyClaimId);
    Page<WorkLog> findByWarrantyClaimWarrantyClaimId(Long warrantyClaimId, Pageable pageable);

    // Find all work logs by a specific user
    List<WorkLog> findByUserUserId(Long userId);
    Page<WorkLog> findByUserUserId(Long userId, Pageable pageable);

    // Find work logs within date range
    Page<WorkLog> findByStartTimeBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Find work logs by warranty claim and user
    @Query("SELECT wl FROM WorkLog wl WHERE wl.warrantyClaim.warrantyClaimId = :claimId AND wl.user.userId = :userId")
    List<WorkLog> findByClaimIdAndUserId(
        @Param("claimId") Long claimId,
        @Param("userId") Long userId);

    // Get recent work logs for a claim
    @Query("SELECT wl FROM WorkLog wl WHERE wl.warrantyClaim.warrantyClaimId = :claimId ORDER BY wl.startTime DESC")
    List<WorkLog> findRecentWorkLogsByClaimId(@Param("claimId") Long claimId, Pageable pageable);
}
