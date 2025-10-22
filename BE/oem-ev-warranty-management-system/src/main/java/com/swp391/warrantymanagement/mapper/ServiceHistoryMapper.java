package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.Vehicle;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi ServiceHistory Entity ↔ DTO theo thiết kế DAL
 * ServiceHistory entity đã chuyển sang dùng ServiceHistoryDetail
 */
public final class ServiceHistoryMapper {
    private ServiceHistoryMapper() {}

    // Request DTO -> Entity (cho create/update operations)
    // NOTE: ServiceHistoryDetail phải được tạo riêng sau khi save ServiceHistory
    public static ServiceHistory toEntity(ServiceHistoryRequestDTO requestDTO, Vehicle vehicle) {
        if (requestDTO == null) return null;

        ServiceHistory entity = new ServiceHistory();
        // Convert Date to LocalDate
        entity.setServiceDate(requestDTO.getServiceDate().toInstant()
            .atZone(ZoneId.systemDefault()).toLocalDate());
        entity.setServiceType(requestDTO.getServiceType());
        entity.setDescription(requestDTO.getDescription());
        entity.setVehicle(vehicle);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(ServiceHistory entity, ServiceHistoryRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) return;

        // Convert Date to LocalDate
        entity.setServiceDate(requestDTO.getServiceDate().toInstant()
            .atZone(ZoneId.systemDefault()).toLocalDate());
        entity.setServiceType(requestDTO.getServiceType());
        entity.setDescription(requestDTO.getDescription());
        // Vehicle không thay đổi khi update
    }

    // Entity -> Response DTO (cho API response)
    public static ServiceHistoryResponseDTO toResponseDTO(ServiceHistory entity) {
        if (entity == null) return null;

        ServiceHistoryResponseDTO responseDTO = new ServiceHistoryResponseDTO();
        responseDTO.setServiceHistoryId(entity.getServiceHistoryId());

        // Convert LocalDate to Date for response DTO
        responseDTO.setServiceDate(Date.from(entity.getServiceDate()
            .atStartOfDay(ZoneId.systemDefault()).toInstant()));

        responseDTO.setServiceType(entity.getServiceType());
        responseDTO.setDescription(entity.getDescription());

        // Get parts from ServiceHistoryDetails
        if (entity.getServiceHistoryDetails() != null && !entity.getServiceHistoryDetails().isEmpty()) {
            // Lấy part đầu tiên (hoặc có thể combine tất cả parts)
            var firstDetail = entity.getServiceHistoryDetails().get(0);
            if (firstDetail.getPart() != null) {
                responseDTO.setPartId(firstDetail.getPart().getPartId());
                responseDTO.setPartName(firstDetail.getPart().getPartName());
            }
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
