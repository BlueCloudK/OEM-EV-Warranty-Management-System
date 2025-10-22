package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.entity.ServiceCenter;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.ServiceCenterMapper;
import com.swp391.warrantymanagement.repository.FeedbackRepository;
import com.swp391.warrantymanagement.repository.ServiceCenterRepository;
import com.swp391.warrantymanagement.service.ServiceCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ServiceCenterServiceImpl - Implementation of service center business logic
 */
@Service
@RequiredArgsConstructor
public class ServiceCenterServiceImpl implements ServiceCenterService {

    private final ServiceCenterRepository serviceCenterRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    @Transactional
    public ServiceCenterResponseDTO createServiceCenter(ServiceCenterRequestDTO requestDTO) {
        // Validate phone doesn't exist
        if (serviceCenterRepository.existsByPhone(requestDTO.getPhone())) {
            throw new IllegalArgumentException("Phone number already exists: " + requestDTO.getPhone());
        }

        // Create service center
        ServiceCenter serviceCenter = ServiceCenterMapper.toEntity(requestDTO);
        ServiceCenter savedServiceCenter = serviceCenterRepository.save(serviceCenter);

        return enrichWithStatistics(savedServiceCenter);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceCenterResponseDTO getServiceCenterById(Long serviceCenterId) {
        ServiceCenter serviceCenter = serviceCenterRepository.findById(serviceCenterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with ID: " + serviceCenterId));

        return enrichWithStatistics(serviceCenter);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ServiceCenterResponseDTO> getAllServiceCenters(Pageable pageable) {
        Page<ServiceCenter> serviceCenterPage = serviceCenterRepository.findAll(pageable);

        List<ServiceCenterResponseDTO> responseDTOs = serviceCenterPage.getContent().stream()
                .map(this::enrichWithStatistics)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                responseDTOs,
                serviceCenterPage.getNumber(),
                serviceCenterPage.getSize(),
                serviceCenterPage.getTotalElements(),
                serviceCenterPage.getTotalPages(),
                serviceCenterPage.isFirst(),
                serviceCenterPage.isLast()
        );
    }

    @Override
    @Transactional
    public ServiceCenterResponseDTO updateServiceCenter(Long serviceCenterId, ServiceCenterRequestDTO requestDTO) {
        // Find existing service center
        ServiceCenter serviceCenter = serviceCenterRepository.findById(serviceCenterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with ID: " + serviceCenterId));

        // Validate phone doesn't exist (excluding current service center)
        if (serviceCenterRepository.existsByPhoneAndIdNot(requestDTO.getPhone(), serviceCenterId)) {
            throw new IllegalArgumentException("Phone number already exists: " + requestDTO.getPhone());
        }

        // Update service center
        ServiceCenterMapper.updateEntity(serviceCenter, requestDTO);
        ServiceCenter updatedServiceCenter = serviceCenterRepository.save(serviceCenter);

        return enrichWithStatistics(updatedServiceCenter);
    }

    @Override
    @Transactional
    public void deleteServiceCenter(Long serviceCenterId) {
        // Check if service center exists
        if (!serviceCenterRepository.existsById(serviceCenterId)) {
            throw new ResourceNotFoundException("Service center not found with ID: " + serviceCenterId);
        }

        // Check if service center has staff
        Long staffCount = serviceCenterRepository.countStaffByServiceCenter(serviceCenterId);
        if (staffCount > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete service center. There are " + staffCount + " staff members assigned to this center.");
        }

        // Check if service center has active claims
        Long activeClaimsCount = serviceCenterRepository.countActiveClaimsByServiceCenter(serviceCenterId);
        if (activeClaimsCount > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete service center. There are " + activeClaimsCount + " active claims.");
        }

        serviceCenterRepository.deleteById(serviceCenterId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ServiceCenterResponseDTO> searchServiceCenters(String search, Pageable pageable) {
        Page<ServiceCenter> serviceCenterPage = serviceCenterRepository
                .searchByNameOrAddress(search, pageable);

        List<ServiceCenterResponseDTO> responseDTOs = serviceCenterPage.getContent().stream()
                .map(this::enrichWithStatistics)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                responseDTOs,
                serviceCenterPage.getNumber(),
                serviceCenterPage.getSize(),
                serviceCenterPage.getTotalElements(),
                serviceCenterPage.getTotalPages(),
                serviceCenterPage.isFirst(),
                serviceCenterPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceCenterResponseDTO> findServiceCentersNearLocation(
            BigDecimal latitude, BigDecimal longitude, double radiusKm) {

        // Validate coordinates
        validateCoordinates(latitude, longitude);

        List<ServiceCenter> serviceCenters = serviceCenterRepository
                .findServiceCentersNearLocation(latitude, longitude, radiusKm);

        return serviceCenters.stream()
                .map(this::enrichWithStatistics)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceCenterResponseDTO> findAllOrderedByDistanceFrom(
            BigDecimal latitude, BigDecimal longitude) {

        // Validate coordinates
        validateCoordinates(latitude, longitude);

        List<Object[]> results = serviceCenterRepository
                .findAllOrderedByDistanceFrom(latitude, longitude);

        return results.stream()
                .map(result -> {
                    ServiceCenter sc = (ServiceCenter) result[0];
                    // Distance is in result[1] if needed in the future
                    return enrichWithStatistics(sc);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceCenterResponseDTO updateServiceCenterLocation(
            Long serviceCenterId, BigDecimal latitude, BigDecimal longitude) {

        // Validate coordinates
        validateCoordinates(latitude, longitude);

        // Find service center
        ServiceCenter serviceCenter = serviceCenterRepository.findById(serviceCenterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with ID: " + serviceCenterId));

        // Update location
        serviceCenter.setLatitude(latitude);
        serviceCenter.setLongitude(longitude);
        ServiceCenter updatedServiceCenter = serviceCenterRepository.save(serviceCenter);

        return enrichWithStatistics(updatedServiceCenter);
    }

    /**
     * Enrich ServiceCenter entity with statistics
     */
    private ServiceCenterResponseDTO enrichWithStatistics(ServiceCenter serviceCenter) {
        // Get statistics
        Long staffCount = serviceCenterRepository.countStaffByServiceCenter(serviceCenter.getServiceCenterId());
        Long claimsCount = serviceCenterRepository.countClaimsByServiceCenter(serviceCenter.getServiceCenterId());
        Long activeClaimsCount = serviceCenterRepository.countActiveClaimsByServiceCenter(serviceCenter.getServiceCenterId());
        Double averageRating = feedbackRepository.getAverageRatingByServiceCenter(serviceCenter.getServiceCenterId());

        return ServiceCenterMapper.toResponseDTOWithStats(
                serviceCenter,
                staffCount.intValue(),
                claimsCount.intValue(),
                activeClaimsCount.intValue(),
                averageRating
        );
    }

    /**
     * Validate latitude and longitude
     */
    private void validateCoordinates(BigDecimal latitude, BigDecimal longitude) {
        if (latitude.compareTo(new BigDecimal("-90")) < 0 || latitude.compareTo(new BigDecimal("90")) > 0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (longitude.compareTo(new BigDecimal("-180")) < 0 || longitude.compareTo(new BigDecimal("180")) > 0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
    }
}
