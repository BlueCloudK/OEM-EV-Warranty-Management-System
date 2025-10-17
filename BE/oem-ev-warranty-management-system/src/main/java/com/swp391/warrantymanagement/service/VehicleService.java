package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for vehicle-related business logic.
 */
public interface VehicleService {
    // ============= CRUD Operations =============
    VehicleResponseDTO getVehicleById(Long id); // Single record - no pagination needed
    VehicleResponseDTO createVehicle(VehicleRequestDTO requestDTO);
    VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO requestDTO);
    boolean deleteVehicle(Long id);
    PagedResponse<VehicleResponseDTO> getAllVehiclesPage(Pageable pageable, String search);
    PagedResponse<VehicleResponseDTO> searchVehicles(String model, String brand, Pageable pageable);
    PagedResponse<VehicleResponseDTO> getVehiclesWithExpiringWarranty(int daysFromNow, Pageable pageable);

    // ============= Customer-specific Operations =============
    PagedResponse<VehicleResponseDTO> getVehiclesByCustomerId(UUID customerId, Pageable pageable);
    PagedResponse<VehicleResponseDTO> getVehiclesByCurrentUser(String authorizationHeader, Pageable pageable);
    VehicleResponseDTO getVehicleByVin(String vin);
}
