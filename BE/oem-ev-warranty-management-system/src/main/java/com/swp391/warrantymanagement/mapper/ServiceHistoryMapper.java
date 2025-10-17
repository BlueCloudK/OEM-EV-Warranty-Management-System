package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;

import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi ServiceHistory Entity ↔ DTO theo thiết kế DAL
 * Xử lý chuyển đổi Date ↔ String giữa Entity và DTO
 */
public final class ServiceHistoryMapper {
    private ServiceHistoryMapper() {}

    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    // Request DTO -> Entity (cho create/update operations)
    public static ServiceHistory toEntity(ServiceHistoryRequestDTO requestDTO, Part part, Vehicle vehicle) {
        if (requestDTO == null) return null;

        ServiceHistory entity = new ServiceHistory();
        // Convert Date to String for entity
        entity.setServiceDate(DATE_FORMAT.format(requestDTO.getServiceDate()));
        entity.setServiceType(requestDTO.getServiceType());
        entity.setDescription(requestDTO.getDescription());
        entity.setPart(part);
        entity.setVehicle(vehicle);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(ServiceHistory entity, ServiceHistoryRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) return;

        // Convert Date to String for entity
        entity.setServiceDate(DATE_FORMAT.format(requestDTO.getServiceDate()));
        entity.setServiceType(requestDTO.getServiceType());
        entity.setDescription(requestDTO.getDescription());
        // Part và Vehicle không thay đổi khi update
    }

    // Entity -> Response DTO (cho API response)
    public static ServiceHistoryResponseDTO toResponseDTO(ServiceHistory entity) {
        if (entity == null) return null;

        ServiceHistoryResponseDTO responseDTO = new ServiceHistoryResponseDTO();
        responseDTO.setServiceHistoryId(entity.getServiceHistoryId());

        // Convert String to Date for response DTO
        try {
            responseDTO.setServiceDate(DATE_FORMAT.parse(entity.getServiceDate()));
        } catch (ParseException e) {
            // Fallback: set current date if parse fails
            responseDTO.setServiceDate(new Date());
        }

        responseDTO.setServiceType(entity.getServiceType());
        responseDTO.setDescription(entity.getDescription());

        if (entity.getPart() != null) {
            responseDTO.setPartId(entity.getPart().getPartId());
            responseDTO.setPartName(entity.getPart().getPartName());
        }

        if (entity.getVehicle() != null) {
            responseDTO.setVehicleId(entity.getVehicle().getVehicleId());
            responseDTO.setVehicleName(entity.getVehicle().getVehicleName());
            responseDTO.setVehicleVin(entity.getVehicle().getVehicleVin());
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<ServiceHistoryResponseDTO> toResponseDTOList(List<ServiceHistory> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(ServiceHistoryMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
