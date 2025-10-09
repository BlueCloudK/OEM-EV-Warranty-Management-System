package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.VehicleService;
import com.swp391.warrantymanagement.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

/**
 * REST controller for Vehicle APIs.
 * Handles CRUD operations for vehicles using DTOs only.
 * Business Rules: Customer can only manage their own vehicles, ADMIN/STAFF can manage all
 */
@RestController
@RequestMapping("api/vehicles")
@CrossOrigin
public class VehicleController {
    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);
    @Autowired private VehicleService vehicleService;

    // Get all vehicles with pagination (ADMIN/STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        logger.info("Get all vehicles request: page={}, size={}, search={}", page, size, search);
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getAllVehiclesPage(
            PageRequest.of(page, size), search);
        logger.info("Get all vehicles success, totalElements={}", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }

    // Get vehicle by ID (ADMIN/STAFF can view any, CUSTOMER can view own)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable Long id) {
        logger.info("Get vehicle by id: {}", id);
        VehicleResponseDTO vehicle = vehicleService.getVehicleById(id);
        if (vehicle != null) {
            logger.info("Vehicle found: {}", id);
            return ResponseEntity.ok(vehicle);
        }
        logger.warn("Vehicle not found: {}", id);
        return ResponseEntity.notFound().build();
    }

    // Create new vehicle (ADMIN/STAFF only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody VehicleRequestDTO requestDTO) {
        String currentUser = SecurityUtil.getCurrentUsername();
        logger.info("Create vehicle request by user: {}, data: {}", currentUser, requestDTO);
        try {
            VehicleResponseDTO createdVehicle = vehicleService.createVehicle(requestDTO);
            logger.info("Vehicle created: {} by user: {}", createdVehicle.getVehicleId(), currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (RuntimeException e) {
            logger.error("Create vehicle failed by user: {} - Error: {}", currentUser, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update vehicle (ADMIN/STAFF only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequestDTO requestDTO) {
        String currentUser = SecurityUtil.getCurrentUsername();
        logger.info("Update vehicle request by user: {}, vehicleId: {}, data: {}", currentUser, id, requestDTO);
        VehicleResponseDTO updatedVehicle = vehicleService.updateVehicle(id, requestDTO);
        if (updatedVehicle != null) {
            logger.info("Vehicle updated: {} by user: {}", id, currentUser);
            return ResponseEntity.ok(updatedVehicle);
        }
        logger.warn("Vehicle not found for update: {} by user: {}", id, currentUser);
        return ResponseEntity.notFound().build();
    }

    // Delete vehicle (Only ADMIN/STAFF)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        String currentUser = SecurityUtil.getCurrentUsername();
        logger.info("Delete vehicle request by user: {}, vehicleId: {}", currentUser, id);
        boolean deleted = vehicleService.deleteVehicle(id);
        if (deleted) {
            logger.info("Vehicle deleted: {} by user: {}", id, currentUser);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Vehicle not found for delete: {} by user: {}", id, currentUser);
        return ResponseEntity.notFound().build();
    }

    // Get vehicles by customer ID (ADMIN/STAFF only)
    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getVehiclesByCustomer(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesByCustomerId(
            customerId, PageRequest.of(page, size));
        return ResponseEntity.ok(vehiclesPage);
    }

    // Customer get their own vehicles (CUSTOMER only)
    @GetMapping("/my-vehicles")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getMyVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesByCurrentUser(
                authorizationHeader, PageRequest.of(page, size));
            return ResponseEntity.ok(vehiclesPage);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // Search vehicles by VIN (ADMIN/STAFF only - sensitive information)
    @GetMapping("/by-vin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VehicleResponseDTO> getVehicleByVin(@RequestParam String vin) {
        VehicleResponseDTO vehicle = vehicleService.getVehicleByVin(vin);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        }
        return ResponseEntity.notFound().build();
    }

    // Search vehicles by model/brand (All authenticated users)
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> searchVehicles(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.searchVehicles(
            model, brand, PageRequest.of(page, size));
        return ResponseEntity.ok(vehiclesPage);
    }

    // Get vehicles with warranty expiring soon (ADMIN/STAFF only - business intelligence)
    @GetMapping("/warranty-expiring")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getVehiclesWithExpiringWarranty(
            @RequestParam(defaultValue = "30") int daysFromNow,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesWithExpiringWarranty(
            daysFromNow, PageRequest.of(page, size));
        return ResponseEntity.ok(vehiclesPage);
    }
}
