package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.mapper.ServiceHistoryMapper;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.repository.CustomerRepository;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import com.swp391.warrantymanagement.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ServiceHistoryServiceImpl implements ServiceHistoryService {
    @Autowired
    private ServiceHistoryRepository serviceHistoryRepository;
    @Autowired
    private PartRepository partRepository;
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;

    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getAllServiceHistoriesPage(Pageable pageable, String search) {
        Page<ServiceHistory> serviceHistoryPage;
        if (search != null && !search.trim().isEmpty()) {
            // Tạm thời sử dụng simple search cho serviceType thôi
            serviceHistoryPage = serviceHistoryRepository.findByServiceTypeContainingIgnoreCase(search, pageable);
        } else {
            serviceHistoryPage = serviceHistoryRepository.findAll(pageable);
        }

        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    @Override
    public ServiceHistoryResponseDTO getServiceHistoryById(Long id) {
        ServiceHistory serviceHistory = serviceHistoryRepository.findById(id).orElse(null);
        return ServiceHistoryMapper.toResponseDTO(serviceHistory);
    }

    @Override
    public ServiceHistoryResponseDTO createServiceHistory(ServiceHistoryRequestDTO requestDTO) {
        // Load Part entity từ partId
        Part part = partRepository.findById(requestDTO.getPartId()).orElse(null);
        if (part == null) {
            throw new RuntimeException("Part not found with id: " + requestDTO.getPartId());
        }

        // Load Vehicle entity từ vehicleId
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId()).orElse(null);
        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: " + requestDTO.getVehicleId());
        }

        // Convert DTO to Entity
        ServiceHistory serviceHistory = ServiceHistoryMapper.toEntity(requestDTO, part, vehicle);

        // Save entity
        ServiceHistory savedServiceHistory = serviceHistoryRepository.save(serviceHistory);

        // Convert entity back to response DTO
        return ServiceHistoryMapper.toResponseDTO(savedServiceHistory);
    }

    @Override
    public ServiceHistoryResponseDTO updateServiceHistory(Long id, ServiceHistoryRequestDTO requestDTO) {
        ServiceHistory existingServiceHistory = serviceHistoryRepository.findById(id).orElse(null);
        if (existingServiceHistory == null) {
            return null;
        }

        // Update entity từ DTO (không thay đổi part và vehicle relationships)
        ServiceHistoryMapper.updateEntity(existingServiceHistory, requestDTO);

        // Save updated entity
        ServiceHistory updatedServiceHistory = serviceHistoryRepository.save(existingServiceHistory);

        // Convert entity back to response DTO
        return ServiceHistoryMapper.toResponseDTO(updatedServiceHistory);
    }

    @Override
    public boolean deleteServiceHistory(Long id) {
        if (!serviceHistoryRepository.existsById(id)) {
            return false;
        }
        serviceHistoryRepository.deleteById(id);
        return true;
    }

    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByVehicleId(Long vehicleId, Pageable pageable) {
        Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByVehicleVehicleId(vehicleId, pageable);
        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByPartId(String partId, Pageable pageable) {
        Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByPartPartId(partId, pageable);
        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByCurrentUser(String authorizationHeader, Pageable pageable) {
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

        // Get service histories for customer's vehicles
        Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByVehicleCustomerCustomerId(
            customer.getCustomerId(), pageable);
        List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            serviceHistoryPage.getNumber(),
            serviceHistoryPage.getSize(),
            serviceHistoryPage.getTotalElements(),
            serviceHistoryPage.getTotalPages(),
            serviceHistoryPage.isFirst(),
            serviceHistoryPage.isLast()
        );
    }

    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getServiceHistoriesByDateRange(String startDate, String endDate, Pageable pageable) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate start = LocalDate.parse(startDate, formatter);
            LocalDate end = LocalDate.parse(endDate, formatter);

            Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findByServiceDateBetween(
                start, end, pageable);
            List<ServiceHistoryResponseDTO> responseDTOs = ServiceHistoryMapper.toResponseDTOList(serviceHistoryPage.getContent());

            return new PagedResponse<>(
                responseDTOs,
                serviceHistoryPage.getNumber(),
                serviceHistoryPage.getSize(),
                serviceHistoryPage.getTotalElements(),
                serviceHistoryPage.getTotalPages(),
                serviceHistoryPage.isFirst(),
                serviceHistoryPage.isLast()
            );
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format. Please use yyyy-MM-dd format.");
        }
    }

    @Override
    public List<ServiceHistoryResponseDTO> searchServiceHistoriesByType(String serviceType) {
        List<ServiceHistory> serviceHistories = serviceHistoryRepository.findByServiceTypeContainingIgnoreCase(serviceType);
        return ServiceHistoryMapper.toResponseDTOList(serviceHistories);
    }

    private String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }
}
