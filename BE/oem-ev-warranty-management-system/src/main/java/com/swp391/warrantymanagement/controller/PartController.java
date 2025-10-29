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
 * PartController - REST API for Part management
 * Business Rules:
 * - Part is standalone component information (NO vehicle association)
 * - EVM_STAFF registers parts (create/update/delete)
 * - Dealer Staff (SC_STAFF) views parts and links to vehicles via InstalledPart
 */
@RestController
@RequestMapping("api/parts")
@CrossOrigin
public class PartController {
    private static final Logger logger = LoggerFactory.getLogger(PartController.class);
    @Autowired private PartService partService;

    // Get all parts with pagination and search (EVM_STAFF registers, SC_STAFF views to select)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
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

    // Get part by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PartResponseDTO> getPartById(@PathVariable Long id) {
        logger.info("Get part by id: {}", id);
        PartResponseDTO part = partService.getPartById(id);
        if (part != null) {
            logger.info("Part found: {}", id);
            return ResponseEntity.ok(part);
        }
        logger.warn("Part not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Create new part (Only EVM_STAFF can register parts)
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

    // Update part (Only EVM_STAFF can update parts)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartResponseDTO> updatePart(@PathVariable Long id,
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

    // Delete part (Only ADMIN can delete parts)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        logger.info("Delete part request: {}", id);
        boolean deleted = partService.deletePart(id);
        if (deleted) {
            logger.info("Part deleted: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Part not found for delete: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Search parts by manufacturer
    @GetMapping("/by-manufacturer")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF') or hasRole('SC_TECHNICIAN')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getPartsByManufacturer(
            @RequestParam String manufacturer,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get parts by manufacturer: {}, page={}, size={}", manufacturer, page, size);
        PagedResponse<PartResponseDTO> partsPage = partService.getPartsByManufacturer(
            manufacturer, PageRequest.of(page, size));
        logger.info("Get parts by manufacturer success, totalElements={}", partsPage.getTotalElements());
        return ResponseEntity.ok(partsPage);
    }
}
