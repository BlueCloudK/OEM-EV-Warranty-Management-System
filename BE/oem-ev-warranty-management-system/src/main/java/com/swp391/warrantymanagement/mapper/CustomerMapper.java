package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi Customer Entity ↔ DTO theo thiết kế DAL
 * Customer entity chỉ chứa: name, phone, user
 * Email và address được lưu trong User entity
 */
public final class CustomerMapper {
    private CustomerMapper() {}

    // Request DTO -> Entity (cho create/update operations)
    public static Customer toEntity(CustomerRequestDTO requestDTO, User user) {
        if (requestDTO == null) return null;

        Customer entity = new Customer();
        entity.setCustomerId(UUID.randomUUID());
        entity.setName(requestDTO.getName());
        entity.setPhone(requestDTO.getPhone());
        entity.setUser(user);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(Customer entity, CustomerRequestDTO requestDTO, User user) {
        if (entity == null || requestDTO == null) return;

        entity.setName(requestDTO.getName());
        entity.setPhone(requestDTO.getPhone());
        entity.setUser(user);
    }

    // Entity -> Response DTO (cho API response)
    // Lấy email và address từ User entity
    public static CustomerResponseDTO toResponseDTO(Customer entity) {
        if (entity == null) return null;

        CustomerResponseDTO responseDTO = new CustomerResponseDTO();
        responseDTO.setCustomerId(entity.getCustomerId());
        responseDTO.setName(entity.getName());
        responseDTO.setPhone(entity.getPhone());

        // Lấy email, address, username từ User
        if (entity.getUser() != null) {
            responseDTO.setUserId(entity.getUser().getUserId());
            responseDTO.setUsername(entity.getUser().getUsername());
            responseDTO.setEmail(entity.getUser().getEmail());
            responseDTO.setAddress(entity.getUser().getAddress());
            responseDTO.setCreatedAt(java.sql.Timestamp.valueOf(entity.getUser().getCreatedAt()));
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<CustomerResponseDTO> toResponseDTOList(List<Customer> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(CustomerMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
