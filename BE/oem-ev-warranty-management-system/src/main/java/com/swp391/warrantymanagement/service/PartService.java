package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

/**
 * PartService - Business logic for Part management
 * Used by EVM Staff to register and manage standalone parts (NO vehicle associations)
 */
public interface PartService {
    // ============= CRUD Operations =============
    PartResponseDTO getPartById(String id);
    PartResponseDTO createPart(PartRequestDTO requestDTO);
    PartResponseDTO updatePart(String id, PartRequestDTO requestDTO);
    boolean deletePart(String id);

    // ============= Search Operations with Pagination =============
    PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable, String search);
    PagedResponse<PartResponseDTO> getPartsByManufacturer(String manufacturer, Pageable pageable);
}
