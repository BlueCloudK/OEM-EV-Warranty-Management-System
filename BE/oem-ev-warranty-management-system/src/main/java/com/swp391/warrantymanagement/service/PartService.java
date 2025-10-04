package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service interface for part-related business logic.
 * Handles CRUD and search operations for parts using DTOs.
 */
@Service
public interface PartService {
    PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable);
    PartResponseDTO getPartById(String id);
    PartResponseDTO createPart(PartRequestDTO requestDTO);
    PartResponseDTO updatePart(String id, PartRequestDTO requestDTO);
    boolean deletePart(String id);
    List<PartResponseDTO> searchPartsByName(String name);
    List<PartResponseDTO> searchPartsByManufacturer(String manufacturer);
    List<PartResponseDTO> findPartsByVehicleId(Long vehicleId);
}
