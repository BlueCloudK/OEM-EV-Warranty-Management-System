package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.mapper.PartMapper;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.PartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartServiceImpl implements PartService {
    @Autowired
    private PartRepository partRepository;
    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable) {
        Page<Part> partPage = partRepository.findAll(pageable);
        List<PartResponseDTO> responseDTOs = PartMapper.toResponseDTOList(partPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            partPage.getNumber(),
            partPage.getSize(),
            partPage.getTotalElements(),
            partPage.getTotalPages(),
            partPage.isFirst(),
            partPage.isLast()
        );
    }

    @Override
    public PartResponseDTO getPartById(String id) {
        Part part = partRepository.findById(id).orElse(null);
        return PartMapper.toResponseDTO(part);
    }

    @Override
    public PartResponseDTO createPart(PartRequestDTO requestDTO) {
        // Load Vehicle entity từ vehicleId
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId()).orElse(null);
        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: " + requestDTO.getVehicleId());
        }

        // Convert DTO to Entity
        Part part = PartMapper.toEntity(requestDTO, vehicle);

        // Save entity
        Part savedPart = partRepository.save(part);

        // Convert entity back to response DTO
        return PartMapper.toResponseDTO(savedPart);
    }

    @Override
    public PartResponseDTO updatePart(String id, PartRequestDTO requestDTO) {
        Part existingPart = partRepository.findById(id).orElse(null);
        if (existingPart == null) {
            return null;
        }

        // Load Vehicle entity từ vehicleId
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId()).orElse(null);
        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: " + requestDTO.getVehicleId());
        }

        // Update entity từ DTO
        PartMapper.updateEntity(existingPart, requestDTO, vehicle);

        // Save updated entity
        Part updatedPart = partRepository.save(existingPart);

        // Convert entity back to response DTO
        return PartMapper.toResponseDTO(updatedPart);
    }

    @Override
    public boolean deletePart(String id) {
        if (!partRepository.existsById(id)) {
            return false;
        }
        partRepository.deleteById(id);
        return true;
    }

    @Override
    public List<PartResponseDTO> searchPartsByName(String name) {
        List<Part> parts = partRepository.findByPartNameContainingIgnoreCase(name);
        return PartMapper.toResponseDTOList(parts);
    }

    @Override
    public List<PartResponseDTO> searchPartsByManufacturer(String manufacturer) {
        List<Part> parts = partRepository.findByManufacturerContainingIgnoreCase(manufacturer);
        return PartMapper.toResponseDTOList(parts);
    }

    @Override
    public List<PartResponseDTO> findPartsByVehicleId(Long vehicleId) {
        // Gọi method mới trong repository
        List<Part> parts = partRepository.findByVehicleVehicleId(vehicleId);
        return PartMapper.toResponseDTOList(parts);
    }
}
