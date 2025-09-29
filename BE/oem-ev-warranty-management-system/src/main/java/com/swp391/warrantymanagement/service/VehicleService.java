package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Vehicle;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface VehicleService {
    Vehicle getById(Long id);
    Vehicle createVehicle(Vehicle vehicle);
    Vehicle updateVehicle(Vehicle vehicle);
    void deleteVehicle(Long id);
    List<Vehicle> getVehicles();
}
