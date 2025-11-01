package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Customer;
import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.User;
import com.swp391.warrantymanagement.entity.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("VehicleRepository Integration Tests")
class VehicleRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private VehicleRepository vehicleRepository;

    private Customer customer1;
    private UUID customer1Id;

    @BeforeEach
    void setUp() {
        Role customerRole = new Role();
        customerRole.setRoleName("CUSTOMER");
        entityManager.persist(customerRole);

        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole(customerRole);
        user.setCreatedAt(LocalDateTime.now());
        entityManager.persist(user);

        customer1 = new Customer();
        customer1.setCustomerId(UUID.randomUUID());
        customer1.setName("Test Customer 1");
        customer1.setPhone("1234567890");
        customer1.setUser(user);
        entityManager.persist(customer1);
        customer1Id = customer1.getCustomerId();

        Vehicle vehicle1 = new Vehicle();
        vehicle1.setVehicleName("Tesla");
        vehicle1.setVehicleModel("Model S");
        vehicle1.setVehicleYear(2023);
        vehicle1.setVehicleVin("VIN123");
        vehicle1.setPurchaseDate(LocalDate.now());
        vehicle1.setWarrantyStartDate(LocalDate.now());
        vehicle1.setWarrantyEndDate(LocalDate.now().plusYears(3));
        vehicle1.setMileage(100);
        vehicle1.setCustomer(customer1);
        entityManager.persist(vehicle1);

        Vehicle vehicle2 = new Vehicle();
        vehicle2.setVehicleName("Ford");
        vehicle2.setVehicleModel("Mustang Mach-E");
        vehicle2.setVehicleYear(2022);
        vehicle2.setVehicleVin("VIN456");
        vehicle2.setPurchaseDate(LocalDate.now());
        vehicle2.setWarrantyStartDate(LocalDate.now());
        vehicle2.setWarrantyEndDate(LocalDate.now().plusYears(2));
        vehicle2.setMileage(200);
        vehicle2.setCustomer(customer1);
        entityManager.persist(vehicle2);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by customer ID should return a page of vehicles for that customer")
    void findByCustomerCustomerId_ShouldReturnPagedVehicles() {
        // Act
        Page<Vehicle> vehiclePage = vehicleRepository.findByCustomerCustomerId(customer1Id, PageRequest.of(0, 5));

        // Assert
        assertThat(vehiclePage).isNotNull();
        assertThat(vehiclePage.getTotalElements()).isEqualTo(2);
        assertThat(vehiclePage.getContent()).extracting(Vehicle::getCustomer).containsOnly(customer1);
    }

    @Test
    @DisplayName("Find by VIN should return the correct vehicle")
    void findByVehicleVin_ShouldReturnCorrectVehicle() {
        // Act
        Vehicle foundVehicle = vehicleRepository.findByVehicleVin("VIN123");

        // Assert
        assertThat(foundVehicle).isNotNull();
        assertThat(foundVehicle.getVehicleName()).isEqualTo("Tesla");
    }

    @Test
    @DisplayName("Exists by VIN should return true for an existing VIN")
    void existsByVehicleVin_ShouldReturnTrue() {
        // Act
        boolean exists = vehicleRepository.existsByVehicleVin("VIN456");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Find all vehicles should return all persisted vehicles")
    void findAll_ShouldReturnAllVehicles() {
        // Act
        Page<Vehicle> vehiclePage = vehicleRepository.findAll(PageRequest.of(0, 10));

        // Assert
        assertThat(vehiclePage).isNotNull();
        assertThat(vehiclePage.getTotalElements()).isEqualTo(2);
        assertThat(vehiclePage.getContent()).hasSize(2);
        assertThat(vehiclePage.getContent()).extracting(Vehicle::getVehicleName)
            .containsExactlyInAnyOrder("Tesla", "Ford");
    }
}
