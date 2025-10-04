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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for Vehicle APIs.
 * Handles CRUD operations for vehicles using DTOs only.
 */
@RestController
@RequestMapping("api/vehicles")
@CrossOrigin
public class VehicleController {
    @Autowired private VehicleService vehicleService;

    // Get all vehicles with pagination
    @GetMapping
    public ResponseEntity<PagedResponse<VehicleResponseDTO>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<VehicleResponseDTO> vehiclesPage = vehicleService.getAllVehiclesPage(PageRequest.of(page, size));
        return ResponseEntity.ok(vehiclesPage);
    }

    // Get vehicle by ID
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> getVehicleById(@PathVariable Long id) {
        VehicleResponseDTO vehicle = vehicleService.getVehicleById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        }
        return ResponseEntity.notFound().build();
    }

    // Create new vehicle
    @PostMapping
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody VehicleRequestDTO requestDTO) {
        VehicleResponseDTO responseDTO = vehicleService.createVehicle(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Update vehicle
    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(@PathVariable Long id,
                                                          @Valid @RequestBody VehicleRequestDTO requestDTO) {
        VehicleResponseDTO updatedVehicle = vehicleService.updateVehicle(id, requestDTO);
        if (updatedVehicle != null) {
            return ResponseEntity.ok(updatedVehicle);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete vehicle
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        boolean deleted = vehicleService.deleteVehicle(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
