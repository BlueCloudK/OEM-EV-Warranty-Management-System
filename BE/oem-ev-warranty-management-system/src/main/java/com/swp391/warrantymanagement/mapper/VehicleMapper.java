package com.swp391.warrantymanagement.mapper;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.Customer;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi Vehicle Entity ↔ DTO theo thiết kế DAL
 */
public final class VehicleMapper {
    private VehicleMapper() {}

    // Request DTO -> Entity (cho create/update operations)
    public static Vehicle toEntity(VehicleRequestDTO requestDTO, Customer customer) {
        if (requestDTO == null) return null;

        Vehicle entity = new Vehicle();
        entity.setVehicleName(requestDTO.getVehicleName());
        entity.setVehicleModel(requestDTO.getVehicleModel());
        entity.setVehicleYear(requestDTO.getVehicleYear());
        entity.setVehicleVin(requestDTO.getVehicleVin());
        entity.setPurchaseDate(requestDTO.getPurchaseDate());
        entity.setWarrantyStartDate(requestDTO.getWarrantyStartDate());
        entity.setWarrantyEndDate(requestDTO.getWarrantyEndDate());
        entity.setMileage(requestDTO.getMileage());
        entity.setCustomer(customer);

        return entity;
    }

    // Update existing entity from request DTO
    public static void updateEntity(Vehicle entity, VehicleRequestDTO requestDTO, Customer customer) {
        if (entity == null || requestDTO == null) return;

        entity.setVehicleName(requestDTO.getVehicleName());
        entity.setPurchaseDate(requestDTO.getPurchaseDate());
        entity.setWarrantyStartDate(requestDTO.getWarrantyStartDate());
        entity.setWarrantyEndDate(requestDTO.getWarrantyEndDate());
        entity.setVehicleModel(requestDTO.getVehicleModel());
        entity.setVehicleYear(requestDTO.getVehicleYear());
        entity.setMileage(requestDTO.getMileage());
        entity.setVehicleVin(requestDTO.getVehicleVin());
        entity.setCustomer(customer);
    }

    // Entity -> Response DTO (cho API response)
    public static VehicleResponseDTO toResponseDTO(Vehicle entity) {
        if (entity == null) return null;

        VehicleResponseDTO responseDTO = new VehicleResponseDTO();
        responseDTO.setVehicleId(entity.getVehicleId());
        responseDTO.setVehicleName(entity.getVehicleName());
        responseDTO.setVehicleModel(entity.getVehicleModel());
        responseDTO.setVehicleYear(entity.getVehicleYear());
        responseDTO.setVehicleVin(entity.getVehicleVin());
        responseDTO.setPurchaseDate(entity.getPurchaseDate());
        responseDTO.setWarrantyStartDate(entity.getWarrantyStartDate());
        responseDTO.setWarrantyEndDate(entity.getWarrantyEndDate());
        responseDTO.setMileage(entity.getMileage());

        if (entity.getCustomer() != null) {
            responseDTO.setCustomerId(entity.getCustomer().getCustomerId());
            responseDTO.setCustomerName(entity.getCustomer().getName());
        }

        return responseDTO;
    }

    // List Entity -> List Response DTO
    public static List<VehicleResponseDTO> toResponseDTOList(List<Vehicle> entities) {
        if (entities == null) return null;
        return entities.stream()
                .map(VehicleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
