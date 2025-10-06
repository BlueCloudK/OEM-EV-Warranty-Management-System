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
    Page<Vehicle> findByCustomerCustomerId(UUID customerId, Pageable pageable);

    List<Vehicle> findByVehicleNameContainingIgnoreCase(String vehicleName);
    Page<Vehicle> findByVehicleNameContainingIgnoreCase(String vehicleName, Pageable pageable);

    List<Vehicle> findByVehicleModel(String vehicleModel);
    Page<Vehicle> findByVehicleModelContainingIgnoreCase(String vehicleModel, Pageable pageable);

    // Search methods with pagination
    Page<Vehicle> findByVehicleNameContainingIgnoreCaseOrVehicleModelContainingIgnoreCase(
        String vehicleName, String vehicleModel, Pageable pageable);

    Page<Vehicle> findByVehicleModelContainingIgnoreCaseAndVehicleNameContainingIgnoreCase(
        String vehicleModel, String vehicleName, Pageable pageable);

    // VIN-related methods
    Vehicle findByVehicleVin(String vehicleVin);
    boolean existsByVehicleVin(String vehicleVin);

    // Warranty expiring methods
    Page<Vehicle> findByVehicleYearLessThanEqual(int year, Pageable pageable);

    // Custom query với JOIN FETCH để tối ưu hiệu suất
    @Query("SELECT v FROM Vehicle v JOIN FETCH v.customer c WHERE c.customerId = :customerId")
    List<Vehicle> findByCustomerIdWithCustomer(@Param("customerId") UUID customerId);
}
