package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Spring Boot đã tự động sinh các phương thức CRUD cơ bản với Long ID

    // Derived query methods - Spring tự động tạo queries
    List<Vehicle> findByCustomerCustomerId(UUID customerId);
    // Phương thức với phân trang
    Page<Vehicle> findByCustomerCustomerId(UUID customerId, Pageable pageable);

    // Search methods
    Page<Vehicle> findByVehicleNameContainingIgnoreCase(String vehicleName, Pageable pageable);

    // Search by vehicle model
    Page<Vehicle> findByVehicleModelContainingIgnoreCase(String vehicleModel, Pageable pageable);

    // Search methods with pagination
    Page<Vehicle> findByVehicleNameContainingIgnoreCaseOrVehicleModelContainingIgnoreCase(
        String vehicleName, String vehicleModel, Pageable pageable);

    // Combined search methods
    Page<Vehicle> findByVehicleModelContainingIgnoreCaseAndVehicleNameContainingIgnoreCase(
        String vehicleModel, String vehicleName, Pageable pageable);

    // VIN-related methods
    Vehicle findByVehicleVin(String vehicleVin);
    // Check if a vehicle with the given VIN exists
    boolean existsByVehicleVin(String vehicleVin);

    // Warranty expiring methods
    Page<Vehicle> findByVehicleYearLessThanEqual(int year, Pageable pageable);
}
