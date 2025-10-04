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

/**
 * REST controller for Warranty Claim APIs.
 * Handles CRUD and status update operations for warranty claims using DTOs only.
 */
@RestController
@RequestMapping("api/warranty-claims")
@CrossOrigin
public class WarrantyClaimController {
    @Autowired private WarrantyClaimService warrantyClaimService;

    // Get all warranty claims with pagination
    @GetMapping
    public ResponseEntity<PagedResponse<WarrantyClaimResponseDTO>> getAllClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<WarrantyClaimResponseDTO> claimsPage = warrantyClaimService.getAllClaimsPage(PageRequest.of(page, size));
        return ResponseEntity.ok(claimsPage);
    }

    // Get warranty claim by ID
    @GetMapping("/{id}")
    public ResponseEntity<WarrantyClaimResponseDTO> getClaimById(@PathVariable Long id) {
        WarrantyClaimResponseDTO claim = warrantyClaimService.getClaimById(id);
        if (claim != null) {
            return ResponseEntity.ok(claim);
        }
        return ResponseEntity.notFound().build();
    }

    // Create new warranty claim
    @PostMapping
    public ResponseEntity<WarrantyClaimResponseDTO> createClaim(@Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        WarrantyClaimResponseDTO responseDTO = warrantyClaimService.createClaim(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Update warranty claim
    @PutMapping("/{id}")
    public ResponseEntity<WarrantyClaimResponseDTO> updateClaim(@PathVariable Long id,
                                                              @Valid @RequestBody WarrantyClaimRequestDTO requestDTO) {
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.updateClaim(id, requestDTO);
        if (updatedClaim != null) {
            return ResponseEntity.ok(updatedClaim);
        }
        return ResponseEntity.notFound().build();
    }

    // Update claim status
    @PatchMapping("/{id}/status")
    public ResponseEntity<WarrantyClaimResponseDTO> updateClaimStatus(@PathVariable Long id,
        @Valid @RequestBody WarrantyClaimStatusUpdateRequestDTO requestDTO) {
        WarrantyClaimResponseDTO updatedClaim = warrantyClaimService.updateClaimStatus(id, requestDTO);
        if (updatedClaim != null) {
            return ResponseEntity.ok(updatedClaim);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete warranty claim
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        boolean deleted = warrantyClaimService.deleteClaim(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
