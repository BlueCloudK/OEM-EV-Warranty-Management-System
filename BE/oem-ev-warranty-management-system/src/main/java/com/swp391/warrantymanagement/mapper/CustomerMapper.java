package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.CustomerRequestDTO;
import com.swp391.warrantymanagement.dto.response.CustomerResponseDTO;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi Customer Entity ↔ DTO theo thiết kế DAL
 */
public final class CustomerMapper {
    private CustomerMapper() {}

    // Request DTO -> Entity (cho create/update operations)
    public static Customer toEntity(CustomerRequestDTO requestDTO, User user) {
        if (requestDTO == null) return null;

        Customer entity = new Customer();
        entity.setName(requestDTO.getName());
        entity.setEmail(requestDTO.getEmail());
        entity.setPhone(requestDTO.getPhone());
        entity.setAddress(requestDTO.getAddress());
        entity.setCreatedAt(new Date());
        entity.setUser(user);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(Customer entity, CustomerRequestDTO requestDTO, User user) {
        if (entity == null || requestDTO == null) return;

        entity.setName(requestDTO.getName());
        entity.setEmail(requestDTO.getEmail());
        entity.setPhone(requestDTO.getPhone());
        entity.setAddress(requestDTO.getAddress());
        entity.setUser(user);
        // createdAt không thay đổi khi update
    }

    // Entity -> Response DTO (cho API response)
    public static CustomerResponseDTO toResponseDTO(Customer entity) {
        if (entity == null) return null;

        CustomerResponseDTO responseDTO = new CustomerResponseDTO();
        responseDTO.setCustomerId(entity.getCustomerId());
        responseDTO.setName(entity.getName());
        responseDTO.setEmail(entity.getEmail());
        responseDTO.setPhone(entity.getPhone());
        responseDTO.setAddress(entity.getAddress());
        responseDTO.setCreatedAt(entity.getCreatedAt());

        if (entity.getUser() != null) {
            responseDTO.setUserId(entity.getUser().getUserId());
            responseDTO.setUsername(entity.getUser().getUsername());
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
