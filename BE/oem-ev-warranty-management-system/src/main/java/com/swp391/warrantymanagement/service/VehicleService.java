package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for vehicle-related business logic.
 * Handles CRUD and search operations for vehicles using DTOs.
 */
@Service
public interface VehicleService {
    // Business logic methods - chỉ giao tiếp bằng DTO
    PagedResponse<VehicleResponseDTO> getAllVehiclesPage(Pageable pageable);
    VehicleResponseDTO getVehicleById(Long id);
    VehicleResponseDTO createVehicle(VehicleRequestDTO requestDTO);
    VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO requestDTO);
    boolean deleteVehicle(Long id);
    List<VehicleResponseDTO> getVehiclesByCustomerId(UUID customerId);
    List<VehicleResponseDTO> searchVehiclesByName(String name);
}
