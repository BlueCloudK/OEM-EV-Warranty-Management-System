package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/vehicles")
@CrossOrigin
public class VehicleController {
    @Autowired
    private VehicleService vehicleService;

    // Lấy tất cả xe
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.getVehicles();
        return ResponseEntity.ok(vehicles);
    }

    // Lấy xe theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable("id") Long id) {
        Vehicle vehicle = vehicleService.getById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        }
        return ResponseEntity.notFound().build();
    }

    // Tạo xe mới
    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@Valid @RequestBody Vehicle vehicle) {
        vehicle.setVehicleId(null); // Đảm bảo ID null để tạo mới
        Vehicle savedVehicle = vehicleService.createVehicle(vehicle);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVehicle);
    }

    // Cập nhật xe
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable("id") Long id, @Valid @RequestBody Vehicle vehicle) {
        Vehicle existingVehicle = vehicleService.getById(id);
        if (existingVehicle == null) {
            return ResponseEntity.notFound().build();
        }

        vehicle.setVehicleId(id);
        Vehicle updatedVehicle = vehicleService.updateVehicle(vehicle);
        return ResponseEntity.ok(updatedVehicle);
    }

    // Xóa xe
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable("id") Long id) {
        Vehicle existingVehicle = vehicleService.getById(id);
        if (existingVehicle == null) {
            return ResponseEntity.notFound().build();
        }

        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // Lấy xe theo customer ID
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByCustomerId(@PathVariable("customerId") String customerId) {
        List<Vehicle> vehicles = vehicleService.getVehicles()
                .stream()
                .filter(v -> v.getCustomer().getCustomerId().toString().equals(customerId))
                .toList();
        return ResponseEntity.ok(vehicles);
    }
}
