package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;

import java.util.List;
import java.util.stream.Collectors;

/**
 * InstalledPartMapper - Converts between InstalledPart Entity and DTOs
 * Handles mapping of part installations with vehicle and part associations
 */
public final class InstalledPartMapper {
    private InstalledPartMapper() {}

    // Request DTO -> Entity (for create operations)
    public static InstalledPart toEntity(InstalledPartRequestDTO requestDTO, Part part, Vehicle vehicle) {
        if (requestDTO == null) return null;

        InstalledPart entity = new InstalledPart();
        entity.setInstalledPartId(requestDTO.getInstalledPartId());
        entity.setInstallationDate(requestDTO.getInstallationDate());
        entity.setWarrantyExpirationDate(requestDTO.getWarrantyExpirationDate());
        entity.setPart(part);
        entity.setVehicle(vehicle);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(InstalledPart entity, InstalledPartRequestDTO requestDTO,
                                   Part part, Vehicle vehicle) {
        if (entity == null || requestDTO == null) return;

        // Don't update installedPartId (primary key)
        entity.setInstallationDate(requestDTO.getInstallationDate());
        entity.setWarrantyExpirationDate(requestDTO.getWarrantyExpirationDate());
        entity.setPart(part);
        entity.setVehicle(vehicle);
    }

    // Entity -> Response DTO (for API response)
    public static InstalledPartResponseDTO toResponseDTO(InstalledPart entity) {
        if (entity == null) return null;

        InstalledPartResponseDTO responseDTO = new InstalledPartResponseDTO();

        // Installed part info
        responseDTO.setInstalledPartId(entity.getInstalledPartId());
        responseDTO.setInstallationDate(entity.getInstallationDate());
        responseDTO.setWarrantyExpirationDate(entity.getWarrantyExpirationDate());

        // Part information
        if (entity.getPart() != null) {
            responseDTO.setPartId(entity.getPart().getPartId());
            responseDTO.setPartName(entity.getPart().getPartName());
            responseDTO.setPartNumber(entity.getPart().getPartNumber());
            responseDTO.setManufacturer(entity.getPart().getManufacturer());
            responseDTO.setPrice(entity.getPart().getPrice());
        }

        // Vehicle information
        if (entity.getVehicle() != null) {
            responseDTO.setVehicleId(entity.getVehicle().getVehicleId());
            responseDTO.setVehicleName(entity.getVehicle().getVehicleName());
            responseDTO.setVehicleVin(entity.getVehicle().getVehicleVin());
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<InstalledPartResponseDTO> toResponseDTOList(List<InstalledPart> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(InstalledPartMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
