package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.mapper.PartMapper;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.service.PartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * PartServiceImpl - Implementation of PartService
 * Handles standalone part management for EVM Staff (NO vehicle associations)
 */
@Service
public class PartServiceImpl implements PartService {
    @Autowired
    private PartRepository partRepository;

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
        // Check if part number already exists
        Part existingPart = partRepository.findByPartNumber(requestDTO.getPartNumber());
        if (existingPart != null) {
            throw new RuntimeException("Part number already exists: " + requestDTO.getPartNumber());
        }

        // Convert DTO to Entity
        Part part = PartMapper.toEntity(requestDTO);

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

        // Check if part number is being changed and if it already exists
        if (!existingPart.getPartNumber().equals(requestDTO.getPartNumber())) {
            Part partWithSameNumber = partRepository.findByPartNumber(requestDTO.getPartNumber());
            if (partWithSameNumber != null) {
                throw new RuntimeException("Part number already exists: " + requestDTO.getPartNumber());
            }
        }

        // Update entity from DTO
        PartMapper.updateEntity(existingPart, requestDTO);

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
}
