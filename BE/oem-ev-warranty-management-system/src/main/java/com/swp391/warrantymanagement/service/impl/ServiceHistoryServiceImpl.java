package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.mapper.ServiceHistoryMapper;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceHistoryServiceImpl implements ServiceHistoryService {
    @Autowired
    private ServiceHistoryRepository serviceHistoryRepository;
    @Autowired
    private PartRepository partRepository;
    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public PagedResponse<ServiceHistoryResponseDTO> getAllServiceHistoriesPage(Pageable pageable) {
        Page<ServiceHistory> serviceHistoryPage = serviceHistoryRepository.findAll(pageable);
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
    public List<ServiceHistoryResponseDTO> getServiceHistoriesByPartId(String partId) {
        List<ServiceHistory> serviceHistories = serviceHistoryRepository.findByPartPartId(partId);
        return ServiceHistoryMapper.toResponseDTOList(serviceHistories);
    }

    @Override
    public List<ServiceHistoryResponseDTO> getServiceHistoriesByVehicleId(Long vehicleId) {
        // Gọi method mới trong repository
        List<ServiceHistory> serviceHistories = serviceHistoryRepository.findByVehicleVehicleId(vehicleId);
        return ServiceHistoryMapper.toResponseDTOList(serviceHistories);
    }

    @Override
    public List<ServiceHistoryResponseDTO> searchServiceHistoriesByType(String serviceType) {
        List<ServiceHistory> serviceHistories = serviceHistoryRepository.findByServiceTypeContainingIgnoreCase(serviceType);
        return ServiceHistoryMapper.toResponseDTOList(serviceHistories);
    }
}
