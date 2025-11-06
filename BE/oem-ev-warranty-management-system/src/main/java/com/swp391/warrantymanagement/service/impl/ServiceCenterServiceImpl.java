package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.entity.ServiceCenter;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.exception.ResourceInUseException;
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
 * Service quản lý Service Centers (trung tâm bảo hành) với geolocation features.
 * Hỗ trợ tìm kiếm SC gần customer nhất, auto-assignment, và statistics enrichment.
 */
@Service
@RequiredArgsConstructor
public class ServiceCenterServiceImpl implements ServiceCenterService {

    private final ServiceCenterRepository serviceCenterRepository;
    private final FeedbackRepository feedbackRepository;

    /**
     * Tạo service center mới.
     *
     * @param requestDTO thông tin service center (name, address, phone, latitude, longitude)
     * @return ServiceCenterResponseDTO với statistics
     * @throws IllegalArgumentException nếu phone đã tồn tại
     */
    @Override
    @Transactional
    public ServiceCenterResponseDTO createServiceCenter(ServiceCenterRequestDTO requestDTO) {
        if (serviceCenterRepository.existsByPhone(requestDTO.getPhone())) {
            throw new IllegalArgumentException("Phone number already exists: " + requestDTO.getPhone());
        }

        ServiceCenter serviceCenter = ServiceCenterMapper.toEntity(requestDTO);
        ServiceCenter savedServiceCenter = serviceCenterRepository.save(serviceCenter);

        return enrichWithStatistics(savedServiceCenter);
    }

    /**
     * Lấy service center theo ID với real-time statistics.
     *
     * @param serviceCenterId ID của service center
     * @return ServiceCenterResponseDTO với statistics (staffCount, claimsCount, activeClaimsCount, averageRating)
     * @throws ResourceNotFoundException nếu không tìm thấy service center
     */
    @Override
    @Transactional(readOnly = true)
    public ServiceCenterResponseDTO getServiceCenterById(Long serviceCenterId) {
        ServiceCenter serviceCenter = serviceCenterRepository.findById(serviceCenterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with ID: " + serviceCenterId));

        return enrichWithStatistics(serviceCenter);
    }

    /**
     * Lấy tất cả service centers với pagination và statistics.
     *
     * @param pageable pagination parameters (page, size, sort)
     * @return PagedResponse với service centers và statistics
     */
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

    /**
     * Cập nhật thông tin service center.
     *
     * @param serviceCenterId ID của service center cần update
     * @param requestDTO thông tin mới (name, address, phone, latitude, longitude)
     * @return ServiceCenterResponseDTO với updated statistics
     * @throws ResourceNotFoundException nếu không tìm thấy service center
     * @throws IllegalArgumentException nếu phone mới đã được SC khác sử dụng
     */
    @Override
    @Transactional
    public ServiceCenterResponseDTO updateServiceCenter(Long serviceCenterId, ServiceCenterRequestDTO requestDTO) {
        ServiceCenter serviceCenter = serviceCenterRepository.findById(serviceCenterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with ID: " + serviceCenterId));

        if (serviceCenterRepository.existsByPhoneAndIdNot(requestDTO.getPhone(), serviceCenterId)) {
            throw new IllegalArgumentException("Phone number already exists: " + requestDTO.getPhone());
        }

        ServiceCenterMapper.updateEntity(serviceCenter, requestDTO);
        ServiceCenter updatedServiceCenter = serviceCenterRepository.save(serviceCenter);

        return enrichWithStatistics(updatedServiceCenter);
    }

    /**
     * Xóa service center với validation (không xóa nếu có staff hoặc active claims).
     *
     * @param serviceCenterId ID của service center cần xóa
     * @throws ResourceNotFoundException nếu không tìm thấy service center
     * @throws ResourceInUseException nếu SC có staff assigned hoặc active claims
     */
    @Override
    @Transactional
    public void deleteServiceCenter(Long serviceCenterId) {
        if (!serviceCenterRepository.existsById(serviceCenterId)) {
            throw new ResourceNotFoundException("Service center not found with ID: " + serviceCenterId);
        }

        Long staffCount = serviceCenterRepository.countStaffByServiceCenter(serviceCenterId);
        if (staffCount > 0) {
            throw new ResourceInUseException(
                    "Cannot delete service center. There are " + staffCount + " staff members assigned to this center.");
        }

        Long activeClaimsCount = serviceCenterRepository.countActiveClaimsByServiceCenter(serviceCenterId);
        if (activeClaimsCount > 0) {
            throw new ResourceInUseException(
                    "Cannot delete service center. There are " + activeClaimsCount + " active claims.");
        }

        serviceCenterRepository.deleteById(serviceCenterId);
    }

    /**
     * Tìm kiếm service centers theo name hoặc address (case-insensitive, partial match).
     *
     * @param search từ khóa tìm kiếm
     * @param pageable pagination parameters
     * @return PagedResponse với matching service centers và statistics
     */
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

    /**
     * Tìm service centers trong bán kính (sử dụng Haversine formula).
     *
     * @param latitude vĩ độ GPS
     * @param longitude kinh độ GPS
     * @param radiusKm bán kính tìm kiếm (km)
     * @return List service centers trong bán kính, sorted by distance
     * @throws IllegalArgumentException nếu GPS coordinates không hợp lệ
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceCenterResponseDTO> findServiceCentersNearLocation(
            BigDecimal latitude, BigDecimal longitude, double radiusKm) {

        validateCoordinates(latitude, longitude);

        List<ServiceCenter> serviceCenters = serviceCenterRepository
                .findServiceCentersNearLocation(latitude, longitude, radiusKm);

        return serviceCenters.stream()
                .map(this::enrichWithStatistics)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả service centers sorted theo khoảng cách từ vị trí (nearest first).
     *
     * @param latitude vĩ độ GPS
     * @param longitude kinh độ GPS
     * @return List tất cả service centers sorted by distance với statistics
     * @throws IllegalArgumentException nếu GPS coordinates không hợp lệ
     */
    @Override
    @Transactional(readOnly = true)
    public List<ServiceCenterResponseDTO> findAllOrderedByDistanceFrom(
            BigDecimal latitude, BigDecimal longitude) {

        validateCoordinates(latitude, longitude);

        List<Object[]> results = serviceCenterRepository
                .findAllOrderedByDistanceFrom(latitude, longitude);

        return results.stream()
                .map(result -> {
                    ServiceCenter sc = (ServiceCenter) result[0];
                    return enrichWithStatistics(sc);
                })
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật GPS location của service center.
     *
     * @param serviceCenterId ID của service center
     * @param latitude vĩ độ GPS mới
     * @param longitude kinh độ GPS mới
     * @return ServiceCenterResponseDTO với updated location và statistics
     * @throws IllegalArgumentException nếu GPS coordinates không hợp lệ
     * @throws ResourceNotFoundException nếu không tìm thấy service center
     */
    @Override
    @Transactional
    public ServiceCenterResponseDTO updateServiceCenterLocation(
            Long serviceCenterId, BigDecimal latitude, BigDecimal longitude) {

        validateCoordinates(latitude, longitude);

        ServiceCenter serviceCenter = serviceCenterRepository.findById(serviceCenterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service center not found with ID: " + serviceCenterId));

        serviceCenter.setLatitude(latitude);
        serviceCenter.setLongitude(longitude);

        ServiceCenter updatedServiceCenter = serviceCenterRepository.save(serviceCenter);

        return enrichWithStatistics(updatedServiceCenter);
    }

    // ============= HELPER METHODS =============

    /**
     * Enrich ServiceCenter entity với real-time statistics (staffCount, claimsCount, activeClaimsCount, averageRating).
     */
    private ServiceCenterResponseDTO enrichWithStatistics(ServiceCenter serviceCenter) {
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
     * Validate GPS coordinates (latitude: -90 to 90, longitude: -180 to 180).
     *
     * @throws IllegalArgumentException nếu coordinates nằm ngoài range hợp lệ
     */
    private void validateCoordinates(BigDecimal latitude, BigDecimal longitude) {
        if (latitude.compareTo(new BigDecimal("-90")) < 0 ||
            latitude.compareTo(new BigDecimal("90")) > 0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }

        if (longitude.compareTo(new BigDecimal("-180")) < 0 ||
            longitude.compareTo(new BigDecimal("180")) > 0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
    }
}
