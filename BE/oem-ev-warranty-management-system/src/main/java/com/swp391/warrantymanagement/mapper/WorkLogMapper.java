package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.WorkLogRequestDTO;
import com.swp391.warrantymanagement.dto.response.WorkLogResponseDTO;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WorkLog;

import java.util.List;
import java.util.stream.Collectors;

/**
 * WorkLogMapper - Converts between WorkLog Entity and DTOs
 */
public final class WorkLogMapper {
    private WorkLogMapper() {}

    // Request DTO -> Entity (for create operations)
    public static WorkLog toEntity(WorkLogRequestDTO requestDTO, User user, WarrantyClaim warrantyClaim) {
        if (requestDTO == null) return null;

        WorkLog entity = new WorkLog();
        entity.setStartTime(requestDTO.getStartTime());
        entity.setEndTime(requestDTO.getEndTime());
        entity.setDescription(requestDTO.getDescription());
        entity.setUser(user);
        entity.setWarrantyClaim(warrantyClaim);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(WorkLog entity, WorkLogRequestDTO requestDTO,
                                   User user, WarrantyClaim warrantyClaim) {
        if (entity == null || requestDTO == null) return;

        entity.setStartTime(requestDTO.getStartTime());
        entity.setEndTime(requestDTO.getEndTime());
        entity.setDescription(requestDTO.getDescription());
        entity.setUser(user);
        entity.setWarrantyClaim(warrantyClaim);
    }

    // Entity -> Response DTO (for API response)
    public static WorkLogResponseDTO toResponseDTO(WorkLog entity) {
        if (entity == null) return null;

        WorkLogResponseDTO responseDTO = new WorkLogResponseDTO();
        responseDTO.setWorkLogId(entity.getWorkLogId());
        responseDTO.setStartTime(entity.getStartTime());
        responseDTO.setEndTime(entity.getEndTime());
        responseDTO.setDescription(entity.getDescription());

        // User information
        if (entity.getUser() != null) {
            responseDTO.setUserId(entity.getUser().getUserId());
            responseDTO.setUsername(entity.getUser().getUsername());
            responseDTO.setUserEmail(entity.getUser().getEmail());
        }

        // Warranty claim information
        if (entity.getWarrantyClaim() != null) {
            responseDTO.setWarrantyClaimId(entity.getWarrantyClaim().getWarrantyClaimId());
            responseDTO.setClaimDescription(entity.getWarrantyClaim().getDescription());
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<WorkLogResponseDTO> toResponseDTOList(List<WorkLog> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(WorkLogMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
