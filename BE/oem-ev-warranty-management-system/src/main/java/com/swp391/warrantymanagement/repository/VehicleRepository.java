package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository để quản lý Vehicle
 * - Tìm xe theo customer, VIN, tên, model
 * - VIN là unique identifier của xe (như CMND)
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Tìm tất cả xe của customer
    List<Vehicle> findByCustomerCustomerId(UUID customerId);
    Page<Vehicle> findByCustomerCustomerId(UUID customerId, Pageable pageable);

    // Tìm kiếm theo tên xe
    Page<Vehicle> findByVehicleNameContainingIgnoreCase(String vehicleName, Pageable pageable);

    // Tìm kiếm theo model xe
    Page<Vehicle> findByVehicleModelContainingIgnoreCase(String vehicleModel, Pageable pageable);

    // Tìm kiếm kết hợp tên và model
    Page<Vehicle> findByVehicleNameContainingIgnoreCaseOrVehicleModelContainingIgnoreCase(
        String vehicleName, String vehicleModel, Pageable pageable);

    Page<Vehicle> findByVehicleModelContainingIgnoreCaseAndVehicleNameContainingIgnoreCase(
        String vehicleModel, String vehicleName, Pageable pageable);

    // Tìm xe theo VIN (Vehicle Identification Number - unique)
    Optional<Vehicle> findByVehicleVin(String vehicleVin);
    boolean existsByVehicleVin(String vehicleVin);

    // Warranty expiring methods
    Page<Vehicle> findByVehicleYearLessThanEqual(int year, Pageable pageable);

    boolean existsByCustomer(Customer customer);

    /**
     * Tìm kiếm chung vehicle theo name, model, hoặc VIN (case-insensitive).
     * Sử dụng COALESCE để xử lý null values an toàn.
     * @param searchTerm Từ khóa tìm kiếm.
     * @param pageable Thông tin phân trang.
     * @return Một trang các Vehicle thỏa mãn điều kiện.
     */
    @Query("SELECT v FROM Vehicle v WHERE " +
            "LOWER(COALESCE(v.vehicleName, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(v.vehicleModel, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(COALESCE(v.vehicleVin, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Vehicle> searchVehiclesGeneral(@Param("searchTerm") String searchTerm, Pageable pageable);
}
