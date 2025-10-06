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

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Service
public class PartServiceImpl implements PartService {
    @Autowired
    private PartRepository partRepository;
    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public PagedResponse<PartResponseDTO> getAllPartsPage(Pageable pageable, String search) {
        Page<Part> partPage;
        if (search != null && !search.trim().isEmpty()) {
            partPage = partRepository.findByPartNameContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
                search, search, pageable);
        } else {
            partPage = partRepository.findAll(pageable);
        }

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
    public PagedResponse<PartResponseDTO> getPartsByVehicleId(Long vehicleId, Pageable pageable) {
        Page<Part> partPage = partRepository.findByVehicleVehicleId(vehicleId, pageable);
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
    public PagedResponse<PartResponseDTO> getPartsByManufacturer(String manufacturer, Pageable pageable) {
        Page<Part> partPage = partRepository.findByManufacturerContainingIgnoreCase(manufacturer, pageable);
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
    public PagedResponse<PartResponseDTO> getPartsWithExpiringWarranty(int daysFromNow, Pageable pageable) {
        // Convert LocalDate to Date for compatibility with Part entity
        LocalDate cutoffLocalDate = LocalDate.now().plusDays(daysFromNow);
        Date cutoffDate = java.sql.Date.valueOf(cutoffLocalDate);

        // Use correct field name from Part entity
        Page<Part> partPage = partRepository.findByWarrantyExpirationDateBefore(cutoffDate, pageable);
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
    public List<PartResponseDTO> searchPartsByName(String name) {
        List<Part> parts = partRepository.findByPartNameContainingIgnoreCase(name);
        return PartMapper.toResponseDTOList(parts);
    }

    @Override
    public List<PartResponseDTO> findPartsByVehicleId(Long vehicleId) {
        List<Part> parts = partRepository.findByVehicleVehicleId(vehicleId);
        return PartMapper.toResponseDTOList(parts);
    }
}
