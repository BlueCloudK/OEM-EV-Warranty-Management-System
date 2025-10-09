package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.WarrantyClaimRequestDTO;
import com.swp391.warrantymanagement.dto.request.WarrantyClaimStatusUpdateRequestDTO;
import com.swp391.warrantymanagement.dto.response.WarrantyClaimResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.WarrantyClaimService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST controller for Warranty Claim APIs.
 * Handles CRUD and status update operations for warranty claims using DTOs only.
 */
@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
public class WarrantyClaimController {
    private static final Logger logger = LoggerFactory.getLogger(WarrantyClaimController.class);
    @Autowired private WarrantyClaimService warrantyClaimService;

    // Get all warranty claims with pagination
    @GetMapping
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getAllClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get all warranty claims request: page={}, size={}", page, size);
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getAllClaimsPage(PageRequest.of(page, size));
        logger.info("Get all warranty claims success, totalElements={}", claimsPage.getTotalElements());
        return ResponseEntity.ok(claimsPage);
    }

    // Get warranty claim by ID
    @GetMapping("/{id}")
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

    // Create new warranty claim
    @PostMapping
    public ResponseEntity<WarrantyClaimResponseDTO> createClaim(@Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        logger.info("Create warranty claim request: {}", requestDTO);
        WarrantyClaimResponseDTO responseDTO = warrantyClaimService.createClaim(requestDTO);
        logger.info("Warranty claim created: {}", responseDTO.getWarrantyClaimId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Update warranty claim
    @PutMapping("/{id}")
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

    // Update claim status
    @PatchMapping("/{id}/status")
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

    // Delete warranty claim
    @DeleteMapping("/{id}")
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
}




