package com.swp391.warrantymanagement.controller;

import com.swp391.warrantymanagement.entity.Vehicles;
import com.swp391.warrantymanagement.service.VehiclesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/vehicles")
@CrossOrigin
public class VehiclesController {
    @Autowired
    private VehiclesService vehiclesService;

    @GetMapping("/")
    public ResponseEntity<List<Vehicles>> getVehicles() {
        return ResponseEntity.ok(vehiclesService.getVehicles());
    }

    @GetMapping("/vehicleId")
    public ResponseEntity<Vehicles> getVehicleById(@PathVariable int id) {
        Vehicles vehicle = vehiclesService.getById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/")
    public ResponseEntity<Vehicles> createVehicle(@RequestBody Vehicles vehicle) {
        return ResponseEntity.ok(vehiclesService.createVehicle(vehicle));
    }

    @DeleteMapping("/vehicleId")
    public ResponseEntity<Void> deleteVehicle(@PathVariable int id) {
        vehiclesService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/")
    public ResponseEntity<Vehicles> updateVehicle(@RequestBody Vehicles vehicle) {
        return ResponseEntity.ok(vehiclesService.updateVehicle(vehicle));
    }
}
