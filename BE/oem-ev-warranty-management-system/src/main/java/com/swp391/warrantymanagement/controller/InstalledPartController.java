package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.InstalledPartRequestDTO;
import com.swp391.warrantymanagement.dto.response.InstalledPartResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.InstalledPartService;
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
 * InstalledPartController - REST API for InstalledPart management
 * Business Rules:
 * - Dealer Staff (SC_STAFF) installs parts on vehicles
 * - Links existing Parts to Vehicles with installation details
 * - Tracks warranty expiration for installed parts
 */
@RestController
@RequestMapping("api/installed-parts")
@CrossOrigin
public class InstalledPartController {
    private static final Logger logger = LoggerFactory.getLogger(InstalledPartController.class);
    @Autowired
    private InstalledPartService installedPartService;

    // Get all installed parts with pagination
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getAllInstalledParts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get all installed parts request: page={}, size={}", page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getAllInstalledParts(PageRequest.of(page, size));
        logger.info("Get all installed parts success, totalElements={}",
            installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }

    // Get installed part by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<InstalledPartResponseDTO> getInstalledPartById(@PathVariable Long id) {
        logger.info("Get installed part by id: {}", id);
        InstalledPartResponseDTO installedPart = installedPartService.getInstalledPartById(id);
        if (installedPart != null) {
            logger.info("Installed part found: {}", id);
            return ResponseEntity.ok(installedPart);
        }
        logger.warn("Installed part not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Create new installed part (Dealer Staff installs part on vehicle)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<InstalledPartResponseDTO> createInstalledPart(
            @Valid @RequestBody InstalledPartRequestDTO requestDTO) {
        logger.info("Create installed part request: {}", requestDTO);
        try {
            InstalledPartResponseDTO responseDTO = installedPartService.createInstalledPart(requestDTO);
            logger.info("Installed part created: {}", responseDTO.getInstalledPartId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            logger.error("Create installed part failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update installed part
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF')")
    public ResponseEntity<InstalledPartResponseDTO> updateInstalledPart(
            @PathVariable Long id,
            @Valid @RequestBody InstalledPartRequestDTO requestDTO) {
        logger.info("Update installed part request: id={}, data={}", id, requestDTO);
        try {
            InstalledPartResponseDTO updatedInstalledPart =
                installedPartService.updateInstalledPart(id, requestDTO);
            if (updatedInstalledPart != null) {
                logger.info("Installed part updated: {}", id);
                return ResponseEntity.ok(updatedInstalledPart);
            }
            logger.warn("Installed part not found for update: {}", id);
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            logger.error("Update installed part failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete installed part
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInstalledPart(@PathVariable Long id) {
        logger.info("Delete installed part request: {}", id);
        boolean deleted = installedPartService.deleteInstalledPart(id);
        if (deleted) {
            logger.info("Installed part deleted: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Installed part not found for delete: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Get installed parts by vehicle ID
    @GetMapping("/by-vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF') or hasRole('SC_TECHNICIAN') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getInstalledPartsByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get installed parts by vehicleId: {}, page={}, size={}", vehicleId, page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getInstalledPartsByVehicle(vehicleId, PageRequest.of(page, size));
        logger.info("Get installed parts by vehicleId success, totalElements={}",
            installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }

    // Get installed parts by part ID (all installations of a specific part)
    @GetMapping("/by-part/{partId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getInstalledPartsByPart(
            @PathVariable Long partId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get installed parts by partId: {}, page={}, size={}", partId, page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getInstalledPartsByPart(partId, PageRequest.of(page, size));
        logger.info("Get installed parts by partId success, totalElements={}",
            installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }

    // Get installed parts with warranty expiring soon
    @GetMapping("/warranty-expiring")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SC_STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<InstalledPartResponseDTO>> getInstalledPartsWithExpiringWarranty(
            @RequestParam(defaultValue = "30") int daysFromNow,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get installed parts with expiring warranty: days={}, page={}, size={}",
            daysFromNow, page, size);
        PagedResponse<InstalledPartResponseDTO> installedPartsPage =
            installedPartService.getInstalledPartsWithExpiringWarranty(daysFromNow, PageRequest.of(page, size));
        logger.info("Get installed parts with expiring warranty success, totalElements={}",
            installedPartsPage.getTotalElements());
        return ResponseEntity.ok(installedPartsPage);
    }
}
