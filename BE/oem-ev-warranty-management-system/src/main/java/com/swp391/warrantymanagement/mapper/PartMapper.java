package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi Part Entity ↔ DTO theo thiết kế DAL
 */
public final class PartMapper {
    private PartMapper() {}

    // Request DTO -> Entity (cho create/update operations)
    public static Part toEntity(PartRequestDTO requestDTO, Vehicle vehicle) {
        if (requestDTO == null) return null;

        Part entity = new Part();
        entity.setPartId(requestDTO.getPartId());
        entity.setPartName(requestDTO.getPartName());
        entity.setPartNumber(requestDTO.getPartNumber());
        entity.setManufacturer(requestDTO.getManufacturer());
        entity.setPrice(requestDTO.getPrice());
        entity.setInstallationDate(requestDTO.getInstallationDate());
        entity.setWarrantyExpirationDate(requestDTO.getWarrantyExpirationDate());
        entity.setVehicle(vehicle);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(Part entity, PartRequestDTO requestDTO, Vehicle vehicle) {
        if (entity == null || requestDTO == null) return;

        // Không update partId vì là primary key
        entity.setPartName(requestDTO.getPartName());
        entity.setPartNumber(requestDTO.getPartNumber());
        entity.setManufacturer(requestDTO.getManufacturer());
        entity.setPrice(requestDTO.getPrice());
        entity.setInstallationDate(requestDTO.getInstallationDate());
        entity.setWarrantyExpirationDate(requestDTO.getWarrantyExpirationDate());
        entity.setVehicle(vehicle);
    }

    // Entity -> Response DTO (cho API response)
    public static PartResponseDTO toResponseDTO(Part entity) {
        if (entity == null) return null;

        PartResponseDTO responseDTO = new PartResponseDTO();
        responseDTO.setPartId(entity.getPartId());
        responseDTO.setPartName(entity.getPartName());
        responseDTO.setPartNumber(entity.getPartNumber());
        responseDTO.setManufacturer(entity.getManufacturer());
        responseDTO.setPrice(entity.getPrice());
        responseDTO.setInstallationDate(entity.getInstallationDate());
        responseDTO.setWarrantyExpirationDate(entity.getWarrantyExpirationDate());

        if (entity.getVehicle() != null) {
            responseDTO.setVehicleId(entity.getVehicle().getVehicleId());
            responseDTO.setVehicleName(entity.getVehicle().getVehicleName());
            responseDTO.setVehicleVin(entity.getVehicle().getVehicleVin());
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<PartResponseDTO> toResponseDTOList(List<Part> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(PartMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
