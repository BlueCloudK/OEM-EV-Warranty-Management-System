package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WarrantyClaimStatus;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi WarrantyClaim Entity ↔ DTO theo thiết kế DAL
 */
public final class WarrantyClaimMapper {
    private WarrantyClaimMapper() {}

    // Request DTO -> Entity (cho create operation)
    public static WarrantyClaim toEntity(WarrantyClaimRequestDTO requestDTO, Part part, Vehicle vehicle) {
        if (requestDTO == null) return null;

        WarrantyClaim entity = new WarrantyClaim();
        entity.setDescription(requestDTO.getDescription());
        entity.setPart(part);
        entity.setVehicle(vehicle);
        entity.setStatus(WarrantyClaimStatus.SUBMITTED); // Business rule: luôn bắt đầu với SUBMITTED
        entity.setClaimDate(new Date());

        return entity;
    }

    // Entity -> Response DTO (cho API response)
    public static WarrantyClaimResponseDTO toResponseDTO(WarrantyClaim entity) {
        if (entity == null) return null;

        WarrantyClaimResponseDTO responseDTO = new WarrantyClaimResponseDTO();
        responseDTO.setWarrantyClaimId(entity.getWarrantyClaimId());
        responseDTO.setClaimDate(entity.getClaimDate());
        responseDTO.setStatus(entity.getStatus());
        responseDTO.setDescription(entity.getDescription());
        responseDTO.setResolutionDate(entity.getResolutionDate());

        if (entity.getPart() != null) {
            responseDTO.setPartId(entity.getPart().getPartId());
        }
        if (entity.getVehicle() != null) {
            responseDTO.setVehicleId(entity.getVehicle().getVehicleId());
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<WarrantyClaimResponseDTO> toResponseDTOList(List<WarrantyClaim> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(WarrantyClaimMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
