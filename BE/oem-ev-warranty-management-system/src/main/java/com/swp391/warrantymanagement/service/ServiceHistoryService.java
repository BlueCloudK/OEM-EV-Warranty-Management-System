package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service interface for service history-related business logic.
 * Handles CRUD and search operations for service histories using DTOs.
 */
@Service
public interface ServiceHistoryService {
    // Business logic methods - chỉ giao tiếp bằng DTO
    PagedResponse<ServiceHistoryResponseDTO> getAllServiceHistoriesPage(Pageable pageable);
    ServiceHistoryResponseDTO getServiceHistoryById(Long id);
    ServiceHistoryResponseDTO createServiceHistory(ServiceHistoryRequestDTO requestDTO);
    ServiceHistoryResponseDTO updateServiceHistory(Long id, ServiceHistoryRequestDTO requestDTO);
    boolean deleteServiceHistory(Long id);
    List<ServiceHistoryResponseDTO> getServiceHistoriesByPartId(String partId);
    List<ServiceHistoryResponseDTO> getServiceHistoriesByVehicleId(Long vehicleId);
    List<ServiceHistoryResponseDTO> searchServiceHistoriesByType(String serviceType);
}
