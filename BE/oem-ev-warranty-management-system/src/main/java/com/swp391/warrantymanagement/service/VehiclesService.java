package com.swp391.warrantymanagement.service;

import com.swp391.warrantymanagement.entity.Vehicles;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface VehiclesService {
    public Vehicles getById(int id);
    public Vehicles createVehicle(Vehicles vehicle);
    public Vehicles updateVehicle(Vehicles vehicle);
    public void deleteVehicle(int id);
    public List<Vehicles> getVehicles();
}
