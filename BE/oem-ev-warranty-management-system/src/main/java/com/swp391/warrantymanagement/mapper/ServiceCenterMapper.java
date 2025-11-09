package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.entity.ServiceCenter;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ServiceCenterMapper - Converts between ServiceCenter Entity and DTOs
 */
public final class ServiceCenterMapper {
    private ServiceCenterMapper() {}

    // Request DTO -> Entity (for create operations)
    public static ServiceCenter toEntity(ServiceCenterRequestDTO requestDTO) {
        if (requestDTO == null) return null;

        ServiceCenter entity = new ServiceCenter();
        entity.setName(requestDTO.getServiceCenterName());
        entity.setAddress(requestDTO.getAddress());
        entity.setPhone(requestDTO.getPhone());
        entity.setOpeningHours(requestDTO.getOpeningHours());
        entity.setLatitude(requestDTO.getLatitude());
        entity.setLongitude(requestDTO.getLongitude());
        entity.setDailyClaimLimitPerTech(requestDTO.getDailyClaimLimitPerTech() != null
            ? requestDTO.getDailyClaimLimitPerTech() : 10);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(ServiceCenter entity, ServiceCenterRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) return;

        entity.setName(requestDTO.getServiceCenterName());
        entity.setAddress(requestDTO.getAddress());
        entity.setPhone(requestDTO.getPhone());
        entity.setOpeningHours(requestDTO.getOpeningHours());
        entity.setLatitude(requestDTO.getLatitude());
        entity.setLongitude(requestDTO.getLongitude());
        entity.setDailyClaimLimitPerTech(requestDTO.getDailyClaimLimitPerTech() != null
            ? requestDTO.getDailyClaimLimitPerTech() : 10);
    }

    // Entity -> Response DTO (basic info)
    public static ServiceCenterResponseDTO toResponseDTO(ServiceCenter entity) {
        if (entity == null) return null;

        ServiceCenterResponseDTO responseDTO = new ServiceCenterResponseDTO();
        responseDTO.setServiceCenterId(entity.getServiceCenterId());
        responseDTO.setServiceCenterName(entity.getName());
        responseDTO.setAddress(entity.getAddress());
        responseDTO.setPhone(entity.getPhone());
        responseDTO.setOpeningHours(entity.getOpeningHours());
        responseDTO.setLatitude(entity.getLatitude());
        responseDTO.setLongitude(entity.getLongitude());
        responseDTO.setDailyClaimLimitPerTech(entity.getDailyClaimLimitPerTech() != null
            ? entity.getDailyClaimLimitPerTech() : 10);

        // Statistics will be set by service layer
        responseDTO.setTotalStaff(0);
        responseDTO.setTotalClaims(0);
        responseDTO.setActiveClaims(0);
        responseDTO.setAverageRating(0.0);

        return responseDTO;
    }

    // Entity -> Response DTO with statistics
    public static ServiceCenterResponseDTO toResponseDTOWithStats(
            ServiceCenter entity,
            Integer totalStaff,
            Integer totalClaims,
            Integer activeClaims,
            Double averageRating) {
        if (entity == null) return null;

        ServiceCenterResponseDTO responseDTO = toResponseDTO(entity);
        responseDTO.setTotalStaff(totalStaff);
        responseDTO.setTotalClaims(totalClaims);
        responseDTO.setActiveClaims(activeClaims);
        responseDTO.setAverageRating(averageRating != null ? averageRating : 0.0);

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<ServiceCenterResponseDTO> toResponseDTOList(List<ServiceCenter> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(ServiceCenterMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
