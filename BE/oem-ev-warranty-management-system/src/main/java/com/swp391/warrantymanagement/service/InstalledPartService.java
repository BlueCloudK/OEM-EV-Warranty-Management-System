package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

/**
 * InstalledPartService - Business logic for InstalledPart management
 * Used by Dealer Staff (SC_STAFF) to install parts on vehicles
 */
public interface InstalledPartService {
    // ============= CRUD Operations =============
    InstalledPartResponseDTO getInstalledPartById(Long id);
    InstalledPartResponseDTO createInstalledPart(InstalledPartRequestDTO requestDTO);
    InstalledPartResponseDTO updateInstalledPart(Long id, InstalledPartRequestDTO requestDTO);
    boolean deleteInstalledPart(Long id);

    // ============= Search Operations with Pagination =============
    PagedResponse<InstalledPartResponseDTO> getAllInstalledParts(Pageable pageable);
    PagedResponse<InstalledPartResponseDTO> getInstalledPartsByVehicle(Long vehicleId, Pageable pageable);
    PagedResponse<InstalledPartResponseDTO> getInstalledPartsByPart(Long partId, Pageable pageable);
    PagedResponse<InstalledPartResponseDTO> getInstalledPartsWithExpiringWarranty(int daysFromNow, Pageable pageable);
}
