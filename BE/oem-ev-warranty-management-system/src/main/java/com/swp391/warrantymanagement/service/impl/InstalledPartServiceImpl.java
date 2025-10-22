package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.InstalledPartMapper;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.InstalledPartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * InstalledPartServiceImpl - Implementation of InstalledPartService
 * Handles part installation management for Dealer Staff
 */
@Service
public class InstalledPartServiceImpl implements InstalledPartService {
    @Autowired
    private InstalledPartRepository installedPartRepository;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public PagedResponse<InstalledPartResponseDTO> getAllInstalledParts(Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findAll(pageable);
        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }

    @Override
    public InstalledPartResponseDTO getInstalledPartById(String id) {
        InstalledPart installedPart = installedPartRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", id));
        return InstalledPartMapper.toResponseDTO(installedPart);
    }

    @Override
    @Transactional
    public InstalledPartResponseDTO createInstalledPart(InstalledPartRequestDTO requestDTO) {
        // Validate Part exists
        Part part = partRepository.findById(requestDTO.getPartId())
            .orElseThrow(() -> new ResourceNotFoundException("Part", "id", requestDTO.getPartId()));

        // Validate Vehicle exists
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        // Validate warranty expiration date is after installation date
        if (requestDTO.getWarrantyExpirationDate().isBefore(requestDTO.getInstallationDate())) {
            throw new RuntimeException("Warranty expiration date must be after installation date");
        }

        // Convert DTO to Entity
        InstalledPart installedPart = InstalledPartMapper.toEntity(requestDTO, part, vehicle);

        // Save entity
        InstalledPart savedInstalledPart = installedPartRepository.save(installedPart);

        // Convert entity back to response DTO
        return InstalledPartMapper.toResponseDTO(savedInstalledPart);
    }

    @Override
    @Transactional
    public InstalledPartResponseDTO updateInstalledPart(String id, InstalledPartRequestDTO requestDTO) {
        InstalledPart existingInstalledPart = installedPartRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InstalledPart", "id", id));

        // Validate Part exists
        Part part = partRepository.findById(requestDTO.getPartId())
            .orElseThrow(() -> new ResourceNotFoundException("Part", "id", requestDTO.getPartId()));

        // Validate Vehicle exists
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        // Validate warranty expiration date is after installation date
        if (requestDTO.getWarrantyExpirationDate().isBefore(requestDTO.getInstallationDate())) {
            throw new RuntimeException("Warranty expiration date must be after installation date");
        }

        // Update entity from DTO
        InstalledPartMapper.updateEntity(existingInstalledPart, requestDTO, part, vehicle);

        // Save updated entity
        InstalledPart updatedInstalledPart = installedPartRepository.save(existingInstalledPart);

        // Convert entity back to response DTO
        return InstalledPartMapper.toResponseDTO(updatedInstalledPart);
    }

    @Override
    @Transactional
    public boolean deleteInstalledPart(String id) {
        if (!installedPartRepository.existsById(id)) {
            return false;
        }
        installedPartRepository.deleteById(id);
        return true;
    }

    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsByVehicle(Long vehicleId, Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findByVehicleVehicleId(vehicleId, pageable);
        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }

    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsByPart(String partId, Pageable pageable) {
        Page<InstalledPart> installedPartPage = installedPartRepository.findByPartPartId(partId, pageable);
        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }

    @Override
    public PagedResponse<InstalledPartResponseDTO> getInstalledPartsWithExpiringWarranty(
            int daysFromNow, Pageable pageable) {
        LocalDate cutoffDate = LocalDate.now().plusDays(daysFromNow);

        Page<InstalledPart> installedPartPage = installedPartRepository.findByWarrantyExpirationDateBefore(
            cutoffDate, pageable);
        List<InstalledPartResponseDTO> responseDTOs = InstalledPartMapper.toResponseDTOList(
            installedPartPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            installedPartPage.getNumber(),
            installedPartPage.getSize(),
            installedPartPage.getTotalElements(),
            installedPartPage.getTotalPages(),
            installedPartPage.isFirst(),
            installedPartPage.isLast()
        );
    }
}
