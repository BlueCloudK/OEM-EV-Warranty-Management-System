package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.mapper.VehicleMapper;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.VehicleService;
import com.swp391.warrantymanagement.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class VehicleServiceImpl implements VehicleService {
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;

    @Override
    public PagedResponse<VehicleResponseDTO> getAllVehiclesPage(Pageable pageable, String search) {
        Page<Vehicle> vehiclePage;
        if (search != null && !search.trim().isEmpty()) {
            vehiclePage = vehicleRepository.findByVehicleNameContainingIgnoreCaseOrVehicleModelContainingIgnoreCase(
                search, search, pageable);
        } else {
            vehiclePage = vehicleRepository.findAll(pageable);
        }

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

        // Check if VIN already exists
        if (vehicleRepository.existsByVehicleVin(requestDTO.getVehicleVin())) {
            throw new RuntimeException("Vehicle with VIN " + requestDTO.getVehicleVin() + " already exists");
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

        // Check if VIN already exists for other vehicles
        Vehicle existingVinVehicle = vehicleRepository.findByVehicleVin(requestDTO.getVehicleVin());
        if (existingVinVehicle != null && !existingVinVehicle.getVehicleId().equals(id)) {
            throw new RuntimeException("Vehicle with VIN " + requestDTO.getVehicleVin() + " already exists");
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
    public PagedResponse<VehicleResponseDTO> getVehiclesByCustomerId(UUID customerId, Pageable pageable) {
        Page<Vehicle> vehiclePage = vehicleRepository.findByCustomerCustomerId(customerId, pageable);
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
    public PagedResponse<VehicleResponseDTO> getVehiclesByCurrentUser(String authorizationHeader, Pageable pageable) {
        // Extract token from Authorization header
        String token = extractTokenFromHeader(authorizationHeader);
        if (token == null || !jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid or missing authorization token");
        }

        // Get username from token
        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Get customer associated with this user
        Customer customer = customerRepository.findByUser(user);
        if (customer == null) {
            throw new RuntimeException("Customer profile not found for user");
        }

        // Get vehicles for this customer
        return getVehiclesByCustomerId(customer.getCustomerId(), pageable);
    }

    @Override
    public VehicleResponseDTO getVehicleByVin(String vin) {
        Vehicle vehicle = vehicleRepository.findByVehicleVin(vin);
        return VehicleMapper.toResponseDTO(vehicle);
    }

    @Override
    public PagedResponse<VehicleResponseDTO> searchVehicles(String model, String brand, Pageable pageable) {
        Page<Vehicle> vehiclePage;

        if (model != null && brand != null) {
            vehiclePage = vehicleRepository.findByVehicleModelContainingIgnoreCaseAndVehicleNameContainingIgnoreCase(
                model, brand, pageable);
        } else if (model != null) {
            vehiclePage = vehicleRepository.findByVehicleModelContainingIgnoreCase(model, pageable);
        } else if (brand != null) {
            vehiclePage = vehicleRepository.findByVehicleNameContainingIgnoreCase(brand, pageable);
        } else {
            vehiclePage = vehicleRepository.findAll(pageable);
        }

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
    public PagedResponse<VehicleResponseDTO> getVehiclesWithExpiringWarranty(int daysFromNow, Pageable pageable) {
        // Calculate warranty expiration based on vehicle year and warranty period
        int currentYear = LocalDate.now().getYear();
        int warrantyYears = 3; // Assume 3-year warranty
        int cutoffYear = currentYear - warrantyYears + (daysFromNow / 365);

        Page<Vehicle> vehiclePage = vehicleRepository.findByVehicleYearLessThanEqual(cutoffYear, pageable);
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
    public List<VehicleResponseDTO> getVehiclesByCustomerIdSimple(UUID customerId) {
        List<Vehicle> vehicles = vehicleRepository.findByCustomerCustomerId(customerId);
        return VehicleMapper.toResponseDTOList(vehicles);
    }

    private String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }
}
