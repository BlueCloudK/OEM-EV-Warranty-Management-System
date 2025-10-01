package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Vehicle;
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

    List<Vehicle> findByVehicleNameContainingIgnoreCase(String vehicleName);

    List<Vehicle> findByVehicleModel(String vehicleModel);

    // Custom query với JOIN FETCH để tối ưu hiệu suất
    @Query("SELECT v FROM Vehicle v JOIN FETCH v.customer c WHERE c.customerId = :customerId")
    List<Vehicle> findByCustomerIdWithCustomer(@Param("customerId") UUID customerId);
}
