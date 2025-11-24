package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.PartCategoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartCategoryResponseDTO;
import com.swp391.warrantymanagement.entity.PartCategory;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper cho PartCategory entity ↔ DTOs.
 */
public class PartCategoryMapper {

    /**
     * Convert PartCategory entity → PartCategoryResponseDTO.
     *
     * @param entity PartCategory entity
     * @return PartCategoryResponseDTO
     */
    public static PartCategoryResponseDTO toResponseDTO(PartCategory entity) {
        if (entity == null) {
            return null;
        }

        PartCategoryResponseDTO dto = new PartCategoryResponseDTO();
        dto.setCategoryId(entity.getCategoryId());
        dto.setCategoryName(entity.getCategoryName());
        dto.setMaxQuantityPerVehicle(entity.getMaxQuantityPerVehicle());
        dto.setDescription(entity.getDescription());
        dto.setIsActive(entity.getIsActive());

        // Count số lượng parts thuộc category này (nếu collection đã được load)
        if (entity.getParts() != null) {
            dto.setPartCount((long) entity.getParts().size());
        } else {
            dto.setPartCount(0L);
        }

        return dto;
    }

    /**
     * Convert List<PartCategory> → List<PartCategoryResponseDTO>.
     *
     * @param entities List of PartCategory entities
     * @return List of PartCategoryResponseDTOs
     */
    public static List<PartCategoryResponseDTO> toResponseDTOList(List<PartCategory> entities) {
        return entities.stream()
                .map(PartCategoryMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert PartCategoryRequestDTO → PartCategory entity (for create).
     *
     * @param requestDTO PartCategoryRequestDTO
     * @return new PartCategory entity
     */
    public static PartCategory toEntity(PartCategoryRequestDTO requestDTO) {
        if (requestDTO == null) {
            return null;
        }

        PartCategory entity = new PartCategory();
        entity.setCategoryName(requestDTO.getCategoryName());
        entity.setMaxQuantityPerVehicle(requestDTO.getMaxQuantityPerVehicle());
        entity.setDescription(requestDTO.getDescription());
        entity.setIsActive(requestDTO.getIsActive() != null ? requestDTO.getIsActive() : true);

        return entity;
    }

    /**
     * Update existing PartCategory entity from PartCategoryRequestDTO.
     *
     * @param entity existing PartCategory entity
     * @param requestDTO PartCategoryRequestDTO with updated data
     */
    public static void updateEntity(PartCategory entity, PartCategoryRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) {
            return;
        }

        entity.setCategoryName(requestDTO.getCategoryName());
        entity.setMaxQuantityPerVehicle(requestDTO.getMaxQuantityPerVehicle());
        entity.setDescription(requestDTO.getDescription());

        if (requestDTO.getIsActive() != null) {
            entity.setIsActive(requestDTO.getIsActive());
        }
    }
}
