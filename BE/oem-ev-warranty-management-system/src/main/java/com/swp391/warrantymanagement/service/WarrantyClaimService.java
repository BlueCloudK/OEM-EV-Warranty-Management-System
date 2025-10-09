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
    List<WarrantyClaimResponseDTO> getClaimsByStatus(String status);
    List<WarrantyClaimResponseDTO> getClaimsByVehicleId(Long vehicleId);
}
