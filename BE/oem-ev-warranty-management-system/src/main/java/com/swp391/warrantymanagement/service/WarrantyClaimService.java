package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for warranty claim-related business logic.
 */
public interface WarrantyClaimService {
    PagedResponse<WarrantyClaimResponseDTO> getAllClaimsPage(Pageable pageable);
    WarrantyClaimResponseDTO getClaimById(Long id);
    WarrantyClaimResponseDTO createClaim(WarrantyClaimRequestDTO requestDTO);
    WarrantyClaimResponseDTO updateClaim(Long id, WarrantyClaimRequestDTO requestDTO);
    WarrantyClaimResponseDTO updateClaimStatus(Long id, WarrantyClaimStatusUpdateRequestDTO requestDTO);
    boolean deleteClaim(Long id);

    // ========== WORKFLOW METHODS ==========

    /**
     * SC Staff tạo claim cho khách hàng (status: SUBMITTED)
     */
    WarrantyClaimResponseDTO createClaimBySCStaff(WarrantyClaimRequestDTO requestDTO);

    /**
     * Admin xem xét và chấp nhận claim (SUBMITTED → MANAGER_REVIEW)
     */
    WarrantyClaimResponseDTO adminAcceptClaim(Long claimId, String note);

    /**
     * Admin từ chối claim (SUBMITTED → REJECTED)
     */
    WarrantyClaimResponseDTO adminRejectClaim(Long claimId, String reason);

    /**
     * Technician bắt đầu xử lý claim (MANAGER_REVIEW → PROCESSING)
     */
    WarrantyClaimResponseDTO techStartProcessing(Long claimId, String note);

    /**
     * Technician hoàn tất xử lý claim (PROCESSING → COMPLETED)
     */
    WarrantyClaimResponseDTO techCompleteClaim(Long claimId, String completionNote);

    /**
     * Lấy claims theo status với pagination
     */
    PagedResponse<WarrantyClaimResponseDTO> getClaimsByStatus(String status, Pageable pageable);

    /**
     * Lấy claims cần Technician xử lý (MANAGER_REVIEW hoặc PROCESSING)
     */
    PagedResponse<WarrantyClaimResponseDTO> getTechPendingClaims(Pageable pageable);

    /**
     * Admin nhận claim để xử lý (assign to themselves)
     */
    WarrantyClaimResponseDTO assignClaimToMe(Long claimId, Long userId);

    /**
     * Lấy claims đã được assign cho Admin cụ thể
     */
    PagedResponse<WarrantyClaimResponseDTO> getMyAssignedClaims(Long userId, Pageable pageable);

    /**
     * Customer xem tất cả warranty claims của mình (qua vehicles)
     */
    PagedResponse<WarrantyClaimResponseDTO> getMyWarrantyClaims(Pageable pageable);

    /**
     * Customer xem chi tiết 1 warranty claim của mình
     */
    WarrantyClaimResponseDTO getMyWarrantyClaimById(Long claimId);
}
