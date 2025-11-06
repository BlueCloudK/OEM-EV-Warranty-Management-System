package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.RecallResponseConfirmDTO;
import com.swp391.warrantymanagement.dto.response.RecallResponseResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.RecallResponseStatus;
import com.swp391.warrantymanagement.enums.WarrantyClaimStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.RecallResponseMapper;
import com.swp391.warrantymanagement.repository.*;
import com.swp391.warrantymanagement.service.RecallResponseService;
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
 * Implementation của RecallResponseService.
 * <p>
 * <strong>Thiết kế:</strong>
 * <ul>
 *   <li>Xử lý logic nghiệp vụ cho RecallResponse (phản hồi triệu hồi của từng xe)</li>
 *   <li>Tự động tạo WarrantyClaim khi customer chấp nhận recall</li>
 *   <li>Validate quyền sở hữu: Customer chỉ confirm được response của xe mình</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RecallResponseServiceImpl implements RecallResponseService {

    private static final Logger logger = LoggerFactory.getLogger(RecallResponseServiceImpl.class);

    private final RecallResponseRepository recallResponseRepository;
    private final UserRepository userRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final InstalledPartRepository installedPartRepository;

    @Override
    public RecallResponseResponseDTO customerConfirmResponse(Long recallResponseId, RecallResponseConfirmDTO dto, String customerUsername) {
        logger.info("Customer confirming recall response: {} - Accepted: {}", recallResponseId, dto.getAccepted());

        // BƯỚC 1: Lấy User (khách hàng) từ username đã được xác thực
        User customerUser = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", customerUsername));

        // BƯỚC 2: Tìm RecallResponse
        RecallResponse response = recallResponseRepository.findById(recallResponseId)
                .orElseThrow(() -> new ResourceNotFoundException("RecallResponse", "id", recallResponseId));

        // BƯỚC 3: Validate ownership - AUTHORIZATION CHECK
        if (!response.getVehicle().getCustomer().getUser().getUserId().equals(customerUser.getUserId())) {
            throw new AccessDeniedException("You can only confirm recall responses for your own vehicles");
        }

        // BƯỚC 4: Validate state transition - CHỈ confirm khi status = PENDING
        if (response.getStatus() != RecallResponseStatus.PENDING) {
            throw new IllegalStateException("Can only confirm recall responses with status PENDING. Current status: " + response.getStatus());
        }

        // BƯỚC 5: Set customer note và responded time
        response.setCustomerNote(dto.getCustomerNote());
        response.setRespondedAt(LocalDateTime.now());

        if (dto.getAccepted()) {
            // ===== CASE A: CUSTOMER ACCEPT - AUTO-CREATE WARRANTY CLAIM =====
            logger.info("Customer accepted recall - Creating warranty claim automatically");

            response.setStatus(RecallResponseStatus.ACCEPTED);

            // Tìm InstalledPart của xe này có Part bị lỗi
            Part faultyPart = response.getRecallRequest().getPart();
            List<InstalledPart> installedParts = installedPartRepository.findByPart_PartId(faultyPart.getPartId());

            InstalledPart targetInstalledPart = installedParts.stream()
                    .filter(ip -> ip.getVehicle().getVehicleId().equals(response.getVehicle().getVehicleId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("InstalledPart",
                            "vehicleId and partId",
                            response.getVehicle().getVehicleId() + " and " + faultyPart.getPartId()));

            // Tạo WarrantyClaim tự động
            WarrantyClaim claim = new WarrantyClaim();
            claim.setVehicle(response.getVehicle());
            claim.setInstalledPart(targetInstalledPart);
            claim.setDescription("RECALL: " + response.getRecallRequest().getReason());
            claim.setStatus(WarrantyClaimStatus.PROCESSING); // BYPASS approval (ưu tiên cao)
            claim.setClaimDate(LocalDateTime.now());

            // Set service center (nếu customer có service center preference)
            if (response.getVehicle().getCustomer().getUser().getServiceCenter() != null) {
                claim.setServiceCenter(response.getVehicle().getCustomer().getUser().getServiceCenter());
            }

            claim.setRecallResponse(response); // Link back to recall response

            // TODO: Auto-assign technician
            // User technician = findAvailableTechnician(claim.getServiceCenter());
            // claim.setAssignedTo(technician);

            WarrantyClaim savedClaim = warrantyClaimRepository.save(claim);
            logger.info("Warranty claim created automatically from recall: Claim ID = {}", savedClaim.getWarrantyClaimId());

            // Update RecallResponse
            response.setStatus(RecallResponseStatus.IN_PROGRESS);
            response.setWarrantyClaim(savedClaim);

        } else {
            // ===== CASE B: CUSTOMER DECLINE - SAFETY WARNING =====
            logger.warn("Customer declined recall response: {} - Reason: {}", recallResponseId, dto.getCustomerNote());

            response.setStatus(RecallResponseStatus.DECLINED);

            // TODO: Send warning notification to admin
            // notificationService.sendCustomerDeclinedWarning(response);
            // Legal team may need to document this rejection
        }

        // BƯỚC 6: Save updated RecallResponse
        RecallResponse updatedResponse = recallResponseRepository.save(response);
        logger.info("Recall response updated: {}", recallResponseId);

        return RecallResponseMapper.toResponseDTO(updatedResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecallResponseResponseDTO> getMyRecallResponses(String customerUsername) {
        logger.info("Getting recall responses for customer: {}", customerUsername);

        // BƯỚC 1: Lấy User (khách hàng)
        User customerUser = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", customerUsername));

        // BƯỚC 2: Validate user là customer
        Customer customer = customerUser.getCustomer();
        if (customer == null) {
            throw new IllegalStateException("The current user does not have a customer profile.");
        }

        // BƯỚC 3: Lấy tất cả RecallResponse của customer
        UUID customerId = customer.getCustomerId();
        List<RecallResponse> responses = recallResponseRepository.findByCustomerId(customerId);

        logger.info("Found {} recall responses for customer {}", responses.size(), customerId);

        return responses.stream()
                .map(RecallResponseMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecallResponseResponseDTO> getResponsesByRecallRequest(Long recallRequestId) {
        logger.info("Getting all responses for recall request: {}", recallRequestId);

        List<RecallResponse> responses = recallResponseRepository.findByRecallRequest_RecallRequestId(recallRequestId);

        return responses.stream()
                .map(RecallResponseMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecallResponseResponseDTO> getAllRecallResponses() {
        logger.info("Getting all recall responses");

        return recallResponseRepository.findAll().stream()
                .map(RecallResponseMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RecallResponseResponseDTO getRecallResponseById(Long recallResponseId) {
        logger.info("Getting recall response by ID: {}", recallResponseId);

        RecallResponse response = recallResponseRepository.findById(recallResponseId)
                .orElseThrow(() -> new ResourceNotFoundException("RecallResponse", "id", recallResponseId));

        return RecallResponseMapper.toResponseDTO(response);
    }

    @Override
    public void markRecallResponseCompleted(Long warrantyClaimId) {
        logger.info("Marking recall response as completed for claim: {}", warrantyClaimId);

        WarrantyClaim claim = warrantyClaimRepository.findById(warrantyClaimId)
                .orElseThrow(() -> new ResourceNotFoundException("WarrantyClaim", "id", warrantyClaimId));

        // Chỉ update nếu claim này là từ recall
        if (claim.getRecallResponse() != null) {
            RecallResponse response = claim.getRecallResponse();
            response.setStatus(RecallResponseStatus.COMPLETED);
            response.setCompletedAt(LocalDateTime.now());

            recallResponseRepository.save(response);
            logger.info("RecallResponse {} marked as COMPLETED", response.getRecallResponseId());
        }
    }
}
