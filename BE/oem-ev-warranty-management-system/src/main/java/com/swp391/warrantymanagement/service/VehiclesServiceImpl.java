package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Vehicles;
import com.swp391.warrantymanagement.repository.VehiclesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiclesServiceImpl implements VehiclesService {

    @Autowired // này là dùng reflection để tự động inject cái VehiclesRepository vào đây
    private VehiclesRepository vehiclesRepository;

    @Override
    public Vehicles getById(int id) {
        return vehiclesRepository.findById(id).orElse(null);
    }

    @Override
    public Vehicles createVehicle(Vehicles vehicle) {
        return vehiclesRepository.save(vehicle);
    }

    @Override
    public Vehicles updateVehicle(Vehicles vehicle) {
        Vehicles existingVehicle = vehiclesRepository.findById(vehicle.getVehicleId()).orElse(null);
        if (existingVehicle != null) {
            return vehiclesRepository.save(vehicle);
        }
        return null;
    }

    @Override
    public void deleteVehicle(int id) {
        vehiclesRepository.deleteById(id);
    }

    @Override
    public List<Vehicles> getVehicles() {
        return vehiclesRepository.findAll();
    }
}
