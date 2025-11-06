package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository để quản lý WarrantyClaim
 * - Tìm claim theo status, vehicle, assigned user, customer
 * - Hỗ trợ filter cho từng role (customer chỉ xem claim của mình)
 */
@Repository
public interface WarrantyClaimRepository extends JpaRepository<WarrantyClaim, Long> {
    // Tìm claim theo trạng thái (SUBMITTED, APPROVED, IN_PROGRESS, RESOLVED, REJECTED)
    List<WarrantyClaim> findByStatus(WarrantyClaimStatus status);
    Page<WarrantyClaim> findByStatus(WarrantyClaimStatus status, Pageable pageable);

    // Tìm claim theo nhiều trạng thái (dùng cho technician xem pending claims)
    Page<WarrantyClaim> findByStatusIn(List<WarrantyClaimStatus> statuses, Pageable pageable);

    // Tìm claim theo xe
    List<WarrantyClaim> findByVehicleVehicleId(Long vehicleId);

    // Tìm claim được assign cho user cụ thể (technician)
    Page<WarrantyClaim> findByAssignedToUserId(Long userId, Pageable pageable);
    List<WarrantyClaim> findByAssignedToUserId(Long userId);

    // Tìm claim chưa được assign
    Page<WarrantyClaim> findByAssignedToIsNull(Pageable pageable);

    // Tìm claim của customer cụ thể (qua Vehicle -> Customer)
    Page<WarrantyClaim> findByVehicleCustomerCustomerId(java.util.UUID customerId, Pageable pageable);

    // Kiểm tra claim có thuộc về customer không (security check)
    java.util.Optional<WarrantyClaim> findByWarrantyClaimIdAndVehicleCustomerCustomerId(Long claimId, java.util.UUID customerId);

    boolean existsByAssignedTo(User assignedTo);
}
