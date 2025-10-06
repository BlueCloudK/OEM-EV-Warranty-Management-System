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
    @Autowired private VehicleService vehicleService;

    // Get all vehicles with pagination (ADMIN/STAFF only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getAllVehiclesPage(
            PageRequest.of(page, size), search);
        return ResponseEntity.ok(vehiclesPage);
    }

    // Get vehicle by ID (ADMIN/STAFF can view any, CUSTOMER can view own)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable Long id) {
        VehicleResponseDTO vehicle = vehicleService.getVehicleById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        }
        return ResponseEntity.notFound().build();
    }

    // Create new vehicle (Only ADMIN/STAFF can create for customers)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody VehicleRequestDTO requestDTO) {
        try {
            VehicleResponseDTO responseDTO = vehicleService.createVehicle(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update vehicle (ADMIN/STAFF can update any, Customer can update own)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('CUSTOMER')")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(@PathVariable Long id,
                                                          @Valid @RequestBody VehicleRequestDTO requestDTO) {
        try {
            VehicleResponseDTO updatedVehicle = vehicleService.updateVehicle(id, requestDTO);
            if (updatedVehicle != null) {
                return ResponseEntity.ok(updatedVehicle);
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete vehicle (Only ADMIN/STAFF)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        boolean deleted = vehicleService.deleteVehicle(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
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
