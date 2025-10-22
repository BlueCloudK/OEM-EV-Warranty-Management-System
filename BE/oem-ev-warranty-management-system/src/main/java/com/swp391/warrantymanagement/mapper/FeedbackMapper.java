package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.FeedbackRequestDTO;
import com.swp391.warrantymanagement.dto.response.FeedbackResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Feedback;
import com.swp391.warrantymanagement.entity.WarrantyClaim;

import java.util.List;
import java.util.stream.Collectors;

/**
 * FeedbackMapper - Converts between Feedback Entity and DTOs
 */
public final class FeedbackMapper {
    private FeedbackMapper() {}

    // Request DTO -> Entity (for create operations)
    public static Feedback toEntity(FeedbackRequestDTO requestDTO, WarrantyClaim warrantyClaim, Customer customer) {
        if (requestDTO == null) return null;

        Feedback entity = new Feedback();
        entity.setRating(requestDTO.getRating());
        entity.setComment(requestDTO.getComment());
        entity.setWarrantyClaim(warrantyClaim);
        entity.setCustomer(customer);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(Feedback entity, FeedbackRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) return;

        entity.setRating(requestDTO.getRating());
        entity.setComment(requestDTO.getComment());
    }

    // Entity -> Response DTO (for API response)
    public static FeedbackResponseDTO toResponseDTO(Feedback entity) {
        if (entity == null) return null;

        FeedbackResponseDTO responseDTO = new FeedbackResponseDTO();
        responseDTO.setFeedbackId(entity.getFeedbackId());
        responseDTO.setRating(entity.getRating());
        responseDTO.setComment(entity.getComment());
        responseDTO.setCreatedAt(entity.getCreatedAt());

        // Warranty claim information
        if (entity.getWarrantyClaim() != null) {
            responseDTO.setWarrantyClaimId(entity.getWarrantyClaim().getWarrantyClaimId());
            responseDTO.setClaimDescription(entity.getWarrantyClaim().getDescription());
        }

        // Customer information
        if (entity.getCustomer() != null) {
            responseDTO.setCustomerId(entity.getCustomer().getCustomerId().toString()); // UUID to String
            responseDTO.setCustomerName(entity.getCustomer().getName()); // Customer.name
            if (entity.getCustomer().getUser() != null) {
                responseDTO.setCustomerEmail(entity.getCustomer().getUser().getEmail()); // Through User
            }
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<FeedbackResponseDTO> toResponseDTOList(List<Feedback> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(FeedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
