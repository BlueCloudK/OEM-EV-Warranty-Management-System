package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.response.RecallResponseResponseDTO;
import com.swp391.warrantymanagement.entity.RecallResponse;

/**
 * Mapper để chuyển đổi giữa RecallResponse entity và DTO.
 * <p>
 * <strong>Thiết kế:</strong> Sử dụng static methods thay vì MapStruct để tránh dependency overhead.
 */
public class RecallResponseMapper {

    /**
     * Chuyển đổi RecallResponse entity sang RecallResponseResponseDTO.
     *
     * @param entity RecallResponse entity
     * @return RecallResponseResponseDTO
     */
    public static RecallResponseResponseDTO toResponseDTO(RecallResponse entity) {
        if (entity == null) {
            return null;
        }

        RecallResponseResponseDTO dto = new RecallResponseResponseDTO();
        dto.setRecallResponseId(entity.getRecallResponseId());

        // ===== RECALL CAMPAIGN INFO =====
        if (entity.getRecallRequest() != null) {
            dto.setRecallRequestId(entity.getRecallRequest().getRecallRequestId());
            dto.setRecallReason(entity.getRecallRequest().getReason());
        }

        // ===== VEHICLE INFO =====
        if (entity.getVehicle() != null) {
            dto.setVehicleId(entity.getVehicle().getVehicleId());
            dto.setVehicleVin(entity.getVehicle().getVehicleVin());
            dto.setVehicleModel(entity.getVehicle().getVehicleModel());
        }

        // ===== PART INFO (từ RecallRequest) =====
        if (entity.getRecallRequest() != null && entity.getRecallRequest().getPart() != null) {
            dto.setPartId(entity.getRecallRequest().getPart().getPartId());
            dto.setPartName(entity.getRecallRequest().getPart().getPartName());
            dto.setPartNumber(entity.getRecallRequest().getPart().getPartNumber());
        }

        // ===== RESPONSE STATUS =====
        dto.setStatus(entity.getStatus());
        if (entity.getStatus() != null) {
            dto.setStatusVietnamese(entity.getStatus().getVietnameseName());
        }

        // ===== CUSTOMER RESPONSE =====
        dto.setCustomerNote(entity.getCustomerNote());

        // ===== WARRANTY CLAIM (nếu có) =====
        if (entity.getWarrantyClaim() != null) {
            dto.setWarrantyClaimId(entity.getWarrantyClaim().getWarrantyClaimId());
            if (entity.getWarrantyClaim().getStatus() != null) {
                dto.setWarrantyClaimStatus(entity.getWarrantyClaim().getStatus().name());
            }
        }

        // ===== TIMESTAMPS =====
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setRespondedAt(entity.getRespondedAt());
        dto.setCompletedAt(entity.getCompletedAt());

        return dto;
    }
}
