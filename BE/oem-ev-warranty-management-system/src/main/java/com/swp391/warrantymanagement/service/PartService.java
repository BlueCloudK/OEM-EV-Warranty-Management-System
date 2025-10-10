package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for part-related business logic.
 * Handles CRUD and search operations for parts using DTOs.
 */
public interface PartService {
    // ============= CRUD Operations =============
    PartResponseDTO getPartById(String id);
    PartResponseDTO createPart(PartRequestDTO requestDTO);
    PartResponseDTO updatePart(String id, PartRequestDTO requestDTO);
    boolean deletePart(String id);

    // ============= Mass Data Operations - With Pagination =============
    PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable, String search);
    PagedResponse<PartResponseDTO> getPartsByVehicleId(Long vehicleId, Pageable pageable);
    PagedResponse<PartResponseDTO> getPartsByManufacturer(String manufacturer, Pageable pageable);
    PagedResponse<PartResponseDTO> getPartsWithExpiringWarranty(int daysFromNow, Pageable pageable);
}
