package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.PartRequest;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PartRequest entity
 */
@Repository
public interface PartRequestRepository extends JpaRepository<PartRequest, Long> {

    // Tìm tất cả part requests với phân trang
    Page<PartRequest> findAll(Pageable pageable);

    // Tìm part requests theo status
    Page<PartRequest> findByStatus(PartRequestStatus status, Pageable pageable);

    // Tìm part requests theo warranty claim
    Page<PartRequest> findByWarrantyClaimWarrantyClaimId(Long warrantyClaimId, Pageable pageable);

    // Tìm part requests theo service center
    Page<PartRequest> findByServiceCenterServiceCenterId(Long serviceCenterId, Pageable pageable);

    // Tìm part requests theo technician (người tạo yêu cầu)
    Page<PartRequest> findByRequestedByUserId(Long userId, Pageable pageable);

    // Tìm part requests theo faulty part
    Page<PartRequest> findByFaultyPartPartId(String partId, Pageable pageable);

    // Tìm part requests đang chờ duyệt (cho EVM_STAFF)
    @Query("SELECT pr FROM PartRequest pr WHERE pr.status = 'PENDING' ORDER BY pr.requestDate ASC")
    Page<PartRequest> findPendingRequests(Pageable pageable);

    // Tìm part requests đã duyệt nhưng chưa giao (cho tracking)
    @Query("SELECT pr FROM PartRequest pr WHERE pr.status IN ('APPROVED', 'SHIPPED') ORDER BY pr.approvedDate DESC")
    Page<PartRequest> findInTransitRequests(Pageable pageable);

    // Tìm part requests của một service center theo status
    @Query("SELECT pr FROM PartRequest pr WHERE pr.serviceCenter.serviceCenterId = :serviceCenterId AND pr.status = :status")
    Page<PartRequest> findByServiceCenterAndStatus(@Param("serviceCenterId") Long serviceCenterId,
                                                     @Param("status") PartRequestStatus status,
                                                     Pageable pageable);

    // Đếm số lượng requests theo status
    Long countByStatus(PartRequestStatus status);

    // Đếm số lượng pending requests cho một service center
    @Query("SELECT COUNT(pr) FROM PartRequest pr WHERE pr.serviceCenter.serviceCenterId = :serviceCenterId AND pr.status = 'PENDING'")
    Long countPendingRequestsByServiceCenter(@Param("serviceCenterId") Long serviceCenterId);
}

