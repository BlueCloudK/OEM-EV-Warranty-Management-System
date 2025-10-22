package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.ServiceHistoryDetail;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.id.ServiceHistoryDetailId;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.WarrantyClaimMapper;
import com.swp391.warrantymanagement.repository.UserRepository;
import com.swp391.warrantymanagement.repository.WarrantyClaimRepository;
import com.swp391.warrantymanagement.repository.InstalledPartRepository;
import com.swp391.warrantymanagement.repository.PartRepository;
import com.swp391.warrantymanagement.repository.ServiceHistoryRepository;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class WarrantyClaimServiceImpl implements WarrantyClaimService {
    @Autowired
    private WarrantyClaimRepository warrantyClaimRepository;
    @Autowired
    private InstalledPartRepository installedPartRepository;
    @Autowired
    private PartRepository partRepository;
    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ServiceHistoryRepository serviceHistoryRepository;

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
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", id));
        return WarrantyClaimMapper.toResponseDTO(claim);
    }

    // Create new claim
    @Override
    @Transactional
    public WarrantyClaimResponseDTO createClaim(WarrantyClaimRequestDTO requestDTO) {
        // 1. Load Vehicle entity từ vehicleId
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        // 2. Tìm InstalledPart đã có (part đã được lắp vào xe trước đó)
        List<InstalledPart> installedParts = installedPartRepository.findByVehicleAndPart(
            requestDTO.getVehicleId(),
            requestDTO.getPartId()
        );

        if (installedParts.isEmpty()) {
            throw new RuntimeException("Part " + requestDTO.getPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
        }

        // Lấy InstalledPart đầu tiên (hoặc có thể lấy cái mới nhất)
        InstalledPart installedPart = installedParts.get(0);

        // 3. Kiểm tra xem part có còn trong thời hạn bảo hành không
        if (installedPart.getWarrantyExpirationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Warranty for this part has expired on " + installedPart.getWarrantyExpirationDate());
        }

        // 4. Convert DTO to Entity
        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, installedPart, vehicle);

        // 5. Save WarrantyClaim
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);

        // Convert entity back to response DTO
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    // Helper method để tạo InstalledPart ID unique
    private String generateInstalledPartId() {
        return "IP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Update existing claim (except status)
    @Override
    @Transactional
    public WarrantyClaimResponseDTO updateClaim(Long id, WarrantyClaimRequestDTO requestDTO) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", id));

        // Update description
        claim.setDescription(requestDTO.getDescription());

        // Update part nếu thay đổi (tìm InstalledPart đã có)
        if (!claim.getInstalledPart().getPart().getPartId().equals(requestDTO.getPartId())) {
            // Tìm InstalledPart đã có
            List<InstalledPart> installedParts = installedPartRepository.findByVehicleAndPart(
                requestDTO.getVehicleId(),
                requestDTO.getPartId()
            );

            if (installedParts.isEmpty()) {
                throw new RuntimeException("Part " + requestDTO.getPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
            }

            InstalledPart installedPart = installedParts.get(0);

            // Kiểm tra bảo hành
            if (installedPart.getWarrantyExpirationDate().isBefore(LocalDate.now())) {
                throw new RuntimeException("Warranty for this part has expired on " + installedPart.getWarrantyExpirationDate());
            }

            claim.setInstalledPart(installedPart);
        }

        // Save updated entity
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    // Update claim status with business logic validation
    @Override
    @Transactional
    public WarrantyClaimResponseDTO updateClaimStatus(Long id, WarrantyClaimStatusUpdateRequestDTO requestDTO) {
        WarrantyClaim claim = warrantyClaimRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", id));

        // Validate status transition
        if (!isValidStatusTransition(claim.getStatus(), requestDTO.getStatus())) {
            throw new IllegalStateException("Invalid status transition from " + claim.getStatus() + " to " + requestDTO.getStatus());
        }
        // Update status
        claim.setStatus(requestDTO.getStatus());
        if (requestDTO.getStatus() == WarrantyClaimStatus.COMPLETED) {
            claim.setResolutionDate(LocalDateTime.now());
        }
        // Save updated entity
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    // Delete claim by ID
    @Override
    @Transactional
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
    @Transactional
    public WarrantyClaimResponseDTO createClaimBySCStaff(WarrantyClaimRequestDTO requestDTO) {
        // 1. Load Vehicle entity từ vehicleId
        Vehicle vehicle = vehicleRepository.findById(requestDTO.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDTO.getVehicleId()));

        // 2. Tìm InstalledPart đã có (part đã được lắp vào xe trước đó)
        List<InstalledPart> installedParts = installedPartRepository.findByVehicleAndPart(
            requestDTO.getVehicleId(),
            requestDTO.getPartId()
        );

        if (installedParts.isEmpty()) {
            throw new RuntimeException("Part " + requestDTO.getPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
        }

        InstalledPart installedPart = installedParts.get(0);

        // 3. Kiểm tra xem part có còn trong thời hạn bảo hành không
        if (installedPart.getWarrantyExpirationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Warranty for this part has expired on " + installedPart.getWarrantyExpirationDate());
        }

        // 4. Convert DTO to Entity với status SUBMITTED
        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, installedPart, vehicle);
        claim.setStatus(WarrantyClaimStatus.SUBMITTED); // SC Staff tạo với status SUBMITTED

        // 5. Save WarrantyClaim
        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    @Transactional
    public WarrantyClaimResponseDTO adminAcceptClaim(Long claimId, String note) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        // Kiểm tra status hiện tại phải là SUBMITTED
        if (claim.getStatus() != WarrantyClaimStatus.SUBMITTED) {
            throw new RuntimeException("Claim must be in SUBMITTED status to accept. Current status: " + claim.getStatus());
        }

        // Chuyển status sang MANAGER_REVIEW để Tech có thể xử lý
        claim.setStatus(WarrantyClaimStatus.MANAGER_REVIEW);
        if (note != null && !note.trim().isEmpty()) {
            claim.setDescription(claim.getDescription() + "\n[Admin Note]: " + note);
        }

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    @Transactional
    public WarrantyClaimResponseDTO adminRejectClaim(Long claimId, String reason) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        // Kiểm tra status hiện tại phải là SUBMITTED
        if (claim.getStatus() != WarrantyClaimStatus.SUBMITTED) {
            throw new RuntimeException("Claim must be in SUBMITTED status to reject. Current status: " + claim.getStatus());
        }

        // Chuyển status sang REJECTED
        claim.setStatus(WarrantyClaimStatus.REJECTED);
        claim.setDescription(claim.getDescription() + "\n[Admin Rejection]: " + reason);
        claim.setResolutionDate(LocalDateTime.now());

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    @Override
    @Transactional
    public WarrantyClaimResponseDTO techStartProcessing(Long claimId, String note) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

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
    @Transactional
    public WarrantyClaimResponseDTO techCompleteClaim(Long claimId, String completionNote) {
        WarrantyClaim claim = warrantyClaimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", claimId));

        // Kiểm tra status hiện tại phải là PROCESSING
        if (claim.getStatus() != WarrantyClaimStatus.PROCESSING) {
            throw new RuntimeException("Claim must be in PROCESSING status to complete. Current status: " + claim.getStatus());
        }

        // Chuyển status sang COMPLETED
        claim.setStatus(WarrantyClaimStatus.COMPLETED);
        claim.setDescription(claim.getDescription() + "\n[Tech Completion]: " + completionNote);
        claim.setResolutionDate(LocalDateTime.now());

        WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);

        // Tự động tạo ServiceHistory khi claim hoàn tất
        createWarrantyServiceHistory(savedClaim);

        return WarrantyClaimMapper.toResponseDTO(savedClaim);
    }

    // Helper method để tạo ServiceHistory khi claim hoàn tất
    private void createWarrantyServiceHistory(WarrantyClaim claim) {
        // Tạo ServiceHistory record
        ServiceHistory serviceHistory = new ServiceHistory();
        serviceHistory.setServiceDate(LocalDate.now());
        serviceHistory.setServiceType("Warranty Claim");
        serviceHistory.setDescription("Warranty service for claim #" + claim.getWarrantyClaimId() + ": " + claim.getDescription());
        serviceHistory.setVehicle(claim.getVehicle());

        // Save ServiceHistory
        ServiceHistory savedServiceHistory = serviceHistoryRepository.save(serviceHistory);

        // Tạo ServiceHistoryDetail để ghi nhận part được bảo hành
        ServiceHistoryDetail detail = new ServiceHistoryDetail();

        // Tạo composite key
        ServiceHistoryDetailId detailId = new ServiceHistoryDetailId();
        detailId.setServiceHistoryId(savedServiceHistory.getServiceHistoryId());
        detailId.setPartId(claim.getInstalledPart().getPart().getPartId());

        detail.setId(detailId);
        detail.setServiceHistory(savedServiceHistory);
        detail.setPart(claim.getInstalledPart().getPart());
        detail.setQuantity(1); // Bảo hành 1 part

        // Add detail to serviceHistory
        savedServiceHistory.getServiceHistoryDetails().add(detail);

        // Save again to persist the detail
        serviceHistoryRepository.save(savedServiceHistory);
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
    @Transactional
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
