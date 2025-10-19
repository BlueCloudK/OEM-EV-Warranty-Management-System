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
     * EVM Staff xem xét và chấp nhận claim (SUBMITTED → SC_REVIEW)
     */
    WarrantyClaimResponseDTO evmAcceptClaim(Long claimId, String note);

    /**
     * EVM Staff từ chối claim (SUBMITTED → REJECTED)
     */
    WarrantyClaimResponseDTO evmRejectClaim(Long claimId, String reason);

    /**
     * Technician bắt đầu xử lý claim (SC_REVIEW → PROCESSING)
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
     * Lấy claims cần Technician xử lý (SC_REVIEW hoặc PROCESSING)
     */
    PagedResponse<WarrantyClaimResponseDTO> getTechPendingClaims(Pageable pageable);
}
