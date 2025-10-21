package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.mapper.WarrantyClaimMapper;
import com.swp391.warrantymanagement.repository.UserRepository;
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
    @Autowired
    private UserRepository userRepository;

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
                return target == WarrantyClaimStatus.MANAGER_REVIEW || target == WarrantyClaimStatus.REJECTED;
            case MANAGER_REVIEW:
                return target == WarrantyClaimStatus.PROCESSING || target == WarrantyClaimStatus.REJECTED;
            case PROCESSING:
                return target == WarrantyClaimStatus.COMPLETED || target == WarrantyClaimStatus.REJECTED;
            default:
                return false;
        }
    }

    // ========== WORKFLOW METHODS IMPLEMENTATION ==========

    @Override
    public WarrantyClaimResponseDTO createClaimBySCStaff(WarrantyClaimRequestDTO requestDTO) {
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

        // Convert DTO to Entity với status SUBMITTED
        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, part, vehicle);
        claim.setStatus(WarrantyClaimStatus.SUBMITTED); // SC Staff tạo với status SUBMITTED

        // Save entity
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    public WarrantyClaimResponseDTO evmAcceptClaim(Long claimId, String note) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId).orElse(null);
        if (claim == null) {
            throw new RuntimeException("Warranty claim not found with id: " + claimId);
        }

        // Kiểm tra status hiện tại phải là SUBMITTED
        if (claim.getStatus() != WarrantyClaimStatus.SUBMITTED) {
            throw new RuntimeException("Claim must be in SUBMITTED status to accept. Current status: " + claim.getStatus());
        }

        // Chuyển status sang MANAGER_REVIEW để Tech có thể xử lý
        claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
        if (note != null && !note.trim().isEmpty()) {
            claim.setDescription(claim.getDescription() + "\n[EVM Note]: " + note);
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    public WarrantyClaimResponseDTO evmRejectClaim(Long claimId, String reason) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId).orElse(null);
        if (claim == null) {
            throw new RuntimeException("Warranty claim not found with id: " + claimId);
        }

        // Kiểm tra status hiện tại phải là SUBMITTED
        if (claim.getStatus() != WarrantyClaimStatus.SUBMITTED) {
            throw new RuntimeException("Claim must be in SUBMITTED status to reject. Current status: " + claim.getStatus());
        }

        // Chuyển status sang REJECTED
        claim.setStatus(WarrantyClaimStatus.REJECTED);
        claim.setDescription(claim.getDescription() + "\n[EVM Rejection]: " + reason);
        claim.setResolutionDate(new Date());

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    public WarrantyClaimResponseDTO techStartProcessing(Long claimId, String note) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId).orElse(null);
        if (claim == null) {
            throw new RuntimeException("Warranty claim not found with id: " + claimId);
        }

        // Kiểm tra status hiện tại phải là MANAGER_REVIEW
        if (claim.getStatus() != WarrantyClaimStatus.MANAGER_REVIEW) {
            throw new RuntimeException("Claim must be in MANAGER_REVIEW status to start processing. Current status: " + claim.getStatus());
        }

        // Chuyển status sang PROCESSING
        claim.setStatus(WarrantyClaimStatus.PROCESSING);
        if (note != null && !note.trim().isEmpty()) {
            claim.setDescription(claim.getDescription() + "\n[Tech Start]: " + note);
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    public WarrantyClaimResponseDTO techCompleteClaim(Long claimId, String completionNote) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId).orElse(null);
        if (claim == null) {
            throw new RuntimeException("Warranty claim not found with id: " + claimId);
        }

        // Kiểm tra status hiện tại phải là PROCESSING
        if (claim.getStatus() != WarrantyClaimStatus.PROCESSING) {
            throw new RuntimeException("Claim must be in PROCESSING status to complete. Current status: " + claim.getStatus());
        }

        // Chuyển status sang COMPLETED
        claim.setStatus(WarrantyClaimStatus.COMPLETED);
        claim.setDescription(claim.getDescription() + "\n[Tech Completion]: " + completionNote);
        claim.setResolutionDate(new Date());

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getClaimsByStatus(String status, Pageable pageable) {
        try {
            WarrantyClaimStatus claimStatus = WarrantyClaimStatus.valueOf(status.toUpperCase());
            Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByStatus(claimStatus, pageable);
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
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getTechPendingClaims(Pageable pageable) {
        // Lấy claims có status MANAGER_REVIEW hoặc PROCESSING (cần Tech xử lý)
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByStatusIn(
            List.of(WarrantyClaimStatus.MANAGER_REVIEW, WarrantyClaimStatus.PROCESSING),
            pageable
        );
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

    @Override
    public WarrantyClaimResponseDTO assignClaimToMe(Long claimId, Long userId) {
        // Find the claim
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Warranty claim not found with id: " + claimId));

        // Find the user (EVM Staff)
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Assign the claim to the user
        claim.setAssignedTo(user);

        // Save the updated claim
        WarrantyClaim updatedClaim = warrantyClaimRepository.save(claim);

        // Return response DTO
        return WarrantyClaimMapper.toResponseDTO(updatedClaim);
    }

    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getMyAssignedClaims(Long userId, Pageable pageable) {
        Page<WarrantyClaim> claimPage = warrantyClaimRepository.findByAssignedToUserId(userId, pageable);
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
}
