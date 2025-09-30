package com.swp391.warrantymanagement.service.impl;

import com.swp391.warrantymanagement.entity.Vehicle;
import com.swp391.warrantymanagement.repository.VehicleRepository;
import com.swp391.warrantymanagement.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleServiceImpl implements VehicleService {
    @Autowired
    private VehicleRepository vehiclesRepository;

    @Override
    public Vehicle getById(Long id) {
        return vehiclesRepository.findById(id).orElse(null);
    }

    @Override
    public Vehicle createVehicle(Vehicle vehicle) {
        return vehiclesRepository.save(vehicle);
    }

    @Override
    public Vehicle updateVehicle(Vehicle vehicle) {
        Vehicle existingVehicle = vehiclesRepository.findById(vehicle.getVehicleId()).orElse(null);
        if (existingVehicle != null) {
            return vehiclesRepository.save(vehicle);
        }
        return null;
    }

    @Override
    public void deleteVehicle(Long id) {
        vehiclesRepository.deleteById(id);
    }

    @Override
    public List<Vehicle> getVehicles() {
        return vehiclesRepository.findAll();
    }
}
