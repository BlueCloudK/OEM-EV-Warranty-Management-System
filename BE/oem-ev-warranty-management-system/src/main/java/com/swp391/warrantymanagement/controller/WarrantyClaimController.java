package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import com.swp391.warrantymanagement.util.WarrantyClaimStatusValidator;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST controller for Warranty Claim APIs.
 * Handles CRUD and status update operations for warranty claims using DTOs only.
 * SECURITY FIXED: Added @PreAuthorize annotations to all endpoints
 */
@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
public class WarrantyClaimController {
    private static final Logger logger = LoggerFactory.getLogger(WarrantyClaimController.class);
    @Autowired
    private WarrantyClaimService warrantyClaimService;

    // Get all warranty claims with pagination (ADMIN/SC_STAFF/EVM_STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getAllClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get all warranty claims request: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getAllClaimsPage(PageRequest.of(page, size));
        logger.info("Get all warranty claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    // Get warranty claim by ID (ADMIN/SC_STAFF/EVM_STAFF/SC_TECHNICIAN only)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<WarrantyClaimResponseDTO> getClaimById(@PathVariable Long id) {
        logger.info("Get warranty claim by id: {}", id);
        WarrantyClaimResponseDTO claim = warrantyClaimService.getClaimById(id);
        if (claim != null) {
            logger.info("Warranty claim found: {}", id);
            return ResponseEntity.ok(claim);
        }
        logger.warn("Warranty claim not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Create warranty claim (Only SC_STAFF can create claims for customers at service center)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> createClaim(@Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        logger.info("Create warranty claim request by SC_STAFF: {}", requestDTO);
        WarrantyClaimResponseDTO responseDTO = warrantyClaimService.createClaim(requestDTO);
        logger.info("Warranty claim created: {}", responseDTO.getWarrantyClaimId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Update warranty claim details (ADMIN/SC_STAFF/EVM_STAFF only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> updateClaim(@PathVariable Long id,
                                                              @Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        logger.info("Update warranty claim request: id={}, data={}", id, requestDTO);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.updateClaim(id, requestDTO);
        if (updatedClaim != null) {
            logger.info("Warranty claim updated: {}", id);
            return ResponseEntity.ok(updatedClaim);
        }
        logger.warn("Warranty claim not found for update: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Update claim status (ADMIN/SC_STAFF/EVM_STAFF only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> updateClaimStatus(@PathVariable Long id,
        @Valid @RequestBody WarrantyClaimStatusUpdateRequestDTO requestDTO) {
        logger.info("Update warranty claim status request: id={}, data={}", id, requestDTO);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.updateClaimStatus(id, requestDTO);
        if (updatedClaim != null) {
            logger.info("Warranty claim status updated: {}", id);
            return ResponseEntity.ok(updatedClaim);
        }
        logger.warn("Warranty claim not found for status update: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Delete warranty claim (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        logger.info("Delete warranty claim request: {}", id);
        boolean deleted = warrantyClaimService.deleteClaim(id);
        if (deleted) {
            logger.info("Warranty claim deleted: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Warranty claim not found for delete: {}", id);
        return ResponseEntity.notFound().build();
    }

    // ========== WORKFLOW ENDPOINTS ==========

    /**
     * SC Staff tạo claim cho khách hàng (status: SUBMITTED)
     * SC_STAFF only
     */
    @PostMapping("/sc-create")
    @PreAuthorize("hasRole('SC_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> createClaimBySCStaff(
            @Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        logger.info("SC Staff create warranty claim request: {}", requestDTO);
        WarrantyClaimResponseDTO responseDTO = warrantyClaimService.createClaimBySCStaff(requestDTO);
        logger.info("Warranty claim created by SC Staff: {}", responseDTO.getWarrantyClaimId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    /**
     * EVM Staff xem xét và chấp nhận claim (SUBMITTED → MANAGER_REVIEW)
     * EVM_STAFF only
     */
    @PatchMapping("/{id}/evm-accept")
    @PreAuthorize("hasRole('EVM_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> evmAcceptClaim(
            @PathVariable Long id,
            @RequestBody(required = false) String note) {
        logger.info("EVM accept warranty claim: id={}, note={}", id, note);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.evmAcceptClaim(id, note);
        logger.info("Warranty claim accepted by EVM: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * EVM Staff từ chối claim (SUBMITTED → REJECTED)
     * EVM_STAFF only
     */
    @PatchMapping("/{id}/evm-reject")
    @PreAuthorize("hasRole('EVM_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> evmRejectClaim(
            @PathVariable Long id,
            @RequestParam String reason) {
        logger.info("EVM reject warranty claim: id={}, reason={}", id, reason);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.evmRejectClaim(id, reason);
        logger.info("Warranty claim rejected by EVM: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Technician bắt đầu xử lý claim (MANAGER_REVIEW → PROCESSING)
     * SC_TECHNICIAN only
     */
    @PatchMapping("/{id}/tech-start")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<WarrantyClaimResponseDTO> techStartProcessing(
            @PathVariable Long id,
            @RequestBody(required = false) String note) {
        logger.info("Technician start processing claim: id={}, note={}", id, note);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.techStartProcessing(id, note);
        logger.info("Claim processing started by technician: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Technician hoàn tất xử lý claim (PROCESSING → COMPLETED)
     * SC_TECHNICIAN only
     */
    @PatchMapping("/{id}/tech-complete")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<WarrantyClaimResponseDTO> techCompleteClaim(
            @PathVariable Long id,
            @RequestParam String completionNote) {
        logger.info("Technician complete claim: id={}, note={}", id, completionNote);
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.techCompleteClaim(id, completionNote);
        logger.info("Claim completed by technician: {}", id);
        return ResponseEntity.ok(updatedClaim);
    }

    /**
     * Lấy danh sách claims theo role và status (để phân quyền xem)
     */
    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getClaimsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get claims by status: status={}, page={}, size={}", status, page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getClaimsByStatus(status, PageRequest.of(page, size));
        logger.info("Get claims by status success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    /**
     * Lấy claims cần EVM xử lý (status = SUBMITTED)
     * EVM_STAFF only
     */
    @GetMapping("/evm-pending")
    @PreAuthorize("hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getEVMPendingClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get EVM pending claims: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getClaimsByStatus("SUBMITTED", PageRequest.of(page, size));
        logger.info("Get EVM pending claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    /**
     * Lấy claims cần Technician xử lý (status = MANAGER_REVIEW hoặc PROCESSING)
     * SC_TECHNICIAN only
     */
    @GetMapping("/tech-pending")
    @PreAuthorize("hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getTechPendingClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get technician pending claims: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getTechPendingClaims(PageRequest.of(page, size));
        logger.info("Get technician pending claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    // EVM Staff nhận claim để xử lý (assign to themselves)
    @PostMapping("/{claimId}/assign-to-me")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<WarrantyClaimResponseDTO> assignClaimToMe(
            @PathVariable Long claimId,
            @RequestParam Long userId) {
        logger.info("Assign claim to me: claimId={}, userId={}", claimId, userId);
        try {
            WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.assignClaimToMe(claimId, userId);
            logger.info("Claim assigned successfully: claimId={}, assignedTo={}", claimId, userId);
            return ResponseEntity.ok(updatedClaim);
        } catch (RuntimeException e) {
            logger.error("Assign claim failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Lấy danh sách claims đã được assign cho EVM Staff
    @GetMapping("/my-assigned-claims")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getMyAssignedClaims(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get my assigned claims: userId={}, page={}, size={}", userId, page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage =
            warrantyClaimService.getMyAssignedClaims(userId, PageRequest.of(page, size));
        logger.info("Get my assigned claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }
}
