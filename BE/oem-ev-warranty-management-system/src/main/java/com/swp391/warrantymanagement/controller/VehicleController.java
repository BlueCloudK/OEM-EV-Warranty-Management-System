package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/vehicles")
@CrossOrigin
public class VehicleController {
    @Autowired
    private VehicleService vehicleService;

    @GetMapping("/")
    public ResponseEntity<List<Vehicle>> getVehicles() {
        return ResponseEntity.ok(vehicleService.getVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.getById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<Vehicle> updateVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.updateVehicle(vehicle));
    }
}
