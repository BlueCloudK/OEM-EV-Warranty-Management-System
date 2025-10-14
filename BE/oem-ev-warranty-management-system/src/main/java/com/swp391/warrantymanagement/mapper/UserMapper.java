package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.response.UserResponseDTO;
import com.swp391.warrantymanagement.entity.User;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for User entity to DTO conversion
 */
public final class UserMapper {
    private UserMapper() {}

    /**
     * Convert User entity to UserResponseDTO
     */
    public static UserResponseDTO toResponseDTO(User user) {
        if (user == null) return null;

        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setRoleName(user.getRole().getRoleName());
        dto.setRoleId(user.getRole().getRoleId());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    /**
     * Convert list of User entities to list of UserResponseDTO
     */
    public static List<UserResponseDTO> toResponseDTOList(List<User> users) {
        if (users == null) return null;
        return users.stream()
                .map(UserMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}

