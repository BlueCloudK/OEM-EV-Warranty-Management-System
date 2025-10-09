package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.PartRequestDTO;
import com.swp391.warrantymanagement.dto.response.PartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.PartService;
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
 * REST controller for Part APIs.
 * Handles CRUD operations for parts using DTOs only.
 * Business Rules:
 * - ADMIN/EVM_STAFF can manage all parts
 * - SERVICE_CENTER_STAFF can view parts for service operations
 * - CUSTOMER can view basic part information for their vehicles
 */
@RestController
@RequestMapping("api/parts")
@CrossOrigin
public class PartController {
    private static final Logger logger = LoggerFactory.getLogger(PartController.class);
    @Autowired private PartService partService;

    // Get all parts with pagination (ADMIN/STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getAllParts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        logger.info("Get all parts request: page={}, size={}, search={}", page, size, search);
        PagedResponse<PartResponseDTO> partsPage = partService.getAllPartsPage(
            PageRequest.of(page, size), search);
        logger.info("Get all parts success, totalElements={}", partsPage.getTotalElements());
        return ResponseEntity.ok(partsPage);
    }

    // Get part by ID (All authenticated users can view basic part info)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF') or hasRole('SERVICE_CENTER_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PartResponseDTO> getPartById(@PathVariable String id) {
        logger.info("Get part by id: {}", id);
        PartResponseDTO part = partService.getPartById(id);
        if (part != null) {
            logger.info("Part found: {}", id);
            return ResponseEntity.ok(part);
        }
        logger.warn("Part not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Create new part (Only ADMIN/EVM_STAFF)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartResponseDTO> createPart(@Valid @RequestBody PartRequestDTO requestDTO) {
        logger.info("Create part request: {}", requestDTO);
        try {
            PartResponseDTO responseDTO = partService.createPart(requestDTO);
            logger.info("Part created: {}", responseDTO.getPartId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            logger.error("Create part failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update part (Only ADMIN/EVM_STAFF)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartResponseDTO> updatePart(@PathVariable String id,
                                                     @Valid @RequestBody PartRequestDTO requestDTO) {
        logger.info("Update part request: id={}, data={}", id, requestDTO);
        try {
            PartResponseDTO updatedPart = partService.updatePart(id, requestDTO);
            if (updatedPart != null) {
                logger.info("Part updated: {}", id);
                return ResponseEntity.ok(updatedPart);
            }
            logger.warn("Part not found for update: {}", id);
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            logger.error("Update part failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete part (Only ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePart(@PathVariable String id) {
        logger.info("Delete part request: {}", id);
        boolean deleted = partService.deletePart(id);
        if (deleted) {
            logger.info("Part deleted: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Part not found for delete: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Search parts by vehicle ID (All authenticated users can view parts for specific vehicle)
    @GetMapping("/by-vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF') or hasRole('SERVICE_CENTER_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getPartsByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get parts by vehicleId: {}, page={}, size={}", vehicleId, page, size);
        PagedResponse<PartResponseDTO> partsPage = partService.getPartsByVehicleId(
            vehicleId, PageRequest.of(page, size));
        logger.info("Get parts by vehicleId success, totalElements={}", partsPage.getTotalElements());
        return ResponseEntity.ok(partsPage);
    }

    // Search parts by manufacturer (ADMIN/STAFF/EVM_STAFF/SERVICE_CENTER only)
    @GetMapping("/by-manufacturer")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF') or hasRole('SERVICE_CENTER_STAFF')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getPartsByManufacturer(
            @RequestParam String manufacturer,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PartResponseDTO> partsPage = partService.getPartsByManufacturer(
            manufacturer, PageRequest.of(page, size));
        return ResponseEntity.ok(partsPage);
    }

    // Get parts with warranty expiring soon (ADMIN/STAFF/EVM_STAFF only - business intelligence)
    @GetMapping("/warranty-expiring")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getPartsWithExpiringWarranty(
            @RequestParam(defaultValue = "30") int daysFromNow,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PartResponseDTO> partsPage = partService.getPartsWithExpiringWarranty(
            daysFromNow, PageRequest.of(page, size));
        return ResponseEntity.ok(partsPage);
    }
}
