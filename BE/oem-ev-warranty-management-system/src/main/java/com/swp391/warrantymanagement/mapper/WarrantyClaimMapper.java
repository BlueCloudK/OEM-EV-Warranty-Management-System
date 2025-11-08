package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi WarrantyClaim Entity ↔ DTO theo thiết kế DAL
 */
public final class WarrantyClaimMapper {
    private WarrantyClaimMapper() {}

    // Request DTO -> Entity (cho create operation)
    public static WarrantyClaim toEntity(WarrantyClaimRequestDTO requestDTO, InstalledPart installedPart, Vehicle vehicle) {
        if (requestDTO == null) return null;

        WarrantyClaim entity = new WarrantyClaim();
        entity.setDescription(requestDTO.getDescription());
        entity.setInstalledPart(installedPart);
        entity.setVehicle(vehicle);
        entity.setStatus(WarrantyClaimStatus.SUBMITTED); // Business rule: luôn bắt đầu với SUBMITTED
        entity.setClaimDate(LocalDateTime.now());

        // Paid warranty fields
        entity.setIsPaidWarranty(requestDTO.getIsPaidWarranty() != null ? requestDTO.getIsPaidWarranty() : false);
        // estimatedRepairCost không lưu vào DB - chỉ dùng để tính warrantyFee
        entity.setWarrantyFee(requestDTO.getWarrantyFee());
        entity.setPaidWarrantyNote(requestDTO.getPaidWarrantyNote());

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

        // InstalledPart information
        if (entity.getInstalledPart() != null) {
            responseDTO.setInstalledPartId(entity.getInstalledPart().getInstalledPartId());
            if (entity.getInstalledPart().getPart() != null) {
                responseDTO.setPartId(entity.getInstalledPart().getPart().getPartId());
                responseDTO.setPartName(entity.getInstalledPart().getPart().getPartName());
                responseDTO.setPartNumber(entity.getInstalledPart().getPart().getPartNumber());
                responseDTO.setManufacturer(entity.getInstalledPart().getPart().getManufacturer());
            }
        }

        // Vehicle information
        if (entity.getVehicle() != null) {
            responseDTO.setVehicleId(entity.getVehicle().getVehicleId());
            responseDTO.setVehicleName(entity.getVehicle().getVehicleName());
            responseDTO.setVehicleModel(entity.getVehicle().getVehicleModel());
            responseDTO.setVehicleYear(entity.getVehicle().getVehicleYear());
            responseDTO.setVehicleVin(entity.getVehicle().getVehicleVin());

            // Customer information (through vehicle)
            if (entity.getVehicle().getCustomer() != null) {
                responseDTO.setCustomerId(entity.getVehicle().getCustomer().getCustomerId().toString());
                responseDTO.setCustomerName(entity.getVehicle().getCustomer().getName());
                responseDTO.setCustomerPhone(entity.getVehicle().getCustomer().getPhone());
                if (entity.getVehicle().getCustomer().getUser() != null) {
                    responseDTO.setCustomerEmail(entity.getVehicle().getCustomer().getUser().getEmail());
                }
            }
        }

        // Assigned staff information
        if (entity.getAssignedTo() != null) {
            responseDTO.setAssignedToUserId(entity.getAssignedTo().getUserId());
            responseDTO.setAssignedToUsername(entity.getAssignedTo().getUsername());
            responseDTO.setAssignedToEmail(entity.getAssignedTo().getEmail());
        }

        // Paid warranty fields
        responseDTO.setIsPaidWarranty(entity.getIsPaidWarranty() != null ? entity.getIsPaidWarranty() : false);
        // estimatedRepairCost không lưu trong Entity - để null ở response
        responseDTO.setWarrantyFee(entity.getWarrantyFee());
        responseDTO.setPaidWarrantyNote(entity.getPaidWarrantyNote());

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
