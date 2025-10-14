package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.dto.request.VehicleRequestDTO;
import com.swp391.warrantymanagement.dto.response.VehicleResponseDTO;
import com.swp391.warrantymanagement.dto.response.PagedResponse;
import com.swp391.warrantymanagement.service.VehicleService;
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
    @Autowired
    private VehicleService vehicleService;

    // Get all vehicles with pagination (ADMIN/STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        logger.info("Get all vehicles request: page={}, size={}, search={}\n", page, size, search);
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getAllVehiclesPage(
            PageRequest.of(page, size), search);
        logger.info("Get all vehicles success, totalElements={}\n", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }

    // Get vehicle by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable Long id) {
        logger.info("Get vehicle by id: {}\n", id);
        VehicleResponseDTO vehicle = vehicleService.getVehicleById(id);
        if (vehicle != null) {
            logger.info("Vehicle found: {}\n", id);
            return ResponseEntity.ok(vehicle);
        }
        logger.warn("Vehicle not found: {}\n", id);
        return ResponseEntity.notFound().build();
    }

    // Create new vehicle (ADMIN/EVM_STAFF only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody VehicleRequestDTO requestDTO) {
        logger.info("Create vehicle request: {}\n", requestDTO);
        try {
            VehicleResponseDTO createdVehicle = vehicleService.createVehicle(requestDTO);
            logger.info("Vehicle created: {}\n", createdVehicle.getVehicleId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (RuntimeException e) {
            logger.error("Create vehicle failed - Error: {}\n", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Update vehicle (ADMIN/EVM_STAFF/SC_STAFF)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequestDTO requestDTO) {

        logger.info("Update vehicle request: id={}, data={}\n", id, requestDTO);
        VehicleResponseDTO updatedVehicle = vehicleService.updateVehicle(id, requestDTO);
        if (updatedVehicle != null) {
            logger.info("Vehicle updated: {}\n", id);
            return ResponseEntity.ok(updatedVehicle);
        }
        logger.warn("Vehicle not found for update: {}\n", id);
        return ResponseEntity.notFound().build();
    }

    // Delete vehicle (ADMIN/EVM_STAFF only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        logger.info("Delete vehicle request: {}\n", id);
        boolean deleted = vehicleService.deleteVehicle(id);
        if (deleted) {
            logger.info("Vehicle deleted: {}\n", id);
            return ResponseEntity.noContent().build();
        }
        logger.warn("Vehicle not found for delete: {}\n", id);
        return ResponseEntity.notFound().build();
    }

    // Get vehicles by customer ID (ADMIN/STAFF only)
    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getVehiclesByCustomer(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Get vehicles by customer: {}, page={}, size={}\n", customerId, page, size);
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesByCustomerId(
            customerId, PageRequest.of(page, size));
        logger.info("Get vehicles by customer success, totalElements={}\n", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }

    // Customer get their own vehicles (CUSTOMER only)
    @GetMapping("/my-vehicles")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getMyVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authorizationHeader) {
        logger.info("Get my vehicles request: page={}, size={}\n", page, size);
        try {
            PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesByCurrentUser(
                authorizationHeader, PageRequest.of(page, size));
            logger.info("Get my vehicles success, totalElements={}\n", vehiclesPage.getTotalElements());
            return ResponseEntity.ok(vehiclesPage);
        } catch (RuntimeException e) {
            logger.error("Get my vehicles failed: {}\n", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // Search vehicles by VIN (ADMIN/STAFF only - sensitive information)
    @GetMapping("/by-vin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<VehicleResponseDTO> getVehicleByVin(@RequestParam String vin) {
        logger.info("Get vehicle by VIN: {}\n", vin);
        VehicleResponseDTO vehicle = vehicleService.getVehicleByVin(vin);
        if (vehicle != null) {
            logger.info("Vehicle found by VIN: {}\n", vin);
            return ResponseEntity.ok(vehicle);
        }
        logger.warn("Vehicle not found by VIN: {}\n", vin);
        return ResponseEntity.notFound().build();
    }

    // Search vehicles by model/brand (All authenticated users)
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> searchVehicles(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Search vehicles request: model={}, brand={}, page={}, size={}\n", model, brand, page, size);
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.searchVehicles(
            model, brand, PageRequest.of(page, size));
        logger.info("Search vehicles success, totalElements={}\n", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }

    // Get vehicles with warranty expiring soon (ADMIN/STAFF only - business intelligence)
    @GetMapping("/warranty-expiring")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EVM_STAFF') or hasRole('SC_STAFF')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getVehiclesWithExpiringWarranty(
            @RequestParam(defaultValue = "30") int daysFromNow,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        logger.info("Get vehicles with expiring warranty: days={}, page={}, size={}\n", daysFromNow, page, size);
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getVehiclesWithExpiringWarranty(
            daysFromNow, PageRequest.of(page, size));
        logger.info("Get expiring warranty vehicles success, totalElements={}\n", vehiclesPage.getTotalElements());
        return ResponseEntity.ok(vehiclesPage);
    }
}
