package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.entity.RecallRequest;
import com.swp391.warrantymanagement.entity.InstalledPart;

public class RecallRequestMapper {
    public static RecallRequestResponseDTO toResponseDTO(RecallRequest entity) {
        RecallRequestResponseDTO dto = new RecallRequestResponseDTO();
        dto.setRecallRequestId(entity.getRecallRequestId());
        if (entity.getInstalledPart() != null) {
            InstalledPart ip = entity.getInstalledPart();
            dto.setInstalledPartId(ip.getInstalledPartId());
            if (ip.getPart() != null) {
                dto.setPartId(ip.getPart().getPartId());
                dto.setPartName(ip.getPart().getPartName());
            }
            if (ip.getVehicle() != null) {
                dto.setVehicleId(ip.getVehicle().getVehicleId());
                dto.setVehicleName(ip.getVehicle().getVehicleName());
                if (ip.getVehicle().getCustomer() != null) {
                    dto.setCustomerId(ip.getVehicle().getCustomer().getCustomerId().toString());
                    dto.setCustomerName(ip.getVehicle().getCustomer().getName());
                }
            }
        }
        dto.setStatus(entity.getStatus());
        dto.setReason(entity.getReason());
        dto.setAdminNote(entity.getAdminNote());
        dto.setCustomerNote(entity.getCustomerNote());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
