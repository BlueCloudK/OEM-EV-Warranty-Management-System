package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.InstalledPart;
import com.swp391.warrantymanagement.entity.Part;
import com.swp391.warrantymanagement.entity.ServiceHistory;
import com.swp391.warrantymanagement.entity.ServiceHistoryDetail;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.entity.WarrantyClaim;
import com.swp391.warrantymanagement.entity.WorkLog;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class WarrantyClaimServiceImpl implements WarrantyClaimService {
    private static final Logger logger = LoggerFactory.getLogger(WarrantyClaimServiceImpl.class);

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
    @Autowired
    private com.swp391.warrantymanagement.repository.WorkLogRepository workLogRepository;

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

        // 2. Tìm InstalledPart theo installedPartId
        InstalledPart installedPart = installedPartRepository.findById(requestDTO.getInstalledPartId())
            .orElseThrow(() -> new RuntimeException("Installed part " + requestDTO.getInstalledPartId() + " not found"));

        // 3. Kiểm tra xem installed part có thuộc về vehicle này không
        if (!installedPart.getVehicle().getVehicleId().equals(requestDTO.getVehicleId())) {
            throw new RuntimeException("Installed part " + requestDTO.getInstalledPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
        }

        // 4. Kiểm tra xem installed part có còn trong thời hạn bảo hành không
        if (installedPart.getWarrantyExpirationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Warranty for this installed part has expired on " + installedPart.getWarrantyExpirationDate());
        }

        // 5. Convert DTO to Entity
        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, installedPart, vehicle);

        // 6. Save WarrantyClaim
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

        // Update installed part nếu thay đổi
        if (!claim.getInstalledPart().getInstalledPartId().equals(requestDTO.getInstalledPartId())) {
            // Tìm InstalledPart theo installedPartId
            InstalledPart installedPart = installedPartRepository.findById(requestDTO.getInstalledPartId())
                .orElseThrow(() -> new RuntimeException("Installed part " + requestDTO.getInstalledPartId() + " not found"));

            // Kiểm tra xem installed part có thuộc về vehicle này không
            if (!installedPart.getVehicle().getVehicleId().equals(requestDTO.getVehicleId())) {
                throw new RuntimeException("Installed part " + requestDTO.getInstalledPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
            }

            // Kiểm tra bảo hành
            if (installedPart.getWarrantyExpirationDate().isBefore(LocalDate.now())) {
                throw new RuntimeException("Warranty for this installed part has expired on " + installedPart.getWarrantyExpirationDate());
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

        // 2. Tìm InstalledPart theo installedPartId
        InstalledPart installedPart = installedPartRepository.findById(requestDTO.getInstalledPartId())
            .orElseThrow(() -> new RuntimeException("Installed part " + requestDTO.getInstalledPartId() + " not found"));

        // 3. Kiểm tra xem installed part có thuộc về vehicle này không
        if (!installedPart.getVehicle().getVehicleId().equals(requestDTO.getVehicleId())) {
            throw new RuntimeException("Installed part " + requestDTO.getInstalledPartId() + " is not installed on vehicle " + requestDTO.getVehicleId());
        }

        // 4. Kiểm tra xem installed part có còn trong thời hạn bảo hành không
        if (installedPart.getWarrantyExpirationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Warranty for this installed part has expired on " + installedPart.getWarrantyExpirationDate());
        }

        // 5. Convert DTO to Entity với status SUBMITTED
        WarrantyClaim claim = WarrantyClaimMapper.toEntity(requestDTO, installedPart, vehicle);
        claim.setStatus(WarrantyClaimStatus.SUBMITTED); // SC Staff tạo với status SUBMITTED

        // 6. Save WarrantyClaim
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

        // ⭐ TẠO WORK LOG - GHI START TIME
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                User currentUser = userRepository.findByUsername(username).orElse(null);

                if (currentUser != null) {
                    WorkLog workLog = new WorkLog();
                    workLog.setStartTime(LocalDateTime.now());
                    workLog.setEndTime(null); // Chưa kết thúc
                    workLog.setDescription(note != null && !note.trim().isEmpty() ? note : "Technician started processing claim");
                    workLog.setWarrantyClaim(savedClaim);
                    workLog.setUser(currentUser);

                    workLogRepository.save(workLog);
                    logger.info("✅ Work log created for claim {} by user {} (ID: {})", claimId, username, currentUser.getUserId());
                } else {
                    logger.warn("⚠️ User not found for username: {}", username);
                }
            }
        } catch (Exception e) {
            logger.error("❌ Failed to create work log for claim {}: {}", claimId, e.getMessage());
            // Don't fail the whole transaction if work log creation fails
        }

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

        // ⭐ CẬP NHẬT WORK LOG - GHI END TIME
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                User currentUser = userRepository.findByUsername(username).orElse(null);

                if (currentUser != null) {
                    // Tìm work log chưa hoàn thành của user này cho claim này
                    List<WorkLog> workLogs = savedClaim.getWorkLogs();

                    if (workLogs != null && !workLogs.isEmpty()) {
                        // Lấy work log gần nhất chưa có endTime và của user hiện tại
                        WorkLog activeWorkLog = workLogs.stream()
                            .filter(wl -> wl.getEndTime() == null && wl.getUser().getUserId().equals(currentUser.getUserId()))
                            .findFirst()
                            .orElse(null);

                        if (activeWorkLog != null) {
                            activeWorkLog.setEndTime(LocalDateTime.now());
                            String updatedDescription = activeWorkLog.getDescription() + "\n[Completion]: " + completionNote;
                            activeWorkLog.setDescription(updatedDescription);
                            workLogRepository.save(activeWorkLog);

                            long duration = java.time.Duration.between(activeWorkLog.getStartTime(), activeWorkLog.getEndTime()).toMinutes();
                            logger.info("✅ Work log completed for claim {} by user {} (ID: {}). Duration: {} minutes",
                                claimId, username, currentUser.getUserId(), duration);
                        } else {
                            logger.warn("⚠️ No active work log found for claim {} and user {}", claimId, username);
                        }
                    } else {
                        logger.warn("⚠️ No work logs found for claim {}", claimId);
                    }
                } else {
                    logger.warn("⚠️ User not found for username: {}", username);
                }
            }
        } catch (Exception e) {
            logger.error("❌ Failed to complete work log for claim {}: {}", claimId, e.getMessage());
            // Don't fail the whole transaction if work log update fails
        }

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
        detail.setQuantity(1); // Bảo hành 1 installed part

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

    /**
     * Customer xem tất cả warranty claims của mình
     * Lấy thông tin customer từ Security Context, sau đó query claims theo customerId
     */
    @Override
    public PagedResponse<WarrantyClaimResponseDTO> getMyWarrantyClaims(Pageable pageable) {
        // 1. Lấy username từ Security Context
        String username = com.swp391.warrantymanagement.util.SecurityUtil.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User not authenticated");
        }

        // 2. Tìm User từ username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // 3. Tìm Customer từ User
        Customer customer = user.getCustomer();
        if (customer == null) {
            throw new RuntimeException("Customer profile not found for user: " + username);
        }

        // 4. Query warranty claims theo customerId (qua Vehicle -> Customer)
        Page<WarrantyClaim> claimPage = warrantyClaimRepository
            .findByVehicleCustomerCustomerId(customer.getCustomerId(), pageable);

        // 5. Convert sang DTO
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

    /**
     * Customer xem chi tiết 1 warranty claim của mình
     * Kiểm tra claim có thuộc về customer không trước khi trả về
     */
    @Override
    public WarrantyClaimResponseDTO getMyWarrantyClaimById(Long claimId) {
        // 1. Lấy username từ Security Context
        String username = com.swp391.warrantymanagement.util.SecurityUtil.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("User not authenticated");
        }

        // 2. Tìm User từ username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // 3. Tìm Customer từ User
        Customer customer = user.getCustomer();
        if (customer == null) {
            throw new RuntimeException("Customer profile not found for user: " + username);
        }

        // 4. Query warranty claim theo claimId VÀ customerId (security check)
        WarrantyClaim claim = warrantyClaimRepository
            .findByWarrantyClaimIdAndVehicleCustomerCustomerId(claimId, customer.getCustomerId())
            .orElseThrow(() -> new RuntimeException(
                "Warranty claim not found or you don't have permission to view it. Claim ID: " + claimId
            ));

        // 5. Convert sang DTO và trả về
        return WarrantyClaimMapper.toResponseDTO(claim);
    }
}
