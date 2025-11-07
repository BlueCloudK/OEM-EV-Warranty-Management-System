package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.entity.RecallRequest;
import com.swp391.warrantymanagement.entity.Part;

/**
 * Mapper để chuyển đổi RecallRequest entity sang DTO.
 * <p>
 * <strong>Thay đổi:</strong> RecallRequest giờ link với Part (loại linh kiện) thay vì InstalledPart (cụ thể).
 */
public class RecallRequestMapper {
    public static RecallRequestResponseDTO toResponseDTO(RecallRequest entity) {
        RecallRequestResponseDTO dto = new RecallRequestResponseDTO();
        dto.setRecallRequestId(entity.getRecallRequestId());

        // Part info (loại linh kiện bị lỗi)
        if (entity.getPart() != null) {
            Part part = entity.getPart();
            dto.setPartId(part.getPartId());
            dto.setPartName(part.getPartName());
            dto.setPartNumber(part.getPartNumber());
            dto.setManufacturer(part.getManufacturer());
        }

        // Note: RecallRequest không còn chứa thông tin về vehicle/customer cụ thể
        // Thông tin này giờ nằm trong RecallResponse

        dto.setStatus(entity.getStatus());
        dto.setReason(entity.getReason());
        dto.setAdminNote(entity.getAdminNote());
        dto.setCustomerNote(entity.getCustomerNote());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Created by info
        if (entity.getCreatedBy() != null) {
            dto.setCreatedByUsername(entity.getCreatedBy().getUsername());
        }

        // Approved by info
        if (entity.getApprovedBy() != null) {
            dto.setApprovedByUsername(entity.getApprovedBy().getUsername());
        }

        return dto;
    }
}
