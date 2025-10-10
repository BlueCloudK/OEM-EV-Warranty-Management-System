package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WarrantyClaimStatus;
import com.swp391.warrantymanagement.mapper.WarrantyClaimMapper;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class WarrantyClaimServiceImpl implements WarrantyClaimService {
    @Autowired
    private WarrantyClaimRepository warrantyClaimRepository;
    @Autowired
    private PartRepository partRepository;
    @Autowired
    private VehicleRepository vehicleRepository;

    // Methods implementation
    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getAllClaimsPage(Pageable pageable) {
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findAll(pageable);
        List<WarrantyClaimResponseDTO> responseDTOs = WarrantyClaimMapper.toResponseDTOList(claimPage.getContent());

        return new PagedResponse<>(
            responseDTOs,
            claimPage.getNumber(),
            claimPage.getSize(),
            claimPage.getTotalElements(),
            claimPage.getTotalPages(),
            claimPage.isFirst(),
            claimPage.isLast()
        );
    }

    // Get claim by ID
    @Override
    public WarrantyClaimResponseDTO getClaimById(Long id) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id).orElse(null);
        return WarrantyClaimMapper.toResponseDTO(claim);
    }

    // Create new claim
    @Override
    public WarrantyClaimResponseDTO createClaim(WarrantyClaimRequestDTO requestDTO) {
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
        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, part, vehicle);

        // Save entity
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);

        // Convert entity back to response DTO
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    // Update existing claim (except status)
    @Override
    public WarrantyClaimResponseDTO updateClaim(Long id, WarrantyClaimRequestDTO requestDTO) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id).orElse(null);
        if (claim == null) {
            return null;
        }
        // Update các trường từ DTO (bỏ claimDate vì không có trong DTO)
        claim.setDescription(requestDTO.getDescription());
        // Update part
        Part part = partRepository.findById(requestDTO.getPartId()).orElse(null);
        if (part == null) {
            throw new RuntimeException("Part not found with id: " + requestDTO.getPartId());
        }
        claim.setPart(part);
        // Update vehicle
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId()).orElse(null);
        if (vehicle == null) {
            throw new RuntimeException("Vehicle not found with id: " + requestDTO.getVehicleId());
        }
        claim.setVehicle(vehicle);
        // Save updated entity
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    // Update claim status with business logic validation
    @Override
    public WarrantyClaimResponseDTO updateClaimStatus(Long id, WarrantyClaimStatusUpdateRequestDTO requestDTO) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id).orElse(null);
        if (claim == null) {
            return null;
        }
        // Validate status transition
        if (!isValidStatusTransition(claim.getStatus(), requestDTO.getStatus())) {
            return null;
        }
        // Update status
        claim.setStatus(requestDTO.getStatus());
        if (requestDTO.getStatus() == WarrantyClaimStatus.COMPLETED) {
            claim.setResolutionDate(new Date());
        }
        // Save updated entity
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    // Delete claim by ID
    @Override
    public boolean deleteClaim(Long id) {
        if (!warrantyClaimRepository.existsById(id)) {
            return false;
        }
        warrantyClaimRepository.deleteById(id);
        return true;
    }

    // Helper method cho business logic validation
    private boolean isValidStatusTransition(WarrantyClaimStatus current, WarrantyClaimStatus target) {
        switch (current) {
            case SUBMITTED:
                return target == WarrantyClaimStatus.SC_REVIEW;
            case SC_REVIEW:
                return target == WarrantyClaimStatus.EVM_REVIEW || target == WarrantyClaimStatus.REJECTED;
            case EVM_REVIEW:
                return target == WarrantyClaimStatus.PROCESSING ||
                       target == WarrantyClaimStatus.COMPLETED ||
                       target == WarrantyClaimStatus.REJECTED;
            case PROCESSING:
                return target == WarrantyClaimStatus.COMPLETED || target == WarrantyClaimStatus.REJECTED;
            default:
                return false;
        }
    }
}
