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
    /**
     * Get all service histories with search capability
     * @param pageable pagination info
     * @param search search term for service type/description (optional)
     * @return paginated service history list
     */
    PagedResponse<ServiceHistoryResponseDTO> getAllServiceHistoriesPage(Pageable pageable, String search);

    /**
     * Get service histories by vehicle ID
     * @param vehicleId target vehicle ID
     * @param pageable pagination info
     * @return paginated service histories for vehicle
     */
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByVehicleId(Long vehicleId, Pageable pageable);

    /**
     * Get service histories by part ID
     * @param partId target part ID
     * @param pageable pagination info
     * @return paginated service histories for part
     */
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByPartId(String partId, Pageable pageable);

    /**
     * Get current user's service histories (Customer only)
     * @param authorizationHeader JWT token
     * @param pageable pagination info
     * @return paginated list of user's service histories
     */
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByCurrentUser(String authorizationHeader, Pageable pageable);

    /**
     * Get service histories by date range
     * @param startDate start date (ISO format)
     * @param endDate end date (ISO format)
     * @param pageable pagination info
     * @return paginated service histories in date range
     */
    PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByDateRange(String startDate, String endDate, Pageable pageable);

    // ============= Simple List Operations =============
    List<ServiceHistoryResponseDTO> searchServiceHistoriesByType(String serviceType);
}
