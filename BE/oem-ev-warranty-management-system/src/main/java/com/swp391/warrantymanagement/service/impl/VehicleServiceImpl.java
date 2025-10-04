package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.mapper.VehicleMapper;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class VehicleServiceImpl implements VehicleService {
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public PagedResponse<VehicleResponseDTO> getAllVehiclesPage(Pageable pageable) {
        Page<Vehicle> vehiclePage = vehicleRepository.findAll(pageable);
        List<VehicleResponseDTO> responseDTOs = VehicleMapper.toResponseDTOList(vehiclePage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            vehiclePage.getNumber(),
            vehiclePage.getSize(),
            vehiclePage.getTotalElements(),
            vehiclePage.getTotalPages(),
            vehiclePage.isFirst(),
            vehiclePage.isLast()
        );
    }

    @Override
    public VehicleResponseDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id).orElse(null);
        return VehicleMapper.toResponseDTO(vehicle);
    }

    @Override
    public VehicleResponseDTO createVehicle(VehicleRequestDTO requestDTO) {
        // Load Customer entity từ customerId
        Customer customer = customerRepository.findById(UUID.fromString(requestDTO.getCustomerId())).orElse(null);
        if (customer == null) {
            throw new RuntimeException("Customer not found with id: " + requestDTO.getCustomerId());
        }

        // Convert DTO to Entity
        Vehicle vehicle = VehicleMapper.toEntity(requestDTO, customer);

        // Save entity
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // Convert entity back to response DTO
        return VehicleMapper.toResponseDTO(savedVehicle);
    }

    @Override
    public VehicleResponseDTO updateVehicle(Long id, VehicleRequestDTO requestDTO) {
        Vehicle existingVehicle = vehicleRepository.findById(id).orElse(null);
        if (existingVehicle == null) {
            return null;
        }

        // Load Customer entity từ customerId
        Customer customer = customerRepository.findById(UUID.fromString(requestDTO.getCustomerId())).orElse(null);
        if (customer == null) {
            throw new RuntimeException("Customer not found with id: " + requestDTO.getCustomerId());
        }

        // Update entity từ DTO
        VehicleMapper.updateEntity(existingVehicle, requestDTO, customer);

        // Save updated entity
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);

        // Convert entity back to response DTO
        return VehicleMapper.toResponseDTO(updatedVehicle);
    }

    @Override
    public boolean deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            return false;
        }
        vehicleRepository.deleteById(id);
        return true;
    }

    @Override
    public List<VehicleResponseDTO> getVehiclesByCustomerId(UUID customerId) {
        List<Vehicle> vehicles = vehicleRepository.findByCustomerCustomerId(customerId);
        return VehicleMapper.toResponseDTOList(vehicles);
    }

    @Override
    public List<VehicleResponseDTO> searchVehiclesByName(String name) {
        List<Vehicle> vehicles = vehicleRepository.findByVehicleNameContainingIgnoreCase(name);
        return VehicleMapper.toResponseDTOList(vehicles);
    }
}
