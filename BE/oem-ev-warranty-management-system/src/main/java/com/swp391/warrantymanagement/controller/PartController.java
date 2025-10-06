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
    @Autowired private PartService partService;

    // Get all parts with pagination (ADMIN/STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getAllParts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<PartResponseDTO> partsPage = partService.getAllPartsPage(
            PageRequest.of(page, size), search);
        return ResponseEntity.ok(partsPage);
    }

    // Get part by ID (All authenticated users can view basic part info)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF') or hasRole('SERVICE_CENTER_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PartResponseDTO> getPartById(@PathVariable String id) {
        PartResponseDTO part = partService.getPartById(id);
        if (part != null) {
            return ResponseEntity.ok(part);
        }
        return ResponseEntity.notFound().build();
    }

    // Create new part (Only ADMIN/EVM_STAFF)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartResponseDTO> createPart(@Valid @RequestBody PartRequestDTO requestDTO) {
        try {
            PartResponseDTO responseDTO = partService.createPart(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update part (Only ADMIN/EVM_STAFF)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<PartResponseDTO> updatePart(@PathVariable String id,
                                                     @Valid @RequestBody PartRequestDTO requestDTO) {
        try {
            PartResponseDTO updatedPart = partService.updatePart(id, requestDTO);
            if (updatedPart != null) {
                return ResponseEntity.ok(updatedPart);
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete part (Only ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePart(@PathVariable String id) {
        boolean deleted = partService.deletePart(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Search parts by vehicle ID (All authenticated users can view parts for specific vehicle)
    @GetMapping("/by-vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('EVM_STAFF') or hasRole('SERVICE_CENTER_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<PartResponseDTO>> getPartsByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<PartResponseDTO> partsPage = partService.getPartsByVehicleId(
            vehicleId, PageRequest.of(page, size));
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
