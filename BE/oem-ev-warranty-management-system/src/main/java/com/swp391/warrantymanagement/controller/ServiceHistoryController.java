package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.ServiceHistoryRequestDTO;
import com.swp391.warrantymanagement.dto.response.ServiceHistoryResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.ServiceHistoryService;
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
 * REST controller for Service History APIs.
 * Handles CRUD operations for service histories using DTOs only.
 * Business Rules:
 * - ADMIN/STAFF can manage all service histories
 * - SERVICE_CENTER_STAFF/TECHNICIAN can create/update service records
 * - CUSTOMER can only view their own service histories
 */
@RestController
@RequestMapping("api/service-histories")
@CrossOrigin
public class ServiceHistoryController {
    private static final Logger logger = LoggerFactory.getLogger(ServiceHistoryController.class);
    @Autowired private ServiceHistoryService serviceHistoryService;

    // Get all service histories with pagination (ADMIN/STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getAllServiceHistories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        logger.info("Get all service histories request: page={}, size={}, search={}", page, size, search);
        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getAllServiceHistoriesPage(
            PageRequest.of(page, size), search);
        logger.info("Get all service histories success, totalElements={}", historiesPage.getTotalElements());
        return ResponseEntity.ok(historiesPage);
    }

    // Get service history by ID (ADMIN/STAFF can view any, CUSTOMER can view own)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<ServiceHistoryResponseDTO> getServiceHistoryById(@PathVariable Long id) {
        logger.info("Get service history by id: {}", id);
        ServiceHistoryResponseDTO history = serviceHistoryService.getServiceHistoryById(id);
        if (history != null) {
            logger.info("Service history found: {}", id);
            return ResponseEntity.ok(history);
        }
        logger.warn("Service history not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Create new service history (Only SERVICE_CENTER_STAFF/TECHNICIAN/ADMIN)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('SERVICE_CENTER_STAFF') or hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceHistoryResponseDTO> createServiceHistory(@Valid @RequestBody ServiceHistoryRequestDTO requestDTO) {
        logger.info("Create service history request: {}", requestDTO);
        try {
            ServiceHistoryResponseDTO responseDTO = serviceHistoryService.createServiceHistory(requestDTO);
            logger.info("Service history created: {}", responseDTO.getServiceHistoryId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            logger.error("Create service history failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update service history (Only SERVICE_CENTER_STAFF/TECHNICIAN/ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('SERVICE_CENTER_STAFF') or hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceHistoryResponseDTO> updateServiceHistory(@PathVariable Long id,
                                                                        @Valid @RequestBody ServiceHistoryRequestDTO requestDTO) {
        logger.info("Update service history request: id={}, data={}", id, requestDTO);
        try {
            ServiceHistoryResponseDTO updatedHistory = serviceHistoryService.updateServiceHistory(id, requestDTO);
            if (updatedHistory != null) {
                logger.info("Service history updated: {}", id);
                return ResponseEntity.ok(updatedHistory);
            }
            logger.warn("Service history not found for update: {}", id);
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            logger.error("Update service history failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete service history (Only ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteServiceHistory(@PathVariable Long id) {
        logger.info("Delete service history request: {}", id);
        boolean deleted = serviceHistoryService.deleteServiceHistory(id);
        if (deleted) {
            logger.info("Service history deleted: {}", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Service history not found for delete: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Get service histories by vehicle ID (ADMIN/STAFF can view any, CUSTOMER can view own vehicle's history)
    @GetMapping("/by-vehicle/{vehicleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getServiceHistoriesByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get service histories by vehicleId: {}, page={}, size={}", vehicleId, page, size);
        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByVehicleId(
            vehicleId, PageRequest.of(page, size));
        logger.info("Get service histories by vehicleId success, totalElements={}", historiesPage.getTotalElements());
        return ResponseEntity.ok(historiesPage);
    }

    // Get service histories by part ID (ADMIN/STAFF/SERVICE_CENTER only)
    @GetMapping("/by-part/{partId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('SERVICE_CENTER_STAFF')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getServiceHistoriesByPart(
            @PathVariable String partId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByPartId(
            partId, PageRequest.of(page, size));
        return ResponseEntity.ok(historiesPage);
    }

    // Get service histories by customer (Customer can view their own service records)
    @GetMapping("/my-services")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getMyServiceHistories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByCurrentUser(
                authorizationHeader, PageRequest.of(page, size));
            return ResponseEntity.ok(historiesPage);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // Search service histories by date range (ADMIN/STAFF/SERVICE_CENTER only)
    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('SERVICE_CENTER_STAFF')")
    public ResponseEntity<PagedResponse<ServiceHistoryResponseDTO>> getServiceHistoriesByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PagedResponse<ServiceHistoryResponseDTO> historiesPage = serviceHistoryService.getServiceHistoriesByDateRange(
                startDate, endDate, PageRequest.of(page, size));
            return ResponseEntity.ok(historiesPage);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
