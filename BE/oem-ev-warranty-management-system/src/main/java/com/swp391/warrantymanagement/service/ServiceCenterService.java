package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

/**
 * ServiceCenterService - Business logic for service center management
 */
public interface ServiceCenterService {
    /**
     * Create a new service center (ADMIN only)
     * @param requestDTO Service center data
     * @return Created service center
     */
    ServiceCenterResponseDTO createServiceCenter(ServiceCenterRequestDTO requestDTO);

    /**
     * Get service center by ID
     * @param serviceCenterId Service center ID
     * @return Service center details with statistics
     */
    ServiceCenterResponseDTO getServiceCenterById(Long serviceCenterId);

    /**
     * Get all service centers (paginated)
     * @param pageable Pagination parameters
     * @return Paged list of service centers
     */
    PagedResponse<ServiceCenterResponseDTO> getAllServiceCenters(Pageable pageable);

    /**
     * Update service center information (ADMIN only)
     * @param serviceCenterId Service center ID
     * @param requestDTO Updated service center data
     * @return Updated service center
     */
    ServiceCenterResponseDTO updateServiceCenter(Long serviceCenterId, ServiceCenterRequestDTO requestDTO);

    /**
     * Delete service center (ADMIN only)
     * @param serviceCenterId Service center ID
     */
    void deleteServiceCenter(Long serviceCenterId);

    /**
     * Search service centers by name or address (paginated)
     * @param search Search keyword
     * @param pageable Pagination parameters
     * @return Paged list of matching service centers
     */
    PagedResponse<ServiceCenterResponseDTO> searchServiceCenters(String search, Pageable pageable);

    /**
     * Find service centers near a location (within radius)
     * @param latitude Location latitude
     * @param longitude Location longitude
     * @param radiusKm Radius in kilometers
     * @return List of service centers within radius, ordered by distance
     */
    List<ServiceCenterResponseDTO> findServiceCentersNearLocation(
            BigDecimal latitude, BigDecimal longitude, double radiusKm);

    /**
     * Get all service centers ordered by distance from a location
     * @param latitude Location latitude
     * @param longitude Location longitude
     * @return List of service centers ordered by distance
     */
    List<ServiceCenterResponseDTO> findAllOrderedByDistanceFrom(
            BigDecimal latitude, BigDecimal longitude);

    /**
     * Update service center location (latitude, longitude)
     * @param serviceCenterId Service center ID
     * @param latitude New latitude
     * @param longitude New longitude
     * @return Updated service center
     */
    ServiceCenterResponseDTO updateServiceCenterLocation(
            Long serviceCenterId, BigDecimal latitude, BigDecimal longitude);
}
