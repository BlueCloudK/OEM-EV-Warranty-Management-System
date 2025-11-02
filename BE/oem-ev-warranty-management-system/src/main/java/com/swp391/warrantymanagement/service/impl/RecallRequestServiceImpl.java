package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.RecallRequestRequestDTO;
import com.swp391.warrantymanagement.dto.request.RecallCustomerResponseDTO;
import com.swp391.warrantymanagement.dto.response.RecallRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.RecallRequestStatus;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.repository.*;
import com.swp391.warrantymanagement.mapper.RecallRequestMapper;
import com.swp391.warrantymanagement.service.JwtService;
import com.swp391.warrantymanagement.service.RecallRequestService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * RecallRequestServiceImpl - Service implementation for Recall Request operations
 *
 * Flow:
 * 1. EVM_STAFF tạo recall request (status = PENDING_ADMIN_APPROVAL)
 * 2. ADMIN/SC_STAFF duyệt (status = WAITING_CUSTOMER_CONFIRM) hoặc từ chối (status = REJECTED_BY_ADMIN)
 * 3. Gửi notification đến customer
 * 4. CUSTOMER xác nhận:
 *    - Accept: Tự động tạo WarrantyClaim (status = PROCESSING, bỏ qua MANAGER_REVIEW)
 *    - Reject: Status = REJECTED_BY_CUSTOMER (cảnh báo)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RecallRequestServiceImpl implements RecallRequestService {

    private static final Logger logger = LoggerFactory.getLogger(RecallRequestServiceImpl.class);

    private final RecallRequestRepository recallRequestRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final UserRepository userRepository;
    private final InstalledPartRepository installedPartRepository;
    private final JwtService jwtService;

    @Override
    public RecallRequestResponseDTO createRecallRequest(RecallRequestRequestDTO dto, String authorizationHeader) {
        logger.info("Creating recall request for installed part: {}", dto.getInstalledPartId());

        // Extract EVM_STAFF user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User evmUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Validate installed part exists
        InstalledPart installedPart = installedPartRepository.findById(dto.getInstalledPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Installed part not found: " + dto.getInstalledPartId()));

        // Create recall request
        RecallRequest recall = new RecallRequest();
        recall.setInstalledPart(installedPart);
        recall.setReason(dto.getReason());
        recall.setStatus(RecallRequestStatus.PENDING_ADMIN_APPROVAL);
        recall.setCreatedBy(evmUser);
        recall.setCreatedAt(LocalDateTime.now());
        recall.setUpdatedAt(LocalDateTime.now());

        RecallRequest savedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request created successfully with ID: {}", savedRecall.getRecallRequestId());

        return RecallRequestMapper.toResponseDTO(savedRecall);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecallRequestResponseDTO> getRecallRequestsForAdmin() {
        logger.info("Getting all recall requests for admin");
        return recallRequestRepository.findAll().stream()
                .map(RecallRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecallRequestResponseDTO> getRecallRequestsForCustomer(UUID customerId) {
        logger.info("Getting recall requests for customer: {}", customerId);
        return recallRequestRepository.findAll().stream()
                .filter(r -> r.getInstalledPart() != null &&
                        r.getInstalledPart().getVehicle() != null &&
                        r.getInstalledPart().getVehicle().getCustomer() != null &&
                        r.getInstalledPart().getVehicle().getCustomer().getCustomerId().equals(customerId))
                .map(RecallRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RecallRequestResponseDTO approveRecallRequest(Long recallRequestId, String adminNote, String authorizationHeader) {
        logger.info("Approving recall request: {}", recallRequestId);

        // Extract admin/staff user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        RecallRequest recall = recallRequestRepository.findById(recallRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Recall request not found: " + recallRequestId));

        // Validate status - chỉ approve khi PENDING_ADMIN_APPROVAL
        if (recall.getStatus() != RecallRequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new IllegalStateException("Can only approve recall requests with status PENDING_ADMIN_APPROVAL. Current status: " + recall.getStatus());
        }

        // Update status to WAITING_CUSTOMER_CONFIRM
        recall.setStatus(RecallRequestStatus.WAITING_CUSTOMER_CONFIRM);
        recall.setAdminNote(adminNote);
        recall.setApprovedBy(admin);
        recall.setUpdatedAt(LocalDateTime.now());

        RecallRequest updatedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request approved: {} - Now waiting for customer confirmation", recallRequestId);

        // TODO: Send notification to customer
        // notificationService.sendRecallNotification(recall);

        return RecallRequestMapper.toResponseDTO(updatedRecall);
    }

    @Override
    public RecallRequestResponseDTO rejectRecallRequest(Long recallRequestId, String adminNote, String authorizationHeader) {
        logger.info("Rejecting recall request: {}", recallRequestId);

        // Extract admin/staff user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        RecallRequest recall = recallRequestRepository.findById(recallRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Recall request not found: " + recallRequestId));

        // Validate status - chỉ reject khi PENDING_ADMIN_APPROVAL
        if (recall.getStatus() != RecallRequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new IllegalStateException("Can only reject recall requests with status PENDING_ADMIN_APPROVAL. Current status: " + recall.getStatus());
        }

        // Update status
        recall.setStatus(RecallRequestStatus.REJECTED_BY_ADMIN);
        recall.setAdminNote(adminNote);
        recall.setApprovedBy(admin);
        recall.setUpdatedAt(LocalDateTime.now());

        RecallRequest updatedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request rejected by admin: {}", recallRequestId);

        return RecallRequestMapper.toResponseDTO(updatedRecall);
    }

    @Override
    public RecallRequestResponseDTO customerConfirmRecall(Long recallRequestId, RecallCustomerResponseDTO dto, String authorizationHeader) {
        logger.info("Customer confirming recall request: {} - Accepted: {}", recallRequestId, dto.getAccepted());

        // Extract customer user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        RecallRequest recall = recallRequestRepository.findById(recallRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Recall request not found: " + recallRequestId));

        // Validate ownership - customer chỉ được confirm recall của xe mình
        if (!recall.getInstalledPart().getVehicle().getCustomer().getUser().getUserId().equals(customer.getUserId())) {
            throw new AccessDeniedException("You can only confirm recall requests for your own vehicles");
        }

        // Validate status - chỉ confirm khi WAITING_CUSTOMER_CONFIRM
        if (recall.getStatus() != RecallRequestStatus.WAITING_CUSTOMER_CONFIRM) {
            throw new IllegalStateException("Can only confirm recall requests with status WAITING_CUSTOMER_CONFIRM. Current status: " + recall.getStatus());
        }

        recall.setCustomerNote(dto.getCustomerNote());
        recall.setUpdatedAt(LocalDateTime.now());

        if (dto.getAccepted()) {
            // Customer chấp nhận - TỰ ĐỘNG TẠO WARRANTY CLAIM
            logger.info("Customer accepted recall - Creating warranty claim automatically");

            WarrantyClaim claim = new WarrantyClaim();
            claim.setVehicle(recall.getInstalledPart().getVehicle());
            claim.setInstalledPart(recall.getInstalledPart());
            claim.setDescription("RECALL: " + recall.getReason());
            claim.setStatus(WarrantyClaimStatus.PROCESSING); // BỎ QUA MANAGER_REVIEW
            claim.setClaimDate(LocalDateTime.now());
            claim.setServiceCenter(recall.getInstalledPart().getVehicle().getCustomer().getUser().getServiceCenter());
            claim.setRecallRequest(recall); // Link lại recall request

            // TODO: Assign trực tiếp cho technician tại service center
            // User technician = findAvailableTechnician(claim.getServiceCenter());
            // claim.setAssignedTo(technician);

            WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
            logger.info("Warranty claim created automatically from recall: Claim ID = {}", savedClaim.getWarrantyClaimId());

            recall.setStatus(RecallRequestStatus.CLAIM_CREATED);
            recall.setWarrantyClaim(savedClaim);

        } else {
            // Customer từ chối - CẢNH BÁO
            logger.warn("Customer rejected recall request: {} - Reason: {}", recallRequestId, dto.getCustomerNote());
            recall.setStatus(RecallRequestStatus.REJECTED_BY_CUSTOMER);
        }

        RecallRequest updatedRecall = recallRequestRepository.save(recall);
        logger.info("Recall request updated with customer response: {}", recallRequestId);

        return RecallRequestMapper.toResponseDTO(updatedRecall);
    }

    @Override
    public List<RecallRequestResponseDTO> getMyRecallRequests(String authorizationHeader) {
        // Extract customer từ JWT token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User customerUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Lấy customer entity
        if (customerUser.getCustomer() == null) {
            throw new IllegalStateException("User is not a customer");
        }

        UUID customerId = customerUser.getCustomer().getCustomerId();
        logger.info("Getting recall requests for customer ID: {} (user: {})", customerId, username);

        // Lấy tất cả recall requests cho customer này
        List<RecallRequest> recalls = recallRequestRepository.findAll().stream()
                .filter(r -> r.getInstalledPart() != null
                        && r.getInstalledPart().getVehicle() != null
                        && r.getInstalledPart().getVehicle().getCustomer() != null
                        && r.getInstalledPart().getVehicle().getCustomer().getCustomerId().equals(customerId))
                .collect(Collectors.toList());

        logger.info("Found {} recall requests for customer {}", recalls.size(), customerId);

        return recalls.stream()
                .map(RecallRequestMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRecallRequest(Long recallRequestId, String authorizationHeader) {
        logger.info("Deleting recall request: {}", recallRequestId);

        // Extract EVM_STAFF user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User evmUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        RecallRequest recall = recallRequestRepository.findById(recallRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Recall request not found: " + recallRequestId));

        // Validate status - chỉ được xóa khi còn PENDING_ADMIN_APPROVAL
        if (recall.getStatus() != RecallRequestStatus.PENDING_ADMIN_APPROVAL) {
            throw new IllegalStateException("Can only delete recall requests with status PENDING_ADMIN_APPROVAL. Current status: " + recall.getStatus());
        }

        // Validate ownership - EVM staff chỉ được xóa recall mình tạo
        if (!recall.getCreatedBy().getUserId().equals(evmUser.getUserId())) {
            throw new AccessDeniedException("You can only delete recall requests that you created");
        }

        recallRequestRepository.delete(recall);
        logger.info("Recall request deleted successfully: {}", recallRequestId);
    }
}
