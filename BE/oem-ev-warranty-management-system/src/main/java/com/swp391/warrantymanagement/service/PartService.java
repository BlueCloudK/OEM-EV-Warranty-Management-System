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
    // ============= CRUD Operations =============
    PartResponseDTO getPartById(String id);
    PartResponseDTO createPart(PartRequestDTO requestDTO);
    PartResponseDTO updatePart(String id, PartRequestDTO requestDTO);
    boolean deletePart(String id);

    // ============= Mass Data Operations - With Pagination =============
    /**
     * Get all parts with search capability
     * @param pageable pagination info
     * @param search search term for part name/description (optional)
     * @return paginated part list
     */
    PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable, String search);

    /**
     * Get parts by vehicle ID
     * @param vehicleId target vehicle ID
     * @param pageable pagination info
     * @return paginated parts for vehicle
     */
    PagedResponse<PartResponseDTO> getPartsByVehicleId(Long vehicleId, Pageable pageable);

    /**
     * Get parts by manufacturer
     * @param manufacturer manufacturer name
     * @param pageable pagination info
     * @return paginated parts by manufacturer
     */
    PagedResponse<PartResponseDTO> getPartsByManufacturer(String manufacturer, Pageable pageable);

    /**
     * Get parts with warranty expiring soon
     * @param daysFromNow number of days to check ahead
     * @param pageable pagination info
     * @return paginated list of parts with expiring warranty
     */
    PagedResponse<PartResponseDTO> getPartsWithExpiringWarranty(int daysFromNow, Pageable pageable);

    // ============= Simple List Operations =============
    List<PartResponseDTO> searchPartsByName(String name);
    List<PartResponseDTO> findPartsByVehicleId(Long vehicleId);
}
