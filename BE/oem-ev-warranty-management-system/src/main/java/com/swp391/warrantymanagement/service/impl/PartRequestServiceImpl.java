package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.dto.request.PartRequestRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.PartRequestResponseDTO;
import com.swp391.warrantymanagement.entity.*;
import com.swp391.warrantymanagement.enums.PartRequestStatus;
import com.swp391.warrantymanagement.exception.ResourceNotFoundException;
import com.swp391.warrantymanagement.mapper.PartRequestMapper;
import com.swp391.warrantymanagement.repository.*;
import com.swp391.warrantymanagement.service.JwtService;
import com.swp391.warrantymanagement.service.PartRequestService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service implementation cho Part Request operations
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PartRequestServiceImpl implements PartRequestService {

    private static final Logger logger = LoggerFactory.getLogger(PartRequestServiceImpl.class);

    private final PartRequestRepository partRequestRepository;
    private final WarrantyClaimRepository warrantyClaimRepository;
    private final PartRepository partRepository;
    private final UserRepository userRepository;
    private final ServiceCenterRepository serviceCenterRepository;
    private final JwtService jwtService;

    @Override
    public PartRequestResponseDTO createPartRequest(PartRequestRequestDTO requestDTO, String authorizationHeader) {
        logger.info("Creating part request for warranty claim: {}", requestDTO.getWarrantyClaimId());

        // Extract user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User technician = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Validate entities
        WarrantyClaim warrantyClaim = warrantyClaimRepository.findById(requestDTO.getWarrantyClaimId())
                .orElseThrow(() -> new ResourceNotFoundException("Warranty claim not found: " + requestDTO.getWarrantyClaimId()));

        Part faultyPart = partRepository.findById(requestDTO.getFaultyPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part not found: " + requestDTO.getFaultyPartId()));

        ServiceCenter serviceCenter = serviceCenterRepository.findById(requestDTO.getServiceCenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Service center not found: " + requestDTO.getServiceCenterId()));

        // Create part request
        PartRequest partRequest = PartRequestMapper.toEntity(requestDTO, warrantyClaim, faultyPart, technician, serviceCenter);
        PartRequest savedRequest = partRequestRepository.save(partRequest);

        logger.info("Part request created successfully with ID: {}", savedRequest.getRequestId());
        return PartRequestMapper.toResponseDTO(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public PartRequestResponseDTO getPartRequestById(Long requestId) {
        logger.info("Getting part request by ID: {}", requestId);
        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));
        return PartRequestMapper.toResponseDTO(partRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getAllPartRequests(Pageable pageable) {
        logger.info("Getting all part requests with pagination");
        Page<PartRequest> page = partRequestRepository.findAll(pageable);
        return new PagedResponse<>(
            PartRequestMapper.toResponseDTOList(page.getContent()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPartRequestsByStatus(PartRequestStatus status, Pageable pageable) {
        logger.info("Getting part requests by status: {}", status);
        Page<PartRequest> page = partRequestRepository.findByStatus(status, pageable);
        return new PagedResponse<>(
            PartRequestMapper.toResponseDTOList(page.getContent()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    public PartRequestResponseDTO approvePartRequest(Long requestId, String notes, String authorizationHeader) {
        logger.info("Approving part request: {}", requestId);

        // Extract EVM_STAFF user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User evmStaff = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Validate status
        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Can only approve PENDING requests");
        }

        // Update status
        partRequest.setStatus(PartRequestStatus.APPROVED);
        partRequest.setApprovedBy(evmStaff);
        partRequest.setApprovedDate(LocalDateTime.now());
        partRequest.setNotes(notes);

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request approved: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    @Override
    public PartRequestResponseDTO rejectPartRequest(Long requestId, String rejectionReason, String authorizationHeader) {
        logger.info("Rejecting part request: {}", requestId);

        // Extract EVM_STAFF user from token
        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User evmStaff = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Validate status
        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Can only reject PENDING requests");
        }

        // Update status
        partRequest.setStatus(PartRequestStatus.REJECTED);
        partRequest.setApprovedBy(evmStaff);
        partRequest.setApprovedDate(LocalDateTime.now());
        partRequest.setRejectionReason(rejectionReason);

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request rejected: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    @Override
    public PartRequestResponseDTO markAsShipped(Long requestId, String trackingNumber, String authorizationHeader) {
        logger.info("Marking part request as shipped: {}", requestId);

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Validate status
        if (partRequest.getStatus() != PartRequestStatus.APPROVED) {
            throw new IllegalStateException("Can only ship APPROVED requests");
        }

        // Update status
        partRequest.setStatus(PartRequestStatus.SHIPPED);
        partRequest.setShippedDate(LocalDateTime.now());
        partRequest.setTrackingNumber(trackingNumber);

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request marked as shipped: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    @Override
    public PartRequestResponseDTO markAsDelivered(Long requestId, String authorizationHeader) {
        logger.info("Marking part request as delivered: {}", requestId);

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Validate status
        if (partRequest.getStatus() != PartRequestStatus.SHIPPED) {
            throw new IllegalStateException("Can only mark SHIPPED requests as delivered");
        }

        // Update status
        partRequest.setStatus(PartRequestStatus.DELIVERED);
        partRequest.setDeliveredDate(LocalDateTime.now());

        PartRequest updated = partRequestRepository.save(partRequest);
        logger.info("Part request marked as delivered: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPendingRequests(Pageable pageable) {
        logger.info("Getting pending part requests");
        Page<PartRequest> page = partRequestRepository.findPendingRequests(pageable);
        return new PagedResponse<>(
            PartRequestMapper.toResponseDTOList(page.getContent()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getInTransitRequests(Pageable pageable) {
        logger.info("Getting in-transit part requests");
        Page<PartRequest> page = partRequestRepository.findInTransitRequests(pageable);
        return new PagedResponse<>(
            PartRequestMapper.toResponseDTOList(page.getContent()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPartRequestsByWarrantyClaim(Long warrantyClaimId, Pageable pageable) {
        logger.info("Getting part requests for warranty claim: {}", warrantyClaimId);
        Page<PartRequest> page = partRequestRepository.findByWarrantyClaimWarrantyClaimId(warrantyClaimId, pageable);
        return new PagedResponse<>(
            PartRequestMapper.toResponseDTOList(page.getContent()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getPartRequestsByServiceCenter(Long serviceCenterId, Pageable pageable) {
        logger.info("Getting part requests for service center: {}", serviceCenterId);
        Page<PartRequest> page = partRequestRepository.findByServiceCenterServiceCenterId(serviceCenterId, pageable);
        return new PagedResponse<>(
            PartRequestMapper.toResponseDTOList(page.getContent()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PartRequestResponseDTO> getMyPartRequests(String authorizationHeader, Pageable pageable) {
        logger.info("Getting part requests for current user");

        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Page<PartRequest> page = partRequestRepository.findByRequestedByUserId(user.getUserId(), pageable);
        return new PagedResponse<>(
            PartRequestMapper.toResponseDTOList(page.getContent()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }

    @Override
    public PartRequestResponseDTO cancelPartRequest(Long requestId, String authorizationHeader) {
        logger.info("Cancelling part request: {}", requestId);

        String token = authorizationHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        PartRequest partRequest = partRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Part request not found: " + requestId));

        // Validate ownership
        if (!partRequest.getRequestedBy().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("You can only cancel your own requests");
        }

        // Validate status
        if (partRequest.getStatus() != PartRequestStatus.PENDING) {
            throw new IllegalStateException("Can only cancel PENDING requests");
        }

        partRequest.setStatus(PartRequestStatus.CANCELLED);
        PartRequest updated = partRequestRepository.save(partRequest);

        logger.info("Part request cancelled: {}", requestId);
        return PartRequestMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countByStatus(PartRequestStatus status) {
        return partRequestRepository.countByStatus(status);
    }
}

