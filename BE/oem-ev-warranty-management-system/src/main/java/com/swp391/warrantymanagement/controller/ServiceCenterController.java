package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.ServiceCenterRequestDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.dto.response.ServiceCenterResponseDTO;
import com.swp391.warrantymanagement.service.ServiceCenterService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ServiceCenterController - REST API endpoints for service center management
 */
@RestController
@RequestMapping("/api/service-centers")
@RequiredArgsConstructor
public class ServiceCenterController {

    private final ServiceCenterService serviceCenterService;

    /**
     * Create a new service center (ADMIN only)
     * POST /api/service-centers
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterResponseDTO> createServiceCenter(
            @Valid @RequestBody ServiceCenterRequestDTO requestDTO) {
        ServiceCenterResponseDTO response = serviceCenterService.createServiceCenter(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get service center by ID
     * GET /api/service-centers/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<ServiceCenterResponseDTO> getServiceCenterById(@PathVariable Long id) {
        ServiceCenterResponseDTO response = serviceCenterService.getServiceCenterById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all service centers (paginated)
     * GET /api/service-centers?page=0&size=10&sortBy=serviceCenterName&sortDir=ASC
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<PagedResponse<ServiceCenterResponseDTO>> getAllServiceCenters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceCenterId") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceCenterResponseDTO> response = serviceCenterService.getAllServiceCenters(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Update service center information (ADMIN only)
     * PUT /api/service-centers/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterResponseDTO> updateServiceCenter(
            @PathVariable Long id,
            @Valid @RequestBody ServiceCenterRequestDTO requestDTO) {
        ServiceCenterResponseDTO response = serviceCenterService.updateServiceCenter(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete service center (ADMIN only)
     * DELETE /api/service-centers/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteServiceCenter(@PathVariable Long id) {
        serviceCenterService.deleteServiceCenter(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Service center deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Search service centers by name or address (paginated)
     * GET /api/service-centers/search?keyword=hanoi&page=0&size=10
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<PagedResponse<ServiceCenterResponseDTO>> searchServiceCenters(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceCenterId") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ServiceCenterResponseDTO> response = serviceCenterService.searchServiceCenters(keyword, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Find service centers near a location (within radius)
     * GET /api/service-centers/nearby?latitude=10.762622&longitude=106.660172&radius=10
     */
    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<List<ServiceCenterResponseDTO>> findServiceCentersNearby(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
            @RequestParam(defaultValue = "10.0") @Positive double radius) {

        List<ServiceCenterResponseDTO> response = serviceCenterService
                .findServiceCentersNearLocation(latitude, longitude, radius);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all service centers ordered by distance from a location
     * GET /api/service-centers/ordered-by-distance?latitude=10.762622&longitude=106.660172
     */
    @GetMapping("/ordered-by-distance")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'SC_STAFF', 'SC_TECHNICIAN', 'CUSTOMER')")
    public ResponseEntity<List<ServiceCenterResponseDTO>> findAllOrderedByDistance(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude) {

        List<ServiceCenterResponseDTO> response = serviceCenterService
                .findAllOrderedByDistanceFrom(latitude, longitude);
        return ResponseEntity.ok(response);
    }

    /**
     * Update service center location (ADMIN only)
     * PATCH /api/service-centers/{id}/location
     */
    @PatchMapping("/{id}/location")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterResponseDTO> updateServiceCenterLocation(
            @PathVariable Long id,
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude) {

        ServiceCenterResponseDTO response = serviceCenterService
                .updateServiceCenterLocation(id, latitude, longitude);
        return ResponseEntity.ok(response);
    }
}
