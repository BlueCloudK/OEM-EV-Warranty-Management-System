package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service interface for warranty claim-related business logic.
 * Handles CRUD, status update, and search operations for warranty claims using DTOs.
 */
@Service
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
