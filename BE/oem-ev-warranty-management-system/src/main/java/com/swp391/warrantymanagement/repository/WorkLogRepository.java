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
 * Repository để quản lý WorkLog (nhật ký công việc)
 * - Tracking thời gian làm việc của technician
 * - Tìm theo claim, user, thời gian
 */
@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    // Tìm tất cả work log của claim cụ thể
    List<WorkLog> findByWarrantyClaimWarrantyClaimId(Long warrantyClaimId);
    Page<WorkLog> findByWarrantyClaimWarrantyClaimId(Long warrantyClaimId, Pageable pageable);

    // Tìm tất cả work log của user (technician)
    List<WorkLog> findByUserUserId(Long userId);
    Page<WorkLog> findByUserUserId(Long userId, Pageable pageable);

    // Tìm work log trong khoảng thời gian
    Page<WorkLog> findByStartTimeBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Tìm work log theo claim và user (custom query)
    @Query("SELECT wl FROM WorkLog wl WHERE wl.warrantyClaim.warrantyClaimId = :claimId AND wl.user.userId = :userId")
    List<WorkLog> findByClaimIdAndUserId(
        @Param("claimId") Long claimId,
        @Param("userId") Long userId);
    @Query("SELECT wl FROM WorkLog wl WHERE wl.warrantyClaim.warrantyClaimId = :claimId ORDER BY wl.startTime DESC")
    List<WorkLog> findRecentWorkLogsByClaimId(@Param("claimId") Long claimId, Pageable pageable);
}
