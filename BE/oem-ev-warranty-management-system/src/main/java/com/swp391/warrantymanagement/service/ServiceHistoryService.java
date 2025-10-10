package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for service history-related business logic.
 */
public interface ServiceHistoryService {
    // ============= CRUD Operations =============
    ServiceHistoryResponseDTO getServiceHistoryById(Long id);
    ServiceHistoryResponseDTO createServiceHistory(ServiceHistoryRequestDTO requestDTO);
    ServiceHistoryResponseDTO updateServiceHistory(Long id, ServiceHistoryRequestDTO requestDTO);
    boolean deleteServiceHistory(Long id);

    // ============= Mass Data Operations - With Pagination =============
    PagedResponse<ServiceHistoryResponseDTO> getAllServiceHistoriesPage(Pageable pageable, String search);
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByVehicleId(Long vehicleId, Pageable pageable);
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByPartId(String partId, Pageable pageable);
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByCurrentUser(String authorizationHeader, Pageable pageable);
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByDateRange(String startDate, String endDate, Pageable pageable);
}
