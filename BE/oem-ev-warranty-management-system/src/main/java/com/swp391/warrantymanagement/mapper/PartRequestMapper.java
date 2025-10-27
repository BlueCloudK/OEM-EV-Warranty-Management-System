package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper cho PartRequest Entity ↔ DTO
 */
public final class PartRequestMapper {
    private PartRequestMapper() {}

    // Request DTO -> Entity (cho create operation)
    public static PartRequest toEntity(PartRequestDTO requestDTO, WarrantyClaim warrantyClaim,
                                       Part faultyPart, User requestedBy, ServiceCenter serviceCenter) {
        if (requestDTO == null) return null;

        PartRequest entity = new PartRequest();
        entity.setWarrantyClaim(warrantyClaim);
        entity.setFaultyPart(faultyPart);
        entity.setRequestedBy(requestedBy);
        entity.setServiceCenter(serviceCenter);
        entity.setRequestDate(LocalDateTime.now());
        entity.setIssueDescription(requestDTO.getIssueDescription());
        entity.setQuantity(requestDTO.getQuantity());

        return entity;
    }

    // Entity -> Response DTO
    public static PartRequestResponseDTO toResponseDTO(PartRequest entity) {
        if (entity == null) return null;

        PartRequestResponseDTO responseDTO = new PartRequestResponseDTO();
        responseDTO.setRequestId(entity.getRequestId());
        responseDTO.setRequestDate(entity.getRequestDate());
        responseDTO.setIssueDescription(entity.getIssueDescription());
        responseDTO.setStatus(entity.getStatus());
        responseDTO.setQuantity(entity.getQuantity());
        responseDTO.setApprovedDate(entity.getApprovedDate());
        responseDTO.setShippedDate(entity.getShippedDate());
        responseDTO.setDeliveredDate(entity.getDeliveredDate());
        responseDTO.setRejectionReason(entity.getRejectionReason());
        responseDTO.setTrackingNumber(entity.getTrackingNumber());
        responseDTO.setNotes(entity.getNotes());

        // Warranty Claim
        if (entity.getWarrantyClaim() != null) {
            responseDTO.setWarrantyClaimId(entity.getWarrantyClaim().getWarrantyClaimId());
        }

        // Faulty Part
        if (entity.getFaultyPart() != null) {
            responseDTO.setFaultyPartId(entity.getFaultyPart().getPartId());
            responseDTO.setFaultyPartName(entity.getFaultyPart().getPartName());
            responseDTO.setFaultyPartNumber(entity.getFaultyPart().getPartNumber());
        }

        // Requested By
        if (entity.getRequestedBy() != null) {
            responseDTO.setRequestedByUserId(entity.getRequestedBy().getUserId());
            responseDTO.setRequestedByUsername(entity.getRequestedBy().getUsername());
        }

        // Approved By
        if (entity.getApprovedBy() != null) {
            responseDTO.setApprovedByUserId(entity.getApprovedBy().getUserId());
            responseDTO.setApprovedByUsername(entity.getApprovedBy().getUsername());
        }

        // Service Center
        if (entity.getServiceCenter() != null) {
            responseDTO.setServiceCenterId(entity.getServiceCenter().getServiceCenterId());
            responseDTO.setServiceCenterName(entity.getServiceCenter().getName());
            responseDTO.setServiceCenterAddress(entity.getServiceCenter().getAddress());
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<PartRequestResponseDTO> toResponseDTOList(List<PartRequest> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(PartRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}

